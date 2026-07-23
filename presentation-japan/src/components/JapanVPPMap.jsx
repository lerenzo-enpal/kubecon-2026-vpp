import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const FLY_TO = new FlyToInterpolator();

const DARK_MAP_STYLE = {
  version: 8,
  sources: { 'carto-dark': { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } },
  layers: [{ id: 'base', type: 'raster', source: 'carto-dark', paint: { 'raster-opacity': 0.7 } }],
};

// ── Camera presets ──────────────────────────────────────────
const VIEWS = {
  overview: { longitude: 133.5, latitude: 33.5, zoom: 5.8, pitch: 35, bearing: -5 },
  kansai:   { longitude: 135.5, latitude: 34.7, zoom: 8.0, pitch: 40, bearing: -8 },
  kyushu:   { longitude: 130.4, latitude: 33.4, zoom: 7.5, pitch: 42, bearing: 5  },
  wide:     { longitude: 132.0, latitude: 33.8, zoom: 6.5, pitch: 38, bearing: -3 },
};

// ── VPP battery aggregation sites ──────────────────────────
// Kansai residential + EV battery clusters, Kyushu HEMS clusters
const NODES = [
  // Kansai region — Shizen Connect EV VPP sites
  { id: 'osaka-n',    pos: [135.50, 34.82], name: 'Osaka North',     type: 'ev',   mw: 45,  kw: 45000 },
  { id: 'osaka-s',    pos: [135.52, 34.60], name: 'Osaka South',     type: 'ev',   mw: 38,  kw: 38000 },
  { id: 'kobe',       pos: [135.18, 34.69], name: 'Kobe',            type: 'hems', mw: 28,  kw: 28000 },
  { id: 'kyoto',      pos: [135.76, 35.01], name: 'Kyoto',           type: 'hems', mw: 22,  kw: 22000 },
  { id: 'nara',       pos: [135.83, 34.68], name: 'Nara',            type: 'hems', mw: 18,  kw: 18000 },
  // Kyushu region — HEMS residential battery programs
  { id: 'fukuoka',    pos: [130.41, 33.60], name: 'Fukuoka',         type: 'hems', mw: 62,  kw: 62000 },
  { id: 'kitakyushu', pos: [130.88, 33.88], name: 'Kitakyushu',      type: 'hems', mw: 41,  kw: 41000 },
  { id: 'saga',       pos: [130.30, 33.24], name: 'Saga',            type: 'hems', mw: 25,  kw: 25000 },
  { id: 'kumamoto',   pos: [130.71, 32.80], name: 'Kumamoto',        type: 'hems', mw: 35,  kw: 35000 },
  { id: 'kagoshima',  pos: [130.56, 31.59], name: 'Kagoshima',       type: 'hems', mw: 20,  kw: 20000 },
  // Substation interconnects
  { id: 'sub-kansai', pos: [135.40, 34.50], name: 'Kansai Control',  type: 'sub',  mw: 0 },
  { id: 'sub-kyushu', pos: [130.60, 33.20], name: 'Kyushu Control',  type: 'sub',  mw: 0 },
];

// ── Transmission corridors ──────────────────────────────────
const CORRIDORS = [
  ['osaka-n',   'sub-kansai'],
  ['osaka-s',   'sub-kansai'],
  ['kobe',      'sub-kansai'],
  ['kyoto',     'sub-kansai'],
  ['nara',      'sub-kansai'],
  ['fukuoka',   'sub-kyushu'],
  ['kitakyushu','sub-kyushu'],
  ['saga',      'sub-kyushu'],
  ['kumamoto',  'sub-kyushu'],
  ['kagoshima', 'sub-kyushu'],
];

// ── VPP activation cascade steps ───────────────────────────
const STEPS = [
  {
    activeIds: [],
    label: 'SIMULATED DISPATCH — solar surplus',
    detail: 'Illustrative excess-solar event',
    freq: 50.2,
    mwDispatched: 0,
    batteriesOnline: 0,
    view: VIEWS.overview,
  },
  {
    activeIds: ['fukuoka', 'kitakyushu'],
    label: 'SIMULATED DISPATCH — flexible assets absorb excess',
    detail: 'Illustrative charging response',
    freq: 50.1,
    mwDispatched: 103,
    batteriesOnline: 2850,
    view: VIEWS.kyushu,
  },
  {
    activeIds: ['fukuoka', 'kitakyushu', 'saga', 'kumamoto', 'kagoshima'],
    label: 'SIMULATED DISPATCH — regional fleet online',
    detail: 'Illustrative avoided-curtailment response',
    freq: 50.0,
    mwDispatched: 183,
    batteriesOnline: 7400,
    view: VIEWS.kyushu,
  },
  {
    activeIds: ['fukuoka', 'kitakyushu', 'saga', 'kumamoto', 'kagoshima', 'osaka-n', 'osaka-s'],
    label: 'SIMULATED DISPATCH — evening peak response',
    detail: 'Illustrative cross-region coordination',
    freq: 49.92,
    mwDispatched: 266,
    batteriesOnline: 11200,
    view: VIEWS.wide,
  },
  {
    activeIds: NODES.filter(n => n.type !== 'sub').map(n => n.id),
    label: 'SIMULATED DISPATCH — grid balanced',
    detail: 'Illustrative portfolio coordination',
    freq: 50.0,
    mwDispatched: 334,
    batteriesOnline: 14600,
    view: VIEWS.wide,
  },
];

const NODE_MAP = new Map(NODES.map(n => [n.id, n]));

// ── Colors ──────────────────────────────────────────────────
const COLOR_STANDBY  = [148, 163, 184, 160];
const COLOR_ACTIVE   = [16, 185, 129, 230];
const COLOR_CYAN     = [34, 211, 238, 200];
const COLOR_SUB      = [57, 57, 216, 200];

export function JapanVPPMap({ height = 480 }) {
  const [step, setStep] = useState(0);
  const [viewState, setViewState] = useState(VIEWS.overview);
  const slideCtx = useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;
  const prevStepRef = useRef(-1);

  // Handle keyboard-driven step advancement
  useEffect(() => {
    if (!isActive) return;
    const handle = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        setStep(s => Math.min(s + 1, STEPS.length - 1));
      }
      if (e.key === 'ArrowLeft') {
        setStep(s => Math.max(s - 1, 0));
      }
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isActive]);

  // Camera fly-to on step change
  useEffect(() => {
    if (prevStepRef.current === step) return;
    prevStepRef.current = step;
    const target = STEPS[step].view;
    setViewState(vs => ({
      ...vs,
      ...target,
      transitionDuration: 3500,
      transitionInterpolator: FLY_TO,
    }));
  }, [step]);

  const currentStep = STEPS[step];
  const activeSet = new Set(currentStep.activeIds);

  const layers = useMemo(() => {
    const corridorData = CORRIDORS.map(([a, b]) => {
      const na = NODE_MAP.get(a), nb = NODE_MAP.get(b);
      if (!na || !nb) return null;
      const aActive = activeSet.has(a) || activeSet.has(b);
      return { sourcePosition: na.pos, targetPosition: nb.pos, active: aActive };
    }).filter(Boolean);

    return [
      new LineLayer({
        id: 'corridors',
        data: corridorData,
        getSourcePosition: d => d.sourcePosition,
        getTargetPosition: d => d.targetPosition,
        getColor: d => d.active ? [...COLOR_ACTIVE.slice(0, 3), 180] : [57, 57, 216, 80],
        getWidth: d => d.active ? 2.5 : 1,
        widthUnits: 'pixels',
        updateTriggers: { getColor: step, getWidth: step },
      }),
      new ScatterplotLayer({
        id: 'nodes',
        data: NODES,
        getPosition: d => d.pos,
        getRadius: d => d.type === 'sub' ? 12000 : 9000,
        getFillColor: d => {
          if (d.type === 'sub') return COLOR_SUB;
          return activeSet.has(d.id) ? COLOR_ACTIVE : COLOR_STANDBY;
        },
        getLineColor: d => activeSet.has(d.id) ? [...COLOR_ACTIVE.slice(0,3), 255] : COLOR_CYAN,
        lineWidthMinPixels: 1.5,
        stroked: true,
        filled: true,
        radiusUnits: 'meters',
        updateTriggers: { getFillColor: step, getLineColor: step },
      }),
      new TextLayer({
        id: 'node-labels',
        data: NODES.filter(n => n.type !== 'sub'),
        getPosition: d => d.pos,
        getText: d => `${d.name}${d.mw > 0 ? `\n${d.mw} MW` : ''}`,
        getSize: 12,
        getColor: d => activeSet.has(d.id) ? [16, 185, 129, 255] : [148, 163, 184, 200],
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '600',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'bottom',
        getPixelOffset: [0, -16],
        characterSet: 'auto',
        updateTriggers: { getColor: step },
      }),
    ];
  }, [step]);

  const freqColor = currentStep.freq > 50.1 ? '#FFA35F' : currentStep.freq < 49.95 ? '#ef4444' : '#10b981';

  return (
    <div data-testid="japan-vpp-map" style={{ position: 'relative', width: '100%', height }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', inset: 0 }}
      >
        <MapGL mapStyle={DARK_MAP_STYLE} />
      </DeckGL>

      {/* Step label overlay */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, right: 200,
        background: 'rgba(6,10,26,0.88)', border: '1px solid rgba(57,57,216,0.4)',
        borderRadius: 6, padding: '12px 16px',
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{ color: '#3939D8', fontSize: 11, marginBottom: 4, letterSpacing: '0.1em' }}>
          STEP {step + 1} / {STEPS.length}
        </div>
        <div style={{ color: '#f1f5f9', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          {currentStep.label}
        </div>
        <div style={{ color: '#64748b', fontSize: 12 }}>{currentStep.detail}</div>
      </div>

      {/* HUD data panel */}
      <div style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(6,10,26,0.88)', border: '1px solid rgba(57,57,216,0.4)',
        borderRadius: 6, padding: '12px 16px', minWidth: 160,
        fontFamily: 'JetBrains Mono, monospace',
      }}>
        <div style={{ color: '#3939D8', fontSize: 10, letterSpacing: '0.1em', marginBottom: 8 }}>
          ERAB DISPATCH
        </div>
        <HudRow label="FREQ" value={`${currentStep.freq.toFixed(2)} Hz`} color={freqColor} />
        <HudRow label="MW"   value={`${currentStep.mwDispatched.toLocaleString()}`} color="#22d3ee" />
        <HudRow label="HOMES" value={currentStep.batteriesOnline.toLocaleString()} color="#10b981" />
        <div style={{ marginTop: 8, color: '#64748b', fontSize: 10 }}>
          ← / → to advance
        </div>
      </div>
    </div>
  );
}

function HudRow({ label, value, color }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, gap: 16 }}>
      <span style={{ color: '#64748b', fontSize: 11 }}>{label}</span>
      <span style={{ color, fontSize: 13, fontWeight: 700 }}>{value}</span>
    </div>
  );
}
