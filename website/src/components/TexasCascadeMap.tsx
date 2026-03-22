// TODO: Shared between website and presentation — combine into shared component
import React from 'react';
import CascadeMap from './CascadeMap';
import type {
  CascadeNode, CascadeStep, LogMessage, LegendItem, ViewPreset,
  FreqComputer, OfflineComputer, FreqStatusLabel, DangerComputer,
  BannerShowCondition, NodeOverrides, ZoomThresholds, CinematicCtx,
} from './CascadeMap';

// ── Camera presets ──────────────────────────────────────────
const VIEWS: Record<string, ViewPreset> = {
  hud: { longitude: -100.2, latitude: 30.8, zoom: 5.6, pitch: 45, bearing: -5 },
  cinematic: { longitude: -97.5, latitude: 31.0, zoom: 5.5, pitch: 50, bearing: -8 },
};

// ── Power plant data ────────────────────────────────────────
const PLANTS: CascadeNode[] = [
  { id: 'amarillo', pos: [-101.83, 35.22], type: 'wind', cap: 4.0, name: 'Amarillo Wind' },
  { id: 'lubbock', pos: [-101.85, 33.58], type: 'wind', cap: 3.2, name: 'Lubbock Wind' },
  { id: 'roscoe', pos: [-100.5, 32.45], type: 'wind', cap: 2.5, name: 'Roscoe Wind Farm' },
  { id: 'midland', pos: [-102.08, 31.99], type: 'gas', cap: 2.1, name: 'Midland/Odessa' },
  { id: 'abilene', pos: [-99.73, 32.45], type: 'gas', cap: 1.8, name: 'Abilene' },
  { id: 'dfw', pos: [-96.80, 32.78], type: 'gas', cap: 6.5, name: 'Dallas/Fort Worth' },
  { id: 'midlothian', pos: [-96.99, 32.48], type: 'gas', cap: 1.6, name: 'Midlothian' },
  { id: 'forney', pos: [-96.47, 32.75], type: 'gas', cap: 1.9, name: 'Forney Energy' },
  { id: 'comanche', pos: [-97.79, 32.30], type: 'nuclear', cap: 2.3, name: 'Comanche Peak' },
  { id: 'martin', pos: [-94.57, 32.26], type: 'coal', cap: 2.3, name: 'Martin Lake' },
  { id: 'waco', pos: [-97.15, 31.55], type: 'gas', cap: 1.5, name: 'Waco' },
  { id: 'limestone', pos: [-96.54, 31.43], type: 'coal', cap: 1.9, name: 'Limestone' },
  { id: 'oakgrove', pos: [-96.50, 31.05], type: 'coal', cap: 1.8, name: 'Oak Grove' },
  { id: 'austin', pos: [-97.74, 30.27], type: 'gas', cap: 2.8, name: 'Austin' },
  { id: 'sanantonio', pos: [-98.49, 29.42], type: 'gas', cap: 3.5, name: 'San Antonio' },
  { id: 'houston', pos: [-95.37, 29.76], type: 'gas', cap: 8.0, name: 'Houston' },
  { id: 'parish', pos: [-95.63, 29.48], type: 'coal', cap: 3.7, name: 'W.A. Parish' },
  { id: 'cedarbayou', pos: [-94.97, 29.77], type: 'gas', cap: 1.5, name: 'Cedar Bayou' },
  { id: 'stp', pos: [-96.05, 28.80], type: 'nuclear', cap: 2.7, name: 'STP Nuclear' },
  { id: 'corpus', pos: [-97.40, 27.80], type: 'gas', cap: 1.8, name: 'Corpus Christi' },
];

const TX_LINES: [string, string][] = [
  ['amarillo', 'lubbock'], ['lubbock', 'roscoe'], ['roscoe', 'abilene'],
  ['abilene', 'dfw'], ['abilene', 'waco'], ['midland', 'abilene'],
  ['midland', 'sanantonio'], ['dfw', 'midlothian'], ['dfw', 'forney'],
  ['dfw', 'comanche'], ['comanche', 'waco'], ['dfw', 'martin'],
  ['waco', 'austin'], ['waco', 'limestone'], ['limestone', 'oakgrove'],
  ['austin', 'sanantonio'], ['oakgrove', 'austin'], ['houston', 'parish'],
  ['houston', 'cedarbayou'], ['houston', 'austin'], ['houston', 'stp'],
  ['sanantonio', 'corpus'], ['stp', 'corpus'], ['martin', 'forney'],
];

// ── Cascade timeline ────────────────────────────────────────
const CASCADE: CascadeStep[] = [
  { time: 0,  ids: ['amarillo', 'lubbock', 'roscoe'], ts: 'FEB 14 AM', label: 'Wind turbines freeze -- Panhandle', detail: '16,000 MW wind offline' },
  { time: 3,  ids: ['midland'], ts: 'FEB 14 PM', label: 'Gas wells freeze -- Permian Basin', detail: 'Gas supply drops 50%' },
  { time: 5,  ids: ['abilene'], ts: 'FEB 14 EVE', label: 'Gas plants lose fuel supply', detail: 'Cascading gas shortage' },
  { time: 6,  ids: ['midlothian', 'forney'], ts: 'FEB 14 11PM', label: 'DFW gas plants trip offline', detail: 'Midlothian at 30%' },
  { time: 7,  ids: ['martin', 'limestone'], ts: 'FEB 15 1AM', label: 'East TX coal & lignite fail', detail: 'Frozen coal piles' },
  { time: 8,  ids: ['oakgrove', 'parish'], ts: 'FEB 15 2AM', label: 'Central + Houston tripping', detail: '35,000 MW offline' },
  { time: 9,  ids: ['cedarbayou', 'waco'], ts: 'FEB 15 3AM', label: 'Cascade spreads statewide', detail: 'Load shedding begins' },
  { time: 10, ids: ['stp'], ts: 'FEB 15 5:37AM', label: 'STP Nuclear Unit 1 trips', detail: 'Frozen sensor line' },
  { time: 11, ids: ['corpus', 'sanantonio', 'austin'], ts: 'FEB 15-18', label: '4.5 million homes go dark', detail: '52,277 MW offline' },
  { time: 13, ids: ['houston', 'dfw'], ts: 'FEB 15-19', label: 'Grid emergency -- 70+ hours', detail: '48.6% capacity gone' },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS: LogMessage[] = [
  { time: 0.5,  text: 'WIND GENERATION OFFLINE \u2014 PANHANDLE CLUSTER', level: 'warn' },
  { time: 2.0,  text: 'TEMP: -18\u00B0C \u2014 EQUIPMENT FREEZE WARNING', level: 'warn' },
  { time: 3.5,  text: 'GAS SUPPLY FAILING \u2014 PERMIAN BASIN', level: 'crit' },
  { time: 5.0,  text: 'GAS-ELECTRIC DEATH SPIRAL DETECTED', level: 'crit' },
  { time: 6.5,  text: 'DFW REGION: MULTIPLE GENERATOR TRIPS', level: 'warn' },
  { time: 7.5,  text: 'EAST TX: COAL STOCKPILES FROZEN', level: 'warn' },
  { time: 8.5,  text: 'CASCADE PROPAGATING SOUTH TO HOUSTON', level: 'crit' },
  { time: 9.5,  text: 'LOAD SHEDDING: 4.5M HOMES WITHOUT POWER', level: 'crit' },
  { time: 10.5, text: 'STP UNIT 1 SCRAM \u2014 FROZEN SENSOR LINE', level: 'crit' },
  { time: 12.0, text: 'FREQ BELOW SAFE THRESHOLD', level: 'crit' },
  { time: 13.5, text: '4:37 FROM TOTAL GRID COLLAPSE', level: 'crit' },
];

const TYPE_COLORS: Record<string, number[]> = { wind: [96, 165, 250], gas: [251, 146, 60], coal: [148, 163, 184], nuclear: [167, 139, 250] };
const COMANCHE_GREEN = [16, 185, 129];

const LEGEND: LegendItem[] = [
  { c: 'rgb(96,165,250)', l: 'Wind' }, { c: 'rgb(251,146,60)', l: 'Gas' },
  { c: 'rgb(148,163,184)', l: 'Coal' }, { c: 'rgb(167,139,250)', l: 'Nuclear' },
];

// ── Texas-specific: raw frequency calculation ───────────────
const computeFreq: FreqComputer = ({ running, failed, elapsed }) => {
  const rawFreq = running ? 50.0 - failed.size * 0.35 - Math.max(0, elapsed - 2) * 0.06 : 50.0;
  return Math.max(47.5, rawFreq) + Math.sin(Date.now() / 300) * 0.01;
};

const computeOffline: OfflineComputer = ({ failed }) => {
  return Math.min(52277, Math.floor(failed.size / PLANTS.length * 52277));
};

const freqStatusLabel: FreqStatusLabel = (freq) => {
  if (freq < 49.0) return '\u26A0 EMERGENCY';
  if (freq < 49.5) return '\u26A0 WARNING';
  return 'NOMINAL';
};

const computeDanger: DangerComputer = ({ freq }) => {
  const inDanger = freq < 49.0;
  const freqColor = freq < 49.0 ? '#ef4444' : freq < 49.5 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  return { inDanger, freqColor, glowColor, borderClr };
};

const bannerShowCondition: BannerShowCondition = ({ running, elapsed }) => running && elapsed > 12;

// ── Node overrides: Comanche Peak stays green ───────────────
const nodeOverrides: NodeOverrides = {
  filterFailIds: (ids) => ids.filter(id => id !== 'comanche'),
  excludeFromCompactFailed: (id) => id === 'comanche',
  showXMark: (node, failed) => failed.has(node.id) && !node.survived && node.id !== 'comanche',
  getFillColor: (node, ctx) => {
    if (node.id === 'comanche' && ctx.running) return [...COMANCHE_GREEN, 200];
    return undefined;
  },
  getLineColor: (node, ctx) => {
    if (node.id === 'comanche' && ctx.running) return [...COMANCHE_GREEN, 255];
    return undefined;
  },
  getRadius: (node, ctx) => {
    if (node.id === 'comanche' && ctx.running) return 16000;
    return undefined;
  },
};

const ZOOM_THRESHOLDS: ZoomThresholds = {
  levels: [[0.5, 7.5], [1.5, 7.0], [3, 6.5]],
  fallbackZoom: 6.0,
  overviewFromEnd: 2,
  pitch: 45,
  bearing: -5,
};

// ── Extra timeline content: "Total Grid Collapse" block ─────
function extraTimelineContent({ running, elapsed, showBanner }: { running: boolean; elapsed: number; showBanner: boolean }) {
  return (
    <div style={{
      marginTop: 6, paddingTop: 8,
      borderTop: `1px dashed ${showBanner ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
      opacity: showBanner ? 1 : 0,
      transition: 'opacity 0.5s',
    }}>
      <div style={{
        fontSize: 14, fontFamily: '"Inter"', fontWeight: 700,
        color: showBanner ? '#ef4444' : '#64748b20',
        display: 'flex', alignItems: 'baseline', gap: 8,
        opacity: showBanner ? (Math.sin(Date.now() / 200) * 0.3 + 0.7) : 1,
      }}>
        <span style={{ fontSize: 12, fontFamily: '"JetBrains Mono"', fontWeight: 700 }}>1:55 AM</span>
        TOTAL GRID COLLAPSE
      </div>
      <div style={{
        fontSize: 12, fontFamily: '"Inter"', marginTop: 2,
        color: showBanner ? 'rgba(239,68,68,0.6)' : '#64748b15',
      }}>
        Avoided by 4 min 37 sec. Cold restart = weeks.
      </div>
    </div>
  );
}

// ── Cinematic variant HUD ───────────────────────────────────
function renderCinematicHUD(ctx: CinematicCtx) {
  const {
    running, elapsed, activeStep, freq, freqColor,
    offlineValue, offlineUnit, showBanner, visibleLogs, cascade, legend,
    panelBase, btnBase, btnDanger, bootFade,
    reset, stepForward, skipToEnd,
    bannerText: bText, Corners: CornersComp,
  } = ctx;

  return (
    <>
      {/* ── Top-left: Frequency ── */}
      <div style={{
        position: 'absolute', top: 16, left: 20, zIndex: 10,
        opacity: bootFade(0.2, 0.4),
        transform: `translateY(${(1 - bootFade(0.2, 0.4)) * -15}px)`,
      }}>
        <div style={{
          fontSize: 30, fontWeight: 800, fontFamily: '"JetBrains Mono"',
          color: freqColor,
          textShadow: `0 0 25px ${freqColor}50, 0 2px 10px rgba(0,0,0,0.9)`,
        }}>
          {freq.toFixed(3)} Hz
        </div>
        <div style={{
          fontSize: 12, fontFamily: '"JetBrains Mono"', color: freqColor,
          textShadow: '0 0 8px rgba(0,0,0,0.9)', marginTop: 2, fontWeight: 600,
        }}>
          {freq < 49.0 ? '\u26A0 EMERGENCY' : freq < 49.5 ? 'WARNING' : 'ERCOT \u2014 NOMINAL'}
        </div>
        {running && (
          <div style={{
            fontSize: 14, fontFamily: '"JetBrains Mono"', color: '#ef4444',
            textShadow: '0 0 10px rgba(0,0,0,0.9)', marginTop: 6, fontWeight: 700,
          }}>
            {offlineValue.toLocaleString()} {offlineUnit} OFFLINE
          </div>
        )}
      </div>

      {/* ── Top-right: Buttons ── */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 6,
        opacity: bootFade(0.4, 0.3),
      }}>
        <button onClick={reset} style={{ ...btnBase, backdropFilter: 'blur(8px)', background: 'rgba(5,8,16,0.7)' }}>RESET</button>
        <button onClick={stepForward} style={{ ...btnDanger, backdropFilter: 'blur(8px)' }}>{'\u25B6'} STORM URI</button>
        <button onClick={skipToEnd} style={{ ...btnBase, backdropFilter: 'blur(8px)', background: 'rgba(5,8,16,0.7)', padding: '7px 10px' }}>{'\u23ED'}</button>
      </div>

      {/* ── Center: Dramatic event text ── */}
      {running && activeStep >= 0 && activeStep < cascade.length && (
        <div style={{
          position: 'absolute', top: '42%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: 10,
          textAlign: 'center', pointerEvents: 'none', maxWidth: 600,
        }}>
          <div style={{
            fontSize: 12, fontFamily: '"JetBrains Mono"', fontWeight: 700,
            color: elapsed > 9 ? '#ef4444' : '#f59e0b',
            textShadow: '0 0 20px rgba(0,0,0,0.9)',
            letterSpacing: '0.1em', marginBottom: 6,
            opacity: Math.min(1, (elapsed - cascade[activeStep].time) * 2),
          }}>
            {cascade[activeStep].ts}
          </div>
          <div style={{
            fontSize: 22, fontWeight: 700, fontFamily: '"Inter"',
            color: elapsed > 10 ? '#ef4444' : '#f1f5f9',
            textShadow: '0 0 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.8)',
            opacity: Math.min(1, (elapsed - cascade[activeStep].time) * 1.5),
          }}>
            {cascade[activeStep].label}
          </div>
          <div style={{
            fontSize: 13, fontFamily: '"JetBrains Mono"', color: '#94a3b8',
            textShadow: '0 0 15px rgba(0,0,0,0.9)', marginTop: 6,
            opacity: Math.min(1, Math.max(0, (elapsed - cascade[activeStep].time - 0.3) * 2)),
          }}>
            {cascade[activeStep].detail}
          </div>
        </div>
      )}

      {/* ── Bottom: Gradient bar with timeline + legend ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        background: 'linear-gradient(transparent, rgba(2,4,8,0.92))',
        padding: '50px 20px 14px',
        opacity: bootFade(0.5, 0.4),
        transform: `translateY(${(1 - bootFade(0.5, 0.4)) * 20}px)`,
      }}>
        {/* Compact timeline dots */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 10, justifyContent: 'center' }}>
          {cascade.map((step, i) => {
            const isActive = running && elapsed > step.time;
            return (
              <div key={i} style={{
                width: isActive ? 28 : 18, height: 4, borderRadius: 2,
                background: isActive ? '#ef4444' : 'rgba(100,116,139,0.2)',
                transition: 'all 0.4s',
                boxShadow: isActive ? '0 0 6px rgba(239,68,68,0.4)' : 'none',
              }} />
            );
          })}
          <div style={{
            width: showBanner ? 28 : 18, height: 4, borderRadius: 2,
            background: showBanner ? '#ef4444' : 'rgba(100,116,139,0.1)',
            opacity: showBanner ? (Math.sin(Date.now() / 200) * 0.3 + 0.7) : 1,
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {legend.map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: i.c }} />
                <span style={{ fontSize: 12, color: '#94a3b8aa', fontFamily: '"Inter"' }}>{i.l}</span>
              </div>
            ))}
          </div>
          {running && visibleLogs.length > 0 && (
            <div style={{
              fontSize: 12, fontFamily: '"JetBrains Mono"',
              color: visibleLogs[visibleLogs.length - 1].level === 'crit' ? '#ef4444aa' : '#f59e0baa',
            }}>
              {visibleLogs[visibleLogs.length - 1].text}
            </div>
          )}
        </div>
      </div>

      {/* ── Warning banner ── */}
      {showBanner && (
        <div style={{
          position: 'absolute', bottom: 80, left: '50%',
          transform: 'translateX(-50%)', zIndex: 10,
          padding: '14px 36px', borderRadius: 4,
          background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.5)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 0 40px rgba(239,68,68,0.15)',
        }}>
          <CornersComp color="#ef4444" />
          <span style={{
            fontSize: 18, fontWeight: 800, fontFamily: '"JetBrains Mono"',
            color: '#ef4444',
            textShadow: '0 0 15px rgba(239,68,68,0.5)',
            opacity: Math.sin(Date.now() / 300) * 0.2 + 0.8,
          }}>
            {bText}
          </span>
        </div>
      )}
    </>
  );
}

// TODO: Shared between website and presentation — combine into shared component
// ── Main component (standalone — no Spectacle dependency) ──
export default function TexasCascadeMap({ width, height = 700, variant = 'hud' }: { width?: number; height?: number; variant?: string }) {
  return (
    <CascadeMap
      width={width}
      height={height}
      variant={variant}
      nodes={PLANTS}
      lines={TX_LINES}
      cascade={CASCADE}
      logMessages={LOG_MSGS}
      views={VIEWS}
      typeColors={TYPE_COLORS}
      legendItems={LEGEND}
      monitorName="ERCOT GRID MONITOR"
      dateText="FEB 2021"
      playButtonLabel="STORM URI"
      bootInitText="ERCOT GRID MONITOR v2.1 INIT..."
      bootInfoText={`NODES: ${PLANTS.length} | LINKS: ${TX_LINES.length} | STATUS: OK`}
      compactSummary="52,277 MW OFFLINE \u2014 48.6% CAPACITY"
      compactElapsed={15}
      bannerText={'\u26A0 4:37 FROM TOTAL GRID COLLAPSE \u26A0'}
      bannerShowCondition={bannerShowCondition}
      computeFreq={computeFreq}
      computeOffline={computeOffline}
      offlineLabel="CAPACITY OFFLINE"
      offlineUnit="MW"
      offlineMax={52277}
      showOfflineBar={true}
      freqStatusLabel={freqStatusLabel}
      computeDanger={computeDanger}
      nodeOverrides={nodeOverrides}
      zoomThresholds={ZOOM_THRESHOLDS}
      extraTimelineContent={extraTimelineContent}
      renderCinematicHUD={renderCinematicHUD}
    />
  );
}
