import React from 'react';
import { Deck, Slide, Heading, Text } from 'spectacle';
import { colors } from './theme';
import FrequencyLine from './components/FrequencyLine';
import FrequencyDemo from './components/FrequencyDemo';
import CascadeSimulation from './components/CascadeSimulation';
import RenewableGrowthChart from './components/RenewableGrowthChart';
import DuckCurveChart from './components/DuckCurveChart';
import AnimatedStat from './components/AnimatedStat';
import StaticTexasGrid from './components/StaticTexasGrid';
import KeplerDashboard from './components/KeplerDashboard';
import CarbonAwareChart from './components/CarbonAwareChart';
import TexasMapHUD from './components/TexasMapHUD';
import { versionA, versionB, versionC } from './slides/GridScaleSlides';
import EUGridHUD from './components/EUGridHUD';

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
  { from: 26, to: 30, name: 'Resilience' },
];

const slideTemplate = ({ slideNumber, numberOfSlides }) => {
  const section = SECTIONS.find(s => slideNumber >= s.from && slideNumber <= s.to);
  const label = section?.name;
  return (
    <div className="absolute bottom-3 right-5 text-[11px] font-mono flex gap-2 items-center" style={{ color: colors.textDim + '60' }}>
      {label && <span style={{ color: colors.textDim + '40' }}>{label}</span>}
      <span>{slideNumber} / {numberOfSlides}</span>
    </div>
  );
};

// Consistent heading style
const H = ({ children, color = colors.primary, size = '40px', center = false }) => (
  <div className={`font-extrabold font-sans leading-[1.15] mb-2 ${center ? 'text-center' : 'text-left'}`} style={{ fontSize: size, color, textShadow: `0 0 40px ${color}35` }}>{children}</div>
);
const P = ({ children, color = colors.textMuted, size = '20px', center = false, style = {} }) => (
  <div className={`font-sans leading-normal mb-2.5 ${center ? 'text-center' : 'text-left'}`} style={{ fontSize: size, color, ...style }}>{children}</div>
);
const Badge = ({ children, color }) => (
  <div className="inline-block px-2.5 py-[3px] rounded-[14px] text-[20px] font-semibold font-mono mb-2" style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}>{children}</div>
);
const StatBox = ({ n, l, c }) => (
  <div className="bg-hud-surface border border-hud-surface-light rounded-[10px] px-3.5 py-[18px] text-center flex-1">
    <div className="text-[28px] font-extrabold font-mono" style={{ color: c, textShadow: `0 0 20px ${c}25` }}>{n}</div>
    <div className="text-[20px] text-hud-text-muted mt-1 font-sans uppercase tracking-[0.04em]">{l}</div>
  </div>
);

export default function Presentation() {
  return (
    <Deck theme={theme} template={slideTemplate}>

      {/* 0: Title Slide */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center relative">
          <div className="absolute pointer-events-none" style={{ top: '-10%', right: '-15%', width: '80%', height: '120%' }}>
            <StaticTexasGrid width={700} height={700} opacity={0.12} />
          </div>
          <div className="relative z-[1]">
            <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.2em] uppercase mb-8">KubeCon + CloudNativeCon Europe 2026</div>
            <div className="text-[56px] font-extrabold font-sans leading-[1.1] mb-5" style={{ color: colors.primary, textShadow: `0 0 60px ${colors.primary}30` }}>
              What is a Virtual<br />Power Plant?
            </div>
            <div className="text-[22px] text-hud-text-muted font-sans mb-12">
              Cloud-Native Infrastructure for the Energy Grid
            </div>
            <div className="flex gap-6 justify-center items-center">
              <div className="w-12 h-12 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.primary}30, ${colors.success}30)`, border: `1px solid ${colors.surfaceLight}` }} />
              <div className="text-left">
                <div className="text-[20px] font-semibold text-hud-text font-sans">Enpal</div>
                <div className="text-[20px] text-hud-text-muted font-sans">Building Europe's Largest Virtual Power Plant</div>
              </div>
            </div>
          </div>
        </div>
      </Slide>

      {/* 1: Agenda */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center h-full">
          <H size="36px">Agenda</H>
          <div className="flex flex-col gap-5 mt-6">
            {[
              { num: '01', title: 'The Grid', sub: 'How the world\'s largest machine works — and how it fails', color: colors.danger, time: '~10 min' },
              { num: '02', title: 'The Renewable Revolution', sub: 'Why cheap clean energy creates expensive new problems', color: colors.accent, time: '~7 min' },
              { num: '03', title: 'The Virtual Power Plant', sub: 'Software that turns millions of devices into grid infrastructure', color: colors.primary, time: '~10 min' },
              { num: '04', title: 'Resilience', sub: 'What the future grid looks like — and why you already know how to build it', color: colors.success, time: '~3 min' },
            ].map(s => (
              <div key={s.num} className="flex items-center gap-5">
                <div className="text-[28px] font-extrabold font-mono min-w-[48px] text-right" style={{ color: s.color }}>{s.num}</div>
                <div className="flex-1" style={{ borderLeft: `2px solid ${s.color}40`, paddingLeft: 20 }}>
                  <div className="text-[22px] font-bold text-hud-text font-sans">{s.title}</div>
                  <div className="text-[20px] text-hud-text-muted font-sans mt-0.5">{s.sub}</div>
                </div>
                <div className="text-[20px] text-hud-text-dim font-mono">{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* ═══════ ACT 1: THE GRID ═══════ */}

      {/* Section Title: The Grid */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-danger font-mono tracking-[0.15em] uppercase mb-4">Part I</div>
          <H size="54px" center color={colors.danger}>The Grid</H>
          <P size="20px" center>The world's largest machine — and why it keeps failing</P>
        </div>
      </Slide>

      {/* Texas Cascade — deck.gl HUD */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="absolute inset-0">
          <TexasMapHUD width={1366} height={768} variant="hud" />
        </div>
      </Slide>

      {/* 2: Texas Numbers */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-between h-full">
          <div className="py-5 pl-6" style={{ borderLeft: `3px solid ${colors.danger}` }}>
            <div className="text-[28px] font-light text-hud-text font-sans leading-[1.6]">
              "The Texas grid was <span className="font-bold" style={{ color: colors.danger }}>4 minutes and 37 seconds</span> from total collapse."
            </div>
            <div className="text-[20px] text-hud-text-dim font-sans mt-2">
              A cold restart would have taken weeks. Maybe months.
            </div>
          </div>
          <div className="flex gap-5 my-4">
            <AnimatedStat target="4:37" label="from total collapse" color={colors.danger} delay={0} duration={1200} />
            <AnimatedStat target="246" label="people dead" color={colors.danger} delay={300} duration={1000} />
            <AnimatedStat target="$195B" label="in damage" color={colors.accent} delay={600} duration={1400} />
            <AnimatedStat target="4.5M" label="homes dark" color={colors.textMuted} delay={900} duration={1100} />
          </div>
          <div className="text-[20px] text-hud-text font-sans leading-[1.8]">
            Wholesale electricity spiked to <span className="font-semibold" style={{ color: colors.danger }}>$9,000/MWh</span> — a <span className="font-semibold" style={{ color: colors.danger }}>180x</span> increase.
            <br />Families received <span className="font-semibold" style={{ color: colors.danger }}>$7,000 bills</span> in a single week. Their provider — Griddy — went bankrupt.
          </div>
          <div className="pt-3.5" style={{ borderTop: `1px solid ${colors.surfaceLight}` }}>
            <div className="text-[20px] text-hud-primary font-sans font-medium">
              How did the most energy-rich state in America come this close to total infrastructure failure?
            </div>
          </div>
        </div>
      </Slide>

      {/* 3: Why Texas Failed */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.danger}>Why Texas Failed</H>
          <P>The gas-electric death spiral — a cascading feedback loop.</P>
          <div className="flex flex-col flex-1 justify-center gap-4 my-4">
            {[
              { text: 'Extreme cold hits Texas', color: colors.primary, icon: '1' },
              { text: 'Generators freeze and trip offline', color: colors.accent, icon: '2' },
              { text: 'ERCOT orders emergency load shedding', color: colors.accent, icon: '3' },
              { text: 'Load shedding cuts power to gas compressors & pipelines', color: colors.danger, icon: '4' },
              { text: 'Gas supply drops — more generators lose fuel and trip', color: colors.danger, icon: '5' },
              { text: 'More load shedding needed — cycle accelerates', color: colors.danger, icon: '\u21bb' },
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-[20px] font-extrabold font-mono shrink-0" style={{ background: `${step.color}15`, color: step.color }}>{step.icon}</div>
                <div className="text-[20px] text-hud-text font-sans" style={{ fontWeight: i >= 3 ? 600 : 400 }}>{step.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <StatBox n="52,000 MW" l="offline (of 107K total)" c={colors.danger} />
            <StatBox n="Isolated" l="no grid interconnection" c={colors.accent} />
            <StatBox n="42 hrs" l="average outage duration" c={colors.textMuted} />
          </div>
        </div>
      </Slide>

      {/* ── REVIEW: Grid Scale Bridge Slides ── */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-text-dim font-mono tracking-[0.15em] uppercase mb-5">Review</div>
          <H size="48px" center>Option A</H>
          <P size="20px" center>"The Living Grid" — Animated EU grid map + stat comparison</P>
        </div>
      </Slide>
      {versionA()}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-text-dim font-mono tracking-[0.15em] uppercase mb-5">Review</div>
          <H size="48px" center>Option B</H>
          <P size="20px" center>"By the Numbers" — Cinematic stat reveal + grid vs. tech comparison</P>
        </div>
      </Slide>
      {versionB()}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-text-dim font-mono tracking-[0.15em] uppercase mb-5">Review</div>
          <H size="48px" center>Option C</H>
          <P size="20px" center>"The Synchronized Dance" — Pulse animation + electricity journey</P>
        </div>
      </Slide>
      {versionC()}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-text-dim font-mono tracking-[0.15em] uppercase mb-5">Review</div>
          <H size="48px" center>Option D</H>
          <P size="20px" center>"The Zoom Out" — deck.gl map: plant → home → region → nation → continent</P>
        </div>
      </Slide>
      <Slide backgroundColor="#020408" padding="0">
        <div className="w-full h-full">
          <EUGridHUD width="100%" height="100%" />
        </div>
      </Slide>

      {/* 4: Frequency Demo */}
      <Slide backgroundColor={bg} padding="24px 40px">
        <div className="flex flex-col h-full">
          <H>The Grid: A Balancing Act</H>
          <P size="20px">Supply and demand must match every second. Click the scenarios to see what happens when they don't.</P>
          <div className="flex-1 flex justify-center items-center">
            <FrequencyDemo width={900} height={340} />
          </div>
          <div className="flex gap-3.5">
            <StatBox n="50.000 Hz" l="EU Target Frequency" c={colors.primary} />
            <StatBox n="107 GW" l="ERCOT Total Capacity" c={colors.secondary} />
            <StatBox n="0 buffer" l="No Grid Storage" c={colors.accent} />
          </div>
        </div>
      </Slide>

      {/* 5: How Grid Was Built */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>Designed for a Different World</H>
        <div className="flex items-center gap-2 my-6">
          {[
            { l: 'Power Plants', s: 'Few, large', c: colors.accent },
            { l: 'Transmission', s: 'High voltage', c: colors.secondary },
            { l: 'Distribution', s: 'One-way', c: colors.primary },
            { l: 'Homes', s: 'Passive', c: colors.textDim },
          ].map((x, i) => (
            <React.Fragment key={i}>
              <div className="bg-hud-surface rounded-[10px] px-4 py-5 text-center flex-1" style={{ border: `1px solid ${x.c}30` }}>
                <div className="text-[20px] font-semibold text-hud-text font-sans">{x.l}</div>
                <div className="text-[20px] text-hud-text-muted font-sans mt-1">{x.s}</div>
              </div>
              {i < 3 && <div className="text-[20px] text-hud-text-dim font-mono">{'\u2192'}</div>}
            </React.Fragment>
          ))}
        </div>
        <P size="20px" style={{ fontStyle: 'italic', marginTop: 12 }}>"Built in the 1950s. One-directional. No flexibility."</P>
      </Slide>

      {/* 6: It Keeps Happening */}
      <Slide backgroundColor={bg} padding={pad}>
        <H color={colors.danger}>It Keeps Happening</H>
        <div className="flex gap-10 mt-4">
          <div className="flex-1">
            {[
              { y: '2003', e: 'Italy Blackout', i: '56M people' },
              { y: '2006', e: 'European Grid Split', i: '15M affected' },
              { y: '2016', e: 'South Australia', i: 'Entire state' },
              { y: '2021', e: 'Texas ERCOT', i: '4.5M homes, 240+ deaths' },
            ].map(t => (
              <div key={t.y+t.e} className="flex gap-3.5 mb-3.5">
                <div className="font-mono text-[20px] font-bold text-hud-danger min-w-[46px]">{t.y}</div>
                <div>
                  <div className="text-[20px] font-semibold text-hud-text font-sans">{t.e}</div>
                  <div className="text-[20px] text-hud-text-muted font-sans">{t.i}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1">
            {[
              { y: '2021', e: 'Europe Grid Split', i: '1.25 Hz from collapse', c: colors.danger },
              { y: '2025', e: 'Spain/Portugal', i: '60M people', c: colors.accent },
              { y: '2025', e: 'Berlin Arson (x3)', i: '45K+ homes', c: colors.accent },
              { y: '2026', e: 'Berlin Teltow Canal', i: '4-day outage', c: colors.primary },
            ].map(t => (
              <div key={t.y+t.e} className="flex gap-3.5 mb-3.5">
                <div className="font-mono text-[20px] font-bold min-w-[46px]" style={{ color: t.c || colors.danger }}>{t.y}</div>
                <div>
                  <div className="text-[20px] font-semibold text-hud-text font-sans">{t.e}</div>
                  <div className="text-[20px] text-hud-text-muted font-sans">{t.i}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* 7: Common Pattern */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>Every Cascade Shares Three Properties</H>
        <div className="flex gap-5 mt-5">
          {[
            { n: '1', t: 'Tightly Coupled', d: 'Centralized with single points of failure', c: colors.danger },
            { n: '2', t: 'No Local Reserves', d: 'No distributed storage to absorb shocks', c: colors.accent },
            { n: '3', t: 'Blind Operators', d: 'Degraded system-wide observability', c: colors.secondary },
          ].map(i => (
            <div key={i.n} className="bg-hud-surface rounded-xl px-5 py-6 flex-1" style={{ border: `1px solid ${i.c}25` }}>
              <div className="w-[38px] h-[38px] rounded-[10px] flex items-center justify-center text-[20px] font-extrabold font-mono mb-3" style={{ background: `${i.c}15`, color: i.c }}>{i.n}</div>
              <div className="text-[20px] font-bold text-hud-text font-sans mb-2">{i.t}</div>
              <div className="text-[20px] text-hud-text-muted font-sans leading-normal">{i.d}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 8: Bridge */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[28px] font-semibold text-hud-text font-sans leading-[1.7] mb-7">
            Every one of these failures shares one root cause:
          </div>
          <div className="text-[52px] font-extrabold font-sans mb-9" style={{ color: colors.danger, textShadow: `0 0 40px ${colors.danger}30` }}>
            No flexibility.
          </div>
          <div className="text-[22px] text-hud-text-muted font-sans leading-[1.6]">
            Now imagine adding the most variable energy source in history.
          </div>
        </div>
      </Slide>

      {/* ═══════ ACT 2: THE RENEWABLE REVOLUTION ═══════ */}

      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-accent font-mono tracking-[0.15em] uppercase mb-4">Part II</div>
          <H size="50px" center color={colors.accent}>The Renewable Revolution</H>
          <P size="20px" center>Inevitable, amazing — and a whole new kind of problem</P>
        </div>
      </Slide>

      {/* 10: Renewable Growth */}
      <Slide backgroundColor={bg} padding="24px 40px">
        <H>The Renewable Explosion</H>
        <P size="20px">Germany's electricity from renewables — this is not slowing down.</P>
        <div className="flex-1 flex justify-center mt-2">
          <RenewableGrowthChart width={880} height={370} />
        </div>
      </Slide>

      {/* 11: Duck Curve */}
      <Slide backgroundColor={bg} padding="24px 40px">
        <H>The Duck Curve Problem</H>
        <P size="20px">Solar floods the grid midday. Demand ramps steeply at sunset. The grid can't cope.</P>
        <div className="flex-1 flex justify-center mt-2">
          <DuckCurveChart width={880} height={360} />
        </div>
      </Slide>

      {/* 12: Negative Prices */}
      <Slide backgroundColor={bg} padding={pad}>
        <H color={colors.accent}>Energy Being Thrown Away</H>
        <P>When supply exceeds demand, prices go <span className="font-semibold" style={{ color: colors.accent }}>negative</span>. Solar gets curtailed. Clean energy — wasted.</P>
        <div className="flex gap-4 my-6">
          {[
            { n: '139', l: 'Neg. price hours (2021)', c: colors.textDim },
            { n: '211', l: 'Neg. price hours (2022)', c: colors.textMuted },
            { n: '301', l: 'Neg. price hours (2023)', c: colors.accent },
            { n: '400+', l: 'Trending (2024)', c: colors.danger },
          ].map(s => <StatBox key={s.l} n={s.n} l={s.l} c={s.c} />)}
        </div>
        <P size="20px" color={colors.textDim}>Germany — Fraunhofer ISE data</P>
      </Slide>

      {/* 13: Load Shifting */}
      <Slide backgroundColor={bg} padding="24px 40px">
        <H color={colors.success}>What If You Could Shift the Load?</H>
        <P size="20px">Batteries absorb midday solar. Discharge in the evening. Click "With VPP" below.</P>
        <div className="flex-1 flex justify-center mt-2">
          <DuckCurveChart width={880} height={360} />
        </div>
      </Slide>

      {/* 14: Consumers Become Infrastructure */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <H size="42px" center>Consumers Become Infrastructure</H>
          <div className="text-[21px] text-hud-text font-sans leading-[1.7] mt-3 max-w-[700px]">
            Homes with solar and batteries can <span className="font-semibold" style={{ color: colors.solar }}>charge</span>, <span className="font-semibold" style={{ color: colors.success }}>export</span>, and <span className="font-semibold" style={{ color: colors.primary }}>shift consumption</span>.
          </div>
          <div className="text-[20px] text-hud-text-muted font-sans leading-[1.8] mt-5 max-w-[700px]">
            Your roof becomes a power plant.<br />
            Your garage becomes a grid asset.<br />
            Your house becomes a node in the largest distributed system ever built.
          </div>
          <div className="text-[20px] font-sans font-semibold mt-8" style={{ color: colors.primary, textShadow: `0 0 30px ${colors.primary}30` }}>
            But coordinating millions of these devices? That's a distributed systems problem.
          </div>
        </div>
      </Slide>

      {/* ═══════ ACT 3: THE VIRTUAL POWER PLANT ═══════ */}

      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.15em] uppercase mb-4">Part III</div>
          <H size="50px" center>The Virtual Power Plant</H>
          <P size="20px" center>Software that turns distributed energy into grid infrastructure</P>
        </div>
      </Slide>

      {/* 16: What Is a VPP? */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>What Is a Virtual Power Plant?</H>
        <P size="20px" color={colors.text}>Software that <span className="font-semibold" style={{ color: colors.primary }}>aggregates</span> distributed energy resources and <span className="font-semibold" style={{ color: colors.success }}>operates</span> them as a coordinated power plant.</P>
        <div className="flex items-center justify-center gap-3.5 mt-5">
          <div className="bg-hud-surface rounded-[10px] p-4 border border-hud-surface-light">
            {['Solar Panels', 'Home Batteries', 'EV Chargers', 'Heat Pumps'].map((a, i) => (
              <div key={a} className="flex items-center gap-2 mb-1.5 text-[20px] text-hud-text font-sans">
                <div className="w-2 h-2 rounded-full" style={{ background: [colors.solar, colors.success, colors.primary, colors.secondary][i] }} />{a}
              </div>
            ))}
          </div>
          <div className="text-[22px] text-hud-primary font-mono">{'\u2192'}</div>
          <div className="rounded-xl px-7 py-[22px] text-center" style={{ background: `${colors.primary}08`, border: `1px solid ${colors.primary}30` }}>
            <div className="text-[20px] font-bold text-hud-primary font-sans">Cloud Platform</div>
            <div className="text-[20px] text-hud-text-muted font-mono mt-1.5">Kubernetes + Dapr<br />Event-driven control</div>
          </div>
          <div className="text-[22px] text-hud-primary font-mono">{'\u2192'}</div>
          <div className="bg-hud-surface rounded-[10px] p-4 border border-hud-surface-light">
            {['Frequency Regulation', 'Peak Shaving', 'Energy Arbitrage', 'Demand Response'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 mb-1.5 text-[20px] text-hud-text font-sans">
                <div className="w-2 h-2 rounded-full" style={{ background: [colors.danger, colors.accent, colors.success, colors.primary][i] }} />{s}
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* 17: Fastest Power Plant */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>The Fastest Power Plant</H>
        <div className="mt-4">
          {[
            { l: 'Coal', v: '2-6 hours', c: colors.textDim, w: 90 },
            { l: 'Gas Turbine', v: '10-30 min', c: '#fb923c', w: 45 },
            { l: 'Hydro', v: '15-30 sec', c: '#60a5fa', w: 12 },
            { l: 'Battery', v: '140 ms', c: colors.success, w: 2 },
          ].map(r => (
            <div key={r.l} className="flex items-center gap-3.5 mb-3">
              <div className="w-[110px] text-[20px] font-medium text-hud-text-muted font-sans text-right">{r.l}</div>
              <div className="h-[30px] rounded-md flex items-center pl-3" style={{ width: `${r.w}%`, background: `linear-gradient(90deg, ${r.c}30, ${r.c}80)` }}>
                <span className="font-mono text-[20px] font-semibold text-hud-text">{r.v}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[10px]" style={{ padding: '16px 22px', background: `${colors.success}08`, border: `1px solid ${colors.success}25` }}>
          <div className="text-[20px] font-semibold font-sans" style={{ color: colors.success }}>A battery responds before a gas turbine even knows there's an emergency.</div>
        </div>
      </Slide>

      {/* 18: Hornsdale */}
      <Slide backgroundColor={bg} padding={pad}>
        <Badge color={colors.success}>PROOF</Badge>
        <H color={colors.success}>Hornsdale, December 2017</H>
        <P>560 MW generator trips. Frequency plunging.</P>
        <div className="my-3 flex justify-center"><FrequencyLine width={820} height={160} collapse={true} vppSave={true} /></div>
        <div className="flex gap-4">
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
        <div className="flex gap-4 my-5">
          <StatBox n="1,100" l="Homes Responded" c={colors.success} />
          <StatBox n="2%" l="of Planned Fleet" c={colors.primary} />
          <StatBox n="0" l="Humans Involved" c={colors.accent} />
        </div>
        <div className="rounded-[10px] text-center" style={{ padding: '16px 22px', background: `${colors.success}08`, border: `1px solid ${colors.success}25` }}>
          <div className="text-[20px] font-semibold text-hud-text font-sans">Eleven hundred homes. Acting as one. <span style={{ color: colors.success }}>Without anyone pushing a button.</span></div>
        </div>
      </Slide>

      {/* 20: KubeCon Analogy */}
      <Slide backgroundColor={bg} padding={pad}>
        <H>Speaking Your Language</H>
        <div className="flex gap-5 items-start mt-3">
          <div className="bg-hud-surface rounded-[10px] p-5 flex-1" style={{ border: `1px solid ${colors.danger}20` }}>
            <div className="text-[20px] font-semibold font-mono mb-3" style={{ color: colors.danger }}>TRADITIONAL GRID</div>
            {['Monolith', 'Few generators', 'Manual scaling', 'Single point of failure', 'No observability'].map(x => (
              <div key={x} className="text-[20px] text-hud-text-muted font-sans py-[5px] border-b border-hud-surface-light">{x}</div>
            ))}
          </div>
          <div className="pt-[60px] text-[24px] text-hud-primary font-mono">{'\u2192'}</div>
          <div className="rounded-[10px] p-5 flex-1" style={{ background: `${colors.success}06`, border: `1px solid ${colors.success}25` }}>
            <div className="text-[20px] font-semibold font-mono mb-3" style={{ color: colors.success }}>VIRTUAL POWER PLANT</div>
            {['Distributed microservices', 'Millions of nodes', 'Autoscaling capacity', 'Resilient by design', 'Full observability'].map(x => (
              <div key={x} className="text-[20px] text-hud-text font-sans font-medium py-[5px] border-b border-hud-surface-light">{x}</div>
            ))}
          </div>
        </div>
        <P size="20px" center style={{ marginTop: 16, fontFamily: '"JetBrains Mono"' }}>Frequency = SLO &bull; Cascade = failure propagation &bull; Batteries = autoscaling</P>
      </Slide>

      {/* 21: Demo Without VPP */}
      <Slide backgroundColor={bg} padding="16px 40px">
        <Badge color={colors.danger}>LIVE SIMULATION</Badge>
        <H size="34px" color={colors.danger}>Cascading Failure — No VPP</H>
        <div className="flex justify-center mt-1">
          <CascadeSimulation width={720} height={460} withVPP={false} />
        </div>
      </Slide>

      {/* 22: Demo With VPP */}
      <Slide backgroundColor={bg} padding="16px 40px">
        <Badge color={colors.success}>LIVE SIMULATION</Badge>
        <H size="34px" color={colors.success}>Same Failure — With VPP</H>
        <div className="flex justify-center mt-1">
          <CascadeSimulation width={720} height={460} withVPP={true} />
        </div>
      </Slide>

      {/* ═══════ ACT 4: RESILIENCE ═══════ */}

      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-success font-mono tracking-[0.15em] uppercase mb-4">Part IV</div>
          <H size="50px" center color={colors.success}>Resilience</H>
          <P size="20px" center>What the future grid looks like — and why you already know how to build it</P>
        </div>
      </Slide>

      {/* Back to Texas */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center h-full">
          <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.15em] uppercase mb-6">Back to Texas</div>
          <div className="text-[26px] font-normal text-hud-text font-sans leading-[1.8]">
            <div className="mb-5">Remember those 4 minutes and 37 seconds?</div>
            <div className="mb-5 text-hud-text-muted">
              With 10 GW of distributed batteries responding in 140 milliseconds, there is no cascade.
            </div>
            <div className="mb-5 text-hud-text-muted">
              The frequency never drops. The gas plants never need to save you.
            </div>
            <div className="font-semibold" style={{ color: colors.success, textShadow: `0 0 30px ${colors.success}30` }}>
              Because 1 million homes already did.
            </div>
          </div>
        </div>
      </Slide>

      {/* 25: Future Grid */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <H size="48px" center>The Future Grid</H>
          <P size="21px" center style={{ maxWidth: 650, marginTop: 8 }}>Millions of devices cooperating. Homes, EVs, batteries — forming distributed power plants.</P>
          <div className="mt-7 text-[24px] font-semibold font-sans" style={{ color: colors.primary, textShadow: `0 0 30px ${colors.primary}30` }}>The grid becomes software.</div>
          <P size="20px" center style={{ marginTop: 8 }}>And it runs on the same infrastructure you build every day.</P>
        </div>
      </Slide>

      {/* 26: Final Takeaway */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[26px] font-semibold text-hud-text font-sans leading-[1.7] mb-7">
            Virtual Power Plants turn distributed renewable energy into <span style={{ color: colors.success }}>reliable grid infrastructure</span>.
          </div>
          <P size="22px" center style={{ marginBottom: 28 }}>Cloud-native systems are what make them possible.</P>
          <div className="text-[24px] font-bold font-sans rounded-[14px]" style={{ color: colors.primary, textShadow: `0 0 40px ${colors.primary}30`, padding: '18px 28px', background: `${colors.primary}08`, border: `1px solid ${colors.primary}20` }}>
            You already know how to build the future grid.<br />
            <span className="font-normal text-[20px] text-hud-text-muted">You just didn't know it yet.</span>
          </div>
        </div>
      </Slide>

      {/* Kepler 1: Live Energy Dashboard */}
      <Slide backgroundColor={bg} padding="20px 36px">
        <div className="flex items-center gap-2.5 mb-1.5">
          <Badge color={colors.success}>KEPLER — CNCF</Badge>
          <span className="text-[20px] text-hud-text-dim font-mono">Per-pod energy monitoring via eBPF</span>
        </div>
        <H color={colors.success} size="36px">Experiment: How Much Power Does Our VPP Use?</H>
        <div className="flex justify-center mt-2">
          <KeplerDashboard width={920} height={420} />
        </div>
      </Slide>

      {/* Kepler 2: Carbon-Aware Scheduling */}
      <Slide backgroundColor={bg} padding="20px 36px">
        <div className="flex items-center gap-2.5 mb-1.5">
          <Badge color={colors.success}>KEPLER + KEDA</Badge>
          <span className="text-[20px] text-hud-text-dim font-mono">Carbon-aware workload scheduling</span>
        </div>
        <H color={colors.success} size="36px">Experiment: The VPP Practices What It Preaches</H>
        <P size="20px">Batch jobs (model retraining, analytics) scale up when the grid is clean, scale down when it's dirty.</P>
        <div className="flex justify-center mt-1">
          <CarbonAwareChart width={920} height={370} />
        </div>
      </Slide>

      {/* Thank You */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <H size="54px" center>Thank You</H>
          <P size="20px" center><span className="text-hud-primary font-semibold">Enpal</span> — Building Europe's Largest Virtual Power Plant</P>
        </div>
      </Slide>

    </Deck>
  );
}
