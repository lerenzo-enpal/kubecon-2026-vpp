# Shizen Connect Case Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the sparse Proof 3 opening into a speaker-controlled, evidence-scoped three-step Shizen Connect V2H case animation.

**Architecture:** Replace only the Proof 3 opening `<Slide>` in `MainTalk.jsx` with a `StepBridge count={3}` scene. It renders a compact sample of generic homes, a CSS-width control-flow line, and a portfolio panel; slide 13 and 14 remain factual V2H and HEMS details, preserving 21 slides.

**Tech Stack:** React 18, Spectacle `StepBridge`, inline SVG/HTML, CSS transitions, Node `assert`, Playwright.

## Global Constraints

- Keep `const coreSlides = 21` and exactly 21 `<Slide>` tags.
- Use only `MAIN_TALK_EVIDENCE.shizenV2H` for the case footer.
- Render `186 household EVs via V2H` and `90% control accuracy · company-reported` exactly; do not add locations, time series, kW, kWh, response time, capacity, or commercial-outcome claims.
- Control request and return state say `ILLUSTRATIVE CONTROL FLOW`.
- No dependency, component file, timer, RAF loop, or auto-play.
- Do not commit without explicit user permission.

---

### Task 1: Add failing animation contracts

**Files:**
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/tests/main-talk-browser.cjs`

**Interfaces:**
- Consumes: `presentation-japan/src/MainTalk.jsx`
- Produces: static and browser contracts for `data-testid="shizen-connect-case"` and its three visible states.

- [ ] **Step 1: Add static assertions**

Add after the existing Proof 3 assertions in `main-talk-rendering.cjs`:

```js
assert.match(source, /data-testid="shizen-connect-case"/);
assert.match(source, /186 HOUSEHOLD EVs VIA V2H/);
assert.match(source, /COORDINATED CONTROL REQUEST/);
assert.match(source, /PORTFOLIO STATE/);
assert.match(source, /ILLUSTRATIVE CONTROL FLOW/);
assert.match(source, /90% CONTROL ACCURACY · COMPANY-REPORTED/);
assert.match(source, /<Source evidence=\{E\.shizenV2H\}/);
```

- [ ] **Step 2: Run static contract before implementation**

Run: `node presentation-japan/tests/main-talk-rendering.cjs`

Expected: fail because `shizen-connect-case` is absent.

- [ ] **Step 3: Add browser state contract**

Add before the existing `caseNote` lookup in `main-talk-browser.cjs`:

```js
const shizenCase = page.getByTestId('shizen-connect-case');
for (let slide = 0; slide < 30 && !(await shizenCase.isVisible()); slide += 1) await next();
assert.equal(await shizenCase.isVisible(), true);
await assert.doesNotReject(() => shizenCase.getByText('186 HOUSEHOLD EVs VIA V2H').waitFor());
await next();
await assert.doesNotReject(() => shizenCase.getByText('COORDINATED CONTROL REQUEST').waitFor());
await next();
await assert.doesNotReject(() => shizenCase.getByText('PORTFOLIO STATE').waitFor());
assert.match(await shizenCase.innerText(), /ILLUSTRATIVE CONTROL FLOW.*90% CONTROL ACCURACY · COMPANY-REPORTED/s);
```

- [ ] **Step 4: Run browser contract before implementation**

Run: `node presentation-japan/tests/main-talk-browser.cjs`

Expected: fail at `shizenCase.isVisible()` until Task 2 is complete.

### Task 2: Implement one speaker-controlled Shizen Connect case slide

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx:48-50` (current Proof 3 opening slide)

**Interfaces:**
- Consumes: `StepBridge`, `E.shizenV2H`, existing `Title`, `Body`, and `Source` primitives.
- Produces: `data-testid="shizen-connect-case"` with three Spectacle-controlled states: home cohort, control request, portfolio state.

- [ ] **Step 1: Replace the Proof 3 opening slide**

Replace its current three-cell `HOME SCALE · DAILY FLEXIBILITY` content with this `StepBridge` body. Keep it as one `<Slide {...page}>`, so the deck stays at 21 slides.

```jsx
<Slide {...page}><StepBridge count={3}>{step => {
  const phase = Math.min(Math.max(step, 0), 2);
  const states = [
    ['186 HOUSEHOLD EVs VIA V2H', 'Documented January 2024 demonstration cohort.'],
    ['COORDINATED CONTROL REQUEST', 'Control mechanics illustrated; no recorded dispatch data shown.'],
    ['PORTFOLIO STATE', 'Company-reported accuracy shown as a scoped demonstration result.'],
  ];
  const [label, detail] = states[phase];
  return <section data-testid="shizen-connect-case" style={{ minHeight: 500 }}>
    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.16em' }}>PROOF 3 · DAILY OPERATION</div>
    <Title>Use demand smarter</Title>
    <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.12em' }}>ILLUSTRATIVE CONTROL FLOW · STEP {phase + 1} OF 3</div>
    <div style={{ display: 'grid', gridTemplateColumns: '1.25fr .75fr', gap: 30, marginTop: 24, alignItems: 'center' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10 }}>
        {Array.from({ length: 48 }, (_, index) => <div key={index} style={{ height: 26, border: '1px solid var(--color-secondary)', background: phase === 2 ? 'color-mix(in srgb, var(--color-secondary) 28%, transparent)' : 'color-mix(in srgb, var(--color-secondary) 10%, transparent)', opacity: phase === 0 ? 0.72 : 1, transform: `translateY(${phase === 1 && index % 3 === 0 ? -8 : 0}px)`, transition: 'opacity 400ms ease, transform 400ms ease, background 400ms ease' }} />)}
      </div>
      <div style={{ padding: '24px 26px', borderLeft: '7px solid var(--color-secondary)', background: 'color-mix(in srgb, var(--color-secondary) 11%, transparent)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.1em' }}>{label}</div>
        <Body>{detail}</Body>
        {phase === 2 && <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)', letterSpacing: '0.08em' }}>90% CONTROL ACCURACY · COMPANY-REPORTED</div>}
      </div>
    </div>
    <div style={{ height: 7, marginTop: 24, background: 'color-mix(in srgb, var(--color-secondary) 15%, transparent)' }}><div style={{ height: '100%', width: `${(phase + 1) * 33.333}%`, background: 'var(--color-secondary)', transition: 'width 450ms ease' }} /></div>
    <Source evidence={E.shizenV2H} caseNote={{ title: 'Shizen Connect · January 2024', scope: '186 household EVs controlled through V2H', qualifier: '90% control accuracy · company-reported' }} />
  </section>;
}}</StepBridge></Slide>
```

- [ ] **Step 2: Verify static contract passes**

Run: `node presentation-japan/tests/main-talk-rendering.cjs`

Expected: exit 0.

- [ ] **Step 3: Verify evidence boundaries**

Run: `node presentation-japan/tests/main-talk-evidence.cjs`

Expected: exit 0.

### Task 3: Verify projected slide and production build

**Files:**
- No source changes expected.

**Interfaces:**
- Consumes: completed animation and existing browser/build scripts.
- Produces: visual and runtime evidence that the animation is legible at presentation size.

- [ ] **Step 1: Run browser contract**

Run: `node presentation-japan/tests/main-talk-browser.cjs`

Expected: exit 0 with no console or page errors.

- [ ] **Step 2: Build production bundle**

Run: `cd presentation-japan && npm run build`

Expected: exit 0.

- [ ] **Step 3: Inspect final state**

Open `http://localhost:3100/main-talk.html` in a 1440×900 browser, advance to `PORTFOLIO STATE`, and save screenshot to `/tmp/japan-main-talk-shizen-connect-case.png`.

Expected: all three required labels are readable; 48 sample marks do not overlap the source footer; no simulated/illustrative qualifier is obscured.

- [ ] **Step 4: Check diff whitespace**

Run: `git diff --check`

Expected: exit 0.

## Self-review

- Spec coverage: Task 2 implements all three speaker-controlled states, evidence labels, inline CSS motion, source footer, and fixed slide count; Task 1 tests those contracts; Task 3 covers runtime, build, and projection-size inspection.
- Placeholder scan: none.
- Consistency: all test labels exactly match Task 2 copy and `E.shizenV2H` is sole case evidence.
