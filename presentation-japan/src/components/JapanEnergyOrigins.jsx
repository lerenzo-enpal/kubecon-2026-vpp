import React from 'react';
import { DeckGL } from '@deck.gl/react';
import { PathLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import StepBridge from './StepBridge.jsx';
import 'maplibre-gl/dist/maplibre-gl.css';

const ORIGINS = [
  { id: 'lng', label: 'LNG · Australia / Southeast Asia', path: [[115, -23], [130, 5], [139.8, 35.3]], color: [230, 171, 70, 235] },
  { id: 'oil', label: 'Oil · Middle East', path: [[52, 26], [72, 17], [139.8, 35.3]], color: [196, 82, 66, 235] },
  { id: 'coal', label: 'Coal · Australia', path: [[151, -32], [149, 8], [139.8, 35.3]], color: [95, 78, 65, 235] },
];

const VIEW = { longitude: 136, latitude: 20, zoom: 2.35, pitch: 0, bearing: 0 };
const MAP_STYLE = { version: 8, sources: { base: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png'], tileSize: 256 } }, layers: [{ id: 'base', type: 'raster', source: 'base', paint: { 'raster-opacity': 0.46 } }] };

function EnergyOriginsScene({ height, step }) {
  const origins = ORIGINS.slice(0, step + 1);
  const layers = origins.map((origin) => new PathLayer({
    id: `energy-origin-route-${origin.id}`,
    data: [origin],
    getPath: (item) => item.path,
    getColor: (item) => item.color,
    getWidth: 4,
    widthUnits: 'pixels',
    capRounded: true,
    jointRounded: true,
  }));

  return <div data-testid="japan-energy-origins" style={{ height, position: 'relative', background: 'var(--color-washi-paper)' }}>
    <DeckGL viewState={VIEW} controller={false} layers={layers} style={{ position: 'absolute', inset: 0 }}>
      <MapGL mapStyle={MAP_STYLE} style={{ filter: 'saturate(0.3) brightness(1.1) sepia(0.28)' }} />
    </DeckGL>
    <div style={{ position: 'absolute', zIndex: 2, top: 44, left: 48 }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '.16em' }}>JAPAN&apos;S ENERGY SYSTEM · FY2023</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)' }}>Japan&apos;s energy comes from far away.</h1>
    </div>
    <div data-testid="energy-origin-mix" style={{ position: 'absolute', zIndex: 2, left: 48, bottom: 48, color: 'var(--color-washi-ink)', fontFamily: 'var(--font-mono)' }}>Coal 31% · LNG 33% · Renewables 23% · Nuclear 9% · Oil 4%</div>
    <div data-testid="energy-origin-source" style={{ position: 'absolute', zIndex: 2, right: 48, bottom: 48, color: 'var(--color-washi-ink)', fontFamily: 'var(--font-mono)' }}>METI · FY2023 generation mix</div>
    <div style={{ position: 'absolute', zIndex: 2, top: 156, left: 48, display: 'grid', gap: 8, fontFamily: 'var(--font-mono)', color: 'var(--color-washi-ink)' }}>
      {ORIGINS.map((origin, index) => <div key={origin.id} data-testid={`energy-origin-route-${origin.id}`} style={{ opacity: index <= step ? 1 : 0, transition: 'opacity 320ms ease' }}>{origin.label}</div>)}
      <div style={{ color: 'var(--color-washi-alert)', opacity: step >= ORIGINS.length ? 1 : 0, transition: 'opacity 320ms ease' }}>One route leads through Hormuz.</div>
    </div>
  </div>;
}

export function JapanEnergyOrigins({ height = '100%' }) {
  return <StepBridge count={4}>{(step) => <EnergyOriginsScene height={height} step={step} />}</StepBridge>;
}

export default JapanEnergyOrigins;
