# Grid — Educational Website

An interactive educational website about electricity grids, renewable energy, and Virtual Power Plants. Ages 12+.

## Stack

- **Astro 6** — static site framework, zero JS by default
- **React** — interactive components (game, simulators) as Astro islands
- **TailwindCSS v4** — styling
- **MDX** — markdown with embedded React components

See [ADR-001](../docs/website/ADR-001-website-framework.md) for framework selection rationale.

## Development

```sh
cd website
npm install
npm run dev        # http://localhost:4321
npm run build      # Static output to dist/
npm run preview    # Preview the build locally
npm test           # Build check
```

## Structure

```
src/
  pages/           Page routes (.astro files)
    index.astro    Landing page (game + module nav)
    learn/         Hero content pages (7-15 modules)
  layouts/         Shared layouts (base, content with sidebar)
  components/      React components (game, interactives)
  styles/          Global CSS with design tokens
  content/         Content collections (incidents, research) — planned
public/            Static assets
```

## Content Modules

1. **How the Grid Works** — 50 Hz heartbeat, supply = demand, frequency collapse
2. **The Old Way** — peaker plants, spinning reserves, EUR 10B+/yr costs
3. **The Renewable Revolution** — duck curves, curtailment, negative prices
4. **The Virtual Power Plant** — homes as infrastructure, Hornsdale success
5. **The Future** — distributed resilience, software eating the grid

## Related Docs

- [Project Brief](../docs/website/project-brief.md) — vision, audience, content plan
- [Game Design](../docs/website/game-plan.md) — "Try to Crash the Grid" interactive
- [Style Guide](../docs/website/style-guide.md) — colors, typography, components
- [ADR-001](../docs/website/ADR-001-website-framework.md) — framework decision
