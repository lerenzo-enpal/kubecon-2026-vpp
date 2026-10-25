// Drop-in replacement for presentation/src/theme.js.
//
// WHY A PROXY: the shared components (charts, HUDs, diagrams) do two things:
//   1. read `colors.primary` at render time into inline styles / canvas fills
//   2. concatenate a hex alpha onto it: `${colors.primary}40`
//
// (2) is only valid if the value is a LITERAL HEX string — a `var()` reference
// can never take an appended alpha. So instead of CSS custom properties, the
// palette lives in a module-level mutable slot and `colors` is a Proxy that
// resolves each property against the *currently active* palette.
//
// Result: theme swaps recolor every shared component on the next render, and
// all 83 `${colors.X}NN` call sites keep producing valid CSS. No component
// duplication, no codemod, no changes to the 42 importing files.

export const PALETTES = {
  red: {
    bg: '#050203',
    bgAlt: '#0c0507',
    surface: '#13080b',
    surfaceLight: '#1f0d12',

    primary: '#ff2d2d',
    secondary: '#ff6b4a',
    accent: '#ff4d1a',
    danger: '#ff1a1a',
    success: '#ff5c5c',

    text: '#ffd9d9',
    textMuted: '#c47a7a',
    textDim: '#7a3d3d',

    grid: '#ff2d2d',
    battery: '#ff5c5c',
    solar: '#ff7a3d',
    warning: '#ff1a1a',
    entrixBlue: '#ff4d6a',

    ghost: '#2a0d10',
    gridLine: '#3d1418',
    glow: '#ff2d2d',
    panel: '#080304',
  },

  mono: {
    bg: '#000000',
    bgAlt: '#0a0a0a',
    surface: '#141414',
    surfaceLight: '#1f1f1f',

    primary: '#ffffff',
    secondary: '#c8c8c8',
    accent: '#e8e8e8',
    danger: '#ffffff',
    success: '#b4b4b4',

    text: '#f2f2f2',
    textMuted: '#9a9a9a',
    textDim: '#5c5c5c',

    grid: '#ffffff',
    battery: '#d0d0d0',
    solar: '#e0e0e0',
    warning: '#ffffff',
    entrixBlue: '#c0c0c0',

    ghost: '#1c1c1c',
    gridLine: '#262626',
    glow: '#ffffff',
    panel: '#050505',
  },
};

export const VALID_THEMES = ['red', 'mono'];

export const THEME_LABELS = { red: '● RED', mono: '○ MONO' };

// Per-theme display substrate values that aren't colors.
export const DISPLAY = {
  red: {
    glass: 'rgba(255,80,80,0.030)',
    scanline: 'rgba(255,60,60,0.045)',
    bloom: 0.85,
    ghostOpacity: 0.10,
  },
  mono: {
    glass: 'rgba(255,255,255,0.030)',
    scanline: 'rgba(255,255,255,0.040)',
    bloom: 0.55,
    ghostOpacity: 0.14,
  },
};

let activeTheme = 'red';

// Bootstrap from URL / storage at module load so the palette is correct before
// the first paint, regardless of which module imports theme.js first.
if (typeof window !== 'undefined') {
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('theme');
    if (fromUrl && PALETTES[fromUrl]) {
      activeTheme = fromUrl;
    } else {
      const fromStorage = window.localStorage.getItem('vpp-sevenseg-theme');
      if (fromStorage && PALETTES[fromStorage]) activeTheme = fromStorage;
    }
  } catch {
    /* storage blocked — stay on default */
  }
}

export function setActiveTheme(name) {
  if (PALETTES[name]) activeTheme = name;
  return activeTheme;
}

export function getActiveTheme() {
  return activeTheme;
}

export function getPalette(name = activeTheme) {
  return PALETTES[name] ?? PALETTES.red;
}

export function getDisplay(name = activeTheme) {
  return DISPLAY[name] ?? DISPLAY.red;
}

// Proxy so `colors.primary` resolves live against the active palette and
// returns a literal hex string (safe for `${colors.primary}40`).
export const colors = new Proxy({}, {
  get(_target, key) {
    if (typeof key !== 'string') return undefined;
    return getPalette()[key];
  },
  has(_target, key) {
    return typeof key === 'string' && key in getPalette();
  },
  ownKeys() {
    return Reflect.ownKeys(getPalette());
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

export const theme = {
  colors: {
    get primary() { return colors.text; },
    get secondary() { return colors.textMuted; },
    get tertiary() { return colors.primary; },
    get quaternary() { return colors.bgAlt; },
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

export const slideStyle = {
  backgroundColor: colors.bg,
  backgroundSize: 'cover',
  padding: '60px 80px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

export const slideStyleTop = {
  ...slideStyle,
  justifyContent: 'flex-start',
  paddingTop: '80px',
};

// Spectacle theme derived from the active palette.
export function toSpectacleTheme(name = activeTheme) {
  const p = getPalette(name);
  return {
    colors: {
      primary: p.text,
      secondary: p.textMuted,
      tertiary: p.primary,
      quaternary: p.surface,
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
