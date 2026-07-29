#!/usr/bin/env node
const { chromium } = require('playwright');
const { PDFDocument } = require('pdf-lib');
const { existsSync, readdirSync, writeFileSync } = require('node:fs');
const { join, resolve } = require('node:path');

const variants = {
  keynote: { path: '/', name: 'japan-keynote', slides: 7 },
  main: { path: '/main-talk.html', name: 'japan-main-talk', slides: 16 },
};
const variant = variants[process.argv[2] || 'keynote'];

if (!variant) throw new Error('Usage: node scripts/export-pdf.cjs <keynote|main>');

const port = process.env.PORT || 3100;
const pause = Number(process.env.PAUSE || 3) * 1000;
// Hard safety cap — even a step-heavy deck should not need this many captures.
const maxSlides = Number(process.env.MAX_SLIDES || 200);
const outputDir = resolve(__dirname, '../..');
const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
const pattern = new RegExp(`^${date}_${variant.name}_v(\\d{3})\\.pdf$`);
const version = 1 + Math.max(0, ...readdirSync(outputDir).flatMap((file) => Number(file.match(pattern)?.[1]) || []));
const output = join(outputDir, `${date}_${variant.name}_v${String(version).padStart(3, '0')}.pdf`);
const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const started = Date.now();
const fmt = (ms) => {
  const s = Math.round(ms / 1000);
  return `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`;
};

(async () => {
  console.log(`[export] variant=${process.argv[2] || 'keynote'} expected=${variant.slides} slides url=http://localhost:${port}${variant.path}`);
  console.log(`[export] pause=${pause}ms per page · safety cap=${maxSlides} captures · output=${output}`);
  const browser = await chromium.launch({
    headless: true,
    ...(existsSync(chrome) ? { executablePath: chrome } : {}),
  });
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
  const screenshots = [];
  // Detect "N / M" generically so a mismatch in expected count still terminates.
  const slideNumber = async () => {
    const text = await page.locator('body').innerText();
    const match = text.match(/(\d+)\s*\/\s*(\d+)\b/);
    return match ? { current: Number(match[1]), total: Number(match[2]) } : null;
  };

  try {
    await page.goto(`http://localhost:${port}${variant.path}`, { waitUntil: 'networkidle', timeout: 60_000 });
    let unparsedStreak = 0;
    let sameStateStreak = 0;
    let lastReportedTotal = null;
    // Once we reach the final slide, its useSteps cycle changes the DOM on
    // every ArrowRight — so state-equality alone won't detect completion.
    // Track states seen on the final slide; a repeat means the step cycle
    // has wrapped and we're done.
    // On the final slide, cap consecutive captures. Covers both cases:
    //   - stepped slides (useSteps) → captures each step, then bails
    //   - animated slides (twinkling houses) → DOM keeps changing but
    //     slide counter is pinned, so we stop after the cap.
    // Set high enough for the longest StepBridge in either deck.
    const finalSlideMaxCaptures = 12;
    let onLastStreak = 0;
    for (let pageNumber = 1; pageNumber <= maxSlides; pageNumber += 1) {
      await page.waitForTimeout(pause);
      const screenshot = await page.screenshot({ type: 'png' });
      screenshots.push(screenshot);
      const parsed = await slideNumber();
      const state = await page.locator('body').innerHTML();

      if (parsed) {
        unparsedStreak = 0;
        if (parsed.total !== lastReportedTotal) {
          if (lastReportedTotal !== null && parsed.total !== variant.slides) {
            console.log(`[export] ⚠ detected total=${parsed.total} differs from configured ${variant.slides} — using detected value`);
          }
          lastReportedTotal = parsed.total;
        }
        process.stdout.write(`  [${fmt(Date.now() - started)}] page ${pageNumber} captured · slide ${parsed.current}/${parsed.total}\n`);
      } else {
        unparsedStreak += 1;
        process.stdout.write(`  [${fmt(Date.now() - started)}] page ${pageNumber} captured · slide ?/? (counter not found, streak=${unparsedStreak})\n`);
        if (unparsedStreak >= 5) {
          console.log(`[export] ⚠ slide counter unparseable for ${unparsedStreak} captures in a row — aborting to avoid runaway.`);
          break;
        }
      }

      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(100);
      const nextState = await page.locator('body').innerHTML();

      const total = parsed?.total ?? variant.slides;
      const onLast = parsed ? parsed.current >= total : false;

      if (onLast) {
        onLastStreak += 1;
        if (onLastStreak >= finalSlideMaxCaptures) {
          console.log(`[export] ✓ captured final slide ${parsed.current}/${total} for ${onLastStreak} frames — done.`);
          break;
        }
      } else {
        onLastStreak = 0;
      }

      if (state === nextState) {
        sameStateStreak += 1;
        if (onLast) {
          console.log(`[export] ✓ reached final slide ${parsed.current}/${total} — done.`);
          break;
        }
        if (sameStateStreak >= 3) {
          console.log(`[export] ⚠ page state unchanged for ${sameStateStreak} advances — aborting (likely stuck at slide ${parsed?.current ?? '?'}/${total}).`);
          break;
        }
      } else {
        sameStateStreak = 0;
      }
    }

    if (screenshots.length >= maxSlides) {
      console.log(`[export] ⚠ hit safety cap of ${maxSlides} captures without natural termination — bailing.`);
    }

    console.log(`[export] assembling PDF from ${screenshots.length} pages…`);
    const pdf = await PDFDocument.create();
    for (const screenshot of screenshots) {
      const image = await pdf.embedPng(screenshot);
      const page = pdf.addPage([image.width, image.height]);
      page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
    }
    writeFileSync(output, await pdf.save());
    console.log(`[export] ✓ exported ${screenshots.length} pages in ${fmt(Date.now() - started)} → ${output}`);
  } finally {
    await browser.close();
  }
})();
