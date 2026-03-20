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

// Pages exist
check('Landing page exists', pageExists('index.html'));
check('Module 1 exists', pageExists('learn/how-the-grid-works/index.html'));

// Landing page content
check('Landing page has title', pageContains('index.html', 'How does the electricity grid'));
check('Landing page has module links', pageContains('index.html', 'How the Grid Works'));
check('Landing page has game placeholder', pageContains('index.html', 'Try to Crash the Grid'));

// Module 1 content
check('Module 1 has heading', pageContains('learn/how-the-grid-works/index.html', 'How the Grid Works'));
check('Module 1 has 50 Hz section', pageContains('learn/how-the-grid-works/index.html', '50 Hz'));
check('Module 1 has frequency steps', pageContains('learn/how-the-grid-works/index.html', '47.5 Hz'));
check('Module 1 has sidebar nav', pageContains('learn/how-the-grid-works/index.html', 'The Old Way'));

// Design tokens
check('Global CSS loaded', pageContains('index.html', 'JetBrains Mono'));

console.log(`\n${failures === 0 ? 'All checks passed.' : `${failures} check(s) failed.`}\n`);
process.exit(failures > 0 ? 1 : 0);
