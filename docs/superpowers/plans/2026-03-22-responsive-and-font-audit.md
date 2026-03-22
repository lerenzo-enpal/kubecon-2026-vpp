# Responsive & Font Size Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enforce a 12px minimum font size across all website content (including canvas text), and add mobile-friendly fallbacks for complex visualizations.

**Architecture:** Create a `MobileVizFallback` wrapper that shows a static screenshot on mobile with a button to launch the live visualization fullscreen. Fix all canvas/SVG inline font sizes below 12px. Extend the existing `FullscreenWrapper` pattern.

**Tech Stack:** React 18, Astro 6, TailwindCSS v4, Canvas API, Playwright (for screenshots)

**Spec:** `docs/superpowers/specs/2026-03-22-responsive-and-font-audit-design.md`

---

### Task 1: Fix CascadeMap fullscreen black screen bug

**Files:**
- Modify: `website/src/components/CascadeMap.tsx:582` (ready check)
- Modify: `website/src/components/CascadeMap.tsx:301-307` (fullscreen listener)

**NOTE: These changes have already been applied in this session. This task is included for completeness and to verify.**

- [ ] **Step 1: Verify the fix is in place**

Check that line 582 reads:
```tsx
const ready = widthProp || measuredWidth > 0 || isFullscreen;
```

And that the fullscreen listener (around line 301) re-measures width:
```tsx
const fn = () => {
  setIsFullscreen(!!document.fullscreenElement);
  const el = sizeRef.current;
  if (el && el.clientWidth > 0) setMeasuredWidth(el.clientWidth);
};
```

- [ ] **Step 2: Test in browser**

Navigate to `http://localhost:4321/research/incidents/2026-berlin-teltow-canal-arson/`, click the fullscreen Launch button on the cascade map, then click "Begin Cascade" or similar event trigger. The map should render (not black screen).

- [ ] **Step 3: Commit**

```bash
git add website/src/components/CascadeMap.tsx
git commit -m "Fix cascade map black screen when entering fullscreen"
```

---

### Task 2: Fix font sizes in FullscreenWrapper and global.css

**Files:**
- Modify: `website/src/components/FullscreenWrapper.tsx:69` (exit button fontSize 11 -> 12)
- Modify: `website/src/styles/global.css:215` (.maplibregl-ctrl-attrib 9px -> 12px)
- Modify: `website/src/styles/global.css:242` (.fs-launch-btn 11px -> 12px)

- [ ] **Step 1: Fix FullscreenWrapper exit button font size**

In `website/src/components/FullscreenWrapper.tsx`, change line 69:
```tsx
// Before:
fontSize: 11,
// After:
fontSize: 12,
```

- [ ] **Step 2: Fix global.css .maplibregl-ctrl-attrib**

In `website/src/styles/global.css`, at line 215 change:
```css
/* Before: */
.maplibregl-ctrl-attrib { font-size: 9px !important; }
/* After: */
.maplibregl-ctrl-attrib { font-size: 12px !important; }
```

- [ ] **Step 3: Fix global.css .fs-launch-btn**

In `website/src/styles/global.css`, at line 242 change:
```css
/* Before: */
font-size: 11px;
/* After: */
font-size: 12px;
```

- [ ] **Step 4: Commit**

```bash
git add website/src/components/FullscreenWrapper.tsx website/src/styles/global.css
git commit -m "Enforce 12px minimum font size in FullscreenWrapper and global CSS"
```

---

### Task 3: Fix font sizes in main visualization components

**Files (fontSize < 12 occurrences):**
- Modify: `website/src/components/FrequencyWalkthrough.tsx` (8, 9, 10, 11px)
- Modify: `website/src/components/GridFlowDemo.tsx` (8px)
- Modify: `website/src/components/BerlinArbitrageExhibit.tsx` (8, 9, 10, 11px)
- Modify: `website/src/components/DuckCurveExplorer.tsx` (8, 9, 11px at lines 213, 234, 279, 326, 406, 409, 421, 452, 489, 495)
- Modify: `website/src/components/DuckCurveVPP.tsx` (9, 10px at lines 143, 151, 273)
- Modify: `website/src/components/RenewableGrowthChart.tsx` (10, 11px at lines 79, 125, 132)
- Modify: `website/src/components/CurtailmentChart.tsx` (9, 10, 11px at lines 103, 121, 132, 181, 219, 225, 285, 295, 307, 316)
- Modify: `website/src/components/FrequencyDemo.tsx` (9, 10, 11px at lines 621, 638, 707, 804, 837)
- Modify: `website/src/components/CascadeMap.tsx` (9, 10, 11px — all cascade map variants use this base component)

**Strategy:** In each file, find every `fontSize` value below 12 and set it to 12. These are canvas/SVG rendered text — CSS cannot override them.

**Note:** `StorageScenarioBuilder.tsx` was checked and has no fontSize values below 12 — no changes needed.

- [ ] **Step 1: Fix FrequencyWalkthrough.tsx**

Search for all `fontSize` values below 12 and change to 12. Expected locations include axis labels, timestamps, annotations, and system log text.

- [ ] **Step 2: Fix GridFlowDemo.tsx**

Change fontSize: 8 (grid node labels) to 12.

- [ ] **Step 3: Fix BerlinArbitrageExhibit.tsx**

Change all fontSize values of 8, 9, 10, 11 to 12.

- [ ] **Step 4: Fix DuckCurveExplorer.tsx**

Change fontSize values at lines ~213, 234, 279, 326, 406, 409, 421, 452, 489, 495 from 8/9/11 to 12.

- [ ] **Step 5: Fix DuckCurveVPP.tsx**

Change fontSize values at lines ~143, 151, 273 from 9/10 to 12.

- [ ] **Step 6: Fix RenewableGrowthChart.tsx**

Change fontSize values at lines ~79, 125, 132 from 10/11 to 12.

- [ ] **Step 7: Fix CurtailmentChart.tsx**

Change fontSize values at lines ~103, 121, 132, 181, 219, 225, 285, 295, 307, 316 from 9/10/11 to 12.

- [ ] **Step 8: Fix FrequencyDemo.tsx**

Change fontSize values at lines ~621, 638, 707, 804, 837 from 9/10/11 to 12.

- [ ] **Step 9: Fix CascadeMap.tsx**

Change all fontSize values below 12 to 12. This is the base component used by all 12 incident cascade maps (BerlinCascadeMap, TexasCascadeMap, SACascadeMap, HornsdaleCascadeMap, etc.), so this single fix covers all of them.

- [ ] **Step 10: Visually spot-check one or two charts in browser**

Navigate to `http://localhost:4321/learn/the-renewable-revolution/` and verify duck curve chart labels are legible. Check `http://localhost:4321/learn/how-the-grid-works/` for frequency charts.

- [ ] **Step 11: Commit**

```bash
git add website/src/components/FrequencyWalkthrough.tsx website/src/components/GridFlowDemo.tsx website/src/components/BerlinArbitrageExhibit.tsx website/src/components/DuckCurveExplorer.tsx website/src/components/DuckCurveVPP.tsx website/src/components/RenewableGrowthChart.tsx website/src/components/CurtailmentChart.tsx website/src/components/FrequencyDemo.tsx website/src/components/CascadeMap.tsx
git commit -m "Enforce 12px minimum font size in main visualization components"
```

---

### Task 4: Fix font sizes in map components

**Files:**
- Modify: `website/src/components/TexasGridMap.tsx` (10px at line 177)
- Modify: `website/src/components/SAGridMap.tsx` (8, 9px at lines 210, 284, 292, 301)
- Modify: `website/src/components/ItalyGridMap.tsx` (8, 9, 11px at lines 175, 267, 280)
- Modify: `website/src/components/EuropeGridMap.tsx` (8, 9, 10px at lines 180, 237, 286, 308)
- Modify: `website/src/components/IberianGridMap.tsx` (8, 9, 11px at lines 152, 274, 288)
- Modify: `website/src/components/BerlinGridMap.tsx` (8, 9px at lines 210, 264, 299, 313)
- Modify: `website/src/components/TexasCascadeMap.tsx` (9, 11px — check all fontSize < 12)

- [ ] **Step 1: Fix TexasGridMap.tsx** — line ~177: 10 -> 12
- [ ] **Step 2: Fix SAGridMap.tsx** — lines ~210, 284, 292, 301: all to 12
- [ ] **Step 3: Fix ItalyGridMap.tsx** — lines ~175, 267, 280: all to 12
- [ ] **Step 4: Fix EuropeGridMap.tsx** — lines ~180, 237, 286, 308: all to 12
- [ ] **Step 5: Fix IberianGridMap.tsx** — lines ~152, 274, 288: all to 12
- [ ] **Step 6: Fix BerlinGridMap.tsx** — lines ~210, 264, 299, 313: all to 12
- [ ] **Step 7: Fix TexasCascadeMap.tsx** — all fontSize < 12 to 12

- [ ] **Step 8: Commit**

```bash
git add website/src/components/TexasGridMap.tsx website/src/components/SAGridMap.tsx website/src/components/ItalyGridMap.tsx website/src/components/EuropeGridMap.tsx website/src/components/IberianGridMap.tsx website/src/components/BerlinGridMap.tsx website/src/components/TexasCascadeMap.tsx
git commit -m "Enforce 12px minimum font size in map components"
```

---

### Task 5: Fix font sizes in inline and lab components

**Files (basics/inline/):**
- Modify: `website/src/components/basics/inline/ACvsDCWaveform.tsx` (10px at line 79)
- Modify: `website/src/components/basics/inline/GenerationMethods.tsx` (9, 10px at lines 247, 261)
- Modify: `website/src/components/basics/inline/OhmsLawPlayground.tsx` (11px at line 133)
- Modify: `website/src/components/basics/inline/TransformerDiagram.tsx` (11px at line 180)
- Modify: `website/src/components/basics/inline/WaterPipeIllustration.tsx` (11px at lines 122, 199)
- Modify: `website/src/components/basics/inline/BufferComparison.tsx` (11px at line 323)
- Modify: `website/src/components/basics/inline/FrequencyGauge.tsx` (11px at line 107)
- Modify: `website/src/components/basics/inline/RotorFrequency.tsx` (10, 11px at lines 101, 235, 257)
- Modify: `website/src/components/basics/inline/CellCrossSectionWidget.tsx` (9, 10, 11px at lines 125, 154, 166, 209)
- Modify: `website/src/components/basics/inline/DurationSpectrumChart.tsx` (11px at lines 58, 115)
- Modify: `website/src/components/basics/inline/CostCurveChart.tsx` (9, 10, 11px at lines 148, 159, 177, 231, 277, 292, 313)

**Files (basics/labs/):**
- Modify: `website/src/components/basics/labs/PowerEnergyCalculator.tsx` (10, 11px at lines 97, 172)
- Modify: `website/src/components/basics/labs/StorageComparisonTool.tsx` (9px at line 112)
- Modify: `website/src/components/basics/labs/BatteryChemistryWorkbench.tsx` (10px at line 98)
- Modify: `website/src/components/basics/labs/BatteryLifecycleSimulator.tsx` (9, 10, 11px at lines 90, 107, 122, 156, 187, 196)
- Modify: `website/src/components/basics/labs/GridOperatorGame.tsx` (9, 10, 11px at lines 227, 280, 316, 322, 332, 342, 355, 369)
- Modify: `website/src/components/basics/labs/StorageScaleVisualizer.tsx` (9, 10px at lines 143, 150, 163, 192, 202)

- [ ] **Step 1: Fix all inline components** — change every fontSize below 12 to 12 in all files listed above under basics/inline/
- [ ] **Step 2: Fix all lab components** — change every fontSize below 12 to 12 in all files listed above under basics/labs/
- [ ] **Step 3: Spot-check in browser** — navigate to `http://localhost:4321/basics/how-batteries-work/` and verify chart labels are legible
- [ ] **Step 4: Commit**

```bash
git add website/src/components/basics/inline/ website/src/components/basics/labs/
git commit -m "Enforce 12px minimum font size in inline and lab components"
```

---

### Task 6: Create MobileVizFallback component

**Files:**
- Create: `website/src/components/MobileVizFallback.tsx`

- [ ] **Step 1: Create the component**

```tsx
import { useRef, useState, useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackSrc: string;
  alt: string;
  breakpoint?: number;
}

export default function MobileVizFallback({
  children,
  fallbackSrc,
  alt,
  breakpoint = 768,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  useEffect(() => {
    if (showLive) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showLive]);

  // CSS handles initial render: mobile sees fallback image, desktop sees children.
  // After hydration, JS takes over for the fullscreen overlay interaction.

  return (
    <>
      {/* Desktop: always show live viz. Hidden on mobile via CSS to prevent flash. */}
      <div className={isMobile ? 'hidden' : 'block'}>
        {children}
      </div>

      {/* Mobile: show fallback image with "View Interactive" button */}
      {isMobile && (
        <div className="relative rounded-lg overflow-hidden border border-zinc-700/50">
          <img
            src={fallbackSrc}
            alt={alt}
            className="w-full h-auto"
            loading="lazy"
          />
          <button
            onClick={() => setShowLive(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors active:bg-black/60"
          >
            <span className="bg-zinc-900/90 border border-zinc-600 text-zinc-200 text-sm font-mono px-4 py-2 rounded flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" />
              </svg>
              View Interactive
            </span>
          </button>
        </div>
      )}

      {showLive && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-[#020408] flex flex-col"
        >
          <div className="flex justify-between items-center px-3 py-2 border-b border-zinc-800">
            <span className="text-zinc-500 text-xs font-mono">
              Rotate device for best experience
            </span>
            <button
              onClick={() => setShowLive(false)}
              className="text-zinc-400 text-sm font-mono border border-zinc-700 rounded px-3 py-1 active:bg-zinc-800"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Verify it builds**

Run: `cd website && npx astro build 2>&1 | tail -5`

- [ ] **Step 3: Commit**

```bash
git add website/src/components/MobileVizFallback.tsx
git commit -m "Add MobileVizFallback wrapper for mobile visualization fallbacks"
```

---

### Task 7: Capture visualization screenshots

**Files:**
- Create: `website/public/images/viz/*.webp` (one per visualization)

**Method:** Use Playwright MCP tools to navigate to each page at 1280px width, screenshot each visualization, save as WebP to `website/public/images/viz/`.

- [ ] **Step 1: Create the images/viz directory**

```bash
mkdir -p website/public/images/viz
```

- [ ] **Step 2: Capture screenshots for learn page visualizations**

Using Playwright MCP tools at 1280px viewport:
- `http://localhost:4321/learn/how-the-grid-works/` -> frequency-walkthrough.webp, grid-flow-demo.webp, frequency-demo.webp
- `http://localhost:4321/learn/the-renewable-revolution/` -> duck-curve-explorer.webp, renewable-growth-chart.webp, curtailment-chart.webp
- `http://localhost:4321/learn/the-virtual-power-plant/` -> duck-curve-vpp.webp

- [ ] **Step 3: Capture screenshots for basics page visualizations**

- `http://localhost:4321/basics/how-electricity-works/` -> relevant inline components
- `http://localhost:4321/basics/supply-and-demand/` -> grid-operator-game.webp, storage-scale-visualizer.webp, buffer-comparison.webp
- `http://localhost:4321/basics/how-batteries-work/` -> battery-lifecycle-simulator.webp, battery-chemistry-workbench.webp, cost-curve-chart.webp
- `http://localhost:4321/basics/beyond-lithium-ion/` -> storage-comparison-tool.webp, storage-scenario-builder.webp

- [ ] **Step 4: Capture screenshots for incident map visualizations**

One screenshot per incident page in `website/src/pages/research/incidents/` (12 total):
- 2026-berlin-teltow-cascade.webp
- 2025-berlin-johannisthal-cascade.webp
- 2025-iberian-peninsula-cascade.webp
- 2024-dunkelflaute-cascade.webp
- 2021-texas-ercot-cascade.webp
- 2021-european-grid-split-cascade.webp
- 2017-south-australia-heatwave-cascade.webp
- 2017-hornsdale-cascade.webp
- 2016-south-australia-cascade.webp
- 2006-european-grid-split-cascade.webp
- 2003-northeast-us-cascade.webp
- 2003-italy-cascade.webp

- [ ] **Step 5: Commit**

```bash
git add website/public/images/viz/
git commit -m "Add visualization screenshots for mobile fallbacks"
```

---

### Task 8: Wrap visualizations with MobileVizFallback in pages

**Files to modify (learn pages):**
- Modify: `website/src/pages/learn/how-the-grid-works.astro`
- Modify: `website/src/pages/learn/the-renewable-revolution.astro`
- Modify: `website/src/pages/learn/the-virtual-power-plant.astro`

**Files to modify (basics pages):**
- Modify: `website/src/pages/basics/how-electricity-works.astro`
- Modify: `website/src/pages/basics/supply-and-demand.astro`
- Modify: `website/src/pages/basics/how-batteries-work.astro`
- Modify: `website/src/pages/basics/beyond-lithium-ion.astro`

**Files to modify (incident pages — 12 total):**
- Modify: `website/src/pages/research/incidents/*.astro` (all 12)

**Pattern:** Add `import MobileVizFallback from '../../components/MobileVizFallback';` to each page, then wrap each canvas/map/lab component:

```astro
<MobileVizFallback client:visible fallbackSrc="/images/viz/duck-curve-explorer.webp" alt="Duck curve explorer showing renewable energy impact">
  <DuckCurveExplorer client:visible />
</MobileVizFallback>
```

Note: SVG illustrations (House, SolarHome, CoalPlant, etc.) scale naturally and do NOT need wrapping.

- [ ] **Step 1: Wrap learn page visualizations** (3 pages)
- [ ] **Step 2: Wrap basics page visualizations** (4 pages)
- [ ] **Step 3: Wrap incident page cascade maps** (12 pages)
- [ ] **Step 4: Verify build succeeds**

```bash
cd website && npx astro build 2>&1 | tail -5
```

- [ ] **Step 5: Commit**

```bash
git add website/src/pages/
git commit -m "Wrap visualizations with MobileVizFallback for mobile responsiveness"
```

---

### Task 9: Test on mobile viewport sizes

- [ ] **Step 1: Test at 375px width (iPhone SE)**

Using Playwright, resize to 375x812 and navigate through key pages. Verify:
- Visualizations show static image with "View Interactive" button
- Tapping button opens fullscreen overlay with live component
- Close button works
- No horizontal overflow or layout breakage

- [ ] **Step 2: Test at 768px width (iPad)**

Resize to 768x1024. At exactly 768px the live visualization should render (not the fallback).

- [ ] **Step 3: Test at 1280px width (desktop)**

Verify no regressions — everything should render identically to before.

- [ ] **Step 4: Run build check**

```bash
cd website && npm test
```

- [ ] **Step 5: Final commit if any fixes needed**

---

### Fallback: Approach B (CSS-only)

If `MobileVizFallback` causes issues with a specific component (hydration errors, layout problems in fullscreen overlay), replace the wrapper for that component with CSS-only conditional rendering:

```astro
<div class="hidden md:block">
  <DuckCurveExplorer client:visible />
</div>
<div class="md:hidden">
  <img src="/images/viz/duck-curve-explorer.webp" alt="Duck curve explorer" class="w-full rounded-lg" />
</div>
```

This is a per-component escape hatch, not a wholesale replacement.
