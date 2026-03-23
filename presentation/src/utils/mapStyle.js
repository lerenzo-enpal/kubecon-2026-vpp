import { useState, useEffect } from 'react';

const CDN_LABELED  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const CDN_NOLABELS = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

// Holds MapGL in a valid but empty state while the local tile probe is in flight.
// No network requests are fired until we know which source to use.
const BLANK_STYLE = { version: 8, sources: {}, layers: [], glyphs: '', sprite: '' };

const REGION_FILES = {
  europe:   'europe.pmtiles',
  berlin:   'berlin.pmtiles',
  adelaide: 'adelaide.pmtiles',
  texas:    'texas.pmtiles',
};

// Resolved style cache: 'region:variant' → style object or CDN URL string
const cache = {};

// Probes for local tiles on first import. Resolves to true if found, false if not.
// Local probe (~1ms on localhost) is tried first; CDN is the fallback.
const readyPromise = (async () => {
  const base = import.meta.env.BASE_URL;
  try {
    const check = await fetch(`${base}tiles/styles/dark-matter.json`, { method: 'HEAD' });
    if (!check.ok) return false;

    const [labeled, nolabels] = await Promise.all([
      fetch(`${base}tiles/styles/dark-matter.json`).then(r => r.json()),
      fetch(`${base}tiles/styles/dark-matter-nolabels.json`).then(r => r.json()),
    ]);

    for (const [region, file] of Object.entries(REGION_FILES)) {
      const tilesUrl = `pmtiles://${window.location.origin}${base}tiles/${file}`;
      cache[`${region}:labeled`]   = buildStyle(labeled,   tilesUrl, base);
      cache[`${region}:nolabels`]  = buildStyle(nolabels,  tilesUrl, base);
    }
    return true;
  } catch {
    return false;
  }
})();

function buildStyle(styleJson, tilesUrl, base) {
  const style = JSON.parse(JSON.stringify(styleJson));
  for (const source of Object.values(style.sources)) {
    if (source.type === 'vector') {
      source.url = tilesUrl;
      delete source.tiles;
      delete source.minzoom;
      delete source.maxzoom;
    }
  }
  style.sprite = `${window.location.origin}${base}tiles/sprites/sprite`;
  return style;
}

export function useMapStyle(region, variant = 'labeled') {
  const fallback = variant === 'nolabels' ? CDN_NOLABELS : CDN_LABELED;
  // Start with a blank valid style — no CDN requests fired until we know
  // whether local tiles are available. The probe resolves in ~1ms locally
  // (HEAD to localhost) or on a fast 404 for deployed/CDN-only environments,
  // so the blank state is imperceptible.
  const [style, setStyle] = useState(BLANK_STYLE);

  useEffect(() => {
    readyPromise.then(available => {
      setStyle(available ? (cache[`${region}:${variant}`] ?? fallback) : fallback);
    });
  }, [region, variant, fallback]);

  return style;
}
