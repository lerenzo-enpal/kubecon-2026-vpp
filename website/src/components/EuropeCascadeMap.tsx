// TODO: Shared between website and presentation — combine into shared component
import React from 'react';
import CascadeMap from './CascadeMap';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

// -- Camera presets --
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: 12.0, latitude: 49.0, zoom: 4.2, pitch: 20, bearing: 0 },
};

// -- Infrastructure data (verified from UCTE Final Report) --
const NODES: CascadeNode[] = [
  // Critical substations
  { id: 'landesbergen',  pos: [9.124, 52.538],  type: 'substation', cap: 0, name: 'Landesbergen' },
  { id: 'conneforde',    pos: [8.054, 53.334],  type: 'substation', cap: 0, name: 'Conneforde' },
  { id: 'diele',         pos: [7.52, 53.28],    type: 'substation', cap: 0, name: 'Diele' },
  { id: 'wehrendorf',    pos: [8.88, 52.28],    type: 'substation', cap: 0, name: 'Wehrendorf' },
  { id: 'ernestinovo',   pos: [18.663, 45.473], type: 'boundary',   cap: 0, name: 'Ernestinovo' },

  // Major grid hubs (verified city centers)
  { id: 'hamburg',   pos: [10.0, 53.55],   type: 'hub', cap: 0, name: 'Hamburg' },
  { id: 'berlin',    pos: [13.405, 52.52],  type: 'hub', cap: 0, name: 'Berlin' },
  { id: 'munich',    pos: [11.58, 48.14],   type: 'hub', cap: 0, name: 'Munich' },
  { id: 'paris',     pos: [2.35, 48.86],    type: 'hub', cap: 0, name: 'Paris' },
  { id: 'madrid',    pos: [-3.70, 40.42],   type: 'hub', cap: 0, name: 'Madrid' },
  { id: 'rome',      pos: [12.50, 41.90],   type: 'hub', cap: 0, name: 'Rome' },
  { id: 'warsaw',    pos: [21.01, 52.23],   type: 'hub', cap: 0, name: 'Warsaw' },
  { id: 'prague',    pos: [14.44, 50.08],   type: 'hub', cap: 0, name: 'Prague' },
  { id: 'vienna',    pos: [16.37, 48.21],   type: 'hub', cap: 0, name: 'Vienna' },
  { id: 'budapest',  pos: [19.04, 47.50],   type: 'hub', cap: 0, name: 'Budapest' },
  { id: 'bucharest', pos: [26.10, 44.43],   type: 'hub', cap: 0, name: 'Bucharest' },
  { id: 'zagreb',    pos: [15.98, 45.81],   type: 'hub', cap: 0, name: 'Zagreb' },
];

// -- Transmission lines (verified topology from UCTE report) --
const EUROPE_LINES: [string, string][] = [
  ['conneforde', 'diele'],
  ['conneforde', 'hamburg'],
  ['landesbergen', 'wehrendorf'],
  ['landesbergen', 'conneforde'],
  ['hamburg', 'berlin'],
  ['berlin', 'warsaw'],
  ['berlin', 'prague'],
  ['munich', 'vienna'],
  ['vienna', 'budapest'],
  ['budapest', 'bucharest'],
  ['budapest', 'zagreb'],
  ['zagreb', 'ernestinovo'],
  ['paris', 'munich'],
  ['madrid', 'paris'],
  ['rome', 'munich'],
  ['prague', 'warsaw'],
];

// -- Cascade timeline (from UCTE Final Report) --
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['conneforde', 'diele'],                        ts: '22:10:00', label: 'Conneforde-Diele 380kV disconnected',              detail: 'E.ON switching for Ems cruise ship passage',      freq: 50.0 },
  { time: 3,  ids: ['landesbergen', 'wehrendorf'],                 ts: '22:10:06', label: 'Landesbergen-Wehrendorf 380kV overloads',           detail: 'N-1 criterion violated',                          freq: 49.8 },
  { time: 6,  ids: ['conneforde', 'landesbergen', 'hamburg'],      ts: '22:10:13', label: 'Lower Saxony corridor cascades',                   detail: 'Multiple 380kV lines trip in sequence',            freq: 49.5 },
  { time: 9,  ids: ['ernestinovo', 'vienna', 'munich', 'zagreb'],  ts: '22:10:22', label: 'Split propagates along Ernestinovo boundary',      detail: 'Germany fractures, south-east separates',          freq: 49.2 },
  { time: 11, ids: ['berlin', 'warsaw', 'prague', 'budapest', 'bucharest'], ts: '22:10:28', label: 'THREE ISLANDS FORM',                      detail: 'West 49.0 Hz / NE 51.4 Hz / SE ~49.7 Hz',         freq: 49.0 },
  { time: 13, ids: ['paris', 'madrid', 'rome'],                    ts: '22:10:30', label: '15M households affected',                          detail: 'Emergency load shedding across Western Europe',    freq: 49.0 },
];

// -- Terminal log messages matching real event --
const LOG_MSGS: LogMessage[] = [
  { time: 0.3,  text: '22:10 CET -- E.ON SWITCHING: CONNEFORDE-DIELE 380kV DISCONNECTED', level: 'warn' },
  { time: 1.5,  text: 'EMS RIVER CROSSING CLEAR FOR CRUISE SHIP PASSAGE', level: 'warn' },
  { time: 3.3,  text: 'LANDESBERGEN-WEHRENDORF 380kV OVERLOAD DETECTED', level: 'crit' },
  { time: 4.0,  text: 'N-1 CRITERION VIOLATED -- NO SAFETY MARGIN', level: 'crit' },
  { time: 6.3,  text: 'CASCADE TRIP SPREADING THROUGH LOWER SAXONY', level: 'crit' },
  { time: 7.0,  text: 'MULTIPLE 380kV LINES TRIPPING IN SEQUENCE', level: 'crit' },
  { time: 9.3,  text: 'SPLIT AT ERNESTINOVO -- GRID FRACTURING', level: 'crit' },
  { time: 10.0, text: 'GERMANY SEPARATED ALONG NORTH-SOUTH BOUNDARY', level: 'crit' },
  { time: 11.3, text: 'THREE FREQUENCY ISLANDS FORMED', level: 'crit' },
  { time: 11.8, text: 'WEST: 49.0 Hz -- NE: 51.4 Hz -- SE: ~49.7 Hz', level: 'crit' },
  { time: 13.3, text: '15M HOUSEHOLDS AFFECTED -- LOAD SHEDDING ACTIVE', level: 'crit' },
  { time: 13.8, text: 'UFLS ACTIVATED IN WESTERN EUROPE', level: 'crit' },
];

// -- Type colors --
const TYPE_COLORS: Record<string, number[]> = {
  substation: [34, 211, 238],
  hub: [148, 163, 184],
  boundary: [245, 158, 11],
};

// -- Legend --
const LEGEND: LegendItem[] = [
  { c: 'rgb(34,211,238)', l: 'Substation' },
  { c: 'rgb(148,163,184)', l: 'City Hub' },
  { c: 'rgb(245,158,11)', l: 'Split Boundary' },
];

// -- Freq from cascade step --
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 50.0;
};

// -- Offline: 17 GW emergency load shedding --
const computeOffline: OfflineComputer = ({ failed }) => {
  return Math.min(17, Math.floor((failed.size / NODES.length) * 17));
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq <= 49.0) return 'GRID SPLIT';
  if (freq < 49.5) return 'WARNING';
  if (freq < 49.8) return 'ALERT';
  return 'NOMINAL';
};

const computeDanger: DangerComputer = ({ running, freq }) => {
  const inDanger = running && freq <= 49.0;
  const freqColor = freq <= 49.0 ? '#ef4444' : freq < 49.5 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, freq }) => running && freq <= 49.0;

// -- Node overrides: boundary nodes get amber highlight --
const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => failed.has(node.id),
  getRadius: (node) => {
    if (node.type === 'substation') return 3000;
    if (node.type === 'boundary') return 4000;
    return undefined;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 5.5], [1.5, 5.0], [3, 4.5]],
  fallbackZoom: 4.2,
  overviewFromEnd: 1,
  pitch: 20,
  bearing: 0,
};

// -- Main component --
export default function EuropeCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
  return (
    <CascadeMap
      width={width}
      height={height}
      variant="hud"
      nodes={NODES}
      lines={EUROPE_LINES}
      cascade={CASCADE}
      logMessages={LOG_MSGS}
      views={VIEWS}
      typeColors={TYPE_COLORS}
      legendItems={LEGEND}
      monitorName="UCTE GRID MONITOR"
      dateText="NOV 2006"
      playButtonLabel="GRID SPLIT"
      bootInitText="UCTE GRID MONITOR v1.0 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${EUROPE_LINES.length} | STATUS: OK`}
      compactSummary="3 ISLANDS -- 15M HOUSEHOLDS AFFECTED"
      compactElapsed={15}
      bannerText="GRID SPLIT -- 3 FREQUENCY ISLANDS"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="LOAD SHEDDING"
      offlineUnit="GW"
      offlineMax={17}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
    />
  );
}
