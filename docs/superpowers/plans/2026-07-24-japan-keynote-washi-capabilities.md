# Japan Keynote Washi Capabilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Washi energy-origin opening, sync keynote capability language with MainTalk, and animate matching VPP map effects.

**Architecture:** Keep the current DeckGL/MapLibre stack. A focused `JapanEnergyOrigins` scene owns the source routes and Washi overlays; `Keynote` owns slide ordering and chrome; the existing VPP layer factory accepts a small capability phase to color its existing layers.

**Tech Stack:** React 18, Spectacle, DeckGL 9, MapLibre, Playwright, Node assert.

## Global Constraints

- Modify keynote only; MainTalk is out of scope.
- Use current Japan theme tokens and fonts; no dependencies or second map stack.
- Use FY2023 generation mix from existing METI atlas metadata: coal 31%, LNG 33%, renewables 23%, nuclear 9%, oil 4%.
- Do not state unsupported Hormuz LNG percentages.
- Capability copy and order are exact: “Bring new players into the market”, “Respond when the system is tight”, “Use demand smarter”.
- Preserve `SlideContext.isSlideActive` RAF gating; no `setState` inside RAF.
- Do not commit unless the user explicitly authorizes it.

---

## File structure

| File | Responsibility |
| --- | --- |
| `presentation-japan/src/components/JapanEnergyOrigins.jsx` | Washi source map, staged import routes, mix/source overlays. |
| `presentation-japan/src/Keynote.jsx` | New seven-slide order, Washi premise/close, section count. |
| `presentation-japan/src/components/VPPTransformationSequence.jsx` | Final capability cards and phase selection. |
| `presentation-japan/src/components/VPPTransformationLayers.jsx` | Color existing map layers from capability phase. |
| `presentation-japan/tests/keynote-rendering.cjs` | Browser contracts for new slide and final reveal. |

### Task 1: Lock keynote browser contracts

**Files:**
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: keynote at `http://localhost:3100/`.
- Produces: failing contracts for `japan-energy-origins` and three `vpp-capability-*` cards.

- [ ] **Step 1: Add failing energy-origin and capability assertions**

  Replace unreachable `return;` at current line 72 with slide traversal. Add:

  ```js
  await advance(1);
  await page.getByTestId('japan-energy-origins').waitFor({ state: 'visible' });
  await page.getByText("Japan's energy comes from far away.", { exact: true }).waitFor({ state: 'visible' });
  await page.getByTestId('energy-origin-route-lng').waitFor({ state: 'visible' });
  await advance(3);
  await page.getByTestId('vpp-capability-market').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-capability-response').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-capability-demand').waitFor({ state: 'visible' });
  ```

- [ ] **Step 2: Run test and confirm failure**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: fail because `japan-energy-origins` and synced capability copy do not exist.

- [ ] **Step 3: Add source-level copy checks**

  ```js
  assert.match(keynote, /Bring new players into the market/);
  assert.match(keynote, /Respond when the system is tight/);
  assert.match(keynote, /Use demand smarter/);
  assert.doesNotMatch(keynote, /97% of Japan LNG transits this route/);
  ```

- [ ] **Step 4: Commit test contract only with explicit user approval**

  ```bash
  git add presentation-japan/tests/keynote-rendering.cjs
  git commit -m "test: cover keynote energy origin"
  ```

### Task 2: Build minimal Washi energy-origin scene

**Files:**
- Create: `presentation-japan/src/components/JapanEnergyOrigins.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: `StepBridge`, `DeckGL`, `MapGL`, and existing Washi token variables.
- Produces: `JapanEnergyOrigins({ height?: string }): JSX.Element`, with test IDs `japan-energy-origins`, `energy-origin-route-lng`, `energy-origin-route-oil`, `energy-origin-route-coal`.

- [ ] **Step 1: Create staged route data and map layers**

  Use one local constant, no new data file:

  ```jsx
  const ORIGINS = [
    { id: 'lng', label: 'LNG · Australia / Southeast Asia', path: [[115, -23], [130, 5], [139.8, 35.3]], color: [230, 171, 70, 235] },
    { id: 'oil', label: 'Oil · Middle East', path: [[52, 26], [72, 17], [139.8, 35.3]], color: [196, 82, 66, 235] },
    { id: 'coal', label: 'Coal · Australia', path: [[151, -32], [149, 8], [139.8, 35.3]], color: [95, 78, 65, 235] },
  ];
  ```

  Render `PathLayer` only for `ORIGINS.slice(0, step + 1)`, with `id: 'energy-origin-route-' + id`, `widthUnits: 'pixels'`, rounded joins, and `transition`-based overlay opacity. Use a fixed Japan-centered view; map routes are schematic source corridors.

- [ ] **Step 2: Add Washi overlays and source note**

  ```jsx
  <div data-testid="japan-energy-origins" style={{ height, position: 'relative', background: 'var(--color-washi-paper)' }}>
    <div style={{ position: 'absolute', zIndex: 2, top: 44, left: 48 }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '.16em' }}>JAPAN'S ENERGY SYSTEM · FY2023</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)' }}>Japan's energy comes from far away.</h1>
    </div>
    <div data-testid="energy-origin-mix">Coal 31% · LNG 33% · Renewables 23% · Nuclear 9% · Oil 4%</div>
    <div data-testid="energy-origin-source">METI · FY2023 generation mix</div>
  </div>
  ```

  Make the label associated with `ORIGINS[step]` enter with its route. Last step retains routes and exposes “One route leads through Hormuz.” Do not place a Hormuz percentage here.

- [ ] **Step 3: Run test and confirm energy-origin assertions pass**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: energy-origin assertions pass; later capability assertions still fail.

- [ ] **Step 4: Commit scene only with explicit user approval**

  ```bash
  git add presentation-japan/src/components/JapanEnergyOrigins.jsx presentation-japan/tests/keynote-rendering.cjs
  git commit -m "feat: add keynote energy origin map"
  ```

### Task 3: Recompose keynote around Washi premise and Hormuz consequence

**Files:**
- Modify: `presentation-japan/src/Keynote.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: `JapanEnergyOrigins`, `JapanOpeningSequence`, `JapanGridAtlas`, `PatternSequence`, `VPPTransformationSequence`.
- Produces: seven slides and matching `SECTIONS`, `TOTAL_SLIDES`, and forced-dark set.

- [ ] **Step 1: Import the new scene and replace chrome constants**

  ```jsx
  import JapanEnergyOrigins from './components/JapanEnergyOrigins.jsx';

  const SECTIONS = ['Premise', 'Energy', 'Hormuz', 'Atlas', 'Pattern', 'VPP', 'Close'];
  const TOTAL_SLIDES = 7;
  const FORCED_DARK_SLIDES = new Set([3, 5, 6]);
  ```

- [ ] **Step 2: Split title from the existing opening scene**

  Keep `JapanOpeningSequence` for title plus geographic/Hormuz steps, but expose `startAtMap` (default `false`) and use it for slide 3 so it starts at its island/Hormuz map state. Put a separate Washi premise slide before energy origins:

  ```jsx
  <Slide backgroundColor="var(--color-washi-paper)" padding="0">
    <div data-testid="keynote-washi-premise" style={{ height: '100%', display: 'grid', alignContent: 'center', padding: '0 58px' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '.16em' }}>KUBECON + CLOUDNATIVECON JAPAN · YOKOHAMA</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)' }}>The energy grid is becoming a cloud-native distributed system.</h1>
    </div>
  </Slide>
  <Slide backgroundColor="var(--color-washi-paper)" padding="0"><JapanEnergyOrigins /></Slide>
  ```

  Add the existing atlas, pattern, VPP, and close after these slides. Update `Notes` to describe source corridors as schematic and the METI FY2023 mix source.

- [ ] **Step 3: Restyle static close as Washi**

  Keep `PatternSequence` and `VPPTransformationSequence` dark. Change only the final static close to `var(--color-washi-paper)` and replace hardcoded colors/fonts with `--color-washi-ink`, `--color-washi-solar`, `--font-heading`, and `--font-mono`:

  ```jsx
  <Slide backgroundColor="var(--color-washi-paper)" padding="0">
    <div data-testid="keynote-washi-close" style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '.16em' }}>100K HOMES</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)' }}>coordinated by software</h1>
      <div style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-solar)' }}>= 1 power plant, zero emissions</div>
    </div>
  </Slide>
  ```

- [ ] **Step 4: Run browser regression**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: title, origin map, Hormuz scene, atlas, and pre-existing VPP assertions pass; capability assertions fail.

- [ ] **Step 5: Commit composition only with explicit user approval**

  ```bash
  git add presentation-japan/src/Keynote.jsx presentation-japan/src/components/JapanOpeningSequence.jsx presentation-japan/tests/keynote-rendering.cjs
  git commit -m "feat: sequence keynote energy dependency"
  ```

### Task 4: Sync final VPP cards and map effects

**Files:**
- Modify: `presentation-japan/src/components/VPPTransformationSequence.jsx`
- Modify: `presentation-japan/src/components/VPPTransformationLayers.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: final `stageIndex === 4`, `getVPPTransformationLayers({ stage, capabilityPhase, ... })`.
- Produces: three capability cards with stable test IDs and matching layered color effects.

- [ ] **Step 1: Extend failing test with exact final copy**

  ```js
  await page.getByTestId('vpp-capability-market').getByText('Bring new players into the market', { exact: true }).waitFor();
  await page.getByTestId('vpp-capability-response').getByText('Respond when the system is tight', { exact: true }).waitFor();
  await page.getByTestId('vpp-capability-demand').getByText('Use demand smarter', { exact: true }).waitFor();
  ```

- [ ] **Step 2: Pass card phase to existing layer factory**

  ```jsx
  const capabilityPhase = stageIndex === 4 ? Math.min(2, Math.floor(stabilizationRef.current * 3)) : -1;
  layers: getVPPTransformationLayers({ stage: stageIndex, tripTime: tripTimeRef.current, stabilization: stabilizationRef.current, capabilityPhase }),
  ```

  In `VPPTransformationLayers.jsx`, add `capabilityPhase = -1` to the argument, derive `[255,194,23]`, `[34,211,238]`, or `[167,139,250]`, and apply it to existing `vpp-regional-energy`, `vpp-grid-hubs`, and `vpp-control-links`. Do not add another DeckGL layer.

- [ ] **Step 3: Replace plain spans with sequential icon cards**

  ```jsx
  const capabilities = [
    ['market', '◒', 'Bring new players into the market'],
    ['response', '⌁', 'Respond when the system is tight'],
    ['demand', '▣', 'Use demand smarter'],
  ];
  ```

  Render cards at stage 4 with `data-testid={'vpp-capability-' + id}`, opacity/translate transition based on `capabilityPhase >= index`, and existing dark typography. Remove all `vpp-superpower-*` copy and test IDs.

- [ ] **Step 4: Run regression and build**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs && rtk npm run build`

  Expected: both exit 0.

- [ ] **Step 5: Capture one projection-size inspection image**

  Run: `rtk node tests/keynote-rendering.cjs` with its existing Chrome server; then use Playwright at `1440x900`, advance to final VPP step, and save `/tmp/japan-keynote-capabilities.png`.

  Expected: Washi origin labels are legible, cards do not cover Japan, and dark map contrast remains readable.

- [ ] **Step 6: Commit final capability sequence only with explicit user approval**

  ```bash
  git add presentation-japan/src/components/VPPTransformationSequence.jsx presentation-japan/src/components/VPPTransformationLayers.jsx presentation-japan/tests/keynote-rendering.cjs
  git commit -m "feat: sync keynote flexibility capabilities"
  ```

## Self-review

- Spec coverage: Tasks 2–3 cover Washi origin map and Hormuz ordering; Task 4 covers exact MainTalk terminology, cards, and map effects; Task 1/4 cover tests, build, and visual inspection.
- No placeholders: all files, commands, test IDs, copy, interfaces, and data values are specified.
- Consistency: `JapanEnergyOrigins` and `capabilityPhase` names are used identically in producers, consumers, and tests.
