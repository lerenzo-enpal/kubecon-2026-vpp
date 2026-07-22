const seededRandom = (initialSeed) => {
  let seed = initialSeed >>> 0;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
};

export const VPP_TRANSFORMATION_STAGES = [
  { id: 'pause', cue: 'reframe', camera: null },
  { id: 'graph', cue: 'topology', camera: null },
  { id: 'city', cue: 'city', camera: null },
  { id: 'japan', cue: 'japan', camera: { center: [138.25, 36.2], zoom: 4.35, bearing: 12, pitch: 42 } },
  { id: 'vpp', cue: 'superpowers', camera: { center: [137.7, 35.75], zoom: 5.05, bearing: 16, pitch: 48 } },
];

const GRAPH_POSITIONS = [
  [0.12, 0.62], [0.2, 0.32], [0.29, 0.72], [0.36, 0.48], [0.43, 0.2], [0.49, 0.65], [0.56, 0.38],
  [0.63, 0.78], [0.69, 0.54], [0.75, 0.24], [0.81, 0.67], [0.86, 0.43], [0.91, 0.78], [0.52, 0.86],
];

export const VPP_GRAPH_NODES = GRAPH_POSITIONS.map((position, index) => ({
  id: `graph-${index}`,
  position,
  load: [0.42, 0.58, 0.76, 0.54, 0.88, 0.67, 0.46, 0.92, 0.72, 0.61, 0.84, 0.49, 0.73, 0.57][index],
}));

const GRAPH_LINK_INDEXES = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 5], [3, 4], [3, 5], [3, 6], [4, 6], [5, 6], [5, 7], [5, 13],
  [6, 8], [6, 9], [7, 8], [7, 10], [8, 10], [8, 11], [9, 11], [10, 11], [10, 12], [11, 12], [7, 13],
];

export const VPP_GRAPH_LINKS = GRAPH_LINK_INDEXES.map(([source, target], index) => ({
  id: `link-${index}`,
  source: VPP_GRAPH_NODES[source].id,
  target: VPP_GRAPH_NODES[target].id,
  path: [VPP_GRAPH_NODES[source].position, VPP_GRAPH_NODES[target].position],
}));

const normalizedFootprint = ([x, y], width, height) => [
  [x - width, y - height], [x + width, y - height], [x + width, y + height], [x - width, y + height], [x - width, y - height],
];

export const VPP_CITY_BUILDINGS = VPP_GRAPH_NODES.map((node, index) => ({
  id: `city-${node.id}`,
  polygon: normalizedFootprint(node.position, 0.018 + (index % 3) * 0.006, 0.025 + (index % 4) * 0.006),
  height: 48 + Math.round(node.load * 152),
  load: node.load,
}));

const tripFromNormalizedLink = (link, index) => ({
  id: `city-trip-${index}`,
  path: link.path.map(([x, y], pointIndex) => [x, y, pointIndex === 0 || pointIndex === 2 ? 0 : 0.03]),
  timestamps: [index * 67, index * 67 + 360, index * 67 + 720],
});

const cityRandom = seededRandom(20260722);
export const VPP_LOCAL_TRIPS = Array.from({ length: 56 }, (_, index) => {
  const base = VPP_GRAPH_LINKS[index % VPP_GRAPH_LINKS.length];
  const [source, target] = base.path;
  const bend = (cityRandom() - 0.5) * 0.045;
  return {
    ...tripFromNormalizedLink(base, index),
    path: [[...source, 0], [(source[0] + target[0]) / 2 + bend, (source[1] + target[1]) / 2 - bend, 0.04], [...target, 0]],
  };
});

const JAPAN_HOMES = [
  ['tokyo-east', [139.87, 35.67], 'tokyo'], ['tokyo-west', [139.66, 35.69], 'tokyo'], ['tokyo-north', [139.76, 35.79], 'tokyo'],
  ['yokohama', [139.64, 35.45], 'tokyo'], ['chiba', [140.12, 35.61], 'tokyo'], ['saitama', [139.65, 35.9], 'tokyo'],
  ['nagoya', [136.91, 35.18], 'chubu'], ['shizuoka', [138.38, 34.98], 'chubu'], ['osaka', [135.5, 34.69], 'kansai'],
  ['kyoto', [135.77, 35.01], 'kansai'], ['kobe', [135.18, 34.69], 'kansai'], ['hiroshima', [132.46, 34.39], 'chugoku'],
  ['fukuoka', [130.4, 33.59], 'kyushu'], ['sendai', [140.87, 38.27], 'tohoku'], ['sapporo', [141.35, 43.06], 'hokkaido'],
];

export const VPP_JAPAN_HOMES = JAPAN_HOMES.map(([id, position, region]) => ({ id, position, region }));
export const VPP_BATTERIES = VPP_JAPAN_HOMES.filter((_, index) => [0, 3, 6, 8, 10, 12, 13].includes(index)).map((home) => ({ ...home, id: `battery-${home.id}` }));
export const VPP_GENERATORS = [
  { id: 'gen-kashima', position: [140.7, 35.95], type: 'thermal' }, { id: 'gen-kawasaki', position: [139.75, 35.5], type: 'thermal' },
  { id: 'gen-hamaoka', position: [138.13, 34.62], type: 'solar' }, { id: 'gen-osaka', position: [135.36, 34.6], type: 'thermal' },
  { id: 'gen-kyushu', position: [130.34, 33.64], type: 'solar' }, { id: 'gen-tohoku', position: [141.0, 38.1], type: 'wind' },
];
export const VPP_GRID_HUBS = [
  { id: 'hub-tokyo', position: [139.76, 35.68] }, { id: 'hub-chubu', position: [136.91, 35.18] }, { id: 'hub-kansai', position: [135.5, 34.69] },
  { id: 'hub-chugoku', position: [132.46, 34.39] }, { id: 'hub-kyushu', position: [130.4, 33.59] }, { id: 'hub-tohoku', position: [140.87, 38.27] },
  { id: 'hub-hokkaido', position: [141.35, 43.06] },
];

const geographicFootprint = ([longitude, latitude], width = 0.045, height = 0.03) => [
  [longitude - width, latitude - height], [longitude + width, latitude - height], [longitude + width, latitude + height], [longitude - width, latitude + height], [longitude - width, latitude - height],
];

export const VPP_JAPAN_CITY_BUILDINGS = VPP_JAPAN_HOMES.flatMap((home, homeIndex) => Array.from({ length: 5 }, (_, index) => ({
  id: `japan-building-${home.id}-${index}`,
  polygon: geographicFootprint([home.position[0] + (index - 2) * 0.025, home.position[1] + ((index % 2) - 0.5) * 0.032], 0.009 + (index % 3) * 0.003, 0.007 + (index % 2) * 0.003),
  height: 24 + ((homeIndex * 19 + index * 31) % 138),
})));

const tripFromHome = (home, hub, index) => ({
  id: `japan-local-${home.id}`,
  path: [[...home.position, 0], [(home.position[0] + hub.position[0]) / 2, (home.position[1] + hub.position[1]) / 2, 1200], [...hub.position, 0]],
  timestamps: [index * 180, index * 180 + 500, index * 180 + 1000],
});

const hubForHome = (home) => VPP_GRID_HUBS.reduce((closest, hub) => {
  const currentDistance = (hub.position[0] - home.position[0]) ** 2 + (hub.position[1] - home.position[1]) ** 2;
  const closestDistance = (closest.position[0] - home.position[0]) ** 2 + (closest.position[1] - home.position[1]) ** 2;
  return currentDistance < closestDistance ? hub : closest;
}, VPP_GRID_HUBS[0]);

export const VPP_JAPAN_LOCAL_TRIPS = VPP_JAPAN_HOMES.map((home, index) => tripFromHome(home, hubForHome(home), index));
export const VPP_REGIONAL_TRIPS = [
  ['tokyo-tohoku', 0, 5, 28000], ['tokyo-chubu', 0, 1, 24000], ['chubu-kansai', 1, 2, 21000], ['kansai-chugoku', 2, 3, 20000],
  ['chugoku-kyushu', 3, 4, 19000], ['tokyo-hokkaido', 0, 6, 33000], ['kansai-kyushu', 2, 4, 26000], ['chubu-tohoku', 1, 5, 25000],
].map(([id, sourceIndex, targetIndex, altitude], index) => {
  const source = VPP_GRID_HUBS[sourceIndex].position;
  const target = VPP_GRID_HUBS[targetIndex].position;
  return { id, path: [[...source, 0], [(source[0] + target[0]) / 2, (source[1] + target[1]) / 2, altitude], [...target, 0]], timestamps: [index * 300, index * 300 + 1100, index * 300 + 2200] };
});

export const VPP_CONTROL_LINKS = VPP_BATTERIES.map((battery) => ({
  id: `control-${battery.id}`,
  path: [battery.position, hubForHome(battery).position],
}));

export const getVPPStageData = (stage) => {
  const activeStage = Math.max(0, Math.min(4, stage));
  const isJapan = activeStage >= 3;
  const isVPP = activeStage >= 4;
  return {
    stage: VPP_TRANSFORMATION_STAGES[activeStage],
    homes: isJapan ? VPP_JAPAN_HOMES : [],
    batteries: isVPP ? VPP_BATTERIES : [],
    generators: isJapan ? VPP_GENERATORS : [],
    hubs: isJapan ? VPP_GRID_HUBS : [],
    localTrips: isJapan ? VPP_JAPAN_LOCAL_TRIPS : [],
    regionalTrips: isJapan ? VPP_REGIONAL_TRIPS : [],
  };
};
