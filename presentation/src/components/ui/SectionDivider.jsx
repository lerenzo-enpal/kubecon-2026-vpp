import React from 'react';
import SlideContainer from './SlideContainer';
import GlowText from './GlowText';

export default function SectionDivider({ number, title, subtitle }) {
  return (
    <SlideContainer>
      <div className="text-center">
        <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.15em] uppercase mb-5">
          Part {number}
        </div>
        <GlowText size="56px" style={{ textAlign: 'center' }}>
          {title}
        </GlowText>
        {subtitle && (
          <div className="mt-5 text-hud-text-muted text-[22px] font-sans font-normal leading-normal max-w-[800px] mx-auto">
            {subtitle}
          </div>
        )}
      </div>
    </SlideContainer>
  );
}
