import React from 'react';
import { Deck, Slide, Notes } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import StepBridge from './components/StepBridge.jsx';
import JapanOpeningSequence from './components/JapanOpeningSequence.jsx';
import PatternSequence from './components/PatternSequence.jsx';
import SolutionSequence from './components/SolutionSequence.jsx';

const bg = 'var(--color-bg)';

const SECTIONS = [
  'Crisis', // 1 Opening sequence (title + grid structure)
  'Pattern', // 2 Pattern sequence (scaling, JEPX, data centers)
  'Pivot', // 3 Grid = distributed system
  'VPP', // 4 Solution sequence (VPP architecture, fault tolerance, GitOps)
  'Close', // 5 Closing
];

const TOTAL_SLIDES = 5;
const FORCED_DARK_SLIDES = new Set([1, 3, 5]);

function template({ slideNumber, numberOfSlides }) {
  const section = SECTIONS[slideNumber - 1] || '';
  const isForcedDark = FORCED_DARK_SLIDES.has(slideNumber);
  const dimColor = isForcedDark ? 'rgba(148, 163, 184, 0.88)' : 'var(--color-dim)';
  const sectionColor = isForcedDark ? 'rgba(241, 245, 249, 0.42)' : 'var(--color-heading)';
  return (
    <>
      <div style={{ position: 'absolute', top: 12, left: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: dimColor, opacity: 1, letterSpacing: '0.15em' }}>LERENZO</div>
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

        {/* 1 — Act 1: Title + Japan grid structure (crisis) */}
        <Slide backgroundColor={bg} padding="0">
            <JapanOpeningSequence presenter={t('keynote.presenter')} />
          <Notes>Welcome. Today we're going to talk about why Japan's electricity grid is becoming a cloud-native problem, and how we solve it with the same patterns you use in distributed systems. This is the Japanese grid. 10 regional utilities running almost completely in isolation. East half runs at 50 Hz, west half at 60 Hz. Only 1.2 GW conversion capacity between them. 15.3% self-sufficiency. 70% fossil fuels. And 97% of the LNG flows through the Strait of Hormuz. One six-week closure added ¥15,000 to every household's annual bill.</Notes>
        </Slide>

        {/* 2 — Act 2: The pattern (scaling demand, JEPX crisis, data center accelerant) */}
        <Slide backgroundColor={bg} padding="0">
          <PatternSequence height={550} />
          <Notes>In January 2021, a cold snap hit Japan. Heating demand spiked. Wind dropped. LNG supply got delayed. All at once. Spot electricity prices didn't climb — they exploded, going from 10 yen per kWh to 251 yen for 40 days. In March 2022, the grid operator issued Japan's first-ever power supply emergency warning — reserve margin hit 2.5% against a 3% safety threshold. Now add 40+ planned data center projects to a grid that's already fragile. Demand is going from 19 TWh today to 57 TWh by 2034 — a 3x increase — and most projects are delayed because the grid can't support them yet.</Notes>
        </Slide>

        {/* 3 — Act 3: Pivot — Grid as distributed system */}
        <Slide backgroundColor="#030508" padding="36px 56px">
          <StepBridge count={2}>
            {(step) => (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: 24 }}>
                <div style={{ fontSize: '56px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9', lineHeight: 1.2, maxWidth: 800 }}>
                  The Grid Is a Distributed System
                </div>
                {step >= 1 && (
                  <div style={{ fontSize: 24, fontFamily: 'Space Grotesk, sans-serif', color: '#3939D8', fontWeight: 600 }}>
                    You already know how to solve this.
                  </div>
                )}
              </div>
            )}
          </StepBridge>
          <Notes>Stop. Think about what we just described. Distributed supply. Unpredictable demand. Coordination at planetary scale. Fault tolerance without redundancy. You solve these problems in software every day. The grid is just another distributed system. And we have the same tools.</Notes>
        </Slide>

        {/* 4 — Act 4: Solution — VPP architecture, fault tolerance, GitOps, teaser */}
        <Slide backgroundColor={bg} padding="0">
          <SolutionSequence height={550} />
          <Notes>No new power plants. No new transmission. No emissions. The assets already exist in Japanese homes. But 100,000 home batteries and EVs are unreliable edge devices — this only works with cloud-native fault tolerance: retries, graceful device loss, eventual consistency. Dapr handles per-device state and failover. OpenTelemetry gives regulators full dispatch auditability. ArgoCD and GitOps give us atomic, reversible, auditable rollouts to grid-critical firmware. Shizen Connect is already aggregating EV fleets in Kansai under Japan's ERAB license — the policy is ready, the technology needs to scale.</Notes>
        </Slide>

        {/* 5 — Closing */}
        <Slide backgroundColor="#030508" padding="0">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: 16 }}>
            <div style={{ fontSize: '88px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#f1f5f9', lineHeight: 1, textShadow: '0 0 60px #f1f5f915' }}>
              100K homes
            </div>
            <div style={{ fontSize: 26, fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8' }}>
              coordinated by software
            </div>
            <div style={{ fontSize: 28, fontFamily: 'Space Grotesk, sans-serif', color: '#3939D8', fontWeight: 700, marginTop: 12 }}>
              = 1 power plant, zero emissions
            </div>
            <div style={{ marginTop: 40, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#64748b', letterSpacing: '0.1em' }}>
              github.com/enpal · whatisavpp.com
            </div>
          </div>
          <Notes>No new power plants. No new transmission. No emissions. Just code, Kubernetes, and the distributed system you already know how to build. The grid is becoming cloud-native. Thank you.</Notes>
        </Slide>

      </Deck>
    </>
  );
}
