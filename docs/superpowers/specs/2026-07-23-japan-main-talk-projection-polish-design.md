# Japan Main Talk: Projection-Ready Visual Polish

## Goal

Turn the Japan main talk into a projection-ready visual story without adding dependencies. Merge the Proof 1 chapter card and its daylight problem scene into one clicker-driven slide, then ground the duck-curve explanation in a Tokyo-area reported case.

Visual principle: Modern Washi is default. Dark Mission Control appears only for live operational use cases: response loop and interactive dispatch map.

## Narrative Treatment

| Slides | Treatment |
|---|---|
| 1–3 | Map-first exposure: island system, 50/60 Hz seam question, 15.3% self-sufficiency evidence. |
| 4–9 | One continuous daylight sequence. Slide 4 combines the Proof 1 claim with the persistent 08:00 → 12:00 → 17:00 daylight problem states. The existing generic mismatch slide becomes a dark, integrated Tokyo case-study: Deck.gl map plus linked duck curve, with noon curtailment, charging response, and dusk support states. The following response slide remains illustrative. |
| 11–15 | Washi diagrams for ERAB, city graph, control plane, and choreography. |
| 16 | Dark, clicker-driven response-loop states. |
| 17–20 | Washi proof of daily demand flexibility and aggregation. |
| 21–22 | Dark interactive Japan dispatch map. Arrow advances authored camera/state; pan and zoom remain optional. All capacity remains clearly simulated. |
| 23–26 | Return to Washi: build patterns, trusted capacity, research destination, earned promise. |

## Visual Grammar

- Each Washi slide carries one claim and one visual signal: chart, topology, map contour, or time marker.
- Warm paper, indigo ink, amber solar, vermilion alert, quiet source footers. No decorative Japanese motifs.
- Dark slides expose state and flow, never a dashboard. Interaction supports presenter; it does not alter arrow-navigation flow.
- Source labels and existing evidence caveats remain visible. No factual copy changes in this pass.

## Components

- Keep `MainTalk.jsx` as composition only.
- Rework existing `DaylightFlexibilityScene` into persistent-day visuals before adding components.
- Reuse installed Deck.gl, MapLibre, and existing map conventions. No new visualization framework or custom shader.
- Add one focused Tokyo case-study component rather than extending the general-purpose `JapanVPPMap`.
- Preserve `JapanVPPMap` authored-step behavior: next Arrow restores the next camera/state after optional map exploration.

## Slide Contracts

- Opening replaces title-only framing with map-first `Japan cannot borrow`; slide 26 returns to `Japan needs flexibility`.
- Daylight sequence preserves a shared time axis and does not claim illustrated device behavior as Shizen performance.
- Tokyo case study uses a dark Tokyo-metro map, solar-amber surplus, and green fleet-response layers. Its duck curve changes in lockstep with three clicker states: reported noon curtailment, illustrative household charging, and illustrative dusk support.
- Map remains optionally pannable/zoomable. The next Arrow returns to the authored state/camera.
- On-slide source detail is limited to a compact footer reference: `Source [1] · Shizen Connect / TEPCO EP · March 2026`. Until primary-source verification is complete, title/copy say `Tokyo-area reported case`; all fleet markers, curve effect, and dispatch outcomes are labelled illustrative.
- Dark response loop has finite clicker states. It uses no per-frame React state.
- Dispatch slides remain labelled `SIMULATED DISPATCH` and never claim Shizen outcomes.

## Validation

- Keep exactly 25 core slides after the approved Proof 1 merge.
- Retain existing source-footer, evidence, Shizen-day, and browser rendering checks.
- Add a rendering assertion for the Tokyo case source/caveat and browser checks for its three authored states and camera recovery.
- Capture one screenshot each for opening exposure, Tokyo noon/charging/dusk, response loop, and map dispatch.
- Build `presentation-japan`; check whitespace diff.

## Out of Scope

- Speaker notes and copy expansion.
- Primary-source verification beyond the stated provisional source reference.
- New dependencies, custom WebGL shaders, speaker notes, or slide-count changes.
- New slides or appendices.
