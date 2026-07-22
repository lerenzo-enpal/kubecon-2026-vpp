# Japan Keynote Acts 3–4 VPP Transformation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing Act 3 title card and Act 4 technical solution sequence with one five-keyframe, full-bleed visual journey from an abstract stressed graph to an interactive, geographically grounded Japanese VPP.

**Architecture:** Keep the existing `Keynote.jsx` slide count and separate closing slide, but mount one new `VPPTransformationSequence` in place of both current middle slides. The sequence owns Spectacle keyframes through `StepBridge`; deterministic graph/city/Japan/VPP data lives in a small data module; a Deck.gl layer factory renders the real-map phases. DOM handles copy, contextual cues, and snap/settle motion, while MapLibre remains interactive only when the Japan map is visible.

**Tech Stack:** React 18, Spectacle `StepBridge`, MapLibre GL, Deck.gl (`ScatterplotLayer`, `PathLayer`, `TripsLayer`, `PolygonLayer`, `TextLayer`), CSS/WAAPI transitions, Node `assert`, Playwright, Vite.

## Global Constraints

- Scope is `presentation-japan` keynote only; do not modify Act 1 or Act 2 components or their behavior.
- Keep the existing separate closing slide and its `100K homes / coordinated by software / = 1 power plant` copy.
- Use five zero-based `StepBridge` stages: `pause`, `graph`, `city`, `japan`, `vpp`.
- No detailed platform, vendor, protocol, regulatory, or cloud-native architecture copy in this sequence.
- Retain a low-opacity `variant="night"` MapLibre basemap with water and coast visible during Japan/VPP stages.
- Direct map pointer drag, wheel zoom, touch, and rotate work only on real-map stages; MapLibre `keyboard: false` preserves Spectacle arrow-key navigation.
- Gate all animation RAF work with `SlideContext.isSlideActive`; keep per-frame values in refs and update Deck.gl with `deck.setProps`, not React state.
- Use deterministic seeded data only; no network/data fetches and no new factual claims.
- Use stable `data-testid` values for the sequence root, five stages, contextual cues, hero fragments, Japan map, and three VPP labels.
- Preserve full-bleed geometry at 1440×900; do not add a persistent rail, dashboard, or repeated card grid.
- Use existing font families and theme CSS variables where possible. No source screenshots, commits, pushes, merges, resets, or cleanup without explicit user authorization.

## File Structure

| File | Responsibility |
| --- | --- |
| `presentation-japan/src/components/vppTransformationData.mjs` | Deterministic five-stage definitions, abstract graph anchors, city massing, Japan homes/batteries/generators/hubs, and camera keyframes. |
| `presentation-japan/src/components/VPPTransformationLayers.jsx` | Pure Deck.gl layer factory for the geographic Japan and stabilized VPP phases. |
| `presentation-japan/src/components/VPPTransformationSequence.jsx` | Full-bleed stage orchestration, canvas graph/city rendering, MapLibre lifecycle, Deck.gl RAF updates, copy and contextual cues. |
| `presentation-japan/src/Keynote.jsx` | Replace the two legacy Acts 3–4 slide bodies with the new continuous sequence and concise speaker notes. |
| `presentation-japan/tests/japan-map-layers.cjs` | Data and source-level contracts for the new deterministic transformation data and geographic layer factory. |
| `presentation-japan/tests/keynote-rendering.cjs` | Browser regression for the five keyframes, full bleed, hero copy sequence, map interactivity, VPP labels, and closing slide. |

---

### Task 1: Define deterministic VPP transformation data

**Files:**
- Create: `presentation-japan/src/components/vppTransformationData.mjs`
- Modify: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**
- Produces `VPP_TRANSFORMATION_STAGES`, an ordered five-item array of `{ id, cue, camera }` objects.
- Produces `VPP_GRAPH_NODES`, `VPP_GRAPH_LINKS`, `VPP_CITY_BUILDINGS`, `VPP_LOCAL_TRIPS`, `VPP_JAPAN_CITY_BUILDINGS`, `VPP_JAPAN_HOMES`, `VPP_BATTERIES`, `VPP_GENERATORS`, `VPP_GRID_HUBS`, and `getVPPStageData(stage)`.
- `getVPPStageData(stage)` returns `{ stage, homes, batteries, generators, hubs, localTrips, regionalTrips }`, with values only increasing between `japan` and `vpp`.

- [ ] **Step 1: Write the failing data-contract assertions**

  Append the following import and assertions before the existing source-file assertions in `presentation-japan/tests/japan-map-layers.cjs`:

  ```js
  const {
    VPP_TRANSFORMATION_STAGES,
    VPP_GRAPH_NODES,
    VPP_GRAPH_LINKS,
    VPP_CITY_BUILDINGS,
    VPP_LOCAL_TRIPS,
    VPP_JAPAN_HOMES,
    VPP_BATTERIES,
    VPP_GENERATORS,
    VPP_GRID_HUBS,
    getVPPStageData,
  } = await import('../src/components/vppTransformationData.mjs');

  assert.deepEqual(
    VPP_TRANSFORMATION_STAGES.map(({ id }) => id),
    ['pause', 'graph', 'city', 'japan', 'vpp'],
    'Acts 3–4 need exactly five presenter keyframes.',
  );
  assert.equal(VPP_GRAPH_NODES.length, 14, 'The abstract graph needs a deliberate, legible node count.');
  assert.ok(VPP_GRAPH_LINKS.length >= 18, 'The abstract graph needs enough links to read as a connected topology.');
  assert.ok(VPP_CITY_BUILDINGS.length >= VPP_GRAPH_NODES.length, 'Every graph anchor needs city massing.');
  assert.ok(VPP_LOCAL_TRIPS.length >= 48, 'The city needs a dense local energy mesh.');
  assert.ok(VPP_JAPAN_HOMES.every(({ position }) => position[0] > 129 && position[0] < 146 && position[1] > 30 && position[1] < 45));
  assert.ok(VPP_BATTERIES.length >= 6 && VPP_GENERATORS.length >= 5 && VPP_GRID_HUBS.length >= 6);
  assert.equal(getVPPStageData(3).batteries.length, 0, 'Batteries are a VPP superpower, not a Japan-stage overlay.');
  assert.ok(getVPPStageData(4).batteries.length >= 6, 'The VPP stage must illuminate distributed storage.');
  assert.deepEqual(getVPPStageData(4), getVPPStageData(4), 'Stage selection must be deterministic.');
  ```

- [ ] **Step 2: Run the test to verify it fails**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: failure resolving `vppTransformationData.mjs`.

- [ ] **Step 3: Implement the minimal deterministic data module**

  Create `presentation-japan/src/components/vppTransformationData.mjs`. Use a seeded LCG identical in behavior to the existing `createSeededRandom` in `japanMapData.mjs`; do not call `Math.random()`. Define stage metadata and camera values as follows:

  ```js
  export const VPP_TRANSFORMATION_STAGES = [
    { id: 'pause', cue: 'reframe', camera: null },
    { id: 'graph', cue: 'topology', camera: null },
    { id: 'city', cue: 'city', camera: null },
    { id: 'japan', cue: 'japan', camera: { center: [138.25, 36.2], zoom: 4.35, bearing: 12, pitch: 42 } },
    { id: 'vpp', cue: 'superpowers', camera: { center: [137.7, 35.75], zoom: 5.05, bearing: 16, pitch: 48 } },
  ];
  ```

  Build fourteen `{ id, position: [x, y], load }` graph nodes in normalized 0–1 space, with at least three `load >= 0.8` nodes. Derive graph links from node IDs, then create a closed building footprint for each node using the same normalized anchors. Define `VPP_JAPAN_CITY_BUILDINGS` as deterministic, closed longitude/latitude footprints around the Japan home/generator anchors, each with a positive `height`. Define Japan assets as `{ id, position, region }` objects with longitude/latitude inside Japan; batteries must be a subset of home coordinates. Generate 48+ timestamp-aligned three-point local trips and 8+ regional trips with a visible mid-point altitude. Implement stage visibility exactly:

  ```js
  export const getVPPStageData = (stage) => {
    const activeStage = Math.max(0, Math.min(4, stage));
    const isJapan = activeStage >= 3;
    const isVPP = activeStage >= 4;
    return {
      stage: VPP_TRANSFORMATION_STAGES[activeStage],
      homes: isJapan ? VPP_JAPAN_HOMES : [],
      batteries: isVPP ? VPP_BATTERIES : [],
      generators: isJapan ? VPP_GENERATORS : [],
      hubs: isJapan ? VPP_GRID_HUBS : [],
      localTrips: isJapan ? VPP_LOCAL_TRIPS : [],
      regionalTrips: isJapan ? VPP_REGIONAL_TRIPS : [],
    };
  };
  ```

- [ ] **Step 4: Run the data contract test**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: the new data assertions pass; any later source-level checks still reflect the pre-existing Act 1–2 code.

### Task 2: Build pure geographic VPP Deck.gl layers

**Files:**
- Create: `presentation-japan/src/components/VPPTransformationLayers.jsx`
- Modify: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**
- Consumes: `getVPPStageData(stage)` and `{ stage, tripTime, stabilization }`.
- Produces: `getVPPTransformationLayers({ stage, tripTime, stabilization }) => Layer[]`.
- Layer IDs: `vpp-city-buildings`, `vpp-local-energy`, `vpp-regional-energy`, `vpp-homes`, `vpp-generators`, `vpp-grid-hubs`, `vpp-batteries`, and `vpp-control-links`.

- [ ] **Step 1: Add failing source-level contracts**

  Add these assertions after reading the existing map-layer source in `presentation-japan/tests/japan-map-layers.cjs`:

  ```js
  const vppLayers = await fs.readFile(require.resolve('../src/components/VPPTransformationLayers.jsx'), 'utf8');
  assert.match(vppLayers, /export const getVPPTransformationLayers/);
  assert.match(vppLayers, /id: 'vpp-city-buildings'/);
  assert.match(vppLayers, /id: 'vpp-local-energy'/);
  assert.match(vppLayers, /id: 'vpp-regional-energy'/);
  assert.match(vppLayers, /id: 'vpp-homes'/);
  assert.match(vppLayers, /id: 'vpp-batteries'/);
  assert.match(vppLayers, /id: 'vpp-control-links'/);
  assert.match(vppLayers, /TripsLayer/);
  assert.match(vppLayers, /PolygonLayer/);
  assert.match(vppLayers, /stabilization/);
  ```

- [ ] **Step 2: Run the test to verify it fails**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: failure resolving `VPPTransformationLayers.jsx`.

- [ ] **Step 3: Implement the layer factory**

  Create `presentation-japan/src/components/VPPTransformationLayers.jsx`. Import `PolygonLayer`, `PathLayer`, `ScatterplotLayer`, and `TextLayer` from `@deck.gl/layers`, `TripsLayer` from `@deck.gl/geo-layers`, and `getVPPStageData` from the data module. Return no layers before stage 3. Use the following rendering contract:

  ```js
  export const getVPPTransformationLayers = ({ stage, tripTime = 0, stabilization = 0 }) => {
    const { homes, batteries, generators, hubs, localTrips, regionalTrips } = getVPPStageData(stage);
    const settled = Math.max(0, Math.min(1, stabilization));
    return [
      new PolygonLayer({ id: 'vpp-city-buildings', data: VPP_JAPAN_CITY_BUILDINGS, extruded: true, wireframe: true, getPolygon: d => d.polygon, getElevation: d => d.height }),
      new TripsLayer({ id: 'vpp-local-energy', data: localTrips, getPath: d => d.path, getTimestamps: d => d.timestamps, currentTime: tripTime, trailLength: 980 }),
      new TripsLayer({ id: 'vpp-regional-energy', data: regionalTrips, getPath: d => d.path, getTimestamps: d => d.timestamps, currentTime: tripTime, trailLength: 2100 }),
      new ScatterplotLayer({ id: 'vpp-homes', data: homes, getPosition: d => d.position }),
      new ScatterplotLayer({ id: 'vpp-generators', data: generators, getPosition: d => d.position }),
      new ScatterplotLayer({ id: 'vpp-grid-hubs', data: hubs, getPosition: d => d.position }),
      new ScatterplotLayer({ id: 'vpp-batteries', data: batteries, getPosition: d => d.position }),
      new PathLayer({ id: 'vpp-control-links', data: settled > 0 ? controlLinks : [], getPath: d => d.path }),
    ];
  };
  ```

  Fill all accessors with concrete colors, width units, radii, timestamp alignment, and opacity. The base flow remains cyan, stressed flow amber, battery/control links amber→green as `stabilization` approaches 1. The buildings should be dark-blue extrusions with thin blue-gray outlines so the muted map is still visible beneath them.

- [ ] **Step 4: Run the layer/data contracts**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: pass.

### Task 3: Implement the full-bleed five-keyframe sequence

**Files:**
- Create: `presentation-japan/src/components/VPPTransformationSequence.jsx`
- Modify: `presentation-japan/tests/japan-map-layers.cjs`

**Interfaces:**
- Consumes: `StepBridge`, `SlideContext`, `JapanMapBackground`, `getVPPTransformationLayers`, and `VPP_TRANSFORMATION_STAGES`.
- Produces: `VPPTransformationSequence({ height?: string | number })` with a `StepBridge count={5}` and `data-testid="vpp-transformation-sequence"`.
- The five stage roots use `data-testid="vpp-stage-pause|graph|city|japan|vpp"`; cues use `vpp-context-cue-${cue}`.

- [ ] **Step 1: Add failing source-level contracts**

  Add the following to `presentation-japan/tests/japan-map-layers.cjs`:

  ```js
  const vppSequence = await fs.readFile(require.resolve('../src/components/VPPTransformationSequence.jsx'), 'utf8');
  assert.match(vppSequence, /<StepBridge count=\{5\}>/);
  assert.match(vppSequence, /SlideContext/);
  assert.match(vppSequence, /isSlideActive/);
  assert.match(vppSequence, /requestAnimationFrame/);
  assert.match(vppSequence, /deckRef\.current\?\.deck\?\.setProps/);
  assert.match(vppSequence, /data-testid="vpp-transformation-sequence"/);
  assert.match(vppSequence, /vpp-stage-\$\{stage\.id\}/);
  assert.match(vppSequence, /vpp-context-cue-\$\{stage\.cue\}/);
  assert.match(vppSequence, /vpp-hero-graph/);
  assert.match(vppSequence, /vpp-hero-city/);
  assert.match(vppSequence, /vpp-hero-load/);
  assert.doesNotMatch(vppSequence, /story rail/i);
  ```

- [ ] **Step 2: Run the test to verify it fails**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: failure resolving `VPPTransformationSequence.jsx`.

- [ ] **Step 3: Implement stage orchestration and motion**

  Create the sequence component. It must be a `position: relative; width: 100%; height: 100%; overflow: hidden` scene with no outer padding. Use this state/RAF skeleton exactly, adapting the imports to the existing codebase:

  ```jsx
  export default function VPPTransformationSequence({ height = '100%' }) {
    const slideContext = React.useContext(SlideContext);
    const isActive = slideContext?.isSlideActive ?? true;
    const mapRef = useRef(null);
    const deckRef = useRef(null);
    const tripTimeRef = useRef(0);
    const stabilizationRef = useRef(0);
    const [stageIndex, setStageIndex] = useState(0);
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
      if (!isActive) return undefined;
      let frame;
      const tick = (now) => {
        tripTimeRef.current = now % 3600;
        stabilizationRef.current = stageIndex === 4 ? Math.min(1, stabilizationRef.current + 0.012) : 0;
        deckRef.current?.deck?.setProps({
          layers: getVPPTransformationLayers({ stage: stageIndex, tripTime: tripTimeRef.current, stabilization: stabilizationRef.current }),
        });
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frame);
    }, [isActive, stageIndex]);
  }
  ```

  Add a stage-change effect that resets `stabilizationRef.current`, then calls `map.easeTo({ ...camera, duration: 5200, essential: true })` only for stage 3 or 4 after `mapReady`. This makes every arrow-key revisit deterministic without taking away user interaction before the next keyframe.

  Render abstract/city phases on one `<canvas aria-hidden="true">` sized with `ResizeObserver`. Draw exactly the seeded graph data: dim cyan links, cyan nodes, warm amber only for high-load nodes; on the city stage, interpolate those nodes into dark building rectangles and use brighter paths as street/feeders. Keep draw-loop values in refs; the canvas can redraw from the component RAF but must not call `setState` per frame.

  Render `<JapanMapBackground variant="night" opacity={0.32} interactive={stageIndex >= 3} onMapReady={...} />` only at stages 3–4. Render DeckGL above it with `controller={false}` and `pointerEvents: 'none'`; retain MapLibre as the only pointer target. Its wrapper must have `data-testid="vpp-japan-map"` and MapLibre must retain `data-interactive="true"` at stages 3–4.

  Use DOM overlays for copy and cues. The pause stage shows only an indigo rule plus `The grid is a distributed system.`. The graph stage shows `You already know how to solve this.`. The city stage renders the three hero fragments in this order:

  ```jsx
  <span data-testid="vpp-hero-graph">A graph</span>
  <span data-testid="vpp-hero-city">is a city</span>
  <span data-testid="vpp-hero-load">under load.</span>
  ```

  Give fragments inline transition delays of `0ms`, `420ms`, and `820ms`; only `under load.` uses amber. Apply an opacity/translate fade to the first, an overshooting `scale(1.04)` then settle to `scale(1)` to the second, and an opacity/letter-spacing settle to the third. Use one compact, short-lived edge cue per active stage and `pointerEvents: 'none'`; it must fade out after roughly 2.8 seconds and never persist into the next stage.

  At stage 4, render precisely three small labels, each with a stable ID: `vpp-superpower-respond` = `Respond fast`, `vpp-superpower-store` = `Store energy`, and `vpp-superpower-smarter` = `Use it smarter`. Do not put platform or vendor names on screen.

- [ ] **Step 4: Run the source/data test suite**

  Run: `cd presentation-japan && rtk node tests/japan-map-layers.cjs`

  Expected: pass.

### Task 4: Replace legacy keynote Acts 3–4 with the continuous sequence

**Files:**
- Modify: `presentation-japan/src/Keynote.jsx`
- Modify: `presentation-japan/tests/keynote-rendering.cjs`

**Interfaces:**
- Consumes: `VPPTransformationSequence`.
- Produces: a single Act 3/4 keynote slide that exposes all five internal Spectacle keyframes, followed by the unchanged closing slide.

- [ ] **Step 1: Add a failing browser regression for the new sequence**

  In `presentation-japan/tests/keynote-rendering.cjs`, after the existing Act 2 assertions, append this exact flow. It assumes the current Act 2 takes five keyframes, then enters the combined sequence with one more arrow:

  ```js
  await advance(2);
  await page.getByTestId('vpp-transformation-sequence').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-stage-pause').waitFor({ state: 'visible' });
  await page.getByText('The grid is a distributed system.', { exact: true }).waitFor({ state: 'visible' });

  await advance(1);
  await page.getByTestId('vpp-stage-graph').waitFor({ state: 'visible' });
  await page.getByText('You already know how to solve this.', { exact: true }).waitFor({ state: 'visible' });

  await advance(1);
  await page.getByTestId('vpp-stage-city').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-hero-graph').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-hero-city').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-hero-load').waitFor({ state: 'visible' });

  await advance(1);
  const vppMap = page.getByTestId('vpp-japan-map');
  await vppMap.waitFor({ state: 'visible' });
  const vppBounds = await vppMap.evaluate((element) => {
    const { width, height } = element.getBoundingClientRect();
    return { width, height };
  });
  if (vppBounds.width < 1400 || vppBounds.height < 760) throw new Error(`Expected full-bleed VPP map, received ${vppBounds.width}×${vppBounds.height}.`);
  const vppCanvas = vppMap.getByTestId('japan-map-canvas');
  if (await vppCanvas.getAttribute('data-interactive') !== 'true') throw new Error('Expected an interactive Japan VPP map.');
  await vppCanvas.hover();
  await page.mouse.wheel(0, -320);

  await advance(1);
  await page.getByTestId('vpp-stage-vpp').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-superpower-respond').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-superpower-store').waitFor({ state: 'visible' });
  await page.getByTestId('vpp-superpower-smarter').waitFor({ state: 'visible' });

  await advance(1);
  await page.getByText('100K homes', { exact: true }).waitFor({ state: 'visible' });
  ```

- [ ] **Step 2: Run the browser regression to verify it fails**

  Ensure `npm run dev` is running on port 3100, then run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: fails waiting for `vpp-transformation-sequence`.

- [ ] **Step 3: Integrate the new sequence and update only its speaker notes**

  In `presentation-japan/src/Keynote.jsx`:

  ```diff
  - import StepBridge from './components/StepBridge.jsx';
  - import SolutionSequence from './components/SolutionSequence.jsx';
  + import VPPTransformationSequence from './components/VPPTransformationSequence.jsx';
  ```

  Delete the existing inline Act 3 `StepBridge` slide and the Act 4 `<SolutionSequence height={550} />` slide. Replace both with one slide immediately after `PatternSequence`:

  ```jsx
  <Slide backgroundColor="#030508" padding="0">
    <VPPTransformationSequence />
    <Notes>
      Pause: the grid is a distributed system. Then reveal the graph under uneven load; this is a familiar problem. As it becomes a city, name the lived consequence: a graph is a city, under load. Pull back to Japan: homes, generators, and hubs are the same graph with geography. Add the superpowers: connected devices respond fast, batteries store energy, and coordination uses it smarter. Let the network settle, then advance to the 100K homes closing statement.
    </Notes>
  </Slide>
  ```

  Keep the closing slide markup and copy unchanged. Because this replaces two physical slides with one, update `SECTIONS` to `['Crisis', 'Pattern', 'VPP', 'Close']`, set `TOTAL_SLIDES` to `4`, and set forced-dark slide indices to `[1, 3, 4]` together. The five visual stages remain internal `StepBridge` keyframes of physical slide 3.

- [ ] **Step 4: Run browser regression**

  Run: `cd presentation-japan && rtk node tests/keynote-rendering.cjs`

  Expected: pass through Act 1, Act 2, all five transformation stages, and the distinct closing slide.

### Task 5: Verify visual motion and production build

**Files:**
- Modify only if a test exposes an implementation error in the files above.

**Interfaces:**
- Verifies the sequence presents map geography, animated graph/city transformation, and stage-specific text without affecting Acts 1–2.

- [ ] **Step 1: Run both deterministic suites**

  Run:

  ```bash
  cd presentation-japan && rtk node tests/japan-map-layers.cjs
  cd presentation-japan && rtk node tests/keynote-rendering.cjs
  ```

  Expected: both exit 0.

- [ ] **Step 2: Capture one temporary Japan/VPP visual regression image**

  With the dev server on port 3100, use Playwright to advance to `vpp-stage-vpp`, wait 1200ms for the settle animation, and save exactly one screenshot to `/tmp/japan-keynote-vpp-transformation.png`. Inspect it for: full-frame dark ocean/coast outline, legible Japanese geography, cyan graph/energy routes, amber battery accents, three readable labels, no persistent cue rail, and no overlap with slide chrome. Do not save an image into the repository.

- [ ] **Step 3: Run the production build**

  Run: `cd presentation-japan && rtk npm run build`

  Expected: Vite build exits 0 with no unresolved imports, JSX syntax errors, or Deck.gl/MapLibre bundle failures.

- [ ] **Step 4: Record the verification result in the handoff**

  Report the two test commands and build result, state that no Act 1–2 files were changed, and link the retained design spec. Do not commit, push, merge, or clean up unless the user separately authorizes it.

## Self-Review

- Spec coverage: Tasks 1–3 implement all five approved visual states, deterministic graph/city/Japan/VPP data, night basemap geography, transient contextual cues, animated hero fragments, map interaction, arrow-key preservation, and RAF performance constraints. Task 4 wires the sequence into the keynote and preserves the closing slide. Task 5 verifies behavior, visual presentation, and production build.
- Out-of-scope protection: no Kepler.gl replacement, MaskExtension change, factual additions, architecture/vendor detail, Act 1–2 changes, or repository history operations appear in the plan.
- Interface consistency: the data module defines `getVPPStageData`; the layer module consumes it through `getVPPTransformationLayers`; the scene component consumes the layer factory; `Keynote.jsx` consumes the scene component; both test suites target the same test IDs and five stage names.
