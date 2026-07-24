# Keynote atlas animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the Hormuz route, JEPX spike chart, and Japan transmission motion using the shared `JapanGridAtlas`.

**Architecture:** `JapanGridAtlas` accepts two small optional layer descriptors: `routeLayer` owns a replayable, step-reset route; `transmissionLayer` supplies the existing DeckGL network layers. The keynote supplies the descriptors and keeps its existing overlays and `StepBridge` progression.

**Tech Stack:** React 18, Spectacle, DeckGL, MapLibre, Playwright.

## Global Constraints

- Reuse `JapanGridAtlas`, `JEPXPriceChart`, and VPP transmission data; no dependency or registry.
- Atlas layer toggles stay interactive and default to checked on these scenes.
- Gate animation work on `SlideContext.isSlideActive`.
- Keep Slide 6's existing power-network animation and replace only its duplicate map geography.

---

### Task 1: Lock keynote contracts

**Files:**
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Produces: browser assertions for `hormuz-route-play`, `act2-jepx-chart`, and `atlas-transmission-layer`.

- [x] **Step 1: Write failing assertions**

```js
await page.getByTestId('hormuz-route-play').waitFor({ state: 'visible' });
await page.getByTestId('act2-jepx-chart').waitFor({ state: 'visible' });
await page.getByTestId('atlas-transmission-layer').waitFor({ state: 'visible' });
```

- [x] **Step 2: Run test to verify it fails**

Run: `rtk node presentation-japan/tests/keynote-rendering.cjs`

Expected: fails because these test IDs do not yet exist.

### Task 2: Add atlas animation inputs

**Files:**
- Modify: `presentation-japan/src/components/JapanGridAtlas.jsx`

**Interfaces:**
- Consumes: `routeLayer?: { points, restartKey, view }` and `transmissionLayer?: { layers }`.
- Produces: replay button `data-testid="hormuz-route-play"`, a route rendered by the atlas, and wrapper `data-testid="atlas-transmission-layer"`.

- [x] **Step 1: Implement smallest shared behavior**

```jsx
export function JapanGridAtlas({ routeLayer, transmissionLayer, ...props }) {
  // reset the route when routeLayer.restartKey changes; atlas owns RAF and replay
  // append route layers and transmissionLayer.layers to normal atlas layers
}
```

- [x] **Step 2: Run test to verify new contracts**

Run: `rtk node presentation-japan/tests/keynote-rendering.cjs`

Expected: route/transmission assertions pass; remaining keynote assertions may fail until Task 3.

### Task 3: Wire keynote slides

**Files:**
- Modify: `presentation-japan/src/Keynote.jsx`

**Interfaces:**
- Consumes: optional atlas inputs from Task 2 and existing `JEPXPriceChart`.
- Produces: Hormuz animation reset by `StepBridge` step, chart in 25× sidecar, and Slide 6 atlas-backed animated transmission layer.

- [x] **Step 1: Pass existing data through shared atlas**

```jsx
<JapanGridAtlas routeLayer={{ points: HORMUZ_ROUTE, restartKey: step, view: HORMUZ_VIEW }} />
<div data-testid="act2-jepx-chart"><JEPXPriceChart height={170} /></div>
<JapanGridAtlas transmissionLayer={{ layers }} />
```

- [x] **Step 2: Run keynote browser test**

Run: `rtk node presentation-japan/tests/keynote-rendering.cjs`

Expected: PASS.

### Task 4: Verify presentation behavior

**Files:**
- Test: `presentation-japan/tests/keynote-rendering.cjs`

- [x] **Step 1: Run full test and build checks**

Run: `rtk node presentation-japan/tests/keynote-rendering.cjs`

Expected: PASS with no browser console errors.

- [x] **Step 2: Check changed files**

Run: `rtk git diff --check`

Expected: no whitespace errors.
