## Why

KubeCon + CloudNativeCon Japan 2026 (Yokohama) requires two new presentations — a keynote and a main conference talk — tailored to the Japanese energy context. The existing presentation was built for KubeCon Europe and centers on EU/Texas/South Australia case studies; it cannot be repurposed for Japan without substantive new visualizations, Japan-specific narrative structure, and a co-presenter change (LeRenzo + Priyanka). The timing is urgent: the Strait of Hormuz closure (March 2026) has made Japan's energy fragility a live, present-tense issue for every audience member, creating a uniquely compelling opening moment.

## What Changes

- **New**: `presentation-japan/` directory — a separate Vite app colocated with the existing `presentation/`, deployable to `/japan-keynote` and `/japan-main` routes on whatisavpp.com
- **New**: `Keynote.jsx` — solo presentation (~22 slides), LeRenzo only, opens with Hormuz/¥15,000 hook, closes with "100,000 homes = one power plant"
- **New**: `MainTalk.jsx` — co-presented (~33 slides), LeRenzo + Priyanka, three-act structure fully adapted for Japan
- **New**: Japan-specific visualization components — `JEPXPriceChart`, `JapanGridMap`, `JapanSelfSufficiencyChart`, `KyushuCurtailmentChart`, `JapanDemandForecast`, `JapanVPPMap`
- **New**: `theme.japan.js` — KubeCon Japan color tokens (replaces EU cyan-dominant palette with `#3939D8` KubeCon blue for chrome, retains `#22d3ee` for data viz)
- **New**: `useTheme` and `useLocale` hooks — URL param + localStorage toggle architecture (`?theme=dark|light|hybrid`, `?lang=en|ja`); ships dark + EN only, designed for light/hybrid/JA as follow-up
- **New**: Theme toggle UI button in slide chrome — visible on all slides, persisted via URL param
- **Shared**: Reuses `VPPArchitecture`, `ChoreographyLoop`, `ResponseTimeline`, `StreamingAggregation`, `AggregationPyramid`, `DuckCurveChart`, `DuckCurveVPP`, `GridFrequencyExplainer`, `FrequencyDemo`, `FrequencyWalkthrough` from `presentation/src/components/` via relative imports — no duplication
- **Typography change**: Space Grotesk for headings/titles (replaces JetBrains Mono in narrative roles), Inter for body, JetBrains Mono retained for data labels and HUD overlays only

## Capabilities

### New Capabilities

- `japan-keynote`: Standalone solo keynote deck (~22 slides) with Hormuz opening hook, Japan energy fragility framing, cloud-native VPP architecture pivot, and 100K-homes closing
- `japan-main-talk`: Co-presented main conference talk (~33 slides) with fully Japan-adapted three-act structure — Japan grid topology Act 1, Kyushu curtailment Act 2, ERAB-layer VPP Act 3
- `japan-viz-components`: Six new visualization components specific to Japan energy data (JEPX price, Japan grid map, self-sufficiency comparison, Kyushu curtailment, demand forecast, VPP map HUD)
- `theme-toggle-system`: URL param + localStorage theme toggle (`?theme=dark|light|hybrid`) wired to CSS custom properties; ships dark-only, architected for light and hybrid follow-up phases
- `locale-toggle-system`: URL param + localStorage locale toggle (`?lang=en|ja`) sharing the same pattern as theme toggle; ships EN-only, architected for JA as a follow-up

### Modified Capabilities

<!-- No existing spec-level capabilities are modified — this is a new parallel package -->

## Impact

- **New directory**: `presentation-japan/` at repo root — does not touch `presentation/`
- **Shared components**: Read-only imports from `presentation/src/components/` and `presentation/src/hooks/` — no changes to existing files
- **Build**: New `vite.config.js` with two entry points; new `package.json` with same dependency set plus `space-grotesk` font
- **Deploy**: `netlify.toml` needs two new route entries (`/japan-keynote`, `/japan-main`) pointing to `presentation-japan/` build output
- **No breaking changes** to existing presentation or website
