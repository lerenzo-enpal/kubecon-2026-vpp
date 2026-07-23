# Tokyo Duck Curve Case Study Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Proof 1's generic mismatch slide with a dark, interactive Tokyo-area reported-case scene that links a Deck.gl map to an illustrative duck curve.

**Architecture:** Keep `MainTalk.jsx` as composition. Add one focused `TokyoDuckCurveCaseStudy` component: `StepBridge` supplies three presenter states, each state selects one authored camera and map/curve treatment. Deck.gl's existing MapLibre stack handles optional exploration; the next authored state reapplies its camera. A compact provisional evidence record feeds the existing footer.

**Tech Stack:** React 18, Spectacle, Deck.gl, MapLibre, SVG, Node `assert`, Playwright.

## Global Constraints

- Preserve exactly 25 core slides; replace the existing generic mismatch slide only.
- No new dependencies and no custom shader; Deck.gl layers plus CSS vignette/grain are sufficient.
- Use `Tokyo-area reported case`; do not state fleet capacity, avoided curtailment, or delivered grid impact.
- Label response markers and curve effect `ILLUSTRATIVE`.
- Footer copy is `Source [1] · Shizen Connect / TEPCO EP · March 2026` with an explicit provisional reported-case caveat.
- Map remains pannable/zoomable; ArrowRight moves from noon → charging → dusk and restores the next authored camera.
- Use a module-level `FlyToInterpolator`; gate all effects by `SlideContext.isSlideActive`; no RAF loop or per-frame React state.
- No commit or push without explicit user permission.

---

## File Map

| File | Responsibility |
|---|---|
| `presentation-japan/src/data/mainTalkEvidence.mjs` | Minimal provisional source metadata for the compact footer. |
| `presentation-japan/src/components/TokyoDuckCurveCaseStudy.jsx` | Three-state Deck.gl + duck curve case-study scene. |
| `presentation-japan/src/MainTalk.jsx` | Imports the component and replaces the generic Proof 1 mismatch slide. |
| `presentation-japan/tests/main-talk-rendering.cjs` | Static source contracts and 25-slide count. |
| `presentation-japan/tests/main-talk-evidence.cjs` | Required evidence metadata. |
| `presentation-japan/tests/main-talk-browser.cjs` | Browser contracts for three authored states and camera recovery. |

### Task 1: Add the failing static contracts

**Files:**
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/tests/main-talk-evidence.cjs`

**Produces:** Tests requiring the new focused scene and evidence record before production code exists.

- [ ] **Step 1: Require the new scene in the rendering test**

```js
const tokyo = fs.readFileSync(path.join(__dirname, '../src/components/TokyoDuckCurveCaseStudy.jsx'), 'utf8');
assert.match(source, /TokyoDuckCurveCaseStudy/);
assert.match(tokyo, /data-testid="tokyo-duck-curve-case"/);
assert.match(tokyo, /TOKYO-AREA REPORTED CASE/);
assert.match(tokyo, /ILLUSTRATIVE/);
assert.match(tokyo, /FlyToInterpolator/);
```

- [ ] **Step 2: Require the provisional source metadata**

```js
assert.equal(MAIN_TALK_EVIDENCE.tokyoDemandCreation.sourceUrl,
  'https://www.se-digital.net/pressrelease_260317_tokyodenryokuep-output-curtailment/');
assert.match(MAIN_TALK_EVIDENCE.tokyoDemandCreation.reference, /Shizen Connect \/ TEPCO EP.*March 2026/i);
assert.match(MAIN_TALK_EVIDENCE.tokyoDemandCreation.notes, /reported case.*illustrative/i);
```

- [ ] **Step 3: Run the contracts and verify RED**

Run: `rtk node presentation-japan/tests/main-talk-rendering.cjs && rtk node presentation-japan/tests/main-talk-evidence.cjs`

Expected: failure because `TokyoDuckCurveCaseStudy.jsx` and `tokyoDemandCreation` do not yet exist.

### Task 2: Build the smallest focused case-study component

**Files:**
- Create: `presentation-japan/src/components/TokyoDuckCurveCaseStudy.jsx`
- Modify: `presentation-japan/src/data/mainTalkEvidence.mjs`

**Consumes:** `MAIN_TALK_EVIDENCE.tokyoDemandCreation`, `MainTalkSourceFooter`, Deck.gl/MapLibre imports, and theme tokens.

**Produces:** `TokyoDuckCurveCaseStudy({ step })`, where `step` is clamped to `0..2`.

- [ ] **Step 1: Add conservative evidence**

```js
tokyoDemandCreation: {
  value: 'Tokyo-area reported case',
  label: 'Reported demand-creation DR following Tokyo-area renewable-output control',
  sourceLabel: 'Shizen Connect / TEPCO Energy Partner',
  sourceUrl: 'https://www.se-digital.net/pressrelease_260317_tokyodenryokuep-output-curtailment/',
  sourceYear: 'March 2026',
  reference: 'Source [1] · Shizen Connect / TEPCO EP · March 2026',
  notes: 'Reported case; fleet markers, dispatch, and curve response are illustrative, not measured performance.',
  researchAnchor: '#tokyo-demand-creation-dr',
},
```

- [ ] **Step 2: Define exactly three scene records and one shared interpolator**

```jsx
const FLY_TO = new FlyToInterpolator();
const SCENES = [
  { time: '12:00', title: 'Renewables need somewhere to go', state: 'CURTAILMENT CONTEXT', view: { longitude: 139.72, latitude: 35.67, zoom: 9.3, pitch: 38, bearing: -12 } },
  { time: '12:15', title: 'Flexible homes create demand', state: 'ILLUSTRATIVE CHARGING', view: { longitude: 139.75, latitude: 35.69, zoom: 10.5, pitch: 42, bearing: -12 } },
  { time: '17:00', title: 'That stored energy supports dusk', state: 'ILLUSTRATIVE DUSK SUPPORT', view: { longitude: 139.72, latitude: 35.67, zoom: 9.3, pitch: 38, bearing: -12 } },
];
```

Use a small fixed set of anonymous Tokyo-area points. `ScatterplotLayer` colors amber surplus, green charging, and indigo dusk support. Do not show counts, MW, or a measured dispatch result.

- [ ] **Step 3: Couple authored camera to presenter state**

```jsx
const sceneIndex = Math.min(Math.max(Number.isInteger(step) ? step : 0, 0), SCENES.length - 1);
useEffect(() => {
  if (!isActive) return;
  setViewState(previous => ({ ...previous, ...SCENES[sceneIndex].view,
    transitionDuration: 900, transitionInterpolator: FLY_TO }));
}, [sceneIndex, isActive]);
```

Render `DeckGL controller={true}` and keep `onViewStateChange={({ viewState: next }) => setViewState(next)}`. This leaves drag/zoom available while every Arrow state returns the presenter to the correct camera.

- [ ] **Step 4: Render the persistent duck curve and source footer**

Render the three SVG paths in a fixed bottom HUD: baseline demand, solar generation, and a state-selected net-load curve. Place `ILLUSTRATIVE NET-LOAD RESPONSE` above the curve; use `MainTalkSourceFooter evidence={MAIN_TALK_EVIDENCE.tokyoDemandCreation}` at the bottom.

- [ ] **Step 5: Run static contracts and verify GREEN**

Run: `rtk node presentation-japan/tests/main-talk-rendering.cjs && rtk node presentation-japan/tests/main-talk-evidence.cjs`

Expected: both exit 0.

### Task 3: Replace the generic mismatch slide and lock browser behavior

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Modify: `presentation-japan/tests/main-talk-browser.cjs`

**Consumes:** `TokyoDuckCurveCaseStudy({ step })` and `StepBridge`.

**Produces:** The unchanged fifth core slide (generic mismatch) becomes the integrated Tokyo scene, without changing total slides.

- [ ] **Step 1: Compose the scene with a three-step bridge**

```jsx
import { TokyoDuckCurveCaseStudy } from './components/TokyoDuckCurveCaseStudy.jsx';
// Replace only the generic “Generation and demand miss each other” Slide:
<Slide padding="0"><StepBridge count={3}>{step => <TokyoDuckCurveCaseStudy step={step} />}</StepBridge>
  <Notes>Tokyo-area reported case. Noon: control context; then illustrative household charging; then illustrative dusk support. Do not claim fleet capacity or delivered grid impact.</Notes>
</Slide>
```

- [ ] **Step 2: Add browser assertions for the three states**

```js
const tokyo = page.getByTestId('tokyo-duck-curve-case');
for (let slide = 0; slide < 30 && !(await tokyo.isVisible()); slide += 1) await next();
assert.equal(await tokyo.isVisible(), true);
await assert.doesNotReject(() => tokyo.getByText('CURTAILMENT CONTEXT').waitFor());
await next();
await assert.doesNotReject(() => tokyo.getByText('ILLUSTRATIVE CHARGING').waitFor());
await next();
await assert.doesNotReject(() => tokyo.getByText('ILLUSTRATIVE DUSK SUPPORT').waitFor());
assert.match(await tokyo.getByTestId('main-talk-source-footer').innerText(), /Source \[1\].*March 2026/);
```

Add a `data-testid="tokyo-authored-view"` HUD containing the selected view name; after a manual drag and a next Arrow, assert the HUD changes to the next scene. This tests recovery without reaching into Deck.gl internals.

- [ ] **Step 3: Run the browser contract**

Run: `rtk node presentation-japan/tests/main-talk-browser.cjs`

Expected: exit 0 with no console or page errors and final slide count `25 / 25`.

### Task 4: Verify the projection view

**Files:**
- Temporary only: `/tmp/japan-main-talk-tokyo-noon.png`, `/tmp/japan-main-talk-tokyo-charging.png`, `/tmp/japan-main-talk-tokyo-dusk.png`

- [ ] **Step 1: Run complete checks**

Run:

```bash
rtk node presentation-japan/tests/main-talk-rendering.cjs
rtk node presentation-japan/tests/main-talk-evidence.cjs
rtk node presentation-japan/tests/shizen-day-case.cjs
rtk node presentation-japan/tests/main-talk-browser.cjs
rtk npm run build --prefix presentation-japan
rtk git diff --check
```

Expected: every command exits 0.

- [ ] **Step 2: Capture the three Tokyo states at 1440×900**

Use Playwright against `http://localhost:3100/main-talk.html`; save only to `/tmp`. Confirm: readable curve labels, map dominant, footer visible, exact provisional wording, no clipped map labels, and no dashboards/counts.

## Plan Self-Review

- **Spec coverage:** Tasks 2–3 cover the approved integrated dark map/curve, three author states, optional exploration, source footer, provisional caveat, and 25-slide constraint.
- **YAGNI:** One focused component, anonymous fixed point data, existing dependencies, no shader, no source verification expansion.
- **Type consistency:** `TokyoDuckCurveCaseStudy` receives only `step`; `StepBridge` remains the sole `useSteps` owner.
