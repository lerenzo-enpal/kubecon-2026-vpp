# South Australia Heatwave Blackout — 2017

## Quick Reference

| Field | Value |
|-------|-------|
| **Date** | February 8, 2017 |
| **Location** | South Australia |
| **Duration** | Hours |
| **People Affected** | ~90,000 homes |
| **Deaths** | 0 |
| **Economic Cost** | |
| **Root Cause** | Extreme heat caused demand spike; AEMO ordered load shedding |
| **Grid Frequency Impact** | |
| **Load Shed** | ~90,000 homes disconnected |
| **Slides Referenced** | Slide 12 (Not an Isolated Incident) |

## Timeline

1. Extreme heatwave hits South Australia; temperatures reach 41.4-42.4 C in Adelaide
2. Air conditioning demand spikes; generation margin tightens
3. AEMO directs load shedding to maintain system security
4. ~90,000 homes lose power

## Root Cause Analysis

Extreme heat combined with generation constraints. SA's generation fleet, still recovering from the September 2016 event politically and structurally, could not meet peak demand under extreme conditions.

### Contributing Factors

- Extreme temperatures (~42 C in Adelaide)
- Limited gas generation availability
- Post-2016 political environment around energy security
- Ongoing structural low inertia

### Cascade Mechanism

Not a classic cascade — this was directed load shedding (controlled, not uncontrolled). AEMO shed load proactively to prevent a repeat of the 2016 statewide blackout.

## Grid Context

Less than 5 months after the statewide blackout. Political and operational sensitivity was extremely high. SA government was actively procuring battery storage solutions.

## Response & Recovery

Load shedding was controlled and targeted. Power restored within hours. Event further accelerated the push for the Hornsdale Power Reserve and distributed storage.

## VPP Relevance

- **Response time gap:** 90,000 homes shed because no demand-side flexibility existed
- **Flexibility gap:** With VPP-connected batteries in those homes, load could have been reduced without disconnection
- **Architecture lesson:** Even "controlled" load shedding is a failure mode. A VPP turns blunt disconnection into surgical demand management.

## Key Statistics for Presentation

| Stat | Value | Source | Confidence |
|------|-------|--------|------------|
| Homes affected | ~90,000 | AEMO event report | High |
| Temperature | 41.4-42.4 C (Adelaide) | BOM records | High |

## Sources

1. AEMO — SA Load Shedding Event Report (February 2017)
2. [Bureau of Meteorology — Adelaide temperature records](http://www.bom.gov.au/climate/current/annual/sa/summary.shtml)
3. [World Weather Attribution — Extreme Heat Australia Feb 2017](https://www.worldweatherattribution.org/extreme-heat-australia-february-2017/)

## Related Research Files

- [docs/fact-check-report.md](../../fact-check-report.md) — Item 20 (temperature correction: 42 C not 45 C)
- [docs/demand-response-research.md](../../demand-response-research.md) — SA energy context, Hornsdale response

## Fact-Check Notes

- Presentation previously stated ~45 C; actual Adelaide temperatures were 41.4-42.4 C
- Some regional stations may have reached higher; use Adelaide figure for accuracy
