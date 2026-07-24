import React from 'react';
import { Deck, Slide, Notes } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import StepBridge from './components/StepBridge.jsx';
import { JapanGridAtlas } from './components/JapanGridAtlas.jsx';
import { JapanEnergyOrigins } from './components/JapanEnergyOrigins.jsx';
import JapanOpeningSequence from './components/JapanOpeningSequence.jsx';
import PatternSequence from './components/PatternSequence.jsx';
import VPPTransformationSequence from './components/VPPTransformationSequence.jsx';

const bg = 'var(--color-bg)';
const SECTIONS = ['Premise', 'Energy', 'Hormuz', 'Atlas', 'Pattern', 'VPP', 'Close'];
const TOTAL_SLIDES = 7;
const FORCED_DARK_SLIDES = new Set([3, 5, 6]);
const keynoteAtlasPreset = (step) => ({ areas: true, transmission: step >= 1, plants: step >= 2, mix: step >= 3 });

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
      <Deck theme={spectacleTheme} template={template}>
        <Slide backgroundColor="var(--color-washi-paper)" padding="0">
          <div data-testid="keynote-washi-premise" className="flex h-full flex-col justify-center gap-6 px-14">
            <div className="font-[var(--font-mono)] text-sm tracking-[0.16em] text-[var(--color-washi-alert)]">KUBECON + CLOUDNATIVECON JAPAN · YOKOHAMA</div>
            <h1 className="m-0 max-w-5xl font-[var(--font-heading)] text-6xl font-extrabold leading-tight text-[var(--color-washi-ink)]">The energy grid is becoming a cloud-native distributed system.</h1>
          </div>
          <Notes>- Premise: grid architecture now resembles a cloud-native distributed system. - Japan as the concrete case. - Set up distance, chokepoints, and coordination.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0">
          <JapanEnergyOrigins />
          <Notes>- Generation mix: METI FY2023. - Reveal imported LNG, oil, then coal. - Distance creates structural exposure before the grid story begins.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <JapanOpeningSequence startAtMap />
          <Notes>- Geographic and energy corridors are schematic. - Reveal the 50/60 Hz seam, LNG routes, then Hormuz. - Keep the consequence grounded in system exposure.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <StepBridge count={4}>{step => <JapanGridAtlas step={step} preset={keynoteAtlasPreset} />}</StepBridge>
          <Notes>Atlas: start with service regions. Reveal transmission and the 50/60 Hz seam, then representative power stations, then the national generation mix. The icon HUD is available for exploration; live demand and JEPX controls remain visibly unavailable until a browser-safe public feed is verified.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <PatternSequence />
          <Notes>In January 2021, a cold snap hit Japan. Heating demand spiked. Wind dropped. LNG supply got delayed. All at once. Spot electricity prices didn't climb — they exploded, going from 10 yen per kWh to 251 yen for 40 days. In March 2022, the grid operator issued Japan's first-ever power supply emergency warning — reserve margin hit 2.5% against a 3% safety threshold. Now add 40+ planned data center projects to a grid that's already fragile. Demand is going from 19 TWh today to 57 TWh by 2034 — a 3x increase — and most projects are delayed because the grid can't support them yet.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <VPPTransformationSequence />
          <Notes>Pause: the grid is a distributed system. Reveal the graph under uneven load; this is a familiar problem. As it becomes a city, name the lived consequence: a graph is a city, under load. Pull back to Japan: homes, generators, and hubs are the same graph with geography. Add the superpowers: connected devices respond fast, batteries store energy, and coordination uses it smarter. Let the network settle, then advance to the 100K homes closing statement.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0">
          <div data-testid="keynote-washi-close" className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="font-[var(--font-mono)] text-7xl font-extrabold leading-none text-[var(--color-washi-ink)]">100K HOMES</div>
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
