import React from 'react';
import { PathLayer } from '@deck.gl/layers';
import StepBridge from './StepBridge.jsx';
import { JapanGridAtlas } from './JapanGridAtlas.jsx';

const ORIGINS = [
  { id: 'lng',  label: 'LNG',  origin: 'Australia / Southeast Asia', share: '33%', path: [[115, -23], [130, 5], [139.8, 35.3]], color: [230, 171, 70, 235], view: { center: [126, 4], zoom: 2.2, pitch: 0, bearing: 0 } },
  { id: 'oil',  label: 'Oil',  origin: 'Middle East',                share: '4%',  path: [[52, 26], [72, 17], [139.8, 35.3]], color: [196, 82, 66, 235], view: { center: [92, 21], zoom: 2.25, pitch: 0, bearing: 0 } },
  { id: 'coal', label: 'Coal', origin: 'Australia',                  share: '31%', path: [[151, -32], [149, 8], [139.8, 35.3]], color: [95, 78, 65, 235], view: { center: [147, 0], zoom: 2.25, pitch: 0, bearing: 0 } },
];
const HORMUZ_VIEW = { longitude: 98, latitude: 22, zoom: 2.6, pitch: 30, bearing: 0 };
const ORIGIN_OVERVIEW_VIEW = { longitude: 121, latitude: 10, zoom: 2.2, pitch: 16, bearing: 0 };
const HORMUZ_FOCUS_VIEW = { longitude: 56.3, latitude: 26.6, zoom: 4.5, pitch: 50, bearing: 18 };

function EnergyOriginsScene({ height, step }) {
  const activeStep = Number.isFinite(step) ? step : 0;
  const origins = ORIGINS.slice(0, activeStep + 1);
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

  const view = activeStep < ORIGINS.length ? ORIGINS[activeStep].view : activeStep === 3 ? ORIGIN_OVERVIEW_VIEW : activeStep === 4 ? HORMUZ_FOCUS_VIEW : HORMUZ_VIEW;
  return <div data-testid="japan-energy-origins" style={{ height, position: 'relative', background: 'var(--color-washi-paper)' }}>
    <JapanGridAtlas variant="washi" mapVariant="washi" step={step} preset={() => ({})} sceneLayer={{ view, layers }} />
    <div style={{ position: 'absolute', zIndex: 2, top: 44, left: 48 }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '.16em' }}>JAPAN&apos;S ENERGY SYSTEM · FY2023</div>
      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)' }}>Japan&apos;s energy comes from far away.</h1>
    </div>
    <div data-testid="energy-origin-source" style={{ position: 'absolute', zIndex: 2, right: 48, bottom: 48, color: 'var(--color-washi-ink)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.12em', opacity: 0.7 }}>METI · FY2023 generation mix</div>
    <div style={{ position: 'absolute', zIndex: 2, top: 156, left: 48, display: 'grid', gap: 14, fontFamily: 'var(--font-mono)', color: 'var(--color-washi-ink)' }}>
      {ORIGINS.map((origin, index) => (
        <div key={origin.id} data-testid={`energy-origin-route-${origin.id}`}
          style={{ opacity: index <= step ? 1 : 0, transform: `translateX(${index <= step ? 0 : -8}px)`, transition: 'opacity 320ms ease, transform 320ms ease', display: 'flex', alignItems: 'baseline', gap: 12 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: `rgba(${origin.color[0]}, ${origin.color[1]}, ${origin.color[2]}, 0.95)` }} />
          <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)', lineHeight: 1 }}>{origin.share}</span>
          <span style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 600 }}>{origin.label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, opacity: 0.7, letterSpacing: '0.04em' }}>· {origin.origin}</span>
        </div>
      ))}
      <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', color: 'var(--color-washi-ink)', opacity: 0.55 }}>
        Renewables 23% · Nuclear 9% · Other 0%
      </div>
      <div style={{ marginTop: 4, fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 700, color: 'var(--color-washi-alert)', opacity: step >= ORIGINS.length ? 1 : 0, transition: 'opacity 320ms ease' }}>One route leads through Hormuz.</div>
    </div>
  </div>;
}

export function JapanEnergyOrigins({ height = '100%' }) {
  return <StepBridge count={4}>{(step) => <EnergyOriginsScene height={height} step={step} />}</StepBridge>;
}

export default JapanEnergyOrigins;
