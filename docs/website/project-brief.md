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
5. **Inspire action** — Show that software engineers, data scientists, and homeowners all have a role.

## Content Structure (Draft)

### Module 1: How the Grid Works
- The 50 Hz heartbeat — what frequency means
- Supply = Demand, every second
- What happens when balance breaks (frequency walkthrough)
- The 2.5 Hz between normal and collapse

### Module 2: The Old Way
- Peaker plants, spinning reserves, load shedding
- What these cost (EUR 10B+/yr)
- Real stories: Texas 2021, Italy 2003, South Australia 2016

### Module 3: The Renewable Revolution
- Solar and wind growth curves
- The duck curve problem
- Curtailment — throwing away clean energy
- Negative electricity prices

### Module 4: The Virtual Power Plant
- What a VPP is (homes as infrastructure)
- How batteries, EVs, and heat pumps participate
- Real-time coordination at scale
- The Hornsdale success story

### Module 5: The Future
- Grid resilience through distribution
- Software eating the grid
- What you can do

## Interactive Elements

- **Frequency simulator** — Drag a slider to add/remove generation, watch frequency respond
- **Duck curve explorer** — Time-of-day animation showing solar production vs demand
- **VPP home view** — See how a single home's battery, EV, and heat pump respond to grid signals
- **Incident timelines** — Step through real cascading failures second by second
- **Cost calculator** — How much does your country spend on grid stability?

## Technical Approach

- Static site (Next.js or Astro) — fast, deployable anywhere
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
- All claims are sourced and fact-checked (inherit from `docs/archive/fact-check-report.md`)
- Site loads in <2s on a school Wi-Fi connection

## Open Questions

- Hosting: Netlify (like the presentation), Vercel, or GitHub Pages?
- Localization: English-only first, or plan for German/Spanish from the start?
- Licensing: Creative Commons for content, MIT for code?
- Relationship to the KubeCon talk: companion site, or standalone brand?
- Do we want a "teacher's guide" section with lesson plans?
