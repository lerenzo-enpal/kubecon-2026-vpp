# Responsive & Font Size Audit Design

**Date:** 2026-03-22
**Status:** Approved

## Problem

1. Canvas-based visualizations render text at 8-11px, making them hard to read
2. The website is desktop-first with no mobile strategy for complex visualizations (canvas charts, maps, interactive labs)
3. Minimum readable font size should be `text-xs` (12px) across all content

## Design

### 1. Font Size Audit

**Rule:** No rendered text below 12px anywhere on the site.

**Canvas components requiring fixes:**

| Component | Current min font | File |
|-----------|-----------------|------|
| FrequencyWalkthrough | 8px | `website/src/components/FrequencyWalkthrough.tsx` |
| GridFlowDemo | 8px | `website/src/components/GridFlowDemo.tsx` |
| BerlinArbitrageExhibit | 8px | `website/src/components/BerlinArbitrageExhibit.tsx` |
| CascadeMap | 9px | `website/src/components/CascadeMap.tsx` |
| TexasCascadeMap | 9px | `website/src/components/TexasCascadeMap.tsx` |

**Strategy:** Edit each component's drawing code to bump any `fontSize` below 12 to 12px minimum. Adjust label positioning/padding as needed to accommodate slightly larger text.

**CSS fixes in `global.css`:**
- `.maplibregl-ctrl-attrib` from 9px to 12px
- `.fs-launch-btn` from 11px to 12px

### 2. MobileVizFallback Wrapper Component

New component: `website/src/components/MobileVizFallback.tsx`

**Props:**
- `children: ReactNode` — the live visualization
- `fallbackSrc: string` — path to static screenshot image
- `alt: string` — accessibility description
- `breakpoint?: number` — default 768 (md breakpoint)

**Behavior:**
- **Above breakpoint:** Renders `children` directly (no change to desktop)
- **Below breakpoint:** Shows `fallbackSrc` image in a styled container with a "View Interactive" button
- **Button tap:** Opens fullscreen overlay (`position: fixed; inset: 0; z-index: 50`) with the live `children`, plus a close button
- Uses `window.matchMedia` for breakpoint detection
- Suggests landscape orientation if in portrait mode
- Applies `overflow: hidden` on `<body>` when overlay is open to prevent background scrolling (scroll lock)

### 3. Screenshot Capture

**Location:** `website/public/images/viz/` (served as `/images/viz/`)
**Format:** WebP
**Method:** Playwright MCP tools at 1280px desktop width

**Components needing screenshots (~20):**
- Canvas charts: FrequencyWalkthrough, GridFlowDemo, DuckCurveExplorer, DuckCurveVPP, RenewableGrowthChart, CurtailmentChart, BerlinArbitrageExhibit
- Maps: TexasGridMap, SAGridMap, EuropeGridMap, ItalyGridMap, IberianGridMap, BerlinGridMap
- Cascade maps: TexasCascadeMap, BerlinCascadeMap, SACascadeMap, HornsdaleCascadeMap
- Interactive labs: GridOperatorGame, BatteryLifecycleSimulator, StorageScaleVisualizer, BatteryChemistryWorkbench, StorageComparisonTool, StorageScenarioBuilder

SVG illustrations (House, SolarHome, etc.) scale naturally and don't need fallbacks.

### 4. General Responsive

No changes needed for:
- Tables (already have `overflow-x: auto`)
- Prose content (already responsive)
- Header/nav (already responsive)
- Sidebar TOC (already hidden on mobile via `hidden lg:block`)

### 5. Fallback Plan

If Approach A (MobileVizFallback wrapper) causes issues with specific components (hydration, bundle size, fullscreen rendering), fall back to Approach B for those specific components: CSS-only conditional rendering using `<div class="hidden md:block">` for the live viz and `<div class="md:hidden">` for the static image fallback, applied directly in the page markup.

## Implementation Order

1. Create `MobileVizFallback` component
2. Fix font sizes in canvas components (8-11px -> 12px minimum)
3. Fix font sizes in global.css
4. Capture screenshots for all visualizations
5. Wrap each visualization in its page with `MobileVizFallback`
6. Test on mobile viewport sizes
