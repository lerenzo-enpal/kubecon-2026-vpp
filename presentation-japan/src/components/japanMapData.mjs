export const HORMUZ_COORDINATE = [56.3, 26.6];

export const HORMUZ_CAMERA_SEQUENCE = {
  toHormuz: 2800,
  hold: 1800,
  toJapan: 5200,
};

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
