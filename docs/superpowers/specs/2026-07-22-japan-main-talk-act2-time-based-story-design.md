# Japan Main Talk Act II: A Time-Based Flexibility Story

## Goal

Replace Act II’s chart-first, card-driven sequence with a two-scene visual story. Time is the organizing device: sunlight creates the noon surplus and evening ramp; flexible devices change the resulting curve.

## Narrative

Act I establishes that Japan cannot rely on neighbours in a disruption. Act II follows directly: the system must balance locally, and renewable output creates a second, daily balancing problem.

1. **Scene 1 — sunlight redraws the grid's needs.** A warm daylight scene advances from morning to noon to evening. The sun position animates with a duck-curve/net-load trace. The factual anchor is Kyushu T&D's FY2025 5.09 GW maximum renewable-output control during 12:00–12:30 on 4 May 2025.
2. **Japan curtailment proof.** A concise, Washi-styled evidence slide explains the anchor as a single operating interval. It must distinguish instantaneous power (GW) from curtailed energy (GWh/TWh), and link to the primary record.
3. **Scene 2 — the fleet changes the curve.** The same day progresses into dusk. EV charging, heat-pump load shifting, and battery response change state and visibly flatten the curve. Shizen Connect is an illustrative platform context only; the animation must not attribute the 5.09 GW result or device behaviour to Shizen.
4. **Bridge.** A city is a graph problem: local device decisions now need a trusted, observable control plane. This hands to Act III.

The existing Act II divider + duck curve become Scene 1; the current Shizen cards + VPP-flattening chart become Scene 2. The released slide capacity is used for the factual proof and the Act III bridge, preserving the 26-slide core.

## Visual Direction

- Modern Washi remains the Act II language: warm paper, indigo ink, amber daylight, vermilion only for curtailment alert, green for coordinated recovery.
- Use a subtle Japan silhouette as geographic grounding. Do not use a full interactive map: the sun and curve are the visual focus.
- The sun is both lighting and clock. Time labels should be `06:00`, `12:00`, and `17:00`; device-state labels are secondary.
- Scene 1 uses a maximum-control marker at noon; Scene 2 reuses the same curve geometry so the improvement is visually comparable.

## Source Contract

- **Permitted factual claim:** Kyushu T&D's FY2025 Kyushu-mainland record lists a maximum renewable-output control of 509 × 10,000 kW (5.09 GW) during 12:00–12:30 on 4 May 2025.
- **Primary source:** Kyushu Electric Power Transmission and Distribution, [curtailment history](https://www.kyuden.co.jp/td_power_usages/out_ctrl_history.html), FY2025 Kyushu-mainland workbook.
- **Required wording:** “maximum renewable-output control,” never “energy wasted.”
- **Excluded until independently sourced:** the prior 1.74 TWh/H1 2025 number and the claim that curtailment reached Tokyo in March 2026.
- **Shizen caveat:** label the device response as illustrative and retain the existing primary-source footer/deep link.

## Implementation Shape

- Build one small reusable daylight/curve scene component with a `mode` prop (`problem` or `response`) rather than two unrelated visualizations.
- Use Spectacle steps to advance the time/state transitions while preserving one slide per scene.
- Keep SVG/CSS animation local to the active slide; no map or new dependency.
- Add the Kyushu evidence object to `mainTalkEvidence.mjs`, update the source footer and speaker notes, and remove/replace the unsupported curtailment data component from the core sequence.

## Validation

- Playwright confirms the core deck remains 26 slides and reaches both scenes without console/page errors.
- Browser assertions verify the noon fact text, primary-source footer, Shizen illustrative disclaimer, and both scene test IDs.
- One screenshot captures each scene at its final step: noon control marker and coordinated response.
- Production build passes.

## Non-goals

- No real-time grid feed, full map, or inferred Shizen performance outcome.
- No annual curtailed-energy claim unless a primary source names its exact period and method.
