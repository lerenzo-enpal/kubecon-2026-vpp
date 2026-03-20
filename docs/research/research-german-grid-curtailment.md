# German Transmission Grid, Curtailment, and the VPP Opportunity

**Research compiled: March 2026**
**Purpose: KubeCon 2026 VPP Presentation Reference**

---

## Table of Contents

1. [German Transmission Grid Problems](#1-german-transmission-grid-problems)
2. [TSO vs DSO Dynamics](#2-tso-vs-dso-dynamics)
3. [Curtailment and Compensation](#3-curtailment-and-compensation)
4. [The 2026 Grid Reform](#4-the-2026-grid-reform)
5. [Relevance to VPPs](#5-relevance-to-vpps)
6. [Key Data Points](#6-key-data-points-for-presentation)
7. [Sources](#7-sources)

---

## 1. German Transmission Grid Problems

### 1.1 A Grid Designed for a Different Era

Germany's electricity grid was built around a **centralized generation architecture**: large coal, nuclear, and gas power plants fed electricity "top down" through high-voltage transmission lines to consumers at lower voltage levels. The system was a "one-way street" -- a few dozen large power stations delivering power outward to millions of end users.

The Energiewende (energy transition) has fundamentally inverted this model. Germany now has:

- **Over 1.7 million solar PV installations** feeding into the distribution grid
- **Over 29,000 onshore wind turbines** concentrated in northern and coastal regions
- **Hundreds of thousands of small, distributed generators** pushing power "bottom up" into a grid never designed for bidirectional flow

The transmission grid spans approximately **38,500 km** at extra-high voltage levels (220 kV and 380 kV). While Germany's grid is ranked among the most reliable in the world, the infrastructure is under increasing strain from a generation landscape it was never designed to accommodate.

### 1.2 The North-South Bottleneck

The core structural problem is geographic mismatch:

- **Wind generation is concentrated in the north** -- the North Sea coast, Baltic coast, Schleswig-Holstein, Lower Saxony, and the former East German states have the best wind resources
- **Industrial demand is concentrated in the south** -- Bavaria, Baden-Württemberg, and North Rhine-Westphalia host Germany's manufacturing heartland (automotive, chemicals, machinery)
- **Insufficient transmission capacity** exists between these regions

When strong winds blow in the north, the grid physically cannot transport all the generated electricity south. This creates:

1. **Congestion** on north-south transmission corridors
2. **Curtailment** of wind farms in the north (they are told to stop producing)
3. **Redispatch** -- gas plants or imports are ramped up in the south to compensate
4. **Massive costs** paid by consumers through grid fees

### 1.3 The "Electricity Highways" -- HVDC Corridors

Germany has four major planned HVDC (High-Voltage Direct Current) transmission corridors, often called "Stromautobahnen" (electricity highways), designed to solve the north-south bottleneck:

| Project | Route | Length | Capacity | Status (as of early 2026) |
|---------|-------|--------|----------|--------------------------|
| **SuedLink** | Schleswig-Holstein to Bavaria/Baden-Württemberg | ~1,340 km | 2 GW | Fully approved (Oct 2025). Construction underway. Completion expected **2028** (originally planned for 2022, then 2026) |
| **SuedOstLink** | Saxony-Anhalt to Bavaria | ~580 km | 2 GW | Nearly fully approved (last sections in 2025). Completion expected **2027-2028** (originally 2025) |
| **A-Nord** | Emden (Lower Saxony) to Osterath (NRW) | ~600 km | 2 GW | Approved. Under construction |
| **Ultranet** | Osterath (NRW) to Philippsburg (Baden-Württemberg) | ~340 km | 2 GW | Fully approved (Oct 2025) |

**Key facts about these projects:**

- Combined construction costs estimated between **EUR 8-20 billion**
- A federal subsidy of **EUR 6.5 billion** was approved in December 2025 specifically to contain costs (related to the 2015 decision to build underground cables rather than overhead lines, which dramatically increased costs)
- Delays have been caused by: complex approval procedures, local opposition and NIMBYism, court challenges, and limited specialized construction capacity
- In 2025, the Bundesnetzagentur approved approximately **2,000 km** of power lines -- 45% more than the 1,280 km approved in 2024
- Of Germany's planned **16,800 km** of grid extensions, only about **3,500 km** had been built by mid-2025
- As of end-2025, approximately **4,700 km** have full planning approval, and **4,100 km** are in or about to enter the approval process

**The bottom line:** Even with accelerated approvals in 2025, the critical HVDC corridors are years away from completion. Until then, the north-south bottleneck persists, and curtailment/redispatch costs continue mounting.

### 1.4 Redispatch Costs -- A Billion-Euro Problem

Redispatch and congestion management costs have exploded over the past decade:

| Year | Total Grid Congestion Management Costs | Notes |
|------|----------------------------------------|-------|
| 2015 | ~EUR 1.0 billion | First major spike |
| 2016 | Lower (exact figure varies by source) | Favorable wind conditions |
| 2017-2019 | Rising trend | |
| 2020-2021 | Continued increase | |
| 2022 | **EUR 4.2 billion** | All-time peak. EUR 2.7 billion was redispatch alone |
| 2023 | ~EUR 3.3 billion | Slight decrease from 2022 peak |
| 2024 | **EUR 2.78 billion** | Down 17% from 2023, but still massive |
| 2025 (Q3) | EUR 667 million (single quarter) | Rising again vs. EUR 608M in Q3 2024 |

This represents a **fifteen-fold increase** over the last decade. In 2024 alone, **EUR 554 million** was paid as direct compensation to curtailed renewable energy plant operators.

---

## 2. TSO vs DSO Dynamics

### 2.1 What Are TSOs and DSOs?

**Transmission System Operators (TSOs)** operate the extra-high-voltage grid (220-380 kV) that transports electricity over long distances. They are responsible for:

- Maintaining grid stability and frequency (50 Hz)
- Balancing supply and demand across their control area
- Managing congestion through redispatch
- Planning and building new transmission infrastructure
- Connecting offshore wind farms

**Distribution System Operators (DSOs)** operate the medium- and low-voltage grids (up to 110 kV) that deliver electricity to homes, businesses, and smaller industrial consumers. They are responsible for:

- Last-mile delivery to end consumers
- Connecting distributed generation (rooftop solar, small wind, etc.)
- Local grid stability and maintenance
- Metering and data management

### 2.2 Germany's Four TSOs

Germany's transmission grid is divided into four **control areas**, each managed by one TSO:

| TSO | Control Area | Key Characteristics |
|-----|-------------|---------------------|
| **50Hertz** | North and East Germany | Responsible for Baltic Sea offshore wind connections. High wind penetration region. Headquartered in Berlin |
| **TenneT** | Runs north-south across central Germany (Denmark border to Alps) | The only Dutch-owned TSO in Germany. Operates SuedLink. Also operates the Dutch grid |
| **Amprion** | West and Southwest (7 states, from Lower Saxony to Swiss/Austrian border) | ~11,000 km of grid. Major industrial load area (Ruhr region) |
| **TransnetBW** | Baden-Württemberg | Smallest control area. Major industrial demand center with limited local generation |

Together, these four TSOs manage approximately **37,000 km** of transmission grid.

In contrast, the distribution level comprises:

- **Over 860 DSOs** across Germany
- **More than 1.8 million km** of distribution grid
- A highly fragmented landscape of operators, from large utilities (E.ON, EnBW) to small municipal utilities (Stadtwerke)

### 2.3 The Top-Down vs. Bottom-Up Problem

The fundamental tension in Germany's grid architecture:

**The old model (top-down):**
```
Large Power Plant (GW scale)
    |
    v
Transmission Grid (380/220 kV) --- TSO manages
    |
    v
Distribution Grid (110 kV / 20 kV / 0.4 kV) --- DSO manages
    |
    v
Consumer
```

**The new reality (bidirectional):**
```
Consumer + Prosumer
    ^  |
    |  v
Distribution Grid <--- Solar, small wind, batteries, EVs, heat pumps
    ^  |
    |  v
Transmission Grid <--- Offshore wind, large solar parks
    ^  |
    |  v
Remaining conventional plants (shrinking)
```

**Why this matters:**

- **70% of new renewable capacity** being added to Europe's grid this decade connects at the distribution level, not transmission
- DSOs were never designed to manage generation -- they were passive "delivery pipes"
- Power now flows in both directions, sometimes from low-voltage back up to high-voltage
- **49% of redispatch measures** in Q2 2025 were already due to **distribution grid bottlenecks**, not just transmission
- TSOs and DSOs have limited visibility into each other's operations
- There is no unified real-time data platform spanning TSO and DSO operations

### 2.4 The Value of TSO-DSO Coordination

Research indicates that better TSO-DSO coordination for redispatch could save **up to EUR 300 million annually by 2030**. The key insight: distributed energy resources (DERs) connected at the distribution level could provide flexibility services to solve problems at the transmission level -- but only if TSOs and DSOs can coordinate effectively. This is exactly where VPPs enter the picture.

---

## 3. Curtailment and Compensation

### 3.1 How Curtailment Works in Germany

When grid congestion occurs, Germany's grid operators follow a hierarchy of interventions:

1. **Network switching** -- Reconfiguring the grid topology
2. **Redispatch of conventional plants** -- Ordering plants to increase or decrease output
3. **Cross-border redispatch** -- Coordinating with neighboring countries
4. **Feed-in management (Einspeisemanagement / EinsMan)** -- Curtailing renewable energy and CHP plants as a last resort

Under the **Redispatch 2.0** framework (implemented October 2021), the previously separate processes for conventional redispatch and renewable feed-in management were unified under sections 13, 13a, and 14 of the Energy Industry Act (EnWG). This expanded the number of participating plants from about 80 to approximately **60,000**, covering all generation plants, CHP plants, renewable plants, and storage systems with output above 100 kW.

### 3.2 Curtailment Volumes -- The Waste

Germany is curtailing enormous amounts of clean energy it has already built the capacity to produce:

**2024 curtailment by source:**

| Source | Curtailed (GWh) | Year-over-year change |
|--------|-----------------|----------------------|
| Offshore wind | 4,562 | -20% |
| Onshore wind | 3,384 | -15% |
| Solar PV | 1,389 | **+97%** |
| **Total renewables** | **~9.3 TWh** | |

**Context:**
- 9.3 TWh of curtailed renewable energy in 2024 is enough to power roughly **2.7 million German households** for a year
- In 2023, approximately **19 TWh** of total electricity was curtailed (including all sources), equal to about 4% of total generation
- Despite the curtailment, 96.5% of renewable generation reached end consumers -- but the 3.5% that didn't represents billions in wasted investment and unnecessary compensation costs
- Solar curtailment nearly doubled in 2024, driven by a surge in installed PV capacity and exceptionally high solar radiation, particularly in Bavaria (which alone accounted for 986 GWh of solar curtailment)

**Regional concentration:** The largest curtailment volumes occur in **Lower Saxony** and **Schleswig-Holstein** -- the traditional wind hubs with limited export routes south.

### 3.3 Compensation Rules -- Getting Paid to NOT Produce

Under Germany's Renewable Energy Sources Act (EEG), curtailed renewable generators are entitled to compensation:

- **95% of foregone revenues** are compensated by the grid operator (EEG section 15)
- To protect renewables in the redispatch merit order, **minimum factors** are applied: factor 10 for renewables (making them "expensive" to curtail and therefore curtailed last) and factor 5 for CHP plants
- In 2024, **EUR 554 million** was paid in direct compensation to curtailed renewable operators
- The average compensation rate for renewable curtailment was approximately **EUR 200/MWh** (down from EUR 216/MWh in 2023)

**The perverse incentive:** Wind farm developers can build in locations with excellent wind resources but poor grid connections, knowing they will still receive 95% compensation when curtailed. This creates a situation where:
- Generators are paid for electricity they don't produce
- Consumers pay through higher grid fees
- No economic signal encourages building where the grid can actually absorb the power
- No incentive exists to co-locate storage or flexible demand with generation

### 3.4 The Political Debate -- Ending "Ghost Electricity" Payments

The issue of paying generators for not producing -- sometimes called "Geisterstrom" (ghost electricity) in German media -- has become a significant political issue.

**The Habeck era (2021-2025):**
Under Green Party Economy Minister Robert Habeck, the issue was acknowledged but not fundamentally reformed. The focus was on accelerating grid expansion and renewable deployment.

**The new government (2025-present):**
Following the February 2025 federal election, Chancellor Friedrich Merz (CDU/CSU) formed a coalition with the SPD. The new Economy and Energy Minister is **Katherina Reiche** (CDU), former CEO of E.ON subsidiary Westenergie AG. She commissioned a "reality check" monitoring report of the energy transition shortly after taking office.

---

## 4. The 2026 Grid Reform

### 4.1 The January 2026 Draft -- A Paradigm Shift

In January 2026, a leaked 36-page reform draft from the economy ministry proposed fundamental changes to Germany's grid access and curtailment compensation framework. Published on January 30, 2026, the draft "grid package" (Netzpaket) includes:

**Key provisions:**

1. **Curtailment hotspot zones:** Regions where more than **3% of the previous year's electricity generation** was curtailed are designated as "capacity-constrained zones" (Engpassgebiete)

2. **Compensation waiver requirement:** In these hotspots, new renewable projects would only receive **immediate grid connection** if they **waive compensation for curtailment for up to 10 years**

3. **Scaling back grid priority:** The traditional absolute priority for renewable feed-in (Einspeisevorrang) would be limited for new projects in congested areas

4. **Grid upgrade cost sharing:** Grid operators would be partially allowed to **charge renewable investors** for network modernization and expansion costs triggered by their projects

5. **Incentivizing smart siting:** The ministry aims to steer new renewable projects toward areas where the grid can absorb them, or where developers co-locate storage to reduce bottleneck pressure

### 4.2 Industry Reaction

The renewables industry has reacted with alarm:

- Germany's renewable energy federation (**BEE**) warned the plans "could lead directly to energy shortages and rising prices"
- Developers argue the compensation waiver makes projects in windy northern regions financially unviable
- Critics note this could slow renewable deployment at exactly the wrong moment
- SPD energy experts have publicly questioned whether the reform could "slow Germany's energy transition at a difficult moment"

### 4.3 The Underlying Logic

The government's argument:

> "Future wind and solar power projects should be built in areas where fewer grid reinforcements are necessary, should add storage facilities on site to reduce bottlenecks, and should take responsibility for the costs associated with necessary grid expansions."

The reform explicitly aims to create **economic signals** that encourage:
- Building renewables where grid capacity exists
- Co-locating storage with generation
- Using curtailed energy locally rather than wasting it
- Reducing the EUR 3 billion annual redispatch bill

**This is precisely the opportunity space for VPPs.**

---

## 5. Relevance to VPPs

### 5.1 VPPs as the Alternative to Massive Infrastructure

The German grid problem can be summarized simply:

> Too much clean energy is being produced in the wrong places at the wrong times, and the infrastructure to move it doesn't exist yet and won't for years.

There are two approaches to solving this:

1. **Build more transmission** -- SuedLink, SuedOstLink, etc. (EUR 8-20 billion, completion 2027-2028+, still insufficient)
2. **Make demand flexible and local** -- Use the energy where and when it's produced (VPPs, storage, demand response)

VPPs are fundamentally option 2. Instead of building copper and steel to move electrons 1,000 km south, VPPs orchestrate distributed resources to **consume, store, or shift** energy locally.

### 5.2 How VPPs Reduce Curtailment

A VPP aggregating distributed resources in a wind-rich northern region could:

- **Charge batteries** during wind overproduction (absorbing excess supply)
- **Pre-heat buildings** using heat pumps when wind is cheap/abundant
- **Charge EVs** during periods that would otherwise be curtailed
- **Run industrial processes** (data centers, cold storage, electrolysis) during surplus periods
- **Export to neighboring regions** via optimized scheduling

Instead of paying a wind farm EUR 200/MWh to stop producing, a VPP creates demand that **uses** that electricity at a fraction of the cost.

### 5.3 VPPs Bridge the TSO-DSO Gap

The TSO-DSO coordination problem is fundamentally a **data and control** problem:

- TSOs need flexibility from distributed resources but can't see or control them
- DSOs have the connections but lack the aggregation and market participation capabilities
- VPPs sit at exactly this intersection, providing:
  - **Aggregation** of thousands of small assets into grid-relevant volumes
  - **Real-time visibility** into distributed resource availability
  - **Automated dispatch** responding to grid signals in milliseconds
  - **Market participation** on behalf of small assets that couldn't participate alone

### 5.4 Real-World German VPP Examples

**Next Kraftwerke (Shell):**
- One of Europe's largest VPPs
- ~9,500 networked decentralized generators and consumers
- Connects wind, solar, biogas, CHP, and hydro into a unified dispatch platform
- Provides balancing energy and participates in electricity trading

**sonnen (Shell):**
- **25,000 home batteries** aggregated into a VPP
- Total capacity: **250 MWh** (targeting 1 GWh in coming years)
- Approved for **primary control power** by TSOs TenneT (2018), Amprion (2021), and TransnetBW (December 2024)
- Provides frequency regulation -- thousands of home batteries stabilizing the transmission grid
- Partnership with Next Kraftwerke: sonnen handles battery aggregation and availability; Next Kraftwerke handles market connection and TSO communication

**The key insight for the presentation:** sonnen demonstrates that **home batteries** -- consumer devices sitting in basements -- can provide **transmission-level grid services** when aggregated by a VPP. This is the "distributed alternative to infrastructure" narrative.

### 5.5 The VPP Value Proposition in Numbers

| Approach | Cost | Timeline | Capacity |
|----------|------|----------|----------|
| SuedLink HVDC corridor | EUR 10+ billion | 2028 (after 10+ years of planning) | 2 GW |
| sonnen VPP (current) | Distributed across homeowners | Already operational | 250 MWh (growing to 1 GWh) |
| Next Kraftwerke VPP | Platform costs | Already operational | ~9,500 units, GW-scale aggregation |
| TSO-DSO coordination savings | N/A | By 2030 | Up to EUR 300M/year saved |

VPPs don't replace transmission -- but they provide **immediate, scalable, software-defined flexibility** that can be deployed years before hardware infrastructure is complete.

### 5.6 The Presentation Narrative

For the KubeCon VPP talk, the German grid story provides a powerful narrative arc:

1. **The problem is real and massive:** EUR 2.8 billion/year wasted on grid congestion management. 9.3 TWh of clean energy curtailed in 2024 -- enough to power 2.7 million homes.

2. **The hardware solution is too slow:** HVDC corridors are a decade late and billions over budget. 16,800 km planned, only 3,500 km built.

3. **The rules are changing:** The January 2026 reform creates new incentives -- renewable developers must now "take responsibility" for grid impact. This creates demand for local flexibility solutions.

4. **VPPs are the software answer:** Instead of building 1,340 km of underground cable, aggregate 25,000 batteries with a software platform. Instead of paying EUR 200/MWh for ghost electricity, charge those batteries for EUR 0/MWh during oversupply.

5. **This is a Kubernetes problem:** Orchestrating 25,000+ distributed resources in real-time, maintaining state, handling failures, scaling -- this is container orchestration applied to energy.

---

## 6. Key Data Points for Presentation

### Renewable Energy Share

| Year | Renewables Share of Electricity | Notes |
|------|--------------------------------|-------|
| 2000 | <6% | Year of the original EEG renewable energy law |
| 2020 | ~46% | |
| 2023 | ~56% | |
| 2024 | **62.7%** (net public generation) / 59% (gross consumption) | Record year |
| 2025 | **55.9%** (net public generation) / ~56% (gross consumption) | Wind+solar alone: 55%+ for first time. Q2 2025 hit 67.5% -- highest ever quarterly share |

### 2025 Generation Mix (Fraunhofer ISE)

- **Wind:** 132 TWh (onshore 106 TWh + offshore 26 TWh) -- largest single source
- **Solar PV:** 87 TWh (71 TWh to grid + 17 TWh self-consumed) -- overtook lignite for first time
- **Wind + Solar combined:** 219 TWh
- **Total renewables:** ~278 TWh (256 TWh to public grid)

### Grid Fee Trends

- 2024-2025: Transmission grid fees averaged **6.65 ct/kWh**
- 2026: Preliminary TSO tariffs show average drop to **2.86 ct/kWh** (-57%), enabled by EUR 6.5 billion federal subsidy approved December 2025
- Time-variable grid fees introduced from April 2025 (high/standard/low tariff periods) -- creating explicit price signals for load shifting

### Headline Numbers for Slides

- **EUR 2.8 billion** -- Annual cost of grid congestion management (2024)
- **9.3 TWh** -- Renewable energy curtailed in 2024
- **2.7 million homes** -- Could be powered by the wasted energy
- **EUR 554 million** -- Paid to generators for NOT producing (2024)
- **EUR 200/MWh** -- Average curtailment compensation rate
- **95%** -- Revenue guarantee for curtailed renewables under current rules
- **16,800 km** -- Planned grid extensions; only **3,500 km** built
- **2028** -- Earliest completion for SuedLink (originally planned for 2022)
- **25,000 batteries** -- sonnen's VPP in Germany (250 MWh, targeting 1 GWh)
- **860+ DSOs** -- Fragmented distribution grid landscape
- **60,000 plants** -- Now participating in Redispatch 2.0

---

## 7. Sources

### Bundesnetzagentur (Federal Network Agency)
- [Energy transition clears crucial hurdle -- grid expansion progress in 2025](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/EN/2026/20260102_Netzausbau.html)
- [Grid fee reform proposals 2025](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/EN/2025/20250423_Netzentgelte.html)
- [Fair distribution of network costs (August 2024)](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/EN/2024/20240830_NEtzentgelte.html)

### Clean Energy Wire (CLEW)
- [Germany's needs and costs for grid management down in 2024](https://www.cleanenergywire.org/news/germanys-needs-and-costs-grid-management-down-2024-network-agency)
- [Re-dispatch costs in the German power grid](https://www.cleanenergywire.org/factsheets/re-dispatch-costs-german-power-grid)
- [Set-up and challenges of Germany's power grid](https://www.cleanenergywire.org/factsheets/set-and-challenges-germanys-power-grid)
- [Q&A: Will Germany's upcoming electricity grid reform slow down the energy transition?](https://www.cleanenergywire.org/factsheets/qa-will-germanys-upcoming-electricity-grid-reform-slow-down-energy-transition)
- [Germany continues to reject power price zone split](https://www.cleanenergywire.org/news/germany-continues-reject-power-price-zone-split-vows-fix-grid-bottlenecks)
- [Germany greenlights record 2,000 km of high-voltage grid extensions in 2025](https://www.cleanenergywire.org/news/germany-greenlights-record-2000-km-high-voltage-grid-extensions-2025)
- [Germany's government -- Who shapes climate and energy policy under Merz?](https://www.cleanenergywire.org/factsheets/make-germanys-next-government-energy-manager-head-economy-ministry)
- [Germany covers nearly 56% of 2025 electricity use with renewables](https://www.cleanenergywire.org/news/germany-covers-nearly-56-percent-2025-electricity-use-renewables)
- [Proposed grid access reform could slow Germany's energy transition](https://www.cleanenergywire.org/news/proposed-grid-access-reform-could-slow-germanys-energy-transition-difficult-moment-spd-energy-expert)

### Fraunhofer ISE
- [Public Electricity Generation 2024: Renewables cover 60%+ for the first time](https://www.ise.fraunhofer.de/en/press-media/press-releases/2025/public-electricity-generation-2024-renewable-energies-cover-more-than-60-percent-of-german-electricity-consumption-for-the-first-time.html)
- [German Public Electricity Generation in 2025: Wind and Solar Take the Lead](https://www.ise.fraunhofer.de/en/press-media/press-releases/2026/german-public-electricity-generation-in-2025-wind-and-solar-power-take-the-lead.html)

### SMARD (Federal Network Agency Market Data)
- [Congestion management in Q2 2024](https://www.smard.de/page/en/topic-article/5892/215186/congestion-management-in-the-second-quarter-of-2024)
- [Transmission system operators](https://www.smard.de/page/en/wiki-article/5884/205528/transmission-system-operators)
- [The electricity market in Q2 2025](https://www.smard.de/page/en/topic-article/5892/217608/more-than-two-thirds-renewables)

### Strategic Energy Europe
- [Solar curtailment surges by 97% in Germany in 2024](https://strategicenergy.eu/solar-curtailment-germany/)

### Modo Energy
- [Redispatch explained: How does Germany balance its grid?](https://modoenergy.com/research/en/de-germany-bess-batteries-grid-balancing-redispatch-explainer-july-2025)

### Industry / VPP
- [Next Kraftwerke -- Virtual Power Plant](https://www.next-kraftwerke.com/vpp/virtual-power-plant)
- [ESIG -- VPP Applications for Power System Management: Example Germany](https://www.esig.energy/blog-virtual-power-plants-vpp-applications-for-power-system-management-example-germany/)
- [sonnen -- Europe's largest VPP](https://sonnengroup.com/press/europes-largest-vpp/)
- [Sonnen's German battery VPP reaches 250MWh](https://www.energy-storage.news/sonnen-german-battery-vpp-reaches-250mwh-expects-1gwh-in-next-few-years/)
- [German grid company approves Sonnen VPP for primary control power (Dec 2024)](https://www.ess-news.com/2024/12/13/german-grid-company-approves-sonnen-home-battery-vpp-for-primary-control-power/)
- [gridX -- Grid operators: TSO and DSO explained](https://www.gridx.ai/knowledge/what-is-a-grid-operator)

### Academic / Research
- [The value of TSO-DSO coordination in re-dispatch (ScienceDirect)](https://www.sciencedirect.com/science/article/pii/S0306261922011655)
- [Ofgem -- Case study: Redispatch 2.0 in Germany](https://www.ofgem.gov.uk/publications/case-study-germany-redispatch-20)
- [Synertics -- How renewable energy production is affecting grid curtailments in Germany](https://synertics.io/blog/92/how-renewable-energy-production-is-affecting-grid-curtailments-in-germany)

### Infrastructure Projects
- [NKT -- Corridor projects Germany](https://www.nkt.com/references/corridor-projects-germany)
- [Prysmian -- An update on German Corridor developments](https://www.prysmian.com/en/insight/projects/an-update-on-german-corridor-developments)
- [xpert.digital -- The four major infrastructure projects](https://xpert.digital/en/the-four-major-infrastructure-projects)

### Government / Policy
- [German Federal Government -- Energy price relief](https://www.bundesregierung.de/breg-en/federal-government/reduction-in-energy-prices-2358994)
- [Trio Advisory -- Grid-fee subsidy and power-tax cut in Germany 2026](https://www.trioadvisory.com/resources/grid-fee-subsidy-and-power-tax-cut-germany-2026-what-energy-intensive-sites-will-really-save)
- [Business Sweden -- Germany accelerates energy system upgrades (Dec 2025)](https://www.business-sweden.com/insights/blogs/germany-a-new-era-for-investment/germany-accelerates-large-scale-upgrades-across-its-energy-system-as-of-11-december-2025/)

---

## Appendix: The Podcast Connection

The podcast your wife mentioned likely covered the January 2026 grid reform proposal ("Netzpaket"), which received significant media attention in Germany. The key talking points align with what was discussed:

- National transmission infrastructure is old and struggling with renewables
- Wind farms in the north are curtailed but still get paid (95% compensation under EEG section 15)
- The new energy minister (Katherina Reiche, CDU) wants to end this practice through the "hotspot" waiver system
- The reform would require new renewable projects in congested areas to waive curtailment compensation for up to 10 years

Several German energy podcasts covered this extensively in January-February 2026, including those from Clean Energy Wire, Handelsblatt, and various energy industry outlets. The topic was also covered in mainstream media (Tagesschau, ZDF) due to the political controversy around potentially slowing the Energiewende.
