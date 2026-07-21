import { ArcLayer, PathLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import * as mapData from './japanMapData.mjs';

const COLORS = {
  cyan: [34, 211, 238, 230],
  green: [16, 185, 129, 230],
  amber: [255, 194, 23, 245],
  orange: [255, 163, 95, 230],
  red: [239, 68, 68, 245],
  text: [226, 232, 240, 255],
};

const UTILITIES = [
  { id: 'hokkaido', name: 'Hokkaido', position: [141.35, 43.06], frequency: '50 Hz', color: COLORS.cyan },
  { id: 'tohoku', name: 'Tohoku', position: [140.87, 38.27], frequency: '50 Hz', color: COLORS.cyan },
  { id: 'kanto', name: 'Kanto', position: [139.69, 35.68], frequency: '50 Hz', color: COLORS.cyan },
  { id: 'chubu', name: 'Chubu', position: [136.91, 35.18], frequency: '50 Hz', color: COLORS.cyan },
  { id: 'kansai', name: 'Kansai', position: [135.5, 34.69], frequency: '60 Hz', color: COLORS.green },
  { id: 'chugoku', name: 'Chugoku', position: [132.46, 34.39], frequency: '60 Hz', color: COLORS.green },
  { id: 'shikoku', name: 'Shikoku', position: [133.53, 33.84], frequency: '60 Hz', color: COLORS.green },
  { id: 'kyushu', name: 'Kyushu', position: [130.42, 33.59], frequency: '60 Hz', color: COLORS.green },
  { id: 'okinawa', name: 'Okinawa', position: [127.68, 26.21], frequency: '60 Hz', color: COLORS.green },
];

const FREQUENCY_SEAM = [[137, 37.2], [137.3, 36.5], [137.6, 36], [137.8, 35.5], [138, 35.2]];
const TERMINALS = [
  { name: 'Tokyo LNG', position: mapData.JAPAN_LNG_COORDINATES[0] },
  { name: 'Osaka LNG', position: mapData.JAPAN_LNG_COORDINATES[1] },
  { name: 'Fukuoka LNG', position: mapData.JAPAN_LNG_COORDINATES[2] },
];

const partialRoute = (progress) => {
  const completedSegments = Math.floor(progress * (mapData.LNG_ROUTE.length - 1));
  return [
    ...mapData.LNG_ROUTE.slice(0, completedSegments + 1),
    mapData.getRoutePosition(mapData.LNG_ROUTE, progress),
  ];
};

export const getJapanMapLayers = ({ scene, routeProgress = 0, gridPulse = 0 }) => {
  if (scene === 'hormuz') {
    const route = partialRoute(routeProgress);
    const pulse = mapData.getRoutePosition(mapData.LNG_ROUTE, routeProgress);

    return [
      new PathLayer({
        id: 'lng-route',
        data: [{ path: route }],
        getPath: (item) => item.path,
        getColor: COLORS.red,
        getWidth: 5,
        widthUnits: 'pixels',
        capRounded: true,
        jointRounded: true,
      }),
      new ScatterplotLayer({
        id: 'hormuz-origin',
        data: [{ position: mapData.HORMUZ_COORDINATE }],
        getPosition: (item) => item.position,
        getRadius: 25000,
        radiusUnits: 'meters',
        getFillColor: COLORS.red,
        getLineColor: [254, 202, 202, 255],
        lineWidthMinPixels: 2,
        stroked: true,
      }),
      new ScatterplotLayer({
        id: 'lng-route-pulse',
        data: [{ position: pulse }],
        getPosition: (item) => item.position,
        getRadius: 18000,
        radiusUnits: 'meters',
        getFillColor: COLORS.amber,
        getLineColor: [254, 243, 199, 255],
        lineWidthMinPixels: 2,
        stroked: true,
      }),
      new ScatterplotLayer({
        id: 'japan-lng-terminals',
        data: TERMINALS,
        getPosition: (item) => item.position,
        getRadius: 18000,
        radiusUnits: 'meters',
        getFillColor: COLORS.amber,
      }),
      new TextLayer({
        id: 'japan-lng-terminal-icons',
        data: TERMINALS,
        getPosition: (item) => item.position,
        getText: () => 'LNG',
        getSize: 11,
        getColor: [6, 10, 26, 255],
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 800,
      }),
      new TextLayer({
        id: 'hormuz-label',
        data: [{ position: mapData.HORMUZ_COORDINATE, label: 'Strait of Hormuz' }],
        getPosition: (item) => item.position,
        getText: (item) => item.label,
        getSize: 17,
        getColor: [254, 202, 202, 255],
        getPixelOffset: [18, 18],
        getTextAnchor: 'start',
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
      }),
      new TextLayer({
        id: 'japan-lng-label',
        data: [{ position: mapData.JAPAN_LNG_COORDINATES[0], label: 'Japan LNG terminals' }],
        getPosition: (item) => item.position,
        getText: (item) => item.label,
        getSize: 16,
        getColor: [165, 243, 252, 255],
        getPixelOffset: [16, -16],
        getTextAnchor: 'start',
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
      }),
    ];
  }

  const currentStep = Number(scene);
  const visibleUtilities = UTILITIES.filter((utility) => utility.frequency === '50 Hz' || currentStep >= 2);
  const layers = [
    new ScatterplotLayer({
      id: 'japan-utility-pulse',
      data: visibleUtilities,
      getPosition: (item) => item.position,
      getRadius: gridPulse ? 44000 : 30000,
      radiusUnits: 'meters',
      getFillColor: (item) => [...item.color.slice(0, 3), gridPulse ? 28 : 8],
      transitions: { getRadius: 900, getFillColor: 900 },
    }),
    new ScatterplotLayer({
      id: 'japan-utilities',
      data: visibleUtilities,
      getPosition: (item) => item.position,
      getRadius: 22000,
      radiusUnits: 'meters',
      getFillColor: (item) => item.color,
      getLineColor: (item) => item.color,
      lineWidthMinPixels: 2,
      stroked: true,
      transitions: { getRadius: 700 },
    }),
    new TextLayer({
      id: 'japan-utility-icons',
      data: visibleUtilities,
      getPosition: (item) => item.position,
      getText: () => '✦',
      getSize: 14,
      getColor: [255, 255, 255, 255],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'Space Grotesk, sans-serif',
      fontWeight: 700,
    }),
    new TextLayer({
      id: 'japan-utility-labels',
      data: visibleUtilities,
      getPosition: (item) => item.position,
      getText: (item) => item.name,
      getSize: 12,
      getColor: COLORS.text,
      getPixelOffset: [12, -10],
      getTextAnchor: 'start',
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 600,
    }),
  ];

  if (currentStep >= 3) {
    layers.push(new PathLayer({
      id: 'frequency-seam', data: [{ path: FREQUENCY_SEAM }], getPath: (item) => item.path,
      getColor: COLORS.orange, getWidth: 3, widthUnits: 'pixels',
    }));
  }

  if (currentStep >= 4) {
    layers.push(new ArcLayer({
      id: 'lng-import-flows', data: TERMINALS,
      getSourcePosition: (item) => [item.position[0] - 1.2, item.position[1] - 0.8],
      getTargetPosition: (item) => item.position,
      getSourceColor: [255, 194, 23, 70], getTargetColor: COLORS.amber,
      getWidth: 3, widthUnits: 'pixels',
    }));
  }

  return layers;
};
