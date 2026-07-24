import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { PathLayer, PolygonLayer, ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import { SimpleMeshLayer } from '@deck.gl/mesh-layers';
import { OBJLoader } from '@loaders.gl/obj';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ATLAS_FEATURES, ATLAS_LAYER_IDS } from '../data/japanGridAtlasData.mjs';
import { plantRadiusAtZoom, resolveAtlasLayers } from './japanGridAtlasState.mjs';

const FLY_TO = new FlyToInterpolator();
const VIEW = { longitude: 136.7, latitude: 36.3, zoom: 4.65, pitch: 25, bearing: 5 };
const SEAM_VIEW = { longitude: 137.5, latitude: 35.8, zoom: 5.7, pitch: 32, bearing: -5 };
const ICONS = { mix: '◒', plants: '⚡', areas: '▧', transmission: '╱', demand: '◉', jepx: '¥' };
const LABELS = { mix: 'Energy mix', plants: 'Power plants', areas: 'Provider areas', transmission: 'Transmission', demand: 'Live demand / supply', jepx: 'Live JEPX price' };
const PLANT_COLORS = { Nuclear: [167, 139, 250, 225], LNG: [34, 211, 238, 225], Coal: [148, 163, 184, 225], Oil: [251, 146, 60, 225], Hydro: [96, 165, 250, 225], Geothermal: [239, 68, 68, 225], Solar: [250, 204, 21, 225], Wind: [45, 212, 191, 225] };
const MAP_STYLE = { version: 8, sources: { base: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } }, layers: [{ id: 'base', type: 'raster', source: 'base', paint: { 'raster-opacity': 0.72 } }] };
const WASHI_MAP_STYLE = { version: 8, sources: { base: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'], tileSize: 256 } }, layers: [{ id: 'base', type: 'raster', source: 'base', paint: { 'raster-opacity': 0.46 } }] };

const initialView = (sceneLayer, routeLayer) => {
  const { center, ...sceneView } = sceneLayer?.view ?? {};
  return sceneLayer?.view ? { ...VIEW, ...sceneView, ...(center && { longitude: center[0], latitude: center[1] }) } : routeLayer?.view ?? VIEW;
};

const routePosition = (points, progress) => {
  const index = Math.min(Math.floor(progress * (points.length - 1)), points.length - 2);
  const next = points[index + 1] ?? points[index];
  const t = progress * (points.length - 1) - index;
  const position = points[index].map((value, axis) => value + (next[axis] - value) * t);
  return { position, heading: Math.atan2(next[1] - position[1], next[0] - position[0]) * 180 / Math.PI, index };
};

const routeLayers = ({ points, progress = 0, ship }) => {
  const { position: current, heading, index } = routePosition(points, progress);
  const visible = [...points.slice(0, index + 1), current];
  return [
    new PathLayer({ id: 'atlas-route-ghost', data: [{ path: points }], getPath: ({ path }) => path, getColor: [255, 163, 95, 28], getWidth: 6, widthUnits: 'pixels', capRounded: true, jointRounded: true }),
    visible.length > 1 && new PathLayer({ id: 'atlas-route', data: [{ path: visible }], getPath: ({ path }) => path, getColor: [255, 163, 95, 235], getWidth: 3, widthUnits: 'pixels', capRounded: true, jointRounded: true }),
    new ScatterplotLayer({ id: 'atlas-route-tip', data: [{ position: current }], getPosition: ({ position }) => position, getRadius: 65000, radiusUnits: 'meters', getFillColor: [255, 163, 95, 255] }),
    ship && new SimpleMeshLayer({ id: 'atlas-route-ship', data: [{ position: current, heading }], mesh: ship.mesh, loaders: [OBJLoader], getPosition: ({ position }) => position, getOrientation: ({ heading: direction }) => [0, 0, direction], getColor: ship.color ?? [255, 194, 23], sizeScale: ship.sizeScale ?? 7000, material: { ambient: 0.45, diffuse: 0.75, shininess: 24 } }),
  ].filter(Boolean);
};

export function JapanGridAtlas({ height = '100%', step = 0, preset = () => ({}), liveData = {}, variant = 'dark', mapVariant = 'dark', plantMarkerSize = 10, routeLayer, transmissionLayer, sceneLayer }) {
  const [viewState, setViewState] = useState(() => initialView(sceneLayer, routeLayer));
  const [overrides, setOverrides] = useState({});
  const [replayKey, setReplayKey] = useState(0);
  const deckRef = useRef(null);
  const progressRef = useRef(0);
  const slideContext = useContext(SlideContext);
  const isSlideActive = slideContext?.isSlideActive ?? true;
  const active = useMemo(() => resolveAtlasLayers({ preset: preset(step), overrides }), [preset, step, overrides]);
  const plantRadius = plantRadiusAtZoom(viewState.zoom, plantMarkerSize);
  const routeDuration = routeLayer?.duration ?? 2200;
  const routeDelay = routeLayer?.delay ?? 0;
  const followShip = routeLayer?.followShip;
  const followView = (progress) => {
    const [longitude, latitude] = routePosition(routeLayer.points, progress).position;
    return { ...viewState, longitude, latitude, zoom: 4.5 - progress * 1.9, pitch: 35, bearing: 0 };
  };
  const targetView = routeLayer?.targetView ?? sceneLayer?.view ?? routeLayer?.view ?? (active.transmission ? SEAM_VIEW : VIEW);
  const targetViewKey = JSON.stringify(targetView);
  useEffect(() => { setOverrides({}); }, [step]);
  useEffect(() => {
    if (!isSlideActive || followShip) return;
    const { center, ...view } = targetView;
    const move = () => setViewState((current) => ({ ...current, ...view, ...(center && { longitude: center[0], latitude: center[1] }), transitionDuration: routeDuration, transitionInterpolator: FLY_TO }));
    if (!routeDelay) return move();
    const timeout = window.setTimeout(move, routeDelay);
    return () => window.clearTimeout(timeout);
  }, [isSlideActive, routeDelay, routeDuration, targetViewKey, followShip]);
  const toggle = (id) => setOverrides((current) => ({ ...current, [id]: !active[id] }));
  const atlasLayers = useMemo(() => [
    active.areas && new PolygonLayer({ id: 'atlas-areas', data: ATLAS_FEATURES.areas, getPolygon: (d) => d.polygon, getFillColor: (d) => d.frequency === '50 Hz' ? [34, 211, 238, 24] : [255, 194, 23, 24], getLineColor: (d) => d.frequency === '50 Hz' ? [34, 211, 238, 155] : [255, 194, 23, 155], getLineWidth: 1, lineWidthUnits: 'pixels', pickable: true }),
    active.areas && new TextLayer({ id: 'atlas-area-labels', data: ATLAS_FEATURES.areas, getPosition: (d) => d.position, getText: (d) => `${d.name}\n${d.frequency}`, getSize: 11, getColor: [226, 232, 240, 245], getTextAnchor: 'middle', getAlignmentBaseline: 'center', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }),
    active.transmission && new PathLayer({ id: 'atlas-transmission', data: ATLAS_FEATURES.transmission, getPath: (d) => d.path, getColor: (d) => d.label.includes('seam') || d.label.includes('⇄') ? [255, 163, 95, 245] : [34, 211, 238, 190], getWidth: (d) => d.label.includes('seam') ? 4 : 2, widthUnits: 'pixels', capRounded: true, jointRounded: true }),
    active.plants && new ScatterplotLayer({ id: 'atlas-plants', data: ATLAS_FEATURES.plants, getPosition: (d) => d.position, getRadius: plantRadius, radiusUnits: 'pixels', getFillColor: (d) => PLANT_COLORS[d.fuel], getLineColor: [237, 233, 254, 255], lineWidthMinPixels: 2, stroked: true, pickable: true }),
    active.mix && new TextLayer({ id: 'atlas-mix', data: ATLAS_FEATURES.mix, getPosition: (d) => d.position, getText: (d) => `${d.label}\n${d.values}`, getSize: 12, getColor: [254, 243, 199, 255], getTextAnchor: 'middle', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }),
  ].filter(Boolean), [active, plantRadius]);
  const layers = useCallback((progress = 0, time = 0) => [
    ...atlasLayers,
    ...(routeLayer ? routeLayers({ ...routeLayer, progress }) : []),
    ...(transmissionLayer?.getLayers ? transmissionLayer.getLayers(time) : transmissionLayer?.layers ?? []),
    ...(sceneLayer?.getLayers ? sceneLayer.getLayers(time) : sceneLayer?.layers ?? []),
  ], [atlasLayers, routeLayer, transmissionLayer, sceneLayer]);
  useEffect(() => {
    if (!isSlideActive || (!routeLayer && !transmissionLayer?.getLayers && !sceneLayer?.getLayers)) return undefined;
    let frame;
    let started;
    progressRef.current = 0;
    const tick = (now) => {
      started ??= now;
      const progress = routeLayer ? Math.min(Math.max(now - started - routeDelay, 0) / routeDuration, 1) : 0;
      progressRef.current = progress;
      const props = { layers: layers(progress, now % 3600) };
      if (followShip) props.viewState = followView(progress);
      deckRef.current?.deck?.setProps(props);
      if (progress < 1 || transmissionLayer?.getLayers || sceneLayer?.getLayers) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isSlideActive, layers, replayKey, followShip, transmissionLayer?.getLayers, sceneLayer?.getLayers]);
  return <div data-testid="japan-grid-atlas" data-variant={variant} data-map-variant={mapVariant} style={{ position: 'relative', width: '100%', height, background: variant === 'washi' ? 'var(--color-washi-paper)' : 'var(--color-bg)' }}>
    {isSlideActive && <DeckGL ref={deckRef} viewState={viewState} onViewStateChange={({ viewState: next }) => setViewState(next)} controller={true} layers={layers(progressRef.current)} getTooltip={({ object }) => object && (object.name ? { text: `${object.name}\n${object.fuel} · ${object.capacity}` } : { text: object.label || object.name })} style={{ position: 'absolute', inset: 0 }}>
      <MapGL mapStyle={mapVariant === 'washi' ? WASHI_MAP_STYLE : MAP_STYLE} style={mapVariant === 'washi' ? { filter: 'saturate(0.35) brightness(1.35) sepia(0.18)' } : undefined} />
    </DeckGL>}
    {routeLayer && <button data-testid="hormuz-route-play" type="button" aria-label="Replay Hormuz route" onClick={() => setReplayKey((key) => key + 1)} className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded border border-[var(--color-accent)] bg-[color-mix(in_srgb,var(--color-bg)_84%,transparent)] px-3 py-2 font-[var(--font-mono)] text-xs text-[var(--color-heading)]">Replay route</button>}
    {transmissionLayer && <span data-testid="atlas-transmission-layer" className="sr-only">Animated transmission layer</span>}
    <div data-testid="japan-grid-atlas-hud" role="toolbar" aria-label="Japan grid layers" style={{ position: 'absolute', left: '50%', bottom: 18, transform: 'translateX(-50%)', display: 'flex', gap: 6, padding: 7, border: '1px solid color-mix(in srgb, var(--color-heading) 24%, transparent)', background: 'color-mix(in srgb, var(--color-bg) 84%, transparent)', borderRadius: 8 }}>
      {ATLAS_LAYER_IDS.map((id) => <button key={id} type="button" title={liveData[id]?.status === 'available' || !['demand', 'jepx'].includes(id) ? LABELS[id] : `${LABELS[id]} unavailable`} aria-label={LABELS[id]} aria-pressed={active[id]} onClick={() => toggle(id)} style={{ width: 32, height: 32, border: '1px solid', borderColor: active[id] ? 'var(--color-primary)' : 'transparent', borderRadius: 5, background: active[id] ? 'color-mix(in srgb, var(--color-primary) 24%, transparent)' : 'transparent', color: active[id] ? 'var(--color-heading)' : 'var(--color-dim)', cursor: 'pointer', fontSize: 16 }}>{ICONS[id]}</button>)}
    </div>
  </div>;
}
