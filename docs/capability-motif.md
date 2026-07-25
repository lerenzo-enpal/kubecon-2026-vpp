# Capability motifs and slide steps

The main talk uses two small reusable pieces for diagrams that reveal in
presentation order without adding per-slide animation code.

## `CapabilityMotif`

`presentation-japan/src/components/CapabilityMotif.jsx` renders compact SVG
explainers in the modern-washi palette. It currently has three variants:

| Variant | Use | Animation |
| --- | --- | --- |
| `network` | Grid → batteries + internet → new capabilities | Pulses travel left to right as each connection is revealed. |
| `store` | Solar → battery → home | Energy pulses and battery fill. |
| `respond` | Grid event → home, EV, battery | Dispatch pulses branch to assets. |

All variants are responsive SVGs and accept the surrounding layout's width.
They use semantic `role="img"` and `aria-label` text, so use the component as
the complete visual rather than recreating its icons beside it.

```jsx
import { CapabilityMotif } from './components/CapabilityMotif.jsx';

<CapabilityMotif variant="store" />
<CapabilityMotif variant="respond" />
```

### Network state

`network` also accepts `step` (0–2; values outside that range are clamped).

| Step | Visible state |
| --- | --- |
| `0` | Grid today |
| `1` | Batteries + internet and the first connector pulses |
| `2` | New capabilities and the second connector pulses |

The pulsing animation is powered by the existing `useAnimeTimeline` hook. It
only runs while Spectacle marks the slide active; unmounting or leaving the
slide pauses the timeline. Keep this active-slide guard whenever copying this
pattern into an animated component.

## `StepBridge`

`presentation-japan/src/components/StepBridge.jsx` adapts Spectacle's
`useSteps` to a render prop. It returns a stable, zero-based step value and
keeps step registration inside the mounted bridge. This matters because a
component that calls `useSteps` must not itself be wrapped in `Lazy`.

```jsx
import StepBridge from './components/StepBridge.jsx';

<StepBridge count={2}>
  {step => <CapabilityMotif variant="network" step={step} />}
</StepBridge>
```

`count` is the number of forward advances, not the number of states. Thus
`count={2}` produces steps `0`, `1`, and `2`—three authored states.

For a step-driven heavy visual, put `StepBridge` outside `Lazy` and place
`Lazy` inside the render function:

```jsx
<StepBridge count={2}>
  {step => <Lazy><JapanGridAtlas step={step} /></Lazy>}
</StepBridge>
```

## Reusing it in another deck

1. Import `CapabilityMotif` and `StepBridge` from `presentation-japan/src/components/`.
2. Use `network` with `StepBridge` when the speaker should reveal the causal
   chain; use `store` or `respond` as a static supporting visual.
3. Preserve the theme CSS variables (`--color-primary`, `--color-secondary`,
   and `--color-washi-*`) or the SVG will lose its intended palette.
4. For new variants, add only an SVG branch in `CapabilityMotif`, tag animated
   elements with `data-motif-pulse`, and retain the `SlideContext` active-slide
   gate. Add a focused source assertion in
   `presentation-japan/tests/main-talk-rendering.cjs`.

## Current use

Main talk slide 2 is the network version:

```jsx
<StepBridge count={2}>
  {step => <CapabilityMotif variant="network" step={step} />}
</StepBridge>
```

The map slide immediately after it uses the same bridge pattern, so advancing
continues naturally from the conceptual network into the Japan grid atlas.
