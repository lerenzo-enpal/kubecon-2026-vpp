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
- **F** for fullscreen
- **P** for presenter mode (with speaker notes)

### Structure

```
presentation/src/
├── Presentation.jsx          # Main deck — imports all slides
├── slides/
│   ├── Act1GridBreaking.jsx  # "The Grid is Breaking" (8 slides)
│   ├── Act2Batteries.jsx     # "Batteries Change Everything" (6 slides)
│   ├── Act3VPP.jsx           # "The Virtual Power Plant" (8 slides)
│   └── Closing.jsx           # Back to Berlin + Thank You (4 slides)
├── components/
│   ├── ui/                   # Reusable slide primitives
│   ├── CascadeSimulation.jsx # Interactive German grid cascade demo
│   ├── FrequencyLine.jsx     # Animated 50 Hz frequency trace
│   └── GridBackground.jsx    # Subtle grid pattern overlay
└── theme.js                  # Colors, fonts, slide styles
```

### Building for Production

```bash
npm run build
npm run preview
```

## Research

Background research and references are in `docs/`.
