import React, { useState } from 'react';
import StepBridge from './StepBridge.jsx';
import JapanGridMapAnimated from './JapanGridMapAnimated.jsx';
import ExplanationBox, { EXPLANATION_PRESETS } from './ExplanationBox.jsx';

const TitleCard = ({ presenter }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '0 40px' }}>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--color-primary)', letterSpacing: '0.2em', marginBottom: 16 }}>
      KUBECON + CLOUDNATIVECON JAPAN 2026 · YOKOHAMA
    </div>
    <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, color: 'var(--color-heading)', fontFamily: 'Space Grotesk, sans-serif' }}>
      The Energy Grid Is Becoming a Cloud Native Distributed System
    </div>
    <div style={{ fontSize: 22, color: 'var(--color-text)', fontFamily: 'Inter, sans-serif' }}>
      How VPP solves Japan's structural energy fragility
    </div>
    {presenter && (
      <div style={{ fontSize: 16, color: 'var(--color-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 20 }}>
        {presenter}
      </div>
    )}
  </div>
);

const JapanOpeningSequence = ({ height = 600, presenter }) => {
  return (
    <StepBridge count={9}>
      {(step) => (
        <div style={{ height, display: 'flex', flexDirection: 'column', gap: 20, padding: '20px' }}>
          {step === 0 ? (
            <TitleCard presenter={presenter} />
          ) : (
            <>
              {/* Map takes up most of the space */}
              <div style={{ flex: 1, minHeight: 0 }}>
                <JapanGridMapAnimated height={height - 200} step={step - 1} />
              </div>

              {/* Explanation boxes appear once stats are reached */}
              {step >= 7 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <ExplanationBox
                    {...EXPLANATION_PRESETS.SELF_SUFFICIENCY}
                    animateIn
                    delay={0}
                    direction="up"
                  />
                  <ExplanationBox
                    {...EXPLANATION_PRESETS.FOSSIL_FUEL}
                    animateIn
                    delay={100}
                    direction="up"
                  />
                  <ExplanationBox
                    {...EXPLANATION_PRESETS.LNG_IMPORT}
                    animateIn
                    delay={200}
                    direction="up"
                  />
                </div>
              )}
            </>
          )}

          {/* Step indicator */}
          <div
            style={{
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--color-dim)',
              fontFamily: 'JetBrains Mono, monospace',
              marginTop: 8,
            }}
          >
            {['Title', 'Island', '50Hz East', '60Hz West', 'Seam', 'LNG Routes', 'Hormuz', 'Stats', 'Sidebar'][step]}
          </div>
        </div>
      )}
    </StepBridge>
  );
};

export default JapanOpeningSequence;
