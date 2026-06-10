import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const r = await axios.get('https://aip.caam.gov.my/aip/eAIP/2026-05-19/html/eAIP/WM-GEN-3.3-en-MS.html');
  const $ = cheerio.load(r.data);
  let count = 0;
  $('tr').each((i, e) => {
      const text = $(e).text().replace(/\s+/g, ' ').trim();
      if (text.includes('ACC') || text.includes('FIC')) {
          console.log(text);
          count++;
      }
  });
  console.log('Count:', count);
}

test().catch(console.error);
