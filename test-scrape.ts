import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  try {
    const { data } = await axios.get('https://www.aurora.nats.co.uk/htmlAIP/Publications/2026-05-14-AIRAC/html/eAIP/EG-GEN-3.3-en-GB.html');
    const $ = cheerio.load(data);
    
    const lines = [];
    $('p, td').each((i, el) => {
      const text = $(el).text().replace(/\s+/g, ' ').trim();
      if (text.includes('Tel:') || text.includes('01') || text.includes('Control Centre')) {
        lines.push(text);
      }
    });

    console.log(lines.slice(0, 15));
  } catch (err) {
    console.error(err.message);
  }
}
test();
