# Grid Flexibility Economics: Old World Costs vs. Battery Storage Alternatives

> **Research document for KubeCon 2026 VPP presentation**
> Last updated: March 2026

---

## 1. The Cost of the Old Playbook

### 1.1 Peaker Plants

#### Scale of the Problem

The US maintains a staggering fleet of peaker plants that sit idle most of the time:

- **999 peaker plants** in the US as of 2021 (GAO analysis of EPA data) ([GAO-24-106145](https://www.gao.gov/products/gao-24-106145))
- Peakers account for **19% of total designed full-load sustained output** (nameplate capacity) for all US power plants, yet generate only **3.1% of annual net electricity** ([GAO-24-106145](https://www.gao.gov/products/gao-24-106145))
- Average capacity factor of just **6.6%** in 2020 ([Sandia National Labs, Issue Brief 2020](https://www.sandia.gov/app/uploads/sites/163/2022/04/Issue-Brief-2020-11-Peaker-Plants.pdf))
- Plants typically run **less than 1,500 hours per year**, with some operating as few as **250 hours per year** ([Wikipedia: Peaking power plant](https://en.wikipedia.org/wiki/Peaking_power_plant))

That means roughly one-fifth of America's entire power generation capacity exists to serve roughly 3% of demand. The rest of the time, these assets sit idle, depreciating, and costing ratepayers money.

#### Cost per MWh

Peaker plants are among the most expensive forms of electricity generation:

- **Lazard LCOE (2024, v17):** Gas peaking facilities cost **$110-$228/MWh** ([Lazard LCOE+ June 2024](https://www.lazard.com/media/xemfey0k/lazards-lcoeplus-june-2024-_vf.pdf))
- **Lazard LCOE (2025, v18):** Gas peaking facilities cost **$149-$251/MWh** ([Lazard LCOE+ June 2025](https://www.lazard.com/media/eijnqja3/lazards-lcoeplus-june-2025.pdf))
- For comparison, combined-cycle gas turbines (baseload) cost **$102/MWh** in 2025 -- already an all-time high driven by data center demand ([BloombergNEF 2025](https://about.bnef.com/insights/clean-energy/battery-storage-costs-hit-record-lows-as-costs-of-other-clean-power-technologies-increased-bloombergnef/))
- Peakers running at 10% utilization have an LCOE around **$200/MWh** ([Thunder Said Energy](https://thundersaidenergy.com/downloads/gas-peaker-plants-the-economics/))

#### Capital Costs

- Open cycle gas turbine (OCGT) capex: **$650-$1,000/kW** ([NextG Power](https://nextgpower.com/bess-vs-gas-peaker-plants-why-2026-is-the-economic-technical-tipping-point-for-grid-storage/))
- UK gas reciprocating engines: capex **250-450 GBP/kW**, with 3.5 GW successful in UK capacity auctions ([Timera Energy](https://timera-energy.com/blog/investment-in-uk-peaking-assets/))
- UK capacity market prices at **65 GBP/kW/year** as a major incentive for new gas engines ([Timera Energy](https://timera-energy.com/blog/investment-in-uk-peaking-assets/))

#### NYC Peaker Plants -- A Case Study in Waste

New York City has the **densest concentration of urban power plants in the US**, impacting the health of **750,000 New Yorkers**:

- Over a decade, New Yorkers paid approximately **$4.5 billion** for mostly idle peaker capacity, including capacity payments ([Clean Energy Group](https://www.cleanegroup.org/initiatives/phase-out-peakers/))
- **700 MW** of the city's peaking capacity has been fully retired, with plans for an additional **3,300 MW** to retire before 2040 -- representing nearly two-thirds of the city's fossil peaking capacity ([Energy-Storage.News](https://www.energy-storage.news/new-york-citys-most-polluting-fossil-fuel-plants-can-retire-by-2030-thanks-to-renewables-storage/))
- Two of the dirtiest peaker plants (Gowanus and Narrows) originally slated for 2025 closure had shutdowns **postponed to July 2026** ([NYC EJA](https://nyc-eja.org/campaigns/just-transitions-energy/))
- Replacement pathway identified: **5.6 GW rooftop solar, 3 GW offshore wind, 5,400 GWh energy efficiency, and 4,200 MW energy storage** could fulfil the entire fleet's role by 2030 ([Energy-Storage.News](https://www.energy-storage.news/new-york-citys-most-polluting-fossil-fuel-plants-can-retire-by-2030-thanks-to-renewables-storage/))

#### UK Peaker Market

- Gas reciprocating engine capacity has grown rapidly in the UK over 5 years, dominating flexible capacity build ([Timera Energy](https://timera-energy.com/blog/investment-in-uk-peaking-assets/))
- More than any other European market, the UK is dependent on gas engine capacity ([Timera Energy](https://timera-energy.com/blog/investment-in-uk-peaking-assets/))
- Gas engines have key advantages: lower capex/opex, fast ramp rates, low start costs -- but they remain fossil-fuel dependent ([Clarke Energy](https://clarke-energy.com/applications/peaking-station-peak-lopping-plants))

---

### 1.2 Spinning Reserves

Spinning reserves are generators kept online, synchronized with the grid, burning fuel but producing nothing -- just waiting to ramp up if something goes wrong.

#### How It Works

- Generators must be synchronized with the grid, able to respond within **10 minutes**, and able to run for extended periods ([Argonne National Lab](https://publications.anl.gov/anlpubs/2016/01/124217.pdf))
- The standard over-provisioning margin is typically **~15%** above expected peak demand
- Running power plants below their optimal operating point to provide spinning reserves causes **systemic inefficiency** and increases costs by requiring more plants to be online than needed for actual demand ([Energy Central](https://energycentral.com/c/gr/spinning-reserve-displacement-batteries-saving-fuel-reducing-emissions-lowering))

#### Costs

- The US ancillary services market (including spinning reserves, frequency regulation, and operating reserves) is valued at approximately **$8.7 billion** in 2024, projected to reach **$11.5 billion by 2033** ([Spherical Insights](https://www.sphericalinsights.com/reports/united-states-power-ancillary-service-market))
- The European ancillary services market was valued at approximately **$30 billion** in 2024 ([Reports and Data / Market Research Future](https://www.marketresearchfuture.com/reports/europe-ancillary-services-market-16153))
- Spain alone spent **EUR 2.67 billion** on ancillary services in 2024 ([Red Electrica](https://www.sistemaelectrico-ree.es/en/spanish-electricity-system/markets/ancillary-services))
- Regulation (continuous rapid frequency control) commands prices up to **10x the price of spinning reserve** ([Argonne National Lab](https://publications.anl.gov/anlpubs/2016/01/124217.pdf))

#### The Waste Factor

- Generators compensated for spinning reserves use fuel to maintain "hot standby" -- spinning and ready but producing no useful electricity ([Energy Central](https://energycentral.com/c/gr/spinning-reserve-displacement-batteries-saving-fuel-reducing-emissions-lowering))
- Adding a **1 MW battery** allows an increase in average generator loading by **10%**, which increases overall system efficiency and reduces annual fuel consumption by **1%** ([Energy Central](https://energycentral.com/c/gr/spinning-reserve-displacement-batteries-saving-fuel-reducing-emissions-lowering))
- Battery storage systems can provide spinning reserve services with **100ms response times** vs. **6,000ms for conventional generators** -- 60x faster ([Hornsdale Power Reserve data](https://hornsdalepowerreserve.com.au/))

---

### 1.3 Grid Congestion / Redispatch

Grid congestion occurs when the transmission network cannot physically deliver power from where it is generated to where it is needed. The "fix" -- redispatch -- means ordering expensive generators on one side of a bottleneck to ramp up while paying cheap generators on the other side to ramp down. Everyone loses.

#### EU-Wide Congestion Costs

- **EUR 4.2 billion** total cost of managing grid congestion in the EU in 2023 ([ACER Market Monitoring Report 2024](https://acer.europa.eu/monitoring/MMR/crosszonal_electricity_trade_capacities_2024))
- Remedial action volumes rose **14.5%** in 2023, reaching **57.28 TWh** including redispatching and countertrading ([ACER](https://acer.europa.eu/monitoring/MMR/crosszonal_electricity_trade_capacities_2024))
- Grid congestion **curtailed over 12 TWh** of renewable electricity in 2023, causing an additional **4.2 million tons of CO2 emissions** ([ACER via Montel News](https://montelnews.com/news/0c669a04-99cc-440a-80b5-4ea70ebdde05/eu-power-grid-congestion-cost-eur-4bn-in-2023-acer))

#### Germany: The Poster Child for Redispatch Costs

Germany's north-south grid bottleneck (wind in the north, demand in the south) creates enormous costs:

- **2023:** Redispatch costs totaled **EUR 3.13 billion**, down from EUR 4.2 billion in 2022 (due to lower energy prices, not less congestion) ([Clean Energy Wire](https://www.cleanenergywire.org/news/curtailing-renewable-power-increases-germany-2023-re-dispatch-costs-recede))
- **2024:** Total grid congestion management costs fell to **EUR 2.776 billion**, a 17% drop from 2023 ([Clean Energy Wire](https://www.cleanenergywire.org/news/germanys-needs-and-costs-grid-management-down-2024-network-agency))
- **Curtailment payments:** EUR 554 million in 2024, just 4% less than the previous year ([Strategic Energy Europe](https://strategicenergy.eu/solar-curtailment-germany/))
- **Fixed and activation costs** rose to **EUR 1.028 billion** in 2024, nearly doubling from 2023 ([Clean Energy Wire](https://www.cleanenergywire.org/news/germanys-needs-and-costs-grid-management-down-2024-network-agency))
- Redispatch costs **more than doubled since 2019** and averaged **EUR 6.8/MWh** of net electricity consumption in 2023 ([Agora Energiewende](https://www.agora-energiewende.org/publications/local-electricity-prices-in-germany))
- Germany's remedial action volume as percentage of national demand: **6.7%** in 2023 ([ACER](https://acer.europa.eu/monitoring/MMR/crosszonal_electricity_trade_capacities_2024))

#### Future Projections (JRC Study)

The European Commission's Joint Research Centre projects grid congestion costs could explode:

| Scenario | 2030 | 2040 |
|---|---|---|
| **Ambitious grid expansion** | EUR 11 billion | EUR 34 billion |
| **Business-as-usual** | EUR 26 billion | EUR 103 billion |

- Under business-as-usual, up to **310 TWh** of renewable energy could be curtailed by 2040 due to congestion -- equal to **half of EU wind and solar production in 2022** ([JRC Report](https://publications.jrc.ec.europa.eu/repository/bitstream/JRC137685/JRC137685_01.pdf))

---

### 1.4 Curtailment (Clean Energy Wasted)

Curtailment is the deliberate reduction of renewable energy output because the grid literally cannot absorb it. It represents clean energy generated at near-zero marginal cost being thrown away.

#### Germany: 9.3 TWh Curtailed in 2024

- **Total renewable curtailment in 2024: ~9.3 TWh** (solar 1,389 GWh + offshore wind 4,562 GWh + onshore wind 3,384 GWh) ([Bundesnetzagentur via Strategic Energy Europe](https://strategicenergy.eu/solar-curtailment-germany/))
- **Solar curtailment surged 97% year-over-year** to 1,389 GWh, driven by increased installed capacity and high solar radiation ([PV Magazine](https://www.pv-magazine.com/2025/04/03/pv-curtailment-jumps-97-in-germany-in-2024/))
- Offshore wind curtailment: 4,562 GWh (down 20%) ([Strategic Energy Europe](https://strategicenergy.eu/solar-curtailment-germany/))
- Onshore wind curtailment: 3,384 GWh (down 15%) ([Strategic Energy Europe](https://strategicenergy.eu/solar-curtailment-germany/))
- Curtailment across all renewables accounted for **3.5% of total generation** ([Clean Energy Wire](https://www.cleanenergywire.org/news/germanys-needs-and-costs-grid-management-down-2024-network-agency))
- Record curtailment in 2023: **10 TWh** ([Clean Energy Wire](https://www.cleanenergywire.org/news/curtailing-renewable-power-increases-germany-2023-re-dispatch-costs-recede))

#### California: 3.4 Million MWh Curtailed in 2024

- CAISO curtailed **3.4 million MWh** of utility-scale wind and solar output in 2024, a **29% increase** from 2023 ([EIA](https://www.eia.gov/todayinenergy/detail.php?id=65364))
- **Solar accounted for 93%** of all curtailed energy in CAISO in 2024 ([EIA](https://www.eia.gov/todayinenergy/detail.php?id=65364))
- California's wind and solar capacity grew from 9.7 GW in 2014 to **28.2 GW by end of 2024** -- curtailment is the symptom of growth outpacing flexibility ([EIA](https://www.eia.gov/todayinenergy/detail.php?id=65364))
- Battery capacity in CAISO grew **45% in 2024** (8.0 GW to 11.6 GW) and avoided 274,000 MWh of curtailment -- about 8% of what was curtailed ([EIA](https://www.eia.gov/todayinenergy/detail.php?id=65364))

#### EU-Wide Curtailment

- Over **12 TWh** of renewable electricity curtailed across the EU in 2023 ([ACER](https://acer.europa.eu/monitoring/MMR/crosszonal_electricity_trade_capacities_2024))
- German curtailment payments alone: **EUR 554 million** in 2024 ([Strategic Energy Europe](https://strategicenergy.eu/solar-curtailment-germany/))

#### Negative Price Hours -- The Canary in the Coal Mine

Negative prices mean the grid is literally paying generators to stop producing. They signal a system that cannot absorb its own clean energy:

| Market | 2022 | 2023 | 2024 |
|---|---|---|---|
| **Germany** | 69 hours | 301 hours | 475 hours |
| **Spain** | 0 hours (not allowed) | first year (2023) | 769 hours |
| **Finland** | n/a | n/a | ~700 hours (8% of year) |
| **Netherlands** | n/a | ~4% of hours | ~5% of hours |
| **Sweden** | n/a | ~5% of hours | ~7% of hours |

- Across Europe, electricity prices fell into negative territory for **7,841 hours** during the first eight months of 2024 alone ([World Economic Forum](https://www.weforum.org/stories/2024/09/negative-energy-price-record-in-europe-and-other-top-energy-stories/))
- Germany quadrupled negative price hours from 69 (2022) to 301 (2023) to **475 (2024)** ([KYOS / Next Kraftwerke](https://www.next-kraftwerke.com/energy-blog/risky-solar-peaks-negative-power-market-prices))
- 2025 expected to significantly exceed 2024 figures ([EM-Power Europe](https://www.em-power.eu/press-release/negative-electricity-prices-2025))

These are not edge cases -- they are structural symptoms of a grid that lacks flexibility.

---

### 1.5 Crisis Costs (When It All Fails)

When the old playbook fails catastrophically, the costs are not measured in billions per year but in billions per day.

#### Texas 2021 (Winter Storm Uri) -- $47B+ in 5 Days

The most expensive grid failure in US history:

- Wholesale electricity prices hit the **$9,000/MWh cap** -- **180x the normal price** of ~$50/MWh ([Texas Comptroller](https://comptroller.texas.gov/economy/fiscal-notes/archive/2021/oct/winter-storm-reform.php))
- Prices held at or near the $9,000/MWh cap for approximately **77 hours** (Feb 15-19) ([Wikipedia: 2021 Texas power crisis](https://en.wikipedia.org/wiki/2021_Texas_power_crisis))
- Total Texas electricity costs on **February 16 alone reached $10.3 billion** -- greater than the $9.8 billion spent on electricity in all of 2020 ([Wikipedia: 2021 Texas power crisis](https://en.wikipedia.org/wiki/2021_Texas_power_crisis))
- Texans collectively paid roughly **$37.7 billion in electric bills** in the aftermath ([Texas Tribune / Courthouse News](https://www.courthousenews.com/at-texas-high-court-energy-companies-fight-colossal-bills-from-winter-storm-uri/))
- **$16 billion** in overcharges from ERCOT keeping prices at cap approximately **32 hours too long** after load shedding ended ([Texas Tribune](https://www.texastribune.org/2021/03/04/ercot-texas-electricity-16-billion/))
- Federal Reserve Bank of Dallas estimated total storm-related financial losses: **$80 billion to $130 billion** ([Dallas Fed](https://www.dallasfed.org/research/economics/2021/0415))
- Griddy Energy (wholesale-rate provider) passed costs directly to ~29,000 customers, who were charged **$29 million** total, with individual bills reaching **$5,000-$17,000** -- then filed for bankruptcy ([CNN](https://www.cnn.com/2021/03/15/us/griddy-texas-bankruptcy), [Texas Tribune](https://www.texastribune.org/2021/03/16/griddy-bankruptcy-electricity-bills/))
- Emergency load shedding reached **20,000 MW** -- the largest manually controlled load shedding event in US history ([FERC](https://www.ferc.gov/news-events/news/final-report-february-2021-freeze-underscores-winterization-recommendations))
- State created a **$2.1 billion securitization program** (HB 4492) to spread costs over up to **30 years** via small surcharges on ratepayer bills ([Texas Comptroller](https://comptroller.texas.gov/economy/fiscal-notes/archive/2021/oct/winter-storm-reform.php), [ElectricityPlans](https://electricityplans.com/market-securitization-charge-texas/))
- Gas utility customers face **16 years** of securitization charges ([ACSC](https://atmoscitiessteeringcommittee.org/texas-gas-utility-customers-face-16-years-of-charges-from-winter-storm-uri/))

**Presentation framing:** One state, five days, tens of billions of dollars. The wholesale market costs alone could have funded a continent-wide battery storage program.

#### South Australia 2016 Blackout

- State-wide blackout triggered by severe weather damaging transmission assets, followed by cascading wind farm disconnections and loss of the Heywood Interconnector ([AEMO Report](https://www.aemo.com.au/-/media/Files/Electricity/NEM/Market_Notices_and_Events/Power_System_Incident_Reports/2017/Integrated-Final-Report-SA-Black-System-28-September-2016.pdf))
- Estimated cost to businesses: **AUD $360+ million** ([Energy Magazine](https://www.energymagazine.com.au/black-system-or-black-swan-learnings-from-south-australias-infamous-2016-blackout-part-2/))
- BHP Billiton's electricity costs spiked **1,000%** to AUD $2.57 million for one day at Olympic Dam ([Wikipedia: 2016 South Australian blackout](https://en.wikipedia.org/wiki/2016_South_Australian_blackout))
- Nyrstar smelter downtime and repairs cost approximately **AUD $7 million** in profits ([Wikipedia: 2016 South Australian blackout](https://en.wikipedia.org/wiki/2016_South_Australian_blackout))
- Wholesale market in SA was **suspended for 13 days** ([Wikipedia: 2016 South Australian blackout](https://en.wikipedia.org/wiki/2016_South_Australian_blackout))
- Most supplies restored in 8 hours, but the lasting damage: a shadow of doubt over the reliability of high-renewable grids -- which directly led to the Hornsdale "Tesla Big Battery" deployment ([Energy Magazine](https://www.energymagazine.com.au/black-system-or-black-swan-learnings-from-south-australias-infamous-2016-blackout-part-2/))

#### Spain/Portugal 2025 Blackout (April 28, 2025)

- **56+ million people** across the Iberian Peninsula lost power for up to **10+ hours** ([Wikipedia: 2025 Iberian Peninsula blackout](https://en.wikipedia.org/wiki/2025_Iberian_Peninsula_blackout))
- CEOE (Spanish employers' organization) estimated economic losses at **EUR 1.6 billion** ([Euronews](https://www.euronews.com/business/2025/04/28/how-spain-and-portugals-economies-could-be-hit-by-the-blackout))
- Broader estimates range from **EUR 2 billion to EUR 5 billion** in economic losses ([Teneo](https://www.teneo.com/insights/articles/spanish-lessons-in-the-dark-implications-of-the-iberian-outage-for-energy-planners-and-investors/))
- Meat industry alone estimated losses of up to **EUR 190 million** as refrigeration failed ([Insurance Journal](https://www.insurancejournal.com/news/international/2025/04/30/821937.htm))
- 30,000+ business travelers affected daily ([Euronews](https://www.euronews.com/business/2025/04/28/how-spain-and-portugals-economies-could-be-hit-by-the-blackout))
- **9 fatalities** ([Wikipedia: 2025 Iberian Peninsula blackout](https://en.wikipedia.org/wiki/2025_Iberian_Peninsula_blackout))
- Highlighted structural vulnerabilities in handling high renewable energy penetration ([WEF](https://www.weforum.org/stories/2025/05/resilient-energy-grid-iberian-power-outage/))

#### Italy 2003 Blackout

- **56 million people** lost power for up to 12 hours on September 28, 2003 ([Wikipedia: 2003 Italy blackout](https://en.wikipedia.org/wiki/2003_Italy_blackout))
- Direct economic losses estimated at **EUR 640 million** based on value of lost load ([ResearchGate](https://www.researchgate.net/publication/224686365_Overview_of_the_events_and_causes_of_the_2003_Italian_blackout))
- Total damages including household impacts: approximately **EUR 1.18 billion** (0.083% of Italy's GDP) ([ResearchGate / FIRSTonline](https://www.firstonline.info/en/accadde-oggi-28-settembre-2003-il-blackout-che-oscuro-litalia-ecco-la-storia-di-un-giorno-incredibile/))
- 110 trains canceled, 30,000+ passengers stranded ([Wikipedia: 2003 Italy blackout](https://en.wikipedia.org/wiki/2003_Italy_blackout))

---

## 2. The Battery Storage Alternative

### 2.1 Current Costs

The economics of batteries have crossed the tipping point.

#### Battery LCOE vs. Gas Peakers

| Technology | LCOE (2025) | Trend |
|---|---|---|
| **4-hour battery storage** | **$78/MWh** (global benchmark) | Record low, down 27% YoY |
| **Combined-cycle gas turbine** | **$102/MWh** | All-time high, up 16% YoY |
| **Gas peaker (simple cycle)** | **$149-$251/MWh** (Lazard 2025) | Rising due to turbine demand |

- The global benchmark LCOE for a four-hour battery project fell **27% year-on-year to $78/MWh** in 2025 -- a record low since BNEF began tracking costs in 2009 ([BloombergNEF](https://about.bnef.com/insights/clean-energy/battery-storage-costs-hit-record-lows-as-costs-of-other-clean-power-technologies-increased-bloombergnef/))
- At the start of the decade, the same benchmark was **over $180/MWh** ([BloombergNEF](https://about.bnef.com/insights/clean-energy/battery-storage-costs-hit-record-lows-as-costs-of-other-clean-power-technologies-increased-bloombergnef/))
- Gas turbine costs have **doubled in the US in just two years** due to data center demand ([BloombergNEF](https://about.bnef.com/insights/clean-energy/global-cost-of-renewables-to-continue-falling-in-2025-as-china-extends-manufacturing-lead-bloombergnef/))

#### Battery Pack Price Decline

- Lithium-ion battery pack prices have fallen **93% since 2010** ([BloombergNEF 2025 Battery Price Survey](https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/))
- Over three decades, the decline is **97%** ([Our World in Data](https://ourworldindata.org/battery-price-decline))
- Average pack price in 2025: **$108/kWh** (down 8% from 2024 despite rising metal prices) ([BloombergNEF](https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/))
- **Stationary storage systems** dropped to **$70/kWh** in 2025 -- a 45% decline from 2024 and the lowest-priced segment for the first time ([BloombergNEF via ESS-News](https://www.ess-news.com/2025/12/09/bnef-lithium-ion-battery-pack-prices-fall-to-108-kwh-stationary-storage-becomes-lowest-price-segment/))
- EV battery cell-only prices: **$79/kWh**, below the $100/kWh threshold for second year running ([BloombergNEF](https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/))

#### Installed System Costs

- Utility-scale BESS installed costs in 2024: approximately **$300-$480/kWh** depending on duration and geography ([NREL ATB 2024](https://atb.nrel.gov/electricity/2024/utility-scale_battery_storage))
- NREL projects BESS costs could fall **32-47%** by 2030 in mid-to-low scenarios ([Energy-Storage.News / NREL](https://www.energy-storage.news/li-ion-bess-costs-could-fall-47-by-2030-nrel-says-in-long-term-forecast-update/))
- Cost declines driven by: cell manufacturing overcapacity, intense competition, shift to lower-cost LFP batteries ([BloombergNEF](https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/))

---

### 2.2 Investment Required

#### Global Scale

- IEA Net Zero Emissions Scenario: Battery investment must reach **USD $800 billion by 2030**, up **400%** relative to 2023 ([IEA World Energy Investment 2025](https://www.iea.org/reports/world-energy-investment-2025/executive-summary))
- Global energy storage capacity must increase **sixfold to 1,500 GW** by 2030 to support tripling renewables ([IEA](https://www.iea.org/reports/batteries-and-secure-energy-transitions/executive-summary))
- Batteries account for **90% of the increase** in storage in the NZE scenario, rising **14-fold to 1,200 GW** by 2030 ([IEA](https://www.iea.org/reports/batteries-and-secure-energy-transitions/executive-summary))

#### European Union

- EU needs approximately **200 GW** of energy storage power capacity by 2030 ([SolarPower Europe](https://www.solarpowereurope.org/press-releases/new-report-eu-installs-27-1-g-wh-of-new-batteries-in-2025-as-utility-scale-storage-drives-record-growth))
- EU needs approximately **750 GWh** of battery storage energy capacity by 2030 ([SolarPower Europe](https://www.solarpowereurope.org/press-releases/new-report-eu-installs-27-1-g-wh-of-new-batteries-in-2025-as-utility-scale-storage-drives-record-growth))
- Long-term target: **~600 GW by 2050** ([EASE Energy Storage Targets Report](https://ease-storage.eu/wp-content/uploads/2022/06/Energy-Storage-Targets-2030-and-2050-Full-Report.pdf))
- Current installed fleet: **77.3 GWh** (end of 2025) -- needs another **10x increase** to reach 750 GWh by 2030 ([SolarPower Europe](https://www.solarpowereurope.org/press-releases/new-report-eu-installs-27-1-g-wh-of-new-batteries-in-2025-as-utility-scale-storage-drives-record-growth))

#### United States

- DOE projects the US grid may need **225-460 GW** of long-duration energy storage by 2050, requiring **$330 billion** in capital ([DOE LDES Liftoff Report](https://liftoff.energy.gov/long-duration-energy-storage/))
- Net-zero pathways deploying LDES result in **$10-20 billion in annualized savings** in operating costs and avoided capital expenditures vs. pathways without LDES ([DOE LDES Liftoff Report](https://liftoff.energy.gov/long-duration-energy-storage/))

#### Australia

- AEMO's 2024 Integrated System Plan: Australia's NEM needs **49 GW / 646 GWh** of dispatchable storage by 2050 ([Energy-Storage.News](https://www.energy-storage.news/aemo-says-australias-nem-will-need-49gw-646gwh-of-dispatchable-storage-by-2050/))
- Net consumer benefit of the ISP pathway: **AUD $22 billion** in reduced infrastructure and operating costs ([AEMO Draft 2026 ISP](https://www.aemo.com.au/-/media/files/major-publications/isp/draft-2026/draft-2026-integrated-system-plan.pdf))
- Home batteries save **$4.1 billion** in avoided grid-scale investment if well-coordinated ([AEMO ISP](https://www.aemo.com.au/-/media/files/major-publications/isp/2024/2024-integrated-system-plan-isp.pdf))

---

### 2.3 Proof Points

#### Hornsdale Power Reserve ("Tesla Big Battery") -- The Original Proof

The South Australia blackout of 2016 directly led to the world's most famous battery installation:

- **150 MW / 193.5 MWh** (later expanded) ([Hornsdale Power Reserve](https://hornsdalepowerreserve.com.au/))
- Saved South Australian consumers over **AUD $150 million** in its first two years of operation ([Tesmanian](https://www.tesmanian.com/blogs/tesmanian-blog/tesla-big-battery-hornsdale-roi-2-two-years))
- Ancillary services costs reduced by **91%**: from **$470/MWh to $40/MWh** ([PV Magazine](https://www.pv-magazine.com/2018/12/05/south-australias-tesla-big-battery-saves-40-million-in-grid-stabilization-costs/))
- Response time: **100 milliseconds** vs. **6,000 milliseconds** for conventional generators -- **60x faster** ([Hornsdale Power Reserve](https://hornsdalepowerreserve.com.au/))
- Cost to build: approximately **AUD $89 million** -- paid back in under 2 years ([Solar Quotes](https://www.solarquotes.com.au/blog/tesla-big-battery-first-year/))

#### EU Battery Storage Growth

- EU installed **27.1 GWh** of new battery storage capacity in 2025 -- a new annual record ([SolarPower Europe](https://www.solarpowereurope.org/press-releases/new-report-eu-installs-27-1-g-wh-of-new-batteries-in-2025-as-utility-scale-storage-drives-record-growth))
- This marks **45% year-on-year growth** and the EU's **12th consecutive record year** ([SolarPower Europe](https://www.solarpowereurope.org/press-releases/new-report-eu-installs-27-1-g-wh-of-new-batteries-in-2025-as-utility-scale-storage-drives-record-growth))
- EU battery fleet has expanded **tenfold since 2021** (7.8 GWh to 77.3 GWh) ([SolarPower Europe](https://www.solarpowereurope.org/press-releases/new-report-eu-installs-27-1-g-wh-of-new-batteries-in-2025-as-utility-scale-storage-drives-record-growth))
- **Utility-scale systems** now deliver **55% of all new capacity** (2025), marking a structural market shift ([SolarPower Europe](https://www.solarpowereurope.org/press-releases/new-report-eu-installs-27-1-g-wh-of-new-batteries-in-2025-as-utility-scale-storage-drives-record-growth))
- California battery capacity grew **45% in one year** (8.0 GW to 11.6 GW in 2024), already avoiding 274,000 MWh of curtailment ([EIA](https://www.eia.gov/todayinenergy/detail.php?id=65364))

---

### 2.4 The Killer Comparisons

These are the numbers that belong on slides:

#### Texas vs. EU Battery Buildout

> **Texas spent $37.7+ billion in electric bills from 5 days of grid failure.** The entire EU battery storage fleet to date (77.3 GWh) was built for a fraction of that. Two Texas-sized crises would fund the EU's entire 750 GWh 2030 target.

#### Germany Redispatch vs. Storage Investment

> **Germany spends EUR 2.8-3.1 billion/year on redispatch.** At current battery prices (~$70/kWh for stationary storage), that annual spend could fund approximately **40-44 GWh** of new storage capacity every single year -- just from the waste.

#### Peakers vs. Batteries -- The Crossover

> **Peaker plants: $149-$251/MWh** (Lazard 2025). **Batteries: $78/MWh** (BNEF 2025). The crossover already happened. Batteries are now **48-69% cheaper** than gas peakers on a levelized cost basis.

#### 10 Years of EU Grid Congestion

> At EUR ~4 billion/year, **a decade of EU grid congestion costs = EUR 40 billion.** The IEA estimates global storage investment needs $800B by 2030. The EU's share of that investment would be recovered multiple times over in avoided congestion costs alone.

#### Hornsdale ROI

> **AUD $89 million to build. AUD $150 million saved in 2 years.** The Hornsdale battery paid for itself in under 2 years while cutting ancillary service costs by 91%. Every grid should have this.

#### Speed Advantage

> **100ms vs. 6,000ms.** Batteries respond 60x faster than conventional spinning reserves. The physics of power electronics vs. spinning mass is not a contest.

---

## 3. The Demand-Side Flexibility Opportunity

### 3.1 Europe's EUR 71 Billion Opportunity

A comprehensive study by DNV, published by smartEn (Smart Energy Europe), quantified what happens when you unlock demand-side flexibility across the EU:

- **Annual consumer savings of EUR 71 billion** through optimized consumption patterns ([DNV/smartEn Report 2022](https://smarten.eu/wp-content/uploads/2022/10/SmartEN-DSF-benefits-2030-Report_DIGITAL-1.pdf))
- **10-40% reductions** in household electricity bills ([DNV/smartEn](https://smarten.eu/wp-content/uploads/2022/10/SmartEN-DSF-benefits-2030-Report_DIGITAL-1.pdf))
- **37.5 million tons of CO2 avoided annually** by 2030 -- equivalent to removing **8 million combustion-engine vehicles** from European roads ([DNV/smartEn](https://smarten.eu/wp-content/uploads/2022/10/SmartEN-DSF-benefits-2030-Report_DIGITAL-1.pdf))
- **15.5 TWh** of renewable curtailment avoided annually (61% of curtailment that would otherwise occur) ([DNV/smartEn](https://smarten.eu/wp-content/uploads/2022/10/SmartEN-DSF-benefits-2030-Report_DIGITAL-1.pdf))
- **EUR 11.1-29.1 billion** in deferred grid investments ([DNV/smartEn](https://smarten.eu/wp-content/uploads/2022/10/SmartEN-DSF-benefits-2030-Report_DIGITAL-1.pdf))
- **130-164 GW** of demand-side flexibility potential in Europe by 2030 ([Smart Energy Europe](https://www.smart-energy.com/industry-sectors/energy-grid-management/demand-side-flexibility-in-europe-130-164gw-by-2030/))

### 3.2 Virtual Power Plants as the Coordination Layer

VPPs aggregate distributed energy resources -- home batteries, EV chargers, smart thermostats, water heaters -- into a single controllable fleet that can respond to grid needs in real time.

- US DOE: Tripling VPP capacity to **80-160 GW by 2030** could save approximately **$10 billion annually** in grid costs ([DOE](https://www.energy.gov/edf/virtual-power-plants-projects))
- Deploying **60 GW of VPP capacity** nationwide could save ratepayers **$15-35 billion** in infrastructure costs over 10 years ([Pew Charitable Trusts](https://www.pew.org/en/research-and-analysis/articles/2025/12/22/virtual-power-plants-powering-the-grid-from-your-neighborhood))
- A VPP of residential thermostats, water heaters, EV chargers, and behind-the-meter batteries can provide peaking capacity at roughly **half the net cost** of alternatives ([RMI](https://rmi.org/clean-energy-101-virtual-power-plants/))
- VPP participants receive **$30-300+ per year** in direct payments or bill credits ([Tesla](https://www.tesla.com/learn/what-is-a-virtual-power-plant), [Palmetto](https://palmetto.com/climate/virtual-power-plant-guide-vpp))

### 3.3 Home Batteries and Avoided Grid Investment

- Australia's AEMO ISP: Home batteries, if well-coordinated, save **AUD $4.1 billion** in avoided costs for additional grid-scale investment ([AEMO 2024 ISP](https://www.aemo.com.au/-/media/files/major-publications/isp/2024/2024-integrated-system-plan-isp.pdf))
- AEMO sees a significant role for coordinated **consumer energy resources (CER)** including home batteries, solar panels, and EVs ([AEMO](https://www.aemo.com.au/-/media/files/major-publications/isp/2024/2024-integrated-system-plan-isp.pdf))
- VPPs help stabilize demand by using lower-cost solar and battery storage, saving an additional **$140 per household annually** ([Palmetto](https://palmetto.com/climate/virtual-power-plant-guide-vpp))

### 3.4 Household Bill Impact

- Comprehensive modeling demonstrates **10-40% reductions** in household electricity bills through demand-side flexibility ([DNV/smartEn](https://smarten.eu/wp-content/uploads/2022/10/SmartEN-DSF-benefits-2030-Report_DIGITAL-1.pdf))
- Large industrial consumers can save **millions of euros annually per facility** through strategic load shifting ([Solas Capital](https://www.solas.capital/demand-side-flexibility-europe/))
- McKinsey estimates an additional **EUR 8 billion annual opportunity** in unlocking Europe's energy flexibility ([McKinsey](https://www.mckinsey.com/industries/electric-power-and-natural-gas/our-insights/unlocking-europes-8-billion-euros-energy-flexibility-opportunity))

---

## Summary: The Numbers That Matter for Slides

### Old World Annual Costs (Just the Waste)
| Category | Annual Cost |
|---|---|
| EU grid congestion management | EUR 4.2 billion (2023) |
| Germany redispatch alone | EUR 2.8-3.1 billion |
| Germany curtailment payments | EUR 554 million |
| EU ancillary services market | ~EUR 30 billion |
| US ancillary services market | ~$8.7 billion |
| NYC peaker payments (over decade) | $4.5 billion |

### Crisis Events (One-Time Catastrophes)
| Event | Cost | Duration |
|---|---|---|
| Texas 2021 (Uri) | $37.7B+ electric bills, $80-130B total | 5 days |
| Spain/Portugal 2025 | EUR 1.6-5 billion | ~10 hours |
| Italy 2003 | EUR 640M-1.18 billion | 12 hours |
| South Australia 2016 | AUD $360+ million | 8-13 hours |

### Battery Storage Alternative
| Metric | Value |
|---|---|
| 4-hour battery LCOE (2025) | $78/MWh (record low) |
| Gas peaker LCOE (2025) | $149-251/MWh |
| Battery pack price decline since 2010 | 93% |
| Stationary storage pack price (2025) | $70/kWh |
| Hornsdale payback period | <2 years |
| Hornsdale ancillary cost reduction | 91% |
| Battery response time advantage | 60x faster |

### The Opportunity
| Metric | Value |
|---|---|
| EU demand-side flexibility opportunity | EUR 71 billion/year |
| CO2 avoidance (DSF by 2030) | 37.5 million tons/year |
| Household bill reduction potential | 10-40% |
| US VPP infrastructure savings | $15-35 billion over 10 years |
| Australia home battery avoided costs | AUD $4.1 billion |

---

## Source Index

### Government and Regulatory
- [GAO-24-106145: Information on Peak Demand Power Plants (2024)](https://www.gao.gov/products/gao-24-106145)
- [ACER Market Monitoring Report (2024)](https://acer.europa.eu/monitoring/MMR/crosszonal_electricity_trade_capacities_2024)
- [Bundesnetzagentur SMARD Portal](https://www.smard.de/page/en/topic-article/5892/215186)
- [Texas Comptroller: Winter Storm Uri 2021](https://comptroller.texas.gov/economy/fiscal-notes/archive/2021/oct/winter-storm-reform.php)
- [FERC: Final Report on February 2021 Freeze](https://www.ferc.gov/news-events/news/final-report-february-2021-freeze-underscores-winterization-recommendations)
- [US DOE: Long Duration Energy Storage Liftoff](https://liftoff.energy.gov/long-duration-energy-storage/)
- [US EIA: Solar and Wind Curtailments in California](https://www.eia.gov/todayinenergy/detail.php?id=65364)
- [AEMO 2024 Integrated System Plan](https://www.aemo.com.au/-/media/files/major-publications/isp/2024/2024-integrated-system-plan-isp.pdf)

### Research and Analysis
- [IEA: Batteries and Secure Energy Transitions](https://www.iea.org/reports/batteries-and-secure-energy-transitions/executive-summary)
- [IEA: World Energy Investment 2025](https://www.iea.org/reports/world-energy-investment-2025/executive-summary)
- [BloombergNEF: Battery Storage Costs Hit Record Lows (2025)](https://about.bnef.com/insights/clean-energy/battery-storage-costs-hit-record-lows-as-costs-of-other-clean-power-technologies-increased-bloombergnef/)
- [BloombergNEF: Battery Pack Prices Fall to $108/kWh (2025)](https://about.bnef.com/insights/clean-transport/lithium-ion-battery-pack-prices-fall-to-108-per-kilowatt-hour-despite-rising-metal-prices-bloombergnef/)
- [Lazard LCOE+ June 2024 (v17)](https://www.lazard.com/media/xemfey0k/lazards-lcoeplus-june-2024-_vf.pdf)
- [Lazard LCOE+ June 2025 (v18)](https://www.lazard.com/media/eijnqja3/lazards-lcoeplus-june-2025.pdf)
- [NREL ATB 2024: Utility-Scale Battery Storage](https://atb.nrel.gov/electricity/2024/utility-scale_battery_storage)
- [DNV/smartEn: Demand-Side Flexibility Benefits in the EU (2022)](https://smarten.eu/wp-content/uploads/2022/10/SmartEN-DSF-benefits-2030-Report_DIGITAL-1.pdf)
- [JRC: Future-Proofing European Power Market Redispatch](https://publications.jrc.ec.europa.eu/repository/bitstream/JRC137685/JRC137685_01.pdf)
- [Sandia National Labs: Peaker Plants Issue Brief](https://www.sandia.gov/app/uploads/sites/163/2022/04/Issue-Brief-2020-11-Peaker-Plants.pdf)
- [Dallas Fed: Cost of Texas 2021 Deep Freeze](https://www.dallasfed.org/research/economics/2021/0415)
- [Our World in Data: Battery Price Decline](https://ourworldindata.org/battery-price-decline)

### Industry
- [SolarPower Europe: EU Battery Storage Market Review 2025](https://www.solarpowereurope.org/press-releases/new-report-eu-installs-27-1-g-wh-of-new-batteries-in-2025-as-utility-scale-storage-drives-record-growth)
- [Hornsdale Power Reserve](https://hornsdalepowerreserve.com.au/)
- [Clean Energy Group: Phase Out Peakers](https://www.cleanegroup.org/initiatives/phase-out-peakers/)
- [Timera Energy: UK Peaker Investment](https://timera-energy.com/blog/investment-in-uk-peaking-assets/)
- [Thunder Said Energy: Gas Peaker Economics](https://thundersaidenergy.com/downloads/gas-peaker-plants-the-economics/)
- [McKinsey: Unlocking Europe's Energy Flexibility Opportunity](https://www.mckinsey.com/industries/electric-power-and-natural-gas/our-insights/unlocking-europes-8-billion-euros-energy-flexibility-opportunity)

### News and Media
- [Clean Energy Wire: Germany Grid Management 2024](https://www.cleanenergywire.org/news/germanys-needs-and-costs-grid-management-down-2024-network-agency)
- [Strategic Energy Europe: Solar Curtailment Germany](https://strategicenergy.eu/solar-curtailment-germany/)
- [Texas Tribune: ERCOT $16 Billion Overcharge](https://www.texastribune.org/2021/03/04/ercot-texas-electricity-16-billion/)
- [CNN: Griddy Bankruptcy](https://www.cnn.com/2021/03/15/us/griddy-texas-bankruptcy)
- [Euronews: Spain/Portugal Blackout Costs](https://www.euronews.com/business/2025/04/28/how-spain-and-portugals-economies-could-be-hit-by-the-blackout)
- [PV Magazine: Germany PV Curtailment 2024](https://www.pv-magazine.com/2025/04/03/pv-curtailment-jumps-97-in-germany-in-2024/)
- [World Economic Forum: Negative Energy Price Record](https://www.weforum.org/stories/2024/09/negative-energy-price-record-in-europe-and-other-top-energy-stories/)
