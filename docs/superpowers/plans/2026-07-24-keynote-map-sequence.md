# Keynote Map Sequence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Introduce Japan's grid before energy origins and reuse the grid atlas in the Hormuz and Grid pressure scenes.

**Architecture:** `Keynote.jsx` owns the slide order. `JapanGridAtlas` remains the one base map; compact presets select its existing layers for each scene. The existing opening and pressure sequences retain their scene-specific narrative overlays.

**Tech Stack:** React 18, Spectacle, Deck.gl/MapLibre, Playwright browser regression test.

## Global Constraints

- Keynote only; do not alter the main talk.
- Preserve existing map controls, accessibility labels, and animation gating.
- No dependency or map abstraction additions.

---

### Task 1: Reorder and reuse the atlas

**Files:**
- Modify: `presentation-japan/src/Keynote.jsx`
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: `JapanGridAtlas({ step, preset })` and existing keynote slide navigation.
- Produces: grid atlas on slides 2, 4, and 5, with Energy Origins on slide 3.

- [ ] **Step 1: Write the failing source assertions**

```js
assert.match(keynoteSource, /<JapanGridAtlas[^>]*preset={keynoteAtlasPreset}/);
assert(keynoteSource.indexOf('<JapanGridAtlas') < keynoteSource.indexOf('<JapanEnergyOrigins'));
assert((keynoteSource.match(/<JapanGridAtlas/g) || []).length >= 3);
```

- [ ] **Step 2: Run the focused check to verify it fails**

Run: `node tests/keynote-rendering.cjs`

Expected: FAIL because only the existing atlas slide uses `JapanGridAtlas`.

- [ ] **Step 3: Implement the smallest slide wiring change**

```jsx
<StepBridge count={4}>{step => <JapanGridAtlas step={step} preset={keynoteAtlasPreset} />}</StepBridge>
```

Place this grid scene before `JapanEnergyOrigins`; use the same component as the base for Hormuz and Grid pressure while retaining their scene content.

- [ ] **Step 4: Run the focused check to verify it passes**

Run: `node tests/keynote-rendering.cjs`

Expected: PASS.

- [ ] **Step 5: Inspect the keynote PDF export**

Run: `PAUSE=0 PORT=3104 node scripts/export-pdf.cjs keynote`

Expected: the exported PDF includes the reordered grid, origin, Hormuz, and Grid pressure scenes.

- [ ] **Step 6: Commit**

Do not commit without explicit user approval.
