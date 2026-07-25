# Japan Main Talk: Three Capabilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe the 26-slide Japan main talk as three Japan-specific flexibility proofs, with claim-level visible citations.

**Architecture:** Keep the existing React/Spectacle deck and reusable visuals. Compress repeated Japan-exposure slides into one context scene, then organize the remaining core deck around renewable timing, grid-speed response, and daily demand flexibility. Extend the evidence record so a single `Source` component renders publisher, reference/date, caveat, and a stable research anchor for every factual slide.

**Tech Stack:** React 18, Spectacle 10, Vite, Node assert tests, Playwright.

## Global Constraints

- Keep exactly 26 core Spectacle slides; technical appendix may hold FrequencyDemo.
- Reuse existing Modern Washi, DaylightFlexibilityScene, VPPArchitecture, ChoreographyLoop, ResponseTimeline, AggregationPyramid, JapanVPPMap, and MainTalkSourceFooter patterns.
- Add no dependencies.
- Every numerical, historical, regulatory, or company/program claim needs a visible claim-specific source strip.
- Company/program slides must show scope and qualifier such as `company-reported` or `demonstration scope`.
- Never render unsupported claims: `97% LNG via Hormuz`, uncited annual curtailment totals, uncaveated Shizen outcomes, or a fixed Japan household-equivalence number.
- Keep oil and LNG Hormuz transit claims distinct. Do not add either value until its exact dated primary source is recorded.

## File Map

- Modify: `presentation-japan/src/data/mainTalkEvidence.mjs` — source metadata and allowed claim copy.
- Modify: `presentation-japan/src/components/MainTalkSourceFooter.jsx` — compact source strip and optional case-note rendering.
- Modify: `presentation-japan/src/MainTalk.jsx` — 26-slide order and copy.
- Modify: `presentation-japan/tests/main-talk-evidence.cjs` — metadata and forbidden-claim checks.
- Modify: `presentation-japan/tests/main-talk-rendering.cjs` — source-strip and story-order checks.
- Modify: `presentation-japan/tests/main-talk-browser.cjs` — visible source-strip/case-note checks.
- Modify: `docs/slide-order.md` — source-of-truth slide order.
- Modify: `docs/research/japan-main-talk-evidence.md` — full citations and scope notes.
- Create only if needed: `presentation-japan/src/components/JapanContextScene.jsx` — compact sourced orientation scene. Do not create it if the existing `JapanGridMap` can host the required context without becoming unreadable.

---

### Task 1: Lock exact evidence records before slide copy

**Files:**
- Modify: `docs/research/japan-main-talk-evidence.md`
- Modify: `presentation-japan/src/data/mainTalkEvidence.mjs`
- Test: `presentation-japan/tests/main-talk-evidence.cjs`

**Interfaces:**
- Produces `MAIN_TALK_EVIDENCE[name]` records with `value`, `label`, `sourceLabel`, `sourceUrl`, `sourceYear`, `reference`, `notes`, and `researchAnchor`.
- Consumes exact primary URLs and dates recorded in `docs/research/japan-main-talk-evidence.md`.

- [ ] **Step 1: Write failing evidence assertions**

```js
for (const [name, evidence] of Object.entries(MAIN_TALK_EVIDENCE)) {
  for (const field of ['value', 'label', 'sourceLabel', 'sourceUrl', 'sourceYear', 'reference', 'notes', 'researchAnchor']) {
    assert.ok(evidence[field], `${name} requires ${field}`);
  }
  assert.match(evidence.researchAnchor, /^#[-a-z0-9]+$/);
}
assert.doesNotMatch(JSON.stringify(MAIN_TALK_EVIDENCE), /97% LNG via Hormuz/i);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd presentation-japan && rtk node tests/main-talk-evidence.cjs`

Expected: failure for missing `reference` and `researchAnchor` fields.

- [ ] **Step 3: Record only supported evidence**

Add exact citation metadata for:

```js
kyushuControl: {
  value: '5.09 GW',
  reference: 'Output-control history · 4 May 2025 · 12:00–12:30',
  notes: 'Maximum power control; power, not curtailed energy.',
  researchAnchor: '#kyushu-output-control',
}
```

Add similarly complete records for FY2023 primary-energy self-sufficiency, JEPX chart range, ERAB framework, Shizen’s Jan 2024 V2H demonstration, and the Kansai/Shizen HEMS capacity-market demonstration. Put `company-reported` beside the Shizen 90% accuracy claim. Do not add any number that lacks an exact source URL, publisher, and reporting period.

- [ ] **Step 4: Update research log**

For every record, add its full URL, citation label/date, exact approved slide wording, and a `Do not say` caveat. Include the oil/LNG Hormuz separation and explicitly reject `97% LNG via Hormuz`.

- [ ] **Step 5: Run evidence test**

Run: `cd presentation-japan && rtk node tests/main-talk-evidence.cjs`

Expected: exit 0.

### Task 2: Make citations visible and reusable

**Files:**
- Modify: `presentation-japan/src/components/MainTalkSourceFooter.jsx`
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/tests/main-talk-browser.cjs`

**Interfaces:**
- `MainTalkSourceFooter({ evidence, detailUrl, caseNote })` renders `data-testid="main-talk-source-footer"` with source label, reference, notes, and research link.
- `caseNote` is optional `{ title, scope, qualifier }` and renders `data-testid="main-talk-case-note"`.

- [ ] **Step 1: Write failing rendering checks**

```js
assert.match(source, /evidence\.reference/);
assert.match(source, /evidence\.notes/);
assert.match(source, /data-testid="main-talk-case-note"/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs`

Expected: assertion failure because the footer only renders publisher and year.

- [ ] **Step 3: Implement source strip**

Render the footer as one compact visual strip:

```jsx
<span>Source: {evidence.sourceLabel} · {evidence.reference}</span>
<span> · {evidence.notes}</span>
<span> · {detailUrl}{evidence.researchAnchor}</span>
```

When `caseNote` exists, add a compact card above the source strip showing its title, scope, qualifier, and source label. Keep it readable at 1440×900 and do not cover scene controls.

- [ ] **Step 4: Add browser assertion**

Navigate to the Kyushu slide and assert source-strip text includes `power, not curtailed energy`. Navigate to the Shizen slide and assert `main-talk-case-note` contains `company-reported` or `demonstration scope`.

- [ ] **Step 5: Run checks**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs && rtk node tests/main-talk-browser.cjs`

Expected: both exit 0 with no page errors.

### Task 3: Reorder the core deck around three proofs

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Modify: `docs/slide-order.md`
- Test: `presentation-japan/tests/main-talk-rendering.cjs`

**Interfaces:**
- `MainTalk` keeps `const coreSlides = 26` and 26 `<Slide>` elements.
- Existing lazy visual components retain their active-slide behavior.

- [ ] **Step 1: Write failing slide-order assertions**

```js
assert.match(source, /Make renewables usable/);
assert.match(source, /Respond at grid speed/);
assert.match(source, /Use demand smarter/);
assert.doesNotMatch(source, /<Act number="I">Japan cannot borrow/);
assert.doesNotMatch(source, /<Lazy><FrequencyDemo/);
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs`

Expected: failure because the current deck has Act I and core FrequencyDemo.

- [ ] **Step 3: Compress orientation to three slides**

Keep title and question. Replace slides 3–8 with a single sourced `Japan cannot borrow` context scene combining island constraint, 50/60 Hz seam, FY2023 primary-energy self-sufficiency, and thin-reserve premise. Reuse `JapanGridMap`; create `JapanContextScene.jsx` only if overlay composition cannot remain legible.

- [ ] **Step 4: Build Proof 1 in slides 4–10**

Keep the problem and response DaylightFlexibilityScene sequences plus the Kyushu 5.09 GW slide. Add only the missing narrative beats: solar timing mismatch, `store it for later` outcome, and Shizen Connect source card. Keep the visual response explicitly illustrative.

- [ ] **Step 5: Build Proof 2 in slides 11–16**

Use a failure trigger as the chapter entry. Keep ERAB, city graph, VPP architecture, choreography, and response loop. Remove the visible Act III card and move FrequencyDemo out of the core sequence for technical appendix use.

- [ ] **Step 6: Build Proof 3 in slides 17–22**

Create daily-demand scenes for Shizen V2H, Kansai/Shizen HEMS demonstration, aggregation, simulated Japan dispatch, and portfolio response. The simulated map remains explicitly simulated; Shizen material receives `caseNote` scope text.

- [ ] **Step 7: Preserve return in slides 23–26**

Keep cloud-native build patterns, trusted-capacity close without a fixed household number, research links, and final line.

- [ ] **Step 8: Update the slide-order source of truth**

Replace `Japan Main Talk (26 core slides)` with the 3/7/6/6/4 grouping and exact slide titles.

- [ ] **Step 9: Run rendering test**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs`

Expected: exit 0 and exactly 26 `<Slide>` tags.

### Task 4: Verify visual flow and build

**Files:**
- Modify only if test failures reveal a source-strip overlap or stale copy.
- Test: `presentation-japan/tests/main-talk-browser.cjs`

**Interfaces:**
- Browser test reaches daylight problem, Kyushu evidence, Shizen case note, source strip, simulated dispatch, and 26/26 chrome without console/page errors.

- [ ] **Step 1: Expand browser journey**

Add locator checks for the three chapter titles and source-strip content while advancing the deck. Keep the test’s bounded arrow-key loop pattern.

- [ ] **Step 2: Run focused checks**

Run:

```bash
cd presentation-japan
rtk node tests/main-talk-evidence.cjs
rtk node tests/main-talk-rendering.cjs
rtk node tests/main-talk-browser.cjs
```

Expected: all exit 0.

- [ ] **Step 3: Run production build**

Run: `cd presentation-japan && rtk npm run build`

Expected: exit 0.

- [ ] **Step 4: Capture one review screenshot**

At 1440×900, capture the Shizen case-note slide or Kyushu source-strip slide to `/tmp/`. Confirm source strip is legible and does not overlap controls or slide numbering.

## Plan Self-Review

- Spec coverage: Tasks 1–2 implement claim validation and visible citations; Task 3 implements all three proof chapters and preserves 26 slides; Task 4 covers browser rendering and production build.
- Placeholder scan: no unresolved implementation instructions.
- Interface consistency: evidence records provide all fields consumed by `MainTalkSourceFooter`; optional `caseNote` is defined before its use in Task 3.
