# Act 2 Muted Live Basemap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore a dim, recognisable live Japan basemap beneath the Act 2 art-directed city network.

**Architecture:** `JapanMapBackground` selects the existing OSM style for the night variant, then applies guarded MapLibre paint/layout overrides after style load. `JapanColdSnapMapAnimated` supplies the lower night-map opacity. Deck.gl city and energy layers remain unchanged and above the MapLibre canvas.

**Tech Stack:** React 18, MapLibre GL 5, Deck.gl 9, Spectacle 10, Node assert tests, Playwright, Vite.

## Global Constraints

- Use the existing OSM style URL; do not add a provider, API key, satellite layer, or coastline asset.
- Water is deep navy; land, roads, boundaries, and labels are low-contrast cool blue-gray.
- Preserve pan, wheel zoom, rotate, touch, Deck.gl pointer transparency, and MapLibre keyboard disablement.
- Apply paint/layout changes only to layers that exist; loading failure leaves the dark presentation usable.
- Do not change Act 1, slide count, or Spectacle step behavior.
- Do not commit or push unless the user explicitly asks.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `presentation-japan/src/components/JapanMapBackground.jsx` | Selects and styles the muted live night basemap after MapLibre load. |
| `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx` | Uses a low-opacity night basemap beneath Act 2. |
| `presentation-japan/tests/japan-map-layers.cjs` | Checks night-basemap source contracts. |
| `presentation-japan/tests/keynote-rendering.cjs` | Retains Act 2 full-bleed and interactive canvas verification. |

### Task 1: Add a guarded muted-night style treatment

**Files:**

- Modify: `presentation-japan/src/components/JapanMapBackground.jsx`
- Modify: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**

- Produces module-local `applyNightBasemapStyle(map)`; it only calls `setPaintProperty`/`setLayoutProperty` after `map.getLayer(layerId)` succeeds.
- `JapanMapBackground({ variant: 'night' })` uses the existing `https://demotiles.maplibre.org/style.json` source rather than the current empty `NIGHT_STYLE`.

- [ ] **Step 1: Write the failing source-contract test**

Add to `presentation-japan/tests/japan-map-layers.cjs`:

```js
assert.match(mapBackground, /applyNightBasemapStyle/, 'The night variant needs a guarded live-basemap treatment.');
assert.match(mapBackground, /https:\/\/demotiles\.maplibre\.org\/style\.json/, 'The night variant must retain the existing live OSM source.');
assert.match(mapBackground, /map\.getLayer\(layerId\)/, 'Night style overrides must tolerate missing source layers.');
assert.match(mapBackground, /'#071426'/, 'Night water must use a deep navy paint token.');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: FAIL because the night variant uses an empty inline style and has no guarded styling helper.

- [ ] **Step 3: Implement the minimal live night-basemap styling**

Replace `NIGHT_STYLE` with a module-local helper and style URL constant:

```jsx
const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json';
const NIGHT_PAINT_OVERRIDES = [
  ['water', 'fill-color', '#071426'],
  ['landcover', 'fill-color', '#0a1020'],
  ['landuse', 'fill-color', '#0a1020'],
  ['building', 'fill-color', '#111b30'],
  ['road', 'line-color', '#24344d'],
  ['boundary', 'line-color', '#334155'],
];

const applyNightBasemapStyle = (map) => {
  NIGHT_PAINT_OVERRIDES.forEach(([layerId, property, value]) => {
    if (map.getLayer(layerId)) map.setPaintProperty(layerId, property, value);
  });
  map.getStyle().layers.forEach(({ id, type }) => {
    if (type === 'symbol' && map.getLayer(id)) {
      map.setPaintProperty(id, 'text-color', '#64748b');
      map.setPaintProperty(id, 'text-halo-color', '#071426');
      map.setPaintProperty(id, 'text-halo-width', 1);
    }
  });
};
```

Use `MAP_STYLE_URL` for both variants. In the map `load` handler, call `applyNightBasemapStyle(map.current)` only for `variant === 'night'`, then call `onMapReady`. Retain the existing error listener and all interaction options. Remove the current transparent-background mutation for the night branch; it would hide the map. If the default branch needs it, retain it only there.

- [ ] **Step 4: Run the source-contract test to verify it passes**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: PASS with no output.

### Task 2: Set the Act 2 map to muted live-map opacity and verify the presentation

**Files:**

- Modify: `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx`
- Modify: `presentation-japan/tests/japan-map-layers.cjs`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**

- `JapanColdSnapMapAnimated` renders `<JapanMapBackground variant="night" opacity={0.4} ... />`.
- The existing `japan-map-canvas` test ID and `data-interactive="true"` contract remain unchanged.

- [ ] **Step 1: Write the failing Act 2 usage assertion**

Add to `presentation-japan/tests/japan-map-layers.cjs`:

```js
assert.match(coldSnapMap, /variant="night" opacity=\{0\.4\}/, 'Act 2 needs a muted, not opaque, live map beneath the network.');
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: FAIL because Act 2 currently passes `opacity={1}`.

- [ ] **Step 3: Apply the low-opacity Act 2 usage**

In `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx`, change only this background invocation:

```jsx
<JapanMapBackground variant="night" opacity={0.4} onMapReady={handleMapReady} interactive />
```

Do not change the DeckGL canvas, story/HUD markup, view-state synchronization, or RAF loop.

- [ ] **Step 4: Run all verification**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

Expected: PASS with no output.

Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

Expected: PASS with no output; Act 2 remains full-bleed and interactive.

Run: `cd presentation-japan && rtk npm run build`

Expected: exit code 0.

### Task 3: Inspect the geographic-context composition

**Files:**

- Modify only if visual evidence identifies a concrete defect: `presentation-japan/src/components/JapanMapBackground.jsx` or `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx`

- [ ] **Step 1: Capture one settled Tokyo city screenshot**

Run from `presentation-japan` with the local server on port 3100:

```bash
node -e "const {chromium}=require('playwright');(async()=>{const b=await chromium.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});const p=await b.newPage({viewport:{width:1440,height:900}});await p.goto('http://localhost:3100/',{waitUntil:'networkidle'});for(let i=0;i<14;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(300)}await p.waitForTimeout(4000);await p.screenshot({path:'/tmp/japan-keynote-act2-muted-basemap.png'});await b.close()})().catch(e=>{console.error(e);process.exit(1)})"
```

Expected: the Japan coastline, water, and street/label context are faintly visible beneath the dark buildings and cyan/amber/red network.

- [ ] **Step 2: Make only evidence-based adjustments**

If the live basemap competes with the network, lower only `opacity` from `0.4` to `0.35`. If coastlines remain imperceptible, increase only `opacity` to `0.45`. Do not introduce an imagery source or new data provider.

- [ ] **Step 3: Repeat final verification after any adjustment**

Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs && rtk node tests/keynote-rendering.cjs && rtk npm run build`

Expected: all commands exit with code 0.

## Spec Coverage Review

- Live OSM basemap, muted paint, and fallback-safe layer overrides: Task 1.
- Act 2 opacity and unchanged interaction/Deck hierarchy: Task 2.
- City-scale visual composition: Task 3.
