# Slide Order

### Opening
1. **Virtual Power Plants** -- Title slide with KubeCon/Enpal branding [StaticTexasGrid]
   > *Speaker: Set the stage. "Cloud-native infrastructure for the energy grid." Pause. Let the title land.*
2. **Agenda** -- Four-part agenda with timing
   > *Speaker: Quick roadmap. "We'll cover the grid, renewables, VPPs, and the architecture. 35 minutes."*

### The Grid (Part I)
3. **The Grid** -- Section title, "world's largest machine"
   > *Speaker: "The grid is the largest machine ever built. And it's more fragile than you think."*
4. **Texas Cascade HUD** -- Full-screen Texas blackout map [TexasMapHUD]
   > *Speaker: Let the map speak. Walk through the cascade timeline. "February 2021. Texas."*
5. **"4 minutes and 37 seconds"** -- Texas crisis stats: deaths, damage, homes [AnimatedStat]
   > *Speaker: "That's how close the entire Texas grid came to a collapse that would have taken months to rebuild. 246 people died. $195 billion in damage."*
6. **Grid Scale** -- Animated factory-to-EU zoom-out [versionD]
   > *Speaker: "Now zoom out. This isn't just a Texas problem."*
7. **EU Grid HUD** -- Full-screen European grid visualization [EUGridHUD]
   > *Speaker: "305,000 km of high-voltage lines. 400 million people. 36 countries. One synchronized frequency."*
8. **The Grid: A Balancing Act** -- Interactive frequency with ENTSO-E thresholds [FrequencyDemo]
   > *Speaker: Interactive demo. Drag the frequency. "50 Hz. Always. If this drops below 47.5, equipment disconnects to protect itself. That's a blackout."*
9. **Designed for a Different World** -- One-directional grid architecture (1950s) [GridFlowDemo]
   > *Speaker: "The grid was designed in the 1950s. Big plants, one-way flow, predictable demand. None of that is true anymore."*
10. **The Old Playbook** -- Peakers, spinning reserves, load shedding, curtailment [WIP]
    > *Speaker: "When demand spikes, we fire up expensive gas turbines. When supply exceeds demand, we literally throw away clean energy."*
11. **Why Texas Failed** -- Gas-electric death spiral, 6-step cascade
    > *Speaker: Walk through the 6 steps. "Gas pipes froze. Gas plants couldn't run. Electric compressors couldn't pump gas. A death spiral."*
12. **Not an Isolated Incident** -- Timeline of grid failures (2003-2026)
    > *Speaker: "This keeps happening. Northeast US, Italy, South Australia, Texas, India, Iberia. The grid is failing repeatedly."*
13. **No flexibility.** -- Bridge slide to renewables
    > *Speaker: Dramatic pause. "Every one of these failures shares one root cause: no flexibility. Now imagine adding the most variable energy source in history."*

### The Renewable Revolution (Part II)
14. **The Renewable Revolution** -- Section title, "inevitable, amazing, problematic"
    > *Speaker: "Renewables are inevitable. They're amazing. And they're breaking the grid."*
15. **The Renewable Explosion** -- Germany renewable growth chart [RenewableGrowthChart]
    > *Speaker: "Germany went from 6% renewable to over 50% in 25 years. The growth is exponential."*
16. **The Duck Curve Problem** -- Year-by-year with real EUR/MWh prices + cumulative stats [DuckCurveChart]
    > *Speaker: "Watch the belly deepen each year. Midday prices go negative — we're paying people to consume electricity. Evening ramps get steeper."*
17. **Clean Energy Has Outgrown the Grid** -- Cumulative curtailment bar chart 2015-2024 [CurtailmentChart]
    > *Speaker: "65.7 TWh of clean energy wasted since 2015. Enough to power 2.7 million homes every year. EUR 6 billion in compensation paid to generators to NOT produce."*

### The Virtual Power Plant (Part III)
18. **Consumers Become Infrastructure** -- Homes as power plants [ConsumerIcons]
    > *Speaker: "But what if consumers weren't just consumers? Roofs become power plants. EVs become grid assets. Homes become nodes."*
19. **The Virtual Power Plant** -- Section title, "software as grid infrastructure"
    > *Speaker: "Software that turns distributed energy into grid infrastructure."*
20. **What Is a Virtual Power Plant?** -- Architecture diagram: devices -> cloud -> services
    > *Speaker: "A VPP aggregates thousands of distributed devices — solar, batteries, EVs, heat pumps — and operates them as one coordinated power plant."*
21. **How a VPP Responds to Grid Events** -- FCR, aFRR, peak shaving, energy arbitrage + response timeline
    > *Speaker: "Different timescales, different strategies. FCR in under 30 seconds. Arbitrage scheduled day-ahead. And look at the response time — a battery responds in 140ms. Coal takes 2 hours."*
22. **Summer Arbitrage** -- Full-screen Berlin map HUD, 6-step summer scenario [VPPScenarioMapSlide]
    > *Speaker: Walk through each step. "Sunny July morning. 8,200 homes generating solar. Midday — prices collapse. Flexa holds batteries empty on purpose. Prices go negative — charge everything. Evening — discharge at peak prices. Revenue earned. Grid peaks softened."*
23. **Winter Grid Emergency** -- Full-screen Berlin map HUD, 5-step winter scenario [VPPScenarioMapSlide]
    > *Speaker: "Cold January. 800MW generator trips offline. Frequency drops. 200 milliseconds later, Flexa responds. 12,000 homes respond as one. 15 MW freed. Zero humans involved."*

### The Architecture
24. **The Architecture** -- Sub-section title
    > *Speaker: "Now let's look under the hood. How do you actually build this?"*
25. **How It Works** -- Animated VPP architecture flow [VPPArchitecture]
    > *Speaker: "From market signal to battery response — the full command flow through our architecture."*
26. **Inside the Architecture** -- Cyclic data flow diagram [EnpalArchitectureDiagram]
    > *Speaker: "Telemetry flows in. Optimization runs. Commands flow out. Cyclic, real-time, distributed."*
27. **The Architecture Parallel** -- Traditional grid vs VPP, Kubernetes analogy
    > *Speaker: "If you squint, a VPP looks a lot like Kubernetes. The grid operator is the control plane. Homes are nodes. Devices are pods. Flexa is the scheduler."*
28. **The Economic Impact of Flexibility** -- RMI Power Shift, Brattle VPP savings [WIP]
    > *Speaker: "This isn't theoretical. RMI estimates VPPs can defer $35B in grid infrastructure. Brattle Group shows 60% cost savings vs peaker plants."*

### South Australia Case Study
29. **SA Blackout, 2016** -- Full-screen South Australia blackout map [SAMapHUD]
    > *Speaker: "September 2016. South Australia. A storm takes out transmission towers. The entire state goes dark."*
30. **SA Virtual Power Plant, 2019** -- 1,100 homes, Hornsdale proof [SAMapHUD]
    > *Speaker: "Three years later, 1,100 homes with Tesla Powerwalls. The world's first proof that this works at grid scale."*

### Closing
31. **Back to Texas** -- Revisit 4:37, 10 GW distributed batteries
    > *Speaker: "Remember those 4 minutes and 37 seconds? With 10 GW of distributed batteries responding in 140 milliseconds, there is no cascade. Because 1 million homes already did."*
32. **Thank You** -- Closing slide, Enpal branding
    > *Speaker: "Enpal — building Europe's largest virtual power plant. Thank you."*

### Appendix
33. **Now We Shift the Load** -- Duck curve with VPP battery load shifting [DuckCurveVPP]
34. **The Dunkelflaute** -- Dark doldrums: wind+solar collapse, Germany Nov 2024
35. **Demand Response in Action** -- Interactive demo [DemandResponseDemo] [WIP]
