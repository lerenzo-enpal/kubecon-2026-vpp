# Slide Order

### Opening
1. **Virtual Power Plants** -- Title slide with KubeCon/Enpal branding [StaticTexasGrid]
   > *Speaker: Welcome to KubeCon. "I work at Enpal -- we're building Europe's largest virtual power plant. Before we talk about what a VPP is, we need to talk about the thing it's trying to fix."*
2. **Agenda** -- Four-part agenda with timing
   > *Speaker: "Four parts: The Grid, Renewables, the VPP itself, and Resilience. ~30 minutes total -- we'll go fast. By the end you'll understand why the energy grid is the most exciting distributed systems problem on the planet."*

### The Grid (Part I)
3. **The Grid** -- Section title, "world's largest machine" [LERENZO]
   > *LERENZO: "The world's largest machine -- this isn't hyperbole, we're going to prove it."*
4. **Texas Cascade HUD** -- Full-screen Texas blackout map [TexasMapHUD] [LERENZO]
   > *LERENZO: "February 2021 -- a polar vortex hits Texas. Watch the grid go dark, county by county. This is real data -- 4.5 million homes lost power."*
5. **"4 minutes and 37 seconds"** -- Texas crisis stats: deaths, damage, homes [AnimatedStat] [LERENZO]
   > *LERENZO: "The Texas grid was 4 minutes and 37 seconds from a total cold-start collapse. A cold restart takes weeks, maybe months -- you're rebuilding the grid from scratch. 246 people died. $195 billion in damage. Wholesale prices went from $50 to $9,000/MWh overnight -- 180x. Families got $7,000 bills in a week. Their provider went bankrupt."*
6. **Grid Scale** -- Animated factory-to-EU zoom-out [versionD] [MARIO]
   > *MARIO: "The world's largest factory is VW Wolfsburg -- 60,000 workers over 6.5 km2. The European grid: 2.3 million workers across 5.5 million km2. 36 countries, all synchronized on one frequency. Zero downtime -- this machine has never been turned off. No maintenance window. No staging environment."*
7. **EU Grid HUD** -- Full-screen European grid visualization [EUGridHUD] [MARIO]
   > *MARIO: "This is the Continental European grid -- real-time visualization. 400 million consumers. 1,100 GW of installed capacity. Every node is synchronized. One heartbeat: 50 Hz."*
8. **The Grid: A Balancing Act** -- Interactive frequency with ENTSO-E thresholds [FrequencyDemo] [MARIO]
   > *MARIO: "The grid maintains exactly 50 Hz -- supply and demand balanced every single second. The +/-0.2 Hz band is everything -- cross it and automated systems start disconnecting." [DEMO] Click scenarios: generator trip (800 MW offline, recovery in ~12 min), 3 GW loss (triggers load shedding), demand drop (frequency goes UP), cyber attack (cascading trips, no recovery).*
9. **Designed for a Different World** -- One-directional grid architecture (1950s) [GridFlowDemo] [LERENZO]
   > *LERENZO: "Power Plants, Transmission, Distribution, Homes. One direction. Few large producers. Passive consumers. Designed in the 1950s. No flexibility built in."*
10. **The Old Playbook** -- Peakers, spinning reserves, load shedding, curtailment [WIP] [LERENZO]
    > *LERENZO: "How did we manage this for 70 years? Peaker plants: 261 GW sitting idle 95% of the year. Spinning reserves: generators running at partial load 24/7 burning fuel to produce nothing. Load shedding: deliberate blackouts as policy -- Texas shed 20 GW, $16B in overcharges (Potomac Economics). Curtailment: too much sun? Turn it off. Germany threw away 19 TWh in 2023."*
11. **Why Texas Failed** -- Gas-electric death spiral, 6-step cascade [LERENZO]
    > *LERENZO: "The gas-electric death spiral -- a cascading feedback loop. Cold hits, generators freeze, load shedding cuts power to gas pipelines, more generators lose fuel. Steps 4-6 are the death spiral -- it accelerates. 52,000 MW offline out of 107,000. ERCOT is isolated -- no interconnection to call for help."*
12. **Not an Isolated Incident** -- Timeline of grid failures (2003-2026) [LERENZO]
    > *LERENZO: "This isn't a Texas problem -- it's a grid architecture problem. 10 major failures in 23 years across 3 continents. 2003 Northeast US: 55 million people, $6B. 2016 South Australia: entire state. Spain/Portugal 2025: 60 million people. Berlin arson 2025: three attacks, 45K+ homes. The common thread? Centralized, inflexible, cascading."*
13. **No flexibility.** -- Bridge slide to renewables [LERENZO]
    > *LERENZO: "Every one of these failures shares one root cause: no flexibility." Pause. Let that land. "Now imagine adding the most variable energy source in history."*

### The Renewable Revolution (Part II)
14. **The Renewable Revolution** -- Section title, "inevitable, amazing, problematic" [MARIO]
    > *MARIO: "Inevitable, amazing -- and a whole new kind of problem."*
15. **The Renewable Explosion** -- Germany renewable growth chart [RenewableGrowthChart] [MARIO]
    > *MARIO: "Germany's renewable share -- this is exponential growth. Already over 50% of electricity generation. This is not slowing down. Every country is on this curve."*
16. **The Duck Curve Problem** -- Year-by-year with real EUR/MWh prices + cumulative stats [DuckCurveChart] [MARIO]
    > *MARIO: "Solar floods the grid at midday -- prices collapse. Sunset: demand ramps steeply, solar disappears. This belly gets deeper every year as more solar comes online. The grid needs ramping capacity it doesn't have."*
17. **Clean Energy Has Outgrown the Grid** -- Cumulative curtailment bar chart 2015-2024 [CurtailmentChart] [MARIO]
    > *MARIO: "Germany paid EUR 554 million to generators to NOT produce electricity. 9.3 TWh curtailed -- enough to power 2.7 million homes. 49% of congestion is at the local distribution level -- rooftop solar overwhelming neighborhood transformers. New long-distance cables don't fix this. You need local flexibility. A VPP could be the buyer of last resort -- charge batteries, pre-heat buildings, shift EV charging."*

### The Virtual Power Plant (Part III)
18. **Consumers Become Infrastructure** -- Homes as power plants [ConsumerIcons] [MARIO]
    > *MARIO: "Your roof becomes a power plant. Your garage becomes a grid asset. Your house becomes a node in the largest distributed system ever built. But coordinating millions of these devices? That's a distributed systems problem."*
19. **The Virtual Power Plant** -- Section title, "software as grid infrastructure" [LERENZO]
    > *LERENZO: "Software that turns distributed energy into grid infrastructure."*
20. **What Is a Virtual Power Plant?** -- Animated VPP architecture flow [VPPArchitecture] [LERENZO]
    > *LERENZO: "Left: devices -- solar panels, batteries, EV chargers, heat pumps. Center: cloud platform -- Kubernetes + Dapr, event-driven control. Right: services -- frequency regulation, peak shaving, energy arbitrage, demand response. Software that aggregates and operates millions of devices as one coordinated power plant."*
21. **Inside the Architecture** -- Cyclic data flow diagram [EnpalArchitectureDiagram] [LERENZO]
    > *LERENZO: "Each home has devices -- heat pump, PV, battery -- connected to an IoT hub. The IoT hub connects via EMQX, our MQTT broker. We ingest measurement telemetry every 20 seconds, all Protobuf schemas. Data flows into Databricks -- raw, then bronze, silver, gold layers -- classic lakehouse. Apache Spark streaming aggregates give us near-real-time pattern detection. The control loop: VPP controller dispatches to the local HEMS via our WISH protocol. The clever use of streaming aggregates on Databricks is helping us substantially reduce costs while maintaining low latency for real-time grid response."*
22. **The Architecture Parallel** -- Traditional grid vs VPP, Kubernetes analogy [LERENZO]
    > *LERENZO: "Traditional grid = monolithic. VPP = microservices. Draw the parallel: Frequency = your SLO. Cascade = failure propagation. Batteries = autoscaling. You already think in these terms every day."*
23. **How a VPP Responds to Grid Events** -- FCR, aFRR, peak shaving, energy arbitrage + response timeline + costs [LERENZO]
    > *LERENZO: "Different timescales, different strategies. FCR in under 30 seconds. Arbitrage scheduled day-ahead. And the speed: Coal takes 2-6 hours. Gas: 10-30 minutes. Hydro: 15-30 seconds. Battery: 140 milliseconds. A battery responds before a gas turbine even knows there's an emergency."*
24. **Energy Arbitrage + Peak Shaving** -- Full-screen Berlin map HUD, 6-step summer scenario [VPPScenarioSlide] [LERENZO]
    > *LERENZO: Walk through each step. "Sunny July. 53,000 homes. Midday -- prices collapse. Flexa holds batteries empty on purpose. Prices go negative -- charge everything. Solar curtailed, batteries and EVs charging from the grid at negative prices, heat pumps pre-heating homes to bank cheap energy. Evening -- discharge at peak. Revenue earned. Grid peaks softened."*
25. **SA Virtual Power Plant, 2019** -- Full-screen South Australia VPP map, 1,100 homes [SAMapHUD] [LERENZO]
    > *LERENZO: "South Australia proved this works. 1,100 homes with Tesla Powerwalls -- the world's first proof that distributed batteries can stabilize a grid at scale."*
26. **The Economic Impact of Flexibility** -- With vs Without VPP comparison across 5 metrics [MARIO]
    > *MARIO: "Side by side. Without a VPP: cascade failures, gas peakers at EUR 300/MWh, EUR 554M/yr curtailment, EUR 35B in grid upgrades. With a VPP: stabilized in 200ms, batteries at EUR 30-60/MWh, revenue from negative prices, 60% deferred infrastructure. The cheapest megawatt is the one you never have to generate."*

### Closing
27. **Back to Texas** -- Revisit 4:37, 10 GW distributed batteries [LERENZO]
    > *LERENZO: "Remember those 4 minutes and 37 seconds? With 10 GW of distributed batteries responding in 140 milliseconds, there is no cascade. The frequency never drops. The gas plants never need to save you. Because 1 million homes already did."*
28. **Thank You** -- Closing slide with animated home network, Enpal branding [ThankYouBackground] [LERENZO]
    > *LERENZO: "Enpal -- building Europe's largest virtual power plant. Thank you."*

### Appendix
- **Appendix** -- Title slide
- **SA Blackout, 2016** -- Full-screen South Australia blackout map [SAMapHUD]
- **Winter Grid Emergency** -- Full-screen Berlin map HUD, 5-step winter scenario [VPPScenarioSlide]
- **The Economic Impact of Flexibility** -- RMI Power Shift, Brattle VPP savings [WIP]
- **Now We Shift the Load** -- Duck curve with VPP battery load shifting [DuckCurveVPP]
- **The Dunkelflaute** -- Dark doldrums: wind+solar collapse, Germany Nov 2024. "14 consecutive days below 10% renewable capacity. Wind at 3.8% of installed capacity. Prices spiked to EUR 175/MWh -- 4x average."
- **Demand Response in Action** -- Interactive demo [DemandResponseDemo] [WIP]
- **References** -- Sources and citations
