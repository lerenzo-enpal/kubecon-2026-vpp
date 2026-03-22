export const colors = {
  bg: '#0a0e17',
  bgAlt: '#111827',
  surface: '#1a2236',
  surfaceLight: '#243049',
  primary: '#22d3ee',    // cyan
  secondary: '#a78bfa',  // purple
  accent: '#f59e0b',     // amber
  danger: '#ef4444',     // red
  success: '#10b981',    // green
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  grid: '#22d3ee',
  battery: '#10b981',
  solar: '#f59e0b',
  warning: '#ef4444',
  entrixBlue: '#1d54f5'
};

export const theme = {
  colors: {
    primary: colors.text,
    secondary: colors.textMuted,
    tertiary: colors.primary,
    quaternary: colors.bgAlt,
  },
  fonts: {
    header: '"Inter", system-ui, sans-serif',
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
