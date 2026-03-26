# Visual Identity: "Mission Control"

The aesthetic is a **Hollywood intelligence agency control room** — think the briefing screens in Mission Impossible, Q's lab in Bond, the war table in a submarine movie. This is critical infrastructure being monitored in real time. Every pixel should feel operational, not decorative.

**Reference points:** Bloomberg terminal, SCADA control rooms, Minority Report UI, TRON Legacy interfaces, submarine CIC displays.

---

## Core Principles

1. **Data is the decoration** — no clip art, no stock photos, no illustrations. Animated frequency lines, live-ticking numbers, pulsing grid nodes, glowing connection lines. Every visual element should look like it belongs on a control panel.

2. **Color encodes meaning — always.** Never use color decoratively.
   - `cyan #22d3ee` — grid / stable / primary system
   - `green #10b981` — VPP / batteries / success / recovery
   - `red #ef4444` — failure / danger / cascade
   - `amber #f59e0b` — warning / solar / caution
   - `purple #a78bfa` — secondary systems
   - Backgrounds: `#0a0e17` (deep navy-black), `#1a2236` (surface), `#243049` (surface-light)
   - Text: `#f1f5f9` (primary), `#94a3b8` (muted), `#64748b` (dim)

3. **Typography as hierarchy** — `JetBrains Mono` for data, numbers, labels, system readouts. `Inter` for narrative text and descriptions. Numbers should be bold, large, and glowing.

4. **High-stakes tension** — the audience should feel like they're watching something important happen in real time. When things go wrong: red pulses, warning flashes. When VPP stabilizes: green calm.

5. **No emoji.** Dark cinematic aesthetic only.

---

## Motion & Animation Language

### Philosophy

- **The system is alive.** Even at rest, things pulse, jitter, and breathe. A perfectly still screen feels dead.
- **Motion has purpose.** Elements enter because data arrived. Alerts flash because a threshold was crossed.
- **Authority, not playfulness.** Fast entry, smooth deceleration. Never bouncy. Never springy. Never wobbly.

### Timing Reference

| Pattern | Duration | Notes |
|---------|----------|-------|
| Element entry (fade/slide in) | 400-700ms | Stagger 200-400ms between items |
| Dramatic reveal (big numbers) | 800-1200ms | `easeOutBack` sparingly |
| Camera/zoom moves | 3-5 seconds | `easeInOutCubic`, never rushed |
| Alert blink | 150ms on/off, 3 cycles | Hard cuts, not fades |
| Micro-pulse (alive indicators) | 2-4 second period | `sin(t)` based, subtle |
| Data counter tick-up | 2-4s total | Accelerate then decelerate |
| Color state change | 300-500ms | Smooth crossfade |

### Easing Curves

| Use case | Curve |
|----------|-------|
| Default entry | `cubic-bezier(0.16, 1, 0.3, 1)` or `ease-out` |
| Dramatic zoom | `easeInOutCubic` |
| Impact reveal | `easeOutBack` |
| Alert/warning | `step-end` or instant toggle |
| **Never use** | Bounce, elastic, spring |
| **Never use** | `ease-in` alone (feels sluggish) |

### Entry Patterns

**Staggered Reveal (boot sequence)** — The signature pattern. Elements appear one by one with short delays, like a system booting up.

**Slide-In from Edge** — Data panels enter from left, tech content from right.

**Scale-Up Reveal** — For dramatic single-element reveals. Starts small, scales up with slight overshoot.

**Counter Tick-Up** — Numbers count from 0 to target. Start fast, decelerate (like instruments settling).

**Scan Line** — Faint horizontal line sweeps slowly down the canvas. Very low opacity (0.02-0.04).

### State Changes

**Stable to Alert:** Cyan to amber to red over 300ms. Glow increases. Pulse frequency increases.

**Alert to Recovery:** Red desaturates. Green glow blooms and spreads. Pulse frequency decreases.

**Zoom transitions:** Always `easeInOutCubic`. 3-5 seconds. Add subtle parallax where possible.

---

## Typography

### Minimum Sizes

- **All slide content text: minimum 20px.** Presentations are projected.
- **Exceptions:** Canvas HUD overlays, navigational chrome.
- **Canvas-rendered text: minimum 14px.**

### Font Roles

| Font | Role | Examples |
|------|------|----------|
| `JetBrains Mono` | Data, numbers, labels, system text | `50.000 Hz`, `1,100 GW` |
| `Inter` | Narrative, descriptions, body text | Slide subtitles, info panels |

---

## Layout

- **Title top, content center, metadata bottom.**
- **Maximize visualization space.** Charts and maps fill as much vertical space as possible.
- **Asymmetric layouts feel like dashboards.** HUD readouts in corners, stats along edges.
- **Standard slide padding: `36px 56px`.**
- **Canvas animations: no borders.** Let them blend into the background.

---

## Anti-Patterns

- **Filled shapes for icons** — use stroked outlines instead
- **Bounce / spring / elastic easing** — too playful
- **Simultaneous entry** — always stagger, even if only 100ms apart
- **Decorative gradients** — gradients are for functional glow only
- **Rounded-full / pill shapes** — prefer sharp rectangles or subtle radius (4-8px)
- **Drop shadows** — use inner glow instead
- **White backgrounds** — everything on dark backgrounds. Light is emitted.
- **Thick borders** — 1px max, low opacity (15-30%)

---

## Canvas Animation Standards

- 2x retina scaling (`canvas.width = width * 2; ctx.scale(2, 2)`)
- Guard animation on `slideContext?.isSlideActive`
- Use `requestAnimationFrame` loop, clean up on unmount
- Time-based animation (`performance.now()`), never frame-counting
- Shadow/glow: `ctx.shadowBlur` + `ctx.shadowColor` for emphasis, always reset after
- Batch shadow draws by color (one `fill()` per color group, not per element)
- **Prevent canvas cutoff:** padTop >= 55px for annotations above, padBottom >= 65px for callouts below

## Particle Shadow Batching

```javascript
// Group particles by color — one shadow fill per group
const byColor = {};
for (const p of particles) {
  if (!byColor[p.color]) byColor[p.color] = [];
  byColor[p.color].push(p);
}
for (const [color, group] of Object.entries(byColor)) {
  ctx.shadowBlur = 10;
  ctx.shadowColor = color;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const p of group) {
    ctx.moveTo(p.x + p.size, p.y);
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.shadowBlur = 0;
}
```
