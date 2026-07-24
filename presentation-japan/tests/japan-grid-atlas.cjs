const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');

async function main() {
  const data = await import('../src/data/japanGridAtlasData.mjs');
  const state = await import('../src/components/japanGridAtlasState.mjs');
  assert.deepEqual(data.ATLAS_LAYER_IDS, ['mix', 'plants', 'areas', 'transmission', 'demand', 'jepx']);
  assert.ok(data.ATLAS_SOURCES.every(({ url, licence, retrievedAt, scope }) => url && licence && retrievedAt && scope));
  assert.ok(data.ATLAS_FEATURES.areas.every(({ polygon }) => polygon.length >= 4));
  assert.ok(data.ATLAS_FEATURES.plants.length >= 30, 'atlas should show a useful cross-section of Japan\'s generation fleet');
  assert.deepEqual([...new Set(data.ATLAS_FEATURES.plants.map(({ fuel }) => fuel))].sort(), ['Coal', 'Geothermal', 'Hydro', 'LNG', 'Nuclear', 'Oil', 'Solar', 'Wind']);
  assert.ok(data.ATLAS_FEATURES.transmission.length >= 20, 'atlas should show national transmission corridors, not four illustrative paths');
  assert.ok(data.ATLAS_FEATURES.transmission.every(({ source }) => source), 'each transmission feature needs an attributable source');
  assert.deepEqual(
    state.resolveAtlasLayers({ preset: { areas: true, plants: false }, overrides: { plants: true } }),
    { mix: false, plants: true, areas: true, transmission: false, demand: false, jepx: false },
  );
  assert.equal(state.plantRadiusAtZoom(4.65, 10), 10);
  assert.equal(state.plantRadiusAtZoom(6.65, 10), 6);
  assert.equal(state.plantRadiusAtZoom(20, 10), 4);
  const source = await fs.readFile(path.join(__dirname, '../src/components/JapanGridAtlas.jsx'), 'utf8');
  const styles = await fs.readFile(path.join(__dirname, '../src/index.css'), 'utf8');
  assert.match(source, /data-testid="japan-grid-atlas"/);
  assert.match(source, /data-testid="japan-grid-atlas-hud"/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /controller=\{true\}/);
  assert.match(source, /MapGL/);
  assert.match(source, /FlyToInterpolator/);
  assert.match(source, /getTooltip/);
  assert.match(source, /PLANT_COLORS/);
  assert.match(source, /plantMarkerSize/);
  assert.match(source, /height = '100%'/);
  assert.match(styles, /body:has\(\[data-variant="washi"\]\)/);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
