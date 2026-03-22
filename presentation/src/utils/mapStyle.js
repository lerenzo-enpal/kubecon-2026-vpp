import { useState, useEffect } from 'react';

const CDN_LABELED  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const CDN_NOLABELS = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const REGION_FILES = {
  europe:   'europe.pmtiles',
  berlin:   'berlin.pmtiles',
  adelaide: 'adelaide.pmtiles',
  texas:    'texas.pmtiles',
};

// Resolved style cache: 'region:variant' → style object (or CDN string if unavailable)
const cache = {};

// Kicked off immediately on first import — resolves true if local tiles are present
const readyPromise = (async () => {
  try {
    const check = await fetch('/tiles/styles/dark-matter.json', { method: 'HEAD' });
    if (!check.ok) return false;

    const [labeled, nolabels] = await Promise.all([
      fetch('/tiles/styles/dark-matter.json').then(r => r.json()),
      fetch('/tiles/styles/dark-matter-nolabels.json').then(r => r.json()),
    ]);

    for (const [region, file] of Object.entries(REGION_FILES)) {
      const tilesUrl = `pmtiles://${window.location.origin}/tiles/${file}`;
      cache[`${region}:labeled`]   = buildStyle(labeled,   tilesUrl);
      cache[`${region}:nolabels`]  = buildStyle(nolabels,  tilesUrl);
    }
    return true;
  } catch {
    return false;
  }
})();

function buildStyle(styleJson, tilesUrl) {
  const style = JSON.parse(JSON.stringify(styleJson));
  for (const source of Object.values(style.sources)) {
    if (source.type === 'vector') {
      source.url = tilesUrl;
      delete source.tiles;
      delete source.minzoom;
      delete source.maxzoom;
    }
  }
  style.sprite = `${window.location.origin}/tiles/sprites/sprite`;
  return style;
}

export function useMapStyle(region, variant = 'labeled') {
  const fallback = variant === 'nolabels' ? CDN_NOLABELS : CDN_LABELED;
  const [style, setStyle] = useState(fallback);

  useEffect(() => {
    readyPromise.then(available => {
      if (available) setStyle(cache[`${region}:${variant}`] ?? fallback);
    });
  }, [region, variant, fallback]);

  return style;
}
