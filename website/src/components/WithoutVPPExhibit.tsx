import React from 'react';
import CascadeMap from './CascadeMap';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';

// ── Camera presets ──────────────────────────────────────────
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: 138.5, latitude: -34.0, zoom: 6.2, pitch: 35, bearing: -5 },
};

// ── Infrastructure data (same SA grid as SACascadeMap) ──────
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
  { id: 'waterloo',   pos: [138.900, -33.980], type: 'wind',  cap: 111,  name: 'Waterloo' },
  { id: 'canunda',    pos: [140.417, -37.810], type: 'wind',  cap: 46,   name: 'Canunda' },
  { id: 'lakebonney', pos: [140.407, -37.771], type: 'wind',  cap: 279,  name: 'Lake Bonney 1-3' },
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
  { time: 10, ids: ['para', 'waterloo', 'canunda', 'lakebonney'],         ts: '16:18:16', label: 'SYSTEM BLACK -- 850,000 connections',             detail: '0 batteries. 0 response. 43 seconds.',           freq: 0 },
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
  { time: 9.5,  text: 'DISTRIBUTED STORAGE: 0 MW -- NO VPP INSTALLED', level: 'crit' },
  { time: 10.2, text: '\u2588\u2588 SYSTEM BLACK \u2588\u2588 -- ALL SA GENERATION OFFLINE', level: 'crit' },
  { time: 10.8, text: '850,000 CUSTOMER CONNECTIONS LOST', level: 'crit' },
  { time: 11.5, text: 'TOTAL CASCADE TIME: 43 SECONDS', level: 'crit' },
];

const TYPE_COLORS: Record<string, number[]> = { wind: [96, 165, 250], gas: [251, 146, 60], sub: [148, 163, 184], ic: [167, 139, 250] };

const LEGEND: LegendItem[] = [
  { c: 'rgb(96,165,250)', l: 'Wind' }, { c: 'rgb(251,146,60)', l: 'Gas' },
  { c: 'rgb(148,163,184)', l: 'Substation' }, { c: 'rgb(167,139,250)', l: 'Interconnector' },
  { c: 'rgba(100,100,100,0.5)', l: 'No batteries' },
];

// ── Ghost home positions — where VPP homes WOULD have been ──
// Scattered across Adelaide metro area (representing the 1,100 homes
// that a VPP like Hornsdale/Tesla SA VPP would have deployed)
const GHOST_HOMES: { pos: [number, number] }[] = [
  { pos: [138.55, -34.85] }, { pos: [138.58, -34.82] }, { pos: [138.61, -34.79] },
  { pos: [138.54, -34.78] }, { pos: [138.57, -34.76] }, { pos: [138.50, -34.83] },
  { pos: [138.63, -34.81] }, { pos: [138.52, -34.88] }, { pos: [138.59, -34.75] },
  { pos: [138.56, -34.90] }, { pos: [138.48, -34.80] }, { pos: [138.65, -34.77] },
  { pos: [138.53, -34.73] }, { pos: [138.60, -34.87] }, { pos: [138.57, -34.92] },
  { pos: [138.62, -34.74] }, { pos: [138.51, -34.86] }, { pos: [138.64, -34.84] },
  { pos: [138.49, -34.77] }, { pos: [138.58, -34.70] }, { pos: [138.55, -34.95] },
  { pos: [138.46, -34.82] }, { pos: [138.67, -34.80] }, { pos: [138.53, -34.69] },
];

// ── Computations ─────────────────────────────────────────────
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 50.0;
};

const computeOffline: OfflineComputer = ({ failed }) => {
  return Math.min(456, Math.floor((failed.size / NODES.length) * 456));
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq === 0) return 'SYSTEM BLACK';
  if (freq < 49.0) return 'EMERGENCY';
  if (freq < 49.5) return 'WARNING';
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

// ── Node overrides: all nodes fail red (no survivors in "without VPP") ──
const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => failed.has(node.id),
  getRadius: (node) => {
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

// ── Ghost home layers (greyed-out battery locations) ─────────
const ghostHomeLayers = [
  new ScatterplotLayer({
    id: 'ghost-homes-outline',
    data: GHOST_HOMES,
    getPosition: (d: { pos: [number, number] }) => d.pos,
    getRadius: 2200,
    getFillColor: [80, 80, 80, 40],
    getLineColor: [100, 100, 100, 120],
    getLineWidth: 1,
    stroked: true,
    lineWidthUnits: 'pixels',
    radiusUnits: 'meters',
    pickable: false,
  }),
  new ScatterplotLayer({
    id: 'ghost-homes-dot',
    data: GHOST_HOMES,
    getPosition: (d: { pos: [number, number] }) => d.pos,
    getRadius: 800,
    getFillColor: [100, 100, 100, 60],
    radiusUnits: 'meters',
    pickable: false,
  }),
  new TextLayer({
    id: 'ghost-homes-label',
    data: [{ pos: [138.56, -34.97] as [number, number], text: 'NO BATTERIES INSTALLED' }],
    getPosition: (d: { pos: [number, number] }) => d.pos,
    getText: (d: { text: string }) => d.text,
    getSize: 13,
    getColor: [120, 120, 120, 180],
    fontFamily: 'JetBrains Mono, monospace',
    fontWeight: 700,
    getTextAnchor: 'middle',
    getAlignmentBaseline: 'center',
    billboard: true,
    pickable: false,
  }),
];

// ── Comparison overlay after cascade ─────────────────────────
const extraTimelineContent = ({ running, showBanner }: { running: boolean; elapsed: number; showBanner: boolean }) => {
  if (!showBanner) return null;
  return (
    <div style={{
      marginTop: 12,
      padding: '10px 12px',
      background: 'rgba(239, 68, 68, 0.08)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: 6,
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      <div style={{ fontSize: 10, color: '#ef4444', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 700 }}>
        COMPARISON
      </div>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{
          flex: 1, padding: '8px 10px', borderRadius: 4,
          background: 'rgba(34, 211, 238, 0.06)', border: '1px solid rgba(34, 211, 238, 0.2)',
        }}>
          <div style={{ fontSize: 9, color: '#22d3ee', letterSpacing: '0.08em', marginBottom: 4 }}>WITH VPP</div>
          <div style={{ fontSize: 14, color: '#22d3ee', fontWeight: 700 }}>6 sec</div>
          <div style={{ fontSize: 9, color: 'rgba(34, 211, 238, 0.7)', marginTop: 2 }}>Grid stable</div>
        </div>
        <div style={{
          flex: 1, padding: '8px 10px', borderRadius: 4,
          background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.2)',
        }}>
          <div style={{ fontSize: 9, color: '#ef4444', letterSpacing: '0.08em', marginBottom: 4 }}>WITHOUT VPP</div>
          <div style={{ fontSize: 14, color: '#ef4444', fontWeight: 700 }}>43 sec</div>
          <div style={{ fontSize: 9, color: 'rgba(239, 68, 68, 0.7)', marginTop: 2 }}>System black</div>
        </div>
      </div>
      <div style={{
        marginTop: 8, fontSize: 10, color: 'rgba(255,255,255,0.6)',
        textAlign: 'center', lineHeight: 1.4,
      }}>
        Same grid. 1,100 batteries would have prevented this.
      </div>
    </div>
  );
};

// ── Main component ──────────────────────────────────────────
export default function WithoutVPPExhibit({ width, height = 700 }: { width?: number; height?: number }) {
  return (
    <div style={{ position: 'relative' }}>
      {/* "WITHOUT VPP" badge */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 20,
        padding: '6px 14px',
        background: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.5)',
        borderRadius: 4,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 12, fontWeight: 700,
        color: '#ef4444',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        backdropFilter: 'blur(8px)',
      }}>
        WITHOUT VPP
      </div>

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
        monitorName="SA GRID -- NO VPP"
        dateText="SEP 2016"
        playButtonLabel="BLACKOUT"
        bootInitText="SA GRID MONITOR v1.3 INIT..."
        bootInfoText={`NODES: ${NODES.length} | LINKS: ${SA_LINES.length} | VPP: NONE`}
        compactSummary="SYSTEM BLACK -- 0 BATTERIES -- 43 SEC"
        compactElapsed={12}
        bannerText="SYSTEM BLACK -- ZERO DISTRIBUTED STORAGE"
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
        extraLayers={ghostHomeLayers}
        extraTimelineContent={extraTimelineContent}
      />
    </div>
  );
}
