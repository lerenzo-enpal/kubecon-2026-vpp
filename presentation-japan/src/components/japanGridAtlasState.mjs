import { ATLAS_LAYER_IDS } from '../data/japanGridAtlasData.mjs';

export function resolveAtlasLayers({ preset = {}, overrides = {} } = {}) {
  return Object.fromEntries(ATLAS_LAYER_IDS.map((id) => [id, overrides[id] ?? preset[id] ?? false]));
}
