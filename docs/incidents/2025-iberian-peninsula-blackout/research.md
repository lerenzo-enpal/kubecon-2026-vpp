# Iberian Peninsula Blackout — 2025

## Quick Reference

| Field | Value |
|-------|-------|
| **Date** | April 28, 2025 |
| **Location** | Spain, Portugal, parts of southern France |
| **Duration** | Nearly a full day |
| **People Affected** | 55-60 million |
| **Deaths** | |
| **Economic Cost** | |
| **Root Cause** | Cascading overvoltage — first blackout in world history caused by overvoltage |
| **Grid Frequency Impact** | Total collapse from 50 Hz to 0 in ~6 seconds |
| **Load Shed** | 15 GW sudden loss; entire Iberian grid collapsed |
| **Slides Referenced** | Slide 12 (Not an Isolated Incident) |

## Timeline

1. **Morning of April 28** — Voltage instability builds across the Iberian grid
2. **12:03-12:07** — First period of oscillations in Continental European synchronous area
3. **12:19-12:21** — Second period of oscillations
4. **12:33:00** — Sharp voltage increase in Spain
5. **12:33:18** — Frequency begins rapid decline
6. **12:33:20** — Iberia disconnects from France; load shedding activated but insufficient
7. **12:33:21** — AC overhead lines between France and Spain disconnect
8. **12:33:24** — Complete collapse; HVDC France-Spain stops
9. **~12:33:24** — Total blackout across Spain and Portugal — 6 seconds from first voltage spike to collapse

## Root Cause Analysis

This was the first major blackout in history caused by overvoltage (not undervoltage). High solar penetration (~59% of supply at collapse time) meant most generation was inverter-based with limited reactive power support. A voltage increase triggered overvoltage protection on renewable generators, disconnecting them. Each disconnection reduced reactive power absorption, further increasing voltage — a cascading overvoltage feedback loop.

### Contributing Factors

- High solar penetration (~59% of electricity at time of collapse)
- Insufficient synchronous generation for voltage stability
- Low system inertia (inverter-based generation provides no mechanical inertia)
- Fragile transmission state with inadequate security margins
- Weak reactive power response protocols
- Only 25 MW of battery storage installed (target was 500 MW by 2025)
- Power factor control settings on renewables caused self-disconnection

### Cascade Mechanism

Voltage rise → overvoltage protection trips renewable generators → reduced reactive power absorption → further voltage rise → more generators trip → cascading overvoltage → complete collapse in 6 seconds. Fossil, nuclear, AND renewable plants all disconnected to self-protect.

## Grid Context

Sunny spring day with very high solar output. ~59% of electricity from solar at the time of collapse. Limited synchronous generation running. Spain had been aggressively expanding solar without corresponding storage or reactive power infrastructure.

## Response & Recovery

Full restoration took nearly a full day. Event triggered continent-wide review of renewable integration standards, particularly around voltage ride-through and reactive power requirements.

## VPP Relevance

- **Response time gap:** 6 seconds from first spike to total collapse — only batteries (140ms response) could have acted fast enough
- **Flexibility gap:** 25 MW of storage vs. 15 GW of lost generation; massive under-investment in flexibility
- **Architecture lesson:** This is the definitive case for why high renewable penetration without distributed storage is dangerous. Batteries provide both fast frequency response AND voltage support (through smart inverters). A VPP fleet could have absorbed the voltage transient.

## Key Statistics for Presentation

| Stat | Value | Source | Confidence |
|------|-------|--------|------------|
| People affected | 55-60 million | REE/REN reports | High |
| Collapse duration | ~6 seconds | Preliminary investigation | High |
| Generation lost | 15 GW | REE/REN reports | High |
| Solar penetration at collapse | ~59% | Grid data | Medium |
| Battery storage installed | 25 MW (vs 500 MW target) | Industry reports | Medium |

## Sources

1. [REE (Red Electrica de Espana)](https://www.ree.es/en) — Preliminary Incident Report (2025)
2. REN (Redes Energeticas Nacionais) — Portuguese grid operator report
3. ENTSO-E — Continental Synchronous Area Incident Analysis
4. [Wikipedia — 2025 Iberian blackout](https://en.wikipedia.org/wiki/2025_Iberian_blackout)

## Related Research Files

- [docs/iberian_blackout_2025.md](../../iberian_blackout_2025.md) — detailed timeline, overvoltage cascade analysis, VPP prevention case
- [docs/cascading_failures_research.md](../../cascading_failures_research.md) — Spain 2025 in cross-incident context

## Fact-Check Notes

- "First overvoltage-caused blackout" claim needs verification from final incident report
- 59% solar penetration figure is from preliminary data; final figures may differ
- Death toll not yet confirmed in available sources
