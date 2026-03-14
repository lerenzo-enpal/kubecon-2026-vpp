# kubecon-2026-vpp



# info for slides 

For a 30-minute KubeCon talk, the key is a clear narrative arc:
Problem → Enabling technology → System architecture.

Your 3-part structure is already very strong. What I’d recommend is making the story slightly more dramatic and visual, especially since the audience will include people who may not know much about energy systems.

Below is a suggested slide structure (~22–24 slides) with timing, key messages, and visual ideas.

30-Minute KubeCon Talk Structure

Title:
What is a Virtual Power Plant? Cloud Native Infrastructure for the Energy Grid

Part 1 — The Grid Was Built for a Different World (≈10 minutes)

Goal: Make the audience feel why change is necessary.

Slide 1 — Title

What is a Virtual Power Plant?

Subtitle:
Cloud Native Infrastructure for the Energy Grid

Visual:

Solar homes

Batteries

Grid lines

Cloud

Slide 2 — Electricity is the Largest Machine Ever Built

Message:

The power grid is one of the largest synchronized machines on earth

Must maintain real-time balance of supply and demand

Visual:

Animated grid map

Key idea:

Electricity systems must balance supply and demand every second.

Slide 3 — The Grid Was Designed for Centralized Power

Old model:

Coal / Gas / Nuclear
↓
Transmission
↓
Distribution
↓
Homes

Properties:

Few generators

Predictable demand

Slow adjustments

Slide 4 — Traditional Power Plants Are Slow

Explain ramp times.

Example:

Plant Type	Ramp Time
Coal	Hours
Gas	Minutes
Hydro	Seconds

Key message:

The grid historically relied on large generators slowly adjusting output.

Slide 5 — But Demand Is Not Slow

Modern demand drivers:

EV charging

Heat pumps

Air conditioning

Data centers

Show demand spikes.

Slide 6 — Example: Texas Grid Crisis (ERCOT 2021)

Explain briefly:

Extreme weather

Generation failures

Lack of flexibility

Impact:

Millions without power

Price spikes

Grid instability

Visual:

Demand vs supply chart

Key point:

The grid lacked fast flexible capacity.

Slide 7 — Optional Slide Variant

Spain & Portugal Blackout (2025)

Explain:

Grid instability event

Cascading failures

System fragility

Key message:

Large centralized systems can fail dramatically when they lose flexibility.

(Use as alternate example)

Slide 8 — Renewable Energy Changes the System

Solar and wind are:

Variable

Distributed

Weather dependent

But also:

Very cheap

Very scalable

Visual:

Solar production curve vs demand.

Slide 9 — The Duck Curve Problem

Show classic duck curve graph.

Key idea:

Solar floods midday → steep ramp in evening.

Traditional generators struggle with this ramp.

Slide 10 — What the Grid Needs Now

Instead of bigger generators, we need:

Flexibility

Fast response

Distributed control

Transition line:

And that’s where batteries enter the story.

Part 2 — Batteries Make Renewable Grids Possible (≈8 minutes)

Goal: show why batteries + demand response are key infrastructure

Slide 11 — Batteries Are Instant Power Plants

Response time:

milliseconds

Comparison:

Technology	Response
Coal	hours
Gas	minutes
Battery	milliseconds
Slide 12 — Batteries Stabilize the Grid

Batteries can:

absorb excess solar

supply power during peaks

smooth frequency fluctuations

Slide 13 — Batteries Enable Renewables

Without storage:

Solar production > demand → wasted energy

With storage:

Solar → battery → evening demand
Slide 14 — Demand Flexibility

From RMI / ARENA reports:

Demand response allows loads to shift when electricity is scarce or expensive.

Examples:

EV charging

Water heaters

Heat pumps

Industrial loads

Slide 15 — Consumers Become Grid Participants

Instead of passive users:

Homes can:

charge batteries

export energy

shift consumption

This creates millions of small grid resources.

Transition line:

But coordinating millions of devices is impossible manually.

Part 3 — What is a Virtual Power Plant? (≈10 minutes)

Goal: explain VPP architecture + cloud native relevance

Slide 16 — The Problem

We now have:

Millions of small energy assets

solar

batteries

EVs

smart devices

But they must behave like one power plant.

Slide 17 — Definition of a Virtual Power Plant

A Virtual Power Plant (VPP) is:

software that aggregates distributed energy resources and operates them as a coordinated power plant.

Slide 18 — VPP Concept Diagram
Homes
Solar
Batteries
EVs
↓
Cloud platform
↓
Grid services

The cloud coordinates devices in real time.

Slide 19 — What VPPs Actually Do

Examples:

peak shaving

frequency regulation

demand response

energy arbitrage

Slide 20 — Example: 100k Batteries Acting Together

Illustrate:

1 battery = 10 kWh
100,000 batteries = 1 GWh

Equivalent to large power plant.

Slide 21 — Why Cloud Native Matters

You need:

real-time data ingestion

millions of device connections

event-driven control

resilient orchestration

Technologies used:

Kubernetes

Dapr

messaging systems

edge computing

Slide 22 — The Grid Becomes Software

Old grid:

hardware infrastructure

New grid:

hardware + software + data
Slide 23 — The Future Grid

Millions of devices cooperating:

homes

EVs

batteries

renewables

forming distributed power plants.

Slide 24 — Final Takeaway

Virtual Power Plants turn distributed renewable energy into reliable grid infrastructure.

And cloud-native systems are what make them possible.

Timing
Section	Time
Problem	10 min
Batteries	8 min
VPP	10 min
Q&A	2 min
Optional “KubeCon Flavor” Slide

Since it's a Kubernetes conference, add a humorous analogy:

Traditional grid → monolith
Virtual power plant → distributed system

Generators = nodes
Batteries = autoscaling capacity

If you'd like, I can also help you create:
1️⃣ A visual story slide deck outline (with diagrams)
2️⃣ A 1-slide explanation of demand response (very important concept)
3️⃣ A killer opening slide for KubeCon
4️⃣ A live VPP demo idea for the talk

Your topic is perfect for KubeCon because it reframes:

cloud-native systems as infrastructure for the physical world.