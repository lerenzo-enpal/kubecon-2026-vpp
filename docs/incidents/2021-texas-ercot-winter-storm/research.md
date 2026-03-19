# Texas ERCOT Winter Storm Uri — 2021

## Quick Reference

| Field | Value |
|-------|-------|
| **Date** | February 14-19, 2021 |
| **Location** | Texas (ERCOT region) |
| **Duration** | Load shedding lasted 70+ hours; average outage 42 hours |
| **People Affected** | 4.5 million homes |
| **Deaths** | 246 |
| **Economic Cost** | $195 billion (Perryman Group high-end estimate) |
| **Root Cause** | Gas-electric death spiral — cascading feedback loop |
| **Grid Frequency Impact** | 4 minutes 37 seconds from total cold-start collapse |
| **Load Shed** | 20 GW; 52,277 MW generation unavailable |
| **Slides Referenced** | Slides 4-5, 11, 12, 27 |

## Timeline

1. **Feb 14** — Polar vortex hits Texas; temperatures plummet
2. **Feb 15 01:25** — ERCOT declares Energy Emergency Alert Level 3; begins load shedding
3. **Feb 15-16** — Generation losses accelerate; 52 GW offline out of 107 GW total capacity
4. **Feb 15** — Grid reaches 4 minutes 37 seconds from total cold-start collapse
5. **Feb 16-17** — Gas-electric death spiral peaks; gas pipelines lose power, more generators trip
6. **Feb 19** — Load shedding finally ends after ~70+ hours

## Root Cause Analysis

The gas-electric death spiral: extreme cold froze generators, ERCOT ordered load shedding, load shedding cut power to gas compressor stations and pipelines, gas supply dropped, more generators lost fuel and tripped, requiring more load shedding. Steps 4-6 formed an accelerating feedback loop.

### Contributing Factors

- Generators not winterized (neither gas nor wind)
- Gas infrastructure not weatherized; compressors depend on grid power
- ERCOT isolated (no interconnection to call for help; only ~1,256 MW DC ties)
- Energy-only market provided no capacity incentive for winterization
- Demand hit all-time winter peak

### Cascade Mechanism

Cold → generator freeze → load shedding → gas pipeline power loss → more generator trips → more load shedding. Self-reinforcing death spiral.

**Generation loss breakdown:**
- Natural Gas: 58% (~30,000+ MW)
- Wind: 27% (~16,000 MW)
- Coal: 6% (~3,000+ MW)
- Solar: 2% (~1,000 MW)
- Nuclear: <1% (~1,350 MW, South Texas Project Unit 1)
- Other: 7% (~3,000+ MW)

## Grid Context

ERCOT is intentionally isolated from the Eastern and Western Interconnections to avoid federal regulation. Only ~1,256 MW of DC ties connect to Mexico and other US grids. No ability to import emergency power at scale.

## Response & Recovery

Rolling blackouts continued for 70+ hours. $16B in overcharges from keeping the $9,000/MWh price cap too long (Potomac Economics). Griddy (retail provider) went bankrupt. Led to Texas SB 3 (weatherization mandates) and ongoing market redesign discussions.

## VPP Relevance

- **Response time gap:** Gas peakers take 10-30 min to start; batteries respond in 140ms
- **Flexibility gap:** 4.5M homes as passive consumers. With 10 GW of distributed batteries, the cascade never happens (slide 27 callback)
- **Architecture lesson:** Isolated, centralized grid with no distributed flexibility = maximum fragility. This is the presentation's anchor story.

## Key Statistics for Presentation

| Stat | Value | Source | Confidence |
|------|-------|--------|------------|
| Time to collapse | 4 min 37 sec | ERCOT testimony | High |
| Deaths | 246 | Texas DSHS | High |
| Economic damage | $195 billion | Perryman Group | Disputed |
| Homes dark | 4.5 million | ERCOT Final Report | High |
| Generation offline | 52 GW of 107 GW | FERC/NERC Report | High |
| Price spike | $50 to $9,000/MWh | ERCOT market data | High |
| Price multiplier | ~180x | Calculated | Disputed |
| Consumer bills | $7,000/week | Media reports (Griddy customers) | Medium |
| Overcharges | $16B (price cap held 2 days too long) | Potomac Economics / Texas Tribune | High |

## Sources

1. [ERCOT — Final Report on Feb 2021 Winter Storm](https://www.ercot.com/gridmktinfo/docs/2021)
2. [FERC/NERC — Texas Event Report (Nov 2021)](https://www.ferc.gov/media/february-2021-cold-weather-outages-texas-and-south-central-united-states-ferc-nerc-and)
3. [Texas Tribune — $16B overcharge analysis](https://www.texastribune.org/2021/03/04/ercot-texas-electricity-16-billion/)
4. [Potomac Economics — 2021 ERCOT State of the Market](https://www.potomaceconomics.com/wp-content/uploads/2022/05/2021-State-of-the-Market-Report.pdf)
5. [Wikipedia — 2021 Texas power crisis](https://en.wikipedia.org/wiki/2021_Texas_power_crisis)
6. [UT Austin Energy Institute — ERCOT Blackout 2021](https://energy.utexas.edu/research/ercot-blackout-2021)
7. [EIA — Wholesale price data](https://www.eia.gov/todayinenergy/detail.php?id=47876)

## Related Research Files

- [docs/ercot_texas_grid_research.md](../../ercot_texas_grid_research.md) — load zones, generation facilities, transmission topology, Feb 2021 cascade sequence with visualization recommendations
- [docs/cascading_failures_research.md](../../cascading_failures_research.md) — cross-incident comparison, cascade mechanism theory
- [docs/fact-check-report.md](../../fact-check-report.md) — Items 1, 2, 9 (cost figures, price multiplier, damage estimate)

## Load Shedding vs. Accidental Outages

Texas 2021 was **deliberate load shedding** — ERCOT ordered rolling blackouts as policy to prevent total grid collapse. This is fundamentally different from accidental outages caused by weather or equipment failure.

The EU has been highly successful at avoiding deliberate load shedding. Per ACER's 2025 Security of Supply report, **none of the EU outages in 2024 were due to inadequate electricity supply** — all were distribution/transmission faults, weather events, or equipment failures. The EU spends EUR 11B/yr on security-of-supply measures (capacity mechanisms, reserves, etc.) specifically to prevent deliberate shedding.

Key EU reliability stats (for contrast):
- **EU-27 average SAIDI: ~60 min/customer/year** (Eurelectric 2020) — almost entirely accidental
- **Germany SAIDI: 11.7 min/year** (BNetzA 2024) — among the best globally
- **SAIDI improved 31% and SAIFI improved 25% since 2015** across EU (Eurelectric)
- Range: Switzerland ~0.2 min to Bulgaria ~346 min

Sources: [ACER Security of EU Electricity Supply 2025](https://www.acer.europa.eu/monitoring/security-of-eu-electricity-supply-2025), [Eurelectric Distribution Grids 2020](https://www.eurelectric.org/wp-content/uploads/2024/06/dso-facts-and-figures-11122020-compressed-2020-030-0721-01-e.pdf), [BNetzA SAIDI 2024](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/EN/2025/20251009_SAIDI_Strom.html)

## Fact-Check Notes

- $195B is the Perryman Group high-end estimate; other sources: $26.5B direct, $80-130B total economic
- 180x price multiplier: depends on baseline chosen (~$50 is approximate; actual ranges produce 200-400x)
- "4 minutes 37 seconds" from ERCOT CEO testimony; exact methodology is debated
- $7,000 bills: real but anecdotal; applies to variable-rate Griddy customers specifically
