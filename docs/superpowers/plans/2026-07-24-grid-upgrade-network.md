# Grid Upgrade Network Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn main-talk slide 2 into an animated, step-driven connected network: Grid → Batteries + internet → New capabilities.

**Architecture:** Reuse `CapabilityMotif` and its Anime.js hook for a `network` variant. `MainTalk` hosts the authored step state through `StepBridge`, while the motif renders each visible stage and gates its timeline on Spectacle’s active-slide context.

**Tech Stack:** React 18, Spectacle, Anime.js, existing project test scripts.

## Global Constraints

- Reuse `useAnimeTimeline`; add no dependency.
- Use only existing CSS theme tokens and modern-washi colors.
- Keep all animation inactive when its slide is inactive.
- Do not commit or push without explicit user permission.

---

### Task 1: Specify the network variant in the source test

**Files:**
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`

**Interfaces:**
- Consumes: `presentation-japan/src/MainTalk.jsx`, `presentation-japan/src/components/CapabilityMotif.jsx`
- Produces: source-level regression coverage for `<CapabilityMotif variant="network" step={step} />` and its semantic stages.

- [ ] **Step 1: Write the failing test**

Add assertions:

```js
assert.match(motif, /capability-motif-network/);
assert.match(source, /<CapabilityMotif variant="network" step=\{step\}/);
assert.match(source, /<StepBridge count=\{2\}>\{step => <CapabilityMotif variant="network" step=\{step\}/);
assert.match(motif, /BATTERIES \+ INTERNET/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs`

Expected: assertion failure because the network variant does not exist.

### Task 2: Add the reusable animated network motif

**Files:**
- Modify: `presentation-japan/src/components/CapabilityMotif.jsx`

**Interfaces:**
- Consumes: `variant`, optional `step`, `useAnimeTimeline`, `SlideContext`
- Produces: `<CapabilityMotif variant="network" step={step} />`

- [ ] **Step 1: Implement the minimum network branch**

Extend the component signature to `({ variant, step = 2 })`. For `variant === 'network'`, render a wide SVG with labelled node groups for `GRID TODAY`, `BATTERIES + INTERNET`, and `NEW CAPABILITIES`. Use `step >= 0`, `step >= 1`, and `step >= 2` to reveal them in order; hide unrevealed later groups with SVG opacity.

Add a short left-to-right connector line between stages and use the existing `[data-motif-pulse]` selector for small travelling/pulsing circles. Read `SlideContext` and create/pause the Anime.js timeline only when `isSlideActive` is true.

- [ ] **Step 2: Run the source test**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs`

Expected: PASS.

### Task 3: Replace slide 2’s cards with the step-driven network

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`

**Interfaces:**
- Consumes: `StepBridge`, `CapabilityMotif` network variant
- Produces: slide 2 with three authored reveal stages.

- [ ] **Step 1: Replace the card grid**

Replace the current three-card `GRID TODAY` / `BATTERIES + INTERNET` / `NEW CAPABILITIES` grid in the second `<Slide {...page}>` with:

```jsx
<StepBridge count={2}>
  {step => <CapabilityMotif variant="network" step={step} />}
</StepBridge>
```

Keep the existing eyebrow, `Improve the grid: add batteries + internet` title, and `Source evidence={E.japanEnergy}` footer; place the motif below the title with enough height to fill the slide.

- [ ] **Step 2: Run all main-talk checks**

Run:

```bash
cd presentation-japan && rtk node tests/main-talk-rendering.cjs
cd presentation-japan && rtk node tests/main-talk-browser.cjs
cd presentation-japan && rtk npm run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Visually verify once**

Open `http://localhost:3100/main-talk.html`, advance once to slide 2, then advance through all three step states. Capture one screenshot to `/tmp/` and confirm a full-width, readable left-to-right network with no clipped labels or teal frame.
