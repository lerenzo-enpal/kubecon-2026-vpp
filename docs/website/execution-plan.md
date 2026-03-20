# Website Execution Plan

## Current State (March 20, 2026)

### Working
- Astro 6 + React + Tailwind + MDX scaffold
- Landing page with two-panel layout (module nav + game placeholder)
- Module 1: How the Grid Works (full hero content)
- Base layout + content layout with basic sidebar
- Dark/light theme toggle
- Build test (10 checks)
- CI pipeline

### Missing — 404s
- `/learn/the-old-way`
- `/learn/the-renewable-revolution`
- `/learn/the-virtual-power-plant`
- `/learn/the-future`
- `/research` (library index)
- `/research/incidents/*` (12 incident pages)
- `/research/topics/*` (topic research pages)
- `/about`

### Missing — Features
- Expanded TOC with per-page sections
- Interactive components (none ported yet)
- Research library (content collections not set up)
- No animations or scroll effects

---

## Phase 1: Content Pages (eliminate 404s)

Priority: get all linked pages existing with real content. No interactives yet — just styled text, tables, stat boxes, and steppers.

### Hero Content Pages (custom-designed)

Each page follows the Module 1 pattern: Astro page with styled HTML, stat grids, color-coded cards, "next module" links.

| Page | Source Material | Key Visuals |
|------|---------------|-------------|
| Module 2: The Old Way | `docs/research/grid-flexibility-costs-research.md`, Old Playbook slide notes | Cost stat boxes (EUR 6.5B, 15%, EUR 4.2B, 10 TWh), stepper revealing each cost category |
| Module 3: The Renewable Revolution | `docs/research/electricity-price-research.md`, `docs/research/research-german-grid-curtailment.md`, duck curve slide notes | Growth chart placeholder, duck curve placeholder, negative price examples |
| Module 4: The Virtual Power Plant | `docs/research/demand-response-research.md`, `docs/research/enpal_flexa_research.md`, VPP slide notes | Home device diagram placeholder, Hornsdale timeline, VPP coordination concept |
| Module 5: The Future | Presentation closing slides | Vision cards, call to action |

### Research Library

Auto-generated from markdown using Astro content collections.

1. Set up content collections in `src/content/config.ts`
2. Add frontmatter to incident and research markdown files (title, date, location, type)
3. Create `/research/index.astro` — browsable grid of all research
4. Create `/research/incidents/[slug].astro` — incident detail pages
5. Create `/research/topics/[slug].astro` — topic research pages
6. Symlink or copy markdown from `docs/incidents/` and `docs/research/` into `src/content/`

### Simple Pages

| Page | Content |
|------|---------|
| `/about` | Project background, contributors, open source links, KubeCon context |

---

## Phase 2: Enhanced TOC

Replace the flat module list with an expandable sidebar:

### Behavior
- Always show all 5 module titles
- When on a module page, expand that module to show its h2 sections
- h2 sections link to `#anchors` on the page
- Current section highlighted (scroll-spy)
- Research Library section at bottom with expandable sub-nav (Incidents, Topics)
- Collapse/expand is CSS-only (no React needed)

### Implementation
- Each hero page exports its section headings as frontmatter or a data array
- ContentLayout reads the headings and renders the expanded sub-nav
- Auto-generate `id` attributes on h2 elements for anchor linking
- Optional: IntersectionObserver for scroll-spy highlighting (tiny inline script)

---

## Phase 3: Interactive Components

Port presentation React components as Astro islands. Each interactive is self-contained.

| Component | Source | Island Directive | Page |
|-----------|--------|-----------------|------|
| FrequencyPlayground | `presentation/src/components/FrequencyDemo.jsx` (simplified) | `client:visible` | Module 1 |
| DuckCurveExplorer | `presentation/src/components/DuckCurveChart.jsx` | `client:visible` | Module 3 |
| VPPHomeView | `presentation/src/components/HomeDetailView.jsx` | `client:visible` | Module 4 |
| IncidentTimeline | New — step-through cascade viewer | `client:visible` | Module 2, Research |
| CostCalculator | New — country/region cost breakdown | `client:visible` | Module 2 |
| CurtailmentChart | `presentation/src/components/CurtailmentChart.jsx` | `client:visible` | Module 3 |

### Approach
1. Copy component from `presentation/src/components/`
2. Remove Spectacle dependencies (SlideContext, Notes, Stepper)
3. Make self-contained (own state, own animation triggers)
4. Add `client:visible` in the Astro page where embedded
5. Test in both dark and light modes

---

## Phase 4: The Game

See `docs/website/game-plan.md` for full design.

Build order:
1. Grid simulation state machine (pure JS, no visuals)
2. deck.gl map with nodes and edges
3. Player actions wired to simulation
4. Explainer feed component
5. Authored cascade paths + explainer text
6. Content deep links from explainer to module/research pages

---

## Phase 5: Animations & Polish

Scroll-triggered animations for content pages:

| Effect | Where | Implementation |
|--------|-------|---------------|
| Fade + slide up on scroll | All content sections | IntersectionObserver + CSS transitions |
| Stat count-up | Stat boxes on all modules | IntersectionObserver + requestAnimationFrame |
| Border trace-in | Cards and callout boxes | CSS animation triggered on scroll-enter |
| Staggered reveal | Lists and grid items | CSS transition-delay based on index |

All animations respect `prefers-reduced-motion`.

---

## Suggested Build Order

1. **Modules 2-5** — eliminate 404s, real content on every page
2. **Research library** — content collections, auto-generated pages
3. **Enhanced TOC** — expandable sections, scroll-spy
4. **Port FrequencyPlayground** — first interactive, proves the island pattern
5. **Port remaining interactives** — duck curve, VPP home, curtailment chart
6. **Scroll animations** — fade-in, count-up, trace-in
7. **Game** — Phase 4 above
8. **About page** — last, lowest priority

---

## Open Decisions

- [ ] Should research markdown live in `website/src/content/` (copied) or symlinked from `docs/`?
- [ ] How to handle frontmatter — add it to existing docs or create wrapper files?
- [ ] Should the TOC sections be defined in frontmatter or auto-extracted from h2s?
- [ ] Mobile nav: hamburger menu or bottom sheet?
