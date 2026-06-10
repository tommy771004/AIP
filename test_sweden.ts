import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const r = await axios.get('https://aro.lfv.se/Editorial/View/eAIP');
  const $ = cheerio.load(r.data);
  $('a').each((i, e) => {
      console.log($(e).text().trim(), '=>', $(e).attr('href'));
  });
}

test().catch(console.error);
