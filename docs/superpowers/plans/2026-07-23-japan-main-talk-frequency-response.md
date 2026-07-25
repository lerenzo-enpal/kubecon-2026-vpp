# Japan Main Talk Frequency Response Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Proof 2 with a four-slide, interactive simulated Tokyo frequency-response case study and animated city-graph continuation.

**Architecture:** Add one focused `TokyoFrequencyResponseCaseStudy` component with two modes: the four-state incident and the recovered city graph. It reuses the project’s Deck.gl/MapLibre stack, Spectacle `StepBridge`, existing source footer, and theme tokens. `MainTalk.jsx` composes the two modes and the existing architecture/control-plane visuals; no new dependency or data system is introduced.

**Tech Stack:** React 18, Spectacle, Deck.gl, MapLibre, SVG/CSS animation, Node `assert`, Playwright.

## Global Constraints

- The event must be labelled `SIMULATED TOKYO EVENT`; it is not a reported incident or Shizen outcome.
- No MW, asset-count, response-time, performance, or fleet-capacity claim may appear in either scene.
- `MAIN_TALK_EVIDENCE.shizenV2H` supports only the scoped Japanese V2H aggregation context and keeps its company-reported qualifier.
- Map drag/zoom remains available; advancing an Arrow state restores the next authored camera.
- Use dark Mission Control only for Proof 2 operational scenes and control-plane explanation.
- Gate active work using `SlideContext.isSlideActive`; no RAF loop or per-frame React state.
- Reuse installed dependencies and theme tokens; do not add a shader framework or live-data system.
- Preserve accessibility labels and the existing compact source-footer pattern.
- Do not commit or push without explicit user instruction.

---

## File Map

| File | Responsibility |
| --- | --- |
| `presentation-japan/src/components/TokyoFrequencyResponseCaseStudy.jsx` | Focused Deck.gl map with incident and city-graph modes. |
| `presentation-japan/src/MainTalk.jsx` | Proof 2 composition and 21-slide count. |
| `presentation-japan/tests/main-talk-rendering.cjs` | Source contracts for the new scene and revised deck order. |
| `presentation-japan/tests/main-talk-browser.cjs` | Fixed incident states, camera recovery, dynamic graph, and end count. |
| `docs/slide-order.md` | Updated 21-slide Japan main-talk order. |

## Task 1: Lock the revised narrative with failing contracts

**Files:**
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/tests/main-talk-browser.cjs`
- Modify: `docs/slide-order.md`

**Consumes:** Current 23-slide `MainTalk.jsx` and evidence module.

**Produces:** Tests that require a four-step simulated Tokyo case, an animated city graph, and a 21-slide deck before production code is added.

- [ ] **Step 1: Update the slide-order source of truth**

Replace Proof 2 with:

```markdown
#### Proof 2: Respond at grid speed (4)
8. **Respond at grid speed** -- Failure-response trigger
9. **A distributed response, in seconds** -- Interactive simulated Tokyo frequency event
10. **A city is a graph problem** -- Animated recovered-state Tokyo graph
11. **The VPP is the control plane** -- Architecture, choreography, and end-to-end response loop
```

Renumber Proof 3 and Return consecutively and change the Japan main-talk heading to `21 core slides`.

- [ ] **Step 2: Add static contracts before the component exists**

Replace the Tokyo static assertions with the following additions:

```js
const frequencyCase = fs.readFileSync(path.join(__dirname, '../src/components/TokyoFrequencyResponseCaseStudy.jsx'), 'utf8');
assert.match(source, /const coreSlides = 21/);
assert.equal((source.match(/<Slide/g) || []).length, 21, 'deck has 21 core slides');
assert.match(source, /TokyoFrequencyResponseCaseStudy/);
assert.match(frequencyCase, /data-testid="tokyo-frequency-response-case"/);
assert.match(frequencyCase, /SIMULATED TOKYO EVENT/);
assert.match(frequencyCase, /EDGE RESPONSE ACTIVE/);
assert.match(frequencyCase, /data-testid="tokyo-city-graph"/);
assert.match(frequencyCase, /FlyToInterpolator/);
assert.match(frequencyCase, /MAIN_TALK_EVIDENCE\.shizenV2H/);
assert.doesNotMatch(frequencyCase, /\bMW\b|HOMES|response time/i);
```

Remove assertions for the old standalone `main-talk-response-loop` slide and `japan-vpp-map` as it is no longer in the core narrative.

- [ ] **Step 3: Add browser expectations for the new flow**

Replace the current post-Tokyo loop with:

```js
const frequencyCase = page.getByTestId('tokyo-frequency-response-case');
for (let n = 0; n < 30 && !(await frequencyCase.isVisible()); n += 1) await next();
assert.equal(await frequencyCase.isVisible(), true);
await assert.doesNotReject(() => frequencyCase.getByText('50.000 Hz').waitFor());
await page.mouse.move(720, 400); await page.mouse.down(); await page.mouse.move(820, 400, { steps: 3 }); await page.mouse.up();
await next(); await assert.doesNotReject(() => frequencyCase.getByText('SIMULATED LOCAL GENERATION LOSS').waitFor());
await next(); await assert.doesNotReject(() => frequencyCase.getByText('EDGE RESPONSE ACTIVE').waitFor());
await next(); await assert.doesNotReject(() => frequencyCase.getByText('FREQUENCY STABILISED').waitFor());
const cityGraph = page.getByTestId('tokyo-city-graph');
await next(); assert.equal(await cityGraph.isVisible(), true);
await assert.doesNotReject(() => cityGraph.getByText('TELEMETRY').waitFor());
assert.match(await cityGraph.getByTestId('main-talk-source-footer').innerText(), /186 household EVs via V2H/);
```

Change the end-card assertion to `/21\s*\/\s*21/`.

- [ ] **Step 4: Run contracts and verify RED**

Run: `rtk node presentation-japan/tests/main-talk-rendering.cjs && rtk node presentation-japan/tests/main-talk-browser.cjs`

Expected: rendering fails because `TokyoFrequencyResponseCaseStudy.jsx` does not exist; browser fails only after the rendering failure is resolved.

## Task 2: Build one focused incident-and-graph map component

**Files:**
- Create: `presentation-japan/src/components/TokyoFrequencyResponseCaseStudy.jsx`
- Test: `presentation-japan/tests/main-talk-rendering.cjs`

**Consumes:** `MAIN_TALK_EVIDENCE.shizenV2H`, `MainTalkSourceFooter`, `DeckGL`, `MapGL`, and `SlideContext`.

**Produces:** `TokyoFrequencyResponseCaseStudy({ mode, step })`; `mode` is `'incident'` or `'graph'`, and `step` is clamped inside the component.

- [ ] **Step 1: Define fixed Tokyo-area nodes and authored states**

Use anonymous, non-quantified coordinates; keep the interpolator at module scope:

```jsx
const FLY_TO = new FlyToInterpolator();
const TOKYO_NODES = [
  { id: 'home-a', position: [139.68, 35.69], kind: 'home' },
  { id: 'home-b', position: [139.73, 35.71], kind: 'home' },
  { id: 'home-c', position: [139.77, 35.66], kind: 'home' },
  { id: 'substation', position: [139.72, 35.65], kind: 'substation' },
  { id: 'market', position: [139.75, 35.69], kind: 'market' },
];
const INCIDENT_STATES = [
  { label: 'SYSTEM NOMINAL', frequency: '50.000 Hz', active: [], view: { longitude: 139.72, latitude: 35.67, zoom: 9.3, pitch: 38, bearing: -12 } },
  { label: 'SIMULATED LOCAL GENERATION LOSS', frequency: 'FREQUENCY FALLING', active: [], view: { longitude: 139.72, latitude: 35.67, zoom: 10.0, pitch: 42, bearing: -12 } },
  { label: 'EDGE RESPONSE ACTIVE', frequency: 'DIP ARRESTED', active: ['home-a', 'home-b', 'home-c'], view: { longitude: 139.74, latitude: 35.68, zoom: 10.4, pitch: 46, bearing: -12 } },
  { label: 'FREQUENCY STABILISED', frequency: '50.000 Hz', active: ['home-a', 'home-b', 'home-c'], view: { longitude: 139.72, latitude: 35.67, zoom: 9.3, pitch: 38, bearing: -12 } },
];
```

- [ ] **Step 2: Add the presenter-controlled camera recovery**

Use `SlideContext` to prevent inactive slides from resetting their view. Keep `controller` and `onViewStateChange` enabled:

```jsx
const sceneIndex = Math.min(Math.max(Number.isInteger(step) ? step : 0, 0), INCIDENT_STATES.length - 1);
const scene = INCIDENT_STATES[sceneIndex];
useEffect(() => {
  if (!isActive || mode !== 'incident') return;
  setViewState(previous => ({ ...previous, ...scene.view, transitionDuration: 900, transitionInterpolator: FLY_TO }));
}, [isActive, mode, scene]);
<DeckGL viewState={viewState} onViewStateChange={({ viewState: next }) => setViewState(next)} controller layers={layers} />
```

- [ ] **Step 3: Render the incident HUD without an unsupported number**

Render four state-specific SVG paths in an `aria-label="Illustrative frequency response trace"` SVG: a neutral 50 Hz trace, a red dip, and a green arrested/recovery trace. Use the state text rather than a claimed nadir or response duration:

```jsx
<section data-testid="tokyo-frequency-response-case" aria-label="Simulated Tokyo frequency response" ...>
  <div>SIMULATED TOKYO EVENT</div>
  <div>{scene.frequency}</div>
  <div>{scene.label}</div>
  <svg role="img" aria-label="Illustrative frequency response trace">...</svg>
  <MainTalkSourceFooter evidence={MAIN_TALK_EVIDENCE.shizenV2H} compact />
</section>
```

Use `ScatterplotLayer` for nodes and `ArcLayer` or `LineLayer` only in the recovery state. Use theme-token-derived CSS for all HUD colours; Deck.gl RGB values are local render data, not an additional visual palette.

- [ ] **Step 4: Add the graph continuation in the same component**

When `mode === 'graph'`, render the recovered-state map in a section with `data-testid="tokyo-city-graph"`. Add `LineLayer` connections between homes → substation → market and three CSS-animated DOM pulse chips above the map:

```jsx
<div data-testid="tokyo-city-graph" aria-label="Tokyo city graph control loop">
  <div className="graph-pulse graph-pulse--telemetry">TELEMETRY</div>
  <div className="graph-pulse graph-pulse--intent">DISPATCH INTENT</div>
  <div className="graph-pulse graph-pulse--ack">ACKNOWLEDGEMENT</div>
</div>
```

Define `@keyframes graphPulse` in the component and set `animationPlayState: isActive ? 'running' : 'paused'`. The component must not allocate a RAF loop or call `setState` per frame.

- [ ] **Step 5: Run the static test and verify GREEN**

Run: `rtk node presentation-japan/tests/main-talk-rendering.cjs`

Expected: exits `0` once the composition task below has updated `MainTalk.jsx`; until then it may fail only on deck count/import assertions.

## Task 3: Recompose Proof 2 and remove redundant core slides

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`

**Consumes:** `TokyoFrequencyResponseCaseStudy({ mode, step })`, `StepBridge`, `VPPArchitecture`, `ChoreographyLoop`, `ResponseTimeline`.

**Produces:** 21 core slides with four connected Proof 2 slides.

- [ ] **Step 1: Add the focused component import**

```jsx
import { TokyoFrequencyResponseCaseStudy } from './components/TokyoFrequencyResponseCaseStudy.jsx';
```

- [ ] **Step 2: Replace current Proof 2 slides with the four approved slides**

Keep the introductory slide. Replace ERAB and the static city-graph slide with:

```jsx
<Slide padding="0"><StepBridge count={4}>{step => <TokyoFrequencyResponseCaseStudy mode="incident" step={step} />}</StepBridge>
  <Notes>Simulated Tokyo event: nominal, loss, local edge response, stable. It is illustrative; the V2H source supports aggregation context only.</Notes>
</Slide>
<Slide padding="0"><Lazy><TokyoFrequencyResponseCaseStudy mode="graph" /></Lazy>
  <Notes>Recovery state becomes a graph: telemetry up, dispatch intent down, acknowledgement back.</Notes>
</Slide>
```

Combine the existing architecture, choreography, and response timeline into one dark slide labelled `The VPP is the control plane`, with each existing component in a constrained third-height region. Do not retain an independent `ERAB` or `One response loop` core slide.

- [ ] **Step 3: Change the count and maintain the final ordering**

Set `const coreSlides = 21;`. Verify JSX has exactly 21 `<Slide` occurrences and `Use demand smarter` remains immediately after the new Proof 2 control-plane slide.

- [ ] **Step 4: Run static and evidence tests**

Run: `rtk node presentation-japan/tests/main-talk-rendering.cjs && rtk node presentation-japan/tests/main-talk-evidence.cjs`

Expected: both exit `0`.

## Task 4: Validate navigation, visual states, and projection output

**Files:**
- Modify: `presentation-japan/tests/main-talk-browser.cjs`
- Temporary only: `/tmp/japan-main-talk-frequency-response.png`, `/tmp/japan-main-talk-city-graph.png`

**Consumes:** Revised core deck and the browser contracts from Task 1.

**Produces:** Verified clicker progression, exploration recovery, graph animation presence, and 21-slide end card.

- [ ] **Step 1: Make the graph browser assertion robust**

Add a `data-testid="tokyo-city-graph-pulse"` on the telemetry chip and assert it is visible; do not assert a CSS animation frame or arbitrary pixel movement:

```js
assert.equal(await cityGraph.getByTestId('tokyo-city-graph-pulse').isVisible(), true);
assert.match(await cityGraph.innerText(), /TELEMETRY.*DISPATCH INTENT.*ACKNOWLEDGEMENT/s);
```

- [ ] **Step 2: Run the full presentation checks**

Run:

```bash
rtk node presentation-japan/tests/main-talk-rendering.cjs
rtk node presentation-japan/tests/main-talk-evidence.cjs
rtk node presentation-japan/tests/main-talk-browser.cjs
rtk npm run build --prefix presentation-japan
rtk git diff --check
```

Expected: every command exits `0`; browser output has no console errors or page errors.

- [ ] **Step 3: Inspect the two presentation states**

Use Playwright at `http://localhost:3100/main-talk.html` with a 1440×900 viewport. Save `/tmp/japan-main-talk-frequency-response.png` after `EDGE RESPONSE ACTIVE`; save `/tmp/japan-main-talk-city-graph.png` after the graph slide appears. Confirm: readable 50 Hz/incident hierarchy, no clipped footer, recognisable green recovery, and all three graph-loop labels visible without overlap.

## Plan Self-Review

- **Spec coverage:** Task 1 updates the four-slide story and count; Task 2 supplies the simulated event, recovery graph, exploration, animation gating, source constraint, and accessibility; Task 3 places the revised Proof 2; Task 4 verifies behavior and projection readability.
- **YAGNI:** One new component, two deliberately narrow modes, fixed anonymous map nodes, and CSS animation. No map framework, shader, data feed, control panel, or second evidence record is added.
- **Type consistency:** `TokyoFrequencyResponseCaseStudy` is used only as `({ mode: 'incident' | 'graph', step?: number })`; `StepBridge` owns the incident `useSteps` state; `mode='graph'` has no step dependency.
- **No placeholders:** Paths, labels, test ids, commands, source choice, and state copy are defined above. The plan intentionally contains no commit step because project instructions require explicit user permission before committing.
