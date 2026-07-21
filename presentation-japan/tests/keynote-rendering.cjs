const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
    if (!(await page.locator('body').innerText()).includes('The Energy Grid Is Becoming a Cloud Native Distributed System')) {
      throw new Error('The keynote title is not visible on the first slide.');
    }

    for (let step = 0; step < 10; step += 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(250);
    }
    if (!(await page.locator('body').innerText()).includes('This Is Not the First Warning')) {
      throw new Error('The pattern heading is not visible on the second slide.');
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
