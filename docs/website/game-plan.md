# "Try to Crash the Grid" — Game Design

## Concept

An interactive game where the player tries to cause a cascading grid failure. The grid is visualized on a Kepler/deck.gl map. Players click on infrastructure to trigger events. Each event causes realistic consequences that propagate through the grid. A live explainer feed narrates what's happening in plain language, with deep links into the research content.

The game is the hero element of the landing page — it's what draws people in. It's not hard to crash the grid (that's the point — grids are fragile). The educational value comes from the explainer showing *why* each step happens.

## Map & Grid Model

### Visual Layer (Kepler/deck.gl)

A stylized map showing a simplified but realistic power grid:

- **Power plants** (6-10) — coal, gas, nuclear, wind farm, solar farm
  - Each has a capacity (MW) and current output
  - Visual: glowing dots sized by capacity, colored by type
- **Transmission lines** (10-15) — high-voltage connections between plants and substations
  - Each has a capacity limit and current load percentage
  - Visual: lines colored by load (green → yellow → red → flash on overload)
- **Substations** (8-12) — step-down points feeding cities/regions
  - Each serves a population (shown on hover)
  - Visual: diamond markers with population labels
- **Control center** (1-2) — grid operator SCADA/EMS
  - The "brain" that coordinates everything
  - Visual: building icon with pulsing connection lines
- **Cities/demand zones** (5-8) — where power is consumed
  - Visual: cluster of dots with demand level indicator

### Simulation Layer (Hidden)

A simplified power flow model running in the browser:

```
State:
  - frequency: 50.00 Hz (starts normal)
  - plants[]: { id, type, capacity, output, status }
  - lines[]: { id, from, to, capacity, load, status }
  - substations[]: { id, population, status }
  - controlCenter: { status, visibility }

Each tick (200ms):
  1. Calculate total generation vs total demand
  2. Update frequency based on imbalance
  3. Check line loads — if any line > 100%, trip it
  4. Redistribute load across remaining lines (simplified Kirchhoff)
  5. If redistributed load overloads another line, trip that too (cascade)
  6. Check frequency thresholds for automatic actions
  7. Update explainer feed
```

This doesn't need to be a real power flow solver — it needs to *feel* right and produce cascading behavior that matches real incidents.

## Player Actions

Players click on infrastructure to trigger events. Each action has a category and visual treatment:

### Physical Attacks
- **Set fire to a transmission pylon** — Takes out one line. Load redistributes to neighbors. If neighbors are already loaded, cascade begins.
- **Storm damage to wind farm** — Rapid generation loss (like SA 2016). Multiple turbines trip in sequence over 5-10 seconds.
- **Flood a gas plant** — Plant goes offline over 30 seconds (not instant — operators try to save it).

### Cyber Attacks
- **Hack the control center** — Operators lose visibility (like the 2003 NE US blackout). The grid still runs but nobody can see what's happening. Subsequent failures go unmanaged.
- **Compromise SCADA at a substation** — False readings. The substation appears normal but is actually overloaded. Eventually trips without warning.
- **Send false frequency signal** — Plants receive incorrect frequency data and respond wrong (over/under generate).

### Equipment Failures
- **Generator trip** — Instant loss of one plant's output (like Hornsdale scenario). Classic frequency event.
- **Transformer explosion** — Substation goes dark. Everything downstream loses power.
- **Interconnector overload** — If the grid connects to a neighbor, that link trips (like SA 2016 Heywood).

### Environmental
- **Heatwave** — Demand surges 20%. Everything runs hotter. Lines sag. Plants derate.
- **Dunkelflaute** — Wind and solar output drop to near zero over 30 seconds. Gas plants scramble to fill the gap.
- **Ice storm** — Lines ice up and snap. Plants freeze (Texas 2021 style).

## Explainer Feed

The right side (or bottom on mobile) shows a real-time feed as events unfold:

```
[00:00] You set fire to the Nordstadt-Sudburg 380kV line.
        The line trips on protection relay. Load redistributes.
        → What are protection relays? [link to Module 1]

[00:02] Westburg-Hafenstadt line now at 94% capacity (was 67%).
        This is getting close to its thermal limit.
        → What happens when a line overloads? [link to Module 1]

[00:05] Frequency dropping: 49.92 Hz (normal: 49.95-50.05)
        Spinning reserves are activating automatically.
        → What are spinning reserves? [link to Module 2]

[00:08] Westburg-Hafenstadt line TRIPPED at 103% — cascade begun.
        This is exactly what happened in the 2003 Northeast US blackout.
        → Read the full story [link to incident]

[00:11] Frequency: 49.71 Hz — UFLS Stage 1 activated.
        Grid operators are deliberately cutting power to some areas
        to save the rest. This is called load shedding.
        → What is load shedding? [link to Module 2]

[00:15] ██ GRID COLLAPSE ██ Frequency: 47.5 Hz
        Generators disconnect to protect themselves.
        You crashed the grid. 12 million people just lost power.
        → See real collapses: Texas 2021, Italy 2003, SA 2016
```

### Feed Design
- Monospace font (JetBrains Mono), dark terminal aesthetic
- Timestamps in seconds since first action
- Color-coded: white for narration, yellow for warnings, red for failures, cyan for links
- Links are inline and open in the content area (not new tabs)
- Scrolls automatically, player can scroll back

## Game States

### Normal (50.00 Hz ± 0.05)
- Map is calm, lines green, plants humming
- Subtle ambient animation (power flowing along lines)

### Stressed (49.5-49.9 Hz or 50.1-50.5 Hz)
- Affected lines turn yellow/orange
- Frequency display pulses
- Explainer warns about reserves activating

### Critical (49.0-49.5 Hz)
- Lines flash red
- Load shedding begins — some city clusters go dark
- Alarm sound (optional, muted by default)
- Explainer narrates each shedding decision

### Collapse (< 47.5 Hz)
- Screen flickers
- All lines go dark in a wave from the point of failure
- Frequency display drops to 0
- Map goes dark except for a few islands (if any plants managed to island)
- "You crashed the grid" overlay with stats:
  - Time to collapse
  - People affected
  - What triggered the cascade
  - Links to read about real events that followed this pattern
- "Play again" button

### Recovery (stretch goal)
- After collapse, show how long recovery takes (hours to days)
- "This is why prevention matters" → link to VPP module

## Difficulty

The game should be **easy to crash** — that's the educational point. A single well-placed attack on a critical line during high demand should cascade within 30-60 seconds. The grid is fragile. That's the lesson.

Optional "hard mode" for replay: add VPP batteries to the grid. Now the same attack is absorbed. The grid survives. "This is what a Virtual Power Plant does."

## Technical Implementation

### Stack
- **Map**: deck.gl (already used in the presentation for Texas/SA/EU maps)
- **Simulation**: Pure JS/TS state machine, no physics engine needed
- **Feed**: React component, append-only log
- **State**: useReducer or Zustand, tick-based (200ms intervals)

### Grid Data
- Fictional but realistic grid topology
- ~20-30 nodes, ~15-20 edges
- Pre-authored cascade paths (not fully simulated — authored sequences triggered by specific failures)
- This keeps it predictable and ensures the explainer text matches what happens

### Performance
- No heavy computation — just state transitions and visual updates
- deck.gl handles map rendering efficiently
- Should run smoothly on a 2020 Chromebook

### Reuse from Presentation
- deck.gl map setup (from TexasMapHUD, SAMapHUD, EUGridHUD)
- Color palette and glow effects
- Frequency display component
- Line/node styling patterns

## Content Integration

Every explainer message can link to:
- **Module sections** — "What are spinning reserves?" → Module 2
- **Incident pages** — "This is what happened in Italy 2003" → incident research
- **Research pages** — "Why does the grid use 50 Hz?" → research deep dive

These links are the bridge from game → education. The game gets attention; the links deliver learning.

## Open Questions

- Should the grid be fictional or based on a real topology (simplified)?
- Sound design: ambient hum that pitch-shifts with frequency? Optional or default?
- Mobile: full game or simplified "lite" version?
- Multiplayer (stretch): two players, one attacks, one defends with VPP resources?
- Should the game track a "high score" (fastest crash, most people affected)?
- Accessibility: how to make the map-based game work for screen reader users?
