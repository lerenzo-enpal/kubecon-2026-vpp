# Animation Components Architecture

## Dependency Graph

```
                    useAnimeJs Hook
                          ▲
                          │
                ┌─────────┼─────────┐
                │         │         │
        animationPatterns  │   STAGGER_PATTERNS
                │         │         │
                └─────────┼─────────┘
                          ▼
                    ┌──────────────────────────────────────────┐
                    │   Animation Utilities (DRY Layer)         │
                    ├──────────────────────────────────────────┤
                    │ • drawPath()          • pulseEffect()     │
                    │ • countUpNumber()     • colorWave()       │
                    │ • gearRotation()      • gridPattern()     │
                    │ • morphShape()        • followPath()      │
                    │ • radialBurst()       • flipInStagger()   │
                    └──────────────────────────────────────────┘
                                    ▲
                ┌───────────────────┼───────────────────┐
                │                   │                   │
                ▼                   ▼                   ▼
        ┌───────────────┐   ┌────────────────┐  ┌────────────────┐
        │ AnimatedStatBox│   │ ExplanationBox │  │   EnergyUsage   │
        └───────────────┘   └────────────────┘  │  Scaling        │
                                                 │  Animation      │
                                                 └────────────────┘
                              ▲                            ▲
                              │                            │
                    ┌─────────┴────────┐                   │
                    │                  │                   │
            ┌───────────────┐  ┌──────────────┐            │
            │JapanGridMap   │  │DataCenter    │            │
            │Animated       │  │MapOverlay    │            │
            └───────────────┘  └──────────────┘            │
                    │                  │                   │
                    │                  │                   │
                    └────────┬─────────┴───────────────────┘
                             │
                             ▼
                    ┌────────────────────────┐
                    │JapanOpeningSequence    │
                    │(composite)             │
                    └────────────────────────┘
                             │
                             ▼
                    ┌────────────────────────┐
                    │  Keynote.jsx           │
                    │  (via Spectacle Deck)  │
                    └────────────────────────┘
```

## Component Hierarchy

### Layer 0: Hooks & Utilities (Reusable, No UI)
- `useAnimeJs.js` — Timeline management, lifecycle cleanup
- `animationPatterns.js` — 15+ animation functions

**DRY Principles:**
- Single source of truth for stagger patterns
- Centralized easing presets
- Reusable timeline factory

### Layer 1: Atomic Components (Standalone, Simple)
- `AnimatedStatBox.jsx` — Number + label, auto count-up
- `ExplanationBox.jsx` — Title + icon + stat + description

**Reusability:**
- Can be used individually anywhere
- Accept animation props (delay, direction, autoAnimate)
- Color + text fully configurable

### Layer 2: Complex Map Components (Stateful, SVG)
- `JapanGridMapAnimated.jsx` — 8-step sequence, 50/60Hz seam, utilities
- `DataCenterMapOverlay.jsx` — Dual view (map + demand chart)
- `EnergyUsageScalingAnimation.jsx` — 3-phase scaling (home→building→city)

**Composition:**
- Built on Layer 1 atoms + Layer 0 utilities
- Each self-contained, can be dropped into any slide
- Use anime.js timeline for smooth sequencing

### Layer 3: Composite Sequences (StepBridge-aware)
- `JapanOpeningSequence.jsx` — Combines JapanGridMapAnimated + ExplanationBox
- Wraps Layer 2 components
- Responds to StepBridge steps

### Layer 4: Presentation (Spectacle Deck)
- `Keynote.jsx` — Imports all components
- Wraps in `LazyContent` for performance
- Uses StepBridge for step-based slides

---

## Color System (Global)

All components use this consistent palette:

| Color | Hex | Use | Semantics |
|-------|-----|-----|-----------|
| Cyan | #22d3ee | 50Hz (East), Technology | Safe, stable |
| Green | #10b981 | 60Hz (West), Healthy | OK, success |
| Amber | #FFC217 | Data Centers, Warning | Attention needed |
| Orange | #FFA35F | Hormuz, Escalation | Critical, urgent |
| Red | #ef4444 | Crisis, Delayed | Danger, problem |
| Blue | #3939D8 | Grid, Infrastructure | Foundation |

---

## Stagger Patterns (Global)

All components that cascade/stagger use these patterns:

```javascript
LINEAR: (i) => i * 50                           // 0, 50, 100, 150, ...
EXPONENTIAL: (i) => Math.pow(i, 1.5) * 30      // Accelerating
WAVE: (i) => Math.sin(i * 0.5) * 100 + i * 20  // Oscillating
FIBONACCI: (i) => fib[i] * 10                  // Following sequence
RANDOM: (i) => Math.random() * 300             // Chaotic
```

Use EVERYWHERE instead of hardcoding delays.

---

## File Organization

```
presentation-japan/
├── src/
│   ├── hooks/
│   │   └── useAnimeJs.js                    ← Timeline management
│   ├── utils/
│   │   └── animationPatterns.js             ← 15+ animation patterns
│   ├── components/
│   │   ├── AnimatedStatBox.jsx              ← Atomic
│   │   ├── ExplanationBox.jsx               ← Atomic
│   │   ├── EnergyUsageScalingAnimation.jsx  ← Complex
│   │   ├── JapanGridMapAnimated.jsx         ← Complex
│   │   ├── DataCenterMapOverlay.jsx         ← Complex
│   │   ├── JapanOpeningSequence.jsx         ← Composite
│   │   ├── HormuzInfographic.jsx            ← Existing
│   │   ├── StepBridge.jsx                   ← Existing
│   │   └── Keynote.jsx                      ← Main (needs updates)
│   └── ...
├── ANIMATION_COMPONENTS_GUIDE.md            ← Usage guide
└── COMPONENTS_ARCHITECTURE.md               ← This file
```

---

## Import Pattern (DRY)

### Bad ❌
```jsx
// Repeating animation logic in component
const timeline = anime.timeline();
timeline.add({ targets: '.x', opacity: [0, 1], duration: 400 });
timeline.add({ targets: '.y', opacity: [0, 1], duration: 400, delay: 100 });
```

### Good ✅
```jsx
// Reusing patterns
import { useAnimeTimeline, STAGGER_PATTERNS } from '../hooks/useAnimeJs';
import { pulseEffect, colorWave } from '../utils/animationPatterns';

const { createTimeline, play } = useAnimeTimeline();
const timeline = createTimeline();
timeline.add({
  targets: '.items',
  opacity: [0, 1],
  delay: (el, i) => STAGGER_PATTERNS.LINEAR(i),
});
pulseEffect(timeline, '.items', { scale: 1.1 });
```

---

## Performance Characteristics

| Component | Render Cost | Animation Cost | LazyLoad? |
|-----------|------------|----------------|-----------|
| AnimatedStatBox | Low | Very Low | Optional |
| ExplanationBox | Low | Very Low | Optional |
| EnergyUsageScalingAnimation | Medium | Medium | Yes |
| JapanGridMapAnimated | Medium | Medium | Yes |
| DataCenterMapOverlay | Medium | Medium | Yes |
| JapanOpeningSequence | Medium | Medium | Yes |

All wrapped in `<LazyContent>` when used in Keynote slides.

---

## Animation Timings (Consistent)

All components use consistent timing windows:

- **Fast:** 300-400ms (state changes, simple enters)
- **Medium:** 600-800ms (complex sequences, counts)
- **Slow:** 1200-2000ms (map zooms, full page transitions)
- **Loop:** 3000-4000ms (continuous effects, pulses)

**Delay staggering:** Always use STAGGER_PATTERNS for multi-element reveals.

---

## Testing Checklist

When integrating a new component into Keynote:

- [ ] Component renders without errors
- [ ] LazyContent wrapper used (no render before slide active)
- [ ] Height prop set explicitly
- [ ] Animation plays on slide enter
- [ ] Color matches theme (dark/light)
- [ ] Text readable (contrast check)
- [ ] Notes added for speaker
- [ ] ?step=N URL param works (if step-based)
- [ ] Cleanup (timelines stop on unmount)

---

## Future Extensibility

To add new animations:

1. **Atomic pattern?** → Add to `animationPatterns.js`
2. **New component?** → Create in `src/components/`
3. **Reusable logic?** → Extract to utils or hooks
4. **Color or timing?** → Update COLORS or STAGGER_PATTERNS at top of this doc

Keep components single-responsibility. Compose, don't duplicate.
