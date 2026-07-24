import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { PathLayer, PolygonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ATLAS_FEATURES, ATLAS_LAYER_IDS } from '../data/japanGridAtlasData.mjs';
import { resolveAtlasLayers } from './japanGridAtlasState.mjs';

const FLY_TO = new FlyToInterpolator();
const VIEW = { longitude: 136.7, latitude: 36.3, zoom: 4.65, pitch: 25, bearing: 5 };
const SEAM_VIEW = { longitude: 137.5, latitude: 35.8, zoom: 5.7, pitch: 32, bearing: -5 };
const ICONS = { mix: '◒', plants: '⚡', areas: '▧', transmission: '╱', demand: '◉', jepx: '¥' };
const LABELS = { mix: 'Energy mix', plants: 'Power plants', areas: 'Provider areas', transmission: 'Transmission', demand: 'Live demand / supply', jepx: 'Live JEPX price' };
const MAP_STYLE = { version: 8, sources: { base: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } }, layers: [{ id: 'base', type: 'raster', source: 'base', paint: { 'raster-opacity': 0.72 } }] };

export function JapanGridAtlas({ height = 580, step = 0, preset = () => ({}), liveData = {}, variant = 'dark' }) {
  const [viewState, setViewState] = useState(VIEW);
  const [overrides, setOverrides] = useState({});
  const slideContext = useContext(SlideContext);
  const active = useMemo(() => resolveAtlasLayers({ preset: preset(step), overrides }), [preset, step, overrides]);
  useEffect(() => { setOverrides({}); }, [step]);
  useEffect(() => {
    if (!(slideContext?.isSlideActive ?? true)) return;
    const target = active.transmission ? SEAM_VIEW : VIEW;
    setViewState((current) => ({ ...current, ...target, transitionDuration: 1200, transitionInterpolator: FLY_TO }));
  }, [active.transmission, slideContext?.isSlideActive]);
  const toggle = (id) => setOverrides((current) => ({ ...current, [id]: !active[id] }));
  const layers = useMemo(() => [
    active.areas && new PolygonLayer({ id: 'atlas-areas', data: ATLAS_FEATURES.areas, getPolygon: (d) => d.polygon, getFillColor: (d) => d.frequency === '50 Hz' ? [34, 211, 238, 24] : [255, 194, 23, 24], getLineColor: (d) => d.frequency === '50 Hz' ? [34, 211, 238, 155] : [255, 194, 23, 155], getLineWidth: 1, lineWidthUnits: 'pixels', pickable: true }),
    active.areas && new TextLayer({ id: 'atlas-area-labels', data: ATLAS_FEATURES.areas, getPosition: (d) => d.position, getText: (d) => `${d.name}\n${d.frequency}`, getSize: 11, getColor: [226, 232, 240, 245], getTextAnchor: 'middle', getAlignmentBaseline: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }),
    active.transmission && new PathLayer({ id: 'atlas-transmission', data: ATLAS_FEATURES.transmission, getPath: (d) => d.path, getColor: (d) => d.label.includes('seam') || d.label.includes('⇄') ? [255, 163, 95, 245] : [34, 211, 238, 190], getWidth: (d) => d.label.includes('seam') ? 4 : 2, widthUnits: 'pixels', capRounded: true, jointRounded: true }),
    active.plants && new ScatterplotLayer({ id: 'atlas-plants', data: ATLAS_FEATURES.plants, getPosition: (d) => d.position, getRadius: 19000, radiusUnits: 'meters', getFillColor: [167, 139, 250, 210], getLineColor: [237, 233, 254, 255], lineWidthMinPixels: 2, stroked: true, pickable: true }),
    active.plants && new TextLayer({ id: 'atlas-plant-labels', data: ATLAS_FEATURES.plants, getPosition: (d) => d.position, getText: (d) => `${d.name}\n${d.capacity}`, getSize: 11, getColor: [237, 233, 254, 255], getPixelOffset: [10, -12], fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }),
    active.mix && new TextLayer({ id: 'atlas-mix', data: ATLAS_FEATURES.mix, getPosition: (d) => d.position, getText: (d) => `${d.label}\n${d.values}`, getSize: 12, getColor: [254, 243, 199, 255], getTextAnchor: 'middle', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }),
  ].filter(Boolean), [active]);
  return <div data-testid="japan-grid-atlas" data-variant={variant} style={{ position: 'relative', width: '100%', height, background: variant === 'washi' ? 'var(--color-washi-paper)' : 'var(--color-bg)' }}>
    <DeckGL viewState={viewState} onViewStateChange={({ viewState: next }) => setViewState(next)} controller={true} layers={layers} style={{ position: 'absolute', inset: 0 }}>
      <MapGL mapStyle={MAP_STYLE} style={variant === 'washi' ? { filter: 'saturate(0.35) brightness(1.35) sepia(0.18)' } : undefined} />
    </DeckGL>
    <div data-testid="japan-grid-atlas-hud" role="toolbar" aria-label="Japan grid layers" style={{ position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)', display: 'flex', gap: 6, padding: 7, border: '1px solid color-mix(in srgb, var(--color-heading) 24%, transparent)', background: 'color-mix(in srgb, var(--color-bg) 84%, transparent)', borderRadius: 8 }}>
      {ATLAS_LAYER_IDS.map((id) => <button key={id} type="button" title={liveData[id]?.status === 'available' || !['demand', 'jepx'].includes(id) ? LABELS[id] : `${LABELS[id]} unavailable`} aria-label={LABELS[id]} aria-pressed={active[id]} onClick={() => toggle(id)} style={{ width: 32, height: 32, border: '1px solid', borderColor: active[id] ? 'var(--color-primary)' : 'transparent', borderRadius: 5, background: active[id] ? 'color-mix(in srgb, var(--color-primary) 24%, transparent)' : 'transparent', color: active[id] ? 'var(--color-heading)' : 'var(--color-dim)', cursor: 'pointer', fontSize: 16 }}>{ICONS[id]}</button>)}
    </div>
  </div>;
}
