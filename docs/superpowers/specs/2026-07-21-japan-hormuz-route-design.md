# Japan Keynote: Full-Bleed Hormuz Route Opening

## Goal

Turn the map portion of the Japan keynote opening into a full-slide, cinematic explanation of Japan's LNG dependency on the Strait of Hormuz.

## Scope

- Keep the opening title card unchanged.
- Make every subsequent opening-map step use the full available slide canvas.
- Preserve the existing grid, 50/60 Hz, LNG terminal, self-sufficiency, and fossil-fuel story beats.
- Add a strong, step-triggered camera move from Japan to the Strait of Hormuz and back along the LNG route.

## Visual Design

The map has no rounded container, internal padding, or lower explanation-card band while it is telling the route story. It occupies the full 16:9 slide area beneath the small presentation chrome.

The camera starts tightly framed on Japan. Grid overlays retain the existing cyan, green, amber, and red theme colors. On the Hormuz step, a red marker becomes the focal point of a decisive pull-back and westward pan. The map then follows a dashed red LNG route eastward, ending at Japan's LNG terminals. The final return to Japan is the visual setup for the dependency and household-cost statistics.

## Motion Sequence

1. **Japan grid:** show Japan at close range with regional utility and frequency overlays.
2. **LNG terminals:** reveal terminal markers and local import flows.
3. **Hormuz reveal:** over roughly 1.0–1.2 seconds, zoom out and pan west until the Strait of Hormuz marker is central.
4. **Route traversal:** draw the red dashed route and move a ship/pulse along it for roughly 1.4–1.8 seconds while the camera tracks east.
5. **Japan consequence:** settle back over Japan; terminate the route at its LNG terminals and reveal the dependency/stat overlays.

Motion runs once per presenter advance. There is no idle camera drift or looping camera animation. Existing pulse effects can continue only where they communicate live energy flow.

## Component Boundaries

- `JapanOpeningSequence` continues to own presenter-step sequencing and maps each narrative state to a map state.
- `JapanGridMapAnimated` becomes the full-bleed visual owner: background geography, camera framing, overlays, and the Hormuz route animation.
- A small route/camera helper may be extracted if it makes the SVG or map-view transitions easier to test; it must not own Spectacle step state.
- `StepBridge` remains the sole `useSteps` integration point.

## Verification

- Browser regression: first map state fills the slide; the Hormuz sequence visibly exposes both endpoints and the route; the following step restores Japan-centered context.
- Existing keynote rendering check still confirms title-card and Pattern-slide content.
- `npm run build` completes cleanly.

## Non-Goals

- No changes to the remainder of the five-minute keynote.
- No new external map/tile provider or live network dependency.
- No automatic looping route animation.
