import { ATLAS_LAYER_IDS } from '../data/japanGridAtlasData.mjs';

export function resolveAtlasLayers({ preset = {}, overrides = {} } = {}) {
  return Object.fromEntries(ATLAS_LAYER_IDS.map((id) => [id, overrides[id] ?? preset[id] ?? false]));
}

export function plantRadiusAtZoom(zoom, size) {
  return Math.max(4, size - (zoom - 4.65) * 2);
}
