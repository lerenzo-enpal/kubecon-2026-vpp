import React from 'react';
import { Deck, Slide, Notes } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import StepBridge from './components/StepBridge.jsx';
import { JapanGridAtlas } from './components/JapanGridAtlas.jsx';
import JapanOpeningSequence from './components/JapanOpeningSequence.jsx';
import PatternSequence from './components/PatternSequence.jsx';
import VPPTransformationSequence from './components/VPPTransformationSequence.jsx';

const bg = 'var(--color-bg)';
const SECTIONS = ['Crisis', 'Atlas', 'Pattern', 'VPP', 'Close'];
const TOTAL_SLIDES = 5;
const FORCED_DARK_SLIDES = new Set([1, 2, 4, 5]);
const keynoteAtlasPreset = (step) => ({ areas: true, transmission: step >= 1, plants: step >= 2, mix: step >= 3 });

function template({ slideNumber }) {
  const section = SECTIONS[slideNumber - 1] || '';
  const isForcedDark = FORCED_DARK_SLIDES.has(slideNumber);
  const dimColor = isForcedDark ? 'rgba(148, 163, 184, 0.88)' : 'var(--color-dim)';
  const sectionColor = isForcedDark ? 'rgba(241, 245, 249, 0.42)' : 'var(--color-heading)';
  return (
    <>
      <div style={{ position: 'absolute', top: 12, left: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: dimColor, letterSpacing: '0.15em' }}>LERENZO</div>
      <div style={{ position: 'absolute', bottom: 12, right: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: dimColor, display: 'flex', gap: 12 }}>
        {section && <span style={{ color: sectionColor }}>{section}</span>}
        <span>{slideNumber} / {TOTAL_SLIDES}</span>
      </div>
    </>
  );
}

export default function Keynote() {
  const { theme, cycleTheme, spectacleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <>
      <PresentationChrome theme={theme} cycleTheme={cycleTheme} locale={locale} setLocale={setLocale} />
      <Deck theme={spectacleTheme} template={template}>
        <Slide backgroundColor={bg} padding="0">
          <JapanOpeningSequence presenter={t('keynote.presenter')} />
          <Notes>Welcome. Today we're going to talk about why Japan's electricity grid is becoming a cloud-native problem, and how we solve it with the same patterns you use in distributed systems. This is the Japanese grid. 10 regional utilities running almost completely in isolation. East half runs at 50 Hz, west half at 60 Hz. Only 1.2 GW conversion capacity between them. 15.3% self-sufficiency. 70% fossil fuels. And 97% of the LNG flows through the Strait of Hormuz. One six-week closure added ¥15,000 to every household's annual bill.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <StepBridge count={4}>{step => <JapanGridAtlas step={step} preset={keynoteAtlasPreset} />}</StepBridge>
          <Notes>Atlas: start with service regions. Reveal transmission and the 50/60 Hz seam, then representative power stations, then the national generation mix. The icon HUD is available for exploration; live demand and JEPX controls remain visibly unavailable until a browser-safe public feed is verified.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <PatternSequence />
          <Notes>In January 2021, a cold snap hit Japan. Heating demand spiked. Wind dropped. LNG supply got delayed. All at once. Spot electricity prices didn't climb — they exploded, going from 10 yen per kWh to 251 yen for 40 days. In March 2022, the grid operator issued Japan's first-ever power supply emergency warning — reserve margin hit 2.5% against a 3% safety threshold. Now add 40+ planned data center projects to a grid that's already fragile. Demand is going from 19 TWh today to 57 TWh by 2034 — a 3x increase — and most projects are delayed because the grid can't support them yet.</Notes>
        </Slide>

        <Slide backgroundColor="#030508" padding="0">
          <VPPTransformationSequence />
          <Notes>Pause: the grid is a distributed system. Reveal the graph under uneven load; this is a familiar problem. As it becomes a city, name the lived consequence: a graph is a city, under load. Pull back to Japan: homes, generators, and hubs are the same graph with geography. Add the superpowers: connected devices respond fast, batteries store energy, and coordination uses it smarter. Let the network settle, then advance to the 100K homes closing statement.</Notes>
        </Slide>

        <Slide backgroundColor="#030508" padding="0">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: 16 }}>
            <div style={{ fontSize: '88px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#f1f5f9', lineHeight: 1, textShadow: '0 0 60px #f1f5f915' }}>100K homes</div>
            <div style={{ fontSize: 26, fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8' }}>coordinated by software</div>
            <div style={{ fontSize: 28, fontFamily: 'Space Grotesk, sans-serif', color: '#3939D8', fontWeight: 700, marginTop: 12 }}>= 1 power plant, zero emissions</div>
            <div style={{ marginTop: 40, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#64748b', letterSpacing: '0.1em' }}>github.com/enpal · whatisavpp.com</div>
          </div>
          <Notes>No new power plants. No new transmission. No emissions. Just code, Kubernetes, and the distributed system you already know how to build. The grid is becoming cloud-native. Thank you.</Notes>
        </Slide>
      </Deck>
    </>
  );
}
