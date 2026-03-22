// Kogan Creek VPP Frequency Response -- November 2019
// 1,100 Tesla Powerwall homes in Adelaide autonomously stabilize the NEM grid
// after Kogan Creek coal plant trips, losing 748 MW.
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// ── Corner brackets (HUD decoration) ────────────────────────
function Corners({ color = '#10b98150', size = 10 }: { color?: string; size?: number }) {
  const s: React.CSSProperties = { position: 'absolute', width: size, height: size };
  const b = `2px solid ${color}`;
  return (<>
    <div style={{ ...s, top: -1, left: -1, borderTop: b, borderLeft: b }} />
    <div style={{ ...s, top: -1, right: -1, borderTop: b, borderRight: b }} />
    <div style={{ ...s, bottom: -1, left: -1, borderBottom: b, borderLeft: b }} />
    <div style={{ ...s, bottom: -1, right: -1, borderBottom: b, borderRight: b }} />
  </>);
}

const FLY_TO = new FlyToInterpolator();

// ── Camera ──────────────────────────────────────────────────
const DEFAULT_VIEW = { longitude: 138.55, latitude: -34.85, zoom: 10, pitch: 35, bearing: -8 };

// ── Adelaide infrastructure nodes ───────────────────────────
const NODES = [
  { id: 'torrens',  pos: [138.523, -34.807], type: 'gas',  cap: 1280, name: 'Torrens Island' },
  { id: 'pelican',  pos: [138.506, -34.765], type: 'gas',  cap: 480,  name: 'Pelican Point' },
  { id: 'osborne',  pos: [138.508, -34.798], type: 'gas',  cap: 180,  name: 'Osborne' },
  { id: 'para',     pos: [138.630, -34.730], type: 'sub',  cap: 0,    name: 'Para Sub' },
];

const SA_LINES: [string, string][] = [
  ['para', 'torrens'],
  ['para', 'pelican'],
  ['para', 'osborne'],
];

const TYPE_COLORS: Record<string, number[]> = {
  gas: [251, 146, 60],
  sub: [148, 163, 184],
};

// ── VPP target zones (weighted random home placement) ───────
const VPP_TARGET_ZONES = [
  { latMin: -34.78, latMax: -34.65, lngMin: 138.60, lngMax: 138.72, weight: 0.35 },
  { latMin: -34.82, latMax: -34.76, lngMin: 138.60, lngMax: 138.68, weight: 0.12 },
  { latMin: -34.88, latMax: -34.82, lngMin: 138.56, lngMax: 138.62, weight: 0.10 },
  { latMin: -34.90, latMax: -34.82, lngMin: 138.49, lngMax: 138.56, weight: 0.08 },
  { latMin: -35.03, latMax: -34.97, lngMin: 138.53, lngMax: 138.59, weight: 0.10 },
  { latMin: -35.12, latMax: -35.03, lngMin: 138.50, lngMax: 138.58, weight: 0.12 },
  { latMin: -35.10, latMax: -34.70, lngMin: 138.44, lngMax: 138.78, weight: 0.13 },
];

// ── Generate 1,100 home positions using seeded PRNG ─────────
function generateHomes(count = 1100, seed = 42): number[][] {
  let s = seed;
  const rand = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };

  const homes: number[][] = [];
  // Draw from each zone proportionally
  for (const zone of VPP_TARGET_ZONES) {
    const take = Math.floor(count * zone.weight);
    for (let i = 0; i < take; i++) {
      const lng = zone.lngMin + rand() * (zone.lngMax - zone.lngMin);
      const lat = zone.latMin + rand() * (zone.latMax - zone.latMin);
      homes.push([lng, lat]);
    }
  }
  // Fill remainder from metro scatter zone (last zone)
  const fill = VPP_TARGET_ZONES[VPP_TARGET_ZONES.length - 1];
  while (homes.length < count) {
    const lng = fill.lngMin + rand() * (fill.lngMax - fill.lngMin);
    const lat = fill.latMin + rand() * (fill.latMax - fill.latMin);
    homes.push([lng, lat]);
  }

  // Sort by distance from Adelaide CBD for activation wave effect
  const cbdLng = 138.6, cbdLat = -34.93;
  homes.sort((a, b) => {
    const dA = (a[0] - cbdLng) ** 2 + (a[1] - cbdLat) ** 2;
    const dB = (b[0] - cbdLng) ** 2 + (b[1] - cbdLat) ** 2;
    return dA - dB;
  });

  return homes;
}

// ── VPP response steps ──────────────────────────────────────
interface VPPStep {
  label: string;
  detail: string;
  freq: number;
  homesActive: number;
  homePhase: 'standby' | 'risk' | 'push' | 'stable';
  view: { longitude: number; latitude: number; zoom: number; pitch: number; bearing: number };
}

const VPP_STEPS: VPPStep[] = [
  {
    label: 'Grid nominal -- 1,100 batteries standby',
    detail: 'SA VPP fleet online, FCAS raise enabled',
    freq: 50.0,
    homesActive: 0,
    homePhase: 'standby',
    view: { longitude: 138.55, latitude: -34.85, zoom: 10, pitch: 35, bearing: -8 },
  },
  {
    label: 'Kogan Creek trips -- 748 MW lost',
    detail: 'Largest single contingency event in NEM',
    freq: 49.61,
    homesActive: 0,
    homePhase: 'standby',
    view: { longitude: 138.523, latitude: -34.807, zoom: 11.5, pitch: 45, bearing: -5 },
  },
  {
    label: 'Frequency dropping -- 600K homes at risk',
    detail: 'Grid instability threatens all Adelaide',
    freq: 49.55,
    homesActive: 1100,
    homePhase: 'risk',
    view: { longitude: 138.60, latitude: -34.92, zoom: 9.8, pitch: 38, bearing: -8 },
  },
  {
    label: '300 homes detect and respond autonomously',
    detail: 'No central dispatch -- local droop response',
    freq: 49.59,
    homesActive: 300,
    homePhase: 'push',
    view: { longitude: 138.58, latitude: -34.93, zoom: 11.2, pitch: 42, bearing: -3 },
  },
  {
    label: '900 homes discharging -- frequency recovering',
    detail: 'VPP fleet scaling, response <6 seconds',
    freq: 49.75,
    homesActive: 900,
    homePhase: 'push',
    view: { longitude: 138.58, latitude: -34.93, zoom: 10.3, pitch: 42, bearing: -3 },
  },
  {
    label: 'GRID STABLE -- 1,100 homes, 0 humans',
    detail: '2% of fleet deployed. Proof it works.',
    freq: 49.95,
    homesActive: 1100,
    homePhase: 'stable',
    view: { longitude: 138.55, latitude: -34.88, zoom: 10, pitch: 38, bearing: -8 },
  },
];

// ── VPP terminal logs ───────────────────────────────────────
interface LogMsg { step: number; text: string; level: 'info' | 'warn' | 'crit' }
const VPP_LOGS: LogMsg[] = [
  { step: 0, text: 'SA VPP FLEET -- 1,100 HOME BATTERIES ONLINE', level: 'info' },
  { step: 0, text: 'FCAS BID: 6-SECOND RAISE -- ENABLED', level: 'info' },
  { step: 0, text: 'NEM FREQUENCY: 50.00 Hz -- NOMINAL', level: 'info' },
  { step: 1, text: '08:00 -- KOGAN CREEK (QLD) TRIP -- 748 MW LOST', level: 'crit' },
  { step: 1, text: 'NEM FREQUENCY FALLING -- 49.61 Hz', level: 'crit' },
  { step: 1, text: 'LARGEST SINGLE CONTINGENCY IN NEM', level: 'warn' },
  { step: 2, text: 'FREQ BELOW 49.6 Hz -- SA FLEET IN RISK ZONE', level: 'warn' },
  { step: 2, text: '600,000 HOMES AT RISK -- DISRUPTION IMMINENT', level: 'warn' },
  { step: 2, text: 'DROOP THRESHOLD APPROACHING -- STANDBY', level: 'warn' },
  { step: 3, text: 'BATTERY INVERTERS -- DROOP RESPONSE ACTIVE', level: 'info' },
  { step: 3, text: 'NO CENTRAL DISPATCH -- AUTONOMOUS DETECTION', level: 'info' },
  { step: 3, text: '300 HOMES DISCHARGING -- FCAS RAISE', level: 'info' },
  { step: 4, text: 'VPP FLEET SCALING -- 900 HOMES INJECTING', level: 'info' },
  { step: 4, text: 'RESPONSE TIME: <6 SECONDS -- WITHIN SPEC', level: 'info' },
  { step: 4, text: 'FREQUENCY RECOVERING -- 49.75 Hz', level: 'info' },
  { step: 5, text: '>> GRID STABLE << -- FREQUENCY RESTORED', level: 'info' },
  { step: 5, text: '1,100 HOMES RESPONDED -- 0 HUMANS INVOLVED', level: 'info' },
  { step: 5, text: 'VPP FLEET: 2% DEPLOYED -- PROOF OF CONCEPT', level: 'info' },
];

// ── Color constants ─────────────────────────────────────────
const VPP_GREEN: [number, number, number] = [16, 185, 129];
const VPP_AMBER: [number, number, number] = [245, 158, 11];
const STANDBY_GREY: [number, number, number] = [100, 116, 139];
const NOMINAL_CYAN: [number, number, number] = [34, 211, 238];

// ── Legend ───────────────────────────────────────────────────
const LEGEND = [
  { c: 'rgb(251,146,60)', l: 'Gas' },
  { c: 'rgb(148,163,184)', l: 'Substation' },
  { c: 'rgb(16,185,129)', l: 'VPP Home (active)' },
  { c: 'rgb(100,116,139)', l: 'VPP Home (standby)' },
];

// ── Main component ──────────────────────────────────────────
export default function KoganCreekVPPExhibit({ width: widthProp, height = 700 }: { width?: number; height?: number }) {
  const homes = useMemo(() => generateHomes(1100), []);

  const [stepIndex, setStepIndex] = useState(-1);
  const [boot, setBoot] = useState(0);
  const bootRef = useRef<number | null>(null);
  const [viewState, setViewState] = useState(DEFAULT_VIEW);
  const containerRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Responsive width
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

  // Fullscreen detection
  useEffect(() => {
    const fn = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', fn);
    return () => document.removeEventListener('fullscreenchange', fn);
  }, []);

  const width = isFullscreen ? window.innerWidth : (widthProp || measuredWidth);
  const actualHeight = isFullscreen ? window.innerHeight : height;
  const compact = !isFullscreen;

  const running = stepIndex >= 0;
  const currentStep = running ? VPP_STEPS[stepIndex] : null;
  const freq = currentStep?.freq ?? 50.0;
  const homesActive = currentStep?.homesActive ?? 0;
  const homePhase = currentStep?.homePhase ?? 'standby';

  // Boot animation
  useEffect(() => {
    if (compact) { setBoot(5); return; }
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

  // Compact mode: show final state
  useEffect(() => {
    if (compact) {
      setStepIndex(VPP_STEPS.length - 1);
      setBoot(5);
    } else {
      setStepIndex(-1);
      setViewState(DEFAULT_VIEW);
      setBoot(0);
    }
  }, [compact]);

  // Step forward
  const stepForward = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx >= VPP_STEPS.length) return;
    setStepIndex(nextIdx);
    const step = VPP_STEPS[nextIdx];
    if (step.view) {
      setViewState({
        ...step.view,
        transitionDuration: 1200,
        transitionInterpolator: FLY_TO,
        transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3),
      } as any);
    }
  };

  // Reset
  const reset = () => {
    setStepIndex(-1);
    setViewState({
      ...DEFAULT_VIEW,
      transitionDuration: 500,
      transitionInterpolator: FLY_TO,
      transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3),
    } as any);
  };

  // Keyboard navigation
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); stepForward(); }
      else if (e.key === 'ArrowLeft' || e.key === 'Escape') { e.preventDefault(); reset(); }
    };
    el.addEventListener('keydown', handler);
    return () => el.removeEventListener('keydown', handler);
  });

  // ── Boot animation helpers ──
  const ease = (t: number) => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
  const bootFade = (delay: number, dur = 0.3) => ease((boot - delay) / dur);
  const lpExpand = ease((boot - 0.1) / 1.1);
  const headerDraw = bootFade(0.4, 0.6);
  const buttonsDraw = bootFade(0.9, 0.6);
  const terminalDraw = bootFade(1.8, 0.6);
  const rpExpand = ease((boot - 0.6) / 0.8);
  const rpContent = bootFade(1.0, 0.5);
  const legendFade = bootFade(1.8, 0.5);

  // ── Danger/success color computation ──
  const isStable = homePhase === 'stable' && stepIndex === VPP_STEPS.length - 1;
  const isRisk = freq < 49.6 && running;
  const freqColor = isStable ? '#10b981' : freq < 49.6 ? '#f59e0b' : freq < 49.9 ? '#22d3ee' : '#10b981';
  const glowColor = isStable ? '#10b981' : isRisk ? '#f59e0b' : '#22d3ee';
  const borderClr = isStable ? 'rgba(16,185,129,0.5)' : isRisk ? 'rgba(245,158,11,0.35)' : 'rgba(34,211,238,0.35)';
  const showBanner = isStable;

  // ── Home color by phase ──
  function getHomeColor(index: number): [number, number, number, number] {
    if (!running) return [...STANDBY_GREY, 80];
    if (homePhase === 'standby') return [...STANDBY_GREY, 80];
    if (homePhase === 'risk') return [...VPP_AMBER, 140];
    // 'push' or 'stable' -- activate progressively
    if (homePhase === 'push') {
      if (index < homesActive) return [...VPP_GREEN, 200];
      return [...STANDBY_GREY, 80];
    }
    // stable -- all green
    return [...VPP_GREEN, 220];
  }

  // ── Build line data ──
  const lines = SA_LINES.map(([a, b]) => {
    const nA = NODES.find(n => n.id === a)!;
    const nB = NODES.find(n => n.id === b)!;
    const color: number[] = isRisk ? [245, 158, 11, 150] : [34, 211, 238, 150];
    const lineGlow: number[] = isRisk ? [245, 158, 11, 35] : [34, 211, 238, 35];
    return { from: nA.pos, to: nB.pos, color, lineGlow };
  });

  // ── Deck.gl layers ──
  const layers = [
    // Home scatter -- underneath everything
    new ScatterplotLayer({
      id: 'vpp-homes',
      data: homes,
      getPosition: (d: any) => d,
      getRadius: () => 120,
      getFillColor: (_d: any, { index }: { index: number }) => getHomeColor(index),
      radiusMinPixels: 2,
      radiusMaxPixels: 6,
      opacity: 0.9,
      updateTriggers: {
        getFillColor: [stepIndex, homesActive, homePhase],
      },
    }),
    // Infrastructure lines
    new LineLayer({
      id: 'line-glow', data: lines,
      getSourcePosition: (d: any) => d.from, getTargetPosition: (d: any) => d.to,
      getColor: (d: any) => d.lineGlow, getWidth: 4, widthMinPixels: 2,
    }),
    new LineLayer({
      id: 'lines', data: lines,
      getSourcePosition: (d: any) => d.from, getTargetPosition: (d: any) => d.to,
      getColor: (d: any) => d.color, getWidth: 1.5, widthMinPixels: 1,
    }),
    // Infrastructure nodes
    new ScatterplotLayer({
      id: 'nodes', data: NODES, getPosition: (d: any) => d.pos,
      getRadius: (d: any) => d.type === 'sub' ? 3000 : 3600 * Math.sqrt(Math.max(d.cap, 50) / 100),
      getFillColor: (d: any) => [...(TYPE_COLORS[d.type] || [148, 163, 184]), 180],
      getLineColor: (d: any) => [...(TYPE_COLORS[d.type] || [148, 163, 184]), 255],
      stroked: true, lineWidthMinPixels: 2, radiusMinPixels: 5, radiusMaxPixels: 24,
    }),
    // Node labels
    new TextLayer({
      id: 'labels', data: NODES, getPosition: (d: any) => d.pos, getText: (d: any) => d.name,
      getSize: 11, getColor: [241, 245, 249, 190],
      getTextAnchor: 'middle' as const, getAlignmentBaseline: 'top' as const, getPixelOffset: [0, 18], fontFamily: 'Inter',
    }),
  ];

  // ── Visible logs ──
  const visibleLogs = running ? VPP_LOGS.filter(m => m.step <= stepIndex).slice(-5) : [];

  // ── Styles ──
  const panelBase: React.CSSProperties = {
    background: 'rgba(5, 8, 16, 0.92)', border: `1px solid ${borderClr}`,
    boxShadow: `0 0 20px ${glowColor}18, inset 0 0 15px ${glowColor}06`,
    backdropFilter: 'blur(12px)', transition: 'border-color 0.6s, box-shadow 0.6s',
    position: 'relative', borderRadius: 3,
  };
  const btnBase: React.CSSProperties = {
    background: 'rgba(26, 34, 54, 0.9)', border: '1px solid rgba(16,185,129,0.3)',
    color: '#94a3b8', padding: '7px 14px', borderRadius: 3,
    cursor: 'pointer', fontSize: 13, fontFamily: '"JetBrains Mono"', fontWeight: 600,
  };
  const btnSuccess: React.CSSProperties = {
    ...btnBase, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.5)',
    color: '#10b981', fontWeight: 700,
  };

  const ready = widthProp || measuredWidth > 0;

  return (
    <div ref={sizeRef} style={{ width: '100%' }}>
    {ready ? (
    <div ref={containerRef} tabIndex={0} style={{ position: 'relative', width, height: actualHeight, overflow: 'hidden', background: '#020408', outline: 'none' }}>

      {/* Map */}
      <DeckGL viewState={viewState} onViewStateChange={({ viewState: vs }: any) => setViewState(vs)} controller={true} layers={layers} width={width} height={actualHeight} style={{ position: 'absolute' }}>
        <MapGL mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json" style={{ width: '100%', height: '100%' }} />
      </DeckGL>

      {/* Scanline */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5, background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, boxShadow: 'inset 0 0 120px 40px rgba(2,4,8,0.7)' }} />

      {/* Success atmosphere (green glow when stable) */}
      {!compact && isStable && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4, background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)' }} />
      )}

      {/* Boot Scan Line */}
      {!compact && boot > 0.08 && boot < 1.8 && (
        <div style={{ position: 'absolute', left: 0, right: 0, pointerEvents: 'none', zIndex: 15, top: `${ease((boot - 0.08) / 1.5) * 110}%`, height: 1, background: `linear-gradient(90deg, transparent 2%, rgba(16,185,129,${Math.max(0, 0.55 - boot * 0.5)}) 15%, rgba(16,185,129,${Math.max(0, 0.55 - boot * 0.5)}) 85%, transparent 98%)`, boxShadow: `0 0 12px rgba(16,185,129,${Math.max(0, 0.25 - boot * 0.25)})` }} />
      )}

      {/* Fullscreen controls */}
      {!compact && (
        <div style={{ position: 'absolute', bottom: 8, right: 8, zIndex: 30, display: 'flex', gap: 6 }}>
          <button onClick={reset} style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(16,185,129,0.3)', color: '#94a3b8', borderRadius: 4, padding: '4px 10px', cursor: 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>Reset</button>
          <button onClick={stepForward} disabled={stepIndex >= VPP_STEPS.length - 1} style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(16,185,129,0.3)', color: stepIndex >= VPP_STEPS.length - 1 ? '#64748b' : '#10b981', borderRadius: 4, padding: '4px 10px', cursor: stepIndex >= VPP_STEPS.length - 1 ? 'default' : 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>Next Step {'\u2192'}</button>
        </div>
      )}

      {/* ── HUD (fullscreen) ── */}
      {!compact && (
        <>
          {/* Left: Timeline Panel */}
          <div style={{ ...panelBase, position: 'absolute', top: 10, left: 10, width: 380, zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(5, 8, 16, 0.92)', height: `calc(${lpExpand * 100}% - 20px)`, opacity: lpExpand > 0 ? 1 : 0, transformOrigin: 'top left', clipPath: lpExpand < 1 ? `inset(0 ${Math.max(0, (1 - lpExpand * 1.6)) * 100}% ${Math.max(0, (1 - Math.max(0, (lpExpand - 0.25) / 0.75))) * 100}% 0)` : 'none' }}>
            <Corners color={glowColor} />
            {/* Header */}
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${borderClr}`, display: 'flex', alignItems: 'center', gap: 10, opacity: headerDraw, clipPath: headerDraw < 1 ? `inset(0 0 ${(1 - headerDraw) * 100}% 0)` : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: isStable ? '#10b981' : (isRisk ? '#f59e0b' : '#22d3ee'), boxShadow: `0 0 10px ${isStable ? '#10b981' : (isRisk ? '#f59e0b' : '#22d3ee')}` }} />
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#94a3b8', letterSpacing: '0.12em' }}>SA VPP FLEET MONITOR</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: '"JetBrains Mono"', color: '#64748bcc' }}>NOV 2019</span>
            </div>
            {/* Buttons */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderBottom: `1px solid ${borderClr}`, opacity: buttonsDraw, clipPath: buttonsDraw < 1 ? `inset(0 0 ${(1 - buttonsDraw) * 100}% 0)` : 'none' }}>
              <button onClick={reset} style={btnBase}>RESET</button>
              <button onClick={stepForward} style={{ ...btnSuccess, flex: 1 }}>{'\u25B6'} VPP RESPONSE</button>
            </div>
            {/* Timeline entries */}
            <div style={{ flex: 1, overflowY: 'hidden', padding: '8px 16px' }}>
              {VPP_STEPS.map((step, i) => {
                const isActive = running && stepIndex >= i;
                const isCurrent = stepIndex === i;
                const stepColor = step.homePhase === 'stable' ? '#10b981' : step.homePhase === 'push' ? '#10b981' : step.homePhase === 'risk' ? '#f59e0b' : '#22d3ee';
                return (
                  <div key={i} style={{ marginBottom: 7, opacity: isActive ? 1 : 0.25, transition: 'opacity 0.4s, transform 0.4s', borderLeft: isCurrent ? `2px solid ${stepColor}` : '2px solid transparent', paddingLeft: isCurrent ? 10 : 12, transform: `translateX(${isActive ? 0 : -15}px)` }}>
                    <div style={{ fontSize: 14, fontFamily: '"Inter"', color: isActive ? (isCurrent ? '#f1f5f9' : '#f1f5f9bb') : '#64748b20', fontWeight: isCurrent ? 600 : 400, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                      <span style={{ fontSize: 11, fontFamily: '"JetBrains Mono"', fontWeight: 700, color: isActive ? stepColor : '#64748b30', flexShrink: 0 }}>0{i + 1}</span>
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
                  {boot > 2.2 && <div style={{ color: '#10b981cc', marginBottom: 2 }}>{'>'} SA VPP FLEET MONITOR v2.1 INIT...</div>}
                  {boot > 2.6 && <div style={{ color: '#10b981cc', marginBottom: 2 }}>{'>'} HOMES: 1,100 | FLEET: 2% | STATUS: STANDBY</div>}
                  {boot > 3.0 && <div style={{ color: '#64748bcc' }}>{'>'} Awaiting events...</div>}
                </div>
              )}
              {visibleLogs.map((msg, i) => {
                const isLatest = i === visibleLogs.length - 1;
                const msgColor = msg.level === 'crit' ? '#ef4444' : msg.level === 'warn' ? '#f59e0b' : '#10b981';
                return (
                  <div key={`${msg.step}-${i}`} style={{ fontSize: 11, fontFamily: '"JetBrains Mono"', color: msgColor, opacity: isLatest ? 1 : 0.5, marginBottom: 2, lineHeight: 1.4 }}>
                    {'>'} {msg.text}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Frequency readout */}
          <div style={{ ...panelBase, position: 'absolute', top: 10, right: 10, zIndex: 10, padding: '14px 20px', minWidth: 190, background: 'rgba(5, 8, 16, 0.92)', opacity: rpExpand > 0 ? 1 : 0, transformOrigin: 'top right', transform: `scale(${rpExpand}, ${rpExpand})` }}>
            <Corners color={glowColor} />
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748bcc', letterSpacing: '0.1em', marginBottom: 6, opacity: rpContent }}>FREQUENCY</div>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: '"JetBrains Mono"', color: freqColor, textShadow: `0 0 22px ${freqColor}40`, opacity: rpContent }}>
              {freq.toFixed(3)}
              <span style={{ fontSize: 18, marginLeft: 4 }}>Hz</span>
            </div>
            <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono"', color: freqColor, marginTop: 4, fontWeight: 600, opacity: rpContent }}>
              {isStable ? 'GRID STABLE' : freq < 49.6 ? 'WARNING' : freq < 49.9 ? 'RECOVERING' : 'NOMINAL'}
            </div>
            {running && (
              <>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderClr}` }}>
                  <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60', letterSpacing: '0.1em', marginBottom: 4 }}>VPP HOMES ACTIVE</div>
                  <div style={{ fontSize: 22, fontFamily: '"JetBrains Mono"', color: '#10b981', fontWeight: 700 }}>
                    {homesActive.toLocaleString()}
                    <span style={{ fontSize: 12, color: '#10b981aa', marginLeft: 4 }}>/ 1,100</span>
                  </div>
                </div>
                <div style={{ marginTop: 8, height: 4, background: 'rgba(16,185,129,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, background: '#10b981', width: `${Math.min(100, (homesActive / 1100) * 100)}%`, transition: 'width 0.3s' }} />
                </div>
              </>
            )}
          </div>

          {/* Legend */}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 18, opacity: legendFade }}>
            {LEGEND.map(item => (
              <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: item.c }} />
                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: '"Inter"', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>{item.l}</span>
              </div>
            ))}
          </div>

          {/* Banner: GRID STABLE */}
          {showBanner && (
            <div style={{ ...panelBase, position: 'absolute', bottom: 50, zIndex: 10, left: 'calc(400px + 8%)', right: 'calc(10px + 8%)', display: 'flex', justifyContent: 'center', padding: '20px 32px', whiteSpace: 'nowrap', borderColor: 'rgba(16,185,129,0.6)', boxShadow: '0 0 30px rgba(16,185,129,0.2), inset 0 0 20px rgba(16,185,129,0.08)', background: 'rgba(5, 8, 16, 0.92)' }}>
              <Corners color="#10b981" />
              <span style={{ fontSize: 28, fontWeight: 800, fontFamily: '"JetBrains Mono"', color: '#10b981', textShadow: '0 0 20px rgba(16,185,129,0.5)' }}>
                GRID STABLE -- 140ms RESPONSE -- 0 HUMANS
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Compact mode: static labels ── */}
      {compact && (
        <>
          <div style={{ ...panelBase, position: 'absolute', top: 8, left: 8, zIndex: 10, padding: '8px 14px', background: 'rgba(5, 8, 16, 0.92)' }}>
            <Corners color="#10b981" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#94a3b8', letterSpacing: '0.12em' }}>SA VPP FLEET MONITOR</span>
              <span style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60', marginLeft: 4 }}>NOV 2019</span>
            </div>
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#10b981', fontWeight: 600, letterSpacing: '0.08em' }}>
              GRID STABLE -- 1,100 HOMES -- 0 HUMANS INVOLVED
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 14, padding: '4px 12px', borderRadius: 3, background: 'rgba(5, 8, 16, 0.8)', border: '1px solid rgba(16,185,129,0.15)' }}>
            {LEGEND.map(item => (
              <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: item.c }} />
                <span style={{ fontSize: 9, color: '#94a3b8aa', fontFamily: '"Inter"' }}>{item.l}</span>
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
