const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const url = process.env.MAIN_TALK_URL || 'http://localhost:3100/main-talk.html';

(async () => {
  let browser;
  try {
    browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('pageerror', error => errors.push(error.message));
    const next = async () => { await page.keyboard.press('ArrowRight'); await page.waitForTimeout(100); };

    const problem = page.getByTestId('daylight-flexibility-problem');
    const response = page.getByTestId('daylight-flexibility-response');
    await page.goto(url, { waitUntil: 'networkidle' });
    for (let slide = 0; slide < 30 && !(await problem.isVisible()); slide += 1) await next();
    assert.equal(await problem.isVisible(), true);
    await assert.doesNotReject(() => problem.getByText('12:00', { exact: true }).waitFor());
    await next();
    await assert.doesNotReject(() => page.getByTestId('kyushu-control-marker').waitFor());
    assert.match(await page.getByTestId('main-talk-source-footer').innerText(), /power, not curtailed energy/);
    for (let slide = 0; slide < 30 && !(await response.isVisible()); slide += 1) await next();
    assert.equal(await response.isVisible(), true);
    await assert.doesNotReject(() => response.getByText('Illustrative device response').waitFor());
    const caseNote = page.locator('[data-testid="main-talk-case-note"]:visible');
    for (let slide = 0; slide < 30 && !(await caseNote.isVisible()); slide += 1) await next();
    assert.equal(await caseNote.isVisible(), true);
    assert.match(await caseNote.innerText(), /company-reported|demonstration scope/);
    const finalCount = page.getByText(/26\s*\/\s*26/);
    for (let slide = 0; slide < 30 && !(await finalCount.isVisible()); slide += 1) await next();
    assert.equal(await finalCount.isVisible(), true);
    assert.deepEqual(errors, []);
  } finally {
    await browser?.close();
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
