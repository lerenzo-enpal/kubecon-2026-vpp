# Website Development Guidelines

## Stack
- Astro 6 + React islands + TailwindCSS v4 + MDX
- See `docs/website/ADR-001-website-framework.md` for rationale

## Style
- Dark mode is the default. Light mode must also be supported.
- Use CSS custom properties from `src/styles/global.css` for all colors — never hardcode hex values in components.
- Dark/light switching uses `prefers-color-scheme` media query and a manual toggle.
- Font: Inter for body/headings, JetBrains Mono for code/data/labels.
- No emoji in content or UI.
- Design tokens and visual language inherited from the presentation — see `docs/website/style-guide.md`.

## Dark/Light Mode
- All color tokens must have both dark and light values defined in `global.css`.
- Default (no class): dark mode.
- `.light` class on `<html>`: light mode.
- `@media (prefers-color-scheme: light)` should apply `.light` unless user has explicitly chosen dark.
- Every component must look correct in both modes. Test both before committing visual changes.

## Architecture
- `.astro` files for pages and layouts (static HTML, zero JS).
- React components only for interactive elements — use `client:visible` (lazy) or `client:load` (immediate) hydration directives.
- Do not share React context across islands. Use nanostores if cross-island state is needed.
- Content pages use the `ContentLayout.astro` layout (includes sidebar TOC).

## Content
- Audience is ages 12+. Use plain language. Define jargon on first use.
- Active voice, present tense for explanations, past tense for incidents.
- Short paragraphs (3-4 sentences max).
- All claims must link to sources in the research library.

## Testing
- `npm test` runs build + content verification checks.
- Add checks to `test/build-check.mjs` when adding new pages.
