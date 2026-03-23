import React from 'react';
import { Deck, Slide, Heading, Text, Notes, Stepper } from 'spectacle';
import { colors } from './theme';
import { LazyContent } from './components/ui';
import FrequencyDemo from './components/FrequencyDemo';

/** Resolve public assets relative to Vite's base URL (handles subpath deployment) */
const asset = (path) => `${(import.meta.env.BASE_URL || '/').replace(/\/$/, '')}${path}`;
import RenewableGrowthChart from './components/RenewableGrowthChart';
import DuckCurveChart from './components/DuckCurveChart';
import DuckCurveVPP from './components/DuckCurveVPP';
import AnimatedStat from './components/AnimatedStat';
import StaticTexasGrid from './components/StaticTexasGrid';
import TexasMapHUD from './components/TexasMapHUD';
import { gridScale } from './slides/GridScaleSlides';
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
import ThankYouBackground from './components/ThankYouBackground';
import FrequencyWalkthrough from './components/FrequencyWalkthrough';
import ArchitectureExplorer from './components/ArchitectureExplorer';
import ChoreographyLoop from './components/ChoreographyLoop';
import StreamingAggregation from './components/StreamingAggregation';
import AggregationPyramid from './components/AggregationPyramid';


const theme = {
  colors: { primary: colors.text, secondary: colors.textMuted, tertiary: colors.primary },
  fonts: { header: '"Inter", system-ui, sans-serif', text: '"Inter", system-ui, sans-serif' },
};

const bg = colors.bg;
const pad = '36px 56px';

// Section ranges (slide numbers are 1-indexed)
// Slide count: 35 main + appendix. Architecture has 4 sub-slides (25-28).
const SECTIONS = [
  { from: 1, to: 3, name: '' },
  { from: 4, to: 16, name: 'The Grid' },
  { from: 17, to: 20, name: 'The Renewable Revolution' },
  { from: 21, to: 34, name: 'The Virtual Power Plant' },
];

// Speaker assignments per slide (34 main slides)
// 1-3: Opening, 4-16: The Grid, 17-20: Renewables,
// 21-32: VPP, 33-34: Closing
const SPEAKERS = {
  1: 'SHARED', 2: 'SHARED', 3: 'SHARED',
  4: 'LERENZO', 5: 'LERENZO', 6: 'LERENZO',
  7: 'MARIO', 8: 'LERENZO', 9: 'MARIO', 10: 'MARIO',
  11: 'MARIO', 12: 'MARIO', 13: 'LERENZO', 14: 'MARIO', 15: 'LERENZO', 16: 'LERENZO',
  17: 'LERENZO', 18: 'MARIO', 19: 'MARIO', 20: 'MARIO',
  21: 'MARIO', 22: 'MARIO', 23: 'LERENZO', 24: 'LERENZO',
  25: 'LERENZO', 26: 'LERENZO', 27: 'LERENZO', 28: 'LERENZO',
  29: 'LERENZO', 30: 'LERENZO', 31: 'LERENZO', 32: 'MARIO',
  33: 'LERENZO', 34: 'LERENZO',
};

const DISABLED_VALUES = new Set(['', 'null', 'no', 'disable', 'disabled', 'nein', 'false', '0', 'off']);
const speakerParam = new URLSearchParams(window.location.search).get('speaker');
const showSpeaker = speakerParam !== null && !DISABLED_VALUES.has(speakerParam.trim().toLowerCase());

const MAIN_SLIDE_COUNT = 34;

const slideTemplate = ({ slideNumber, numberOfSlides }) => {
  const isAppendix = slideNumber > MAIN_SLIDE_COUNT;
  const section = SECTIONS.find(s => slideNumber >= s.from && slideNumber <= s.to);
  const label = isAppendix ? 'Appendix' : section?.name;
  const display = isAppendix
    ? `A${slideNumber - MAIN_SLIDE_COUNT} / ${numberOfSlides - MAIN_SLIDE_COUNT}`
    : `${slideNumber} / ${MAIN_SLIDE_COUNT}`;
  const speaker = showSpeaker ? SPEAKERS[slideNumber] : null;
  return (
    <>
      {speaker && (
        <div className="absolute top-3 left-5 text-xs font-mono tracking-widest uppercase" style={{ color: colors.textDim + '80' }}>
          {speaker}
        </div>
      )}
      <a href="?slideIndex=0" className="absolute bottom-3 right-5 text-xs font-mono flex gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity" style={{ color: colors.textMuted, textDecoration: 'none' }}>
        {label && <span style={{ color: colors.textDim }}>{label}</span>}
        <span>{display}</span>
      </a>
    </>
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
      <Slide backgroundColor={bg} padding="0">
        <div className="relative w-full h-full">
          <LazyContent><ThankYouBackground width={1366} height={768} /></LazyContent>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 55% 50% at center, ${colors.bg}ee 0%, ${colors.bg}aa 50%, transparent 80%)` }} />
          <div className="absolute inset-0 flex flex-col justify-center items-center z-10 text-center">
            <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.2em] uppercase mb-8">KubeCon + CloudNativeCon Europe 2026</div>
            <div className="text-[56px] font-extrabold font-sans leading-[1.1] mb-5" style={{ color: colors.primary, textShadow: `0 0 60px ${colors.primary}30` }}>
              What is a Virtual Power Plant?
            </div>
            <div className="text-[22px] text-hud-text-muted font-sans mb-12">
              Cloud-Native Infrastructure for the Energy Grid
            </div>
            <div className="flex gap-6 justify-center items-center">
              <img src={asset("/enpal-logo.svg")} alt="Enpal" className="h-24"/>
            </div>
          </div>
        </div>
        <Notes>
          Welcome to KubeCon, thank you for being here.
          I work at Enpal — we're building Europe's largest virtual power plant.
          Before we talk about what a VPP is, we need to talk about the thing it's trying to fix.
        </Notes>
      </Slide>

      {/* 2: Speakers & Partners */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          {/* Speakers */}
          <div className="flex gap-16 mb-12">
            <div className="flex flex-col items-center">
              <img src={asset("/lerenzo.png")} alt="LeRenzo" className="w-28 h-28 rounded-full mb-4 object-cover object-[center_35%] border-2" style={{ borderColor: `${colors.primary}40`, boxShadow: `0 0 20px ${colors.primary}15` }} />
              <div className="text-xl font-bold text-hud-text font-sans">LeRenzo Tolbert-Malcolm</div>
              <div className="text-lg text-hud-text-muted font-sans mt-1">Staff Engineer, VPP</div>
            </div>
            <div className="flex flex-col items-center">
              <img src={asset("/mario.png")} alt="Mario" className="w-28 h-28 rounded-full mb-4 object-cover object-[center_35%] border-2" style={{ borderColor: `${colors.primary}40`, boxShadow: `0 0 20px ${colors.primary}15` }} />
              <div className="text-xl font-bold text-hud-text font-sans">Mario Olivio Flores</div>
              <div className="text-lg text-hud-text-muted font-sans mt-1">Engineering Manager, VPP</div>
            </div>
          </div>

          {/* Main brand */}
          <div className="mb-10 flex flex-col items-center">
            <img src={asset("/enpal-logo.svg")} alt="Enpal" className="h-32" />
            <div className="text-lg text-hud-text-muted font-sans mt-4">
              Building Europe's Largest Virtual Power Plant
            </div>
          </div>

          {/* Partners — connected by transmission lines */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-lg text-hud-text-dim font-mono mb-1">Partners</span>
            <style>{`
              @keyframes flowDash { to { stroke-dashoffset: -18; } }
            `}</style>
            <div className="flex items-center">
              <img src={asset("/flexa-logo.svg")} alt="Flexa" className="h-10" />
              {/* Cables: Flexa → pylon 1 */}
              <svg className="h-14 flex-1 -mx-1" viewBox="0 0 100 48" preserveAspectRatio="none" fill="none">
                <path d="M0,16 Q50,26 100,9" stroke={colors.primary} strokeWidth="0.7" opacity="0.2" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 1.5s linear infinite' }} />
                <path d="M0,20 Q50,32 100,18" stroke={colors.primary} strokeWidth="0.7" opacity="0.18" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 1.8s linear infinite', animationDelay: '-0.4s' }} />
                <path d="M0,24 Q50,38 100,27" stroke={colors.primary} strokeWidth="0.6" opacity="0.14" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 2.1s linear infinite', animationDelay: '-0.9s' }} />
              </svg>
              {/* Pylon 1 */}
              <svg className="h-12 shrink-0" viewBox="0 0 36 48" fill="none" style={{ filter: `drop-shadow(0 0 4px ${colors.primary}30)` }}>
                <line x1="18" y1="1" x2="18" y2="47" stroke={colors.primary} strokeWidth="1.6" opacity="0.45" />
                <path d="M5,9 Q18,12 31,9" stroke={colors.primary} strokeWidth="1.3" opacity="0.4" />
                <path d="M5,18 Q18,21 31,18" stroke={colors.primary} strokeWidth="1.3" opacity="0.4" />
                <path d="M5,27 Q18,30 31,27" stroke={colors.primary} strokeWidth="1.3" opacity="0.4" />
                <path d="M5,36 Q18,39 31,36" stroke={colors.primary} strokeWidth="1.3" opacity="0.4" />
              </svg>
              {/* Cables: pylon 1 → Entrix */}
              <svg className="h-14 flex-1 -mx-1" viewBox="0 0 100 48" preserveAspectRatio="none" fill="none">
                <path d="M0,9 Q50,26 100,16" stroke={colors.primary} strokeWidth="0.7" opacity="0.2" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 1.6s linear infinite', animationDelay: '-0.2s' }} />
                <path d="M0,18 Q50,32 100,20" stroke={colors.primary} strokeWidth="0.7" opacity="0.18" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 1.9s linear infinite', animationDelay: '-0.7s' }} />
                <path d="M0,27 Q50,38 100,24" stroke={colors.primary} strokeWidth="0.6" opacity="0.14" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 2.2s linear infinite', animationDelay: '-1.1s' }} />
              </svg>
              <span className="text-xl font-bold font-mono shrink-0 px-1" style={{ color: colors.entrixBlue }}>Entrix</span>
              {/* Cables: Entrix → pylon 2 */}
              <svg className="h-14 flex-1 -mx-1" viewBox="0 0 100 48" preserveAspectRatio="none" fill="none">
                <path d="M0,16 Q50,26 100,9" stroke={colors.primary} strokeWidth="0.7" opacity="0.2" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 1.7s linear infinite', animationDelay: '-0.3s' }} />
                <path d="M0,20 Q50,32 100,18" stroke={colors.primary} strokeWidth="0.7" opacity="0.18" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 2.0s linear infinite', animationDelay: '-0.8s' }} />
                <path d="M0,24 Q50,38 100,27" stroke={colors.primary} strokeWidth="0.6" opacity="0.14" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 2.3s linear infinite', animationDelay: '-1.3s' }} />
              </svg>
              {/* Pylon 2 */}
              <svg className="h-12 shrink-0" viewBox="0 0 36 48" fill="none" style={{ filter: `drop-shadow(0 0 4px ${colors.primary}30)` }}>
                <line x1="18" y1="1" x2="18" y2="47" stroke={colors.primary} strokeWidth="1.6" opacity="0.45" />
                <path d="M5,9 Q18,12 31,9" stroke={colors.primary} strokeWidth="1.3" opacity="0.4" />
                <path d="M5,18 Q18,21 31,18" stroke={colors.primary} strokeWidth="1.3" opacity="0.4" />
                <path d="M5,27 Q18,30 31,27" stroke={colors.primary} strokeWidth="1.3" opacity="0.4" />
                <path d="M5,36 Q18,39 31,36" stroke={colors.primary} strokeWidth="1.3" opacity="0.4" />
              </svg>
              {/* Cables: pylon 2 → Metrify */}
              <svg className="h-14 flex-1 -mx-1" viewBox="0 0 100 48" preserveAspectRatio="none" fill="none">
                <path d="M0,9 Q50,26 100,16" stroke={colors.primary} strokeWidth="0.7" opacity="0.2" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 1.5s linear infinite', animationDelay: '-0.5s' }} />
                <path d="M0,18 Q50,32 100,20" stroke={colors.primary} strokeWidth="0.7" opacity="0.18" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 1.8s linear infinite', animationDelay: '-1.0s' }} />
                <path d="M0,27 Q50,38 100,24" stroke={colors.primary} strokeWidth="0.6" opacity="0.14" pathLength="1" strokeDasharray="4 3" style={{ animation: 'flowDash 2.1s linear infinite', animationDelay: '-1.4s' }} />
              </svg>
              <span className="text-xl font-bold font-mono shrink-0" style={{ color: colors.success }}>Metrify</span>
            </div>
          </div>
        </div>
      </Slide>

      {/* 3: Agenda */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center h-full">
          <H size="36px">Agenda</H>
          <div className="flex flex-col gap-5 mt-6">
            {[
              { num: '01', title: 'The Grid', sub: 'How the world\'s largest machine works — and how it fails', color: colors.danger, time: '~10 min', slide: 3 },
              { num: '02', title: 'The Renewable Revolution', sub: 'Why cheap clean energy creates expensive new problems', color: colors.accent, time: '~7 min', slide: 16 },
              { num: '03', title: 'The Virtual Power Plant', sub: 'Software that turns millions of devices into grid infrastructure', color: colors.primary, time: '~15 min', slide: 22 },
            ].map(s => (
              <a key={s.num} href={`?slideIndex=${s.slide}`} className="flex items-center gap-5 no-underline cursor-pointer" style={{ textDecoration: 'none' }}>
                <div className="text-[28px] font-extrabold font-mono min-w-[48px] text-right" style={{ color: s.color }}>{s.num}</div>
                <div className="flex-1" style={{ borderLeft: `2px solid ${s.color}40`, paddingLeft: 20 }}>
                  <div className="text-[22px] font-bold text-hud-text font-sans">{s.title}</div>
                  <div className="text-[20px] text-hud-text-muted font-sans mt-0.5">{s.sub}</div>
                </div>
                <div className="text-[20px] text-hud-text-dim font-mono">{s.time}</div>
              </a>
            ))}
            {/* Appendix — dimmed */}
            <a href="?slideIndex=35" className="flex items-center gap-5 no-underline cursor-pointer mt-2" style={{ textDecoration: 'none', opacity: 0.35 }}>
              <div className="text-[28px] font-extrabold font-mono min-w-[48px] text-right" style={{ color: colors.textDim }}></div>
              <div className="flex-1" style={{ borderLeft: `2px solid ${colors.textDim}30`, paddingLeft: 20 }}>
                <div className="text-[22px] font-bold text-hud-text font-sans">Appendix</div>
                <div className="text-[20px] text-hud-text-muted font-sans mt-0.5">Additional scenarios, data, and references</div>
              </div>
            </a>
          </div>
        </div>
        <Notes>
          Three parts: The Grid, Renewables, and the VPP itself.
          ~35 minutes total — we'll go fast.
          By the end you'll understand why the energy grid is the most exciting distributed systems problem on the planet.
        </Notes>
      </Slide>

      {/* ═══════ ACT 1: THE GRID ═══════ */}

      {/* 4: Section Title: The Grid */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-danger font-mono tracking-[0.15em] uppercase mb-4">Part I</div>
          <H size="50px" center color={colors.danger}>The Grid</H>
          <P size="20px" center>The world's largest machine.</P>
        </div>
        <Notes>
          [LERENZO] "The world's largest machine" — this isn't hyperbole, we're going to prove it.
        </Notes>
      </Slide>


      {/* 5: Texas Cascade — deck.gl HUD */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <TexasMapHUD width="100%" height="100%" variant="hud" />
        </div>
        <Notes>
          [LERENZO] February 2021 — a polar vortex hits Texas.
          Watch the grid go dark, county by county.
          This is real data — 4.5 million homes lost power.
        </Notes>
      </Slide>

      {/* 6: Texas Numbers */}
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
            <AnimatedStat target="$195B" label="in damage (Perryman est.)" color={colors.accent} delay={600} duration={1400} />
            <AnimatedStat target="4.5M" label="homes dark" color={colors.textMuted} delay={900} duration={1100} />
          </div>
          <div className="text-[20px] text-hud-text font-sans leading-[1.8]">
            Wholesale electricity spiked from ~$50 to <span className="font-semibold" style={{ color: colors.danger }}>$9,000/MWh</span> — a <span className="font-semibold" style={{ color: colors.danger }}>180x</span> increase.
            <br />Families received <span className="font-semibold" style={{ color: colors.danger }}>$7,000 bills</span> in a single week. Their provider — Griddy — went bankrupt.
          </div>
          <div className="pt-3.5" style={{ borderTop: `1px solid ${colors.surfaceLight}` }}>
            <div className="text-[20px] text-hud-primary font-sans font-medium">
              How did the most energy-rich state in America come this close to total infrastructure failure?
            </div>
          </div>
        </div>
        <Notes>
          [LERENZO] The Texas grid was 4 minutes and 37 seconds from a total cold-start collapse.
          A cold restart takes weeks, maybe months — you're rebuilding the grid from scratch.
          246 people died. $195 billion in estimated damage (Perryman Group).
          Wholesale prices went from ~$50 to $9,000/MWh overnight — 180x.
          Families got $7,000 bills in a week. Their provider went bankrupt.
        </Notes>
      </Slide>

      {/* 7: Grid Scale */}
      {gridScale()}

      {/* 8: Designed for a Different World */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H>Designed for a Different World</H>
          <P size="20px">Built in the 1950s. One-directional. No flexibility.</P>
          <LazyContent><GridFlowDemo width="100%" /></LazyContent>
        </div>
        <Notes>
          [LERENZO] Power Plants to Transmission to Distribution to Homes.
          One direction. Few large producers. Passive consumers.
          Designed in the 1950s. No flexibility built in.
        </Notes>
      </Slide>

      {/* 9: EU Grid HUD */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="w-full h-full">
          <EUGridHUD width="100%" height="100%" />
        </div>
        <Notes>
          - The Continental European synchronous grid — 36 countries, one frequency
          - [ARROW] Western corridor: France exports 50+ TWh/yr. Undersea cables to UK.
          - [ARROW] Eastern corridor: the grid reaches every corner of the continent
          - Backup: largest synchronous grid (China is larger by capacity but not synchronized as one area)
        </Notes>
      </Slide>

      {/* 10: Frequency — What "Stabilizing the Grid" Means */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>The Grid: Balanced at 0.67c</H>
          <P size="20px">This enormous machine maintains a constant 50 Hz frequency — imbalances propagate at two-thirds the speed of light. There is no buffer.</P>
          <Stepper values={[1, 2, 3, 4]} alwaysVisible activeStyle={{ opacity: '1' }} inactiveStyle={{ opacity: '1' }} className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
            {(stepVal) => <FrequencyWalkthrough step={stepVal ?? 0} mode="intro" />}
          </Stepper>
        </div>
        <Notes>
          - 50 Hz = supply equals demand. Imbalances propagate at 0.67c (two-thirds the speed of light)
          - No buffer, no queue, no retry — physics enforces balance instantaneously
          - [ARROW] Too little supply = frequency drops. Too much = frequency rises. The grid has no buffer.
          - [ARROW] 2.5 Hz separates "everything is fine" from total collapse. Less than you can hear.
          - Backup: Continental European grid synchronized since the 1950s, never fully shut down
        </Notes>
      </Slide>

      {/* 11: Tools for Balancing the Grid */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>Tools for Balancing the Grid</H>
          <P size="20px">What happens when supply and demand diverge — and how the grid fights back.</P>
          <Stepper values={[1, 2, 3]} alwaysVisible activeStyle={{ opacity: '1' }} inactiveStyle={{ opacity: '1' }} className="flex-1 flex flex-col" style={{ minHeight: 0 }}>
            {(stepVal) => <FrequencyWalkthrough step={stepVal ?? 0} mode="scenarios" />}
          </Stepper>
        </div>
        <Notes>
          - [ARROW] 49.8-50.2 Hz: normal band. Spinning reserves on standby.
          - [ARROW] 49.5 Hz: reserves activate. Gas CCGT ramps to max.
          - [ARROW] 49.0 Hz: reserves maxed. Peaker fires. Load shedding (deliberate blackouts).
          - [ARROW] 47.5 Hz: generators disconnect to self-protect. Total collapse.
          - Backup: The entire cascade from "fine" to "collapse" can happen in under 12 minutes
        </Notes>
      </Slide>

      {/* 12: Frequency Demo — Interactive */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>Balancing the Grid - In Action</H>
          <P size="20px">Click an event to simulate what happens when something goes wrong.</P>
          <div className="flex-1 flex items-center" style={{ width: '100%' }}>
            <LazyContent><FrequencyDemo width={1286} height={480} panelWidth={340} /></LazyContent>
          </div>
          <div className="text-center py-3">
            <span className="text-[28px] font-mono font-extrabold" style={{ color: colors.danger, textShadow: `0 0 20px ${colors.danger}30` }}>Collapse</span>
            <span className="text-[28px] font-mono mx-3" style={{ color: colors.textDim }}>=</span>
            <span className="text-[28px] font-mono font-extrabold" style={{ color: colors.accent, textShadow: `0 0 20px ${colors.accent}30` }}>{'\u0394'} 2.5 Hz</span>
          </div>
        </div>
        <Notes>
          [MARIO] Now let's see this in action.
          [DEMO] Click scenarios to simulate events:
          Generator trip: 800 MW offline, watch reserves catch it — recovery in ~12 minutes.
          3 GW loss: deep enough to trigger automatic load shedding, but grid survives.
          Demand drop: frequency goes UP — too much supply is also dangerous.
          Cyber attack: coordinated SCADA compromise, cascading trips, no recovery — blackout.
          Notice the accelerated timer — these events play out over minutes in real grid time.
        </Notes>
      </Slide>

      {/* 13: Costs of the Old Playbook */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.accent}>Balancing the Grid is Expensive</H>
          <P size="20px">Before batteries and software, this is how we kept the lights on.</P>
          <Stepper values={[1, 2, 3, 4]} alwaysVisible activeStyle={{ opacity: '1' }} inactiveStyle={{ opacity: '1' }} className="flex-1 flex flex-col">
            {(visibleCount, step, isActive) => {
              const vc = visibleCount ?? 0;
              const cards = [
                { t: 'Peaker Plants', d: 'Idle 95% of the year, waiting for a spike.', stat: 'EUR 6.5B/yr', c: '#fb923c' },
                { t: 'Spinning Reserves', d: '15% of all fuel to produce nothing.', stat: '15% wasted capacity', c: colors.accent },
                { t: 'Grid Bottlenecks', d: 'Congeestion blocks renewables, gas used instead.', stat: 'EUR 4.2B/yr', c: colors.danger },
                { t: 'Curtailment', d: 'Too much sun or wind? Turn it off.', stat: '10 TWh/yr wasted (DE)', c: colors.secondary },
              ];
              return (
                <div className="flex flex-col flex-1">
                  <div className="flex-1 flex items-center">
                    <div className="flex gap-5 w-full">
                      {cards.map((card, i) => {
                        const visible = i < vc;
                        const isNew = i === vc - 1 && isActive;
                        return (
                          <div key={card.t} className="flex-1 rounded-xl px-4 py-5 relative overflow-hidden flex flex-col" style={{
                            background: colors.surface,
                            border: `1px solid ${card.c}40`,
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
                            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                            pointerEvents: visible ? 'auto' : 'none',
                          }}>
                            {isNew && (
                              <div className="absolute top-0 left-0 right-0 h-[2px]" style={{
                                background: `linear-gradient(90deg, transparent, ${card.c}, transparent)`,
                                animation: 'playbook-edge 0.8s ease-out forwards',
                              }} />
                            )}
                            <div className="text-[20px] font-bold font-sans mb-2" style={{ color: card.c }}>{card.t}</div>
                            <div className="text-[17px] text-hud-text-muted font-sans leading-relaxed mb-4 flex-1" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.5s ease 0.15s' }}>{card.d}</div>
                            <div className="font-mono font-semibold text-[20px]" style={{
                              color: visible ? card.c : 'transparent',
                              textShadow: visible ? `0 0 20px ${card.c}30` : 'none',
                              transition: 'all 0.5s ease 0.25s',
                            }}>{card.stat}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="font-sans text-[18px] leading-normal" style={{ fontStyle: 'italic', color: colors.textMuted, opacity: vc >= 4 ? 1 : 0.4, transition: 'opacity 0.6s ease' }}>
                      Over EUR 10 billion per year to keep gas turbines on standby, reroute power, and throw away clean energy. This is the toolkit we inherited.
                    </div>
                    <div className="font-mono text-[12px] mt-2" style={{ color: colors.textDim + '80', opacity: vc >= 4 ? 1 : 0, transition: 'opacity 1.2s ease 0.4s' }}>
                      Sources: ACER MMR 2024, Beyond Fossil Fuels/Aurora 2025, BNetzA/SMARD, ENTSO-E
                    </div>
                  </div>
                  <style>{`
                    @keyframes playbook-edge {
                      0% { opacity: 0; clip-path: inset(0 100% 0 0); }
                      50% { opacity: 1; }
                      100% { opacity: 0; clip-path: inset(0 0% 0 0); }
                    }
                  `}</style>
                </div>
              );
            }}
          </Stepper>
        </div>
        <Notes>
          [LERENZO] This is what it costs to keep the lights on the old way. Arrow through each one.
          [ARROW] Peaker plants: EUR 6.5B/yr — the EU pays gas turbines to sit idle 95% of the year, just waiting for a demand spike. That's the "capacity mechanism" budget — paying plants to exist, not to run.
          [ARROW] Spinning reserves: 15% of all generation burns fuel 24/7 producing nothing — just to be ready. And that fuel cost isn't even in these numbers — it's a hidden tax on wholesale electricity prices, estimated at another EUR 1-3B/yr.
          [ARROW] Congestion: EUR 4.2B/yr rerouting power. When transmission lines are full, operators pay wind farms in the north to stop and gas plants in the south to start. Same power delivered, but now it costs twice as much.
          [ARROW] Curtailment: Germany curtails 10 TWh of clean energy per year — enough to power 2.7 million homes. Too much sun? Turn it off. The grid literally throws away clean energy because the wires can't carry it.
          That's over EUR 10B/yr in hard costs, plus billions more hidden in fuel waste and inefficiency. And when all of this fails — Texas happens.
        </Notes>
      </Slide>

      {/* 14: Why Texas Failed */}
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
        <Notes>
          [LERENZO] The gas-electric death spiral — a cascading feedback loop.
          Cold hits, generators freeze, load shedding, cuts power to gas pipelines, more generators fail, more load shedding.
          Steps 4-6 are the death spiral — it accelerates.
          52,000 MW offline out of 107,000. ERCOT is isolated — no interconnection to call for help.
        </Notes>
      </Slide>

      {/* 15: It Keeps Happening */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
        <H color={colors.danger}>Not an Isolated Incident</H>
        <div className="flex-1 flex items-center">
        <div className="flex gap-14 w-full">
          <div className="flex-1 flex flex-col gap-8 justify-center">
            {[
              { y: '2003', e: 'Northeast US/Canada', i: '55M people, $6B in damage' },
              { y: '2003', e: 'Italy Blackout', i: '56M people' },
              { y: '2006', e: 'European Grid Split', i: '15M households' },
              { y: '2016', e: 'South Australia (tornadoes)', i: 'Entire state, 1.7M people' },
              { y: '2017', e: 'South Australia (heatwave)', i: '90K homes, ~42°C day' },
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
              { y: '2021', e: 'Europe Grid Split', i: 'Freq dropped to 49.74 Hz', c: colors.danger },
              { y: '2025', e: 'Spain/Portugal', i: '60M people', c: colors.accent },
              { y: '2025', e: 'Berlin Arson (x2)', i: '50K+ homes', c: colors.accent },
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
        <Notes>
          [LERENZO] This isn't a Texas problem — it's a grid architecture problem.
          10 major failures in 23 years across 3 continents.
          2003 Northeast US: 55 million people, $6B. 2016 South Australia: entire state.
          Spain/Portugal 2025: 60 million people. Berlin arson 2025: two attacks, 50K+ homes.
          The common thread? Centralized, inflexible, cascading.
        </Notes>
      </Slide>


      {/* 16: Limited Flexibility — Bridge */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[28px] font-semibold text-hud-text font-sans leading-[1.7] mb-7">
            Every one of these failures shares one root cause:
          </div>
          <div className="text-[52px] font-extrabold font-sans mb-9" style={{ color: colors.danger, textShadow: `0 0 40px ${colors.danger}30` }}>
            Limited flexibility.
          </div>
          <div className="text-[22px] text-hud-text-muted font-sans leading-[1.6]">
            Now imagine adding the most variable energy source in history.
          </div>
        </div>
        <Notes>
          - Every one of these failures: limited flexibility to respond
          - Pause. Let that land.
          - "Now imagine adding the most variable energy source in history."
          - Backup: load shedding exists but it's a blunt tool — deliberate blackouts, not flexibility
        </Notes>
      </Slide>

      {/* ═══════ ACT 2: THE RENEWABLE REVOLUTION ═══════ */}

      {/* 17: The Renewable Revolution */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-accent font-mono tracking-[0.15em] uppercase mb-4">Part II</div>
          <H size="50px" center color={colors.accent}>The Renewable Revolution</H>
          <P size="20px" center>Inevitable, amazing — and a whole new kind of problem</P>
        </div>
        <Notes>
          [MARIO] "Inevitable, amazing — and a whole new kind of problem."
        </Notes>
      </Slide>

      {/* 18: The Renewable Explosion */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>The Renewable Explosion</H>
          <P size="20px">Germany's electricity from renewables — this is not slowing down.</P>
          <div className="flex-1 flex justify-center items-center">
            <LazyContent><RenewableGrowthChart width={940} height={440} /></LazyContent>
          </div>
        </div>
        <Notes>
          [MARIO] Germany's renewable share — this is exponential growth.
          Already over 50% of electricity generation.
          This is not slowing down. Every country is on this curve.
        </Notes>
      </Slide>

      {/* 19: The Duck Curve Problem */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H>The Duck Curve Problem</H>
          <P size="20px">More solar every year. The belly deepens. The evening ramp steepens. Prices go haywire.</P>
          <div className="flex-1 flex justify-center items-center">
            <LazyContent><DuckCurveChart width={1100} height={560} /></LazyContent>
          </div>
        </div>
        <Notes>
          [MARIO] Solar floods the grid at midday — prices collapse.
          Sunset: demand ramps steeply, solar disappears.
          This "belly" gets deeper every year as more solar comes online.
          The grid needs ramping capacity it doesn't have.
        </Notes>
      </Slide>

      {/* 20: The Cost of Wasted Energy */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H color={colors.danger}>Clean Energy Has Outgrown the Grid</H>
          <Stepper values={[1, 2, 3, 4]} alwaysVisible activeStyle={{ opacity: '1' }} inactiveStyle={{ opacity: '1' }} className="flex-1 flex flex-col">
            {(vc) => {
              const v = vc ?? 0;
              return (
                <div className="flex-1 flex flex-col justify-center">
                  <LazyContent><CurtailmentChart width={940} height={340} statsVisible={v} /></LazyContent>
                </div>
              );
            }}
          </Stepper>
          <div style={{ fontSize: 12, color: colors.textDim, fontFamily: '"Inter", sans-serif', marginTop: 4 }}>While SuedLink is being built by 2028, 49% of curtailment comes from local grid issues. Neighborhood transformers are overwhelmed.</div>
        </div>
        <Notes>
          [MARIO] Germany paid EUR 554 million to generators to NOT produce electricity.
          9.3 TWh curtailed — enough to power 2.7 million homes.
          49% of congestion is at the local distribution level — rooftop solar overwhelming neighborhood transformers.
          New long-distance cables don't fix this. You need local flexibility.
          A VPP could be the buyer of last resort — charge batteries, pre-heat buildings, shift EV charging.
        </Notes>
      </Slide>

      {/* ═══════ ACT 3: THE VIRTUAL POWER PLANT ═══════ */}

      {/* 21: Bridge — The Solution Is Already Installed */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[28px] font-semibold text-hud-text font-sans leading-[1.7] mb-7">
            The grid needs flexibility it doesn't have.
          </div>
          <div className="text-[28px] font-semibold text-hud-text font-sans leading-[1.7] mb-9">
            But millions of homes already have solar, batteries, and heat pumps.
          </div>
          <div className="text-[52px] font-extrabold font-sans" style={{ color: colors.primary, textShadow: `0 0 40px ${colors.primary}30` }}>
            What if they could work together?
          </div>
        </div>
        <Notes>
          - The grid needs flexibility. Homes already have the hardware.
          - Pause. "What if they could work together?"
          - Backup: ~3M homes in Germany with solar, growing 500K/yr. Most have or will have batteries.
        </Notes>
      </Slide>

      {/* 22: Homes Become Infrastructure */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col items-center h-full text-center">
          <H size="42px" center>Homes Become Infrastructure</H>
          <div className="text-[30px] text-hud-text font-sans leading-[1.7] mt-10 whitespace-nowrap">
            Homes with solar and batteries can <span className="font-semibold" style={{ color: colors.solar }}>charge</span>, <span className="font-semibold" style={{ color: colors.success }}>export</span>, and <span className="font-semibold" style={{ color: colors.primary }}>shift consumption</span>.
          </div>
          <ConsumerIcons />
        </div>
        <Notes>
          [MARIO] Your roof becomes a power plant. Your garage becomes a grid asset.
          Your house becomes a node in the largest distributed system ever built.
          But coordinating millions of these devices? That's a distributed systems problem.
          Transition: that's where we come in
        </Notes>
      </Slide>

      {/* 23: The Virtual Power Plant */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.15em] uppercase mb-4">Part III</div>
          <H size="50px" center>The Virtual Power Plant</H>
          <P size="20px" center>Software that turns distributed energy into grid infrastructure</P>
        </div>
        <Notes>
          [LERENZO] "Software that turns distributed energy into grid infrastructure."
        </Notes>
      </Slide>

      {/* 24: What Is a Virtual Power Plant? */}
      <Slide backgroundColor={bg} padding="0">
        <div className="relative w-full h-full">
          <div className="absolute inset-0 flex flex-col pt-5 px-10 pointer-events-none z-10">
            <H>What Is a Virtual Power Plant?</H>
            <P size="20px">From market signal to battery response — the command flow through our VPP architecture.</P>
          </div>
          <Stepper values={[1, 2, 3]} alwaysVisible activeStyle={{ opacity: '1' }} inactiveStyle={{ opacity: '1' }} className="w-full h-full">
            {(stepVal) => <LazyContent><VPPArchitecture highlightStep={stepVal ?? 0} /></LazyContent>}
          </Stepper>
        </div>
        <Notes>
          [LERENZO] Left: devices — solar panels, batteries, EV chargers, heat pumps.
          Center: cloud platform — Kubernetes + Dapr, event-driven control.
          Right: services — frequency regulation, peak shaving, energy arbitrage, demand response.
          [ANIMATED] Energy market sends request → Trading gateway (Entrix) → VPP Controller on Kubernetes.
          Controller publishes commands via Kafka → Enpal cloud → MQTT to individual homes.
          Watch the data flow — from market signal to battery charge in seconds.
          Software that aggregates and operates millions of devices as one coordinated power plant.
        </Notes>
      </Slide>

      {/* 25: Inside the Architecture — Explorer (4 steps) */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          {/* Full-screen architecture explorer */}
          <div className="absolute inset-0">
            <Stepper values={[1, 2, 3, 4]} alwaysVisible activeStyle={{ opacity: '1' }} inactiveStyle={{ opacity: '1' }} className="w-full h-full">
              {(stepVal) => {
                const archStep = stepVal ?? 0;
                return <ArchitectureExplorer step={archStep} />;
              }}
            </Stepper>
          </div>
          {/* Heading overlay */}
          <div className="relative z-10 px-8 pt-5 pointer-events-none" style={{ background: 'linear-gradient(to bottom, #020408 0%, #020408cc 60%, transparent 100%)' }}>
            <div className="text-xs font-mono font-semibold tracking-widest uppercase mb-2" style={{ color: colors.textDim }}>INSIDE THE ARCHITECTURE</div>
            <H>Inside the Architecture</H>
            <P size="18px" style={{ opacity: 0.7 }}>Click through to explore each layer.</P>
          </div>
        </div>
        <Notes>
          [LERENZO] Same architecture — now let's zoom in on the key decisions.
          [ARROW] Home system: Enpal.One edge gateway. Local energy management, WISH protocol for conflict resolution.
          [ARROW] MQTT + Choreography: No central coordinator. Pub/sub scales linearly. Why not stronger consistency? No shared mutable state.
          [ARROW] Data pipeline: Databricks lakehouse, Spark streaming. 5M measurements/min. Progressive aggregation reduces storage 10x.
          [ARROW] Flexa control loop: Market signal to device in under 2 seconds. ArgoCD for GitOps deployment across 100K+ devices.
        </Notes>
      </Slide>

      {/* 26: Cloud Platform — Choreography, Dapr Actors, ArgoCD */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: colors.textDim }}>CLOUD PLATFORM</div>
              <H>Event-Driven Control Plane</H>
            </div>
            <div className="flex gap-3 pb-1">
              {[
                { label: 'RUNTIME', value: 'Dapr', color: colors.primary },
                { label: 'ORCHESTRATION', value: 'K8s', color: colors.primary },
                { label: 'GITOPS', value: 'ArgoCD', color: colors.accent },
                { label: 'BROKER', value: 'EMQX', color: colors.success },
              ].map((s, i) => (
                <div key={i} className="rounded px-3 py-1.5" style={{ background: s.color + '0a', border: `1px solid ${s.color}25` }}>
                  <div className="text-xs font-mono tracking-widest uppercase" style={{ color: colors.textDim }}>{s.label}</div>
                  <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          <P size="18px">No central coordinator. Each home is a Dapr actor. MQTT pub/sub scales linearly. Services react to events independently.</P>

          {/* Choreography visualization */}
          <div className="flex-1 flex justify-center items-center">
            <LazyContent><ChoreographyLoop width={1100} height={380} /></LazyContent>
          </div>

          {/* Bottom: key concepts */}
          <div className="flex gap-5 mt-2">
            <div className="flex-1 rounded-lg px-4 py-3" style={{ background: colors.surface, border: `1px solid ${colors.success}20` }}>
              <span className="text-lg font-semibold font-mono" style={{ color: colors.success }}>Dapr Actors</span>
              <span className="text-base text-hud-text-muted font-sans ml-3">One actor per home — isolated state, turn-based concurrency</span>
            </div>
            <div className="flex-1 rounded-lg px-4 py-3" style={{ background: colors.surface, border: `1px solid ${colors.primary}20` }}>
              <span className="text-lg font-semibold font-mono" style={{ color: colors.primary }}>Choreography</span>
              <span className="text-base text-hud-text-muted font-sans ml-3">No orchestrator — 100K independent pub/sub channels</span>
            </div>
            <div className="flex-1 rounded-lg px-4 py-3" style={{ background: colors.surface, border: `1px solid ${colors.accent}20` }}>
              <span className="text-lg font-semibold font-mono" style={{ color: colors.accent }}>ArgoCD</span>
              <span className="text-base text-hud-text-muted font-sans ml-3">Fleet config as code — rolling updates from Git</span>
            </div>
          </div>
        </div>
        <Notes>
          [LERENZO] This is our control plane — how we manage 100K+ devices.
          MQTT with QoS 1 and choreography — not orchestration. Each service reacts to events independently.
          Why choreography? No central coordinator = no single point of failure. Scales linearly.
          Why not stronger consistency? We don't need it. Devices are independent — there's no shared mutable state between homes.
          Eventual consistency would add complexity for no benefit. Strong consistency would be a bottleneck.
          Dapr actors give us per-device isolation with turn-based concurrency. The WISH protocol handles conflict resolution.
          ArgoCD for GitOps — fleet configuration as code. Rolling updates to 100K+ devices from a Git commit.
        </Notes>
      </Slide>

      {/* 27: Progressive Aggregation Pyramid */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="text-[10px] font-mono font-semibold tracking-widest uppercase mb-2" style={{ color: colors.textDim }}>DATA PIPELINE</div>
              <H color="#FF3621">Progressive Aggregation</H>
            </div>
            <div className="flex gap-3 pb-1">
              {[
                { label: 'RAW', value: '20s', color: '#E25A1C' },
                { label: 'WINDOWS', value: '6 tiers', color: '#FF3621' },
                { label: 'REDUCTION', value: '4,320:1', color: colors.success },
              ].map((s, i) => (
                <div key={i} className="rounded px-3 py-1.5" style={{ background: s.color + '0a', border: `1px solid ${s.color}25` }}>
                  <div className="text-xs font-mono tracking-widest uppercase" style={{ color: colors.textDim }}>{s.label}</div>
                  <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
          <P size="18px">Each aggregation tier reduces volume while increasing analytical value. Raw 20-second data compresses 4,320:1 into daily summaries.</P>
          <div className="flex-1 flex justify-center items-center">
            <LazyContent><AggregationPyramid width={1100} height={440} /></LazyContent>
          </div>
        </div>
        <Notes>
          [LERENZO] This is the aggregation pyramid — how we compress data while preserving value.
          Every 20 seconds, each device reports. Three of those become a 1-minute aggregate.
          Five 1-minute windows become 5 minutes. Three of those make 15 minutes. Four make an hour. Twenty-four make a day.
          That's a 4,320:1 compression ratio. Raw data expires after 7 days. Daily aggregates live forever.
          The pyramid shape tells the story — high frequency at the base, high value at the top.
        </Notes>
      </Slide>

      {/* 28: The Architecture Parallel */}
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
          <div className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: colors.textDim }}>INSIDE THE ARCHITECTURE</div>
          <H>The Architecture Parallel</H>
          <P size="18px">The same distributed systems principles that run the internet can run the power grid.</P>
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
        <Notes>
          [LERENZO] Traditional grid = monolithic. VPP = microservices.
          Draw the parallel for this audience:
          Frequency = your SLO. Cascade = failure propagation. Batteries = autoscaling.
          You already think in these terms every day.
        </Notes>
      </Slide>

      {/* 29: How a VPP Responds to Grid Events */}
      <Slide backgroundColor={bg} padding={pad}>
        <style>{`
          @keyframes vppEventIn {
            0% { opacity: 0; transform: translateX(-24px); filter: blur(3px); }
            100% { opacity: 1; transform: translateX(0); filter: blur(0); }
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
          <Stepper values={[1, 2]} alwaysVisible activeStyle={{ opacity: '1' }} inactiveStyle={{ opacity: '1' }} className="flex-1 flex flex-col">
            {(stepVal) => {
              const sv = stepVal ?? 0;
              const events = [
                { event: 'Frequency Containment (FCR)', time: '< 30 seconds', desc: 'Battery injects/absorbs power to stabilize grid frequency', cost: 'Blackout cost: EUR 1-5B per event', color: colors.danger, delay: 0.2 },
                { event: 'Automatic Frequency Restoration (aFRR)', time: '< 5 minutes', desc: 'Sustained response to restore frequency to 50 Hz', cost: 'Gas peaker alternative: EUR 150-300/MWh', color: colors.accent, delay: 0.5 },
                { event: 'Peak Shaving', time: '1-4 hours', desc: 'Reduce grid load during demand peaks by discharging batteries', cost: 'VPP capacity 40-60% cheaper than peakers (Brattle)', color: colors.primary, delay: 0.9 },
                { event: 'Energy Arbitrage', time: 'Scheduled', desc: 'Charge at negative prices, discharge at peak — optimizing day-ahead markets', cost: 'Curtailment avoided: EUR 554M/yr (DE)', color: colors.success, delay: 1.4 },
              ];
              return (
                <div className="flex flex-col flex-1">
                  <div className="flex flex-col justify-center gap-3 mt-2" style={{ opacity: sv >= 1 ? 1 : 0, transition: 'opacity 0.3s ease' }}>
                    {events.map(e => (
                      <div key={e.event} className="flex items-start gap-4 rounded-lg p-3"
                        style={{
                          background: `${e.color}06`,
                          border: `1px solid ${e.color}15`,
                          opacity: 0,
                          '--glow-color': e.color + '20',
                          animation: sv >= 1 ? `vppEventIn 0.5s ease ${e.delay}s forwards, vppEventGlow 1s ease ${e.delay + 0.4}s both` : 'none',
                        }}>
                        <div className="w-[320px] shrink-0">
                          <div className="text-[17px] font-semibold font-sans" style={{ color: e.color }}>{e.event}</div>
                          <div className="text-[13px] font-mono mt-1" style={{ color: colors.textDim, opacity: 0, animation: sv >= 1 ? `vppEventIn 0.3s ease ${e.delay + 0.25}s forwards` : 'none' }}>{e.time}</div>
                        </div>
                        <div className="flex-1">
                          <div className="text-[17px] text-hud-text-muted font-sans">{e.desc}</div>
                          <div className="text-[13px] font-mono mt-1" style={{ color: e.color + 'aa', opacity: 0, animation: sv >= 1 ? `vppEventIn 0.3s ease ${e.delay + 0.35}s forwards` : 'none' }}>{e.cost}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex-1 flex items-end justify-center pb-2">
                    <div className="w-[80%] flex items-center gap-4 rounded-lg px-5 py-3" style={{
                      background: colors.success + '0a',
                      border: `1px solid ${colors.success}25`,
                      opacity: sv >= 2 ? 1 : 0,
                      transform: sv >= 2 ? 'translateX(0)' : 'translateX(-24px)',
                      transition: 'all 0.5s ease',
                    }}>
                      <div className="shrink-0">
                        <div className="text-[26px] font-bold font-mono" style={{ color: colors.success }}>And Fast:</div>
                        <div className="text-[12px] font-mono mt-1" style={{ color: colors.textDim }}>Response Time</div>
                      </div>
                      <div className="flex-1">{sv >= 2 && <LazyContent key={`rt-${sv}`}><ResponseTimeline width={840} height={120} delay={0} /></LazyContent>}</div>
                    </div>
                  </div>
                </div>
              );
            }}
          </Stepper>
        </div>
        <Notes>
          [LERENZO] Different timescales, different strategies.
          FCR: under 30 seconds — blackout cost EUR 1-5B per event.
          aFRR: under 5 minutes — gas peaker alternative at EUR 150-300/MWh.
          Peak Shaving: 1-4 hours — VPP capacity 40-60% cheaper than peakers (Brattle).
          Energy Arbitrage: scheduled day-ahead — curtailment avoided: EUR 554M/yr (DE).
          The speed comparison: Coal 2-12 hours. Gas 10-30 minutes. Hydro 15-30 seconds. Battery: 140 milliseconds.
          A battery responds before a gas turbine even knows there's an emergency.
          This is why batteries + software win.
        </Notes>
      </Slide>

      {/* 30: Energy Arbitrage + Peak Shaving */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <VPPScenarioSlide scenario="summer" />
        </div>
        <Notes>
          [LERENZO] [MAP HUD] Full-screen Berlin map — walk through each step.
          Sunny July morning. 53,000 homes generating solar.
          Midday — prices collapse. Flexa holds batteries empty on purpose.
          Prices go negative — charge everything. Solar curtailed, batteries and EVs charging from the grid at negative prices, heat pumps pre-heating homes to bank cheap energy as thermal mass.
          Evening — sun sets, prices spike. Full batteries discharge at peak prices.
          Revenue earned. Grid peaks softened. Fossil generation reduced.
        </Notes>
      </Slide>

      {/* 31: SA Virtual Power Plant */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <SAMapHUD width="100%" height="100%" variant="vpp" />
        </div>
        <Notes>
          [LERENZO] South Australia proved this works.
          ~1,000 homes with Tesla Powerwalls.
          One of the world's first demonstrations that distributed home batteries can stabilize a grid.
        </Notes>
      </Slide>

      {/* 32: The Economic Impact of Flexibility */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.success}>The Economic Impact of Flexibility</H>
          <P size="20px">What changes when distributed batteries respond in milliseconds instead of hours.</P>
          <Stepper values={[1, 2, 3, 4, 5]} alwaysVisible activeStyle={{ opacity: '1' }} inactiveStyle={{ opacity: '1' }} className="flex-1 flex flex-col">
            {(visibleCount) => {
              const vc = visibleCount ?? 0;
              const rows = [
                { metric: 'Grid Emergency', without: 'Cascade failure, 4+ hours', withVpp: 'Stabilized in 200ms' },
                { metric: 'Peak Demand', without: 'Gas peakers: EUR 150-300/MWh', withVpp: 'Battery discharge: EUR 60-100/MWh' },
                { metric: 'Negative Prices', without: 'Curtail renewables, pay EUR 554M/yr', withVpp: 'Charge batteries, earn revenue' },
                { metric: 'Grid Upgrades', without: 'EUR 35B+ new infrastructure', withVpp: 'VPP capacity 40-60% cheaper (Brattle)' },
                { metric: 'CO2 Emissions', without: '~3.4 Mt avoidable CO2/yr (BNetzA + UBA, 2024)', withVpp: 'Near-zero curtailment emissions' },
              ];
              return (
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-full max-w-[900px]">
                    <div className="flex gap-5 mb-5">
                      <div className="flex-1 text-center text-[18px] font-mono font-semibold py-2 rounded-t-lg" style={{ color: colors.danger, background: colors.danger + '0a', borderBottom: `2px solid ${colors.danger}40` }}>Without VPP</div>
                      <div className="w-[160px]" />
                      <div className="flex-1 text-center text-[18px] font-mono font-semibold py-2 rounded-t-lg" style={{ color: colors.success, background: colors.success + '0a', borderBottom: `2px solid ${colors.success}40` }}>With VPP</div>
                    </div>
                    {rows.map((r, i) => {
                      const visible = i < vc;
                      const isNew = i === vc - 1;
                      return (
                        <div key={r.metric} className="flex gap-5 mb-3 items-center" style={{
                          opacity: visible ? 1 : 0,
                          transform: visible ? 'translateY(0)' : 'translateY(12px)',
                          transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                        }}>
                          <div className="flex-1 rounded-lg p-4 text-[18px] font-sans text-hud-text-muted" style={{ background: colors.danger + '06', border: `1px solid ${colors.danger}12` }}>
                            {r.without}
                          </div>
                          <div className="w-[160px] text-center">
                            <div className="text-[16px] font-semibold font-mono" style={{ color: colors.primary }}>{r.metric}</div>
                          </div>
                          <div className="flex-1 rounded-lg p-4 text-[18px] font-sans font-semibold" style={{
                            color: colors.success,
                            background: colors.success + '06',
                            border: `1px solid ${colors.success}12`,
                            boxShadow: isNew ? `0 0 12px ${colors.success}15` : 'none',
                            transition: 'box-shadow 0.8s ease',
                          }}>
                            {r.withVpp}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }}
          </Stepper>
        </div>
        <Notes>
          [MARIO] Side by side comparison — Without VPP vs. With VPP.
          Without: cascade failures, gas peakers at EUR 150-300/MWh, EUR 554M/yr curtailment, EUR 35B+ in grid upgrades, ~3.4 Mt avoidable CO2 (BNetzA + UBA, 2024).
          With: stabilized in 200ms, batteries at EUR 60-100/MWh, revenue from negative prices, VPP capacity 40-60% cheaper (Brattle), near-zero curtailment emissions.
          The cheapest megawatt is the one you never have to generate.
        </Notes>
      </Slide>

      {/* ═══════ CLOSING ═══════ */}

      {/* 33: Back to Texas */}
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
        <Notes>
          [LERENZO] Remember those 4 minutes and 37 seconds?
          With 10 GW of distributed batteries responding in 140 milliseconds, there is no cascade.
          The frequency never drops. The gas plants never need to save you.
          Because 1 million homes already did.
        </Notes>
      </Slide>

      {/* 34: Thank You */}
      <Slide backgroundColor={bg} padding="0">
        <div className="relative w-full h-full">
          <LazyContent><ThankYouBackground width={1366} height={768} /></LazyContent>
          {/* Radial fade so text is readable over the animation */}
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 55% 50% at center, ${colors.bg}ee 0%, ${colors.bg}aa 50%, transparent 80%)` }} />
          <div className="absolute inset-0 flex flex-col justify-center items-center z-10 text-center">
            <div className="text-[56px] font-extrabold font-sans leading-[1.1] mb-4" style={{ color: colors.primary, textShadow: `0 0 60px ${colors.primary}30` }}>
              Thank You
            </div>
            <div className="text-[22px] text-hud-text font-sans mb-2">
              <span className="font-semibold" style={{ color: colors.primary }}>Enpal</span> — Building Europe's Largest Virtual Power Plant
            </div>
            <div className="text-[18px] text-hud-text-muted font-sans mb-10">
              Cloud-Native Infrastructure for the Energy Grid
            </div>
            <div className="absolute bottom-10 flex items-center gap-2" style={{ color: colors.textDim, fontSize: 14, fontFamily: '"JetBrains Mono", monospace' }}>
              <span>Special thanks to</span>
              <span style={{ color: colors.success }}>@engineeringwithRosie</span>
              <span style={{ opacity: 0.4 }}>,</span>
              <span>the Enpal Engineering team</span>
              <span style={{ opacity: 0.4 }}>&</span>
              <span style={{ color: colors.primary }}>Flexa</span>
            </div>
          </div>
        </div>
        <Notes>
          [LERENZO] Thank you — Enpal, building Europe's largest virtual power plant.
          Questions? Find us at the booth / connect after.
        </Notes>
      </Slide>

      {/* ═══════ APPENDIX ═══════ */}

      {/* Appendix Title */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col justify-center items-center h-full text-center">
          <div className="text-[20px] font-semibold font-mono tracking-[0.15em] uppercase mb-4" style={{ color: colors.textDim }}>Backup Slides</div>
          <H size="50px" center color={colors.textDim}>Appendix</H>
        </div>
      </Slide>

      {/* SA Blackout, 2016 */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <SAMapHUD width="100%" height="100%" variant="blackout" />
        </div>
      </Slide>

      {/* Winter Grid Emergency */}
      <Slide backgroundColor="#020408" padding="0">
        <div className="relative w-full h-full">
          <VPPScenarioSlide scenario="winter" />
        </div>
      </Slide>

      {/* The Economic Impact of Flexibility [WIP] */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.success}><span style={{ color: colors.danger, marginRight: 12, fontSize: '0.6em', verticalAlign: 'middle', opacity: 0.7 }}>[WIP]</span>The Economic Impact of Flexibility</H>
          <P>Flexible demand doesn't just stabilize the grid — it makes electricity dramatically cheaper.</P>
          <div className="flex-1 flex flex-col justify-center gap-5 my-3">
            <div className="flex gap-4">
              <div className="flex-1 rounded-xl p-5" style={{ background: `${colors.success}06`, border: `1px solid ${colors.success}20` }}>
                <div className="text-[20px] font-semibold font-mono mb-2" style={{ color: colors.success }}>RMI — Power Shift (Texas / ERCOT, modeled)</div>
                <div className="text-[20px] text-hud-text font-sans mb-1">Full demand flexibility cuts net generation costs by <span className="font-semibold" style={{ color: colors.success }}>20%</span></div>
                <div className="text-[20px] text-hud-text font-sans mb-1">Saves <span className="font-semibold" style={{ color: colors.success }}>$140/household/year</span> with full VPP integration</div>
                <div className="text-[20px] text-hud-text font-sans">Avoids <span className="font-semibold" style={{ color: colors.success }}>75%</span> of new gas peaker units</div>
              </div>
              <div className="flex-1 rounded-xl p-5" style={{ background: `${colors.primary}06`, border: `1px solid ${colors.primary}20` }}>
                <div className="text-[20px] font-semibold font-mono mb-2" style={{ color: colors.primary }}>Brattle Group — National US (projected)</div>
                <div className="text-[20px] text-hud-text font-sans mb-1">60 GW of VPPs save <span className="font-semibold" style={{ color: colors.primary }}>$15–35B</span> over 10 years</div>
                <div className="text-[20px] text-hud-text font-sans mb-1">System-wide savings of <span className="font-semibold" style={{ color: colors.primary }}>AU$18.5B</span> (AEMO ISP 2024)</div>
                <div className="text-[20px] text-hud-text font-sans">Home batteries avoid <span className="font-semibold" style={{ color: colors.primary }}>AU$4.1B</span> in grid investment</div>
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

      {/* Now We Shift the Load */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <H color={colors.success}>Now We Shift the Load</H>
          <P size="20px">Batteries absorb midday solar. Discharge in the evening. Click "With VPP" below.</P>
          <div className="flex-1 flex justify-center items-center">
            <LazyContent><DuckCurveVPP width={940} height={440} /></LazyContent>
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
                    Prices spiked to <span className="font-semibold" style={{ color: colors.danger }}>EUR 145/MWh</span> (Nov) and <span className="font-semibold" style={{ color: colors.danger }}>EUR 175/MWh</span> (Dec) — ~2x the annual average
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ background: `${colors.textDim}06`, border: `1px solid ${colors.textDim}20` }}>
                  <div className="text-[20px] font-semibold font-mono mb-1" style={{ color: colors.textDim }}>FREQUENCY</div>
                  <div className="text-[20px] text-hud-text font-sans">Occurs <span className="font-semibold">2–10 times per year</span>, lasting 50–100 hours/month in winter</div>
                </div>
              </div>
            </div>
          </div>
          <P size="20px" style={{ fontStyle: 'italic' }}>"You cannot go 100% renewable without storage and flexibility."</P>
        </div>
      </Slide>

      {/* Demand Response in Action [WIP] */}
      <Slide backgroundColor={bg} padding="20px 40px">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3">
            <H color={colors.success}><span style={{ color: colors.danger, marginRight: 12, fontSize: '0.6em', verticalAlign: 'middle', opacity: 0.7 }}>[WIP]</span>Demand Response in Action</H>
            <Badge color={colors.accent}>Still in Infancy</Badge>
          </div>
          <P size="20px">Instead of building more power plants — reshape the demand. Trip a generator and watch what happens.</P>
          <div className="flex-1 flex justify-center items-center">
            <LazyContent><DemandResponseDemo width={920} height={420} /></LazyContent>
          </div>
          <P size="18px" color={colors.textDim} style={{ fontStyle: 'italic' }}>Note: Current deployment is extremely limited. Focus on the challenges — most grids have no demand-side flexibility at scale today.</P>
        </div>
      </Slide>

      {/* References */}
      <Slide backgroundColor={bg} padding={pad}>
        <div className="flex flex-col h-full">
          <H color={colors.textMuted}>References</H>
          <div className="flex-1 flex gap-8 mt-4" style={{ fontSize: 14, fontFamily: '"JetBrains Mono", monospace', color: colors.textDim, lineHeight: 2.2 }}>
            {(() => { const A = ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline', textDecorationColor: colors.textDim + '50', textUnderlineOffset: 3 }}>{children}</a>; return (<>
            <div className="flex-1">
              <div className="text-[15px] font-semibold mb-2" style={{ color: colors.danger }}>Grid Failures</div>
              <div><A href="https://www.ercot.com/gridmktinfo/docs/2021">ERCOT — Final Report on Feb 2021 Winter Storm (2021)</A></div>
              <div><A href="https://www.ferc.gov/media/february-2021-cold-weather-outages-texas-and-south-central-united-states-ferc-nerc-and">FERC/NERC — Texas Event Report (2021)</A></div>
              <div><A href="https://www.entsoe.eu/news/2024/05/07/continental-europe-synchronous-area-separation-on-8-january-2021/">ENTSO-E — Continental Europe Synchronous Area (2024)</A></div>
              <div><A href="https://www.aemo.com.au/-/media/files/electricity/nem/market_notices_and_events/power_system_incident_reports/2017/integrated-final-report-sa-black-system-28-september-2016.pdf">AEMO — South Australia Black System Report (2017)</A></div>
              <div><A href="https://www.ree.es/en">REE/REN — Iberian Peninsula Incident Report (2025)</A></div>
              <div className="text-[15px] font-semibold mb-2 mt-5" style={{ color: colors.accent }}>Renewable Energy</div>
              <div><A href="https://www.bundesnetzagentur.de/EN/Areas/Energy/Companies/DataCollection_Monitoring/monitoring-report/start.html">Bundesnetzagentur — Monitoring Report (2024)</A></div>
              <div><A href="https://www.smard.de/en">SMARD.de — Electricity Market Data (2024)</A></div>
              <div><A href="https://energy-charts.info/">Fraunhofer ISE — Energy Charts (2024)</A></div>
              <div><A href="https://www.caiso.com/documents/flexibleresourceshelprenewables_fastfacts.pdf">CAISO — Duck Curve Analysis (2016-2024)</A></div>
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold mb-2" style={{ color: colors.success }}>VPP &amp; Flexibility</div>
              <div><A href="https://rmi.org/insight/power-shift/">RMI — Power Shift: Flexibility as Infrastructure (2024)</A></div>
              <div><A href="https://www.brattle.com/insights-events/publications/real-reliability-the-value-of-virtual-power/">Brattle Group — VPP Cost-Benefit Analysis (2023)</A></div>
              <div><A href="https://aemo.com.au/energy-systems/major-publications/integrated-system-plan-isp">AEMO — ISP Integrated System Plan (2024)</A></div>
              <div><A href="https://www.sapowernetworks.com.au/industry/virtual-power-plant/">SA Power Networks — VPP Trial Results (2023)</A></div>
              <div><A href="https://www.tesla.com/en_au/sa-virtual-power-plant">Tesla — SA VPP Fleet Performance Data (2023)</A></div>
              <div className="text-[15px] font-semibold mb-2 mt-5" style={{ color: colors.primary }}>Architecture &amp; Technology</div>
              <div><A href="https://www.emqx.com/en/solutions/energy-and-utilities">EMQX — MQTT for Energy IoT (2024)</A></div>
              <div><A href="https://www.databricks.com/solutions/industries/energy-and-utilities">Databricks — Streaming for Energy (2024)</A></div>
              <div>Enpal — Internal Architecture Documentation</div>
              <div>Entrix/Enpal — Flexa VPP Controller Design</div>
              <div><A href="https://github.com/Rio517/kubecon-2026-vpp">Flexa — VPP Controller (Joint Venture Enpal + Entrix)</A></div>
            </div>
            </>); })()}
          </div>
          <div className="mt-auto pt-3" style={{ fontSize: 12, fontFamily: '"JetBrains Mono", monospace', color: colors.textDim }}>
            Sources &amp; architecture docs: <a href="https://github.com/Rio517/kubecon-2026-vpp/tree/main/docs" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary, textDecoration: 'underline', textUnderlineOffset: 3 }}>github.com/Rio517/kubecon-2026-vpp/tree/main/docs</a>
          </div>
        </div>
      </Slide>

    </Deck>
  );
}
