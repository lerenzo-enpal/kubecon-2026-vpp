# Act 2 Art-Directed Tokyo-at-Night Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Act 2 cold-snap sequence into a deterministic, cinematic Tokyo-at-night network with generated 3D city massing, dense local demand flows, and expanded Japan-wide transmission links.

**Architecture:** `japanMapData.mjs` owns the seeded, geolocated visual datasets and stage selectors. `JapanMapLayers.jsx` renders those datasets with Deck.gl layers, while `JapanMapBackground.jsx` provides a deliberately subdued MapLibre geographic reference. `JapanColdSnapMapAnimated.jsx` continues to own slide-step camera choreography and animation time without React state in the RAF loop.

**Tech Stack:** React 18, Spectacle 10, MapLibre GL 5, Deck.gl 9 (`PolygonLayer`, `TripsLayer`, `PathLayer`, `ScatterplotLayer`), Node assert tests, Playwright, Vite.

## Global Constraints

- Keep every visual anchor at real longitude/latitude coordinates; generated buildings and streets are explicitly illustrative.
- Use an internally defined dark MapLibre style; do not add a satellite source, remote style dependency, or a tile subscription.
- Act 1 Hormuz layers and the existing `MaskExtension` behavior remain unchanged.
- Keep the map directly explorable with pointer gestures; arrow keys remain Spectacle navigation.
- Keep Deck.gl pointer-transparent and MapLibre keyboard-disabled.
- Do not call `setState` inside the animation RAF loop; update animated Deck layers through `deckRef`.
- Gate the RAF loop by `SlideContext.isSlideActive`.
- Generated geometry must be deterministic for the same source seed and stage.
- Preserve existing unrelated working-tree changes. Do not commit or push unless the user explicitly asks.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `presentation-japan/src/components/japanMapData.mjs` | Deterministic seeded city building footprints, local demand corridors, national paths, and `getColdSnapCityScene(stage)` selection. |
| `presentation-japan/src/components/JapanMapLayers.jsx` | Converts selected city and grid datasets into Deck.gl polygon, TripsLayer, path, and hub layers. |
| `presentation-japan/src/components/JapanMapBackground.jsx` | Owns a minimal inline night basemap style and accepts an `artDirected` variant. |
| `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx` | Opts Act 2 into the art-directed basemap and retains camera/animation/HUD behavior. |
| `presentation-japan/tests/japan-map-layers.cjs` | Validates deterministic source data and stable Act 2 layer contracts. |
| `presentation-japan/tests/keynote-rendering.cjs` | Validates full-bleed Act 2 rendering plus stage-visible city/network layer canvases. |

## Task 1: Add deterministic city and network datasets

**Files:**

- Modify: `presentation-japan/src/components/japanMapData.mjs`
- Test: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**

- Produces `COLD_SNAP_CITY_BUILDINGS`, an array of `{ id, region, polygon, height, demandStage }`, where `polygon` is a closed `[[longitude, latitude], ...]` ring and `height` is meters.
- Produces `COLD_SNAP_DENSE_LOCAL_TRIPS`, an array of `{ id, region, stage, path, timestamps }`, where path coordinates are `[longitude, latitude, altitude]` and `path.length === timestamps.length`.
- Produces `COLD_SNAP_REGIONAL_TRIPS`, retaining its current shape but growing to an expressive national spine.
- Produces `getColdSnapCityScene(stage)`, which returns `{ buildings, localTrips, regionalTrips, hubs }` using no randomness at call time.

- [ ] **Step 1: Write failing data-contract assertions**

Add imports and assertions in `presentation-japan/tests/japan-map-layers.cjs`:

```js
const {
  COLD_SNAP_CITY_BUILDINGS,
  COLD_SNAP_DENSE_LOCAL_TRIPS,
  getColdSnapCityScene,
} = await import('../src/components/japanMapData.mjs');

assert.ok(COLD_SNAP_CITY_BUILDINGS.length >= 180, 'The cinematic city needs enough 3D massing to fill a city frame.');
assert.ok(COLD_SNAP_CITY_BUILDINGS.every(({ polygon, height }) => polygon.length === 5 && polygon[0][0] === polygon.at(-1)[0] && polygon[0][1] === polygon.at(-1)[1] && height >= 18), 'Buildings must be closed, extrudable footprints.');
assert.ok(COLD_SNAP_DENSE_LOCAL_TRIPS.length >= 140, 'Tokyo needs a visibly dense street-scale demand mesh.');
assert.ok(COLD_SNAP_DENSE_LOCAL_TRIPS.every((trip) => trip.path.length === trip.timestamps.length && trip.path.length >= 3), 'Dense local flow paths need aligned TripsLayer timestamps.');

const stageTwo = getColdSnapCityScene(2);
const stageFour = getColdSnapCityScene(4);
assert.ok(stageTwo.localTrips.every((trip) => trip.region === 'tokyo'), 'Tokyo must be the first dense city revealed.');
assert.ok(stageFour.localTrips.length > stageTwo.localTrips.length, 'Later stages must expand beyond Tokyo.');
assert.deepEqual(getColdSnapCityScene(2), stageTwo, 'Scene selection must be deterministic.');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: FAIL because the new data exports do not exist.

- [ ] **Step 3: Implement deterministic geometry generators and stage selectors**

In `presentation-japan/src/components/japanMapData.mjs`, add a local seeded PRNG and fixed regional configurations. Keep the PRNG private and build every exported collection once at module evaluation:

```js
const createSeededRandom = (seed) => () => {
  let value = seed >>> 0;
  value = (value * 1664525 + 1013904223) >>> 0;
  seed = value;
  return value / 0x100000000;
};

const CITY_CONFIGS = [
  { region: 'tokyo', hub: TOKYO_GRID_HUB, stage: 2, seed: 2021, blocks: 132, spread: [0.34, 0.23] },
  { region: 'kansai', hub: KANSAI_GRID_HUB, stage: 3, seed: 2022, blocks: 64, spread: [0.26, 0.18] },
  { region: 'tohoku', hub: TOHOKU_GRID_HUB, stage: 4, seed: 2023, blocks: 42, spread: [0.22, 0.16] },
];

const squareFootprint = ([longitude, latitude], halfWidth, halfHeight) => [
  [longitude - halfWidth, latitude - halfHeight],
  [longitude + halfWidth, latitude - halfHeight],
  [longitude + halfWidth, latitude + halfHeight],
  [longitude - halfWidth, latitude + halfHeight],
  [longitude - halfWidth, latitude - halfHeight],
];
```

Generate buildings with higher heights nearer each config hub. Generate street-like trips in three families: a small warped orthogonal grid, rings, and radial feeders. Each trip must end at the city hub, use altitude `0`, and receive phase-shifted timestamps. Keep the existing hand-authored regional trips and add extra inter-region paths so the final stage shows at least ten links; their midpoint altitude must remain at least `10000` meters.

Finish with explicit selectors:

```js
export const getColdSnapCityScene = (stage) => {
  const activeStage = Math.max(0, stage);
  const buildings = COLD_SNAP_CITY_BUILDINGS.filter((building) => building.demandStage <= activeStage);
  const localTrips = COLD_SNAP_DENSE_LOCAL_TRIPS.filter((trip) => trip.stage <= activeStage);
  const regionalTrips = COLD_SNAP_REGIONAL_TRIPS.filter((trip) => trip.stage <= activeStage);
  return { buildings, localTrips, regionalTrips, hubs: getColdSnapHubs(regionalTrips, localTrips) };
};
```

Implement `getColdSnapHubs` as a local helper that deduplicates coordinate pairs using `Map`, retaining the current O(1) lookup pattern.

- [ ] **Step 4: Run the data tests to verify they pass**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: PASS with no output.

## Task 2: Render the authored city and expanded energy system

**Files:**

- Modify: `presentation-japan/src/components/JapanMapLayers.jsx`
- Modify: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**

- Consumes `getColdSnapCityScene(coldSnapStage)`.
- Produces Deck layer IDs `cold-snap-city-buildings`, `cold-snap-local-distribution`, `cold-snap-regional-transmission`, and `cold-snap-grid-hubs` for the cold-snap scene.
- Does not add `MaskExtension` to the cold-snap branch.

- [ ] **Step 1: Add failing layer-contract assertions**

Append to `presentation-japan/tests/japan-map-layers.cjs`:

```js
assert.match(mapLayers, /PolygonLayer/, 'Act 2 needs extruded city building massing.');
assert.match(mapLayers, /id: 'cold-snap-city-buildings'/, 'The city layer needs a stable id.');
assert.match(mapLayers, /extruded: true/, 'Buildings must be rendered in 3D.');
assert.match(mapLayers, /getElevation:/, 'Building height must derive from generated geometry.');
assert.match(mapLayers, /COLD_SNAP_DENSE_LOCAL_TRIPS|getColdSnapCityScene/, 'The visible local layer must use the dense synthetic network.');
assert.match(mapLayers, /getColor:.*COLORS\.cyan|COLORS\.cyan.*getColor/s, 'Baseline electricity flow must include cyan.');
assert.match(mapLayers, /getColor:.*COLORS\.red|COLORS\.red.*getColor/s, 'Demand escalation must include red.');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: FAIL because the cold-snap branch has no `PolygonLayer` or `cold-snap-city-buildings` layer.

- [ ] **Step 3: Implement 3D building, dense local-flow, and regional-flow layers**

Update the import in `JapanMapLayers.jsx` to include `PolygonLayer`. In the `scene === 'cold-snap'` branch, replace direct calls to `getColdSnapTrips` with:

```js
const { buildings, localTrips, regionalTrips, hubs } = mapData.getColdSnapCityScene(coldSnapStage);
const isEscalating = coldSnapStage >= 3;
```

Place the building layer first so it reads behind all movement:

```js
new PolygonLayer({
  id: 'cold-snap-city-buildings',
  data: buildings,
  getPolygon: ({ polygon }) => polygon,
  getElevation: ({ height }) => height,
  getFillColor: ({ demandStage }) => demandStage <= coldSnapStage ? [19, 28, 45, 230] : [10, 15, 25, 180],
  getLineColor: [45, 58, 80, 180],
  getLineWidth: 1,
  lineWidthUnits: 'pixels',
  extruded: true,
  wireframe: true,
  material: { ambient: 0.45, diffuse: 0.65, shininess: 24, specularColor: [20, 40, 65] },
  pickable: false,
});
```

Render two local `TripsLayer` passes from the same dense data: a low-alpha cyan baseline underneath, then a narrower red demand pulse. Keep `widthUnits: 'pixels'`, `trailLength` around 900–1300, rounded caps/joints, and `currentTime: tripTime`. Apply the red layer only to the active-stage paths. Render regional transmission with cyan at stage 2 and amber/red emphasis from stage 3 onward; preserve 3D input paths and a longer trail. Keep hub scatterplot points bright but smaller than the current 28 km radius when in city zoom so they do not cover the skyline.

Do not alter the `hormuz` branch.

- [ ] **Step 4: Run the layer data tests to verify they pass**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: PASS with no output.

## Task 3: Add the internal night basemap variant and activate it for Act 2

**Files:**

- Modify: `presentation-japan/src/components/JapanMapBackground.jsx`
- Modify: `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx`
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**

- `JapanMapBackground` accepts `variant = 'default' | 'night'` (default remains existing behavior).
- `JapanColdSnapMapAnimated` supplies `variant="night"`.
- Existing `onMapReady(map)` behavior and direct map interactions remain unchanged.

- [ ] **Step 1: Add failing browser and source assertions**

In `presentation-japan/tests/keynote-rendering.cjs`, after the existing Act 2 full-bleed bounds test, add:

```js
const act2Canvas = page.getByTestId('act2-cold-snap-map').getByTestId('japan-map-canvas');
if (await act2Canvas.getAttribute('data-interactive') !== 'true') {
  throw new Error('Expected the Act 2 city map to remain explorable.');
}
await advance(1);
await page.getByTestId('act2-jepx-sidecar').waitFor({ state: 'visible' });
await advance(1);
const deckCanvasCount = await page.getByTestId('act2-cold-snap-map').locator('canvas').count();
if (deckCanvasCount < 2) {
  throw new Error('Expected separate MapLibre and Deck.gl canvases for the art-directed city scene.');
}
```

Also add a source check in `japan-map-layers.cjs` that `JapanColdSnapMapAnimated.jsx` passes `variant="night"` and `JapanMapBackground.jsx` contains an inline `NIGHT_STYLE` reference.

- [ ] **Step 2: Run the tests to verify the new source assertion fails**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: FAIL because the night-map variant has not been added.

- [ ] **Step 3: Implement the night style without external imagery or style fetches**

In `JapanMapBackground.jsx`, define a module-level MapLibre style object before the component:

```js
const NIGHT_STYLE = {
  version: 8,
  sources: {},
  layers: [
    { id: 'night-background', type: 'background', paint: { 'background-color': '#050814' } },
  ],
};
```

Add `variant = 'default'` to the component props. Choose `NIGHT_STYLE` for `variant === 'night'`; retain the current default style for all other consumers. Include `variant` in the effect dependency list. Do not change `interactive`, gesture options, keyboard disablement, or map-ready callback behavior.

In `JapanColdSnapMapAnimated.jsx`, call:

```jsx
<JapanMapBackground variant="night" opacity={1} onMapReady={handleMapReady} interactive />
```

This lets the Deck.gl architecture and energy paths be the only meaningful detail rather than competing with a map product. The simple background layer gives the map camera a geographic plane while leaving coast/detail deliberately abstract.

- [ ] **Step 4: Run source, browser, and build verification**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: PASS with no output.

Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

Expected: PASS with no output. The map must be at least `1400×760` in a `1440×900` viewport and still be interactive.

Run: `cd presentation-japan && rtk npm run build`

Expected: exit code 0.

## Task 4: Visual regression and keynote readability pass

**Files:**

- Modify only if visual defects are found: `presentation-japan/src/components/JapanMapLayers.jsx`, `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx`, or `presentation-japan/src/components/japanMapData.mjs`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**

- Consumes the stable layer IDs and test IDs created in Tasks 1–3.
- Produces a readable Act 2 presentation sequence without changing its slide count or step contract.

- [ ] **Step 1: Capture one representative visual regression screenshot**

Run from `presentation-japan` with the Vite server already available on port 3100:

```bash
node -e "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('http://localhost:3100/',{waitUntil:'networkidle'});for(let i=0;i<14;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(300)}await p.screenshot({path:'/tmp/japan-keynote-act2-tokyo-night.png'});await b.close()})().catch(e=>{console.error(e);process.exit(1)})"
```

Expected: a screenshot at `/tmp/japan-keynote-act2-tokyo-night.png` showing the full-bleed dark city, dense animated path trails, and unobscured HUD content.

- [ ] **Step 2: Inspect the screenshot and make only targeted visual corrections if needed**

Use the image viewer. Correct only concrete defects:

- If buildings obscure the routes, lower building opacity or line brightness—not route width below visible keynote scale.
- If the map reads flat, increase city-frame pitch to 56–60 degrees and preserve building heights.
- If the city has empty areas, increase the deterministic block count or local path count for that region.
- If the JEPX card is obscured, lower only the layers under its screen region by reducing non-essential skyline fill; keep card z-index unchanged.

- [ ] **Step 3: Re-run final verification after any correction**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs && rtk node tests/keynote-rendering.cjs && rtk npm run build`

Expected: all commands exit with code 0.

## Spec Coverage Review

- Dark, minimal geographic reference: Task 3.
- Deterministic procedural buildings: Task 1 and Task 2.
- Dense local feeders with staged waves: Task 1 and Task 2.
- Elevated regional paths with escalating colour: Task 1 and Task 2.
- HUD, presenter steps, interaction, and RAF constraints: Tasks 2 and 3 preserve the existing component contracts; Task 4 verifies the rendered scene.
- Tests, full-bleed layout, and build: Tasks 1–4.
