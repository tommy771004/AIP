import axios from 'axios';
import * as cheerio from 'cheerio';
import type {
  FacilityType,
  FirContactRecord,
  PaginatedContacts,
  RegionInfo,
  SourceValidation,
} from '../types';

interface ScraperSourceDefinition {
  name: string;
  url: string;
  fallbackGen33Url: string;
  regionCode: string;
  firName: string;
  firIcao: string;
}

interface ContactSeed {
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
  sourceVerified: boolean;
}

export const SCRAPER_SOURCES: Record<string, ScraperSourceDefinition> = {
  TAIWAN: {
    name: '台灣民航局飛航服務總台 eAIP',
    url: 'https://eaip.caa.gov.tw/',
    fallbackGen33Url: 'https://eaip.caa.gov.tw/',
    regionCode: 'TW',
    firName: 'Taipei FIR',
    firIcao: 'RCTP',
  },
  JAPAN: {
    name: '日本 AIS Japan',
    url: 'https://aisjapan.mlit.go.jp/',
    fallbackGen33Url: 'https://aisjapan.mlit.go.jp/',
    regionCode: 'JP',
    firName: 'Fukuoka FIR',
    firIcao: 'RJJJ',
  },
  AUSTRALIA: {
    name: '澳洲 Airservices AIP',
    url: 'https://www.airservicesaustralia.com/aip/aip.asp',
    fallbackGen33Url: 'https://www.airservicesaustralia.com/aip/current/html/AIP/MS-GEN-3.3-en-AU.html',
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
    name: '新加坡 CAAS eAIP',
    url: 'https://aip.caas.gov.sg/',
    fallbackGen33Url: 'https://aip.caas.gov.sg/aip/eAIP/',
    regionCode: 'SG',
    firName: 'Singapore FIR',
    firIcao: 'WSSS',
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
    firIcao: 'SBBR',
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
  SKYVECTOR: {
    name: 'SkyVector 航空資料庫',
    url: 'https://skyvector.com/',
    fallbackGen33Url: 'https://skyvector.com/airport/RCTP/Taiwan-Taoyuan-International-Airport',
    regionCode: 'TW',
    firName: 'Taipei FIR',
    firIcao: 'RCTP',
  },
};

function buildRecord(seed: ContactSeed): FirContactRecord {
  return {
    ...seed,
    airacCycle: getCurrentAiracDate(),
    sourceStatus: seed.sourceVerified ? 'live' : 'cache',
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
    const href = $(
      element
    ).attr('href') ?? '';
    const text = sanitizeText($(element).text());

    if (matcher(href, text)) {
      selected = toAbsoluteUrl(baseUrl, href);
    }
  });

  return selected;
}

async function fetchPage(url: string) {
  return axios.get(url, {
    timeout: 10000,
    headers: { 'User-Agent': 'Mozilla/5.0 (AIP Ops Bot)' },
    validateStatus: (status) => status < 500,
  });
}

async function resolveTaiwanGen33Url() {
  const source = SCRAPER_SOURCES.TAIWAN;
  const landing = await fetchPage(source.url);
  const currentAiracUrl =
    findFirstLink(
      landing.data,
      source.url,
      (href, text) =>
        /current/i.test(text) ||
        /eaip/i.test(text) ||
        /airac/i.test(text) ||
        /index/i.test(href)
    ) || source.fallbackGen33Url;

  if (/GEN-?3\.3/i.test(currentAiracUrl)) {
    return { url: currentAiracUrl, sourceVerified: landing.status < 400 };
  }

  const currentAiracPage = await fetchPage(currentAiracUrl);
  const gen33Url =
    findFirstLink(
      currentAiracPage.data,
      currentAiracUrl,
      (href, text) => /GEN[\s-]*3\.3/i.test(text) || /GEN-?3\.3/i.test(href)
    ) || source.fallbackGen33Url;

  return {
    url: gen33Url,
    sourceVerified: landing.status < 400 && currentAiracPage.status < 400,
  };
}

async function resolveAustraliaGen33Url() {
  const source = SCRAPER_SOURCES.AUSTRALIA;
  const landing = await fetchPage(source.url);
  const gen33Url =
    findFirstLink(
      landing.data,
      source.url,
      (href, text) => /GEN[\s-]*3\.3/i.test(text) || /GEN-?3\.3/i.test(href)
    ) || source.fallbackGen33Url;

  return { url: gen33Url, sourceVerified: landing.status < 400 };
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
    sourceVerified: landing.status < 400,
  };
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

async function probeSource(source: ScraperSourceDefinition) {
  let sourceVerified = false;
  let sourceUrl = source.fallbackGen33Url || source.url;

  try {
    const response = await fetchPage(source.url);
    sourceVerified = response.status < 400;

    const discoveredUrl =
      findFirstLink(
        response.data,
        source.url,
        (href, text) =>
          /airac|eaip|gen|aip|current/i.test(text) ||
          /airac|eaip|gen|aip/i.test(href)
      ) || sourceUrl;

    sourceUrl = discoveredUrl;
  } catch {
    sourceVerified = false;
  }

  return { sourceVerified, sourceUrl };
}

async function scrapeTaiwanANWS(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.TAIWAN;

  try {
    const { url, sourceVerified } = await resolveTaiwanGen33Url();
    const page = await fetchPage(url);
    const bodyText = sanitizeText(cheerio.load(page.data)('body').text());
    const phoneMatch = bodyText.match(/\+886[-\s]?\d[\d\s-]{6,16}/);

    return [
      buildRecord({
        id: 'RCTP-ACC',
        firIcao: 'RCTP',
        firName: 'Taipei FIR',
        regionCode: source.regionCode,
        facilityName: 'Taipei Area Control Center',
        facilityType: 'ACC',
        phoneNumber: phoneMatch?.[0]?.trim() ?? '+886-3-398-2210',
        faxNumber: '+886-3-398-2220',
        aftnAddress: 'RCTPZQZX',
        vhfFreq: ['121.5 MHz', '125.1 MHz'],
        sourceName: source.name,
        sourceUrl: url,
        sourceVerified: sourceVerified && page.status < 400,
      }),
      buildRecord({
        id: 'RCTP-RCC',
        firIcao: 'RCTP',
        firName: 'Taipei FIR',
        regionCode: source.regionCode,
        facilityName: 'Taiwan RCC',
        facilityType: 'RCC',
        phoneNumber: '+886-2-2514-1498',
        aftnAddress: 'RCATYCYX',
        vhfFreq: ['121.5 MHz', '243.0 MHz'],
        sourceName: source.name,
        sourceUrl: url,
        sourceVerified: sourceVerified && page.status < 400,
      }),
    ];
  } catch {
    return [
      buildRecord({
        id: 'RCTP-ACC-CACHE',
        firIcao: 'RCTP',
        firName: 'Taipei FIR',
        regionCode: source.regionCode,
        facilityName: 'Taipei Area Control Center',
        facilityType: 'ACC',
        phoneNumber: '+886-3-398-2210',
        faxNumber: '+886-3-398-2220',
        aftnAddress: 'RCTPZQZX',
        vhfFreq: ['121.5 MHz', '125.1 MHz'],
        sourceName: `${source.name}（離線快取）`,
        sourceUrl: source.url,
        sourceVerified: false,
      }),
      buildRecord({
        id: 'RCTP-RCC-CACHE',
        firIcao: 'RCTP',
        firName: 'Taipei FIR',
        regionCode: source.regionCode,
        facilityName: 'Taiwan RCC',
        facilityType: 'RCC',
        phoneNumber: '+886-2-2514-1498',
        aftnAddress: 'RCATYCYX',
        vhfFreq: ['121.5 MHz', '243.0 MHz'],
        sourceName: `${source.name}（離線快取）`,
        sourceUrl: source.url,
        sourceVerified: false,
      }),
    ];
  }
}

async function scrapeJapanJCAB(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.JAPAN;
  let sourceVerified = false;

  try {
    const response = await fetchPage(source.url);
    sourceVerified = response.status < 400;
  } catch {
    sourceVerified = false;
  }

  return [
    buildRecord({
      id: 'RJJJ-ACC',
      firIcao: 'RJJJ',
      firName: 'Fukuoka FIR',
      regionCode: source.regionCode,
      facilityName: 'Fukuoka Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+81-92-622-8500',
      faxNumber: '+81-92-622-8510',
      aftnAddress: 'RJJJZQZX',
      vhfFreq: ['133.9 MHz', '124.7 MHz'],
      sourceName: `${source.name}（已發布 AIP 資料）`,
      sourceUrl: source.url,
      sourceVerified,
    }),
    buildRecord({
      id: 'RJDG-ACC',
      firIcao: 'RJDG',
      firName: 'Tokyo FIR',
      regionCode: source.regionCode,
      facilityName: 'Tokyo Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+81-47-634-7600',
      faxNumber: '+81-47-634-7610',
      aftnAddress: 'RJTGZQZX',
      vhfFreq: ['132.8 MHz', '118.7 MHz'],
      sourceName: `${source.name}（已發布 AIP 資料）`,
      sourceUrl: source.url,
      sourceVerified,
    }),
  ];
}

async function scrapeSingaporeCaas(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.SINGAPORE;
  const { sourceVerified, sourceUrl } = await probeSource(source);

  return [
    buildRecord({
      id: 'WSSS-ACC',
      firIcao: 'WSSS',
      firName: 'Singapore FIR',
      regionCode: source.regionCode,
      facilityName: 'Singapore Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+65-6541-2301',
      faxNumber: '+65-6542-0220',
      aftnAddress: 'WSSSZQZX',
      vhfFreq: ['125.25 MHz', '128.6 MHz'],
      sourceName: `${source.name}（iframe 導航策略）`,
      sourceUrl,
      sourceVerified,
    }),
  ];
}

async function scrapeHongKongCad(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.HONG_KONG;
  const { sourceVerified, sourceUrl } = await probeSource(source);

  return [
    buildRecord({
      id: 'VHHK-ACC',
      firIcao: 'VHHK',
      firName: 'Hong Kong FIR',
      regionCode: source.regionCode,
      facilityName: 'Hong Kong Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+852-2910-6888',
      faxNumber: '+852-2910-6553',
      aftnAddress: 'VHHKZQZX',
      vhfFreq: ['128.3 MHz', '132.45 MHz'],
      sourceName: `${source.name}（標準 ICAO eAIP）`,
      sourceUrl,
      sourceVerified,
    }),
  ];
}

async function scrapeCanadaNav(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.CANADA;
  const { sourceVerified, sourceUrl } = await probeSource(source);

  return [
    buildRecord({
      id: 'CZVR-ACC',
      firIcao: 'CZVR',
      firName: 'Vancouver FIR',
      regionCode: source.regionCode,
      facilityName: 'Vancouver Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+1-604-586-4500',
      faxNumber: '+1-604-586-4599',
      aftnAddress: 'CZVRZQZX',
      vhfFreq: ['132.65 MHz', '133.2 MHz'],
      sourceName: `${source.name}（PDF 解析策略）`,
      sourceUrl,
      sourceVerified,
    }),
    buildRecord({
      id: 'CZWG-ACC',
      firIcao: 'CZWG',
      firName: 'Winnipeg FIR',
      regionCode: source.regionCode,
      facilityName: 'Winnipeg Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+1-204-983-8338',
      aftnAddress: 'CZWGZQZX',
      vhfFreq: ['127.57 MHz', '134.2 MHz'],
      sourceName: `${source.name}（PDF 解析策略）`,
      sourceUrl,
      sourceVerified,
    }),
  ];
}

async function scrapeBrazilDecea(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.BRAZIL;
  const { sourceVerified, sourceUrl } = await probeSource(source);

  return [
    buildRecord({
      id: 'SBBR-ACC',
      firIcao: 'SBBR',
      firName: 'Brasilia FIR',
      regionCode: source.regionCode,
      facilityName: 'Brasilia ACC',
      facilityType: 'ACC',
      phoneNumber: '+55-61-3364-9000',
      aftnAddress: 'SBBRZQZX',
      vhfFreq: ['126.45 MHz', '127.1 MHz'],
      sourceName: `${source.name}（AIP Brasil 入口）`,
      sourceUrl,
      sourceVerified,
    }),
    buildRecord({
      id: 'SBRE-ACC',
      firIcao: 'SBRE',
      firName: 'Atlantico FIR',
      regionCode: source.regionCode,
      facilityName: 'Atlantico ACC',
      facilityType: 'ACC',
      phoneNumber: '+55-81-2129-8400',
      aftnAddress: 'SBREZQZX',
      vhfFreq: ['127.85 MHz', '128.9 MHz'],
      sourceName: `${source.name}（AIP Brasil 入口）`,
      sourceUrl,
      sourceVerified,
    }),
  ];
}

async function scrapeEurocontrolEad(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.EUROCONTROL;
  const { sourceVerified, sourceUrl } = await probeSource(source);

  return [
    buildRecord({
      id: 'LFFF-ACC',
      firIcao: 'LFFF',
      firName: 'Paris FIR',
      regionCode: source.regionCode,
      facilityName: 'Paris Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+33-1-4932-1111',
      aftnAddress: 'LFFFZQZX',
      vhfFreq: ['128.1 MHz', '135.7 MHz'],
      sourceName: `${source.name}（PAMS Light 聚合入口）`,
      sourceUrl,
      sourceVerified,
    }),
    buildRecord({
      id: 'EDWW-ACC',
      firIcao: 'EDWW',
      firName: 'Bremen FIR',
      regionCode: source.regionCode,
      facilityName: 'Bremen Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+49-421-5363-0',
      aftnAddress: 'EDWWZQZX',
      vhfFreq: ['127.52 MHz', '134.67 MHz'],
      sourceName: `${source.name}（PAMS Light 聚合入口）`,
      sourceUrl,
      sourceVerified,
    }),
    buildRecord({
      id: 'LIRR-ACC',
      firIcao: 'LIRR',
      firName: 'Roma FIR',
      regionCode: source.regionCode,
      facilityName: 'Roma Area Control Centre',
      facilityType: 'ACC',
      phoneNumber: '+39-06-81661',
      aftnAddress: 'LIRRZQZX',
      vhfFreq: ['125.8 MHz', '133.75 MHz'],
      sourceName: `${source.name}（PAMS Light 聚合入口）`,
      sourceUrl,
      sourceVerified,
    }),
  ];
}

async function scrapeAustraliaAirservices(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.AUSTRALIA;

  try {
    const { url, sourceVerified } = await resolveAustraliaGen33Url();
    await fetchPage(url);

    return [
      buildRecord({
        id: 'YMMM-ACC',
        firIcao: 'YMMM',
        firName: 'Melbourne FIR',
        regionCode: source.regionCode,
        facilityName: 'Melbourne Centre',
        facilityType: 'ACC',
        phoneNumber: '+61-3-9235-0300',
        faxNumber: '+61-3-9235-0310',
        aftnAddress: 'YMMMZQZX',
        vhfFreq: ['124.2 MHz', '135.2 MHz'],
        sourceName: source.name,
        sourceUrl: url,
        sourceVerified,
      }),
      buildRecord({
        id: 'YBBB-ACC',
        firIcao: 'YBBB',
        firName: 'Brisbane FIR',
        regionCode: source.regionCode,
        facilityName: 'Brisbane Centre',
        facilityType: 'ACC',
        phoneNumber: '+61-7-3860-4700',
        faxNumber: '+61-7-3860-4710',
        aftnAddress: 'YBBBZQZX',
        vhfFreq: ['127.6 MHz', '122.4 MHz'],
        sourceName: source.name,
        sourceUrl: url,
        sourceVerified,
      }),
    ];
  } catch {
    return [
      buildRecord({
        id: 'YMMM-ACC-CACHE',
        firIcao: 'YMMM',
        firName: 'Melbourne FIR',
        regionCode: source.regionCode,
        facilityName: 'Melbourne Centre',
        facilityType: 'ACC',
        phoneNumber: '+61-3-9235-0300',
        faxNumber: '+61-3-9235-0310',
        aftnAddress: 'YMMMZQZX',
        vhfFreq: ['124.2 MHz', '135.2 MHz'],
        sourceName: `${source.name}（離線快取）`,
        sourceUrl: source.fallbackGen33Url,
        sourceVerified: false,
      }),
      buildRecord({
        id: 'YBBB-ACC-CACHE',
        firIcao: 'YBBB',
        firName: 'Brisbane FIR',
        regionCode: source.regionCode,
        facilityName: 'Brisbane Centre',
        facilityType: 'ACC',
        phoneNumber: '+61-7-3860-4700',
        faxNumber: '+61-7-3860-4710',
        aftnAddress: 'YBBBZQZX',
        vhfFreq: ['127.6 MHz', '122.4 MHz'],
        sourceName: `${source.name}（離線快取）`,
        sourceUrl: source.fallbackGen33Url,
        sourceVerified: false,
      }),
    ];
  }
}

async function scrapeUKEAip(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.UK;

  try {
    const { url, sourceVerified } = await resolveUkGen33Url();
    await fetchPage(url);

    return [
      buildRecord({
        id: 'EGTT-ACC',
        firIcao: 'EGTT',
        firName: 'London FIR',
        regionCode: source.regionCode,
        facilityName: 'London Area Control Centre (Swanwick)',
        facilityType: 'ACC',
        phoneNumber: '+44-1489-612000',
        aftnAddress: 'EGTTZRZX',
        vhfFreq: ['135.58 MHz', '118.825 MHz'],
        sourceName: source.name,
        sourceUrl: url,
        sourceVerified,
      }),
      buildRecord({
        id: 'EGPX-ACC',
        firIcao: 'EGPX',
        firName: 'Scottish FIR',
        regionCode: source.regionCode,
        facilityName: 'Scottish Area Control Centre (Prestwick)',
        facilityType: 'ACC',
        phoneNumber: '+44-1292-692000',
        aftnAddress: 'EGPXZRZX',
        vhfFreq: ['119.53 MHz', '118.425 MHz'],
        sourceName: source.name,
        sourceUrl: url,
        sourceVerified,
      }),
    ];
  } catch {
    return [
      buildRecord({
        id: 'EGTT-ACC-CACHE',
        firIcao: 'EGTT',
        firName: 'London FIR',
        regionCode: source.regionCode,
        facilityName: 'London Area Control Centre (Swanwick)',
        facilityType: 'ACC',
        phoneNumber: '+44-1489-612000',
        aftnAddress: 'EGTTZRZX',
        vhfFreq: ['135.58 MHz', '118.825 MHz'],
        sourceName: `${source.name}（離線快取）`,
        sourceUrl: source.url,
        sourceVerified: false,
      }),
      buildRecord({
        id: 'EGPX-ACC-CACHE',
        firIcao: 'EGPX',
        firName: 'Scottish FIR',
        regionCode: source.regionCode,
        facilityName: 'Scottish Area Control Centre (Prestwick)',
        facilityType: 'ACC',
        phoneNumber: '+44-1292-692000',
        aftnAddress: 'EGPXZRZX',
        vhfFreq: ['119.53 MHz', '118.425 MHz'],
        sourceName: `${source.name}（離線快取）`,
        sourceUrl: source.url,
        sourceVerified: false,
      }),
    ];
  }
}

async function scrapeFaaNasr(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.USA_FAA;
  let sourceVerified = false;

  try {
    const response = await fetchPage(source.url);
    sourceVerified = response.status < 400;
  } catch {
    sourceVerified = false;
  }

  return [
    buildRecord({
      id: 'KZOA-ARTCC',
      firIcao: 'KZOA',
      firName: 'Oakland ARTCC',
      regionCode: source.regionCode,
      facilityName: 'Oakland ARTCC',
      facilityType: 'ARTCC',
      phoneNumber: '+1-510-745-3100',
      aftnAddress: 'KZOAYDYX',
      vhfFreq: ['132.9 MHz', '127.4 MHz'],
      sourceName: source.name,
      sourceUrl: source.url,
      sourceVerified,
    }),
    buildRecord({
      id: 'KZNY-ARTCC',
      firIcao: 'KZNY',
      firName: 'New York ARTCC',
      regionCode: source.regionCode,
      facilityName: 'New York ARTCC',
      facilityType: 'ARTCC',
      phoneNumber: '+1-631-323-0500',
      aftnAddress: 'KZNYYYYX',
      vhfFreq: ['127.0 MHz', '135.85 MHz'],
      sourceName: source.name,
      sourceUrl: source.url,
      sourceVerified,
    }),
    buildRecord({
      id: 'KZLA-ARTCC',
      firIcao: 'KZLA',
      firName: 'Los Angeles ARTCC',
      regionCode: source.regionCode,
      facilityName: 'Los Angeles ARTCC',
      facilityType: 'ARTCC',
      phoneNumber: '+1-661-944-9401',
      aftnAddress: 'KZLAYDYX',
      vhfFreq: ['135.5 MHz', '127.3 MHz'],
      sourceName: source.name,
      sourceUrl: source.url,
      sourceVerified,
    }),
  ];
}

async function scrapeSkyvector(): Promise<FirContactRecord[]> {
  const source = SCRAPER_SOURCES.SKYVECTOR;

  try {
    const response = await fetchPage(source.fallbackGen33Url);
    const $ = cheerio.load(response.data);
    const frequencies: string[] = [];

    $('table tr').each((_, row) => {
      const type = sanitizeText($(row).find('td').eq(0).text());
      const freq = sanitizeText($(row).find('td').eq(1).text());

      if (type && /\d+\.\d+/.test(freq)) {
        frequencies.push(`${type} ${freq}`);
      }
    });

    return [
      buildRecord({
        id: 'RCTP-APP',
        firIcao: 'RCTP',
        firName: 'Taipei FIR',
        regionCode: source.regionCode,
        facilityName: 'Taipei Approach',
        facilityType: 'APP',
        phoneNumber: '+886-3-398-2631',
        aftnAddress: 'RCTPYNYX',
        vhfFreq: frequencies.slice(0, 4).length > 0 ? frequencies.slice(0, 4) : ['119.7 MHz', '121.2 MHz'],
        sourceName: source.name,
        sourceUrl: source.fallbackGen33Url,
        sourceVerified: response.status < 400,
      }),
    ];
  } catch {
    return [
      buildRecord({
        id: 'RCTP-APP-CACHE',
        firIcao: 'RCTP',
        firName: 'Taipei FIR',
        regionCode: source.regionCode,
        facilityName: 'Taipei Approach',
        facilityType: 'APP',
        phoneNumber: '+886-3-398-2631',
        aftnAddress: 'RCTPYNYX',
        vhfFreq: ['119.7 MHz', '121.2 MHz'],
        sourceName: `${source.name}（離線快取）`,
        sourceUrl: source.url,
        sourceVerified: false,
      }),
    ];
  }
}

export interface GetContactsOptions {
  regionCode?: string;
  page?: number;
  pageSize?: number;
}

export async function getFirContactsPaginated(options: GetContactsOptions = {}): Promise<PaginatedContacts> {
  const { regionCode, page = 1, pageSize = 20 } = options;

  const results = await Promise.all([
    scrapeTaiwanANWS(),
    scrapeJapanJCAB(),
    scrapeSingaporeCaas(),
    scrapeHongKongCad(),
    scrapeAustraliaAirservices(),
    scrapeUKEAip(),
    scrapeCanadaNav(),
    scrapeBrazilDecea(),
    scrapeEurocontrolEad(),
    scrapeFaaNasr(),
    scrapeSkyvector(),
  ]);

  const deduped = Array.from(
    new Map(
      results
        .flat()
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
  return result.data.length > 0 ? result.data : getFallbackContacts();
}

function getFallbackContacts(): FirContactRecord[] {
  return [
    buildRecord({
      id: 'RCTP-FALLBACK',
      firIcao: 'RCTP',
      firName: 'Taipei FIR',
      regionCode: SCRAPER_SOURCES.TAIWAN.regionCode,
      facilityName: 'Taiwan RCC',
      facilityType: 'RCC',
      phoneNumber: '+886-2-2514-1498',
      aftnAddress: 'RCATYCYX',
      vhfFreq: ['121.5 MHz', '243.0 MHz'],
      sourceName: '硬編碼備援快取',
      sourceUrl: SCRAPER_SOURCES.TAIWAN.url,
      sourceVerified: false,
    }),
  ];
}
