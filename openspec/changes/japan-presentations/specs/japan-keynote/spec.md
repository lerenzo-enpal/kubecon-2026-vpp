## ADDED Requirements

### Requirement: Keynote deck exists as a standalone Spectacle presentation
The system SHALL provide a `Keynote.jsx` file at `presentation-japan/Keynote.jsx` that renders a complete, self-contained Spectacle `<Deck>` with approximately 22 slides covering the Japan energy crisis narrative. The deck SHALL be solo-presenter (LeRenzo only) with no co-presenter speaker notes.

#### Scenario: Keynote loads independently
- **WHEN** a user navigates to the `/japan-keynote` route
- **THEN** the Keynote deck renders without errors and the first slide is visible

#### Scenario: Keynote does not import MainTalk components
- **WHEN** the Keynote bundle is built
- **THEN** no MainTalk-specific components or slide content appears in the bundle

---

### Requirement: Opening hook — Strait of Hormuz crisis
The keynote SHALL open with the Strait of Hormuz closure (February–March 2026) as its first slide, displaying the stat `+¥15,000/household/year` as a full-bleed dramatic reveal. The slide SHALL establish that this is happening to the audience right now, not a historical example.

#### Scenario: Hormuz stat is the first content slide
- **WHEN** the presenter advances past any title/blank opener
- **THEN** the `+¥15,000` stat is the first substantive data the audience sees

#### Scenario: Hormuz slide uses dark theme regardless of theme toggle
- **WHEN** the theme toggle is set to `light`
- **THEN** the Hormuz opening slide MUST remain dark (it relies on cinematic impact)

---

### Requirement: Japan structural fragility section
The keynote SHALL include a section establishing Japan's energy structural fragility with the following data points, each on its own beat or slide:
- Self-sufficiency rate: **15.3%** (lowest in the G7)
- Fossil fuel dependency: **70%** of primary energy
- Grid architecture: island isolation, 10 regional utilities, east/west 50/60 Hz frequency seam

#### Scenario: Self-sufficiency stat is displayed prominently
- **WHEN** the fragility section is reached
- **THEN** `15.3%` is rendered at a minimum of 64px with the `JetBrains Mono` font

---

### Requirement: Historical crisis pattern — JEPX 2021 and 2022 warning
The keynote SHALL include slides covering:
- January 2021 JEPX price spike: 10 → 251 JPY/kWh over 40 days, no natural disaster trigger
- March 2022: Japan's first-ever power supply warning, TEPCO reserve reaching 2.5%

These SHALL be framed as the precursor pattern to the current Hormuz crisis.

#### Scenario: JEPX spike presented with the JEPXPriceChart component
- **WHEN** the JEPX crisis slide is active
- **THEN** the `JEPXPriceChart` visualization component is rendered showing the 10→251 JPY/kWh arc

---

### Requirement: Demand accelerant — data center growth
The keynote SHALL include a slide showing Japan data center electricity demand growth from 19 TWh (current) to 57–66 TWh by 2034, using the `JapanDemandForecast` component. The OCCTO forecast of 14× growth from combined DC + semiconductor demand SHALL be referenced.

#### Scenario: Demand forecast chart is animated on entry
- **WHEN** the demand forecast slide becomes active
- **THEN** the `JapanDemandForecast` chart animates its growth curve from left to right

---

### Requirement: Narrative pivot to cloud-native VPP
The keynote SHALL include a pivot slide with the thesis statement: "The grid IS a distributed system. We know how to build those." This SHALL be a text-dominant slide with no visualization, functioning as a hard scene break between the problem and solution sections.

#### Scenario: Pivot slide is text-only
- **WHEN** the pivot slide is active
- **THEN** no charts, maps, or canvas components are rendered — only the thesis statement text

---

### Requirement: Cloud-native VPP architecture section
The keynote SHALL include the `VPPArchitecture` component (imported from `../../presentation/src/components/`) showing the full stack: Energy Market → Trading Gateway → VPP Controller → Cloud → IoT Homes via MQTT. The slide SHALL reference: Dapr Actors, CQRS, Kafka/EventHub, MQTT/EMQX, ArgoCD, Spark, OpenTelemetry.

#### Scenario: VPPArchitecture component renders in keynote
- **WHEN** the architecture slide is active
- **THEN** `VPPArchitecture` renders without errors using the Japan theme tokens

---

### Requirement: Closing — 100,000 homes = one power plant
The keynote SHALL close with the statement "100,000 homes coordinated by software = one power plant" as the final memorable takeaway. This SHALL be a full-bleed dark slide with the number `100,000` as a large counter-tick-up animation.

#### Scenario: Closing number animates on entry
- **WHEN** the closing slide becomes active
- **THEN** the number animates from 0 to 100,000 using the counter tick-up pattern (accelerate then decelerate)

#### Scenario: Slide count is approximately 22
- **WHEN** the keynote deck is rendered
- **THEN** the total slide count is between 20 and 24 slides
