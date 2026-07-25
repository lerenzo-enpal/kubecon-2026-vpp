# Main Talk Proof 1 Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Combine the Proof 1 chapter card and its daylight problem scene into one full-bleed, clicker-driven slide.

**Architecture:** `MainTalk.jsx` owns the combined composition: a fixed Washi title panel overlays the existing `DaylightFlexibilityScene`. `StepBridge` remains the sole source of three daylight states. The rendering and browser contracts move from 26 to 25 slides.

**Tech Stack:** React 18, Spectacle, existing `StepBridge`, Node `assert`, Playwright.

## Global Constraints

- Keep the `08:00 → 12:00 → 17:00` problem states unchanged and clicker-driven.
- Preserve the Kyushu source/caveat and all existing evidence wording.
- Keep all later slides in their current order; no new dependency or component.
- Core deck is exactly 25 slides.
- No commit or push without explicit user permission.

---

### Task 1: Lock the merged-slide contract

**Files:**
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/tests/main-talk-browser.cjs`

**Consumes:** `MainTalk.jsx`, `daylight-flexibility-problem`, and `daylight-time-axis` test IDs.

**Produces:** Static and browser checks requiring one Proof 1 scene and `25 / 25` deck pagination.

- [ ] **Step 1: Change static expectations**

```js
assert.match(source, /const coreSlides = 25/);
assert.equal((source.match(/<Slide/g) || []).length, 25, 'deck has 25 core slides');
assert.match(source, /data-testid="proof-1-daylight-intro"/);
```

- [ ] **Step 2: Change browser pagination expectation**

```js
const finalCount = page.getByText(/25\s*\/\s*25/);
```

- [ ] **Step 3: Run contracts to verify they fail before the deck edit**

Run: `rtk node presentation-japan/tests/main-talk-rendering.cjs && rtk node presentation-japan/tests/main-talk-browser.cjs`

Expected: fails on the 26-slide expectation.

### Task 2: Merge Proof 1 into the daylight scene

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`

**Consumes:** `StepBridge count={3}` and `DaylightFlexibilityScene({ mode: 'problem', step })`.

**Produces:** One full-bleed Proof 1 slide with a readable Washi intro panel and three persistent time states.

- [ ] **Step 1: Set the deck count to 25**

```jsx
const coreSlides = 25;
```

- [ ] **Step 2: Replace the adjacent chapter and daylight slides with one slide**

```jsx
<Slide padding="0"><div style={{ height: '100%', position: 'relative' }}>
  <StepBridge count={3}>{step => <DaylightFlexibilityScene mode="problem" step={step} />}</StepBridge>
  <div data-testid="proof-1-daylight-intro" style={{ position: 'absolute', top: 28, left: 38, maxWidth: 520, padding: '18px 22px', background: 'color-mix(in srgb, var(--color-washi-paper) 88%, transparent)' }}>
    <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-solar)', letterSpacing: '0.16em' }}>PROOF 1</div>
    <Title>Make renewables usable</Title>
    <Body>Solar can produce abundant clean power at noon. Demand often arrives later. Flexibility closes that timing gap.</Body>
  </div>
</div><Notes>Chapter promise: renewables need timing, not only generation. Follow one day: morning balance; noon surplus; evening ramp.</Notes></Slide>
```

### Task 3: Verify the presenter flow

**Files:**
- No source changes expected.

- [ ] **Step 1: Run all relevant checks**

Run:

```bash
rtk node presentation-japan/tests/main-talk-rendering.cjs
rtk node presentation-japan/tests/main-talk-evidence.cjs
rtk node presentation-japan/tests/shizen-day-case.cjs
rtk node presentation-japan/tests/main-talk-browser.cjs
rtk npm run build --prefix presentation-japan
rtk git diff --check
```

Expected: all exit 0.

- [ ] **Step 2: Capture the merged proof scene at 1440×900**

Use Playwright at `http://localhost:3100/main-talk.html`; take the first daylight screenshot after advancing from the opening three slides to `/tmp/japan-main-talk-proof-1-merged.png`.

Expected: title panel, axis, and sunlight chart are legible without overlap.

## Plan Self-Review

- **Spec coverage:** Task 2 removes the empty chapter advance while retaining all three daylight steps; Tasks 1 and 3 verify the 25-slide contract and visual result.
- **Scope:** No copy, evidence, component, dependency, or speaker-note expansion beyond combining the two existing notes.
- **Consistency:** `StepBridge` remains mounted around the daylight scene, so Arrow navigation continues to advance its authored state before the next slide.
