import React, { useState } from 'react';
import { colors } from '../theme.js';
import SevenSegMap from '../components/sevenseg/SevenSegMap.jsx';

/**
 * MapCheck — a review page for the schematic maps.
 *
 * SevenSegMap reads SlideContext, which only exists inside a Slide. Outside
 * Spectacle the context is null and the component treats itself as active,
 * which is exactly what we want for a static review page.
 *
 * ?maps
 */
export default function MapCheck() {
  const [scene, setScene] = useState('texas');
  const [step, setStep] = useState(0);
  const [variant, setVariant] = useState('vpp');

  const maxStep = scene === 'texas' ? 13 : scene === 'sa' && variant === 'blackout' ? 6 : 0;

  return (
    <div style={{ width: '100vw', height: '100vh', background: colors.panel, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 10, padding: '10px 14px', alignItems: 'center', borderBottom: `1px solid ${colors.primary}30` }}>
        {[['texas', 'TEXAS'], ['eu', 'EU'], ['sa', 'SA']].map(([k, label]) => (
          <button
            key={k}
            onClick={() => { setScene(k); setStep(0); }}
            style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 12, padding: '5px 12px',
              background: scene === k ? `${colors.primary}25` : 'transparent',
              color: scene === k ? colors.primary : colors.textDim,
              border: `1px solid ${scene === k ? colors.primary : colors.textDim + '50'}`,
              cursor: 'pointer',
            }}
          >
            {label}
          </button>
        ))}

        {scene === 'sa' && (
          <>
            {['vpp', 'blackout'].map(v => (
              <button
                key={v}
                onClick={() => { setVariant(v); setStep(0); }}
                style={{
                  fontFamily: '"JetBrains Mono", monospace', fontSize: 12, padding: '5px 12px',
                  background: variant === v ? `${colors.primary}25` : 'transparent',
                  color: variant === v ? colors.primary : colors.textDim,
                  border: `1px solid ${variant === v ? colors.primary : colors.textDim + '50'}`,
                  cursor: 'pointer',
                }}
              >
                {v.toUpperCase()}
              </button>
            ))}
          </>
        )}

        <div style={{ flex: 1 }} />
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 12, color: colors.textDim }}>
          STEP
        </span>
        <input
          type="range" min={0} max={maxStep} value={step}
          onChange={e => setStep(Number(e.target.value))}
          style={{ width: 220 }}
        />
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, color: colors.primary, width: 28 }}>
          {step}
        </span>
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <SevenSegMap scene={scene} step={step} variant={variant} />
      </div>
    </div>
  );
}
