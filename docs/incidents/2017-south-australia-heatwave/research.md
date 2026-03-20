# South Australia Heatwave Blackout -- 2017

## Quick Reference

| Field | Value |
|-------|-------|
| **Date** | February 8, 2017 |
| **Location** | South Australia |
| **Duration** | ~37 minutes (load shedding 18:03-18:40 AEST) |
| **People Affected** | ~90,000+ homes |
| **Deaths** | 0 |
| **Economic Cost** | AUD $900,000 fine (Pelican Point); broader costs not quantified |
| **Root Cause** | Extreme heat caused demand spike beyond forecasts; AEMO ordered load shedding; SA Power Networks software error shed 3x requested load |
| **Grid Frequency Impact** | Not reported (managed via load shedding) |
| **Load Shed** | ~300 MW disconnected (vs 100 MW directed) |
| **Slides Referenced** | Slide 12 (Not an Isolated Incident) |

## Timeline

| Time (AEST) | Event |
|---|---|
| Throughout day | Demand climbed well above successive AEMO predispatch forecasts |
| ~18:00 | Operational demand approached **3,085-3,100 MW** (a "P10" level -- exceeded only one year in ten) |
| 18:03 | AEMO directed ElectraNet to shed **100 MW** of load |
| 18:03-18:30 | SA Power Networks shed **~300 MW** due to software error; 90,000+ homes lose power |
| 18:30 | AEMO requested ElectraNet to restore 100 MW over 10 minutes |
| 18:40 | AEMO determined sufficient capacity available; instructed full load restoration |

## Root Cause Analysis

Extreme heat combined with generation constraints. SA's generation fleet, still recovering from the September 2016 event politically and structurally, could not meet peak demand under extreme conditions. AEMO ordered controlled load shedding, but a software error at SA Power Networks caused 300 MW to be shed instead of the directed 100 MW.

### Contributing Factors

1. **Demand exceeded forecasts**: AEMO's predispatch forecasts never came close to predicting demand approaching 3,100 MW. Forecasts consistently underestimated actual demand throughout the day. The forecasting models used a 50/50 combination of forecast and actual temperatures but still significantly underestimated demand.

2. **Wind generation collapsed**: At 6 PM, wind was generating only **96 MW** -- well below what had been forecast, removing a significant expected supply source.

3. **Pelican Point gas plant idle**: South Australia's largest single gas generation unit (239 MW of its second unit had been offline since March 2015) was not running. Engie (the owner) had mothballed capacity to sell gas on the open market at higher profit. The unit could potentially have been started with adequate notice but was not available.

4. **Interconnector limits**: Flows on the Murraylink interconnector exceeded secure operating limits by over 100 MW.

5. **SA Power Networks software error**: The utility shed three times more load than AEMO directed, affecting far more customers than necessary.

6. **Ongoing structural low inertia** in SA's grid.

### Cascade Mechanism

Not a classic cascade -- this was directed load shedding (controlled, not uncontrolled). AEMO shed load proactively to prevent a repeat of the 2016 statewide blackout. However, the software error transformed a targeted 100 MW shed into a 300 MW disconnection affecting 90,000+ homes.

## Temperature Records: Clarifying the Numbers

- **8 February 2017**: Adelaide (Kent Town) reached **42.4 degrees C**. This is the correct figure -- NOT 45 degrees C as sometimes cited in media.
- **28 January 2009**: Adelaide reached **45.7 degrees C** during the 2009 southeastern Australia heatwave (connected to the Black Saturday bushfires of 7 February 2009). This is a separate, more extreme event.
- The 2017 heatwave was severe but not record-breaking in absolute temperature terms. Its significance was the grid failure it caused, not the temperature alone.

AEMO CEO Audrey Zibelman noted: "We're looking at weather in South Australia that we haven't seen for 80 years so this is an all-time peak and clearly the system is under a lot of stress."

## Grid Context

Less than 5 months after the catastrophic **28 September 2016 statewide blackout**, when storm damage to transmission infrastructure caused a "black system" event that left **1.7 million people** without power across the entire state. Political and operational sensitivity was extremely high.

### The Escalating Crisis

| Date | Event | Impact |
|---|---|---|
| 28 Sep 2016 | Statewide blackout (storm damage) | 1.7 million people, entire state |
| 8 Feb 2017 | Heatwave load shedding | 90,000+ homes, 30-45 minutes |
| 10 Feb 2017 | NSW also experienced load shedding | Heatwave extended to eastern seaboard |

These repeated failures created enormous political pressure and public anxiety about South Australia's energy security. The state had the highest penetration of renewable energy in Australia, and critics blamed the transition away from coal and gas for grid instability.

## Response & Recovery

Load shedding was controlled and targeted. Power restored progressively between 18:30 and 18:40 after AEMO confirmed sufficient generation and interconnector capacity was available.

### Post-Event Investigation

- **SA Power Networks** acknowledged the software error that caused 300 MW rather than 100 MW to be shed and launched an investigation.
- **Pelican Point** was later found by the Federal Court to have breached National Electricity Rules by failing to disclose short-term availability information to AEMO. Pelican Point Power Limited (majority owned by Engie) was fined **AUD $900,000**.

### Political Response

The SA government, under Premier Jay Weatherill, announced a comprehensive energy plan in March 2017 that included:
- A new government-owned gas power plant
- Energy storage targets
- A competitive tender for large-scale battery storage -- which ultimately led to the **Hornsdale Power Reserve (Tesla Big Battery)** contract

The February 2017 heatwave, combined with the September 2016 blackout, was the proximate cause of Australia building what was then the world's largest lithium-ion battery.

## VPP Relevance

- **Response time gap:** 90,000 homes shed because no demand-side flexibility existed
- **Flexibility gap:** With VPP-connected batteries in those homes, load could have been reduced without disconnection
- **Architecture lesson:** Even "controlled" load shedding is a failure mode. A VPP turns blunt disconnection into surgical demand management.

## Key Statistics for Presentation

| Stat | Value | Source | Confidence |
|------|-------|--------|------------|
| Homes affected | ~90,000 | AEMO event report | High |
| Temperature (Adelaide) | 42.4 C | BOM records (Kent Town) | High |
| Load shed directed | 100 MW | AEMO event report | High |
| Load shed actual | ~300 MW | AEMO event report | High |
| Wind generation at 6 PM | 96 MW | AEMO event report | High |
| Peak demand | ~3,085-3,100 MW | AEMO event report | High |
| Pelican Point fine | AUD $900,000 | AER / Federal Court | High |

## Fact-Check Notes

- Presentation previously stated ~45 C; actual Adelaide temperatures were 42.4 C (Kent Town). The 45.7 C figure is from the 2009 heatwave -- a separate event.
- Some regional stations may have reached higher; use Adelaide figure for accuracy.
- Inland locations exceeded 46 C, but these are not Adelaide.

## Sources

1. AEMO System Event Report: South Australia, 8 February 2017 -- [AEMO PDF](https://www.aemo.com.au/-/media/Files/Electricity/NEM/Market_Notices_and_Events/Power_System_Incident_Reports/2017/System-Event-Report-South-Australia-8-February-2017.pdf)
2. WattClarity Initial Analysis: SA Load Shedding Wed 8 Feb 2017 -- [WattClarity](https://wattclarity.com.au/articles/2017/02/initial-analysis-sa-load-shedding-wed-8-feb-2017/)
3. Australian Energy Council: South Australia's blackouts -- [Energy Council](https://www.energycouncil.com.au/analysis/south-australia-s-blackouts-not-as-simple-as-it-looks/)
4. Finlaysons: Addressing the Energy Crisis in South Australia -- [Finlaysons](https://www.finlaysons.com.au/2017/03/addressing-the-energy-crisis-in-south-australia-blackouts-and-heatwaves/)
5. RenewEconomy: How South Australia's biggest gas plant sat idle during summer blackouts -- [RenewEconomy](https://reneweconomy.com.au/how-south-australias-biggest-gas-plant-sat-idle-during-summer-blackouts/)
6. AER: Pelican Point in court for alleged breaches -- [AER](https://www.aer.gov.au/news/articles/news-releases/pelican-point-court-alleged-breaches-national-electricity-rules)
7. Bureau of Meteorology: Adelaide in February 2017 -- [BoM](http://www.bom.gov.au/climate/current/month/sa/archive/201702.adelaide.shtml)
8. World Weather Attribution: Extreme heat in southeast Australia, February 2017 -- [WWA](https://www.worldweatherattribution.org/extreme-heat-australia-february-2017/)
9. [Bureau of Meteorology -- Adelaide temperature records](http://www.bom.gov.au/climate/current/annual/sa/summary.shtml)
10. Wikipedia: 2016 South Australian blackout -- [Wikipedia](https://en.wikipedia.org/wiki/2016_South_Australian_blackout)
11. Wikipedia: 2009 southeastern Australia heat wave -- [Wikipedia](https://en.wikipedia.org/wiki/2009_southeastern_Australia_heat_wave) (for the 45.7 C comparison)

## Related Research Files

- [docs/fact-check-report.md](../../fact-check-report.md) -- Item 20 (temperature correction: 42 C not 45 C)
- [docs/demand-response-research.md](../../demand-response-research.md) -- SA energy context, Hornsdale response
