#!/usr/bin/env node
const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');
const { existsSync, readdirSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const variants = {
  keynote: { path: '/', name: 'japan-keynote', slides: 7 },
  main: { path: '/main-talk.html', name: 'japan-main-talk', slides: 21 },
};
const variant = variants[process.argv[2] || 'keynote'];

if (!variant) throw new Error('Usage: node scripts/export-pdf.cjs <keynote|main>');

const port = process.env.PORT || 3100;
const pause = Number(process.env.PAUSE || 3) * 1000;
const maxSlides = Number(process.env.MAX_SLIDES || 0);
const outputDir = resolve(__dirname, '../..');
const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
const pattern = new RegExp(`^${date}_${variant.name}_v(\\d{3})\\.pdf$`);
const version = 1 + Math.max(0, ...readdirSync(outputDir).flatMap((file) => Number(file.match(pattern)?.[1]) || []));
const output = join(outputDir, `${date}_${variant.name}_v${String(version).padStart(3, '0')}.pdf`);
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(existsSync(chrome) ? { executablePath: chrome } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const screenshots = [];
  const slideNumber = async () => {
    const text = await page.locator('body').innerText();
    return Number(text.match(new RegExp(`(\\d+)\\s*/\\s*${variant.slides}\\b`))?.[1]);
  };

  try {
    await page.goto(`http://localhost:${port}${variant.path}`, { waitUntil: 'networkidle', timeout: 60_000 });
    for (let pageNumber = 1; !maxSlides || pageNumber <= maxSlides; pageNumber += 1) {
      await page.waitForTimeout(pause);
      const screenshot = await page.screenshot({ type: 'png' });
      screenshots.push(screenshot);
      process.stdout.write(`  page ${pageNumber} captured\n`);
      const current = await slideNumber();
      const state = await page.locator('body').innerHTML();
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      if (current >= variant.slides && state === await page.locator('body').innerHTML()) break;
    }

    const pdf = await PDFDocument.create();
    for (const screenshot of screenshots) {
      const image = await pdf.embedPng(screenshot);
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    writeFileSync(output, await pdf.save());
    console.log(`Exported ${screenshots.length} slides → ${output}`);
  } finally {
    await browser.close();
  }
})();
