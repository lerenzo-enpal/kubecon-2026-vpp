// TODO: Shared between website and presentation (SAMapHUD.jsx) — combine into shared component
import React, { useState, useEffect, useRef } from 'react';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useIncidentGlow } from './useIncidentGlow';

// TODO: Shared with presentation/src/components/ui/Corners.jsx — combine into shared component
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
  hud: { longitude: 138.5, latitude: -34.0, zoom: 6.2, pitch: 35, bearing: -5 },
};

// ── Infrastructure data (from presentation SAMapHUD.jsx) ────
const NODES = [
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
  { id: 'waterloo',   pos: [138.900, -33.980], type: 'wind',  cap: 111,  name: 'Waterloo', survived: true },
  { id: 'canunda',    pos: [140.417, -37.810], type: 'wind',  cap: 46,   name: 'Canunda', survived: true },
  { id: 'lakebonney', pos: [140.407, -37.771], type: 'wind',  cap: 279,  name: 'Lake Bonney 1-3', survived: true },
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
const CASCADE = [
  { time: 0,  ids: ['davenport', 'belalie'],                              ts: '16:17:36', label: '275kV towers collapse -- 3 lines fault',         detail: 'Two tornadoes destroy transmission corridor',    freq: 49.8 },
  { time: 2,  ids: ['hallett1', 'northbrown', 'bluff'],                   ts: '16:17:55', label: '123 MW wind lost -- LVRT protection trips',       detail: 'Voltage ride-through limits exceeded',           freq: 49.5 },
  { time: 4,  ids: ['hornsdale', 'snowtown', 'hallett2', 'clements'],     ts: '16:18:09', label: '456 MW total -- 9 of 13 wind farms down',        detail: 'Cascade in <7 seconds',                          freq: 49.0 },
  { time: 6,  ids: ['heywood'],                                           ts: '16:18:14', label: 'Heywood IC overloads at 850 MW -- trips',        detail: 'Rated 460 MW -- protection relay activates',     freq: 48.2 },
  { time: 8,  ids: ['torrens', 'pelican', 'osborne'],                     ts: '16:18:15', label: 'Adelaide generation fails -- UFLS insufficient', detail: 'Under-frequency load shedding cannot save grid', freq: 47.0 },
  { time: 10, ids: ['para', 'waterloo', 'canunda', 'lakebonney'],         ts: '16:18:16', label: 'SYSTEM BLACK -- 850,000 connections',             detail: '1.7 million people. Total darkness.',            freq: 0 },
];

// ── Terminal log messages ───────────────────────────────────
const LOG_MSGS = [
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
  { time: 10.2, text: '\u2588\u2588 SYSTEM BLACK \u2588\u2588 -- ALL SA GENERATION OFFLINE', level: 'crit' },
  { time: 10.8, text: '850,000 CUSTOMER CONNECTIONS LOST', level: 'crit' },
  { time: 11.5, text: 'TOTAL CASCADE TIME: 43 SECONDS', level: 'crit' },
];

const TYPE_COLORS: Record<string, number[]> = { wind: [96, 165, 250], gas: [251, 146, 60], sub: [148, 163, 184], ic: [167, 139, 250] };
const FAILED_COLOR = [239, 68, 68];
const SURVIVED_COLOR = [34, 211, 238];
const NODE_MAP = new Map(NODES.map(n => [n.id, n]));
const getNode = (id: string) => NODE_MAP.get(id)!;

function getStepView(stepIdx: number, fallback: any) {
  if (stepIdx >= CASCADE.length - 1) return fallback;
  const nodes = CASCADE[stepIdx].ids.map(id => getNode(id)).filter(Boolean);
  const lons = nodes.map(n => n.pos[0]);
  const lats = nodes.map(n => n.pos[1]);
  const avgLon = lons.reduce((a, b) => a + b) / lons.length;
  const avgLat = lats.reduce((a, b) => a + b) / lats.length;
  const spread = Math.max(Math.max(...lons) - Math.min(...lons), Math.max(...lats) - Math.min(...lats));
  const zoom = spread < 0.5 ? 8.0 : spread < 1.5 ? 7.2 : spread < 3 ? 6.5 : 6.0;
  return { longitude: avgLon, latitude: avgLat, zoom, pitch: 35, bearing: -5 };
}

// ── Main component ──────────────────────────────────────────
export default function SACascadeMap({ width: widthProp, height = 700 }: { width?: number; height?: number }) {
  const [failed, setFailed] = useState(new Set<string>());
  const glow = useIncidentGlow();
  const [mode, setMode] = useState<'idle' | 'stepping' | 'playing'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [stepIndex, setStepIndex] = useState(-1);
  const [boot, setBoot] = useState(0);
  const bootRef = useRef<number | null>(null);
  const defaultView = VIEWS.hud;
  const [viewState, setViewState] = useState(defaultView);
  const containerRef = useRef<HTMLDivElement>(null);

  // Responsive width
  const sizeRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  useEffect(() => {
    if (widthProp) return;
    const measure = () => {
      const el = sizeRef.current;
      if (el && el.clientWidth > 0) setMeasuredWidth(el.clientWidth);
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [widthProp]);
  // Detect fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  const width = isFullscreen ? window.innerWidth : (widthProp || measuredWidth);
  const actualHeight = isFullscreen ? window.innerHeight : height;
  const compact = !isFullscreen;
  const running = mode !== 'idle';

  // Compact mode: show final state
  useEffect(() => {
    if (compact) {
      const allFailed = new Set<string>();
      CASCADE.forEach(step => step.ids.forEach(id => allFailed.add(id)));
      setFailed(allFailed);
      setMode('idle'); setElapsed(12); setActiveStep(CASCADE.length - 1); setBoot(5);
    } else {
      setFailed(new Set()); setMode('idle'); setElapsed(0); setActiveStep(-1);
      setStepIndex(-1); setViewState(defaultView); setBoot(0);
    }
  }, [compact]);

  // Boot animation (fullscreen only)
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
    return () => { clearTimeout(delay); if (bootRef.current) cancelAnimationFrame(bootRef.current); };
  }, [compact]);

  const stepForward = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx >= CASCADE.length) return;
    setMode('stepping'); setStepIndex(nextIdx);
    const nf = new Set<string>();
    for (let i = 0; i < nextIdx; i++) CASCADE[i].ids.forEach(id => nf.add(id));
    setFailed(nf);
    glow.triggerIncident(CASCADE[nextIdx].ids, (ids) => {
      setFailed(prev => { const next = new Set(prev); ids.forEach(id => next.add(id)); return next; });
    });
    setActiveStep(nextIdx); setElapsed(CASCADE[nextIdx].time + 1);
    const target = getStepView(nextIdx, defaultView);
    setViewState({ ...target, transitionDuration: 800, transitionInterpolator: FLY_TO, transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3) } as any);
  };

  const reset = () => {
    setFailed(new Set()); glow.clearAll(); setMode('idle'); setElapsed(0);
    setActiveStep(-1); setStepIndex(-1);
    setViewState({ ...defaultView, transitionDuration: 500, transitionInterpolator: FLY_TO, transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3) } as any);
  };

  const skipToEnd = () => {
    setFailed(new Set()); glow.clearAll(); setElapsed(0); setActiveStep(-1); setStepIndex(-1);
    setViewState({ ...defaultView, transitionDuration: mode === 'stepping' ? 600 : 0, transitionInterpolator: FLY_TO, transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3) } as any);
    setMode('playing');
  };

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); stepForward(); }
      else if (e.key === 'ArrowLeft' || e.key === 'Escape') { e.preventDefault(); reset(); }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  });

  const lastAutoStep = useRef(-1);
  useEffect(() => {
    if (mode !== 'playing') return;
    lastAutoStep.current = -1; glow.clearAll();
    const start = performance.now();
    let raf: number;
    const tick = () => {
      const sec = (performance.now() - start) / 1000;
      setElapsed(sec);
      let ms = -1;
      CASCADE.forEach((step, i) => { if (sec > step.time) ms = i; });
      if (ms > lastAutoStep.current) {
        for (let i = lastAutoStep.current + 1; i <= ms; i++) {
          glow.triggerIncident(CASCADE[i].ids, (ids) => {
            setFailed(prev => { const next = new Set(prev); ids.forEach(id => next.add(id)); return next; });
          });
        }
        lastAutoStep.current = ms;
      }
      setActiveStep(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  // ── Computed ──
  const currentCascade = activeStep >= 0 && activeStep < CASCADE.length ? CASCADE[activeStep] : null;
  const freq = currentCascade ? currentCascade.freq : 50.0;
  const mwOffline = Math.min(456, Math.floor((failed.size / NODES.length) * 456));
  const inDanger = running && freq < 49.0;
  const freqColor = freq === 0 ? '#ef4444' : freq < 49.0 ? '#ef4444' : freq < 49.5 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  const showBlack = running && freq === 0;

  const ease = (t: number) => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
  const bootPanel = (delay: number, dur = 0.5) => ease((boot - delay) / dur);
  const bootFade = (delay: number, dur = 0.3) => ease((boot - delay) / dur);
  const lpExpand = bootPanel(0.1, 1.1);
  const headerDraw = bootFade(0.4, 0.6);
  const buttonsDraw = bootFade(0.9, 0.6);
  const terminalDraw = bootFade(1.8, 0.6);
  const rpExpand = bootPanel(0.6, 0.8);
  const rpContent = bootFade(1.0, 0.5);
  const legendFade = bootFade(1.8, 0.5);

  // ── Lines ──
  const pulse = Math.sin(Date.now() / 250);
  const lines = SA_LINES.map(([a, b]) => {
    const nA = getNode(a), nB = getNode(b);
    const aF = failed.has(a) || glow.isInIncident(a), bF = failed.has(b) || glow.isInIncident(b);
    let color, lineGlow;
    if (aF && bF) { color = [239, 68, 68, 55]; lineGlow = [239, 68, 68, 15]; }
    else if (aF || bF) { const p = Math.floor(pulse * 40 + 155); color = [239, 68, 68, p]; lineGlow = [239, 68, 68, 40]; }
    else { color = [34, 211, 238, 150]; lineGlow = [34, 211, 238, 35]; }
    return { from: nA.pos, to: nB.pos, color, lineGlow };
  });

  const layers = [
    new LineLayer({ id: 'line-glow', data: lines, getSourcePosition: (d: any) => d.from, getTargetPosition: (d: any) => d.to, getColor: (d: any) => d.lineGlow, getWidth: 4, widthMinPixels: 2 }),
    new LineLayer({ id: 'lines', data: lines, getSourcePosition: (d: any) => d.from, getTargetPosition: (d: any) => d.to, getColor: (d: any) => d.color, getWidth: 1.5, widthMinPixels: 1 }),
    new ScatterplotLayer({
      id: 'nodes', data: NODES, getPosition: (d: any) => d.pos,
      getRadius: (d: any) => {
        if (d.type === 'sub') return 3000;
        if (glow.isInIncident(d.id)) return 3600 * Math.sqrt(Math.max(d.cap, 50) / 100) * 1.3;
        return 3600 * Math.sqrt(Math.max(d.cap, 50) / 100);
      },
      getFillColor: (d: any) => {
        if (glow.isInIncident(d.id)) return glow.getFillColor(d.id, [...(TYPE_COLORS[d.type] || [148, 163, 184]), 180]);
        if (failed.has(d.id)) return d.survived ? [...SURVIVED_COLOR, 120] : [...FAILED_COLOR, 180];
        return [...(TYPE_COLORS[d.type] || [148, 163, 184]), 180];
      },
      getLineColor: (d: any) => {
        if (glow.isInIncident(d.id)) return glow.getLineColor(d.id, [...(TYPE_COLORS[d.type] || [148, 163, 184]), 255]);
        if (failed.has(d.id)) return d.survived ? [...SURVIVED_COLOR, 200] : [...FAILED_COLOR, 255];
        return [...(TYPE_COLORS[d.type] || [148, 163, 184]), 255];
      },
      stroked: true, lineWidthMinPixels: 2, radiusMinPixels: 5, radiusMaxPixels: 24,
      updateTriggers: { getFillColor: [failed, glow.incident, glow.pulseTime], getLineColor: [failed, glow.incident, glow.pulseTime], getRadius: [failed, glow.incident, glow.pulseTime] },
    }),
    new TextLayer({
      id: 'x-marks', data: NODES.filter(n => failed.has(n.id) && !(n as any).survived && !glow.isInIncident(n.id)),
      getPosition: (d: any) => d.pos, getText: () => '\u2715', getSize: 22,
      getColor: [239, 68, 68, 255], getTextAnchor: 'middle', getAlignmentBaseline: 'center',
      fontFamily: 'JetBrains Mono', fontWeight: 'bold',
    }),
    new TextLayer({
      id: 'labels', data: NODES, getPosition: (d: any) => d.pos, getText: (d: any) => d.name,
      getSize: 11, getColor: (d: any) => {
        if (glow.isInIncident(d.id)) return glow.getLabelColor(d.id, [241, 245, 249, 190]);
        if (failed.has(d.id)) return [239, 68, 68, 180];
        return [241, 245, 249, 190];
      },
      getTextAnchor: 'middle', getAlignmentBaseline: 'top', getPixelOffset: [0, 18], fontFamily: 'Inter',
      updateTriggers: { getColor: [failed, glow.incident, glow.pulseTime] },
    }),
  ];

  const visibleLogs = running ? LOG_MSGS.filter(m => elapsed > m.time).slice(-5) : [];

  const panelBase: React.CSSProperties = {
    background: 'rgba(5, 8, 16, 0.92)', border: `1px solid ${borderClr}`,
    boxShadow: `0 0 20px ${glowColor}18, inset 0 0 15px ${glowColor}06`,
    backdropFilter: 'blur(12px)', transition: 'border-color 0.6s, box-shadow 0.6s',
    position: 'relative', borderRadius: 3,
  };
  const btnBase: React.CSSProperties = {
    background: 'rgba(26, 34, 54, 0.9)', border: '1px solid rgba(34,211,238,0.3)',
    color: '#94a3b8', padding: '7px 14px', borderRadius: 3,
    cursor: 'pointer', fontSize: 13, fontFamily: '"JetBrains Mono"', fontWeight: 600,
  };
  const btnDanger: React.CSSProperties = {
    ...btnBase, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.5)',
    color: '#ef4444', fontWeight: 700,
  };

  const legend = [
    { c: 'rgb(96,165,250)', l: 'Wind' }, { c: 'rgb(251,146,60)', l: 'Gas' },
    { c: 'rgb(148,163,184)', l: 'Substation' }, { c: 'rgb(167,139,250)', l: 'Interconnector' },
  ];

  const ready = widthProp || measuredWidth > 0;

  return (
    <div ref={sizeRef} style={{ width: '100%' }}>
    {ready ? (
    <div ref={containerRef} tabIndex={0} style={{ position: 'relative', width, height: actualHeight, overflow: 'hidden', background: '#020408', outline: 'none' }}>

      {/* ── Map ── */}
      <DeckGL viewState={viewState} onViewStateChange={({ viewState: vs }: any) => setViewState(vs)} controller={true} layers={layers} width={width} height={actualHeight} style={{ position: 'absolute' }}>
        <MapGL mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" style={{ width: '100%', height: '100%' }} />
      </DeckGL>

      {/* ── Scanline ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      {/* ── Vignette ── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, boxShadow: 'inset 0 0 120px 40px rgba(2,4,8,0.7)' }} />

      {/* ── Danger atmosphere ── */}
      {!compact && running && elapsed > 5 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, background: `radial-gradient(ellipse at center, rgba(239,68,68,${Math.min(0.12, (elapsed - 5) * 0.015)}) 0%, transparent 70%)` }} />
      )}

      {/* ── Boot Scan Line ── */}
      {!compact && boot > 0.08 && boot < 1.8 && (
        <div style={{ position: 'absolute', left: 0, right: 0, pointerEvents: 'none', zIndex: 15, top: `${ease((boot - 0.08) / 1.5) * 110}%`, height: 1, background: `linear-gradient(90deg, transparent 2%, rgba(34,211,238,${Math.max(0, 0.55 - boot * 0.5)}) 15%, rgba(34,211,238,${Math.max(0, 0.55 - boot * 0.5)}) 85%, transparent 98%)`, boxShadow: `0 0 12px rgba(34,211,238,${Math.max(0, 0.25 - boot * 0.25)})` }} />
      )}

      {/* ── Standalone controls (fullscreen) ── */}
      {!compact && (
        <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 30, display: 'flex', gap: 6 }}>
          <button onClick={reset} style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(34,211,238,0.3)', color: '#94a3b8', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>Reset</button>
          <button onClick={stepForward} disabled={stepIndex >= CASCADE.length - 1} style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(34,211,238,0.3)', color: stepIndex >= CASCADE.length - 1 ? '#64748b' : '#22d3ee', borderRadius: 4, padding: '4px 10px', cursor: stepIndex >= CASCADE.length - 1 ? 'default' : 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>Next Step {'\u2192'}</button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          HUD — Full panel layout (fullscreen only)
          ════════════════════════════════════════════════════════ */}
      {!compact && (
        <>
          {/* ── Left: Timeline Panel ── */}
          <div style={{ ...panelBase, position: 'absolute', top: 10, left: 10, width: 380, zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(5, 8, 16, 0.92)', height: `calc(${lpExpand * 100}% - 20px)`, opacity: lpExpand > 0 ? 1 : 0, transformOrigin: 'top left', clipPath: lpExpand < 1 ? `inset(0 ${Math.max(0, (1 - lpExpand * 1.6)) * 100}% ${Math.max(0, (1 - Math.max(0, (lpExpand - 0.25) / 0.75))) * 100}% 0)` : 'none' }}>
            <Corners color={glowColor} />
            {/* Header */}
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${borderClr}`, display: 'flex', alignItems: 'center', gap: 10, opacity: headerDraw, clipPath: headerDraw < 1 ? `inset(0 0 ${(1 - headerDraw) * 100}% 0)` : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? '#ef4444' : '#22d3ee', boxShadow: `0 0 10px ${running ? '#ef4444' : '#22d3ee'}` }} />
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#94a3b8', letterSpacing: '0.12em' }}>SA GRID MONITOR</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: '"JetBrains Mono"', color: '#64748bcc' }}>SEP 2016</span>
            </div>
            {/* Buttons */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderBottom: `1px solid ${borderClr}`, opacity: buttonsDraw, clipPath: buttonsDraw < 1 ? `inset(0 0 ${(1 - buttonsDraw) * 100}% 0)` : 'none' }}>
              <button onClick={reset} style={btnBase}>RESET</button>
              <button onClick={stepForward} style={{ ...btnDanger, flex: 1 }}>{'\u25B6'} BLACKOUT</button>
              <button onClick={skipToEnd} style={{ ...btnBase, padding: '7px 10px' }} title="Play all">{'\u23ED'}</button>
            </div>
            {/* Timeline entries */}
            <div style={{ flex: 1, overflowY: 'hidden', padding: '8px 16px' }}>
              {CASCADE.map((step, i) => {
                const isActive = running && elapsed > step.time;
                const isCurrent = activeStep === i;
                return (
                  <div key={i} style={{ marginBottom: 7, opacity: isActive ? 1 : 0, transition: 'opacity 0.4s, transform 0.4s', borderLeft: isCurrent ? '2px solid #ef4444' : '2px solid transparent', paddingLeft: isCurrent ? 10 : 12, transform: `translateX(${isActive ? 0 : -15}px)` }}>
                    <div style={{ fontSize: 14, fontFamily: '"Inter"', color: isActive ? (isCurrent ? '#f1f5f9' : '#f1f5f9bb') : '#64748b20', fontWeight: isCurrent ? 600 : 400, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 11, fontFamily: '"JetBrains Mono"', fontWeight: 700, color: isActive ? (isCurrent ? '#ef4444' : '#ef4444aa') : '#64748b30', flexShrink: 0 }}>{step.ts}</span>
                      {step.label}
                    </div>
                    <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono"', marginTop: 2, color: isActive ? '#94a3b870' : '#64748b15' }}>{step.detail}</div>
                  </div>
                );
              })}
            </div>
            {/* Terminal */}
            <div style={{ borderTop: `1px solid ${borderClr}`, padding: '8px 14px', minHeight: 90, maxHeight: 120, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', opacity: terminalDraw, clipPath: terminalDraw < 1 ? `inset(0 0 ${(1 - terminalDraw) * 100}% 0)` : 'none' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono"', color: '#64748b80', letterSpacing: '0.1em', marginBottom: 4 }}>SYSTEM LOG</div>
              {visibleLogs.length === 0 && (
                <div style={{ fontSize: 12, fontFamily: '"JetBrains Mono"' }}>
                  {boot > 2.2 && <div style={{ color: '#22d3eecc', marginBottom: 2 }}>{'>'} SA GRID MONITOR v1.3 INIT...</div>}
                  {boot > 2.6 && <div style={{ color: '#22d3eecc', marginBottom: 2 }}>{'>'} NODES: {NODES.length} | LINKS: {SA_LINES.length} | STATUS: OK</div>}
                  {boot > 3.0 && <div style={{ color: '#64748bcc' }}>{'>'} Awaiting events...<span className="hud-blink">{'\u2588'}</span></div>}
                </div>
              )}
              {visibleLogs.map((msg, i) => {
                const age = elapsed - msg.time;
                const chars = Math.min(msg.text.length, Math.floor(age * 45));
                const isLatest = i === visibleLogs.length - 1;
                const msgColor = msg.level === 'crit' ? '#ef4444' : '#f59e0b';
                return (
                  <div key={msg.time} style={{ fontSize: 11, fontFamily: '"JetBrains Mono"', color: msgColor, opacity: isLatest ? 1 : 0.5, marginBottom: 2, lineHeight: 1.4 }}>
                    {'>'} {msg.text.substring(0, chars)}
                    {isLatest && chars < msg.text.length && <span className="hud-blink">{'\u2588'}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Frequency readout ── */}
          <div style={{ ...panelBase, position: 'absolute', top: 10, right: 10, zIndex: 10, padding: '14px 20px', minWidth: 190, background: 'rgba(5, 8, 16, 0.92)', opacity: rpExpand > 0 ? 1 : 0, transformOrigin: 'top right', transform: `scale(${rpExpand}, ${rpExpand})` }}>
            <Corners color={glowColor} />
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748bcc', letterSpacing: '0.1em', marginBottom: 6, opacity: rpContent }}>FREQUENCY</div>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: '"JetBrains Mono"', color: freqColor, textShadow: `0 0 22px ${freqColor}40`, opacity: rpContent }}>
              {freq === 0 ? '0.000' : freq.toFixed(3)}
              <span style={{ fontSize: 18, marginLeft: 4 }}>Hz</span>
            </div>
            <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono"', color: freqColor, marginTop: 4, fontWeight: 600, opacity: rpContent }}>
              {freq === 0 ? 'SYSTEM BLACK' : freq < 49.0 ? '\u26A0 EMERGENCY' : freq < 49.5 ? '\u26A0 WARNING' : 'NOMINAL'}
            </div>
            {running && (
              <>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderClr}` }}>
                  <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60', letterSpacing: '0.1em', marginBottom: 4 }}>WIND OFFLINE</div>
                  <div style={{ fontSize: 22, fontFamily: '"JetBrains Mono"', color: '#ef4444', fontWeight: 700 }}>
                    {mwOffline}<span style={{ fontSize: 12, color: '#ef4444aa', marginLeft: 4 }}>MW</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, height: 4, background: 'rgba(239,68,68,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: '#ef4444', width: `${Math.min(100, (mwOffline / 456) * 100)}%`, transition: 'width 0.3s' }} />
                </div>
              </>
            )}
          </div>

          {/* ── Legend ── */}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 18, opacity: legendFade }}>
            {legend.map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: i.c }} />
                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: '"Inter"', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>{i.l}</span>
              </div>
            ))}
          </div>

          {/* ── SYSTEM BLACK banner ── */}
          {showBlack && (
            <div style={{ ...panelBase, position: 'absolute', bottom: 50, zIndex: 10, left: 'calc(400px + 8%)', right: 'calc(10px + 8%)', display: 'flex', justifyContent: 'center', padding: '20px 32px', whiteSpace: 'nowrap', borderColor: 'rgba(239,68,68,0.6)', boxShadow: '0 0 30px rgba(239,68,68,0.2), inset 0 0 20px rgba(239,68,68,0.08)', background: 'rgba(5, 8, 16, 0.92)' }}>
              <Corners color="#ef4444" />
              <span style={{ fontSize: 32, fontWeight: 800, fontFamily: '"JetBrains Mono"', color: '#ef4444', textShadow: '0 0 20px rgba(239,68,68,0.5)', opacity: Math.sin(Date.now() / 300) * 0.2 + 0.8 }}>
                SYSTEM BLACK -- 43 SECONDS
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Compact mode: static labels ── */}
      {compact && (
        <>
          <div style={{ ...panelBase, position: 'absolute', top: 8, left: 8, zIndex: 10, padding: '8px 14px', background: 'rgba(5, 8, 16, 0.92)' }}>
            <Corners color="#ef4444" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#94a3b8', letterSpacing: '0.12em' }}>SA GRID MONITOR</span>
              <span style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60', marginLeft: 4 }}>SEP 2016</span>
            </div>
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#ef4444', fontWeight: 600, letterSpacing: '0.08em' }}>
              SYSTEM BLACK -- 456 MW OFFLINE IN 43 SEC
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 14, padding: '4px 12px', borderRadius: 3, background: 'rgba(5, 8, 16, 0.8)', border: '1px solid rgba(34,211,238,0.15)' }}>
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
      <div style={{ width: '100%', height: actualHeight, background: '#020408' }} />
    )}
    </div>
  );
}
