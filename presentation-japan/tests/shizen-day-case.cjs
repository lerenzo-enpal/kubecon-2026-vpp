const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../src/components/ShizenDayCase.jsx'), 'utf8');
assert.match(source, /const SCENES = \[/);
assert.match(source, /12:00/);
assert.match(source, /17:00/);
assert.match(source, /main-talk-source-footer/);
assert.match(source, /isSlideActive/);
assert.match(source, /Number\.isInteger\(step\) \? step : 0/);
