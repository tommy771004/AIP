import axios from 'axios';
import * as cheerio from 'cheerio';

async function test() {
  const r1 = await axios.get('https://eaip.austrocontrol.at/lo/260515/index.htm');
  const $1 = cheerio.load(r1.data);
  $1('frame').each((i, e) => {
      console.log('Frame:', $1(e).attr('src'));
  });
}

test().catch(console.error);
