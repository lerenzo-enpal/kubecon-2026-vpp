# Basics Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Basics" section to the website with four interactive educational pages covering electricity fundamentals, supply/demand balance, battery technology, and alternative energy storage.

**Architecture:** Astro pages with React island components. Scroll-driven briefing animations use a shared `ScrollBriefing.tsx` wrapper that manages sticky canvas + scroll progress. Lab components are standalone React interactives. All Canvas 2D rendering reads CSS custom properties for dark/light mode support.

**Tech Stack:** Astro 6, React 18, TailwindCSS v4, Canvas 2D API, IntersectionObserver

**Spec:** `docs/superpowers/specs/2026-03-22-basics-section-design.md`

---

## File Map

### Infrastructure (shared)
| Action | File | Responsibility |
|--------|------|---------------|
| Create | `website/src/components/basics/briefings/ScrollBriefing.tsx` | Shared scroll-driven briefing wrapper (sticky canvas + progress calculation) |
| Create | `website/src/components/basics/shared/canvasTheme.ts` | `getCanvasThemeColors()` utility for dark/light Canvas 2D rendering |
| Modify | `website/src/components/SiteHeader.astro` | Add "Basics" nav link before "Learn" |
| Modify | `website/src/layouts/ContentLayout.astro` | Add basics array + sidebar section |
| Modify | `website/test/build-check.mjs` | Add checks for 5 new basics pages |

### Pages
| Action | File | Responsibility |
|--------|------|---------------|
| Create | `website/src/pages/basics/index.astro` | Basics hub with 4 module cards |
| Create | `website/src/pages/basics/how-electricity-works.astro` | Page 1: electricity fundamentals |
| Create | `website/src/pages/basics/supply-and-demand.astro` | Page 2: instantaneous balance |
| Create | `website/src/pages/basics/how-batteries-work.astro` | Page 3: Li-ion deep dive |
| Create | `website/src/pages/basics/beyond-lithium-ion.astro` | Page 4: alternative storage |

### Page 1 Components
| Action | File | Responsibility |
|--------|------|---------------|
| Create | `website/src/components/basics/briefings/WaterToWiresBriefing.tsx` | Scroll: pipe→wire analogy |
| Create | `website/src/components/basics/briefings/ACvsDCBriefing.tsx` | Scroll: waveform morphing |
| Create | `website/src/components/basics/briefings/SpinningPowerBriefing.tsx` | Scroll: generation animation |
| Create | `website/src/components/basics/labs/OhmsLawPlayground.tsx` | Lab: V/I/R sliders + circuit |
| Create | `website/src/components/basics/labs/PowerEnergyCalculator.tsx` | Lab: device picker + time slider |

### Page 2 Components
| Action | File | Responsibility |
|--------|------|---------------|
| Create | `website/src/components/basics/briefings/NoBufferBriefing.tsx` | Scroll: buffer comparison |
| Create | `website/src/components/basics/briefings/SpinningMassBriefing.tsx` | Scroll: rotor/frequency |
| Create | `website/src/components/basics/briefings/ThresholdWalkthroughBriefing.tsx` | Scroll: frequency thresholds |
| Create | `website/src/components/basics/labs/GridOperatorGame.tsx` | Lab: grid balancing game (MVP) |
| Create | `website/src/components/basics/labs/StorageScaleVisualizer.tsx` | Lab: battery vs grid scale |

### Page 3 Components
| Action | File | Responsibility |
|--------|------|---------------|
| Create | `website/src/components/basics/briefings/BatteryHistoryBriefing.tsx` | Scroll: battery timeline |
| Create | `website/src/components/basics/briefings/InsideTheCellBriefing.tsx` | Scroll: cell cross-section |
| Create | `website/src/components/basics/briefings/PriceCrashBriefing.tsx` | Scroll: cost curve |
| Create | `website/src/components/basics/labs/BatteryChemistryWorkbench.tsx` | Lab: chemistry selector + radar |
| Create | `website/src/components/basics/labs/BatteryLifecycleSimulator.tsx` | Lab: degradation simulation |
| Create | `website/src/components/basics/labs/UpcomingBatteryTech.tsx` | Lab: emerging tech cards |

### Page 4 Components
| Action | File | Responsibility |
|--------|------|---------------|
| Create | `website/src/components/basics/briefings/DurationProblemBriefing.tsx` | Scroll: cost vs duration |
| Create | `website/src/components/basics/briefings/StorageZooBriefing.tsx` | Scroll: 7-tech animated tour |
| Create | `website/src/components/basics/labs/StorageScenarioBuilder.tsx` | Lab: grid problem → tech match |
| Create | `website/src/components/basics/labs/StorageComparisonTool.tsx` | Lab: radar chart comparison |

### Cross-linking
| Action | File | Responsibility |
|--------|------|---------------|
| Modify | `website/src/pages/learn/how-the-grid-works.astro` | Add "start with basics" links |

---

## Task 1: Shared Infrastructure — Canvas Theme Utility

**Files:**
- Create: `website/src/components/basics/shared/canvasTheme.ts`

This is the foundation utility used by every Canvas 2D component in the section.

- [ ] **Step 1: Create canvasTheme.ts**

```typescript
// website/src/components/basics/shared/canvasTheme.ts

function getCSSColor(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
}

export interface CanvasThemeColors {
  primary: string;
  accent: string;
  danger: string;
  success: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textMuted: string;
  textDim: string;
  bg: string;
  bgAlt: string;
}

export function getCanvasThemeColors(): CanvasThemeColors {
  return {
    primary: getCSSColor('--color-primary', '#22d3ee'),
    accent: getCSSColor('--color-accent', '#f59e0b'),
    danger: getCSSColor('--color-danger', '#ef4444'),
    success: getCSSColor('--color-success', '#10b981'),
    surface: getCSSColor('--color-surface', '#1a2236'),
    surfaceLight: getCSSColor('--color-surface-light', '#243049'),
    text: getCSSColor('--color-text', '#f1f5f9'),
    textMuted: getCSSColor('--color-text-muted', '#94a3b8'),
    textDim: getCSSColor('--color-text-dim', '#64748b'),
    bg: getCSSColor('--color-bg', '#0a0e17'),
    bgAlt: getCSSColor('--color-bg-alt', '#111827'),
  };
}
```

Note: This mirrors the pattern used in `website/src/components/FrequencyDemo.tsx:10-30` but extracted as a shared utility. All new Canvas components should import from here instead of defining their own `getCSSColor`.

- [ ] **Step 2: Verify the file exists and has no syntax errors**

Run: `cd /home/mario/code/kubekon/kubecon-2026-vpp/website && npx astro check 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add website/src/components/basics/shared/canvasTheme.ts
git commit -m "Add shared canvas theme utility for basics section"
```

---

## Task 2: Shared Infrastructure — ScrollBriefing Wrapper

**Files:**
- Create: `website/src/components/basics/briefings/ScrollBriefing.tsx`

This is the core scroll-driven animation wrapper used by all 12 briefing components. See the spec's "Shared Infrastructure" section for the full technical design.

- [ ] **Step 1: Create ScrollBriefing.tsx**

The component must:
1. Render a tall scrollable container (height configurable, default 250vh)
2. Contain a sticky canvas element (`position: sticky; top: 80px`)
3. Calculate scroll progress (0.0-1.0) based on container scroll position
4. Call `render(ctx, progress, width, height, colors)` on each rAF frame
5. Cancel rAF when container scrolls out of view (IntersectionObserver)
6. Handle `prefers-reduced-motion` by rendering at progress=1.0 as static
7. Handle canvas resize on window resize
8. Accept children (text blocks) that render alongside the canvas

```tsx
// website/src/components/basics/briefings/ScrollBriefing.tsx
import { useEffect, useRef, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

interface Props {
  /** Height of the scroll container in vh units */
  height?: number;
  /** Canvas render callback — called on each frame with scroll progress 0-1 */
  render: (ctx: CanvasRenderingContext2D, progress: number, width: number, height: number, colors: CanvasThemeColors) => void;
  /** Unique id for TOC scroll-spy */
  id: string;
  /** Children render as text column alongside the sticky canvas */
  children?: React.ReactNode;
}

export default function ScrollBriefing({ height = 250, render: renderFn, id, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(false);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const reducedMotionRef = useRef(false);

  // Check reduced motion preference
  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => { reducedMotionRef.current = e.matches; };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Update colors on theme change
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => { colorsRef.current = getCanvasThemeColors(); };
    mql.addEventListener('change', update);
    // Also listen for class changes on html element (manual toggle)
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mql.removeEventListener('change', update); observer.disconnect(); };
  }, []);

  const getProgress = useCallback(() => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const viewH = window.innerHeight;
    // Progress: 0 when top of container reaches top of viewport,
    // 1 when bottom of container reaches bottom of viewport
    const scrollable = rect.height - viewH;
    if (scrollable <= 0) return 1;
    const progress = Math.max(0, Math.min(1, -rect.top / scrollable));
    return progress;
  }, []);

  // Canvas sizing
  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = Math.min(parent.clientHeight, window.innerHeight - 100);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  // Animation loop
  useEffect(() => {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    function frame() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const progress = reducedMotionRef.current ? 1 : getProgress();
        ctx.clearRect(0, 0, w, h);
        renderFn(ctx, progress, w, h, colorsRef.current);
      }
      // Only continue loop while visible (restart via IntersectionObserver)
      if (isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = 0;
      }
    }

    // Start/stop loop based on visibility
    function startLoop() {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) startLoop();
      },
      { threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    startLoop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', sizeCanvas);
      observer.disconnect();
    };
  }, [renderFn, sizeCanvas, getProgress]);

  return (
    <section id={id} style={{ height: `${height}vh`, position: 'relative' }}>
      <div className="flex gap-8" style={{ height: '100%' }}>
        {/* Sticky canvas column */}
        <div className="flex-1 min-w-0" style={{ position: 'sticky', top: '80px', height: 'calc(100vh - 100px)', alignSelf: 'flex-start' }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Animated diagram for ${id}`}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {/* Scrolling text column */}
        {children && (
          <div className="w-2/5 flex-shrink-0 flex flex-col justify-between py-20" style={{ minHeight: '100%' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify compilation**

Run: `cd /home/mario/code/kubekon/kubecon-2026-vpp/website && npx astro check 2>&1 | tail -20`

- [ ] **Step 3: Commit**

```bash
git add website/src/components/basics/briefings/ScrollBriefing.tsx
git commit -m "Add ScrollBriefing wrapper for scroll-driven briefing animations"
```

---

## Task 3: Navigation — SiteHeader + ContentLayout + Build Check

**Files:**
- Modify: `website/src/components/SiteHeader.astro:14` — add Basics link
- Modify: `website/src/layouts/ContentLayout.astro:21-83` — add basics sidebar section
- Modify: `website/test/build-check.mjs` — add checks for basics pages

- [ ] **Step 1: Add "Basics" link to SiteHeader.astro**

In `website/src/components/SiteHeader.astro`, add a "Basics" link before the "Learn" link in the nav (line 15):

```astro
<!-- Add this line before the Learn link -->
<a href={url("/basics")} class="hover:opacity-70 transition-opacity">Basics</a>
```

- [ ] **Step 2: Add basics section to ContentLayout.astro sidebar**

In `website/src/layouts/ContentLayout.astro`, add the following after line 19 (after the `Astro.props` destructuring):

```javascript
const basics = [
  {
    title: 'How Electricity Works',
    href: url('/basics/how-electricity-works'),
    interactive: true,
    sections: [
      { id: 'what-is-this-stuff', title: 'What Is This Stuff?' },
      { id: 'ac-vs-dc', title: 'AC vs DC' },
      { id: 'spinning-into-power', title: 'Spinning Into Power' },
      { id: 'ohms-law-playground', title: 'Ohm\'s Law Playground', interactive: true },
      { id: 'power-vs-energy', title: 'Power vs Energy', interactive: true },
    ],
  },
  {
    title: 'Supply & Demand',
    href: url('/basics/supply-and-demand'),
    interactive: true,
    sections: [
      { id: 'no-buffer', title: 'No Buffer, Just Physics' },
      { id: 'spinning-mass', title: 'The Spinning Mass' },
      { id: 'thresholds', title: '2.5 Hz to Blackout' },
      { id: 'grid-operator', title: 'Be the Grid Operator', interactive: true },
      { id: 'storage-scale', title: 'Why Can\'t We Store It?', interactive: true },
    ],
  },
  {
    title: 'How Batteries Work',
    href: url('/basics/how-batteries-work'),
    interactive: true,
    sections: [
      { id: 'history', title: 'Bottled Lightning' },
      { id: 'inside-the-cell', title: 'Inside the Cell' },
      { id: 'price-crash', title: 'The Price Crash' },
      { id: 'chemistry-workbench', title: 'Chemistry Workbench', interactive: true },
      { id: 'lifecycle', title: 'Lifecycle Simulator', interactive: true },
      { id: 'whats-next', title: 'What\'s Coming Next', interactive: true },
    ],
  },
  {
    title: 'Beyond Lithium-Ion',
    href: url('/basics/beyond-lithium-ion'),
    interactive: true,
    sections: [
      { id: 'duration-problem', title: 'The Duration Problem' },
      { id: 'storage-zoo', title: 'The Storage Zoo' },
      { id: 'scenario-builder', title: 'Pick Your Storage', interactive: true },
      { id: 'comparison-tool', title: 'Compare Technologies', interactive: true },
    ],
  },
];

const isBasics = currentPath.startsWith('/basics');
```

Then add a new sidebar block ABOVE the existing Learn section (before line 124's `<a href={url("/learn")}` block). Follow the exact same pattern as the Learn modules nav but using the `basics` array. Use heading "Basics" with link to `url("/basics")`.

- [ ] **Step 3: Add build checks for basics pages**

In `website/test/build-check.mjs`, add checks for the 5 new pages:

```javascript
// Basics section
check('Basics index page exists', pageExists('basics/index.html'));
check('How Electricity Works page exists', pageExists('basics/how-electricity-works/index.html'));
check('Supply and Demand page exists', pageExists('basics/supply-and-demand/index.html'));
check('How Batteries Work page exists', pageExists('basics/how-batteries-work/index.html'));
check('Beyond Lithium-Ion page exists', pageExists('basics/beyond-lithium-ion/index.html'));
```

- [ ] **Step 4: Commit**

```bash
git add website/src/components/SiteHeader.astro website/src/layouts/ContentLayout.astro website/test/build-check.mjs
git commit -m "Add Basics section to site navigation and sidebar"
```

---

## Task 4: Basics Hub Page

**Files:**
- Create: `website/src/pages/basics/index.astro`

Follow the same pattern as `website/src/pages/learn/index.astro`.

- [ ] **Step 1: Create the hub page**

```astro
---
import ContentLayout from '../../layouts/ContentLayout.astro';
import { url } from '../../utils/url';

const pages = [
  { num: 1, title: 'How Electricity Works', desc: 'Voltage, current, AC vs DC, and how we generate the power that runs everything.', href: url('/basics/how-electricity-works'), interactive: true },
  { num: 2, title: 'Supply & Demand', desc: 'Why the grid must balance supply and demand every second — and what happens when it can\'t.', href: url('/basics/supply-and-demand'), interactive: true },
  { num: 3, title: 'How Batteries Work', desc: 'Inside lithium-ion cells, the cost revolution, and the technology coming next.', href: url('/basics/how-batteries-work'), interactive: true },
  { num: 4, title: 'Beyond Lithium-Ion', desc: 'Flow batteries, pumped hydro, gravity storage, hydrogen, and the portfolio the grid needs.', href: url('/basics/beyond-lithium-ion'), interactive: true },
];
---

<ContentLayout title="Basics" description="The foundations of electricity, grid balance, and energy storage.">

<h1>Basics</h1>

<p class="text-xl" style="color: var(--color-text-muted); max-width: 600px;">
  The foundations of electricity, grid balance, and energy storage.
  New to energy? Start with How Electricity Works. Already familiar? Jump to any topic.
</p>

<hr />

<div class="flex flex-col gap-4">
  {pages.map((p) => (
    <a
      href={p.href}
      class="group flex items-start gap-5 p-5 rounded-xl transition-all duration-200 hover:translate-x-1"
      style="background: var(--color-bg-alt); border: 1px solid var(--color-surface-light);"
    >
      <div
        class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-lg"
        style="background: var(--color-surface); color: var(--color-primary);"
      >
        {p.num}
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-2 mb-1">
          <span class="font-semibold text-lg group-hover:text-white transition-colors" style="color: var(--color-text);">
            {p.title}
          </span>
          {p.interactive && (
            <span
              class="font-mono text-xs px-2 py-0.5 rounded"
              style="background: rgba(34, 211, 238, 0.1); color: var(--color-primary); border: 1px solid rgba(34, 211, 238, 0.2);"
            >
              Interactive
            </span>
          )}
        </div>
        <div class="text-sm" style="color: var(--color-text-dim);">
          {p.desc}
        </div>
      </div>
    </a>
  ))}
</div>

<div class="mt-10 p-5 rounded-lg no-arrow" style="background: var(--color-surface); border: 1px solid var(--color-surface-light);">
  <div class="font-mono text-xs mb-2" style="color: var(--color-text-dim); letter-spacing: 0.08em; text-transform: uppercase;">
    Ready for the full story?
  </div>
  <div class="text-base" style="color: var(--color-text-muted);">
    Once you know the basics, the <a href={url("/learn/how-the-grid-works")} style="color: var(--color-primary);">Learn</a> section
    tells the story of Virtual Power Plants — from grid problems to distributed solutions.
  </div>
</div>

</ContentLayout>
```

- [ ] **Step 2: Verify build**

Run: `cd /home/mario/code/kubekon/kubecon-2026-vpp/website && npm run build 2>&1 | tail -20`
Expected: Build succeeds, basics/index.html generated.

- [ ] **Step 3: Commit**

```bash
git add website/src/pages/basics/index.astro
git commit -m "Add Basics hub page with module cards"
```

---

## Task 5: Page 1 — How Electricity Works (page shell + briefings)

**Files:**
- Create: `website/src/pages/basics/how-electricity-works.astro`
- Create: `website/src/components/basics/briefings/WaterToWiresBriefing.tsx`
- Create: `website/src/components/basics/briefings/ACvsDCBriefing.tsx`
- Create: `website/src/components/basics/briefings/SpinningPowerBriefing.tsx`

- [ ] **Step 1: Create the page shell**

Create `website/src/pages/basics/how-electricity-works.astro` using ContentLayout. Include:
- Title, intro paragraph
- `noscript` fallback
- Import and render all 3 briefing components with `client:visible`
- Placeholder slots for the 2 lab components (to be added in Task 6)
- "Continue to" link to supply-and-demand

Follow the same structure as existing learn pages (e.g., `how-the-grid-works.astro`) but with the briefing + lab section pattern. Each briefing/lab section should have an `id` matching the sidebar TOC ids from Task 3.

- [ ] **Step 2: Create WaterToWiresBriefing.tsx**

Implements the pipe-to-wire analogy. Uses `ScrollBriefing` wrapper. The `render` callback draws:
- Progress 0.0-0.3: Water pipe system with flowing particles. Labels: "pressure (voltage)", "flow rate (current)", "pipe width (resistance)". Pipe width and flow rate change with progress.
- Progress 0.3-0.6: Pipe morphs into a wire. Water particles become electrons (smaller, glowing cyan). Labels update to electrical terms.
- Progress 0.6-0.8: Wire circuit with lightbulb. Current flowing, bulb brightness proportional to current.
- Progress 0.8-1.0: Formula appears: V = I x R with values.

Text children (scroll column):
- "What is voltage?" block (visible progress 0.0-0.25)
- "What is current?" block (visible progress 0.2-0.45)
- "What is resistance?" block (visible progress 0.4-0.65)
- "It's exactly like water in pipes" block (visible progress 0.6-1.0)

Use `getCanvasThemeColors()` for all colors.

- [ ] **Step 3: Create ACvsDCBriefing.tsx**

Uses `ScrollBriefing` wrapper. The `render` callback draws:
- Progress 0.0-0.2: Flat DC line (labeled "DC: Direct Current — steady, like a battery")
- Progress 0.2-0.5: Line morphs into sine wave at 50 Hz. Label: "AC: Alternating Current — direction switches 50 times per second"
- Progress 0.5-0.7: Transformer diagram appears. Shows 230V stepping up to 400kV. Label: "Transformers only work with AC — that's why AC won"
- Progress 0.7-0.85: Transmission line with I²R loss annotation. Low current = low loss.
- Progress 0.85-1.0: Inverter/rectifier bridge. "Your phone needs DC. Your wall outlet is AC. An inverter converts between them."

Text children cover: Edison vs Tesla, why AC won, why DC is coming back (solar, batteries, HVDC).

- [ ] **Step 4: Create SpinningPowerBriefing.tsx**

Uses `ScrollBriefing` wrapper. The `render` callback draws:
- Progress 0.0-0.3: Magnet spinning inside a coil. Electrons flow in the wire. Faraday's law in action.
- Progress 0.3-0.5: Zoom out — magnet driven by steam turbine. Heat source → steam → turbine → generator.
- Progress 0.5-0.7: Multiple generation types fan out: coal/gas (steam), nuclear (steam), hydro (water), wind (direct drive).
- Progress 0.7-1.0: Solar PV appears separately. "The one that doesn't spin." Photon → electron animation in silicon crystal. Callout: no moving parts.

Text children cover: electromagnetic induction, the universal spinning principle, why solar is fundamentally different.

- [ ] **Step 5: Verify build and visually check**

Run: `cd /home/mario/code/kubekon/kubecon-2026-vpp/website && npm run build 2>&1 | tail -10`

Then visually validate using Playwright MCP tools:
1. Navigate to `http://localhost:4321/basics/how-electricity-works`
2. Take screenshot, verify page renders with briefing components
3. Scroll down, take screenshots at different scroll positions to verify animation progress

- [ ] **Step 6: Commit**

```bash
git add website/src/pages/basics/how-electricity-works.astro website/src/components/basics/briefings/WaterToWiresBriefing.tsx website/src/components/basics/briefings/ACvsDCBriefing.tsx website/src/components/basics/briefings/SpinningPowerBriefing.tsx
git commit -m "Add Page 1: How Electricity Works with 3 scroll-driven briefings"
```

---

## Task 6: Page 1 Labs — Ohm's Law Playground + Power vs Energy Calculator

**Files:**
- Create: `website/src/components/basics/labs/OhmsLawPlayground.tsx`
- Create: `website/src/components/basics/labs/PowerEnergyCalculator.tsx`
- Modify: `website/src/pages/basics/how-electricity-works.astro` — wire in lab components

- [ ] **Step 1: Create OhmsLawPlayground.tsx**

Interactive component with:
- Three range sliders: Voltage (0-400000V with log scale), Current (0.001-1000A with log scale), Resistance (0.01-100000Ω with log scale)
- "Lock" toggle on each slider — when two are unlocked, dragging either recalculates the locked one via V=IR
- Canvas visualization: a simple circuit (battery → wire → resistor → lightbulb → wire back). Lightbulb brightness scales with current. Wire thickness scales inversely with resistance.
- Preset buttons: "Phone charger" (5V, 2A), "Wall outlet" (230V, 10A), "Transmission line" (400kV, 1kA), "LED" (3V, 0.02A)
- Formula display: `V = I × R` and `P = V × I` with current computed values, highlighted in cyan
- Wrap in `FullscreenWrapper` (import from `website/src/components/FullscreenWrapper.tsx`)
- All colors from `getCanvasThemeColors()`

- [ ] **Step 2: Create PowerEnergyCalculator.tsx**

Interactive component with:
- Device selector (buttons): LED bulb (10W), Laptop (65W), EV charger (11kW), House (3,500W avg), Data center (50MW), City of Berlin (2GW)
- Selected device shows its power draw with auto-scaling units (W/kW/MW/GW)
- Time slider (0-24 hours)
- Canvas: a "tank" (styled as battery) that fills proportionally. Fill rate = power, fill level = energy consumed
- Energy readout with auto-scaling (Wh/kWh/MWh/GWh)
- Comparison mode: two device slots side-by-side
- Callout text: "A 100W bulb for 10 hours = a 1000W microwave for 1 hour = 1 kWh"
- Wrap in `FullscreenWrapper`

- [ ] **Step 3: Wire labs into the page**

In `how-electricity-works.astro`, replace lab placeholders with actual component imports:
```astro
import OhmsLawPlayground from '../../components/basics/labs/OhmsLawPlayground.tsx';
import PowerEnergyCalculator from '../../components/basics/labs/PowerEnergyCalculator.tsx';
```
Render with `client:visible`.

- [ ] **Step 4: Visual validation**

Use Playwright MCP to navigate to the page, scroll to lab sections, take screenshots. Verify:
- Sliders work
- Presets change values
- Canvas renders correctly in both dark and light mode (toggle theme)

- [ ] **Step 5: Commit**

```bash
git add website/src/components/basics/labs/OhmsLawPlayground.tsx website/src/components/basics/labs/PowerEnergyCalculator.tsx website/src/pages/basics/how-electricity-works.astro
git commit -m "Add Page 1 labs: Ohm's Law Playground and Power vs Energy Calculator"
```

---

## Task 7: Page 2 — Supply & Demand (page shell + briefings)

**Files:**
- Create: `website/src/pages/basics/supply-and-demand.astro`
- Create: `website/src/components/basics/briefings/NoBufferBriefing.tsx`
- Create: `website/src/components/basics/briefings/SpinningMassBriefing.tsx`
- Create: `website/src/components/basics/briefings/ThresholdWalkthroughBriefing.tsx`

- [ ] **Step 1: Create the page shell**

Same pattern as Task 5. Sections: no-buffer, spinning-mass, thresholds, grid-operator (placeholder), storage-scale (placeholder). "Continue to" link → how-batteries-work. "Go deeper" links → Research: Grid Frequency, Cascading Failures.

- [ ] **Step 2: Create NoBufferBriefing.tsx**

Uses `ScrollBriefing`. The `render` callback draws:
- Progress 0.0-0.25: Water system — tank between tap and drain, buffer visible, labeled "Water: buffered"
- Progress 0.25-0.45: Gas system — pipeline with pressure indicator, labeled "Gas: buffered"
- Progress 0.45-0.65: Data network — queue/cache icons, retry arrows, labeled "Data: buffered"
- Progress 0.65-0.85: All three fade. Electrical circuit appears with NOTHING between generator and load. Label: "Electricity: no buffer"
- Progress 0.85-1.0: Emphasis animation — the empty space pulses. Text: "No cache. No buffer. No retry. Just physics."

- [ ] **Step 3: Create SpinningMassBriefing.tsx**

Uses `ScrollBriefing`. Draws:
- Progress 0.0-0.2: Single turbine rotor spinning. Label: "3000 RPM = 50 Hz"
- Progress 0.2-0.4: Zoom out to show many rotors across a continent outline, all synchronized
- Progress 0.4-0.6: Demand increases (load bar grows) → rotors visibly slow → frequency gauge dips
- Progress 0.6-0.8: Demand decreases → rotors speed up → frequency rises
- Progress 0.8-1.0: Key insight: "Demand = brake. Supply = engine. Frequency = speedometer."

- [ ] **Step 4: Create ThresholdWalkthroughBriefing.tsx**

Uses `ScrollBriefing`. Draws:
- Large frequency gauge (circular, like a speedometer) starting at 50.0 Hz
- Progress drives frequency DOWN through thresholds:
  - 0.0-0.15: 50.0 Hz, green, "Normal"
  - 0.15-0.30: 49.8 Hz, amber, "FCR activates (30s)"
  - 0.30-0.45: 49.5 Hz, deep amber, "aFRR activates (5 min)"
  - 0.45-0.60: 49.0 Hz, red, "Load shedding begins"
  - 0.60-0.75: 48.0 Hz, deep red, "More load shedding"
  - 0.75-1.0: 47.5 Hz, black/pulsing red, "Generators disconnect. Cascade."
- Each threshold: status text, response time, who decides (automatic vs human)

- [ ] **Step 5: Verify build + visual check**

Build and Playwright screenshot at the supply-and-demand page.

- [ ] **Step 6: Commit**

```bash
git add website/src/pages/basics/supply-and-demand.astro website/src/components/basics/briefings/NoBufferBriefing.tsx website/src/components/basics/briefings/SpinningMassBriefing.tsx website/src/components/basics/briefings/ThresholdWalkthroughBriefing.tsx
git commit -m "Add Page 2: Supply & Demand with 3 scroll-driven briefings"
```

---

## Task 8: Page 2 Labs — Grid Operator Game (MVP) + Storage Scale Visualizer

**Files:**
- Create: `website/src/components/basics/labs/GridOperatorGame.tsx`
- Create: `website/src/components/basics/labs/StorageScaleVisualizer.tsx`
- Modify: `website/src/pages/basics/supply-and-demand.astro` — wire in labs

- [ ] **Step 1: Create GridOperatorGame.tsx (MVP)**

This is the most complex component. MVP scope (Phase 1 only):
- **Layout:** Frequency gauge (canvas, center-top), generation panel (left), demand bar (right)
- **State:** `time` (0-86400 simulated seconds, running at ~720x speed = 2 min real time), `frequency` (Hz), `assets` (gas/solar/battery status and output)
- **Demand curve:** Preset 24-hour profile: low at night (~200MW), morning ramp 6-9am (~350MW), midday dip noon (~280MW with solar help), evening peak 6-9pm (~400MW), decline to night
- **Assets:**
  - Gas: toggle on/off, ramps 50MW/min to 500MW max
  - Solar: automatic output follows sun curve (0 at night, 400MW peak at noon). One random cloud event drops output 60% for ~2 simulated hours
  - Battery: toggle charge/discharge, instant ±200MW, 800MWh capacity with energy bar
- **Frequency model (simplified but physically grounded):**
  ```
  // Inertia constant H = 5 seconds (typical for Continental Europe)
  // System base power S_base = 500 MW (our game's scale)
  // Δf/Δt = (P_supply - P_demand) / (2 * H * S_base) * f_nominal
  // Per simulation tick (dt = 1 game-second):
  const H = 5; // inertia constant (seconds)
  const S_base = 500; // MW, game scale
  const f_nom = 50; // Hz
  const imbalance = totalSupply - demand; // MW
  const df = (imbalance / (2 * H * S_base)) * f_nom * dt;
  frequency = Math.max(47, Math.min(52, frequency + df));
  // Also add small damping: frequency drifts toward 50 Hz by load self-regulation
  // (real grids have ~1-2% load sensitivity to frequency)
  frequency += (50 - frequency) * 0.02 * dt;
  ```
  This gives realistic behavior: a 100 MW imbalance on a 500 MW system causes ~1 Hz/s rate of change, which feels right for the game. Larger imbalances = faster frequency swings.
- **Scoring:** Count seconds where 49.8 ≤ f ≤ 50.2. Display as "Time in green band: XX%"
- **Controls:** Play/pause, speed selector (1x, 2x, 4x), reset
- **Visual:** Frequency gauge color (green/amber/red/black), asset output bars, demand bar, battery energy level, time-of-day indicator
- Wrap in `FullscreenWrapper`

- [ ] **Step 2: Create StorageScaleVisualizer.tsx**

- Shows "European Grid" demand: 300 GW average (big number, styled prominently)
- Battery icon representing Moss Landing: 3 GWh capacity
- Slider: "Duration to power" — computes how many seconds/minutes the battery covers (3 GWh / 300 GW = 0.01 hours = 36 seconds)
- "Stack" button: adds more Moss Landings. Shows count needed for 1 min, 1 hour, 1 day
- Comparison mode: toggle to pumped hydro (total global: ~9,000 GWh) — covers ~30 hours
- Closing callout: "This is why VPPs matter" with link to Learn: The Virtual Power Plant
- Wrap in `FullscreenWrapper`

- [ ] **Step 3: Wire into page + visual validation**

- [ ] **Step 4: Commit**

```bash
git add website/src/components/basics/labs/GridOperatorGame.tsx website/src/components/basics/labs/StorageScaleVisualizer.tsx website/src/pages/basics/supply-and-demand.astro
git commit -m "Add Page 2 labs: Grid Operator Game (MVP) and Storage Scale Visualizer"
```

---

## Task 9: Page 3 — How Batteries Work (page shell + briefings)

**Files:**
- Create: `website/src/pages/basics/how-batteries-work.astro`
- Create: `website/src/components/basics/briefings/BatteryHistoryBriefing.tsx`
- Create: `website/src/components/basics/briefings/InsideTheCellBriefing.tsx`
- Create: `website/src/components/basics/briefings/PriceCrashBriefing.tsx`

- [ ] **Step 1: Create the page shell**

Sections: history, inside-the-cell, price-crash, chemistry-workbench (placeholder), lifecycle (placeholder), whats-next (placeholder). "Continue to" → beyond-lithium-ion. "Go deeper" → Research: Electricity Pricing.

- [ ] **Step 2: Create BatteryHistoryBriefing.tsx**

Uses `ScrollBriefing`. Horizontal timeline that advances with scroll progress:
- 12 milestones from 1800 (Volta) to 2024+ (grid-scale era). See spec for full list.
- At each milestone: year label, event description, and a visual of the battery evolving (getting smaller, showing price tag dropping)
- Timeline progress maps to scroll progress 0.0-1.0

- [ ] **Step 3: Create InsideTheCellBriefing.tsx**

Uses `ScrollBriefing`. Cell cross-section animation:
- Progress 0.0-0.15: Static cell diagram — anode (left, graphite gray), cathode (right, blue/purple metal oxide), electrolyte (center, translucent), external circuit (top)
- Progress 0.15-0.5: Charging — lithium ions (small cyan dots) migrate from cathode → electrolyte → anode. Electrons flow through external circuit. Anode graphite layers fill with ions.
- Progress 0.5-0.85: Discharging — reverse flow. Lightbulb on external circuit glows.
- Progress 0.85-1.0: Ion size comparison (Li vs Na vs K) + "lightest metal, highest potential" callout

- [ ] **Step 4: Create PriceCrashBriefing.tsx**

Uses `ScrollBriefing`. Cost curve:
- Canvas draws X-axis (2010-2030) and Y-axis ($/kWh)
- Progress drives the "current year" rightward, drawing the cost line as it goes
- At each milestone year, a "use case unlocked" badge animates in (see spec for milestones)
- After 2024, line becomes dashed (projections)
- Annotations appear for why costs fell: gigafactories, chemistry improvements, competition
- Final stat: "89% reduction in 13 years"

- [ ] **Step 5: Build + visual validation**

- [ ] **Step 6: Commit**

```bash
git add website/src/pages/basics/how-batteries-work.astro website/src/components/basics/briefings/BatteryHistoryBriefing.tsx website/src/components/basics/briefings/InsideTheCellBriefing.tsx website/src/components/basics/briefings/PriceCrashBriefing.tsx
git commit -m "Add Page 3: How Batteries Work with 3 scroll-driven briefings"
```

---

## Task 10: Page 3 Labs — Chemistry Workbench + Lifecycle Simulator + Upcoming Tech

**Files:**
- Create: `website/src/components/basics/labs/BatteryChemistryWorkbench.tsx`
- Create: `website/src/components/basics/labs/BatteryLifecycleSimulator.tsx`
- Create: `website/src/components/basics/labs/UpcomingBatteryTech.tsx`
- Modify: `website/src/pages/basics/how-batteries-work.astro` — wire in labs

- [ ] **Step 1: Create BatteryChemistryWorkbench.tsx**

- 4 chemistry selector buttons (LFP, NMC, NCA, LTO) styled as tabs
- Canvas radar chart with 6 axes (energy density, cycle life, safety, cost, charge speed, temp tolerance)
- Data for each chemistry hardcoded (see spec for values)
- Cell cross-section (smaller, below radar) updates cathode color per chemistry
- Use case callout text below
- Compare mode: click two chemistries to overlay radar shapes with transparency
- Radar chart rendering: Canvas 2D polar coordinates. For each axis, calculate point at (center + value * radius * cos(angle), center + value * radius * sin(angle)). Fill polygon with semi-transparent color.
- Wrap in `FullscreenWrapper`

- [ ] **Step 2: Create BatteryLifecycleSimulator.tsx**

- 4 sliders: daily cycles (0.5-3), depth of discharge (20-100%), charge rate (0.5C/1C/2C/3C as buttons), ambient temp (0-45°C)
- Play button starts simulation. Canvas draws SoH% vs Years line chart in real-time.
- Degradation model (simplified): `SoH = 100 * exp(-k * cycles)` where k depends on DoD, C-rate, and temperature. Higher DoD/C-rate/temp = faster degradation.
- Heat indicator: a thermometer icon that glows warmer colors as C-rate and temp increase
- "End of life" horizontal line at 80% SoH
- 4 preset buttons (see spec for scenarios)
- Wrap in `FullscreenWrapper`

- [ ] **Step 3: Create UpcomingBatteryTech.tsx**

- Card grid (2x2 or responsive) for 4 technologies: solid-state, sodium-ion, silicon anodes, lithium-sulfur
- Each card: name, one-line description, maturity progress bar (segmented: Research | Prototype | Pilot | Commercial), "Expected by" date, key advantage, key challenge, key players
- Click to expand: shows a simplified cell cross-section diff vs standard Li-ion (what changes)
- All DOM-based (React + Tailwind), no canvas needed for this component

- [ ] **Step 4: Wire into page + visual validation**

- [ ] **Step 5: Commit**

```bash
git add website/src/components/basics/labs/BatteryChemistryWorkbench.tsx website/src/components/basics/labs/BatteryLifecycleSimulator.tsx website/src/components/basics/labs/UpcomingBatteryTech.tsx website/src/pages/basics/how-batteries-work.astro
git commit -m "Add Page 3 labs: Chemistry Workbench, Lifecycle Simulator, Upcoming Tech"
```

---

## Task 11: Page 4 — Beyond Lithium-Ion (page shell + briefings)

**Files:**
- Create: `website/src/pages/basics/beyond-lithium-ion.astro`
- Create: `website/src/components/basics/briefings/DurationProblemBriefing.tsx`
- Create: `website/src/components/basics/briefings/StorageZooBriefing.tsx`

- [ ] **Step 1: Create the page shell**

Sections: duration-problem, storage-zoo, scenario-builder (placeholder), comparison-tool (placeholder). No "Continue to" (last page). "Go deeper" → Research: Grid Flexibility Costs, Demand Response.

- [ ] **Step 2: Create DurationProblemBriefing.tsx**

Uses `ScrollBriefing`. Cost-vs-duration chart:
- X-axis: discharge duration (log scale: seconds → seasons)
- Y-axis: $/kWh
- Progress 0.0-0.3: Li-ion curve appears — cheap for short duration, curves up past 4 hours
- Progress 0.3-1.0: Other technologies appear one by one at their optimal ranges (flywheels → Li-ion → flow → CAES → pumped hydro → gravity → thermal → hydrogen)
- Each technology: colored band showing its optimal range on the x-axis
- Final state: full portfolio view with "No single technology covers the full spectrum"

- [ ] **Step 3: Create StorageZooBriefing.tsx**

Uses `ScrollBriefing`. This is the longest briefing — 7 technologies.
- Divide scroll progress into 7 segments (~0.14 each)
- Each segment: animated cutaway diagram of the technology + key stats + verdict text
- Technologies: flow batteries, pumped hydro, CAES, gravity, thermal, hydrogen, flywheels (see spec for animation descriptions and stats)
- Between segments: smooth transitions (fade out previous, fade in next)
- Consider using a taller scroll height (350-400vh) given the 7 sections

- [ ] **Step 4: Build + visual validation**

- [ ] **Step 5: Commit**

```bash
git add website/src/pages/basics/beyond-lithium-ion.astro website/src/components/basics/briefings/DurationProblemBriefing.tsx website/src/components/basics/briefings/StorageZooBriefing.tsx
git commit -m "Add Page 4: Beyond Lithium-Ion with 2 scroll-driven briefings"
```

---

## Task 12: Page 4 Labs — Scenario Builder + Comparison Tool

**Files:**
- Create: `website/src/components/basics/labs/StorageScenarioBuilder.tsx`
- Create: `website/src/components/basics/labs/StorageComparisonTool.tsx`
- Modify: `website/src/pages/basics/beyond-lithium-ion.astro` — wire in labs

- [ ] **Step 1: Create StorageScenarioBuilder.tsx**

- 5 scenario buttons: Frequency response, Daily peak shaving, Evening ramp, Week-long dunkelflaute, Seasonal balancing
- Selecting a scenario shows:
  - Technologies ranked best-fit → poor-fit with color coding (green/amber/red)
  - For each technology: one-line explanation of why it fits or doesn't
  - Comparison table: response time, discharge duration, round-trip efficiency, $/kWh, land use, cycle life
- All data hardcoded. Technologies scored per scenario based on their specs vs requirements.
- Wrap in `FullscreenWrapper`

- [ ] **Step 2: Create StorageComparisonTool.tsx**

- Technology selector: 8 checkboxes (Li-ion, flow, pumped hydro, CAES, gravity, thermal, hydrogen, flywheel). Max 3 selected.
- Canvas radar chart with 8 axes (see spec for dimensions)
- Selected technologies rendered as overlaid polygons with distinct colors and transparency
- Toggle: "Today" vs "2030 Projected" — switches dataset (projected values represent expected improvements)
- Legend showing selected technologies with their colors
- Radar chart math: same approach as BatteryChemistryWorkbench but with 8 axes
- Wrap in `FullscreenWrapper`

- [ ] **Step 3: Wire into page + visual validation**

- [ ] **Step 4: Commit**

```bash
git add website/src/components/basics/labs/StorageScenarioBuilder.tsx website/src/components/basics/labs/StorageComparisonTool.tsx website/src/pages/basics/beyond-lithium-ion.astro
git commit -m "Add Page 4 labs: Storage Scenario Builder and Comparison Tool"
```

---

## Task 13: Cross-linking + Final Build Verification

**Files:**
- Modify: `website/src/pages/learn/how-the-grid-works.astro` — add basics cross-links
- Modify: `website/src/pages/learn/the-virtual-power-plant.astro` — add battery basics cross-link

- [ ] **Step 1: Add cross-links in Learn pages**

In `how-the-grid-works.astro`, add a callout box near the top of the page (after the `<h1>`). Use the `url()` helper for all hrefs:

```astro
<div class="p-4 rounded-lg mb-8" style="background: var(--color-surface); border: 1px solid var(--color-surface-light);">
  <div class="font-mono text-xs mb-1" style="color: var(--color-primary); letter-spacing: 0.08em; text-transform: uppercase;">
    New to electricity?
  </div>
  <div class="text-sm" style="color: var(--color-text-muted);">
    Start with <a href={url("/basics/how-electricity-works")} style="color: var(--color-primary);">How Electricity Works</a> and
    <a href={url("/basics/supply-and-demand")} style="color: var(--color-primary);">Supply & Demand</a> for the foundations.
  </div>
</div>
```

In `the-virtual-power-plant.astro`, add a similar callout near the battery content:

```astro
<div class="p-4 rounded-lg mb-8" style="background: var(--color-surface); border: 1px solid var(--color-surface-light);">
  <div class="font-mono text-xs mb-1" style="color: var(--color-primary); letter-spacing: 0.08em; text-transform: uppercase;">
    New to battery technology?
  </div>
  <div class="text-sm" style="color: var(--color-text-muted);">
    <a href={url("/basics/how-batteries-work")} style="color: var(--color-primary);">Start here</a> for the foundations of how batteries work, their history, and emerging alternatives.
  </div>
</div>
```

- [ ] **Step 2: Run full build + tests**

Run: `cd /home/mario/code/kubekon/kubecon-2026-vpp/website && npm run build && npm test`

Expected: All 5 basics pages generated, all build checks pass, no TypeScript errors.

- [ ] **Step 3: Visual spot-check all pages**

Use Playwright MCP to navigate through all 5 basics pages (hub + 4 content pages). Take a screenshot of each. Verify:
- Navigation shows "Basics" link
- Sidebar shows Basics section with correct pages
- Each page has hero, briefing sections, lab sections, and next-mission link
- Interactive components render
- Dark mode looks correct

- [ ] **Step 4: Commit**

```bash
git add website/src/pages/learn/how-the-grid-works.astro website/src/pages/learn/the-virtual-power-plant.astro
git commit -m "Add cross-links from Learn to Basics section"
```

---

## Summary

| Task | Description | Components |
|------|-------------|------------|
| 1 | Canvas theme utility | 1 file |
| 2 | ScrollBriefing wrapper | 1 file |
| 3 | Navigation (header + sidebar + build checks) | 3 files modified |
| 4 | Basics hub page | 1 page |
| 5 | Page 1 briefings | 1 page + 3 briefings |
| 6 | Page 1 labs | 2 labs |
| 7 | Page 2 briefings | 1 page + 3 briefings |
| 8 | Page 2 labs | 2 labs (incl. Grid Operator Game MVP) |
| 9 | Page 3 briefings | 1 page + 3 briefings |
| 10 | Page 3 labs | 3 labs |
| 11 | Page 4 briefings | 1 page + 2 briefings |
| 12 | Page 4 labs | 2 labs |
| 13 | Cross-linking + final verification | 1 file modified |

**Total: 5 pages, 12 briefing components, 9 lab components, 1 shared utility, 1 shared wrapper, 4 files modified = 28 new files + 4 modified files**
