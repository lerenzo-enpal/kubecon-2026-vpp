# Slide Order — KubeCon 2026 VPP

Reorder by cutting/pasting lines. Tell Claude the new order and it will update Presentation.jsx.

## Current Order (42 slides)

### Opening
1. **What is a Virtual Power Plant?** — Title slide with KubeCon/Enpal branding [StaticTexasGrid]
2. **Agenda** — Four-part agenda with timing

### The Grid (Part I)
3. **The Grid** — Section title, "world's largest machine"
4. **Texas Cascade HUD** — Full-screen Texas blackout map [TexasMapHUD]
5. **"4 minutes and 37 seconds"** — Texas crisis stats: deaths, damage, homes [AnimatedStat]
7. **Review: Option A** — Internal review label - PLEASE REMOVE
8. **Running the Largest Machine** — EU grid stats vs VW Wolfsburg [versionA]
9. **Running the Largest Machine (Zoom)** — Animated factory→EU zoom-out [versionD + LargestMachineZoom]
11. **EU Grid HUD** — Full-screen European grid visualization [EUGridHUD]
12. **The Grid: A Balancing Act** — Interactive frequency with scenarios [FrequencyDemo]

6. **Why Texas Failed** — Gas-electric death spiral, 6-step cascade
15. **Designed for a Different World** — One-directional grid architecture (1950s)

13. **The Old Playbook** — Peakers, spinning reserves, load shedding, curtailment
10. **The Grid vs. Tech Infrastructure** — 4-row comparison: grid vs software [versionB]
16. **It Keeps Happening** — Timeline of 8 grid failures (2003–2026)
17. **Every Cascade Shares Three Properties** — Coupled, no reserves, blind
18. **No flexibility.** — Bridge slide to renewables


### The Renewable Revolution (Part II)
14. **Demand Response in Action** — Interactive demand response demo [DemandResponseDemo]
19. **The Renewable Revolution** — Section title, "inevitable, amazing, problematic"
20. **The Renewable Explosion** — Germany renewable growth chart [RenewableGrowthChart]
21. **The Duck Curve Problem** — Solar flood, sunset ramp [DuckCurveChart]
22. **The Dunkelflaute** — Dark doldrums: wind+solar collapse, Germany Nov 2024
23. **Energy Being Thrown Away** — Negative price hours 2021–2024
24. **Clean Energy Has Outgrown the Grid** — Curtailment costs, EUR 554M

### The Virtual Power Plant (Part III)
25. **What If You Could Shift the Load?** — Duck curve with VPP battery [DuckCurveChart]
26. **The Economics of Flexibility** — Hornsdale battery, Australia ISP costs
27. **Consumers Become Infrastructure** — Homes as power plants
28. **The Virtual Power Plant** — Section title, "software as grid infrastructure"
29. **What Is a VPP?** — Architecture diagram: devices→cloud→services
30. **The Fastest Power Plant** — Response time bars: coal vs gas vs battery
31. X **Hornsdale, December 2017** — 140ms battery response proof [FrequencyLine]
32. X **SA Virtual Power Plant, 2019** — 1,100 homes, 0 humans
33. **The Architecture Parallel** — Traditional grid vs VPP, Kubernetes analogy

### Resilience (Part IV)
36. **Resilience** — Section title, "future grid, your skills"
34. **Cascading Failure — No VPP** — Live cascade simulation [CascadeSimulation]
35. **Same Failure — With VPP** — Same scenario, VPP saves it [CascadeSimulation]
37. **Back to Texas** — Revisit 4:37, 10GW distributed batteries
38. **The Future Grid** — Millions of devices, "grid becomes software"
39. **Final Takeaway** — VPPs as reliable infrastructure, cloud-native

### Tech Deep-Dive / Closing
40. **Kepler: How Much Power Does Our VPP Use?** — eBPF energy dashboard [KeplerDashboard]
41. **The VPP Practices What It Preaches** — Carbon-aware scheduling [CarbonAwareChart]
42. **Thank You** — Closing slide, Enpal branding
