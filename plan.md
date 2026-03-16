# VPP Interactive Scenario Visualization - Implementation Plan

## Concept Overview

A **multi-slide interactive experience** (3-4 slides) that demonstrates the four VPP services from the "What Is a VPP?" slide through two narrated scenarios. The visualization uses a **top/bottom split layout**: a Germany/Berlin-area map on top, and a "home detail" panel below showing individual houses with their assets (PV, battery, EV, heat pump).

The interaction model is **step-based** (like `VPPExplainerZoom` and `FrequencyDemo`): the presenter clicks through scripted moments within each scenario, with the map and house panel animating in sync.

---

## The Four VPP Services (from slide 20)

| Service | Color Token | Scenario Coverage |
|---------|------------|-------------------|
| **Energy Arbitrage** | `colors.success` (green) | Scenario 1 (summer) |
| **Peak Shaving** | `colors.accent` (amber) | Scenario 1 (summer) |
| **Frequency Regulation** | `colors.danger` (red) | Scenario 2 (winter) |
| **Demand Response** | `colors.primary` (cyan) | Scenario 2 (winter) |

---

## Layout: Top/Bottom Split

```
+--------------------------------------------------+
|                   GERMANY MAP                     |
|  (deck.gl, Berlin/Brandenburg region focus)       |
|  - Sun position / weather overlay                 |
|  - Scattered home dots glowing with status        |
|  - Grid frequency indicator (top-right HUD)       |
|  - Energy price ticker (top-left HUD)             |
|  - Time-of-day / season indicator                 |
+--------------------------------------------------+
|              HOME DETAIL PANEL                    |
|  3 houses side-by-side, each showing:             |
|  [PV] [Battery] [EV] [Heat Pump]                 |
|  with energy flow arrows and status indicators    |
|  + a narration bar at the bottom with step text   |
+--------------------------------------------------+
```

The map takes ~55% of the height, the home panel ~45%. On "zoom" steps, the map can expand to show the macro picture, then shrink back when we need the house detail.

---

## Slide Structure (3 slides)

### Slide A: "VPP in Action: Summer Arbitrage" (Scenario 1)
**Services demonstrated: Energy Arbitrage + Peak Shaving**

**Steps (presenter clicks through):**

| Step | Map | Houses | Narration |
|------|-----|--------|-----------|
| 1. "Sunny summer day" | Berlin map, bright sun high in sky, homes glowing amber (solar active) | 3 houses: PV panels glowing, arrows flowing down from panels. Battery gauge: EMPTY. EV gauge: EMPTY. | "It's a sunny July afternoon in Berlin. Solar panels across thousands of homes are producing peak energy." |
| 2. "Prices dropping" | Price ticker drops: 8c -> 4c -> 1c -> 0c. Map homes pulse faster. | PV arrows glow brighter. Battery stays empty (intentionally). A "HOLD" label on battery. | "Energy production is so high that wholesale prices are collapsing toward zero. Flexa holds the batteries empty -- on purpose." |
| 3. "Prices go negative" | Price ticker goes RED: -1c -> -3c -> -5c. Sun still high. Grid lines on map pulse with excess. | Battery starts CHARGING (green arrows flowing IN). EV starts CHARGING. Price label shows "-5 ct/kWh" with green "$" indicators. | "Prices turn negative. Flexa commands: charge everything. We're being PAID to consume electricity." |
| 4. "Sun sets, prices spike" | Sun moves to horizon, sky darkens. Price ticker climbs: 2c -> 8c -> 15c -> 25c. | PV dims. Battery now FULL (green bar). EV FULL. Arrows reverse -- battery DISCHARGING to grid. | "As the sun sets, supply drops and prices spike. Now Flexa discharges our full batteries into the grid at peak prices." |
| 5. "The result" | Map calms. Overlay shows: flattened price curve (mini duck curve), CO2 saved, revenue earned. | Houses show net profit indicator. Side summary: "Peak shaved by 12%", "Revenue: +47 EUR/home", "CO2: -2.1 tonnes" | "We softened the price peaks, earned money for homeowners, and reduced fossil fuel generation. That's Energy Arbitrage + Peak Shaving." |

### Slide B: "VPP in Action: Winter Grid Emergency" (Scenario 2)
**Services demonstrated: Frequency Regulation + Demand Response**

**Steps:**

| Step | Map | Houses | Narration |
|------|-----|--------|-----------|
| 1. "Cold winter day" | Berlin map, low pale sun, cool blue tones. Homes visible but dimmer. | 3 houses: PV producing weakly (small arrows). Heat pump RUNNING (purple glow, warm house). Battery charging slowly. EV plugged in, charging. | "A cold January morning. Weak winter sun. Heat pumps are running across Berlin to keep homes warm." |
| 2. "Generator trips" | RED flash on map -- a power plant icon in eastern Germany goes dark. Frequency gauge drops: 50.00 -> 49.85 -> 49.70 Hz. Alert pulses. | All houses flash alert state. Red "GRID ALERT" banner. | "A 800 MW generator trips offline. Grid frequency drops below 49.8 Hz -- the danger threshold." |
| 3. "Immediate VPP response" | Frequency gauge stabilizes: 49.70 -> 49.85. Thousands of home dots on map flash from red to cyan simultaneously. | EV charger: PAUSED (grey, "PAUSED" label). Heat pump: PAUSED for 20 min (countdown timer). Battery: switches to DISCHARGE mode. | "Within 200 milliseconds, Flexa sends a command. Across 12,000 homes: EV charging pauses. Heat pumps pause for 20 minutes. Batteries discharge to support the grid." |
| 4. "Thousands respond" | Map zooms out slightly to show all of Brandenburg. Thousands of dots pulsing cyan in coordinated waves. Counter: "12,847 homes responding". Grid frequency: 49.95 Hz. | Houses show "contributing" state -- each showing kW freed up. Combined: "15.4 MW freed in 200ms" | "12,000+ homes respond as one. No one notices -- homes stay warm, cars still charged by morning. But the grid sees 15 MW of instant flexibility." |
| 5. "Grid stabilized" | Frequency returns to 50.00 Hz. Map returns to calm state. Dots turn green. | Heat pump resumes (countdown done). EV resumes charging. Battery returns to normal. "GRID STABLE" banner in green. | "Grid stabilized. Heat pumps resume after 20 minutes. That's Frequency Regulation + Demand Response -- invisible to residents, critical for the grid." |

### Slide C: "Four Services, One Platform" (Summary)
A recap slide showing all four services with mini-icons referencing what we just saw. This can be simpler -- possibly a 2x2 grid of the four services with one-line descriptions and visual callbacks to the scenarios. Optionally animated but not interactive.

---

## Technical Implementation

### New Components

#### 1. `VPPScenarioMap.jsx` (~400-500 lines)
**deck.gl map of Berlin/Brandenburg region**
- Base: dark MapLibre style (same as EUGridHUD/TexasMapHUD pattern)
- Center: Berlin [13.4, 52.52], zoom ~8-9 for Brandenburg
- Layers:
  - **ScatterplotLayer**: ~200 home dots scattered across Brandenburg, color-coded by state (amber=solar active, cyan=responding, green=stable, red=alert)
  - **IconLayer** or **ScatterplotLayer**: Power plant icon (for the generator trip)
  - Custom **sun position** overlay (canvas-drawn arc with sun circle, changes position per step)
- HUD overlays (HTML positioned over map):
  - **Frequency gauge** (top-right): animated Hz readout with color thresholds
  - **Price ticker** (top-left): animated EUR ct/kWh with trend arrow
  - **Time/season badge** (top-center): "July 14:00" or "January 09:00"
  - **Home counter** (bottom-right): "12,847 homes"
- Props: `scenario` ('summer'|'winter'), `step` (number), `width`, `height`

#### 2. `VPPScenarioHomes.jsx` (~350-400 lines)
**Canvas-based home detail panel showing 3 houses**
- Each house rendered as a simplified schematic (similar style to `ConsumerIcons.jsx` but with more detail):
  - Roof with PV panels (amber glow when active)
  - Battery gauge (vertical bar, green fill level)
  - EV icon with charge level
  - Heat pump icon with activity indicator
  - Energy flow arrows between components (animated particles)
- Status labels per device: "CHARGING", "DISCHARGING", "PAUSED", "OFF"
- Bottom narration bar with step text (monospace, typed-out effect)
- Props: `scenario`, `step`, `width`, `height`

#### 3. `VPPScenarioSlide.jsx` (~150-200 lines)
**Orchestrator component used on each scenario slide**
- Manages step state (click or arrow-key to advance)
- Splits layout top (map) / bottom (homes)
- Passes scenario + step to both child components
- Handles step transitions with easing

### Modifications

#### `Presentation.jsx`
- Import the new components
- Add 2-3 new slides after the current "What Is a VPP?" slide (slide 20), or replace existing placeholder slides in the VPP section
- Each scenario slide uses `<VPPScenarioSlide scenario="summer" />` or `scenario="winter"`

#### `SLIDE_ORDER.md`
- Update to reflect new slides

---

## Visual Design Details

### Map Aesthetic
- Same dark basemap style as `EUGridHUD` (CartoDB Dark Matter or similar)
- Home dots: small (radius 3-5px), with a soft glow (`radiusMinPixels: 3, radiusMaxPixels: 8`)
- Animated pulsing on state changes (opacity oscillation)
- The sun: drawn as a Canvas overlay -- a circle with soft radial gradient, positioned along an arc to indicate time of day. Summer = high arc, bright amber. Winter = low arc, pale yellow.
- Grid lines between homes: subtle cyan lines (only visible on zoom or during coordination steps)

### Home Panel Aesthetic
- Dark surface background (`colors.surface`)
- 3 houses in a row with subtle dividers
- Device icons: monochrome line-art style (matching `ConsumerIcons.jsx`)
- Energy flow: animated dashed lines with directional particles
- Color coding matches theme tokens: solar=amber, battery=green, EV=cyan, heat pump=purple
- JetBrains Mono for all labels and values
- Narration text at bottom: large, with the active VPP service name highlighted in its color

### Transitions Between Steps
- Map: smooth fly-to transitions using `FlyToInterpolator`
- Home panel: CSS transitions on gauge levels, opacity fades for status changes
- Narration: typed-out text effect (character by character, ~30ms per char)

---

## Implementation Order

1. **`VPPScenarioHomes.jsx`** -- Build the 3-house detail panel first (Canvas). This is the most novel piece and benefits from iteration.
2. **`VPPScenarioMap.jsx`** -- Build the Berlin/Brandenburg map with HUD overlays. Reuse patterns from `EUGridHUD.jsx` and `TexasMapHUD.jsx`.
3. **`VPPScenarioSlide.jsx`** -- Wire the orchestrator that manages steps and layout.
4. **Integration into `Presentation.jsx`** -- Add the new slides.
5. **Polish** -- Tune animations, timing, colors, narration text.

---

## Estimated Complexity

- **VPPScenarioMap.jsx**: ~450 lines (deck.gl map + HUD overlays + sun overlay)
- **VPPScenarioHomes.jsx**: ~400 lines (Canvas house drawings + animation loop + narration)
- **VPPScenarioSlide.jsx**: ~180 lines (layout + step management)
- **Presentation.jsx changes**: ~40 lines (new slide entries)

Total new code: ~1,070 lines across 3 new component files + slide integration.

---

## Open Questions / Alternatives

1. **Map scope**: The plan uses Berlin/Brandenburg. We could zoom out to show all of Germany for the "thousands respond" steps and zoom back in for house detail. This adds visual drama. I'd recommend it.

2. **Step navigation**: Use Spectacle's `useSteps()` hook (already used in `VPPExplainerZoom`) so each step is a sub-step within a single slide. The presenter presses right-arrow to advance through steps within the slide, then right-arrow again moves to the next slide. This is the established pattern in this deck.

3. **Summary slide (Slide C)**: Could be a simple 2x2 grid with static icons + text, or could re-use mini versions of the scenario visuals. I'd recommend keeping it simple -- the two scenario slides are the heavy hitters.

4. **Number of slides**: 2 scenario slides + 1 summary = 3 new slides. If the scenarios are too dense for a live presentation, we could break each into 2 slides (overview + detail zoom), making it 4-5 slides total. The step-based approach keeps it flexible either way.
