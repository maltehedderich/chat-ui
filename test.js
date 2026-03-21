import puppeteer from 'puppeteer';

(async () => {
	try {
		console.log('Launching browser...');
		const browser = await puppeteer.launch();
		const page = await browser.newPage();

		page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
		page.on('pageerror', (err) => console.log('PAGE ERROR:', err.toString()));
		page.on('requestfailed', (request) => {
			console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
		});

		console.log('Navigating...');
		await page.goto('http://localhost:4173', { waitUntil: 'networkidle2' });
		console.log('Navigation complete. Waiting 3 seconds...');
		await new Promise((r) => setTimeout(r, 3000));

		await browser.close();
		console.log('Done.');
	} catch (e) {
		console.error('Script Error:', e);
	}
})();
