# Tokyo documented-assets map design

## Goal

Make Proof 2 show documented March 2022 earthquake-related generation outages before the Tokyo-area cold-snap supply-demand warning.

## Scope

- Show three named thermal stations: Hirono, Haramachi, and Shin-Sendai.
- Clicker steps reveal the documented station outages, then city demand pressure, warning, and illustrative flexibility.
- Draw only a high-level grid corridor between the stations and Tokyo. It is context, not a transmission model.
- Keep the final flexibility layer green and labelled illustrative.

## Evidence boundary

- Hirono stopped through an earthquake safety mechanism; contemporary Tokyo Shimbun reported it.
- Haramachi and Shin-Sendai stopped pending inspections; contemporaneous NHK reported it.
- Reuters documents the March 22 cold-snap warning and avoided rolling blackouts.
- No plant MW, reserve margin, dispatch, frequency trace, or causal line-flow claim will be shown.
- January 2021 is excluded: the available evidence supports an LNG/supply and price shock, not an asset-outage map.

## UI

One Deck.gl map. Red pins mark documented stopped stations; amber corridors and metro glow communicate system pressure; green home pins remain a counterfactual flexibility overlay. Map stays draggable; clicker controls authored states.

## Validation

Static rendering contract checks named assets, state copy, sources, and the illustrative label. Browser test advances every authored state and confirms the map remains interactive.
