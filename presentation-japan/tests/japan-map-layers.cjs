const assert = require('node:assert/strict');
const fs = require('node:fs/promises');

(async () => {
  const {
    HORMUZ_COORDINATE,
    HORMUZ_CAMERA_SEQUENCE,
    HORMUZ_STORY_KEYFRAMES,
    JAPAN_LNG_COORDINATES,
    LNG_TRIP_PATHS,
    LNG_ROUTE,
    getRoutePosition,
  } = await import('../src/components/japanMapData.mjs');

  assert.deepEqual(HORMUZ_COORDINATE, [56.3, 26.6]);
  assert.ok(JAPAN_LNG_COORDINATES.every(([longitude, latitude]) => longitude > 120 && latitude > 25));
  assert.deepEqual(getRoutePosition(LNG_ROUTE, 0), HORMUZ_COORDINATE);
  assert.deepEqual(getRoutePosition(LNG_ROUTE, 1), [138.25, 36.2]);
  assert.ok(HORMUZ_CAMERA_SEQUENCE.toHormuz >= 2500, 'Hormuz camera arrival should be deliberate.');
  assert.ok(HORMUZ_CAMERA_SEQUENCE.hold >= 1500, 'Hormuz context should have time to land.');
  assert.ok(HORMUZ_CAMERA_SEQUENCE.toJapan >= 9000, 'The route return should read as a journey.');
  assert.equal(HORMUZ_STORY_KEYFRAMES.length, 4, 'The story needs a stop for each callout plus Japan.');
  assert.ok(HORMUZ_STORY_KEYFRAMES.every((keyframe) => keyframe.callout), 'Each camera stop needs a callout.');
  assert.ok(LNG_TRIP_PATHS.every((trip) => trip.path.length >= 3), 'Each LNG trip needs an animatable path.');

  const mapLayers = await fs.readFile(require.resolve('../src/components/JapanMapLayers.jsx'), 'utf8');
  assert.match(mapLayers, /TripsLayer/, 'The Hormuz journey needs an animated trip layer.');
  assert.match(mapLayers, /ScreenGridLayer/, 'The sea lane needs a density layer.');
  assert.match(mapLayers, /MaskExtension/, 'The closure zone needs a geographic mask.');
  assert.match(mapLayers, /id: 'lng-trips'/, 'The LNG trip layer needs a stable id.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
