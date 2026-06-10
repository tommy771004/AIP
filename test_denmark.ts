import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const r = await axios.get('https://aim.naviair.dk/en/flight-briefing/aip/');
  const $ = cheerio.load(r.data);
  $('a').each((i, e) => {
      const href = $(e).attr('href');
      if (href && (href.includes('aip') || href.includes('html'))) {
          console.log($(e).text().trim(), href);
      }
  });
}

test().catch(console.error);
