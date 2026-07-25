# Japan Main Talk: Simulated Tokyo Frequency Response Design

## Goal

Turn Proof 2 from a sequence of explanatory slides into one projection-ready, interactive Tokyo operational scene. It must produce a clear audience moment: frequency falls, distributed assets respond, and the dip is arrested.

## Narrative and slide order

Replace Proof 2's current six-slide sequence with four slides:

1. **Respond at grid speed** — a short transition from energy timing to an operational event.
2. **A distributed response, in seconds** — the full-bleed dark map hero.
3. **A city is a graph problem** — a continuation of the same recovered map, not a static diagram.
4. **The VPP is the control plane** — reuse the existing VPP architecture, choreography, and response-loop visuals as the mechanism.

This reduces the core deck from 23 to 21 slides. Proof 3 and the return remain in their present order.

## Hero scene

`TokyoDuckCurveCaseStudy` is extended rather than introducing another Deck.gl/MapLibre map system. It gains a focused frequency-response mode, still driven by `StepBridge`, with four authored states:

| Step | Visual state | Message |
| --- | --- | --- |
| 0 | `50.000 Hz` / nominal Tokyo-area system | The portfolio is connected and observable. |
| 1 | `SIMULATED LOCAL GENERATION LOSS` / red trace dropping | A grid event is physical and immediate. |
| 2 | `EDGE RESPONSE ACTIVE` / batteries and V2H assets illuminate / green recovery trace | Distributed control arrests the dip. |
| 3 | `FREQUENCY STABILISED` / final 50 Hz band | The fleet has become operational capacity. |

The map remains drag/zoom explorable. Arrow-key progression applies the next authored Deck.gl camera state so the presenter can always return the audience to the intended view. There are no on-slide knobs, generated events, capacity figures, or fleet counts.

## City graph continuation

The next slide shares the final map visual language and starts in its recovered state. It animates, then holds, a readable graph:

- Device, home, substation, and market nodes fade in as distinct layers.
- A single response loop pulses telemetry upward, dispatch intent downward, and acknowledgement back.
- A compact HUD names the layers but does not invent operational metrics.
- The map remains explorable; the final graph layout is the stable presenter state.

This makes the relationship explicit: the physical frequency response is possible because the city can be observed and controlled as a graph.

## Evidence boundary

The incident is labelled `SIMULATED TOKYO EVENT` in every state. It does not represent a reported Japanese frequency event, actual Shizen Connect dispatch, fleet capacity, response time, or performance result.

The footer uses `MAIN_TALK_EVIDENCE.shizenV2H` only to support the narrower context that a Japanese demonstration coordinated 186 household EVs through V2H in January 2024. It retains the existing company-reported qualifier. No invented numerical claim appears in the visual.

## Implementation boundaries

- Reuse current Deck.gl, MapLibre, `StepBridge`, theme, source-footer, and frequency-trace components/dependencies.
- Keep the dark Mission Control theme reserved for this operational scene and its control-plane explanation.
- Gate WebGL/canvas animation with `SlideContext.isSlideActive`; do not use per-frame React state.
- Preserve free map exploration and accessibility labels for both scenes.
- No new dependencies, shader framework, live data feed, or open-ended simulator.
- Update `docs/slide-order.md`, core slide count, and browser/rendering/evidence contracts.

## Verification

- Static tests assert the four-step simulated case label, clear disclaimer, source footer, graph continuation, and 21-slide count.
- Browser test advances through all fixed states, verifies the dynamic graph slide, then verifies authored camera recovery after manual exploration.
- Build, evidence tests, and `git diff --check` pass.
- Inspect one 1440×900 screenshot for the hero recovery state and one for the graph scene; output only to `/tmp`.

## Out of scope

- A claim about a real Tokyo frequency incident.
- Real-time grid telemetry or user-generated event parameters.
- Speaker notes, which remain deferred.
