# Japan Keynote Animation Components Guide

## Component Inventory

### Core Utilities (Reusable Layer)

#### `src/hooks/useAnimeJs.js`
```jsx
import { useAnimeTimeline, STAGGER_PATTERNS, EASING_PRESETS } from './hooks/useAnimeJs';

const { createTimeline, play, pause, reset, seek } = useAnimeTimeline();
const timeline = createTimeline({ autoplay: false });
timeline.add({...}, delay);
play();
```

**Stagger Patterns (use instead of hardcoding):**
- `LINEAR(i)` — i * 50ms
- `EXPONENTIAL(i)` — Math.pow(i, 1.5) * 30ms
- `WAVE(i)` — Sinusoidal offset
- `FIBONACCI(i)` — Fibonacci sequence
- `RANDOM(i)` — Math.random() * 300ms

**Easing Presets:**
- `SMOOTH_EASE_OUT` — 'easeOutQuart'
- `BOUNCE_IN` — 'easeInBounce'
- `ELASTIC_WAVE` — 'easeInOutElastic'
- `SPRING` — 'easeOutElastic'
- `LINEAR` — 'linear'

#### `src/utils/animationPatterns.js`
15+ animation patterns, all accept `timelineRef` + options:

```jsx
import { drawPath, pulseEffect, countUpNumber, gridPattern, gearRotation } from './utils/animationPatterns';

// SVG drawing
drawPath(timeline, '.my-path', { duration: 1000, easing: 'easeInOutQuad' });

// Emphasis
pulseEffect(timeline, '.my-element', { scale: 1.1, duration: 400 });

// Count-up numbers
countUpNumber(timeline, domElement, 100, { from: 0, duration: 800 });

// Grid reveals (spiral, wave, diagonal, random)
gridPattern(timeline, '.grid-items', { columns: 4, pattern: 'spiral' });

// Rotating gears
gearRotation(timeline, '.gear', { duration: 2000, rotations: 2 });
```

---

### Level 1: Stat & Explanation Components

#### `src/components/AnimatedStatBox.jsx`
Simple stat display with auto-count-up animation.

```jsx
import AnimatedStatBox, { STAT_COLORS } from './components/AnimatedStatBox';

<AnimatedStatBox
  stat={57}
  label="TWh by 2034"
  color={STAT_COLORS.amber}
  from={0}
  animateIn
  delay={200}
  pulse
/>
```

**Props:**
- `stat` (number|string) — Value to display
- `label` (string) — Description
- `color` (string) — Hex color code
- `from` (number) — Starting value for count-up
- `animateIn` (bool) — Trigger entrance animation
- `showBox` (bool) — Show background box
- `pulse` (bool) — Pulse on complete
- `delay` (number) — Animation delay in ms

#### `src/components/ExplanationBox.jsx`
Detailed explanation with icon, stat, and description. Includes 4 presets.

```jsx
import ExplanationBox, { EXPLANATION_PRESETS } from './components/ExplanationBox';

// Using preset
<ExplanationBox
  {...EXPLANATION_PRESETS.SELF_SUFFICIENCY}
  animateIn
  delay={100}
  direction="up"
/>

// Custom
<ExplanationBox
  title="Custom Stat"
  stat="25%"
  description="Explanation here..."
  color="#22d3ee"
  icon="📊"
  animateIn
  direction="left"
/>
```

**Preset Keys:**
- `SELF_SUFFICIENCY` — 15.3%, red
- `FOSSIL_FUEL` — 70%, orange
- `GRID_ISOLATION` — 1.2 GW, cyan
- `LNG_IMPORT` — 97%, amber

---

### Level 2: Map Components

#### `src/components/JapanGridMapAnimated.jsx`
Japan grid structure map with step-based animation (0-7 steps).

```jsx
import JapanGridMapAnimated from './components/JapanGridMapAnimated';

// In StepBridge
<StepBridge count={8}>
  {(step) => <JapanGridMapAnimated step={step} height={500} />}
</StepBridge>
```

**Steps:**
- 0: Japan outline appears
- 1: 50Hz utilities (east) + network
- 2: 60Hz utilities (west) + network
- 3: Frequency dividing line (1.2 GW bottleneck)
- 4: LNG terminals + import flows
- 5: Hormuz strait + connection
- 6: Self-sufficiency & fossil fuel stats with count-up
- 7: 50/60Hz seam sidebar

**Props:**
- `step` (0-7) — Animation sequence position
- `height` (px) — Container height
- `autoPlaySteps` (bool) — Auto-advance steps (not used in StepBridge)

#### `src/components/DataCenterMapOverlay.jsx`
Dual map + demand forecast showing data center locations and grid stress.

```jsx
import DataCenterMapOverlay from './components/DataCenterMapOverlay';

<DataCenterMapOverlay
  height={500}
  autoPlay
  showStress={true}
/>
```

**Props:**
- `height` (px) — Container height
- `autoPlay` (bool) — Start animation immediately
- `showStress` (bool) — Show stress zones & indicator gears

**Features:**
- 5 data center markers (Tokyo, Kanto, Kansai, Kyushu, Tohoku)
- Status badges (delayed=red, planning=amber)
- Right sidebar with demand curve (2024-2034)
- Optional stress visualization with gear rotations

---

### Level 3: Complex Animations

#### `src/components/EnergyUsageScalingAnimation.jsx`
3-phase scaling animation: home → building cluster → city grid.

```jsx
import EnergyUsageScalingAnimation from './components/EnergyUsageScalingAnimation';

<EnergyUsageScalingAnimation height={500} autoPlay={true} />
```

**Phases (automatic, 12 second total):**
- Phase 1 (0-3s): Single home with pulse + energy waves
- Phase 2 (3-7s): Scales to 9-building cluster with larger waves
- Phase 3 (7-12s): Expands to 25-building city grid with massive waves
- All elements pulse together in final state

**Props:**
- `height` (px) — Container height
- `autoPlay` (bool) — Start immediately

---

### Level 4: Composite Sequences

#### `src/components/JapanOpeningSequence.jsx`
Full opening slide sequence combining map + explanations.

```jsx
import JapanOpeningSequence from './components/JapanOpeningSequence';

<StepBridge count={8}>
  {(step) => <JapanOpeningSequence height={600} />}
</StepBridge>
```

**Behavior:**
- Steps 0-5: Map animation advances
- Step 6+: Explanation boxes appear (self-sufficiency + fossil fuel)
- Shows step labels at bottom

---

## Color System (DRY)

All components use CSS variables + preset hex values:

```jsx
const COLORS = {
  cyan: '#22d3ee',      // 50Hz, tech, healthy
  green: '#10b981',     // 60Hz, west, safe
  amber: '#FFC217',     // Data centers, warning
  orange: '#FFA35F',    // Hormuz, escalation
  red: '#ef4444',       // Crisis, delayed, urgent
  blue: '#3939D8',      // Grid, infrastructure
};
```

Use consistently across all components. CSS variables defined in spectacleTheme:
```css
--color-primary: #22d3ee;
--color-secondary: #10b981;
--color-warning: #FFA35F;
--color-danger: #ef4444;
```

---

## Integration Pattern (for Keynote.jsx)

### Example: Full Opening Sequence (Replaces current slides 2-6)

```jsx
// Slide 1: Map + Stats Sequence
<Slide backgroundColor={bg} padding="0">
  <LazyContent>
    <JapanOpeningSequence height={550} />
  </LazyContent>
  <Notes>Full Japanese grid structure with 50/60Hz seam, LNG vulnerability, and structural fragility stats.</Notes>
</Slide>

// Slide 2: Energy Scaling Animation
<Slide backgroundColor={bg} padding={pad}>
  <H>When it gets cold...</H>
  <Sub>Energy demand scales from homes to buildings to cities</Sub>
  <div style={{ marginTop: 12, height: 400 }}>
    <LazyContent>
      <EnergyUsageScalingAnimation height={400} autoPlay={true} />
    </LazyContent>
  </div>
  <Notes>One home uses X kW. A building uses 100x. A city uses 1000x. And in January 2021, demand spiked 25x normal.</Notes>
</Slide>

// Slide 3: Data Center Acceleration
<Slide backgroundColor={bg} padding="0">
  <LazyContent>
    <DataCenterMapOverlay height={580} autoPlay={true} showStress={true} />
  </LazyContent>
  <Notes>Now add 40 data center projects on top of a fragile grid. Delayed projects everywhere because the grid can't support them.</Notes>
</Slide>
```

---

## Animation Checklist for New Slides

When adding a new animated slide:

1. **Import** the component
2. **Wrap in LazyContent** (from SlideContext)
3. **Set height explicitly** (don't use 100%)
4. **Use autoPlay or step prop** appropriately
5. **Add descriptive Notes** for speaker
6. **Test with ?step=N** URL param (if step-based)

---

## Common Patterns

### Cascading Reveals
```jsx
timeline.add({ targets: '.items', opacity: [0, 1], stagger: STAGGER_PATTERNS.LINEAR });
```

### Count-Up Animations
```jsx
countUpNumber(timeline, element, finalValue, { from: 0, duration: 800, format: (v) => v.toFixed(1) });
```

### SVG Path Drawing
```jsx
drawPath(timeline, '.my-path', { duration: 1000, easing: 'easeInOutQuad' });
```

### Grid Patterns (spiral, wave, etc.)
```jsx
gridPattern(timeline, '.grid-item', { columns: 4, pattern: 'spiral', duration: 300 });
```

---

## Performance Notes

- All components use `LazyContent` wrapper to prevent rendering until slide is active
- Timelines auto-cleanup on unmount via `useAnimeJs` hook
- SVG animations preferred over Canvas for clarity and debuggability
- Use anime.js timeline pooling (reuse vs create new) for performance

---

## Next Steps

1. Update Keynote.jsx with new title + restructured slides
2. Add JEPX Pattern slide with scaling animation variant
3. Wire up all new components
4. Test ?step=N URL params for step-based slides
5. Fine-tune animation timings and colors
