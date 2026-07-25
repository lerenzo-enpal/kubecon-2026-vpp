import { ArcLayer, PathLayer, ScatterplotLayer, TextLayer, GeoJsonLayer, PolygonLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import { ScreenGridLayer } from '@deck.gl/aggregation-layers';
import { MaskExtension } from '@deck.gl/extensions';
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

export const getJapanMapLayers = ({ scene, routeProgress = 0, gridPulse = 0, tripTime = 0, disruptionRatio = 1, coldSnapStage = 0 }) => {
  if (scene === 'cold-snap') {
    const visibleClusters = mapData.COLD_SNAP_HOME_CLUSTERS.slice(0, Math.max(1, coldSnapStage - 1));
    const { buildings, localTrips, regionalTrips, hubs: gridHubs } = mapData.getColdSnapCityScene(coldSnapStage);
    const isEscalating = coldSnapStage >= 3;

    return [
      new PolygonLayer({
        id: 'cold-snap-city-buildings',
        data: buildings,
        getPolygon: ({ polygon }) => polygon,
        getElevation: ({ height }) => height,
        getFillColor: [19, 28, 45, 230],
        getLineColor: [45, 58, 80, 180],
        getLineWidth: 1,
        lineWidthUnits: 'pixels',
        extruded: true,
        wireframe: true,
        material: { ambient: 0.45, diffuse: 0.65, shininess: 24, specularColor: [20, 40, 65] },
        pickable: false,
      }),
      new ScatterplotLayer({
        id: 'cold-snap-homes',
        data: visibleClusters,
        getPosition: ({ position }) => position,
        getRadius: coldSnapStage >= 2 ? 1100 : 21000,
        radiusUnits: 'meters',
        getFillColor: [241, 245, 249, 240],
        getLineColor: COLORS.red,
        lineWidthMinPixels: 2,
        stroked: true,
      }),
      new TripsLayer({
        id: 'cold-snap-local-distribution',
        data: localTrips,
        getPath: (trip) => trip.path,
        getTimestamps: (trip) => trip.timestamps,
        getColor: [34, 211, 238, 112],
        getWidth: 2.5,
        widthUnits: 'pixels',
        currentTime: tripTime,
        trailLength: 1250,
        fadeTrail: true,
        capRounded: true,
        jointRounded: true,
      }),
      new TripsLayer({
        id: 'cold-snap-local-demand-pulse',
        data: localTrips,
        getPath: (trip) => trip.path,
        getTimestamps: (trip) => trip.timestamps,
        getColor: isEscalating ? COLORS.red : COLORS.amber,
        getWidth: 1.8,
        widthUnits: 'pixels',
        currentTime: tripTime,
        trailLength: 760,
        fadeTrail: true,
        capRounded: true,
        jointRounded: true,
      }),
      new TripsLayer({
        id: 'cold-snap-regional-transmission',
        data: regionalTrips,
        getPath: (trip) => trip.path,
        getTimestamps: (trip) => trip.timestamps,
        getColor: isEscalating ? COLORS.amber : COLORS.cyan,
        getWidth: 6,
        widthUnits: 'pixels',
        currentTime: tripTime,
        trailLength: 2200,
        fadeTrail: true,
        capRounded: true,
        jointRounded: true,
      }),
      new ScatterplotLayer({
        id: 'cold-snap-grid-hubs',
        data: gridHubs,
        getPosition: ({ position }) => position,
        getRadius: coldSnapStage >= 2 ? 1800 : 12000,
        radiusUnits: 'meters',
        getFillColor: COLORS.amber,
        getLineColor: [254, 243, 199, 255],
        lineWidthMinPixels: 2,
        stroked: true,
      }),
    ];
  }

  if (scene === 'hormuz') {
    const route = partialRoute(routeProgress);
    const pulse = mapData.getRoutePosition(mapData.LNG_ROUTE, routeProgress);
    const visibleTrips = mapData.LNG_TRIP_PATHS.slice(0, Math.max(1, Math.ceil(mapData.LNG_TRIP_PATHS.length * disruptionRatio)));
    const closureZone = {
      type: 'Feature',
      properties: {},
      geometry: { type: 'Polygon', coordinates: [[[54.8, 25.4], [58.2, 25.4], [58.2, 27.8], [54.8, 27.8], [54.8, 25.4]]] },
    };

    return [
      new GeoJsonLayer({
        id: 'hormuz-mask',
        data: closureZone,
        operation: 'mask',
        filled: true,
        stroked: false,
        getFillColor: [255, 255, 255, 255],
      }),
      new ScreenGridLayer({
        id: 'lng-congestion-grid',
        data: mapData.LNG_TRIP_PATHS.flatMap((trip) => trip.path.map(([longitude, latitude]) => ({ position: [longitude, latitude] }))),
        getPosition: (item) => item.position,
        cellSizePixels: 46,
        colorRange: [[255, 163, 95, 0], [255, 163, 95, 52], [239, 68, 68, 120]],
        opacity: 0.42,
      }),
      new TripsLayer({
        id: 'lng-trips',
        data: visibleTrips,
        getPath: (trip) => trip.path.map(([longitude, latitude]) => [longitude, latitude]),
        getTimestamps: (trip) => trip.path.map(([, , timestamp]) => timestamp),
        getColor: [255, 194, 23, 220],
        getWidth: 4,
        widthUnits: 'pixels',
        currentTime: tripTime,
        trailLength: 3300,
        fadeTrail: true,
        capRounded: true,
        jointRounded: true,
        extensions: [new MaskExtension()],
        maskId: 'hormuz-mask',
        maskInverted: true,
      }),
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
      new TripsLayer({
        id: 'japan-grid-flow',
        data: routeProgress > 0.85 ? mapData.JAPAN_GRID_TRIP_PATHS : [],
        getPath: (trip) => trip.path.map(([longitude, latitude]) => [longitude, latitude]),
        getTimestamps: (trip) => trip.path.map(([, , timestamp]) => timestamp),
        getColor: COLORS.cyan,
        getWidth: 3,
        widthUnits: 'pixels',
        currentTime: tripTime % 2700,
        trailLength: 1800,
        fadeTrail: true,
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
