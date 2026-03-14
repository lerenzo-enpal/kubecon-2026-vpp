import React from 'react';
import { Deck, Slide, Heading, Text } from 'spectacle';
import { colors } from './theme';
import FrequencyLine from './components/FrequencyLine';
import FrequencyDemo from './components/FrequencyDemo';
import CascadeSimulation from './components/CascadeSimulation';
import TexasCascade from './components/TexasCascade';
import RenewableGrowthChart from './components/RenewableGrowthChart';
import DuckCurveChart from './components/DuckCurveChart';
import AnimatedStat from './components/AnimatedStat';
import StaticTexasGrid from './components/StaticTexasGrid';
import KeplerDashboard from './components/KeplerDashboard';
import CarbonAwareChart from './components/CarbonAwareChart';
import TexasMapGL from './components/TexasMapGL';

const theme = {
  colors: { primary: colors.text, secondary: colors.textMuted, tertiary: colors.primary },
  fonts: { header: '"Inter", system-ui, sans-serif', text: '"Inter", system-ui, sans-serif' },
};

const bg = colors.bg;
const pad = '36px 56px';

// Section ranges (slide numbers are 1-indexed)
const SECTIONS = [
  { from: 1, to: 2, name: '' },
  { from: 3, to: 11, name: 'The Grid' },
  { from: 12, to: 17, name: 'The Renewable Revolution' },
  { from: 18, to: 25, name: 'The Virtual Power Plant' },
  { from: 26, to: 31, name: 'Resilience' },
];

const slideTemplate = ({ slideNumber, numberOfSlides }) => {
  const section = SECTIONS.find(s => slideNumber >= s.from && slideNumber <= s.to);
  const label = section?.name;
  return (
    <div style={{
      position: 'absolute', bottom: 12, right: 20,
      fontSize: '11px', fontFamily: '"JetBrains Mono", monospace',
      color: colors.textDim + '60', display: 'flex', gap: 8, alignItems: 'center',
    }}>
      {label && <span style={{ color: colors.textDim + '40' }}>{label}</span>}
      <span>{slideNumber} / {numberOfSlides}</span>
    </div>
  );
};

// Consistent heading style
const H = ({ children, color = colors.primary, size = '40px', center = false }) => (
  <div style={{ fontSize: size, fontWeight: 800, color, fontFamily: '"Inter"', textShadow: `0 0 40px ${color}35`, lineHeight: 1.15, marginBottom: 8, textAlign: center ? 'center' : 'left' }}>{children}</div>
);
const P = ({ children, color = colors.textMuted, size = '18px', center = false, style = {} }) => (
  <div style={{ fontSize: size, color, fontFamily: '"Inter"', lineHeight: 1.5, marginBottom: 10, textAlign: center ? 'center' : 'left', ...style }}>{children}</div>
);
const Badge = ({ children, color }) => (
  <div style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 14, fontSize: '11px', fontWeight: 600, fontFamily: '"JetBrains Mono"', background: `${color}18`, color, border: `1px solid ${color}30`, marginBottom: 8 }}>{children}</div>
);
const StatBox = ({ n, l, c }) => (
  <div style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 10, padding: '18px 14px', textAlign: 'center', flex: 1 }}>
    <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: c, textShadow: `0 0 20px ${c}25` }}>{n}</div>
    <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: 4, fontFamily: '"Inter"', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{l}</div>
  </div>
);

export default function Presentation() {
  return (
    <Deck theme={theme} template={slideTemplate}>

      {/* 0: Title Slide */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '-10%', right: '-15%', width: '80%', height: '120%', pointerEvents: 'none' }}>
            <StaticTexasGrid width={700} height={700} opacity={0.12} />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 32 }}>KubeCon + CloudNativeCon Europe 2026</div>
            <div style={{ fontSize: '56px', fontWeight: 800, color: colors.primary, fontFamily: '"Inter"', textShadow: `0 0 60px ${colors.primary}30`, lineHeight: 1.1, marginBottom: 20 }}>
              What is a Virtual<br />Power Plant?
            </div>
            <div style={{ fontSize: '22px', color: colors.textMuted, fontFamily: '"Inter"', marginBottom: 48 }}>
              Cloud-Native Infrastructure for the Energy Grid
            </div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg, ${colors.primary}30, ${colors.success}30)`, border: `1px solid ${colors.surfaceLight}` }} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '18px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>Enpal</div>
                <div style={{ fontSize: '14px', color: colors.textMuted, fontFamily: '"Inter"' }}>Building Europe's Largest Virtual Power Plant</div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* 1: Agenda */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <H size="36px">Agenda</H>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 24 }}>
            {[
              { num: '01', title: 'The Grid', sub: 'How the world\'s largest machine works — and how it fails', color: colors.danger, time: '~10 min' },
              { num: '02', title: 'The Renewable Revolution', sub: 'Why cheap clean energy creates expensive new problems', color: colors.accent, time: '~7 min' },
              { num: '03', title: 'The Virtual Power Plant', sub: 'Software that turns millions of devices into grid infrastructure', color: colors.primary, time: '~10 min' },
              { num: '04', title: 'Resilience', sub: 'What the future grid looks like — and why you already know how to build it', color: colors.success, time: '~3 min' },
            ].map(s => (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.color, minWidth: 48, textAlign: 'right' }}>{s.num}</div>
                <div style={{ borderLeft: `2px solid ${s.color}40`, paddingLeft: 20, flex: 1 }}>
                  <div style={{ fontSize: '22px', fontWeight: 700, color: colors.text, fontFamily: '"Inter"' }}>{s.title}</div>
                  <div style={{ fontSize: '14px', color: colors.textMuted, fontFamily: '"Inter"', marginTop: 2 }}>{s.sub}</div>
                </div>
                <div style={{ fontSize: '12px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* ═══════ ACT 1: THE GRID ═══════ */}

      {/* Section Title: The Grid */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.danger, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Part I</div>
          <H size="54px" center color={colors.danger}>The Grid</H>
          <P size="20px" center>The world's largest machine — and why it keeps failing</P>
        </div>
      </Slide>

      {/* Texas Cascade */}
      <Slide backgroundColor="#050810" padding="0">
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px' }}>
            <Badge color={colors.danger}>FEB 15, 2021</Badge>
            <div style={{ fontSize: '16px', fontWeight: 700, color: colors.danger, fontFamily: '"Inter"' }}>Winter Storm Uri — Cascading Grid Failure</div>
          </div>
          <div style={{ flex: 1, position: 'relative' }}>
            <TexasCascade width={1024} height={620} />
          </div>
        </div>
      </Slide>

      {/* 2: Texas Numbers */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
          <div style={{ padding: '20px 0 16px', borderLeft: `3px solid ${colors.danger}`, paddingLeft: 24 }}>
            <div style={{ fontSize: '28px', fontWeight: 300, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.6 }}>
              "The Texas grid was <span style={{ color: colors.danger, fontWeight: 700 }}>4 minutes and 37 seconds</span> from total collapse."
            </div>
            <div style={{ fontSize: '16px', color: colors.textDim, fontFamily: '"Inter"', marginTop: 8 }}>
              A cold restart would have taken weeks. Maybe months.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20, margin: '16px 0' }}>
            <AnimatedStat target="4:37" label="from total collapse" color={colors.danger} delay={0} duration={1200} />
            <AnimatedStat target="246" label="people dead" color={colors.danger} delay={300} duration={1000} />
            <AnimatedStat target="$195B" label="in damage" color={colors.accent} delay={600} duration={1400} />
            <AnimatedStat target="4.5M" label="homes dark" color={colors.textMuted} delay={900} duration={1100} />
          </div>
          <div style={{ fontSize: '19px', color: colors.text, fontFamily: '"Inter"', lineHeight: 1.8 }}>
            Wholesale electricity spiked to <span style={{ color: colors.danger, fontWeight: 600 }}>$9,000/MWh</span> — a <span style={{ color: colors.danger, fontWeight: 600 }}>180x</span> increase.
            <br />Families received <span style={{ color: colors.danger, fontWeight: 600 }}>$7,000 bills</span> in a single week. Their provider — Griddy — went bankrupt.
          </div>
          <div style={{ paddingTop: 14, borderTop: `1px solid ${colors.surfaceLight}` }}>
            <div style={{ fontSize: '20px', color: colors.primary, fontFamily: '"Inter"', fontWeight: 500 }}>
              How did the most energy-rich state in America come this close to total infrastructure failure?
            </div>
          </div>
        </div>
      </Slide>

      {/* 3: Why Texas Failed */}
      <Slide backgroundColor={bg} padding={pad}>
        <H color={colors.danger}>Why Texas Failed</H>
        <P>The gas-electric death spiral — a cascading feedback loop.</P>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
          {[
            { text: 'Extreme cold hits Texas', color: colors.primary, icon: '1' },
            { text: 'Generators freeze and trip offline', color: colors.accent, icon: '2' },
            { text: 'ERCOT orders emergency load shedding', color: colors.accent, icon: '3' },
            { text: 'Load shedding cuts power to gas compressors & pipelines', color: colors.danger, icon: '4' },
            { text: 'Gas supply drops — more generators lose fuel and trip', color: colors.danger, icon: '5' },
            { text: 'More load shedding needed — cycle accelerates', color: colors.danger, icon: '\u21bb' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: `${step.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 800, color: step.color, fontFamily: '"JetBrains Mono"', flexShrink: 0 }}>{step.icon}</div>
              <div style={{ fontSize: '15px', color: colors.text, fontFamily: '"Inter"', fontWeight: i >= 3 ? 600 : 400 }}>{step.text}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
          <StatBox n="52,000 MW" l="offline (of 107K total)" c={colors.danger} />
          <StatBox n="Isolated" l="no grid interconnection" c={colors.accent} />
          <StatBox n="42 hrs" l="average outage duration" c={colors.textMuted} />
        </div>
      </Slide>

      {/* 4: Frequency Demo */}
      <Slide backgroundColor={bg} padding="24px 40px">
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <H>The Grid: A Balancing Act</H>
          <P size="15px">Supply and demand must match every second. Click the scenarios to see what happens when they don't.</P>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FrequencyDemo width={900} height={340} />
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <StatBox n="60.000 Hz" l="US Target (50 Hz in EU)" c={colors.primary} />
            <StatBox n="107 GW" l="ERCOT Total Capacity" c={colors.secondary} />
            <StatBox n="0 buffer" l="No Grid Storage" c={colors.accent} />
          </div>
        </div>
      </Slide>

      {/* 5: How Grid Was Built */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>Designed for a Different World</H>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '24px 0' }}>
          {[
            { l: 'Power Plants', s: 'Few, large', c: colors.accent },
            { l: 'Transmission', s: 'High voltage', c: colors.secondary },
            { l: 'Distribution', s: 'One-way', c: colors.primary },
            { l: 'Homes', s: 'Passive', c: colors.textDim },
          ].map((x, i) => (
            <React.Fragment key={i}>
              <div style={{ background: colors.surface, border: `1px solid ${x.c}30`, borderRadius: 10, padding: '20px 16px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>{x.l}</div>
                <div style={{ fontSize: '13px', color: colors.textMuted, fontFamily: '"Inter"', marginTop: 4 }}>{x.s}</div>
              </div>
              {i < 3 && <div style={{ fontSize: '20px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>}
            </React.Fragment>
          ))}
        </div>
        <P size="20px" style={{ fontStyle: 'italic', marginTop: 12 }}>"Built in the 1950s. One-directional. No flexibility."</P>
      </Slide>

      {/* 6: It Keeps Happening */}
      <Slide backgroundColor={bg} padding={pad}>
        <H color={colors.danger}>It Keeps Happening</H>
        <div style={{ display: 'flex', gap: 40, marginTop: 16 }}>
          <div style={{ flex: 1 }}>
            {[
              { y: '2003', e: 'Italy Blackout', i: '56M people' },
              { y: '2006', e: 'European Grid Split', i: '15M affected' },
              { y: '2016', e: 'South Australia', i: 'Entire state' },
              { y: '2021', e: 'Texas ERCOT', i: '4.5M homes, 240+ deaths' },
            ].map(t => (
              <div key={t.y+t.e} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <div style={{ fontFamily: '"JetBrains Mono"', fontSize: '15px', fontWeight: 700, color: colors.danger, minWidth: 46 }}>{t.y}</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>{t.e}</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, fontFamily: '"Inter"' }}>{t.i}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1 }}>
            {[
              { y: '2021', e: 'Europe Grid Split', i: '1.25 Hz from collapse', c: colors.danger },
              { y: '2025', e: 'Spain/Portugal', i: '60M people', c: colors.accent },
              { y: '2025', e: 'Berlin Arson (x3)', i: '45K+ homes', c: colors.accent },
              { y: '2026', e: 'Berlin Teltow Canal', i: '4-day outage', c: colors.primary },
            ].map(t => (
              <div key={t.y+t.e} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <div style={{ fontFamily: '"JetBrains Mono"', fontSize: '15px', fontWeight: 700, color: t.c || colors.danger, minWidth: 46 }}>{t.y}</div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>{t.e}</div>
                  <div style={{ fontSize: '13px', color: colors.textMuted, fontFamily: '"Inter"' }}>{t.i}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* 7: Common Pattern */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>Every Cascade Shares Three Properties</H>
        <div style={{ display: 'flex', gap: 20, marginTop: 20 }}>
          {[
            { n: '1', t: 'Tightly Coupled', d: 'Centralized with single points of failure', c: colors.danger },
            { n: '2', t: 'No Local Reserves', d: 'No distributed storage to absorb shocks', c: colors.accent },
            { n: '3', t: 'Blind Operators', d: 'Degraded system-wide observability', c: colors.secondary },
          ].map(i => (
            <div key={i.n} style={{ background: colors.surface, border: `1px solid ${i.c}25`, borderRadius: 12, padding: '24px 20px', flex: 1 }}>
              <div style={{ width: 38, height: 38, borderRadius: 10, background: `${i.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: i.c, fontFamily: '"JetBrains Mono"', marginBottom: 12 }}>{i.n}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: colors.text, fontFamily: '"Inter"', marginBottom: 8 }}>{i.t}</div>
              <div style={{ fontSize: '14px', color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.5 }}>{i.d}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 8: Bridge */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '28px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7, marginBottom: 28 }}>
            Every one of these failures shares one root cause:
          </div>
          <div style={{ fontSize: '52px', fontWeight: 800, color: colors.danger, fontFamily: '"Inter"', textShadow: `0 0 40px ${colors.danger}30`, marginBottom: 36 }}>
            No flexibility.
          </div>
          <div style={{ fontSize: '22px', color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.6 }}>
            Now imagine adding the most variable energy source in history.
          </div>
        </div>
      </Slide>

      {/* ═══════ ACT 2: THE RENEWABLE REVOLUTION ═══════ */}

      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.accent, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Part II</div>
          <H size="50px" center color={colors.accent}>The Renewable Revolution</H>
          <P size="20px" center>Inevitable, amazing — and a whole new kind of problem</P>
        </div>
      </Slide>

      {/* 10: Renewable Growth */}
      <Slide backgroundColor={bg} padding="24px 40px">
        <H>The Renewable Explosion</H>
        <P size="15px">Germany's electricity from renewables — this is not slowing down.</P>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <RenewableGrowthChart width={880} height={370} />
        </div>
      </Slide>

      {/* 11: Duck Curve */}
      <Slide backgroundColor={bg} padding="24px 40px">
        <H>The Duck Curve Problem</H>
        <P size="15px">Solar floods the grid midday. Demand ramps steeply at sunset. The grid can't cope.</P>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <DuckCurveChart width={880} height={360} />
        </div>
      </Slide>

      {/* 12: Negative Prices */}
      <Slide backgroundColor={bg} padding={pad}>
        <H color={colors.accent}>Energy Being Thrown Away</H>
        <P>When supply exceeds demand, prices go <span style={{ color: colors.accent, fontWeight: 600 }}>negative</span>. Solar gets curtailed. Clean energy — wasted.</P>
        <div style={{ display: 'flex', gap: 16, margin: '24px 0' }}>
          {[
            { n: '139', l: 'Neg. price hours (2021)', c: colors.textDim },
            { n: '211', l: 'Neg. price hours (2022)', c: colors.textMuted },
            { n: '301', l: 'Neg. price hours (2023)', c: colors.accent },
            { n: '400+', l: 'Trending (2024)', c: colors.danger },
          ].map(s => <StatBox key={s.l} n={s.n} l={s.l} c={s.c} />)}
        </div>
        <P size="14px" color={colors.textDim}>Germany — Fraunhofer ISE data</P>
      </Slide>

      {/* 13: Load Shifting */}
      <Slide backgroundColor={bg} padding="24px 40px">
        <H color={colors.success}>What If You Could Shift the Load?</H>
        <P size="15px">Batteries absorb midday solar. Discharge in the evening. Click "With VPP" below.</P>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <DuckCurveChart width={880} height={360} />
        </div>
      </Slide>

      {/* 14: Consumers Become Infrastructure */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <H size="42px" center>Consumers Become Infrastructure</H>
          <div style={{ fontSize: '21px', color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7, marginTop: 12, maxWidth: 700 }}>
            Homes with solar and batteries can <span style={{ color: colors.solar, fontWeight: 600 }}>charge</span>, <span style={{ color: colors.success, fontWeight: 600 }}>export</span>, and <span style={{ color: colors.primary, fontWeight: 600 }}>shift consumption</span>.
          </div>
          <div style={{ fontSize: '20px', color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.8, marginTop: 20, maxWidth: 700 }}>
            Your roof becomes a power plant.<br />
            Your garage becomes a grid asset.<br />
            Your house becomes a node in the largest distributed system ever built.
          </div>
          <div style={{ fontSize: '19px', color: colors.primary, fontFamily: '"Inter"', fontWeight: 600, marginTop: 32, textShadow: `0 0 30px ${colors.primary}30` }}>
            But coordinating millions of these devices? That's a distributed systems problem.
          </div>
        </div>
      </Slide>

      {/* ═══════ ACT 3: THE VIRTUAL POWER PLANT ═══════ */}

      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Part III</div>
          <H size="50px" center>The Virtual Power Plant</H>
          <P size="20px" center>Software that turns distributed energy into grid infrastructure</P>
        </div>
      </Slide>

      {/* 16: What Is a VPP? */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>What Is a Virtual Power Plant?</H>
        <P size="19px" color={colors.text}>Software that <span style={{ color: colors.primary, fontWeight: 600 }}>aggregates</span> distributed energy resources and <span style={{ color: colors.success, fontWeight: 600 }}>operates</span> them as a coordinated power plant.</P>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 20 }}>
          <div style={{ background: colors.surface, borderRadius: 10, padding: '16px', border: `1px solid ${colors.surfaceLight}` }}>
            {['Solar Panels', 'Home Batteries', 'EV Chargers', 'Heat Pumps'].map((a, i) => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '14px', color: colors.text, fontFamily: '"Inter"' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: [colors.solar, colors.success, colors.primary, colors.secondary][i] }} />{a}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '22px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>
          <div style={{ background: `${colors.primary}08`, borderRadius: 12, padding: '22px 28px', border: `1px solid ${colors.primary}30`, textAlign: 'center' }}>
            <div style={{ fontSize: '17px', fontWeight: 700, color: colors.primary, fontFamily: '"Inter"' }}>Cloud Platform</div>
            <div style={{ fontSize: '12px', color: colors.textMuted, fontFamily: '"JetBrains Mono"', marginTop: 6 }}>Kubernetes + Dapr<br />Event-driven control</div>
          </div>
          <div style={{ fontSize: '22px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>
          <div style={{ background: colors.surface, borderRadius: 10, padding: '16px', border: `1px solid ${colors.surfaceLight}` }}>
            {['Frequency Regulation', 'Peak Shaving', 'Energy Arbitrage', 'Demand Response'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: '14px', color: colors.text, fontFamily: '"Inter"' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: [colors.danger, colors.accent, colors.success, colors.primary][i] }} />{s}
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* 17: Fastest Power Plant */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>The Fastest Power Plant</H>
        <div style={{ marginTop: 16 }}>
          {[
            { l: 'Coal', v: '2-6 hours', c: colors.textDim, w: 90 },
            { l: 'Gas Turbine', v: '10-30 min', c: '#fb923c', w: 45 },
            { l: 'Hydro', v: '15-30 sec', c: '#60a5fa', w: 12 },
            { l: 'Battery', v: '140 ms', c: colors.success, w: 2 },
          ].map(r => (
            <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              <div style={{ width: 110, fontSize: '15px', fontWeight: 500, color: colors.textMuted, fontFamily: '"Inter"', textAlign: 'right' }}>{r.l}</div>
              <div style={{ height: 30, width: `${r.w}%`, background: `linear-gradient(90deg, ${r.c}30, ${r.c}80)`, borderRadius: 6, display: 'flex', alignItems: 'center', paddingLeft: 12 }}>
                <span style={{ fontFamily: '"JetBrains Mono"', fontSize: '13px', fontWeight: 600, color: colors.text }}>{r.v}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, padding: '16px 22px', background: `${colors.success}08`, border: `1px solid ${colors.success}25`, borderRadius: 10 }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: colors.success, fontFamily: '"Inter"' }}>A battery responds before a gas turbine even knows there's an emergency.</div>
        </div>
      </Slide>

      {/* 18: Hornsdale */}
      <Slide backgroundColor={bg} padding={pad}>
        <Badge color={colors.success}>PROOF</Badge>
        <H color={colors.success}>Hornsdale, December 2017</H>
        <P>560 MW generator trips. Frequency plunging.</P>
        <div style={{ margin: '12px 0', display: 'flex', justifyContent: 'center' }}><FrequencyLine width={820} height={160} collapse={true} vppSave={true} /></div>
        <div style={{ display: 'flex', gap: 16 }}>
          <StatBox n="140ms" l="Battery Response" c={colors.success} />
          <StatBox n="28sec" l="Gas Response" c="#fb923c" />
          <StatBox n="8sec" l="Margin to Blackout" c={colors.danger} />
        </div>
      </Slide>

      {/* 19: SA VPP */}
      <Slide backgroundColor={bg} padding={pad}>
        <Badge color={colors.success}>PROOF</Badge>
        <H color={colors.success}>SA Virtual Power Plant, 2019</H>
        <P>748 MW coal plant trips. 1,100 homes respond autonomously.</P>
        <div style={{ display: 'flex', gap: 16, margin: '20px 0' }}>
          <StatBox n="1,100" l="Homes Responded" c={colors.success} />
          <StatBox n="2%" l="of Planned Fleet" c={colors.primary} />
          <StatBox n="0" l="Humans Involved" c={colors.accent} />
        </div>
        <div style={{ padding: '16px 22px', background: `${colors.success}08`, border: `1px solid ${colors.success}25`, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>Eleven hundred homes. Acting as one. <span style={{ color: colors.success }}>Without anyone pushing a button.</span></div>
        </div>
      </Slide>

      {/* 20: KubeCon Analogy */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>Speaking Your Language</H>
        <div style={{ display: 'flex', gap: 20, alignItems: 'start', marginTop: 12 }}>
          <div style={{ background: colors.surface, borderRadius: 10, padding: '20px', border: `1px solid ${colors.danger}20`, flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.danger, fontFamily: '"JetBrains Mono"', marginBottom: 12 }}>TRADITIONAL GRID</div>
            {['Monolith', 'Few generators', 'Manual scaling', 'Single point of failure', 'No observability'].map(x => (
              <div key={x} style={{ fontSize: '14px', color: colors.textMuted, fontFamily: '"Inter"', padding: '5px 0', borderBottom: `1px solid ${colors.surfaceLight}` }}>{x}</div>
            ))}
          </div>
          <div style={{ paddingTop: 60, fontSize: '24px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>
          <div style={{ background: `${colors.success}06`, borderRadius: 10, padding: '20px', border: `1px solid ${colors.success}25`, flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.success, fontFamily: '"JetBrains Mono"', marginBottom: 12 }}>VIRTUAL POWER PLANT</div>
            {['Distributed microservices', 'Millions of nodes', 'Autoscaling capacity', 'Resilient by design', 'Full observability'].map(x => (
              <div key={x} style={{ fontSize: '14px', color: colors.text, fontFamily: '"Inter"', fontWeight: 500, padding: '5px 0', borderBottom: `1px solid ${colors.surfaceLight}` }}>{x}</div>
            ))}
          </div>
        </div>
        <P size="14px" center style={{ marginTop: 16, fontFamily: '"JetBrains Mono"' }}>Frequency = SLO &bull; Cascade = failure propagation &bull; Batteries = autoscaling</P>
      </Slide>

      {/* 21: Demo Without VPP */}
      <Slide backgroundColor={bg} padding="16px 40px">
        <Badge color={colors.danger}>LIVE SIMULATION</Badge>
        <H size="34px" color={colors.danger}>Cascading Failure — No VPP</H>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <CascadeSimulation width={720} height={460} withVPP={false} />
        </div>
      </Slide>

      {/* 22: Demo With VPP */}
      <Slide backgroundColor={bg} padding="16px 40px">
        <Badge color={colors.success}>LIVE SIMULATION</Badge>
        <H size="34px" color={colors.success}>Same Failure — With VPP</H>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <CascadeSimulation width={720} height={460} withVPP={true} />
        </div>
      </Slide>

      {/* ═══════ ACT 4: RESILIENCE ═══════ */}

      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.success, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 16 }}>Part IV</div>
          <H size="50px" center color={colors.success}>Resilience</H>
          <P size="20px" center>What the future grid looks like — and why you already know how to build it</P>
        </div>
      </Slide>

      {/* Back to Texas */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 24 }}>Back to Texas</div>
          <div style={{ fontSize: '26px', fontWeight: 400, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.8 }}>
            <div style={{ marginBottom: 20 }}>Remember those 4 minutes and 37 seconds?</div>
            <div style={{ marginBottom: 20, color: colors.textMuted }}>
              With 10 GW of distributed batteries responding in 140 milliseconds, there is no cascade.
            </div>
            <div style={{ marginBottom: 20, color: colors.textMuted }}>
              The frequency never drops. The gas plants never need to save you.
            </div>
            <div style={{ color: colors.success, fontWeight: 600, textShadow: `0 0 30px ${colors.success}30` }}>
              Because 1 million homes already did.
            </div>
          </div>
        </div>
      </Slide>

      {/* 25: Future Grid */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <H size="48px" center>The Future Grid</H>
          <P size="21px" center style={{ maxWidth: 650, marginTop: 8 }}>Millions of devices cooperating. Homes, EVs, batteries — forming distributed power plants.</P>
          <div style={{ marginTop: 28, fontSize: '24px', fontWeight: 600, color: colors.primary, fontFamily: '"Inter"', textShadow: `0 0 30px ${colors.primary}30` }}>The grid becomes software.</div>
          <P size="19px" center style={{ marginTop: 8 }}>And it runs on the same infrastructure you build every day.</P>
        </div>
      </Slide>

      {/* 26: Final Takeaway */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '26px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7, marginBottom: 28 }}>
            Virtual Power Plants turn distributed renewable energy into <span style={{ color: colors.success }}>reliable grid infrastructure</span>.
          </div>
          <P size="22px" center style={{ marginBottom: 28 }}>Cloud-native systems are what make them possible.</P>
          <div style={{ fontSize: '24px', fontWeight: 700, color: colors.primary, fontFamily: '"Inter"', textShadow: `0 0 40px ${colors.primary}30`, padding: '18px 28px', background: `${colors.primary}08`, borderRadius: 14, border: `1px solid ${colors.primary}20` }}>
            You already know how to build the future grid.<br />
            <span style={{ fontWeight: 400, fontSize: '20px', color: colors.textMuted }}>You just didn't know it yet.</span>
          </div>
        </div>
      </Slide>

      {/* Kepler 1: Live Energy Dashboard */}
      <Slide backgroundColor={bg} padding="20px 36px">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Badge color={colors.success}>KEPLER — CNCF</Badge>
          <span style={{ fontSize: '11px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>Per-pod energy monitoring via eBPF</span>
        </div>
        <H color={colors.success} size="36px">Experiment: How Much Power Does Our VPP Use?</H>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <KeplerDashboard width={920} height={420} />
        </div>
      </Slide>

      {/* Kepler 2: Carbon-Aware Scheduling */}
      <Slide backgroundColor={bg} padding="20px 36px">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Badge color={colors.success}>KEPLER + KEDA</Badge>
          <span style={{ fontSize: '11px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>Carbon-aware workload scheduling</span>
        </div>
        <H color={colors.success} size="36px">Experiment: The VPP Practices What It Preaches</H>
        <P size="15px">Batch jobs (model retraining, analytics) scale up when the grid is clean, scale down when it's dirty.</P>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
          <CarbonAwareChart width={920} height={370} />
        </div>
      </Slide>

      {/* deck.gl Prototype: Texas Grid on Real Map */}
      <Slide backgroundColor="#050810" padding="0">
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 14px' }}>
            <Badge color={colors.primary}>PROTOTYPE — deck.gl</Badge>
            <span style={{ fontSize: '14px', fontWeight: 700, color: colors.primary, fontFamily: '"Inter"' }}>ERCOT Grid on Real Map — WebGL Rendered</span>
          </div>
          <div style={{ flex: 1 }}>
            <TexasMapGL width={1024} height={640} />
          </div>
        </div>
      </Slide>

      {/* Thank You */}
      <Slide backgroundColor={bg} padding={pad}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center' }}>
          <H size="54px" center>Thank You</H>
          <P size="18px" center><span style={{ color: colors.primary, fontWeight: 600 }}>Enpal</span> — Building Europe's Largest Virtual Power Plant</P>
        </div>
      </Slide>

    </Deck>
  );
}
