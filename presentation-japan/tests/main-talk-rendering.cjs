const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../src/MainTalk.jsx'), 'utf8');
assert.match(source, /const coreSlides = 26/);
assert.equal((source.match(/<Slide/g) || []).length, 26, 'deck has 26 core slides');
assert.match(source, /Japan needs flexibility\./);
assert.match(source, /DaylightFlexibilityScene/);
assert.match(source, /4 MAY 2025.*12:00/);
assert.match(source, /A city is a graph problem/);
assert.match(source, /SIMULATED DISPATCH/);
assert.match(source, /MainTalkSourceFooter/);
