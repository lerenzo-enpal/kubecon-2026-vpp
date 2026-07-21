// KubeCon Japan 2026 color token system.
// All values are CSS custom property values applied to :root by useTheme.
// light and hybrid are stubs that inherit dark values until Phase 2/3 are built.

export const themes = {
  dark: {
    '--color-bg':       '#060a1a',
    '--color-surface':  '#0d1424',
    '--color-heading':  '#3939D8',   // KubeCon Japan cobalt blue
    '--color-text':     '#f1f5f9',
    '--color-muted':    '#94a3b8',
    '--color-dim':      '#64748b',
    '--color-primary':  '#22d3ee',   // cyan — data viz, grid
    '--color-accent':   '#FFC217',   // gold
    '--color-warm':     '#FFA35F',   // warm orange
    '--color-danger':   '#ef4444',
    '--color-success':  '#10b981',
    '--color-secondary':'#a78bfa',
    '--font-heading':   '"Space Grotesk", system-ui, sans-serif',
    '--font-body':      '"Inter", system-ui, sans-serif',
    '--font-mono':      '"JetBrains Mono", monospace',
  },
  light: {
    '--color-bg':       '#EEF2FF',    // PPTX light lavender
    '--color-surface':  '#FFFFFF',
    '--color-heading':  '#1D1D6B',    // PPTX dark indigo (deep text)
    '--color-text':     '#0a0e17',    // nearly black for contrast
    '--color-muted':    '#4B5563',
    '--color-dim':      '#9CA3AF',
    '--color-primary':  '#3939D8',    // PPTX accent1 — indigo
    '--color-accent':   '#FFC217',    // PPTX accent5 — gold/yellow
    '--color-warm':     '#FFA35F',    // PPTX accent6 — warm orange
    '--color-danger':   '#DC2626',
    '--color-success':  '#059669',
    '--color-secondary':'#22d3ee',    // cyan for data viz (inherited from dark)
    '--font-heading':   '"Space Grotesk", system-ui, sans-serif',
    '--font-body':      '"Inter", system-ui, sans-serif',
    '--font-mono':      '"JetBrains Mono", monospace',
  },
  hybrid: {
    // Hybrid uses the dark theme for component rendering;
    // per-slide light overrides are applied via the slide's own className.
    // This object is dark so that viz slides always render correctly.
    '--color-bg':       '#060a1a',
    '--color-surface':  '#0d1424',
    '--color-heading':  '#3939D8',
    '--color-text':     '#f1f5f9',
    '--color-muted':    '#94a3b8',
    '--color-dim':      '#64748b',
    '--color-primary':  '#22d3ee',
    '--color-accent':   '#FFC217',
    '--color-warm':     '#FFA35F',
    '--color-danger':   '#ef4444',
    '--color-success':  '#10b981',
    '--color-secondary':'#a78bfa',
    '--font-heading':   '"Space Grotesk", system-ui, sans-serif',
    '--font-body':      '"Inter", system-ui, sans-serif',
    '--font-mono':      '"JetBrains Mono", monospace',
  },
};

// Spectacle-compatible theme object derived from a token set.
export function toSpectacleTheme(tokens) {
  return {
    colors: {
      primary:    tokens['--color-text'],
      secondary:  tokens['--color-muted'],
      tertiary:   tokens['--color-primary'],
      quaternary: tokens['--color-surface'],
    },
    fonts: {
      header:    tokens['--font-heading'],
      text:      tokens['--font-body'],
      monospace: tokens['--font-mono'],
    },
    fontSizes: {
      h1: '64px',
      h2: '48px',
      h3: '36px',
      text: '24px',
      monospace: '20px',
    },
  };
}

export const VALID_THEMES = ['dark', 'light', 'hybrid'];
