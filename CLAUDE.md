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

## Styling
- **Prefer Tailwind utility classes over inline styles.** Use `className="h-32"` not `style={{ height: 128 }}`. Use `text-xl` not `text-[22px]`. Only use inline styles for dynamic values that depend on JS variables (e.g. theme colors).
- **Use Tailwind's built-in size scale** (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.) instead of arbitrary values like `text-[20px]`. Arbitrary values should be the exception, not the default.

## Visual Validation
- **Use the Playwright MCP tools** (`browser_navigate`, `browser_take_screenshot`, `browser_press_key`) for visual validation of slides. Do not write Node scripts for screenshots.
- Navigate to slides via `http://localhost:5199/?slideIndex=N` (0-indexed).
- If the Playwright MCP server is not available, ask the user to install it before proceeding with visual work.
- Always screenshot after making visual changes to verify before asking the user to review.

## Git Workflow
- **Never push without explicit permission.** Commit freely when asked, but always wait for the user to say "push" before running `git push`.
- No `Co-Authored-By` lines in commits.
