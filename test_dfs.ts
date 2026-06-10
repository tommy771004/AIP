import axios from 'axios';

async function test() {
  const r = await axios.get('https://aip.dfs.de/BasicIFR/js/basicAIP.js');
  console.log(r.data);
}

test().catch(console.error);
