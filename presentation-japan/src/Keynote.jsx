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
import { SlideTitle } from './components/SlideTitle.jsx';
import { AtlasLegend } from './components/AtlasLegend.jsx';
import JapanColdSnapCascade from './components/JapanColdSnapCascade.jsx';

const bg = 'var(--color-bg)';
const SECTIONS = ['Premise', 'Atlas', 'Energy', 'Hormuz', 'Grid pressure', 'VPP', 'Close'];
const TOTAL_SLIDES = 7;
const FORCED_DARK_SLIDES = new Set([2, 4, 5, 6]);
const allAtlasLayers = () => ({ areas: true, transmission: true, plants: true, mix: true, demand: true, jepx: true });
const atlasSlidePreset = (step) => ({
  areas: true,
  transmission: true,
  plants: step === 1 ? 'east' : step === 2 ? 'west' : step >= 3 ? true : false,
  mix: false,
});
const ATLAS_KEYFRAMES = [
  { longitude: 136.7, latitude: 36.3, zoom: 4.65, pitch: 25, bearing: 5 },
  { longitude: 140.0, latitude: 37.6, zoom: 5.3, pitch: 30, bearing: 5 },
  { longitude: 133.4, latitude: 34.6, zoom: 5.3, pitch: 30, bearing: 5 },
  { longitude: 136.7, latitude: 36.3, zoom: 4.65, pitch: 25, bearing: 5 },
];
const ATLAS_STEP_COPY = [
  { eyebrow: 'ACT I / JAPAN’S GRID', title: 'Two grids, one country', subtitle: '50 Hz east, 60 Hz west — split at the Shizuoka seam.' },
  { eyebrow: 'ACT I / EAST 50 Hz', title: 'Where Tokyo draws power', subtitle: 'Nuclear, LNG, coal along the Pacific coast — TEPCO, Tohoku EP, JERA.' },
  { eyebrow: 'ACT I / WEST 60 Hz', title: 'Kansai and Kyushu', subtitle: 'KEPCO, Kyuden, Chugoku EP — nuclear + LNG feeding the west.' },
  { eyebrow: 'ACT I / JAPAN’S GRID', title: 'Two grids, one country', subtitle: 'Every fuel, every operator — one atlas.' },
];
const HORMUZ_ROUTE = [[56.3, 26], [56.5, 23.5], [65, 17], [78, 8], [95, 5], [104, 1.5], [114, 10], [128, 22], [139.7, 35.7]];
const HORMUZ_VIEW = { longitude: 98, latitude: 22, zoom: 2.6, pitch: 30, bearing: 0 };
const HORMUZ_FOCUS_VIEW = { longitude: 56.3, latitude: 26.6, zoom: 4.5, pitch: 50, bearing: 18 };
const JAPAN_VIEW = { longitude: 139.75, latitude: 35.5, zoom: 6.4, pitch: 46, bearing: 14 };

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
          <StepBridge count={3}>{rawStep => {
            const step = Math.min(Math.max(0, rawStep | 0), ATLAS_STEP_COPY.length - 1);
            const copy = ATLAS_STEP_COPY[step];
            return (
            <div data-testid="keynote-atlas-scene" className="relative h-full">
              <JapanGridAtlas step={step} preset={atlasSlidePreset} sceneLayer={{ view: ATLAS_KEYFRAMES[step] }} />
              <div className="pointer-events-none absolute inset-0">
                <SlideTitle
                  testId="keynote-atlas-title"
                  eyebrow={copy.eyebrow}
                  title={copy.title}
                  subtitle={copy.subtitle}
                />
                <AtlasLegend />
              </div>
            </div>
            );
          }}</StepBridge>
          <Notes>Step 1: whole country, service regions and transmission — reveal the 50/60 Hz split. Step 2: zoom east — nuclear + LNG + coal along the Pacific coast (TEPCO, Tohoku EP, JERA). Step 3: pan west — KEPCO, Kyuden, Chugoku EP feeding Kansai and Kyushu. Step 4: zoom out — every fuel, every operator, one atlas.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0" transition={fadeTransition}>
          <JapanEnergyOrigins />
          <Notes>- Generation mix: METI FY2023. - Reveal imported LNG, oil, then coal. - Distance creates structural exposure before the grid story begins.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0" transition={fadeTransition}>
          <div data-testid="hormuz-scene" className="relative h-full" style={{ background: 'var(--color-washi-paper)' }}>
            <div className="absolute inset-0" style={{ filter: 'invert(0.92) hue-rotate(190deg) sepia(0.42) saturate(0.55) brightness(1.04) contrast(0.92)' }}>
              <JapanGridAtlas preset={allAtlasLayers} sceneLayer={{ view: HORMUZ_FOCUS_VIEW }} routeLayer={{ points: HORMUZ_ROUTE, view: HORMUZ_FOCUS_VIEW, targetView: JAPAN_VIEW, duration: 12000, delay: 1000, followShip: true, ship: { mesh: '/models/cargo-ship.obj' } }} />
            </div>
            <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--color-washi-paper)', opacity: 0.18, mixBlendMode: 'multiply' }} />
            <div className="pointer-events-none absolute inset-0" data-testid="hormuz-route">
              <div style={{ position: 'absolute', zIndex: 2, top: 44, left: 48, maxWidth: 460 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.16em', color: 'var(--color-washi-solar)' }}>ENERGY CORRIDOR</div>
                <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)', margin: '8px 0 0 0' }}>Strait of Hormuz</h1>
                <p style={{ margin: '10px 0 0 0', color: 'var(--color-washi-ink)', fontFamily: 'var(--font-body, inherit)', fontSize: 18, lineHeight: 1.4 }}>One route leads through Hormuz. A physical chokepoint becomes a grid risk.</p>
              </div>
              <div data-testid="hormuz-context" style={{ position: 'absolute', zIndex: 2, right: 32, top: 44, width: 320, borderLeft: '4px solid var(--color-washi-solar)', background: 'color-mix(in srgb, var(--color-washi-paper) 92%, transparent)', padding: 20, boxShadow: '0 6px 24px -12px rgba(23,37,84,0.35)' }}>
                <div data-testid="hormuz-context-card">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.14em', color: 'var(--color-washi-solar)' }}>84.7% IMPORTED</div>
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-body, inherit)', fontSize: 15, lineHeight: 1.45, color: 'var(--color-washi-ink)' }}>Japan LNG terminals turn the constrained import route into a grid problem at the coast.</div>
                </div>
              </div>
              <svg data-testid="hormuz-callout-leader" className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M 390 190 L 520 280" fill="none" stroke="var(--color-washi-solar)" strokeWidth="2" strokeDasharray="6 6" /></svg>
            </div>
          </div>
          <Notes>- Geographic and energy corridors are schematic. - Reveal the 50/60 Hz seam, LNG routes, then Hormuz. - Keep the consequence grounded in system exposure.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0" transition={fadeTransition}>
          <StepBridge count={10}>{step => {
            const cascadeActive = step >= 1;
            return (
              <div data-testid="grid-pressure-scene" className="relative h-full">
                <div className="absolute inset-0" style={{ opacity: cascadeActive ? 1 : 0, transition: 'opacity 900ms ease-in-out' }}>
                  <JapanColdSnapCascade step={step} />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{ background: 'var(--color-washi-paper)', opacity: cascadeActive ? 0 : 1, transition: 'opacity 900ms ease-in-out' }}
                >
                  <div style={{ position: 'absolute', zIndex: 2, top: 44, left: 48, maxWidth: 640 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.16em', color: 'var(--color-washi-solar)' }}>ACT II · MARCH 2022</div>
                    <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)', margin: '8px 0 0 0' }}>Quake, then cold.</h1>
                    <p style={{ margin: '10px 0 0 0', color: 'var(--color-washi-ink)', fontFamily: 'var(--font-body, inherit)', fontSize: 18, lineHeight: 1.4 }}>A 60-second sequence that nearly broke Tokyo's grid.</p>
                  </div>
                </div>
              </div>
            );
          }}</StepBridge>
          <Notes>Step 0: title card — "Quake, then cold" on washi paper. Advance to drop into the dark grid. Step 1: HUD boots — OCCTO grid monitor, dual 50/60 Hz readouts, reserve margin. Step 2 (MAR 16 23:36): M7.4 quake off Fukushima — Onagawa, Higashidori, Hitachinaka, Kashima trip. Step 3 (MAR 17): 6.5 GW east-coast thermal offline, restarts delayed. Step 4 (MAR 21): Arctic front sweeps in from Hokkaido, heating demand jumps 15%. Step 5 (MAR 22 morning): overcast + still air kills wind and solar. Step 6: 50/60 Hz frequency converter maxes out at 2.1 GW — the west can't rescue the east fast enough. Step 7 (MAR 22 11:00): METI issues Japan's first-ever power supply emergency warning — reserve margin 2.5% against a 3% threshold. Step 8: public conservation call goes out, JEPX spot spikes, memory of Jan 2021 (10→251 yen/kWh for 40 days) reopens. Step 9: blackout averted, but every winter now carries this shape — and 40+ planned data centers are lining up behind it.</Notes>
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
