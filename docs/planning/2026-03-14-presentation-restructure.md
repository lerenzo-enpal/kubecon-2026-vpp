# Presentation Narrative Restructure

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the 24-slide KubeCon presentation into a tighter narrative arc that opens with Texas ERCOT, builds through grid fundamentals and renewable challenges, introduces VPP as the solution, and closes with resilience.

**Architecture:** Single-file presentation in `presentation/src/Presentation.jsx` using Spectacle. Existing components (`FrequencyDemo`, `FrequencyLine`, `CascadeSimulation`) are reused. Two new visual components needed: a renewable growth chart and a duck curve / load-shifting visualization.

**Tech Stack:** React, Spectacle, Canvas API (for new chart components)

---

## New Narrative Arc (26 slides)

### Act 1 — "4 Minutes from Darkness" (Slides 1-8, ~10 min)

Open with the drama. Make the audience feel what grid failure means. Then explain *why* it happened.

| # | Title | Content | Notes |
|---|-------|---------|-------|
| 1 | **Cold Open: Texas** | "February 15, 2021. 1:51 AM. Texas. The grid frequency drops below 59.4 Hz..." 4 min 37 sec from total collapse. 246 deaths. $195B damage. | Dark screen, storytelling — no Appear animations (they broke before). Just powerful text on screen. |
| 2 | **Title Slide** | "What is a Virtual Power Plant?" — KubeCon 2026, Enpal/Flexa | Clean, centered. |
| 3 | **The Grid: A Balancing Act** | Interactive FrequencyDemo — click Stable → Stress → Critical → Collapse. "This line must never stop." | Existing component. Bottom-aligned stats. James Bond hacker on collapse. |
| 4 | **How the Grid Was Built** | 1950s model: few large plants → transmission → distribution → passive homes. One-directional. | Existing slide, minor text tweaks. |
| 5 | **Why Texas Failed** | The gas-electric death spiral: cold → generators trip → load shedding cuts power to gas compressors → less gas → more generators trip. Cascading feedback loop. | NEW slide. Diagram showing the vicious cycle. Key stat: 52,000 MW offline out of 107,000 MW. |
| 6 | **It Keeps Happening** | Timeline: Italy 2003, Europe 2006, SA 2016, Texas 2021, Europe grid split 2021, Spain/Portugal 2025, Berlin 2025-2026 | Existing slide, reordered to come after Texas context. |
| 7 | **The Common Pattern** | Three properties: tightly coupled, no local reserves, blind operators | Existing slide. |
| 8 | **The Grid Needs Flexibility** | Transition slide. "Every one of these failures shares one root cause: the grid has no flexibility. Now imagine adding the most variable energy source in history." | NEW — brief bridge slide before Act 2. |

### Act 2 — "Renewables Change Everything" (Slides 9-14, ~7 min)

Show that renewables are inevitable, amazing, AND create new problems that demand a new kind of infrastructure.

| # | Title | Content | Notes |
|---|-------|---------|-------|
| 9 | **Part II: Renewables Change Everything** | Section divider | |
| 10 | **The Renewable Explosion** | Animated chart showing renewable capacity growth over time (global or Germany). From ~5% to 50%+. "This is not slowing down." | NEW component: `RenewableGrowthChart` — animated bar/area chart. |
| 11 | **The Duck Curve Problem** | Animated visualization: solar floods midday, demand ramps in evening. The famous "duck curve." Show overgeneration during day, steep ramp at sunset. | NEW component: `DuckCurveChart` — animated line chart with day/night cycle. |
| 12 | **Negative Prices & Curtailment** | 301 negative price hours in Germany (2023), trending 400+. Solar energy being *thrown away* because there's nowhere to put it. | Evolved from existing renewables slide. Hard numbers. |
| 13 | **What If You Could Shift the Load?** | Same duck curve, but now show batteries absorbing midday solar and discharging in evening. The curve flattens. "This is what load shifting looks like." | NEW — second mode of DuckCurveChart with VPP overlay. |
| 14 | **Consumers Become Infrastructure** | Homes with solar + batteries can charge, export, shift consumption. "Your roof becomes a power plant. Your garage becomes a grid asset." | Brief text slide transitioning to Act 3. |

### Act 3 — "The Virtual Power Plant" (Slides 15-22, ~10 min)

Define VPP, prove it works, show the tech, live demo.

| # | Title | Content | Notes |
|---|-------|---------|-------|
| 15 | **Part III: The Virtual Power Plant** | Section divider | |
| 16 | **What Is a VPP?** | Definition + assets → cloud → grid services diagram | Existing slide. |
| 17 | **The Fastest Power Plant** | Coal hours → Gas minutes → Battery 140ms. Response time bars. | Existing slide. |
| 18 | **Proof: Hornsdale 2017** | 560 MW trip, 140ms response, 8 sec margin. Frequency line. | Existing slide. |
| 19 | **Proof: SA VPP 2019** | 1,100 homes, zero humans, autonomous response. | Existing slide. |
| 20 | **Speaking Your Language** | Grid ↔ Kubernetes analogy. Monolith → microservices. | Existing slide. |
| 21 | **Demo: Cascade Without VPP** | Interactive German grid simulation. | Existing component. |
| 22 | **Demo: Same Failure With VPP** | Green dots stabilize. Cascade arrested. | Existing component. |

### Act 4 — "The Future is Resilient" (Slides 23-26, ~3 min)

Circle back to Texas. Close with hope and a call to action.

| # | Title | Content | Notes |
|---|-------|---------|-------|
| 23 | **Back to Texas** | "Remember those 4 minutes? With 10 GW of distributed batteries responding in 140ms, there is no cascade. The frequency never drops. The gas plants never need to save you — because 1 million homes already did." | NEW — replaces Berlin closing (Berlin story can go in appendix). |
| 24 | **The Future Grid** | Millions of devices cooperating. The grid becomes software. Same infra you build every day. | Existing slide. |
| 25 | **Final Takeaway** | "You already know how to build the future grid. You just didn't know it yet." | Existing slide. |
| 26 | **Thank You** | Enpal/Flexa, links | Existing slide. |

---

## New Components Needed

### 1. `RenewableGrowthChart.jsx`
- Animated bar or area chart showing renewable share of generation growing over time
- Data: Germany or global, ~2010 to 2025
- Dark theme, color-coded (solar=amber, wind=blue)
- Bars animate up on mount
- Simple, punchy, no interactivity needed

### 2. `DuckCurveChart.jsx`
- Animated line chart showing 24-hour demand vs. solar generation
- Two modes (toggled by button):
  - **Without VPP:** Classic duck curve — overgeneration midday, steep ramp evening
  - **With VPP:** Batteries absorb midday, discharge evening — curve flattens
- Color: solar=amber fill, demand=cyan line, battery charge=green, battery discharge=green dashed
- Time-of-day x-axis (00:00 to 24:00), power y-axis

---

## Tasks

### Task 1: Create RenewableGrowthChart component

**Files:**
- Create: `presentation/src/components/RenewableGrowthChart.jsx`

- [ ] **Step 1: Create the animated bar chart component**

Canvas-based animated bar chart showing renewable energy share growing from ~2010 to ~2025. Use Germany data (approximate):
- 2010: 17%, 2012: 23%, 2014: 28%, 2016: 32%, 2018: 38%, 2020: 46%, 2022: 47%, 2024: 55%, 2025: 60%+
- Bars animate upward on mount
- Solar (amber) and wind (blue) stacked
- Dark background matching theme
- Large % label on each bar

- [ ] **Step 2: Verify it renders**

Import into Presentation.jsx temporarily and check it looks right at `http://localhost:3000`.

- [ ] **Step 3: Commit**

```bash
git add presentation/src/components/RenewableGrowthChart.jsx
git commit -m "feat: add animated renewable growth chart component"
```

### Task 2: Create DuckCurveChart component

**Files:**
- Create: `presentation/src/components/DuckCurveChart.jsx`

- [ ] **Step 1: Create the duck curve visualization with VPP toggle**

Canvas-based animated chart showing:
- X-axis: 24-hour day (00:00 to 24:00)
- Y-axis: Power (GW)
- Lines: Net demand (cyan), Solar generation (amber fill), Base demand (gray dashed)
- Classic duck shape: solar pushes net demand down midday, steep ramp 4-7pm
- Two buttons: "Without Storage" and "With VPP"
- With VPP mode: green fill shows battery absorbing midday excess, green dashed shows battery discharging in evening, net demand curve flattens
- Animated transition between modes

- [ ] **Step 2: Verify it renders**

Import into Presentation.jsx temporarily and check both modes look right.

- [ ] **Step 3: Commit**

```bash
git add presentation/src/components/DuckCurveChart.jsx
git commit -m "feat: add duck curve visualization with VPP toggle"
```

### Task 3: Restructure Presentation.jsx with new slide order

**Files:**
- Modify: `presentation/src/Presentation.jsx`

- [ ] **Step 1: Replace slide 1 (Cold Open) with Texas ERCOT story**

Replace the Berlin cold open with Texas:
- "February 15, 2021. 1:51 AM. Texas."
- "The grid frequency drops to 59.3 Hz. In 4 minutes and 37 seconds, the entire Texas grid will collapse."
- "It would take weeks to restart."
- "246 people die. $195 billion in damage."
- "The grid was 4 minutes from the largest infrastructure failure in American history."

- [ ] **Step 2: Add new slide 5 — "Why Texas Failed"**

New slide explaining the gas-electric death spiral cascade:
- Show the vicious cycle: Cold → generators trip → load shedding → gas compressors lose power → less gas → more generators trip
- Stats: 52,000 MW offline / 107,000 MW total, isolated grid (no interconnection)

- [ ] **Step 3: Add new slide 8 — "The Grid Needs Flexibility" bridge**

Simple transition slide:
- "Every one of these failures shares one root cause: no flexibility."
- "Now imagine adding the most variable energy source in history."

- [ ] **Step 4: Restructure Act 2 — Renewables section**

Replace old renewables slide with new sequence:
- Slide 9: Part II divider "Renewables Change Everything"
- Slide 10: RenewableGrowthChart — "The Renewable Explosion"
- Slide 11: DuckCurveChart (without storage) — "The Duck Curve Problem"
- Slide 12: Negative prices / curtailment stats
- Slide 13: DuckCurveChart (with VPP) — "What If You Could Shift the Load?"
- Slide 14: "Consumers Become Infrastructure" transition

- [ ] **Step 5: Reorder Act 3 — Remove economics slide, tighten VPP section**

Move existing slides into new positions:
- Slide 15: Part III divider
- Slide 16: What is a VPP
- Slide 17: Fastest Power Plant
- Slide 18: Hornsdale proof
- Slide 19: SA VPP proof
- Slide 20: KubeCon analogy
- Slide 21: Demo without VPP
- Slide 22: Demo with VPP

- [ ] **Step 6: Replace closing with Texas callback**

Replace "Back to Berlin" with "Back to Texas":
- "Remember those 4 minutes? With 10 GW of distributed batteries responding in 140ms..."
- "The frequency never drops. The gas plants never need to save you."
- "Because 1 million homes already did."

- [ ] **Step 7: Verify all slides render and navigate correctly**

Navigate through all 26 slides at `http://localhost:3000`.

- [ ] **Step 8: Commit**

```bash
git add presentation/src/Presentation.jsx
git commit -m "feat: restructure presentation narrative — Texas open, renewables act, VPP solution"
```

### Task 4: Update docs

**Files:**
- Modify: `docs/TODO.md`

- [ ] **Step 1: Mark restructure as complete, update remaining TODOs**

- [ ] **Step 2: Commit**

```bash
git add docs/TODO.md
git commit -m "docs: update TODOs after presentation restructure"
```
