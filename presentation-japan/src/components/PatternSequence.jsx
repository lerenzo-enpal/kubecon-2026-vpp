import React from 'react';
import StepBridge from './StepBridge.jsx';
import JapanColdSnapMapAnimated from './JapanColdSnapMapAnimated.jsx';

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
      {(step) => <JapanColdSnapMapAnimated height={height} step={step} testId="act2-cold-snap-map" />}
    </StepBridge>
  );
};

export default PatternSequence;
