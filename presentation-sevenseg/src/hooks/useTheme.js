import { useState, useEffect, useCallback } from 'react';
import { VALID_THEMES, setActiveTheme, toSpectacleTheme } from '../theme.js';

const STORAGE_KEY = 'vpp-sevenseg-theme';
const PARAM_KEY = 'theme';

function resolveTheme() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get(PARAM_KEY);
  if (fromUrl && VALID_THEMES.includes(fromUrl)) return fromUrl;
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage && VALID_THEMES.includes(fromStorage)) return fromStorage;
  return 'red';
}

// The palette is a module-level mutable slot (see theme.js), so switching is
// synchronous and every component picks up the new values on its next render.
// This runs at import time so the correct palette is active before first paint.
setActiveTheme(resolveTheme());
if (typeof document !== 'undefined') {
  document.documentElement.dataset.sevensegTheme = resolveTheme();
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => resolveTheme());

  useEffect(() => {
    setActiveTheme(theme);
    document.documentElement.dataset.sevensegTheme = theme;
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!VALID_THEMES.includes(next)) return;
    setActiveTheme(next);
    const params = new URLSearchParams(window.location.search);
    params.set(PARAM_KEY, next);
    window.history.replaceState(null, '', `?${params.toString()}`);
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    const idx = VALID_THEMES.indexOf(theme);
    setTheme(VALID_THEMES[(idx + 1) % VALID_THEMES.length]);
  }, [theme, setTheme]);

  const spectacleTheme = toSpectacleTheme(theme);

  return { theme, setTheme, cycleTheme, spectacleTheme };
}
