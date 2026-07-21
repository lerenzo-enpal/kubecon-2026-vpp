# Japan Hormuz 3D Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the keynote opening into an explorable, 3D presenter-led Hormuz-to-Japan story with sequential callouts, geographically meaningful flow layers, and visible title beats.

**Architecture:** Keep MapLibre as the basemap and camera owner, while Deck.gl renders all story layers from longitude/latitude. A declarative keyframe model controls camera targets, callout visibility, connector anchors, and the LNG disruption timeline. Arrow keys continue to advance Spectacle keyframes; direct pointer, wheel, and touch interactions are passed through to MapLibre.

**Tech Stack:** React 18, Spectacle, MapLibre GL, Deck.gl (`PathLayer`, `ScatterplotLayer`, `TextLayer`, `ArcLayer`, `TripsLayer`, `ScreenGridLayer`, `MaskExtension`), Anime.js, Playwright, Node assertions.

## Global Constraints

- Preserve the full-bleed opening map and `StepBridge`’s zero-based step normalization.
- No Kepler.gl or dashboard controls; use the current MapLibre + Deck.gl dependencies.
- Use `MapGL` if `react-map-gl/maplibre` is imported; this plan does not require it.
- All map marks and callout anchors use longitude/latitude, not screen coordinates.
- The map is user-explorable only through pointer, wheel, touch, and map keyboard controls; ArrowLeft/ArrowRight remain presenter controls.
- Do not call React `setState` on every animation frame.
- Do not commit or push unless the user explicitly asks.

---

### Task 1: Define the opening keyframes and flow data

**Files:**
- Modify: `presentation-japan/src/components/japanMapData.mjs`
- Test: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**
- Produces `HORMUZ_STORY_KEYFRAMES`, `LNG_TRIP_PATHS`, and `getStoryCameraPosition(keyframeIndex, progress)` for the map component.
- Produces camera duration constants covering each callout stop and the slow sea route.

- [x] **Step 1: Write the failing test**

```js
assert.equal(HORMUZ_STORY_KEYFRAMES.length, 4);
assert.ok(HORMUZ_STORY_KEYFRAMES.every((keyframe) => keyframe.callout));
assert.ok(HORMUZ_CAMERA_SEQUENCE.toJapan >= 9000);
assert.ok(LNG_TRIP_PATHS.every((trip) => trip.path.length >= 3));
```

- [x] **Step 2: Run test to verify it fails**

Run: `rtk node tests/japan-map-layers.cjs`

Expected: FAIL because the story keyframes and trip paths are absent.

- [x] **Step 3: Write minimal implementation**

```js
export const HORMUZ_STORY_KEYFRAMES = [
  { id: 'hormuz', camera: HORMUZ_CAMERA, callout: 'route-risk', hold: 2200 },
  { id: 'household', camera: GULF_CAMERA, callout: 'household-impact', hold: 2200 },
  { id: 'dependency', camera: INDIAN_OCEAN_CAMERA, callout: 'dependency', hold: 2200 },
  { id: 'japan', camera: JAPAN_CAMERA, callout: 'japan-grid', hold: 0 },
];
```

Represent every trip point as `[longitude, latitude, timestamp]`, and make the return journey at least 9 seconds long.

- [x] **Step 4: Run test to verify it passes**

Run: `rtk node tests/japan-map-layers.cjs`

Expected: PASS.

### Task 2: Render 3D terrain-like map layers and disruption flow

**Files:**
- Modify: `presentation-japan/src/components/JapanMapLayers.jsx`
- Test: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**
- Consumes `getJapanMapLayers({ scene, routeProgress, gridPulse, tripTime, disruptionRatio })`.
- Produces semantic Deck layer ids: `lng-trips`, `lng-congestion-grid`, `hormuz-mask`, and `japan-grid-flow`.

- [ ] **Step 1: Write the failing test**

```js
const source = await fs.promises.readFile('src/components/JapanMapLayers.jsx', 'utf8');
assert.match(source, /TripsLayer/);
assert.match(source, /ScreenGridLayer/);
assert.match(source, /MaskExtension/);
assert.match(source, /id: 'lng-trips'/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk node tests/japan-map-layers.cjs`

Expected: FAIL because the three new layers are not represented.

- [ ] **Step 3: Write minimal implementation**

```jsx
new TripsLayer({
  id: 'lng-trips', data: visibleTrips,
  getPath: (trip) => trip.path,
  getTimestamps: (trip) => trip.path.map(([, , timestamp]) => timestamp),
  currentTime: tripTime,
  trailLength: 900,
  fadeTrail: true,
});
```

Use `ScreenGridLayer` as a subtle density halo around the sea-lane, and a `MaskExtension`-backed layer only for the disrupted Hormuz zone. Reduce `visibleTrips` with `disruptionRatio` after the closure instead of inventing live data. Add short `TripsLayer` paths between Japanese utility points for the final grid arrival.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk node tests/japan-map-layers.cjs`

Expected: PASS.

### Task 3: Add sequential callouts, connector leaders, and paced camera stops

**Files:**
- Modify: `presentation-japan/src/components/JapanGridMapAnimated.jsx`
- Modify: `presentation-japan/src/components/ExplanationBox.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes `HORMUZ_STORY_KEYFRAMES` and story timing data.
- `HormuzContextOverlay({ activeCallout, mapProject })` returns exactly one active callout with a leader line to its geographic anchor.

- [ ] **Step 1: Write the failing test**

```js
await page.getByTestId('hormuz-context-card').count() === 1;
await page.getByTestId('hormuz-callout-leader').waitFor({ state: 'visible' });
const opacity = await page.getByTestId('hormuz-context-card').evaluate((card) =>
  Number.parseFloat(getComputedStyle(card.firstElementChild).opacity)
);
assert.ok(opacity >= 0.96);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk node tests/keynote-rendering.cjs`

Expected: FAIL because all three cards currently render together and no leader exists.

- [ ] **Step 3: Write minimal implementation**

Render one high-opacity `ExplanationBox` at a time and project its lng/lat anchor through `map.project()`. Place an SVG leader in the overlay using the projected coordinate; update it from MapLibre `move` events. Chain each stop by scheduling the next `easeTo` only after the current camera movement and callout hold complete. For the sea journey, use intermediate route coordinates as successive `easeTo` targets so the camera follows the water corridor rather than flying directly across land.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk node tests/keynote-rendering.cjs`

Expected: PASS with one visible card and a visible leader at the Hormuz stop.

### Task 4: Enable safe map exploration without stealing slide navigation

**Files:**
- Modify: `presentation-japan/src/components/JapanMapBackground.jsx`
- Modify: `presentation-japan/src/components/JapanGridMapAnimated.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- `JapanMapBackground` accepts `interactive` and initializes MapLibre interaction handlers accordingly.
- `JapanGridMapAnimated` consumes MapLibre map events to keep Deck.gl synchronized after manual exploration.

- [ ] **Step 1: Write the failing test**

```js
await page.getByTestId('japan-map-canvas').hover();
await page.mouse.wheel(0, -360);
assert.ok(await page.getByTestId('japan-map-canvas').evaluate((node) => node.dataset.interactive === 'true'));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk node tests/keynote-rendering.cjs`

Expected: FAIL because the map background has `interactive: false` and ignores pointer input.

- [ ] **Step 3: Write minimal implementation**

```jsx
interactive: true,
scrollZoom: true,
dragPan: true,
dragRotate: true,
touchZoomRotate: true,
keyboard: true,
```

Stop propagation only for ArrowLeft and ArrowRight on the map container so Spectacle still advances keyframes. Keep `DeckGL` pointer-events disabled so MapLibre receives the interactions.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk node tests/keynote-rendering.cjs`

Expected: PASS and the map reports itself interactive.

### Task 5: Repair the title scene’s first three visual beats

**Files:**
- Modify: `presentation-japan/src/components/JapanOpeningSequence.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- `TitleCard({ presenter, step })` renders a visible distinct title-state for steps 0, 1, and 2.
- The map begins at opening step 3, while retaining the same downstream grid scene mapping.

- [ ] **Step 1: Write the failing test**

```js
await page.getByTestId('opening-title-event').waitFor({ state: 'visible' });
await advance(1);
await page.getByTestId('opening-title-premise').waitFor({ state: 'visible' });
await advance(1);
await page.getByTestId('opening-title-presenter').waitFor({ state: 'visible' });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `rtk node tests/keynote-rendering.cjs`

Expected: FAIL because only step zero renders the title card.

- [ ] **Step 3: Write minimal implementation**

Render the event subtitle at step 0, the talk premise at step 1, and the presenter name at step 2. Start `JapanGridMapAnimated` at `step >= 3` with the grid scene index calculated as `step - 3`.

- [ ] **Step 4: Run test to verify it passes**

Run: `rtk node tests/keynote-rendering.cjs`

Expected: PASS and each early keyframe has visible content.

### Task 6: Build and visually verify the presentation

**Files:**
- Test: `presentation-japan/tests/japan-map-layers.cjs`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

- [ ] **Step 1: Run focused map tests**

Run: `rtk node tests/japan-map-layers.cjs`

Expected: PASS.

- [ ] **Step 2: Run browser rendering regression test**

Run: `rtk node tests/keynote-rendering.cjs`

Expected: PASS.

- [ ] **Step 3: Produce the production build**

Run: `rtk npm run build`

Expected: Vite build completes with no errors.

- [ ] **Step 4: Take one visual screenshot of the Hormuz transition**

Run: use the existing `http://localhost:3100` dev server, advance to the Hormuz scene, and save one screenshot under `/tmp/`.

Expected: a pitched 3D map, one opaque card with a leader, readable disrupted sea-lane activity, and a visible path toward Japan.
