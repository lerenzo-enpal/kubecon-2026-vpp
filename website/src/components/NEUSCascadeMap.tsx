// Thin wrapper: 2003 Northeast US/Canada Blackout
import React, { useRef } from 'react';
import CascadeMap from './CascadeMap';
import { PolygonLayer } from '@deck.gl/layers';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

// ── Camera presets ──────────────────────────────────────────
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: -78, latitude: 43, zoom: 5.5, pitch: 25, bearing: -5 },
};

// ── Infrastructure data ─────────────────────────────────────
// FirstEnergy substations in northern Ohio (origin of cascade)
// Major city load centers across the affected region
const NODES: CascadeNode[] = [
  // FirstEnergy system -- northern Ohio (origin)
  { id: 'eastlake',    pos: [-81.4524, 41.6536],  type: 'origin',     cap: 680,   name: 'Eastlake Unit 5' },
  { id: 'chamberlin',  pos: [-81.5630, 41.4195],  type: 'substation', cap: 0,     name: 'Chamberlin 345kV' },
  { id: 'harding',     pos: [-81.6220, 41.4000],  type: 'substation', cap: 0,     name: 'Harding 345kV' },
  { id: 'star',        pos: [-81.3650, 40.8500],  type: 'substation', cap: 0,     name: 'Star 345kV' },
  { id: 'juniper',     pos: [-81.2400, 41.0800],  type: 'substation', cap: 0,     name: 'Juniper 345kV' },
  { id: 'sammis',      pos: [-80.8900, 40.5400],  type: 'substation', cap: 0,     name: 'Sammis 345kV' },
  { id: 'southcanton', pos: [-81.3800, 40.7400],  type: 'substation', cap: 0,     name: 'South Canton 345kV' },

  // Major city load centers
  { id: 'cleveland',   pos: [-81.6944, 41.4993],  type: 'hub',        cap: 3200,  name: 'Cleveland' },
  { id: 'akron',       pos: [-81.5190, 41.0814],  type: 'hub',        cap: 1200,  name: 'Akron' },
  { id: 'toledo',      pos: [-83.5379, 41.6528],  type: 'hub',        cap: 900,   name: 'Toledo' },
  { id: 'detroit',     pos: [-83.0458, 42.3314],  type: 'hub',        cap: 4800,  name: 'Detroit' },
  { id: 'lansing',     pos: [-84.5555, 42.7325],  type: 'hub',        cap: 800,   name: 'Lansing' },
  { id: 'toronto',     pos: [-79.3832, 43.6532],  type: 'hub',        cap: 7000,  name: 'Toronto' },
  { id: 'ottawa',      pos: [-75.6972, 45.4215],  type: 'hub',        cap: 2200,  name: 'Ottawa' },
  { id: 'albany',      pos: [-73.7562, 42.6526],  type: 'hub',        cap: 1500,  name: 'Albany' },
  { id: 'nyc',         pos: [-74.0060, 40.7128],  type: 'hub',        cap: 11000, name: 'New York City' },
  { id: 'newark',      pos: [-74.1724, 40.7357],  type: 'hub',        cap: 3000,  name: 'Newark' },
  { id: 'hartford',    pos: [-72.6823, 41.7658],  type: 'hub',        cap: 1400,  name: 'Hartford' },
  { id: 'boston',       pos: [-71.0589, 42.3601],  type: 'hub',        cap: 3500,  name: 'Boston' },
  { id: 'buffalo',     pos: [-78.8784, 42.8864],  type: 'hub',        cap: 1200,  name: 'Buffalo' },
  { id: 'syracuse',    pos: [-76.1474, 43.0481],  type: 'hub',        cap: 800,   name: 'Syracuse' },
  { id: 'erie',        pos: [-80.0851, 42.1292],  type: 'hub',        cap: 600,   name: 'Erie' },
];

// Transmission links
const LINES: [string, string][] = [
  // FirstEnergy internal system
  ['eastlake', 'chamberlin'], ['chamberlin', 'harding'], ['harding', 'star'],
  ['star', 'juniper'], ['star', 'sammis'], ['star', 'southcanton'],
  ['juniper', 'sammis'], ['eastlake', 'cleveland'], ['chamberlin', 'cleveland'],
  ['southcanton', 'akron'],
  // Ohio to neighbors
  ['cleveland', 'akron'], ['cleveland', 'erie'], ['cleveland', 'toledo'],
  ['toledo', 'detroit'], ['akron', 'sammis'],
  // Michigan
  ['detroit', 'lansing'],
  // Ontario
  ['detroit', 'toronto'], ['buffalo', 'toronto'], ['toronto', 'ottawa'],
  // New York
  ['erie', 'buffalo'], ['buffalo', 'syracuse'], ['syracuse', 'albany'],
  ['albany', 'nyc'],
  // New England / NJ
  ['nyc', 'newark'], ['nyc', 'hartford'], ['hartford', 'boston'],
  ['albany', 'hartford'],
];

// ── Cascade timeline ────────────────────────────────────────
// Based on US-Canada Power System Outage Task Force Final Report
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['eastlake'],                                ts: '13:31 EDT', label: 'Eastlake Unit 5 trips -- 680 MW lost',              detail: 'Cleveland-Akron load pocket now import-dependent',  freq: 59.95 },
  { time: 2,  ids: ['chamberlin', 'harding'],                   ts: '14:02',     label: 'Chamberlin-Harding 345kV sags into trees',          detail: 'XA/21 alarm system has silently failed',            freq: 59.90 },
  { time: 4,  ids: ['star', 'juniper', 'southcanton'],          ts: '15:05',     label: 'Three 345kV lines trip in rapid succession',        detail: 'Operators blind -- no alarms for 90 minutes',       freq: 59.75 },
  { time: 6,  ids: ['sammis', 'cleveland', 'akron', 'toledo'],  ts: '16:05:57',  label: 'Sammis-Star trips -- cascade unstoppable',          detail: 'Northern Ohio grid collapses',                      freq: 59.40 },
  { time: 8,  ids: ['detroit', 'lansing', 'erie'],              ts: '16:10:34',  label: 'Michigan and western interconnections fail',         detail: 'Power swings destabilize entire Eastern IC',        freq: 58.80 },
  { time: 10, ids: ['toronto', 'ottawa', 'buffalo'],            ts: '16:10:50',  label: 'Ontario separates -- 22,500 MW lost',               detail: 'Toronto plunges into darkness',                     freq: 58.20 },
  { time: 12, ids: ['albany', 'syracuse', 'nyc'],               ts: '16:11:22',  label: 'New York ISO collapses -- NYC goes dark',           detail: '10 million people affected in New York alone',      freq: 57.50 },
  { time: 14, ids: ['newark', 'hartford', 'boston'],             ts: '16:13',     label: 'NJ, CT, MA cascade -- 61,800 MW total',             detail: '55 million people. 508 generators offline.',        freq: 57.00 },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS: LogMessage[] = [
  { time: 0.3,  text: '13:31 EDT -- EASTLAKE UNIT 5 GENERATION TRIP', level: 'warn' },
  { time: 1.0,  text: 'CLEVELAND-AKRON LOAD POCKET -- IMPORT DEPENDENT', level: 'warn' },
  { time: 2.3,  text: 'CHAMBERLIN-HARDING 345KV -- TREE CONTACT FAULT', level: 'crit' },
  { time: 2.8,  text: 'GE XA/21 ALARM SYSTEM -- RACE CONDITION -- SILENT FAILURE', level: 'crit' },
  { time: 3.5,  text: 'OPERATORS RECEIVING ZERO ALERTS -- FLYING BLIND', level: 'crit' },
  { time: 4.3,  text: 'HANNA-JUNIPER 345KV -- TRIPPED -- TREE CONTACT', level: 'crit' },
  { time: 4.8,  text: 'STAR-SOUTH CANTON 345KV -- TRIPPED', level: 'crit' },
  { time: 5.5,  text: 'FIFTEEN 138KV LINES FAILING IN RAPID SUCCESSION', level: 'crit' },
  { time: 6.3,  text: 'SAMMIS-STAR 345KV -- FINAL CRITICAL LINE LOST', level: 'crit' },
  { time: 6.8,  text: 'NORTHERN OHIO GRID COLLAPSE -- CASCADE INITIATED', level: 'crit' },
  { time: 8.3,  text: 'POWER SWINGS DESTABILIZING EASTERN INTERCONNECTION', level: 'crit' },
  { time: 8.8,  text: 'MICHIGAN -- GENERATION TRIPPING OFFLINE', level: 'crit' },
  { time: 10.3, text: 'ONTARIO HYDRO -- SEPARATION FROM US GRID', level: 'crit' },
  { time: 10.8, text: 'TORONTO -- 22,500 MW LOAD LOST', level: 'crit' },
  { time: 12.3, text: 'NYISO COLLAPSE -- NYC SUBWAY HALTED', level: 'crit' },
  { time: 12.8, text: '22 NUCLEAR REACTORS AUTO-SCRAMMED', level: 'crit' },
  { time: 14.3, text: '61,800 MW LOST -- 55 MILLION PEOPLE WITHOUT POWER', level: 'crit' },
  { time: 15.0, text: 'TOTAL CASCADE TIME: APPROXIMATELY 8 MINUTES', level: 'crit' },
];

const TYPE_COLORS: Record<string, number[]> = {
  substation: [34, 211, 238],
  hub: [148, 163, 184],
  origin: [245, 158, 11],
};

const LEGEND: LegendItem[] = [
  { c: 'rgb(34,211,238)', l: 'Substation' },
  { c: 'rgb(148,163,184)', l: 'City Hub' },
  { c: 'rgba(239,68,68,0.35)', l: 'Blackout Zone' },
];

// ── Spreading blackout polygons ─────────────────────────────
// Each zone corresponds to a cascade step's geographic spread.
// Approximate real geographic boundaries of affected regions.
type BlackoutZone = {
  step: number;        // becomes visible at this cascade step index
  polygon: [number, number][];
  opacity: number;     // fill alpha (0-255)
};

const BLACKOUT_ZONES: BlackoutZone[] = [
  // Step 0-3: FirstEnergy area -- northern Ohio (Cleveland-Akron corridor)
  {
    step: 0,
    opacity: 25,
    polygon: [
      [-82.20, 41.80], [-81.00, 41.80], [-80.70, 41.20],
      [-80.80, 40.60], [-81.40, 40.30], [-82.10, 40.40],
      [-82.60, 40.80], [-82.80, 41.30], [-82.20, 41.80],
    ],
  },
  // Step 4-5: Expands to Ohio + Michigan
  {
    step: 4,
    opacity: 30,
    polygon: [
      [-84.80, 43.20], [-83.80, 43.60], [-82.50, 42.80],
      [-82.20, 41.80], [-81.00, 41.80], [-80.50, 41.50],
      [-80.50, 40.50], [-81.00, 40.00], [-82.50, 40.00],
      [-83.80, 41.00], [-84.80, 41.80], [-85.20, 42.50],
      [-84.80, 43.20],
    ],
  },
  // Step 6: Spreads to Ontario
  {
    step: 5,
    opacity: 32,
    polygon: [
      [-85.20, 42.50], [-84.00, 43.80], [-82.00, 44.20],
      [-80.00, 44.50], [-78.50, 44.00], [-76.50, 44.80],
      [-75.50, 45.50], [-75.00, 45.00], [-76.00, 43.80],
      [-77.50, 43.30], [-78.80, 43.00], [-80.50, 42.20],
      [-80.50, 41.50], [-81.00, 41.80], [-82.50, 42.80],
      [-83.80, 43.60], [-85.20, 42.50],
    ],
  },
  // Step 7: Engulfs New York State
  {
    step: 6,
    opacity: 35,
    polygon: [
      [-85.20, 42.50], [-84.00, 43.80], [-82.00, 44.20],
      [-80.00, 44.50], [-78.50, 44.00], [-76.50, 44.80],
      [-75.50, 45.50], [-74.50, 45.00], [-73.50, 43.50],
      [-73.70, 42.00], [-74.00, 41.20], [-74.30, 40.50],
      [-75.00, 40.00], [-76.00, 40.20], [-78.00, 40.00],
      [-80.50, 40.50], [-80.50, 41.50], [-81.00, 41.80],
      [-82.50, 42.80], [-83.80, 43.60], [-85.20, 42.50],
    ],
  },
  // Step 8: Full affected area -- 8 states + Ontario
  {
    step: 7,
    opacity: 40,
    polygon: [
      [-85.20, 42.50], [-84.00, 43.80], [-82.00, 44.20],
      [-80.00, 44.50], [-78.50, 44.00], [-76.50, 44.80],
      [-75.50, 45.50], [-74.00, 45.00], [-73.00, 44.50],
      [-72.00, 43.50], [-71.00, 43.00], [-70.50, 42.50],
      [-70.80, 42.00], [-71.00, 41.60], [-72.00, 41.00],
      [-73.50, 40.50], [-74.00, 40.40], [-74.50, 40.00],
      [-75.50, 39.80], [-76.00, 40.20], [-78.00, 40.00],
      [-80.50, 40.50], [-80.50, 41.50], [-81.00, 41.80],
      [-82.50, 42.80], [-83.80, 43.60], [-85.20, 42.50],
    ],
  },
];

// ── 60 Hz grid -- frequency computation ─────────────────────
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 60.0;
};

const computeOffline: OfflineComputer = ({ failed }) => {
  return Math.min(61800, Math.floor((failed.size / NODES.length) * 61800));
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq < 58.0) return 'SYSTEM COLLAPSE';
  if (freq < 59.0) return 'EMERGENCY';
  if (freq < 59.5) return 'WARNING';
  return 'NOMINAL';
};

const computeDanger: DangerComputer = ({ running, freq }) => {
  const inDanger = running && freq < 59.0;
  const freqColor = freq < 58.0 ? '#ef4444' : freq < 59.0 ? '#ef4444' : freq < 59.5 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, elapsed }) => running && elapsed > 13;

// ── Node overrides ──────────────────────────────────────────
const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => failed.has(node.id),
  getRadius: (node) => {
    if (node.type === 'origin') return 12000;
    if (node.type === 'substation') return 6000;
    return 10000;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 7.0], [1.5, 6.5], [3, 6.0]],
  fallbackZoom: 5.5,
  overviewFromEnd: 2,
  pitch: 25,
  bearing: -5,
};

// ── Map step index to the set of node IDs that have failed ──
// We use this to determine which blackout zones to show.
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

// ── Main component ──────────────────────────────────────────
export default function NEUSCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
  // Track the active step via a ref updated in computeOffline
  const stepRef = useRef(-1);

  // Wrap computeOffline to also track the step
  const computeOfflineTracked: OfflineComputer = (ctx) => {
    stepRef.current = getActiveStepFromFailed(ctx.failed.size);
    return computeOffline(ctx);
  };

  // Build polygon layers on every render (they read stepRef.current)
  const visibleZones = BLACKOUT_ZONES.filter(z => stepRef.current >= z.step);
  const polygonLayers = visibleZones.map((zone, i) => (
    new PolygonLayer({
      id: `blackout-zone-${i}`,
      data: [{ polygon: zone.polygon }],
      getPolygon: (d: any) => d.polygon,
      getFillColor: [239, 68, 68, zone.opacity],
      getLineColor: [239, 68, 68, Math.min(255, zone.opacity * 3)],
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
      monitorName="NPCC/ECAR GRID MONITOR"
      dateText="AUG 2003"
      playButtonLabel="BLACKOUT"
      bootInitText="NPCC/ECAR GRID MONITOR v3.2 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${LINES.length} | STATUS: OK`}
      compactSummary="61,800 MW LOST -- 55 MILLION PEOPLE"
      compactElapsed={16}
      bannerText="61.8 GW LOST -- 55 MILLION PEOPLE"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOfflineTracked}
      offlineLabel="LOAD LOST"
      offlineUnit="MW"
      offlineMax={61800}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
      extraLayers={polygonLayers}
    />
  );
}
