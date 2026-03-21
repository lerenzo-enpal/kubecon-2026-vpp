// 2017 SA Heatwave — load shedding event, 90,000 homes lost power
import React from 'react';
import CascadeMap from './CascadeMap';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

// ── Camera presets ──────────────────────────────────────────
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: 138.5, latitude: -34.0, zoom: 6.2, pitch: 35, bearing: -5 },
};

// ── Infrastructure: SA nodes with Adelaide-area additions ───
const NODES: CascadeNode[] = [
  { id: 'torrens',    pos: [138.523, -34.807], type: 'gas',  cap: 1280, name: 'Torrens Island' },
  { id: 'pelican',    pos: [138.506, -34.765], type: 'gas',  cap: 480,  name: 'Pelican Point' },
  { id: 'osborne',    pos: [138.508, -34.798], type: 'gas',  cap: 180,  name: 'Osborne' },
  { id: 'hornsdale',  pos: [138.540, -33.056], type: 'wind', cap: 315,  name: 'Hornsdale' },
  { id: 'snowtown',   pos: [138.135, -33.732], type: 'wind', cap: 369,  name: 'Snowtown 1&2' },
  { id: 'hallett1',   pos: [138.708, -33.316], type: 'wind', cap: 95,   name: 'Hallett 1' },
  { id: 'hallett2',   pos: [138.864, -33.564], type: 'wind', cap: 71,   name: 'Hallett 2' },
  { id: 'northbrown', pos: [138.704, -33.299], type: 'wind', cap: 132,  name: 'North Brown Hill' },
  { id: 'bluff',      pos: [138.792, -33.383], type: 'wind', cap: 53,   name: 'The Bluff' },
  { id: 'clements',   pos: [138.151, -33.721], type: 'wind', cap: 57,   name: 'Clements Gap' },
  { id: 'waterloo',   pos: [138.900, -33.980], type: 'wind', cap: 111,  name: 'Waterloo' },
  { id: 'canunda',    pos: [140.417, -37.810], type: 'wind', cap: 46,   name: 'Canunda' },
  { id: 'lakebonney', pos: [140.407, -37.771], type: 'wind', cap: 279,  name: 'Lake Bonney 1-3' },
  { id: 'davenport',  pos: [137.820, -32.510], type: 'sub',  cap: 0,    name: 'Davenport Sub' },
  { id: 'belalie',    pos: [138.500, -33.150], type: 'sub',  cap: 0,    name: 'Belalie Sub' },
  { id: 'para',       pos: [138.630, -34.730], type: 'sub',  cap: 0,    name: 'Para Sub' },
  { id: 'heywood',    pos: [140.841, -37.733], type: 'ic',   cap: 460,  name: 'Heywood IC' },
  // Adelaide distribution nodes (load shedding areas)
  { id: 'adelaide_n', pos: [138.60, -34.84],   type: 'load', cap: 0,    name: 'Adelaide North' },
  { id: 'adelaide_s', pos: [138.55, -35.02],   type: 'load', cap: 0,    name: 'Adelaide South' },
  { id: 'adelaide_w', pos: [138.48, -34.92],   type: 'load', cap: 0,    name: 'Adelaide West' },
];

const LINES: [string, string][] = [
  ['davenport', 'belalie'], ['belalie', 'hallett1'], ['belalie', 'northbrown'],
  ['belalie', 'snowtown'], ['belalie', 'para'], ['para', 'torrens'],
  ['para', 'pelican'], ['para', 'osborne'], ['hornsdale', 'davenport'],
  ['hallett2', 'belalie'], ['bluff', 'belalie'], ['clements', 'snowtown'],
  ['waterloo', 'para'], ['lakebonney', 'heywood'], ['canunda', 'heywood'],
  ['heywood', 'para'],
  // Adelaide distribution
  ['para', 'adelaide_n'], ['torrens', 'adelaide_n'],
  ['adelaide_n', 'adelaide_s'], ['adelaide_n', 'adelaide_w'],
];

// ── Cascade timeline: heat -> demand surge -> load shedding ──
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['hornsdale', 'snowtown', 'hallett1', 'hallett2', 'northbrown', 'bluff', 'clements'],
                                              ts: 'FEB 8 PM',   label: 'Wind output collapses to 96 MW',       detail: 'Forecast missed -- calm conditions across SA',   freq: 50.0 },
  { time: 2,  ids: ['pelican'],               ts: '~17:30',      label: 'Pelican Point idle -- gas sold elsewhere', detail: 'Owner finds spot gas market more profitable',    freq: 49.95 },
  { time: 4,  ids: [],                        ts: '~18:00',      label: 'Demand hits 3,100 MW -- P10 extreme',   detail: '42.4C in Adelaide -- AC load surging',           freq: 49.85 },
  { time: 6,  ids: [],                        ts: '18:03',       label: 'AEMO orders 100 MW load shedding',       detail: 'Grid reserves insufficient for demand',          freq: 49.75 },
  { time: 8,  ids: ['adelaide_n', 'adelaide_w', 'adelaide_s'],
                                              ts: '18:03-18:30', label: 'Software error -- 300 MW shed instead',  detail: '90,000 homes lose power -- 3x the order',        freq: 49.70 },
  { time: 10, ids: [],                        ts: '18:30',       label: 'Restoration begins -- load reconnecting', detail: 'AEMO requests 100 MW restore over 10 min',       freq: 49.85 },
  { time: 12, ids: [],                        ts: '18:40',       label: 'Full power restored -- all homes back',  detail: 'Political crisis begins -- battery commissioned', freq: 50.0 },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS: LogMessage[] = [
  { time: 0.3,  text: 'BOM SEVERE HEAT WARNING -- ADELAIDE 42.4C', level: 'warn' },
  { time: 0.8,  text: 'WIND GENERATION: 96 MW (FORECAST: 350 MW)', level: 'warn' },
  { time: 1.5,  text: 'SA WIND FARMS BELOW MINIMUM OUTPUT', level: 'warn' },
  { time: 2.3,  text: 'PELICAN POINT GAS -- UNIT 2 MOTHBALLED', level: 'warn' },
  { time: 3.0,  text: 'GAS SOLD ON SPOT MARKET -- NOT GENERATING', level: 'crit' },
  { time: 4.0,  text: 'DEMAND APPROACHING 3,100 MW -- P10 LEVEL', level: 'crit' },
  { time: 4.5,  text: 'AIR CONDITIONING LOAD EXCEEDING ALL FORECASTS', level: 'crit' },
  { time: 5.5,  text: 'RESERVE MARGIN: CRITICAL', level: 'crit' },
  { time: 6.5,  text: 'AEMO DIRECTIVE: SHED 100 MW LOAD', level: 'crit' },
  { time: 7.5,  text: 'SA POWER NETWORKS EXECUTING LOAD SHED', level: 'crit' },
  { time: 8.5,  text: 'SOFTWARE ERROR: 300 MW SHED (3x ORDERED)', level: 'crit' },
  { time: 9.0,  text: '90,000 HOMES WITHOUT POWER', level: 'crit' },
  { time: 10.5, text: 'AEMO: BEGIN LOAD RESTORATION 100 MW/10 MIN', level: 'warn' },
  { time: 12.0, text: 'ALL CUSTOMERS RESTORED -- INQUIRY LAUNCHED', level: 'info' },
];

const TYPE_COLORS: Record<string, number[]> = {
  wind: [96, 165, 250],
  gas: [251, 146, 60],
  sub: [148, 163, 184],
  ic: [167, 139, 250],
  load: [239, 68, 68],
};

const LEGEND: LegendItem[] = [
  { c: 'rgb(96,165,250)', l: 'Wind' }, { c: 'rgb(251,146,60)', l: 'Gas' },
  { c: 'rgb(148,163,184)', l: 'Substation' }, { c: 'rgb(167,139,250)', l: 'Interconnector' },
  { c: 'rgb(239,68,68)', l: 'Load Shed' },
];

// ── Frequency from cascade steps ────────────────────────────
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 50.0;
};

// ── Offline: track households (up to 90,000) ────────────────
const computeOffline: OfflineComputer = ({ failed }) => {
  const loadNodes = ['adelaide_n', 'adelaide_w', 'adelaide_s'];
  const shedCount = loadNodes.filter(id => failed.has(id)).length;
  return Math.min(90000, shedCount * 30000);
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq < 49.75) return 'LOAD SHEDDING';
  if (freq < 49.9) return 'WARNING';
  return 'NOMINAL';
};

const computeDanger: DangerComputer = ({ running, freq }) => {
  const inDanger = running && freq < 49.8;
  const freqColor = freq < 49.75 ? '#ef4444' : freq < 49.9 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

// Show banner when load shedding is active (Adelaide nodes failed)
const bannerShowCondition: BannerShowCondition = ({ running, elapsed }) => running && elapsed >= 8 && elapsed < 10;

// ── Node overrides ──────────────────────────────────────────
const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => failed.has(node.id) && node.type === 'load',
  getFillColor: (node, ctx) => {
    // Load shed areas flash red
    if (node.type === 'load' && ctx.failed.has(node.id)) return [239, 68, 68, 180];
    // Wind farms that collapsed get dim
    if (node.type === 'wind' && ctx.failed.has(node.id)) return [96, 165, 250, 60];
    // Pelican Point idle
    if (node.id === 'pelican' && ctx.failed.has('pelican')) return [251, 146, 60, 60];
    return undefined;
  },
  getLineColor: (node, ctx) => {
    if (node.type === 'load' && ctx.failed.has(node.id)) return [239, 68, 68, 200];
    if (node.type === 'wind' && ctx.failed.has(node.id)) return [96, 165, 250, 60];
    if (node.id === 'pelican' && ctx.failed.has('pelican')) return [251, 146, 60, 60];
    return undefined;
  },
  getRadius: (node, ctx) => {
    if (node.type === 'load') return 5000;
    if (node.type === 'sub') return 3000;
    return undefined;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 8.0], [1.5, 7.2], [3, 6.5]],
  fallbackZoom: 6.0,
  overviewFromEnd: 1,
  pitch: 35,
  bearing: -5,
};

// ── Main component ──────────────────────────────────────────
export default function SAHeatwaveCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
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
      monitorName="AEMO SA MONITOR"
      dateText="FEB 2017"
      playButtonLabel="HEATWAVE"
      bootInitText="AEMO SA MONITOR v1.2 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${LINES.length} | STATUS: OK`}
      compactSummary="90,000 HOMES -- LOAD SHEDDING"
      compactElapsed={14}
      bannerText="90,000 HOMES -- LOAD SHEDDING"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="HOMES OFFLINE"
      offlineUnit=""
      offlineMax={90000}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
    />
  );
}
