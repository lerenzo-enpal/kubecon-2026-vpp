# Main Talk: New Flow + Research Notes (working doc)

Purpose: lock down research + new story-beat structure before rebuilding the `jAtya` visual storyboard in Pencil. This is NOT the 26-slide MainTalk.jsx flow recreated — it's a new section-level flow, built from the cohesion spec + keynote examples, that the storyboard should visualize.

Ground truth docs feeding this:
- `docs/superpowers/specs/2026-07-22-japan-main-talk-cohesion-design.md` (narrative table, research findings, visual system)
- `docs/planning/keynote-slide-storyboard.svg` (4-macro-slide keynote — separate deck, but supplies reusable framing: "a graph is a city, under load", three response capabilities)
- `presentation-japan/src/MainTalk.jsx` (current implementation — reference for what already exists, not the target structure itself)

## Research findings (carry into storyboard cards verbatim — don't re-derive)

- **Shizen Connect**: Jan 2024 demo, 186 household EVs via V2H, national-scale economic dispatch + balancing-market control, 90% control accuracy (company's own unverified claim). METI FY2023 DER demo program. Spun off Oct 2023 from Shizen Energy. Targets ¥10B VPP sales / 1GW with partners by 2030.
- **ERAB**: METI/enecho private-contract framework (not a license). Category 1 = serves retailers (planned balance); Category 2 = serves TSO/DSO (grid balance). "High 4 of 5" baseline methodology, 30-min control-amount intervals, ~20% RRMSE threshold. Ties to OCCTO via Gate Closure.
- **JEPX 2021 spike**: <10 → 251 yen/kWh, late Dec 2020–mid Jan 2021. RIETI: primary cause was a drop in sell offers, not demand alone. ~80% of sell offers from major utilities = concentration risk (not proven manipulation). Supply/demand curve disclosure started Jan 22 2021.
- **Kyushu curtailment**: FY2023 national 1.76 TWh (up from 0.57 TWh FY2022, >3x). Kyushu FY2023 rate ~6.7–7% of solar+wind output — more than double CAISO/NEM despite those having 2x Kyushu's renewable penetration. Cause: dispatch order curtails renewables before nuclear; Chugoku interconnect capped ~2.5GW. Record: April 9 2023, noon–1pm, 5.9GW curtailed.
- **Self-sufficiency / Hormuz**: FY2023 self-sufficiency 15.3% (up from 12.6%), highest since 2011. Japan's Middle East dependency ~95% oil / ~11% LNG. Of that, ~70% of oil and only ~6% of LNG transit Hormuz specifically — do not conflate oil vs LNG figures, they differ ~10x. Globally ~20% of LNG trade transits Hormuz.
- **METI ERAB cybersecurity guidelines** (meti.go.jp press release, 2025-05-22): "Cybersecurity Guidelines for Energy Resource Aggregation Business" — confirms METI treats VPP/DER aggregation (Category 1/2 ERAB) as a named critical-infrastructure security domain. Source PDF body not accessible (403) — cite title + date only, do not state specific technical requirements (encryption, auth, incident reporting) on a slide since they're unverified.
- **Shizen Connect + Kansai Electric capacity market demo** (shizenenergy.net, 2024-05-30 release): joint demonstration testing whether HEMS-controlled residential storage batteries can participate in Japan's capacity market as a demand-response resource. Kansai Electric Power controls batteries via its HEMS platform and holds participant permissions; Shizen Connect designs the simulated capacity-market DR program, sends control instructions, reports technical feasibility. Demonstration ran Jan–Feb 2025, Kansai region; goal is commercial capacity-market entry in FY2025. No household count, battery kW/kWh, or market value disclosed — label as demonstration scope only, not a stat.

## New flow — section level (this is what the storyboard visualizes)

Five sections, same order as the cohesion doc's narrative table, but the storyboard should show them as **story beats**, not 26 individual slides. Each section below = one act-group frame in Pencil (Header + Cards), cards = key visual beats only, not every slide.

### Arrival
Why are we here? Japan's grid is now a distributed-systems problem.
- Beat: Promise line — "Japan needs flexibility because it cannot borrow energy, wastes clean energy it already has, and must coordinate homes as trusted grid capacity."
- Beat: Presenters / agenda.
- Style: Washi.

### Act I — Japan cannot borrow
Why is Japan exposed?
- Beat: Hormuz → LNG → Japan map (island isolation, 50/60Hz seam visible on map).
- Beat: 15.3% self-sufficiency stat (with FY2022 12.6% comparison).
- Beat: JEPX 2021 spike chart (10 → 251 yen/kWh).
- Beat: reserve-margin warning (thin reserves = little room for error).
- Integrate: the oil-vs-LNG Hormuz distinction from research findings must appear as a caveat/footnote on the map card, not just in speaker notes.
- Style: Washi.

### Act II — Japan wastes what it has
What's the operational paradox?
- Beat: duck-curve framing.
- Beat: single time-axis case (12:00 Kyushu surplus → 17:00 evening ramp → Shizen Connect response), shown as one connected 3-step sequence, not three disconnected cards.
- Beat: VPP flattens the curve (outcome framing, illustrative not a claimed result).
- Integrate: Shizen Connect source card (region, asset type, program, source, link) must be visible on the response beat — required by cohesion doc's source-language rule.
- Style: Washi, transitioning toward dark by end of act (per cohesion doc: "transition to dark begins at Act III" — so Act II stays Washi throughout, dark starts exactly at Act III card).

### Act III — Software makes capacity
What turns distributed devices into trusted grid capacity?
- Three-pillar framing (this is the "3 superpowers" placeholder from earlier — resolved as):
  1. **Shizen Connect** — proves the asset model.
  2. **ERAB** — supplies market rules.
  3. **Cloud-native control** — scales and observes it (choreography, aggregation, dispatch).
- Beat: ERAB market-contract card.
- Beat: city graph → VPP framing ("a graph is a city, under load" — reused from keynote language).
- Beat: VPP architecture (dark, technical).
- Beat: choreography, not orchestration.
- Beat: one response-loop demo.
- Beat: aggregation hierarchy.
- Beat: Japan dispatch map (simulated, labeled as such).
- Beat: 334 MW outcome (illustrative, labeled as such).
- Integrate: keynote's three response capabilities ("Respond fast / Store energy / Use it smarter") can double as a capstone sub-card inside this act, since it's the same three-pillar shape restated for a live audience.
- Style: Dark Mission Control — starts here, stays for rest of deck.

### Return
What can this audience do?
- Beat: what cloud-native teams can build (event streams, actors, GitOps, traces).
- Beat: 100k homes = one power plant (closing punctuation, matches keynote's Slide 4 framing).
- Beat: thank you + research links (whatisavpp.com/research/japan-energy-flexibility).
- Style: Dark Mission Control (carries over from Act III, no snap back to Washi).

## Explicit non-goals for the storyboard rebuild
- Do not lay out 26 individual slide cards — one card per **story beat**, several beats per act.
- Do not invent new stats — only the research findings above and what's already sourced in the cohesion doc.
- Do not conflate oil/LNG Hormuz percentages.
- Do not claim Shizen Connect or dispatch-map numbers as verified outcomes — label simulated/illustrative per cohesion doc's non-goals.

## Open item
None blocking — three-pillar ("3 superpowers") ambiguity resolved above as Shizen Connect / ERAB / cloud-native control, restated via keynote's Respond-fast/Store-energy/Use-it-smarter framing as an optional capstone card.
