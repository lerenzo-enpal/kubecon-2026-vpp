const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const data = await import('../src/data/japanGridAtlasData.mjs');
  const state = await import('../src/components/japanGridAtlasState.mjs');
  assert.deepEqual(data.ATLAS_LAYER_IDS, ['mix', 'plants', 'areas', 'transmission', 'demand', 'jepx']);
  assert.ok(data.ATLAS_SOURCES.every(({ url, licence, retrievedAt, scope }) => url && licence && retrievedAt && scope));
  assert.ok(data.ATLAS_FEATURES.areas.every(({ polygon }) => polygon.length >= 4));
  assert.deepEqual(
    state.resolveAtlasLayers({ preset: { areas: true, plants: false }, overrides: { plants: true } }),
    { mix: false, plants: true, areas: true, transmission: false, demand: false, jepx: false },
  );
  const source = await fs.readFile(path.join(__dirname, '../src/components/JapanGridAtlas.jsx'), 'utf8');
  assert.match(source, /data-testid="japan-grid-atlas"/);
  assert.match(source, /data-testid="japan-grid-atlas-hud"/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /controller=\{true\}/);
  assert.match(source, /MapGL/);
  assert.match(source, /FlyToInterpolator/);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
