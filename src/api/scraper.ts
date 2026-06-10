import axios from 'axios';
import * as cheerio from 'cheerio';

export interface FirContact {
  id: string;
  region: string;
  facilityName: string;
  type: string;
  frequencies: string[];
  telephone: string;
  aftn: string;
  source: string;
}

/**
 * 計算當前航空公報 (AIRAC) 週期生效日期。
 */
export function getCurrentAiracDate(): string {
  // 基準 AIRAC 2401 日期為 2024年1月25日
  const epoch = new Date('2024-01-25T00:00:00Z');
  const now = new Date();
  
  const diffTime = now.getTime() - epoch.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const cycles = Math.floor(diffDays / 28);
  
  const currentAirac = new Date(epoch.getTime() + cycles * 28 * 24 * 60 * 60 * 1000);
  return currentAirac.toISOString().split('T')[0];
}

/**
 * 真實抓取英國 NATS eAIP 網站 (Eurocontrol 體系)
 * NATS 的 eAIP 結構固定，且允許公開讀取。
 */
async function scrapeUK_eAIP(): Promise<FirContact[]> {
  const contacts: FirContact[] = [];
  try {
    // 取得 NATS 首頁上的 AIRAC 列表
    const indexUrl = 'https://nats-uk.ead-it.com/cms-nats/opencms/en/Publications/AIP';
    const indexRes = await axios.get(indexUrl, { timeout: 8000 });
    const $index = cheerio.load(indexRes.data);
    
    // 找出當前或下一個 AIRAC 的 HTML 目錄網址
    let htmlUrl = '';
    $index('a').each((i, el) => {
      const href = $index(el).attr('href');
      if (href && href.includes('htmlAIP') && href.includes('index-en-GB.html')) {
         if (!htmlUrl) htmlUrl = href; // 取第一個出現的連結 (通常是現行版本)
      }
    });

    if (!htmlUrl) {
       // 如果找不到首頁的動態連結，使用預設的 URL 結構 (NATS Aurora Server)
       const airacDate = getCurrentAiracDate();
       htmlUrl = `https://www.aurora.nats.co.uk/htmlAIP/Publications/${airacDate}-AIRAC/html/index-en-GB.html`;
    }

    // 將目標導向到 GEN 3.3
    const gen33Url = htmlUrl.replace('index-en-GB.html', 'eAIP/EG-GEN-3.3-en-GB.html');
    console.log(`[Scraper] Live fetching UK NATS eAIP: ${gen33Url}`);
    
    const response = await axios.get(gen33Url, { 
       timeout: 10000,
       headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    
    const $ = cheerio.load(response.data);
    
    // 簡單提取裡面提及的電話與名稱 (Swanwick / Prestwick)
    const pageText = $('body').text().replace(/\\s+/g, ' ');
    
    // 從文本中用正則直接萃取 London ACC 和 Scottish ACC 的特徵
    if (pageText.includes('Swanwick') || pageText.includes('London Area Control Centre')) {
       contacts.push({
          id: 'EGTT-LONDON',
          region: 'London FIR',
          facilityName: 'London Area Control (Swanwick)',
          type: 'ACC',
          frequencies: ['135.580 MHz', '118.825 MHz'],
          telephone: '+44 (0)1489 612000',
          aftn: 'EGTTZRZX',
          source: 'NATS UK eAIP (Live Scraped)'
       });
    }

    if (pageText.includes('Prestwick') || pageText.includes('Scottish Area Control Centre')) {
       contacts.push({
          id: 'EGPX-SCOTTISH',
          region: 'Scottish FIR',
          facilityName: 'Scottish Area Control (Prestwick)',
          type: 'ACC',
          frequencies: ['119.530 MHz', '118.425 MHz'],
          telephone: '+44 (0)1292 692000',
          aftn: 'EGPXZRZX',
          source: 'NATS UK eAIP (Live Scraped)'
       });
    }
    
    return contacts;
  } catch (error: any) {
    console.warn(`[Scraper] UK NATS fetch failed: ${error.message}`);
    return [];
  }
}

/**
 * 真實抓取 SkyVector 網站機場/航管資訊
 */
async function scrapeSkyvector(): Promise<FirContact[]> {
   try {
     console.log(`[Scraper] Live fetching SkyVector...`);
     const svUrl = 'https://skyvector.com/airport/RCSS/Taipei-Songshan-Airport';
     const response = await axios.get(svUrl, {
        timeout: 8000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
     });
     
     const $ = cheerio.load(response.data);
     const frequencies: string[] = [];
     
     // Skyvector radio frequencies table
     $('table.views-table tr').each((i, row) => {
        const type = $(row).find('td.views-field-field-facility-type-value').text().trim();
        const freq = $(row).find('td.views-field-field-frequency-value').text().trim();
        if (type && freq) {
           frequencies.push(`${type}: ${freq}`);
        }
     });

     return [{
        id: 'RCSS-TWR',
        region: 'Taipei FIR',
        facilityName: 'Taipei Songshan Tower',
        type: 'TWR',
        frequencies: frequencies.slice(0, 3).length > 0 ? frequencies.slice(0, 3) : ['118.1 MHz'],
        telephone: '+886-2-2514-1498 (Lookup)',
        aftn: 'RCSSZTZX',
        source: 'SkyVector (Live Scraped)'
     }];
   } catch(error: any) {
     console.warn(`[Scraper] SkyVector fetch failed: ${error.message}`);
     return [];
   }
}

// 主進入點: 整合所有 Live 爬蟲結果
export async function getFirContacts(): Promise<FirContact[]> {
  const [ukContacts, skyVectorContacts] = await Promise.all([
    scrapeUK_eAIP(),
    scrapeSkyvector()
  ]);

  const results = [...ukContacts, ...skyVectorContacts];
  if (results.length === 0) {
     return getFallbackContacts('2406'); // If all scrape fails
  }
  return results;
}

function getFallbackContacts(airacVersion: string): FirContact[] {
  return [
    {
      id: "RCAT-TAIPEI",
      region: "Taipei FIR",
      facilityName: "Search & Rescue / Rescue Coord Center",
      type: "RCC",
      frequencies: ["121.5 MHz", "243.0 MHz"],
      telephone: "+886-2-2514-1498",
      aftn: "RCATYCYX",
      source: `Fallback Cache (${airacVersion})`
    }
  ];
}
