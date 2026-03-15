#!/usr/bin/env node
/**
 * Export Spectacle presentation to PDF using Puppeteer.
 *
 * Usage:
 *   1. Start the dev server:  npm run dev
 *   2. Run this script:       node scripts/export-pdf.mjs [output.pdf]
 *
 * Requires: puppeteer (installed via decktape or directly)
 */

import puppeteer from 'puppeteer';
import { resolve } from 'path';

const PORT = process.env.PORT || 3000;
const URL = `http://localhost:${PORT}/?exportMode=true`;
const OUTPUT = resolve(process.argv[2] || '../presentation.pdf');

console.log(`Exporting ${URL} → ${OUTPUT}`);

const browser = await puppeteer.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080 });
await page.goto(URL, { waitUntil: 'networkidle0', timeout: 60000 });

// Give animations/canvas a moment to render
await new Promise(r => setTimeout(r, 3000));

await page.pdf({
  path: OUTPUT,
  width: '1920px',
  height: '1080px',
  printBackground: true,
  landscape: true,
  preferCSSPageSize: true,
});

console.log(`Done! Saved to ${OUTPUT}`);
await browser.close();
