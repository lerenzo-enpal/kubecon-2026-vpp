# Japan Keynote: Washi Opening and Three Capabilities

## Goal

Bring the keynote’s static narrative slides into the modern Washi visual system, add a Japan energy-source orientation before the Hormuz consequence, and make the closing capability promise match the Japan main talk.

## Narrative order

1. **Washi title / premise** — quiet paper surface, indigo type, existing keynote identity.
2. **Japan’s energy comes from far away** — new Washi origin map. Energy mix appears as compact source labels; animated routes identify LNG, oil, and coal origins arriving in Japan.
3. **Hormuz consequence** — preserve the existing dark, animated Strait of Hormuz scene. The preceding origin routes make its disruption legible.
4. **Japan grid atlas** — preserve the existing animated map and staged regional/transmission/plant/mix reveal.
5. **Crisis pattern** — preserve existing sequence.
6. **VPP transformation** — add the capability cards as its final reveal.
7. **Close** — restyle the static close in the Washi system only if it remains a narrative slide; operational/VPP scenes stay dark.

The existing opening sequence currently combines title and Hormuz. It becomes distinct premise and Hormuz beats so the new energy-source slide sits before the Hormuz map as requested.

## Energy-source slide

Reuse `JapanGridAtlas` / map-layer conventions where they provide source markers and animation. Do not add a new map engine or dependency.

- Warm Washi paper background; indigo map structure, amber route highlights, vermilion import-risk emphasis.
- Reveal source routes one at a time, then retain a compact mix summary.
- Label origins at presentation scale: LNG, oil, and coal sources. Claim text and percentages must use a cited, dated primary-energy or generation dataset; do not infer a Hormuz LNG percentage.
- End with one visible route leading into the Hormuz scene.

## Capability close

Replace “Respond fast / Store energy / Use it smarter” with the MainTalk proof wording, in this exact order:

1. **Bring new players into the market** — batteries, EVs, homes, and renewables become coordinated grid resources.
2. **Respond when the system is tight** — telemetry, trusted dispatch, and confirmation coordinate a response.
3. **Use demand smarter** — shift charging and household demand into useful windows.

At final `VPPTransformationSequence` step, three icon/text cards enter in sequence. Existing map nodes/links pulse in matching amber, cyan, and violet treatments; no new map system or idle animation loop.

## Styling

- Static premise and energy-origin slide follow MainTalk’s existing Washi tokens and typography: `--color-washi-paper`, `--color-washi-ink`, `--color-washi-alert`, `--color-washi-solar`, `--font-heading`, `--font-mono`.
- Use current inline-style pattern only for dynamic map/animation values. Reuse present `StepBridge`, atlas, and motif patterns.
- Hormuz, VPP transformation, and final operational scenes stay dark to preserve their Mission Control contrast.

## Files and verification

- Modify `presentation-japan/src/Keynote.jsx` — revised slide order, section/count chrome, Washi static slides.
- Modify `presentation-japan/src/components/VPPTransformationSequence.jsx` — card final reveal and matched map effects.
- Add a small energy-origin scene only if `JapanGridAtlas` cannot host it without obscuring its existing grid-atlas role.
- Update `presentation-japan/tests/keynote-rendering.cjs` for new slide count, origin-map text/test IDs, and capability labels.
- Run keynote source/rendering/browser checks and presentation build. Capture one projection-size screenshot after visual changes.

## Out of scope

- MainTalk changes.
- New dependencies or a second map stack.
- Unsupported Japan energy or Hormuz statistics.
