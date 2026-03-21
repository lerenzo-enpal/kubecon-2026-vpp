# Design & Presentation Guidance

## Visual Identity: "Mission Control"

The aesthetic is a **Hollywood intelligence agency control room** — think the briefing screens in Mission Impossible, Q's lab in Bond, the war table in a submarine movie. This is critical infrastructure being monitored in real time. Every pixel should feel operational, not decorative.

**Reference points:** Bloomberg terminal, SCADA control rooms, Minority Report UI, TRON Legacy interfaces, submarine CIC displays.

---

## Core Principles

1. **Data is the decoration** — no clip art, no stock photos, no illustrations. Animated frequency lines, live-ticking numbers, pulsing grid nodes, glowing connection lines. Every visual element should look like it belongs on a control panel and serves a functional purpose.

2. **Color encodes meaning — always.** Never use color decoratively.
   - `cyan #22d3ee` — grid / stable / primary system
   - `green #10b981` — VPP / batteries / success / recovery
   - `red #ef4444` — failure / danger / cascade
   - `amber #f59e0b` — warning / solar / caution
   - `purple #a78bfa` — secondary systems
   - Backgrounds: `#0a0e17` (deep navy-black), `#1a2236` (surface), `#243049` (surface-light)
   - Text: `#f1f5f9` (primary), `#94a3b8` (muted), `#64748b` (dim)

3. **Typography as hierarchy** — `JetBrains Mono` for data, numbers, labels, system readouts (feels like a terminal). `Inter` for narrative text, descriptions, speaker notes. Numbers should be bold, large, and glowing. Never mix these roles.

4. **High-stakes tension** — the audience should feel like they're watching something important happen in real time. When things go wrong, the UI shows it: red pulses, warning flashes, frequency drops. When VPP stabilizes things, green calm washes over. The emotional arc lives in the visuals.

---

## Motion & Animation Language

This is the most important section. Motion defines the personality of the whole presentation. Every animation should feel like **a system responding to input** — not a slide transitioning.

### Philosophy

- **The system is alive.** Even at rest, things pulse, jitter, and breathe. A perfectly still screen feels dead. Stable frequency lines have micro-jitter. Status dots pulse gently. Grid connections shimmer.
- **Motion has purpose.** Nothing moves for decoration. Elements enter because data arrived. Alerts flash because a threshold was crossed. A zoom happens because the operator is drilling into a region.
- **Authority, not playfulness.** Elements arrive with weight — fast entry, smooth deceleration. Never bouncy. Never springy. Never wobbly. This is a control room, not a toy store.

### Timing Reference

| Pattern | Duration | Notes |
|---------|----------|-------|
| Element entry (fade/slide in) | 400–700ms | Stagger 200–400ms between sequential items |
| Dramatic reveal (big numbers, titles) | 800–1200ms | Use `easeOutBack` sparingly for impact |
| Camera/zoom moves | 3–5 seconds | Smooth `easeInOutCubic`, never rushed |
| Alert blink | 150ms on/off, 3 cycles then hold | Hard cuts, not fades |
| Micro-pulse (alive indicators) | 2–4 second period | `sin(t)` based, subtle amplitude (±0.02–0.05 opacity) |
| Data counter tick-up | Full duration 2–4s | Accelerate then decelerate (feels like instruments settling) |
| Color state change | 300–500ms | Smooth crossfade, no hard swap |

### Easing Curves

| Use case | Curve | CSS / JS |
|----------|-------|----------|
| **Default entry** | Strong deceleration | `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out` |
| **Dramatic zoom / camera** | Smooth S-curve | `easeInOutCubic` — `t < 0.5 ? 4t³ : 1-(−2t+2)³/2` |
| **Impact reveal** (big zero, title) | Slight overshoot | `easeOutBack` — arrives with authority |
| **Alert / warning** | Hard cut | `step-end` or instant opacity toggle |
| **Never use** | Bounce, elastic, spring | These feel playful/casual — wrong register entirely |
| **Never use** | `ease-in` alone | Feels sluggish — things should arrive fast, not accelerate into view |

### Entry Patterns

**Staggered Reveal (boot sequence)** — The signature pattern. Elements appear one by one with short delays, like a system booting up or data feeds coming online. Each element slides in and sharpens (blur → clear). This is the default for any slide with multiple items.

```css
@keyframes bootIn {
  0%   { opacity: 0; transform: translateY(12px); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0);    filter: blur(0);   }
}
/* Stagger: 0.3s + i * 0.25s */
```

**Slide-In from Edge** — Data panels, comparison rows, stat boxes. Grid-side content enters from left, tech/comparison content from right. Creates a converging motion that implies two systems being compared.

```css
@keyframes slideFromLeft  { 0% { opacity:0; transform:translateX(-30px); filter:blur(4px); } }
@keyframes slideFromRight { 0% { opacity:0; transform:translateX(30px);  filter:blur(4px); } }
```

**Scale-Up Reveal** — For dramatic single-element reveals (the big "0", key statistics). Starts small and transparent, scales up with a slight overshoot, then settles. Use `easeOutBack`.

**Counter Tick-Up** — Numbers count from 0 to their target value. Use `requestAnimationFrame`. Start fast, decelerate as it approaches the target (like analog instruments settling). Format with locale separators as they tick.

**Scan Line** — A faint horizontal line sweeps slowly down the canvas. Implies real-time monitoring / radar sweep. Very low opacity (0.02–0.04). Period: ~4–6 seconds.

### State Change Patterns

**Stable → Alert:** Color shifts from cyan → amber → red over 300ms. Glow intensity increases. Pulse frequency increases (period shortens from 3s to 0.5s). Labels switch to uppercase monospace.

**Alert → Recovery (VPP kicks in):** Red desaturates. Green glow blooms from the VPP source point and spreads. Pulse frequency decreases (calming). Numbers settle back to target values with counter animation.

**Zoom transitions:** Always `easeInOutCubic`. Camera moves should feel like a satellite pulling back or an operator zooming into a region. 3–5 seconds. Never instant. Add subtle parallax (background moves slower than foreground) where possible.

### Canvas Animation Standards

All canvas components follow this pattern:
- 2x retina scaling (`canvas.width = width * 2; ctx.scale(2, 2)`)
- Guard animation on `slideContext?.isSlideActive` — don't burn CPU on invisible slides
- Use `requestAnimationFrame` loop, clean up on unmount
- Time-based animation (use `performance.now()`), never frame-counting
- Shadow/glow: `ctx.shadowBlur` + `ctx.shadowColor` for emphasis, but always reset after (`shadowBlur = 0`)
- **Prevent canvas cutoff:** Always ensure padding values leave enough room for all drawn elements. Annotations above the chart need `padTop >= 55px`. Callout boxes below need `padBottom >= 65px`. Labels to the right of the chart (stats, year indicators) need `padRight >= 40px` or more. When adding new elements outside the chart area, increase padding and canvas dimensions accordingly. Verify: all text, callout boxes, and annotations render fully within `[0, width] x [0, height]`. If passing `width`/`height` props from a parent, the parent must also increase its container to match.

### Anti-Patterns (things that break the aesthetic)

- **Filled shapes for icons** — use stroked outlines instead. Control room displays show wireframes, not filled blobs.
- **Bounce / spring / elastic easing** — too playful. This is military-grade UI, not a mobile app.
- **Simultaneous entry** — everything appearing at once feels static. Always stagger, even if only 100ms apart.
- **Decorative gradients** — gradients are for functional glow (shadow behind text, vignette at edges). Never gradient-for-gradient's-sake.
- **Rounded-full / pill shapes** — prefer sharp rectangles or subtle border-radius (4–8px). Exception: small status indicator dots.
- **Drop shadows** — use inner glow (`box-shadow: inset ...` or `ctx.shadowBlur`) instead. Drop shadows feel corporate/flat-design.
- **White backgrounds or light surfaces** — everything lives on dark backgrounds. The only "light" is emitted light (glowing text, pulsing nodes, bright data).
- **Thick borders** — borders should be 1px max, low opacity (15–30%). The content glows; the container recedes.

---

## Typography

### Minimum Sizes

- **All slide content text: minimum 20px** (`text-[20px]`). Presentations are projected — anything smaller is unreadable from the back of the room.
- **Exceptions:** Canvas-rendered text in animations, HUD overlays (TexasMapHUD, EUGridHUD), navigational chrome (slide counters, step dots). These serve decorative/functional roles at closer viewing distances.
- **Hierarchy via weight and color, not size drops.** If you need subtle text, use `textDim` color and normal weight — don't go below 20px.

### Font Roles

| Font | Role | Examples |
|------|------|----------|
| `JetBrains Mono` | Data, numbers, labels, system text, stat values, badges | `50.000 Hz`, `1,100 GW`, `STEP 3/5` |
| `Inter` | Narrative, descriptions, speaker notes, body text | Slide subtitles, info panel descriptions |

---

## Layout

- **Title top, content center, metadata bottom.** Standard slide structure: title anchored to top, main visualization/content fills the center (`flex-1`), stat boxes or supporting info sits at the bottom.
- **Maximize visualization space.** Charts, canvases, and maps should fill as much vertical space as possible. Push ancillary info to edges.
- **Asymmetric layouts feel like dashboards.** Don't center-and-stack everything. Put HUD readouts in corners, stats along edges, the main event in the center.
- **Standard slide padding: `36px 56px`.** This is set as `const pad = '36px 56px'` in Presentation.jsx.
- **Canvas animations: no borders.** Animation components should blend into the slide background. No `border: 1px solid surfaceLight` or `borderRadius` on canvas wrappers. Let them breathe.

---

## Workflow

- **Do not commit or push unless explicitly requested by the user.** Wait for the user to review changes and ask for a commit.
- **Do not add Co-Authored-By lines in git commits.**
- **Framework: Spectacle** by Nearform (v10). Key shortcuts: `Ctrl+Shift+O` (overview), `Ctrl+Shift+P` (presenter mode), `Ctrl+K` (command palette), Arrow keys (navigate slides/steps).

---

## Component Architecture

### File Organization

```
presentation/src/
├── Presentation.jsx              # Main deck — all ~35 slides (65KB, should be split)
├── theme.js                      # Color tokens, font config
├── main.jsx                      # Entry point (fontsource imports)
├── index.css                     # TailwindCSS v4
├── components/
│   ├── ui/                       # 8 reusable primitives (GlowText, StatCard, etc.)
│   ├── *MapHUD.jsx               # DeckGL + MapLibre full-screen map slides (4 files)
│   ├── *Chart.jsx                # Canvas chart components (5 files)
│   ├── *Demo.jsx                 # Interactive canvas demos (3 files)
│   ├── *Diagram.jsx              # Canvas flow diagrams (2 files)
│   └── *Background.jsx           # Ambient canvas backgrounds (1 file)
└── slides/
    └── GridScaleSlides.jsx       # Slide variant exports (versionA/B/C/D)
```

### Quick Reference

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
| Map HUD component | `{Region}MapHUD.jsx` | `TexasMapHUD.jsx`, `SAMapHUD.jsx` |
| Canvas chart | `{Topic}Chart.jsx` | `DuckCurveChart.jsx`, `CurtailmentChart.jsx` |
| Canvas diagram | `{Topic}Diagram.jsx` | `EnpalArchitectureDiagram.jsx` |
| Interactive demo | `{Topic}Demo.jsx` | `FrequencyDemo.jsx`, `DemandResponseDemo.jsx` |
| UI primitives | `ui/{Name}.jsx` | `ui/GlowText.jsx`, `ui/StatCard.jsx` |
| Slide variants | `slides/{Topic}Slides.jsx` | `slides/GridScaleSlides.jsx` |

### DeckGL Map Components

4 components use DeckGL + MapLibre (`TexasMapHUD`, `SAMapHUD`, `EUGridHUD`, `VPPScenarioMapSlide`):

```jsx
import MapGL from 'react-map-gl/maplibre';  // MUST be MapGL, NOT Map
import { FlyToInterpolator } from '@deck.gl/core';

const FLY_TO = new FlyToInterpolator();      // Module-level singleton (stateless)
```

**Rules:**
- ALWAYS import as `MapGL` (not `Map`) — `Map` shadows JavaScript's built-in `Map` constructor and causes `"Map is not a constructor"` crashes
- ALWAYS use a module-level `FlyToInterpolator` singleton — it's stateless, safe to share
- Use `Map` (the JS data structure) for O(1) node/plant lookups instead of `Array.find()`

### Particle Shadow Batching

Canvas components with animated particles batch shadow draws by color to reduce GPU blur computations:

```jsx
// Group particles by color
const byColor = {};
for (const p of liveParticles) {
  if (!byColor[p.color]) byColor[p.color] = [];
  byColor[p.color].push(p);
}
// One shadow fill per color group instead of per particle
for (const [color, group] of Object.entries(byColor)) {
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const p of group) {
    ctx.moveTo(p._px + p.size, p._py);
    ctx.arc(p._px, p._py, p.size, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.shadowBlur = 0;
}
```

**Rules:**
- NEVER set `shadowBlur` per-element in a loop — batch into one `fill()` per color group
- Skip `shadowBlur` entirely for shapes < 3px (invisible at that scale)
- Each `fill()`/`stroke()` with `shadowBlur > 0` triggers a Gaussian blur — minimize the count

---

## Website: Tailwind v4 Responsive Design

The website (`website/`) uses Tailwind CSS v4 with a **mobile-first** breakpoint system. Font sizes and layout must be responsive.

### Breakpoints (mobile-first — unprefixed = all screens, prefix = that size and up)

| Prefix | Min Width | Use |
|--------|-----------|-----|
| *(none)* | 0 | Mobile default — start here |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large screens |

### Font Sizing Rules

- **Body text in callouts/cards:** Use `text-base` (1rem), not `text-sm`. `text-sm` (0.875rem = 14px) is too small for readable paragraphs.
- **Labels, captions, metadata:** `text-sm` or `text-xs` are fine — these are secondary information.
- **Responsive scaling:** Write mobile size first, add breakpoint modifiers to scale up: `text-sm md:text-base lg:text-lg`.
- **Never use `!important` overrides in global CSS to fix font sizes.** Use Tailwind's utility classes directly in markup.

### Common Pattern

```html
<!-- Label: small is fine -->
<div class="font-mono text-sm uppercase">Section Label</div>

<!-- Body text: text-base minimum, scale up on larger screens -->
<p class="text-base lg:text-lg">Readable paragraph content...</p>
```

### Custom Breakpoints (if needed)

Define in the CSS theme block, not in config files:

```css
@theme {
  --breakpoint-tablet: 48rem;
  --breakpoint-desktop: 80rem;
}
```

Then use as `tablet:text-base desktop:text-lg`.

### `max-*` Variants

Target below a breakpoint: `max-md:text-sm` applies only below 768px. Combine for ranges: `md:max-lg:flex`.

### Container Queries (v4)

For component-scoped responsive design (independent of viewport):

```html
<div class="@container">
  <p class="text-sm @md:text-base">Scales with container, not viewport</p>
</div>
```

---

## Open Improvements

### HIGH: Lazy Slide Mounting (Issue #5)

**Problem:** Spectacle renders all ~35 slides into the DOM simultaneously. Every canvas RAF loop, DeckGL WebGL context, and MapLibre tile fetcher is alive from page load.

**Solution:** Create a `<LazyContent>` wrapper that only mounts heavy children when the slide is active:

```jsx
// presentation/src/components/ui/LazyContent.jsx
import { useContext } from 'react';
import { SlideContext } from 'spectacle';

export default function LazyContent({ children }) {
  const slideContext = useContext(SlideContext);
  if (!slideContext?.isSlideActive) return null;
  return <>{children}</>;
}

// Usage in Presentation.jsx:
<Slide backgroundColor={bg}>
  <LazyContent>
    <TexasMapHUD variant="hud" />
  </LazyContent>
</Slide>
```

**Impact:** Eliminates ~30 idle RAF loops and ~4 WebGL contexts. Single biggest performance win available.

**Risk:** Flash of empty content when navigating to a heavy slide. Mitigate with:
- CSS fade-in transition on mount
- Only wrapping the heaviest components (DeckGL maps, canvas animations), not text slides
- Optional: mount +-1 adjacent slides for pre-warming

### MEDIUM: Extract Shared Canvas Utilities

**Problem:** 18 canvas components duplicate: 2x HiDPI setup, RAF gating, background grid drawing, padding calculations, and particle rendering.

**Proposed:** `presentation/src/utils/canvas.js` with `setupCanvas()`, `drawGrid()`, and `drawParticlesBatched()`.

### MEDIUM: Consolidate DeckGL Boilerplate

**Problem:** 4 map components repeat the same DeckGL + MapGL + dark-matter-style + scanline overlay pattern.

**Proposed:** `MapSlideShell.jsx` wrapping the shared DeckGL/MapGL/scanlines structure, with each map component providing only its custom layers and HUD panels.

### LOW: Split Presentation.jsx

**Problem:** `Presentation.jsx` is ~65KB with all slide JSX inlined. Hard to navigate, causes large diffs.

**Proposed:** Split into `slides/01-Opening.jsx`, `slides/02-TheGrid.jsx`, etc. Import and spread.

### LOW: Extend Shadow Batching

Apply the particle batching pattern to remaining heavy canvas components:

| Component | Shadow draws/frame | Status |
|-----------|-------------------|--------|
| VPPArchitecture | ~98 → ~15 | Done |
| EnpalArchitectureDiagram | ~60 → ~12 | Done |
| FrequencyDemo | ~16 | Not done (complex interleaving) |
| LargestMachineZoom | ~8 | Not done |
| ThankYouBackground | ~6 | Not done |

---

## Lessons Learned

These came from actual bugs and debugging sessions:

1. **`import Map from 'react-map-gl/maplibre'` shadows `new Map()`** — always import as `MapGL`. This caused a production crash.
2. **`Array.indexOf([a, b])` never works** — JavaScript compares array references, not values. Use loop indices or pre-computed Maps.
3. **`setState()` in RAF loops = 60 re-renders/sec** — use refs for draw-loop state, throttle React state updates to ~15fps max.
4. **Canvas `shadowBlur` cost is per-fill, not per-state-change** — batch shapes into single `fill()` calls grouped by color.
5. **`FlyToInterpolator` is stateless** — use a module-level singleton, never `new FlyToInterpolator()` per transition.
6. **Spectacle `SlideContext.isSlideActive`** — the only reliable way to know if your slide is visible. ALWAYS gate heavy work on this.
7. **Canvas padding cutoff is recurring** — callouts below need padBottom >= 65px, annotations above need padTop >= 55px. When in doubt, add 20%.
8. **`useEffect` deps for RAF** — must include `slideContext?.isSlideActive` so the loop restarts when the slide becomes active.
9. **Google Fonts CDN = render-blocking external dependency** — self-host via `@fontsource` packages instead.
10. **`Array.find()` in draw loops = O(n) per frame** — pre-compute `Map` at module level for O(1).

---

## For Agents Working on This Codebase

1. **Read `docs/slide-order.md` first** — canonical slide sequence with speaker assignments and timing
2. **Read `theme.js`** — all color tokens. Never hardcode hex (except Databricks orange `#FF3621` / `#E25A1C`)
3. **Check `ui/` before creating new components** — GlowText, Subtitle, StatCard, Badge, ComparisonRow, TimelineItem, SectionDivider already exist
4. **Gate all animations on `isSlideActive`** — if you add a new canvas/RAF/interval, gate it or it burns CPU forever on invisible slides
5. **Import MapLibre as `MapGL`** — not `Map` (shadows built-in Map constructor)
6. **Flexa, not Flexor** — the VPP controller is always "Flexa" (Enpal + Entrix joint venture)
7. **Spark does NOT connect to EMQX directly** — see `docs/architecture-data-flow.md`
8. **Test with `npm run build`** — Vite production build catches things dev mode misses
9. **No emoji in components** — dark cinematic aesthetic only
10. **No Co-Authored-By in commits**
