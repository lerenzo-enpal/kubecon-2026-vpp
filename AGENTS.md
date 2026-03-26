# Development Guidelines

## Project Overview
- React 18 + Spectacle (presentation framework) + Vite + TailwindCSS v4
- Canvas API for animated diagrams, DeckGL + MapLibre for maps
- Website: Astro 6 + React islands
- Deployed via Netlify

## Architecture
- **Flexa** is the VPP Controller (joint venture Enpal + Entrix). Not "Flexor."
- Spark does NOT connect to EMQX directly.
- See `docs/architecture-data-flow.md` for canonical data flow.
- Slide order source of truth: `docs/slide-order.md`

## Visual Identity
See [docs/style-guide.md](docs/style-guide.md) for the presentation's visual identity, animation language, color system, and typography rules.

---

## Styling Rules

- **Prefer Tailwind utility classes over inline styles.** Use `className="h-32"` not `style={{ height: 128 }}`.
- **Use Tailwind's built-in size scale** (`text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`) instead of arbitrary values like `text-[20px]`.
- **Only use inline styles for dynamic values** that depend on JS variables (e.g. theme colors from `colors.primary`).
- **All colors must reference theme tokens** — no hardcoded hex in components (except Databricks orange `#FF3621` / `#E25A1C`).
- Color palette defined in `presentation/src/theme.js`.

### Website (Astro)
- Uses `class` not `className`, `style="color: ..."` not `style={{ color: ... }}`
- Use CSS custom properties (`var(--color-primary)`) or Tailwind utilities (`text-primary`)
- Mobile-first breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Body text minimum: `text-base` (16px). Labels/metadata: `text-sm` or `text-xs` fine.

---

## Performance

- **Wrap heavy components in `<LazyContent>`** so they only mount when their slide is active. Prevents idle WebGL contexts, RAF loops, and tile loading on off-screen slides.
- **Components using Spectacle's `useSteps`** cannot be wrapped directly in `<LazyContent>` (unmounting deregisters steps). Use `<StepBridge count={N}>` instead — it owns the `useSteps` registration and passes the step value via a render prop.
- **Gate RAF loops with `slideContext?.isSlideActive`** — import `SlideContext` from Spectacle and check `isSlideActive` before calling `requestAnimationFrame`. Add it to `useEffect` dependency arrays.
- **Avoid `setState` inside RAF loops** — use `useRef` for animation values that change every frame. Only call `setState` at meaningful thresholds or when the animation completes.
- **Canvas font minimum: 14px.** No text below 14px in canvas components.

---

## Testing

- **Minimize browser round-trips** when using Playwright/Chrome DevTools MCP. Make the change, take ONE screenshot, assess.
- **Don't remove React-owned DOM nodes** via `evaluate_script` — it crashes React's reconciler. Dismiss overlays by triggering the React dismiss handler (e.g. pressing the expected key).
- **HMR is fast (<1s)** — the bottleneck is MCP tool call latency, not the dev server. Trust code changes for non-visual logic; only screenshot for layout/visual issues.

---

## Git Workflow

- **Never push without explicit permission.** Always wait for the user to say "push" before running `git push`.
- **Never commit without explicit permission.** Always wait for the user to say "commit" before running `git commit`.
- No `Co-Authored-By` lines in commits.

---

## Speaker Notes

- **Bullets and main ideas, not a script.** Concise talking points the speaker can glance at.
- Include backup points for anticipated audience questions.
- Never write notes as full sentences meant to be read verbatim.

---

## DeckGL Map Components

4 components use DeckGL + MapLibre (`TexasMapHUD`, `SAMapHUD`, `EUGridHUD`, `VPPScenarioMapSlide`):

- ALWAYS import as `MapGL` (not `Map`) — `Map` shadows JavaScript's built-in `Map` constructor
- ALWAYS use a module-level `FlyToInterpolator` singleton — it's stateless, safe to share
- Use `Map` (the JS data structure) for O(1) node/plant lookups instead of `Array.find()`

---

## Component Architecture

| What | Where |
|------|-------|
| Slide order (source of truth) | `docs/slide-order.md` |
| Architecture data flow | `docs/architecture-data-flow.md` |
| Color tokens | `presentation/src/theme.js` |
| Reusable UI primitives | `presentation/src/components/ui/` |
| Animation cycle spec | `docs/vpp-animation-cycle.md` |

### Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Map HUD | `{Region}MapHUD.jsx` | `TexasMapHUD.jsx` |
| Canvas chart | `{Topic}Chart.jsx` | `DuckCurveChart.jsx` |
| Canvas diagram | `{Topic}Diagram.jsx` | `EnpalArchitectureDiagram.jsx` |
| Interactive demo | `{Topic}Demo.jsx` | `FrequencyDemo.jsx` |
| UI primitives | `ui/{Name}.jsx` | `ui/GlowText.jsx` |

---

## Development Servers

| Project | Command | Port |
|---------|---------|------|
| Website | `cd website && npx astro dev` | 4321 |
| Presentation | `cd presentation && npm run dev` | 3000 |

---

## Lessons Learned

1. **`import Map from 'react-map-gl/maplibre'` shadows `new Map()`** — always import as `MapGL`
2. **`setState()` in RAF loops = 60 re-renders/sec** — use refs for draw-loop state
3. **Canvas `shadowBlur` cost is per-fill** — batch shapes by color into single `fill()` calls
4. **Spectacle `SlideContext.isSlideActive`** — the only reliable way to gate heavy work
5. **Canvas padding cutoff** — callouts below need padBottom >= 65px, annotations above need padTop >= 55px
6. **`useEffect` deps for RAF** — must include `slideContext?.isSlideActive`
7. **Self-host fonts via `@fontsource`** — Google Fonts CDN is render-blocking
8. **Screenshots to `/tmp/`** — never save in the project directory
