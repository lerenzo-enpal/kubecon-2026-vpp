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





Website
- Clarify "largest grid" claim: Continental European grid is the largest *synchronously interconnected* system (36 countries, one frequency). China's State Grid is larger by customers (~1.1B) and capacity, but operates as multiple asynchronous regions linked by HVDC. The distinction matters for the VPP/frequency story.




FED
- please screenshot our website http://localhost:4321/learn/how-the-grid-works for yourself. there is too much empty space and there are alignment issues. 
- on the website, please look at the svgs. i wonder if we can optimize them to improve movile responsiveness - lots of white space in them or around them. 

- Balancing the grid in action slide -can we add more realistic recovery scenarios for when i trigger multiple powerplant failures.
-can we add something to agents md that the speaker notes should be a bullets and main ideas, with backup points in case there are questions. it should not a script.  check if it already says that before adding.
- i feel like we need some transtion between slide 19 "clean energy has outgrown the grid" and "consumers become infrastructure" - please recommend something and build it. we are low on time so i cannot provide much feedback
- in the presentatoin, i worry there is a lot of redundent content on slide 9 (this map pannimation) compared to earlier content. i wonder if we can tighten that up and mkae the slide more focused, but i also struggle to know what it is focused on. i lean towards the breadth of the unfrastrcuture.  
- slide267,many fonts too small
 - "consumers become infrastrcuture" title for sldie 20 could be misinterpreted. this audience is very literal. "homes beomcem infrastructure"? 
- Balancing the grid in action slide - the warning text that flashes on the bottom is too small, please incraese by 30% this is the same line that says "automatic load shedding in progress" 
 - on our grid tools slide is too small, both the labels on plants andthe buttom row of the panel that tells what is happening, some sample text is "49.8 — 49.0 Hz Reserves activate. Gas CCGT ramps to max output."
- on the cyber attack. the hacker screen loads then there is qutie a delay before "access granted" is typed, can that be there from the start. my goal is to show the other funny messages sooner.
 - swap slide 12 (balancing the grid is expensive) and 13 (balancing the gird in action). 
  - this slide that says "no flexibiltiy" (slide ~15) should we say "Limited Flexiblity" the abosolte statemnt seems untrue sinc we can always load shed. 
- I would like to make slide 10 focused on balancing, and a new slide 11 focused on tools to balance. lets seperate these two ideas.  Please add a new stop in slide 10 and we will move some content to a new slide 11. to explain frequency balance. after the freuqency part is show with freqnency locked in, add a first arrow that shows too litlte eelectricity and the frenqyey adjusting (i presume dropping) or too much and it increases (i presume) say real big, maybe annimation the freeqnecy using consistent colors with other examples. after too little, then we show the 2.5hz - less than you can here. then go to the next slide. the next slide contains the frenqeuncy shifting examples and annimations currently on slide 10. the titlte of the new slide should be "tools for balancing the grid." after this is done pleace renumber the slides and update the speaker notes. 
- does our website adequalty show the frequency balancing. we speak a lot about how important it is and how to manage it, but i dont think we talk about supply and demand or how it is instaneously ballanced. 
- lets research li-ion battiers works and create a page for our website. First, lets resarch and plan on how to present it in an content accessible way so our younger audience. lets talk about the history and current affordablity trends and upcoming tech, and alternatives to li-ion. I realize there is sa lot of content on this already, but I feel our site would be incomplete without it. perhaps it can be in some other section - both this and how electricity works - like electricity basics. The content is out of scope for the preso, but we can put it in the website. Put a lot of effort thinking of potential interactive elements we could create that we dont already have.
- lets research electricity works and plan a page on how to present it in an content accessible way so our younger audience. think about interactive comonents we could do that we dont already have.
- on slide 2, between the partner logos can we put a little faint cyan pilon like those on our substations. maybe with four
horizontal strokes and no base.
- has the grid really never been down? 
- on slide 7, please delay the how big until arrow press.
- on slide 7, when we shift away from the factory and start to zoom out, the factory move 5-15px vertically up the page. can we prevent that movement. i just want a zoom out. 
- on slide 7, lets change the order slightly. lets leave the boxes hidding initially. after we have finished zooming, an arrow press brings up box 1, another arrow reveals box 2, another arrow the renmainnig boxes, another arrow bring up the 0 downtime , then last arrow to next slidde. 
- on slide seven, when clicking the arrow to zoom out, before the numbers start counting, pleae duplicate the counter in the top right and move it left. it wuld be good to show a comparison. use a fun hoollywood ui spy/mission control annimation to do the duplication.  
- on slide 7, where it says european power grid, please annimatie the text when it arrives. so it doesnt just plop in.

