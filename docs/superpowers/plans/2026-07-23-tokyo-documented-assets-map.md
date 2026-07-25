# Tokyo Documented Assets Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show documented March 2022 generation-site outages and Tokyo grid pressure in Proof 2.

**Architecture:** Extend the existing `TokyoFrequencyResponseCaseStudy` data and Deck.gl layers. Keep evidence and wording in the existing research/evidence records; no dependencies or new components.

**Tech Stack:** React, Spectacle, Deck.gl, MapLibre, Node assert, Playwright.

## Global Constraints

- Three named stations only; no asserted plant MW, reserve, frequency, dispatch, or line-flow values.
- Final flexibility state must remain explicit counterfactual illustration.
- Preserve draggable map and authored clicker progression.

---

### Task 1: Add documented asset playback

**Files:**

- Modify: `presentation-japan/src/components/TokyoFrequencyResponseCaseStudy.jsx`
- Test: `presentation-japan/tests/main-talk-rendering.cjs`
- Test: `presentation-japan/tests/main-talk-browser.cjs`

- [x] **Step 1: Write failing contracts** for all three station names and the documented-outage state.
- [x] **Step 2: Run** `rtk node presentation-japan/tests/main-talk-rendering.cjs` and confirm failure.
- [x] **Step 3: Add asset pins, high-level corridors, and state-driven pressure styling** in the existing component.
- [x] **Step 4: Run rendering and browser tests** and confirm both pass.

### Task 2: Preserve research boundary

**Files:**

- Modify: `docs/research/japan-main-talk-evidence.md`

- [x] **Step 1: Add named-asset sources and excluded claims** to the March 2022 evidence record.
- [x] **Step 2: Run** `rtk node presentation-japan/tests/main-talk-evidence.cjs` to confirm evidence contracts pass.
