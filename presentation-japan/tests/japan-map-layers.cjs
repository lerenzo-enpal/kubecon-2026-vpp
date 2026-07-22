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
    COLD_SNAP_HOME_CLUSTERS,
    COLD_SNAP_LOCAL_TRIPS,
    COLD_SNAP_REGIONAL_TRIPS,
    COLD_SNAP_CAMERA_KEYFRAMES,
    getColdSnapTrips,
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
  assert.equal(COLD_SNAP_HOME_CLUSTERS.length, 3, 'The cold snap needs three regional household clusters.');
  assert.ok(COLD_SNAP_HOME_CLUSTERS.every(({ position }) => position[0] > 130 && position[0] < 145 && position[1] > 30 && position[1] < 45), 'Cold-snap homes must be positioned in Japan.');
  assert.ok(COLD_SNAP_LOCAL_TRIPS.length >= 12, 'The close city scene needs a dense local distribution mesh.');
  assert.ok(COLD_SNAP_REGIONAL_TRIPS.length >= 6, 'The national scene needs a regional transmission spine.');
  assert.ok([...COLD_SNAP_LOCAL_TRIPS, ...COLD_SNAP_REGIONAL_TRIPS].every((trip) => trip.path.length >= 3 && trip.path.length === trip.timestamps.length), 'Cascade routes must have aligned 3D positions and timestamps.');
  assert.ok(COLD_SNAP_REGIONAL_TRIPS.every((trip) => Math.max(...trip.path.map(([, , altitude]) => altitude)) >= 10000), 'Regional transmission paths must rise above the map.');
  assert.deepEqual(getColdSnapTrips(1).regionalTrips, [], 'Regional flow must wait for the cascade step.');
  assert.ok(getColdSnapTrips(4).regionalTrips.length >= 6, 'The final keyframe must reveal the national cascade.');
  assert.equal(COLD_SNAP_CAMERA_KEYFRAMES.length, 5, 'The cold-snap narrative needs five presenter keyframes.');

  const mapLayers = await fs.readFile(require.resolve('../src/components/JapanMapLayers.jsx'), 'utf8');
  assert.match(mapLayers, /TripsLayer/, 'The Hormuz journey needs an animated trip layer.');
  assert.match(mapLayers, /ScreenGridLayer/, 'The sea lane needs a density layer.');
  assert.match(mapLayers, /MaskExtension/, 'The closure zone needs a geographic mask.');
  assert.match(mapLayers, /id: 'lng-trips'/, 'The LNG trip layer needs a stable id.');
  assert.match(mapLayers, /scene === 'cold-snap'/, 'The cold-snap story needs a dedicated geographic layer scene.');
  assert.match(mapLayers, /id: 'cold-snap-homes'/, 'The cold-snap scene needs geolocated household markers.');
  assert.match(mapLayers, /id: 'cold-snap-local-distribution'/, 'The city view needs local energy paths.');
  assert.match(mapLayers, /id: 'cold-snap-regional-transmission'/, 'The national view needs transmission paths.');
  assert.match(mapLayers, /id: 'cold-snap-grid-hubs'/, 'The transmission paths need geographic hubs.');
  assert.doesNotMatch(mapLayers.match(/if \(scene === 'cold-snap'\)[\s\S]*?if \(scene === 'hormuz'\)/)?.[0] ?? '', /MaskExtension/, 'Act 2 must not mask grid flows.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
