# Energy Pricing Research

I was unable to use WebSearch, WebFetch, or file Write tools -- all three were denied permission. Here is the research compiled from my training knowledge. While I could not verify against live web sources, these are well-documented figures from public reports. **You should verify current numbers before the presentation, especially anything dated 2024+.**

---

# Economic Impact of VPPs and Battery Storage on Electricity Prices

## 1. Merit Order Effect

Batteries sit at the bottom of the merit order with near-zero marginal cost, displacing gas peakers ($50-$300+/MWh). The Brattle Group estimated every 1 GW of battery storage reduces peak wholesale prices by 2-5%. In CAISO, battery dispatch during peak hours reduced the frequency of price spikes above $100/MWh by roughly 20-30% since 2020.

## 2. Price Reduction Studies

- **RMI (2019):** Distributed storage and demand flexibility could reduce U.S. peak electricity costs by $10-20 billion/year by 2030
- **NREL modeling:** 100 GW of distributed storage in the U.S. could cut wholesale costs by ~$7-10/MWh systemwide
- **McKinsey (2023):** Batteries and flexible demand could reduce total electricity system costs by 10-20% in high-renewable grids

## 3. Hornsdale Power Reserve (South Australia) -- Strongest Case Study

- **Capacity:** 150 MW / 193.5 MWh (after 2020 expansion)
- **FCAS cost reduction: ~90%** -- from ~AUD 53M/quarter to ~AUD 5M/quarter
- **Total FCAS savings:** ~AUD 116 million in first two years
- **High-price events (>$5,000/MWh):** Reduced by ~75% in first year
- **Revenue:** ~AUD 24 million in year one
- **Response time:** 140 milliseconds
- **Payback period:** ~2-3 years
- **Source:** Aurecon "Year 1 Technical and Market Impact Case Study" (2018)

## 4. Germany Negative Prices

- **301 hours** of negative prices in 2023 (Fraunhofer ISE), up from 211 in 2022 and 139 in 2021; trending toward 400+ in 2024
- Prices dropped as low as -EUR 500/MWh in extreme events
- Sonnen operates 100,000+ residential batteries in a community VPP, reducing participants' grid costs by 70-80%
- Battery share of German FCR (frequency containment reserve) grew from near-zero (2015) to ~70% by 2024

## 5. Duck Curve Solutions

- California's net load ramp: **13-15 GW in 3 hours** each evening
- **2.4 TWh** of solar curtailed in California in 2023
- California's battery fleet (10+ GW by 2024) has narrowed the midday-to-peak price spread by approximately 30-40%
- Moss Landing: 400 MW / 1,600 MWh -- can serve 225,000 homes during peak

## 6. Energy Arbitrage Revenue

- Arbitrage spread: buy at $20-40/MWh, sell at $80-300+/MWh
- Annual stacked revenue: **$100-150/kW/year** (arbitrage + FCAS + capacity + network support)
- Revenue breakdown: arbitrage 30-40%, FCAS 30-40%, capacity 15-20%, network support 5-10%
- VPP aggregators pay homeowners $500-$1,500/year for battery access during grid events

## 7. Consumer Bill Savings

- **Tesla Energy Plan (Australia):** 50-70% bill reduction; ~AUD 1,000/year VPP payment
- **AGL VPP (Australia):** AUD 600-900/year average savings per household
- **Sonnen Community (Germany):** Some members achieve EUR 0/month grid electricity cost
- **Green Mountain Power (Vermont):** 20-30% bill reduction; utility avoided ~$3M/year in peak demand charges
- **Octopus Energy (UK):** V2G participants earn GBP 30-50/month

## 8. AEMO VPP Findings

- VPP dispatch accuracy exceeded 95% in trials
- Performance comparable to or better than traditional generators for FCAS
- Projected FCAS savings at scale: **AUD 100-200 million/year**
- AEMO ISP: DER orchestration could defer **AUD 12-15 billion** in network infrastructure

## 9. European Market Participation

- **UK Capacity Market:** Battery storage secured ~3 GW at GBP 30-63/kW/year (2023 T-4 auction)
- **European FCR:** EUR 80,000-175,000/MW/year revenue
- **EU Clean Energy Package:** Mandates aggregation access, minimum bid sizes of 100 kW or lower
- **Leading VPPs:** Next Kraftwerke (Shell) ~15 GW, Statkraft ~16 GW aggregated portfolios

## 10. 2030 Projections

- **BNEF:** VPPs/storage could reduce global electricity costs by **$150-200 billion/year**
- **IEA:** Distributed solar+storage could provide 10-20% of peak capacity, avoiding 100-200 GW of gas peakers
- **Brattle Group:** 60 GW U.S. distributed storage could avoid **$20-35 billion** in T&D infrastructure
- **Battery cost trajectory:** $800/kWh (2020) to ~$300-400/kWh (2025) toward **$200/kWh by 2030**; at $100/kWh grid-scale, batteries beat gas peakers for any dispatch under 4 hours

---

**Key slide-ready numbers:**

| Metric | Value |
|--------|-------|
| Hornsdale FCAS cost reduction | ~90% |
| SA high-price events cut | ~75% year 1 |
| Germany negative price hours | 301 (2023) |
| California battery fleet | 10+ GW |
| Consumer VPP bill savings | 30-70% |
| Battery share of German FCR | ~70% |
| Projected global savings 2030 | $150-200B/year |
| Battery cost trend | $800 -> $200/kWh |

**Important:** I was unable to access live web sources (both WebSearch and WebFetch permissions were denied) and could not write the file to the repo (Write permission denied). To save this research, you could either grant write permission and ask me again, or copy this output manually. I also recommend re-running this research with web search enabled to get the latest 2025-2026 figures, particularly on battery costs, German negative price hours, and California storage deployment which are evolving rapidly.
---

## Verified: German Evening Peak Prices (EPEX SPOT Day-Ahead, 19:00 CEST)

**Verified 2026-03-17. Source: Fraunhofer ISE energy-charts.info API (data origin: Bundesnetzagentur / SMARD.de, CC BY 4.0).**

These are the real average EPEX SPOT day-ahead prices at **19:00 CEST (17:00 UTC)** across **June–August** per year.
They are used in `DuckCurveChart.jsx` and `DuckCurveVPP.jsx` for the evening ramp price annotation.

### Values used in the chart

| Year | 19:00 CEST avg (Jun–Aug) | 18–21h avg (Jun–Aug) | 19:00 max | 19:00 p90 | Bidding zone |
|------|--------------------------|----------------------|-----------|-----------|-------------|
| 2015 | **41 EUR/MWh** | 39.6 | 66.4 | 50.2 | DE-AT-LU |
| 2018 | **59 EUR/MWh** | 57.5 | 86.0 | 70.9 | DE-AT-LU |
| 2021 | **101 EUR/MWh** | 98.0 | 150.0 | 126.8 | DE-LU |
| 2023 | **128 EUR/MWh** | 124.8 | 276.1 | 170.3 | DE-LU |
| 2025 | **120 EUR/MWh** | 121.9 | 307.3 | 159.0 | DE-LU |
| 2030 | **~140 EUR/MWh** (projection) | — | — | — | — |

Note: DE-AT-LU was the single German/Austrian/Luxembourg bidding zone until October 2018.
After October 1 2018, Austria split off and Germany became DE-LU.

### How to reproduce

Using the Fraunhofer ISE energy-charts.info API (free, CC BY 4.0):

```bash
# 2015 and 2018: use DE-AT-LU zone
curl "https://api.energy-charts.info/price?bzn=DE-AT-LU&start=2015-06-01&end=2015-08-31"
curl "https://api.energy-charts.info/price?bzn=DE-AT-LU&start=2018-06-01&end=2018-08-31"

# 2021 onwards: use DE-LU zone
curl "https://api.energy-charts.info/price?bzn=DE-LU&start=2021-06-01&end=2021-08-31"
curl "https://api.energy-charts.info/price?bzn=DE-LU&start=2023-06-01&end=2023-08-31"
curl "https://api.energy-charts.info/price?bzn=DE-LU&start=2025-06-01&end=2025-08-31"
```

Filter the JSON for hours where `unix_seconds % 86400 / 3600 == 17` (17:00 UTC = 19:00 CEST in summer).
Then take the average. The API returns an array of `unix_seconds` and a parallel `price` array.

### Context

- The 2021 jump (41→101 EUR/MWh) partly reflects post-COVID gas market tightening, not only duck curve stress.
- The 2023 peak (128 EUR/MWh) reflects gas-crisis aftermath and tightened capacity margins.
- The 2025 slight dip to 120 EUR/MWh reflects new battery storage capacity softening peak prices.
- 2030 (~140) is a projection: steeper ramp stress vs. more storage — net direction is upward.
- These are **averages**. Spike events are much higher: 2025 saw 307 EUR/MWh max at 19:00 CEST in summer.

### Why the old code was wrong

The previous chart computed `peakPrice = demandToPrice(maxNet)` using a fictional merit-order model.
`maxNet` was always at hour 18 (baseDemand=60 GW, the highest hour). As solar scale grew, 1 GW of
residual solar at 18:00 shrank `maxNet` by up to 1.5 GW in 2030. In the steep `≥55 GW` pricing zone
(+20 EUR/MWh per GW), this produced a false downward drift from ~277 → ~255 EUR/MWh — completely
backwards from reality.
