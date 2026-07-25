# Japan Grid Atlas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one reusable, interactive Japan Grid Atlas to keynote and main talk.

**Architecture:** A pure atlas-data module owns static, cited datasets and layer-state resolution. `JapanGridAtlas` turns resolved state into Deck.gl layers over the existing MapLibre background and exposes an icon HUD. Both decks provide authored step presets; manual icon changes override only current step.

**Tech Stack:** React 18, Spectacle 10, Deck.gl 9, MapLibre GL 5, Node `assert`, Playwright.

## Global Constraints

- Reuse MapLibre/Deck.gl; add no dependency or second renderer.
- Use geographic longitude/latitude only; all Deck.gl layer IDs remain stable.
- `MapGL` import name; module-level `FlyToInterpolator`; JS `Map` for lookups.
- HUD pointer interaction only; arrow keys remain Spectacle navigation.
- Static data includes source URL, licence/usage note, retrieval date, and scope.
- Source articles/maps are research references, never copied raster assets.
- Live layers show unavailable status on missing data; no proxy, scrape workaround, retry loop, or cache.
- Do not commit or push without user permission.

---

## File structure

| File | Responsibility |
| --- | --- |
| `presentation-japan/src/data/japanGridAtlasData.mjs` | Cited static features and source registry. |
| `presentation-japan/src/components/japanGridAtlasState.mjs` | Pure preset/override state resolver. |
| `presentation-japan/src/components/JapanGridAtlas.jsx` | Deck.gl layers, camera, HUD, unavailable live state. |
| `presentation-japan/src/Keynote.jsx` | New reusable atlas slide and step preset. |
| `presentation-japan/src/MainTalk.jsx` | Replace first two opening maps with atlas presets. |
| `presentation-japan/tests/japan-grid-atlas.cjs` | Data and pure-state contracts. |
| `presentation-japan/tests/keynote-rendering.cjs` | Keynote atlas source contract. |
| `presentation-japan/tests/main-talk-rendering.cjs` | Main-talk atlas source contract. |

### Task 1: Data catalogue and authored-state resolver

**Files:**
- Create: `presentation-japan/src/data/japanGridAtlasData.mjs`
- Create: `presentation-japan/src/components/japanGridAtlasState.mjs`
- Create: `presentation-japan/tests/japan-grid-atlas.cjs`

**Interfaces:**

```js
export const ATLAS_LAYER_IDS = ['mix', 'plants', 'areas', 'transmission', 'demand', 'jepx'];
export const ATLAS_SOURCES = [{ id, url, licence, retrievedAt, scope }];
export const ATLAS_FEATURES = { mix, plants, areas, transmission };
export function resolveAtlasLayers({ preset, overrides }) { /* returns Record<id, boolean> */ }
```

- [ ] **Step 1: Write failing contracts.**

```js
const { ATLAS_LAYER_IDS, ATLAS_SOURCES, ATLAS_FEATURES } = await import('../src/data/japanGridAtlasData.mjs');
const { resolveAtlasLayers } = await import('../src/components/japanGridAtlasState.mjs');
assert.deepEqual(ATLAS_LAYER_IDS, ['mix', 'plants', 'areas', 'transmission', 'demand', 'jepx']);
assert.ok(ATLAS_SOURCES.every(({ url, licence, retrievedAt, scope }) => url && licence && retrievedAt && scope));
assert.ok(ATLAS_FEATURES.areas.every(({ polygon }) => polygon.length >= 4));
assert.deepEqual(resolveAtlasLayers({ preset: { areas: true, plants: false }, overrides: { plants: true } }), { mix: false, plants: true, areas: true, transmission: false, demand: false, jepx: false });
```

- [ ] **Step 2: Run failing contract.**

Run: `cd presentation-japan && rtk node tests/japan-grid-atlas.cjs`

Expected: `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Add cited, static data and resolver.** Use CC BY 4.0 MapSVG-derived provider-region reference only with its attribution; retain existing project geographic utility/HVDC data for initial points/corridors. Add plants and regional mix only when each record has its own source registry entry; leave a sourced-but-empty layer rather than inventing precision.

```js
// japanGridAtlasState.mjs
import { ATLAS_LAYER_IDS } from '../data/japanGridAtlasData.mjs';
export function resolveAtlasLayers({ preset = {}, overrides = {} } = {}) {
  return Object.fromEntries(ATLAS_LAYER_IDS.map((id) => [id, overrides[id] ?? preset[id] ?? false]));
}
```

```js
// japanGridAtlasData.mjs
export const ATLAS_LAYER_IDS = ['mix', 'plants', 'areas', 'transmission', 'demand', 'jepx'];
export const ATLAS_SOURCES = [{
  id: 'fraser-grid-regions',
  url: 'https://github.com/FraserTooth/japan-electrical-region-maps',
  licence: 'CC BY 4.0 via MapSVG; attribution required',
  retrievedAt: '2026-07-24',
  scope: 'utility-region reference and boundary deviations',
}];
export const ATLAS_FEATURES = { mix: [], plants: [], areas: [], transmission: [] };
```

- [ ] **Step 4: Run contract green.**

Run: `cd presentation-japan && rtk node tests/japan-grid-atlas.cjs`

Expected: exit 0.

### Task 2: Shared Deck.gl atlas and compact icon HUD

**Files:**
- Create: `presentation-japan/src/components/JapanGridAtlas.jsx`
- Modify: `presentation-japan/tests/japan-grid-atlas.cjs`

**Interfaces:**

```jsx
export function JapanGridAtlas({ height = 580, step = 0, preset, liveData = {}, variant = 'dark' }) {}
```

- [ ] **Step 1: Add failing source contracts.**

```js
const source = await fs.readFile(require.resolve('../src/components/JapanGridAtlas.jsx'), 'utf8');
assert.match(source, /data-testid="japan-grid-atlas"/);
assert.match(source, /data-testid="japan-grid-atlas-hud"/);
assert.match(source, /aria-pressed/);
assert.match(source, /controller=\{true\}/);
assert.match(source, /MapGL/);
assert.match(source, /FlyToInterpolator/);
```

- [ ] **Step 2: Run failing contract.**

Run: `cd presentation-japan && rtk node tests/japan-grid-atlas.cjs`

Expected: `MODULE_NOT_FOUND` for `JapanGridAtlas.jsx`.

- [ ] **Step 3: Build minimal component.** Keep local `overrides` state; reset it only when `step` changes. Derive all visibility through `resolveAtlasLayers`. Render icon buttons from `ATLAS_LAYER_IDS`; every button has `title`, `aria-label`, and `aria-pressed`. Suppress unavailable live data with an icon-state label, not an exception.

```jsx
const [overrides, setOverrides] = useState({});
useEffect(() => setOverrides({}), [step]);
const active = useMemo(() => resolveAtlasLayers({ preset: preset(step), overrides }), [preset, step, overrides]);
const toggle = (id) => setOverrides((value) => ({ ...value, [id]: !active[id] }));

<div data-testid="japan-grid-atlas-hud" role="toolbar" aria-label="Japan grid layers">
  {ATLAS_LAYER_IDS.map((id) => <button key={id} type="button" title={LABELS[id]} aria-label={LABELS[id]} aria-pressed={active[id]} onClick={() => toggle(id)}>{ICONS[id]}</button>)}
</div>
```

- [ ] **Step 4: Run contract green.**

Run: `cd presentation-japan && rtk node tests/japan-grid-atlas.cjs`

Expected: exit 0.

### Task 3: Keynote atlas slide

**Files:**
- Modify: `presentation-japan/src/Keynote.jsx`
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**

```jsx
const keynoteAtlasPreset = (step) => ({ areas: true, transmission: step >= 1, plants: step >= 2, mix: step >= 3 });
```

- [ ] **Step 1: Add failing keynote contract.**

```js
assert.match(keynote, /JapanGridAtlas/);
assert.match(keynote, /StepBridge count=\{4\}/);
assert.match(keynote, /keynoteAtlasPreset/);
```

- [ ] **Step 2: Run test red.**

Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

Expected: assertion failure that `JapanGridAtlas` is absent.

- [ ] **Step 3: Add one full-bleed slide after opening.** Import `StepBridge` and `JapanGridAtlas`; increase `TOTAL_SLIDES` to `5`; shift section labels/dark-slide indexes; wrap atlas in `StepBridge count={4}` and pass `step` plus `keynoteAtlasPreset`. Notes identify static, sourced layers and live icons as unavailable unless a supported feed exists.

- [ ] **Step 4: Run test green.**

Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

Expected: exit 0.

### Task 4: Main-talk reuse and presentation interaction regression

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/tests/main-talk-browser.cjs`

**Interfaces:**

```jsx
const mainAtlasPreset = (step) => ({ areas: true, transmission: step >= 1, plants: false, mix: false });
```

- [ ] **Step 1: Add failing main-talk source/browser contracts.**

```js
assert.match(mainTalk, /JapanGridAtlas/);
assert.match(mainTalk, /mainAtlasPreset/);
assert.doesNotMatch(mainTalk, /<JapanGridMap variant="washi"/);
```

```js
await page.getByRole('button', { name: 'Transmission' }).click();
assert.equal(await page.getByRole('button', { name: 'Transmission' }).getAttribute('aria-pressed'), 'true');
await page.mouse.move(600, 380); await page.mouse.down(); await page.mouse.move(660, 410); await page.mouse.up();
await page.keyboard.press('ArrowRight');
```

- [ ] **Step 2: Run test red.**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs && rtk node tests/main-talk-browser.cjs`

Expected: source assertion failure that `JapanGridAtlas` is absent.

- [ ] **Step 3: Replace only MainTalk opening `JapanGridMap` usages.** Preserve existing explanatory cards, background, and `StepBridge`; pass `mainAtlasPreset` and current step. Remove unused `JapanGridMap` import.

- [ ] **Step 4: Run source and browser contracts green.**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs && rtk node tests/main-talk-browser.cjs`

Expected: both exit 0; no page errors.

### Task 5: Build and visual verification

**Files:** none unless a regression requires a minimal fix.

- [ ] **Step 1: Build presentation.**

Run: `cd presentation-japan && rtk npm run build`

Expected: exit 0.

- [ ] **Step 2: Take one visual screenshot.** Use the keynote atlas slide at 1440×900. Confirm icon HUD avoids text rail, map fills slide, controls are legible, and active icon state is visible.

- [ ] **Step 3: Do not commit.** Report changed files and verification. Commit only after explicit user request.

## Deferred follow-up: live adapters

Implement only after public, browser-safe, attributable provider/JEPX endpoints are individually verified. This follows the same `liveData` interface; it must not add a proxy or alter static atlas availability.
