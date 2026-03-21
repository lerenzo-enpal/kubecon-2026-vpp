// TODO: Shared between website and presentation (SAMapHUD.jsx) — combine into shared component
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

// ── Infrastructure data (from presentation SAMapHUD.jsx) ────
const NODES: CascadeNode[] = [
  { id: 'torrens',    pos: [138.523, -34.807], type: 'gas',   cap: 1280, name: 'Torrens Island' },
  { id: 'pelican',    pos: [138.506, -34.765], type: 'gas',   cap: 480,  name: 'Pelican Point' },
  { id: 'osborne',    pos: [138.508, -34.798], type: 'gas',   cap: 180,  name: 'Osborne' },
  { id: 'hornsdale',  pos: [138.540, -33.056], type: 'wind',  cap: 315,  name: 'Hornsdale' },
  { id: 'snowtown',   pos: [138.135, -33.732], type: 'wind',  cap: 369,  name: 'Snowtown 1&2' },
  { id: 'hallett1',   pos: [138.708, -33.316], type: 'wind',  cap: 95,   name: 'Hallett 1' },
  { id: 'hallett2',   pos: [138.864, -33.564], type: 'wind',  cap: 71,   name: 'Hallett 2' },
  { id: 'northbrown', pos: [138.704, -33.299], type: 'wind',  cap: 132,  name: 'North Brown Hill' },
  { id: 'bluff',      pos: [138.792, -33.383], type: 'wind',  cap: 53,   name: 'The Bluff' },
  { id: 'clements',   pos: [138.151, -33.721], type: 'wind',  cap: 57,   name: 'Clements Gap' },
  { id: 'waterloo',   pos: [138.900, -33.980], type: 'wind',  cap: 111,  name: 'Waterloo', survived: true },
  { id: 'canunda',    pos: [140.417, -37.810], type: 'wind',  cap: 46,   name: 'Canunda', survived: true },
  { id: 'lakebonney', pos: [140.407, -37.771], type: 'wind',  cap: 279,  name: 'Lake Bonney 1-3', survived: true },
  { id: 'davenport',  pos: [137.820, -32.510], type: 'sub',   cap: 0,    name: 'Davenport Sub' },
  { id: 'belalie',    pos: [138.500, -33.150], type: 'sub',   cap: 0,    name: 'Belalie Sub' },
  { id: 'para',       pos: [138.630, -34.730], type: 'sub',   cap: 0,    name: 'Para Sub' },
  { id: 'heywood',    pos: [140.841, -37.733], type: 'ic',    cap: 460,  name: 'Heywood IC' },
];

const SA_LINES: [string, string][] = [
  ['davenport', 'belalie'], ['belalie', 'hallett1'], ['belalie', 'northbrown'],
  ['belalie', 'snowtown'], ['belalie', 'para'], ['para', 'torrens'],
  ['para', 'pelican'], ['para', 'osborne'], ['hornsdale', 'davenport'],
  ['hallett2', 'belalie'], ['bluff', 'belalie'], ['clements', 'snowtown'],
  ['waterloo', 'para'], ['lakebonney', 'heywood'], ['canunda', 'heywood'],
  ['heywood', 'para'],
];

// ── Cascade timeline (43 seconds total) ─────────────────────
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['davenport', 'belalie'],                              ts: '16:17:36', label: '275kV towers collapse -- 3 lines fault',         detail: 'Two tornadoes destroy transmission corridor',    freq: 49.8 },
  { time: 2,  ids: ['hallett1', 'northbrown', 'bluff'],                   ts: '16:17:55', label: '123 MW wind lost -- LVRT protection trips',       detail: 'Voltage ride-through limits exceeded',           freq: 49.5 },
  { time: 4,  ids: ['hornsdale', 'snowtown', 'hallett2', 'clements'],     ts: '16:18:09', label: '456 MW total -- 9 of 13 wind farms down',        detail: 'Cascade in <7 seconds',                          freq: 49.0 },
  { time: 6,  ids: ['heywood'],                                           ts: '16:18:14', label: 'Heywood IC overloads at 850 MW -- trips',        detail: 'Rated 460 MW -- protection relay activates',     freq: 48.2 },
  { time: 8,  ids: ['torrens', 'pelican', 'osborne'],                     ts: '16:18:15', label: 'Adelaide generation fails -- UFLS insufficient', detail: 'Under-frequency load shedding cannot save grid', freq: 47.0 },
  { time: 10, ids: ['para', 'waterloo', 'canunda', 'lakebonney'],         ts: '16:18:16', label: 'SYSTEM BLACK -- 850,000 connections',             detail: '1.7 million people. Total darkness.',            freq: 0 },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS: LogMessage[] = [
  { time: 0.3,  text: '16:18 ACST -- TORNADO WARNING ACTIVE -- MID-NORTH SA', level: 'warn' },
  { time: 0.8,  text: '275kV DAVENPORT-BELALIE -- TOWER COLLAPSE DETECTED', level: 'crit' },
  { time: 2.3,  text: 'WIND FARM LVRT PROTECTION -- HALLETT 1 TRIP', level: 'warn' },
  { time: 2.8,  text: 'NORTH BROWN HILL + BLUFF -- DISCONNECTED', level: 'warn' },
  { time: 3.2,  text: '123 MW WIND GENERATION LOST IN <2 SECONDS', level: 'crit' },
  { time: 4.3,  text: 'HORNSDALE WIND FARM -- TRIP -- 86 MW LOST', level: 'crit' },
  { time: 4.8,  text: 'SNOWTOWN 2 -- TRIP -- 106 MW LOST', level: 'crit' },
  { time: 5.5,  text: '456 MW TOTAL WIND OFFLINE -- 9 OF 13 FARMS', level: 'crit' },
  { time: 6.3,  text: 'HEYWOOD IC LOADING: 850 MW (RATED 460 MW)', level: 'crit' },
  { time: 6.8,  text: 'HEYWOOD PROTECTION RELAY -- TRIPPED', level: 'crit' },
  { time: 7.5,  text: 'SA ISLANDED FROM NEM -- NO INTERCONNECTION', level: 'crit' },
  { time: 8.5,  text: 'UFLS ACTIVATED -- INSUFFICIENT LOAD SHED', level: 'crit' },
  { time: 9.0,  text: 'TORRENS ISLAND -- GENERATION FAILING', level: 'crit' },
  { time: 10.2, text: '\u2588\u2588 SYSTEM BLACK \u2588\u2588 -- ALL SA GENERATION OFFLINE', level: 'crit' },
  { time: 10.8, text: '850,000 CUSTOMER CONNECTIONS LOST', level: 'crit' },
  { time: 11.5, text: 'TOTAL CASCADE TIME: 43 SECONDS', level: 'crit' },
];

const TYPE_COLORS: Record<string, number[]> = { wind: [96, 165, 250], gas: [251, 146, 60], sub: [148, 163, 184], ic: [167, 139, 250] };
const SURVIVED_COLOR = [34, 211, 238];

const LEGEND: LegendItem[] = [
  { c: 'rgb(96,165,250)', l: 'Wind' }, { c: 'rgb(251,146,60)', l: 'Gas' },
  { c: 'rgb(148,163,184)', l: 'Substation' }, { c: 'rgb(167,139,250)', l: 'Interconnector' },
];

// ── SA-specific: freq from cascade step ─────────────────────
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 50.0;
};

const computeOffline: OfflineComputer = ({ failed }) => {
  return Math.min(456, Math.floor((failed.size / NODES.length) * 456));
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq === 0) return 'SYSTEM BLACK';
  if (freq < 49.0) return '\u26A0 EMERGENCY';
  if (freq < 49.5) return '\u26A0 WARNING';
  return 'NOMINAL';
};

const computeDanger: DangerComputer = ({ running, freq }) => {
  const inDanger = running && freq < 49.0;
  const freqColor = freq === 0 ? '#ef4444' : freq < 49.0 ? '#ef4444' : freq < 49.5 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, freq }) => running && freq === 0;

// ── SA node overrides: survived nodes get cyan ──────────────
const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => failed.has(node.id) && !node.survived,
  getFillColor: (node, ctx) => {
    if (ctx.failed.has(node.id) && node.survived && !ctx.isInIncident(node.id)) return [...SURVIVED_COLOR, 120];
    return undefined;
  },
  getLineColor: (node, ctx) => {
    if (ctx.failed.has(node.id) && node.survived && !ctx.isInIncident(node.id)) return [...SURVIVED_COLOR, 200];
    return undefined;
  },
  getRadius: (node, ctx) => {
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
export default function SACascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
  return (
    <CascadeMap
      width={width}
      height={height}
      variant="hud"
      nodes={NODES}
      lines={SA_LINES}
      cascade={CASCADE}
      logMessages={LOG_MSGS}
      views={VIEWS}
      typeColors={TYPE_COLORS}
      legendItems={LEGEND}
      monitorName="SA GRID MONITOR"
      dateText="SEP 2016"
      playButtonLabel="BLACKOUT"
      bootInitText="SA GRID MONITOR v1.3 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${SA_LINES.length} | STATUS: OK`}
      compactSummary="SYSTEM BLACK -- 456 MW OFFLINE IN 43 SEC"
      compactElapsed={12}
      bannerText="SYSTEM BLACK -- 43 SECONDS"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="WIND OFFLINE"
      offlineUnit="MW"
      offlineMax={456}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
    />
  );
}
