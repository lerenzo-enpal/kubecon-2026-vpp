# Keynote Grid-pressure Atlas Scene

## Goal

Restore the four-step Grid pressure story on the shared `JapanGridAtlas`.

## Design

- `JapanGridAtlas` receives one optional scene-layer descriptor that supplies DeckGL layers for a current presentation step and a target map view.
- The Grid pressure slide passes the already-authored cold-snap data and layers through that descriptor. Steps are: national context, Tokyo city demand, Kansai city demand, then national transmission pullback.
- The atlas continues to own the MapLibre basemap, grid toggles, and slide-active animation loop. The cold-snap scene supplies its 3D building massing and animated local/regional paths only.
- The existing JEPX sidecar and demand-cascade callout remain unchanged.

## Constraints

- Reuse `JapanMapLayers`, `japanMapData`, and their static precomputed city footprints and trip paths.
- Do not add a geofence, sampling/resolution control, runtime geometry generation, data fetch, dependency, or plugin registry.
- Gate animation with `SlideContext.isSlideActive` and update DeckGL directly from RAF.
- Preserve interactive atlas toggles.

## Verification

- Extend the keynote browser contract to assert the Grid pressure scene exposes the restored 3D city and regional transmission layer IDs after advancing its steps.
- Run the keynote rendering test and Vite production build.

## Follow-up

Dynamic building data and configurable network sampling are separate work. Revisit only when a real source dataset and a second map use case exist.
