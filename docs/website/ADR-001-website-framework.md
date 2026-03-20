# ADR-001: Website Framework Selection

**Status:** Proposed
**Date:** 2026-03-20
**Decision Makers:** Mario, Lerenzo

## Context

We are building an educational website (ages 12+) about electricity grids and Virtual Power Plants. The site has two distinct content tiers:

1. **Hero content** (7-15 sections) — highly designed pages with custom layouts, styled tables, steppers, scroll animations, and embedded interactive components (deck.gl maps, Canvas API simulations, a grid-crash game)
2. **Research library** (30+ pages) — auto-generated from existing markdown research documents in `docs/incidents/` and `docs/research/`

The site must work well on school Chromebooks and tablets, be discoverable via search engines, and deploy as a static site with no server.

### Requirements

| Requirement | Priority |
|------------|----------|
| Reuse existing React components from the presentation (deck.gl, Canvas API, frequency demo) | Must |
| Render 30+ markdown/MDX research pages from existing docs | Must |
| Custom-designed hero pages with embedded interactives | Must |
| Fast load on school Wi-Fi / Chromebooks | Must |
| SEO — full HTML for search indexing | Must |
| Static deployment (Netlify, Vercel, or GitHub Pages) | Must |
| TailwindCSS for styling | Must |
| No server runtime | Must |
| MDX with embedded React components | Should |
| Typed content collections with frontmatter validation | Should |
| Minimal JS shipped on text-heavy reference pages | Should |

## Options Considered

### Option 1: Vite + React SPA + MDX

The same stack as our existing presentation. Plain client-side React app with `@mdx-js/rollup` for MDX support.

**Pros:**
- Zero learning curve — identical to the presentation
- Smallest per-page bundle for interactive pages
- Direct component reuse, no wrappers

**Cons:**
- No built-in SSG — requires Vike or custom prerendering for 30+ pages
- SEO is poor without prerendering (SPA renders blank HTML until JS loads)
- No content collection abstraction — must build frontmatter parsing, slug generation, navigation, pagination from scratch
- Every page ships the full React runtime, even text-only research pages
- Reinventing content infrastructure that other frameworks provide out of the box

**Verdict:** Feasible but significant DIY overhead for the content pipeline. The presentation is a single-page app with no SEO needs — the website has fundamentally different requirements.

### Option 2: Next.js 16 (App Router, Static Export)

Full React framework with `output: 'export'` for static generation. Official MDX support via `@next/mdx`.

**Pros:**
- Mature, well-documented, large ecosystem
- Static export produces full HTML (good SEO)
- MDX support is first-party and stable
- File-based routing handles page generation
- Automatic code splitting per page

**Cons:**
- App Router complexity designed for server-rendered apps (server components, `"use client"` directives, streaming, suspense boundaries) — unnecessary for a static site
- ~57% larger client bundles than equivalent Vite builds in benchmarks
- No partial hydration — every page ships the full React runtime regardless of whether it has interactive elements
- Slower production builds than Vite (uses webpack, not Rollup)
- Static export disables several features (image optimization, ISR, middleware) — you pay the complexity tax without the benefits

**Verdict:** Works, but over-engineered. The framework is optimized for dynamic server-rendered apps. For a static content site, much of the complexity is dead weight.

### Option 3: Astro 6 + React Islands

Content-first framework that ships zero JS by default. React components are embedded as "islands" with explicit hydration directives (`client:load`, `client:visible`, `client:idle`).

**Pros:**
- Purpose-built for content sites with selective interactivity — exactly our architecture
- Content Collections API: point at a markdown folder, get typed frontmatter, auto-slugs, pagination, filtering. Our `docs/incidents/` and `docs/research/` become browsable pages with minimal code
- Partial hydration: research pages (text + tables) ship zero JS. Hero pages only ship JS for interactive islands (deck.gl, Canvas, game). Chromebook performance is maximized
- SEO: full static HTML by default for every page
- Stable React integration (`@astrojs/react` v5.0.1) — existing components work with `client:load` or `client:visible`
- Acquired by Cloudflare (Jan 2026) — long-term investment, remains open source, backed by ecosystem fund with Netlify, Webflow, Sentry
- 60% of Astro sites score "Good" on Core Web Vitals vs 38% for other frameworks

**Cons:**
- Learning curve: Astro templates use a JSX-like syntax that is NOT React (no state, no hooks). Requires understanding two component models
- Island boundaries: React context does not span across islands. Each `client:*` component is an independent React root. Shared state between islands requires external stores (nanostores)
- Hot reload for `.astro` files sometimes requires full page reload vs React HMR

**Mitigations:**
- The island boundary constraint is natural for our use case — the deck.gl map, frequency simulator, and game are already self-contained components that don't share state with each other
- Astro's template syntax is closer to plain HTML than JSX — small learning curve for anyone who knows HTML
- The presentation's React components are all self-contained with internal state — they'll work as islands without modification

**Verdict:** Best architectural fit. The content collection system eliminates the biggest implementation risk (building a content pipeline for 30+ research pages). Partial hydration directly addresses the Chromebook performance requirement.

### Option 4: React Router v7 (formerly Remix)

Vite-based React framework with pre-rendering support. MDX via community packages.

**Pros:**
- Vite-based, lighter than Next.js
- Pre-rendering produces static HTML
- React Router is the de facto standard

**Cons:**
- Framework strengths (data loaders, form actions, progressive enhancement) are irrelevant for a static content site
- MDX support is community-driven, not first-party — less documentation, fewer examples
- No content collection equivalent — must build your own content pipeline
- No partial hydration — full React runtime on every page

**Verdict:** Wrong tool. Optimized for dynamic apps with data mutations, not content sites.

## Decision

**Astro 6 + React Islands + TailwindCSS + MDX**

### Architecture

```
Landing page (.astro)
├── Left panel: Welcome + nav (static HTML, zero JS)
├── Right panel: Grid crash game (React island, client:load)

Hero content pages (.astro)
├── Layout shell (static HTML)
├── Styled content (HTML + Tailwind, zero JS)
├── Interactive elements (React islands, client:visible)
│   ├── Frequency simulator
│   ├── Duck curve explorer
│   ├── VPP home view
│   └── Incident timeline stepper

Research library (MDX via Content Collections)
├── docs/incidents/*.md → /research/incidents/[slug]
├── docs/research/*.md → /research/topics/[slug]
└── Shared layout with sidebar TOC (static HTML)
```

### How Components Map

| Presentation Component | Website Usage | Hydration |
|----------------------|--------------|-----------|
| FrequencyDemo | Module 1 interactive | `client:visible` |
| DuckCurveChart | Module 3 interactive | `client:visible` |
| HomeDetailView | Module 4 interactive | `client:visible` |
| deck.gl maps | Game, incident maps | `client:load` (game), `client:visible` (others) |
| Canvas animations | Various hero pages | `client:visible` |

### Content Pipeline

```
docs/incidents/*/research.md  →  Content Collection "incidents"
docs/research/*.md             →  Content Collection "research"
```

Astro validates frontmatter against a Zod schema, generates slugs, provides typed queries. No custom build scripts needed.

## Consequences

**Positive:**
- Research pages auto-generated from existing markdown — minimal content migration
- Chromebook users get fast page loads (zero JS on reference pages)
- Search engines index full HTML content
- Existing React components reused without modification
- Content collections provide type safety and validation for research docs

**Negative:**
- Team must learn Astro's template syntax (small overhead — it's close to HTML)
- Cross-island state sharing requires nanostores instead of React context
- Two component models (.astro for layout, React for interactivity) adds cognitive overhead

**Neutral:**
- Deployment is identical to current setup (static files to Netlify)
- TailwindCSS works the same way in both Astro and React

## References

- [Astro 6 announcement](https://astro.build/blog/astro-6-beta/)
- [Astro Islands architecture](https://docs.astro.build/en/concepts/islands/)
- [Astro Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Cloudflare acquires Astro (Jan 2026)](https://astro.build/blog/joining-cloudflare/)
- [Astro vs Next.js benchmarks](https://senorit.de/en/blog/astro-vs-nextjs-2025)
- [Astro beating Next.js for content sites](https://dev.to/polliog/astro-in-2026-why-its-beating-nextjs-for-content-sites-and-what-cloudflares-acquisition-means-6kl)
- [Next.js 16 static exports](https://nextjs.org/docs/app/guides/static-exports)
- [Vike pre-rendering](https://vike.dev/pre-rendering)
