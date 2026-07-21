const { chromium } = require('playwright');

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
    await page.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
    if (!(await page.locator('body').innerText()).includes('The Energy Grid Is Becoming a Cloud Native Distributed System')) {
      throw new Error('The keynote title is not visible on the first slide.');
    }

    await page.getByTestId('opening-title-event').waitFor({ state: 'visible' });
    await advance(1);
    await page.getByTestId('opening-title-premise').waitFor({ state: 'visible' });
    await advance(1);
    await page.getByTestId('opening-title-presenter').waitFor({ state: 'visible' });

    await advance(1);
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
    await page.getByText('97% of Japan LNG transits this route', { exact: true }).waitFor({ state: 'visible' });
    const mapCanvas = page.getByTestId('japan-map-canvas');
    await mapCanvas.hover();
    await page.mouse.wheel(0, -360);
    if (await mapCanvas.getAttribute('data-interactive') !== 'true') {
      throw new Error('Expected the keynote map to accept direct exploration.');
    }

    await advance(2);
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
