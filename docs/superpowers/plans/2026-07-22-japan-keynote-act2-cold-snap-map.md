# Japan Keynote Act 2 Cold-Snap Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static Act 2 pattern slides with a single interactive 3D Japan map sequence that connects the 2021 JEPX 25× price spike to a present-day cold-snap increase in residential demand.

**Architecture:** `PatternSequence` becomes a thin `StepBridge` wrapper around a dedicated `JapanColdSnapMapAnimated` scene. The scene uses the established MapLibre base map and Deck.gl layer factory, with geospatial home clusters, demand masks, grid-flow trips, scripted camera keyframes, and the existing JEPX SVG chart held in a right-side panel.

**Tech Stack:** React 18, Spectacle, MapLibre GL JS, Deck.gl (`ScatterplotLayer`, `TripsLayer`, `ScreenGridLayer`, `MaskExtension`), Anime.js, Node assertions, Playwright, Vite.

## Global Constraints

- Keep the five-minute deck at five slides; replace redundant Act 2 static steps instead of adding a slide.
- All homes, masks, routes, anchors, and camera targets use `[longitude, latitude]`; never screen-coordinate geographic art.
- The scene is presenter-led: arrow keys navigate Spectacle keyframes; MapLibre keyboard controls remain disabled.
- Pointer drag, wheel zoom, rotation, and touch exploration work in both Act 1 and Act 2; the following arrow-key step returns to its scripted camera keyframe.
- Preserve full-bleed maps, `StepBridge`, high-contrast panels, and the existing MapLibre + Deck.gl dependency set.
- Gate animation with `SlideContext.isSlideActive`; do not put React `setState` inside an RAF loop.
- Do not commit or push without explicit user permission.

---

### Task 1: Add deterministic cold-snap geospatial data and Deck.gl layers

**Files:**

- Modify: `presentation-japan/src/components/japanMapData.mjs`
- Modify: `presentation-japan/src/components/JapanMapLayers.jsx`
- Modify: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**

- Consumes: `getJapanMapLayers({ scene, routeProgress, gridPulse, tripTime, disruptionRatio })` and the existing `COLORS` palette.
- Produces: `COLD_SNAP_HOME_CLUSTERS`, `COLD_SNAP_GRID_TRIPS`, `COLD_SNAP_CAMERA_KEYFRAMES`, and `getJapanMapLayers({ scene: 'cold-snap', coldSnapStage, tripTime })`.

- [ ] **Step 1: Write the failing data-and-layer test.**

  Add these assertions to `presentation-japan/tests/japan-map-layers.cjs` before changing production code:

  ```js
  const {
    COLD_SNAP_HOME_CLUSTERS,
    COLD_SNAP_GRID_TRIPS,
    COLD_SNAP_CAMERA_KEYFRAMES,
  } = await import('../src/components/japanMapData.mjs');

  assert.equal(COLD_SNAP_HOME_CLUSTERS.length, 3);
  assert.ok(COLD_SNAP_HOME_CLUSTERS.every(({ position }) => position[0] > 130 && position[0] < 145 && position[1] > 30 && position[1] < 45));
  assert.equal(COLD_SNAP_GRID_TRIPS.length, 3);
  assert.equal(COLD_SNAP_CAMERA_KEYFRAMES.length, 5);

  const coldSnapLayers = getJapanMapLayers({ scene: 'cold-snap', coldSnapStage: 3, tripTime: 1600 });
  assert.ok(coldSnapLayers.some((layer) => layer.id === 'cold-snap-homes'));
  assert.ok(coldSnapLayers.some((layer) => layer.id === 'cold-snap-demand-mask'));
  assert.ok(coldSnapLayers.some((layer) => layer.id === 'cold-snap-grid-trips'));
  ```

- [ ] **Step 2: Run the test to verify it fails for the missing exports.**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: FAIL with `COLD_SNAP_HOME_CLUSTERS` undefined or missing `cold-snap-*` layer IDs.

- [ ] **Step 3: Add the curated geography and camera keyframes.**

  Append the following curated presentation data to `presentation-japan/src/components/japanMapData.mjs`:

  ```js
  export const COLD_SNAP_HOME_CLUSTERS = [
    { id: 'tokyo', name: 'Tokyo homes', position: [139.76, 35.68], demand: 1.0 },
    { id: 'kansai', name: 'Kansai homes', position: [135.5, 34.69], demand: 0.72 },
    { id: 'tohoku', name: 'Tohoku homes', position: [140.87, 38.27], demand: 0.58 },
  ];

  export const COLD_SNAP_GRID_TRIPS = [
    { id: 'tokyo-tohoku', path: [[135.5, 34.69, 0], [139.76, 35.68, 1200], [140.87, 38.27, 2400]] },
    { id: 'kansai-to-tokyo', path: [[132.46, 34.39, 0], [135.5, 34.69, 1000], [139.76, 35.68, 2200]] },
    { id: 'hokkaido-tohoku', path: [[141.35, 43.06, 0], [140.87, 38.27, 1600], [139.76, 35.68, 3000]] },
  ];

  export const COLD_SNAP_CAMERA_KEYFRAMES = [
    { id: 'historical', camera: { center: [138.25, 36.2], zoom: 4.25, bearing: 12, pitch: 40 }, anchor: [139.76, 35.68] },
    { id: 'jepx', camera: { center: [138.25, 36.2], zoom: 4.25, bearing: 12, pitch: 40 }, anchor: [139.76, 35.68] },
    { id: 'tokyo', camera: { center: [139.76, 35.68], zoom: 6.15, bearing: 24, pitch: 52 }, anchor: [139.76, 35.68] },
    { id: 'kansai', camera: { center: [135.5, 34.69], zoom: 5.95, bearing: 20, pitch: 50 }, anchor: [135.5, 34.69] },
    { id: 'tohoku', camera: { center: [140.87, 38.27], zoom: 5.7, bearing: 18, pitch: 48 }, anchor: [140.87, 38.27] },
  ];
  ```

  Add a `scene === 'cold-snap'` branch at the top of `getJapanMapLayers` using a `GeoJsonLayer` mask, `ScatterplotLayer` homes, `TripsLayer` grid flow, and `ScreenGridLayer` density:

  ```js
  if (scene === 'cold-snap') {
    const visibleClusters = mapData.COLD_SNAP_HOME_CLUSTERS.slice(0, Math.max(1, coldSnapStage - 1));
    const maskFeatures = visibleClusters.map(({ id, position, demand }) => ({
      type: 'Feature', properties: { id, demand },
      geometry: { type: 'Point', coordinates: position },
    }));
    return [
      new GeoJsonLayer({ id: 'cold-snap-demand-mask', data: { type: 'FeatureCollection', features: maskFeatures }, operation: 'mask', pointType: 'circle', getPointRadius: 85000, pointRadiusUnits: 'meters', getFillColor: [255, 255, 255, 255] }),
      new ScreenGridLayer({ id: 'cold-snap-demand-density', data: visibleClusters.flatMap(({ position, demand }) => Array.from({ length: Math.round(demand * 12) }, () => ({ position }))), getPosition: ({ position }) => position, cellSizePixels: 54, colorRange: [[239, 68, 68, 0], [239, 68, 68, 65], [239, 68, 68, 170]], opacity: 0.58 }),
      new ScatterplotLayer({ id: 'cold-snap-homes', data: visibleClusters, getPosition: ({ position }) => position, getRadius: 21000, radiusUnits: 'meters', getFillColor: [241, 245, 249, 240], getLineColor: COLORS.red, lineWidthMinPixels: 2, stroked: true }),
      new TripsLayer({ id: 'cold-snap-grid-trips', data: mapData.COLD_SNAP_GRID_TRIPS, getPath: ({ path }) => path.map(([longitude, latitude]) => [longitude, latitude]), getTimestamps: ({ path }) => path.map(([, , timestamp]) => timestamp), getColor: COLORS.amber, getWidth: 4, widthUnits: 'pixels', currentTime: tripTime, trailLength: 1800, fadeTrail: true, extensions: [new MaskExtension()], maskId: 'cold-snap-demand-mask', maskInverted: false }),
    ];
  }
  ```

- [ ] **Step 4: Run the layer test to verify it passes.**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: exit code 0.

- [ ] **Step 5: Do not commit yet.**

  Keep the change uncommitted until the user explicitly asks to commit.

### Task 2: Build the dedicated Act 2 map-and-chart scene

**Files:**

- Create: `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx`
- Modify: `presentation-japan/src/components/PatternSequence.jsx`
- Modify: `presentation-japan/src/components/JEPXPriceChart.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**

- Consumes: `COLD_SNAP_CAMERA_KEYFRAMES`, `getJapanMapLayers`, `JapanMapBackground`, `JEPXPriceChart`, `ExplanationBox`, and `SlideContext`.
- Produces: `<JapanColdSnapMapAnimated height={number} step={number} testId="act2-cold-snap-map" />` and test IDs `act2-cold-snap-map`, `act2-jepx-sidecar`, `act2-demand-card`, and `act2-cold-snap-route`.

- [ ] **Step 1: Write the failing keynote rendering checks.**

  In `presentation-japan/tests/keynote-rendering.cjs`, append the following immediately after the existing assertion that the Pattern heading is visible:

  ```js
  await page.getByTestId('act2-cold-snap-map').waitFor({ state: 'visible' });
  await advance(1);
  await page.getByTestId('act2-jepx-sidecar').waitFor({ state: 'visible' });
  await page.getByText('25× spike', { exact: true }).waitFor({ state: 'visible' });
  await advance(2);
  await page.getByTestId('act2-demand-card').waitFor({ state: 'visible' });
  await page.getByTestId('act2-cold-snap-route').waitFor({ state: 'visible' });
  ```

- [ ] **Step 2: Run the browser test to verify it fails because Act 2 IDs are absent.**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: FAIL waiting for `act2-cold-snap-map`.

- [ ] **Step 3: Implement `JapanColdSnapMapAnimated`.**

  The component owns its map choreography. Use refs for `tripTime` and the Deck.gl instance; use state only for the active step, leader projection, and view state. Its central effect must reset the map to the matching scripted keyframe whenever `step` changes:

  ```jsx
  useEffect(() => {
    const map = mapRef.current;
    const keyframe = mapData.COLD_SNAP_CAMERA_KEYFRAMES[step];
    if (!map || !keyframe) return;
    map.easeTo({ ...keyframe.camera, duration: step <= 1 ? 0 : 3600, essential: true });
    setActiveStep(step);
  }, [step]);

  useEffect(() => {
    if (!isActive) return undefined;
    let frame;
    const tick = (now) => {
      tripTimeRef.current = now % 3200;
      deckRef.current?.deck?.setProps({ layers: getJapanMapLayers({ scene: 'cold-snap', coldSnapStage: activeStep, tripTime: tripTimeRef.current }) });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeStep, isActive]);
  ```

  Render the full viewport with a pointer-transparent Deck overlay above an interactive map, then add a right-side `JEPXPriceChart` for `step >= 1` and one geographic-context `ExplanationBox` at a time for `step >= 2`:

  ```jsx
  <div data-testid={testId} style={{ height, width: '100%', position: 'relative', overflow: 'hidden' }}>
    <JapanMapBackground opacity={0.72} onMapReady={handleMapReady} interactive />
    <DeckGL ref={deckRef} layers={layers} viewState={viewState} controller={false} style={{ pointerEvents: 'none' }} />
    {step >= 1 && <aside data-testid="act2-jepx-sidecar"><JEPXPriceChart height={242} compact /></aside>}
    {step >= 2 && <DemandContextOverlay step={step} map={mapRef.current} />}
    {step >= 2 && <div data-testid="act2-cold-snap-route" className="sr-only">Cold-snap grid flow</div>}
  </div>
  ```

  Add `compact = false` to the `JEPXPriceChart` signature and use it only to reduce padding and type sizes for the sidecar; preserve the `25× spike` annotation and its existing full-size behavior.

- [ ] **Step 4: Replace the static PatternSequence branches with the new scene.**

  Change `PatternSequence` to keep the same five Spectacle steps while delegating the visual scene:

  ```jsx
  import JapanColdSnapMapAnimated from './JapanColdSnapMapAnimated.jsx';

  const PatternSequence = ({ height = 600 }) => (
    <StepBridge count={5}>
      {(step) => <JapanColdSnapMapAnimated height={height} step={step} testId="act2-cold-snap-map" />}
    </StepBridge>
  );
  ```

  Preserve the Act 2 speaker notes in `presentation-japan/src/Keynote.jsx`; update them only if the visual pacing requires concise map cues.

- [ ] **Step 5: Run the browser test to verify it passes.**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: exit code 0 after the historical sidecar and cold-snap card are observed.

- [ ] **Step 6: Do not commit yet.**

  Keep the change uncommitted until the user explicitly asks to commit.

### Task 3: Make both Act 1 and Act 2 genuinely explorable without stealing arrow keys

**Files:**

- Modify: `presentation-japan/src/components/JapanMapBackground.jsx`
- Modify: `presentation-japan/src/components/JapanGridMapAnimated.jsx`
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**

- Consumes: `interactive` on `JapanMapBackground` and existing `data-testid="japan-map-canvas"`.
- Produces: map canvases accepting pointer/wheel/touch interaction when `interactive` is true while keeping `keyboard: false`.

- [ ] **Step 1: Write the failing interaction regression.**

  Add this helper and assertions to `presentation-japan/tests/keynote-rendering.cjs`:

  ```js
  const mapAcceptsPointerInteraction = async (testId) => page.getByTestId(testId).evaluate((element) => getComputedStyle(element).pointerEvents);

  assert.equal(await mapAcceptsPointerInteraction('japan-map-canvas'), 'auto');
  await page.getByTestId('japan-map-canvas').hover();
  await page.mouse.wheel(0, -360);
  ```

  Execute the assertion once during Act 1 and once after Act 2 becomes visible.

- [ ] **Step 2: Run the browser regression to verify it fails on the current pointer-event block.**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: FAIL because the map canvas computes to `pointer-events: none`.

- [ ] **Step 3: Make the MapLibre canvas interactive only when requested.**

  In `JapanMapBackground.jsx`, replace the fixed style with this conditional value while keeping `keyboard: false` in MapLibre options:

  ```jsx
  pointerEvents: interactive ? 'auto' : 'none',
  ```

  In `JapanGridMapAnimated.jsx` and `JapanColdSnapMapAnimated.jsx`, keep every Deck.gl canvas and card overlay `pointerEvents: 'none'` except explicit controls. This passes pointer, wheel, drag, and touch gestures through to MapLibre while retaining Spectacle's arrow-key ownership.

- [ ] **Step 4: Run the browser regression to verify both scenes are explorable.**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: exit code 0; Act 1 and Act 2 each report `pointer-events: auto` for the MapLibre canvas and remain navigable by arrow key.

- [ ] **Step 5: Do not commit yet.**

  Keep the change uncommitted until the user explicitly asks to commit.

### Task 4: Build and visually verify the complete Act 1 + Act 2 flow

**Files:**

- Verify: `presentation-japan/tests/japan-map-layers.cjs`
- Verify: `presentation-japan/tests/keynote-rendering.cjs`
- Verify: `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx`

**Interfaces:**

- Consumes: completed deterministic layer tests, presentation rendering test, Vite build, and local dev server at port 3100.
- Produces: verified production build and one temporary Act 2 inspection capture outside the repository.

- [ ] **Step 1: Run the complete deterministic verification suite.**

  Run:

  ```bash
  cd presentation-japan
  rtk node tests/japan-map-layers.cjs
  rtk node tests/keynote-rendering.cjs
  rtk npm run build
  ```

  Expected: all commands exit code 0.

- [ ] **Step 2: Capture Act 2 after the present-day demand mask activates.**

  Run the existing local dev server, then use the current Chrome Playwright setup to advance through Act 1 and into Act 2. Wait for both `act2-jepx-sidecar` and `act2-demand-card`, then save only:

  ```js
  await page.getByTestId('act2-demand-card').waitFor({ state: 'visible' });
  await page.screenshot({ path: '/tmp/japan-keynote-act2-cold-snap.png', fullPage: true });
  ```

  Expected: the full-bleed Japan map, active red demand mask, one contextual card, and the visible 25× chart sidecar share the scene.

- [ ] **Step 3: Inspect the temporary capture and fix only verified presentation defects.**

  Confirm that the chart panel is readable, the map remains the dominant visual, no overlay obstructs pointer exploration, and the active demand mask is visibly anchored to a Japan home cluster. Keep `/tmp/japan-keynote-act2-cold-snap.png` out of version control.

- [ ] **Step 4: Do not commit or push.**

  Report the verification evidence and wait for explicit user direction before any Git integration action.

## Plan self-review

- **Spec coverage:** Task 1 covers geographic data, mask, density, homes, and flow layers. Task 2 covers the single Act 2 narrative, JEPX sidecar, camera sequence, and test IDs. Task 3 covers interactive exploration for both Acts while preserving arrow-key navigation. Task 4 covers build and visual verification.
- **Placeholder scan:** No `TBD`, `TODO`, deferred implementation, or unspecified test steps remain.
- **Interface consistency:** `COLD_SNAP_HOME_CLUSTERS`, `COLD_SNAP_GRID_TRIPS`, `COLD_SNAP_CAMERA_KEYFRAMES`, and all `act2-*` test IDs use the same names across data, component, and test tasks.
