# VPP Architecture Animation Cycle

The `VPPArchitecture.jsx` canvas animation runs a continuous day/night cycle representing a typical summer day for a VPP-connected home.

## Architecture: Clock-Driven State Machine

The animation is structured as a **single-clock state machine**. Every visual element derives its state from one value: `hour` (0–24). There are no independent timers, no callbacks between elements, and no mutable event queues. This is intentional — it makes the system deterministic and easy to reason about.

### How it works

```
performance.now() → hour (0–24) → phase → all visual state
```

1. **Clock**: `hour = ((now % CYCLE_SECONDS) / CYCLE_SECONDS) * 24`
2. **Phase**: a pure function of `hour` — returns one of 7 phase strings
3. **Derived state**: sun alpha, moon alpha, battery level, cable direction, particle colors — all pure functions of `hour` and `phase`
4. **Rendering**: canvas draw loop reads derived state, draws everything

No element "tells" another element to change. The sun doesn't "trigger" the moon. The battery doesn't "emit" a direction change. They all independently read the clock and compute their own state. This means:

- You can jump to any hour and get a correct frame
- Adding a new element means adding one more function of `hour`
- Changing timing means editing thresholds, not rewiring callbacks

### If you wanted event-driven

An event-driven version would look like:

```js
// NOT how it works — but for comparison
emitter.on('sunset', () => { moon.fadeIn(); stars.show(); });
emitter.on('battery-empty', () => { cable.setDirection('pull'); });
```

The current approach is simpler for a canvas animation because there's no async behavior, no event ordering issues, and the entire state is always consistent within a single frame.

## Time Scaling

- **Cycle duration**: 12 seconds real time = 24 hours simulated
- **Scale factor**: 1 second = 2 hours
- **Hour calculation**: `hour = ((now % 12) / 12) * 24`
- The cycle repeats indefinitely

## Full Schedule

| Hour | Phase | Sun | Moon | Battery | Grid Direction | Cable Color |
|---|---|---|---|---|---|---|
| 0.0–4.0 | night-pull | gone | full | empty (8%) | pulling from grid | cyan |
| 4.0–6.0 | night-pull | gone | fading out | empty (8%) | pulling from grid | cyan |
| 6.0–6.5 | night-pull | gone | gone | empty (8%) | pulling from grid | cyan |
| 6.5–8.5 | sunrise | fading in | gone | empty (8%) | pulling from grid | cyan |
| 8.5–10.0 | morning-peak | full | gone | empty (8%) | idle (no active flow) | dim yellow |
| 10.0–14.0 | charging | full | gone | 8% → 100% | idle (charging from PV) | dim yellow |
| 14.0–17.0 | pv-export | full | gone | full (100%) | exporting to grid | yellow |
| 17.0–19.0 | sunset-discharge | fading out | gone | full (100%) | exporting to grid | yellow |
| 19.0–21.0 | battery-discharge | fading out → gone | gone | 100% → 8% | exporting → pulling when empty | yellow → cyan |
| 21.0–22.0 | night-pull | gone | gone | empty (8%) | pulling from grid | cyan |
| 22.0–23.5 | night-pull | gone | fading in | empty (8%) | pulling from grid | cyan |
| 23.5–24.0 | night-pull | gone | full | empty (8%) | pulling from grid | cyan |

## Phase Definitions

```js
const phase = hour < 6.5  ? 'night-pull'
  : hour < 8.5  ? 'sunrise'
  : hour < 10.0 ? 'morning-peak'
  : hour < 14.0 ? 'charging'
  : hour < 17.0 ? 'pv-export'
  : hour < 19.0 ? 'sunset-discharge'
  : hour < 21.0 ? 'battery-discharge'
  : 'night-pull';
```

## Element Behaviors

### Sun

Fixed position top-right. Fades in/out only (no arc movement).

| Parameter | Value |
|---|---|
| Rise start | hour 6.5 |
| Fully up | hour 8.5 |
| Sunset start | hour 17.0 |
| Fully gone | hour 21.0 |
| Fade function | `smoothstep` (cubic hermite) |
| Visual | Yellow circle + 12 rays, glow proportional to alpha |

### Moon

Same position as sun (top-right). Never overlaps due to timing gaps.

| Parameter | Value |
|---|---|
| Fade in start | hour 22.0 |
| Fully visible | hour 23.5 |
| Fade out start | hour 4.0 |
| Fully gone | hour 6.0 |
| Gap after sunset | 1h darkness (21.0 → 22.0) |
| Gap before sunrise | 0.5h darkness (6.0 → 6.5) |
| Visual | Crescent via offscreen canvas compositing |

### Stars

- Alpha = `1 - sunAlpha` — automatically inverse of sun
- Twinkle per star via `sin(now * speed + offset)`
- Larger stars get cross-sparkle lines

### Battery

Per-home indicator bar, right of house.

| Parameter | Value |
|---|---|
| Min level (BAT_MIN) | 8% — visual floor |
| Charge start | hour 10.0 |
| Fully charged | hour 14.0 |
| Drain start | hour 19.0 |
| Fully drained | hour 21.0 |
| Ramp | Linear in both directions |
| Color | Green (charging), amber (discharging), red (at BAT_MIN) |
| Arrow | Down when charging, up when discharging, none when idle/empty |

### Grid Cable & Electricity Particles

L-shaped underground cable per home: vertical drop from house, then horizontal to right edge.

| Parameter | Value |
|---|---|
| Direction trigger | `isPulling` flag (true when night-pull, sunrise, or battery empty) |
| Export color | yellow (`#fbbf24`) |
| Pull color | cyan (`#22d3ee`) |
| Particles per home | 4, evenly spaced along L-path |
| Particle speed | `now * 0.25` |
| Active alpha | 0.85 |
| Idle alpha | 0.15 (morning-peak, charging) |

**Key rule**: Once `batteryLevel <= BAT_MIN + 0.02`, the cable switches to pulling regardless of phase name. This ensures the house starts consuming from the grid the moment the battery is empty, even if the phase timer hasn't ticked over to `night-pull` yet.

### PV Panel Glow

- Sun glow: `shadowBlur = 10 * sunAlpha`, amber stroke
- Only visible when `sunAlpha > 0.01`

## Smoothstep Function

Used for all fade transitions:

```
smoothstep(a, b, t) = x² * (3 - 2x)  where x = clamp((t - a) / (b - a), 0, 1)
```

Smooth ease-in/ease-out between hours `a` and `b`.

## Adding New Elements

To add a new visual element to the cycle:

1. Define its behavior as a pure function of `hour` (and optionally `phase`)
2. Add the drawing code in the `draw()` function
3. Update this document with the new element's schedule
4. No wiring, no events, no callbacks — just read the clock
