# Content UI Patterns

## Incident Pages — "Case File" Design

Each incident page should feel like opening a classified dossier. Not a wall of markdown — a designed experience.

### Hero Banner
- Full-width dark card with the incident name, date, and a single dramatic stat
- Color-coded severity stripe along the top (red for blackouts, amber for near-misses, green for success stories)
- Background: subtle grid pattern or topographic lines

### Quick Facts Grid
- 2x3 or 3x2 grid of stat boxes pulled from the Quick Reference table
- Animated count-up numbers on scroll
- Each box: icon-less, just number + label, colored by category
  - People affected: cyan
  - Deaths: red
  - Economic cost: amber
  - Duration: purple
  - Frequency impact: cyan
  - Root cause: one-line summary, white

### Timeline
- Vertical timeline with timestamps on the left, events on the right
- Each event is a card with a colored dot (green = normal, amber = warning, red = critical)
- Cards animate in staggered as you scroll
- Timestamps in monospace, events in body font
- Key moments get larger cards with more detail

### Cascade Visualization (placeholder)
- A placeholder box for future interactive cascade animation
- Shows "How this failure propagated" with a stylized flow diagram
- For now: static SVG or descriptive cards

### VPP Relevance Section
- Distinct visual treatment — bordered section with success/green accent
- "What could have helped" framing
- Bullet points with response time, flexibility, and architecture lessons

### Sources
- Collapsible section at the bottom
- Monospace font, dimmed text
- Grouped by category (official reports, analysis, news)

---

## Research Topic Pages — "Intelligence Brief" Design

### Hero
- Topic title + one-sentence summary
- Accent color based on topic category

### Sections
- Each h2 gets a left-border accent bar (like the presentation style)
- Key data pulled into stat boxes or styled tables
- Blockquotes for important findings
- Source citations inline as dim monospace text

### Data Tables
- Dark surface background, subtle row hover
- Header row in monospace uppercase
- Numbers right-aligned in mono font
- Sortable columns (stretch goal)

---

## Shared Components Needed

1. **IncidentHero** — banner with severity stripe, title, date, key stat
2. **QuickFacts** — grid of animated stat boxes from Quick Reference data
3. **Timeline** — vertical timeline with staggered scroll animation
4. **SourceList** — collapsible source section
5. **SeverityBadge** — colored badge (Blackout / Near-Miss / Price Event / Success)
6. **TopicHero** — simpler hero for research topic pages
