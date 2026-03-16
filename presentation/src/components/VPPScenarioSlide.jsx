import React from 'react';
import VPPScenarioMapSlide from './VPPScenarioMapSlide';

// VPPScenarioSlide is now a thin wrapper around the full-screen map HUD.
// The old split-layout (map top + homes bottom) caused white-screen issues
// and has been replaced with a full-screen DeckGL + MapLibre approach.

export default function VPPScenarioSlide({ scenario = 'summer' }) {
  return <VPPScenarioMapSlide scenario={scenario} />;
}
