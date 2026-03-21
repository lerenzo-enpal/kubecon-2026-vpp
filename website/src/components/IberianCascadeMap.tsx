// TODO: Shared between website and presentation — combine into shared component
import React from 'react';
import CascadeMap from './CascadeMap';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: -3.5, latitude: 39.5, zoom: 5.2, pitch: 30, bearing: -5 },
};

// ── Infrastructure nodes ────────────────────────────────────
const NODES: CascadeNode[] = [
  // Major hubs
  { id: 'madrid',     pos: [-3.7, 40.4],   type: 'hub',    cap: 6000, name: 'Madrid' },
  { id: 'barcelona',  pos: [2.2, 41.4],    type: 'hub',    cap: 3500, name: 'Barcelona' },
  { id: 'lisbon',     pos: [-9.1, 38.7],   type: 'hub',    cap: 2800, name: 'Lisbon' },
  { id: 'seville',    pos: [-6.0, 37.4],   type: 'hub',    cap: 2000, name: 'Seville' },
  { id: 'valencia',   pos: [-0.4, 39.5],   type: 'hub',    cap: 1800, name: 'Valencia' },
  { id: 'porto',      pos: [-8.6, 41.15],  type: 'hub',    cap: 1500, name: 'Porto' },
  { id: 'bilbao',     pos: [-2.9, 43.25],  type: 'hub',    cap: 1200, name: 'Bilbao' },
  // Solar farms (major clusters)
  { id: 'solar_jaen',      pos: [-3.5, 38.0],  type: 'solar', cap: 1200, name: 'Jaen Solar' },
  { id: 'solar_cordoba',   pos: [-4.8, 37.8],  type: 'solar', cap: 900,  name: 'Cordoba Solar' },
  { id: 'solar_badajoz',   pos: [-6.5, 38.5],  type: 'solar', cap: 1100, name: 'Badajoz Solar' },
  { id: 'solar_ciudad',    pos: [-3.0, 39.0],  type: 'solar', cap: 800,  name: 'Ciudad Real Solar' },
  { id: 'solar_albacete',  pos: [-2.0, 39.5],  type: 'solar', cap: 750,  name: 'Albacete Solar' },
  { id: 'solar_murcia',    pos: [-1.0, 38.0],  type: 'solar', cap: 650,  name: 'Murcia Solar' },
  { id: 'solar_caceres',   pos: [-5.5, 39.0],  type: 'solar', cap: 700,  name: 'Caceres Solar' },
  // France interconnection
  { id: 'france_ic', pos: [1.5, 43.5], type: 'ic', cap: 2800, name: 'France IC' },
  // Nuclear
  { id: 'almaraz',   pos: [-5.7, 39.8], type: 'nuclear', cap: 1950, name: 'Almaraz Nuclear' },
  { id: 'cofrentes', pos: [-1.0, 39.2], type: 'nuclear', cap: 1090, name: 'Cofrentes Nuclear' },
];

const LINES: [string, string][] = [
  ['madrid', 'barcelona'], ['madrid', 'valencia'], ['madrid', 'seville'],
  ['madrid', 'bilbao'], ['madrid', 'solar_jaen'], ['madrid', 'solar_ciudad'],
  ['madrid', 'almaraz'], ['barcelona', 'france_ic'], ['barcelona', 'valencia'],
  ['lisbon', 'porto'], ['lisbon', 'seville'], ['lisbon', 'solar_badajoz'],
  ['seville', 'solar_cordoba'], ['seville', 'solar_jaen'],
  ['valencia', 'solar_albacete'], ['valencia', 'solar_murcia'], ['valencia', 'cofrentes'],
  ['porto', 'bilbao'], ['solar_caceres', 'almaraz'], ['solar_badajoz', 'solar_caceres'],
];

// ── Cascade: overvoltage collapse in 6 seconds ─────────────
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['solar_jaen', 'solar_cordoba'],                          ts: '12:33:00', label: 'Voltage climbing -- first solar inverters trip',    detail: '59% solar penetration, overvoltage rising',     freq: 50.1 },
  { time: 2,  ids: ['solar_badajoz', 'solar_ciudad', 'solar_caceres'],       ts: '12:33:01', label: 'Overvoltage cascade -- 5 GW solar disconnecting',  detail: 'Inverters enter protective shutdown',           freq: 50.3 },
  { time: 4,  ids: ['solar_albacete', 'solar_murcia'],                        ts: '12:33:03', label: 'All major solar offline -- 9 GW lost',             detail: 'Grid reactive power collapses',                 freq: 49.2 },
  { time: 6,  ids: ['france_ic'],                                             ts: '12:33:04', label: 'France interconnector overloads -- trips',         detail: '2,800 MW import capacity lost',                 freq: 48.5 },
  { time: 8,  ids: ['almaraz', 'cofrentes'],                                  ts: '12:33:05', label: 'Nuclear plants disconnect -- protective shutdown', detail: 'Frequency deviation exceeds tolerance',         freq: 47.8 },
  { time: 10, ids: ['madrid', 'barcelona', 'lisbon', 'seville', 'valencia', 'porto', 'bilbao'], ts: '12:33:06', label: 'TOTAL BLACKOUT -- 60 million people', detail: '15 GW lost in 6 seconds. Fastest national collapse ever.', freq: 0 },
];

const LOG_MSGS: LogMessage[] = [
  { time: 0.3,  text: 'VOLTAGE ALERT: 1.08 p.u. ACROSS SOUTHERN SPAIN', level: 'warn' },
  { time: 0.8,  text: 'JAEN SOLAR CLUSTER -- INVERTER OVERVOLTAGE TRIP', level: 'crit' },
  { time: 1.5,  text: 'CORDOBA SOLAR -- 900 MW DISCONNECTED', level: 'crit' },
  { time: 2.5,  text: 'OVERVOLTAGE CASCADE SPREADING -- BADAJOZ, CIUDAD REAL', level: 'crit' },
  { time: 3.5,  text: 'CACERES SOLAR OFFLINE -- VOLTAGE STILL RISING', level: 'crit' },
  { time: 4.5,  text: '9 GW SOLAR GENERATION LOST -- REACTIVE POWER COLLAPSE', level: 'crit' },
  { time: 5.5,  text: 'FREQUENCY NOW FALLING -- 49.2 Hz', level: 'crit' },
  { time: 6.5,  text: 'FRANCE IC OVERLOADED AT 3,200 MW -- TRIPPED', level: 'crit' },
  { time: 7.5,  text: 'IBERIAN PENINSULA ISLANDED FROM ENTSO-E', level: 'crit' },
  { time: 8.5,  text: 'ALMARAZ + COFRENTES NUCLEAR -- SCRAM', level: 'crit' },
  { time: 9.5,  text: 'FREQUENCY COLLAPSE -- 47.8 Hz', level: 'crit' },
  { time: 10.3, text: '\u2588\u2588 TOTAL BLACKOUT \u2588\u2588 -- 60M PEOPLE', level: 'crit' },
  { time: 11.0, text: '15 GW LOST IN 6 SECONDS', level: 'crit' },
  { time: 11.5, text: 'FASTEST NATIONAL-SCALE COLLAPSE ON RECORD', level: 'crit' },
];

const TYPE_COLORS: Record<string, number[]> = {
  solar: [245, 158, 11], hub: [148, 163, 184], ic: [167, 139, 250], nuclear: [96, 165, 250],
};

const LEGEND: LegendItem[] = [
  { c: 'rgb(245,158,11)', l: 'Solar' }, { c: 'rgb(148,163,184)', l: 'City Hub' },
  { c: 'rgb(96,165,250)', l: 'Nuclear' }, { c: 'rgb(167,139,250)', l: 'Interconnector' },
];

// ── Iberian-specific: freq from cascade step ────────────────
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 50.0;
};

const computeOffline: OfflineComputer = ({ failed }) => {
  return Math.min(15, Math.floor((failed.size / NODES.length) * 15));
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq === 0) return 'TOTAL BLACKOUT';
  if (freq < 49.0) return '\u26A0 EMERGENCY';
  if (freq > 50.0) return '\u26A0 OVERVOLTAGE';
  return 'NOMINAL';
};

// ── Iberian-specific: overvoltage (amber) for freq > 50 ─────
const computeDanger: DangerComputer = ({ running, freq }) => {
  const isOvervoltage = running && freq > 50.0;
  const inDanger = running && (freq === 0 || freq < 49.0);
  const freqColor = freq === 0 ? '#ef4444' : freq < 49.0 ? '#ef4444' : freq > 50.0 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : isOvervoltage ? '#f59e0b' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : isOvervoltage ? 'rgba(245,158,11,0.4)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, freq }) => running && freq === 0;

// ── Iberian node overrides: hub radius sizing ───────────────
const nodeOverrides: NodeOverrides = {
  getRadius: (node, ctx) => {
    if (node.type === 'hub') return ctx.isInIncident(node.id) ? 6500 : 5000;
    const base = 3600 * Math.sqrt(Math.max(node.cap, 200) / 500);
    return ctx.isInIncident(node.id) ? base * 1.3 : base;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[1, 7.5], [2.5, 6.8], [5, 6.0]],
  fallbackZoom: 5.2,
  overviewFromEnd: 1,
  pitch: 30,
  bearing: -5,
};

export default function IberianCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
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
      monitorName="IBERIAN GRID"
      dateText="APR 2025"
      playButtonLabel="BLACKOUT"
      bootInitText="IBERIAN GRID MONITOR v1.0 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${LINES.length} | SOLAR: 59%`}
      compactSummary="TOTAL BLACKOUT -- 15 GW LOST IN 6 SEC"
      compactElapsed={13}
      bannerText="TOTAL BLACKOUT -- 6 SECONDS"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="GENERATION LOST"
      offlineUnit="GW"
      offlineMax={15}
      showOfflineBar={false}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
    />
  );
}
