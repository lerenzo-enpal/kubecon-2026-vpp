# Project: KubeCon 2026 VPP Presentation

## Style
- **No emoji** in slide components or visualizations. The presentation uses a dark, cinematic "Hollywood spy" UI aesthetic — clean monospace type, glowing accents, subtle grid backgrounds. Emoji breaks this tone.
- Color palette defined in `presentation/src/theme.js` — use those tokens, not hardcoded colors (except Databricks orange `#FF3621` / `#E25A1C`).
- Font: JetBrains Mono for all diagram/canvas text. Inter for slide headings/body.

## Architecture
- **Flexa** is the VPP Controller (joint venture Enpal + Entrix). Previously mislabeled "Flexor" in some places — always use "Flexa."
- Spark does NOT connect to EMQX directly.
- See `docs/architecture-data-flow.md` for the canonical data flow reference.

## Tech Stack
- React 18 + Spectacle (presentation framework)
- Vite build, TailwindCSS v4
- Canvas API for animated diagrams
- Deployed via Netlify
