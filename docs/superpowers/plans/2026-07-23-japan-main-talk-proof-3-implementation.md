# Japan Main Talk Proof 3 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the six existing Proof 3 slides into a continuous home-to-fleet visual narrative without making unsupported claims.

**Architecture:** Keep the deck at 21 slides and modify `MainTalk.jsx` only. Reuse `AggregationPyramid`, `JapanVPPMap`, and claim-level source footers; add native CSS layouts inside the existing slides for the home-scale, V2H, HEMS, and illustrative fleet-response moments.

**Tech Stack:** React 18, Spectacle, existing CSS theme tokens, Node assert tests, Playwright.

## Global Constraints

- Preserve the existing 21-slide deck and all approved source/footer copy.
- Make `90% control accuracy` visibly `company-reported`.
- Make the HEMS scope visibly a demonstration and simulated capacity-market DR.
- Mark dispatch `SIMULATED` and final fleet response `ILLUSTRATIVE`; do not frame either as a Shizen result.
- Add no dependencies, new component files, or RAF loops.
- Do not commit or push.

---

### Task 1: Build the Proof 3 scale sequence

**Files:**
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/src/MainTalk.jsx`

**Interfaces:**
- Consumes: existing `Title`, `Body`, `Source`, `Lazy`, `AggregationPyramid`, and `JapanVPPMap`.
- Produces: six visually explicit Proof 3 slides, still rendered in deck order.

- [x] **Step 1: Write the failing test**

Add these assertions after the existing `Use demand smarter` assertion:

```js
assert.match(source, /HOME SCALE · DAILY FLEXIBILITY/);
assert.match(source, /186\s*HOUSEHOLD EVs/);
assert.match(source, /DEMONSTRATION SCOPE/);
assert.match(source, /SIMULATED CAPACITY-MARKET DR/);
assert.match(source, /ILLUSTRATIVE FLEET RESPONSE/);
assert.match(source, /dispatch acknowledged/);
```

- [x] **Step 2: Run test to verify it fails**

Run: `node presentation-japan/tests/main-talk-rendering.cjs`

Expected: `AssertionError` because the new labels are not yet in `MainTalk.jsx`.

- [x] **Step 3: Write minimal implementation**

In the existing Proof 3 slides in `presentation-japan/src/MainTalk.jsx`:

```jsx
<div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.16em' }}>HOME SCALE · DAILY FLEXIBILITY</div>
```

Add a three-cell demand-shift strip (solar noon, flexible load, evening peak); add a V2H case panel headed `186 HOUSEHOLD EVs`; add a HEMS home-control panel headed `DEMONSTRATION SCOPE` and `SIMULATED CAPACITY-MARKET DR`; retain the pyramid and map; replace the final plain slide with three labelled illustrative response states including `dispatch acknowledged`.

- [x] **Step 4: Run test to verify it passes**

Run: `node presentation-japan/tests/main-talk-rendering.cjs`

Expected: exit code 0.

- [x] **Step 5: Run focused visual and evidence verification**

Run:

```bash
node presentation-japan/tests/main-talk-evidence.cjs
node presentation-japan/tests/main-talk-browser.cjs
```

Expected: both exit 0 with no browser console/page errors.

- [x] **Step 6: Run production build and inspect Proof 3**

Run:

```bash
cd presentation-japan && npm run build
node presentation-japan/tests/main-talk-browser.cjs
```

Take one 1440×900 screenshot of the final Proof 3 slide and confirm its title, `ILLUSTRATIVE` qualifier, and labels do not overlap.

## Self-review

- Spec coverage: Task 1 covers all six slides, the scale sequence, evidence qualifiers, simulation labels, reuse constraints, and 1440×900 review.
- Placeholder scan: no TBD/TODO items or undefined implementation dependencies.
- Type consistency: all work uses existing JSX components and static strings; no new interfaces or types.
