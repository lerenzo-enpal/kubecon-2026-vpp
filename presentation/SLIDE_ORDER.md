# Slide Order — KubeCon 2026 VPP

Reorder by cutting/pasting lines. Tell Claude the new order and it will update Presentation.jsx.

## Current Order (40 slides)

### Opening
1. **What is a Virtual Power Plant?** — Title slide with KubeCon/Enpal branding [StaticTexasGrid]
2. **Agenda** — Four-part agenda with timing

### The Grid (Part I)
3. **The Grid** — Section title, "world's largest machine"
4. **Texas Cascade HUD** — Full-screen Texas blackout map [TexasMapHUD]
5. **"4 minutes and 37 seconds"** — Texas crisis stats: deaths, damage, homes [AnimatedStat]
6. **Running the Largest Machine (Zoom)** — Animated factory→EU zoom-out [versionD + LargestMachineZoom]
7. **EU Grid HUD** — Full-screen European grid visualization [EUGridHUD]
8. **The Grid: A Balancing Act** — Interactive frequency with scenarios [FrequencyDemo]
9. **Designed for a Different World** — One-directional grid architecture (1950s)
10. **The Old Playbook** — Peakers, spinning reserves, load shedding, curtailment
11. X **The Grid vs. Tech Infrastructure** — 4-row comparison: grid vs software [versionB] — DEPRECATED
12. **Why Texas Failed** — Gas-electric death spiral, 6-step cascade
13. **It Keeps Happening** — Timeline of 8 grid failures (2003–2026)
14. **Every Cascade Shares Three Properties** — Coupled, no reserves, blind
15. **No flexibility.** — Bridge slide to renewables

### The Renewable Revolution (Part II)
16. **Demand Response in Action** — Interactive demand response demo [DemandResponseDemo]
17. **The Renewable Revolution** — Section title, "inevitable, amazing, problematic"
18. **The Renewable Explosion** — Germany renewable growth chart [RenewableGrowthChart]
19. **The Duck Curve Problem** — Solar flood, sunset ramp [DuckCurveChart]
20. **The Dunkelflaute** — Dark doldrums: wind+solar collapse, Germany Nov 2024
21. **Energy Being Thrown Away** — Negative price hours 2021–2024
22. **Clean Energy Has Outgrown the Grid** — Curtailment costs, EUR 554M

### The Virtual Power Plant (Part III)
23. **What If You Could Shift the Load?** — Duck curve with VPP battery [DuckCurveChart]
24. **The Economics of Flexibility** — Hornsdale battery, Australia ISP costs
25. **Consumers Become Infrastructure** — Homes as power plants
26. **The Virtual Power Plant** — Section title, "software as grid infrastructure"
27. **What Is a VPP?** — Architecture diagram: devices→cloud→services
28. **The Fastest Power Plant** — Response time bars: coal vs gas vs battery
29. X **Hornsdale, December 2017** — 140ms battery response proof [FrequencyLine] — DEPRECATED
30. X **SA Virtual Power Plant, 2019** — 1,100 homes, 0 humans — DEPRECATED
31. **The Architecture Parallel** — Traditional grid vs VPP, Kubernetes analogy

### Resilience (Part IV)
32. **Resilience** — Section title, "future grid, your skills"
33. **Cascading Failure — No VPP** — Live cascade simulation [CascadeSimulation]
34. **Same Failure — With VPP** — Same scenario, VPP saves it [CascadeSimulation]
35. **Back to Texas** — Revisit 4:37, 10GW distributed batteries
36. **The Future Grid** — Millions of devices, "grid becomes software"
37. **Final Takeaway** — VPPs as reliable infrastructure, cloud-native

### Tech Deep-Dive / Closing
38. **Kepler: How Much Power Does Our VPP Use?** — eBPF energy dashboard [KeplerDashboard]
39. **The VPP Practices What It Preaches** — Carbon-aware scheduling [CarbonAwareChart]
40. **Thank You** — Closing slide, Enpal branding
