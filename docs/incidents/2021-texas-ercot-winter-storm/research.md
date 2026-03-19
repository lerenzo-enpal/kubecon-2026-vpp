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

## Fact-Check Notes

- $195B is the Perryman Group high-end estimate; other sources: $26.5B direct, $80-130B total economic
- 180x price multiplier: depends on baseline chosen (~$50 is approximate; actual ranges produce 200-400x)
- "4 minutes 37 seconds" from ERCOT CEO testimony; exact methodology is debated
- $7,000 bills: real but anecdotal; applies to variable-rate Griddy customers specifically
