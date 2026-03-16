# Speaker Script — KubeCon 2026 VPP

Bulleted talking points per slide. Edit freely — this is your working script.

---

## Opening

### 1. What is a Virtual Power Plant?
- Welcome to KubeCon, thank you for being here
- I work at Enpal — we're building Europe's largest virtual power plant
- Before we talk about what a VPP is, we need to talk about the thing it's trying to fix

### 2. Agenda
- Four parts: The Grid, Renewables, the VPP itself, and Resilience
- ~30 minutes total — we'll go fast
- By the end you'll understand why the energy grid is the most exciting distributed systems problem on the planet

---

## The Grid (Part I) — ~10 min

### 3. The Grid (section title)
- "The world's largest machine" — this isn't hyperbole, we're going to prove it

### 4. Texas Cascade HUD
- February 2021 — a polar vortex hits Texas
- Watch the grid go dark, county by county
- This is real data — 4.5 million homes lost power

### 5. "4 minutes and 37 seconds"
- The Texas grid was 4 minutes and 37 seconds from a total cold-start collapse
- A cold restart takes weeks, maybe months — you're rebuilding the grid from scratch
- 246 people died. $195 billion in damage.
- Wholesale prices went from $50 to $9,000/MWh overnight — 180x
- Families got $7,000 bills in a week. Their provider went bankrupt.

### 6. Running the Largest Machine (Zoom)
- The world's largest factory is VW Wolfsburg — 60,000 workers over 6.5 km²
- The European grid: 2.3 million workers across 5.5 million km²
- 36 countries, all synchronized on one frequency
- Zero downtime — this machine has never been turned off. No maintenance window. No staging environment.

### 7. EU Grid HUD
- This is the Continental European grid — real-time visualization
- 400 million consumers. 1,100 GW of installed capacity.
- Every node is synchronized. One heartbeat: 50 Hz.

### 8. The Grid: A Balancing Act
- The grid maintains exactly 50 Hz — supply and demand balanced every single second
- The ±0.2 Hz band is everything — cross it and automated systems start disconnecting
- [DEMO] Click scenarios to simulate events:
  - Generator trip: 800 MW offline, watch reserves catch it — recovery in ~12 minutes
  - 3 GW loss: deep enough to trigger automatic load shedding, but grid survives
  - Demand drop: frequency goes UP — too much supply is also dangerous
  - Cyber attack: coordinated SCADA compromise, cascading trips, no recovery — blackout
- Notice the accelerated timer — these events play out over minutes in real grid time

### 9. Designed for a Different World
- Power Plants → Transmission → Distribution → Homes
- One direction. Few large producers. Passive consumers.
- Designed in the 1950s. No flexibility built in.

### 10. The Old Playbook
- How did we manage this for 70 years?
- Peaker plants: 261 GW sitting idle 95% of the year, firing up at 2-5x cost
- Spinning reserves: generators running at partial load 24/7 "just in case" — burning fuel to produce nothing
- Load shedding: deliberate blackouts as policy. Texas shed 20 GW — $52.6 billion in excess charges in 5 days
- Curtailment: too much sun? Turn it off. Germany threw away 19 TWh of clean energy in 2023

### 11. X The Grid vs. Tech Infrastructure — DEPRECATED (skip)

### 12. Why Texas Failed
- The gas-electric death spiral — a cascading feedback loop
- Cold hits → generators freeze → load shedding → cuts power to gas pipelines → more generators fail → more load shedding
- Steps 4-6 are the death spiral — it accelerates
- 52,000 MW offline out of 107,000. ERCOT is isolated — no interconnection to call for help.

### 13. Not an Isolated Incident
- This isn't a Texas problem — it's a grid architecture problem
- 10 major failures in 23 years across 3 continents
- 2003 Northeast US: 55 million people, $6B. 2016 South Australia: entire state.
- Spain/Portugal 2025: 60 million people. Berlin arson 2025: three attacks, 45K+ homes.
- The common thread? Centralized, inflexible, cascading.

### 14. X Every Cascade Shares Three Properties — DEPRECATED (skip)

### 15. No flexibility.
- Every one of these failures shares one root cause: no flexibility
- Pause. Let that land.
- "Now imagine adding the most variable energy source in history."

---

## The Renewable Revolution (Part II) — ~7 min

### 16. Demand Response in Action
- Instead of building more plants, reshape demand
- [DEMO] Trip a generator, watch demand respond
- Still in its infancy — most grids have zero demand-side flexibility at scale today

### 17. The Renewable Revolution (section title)
- "Inevitable, amazing — and a whole new kind of problem"

### 18. The Renewable Explosion
- Germany's renewable share — this is exponential growth
- Already over 50% of electricity generation
- This is not slowing down. Every country is on this curve.

### 19. The Duck Curve Problem
- Solar floods the grid at midday — prices collapse
- Sunset: demand ramps steeply, solar disappears
- This "belly" gets deeper every year as more solar comes online
- The grid needs ramping capacity it doesn't have

### 20. X Energy Being Thrown Away — DEPRECATED (skip)

### 21. Clean Energy Has Outgrown the Grid
- Germany paid EUR 554 million to generators to NOT produce electricity
- 9.3 TWh curtailed — enough to power 2.7 million homes
- 49% of congestion is at the local distribution level — rooftop solar overwhelming neighborhood transformers
- New long-distance cables don't fix this. You need local flexibility.
- A VPP could be the buyer of last resort — charge batteries, pre-heat buildings, shift EV charging

---

## The Virtual Power Plant (Part III) — ~10 min

### 22. What If You Could Shift the Load?
- Same duck curve — but now add batteries
- [DEMO] Click "With VPP" — batteries absorb midday solar, discharge in the evening
- The belly fills in. The ramp flattens. The grid can cope.

### 23. The Impact of Flexibility
- RMI study (modeled on Texas/ERCOT): full flexibility cuts generation costs 20%
- Just 2 flexible devices per home — smart thermostat + water heater — saves $140/household/year
- Avoids 75% of new gas peaker construction
- Brattle Group (projected): 60 GW of VPPs save $15-35B over 10 years
- The cheapest megawatt is the one you never have to generate

### 24. Consumers Become Infrastructure
- Your roof becomes a power plant. Your garage becomes a grid asset.
- Your house becomes a node in the largest distributed system ever built.
- But coordinating millions of these devices? That's a distributed systems problem.
- Transition: that's where we come in

### 25. The Virtual Power Plant (section title)
- "Software that turns distributed energy into grid infrastructure"

### 26. What Is a VPP?
- Left: devices — solar panels, batteries, EV chargers, heat pumps
- Center: cloud platform — Kubernetes + Dapr, event-driven control
- Right: services — frequency regulation, peak shaving, energy arbitrage, demand response
- Software that aggregates and operates millions of devices as one coordinated power plant

### 27. The Fastest Power Plant
- Coal: 2-6 hours to start. Gas: 10-30 minutes. Hydro: 15-30 seconds.
- Battery: 140 milliseconds.
- A battery responds before a gas turbine even knows there's an emergency
- This is why batteries + software win

### 28. X Hornsdale, December 2017 — DEPRECATED (skip)
### 29. X SA Virtual Power Plant, 2019 — DEPRECATED (skip)

### 30. The Architecture Parallel
- Traditional grid = monolithic. VPP = microservices.
- Draw the parallel for this audience:
  - Frequency = your SLO
  - Cascade = failure propagation
  - Batteries = autoscaling
- You already think in these terms every day

### 31. How It Works
- [ANIMATED] The actual architecture of our VPP
- Energy market sends request → Market trader (Entrix) → VPP Controller on Kubernetes
- Controller publishes commands via Kafka → Enpal cloud → MQTT to individual homes
- Watch the data flow — from market signal to battery charge in seconds
- This is cloud-native infrastructure running the power grid

### 31b. Inside the Architecture
- [ANIMATED] Now let's zoom in — this is the internal data flow
- Each home has devices — heat pump, PV, battery — connected to an IoT hub
- The IoT hub connects to our cloud via EMQX, our MQTT broker
- We ingest both static config data and measurement telemetry every 20 seconds, all aligned in Protobuf schemas
- Data flows into Databricks — raw, then bronze, silver, gold layers — classic lakehouse
- Here's the game changer: Apache Spark streaming aggregates on Databricks give us near-real-time pattern detection at latencies that would be unthinkable in traditional web request-response cycles
- Our BI team, predictive monitoring, and solutions teams all build on these streaming pipelines
- We progressively increase aggregation windows to minimize storage — raw data is kept for a limited period
- The control loop: VPP controller dispatches to the local HEMS, which runs conflict resolution via our WISH protocol
- We also integrate §14a grid regulation devices, smart meters via Meterfy, and cloud-to-cloud with Flexor via Event Hub
- The clever use of streaming aggregates on Databricks is helping us substantially reduce costs while maintaining the low latency that makes real-time grid response possible

---

## Resilience (Part IV) — ~3 min

### 32. Resilience (section title)
- "What the future grid looks like — and why you already know how to build it"

### 33. Cascading Failure — No VPP
- [LIVE SIMULATION] Watch what happens when a major node fails
- Cascade propagates through the grid — failures compound
- No distributed reserves to absorb the shock

### 34. Same Failure — With VPP
- [LIVE SIMULATION] Same scenario, same failure
- But now distributed batteries respond in milliseconds
- The cascade is arrested. The grid holds.
- Same event, completely different outcome

### 35. Back to Texas
- Remember those 4 minutes and 37 seconds?
- With 10 GW of distributed batteries responding in 140 ms, there is no cascade
- The frequency never drops. The gas plants never need to save you.
- Because 1 million homes already did.

### 36. The Future Grid
- Millions of devices cooperating — homes, EVs, batteries
- The grid becomes software
- And it runs on the same infrastructure you build every day

### 37. Final Takeaway
- VPPs turn distributed renewable energy into reliable grid infrastructure
- Cloud-native systems are what make them possible
- You already know how to build the future grid. You just didn't know it yet.

---

## Tech Deep-Dive / Closing

### 38. Kepler: How Much Power Does Our VPP Use?
- CNCF project — per-pod energy monitoring via eBPF
- Our VPP manages thousands of homes. But how much energy does our own infrastructure consume?
- Show the dashboard — real data from our clusters

### 39. The VPP Practices What It Preaches
- Carbon-aware scheduling with Kepler + KEDA
- Batch jobs (model retraining, analytics) scale up when the grid is clean, scale down when it's dirty
- The VPP that manages the grid is itself a good grid citizen

### 40. Thank You
- Thank you — Enpal, building Europe's largest virtual power plant
- Questions? Find us at the booth / connect after

---

## Appendix

### 41. The Dunkelflaute
- "Dark doldrums" — when wind AND solar collapse simultaneously
- Germany Nov 2024: 14 consecutive days below 10% renewable capacity
- Wind at 3.8% of installed capacity. Prices spiked to EUR 175/MWh — 4x average.
- This is the scenario that makes storage and flexibility non-optional
- Only bring up if asked about "what if there's no wind or sun"
