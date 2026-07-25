# Japan Main Talk Cohesion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `main-talk.html` into a 26-slide, source-backed Japan story with a Modern Washi narrative layer and dark live-system demos.

**Architecture:** Keep `MainTalk.jsx` as deck composition and reuse existing maps, charts, and technical demonstrations. Add only three focused units: verified evidence data, a small source footer / case card pair, and a step-driven Shizen single-day scene. Apply Washi narrative styling using theme tokens; retain the dark presentation theme for interactive technical slides.

**Tech Stack:** React 18, Spectacle 10, Vite, existing SVG / Canvas components, Deck.gl + MapLibre, Node `assert`, Playwright / Chrome.

## Global Constraints

- No hardcoded new component colors: extend `presentation-japan/src/theme.japan.js` with named tokens and consume CSS variables / tokens.
- Use `LazyContent` for heavy components; do not directly wrap `useSteps` components.
- Gate animation work with `SlideContext.isSlideActive`; do not call React state every animation frame.
- All canvas text is at least 14px; all normal projected content is at least 20px.
- Facts need a visible publisher / dataset / year footer. Speaker notes must contain exact source, date range, caveat, and backup point.
- Shizen facts and Japan portfolio capacity must come from named primary sources. Do not retain placeholder simulated MW/home counts as real outcomes.
- No new dependencies. Do not commit or push without explicit user instruction.

---

## File Map

| File | Responsibility |
|---|---|
| `docs/research/japan-main-talk-evidence.md` | Primary-source research log, approved wording, citation URLs, and caveats. |
| `presentation-japan/src/data/mainTalkEvidence.mjs` | Small, reviewed source-of-truth object consumed by deck copy and source labels. |
| `presentation-japan/src/components/MainTalkSourceFooter.jsx` | Quiet on-slide factual source footer plus accessible URL. |
| `presentation-japan/src/components/ShizenDayCase.jsx` | Three-step, 12:00 → 17:00 → response narrative scene. |
| `presentation-japan/src/theme.japan.js` | Washi semantic tokens for each existing dark/light/hybrid theme. |
| `presentation-japan/src/locales/en.js` | Copy keys for new deck titles, citations, source link, and validated closing capacity. |
| `presentation-japan/src/MainTalk.jsx` | 26-slide composition, section/speaker metadata, notes, and moved appendix slides. |
| `presentation-japan/tests/main-talk-rendering.cjs` | Rendering / slide-count / source-footer / case-sequence regression. |
| `website/src/pages/research/topics/japan-energy-flexibility.astro` | Japan research page linked from source footers and closing slide. |

### Task 1: Establish a verified Japan evidence set

**Files:**
- Create: `docs/research/japan-main-talk-evidence.md`
- Create: `presentation-japan/src/data/mainTalkEvidence.mjs`
- Create: `presentation-japan/tests/main-talk-evidence.cjs`

**Consumes:** Existing factual copy in `presentation-japan/src/locales/en.js`, chart labels, and research links in `docs/`.

**Produces:** `MAIN_TALK_EVIDENCE` with only approved public facts, each shaped as `{ value, label, sourceLabel, sourceUrl, sourceYear, notes }`.

- [ ] **Step 1: Gather primary sources and write the research log**

  Add five evidence records with URL, publication date, retrieved date, exact usable wording, and caveat:

  ```md
  ## Shizen Connect
  - Primary source: exact official company or program URL
  - Approved wording: exact region, asset type, and service wording from source
  - Excluded claims: any device count, MW, heat-pump role, or market role not stated by that source
  ```

  Required records: Shizen Connect, ERAB/OCCTO, JEPX 2021, Kyushu curtailment/Tokyo, Japan energy and LNG dependency.

- [ ] **Step 2: Replace every speculative claim with either sourced copy or an explicit simulation label**

  For example, `334 MW / 14,600 homes` remains usable only as `SIMULATED DISPATCH SCENARIO`; otherwise replace it with a verified Japan portfolio statistic from the research log.

- [ ] **Step 3: Add the evidence module**

  Define `MAIN_TALK_EVIDENCE` with one object per approved research-log record. Every object has `value`, `label`, `sourceLabel`, `sourceUrl`, `sourceYear`, and `notes`. Copy the exact primary URL and the approved wording from Step 1; do not infer either from secondary reporting or an existing deck claim.

- [ ] **Step 4: Add a minimal evidence integrity test**

  ```js
  import assert from 'node:assert/strict';
  import { MAIN_TALK_EVIDENCE } from '../src/data/mainTalkEvidence.mjs';

  for (const [name, evidence] of Object.entries(MAIN_TALK_EVIDENCE)) {
    assert.ok(evidence.value, `${name} requires a value`);
    assert.ok(evidence.sourceLabel, `${name} requires a visible source label`);
    assert.match(evidence.sourceUrl, /^https:\/\//, `${name} requires an HTTPS source URL`);
  }
  ```

- [ ] **Step 5: Verify evidence module**

  Run: `rtk node presentation-japan/tests/main-talk-evidence.cjs`

  Expected: exit 0; every displayable evidence item has a source label and HTTPS primary URL.

### Task 2: Add Washi semantic tokens and reusable source treatment

**Files:**
- Modify: `presentation-japan/src/theme.japan.js`
- Create: `presentation-japan/src/components/MainTalkSourceFooter.jsx`
- Test: `presentation-japan/tests/main-talk-evidence.cjs`

**Consumes:** `themes` from `theme.japan.js` and `MAIN_TALK_EVIDENCE` entries.

**Produces:** `MainTalkSourceFooter({ evidence, detailUrl })` and semantic values `--color-washi-paper`, `--color-washi-ink`, `--color-washi-alert`, `--color-washi-solar` for all three themes.

- [ ] **Step 1: Extend each theme with Washi semantic tokens**

  ```js
  '--color-washi-paper': '#E8E4D4',
  '--color-washi-ink': '#172554',
  '--color-washi-alert': '#B91C1C',
  '--color-washi-solar': '#D97706',
  ```

  Use matching accessible variants in light and hybrid themes. Existing dark color roles remain unchanged.

- [ ] **Step 2: Implement source footer with one responsibility**

  ```jsx
  export function MainTalkSourceFooter({ evidence, detailUrl }) {
    return (
      <footer data-testid="main-talk-source-footer">
        Source: {evidence.sourceLabel} · {evidence.sourceYear}
        {detailUrl && <span> · {detailUrl}</span>}
      </footer>
    );
  }
  ```

  Render source label and year in the slide. Keep the full external URL in visually quiet text and accessible DOM; destination may be the first-party research page.

- [ ] **Step 3: Test each evidence item remains source-able**

  Extend `main-talk-evidence.cjs` to assert Washi tokens exist in all themes and that every deck evidence record defines `sourceLabel`, `sourceYear`, and `sourceUrl`.

- [ ] **Step 4: Verify**

  Run: `rtk node presentation-japan/tests/main-talk-evidence.cjs`

  Expected: exit 0.

### Task 3: Build the Shizen single-day case scene

**Files:**
- Create: `presentation-japan/src/components/ShizenDayCase.jsx`
- Create: `presentation-japan/tests/shizen-day-case.cjs`

**Consumes:** `SlideContext`, `MAIN_TALK_EVIDENCE.shizenConnect`, and existing animation conventions.

**Produces:** `ShizenDayCase({ step })`, where `step` is `0 | 1 | 2` for noon surplus, 17:00 ramp, and validated Shizen response.

- [ ] **Step 1: Write a small structure test first**

  ```js
  import assert from 'node:assert/strict';
  import fs from 'node:fs';

  const source = fs.readFileSync(new URL('../src/components/ShizenDayCase.jsx', import.meta.url), 'utf8');
  assert.match(source, /const SCENES = \[/);
  assert.match(source, /12:00/);
  assert.match(source, /17:00/);
  assert.match(source, /main-talk-source-footer/);
  assert.match(source, /isSlideActive/);
  ```

- [ ] **Step 2: Verify the test fails**

  Run: `rtk node presentation-japan/tests/shizen-day-case.cjs`

  Expected: FAIL because `ShizenDayCase.jsx` does not yet exist.

- [ ] **Step 3: Implement one component with three static scene definitions**

  ```jsx
  const SCENES = [
    { time: '12:00', title: 'Solar surplus', state: 'curtailment risk' },
    { time: '17:00', title: 'Evening ramp', state: 'solar falls, demand rises' },
    { time: 'Response', title: 'Flexible capacity responds', state: MAIN_TALK_EVIDENCE.shizenConnect.label },
  ];

  export function ShizenDayCase({ step = 0 }) {
    const slideContext = useContext(SlideContext);
    const scene = SCENES[Math.min(step, SCENES.length - 1)];
    // Render one time-axis, one data mark, one asset-response path, and source footer.
  }
  ```

  Use CSS/SVG transition effects only while active. Do not use per-frame React state; one scene change per Spectacle step is enough.

- [ ] **Step 4: Verify**

  Run: `rtk node presentation-japan/tests/shizen-day-case.cjs`

  Expected: exit 0.

### Task 4: Recompose MainTalk into 26 core slides

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Modify: `presentation-japan/src/locales/en.js`
- Modify: `presentation-japan/src/components/JapanVPPMap.jsx`
- Test: `presentation-japan/tests/main-talk-rendering.cjs`

**Consumes:** `ShizenDayCase`, `MainTalkSourceFooter`, `MAIN_TALK_EVIDENCE`, existing JEPX/map/duck/VPP components.

**Produces:** Exactly 26 core slides in approved order, with source footer on every factual chart and source card on the Shizen scene.

- [ ] **Step 1: Write rendering expectations**

  ```js
  await page.goto('http://localhost:3100/main-talk.html', { waitUntil: 'networkidle' });
  await page.getByText('Japan cannot borrow', { exact: true }).waitFor();
  await page.getByTestId('main-talk-source-footer').first().waitFor();
  await advance(10);
  await page.getByTestId('shizen-day-case').waitFor();
  await page.getByText('12:00', { exact: true }).waitFor();
  await page.getByText('17:00', { exact: true }).waitFor();
  await page.getByText('Flexible capacity responds', { exact: true }).waitFor();
  ```

  Add an assertion that the chrome reaches `26 / 26`; do not hardcode the route's old `33` count.

- [ ] **Step 2: Verify test fails on old deck**

  Run: `rtk node presentation-japan/tests/main-talk-rendering.cjs`

  Expected: FAIL because the current talk has 33 slides and no Shizen scene / source footer.

- [ ] **Step 3: Replace the deck sequence in one pass**

  Use the exact 26-slide order from the approved design. Merge:

  - seam + island isolation;
  - self-sufficiency context into the map/evidence sequence;
  - Kyushu/Tokyo duplicate curtailment framing into the single-day case;
  - three frequency screens into one response demo;
  - streaming aggregation into appendix.

  Change `JapanVPPMap` header and all hard-coded outcome labels to `SIMULATED DISPATCH` unless Task 1 provides a verified Japanese result. Do not describe simulated numbers as Shizen performance.

- [ ] **Step 4: Add validated copy and speaker notes**

  Every new / changed factual slide gets concise speaker notes: main point, exact source, caveat, audience question backup. Store display strings in `en.js`; do not scatter new narrative strings across JSX.

- [ ] **Step 5: Verify rendered deck**

  Run: `rtk node presentation-japan/tests/main-talk-rendering.cjs`

  Expected: exit 0; title, all three Shizen states, source footer, simulation labeling, website destination, and slide count render.

### Task 5: Move technical detail into an appendix and web research

**Files:**
- Modify: `presentation-japan/src/MainTalk.jsx`
- Create: `website/src/pages/research/topics/japan-energy-flexibility.astro`
- Modify: `website/src/pages/research.astro`
- Test: existing website build command

**Consumes:** Existing `GridFrequencyExplainer`, `FrequencyWalkthrough`, `StreamingAggregation`, and evidence research log.

**Produces:** A deck appendix after the 26-slide core and a linked Japan research destination containing sources and technical explainers.

- [ ] **Step 1: Add appendix after core close**

  Keep `GridFrequencyExplainer`, `FrequencyWalkthrough`, and `StreamingAggregation` behind a clearly labeled appendix divider. Core chrome must still show 26 slides before appendix navigation begins.

- [ ] **Step 2: Add Japan research topic page and index card**

  Add sections for: Japan grid structure, JEPX 2021, curtailment, Shizen Connect case study, ERAB, and technical appendix. Each section links the primary sources from Task 1, then optional deeper repository research.

- [ ] **Step 3: Verify builds**

  Run: `cd presentation-japan && rtk npm run build`

  Run: `cd website && rtk npm run build`

  Expected: both exit 0 without new dependency installation.

### Task 6: Visual review and regression checks

**Files:**
- Modify: `presentation-japan/tests/main-talk-rendering.cjs` only if checks uncover a missing contract.
- Temporary screenshots: `/tmp/japan-main-talk-*.png`

**Consumes:** Built deck and dev server at `http://localhost:3100/main-talk.html`.

**Produces:** Evidence that four visual states communicate story and sources read at projection size.

- [ ] **Step 1: Run static and browser checks**

  Run:

  ```bash
  rtk node presentation-japan/tests/main-talk-evidence.cjs
  rtk node presentation-japan/tests/shizen-day-case.cjs
  rtk node presentation-japan/tests/main-talk-rendering.cjs
  ```

  Expected: all exit 0.

- [ ] **Step 2: Capture exactly four review screenshots**

  Capture the Hormuz / Wašhi narrative state, noon surplus, Shizen response, and dark dispatch / close to `/tmp/`. Confirm:

  - source footer readable but visually secondary;
  - Washi slides do not resemble decoration or a tourism treatment;
  - red and amber remain data meaning, not ornament;
  - source cards retain contrast;
  - map/demos remain full-bleed and interactive.

- [ ] **Step 3: Final build and diff review**

  Run:

  ```bash
  cd presentation-japan && rtk npm run build
  cd .. && rtk git diff --check
  rtk git diff -- presentation-japan website docs/research
  ```

  Expected: build succeeds, no whitespace errors, and diff contains only plan-scope files.

## Plan Self-Review

- **Spec coverage:** Tasks 1–2 establish evidence and visual language; Task 3 builds the Shizen day case; Task 4 delivers the 26-slide narrative; Task 5 preserves technical depth and links research; Task 6 verifies behavior and appearance.
- **Placeholder scan:** No implementation step permits an invented source, value, or URL. Research is a mandatory first task because exact Japanese capacity must be real.
- **Type consistency:** `MAIN_TALK_EVIDENCE` feeds `MainTalkSourceFooter`; `ShizenDayCase` uses the same source entry; `MainTalk.jsx` consumes both. Slide count test targets the final 26-slide core.
