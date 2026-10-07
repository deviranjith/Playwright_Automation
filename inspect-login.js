const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('requestfailed', (request) => {
    const failure = request.failure();
    console.log('requestfailed:', request.url(), failure && failure.message);
  });
  page.on('console', (msg) => {
    console.log('console:', msg.type(), msg.text());
  });

  await page.goto('https://woory-uat.binarywavesolutions.com/', { waituntil: 'load', timeout: 15000 });
  await page.getByRole('heading', { name: 'Sign In' }).wait({ state: 'visible', timeout: 5000 });

  console.log('title=', await page.title());
  console.log('inputCount=', await page.locator('input').count());

  const inputInfos = [];
  const count = await page.locator('input').count();
  for (let i = 0; i < count; i += 1) {
    const el = page.locator('input').nth(i);
    inputInfos.push(await el.evaluate((e) => ({
      type: e.type,
      name: e.name,
      id: e.id,
      placeholder: e.placeholder,
      ariaLabel: e.getAttribute('aria-label'),
      autocomplete: e.getAttribute('autocomplete'),
      className: e.className,
    })));
  }
  console.log('inputInfos=', JSON.stringify(inputInfos, null, 2));

  console.log('allText=', (await page.getByText(/Username|Email|Password|Sign In|Forgot|Remember/).evaluateAll((els) => els.map((e) => e.textContent))).join(' | '));
  console.log('bodyText=', (await page.locator('body').innerText()).slice(0, 1500));

  await browser.close();
})();
