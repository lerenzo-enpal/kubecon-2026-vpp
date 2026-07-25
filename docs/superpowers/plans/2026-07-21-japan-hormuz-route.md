# Japan Keynote: Geographic Hormuz Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the opening map's screen-coordinate SVG geography with real MapLibre + Deck.gl layers that remain geographically correct during the Hormuz-to-Japan camera sequence.

**Architecture:** MapLibre remains the basemap and owns imperative camera transitions. `JapanGridMapAnimated` owns a transparent DeckGL overlay and builds its point, line, arc, and text layers from longitude/latitude data. The existing Spectacle `step` continues to select a scene; it never drives animation frame state.

**Tech Stack:** React 18, Spectacle 10, MapLibre GL 5, Deck.gl 9, Anime.js, Playwright, Vite.

## Global Constraints

- Preserve the current full-bleed opening, title card, step order, and non-looping presenter-driven sequence.
- Do not add Kepler.gl, its application shell, side panels, filters, or an external map provider.
- All visible map marks use longitude/latitude coordinates: utilities, frequency seam, terminals, Hormuz marker, import route, pulse, and labels.
- Keep `StepBridge` as the only `useSteps` integration point; do not wrap it in `LazyContent`.
- Gate DeckGL rendering and transient animation updates to the active map scene; do not use React state on every animation frame.
- Do not commit or push unless the user explicitly asks.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `presentation-japan/src/components/japanMapData.mjs` | Pure ES-module longitude/latitude feature data and route interpolation helpers, importable by Node tests and Vite. |
| `presentation-japan/src/components/JapanMapLayers.jsx` | Deterministic Deck.gl layer factory using `japanMapData.mjs`. |
| `presentation-japan/src/components/JapanGridMapAnimated.jsx` | Scene state, MapLibre camera lifecycle, DeckGL placement, and route-progress ref lifecycle. |
| `presentation-japan/tests/keynote-rendering.cjs` | Browser checks for full-bleed, real DeckGL overlay, Hormuz labels/route, and following slide. |

### Task 1: Define a testable geographic layer contract

**Files:**

- Create: `presentation-japan/src/components/japanMapData.mjs`
- Create: `presentation-japan/src/components/JapanMapLayers.jsx`
- Test: `presentation-japan/tests/japan-map-layers.cjs`

**Consumes:** Existing Deck.gl 9 packages (`@deck.gl/layers`, `@deck.gl/geo-layers`).

**Produces:** `getJapanMapLayers({ scene, routeProgress })`, returning Deck.gl layers with stable IDs and data sourced from tested longitude/latitude features.

- [ ] **Step 1: Write the failing layer-contract test.**

  Create `presentation-japan/tests/japan-map-layers.cjs` with Node assertions that import the named factory and prove the Hormuz scene contains geographic origin and destination points:

  ```js
  const assert = require('node:assert/strict');
  const { HORMUZ_COORDINATE, JAPAN_LNG_COORDINATES, LNG_ROUTE, getRoutePosition } = await import('../src/components/japanMapData.mjs');

  assert.deepEqual(HORMUZ_COORDINATE, [56.3, 26.6]);
  assert.ok(JAPAN_LNG_COORDINATES.every(([longitude, latitude]) => longitude > 120 && latitude > 25));
  assert.deepEqual(getRoutePosition(LNG_ROUTE, 0), HORMUZ_COORDINATE);
  assert.deepEqual(getRoutePosition(LNG_ROUTE, 1), [138.25, 36.2]);
  ```

- [ ] **Step 2: Run the test to verify it fails because the module does not exist.**

  Run: `node tests/japan-map-layers.cjs`

  Expected: a module-not-found failure for `japanMapData.mjs`.

- [ ] **Step 3: Implement the minimal geographic layer module.**

  Export these constants and interpolation helper from `japanMapData.mjs`:

  ```js
  export const HORMUZ_COORDINATE = [56.3, 26.6];
  export const JAPAN_LNG_COORDINATES = [[139.78, 35.55], [135.35, 34.62], [130.38, 33.59]];
  export const LNG_ROUTE = [HORMUZ_COORDINATE, [64, 24], [78, 18], [96, 15], [117, 21], [138.25, 36.2]];
  export const getRoutePosition = (route, progress) => {
    // Clamp 0–1, interpolate within the matching route segment, and return [longitude, latitude].
  };
  ```

  Then create `JapanMapLayers.jsx` with:

  ```jsx
  export const getJapanMapLayers = ({ scene, routeProgress = 0 }) => {
    // Return ScatterplotLayer, PathLayer, ArcLayer, and TextLayer instances.
    // Attach `id: 'hormuz-origin'`, `id: 'lng-route'`, and `id: 'japan-lng-terminals'`.
    // Return only Japan grid layers before `scene === 'hormuz'`.
  };
  ```

  Use `ScatterplotLayer`, `PathLayer`, `ArcLayer`, and `TextLayer`; use the existing CSS theme variables or central theme palette for colors. Import the module as `import * as mapData from './japanMapData.mjs'`; each layer's `getPosition`/`getPath` reads longitude/latitude from `mapData`, never pixel coordinates.

- [ ] **Step 4: Run the layer-contract test to verify it passes.**

  Run: `node tests/japan-map-layers.cjs`

  Expected: exit 0.

### Task 2: Mount the DeckGL overlay over the MapLibre instance

**Files:**

- Modify: `presentation-japan/src/components/JapanGridMapAnimated.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Consumes:** `getJapanMapLayers({ scene, routeProgress })` from Task 1 and `onMapReady` from `JapanMapBackground`.

**Produces:** A `DeckGL` overlay aligned with the MapLibre camera and exposed as `data-testid="japan-geographic-layers"`.

- [ ] **Step 1: Extend the browser regression with a failing geographic-overlay assertion.**

  Immediately after the existing `japan-opening-map` bounds assertion, add:

  ```js
  await page.getByTestId('japan-geographic-layers').waitFor({ state: 'visible' });
  const mapCanvasCount = await page.locator('[data-testid="japan-geographic-layers"] canvas').count();
  if (mapCanvasCount !== 1) throw new Error('Expected one DeckGL geographic overlay canvas.');
  ```

- [ ] **Step 2: Run the browser regression to verify it fails for the missing test id.**

  Run: `node tests/keynote-rendering.cjs`

  Expected: timeout waiting for `japan-geographic-layers`.

- [ ] **Step 3: Add the synchronized overlay.**

  Import `DeckGL` from `@deck.gl/react` and add this absolutely positioned sibling of `JapanMapBackground`:

  ```jsx
  <div data-testid="japan-geographic-layers" style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
    <DeckGL
      layers={getJapanMapLayers({ scene: step === 5 ? 'hormuz' : 'japan', routeProgress: routeProgressRef.current })}
      viewState={mapViewState}
      controller={false}
    />
  </div>
  ```

  Subscribe to MapLibre's `move` event after `onMapReady` to update `mapViewState` only at map-camera event cadence. Convert `map.getCenter()`, `map.getZoom()`, `map.getBearing()`, and `map.getPitch()` to DeckGL view state. Unsubscribe in the effect cleanup. Keep the SVG only for non-geographic stat panels; remove SVG geographic utilities, route, terminal, and label rendering.

- [ ] **Step 4: Run the browser regression to verify the overlay is present without breaking the existing scene.**

  Run: `node tests/keynote-rendering.cjs`

  Expected: failure, if any, is solely the old Hormuz SVG test contract; the DeckGL overlay assertion passes.

### Task 3: Animate the real LNG route and camera sequence

**Files:**

- Modify: `presentation-japan/src/components/JapanGridMapAnimated.jsx`
- Modify: `presentation-japan/src/components/JapanMapLayers.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Consumes:** Task 2’s MapLibre-to-DeckGL view state and layer IDs.

**Produces:** A single Japan → Hormuz → Japan geographic route playback, with a map-anchored ship/pulse and labels.

- [ ] **Step 1: Update the browser contract to target DeckGL-accessible route labels.**

  Replace the existing SVG `hormuz-route` test-id wait with:

  ```js
  await page.getByTestId('hormuz-route').waitFor({ state: 'visible' });
  await page.getByText('Strait of Hormuz', { exact: true }).waitFor({ state: 'visible' });
  await page.getByText('Japan LNG terminals', { exact: true }).waitFor({ state: 'visible' });
  ```

  Render a small accessible HTML annotation group with `data-testid="hormuz-route"` over the DeckGL canvas. It is the test/accessibility contract; visual labels themselves are Deck.gl `TextLayer` marks.

- [ ] **Step 2: Run the regression to verify the updated Hormuz contract fails.**

  Run: `node tests/keynote-rendering.cjs`

  Expected: failure because the accessible annotation group and DeckGL labels have not been added.

- [ ] **Step 3: Implement interpolation without per-frame React state.**

  In `JapanMapLayers.jsx`, derive a partial line/path and pulse coordinate from `routeProgress` (0–1). In `JapanGridMapAnimated.jsx`, animate a ref with Anime.js on entry to `step === 5`, call the deck instance's `setProps({ layers: getJapanMapLayers(...) })` in the animation update, and reset/replay only after leaving the Hormuz step. This keeps frame updates outside React.

  Start with `mapInstance.easeTo({ center: HORMUZ_COORDINATE, zoom: 4.1, duration: 1100, essential: true })`. Then animate the route for 1600ms while MapLibre eases to `{ center: [138.25, 36.2], zoom: 4.5, duration: 1600, essential: true }`. Cancel the timer and pause the Anime timeline in effect cleanup.

- [ ] **Step 4: Add real map text labels and the accessible contract.**

  `TextLayer` renders exact strings `Strait of Hormuz` and `Japan LNG terminals` near their coordinates. During the Hormuz scene, render:

  ```jsx
  <div data-testid="hormuz-route" className="sr-only">
    Strait of Hormuz. Japan LNG terminals.
  </div>
  ```

  Keep Japanese grid labels hidden throughout this transit.

- [ ] **Step 5: Run the complete browser regression.**

  Run: `node tests/keynote-rendering.cjs`

  Expected: exit 0, with full-bleed bounds, DeckGL overlay, both real-map labels, and the Pattern slide all confirmed.

### Task 4: Visual and build verification

**Files:**

- Test: `presentation-japan/tests/japan-map-layers.cjs`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

- [ ] **Step 1: Capture the final Hormuz state.**

  Use the existing Chrome Playwright setup, advance to the Hormuz step, wait 2600ms for the route and camera animation, and save `/tmp/japan-keynote-hormuz-geographic.png`.

- [ ] **Step 2: Inspect the capture.**

  Confirm the route begins at the actual Strait of Hormuz, reaches Japan, retains clear label contrast, and has no Japan-only grid labels over the Middle East.

- [ ] **Step 3: Run fresh final verification.**

  Run: `node tests/japan-map-layers.cjs && node tests/keynote-rendering.cjs && npm run build`

  Expected: all commands exit 0 with no browser or Vite errors.

- [ ] **Step 4: Review only the scoped diff.**

  Run: `git diff -- presentation-japan/src/components/JapanMapLayers.jsx presentation-japan/src/components/JapanGridMapAnimated.jsx presentation-japan/tests/japan-map-layers.cjs presentation-japan/tests/keynote-rendering.cjs docs/superpowers/specs/2026-07-21-japan-hormuz-route-design.md docs/superpowers/plans/2026-07-21-japan-hormuz-route.md`

  Expected: only geographic map/layer behavior, tests, and supporting design documentation have changed. Do not commit or push.

## Plan Self-Review

- **Spec coverage:** Task 1 establishes actual geographic coordinates; Task 2 aligns DeckGL to the existing MapLibre camera; Task 3 implements the non-looping, presenter-driven Hormuz transit; Task 4 captures and verifies the result.
- **Placeholder scan:** All layer IDs, coordinates, test contracts, animation timings, and verification commands are explicit.
- **Type consistency:** `getJapanMapLayers({ scene, routeProgress })`, `HORMUZ_COORDINATE`, and the `japan-geographic-layers`/`hormuz-route` test contracts are introduced before their consumers.
