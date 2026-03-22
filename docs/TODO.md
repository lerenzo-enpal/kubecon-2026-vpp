# Presentation TODOs

## Done
- [x] Restructure narrative arc — Texas open, renewables act, VPP solution, resilience close
- [x] Add RenewableGrowthChart component (animated bar chart, Germany data)
- [x] Add DuckCurveChart component (duck curve with VPP toggle)
- [x] Upgrade frequency slide with interactive demo + James Bond hacker collapse
- [x] Create AGENTS.md with "Mission Control" theme guidance

## Next
- [ ] Add appendix slides with detailed info on each grid failure (dates, causes, impact, sources)
- [ ] Improve screen real estate usage across all slides — follow AGENTS.md dashboard principles
- [ ] Apply "Mission Control" theme consistently (scanlines, glowing data, urgent warnings)
- [ ] Add architecture deep-dive slide (Edge / Connect / Control Plane / Market layers)
- [ ] Add "Why Cloud-Native?" slide back (removed during restructure, still valuable)
- [ ] Consider adding the Berlin blackout story as an appendix slide (strong for European audience)
- [ ] Practice timing — talk should run 25 minutes to leave buffer for Q&A


## Post-Conference Refactors
- [ ] Organize `components/` into subfolders (`charts/`, `maps/`, `diagrams/`, `demos/`, `ui/`) — update all import paths (~30 files)
- [ ] Extract `useMapSteps` hook from EUGridHUD / SAMapHUD / VPPScenarioMapSlide cascade step pattern


# mario to do
[] can i put something about ercot cost vs 2030 electrification cost in the eu
[] old curtailment in playbook. ???
[] sort out limits of vpp (slide in appendix)
[] look into the presentation-wide margin from Spectacle — slides have unused padding/margin that wastes screen real estate. Consider overriding Deck/Slide defaults or dropping Spectacle entirely

Questions / Tasks


Prestnation
- audit the speakar notes. they shouldnt be a script. but main points. 
- does our website adequalty show the frequency balancing. we speak a lot about how important it is and how to manage it, but i dont think we talk about supply and demand or how it is instaneously ballanced. 
- lets research electricity works and create a slide on how to present it in an content accessible way so our younger audience. 

- lets research li-ion battiers works and create a page for our website. First, lets resarch and plan on how to present it in an content accessible way so our younger audience. lets talk about the history and current affordablity trends and upcoming tech, and alternatives to li-ion. I realize there is sa lot of content on this already, but I feel our site would be incomplete without it. perhaps it can be in some other section - both this and how electricity works - like electricity basics. The content is out of scope for the preso, but we can put it in the website. 





Feed to Claude:
- on slide 2, between the partner logos can we put a little faint cyan pilon like those on our substations. maybe with four
horizontal strokes and no base.
- has the grid really never been down? 
- on slide 7, please delay the how big until arrow press.
- on slide 7, when we shift away from the factory and start to zoom out, the factory move 5-15px vertically up the page. can we prevent that movement. i just want a zoom out. 
- on slide 7, lets change the order slightly. lets leave the boxes hidding initially. after we have finished zooming, an arrow press brings up box 1, another arrow reveals box 2, another arrow the renmainnig boxes, another arrow bring up the 0 downtime , then last arrow to next slidde. 
- on slide seven, when clicking the arrow to zoom out, before the numbers start counting, pleae duplicate the counter in the top right and move it left. it wuld be good to show a comparison. use a fun hoollywood ui spy/mission control annimation to do the duplication.  
- on slide 7, where it says european power grid, please annimatie the text when it arrives. so it doesnt just plop in.

