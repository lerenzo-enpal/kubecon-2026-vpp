# Slide Order

### Opening
1. **What is a Virtual Power Plant?** -- Title slide with KubeCon/Enpal branding, animated home network [ThankYouBackground]
   > *Speaker: Welcome to KubeCon. "I work at Enpal -- we're building Europe's largest virtual power plant. Before we talk about what a VPP is, we need to talk about the thing it's trying to fix."*
2. **Speakers & Partners** -- LeRenzo + Mario photos, Enpal/Databricks/Entrix logos [SHARED]
   > *Speaker: Quick intro -- LeRenzo Tolbert-Malcolm, Staff Engineer VPP. Mario Olivio Flores, Engineering Manager VPP.*
3. **Agenda** -- Four-part agenda with timing, clickable section links [SHARED]
   > *Speaker: "Four parts: The Grid, Renewables, the VPP itself, and Resilience. ~30 minutes total -- we'll go fast. By the end you'll understand why the energy grid is the most exciting distributed systems problem on the planet."*

### The Grid (Part I)
4. **The Grid** -- Section title, "world's largest machine" [LERENZO]
   > *LERENZO: "The world's largest machine -- this isn't hyperbole, we're going to prove it."*
5. **Texas Cascade HUD** -- Full-screen Texas blackout map with delayed HUD reveal [TexasMapHUD] [LERENZO]
   > *LERENZO: "February 2021 -- a polar vortex hits Texas." [ARROW: HUDs appear, map darkens] "Watch the grid go dark, county by county. This is real data -- 4.5 million homes lost power." [ARROW x10: cascade steps]*
6. **"4 minutes and 37 seconds"** -- Texas crisis stats: deaths, damage, homes [LERENZO]
   > *LERENZO: "The Texas grid was 4 minutes and 37 seconds from a total cold-start collapse. 246 people died. $195 billion in damage."*
7. **Grid Scale** -- Animated factory-to-EU zoom-out [GridScale] [MARIO]
   > *MARIO: "The world's largest factory is VW Wolfsburg -- 60,000 workers over 6.5 km2. The European grid: 2.3 million workers across 5.5 million km2. 36 countries, all synchronized on one frequency."*
8. **Designed for a Different World** -- One-directional grid architecture (1950s) [GridFlowDemo] [LERENZO]
   > *LERENZO: "Power Plants, Transmission, Distribution, Homes. One direction. Designed in the 1950s. No flexibility built in."*
9. **EU Grid HUD** -- Full-screen European grid visualization [EUGridHUD] [MARIO]
   > *MARIO: "This is the Continental European grid. 400 million consumers. 1,100 GW of installed capacity. One heartbeat: 50 Hz."*
10. **The Grid: Balanced at 0.67c** -- Frequency intro walkthrough (4 steps) [FrequencyWalkthrough/intro] [MARIO]
    > *MARIO: "50 Hz = supply equals demand. Imbalances propagate at 0.67c." [ARROW x4: supply/demand drop, rise, no buffer, threshold overview]*
11. **Tools for Balancing the Grid** -- Frequency degradation scenarios (3 steps) [FrequencyWalkthrough/scenarios] [MARIO]
    > *MARIO: "What happens when supply and demand diverge." [ARROW x3: normal band, reserves activate, collapse threshold]*
12. **Balancing the Grid - In Action** -- Interactive frequency demo with clickable scenarios [FrequencyDemo] [MARIO]
    > *MARIO: [DEMO] Click scenarios: generator trip, 3 GW loss, demand drop, cyber attack.*
13. **Balancing the Grid is Expensive** -- Peakers, spinning reserves, congestion, curtailment (4 steps) [LERENZO]
    > *LERENZO: "Over EUR 10 billion per year to keep gas turbines on standby, reroute power, and throw away clean energy." [ARROW x4]*
14. **Why Texas Failed** -- Gas-electric death spiral, 6-step cascade [LERENZO]
    > *LERENZO: "The gas-electric death spiral. 52,000 MW offline out of 107,000. ERCOT is isolated."*
15. **Not an Isolated Incident** -- Timeline of grid failures (2003-2026), two columns [LERENZO]
    > *LERENZO: "This isn't a Texas problem -- it's a grid architecture problem. 10 major failures in 23 years across 3 continents."*
16. **Limited Flexibility** -- Bridge slide to renewables [LERENZO]
    > *LERENZO: "Every one of these failures shares one root cause: limited flexibility. Now imagine adding the most variable energy source in history."*

### The Renewable Revolution (Part II)
17. **The Renewable Revolution** -- Section title, "inevitable, amazing, problematic" [MARIO]
    > *MARIO: "Inevitable, amazing -- and a whole new kind of problem."*
18. **The Renewable Explosion** -- Germany renewable growth chart [RenewableGrowthChart] [MARIO]
    > *MARIO: "Germany's renewable share -- this is exponential growth. Already over 50%. Every country is on this curve."*
19. **The Duck Curve Problem** -- Year-by-year with real EUR/MWh prices [DuckCurveChart] [MARIO]
    > *MARIO: "Solar floods the grid at midday -- prices collapse. The belly gets deeper every year."*
20. **Clean Energy Has Outgrown the Grid** -- Cumulative curtailment bar chart (4 steps) [CurtailmentChart] [MARIO]
    > *MARIO: "Germany paid EUR 554 million to NOT produce electricity. 9.3 TWh curtailed. 49% of congestion is at the local distribution level."*

### The Virtual Power Plant (Part III)
21. **The Solution Is Already Installed** -- Bridge: grid needs flexibility, homes already have hardware [MARIO]
    > *MARIO: "The grid needs flexibility. Homes already have the hardware. What if they could work together?"*
22. **Homes Become Infrastructure** -- Homes with solar/batteries can charge, export, shift [MARIO]
    > *MARIO: "Your roof becomes a power plant. Your garage becomes a grid asset. Coordinating millions of these devices? That's a distributed systems problem."*
23. **The Virtual Power Plant** -- Section title, "software as grid infrastructure" [LERENZO]
    > *LERENZO: "Software that turns distributed energy into grid infrastructure."*
24. **What Is a Virtual Power Plant?** -- Animated VPP architecture flow with component blurbs [VPPArchitecture] [LERENZO]
    > *LERENZO: "Energy market sends request, through the trading gateway, to the VPP controller. Controller dispatches to Enpal Cloud, then MQTT to individual homes. Watch the data flow."*
25. **Inside the Architecture** -- Full architecture diagram with data flow [EnpalArchitectureDiagram] [LERENZO]
    > *LERENZO: "Each home has devices connected to an IoT hub. EMQX MQTT broker. Databricks lakehouse. Spark streaming aggregates. The control loop: VPP controller dispatches to the local HEMS via WISH protocol."*
26. **Inside the Architecture -- Explorer** -- Full-screen zoomable architecture (4 steps) [ArchitectureExplorer] [LERENZO]
    > *LERENZO: [ARROW x4] "Home system: Enpal.One edge gateway. MQTT + Choreography. Data pipeline: Databricks + Spark. Flexa control loop: market signal to device in under 2 seconds."*
27. **Event-Driven Control Plane** -- MQTT, Choreography, K8s, ArgoCD, Dapr actors, consistency model [LERENZO]
    > *LERENZO: "Choreography over orchestration. MQTT pub/sub. Dapr actors for per-device state. ArgoCD for GitOps deployment."*
28. **Streaming at Scale** -- Databricks pipeline: Raw/Bronze/Silver/Gold, Spark streaming, key metrics [LERENZO]
    > *LERENZO: "100K+ devices, 5M+ measurements/min. Spark streaming aggregates. Market signal to device in under 2 seconds."*
29. **The Architecture Parallel** -- Traditional grid vs VPP, Kubernetes analogy [LERENZO]
    > *LERENZO: "Frequency = your SLO. Cascade = failure propagation. Batteries = autoscaling. You already think in these terms every day."*
30. **How a VPP Responds to Grid Events** -- FCR, aFRR, peak shaving, arbitrage + response timeline (2 steps) [LERENZO]
    > *LERENZO: "Different timescales, different strategies. FCR under 30 seconds. Battery: 140 milliseconds." [ARROW: events] [ARROW: speed comparison]*
31. **Energy Arbitrage + Peak Shaving** -- Full-screen Berlin map HUD, summer scenario [VPPScenarioSlide] [LERENZO]
    > *LERENZO: "Sunny July. 53,000 homes. Midday prices collapse. Flexa holds batteries empty. Prices go negative -- charge everything. Evening -- discharge at peak."*
32. **SA Virtual Power Plant** -- Full-screen South Australia VPP map [SAMapHUD] [LERENZO]
    > *LERENZO: "South Australia proved this works. ~1,000 homes with Tesla Powerwalls. One of the world's first demonstrations."*
33. **The Economic Impact of Flexibility** -- With vs Without VPP comparison, 5 metrics (5 steps) [MARIO]
    > *MARIO: "Side by side. Without: cascade failures, gas peakers, curtailment. With: stabilized in 200ms, revenue from negative prices. The cheapest megawatt is the one you never have to generate."*

### Closing
34. **Back to Texas** -- Revisit 4:37, 10 GW distributed batteries [LERENZO]
    > *LERENZO: "Remember those 4 minutes and 37 seconds? With 10 GW of distributed batteries responding in 140 milliseconds, there is no cascade. Because 1 million homes already did."*
35. **Thank You** -- Closing slide with animated home network, Enpal branding [ThankYouBackground] [LERENZO]
    > *LERENZO: "Enpal -- building Europe's largest virtual power plant. Thank you."*

### Appendix
- **Appendix** -- Title slide
- **SA Blackout, 2016** -- Full-screen South Australia blackout map [SAMapHUD]
- **Winter Grid Emergency** -- Full-screen Berlin map HUD, 5-step winter scenario [VPPScenarioSlide]
- **The Economic Impact of Flexibility** -- RMI Power Shift, Brattle VPP savings [WIP]
- **Now We Shift the Load** -- Duck curve with VPP battery load shifting [DuckCurveVPP]
- **The Dunkelflaute** -- Dark doldrums: wind+solar collapse, Germany Nov 2024
- **Demand Response in Action** -- Interactive demo [DemandResponseDemo] [WIP]
- **References** -- Sources and citations
