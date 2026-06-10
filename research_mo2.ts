import axios from 'axios';
import * as cheerio from 'cheerio';

async function researchMacau() {
    try {
        console.log("Fetching Macau AIP General page...");
        const htmlRes = await axios.get('https://www.aacm.gov.mo/en/statute/Notices/General', { timeout: 10000 });
        const $ = cheerio.load(htmlRes.data);
        $('a').each((i, el) => {
            const href = $(el).attr('href') || '';
            const text = $(el).text();
            if (href.toLowerCase().includes('.pdf') || text.toLowerCase().includes('3.3')) {
                console.log(text.trim().substring(0, 50), '->', href);
            }
        });
    } catch (e: any) {
        console.log("Macau error:", e.message);
    }
}

researchMacau();
