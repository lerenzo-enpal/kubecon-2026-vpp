/**
 * Basic build verification — checks that expected pages were generated
 * and contain key content markers. Run via `npm test`.
 */
import { readFileSync, existsSync, readdirSync } from 'fs';
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
check('Landing has conference talk promo', pageContains('index.html', 'Conference Talk'));
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

// Incident pages exist
const incidents = [
  '2003-italy-blackout', '2003-northeast-us-blackout', '2006-european-grid-split',
  '2016-south-australia-blackout', '2017-hornsdale-battery-response', '2017-south-australia-heatwave',
  '2021-european-grid-split', '2021-texas-ercot-winter-storm', '2024-dunkelflaute-germany',
  '2025-berlin-johannisthal-arson', '2025-iberian-peninsula-blackout', '2026-berlin-teltow-canal-arson',
];
for (const slug of incidents) {
  check(`Incident: ${slug}`, pageExists(`research/incidents/${slug}/index.html`));
}

// Topic pages exist
const topics = [
  'cascading-failures', 'demand-response', 'electricity-pricing', 'enpal-flexa',
  'german-grid-curtailment', 'grid-flexibility-costs', 'grid-frequency', 'vpp-market',
];
for (const slug of topics) {
  check(`Topic: ${slug}`, pageExists(`research/topics/${slug}/index.html`));
}

// Basics section
check('Basics index page exists', pageExists('basics/index.html'));
check('How Electricity Works page exists', pageExists('basics/how-electricity-works/index.html'));
check('Supply and Demand page exists', pageExists('basics/supply-and-demand/index.html'));
check('How Batteries Work page exists', pageExists('basics/how-batteries-work/index.html'));
check('Beyond Lithium-Ion page exists', pageExists('basics/beyond-lithium-ion/index.html'));

// Sidebar TOC
check('Sidebar nav present', pageContains('learn/how-the-grid-works/index.html', 'toc-section'));

// Navigation
check('Slides link on landing', pageContains('index.html', '/slides/'));
check('Slides link on content pages', pageContains('learn/how-the-grid-works/index.html', '/slides/'));
check('Enpal logo on landing', pageContains('index.html', 'enpal-logo'));

// Design tokens — fonts are self-hosted via @fontsource, bundled as woff2 into _astro/
check('Fonts loaded', readdirSync(resolve(dist, '_astro')).some(f => f.startsWith('jetbrains-mono') || f.startsWith('inter-')));

// No broken internal links (spot check key cross-references)
check('Grid page links to frequency topic', pageContains('learn/how-the-grid-works/index.html', '/research/topics/grid-frequency'));
check('Old way links to curtailment topic', pageContains('learn/the-old-way/index.html', '/research/topics/german-grid-curtailment'));
check('VPP page links to Flexa topic', pageContains('learn/the-virtual-power-plant/index.html', '/research/topics/enpal-flexa'));
check('Texas page links to cascading failures', pageContains('research/incidents/2021-texas-ercot-winter-storm/index.html', '/research/topics/cascading-failures'));

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}\n`);
process.exit(failures > 0 ? 1 : 0);
