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
    COLD_SNAP_CITY_BUILDINGS,
    COLD_SNAP_DENSE_LOCAL_TRIPS,
    getColdSnapCityScene,
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
  assert.ok(COLD_SNAP_CAMERA_KEYFRAMES[2].camera.zoom >= 10, 'Tokyo must reach a street-scale camera position for the generated city to read.');
  assert.ok(COLD_SNAP_CAMERA_KEYFRAMES[3].camera.zoom >= 10, 'Kansai must retain the detailed city treatment.');
  assert.ok(COLD_SNAP_CITY_BUILDINGS.length >= 180, 'The cinematic city needs enough 3D massing to fill a city frame.');
  assert.ok(COLD_SNAP_CITY_BUILDINGS.every(({ polygon, height }) => polygon.length === 5 && polygon[0][0] === polygon.at(-1)[0] && polygon[0][1] === polygon.at(-1)[1] && height >= 18), 'Buildings must be closed, extrudable footprints.');
  assert.ok(COLD_SNAP_DENSE_LOCAL_TRIPS.length >= 140, 'Tokyo needs a visibly dense street-scale demand mesh.');
  assert.ok(COLD_SNAP_DENSE_LOCAL_TRIPS.every((trip) => trip.path.length === trip.timestamps.length && trip.path.length >= 3), 'Dense local flow paths need aligned TripsLayer timestamps.');
  const stageTwo = getColdSnapCityScene(2);
  const stageFour = getColdSnapCityScene(4);
  assert.ok(stageTwo.localTrips.every((trip) => trip.region === 'tokyo'), 'Tokyo must be the first dense city revealed.');
  assert.ok(stageFour.localTrips.length > stageTwo.localTrips.length, 'Later stages must expand beyond Tokyo.');
  assert.ok(stageTwo.hubs.length <= 4, 'City feeder origins must not be rendered as giant transmission hubs.');
  assert.deepEqual(getColdSnapCityScene(2), stageTwo, 'Scene selection must be deterministic.');

  const mapLayers = await fs.readFile(require.resolve('../src/components/JapanMapLayers.jsx'), 'utf8');
  const coldSnapMap = await fs.readFile(require.resolve('../src/components/JapanColdSnapMapAnimated.jsx'), 'utf8');
  const mapBackground = await fs.readFile(require.resolve('../src/components/JapanMapBackground.jsx'), 'utf8');
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
  assert.match(mapLayers, /PolygonLayer/, 'Act 2 needs extruded city building massing.');
  assert.match(mapLayers, /id: 'cold-snap-city-buildings'/, 'The city layer needs a stable id.');
  assert.match(mapLayers, /extruded: true/, 'Buildings must be rendered in 3D.');
  assert.match(mapLayers, /getElevation:/, 'Building height must derive from generated geometry.');
  assert.match(mapLayers, /getColdSnapCityScene/, 'The visible local layer must use the dense synthetic network.');
  assert.match(mapLayers, /COLORS\.cyan/, 'Baseline electricity flow must include cyan.');
  assert.match(mapLayers, /COLORS\.red/, 'Demand escalation must include red.');
  assert.match(mapLayers, /coldSnapStage >= 2 \? 1800 : 12000/, 'Grid hub markers must shrink at city scale.');
  assert.match(mapLayers, /coldSnapStage >= 2 \? 1100 : 21000/, 'Household markers must not wash out the city view.');
  assert.match(coldSnapMap, /variant="night"/, 'Act 2 must opt into the art-directed night basemap.');
  assert.match(mapBackground, /NIGHT_STYLE/, 'The map background must define an internal night style.');
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
