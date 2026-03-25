import React from 'react';
import { Slide, Notes } from 'spectacle';
import { colors } from '../theme';
import { GlowText, LazyContent } from '../components/ui';
import LargestMachineZoom from '../components/LargestMachineZoom';
import StepBridge from '../components/StepBridge';

// ═══════════════════════════════════════════════════════════════════════════
// VERSION D: "The Zoom Out"
// Starts with stat boxes, dramatic ZERO DOWNTIME reveal, then a full-slide
// zoom-out animation comparing VW Wolfsburg (60K) to the EU grid (2.3M).
// ═══════════════════════════════════════════════════════════════════════════
export function gridScale() {
  return [
    <Slide key="grid-scale-d1" backgroundColor={colors.bg} padding="0">
      <div className="relative w-full h-full">
        {/* Canvas animation layer — full bleed */}
        <StepBridge count={7}>
          {(step) => <LazyContent><LargestMachineZoom step={step} /></LazyContent>}
        </StepBridge>

        {/* Title overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none" style={{ padding: '36px' }}>
          <GlowText size="40px">The Grid: The Largest "Machine" Ever</GlowText>
        </div>
      </div>
      <Notes>
        [MARIO] Europe's largest car factory is VW Wolfsburg — 60,000 workers over 6.5 km2.
        The European grid: 2.3 million workers across 5.5 million km2.
        36 countries, all operating at 50 Hz across interconnected synchronous areas.
        Zero downtime — this machine has never been turned off. No maintenance window. No staging environment.
      </Notes>
    </Slide>,
  ];
}
