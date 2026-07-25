# Japan Main Talk Projection Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the existing 26-slide Japan main talk projection-ready with Washi narrative slides and dark live response/map demos.

**Architecture:** Keep `MainTalk.jsx` as deck composition. Reuse the existing daylight scene, response timeline, and interactive map; add only narrow visual props and local SVG/HTML treatments needed by the approved slide inventory. No new data model, source, slide, or dependency.

**Tech Stack:** React 18, Spectacle, SVG, Canvas, Deck.gl, MapLibre, Playwright, Node `assert`.

## Global Constraints

- Core deck remains exactly 26 slides.
- Washi is default; dark only response loop (16) and interactive dispatch map (21–22).
- Existing evidence, footers, source wording, and `SIMULATED DISPATCH` labels remain unchanged.
- `ArrowRight` advances authored demo states; map drag/zoom remains available and the next Arrow restores the authored view.
- Reuse existing components before creating anything new. No dependencies.
- RAF work remains gated by `SlideContext.isSlideActive`; no per-frame React state.
- No commit or push without explicit user permission.

---

## File Map

| File | Responsibility |
|---|---|
| `presentation-japan/src/MainTalk.jsx` | Approved 26-slide composition and local Washi visual treatments. |
| `presentation-japan/src/components/DaylightFlexibilityScene.jsx` | Persistent 08:00 → 12:00 → 17:00 daylight scene. |
| `presentation-japan/src/components/JapanGridMap.jsx` | Map-first opening in a light/Washi visual variant. |
| `presentation-japan/src/components/JapanVPPMap.jsx` | Dark, authored map states that recover after optional exploration. |
| `presentation-japan/src/components/ResponseTimeline.jsx` | Dark response loop with fixed presenter states. |
| `presentation-japan/tests/main-talk-browser.cjs` | Browser contracts for opening, visual modes, demo state, and 26-slide count. |

### Task 1: Lock visual contracts in browser test

**Files:**
- Modify: `presentation-japan/tests/main-talk-browser.cjs`

**Consumes:** Existing `data-testid` contracts and `main-talk.html` route.

**Produces:** Assertions for map-first opening, persistent daylight sequence, dark demos, simulated dispatch, and slide count.

- [ ] **Step 1: Add failing visual-state assertions after `page.goto`**

```js
await assert.doesNotReject(() => page.getByTestId('main-talk-opening-map').waitFor());
assert.match(await page.getByTestId('main-talk-opening-map').getAttribute('data-variant'), /washi/);
await assert.doesNotReject(() => page.getByTestId('daylight-time-axis').waitFor());
await assert.doesNotReject(() => page.getByTestId('main-talk-response-loop').waitFor());
await assert.doesNotReject(() => page.getByTestId('japan-vpp-map').waitFor());
assert.match(await page.getByTestId('japan-vpp-map').innerText(), /SIMULATED DISPATCH/);
```

- [ ] **Step 2: Run test; verify failure**

Run: `rtk node presentation-japan/tests/main-talk-browser.cjs`

Expected: fails because new test IDs do not exist.

- [ ] **Step 3: Preserve existing evidence and 26-slide checks**

Keep current assertions for `kyushu-control-marker`, `main-talk-source-footer`, visible Shizen case note, browser console errors, and `26 / 26`.

### Task 2: Recompose opening and continuous daylight proof

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Modify: `presentation-japan/src/components/JapanGridMap.jsx`
- Modify: `presentation-japan/src/components/DaylightFlexibilityScene.jsx`
- Test: `presentation-japan/tests/main-talk-browser.cjs`

**Consumes:** `JapanGridMap({ showSeam, height })`, `DaylightFlexibilityScene({ mode, step })`, evidence module, and source footer.

**Produces:** Slides 1–10 match map-first exposure and a persistent one-day visual sequence.

- [ ] **Step 1: Add `variant` to `JapanGridMap`**

```jsx
export function JapanGridMap({ showSeam = false, height = 480, variant = 'dark' }) {
  const washi = variant === 'washi';
  return <div data-testid="main-talk-opening-map" data-variant={variant} style={{ position: 'relative', width: '100%', height }}>
    {/* existing DeckGL map; replace dark-only overlay colors with washi ? token values : current values */}
  </div>;
}
```

Use existing view and layer data. For `washi`, use paper background, indigo labels, amber 60 Hz, and vermilion seam. Keep dark styling unchanged for other consumers.

- [ ] **Step 2: Replace slides 1–3 in `MainTalk.jsx`**

```jsx
<Slide padding="0"><div style={{ height: '100%', position: 'relative', background: 'var(--color-washi-paper)' }}>
  <Lazy><JapanGridMap variant="washi" height={580} /></Lazy>
  <div>{/* ISLAND SYSTEM / Japan cannot borrow / Every imbalance is solved at home. */}</div>
</div></Slide>
<Slide {...page}>{/* 50 Hz · 60 Hz seam and one question */}</Slide>
<Slide {...page}>{/* 15.3% self-sufficiency + E.japanEnergy footer */}</Slide>
```

Use `Japan cannot borrow` only in opening; retain `Japan needs flexibility` for slide 26.

- [ ] **Step 3: Persist time axis in `DaylightFlexibilityScene`**

```jsx
<div data-testid="daylight-time-axis" aria-label="08:00 to 17:00 timeline">
  {['08:00', '12:00', '17:00'].map(time => <span key={time}>{time}</span>)}
</div>
```

Render it for both `problem` and `response`. Retain exact Kyushu marker, evidence footer, and illustrative-device label. Do not add a Shizen-performance claim.

- [ ] **Step 4: Run browser test; verify pass**

Run: `rtk node presentation-japan/tests/main-talk-browser.cjs`

Expected: exit 0; opening map, axis, Kyushu marker, evidence footer, Shizen case note, and 26-slide count render.

### Task 3: Apply Washi grammar outside live demos

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Test: `presentation-japan/tests/main-talk-browser.cjs`

**Consumes:** Existing `VPPArchitecture`, `ChoreographyLoop`, `AggregationPyramid`, theme tokens, and slide source footer.

**Produces:** Slides 11–15, 17–20, and 23–26 use one claim plus one quiet visual signal on paper.

- [ ] **Step 1: Replace dark component mounts on Washi slides with minimal inline SVG/HTML plates**

Use only local slide JSX. Required signals:

```jsx
// 12: ERAB — retailer / aggregator / grid contract chain
// 13: city graph — homes, substations, market as labeled nodes and links
// 14: control plane — telemetry → state → intent → device
// 15: choreography — local rule plus shared intent
// 20: aggregation — device → neighborhood → portfolio
// 23: event streams / actors / GitOps / traces
```

Each plate uses `var(--color-washi-paper)`, `var(--color-washi-ink)`, `var(--color-washi-solar)`, and `var(--color-washi-alert)` only. Keep body text at least 20px and source footers where facts appear.

- [ ] **Step 2: Keep verified EV and HEMS slides factual and spare**

Keep existing `E.shizenV2H`, `E.kansaiHems`, source footer, and case-note props. Add one large value and one device silhouette per slide; do not add new numbers.

- [ ] **Step 3: Return slide 23–26 to paper**

Use four capability tiles on slide 23, a resolving-home-network visual on slide 24, readable research link/QR placeholder only if existing asset supports it on slide 25, and `Japan needs flexibility` on 26. Do not invent a QR asset.

- [ ] **Step 4: Run browser test and inspect source text**

Run: `rtk node presentation-japan/tests/main-talk-browser.cjs`

Expected: exit 0; no new browser console errors and all existing evidence/case text remains reachable.

### Task 4: Build dark presenter-controlled demos

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Modify: `presentation-japan/src/components/ResponseTimeline.jsx`
- Modify: `presentation-japan/src/components/JapanVPPMap.jsx`
- Test: `presentation-japan/tests/main-talk-browser.cjs`

**Consumes:** Existing `SlideContext`, map `STEPS`, shared `FLY_TO`, and current DeckGL controller.

**Produces:** Slide 16 response loop and slides 21–22 dispatch map are the only dark operational scenes.

- [ ] **Step 1: Wrap response timeline in a dark operational scene**

```jsx
<div data-testid="main-talk-response-loop" style={{ minHeight: 610, background: 'var(--color-bg)' }}>
  <div>{/* STATE x / y, title, source-free operational copy */}</div>
  <Lazy><ResponseTimeline /></Lazy>
</div>
```

Use `StepBridge` for finite response states; do not change `ResponseTimeline` animation loop unless it needs an `isSlideActive` dependency fix.

- [ ] **Step 2: Give `JapanVPPMap` an explicit root test ID and authored-view recovery**

```jsx
<div data-testid="japan-vpp-map" style={{ position: 'relative', width: '100%', height }}>
```

Retain `controller={true}` and `onViewStateChange`. On Arrow step change, spread `STEPS[step].view` into `viewState` with the existing `FlyToInterpolator`; this restores the authored camera after manual pan/zoom. Keep `SIMULATED DISPATCH` labels and all illustrative MW/home values.

- [ ] **Step 3: Limit dark treatment to slides 16, 21, and 22**

Use `page`/Washi background for all other slides. Do not change global theme selection behavior.

- [ ] **Step 4: Run browser test; verify pass**

Run: `rtk node presentation-japan/tests/main-talk-browser.cjs`

Expected: exit 0; response and map test IDs render, map text includes `SIMULATED DISPATCH`, and no page errors occur.

### Task 5: Visual verification and build

**Files:**
- Modify: `presentation-japan/tests/main-talk-browser.cjs` only if a discovered contract is missing.
- Temporary: `/tmp/japan-main-talk-opening.png`, `/tmp/japan-main-talk-daylight.png`, `/tmp/japan-main-talk-response.png`, `/tmp/japan-main-talk-map.png`

**Consumes:** Vite dev server at `http://localhost:3100/main-talk.html`.

**Produces:** Projection-size visual evidence and clean build.

- [ ] **Step 1: Run static and browser checks**

Run:

```bash
rtk node presentation-japan/tests/main-talk-evidence.cjs
rtk node presentation-japan/tests/shizen-day-case.cjs
rtk node presentation-japan/tests/main-talk-browser.cjs
```

Expected: all exit 0.

- [ ] **Step 2: Capture four visual states**

Use Playwright at 1440×900. Capture opening exposure, 12:00 state, response loop, and simulated dispatch map to `/tmp/`. Check readable source footer, visual hierarchy, no clipped labels, and explicit simulation label.

- [ ] **Step 3: Build and inspect diff**

Run:

```bash
cd presentation-japan && rtk npm run build
cd .. && rtk git diff --check
rtk git diff -- presentation-japan docs/superpowers
```

Expected: build exits 0; no whitespace errors; diff limited to planned presentation and planning files.

## Plan Self-Review

- **Spec coverage:** Tasks 2–4 cover approved opening, continuous day, Washi default, dark demos, interactive authored map, and 26-slide preservation. Task 5 verifies projection states.
- **Scope:** No new sources, facts, slides, dependencies, website work, speaker notes, or QR asset creation.
- **Consistency:** Existing `StepBridge`, `SlideContext`, `FlyToInterpolator`, source footer, and `SIMULATED DISPATCH` contracts stay intact.
