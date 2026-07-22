# Japan Keynote Act 2 Cascade Network Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Act 2 cold-snap map into a full-bleed, interactive national cascade visualization with local and regional animated energy flows.

**Architecture:** Keep MapLibre as the controllable basemap and Deck.gl as its pointer-transparent overlay. Replace only the `scene === 'cold-snap'` branch with two independent, geographic TripsLayer datasets: local household distribution routes for close city keyframes and regional transmission routes for national keyframes. Preserve the existing Hormuz MaskExtension implementation unchanged.

**Tech Stack:** React 18, Spectacle, MapLibre GL, Deck.gl `TripsLayer`/`ScatterplotLayer`, Vite, Playwright, Node assert.

## Global Constraints

- Act 2 must fill the available 16:9 slide viewport rather than use a fixed 600px frame.
- Keep map pan, wheel zoom, rotate, and touch exploration enabled; ArrowLeft/ArrowRight stay under Spectacle control.
- All flow routes are geographic longitude/latitude coordinates, not screen positions.
- Act 2 must not use `MaskExtension`; Hormuz retains its existing geographic closure mask.
- Drive animated Deck layers through the existing ref/RAF mechanism, not React state on every frame.
- Do not commit or push unless the user explicitly authorizes it.

---

## File structure

- `presentation-japan/src/components/japanMapData.mjs` — declarative local-distribution and regional-transmission trip data plus stage-selection helpers.
- `presentation-japan/src/components/JapanMapLayers.jsx` — Act 2-only Deck.gl layer assembly and stable layer IDs.
- `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx` — viewport-filling container and updated overlay copy.
- `presentation-japan/src/Keynote.jsx` — remove the fixed Act 2 component height at the slide boundary.
- `presentation-japan/tests/japan-map-layers.cjs` — data invariants and source-level layer contract.
- `presentation-japan/tests/keynote-rendering.cjs` — visible full-bleed Act 2 regression coverage.

### Task 1: Define cascade flow data and prove its stage contract

**Files:**
- Modify: `presentation-japan/src/components/japanMapData.mjs:73-91`
- Test: `presentation-japan/tests/japan-map-layers.cjs:5-32`

**Consumes:** existing `COLD_SNAP_HOME_CLUSTERS` coordinate conventions and five `COLD_SNAP_CAMERA_KEYFRAMES`.

**Produces:** `COLD_SNAP_LOCAL_TRIPS`, `COLD_SNAP_REGIONAL_TRIPS`, and `getColdSnapTrips(stage)` returning `{ localTrips, regionalTrips }`.

- [ ] **Step 1: Write failing data-contract assertions**

  Add imports and assertions before changing production data:

  ```js
  COLD_SNAP_LOCAL_TRIPS,
  COLD_SNAP_REGIONAL_TRIPS,
  getColdSnapTrips,
  ```

  ```js
  assert.ok(COLD_SNAP_LOCAL_TRIPS.length >= 12, 'The close city scene needs a dense local distribution mesh.');
  assert.ok(COLD_SNAP_REGIONAL_TRIPS.length >= 6, 'The national scene needs a regional transmission spine.');
  assert.ok([...COLD_SNAP_LOCAL_TRIPS, ...COLD_SNAP_REGIONAL_TRIPS].every((trip) => trip.path.length >= 3 && trip.path.length === trip.timestamps.length), 'Cascade routes must have aligned 3D positions and timestamps.');
  assert.ok(COLD_SNAP_REGIONAL_TRIPS.every((trip) => Math.max(...trip.path.map(([, , altitude]) => altitude)) >= 10000), 'Regional transmission paths must rise above the map.');
  assert.deepEqual(getColdSnapTrips(1).regionalTrips, [], 'Regional flow must wait for the cascade step.');
  assert.ok(getColdSnapTrips(4).regionalTrips.length >= 6, 'The final keyframe must reveal the national cascade.');
  ```

- [ ] **Step 2: Verify the test fails**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: failure because the three cascade exports do not exist.

- [ ] **Step 3: Add data and stage selection**

  Add geographic trip records with `id`, `region`, `stage`, `path`, and `timestamps`. `path` is an array of `[longitude, latitude, altitudeMeters]`; `timestamps` is an equally sized array in the existing 0–3200 RAF time domain. Use 12+ short local routes centered around Tokyo/Kansai/Tohoku with 0–400m altitude, and at least six regional routes spanning the following directed links: Tokyo↔Tohoku, Tokyo↔Kansai, Kansai↔Chugoku, Chugoku↔Kyushu, Tohoku↔Hokkaido, and Kansai↔Shikoku, each cresting at 10,000–35,000m above its midpoint. Export this exact helper:

  ```js
  export const getColdSnapTrips = (stage) => ({
    localTrips: COLD_SNAP_LOCAL_TRIPS.filter((trip) => trip.stage <= Math.max(1, stage)),
    regionalTrips: COLD_SNAP_REGIONAL_TRIPS.filter((trip) => trip.stage <= Math.max(0, stage)),
  });
  ```

  Keep every timestamp from `0` to no more than `3200`, preserving the existing RAF loop's time domain.

- [ ] **Step 4: Verify the data contract passes**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: PASS.

### Task 2: Replace Act 2 masking with distinct local and regional TripsLayers

**Files:**
- Modify: `presentation-japan/src/components/JapanMapLayers.jsx:56-108`
- Test: `presentation-japan/tests/japan-map-layers.cjs:35-46`

**Consumes:** `getColdSnapTrips(stage)` from Task 1 and the existing `COLORS` token arrays.

**Produces:** stable `cold-snap-local-distribution`, `cold-snap-regional-transmission`, and `cold-snap-grid-hubs` layers.

- [ ] **Step 1: Write failing layer assertions**

  Replace the Act 2 mask assertions with:

  ```js
  assert.match(mapLayers, /id: 'cold-snap-local-distribution'/, 'The city view needs local energy paths.');
  assert.match(mapLayers, /id: 'cold-snap-regional-transmission'/, 'The national view needs transmission paths.');
  assert.match(mapLayers, /id: 'cold-snap-grid-hubs'/, 'The transmission paths need geographic hubs.');
  assert.doesNotMatch(mapLayers.match(/if \(scene === 'cold-snap'\)[\s\S]*?if \(scene === 'hormuz'\)/)?.[0] ?? '', /MaskExtension/, 'Act 2 must not mask grid flows.');
  ```

- [ ] **Step 2: Verify the test fails**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: failure because the replacement layer IDs are absent and the mask is still present.

- [ ] **Step 3: Implement the Act 2 layer branch**

  In the `cold-snap` branch, remove `demandMask`, `GeoJsonLayer`, `ScreenGridLayer`, and the masked `cold-snap-grid-trips` layer. Call `const { localTrips, regionalTrips } = mapData.getColdSnapTrips(coldSnapStage);` and return:

  ```js
  new TripsLayer({
    id: 'cold-snap-local-distribution', data: localTrips,
    getPath: (trip) => trip.path,
    getTimestamps: (trip) => trip.timestamps,
    getColor: COLORS.red, getWidth: 3, widthUnits: 'pixels',
    currentTime: tripTime, trailLength: 900, fadeTrail: true,
    capRounded: true, jointRounded: true,
  })
  ```

  Add a `cold-snap-regional-transmission` TripsLayer using `regionalTrips`, `getPath: (trip) => trip.path`, `getTimestamps: (trip) => trip.timestamps`, `COLORS.amber`, `getWidth: 7`, `trailLength: 2200`, and rounded caps/joints. The regional path positions retain their altitude values, creating elevated arcs in the pitched Deck.gl scene. Add a `cold-snap-grid-hubs` `ScatterplotLayer` derived from regional route endpoints, using meter-based radii and existing theme colors. Keep `cold-snap-homes` as the household anchor layer.

- [ ] **Step 4: Verify the layer contract passes**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: PASS.

### Task 3: Make Act 2 full-bleed and align overlay language with cascade behavior

**Files:**
- Modify: `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx:22-80`
- Modify: `presentation-japan/src/components/PatternSequence.jsx:21-27`
- Modify: `presentation-japan/src/Keynote.jsx:57`
- Test: `presentation-japan/tests/keynote-rendering.cjs:70-85`

**Consumes:** the same five step values and existing `JapanMapBackground` interactive handling.

**Produces:** a viewport-filling `act2-cold-snap-map`, with compact JEPX/demand overlays and cascade-aligned copy.

- [ ] **Step 1: Write the failing browser assertion**

  Immediately after waiting for `act2-cold-snap-map`, measure it:

  ```js
  const act2Bounds = await page.getByTestId('act2-cold-snap-map').evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  });
  if (act2Bounds.width < 1400 || act2Bounds.height < 760) {
    throw new Error(`Expected a full-bleed Act 2 map, received ${act2Bounds.width}×${act2Bounds.height}.`);
  }
  ```

- [ ] **Step 2: Verify the browser test fails**

  Ensure the Vite dev server is running on port 3100, then run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: failure reporting the current small Act 2 map height.

- [ ] **Step 3: Implement the full-bleed map composition**

  Change `JapanColdSnapMapAnimated` and `PatternSequence` to default `height = '100%'`; remove the fixed `height={550}` prop from `Keynote`; and make the outer container use `minHeight: '100%'` while retaining `width: '100%'`, relative positioning, and clipped overflow. This follows the existing `JapanOpeningSequence` full-slide composition. Do not alter `JapanMapBackground` interactivity or DeckGL pointer-event behavior.

  Change the demand-card eyebrow from `DEMAND MASK ACTIVE` to `DEMAND CASCADE ACTIVE`. Keep the chart right sidecar but reduce its width only if it overlaps the full-bleed title on a 1440px viewport; retain the current test IDs.

- [ ] **Step 4: Verify presentation rendering and interaction**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: PASS, including Act 2 full-bleed bounds, JEPX sidecar, demand card, and route marker.

### Task 4: Complete visual and production verification

**Files:**
- Test: `presentation-japan/tests/japan-map-layers.cjs`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Consumes:** Tasks 1-3.

**Produces:** evidence that the feature builds, tests, and visually maintains the intended presenter sequence.

- [ ] **Step 1: Run the focused data/layer regression**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: PASS.

- [ ] **Step 2: Run the browser regression**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: PASS.

- [ ] **Step 3: Build the production bundle**

  Run: `cd presentation-japan && rtk npm run build`

  Expected: Vite exits with code 0 and produces `dist/` without build errors.

- [ ] **Step 4: Take one visual inspection screenshot**

  Navigate to Act 2 at 1440×900, advance through the final cascade keyframe, and save a screenshot to `/tmp/japan-keynote-act2-cascade.png`. Confirm that the map fills the canvas; red local trails read at city scale; amber regional trails read at national scale; and the JEPX sidecar remains legible.
