# Dunkelflaute (Dark Doldrums) — Germany 2024

## Quick Reference

| Field | Value |
|-------|-------|
| **Date** | November-December 2024 |
| **Location** | Germany |
| **Duration** | 14 consecutive days below 10% renewable capacity |
| **People Affected** | N/A (no outage; prices spiked) |
| **Deaths** | 0 |
| **Economic Cost** | Elevated wholesale prices for ~2 months |
| **Root Cause** | Persistent high-pressure weather system — no wind, limited solar |
| **Grid Frequency Impact** | None (managed by conventional generation) |
| **Load Shed** | None |
| **Slides Referenced** | Appendix (Dunkelflaute slide), Speaker Script |

## Timeline

1. **Early November 2024** — High-pressure system settles over Central Europe
2. **November** — Wind output drops to 3.8% of installed capacity (72.75 GW installed, ~2.8 GW output)
3. **November-December** — 14 consecutive days below 10% of installed renewable capacity
4. **November** — Wholesale prices spike to EUR 145/MWh
5. **December** — Prices reach EUR 175/MWh (~2x annual average)

## Root Cause Analysis

A persistent anticyclonic weather pattern (high pressure) brought still air and overcast skies across Central Europe. Both wind and solar output collapsed simultaneously — the nightmare scenario for renewable-dependent grids.

### Contributing Factors

- High-pressure weather pattern (meteorological, not grid failure)
- Wind at 3.8% of 72.75 GW installed capacity
- Solar contribution only 4.3% vs ~25% in summer
- Total renewables dropped to ~30% (vs normal 50%+)
- Germany's remaining nuclear and coal plants provided backup but at high cost

### Cascade Mechanism

Not a cascade — this is a sustained generation deficit event. The grid did not fail; conventional generation filled the gap. But it demonstrates the limits of renewables without storage.

## Grid Context

Germany had 72.75 GW of installed wind capacity and significant solar. During normal conditions, renewables provide 50%+ of electricity. During this event, they dropped to ~30%. Gas and remaining coal plants filled the gap, but at 2x average wholesale prices.

## Response & Recovery

No outage — the grid handled it through conventional generation. But the cost impact was significant and the event demonstrated that seasonal storage and flexibility are essential for a high-renewable grid.

## VPP Relevance

- **Response time gap:** Not applicable — this is a multi-day event, not a seconds-scale emergency
- **Flexibility gap:** Current battery storage (hours of capacity) insufficient for 14-day Dunkelflaute; but VPPs can optimize demand shifting, EV charging schedules, heat pump pre-heating to reduce peak demand during high-price periods
- **Architecture lesson:** VPPs are necessary but not sufficient for Dunkelflaute. Long-duration storage (hydrogen, pumped hydro) also needed. A VPP's value here is in demand-side optimization — reducing the cost impact by shifting load to lower-price hours within each day. Only bring up if audience asks "what if there's no wind or sun?"

## Key Statistics for Presentation

| Stat | Value | Source | Confidence |
|------|-------|--------|------------|
| Duration below 10% renewables | 14 consecutive days | SMARD.de / Fraunhofer ISE | High |
| Wind capacity factor | 3.8% of installed | SMARD.de | High |
| Installed wind capacity | 72.75 GW | BNetzA | High |
| Price spike (Nov) | EUR 145/MWh | EPEX SPOT | Disputed |
| Price spike (Dec) | EUR 175/MWh | EPEX SPOT | Disputed |
| Renewables share during event | ~30% (vs normal 50%+) | SMARD.de | Medium |

## Sources

1. [SMARD.de — German electricity market data](https://www.smard.de/en)
2. [Fraunhofer ISE — Energy Charts](https://energy-charts.info/)
3. [Timera Energy — Impact of German Dunkelflaute on flex asset value](https://timera-energy.com/blog/impact-of-german-dunkelflaute-on-flex-asset-value/)
4. [Clean Energy Wire — Power prices spike amid Dunkelflaute](https://www.cleanenergywire.org/news/short-term-power-prices-spike-amid-new-dunkelflaute-germany-most-customers-unaffected)
5. BNetzA — Installed capacity statistics

## Related Research Files

- [docs/fact-check-report.md](../../fact-check-report.md) — Item 17 (price attribution: Nov vs Dec, "4x" multiplier correction)
- [docs/electricity-price-research.md](../../electricity-price-research.md) — German wholesale price data, negative price hours
- [docs/demand-response-research.md](../../demand-response-research.md) — Dunkelflaute metrics, capacity factor data

## Fact-Check Notes

- EUR 145/MWh and EUR 175/MWh figures need verification against EPEX SPOT actual data; fact-check report flags these as potentially imprecise
- "14 consecutive days" metric definition matters — below 10% of installed capacity vs. below 10% of demand are different claims
- Dunkelflaute frequency cited as "2-10 times per year, 50-100 hours/month in winter" — needs source verification
