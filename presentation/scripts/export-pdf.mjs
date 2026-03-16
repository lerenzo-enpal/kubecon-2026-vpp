#!/usr/bin/env node
/**
 * Export Spectacle presentation to PDF using Playwright.
 * Navigates slide-by-slide in presentation mode, screenshots each, combines into PDF.
 *
 * Output is auto-versioned: vpp-presentation_v001.pdf, _v002.pdf, etc.
 * Existing versions are detected and the next version is used automatically.
 *
 * Usage:
 *   1. Start the dev server:  npm run dev
 *   2. Run this script:       node scripts/export-pdf.mjs
 *
 * Environment:
 *   PORT=3000        Dev server port (default 3000)
 *   MAX_SLIDES=0     Limit to first N slides (default: all)
 *   PAUSE=4          Seconds to wait per slide (default: 4)
 */

import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';
import { writeFileSync, readdirSync } from 'fs';
import { resolve, basename, dirname, join } from 'path';

const PORT = process.env.PORT || 3000;
const MAX_SLIDES = parseInt(process.env.MAX_SLIDES || '0');
const PAUSE = parseInt(process.env.PAUSE || '3') * 1000;
const URL = `http://localhost:${PORT}/`;

// ── Auto-versioned output path ──────────────────────────────
const BASE_NAME = 'vpp-presentation';
const OUT_DIR = resolve(import.meta.dirname, '../..');

function nextVersion() {
  const files = readdirSync(OUT_DIR);
  const pattern = new RegExp(`^20260324_${BASE_NAME}_v(\\d{3})\\.pdf$`);
  let max = 0;
  for (const f of files) {
    const m = f.match(pattern);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return max + 1;
}

const ver = nextVersion();
const verStr = String(ver).padStart(3, '0');
const OUTPUT = join(OUT_DIR, `20260324_${BASE_NAME}_v${verStr}.pdf`);

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
  const pg = pdf.addPage([img.width, img.height]);
  pg.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
}

const pdfBytes = await pdf.save();
writeFileSync(OUTPUT, pdfBytes);

console.log(`Done! ${screenshots.length} slides → ${OUTPUT} (v${verStr})`);
await browser.close();
