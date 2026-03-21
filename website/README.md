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

## Deployment

Two independent deployments:

| Host | What | Trigger | Config |
|------|------|---------|--------|
| **Netlify** | Presentation only | [Manual trigger](https://github.com/lerenzo-enpal/kubecon-2026-vpp/actions/workflows/deploy-netlify.yml) | `.github/workflows/deploy-netlify.yml` |
| **GitHub Pages** | Website + presentation | [Manual trigger](https://github.com/lerenzo-enpal/kubecon-2026-vpp/actions/workflows/deploy-ghpages.yml) | `.github/workflows/deploy-ghpages.yml` |

### Netlify (presentation only)

1. Go to [Actions > Deploy to Netlify](https://github.com/lerenzo-enpal/kubecon-2026-vpp/actions/workflows/deploy-netlify.yml)
2. Click **Run workflow**

Requires `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` secrets. See `docs/netlify-deploy.md` for CLI deploy.

### GitHub Pages (full site)

1. Go to [Actions > Deploy to GitHub Pages](https://github.com/lerenzo-enpal/kubecon-2026-vpp/actions/workflows/deploy-ghpages.yml)
2. Click **Run workflow**

This is a manual trigger — it never auto-deploys on push. Builds both the website and presentation, serves them combined.

### Pre-deploy check (optional)

```sh
./scripts/build-deploy.sh   # builds both into _site/
npx serve _site              # static preview (no hot reload)
```

For development with hot reload, use the dev servers directly:

```sh
cd website && npm run dev       # website at localhost:4321
cd presentation && npm run dev  # slides at localhost:3000
# or run both: ./scripts/dev.sh
```

### URL structure (GitHub Pages)

| Path | Content |
|------|---------|
| `/` | Educational website (Astro) |
| `/learn/*` | Content modules |
| `/research/*` | Incident and topic pages |
| `/slides/` | KubeCon 2026 presentation (Spectacle) |

## Related Docs

- [Project Brief](../docs/website/project-brief.md) — vision, audience, content plan
- [Game Design](../docs/website/game-plan.md) — "Try to Crash the Grid" interactive
- [Style Guide](../docs/website/style-guide.md) — colors, typography, components
- [ADR-001](../docs/website/ADR-001-website-framework.md) — framework decision
