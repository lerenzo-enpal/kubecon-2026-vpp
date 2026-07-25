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

    await page.goto(url, { waitUntil: 'networkidle' });
    await assert.doesNotReject(() => page.getByText('What is a Virtual Power Plant (VPP) ?', { exact: true }).waitFor());
    await assert.doesNotReject(() => page.getByText('Green Tech and the Modernization of the Grid', { exact: true }).waitFor());
    await next();
    const networkMotif = page.getByTestId('capability-motif-network');
    await assert.doesNotReject(() => networkMotif.waitFor());
    await assert.doesNotReject(() => networkMotif.getByText('GRID TODAY', { exact: true }).waitFor());
    await next();
    await assert.doesNotReject(() => page.getByText('BATTERIES + INTERNET', { exact: true }).waitFor());
    await next();
    await assert.doesNotReject(() => networkMotif.getByText('NEW CAPABILITIES', { exact: true }).waitFor());
    await next();
    const openingMap = page.getByTestId('japan-grid-atlas');
    await assert.doesNotReject(() => openingMap.waitFor());
    assert.match(await openingMap.getAttribute('data-variant'), /washi/);
    const storeMotif = page.getByTestId('capability-motif-store');
    for (let slide = 0; slide < 30 && !(await storeMotif.isVisible()); slide += 1) await next();
    assert.equal(await storeMotif.isVisible(), true);
    const respondMotif = page.getByTestId('capability-motif-respond');
    for (let slide = 0; slide < 30 && !(await respondMotif.isVisible()); slide += 1) await next();
    assert.equal(await respondMotif.isVisible(), true);
    const tokyo = page.getByTestId('tokyo-duck-curve-case');
    for (let slide = 0; slide < 30 && !(await tokyo.isVisible()); slide += 1) await next();
    assert.equal(await tokyo.isVisible(), true);
    await assert.doesNotReject(() => tokyo.getByText('CURTAILMENT CONTEXT').waitFor());
    await assert.doesNotReject(() => tokyo.getByRole('img', { name: /duck curve/i }).waitFor());
    await page.mouse.move(700, 420);
    await page.mouse.down();
    await page.mouse.move(820, 420, { steps: 4 });
    await page.mouse.up();
    await next();
    await assert.doesNotReject(() => tokyo.getByText('ILLUSTRATIVE CHARGING').waitFor());
    await next();
    await assert.doesNotReject(() => tokyo.getByText('ILLUSTRATIVE DUSK SUPPORT').waitFor());
    assert.match(await tokyo.getByTestId('main-talk-source-footer').innerText(), /Source \[1\].*March 2026/);
    const frequencyCase = page.getByTestId('tokyo-frequency-response-case');
    for (let slide = 0; slide < 30 && !(await frequencyCase.isVisible()); slide += 1) await next();
    assert.equal(await frequencyCase.isVisible(), true);
    await assert.doesNotReject(() => frequencyCase.getByText('16 MAR · GENERATION LOST').waitFor());
    await assert.doesNotReject(() => frequencyCase.getByText('Hirono Thermal').waitFor());
    await assert.doesNotReject(() => frequencyCase.getByText('Haramachi Thermal').waitFor());
    await assert.doesNotReject(() => frequencyCase.getByText('Shin-Sendai Thermal').waitFor());
    await page.mouse.move(720, 400); await page.mouse.down(); await page.mouse.move(820, 400, { steps: 3 }); await page.mouse.up();
    await next(); await assert.doesNotReject(() => frequencyCase.getByText('22 MAR · COLD FRONT').waitFor());
    await next(); await assert.doesNotReject(() => frequencyCase.getByText('16:00 · WARNING ISSUED').waitFor());
    await next(); await assert.doesNotReject(() => frequencyCase.getByText('18:00–20:00 · HOLD THE LINE').waitFor());
    const cityGraph = page.getByTestId('tokyo-city-graph');
    await next(); assert.equal(await cityGraph.isVisible(), true);
    await assert.doesNotReject(() => cityGraph.getByText('TELEMETRY').waitFor());
    assert.equal(await cityGraph.getByTestId('tokyo-city-graph-pulse').isVisible(), true);
    assert.match(await cityGraph.innerText(), /TELEMETRY.*DISPATCH INTENT.*ACKNOWLEDGEMENT/s);
    assert.match(await cityGraph.getByTestId('main-talk-source-footer').innerText(), /Reuters.*22 Mar 2022/);
    const shizenCase = page.getByTestId('shizen-connect-case');
    for (let slide = 0; slide < 30 && !(await shizenCase.isVisible()); slide += 1) await next();
    assert.equal(await shizenCase.isVisible(), true);
    await assert.doesNotReject(() => shizenCase.getByText('186 HOUSEHOLD EVs VIA V2H').waitFor());
    await next();
    await assert.doesNotReject(() => shizenCase.getByText('COORDINATED CONTROL REQUEST').waitFor());
    await next();
    await assert.doesNotReject(() => shizenCase.getByText('PORTFOLIO STATE').waitFor());
    assert.match(await shizenCase.innerText(), /ILLUSTRATIVE CONTROL FLOW.*90% CONTROL ACCURACY · COMPANY-REPORTED/s);
    const caseNote = page.getByTestId('main-talk-case-note').filter({ hasText: '90% control accuracy' }).last();
    for (let slide = 0; slide < 30 && !(await caseNote.isVisible()); slide += 1) await next();
    assert.equal(await caseNote.isVisible(), true);
    assert.match(await caseNote.innerText(), /company-reported|demonstration scope/);
    const finalCount = page.getByText(/21\s*\/\s*21/);
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
