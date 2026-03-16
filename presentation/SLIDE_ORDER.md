# Slide Order — KubeCon 2026 VPP

Reorder by cutting/pasting lines. Tell Claude the new order and it will update Presentation.jsx.

## Current Order (35 slides)

### Opening
1. **What is a Virtual Power Plant?** — Title slide with KubeCon/Enpal branding [StaticTexasGrid]
2. **Agenda** — Four-part agenda with timing

### The Grid (Part I)
3. **The Grid** — Section title, "world's largest machine"
4. **Texas Cascade HUD** — Full-screen Texas blackout map [TexasMapHUD]
5. **"4 minutes and 37 seconds"** — Texas crisis stats: deaths, damage, homes [AnimatedStat]
6. **Grid Scale** — Animated factory-to-EU zoom-out [versionD]
7. **EU Grid HUD** — Full-screen European grid visualization [EUGridHUD]
8. **The Grid: A Balancing Act** — Interactive frequency with ENTSO-E thresholds, event scenarios [FrequencyDemo]
9. **Designed for a Different World** — One-directional grid architecture (1950s) [GridFlowDemo]
10. **The Old Playbook** — Peakers, spinning reserves, load shedding, curtailment [WIP]
11. **Why Texas Failed** — Gas-electric death spiral, 6-step cascade
12. **Not an Isolated Incident** — Timeline of grid failures (2003-2026)
13. **No flexibility.** — Bridge slide to renewables

### The Renewable Revolution (Part II)
14. **The Renewable Revolution** — Section title, "inevitable, amazing, problematic"
15. **The Renewable Explosion** — Germany renewable growth chart [RenewableGrowthChart]
16. **The Duck Curve Problem** — Solar flood, sunset ramp, year-by-year with real EUR/MWh prices [DuckCurveChart]
17. **The Cost of Wasted Energy** — Cumulative curtailment bar chart 2015-2024 [CurtailmentChart]
18. **Clean Energy Has Outgrown the Grid** — Curtailment costs, EUR 554M, distribution congestion

### The Virtual Power Plant (Part III)
19. **Consumers Become Infrastructure** — Homes as power plants [ConsumerIcons]
20. **The Virtual Power Plant** — Section title, "software as grid infrastructure"
21. **What Is a Virtual Power Plant?** — Architecture diagram: devices → cloud → services
22. **The Fastest Power Plant** — Response time bars: coal vs gas vs hydro vs battery
23. **How a VPP Responds to Grid Events** — FCR, aFRR, peak shaving, energy arbitrage
24. **Now We Shift the Load** — Duck curve with VPP battery load shifting [DuckCurveVPP]
25. **The Architecture** — Sub-section title
26. **How It Works** — Animated VPP architecture flow: Market → Trader → Controller → Enpal → Homes [VPPArchitecture]
27. **Inside the Architecture** — Cyclic data flow: Devices → IoT Hub → EMQX → Databricks → Spark → Flexa [EnpalArchitectureDiagram]
28. **The Architecture Parallel** — Traditional grid vs VPP, Kubernetes analogy
29. **The Economic Impact of Flexibility** — RMI Power Shift (ERCOT), Brattle VPP savings [WIP]

### South Australia Case Study
30. **SA Blackout, 2016** — Full-screen South Australia blackout map [SAMapHUD]
31. **SA Virtual Power Plant, 2019** — 1,100 homes, Hornsdale proof [SAMapHUD]

### Closing
32. **Back to Texas** — Revisit 4:37, 10 GW distributed batteries, "1 million homes already did"
33. **Thank You** — Closing slide, Enpal branding

### Appendix
34. **The Dunkelflaute** — Dark doldrums: wind+solar collapse, Germany Nov 2024
35. **Demand Response in Action** — Interactive demo [DemandResponseDemo] [WIP]
