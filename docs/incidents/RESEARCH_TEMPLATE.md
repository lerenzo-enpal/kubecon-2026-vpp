# [Event Name] — [Year]

## Quick Reference

| Field | Value |
|-------|-------|
| **Date** | |
| **Location** | |
| **Duration** | |
| **People Affected** | |
| **Deaths** | |
| **Economic Cost** | |
| **Root Cause (one line)** | |
| **Grid Frequency Impact** | |
| **Load Shed** | |
| **Slides Referenced** | |

## Timeline

Minute-by-minute or phase-by-phase sequence of events. Include timestamps where available.

1. **HH:MM** —
2. **HH:MM** —
3. **HH:MM** —

## Root Cause Analysis

What triggered the incident and why it cascaded.

### Contributing Factors

-
-
-

### Cascade Mechanism

How the initial failure propagated through the system. Be specific about the feedback loop or chain of events.

## Grid Context

System conditions at the time of the event: load level, generation mix, weather, interconnection state, time of day/year, any pre-existing stress.

## Response & Recovery

How grid operators and emergency services responded. What worked, what didn't. How long full restoration took.

## VPP Relevance

How a VPP / distributed flexibility could have mitigated or prevented this failure.

- **Response time gap:** Could batteries (140ms) have responded faster than what was available?
- **Flexibility gap:** Were consumers passive? Could demand-side participation have helped?
- **Architecture lesson:** What does this teach about centralized vs. distributed grid design?

## Key Statistics for Presentation

Verified, citable numbers we use in slides. Every stat must have a source and confidence level.

| Stat | Value | Source | Confidence |
|------|-------|--------|------------|
| | | | High / Medium / Disputed |

## Sources

Primary and secondary sources. Prefer official incident reports, regulator publications, and peer-reviewed analysis over media.

1.
2.
3.

## Related Research Files

Links to deeper research docs in this repo that cover this incident.

-

## Fact-Check Notes

Any figures that have been disputed, corrected, or need verification. Reference docs/fact-check-report.md where applicable.

-

---

## Completeness Checklist

Use this checklist to audit whether research for this incident is presentation-ready. Every box should be checked before we use stats on stage.

### Data Quality
- [ ] **Primary source identified** — at least one official incident report (regulator, grid operator, government)
- [ ] **Timeline verified** — sequence of events cross-referenced against at least 2 sources
- [ ] **Root cause confirmed** — not just media narrative; matches official investigation findings
- [ ] **Cascade mechanism documented** — step-by-step chain from trigger to outcome
- [ ] **All stats sourced** — every number in Key Statistics has a named source
- [ ] **No stat is single-sourced** — key claims cross-checked against 2+ independent sources
- [ ] **Disputed figures flagged** — anything contested is marked in Fact-Check Notes
- [ ] **Checked against docs/fact-check-report.md** — any presentation-used stats verified there

### Context & Depth
- [ ] **Grid context documented** — load, generation mix, weather, time of day, interconnections
- [ ] **Pre-existing conditions noted** — was the grid already stressed? maintenance? unusual flows?
- [ ] **Response & recovery covered** — what operators did, what worked, what failed
- [ ] **Duration clear** — from onset to full restoration, not just the acute phase
- [ ] **Human impact quantified** — people affected, deaths, economic cost with attribution
- [ ] **Geographic scope clear** — exactly which regions/countries/states were affected

### Presentation Readiness
- [ ] **VPP counterfactual written** — "with a VPP, this would have been different because..."
- [ ] **Response time comparison** — how fast did existing resources respond vs. how fast batteries could have?
- [ ] **Architecture lesson articulated** — one clear takeaway for a KubeCon audience
- [ ] **Quotable one-liner** — a single sentence that captures the incident for slide use
- [ ] **Currency and units consistent** — EUR vs USD vs AUD clearly marked; GW vs MW consistent
- [ ] **No conflated claims** — stats from different sources/reports not merged into one claim

### Cross-References
- [ ] **Linked to related research docs** — deeper analysis in docs/ root referenced
- [ ] **Slide references current** — slide numbers match current deck order (docs/slide-order.md)
- [ ] **Speaker notes aligned** — SPEAKER_SCRIPT.md bullets match verified stats here
