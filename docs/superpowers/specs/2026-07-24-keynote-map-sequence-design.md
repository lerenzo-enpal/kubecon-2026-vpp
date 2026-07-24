# Keynote map sequence

## Change

Reorder the opening so the keynote introduces Japan's electrical grid before its energy origins: premise, grid atlas, energy origins, then Hormuz.

Reuse `JapanGridAtlas` for the Hormuz and Grid pressure scenes. Each use receives only a slide-specific preset; no additional map component, data source, or map abstraction is introduced.

## Narrative

The sequence establishes the grid's regional and frequency constraints first, explains import dependence second, makes the Hormuz chokepoint concrete third, and then returns to the grid under pressure.

## Scope

Keynote only. Preserve the existing map controls, accessibility labels, animation gating, and the Energy Origins visual. Keep the Hormuz-specific route treatment in its scene while sharing the atlas base.

## Verification

Run the focused keynote rendering test and assert the slide sequence plus atlas presence on the Grid, Hormuz, and Grid pressure slides.
