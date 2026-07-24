const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const keynoteUrl = process.env.KEYNOTE_URL || 'http://localhost:3100/';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const advance = async (count) => {
    for (let index = 0; index < count; index += 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(280);
    }
  };

  try {
    const keynote = fs.readFileSync(path.join(__dirname, '../src/Keynote.jsx'), 'utf8');
    const japanGridMap = fs.readFileSync(path.join(__dirname, '../src/components/JapanGridMapAnimated.jsx'), 'utf8');
    const coldSnapMap = fs.readFileSync(path.join(__dirname, '../src/components/JapanColdSnapMapAnimated.jsx'), 'utf8');
    const gridAtlas = fs.readFileSync(path.join(__dirname, '../src/components/JapanGridAtlas.jsx'), 'utf8');
    assert.match(keynote, /<JapanGridAtlas[^>]*preset={keynoteAtlasPreset}/);
    assert(keynote.indexOf('<JapanGridAtlas') < keynote.indexOf('<JapanEnergyOrigins'));
    assert((keynote.match(/<JapanGridAtlas/g) || []).length >= 3);
    assert.match(keynote, /data-testid="hormuz-scene"/);
    assert.match(keynote, /data-testid="grid-pressure-scene"/);
    assert.doesNotMatch(keynote, /JapanOpeningSequence/);
    assert.doesNotMatch(keynote, /PatternSequence/);
    assert.doesNotMatch(keynote, /function HormuzOverlay/);
    assert.doesNotMatch(keynote, /function GridPressureOverlay/);
    assert.match(gridAtlas, /const isSlideActive = slideContext\?\.isSlideActive \?\? true/);
    assert.match(gridAtlas, /\{isSlideActive && <DeckGL/);
    assert.match(keynote, /JapanEnergyOrigins/);
    assert.match(keynote, /keynote-washi-premise/);
    assert.doesNotMatch(keynote, /startAtMap/);
    assert.match(keynote, /StepBridge count=\{4\}/);
    assert.match(keynote, /keynoteAtlasPreset/);
    assert.match(keynote, /new Set\(\[2, 4, 5, 6\]\)/);
    assert.match(coldSnapMap, /Grid pressure/);
    assert.match(keynote, /100K DEVICES/);
    assert.doesNotMatch(keynote, /97% of Japan LNG transits this route/);
    assert.doesNotMatch(japanGridMap, /97% of Japan LNG transits this route/);
    await page.goto(keynoteUrl, { waitUntil: 'networkidle' });
    // Spectacle registers key navigation after the deck's initial transition settles.
    await page.waitForTimeout(1800);
    if (!(await page.locator('body').innerText()).includes('The energy grid is becoming a cloud-native distributed system.')) {
      throw new Error('The keynote title is not visible on the first slide.');
    }

    await page.getByTestId('keynote-washi-premise').waitFor({ state: 'visible' });
    await page.getByText('KUBECON + CLOUDNATIVECON JAPAN · YOKOHAMA', { exact: true }).waitFor({ state: 'visible' });
    await advance(1);
    await page.getByTestId('japan-grid-atlas').first().waitFor({ state: 'visible' });
    await advance(4);
    await page.getByTestId('japan-energy-origins').waitFor({ state: 'visible' });
    await page.getByText("Japan's energy comes from far away.", { exact: true }).waitFor({ state: 'visible' });
    await page.getByTestId('energy-origin-route-lng').waitFor({ state: 'visible' });
    await advance(3);
    await page.getByTestId('energy-origin-route-oil').waitFor({ state: 'visible' });
    await page.getByTestId('energy-origin-route-coal').waitFor({ state: 'visible' });

    await advance(1);
    await page.getByTestId('hormuz-route').waitFor({ state: 'visible' });
    await page.getByText('Strait of Hormuz', { exact: true }).first().waitFor({ state: 'visible' });
    await page.getByText('Japan LNG terminals', { exact: true }).waitFor({ state: 'visible' });
    const hormuzScene = page.getByTestId('hormuz-scene');
    await hormuzScene.waitFor({ state: 'visible' });
    const hormuzTransmission = hormuzScene.getByRole('button', { name: 'Transmission' });
    await hormuzTransmission.click();
    assert.equal(await hormuzTransmission.getAttribute('aria-pressed'), 'true');
    await page.getByTestId('hormuz-context').waitFor({ state: 'visible' });
    const contextCards = page.getByTestId('hormuz-context-card');
    if (await contextCards.count() !== 1) {
      throw new Error('Expected one sequential Hormuz context card.');
    }
    await page.getByTestId('hormuz-callout-leader').waitFor({ state: 'visible' });
    await advance(4);
    const gridPressureScene = page.getByTestId('grid-pressure-scene');
    await gridPressureScene.waitFor({ state: 'visible' });
    const pressureTransmission = gridPressureScene.getByRole('button', { name: 'Transmission' });
    await pressureTransmission.click();
    assert.equal(await pressureTransmission.getAttribute('aria-pressed'), 'true');
    await page.getByTestId('grid-pressure-atlas').waitFor({ state: 'visible' });
    await page.getByText('Grid pressure', { exact: true }).waitFor({ state: 'visible' });
    await advance(1);
    await page.getByTestId('act2-jepx-sidecar').waitFor({ state: 'visible' });
    await page.getByText('25× spike', { exact: true }).waitFor({ state: 'visible' });
    await advance(2);
    await page.getByTestId('act2-demand-card').waitFor({ state: 'visible' });
    await page.getByTestId('act2-cold-snap-route').waitFor({ state: 'visible' });

    await advance(3);
    await page.getByTestId('vpp-transformation-sequence').waitFor({ state: 'visible' });
    await page.getByTestId('vpp-stage-pause').waitFor({ state: 'visible' });
    await page.getByText('The grid is a distributed system.', { exact: true }).waitFor({ state: 'visible' });

    await advance(1);
    await page.getByTestId('vpp-stage-graph').waitFor({ state: 'visible' });
    await page.getByText('You already know how to solve this.', { exact: true }).waitFor({ state: 'visible' });

    await advance(1);
    await page.getByTestId('vpp-stage-city').waitFor({ state: 'visible' });
    await page.getByTestId('vpp-hero-graph').waitFor({ state: 'visible' });
    await page.getByTestId('vpp-hero-city').waitFor({ state: 'visible' });
    await page.getByTestId('vpp-hero-load').waitFor({ state: 'visible' });

    await advance(1);
    const vppMap = page.getByTestId('vpp-japan-map');
    await vppMap.waitFor({ state: 'visible' });
    const vppBounds = await vppMap.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
    if (vppBounds.width < 1400 || vppBounds.height < 760) {
      throw new Error(`Expected full-bleed VPP map, received ${vppBounds.width}×${vppBounds.height}.`);
    }
    const vppCanvas = vppMap.getByTestId('japan-map-canvas');
    if (await vppCanvas.getAttribute('data-interactive') !== 'true') {
      throw new Error('Expected an interactive Japan VPP map.');
    }
    await vppCanvas.hover();
    await page.mouse.wheel(0, -320);

    await advance(1);
    await page.getByTestId('vpp-stage-vpp').waitFor({ state: 'visible' });
    for (const [id, copy] of [
      ['market', 'Bring new players into the market'],
      ['response', 'Respond when the system is tight'],
      ['demand', 'Use demand smarter'],
    ]) {
      const card = page.getByTestId(`vpp-capability-${id}`);
      await card.waitFor({ state: 'visible' });
      assert.equal(await card.getByText(copy, { exact: true }).innerText(), copy);
    }

    await advance(2);
    await page.getByText('100K DEVICES', { exact: true }).waitFor({ state: 'visible' });
    for (const name of ['Home', 'Solar panel', 'EV', 'Battery']) {
      await page.getByRole('img', { name }).waitFor({ state: 'visible' });
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
