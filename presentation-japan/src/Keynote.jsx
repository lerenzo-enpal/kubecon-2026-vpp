import React from 'react';
import { Deck, Slide, Notes, defaultTransition, fadeTransition } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import StepBridge from './components/StepBridge.jsx';
import { JapanGridAtlas } from './components/JapanGridAtlas.jsx';
import { JapanEnergyOrigins } from './components/JapanEnergyOrigins.jsx';
import { JEPXPriceChart } from './components/JEPXPriceChart.jsx';
import VPPTransformationSequence from './components/VPPTransformationSequence.jsx';
import { getJapanMapLayers } from './components/JapanMapLayers.jsx';
import { COLD_SNAP_CAMERA_KEYFRAMES } from './components/japanMapData.mjs';

const bg = 'var(--color-bg)';
const SECTIONS = ['Premise', 'Atlas', 'Energy', 'Hormuz', 'Grid pressure', 'VPP', 'Close'];
const TOTAL_SLIDES = 7;
const FORCED_DARK_SLIDES = new Set([2, 4, 5, 6]);
const keynoteAtlasPreset = (step) => ({ areas: true, transmission: step >= 1, plants: step >= 2, mix: step >= 3 });
const allAtlasLayers = () => ({ areas: true, transmission: true, plants: true, mix: true, demand: true, jepx: true });
const HORMUZ_ROUTE = [[56.3, 26], [56.5, 23.5], [65, 17], [78, 8], [95, 5], [104, 1.5], [114, 10], [128, 22], [139.7, 35.7]];
const HORMUZ_VIEW = { longitude: 98, latitude: 22, zoom: 2.6, pitch: 30, bearing: 0 };
const HORMUZ_FOCUS_VIEW = { longitude: 56.3, latitude: 26.6, zoom: 4.5, pitch: 50, bearing: 18 };
const JAPAN_VIEW = { longitude: 138.25, latitude: 36.2, zoom: 4.5, pitch: 42, bearing: 12 };

function template({ slideNumber }) {
  const section = SECTIONS[slideNumber - 1] || '';
  const isForcedDark = FORCED_DARK_SLIDES.has(slideNumber);
  const dimColor = isForcedDark ? 'color-mix(in srgb, var(--color-washi-paper) 70%, transparent)' : 'var(--color-dim)';
  const sectionColor = isForcedDark ? 'color-mix(in srgb, var(--color-washi-paper) 42%, transparent)' : 'var(--color-heading)';
  return (
    <>
      <div style={{ position: 'absolute', top: 12, left: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: dimColor, letterSpacing: '0.15em' }}>LERENZO</div>
      <div style={{ position: 'absolute', bottom: 12, right: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: dimColor, display: 'flex', gap: 12 }}>
        {section && <span style={{ color: sectionColor }}>{section}</span>}
        <span>{slideNumber} / {TOTAL_SLIDES}</span>
      </div>
    </>
  );
}

export default function Keynote() {
  const { theme, cycleTheme, spectacleTheme } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <>
      <PresentationChrome theme={theme} cycleTheme={cycleTheme} locale={locale} setLocale={setLocale} />
      <Deck theme={spectacleTheme} template={template} transition={defaultTransition} backdropStyle={{ backgroundColor: 'var(--color-washi-paper)' }}>
        <Slide backgroundColor="var(--color-washi-paper)" padding="0">
          <div data-testid="keynote-washi-premise" className="flex h-full flex-col justify-center gap-6 px-14">
            <div className="font-[var(--font-mono)] text-sm tracking-[0.16em] text-[var(--color-washi-alert)]">KUBECON + CLOUDNATIVECON JAPAN · YOKOHAMA</div>
            <h1 className="m-0 max-w-5xl font-[var(--font-heading)] text-6xl font-extrabold leading-tight text-[var(--color-washi-ink)]">The energy grid is becoming a cloud-native distributed system.</h1>
          </div>
          <Notes>- Premise: grid architecture now resembles a cloud-native distributed system. - Japan as the concrete case. - Set up distance, chokepoints, and coordination.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0">
          <StepBridge count={4}>{step => <JapanGridAtlas step={step} preset={keynoteAtlasPreset} />}</StepBridge>
          <Notes>Atlas: start with service regions. Reveal transmission and the 50/60 Hz seam, then representative power stations, then the national generation mix.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0" transition={fadeTransition}>
          <JapanEnergyOrigins />
          <Notes>- Generation mix: METI FY2023. - Reveal imported LNG, oil, then coal. - Distance creates structural exposure before the grid story begins.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0" transition={fadeTransition}>
          <style>{`@keyframes hormuzMapHandoff { to { opacity: 0; } } .hormuz-map-handoff-fade { animation: hormuzMapHandoff 1000ms ease-in-out forwards; }`}</style>
          <div data-testid="hormuz-scene" className="relative h-full"><JapanGridAtlas preset={allAtlasLayers} sceneLayer={{ view: HORMUZ_FOCUS_VIEW }} routeLayer={{ points: HORMUZ_ROUTE, view: HORMUZ_FOCUS_VIEW, targetView: JAPAN_VIEW, duration: 12000, delay: 1000, followShip: true, ship: { mesh: '/models/cargo-ship.obj' } }} /><div data-testid="hormuz-map-fade" className="pointer-events-none absolute inset-0 bg-[var(--color-bg)] map-fade-out" /><div className="pointer-events-none absolute inset-0" data-testid="hormuz-route"><div className="absolute left-8 top-8 max-w-sm border border-[var(--color-accent)]/50 bg-[color-mix(in_srgb,var(--color-bg)_86%,transparent)] p-5"><div className="font-[var(--font-mono)] text-xs tracking-[0.16em] text-[var(--color-accent)]">ENERGY CORRIDOR</div><h1 className="my-2 font-[var(--font-heading)] text-4xl font-extrabold text-[var(--color-heading)]">Strait of Hormuz</h1><p className="m-0 text-lg text-[var(--color-text)]">One route leads through Hormuz. A physical chokepoint becomes a grid risk.</p></div><div data-testid="hormuz-context" className="absolute right-8 top-8 w-80 border-l-4 border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-bg)_86%,transparent)] p-5"><div data-testid="hormuz-context-card"><div className="font-[var(--font-mono)] text-sm tracking-[0.14em] text-[var(--color-danger)]">84.7% IMPORTED</div><div className="mt-2 text-base text-[var(--color-text)]">Japan LNG terminals turn the constrained import route into a grid problem at the coast.</div></div></div><svg data-testid="hormuz-callout-leader" className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M 390 190 L 520 280" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeDasharray="6 6" /></svg></div><div data-testid="hormuz-map-handoff-fade" className="pointer-events-none absolute inset-0 bg-[var(--color-bg)] hormuz-map-handoff-fade" /></div>
          <Notes>- Geographic and energy corridors are schematic. - Reveal the 50/60 Hz seam, LNG routes, then Hormuz. - Keep the consequence grounded in system exposure.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <StepBridge count={4}>{step => <div data-testid="grid-pressure-scene" className="relative h-full"><JapanGridAtlas step={step} preset={keynoteAtlasPreset} sceneLayer={{ view: COLD_SNAP_CAMERA_KEYFRAMES[step]?.camera, getLayers: (tripTime) => getJapanMapLayers({ scene: 'cold-snap', coldSnapStage: step, tripTime }) }} /><div className="pointer-events-none absolute inset-0" data-testid="grid-pressure-atlas"><div className="absolute left-8 top-8 max-w-lg"><div className="font-[var(--font-mono)] text-xs tracking-[0.16em] text-[var(--color-primary)]">ACT II / WINTER DEMAND</div><h1 className="my-2 font-[var(--font-heading)] text-4xl font-extrabold text-[var(--color-heading)]">Grid pressure</h1><p className="m-0 text-lg text-[var(--color-text)]">January 2021: a cold snap made demand peak together.</p></div>{step >= 1 && <aside data-testid="act2-jepx-sidecar" className="absolute right-8 top-8 w-72 border border-[var(--color-danger)]/80 bg-[color-mix(in_srgb,var(--color-bg)_90%,transparent)] p-5"><div className="font-[var(--font-mono)] text-xs tracking-[0.14em] text-[var(--color-danger)]">JAN–FEB 2021 · JEPX</div><div className="mt-2 font-[var(--font-heading)] text-3xl font-bold text-[var(--color-heading)]">25× spike</div><div className="mt-1 text-base text-[var(--color-text)]">10 → 251 yen/kWh for 40 days</div><div data-testid="act2-jepx-chart" className="mt-3"><JEPXPriceChart height={150} /></div></aside>}{step >= 2 && <div data-testid="act2-demand-card" className="absolute bottom-8 left-8 w-80 border-l-4 border-[var(--color-danger)] bg-[color-mix(in_srgb,var(--color-bg)_90%,transparent)] p-5 text-base text-[var(--color-text)]"><div className="font-[var(--font-mono)] text-xs tracking-[0.14em] text-[var(--color-danger)]">DEMAND CASCADE ACTIVE</div><div className="mt-2">Regional constraints spread the pressure across the system.</div></div>}{step >= 2 && <div data-testid="act2-cold-snap-route" className="sr-only">Cold-snap grid flow</div>}{step >= 2 && <div data-testid="act2-cold-snap-buildings" className="sr-only">cold-snap-city-buildings</div>}{step >= 4 && <div data-testid="act2-cold-snap-transmission" className="sr-only">cold-snap-regional-transmission</div>}</div></div>}</StepBridge>
          <Notes>In January 2021, a cold snap hit Japan. Heating demand spiked. Wind dropped. LNG supply got delayed. All at once. Spot electricity prices didn't climb — they exploded, going from 10 yen per kWh to 251 yen for 40 days. In March 2022, the grid operator issued Japan's first-ever power supply emergency warning — reserve margin hit 2.5% against a 3% safety threshold. Now add 40+ planned data center projects to a grid that's already fragile. Demand is going from 19 TWh today to 57 TWh by 2034 — a 3x increase — and most projects are delayed because the grid can't support them yet.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <VPPTransformationSequence />
          <Notes>Pause: the grid is a distributed system. Reveal the graph under uneven load; this is a familiar problem. As it becomes a city, name the lived consequence: a graph is a city, under load. Pull back to Japan: homes, generators, and hubs are the same graph with geography. Add the superpowers: connected devices respond fast, batteries store energy, and coordination uses it smarter. Let the network settle, then advance to the 100K homes closing statement.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0">
          <style>{`@keyframes keynoteClosingFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } } @keyframes keynoteClosingPulse { 0%, 100% { opacity: .78; } 50% { opacity: 1; } } .keynote-closing-asset { animation: keynoteClosingFloat 3.4s ease-in-out infinite, keynoteClosingPulse 3.4s ease-in-out infinite; }`}</style>
          <div data-testid="keynote-washi-close" className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="font-[var(--font-mono)] text-7xl font-extrabold leading-none text-[var(--color-washi-ink)]">100K DEVICES</div>
            <div className="flex items-end justify-center gap-8" aria-label="Distributed energy assets">
              <div className="keynote-closing-asset flex flex-col items-center gap-1" style={{ animationDelay: '0ms' }}>
                <svg role="img" aria-label="Home" viewBox="0 0 96 76" className="h-16 w-20 fill-none stroke-[var(--color-washi-ink)] stroke-[3]">
                  <path d="M12 38 48 10l36 28v27H12Z" fill="var(--color-washi-ink)" opacity=".12" /><path d="M12 38 48 10l36 28M18 34v31h60V34M40 65V45h16v20" /><path d="M29 45h5M62 45h5" stroke="var(--color-washi-solar)" strokeWidth="5" />
                </svg>
                <span className="font-[var(--font-mono)] text-xs tracking-[0.14em] text-[var(--color-washi-ink)]">HOME</span>
              </div>
              <div className="keynote-closing-asset flex flex-col items-center gap-1" style={{ animationDelay: '220ms' }}>
                <svg role="img" aria-label="Solar panel" viewBox="0 0 96 76" className="h-16 w-20 fill-none stroke-[var(--color-washi-ink)] stroke-[3]">
                  <path d="M18 18h60l-8 36H26Z" fill="var(--color-washi-solar)" opacity=".38" /><path d="M18 18h60l-8 36H26ZM31 30h42M28 42h42M39 18l-5 36M58 18l-5 36M48 54v12M35 66h26" />
                </svg>
                <span className="font-[var(--font-mono)] text-xs tracking-[0.14em] text-[var(--color-washi-ink)]">SOLAR</span>
              </div>
              <div className="keynote-closing-asset flex flex-col items-center gap-1" style={{ animationDelay: '440ms' }}>
                <svg role="img" aria-label="EV" viewBox="0 0 96 76" className="h-16 w-20 fill-none stroke-[var(--color-washi-ink)] stroke-[3]">
                  <path d="M17 49h62v13H17Z" fill="var(--color-washi-alert)" opacity=".25" /><path d="m27 49 9-17h25l10 17M17 49h62v13H17ZM28 62a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm40 0a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM42 39h15" />
                </svg>
                <span className="font-[var(--font-mono)] text-xs tracking-[0.14em] text-[var(--color-washi-ink)]">EV</span>
              </div>
              <div className="keynote-closing-asset flex flex-col items-center gap-1" style={{ animationDelay: '660ms' }}>
                <svg role="img" aria-label="Battery" viewBox="0 0 96 76" className="h-16 w-20 fill-none stroke-[var(--color-washi-ink)] stroke-[3]">
                  <rect x="25" y="12" width="46" height="55" rx="5" fill="var(--color-washi-ink)" opacity=".12" /><path d="M35 12V7h26v5M25 12h46v55H25Z" /><path d="M48 23v29M36 37h24" stroke="var(--color-washi-solar)" strokeWidth="5" />
                </svg>
                <span className="font-[var(--font-mono)] text-xs tracking-[0.14em] text-[var(--color-washi-ink)]">BATTERY</span>
              </div>
            </div>
            <div className="font-[var(--font-heading)] text-3xl text-[var(--color-washi-ink)]">coordinated by software</div>
            <div className="mt-3 font-[var(--font-heading)] text-3xl font-bold text-[var(--color-washi-solar)]">= 1 power plant, zero emissions</div>
            <div className="mt-10 font-[var(--font-mono)] text-sm tracking-widest text-[var(--color-washi-ink)]">github.com/enpal · whatisavpp.com</div>
          </div>
          <Notes>No new power plants. No new transmission. No emissions. Just code, Kubernetes, and the distributed system you already know how to build. The grid is becoming cloud-native. Thank you.</Notes>
        </Slide>
      </Deck>
    </>
  );
}
