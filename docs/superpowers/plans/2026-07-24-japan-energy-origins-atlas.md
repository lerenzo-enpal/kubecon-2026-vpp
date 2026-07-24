# Japan Energy Origins Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use `JapanGridAtlas` for slide 3 import paths and visually bridge it into slide 4.

**Architecture:** `JapanEnergyOrigins` provides Atlas scene layers and camera positions. `JapanGridAtlas` selects its existing raster styling by variant and keeps all camera / animation ownership.

**Tech Stack:** React 18, Spectacle, Deck.gl, MapLibre, Node assertions, Playwright.

## Global Constraints

- Reuse `JapanGridAtlas`; no new dependency or custom shader.
- Keep `MapGL` import name and Atlas-owned RAF lifecycle.
- Do not commit without explicit user approval.

---

### Task 1: Make Atlas styling selectable

**Files:**
- Modify: `presentation-japan/src/components/JapanGridAtlas.jsx`
- Test: `presentation-japan/tests/japan-grid-atlas.cjs`

- [x] **Step 1: Write failing test**

```js
assert.match(source, /mapVariant = 'dark'/);
assert.match(source, /data-map-variant={mapVariant}/);
```

- [x] **Step 2: Run test to verify it fails**

Run: `cd presentation-japan && node tests/japan-grid-atlas.cjs`
Expected: assertion failure for missing `mapVariant`.

- [x] **Step 3: Write minimal implementation**

```jsx
export function JapanGridAtlas({ mapVariant = 'dark', ...props }) {
  // select current dark or existing light raster style
}
```

- [x] **Step 4: Run test to verify it passes**

Run: `cd presentation-japan && node tests/japan-grid-atlas.cjs`
Expected: exit code 0.

### Task 2: Move energy origins onto Atlas

**Files:**
- Modify: `presentation-japan/src/components/JapanEnergyOrigins.jsx`
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

- [x] **Step 1: Write failing test**

```js
assert.match(energyOrigins, /<JapanGridAtlas/);
assert.match(energyOrigins, /sceneLayer/);
```

- [x] **Step 2: Run test to verify it fails**

Run: `cd presentation-japan && node tests/keynote-rendering.cjs`
Expected: assertion failure for missing shared Atlas scene.

- [x] **Step 3: Write minimal implementation**

```jsx
<JapanGridAtlas
  step={step}
  preset={() => ({})}
  mapVariant="washi"
  sceneLayer={{ view: ORIGINS[step]?.view, getLayers: () => layers }}
/>
```

- [x] **Step 4: Run tests to verify it passes**

Run: `cd presentation-japan && node tests/japan-grid-atlas.cjs && KEYNOTE_URL=http://127.0.0.1:3104/ node tests/keynote-rendering.cjs`
Expected: exit code 0.

### Task 3: Fade into Hormuz dark mode

**Files:**
- Modify: `presentation-japan/src/Keynote.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

- [x] **Step 1: Write failing test**

```js
assert.match(keynote, /data-testid="hormuz-map-fade"/);
```

- [x] **Step 2: Run test to verify it fails**

Run: `cd presentation-japan && node tests/keynote-rendering.cjs`
Expected: assertion failure for missing fade layer.

- [x] **Step 3: Write minimal implementation**

```jsx
<div data-testid="hormuz-map-fade" className="pointer-events-none absolute inset-0 animate-[fade-in_500ms_ease-out] bg-[var(--color-bg)]" />
```

- [x] **Step 4: Run full verification**

Run: `cd presentation-japan && npm run build && node tests/japan-map-layers.cjs && node tests/japan-grid-atlas.cjs && KEYNOTE_URL=http://127.0.0.1:3104/ node tests/keynote-rendering.cjs`
Expected: all commands exit code 0.
