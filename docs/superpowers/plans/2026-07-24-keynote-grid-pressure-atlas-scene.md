# Keynote Grid-pressure Atlas Scene Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore Grid pressure's four-stage 3D cold-snap map story within `JapanGridAtlas`.

**Architecture:** `JapanGridAtlas` accepts one optional `sceneLayer` object containing DeckGL layers and a target camera. It remains responsible for Atlas controls and the active-slide RAF loop. `Keynote` passes existing cold-snap layers and camera keyframes; no new map data or abstraction is introduced.

**Tech Stack:** React 18, Spectacle, DeckGL, MapLibre, Playwright.

## Global Constraints

- Reuse existing precomputed cold-snap buildings, trips, and camera keyframes.
- No dependency, registry, runtime geometry, geofence, sampling control, or data pipeline.
- Gate the animation with `SlideContext.isSlideActive`; update DeckGL directly from RAF.
- Preserve Atlas toggles, JEPX sidecar, and demand card.
- Do not commit or push.

---

### Task 1: Atlas scene descriptor

**Files:**
- Modify: `presentation-japan/src/components/JapanGridAtlas.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: `sceneLayer?: { layers: (time: number) => Layer[], view?: ViewState }`
- Produces: scene layers combined with existing Atlas layers and driven by Atlas RAF time.

- [x] **Step 1: Write the failing contract assertions**

```js
assert.match(gridAtlas, /sceneLayer/);
assert.match(gridAtlas, /sceneLayer\?\.layers/);
```

- [x] **Step 2: Run contract test to verify it fails**

Run: `cd presentation-japan && KEYNOTE_URL=http://127.0.0.1:3104/ node tests/keynote-rendering.cjs`

Expected: FAIL because `sceneLayer` is not yet in `JapanGridAtlas`.

- [x] **Step 3: Add minimal descriptor support**

```jsx
export function JapanGridAtlas({ /* existing props */, sceneLayer }) {
  // append sceneLayer?.layers(animationTimeRef.current) after Atlas layers
  // use sceneLayer?.view as the camera target before existing defaults
}
```

- [x] **Step 4: Run production build**

Run: `cd presentation-japan && npm run build`

Expected: exit 0.

### Task 2: Wire Grid pressure stages

**Files:**
- Modify: `presentation-japan/src/Keynote.jsx`
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: `getJapanMapLayers({ scene: 'cold-snap', coldSnapStage: step, tripTime })` and `COLD_SNAP_CAMERA_KEYFRAMES[step].camera`.
- Produces: four Grid pressure map stages: national, Tokyo, Kansai, national transmission.

- [x] **Step 1: Write failing browser assertions**

```js
await page.getByTestId('act2-cold-snap-buildings').waitFor({ state: 'visible' });
await page.getByTestId('act2-cold-snap-transmission').waitFor({ state: 'visible' });
```

- [x] **Step 2: Run browser contract to verify it fails**

Run: `cd presentation-japan && KEYNOTE_URL=http://127.0.0.1:3104/ node tests/keynote-rendering.cjs`

Expected: FAIL because Grid pressure does not render cold-snap scene layers.

- [x] **Step 3: Pass existing cold-snap layers through Atlas**

```jsx
const sceneLayer = {
  view: COLD_SNAP_CAMERA_KEYFRAMES[step]?.camera,
  layers: (tripTime) => getJapanMapLayers({ scene: 'cold-snap', coldSnapStage: step, tripTime }),
};
<JapanGridAtlas step={step} preset={keynoteAtlasPreset} sceneLayer={sceneLayer} />
```

Add non-visual test IDs only as small stage witnesses for Playwright.

- [x] **Step 4: Run rendering contract**

Run: `cd presentation-japan && KEYNOTE_URL=http://127.0.0.1:3104/ node tests/keynote-rendering.cjs`

Expected: exit 0.

### Task 3: Final verification

**Files:**
- Verify: `presentation-japan/src/Keynote.jsx`
- Verify: `presentation-japan/src/components/JapanGridAtlas.jsx`
- Verify: `presentation-japan/tests/keynote-rendering.cjs`

- [x] **Step 1: Build production deck**

Run: `cd presentation-japan && npm run build`

Expected: exit 0.

- [x] **Step 2: Run browser rendering contract**

Run: `cd presentation-japan && npm run dev -- --host 127.0.0.1 --port 3104` then `KEYNOTE_URL=http://127.0.0.1:3104/ node tests/keynote-rendering.cjs`

Expected: exit 0.

- [x] **Step 3: Inspect scoped diff**

Run: `git diff -- presentation-japan/src/Keynote.jsx presentation-japan/src/components/JapanGridAtlas.jsx presentation-japan/tests/keynote-rendering.cjs docs/superpowers/plans/2026-07-24-keynote-grid-pressure-atlas-scene.md`

Expected: only shared Atlas scene support, Grid pressure wiring, browser contract, and this plan.
