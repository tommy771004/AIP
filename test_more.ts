import axios from 'axios';
import * as cheerio from 'cheerio';
import https from 'https';

const agent = new https.Agent({  
  rejectUnauthorized: false
});

async function testSite(name, url) {
    try {
        const r = await axios.get(url, { httpsAgent: agent, timeout: 5000 });
        console.log(`[${name}] Success! Status:`, r.status);
        const $ = cheerio.load(r.data);
        
        let eAipLinks = 0;
        $('a').each((i, e) => {
            const text = $(e).text().trim().toLowerCase();
            const href = $(e).attr('href') || '';
            if (href.includes('eAIP') || href.includes('html') || text.includes('aip') || text.includes('current')) {
                eAipLinks++;
                if (eAipLinks < 5) {
                    console.log(`  -> Link: ${text} | ${href}`);
                }
            }
        });
        console.log(`[${name}] Found ${eAipLinks} potential eAIP/HTML links.`);
    } catch (e) {
        console.log(`[${name}] Failed:`, e.message);
    }
}

async function run() {
    await testSite('Ireland', 'http://iaip.iaa.ie/iaip/aip_dir.htm');
    await testSite('Netherlands', 'https://www.lvnl.nl/eaip/');
    await testSite('Poland', 'https://ais.pansa.pl/aip/');
    await testSite('Thailand', 'https://aip.caat.or.th/');
    await testSite('SriLanka', 'https://www.airport.lk/aasl/AIS/AIP/');
    await testSite('SouthAfrica', 'https://aip.atns.com/');
    await testSite('Belgium', 'https://ops.skeyes.be/html/belgocontrol_static/eaip/eAIP_Main/html/index-en-GB.html');
}

run().catch(console.error);
