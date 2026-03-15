# Slide Order — KubeCon 2026 VPP

Reorder by cutting/pasting lines. Tell Claude the new order and it will update Presentation.jsx.

## Current Order (42 slides)

### Opening
1. **What is a Virtual Power Plant?** — Title slide with KubeCon/Enpal branding [StaticTexasGrid]
2. **Agenda** — Four-part agenda with timing

### The Grid (Part I)
3. **The Grid** — Section title, "world's largest machine"
4. **About Texas** — Placeholder intro slide
5. **Texas Cascade HUD** — Full-screen Texas blackout map [TexasMapHUD]
6. **"4 minutes and 37 seconds"** — Texas crisis stats: deaths, damage, homes [AnimatedStat]
7. **Running the Largest Machine (Zoom)** — Animated factory→EU zoom-out [versionD + LargestMachineZoom]
8. **EU Grid HUD** — Full-screen European grid visualization [EUGridHUD]
9. **The Grid: A Balancing Act** — Interactive frequency with ENTSO-E thresholds, event scenarios [FrequencyDemo]
10. **Designed for a Different World** — One-directional grid architecture (1950s)
11. **The Old Playbook** — Peakers, spinning reserves, load shedding, curtailment
12. X **The Grid vs. Tech Infrastructure** — 4-row comparison: grid vs software [versionB] — DEPRECATED
13. **Why Texas Failed** — Gas-electric death spiral, 6-step cascade
14. **Not an Isolated Incident** — Timeline of 10 grid failures (2003–2026)
15. X **Every Cascade Shares Three Properties** — Coupled, no reserves, blind — DEPRECATED
16. **No flexibility.** — Bridge slide to renewables

### The Renewable Revolution (Part II)
17. **Demand Response in Action** — Interactive demo, "Still in Infancy" [DemandResponseDemo]
18. **The Renewable Revolution** — Section title, "inevitable, amazing, problematic"
19. **The Renewable Explosion** — Germany renewable growth chart [RenewableGrowthChart]
20. **The Duck Curve Problem** — Solar flood, sunset ramp [DuckCurveChart]
21. X **Energy Being Thrown Away** — Curtailment stats — DEPRECATED
22. **Clean Energy Has Outgrown the Grid** — Curtailment costs, EUR 554M

### The Virtual Power Plant (Part III)
23. **What If You Could Shift the Load?** — Duck curve with VPP battery [DuckCurveChart]
24. **The Impact of Flexibility** — RMI Power Shift (ERCOT, modeled), Brattle VPP savings (projected)
25. **Consumers Become Infrastructure** — Homes as power plants
26. **The Virtual Power Plant** — Section title, "software as grid infrastructure"
27. X **Hornsdale, December 2017** — 140ms battery response proof [FrequencyLine] — DEPRECATED
28. **The Architecture Parallel** — Traditional grid vs VPP, Kubernetes analogy
29. **What Is a VPP?** — Architecture diagram: devices→cloud→services
30. **How It Works** — Animated VPP architecture flow: Market→Trader→Controller→Kafka→Enpal→Homes [VPPArchitecture]
31. **The Fastest Power Plant** — Response time bars: coal vs gas vs battery
32. X **SA Virtual Power Plant, 2019** — 1,100 homes, 0 humans — DEPRECATED

### Resilience (Part IV)
33. **Resilience** — Section title, "future grid, your skills"
34. **Cascading Failure — No VPP** — Live cascade simulation [CascadeSimulation]
35. **Same Failure — With VPP** — Same scenario, VPP saves it [CascadeSimulation]
36. **Back to Texas** — Revisit 4:37, 10GW distributed batteries
37. **The Future Grid** — Millions of devices, "grid becomes software"
38. **Final Takeaway** — VPPs as reliable infrastructure, cloud-native

### Tech Deep-Dive / Closing
39. **Kepler: How Much Power Does Our VPP Use?** — eBPF energy dashboard [KeplerDashboard]
40. **The VPP Practices What It Preaches** — Carbon-aware scheduling [CarbonAwareChart]
41. **Thank You** — Closing slide, Enpal branding

### Appendix
42. **The Dunkelflaute** — Dark doldrums: wind+solar collapse, Germany Nov 2024
