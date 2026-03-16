import React from 'react';
import { Deck, Slide, Heading, Text } from 'spectacle';
import { colors } from './theme';
import FrequencyDemo from './components/FrequencyDemo';
import RenewableGrowthChart from './components/RenewableGrowthChart';
import DuckCurveChart from './components/DuckCurveChart';
import DuckCurveVPP from './components/DuckCurveVPP';
import AnimatedStat from './components/AnimatedStat';
import StaticTexasGrid from './components/StaticTexasGrid';
import TexasMapHUD from './components/TexasMapHUD';
import { versionA, versionD } from './slides/GridScaleSlides';
import EUGridHUD from './components/EUGridHUD';
import DemandResponseDemo from './components/DemandResponseDemo';
import VPPArchitecture from './components/VPPArchitecture';
import GridFlowDemo from './components/GridFlowDemo';
import ConsumerIcons from './components/ConsumerIcons';
import SAMapHUD from './components/SAMapHUD';
// DEPRECATED: import VPPExplainerZoom from './components/VPPExplainerZoom';
import EnpalArchitectureDiagram from './components/EnpalArchitectureDiagram';
import VPPScenarioSlide from './components/VPPScenarioSlide';
import CurtailmentChart from './components/CurtailmentChart';
import ResponseTimeline from './components/ResponseTimeline';

const theme = {
  colors: { primary: colors.text, secondary: colors.textMuted, tertiary: colors.primary },
  fonts: { header: '"Inter", system-ui, sans-serif', text: '"Inter", system-ui, sans-serif' },
};

const bg = colors.bg;
const pad = '36px 56px';

// Section ranges (slide numbers are 1-indexed)
const SECTIONS = [
  { from: 1, to: 2, name: '' },
  { from: 3, to: 13, name: 'The Grid' },
  { from: 14, to: 18, name: 'The Renewable Revolution' },
  { from: 19, to: 31, name: 'The Virtual Power Plant' },
  { from: 32, to: 35, name: 'Resilience' },
];

const slideTemplate = ({ slideNumber, numberOfSlides }) => {
  const section = SECTIONS.find(s => slideNumber >= s.from && slideNumber <= s.to);
  const label = section?.name;
  return (
    <div className="absolute bottom-3 right-5 text-[11px] font-mono flex gap-2 items-center" style={{ color: colors.textDim + '99' }}>
      {label && <span style={{ color: colors.textDim + '70' }}>{label}</span>}
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
    <div className="text-[20px] text-hud-text-muted mt-1 font-sans tracking-[0.02em]">{l}</div>
  </div>
);

export default function Presentation() {
  return (
    <Deck theme={theme} template={slideTemplate}>

      {/* ═══════ OPENING ═══════ */}

      {/* 1: Title Slide */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center relative">
          <div className="absolute pointer-events-none" style={{ top: '-10%', right: '-15%', width: '80%', height: '120%' }}>
            <StaticTexasGrid width={700} height={700} opacity={0.12} />
          </div>
          <div className="relative z-[1]">
            <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.2em] uppercase mb-8">KubeCon + CloudNativeCon Europe 2026</div>
            <div className="text-[56px] font-extrabold font-sans leading-[1.1] mb-5" style={{ color: colors.primary, textShadow: `0 0 60px ${colors.primary}30` }}>
              Virtual Power Plants
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

      {/* 2: Agenda */}
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

      {/* 3: Section Title: The Grid */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-danger font-mono tracking-[0.15em] uppercase mb-4">Part I</div>
          <H size="54px" center color={colors.danger}>The Grid</H>
          <P size="20px" center>The world's largest machine — and why it keeps failing</P>
        </div>
      </Slide>


      {/* 4: Texas Cascade — deck.gl HUD */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <TexasMapHUD width="100%" height="100%" variant="hud" />
        </div>
      </Slide>

      {/* 5: Texas Numbers */}
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

      {/* 6: Grid Scale */}
      {versionD()}

      {/* 7: EU Grid HUD */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="w-full h-full">
          <EUGridHUD width="100%" height="100%" />
        </div>
      </Slide>

      {/* 8: Frequency Demo */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>The Grid: A Balancing Act</H>
          <P size="20px">This enormous machine maintains a constant 50 Hz frequency — supply and demand balanced every second.<br />Click an event to simulate what happens when something goes wrong.</P>
          <div className="flex-1 flex items-center" style={{ width: '100%' }}>
            <FrequencyDemo width={1286} height={480} panelWidth={340} />
          </div>
          <div className="flex justify-center">
            <div className="rounded-[10px] text-center" style={{ width: '68%', padding: '14px 24px', background: `${colors.accent}08`, border: `1px solid ${colors.accent}20` }}>
              <div className="text-[22px] text-hud-text font-sans">The entire European grid operates within a <span className="font-semibold" style={{ color: colors.accent }}>±0.2 Hz</span> band. Cross those thresholds and automated protection systems start disconnecting load or generators.</div>
            </div>
          </div>
        </div>
      </Slide>

      {/* ── Grid narrative continues ── */}

      {/* 9: Designed for a Different World */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H>Designed for a Different World</H>
          <P size="20px">Built in the 1950s. One-directional. No flexibility.</P>
          <GridFlowDemo width="100%" />
        </div>
      </Slide>

      {/* 10: The Old Playbook */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.accent}><span style={{ color: colors.danger, marginRight: 12, fontSize: '0.6em', verticalAlign: 'middle', opacity: 0.7 }}>[WIP]</span>The Old Playbook</H>
          <P size="20px">Before batteries and software, this is how the grid stayed stable. Expensive, dirty, and blunt.</P>
          <div className="flex-1 flex items-center">
            <div className="flex gap-5 w-full">
              {[
                { t: 'Peaker Plants', d: '261 GW of gas turbines in the US alone — sitting idle 95% of the year. They fire up for peak demand at 2–5x the cost of baseload.', c: '#fb923c', stat: '$110–228/MWh' },
                { t: 'Spinning Reserves', d: 'Generators running at partial load 24/7 "just in case." 15% capacity margin required. Burning fuel to produce nothing.', c: colors.accent, stat: '15% over-provisioned' },
                { t: 'Load Shedding', d: 'The last resort: deliberate rolling blackouts. Texas 2021 shed 20 GW — the largest in US history. The crisis cost ERCOT customers $52.6B in excess charges.', c: colors.danger, stat: '$52.6B in 5 days' },
                { t: 'Curtailment', d: 'Too much sun or wind? Turn it off. Germany wasted 19 TWh of clean energy in 2023. California curtailed 3.4 TWh in 2024.', c: colors.textDim, stat: 'EUR 3.3B/yr (DE)' },
              ].map(i => (
                <div key={i.t} className="bg-hud-surface rounded-xl px-4 py-5 flex-1" style={{ border: `1px solid ${i.c}25` }}>
                  <div className="text-[20px] font-bold font-sans mb-2" style={{ color: i.c }}>{i.t}</div>
                  <div className="text-[20px] text-hud-text-muted font-sans leading-normal mb-3">{i.d}</div>
                  <div className="text-[20px] font-mono font-semibold" style={{ color: i.c }}>{i.stat}</div>
                </div>
              ))}
            </div>
          </div>
          <P size="20px" style={{ fontStyle: 'italic' }}>"261 GW of capacity that runs 5% of the year. Rolling blackouts as policy. Clean energy thrown away. This is the toolkit we inherited."</P>
        </div>
      </Slide>


      {/* 11: Why Texas Failed */}
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
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[22px] font-extrabold font-mono shrink-0" style={{ background: `${step.color}15`, color: step.color }}>{step.icon}</div>
                <div className="text-[24px] text-hud-text font-sans" style={{ fontWeight: i >= 3 ? 600 : 400 }}>{step.text}</div>
              </div>
            ))}
          </div>
          <div className="flex gap-4">
            <StatBox n="52 GW" l="offline (of 107 GW total)" c={colors.danger} />
            <StatBox n="Isolated" l="no grid interconnection" c={colors.accent} />
            <StatBox n="42 hrs" l="average outage duration" c={colors.textMuted} />
          </div>
        </div>
      </Slide>

      {/* 12: It Keeps Happening */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
        <H color={colors.danger}>Not an Isolated Incident</H>
        <div className="flex-1 flex items-center">
        <div className="flex gap-14 w-full">
          <div className="flex-1 flex flex-col gap-8 justify-center">
            {[
              { y: '2003', e: 'Northeast US/Canada', i: '55M people, $6B in damage' },
              { y: '2003', e: 'Italy Blackout', i: '56M people' },
              { y: '2006', e: 'European Grid Split', i: '15M affected' },
              { y: '2016', e: 'South Australia (tornadoes)', i: 'Entire state, 1.7M people' },
              { y: '2017', e: 'South Australia (heatwave)', i: '90K homes, 45°C day' },
            ].map(t => (
              <div key={t.y+t.e} className="flex gap-4">
                <div className="font-mono text-[28px] font-bold text-hud-danger min-w-[56px]">{t.y}</div>
                <div>
                  <div className="text-[26px] font-semibold text-hud-text font-sans">{t.e}</div>
                  <div className="text-[22px] text-hud-text-muted font-sans">{t.i}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 flex flex-col gap-8 justify-center">
            {[
              { y: '2021', e: 'Texas ERCOT', i: '4.5M homes, 240+ deaths', c: colors.danger },
              { y: '2021', e: 'Europe Grid Split', i: '1.25 Hz from collapse', c: colors.danger },
              { y: '2025', e: 'Spain/Portugal', i: '60M people', c: colors.accent },
              { y: '2025', e: 'Berlin Arson (x3)', i: '45K+ homes', c: colors.accent },
              { y: '2026', e: 'Berlin Teltow Canal', i: '4-day outage', c: colors.primary },
            ].map(t => (
              <div key={t.y+t.e} className="flex gap-4">
                <div className="font-mono text-[28px] font-bold min-w-[56px]" style={{ color: t.c || colors.danger }}>{t.y}</div>
                <div>
                  <div className="text-[26px] font-semibold text-hud-text font-sans">{t.e}</div>
                  <div className="text-[22px] text-hud-text-muted font-sans">{t.i}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
        </div>
      </Slide>


      {/* 13: No Flexibility — Bridge */}
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

      {/* 14: The Renewable Revolution */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-accent font-mono tracking-[0.15em] uppercase mb-4">Part II</div>
          <H size="50px" center color={colors.accent}>The Renewable Revolution</H>
          <P size="20px" center>Inevitable, amazing — and a whole new kind of problem</P>
        </div>
      </Slide>

      {/* 15: The Renewable Explosion */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>The Renewable Explosion</H>
          <P size="20px">Germany's electricity from renewables — this is not slowing down.</P>
          <div className="flex-1 flex justify-center items-center">
            <RenewableGrowthChart width={940} height={440} />
          </div>
        </div>
      </Slide>

      {/* 16: The Duck Curve Problem */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>The Duck Curve Problem</H>
          <P size="20px">More solar every year. The belly deepens. The evening ramp steepens. Prices go haywire.</P>
          <div className="flex-1 flex justify-center items-center">
            <DuckCurveChart width={1100} height={480} />
          </div>
        </div>
      </Slide>

      {/* 17: The Cost of Wasted Energy */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H color={colors.danger}>Clean Energy Has Outgrown the Grid</H>
          <div className="flex-1 flex justify-center items-center">
            <CurtailmentChart width={940} height={340} />
          </div>
          <P size="22px" style={{ textAlign: 'center', marginTop: 0, marginBottom: 16 }}><span style={{ color: colors.danger }}>Grid Congestion</span> is overwhelming neighborhood transformers.<br />New long-distance lines won't fix 49% of the problem.</P>
          <div style={{ fontSize: 12, color: colors.textDim, fontFamily: '"Inter", sans-serif', textAlign: 'left', marginTop: 0 }}>Germany — Bundesnetzagentur 2024 data. North-south transmission bottlenecks (SuedLink delayed to 2028)</div>
        </div>
      </Slide>

      {/* ═══════ ACT 3: THE VIRTUAL POWER PLANT ═══════ */}

      {/* 18: Consumers Become Infrastructure */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col items-center h-full text-center">
          <H size="42px" center>Consumers Become Infrastructure</H>
          <div className="text-[26px] text-hud-text font-sans leading-[1.7] mt-4 whitespace-nowrap">
            Homes with solar and batteries can <span className="font-semibold" style={{ color: colors.solar }}>charge</span>, <span className="font-semibold" style={{ color: colors.success }}>export</span>, and <span className="font-semibold" style={{ color: colors.primary }}>shift consumption</span>.
          </div>
          <ConsumerIcons />
        </div>
      </Slide>

      {/* 20: The Virtual Power Plant */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.15em] uppercase mb-4">Part III</div>
          <H size="50px" center>The Virtual Power Plant</H>
          <P size="20px" center>Software that turns distributed energy into grid infrastructure</P>
        </div>
      </Slide>

      {/* 20: What Is a Virtual Power Plant? */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>What Is a Virtual Power Plant?</H>
          <P size="20px">From market signal to battery response — the command flow through our VPP architecture.</P>
          <div className="flex-1 flex justify-center items-center">
            <VPPArchitecture width={1272} height={648} />
          </div>
        </div>
      </Slide>

      {/* 21: Inside the Architecture */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H>Inside the Architecture</H>
          <P size="18px">Measurement data every 20 seconds — Protobuf over MQTT through EMQX, into Databricks streaming aggregates powered by Apache Spark.</P>
          <div className="flex-1 flex justify-center items-center">
            <EnpalArchitectureDiagram width={1128} height={528} />
          </div>
          <div className="flex gap-4 mt-1">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: colors.success }} /><span className="text-[11px] font-mono" style={{ color: colors.textDim }}>Home System</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: colors.primary }} /><span className="text-[11px] font-mono" style={{ color: colors.textDim }}>Cloud / Control</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: '#E25A1C' }} /><span className="text-[11px] font-mono" style={{ color: colors.textDim }}>Databricks + Spark</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: colors.accent }} /><span className="text-[11px] font-mono" style={{ color: colors.textDim }}>Event Hub + Flexa</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ background: colors.textMuted }} /><span className="text-[11px] font-mono" style={{ color: colors.textDim }}>External</span></div>
          </div>
        </div>
      </Slide>

      {/* 22: VPP Event Types */}
      <Slide backgroundColor={bg} padding={pad}>
        <style>{`
          @keyframes vppEventIn {
            0% { opacity: 0; transform: translateX(-24px); filter: blur(3px); }
            100% { opacity: 1; transform: translateX(0); filter: blur(0); }
          }
          @keyframes vppEventBorder {
            0% { clip-path: inset(0 100% 0 0); }
            100% { clip-path: inset(0 0% 0 0); }
          }
          @keyframes vppEventGlow {
            0% { box-shadow: none; }
            50% { box-shadow: 0 0 12px var(--glow-color); }
            100% { box-shadow: none; }
          }
        `}</style>
        <div className="flex flex-col h-full">
          <H>How a VPP Responds to Grid Events</H>
          <P size="20px">Different event types require different response strategies and timescales.</P>
          <div className="flex flex-col justify-center gap-3 mt-2">
            {[
              { event: 'Frequency Containment (FCR)', time: '< 30 seconds', desc: 'Battery injects/absorbs power to stabilize grid frequency', cost: 'Blackout cost: EUR 1-5B per event', color: colors.danger, delay: 0.2 },
              { event: 'Automatic Frequency Restoration (aFRR)', time: '< 5 minutes', desc: 'Sustained response to restore frequency to 50 Hz', cost: 'Gas peaker alternative: EUR 150-300/MWh', color: colors.accent, delay: 0.5 },
              { event: 'Peak Shaving', time: '1-4 hours', desc: 'Reduce grid load during demand peaks by discharging batteries', cost: 'Grid upgrade deferred: EUR 35B (RMI est.)', color: colors.primary, delay: 0.9 },
              { event: 'Energy Arbitrage', time: 'Scheduled', desc: 'Charge at negative prices, discharge at peak — optimizing day-ahead markets', cost: 'Curtailment avoided: EUR 554M/yr (DE)', color: colors.success, delay: 1.4 },
            ].map(e => (
              <div key={e.event} className="flex items-start gap-4 rounded-lg p-3"
                style={{
                  background: `${e.color}06`,
                  border: `1px solid ${e.color}15`,
                  opacity: 0,
                  '--glow-color': e.color + '20',
                  animation: `vppEventIn 0.5s ease ${e.delay}s forwards, vppEventGlow 1s ease ${e.delay + 0.4}s both`,
                }}>
                <div className="min-w-[140px]">
                  <div className="text-[17px] font-semibold font-sans" style={{ color: e.color }}>{e.event}</div>
                  <div className="text-[13px] font-mono mt-1" style={{ color: colors.textDim, opacity: 0, animation: `vppEventIn 0.3s ease ${e.delay + 0.25}s forwards` }}>{e.time}</div>
                </div>
                <div className="flex-1">
                  <div className="text-[17px] text-hud-text-muted font-sans">{e.desc}</div>
                  <div className="text-[13px] font-mono mt-1" style={{ color: e.color + 'aa', opacity: 0, animation: `vppEventIn 0.3s ease ${e.delay + 0.35}s forwards` }}>{e.cost}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 flex items-end justify-center pb-2">
            <ResponseTimeline width={860} height={130} />
          </div>
        </div>
      </Slide>

      {/* 24: VPP Summer Scenario — Energy Arbitrage */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <VPPScenarioSlide scenario="summer" />
        </div>
      </Slide>

      {/* 26: VPP Winter Scenario — Grid Emergency */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <VPPScenarioSlide scenario="winter" />
        </div>
      </Slide>

      {/* VPP Impact Summary — With vs Without */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.success}>The Economic Impact of Flexibility</H>
          <P size="20px">What changes when distributed batteries respond in milliseconds instead of hours.</P>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-[900px]">
              <div className="flex gap-5 mb-5">
                <div className="flex-1 text-center text-[18px] font-mono font-semibold py-2 rounded-t-lg" style={{ color: colors.danger, background: colors.danger + '0a', borderBottom: `2px solid ${colors.danger}40` }}>Without VPP</div>
                <div className="w-[160px]" />
                <div className="flex-1 text-center text-[18px] font-mono font-semibold py-2 rounded-t-lg" style={{ color: colors.success, background: colors.success + '0a', borderBottom: `2px solid ${colors.success}40` }}>With VPP</div>
              </div>
              {[
                { metric: 'Grid Emergency', without: 'Cascade failure, 4+ hours', withVpp: 'Stabilized in 200ms', icon: 'FCR' },
                { metric: 'Peak Demand', without: 'Gas peakers: EUR 150-300/MWh', withVpp: 'Battery discharge: EUR 30-60/MWh', icon: 'Cost' },
                { metric: 'Negative Prices', without: 'Curtail renewables, pay EUR 554M/yr', withVpp: 'Charge batteries, earn revenue', icon: 'Price' },
                { metric: 'Grid Upgrades', without: 'EUR 35B+ new infrastructure', withVpp: 'Defer 60% with distributed flex', icon: 'Infra' },
                { metric: 'CO2 Emissions', without: '3.4 Mt avoidable CO2/yr (DE)', withVpp: 'Near-zero curtailment emissions', icon: 'CO2' },
              ].map((r, i) => (
                <div key={r.metric} className="flex gap-5 mb-3 items-center" style={{ animation: `archLeftIn 0.5s ease ${0.3 + i * 0.15}s both` }}>
                  <div className="flex-1 rounded-lg p-4 text-[18px] font-sans text-hud-text-muted" style={{ background: colors.danger + '06', border: `1px solid ${colors.danger}12` }}>
                    {r.without}
                  </div>
                  <div className="w-[160px] text-center">
                    <div className="text-[16px] font-semibold font-mono" style={{ color: colors.primary }}>{r.metric}</div>
                  </div>
                  <div className="flex-1 rounded-lg p-4 text-[18px] font-sans font-semibold" style={{ color: colors.success, background: colors.success + '06', border: `1px solid ${colors.success}12` }}>
                    {r.withVpp}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Slide>

      {/* ── The Architecture (sub-section) ── */}

      {/* The Architecture Parallel */}
      <Slide backgroundColor={bg} padding={pad}>
        <style>{`
          @keyframes archLeftIn {
            0% { opacity: 0; transform: translateX(-30px); filter: blur(4px); }
            100% { opacity: 1; transform: translateX(0); filter: blur(0); }
          }
          @keyframes archRightIn {
            0% { opacity: 0; transform: translateX(30px); filter: blur(4px); }
            100% { opacity: 1; transform: translateX(0); filter: blur(0); }
          }
          @keyframes archVsIn {
            0% { opacity: 0; transform: scale(0.5); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}</style>
        <div className="flex flex-col h-full w-full">
          <H>The Architecture Parallel</H>
          <div className="flex-1 flex flex-col justify-center w-full max-w-[880px] mx-auto gap-5">
            {[
              { grid: 'Few large generators', vpp: 'Distributed edge nodes', color: colors.danger },
              { grid: 'Manual planning', vpp: 'Semi-autonomous autoscaling', color: colors.accent },
              { grid: 'Isolated resilience', vpp: 'Integrated resilience', color: colors.primary },
              { grid: 'Centralized observability (SCADA)', vpp: 'Full-stack observability', color: colors.success },
            ].map((row, i) => {
              const delay = 0.3 + i * 0.35;
              return (
                <div key={i} className="flex gap-4 items-start">
                  <div className="flex-1 rounded-lg p-4" style={{
                    background: `${row.color}06`,
                    border: `1px solid ${row.color}15`,
                    animation: `archLeftIn 0.6s ease-out ${delay}s both`,
                  }}>
                    <div className="text-[20px] font-semibold font-sans" style={{ color: row.color }}>
                      {row.grid}
                    </div>
                  </div>
                  <div className="text-[22px] text-hud-text-dim font-mono pt-3" style={{
                    animation: `archVsIn 0.3s ease-out ${delay + 0.15}s both`,
                  }}>vs</div>
                  <div className="flex-1 rounded-lg p-4 bg-hud-surface border border-hud-surface-light" style={{
                    animation: `archRightIn 0.6s ease-out ${delay + 0.1}s both`,
                  }}>
                    <div className="text-[20px] text-hud-text font-sans font-medium">
                      {row.vpp}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <P size="20px" center style={{ fontFamily: '"JetBrains Mono"' }}>Frequency = SLO &bull; Cascade = failure propagation &bull; Batteries = autoscaling</P>
        </div>
      </Slide>

      {/* 29: The Economic Impact of Flexibility */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.success}><span style={{ color: colors.danger, marginRight: 12, fontSize: '0.6em', verticalAlign: 'middle', opacity: 0.7 }}>[WIP]</span>The Economic Impact of Flexibility</H>
          <P>Flexible demand doesn't just stabilize the grid — it makes electricity dramatically cheaper.</P>
          <div className="flex-1 flex flex-col justify-center gap-5 my-3">
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl p-5" style={{ background: `${colors.success}06`, border: `1px solid ${colors.success}20` }}>
                <div className="text-[20px] font-semibold font-mono mb-2" style={{ color: colors.success }}>RMI — Power Shift (Texas / ERCOT, modeled)</div>
                <div className="text-[20px] text-hud-text font-sans mb-1">Full demand flexibility cuts net generation costs by <span className="font-semibold" style={{ color: colors.success }}>20%</span></div>
                <div className="text-[20px] text-hud-text font-sans mb-1">Saves <span className="font-semibold" style={{ color: colors.success }}>$140/household/year</span> with just 2 flexible devices</div>
                <div className="text-[20px] text-hud-text font-sans">Avoids <span className="font-semibold" style={{ color: colors.success }}>75%</span> of new gas peaker units</div>
              </div>
              <div className="flex-1 rounded-xl p-5" style={{ background: `${colors.primary}06`, border: `1px solid ${colors.primary}20` }}>
                <div className="text-[20px] font-semibold font-mono mb-2" style={{ color: colors.primary }}>Brattle Group — National US (projected)</div>
                <div className="text-[20px] text-hud-text font-sans mb-1">60 GW of VPPs save <span className="font-semibold" style={{ color: colors.primary }}>$15–35B</span> over 10 years</div>
                <div className="text-[20px] text-hud-text font-sans mb-1">Household bills <span className="font-semibold" style={{ color: colors.primary }}>down up to 20%</span> (Australia ISP 2024)</div>
                <div className="text-[20px] text-hud-text font-sans">Home batteries avoid <span className="font-semibold" style={{ color: colors.primary }}>$4.1B</span> in grid investment</div>
              </div>
            </div>
            <div className="flex gap-4">
              <StatBox n="20%" l="Generation cost reduction at full flexibility" c={colors.success} />
              <StatBox n="$10–15B/yr" l="US grid savings from 2 flexible devices per home" c={colors.primary} />
              <StatBox n="8%" l="Peak demand reduction from smart thermostats + water heaters" c={colors.accent} />
            </div>
          </div>
          <P size="20px" style={{ fontStyle: 'italic' }}>"The cheapest megawatt is the one you never have to generate."</P>
        </div>
      </Slide>

      {/* 30: SA Blackout, 2016 */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <SAMapHUD width="100%" height="100%" variant="blackout" />
        </div>
      </Slide>

      {/* 31: SA Virtual Power Plant, 2019 */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <SAMapHUD width="100%" height="100%" variant="vpp" />
        </div>
      </Slide>

      {/* ═══════ ACT 4: RESILIENCE ═══════ */}

      {/* 32: Back to Texas */}
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

      {/* 33: Thank You */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <H size="54px" center>Thank You</H>
          <P size="20px" center><span className="text-hud-primary font-semibold">Enpal</span> — Building Europe's Largest Virtual Power Plant</P>
        </div>
      </Slide>

      {/* ═══════ APPENDIX ═══════ */}

      {/* Now We Shift the Load */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H color={colors.success}>Now We Shift the Load</H>
          <P size="20px">Batteries absorb midday solar. Discharge in the evening. Click "With VPP" below.</P>
          <div className="flex-1 flex justify-center items-center">
            <DuckCurveVPP width={940} height={440} />
          </div>
        </div>
      </Slide>

      {/* The Dunkelflaute */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.danger}>The Dunkelflaute</H>
          <P>Dark doldrums — when wind and solar collapse simultaneously. High pressure brings still air and overcast skies.</P>
          <div className="flex-1 flex items-center">
            <div className="flex gap-5 w-full">
              <div className="flex-1 rounded-xl p-5" style={{ background: `${colors.danger}06`, border: `1px solid ${colors.danger}20` }}>
                <div className="text-[20px] font-semibold font-mono mb-3" style={{ color: colors.danger }}>GERMANY — NOV 2024</div>
                <div className="text-[20px] text-hud-text font-sans mb-2">
                  Wind installed: <span className="font-semibold" style={{ color: colors.primary }}>72.75 GW</span>
                </div>
                <div className="text-[20px] text-hud-text font-sans mb-2">
                  Wind output during event: <span className="font-semibold" style={{ color: colors.danger }}>2.8 GW (3.8%)</span>
                </div>
                <div className="text-[20px] text-hud-text font-sans mb-2">
                  Solar contribution: <span className="font-semibold" style={{ color: colors.accent }}>4.3%</span> vs ~25% summer
                </div>
                <div className="text-[20px] text-hud-text font-sans">
                  Renewables total: <span className="font-semibold" style={{ color: colors.danger }}>30%</span> (vs normal 50%+)
                </div>
              </div>
              <div className="flex-1 flex flex-col gap-4">
                <div className="rounded-xl p-4" style={{ background: `${colors.accent}06`, border: `1px solid ${colors.accent}20` }}>
                  <div className="text-[20px] font-semibold font-mono mb-1" style={{ color: colors.accent }}>DURATION</div>
                  <div className="text-[20px] text-hud-text font-sans">
                    <span className="font-semibold" style={{ color: colors.accent }}>14 consecutive days</span> below 10% of installed renewable capacity
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: `${colors.accent}06`, border: `1px solid ${colors.accent}20` }}>
                  <div className="text-[20px] font-semibold font-mono mb-1" style={{ color: colors.accent }}>PRICE IMPACT</div>
                  <div className="text-[20px] text-hud-text font-sans">
                    Prices spiked to <span className="font-semibold" style={{ color: colors.danger }}>EUR 175/MWh</span> — 4x the average
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: `${colors.textDim}06`, border: `1px solid ${colors.textDim}20` }}>
                  <div className="text-[20px] font-semibold font-mono mb-1" style={{ color: colors.textDim }}>FREQUENCY</div>
                  <div className="text-[20px] text-hud-text font-sans">Occurs <span className="font-semibold">2–10 times per year</span>, lasting 50–150 hours/month in winter</div>
                </div>
              </div>
            </div>
          </div>
          <P size="20px" style={{ fontStyle: 'italic' }}>"You cannot go 100% renewable without storage and flexibility."</P>
        </div>
      </Slide>

      {/* 35: Demand Response in Action */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3">
            <H color={colors.success}><span style={{ color: colors.danger, marginRight: 12, fontSize: '0.6em', verticalAlign: 'middle', opacity: 0.7 }}>[WIP]</span>Demand Response in Action</H>
            <Badge color={colors.accent}>Still in Infancy</Badge>
          </div>
          <P size="20px">Instead of building more power plants — reshape the demand. Trip a generator and watch what happens.</P>
          <div className="flex-1 flex justify-center items-center">
            <DemandResponseDemo width={920} height={420} />
          </div>
          <P size="18px" color={colors.textDim} style={{ fontStyle: 'italic' }}>Note: Current deployment is extremely limited. Focus on the challenges — most grids have no demand-side flexibility at scale today.</P>
        </div>
      </Slide>

    </Deck>
  );
}
