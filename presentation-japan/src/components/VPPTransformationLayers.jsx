import { PathLayer, PolygonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import {
  VPP_CONTROL_LINKS,
  VPP_JAPAN_CITY_BUILDINGS,
  getVPPStageData,
} from './vppTransformationData.mjs';

const COLORS = {
  cyan: [34, 211, 238, 215],
  cyanDim: [34, 211, 238, 105],
  amber: [255, 194, 23, 240],
  green: [52, 211, 153, 245],
  home: [241, 245, 249, 238],
  darkBuilding: [17, 30, 52, 220],
  outline: [72, 94, 126, 180],
};

const colorBetween = (from, to, amount) => from.map((value, index) => Math.round(value + (to[index] - value) * amount));

export const getVPPTransformationLayers = ({ stage, tripTime = 0, stabilization = 0, capabilityPhase = -1 }) => {
  if (stage < 3) return [];
  const { homes, batteries, generators, hubs, localTrips, regionalTrips } = getVPPStageData(stage);
  const settled = Math.max(0, Math.min(1, stabilization));
  const controlColor = colorBetween(COLORS.amber, COLORS.green, settled);
  const capabilityColor = [[255, 194, 23], [34, 211, 238], [167, 139, 250]][capabilityPhase] ?? COLORS.amber;

  return [
    new PolygonLayer({
      id: 'vpp-city-buildings',
      data: VPP_JAPAN_CITY_BUILDINGS,
      getPolygon: ({ polygon }) => polygon,
      getElevation: ({ height }) => height,
      getFillColor: COLORS.darkBuilding,
      getLineColor: COLORS.outline,
      getLineWidth: 1,
      lineWidthUnits: 'pixels',
      extruded: true,
      wireframe: true,
      material: { ambient: 0.5, diffuse: 0.62, shininess: 26, specularColor: [22, 55, 90] },
      pickable: false,
    }),
    new PathLayer({
      id: 'vpp-transmission-context',
      data: regionalTrips,
      getPath: (trip) => trip.path,
      getColor: stage === 4 ? colorBetween(COLORS.cyanDim, COLORS.green, settled * 0.45) : COLORS.cyanDim,
      getWidth: 2.4,
      widthUnits: 'pixels',
      capRounded: true,
      jointRounded: true,
    }),
    new TripsLayer({
      id: 'vpp-local-energy',
      data: localTrips,
      getPath: (trip) => trip.path,
      getTimestamps: (trip) => trip.timestamps,
      getColor: COLORS.cyanDim,
      getWidth: 2.2,
      widthUnits: 'pixels',
      currentTime: tripTime,
      trailLength: 1050,
      fadeTrail: true,
      capRounded: true,
      jointRounded: true,
    }),
    new TripsLayer({
      id: 'vpp-regional-energy',
      data: regionalTrips,
      getPath: (trip) => trip.path,
      getTimestamps: (trip) => trip.timestamps,
      getColor: stage === 4 ? capabilityColor : COLORS.amber,
      getWidth: 5.4,
      widthUnits: 'pixels',
      currentTime: tripTime,
      trailLength: 2300,
      fadeTrail: true,
      capRounded: true,
      jointRounded: true,
    }),
    new ScatterplotLayer({
      id: 'vpp-homes',
      data: homes,
      getPosition: ({ position }) => position,
      getRadius: 1800,
      radiusUnits: 'meters',
      getFillColor: COLORS.home,
      getLineColor: COLORS.cyan,
      lineWidthMinPixels: 1.5,
      stroked: true,
    }),
    new ScatterplotLayer({
      id: 'vpp-generators',
      data: generators,
      getPosition: ({ position }) => position,
      getRadius: 6200,
      radiusUnits: 'meters',
      getFillColor: COLORS.amber,
      getLineColor: [254, 243, 199, 255],
      lineWidthMinPixels: 2,
      stroked: true,
    }),
    new ScatterplotLayer({
      id: 'vpp-grid-hubs',
      data: hubs,
      getPosition: ({ position }) => position,
      getRadius: 7800,
      radiusUnits: 'meters',
      getFillColor: stage === 4 ? capabilityColor : COLORS.cyan,
      getLineColor: [224, 242, 254, 255],
      lineWidthMinPixels: 2,
      stroked: true,
    }),
    new ScatterplotLayer({
      id: 'vpp-batteries',
      data: batteries,
      getPosition: ({ position }) => position,
      getRadius: 4200,
      radiusUnits: 'meters',
      getFillColor: controlColor,
      getLineColor: [255, 251, 235, 255],
      lineWidthMinPixels: 2,
      stroked: true,
    }),
    new PathLayer({
      id: 'vpp-control-links',
      data: stage === 4 && settled > 0.06 ? VPP_CONTROL_LINKS : [],
      getPath: ({ path }) => path,
      getColor: capabilityColor,
      getWidth: 3,
      widthUnits: 'pixels',
      capRounded: true,
      jointRounded: true,
    }),
    new TextLayer({
      id: 'vpp-battery-icons',
      data: batteries,
      getPosition: ({ position }) => position,
      getText: () => '▣',
      getSize: 13,
      getColor: [5, 8, 20, 255],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 800,
    }),
  ];
};
