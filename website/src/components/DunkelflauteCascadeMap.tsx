// Dunkelflaute (Dark Doldrums) cascade map -- Germany, November 2024
// Unlike other cascade maps, this shows generation disappearing (not infrastructure failing)
// and tracks wholesale PRICE instead of grid frequency.
import React from 'react';
import CascadeMap from './CascadeMap';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

// -- Camera presets --
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: 10.5, latitude: 51.0, zoom: 5.5, pitch: 35, bearing: -5 },
};

// -- Infrastructure nodes (verified German coordinates) --
const NODES: CascadeNode[] = [
  // Offshore wind
  { id: 'borkum',       pos: [6.5,   54.0],  type: 'wind-offshore', cap: 6800, name: 'North Sea Cluster' },
  { id: 'baltic',       pos: [13.0,  54.5],  type: 'wind-offshore', cap: 1200, name: 'Baltic Sea Cluster' },
  // Onshore wind
  { id: 'schleswig',    pos: [9.5,   54.3],  type: 'wind-onshore',  cap: 7500, name: 'Schleswig-Holstein' },
  { id: 'lowersaxony',  pos: [8.5,   53.0],  type: 'wind-onshore',  cap: 11500, name: 'Lower Saxony' },
  { id: 'brandenburg',  pos: [13.5,  52.4],  type: 'wind-onshore',  cap: 8200, name: 'Brandenburg' },
  // Solar
  { id: 'bavaria',      pos: [11.5,  48.5],  type: 'solar',         cap: 18000, name: 'Bavaria Solar' },
  { id: 'badenwuert',   pos: [9.0,   48.7],  type: 'solar',         cap: 9500,  name: 'Baden-Wuerttemberg' },
  { id: 'saxony',       pos: [13.0,  51.0],  type: 'solar',         cap: 4500,  name: 'Saxony Solar' },
  // Gas backup
  { id: 'irsching',     pos: [11.63, 48.77], type: 'gas',           cap: 1400, name: 'Irsching' },
  { id: 'lingen',       pos: [7.32,  52.52], type: 'gas',           cap: 876,  name: 'Lingen' },
  // Import interconnectors
  { id: 'lauterbourg',  pos: [8.18,  48.97], type: 'import',        cap: 4800, name: 'France IC' },
  { id: 'simbach',      pos: [13.02, 48.26], type: 'import',        cap: 2000, name: 'Austria IC' },
  { id: 'basel',         pos: [7.59,  47.56], type: 'import',        cap: 3800, name: 'Switzerland IC' },
  // Major cities (demand centers)
  { id: 'berlin',       pos: [13.4,  52.52], type: 'city',          cap: 0, name: 'Berlin' },
  { id: 'hamburg',      pos: [10.0,  53.55], type: 'city',          cap: 0, name: 'Hamburg' },
  { id: 'munich',       pos: [11.58, 48.14], type: 'city',          cap: 0, name: 'Munich' },
  { id: 'frankfurt',    pos: [8.68,  50.11], type: 'city',          cap: 0, name: 'Frankfurt' },
  { id: 'cologne',      pos: [6.96,  50.94], type: 'city',          cap: 0, name: 'Cologne' },
];

const DE_LINES: [string, string][] = [
  // Wind to demand
  ['borkum', 'hamburg'], ['borkum', 'lowersaxony'], ['baltic', 'berlin'],
  ['schleswig', 'hamburg'], ['lowersaxony', 'cologne'], ['lowersaxony', 'frankfurt'],
  ['brandenburg', 'berlin'],
  // Solar to demand
  ['bavaria', 'munich'], ['badenwuert', 'frankfurt'], ['saxony', 'berlin'],
  // Gas backup links
  ['irsching', 'munich'], ['lingen', 'hamburg'], ['lingen', 'cologne'],
  // Import links
  ['lauterbourg', 'frankfurt'], ['simbach', 'munich'], ['basel', 'badenwuert'],
  // City interconnections
  ['hamburg', 'berlin'], ['frankfurt', 'cologne'], ['munich', 'frankfurt'],
];

// -- Cascade timeline: generation disappearing --
// "freq" is repurposed as price (EUR/MWh) for this incident
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['borkum'],                    ts: 'NOV 4',     label: 'North Sea wind drops to 5%',          detail: 'High-pressure system blocks Atlantic flow',     freq: 85 },
  { time: 2,  ids: ['schleswig', 'lowersaxony'],   ts: 'NOV 5',     label: 'Onshore wind collapses across north',  detail: 'Still air from coast to Brandenburg',            freq: 150 },
  { time: 4,  ids: ['baltic', 'brandenburg'],      ts: 'NOV 6',     label: 'All wind at 4% capacity',              detail: '170 GW installed, 3 GW producing',              freq: 310 },
  { time: 6,  ids: ['bavaria', 'badenwuert', 'saxony'], ts: 'NOV 6 PM', label: 'Solar output near zero',           detail: 'Overcast skies, 7hr winter daylight',           freq: 450 },
  { time: 8,  ids: ['irsching', 'lingen'],         ts: 'NOV 6 EVE', label: 'Gas plants ramp to maximum',           detail: 'All thermal reserves deployed',                  freq: 580 },
  { time: 10, ids: ['lauterbourg', 'simbach', 'basel'], ts: 'NOV 6-10', label: 'Import lines saturate',            detail: 'France nuclear, Austrian hydro at limit',       freq: 800 },
  { time: 12, ids: [],                              ts: 'DEC 12',    label: 'Prices hit 18-year high',              detail: 'Gas storage: 98% to 85% in weeks',              freq: 936 },
];

// -- Terminal log messages --
const LOG_MSGS: LogMessage[] = [
  { time: 0.5,  text: 'ANTICYCLONE PARKED OVER CENTRAL EUROPE', level: 'warn' },
  { time: 1.5,  text: 'NORTH SEA WIND: 6,800 MW INSTALLED / 340 MW ACTUAL', level: 'warn' },
  { time: 2.5,  text: 'ONSHORE WIND CAPACITY FACTOR: 4.2%', level: 'warn' },
  { time: 3.5,  text: 'ALL MAJOR WIND REGIONS BELOW 5% OUTPUT', level: 'crit' },
  { time: 4.5,  text: 'SOLAR IRRADIANCE: INSUFFICIENT -- OVERCAST', level: 'warn' },
  { time: 5.5,  text: 'RENEWABLE OUTPUT: 4% OF 170 GW INSTALLED', level: 'crit' },
  { time: 6.5,  text: 'DAY-AHEAD PRICE: 450 EUR/MWh -- CLEARING', level: 'crit' },
  { time: 7.5,  text: 'COAL SHARE: 30%+ -- PHASE-OUT PLANTS RUNNING', level: 'warn' },
  { time: 8.5,  text: 'GAS TURBINES AT MAXIMUM DISPATCH', level: 'crit' },
  { time: 9.5,  text: 'CROSS-BORDER IMPORTS AT CAPACITY LIMIT', level: 'crit' },
  { time: 10.5, text: 'FR NUCLEAR + AT HYDRO -- EXPORT CEILING HIT', level: 'crit' },
  { time: 11.5, text: 'GAS STORAGE DRAWDOWN: 98% -> 85%', level: 'crit' },
  { time: 12.5, text: 'INTRADAY PEAK: 936 EUR/MWh -- 18-YEAR HIGH', level: 'crit' },
];

// Colors: amber/yellow tones for wind/solar (not red -- they are not "failing", just no resource)
const TYPE_COLORS: Record<string, number[]> = {
  'wind-offshore': [96, 165, 250],   // blue
  'wind-onshore':  [129, 185, 252],  // lighter blue
  solar:           [250, 204, 21],   // yellow
  gas:             [251, 146, 60],   // orange
  import:          [167, 139, 250],  // purple
  city:            [148, 163, 184],  // slate
};

const LEGEND: LegendItem[] = [
  { c: 'rgb(96,165,250)',  l: 'Wind (offshore)' },
  { c: 'rgb(129,185,252)', l: 'Wind (onshore)' },
  { c: 'rgb(250,204,21)',  l: 'Solar' },
  { c: 'rgb(251,146,60)',  l: 'Gas' },
  { c: 'rgb(167,139,250)', l: 'Import' },
  { c: 'rgb(148,163,184)', l: 'City' },
];

// -- Price-based metric (using freq infrastructure) --
// The "freq" value is actually EUR/MWh price
const computeFreq: FreqComputer = ({ activeStep, cascade, running }) => {
  if (!running) return 50; // baseline price
  const currentCascade = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return currentCascade?.freq ?? 50;
};

const computeOffline: OfflineComputer = ({ failed, nodes }) => {
  // Sum capacity of failed generation nodes (wind + solar)
  let offlineMW = 0;
  for (const node of nodes) {
    if (failed.has(node.id) && (node.type.startsWith('wind') || node.type === 'solar')) {
      offlineMW += node.cap;
    }
  }
  return offlineMW;
};

const freqDisplayFormat = (price: number): string => {
  if (price >= 1000) return price.toLocaleString();
  return Math.round(price).toString();
};

const freqStatusLabel: FreqStatusLabel = (price) => {
  if (price > 800) return 'EXTREME';
  if (price > 400) return 'CRITICAL';
  if (price > 200) return 'ELEVATED';
  if (price > 100) return 'HIGH';
  return 'NORMAL';
};

// Amber/orange danger progression (price event, not blackout)
const AMBER = '#f59e0b';
const AMBER_DARK = '#d97706';
const RED = '#ef4444';

const computeDanger: DangerComputer = ({ running, freq: price }) => {
  // price thresholds for color changes
  const inDanger = running && price > 400;
  let freqColor = '#22d3ee'; // cyan = normal
  let glowColor = '#22d3ee';
  let borderClr = 'rgba(34,211,238,0.35)';

  if (price > 800) {
    freqColor = RED;
    glowColor = RED;
    borderClr = 'rgba(239,68,68,0.5)';
  } else if (price > 400) {
    freqColor = RED;
    glowColor = AMBER;
    borderClr = 'rgba(245,158,11,0.5)';
  } else if (price > 200) {
    freqColor = AMBER;
    glowColor = AMBER;
    borderClr = 'rgba(245,158,11,0.4)';
  } else if (price > 100) {
    freqColor = AMBER_DARK;
    glowColor = AMBER_DARK;
    borderClr = 'rgba(217,119,6,0.35)';
  }

  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, freq: price }) => running && price > 800;

// -- Node overrides: amber for wind/solar going offline, gas/imports get highlighted --
const GAS_GREEN = [16, 185, 129];   // gas plants are "saving the grid" -- highlight green
const IMPORT_GREEN = [52, 211, 153];

const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => {
    // No X marks for gas/import -- they are ramping UP, not failing
    if (node.type === 'gas' || node.type === 'import') return false;
    return failed.has(node.id);
  },
  getFillColor: (node, ctx) => {
    // Gas plants glow green when activated (running)
    if (node.type === 'gas' && ctx.failed.has(node.id) && ctx.running) return [...GAS_GREEN, 200];
    // Import ICs glow green when saturated
    if (node.type === 'import' && ctx.failed.has(node.id) && ctx.running) return [...IMPORT_GREEN, 200];
    // Cities stay neutral
    if (node.type === 'city') return [148, 163, 184, 100];
    return undefined;
  },
  getLineColor: (node, ctx) => {
    if (node.type === 'gas' && ctx.failed.has(node.id) && ctx.running) return [...GAS_GREEN, 255];
    if (node.type === 'import' && ctx.failed.has(node.id) && ctx.running) return [...IMPORT_GREEN, 255];
    return undefined;
  },
  getRadius: (node) => {
    if (node.type === 'city') return 4000;
    if (node.type === 'wind-offshore') return 8000;
    return undefined;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 7.5], [1.5, 7.0], [3, 6.5]],
  fallbackZoom: 5.5,
  overviewFromEnd: 1,
  pitch: 35,
  bearing: -5,
};

// -- Main component --
export default function DunkelflauteCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
  return (
    <CascadeMap
      width={width}
      height={height}
      variant="hud"
      nodes={NODES}
      lines={DE_LINES}
      cascade={CASCADE}
      logMessages={LOG_MSGS}
      views={VIEWS}
      typeColors={TYPE_COLORS}
      legendItems={LEGEND}
      monitorName="GERMAN GRID MONITOR"
      dateText="NOV 2024"
      playButtonLabel="DUNKELFLAUTE"
      bootInitText="GERMAN GRID MONITOR v3.0 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${DE_LINES.length} | STATUS: OK`}
      compactSummary="DUNKELFLAUTE -- 170 GW AT 4% OUTPUT"
      compactElapsed={14}
      bannerText="DUNKELFLAUTE -- 936 EUR/MWh"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="RENEWABLES OFFLINE"
      offlineUnit="MW"
      offlineMax={67200}
      showOfflineBar={true}
      freqDisplayLabel="WHOLESALE PRICE"
      freqDisplayUnit="EUR/MWh"
      freqDisplayFormat={freqDisplayFormat}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
    />
  );
}
