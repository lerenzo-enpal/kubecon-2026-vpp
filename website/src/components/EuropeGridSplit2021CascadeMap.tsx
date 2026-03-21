// 2021 European Grid Split -- Ernestinovo busbar coupler trip
// Two synchronous islands: NW (underfrequency) and SE (overfrequency)
import React, { useRef } from 'react';
import CascadeMap from './CascadeMap';
import { PolygonLayer } from '@deck.gl/layers';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

// -- Camera presets --
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: 15, latitude: 47, zoom: 4.0, pitch: 20, bearing: 0 },
};

// -- Infrastructure data --
// Ernestinovo substation (origin) + major cities on each side of the split
const NODES: CascadeNode[] = [
  // Origin -- Croatian substation where busbar coupler tripped
  { id: 'ernestinovo', pos: [18.663, 45.473], type: 'boundary', cap: 0, name: 'Ernestinovo' },

  // NW Island cities (underfrequency -- 49.74 Hz)
  { id: 'paris',      pos: [2.35, 48.86],   type: 'hub-nw', cap: 0, name: 'Paris' },
  { id: 'madrid',     pos: [-3.70, 40.42],  type: 'hub-nw', cap: 0, name: 'Madrid' },
  { id: 'lisbon',     pos: [-9.14, 38.74],  type: 'hub-nw', cap: 0, name: 'Lisbon' },
  { id: 'rome',       pos: [12.50, 41.90],  type: 'hub-nw', cap: 0, name: 'Rome' },
  { id: 'berlin',     pos: [13.405, 52.52], type: 'hub-nw', cap: 0, name: 'Berlin' },
  { id: 'amsterdam',  pos: [4.90, 52.37],   type: 'hub-nw', cap: 0, name: 'Amsterdam' },
  { id: 'munich',     pos: [11.58, 48.14],  type: 'hub-nw', cap: 0, name: 'Munich' },
  { id: 'prague',     pos: [14.44, 50.08],  type: 'hub-nw', cap: 0, name: 'Prague' },
  { id: 'vienna',     pos: [16.37, 48.21],  type: 'hub-nw', cap: 0, name: 'Vienna' },
  { id: 'brussels',   pos: [4.35, 50.85],   type: 'hub-nw', cap: 0, name: 'Brussels' },

  // SE Island cities (overfrequency -- 50.6 Hz)
  { id: 'zagreb',     pos: [15.98, 45.81],  type: 'hub-se', cap: 0, name: 'Zagreb' },
  { id: 'budapest',   pos: [19.04, 47.50],  type: 'hub-se', cap: 0, name: 'Budapest' },
  { id: 'bucharest',  pos: [26.10, 44.43],  type: 'hub-se', cap: 0, name: 'Bucharest' },
  { id: 'belgrade',   pos: [20.46, 44.82],  type: 'hub-se', cap: 0, name: 'Belgrade' },
  { id: 'athens',     pos: [23.73, 37.98],  type: 'hub-se', cap: 0, name: 'Athens' },
  { id: 'istanbul',   pos: [28.98, 41.01],  type: 'hub-se', cap: 0, name: 'Istanbul' },
  { id: 'sofia',      pos: [23.32, 42.70],  type: 'hub-se', cap: 0, name: 'Sofia' },
  { id: 'sarajevo',   pos: [18.41, 43.86],  type: 'hub-se', cap: 0, name: 'Sarajevo' },

  // Key substations along the split boundary
  { id: 'subotica',   pos: [19.66, 46.10],  type: 'substation', cap: 0, name: 'Subotica' },
  { id: 'novisad',    pos: [19.84, 45.25],  type: 'substation', cap: 0, name: 'Novi Sad' },
];

// -- Transmission lines --
const LINES: [string, string][] = [
  // NW island internal
  ['paris', 'brussels'], ['brussels', 'amsterdam'], ['amsterdam', 'berlin'],
  ['berlin', 'prague'], ['prague', 'vienna'], ['vienna', 'munich'],
  ['munich', 'rome'], ['paris', 'madrid'], ['madrid', 'lisbon'],
  ['paris', 'munich'], ['berlin', 'munich'], ['brussels', 'paris'],
  // SE island internal
  ['zagreb', 'budapest'], ['budapest', 'bucharest'], ['belgrade', 'bucharest'],
  ['belgrade', 'sofia'], ['sofia', 'athens'], ['sofia', 'istanbul'],
  ['sarajevo', 'belgrade'], ['zagreb', 'sarajevo'],
  // Boundary links (these trip during cascade)
  ['ernestinovo', 'zagreb'], ['ernestinovo', 'subotica'],
  ['subotica', 'novisad'], ['novisad', 'belgrade'],
  ['subotica', 'budapest'],
  // Cross-boundary (these break)
  ['vienna', 'budapest'], ['ernestinovo', 'sarajevo'],
];

// -- Cascade timeline (42.7 seconds real-time, mapped to animation steps) --
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['ernestinovo'],                     ts: '14:04:25', label: 'Busbar coupler trips at Ernestinovo',             detail: 'Overcurrent relay opens 400 kV coupler',            freq: 50.0 },
  { time: 2,  ids: ['subotica', 'novisad'],             ts: '14:04:48', label: '400 kV Subotica-Novi Sad line trips',              detail: 'Overcurrent as power shifts to parallel paths',     freq: 49.95 },
  { time: 4,  ids: ['belgrade', 'sarajevo'],            ts: '14:04:57', label: 'Serbian and Bosnian lines overload',               detail: 'Turkish 975 MW generator trips on overfrequency',   freq: 49.85 },
  { time: 6,  ids: ['zagreb', 'budapest'],              ts: '14:05:08', label: 'Grid splits -- two asynchronous islands form',     detail: 'Croatia/Hungary/Romania boundary fractures',        freq: 49.74 },
  { time: 8,  ids: ['bucharest', 'sofia', 'athens', 'istanbul'], ts: '14:05:10', label: 'SE island stabilizes at 50.6 Hz',        detail: '6.3 GW surplus in southeast island',                freq: 49.74 },
  { time: 10, ids: ['paris', 'madrid', 'lisbon', 'rome', 'berlin', 'amsterdam', 'munich', 'prague', 'vienna', 'brussels'], ts: '14:05:15', label: 'NW island activates emergency reserves', detail: 'France 1,300 MW + Italy 1,000 MW + Nordic 420 MW', freq: 49.74 },
];

// -- Terminal log messages --
const LOG_MSGS: LogMessage[] = [
  { time: 0.3,  text: '14:04 CET -- HEAVY SE-TO-NW POWER FLOWS DETECTED', level: 'warn' },
  { time: 0.8,  text: 'GRIDRADAR: PHASE ANGLE SHIFT IN ROMANIA', level: 'warn' },
  { time: 1.5,  text: 'ERNESTINOVO 400KV BUSBAR COUPLER -- OVERCURRENT TRIP', level: 'crit' },
  { time: 2.3,  text: 'SUBOTICA-NOVI SAD 400KV -- TRIPPED ON OVERCURRENT', level: 'crit' },
  { time: 3.0,  text: 'POWER FLOW REDISTRIBUTING TO PARALLEL PATHS', level: 'crit' },
  { time: 4.3,  text: 'TURKEY: 975 MW GENERATOR TRIP -- OVERFREQUENCY', level: 'crit' },
  { time: 4.8,  text: 'SERBIAN TRANSMISSION LINES OVERLOADING', level: 'crit' },
  { time: 6.3,  text: 'GRID SEPARATION CONFIRMED -- TWO ISLANDS', level: 'crit' },
  { time: 6.8,  text: 'NW ISLAND: 49.74 Hz -- SE ISLAND: 50.6 Hz', level: 'crit' },
  { time: 7.5,  text: '6.3 GW IMBALANCE BETWEEN ISLANDS', level: 'crit' },
  { time: 8.3,  text: 'SE ISLAND STABILIZING -- OVERFREQUENCY CONTROLLED', level: 'warn' },
  { time: 10.3, text: 'FRANCE: 1,300 MW INTERRUPTIBLE LOAD ACTIVATED', level: 'warn' },
  { time: 10.8, text: 'ITALY: 1,000 MW EMERGENCY RESERVES ONLINE', level: 'warn' },
  { time: 11.3, text: 'NORDIC HVDC: 420 MW INJECTED TO NW ISLAND', level: 'warn' },
  { time: 12.0, text: 'UFLS ACTIVE -- 233 MW CONSUMER DISCONNECTIONS', level: 'crit' },
  { time: 13.0, text: 'FREQUENCY STABILIZED -- RESYNC IN PROGRESS', level: 'warn' },
];

// -- Type colors --
const TYPE_COLORS: Record<string, number[]> = {
  'hub-nw':     [96, 165, 250],   // blue -- NW island (underfrequency)
  'hub-se':     [251, 146, 60],   // amber -- SE island (overfrequency)
  substation:   [148, 163, 184],  // slate -- boundary substations
  boundary:     [245, 158, 11],   // amber -- Ernestinovo origin
};

// -- Legend --
const LEGEND: LegendItem[] = [
  { c: 'rgba(96,165,250,0.35)', l: 'NW Island (49.74 Hz)' },
  { c: 'rgba(251,146,60,0.35)', l: 'SE Island (50.6 Hz)' },
  { c: 'rgb(245,158,11)', l: 'Split Origin' },
];

// -- Spreading polygon overlays for the two islands --
// Both expand outward from Ernestinovo as the split propagates
type IslandZone = {
  step: number;
  polygon: [number, number][];
  color: [number, number, number, number]; // RGBA
  lineColor: [number, number, number, number];
};

const ISLAND_ZONES: IslandZone[] = [
  // -- NW Island (blue/cyan) -- grows westward from split boundary --

  // Step 2: Initial NW separation zone near boundary
  {
    step: 2,
    color: [96, 165, 250, 15],
    lineColor: [96, 165, 250, 60],
    polygon: [
      [16.0, 49.5], [18.0, 46.0], [16.0, 44.5],
      [13.0, 44.0], [10.0, 46.0], [10.0, 49.0],
      [13.0, 50.5], [16.0, 49.5],
    ],
  },
  // Step 4: NW expands to central Europe
  {
    step: 3,
    color: [96, 165, 250, 20],
    lineColor: [96, 165, 250, 70],
    polygon: [
      [16.5, 52.0], [18.0, 46.0], [16.0, 44.0],
      [12.0, 41.5], [8.0, 43.0], [2.0, 47.0],
      [2.0, 50.0], [5.0, 52.5], [10.0, 53.5],
      [14.5, 52.5], [16.5, 52.0],
    ],
  },
  // Step 5: Full NW island -- all of western/central/northern Europe
  {
    step: 5,
    color: [96, 165, 250, 25],
    lineColor: [96, 165, 250, 80],
    polygon: [
      [-10.0, 39.0], [-10.0, 43.0], [-5.0, 44.0],
      [-2.0, 47.0], [0.0, 50.0], [3.0, 53.0],
      [6.0, 54.0], [10.0, 55.0], [14.0, 53.0],
      [16.5, 52.0], [17.5, 49.0], [18.0, 46.0],
      [16.0, 44.0], [14.0, 42.0], [12.0, 40.0],
      [10.0, 38.5], [6.0, 37.0], [0.0, 37.5],
      [-5.0, 37.0], [-10.0, 39.0],
    ],
  },

  // -- SE Island (amber/orange) -- grows eastward from split boundary --

  // Step 2: Initial SE separation zone near Ernestinovo
  {
    step: 2,
    color: [251, 146, 60, 15],
    lineColor: [251, 146, 60, 60],
    polygon: [
      [18.5, 46.5], [20.0, 47.0], [21.0, 46.0],
      [21.0, 44.5], [19.5, 43.5], [18.0, 43.5],
      [17.5, 44.5], [18.0, 46.0], [18.5, 46.5],
    ],
  },
  // Step 3: SE expands through Balkans
  {
    step: 3,
    color: [251, 146, 60, 20],
    lineColor: [251, 146, 60, 70],
    polygon: [
      [18.5, 46.5], [20.0, 48.0], [22.0, 47.0],
      [25.0, 45.0], [24.0, 42.5], [21.0, 41.0],
      [18.5, 42.0], [17.5, 44.0], [18.0, 46.0],
      [18.5, 46.5],
    ],
  },
  // Step 4: Full SE island -- Balkans, Greece, Turkey, Romania
  {
    step: 4,
    color: [251, 146, 60, 25],
    lineColor: [251, 146, 60, 80],
    polygon: [
      [18.0, 46.5], [19.5, 48.0], [22.0, 48.0],
      [26.0, 46.0], [29.0, 44.0], [30.0, 42.0],
      [29.5, 40.5], [27.0, 38.0], [24.0, 37.0],
      [21.0, 37.5], [19.0, 39.0], [17.5, 41.0],
      [16.5, 43.5], [17.0, 45.0], [18.0, 46.5],
    ],
  },
];

// -- Map step index to the set of node IDs that have failed --
const STEP_FAIL_THRESHOLDS = CASCADE.reduce<{ step: number; count: number }[]>((acc, s, i) => {
  const prev = i > 0 ? acc[i - 1].count : 0;
  acc.push({ step: i, count: prev + s.ids.length });
  return acc;
}, []);

function getActiveStepFromFailed(failedCount: number): number {
  for (let i = STEP_FAIL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (failedCount >= STEP_FAIL_THRESHOLDS[i].count) return i;
  }
  return -1;
}

// -- Frequency: NW island underfrequency from cascade steps --
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 50.0;
};

// -- Offline: 6.3 GW imbalance --
const computeOffline: OfflineComputer = ({ failed }) => {
  return Math.min(6300, Math.floor((failed.size / NODES.length) * 6300));
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq <= 49.74) return 'GRID SPLIT';
  if (freq < 49.9) return 'WARNING';
  return 'NOMINAL';
};

const computeDanger: DangerComputer = ({ running, freq }) => {
  const inDanger = running && freq <= 49.74;
  const freqColor = freq <= 49.74 ? '#f59e0b' : freq < 49.9 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#f59e0b' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(245,158,11,0.5)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, freq }) => running && freq <= 49.74;

// -- Node overrides --
const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => failed.has(node.id) && node.type === 'boundary',
  getRadius: (node) => {
    if (node.type === 'boundary') return 5000;
    if (node.type === 'substation') return 3000;
    return 8000;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 5.5], [1.5, 5.0], [3, 4.5]],
  fallbackZoom: 4.0,
  overviewFromEnd: 1,
  pitch: 20,
  bearing: 0,
};

// -- Main component --
export default function EuropeGridSplit2021CascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
  const stepRef = useRef(-1);

  const computeOfflineTracked: OfflineComputer = (ctx) => {
    stepRef.current = getActiveStepFromFailed(ctx.failed.size);
    return computeOffline(ctx);
  };

  // Build polygon layers for both islands
  const visibleZones = ISLAND_ZONES.filter(z => stepRef.current >= z.step);
  const polygonLayers = visibleZones.map((zone, i) => (
    new PolygonLayer({
      id: `island-zone-${i}`,
      data: [{ polygon: zone.polygon }],
      getPolygon: (d: any) => d.polygon,
      getFillColor: zone.color,
      getLineColor: zone.lineColor,
      getLineWidth: 2,
      lineWidthMinPixels: 1,
      filled: true,
      stroked: true,
      pickable: false,
    })
  ));

  return (
    <CascadeMap
      width={width}
      height={height}
      variant="hud"
      nodes={NODES}
      lines={LINES}
      cascade={CASCADE}
      logMessages={LOG_MSGS}
      views={VIEWS}
      typeColors={TYPE_COLORS}
      legendItems={LEGEND}
      monitorName="ENTSO-E GRID MONITOR"
      dateText="JAN 2021"
      playButtonLabel="GRID SPLIT"
      bootInitText="ENTSO-E GRID MONITOR v4.1 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${LINES.length} | STATUS: OK`}
      compactSummary="6.3 GW IMBALANCE -- GRID SPLIT"
      compactElapsed={14}
      bannerText="6.3 GW IMBALANCE -- GRID SPLIT"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOfflineTracked}
      offlineLabel="IMBALANCE"
      offlineUnit="MW"
      offlineMax={6300}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
      extraLayers={polygonLayers}
    />
  );
}
