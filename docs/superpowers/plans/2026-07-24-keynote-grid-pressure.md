# Keynote Grid Pressure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Soften keynote slide 5 and add animated distributed-energy assets to its closing slide.

**Architecture:** Keep the slide 5 copy change in its existing map component. Keep closing-slide visuals local to `Keynote.jsx` as inline accessible SVG, with CSS animations so no runtime state, dependency, or component abstraction is needed.

**Tech Stack:** React, Spectacle, CSS animation, existing keynote rendering test.

## Global Constraints

- Keynote only; preserve subtitle, closing copy, contact line, and slide order.
- No dependencies or new reusable abstraction.
- Use existing wash-paper palette and gentle staggered motion.

---

### Task 1: Cover grid pressure and distributed assets

**Files:**
- Modify: `presentation-japan/src/components/JapanColdSnapMapAnimated.jsx:10`
- Modify: `presentation-japan/src/Keynote.jsx:76-84`
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: Existing keynote slide structure and browser test harness.
- Produces: `Grid pressure`, `100K DEVICES`, and four labelled closing-slide SVG assets.

- [x] **Step 1: Write failing source and browser assertions**

```js
assert(source.includes('Grid pressure'));
assert(source.includes('100K DEVICES'));
for (const label of ['Home', 'Solar panel', 'EV', 'Battery']) {
  assert(await page.getByLabel(label).count());
}
```

- [x] **Step 2: Run test to verify it fails**

Run: `node tests/keynote-rendering.cjs`
Expected: FAIL because heading and closing assets do not yet exist.

- [x] **Step 3: Write minimal implementation**

```jsx
<svg aria-label="Home" role="img">...</svg>
```

Replace only slide 5 title and `100K HOMES`; add one small inline SVG row with CSS staggered float/pulse.

- [x] **Step 4: Run test to verify it passes**

Run: `node tests/keynote-rendering.cjs`
Expected: PASS.

- [ ] **Step 5: Commit**

Do not commit without user approval.
