# Japan keynote — Acts 3 + 4 VPP transformation design

**Date:** 2026-07-22  
**Status:** approved for implementation  
**Scope:** `presentation-japan` keynote only; Act 1 and Act 2 remain unchanged.

## Communication job

By the end, KubeCon + CloudNativeCon Japan attendees should recognise a virtual power plant as a familiar distributed-systems response to Japan's energy fragility, because a grid is a geographically real graph of devices that software can coordinate into resilient capacity.

The sequence deliberately avoids implementation-level platform detail. The later technical talk remains the place for Dapr, CQRS, brokers, observability, and delivery mechanics.

## Narrative position

Acts 3 and 4 replace the existing title-card-plus-solution composition with one continuous, map-led transformation. It follows the Act 2 cold-snap cascade and creates the need for the final closing slide:

```
Act 2: a fragile grid cascades under stress
        ↓
Act 3: the grid is a distributed system
        ↓
Act 4: a graph becomes a city, then Japan, then a VPP
        ↓
Close: 100K homes coordinated by software = 1 power plant
```

## Audience experience and pacing

The combined sequence runs for roughly 75–90 seconds, including deliberate holds for presenter narration. It contains five Spectacle keyframes, but reads as one camera and visual journey rather than five slides.

| Keyframe | Visual state | Audience-facing copy | Narrative job |
| --- | --- | --- | --- |
| 0 — pause | Near-black `ma` field and a short indigo rule | `The grid is a distributed system.` | Let Act 2's crisis land; name the reframing. |
| 1 — graph | Cyan nodes and uneven links pulse under varying load | `You already know how to solve this.` | Establish familiar distributed topology. |
| 2 — city | Graph nodes rise into a dark, stylized city; bright paths become streets and feeders | `A graph is a city, under load.` | Translate abstraction into lived infrastructure. |
| 3 — Japan | Camera pulls out through a muted live Japan basemap with coastal outline, city anchors, homes, generators, and grid hubs | `The same graph has a geography.` | Ground the metaphor in the country discussed in Acts 1–2. |
| 4 — VPP | Connected homes, batteries, and control paths illuminate; the network steadies and gathers | `Respond fast` · `Store energy` · `Use it smarter` | State the VPP's practical value without platform detail. |

After the final hold, the illuminated network gathers into a calm, centralized constellation, fades to black, and Spectacle advances to the separate, still closing slide: `100K homes / coordinated by software / = 1 power plant`.

## Visual language

The sequence continues the Act 2 night-grid language while changing emotional temperature from danger to agency:

- **Act 3 pause:** Kenya Hara / `ma`—nearly empty, intentional negative space.
- **Graph:** electric cyan topology on midnight navy, with only occasional warm-amber load stress.
- **City:** procedural dark building massing grows from the graph; energy routes retain cyan as their common grammar.
- **Japan:** retain the existing low-opacity, dark MapLibre geography so the coast and water orient the audience without competing with the network.
- **VPP:** amber battery energy, cyan connectivity, and a calm green stabilization state. The visual promise is coordination, never a new centralized fossil plant.

All device symbols use a single snap / settle animation grammar, inspired by Tokyo 2020 kinetic pictograms. No repeated card grid or persistent HUD rail is introduced.

### Contextual visual cues

Each keyframe receives one compact, transient edge cue—graph, city, Japan, or superpowers—to orient the audience. The cue arrives with the stage, stays briefly, then fades before the next shift. It must not become persistent presentation chrome.

The reusable visual storyboard is retained at:

`/.superpowers/brainstorm/22036-1784722701/content/vpp-transformation-storyboard.html`

The contextual-cue comparison is retained beside it as `vpp-cue-system.html`.

## Typography and animation

`A graph is a city, under load.` is the sequence's hero line.

1. `A graph` fades up softly as the abstract topology is visible.
2. `is a city` snaps and settles as graph nodes rise into building massing.
3. `under load` arrives in warm amber as energy traffic accelerates.
4. The complete line holds for one presenter breath, then dissolves while the camera transitions toward the real Japan map.

The remaining statements follow the same restrained fade / snap / settle grammar. Text never competes with map orientation, and no key message appears as a dense explanatory panel.

## Technical architecture

### Primary component

Create a full-bleed `VPPTransformationSequence` owned by `presentation-japan/src/components/`. It replaces both the inline Act 3 `StepBridge` content in `Keynote.jsx` and the keynote use of `SolutionSequence`.

The component owns five zero-based `StepBridge` stages and exposes stable test IDs for the sequence root, each stage, contextual cue, hero line, and VPP superpower labels.

### Rendering layers

1. **Abstract layer:** deterministic graph nodes, links, and load values rendered as a lightweight canvas or Deck.gl overlay.
2. **City layer:** deterministic procedural building massing and dense local energy routes, derived from the graph's node anchors.
3. **Geographic layer:** reuse `JapanMapBackground` and the existing MapLibre + Deck.gl approach for the Japan phase. Keep the low-opacity night basemap, coastal context, and direct pointer/wheel/touch exploration.
4. **VPP layer:** geolocated homes, battery markers, grid hubs, generators, and coordinated flow paths. It conveys aggregation and control, not operational architecture.
5. **Typography and cues:** DOM overlay with CSS/WAAPI transforms and opacity transitions.

The component must gate RAF work with `SlideContext.isSlideActive`; fast-changing animation values remain in refs, not React state. On a revisit, animation state resets predictably to the current step.

### Interaction contract

- Pointer drag, scroll zoom, touch, and rotate remain available when the real map is active.
- Spectacle retains arrow keys for stage progression and regression.
- Camera keyframes are presenter-paced; manual map exploration does not corrupt the next programmed keyframe.
- The scene must preserve the existing full-bleed presentation geometry at 1440×900.

## Testing and verification

- Unit/data contracts cover deterministic graph nodes, city massing, Japan anchors, batteries, generators, and five stage definitions.
- Source-level contracts verify map layering, contextual-cue IDs, animation gating, and absence of a persistent story rail.
- Browser regression verifies full-bleed dimensions, sequential hero-line fragments, all three VPP value labels, direct map interactivity, and the separate `100K homes` closing slide.
- Run the existing layer and keynote rendering tests plus `npm run build`.
- Take one temporary browser screenshot during the Japan/VPP phase for visual inspection; do not add screenshots to the repository.

## Out of scope

- Changes to Acts 1–2.
- Replacing MapLibre + Deck.gl with Kepler.gl.
- Detailed cloud-native architecture, vendor names, regulatory mechanics, or protocol diagrams.
- New factual claims beyond the existing keynote sources.
- Commits, pushes, merges, or branch cleanup without explicit user authorisation.
