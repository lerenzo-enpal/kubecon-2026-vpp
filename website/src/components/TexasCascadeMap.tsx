import React, { useState, useEffect, useRef } from 'react';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';

import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
// TODO: Shared with presentation/src/components/ui/Corners.jsx — combine into shared component
// Inline Corners component (from presentation ui library)
function Corners({ color = '#22d3ee50', size = 10 }) {
  const s = { position: 'absolute' as const, width: size, height: size };
  const b = `2px solid ${color}`;
  return (<>
    <div style={{ ...s, top: -1, left: -1, borderTop: b, borderLeft: b }} />
    <div style={{ ...s, top: -1, right: -1, borderTop: b, borderRight: b }} />
    <div style={{ ...s, bottom: -1, left: -1, borderBottom: b, borderLeft: b }} />
    <div style={{ ...s, bottom: -1, right: -1, borderBottom: b, borderRight: b }} />
  </>);
}

const FLY_TO = new FlyToInterpolator();

// ── Camera presets ──────────────────────────────────────────
const VIEWS = {
  hud: { longitude: -100.2, latitude: 30.8, zoom: 5.6, pitch: 45, bearing: -5 },
  cinematic: { longitude: -97.5, latitude: 31.0, zoom: 5.5, pitch: 50, bearing: -8 },
};

// ── Power plant data ────────────────────────────────────────
const PLANTS = [
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

const TX_LINES = [
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
const CASCADE = [
  { time: 0,  ids: ['amarillo', 'lubbock', 'roscoe'], ts: 'FEB 14 AM', label: 'Wind turbines freeze — Panhandle', detail: '16,000 MW wind offline' },
  { time: 3,  ids: ['midland'], ts: 'FEB 14 PM', label: 'Gas wells freeze — Permian Basin', detail: 'Gas supply drops 50%' },
  { time: 5,  ids: ['abilene'], ts: 'FEB 14 EVE', label: 'Gas plants lose fuel supply', detail: 'Cascading gas shortage' },
  { time: 6,  ids: ['midlothian', 'forney'], ts: 'FEB 14 11PM', label: 'DFW gas plants trip offline', detail: 'Midlothian at 30%' },
  { time: 7,  ids: ['martin', 'limestone'], ts: 'FEB 15 1AM', label: 'East TX coal & lignite fail', detail: 'Frozen coal piles' },
  { time: 8,  ids: ['oakgrove', 'parish'], ts: 'FEB 15 2AM', label: 'Central + Houston tripping', detail: '35,000 MW offline' },
  { time: 9,  ids: ['cedarbayou', 'waco'], ts: 'FEB 15 3AM', label: 'Cascade spreads statewide', detail: 'Load shedding begins' },
  { time: 10, ids: ['stp'], ts: 'FEB 15 5:37AM', label: 'STP Nuclear Unit 1 trips', detail: 'Frozen sensor line' },
  { time: 11, ids: ['corpus', 'sanantonio', 'austin'], ts: 'FEB 15-18', label: '4.5 million homes go dark', detail: '52,277 MW offline' },
  { time: 13, ids: ['houston', 'dfw'], ts: 'FEB 15-19', label: 'Grid emergency — 70+ hours', detail: '48.6% capacity gone' },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS = [
  { time: 0.5,  text: 'WIND GENERATION OFFLINE — PANHANDLE CLUSTER', level: 'warn' },
  { time: 2.0,  text: 'TEMP: -18°C — EQUIPMENT FREEZE WARNING', level: 'warn' },
  { time: 3.5,  text: 'GAS SUPPLY FAILING — PERMIAN BASIN', level: 'crit' },
  { time: 5.0,  text: 'GAS-ELECTRIC DEATH SPIRAL DETECTED', level: 'crit' },
  { time: 6.5,  text: 'DFW REGION: MULTIPLE GENERATOR TRIPS', level: 'warn' },
  { time: 7.5,  text: 'EAST TX: COAL STOCKPILES FROZEN', level: 'warn' },
  { time: 8.5,  text: 'CASCADE PROPAGATING SOUTH TO HOUSTON', level: 'crit' },
  { time: 9.5,  text: 'LOAD SHEDDING: 4.5M HOMES WITHOUT POWER', level: 'crit' },
  { time: 10.5, text: 'STP UNIT 1 SCRAM — FROZEN SENSOR LINE', level: 'crit' },
  { time: 12.0, text: 'FREQ BELOW SAFE THRESHOLD', level: 'crit' },
  { time: 13.5, text: '4:37 FROM TOTAL GRID COLLAPSE', level: 'crit' },
];

const TYPE_COLORS = { wind: [96, 165, 250], gas: [251, 146, 60], coal: [148, 163, 184], nuclear: [167, 139, 250] };
const FAILED_COLOR = [239, 68, 68];
const COMANCHE_GREEN = [16, 185, 129];
const PLANT_MAP = new Map(PLANTS.map(p => [p.id, p]));
const getPlant = (id) => PLANT_MAP.get(id);

// ── Camera target for step mode ─────────────────────────────
function getStepView(stepIdx, fallback) {
  // Last 2 steps: zoom back to overview (statewide failure)
  if (stepIdx >= CASCADE.length - 2) return fallback;
  const plants = CASCADE[stepIdx].ids.map(id => getPlant(id)).filter(Boolean);
  const lons = plants.map(p => p.pos[0]);
  const lats = plants.map(p => p.pos[1]);
  const avgLon = lons.reduce((a, b) => a + b) / lons.length;
  const avgLat = lats.reduce((a, b) => a + b) / lats.length;
  const spread = Math.max(Math.max(...lons) - Math.min(...lons), Math.max(...lats) - Math.min(...lats));
  const zoom = spread < 0.5 ? 7.5 : spread < 1.5 ? 7.0 : spread < 3 ? 6.5 : 6.0;
  return { longitude: avgLon, latitude: avgLat, zoom, pitch: 45, bearing: -5 };
}

// TODO: Shared between website and presentation — combine into shared component
// ── Main component (standalone — no Spectacle dependency) ──
export default function TexasCascadeMap({ width: widthProp, height = 700, variant = 'hud' }) {
  const [failed, setFailed] = useState(new Set());
  const [mode, setMode] = useState('idle');
  const [elapsed, setElapsed] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [stepIndex, setStepIndex] = useState(-1);
  const [boot, setBoot] = useState(0);
  const bootRef = useRef(null);
  const defaultView = VIEWS[variant] || VIEWS.hud;
  const [viewState, setViewState] = useState(defaultView);
  const containerRef = useRef(null);

  // Responsive width: measure wrapper on mount + window resize
  const sizeRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  useEffect(() => {
    if (widthProp) return;
    const measure = () => {
      const el = sizeRef.current;
      if (el && el.clientWidth > 0) setMeasuredWidth(el.clientWidth);
    };
    measure();
    // Re-measure only on window resize, not on content changes
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [widthProp]);
  const width = widthProp || measuredWidth;

  // Detect fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // In compact (non-fullscreen) mode, show final state statically
  const compact = !isFullscreen;

  const running = mode !== 'idle';

  // In compact mode, show final cascade state immediately (no animation)
  useEffect(() => {
    if (compact) {
      const allFailed = new Set<string>();
      CASCADE.forEach(step => step.ids.forEach(id => allFailed.add(id)));
      allFailed.delete('comanche');
      setFailed(allFailed);
      setMode('idle');
      setElapsed(15);
      setActiveStep(CASCADE.length - 1);
      setBoot(5);
    } else {
      // Reset to interactive mode when entering fullscreen
      setFailed(new Set()); setMode('idle'); setElapsed(0); setActiveStep(-1);
      setStepIndex(-1); setViewState(VIEWS[variant] || VIEWS.hud);
      setBoot(0);
    }
  }, [compact]);

  // Boot animation on mount (only in fullscreen)
  useEffect(() => {
    if (compact) return;
    setBoot(0);
    const delay = setTimeout(() => {
      const start = performance.now();
      const tick = () => {
        const s = (performance.now() - start) / 1000;
        setBoot(s);
        if (s < 4.0) bootRef.current = requestAnimationFrame(tick);
      };
      bootRef.current = requestAnimationFrame(tick);
    }, 700);
    return () => { clearTimeout(delay); cancelAnimationFrame(bootRef.current); };
  }, [compact]);

  // Step forward function
  const stepForward = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx >= CASCADE.length) return;
    setMode('stepping');
    setStepIndex(nextIdx);
    const nf = new Set();
    for (let i = 0; i <= nextIdx; i++) CASCADE[i].ids.forEach(id => nf.add(id));
    nf.delete('comanche');
    setFailed(nf);
    setActiveStep(nextIdx);
    setElapsed(CASCADE[nextIdx].time + 1);
    const target = getStepView(nextIdx, defaultView);
    setViewState({
      ...target,
      transitionDuration: 800,
      transitionInterpolator: FLY_TO,
      transitionEasing: t => 1 - Math.pow(1 - t, 3),
    });
  };

  // Reset function
  const reset = () => {
    setFailed(new Set()); setMode('idle'); setElapsed(0);
    setActiveStep(-1); setStepIndex(-1);
    setViewState({
      ...defaultView,
      transitionDuration: 500,
      transitionInterpolator: FLY_TO,
      transitionEasing: t => 1 - Math.pow(1 - t, 3),
    });
  };

  // Keyboard navigation (when container is focused)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); stepForward(); }
      else if (e.key === 'ArrowLeft' || e.key === 'Escape') { e.preventDefault(); reset(); }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  });

  // Auto-play loop — only runs in 'playing' mode
  useEffect(() => {
    if (mode !== 'playing') return;
    const start = performance.now();
    let raf;
    const tick = () => {
      const sec = (performance.now() - start) / 1000;
      setElapsed(sec);
      const nf = new Set();
      let ms = -1;
      CASCADE.forEach((step, i) => {
        if (sec > step.time) { step.ids.forEach(id => nf.add(id)); ms = i; }
      });
      nf.delete('comanche');
      setFailed(nf);
      setActiveStep(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // stepForward defined above in standalone controls section

  // Skip to end — play full auto animation at default zoom
  const skipToEnd = () => {
    setFailed(new Set()); setElapsed(0); setActiveStep(-1); setStepIndex(-1);
    setViewState({
      ...defaultView,
      transitionDuration: mode === 'stepping' ? 600 : 0,
      transitionInterpolator: FLY_TO,
      transitionEasing: t => 1 - Math.pow(1 - t, 3),
    });
    setMode('playing');
  };

  // Reset
  const resetAll = () => {
    setFailed(new Set()); setElapsed(0); setActiveStep(-1); setStepIndex(-1);
    setMode('idle');
    setViewState({
      ...defaultView,
      transitionDuration: 500,
      transitionInterpolator: FLY_TO,
      transitionEasing: t => 1 - Math.pow(1 - t, 3),
    });
  };

  // ── Boot animation helpers ──
  // ease: smooth deceleration curve
  const ease = (t) => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
  // Panel expand: 0→1 over duration, starting at delay
  const bootPanel = (delay, dur = 0.5) => ease((boot - delay) / dur);
  // Text fade: 0→1
  const bootFade = (delay, dur = 0.3) => ease((boot - delay) / dur);

  // Left panel: starts at 0.1s, expands over 1.1s
  const lpExpand = bootPanel(0.1, 1.1);
  // Left panel sections — domino cascade (~500ms stagger, 0.6s each)
  const headerDraw = bootFade(0.4, 0.6);
  const buttonsDraw = bootFade(0.9, 0.6);
  const terminalDraw = bootFade(1.8, 0.6);
  // Right panel
  const rpExpand = bootPanel(0.6, 0.8);
  const rpContent = bootFade(1.0, 0.5);
  // Legend
  const legendFade = bootFade(1.8, 0.5);

  // ── Computed values ──
  const rawFreq = running ? 50.0 - failed.size * 0.35 - Math.max(0, elapsed - 2) * 0.06 : 50.0;
  const freq = Math.max(47.5, rawFreq) + Math.sin(Date.now() / 300) * 0.01;
  const mwOffline = Math.min(52277, Math.floor(failed.size / PLANTS.length * 52277));
  const inDanger = freq < 49.0;
  const freqColor = freq < 49.0 ? '#ef4444' : freq < 49.5 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  const showWarning = running && elapsed > 12;

  // ── Build dramatic line data ──
  const pulse = Math.sin(Date.now() / 250);
  const lines = TX_LINES.map(([a, b]) => {
    const pA = getPlant(a), pB = getPlant(b);
    const aF = failed.has(a), bF = failed.has(b);
    let color, glow;
    if (aF && bF) {
      color = [239, 68, 68, 55]; glow = [239, 68, 68, 15];
    } else if (aF || bF) {
      const p = Math.floor(pulse * 40 + 155);
      color = [239, 68, 68, p]; glow = [239, 68, 68, 40];
    } else {
      color = [34, 211, 238, 150]; glow = [34, 211, 238, 35];
    }
    return { from: pA.pos, to: pB.pos, color, glow };
  });

  // ── Deck.gl layers ──
  const layers = [
    new LineLayer({
      id: 'glow', data: lines,
      getSourcePosition: d => d.from, getTargetPosition: d => d.to,
      getColor: d => d.glow, getWidth: 4, widthMinPixels: 2,
    }),
    new LineLayer({
      id: 'lines', data: lines,
      getSourcePosition: d => d.from, getTargetPosition: d => d.to,
      getColor: d => d.color, getWidth: 1.5, widthMinPixels: 1,
    }),
    new ScatterplotLayer({
      id: 'plants', data: PLANTS, getPosition: d => d.pos,
      getRadius: d => d.id === 'comanche' && running ? 16000 : 3600 * Math.sqrt(d.cap),
      getFillColor: d => {
        if (d.id === 'comanche' && running) return [...COMANCHE_GREEN, 200];
        if (failed.has(d.id)) return [...FAILED_COLOR, 180];
        return [...TYPE_COLORS[d.type], 180];
      },
      getLineColor: d => {
        if (d.id === 'comanche' && running) return [...COMANCHE_GREEN, 255];
        if (failed.has(d.id)) return [...FAILED_COLOR, 255];
        return [...TYPE_COLORS[d.type], 255];
      },
      stroked: true, lineWidthMinPixels: 2, radiusMinPixels: 5, radiusMaxPixels: 24,
      transitions: { getFillColor: 400, getRadius: 300 },
    }),
    new TextLayer({
      id: 'x-marks', data: PLANTS.filter(p => failed.has(p.id)),
      getPosition: d => d.pos, getText: () => '\u2715', getSize: 22,
      getColor: [239, 68, 68, 255], getTextAnchor: 'middle', getAlignmentBaseline: 'center',
      fontFamily: 'JetBrains Mono', fontWeight: 'bold',
    }),
    new TextLayer({
      id: 'labels', data: PLANTS, getPosition: d => d.pos, getText: d => d.name,
      getSize: 11, getColor: d => failed.has(d.id) ? [239, 68, 68, 180] : [241, 245, 249, 190],
      getTextAnchor: 'middle', getAlignmentBaseline: 'top', getPixelOffset: [0, 18], fontFamily: 'Inter',
    }),
  ];

  // ── Visible terminal messages ──
  const visibleLogs = running ? LOG_MSGS.filter(m => elapsed > m.time).slice(-5) : [];

  // ── Panel base style ──
  const panelBase = {
    background: 'rgba(5, 8, 16, 0.9)',
    border: `1px solid ${borderClr}`,
    boxShadow: `0 0 20px ${glowColor}18, inset 0 0 15px ${glowColor}06`,
    backdropFilter: 'blur(12px)',
    transition: 'border-color 0.6s, box-shadow 0.6s',
    position: 'relative',
    borderRadius: 3,
  };

  const btnBase = {
    background: 'rgba(26, 34, 54, 0.9)', border: '1px solid rgba(34,211,238,0.3)',
    color: '#94a3b8', padding: '7px 14px', borderRadius: 3,
    cursor: 'pointer', fontSize: 13, fontFamily: '"JetBrains Mono"', fontWeight: 600,
  };
  const btnDanger = {
    ...btnBase, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.5)',
    color: '#ef4444', fontWeight: 700,
  };

  // ── Legend ──
  const legend = [
    { c: 'rgb(96,165,250)', l: 'Wind' }, { c: 'rgb(251,146,60)', l: 'Gas' },
    { c: 'rgb(148,163,184)', l: 'Coal' }, { c: 'rgb(167,139,250)', l: 'Nuclear' },
  ];

  const ready = widthProp || measuredWidth > 0;

  return (
    <div ref={sizeRef} style={{ width: '100%' }}>
    {ready ? (
    <div ref={containerRef} tabIndex={0} style={{ position: 'relative', width, height, overflow: 'hidden', background: '#020408', outline: 'none' }}>
      {/* Standalone controls (replaces Spectacle stepper) — fullscreen only */}
      {!compact && (
        <div style={{
          position: 'absolute', bottom: 8, right: 8, zIndex: 30,
          display: 'flex', gap: 6,
        }}>
          <button onClick={reset} style={{
            background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(34,211,238,0.3)',
            color: '#94a3b8', borderRadius: 4, padding: '4px 10px', cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
          }}>Reset</button>
          <button onClick={stepForward} disabled={stepIndex >= CASCADE.length - 1} style={{
            background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(34,211,238,0.3)',
            color: stepIndex >= CASCADE.length - 1 ? '#64748b' : '#22d3ee',
            borderRadius: 4, padding: '4px 10px', cursor: stepIndex >= CASCADE.length - 1 ? 'default' : 'pointer',
            fontFamily: '"JetBrains Mono", monospace', fontSize: 11,
          }}>Next Step {'\u2192'}</button>
        </div>
      )}
      {/* ── Map ── */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        width={width}
        height={height}
        style={{ position: 'absolute' }}
      >
        <MapGL
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>

      {/* ── Scanline overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />

      {/* ── Vignette ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
        boxShadow: 'inset 0 0 120px 40px rgba(2,4,8,0.7)',
      }} />

      {/* ── Danger atmosphere ── */}
      {!compact && running && elapsed > 5 && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: `radial-gradient(ellipse at center, rgba(239,68,68,${Math.min(0.1, (elapsed - 5) * 0.01)}) 0%, transparent 70%)`,
        }} />
      )}

      {/* ── Boot Scan Line (subtle accent, map stays visible) ── */}
      {!compact && boot > 0.08 && boot < 1.8 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, pointerEvents: 'none', zIndex: 15,
          top: `${ease((boot - 0.08) / 1.5) * 110}%`,
          height: 1,
          background: `linear-gradient(90deg, transparent 2%, rgba(34,211,238,${Math.max(0, 0.55 - boot * 0.5)}) 15%, rgba(34,211,238,${Math.max(0, 0.55 - boot * 0.5)}) 85%, transparent 98%)`,
          boxShadow: `0 0 12px rgba(34,211,238,${Math.max(0, 0.25 - boot * 0.25)}), 0 0 40px rgba(34,211,238,${Math.max(0, 0.12 - boot * 0.12)})`,
        }} />
      )}

      {/* ════════════════════════════════════════════════════════
          HUD VARIANT — Full panel layout (fullscreen only)
          ════════════════════════════════════════════════════════ */}
      {variant === 'hud' && !compact && (
        <>
          {/* ── Left: Timeline Panel ── */}
          <div style={{
            ...panelBase, position: 'absolute', top: 10, left: 10, width: 380,
            zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            background: 'rgba(5, 8, 16, 0.92)',
            // Boot animation: expand from top-left — right first, then down
            height: `calc(${lpExpand * 100}% - 20px)`,
            opacity: lpExpand > 0 ? 1 : 0,
            transformOrigin: 'top left',
            clipPath: lpExpand < 1
              ? `inset(0 ${Math.max(0, (1 - lpExpand * 1.6)) * 100}% ${Math.max(0, (1 - Math.max(0, (lpExpand - 0.25) / 0.75))) * 100}% 0)`
              : 'none',
          }}>
            <Corners color={glowColor} />

            {/* Header */}
            <div style={{
              padding: '10px 16px', borderBottom: `1px solid ${borderClr}`,
              display: 'flex', alignItems: 'center', gap: 10,
              opacity: headerDraw,
              clipPath: headerDraw < 1 ? `inset(0 0 ${(1 - headerDraw) * 100}% 0)` : 'none',
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: running ? '#ef4444' : '#22d3ee',
                boxShadow: `0 0 10px ${running ? '#ef4444' : '#22d3ee'}`,
              }} />
              <span style={{
                fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"',
                color: '#94a3b8', letterSpacing: '0.12em',
              }}>ERCOT GRID MONITOR</span>
              <span style={{
                marginLeft: 'auto', fontSize: 11, fontFamily: '"JetBrains Mono"',
                color: '#64748bcc',
              }}>FEB 2021</span>
            </div>

            {/* Buttons */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderBottom: `1px solid ${borderClr}`, opacity: buttonsDraw, clipPath: buttonsDraw < 1 ? `inset(0 0 ${(1 - buttonsDraw) * 100}% 0)` : 'none' }}>
              <button onClick={resetAll} style={btnBase}>RESET</button>
              <button onClick={stepForward} style={{ ...btnDanger, flex: 1 }}>
                {'\u25B6'} STORM URI
              </button>
              <button onClick={skipToEnd} style={{ ...btnBase, padding: '7px 10px' }} title="Play all">
                {'\u23ED'}
              </button>
            </div>

            {/* Timeline entries */}
            <div style={{ flex: 1, overflowY: 'hidden', padding: '8px 16px' }}>
              {CASCADE.map((step, i) => {
                const isActive = running && elapsed > step.time;
                const isCurrent = activeStep === i;
                return (
                  <div key={i} style={{
                    marginBottom: 7,
                    opacity: isActive ? 1 : 0,
                    transition: 'opacity 0.4s, transform 0.4s',
                    borderLeft: isCurrent ? '2px solid #ef4444' : '2px solid transparent',
                    paddingLeft: isCurrent ? 10 : 12,
                    transform: `translateX(${isActive ? 0 : -15}px)`,
                  }}>
                    <div style={{
                      fontSize: 14, fontFamily: '"Inter"',
                      color: isActive ? (isCurrent ? '#f1f5f9' : '#f1f5f9bb') : '#64748b20',
                      fontWeight: isCurrent ? 600 : 400,
                      display: 'flex', alignItems: 'baseline', gap: 8,
                    }}>
                      <span style={{
                        fontSize: 11, fontFamily: '"JetBrains Mono"', fontWeight: 700,
                        color: isActive ? (isCurrent ? '#ef4444' : '#ef4444aa') : '#64748b30',
                        flexShrink: 0,
                      }}>
                        {step.ts}
                      </span>
                      {step.label}
                    </div>
                    <div style={{
                      fontSize: 11, fontFamily: '"JetBrains Mono"', marginTop: 2,
                      color: isActive ? '#94a3b870' : '#64748b15',
                    }}>
                      {step.detail}
                    </div>
                  </div>
                );
              })}

              {/* Final: Total Collapse */}
              <div style={{
                marginTop: 6, paddingTop: 8,
                borderTop: `1px dashed ${showWarning ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
                opacity: showWarning ? 1 : 0,
                transition: 'opacity 0.5s',
              }}>
                <div style={{
                  fontSize: 14, fontFamily: '"Inter"', fontWeight: 700,
                  color: showWarning ? '#ef4444' : '#64748b20',
                  display: 'flex', alignItems: 'baseline', gap: 8,
                  opacity: showWarning ? (Math.sin(Date.now() / 200) * 0.3 + 0.7) : 1,
                }}>
                  <span style={{
                    fontSize: 11, fontFamily: '"JetBrains Mono"', fontWeight: 700,
                  }}>
                    1:55 AM
                  </span>
                  TOTAL GRID COLLAPSE
                </div>
                <div style={{
                  fontSize: 11, fontFamily: '"Inter"', marginTop: 2,
                  color: showWarning ? 'rgba(239,68,68,0.6)' : '#64748b15',
                }}>
                  Avoided by 4 min 37 sec. Cold restart = weeks.
                </div>
              </div>
            </div>

            {/* Terminal log */}
            <div style={{
              borderTop: `1px solid ${borderClr}`, padding: '8px 14px',
              minHeight: 90, maxHeight: 120, overflow: 'hidden',
              background: 'rgba(0,0,0,0.3)',
              opacity: terminalDraw,
              clipPath: terminalDraw < 1 ? `inset(0 0 ${(1 - terminalDraw) * 100}% 0)` : 'none',
            }}>
              <div style={{
                fontSize: 9, fontFamily: '"JetBrains Mono"', color: '#64748b80',
                letterSpacing: '0.1em', marginBottom: 4,
              }}>SYSTEM LOG</div>
              {visibleLogs.length === 0 && (
                <div style={{ fontSize: 12, fontFamily: '"JetBrains Mono"' }}>
                  {boot > 2.2 && (
                    <div style={{ color: '#22d3eecc', marginBottom: 2 }}>
                      {'>'} ERCOT GRID MONITOR v2.1 INIT...
                    </div>
                  )}
                  {boot > 2.6 && (
                    <div style={{ color: '#22d3eecc', marginBottom: 2 }}>
                      {'>'} NODES: {PLANTS.length} | LINKS: {TX_LINES.length} | STATUS: OK
                    </div>
                  )}
                  {boot > 3.0 && (
                    <div style={{ color: '#64748bcc' }}>
                      {'>'} Awaiting events...<span className="hud-blink">{'\u2588'}</span>
                    </div>
                  )}
                </div>
              )}
              {visibleLogs.map((msg, i) => {
                const age = elapsed - msg.time;
                const chars = Math.min(msg.text.length, Math.floor(age * 45));
                const isLatest = i === visibleLogs.length - 1;
                const msgColor = msg.level === 'crit' ? '#ef4444' : '#f59e0b';
                return (
                  <div key={msg.time} style={{
                    fontSize: 11, fontFamily: '"JetBrains Mono"',
                    color: msgColor, opacity: isLatest ? 1 : 0.5,
                    marginBottom: 2, lineHeight: 1.4,
                  }}>
                    {'>'} {msg.text.substring(0, chars)}
                    {isLatest && chars < msg.text.length && (
                      <span className="hud-blink">{'\u2588'}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Frequency readout ── */}
          <div style={{
            ...panelBase, position: 'absolute', top: 10, right: 10, zIndex: 10,
            padding: '14px 20px', minWidth: 190,
            background: 'rgba(5, 8, 16, 0.92)',
            // Boot animation: expand from top-right
            opacity: rpExpand > 0 ? 1 : 0,
            transformOrigin: 'top right',
            transform: `scale(${rpExpand}, ${rpExpand})`,
          }}>
            <Corners color={glowColor} />
            <div style={{
              fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748bcc',
              letterSpacing: '0.1em', marginBottom: 6,
              opacity: rpContent,
            }}>FREQUENCY</div>
            <div style={{
              fontSize: 36, fontWeight: 800, fontFamily: '"JetBrains Mono"',
              color: freqColor, textShadow: `0 0 22px ${freqColor}40`,
              opacity: rpContent,
            }}>
              {freq.toFixed(3)}
              <span style={{ fontSize: 18, marginLeft: 4 }}>Hz</span>
            </div>
            <div style={{
              fontSize: 13, fontFamily: '"JetBrains Mono"', color: freqColor,
              marginTop: 4, fontWeight: 600, opacity: rpContent,
            }}>
              {freq < 49.0 ? '\u26A0 EMERGENCY' : freq < 49.5 ? '\u26A0 WARNING' : 'NOMINAL'}
            </div>
            {running && (
              <>
                <div style={{
                  marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderClr}`,
                }}>
                  <div style={{
                    fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60',
                    letterSpacing: '0.1em', marginBottom: 4,
                  }}>CAPACITY OFFLINE</div>
                  <div style={{
                    fontSize: 22, fontFamily: '"JetBrains Mono"', color: '#ef4444',
                    fontWeight: 700,
                  }}>
                    {mwOffline.toLocaleString()}
                    <span style={{ fontSize: 12, color: '#ef4444aa', marginLeft: 4 }}>MW</span>
                  </div>
                </div>
                <div style={{
                  marginTop: 8, height: 4, background: 'rgba(239,68,68,0.15)',
                  borderRadius: 2, overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: '#ef4444',
                    width: `${Math.min(100, (mwOffline / 52277) * 100)}%`,
                    transition: 'width 0.3s',
                  }} />
                </div>
              </>
            )}
          </div>

          {/* ── Legend (bottom-center) ── */}
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex', gap: 18,
            opacity: legendFade,
          }}>
            {legend.map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: i.c }} />
                <span style={{
                  fontSize: 12, color: '#94a3b8', fontFamily: '"Inter"',
                  textShadow: '0 0 6px rgba(0,0,0,0.9)',
                }}>{i.l}</span>
              </div>
            ))}
          </div>

          {/* ── Center: 4:37 warning banner ── */}
          {showWarning && (
            <div style={{
              ...panelBase, position: 'absolute', bottom: 50, zIndex: 10,
              left: 'calc(400px + 8%)', right: 'calc(10px + 8%)',
              display: 'flex', justifyContent: 'center',
              padding: '20px 32px', whiteSpace: 'nowrap',
              borderColor: 'rgba(239,68,68,0.6)',
              boxShadow: '0 0 30px rgba(239,68,68,0.2), inset 0 0 20px rgba(239,68,68,0.08)',
              background: 'rgba(5, 8, 16, 0.92)',
            }}>
              <Corners color="#ef4444" />
              <span style={{
                fontSize: 32, fontWeight: 800, fontFamily: '"JetBrains Mono"',
                color: '#ef4444', textShadow: '0 0 20px rgba(239,68,68,0.5)',
                opacity: Math.sin(Date.now() / 300) * 0.2 + 0.8,
              }}>
                {'\u26A0'} 4:37 FROM TOTAL GRID COLLAPSE {'\u26A0'}
              </span>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════
          CINEMATIC VARIANT — Minimal chrome, dramatic center text (fullscreen only)
          ════════════════════════════════════════════════════════ */}
      {variant === 'cinematic' && !compact && (
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
              fontSize: 11, fontFamily: '"JetBrains Mono"', color: freqColor,
              textShadow: '0 0 8px rgba(0,0,0,0.9)', marginTop: 2, fontWeight: 600,
            }}>
              {freq < 49.0 ? '\u26A0 EMERGENCY' : freq < 49.5 ? 'WARNING' : 'ERCOT \u2014 NOMINAL'}
            </div>
            {running && (
              <div style={{
                fontSize: 14, fontFamily: '"JetBrains Mono"', color: '#ef4444',
                textShadow: '0 0 10px rgba(0,0,0,0.9)', marginTop: 6, fontWeight: 700,
              }}>
                {mwOffline.toLocaleString()} MW OFFLINE
              </div>
            )}
          </div>

          {/* ── Top-right: Buttons ── */}
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 6,
            opacity: bootFade(0.4, 0.3),
          }}>
            <button onClick={resetAll} style={{
              ...btnBase, backdropFilter: 'blur(8px)', background: 'rgba(5,8,16,0.7)',
            }}>RESET</button>
            <button onClick={stepForward} style={{
              ...btnDanger, backdropFilter: 'blur(8px)',
            }}>{'\u25B6'} STORM URI</button>
            <button onClick={skipToEnd} style={{
              ...btnBase, backdropFilter: 'blur(8px)', background: 'rgba(5,8,16,0.7)', padding: '7px 10px',
            }}>{'\u23ED'}</button>
          </div>

          {/* ── Center: Dramatic event text ── */}
          {running && activeStep >= 0 && activeStep < CASCADE.length && (
            <div style={{
              position: 'absolute', top: '42%', left: '50%',
              transform: 'translate(-50%, -50%)', zIndex: 10,
              textAlign: 'center', pointerEvents: 'none', maxWidth: 600,
            }}>
              <div style={{
                fontSize: 11, fontFamily: '"JetBrains Mono"', fontWeight: 700,
                color: elapsed > 9 ? '#ef4444' : '#f59e0b',
                textShadow: '0 0 20px rgba(0,0,0,0.9)',
                letterSpacing: '0.1em', marginBottom: 6,
                opacity: Math.min(1, (elapsed - CASCADE[activeStep].time) * 2),
              }}>
                {CASCADE[activeStep].ts}
              </div>
              <div style={{
                fontSize: 22, fontWeight: 700, fontFamily: '"Inter"',
                color: elapsed > 10 ? '#ef4444' : '#f1f5f9',
                textShadow: '0 0 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.8)',
                opacity: Math.min(1, (elapsed - CASCADE[activeStep].time) * 1.5),
              }}>
                {CASCADE[activeStep].label}
              </div>
              <div style={{
                fontSize: 13, fontFamily: '"JetBrains Mono"', color: '#94a3b8',
                textShadow: '0 0 15px rgba(0,0,0,0.9)', marginTop: 6,
                opacity: Math.min(1, Math.max(0, (elapsed - CASCADE[activeStep].time - 0.3) * 2)),
              }}>
                {CASCADE[activeStep].detail}
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
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3, marginBottom: 10,
              justifyContent: 'center',
            }}>
              {CASCADE.map((step, i) => {
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
              {/* Final dot */}
              <div style={{
                width: showWarning ? 28 : 18, height: 4, borderRadius: 2,
                background: showWarning ? '#ef4444' : 'rgba(100,116,139,0.1)',
                opacity: showWarning ? (Math.sin(Date.now() / 200) * 0.3 + 0.7) : 1,
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              {/* Legend */}
              <div style={{ display: 'flex', gap: 14 }}>
                {legend.map(i => (
                  <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: i.c }} />
                    <span style={{ fontSize: 9, color: '#94a3b8aa', fontFamily: '"Inter"' }}>{i.l}</span>
                  </div>
                ))}
              </div>
              {/* Status text */}
              {running && visibleLogs.length > 0 && (
                <div style={{
                  fontSize: 10, fontFamily: '"JetBrains Mono"',
                  color: visibleLogs[visibleLogs.length - 1].level === 'crit' ? '#ef4444aa' : '#f59e0baa',
                }}>
                  {visibleLogs[visibleLogs.length - 1].text}
                </div>
              )}
            </div>
          </div>

          {/* ── Warning banner ── */}
          {showWarning && (
            <div style={{
              position: 'absolute', bottom: 80, left: '50%',
              transform: 'translateX(-50%)', zIndex: 10,
              padding: '14px 36px', borderRadius: 4,
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.5)',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 40px rgba(239,68,68,0.15)',
            }}>
              <Corners color="#ef4444" />
              <span style={{
                fontSize: 18, fontWeight: 800, fontFamily: '"JetBrains Mono"',
                color: '#ef4444',
                textShadow: '0 0 15px rgba(239,68,68,0.5)',
                opacity: Math.sin(Date.now() / 300) * 0.2 + 0.8,
              }}>
                {'\u26A0'} 4:37 FROM TOTAL GRID COLLAPSE {'\u26A0'}
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Compact mode: static caption + legend ── */}
      {compact && (
        <>
          {/* ── Top-left: Status panel ── */}
          <div style={{
            ...panelBase, position: 'absolute', top: 8, left: 8, zIndex: 10,
            padding: '8px 14px',
            background: 'rgba(5, 8, 16, 0.92)',
          }}>
            <Corners color="#ef4444" />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4,
            }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#ef4444',
                boxShadow: '0 0 8px #ef4444',
              }} />
              <span style={{
                fontSize: 11, fontWeight: 700, fontFamily: '"JetBrains Mono"',
                color: '#94a3b8', letterSpacing: '0.12em',
              }}>ERCOT GRID MONITOR</span>
              <span style={{
                fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60',
                marginLeft: 4,
              }}>FEB 2021</span>
            </div>
            <div style={{
              fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#ef4444',
              fontWeight: 600, letterSpacing: '0.08em',
            }}>
              52,277 MW OFFLINE — 48.6% CAPACITY
            </div>
          </div>

          {/* ── Bottom: Legend bar ── */}
          <div style={{
            position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
            zIndex: 10, display: 'flex', gap: 14,
            padding: '4px 12px', borderRadius: 3,
            background: 'rgba(5, 8, 16, 0.8)',
            border: '1px solid rgba(34,211,238,0.15)',
          }}>
            {legend.map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: i.c }} />
                <span style={{ fontSize: 9, color: '#94a3b8aa', fontFamily: '"Inter"' }}>{i.l}</span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
    ) : (
      <div style={{ width: '100%', height, background: '#020408' }} />
    )}
    </div>
  );
}
