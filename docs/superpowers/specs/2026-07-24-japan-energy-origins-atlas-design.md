# Japan energy origins Atlas design

## Goal

Make slide 3 use the shared `JapanGridAtlas`, retain its washi / hand-drawn treatment, and pan to each revealed import origin. Slide 4 starts with the matching map extent before fading to its dark treatment.

## Approach

`JapanEnergyOrigins` supplies one Atlas `sceneLayer`: it creates the existing coloured Deck.gl paths and the step-specific camera view. `JapanGridAtlas` gets only a `mapVariant` prop, switching its existing raster tile source and CSS filter between washi and dark; it owns camera transitions and RAF work as it does for other scenes.

## Boundaries

No custom shader, persistent cross-slide WebGL instance, new dependency, or map-data pipeline. Spectacle mounts slides independently, so slide 4 uses a short dark-map fade rather than pretending to preserve one WebGL context.

## Verification

Static tests assert the shared Atlas usage, origin scene layer, washi map variant, and dark fade hook. Browser test checks the slide sequence and origin routes.
