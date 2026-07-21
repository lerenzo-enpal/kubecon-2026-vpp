import React from 'react';
import StepBridge from './StepBridge.jsx';
import EnergyUsageScalingAnimation from './EnergyUsageScalingAnimation.jsx';
import DataCenterMapOverlay from './DataCenterMapOverlay.jsx';
import { JEPXPriceChart } from './JEPXPriceChart.jsx';

const H = ({ children, color = 'var(--color-heading)', size = '44px' }) => (
  <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.1, marginBottom: 8, color, fontFamily: 'Space Grotesk, sans-serif' }}>
    {children}
  </div>
);
const Sub = ({ children, color = 'var(--color-text)', size = '20px' }) => (
  <div style={{ fontSize: size, color, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, marginBottom: 12 }}>{children}</div>
);

const ContextCard = ({ label, text, color }) => (
  <div style={{ background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 8, padding: '16px 20px' }}>
    <div style={{ fontSize: 12, color, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: 14, color: 'var(--color-text)', fontFamily: 'Inter, sans-serif' }}>{text}</div>
  </div>
);

const PatternSequence = ({ height = 600 }) => {
  return (
    <StepBridge count={5}>
      {(step) => (
        <div style={{ height, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '20px 40px', gap: 12 }}>
          {step === 0 && (
            <div>
              <H>This Is Not the First Warning</H>
              <Sub size="22px">January 2021. A cold snap hit Japan. What happened next is the pattern that repeats.</Sub>
            </div>
          )}

          {step === 1 && (
            <div>
              <H size="36px">Demand Scales From One Home to Entire Cities</H>
              <div style={{ marginTop: 12, height: height - 140 }}>
                <EnergyUsageScalingAnimation height={height - 140} autoPlay />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <H size="36px" color="#ef4444">The Crisis: 25x in 40 Days</H>
              <div style={{ marginTop: 12, height: height - 260 }}>
                <JEPXPriceChart height={height - 260} />
              </div>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <ContextCard label="JAN 2021" color="#ef4444" text="10 → 251 ¥/kWh. No disaster. No trigger." />
                <ContextCard label="MAR 2022" color="#FFA35F" text="TEPCO reserve: 2.5%. First-ever emergency warning." />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <H>Now Demand Is Rising Again</H>
              <Sub size="22px">40+ planned data center projects are landing on the same fragile grid.</Sub>
            </div>
          )}

          {step === 4 && (
            <div style={{ height }}>
              <DataCenterMapOverlay height={height - 40} autoPlay showStress />
            </div>
          )}
        </div>
      )}
    </StepBridge>
  );
};

export default PatternSequence;
