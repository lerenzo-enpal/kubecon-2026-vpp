# Japan Hormuz Route Opening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the keynote's Japan grid map full-bleed and add a one-shot cinematic camera move from Japan to the Strait of Hormuz and back along the LNG route.

**Architecture:** `JapanOpeningSequence` continues to translate Spectacle steps into opening-map states, but stops shrinking the map for the step label and stat cards. `JapanGridMapAnimated` owns the full-bleed scene and triggers the Hormuz transit when its existing Hormuz step is entered. `JapanMapBackground` gains a narrowly-scoped imperative camera API so it can animate the existing MapLibre background without adding a provider or network dependency.

**Tech Stack:** React 18, Spectacle 10, MapLibre GL, Anime.js, Playwright/Chrome, Vite.

## Global Constraints

- Preserve the title-card layout and the existing opening-step narrative order.
- The map canvas fills the 16:9 slide beneath presentation chrome; no rounded card, map padding, or lower card band during the route story.
- Camera motion is step-triggered and plays once; never add idle camera drift or a looping route animation.
- Use existing theme CSS variables or the existing Japan palette tokens; do not add external map/tile providers.
- Components using `useSteps` must never be wrapped in `LazyContent`; `StepBridge` remains the sole step integration point.
- Do not commit or push unless the user explicitly asks.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `presentation-japan/src/components/JapanOpeningSequence.jsx` | Full-slide map composition and mapping of presenter steps to map scene numbers. |
| `presentation-japan/src/components/JapanGridMapAnimated.jsx` | Overlay SVG, MapLibre-route lifecycle, one-shot Japan → Hormuz → Japan transit, and full-bleed map container. |
| `presentation-japan/src/components/JapanMapBackground.jsx` | Existing MapLibre initialization plus a ref callback that exposes only `easeTo` and `jumpTo` to its parent. |
| `presentation-japan/tests/keynote-rendering.cjs` | Browser regression for map coverage, Hormuz route visibility, and the existing Pattern-slide transition. |

### Task 1: Establish the full-bleed and Hormuz browser regression

**Files:**

- Modify: `presentation-japan/tests/keynote-rendering.cjs`
- Modify: `presentation-japan/src/components/JapanOpeningSequence.jsx` (only after the failing test is observed)
- Modify: `presentation-japan/src/components/JapanGridMapAnimated.jsx` (only after the failing test is observed)

**Consumes:** `StepBridge`'s zero-based step behavior; a running Vite server at `http://localhost:3100/`.

**Produces:** A reliable Playwright check for the title, a full-slide map scene, the visible Hormuz label/route, and the Pattern slide.

- [ ] **Step 1: Extend the browser test with the failing map assertions.**

  Replace the body-text-only test with a 1440×900 viewport and these helpers/assertions. The `data-testid` values are intentional API contracts for Tasks 2–3.

  ```js
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const advance = async (count) => {
    for (let index = 0; index < count; index += 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(280);
    }
  };

  await page.goto('http://localhost:3100/', { waitUntil: 'networkidle' });
  // Keep the existing title assertion.
  await advance(3); // Spectacle enters the first map state after its initial two transitions

  const mapBounds = await page.getByTestId('japan-opening-map').evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  });
  if (mapBounds.width < 1400 || mapBounds.height < 760) {
    throw new Error(`Expected a full-bleed map, received ${mapBounds.width}×${mapBounds.height}.`);
  }

  await advance(5); // LNG route → Hormuz scene
  await page.getByTestId('hormuz-route').waitFor({ state: 'visible' });
  if (!(await page.locator('body').innerText()).includes('Strait of Hormuz')) {
    throw new Error('The Hormuz route scene did not expose its label.');
  }

  await advance(2); // finish opening and enter Pattern
  // Keep the existing Pattern heading assertion.
  ```

- [ ] **Step 2: Run the regression check and confirm the expected failure.**

  Run: `node tests/keynote-rendering.cjs`

  Expected: failure because `japan-opening-map` is absent. This proves the test is checking the new behavior rather than the current half-height map.

- [ ] **Step 3: Do not change production code in this task.**

  The test is the contract for the following two implementation tasks. Leave it red until the map composition and route scene are complete.

### Task 2: Convert the opening sequence to a full-slide composition

**Files:**

- Modify: `presentation-japan/src/components/JapanOpeningSequence.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Consumes:** Task 1’s `japan-opening-map` contract and the existing `JapanGridMapAnimated({ height, step })` interface.

**Produces:** A full-size map area for all opening-map states and overlay-only supporting information.

- [ ] **Step 1: Keep the title card as the sole padded layout.**

  Preserve the existing `step === 0` branch. For all other steps, use a single relative full-height container and render the map at the actual slide height:

  ```jsx
  {step === 0 ? (
    <TitleCard presenter={presenter} />
  ) : (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <JapanGridMapAnimated
        height="100%"
        step={step - 1}
        testId="japan-opening-map"
      />
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
        <StepLabel step={step} />
      </div>
      {step >= 7 && <OpeningStatsOverlay />}
    </div>
  )}
  ```

  Create `StepLabel` and `OpeningStatsOverlay` as local components in the same file. `OpeningStatsOverlay` must be absolutely positioned over the bottom of the map, not consume layout height. It reuses the existing `ExplanationBox` presets and stagger configuration.

- [ ] **Step 2: Make the map receive a test id without creating a wrapper that changes its size.**

  Update `JapanGridMapAnimated` to accept a `data-testid` prop through a named prop (for example `testId`) and set it on its outermost `<div>`. Pass `testId="japan-opening-map"` from `JapanOpeningSequence`; do not rely on React forwarding `data-testid` through a custom component.

- [ ] **Step 3: Run the browser regression to verify the first green milestone.**

  Run: `node tests/keynote-rendering.cjs`

  Expected: the map-size assertion passes; the Hormuz-route assertion remains red until Task 3 adds that contract.

### Task 3: Add a one-shot Hormuz transit to the existing MapLibre background

**Files:**

- Modify: `presentation-japan/src/components/JapanMapBackground.jsx`
- Modify: `presentation-japan/src/components/JapanGridMapAnimated.jsx`
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Consumes:** Task 2’s full-size scene; existing MapLibre GL dependency; `useAnimeTimeline` cleanup behavior.

**Produces:** `JapanMapBackground` camera access and an animated `hormuz-route` scene that visibly links the two endpoints.

- [ ] **Step 1: Add a minimal map-camera handoff API.**

  Change the background signature to accept `onMapReady` and retain existing defaults:

  ```jsx
  const JapanMapBackground = ({ opacity = 0.15, style = {}, onMapReady }) => {
  ```

  On MapLibre `load`, call `onMapReady?.(map.current)` after the existing transparent-background work. Add `onMapReady` to the effect dependency list. The callback recipient is allowed to call only MapLibre’s existing `easeTo` and `jumpTo`; no global map state or new provider is introduced.

- [ ] **Step 2: Define the route and camera constants near the top of `JapanGridMapAnimated.jsx`.**

  ```js
  const JAPAN_CAMERA = { center: [138.25, 36.2], zoom: 4.5, bearing: 0, pitch: 0 };
  const HORMUZ_CAMERA = { center: [56.3, 26.6], zoom: 4.1, bearing: 0, pitch: 0 };
  const LNG_ROUTE = [
    [56.3, 26.6], [64, 24], [78, 18], [96, 15], [117, 21], [138.25, 36.2],
  ];
  ```

  Retain `mapInstance` in state and `hasRunHormuzTransit`, `routePathRef`, and `shipRef` in refs. Create a second `useAnimeTimeline` instance for the route transit, separate from the existing overlay-reveal timeline. Reset `hasRunHormuzTransit.current` only when `step < 5`, so revisiting the Hormuz step can replay once while ordinary re-renders cannot.

- [ ] **Step 3: Implement the sequential camera transit in a dedicated effect.**

  Import `followPath` from `../utils/animationPatterns.js`. Define `startTransit` with `useCallback`. When `step === 5`, a map instance exists, and the transit has not run, use the existing Anime timeline helper without per-frame React state:

  ```js
  const startTransit = useCallback(() => {
    const transit = createTransitTimeline();
    const pathLength = routePathRef.current.getTotalLength();
    routePathRef.current.setAttribute('stroke-dasharray', pathLength);
    routePathRef.current.setAttribute('stroke-dashoffset', pathLength);
    transit.add(routePathRef.current, {
      strokeDashoffset: [pathLength, 0],
      duration: 1600,
      ease: 'inOutQuad',
    }, 0);
    followPath(transit, shipRef.current, routePathRef.current, {
      duration: 1600,
      ease: 'inOutQuad',
    });
    playTransit();
    mapInstance.easeTo({ ...JAPAN_CAMERA, duration: 1600, essential: true });
  }, [createTransitTimeline, mapInstance, playTransit]);

  useEffect(() => {
    if (step < 5) hasRunHormuzTransit.current = false;
    if (step !== 5 || !mapInstance || hasRunHormuzTransit.current) return undefined;

    hasRunHormuzTransit.current = true;
    mapInstance.easeTo({ ...HORMUZ_CAMERA, duration: 1100, essential: true });
    const routeTimer = window.setTimeout(startTransit, 1120);
    return () => {
      window.clearTimeout(routeTimer);
      pauseTransit();
    };
  }, [step, mapInstance, pauseTransit, startTransit]);
  ```

  Include `createTransitTimeline`, `mapInstance`, and `playTransit` in `startTransit`'s dependency array. The route-path and ship refs are stable, so they are intentionally omitted. This keeps camera interpolation inside MapLibre and route motion inside Anime.

- [ ] **Step 4: Replace the short initial Hormuz path with a full-scene route overlay.**

  Keep SVG overlays, but give the route group `data-testid="hormuz-route"`. Its path must span the visible map story from the Hormuz marker to Japan and use the existing red crisis token. Use `d="M 90,260 C 165,226 240,275 315,225 S 465,145 590,170"` for the initial full-canvas composition. Add a small ship/pulse element controlled by `shipRef`. Its visible labels are exactly `Strait of Hormuz` and `Japan LNG terminals`.

  ```jsx
  <g data-testid="hormuz-route" opacity={step >= 5 ? 1 : 0}>
    <path className="hormuz-route" d="M 90,260 C 165,226 240,275 315,225 S 465,145 590,170" />
    <circle ref={shipRef} className="lng-route-ship" r="7" />
    <text className="hormuz-label">Strait of Hormuz</text>
    <text className="japan-lng-label">Japan LNG terminals</text>
  </g>
  ```

- [ ] **Step 5: Run the browser regression and the production build.**

  Run: `node tests/keynote-rendering.cjs && npm run build`

  Expected: both commands exit 0. The test sees a 1400px+ wide, 760px+ tall opening map and a visible Hormuz route before Pattern.

### Task 4: Visual QA and regression hardening

**Files:**

- Modify: `presentation-japan/tests/keynote-rendering.cjs` only if the browser timing needs a condition-based wait.
- Test: `presentation-japan/tests/keynote-rendering.cjs`

**Consumes:** Completed Task 3 scene and a Vite dev server.

**Produces:** Repeatable visual evidence that camera motion, overlay hierarchy, and the next slide are intact.

- [ ] **Step 1: Capture the two decisive states in one browser session.**

  Use the existing headless Chrome setup. Capture `/tmp/japan-keynote-hormuz-start.png` after the first map advance and `/tmp/japan-keynote-hormuz-route.png` after advancing to the Hormuz scene and waiting for `[data-testid="hormuz-route"]`.

  ```js
  await advance(1);
  await page.screenshot({ path: '/tmp/japan-keynote-hormuz-start.png', fullPage: true });
  await advance(5);
  await page.getByTestId('hormuz-route').waitFor({ state: 'visible' });
  await page.screenshot({ path: '/tmp/japan-keynote-hormuz-route.png', fullPage: true });
  ```

- [ ] **Step 2: Inspect both captures.**

  Confirm: the map is edge-to-edge; Hormuz, Japan, the full red route, and the moving pulse are visually distinct; no stat/card band crops the route; slide chrome is still legible.

- [ ] **Step 3: Run the final checks.**

  Run: `node tests/keynote-rendering.cjs && npm run build`

  Expected: exit 0 with no browser errors or Vite build errors.

- [ ] **Step 4: Review changes without committing.**

  Run: `git diff -- presentation-japan/src/components/JapanOpeningSequence.jsx presentation-japan/src/components/JapanGridMapAnimated.jsx presentation-japan/src/components/JapanMapBackground.jsx presentation-japan/tests/keynote-rendering.cjs`

  Expected: only full-bleed composition, camera/route behavior, and regression coverage changes are present. Do not create a commit or push unless the user explicitly asks.

## Plan Self-Review

- **Spec coverage:** Task 2 implements full bleed; Task 3 implements Japan → Hormuz → Japan camera movement and route; Task 4 verifies the non-looping visual narrative and build. The title card, step order, palette, no-new-provider, and no-idle-motion constraints are explicit.
- **Deferred-work scan:** The plan has no unresolved work markers or unspecified test commands.
- **Type/interface consistency:** `onMapReady`, `testId`, `japan-opening-map`, and `hormuz-route` are defined before their consumers and used consistently across tasks.
