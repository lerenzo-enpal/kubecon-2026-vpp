## ADDED Requirements

### Requirement: JEPXPriceChart — JEPX 2021 price spike visualization
The system SHALL provide a `JEPXPriceChart` canvas component that renders the January 2021 JEPX spot electricity price spike as an animated line chart. The chart SHALL show the price progression from approximately 10 JPY/kWh to 251 JPY/kWh over 40 days, then the subsequent decline. The spike peak SHALL be highlighted with a callout annotation.

#### Scenario: Chart animates on slide activation
- **WHEN** the containing slide becomes active (`isSlideActive` is true)
- **THEN** the price line animates from left to right over approximately 2 seconds

#### Scenario: Peak is annotated
- **WHEN** the chart animation reaches the peak
- **THEN** a callout label reads "251 JPY/kWh" with a vertical marker line at the peak date

#### Scenario: Y-axis uses JetBrains Mono
- **WHEN** the chart is rendered
- **THEN** all axis labels and the peak annotation use JetBrains Mono font

#### Scenario: Chart stops animating when slide is inactive
- **WHEN** `isSlideActive` is false
- **THEN** the RAF loop is cancelled and no canvas repaints occur

---

### Requirement: JapanGridMap — deck.gl regional utility map
The system SHALL provide a `JapanGridMap` deck.gl + MapLibre component showing Japan's 10 regional electricity utility zones, the 50/60 Hz frequency seam (running east-west through the Chubu/Kanto border region), and HVDC interconnection links with capacity labels.

#### Scenario: 10 regional utility zones are visible
- **WHEN** the JapanGridMap component is rendered
- **THEN** all 10 regional utility zone boundaries or markers are present (Hokkaido, Tohoku, Tokyo/TEPCO, Chubu, Hokuriku, Kansai, Chugoku, Shikoku, Kyushu, Okinawa)

#### Scenario: Frequency seam is visually distinct
- **WHEN** the map is at its default zoom level
- **THEN** the 50/60 Hz boundary is rendered as a visually distinct line (e.g., amber/warning color) with a label

#### Scenario: HVDC link capacity is labeled
- **WHEN** the map shows HVDC interconnectors
- **THEN** each link displays its capacity in GW using JetBrains Mono

#### Scenario: Map follows Mission Control dark aesthetic
- **WHEN** the component is rendered
- **THEN** the map uses a dark tile style (no light basemap) and node/line colors follow the style guide color semantics

---

### Requirement: JapanSelfSufficiencyChart — G7 self-sufficiency comparison
The system SHALL provide a `JapanSelfSufficiencyChart` canvas component showing energy self-sufficiency rates for G7 nations as an animated horizontal bar chart. Japan's bar (15.3%) SHALL be visually highlighted as an outlier. The chart SHALL use the danger color (`#ef4444`) for Japan's bar to signal its vulnerability.

#### Scenario: Japan bar is visually differentiated
- **WHEN** the chart is fully rendered
- **THEN** Japan's bar uses `#ef4444` (danger) while other G7 bars use `#94a3b8` (muted)

#### Scenario: "Lowest in G7" callout is present
- **WHEN** the chart is fully rendered
- **THEN** a text annotation below or beside Japan's bar reads "Lowest in G7"

#### Scenario: Bars animate in on slide activation
- **WHEN** the slide becomes active
- **THEN** bars grow from left to right in a staggered sequence (200ms between each bar)

---

### Requirement: KyushuCurtailmentChart — solar curtailment spread visualization
The system SHALL provide a `KyushuCurtailmentChart` canvas component showing Japan solar curtailment volume by region over time (2023–2026). The chart SHALL show Kyushu as the origin region with curtailment spreading to other regions. The March 2026 event (curtailment reaching Tokyo/TEPCO) SHALL be marked with a milestone annotation.

#### Scenario: Kyushu data series is highlighted
- **WHEN** the chart is rendered
- **THEN** Kyushu's data series uses the accent color (`#FFC217`) and is rendered at higher opacity than other series

#### Scenario: Tokyo milestone is annotated
- **WHEN** the chart renders the March 2026 data point for Tokyo
- **THEN** a vertical marker line and label indicates "Curtailment reaches Tokyo"

#### Scenario: Total curtailment H1 2025 is shown
- **WHEN** the chart is fully rendered
- **THEN** a callout annotation displays "1.74 TWh wasted — H1 2025"

---

### Requirement: JapanDemandForecast — data center demand growth chart
The system SHALL provide a `JapanDemandForecast` canvas component showing Japan data center electricity demand growth from 19 TWh (base year) to 57–66 TWh by 2034. The chart SHALL include a forecast band showing the range (57–66 TWh). The OCCTO projection line SHALL be labeled.

#### Scenario: Growth curve animates from left to right
- **WHEN** the slide becomes active
- **THEN** the demand curve draws from left to right over approximately 2 seconds

#### Scenario: Forecast band is rendered
- **WHEN** the chart is fully rendered
- **THEN** a shaded band between 57 TWh and 66 TWh appears at the 2034 x-position

#### Scenario: Key data points are labeled
- **WHEN** the chart is rendered
- **THEN** the baseline (19 TWh) and the 2034 midpoint (approximately 62 TWh) are labeled with JetBrains Mono text

---

### Requirement: JapanVPPMap — Kansai/Kyushu VPP dispatch scenario HUD
The system SHALL provide a `JapanVPPMap` deck.gl + MapLibre component following the `SAMapHUD` interaction pattern exactly. The component SHALL show a Kansai/Kyushu region VPP dispatch scenario with NODES (residential battery locations), transmission corridor lines, camera fly-to VIEWS, and sequential cascade STEPS showing VPP activation spreading across the region.

#### Scenario: Cascade steps activate nodes sequentially
- **WHEN** the slide becomes active and steps progress
- **THEN** battery nodes transition from cyan (grid) to green (VPP active) in sequence, with 400–700ms stagger

#### Scenario: Camera fly-to transitions work
- **WHEN** a step triggers a view change
- **THEN** the map camera flies to the new position using FlyToInterpolator over 3–5 seconds

#### Scenario: HUD overlay renders frequency and dispatch data
- **WHEN** the VPP activation is complete
- **THEN** an overlay panel shows grid frequency (Hz), active batteries count, and MW dispatched using JetBrains Mono

#### Scenario: Component guards animation on isSlideActive
- **WHEN** `isSlideActive` is false
- **THEN** no deck.gl layer updates or camera transitions are triggered

---

### Requirement: All components follow canvas animation standards
All canvas-based visualization components SHALL follow the canvas animation standards defined in `docs/style-guide.md`: 2× retina scaling, `requestAnimationFrame` loop with unmount cleanup, time-based animation using `performance.now()`, shadow/glow batching by color, and `padTop >= 55px` / `padBottom >= 65px` to prevent cutoff.

#### Scenario: Canvas is retina-scaled
- **WHEN** any canvas component renders
- **THEN** `canvas.width = containerWidth * 2` and `ctx.scale(2, 2)` are applied

#### Scenario: Animation cleans up on unmount
- **WHEN** a canvas component is unmounted
- **THEN** `cancelAnimationFrame` is called and no further repaints occur
