import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator, WebMercatorViewport } from '@deck.gl/core';
import { ScatterplotLayer, TextLayer, PathLayer, PolygonLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ATLAS_FEATURES } from '../data/japanGridAtlasData.mjs';
import { PLANT_COLORS, FUEL_ICONS, FREQUENCY_COLORS } from './JapanGridAtlas.jsx';

const FLY_TO = new FlyToInterpolator();
const FREQ_SEAM_LON = 137.4;

// ── Type scale (dark cyberpunk side) ──────────────────────────────
// Keep the entire cascade HUD to this ladder.
const T = {
  eyebrow: { fontSize: 10, letterSpacing: '0.14em', fontFamily: 'var(--font-mono)' },
  micro:   { fontSize: 11, fontFamily: 'var(--font-mono)' },
  body:    { fontSize: 12, fontFamily: 'var(--font-mono)' },
  label:   { fontSize: 13, fontFamily: 'var(--font-heading), Inter, sans-serif' },
  h3:      { fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-heading), Inter, sans-serif' },
  h2:      { fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-heading), Inter, sans-serif' },
  metric:  { fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-mono)' },
  hero:    { fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-mono)' },
};
const COLORS = {
  crit: '#ef4444', warn: '#f59e0b', cyan: '#22d3ee', gold: '#ffc217',
  ink: '#f1f5f9', dim: '#94a3b8', mute: '#64748b', muteFaint: '#64748b40',
};

const MAP_STYLE = {
  version: 8,
  sources: { base: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } },
  layers: [{ id: 'base', type: 'raster', source: 'base', paint: { 'raster-opacity': 0.7 } }],
};

const PLANT_BY_NAME = new Map(ATLAS_FEATURES.plants.map((p) => [p.name, p]));
const getPlant = (name) => PLANT_BY_NAME.get(name);
const parseGW = (str) => { const n = parseFloat(str); return Number.isFinite(n) ? n : 0.1; };

const VIEWS = {
  overview: { longitude: 138.8, latitude: 37.4, zoom: 5.4, pitch: 40, bearing: 6 },
  epicenter:{ longitude: 141.6, latitude: 37.7, zoom: 6.2, pitch: 42, bearing: -2 },
  tohoku:   { longitude: 141.2, latitude: 38.3, zoom: 6.4, pitch: 45, bearing: -4 },
  kanto:    { longitude: 140.0, latitude: 35.9, zoom: 6.6, pitch: 48, bearing: 2 },
  seam:     { longitude: 137.6, latitude: 36.0, zoom: 6.2, pitch: 42, bearing: -6 },
  hokkaido: { longitude: 141.5, latitude: 42.6, zoom: 5.6, pitch: 42, bearing: 8 },
  wide:     { longitude: 138.5, latitude: 37.0, zoom: 5.2, pitch: 30, bearing: 4 },
};

// Fukushima-oki epicenter (approx. 2022-03-16 quake location)
const EPICENTER = [141.62, 37.70];
// Approximate felt-shaking radius polygon around the epicenter (visual, not seismological)
const SEISMIC_ZONE = (() => {
  const cx = EPICENTER[0], cy = EPICENTER[1], r = 2.2; // ~250km
  return Array.from({ length: 48 }, (_, i) => {
    const t = (i / 48) * Math.PI * 2;
    return [cx + Math.cos(t) * r, cy + Math.sin(t) * r * 0.95];
  });
})();
// Arctic front sweep polygon over northern Japan
const ARCTIC_FRONT = [
  [138.5, 45.6], [146.5, 45.6], [146.5, 41.0], [143.0, 40.4],
  [140.0, 40.6], [138.5, 41.4],
];

// Cascade sequence — March 2022 Fukushima-oki quake + cold-snap chain.
// mark = geo point to draw leader line & path from
const CASCADE = [
  { ts: 'MAR 16 · 23:36 JST', view: VIEWS.epicenter, mark: EPICENTER,
    label: 'Seismic event — M7.4 offshore Fukushima',
    detail: 'Depth 60 km · shaking felt across Tohoku & Kanto',
    trips: [], severity: 'warn', showEpicenter: true },
  { ts: 'MAR 16 · 23:38 JST', view: VIEWS.tohoku, mark: [141.5, 38.4],
    label: 'Nuclear + thermal fleet trip on the coast',
    detail: 'Onagawa, Higashidori scram · Hitachinaka, Kashima drop',
    trips: ['Onagawa', 'Higashidori', 'Hitachinaka', 'Kashima'], severity: 'crit' },
  { ts: 'MAR 17 · 06:00', view: VIEWS.kanto, mark: [139.9, 35.3],
    label: 'Restart delays ripple south — Kanto LNG absorbs load',
    detail: '6.5 GW east-coast thermal offline · JERA fleet redlines',
    trips: ['Fukushima Daini', 'Futtsu'], severity: 'crit' },
  { ts: 'MAR 21 · 18:00', view: VIEWS.hokkaido, mark: [141.5, 43.4],
    label: 'Arctic front sweeps south from Hokkaido',
    detail: 'Tokyo forecast -3°C · heating demand jumps 15%',
    trips: [], severity: 'warn', showFront: true },
  { ts: 'MAR 22 · 08:00', view: VIEWS.kanto, mark: [140.0, 35.5],
    label: 'Overcast + still air — wind + solar collapse',
    detail: 'Renewables <5% of expected · LNG stockpiles thin',
    trips: ['Anegasaki'], severity: 'warn' },
  { ts: 'MAR 22 · 09:00', view: VIEWS.seam, mark: [137.4, 35.3],
    label: 'Frequency Converter maxed — 2.1 GW cap west→east',
    detail: '50 Hz Tokyo cannot pull enough from 60 Hz Kansai',
    trips: [], severity: 'crit' },
  { ts: 'MAR 22 · 11:00', view: VIEWS.kanto, mark: [139.8, 35.5],
    label: 'METI: first-ever POWER SUPPLY EMERGENCY WARNING',
    detail: 'Reserve margin 2.5% · below 3% safety threshold',
    trips: ['Higashi-Ohgishima'], severity: 'crit' },
  { ts: 'MAR 22 · 15:00', view: VIEWS.kanto, mark: [139.7, 35.7],
    label: 'Public conservation call — 3M homes dim lights',
    detail: 'JEPX spot spikes · 40-day price memory reopens',
    trips: [], severity: 'crit' },
  { ts: 'MAR 22 · 21:00', view: VIEWS.overview, mark: [138.8, 37.4],
    label: 'Blackout averted — but the precedent is set',
    detail: 'Every winter now carries this shape',
    trips: [], severity: 'crit' },
];

const LOG_MSGS = [
  { step: 0, text: 'SEISMIC EVENT M7.4 — FUKUSHIMA-OKI', level: 'crit' },
  { step: 1, text: 'AUTO-SCRAM: ONAGAWA, HIGASHIDORI', level: 'crit' },
  { step: 2, text: 'THERMAL FLEET OFFLINE — 6.5 GW LOST', level: 'crit' },
  { step: 3, text: 'TEMP: -3°C FORECAST · DEMAND +15%', level: 'warn' },
  { step: 4, text: 'WIND / SOLAR GENERATION < 5% EXPECTED', level: 'warn' },
  { step: 5, text: 'FC LINK SATURATED · 2.1 GW MAX WEST→EAST', level: 'crit' },
  { step: 6, text: 'RESERVE MARGIN 2.5% — BELOW SAFETY', level: 'crit' },
  { step: 6, text: 'METI ISSUES FIRST-EVER SUPPLY WARNING', level: 'crit' },
  { step: 7, text: 'JEPX SPOT SPIKE · MEMORY OF JAN 2021', level: 'warn' },
  { step: 8, text: 'BLACKOUT AVERTED — MARGIN RESTORED 08:00', level: 'crit' },
];

const FAILED = [239, 68, 68];
const AMBER = [217, 119, 6];

export default function JapanColdSnapCascade({ step = 0, shiftCard = false }) {
  const hudVisible = step >= 1;
  const cascadeIdx = step >= 2 ? Math.min(step - 2, CASCADE.length - 1) : -1;
  const active = cascadeIdx >= 0 ? CASCADE[cascadeIdx] : null;

  const [pulse, setPulse] = useState(() => Date.now());
  const pulseRef = useRef(null);
  const [viewState, setViewState] = useState(VIEWS.overview);
  const [viewport, setViewport] = useState(null);
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // Failed plants accumulate up to current step
  const failed = useMemo(() => {
    const s = new Set();
    if (cascadeIdx < 0) return s;
    for (let i = 0; i <= cascadeIdx; i++) CASCADE[i].trips.forEach((n) => s.add(n));
    return s;
  }, [cascadeIdx]);

  // Track the newest trips for stronger "just happened" pulse
  const newlyTripped = useMemo(() => new Set(active?.trips ?? []), [cascadeIdx]);

  // Continuous rAF pulse — runs the entire time HUD is visible
  useEffect(() => {
    if (!hudVisible) { cancelAnimationFrame(pulseRef.current); return; }
    const tick = () => { setPulse(Date.now()); pulseRef.current = requestAnimationFrame(tick); };
    pulseRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(pulseRef.current);
  }, [hudVisible]);

  // Camera fly-to on step change
  useEffect(() => {
    const target = cascadeIdx >= 0 ? active.view : VIEWS.overview;
    setViewState({
      ...target,
      transitionDuration: 900,
      transitionInterpolator: FLY_TO,
      transitionEasing: (t) => 1 - Math.pow(1 - t, 3),
    });
  }, [cascadeIdx]);

  // Observe container size for viewport projection
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => setContainerSize({ width: el.clientWidth, height: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Update projection viewport whenever viewState/size changes
  useEffect(() => {
    if (!containerSize.width || !containerSize.height) return;
    setViewport(new WebMercatorViewport({
      ...viewState,
      width: containerSize.width,
      height: containerSize.height,
    }));
  }, [viewState.longitude, viewState.latitude, viewState.zoom, viewState.pitch, viewState.bearing, containerSize.width, containerSize.height]);

  // Derived readouts (shift indices by +1 vs. old version — new step 0 is warning)
  const eastFailed = [...failed].filter((n) => (getPlant(n)?.position?.[0] ?? 0) >= FREQ_SEAM_LON).length;
  const totalFailedGW = [...failed].reduce((sum, n) => sum + parseGW(getPlant(n)?.capacity ?? '0'), 0);
  const freq50 = Math.max(49.2, 50.0 - eastFailed * 0.08 - (cascadeIdx >= 5 ? 0.15 : 0)) + Math.sin(pulse / 320) * 0.008;
  const freq60 = Math.max(59.5, 60.0 - (failed.size - eastFailed) * 0.05) + Math.sin(pulse / 280) * 0.006;
  const reserveMargin = cascadeIdx >= 6 ? 2.5 : cascadeIdx >= 4 ? 4.8 : cascadeIdx >= 3 ? 7.2 : cascadeIdx >= 1 ? 5.5 : cascadeIdx >= 0 ? 9.5 : 12.0;
  const emergency = reserveMargin < 3.0;

  // Pulse phase for continuous plant animation
  const pulsePhase = Math.abs(Math.sin(pulse / 300));

  // Layers
  const layers = useMemo(() => {
    const plants = ATLAS_FEATURES.plants;

    // Cascade path — connect marks of visited steps. Skip the epicenter mark
    // (index 0, offshore) so the line doesn't dangle from Onagawa into the sea
    // once the earthquake fades out.
    const cascadePath = cascadeIdx >= 2 ? [{
      path: CASCADE.slice(1, cascadeIdx + 1).map((c) => c.mark),
    }] : [];
    const pathLayer = new PathLayer({
      id: 'cascade-path', data: cascadePath, getPath: (d) => d.path,
      getColor: [239, 68, 68, 180], getWidth: 2, widthUnits: 'pixels',
      capRounded: true, jointRounded: true,
      getDashArray: [4, 3], extensions: [], // dashed effect approximated w/ short segments
    });

    // Seismic zone (only visible on the warning step)
    const seismicRing = active?.showEpicenter ? [new PolygonLayer({
      id: 'seismic-zone', data: [{ polygon: SEISMIC_ZONE }],
      getPolygon: (d) => d.polygon,
      getFillColor: [239, 68, 68, Math.round(20 + pulsePhase * 50)],
      getLineColor: [239, 68, 68, Math.round(140 + pulsePhase * 90)],
      getLineWidth: 2, lineWidthUnits: 'pixels', stroked: true,
      updateTriggers: { getFillColor: [pulse], getLineColor: [pulse] },
    })] : [];

    // Epicenter marker: outer pulsing ring + inner solid + warning glyph
    const epicenterLayers = active?.showEpicenter ? [
      new ScatterplotLayer({
        id: 'epicenter-outer', data: [{ position: EPICENTER }],
        getPosition: (d) => d.position,
        getRadius: 18 + pulsePhase * 10, radiusUnits: 'pixels',
        getFillColor: [239, 68, 68, Math.round(40 + pulsePhase * 60)],
        stroked: false,
        updateTriggers: { getRadius: [pulse], getFillColor: [pulse] },
      }),
      new ScatterplotLayer({
        id: 'epicenter-inner', data: [{ position: EPICENTER }],
        getPosition: (d) => d.position,
        getRadius: 8, radiusUnits: 'pixels',
        getFillColor: [239, 68, 68, 255],
        getLineColor: [255, 220, 220, 255], stroked: true, lineWidthMinPixels: 2,
      }),
      new TextLayer({
        id: 'epicenter-glyph', data: [{ position: EPICENTER }],
        getPosition: (d) => d.position, getText: () => '⚠',
        getSize: 22, sizeUnits: 'pixels',
        getColor: [255, 250, 205, 255],
        getPixelOffset: [0, -28],
        getTextAnchor: 'middle', getAlignmentBaseline: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
      }),
    ] : [];

    // Arctic front polygon + snowflake glyph
    const arcticLayers = active?.showFront ? [
      new PolygonLayer({
        id: 'arctic-front', data: [{ polygon: ARCTIC_FRONT }],
        getPolygon: (d) => d.polygon,
        getFillColor: [147, 197, 253, Math.round(45 + pulsePhase * 40)],
        getLineColor: [191, 219, 254, 200], getLineWidth: 2,
        lineWidthUnits: 'pixels', stroked: true,
        updateTriggers: { getFillColor: [pulse] },
      }),
      new TextLayer({
        id: 'arctic-glyph', data: [{ position: [142.0, 44.2] }],
        getPosition: (d) => d.position, getText: () => '❄',
        getSize: 40, sizeUnits: 'pixels',
        getColor: [219, 234, 254, 255],
        getTextAnchor: 'middle', getAlignmentBaseline: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
      }),
      new TextLayer({
        id: 'arctic-label', data: [{ position: [141.8, 43.6] }],
        getPosition: (d) => d.position, getText: () => 'ARCTIC FRONT · −3°C',
        getSize: 12, sizeUnits: 'pixels',
        getColor: [191, 219, 254, 235],
        getTextAnchor: 'middle', getAlignmentBaseline: 'center',
        fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
      }),
    ] : [];

    const base = new ScatterplotLayer({
      id: 'cascade-plants', data: plants, getPosition: (d) => d.position,
      getRadius: (d) => {
        const b = 6 + 5 * Math.sqrt(parseGW(d.capacity));
        if (newlyTripped.has(d.name)) return b * (1 + 0.5 * pulsePhase);
        if (failed.has(d.name))       return b * (1 + 0.18 * pulsePhase);
        return b;
      },
      radiusUnits: 'pixels',
      getFillColor: (d) => {
        if (newlyTripped.has(d.name)) {
          const t = pulsePhase;
          return [
            AMBER[0] + (FAILED[0] - AMBER[0]) * t,
            AMBER[1] + (FAILED[1] - AMBER[1]) * t,
            AMBER[2] + (FAILED[2] - AMBER[2]) * t,
            230,
          ];
        }
        if (failed.has(d.name)) return [...FAILED, 200];
        const c = PLANT_COLORS[d.fuel] ?? [148, 163, 184, 200];
        return [c[0], c[1], c[2], 200];
      },
      getLineColor: (d) => failed.has(d.name) || newlyTripped.has(d.name) ? [255, 220, 220, 255] : [237, 233, 254, 220],
      stroked: true, lineWidthMinPixels: 1.5, pickable: true,
      updateTriggers: { getRadius: [failed, newlyTripped, pulse], getFillColor: [failed, newlyTripped, pulse] },
    });
    const icons = new TextLayer({
      id: 'cascade-icons', data: plants, getPosition: (d) => d.position,
      getText: (d) => FUEL_ICONS[d.fuel] ?? '', getSize: 11, sizeUnits: 'pixels',
      getColor: [11, 18, 32, 255], getTextAnchor: 'middle', getAlignmentBaseline: 'center',
      fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      fontWeight: 700, characterSet: 'auto', billboard: true,
    });
    const xMarks = new TextLayer({
      id: 'cascade-x', data: plants.filter((p) => failed.has(p.name) && !newlyTripped.has(p.name)),
      getPosition: (d) => d.position, getText: () => '✕', getSize: 20,
      getColor: [239, 68, 68, 255], getTextAnchor: 'middle', getAlignmentBaseline: 'center',
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
    });
    // Active event pin (small ring at active.mark for non-epicenter/non-front steps)
    const activePin = active && !active.showEpicenter && !active.showFront ? [
      new ScatterplotLayer({
        id: 'active-mark', data: [{ position: active.mark }],
        getPosition: (d) => d.position,
        getRadius: 10 + pulsePhase * 6, radiusUnits: 'pixels',
        getFillColor: active.severity === 'crit'
          ? [239, 68, 68, Math.round(90 + pulsePhase * 90)]
          : [245, 158, 11, Math.round(90 + pulsePhase * 90)],
        stroked: true, lineWidthMinPixels: 1.5,
        getLineColor: active.severity === 'crit' ? [239, 68, 68, 220] : [245, 158, 11, 220],
        updateTriggers: { getRadius: [pulse], getFillColor: [pulse] },
      }),
    ] : [];
    return [pathLayer, ...seismicRing, ...arcticLayers, base, icons, xMarks, ...epicenterLayers, ...activePin];
  }, [failed, newlyTripped, pulse, cascadeIdx, active]);

  // Project active event mark → screen coords for leader line
  const activeScreen = useMemo(() => {
    if (!viewport || !active) return null;
    const [x, y] = viewport.project(active.mark);
    return { x, y };
  }, [viewport, active]);

  const dangerColor = emergency ? COLORS.crit : COLORS.cyan;
  const borderClr = emergency ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  const panelBase = {
    background: 'rgba(5, 8, 16, 0.92)',
    border: `1px solid ${borderClr}`,
    boxShadow: `0 0 20px ${dangerColor}18, inset 0 0 15px ${dangerColor}06`,
    backdropFilter: 'blur(12px)',
    transition: 'border-color 0.6s, box-shadow 0.6s',
    position: 'relative',
    borderRadius: 3,
  };

  const recentLogs = LOG_MSGS.filter((m) => cascadeIdx >= 0 && m.step <= cascadeIdx).slice(-5);

  // Leader-line geometry: from active event pin on map to top-center of dramatic card
  const cardCenterX = shiftCard ? containerSize.width * 0.3 + 170 : containerSize.width * 0.5 + 195;
  const cardTopY = containerSize.height - (emergency ? 140 : 60) - 88; // card height ~88px
  const showLeader = hudVisible && activeScreen && active
    && activeScreen.x >= 0 && activeScreen.x <= containerSize.width
    && activeScreen.y >= 0 && activeScreen.y <= containerSize.height;

  return (
    <div ref={containerRef} data-testid="japan-cold-snap-cascade" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#020408' }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', inset: 0 }}
        getTooltip={({ object }) => object?.name ? { text: `${object.name}\n${object.fuel} · ${object.capacity}` } : null}
      >
        <MapGL mapStyle={MAP_STYLE} style={{ width: '100%', height: '100%' }} />
      </DeckGL>

      {/* Leader line from active mark to card */}
      {showLeader && (
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 8, width: '100%', height: '100%' }}>
          <defs>
            <linearGradient id="leader-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={active.severity === 'crit' ? '#ef4444' : '#f59e0b'} stopOpacity="0.85" />
              <stop offset="100%" stopColor={active.severity === 'crit' ? '#ef4444' : '#f59e0b'} stopOpacity="0.25" />
            </linearGradient>
          </defs>
          <path
            d={`M ${activeScreen.x} ${activeScreen.y} L ${activeScreen.x} ${(activeScreen.y + cardTopY) / 2} L ${cardCenterX} ${(activeScreen.y + cardTopY) / 2} L ${cardCenterX} ${cardTopY}`}
            fill="none" stroke="url(#leader-grad)" strokeWidth="1.5" strokeDasharray="4 4"
            style={{ opacity: 0.4 + pulsePhase * 0.4 }}
          />
          <circle cx={activeScreen.x} cy={activeScreen.y} r="3"
            fill={active.severity === 'crit' ? '#ef4444' : '#f59e0b'} />
        </svg>
      )}

      {/* Scanline */}
      {hudVisible && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      )}
      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
        boxShadow: emergency ? 'inset 0 0 160px 60px rgba(239,68,68,0.14)' : 'inset 0 0 120px 40px rgba(2,4,8,0.7)' }} />

      {/* ── Left: Timeline Panel ── */}
      {hudVisible && (
        <div style={{ ...panelBase, position: 'absolute', top: 12, left: 12, width: 380, maxHeight: 'calc(100% - 24px)',
          zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${borderClr}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: emergency ? COLORS.crit : COLORS.cyan,
              boxShadow: `0 0 10px ${emergency ? COLORS.crit : COLORS.cyan}` }} />
            <span style={{ ...T.label, fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, color: COLORS.dim, letterSpacing: '0.12em' }}>OCCTO GRID MONITOR</span>
            <span style={{ marginLeft: 'auto', ...T.micro, color: `${COLORS.mute}cc` }}>MAR 2022</span>
          </div>
          <div style={{ flex: 1, overflowY: 'hidden', padding: '10px 16px' }}>
            {CASCADE.map((s, i) => {
              const isActive = cascadeIdx >= i;
              const isCurrent = cascadeIdx === i;
              return (
                <div key={i} style={{ marginBottom: 8,
                  opacity: isActive ? 1 : 0.25,
                  transition: 'opacity 0.4s, transform 0.4s',
                  borderLeft: isCurrent ? `2px solid ${s.severity === 'crit' ? COLORS.crit : COLORS.warn}` : '2px solid transparent',
                  paddingLeft: isCurrent ? 10 : 12,
                  transform: `translateX(${isActive ? 0 : -12}px)` }}>
                  <div style={{ ...T.label,
                    color: isActive ? (isCurrent ? COLORS.ink : `${COLORS.ink}bb`) : COLORS.muteFaint,
                    fontWeight: isCurrent ? 600 : 400, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ ...T.eyebrow, fontWeight: 700,
                      color: isActive ? (s.severity === 'crit' ? COLORS.crit : COLORS.warn) : `${COLORS.mute}30`, flexShrink: 0 }}>{s.ts}</span>
                    <span>{s.label}</span>
                  </div>
                  <div style={{ ...T.micro, marginTop: 2,
                    color: isActive ? COLORS.dim : `${COLORS.mute}20` }}>{s.detail}</div>
                </div>
              );
            })}
          </div>
          {/* Terminal log */}
          <div style={{ borderTop: `1px solid ${borderClr}`, padding: '8px 14px', minHeight: 90, maxHeight: 130, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ ...T.eyebrow, color: `${COLORS.mute}80`, letterSpacing: '0.1em', marginBottom: 4 }}>SYSTEM LOG</div>
            {recentLogs.length === 0 ? (
              <div style={{ ...T.micro, color: `${COLORS.cyan}cc` }}>&gt; awaiting events…</div>
            ) : recentLogs.map((m, i) => (
              <div key={`${m.step}-${m.text}`} style={{ ...T.micro,
                opacity: i === recentLogs.length - 1 ? 1 : 0.55,
                color: m.level === 'crit' ? COLORS.crit : COLORS.warn, marginBottom: 2, lineHeight: 1.4 }}>
                &gt; {m.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Right: Dual-frequency + reserve margin ── */}
      {hudVisible && (
        <div style={{ ...panelBase, position: 'absolute', top: 12, right: 12, zIndex: 10, padding: '14px 20px', minWidth: 220 }}>
          <div style={{ ...T.eyebrow, color: `${COLORS.mute}cc`, letterSpacing: '0.1em', marginBottom: 6 }}>FREQUENCY · EAST 50 Hz</div>
          <div style={{ ...T.metric, fontSize: 28,
            color: freq50 < 49.7 ? COLORS.crit : freq50 < 49.9 ? COLORS.warn : COLORS.cyan,
            textShadow: `0 0 20px ${freq50 < 49.7 ? '#ef444440' : '#22d3ee40'}` }}>
            {freq50.toFixed(3)} <span style={{ fontSize: 14 }}>Hz</span>
          </div>

          <div style={{ marginTop: 10, ...T.eyebrow, color: `${COLORS.mute}cc`, letterSpacing: '0.1em', marginBottom: 6 }}>FREQUENCY · WEST 60 Hz</div>
          <div style={{ ...T.metric, fontSize: 22, fontWeight: 700,
            color: freq60 < 59.85 ? COLORS.warn : COLORS.gold }}>
            {freq60.toFixed(3)} <span style={{ fontSize: 12 }}>Hz</span>
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${borderClr}` }}>
            <div style={{ ...T.eyebrow, color: `${COLORS.mute}80`, letterSpacing: '0.1em', marginBottom: 4 }}>RESERVE MARGIN</div>
            <div style={{ ...T.metric, color: emergency ? COLORS.crit : COLORS.cyan,
              textShadow: emergency ? '0 0 18px #ef444450' : 'none',
              opacity: emergency ? Math.sin(pulse / 300) * 0.15 + 0.85 : 1 }}>
              {reserveMargin.toFixed(1)}<span style={{ fontSize: 14, marginLeft: 3 }}>%</span>
            </div>
            <div style={{ ...T.micro, marginTop: 2,
              color: emergency ? COLORS.crit : COLORS.dim, fontWeight: 600 }}>
              {emergency ? '⚠ EMERGENCY · <3% THRESHOLD' : 'above safety threshold'}
            </div>
            <div style={{ marginTop: 6, height: 4, background: 'rgba(239,68,68,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: emergency ? COLORS.crit : COLORS.cyan,
                width: `${Math.max(4, Math.min(100, reserveMargin * 8))}%`, transition: 'width 0.6s, background 0.4s' }} />
            </div>
          </div>

          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${borderClr}` }}>
            <div style={{ ...T.eyebrow, color: `${COLORS.mute}80`, letterSpacing: '0.1em', marginBottom: 3 }}>CAPACITY OFFLINE</div>
            <div style={{ ...T.h3, fontFamily: 'var(--font-mono)', color: COLORS.crit }}>
              {totalFailedGW.toFixed(1)} <span style={{ fontSize: 11, color: '#ef4444aa' }}>GW</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom: compact step dots + legend ── */}
      {hudVisible && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {CASCADE.map((s, i) => {
              const isActive = cascadeIdx >= i;
              const isCurrent = cascadeIdx === i;
              const color = s.severity === 'crit' ? COLORS.crit : COLORS.warn;
              return (
                <div key={i} style={{ width: isCurrent ? 32 : isActive ? 22 : 14, height: 4, borderRadius: 2,
                  background: isActive ? color : 'rgba(100,116,139,0.25)',
                  transition: 'all 0.4s', boxShadow: isActive ? `0 0 8px ${color}80` : 'none' }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {[['50 Hz east', FREQUENCY_COLORS['50 Hz']], ['60 Hz west', FREQUENCY_COLORS['60 Hz']]].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: `rgb(${c[0]},${c[1]},${c[2]})` }} />
                <span style={{ ...T.eyebrow, color: COLORS.dim, letterSpacing: '0.08em' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Dramatic event card ── */}
      {hudVisible && active && (
        <div style={{ position: 'absolute', bottom: emergency ? 140 : 60,
          left: shiftCard ? '30%' : 'calc(50% + 195px)',
          transform: shiftCard ? 'none' : 'translateX(-50%)',
          zIndex: 10, textAlign: shiftCard ? 'left' : 'center', pointerEvents: 'none',
          width: shiftCard ? 340 : 540, padding: '14px 26px',
          transition: 'left 0.45s cubic-bezier(0.4,0,0.2,1), width 0.45s cubic-bezier(0.4,0,0.2,1), transform 0.45s cubic-bezier(0.4,0,0.2,1)',
          background: 'rgba(5, 8, 16, 0.88)',
          border: `1px solid ${active.severity === 'crit' ? 'rgba(239,68,68,0.55)' : 'rgba(245,158,11,0.5)'}`,
          borderRadius: 4, backdropFilter: 'blur(14px)',
          boxShadow: `0 0 40px ${active.severity === 'crit' ? 'rgba(239,68,68,0.18)' : 'rgba(245,158,11,0.15)'}, inset 0 0 30px rgba(0,0,0,0.4)` }}>
          <div style={{ ...T.eyebrow, fontSize: 11, fontWeight: 700,
            color: active.severity === 'crit' ? COLORS.crit : COLORS.warn, marginBottom: 6 }}>
            {active.ts}
          </div>
          <div style={{ ...T.h2,
            color: emergency && cascadeIdx >= 6 ? COLORS.crit : COLORS.ink, lineHeight: 1.2 }}>
            {active.label}
          </div>
          <div style={{ ...T.body, color: COLORS.dim, marginTop: 8, letterSpacing: '0.04em' }}>
            {active.detail}
          </div>
        </div>
      )}

      {/* Warning banner */}
      {hudVisible && emergency && (
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
          padding: '12px 32px', borderRadius: 4, background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.5)', backdropFilter: 'blur(10px)',
          boxShadow: '0 0 40px rgba(239,68,68,0.18)' }}>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: COLORS.crit,
            textShadow: '0 0 15px rgba(239,68,68,0.5)',
            opacity: Math.sin(pulse / 300) * 0.2 + 0.8, letterSpacing: '0.08em' }}>
            {'⚠'} SUPPLY EMERGENCY · RESERVE {reserveMargin.toFixed(1)}% {'⚠'}
          </span>
        </div>
      )}
    </div>
  );
}
