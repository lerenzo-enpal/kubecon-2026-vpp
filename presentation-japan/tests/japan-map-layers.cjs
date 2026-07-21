const assert = require('node:assert/strict');

(async () => {
  const {
    HORMUZ_COORDINATE,
    JAPAN_LNG_COORDINATES,
    LNG_ROUTE,
    getRoutePosition,
  } = await import('../src/components/japanMapData.mjs');

  assert.deepEqual(HORMUZ_COORDINATE, [56.3, 26.6]);
  assert.ok(JAPAN_LNG_COORDINATES.every(([longitude, latitude]) => longitude > 120 && latitude > 25));
  assert.deepEqual(getRoutePosition(LNG_ROUTE, 0), HORMUZ_COORDINATE);
  assert.deepEqual(getRoutePosition(LNG_ROUTE, 1), [138.25, 36.2]);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
