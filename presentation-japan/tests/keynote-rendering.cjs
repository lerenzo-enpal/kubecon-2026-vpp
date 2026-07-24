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
    assert.match(keynote, /JapanGridAtlas/);
    assert.match(keynote, /JapanEnergyOrigins/);
    assert.match(keynote, /keynote-washi-premise/);
    assert.match(keynote, /startAtMap/);
    assert.match(keynote, /StepBridge count=\{4\}/);
    assert.match(keynote, /keynoteAtlasPreset/);
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
    await page.getByTestId('japan-energy-origins').waitFor({ state: 'visible' });
    await page.getByText("Japan's energy comes from far away.", { exact: true }).waitFor({ state: 'visible' });
    await page.getByTestId('energy-origin-route-lng').waitFor({ state: 'visible' });
    await advance(3);
    await page.getByTestId('energy-origin-route-oil').waitFor({ state: 'visible' });
    await page.getByTestId('energy-origin-route-coal').waitFor({ state: 'visible' });

    await advance(2);
    const mapBounds = await page.getByTestId('japan-opening-map').evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
    if (mapBounds.width < 1400 || mapBounds.height < 760) {
      throw new Error(`Expected a full-bleed map, received ${mapBounds.width}×${mapBounds.height}.`);
    }

    await page.getByTestId('japan-geographic-layers').waitFor({ state: 'visible' });
    const mapCanvasCount = await page.locator('[data-testid="japan-geographic-layers"] canvas').count();
    if (mapCanvasCount !== 1) {
      throw new Error('Expected one DeckGL geographic overlay canvas.');
    }

    await advance(5);
    await page.getByTestId('hormuz-route').waitFor({ state: 'visible' });
    await page.getByText('Strait of Hormuz', { exact: true }).first().waitFor({ state: 'visible' });
    await page.getByText('Japan LNG terminals', { exact: true }).waitFor({ state: 'visible' });
    await page.getByTestId('hormuz-context').waitFor({ state: 'visible' });
    const contextCards = page.getByTestId('hormuz-context-card');
    if (await contextCards.count() !== 1) {
      throw new Error('Expected one sequential Hormuz context card.');
    }
    await page.getByTestId('hormuz-callout-leader').waitFor({ state: 'visible' });
    await page.waitForTimeout(900);
    const cardOpacities = await contextCards.evaluateAll((cards) => cards.map((card) => Number.parseFloat(getComputedStyle(card.firstElementChild).opacity)));
    if (cardOpacities.some((opacity) => opacity < 0.96)) {
      throw new Error(`Expected fully visible Hormuz context cards, received opacities: ${cardOpacities.join(', ')}.`);
    }
    const mapCanvas = page.getByTestId('japan-opening-map').getByTestId('japan-map-canvas');
    await mapCanvas.hover();
    await page.mouse.wheel(0, -360);
    if (await mapCanvas.getAttribute('data-interactive') !== 'true') {
      throw new Error('Expected the keynote map to accept direct exploration.');
    }

    await advance(4);
    await page.getByTestId('japan-grid-atlas').waitFor({ state: 'visible' });
    const transmission = page.getByRole('button', { name: 'Transmission' });
    await transmission.click();
    if (await transmission.getAttribute('aria-pressed') !== 'true') throw new Error('Expected atlas controls to toggle transmission.');
    await advance(5);
    await page.getByTestId('act2-cold-snap-map').waitFor({ state: 'visible' });
    const act2Bounds = await page.getByTestId('act2-cold-snap-map').evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
    if (act2Bounds.width < 1400 || act2Bounds.height < 760) {
      throw new Error(`Expected a full-bleed Act 2 map, received ${act2Bounds.width}×${act2Bounds.height}.`);
    }
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
    await page.getByText('100K HOMES', { exact: true }).waitFor({ state: 'visible' });
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
