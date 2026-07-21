const assert = require('node:assert/strict');

(async () => {
  const {
    HORMUZ_COORDINATE,
    HORMUZ_CAMERA_SEQUENCE,
    JAPAN_LNG_COORDINATES,
    LNG_ROUTE,
    getRoutePosition,
  } = await import('../src/components/japanMapData.mjs');

  assert.deepEqual(HORMUZ_COORDINATE, [56.3, 26.6]);
  assert.ok(JAPAN_LNG_COORDINATES.every(([longitude, latitude]) => longitude > 120 && latitude > 25));
  assert.deepEqual(getRoutePosition(LNG_ROUTE, 0), HORMUZ_COORDINATE);
  assert.deepEqual(getRoutePosition(LNG_ROUTE, 1), [138.25, 36.2]);
  assert.ok(HORMUZ_CAMERA_SEQUENCE.toHormuz >= 2500, 'Hormuz camera arrival should be deliberate.');
  assert.ok(HORMUZ_CAMERA_SEQUENCE.hold >= 1500, 'Hormuz context should have time to land.');
  assert.ok(HORMUZ_CAMERA_SEQUENCE.toJapan >= 4500, 'The route return should read as a journey.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
