import { chromium } from 'playwright-extra';
// @ts-ignore
import stealth from 'puppeteer-extra-plugin-stealth';

chromium.use(stealth());

async function findCaapPdf() {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        console.log("Navigating to CAAP AIP page...");
        await page.goto('https://caap.gov.ph/aeronautical-information-publication/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        
        const content = await page.content();
        // find all links
        const links = await page.$$eval('a', anchors => anchors.map(a => ({ text: a.textContent?.trim(), href: a.href })));
        
        const genLinks = links.filter(l => l.text?.includes('GEN') || l.href?.includes('GEN') || l.href?.includes('pdf'));
        console.log("Found GEN/PDF links:", genLinks);
    } catch (e: any) {
        console.log("Error:", e.message);
    } finally {
        await browser.close();
    }
}

findCaapPdf();
