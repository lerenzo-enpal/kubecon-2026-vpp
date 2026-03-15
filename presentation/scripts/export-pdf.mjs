#!/usr/bin/env node
/**
 * Export Spectacle presentation to PDF using Playwright.
 * Navigates slide-by-slide in presentation mode, screenshots each, combines into PDF.
 *
 * Usage:
 *   1. Start the dev server:  npm run dev
 *   2. Run this script:       node scripts/export-pdf.mjs [output.pdf]
 *
 * Environment:
 *   PORT=3000        Dev server port (default 3000)
 *   MAX_SLIDES=0     Limit to first N slides (default: all)
 *   PAUSE=4          Seconds to wait per slide (default: 4)
 */

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const PORT = process.env.PORT || 3000;
const MAX_SLIDES = parseInt(process.env.MAX_SLIDES || '0');
const PAUSE = parseInt(process.env.PAUSE || '3') * 1000;
const URL = `http://localhost:${PORT}/`;
const OUTPUT = resolve(process.argv[2] || '../20260324-vpp-presentation.pdf');

console.log(`Exporting ${URL} → ${OUTPUT}`);
if (MAX_SLIDES) console.log(`Limiting to first ${MAX_SLIDES} slides`);

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });

await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(PAUSE); // let first slide render

const screenshots = [];
let slideNum = 0;
let prevShot = null;

while (true) {
  slideNum++;
  if (MAX_SLIDES && slideNum > MAX_SLIDES) break;

  // Wait for animations
  await page.waitForTimeout(PAUSE);

  const shot = await page.screenshot({ type: 'png' });

  // Detect end: if screenshot is identical to previous, we've looped
  if (prevShot && Buffer.compare(shot, prevShot) === 0) {
    console.log(`  slide ${slideNum} identical to previous — done`);
    break;
  }

  screenshots.push(shot);
  console.log(`  slide ${slideNum} captured`);
  prevShot = shot;

  // Advance to next slide
  await page.keyboard.press('ArrowRight');
}

console.log(`Captured ${screenshots.length} slides, building PDF…`);

// Combine into PDF
const pdf = await PDFDocument.create();
for (const shot of screenshots) {
  const img = await pdf.embedPng(shot);
  const page = pdf.addPage([img.width, img.height]);
  page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
}

const pdfBytes = await pdf.save();
writeFileSync(OUTPUT, pdfBytes);

console.log(`Done! ${screenshots.length} slides → ${OUTPUT}`);
await browser.close();
