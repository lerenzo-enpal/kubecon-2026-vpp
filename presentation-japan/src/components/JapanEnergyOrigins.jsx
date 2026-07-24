import React from 'react';
import { PathLayer } from '@deck.gl/layers';
import StepBridge from './StepBridge.jsx';
import { JapanGridAtlas } from './JapanGridAtlas.jsx';

const ORIGINS = [
  { id: 'lng', label: 'LNG · Australia / Southeast Asia', path: [[115, -23], [130, 5], [139.8, 35.3]], color: [230, 171, 70, 235], view: { center: [126, 4], zoom: 2.2, pitch: 0, bearing: 0 } },
  { id: 'oil', label: 'Oil · Middle East', path: [[52, 26], [72, 17], [139.8, 35.3]], color: [196, 82, 66, 235], view: { center: [92, 21], zoom: 2.25, pitch: 0, bearing: 0 } },
  { id: 'coal', label: 'Coal · Australia', path: [[151, -32], [149, 8], [139.8, 35.3]], color: [95, 78, 65, 235], view: { center: [147, 0], zoom: 2.25, pitch: 0, bearing: 0 } },
];

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

  const activeStep = Number.isFinite(step) ? step : 0;
  const origin = ORIGINS[Math.max(0, Math.min(activeStep, ORIGINS.length - 1))];
  return <div data-testid="japan-energy-origins" style={{ height, position: 'relative', background: 'var(--color-washi-paper)' }}>
    <JapanGridAtlas variant="washi" mapVariant="washi" step={step} preset={() => ({})} sceneLayer={{ view: origin.view, layers }} />
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
