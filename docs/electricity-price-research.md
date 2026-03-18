# German Electricity Price Research for Duck Curve Visualization

## Sources & References

- [Bundesnetzagentur / SMARD](https://www.bundesnetzagentur.de/1043444) — Official German energy market data
- [FfE EPEX SPOT 2024 Analysis](https://www.ffe.de/en/publications/german-electricity-prices-on-epex-spot-2024/)
- [FfE EPEX SPOT 2025 Analysis](https://www.ffe.de/en/publications/german-electricity-prices-on-the-epex-spot-exchange-in-2025/)
- [PV Magazine — 457 hours of negative prices in 2024](https://www.pv-magazine.com/2025/01/06/germany-records-457-hours-of-negative-electricity-prices-in-2024/)
- [GridCog — Duck curve and price spreads in Europe](https://www.gridcog.com/blog/duck-curve-and-price-spreads-in-europe)
- [Timera Energy — Negative price growth in Germany](https://timera-energy.com/blog/strong-growth-in-negative-prices-a-german-case-study/)
- [Clean Energy Wire — Solar power in Germany](https://www.cleanenergywire.org/factsheets/solar-power-germany-output-business-perspectives)
- [Rabobank — German BESS market revenue potential](https://www.rabobank.com/knowledge/d011485293-backup-power-for-europe-part-5-revenue-potential-in-the-german-bess-market)
- [Ascend Analytics — CAISO negative price outlook](https://www.ascendanalytics.com/blog/caiso-market-outlook-persistent-negative-energy-prices-spreading-curtailment)
- [Fortune / Clean Energy Wire — Dunkelflaute Dec 2024](https://fortune.com/europe/2024/12/12/weather-phenomenon-dunkelflaute-germany-energy-prices/)
- [Bundeskartellamt — Price spike investigation](https://www.bundeskartellamt.de/SharedDocs/Meldung/EN/Pressemitteilungen/2025/10_21_2025_Preisspitzen.html)
- [Fraunhofer ISE energy-charts API](https://api.energy-charts.info/) — Hourly EPEX SPOT day-ahead prices (CC BY 4.0, from BNetzA/SMARD)
- [GEM Energy Analytics — The duck is growing](https://gemenergyanalytics.substack.com/p/the-duck-is-growing)
- [SMARD — The electricity market in 2025](https://www.smard.de/page/en/topic-article/217400/219038/record-high-for-solar-generation-in-each-quarter)

---

## German Solar Capacity (GW installed)

| Year | Capacity (GW) | Source |
|------|---------------|--------|
| 2015 | 39 | Clean Energy Wire |
| 2016 | 41 | IEA / BNetzA |
| 2017 | 42 | IEA / BNetzA |
| 2018 | 45 | Clean Energy Wire |
| 2019 | 49 | BNetzA (+3.94 GW in 2019) |
| 2020 | 54 | BNetzA (+4.9 GW in 2020) |
| 2021 | 59 | Clean Energy Wire |
| 2022 | 66 | PV Magazine (+7.19 GW in 2022) |
| 2023 | 82 | Clean Energy Wire (+14.1 GW in 2023) |
| 2024 | 100 | PV Magazine (+16.2 GW in 2024) |
| 2025 | 106 (AC) / 117 (DC) | BNetzA 106.2 GW AC; Fraunhofer ISE 116.8 GW DC module capacity |
| 2030 | 215 (target) | German government EEG target |

**Peak solar feed-in record:** 50.4 GW on June 20, 2025 (12:45-13:00 CEST). Source: Fraunhofer ISE / Clean Energy Wire.

---

## Negative Price Hours per Year (EPEX SPOT Day-Ahead, Germany)

| Year | Neg. Price Hours | Notes |
|------|-----------------|-------|
| 2008 | 15 | First negative prices ever on EPEX |
| 2012 | ~56 | Market premium scheme introduced |
| 2014 | 64 | Agora Energiewende |
| 2015 | 126 | Nearly doubled from 64 in 2014 |
| 2016 | 97 | SMARD |
| 2017 | 146 | SMARD |
| 2018 | 134 | SMARD |
| 2019 | 211 | SMARD |
| 2020 | 298 | SMARD; COVID demand drop amplified effect |
| 2021 | 139 | SMARD; energy crisis onset suppressed negatives |
| 2022 | 69 | SMARD; energy crisis pulled all prices up |
| 2023 | 301 | SMARD; gas prices normalized, solar boom resumed |
| 2024 | 457 | SMARD / PV Magazine; 17.5 GW of new solar added |
| 2025 | 575 | FfE full-year confirmed; H1 was 389 |

Sources: SMARD (Bundesnetzagentur), PV Magazine, FfE, Vattenfall, Agora Energiewende

---

## EPEX SPOT Price Records (Germany)

### Negative Price Extremes
| Event | Price (EUR/MWh) | Source |
|-------|----------------|--------|
| May 11, 2025 (1-2pm) | -250.32 | FfE 2025 |
| Typical sunny weekend 2024 | -20 to -80 | GridCog |
| EPEX SPOT exchange floor | -500 | Exchange rules |

### Positive Price Extremes (Evening/Scarcity)
| Event | Price (EUR/MWh) | Source |
|-------|----------------|--------|
| Dec 12, 2024 Dunkelflaute (5-6pm) | 936.28 | SMARD / Bundeskartellamt |
| Dec 12, 2024 intraday | ~1,000 | Clean Energy Wire |
| Jan 20, 2025 Dunkelflaute (5-6pm) | 583.40 | SMARD |
| Jan 7, 2025 continuous intraday | 1,056 | FfE 2025 |
| Jul 1, 2025 (8-9pm) | 476.19 | SMARD Q3 2025 report |
| Feb 2025 Dunkelflaute | >900 | FfE 2025 |
| Jun 26, 2024 (exchange outage) | 2,325 | FfE 2024 (technical outlier) |

### Annual Averages & Peak/Base Ratios
| Year | Base (EUR/MWh) | Peak (EUR/MWh) | Off-peak (EUR/MWh) | Peak/Base Ratio | Source |
|------|---------------|---------------|--------------------|-----------------:|--------|
| 2023 | 95.18 | 106.2 | 89.1 | 1.12 | FfE / BNetzA |
| 2024 | 78.51 | 88.2 | 74.8 | 1.11 | FfE / BNetzA |
| 2025 | 89.32 | 92.3 | 87.7 | 1.03 | FfE / BNetzA |

Peak = Mon-Fri 8am-8pm. The declining peak/base ratio (1.12 -> 1.03) reflects solar depressing
daytime prices within the "peak" window, NOT lower evening prices. Gas: TTF 41 (2023), 34.8 (2024), 37.2 (2025) EUR/MWh.

---

## Evening Peak Prices by Year (API-Verified)

Queried from Fraunhofer ISE energy-charts API (CC BY 4.0, from BNetzA/SMARD).
Bidding zone DE-AT-LU for 2015/2018, DE-LU from 2019 onward.
Period: June-August day-ahead hourly averages. Times in CEST.

| Year | 12-14h avg | 19h avg | 18-20h avg | Spread (19h-midday) | Summer avg | Solar GW | Source |
|------|-----------|---------|-----------|--------------------:|-----------|----------|--------|
| 2015 | 30.2 | **41.1** | 39.9 | 10.9 | 32.3 | 39 | API |
| 2016 | 25.0 | **34.1** | 33.2 | 9.1 | 27.4 | 41 | API |
| 2017 | ~28 | **~38** | ~37 | ~10 | ~31 | 42 | est. |
| 2018 | 46.2 | **58.9** | 57.7 | 12.7 | 49.5 | 45 | API |
| 2019 | 30.2 | **49.9** | 47.7 | 19.7 | 36.4 | 49 | API |
| 2020 | 24.9 | **41.5** | 39.8 | 16.5 | 30.4 | 54 | API |
| 2021 | 67.7 | **101.1** | 98.3 | 33.4 | 79.5 | 59 | API |
| 2022 | 248.9 | **440.1** | 425.7 | 191.2 | 334.2 | 66 | API |
| 2023 | 49.3 | **128.3** | 123.4 | 79.0 | 88.8 | 82 | API |
| 2024 | 20.6 | **123.8** | 121.4 | 103.3 | 74.2 | 100 | API |
| 2025 | 16.1 | **119.6** | 117.9 | 103.5 | 76.4 | 106 | API |

Note: 2017 marked "est." — energy-charts API has no data for 2017 (licensing gap).
Estimated from 2017 annual avg ~34 EUR/MWh and neighboring year ratios (2016: 1.24x, 2018: 1.19x).

Key observations:
- **Evening prices plateau** at 120-128 EUR/MWh from 2023-2025 (driven by gas+CO2 cost floor)
- **Midday prices collapsed** from 67.7 (2021) to 16.1 (2025) as solar capacity doubled
- **The spread is the real story**: 10.9 -> 103.5 EUR/MWh (10x increase in 10 years)
- **2022 was the energy crisis outlier**: all prices massively elevated (TTF gas >100 EUR/MWh)
- 2021 was the energy crisis onset: elevated gas pushed all prices up including midday

API endpoint: `https://api.energy-charts.info/price?bzn=DE-LU&start=YYYY-06-01T00:00Z&end=YYYY-08-31T23:00Z`

---

## Typical Summer Day Price Profile (Germany)

### 2024 typical summer day
| Time | Price (EUR/MWh) | Notes |
|------|----------------|-------|
| 06:00 | 65-80 | Morning ramp |
| 12:00-14:00 | 20-30 avg, negative on sunny days | Solar belly (API avg: 20.6) |
| 15:00 | 35-50 | Solar declining |
| 18:00-20:00 | 120-150 | Evening peak (API avg: 121.4) |
| Extreme sunny midday | -50 to -80 | Common on weekends/holidays |

### 2025 typical summer day
| Time | Price (EUR/MWh) | Notes |
|------|----------------|-------|
| 06:00 | 65-85 | Morning ramp |
| 12:00-14:00 | 10-25 avg, frequently negative | Solar belly deeper (API avg: 16.1) |
| 15:00 | 30-50 | Solar declining |
| 18:00-20:00 | 115-140 | Evening peak (API avg: 117.9) |
| Extreme sunny midday | -50 to -250 | Record -250.32 on May 11 |

Average daily spread (2024): **33.5 EUR/MWh** std dev (FfE).
Average daily spread (2025): **130.4 EUR/MWh** min-to-max (FfE), **36.9 EUR/MWh** std dev.

Solar season (Apr-Sep) price characteristics (GEM Energy Analytics):
- Afternoon prices: ~1/3 of overall average
- Peak hour prices: ~175% of overall average

---

## Gas Peaker Marginal Costs (Germany 2024)

| Plant Type | Marginal Cost (EUR/MWh) | Notes |
|-----------|------------------------|-------|
| CCGT (combined cycle) | 80-120 | TTF gas ~34 EUR/MWh + CO2 ~45 EUR/tonne |
| OCGT (open cycle / peaker) | 150-250 | Lower efficiency, higher marginal cost |
| OCGT during energy crisis (Aug 2022) | >600 | FfE analysis |

---

## VPP Arbitrage Opportunity

- 2-hour battery day-ahead arbitrage in Germany (Jul-Aug 2024): **274 EUR/MWh per cycle** (Rabobank)
- Charging at -50 EUR/MWh + discharging at +150 EUR/MWh = **200 EUR/MWh spread**
- 575 negative price hours in 2025 (up from 457 in 2024) and growing
- By 2030 with 215 GW solar, negative price hours could exceed 1,000/year

---

## CAISO (California) Comparison

| Metric | 2023 | 2024 | Source |
|--------|------|------|--------|
| Negative price hours | ~530 (6%) | ~1,180 (13%) | Ascend Analytics |
| Median negative price | -$10/MWh | -$17/MWh | Ascend Analytics |
| Solar capture rate (SP15) | — | <30% | Ascend Analytics |
| Midday net demand reduction since 2020 | — | -45% | FactSet/CAISO |

---

## Price Model Used in Presentation

Calibrated to the above data, implemented in `DuckCurveChart.jsx`:

```
Net Demand (GW)  →  Price (EUR/MWh)
< -5 GW         →  -50 + (gw+5)*10     (deep negative, toward -500 floor)
-5 to 0 GW      →  gw * 10             (mild negative: -30 to 0)
0-25 GW          →  20 + gw*1.8         (baseload: 20-65)
25-45 GW         →  65 + (gw-25)*2      (mid-merit CCGT: 65-105)
45-55 GW         →  105 + (gw-45)*8     (OCGT ramp: 105-185)
>55 GW           →  185 + (gw-55)*20    (scarcity/peaker: 185+)
Floor: -500 EUR/MWh (EPEX SPOT exchange limit)
```

### Evening peak annotation in the visualization:

The chart previously computed evening peak prices from the `demandToPrice()` model,
which produced unrealistically high and flat values (~265-277 EUR/MWh across all years).
This was replaced with **real EPEX SPOT 19:00 CEST averages** (Jun-Aug) from
energy-charts.info / SMARD (see "Evening Peak Prices by Year" section above).

| Year | Evening (real EPEX SPOT 19h) | Source |
|------|----------------------------|--------|
| 2015 | **41 EUR/MWh** | energy-charts API |
| 2016 | **34 EUR/MWh** | energy-charts API |
| 2017 | **~38 EUR/MWh** | est. (API gap) |
| 2018 | **59 EUR/MWh** | energy-charts API |
| 2019 | **50 EUR/MWh** | energy-charts API |
| 2020 | **42 EUR/MWh** | energy-charts API |
| 2021 | **101 EUR/MWh** | energy-charts API |
| 2022 | **440 EUR/MWh** | energy-charts API (energy crisis) |
| 2023 | **128 EUR/MWh** | energy-charts API |
| 2024 | **124 EUR/MWh** | energy-charts API |
| 2025 | **120 EUR/MWh** | energy-charts API |
| 2030 | **~140 EUR/MWh** | Projection (gas price + steeper ramp) |

The 2030 projection of ~140 EUR/MWh assumes: continued gas dependency for evening ramp,
higher CO2 prices under EU ETS, steeper ramp stress from 215 GW solar, partially offset
by 30+ GW of expected battery storage capacity.

---

## Renewable Energy Curtailment in Germany (2015-2024)

### Methodology Note

Germany's reporting regime changed on **October 1, 2021** with Redispatch 2.0 (NABEG). Before: "Einspeisemanagement" (EinsMan) specifically tracked renewable/CHP curtailment. After: renewables integrated into broader Redispatch 2.0 framework. Numbers before and after are **not directly comparable**.

### Annual Curtailment Data

| Year | Curtailed (TWh) | Compensation (EUR M) | Avoidable CO2 (Mt) | Equiv. Homes (M) | Cumulative TWh | Cumulative EUR M | Cumulative CO2 (Mt) |
|------|----------------|---------------------|--------------------|--------------------|----------------|-----------------|---------------------|
| 2015 | 4.72 | 478 | 2.49 | 1.35 | 4.72 | 478 | 2.49 |
| 2016 | 3.74 | 373 | 1.96 | 1.07 | 8.46 | 851 | 4.45 |
| 2017 | 5.52 | 610 | 2.68 | 1.58 | 13.98 | 1,461 | 7.13 |
| 2018 | 5.40 | 635 | 2.53 | 1.54 | 19.38 | 2,096 | 9.66 |
| 2019 | 6.48 | 710 | 2.60 | 1.85 | 25.86 | 2,806 | 12.26 |
| 2020 | 6.15 | 761 | 2.25 | 1.76 | 32.01 | 3,567 | 14.51 |
| 2021 | 5.82 | 807 | 2.44 | 1.66 | 37.83 | 4,374 | 16.95 |
| 2022 | 8.06 | 900 | 3.50 | 2.30 | 45.89 | 5,274 | 20.45 |
| 2023 | 10.48 | 577 | 3.98 | 2.99 | 56.37 | 5,851 | 24.43 |
| 2024 | 9.34 | 554 | 3.39 | 2.67 | 65.71 | 6,405 | 27.82 |

### CO2 Emission Factors Used (Umweltbundesamt)

Average German grid emission factor by year (gCO2/kWh):
- 2015: 528 | 2016: 523 | 2017: 485 | 2018: 468 | 2019: 401
- 2020: 366 | 2021: 420 | 2022: 434 | 2023: 380 | 2024: 363

Note: These are **average** grid factors (conservative). Marginal factors (actual displaced plants, typically coal/gas) are ~600-800 gCO2/kWh, which would roughly double the CO2 estimates.

Source: [Umweltbundesamt CLIMATE CHANGE 13/2025](https://www.umweltbundesamt.de/sites/default/files/medien/11850/publikationen/13_2025_cc.pdf)

### Cumulative Totals (2015-2024)

| Metric | Total |
|--------|-------|
| Total energy curtailed | **65.7 TWh** |
| Total compensation paid (renewable only) | **EUR 6.4 billion** |
| CO2 that could have been avoided (conservative) | **27.8 million tonnes** |
| CO2 that could have been avoided (marginal est.) | **~46 million tonnes** |
| Total congestion management costs (all measures) | **EUR 18+ billion** |

### Technology Breakdown (2024)

| Source | GWh Curtailed | Share |
|--------|-------------|-------|
| Offshore wind | 4,562 | 48.9% |
| Onshore wind | 3,384 | 36.2% |
| Solar | 1,389 | 14.9% |

Solar curtailment surged **97% YoY** in 2024. Bavaria alone: 986 GWh.

### Curtailment Research Sources

- [Bundesnetzagentur / SMARD congestion data](https://www.smard.de/page/home/topic-article/444/216636/volumen-und-kosten-gesunken)
- [Next Kraftwerke EinsMan guide (2013-2021)](https://www.next-kraftwerke.de/wissen/einspeisemanagement)
- [BNetzA Monitoring Report 2023 (EN)](https://data.bundesnetzagentur.de/Bundesnetzagentur/SharedDocs/Downloads/EN/Areas/ElectricityGas/CollectionCompanySpecificData/Monitoring/MonitoringReport2023.pdf)
- [BNetzA Monitoring Report 2025 (DE)](https://data.bundesnetzagentur.de/Bundesnetzagentur/SharedDocs/Mediathek/Monitoringberichte/MonitoringberichtEnergie2025.pdf)
- [Clean Energy Wire — Curtailment 2023](https://www.cleanenergywire.org/news/curtailing-renewable-power-increases-germany-2023-re-dispatch-costs-recede)
- [Strategic Energy Europe — Solar curtailment 2024](https://strategicenergy.eu/solar-curtailment-germany/)
- [PV Magazine — Solar curtailment +97%](https://www.pv-magazine.com/2025/04/03/pv-curtailment-jumps-97-in-germany-in-2024/)
- [Umweltbundesamt CO2 factors](https://www.umweltbundesamt.de/en/press/pressinformation/co2-emissions-per-kilowatt-hour-of-electricity-in)
- [Energie-Chronik — Total congestion costs](https://www.energie-chronik.de/231009.htm)
