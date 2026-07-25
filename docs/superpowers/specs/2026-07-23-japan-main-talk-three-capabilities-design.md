# Japan Main Talk: Three Capabilities Design

## Goal

Make the main talk the detailed proof of the keynote promise: Japan needs flexibility. The talk must work standalone, but must not repeat the keynote’s extended exposure story.

## Narrative

### Orientation — slides 1–3

1. **Japan needs flexibility** — title and promise.
2. **One question for this talk** — how does a grid coordinate millions of small, variable resources?
3. **Japan cannot borrow** — one compact, sourced context scene: island system, 50/60 Hz seam, low primary-energy self-sufficiency, and thin reserves. This replaces the separate Act I title, standalone crisis statement, self-sufficiency chart, JEPX chart, and reserve-margin bridge in the core talk. Those evidence-rich scenes remain in the keynote and research site.

### Proof 1 — slides 4–10: Make renewables usable

Follow one connected operating day: morning balance, noon surplus, Kyushu renewable-output control, and the evening ramp. The DaylightFlexibilityScene remains the visual backbone.

Add the missing framing and outcome beats: why solar creates a timing mismatch, what “store it for later” changes, and a visible Shizen Connect case-note card. The deck must clearly distinguish an illustrative coordinated-response visual from a reported Shizen result.

### Proof 2 — slides 11–16: Respond at grid speed

Open with an explicit failure-response trigger, then establish that trusted response needs market rules and observable control.

Keep ERAB, city graph, VPP architecture, choreography, and end-to-end response loop. Treat the architecture as the mechanism connecting this proof to Proof 3, not as a separate act. Move FrequencyDemo to the technical appendix.

### Proof 3 — slides 17–22: Use demand smarter

Shift from emergencies to daily operation: EV/V2H, HEMS-controlled batteries, aggregation, simulated dispatch, and portfolio response.

Use Shizen Connect’s January 2024 V2H demonstration as a scoped case study. Use the Kansai Electric/Shizen Connect HEMS capacity-market demonstration only as a demonstration of technical feasibility; do not invent participant count, capacity, delivered market value, or commercial outcome.

### Return — slides 23–26

Keep cloud-native build patterns, trusted-capacity close, research links, and final statement. Do not restore an unsupported fixed “100k homes” equivalence; if a Japan-specific capacity equivalence is later sourced, introduce it as a separate cited claim.

## Visual system

- Orientation and Proof 1: Modern Washi. Warm paper, indigo structure, amber daylight, vermilion curtailment.
- Proof 2 begins dark Mission Control exactly when control, trust, and observability become the subject.
- Proof 3 retains dark Mission Control, using violet for normalised demand and cyan only for response/control.
- Use scene continuity instead of extra section cards. The day becomes the first proof’s time axis; the city graph becomes the transition into control-plane scenes.

## Evidence and citations

Every slide containing a numerical, historical, regulatory, or company/program claim must show a visible source strip. A source strip contains:

1. Compact reference: source publisher, publication/data label, and date or reporting period.
2. Claim-specific caveat when scope could be misunderstood, for example “power, not energy” for 5.09 GW.
3. Stable research-page anchor under `whatisavpp.com/research/japan-energy-flexibility`.

Company examples additionally receive a visible case-note card: asset type, program/date, source, and qualifier such as “company-reported” or “demonstration scope.” A generic publisher footer alone is insufficient.

Allowed claim rules:

- **Japan self-sufficiency:** “15.3% FY2023 primary-energy self-sufficiency,” never electricity self-sufficiency.
- **Hormuz:** oil and LNG statistics must be separate. Do not use “97% LNG via Hormuz.” Current working research supports roughly 70% of Japan’s oil and roughly 6% of its LNG transiting Hormuz; these must be rechecked against an exact dated primary source before a slide uses them.
- **JEPX:** retain chart date window beside any value. Do not overstate causality.
- **Kyushu:** 5.09 GW is maximum renewable-output control during 12:00–12:30 on 4 May 2025, not curtailed energy.
- **Shizen Connect:** Jan 2024 demonstration: 186 household EVs via V2H, with 90% control accuracy described as a company claim. No generalisation to other assets, regional fleet scale, or delivered grid impact.
- **ERAB:** policy/market framework, not a universal aggregator licence. State rules only where an applicable primary programme source supports them.
- **METI ERAB cybersecurity guideline:** cite its title and date only unless the underlying technical requirement is available and verified.

## Implementation boundaries

- Preserve the 26-slide core deck.
- Reuse existing Modern Washi theme, DaylightFlexibilityScene, Source footer pattern, and technical components.
- Expand evidence metadata rather than hardcoding citations in individual slides.
- Preserve technical appendix components; moving FrequencyDemo out of the core talk is not deletion.
- No new dependencies.

## Verification

- A source/data test fails if a claim slide lacks a citation record and source strip.
- A rendering/browser test verifies 26 core slides, no React errors, and visible source strips on representative Washi, dark, and case-note slides.
- Evidence test asserts allowed wording and rejects unsupported phrases, including “97% LNG via Hormuz,” unsupported annual curtailment totals, and uncaveated Shizen performance claims.
- Build and existing Playwright checks pass.

## Out of scope

- Rebuilding keynote scenes.
- Adding a live map to the single-day sequence.
- Creating a new fixed household-to-power-plant equivalence without a Japan-specific cited basis.
