// TODO: Shared between website and presentation — combine into shared component
import React, { useState, useEffect, useRef } from 'react';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer, PolygonLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

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

const VIEWS = {
  hud: { longitude: -3.5, latitude: 39.5, zoom: 5.2, pitch: 30, bearing: -5 },
};

// ── Infrastructure nodes ────────────────────────────────────
const NODES = [
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
const CASCADE = [
  { time: 0,  ids: ['solar_jaen', 'solar_cordoba'],                          ts: '12:33:00', label: 'Voltage climbing -- first solar inverters trip',    detail: '59% solar penetration, overvoltage rising',     freq: 50.1 },
  { time: 2,  ids: ['solar_badajoz', 'solar_ciudad', 'solar_caceres'],       ts: '12:33:01', label: 'Overvoltage cascade -- 5 GW solar disconnecting',  detail: 'Inverters enter protective shutdown',           freq: 50.3 },
  { time: 4,  ids: ['solar_albacete', 'solar_murcia'],                        ts: '12:33:03', label: 'All major solar offline -- 9 GW lost',             detail: 'Grid reactive power collapses',                 freq: 49.2 },
  { time: 6,  ids: ['france_ic'],                                             ts: '12:33:04', label: 'France interconnector overloads -- trips',         detail: '2,800 MW import capacity lost',                 freq: 48.5 },
  { time: 8,  ids: ['almaraz', 'cofrentes'],                                  ts: '12:33:05', label: 'Nuclear plants disconnect -- protective shutdown', detail: 'Frequency deviation exceeds tolerance',         freq: 47.8 },
  { time: 10, ids: ['madrid', 'barcelona', 'lisbon', 'seville', 'valencia', 'porto', 'bilbao'], ts: '12:33:06', label: 'TOTAL BLACKOUT -- 60 million people', detail: '15 GW lost in 6 seconds. Fastest national collapse ever.', freq: 0 },
];

const LOG_MSGS = [
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
const FAILED_COLOR = [239, 68, 68];
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
  const zoom = spread < 1 ? 7.5 : spread < 2.5 ? 6.8 : spread < 5 ? 6.0 : 5.2;
  return { longitude: avgLon, latitude: avgLat, zoom, pitch: 30, bearing: -5 };
}

export default function IberianCascadeMap({ width: widthProp, height = 700 }: { width?: number; height?: number }) {
  const [failed, setFailed] = useState(new Set<string>());
  const [mode, setMode] = useState<'idle' | 'stepping' | 'playing'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [stepIndex, setStepIndex] = useState(-1);
  const [boot, setBoot] = useState(0);
  const bootRef = useRef<number | null>(null);
  const defaultView = VIEWS.hud;
  const [viewState, setViewState] = useState(defaultView);
  const containerRef = useRef<HTMLDivElement>(null);

  const sizeRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  useEffect(() => {
    if (widthProp) return;
    const measure = () => { const el = sizeRef.current; if (el && el.clientWidth > 0) setMeasuredWidth(el.clientWidth); };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [widthProp]);
  const width = widthProp || measuredWidth;

  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => { const fn = () => setIsFullscreen(!!document.fullscreenElement); document.addEventListener('fullscreenchange', fn); return () => document.removeEventListener('fullscreenchange', fn); }, []);
  const compact = !isFullscreen;
  const running = mode !== 'idle';

  useEffect(() => {
    if (compact) {
      const allFailed = new Set<string>();
      CASCADE.forEach(step => step.ids.forEach(id => allFailed.add(id)));
      setFailed(allFailed); setMode('idle'); setElapsed(13); setActiveStep(CASCADE.length - 1); setBoot(5);
    } else {
      setFailed(new Set()); setMode('idle'); setElapsed(0); setActiveStep(-1);
      setStepIndex(-1); setViewState(defaultView); setBoot(0);
    }
  }, [compact]);

  useEffect(() => {
    if (compact) return;
    setBoot(0);
    const delay = setTimeout(() => {
      const start = performance.now();
      const tick = () => { const s = (performance.now() - start) / 1000; setBoot(s); if (s < 4.0) bootRef.current = requestAnimationFrame(tick); };
      bootRef.current = requestAnimationFrame(tick);
    }, 700);
    return () => { clearTimeout(delay); if (bootRef.current) cancelAnimationFrame(bootRef.current); };
  }, [compact]);

  const stepForward = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx >= CASCADE.length) return;
    setMode('stepping'); setStepIndex(nextIdx);
    const nf = new Set<string>();
    for (let i = 0; i <= nextIdx; i++) CASCADE[i].ids.forEach(id => nf.add(id));
    setFailed(nf); setActiveStep(nextIdx); setElapsed(CASCADE[nextIdx].time + 1);
    setViewState({ ...getStepView(nextIdx, defaultView), transitionDuration: 800, transitionInterpolator: FLY_TO, transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3) } as any);
  };

  const reset = () => {
    setFailed(new Set()); setMode('idle'); setElapsed(0); setActiveStep(-1); setStepIndex(-1);
    setViewState({ ...defaultView, transitionDuration: 500, transitionInterpolator: FLY_TO, transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3) } as any);
  };

  const skipToEnd = () => {
    setFailed(new Set()); setElapsed(0); setActiveStep(-1); setStepIndex(-1);
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

  useEffect(() => {
    if (mode !== 'playing') return;
    const start = performance.now();
    let raf: number;
    const tick = () => {
      const sec = (performance.now() - start) / 1000;
      setElapsed(sec);
      const nf = new Set<string>(); let ms = -1;
      CASCADE.forEach((step, i) => { if (sec > step.time) { step.ids.forEach(id => nf.add(id)); ms = i; } });
      setFailed(nf); setActiveStep(ms);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  const currentCascade = activeStep >= 0 && activeStep < CASCADE.length ? CASCADE[activeStep] : null;
  const freq = currentCascade ? currentCascade.freq : 50.0;
  const gwOffline = Math.min(15, Math.floor((failed.size / NODES.length) * 15));
  const isOvervoltage = running && freq > 50.0;
  const inDanger = running && (freq === 0 || freq < 49.0);
  const freqColor = freq === 0 ? '#ef4444' : freq < 49.0 ? '#ef4444' : freq > 50.0 ? '#f59e0b' : '#22d3ee';
  const glowColor = inDanger ? '#ef4444' : isOvervoltage ? '#f59e0b' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : isOvervoltage ? 'rgba(245,158,11,0.4)' : 'rgba(34,211,238,0.35)';
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

  const pulse = Math.sin(Date.now() / 250);
  const lines = LINES.map(([a, b]) => {
    const nA = getNode(a), nB = getNode(b);
    const aF = failed.has(a), bF = failed.has(b);
    let color, glow;
    if (aF && bF) { color = [239, 68, 68, 55]; glow = [239, 68, 68, 15]; }
    else if (aF || bF) { const p = Math.floor(pulse * 40 + 155); color = [239, 68, 68, p]; glow = [239, 68, 68, 40]; }
    else { color = [34, 211, 238, 150]; glow = [34, 211, 238, 35]; }
    return { from: nA.pos, to: nB.pos, color, glow };
  });

  const layers = [
    new LineLayer({ id: 'glow', data: lines, getSourcePosition: (d: any) => d.from, getTargetPosition: (d: any) => d.to, getColor: (d: any) => d.glow, getWidth: 4, widthMinPixels: 2 }),
    new LineLayer({ id: 'lines', data: lines, getSourcePosition: (d: any) => d.from, getTargetPosition: (d: any) => d.to, getColor: (d: any) => d.color, getWidth: 1.5, widthMinPixels: 1 }),
    new ScatterplotLayer({
      id: 'nodes', data: NODES, getPosition: (d: any) => d.pos,
      getRadius: (d: any) => d.type === 'hub' ? 5000 : 3600 * Math.sqrt(Math.max(d.cap, 200) / 500),
      getFillColor: (d: any) => {
        if (failed.has(d.id)) return [...FAILED_COLOR, 180];
        return [...(TYPE_COLORS[d.type] || [148, 163, 184]), 180];
      },
      getLineColor: (d: any) => {
        if (failed.has(d.id)) return [...FAILED_COLOR, 255];
        return [...(TYPE_COLORS[d.type] || [148, 163, 184]), 255];
      },
      stroked: true, lineWidthMinPixels: 2, radiusMinPixels: 5, radiusMaxPixels: 24,
      transitions: { getFillColor: 400, getRadius: 300 },
    }),
    new TextLayer({
      id: 'x-marks', data: NODES.filter(n => failed.has(n.id)),
      getPosition: (d: any) => d.pos, getText: () => '\u2715', getSize: 22,
      getColor: [239, 68, 68, 255], getTextAnchor: 'middle', getAlignmentBaseline: 'center',
      fontFamily: 'JetBrains Mono', fontWeight: 'bold',
    }),
    new TextLayer({
      id: 'labels', data: NODES, getPosition: (d: any) => d.pos, getText: (d: any) => d.name,
      getSize: 11, getColor: (d: any) => failed.has(d.id) ? [239, 68, 68, 180] : [241, 245, 249, 190],
      getTextAnchor: 'middle', getAlignmentBaseline: 'top', getPixelOffset: [0, 18], fontFamily: 'Inter',
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
    { c: 'rgb(245,158,11)', l: 'Solar' }, { c: 'rgb(148,163,184)', l: 'City Hub' },
    { c: 'rgb(96,165,250)', l: 'Nuclear' }, { c: 'rgb(167,139,250)', l: 'Interconnector' },
  ];

  const ready = widthProp || measuredWidth > 0;

  return (
    <div ref={sizeRef} style={{ width: '100%' }}>
    {ready ? (
    <div ref={containerRef} tabIndex={0} style={{ position: 'relative', width, height, overflow: 'hidden', background: '#020408', outline: 'none' }}>

      <DeckGL viewState={viewState} onViewStateChange={({ viewState: vs }: any) => setViewState(vs)} controller={true} layers={layers} width={width} height={height} style={{ position: 'absolute' }}>
        <MapGL mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" style={{ width: '100%', height: '100%' }} />
      </DeckGL>

      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, boxShadow: 'inset 0 0 120px 40px rgba(2,4,8,0.7)' }} />

      {!compact && running && elapsed > 5 && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, background: `radial-gradient(ellipse at center, rgba(239,68,68,${Math.min(0.12, (elapsed - 5) * 0.015)}) 0%, transparent 70%)` }} />
      )}

      {!compact && boot > 0.08 && boot < 1.8 && (
        <div style={{ position: 'absolute', left: 0, right: 0, pointerEvents: 'none', zIndex: 15, top: `${ease((boot - 0.08) / 1.5) * 110}%`, height: 1, background: `linear-gradient(90deg, transparent 2%, rgba(34,211,238,${Math.max(0, 0.55 - boot * 0.5)}) 15%, rgba(34,211,238,${Math.max(0, 0.55 - boot * 0.5)}) 85%, transparent 98%)` }} />
      )}

      {!compact && (
        <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 30, display: 'flex', gap: 6 }}>
          <button onClick={reset} style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(34,211,238,0.3)', color: '#94a3b8', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>Reset</button>
          <button onClick={stepForward} disabled={stepIndex >= CASCADE.length - 1} style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(34,211,238,0.3)', color: stepIndex >= CASCADE.length - 1 ? '#64748b' : '#22d3ee', borderRadius: 4, padding: '4px 10px', cursor: stepIndex >= CASCADE.length - 1 ? 'default' : 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>Next Step {'\u2192'}</button>
        </div>
      )}

      {/* ── HUD (fullscreen only) ── */}
      {!compact && (
        <>
          <div style={{ ...panelBase, position: 'absolute', top: 10, left: 10, width: 380, zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(5, 8, 16, 0.92)', height: `calc(${lpExpand * 100}% - 20px)`, opacity: lpExpand > 0 ? 1 : 0, transformOrigin: 'top left', clipPath: lpExpand < 1 ? `inset(0 ${Math.max(0, (1 - lpExpand * 1.6)) * 100}% ${Math.max(0, (1 - Math.max(0, (lpExpand - 0.25) / 0.75))) * 100}% 0)` : 'none' }}>
            <Corners color={glowColor} />
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${borderClr}`, display: 'flex', alignItems: 'center', gap: 10, opacity: headerDraw }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? '#ef4444' : '#22d3ee', boxShadow: `0 0 10px ${running ? '#ef4444' : '#22d3ee'}` }} />
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#94a3b8', letterSpacing: '0.12em' }}>IBERIAN GRID</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: '"JetBrains Mono"', color: '#64748bcc' }}>APR 2025</span>
            </div>
            <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderBottom: `1px solid ${borderClr}`, opacity: buttonsDraw }}>
              <button onClick={reset} style={btnBase}>RESET</button>
              <button onClick={stepForward} style={{ ...btnDanger, flex: 1 }}>{'\u25B6'} BLACKOUT</button>
              <button onClick={skipToEnd} style={{ ...btnBase, padding: '7px 10px' }}>{'\u23ED'}</button>
            </div>
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
            <div style={{ borderTop: `1px solid ${borderClr}`, padding: '8px 14px', minHeight: 90, maxHeight: 120, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', opacity: terminalDraw }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono"', color: '#64748b80', letterSpacing: '0.1em', marginBottom: 4 }}>SYSTEM LOG</div>
              {visibleLogs.length === 0 && (
                <div style={{ fontSize: 12, fontFamily: '"JetBrains Mono"' }}>
                  {boot > 2.2 && <div style={{ color: '#22d3eecc', marginBottom: 2 }}>{'>'} IBERIAN GRID MONITOR v1.0 INIT...</div>}
                  {boot > 2.6 && <div style={{ color: '#22d3eecc', marginBottom: 2 }}>{'>'} NODES: {NODES.length} | LINKS: {LINES.length} | SOLAR: 59%</div>}
                  {boot > 3.0 && <div style={{ color: '#64748bcc' }}>{'>'} Awaiting events...<span className="hud-blink">{'\u2588'}</span></div>}
                </div>
              )}
              {visibleLogs.map((msg, i) => {
                const age = elapsed - msg.time;
                const chars = Math.min(msg.text.length, Math.floor(age * 45));
                const isLatest = i === visibleLogs.length - 1;
                return (
                  <div key={msg.time} style={{ fontSize: 11, fontFamily: '"JetBrains Mono"', color: msg.level === 'crit' ? '#ef4444' : '#f59e0b', opacity: isLatest ? 1 : 0.5, marginBottom: 2, lineHeight: 1.4 }}>
                    {'>'} {msg.text.substring(0, chars)}
                    {isLatest && chars < msg.text.length && <span className="hud-blink">{'\u2588'}</span>}
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ ...panelBase, position: 'absolute', top: 10, right: 10, zIndex: 10, padding: '14px 20px', minWidth: 190, background: 'rgba(5, 8, 16, 0.92)', opacity: rpExpand > 0 ? 1 : 0, transformOrigin: 'top right', transform: `scale(${rpExpand})` }}>
            <Corners color={glowColor} />
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748bcc', letterSpacing: '0.1em', marginBottom: 6, opacity: rpContent }}>FREQUENCY</div>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: '"JetBrains Mono"', color: freqColor, textShadow: `0 0 22px ${freqColor}40`, opacity: rpContent }}>
              {freq === 0 ? '0.000' : freq.toFixed(3)}<span style={{ fontSize: 18, marginLeft: 4 }}>Hz</span>
            </div>
            <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono"', color: freqColor, marginTop: 4, fontWeight: 600, opacity: rpContent }}>
              {freq === 0 ? 'TOTAL BLACKOUT' : freq < 49.0 ? '\u26A0 EMERGENCY' : freq > 50.0 ? '\u26A0 OVERVOLTAGE' : 'NOMINAL'}
            </div>
            {running && (
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderClr}` }}>
                <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60', letterSpacing: '0.1em', marginBottom: 4 }}>GENERATION LOST</div>
                <div style={{ fontSize: 22, fontFamily: '"JetBrains Mono"', color: '#ef4444', fontWeight: 700 }}>
                  {gwOffline}<span style={{ fontSize: 12, color: '#ef4444aa', marginLeft: 4 }}>GW</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 18, opacity: legendFade }}>
            {legend.map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: i.c }} />
                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: '"Inter"', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>{i.l}</span>
              </div>
            ))}
          </div>

          {showBlack && (
            <div style={{ ...panelBase, position: 'absolute', bottom: 50, zIndex: 10, left: 'calc(400px + 8%)', right: 'calc(10px + 8%)', display: 'flex', justifyContent: 'center', padding: '20px 32px', whiteSpace: 'nowrap', borderColor: 'rgba(239,68,68,0.6)', boxShadow: '0 0 30px rgba(239,68,68,0.2), inset 0 0 20px rgba(239,68,68,0.08)', background: 'rgba(5, 8, 16, 0.92)' }}>
              <Corners color="#ef4444" />
              <span style={{ fontSize: 32, fontWeight: 800, fontFamily: '"JetBrains Mono"', color: '#ef4444', textShadow: '0 0 20px rgba(239,68,68,0.5)', opacity: Math.sin(Date.now() / 300) * 0.2 + 0.8 }}>
                TOTAL BLACKOUT -- 6 SECONDS
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Compact mode ── */}
      {compact && (
        <>
          <div style={{ ...panelBase, position: 'absolute', top: 8, left: 8, zIndex: 10, padding: '8px 14px', background: 'rgba(5, 8, 16, 0.92)' }}>
            <Corners color="#ef4444" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#94a3b8', letterSpacing: '0.12em' }}>IBERIAN GRID</span>
              <span style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60', marginLeft: 4 }}>APR 2025</span>
            </div>
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#ef4444', fontWeight: 600, letterSpacing: '0.08em' }}>
              TOTAL BLACKOUT -- 15 GW LOST IN 6 SEC
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
      <div style={{ width: '100%', height, background: '#020408' }} />
    )}
    </div>
  );
}
