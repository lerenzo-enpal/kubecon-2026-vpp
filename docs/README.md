# Documentation

## Structure

```
docs/
├── slide-order.md              Source of truth for slide order
├── architecture-data-flow.md   Canonical VPP data flow reference
├── cost-slide-fact-check.md    Double-counting analysis for cost slide
├── fact-check-report.md        Verification of all presentation claims
├── TODO.md                     Current tasks
│
├── incidents/                  Grid incidents (one folder per event)
│   ├── INDEX.md                Master index with all 12 incidents
│   ├── RESEARCH_TEMPLATE.md    Standard format for incident research
│   └── YYYY-incident-name/research.md
│
├── research/                   Deep research by topic
│   ├── cascading_failures_research.md
│   ├── ercot_texas_grid_research.md
│   ├── electricity-price-research.md
│   ├── grid-flexibility-costs-research.md
│   ├── research-german-grid-curtailment.md
│   ├── demand-response-research.md
│   ├── vpp_market_research.md
│   ├── iberian_blackout_2025.md
│   ├── enpal_flexa_research.md
│   ├── grid-frequency-events-reference.md
│   ├── storytelling_research.md
│   ├── kubecon_talks_research.md
│   └── locations/              Geographic coordinate data for map slides
│
├── planning/                   Slide design and narrative planning
│   ├── 2026-03-14-presentation-restructure.md
│   ├── doodle-some-hard-parts.md
│   ├── frequency-walkthrough-plan.md
│   ├── eu-grid-complexity-plan.md
│   └── vpp-animation-cycle.md
│
└── archive/                    Superseded documents (historical only)
```

## Key References

- **Slide order**: `slide-order.md` — single source of truth
- **Architecture**: `architecture-data-flow.md` — VPP data flow (Flexa, EMQX, Spark)
- **Fact-checking**: `fact-check-report.md` — all claims verified with sources
- **Incidents**: `incidents/INDEX.md` — 12 grid events with full research
