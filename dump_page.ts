import { chromium } from 'playwright';

async function dump() {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const url = 'https://www.w3.org/WAI/demos/bad/before/home.html';
    
    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: 'networkidle' });
    
    const title = await page.title();
    const lang = await page.getAttribute('html', 'lang');
    console.log(`Title: ${title}`);
    console.log(`Lang: ${lang}`);
    
    const html = await page.content();
    console.log('--- HTML START ---');
    console.log(html);
    console.log('--- HTML END ---');
    
    const client = await page.context().newCDPSession(page);
    const { nodes } = await client.send('Accessibility.getFullAXTree');
    console.log('--- ACCESSIBILITY TREE START ---');
    console.log(JSON.stringify(nodes, null, 2));
    console.log('--- ACCESSIBILITY TREE END ---');
    
    await browser.close();
}

dump().catch(console.error);
