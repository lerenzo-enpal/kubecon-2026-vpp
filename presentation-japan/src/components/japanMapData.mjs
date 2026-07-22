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
