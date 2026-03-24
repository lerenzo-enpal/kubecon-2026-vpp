import { useState, useEffect } from 'react';
import { layers as pmLayers } from '@protomaps/basemaps';
import { cartoDarkFlavor } from './mapStyleFlavor';

const CDN_LABELED  = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const CDN_NOLABELS = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

const BLANK_STYLE = { version: 8, sources: {}, layers: [], glyphs: '', sprite: '' };

const REGION_FILES = {
  europe:    'europe.pmtiles',
  wolfsburg: 'wolfsburg.pmtiles',
  berlin:    'berlin.pmtiles',
  adelaide:  'adelaide.pmtiles',
  texas:     'texas.pmtiles',
};

const cache = {};

// Probe for local tiles by checking a small PMTiles file (range request, fast).
// Avoids the slow Vite static file scan triggered by large tiles/ directory.
const readyPromise = (async () => {
  const base = import.meta.env.BASE_URL;
  try {
    // Range request for first 512 bytes of a small tile file — instant on localhost
    const check = await fetch(`${base}tiles/texas.pmtiles`, {
      method: 'GET',
      headers: { Range: 'bytes=0-511' },
    });
    if (!check.ok && check.status !== 206) return false;

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

// Post-process Protomaps layers to match CARTO dark-matter visual style.
// Protomaps generates thin boundaries (0.4-0.7px) and subtle roads.
// CARTO uses thicker boundaries with a glow/outline effect.
function patchLayers(layers) {
  const patched = [];

  for (const l of layers) {
    // Thicken country boundaries to match CARTO (1.5px + 6px outline glow)
    if (l.id === 'boundaries_country') {
      // Add outer glow layer first (behind the main boundary)
      patched.push({
        ...l,
        id: 'boundaries_country_glow',
        paint: {
          'line-color': '#2C353C',
          'line-width': 6,
          'line-opacity': 0.4,
        },
      });
      // Main boundary line — thicker, solid
      patched.push({
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#666666',
          'line-width': ['interpolate', ['linear'], ['zoom'], 3, 1, 6, 1.5],
          'line-dasharray': [2, 0],
        },
      });
      continue;
    }

    // Thicken sub-national boundaries
    if (l.id === 'boundaries') {
      patched.push({
        ...l,
        paint: {
          ...l.paint,
          'line-color': '#444444',
          'line-width': ['interpolate', ['linear'], ['zoom'], 4, 0.5, 8, 1],
          'line-dasharray': [2, 2],
        },
      });
      continue;
    }

    // Filter city labels to only show cities with population > 50K
    if (l.id === 'places_locality') {
      patched.push({
        ...l,
        filter: ['all', ['==', 'kind', 'locality'], ['>=', ['get', 'population'], 50000]],
      });
      continue;
    }

    patched.push(l);
  }

  return patched;
}

function buildStyle(tilesUrl, base, labeled) {
  const rawLayers = pmLayers('protomaps', cartoDarkFlavor, { lang: 'en' });
  const layers = patchLayers(rawLayers);
  const origin = window.location.origin;
  return {
    version: 8,
    sources: {
      protomaps: { type: 'vector', url: tilesUrl },
    },
    layers: labeled ? layers : layers.filter(l => l.type !== 'symbol'),
    glyphs:  `${origin}${base}tiles/fonts/{fontstack}/{range}.pbf`,
    sprite:  `${origin}${base}tiles/sprites-pm/dark`,
  };
}

export function useMapStyle(region, variant = 'labeled') {
  const fallback = variant === 'nolabels' ? CDN_NOLABELS : CDN_LABELED;
  // Start with CDN immediately so maps render on first paint.
  // If local tiles are available, switch to them once the probe resolves.
  const [style, setStyle] = useState(fallback);

  useEffect(() => {
    readyPromise.then(available => {
      if (available) {
        setStyle(cache[`${region}:${variant}`] ?? fallback);
      }
    });
  }, [region, variant, fallback]);

  return style;
}
