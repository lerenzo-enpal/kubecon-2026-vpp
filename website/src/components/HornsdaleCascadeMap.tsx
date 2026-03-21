// Hornsdale Power Reserve — SUCCESS story: 140ms battery response prevented cascade
import React from 'react';
import CascadeMap from './CascadeMap';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

// ── Camera presets ──────────────────────────────────────────
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: 140.5, latitude: -35.5, zoom: 5.5, pitch: 35, bearing: -5 },
};

// ── Infrastructure: SA nodes + Loy Yang A in Victoria ───────
const NODES: CascadeNode[] = [
  { id: 'torrens',    pos: [138.523, -34.807], type: 'gas',     cap: 1280, name: 'Torrens Island' },
  { id: 'pelican',    pos: [138.506, -34.765], type: 'gas',     cap: 480,  name: 'Pelican Point' },
  { id: 'osborne',    pos: [138.508, -34.798], type: 'gas',     cap: 180,  name: 'Osborne' },
  { id: 'hornsdale',  pos: [138.540, -33.056], type: 'battery', cap: 100,  name: 'Hornsdale Power Reserve' },
  { id: 'snowtown',   pos: [138.135, -33.732], type: 'wind',    cap: 369,  name: 'Snowtown 1&2' },
  { id: 'hallett1',   pos: [138.708, -33.316], type: 'wind',    cap: 95,   name: 'Hallett 1' },
  { id: 'hallett2',   pos: [138.864, -33.564], type: 'wind',    cap: 71,   name: 'Hallett 2' },
  { id: 'northbrown', pos: [138.704, -33.299], type: 'wind',    cap: 132,  name: 'North Brown Hill' },
  { id: 'bluff',      pos: [138.792, -33.383], type: 'wind',    cap: 53,   name: 'The Bluff' },
  { id: 'clements',   pos: [138.151, -33.721], type: 'wind',    cap: 57,   name: 'Clements Gap' },
  { id: 'waterloo',   pos: [138.900, -33.980], type: 'wind',    cap: 111,  name: 'Waterloo' },
  { id: 'canunda',    pos: [140.417, -37.810], type: 'wind',    cap: 46,   name: 'Canunda' },
  { id: 'lakebonney', pos: [140.407, -37.771], type: 'wind',    cap: 279,  name: 'Lake Bonney 1-3' },
  { id: 'davenport',  pos: [137.820, -32.510], type: 'sub',     cap: 0,    name: 'Davenport Sub' },
  { id: 'belalie',    pos: [138.500, -33.150], type: 'sub',     cap: 0,    name: 'Belalie Sub' },
  { id: 'para',       pos: [138.630, -34.730], type: 'sub',     cap: 0,    name: 'Para Sub' },
  { id: 'heywood',    pos: [140.841, -37.733], type: 'ic',      cap: 460,  name: 'Heywood IC' },
  // Victoria — Loy Yang A (the coal plant that tripped)
  { id: 'loyyang',    pos: [146.59, -38.25],   type: 'coal',    cap: 560,  name: 'Loy Yang A' },
  // Victoria — Gladstone (conventional FCAS responder)
  { id: 'gladstone',  pos: [145.0, -37.8],     type: 'gas',     cap: 400,  name: 'Gladstone' },
];

const LINES: [string, string][] = [
  ['davenport', 'belalie'], ['belalie', 'hallett1'], ['belalie', 'northbrown'],
  ['belalie', 'snowtown'], ['belalie', 'para'], ['para', 'torrens'],
  ['para', 'pelican'], ['para', 'osborne'], ['hornsdale', 'davenport'],
  ['hallett2', 'belalie'], ['bluff', 'belalie'], ['clements', 'snowtown'],
  ['waterloo', 'para'], ['lakebonney', 'heywood'], ['canunda', 'heywood'],
  ['heywood', 'para'], ['heywood', 'gladstone'], ['loyyang', 'gladstone'],
];

// ── Cascade timeline: trip -> dip -> battery response -> recovery ──
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['loyyang'],   ts: '01:58:59', label: 'Loy Yang A Unit 3 trips -- 560 MW lost',      detail: 'Coal plant trips without warning',           freq: 50.0 },
  { time: 2,  ids: [],            ts: '01:58:59+', label: 'Frequency dropping across NEM',               detail: 'Grid detects loss of 560 MW baseload',       freq: 49.80 },
  { time: 4,  ids: ['hornsdale'], ts: '01:59:00',  label: 'Hornsdale battery responds in 140ms',         detail: '100 MW injected -- faster than any generator', freq: 49.61 },
  { time: 6,  ids: ['gladstone'], ts: '01:59:27',  label: 'Gladstone responds 28 seconds later',         detail: 'Conventional FCAS catches up',                freq: 49.75 },
  { time: 8,  ids: [],            ts: '01:59:45',  label: 'Frequency recovering -- grid stabilizing',    detail: 'Battery bought time for conventional response', freq: 49.90 },
  { time: 10, ids: [],            ts: '02:00+',    label: 'Grid stable -- zero customers affected',      detail: 'No load shedding. No cascade. No blackout.',   freq: 50.0 },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS: LogMessage[] = [
  { time: 0.3,  text: '01:58:59 AEST -- LOY YANG A UNIT 3 TRIP DETECTED', level: 'crit' },
  { time: 0.8,  text: '560 MW BASELOAD GENERATION LOST', level: 'crit' },
  { time: 1.5,  text: 'FREQUENCY DECLINING -- 49.95 Hz', level: 'warn' },
  { time: 2.3,  text: 'NEM FREQUENCY FALLING THROUGH 49.85 Hz', level: 'warn' },
  { time: 3.0,  text: 'HORNSDALE POWER RESERVE -- RESPONDING', level: 'info' },
  { time: 4.0,  text: 'HPR INJECTION: 100 MW IN 140ms', level: 'info' },
  { time: 4.5,  text: 'FREQUENCY ARRESTED AT 49.61 Hz', level: 'info' },
  { time: 5.5,  text: 'FREQUENCY RECOVERING -- BATTERY HOLDING', level: 'info' },
  { time: 6.5,  text: 'GLADSTONE RESPONDING -- 28s AFTER TRIP', level: 'warn' },
  { time: 7.5,  text: 'CONVENTIONAL FCAS RAMPING UP', level: 'info' },
  { time: 8.5,  text: 'FREQUENCY: 49.90 Hz -- RECOVERING', level: 'info' },
  { time: 9.5,  text: 'GRID STABLE -- NO LOAD SHEDDING REQUIRED', level: 'info' },
  { time: 10.5, text: 'ZERO CUSTOMERS AFFECTED -- CRISIS AVERTED', level: 'info' },
];

const TYPE_COLORS: Record<string, number[]> = {
  wind: [96, 165, 250],
  gas: [251, 146, 60],
  sub: [148, 163, 184],
  ic: [167, 139, 250],
  coal: [148, 163, 184],
  battery: [16, 185, 129],
};

const BATTERY_GREEN = [16, 185, 129];

const LEGEND: LegendItem[] = [
  { c: 'rgb(16,185,129)', l: 'Battery' }, { c: 'rgb(96,165,250)', l: 'Wind' },
  { c: 'rgb(251,146,60)', l: 'Gas' }, { c: 'rgb(148,163,184)', l: 'Coal/Sub' },
  { c: 'rgb(167,139,250)', l: 'Interconnector' },
];

// ── Freq from cascade steps (dip then recover) ─────────────
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 50.0;
};

const computeOffline: OfflineComputer = ({ failed }) => {
  // In this scenario, only Loy Yang trips (560 MW lost), then battery compensates
  const hasLoyYang = failed.has('loyyang');
  return hasLoyYang ? 560 : 0;
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq < 49.5) return 'CONTINGENCY';
  if (freq < 49.85) return 'RESPONDING';
  return 'NOMINAL';
};

// SUCCESS story: green glow, not red
const computeDanger: DangerComputer = ({ running, freq }) => {
  const isRecovering = running && freq < 49.85 && freq > 0;
  // Amber during dip, green during recovery and stable
  const freqColor = freq < 49.7 ? '#f59e0b' : freq < 49.85 ? '#22d3ee' : '#10b981';
  const glowColor = isRecovering ? '#f59e0b' : '#10b981';
  const borderClr = isRecovering ? 'rgba(245,158,11,0.4)' : 'rgba(16,185,129,0.35)';
  return { inDanger: false, freqColor, glowColor, borderClr };
};

// Show the success banner once frequency is back to 50.0
const bannerShowCondition: BannerShowCondition = ({ running, freq }) => running && freq >= 50.0;

// ── Node overrides: Hornsdale gets green glow, Loy Yang goes amber then recovers ──
const nodeOverrides: NodeOverrides = {
  // Loy Yang trips but everything else stays online — don't mark with X
  showXMark: (node, failed) => node.id === 'loyyang' && failed.has('loyyang'),
  getFillColor: (node, ctx) => {
    // Hornsdale battery gets bright green when active
    if (node.id === 'hornsdale' && ctx.running && ctx.failed.has('hornsdale')) return [...BATTERY_GREEN, 220];
    // Gladstone gets orange when responding
    if (node.id === 'gladstone' && ctx.failed.has('gladstone')) return [251, 146, 60, 200];
    // Loy Yang stays red (it actually tripped)
    if (node.id === 'loyyang' && ctx.failed.has('loyyang')) return [239, 68, 68, 180];
    return undefined;
  },
  getLineColor: (node, ctx) => {
    if (node.id === 'hornsdale' && ctx.running && ctx.failed.has('hornsdale')) return [...BATTERY_GREEN, 255];
    if (node.id === 'gladstone' && ctx.failed.has('gladstone')) return [251, 146, 60, 255];
    if (node.id === 'loyyang' && ctx.failed.has('loyyang')) return [239, 68, 68, 200];
    return undefined;
  },
  getRadius: (node, ctx) => {
    // Make Hornsdale battery prominent when responding
    if (node.id === 'hornsdale' && ctx.running && ctx.failed.has('hornsdale')) return 12000;
    if (node.type === 'sub') return 3000;
    return undefined;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 7.5], [1.5, 6.8], [3, 6.0]],
  fallbackZoom: 5.5,
  overviewFromEnd: 1,
  pitch: 35,
  bearing: -5,
};

// ── Main component ──────────────────────────────────────────
export default function HornsdaleCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
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
      monitorName="AEMO NEM MONITOR"
      dateText="DEC 2017"
      playButtonLabel="RESPOND"
      bootInitText="AEMO NEM MONITOR v3.1 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${LINES.length} | STATUS: OK`}
      compactSummary="GRID STABLE -- 140ms BATTERY RESPONSE"
      compactElapsed={12}
      bannerText="GRID STABLE -- 140ms RESPONSE"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="GENERATION LOST"
      offlineUnit="MW"
      offlineMax={560}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
    />
  );
}
