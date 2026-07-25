# Japan Main Talk Act II Time Story Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Act II explain Japan's daily flexibility problem through two step-driven daylight scenes, a sourced Kyushu curtailment proof, and a clean bridge to Act III.

**Architecture:** Replace the three existing Act II slides with four slides: a `problem` daylight scene, a factual evidence beat, a `response` daylight scene, and a graph/control-plane bridge. One local SVG component owns the reusable scene geometry and accepts `mode` and Spectacle `step`; `MainTalk.jsx` only composes slides. Evidence remains in the existing central data object and the existing footer renders source attribution.

**Tech Stack:** React 18, Spectacle 10, SVG/CSS, Vite, Playwright.

## Global Constraints

- Preserve exactly 26 core slides.
- Use no new dependency and no interactive map for Act II.
- Gate step-driven content through `StepBridge`; no new RAF loop.
- State the verified Kyushu interval as maximum renewable-output control (power), never curtailed energy.
- Label the device response illustrative; do not attribute it to Shizen Connect.
- Do not commit or push without explicit user permission.

---

### Task 1: Specify and test the two daylight scenes

**Files:**
- Create: `presentation-japan/src/components/DaylightFlexibilityScene.jsx`
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/tests/main-talk-browser.cjs`

**Interfaces:**
- Consumes: `mode: 'problem' | 'response'`, `step: number`.
- Produces: active scene sections with `data-testid="daylight-flexibility-problem"` and `data-testid="daylight-flexibility-response"`.

- [x] **Step 1: Write the failing assertions**

```js
assert.match(source, /DaylightFlexibilityScene/);
assert.match(source, /daylight-flexibility-problem/);
assert.match(source, /daylight-flexibility-response/);
```

Add browser assertions that each scene becomes visible and that the problem scene reaches `12:00` while the response scene contains `Illustrative device response`.

- [x] **Step 2: Run the browser check to verify it fails**

Run: `rtk node tests/main-talk-browser.cjs`

Expected: FAIL because neither daylight-scene test id exists.

- [x] **Step 3: Implement the minimal reusable SVG scene**

```jsx
export function DaylightFlexibilityScene({ mode, step = 0 }) {
  const response = mode === 'response';
  const phase = Math.min(Math.max(step, 0), 2);
  return <section data-testid={`daylight-flexibility-${mode}`}>...</section>;
}
```

Render the same net-load path in both modes, move the sun and time label across the three phases, add the 5.09 GW marker only at the noon problem phase, and show three simple device-state chips only in response mode.

- [x] **Step 4: Run focused checks**

Run: `rtk node tests/main-talk-rendering.cjs && rtk node tests/main-talk-browser.cjs`

Expected: both PASS with no page errors.

### Task 2: Make the Kyushu fact first-class evidence and compose the four-slide Act II

**Files:**
- Modify: `presentation-japan/src/data/mainTalkEvidence.mjs`
- Modify: `presentation-japan/src/MainTalk.jsx`
- Modify: `presentation-japan/tests/main-talk-evidence.cjs`
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`

**Interfaces:**
- Consumes: `MAIN_TALK_EVIDENCE.kyushuControl`.
- Produces: two `StepBridge count={3}` daylight scenes, a Kyushu proof slide, and an Act III bridge while retaining `coreSlides = 26`.

- [x] **Step 1: Write failing evidence and composition assertions**

```js
assert.equal(MAIN_TALK_EVIDENCE.kyushuControl.value, '5.09 GW');
assert.match(source, /4 May 2025.*12:00/);
assert.match(source, /A city is a graph problem/);
assert.equal((source.match(/<Slide/g) || []).length, 26);
```

- [x] **Step 2: Run the evidence and rendering checks to verify failure**

Run: `rtk node tests/main-talk-evidence.cjs && rtk node tests/main-talk-rendering.cjs`

Expected: FAIL because `kyushuControl` and the new Act II composition do not exist.

- [x] **Step 3: Add the verified record and replace the old Act II sequence**

```js
kyushuControl: {
  value: '5.09 GW',
  label: 'Maximum renewable-output control, Kyushu mainland',
  sourceUrl: 'https://www.kyuden.co.jp/td_power_usages/out_ctrl_history.html',
  sourceYear: 'FY2025',
}
```

Use this wording in the proof beat: `4 May 2025 · 12:00–12:30` and `Kyushu T&D recorded up to 5.09 GW of renewable-output control.` Replace the old Act II divider/chart/Shizen card/VPP chart slides with the new scenes, proof, and bridge. Remove unused imports.

- [x] **Step 4: Run focused checks**

Run: `rtk node tests/main-talk-evidence.cjs && rtk node tests/main-talk-rendering.cjs`

Expected: both PASS; source count remains 26.

### Task 3: Verify the full deck and document the changed narrative

**Files:**
- Modify: `presentation-japan/tests/main-talk-browser.cjs`
- Modify: `docs/slide-order.md`

- [x] **Step 1: Extend the failing browser journey**

```js
assert.equal(await page.getByTestId('daylight-flexibility-problem').isVisible(), true);
assert.equal(await page.getByText(/5\.09 GW of renewable-output control/).isVisible(), true);
assert.equal(await page.getByText(/Illustrative device response/).isVisible(), true);
```

Collect both `console` errors and `pageerror` messages before asserting the deck reaches `26 / 26`.

- [x] **Step 2: Run it to verify the expected failure**

Run: `rtk node tests/main-talk-browser.cjs`

Expected: FAIL until the new flow and exact copy are in place.

- [x] **Step 3: Update the slide-order entry and complete browser coverage**

List Act II as problem scene → Kyushu proof → response scene → graph bridge. Keep speaker-facing labels concise and cite the primary record in the proof slide footer.

- [x] **Step 4: Run the full verification set**

Run: `rtk node tests/main-talk-evidence.cjs && rtk node tests/main-talk-rendering.cjs && rtk node tests/main-talk-browser.cjs && rtk npm run build`

Expected: all checks PASS; no console/page errors; production build succeeds.

## Self-review

- Spec coverage: Tasks 1–2 cover both scenes, time/sun visual language, verified power wording, Shizen caveat, graph bridge, and 26-slide count; Task 3 covers the requested browser checks and slide order.
- No placeholders: all component names, source text, test ids, commands, and source URL are concrete.
- Scope: one component, one evidence record, one deck composition, existing tests; no map, dependency, or inferred operating data.
