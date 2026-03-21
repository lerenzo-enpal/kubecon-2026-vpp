// Thin wrapper: 2026 Berlin Teltow Canal Arson attack
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
  hud: { longitude: 13.33, latitude: 52.44, zoom: 12, pitch: 30, bearing: -5 },
};

// ── Infrastructure data ─────────────────────────────────────
// Attack site: cable bridge over the Teltow Canal near
// Teltowkanalstrasse / Goerzallee in Lichterfelde.
// Substations: Stromnetz Berlin 110kV substations in the area.
// Landmarks: Berlin reference points for orientation.
const NODES: CascadeNode[] = [
  // Attack site (the cable bridge over Teltow Canal)
  { id: 'cablebridge', pos: [13.3120, 52.4320], type: 'attack', cap: 0, name: 'Cable Bridge -- Teltow Canal' },

  // Lichterfelde CHP plant (connected via the cable bridge)
  { id: 'lichterfelde_chp', pos: [13.3050, 52.4270], type: 'attack', cap: 0, name: 'Lichterfelde CHP Plant' },

  // Stromnetz Berlin substations (110kV) in southwest Berlin
  { id: 'steglitz',    pos: [13.3280, 52.4580], type: 'sub', cap: 0, name: 'UW Steglitz' },
  { id: 'zehlendorf',  pos: [13.2590, 52.4310], type: 'sub', cap: 0, name: 'UW Zehlendorf' },
  { id: 'lichterfelde',pos: [13.3100, 52.4450], type: 'sub', cap: 0, name: 'UW Lichterfelde' },
  { id: 'lankwitz',    pos: [13.3500, 52.4380], type: 'sub', cap: 0, name: 'UW Lankwitz' },
  { id: 'marienfelde', pos: [13.3680, 52.4220], type: 'sub', cap: 0, name: 'UW Marienfelde' },
  { id: 'tempelhof',   pos: [13.3850, 52.4680], type: 'sub', cap: 0, name: 'UW Tempelhof' },
  { id: 'schoeneberg', pos: [13.3500, 52.4830], type: 'sub', cap: 0, name: 'UW Schoeneberg' },
  { id: 'wannsee',     pos: [13.1780, 52.4210], type: 'sub', cap: 0, name: 'UW Wannsee' },
  { id: 'charlbg',     pos: [13.3100, 52.5150], type: 'sub', cap: 0, name: 'UW Charlottenburg' },
  { id: 'mitte',       pos: [13.3880, 52.5200], type: 'sub', cap: 0, name: 'UW Mitte' },

  // Landmarks (grey context markers)
  { id: 'alex',        pos: [13.4130, 52.5215], type: 'landmark', cap: 0, name: 'Alexanderplatz' },
  { id: 'hbf',         pos: [13.3690, 52.5250], type: 'landmark', cap: 0, name: 'Hauptbahnhof' },
  { id: 'rathaus_sz',  pos: [13.2410, 52.4340], type: 'landmark', cap: 0, name: 'Rathaus Zehlendorf' },
  { id: 'botanical',   pos: [13.3030, 52.4530], type: 'landmark', cap: 0, name: 'Botanical Garden' },
];

// 110kV transmission lines connecting substations
const LINES: [string, string][] = [
  ['charlbg', 'schoeneberg'],
  ['schoeneberg', 'steglitz'],
  ['steglitz', 'lichterfelde'],
  ['lichterfelde', 'cablebridge'],   // The attacked cable bridge connection
  ['cablebridge', 'lichterfelde_chp'], // Severed link to CHP plant
  ['lichterfelde', 'zehlendorf'],
  ['zehlendorf', 'wannsee'],
  ['steglitz', 'lankwitz'],
  ['lankwitz', 'marienfelde'],
  ['lankwitz', 'tempelhof'],
  ['tempelhof', 'schoeneberg'],
  ['mitte', 'charlbg'],
  ['mitte', 'tempelhof'],
];

// ── Cascade timeline ────────────────────────────────────────
// Sabotage event: arsonists attack cable bridge at ~6:00 AM on Jan 3.
// Timeline reflects progressive discovery and impact.
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['cablebridge'],                         ts: '06:00', label: 'Cable bridge set on fire over Teltow Canal',       detail: 'Arsonists ignite cable bridge near Goerzallee',      freq: 50.0 },
  { time: 2,  ids: ['lichterfelde_chp'],                    ts: '06:10', label: '15 cables destroyed -- 5x 110kV + 10x 10kV',       detail: 'Fire destroys all cables on the bridge',             freq: 50.0 },
  { time: 4,  ids: ['lichterfelde'],                        ts: '06:25', label: 'UW Lichterfelde isolated -- no supply path',        detail: 'Protection relays trip on cable fault',              freq: 50.0 },
  { time: 6,  ids: ['zehlendorf', 'wannsee'],               ts: '06:40', label: 'Zehlendorf + Wannsee substations cascade',          detail: 'No alternate 110kV path from southwest',            freq: 50.0 },
  { time: 8,  ids: ['steglitz', 'lankwitz'],                 ts: '07:00', label: '45,000 households dark across two districts',       detail: 'Steglitz-Zehlendorf + Tempelhof-Schoeneberg',       freq: 50.0 },
  { time: 10, ids: [],                                       ts: 'JAN 5', label: 'Emergency rerouting restores partial supply',       detail: 'Stromnetz Berlin switches alternative paths',       freq: 50.0 },
  { time: 12, ids: [],                                       ts: 'JAN 7', label: 'Full restoration after 4 days',                    detail: 'Temporary cable bypass completed',                  freq: 50.0 },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS: LogMessage[] = [
  { time: 0.5,  text: '06:00 -- FIRE ALARM -- TELTOW CANAL CABLE BRIDGE', level: 'crit' },
  { time: 1.5,  text: '110KV CABLE FAULT -- LICHTERFELDE FEEDER', level: 'crit' },
  { time: 2.5,  text: '15 CABLES DESTROYED -- 5x 110KV + 10x 10KV', level: 'crit' },
  { time: 3.5,  text: 'LICHTERFELDE CHP PLANT -- SUPPLY SEVERED', level: 'crit' },
  { time: 4.5,  text: 'UW LICHTERFELDE -- ISOLATED -- NO ALTERNATE PATH', level: 'crit' },
  { time: 5.5,  text: 'UW ZEHLENDORF -- SUPPLY INTERRUPTED', level: 'crit' },
  { time: 6.5,  text: 'UW WANNSEE -- SUPPLY INTERRUPTED', level: 'crit' },
  { time: 7.5,  text: '45,000 HOUSEHOLDS AFFECTED -- 2,200 BUSINESSES', level: 'crit' },
  { time: 8.5,  text: 'CAUSE: DELIBERATE SABOTAGE -- ARSON CONFIRMED', level: 'crit' },
  { time: 9.0,  text: 'HEATING SUPPLY LOST -- SUB-ZERO TEMPERATURES', level: 'crit' },
  { time: 9.5,  text: 'STROMNETZ BERLIN -- EMERGENCY REROUTING IN PROGRESS', level: 'warn' },
  { time: 10.5, text: 'CABLE REPLACEMENT REQUIRES CIVIL ENGINEERING', level: 'warn' },
  { time: 11.5, text: 'PARTIAL RESTORATION VIA ALTERNATIVE PATHS', level: 'warn' },
  { time: 12.5, text: 'FULL RESTORATION AFTER 4 DAYS -- LONGEST OUTAGE SINCE 1945', level: 'warn' },
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

// ── Steglitz-Zehlendorf district boundary (approximate polygon) ──
const STEGLITZ_ZEHLENDORF_BOUNDARY: [number, number][] = [
  [13.210, 52.470],  // NW near Grunewald
  [13.260, 52.475],  // N toward Dahlem
  [13.300, 52.475],  // N near Botanical Garden
  [13.330, 52.470],  // NE near Steglitz center
  [13.350, 52.465],  // E toward Schoeneberg border
  [13.365, 52.455],  // SE
  [13.370, 52.440],  // E near Lankwitz
  [13.375, 52.420],  // SE near Marienfelde border
  [13.370, 52.400],  // S near Lichtenrade border
  [13.340, 52.395],  // SW
  [13.300, 52.390],  // S near Teltow (city border)
  [13.260, 52.395],  // SW near Kleinmachnow
  [13.220, 52.400],  // W near Wannsee
  [13.180, 52.410],  // W near Havel
  [13.170, 52.430],  // NW near Wannsee lake
  [13.180, 52.450],  // NW
  [13.200, 52.465],  // N back toward Grunewald
  [13.210, 52.470],  // Close polygon
];

// ── Berlin: no frequency collapse (city grid stays at 50Hz) ──
const computeFreq: FreqComputer = () => 50.0;

const computeOffline: OfflineComputer = ({ failed }) => {
  const perNode: Record<string, number> = {
    cablebridge: 0, lichterfelde_chp: 0,
    lichterfelde: 12000, zehlendorf: 10000, wannsee: 5000,
    steglitz: 10000, lankwitz: 8000,
  };
  let total = 0;
  for (const id of failed) total += perNode[id] || 0;
  return Math.min(45000, total);
};

const freqStatusLabel: FreqStatusLabel = () => {
  return 'NOMINAL'; // Grid frequency stays normal; this is a local outage
};

const computeDanger: DangerComputer = ({ running, failed }) => {
  const inDanger = running && failed.size > 2;
  const freqColor = inDanger ? '#ef4444' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, elapsed }) => running && elapsed > 7;

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
  levels: [[0.5, 13.0], [1.5, 12.5], [3, 12.0]],
  fallbackZoom: 11.5,
  overviewFromEnd: 1,
  pitch: 30,
  bearing: -5,
};

// ── Main component ──────────────────────────────────────────
export default function BerlinTeltowCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
  const polygonLayers = useMemo(() => [
    new PolygonLayer({
      id: 'affected-area',
      data: [{ polygon: STEGLITZ_ZEHLENDORF_BOUNDARY }],
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
      dateText="JAN 2026"
      playButtonLabel="ATTACK"
      bootInitText="BERLIN GRID MONITOR v2.0 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${LINES.length} | STATUS: OK`}
      compactSummary="45,000 HOUSEHOLDS -- 15 CABLES DESTROYED"
      compactElapsed={14}
      bannerText="45,000 HOUSEHOLDS -- 15 CABLES DESTROYED"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="HOUSEHOLDS DARK"
      offlineUnit=""
      offlineMax={45000}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
      extraLayers={polygonLayers}
    />
  );
}
