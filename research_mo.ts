import axios from 'axios';
import * as cheerio from 'cheerio';

async function researchMacauAip() {
    try {
        console.log("Fetching Macau AIP page...");
        const htmlRes = await axios.get('https://www.aacm.gov.mo/zh-hant/industry-page/DataCompilation/AIP', { timeout: 10000 });
        const $ = cheerio.load(htmlRes.data);
        $('a').each((i, el) => {
            const href = $(el).attr('href') || '';
            const text = $(el).text();
            if (href.toLowerCase().includes('gen') || href.toLowerCase().includes('3.3')) {
                console.log(text.trim().substring(0, 50), '->', href);
            }
        });
    } catch (e: any) {
        console.log("Macau error:", e.message);
    }
}

researchMacauAip();
