# Act 2: Art-Directed Tokyo-at-Night Network

## Goal

Turn Act 2's cold-snap map into an authored, cinematic Tokyo-at-night sequence. The scene must make household demand feel like a visible, cascading network event: first dense at street scale in Tokyo, then structural at Japan-wide transmission scale.

## Visual Direction

The map is a dark geographic stage, not a conventional navigation product.

- MapLibre remains as a minimal real-world reference: deep blue-black water, muted coastlines, and near-black land.
- Deck.gl creates the city visual language: procedural 3D building massing, generated local energy corridors, and elevated regional links.
- Charcoal architecture remains secondary. Moving energy is the source of colour and visual emphasis.
- Cyan denotes normal electric movement; amber and red denote the cold-snap demand escalation.

Satellite imagery is intentionally excluded. Its texture would compete with the data choreography and reduce legibility in a keynote setting.

## Geographic Model

All story anchor points stay at real longitude/latitude coordinates:

- Tokyo local demand and city hubs are centred on the existing Tokyo grid coordinate.
- Kansai and Tohoku use their existing regional anchors.
- Japan-wide links retain the existing regional utility and LNG anchor locations.

The generated buildings and local street paths are synthetic visual geometry positioned around these real anchors. They are illustrative rather than claims about actual building footprints or transmission routes.

## Components

### Procedural city layer

Create deterministic, seeded city datasets for Tokyo, Kansai, and Tohoku. Each city receives:

- Building footprints distributed in clustered, slightly irregular blocks.
- Height and footprint variation concentrated around the grid hub to create a legible skyline.
- An extrusion layer with very dark fill, subtle edge contrast, and conservative opacity.
- Optional demand-adjacent glow driven by the active story stage, without making all buildings individually animate.

Use deterministic generation so rehearsals, screenshots, tests, and slide exports remain stable.

### Local demand network

Replace the sparse local paths with many seeded, street-like corridors per city:

- A mix of orthogonal grids, rings, and radial feeder paths, lightly warped to avoid a perfectly synthetic appearance.
- Routes converge from neighbourhood endpoints into the real city grid hub.
- A `TripsLayer` animates moving demand pulses along these paths.
- Stage activation spreads in waves through the neighbourhoods instead of appearing at once.

At Tokyo zoom, the local network should occupy much of the visible city frame and read as a living load pattern rather than a handful of lines.

### Regional transmission network

As slide steps move outward from the city, preserve and expand the regional layer:

- Elevate multi-point paths with geographic altitude values so the pitched camera creates depth.
- Use cyan as the calm baseline and amber/red as demand pressure expands.
- Increase link count and hub visibility across Japan progressively by the existing Act 2 stages.
- Keep paths anchored to real regional coordinates, while treating their exact geometry as explanatory visualisation.

### Cinematic progression

1. Historical framing: Japan sits mostly dark, establishing the 2021 event.
2. JEPX shock: the price chart appears while the map remains restrained.
3. Tokyo: camera moves into a dense artificial night city. Local demand paths pulse and intensify around the hub.
4. Kansai: the camera transitions to the next dense city, then wider links reveal the pressure crossing regions.
5. Present-day pattern: the camera pulls back to a national perspective with the regional spine active and multiple local systems glowing.

The chart and narrative cards remain foreground HUD elements. The visual layers must not obscure them.

## Interaction and Performance

- Direct map exploration remains enabled: pan, wheel zoom, rotate, and touch.
- Arrow keys remain reserved for Spectacle's step navigation and stage transitions.
- Deck.gl remains pointer-transparent so MapLibre receives user map gestures.
- Animated TripsLayer time updates via `deckRef`, not React state inside an RAF loop.
- The animation loop runs only while the slide is active.
- Layer generation is memoized or precomputed outside the render path where practical.

## Verification

- Expand existing layer data tests to assert deterministic generated city data, dense local path counts, and stage-specific layer IDs.
- Retain the browser regression that checks the Act 2 map fills a 1440x900 slide viewport.
- Add browser assertions for the city-building and dense local-network layers at the Tokyo stage, and regional-transmission layers at the wider stages.
- Run the project build after implementation.

## Scope Boundaries

- No real-world building, street, or utility-route dataset is claimed or imported in this change.
- No satellite imagery or external tile subscription is introduced.
- Act 1's Hormuz visual remains unchanged.
