# Shizen Connect case animation

## Goal

Replace the sparse Proof 3 opening with one speaker-controlled, three-step case animation that makes the documented Shizen Connect V2H demonstration tangible without inventing operational data.

## Sequence

1. **186 household EVs via V2H** — a dense field of home / EV / V2H marks appears. The fixed fact is the January 2024 demonstration cohort.
2. **Coordinated control** — an explicitly illustrative control request travels from Shizen Connect to each V2H mark. This depicts control mechanics, not a recorded dispatch.
3. **Portfolio state** — device marks resolve into an aggregate fleet state. The only performance value shown is `90% control accuracy · company-reported`.

## Boundaries

- No device coordinates, timestamps, kW, kWh, response time, delivered capacity, commercial result, or regional fleet claim.
- The animated request and return state are labelled `ILLUSTRATIVE CONTROL FLOW`.
- Existing source footer retains the primary Shizen Connect release and company-reported qualifier.

## Implementation

Replace the sparse Proof 3 opening slide with one `StepBridge` sequence in `presentation-japan/src/MainTalk.jsx`; retain the following V2H and HEMS slides as factual source-detail follow-ups. Use CSS transitions and inline SVG/HTML marks only; no new dependency, component, timer, RAF loop, or slide-count change. Retain the existing aggregation, simulated Japan dispatch, and illustrative portfolio-response slides.

## Verification

Extend the rendering test for the three evidence labels and illustrative qualifier. Run main-talk rendering, evidence, browser tests, production build, and inspect one 1440×900 final-step screenshot.
