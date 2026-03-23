---
title: Three Features — Three-Phase Waveform, Sidebar Hover, Scroll-Linked Timeline
date: 2026-03-23
status: approved
---

# Three Features Design Spec

## 1. Three-Phase Waveform Visualization

### Placement
In `/website/src/pages/basics/how-electricity-works.astro`, within the "AC vs DC" section. Inserted after the paragraph ending "Transformers only work with alternating current." (line ~120) and before the DC comeback paragraph (line ~122).

### Content (Two Paragraphs)
**Paragraph 1**: The grid doesn't use a single AC wave — it uses three, each offset by 120 degrees. This delivers smoother, more constant power. A single phase dips to zero 100 times per second; three phases together never dip.

**Paragraph 2**: Your home gets one of the three phases. Factories and large buildings get all three, which is why their plugs look different. Three-phase power also creates rotating magnetic fields, which is how electric motors spin.

### New Component: `ThreePhaseWaveform.tsx`
- Location: `/website/src/components/basics/inline/ThreePhaseWaveform.tsx`
- Canvas-based animated component
- Three sine waves: L1 (cyan `#22d3ee`), L2 (amber `#f59e0b`), L3 (purple `#a78bfa`), offset 120 degrees
- Animated continuously like the existing `ACvsDCWaveform`
- Toggle button: "1 Phase" / "3 Phase"
  - Single phase: shows just L1
  - Three phase: shows all three waves plus a faint summed power curve (white/light) near top showing constant power
- Labels "L1", "L2", "L3" at wave peaks
- Bottom text: "Three phases = constant power delivery" (in 3-phase mode) or "Single phase dips to zero twice per cycle" (in 1-phase mode)
- Uses `getCanvasThemeColors` from shared canvasTheme for dark/light mode support
- Font: JetBrains Mono, 14-16px for labels (consistent with other visualizations)
- Wrapped in `MobileVizFallback` on the page

### TOC Update
Add `{ id: 'three-phase', title: 'Three-Phase Power' }` to the sections array in the page frontmatter, after the 'ac-vs-dc' entry.

### Files Changed
- `website/src/components/basics/inline/ThreePhaseWaveform.tsx` (new)
- `website/src/pages/basics/how-electricity-works.astro` (add content, import, TOC entry)
- `website/src/layouts/ContentLayout.astro` (add three-phase to basics sections)

---

## 2. Sidebar Hover Expansion

### Current Behavior
In `ContentLayout.astro`, sidebar sub-sections only appear for the currently active page. Users must navigate to a page first, then see its sub-sections.

### New Behavior
On hover over any section title (e.g., "How Electricity Works"), its sub-sections expand inline. Users can jump directly to any sub-section from anywhere in the site.

### Implementation
- Always render sub-section links in the DOM for all sections (currently conditionally rendered with `isActive`)
- Default state: hidden via `max-height: 0; overflow: hidden; opacity: 0`
- Hover reveal: `group-hover:max-h-96; group-hover:opacity-100` with CSS transition
- Active page's sub-sections remain permanently visible (current behavior preserved)
- Desktop only: uses `lg:group-hover:` prefix so mobile is unaffected
- Transition: `transition-all duration-200 ease-in-out` for smooth expand/collapse
- Applies to both Basics and Learn VPP expandable sections

### Files Changed
- `website/src/layouts/ContentLayout.astro` (restructure sub-section rendering)

---

## 3. Scroll-Linked Timeline (Desktop Only)

### Current Behavior
`BatteryTimeline.tsx` is a horizontally-scrollable container with `overflow-x: auto`. Users swipe or scroll horizontally to see all milestones.

### New Behavior (Desktop Only)
When the timeline enters the viewport:
1. The timeline "pins" to the viewport (sticky positioning)
2. Continued vertical scrolling translates the timeline horizontally
3. Once the full timeline width has been revealed, the pin releases and vertical scrolling resumes

On mobile/tablet: existing horizontal swipe behavior is preserved unchanged.

### New Component: `ScrollLinkedTimeline.tsx`
- Location: `/website/src/components/basics/inline/ScrollLinkedTimeline.tsx`
- Wraps `BatteryTimeline` with scroll-linking behavior
- Desktop detection via `window.matchMedia('(min-width: 1024px)')` (lg breakpoint)
- Implementation approach:
  - Outer container with height = `viewportHeight + timelineOverflowWidth` to create scroll space
  - Inner `position: sticky; top: 0` container holds the timeline
  - `scroll` event listener maps vertical scroll position within the container to `translateX` on the timeline
  - Timeline's `overflow-x` set to `hidden` in desktop mode (scroll is driven by vertical scroll, not horizontal)
  - On mobile: renders `BatteryTimeline` directly with no wrapper behavior
- Smooth transition: use `will-change: transform` for GPU acceleration

### Page Integration
In `website/src/pages/basics/how-batteries-work.astro`:
- Import `ScrollLinkedTimeline` instead of `BatteryTimeline`
- Replace `<BatteryTimeline client:visible />` with `<ScrollLinkedTimeline client:visible />`

### Files Changed
- `website/src/components/basics/inline/ScrollLinkedTimeline.tsx` (new)
- `website/src/pages/basics/how-batteries-work.astro` (swap component)

---

## Design Constraints
- No emoji in any component or content
- Dark mode default, light mode supported via `getCanvasThemeColors`
- Font: JetBrains Mono for canvas/data text, Inter for body
- Standard Tailwind classes only (no arbitrary values like `text-[13px]`)
- Canvas font sizes: 14px minimum for labels, 16px+ for titles
- Audience: ages 12+, plain language
