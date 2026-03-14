# Design & Presentation Guidance

## Visual Theme: "Mission Control"

Think James Bond war room meets Bloomberg terminal. This is critical infrastructure — the visuals should feel like you're watching a real-time grid operations dashboard, not a startup pitch deck.

### Principles

- **High-stakes control room aesthetic** — dark backgrounds, glowing data, pulsing warnings. The audience should feel like they're watching something important happen in real time.
- **Data is the decoration** — no clip art, no stock photos. Animated frequency lines, live numbers, pulsing grid nodes. Every visual element should feel functional, like it belongs on a control panel.
- **Tension through animation** — when things go wrong, the UI should feel it. Red pulses, warning flashes, frequency lines dropping. When things stabilize (VPP kicks in), green calm washes over. The emotional arc is in the visuals.
- **Typography as hierarchy** — JetBrains Mono for data/numbers (feels like a terminal readout), Inter for narrative text. Numbers should be big, bold, and glowing.
- **Color encodes meaning** — cyan (#22d3ee) = grid/stable, green (#10b981) = VPP/batteries/success, red (#ef4444) = failure/danger, amber (#f59e0b) = warning/solar, purple (#a78bfa) = secondary systems. Never use color decoratively — it always means something.

### Animation Style

- Warning messages should flash like real SCADA alerts — not gentle fades, but urgent blinks
- Frequency lines should have subtle jitter when stable (feels alive) and dramatic drops when failing
- Transitions between states should feel like systems responding, not slides animating
- "GRID FAILURE IMMINENT" style warnings: uppercase, monospace, red glow, pulsing opacity

### Screen Real Estate

- Maximize use of the full viewport for visualizations and data
- Push stat cards / metadata to edges (bottom-aligned) to leave center stage for the hero visual
- Avoid centering everything — asymmetric layouts feel more like dashboards
- Let animations breathe — give them the space they need to land emotionally
