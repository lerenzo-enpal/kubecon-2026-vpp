# Educational Website — Project Brief

## Vision

An interactive educational website that teaches how electricity grids work, why they're changing, and how Virtual Power Plants (VPPs) fit in. Aimed at ages 12+ — accessible enough for a curious teenager, rich enough for an adult learning about energy for the first time.

The site extends the KubeCon 2026 presentation into a standalone learning resource, reusing its research, visual language, and narrative structure.

## Audience

- **Primary:** Students ages 12-18 (science class, self-directed learning, energy curiosity)
- **Secondary:** Adults new to energy/grid topics (tech workers, policy-curious, KubeCon attendees wanting to go deeper)
- **Tertiary:** Teachers looking for classroom-ready materials

### Audience Assumptions
- No prior knowledge of electrical engineering or grid operations
- Comfortable with web-based interactive content
- Short attention spans — content must earn continued reading
- Visual learners — diagrams, animations, and interactive elements over walls of text

## Goals

1. **Explain the grid** — What is 50 Hz? Why does frequency matter? What happens when supply and demand don't match?
2. **Show the problem** — Why renewables make the grid harder to manage. Duck curves, curtailment, negative prices.
3. **Introduce the solution** — What a VPP is, how distributed batteries/solar/EVs can stabilize the grid.
4. **Make it tangible** — Real incidents (Texas 2021, SA 2016, Iberian 2025), real costs, real timelines.
5. **Provide Deep dives** - if people want to know more, surface all our research 
6. make it bueatiful and discoverable - deep links to internal resarech. internal research links to source

## Site Structure

### Landing Page

Two-panel layout:

**Left panel — Welcome + Navigation**
- Brief welcome text: what the site is, who it's for
- Mini table of contents linking to all modules
- Each module link shows a short description
- Items with interactive elements get an "Interactive" tag to draw clicks
- Clean, inviting, not overwhelming

**Right panel — "Try to Crash the Grid" Game**
- The hero element of the landing page
- A Kepler-based map showing a simplified power grid (substations, transmission lines, power plants, control centers)
- Click on infrastructure to trigger events (fire, cyber attack, storm, equipment failure)
- Each event triggers a cascading sequence with a live explainer feed
- Push hard enough and the grid collapses — you win
- Every step in the explainer deep-links into the research content
- See `docs/website/game-plan.md` for full game design

### Content Area

When users click into any module from the landing page:

- **Left sidebar** — persistent table of contents for all modules and sections
  - Collapsible module groups
  - Current section highlighted
  - "Interactive" badges on sections with playable elements
  - Sticky on scroll
- **Main content** — the module content, rich with embedded interactives
- **Right margin** — source citations, footnotes, "dive deeper" links to raw research

### Content Modules

#### Module 1: How the Grid Works
- The grid is huge — scale, geography, complexity
- The 50 Hz heartbeat — what frequency means
- Supply = Demand, every second
- What happens when balance breaks (frequency walkthrough)
- The 2.5 Hz between normal and collapse
- [Interactive] Frequency playground — drag sliders to feel it

#### Module 2: The Old Way
- Peaker plants, spinning reserves, load shedding
- What these cost (EUR 10B+/yr)
- Real stories: Texas 2021, Italy 2003, South Australia 2016
- [Interactive] Incident timelines — step through cascades second by second

#### Module 3: The Renewable Revolution
- Solar and wind growth curves
- The duck curve problem
- Curtailment — throwing away clean energy
- Negative electricity prices
- [Interactive] Duck curve explorer — time-of-day animation

#### Module 4: The Virtual Power Plant
- What a VPP is (homes as infrastructure)
- How batteries, EVs, and heat pumps participate
- Real-time coordination at scale
- The Hornsdale success story
- [Interactive] VPP home view — watch a home respond to grid signals

#### Module 5: The Future
- Grid resilience through distribution
- Software eating the grid
- What you can do

### Research Library

All underlying research surfaced as browsable, linked content:
- Incident pages generated from `docs/incidents/` (12 events)
- Topic pages generated from `docs/research/` (costs, markets, pricing, curtailment)
- Every claim links to its source
- Every research page links back to the module that references it

## Technical Approach

- Static site (Next.js or Astro) — fast, deployable anywhere
- Kepler.gl or deck.gl for the game map (already used in the presentation)
- Reuse Canvas/SVG animations from the presentation where possible
- Responsive — must work on tablets (classroom use)
- Accessible — WCAG 2.1 AA minimum
- No login, no tracking, no ads
- Open source

## Content Sources

All content derives from the existing research in this repository:
- `docs/incidents/` — 12 grid events with detailed research
- `docs/research/` — deep topic research (costs, markets, pricing, curtailment)
- Presentation slide components — frequency demo, duck curve, VPP architecture
- Speaker notes — verbal explanations already written at an accessible level

## Success Metrics

- A 14-year-old can explain what a VPP is after reading Module 4
- A teacher can use Module 1-2 as a 45-minute lesson plan
- The game is fun enough that someone shares it
- All claims are sourced and fact-checked
- Site loads in <2s on a school Wi-Fi connection

## Open Questions

- Hosting: Netlify (like the presentation), Vercel, or GitHub Pages?
- Localization: English-only first, or plan for German/Spanish from the start?
- Licensing: Creative Commons for content, MIT for code?
- Relationship to the KubeCon talk: companion site, or standalone brand?
- Do we want a "teacher's guide" section with lesson plans?
- Game: which grid region? Simplified fictional grid, or based on a real topology (e.g., Continental Europe)?
