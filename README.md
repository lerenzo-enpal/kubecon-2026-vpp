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

The presentation uses 6 MapLibre/DeckGL map components that fetch tiles from CARTO's CDN at runtime. To make them work offline (e.g., during a talk with an unreliable connection), download the tile archives once while online:

```bash
# Install the pmtiles CLI (one-time, macOS + Linux):
npm run offline:install-tools

cd presentation
npm run offline:download-maps
```

This extracts regional [PMTiles](https://protomaps.com/docs/pmtiles) archives from the [Protomaps](https://protomaps.com) daily planet build using HTTP range requests — only the tiles for the regions and zoom levels actually used are downloaded. It also downloads the CARTO dark-matter style JSON, sprites, and font glyphs.

| Region file | Covers | Max zoom | Est. size |
|-------------|--------|----------|-----------|
| `europe.pmtiles` | EUGridHUD, LargestMachineZoom flyout | z12 | ~80 MB |
| `wolfsburg.pmtiles` | LargestMachineZoom start (zoom 14) | z14 | ~5 MB |
| `berlin.pmtiles` | VPPScenarioMapSlide (zoom up to 17, Reinickendorf) | z17 | ~15 MB |
| `adelaide.pmtiles` | SAMapHUD | z12 | ~10 MB |
| `texas.pmtiles` | TexasMapHUD | z9 | ~20 MB |

Output goes to `presentation/public/tiles/` which is gitignored — **each presenter needs to run this script on their machine.** Re-run at any time to refresh tiles from the latest Protomaps build.

```bash
# Force re-download everything:
npm run offline:download-maps -- --force

# Use a specific build date:
PROTOMAPS_DATE=20260315 npm run offline:download-maps
```

> **Note:** The tile files are downloaded but not yet wired into the map components. The integration step (adding the `@protomaps/maplibre-pmtiles` protocol handler and pointing components at local style files) is a separate task.

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

Live: [https://kubekon-vpp-2026.netlify.app](https://kubekon-vpp-2026.netlify.app) (password-protected)

Hosted on Netlify with basic auth.

- Manual deploy only — trigger via GitHub Actions "Run workflow" button
- Edge function handles HTTP Basic Auth (`SITE_PASSWORD` env var on Netlify)
- GitHub secrets required: `NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`

## Research

Background research and references are in `docs/`.
