import { useState, useEffect, useCallback } from 'react';
import { themes, toSpectacleTheme, VALID_THEMES } from '../theme.japan.js';

const STORAGE_KEY = 'vpp-theme';
const PARAM_KEY = 'theme';

function resolveTheme() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get(PARAM_KEY);
  if (fromUrl && VALID_THEMES.includes(fromUrl)) return fromUrl;
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage && VALID_THEMES.includes(fromStorage)) return fromStorage;
  return 'dark';
}

function applyTheme(name) {
  const tokens = themes[name] ?? themes.dark;
  const root = document.documentElement;
  for (const [prop, value] of Object.entries(tokens)) {
    root.style.setProperty(prop, value);
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState(() => resolveTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (!VALID_THEMES.includes(next)) return;
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

  const spectacleTheme = toSpectacleTheme(themes[theme] ?? themes.dark);

  return { theme, setTheme, cycleTheme, spectacleTheme };
}
