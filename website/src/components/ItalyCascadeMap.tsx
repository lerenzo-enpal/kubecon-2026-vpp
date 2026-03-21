// Thin wrapper around CascadeMap for the 2003 Italy nationwide blackout
import React from 'react';
import CascadeMap from './CascadeMap';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds,
} from './CascadeMap';

// -- Camera presets --------------------------------------------------------
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: 12.5, latitude: 42.5, zoom: 5.5, pitch: 35, bearing: -5 },
};

// -- Infrastructure data ---------------------------------------------------
const NODES: CascadeNode[] = [
  // International interconnectors (outside Italy)
  { id: 'albertville',  pos: [6.39, 45.68],   type: 'ic',  cap: 2200, name: 'Albertville (FR)' },
  { id: 'lukmanier',   pos: [8.80, 46.57],    type: 'ic',  cap: 2000, name: 'Lukmanier 380kV (CH)' },
  { id: 'sils',        pos: [9.76, 46.43],     type: 'ic',  cap: 1400, name: 'Sils-Soazza (CH)' },
  { id: 'lienz',       pos: [12.77, 46.83],   type: 'ic',  cap: 600,  name: 'Lienz (AT)' },
  { id: 'redipuglia',  pos: [13.49, 45.85],   type: 'ic',  cap: 400,  name: 'Redipuglia (SI)' },

  // Key substations (border receiving)
  { id: 'rondissone',  pos: [7.97, 45.24],    type: 'sub', cap: 0,    name: 'Rondissone Sub' },
  { id: 'musignano',   pos: [8.73, 45.92],    type: 'sub', cap: 0,    name: 'Musignano Sub' },

  // Internal spine cities
  { id: 'turin',       pos: [7.69, 45.07],    type: 'city', cap: 0,   name: 'Turin' },
  { id: 'milan',       pos: [9.19, 45.46],    type: 'city', cap: 0,   name: 'Milan' },
  { id: 'bologna',     pos: [11.34, 44.49],   type: 'city', cap: 0,   name: 'Bologna' },
  { id: 'florence',    pos: [11.25, 43.77],   type: 'city', cap: 0,   name: 'Florence' },
  { id: 'rome',        pos: [12.50, 41.90],   type: 'city', cap: 0,   name: 'Rome' },
  { id: 'naples',      pos: [14.27, 40.85],   type: 'city', cap: 0,   name: 'Naples' },

  // Thermal generation hubs
  { id: 'brindisi',    pos: [17.94, 40.63],   type: 'gas', cap: 2640, name: 'Brindisi Thermal' },
  { id: 'civitavecchia', pos: [11.80, 42.09], type: 'gas', cap: 3600, name: 'Civitavecchia' },
  { id: 'genoa',       pos: [8.93, 44.41],    type: 'gas', cap: 1200, name: 'Genoa' },
];

// Lines: international import + domestic spine + thermal feeds
const ITALY_LINES: [string, string][] = [
  // Import interconnectors to border substations
  ['albertville', 'rondissone'],
  ['lukmanier', 'musignano'],
  ['sils', 'musignano'],
  ['lienz', 'bologna'],
  ['redipuglia', 'bologna'],

  // Border substations to spine
  ['rondissone', 'turin'],
  ['musignano', 'milan'],

  // Domestic 380kV spine
  ['turin', 'milan'],
  ['milan', 'bologna'],
  ['bologna', 'florence'],
  ['florence', 'rome'],
  ['rome', 'naples'],

  // Thermal feeds
  ['genoa', 'milan'],
  ['civitavecchia', 'rome'],
  ['brindisi', 'naples'],
];

// -- Cascade timeline (27 minutes compressed) ------------------------------
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['lukmanier'],                                ts: '03:01:21', label: 'Lukmanier 380kV line trips -- tree flashover',           detail: '2,000 MW Swiss import path lost',                     freq: 49.7 },
  { time: 3,  ids: ['sils'],                                     ts: '03:25:21', label: 'Sils-Soazza overloads -- second tree contact',            detail: '24 min overloaded, sagged into vegetation',           freq: 49.2 },
  { time: 5,  ids: ['albertville', 'lienz', 'redipuglia'],        ts: '03:25:33', label: 'All remaining interconnectors cascade-trip (12 sec)',     detail: 'Overload + angular instability -- Italy isolated',    freq: 48.8 },
  { time: 7,  ids: ['musignano', 'rondissone'],                   ts: '03:25:25', label: 'Frequency collapse -- 50 Hz to 49 Hz in 2.5 sec',       detail: '6,400 MW imports gone, 0.3 Hz/sec decline',           freq: 48.0 },
  { time: 9,  ids: ['genoa', 'civitavecchia', 'brindisi'],        ts: '03:25:28', label: 'UFLS insufficient -- generators tripping',               detail: '7,500 MW distributed gen trips on under-voltage',     freq: 47.5 },
  { time: 11, ids: ['turin', 'milan', 'bologna', 'florence', 'rome', 'naples'], ts: '03:25:34', label: 'Total blackout -- 56 million people',  detail: '27 minutes from first fault to system collapse',      freq: 0 },
];

// -- Terminal log messages -------------------------------------------------
const LOG_MSGS: LogMessage[] = [
  { time: 0.3,  text: '03:01 CEST -- 380kV LUKMANIER LINE FAULT DETECTED', level: 'warn' },
  { time: 0.8,  text: 'TREE FLASHOVER -- RECLOSURE ATTEMPT FAILED', level: 'crit' },
  { time: 1.5,  text: 'ETRANS: REQUESTING 300 MW REDUCTION (NEED 2000 MW)', level: 'warn' },
  { time: 2.5,  text: 'PARALLEL LINES OVERLOADED -- 24 MINUTES', level: 'warn' },
  { time: 3.3,  text: 'SILS-SOAZZA 380kV -- CONDUCTOR SAG INTO TREES', level: 'crit' },
  { time: 3.8,  text: 'SECOND SWISS LINE TRIPPED -- CASCADE IMMINENT', level: 'crit' },
  { time: 5.3,  text: 'ALL IMPORT LINES TRIPPING -- 12 SECOND CASCADE', level: 'crit' },
  { time: 5.8,  text: 'ITALY ISOLATED FROM UCTE GRID', level: 'crit' },
  { time: 7.3,  text: 'FREQ: 50.0 -> 49.0 Hz IN 2.5 SECONDS', level: 'crit' },
  { time: 7.8,  text: '6,400 MW IMPORTS LOST -- 25% OF DEMAND', level: 'crit' },
  { time: 9.3,  text: 'UFLS ACTIVATED -- INSUFFICIENT LOAD SHED', level: 'crit' },
  { time: 9.8,  text: '7,500 MW DISTRIBUTED GEN TRIPPING ON UV', level: 'crit' },
  { time: 11.3, text: '\u2588\u2588 TOTAL BLACKOUT \u2588\u2588 -- 56 MILLION PEOPLE', level: 'crit' },
  { time: 11.8, text: 'ALL GENERATION OFFLINE -- ONLY SARDINIA SPARED', level: 'crit' },
  { time: 12.5, text: 'FIRST FAULT TO BLACKOUT: 27 MINUTES', level: 'crit' },
];

// -- Colors & legend -------------------------------------------------------
const TYPE_COLORS: Record<string, number[]> = {
  ic:   [167, 139, 250],  // purple -- interconnector
  city: [148, 163, 184],  // grey   -- city hub
  gas:  [251, 146, 60],   // orange -- thermal generation
  sub:  [100, 116, 139],  // slate  -- substation
};

const LEGEND: LegendItem[] = [
  { c: 'rgb(167,139,250)', l: 'Import Line' },
  { c: 'rgb(148,163,184)', l: 'City Hub' },
  { c: 'rgb(251,146,60)',  l: 'Thermal' },
  { c: 'rgb(100,116,139)', l: 'Substation' },
];

// -- Frequency from cascade step data --------------------------------------
const computeFreq: FreqComputer = ({ activeStep, cascade }) => {
  const step = activeStep >= 0 && activeStep < cascade.length ? cascade[activeStep] : null;
  return step?.freq ?? 50.0;
};

const computeOffline: OfflineComputer = ({ failed }) => {
  return Math.min(6400, Math.floor((failed.size / NODES.length) * 6400));
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq === 0) return 'TOTAL BLACKOUT';
  if (freq < 48.5) return '\u26A0 COLLAPSE';
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

// -- No special node overrides for Italy -----------------------------------
const nodeOverrides: NodeOverrides = {
  showXMark: (node, failed) => failed.has(node.id),
};

// -- Zoom thresholds -------------------------------------------------------
const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 7.5], [1.5, 7.0], [3, 6.2]],
  fallbackZoom: 5.5,
  overviewFromEnd: 1,
  pitch: 35,
  bearing: -5,
};

// -- Main component --------------------------------------------------------
export default function ItalyCascadeMap({ width, height = 700 }: { width?: number; height?: number }) {
  return (
    <CascadeMap
      width={width}
      height={height}
      variant="hud"
      nodes={NODES}
      lines={ITALY_LINES}
      cascade={CASCADE}
      logMessages={LOG_MSGS}
      views={VIEWS}
      typeColors={TYPE_COLORS}
      legendItems={LEGEND}
      monitorName="GRTN GRID MONITOR"
      dateText="SEP 2003"
      playButtonLabel="BLACKOUT"
      bootInitText="GRTN GRID MONITOR v1.0 INIT..."
      bootInfoText={`NODES: ${NODES.length} | LINKS: ${ITALY_LINES.length} | STATUS: OK`}
      compactSummary="TOTAL BLACKOUT -- 6,400 MW IMPORTS LOST"
      compactElapsed={13}
      bannerText="TOTAL BLACKOUT -- 56 MILLION PEOPLE"
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="IMPORTS LOST"
      offlineUnit="MW"
      offlineMax={6400}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
    />
  );
}
