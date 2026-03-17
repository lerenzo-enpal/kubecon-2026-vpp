# VPP Home Energy Cycle — Animation Spec

Defines the day/night energy cycle for the "What Is a Virtual Power Plant?" slide (`VPPArchitecture.jsx`).

## Design Principles

- All animation state derives from a single **fake clock** (0:00–24:00)
- Real-time speed: 8s full cycle (1s = 3 hours). Configurable via `CYCLE_SECONDS`.
- No independent timers — sun, moon, battery, PV, cable flow all read from the clock
- Phase transitions use cosine easing for smooth visual blending

## 24-Hour Timeline

```
Hour  0    3    6    9    12   15   18   21   24
      |----|----|----|----|----|----|----|----|
Sun   _______________████████████████▓▓░░__________
Moon  ████████████▓░░____________________░▓████████
Bat%  8%.....................0%▒▒▒▒100%████████▒▒8%
Cable ◄◄◄◄◄◄◄◄◄◄◄◄◄◄◄···········►►►►►►►►►►►►◄◄◄◄
```

### Phase Breakdown

| # | Phase            | Time        | Duration | Sun        | Moon       | Battery         | Cable Flow        | PV Panels |
|---|------------------|-------------|----------|------------|------------|-----------------|-------------------|-----------|
| 1 | Night/Grid Pull  | 00:00–06:30 | 6.5h     | Down       | Up (arc)   | Depleted (8%)   | Import ← grid     | Dark      |
| 2 | Sunrise          | 06:30–07:00 | 0.5h     | Rising     | Fading out | Depleted (8%)   | Import ← grid     | Dim glow  |
| 3 | Morning Peak     | 07:00–09:00 | 2.0h     | Up         | Gone       | Idle (8%)       | Idle (PV=house)   | Glowing   |
| 4 | Charging         | 09:00–14:00 | 5.0h     | Up (peak)  | Gone       | Charging 0→100% | Idle               | Glowing   |
| 5 | PV Export        | 14:00–19:30 | 5.5h     | Descending | Gone       | Full (100%)     | Export → grid (PV) | Glowing   |
| 6 | Sunset+Discharge | 19:30–20:00 | 0.5h     | Setting    | Fading in  | Starts draining | Export → grid (bat)| Fading    |
| 7 | Battery Discharge| 20:00–22:30 | 2.5h     | Down       | Up (arc)   | Draining 100→8% | Export → grid (bat)| Dark      |
| 8 | Night/Grid Pull  | 22:30–00:00 | 1.5h     | Down       | Up (arc)   | Depleted (8%)   | Import ← grid     | Dark      |

### Key Moments

- **06:30** — Sunrise begins (sun alpha 0 → 1 over 30 min)
- **07:00** — Sun fully up. PV covers house load but consumption too high to charge
- **09:00** — People leave for work. Low consumption. Battery starts charging from PV
- **14:00** — Battery full. Excess PV now exports to grid
- **19:00** — Sunset begins (sun alpha starts fading)
- **19:30** — Sun 75% down. Battery discharge to grid begins. Moon starts fading in
- **20:00** — Sun fully down. Moon up. Battery still discharging
- **22:30** — Battery depleted (8%). House switches to grid import
- **00:00** — Cycle restarts

## Sun Arc

- Visible: 06:30–20:00
- Sunrise transition: 06:30–07:00 (cosine ease-in, 30 min)
- Sunset transition: 19:00–20:00 (cosine ease-out, 60 min)
- Vertical position: arcs from horizon (low y) to zenith at solar noon (13:15)
- "75% down" = 19:30 (75% through the 19:00–20:00 sunset window)

## Moon Arc

- Visible: 20:00–06:30 (inverse of sun, with crossfade overlap during transitions)
- Rises as sun sets, sets as sun rises
- Rendered as crescent shape
- Subtle glow halo

## Battery

- Capacity: 0% (displayed as 8% minimum for visual) to 100%
- Charge rate: linear over 5 hours (09:00–14:00)
- Discharge rate: linear over 2 hours (19:30–21:30)
- Color coding:
  - Green: charging (phase 4)
  - Accent/blue: full + PV exporting (phase 5)
  - Accent: discharging to grid (phases 6–7)
  - Red: depleted, pulling from grid (phases 1, 8)
- Arrow indicator: ↓ charging, ↑ discharging, none when idle/depleted

## Cable Flow (Underground Grid)

- Export (right →): PV surplus to grid (14:00–19:30), battery to grid (19:30–21:30)
- Import (left ←): grid to house (21:30–06:30, plus sunrise/morning 06:30–09:00)
- Idle: during charging when PV is consumed locally (09:00–14:00)
- Particle brightness: bright during active flow, dim during idle

## Implementation

### Clock

```js
const CYCLE_HOURS = 24;
const CYCLE_SECONDS = 8; // 8s full cycle = 1s per 3 hours

// In animation loop:
const now = performance.now() / 1000;
const hour = ((now % CYCLE_SECONDS) / CYCLE_SECONDS) * 24; // 0.0 .. 24.0
```

### Phase Resolution

```js
function getPhase(hour) {
  if (hour < 6.5)  return 'night-pull';
  if (hour < 7.0)  return 'sunrise';
  if (hour < 9.0)  return 'morning-peak';
  if (hour < 14.0) return 'charging';
  if (hour < 19.5) return 'pv-export';
  if (hour < 20.0) return 'sunset-discharge';
  if (hour < 21.5) return 'battery-discharge';
  return 'night-pull';
}
```

### Derived State (all from `hour`)

```js
const phase = getPhase(hour);

// Sun alpha: 0 (down) to 1 (full)
// Rises 06:30–07:00, sets 19:00–20:00
const sunAlpha = hour < 6.5 ? 0
  : hour < 7.0 ? smoothstep(6.5, 7.0, hour)
  : hour < 19.0 ? 1
  : hour < 20.0 ? 1 - smoothstep(19.0, 20.0, hour)
  : 0;

// Sun vertical position: zenith at solar noon (13:15)
const solarNoon = 13.25;
const sunArc = 1 - Math.abs(hour - solarNoon) / (solarNoon - 6.5);
const sunY = sunYBase - (sunYBase - sunYZenith) * Math.max(0, sunArc) * sunAlpha;

// Moon alpha: inverse of sun with overlap during transitions
const moonAlpha = Math.max(0, 1 - sunAlpha * 2);

// Battery level
const batteryLevel = hour < 9.0 ? 0.08
  : hour < 14.0 ? 0.08 + 0.92 * ((hour - 9) / 5)
  : hour < 19.5 ? 1.0
  : hour < 21.5 ? Math.max(0.08, 1.0 - 0.92 * ((hour - 19.5) / 2))
  : 0.08;

// Cable flow
const cableDir = (phase === 'pv-export' || phase === 'sunset-discharge' || phase === 'battery-discharge')
  ? 'export' : (phase === 'charging' || phase === 'morning-peak') ? 'idle' : 'import';
```

### Defaults

```js
const DEFAULTS = {
  cycleSeconds: 8,     // 8s full cycle (1s = 3h)
  sunRise: 6.5,        // 06:30
  sunSet: 20.0,        // 20:00
  chargeStart: 9.0,    // 09:00
  chargeEnd: 14.0,     // 14:00
  dischargeStart: 19.5,// 19:30
  dischargeDuration: 3, // hours (extended for animation visibility)
  batteryMin: 0.08,    // visual minimum
};
```
