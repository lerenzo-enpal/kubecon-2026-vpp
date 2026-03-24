# KubeCon 2026 — What is a Virtual Power Plant?

Cloud-Native Infrastructure for the Energy Grid

**Enpal / Flexa** — Building Europe's Largest Virtual Power Plant

## Presentation

Interactive slide deck built with React + Spectacle + Vite, featuring live cascading failure simulations.

### Getting Started

```bash
cd presentation
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Navigation

- **Arrow keys** or **Space** to advance slides
- **Shift+Space** to go back
- **Ctrl+Shift+O** / **Cmd+Shift+O** — Overview mode (all slides in a grid)
- **Ctrl+Shift+P** / **Cmd+Shift+P** — Presenter mode (current + next + notes)
- **Tab** / **Shift+Tab** — Navigate slides in overview mode
- **Enter** — Select slide in overview mode

### Structure

```
presentation/src/
├── Presentation.jsx              # Main deck — all slides
├── slides/
│   └── GridScaleSlides.jsx       # Grid scale bridge slides (Options A/B)
├── components/
│   ├── ui/                       # Reusable slide primitives
│   ├── TexasMapHUD.jsx           # deck.gl Texas cascade map
│   ├── SAMapHUD.jsx              # deck.gl SA blackout/VPP map
│   ├── EUGridHUD.jsx             # deck.gl EU grid with zoom steps
│   ├── FrequencyDemo.jsx         # Interactive frequency balancing act
│   ├── FrequencyLine.jsx         # Animated 50 Hz frequency trace
│   ├── CascadeSimulation.jsx     # German grid cascade (with/without VPP)
│   ├── DemandResponseDemo.jsx    # Interactive demand response animation
│   ├── RenewableGrowthChart.jsx  # Germany renewable growth chart
│   ├── DuckCurveChart.jsx        # Duck curve with VPP toggle
│   ├── KeplerDashboard.jsx       # Kepler energy monitoring dashboard
│   ├── CarbonAwareChart.jsx      # Carbon-aware scheduling chart
│   ├── EUGridMap.jsx             # Canvas EU grid map
│   ├── GridPulse.jsx             # Synchronized frequency pulse
│   ├── AnimatedStat.jsx          # Animated number counter
│   └── StaticTexasGrid.jsx       # Background grid decoration
└── theme.js                      # Colors, fonts, slide styles
```

### Offline Map Tiles

The presentation uses MapLibre/DeckGL map components that load tiles from CARTO's CDN at runtime. The map style loader (`src/utils/mapStyle.js`) uses a **local-first** strategy:

1. On load, it probes for local tiles (`presentation/public/tiles/`) — takes ~1ms on localhost
2. If found, uses local PMTiles (no outbound tile requests at all)
3. If not found, falls back to CARTO CDN transparently

To download tiles for offline use (e.g. presenting with an unreliable connection):

```bash
# Install the pmtiles CLI (one-time, macOS + Linux):
cd presentation
npm run offline:install-tools

# Download all tile regions (~6 GB total):
npm run offline:download-maps

# Remove local tiles and use CARTO CDN instead:
npm run offline:remove
```

This extracts regional [PMTiles](https://protomaps.com/docs/pmtiles) archives from the [Protomaps](https://protomaps.com) daily planet build using HTTP range requests — only the tiles for the regions and zoom levels actually used are downloaded. It also downloads the CARTO dark-matter style JSON, sprites, and font glyphs.

| Region file | Covers | Max zoom | Actual size |
|-------------|--------|----------|-------------|
| `europe.pmtiles` | EUGridHUD, LargestMachineZoom flyout | z12 | ~5.8 GB |
| `wolfsburg.pmtiles` | LargestMachineZoom start (zoom 14) | z14 | ~8 MB |
| `berlin.pmtiles` | VPPScenarioMapSlide (zoom up to 17, Reinickendorf) | z17 | ~45 MB |
| `adelaide.pmtiles` | SAMapHUD | z12 | ~11 MB |
| `texas.pmtiles` | TexasMapHUD | z9 | ~10 MB |

Output goes to `presentation/public/tiles/` which is gitignored — **each presenter needs to run this script on their machine.** Re-run at any time to refresh tiles from the latest Protomaps build.

```bash
# Force re-download everything:
npm run offline:download-maps -- --force

# Use a specific build date:
PROTOMAPS_DATE=20260315 npm run offline:download-maps
```

---

### Exporting to PDF

With the dev server running in another terminal:

```bash
cd presentation
npm run export:pdf
```

Output is auto-versioned in the project root: `20260324_vpp-presentation_v001.pdf`, `_v002.pdf`, etc.
Each run detects existing versions and increments automatically.

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Dev server port |
| `MAX_SLIDES` | `0` (all) | Limit to first N slides |
| `PAUSE` | `3` | Seconds to wait per slide |

Example with options:

```bash
PAUSE=5 MAX_SLIDES=10 npm run export:pdf
```

### Speaker Overlay

Add `?speaker=1` (or any truthy value) to the URL to show the assigned speaker (LERENZO / MARIO / SHARED) on each slide:

```
http://localhost:3000?speaker=1
```

To hide it, omit the param entirely or set it to a falsy value (`null`, `no`, `disable`, `nein`, `false`, `off`).

### Building for Production

```bash
npm run build
npm run preview
```

## Deployment

### GitHub Pages (primary)

Live at **[whatisavpp.com](https://whatisavpp.com)** — the website at the root, the presentation at `/presentation/`.

Triggered manually via the GitHub Actions "Run workflow" button on the `deploy-ghpages` workflow. The workflow builds both the website and presentation and assembles them into a single Pages artifact:

```
whatisavpp.com/            → website/dist/
whatisavpp.com/presentation/ → presentation/dist/ (base: /presentation/)
```

The `CNAME` file in `website/public/` pins the custom domain so it survives re-deploys.

**DNS records required** (apex domain — A records, not CNAME):
```
A  @  185.199.108.153
A  @  185.199.109.153
A  @  185.199.110.153
A  @  185.199.111.153
CNAME  www  lerenzo-enpal.github.io
```

**Base path:** The presentation is built with `--base /presentation/`. All asset paths (including map tile fetches and data file fetches) use `import.meta.env.BASE_URL` so they resolve correctly regardless of deploy path.

### Netlify (staging)

Live: [https://kubekon-vpp-2026.netlify.app](https://kubekon-vpp-2026.netlify.app) (password-protected)

- Manual deploy only — trigger via GitHub Actions "Run workflow" button
- Edge function handles HTTP Basic Auth (`SITE_PASSWORD` env var on Netlify)
- GitHub secrets required: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

## Research

Background research and references are in `docs/`.
