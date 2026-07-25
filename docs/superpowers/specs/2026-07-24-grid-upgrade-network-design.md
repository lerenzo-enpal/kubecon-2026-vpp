# Grid Upgrade Network Design

## Goal

Replace the slide 2 pathway concept with a connected visual network that explains the progression from grid infrastructure, through batteries and internet, to new operating capabilities.

## Design

The slide uses one full-width, left-to-right network:

- **Grid** on the left: generation, transmission, and market signals.
- **Batteries + internet** in the center: the enabling layer.
- **New capabilities** on the right: store, respond, and coordinate.

Thin connectors move energy/data pulses from left to right. Nodes have small, restrained Anime.js loops; there is no visible pyramid. The composition follows the modern-washi palette and fills the slide rather than adding a frame.

## Interaction and steps

Slide steps reveal the network in the same causal order: grid, enablers plus connections, then capability nodes. Existing Spectacle step control remains the source of authored state. The visual is presentation-only: no new controls, dependency, data source, or abstraction are needed.

## Implementation

Extend the existing reusable `CapabilityMotif` with a focused grid-network variant, reusing its Anime.js timeline and active-slide gating. Wire that variant into slide 2 of `MainTalk.jsx`. Add a source-level rendering assertion for the new variant and retain existing deck checks.

## Acceptance criteria

- Slide 2 visibly reads left-to-right as Grid → Batteries + Internet → New capabilities.
- The nodes and connector pulses animate only while the slide is active.
- The three stages reveal progressively through the existing slide step flow.
- No packages are added; existing Anime.js helpers are reused.
