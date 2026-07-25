# Main Talk Capability Motifs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the redundant platform slide with two compact Anime.js animated capability motifs.

**Architecture:** `CapabilityMotif` owns the two SVG variants and an Anime.js lifecycle. `MainTalk` embeds it in the storage and response slides, leaving slide copy and the surrounding sequence unchanged.

**Tech Stack:** React 18, Spectacle, Anime.js 4, Node assert tests, Playwright.

## Global Constraints

- Reuse `presentation-japan/src/hooks/useAnimeJs.js`; add no packages.
- Use existing CSS variables only; keep the visuals illustrative and label-free beyond the existing slide copy.
- Full-bleed slides retain an explicit background color.
- Do not commit or push without user permission.

---

### Task 1: Prove the new deck contract

**Files:**
- Modify: `presentation-japan/tests/main-talk-rendering.cjs`
- Modify: `presentation-japan/tests/main-talk-browser.cjs`

**Interfaces:**
- Consumes: `data-testid="capability-motif-store"` and `data-testid="capability-motif-respond"`
- Produces: regression checks for 21-slide deck and both motifs.

- [ ] **Step 1: Write the failing rendering assertions**

```js
assert.match(source, /const coreSlides = 21/);
assert.equal((source.match(/<Slide/g) || []).length, 21);
assert.doesNotMatch(source, /A Japanese platform for that flexibility/);
assert.match(source, /capability-motif-store/);
assert.match(source, /capability-motif-respond/);
```

- [ ] **Step 2: Run the rendering test to verify it fails**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs`  
Expected: assertion failure because the deck still has 22 slides and the motifs do not exist.

- [ ] **Step 3: Add browser assertions**

```js
const storeMotif = page.getByTestId('capability-motif-store');
const respondMotif = page.getByTestId('capability-motif-respond');
assert.equal(await storeMotif.isVisible(), true);
assert.equal(await respondMotif.isVisible(), true);
const finalCount = page.getByText(/21\s*\/\s*21/);
```

- [ ] **Step 4: Run the browser test to verify it fails**

Run: `cd presentation-japan && rtk node tests/main-talk-browser.cjs`  
Expected: test fails before it can find either motif.

### Task 2: Implement the reusable motif and wire the slides

**Files:**
- Create: `presentation-japan/src/components/CapabilityMotif.jsx`
- Modify: `presentation-japan/src/MainTalk.jsx`

**Interfaces:**
- Produces: `CapabilityMotif({ variant })`, where `variant` is `store` or `respond`.
- Consumes: `useAnimeTimeline` for teardown-safe animation.

- [ ] **Step 1: Implement the minimal component**

```jsx
export function CapabilityMotif({ variant }) {
  const rootRef = useRef(null);
  const { createTimeline } = useAnimeTimeline();
  useEffect(() => {
    const timeline = createTimeline({ loop: true });
    timeline.add(rootRef.current.querySelectorAll('[data-motif-pulse]'), { opacity: [0.2, 1], scale: [0.8, 1.1], duration: 700, delay: (_, index) => index * 180 });
    timeline.play();
  }, [createTimeline, variant]);
  return <svg ref={rootRef} data-testid={`capability-motif-${variant}`} />;
}
```

- [ ] **Step 2: Replace the platform slide and add each variant**

```jsx
<Slide {...page}><Title>Store it for later</Title><div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36, alignItems: 'center' }}><Body>…</Body><CapabilityMotif variant="store" /></div></Slide>
<Slide {...page}><div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 36, alignItems: 'center' }}><div><div>PROOF 2 · FAILURE RESPONSE</div><Title>Respond when the system is tight</Title><Body>…</Body></div><CapabilityMotif variant="respond" /></div></Slide>
```

- [ ] **Step 3: Run the rendering test to verify it passes**

Run: `cd presentation-japan && rtk node tests/main-talk-rendering.cjs`  
Expected: exit 0.

- [ ] **Step 4: Run browser and production verification**

Run: `cd presentation-japan && rtk node tests/main-talk-browser.cjs && rtk npm run build`  
Expected: both commands exit 0.
