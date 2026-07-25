# Japan Main Talk: Proof 3 Design

## Purpose

Make the audience see daily flexible demand as controllable grid capacity: a platform coordinates individual devices, then operates the resulting fleet.

## Audience outcome

By the end, cloud-native practitioners should understand that a VPP makes distributed household flexibility operationally useful by turning devices into a trustworthy, controllable portfolio.

## Narrative and visual flow

The six slides use one continuous widening camera move: home, home control, neighbourhood, portfolio, Japan dispatch, portfolio response. The scale never jumps backward.

1. **Use demand smarter** — inside a home: demand can move through the day.
2. **EVs can become controllable capacity** — Shizen Connect’s January 2024 V2H demonstration: 186 household EVs, with any 90% value visibly qualified as company-reported.
3. **HEMS can coordinate the home** — Kansai Electric and Shizen Connect’s planned technical-feasibility demonstration; visibly labelled demonstration scope and simulated capacity-market DR.
4. **Aggregation makes a fleet legible** — reuse `AggregationPyramid` to make devices readable as a portfolio.
5. **Simulated dispatch** — reuse `JapanVPPMap`; label all coordination mechanics `SIMULATED`.
6. **Illustrative portfolio response** — show operational capacity as an illustrative fleet response, never reported company performance.

## Implementation

Modify `presentation-japan/src/MainTalk.jsx` only unless an existing visual cannot preserve the zoom progression. Reuse `AggregationPyramid`, `JapanVPPMap`, `MainTalkSourceFooter`, and existing case-note patterns. Add no dependencies and no new component unless `DemandScaleScene` is necessary to express the opening scale move cleanly.

V2H and HEMS slides retain claim-level source footers and scope notes. The final two slides use explicit simulation labels. Active-only animation remains the rule; do not introduce a RAF loop unless necessary.

## Verification

Run existing main-talk evidence, rendering, and browser tests; run production build. Review one 1440×900 screenshot for title/citation legibility, qualifiers, simulation labels, and overlap.

## Boundaries

Do not claim delivered grid capacity, commercial outcomes, named regions, fleet scale beyond the stated 186 EVs, or performance beyond company-reported 90% control accuracy. Do not frame simulated dispatch as a Shizen outcome.
