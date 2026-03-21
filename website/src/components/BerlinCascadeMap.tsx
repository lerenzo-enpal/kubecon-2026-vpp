// Thin wrapper: 2025 Berlin Johannisthal Arson attack
import React, { useMemo } from 'react';
import CascadeMap from './CascadeMap';
import { PolygonLayer } from '@deck.gl/layers';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

// ── Camera presets ──────────────────────────────────────────
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: 13.50, latitude: 52.46, zoom: 11.5, pitch: 30, bearing: -5 },
};

// ── Infrastructure data ─────────────────────────────────────
// Attack sites: 110kV overhead-to-underground cable transition pylons
// near Johannisthal S-Bahn station, Treptow-Kopenick district.
// Substations: Stromnetz Berlin 110kV substations serving the area.
// Landmarks: key Berlin reference points for orientation.
const NODES: CascadeNode[] = [
  // Attack sites (the targeted 110kV transition pylons)
  { id: 'pylon1',      pos: [13.4985, 52.4485], type: 'attack', cap: 0, name: 'Pylon 1 -- Johannisthal' },
  { id: 'pylon2',      pos: [13.5055, 52.4460], type: 'attack', cap: 0, name: 'Pylon 2 -- Johannisthal' },

  // Stromnetz Berlin substations (110kV)
  { id: 'mitte',       pos: [13.3880, 52.5200], type: 'sub', cap: 0, name: 'UW Mitte' },
  { id: 'friedrshain', pos: [13.4540, 52.5130], type: 'sub', cap: 0, name: 'UW Friedrichshain' },
  { id: 'neukoelln',   pos: [13.4350, 52.4760], type: 'sub', cap: 0, name: 'UW Neukolln' },
  { id: 'treptow',     pos: [13.4720, 52.4880], type: 'sub', cap: 0, name: 'UW Treptow' },
  { id: 'adlershof',   pos: [13.5310, 52.4310], type: 'sub', cap: 0, name: 'UW Adlershof' },
  { id: 'kopenick',    pos: [13.5780, 52.4540], type: 'sub', cap: 0, name: 'UW Kopenick' },
  { id: 'oberspree',   pos: [13.5120, 52.4650], type: 'sub', cap: 0, name: 'UW Oberspree' },
  { id: 'rudow',       pos: [13.4850, 52.4220], type: 'sub', cap: 0, name: 'UW Rudow' },
  { id: 'charlbg',     pos: [13.3100, 52.5150], type: 'sub', cap: 0, name: 'UW Charlottenburg' },
  { id: 'rummelsburg',  pos: [13.4920, 52.5050], type: 'sub', cap: 0, name: 'UW Rummelsburg' },

  // Landmarks (grey context markers)
  { id: 'alex',        pos: [13.4130, 52.5215], type: 'landmark', cap: 0, name: 'Alexanderplatz' },
  { id: 'hbf',         pos: [13.3690, 52.5250], type: 'landmark', cap: 0, name: 'Hauptbahnhof' },
  { id: 'tegel',       pos: [13.2870, 52.5540], type: 'landmark', cap: 0, name: 'Tegel' },
  { id: 'bersb',       pos: [13.5050, 52.4405], type: 'landmark', cap: 0, name: 'S Johannisthal' },
];

// 110kV transmission lines connecting substations
const LINES: [string, string][] = [
  ['charlbg', 'mitte'],
  ['mitte', 'friedrshain'],
  ['friedrshain', 'rummelsburg'],
  ['mitte', 'neukoelln'],
  ['neukoelln', 'treptow'],
  ['treptow', 'oberspree'],
  ['oberspree', 'pylon1'],   // The attacked feeder line
  ['pylon1', 'pylon2'],      // Between the two attacked pylons
  ['pylon2', 'adlershof'],   // Severed connection to Adlershof
  ['adlershof', 'kopenick'],
  ['neukoelln', 'rudow'],
  ['rummelsburg', 'treptow'],
];

// ── Cascade timeline ────────────────────────────────────────
// This is a sabotage event, not a weather cascade. The timeline
// reflects discovery and progressive impact rather than a freq collapse.
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['pylon1', 'pylon2'],                ts: '03:30', label: 'Arsonists attack two 110kV transition pylons',   detail: 'Accelerants ignited on cable insulation',        freq: 50.0 },
  { time: 3,  ids: ['oberspree'],                       ts: '03:45', label: '110kV feeder line trips -- protection relay',    detail: 'Fault current detected at UW Oberspree',         freq: 50.0 },
  { time: 5,  ids: ['adlershof', 'kopenick'],           ts: '04:15', label: 'Adlershof + Kopenick substations isolated',     detail: 'No alternate 110kV path available',              freq: 50.0 },
  { time: 7,  ids: ['rudow'],                           ts: '06:00', label: '50,000 households dark -- 3,000 businesses',    detail: 'Treptow-Kopenick district without power',        freq: 50.0 },
  { time: 10, ids: [],                                  ts: '10:21', label: '14,000 customers restored via rerouting',       detail: 'Stromnetz Berlin switches alternative paths',    freq: 50.0 },
  { time: 12, ids: [],                                  ts: 'SEP 11', label: 'Full restoration after 60 hours',              detail: 'Temporary bypass around destroyed pylons',       freq: 50.0 },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS: LogMessage[] = [
  { time: 0.5,  text: '03:30 -- FIRE ALARM -- JOHANNISTHAL TRANSITION POINT', level: 'crit' },
  { time: 1.5,  text: '110KV CABLE FAULT -- OVERHEAD-UNDERGROUND JUNCTION', level: 'crit' },
  { time: 2.5,  text: 'PROTECTION RELAY TRIP -- UW OBERSPREE', level: 'warn' },
  { time: 3.5,  text: 'UW ADLERSHOF -- SUPPLY INTERRUPTED', level: 'crit' },
  { time: 4.5,  text: 'UW KOPENICK -- SUPPLY INTERRUPTED', level: 'crit' },
  { time: 5.5,  text: 'TREPTOW-KOPENICK DISTRICT -- NO SUPPLY', level: 'crit' },
  { time: 6.5,  text: '50,000 HOUSEHOLDS AFFECTED -- 3,000 BUSINESSES', level: 'crit' },
  { time: 7.5,  text: 'STROMNETZ BERLIN -- EMERGENCY REROUTING IN PROGRESS', level: 'warn' },
  { time: 8.5,  text: 'CAUSE: DELIBERATE SABOTAGE -- ARSON CONFIRMED', level: 'crit' },
  { time: 9.5,  text: 'CABLE REPLACEMENT REQUIRES CIVIL ENGINEERING', level: 'warn' },
  { time: 10.5, text: '14,000 CUSTOMERS RESTORED VIA ALTERNATIVE PATHS', level: 'warn' },
  { time: 12.0, text: 'FULL RESTORATION AFTER 60 HOURS -- TEMPORARY BYPASS', level: 'warn' },
];

// Type colors: substation=cyan, attack=red, landmark=grey
const TYPE_COLORS: Record<string, number[]> = {
  sub: [34, 211, 238],
  attack: [239, 68, 68],
  landmark: [113, 113, 122],
};

const LEGEND: LegendItem[] = [
  { c: 'rgb(34,211,238)', l: 'Substation' },
  { c: 'rgb(239,68,68)', l: 'Attack Site' },
  { c: 'rgba(239,68,68,0.25)', l: 'Affected Area' },
];

// ── Treptow-Kopenick district boundary (approximate polygon) ──
// Public geographic boundary of Berlin's Treptow-Kopenick district
const TREPTOW_KOPENICK_BOUNDARY: [number, number][] = [
  [13.443, 52.510],  // NW corner near Treptower Park
  [13.470, 52.515],  // N along Spree
  [13.500, 52.510],  // NE near Rummelsburg
  [13.530, 52.505],  // E along Spree
  [13.560, 52.495],  // Continuing east
  [13.590, 52.490],  // NE near Karlshorst
  [13.620, 52.480],  // E toward Kopenick
  [13.640, 52.465],  // SE near Muggelsee
  [13.650, 52.445],  // S along Muggelsee
  [13.640, 52.425],  // SW of Muggelsee
  [13.620, 52.410],  // S near Grunau
  [13.580, 52.400],  // SW near Bohnsdorf
  [13.540, 52.395],  // S near Altglienicke
  [13.500, 52.400],  // SW near Rudow border
  [13.470, 52.410],  // W near Britz border
  [13.450, 52.425],  // W near Johannisthal
  [13.440, 52.445],  // NW near Baumschulenweg
  [13.438, 52.470],  // NW near Plaenterwald
  [13.440, 52.495],  // N back toward Treptower Park
  [13.443, 52.510],  // Close polygon
];

// ── Berlin: no frequency collapse (city grid stays at 50Hz) ──
// This is a localized sabotage, not a system-wide frequency event.
const computeFreq: FreqComputer = () => 50.0;

const computeOffline: OfflineComputer = ({ failed }) => {
  // Map failed nodes to approximate households affected
  const perNode: Record<string, number> = {
    pylon1: 0, pylon2: 0, oberspree: 8000,
    adlershof: 18000, kopenick: 14000, rudow: 10000,
  };
  let total = 0;
  for (const id of failed) total += perNode[id] || 0;
  return Math.min(50000, total);
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  return 'NOMINAL'; // Grid frequency stays normal; this is a local outage
};

const computeDanger: DangerComputer = ({ running, failed }) => {
  const inDanger = running && failed.size > 2;
  const freqColor = inDanger ? '#ef4444' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, elapsed }) => running && elapsed > 6;

// ── Node overrides ──────────────────────────────────────────
const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => failed.has(node.id) && node.type !== 'landmark',
  getRadius: (node) => {
    if (node.type === 'attack') return 600;
    if (node.type === 'landmark') return 300;
    return 500;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 12.5], [1.5, 12.0], [3, 11.5]],
  fallbackZoom: 11.0,
  overviewFromEnd: 1,
  pitch: 30,
  bearing: -5,
};

// ── Main component ──────────────────────────────────────────
export default function BerlinCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
  // Build the PolygonLayer for Treptow-Kopenick affected area
  const polygonLayers = useMemo(() => [
    new PolygonLayer({
      id: 'affected-area',
      data: [{ polygon: TREPTOW_KOPENICK_BOUNDARY }],
      getPolygon: (d: any) => d.polygon,
      getFillColor: [239, 68, 68, 40],
      getLineColor: [239, 68, 68, 120],
      getLineWidth: 2,
      lineWidthMinPixels: 1,
      filled: true,
      stroked: true,
      pickable: false,
    }),
  ], []);

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
      monitorName="BERLIN GRID MONITOR"
      dateText="FEB 2025"
      playButtonLabel="ATTACK"
      bootInitText="BERLIN GRID MONITOR v1.0 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${LINES.length} | STATUS: OK`}
      compactSummary="50,000 HOUSEHOLDS -- 60 HOURS WITHOUT POWER"
      compactElapsed={14}
      bannerText="50,000 HOUSEHOLDS -- 60 HOURS"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="HOUSEHOLDS DARK"
      offlineUnit=""
      offlineMax={50000}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
      extraLayers={polygonLayers}
    />
  );
}
