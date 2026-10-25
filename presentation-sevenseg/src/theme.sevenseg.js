// KubeCon Amsterdam 2026 — 7-segment display theme tokens.
//
// Two display substrates:
//   red  — classic red LED readout on near-black panel (alarm-clock / SCADA)
//   mono — white segments on black panel, luminance only, no hue
//
// Every token is a CSS custom property value applied to :root by useTheme.
// Components read them through src/theme.js, which exposes the same
// `colors` export shape the shared presentation components already import.

export const themes = {
  red: {
    // Panel substrate
    '--color-bg': '#050203',
    '--color-bg-alt': '#0c0507',
    '--color-surface': '#13080b',
    '--color-surface-light': '#1f0d12',

    // Segment emitters — the "lit" phosphor colors
    '--color-primary': '#ff2d2d',   // main readout red
    '--color-secondary': '#ff6b4a', // warmer secondary red
    '--color-accent': '#ff4d1a',    // amber-red warning
    '--color-danger': '#ff1a1a',    // alarm red (brightest)
    '--color-success': '#ff5c5c',   // "recovered" — still red, dimmer/softer

    // Unlit segments and panel furniture
    '--color-ghost': '#2a0d10',     // unlit segment ghost
    '--color-grid': '#3d1418',      // panel pixel grid
    '--color-glow': '#ff2d2d',      // bloom source

    // Type
    '--color-text': '#ffd9d9',
    '--color-text-muted': '#c47a7a',
    '--color-text-dim': '#7a3d3d',

    // Display-specific
    '--seg-panel': '#080304',
    '--seg-glass': 'rgba(255,80,80,0.030)',
    '--seg-scanline': 'rgba(255,60,60,0.045)',
    '--seg-bloom': '0.85',
    '--seg-ghost-opacity': '0.10',

    // Non-semantic domain colors (kept legible on red panel)
    '--color-battery': '#ff5c5c',
    '--color-solar': '#ff7a3d',
    '--color-warning': '#ff1a1a',
    '--color-entrix-blue': '#ff4d6a',
  },

  mono: {
    // Panel substrate
    '--color-bg': '#000000',
    '--color-bg-alt': '#0a0a0a',
    '--color-surface': '#141414',
    '--color-surface-light': '#1f1f1f',

    // Segment emitters — luminance-graded, no hue
    '--color-primary': '#ffffff',   // main readout
    '--color-secondary': '#c8c8c8',
    '--color-accent': '#e8e8e8',
    '--color-danger': '#ffffff',    // danger reads via brightness + blink
    '--color-success': '#b4b4b4',

    // Unlit segments and panel furniture
    '--color-ghost': '#1c1c1c',
    '--color-grid': '#262626',
    '--color-glow': '#ffffff',

    // Type
    '--color-text': '#f2f2f2',
    '--color-text-muted': '#9a9a9a',
    '--color-text-dim': '#5c5c5c',

    // Display-specific
    '--seg-panel': '#050505',
    '--seg-glass': 'rgba(255,255,255,0.030)',
    '--seg-scanline': 'rgba(255,255,255,0.040)',
    '--seg-bloom': '0.55',
    '--seg-ghost-opacity': '0.14',

    // Non-semantic domain colors (luminance-graded)
    '--color-battery': '#d0d0d0',
    '--color-solar': '#e0e0e0',
    '--color-warning': '#ffffff',
    '--color-entrix-blue': '#c0c0c0',
  },
};

export const VALID_THEMES = ['red', 'mono'];

export const THEME_LABELS = { red: '● RED', mono: '○ MONO' };

// Spectacle theme derived from a token set.
export function toSpectacleTheme(tokens) {
  return {
    colors: {
      primary: tokens['--color-text'],
      secondary: tokens['--color-text-muted'],
      tertiary: tokens['--color-primary'],
      quaternary: tokens['--color-surface'],
    },
    fonts: {
      header: '"JetBrains Mono", monospace',
      text: '"Inter", system-ui, sans-serif',
      monospace: '"JetBrains Mono", monospace',
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
