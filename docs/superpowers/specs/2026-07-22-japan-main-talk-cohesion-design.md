# Japan Main Talk: Cohesion and Visual Language

## Goal

Turn the 33-slide Japan main talk into a 26-slide, story-first KubeCon talk:

> Japan needs flexibility because it cannot borrow energy, wastes clean energy it already has, and must coordinate homes as trusted grid capacity.

The deck must remain self-contained, technically credible, and visually coherent with the Japan keynote without duplicating it.

## Narrative

| Section | Question | Answer / handoff |
|---|---|---|
| Arrival (2) | Why are we here? | Japan's grid has become a distributed-systems problem. |
| Act I: Japan cannot borrow (6) | Why is Japan exposed? | Island geography, 50/60 Hz seam, LNG dependency, and thin reserves create fragile supply. |
| Act II: Japan wastes what it has (6) | What is the operational paradox? | Kyushu's noon solar surplus and evening ramp make flexibility more valuable than more generation. |
| Act III: Software makes capacity (9) | What turns distributed devices into trusted grid capacity? | Shizen Connect proves the asset model; ERAB supplies market rules; cloud-native control scales and observes it. |
| Return + continue (3) | What can this audience do? | Existing cloud-native tools coordinate homes into a power plant; research links support deeper study. |

## Proposed Slide Order

1. Title + promise
2. Presenters / agenda
3. Act I card
4. Hormuz → LNG → Japan map
5. 50/60 Hz seam + island isolation
6. 15.3% self-sufficiency
7. JEPX 2021 price spike
8. 2.5% reserve warning
9. Act II card
10. Duck-curve framing
11. 12:00: Kyushu solar surplus
12. 17:00: evening ramp
13. Shizen Connect: EVs, batteries, heat pumps respond
14. VPP flattens curve
15. Act III card
16. ERAB: market contract and operating obligations
17. City graph → VPP
18. VPP architecture
19. Choreography, not orchestration
20. One grid-response demo
21. Aggregation hierarchy
22. Japan dispatch map
23. 334 MW outcome
24. What cloud-native teams can build
25. 100k homes = one power plant
26. Thank you + research links

Move detailed frequency walkthroughs and streaming aggregation to appendix and matching website deep dives. Remove the standalone island-isolation slide, duplicate self-sufficiency framing, duplicate Tokyo-curtailment framing, and static Shizen cards.

## Act II: Shizen Case Scene

The single-day case study is three consecutive slides or presenter steps sharing one time axis:

1. **12:00 — surplus:** solar exceeds local demand; curtailment risk climbs.
2. **17:00 — ramp:** solar drops while homes and cities demand power.
3. **Shizen response:** EVs, home batteries, and heat pumps absorb / release energy as a regional flexible resource.

Do not claim program MW, device counts, or service scope until backed by named primary sources. The case card must state region, asset type, operating program, source, and website deep-link.

## Visual System

### Modern Washi: narrative and charts

- Warm paper field, indigo ink, sumi-black data, vermilion only for exact alerts, amber for solar, green for recovery.
- Woodblock restraint: flat color fields, large negative space, crisp typography; no decorative patterns or faux-Japanese ornament.
- Japan markers must carry operational meaning: map contours, energy routes, alert stamps, time labels, and city-dot topology.

### Dark Mission Control: live technical scenes

- Keep dark treatment for architecture, choreography, response demo, aggregation, and dispatch map.
- The transition to dark begins at Act III, visually marking the change from observed grid condition to operating system.

### Source Language

- Every factual chart has a quiet footer: publisher / dataset / publication year.
- Every named case study has a compact source card with primary source, region, asset type, and a website deep-link.
- Speaker notes retain exact citations, date ranges, caveats, and backup answers.
- Closing slide contains a readable link or QR destination for all research. It is additional depth, never a replacement for slide evidence.

## Research Findings

**Shizen Connect** (shizenenergy.net press releases, Feb 2024 / Jul 2023): Jan 2024 demo controlled 186 household EVs via V2H at national scale for both economic dispatch and balancing-market control, 90% control accuracy (company's own claim, unverified). Program: METI's "FY2023 Demonstration Project for Further Utilization of Distributed Energy Resources." Spun off Oct 2023 from Shizen Energy; runs vendor-agnostic EMS across EVs, V2H, batteries, EcoCute heat-pump water heaters, microgrids. Targets: ¥10B VPP sales and 1GW VPP with partners by 2030. Selected for METI VPP demos 5 consecutive years.

**ERAB** (METI/enecho official guidelines): Energy Resource Aggregation Business — a private-contract framework, not a license regime. Aggregators split Category 1 (serve retailers, planned balance) / Category 2 (serve TSO/DSO, grid balance). Telemetry uses baseline "High 4 of 5" methodology, 30-minute control-amount assessment intervals, ~20% RRMSE accuracy threshold. Ties into OCCTO's supply-demand balancing market via Gate Closure timing.

**JEPX 2021 spike** (RIETI policy analysis): Late Dec 2020 – mid-Jan 2021, normal price <10 yen/kWh, peaked at 251 yen/kWh. RIETI's stated primary cause: a drop in sell offers, not demand alone — cold weather was contributing but insufficient on its own. Underlying vulnerability: LNG-fired marginal plants with thin storage/procurement buffers; ~80% of sell offers from major utilities flagged as a concentration risk (not proven manipulation). Response: supply/demand curve disclosure began Jan 22, 2021.

**Kyushu curtailment** (RenewableEI analysis of METI data): National FY2023 curtailment was **1.76 TWh** (not 1.74 as previously assumed), up from 0.57 TWh in FY2022 — over 3x. FY2018–21 Kyushu was the only curtailing region; by FY2023 only Tokyo was spared. Kyushu FY2023 rate ~6.7–7% of solar+wind output, more than double Australia's NEM or California's CAISO despite those grids having 2x Kyushu's renewable penetration. Root cause: dispatch order curtails renewables before nuclear (Kyushu nuclear >30% of mix); Chugoku interconnection capped ~2.5GW. Example: April 9, 2023, noon–1pm, record 5.9GW solar+wind curtailed while Genkai-3/-4 and Sendai-1/-2 held steady.

**Self-sufficiency / LNG / Hormuz** (METI press release, Reuters 2026-03-04, EIA): FY2023 self-sufficiency 15.3% (IEA basis), up from 12.6% in FY2022 — highest since the 2011 earthquake. Per Reuters: Japan's Middle East dependency is ~95% for oil but only ~11% for LNG; of that, ~70% of oil and ~6% of LNG transit the Strait of Hormuz specifically. Globally ~20% of LNG trade transits Hormuz (EIA). Deck must not conflate the oil and LNG dependency figures — they differ by roughly an order of magnitude.

## Non-goals

- Do not turn the main talk into the keynote or repeat keynote scenes beat-for-beat.
- Do not add unverified Japan case-study metrics.
- Do not retain technical-detail slides in the core merely to preserve existing components.

## Validation

- Full deck progression reaches 26 core slides.
- One screenshot per visual state: Washi narrative, single-day case, dark architecture/demo, dispatch / close.
- Source footer visible on every factual chart; case cards contain source and website destination.
- Appendix and website retain migrated technical detail.

## Visual References

- [Story arc](../../planning/main-talk-story-arc.svg)
- [Modern Washi language](../../planning/main-talk-modern-washi.svg)
- Editable companion screens: `.superpowers/brainstorm/55471-1784728821/content/`
