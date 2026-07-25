import { useState, useCallback } from 'react';
import { en } from '../locales/en.js';

const STORAGE_KEY = 'vpp-lang';
const PARAM_KEY = 'lang';
const VALID_LOCALES = ['en', 'ja'];

const LOCALE_STRINGS = { en };

function resolveLocale() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get(PARAM_KEY);
  if (fromUrl && VALID_LOCALES.includes(fromUrl)) return fromUrl;
  const fromStorage = localStorage.getItem(STORAGE_KEY);
  if (fromStorage && VALID_LOCALES.includes(fromStorage)) return fromStorage;
  return 'en';
}

export function useLocale() {
  const [locale, setLocaleState] = useState(() => resolveLocale());

  const strings = LOCALE_STRINGS[locale] ?? LOCALE_STRINGS.en;

  const t = useCallback((key) => {
    return strings[key] ?? LOCALE_STRINGS.en[key] ?? key;
  }, [strings]);

  const setLocale = useCallback((next) => {
    if (!VALID_LOCALES.includes(next)) return;
    const params = new URLSearchParams(window.location.search);
    params.set(PARAM_KEY, next);
    window.history.replaceState(null, '', `?${params.toString()}`);
    localStorage.setItem(STORAGE_KEY, next);
    setLocaleState(next);
  }, []);

  return { locale, setLocale, t };
}
