# Japan Keynote Act 2: JEPX Cold-Snap Map Design

## Purpose

Turn Act 2 into one presenter-driven visual sequence that connects Japan's January–February 2021 JEPX price shock to a present-day winter cold-snap demand event. The audience should see a pattern recurring, rather than two unrelated incidents.

## Narrative and pacing

The scene is a single full-bleed map with sequential keyframes:

1. Establish the historical evidence: animate the JEPX price chart from ~10 to 251 JPY/kWh over 40 days.
2. Hold the completed chart in a persistent right-side glass panel, labelled as January–February 2021.
3. Descend the camera into a pitched, bearing-adjusted MapLibre view of Japan.
4. Reveal geolocated residential-home markers and regional grid paths.
5. Stop at scripted regional camera keyframes while a cold-snap demand mask expands around each affected home cluster.
6. Finish with the present-day warning state, retaining the 2021 chart as the historical proof that the system has seen this stress pattern before.

The chart remains secondary to the map after its initial reveal. Motion follows the presentation style guide: deliberate 3–5 second camera moves, 200–400 ms staggered panel/marker entries, and no spring or bounce motion.

## Layout

- The map occupies the complete slide viewport.
- The JEPX chart is a fixed right-side panel, visually derived from the original talk's Texas Numbers composition.
- A small lower-right state panel labels the current present-day cold-snap state.
- Map callouts/cards are high-opacity, geospatially anchored, and use leader lines where their geographic target needs clarification.
- The companion concept is stored at `docs/planning/act2-jepx-cold-snap-map-concept.svg`.

## Technical design

Create an Act 2 map scene using the established Act 1 primitives:

- `MapLibre` renders the interactive basemap and owns the map camera.
- `DeckGL` renders all geographic data: home markers, regional grid connections, demand-density visualisation, and animated grid energy flows.
- A `MaskExtension`-backed layer represents cold-snap demand pressure around the relevant household clusters. The mask uses warning red with graduated opacity, never a screen-coordinate shape.
- The map enables scroll-wheel zoom, pointer drag pan, drag rotation, and touch exploration. `keyboard: false` prevents MapLibre arrow-key panning from stealing Spectacle navigation; `ArrowLeft` and `ArrowRight` continue to move between presenter keyframes.
- The map remains presenter-led: exploration changes camera only, and the next arrow-key step returns to the appropriate scripted keyframe.
- Deck animation state is held in refs and pushed directly into Deck layers; do not use React `setState` inside an RAF loop. RAF work is gated on `SlideContext.isSlideActive`.

## Data and components

- Reuse `JEPXPriceChart` for the historical chart, adding only props needed for compact sidecar sizing or externally coordinated reveal timing.
- Add a focused Act 2 orchestration component rather than extending `JapanGridMapAnimated` with unrelated narratives.
- Add geospatial Act 2 datasets for homes, regional grid routes, and cold-snap clusters. All positions are `[longitude, latitude]`.
- Reuse the existing `JapanMapBackground`, `JapanMapLayers`, `StepBridge`, `ExplanationBox`, and map-camera conventions where they fit; do not mount a second map implementation in parallel.
- Insert the new Act 2 sequence at the existing historical JEPX/power-warning section of `presentation-japan/src/Keynote.jsx`, replacing redundant static slides rather than inflating the five-minute deck.

## Accessibility and resilience

- Labels, chart annotations, and status panels have a readable high-contrast fallback if map tiles are delayed.
- The present-day state and headline are visible without relying on animation completion.
- The scene behaves safely when inactive: Deck layers stop animating and the map does not keep driving RAF work.

## Verification

- Extend the lightweight node rendering tests to confirm the Act 2 component exports and its expected keyframe/test IDs are reachable from `Keynote`.
- Add deterministic data-layer tests for the home clusters, cold-snap mask, grid trips, and chart-sidecar configuration.
- Run `npm run build` in `presentation-japan`.
- Use the local dev server to advance through the Act 2 keyframes once with Playwright, confirm the historical chart panel and present-day map state appear, and save any inspection image only under `/tmp`.

## Scope boundaries

- This is not a live data product: all demand values, routes, and home clusters are curated presentation data.
- Use a 3D camera treatment (pitch/bearing and Deck layers), not terrain tiles or a new basemap provider.
- Do not modify the main conference talk, unrelated keynote sections, or publish/commit changes without explicit permission.
