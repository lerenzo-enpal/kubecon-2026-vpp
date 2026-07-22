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

