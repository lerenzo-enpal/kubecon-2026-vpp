import React from 'react';
import { colors } from '../../theme';
import SlideContainer from './SlideContainer';
import GlowText from './GlowText';

export default function SectionDivider({ number, title, subtitle }) {
  return (
    <SlideContainer>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 600,
          color: colors.primary,
          fontFamily: '"JetBrains Mono", monospace',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          marginBottom: 20,
        }}>
          Part {number}
        </div>
        <GlowText size="56px" style={{ textAlign: 'center' }}>
          {title}
        </GlowText>
        {subtitle && (
          <div style={{
            marginTop: 20,
            color: colors.textMuted,
            fontSize: '22px',
            fontFamily: '"Inter", system-ui, sans-serif',
            fontWeight: 400,
            lineHeight: 1.5,
            maxWidth: 800,
            margin: '20px auto 0',
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </SlideContainer>
  );
}
