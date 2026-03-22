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
