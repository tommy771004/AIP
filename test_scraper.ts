import { getFirContactsPaginated } from './src/api/scraper';

async function test() {
    const contacts = await getFirContactsPaginated();
    console.log(`Scraped ${contacts.data.length} contacts across ${contacts.availableRegions.length} regions.`);
    for (const region of contacts.availableRegions) {
        console.log(`${region.name} (${region.code}): ${region.count}`);
    }
}

test().catch(console.error);
