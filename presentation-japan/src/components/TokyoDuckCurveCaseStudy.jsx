import React, { useContext, useEffect, useMemo, useState } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MAIN_TALK_EVIDENCE } from '../data/mainTalkEvidence.mjs';
import { ATLAS_FEATURES } from '../data/japanGridAtlasData.mjs';
import { MainTalkSourceFooter } from './MainTalkSourceFooter.jsx';
import DuckCurveHUD from '../../../presentation/src/components/DuckCurveHUD.jsx';

const FLY_TO = new FlyToInterpolator();
const DARK_MAP_STYLE = {
  version: 8,
  sources: { carto: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } },
  layers: [{ id: 'base', type: 'raster', source: 'carto', paint: { 'raster-opacity': 0.72 } }],
};
const HOME_DEVICE_COUNT = 320;
const NEIGHBORHOOD_COUNT = 16;
const HOME_NEIGHBORHOODS = [
  [139.777, 35.714], [139.796, 35.714], [139.710, 35.730], [139.666, 35.708],
  [139.579, 35.704], [139.703, 35.694], [139.702, 35.659], [139.698, 35.633],
  [139.654, 35.646], [139.668, 35.662], [139.738, 35.628], [139.716, 35.562],
  [139.817, 35.673], [139.818, 35.696], [139.804, 35.775], [139.847, 35.743],
];
const HOMES = Array.from({ length: HOME_DEVICE_COUNT }, (_, index) => {
  const [longitude, latitude] = HOME_NEIGHBORHOODS[index * 7 % NEIGHBORHOOD_COUNT];
  const radius = 0.003 + (Math.sin(index * 12.9898) + 1) * 0.012;
  const angle = index * 2.4 + Math.sin(index * 5.2) * 0.7;
  return [longitude + Math.cos(angle) * radius, latitude + Math.sin(angle) * radius * 0.72];
});
const SCENES = [
  { time: '12:00', title: 'Renewables need somewhere to go', state: 'CURTAILMENT CONTEXT', view: { longitude: 139.72, latitude: 35.67, zoom: 10.1, pitch: 38, bearing: -12 }, color: [255, 163, 95], hour: 12, blend: 0 },
  { time: '12:15', title: 'Flexible homes create demand', state: 'ILLUSTRATIVE CHARGING', view: { longitude: 139.75, latitude: 35.69, zoom: 11.2, pitch: 42, bearing: -12 }, color: [16, 185, 129], hour: 12, blend: 0.72 },
  { time: '17:00', title: 'Stored energy supports dusk', state: 'ILLUSTRATIVE DUSK SUPPORT', view: { longitude: 139.72, latitude: 35.67, zoom: 10.1, pitch: 38, bearing: -12 }, color: [99, 102, 241], hour: 17, blend: 1 },
];

export function TokyoDuckCurveCaseStudy({ step = 0 }) {
  const slideContext = useContext(SlideContext);
  const isActive = slideContext?.isSlideActive ?? true;
  const sceneIndex = Math.min(Math.max(Number.isInteger(step) ? step : 0, 0), SCENES.length - 1);
  const scene = SCENES[sceneIndex];
  const [viewState, setViewState] = useState(SCENES[0].view);

  useEffect(() => {
    if (!isActive) return;
    setViewState(previous => ({ ...previous, ...scene.view, transitionDuration: 900, transitionInterpolator: FLY_TO }));
  }, [scene, isActive]);

  const layers = useMemo(() => [
    new PathLayer({ id: 'tokyo-atlas-transmission', data: ATLAS_FEATURES.transmission, getPath: ({ path }) => path, getColor: [34, 211, 238, 120], getWidth: 2, widthUnits: 'pixels', capRounded: true, jointRounded: true }),
    new ScatterplotLayer({ id: 'tokyo-atlas-plants', data: ATLAS_FEATURES.plants, getPosition: ({ position }) => position, getRadius: 5, radiusUnits: 'pixels', getFillColor: ({ fuel }) => fuel === 'Nuclear' ? [167, 139, 250, 230] : fuel === 'LNG' ? [34, 211, 238, 230] : [148, 163, 184, 220], getLineColor: [241, 245, 249, 220], lineWidthMinPixels: 1, stroked: true }),
    new ScatterplotLayer({
    id: 'tokyo-illustrative-homes', data: HOMES, getPosition: d => d,
    getRadius: sceneIndex === 1 ? 260 : 180, radiusUnits: 'meters',
    getFillColor: [...scene.color, 205], getLineColor: [...scene.color, 255], lineWidthMinPixels: 1.5,
    stroked: true, filled: true, updateTriggers: { getRadius: sceneIndex, getFillColor: sceneIndex },
    }),
  ], [sceneIndex, scene]);

  return (
    <section data-testid="tokyo-duck-curve-case" style={{ position: 'relative', height: '100%', minHeight: 610, overflow: 'hidden', background: 'var(--color-bg)', color: 'var(--color-heading)' }}>
      <DeckGL viewState={viewState} onViewStateChange={({ viewState: next }) => setViewState(next)} controller layers={layers} style={{ position: 'absolute', inset: 0 }}>
        <MapGL mapStyle={DARK_MAP_STYLE} />
      </DeckGL>
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle at center, transparent 34%, color-mix(in srgb, var(--color-bg) 76%, transparent) 100%)' }} />
      <div style={{ position: 'absolute', top: 34, left: 44, maxWidth: 660, pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', fontSize: 15, letterSpacing: '0.16em' }}>TOKYO-AREA REPORTED CASE · MARCH 2026</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginTop: 14 }}><span style={{ fontFamily: 'var(--font-mono)', color: `rgb(${scene.color.join(' ')})`, fontSize: 52, fontWeight: 700 }}>{scene.time}</span><h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 38, lineHeight: 1.05 }}>{scene.title}</h1></div>
        <div data-testid="tokyo-authored-view" style={{ marginTop: 14, display: 'inline-block', padding: '7px 10px', border: '1px solid color-mix(in srgb, var(--color-secondary) 45%, transparent)', background: 'color-mix(in srgb, var(--color-bg) 80%, transparent)', color: `rgb(${scene.color.join(' ')})`, fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.1em' }}>{scene.state}</div>
        <div style={{ marginTop: 8, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em' }}>ILLUSTRATIVE HOUSEHOLD DEVICES · 320 · SYNTHETIC NEIGHBORHOOD DISTRIBUTION</div>
      </div>
      <div style={{ position: 'absolute', left: 44, right: 44, bottom: 70, padding: '16px 20px 12px', border: '1px solid color-mix(in srgb, var(--color-secondary) 35%, transparent)', background: 'color-mix(in srgb, var(--color-bg) 88%, transparent)', boxShadow: '0 18px 60px color-mix(in srgb, var(--color-bg) 60%, transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.1em' }}><span>ILLUSTRATIVE NET-LOAD RESPONSE</span><span>NOON → DUSK</span></div>
        <div role="img" aria-label="Illustrative duck curve linked to the Tokyo map" style={{ marginTop: 3 }}><DuckCurveHUD width={820} height={220} highlightHour={scene.hour} blend={scene.blend} expanded /></div>
      </div>
      <MainTalkSourceFooter evidence={MAIN_TALK_EVIDENCE.tokyoDemandCreation} compact />
    </section>
  );
}
