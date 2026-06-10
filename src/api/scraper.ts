import axios from 'axios';
import * as cheerio from 'cheerio';
import type {
  FacilityType,
  FirContactRecord,
  PaginatedContacts,
  RegionInfo,
  SourceValidation,
} from '../types';

/**
 * 純即時模式：所有記錄一律來自當下實際抓取與解析，不保留任何硬編碼種子/快取。
 * 解析失敗或來源不可達 → 該來源回傳空陣列（誠實缺席，而非假資料）。
 *
 * SCRAPER_SOURCES 仍保留全部目標來源供 /api/sources/validate 健康監測；
 * 但只有結構可被程式化解析的來源（台灣、英國、新加坡）會產生聯絡記錄。
 * 其餘來源的障礙：日本 SWIM 需登入、香港為 JS 動態站、澳洲入口無直接連結、
 * 加拿大為 PDF 包、巴西封鎖海外連線、紐西蘭有 Incapsula 防護、
 * Eurocontrol/FAA 需登入或為離線資料包。
 */

interface ScraperSourceDefinition {
  name: string;
  url: string;
  fallbackGen33Url: string;
  regionCode: string;
  firName: string;
  firIcao: string;
}

export const SCRAPER_SOURCES: Record<string, ScraperSourceDefinition> = {
  TAIWAN: {
    name: '台灣民航局飛航服務總台 eAIP',
    url: 'https://ais.caa.gov.tw/eaip/',
    fallbackGen33Url: 'https://ais.caa.gov.tw/eaip/',
    regionCode: 'TW',
    firName: 'Taipei FIR',
    firIcao: 'RCAA',
  },
  JAPAN: {
    // AIS Japan (aisjapan.mlit.go.jp) 已於 2026-03-10 停止服務，eAIP 遷移至 SWIM Portal（需登入，暫無法解析）
    name: '日本 SWIM Portal（eAIP Japan）',
    url: 'https://top.swim.mlit.go.jp/swim/',
    fallbackGen33Url: 'https://top.swim.mlit.go.jp/swim/',
    regionCode: 'JP',
    firName: 'Fukuoka FIR',
    firIcao: 'RJJJ',
  },
  AUSTRALIA: {
    name: '澳洲 Airservices AIP',
    url: 'https://www.airservicesaustralia.com/aip/aip.asp',
    fallbackGen33Url: 'https://www.airservicesaustralia.com/aip/aip.asp',
    regionCode: 'AU',
    firName: 'Melbourne FIR',
    firIcao: 'YMMM',
  },
  UK: {
    name: '英國 NATS eAIP',
    url: 'https://nats-uk.ead-it.com/cms-nats/opencms/en/Publications/AIP/',
    fallbackGen33Url: 'https://www.aurora.nats.co.uk/',
    regionCode: 'UK',
    firName: 'London FIR',
    firIcao: 'EGTT',
  },
  SINGAPORE: {
    name: '新加坡 CAAS AIM-SG eAIP',
    url: 'https://aim-sg.caas.gov.sg/',
    fallbackGen33Url: 'https://aim-sg.caas.gov.sg/aip/',
    regionCode: 'SG',
    firName: 'Singapore FIR',
    firIcao: 'WSJC',
  },
  HONG_KONG: {
    name: '香港 CAD AIS',
    url: 'https://www.ais.gov.hk/',
    fallbackGen33Url: 'https://www.ais.gov.hk/',
    regionCode: 'HK',
    firName: 'Hong Kong FIR',
    firIcao: 'VHHK',
  },
  CANADA: {
    name: '加拿大 Nav Canada AIP',
    url: 'https://www.navcanada.ca/en/aeronautical-information/aip-canada.aspx',
    fallbackGen33Url: 'https://www.navcanada.ca/en/aeronautical-information/aip-canada.aspx',
    regionCode: 'CA',
    firName: 'Vancouver FIR',
    firIcao: 'CZVR',
  },
  BRAZIL: {
    name: '巴西 DECEA AISWEB',
    url: 'https://aisweb.decea.mil.br/',
    fallbackGen33Url: 'https://aisweb.decea.mil.br/',
    regionCode: 'BR',
    firName: 'Brasilia FIR',
    firIcao: 'SBBS',
  },
  NEW_ZEALAND: {
    name: '紐西蘭 Airways AIP New Zealand',
    url: 'https://www.aip.net.nz/',
    fallbackGen33Url: 'https://www.aip.net.nz/',
    regionCode: 'NZ',
    firName: 'New Zealand FIR',
    firIcao: 'NZZC',
  },
  EUROCONTROL: {
    name: '歐洲 Eurocontrol EAD Basic',
    url: 'https://www.ead.eurocontrol.int/',
    fallbackGen33Url: 'https://www.ead.eurocontrol.int/',
    regionCode: 'EU',
    firName: 'Europe Aggregated FIRs',
    firIcao: 'LFFF',
  },
  USA_FAA: {
    name: '美國 FAA NASR 訂閱資料',
    url: 'https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/',
    fallbackGen33Url: 'https://www.faa.gov/air_traffic/flight_info/aeronav/aero_data/',
    regionCode: 'US',
    firName: 'Oakland ARTCC',
    firIcao: 'KZOA',
  },
};

interface RealtimeContact {
  id: string;
  firIcao: string;
  firName: string;
  regionCode: string;
  facilityName: string;
  facilityType: FacilityType;
  phoneNumber: string;
  faxNumber?: string;
  aftnAddress: string;
  vhfFreq: string[];
  sourceName: string;
  sourceUrl: string;
}

/** 121.5 MHz 為 ICAO 國際緊急守聽頻率（常數，非來源解析值） */
const GUARD_FREQ = '121.5 MHz';

function buildRecord(contact: RealtimeContact): FirContactRecord {
  return {
    ...contact,
    airacCycle: getCurrentAiracDate(),
    sourceVerified: true,
    sourceStatus: 'live',
    lastValidatedAt: new Date().toISOString(),
  };
}

function toAbsoluteUrl(baseUrl: string, href?: string) {
  if (!href) return '';
  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return href;
  }
}

function sanitizeText(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

function findFirstLink(
  html: string,
  baseUrl: string,
  matcher: (href: string, text: string) => boolean
) {
  const $ = cheerio.load(html);
  let selected = '';

  $('a').each((_, element) => {
    if (selected) return;
    const href = $(element).attr('href') ?? '';
    const text = sanitizeText($(element).text());

    if (matcher(href, text)) {
      selected = toAbsoluteUrl(baseUrl, href);
    }
  });

  return selected;
}

async function fetchPage(url: string) {
  return axios.get(url, {
    timeout: 12000,
    headers: { 'User-Agent': 'Mozilla/5.0 (AIP Ops Bot)' },
    validateStatus: (status) => status < 500,
  });
}

export function getCurrentAiracDate(): string {
  const epoch = new Date('2024-01-25T00:00:00Z');
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - epoch.getTime()) / (1000 * 60 * 60 * 24));
  const cycles = Math.floor(diffDays / 28);
  const currentAirac = new Date(epoch.getTime() + cycles * 28 * 24 * 60 * 60 * 1000);
  return currentAirac.toISOString().split('T')[0];
}

export async function validateSource(name: string, url: string): Promise<SourceValidation> {
  const result: SourceValidation = {
    name,
    url,
    isAccessible: false,
    checkedAt: new Date().toISOString(),
  };

  try {
    const response = await axios.head(url, {
      timeout: 8000,
      headers: { 'User-Agent': 'Mozilla/5.0 (AIP Ops Bot)' },
      validateStatus: (status) => status < 500,
    });

    result.isAccessible = response.status < 400;
    result.statusCode = response.status;
  } catch (error: any) {
    result.error = error.message;
  }

  return result;
}

export async function validateAllSources(): Promise<SourceValidation[]> {
  return Promise.all(Object.values(SCRAPER_SOURCES).map((source) => validateSource(source.name, source.url)));
}

// ──────────────────────────────────────────────
//  台灣：ais.caa.gov.tw eAIP（IDS AIRNAV 結構）
//  入口頁 → 「AIRAC AIP AMDT ...\index.html」→ eAIP/RC-GEN 3.3-en-GB.html
// ──────────────────────────────────────────────

interface ParsedUnitRow {
  phoneNumber?: string;
  faxNumber?: string;
  aftnAddress?: string;
}

function normalizeTwPhone(raw: string) {
  // 來源已是「886-區碼-號碼」格式且連字號位置正確（台灣區碼 1~2 碼不定長，勿自行重組）
  return `+${raw.trim()}`;
}

/** GEN 3.3 表格的英文單位名稱 → 設施類型 */
const TW_TYPE_MAP: Array<[RegExp, FacilityType]> = [
  [/\bACC\b/, 'ACC'],
  [/\bFIC\b/, 'FIC'],
  [/\bAPP\b/, 'APP'],
  [/\bTWR\b/, 'TWR'],
  [/\bFIS\b/, 'AFIS'],
  [/\bRADIO\b|COM\s*CENTER/i, 'COM'],
];

/**
 * 通用解析 GEN 3.3「ATS 單位通訊錄」整張表。
 * 欄位：單位名稱(中英) | 通訊地址 | 電話 | 傳真 | AFS。
 * 注意：表格列名用縮寫（Taipei ACC、Taipei FIC），不能用全名匹配。
 */
function parseTaiwanGen33Table(html: string, source: ScraperSourceDefinition, sourceUrl: string): FirContactRecord[] {
  const $ = cheerio.load(html);
  const records: FirContactRecord[] = [];

  $('tr').each((_, row) => {
    const cells = $(row).children('td').map((__, cell) => sanitizeText($(cell).text())).get();
    if (cells.length < 5) return;

    const [nameCell, , telCell, faxCell, afsCell] = cells;
    if (nameCell.length > 80) return; // 跳過巢狀容器列

    const englishName = nameCell.match(/[A-Za-z][A-Za-z0-9 .\/()-]*$/)?.[0]?.trim();
    if (!englishName) return;

    const facilityType = TW_TYPE_MAP.find(([pattern]) => pattern.test(englishName))?.[1];
    if (!facilityType) return;

    const phone = telCell.match(/\b886[-\s]?[\d-]{8,13}\b/)?.[0];
    const fax = faxCell.match(/\b886[-\s]?[\d-]{8,13}\b/)?.[0];
    const aftns: string[] = afsCell.match(/\bRC[A-Z]{6}\b/g) ?? [];
    if (!phone || aftns.length === 0) return;

    const aftnAddress = aftns.find((address) => address.endsWith('ZQZX')) ?? aftns[0];

    records.push(buildRecord({
      id: `TW-${aftnAddress}`,
      firIcao: 'RCAA',
      firName: 'Taipei FIR',
      regionCode: source.regionCode,
      facilityName: englishName,
      facilityType,
      phoneNumber: normalizeTwPhone(phone),
      faxNumber: fax ? normalizeTwPhone(fax) : undefined,
      aftnAddress,
      vhfFreq: [GUARD_FREQ],
      sourceName: source.name,
      sourceUrl,
    }));
  });

  return records;
}

/** GEN 3.1：臺北國際飛航公告室（NOF）與 FIC 同址，AFS 不同 */
function parseTaiwanNofFromGen31(html: string, source: ScraperSourceDefinition, sourceUrl: string): FirContactRecord | null {
  const text = sanitizeText(cheerio.load(html)('body').text());
  // 錨定 3.1.1.2 章節標題「... (NOF)」——文件開頭的介紹段也含同名字串，
  // 若錨錯會抓到民航局標準組的電話而非 NOF
  const anchor = text.indexOf('Taipei International NOTAM Office (NOF)');
  if (anchor === -1) return null;

  const windowText = text.slice(anchor, anchor + 1000);
  const phone = windowText.match(/TEL:\s*(886[\d-]{8,13})/i)?.[1];
  const fax = windowText.match(/FAX:\s*(886[\d-]{8,13})/i)?.[1];
  const aftn = windowText.match(/(RC[A-Z]{6})\s*\(Taipei International NOTAM/i)?.[1]
    ?? windowText.match(/\bRCTPYNYX\b/)?.[0];
  if (!phone || !aftn) return null;

  return buildRecord({
    id: `TW-${aftn}-NOF`,
    firIcao: 'RCAA',
    firName: 'Taipei FIR',
    regionCode: source.regionCode,
    facilityName: 'Taipei International NOTAM Office',
    facilityType: 'NOF',
    phoneNumber: normalizeTwPhone(phone),
    faxNumber: fax ? normalizeTwPhone(fax) : undefined,
    aftnAddress: aftn,
    vhfFreq: [GUARD_FREQ],
    sourceName: source.name,
    sourceUrl,
  });
}

async function scrapeTaiwanANWS(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.TAIWAN;

  try {
    const landing = await fetchPage(source.url);
    if (landing.status >= 400) return [];

    const indexUrl = findFirstLink(
      landing.data,
      source.url,
      (href, text) => /AMDT/i.test(href + text) && /index\.html/i.test(href)
    );
    if (!indexUrl) return [];

    const baseUrl = decodeURI(indexUrl).replace(/index\.html$/i, '');
    const gen33Url = encodeURI(`${baseUrl}eAIP/RC-GEN 3.3-en-GB.html`);
    const gen31Url = encodeURI(`${baseUrl}eAIP/RC-GEN 3.1-en-GB.html`);

    const records: FirContactRecord[] = [];

    const gen33Page = await fetchPage(gen33Url);
    if (gen33Page.status < 400) {
      records.push(...parseTaiwanGen33Table(gen33Page.data, source, gen33Url));
    }

    try {
      const gen31Page = await fetchPage(gen31Url);
      if (gen31Page.status < 400) {
        const nof = parseTaiwanNofFromGen31(gen31Page.data, source, gen31Url);
        if (nof) records.push(nof);
      }
    } catch {
      // NOF 補抓失敗不影響 GEN 3.3 主資料
    }

    return records;
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
//  英國：NATS eAIP（Eurocontrol 標準結構）
// ──────────────────────────────────────────────

function normalizeUkPhone(raw: string) {
  const digits = raw.replace(/\D/g, '');
  if (!digits.startsWith('0')) return raw.trim();
  return `+44-${digits.slice(1, 5)}-${digits.slice(5)}`;
}

interface UkAccContacts {
  london?: ParsedUnitRow;
  scottish?: ParsedUnitRow;
}

/**
 * GEN 3.3 ATS Unit Address 表格：Name | Postal Address | Tel | Fax | Telex | AFS。
 * 注意：不能用 Swanwick/Prestwick 當關鍵字——London Terminal Control 也在 Swanwick，會誤中。
 */
function parseUkAccContacts(html: string): UkAccContacts {
  const $ = cheerio.load(html);
  const result: UkAccContacts = {};

  $('tr').each((_, row) => {
    const rowText = sanitizeText($(row).text());
    const target = /London\s+(Area\s+Control|AC\b)/i.test(rowText)
      ? 'london'
      : /Scottish\s+(AC\b|Area\s+Control)/i.test(rowText)
        ? 'scottish'
        : null;

    if (!target || result[target]) return;

    const aftnMatch = rowText.match(/\bEG[A-Z]{6}\b/);
    const phones = rowText.match(/\b0\d{3,4}[-\s]?\d{6,7}\b/g) ?? [];
    if (!aftnMatch || phones.length === 0) return;

    result[target] = {
      phoneNumber: normalizeUkPhone(phones[0]),
      faxNumber: phones[1] ? normalizeUkPhone(phones[1]) : undefined,
      aftnAddress: aftnMatch[0],
    };
  });

  return result;
}

async function resolveUkGen33Url() {
  const source = SCRAPER_SOURCES.UK;
  const landing = await fetchPage(source.url);
  const indexUrl =
    findFirstLink(
      landing.data,
      source.url,
      (href, text) =>
        href.includes('htmlAIP') && (href.includes('index-en-GB.html') || /current/i.test(text))
    ) || `${source.fallbackGen33Url}htmlAIP/Publications/${getCurrentAiracDate()}-AIRAC/html/index-en-GB.html`;

  return {
    url: indexUrl.replace('index-en-GB.html', 'eAIP/EG-GEN-3.3-en-GB.html'),
    reachable: landing.status < 400,
  };
}

async function scrapeUKEAip(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.UK;

  try {
    const { url, reachable } = await resolveUkGen33Url();
    if (!reachable) return [];

    const page = await fetchPage(url);
    if (page.status >= 400) return [];

    const parsed = parseUkAccContacts(page.data);
    const records: FirContactRecord[] = [];

    if (parsed.london) {
      records.push(buildRecord({
        id: 'EGTT-ACC',
        firIcao: 'EGTT',
        firName: 'London FIR',
        regionCode: source.regionCode,
        facilityName: 'London Area Control Centre (Swanwick)',
        facilityType: 'ACC',
        phoneNumber: parsed.london.phoneNumber!,
        faxNumber: parsed.london.faxNumber,
        aftnAddress: parsed.london.aftnAddress!,
        vhfFreq: [GUARD_FREQ],
        sourceName: source.name,
        sourceUrl: url,
      }));
    }

    if (parsed.scottish) {
      records.push(buildRecord({
        id: 'EGPX-ACC',
        firIcao: 'EGPX',
        firName: 'Scottish FIR',
        regionCode: source.regionCode,
        facilityName: 'Scottish Area Control Centre (Prestwick)',
        facilityType: 'ACC',
        phoneNumber: parsed.scottish.phoneNumber!,
        faxNumber: parsed.scottish.faxNumber,
        aftnAddress: parsed.scottish.aftnAddress!,
        vhfFreq: [GUARD_FREQ],
        sourceName: source.name,
        sourceUrl: url,
      }));
    }

    return records;
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
//  新加坡：AIM-SG eAIP（Eurocontrol 標準結構）
// ──────────────────────────────────────────────

function normalizeSgPhone(raw: string) {
  const digits = raw.replace(/\D/g, '').replace(/^65/, '');
  return `+65-${digits.slice(0, 4)}-${digits.slice(4)}`;
}

/** GEN 3.3 表格：Unit | Postal | Tel | Fax | Telex | AFS */
function parseSgAccContact(html: string): ParsedUnitRow | null {
  const $ = cheerio.load(html);
  let parsed: ParsedUnitRow | null = null;

  $('tr').each((_, row) => {
    if (parsed) return;
    const rowText = sanitizeText($(row).text());
    if (!/SINGAPORE\s+ACC/i.test(rowText)) return;

    const aftnMatch = rowText.match(/\bWS[A-Z]{6}\b/);
    const phones = rowText.match(/\(65\)\s*\d{8}/g) ?? [];
    if (!aftnMatch || phones.length === 0) return;

    parsed = {
      phoneNumber: normalizeSgPhone(phones[0]),
      faxNumber: phones[1] ? normalizeSgPhone(phones[1]) : undefined,
      aftnAddress: aftnMatch[0],
    };
  });

  return parsed;
}

async function scrapeSingaporeCaas(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.SINGAPORE;

  try {
    // 依規格不寫死最終頁：入口頁找 current eAIP index，再導向 GEN 3.3
    const landing = await fetchPage(source.fallbackGen33Url);
    if (landing.status >= 400) return [];

    const indexUrl = findFirstLink(
      landing.data,
      source.fallbackGen33Url,
      (href) => href.includes('html/index-en-GB.html')
    );
    if (!indexUrl) return [];

    const gen33Url = indexUrl.replace('index-en-GB.html', 'eAIP/SG-GEN-3.3-en-GB.html');
    const page = await fetchPage(gen33Url);
    if (page.status >= 400) return [];

    const parsed = parseSgAccContact(page.data);
    if (!parsed) return [];

    return [
      buildRecord({
        id: 'WSJC-ACC',
        firIcao: 'WSJC',
        firName: 'Singapore FIR',
        regionCode: source.regionCode,
        facilityName: 'Singapore Area Control Centre (SATCC)',
        facilityType: 'ACC',
        phoneNumber: parsed.phoneNumber!,
        faxNumber: parsed.faxNumber,
        aftnAddress: parsed.aftnAddress!,
        vhfFreq: [GUARD_FREQ],
        sourceName: source.name,
        sourceUrl: gen33Url,
      }),
    ];
  } catch {
    return [];
  }
}

// ──────────────────────────────────────────────
//  彙整
// ──────────────────────────────────────────────

export interface GetContactsOptions {
  regionCode?: string;
  page?: number;
  pageSize?: number;
}

export async function getFirContactsPaginated(options: GetContactsOptions = {}): Promise<PaginatedContacts> {
  const { regionCode, page = 1, pageSize = 20 } = options;

  const settled = await Promise.allSettled([
    scrapeTaiwanANWS(),
    scrapeUKEAip(),
    scrapeSingaporeCaas(),
  ]);

  const deduped = Array.from(
    new Map(
      settled
        .flatMap((result) => (result.status === 'fulfilled' ? result.value : []))
        .sort((left, right) => left.firName.localeCompare(right.firName) || left.facilityName.localeCompare(right.facilityName))
        .map((contact) => [contact.id, contact])
    ).values()
  );

  const regionMap = new Map<string, RegionInfo>();

  deduped.forEach((contact) => {
    const current = regionMap.get(contact.regionCode);
    if (current) {
      current.count += 1;
      return;
    }

    regionMap.set(contact.regionCode, {
      code: contact.regionCode,
      name: contact.firName,
      count: 1,
    });
  });

  const availableRegions = Array.from(regionMap.values()).sort((left, right) => right.count - left.count);
  const filtered = regionCode
    ? deduped.filter((contact) => contact.regionCode.toUpperCase() === regionCode.toUpperCase())
    : deduped;

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const startIndex = (safePage - 1) * pageSize;
  const data = filtered.slice(startIndex, startIndex + pageSize);

  return {
    data,
    total,
    page: safePage,
    pageSize,
    totalPages,
    availableRegions,
  };
}

export async function getFirContacts(): Promise<FirContactRecord[]> {
  const result = await getFirContactsPaginated({ pageSize: 100 });
  return result.data;
}
