/**
 * Basic build verification — checks that expected pages were generated
 * and contain key content markers. Run via `npm test`.
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dist = resolve(__dirname, '..', 'dist');

let failures = 0;

function check(description, condition) {
  if (condition) {
    console.log(`  PASS  ${description}`);
  } else {
    console.log(`  FAIL  ${description}`);
    failures++;
  }
}

function pageExists(path) {
  return existsSync(resolve(dist, path));
}

function pageContains(path, text) {
  if (!pageExists(path)) return false;
  const html = readFileSync(resolve(dist, path), 'utf-8');
  return html.includes(text);
}

console.log('\nBuild check\n');

// All pages exist
check('Landing page exists', pageExists('index.html'));
check('Module 1 exists', pageExists('learn/how-the-grid-works/index.html'));
check('Module 2 exists', pageExists('learn/the-old-way/index.html'));
check('Module 3 exists', pageExists('learn/the-renewable-revolution/index.html'));
check('Module 4 exists', pageExists('learn/the-virtual-power-plant/index.html'));
check('Module 5 exists', pageExists('learn/the-future/index.html'));
check('Research page exists', pageExists('research/index.html'));
check('About page exists', pageExists('about/index.html'));

// Landing page
check('Landing has title', pageContains('index.html', 'How does the electricity grid'));
check('Landing has game placeholder', pageContains('index.html', 'Try to Crash the Grid'));
check('Landing has theme toggle', pageContains('index.html', 'theme-toggle'));

// Module content spot checks
check('Module 1: 50 Hz', pageContains('learn/how-the-grid-works/index.html', '50 Hz'));
check('Module 2: Peaker', pageContains('learn/the-old-way/index.html', 'Peaker'));
check('Module 3: Duck Curve', pageContains('learn/the-renewable-revolution/index.html', 'Duck Curve'));
check('Module 4: VPP', pageContains('learn/the-virtual-power-plant/index.html', 'Virtual Power Plant'));
check('Module 5: Future', pageContains('learn/the-future/index.html', 'Distributed'));

// Research library
check('Research has incidents', pageContains('research/index.html', 'Texas ERCOT'));
check('Research has topics', pageContains('research/index.html', 'Deep Dives'));

// Sidebar TOC
check('Sidebar nav present', pageContains('learn/how-the-grid-works/index.html', 'toc-section'));

// Design tokens
check('Fonts loaded', pageContains('index.html', 'JetBrains Mono'));

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}\n`);
process.exit(failures > 0 ? 1 : 0);
