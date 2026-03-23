import { useState, useEffect } from 'react';
import { layers as pmLayers } from '@protomaps/basemaps';
import { cartoDarkFlavor } from './mapStyleFlavor';

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

    for (const [region, file] of Object.entries(REGION_FILES)) {
      const tilesUrl = `pmtiles://${window.location.origin}${base}tiles/${file}`;
      cache[`${region}:labeled`]   = buildStyle(tilesUrl, base, true);
      cache[`${region}:nolabels`]  = buildStyle(tilesUrl, base, false);
    }
    return true;
  } catch {
    return false;
  }
})();

// Generates a Protomaps-native dark style pointing at a local pmtiles source.
// The Protomaps @basemaps package uses the correct Protomaps schema layer names
// (boundaries, roads, places, etc.) which match the Protomaps planet tile builds.
// CARTO dark-matter style uses OpenMapTiles layer names (boundary, transportation,
// place, etc.) which do NOT match Protomaps tiles — hence nothing rendered offline.
function buildStyle(tilesUrl, base, labeled) {
  const allLayers = pmLayers('protomaps', cartoDarkFlavor, { lang: 'en' });
  const origin = window.location.origin;
  return {
    version: 8,
    sources: {
      protomaps: { type: 'vector', url: tilesUrl },
    },
    layers: labeled ? allLayers : allLayers.filter(l => l.type !== 'symbol'),
    glyphs:  `${origin}${base}tiles/fonts/{fontstack}/{range}.pbf`,
    sprite:  `${origin}${base}tiles/sprites-pm/dark`,
  };
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
