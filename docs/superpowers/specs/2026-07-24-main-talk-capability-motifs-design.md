# Main Talk Capability Motifs Design

## Goal

Remove the redundant Shizen platform transition and give the two capability slides a compact, legible animated focal point.

## Changes

- Remove `A Japanese platform for that flexibility` from `MainTalk`, reducing the deck from 22 to 21 slides.
- Add one reusable `CapabilityMotif` component with two variants:
  - `store`: sun → battery → home; the battery fills and energy travels toward the evening home.
  - `respond`: grid alert → connected home, EV, and battery; a small dispatch pulse travels through the network.
- Use the existing Anime.js dependency and `useAnimeTimeline` hook. Mounting and unmounting controls the animation lifecycle, so off-screen slides do not keep running.
- Keep the motif illustrative, use only existing washi theme tokens, and include no externally sourced claims or new assets.

## Testing

- Update the rendering test for 21 slides, removed platform copy, and both motif variants.
- Update the browser test to locate both motifs and confirm the final count is `21 / 21`.
