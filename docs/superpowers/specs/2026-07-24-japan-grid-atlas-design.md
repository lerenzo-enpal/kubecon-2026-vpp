# Japan Grid Atlas design

## Goal

Create one Deck.gl/MapLibre component for keynote and main talk. It renders a high-fidelity, interactive Japan grid atlas with static, cited layers and optional live overlays.

## Reuse boundary

`JapanGridAtlas` extends the existing `JapanMapLayers`/MapLibre stack; it does not create another renderer, map-data format, or dependency. Each consumer supplies an authored `preset(step)` function.

## Layers

Static, bundled, versioned data:

- energy mix by region
- power plants, with fuel/type and capacity where sourced
- utility service areas
- transmission corridors and frequency boundary

Optional live overlays:

- regional demand/supply
- JEPX price

Every dataset has source URL, licence/usage note, retrieval date, and scope. Reference maps/articles inform research only; no raster or unlicensed geometry is copied. Missing or stale live data shows an unavailable state and never blocks static layers.

## Interaction contract

`JapanGridAtlas` accepts `step`, `preset`, `liveData`, and `onLayerChange`.

- A step change applies its authored layer defaults.
- Clicking an icon creates a local override for current step.
- Drag, zoom, hover, and popovers remain enabled.
- A disabled layer is neither drawn nor pickable.
- Spectacle retains arrow-key navigation; the map receives pointer interaction only.

## HUD

Compact bottom HUD contains icon buttons for every layer. Buttons have visible active/inactive state, accessible label, tooltip, and grouping between static and live layers. No text-heavy control rail.

## Consumers

Keynote and main talk each pass presets selecting layers/camera emphasis for their own narrative. Both can expose manual icon toggles without diverging data or behaviour.

## Error handling

Static data validation rejects malformed coordinates before render. Live adapters return `{ status, updatedAt, value }`; errors or unsupported sources render an unavailable indicator. No fetch retry loop or client-side cache in first version.

## Verification

- Node assertions: layer catalogue, preset defaults, local overrides, malformed static data rejection.
- Existing source/rendering contracts: shared component imported by both talks, map controls present, Deck.gl layer IDs stable.
- One Playwright screenshot/browser check: click toggle, drag/zoom map, move Spectacle step, confirm authored preset reapplies.

## Scope limits

First version is presentation-grade: sourced geographic fidelity, not an operational grid model. Live feeds are adapters only when public, browser-safe, and attributable; no scraping workaround or server proxy.
