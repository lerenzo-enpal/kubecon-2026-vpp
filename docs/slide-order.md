# Slide Order

### Opening
1. **What is a Virtual Power Plant?** -- Title slide with KubeCon/Enpal branding [ThankYouBackground]
2. **Speakers & Partners** -- LeRenzo + Mario photos, Enpal/Databricks/Entrix logos [SHARED]
3. **Agenda** -- Three-part agenda with timing, clickable section links + appendix [SHARED]

### The Grid (Part I)
4. **The Grid** -- Section title, "world's largest machine" [LERENZO]
5. **Texas Cascade HUD** -- Full-screen Texas map with delayed HUD reveal [TexasMapHUD] [LERENZO]
6. **"4 minutes and 37 seconds"** -- Texas crisis stats [LERENZO]
7. **Grid Scale** -- Animated factory-to-EU zoom-out [GridScale] [MARIO]
8. **Designed for a Different World** -- One-directional grid (1950s) [GridFlowDemo] [LERENZO]
9. **EU Grid HUD** -- Full-screen European grid visualization [EUGridHUD] [MARIO]
10. **The Grid: Balanced at 0.67c** -- Frequency intro walkthrough (4 steps) [FrequencyWalkthrough/intro] [MARIO]
11. **Tools for Balancing the Grid** -- Frequency degradation scenarios (3 steps) [FrequencyWalkthrough/scenarios] [MARIO]
12. **Balancing the Grid - In Action** -- Interactive frequency demo [FrequencyDemo] [MARIO]
13. **Balancing the Grid is Expensive** -- Peakers, reserves, congestion, curtailment (4 steps) [LERENZO]
14. **Why Texas Failed** -- Gas-electric death spiral [MARIO]
15. **Not an Isolated Incident** -- Timeline of grid failures (2003-2026) [LERENZO]
16. **Limited Flexibility** -- Bridge slide to renewables [LERENZO]

### The Renewable Revolution (Part II)
17. **The Renewable Revolution** -- Section title [LERENZO]
18. **The Renewable Explosion** -- Germany renewable growth chart [RenewableGrowthChart] [MARIO]
19. **The Duck Curve Problem** -- Year-by-year with EUR/MWh prices [DuckCurveChart] [MARIO]
20. **Clean Energy Has Outgrown the Grid** -- Curtailment chart (4 steps) [CurtailmentChart] [MARIO]

### The Virtual Power Plant (Part III)
21. **The Solution Is Already Installed** -- Bridge: flexibility + hardware [MARIO]
22. **Homes Become Infrastructure** -- Solar/batteries can charge, export, shift [MARIO]
23. **The Virtual Power Plant** -- Section title [LERENZO]
24. **What Is a Virtual Power Plant?** -- Animated VPP architecture with interactive drawer (3 steps) [VPPArchitecture] [LERENZO]
25. **Inside the Architecture -- Explorer** -- Full-screen zoomable architecture (4 steps) [ArchitectureExplorer] [LERENZO]
26. **Event-Driven Control Plane** -- Choreography visualization with Dapr actors [ChoreographyLoop] [LERENZO]
27. **Progressive Aggregation** -- Aggregation pyramid: 20s→1min→5min→15min→1hr→24hr [AggregationPyramid] [LERENZO]
28. **The Architecture Parallel** -- Traditional grid vs VPP, Kubernetes analogy [LERENZO]
29. **How a VPP Responds to Grid Events** -- FCR, aFRR, peak shaving, arbitrage + response timeline (2 steps) [LERENZO]
30. **Energy Arbitrage + Peak Shaving** -- Full-screen Berlin map HUD, summer scenario [VPPScenarioSlide] [LERENZO]
31. **SA Virtual Power Plant** -- Full-screen South Australia VPP map [SAMapHUD] [LERENZO]
32. **The Economic Impact of Flexibility** -- With vs Without VPP comparison, 5 metrics (5 steps) [MARIO]

### Closing
33. **Back to Texas** -- Revisit 4:37, 10 GW distributed batteries [LERENZO]
34. **Thank You** -- Closing slide with animated home network, Enpal branding [ThankYouBackground] [LERENZO]

### Appendix
- **Appendix** -- Title slide
- **SA Blackout, 2016** -- Full-screen South Australia blackout map [SAMapHUD]
- **Winter Grid Emergency** -- Full-screen Berlin map HUD, winter scenario [VPPScenarioSlide]
- **Now We Shift the Load** -- Duck curve with VPP battery load shifting [DuckCurveVPP]
- **The Dunkelflaute** -- Dark doldrums: wind+solar collapse, Germany Nov 2024
- **Demand Response in Action** -- Interactive demo [DemandResponseDemo] [WIP]
- **References** -- Sources and citations

### Japan Main Talk (26 core slides)

#### Orientation (3)
1. **Japan needs flexibility** -- Promise
2. **One question for this talk** -- Framing
3. **Japan cannot borrow** -- Island system, 50/60 Hz seam, FY2023 primary-energy self-sufficiency, and thin-flexibility premise

#### Proof 1: Make renewables usable (7)
4. **Make renewables usable** -- Solar timing mismatch
5. **One day: the flexibility problem** -- Morning → noon surplus → evening ramp
6. **A real noon operating constraint** -- Kyushu T&D: 5.09 GW maximum renewable-output control, 4 May 2025, 12:00–12:30
7. **Generation and demand miss each other** -- Clean supply and demand arrive at different times
8. **One day: coordinated response** -- Illustrative EV, heat-pump, and battery response
9. **Store it for later** -- Shift energy and demand into useful windows
10. **A Japanese platform for that flexibility** -- Sourced Shizen Connect platform context; not a performance result

#### Proof 2: Respond at grid speed (6)
11. **Respond at grid speed** -- Failure-response trigger
12. **ERAB connects assets to a market context** -- Policy and market context
13. **A city is a graph problem** -- Observable devices, homes, substations, markets, and constraints
14. **The VPP is a cloud-native control plane** -- Architecture mechanism
15. **Choreography keeps response close to the edge** -- Local autonomy plus coordinated intent
16. **One response loop, end to end** -- Observable control path; FrequencyDemo moves to the technical appendix

#### Proof 3: Use demand smarter (6)
17. **Use demand smarter** -- Daily demand flexibility
18. **EVs can become controllable capacity** -- Shizen Connect January 2024 V2H demonstration
19. **HEMS can coordinate the home** -- Kansai Electric/Shizen Connect technical-feasibility demonstration
20. **Aggregation makes a fleet legible** -- Device-to-portfolio visibility
21. **Simulated dispatch** -- Explicitly simulated Japan coordination mechanics
22. **Illustrative portfolio response** -- Simulated fleet response, not a reported company outcome

#### Return (4)
23. **What cloud-native teams can build** -- Implementation patterns
24. **Homes become a power plant when software earns trust** -- Trusted capacity without a fixed household equivalence
25. **Keep exploring** -- Research, case notes, and technical appendix
26. **Japan needs flexibility** -- Return to the promise
