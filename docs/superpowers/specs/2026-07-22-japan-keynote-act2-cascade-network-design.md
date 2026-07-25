# Act 2 Japan cold-snap cascade network design

## Goal

Make the Act 2 cold-snap scene a full-bleed, map-led composition that explains how exceptional household demand begins locally and cascades through Japan's constrained regional grid.

## Composition

`JapanColdSnapMapAnimated` occupies the available Spectacle slide viewport instead of a fixed 600px-tall panel. The JEPX price chart remains a compact right-side sidecar and the narrative/demand card stay as high-opacity floating overlays. Map content remains visible behind every overlay.

## Network layers

The cold-snap `MaskExtension` treatment is removed. The scene instead uses two Deck.gl `TripsLayer` families, anchored in longitude/latitude:

- **Local distribution paths:** dense, short routes connecting representative homes, substations, and a city hub. They appear only on close city keyframes, initially around Tokyo, then in the active regional cluster. Their timed trails convey concentrated household demand.
- **Regional transmission paths:** fewer, wider routes joining regional grid hubs across Honshu and onward to Kyushu. Their coordinate paths include a modest altitude arc and are viewed through the pitched 3D camera, so the national spine visibly rises above the map. They activate sequentially as the camera rises and trail long enough to show the cascade spreading between regions.

The regional spine is deliberately schematic: it communicates grid dependency and propagation without claiming to be a literal utility transmission map.

## Step choreography

1. **Historical warning:** JEPX sidecar enters over a close Tokyo view; only a quiet local base network is present.
2. **Demand concentration:** dense Tokyo distribution trails appear and accelerate.
3. **Cascade begins:** the camera eases out; the Tokyo-to-Tohoku and Tokyo-to-Kansai regional paths activate.
4. **National constraint:** the view reaches national scale while additional regional links illuminate in sequence.
5. **System-wide stress:** all transmission links remain active, with local clusters still pulsing underneath the national network.

Pointer drag, wheel zoom, rotate, and touch gestures remain enabled. Arrow keys remain owned by Spectacle and advance/reverse these five keyframes.

## Implementation boundaries

- `japanMapData.mjs`: add typed local and regional trip datasets, keyed by region/stage.
- `JapanMapLayers.jsx`: replace the Act 2 mask, density, and masked trip branch with local and regional TripsLayers plus supporting hub marks.
- `JapanColdSnapMapAnimated.jsx`: use viewport-derived full-bleed height and retain only compact overlays.
- Tests: assert the new layer IDs/data and browser-visible full-bleed map, JEPX sidecar, and demand card.

## Success criteria

- The map fills the slide canvas at 16:9 without a small embedded-frame appearance.
- Close city steps read as many local household-demand flows; zoomed-out steps read as a national, cascading transmission system.
- No Act 2 layer uses `MaskExtension`.
- Existing interactive map controls and keyboard presenter navigation continue working.
- Existing build and browser regression tests pass, alongside new assertions for the cascade layers.
