# Speaker Script — KubeCon 2026 VPP

Bulleted talking points per slide. Speakers marked as **LERENZO** or **MARIO**.

| Speaker | Slides | Count |
|---------|--------|-------|
| LERENZO | 3-5, 7, 10, 12-14, 20-26, 28-29 | 17 |
| MARIO   | 6, 8-9, 11, 15-19, 27 | 10 |
| Shared  | 1-2 (opening) | 2 |

Total: 29 slides (+ appendix)

---

## Opening

### 1. Virtual Power Plants (Title Slide)
- Welcome to KubeCon, thank you for being here
- I work at Enpal — we're building Europe's largest virtual power plant
- Before we talk about what a VPP is, we need to talk about the thing it's trying to fix

### 2. Agenda
- Four parts: The Grid, Renewables, the VPP itself, and Resilience
- ~30 minutes total — we'll go fast
- By the end you'll understand why the energy grid is the most exciting distributed systems problem on the planet

---

## The Grid (Part I) — ~10 min

### 3. The Grid (section title) — LERENZO
- "The world's largest machine" — this isn't hyperbole, we're going to prove it

### 4. Texas Cascade HUD — LERENZO
- February 2021 — a polar vortex hits Texas
- Watch the grid go dark, county by county
- This is real data — 4.5 million homes lost power

### 5. "4 minutes and 37 seconds" — LERENZO
- The Texas grid was 4 minutes and 37 seconds from a total cold-start collapse
- A cold restart takes weeks, maybe months — you're rebuilding the grid from scratch
- 246 people died. $195 billion in estimated damage (Perryman Group).
- Wholesale prices went from ~$50 to $9,000/MWh overnight — 180x
- Families got $7,000 bills in a week. Their provider went bankrupt.

### 6. Grid Scale — MARIO
- Europe's largest car factory is VW Wolfsburg — 60,000 workers over 6.5 km²
- The European grid: 2.3 million workers across 5.5 million km²
- 36 countries, all operating at 50 Hz across interconnected synchronous areas
- Zero downtime — this machine has never been turned off. No maintenance window. No staging environment.

### 7. Designed for a Different World — LERENZO
- Power Plants → Transmission → Distribution → Homes
- One direction. Few large producers. Passive consumers.
- Designed in the 1950s. No flexibility built in.

### 8. EU Grid HUD — MARIO
- This is the Continental European grid — real-time visualization
- 400 million consumers. 1,100 GW of installed capacity (ENTSO-E, 2024).
- 36 countries, all operating at 50 Hz across interconnected synchronous areas.

### 9. The Grid: A Balancing Act (Frequency Walkthrough) — MARIO
- The grid runs at exactly 50 Hz — supply equals demand every second
- This is what "stabilizing the grid" means: keeping this one number steady
- [ARROW] Normal band: 49.8-50.2 Hz. Spinning reserves on standby.
- [ARROW] 49.5 Hz: reserves activate. Gas CCGT ramps to max.
- [ARROW] 49.0 Hz: reserves maxed, peaker fires. Load shedding begins.
- [ARROW] 47.5 Hz: generators disconnect. Total collapse.
- [ARROW] Punchline: 2.5 Hz between normal and catastrophe — less than you can hear.

### 10. Balancing the Grid is Expensive — LERENZO
- This is what it costs to keep the lights on the old way. Arrow through each one.
- [ARROW] Peaker plants: EUR 6.5B/yr keeping gas turbines idle 95% of the year
- [ARROW] Spinning reserves: 15% of all capacity burns fuel producing nothing
- [ARROW] Congestion: EUR 4.2B/yr rerouting power the grid can't move
- [ARROW] Curtailment: 10 TWh/yr of clean energy wasted in Germany
- Over EUR 10B/yr in hard costs. Sources fade in at the end.

### 11. Balancing the Grid — In Action — MARIO
- Now let's see this in action.
- [DEMO] Click scenarios to simulate events:
  - Generator trip: 800 MW offline, watch reserves catch it — recovery in ~12 minutes
  - 3 GW loss: deep enough to trigger automatic load shedding, but grid survives
  - Demand drop: frequency goes UP — too much supply is also dangerous
  - Cyber attack: coordinated SCADA compromise, cascading trips, no recovery — blackout
- Notice the accelerated timer — these events play out over minutes in real grid time

### 12. Why Texas Failed — LERENZO
- The gas-electric death spiral — a cascading feedback loop
- Cold hits → generators freeze → load shedding → cuts power to gas pipelines → more generators fail → more load shedding
- Steps 4-6 are the death spiral — it accelerates
- 52,000 MW offline out of 107,000. ERCOT is isolated — no interconnection to call for help.

### 13. Not an Isolated Incident — LERENZO
- This isn't a Texas problem — it's a grid architecture problem
- 10 major failures in 23 years across 3 continents
- 2003 Northeast US: 55 million people, $6B. 2016 South Australia: entire state.
- Spain/Portugal 2025: 60 million people. Berlin arson 2025: two attacks, 50K+ homes.
- The common thread? Centralized, inflexible, cascading.

### 14. No flexibility. — LERENZO
- Every one of these failures shares one root cause: no flexibility
- Pause. Let that land.
- "Now imagine adding the most variable energy source in history."

---

## The Renewable Revolution (Part II) — ~7 min

### 15. The Renewable Revolution (section title) — MARIO
- "Inevitable, amazing — and a whole new kind of problem"

### 16. The Renewable Explosion — MARIO
- Germany's renewable share — this is exponential growth
- Already over 50% of electricity generation
- This is not slowing down. Every country is on this curve.

### 17. The Duck Curve Problem — MARIO
- Solar floods the grid at midday — prices collapse
- Sunset: demand ramps steeply, solar disappears
- This "belly" gets deeper every year as more solar comes online
- The grid needs ramping capacity it doesn't have

### 18. Clean Energy Has Outgrown the Grid — MARIO
- Germany paid EUR 554 million to generators to NOT produce electricity
- 9.3 TWh curtailed — enough to power 2.7 million homes
- 49% of congestion is at the local distribution level — rooftop solar overwhelming neighborhood transformers
- New long-distance cables don't fix this. You need local flexibility.
- A VPP could be the buyer of last resort — charge batteries, pre-heat buildings, shift EV charging

---

## The Virtual Power Plant (Part III) — ~10 min

### 19. Consumers Become Infrastructure — MARIO
- Your roof becomes a power plant. Your garage becomes a grid asset.
- Your house becomes a node in the largest distributed system ever built.
- But coordinating millions of these devices? That's a distributed systems problem.
- Transition: that's where we come in

### 20. The Virtual Power Plant (section title) — LERENZO
- "Software that turns distributed energy into grid infrastructure"

### 21. What Is a Virtual Power Plant? — LERENZO
- Left: devices — solar panels, batteries, EV chargers, heat pumps
- Center: cloud platform — Kubernetes + Dapr, event-driven control
- Right: services — frequency regulation, peak shaving, energy arbitrage, demand response
- [ANIMATED] Energy market sends request → Market trader (Entrix) → VPP Controller on Kubernetes
- Controller publishes commands via Kafka → Enpal cloud → MQTT to individual homes
- Watch the data flow — from market signal to battery charge in seconds
- Software that aggregates and operates millions of devices as one coordinated power plant

### 22. Inside the Architecture — LERENZO
- [ANIMATED] Now let's zoom in — this is the internal data flow
- Each home has devices — heat pump, PV, battery — connected to an IoT hub
- The IoT hub connects to our cloud via EMQX, our MQTT broker
- We ingest both static config data and measurement telemetry every 20 seconds, all aligned in Protobuf schemas
- Data flows into Databricks — raw, then bronze, silver, gold layers — classic lakehouse
- Here's the game changer: Apache Spark streaming aggregates on Databricks give us near-real-time pattern detection at latencies that would be unthinkable in traditional web request-response cycles
- Our BI team, predictive monitoring, and solutions teams all build on these streaming pipelines
- We progressively increase aggregation windows to minimize storage — raw data is kept for a limited period
- The control loop: VPP controller dispatches to the local HEMS, which runs conflict resolution via our WISH protocol
- We also integrate Section 14a grid regulation devices, smart meters via Meterfy, and cloud-to-cloud with Flexa via Event Hub
- The clever use of streaming aggregates on Databricks is helping us substantially reduce costs while maintaining the low latency that makes real-time grid response possible

### 23. The Architecture Parallel — LERENZO
- Traditional grid = monolithic. VPP = microservices.
- Draw the parallel for this audience:
  - Frequency = your SLO
  - Cascade = failure propagation
  - Batteries = autoscaling
- You already think in these terms every day

### 24. How a VPP Responds to Grid Events — LERENZO
- Different timescales, different strategies
- FCR: under 30 seconds — blackout cost EUR 1-5B per event
- aFRR: under 5 minutes — gas peaker alternative at EUR 150-300/MWh
- Peak Shaving: 1-4 hours — VPP capacity 40-60% cheaper than peakers (Brattle)
- Energy Arbitrage: scheduled day-ahead — curtailment avoided: EUR 554M/yr (DE)
- The speed comparison: Coal 2-12 hours. Gas 10-30 minutes. Hydro 15-30 seconds. Battery: 140 milliseconds.
- A battery responds before a gas turbine even knows there's an emergency
- This is why batteries + software win

### 25. Energy Arbitrage + Peak Shaving — LERENZO
- [MAP HUD] Full-screen Berlin map — walk through each step
- Sunny July morning. 53,000 homes generating solar.
- Midday — prices collapse. Flexa holds batteries empty on purpose.
- Prices go negative — charge everything. Solar curtailed, batteries and EVs charging from the grid at negative prices, heat pumps pre-heating homes to bank cheap energy as thermal mass.
- Evening — sun sets, prices spike. Full batteries discharge at peak prices.
- Revenue earned. Grid peaks softened. Fossil generation reduced.

### 26. SA Virtual Power Plant, 2019 — LERENZO
- South Australia proved this works
- ~1,000 homes with Tesla Powerwalls
- One of the world's first demonstrations that distributed home batteries can stabilize a grid

### 27. The Economic Impact of Flexibility — MARIO
- Side by side comparison — Without VPP vs. With VPP
- Without: cascade failures, gas peakers at EUR 150-300/MWh, EUR 554M/yr curtailment, EUR 35B+ in grid upgrades, ~3.4 Mt avoidable CO2 (BNetzA + UBA, 2024)
- With: stabilized in 200ms, batteries at EUR 60-100/MWh, revenue from negative prices, VPP capacity 40-60% cheaper (Brattle), near-zero curtailment emissions
- The cheapest megawatt is the one you never have to generate

---

## Closing

### 28. Back to Texas — LERENZO
- Remember those 4 minutes and 37 seconds?
- With 10 GW of distributed batteries responding in 140 milliseconds, there is no cascade
- The frequency never drops. The gas plants never need to save you.
- Because 1 million homes already did.

### 29. Thank You — LERENZO
- Thank you — Enpal, building Europe's largest virtual power plant
- Questions? Find us at the booth / connect after

---

## Appendix

### The Dunkelflaute
- "Dark doldrums" — when wind AND solar collapse simultaneously
- Germany Nov 2024: 14 consecutive days below 10% renewable capacity
- Wind at 3.8% of installed capacity. Prices spiked to EUR 145/MWh (Nov) and EUR 175/MWh (Dec) — ~2x the annual average.
- This is the scenario that makes storage and flexibility non-optional
- Only bring up if asked about "what if there's no wind or sun"

### SA Blackout, 2016
- Full-screen South Australia blackout map
- Entire state went dark — tornadoes took out transmission lines
- Led directly to the Tesla VPP trial

### Winter Grid Emergency
- Full-screen Berlin map HUD — winter scenario
- 12,000 homes connected. Grid frequency drops. Flexa dispatches batteries + heat pumps pause.
- Different from summer: frequency regulation, not arbitrage

### References
- Sources and citations on final slide
- Architecture docs: github.com/kubekon/kubecon-2026-vpp/tree/main/docs
