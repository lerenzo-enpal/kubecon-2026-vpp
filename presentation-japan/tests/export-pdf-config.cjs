const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');

const root = join(__dirname, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

assert.equal(pkg.scripts['export:pdf'], 'node scripts/export-pdf.cjs keynote');
assert.equal(pkg.scripts['export:pdf:main'], 'node scripts/export-pdf.cjs main');
assert.ok(existsSync(join(root, 'scripts', 'export-pdf.cjs')));

const exporter = readFileSync(join(root, 'scripts', 'export-pdf.cjs'), 'utf8');
assert.match(exporter, /slideNumber/);
assert.doesNotMatch(exporter, /Buffer\.compare\(screenshot, previous\)/);

console.log('PDF export commands configured');
