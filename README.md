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

### Exporting to PDF

With the dev server running:

```bash
npm run export:pdf
```

This generates `presentation.pdf` in the project root. Requires `puppeteer` (installed via `decktape`).

You can also specify a custom output path:

```bash
node scripts/export-pdf.mjs my-export.pdf
```

### Building for Production

```bash
npm run build
npm run preview
```

## Research

Background research and references are in `docs/`.
