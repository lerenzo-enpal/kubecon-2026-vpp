# Website Style Guide

Adapted from the KubeCon 2026 VPP presentation style guide for use on the educational website. The presentation uses a dark "Hollywood spy HUD" aesthetic — the website retains the same color DNA but adapts it for readability, accessibility, and long-form content.

---

## Color Palette

### Core Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` | `#0a0e17` | Page background |
| `--bg-alt` | `#111827` | Card backgrounds, alternating sections |
| `--surface` | `#1a2236` | Elevated surfaces, code blocks |
| `--surface-light` | `#243049` | Borders, dividers, subtle backgrounds |

### Accent Colors

| Token | Hex | Name | Usage |
|-------|-----|------|-------|
| `--primary` | `#22d3ee` | Cyan | Links, interactive elements, grid/frequency |
| `--secondary` | `#a78bfa` | Purple | Callouts, secondary actions |
| `--accent` | `#f59e0b` | Amber | Warnings, solar energy, cost highlights |
| `--danger` | `#ef4444` | Red | Errors, blackouts, critical failures |
| `--success` | `#10b981` | Green | Battery, positive outcomes, VPP success |

### Semantic Aliases

| Alias | Maps to | Context |
|-------|---------|---------|
| `--grid` | `--primary` (cyan) | Grid frequency, transmission |
| `--battery` | `--success` (green) | Battery storage, charging |
| `--solar` | `--accent` (amber) | Solar generation |
| `--wind` | `--primary` (cyan) | Wind generation |
| `--cost` | `--danger` (red) | Costs, compensation, waste |

### Text Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--text` | `#f1f5f9` | Primary body text |
| `--text-muted` | `#94a3b8` | Secondary text, captions |
| `--text-dim` | `#64748b` | Tertiary text, metadata, timestamps |

### Light Mode Consideration

The presentation is dark-mode only. The website should support both modes for classroom use (projectors, bright rooms). Light mode mappings:

| Dark | Light |
|------|-------|
| `--bg: #0a0e17` | `--bg: #f8fafc` |
| `--surface: #1a2236` | `--surface: #ffffff` |
| `--text: #f1f5f9` | `--text: #0f172a` |
| `--text-muted: #94a3b8` | `--text-muted: #475569` |
| Accent colors | Same hues, slightly darker for contrast on white |

---

## Typography

### Font Stack

| Role | Font | Fallback |
|------|------|----------|
| Headings | Inter | system-ui, sans-serif |
| Body text | Inter | system-ui, sans-serif |
| Code, data, labels | JetBrains Mono | monospace |

### Scale

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Page title (h1) | 48px | 800 | 1.1 |
| Section heading (h2) | 32px | 700 | 1.2 |
| Subsection (h3) | 22px | 600 | 1.3 |
| Body text | 17px | 400 | 1.7 |
| Captions / metadata | 14px | 400 | 1.5 |
| Data labels (mono) | 13px | 600 | 1.4 |
| Small labels (mono) | 11px | 500 | 1.3 |

### Audience Adaptation

The presentation uses tight spacing and small fonts (optimized for a 1920x1080 projector at distance). The website needs:

- **Larger body text** (17px vs presentation's 14-16px)
- **More generous line height** (1.7 vs presentation's 1.4)
- **Wider paragraphs** (max-width 720px for readability)
- **More whitespace** between sections

---

## Components

### Cards

Used for incident summaries, concept explanations, and stat callouts.

```
Background: var(--bg-alt)
Border: 1px solid {accent-color}30
Border-radius: 12px
Padding: 24px
Shadow: 0 0 20px {accent-color}10 (subtle glow, dark mode only)
```

### Stat Boxes

Used for key numbers (e.g., "55 million people affected", "EUR 6.5B/yr").

```
Number: JetBrains Mono, 36px, weight 800, accent color
Label: Inter, 14px, weight 600, accent color at 80% opacity
Sublabel: Inter, 13px, text-muted
Glow: text-shadow 0 0 16px {color}30 (dark mode only)
```

### Interactive Elements

```
Buttons: bg-alt, 1px border primary, border-radius 8px, hover: bg primary/10
Sliders: track surface-light, thumb primary with glow
Toggles: surface-light inactive, primary active
Focus ring: 2px solid primary, offset 2px (accessibility)
```

### Code Blocks

```
Background: var(--surface)
Border: 1px solid var(--surface-light)
Border-radius: 8px
Font: JetBrains Mono, 14px
Padding: 16px 20px
```

---

## Animation Principles

Inherited from the presentation, adapted for web:

- **Trace-in borders**: Elements draw their border on scroll-enter (like the curtailment stat boxes)
- **Count-up numbers**: Stats animate from 0 to final value on first view
- **Fade + slide**: Content fades in with 12-16px upward slide, 0.4-0.6s duration
- **No autoplay**: Animations trigger on scroll intersection, not on page load
- **Reduced motion**: Respect `prefers-reduced-motion` — show final state immediately
- **No emoji**: Consistent with the presentation's cinematic tone

### Timing

```
Easing: cubic-bezier(0.4, 0, 0.2, 1)  (ease-out)
Duration: 0.3-0.6s for UI transitions
Stagger: 100-150ms between sequential elements
Scroll threshold: 20% visible before triggering
```

---

## Iconography

No icon library — use simple inline SVGs consistent with the presentation's line-art style:

- Stroke width: 1.5-2px
- Stroke color: current text color or accent
- No fills (outline only)
- Rounded line caps and joins

Energy-specific icons should follow the visual language established in the presentation:
- Battery: rounded rectangle with level indicator
- Solar: circle with radiating lines
- Wind: three-blade turbine
- EV: car silhouette with plug
- Heat pump: thermometer or wave
- Grid: tower/pylon outline

---

## Accessibility

- **WCAG 2.1 AA** minimum for all text/background combinations
- **4.5:1** contrast ratio for body text
- **3:1** contrast ratio for large text and UI components
- All interactive elements keyboard-navigable
- All images/diagrams have descriptive alt text
- Animations respect `prefers-reduced-motion`
- Focus indicators visible and high-contrast
- Screen reader landmarks for all sections

### Color Contrast Check

| Combination | Ratio | Pass? |
|-------------|-------|-------|
| `--text` on `--bg` | 15.4:1 | AA, AAA |
| `--text-muted` on `--bg` | 6.4:1 | AA |
| `--primary` on `--bg` | 10.2:1 | AA, AAA |
| `--accent` on `--bg` | 8.5:1 | AA, AAA |
| `--danger` on `--bg` | 5.8:1 | AA |
| `--text-dim` on `--bg` | 4.0:1 | AA (large text only) |

---

## Writing Style

### Tone
- Conversational but precise — like a knowledgeable friend explaining something cool
- No jargon without explanation on first use
- Short paragraphs (3-4 sentences max)
- Active voice
- Present tense for explanations, past tense for incidents

### Vocabulary Adaptations for Young Audiences

| Technical Term | Plain Language | Use Both? |
|----------------|---------------|-----------|
| Frequency | "the grid's heartbeat" | Yes — introduce metaphor, then use both |
| Curtailment | "throwing away clean energy" | Yes |
| Spinning reserves | "backup generators running just in case" | Yes |
| Capacity mechanisms | "paying power plants to wait on standby" | Avoid the technical term |
| Redispatch | "rerouting power" | Avoid the technical term |
| Ancillary services | Do not use | -- |
| VPP | "Virtual Power Plant — a network of homes working together" | Always define on first use per page |
| FCAS | Do not use — say "grid balancing payments" | -- |
| RoCoF | Do not use — say "how fast frequency is dropping" | -- |

### Numbers
- Spell out one through nine, use numerals for 10+
- Always include units with a space: "50 Hz", "10 TWh", "EUR 6.5 billion"
- Use "billion" not "B" in body text (abbreviations OK in stat boxes and data labels)
- Round to meaningful precision — "about 10 TWh" not "9.34 TWh" in body text

---

## Layout

### Page Width
- Content: max 720px (body text)
- Wide content (charts, maps, interactive): max 1100px
- Full-bleed sections for hero images and map visualizations

### Spacing
- Section gap: 80px
- Subsection gap: 48px
- Paragraph gap: 24px
- Component gap: 16px

### Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| < 640px | Mobile (single column, stacked) |
| 640-1024px | Tablet (classroom iPad, Chromebook) |
| > 1024px | Desktop |

Tablet is the primary breakpoint to optimize for — this is the most likely classroom device.

---

## File Organization

```
website/
├── src/
│   ├── components/     # Reusable UI components
│   ├── content/        # MDX or structured content per module
│   ├── interactive/    # Canvas/SVG interactive elements
│   ├── styles/         # CSS with design tokens
│   └── pages/          # Route pages
├── public/
│   ├── images/         # Static images, diagrams
│   └── data/           # JSON data files (incident timelines, cost data)
└── docs/               # This style guide lives here
```
