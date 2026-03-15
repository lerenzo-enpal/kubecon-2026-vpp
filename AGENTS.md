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
