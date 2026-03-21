// TODO: Shared between website and presentation — combine into shared component
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

// ── Types ───────────────────────────────────────────────────
export interface CascadeNode {
  id: string;
  pos: number[];
  type: string;
  cap: number;
  name: string;
  /** SA-specific: nodes that survived the cascade (rendered cyan instead of red) */
  survived?: boolean;
}

export interface CascadeStep {
  time: number;
  ids: string[];
  ts: string;
  label: string;
  detail: string;
  /** SA/Iberian use per-step freq; Texas computes it dynamically */
  freq?: number;
}

export interface LogMessage {
  time: number;
  text: string;
  level: string;
}

export interface LegendItem {
  c: string;
  l: string;
}

export interface ViewPreset {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

/** Controls how the frequency display is computed */
export type FreqComputer = (ctx: {
  running: boolean;
  failed: Set<string>;
  elapsed: number;
  activeStep: number;
  cascade: CascadeStep[];
}) => number;

/** Controls how the offline metric is computed */
export type OfflineComputer = (ctx: {
  failed: Set<string>;
  nodes: CascadeNode[];
}) => number;

/** Controls the frequency status label */
export type FreqStatusLabel = (freq: number, running: boolean) => string;

/** Controls the danger/glow state */
export type DangerComputer = (ctx: {
  running: boolean;
  freq: number;
  elapsed: number;
}) => { inDanger: boolean; freqColor: string; glowColor: string; borderClr: string };

/** Controls the banner show condition */
export type BannerShowCondition = (ctx: {
  running: boolean;
  freq: number;
  elapsed: number;
}) => boolean;

/** Node color/radius overrides for special cases (Comanche Peak, survived nodes, etc.) */
export interface NodeOverrides {
  /** Override fill color for a node. Return undefined to use default. */
  getFillColor?: (node: CascadeNode, ctx: NodeOverrideCtx) => number[] | undefined;
  /** Override line color for a node. Return undefined to use default. */
  getLineColor?: (node: CascadeNode, ctx: NodeOverrideCtx) => number[] | undefined;
  /** Override radius for a node. Return undefined to use default. */
  getRadius?: (node: CascadeNode, ctx: NodeOverrideCtx) => number | undefined;
  /** Filter IDs during step/play to exclude certain nodes from failing (e.g. Comanche Peak) */
  filterFailIds?: (ids: string[]) => string[];
  /** Filter nodes for X marks (failed indicator). Return true to show X. */
  showXMark?: (node: CascadeNode, failed: Set<string>) => boolean;
  /** Whether to exclude node from compact failed set */
  excludeFromCompactFailed?: (id: string) => boolean;
}

export interface NodeOverrideCtx {
  running: boolean;
  failed: Set<string>;
  isInIncident: (id: string) => boolean;
}

/** Extra timeline content rendered after cascade steps (e.g. Texas "Total Collapse" block) */
export type ExtraTimelineContent = (ctx: {
  running: boolean;
  elapsed: number;
  showBanner: boolean;
}) => React.ReactNode;

/** Zoom thresholds for step view calculation */
export interface ZoomThresholds {
  /** [maxSpread, zoom] pairs, checked in order. Falls through to last zoom. */
  levels: [number, number][];
  fallbackZoom: number;
  /** How many steps from the end should fall back to overview */
  overviewFromEnd?: number;
  pitch?: number;
  bearing?: number;
}

export interface CascadeMapProps {
  width?: number;
  height?: number;
  /** Only Texas uses 'hud'|'cinematic'; SA/Iberian always use 'hud' */
  variant?: string;

  // ── Data ──
  nodes: CascadeNode[];
  lines: [string, string][];
  cascade: CascadeStep[];
  logMessages: LogMessage[];
  views: Record<string, ViewPreset>;
  typeColors: Record<string, number[]>;
  legendItems: LegendItem[];

  // ── Labels ──
  monitorName: string;
  dateText: string;
  /** Button label for the play button (e.g. "STORM URI", "BLACKOUT") */
  playButtonLabel: string;
  /** Boot init text line 1 (e.g. "ERCOT GRID MONITOR v2.1 INIT...") */
  bootInitText: string;
  /** Boot info line (e.g. "NODES: 20 | LINKS: 24 | STATUS: OK") */
  bootInfoText: string;

  // ── Compact mode ──
  compactSummary: string;
  /** Elapsed value to set in compact mode */
  compactElapsed?: number;

  // ── Banner ──
  bannerText: string;
  bannerShowCondition: BannerShowCondition;

  // ── Computations ──
  computeFreq: FreqComputer;
  computeOffline: OfflineComputer;
  offlineLabel: string;
  offlineUnit: string;
  /** Max value for the progress bar denominator */
  offlineMax: number;
  /** Whether to show the progress bar under the offline metric */
  showOfflineBar?: boolean;
  freqStatusLabel: FreqStatusLabel;
  computeDanger: DangerComputer;

  // ── Frequency display overrides ──
  /** Label above the primary metric (default "FREQUENCY") */
  freqDisplayLabel?: string;
  /** Unit shown after the primary metric value (default "Hz") */
  freqDisplayUnit?: string;
  /** Custom formatter for the primary metric value (default: freq.toFixed(3)) */
  freqDisplayFormat?: (freq: number) => string;

  // ── Node overrides ──
  nodeOverrides?: NodeOverrides;

  // ── Zoom thresholds ──
  zoomThresholds: ZoomThresholds;

  // ── Extra content ──
  /** Extra content to render inside the timeline panel, after cascade steps */
  extraTimelineContent?: ExtraTimelineContent;

  // ── Extra deck.gl layers ──
  /** Additional deck.gl layers rendered below the default node/line layers */
  extraLayers?: any[];

  // ── Cinematic variant (Texas only) ──
  /** Whether to render the cinematic variant. Only used when variant='cinematic'. */
  renderCinematicHUD?: (ctx: CinematicCtx) => React.ReactNode;
}

export interface CinematicCtx {
  running: boolean;
  elapsed: number;
  activeStep: number;
  freq: number;
  freqColor: string;
  offlineValue: number;
  offlineUnit: string;
  showBanner: boolean;
  visibleLogs: LogMessage[];
  cascade: CascadeStep[];
  legend: LegendItem[];
  panelBase: React.CSSProperties;
  btnBase: React.CSSProperties;
  btnDanger: React.CSSProperties;
  bootFade: (delay: number, dur?: number) => number;
  reset: () => void;
  stepForward: () => void;
  skipToEnd: () => void;
  bannerText: string;
  Corners: typeof Corners;
}

const FAILED_COLOR = [239, 68, 68];

// ── Main shared component ───────────────────────────────────
export default function CascadeMap({
  width: widthProp,
  height = 700,
  variant = 'hud',
  nodes,
  lines: lineData,
  cascade,
  logMessages,
  views,
  typeColors,
  legendItems,
  monitorName,
  dateText,
  playButtonLabel,
  bootInitText,
  bootInfoText,
  compactSummary,
  compactElapsed = 15,
  bannerText,
  bannerShowCondition,
  computeFreq,
  computeOffline,
  offlineLabel,
  offlineUnit,
  offlineMax,
  showOfflineBar = true,
  freqStatusLabel,
  computeDanger,
  freqDisplayLabel = 'FREQUENCY',
  freqDisplayUnit = 'Hz',
  freqDisplayFormat,
  nodeOverrides,
  zoomThresholds,
  extraTimelineContent,
  extraLayers,
  renderCinematicHUD,
}: CascadeMapProps) {
  const nodeMap = React.useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes]);
  const getNode = (id: string) => nodeMap.get(id)!;

  const [failed, setFailed] = useState(new Set<string>());
  const glow = useIncidentGlow();
  const [mode, setMode] = useState<'idle' | 'stepping' | 'playing'>('idle');
  const [elapsed, setElapsed] = useState(0);
  const [activeStep, setActiveStep] = useState(-1);
  const [stepIndex, setStepIndex] = useState(-1);
  const [boot, setBoot] = useState(0);
  const bootRef = useRef<number | null>(null);
  const defaultView = views[variant] || views.hud || Object.values(views)[0];
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

  // Helper: filter IDs through nodeOverrides
  const filterIds = (ids: string[]) =>
    nodeOverrides?.filterFailIds ? nodeOverrides.filterFailIds(ids) : ids;

  // Step view calculator
  function getStepView(stepIdx: number, fallback: ViewPreset) {
    const overviewFromEnd = zoomThresholds.overviewFromEnd ?? 2;
    if (stepIdx >= cascade.length - overviewFromEnd) return fallback;
    const stepNodes = cascade[stepIdx].ids.map(id => getNode(id)).filter(Boolean);
    const lons = stepNodes.map(n => n.pos[0]);
    const lats = stepNodes.map(n => n.pos[1]);
    const avgLon = lons.reduce((a, b) => a + b) / lons.length;
    const avgLat = lats.reduce((a, b) => a + b) / lats.length;
    const spread = Math.max(Math.max(...lons) - Math.min(...lons), Math.max(...lats) - Math.min(...lats));
    let zoom = zoomThresholds.fallbackZoom;
    for (const [maxSpread, z] of zoomThresholds.levels) {
      if (spread < maxSpread) { zoom = z; break; }
    }
    return {
      longitude: avgLon,
      latitude: avgLat,
      zoom,
      pitch: zoomThresholds.pitch ?? 45,
      bearing: zoomThresholds.bearing ?? -5,
    };
  }

  // Compact mode: show final state
  useEffect(() => {
    if (compact) {
      const allFailed = new Set<string>();
      cascade.forEach(step => step.ids.forEach(id => allFailed.add(id)));
      if (nodeOverrides?.excludeFromCompactFailed) {
        for (const id of allFailed) {
          if (nodeOverrides.excludeFromCompactFailed(id)) allFailed.delete(id);
        }
      }
      setFailed(allFailed);
      setMode('idle');
      setElapsed(compactElapsed);
      setActiveStep(cascade.length - 1);
      setBoot(5);
    } else {
      setFailed(new Set());
      setMode('idle');
      setElapsed(0);
      setActiveStep(-1);
      setStepIndex(-1);
      setViewState(defaultView);
      setBoot(0);
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

  // Step forward
  const stepForward = () => {
    const nextIdx = stepIndex + 1;
    if (nextIdx >= cascade.length) return;
    setMode('stepping');
    setStepIndex(nextIdx);
    const nf = new Set<string>();
    for (let i = 0; i < nextIdx; i++) filterIds(cascade[i].ids).forEach(id => nf.add(id));
    setFailed(nf);
    const newIds = filterIds(cascade[nextIdx].ids);
    glow.triggerIncident(newIds, (ids) => {
      setFailed(prev => { const next = new Set(prev); ids.forEach(id => next.add(id)); return next; });
    });
    setActiveStep(nextIdx);
    setElapsed(cascade[nextIdx].time + 1);
    const target = getStepView(nextIdx, defaultView);
    setViewState({ ...target, transitionDuration: 800, transitionInterpolator: FLY_TO, transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3) } as any);
  };

  // Reset
  const reset = () => {
    setFailed(new Set());
    glow.clearAll();
    setMode('idle');
    setElapsed(0);
    setActiveStep(-1);
    setStepIndex(-1);
    setViewState({ ...defaultView, transitionDuration: 500, transitionInterpolator: FLY_TO, transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3) } as any);
  };

  // Skip to end (play full auto animation at default zoom)
  const skipToEnd = () => {
    setFailed(new Set());
    glow.clearAll();
    setElapsed(0);
    setActiveStep(-1);
    setStepIndex(-1);
    setViewState({ ...defaultView, transitionDuration: mode === 'stepping' ? 600 : 0, transitionInterpolator: FLY_TO, transitionEasing: (t: number) => 1 - Math.pow(1 - t, 3) } as any);
    setMode('playing');
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

  // Auto-play loop
  const lastAutoStep = useRef(-1);
  useEffect(() => {
    if (mode !== 'playing') return;
    lastAutoStep.current = -1;
    glow.clearAll();
    const start = performance.now();
    let raf: number;
    const tick = () => {
      const sec = (performance.now() - start) / 1000;
      setElapsed(sec);
      let ms = -1;
      cascade.forEach((step, i) => { if (sec > step.time) ms = i; });
      if (ms > lastAutoStep.current) {
        for (let i = lastAutoStep.current + 1; i <= ms; i++) {
          const ids = filterIds(cascade[i].ids);
          glow.triggerIncident(ids, (completedIds) => {
            setFailed(prev => { const next = new Set(prev); completedIds.forEach(id => next.add(id)); return next; });
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

  // ── Boot animation helpers ──
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

  // ── Computed values ──
  const freq = computeFreq({ running, failed, elapsed, activeStep, cascade });
  const offlineValue = computeOffline({ failed, nodes });
  const { inDanger, freqColor, glowColor, borderClr } = computeDanger({ running, freq, elapsed });
  const showBanner = bannerShowCondition({ running, freq, elapsed });
  const freqStatus = freqStatusLabel(freq, running);

  // ── Build line data ──
  const pulse = Math.sin(Date.now() / 250);
  const lines = lineData.map(([a, b]) => {
    const nA = getNode(a), nB = getNode(b);
    const aF = failed.has(a) || glow.isInIncident(a), bF = failed.has(b) || glow.isInIncident(b);
    let color: number[], lineGlow: number[];
    if (aF && bF) { color = [239, 68, 68, 55]; lineGlow = [239, 68, 68, 15]; }
    else if (aF || bF) { const p = Math.floor(pulse * 40 + 155); color = [239, 68, 68, p]; lineGlow = [239, 68, 68, 40]; }
    else { color = [34, 211, 238, 150]; lineGlow = [34, 211, 238, 35]; }
    return { from: nA.pos, to: nB.pos, color, lineGlow };
  });

  // ── Deck.gl layers ──
  const overrideCtx: NodeOverrideCtx = { running, failed, isInIncident: glow.isInIncident };
  const defaultTypeColor = (type: string) => typeColors[type] || [148, 163, 184];

  const layers = [
    ...(extraLayers || []),
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
    new ScatterplotLayer({
      id: 'nodes', data: nodes, getPosition: (d: any) => d.pos,
      getRadius: (d: any) => {
        const ov = nodeOverrides?.getRadius?.(d, overrideCtx);
        if (ov !== undefined) return ov;
        const base = 3600 * Math.sqrt(Math.max(d.cap, 50) / 100);
        return glow.isInIncident(d.id) ? base * 1.3 : base;
      },
      getFillColor: (d: any) => {
        const ov = nodeOverrides?.getFillColor?.(d, overrideCtx);
        if (ov !== undefined) return ov;
        if (glow.isInIncident(d.id)) return glow.getFillColor(d.id, [...defaultTypeColor(d.type), 180]);
        if (failed.has(d.id)) return [...FAILED_COLOR, 180];
        return [...defaultTypeColor(d.type), 180];
      },
      getLineColor: (d: any) => {
        const ov = nodeOverrides?.getLineColor?.(d, overrideCtx);
        if (ov !== undefined) return ov;
        if (glow.isInIncident(d.id)) return glow.getLineColor(d.id, [...defaultTypeColor(d.type), 255]);
        if (failed.has(d.id)) return [...FAILED_COLOR, 255];
        return [...defaultTypeColor(d.type), 255];
      },
      stroked: true, lineWidthMinPixels: 2, radiusMinPixels: 5, radiusMaxPixels: 24,
      updateTriggers: {
        getFillColor: [failed, glow.incident, glow.pulseTime],
        getLineColor: [failed, glow.incident, glow.pulseTime],
        getRadius: [failed, glow.incident, glow.pulseTime],
      },
    }),
    new TextLayer({
      id: 'x-marks',
      data: nodes.filter(n => {
        if (nodeOverrides?.showXMark) return nodeOverrides.showXMark(n, failed);
        return failed.has(n.id) && !glow.isInIncident(n.id);
      }),
      getPosition: (d: any) => d.pos, getText: () => '\u2715', getSize: 22,
      getColor: [239, 68, 68, 255], getTextAnchor: 'middle', getAlignmentBaseline: 'center',
      fontFamily: 'JetBrains Mono', fontWeight: 'bold',
    }),
    new TextLayer({
      id: 'labels', data: nodes, getPosition: (d: any) => d.pos, getText: (d: any) => d.name,
      getSize: 11, getColor: (d: any) => {
        if (glow.isInIncident(d.id)) return glow.getLabelColor(d.id, [241, 245, 249, 190]);
        if (failed.has(d.id)) return [239, 68, 68, 180];
        return [241, 245, 249, 190];
      },
      getTextAnchor: 'middle', getAlignmentBaseline: 'top', getPixelOffset: [0, 18], fontFamily: 'Inter',
      updateTriggers: { getColor: [failed, glow.incident, glow.pulseTime] },
    }),
  ];

  const visibleLogs = running ? logMessages.filter(m => elapsed > m.time).slice(-5) : [];

  // ── Styles ──
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
          <button onClick={stepForward} disabled={stepIndex >= cascade.length - 1} style={{ background: 'rgba(5,8,16,0.8)', border: '1px solid rgba(34,211,238,0.3)', color: stepIndex >= cascade.length - 1 ? '#64748b' : '#22d3ee', borderRadius: 4, padding: '4px 10px', cursor: stepIndex >= cascade.length - 1 ? 'default' : 'pointer', fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>Next Step {'\u2192'}</button>
        </div>
      )}

      {/* ── HUD variant (fullscreen only) ── */}
      {variant === 'hud' && !compact && (
        <>
          {/* ── Left: Timeline Panel ── */}
          <div style={{ ...panelBase, position: 'absolute', top: 10, left: 10, width: 380, zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'rgba(5, 8, 16, 0.92)', height: `calc(${lpExpand * 100}% - 20px)`, opacity: lpExpand > 0 ? 1 : 0, transformOrigin: 'top left', clipPath: lpExpand < 1 ? `inset(0 ${Math.max(0, (1 - lpExpand * 1.6)) * 100}% ${Math.max(0, (1 - Math.max(0, (lpExpand - 0.25) / 0.75))) * 100}% 0)` : 'none' }}>
            <Corners color={glowColor} />
            {/* Header */}
            <div style={{ padding: '10px 16px', borderBottom: `1px solid ${borderClr}`, display: 'flex', alignItems: 'center', gap: 10, opacity: headerDraw, clipPath: headerDraw < 1 ? `inset(0 0 ${(1 - headerDraw) * 100}% 0)` : 'none' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: running ? '#ef4444' : '#22d3ee', boxShadow: `0 0 10px ${running ? '#ef4444' : '#22d3ee'}` }} />
              <span style={{ fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#94a3b8', letterSpacing: '0.12em' }}>{monitorName}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: '"JetBrains Mono"', color: '#64748bcc' }}>{dateText}</span>
            </div>
            {/* Buttons */}
            <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderBottom: `1px solid ${borderClr}`, opacity: buttonsDraw, clipPath: buttonsDraw < 1 ? `inset(0 0 ${(1 - buttonsDraw) * 100}% 0)` : 'none' }}>
              <button onClick={reset} style={btnBase}>RESET</button>
              <button onClick={stepForward} style={{ ...btnDanger, flex: 1 }}>{'\u25B6'} {playButtonLabel}</button>
              <button onClick={skipToEnd} style={{ ...btnBase, padding: '7px 10px' }} title="Play all">{'\u23ED'}</button>
            </div>
            {/* Timeline entries */}
            <div style={{ flex: 1, overflowY: 'hidden', padding: '8px 16px' }}>
              {cascade.map((step, i) => {
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
              {extraTimelineContent?.({ running, elapsed, showBanner })}
            </div>
            {/* Terminal */}
            <div style={{ borderTop: `1px solid ${borderClr}`, padding: '8px 14px', minHeight: 90, maxHeight: 120, overflow: 'hidden', background: 'rgba(0,0,0,0.3)', opacity: terminalDraw, clipPath: terminalDraw < 1 ? `inset(0 0 ${(1 - terminalDraw) * 100}% 0)` : 'none' }}>
              <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono"', color: '#64748b80', letterSpacing: '0.1em', marginBottom: 4 }}>SYSTEM LOG</div>
              {visibleLogs.length === 0 && (
                <div style={{ fontSize: 12, fontFamily: '"JetBrains Mono"' }}>
                  {boot > 2.2 && <div style={{ color: '#22d3eecc', marginBottom: 2 }}>{'>'} {bootInitText}</div>}
                  {boot > 2.6 && <div style={{ color: '#22d3eecc', marginBottom: 2 }}>{'>'} {bootInfoText}</div>}
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
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748bcc', letterSpacing: '0.1em', marginBottom: 6, opacity: rpContent }}>{freqDisplayLabel}</div>
            <div style={{ fontSize: 36, fontWeight: 800, fontFamily: '"JetBrains Mono"', color: freqColor, textShadow: `0 0 22px ${freqColor}40`, opacity: rpContent }}>
              {freqDisplayFormat ? freqDisplayFormat(freq) : (freq === 0 ? '0.000' : freq.toFixed(3))}
              <span style={{ fontSize: 18, marginLeft: 4 }}>{freqDisplayUnit}</span>
            </div>
            <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono"', color: freqColor, marginTop: 4, fontWeight: 600, opacity: rpContent }}>
              {freqStatus}
            </div>
            {running && (
              <>
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderClr}` }}>
                  <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60', letterSpacing: '0.1em', marginBottom: 4 }}>{offlineLabel}</div>
                  <div style={{ fontSize: 22, fontFamily: '"JetBrains Mono"', color: '#ef4444', fontWeight: 700 }}>
                    {typeof offlineValue === 'number' && offlineValue > 999 ? offlineValue.toLocaleString() : offlineValue}
                    <span style={{ fontSize: 12, color: '#ef4444aa', marginLeft: 4 }}>{offlineUnit}</span>
                  </div>
                </div>
                {showOfflineBar && (
                  <div style={{ marginTop: 8, height: 4, background: 'rgba(239,68,68,0.15)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 2, background: '#ef4444', width: `${Math.min(100, (offlineValue / offlineMax) * 100)}%`, transition: 'width 0.3s' }} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Legend ── */}
          <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 18, opacity: legendFade }}>
            {legendItems.map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: i.c }} />
                <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: '"Inter"', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>{i.l}</span>
              </div>
            ))}
          </div>

          {/* ── Banner ── */}
          {showBanner && (
            <div style={{ ...panelBase, position: 'absolute', bottom: 50, zIndex: 10, left: 'calc(400px + 8%)', right: 'calc(10px + 8%)', display: 'flex', justifyContent: 'center', padding: '20px 32px', whiteSpace: 'nowrap', borderColor: 'rgba(239,68,68,0.6)', boxShadow: '0 0 30px rgba(239,68,68,0.2), inset 0 0 20px rgba(239,68,68,0.08)', background: 'rgba(5, 8, 16, 0.92)' }}>
              <Corners color="#ef4444" />
              <span style={{ fontSize: 32, fontWeight: 800, fontFamily: '"JetBrains Mono"', color: '#ef4444', textShadow: '0 0 20px rgba(239,68,68,0.5)', opacity: Math.sin(Date.now() / 300) * 0.2 + 0.8 }}>
                {bannerText}
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Cinematic variant (Texas only) ── */}
      {variant === 'cinematic' && !compact && renderCinematicHUD?.({
        running, elapsed, activeStep, freq, freqColor,
        offlineValue, offlineUnit, showBanner,
        visibleLogs, cascade, legend: legendItems,
        panelBase, btnBase, btnDanger, bootFade,
        reset, stepForward, skipToEnd,
        bannerText, Corners,
      })}

      {/* ── Compact mode: static labels ── */}
      {compact && (
        <>
          <div style={{ ...panelBase, position: 'absolute', top: 8, left: 8, zIndex: 10, padding: '8px 14px', background: 'rgba(5, 8, 16, 0.92)' }}>
            <Corners color="#ef4444" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#94a3b8', letterSpacing: '0.12em' }}>{monitorName}</span>
              <span style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60', marginLeft: 4 }}>{dateText}</span>
            </div>
            <div style={{ fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#ef4444', fontWeight: 600, letterSpacing: '0.08em' }}>
              {compactSummary}
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: 14, padding: '4px 12px', borderRadius: 3, background: 'rgba(5, 8, 16, 0.8)', border: '1px solid rgba(34,211,238,0.15)' }}>
            {legendItems.map(i => (
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
