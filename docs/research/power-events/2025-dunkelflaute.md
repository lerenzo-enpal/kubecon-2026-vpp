# German Dunkelflaute: November-December 2024

The winter of 2024 delivered Germany's most severe **Dunkelflaute** (dark doldrums) in recent memory -- a prolonged period of minimal wind and solar generation that stress-tested Europe's largest renewable energy system, drove wholesale electricity prices to 18-year highs, and reignited debate about the Energiewende's resilience to weather extremes.

---

## What is a Dunkelflaute?

**Dunkelflaute** (literally "dark wind lull") describes extended periods of simultaneously low wind speed and low solar irradiance, during which wind turbines and solar panels produce a fraction of their rated capacity. These events are the Achilles' heel of renewable-heavy grids: demand remains constant (or rises, in cold weather), while supply collapses.

Germany's installed renewable capacity in 2024:
- **Solar**: 99.3 GW (57.7% of renewable capacity)
- **Onshore wind**: 63.5 GW (36.9%)
- **Offshore wind**: 9.2 GW (5.4%)

Total installed renewable capacity exceeds 170 GW -- but during a Dunkelflaute, actual output can fall below 10% of this figure.

---

## The November 2024 Event

### Timeline: November 4-10, 2024

A high-pressure system settled over Central Europe, bringing calm, overcast conditions across Germany and much of northern Europe.

### Generation Collapse

- **Renewables contributed only 30%** of public electricity generation during the week of Nov 4-10
- **Fossil fuels covered the remaining 70%** -- a dramatic reversal from Germany's annual renewable share of ~55%
- Solar generation collapsed: after contributing ~25% of electricity in summer months (May-August), solar dropped to **4.3% in November**
- Wind output fell to a fraction of installed capacity, with average generation far below the ~19 GW seasonal norm

### Price Impact

- **Baseload prices surged to EUR 145/MWh** (vs. the 2024 average of ~EUR 79/MWh)
- **Intraday prices spiked above EUR 300/MWh** during peak hours on November 5-7
- Peak price hours: November 6, 5:00 PM - 7:00 PM

---

## The December 2024 Event

### Timeline: Approximately December 9-14, 2024

A second, more severe Dunkelflaute struck in December, coinciding with rising winter heating demand.

### Generation Collapse

- **Wind output dropped to 2.8-3.1 GW** -- approximately **85% below** the seasonal average of 19.2 GW
- At Germany's installed wind capacity of ~73 GW, this represents output at roughly **3.8-4.2% of installed capacity**
- Combined renewable output fell to single-digit percentages of total demand
- Solar contribution was negligible (short winter days, overcast skies)

### Price Impact

- **Baseload day-ahead prices exceeded EUR 175/MWh**
- **Intraday wholesale prices peaked above EUR 900/MWh** on December 12 -- the **highest level in 18 years** (since the 2006 European energy crisis)
- Peak price hours: December 11-12, 4:00 PM - 6:00 PM
- Intraday spreads exceeded **EUR 250/MWh** within single trading sessions
- **Clean spark spreads** (gas plant profit margins) surged above EUR 60/MWh, compared to typical levels of EUR 10-15/MWh

### Real-World Impact

- One steel factory **temporarily halted production** to avoid purchasing electricity at extreme spot prices
- Most residential consumers were insulated by long-term fixed-price contracts
- Industrial consumers on spot-market contracts faced severe cost exposure

---

## How Germany Coped

### Fossil Fuel Dispatch

Germany was forced to fire up its entire conventional fleet:

- **Coal**: Over **30% of electricity came from coal** in November -- despite Germany's target to phase out coal by 2038
- **Gas peakers**: Gas-fired plants ran at elevated output, setting the marginal price through the merit-order effect. Lower-efficiency gas engines and OCGTs (30-40% efficiency) captured the highest margins
- **Oil**: Facilities burned oil **"at maximum capacity"** for electricity production during the worst days

### Gas Reserve Draw-Down

- Gas storage levels dropped from **98% full in early November** to approximately **85%** within weeks
- This rapid draw-down highlighted winter gas vulnerability, especially given reduced Russian pipeline flows since 2022

### Cross-Border Imports

Germany ramped up electricity imports from:

- **France** (nuclear generation)
- **Poland** (coal-heavy mix)
- Nearly one-fifth of imported electricity came from fossil fuels, and **18% from nuclear** -- ironic given Germany's shutdown of its last three nuclear reactors in April 2023

### Nearly All Capacity Deployed

Post-event analysis by the Bundesnetzagentur and Bundeskartellamt found:

- **Nearly all available capacity** from Germany's five largest producers (EnBW, LEAG, RWE, Uniper, Vattenfall) was deployed
- Unused capacity during peak hours averaged only **~170 MW** (Nov 6) and **~410 MW** (Dec 12)
- **Reserve and balancing capacity** totaled 12-13 GW, ensuring supply security
- **No market manipulation** was found -- the price spikes were driven by genuine scarcity
- Approximately 4.5 GW (November) and 3.4 GW (December) of capacity remained unavailable due to maintenance or technical issues

### Grid Stability Maintained

Despite the extreme conditions, **no blackouts or load-shedding occurred**. Germany's grid operators maintained system stability through a combination of domestic thermal generation, imports, and demand-side response.

---

## Historical Context: How Often Do Dunkelflauten Occur?

### Frequency

Analysis of 30+ years of meteorological data (1985-2016) shows:

- **2-10 Dunkelflaute events per year** in Germany (events lasting >24 hours)
- Average: approximately **4 events per year**
- Durations range from **2 to 9 days** for significant events
- Events are concentrated in **November through February**, when solar output is minimal and weather patterns can stagnate

### Trend

Research indicates that short-duration events (6h and 12h) were relatively common until 2017 but have **declined and stabilized** since 2018. However, the severity of individual events -- particularly multi-day episodes -- remains a persistent risk. Climate models suggest that while average wind conditions may not change dramatically, the **tail risk of extreme Dunkelflauten** persists or may worsen with changing jet stream patterns.

### The 2024 Events in Context

The November-December 2024 Dunkelflaute was notable for:

1. **Two significant events within 5 weeks** -- unusual clustering
2. **Duration**: the December event lasted approximately 5-6 days of severely depressed output
3. **Price severity**: EUR 900+/MWh peaks were unprecedented since the 2006 crisis (far exceeding the 2022 energy crisis average of EUR 235/MWh)
4. **Near-total thermal dispatch**: nearly all available conventional capacity was needed simultaneously

---

## Relevance to Virtual Power Plants (VPPs) and Battery Storage

The 2024 Dunkelflaute provides a compelling case study for why distributed battery storage and VPP orchestration are critical to grid resilience.

### Short-Duration Storage (1-2 Hour BESS)

During the November event, **short-duration battery storage** captured significant arbitrage value:

- Volatile day-ahead spreads created strong intraday trading opportunities
- Price swings of EUR 250+/MWh within single trading sessions made battery cycling highly profitable
- VPPs coordinating distributed batteries could capture these spreads across thousands of units

### Longer-Duration Storage (4+ Hour BESS)

The December event demonstrated that **longer-duration storage** outperforms short-duration during sustained Dunkelflauten:

- Sustained high margins persisted **across entire days** rather than concentrating in peak hours
- Longer-duration assets captured consistent price premiums during prolonged renewable shortfalls
- This validates the trend toward 4-hour BESS systems and the emerging need for 8+ hour storage

### VPP Coordination Value

A VPP aggregating thousands of residential/commercial batteries provides:

1. **Distributed arbitrage**: Capture EUR 100-250/MWh spreads across the fleet simultaneously
2. **Grid services during scarcity**: Frequency response and reserve provision when conventional plants are running at maximum
3. **Demand response orchestration**: Coordinate load reduction across heat pumps, EV chargers, and industrial processes
4. **Reduced import dependency**: Every MWh dispatched from storage is one fewer MWh imported from fossil/nuclear neighbors
5. **Price signal responsiveness**: Automated bidding into intraday markets at sub-second timescales

### The Storage Duration Gap

Current battery storage addresses **intra-day** fluctuations effectively but cannot bridge **multi-day** Dunkelflauten alone:

- Germany is planning **long-duration energy storage (LDES) auctions** for 2025-2026, requiring **72-hour discharge duration** at minimum 1 MW
- Transitioning to a fully renewable system may require **several hundred TWh** of storage capacity for extreme events
- Lithium-ion batteries are not designed for multi-day bridging due to cost and material constraints
- Technologies like compressed air, flow batteries, hydrogen, and thermal storage are needed for the multi-day gap

### The Economic Case

The 2024 Dunkelflaute demonstrated the economic value of flexibility assets:

| Metric | November Event | December Event |
|--------|---------------|----------------|
| Baseload price | EUR 145/MWh | EUR 175+/MWh |
| Peak intraday price | EUR 300+/MWh | EUR 900+/MWh |
| Clean spark spread | EUR 35+/MWh | EUR 60+/MWh |
| Intraday spread opportunity | High volatility | Sustained premium |
| Best-performing flex asset | Short-duration BESS | Long-duration BESS & gas peakers |

A VPP with a 100 MW / 400 MWh portfolio could have captured **extraordinary revenues** during these two events alone -- potentially earning a significant fraction of annual revenue in just 2-3 weeks.

---

## Key Takeaways

1. **Dunkelflauten are not rare** -- they occur multiple times per year. The 2024 events were severe but not unprecedented in meteorological terms.
2. **Germany's grid survived** without blackouts, but only by dispatching nearly every available thermal plant and importing heavily.
3. **Price signals were extreme**: EUR 900/MWh peaks create massive incentive for storage and flexible generation.
4. **Short-duration batteries capture volatility**; long-duration storage captures sustained scarcity premiums. Both are needed.
5. **VPPs are uniquely positioned** to aggregate distributed batteries, coordinate demand response, and provide grid services during exactly these high-stress, high-value periods.
6. **The Energiewende's vulnerability** is not average conditions (renewables perform well on average) but **tail events** -- and Dunkelflauten are the canonical tail event.

---

## Sources

- [Clean Energy Wire: Prolonged Dunkelflaute Shrinks Germany's Renewables Output in Early November](https://www.cleanenergywire.org/news/prolonged-dunkelflaute-shrinks-germanys-renewables-output-early-november)
- [Clean Energy Wire: Short-Term Power Prices Spike Amid New Dunkelflaute](https://www.cleanenergywire.org/news/short-term-power-prices-spike-amid-new-dunkelflaute-germany-most-customers-unaffected)
- [Clean Energy Wire: Major Utilities Cleared of Price Manipulation During 2024 Dunkelflaute](https://www.cleanenergywire.org/news/major-utilities-cleared-price-manipulation-during-2024-dunkelflaute-periods-report)
- [Fortune: Dunkelflaute Weather Phenomenon Pushes German Energy Prices to 2-Decade High](https://fortune.com/europe/2024/12/12/weather-phenomenon-dunkelflaute-germany-energy-prices/)
- [Sightline U3O8: Germany's Dunkelflaute Is Causing an Energy Crisis in Europe](https://sightlineu3o8.com/2024/12/germanys-dunkelflaute-is-causing-an-energy-crisis-in-europe/)
- [Timera Energy: Impact of German Dunkelflaute on Flex Asset Value](https://timera-energy.com/blog/impact-of-german-dunkelflaute-on-flex-asset-value/)
- [Bundeskartellamt: Study of Electricity Price Peaks During Dunkelflaute Periods in 2024](https://www.bundeskartellamt.de/SharedDocs/Meldung/EN/Pressemitteilungen/2025/10_21_2025_Preisspitzen.html)
- [Bundesnetzagentur: Electricity Price Peaks During Dunkelflaute Periods](https://www.bundesnetzagentur.de/SharedDocs/Pressemitteilungen/EN/2025/20251021_Preisspitzen.html)
- [Strategic Energy Europe: Germany Dispels Fears Over the Dunkelflaute](https://strategicenergy.eu/germany-dispels-fears-dunkelflaute/)
- [Energy Central: Dunkelflaute and Storage Solutions -- Uncomfortable Truths](https://energycentral.com/c/cp/dunkelflaute-and-storage-solutions-uncomfortable-truths-germanys-energy)
- [Montel Energy: Cold Dunkelflauten in Germany -- A Hidden Challenge](https://montel.energy/resources/blog/cold-dunkelflauten-in-germany-a-hidden-challenge-for-the-energy-transition)
- [Energy Storage News: Germany Plans Long-Duration Energy Storage Auctions](https://www.energy-storage.news/germany-plans-long-duration-energy-storage-auctions-for-2025-and-2026/)
- [arXiv: Assessing the Risk of Future Dunkelflaute Events for Germany](https://arxiv.org/html/2509.24788v1)
- [arXiv: Quantifying the Dunkelflaute -- Analysis of Variable Renewable Energy Droughts in Europe](https://arxiv.org/html/2410.00244v3)
- [MDPI Energies: A Brief Climatology of Dunkelflaute Events over the North and Baltic Sea Areas](https://www.mdpi.com/1996-1073/14/20/6508)
- [Next Kraftwerke: Dunkelflaute -- Can Renewable Energies Overcome the Darkness?](https://www.next-kraftwerke.com/energy-blog/reliable-supply)
