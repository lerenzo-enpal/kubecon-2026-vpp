# Keynote atlas animations

## Scope

Restore keynote opening motion while making `JapanGridAtlas` the one shared map.

## Design

- Add optional `routeLayer` and `transmissionLayer` inputs to `JapanGridAtlas`.
- Atlas owns layer rendering, checked default toggles, and small play controls. Inputs provide only animation data and step-driven play state.
- Slide 4 passes Hormuz-to-Japan route data. `stepIndexes` restart/play it; audience can replay it with atlas control.
- Grid pressure restores `JEPXPriceChart` in existing 25× sidecar. Its existing slide-active animation remains source of truth.
- Slide 6 passes its existing power-network animation through `transmissionLayer`, using atlas markers and coordinates. No geography duplicate.

## Behavior

- Optional layers do nothing unless a slide supplies them.
- Slide deactivation stops RAF/timelines; reactivation starts current step sequence cleanly.
- Atlas map toggles begin checked on these scenes; user control remains available.

## Tests

- Extend keynote browser test: Hormuz route control/layer present, JEPX chart present in sidecar, and atlas-backed transmission layer present.
- Existing render test verifies deck loads without console errors.

## Non-goals

- No generic plugin registry, animation framework, new dependency, or unrelated map refactor.
