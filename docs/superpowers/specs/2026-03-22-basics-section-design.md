# Basics Section Design Spec

## Overview

Add a new top-level "Basics" section to the website alongside Learn and Research. Four pages covering foundational electricity and battery concepts, designed for ages 12+ but enjoyable for tech-savvy adults. Interactive-first using the hybrid "Briefing + Labs" pattern: scroll-driven narrative animations for core concepts, standalone interactive playgrounds for deeper exploration.

**Aesthetic:** Same dark mission-control / spy-tech vibe as the rest of the site. JetBrains Mono for data, Inter for body text, cyan/primary accents. No dumbing down -- precise, real data, clearly explained.

## Section Structure

### Navigation

"Basics" appears in the site header between Home and Learn. Positioned before Learn because it provides foundational knowledge that the Learn narrative builds on.

```
Home | Basics | Learn | Research | About
```

### Pages

| # | Page | URL | Purpose |
|---|------|-----|---------|
| 01 | How Electricity Works | `/basics/how-electricity-works` | Voltage, current, AC/DC, generation, power vs energy |
| 02 | Supply & Demand | `/basics/supply-and-demand` | Instantaneous balance, rotating mass, frequency, what breaks |
| 03 | How Batteries Work | `/basics/how-batteries-work` | Li-ion chemistry, history, cost revolution, upcoming tech |
| 04 | Beyond Lithium-Ion | `/basics/beyond-lithium-ion` | Alternative storage: flow, pumped hydro, gravity, CAES, H₂, thermal, flywheels |

Each page links forward to the next. "How the Grid Works" (Learn) cross-links back to pages 01 and 02 for visitors wanting deeper foundations.

### Page Anatomy

Every Basics page follows this template:

1. **Hero** -- Title + one-line hook + animated hero visual
2. **Briefing sections** (2-3 per page) -- Short prose + sticky canvas that animates as you scroll. The "aha moment" delivery system.
3. **Lab sections** (1-3 per page) -- Standalone interactive playgrounds with sliders, drag-and-drop, scenario builders. "Now you try it."
4. **Next Mission link** -- "Continue to: [next page]" + optional "Go deeper: [research topic]"

### Layout

Uses the existing `ContentLayout.astro` with left sidebar TOC. Sidebar shows all four Basics pages with collapsible sections. Interactive lab sections get the existing "Interactive" badge. Scroll-driven briefing sections don't get a badge (they're animated, not user-interactive).

---

## Page 1: How Electricity Works

### Briefing 1: "What Is This Stuff?"

Scroll-driven water-pipe analogy animation.

- Canvas shows a pipe system with water flowing
- As user scrolls: labels appear mapping voltage → pressure, current → flow rate, resistance → pipe width
- Scroll-driven changes: pipe width and water flow rate vary as scroll progresses to show the relationships (no interactive sliders here -- the Ohm's Law Playground lab below provides the interactive version)
- Further scrolling morphs the pipe into a wire with electrons, establishing that the analogy maps directly
- Key formula appears inline: V = I × R (Ohm's Law)

**Content:** What voltage, current, and resistance are. Conductors vs insulators. Why copper is everywhere.

### Briefing 2: "AC vs DC: The War of Currents"

Scroll-driven waveform visualization.

- Starts with flat DC line (battery output)
- Scroll morphs it into a sine wave -- AC, alternating 50 times per second
- A transformer appears: shows voltage step-up (230V → 400kV) and why this matters for long-distance transmission (P = I²R losses)
- Brief Tesla vs Edison historical context
- Then shows why we still need DC: phone, laptop, solar panels all produce/consume DC
- Inverter/rectifier bridge appears showing AC↔DC conversion

**Content:** Why AC won the standards war. Why high voltage means less loss. Why DC is making a comeback (solar, batteries, HVDC transmission).

### Briefing 3: "Spinning Into Power"

Scroll-driven generation animation.

- A magnet spins inside a coil of wire -- electrons start flowing (Faraday's law)
- Zoom out: the magnet is driven by steam → turbine (coal, gas, nuclear use heat to make steam)
- Alternative drivers appear: water falling (hydro), wind pushing blades
- Solar PV gets its own beat: "the one that doesn't spin" -- animation of photons hitting silicon, knocking electrons loose
- Key insight reinforced: almost ALL electricity generation = spinning something, except solar PV

**Content:** Electromagnetic induction in plain language. The universal principle behind coal, gas, nuclear, hydro, wind. Why solar PV is fundamentally different.

### Lab: Ohm's Law Playground

Interactive component: `OhmsLawPlayground.tsx`

- Three linked sliders: Voltage (V), Current (A), Resistance (Ω)
- Drag any two, the third computes automatically
- Visual circuit updates in real-time: lightbulb brightness = current, wire thickness = resistance
- Preset buttons for real-world scenarios:
  - "Phone charger" (5V, 2A, 2.5Ω)
  - "Wall outlet" (230V, 10A, 23Ω)
  - "Transmission line" (400kV, 1kA, 400Ω)
  - "LED" (3V, 20mA, 150Ω)
- Formula displayed with current values highlighted: V = I × R, P = V × I

### Lab: Power vs Energy Calculator

Interactive component: `PowerEnergyCalculator.tsx`

- Pick a device from a list: LED bulb (10W), laptop (65W), EV charger (11kW), house (3.5kW avg), data center (50MW), city of Berlin (~2GW)
- Shows power draw with unit scaling (W → kW → MW → GW)
- Time slider: drag to see energy accumulate (Wh → kWh → MWh → GWh)
- Visual: a "tank" fills up over time, with rate proportional to power
- Comparison mode: place two devices side by side to see relative consumption
- Key insight: "A 100W bulb running for 10 hours uses the same energy as a 1000W microwave running for 1 hour"

---

## Page 2: Supply & Demand

### Briefing 1: "No Buffer, No Storage, Just Physics"

Scroll-driven comparison animation.

- Water system: a tank sits between supply (tap) and demand (drain). You can see the buffer -- supply and demand don't need to match instantly
- Gas system: pipeline pressure serves as a buffer
- Data network: caches, queues, retries -- buffers everywhere
- Scroll transition: all three systems fade, replaced by an electrical grid where the "buffer" space is... empty. Nothing. Zero.
- Visual emphasis: the wire is direct -- generation on one end, consumption on the other, no storage in between
- Text: "Unlike water, gas, or data, electricity cannot be stored in the grid itself. At every instant, generation must exactly equal consumption. There is no cache. No buffer. No retry."

**Content:** Why electricity is fundamentally different from every other utility. The instant-match constraint.

### Briefing 2: "The Spinning Mass"

Scroll-driven rotor/frequency animation.

- A turbine rotor spinning at 3000 RPM. Label: "3000 RPM ÷ 60 = 50 revolutions per second = 50 Hz"
- Zoom out: hundreds of rotors across the continent, all spinning in electromagnetic lockstep
- Scroll triggers: demand increases slightly → rotors slow → frequency dips below 50 Hz → a frequency gauge needle drops
- Reverse: demand drops → rotors speed up → frequency rises
- The key physics: demand acts as a brake on the rotors. Supply is the engine. Frequency is the speedometer.
- Show that ALL rotors slow together -- "A turbine in Lisbon and a turbine in Istanbul feel the same frequency dip within seconds"

**Content:** Why synchronous generators are locked together. Why demand physically slows them down. Why frequency is the universal signal of imbalance. The concept of inertia (stored rotational kinetic energy as shock absorber).

### Briefing 3: "2.5 Hz Between Normal and Blackout"

Scroll-driven threshold walkthrough.

- Frequency gauge front and center, starting at 50.0 Hz
- Scroll drives frequency downward through each threshold:
  - **50.0 Hz** -- Normal operation. Green. All generators synchronized.
  - **49.8 Hz** -- Primary reserves activate (FCR). 30 seconds to respond. Amber warning.
  - **49.5 Hz** -- Secondary reserves (aFRR). 5 minutes. Deep amber.
  - **49.0 Hz** -- Automatic load shedding begins. Red. Neighborhoods go dark to save the grid.
  - **48.0 Hz** -- More load shedding stages. Deep red.
  - **47.5 Hz** -- Generator protection relays trip. Generators disconnect to save themselves. Black. Cascade. Game over.
- Each threshold shows: what happens, how fast, who decides (automatic vs human)
- Reverse scroll restores frequency -- shows recovery is possible at every stage except the last

**Content:** The defense-in-depth system. Why 2.5 Hz is the entire margin. Why the last threshold is irreversible. Links to existing frequency research topic for deeper detail.

### Lab: "Be the Grid Operator"

Interactive component: `GridOperatorGame.tsx`

This is the signature interactive for the Basics section -- nothing like it exists on the site.

**MVP (Phase 1):**
- **Display:** Frequency gauge (center), demand bar (right, fluctuating), generation stack (left panel)
- **Assets you control:**
  - Gas turbine (500 MW, 10 min ramp)
  - Solar farm (400 MW peak, follows preset sun curve)
  - Battery (200 MW / 800 MWh, instant response, limited energy)
- **Gameplay:**
  - Demand follows a preset 24-hour curve (morning ramp, midday dip, evening peak, night trough) at accelerated speed (~2 min real time = 24 simulated hours)
  - You click to dispatch/retire assets, trying to keep frequency in the 49.8-50.2 Hz band
  - Visual feedback: frequency gauge color, simple score counter (seconds in green band)
  - One event: cloud cover drops solar output at a random time
- **Learning outcome:** Visceral understanding of why balancing is hard and why batteries matter for fast response

**Phase 2 (later iteration):**
- Add wind farm (variable output) and emergency reserve (expensive, slow)
- Random events: generator trip, demand spikes, wind gusts
- Three difficulty modes (Calm day, Storm, Dunkelflaute)
- Cost counter, city lights dimming during load shedding
- Scoring with penalty/bonus system

### Lab: "Why Can't We Just Store It?"

Interactive component: `StorageScaleVisualizer.tsx`

- Shows Continental European grid: ~300 GW average demand
- A battery icon represents the largest grid battery ever built (Moss Landing, ~3 GWh)
- Slider: "How long could this battery power Europe?" -- answer: ~36 seconds
- Stack batteries: how many Moss Landings to cover 1 minute? 1 hour? 1 day?
- Comparison: show the same exercise with pumped hydro (much more capacity but geography-limited)
- Final insight: "This is why VPPs matter -- instead of one giant battery, coordinate millions of small ones" → links to Learn: The Virtual Power Plant

---

## Page 3: How Batteries Work

### Briefing 1: "A History of Bottled Lightning"

Scroll-driven interactive timeline.

- Timeline runs left-to-right, scroll advances through milestones
- At each milestone, a visual of the battery technology appears and evolves:
  - **1800** -- Volta's pile (stacked zinc/copper discs, wet cloth). First "battery."
  - **1859** -- Planté's lead-acid battery. Still in every car today.
  - **1899** -- Nickel-cadmium. Rechargeable, but toxic cadmium.
  - **1976** -- Whittingham (Exxon) demonstrates lithium intercalation concept. The key insight.
  - **1980** -- Goodenough develops lithium cobalt oxide cathode. Doubles voltage.
  - **1985** -- Yoshino replaces lithium metal anode with carbon (graphite). Safe and rechargeable.
  - **1991** -- Sony commercializes first Li-ion cell. Powers camcorders, then laptops, then phones.
  - **2008** -- Tesla Roadster. Li-ion enters automotive.
  - **2015** -- Tesla Powerwall. Li-ion enters the home.
  - **2017** -- Hornsdale Power Reserve. Li-ion enters the grid. 100 MW in 100 days.
  - **2019** -- Nobel Prize to Whittingham, Goodenough, Yoshino.
  - **2024+** -- Grid-scale era. GWh-scale installations. Cost below $140/kWh.
- Battery cell visual evolves at each step: gets smaller, denser, cheaper (price tag updates)

**Content:** 224 years from Volta to grid-scale. Three Nobel laureates who made it possible. The shift from consumer electronics → EVs → grid infrastructure.

### Briefing 2: "Inside the Cell"

Scroll-driven cell cross-section animation.

- Cutaway of a Li-ion cell: anode (graphite, left), cathode (metal oxide, right), electrolyte/separator (center), external circuit (top)
- **Charging (scroll down):**
  - External power source applies voltage
  - Lithium ions detach from cathode crystal structure
  - Ions migrate through electrolyte → embed in graphite layers (intercalation)
  - Electrons flow through external circuit (same direction, different path)
  - Graphite layers visibly fill with lithium ions
- **Discharging (scroll further):**
  - Reverse: ions migrate back to cathode
  - Electrons flow through external circuit → this is your electricity
  - A lightbulb on the external circuit glows
- **Key insight callout:** "Lithium: lightest metal, highest electrochemical potential. That's why it won."
- Show ion size comparison: lithium vs sodium vs potassium (lithium is tiny, moves fast)

**Content:** How lithium-ion cells work at the atomic level. Intercalation. Why lithium specifically. Anode, cathode, electrolyte roles.

### Briefing 3: "The Price Crash"

Scroll-driven cost curve with milestone unlocks.

- Y-axis: $/kWh (log scale initially, then linear as costs compress)
- X-axis: 2010 → 2030 (projections after 2024)
- Scroll drives the year forward:
  - **2010: $1,100/kWh** -- Only viable for laptops and phones
  - **2013: $600/kWh** -- Tesla Model S ships. EVs for the wealthy.
  - **2016: $300/kWh** -- EVs approach price parity with ICE vehicles. Milestone unlocks: "EVs become competitive"
  - **2020: $140/kWh** -- Milestone: "Home storage makes economic sense"
  - **2023: $139/kWh** -- Pack-level costs (BloombergNEF). Cell-level even lower (~$90).
  - **2026: ~$100/kWh** (projected) -- Milestone: "Grid storage cheaper than peaker plants"
  - **2030: $50-80/kWh** (projected) -- Milestone: "Storage everywhere"
- **Why costs fell** (annotated on the curve):
  - Manufacturing scale: gigafactories (CATL, BYD, Tesla, Northvolt)
  - Chemistry: cobalt reduction (NMC 111 → 532 → 622 → 811 → cobalt-free LFP)
  - Competition: Chinese manufacturers drove prices through volume
- At the end: "89% cost reduction in 13 years. No other energy technology has done this."

**Content:** The learning curve that made grid storage possible. Why it happened (scale, chemistry, competition). What further cost drops unlock.

### Lab: Battery Chemistry Workbench

Interactive component: `BatteryChemistryWorkbench.tsx`

- **Selector:** Four chemistry buttons: LFP, NMC, NCA, LTO
- **Radar chart** updates for selected chemistry across 6 dimensions:
  - Energy density (Wh/kg)
  - Cycle life (number of cycles)
  - Safety (thermal runaway threshold)
  - Cost ($/kWh)
  - Charge speed (max C-rate)
  - Temperature tolerance (operating range)
- **Cell cross-section** updates to show different cathode material (color-coded: LFP = blue-green, NMC = purple, NCA = red, LTO = gold)
- **Use case callout:** Each chemistry shows its primary application:
  - LFP: Home batteries, grid storage (safe, 6000+ cycles, cheap)
  - NMC: EV batteries (high energy density, good balance)
  - NCA: Performance EVs, Tesla (highest density, thermal management needed)
  - LTO: Extreme applications, buses (20,000+ cycles, fast charge, expensive)
- **Compare mode:** Select two chemistries, see radar charts overlaid

### Lab: Lifecycle Simulator

Interactive component: `BatteryLifecycleSimulator.tsx`

- **Setup:** Fresh battery at 100% capacity (State of Health = 100%)
- **Controls:**
  - Daily cycles slider (0.5 - 3 per day)
  - Depth of discharge slider (20% - 100%)
  - Charge rate selector (0.5C, 1C, 2C, 3C)
  - Ambient temperature slider (0°C - 45°C)
- **Simulation:** Hit play, watch capacity fade over simulated years
  - Line chart: State of Health % vs Years
  - Heat indicator: glows as C-rate and temperature increase
  - "End of life" marker at 80% SoH (industry standard)
- **Preset scenarios:**
  - "Home battery" (1 cycle/day, 80% DoD, 0.5C, 20°C) → ~15 years
  - "Commuter EV" (0.8 cycles/day, 70% DoD, 1C, 25°C) → ~12 years
  - "Fast-charged taxi" (2 cycles/day, 90% DoD, 2C, 35°C) → ~5 years
  - "Grid frequency response" (3 cycles/day, 30% DoD, 2C, climate-controlled) → ~10 years
- **Learning outcome:** Why usage patterns matter more than age. Why home batteries last so long. Why fast charging degrades faster.

### Lab: What's Coming Next

Interactive component: `UpcomingBatteryTech.tsx`

- **Card grid** of emerging technologies, each with:
  - Name + one-line description
  - Maturity progress bar (research → prototype → pilot → commercial)
  - "Expected by" estimate
  - Key advantage vs current Li-ion
  - Key challenge remaining
- **Technologies:**
  - **Solid-state** -- Replace liquid electrolyte with solid. 2x energy density, no fire risk. Challenge: manufacturing at scale, interface degradation. Players: Toyota, QuantumScape, Samsung SDI. Expected: late 2020s for EVs.
  - **Sodium-ion** -- Replace lithium with sodium. Cheaper, abundant, no lithium supply risk. Lower energy density. Players: CATL (already shipping), BYD, Faradion. Expected: shipping now for stationary storage.
  - **Silicon anodes** -- Replace graphite anode with silicon. 10x theoretical anode capacity. Challenge: silicon swells 300% during charging, cracks. Players: Sila Nano, Amprius, Enovix. Expected: blended anodes now, pure silicon late 2020s.
  - **Lithium-sulfur** -- 5x theoretical energy density. Extremely light. Challenge: sulfur dissolution, poor cycle life (<500 cycles currently). Expected: niche applications (aerospace, drones) 2028+.
- **Click to expand:** Shows how the cell cross-section would change vs current Li-ion (visual diff)

---

## Page 4: Beyond Lithium-Ion

### Briefing 1: "The Duration Problem"

Scroll-driven cost-vs-duration visualization.

- X-axis: discharge duration (seconds → minutes → hours → days → weeks → seasons)
- Y-axis: cost per kWh of storage
- Li-ion curve appears first: cheap and effective from seconds to ~4 hours, then cost curves sharply upward
- As you scroll, other technologies appear at their optimal duration ranges:
  - Flywheels: seconds to minutes (leftmost)
  - Li-ion: minutes to 4 hours
  - Flow batteries: 4-12 hours
  - Compressed air: 8-24 hours
  - Pumped hydro: 6-24 hours
  - Gravity storage: 4-12 hours
  - Thermal: hours to days
  - Hydrogen: days to seasons (rightmost)
- Key insight: "No single technology covers the full spectrum. The future grid needs a portfolio."

**Content:** Why Li-ion dominates short-duration but can't solve everything. Duration as the key differentiator. The portfolio approach.

### Briefing 2: "The Storage Zoo"

Scroll-driven animated tour of 7 technologies. Each technology scrolls in with an animated cutaway diagram, key stats, and a one-line verdict.

**Flow Batteries**
- Animation: Two colored electrolyte tanks with pumps pushing fluid through a central cell stack. Ions exchange across a membrane.
- Key stats: 4-12 hour duration, 70-80% round-trip efficiency, 20,000+ cycles, scales by adding tank volume
- Verdict: "Scale energy independently of power. The data center UPS of the grid world."
- Players: ESS Inc (iron flow), Invinity (vanadium), Form Energy (iron-air, 100+ hours)

**Pumped Hydro**
- Animation: Upper and lower reservoirs connected by penstock. Water flows down through turbine (generating), pumped up by motor (storing). Reversible turbine.
- Key stats: 6-24 hour duration, 75-85% efficiency, 50+ year lifespan, 90% of world's storage capacity today
- Verdict: "The original grid battery. 100 years old, still unmatched at scale. But you need two lakes and a mountain."

**Compressed Air (CAES)**
- Animation: Compressor pushes air into underground salt cavern (storing). Air released through expansion turbine (generating). Heat exchanger shown.
- Key stats: 8-24+ hour duration, 40-70% efficiency (diabatic vs adiabatic), GWh-scale possible
- Verdict: "Massive scale, long duration. Needs the right geology -- salt caverns or depleted gas fields."

**Gravity Storage**
- Animation: Heavy concrete blocks lifted by crane system (Energy Vault tower) or weights descending in mine shafts.
- Key stats: 4-12 hour duration, 80-85% efficiency, 35+ year lifespan, no chemical degradation
- Verdict: "Beautifully simple. Potential energy in, potential energy out. No exotic materials."

**Thermal Storage**
- Animation: Molten salt tanks (concentrated solar), ice storage (commercial cooling), glowing carbon blocks at 1500°C (Antora Energy).
- Key stats: Hours to days, 50-95% efficiency (depending on tech), very cheap per kWh at scale
- Verdict: "Heat is cheap to store. Converting it back to electricity is the hard part."

**Green Hydrogen**
- Animation: Electrolyzer splits water → H₂ stored in tanks/caverns → fuel cell or gas turbine converts back to electricity
- Key stats: Days to seasonal, 30-40% round-trip efficiency (electrolyzer + fuel cell), unlimited storage duration
- Verdict: "The only technology that can store energy for months. But you lose 60-70% in the round trip."

**Flywheels**
- Animation: A disc spinning at high RPM in a vacuum chamber, magnetically levitated. Motor/generator on the shaft.
- Key stats: Seconds to minutes, 85-95% efficiency, 100,000+ cycles, near-instant response
- Verdict: "The sprinter, not the marathoner. Unmatched for power quality and frequency regulation."

### Lab: "Pick Your Storage" Scenario Builder

Interactive component: `StorageScenarioBuilder.tsx`

- **Choose a grid problem:**
  - "Frequency response" -- need to inject/absorb power in milliseconds to seconds
  - "Daily peak shaving" -- shift 4-6 hours of energy from off-peak to peak
  - "Evening ramp" -- cover the 3-hour gap when solar drops but demand peaks
  - "Week-long dunkelflaute" -- no wind or solar for 5-7 days in winter
  - "Seasonal balancing" -- store summer solar for winter heating
- **Result panel:**
  - Technologies ranked by suitability (best fit → poor fit)
  - For each technology: why it fits or doesn't (duration, response time, cost, maturity)
  - Comparison table: response time, discharge duration, round-trip efficiency, $/kWh, land use, cycle life
- **Drag-and-drop:** Place selected technologies on a 24-hour demand curve to see how they'd cover the gap. Shows remaining unmet demand.

### Lab: Storage Technology Comparison Tool

Interactive component: `StorageComparisonTool.tsx`

- **Selector:** Pick 2-3 technologies from the full list (Li-ion, flow, pumped hydro, CAES, gravity, thermal, hydrogen, flywheel)
- **Radar chart** with 8 dimensions:
  - Response time (faster = better)
  - Discharge duration (longer = better)
  - Round-trip efficiency (higher = better)
  - Capital cost per kWh (lower = better)
  - Cycle life (more = better)
  - Land footprint (smaller = better)
  - Technology maturity (more mature = better)
  - Scalability (easier to scale = better)
- **Toggle:** "Today" vs "2030 projected" -- shows how the radar shapes shift as technologies mature
- **Overlay mode:** Selected technologies' radar shapes are overlaid with transparency for direct visual comparison

---

## Technical Implementation

### New Files

**Pages (Astro):**
- `website/src/pages/basics/index.astro` -- Basics hub page
- `website/src/pages/basics/how-electricity-works.astro`
- `website/src/pages/basics/supply-and-demand.astro`
- `website/src/pages/basics/how-batteries-work.astro`
- `website/src/pages/basics/beyond-lithium-ion.astro`

**Scroll-driven briefing components (React/TSX):**
- `ScrollBriefing.tsx` -- Shared wrapper: sticky canvas + scroll-position-driven state. Manages IntersectionObserver and scroll progress calculation. Each briefing section provides a render callback that receives scroll progress (0-1).
- `WaterToWiresBriefing.tsx` -- Page 1, Briefing 1: pipe/wire analogy
- `ACvsDCBriefing.tsx` -- Page 1, Briefing 2: waveform morphing
- `SpinningPowerBriefing.tsx` -- Page 1, Briefing 3: generation
- `NoBufferBriefing.tsx` -- Page 2, Briefing 1: buffer comparison
- `SpinningMassBriefing.tsx` -- Page 2, Briefing 2: rotor/frequency
- `ThresholdWalkthroughBriefing.tsx` -- Page 2, Briefing 3: frequency thresholds
- `BatteryHistoryBriefing.tsx` -- Page 3, Briefing 1: timeline
- `InsideTheCellBriefing.tsx` -- Page 3, Briefing 2: cell cross-section
- `PriceCrashBriefing.tsx` -- Page 3, Briefing 3: cost curve
- `DurationProblemBriefing.tsx` -- Page 4, Briefing 1: cost vs duration
- `StorageZooBriefing.tsx` -- Page 4, Briefing 2: technology tour

**Lab components (React/TSX):**
- `OhmsLawPlayground.tsx` -- Page 1: V/I/R sliders + circuit visual
- `PowerEnergyCalculator.tsx` -- Page 1: device picker + time slider
- `GridOperatorGame.tsx` -- Page 2: 24-hour grid balancing game
- `StorageScaleVisualizer.tsx` -- Page 2: battery-vs-grid-demand scale
- `BatteryChemistryWorkbench.tsx` -- Page 3: chemistry selector + radar chart
- `BatteryLifecycleSimulator.tsx` -- Page 3: degradation simulation
- `UpcomingBatteryTech.tsx` -- Page 3: emerging tech cards
- `StorageScenarioBuilder.tsx` -- Page 4: grid problem → technology match
- `StorageComparisonTool.tsx` -- Page 4: radar chart comparison

### Component Directory

All new Basics components go in `website/src/components/basics/` to keep the component root clean:
- `website/src/components/basics/briefings/` -- ScrollBriefing wrapper + 12 briefing components
- `website/src/components/basics/labs/` -- 9 lab components

### Shared Infrastructure

**`ScrollBriefing.tsx`** -- The key shared wrapper component for all scroll-driven briefing sections.

**Layout model:**
- Two-column layout within the ContentLayout main content area: sticky canvas (left/center, ~60% width) + scrolling text column (right, ~40% width)
- The canvas is `position: sticky; top: 80px` (below the site header, avoiding conflict with the sidebar which is in a separate column)
- Each briefing section is approximately 200-300vh tall (tuned per-briefing based on content density)
- Text blocks within the scroll column have `data-progress-start` and `data-progress-end` attributes; CSS opacity transitions are driven by scroll progress via a style variable

**Scroll mechanics:**
- Uses IntersectionObserver to detect when the briefing container enters the viewport
- Within the container, scroll progress (0.0 to 1.0) is calculated as: `(scrollTop - containerTop) / (containerHeight - viewportHeight)`
- Progress is passed to the briefing's `render(ctx, progress, width, height)` callback on each `requestAnimationFrame`
- Animation loop pauses (cancels rAF) when the container is fully scrolled out of view to avoid unnecessary rendering

**TOC interaction:**
- Each briefing section has a single `id` attribute for the sidebar scroll-spy (e.g., `id="briefing-ac-vs-dc"`)
- The TOC links to the briefing section start, not to sub-states within it
- This is compatible with the existing IntersectionObserver-based scroll-spy in ContentLayout

**Reduced motion:**
- When `prefers-reduced-motion: reduce` is active, the sticky canvas shows the final state of the animation (progress = 1.0) as a static diagram
- Text blocks all render at full opacity
- Effectively becomes a static illustrated page rather than a scroll-driven animation

**Light mode support:**
- All Canvas 2D drawing uses color constants pulled from CSS custom properties via `getComputedStyle(canvas).getPropertyValue('--color-*')`
- A shared `getCanvasThemeColors()` utility reads `--color-bg`, `--color-text`, `--color-primary`, `--color-surface`, etc. and returns a colors object
- This utility is called on mount and on `matchMedia('(prefers-color-scheme: ...)')` change
- Lab components with React DOM UI use Tailwind classes (which already support dark/light via the existing theme toggle)

**Canvas rendering:** All briefing animations use Canvas 2D (consistent with existing site components). Labs that need complex UI (sliders, buttons, selectors) use React DOM with canvas for the visualization portion. Radar charts in `BatteryChemistryWorkbench.tsx` and `StorageComparisonTool.tsx` are rendered via Canvas 2D using polar coordinate math (no charting library).

### Data

No external data fetching. All data is hardcoded in component files:
- Battery cost data (BloombergNEF historical + projections)
- Technology specifications (from public sources)
- Grid parameters (ENTSO-E standards)
- Device power consumption (standard reference values)

### Navigation Updates

**`SiteHeader.astro`:** Add "Basics" nav link. The current header nav has: Learn, Research, Slides. Add "Basics" before Learn. Do not add Home or About links (the logo serves as the home link, matching current behavior).

**`ContentLayout.astro`:** This layout has hardcoded arrays for Learn modules and Research sections in its frontmatter. Add a new `basics` array following the same pattern, and a new collapsible sidebar block. Detection via `isBasics = currentPath.startsWith('/basics')`. The Basics block appears above the Learn block in the sidebar.

**`website/src/pages/learn/how-the-grid-works.astro`:** Add cross-links to Basics pages 01 and 02 where relevant.

### Basics Hub Page (`/basics/index.astro`)

A landing page for the Basics section, following the same pattern as `/learn/index.astro`. Contains:
- Section title: "Basics" with subtitle: "The foundations of electricity, grid balance, and energy storage"
- Four cards (one per page) with: title, one-line description, and a small animated preview (reusing each page's hero animation at reduced size)
- A note: "New to energy? Start with How Electricity Works. Already familiar? Jump to any topic."

### Cross-linking Strategy

- Each Basics page ends with "Continue to: [next Basics page]"
- Each Basics page has a "Go deeper" link to relevant Research topics:
  - How Electricity Works → (no direct research link, foundational)
  - Supply & Demand → Research: Grid Frequency, Cascading Failures
  - How Batteries Work → Research: Electricity Pricing (battery economics context)
  - Beyond Lithium-Ion → Research: Grid Flexibility Costs, Demand Response
- "How the Grid Works" (Learn) links to Supply & Demand (Basics) with: "Want to understand why frequency is everything? Start with the basics."
- "The Virtual Power Plant" (Learn) links to How Batteries Work (Basics) with: "New to battery technology? Start here."

### Performance

- Briefing canvas animation loops must cancel their `requestAnimationFrame` when the briefing container is scrolled fully out of view (checked via IntersectionObserver)
- Lab components use `client:visible` for deferred hydration (canvas only initializes when scrolled into view)
- Maximum of ~3 concurrent rAF loops on any single page at a time

### Accessibility

- `prefers-reduced-motion: reduce` -- briefing canvases show final-state static diagrams; text at full opacity (see ScrollBriefing spec above)
- `<noscript>` fallback on each Astro page: a static summary paragraph for each briefing concept, so the page is meaningful without JS
- All interactive labs have visible labels and keyboard-accessible controls (sliders, buttons)
- Canvas elements have `role="img"` and descriptive `aria-label`

### Content Boundary: Page 3 vs Page 4

Page 3 ("How Batteries Work") covers lithium-ion and its evolutionary variants (solid-state, sodium-ion, silicon anodes, lithium-sulfur) -- these are all electrochemical cells that store energy chemically.

Page 4 ("Beyond Lithium-Ion") covers fundamentally different storage mechanisms: mechanical (pumped hydro, gravity, flywheels, CAES), thermal (molten salt, ice, carbon blocks), and chemical-but-non-battery (hydrogen). The dividing line is "battery chemistry variants" vs "non-battery storage paradigms."

---

## Out of Scope

- Mobile-specific responsive design (defer to later iteration; desktop-first given tech audience at KubeCon)
- Internationalization
- Offline/PWA support
- User progress tracking or gamification beyond the Grid Operator game score
- Video content
- 3D WebGL visualizations (Canvas 2D is sufficient and consistent with existing site)
- GridOperatorGame Phase 2 features (difficulty modes, cost scoring, city lights -- see phasing notes above)
