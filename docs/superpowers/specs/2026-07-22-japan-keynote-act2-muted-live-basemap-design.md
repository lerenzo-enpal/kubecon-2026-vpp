# Act 2: Muted Live Basemap Design

## Goal

Restore geographic context beneath the Act 2 Tokyo-at-night network so audiences can situate the city systems in Japan without weakening the authored Deck.gl visual language.

## Visual Direction

Use the existing OSM vector basemap at deliberately low opacity behind the Deck.gl city system.

- Water becomes deep navy.
- Land and parks become near-black blue.
- Roads, boundaries, and labels become subdued cool gray-blue.
- Bright POI clutter is hidden or muted.
- The MapLibre container renders at 35–45% opacity in the Act 2 night variant.
- Synthetic 3D buildings and animated energy routes remain full-strength foreground elements.

The result should read first as an energy system, then as a city, then as a recognisable location in Japan.

## Architecture

`JapanMapBackground` continues to own MapLibre initialization. The `night` variant uses the existing live OSM style URL, then applies low-contrast paint/layout overrides after the style is loaded. The component must tolerate missing layers: it applies overrides only when a layer exists and must not throw if live tiles or style loading fails.

The Act 2 animated map keeps `variant="night"` and supplies a muted opacity value. It may derive a small city label from the existing step/story data, but label placement must remain legible beneath HUD content.

## Interaction and Fallback

- Preserve pan, wheel zoom, rotate, and touch gestures.
- Keep MapLibre keyboard input disabled so arrow keys remain Spectacle navigation.
- Preserve the Deck.gl pointer-transparent overlay.
- If the live basemap cannot load, preserve the existing dark background and Deck.gl energy layers; no error state blocks the presentation.

## Verification

- Assert the night variant still uses the live style URL and declares low-opacity night treatment.
- Retain the full-bleed and interactive-map Playwright regression.
- Add a browser assertion that the Act 2 map canvas exists after the relevant city step.
- Run the data/layer test, keynote rendering test, and production build.

## Scope Boundaries

- Do not import a new basemap provider, satellite layer, GeoJSON coastline asset, or API key.
- Do not alter Act 1 Hormuz map styling.
- Do not change slide count, Spectacle step behavior, or direct map interaction behavior.
