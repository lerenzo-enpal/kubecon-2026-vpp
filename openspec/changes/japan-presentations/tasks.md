## 1. Project scaffold

- [ ] 1.1 Create `presentation-japan/` directory with `package.json` (same deps as `presentation/`, add `@fontsource/space-grotesk`)
- [ ] 1.2 Create `presentation-japan/vite.config.js` with two rollup entry points: `index.html` → `Keynote.jsx`, `main-talk.html` → `MainTalk.jsx`
- [ ] 1.3 Create `presentation-japan/index.html` and `presentation-japan/main-talk.html` entry HTML files
- [ ] 1.4 Add `dev:keynote`, `dev:main`, `build` scripts to `package.json`
- [ ] 1.5 Verify `../../presentation/src/components/` relative imports resolve correctly from `presentation-japan/`

## 2. Theme system

- [ ] 2.1 Create `presentation-japan/src/theme.japan.js` with `themes.dark` token object (all 13 CSS custom property values per design.md D2), plus stub `themes.light` and `themes.hybrid` that copy dark values
- [ ] 2.2 Create `presentation-japan/src/hooks/useTheme.js` implementing URL param → localStorage → default `'dark'` resolution, CSS var application on `document.documentElement`, and `setTheme()` that writes both URL and localStorage
- [ ] 2.3 Create `PresentationChrome` wrapper component that renders the theme toggle button (fixed top-right) and calls `useTheme`; cycle order: dark → light → hybrid → dark
- [ ] 2.4 Derive Spectacle theme object from active tokens (Space Grotesk header, Inter text, JetBrains Mono monospace) and pass to `<Deck theme={}>` in both decks

## 3. Locale system

- [ ] 3.1 Create `presentation-japan/src/locales/en.js` with string keys for all slide titles, subtitles, speaker section headings, and key stat callouts (structure keys as `keynote.*` and `main.*`)
- [ ] 3.2 Create `presentation-japan/src/hooks/useLocale.js` implementing URL param → localStorage → default `'en'` resolution, `t(key)` lookup with en fallback for unknown locales, and `setLocale()` that writes both URL and localStorage
- [ ] 3.3 Add locale toggle button to `PresentationChrome` (adjacent to theme toggle); show "EN" label, clickable without error, dimmed indicator that JA is not yet available

## 4. Japan visualization components

- [ ] 4.1 Create `JEPXPriceChart.jsx` — canvas line chart, 10→251 JPY/kWh over 40 days, left-to-right animation on `isSlideActive`, peak annotation "251 JPY/kWh", JetBrains Mono labels, retina-scaled, RAF cleanup
- [ ] 4.2 Create `JapanGridMap.jsx` — deck.gl + MapLibre, 10 regional utility NODES array with lat/lng, 50/60 Hz seam LineLayer in amber, HVDC link capacity TextLayer in JetBrains Mono, dark basemap tile style
- [ ] 4.3 Create `JapanSelfSufficiencyChart.jsx` — canvas horizontal bar chart, G7 nations, Japan bar in `#ef4444`, staggered entry animation (200ms between bars), "Lowest in G7" annotation
- [ ] 4.4 Create `KyushuCurtailmentChart.jsx` — canvas area/line chart, curtailment by region 2023–2026, Kyushu series in `#FFC217` at full opacity, "Curtailment reaches Tokyo" milestone marker, "1.74 TWh wasted — H1 2025" callout
- [ ] 4.5 Create `JapanDemandForecast.jsx` — canvas line chart, 19→57–66 TWh growth curve, left-to-right animation, shaded forecast band at 2034, baseline and midpoint labeled in JetBrains Mono
- [ ] 4.6 Create `JapanVPPMap.jsx` — deck.gl + MapLibre following SAMapHUD pattern exactly: NODES array (Kansai/Kyushu battery locations), CORRIDORS array, VIEWS presets, cascade STEPS with FlyToInterpolator, ScatterplotLayer/LineLayer/TextLayer, HUD overlay panel (Hz, active batteries, MW dispatched)

## 5. Keynote deck

- [ ] 5.1 Create `presentation-japan/Keynote.jsx` scaffold with `<Deck>` wrapper, `PresentationChrome`, and `useLocale`; import Spectacle theme from `useTheme`
- [ ] 5.2 Slide 1: Title slide — conference name, presenter "LeRenzo Malcolm", event "KubeCon + CloudNativeCon Japan 2026"
- [ ] 5.3 Slide 2: Hormuz opening — full-bleed dark slide, `+¥15,000/household/year` dramatic reveal stat, forced dark theme regardless of toggle
- [ ] 5.4 Slides 3–5: Japan structural fragility — 15.3% self-sufficiency (`JapanSelfSufficiencyChart`), 70% fossil fuel dependency, island grid / 10 utilities diagram
- [ ] 5.5 Slides 6–8: Crisis pattern — JEPX 2021 spike (`JEPXPriceChart`), "no natural disaster" framing, March 2022 first-ever power supply warning (TEPCO 2.5% reserve)
- [ ] 5.6 Slides 9–10: Demand accelerant — data center growth (`JapanDemandForecast`), OCCTO 14× forecast callout
- [ ] 5.7 Slide 11: Pivot slide — text-only, "The grid IS a distributed system. We know how to build those."
- [ ] 5.8 Slides 12–18: Cloud-native VPP architecture — `VPPArchitecture` (imported from `../../presentation/src/components/`), Dapr Actors, CQRS, Kafka/EventHub, MQTT/EMQX, ArgoCD, Spark, OTel deep-dive slides
- [ ] 5.9 Slides 19–21: Japan VPP in practice — `JapanVPPMap` dispatch scenario
- [ ] 5.10 Slide 22: Closing — "100,000 homes coordinated by software = one power plant", counter tick-up animation on `100,000`
- [ ] 5.11 Verify total slide count is 20–24 and all `t()` calls resolve without undefined

## 6. Main talk deck

- [ ] 6.1 Create `presentation-japan/MainTalk.jsx` scaffold with `<Deck>`, `PresentationChrome`, `useLocale`, and speaker attribution helpers (LERENZO / PRIYANKA)
- [ ] 6.2 Slide 1: Title slide — "How the Grid Became a Distributed System", presenters LeRenzo Malcolm + Priyanka
- [ ] 6.3 Act I title card: "ACT I: THE GRID"
- [ ] 6.4 Act I slides: Japan grid topology intro, `JapanGridMap` (10 utilities, 50/60 Hz seam, HVDC capacity), frequency seam explainer
- [ ] 6.5 Act I slides: `JapanSelfSufficiencyChart` (15.3% lowest G7), island grid isolation fragility
- [ ] 6.6 Act I slides: JEPX 2021 — "Japan's Texas moment", `JEPXPriceChart`, "same fragility, different cause" framing, March 2022 warning
- [ ] 6.7 Act II title card: "ACT II: THE RENEWABLES PROBLEM"
- [ ] 6.8 Act II slides: `DuckCurveChart` (imported from `../../presentation/src/components/`) with Kyushu data framing
- [ ] 6.9 Act II slides: `KyushuCurtailmentChart` — 1.74 TWh H1 2025, curtailment spreading to Tokyo March 2026
- [ ] 6.10 Act II slides: Japanese VPP demos — Shizen Connect EV VPP (Kansai), HEMS residential battery aggregation
- [ ] 6.11 Act III title card: "ACT III: THE VPP SOLUTION"
- [ ] 6.12 Act III slides: ERAB regulatory framing — Japan's aggregator license framework, OCCTO oversight
- [ ] 6.13 Act III slides: `VPPArchitecture` (imported), `ChoreographyLoop`, `ResponseTimeline`, `StreamingAggregation`, `AggregationPyramid` (all imported)
- [ ] 6.14 Act III slides: `JapanVPPMap` dispatch scenario, `FrequencyDemo` / `FrequencyWalkthrough` (imported)
- [ ] 6.15 Closing slides: recap, "What you can do", call to action
- [ ] 6.16 Verify total slide count is 30–36, no copied components in `presentation-japan/src/components/`, all `t()` calls resolve

## 7. Deploy configuration

- [ ] 7.1 Check `netlify.toml` and add route entries for `/japan-keynote` and `/japan-main` pointing to `presentation-japan/` build output directories
- [ ] 7.2 Add `presentation-japan` build to CI (if a CI config exists)
- [ ] 7.3 Verify both entry points build without errors: `npm run build` in `presentation-japan/`
- [ ] 7.4 Smoke test: navigate to `/japan-keynote` and `/japan-main`, confirm first slide loads, theme toggle cycles without error, locale toggle shows "EN" without error
