# Response Time Race — Design Spec

## Overview
Replace the current `ResponseTimeline` (energy bolt sweeping a log-scale track) with a **Response Time Race**: 4 generation sources side-by-side, each with an icon and countdown timer. A step trigger starts all timers simultaneously; each source's icon transitions from OFFLINE to ONLINE when its activation time is reached.

## Sources
| Source | Activation Time | Color | Icon |
|--------|----------------|-------|------|
| VPP Battery | 140 ms | `colors.success` (green) | Battery casing with charge level |
| Hydro | 20 s | `#60a5fa` (blue) | Dam wall with water arc |
| Gas Turbine | 10 min | `#fb923c` (orange) | Reuse gas plant from GridFlowDemo |
| Coal Plant | 2 hr | `colors.textDim` (gray) | Reuse coal plant from GridFlowDemo |

## Layout
4 equal-width cells across the component (canvas, ~840×200px). Each cell vertically stacked:
- **Icon** (center, ~60-70px tall) — simplified line-art versions of existing drawings
- **Label** below icon (source name, JetBrains Mono bold 12px)
- **Timer** below label (JetBrains Mono bold 16px, `00:00.000` format)

## States

### STANDBY (before race starts)
- Icons drawn in dim monochrome (`colors.textDim + '60'`)
- Timers show `00:00.000` in dim text
- No animations

### RACING (after step trigger)
- All timers count upward simultaneously
- Timer acceleration: starts near 1x realtime, ramps via `speed = 1 + k * elapsed²` so battery activates in ~0.14s real, hydro in ~2-3s, gas in ~5-6s, coal in ~8-9s
- Timer text remains dim until source activates

### ONLINE (source activated)
- **Transition:** Horizontal scan-line sweeps across the icon cell. Behind the scan line, icon shifts from dim to full source color.
- **After:** Icon stays at full color with steady subtle glow (`shadowBlur`). Source-specific animation begins (smoke for coal/gas, water flow for hydro, charge pulse for battery).
- **Timer:** Freezes at the activation time, text color shifts to source color.

### All sources online
- All icons active with their respective animations
- Timers frozen at their respective activation times
- Visual contrast tells the story: battery at `00:00.140`, coal at `02:00:00.000`

## Timer Acceleration Math
Goal: compress 2 hours of simulated time into ~9 seconds of real time while keeping the first ~200ms near-realtime.

```
simulatedTime(realElapsed) = integral of (1 + k * t^2) dt from 0 to realElapsed
                           = realElapsed + k * realElapsed^3 / 3
```

With k ≈ 330: at t=0.14s → sim=0.14s (battery), at t=2.5s → sim=20s (hydro), at t=5.5s → sim=600s (gas), at t=8.5s → sim=7200s (coal).

## Reuse
- Coal plant drawing: adapt from `GridFlowDemo.jsx` lines 497-569 (simplified, no full smoke system — just 1-2 steam wisps)
- Gas plant drawing: adapt from `GridFlowDemo.jsx` lines 571-645 (simplified)
- Battery: adapt from `VPPScenarioHomes.jsx` lines 331-375 (simplified)
- Hydro: new — dam wall (trapezoid) with water arc (quadratic bezier + animated droplets)

## Integration
- Replace `ResponseTimeline` import/usage in `Presentation.jsx`
- Same props interface: `width`, `height`, `delay`
- Race starts when component mounts (or after `delay`)
