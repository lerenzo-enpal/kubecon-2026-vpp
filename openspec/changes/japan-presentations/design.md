## Context

The existing presentation (`presentation/`) is a React + Vite + Spectacle app targeting the KubeCon Europe audience with EU/Texas/South Australia energy case studies. KubeCon Japan 2026 requires two distinct decks (keynote + main talk) with Japan-specific narrative, visualizations, and co-presenter structure. The KubeCon Japan brand uses a bright cobalt blue (`#3939D8`) that conflicts with the existing dark Mission Control aesthetic — a new theme token layer resolves this without forking the component library.

Key constraint: the existing `presentation/` MUST NOT be modified. Japan decks are a parallel package that imports shared components read-only.

## Goals / Non-Goals

**Goals:**
- Ship `presentation-japan/` as a standalone Vite app with two entry points (`Keynote.jsx`, `MainTalk.jsx`)
- All Japan-specific visualization components in `presentation-japan/src/components/`
- A theme system (`useTheme` hook + CSS custom properties) that ships dark-only but is wired to support `light` and `hybrid` as drop-in follow-ups
- A locale system (`useLocale` hook) that ships EN-only but is wired to support JA as a drop-in follow-up
- Both toggle mechanisms share the same URL param + localStorage pattern
- Reuse all nine existing slide components from `presentation/src/components/` without copying them

**Non-Goals:**
- Light and hybrid theme implementations (follow-up)
- Japanese (`ja`) locale strings (follow-up)
- Website updates (separate change)
- Any modification to `presentation/`

## Decisions

### D1: Parallel Vite app, not a monorepo package

**Decision:** `presentation-japan/` is a self-contained app with its own `package.json` and `vite.config.js`, not a workspace package.

**Rationale:** The two presentations share no build-time configuration, deploy to separate routes, and have different entry points. A workspace package adds tooling complexity (hoisting, symlinks) with no benefit. Relative imports (`../../presentation/src/components/`) handle the shared component access cleanly.

**Alternative considered:** A shared `packages/` monorepo structure. Rejected because it requires workspace tooling setup (pnpm/yarn workspaces), changes the root `package.json`, and is harder to deploy per-route on Netlify.

---

### D2: CSS custom properties as the theme layer

**Decision:** All color tokens are CSS custom properties set on `:root` by `useTheme`. Components reference `var(--color-bg)`, `var(--color-heading)`, etc. The `theme.japan.js` file exports token objects keyed by theme name (`dark`, `light`, `hybrid`).

**Rationale:** CSS custom properties update instantly with no React re-render cycle. Adding a new theme (light, hybrid) is a new token object — no component changes needed. The property names are the contract; the values are swappable.

**Alternative considered:** Passing a theme object via React context to every component. Rejected because it requires every component to consume context and re-render on theme change. CSS vars are zero-component-change to add a new theme.

**Token names:**
```
--color-bg         background
--color-surface    card/panel background
--color-heading    primary heading text (was always cyan, now KubeCon blue #3939D8)
--color-text       body text
--color-muted      muted/secondary text
--color-primary    data viz primary (cyan #22d3ee — unchanged)
--color-accent     accent/gold (#FFC217)
--color-warm       warm orange (#FFA35F)
--color-danger     red (#ef4444)
--color-success    green (#10b981)
--font-heading     Space Grotesk
--font-body        Inter
--font-mono        JetBrains Mono
```

---

### D3: `useTheme` and `useLocale` share the same hook pattern

**Decision:** Both hooks follow this exact pattern:
1. Read URL param (`?theme=` or `?lang=`)
2. Fall back to `localStorage` key (`vpp-theme` or `vpp-lang`)
3. Fall back to hardcoded default (`dark` / `en`)
4. Apply to DOM (CSS vars for theme, `lang` attribute + locale context for locale)
5. Expose a `setTheme(value)` / `setLocale(value)` function that writes both URL and localStorage simultaneously

**Rationale:** Identical patterns reduce cognitive load. URL param wins over localStorage so that shared presentation links (sent to co-presenters, reviewers) always render exactly the sender's state. The toggle button writes both so they stay in sync.

---

### D4: `useLocale` ships as a stub with EN strings

**Decision:** `useLocale` is fully wired (hook, provider, URL param, localStorage, toggle button) but the locale data file (`src/locales/en.js`) contains only English strings. The `ja` locale file is not created.

**Rationale:** "Hard to add later" applies to the architecture (hook, provider, string extraction), not to adding a new locale file. If strings are inline in JSX now, adding JA later requires touching every component. If strings are in a locale file from day one, adding JA is creating one file.

**String extraction scope:** Only slide text content (titles, subtitles, speaker labels, stat callouts). HUD labels and data chart annotations stay hardcoded (they are data, not UI text).

---

### D5: `JapanVPPMap` follows the `SAMapHUD` pattern exactly

**Decision:** `JapanVPPMap` is built as a near-copy of `SAMapHUD` with Japan-specific NODES, CORRIDORS, VIEWS, and cascade STEPS arrays. No abstraction layer between them.

**Rationale:** The existing `SAMapHUD` is ~300 lines and self-contained. Abstracting a "generic map HUD" component would require parameterizing camera interpolation, layer configuration, HUD layout, and step timing — high complexity for two instances. Direct parallel implementation is faster and safer.

**Alternative considered:** Generic `<MapHUD nodes={} corridors={} steps={} />`. Rejected — the component isn't stable enough to abstract yet. If a third map HUD is needed, extract then.

---

### D6: Two Vite entry points in one `vite.config.js`

**Decision:** A single `vite.config.js` with `rollupOptions.input` pointing to two HTML entry points:
- `index.html` → `Keynote.jsx` → deployed to `/japan-keynote`
- `main-talk.html` → `MainTalk.jsx` → deployed to `/japan-main`

**Rationale:** Sharing one `vite.config.js` means one `npm run dev` command spins up both presentations, one `npm run build` produces both, and Netlify gets one build command.

## Risks / Trade-offs

**Relative import coupling between `presentation-japan/` and `presentation/`:**
If `presentation/src/components/` is reorganized, the relative import paths in `presentation-japan/` break silently. → Mitigation: Document the dependency in both `README.md` files; add a CI `grep` check that verifies referenced paths exist.

**Space Grotesk font availability:**
Space Grotesk is a Google Font — presentations in airplane mode or poor conference WiFi may fall back to system-ui. → Mitigation: Self-host the font via `@fontsource/space-grotesk` package (zero network dependency at runtime).

**Two Vite entry points have slow initial HMR:**
Loading both decks in dev means deck.gl map tiles and canvas components for both load on startup. → Mitigation: `npm run dev:keynote` and `npm run dev:main` scripts in `package.json` to run a single entry during active development.

**CSS custom properties not supported in Spectacle's internal theming:**
Spectacle's `<Deck theme={}>` accepts a JS theme object, not CSS vars. → Mitigation: Pass the CSS-var-backed values as a computed Spectacle theme object from `useTheme`; the hook derives both the CSS vars (for components) and the Spectacle theme object (for `<Deck>`) from the same token source.

## Open Questions

- **`netlify.toml` route entries**: What are the exact Netlify route patterns for `/japan-keynote` and `/japan-main`? Needs confirmation against current `netlify.toml` before tasks are complete.
- **`@fontsource/space-grotesk` subset**: Full font package is ~600KB; only weights 400/600/700 are needed. Confirm subset import strategy in `main.jsx`.
