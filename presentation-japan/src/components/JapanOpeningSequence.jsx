import React from 'react';
import StepBridge from './StepBridge.jsx';
import JapanGridMapAnimated from './JapanGridMapAnimated.jsx';
import ExplanationBox, { EXPLANATION_PRESETS } from './ExplanationBox.jsx';

const TitleCard = ({ presenter, step }) => (
  <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12, padding: '0 40px' }}>
    <div data-testid="opening-title-event" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: 'var(--color-primary)', letterSpacing: '0.2em', marginBottom: 16 }}>
      KUBECON + CLOUDNATIVECON JAPAN 2026 · YOKOHAMA
    </div>
    <div style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.1, color: 'var(--color-heading)', fontFamily: 'Space Grotesk, sans-serif' }}>
      The Energy Grid Is Becoming a Cloud Native Distributed System
    </div>
    {step >= 1 && (
      <div data-testid="opening-title-premise" style={{ fontSize: 22, color: 'var(--color-text)', fontFamily: 'Inter, sans-serif' }}>
        How VPP solves Japan's structural energy fragility
      </div>
    )}
    {step >= 2 && presenter && (
      <div data-testid="opening-title-presenter" style={{ fontSize: 16, color: 'var(--color-muted)', fontFamily: 'JetBrains Mono, monospace', marginTop: 20 }}>
        {presenter}
      </div>
    )}
  </div>
);

const STEP_LABELS = ['Title', 'Premise', 'Presenter', 'Island', '50Hz East', '60Hz West', 'Seam', 'LNG Routes', 'Hormuz', 'Stats', 'Sidebar'];

const StepLabel = ({ step }) => (
  <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--color-dim)', fontFamily: 'JetBrains Mono, monospace' }}>
    {STEP_LABELS[step]}
  </div>
);

const OpeningStatsOverlay = () => (
  <div style={{ position: 'absolute', left: 28, right: 28, bottom: 48, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, pointerEvents: 'none' }}>
    <ExplanationBox {...EXPLANATION_PRESETS.SELF_SUFFICIENCY} animateIn delay={0} direction="up" />
    <ExplanationBox {...EXPLANATION_PRESETS.FOSSIL_FUEL} animateIn delay={100} direction="up" />
    <ExplanationBox {...EXPLANATION_PRESETS.LNG_IMPORT} animateIn delay={200} direction="up" />
  </div>
);

const JapanOpeningSequence = ({ height = '100%', presenter, startAtMap = false }) => {
  const stepOffset = startAtMap ? 3 : 0;
  return (
    <StepBridge count={startAtMap ? 8 : 11}>
      {(step) => {
        const sequenceStep = step + stepOffset;
        return (
          <div style={{ height, position: 'relative', overflow: 'hidden' }}>
            {sequenceStep < 3 ? (
              <TitleCard presenter={presenter} step={sequenceStep} />
            ) : (
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <JapanGridMapAnimated height="100%" step={sequenceStep - 3} testId="japan-opening-map" />
                <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, pointerEvents: 'none' }}>
                  <StepLabel step={sequenceStep} />
                </div>
                {sequenceStep >= 9 && <OpeningStatsOverlay />}
              </div>
            )}
          </div>
        );
      }}
    </StepBridge>
  );
};

export default JapanOpeningSequence;
