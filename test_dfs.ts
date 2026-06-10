import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.goto('https://aip.dfs.de/basicIFR/');
  
  // Wait for the links and click on 'GEN General'
  await page.waitForSelector('text=GEN General');
  await page.click('text=GEN General');
  
  // Click on 'GEN 3'
  await page.waitForSelector('text=GEN 3');
  await page.click('text=GEN 3');
  
  // Click on 'GEN 3.3'
  await page.waitForSelector('text=GEN 3.3');
  await page.click('text=GEN 3.3');
  
  // The content will be loaded into the iframe
  await page.waitForTimeout(3000);
  
  const frame = page.frames().find(f => f.url().includes('html'));
  if (frame) {
      console.log('Frame URL:', frame.url());
      const content = await frame.content();
      console.log(content.substring(0, 1000));
  } else {
      console.log('No frame found');
      console.log(page.url());
  }
  
  await browser.close();
}

test().catch(console.error);
