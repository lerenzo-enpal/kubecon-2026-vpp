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

---

## German Solar Capacity (GW installed)

| Year | Capacity (GW) | Source |
|------|---------------|--------|
| 2015 | 39 | Clean Energy Wire |
| 2018 | 45 | Clean Energy Wire |
| 2021 | 59 | Clean Energy Wire |
| 2023 | 82 | Clean Energy Wire |
| 2024 | ~100 | PV Magazine (17.5 GW added in 2024) |
| 2025 | 104 | FfE / Bundesnetzagentur |
| 2030 | 215 (target) | German government EEG target |

---

## Negative Price Hours per Year (EPEX SPOT Day-Ahead, Germany)

| Year | Neg. Price Hours | Notes |
|------|-----------------|-------|
| 2008 | 15 | First negative prices ever on EPEX |
| 2012 | ~56 | Market premium scheme introduced |
| 2015 | ~126 | Nearly doubled from 64 in 2014 |
| 2020 | ~298 | COVID demand drop amplified effect |
| 2022 | 69 | Energy crisis pulled all prices up |
| 2023 | 301 | Gas prices normalized, solar boom resumed |
| 2024 | 457 | Record — 17.5 GW of new solar added |
| 2025 H1 | 389 | On track for 700+ full year |

Sources: PV Magazine, FfE, Timera Energy, Vattenfall

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
| Dec 12, 2024 Dunkelflaute (5-6pm) | 936 | Bundeskartellamt |
| Dec 12, 2024 intraday | ~1,000 | Clean Energy Wire |
| Feb 2025 Dunkelflaute | >900 | FfE 2025 |
| Jun 26, 2024 (exchange outage) | 2,325 | FfE 2024 (technical outlier) |

### Averages (2024)
| Metric | Price (EUR/MWh) | Source |
|--------|----------------|--------|
| Annual average day-ahead | 78.51 | Bundesnetzagentur |
| Peak-load average (Mon-Fri 8am-8pm) | 88.2 | Bundesnetzagentur |
| Off-peak average | 74.8 | Bundesnetzagentur |
| 2025 annual average | 89.32 | Bundesnetzagentur |

---

## Typical Summer Day Price Profile (Germany 2024)

| Time | Price (EUR/MWh) | Notes |
|------|----------------|-------|
| 06:00 | 65-80 | Morning ramp |
| 12:00-14:00 | 20-30 avg, negative on sunny days | Solar belly |
| 15:00 | 35-50 | Solar declining |
| 18:00-20:00 | 120-150 | Evening peak, 175% of average |
| Extreme sunny midday | -50 to -80 | Common on weekends/holidays |

Average daily spread (2025): **130 EUR/MWh** between daily min and max.

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
- 457+ negative price hours per year and growing
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

### Resulting prices per year in the visualization:
| Year | Midday Low | Evening Peak |
|------|-----------|-------------|
| 2015 | 63 EUR/MWh | 277 EUR/MWh |
| 2023 | 28 EUR/MWh | 269 EUR/MWh |
| 2025 | -70 EUR/MWh | 265 EUR/MWh |
| 2030 | -345 EUR/MWh | 255 EUR/MWh |

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
