## ADDED Requirements

### Requirement: Main talk deck exists as a standalone Spectacle presentation
The system SHALL provide a `MainTalk.jsx` file at `presentation-japan/MainTalk.jsx` that renders a complete Spectacle `<Deck>` with approximately 33 slides. The deck SHALL support two presenters: LeRenzo Malcolm and Priyanka, with speaker attribution labels following the same visual pattern as the existing Amsterdam presentation.

#### Scenario: Main talk loads independently
- **WHEN** a user navigates to the `/japan-main` route
- **THEN** the MainTalk deck renders without errors and the first slide is visible

#### Scenario: Both presenter names appear in speaker sections
- **WHEN** any speaker-labeled slide is visible
- **THEN** the label reads either "LERENZO" or "PRIYANKA" (never "MARIO")

---

### Requirement: Act 1 — Japan grid topology
Act 1 SHALL replace the EU/Texas grid content with Japan-specific content covering:
- Japan's east/west 50/60 Hz frequency seam with only 1.2 GW of conversion capacity
- Island grid isolation: 10 regional utilities with minimal HVDC interconnection
- The `JapanGridMap` component showing the 10 regional utility zones and frequency boundary
- The 15.3% self-sufficiency stat with the `JapanSelfSufficiencyChart` G7 comparison

#### Scenario: JapanGridMap renders in Act 1
- **WHEN** the Japan grid topology slide is active
- **THEN** `JapanGridMap` renders showing regional boundaries and the 50/60 Hz seam line

#### Scenario: Self-sufficiency comparison chart renders
- **WHEN** the self-sufficiency slide is active
- **THEN** `JapanSelfSufficiencyChart` shows Japan at 15.3% visually differentiated from other G7 nations

---

### Requirement: Act 1 — JEPX 2021 crisis as Japan's Texas moment
Act 1 SHALL include the January 2021 JEPX price spike (10 → 251 JPY/kWh over 40 days) as Japan's equivalent of the Texas 2021 winter storm event, using the `JEPXPriceChart` component. The framing SHALL explicitly draw the parallel: "same fragility, different cause."

#### Scenario: JEPX framing uses comparative language
- **WHEN** the JEPX slide is active
- **THEN** slide content references the structural parallel to Texas (no natural disaster, market-driven cascade)

---

### Requirement: Act 2 — Japan renewables and curtailment
Act 2 SHALL cover Japan's renewable integration challenge with Japan-specific content:
- Japan duck curve with Kyushu regional data using the `DuckCurveChart` component (imported from `../../presentation/src/components/`)
- Kyushu solar curtailment: 1.74 TWh wasted in H1 2025, spreading nationally to Tokyo in March 2026
- The `KyushuCurtailmentChart` component showing curtailment growth by region over time

#### Scenario: Kyushu curtailment chart renders
- **WHEN** the curtailment slide is active
- **THEN** `KyushuCurtailmentChart` renders showing the geographic spread from Kyushu toward Tokyo

---

### Requirement: Act 2 — Japanese VPP demonstrations
Act 2 SHALL include slides covering real Japanese VPP pilots:
- Shizen Connect: EV VPP aggregation (Kansai region)
- HEMS residential battery aggregation programs

These SHALL be presented as proof that VPP is not hypothetical — it is operating in Japan today.

#### Scenario: Japanese VPP examples are cited specifically
- **WHEN** the Japanese VPP demo slides are visible
- **THEN** "Shizen Connect" and "HEMS" are named explicitly (not generic "a Japanese company")

---

### Requirement: Act 3 — VPP architecture with ERAB regulatory layer
Act 3 SHALL reuse `VPPArchitecture` (from `../../presentation/src/components/`) and add an ERAB (Energy Resource Aggregation Business) regulatory framing slide explaining Japan's aggregator license framework before the architecture deep-dive.

#### Scenario: ERAB slide precedes VPPArchitecture
- **WHEN** Act 3 is navigated in order
- **THEN** the ERAB explanation slide appears before the VPPArchitecture component slide

---

### Requirement: Act 3 — Japan VPP map HUD
Act 3 SHALL include the `JapanVPPMap` component showing a Kansai/Kyushu VPP dispatch scenario following the same SAMapHUD interaction pattern (cascade steps, animated nodes, fly-to camera transitions).

#### Scenario: JapanVPPMap cascade steps animate correctly
- **WHEN** the JapanVPPMap slide is active and the presenter advances through steps
- **THEN** battery nodes activate sequentially with the grid-stabilization color transition (cyan → green)

---

### Requirement: Slide count and three-act structure
The main talk SHALL contain approximately 33 slides organized into three explicit acts with title cards: "ACT I: THE GRID", "ACT II: THE RENEWABLES PROBLEM", "ACT III: THE VPP SOLUTION".

#### Scenario: Act title cards are present
- **WHEN** the full deck is rendered
- **THEN** exactly three act title cards are present with the specified titles

#### Scenario: Slide count is approximately 33
- **WHEN** the main talk deck is rendered
- **THEN** total slide count is between 30 and 36 slides

---

### Requirement: Shared component reuse
The main talk SHALL import the following components from `../../presentation/src/components/` without copying them: `VPPArchitecture`, `ChoreographyLoop`, `ResponseTimeline`, `StreamingAggregation`, `AggregationPyramid`, `DuckCurveChart`, `DuckCurveVPP`, `GridFrequencyExplainer`, `FrequencyDemo`, `FrequencyWalkthrough`.

#### Scenario: No component files are duplicated
- **WHEN** the `presentation-japan/src/components/` directory is inspected
- **THEN** none of the above component filenames exist in that directory
