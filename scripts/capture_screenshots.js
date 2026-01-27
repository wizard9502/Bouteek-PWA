const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
    // Determine the working port
    const ports = [3002, 3000, 3001];
    let baseUrl = null;

    for (const port of ports) {
        try {
            const resp = await fetch(`http://localhost:${port}/showcase-generator`);
            if (resp.status === 200) {
                baseUrl = `http://localhost:${port}/showcase-generator`;
                console.log(`Using base URL: ${baseUrl}`);
                break;
            }
        } catch (e) {
            console.log(`Port ${port} not reachable: ${e.message}`);
        }
    }

    if (!baseUrl) {
        console.error('Could not find a working showcase generator URL.');
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1200']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1200 });

    // Capture console logs
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    const screenshotsDir = path.resolve(__dirname, '../public/screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    const tabs = ['dashboard', 'orders', 'store', 'finance', 'referrals'];

    // Capture Web Screenshots
    console.log('Navigating to page...');
    await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 120000 });

    // Check if we are on the right page
    const title = await page.title();
    console.log(`Page title: ${title}`);

    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!bodyText.includes('Le Chic Boutique')) {
        console.error('Page does not seem to contain "Le Chic Boutique". Content snippet:', bodyText.substring(0, 200));
    }

    // Wait for the Web View container
    console.log('Waiting for #web-mockup...');
    try {
        await page.waitForSelector('#web-mockup', { timeout: 10000 });
    } catch (e) {
        console.error('Could not find #web-mockup. Dumping HTML...');
        const html = await page.content();
        console.log(html.substring(0, 2000));
    }

    // Ensure Web View is active
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const webBtn = buttons.find(b => b.textContent.includes('Web View'));
        if (webBtn) webBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    for (const tab of tabs) {
        console.log(`Capturing ${tab}-web...`);

        // Click Tab
        await page.evaluate((t) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const tabBtn = buttons.find(b => b.textContent.trim().toUpperCase() === t.toUpperCase());
            if (tabBtn) tabBtn.click();
        }, tab);

        await new Promise(r => setTimeout(r, 1000));

        const mockup = await page.$('#web-mockup');
        if (mockup) {
            await mockup.screenshot({ path: path.join(screenshotsDir, `${tab}-web.png`) });
            console.log(`Saved ${tab}-web.png`);
        } else {
            console.error(`FAILED to capture ${tab}-web`);
        }
    }

    // Capture Mobile Screenshots
    console.log('Switching to Mobile View...');
    await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const mobileBtn = buttons.find(b => b.textContent.includes('Mobile View'));
        if (mobileBtn) mobileBtn.click();
    });

    console.log('Waiting for #mobile-mockup...');
    try {
        await page.waitForSelector('#mobile-mockup', { timeout: 10000 });
    } catch (e) {
        console.error('Could not find #mobile-mockup.');
    }

    for (const tab of tabs) {
        console.log(`Capturing ${tab}-mobile...`);

        // Click Tab
        await page.evaluate((t) => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const tabBtn = buttons.find(b => b.textContent.trim().toUpperCase() === t.toUpperCase());
            if (tabBtn) tabBtn.click();
        }, tab);

        await new Promise(r => setTimeout(r, 1000));

        const mockup = await page.$('#mobile-mockup');
        if (mockup) {
            await mockup.screenshot({ path: path.join(screenshotsDir, `${tab}-mobile.png`) });
            console.log(`Saved ${tab}-mobile.png`);
        } else {
            console.error(`FAILED to capture ${tab}-mobile`);
        }
    }

    await browser.close();
    console.log('Done.');
})();
