export const HORMUZ_COORDINATE = [56.3, 26.6];

export const HORMUZ_CAMERA_SEQUENCE = {
  toHormuz: 2800,
  hold: 2200,
  toJapan: 10800,
};

export const HORMUZ_STORY_KEYFRAMES = [
  {
    id: 'route-risk',
    camera: { center: HORMUZ_COORDINATE, zoom: 4.5, bearing: 18, pitch: 50 },
    callout: 'route-risk',
    anchor: HORMUZ_COORDINATE,
    hold: 2200,
  },
  {
    id: 'household-impact',
    camera: { center: [63.5, 24.5], zoom: 3.7, bearing: 24, pitch: 48 },
    callout: 'household-impact',
    anchor: [64, 24],
    hold: 2200,
  },
  {
    id: 'dependency',
    camera: { center: [95, 17.5], zoom: 3.15, bearing: 28, pitch: 45 },
    callout: 'dependency',
    anchor: [96, 15],
    hold: 2200,
  },
  {
    id: 'japan-grid',
    camera: { center: [138.25, 36.2], zoom: 4.5, bearing: 12, pitch: 42 },
    callout: 'japan-grid',
    anchor: [139.78, 35.55],
    hold: 0,
  },
];

export const JAPAN_LNG_COORDINATES = [
  [139.78, 35.55],
  [135.35, 34.62],
  [130.38, 33.59],
];

export const LNG_ROUTE = [
  HORMUZ_COORDINATE,
  [64, 24],
  [78, 18],
  [96, 15],
  [117, 21],
  [138.25, 36.2],
];

const tripPath = (offset, latitudeOffset = 0) => LNG_ROUTE.map(([longitude, latitude], index) => [
  longitude,
  latitude + latitudeOffset,
  index * 2400 + offset,
]);

export const LNG_TRIP_PATHS = [
  { id: 'lng-01', path: tripPath(0, 0) },
  { id: 'lng-02', path: tripPath(700, 1.15) },
  { id: 'lng-03', path: tripPath(1450, -0.95) },
  { id: 'lng-04', path: tripPath(2200, 0.55) },
];

export const JAPAN_GRID_TRIP_PATHS = [
  { id: 'grid-east', path: [[139.78, 35.55, 0], [140.87, 38.27, 1500], [141.35, 43.06, 2700]] },
  { id: 'grid-west', path: [[130.38, 33.59, 0], [135.35, 34.62, 1500], [139.78, 35.55, 2700]] },
];

export const COLD_SNAP_HOME_CLUSTERS = [
  { id: 'tokyo', name: 'Tokyo homes', position: [139.76, 35.68], demand: 1 },
  { id: 'kansai', name: 'Kansai homes', position: [135.5, 34.69], demand: 0.72 },
  { id: 'tohoku', name: 'Tohoku homes', position: [140.87, 38.27], demand: 0.58 },
];

export const COLD_SNAP_GRID_TRIPS = [
  { id: 'tokyo-tohoku', path: [[135.5, 34.69, 0], [139.76, 35.68, 1200], [140.87, 38.27, 2400]] },
  { id: 'kansai-to-tokyo', path: [[132.46, 34.39, 0], [135.5, 34.69, 1000], [139.76, 35.68, 2200]] },
  { id: 'hokkaido-tohoku', path: [[141.35, 43.06, 0], [140.87, 38.27, 1600], [139.76, 35.68, 3000]] },
];

const localTrip = (id, region, stage, source, hub, offset) => ({
  id,
  region,
  stage,
  path: [
    [...source, 0],
    [(source[0] + hub[0]) / 2, (source[1] + hub[1]) / 2, 280],
    [...hub, 0],
  ],
  timestamps: [offset, offset + 420, offset + 840],
});

const regionalTrip = (id, region, stage, source, target, altitude, offset) => ({
  id,
  region,
  stage,
  path: [
    [...source, 0],
    [(source[0] + target[0]) / 2, (source[1] + target[1]) / 2, altitude],
    [...target, 0],
  ],
  timestamps: [offset, offset + 1100, offset + 2200],
});

const TOKYO_GRID_HUB = [139.76, 35.68];
const KANSAI_GRID_HUB = [135.5, 34.69];
const TOHOKU_GRID_HUB = [140.87, 38.27];

export const COLD_SNAP_LOCAL_TRIPS = [
  localTrip('tokyo-east', 'tokyo', 1, [139.87, 35.67], TOKYO_GRID_HUB, 0),
  localTrip('tokyo-west', 'tokyo', 1, [139.65, 35.69], TOKYO_GRID_HUB, 240),
  localTrip('tokyo-north', 'tokyo', 1, [139.76, 35.78], TOKYO_GRID_HUB, 480),
  localTrip('tokyo-south', 'tokyo', 1, [139.77, 35.58], TOKYO_GRID_HUB, 720),
  localTrip('tokyo-bay', 'tokyo', 1, [139.87, 35.61], TOKYO_GRID_HUB, 960),
  localTrip('tokyo-suginami', 'tokyo', 1, [139.63, 35.7], TOKYO_GRID_HUB, 1200),
  localTrip('kansai-east', 'kansai', 3, [135.61, 34.69], KANSAI_GRID_HUB, 180),
  localTrip('kansai-west', 'kansai', 3, [135.4, 34.69], KANSAI_GRID_HUB, 420),
  localTrip('kansai-north', 'kansai', 3, [135.5, 34.78], KANSAI_GRID_HUB, 660),
  localTrip('tohoku-east', 'tohoku', 4, [141.01, 38.27], TOHOKU_GRID_HUB, 360),
  localTrip('tohoku-west', 'tohoku', 4, [140.73, 38.28], TOHOKU_GRID_HUB, 600),
  localTrip('tohoku-north', 'tohoku', 4, [140.87, 38.38], TOHOKU_GRID_HUB, 840),
];

export const COLD_SNAP_REGIONAL_TRIPS = [
  regionalTrip('tokyo-tohoku', 'tohoku', 2, TOKYO_GRID_HUB, TOHOKU_GRID_HUB, 22000, 0),
  regionalTrip('tokyo-to-kansai', 'kansai', 2, TOKYO_GRID_HUB, KANSAI_GRID_HUB, 28000, 400),
  regionalTrip('kansai-to-chugoku', 'chugoku', 3, KANSAI_GRID_HUB, [132.46, 34.39], 18000, 800),
  regionalTrip('chugoku-to-kyushu', 'kyushu', 3, [132.46, 34.39], [130.38, 33.59], 16000, 1200),
  regionalTrip('tohoku-to-hokkaido', 'hokkaido', 4, TOHOKU_GRID_HUB, [141.35, 43.06], 30000, 600),
  regionalTrip('kansai-to-shikoku', 'shikoku', 4, KANSAI_GRID_HUB, [133.53, 33.56], 16000, 1000),
];

export const getColdSnapTrips = (stage) => ({
  localTrips: COLD_SNAP_LOCAL_TRIPS.filter((trip) => trip.stage <= Math.max(1, stage)),
  regionalTrips: COLD_SNAP_REGIONAL_TRIPS.filter((trip) => trip.stage <= Math.max(0, stage)),
});

export const COLD_SNAP_CAMERA_KEYFRAMES = [
  { id: 'historical', camera: { center: [138.25, 36.2], zoom: 4.25, bearing: 12, pitch: 40 }, anchor: [139.76, 35.68] },
  { id: 'jepx', camera: { center: [138.25, 36.2], zoom: 4.25, bearing: 12, pitch: 40 }, anchor: [139.76, 35.68] },
  { id: 'tokyo', camera: { center: [139.76, 35.68], zoom: 6.15, bearing: 24, pitch: 52 }, anchor: [139.76, 35.68] },
  { id: 'kansai', camera: { center: [135.5, 34.69], zoom: 5.95, bearing: 20, pitch: 50 }, anchor: [135.5, 34.69] },
  { id: 'tohoku', camera: { center: [140.87, 38.27], zoom: 5.7, bearing: 18, pitch: 48 }, anchor: [140.87, 38.27] },
];

export const getRoutePosition = (route, progress) => {
  const clampedProgress = Math.max(0, Math.min(1, progress));
  const segmentProgress = clampedProgress * (route.length - 1);
  const startIndex = Math.min(Math.floor(segmentProgress), route.length - 2);
  const localProgress = segmentProgress - startIndex;
  const [startLongitude, startLatitude] = route[startIndex];
  const [endLongitude, endLatitude] = route[startIndex + 1];

  return [
    startLongitude + (endLongitude - startLongitude) * localProgress,
    startLatitude + (endLatitude - startLatitude) * localProgress,
  ];
};
