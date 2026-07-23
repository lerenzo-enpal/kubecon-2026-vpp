import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { LineLayer, ScatterplotLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAIN_TALK_EVIDENCE } from '../data/mainTalkEvidence.mjs';
import { MainTalkSourceFooter } from './MainTalkSourceFooter.jsx';

const FLY_TO = new FlyToInterpolator();
const DARK_MAP_STYLE = {
  version: 8,
  sources: { carto: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } },
  layers: [{ id: 'base', type: 'raster', source: 'carto', paint: { 'raster-opacity': 0.72 } }],
};
const TOKYO_NODES = [
  { id: 'home-a', position: [139.68, 35.69], kind: 'flex' },
  { id: 'home-b', position: [139.73, 35.71], kind: 'flex' },
  { id: 'home-c', position: [139.77, 35.66], kind: 'flex' },
  { id: 'substation', position: [139.72, 35.65], kind: 'substation' },
  { id: 'plant', position: [140.05, 35.57], kind: 'plant' },
];
const NODE_MAP = new Map(TOKYO_NODES.map(node => [node.id, node]));
const INCIDENT_STATES = [
  { label: '16 MAR · GENERATION LOST', status: 'EARTHQUAKE / UNITS OFFLINE', detail: 'Generation capacity is reduced after the Fukushima earthquake.', active: ['plant'], view: { longitude: 139.93, latitude: 35.63, zoom: 9.3, pitch: 38, bearing: -12 } },
  { label: '22 MAR · COLD FRONT', status: 'EVENING DEMAND RISES', detail: 'Cold weather lifts heating demand into the evening peak.', active: ['plant'], view: { longitude: 139.72, latitude: 35.67, zoom: 10, pitch: 42, bearing: -12 } },
  { label: '16:00 · WARNING ISSUED', status: 'TIGHT RESERVES', detail: 'A public supply-demand warning makes conservation operational.', active: ['plant'], view: { longitude: 139.74, latitude: 35.68, zoom: 10.4, pitch: 46, bearing: -12 } },
  { label: '18:00–20:00 · HOLD THE LINE', status: 'ILLUSTRATIVE FLEXIBILITY', detail: 'Counterfactual VPP capacity: flexible demand and storage could help through the peak.', active: ['home-a', 'home-b', 'home-c'], view: { longitude: 139.72, latitude: 35.67, zoom: 9.3, pitch: 38, bearing: -12 } },
];
const GRAPH_LINKS = [['home-a', 'substation'], ['home-b', 'substation'], ['home-c', 'substation'], ['plant', 'substation']].map(([from, to]) => ({ sourcePosition: NODE_MAP.get(from).position, targetPosition: NODE_MAP.get(to).position }));

function Trace({ step }) {
  const paths = ['M0 76 H88 L126 40 H320', 'M0 76 H72 L130 24 H320', 'M0 76 H62 L130 14 H320', 'M0 76 H62 L130 14 C210 14 232 34 320 34'];
  return <svg role="img" aria-label="Illustrative system pressure trace" viewBox="0 0 320 108" style={{ width: '100%', height: 110 }}><path d="M0 76 H320" fill="none" stroke="var(--color-dim)" strokeDasharray="5 6" /><path d={paths[step]} fill="none" stroke={step < 3 ? 'var(--color-washi-alert)' : 'var(--color-success)'} strokeWidth="5" strokeLinecap="round" /></svg>;
}

export function TokyoFrequencyResponseCaseStudy({ mode = 'incident', step = 0 }) {
  const slideContext = useContext(SlideContext);
  const isActive = slideContext?.isSlideActive ?? true;
  const sceneIndex = Math.min(Math.max(Number.isInteger(step) ? step : 0, 0), INCIDENT_STATES.length - 1);
  const scene = INCIDENT_STATES[sceneIndex];
  const [viewState, setViewState] = useState(INCIDENT_STATES[0].view);

  useEffect(() => {
    if (!isActive || mode !== 'incident') return;
    setViewState(previous => ({ ...previous, ...scene.view, transitionDuration: 900, transitionInterpolator: FLY_TO }));
  }, [isActive, mode, scene]);

  const layers = useMemo(() => {
    const active = new Set(mode === 'graph' ? ['home-a', 'home-b', 'home-c'] : scene.active);
    return [
      ...(mode === 'graph' ? [new LineLayer({ id: 'tokyo-graph-links', data: GRAPH_LINKS, getSourcePosition: d => d.sourcePosition, getTargetPosition: d => d.targetPosition, getColor: [34, 211, 238, 185], getWidth: 2, widthUnits: 'pixels' })] : []),
      new ScatterplotLayer({ id: 'tokyo-event-nodes', data: TOKYO_NODES, getPosition: d => d.position, getRadius: d => d.kind === 'substation' ? 2600 : 1450, radiusUnits: 'meters', getFillColor: d => d.kind === 'substation' ? [167, 139, 250, 230] : d.kind === 'plant' && active.has(d.id) ? [248, 113, 113, 235] : active.has(d.id) ? [16, 185, 129, 235] : [148, 163, 184, 175], getLineColor: d => active.has(d.id) ? [34, 211, 238, 255] : [148, 163, 184, 220], lineWidthMinPixels: 1.5, stroked: true, filled: true, updateTriggers: { getFillColor: `${mode}-${sceneIndex}` } }),
    ];
  }, [mode, scene.active, sceneIndex]);

  const graph = mode === 'graph';
  return <section data-testid={graph ? 'tokyo-city-graph' : 'tokyo-frequency-response-case'} aria-label={graph ? 'Tokyo city graph control loop' : 'Tokyo March 2022 supply-demand event'} style={{ position: 'relative', height: '100%', minHeight: 610, overflow: 'hidden', background: 'var(--color-bg)', color: 'var(--color-heading)' }}>
    <style>{'@keyframes graphPulse { 0%, 100% { opacity: .36; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-7px); } }'}</style>
    <DeckGL viewState={viewState} onViewStateChange={({ viewState: next }) => setViewState(next)} controller layers={layers} style={{ position: 'absolute', inset: 0 }}><MapGL mapStyle={DARK_MAP_STYLE} /></DeckGL>
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, transparent 34%, color-mix(in srgb, var(--color-bg) 76%, transparent) 100%)' }} />
    {graph ? <GraphHud isActive={isActive} /> : <IncidentHud scene={scene} step={sceneIndex} />}
    <MainTalkSourceFooter evidence={MAIN_TALK_EVIDENCE.tokyo2022Tightness} compact />
  </section>;
}

function IncidentHud({ scene, step }) {
  return <div style={{ position: 'absolute', top: 34, left: 44, width: 500, pointerEvents: 'none' }}>
    <div style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)', fontSize: 15, letterSpacing: '0.16em' }}>TOKYO · MARCH 2022 · DOCUMENTED EVENT</div>
    <div style={{ marginTop: 12, color: step < 3 ? 'var(--color-washi-alert)' : 'var(--color-success)', fontFamily: 'var(--font-mono)', fontSize: 42, fontWeight: 700 }}>{scene.status}</div>
    <div style={{ marginTop: 10, color: 'var(--color-heading)', fontFamily: 'var(--font-heading)', fontSize: 34, lineHeight: 1.08 }}>{scene.label}</div>
    <div style={{ marginTop: 10, color: 'var(--color-dim)', fontFamily: 'var(--font-body)', fontSize: 19, lineHeight: 1.3 }}>{scene.detail}</div>
    <div style={{ marginTop: 18, padding: '10px 14px', border: '1px solid color-mix(in srgb, var(--color-secondary) 45%, transparent)', background: 'color-mix(in srgb, var(--color-bg) 84%, transparent)' }}><Trace step={step} /></div>
  </div>;
}

function GraphHud({ isActive }) {
  const chip = (label, delay, testId) => <div data-testid={testId} style={{ padding: '10px 14px', border: '1px solid color-mix(in srgb, var(--color-primary) 55%, transparent)', background: 'color-mix(in srgb, var(--color-bg) 84%, transparent)', color: 'var(--color-primary)', fontFamily: 'var(--font-mono)', fontSize: 14, letterSpacing: '0.1em', animation: `graphPulse 2.4s ${delay}s ease-in-out infinite`, animationPlayState: isActive ? 'running' : 'paused' }}>{label}</div>;
  return <div style={{ position: 'absolute', inset: '34px 44px auto', pointerEvents: 'none' }}>
    <div style={{ color: 'var(--color-secondary)', fontFamily: 'var(--font-mono)', fontSize: 15, letterSpacing: '0.16em' }}>RECOVERED STATE · TOKYO CONTROL LOOP</div>
    <div style={{ marginTop: 12, color: 'var(--color-heading)', fontFamily: 'var(--font-heading)', fontSize: 42 }}>A city is a graph problem</div>
    <div style={{ display: 'flex', gap: 14, marginTop: 26 }}>{chip('TELEMETRY', 0, 'tokyo-city-graph-pulse')}{chip('DISPATCH INTENT', .5)}{chip('ACKNOWLEDGEMENT', 1)}</div>
  </div>;
}
