# Keynote Restructure Complete

## New Title
**"The Energy Grid Is Becoming a Cloud Native Distributed System"**
Subtitle: "How VPP solves Japan's structural energy fragility"

## New Slide Structure (17 slides, from 22)

| # | Title | Component | Type | Notes |
|---|-------|-----------|------|-------|
| 1 | Title Slide | — | Text | New title focusing on distributed systems |
| 2 | Japan Grid Structure | `JapanOpeningSequence` | StepBridge (8 steps) | 50Hz/60Hz seam, utilities, LNG, Hormuz, stats, sidebar |
| 3 | The Pattern: When Cold Hits | `EnergyUsageScalingAnimation` | Animated sequence | Home → building → city scaling (12s) |
| 4 | The Crisis: 25x in 40 Days | `JEPXPriceChart` + context boxes | Chart + callouts | 2021 spike + 2022 emergency combined |
| 5 | Data Center Accelerant | `DataCenterMapOverlay` | Dual view | Map + demand forecast chart with stress zones |
| 6 | Grid = Distributed System | — | Dark slide | Pivot moment (dark background) |
| 7 | Virtual Power Plant: Japan Edition | `AnimatedStatBox` × 3 | Stats with animation | 100K homes, 500ms latency, 0 emissions |
| 8 | Architecture: Cloud-Native Patterns | Tech tags | Text + badges | Dapr, CQRS, Kafka, MQTT, ArgoCD, Spark, OTel |
| 9 | Architecture Diagram | `VPPArchitecture` | Component | Energy Market → Gateway → Controller → Cloud → Homes |
| 10 | Dapr Actors | Code example | Code block | Per-device state, actor pattern |
| 11 | MQTT at Scale | `AnimatedStatBox` × 2 | Stats with animation | 500ms P99, 100K connections |
| 12 | Event Sourcing | Kafka topics | Text + callout | Audit trail, time-travel debugging |
| 13 | Japan VPP Demo | `JapanVPPMap` | Map animation | Kansai/Kyushu dispatch simulation |
| 14 | Operational + Regulated | Side-by-side boxes | 2-column layout | Shizen Connect + ERAB license |
| 15 | GitOps for Grid Firmware | 2-column boxes | 2-column layout | ArgoCD + GitOps requirements |
| 16 | Observability | `AnimatedStatBox` × 3 | Stats with animation | OTel, 100% auditability, time-travel |
| 17 | Closing | — | Dark slide | "100K homes = 1 power plant, zero emissions" |

## Key Improvements

### Condensed Opening (2-4 instead of 2-7)
- Single `JapanOpeningSequence` replaces 6 old slides
- Uses step-based animation for smooth progression
- Combines all fragility context (grid structure, stats, LNG, Hormuz)

### Enhanced Visual Storytelling (3-5 instead of 8-9)
- Energy scaling animation shows impact scale
- JEPX chart + context boxes in one slide
- DataCenterMapOverlay shows both locations and demand

### Streamlined VPP Section (7-16 instead of 11-21)
- Condensed from 11 slides to 10 slides
- Japan-specific numbers and references
- Same architecture but tighter pacing
- Combined Shizen Connect + ERAB into one slide
- GitOps gets clearer framing

### Dark Slides (Forced Dark Theme)
- Slide 2: Japan Opening Sequence (full immersion in map)
- Slide 6: Pivot moment (the realization)
- Slide 17: Closing statement (impact emphasis)

## Components Used

**New Animation Components:**
- `JapanOpeningSequence` — 8-step opening story
- `EnergyUsageScalingAnimation` — 3-phase home→building→city
- `DataCenterMapOverlay` — Dual map + demand chart
- `AnimatedStatBox` — Reusable stat with count-up
- `ExplanationBox` — (imported but not used in current slides, available for future)

**Existing Components (Preserved):**
- `JEPXPriceChart` — Price spike chart
- `JapanVPPMap` — Dispatch simulation
- `VPPArchitecture` — Tech stack diagram
- `HormuzInfographic` — (removed, integrated into opening sequence)

## Animation Patterns

All new components use the centralized pattern library:
- `useAnimeJs` hook for timeline management
- `STAGGER_PATTERNS` for cascading reveals
- `STAT_COLORS` for consistent coloring
- `animationPatterns.js` for reusable effects

## Translation/Localization

- Old translation keys no longer used: `keynote.hormuz.*`, `keynote.fragility.*`, `keynote.warning2022.*`, `keynote.jepx.*`, `keynote.demand.*`, `keynote.arch.*`, `keynote.pivot.*`, `keynote.closing.*`
- Current slide uses only `t('keynote.presenter')`
- Most slide content is now hardcoded for tighter design control
- Future: update `i18n/translations.json` to remove old keys and add new ones if needed

## Testing Checklist

- [ ] All slides render without errors
- [ ] LazyContent prevents render before slide active
- [ ] Animations play smoothly (no jank)
- [ ] Color contrast meets WCAG AA
- [ ] Step bridges work (JapanOpeningSequence)
- [ ] AutoPlay animations work
- [ ] Dark slides display correctly
- [ ] Notes are speaker-friendly
- [ ] Total slide count shown correctly (17/17)

## Next Steps (Optional)

1. Update i18n keys to match new slide structure
2. Fine-tune animation timings based on presentation pace
3. Test with projector/screen
4. Add slide timing cues
5. Practice presenter notes
