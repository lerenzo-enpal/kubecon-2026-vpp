import React from 'react';
import { Deck, Slide, Notes } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import SevenSegChrome from './components/SevenSegChrome.jsx';
import SevenSegSlideShell from './components/sevenseg/SevenSegSlideShell.jsx';
import SevenSegText from './components/sevenseg/SevenSegText.jsx';
import SevenSegPanel from './components/sevenseg/SevenSegPanel.jsx';
import SevenSegStat from './components/sevenseg/SevenSegStat.jsx';
import SevenSegHeading from './components/sevenseg/SevenSegHeading.jsx';
import SevenSegMap from './components/sevenseg/SevenSegMap.jsx';
import StepBridge from '@shared/components/StepBridge.jsx';
import LazyContent from '@shared/components/ui/LazyContent.jsx';
import { colors } from './theme.js';
import { TOTAL, PAD, Eyebrow, Body, Mono, SectionTitle } from './slides/furniture.jsx';

export default function PresentationSevenSeg() {
  const { theme, cycleTheme } = useTheme();

  return (
    <>
      <SevenSegChrome theme={theme} cycleTheme={cycleTheme} />
      <Deck
        theme={{
          colors: { primary: colors.text, secondary: colors.textMuted, tertiary: colors.primary, quaternary: colors.surface },
          fonts: {
            header: '"JetBrains Mono", monospace',
            text: '"Inter", system-ui, sans-serif',
            monospace: '"JetBrains Mono", monospace',
          },
        }}
      >
        {/* ═══════════════════ 1 · TITLE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={1} total={TOTAL} section="OPENING" padding={PAD}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <Eyebrow color={colors.primary}>KubeCon + CloudNativeCon Europe 2026</Eyebrow>
              <SevenSegText value="50.000" height={78} align="center" style={{ marginBottom: 22 }} />
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 40, fontWeight: 700, lineHeight: 1.15, color: colors.text, textShadow: `0 0 26px ${colors.text}30`, marginBottom: 14 }}>
                What is a Virtual Power Plant?
              </div>
              <Body size={17} align="center" style={{ maxWidth: 620 }}>Cloud-Native Infrastructure for the Energy Grid</Body>
              <Mono size={13} spacing="0.2em" color={colors.textDim} style={{ marginTop: 30 }}>
                ENPAL &nbsp;·&nbsp; ENTRIX &nbsp;·&nbsp; DATABRICKS
              </Mono>
            </div>
          </SevenSegSlideShell>
          <Notes>
            Welcome to KubeCon, thank you for being here.
            I work at Enpal — we're building Europe's largest virtual power plant.
            Before we talk about what a VPP is, we need to talk about the thing it's trying to fix.
          </Notes>
        </Slide>

        {/* ═══════════════════ 2 · SPEAKERS ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={2} total={TOTAL} section="OPENING" padding={PAD}>
            <Eyebrow>Speakers &amp; Partners</Eyebrow>
            <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
              {[
                { name: 'LeRenzo Tolbert-Malcolm', role: 'Staff Engineer, VPP' },
                { name: 'Mario Olivio Flores', role: 'Engineering Manager, VPP' },
              ].map(p => (
                <SevenSegPanel key={p.name} glow={0.3} padding="16px 20px" style={{ flex: 1 }}>
                  <Mono size={17} weight={700} color={colors.text}>{p.name}</Mono>
                  <Body size={17} style={{ marginTop: 4 }}>{p.role}</Body>
                </SevenSegPanel>
              ))}
            </div>
            <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Mono size={17} spacing="0.16em" color={colors.primary} weight={700}>FLEXA</Mono>
              <Mono size={13} color={colors.textDim}>VPP CONTROLLER · ENPAL + ENTRIX</Mono>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <Body size={17}>
                Building Europe's largest virtual power plant — software that aggregates
                millions of distributed energy devices into grid infrastructure.
              </Body>
            </div>
          </SevenSegSlideShell>
          <Notes>
            Quick introduction — I'm LeRenzo, this is Mario.
            We both work on the VPP at Enpal. Flexa is our controller, a joint venture with Entrix.
            We'll be going fast — ~35 minutes, then questions.
          </Notes>
        </Slide>

        {/* ═══════════════════ 3 · AGENDA ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={3} total={TOTAL} section="OPENING" padding={PAD}>
            <SevenSegHeading eyebrow="Agenda" index="03" size={30}>Three parts</SevenSegHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
              {[
                { n: '01', t: 'The Grid', s: "How the world's largest machine works — and how it fails", time: '10', color: colors.danger },
                { n: '02', t: 'The Renewable Revolution', s: 'Why cheap clean energy creates expensive new problems', time: '7', color: colors.accent },
                { n: '03', t: 'The Virtual Power Plant', s: 'Software that turns millions of devices into grid infrastructure', time: '15', color: colors.primary },
              ].map(item => (
                <div key={item.n} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <SevenSegText value={item.n} height={40} color={item.color} style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1, borderLeft: `2px solid ${item.color}50`, paddingLeft: 18 }}>
                    <Mono size={19} weight={700} color={colors.text}>{item.t}</Mono>
                    <Body size={16} style={{ marginTop: 3 }}>{item.s}</Body>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, flexShrink: 0 }}>
                    <Mono size={13} color={colors.textDim}>~</Mono>
                    <SevenSegText value={item.time} height={38} color={colors.textDim} />
                    <Mono size={13} color={colors.textDim}>MIN</Mono>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <Mono size={13} color={colors.textDim}>PLUS APPENDIX · SCENARIOS, DATA, REFERENCES</Mono>
            </div>
          </SevenSegSlideShell>
          <Notes>
            Three parts: The Grid, Renewables, and the VPP itself.
            ~35 minutes total — we'll go fast.
            By the end you'll understand why the energy grid is the most exciting distributed systems problem on the planet.
          </Notes>
        </Slide>

        {/* ═══════════════════ 4 · PART I ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={4} total={TOTAL} section="THE GRID" alert padding={PAD}>
            <SectionTitle part="Part I" title="The Grid" subtitle="The world's largest machine — and how it fails" color={colors.danger} />
            <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: 10 }}>
              <SevenSegText value="50.000" height={40} color={colors.danger} align="center" />
            </div>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] "The world's largest machine" — this isn't hyperbole, we're going to prove it.
          </Notes>
        </Slide>

        {/* ═══════════════════ 5 · THE 50 Hz HEARTBEAT ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={5} total={TOTAL} section="THE GRID" padding={PAD}>
            <SevenSegHeading eyebrow="What frequency is" index="05" size={34}>The 50 Hz Heartbeat</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 16 }}>
              Every generator spins in lockstep. Frequency is the grid's shared clock.
            </Body>
            <div style={{ display: 'flex', gap: 14, flex: 1, alignItems: 'center', maxHeight: 340 }}>
              <SevenSegPanel label="generator a" glow={0.4} style={{ flex: 1 }}>
                <SevenSegText value="50.00" height={40} />
              </SevenSegPanel>
              <SevenSegPanel label="generator b" glow={0.4} style={{ flex: 1 }}>
                <SevenSegText value="50.00" height={40} />
              </SevenSegPanel>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Mono size={13} color={colors.textDim}>COMBINED GRID FREQUENCY</Mono>
                <SevenSegText value="50.000" height={62} color={colors.primary} align="center" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              {[
                { t: 'IN SYNC', d: 'Waves reinforce. Stable grid.' },
                { t: 'DRIFTING', d: 'Interference begins to build.' },
                { t: 'OUT OF SYNC', d: 'Destructive. Relays disconnect.' },
              ].map(s => (
                <SevenSegPanel key={s.t} glow={0.25} padding="10px 14px" style={{ flex: 1 }}>
                  <Mono size={13} spacing="0.16em" color={colors.primary} weight={700}>{s.t}</Mono>
                  <Body size={17} style={{ marginTop: 4 }}>{s.d}</Body>
                </SevenSegPanel>
              ))}
            </div>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] One generator, spinning, producing a clean 50 Hz AC waveform. This is what frequency IS.
            [ARROW] Add a second generator. Both at 50 Hz — waves reinforce. Stronger signal, stable grid.
            [ARROW] Generator B's frequency drifts. Even a small mismatch creates interference.
            [ARROW] Now they're far apart. The waves fight each other — destructive interference. Equipment at risk.
            [ARROW] Protection relays disconnect Generator B to prevent physical destruction.
            But now the remaining generators carry all the load. If they drift too — cascade.
          </Notes>
        </Slide>

        {/* ═══════════════════ 6 · TEXAS CASCADE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Full-bleed schematic map — plants trip one step at a time */}
            <div style={{ position: 'absolute', inset: 0 }}>
              <StepBridge count={14}>
                {(step) => <LazyContent><SevenSegMap scene="texas" step={step} /></LazyContent>}
              </StepBridge>
            </div>

            {/* Title overlay */}
            <div style={{ position: 'absolute', top: 30, left: 46, right: 46, zIndex: 3, pointerEvents: 'none' }}>
              <Eyebrow color={colors.danger}>February 2021 · ERCOT</Eyebrow>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fontWeight: 700, color: colors.danger, textShadow: `0 0 24px ${colors.danger}40` }}>
                Texas Cascade
              </div>
            </div>

            {/* Bottom readout strip */}
            <div style={{ position: 'absolute', bottom: 30, left: 46, right: 46, zIndex: 3, display: 'flex', gap: 12, pointerEvents: 'none' }}>
              <SevenSegPanel accent={colors.danger} glow={0.5} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="52" height={30} color={colors.danger} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>GW OF 107 GW LOST</Mono>
              </SevenSegPanel>
              <SevenSegPanel accent={colors.danger} glow={0.5} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="4.5" height={30} color={colors.danger} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>MILLION HOMES DARK</Mono>
              </SevenSegPanel>
              <SevenSegPanel accent={colors.accent} glow={0.5} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="59.4" height={30} color={colors.accent} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>Hz · 9 MIN FROM COLLAPSE</Mono>
              </SevenSegPanel>
            </div>
          </div>
          <Notes>
            [LERENZO] February 2021 — a polar vortex hits Texas.
            Watch the grid go dark, county by county.
            [ARROW] Each press trips the next wave of generation — wind first, then gas, then coal.
            This is real data — 4.5 million homes lost power.
          </Notes>
        </Slide>

        {/* ═══════════════════ 7 · TEXAS NUMBERS ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={7} total={TOTAL} section="THE GRID" alert padding={PAD}>
            <Eyebrow color={colors.danger}>Texas, February 2021</Eyebrow>
            <Mono size={24} weight={700} color={colors.danger} style={{ marginBottom: 6 }}>The price of a cold snap</Mono>
            <Body size={17} style={{ marginBottom: 18 }}>
              Wholesale electricity spiked from ~$50 to $9,000/MWh overnight — a 180× increase.
            </Body>
            <div style={{ display: 'flex', gap: 12 }}>
              <SevenSegStat countTo={9000} prefix="$" label="peak price per MWh" height={42} accent={colors.danger} duration={1200} style={{ flex: 1 }} />
              <SevenSegStat countTo={246} label="people dead" height={42} accent={colors.danger} duration={1000} delay={300} style={{ flex: 1 }} />
              <SevenSegStat countTo={195} prefix="$" suffix="B" label="in damage" height={42} accent={colors.accent} duration={1400} delay={600} style={{ flex: 1 }} />
              <SevenSegStat countTo={4.5} decimals={1} suffix="M" label="homes dark" height={42} accent={colors.textMuted} duration={1100} delay={900} style={{ flex: 1 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <SevenSegText value="4:37" height={86} color={colors.danger} align="center" />
                <Mono size={13} spacing="0.22em" color={colors.textDim}>TIME TO TOTAL COLLAPSE</Mono>
              </div>
            </div>
            <SevenSegPanel glow={0.4} padding="12px 16px" style={{ width: '100%' }}>
              <Body size={17} color={colors.text}>
                Families received <span style={{ color: colors.danger, fontWeight: 600 }}>$7,000 bills</span> in a single week.
                Their provider — Griddy — went bankrupt.
              </Body>
            </SevenSegPanel>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] Wholesale prices went from ~$50 to $9,000/MWh overnight — 180x.
            246 people died. $195 billion in damage.
            Families got $7,000 bills in a week. Their provider went bankrupt.
          </Notes>
        </Slide>

        {/* ═══════════════════ 8 · GRID SCALE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={8} total={TOTAL} section="THE GRID" padding={PAD}>
            <SevenSegHeading eyebrow="The largest machine ever built" index="08" size={34}>Grid Scale</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 18 }}>
              Europe's largest car factory, next to the machine that powers a continent.
            </Body>
            <div style={{ display: 'flex', gap: 14, alignItems: 'stretch' }}>
              <SevenSegPanel label="vw wolfsburg" glow={0.3} padding="18px 20px" style={{ flex: 1 }}>
                <SevenSegText value="60,000" height={40} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>WORKERS · 6.5 KM²</Mono>
              </SevenSegPanel>
              <div style={{ display: 'flex', alignItems: 'center', color: colors.primary, fontSize: 22, opacity: 0.5 }}>→</div>
              <SevenSegPanel label="european grid" accent={colors.primary} glow={0.6} padding="18px 20px" style={{ flex: 1.4 }}>
                <SevenSegText value="2.3" height={40} color={colors.primary} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>MILLION WORKERS · 5.5M KM²</Mono>
              </SevenSegPanel>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <SevenSegStat target="36" label="countries, one frequency" height={40} accent={colors.primary} style={{ flex: 1 }} />
              <SevenSegStat target="50" suffix=" Hz" label="held in lockstep" height={40} accent={colors.primary} style={{ flex: 1 }} />
              <SevenSegStat target="0" label="downtime, ever" height={40} accent={colors.success} style={{ flex: 1 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <Body size={16} color={colors.text}>
                No maintenance window. No staging environment. It has never been turned off.
              </Body>
            </div>
          </SevenSegSlideShell>
          <Notes>
            [MARIO] Europe's largest car factory is VW Wolfsburg — 60,000 workers over 6.5 km2.
            The European grid: 2.3 million workers across 5.5 million km2.
            36 countries, all operating at 50 Hz across interconnected synchronous areas.
            Zero downtime — this machine has never been turned off. No maintenance window. No staging environment.
          </Notes>
        </Slide>

        {/* ═══════════════════ 9 · DESIGNED FOR A DIFFERENT WORLD ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={9} total={TOTAL} section="THE GRID" padding={PAD}>
            <SevenSegHeading eyebrow="Built in the 1950s" index="09" size={34}>Designed for a Different World</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 18 }}>
              One-directional. No flexibility. Few large producers, passive consumers.
            </Body>
            <div style={{ display: 'flex', gap: 8, alignItems: 'stretch' }}>
              {[
                { step: '01', label: 'POWER PLANTS', detail: 'Few, large, centralised' },
                { step: '02', label: 'TRANSMISSION', detail: 'Long-distance, one way' },
                { step: '03', label: 'DISTRIBUTION', detail: 'Down to the neighbourhood' },
                { step: '04', label: 'HOMES', detail: 'Passive consumption' },
              ].map((s, i) => (
                <React.Fragment key={s.step}>
                  <SevenSegPanel glow={0.3} padding="14px 16px" style={{ flex: 1 }}>
                    <SevenSegText value={s.step} height={22} color={colors.primary} style={{ marginBottom: 10 }} />
                    <Mono size={13} spacing="0.14em" color={colors.text} style={{ marginBottom: 6 }}>{s.label}</Mono>
                    <Body size={17}>{s.detail}</Body>
                  </SevenSegPanel>
                  {i < 3 && <div style={{ display: 'flex', alignItems: 'center', color: colors.primary, fontSize: 18, opacity: 0.5 }}>→</div>}
                </React.Fragment>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end' }}>
              <Body size={16} color={colors.textDim}>
                Power flows in one direction only. There is no mechanism to ask a home to help.
              </Body>
            </div>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] Power Plants to Transmission to Distribution to Homes.
            One direction. Few large producers. Passive consumers.
            Designed in the 1950s. No flexibility built in.
          </Notes>
        </Slide>

        {/* ═══════════════════ 10 · EU GRID HUD ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <LazyContent><SevenSegMap scene="eu" /></LazyContent>
            </div>

            <div style={{ position: 'absolute', top: 30, left: 46, right: 46, zIndex: 3, pointerEvents: 'none' }}>
              <Eyebrow>Continental synchronous area</Eyebrow>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fontWeight: 700, color: colors.text, textShadow: `0 0 24px ${colors.text}30` }}>
                The European Grid
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 30, left: 46, right: 46, zIndex: 3, display: 'flex', gap: 12, pointerEvents: 'none' }}>
              <SevenSegPanel glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="36" height={30} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>COUNTRIES, ONE FREQUENCY</Mono>
              </SevenSegPanel>
              <SevenSegPanel glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="50" height={30} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>TWh EXPORTED BY FRANCE / YR</Mono>
              </SevenSegPanel>
              <SevenSegPanel glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="5.5" height={30} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>MILLION KM² · 2.3M WORKERS</Mono>
              </SevenSegPanel>
            </div>
          </div>
          <Notes>
            - The Continental European synchronous grid — 36 countries, one frequency
            - [ARROW] Western corridor: France exports 50+ TWh/yr. Undersea cables to UK.
            - [ARROW] Eastern corridor: the grid reaches every corner of the continent
            - Backup: largest synchronous grid (China is larger by capacity but not synchronized as one area)
          </Notes>
        </Slide>

        {/* ═══════════════════ 11 · BALANCED AT 0.67c ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={11} total={TOTAL} section="THE GRID" padding={PAD}>
            <SevenSegHeading eyebrow="No buffer, no queue, no retry" index="11" size={34}>The Grid: Balanced at 0.67c</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 18 }}>
              This machine maintains a constant 50 Hz — imbalances propagate at two-thirds the speed of light.
            </Body>
            <div style={{ display: 'flex', gap: 14, flex: 1, alignItems: 'center', maxHeight: 340 }}>
              <SevenSegPanel label="nominal" glow={0.5} style={{ flex: 1 }}>
                <SevenSegText value="50.000" height={46} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>SUPPLY = DEMAND</Mono>
              </SevenSegPanel>
              <SevenSegPanel label="too little supply" accent={colors.danger} glow={0.6} style={{ flex: 1 }}>
                <SevenSegText value="49.5" height={46} color={colors.danger} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>FREQUENCY DROPS</Mono>
              </SevenSegPanel>
              <SevenSegPanel label="too much supply" accent={colors.accent} glow={0.6} style={{ flex: 1 }}>
                <SevenSegText value="50.5" height={46} color={colors.accent} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>FREQUENCY RISES</Mono>
              </SevenSegPanel>
            </div>
            <SevenSegPanel accent={colors.danger} glow={0.5} padding="12px 16px" style={{ marginTop: 14 }}>
              <Body size={17} color={colors.text}>
                <span style={{ color: colors.danger, fontWeight: 700 }}>2.5 Hz</span> separates "everything is fine"
                from total collapse. Less than you can hear.
              </Body>
            </SevenSegPanel>
          </SevenSegSlideShell>
          <Notes>
            - 50 Hz = supply equals demand. Imbalances propagate at 0.67c (two-thirds the speed of light)
            - No buffer, no queue, no retry — physics enforces balance instantaneously
            - [ARROW] Too little supply = frequency drops. Too much = frequency rises. The grid has no buffer.
            - [ARROW] 2.5 Hz separates "everything is fine" from total collapse. Less than you can hear.
            - Backup: Continental European grid synchronized since the 1950s, never fully shut down
          </Notes>
        </Slide>

        {/* ═══════════════════ 12 · TOOLS FOR BALANCING ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={12} total={TOTAL} section="THE GRID" padding={PAD}>
            <SevenSegHeading eyebrow="What happens when supply and demand diverge" index="12" size={34}>Tools for Balancing the Grid</SevenSegHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 18, flex: 1, justifyContent: 'space-evenly' }}>
              {[
                { hz: '49.8', band: '49.8 — 50.2 Hz', d: 'Normal band. Spinning reserves on standby.', c: colors.success },
                { hz: '49.5', band: '49.5 Hz', d: 'Reserves activate. Gas CCGT ramps to max output.', c: colors.accent },
                { hz: '49.2', band: '49.2 Hz', d: 'Reserves maxed. Peaker plant fires up.', c: colors.accent },
                { hz: '49.0', band: '49.0 Hz', d: 'Load shedding begins. Deliberate blackouts to save the grid.', c: colors.danger },
                { hz: '47.5', band: '47.5 Hz', d: 'Generators disconnect to self-protect. Total collapse.', c: colors.danger },
              ].map(row => (
                <div key={row.hz} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <SevenSegText value={row.hz} height={42} color={row.c} style={{ flexShrink: 0, width: 100 }} />
                  <div style={{ flex: 1, borderLeft: `2px solid ${row.c}50`, paddingLeft: 16 }}>
                    <Body size={17} color={colors.text}>{row.d}</Body>
                  </div>
                </div>
              ))}
            </div>
            <Mono size={13} color={colors.textDim}>BELOW 47.5 Hz THE GRID CANNOT RECOVER</Mono>
          </SevenSegSlideShell>
          <Notes>
            - [ARROW] 49.8-50.2 Hz: normal band. Spinning reserves on standby.
            - [ARROW] 49.5 Hz: reserves activate. Gas CCGT ramps to max.
            - [ARROW] 49.2 Hz: reserves maxed. Peaker plant fires up.
            - [ARROW] 49.0 Hz: load shedding begins. Deliberate blackouts to save the grid.
            - [ARROW] 47.5 Hz: generators disconnect to self-protect. Total collapse.
          </Notes>
        </Slide>

        {/* ═══════════════════ 13 · FREQUENCY IN ACTION ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={13} total={TOTAL} section="THE GRID" padding={PAD}>
            <SevenSegHeading eyebrow="Interactive" index="13" size={34}>Balancing the Grid — In Action</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 18 }}>
              Scenarios play out over minutes of real grid time, compressed here.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'space-evenly' }}>
              {[
                { d: 'Generator trip — 800 MW offline', r: 'Reserves catch it. Recovery in ~12 minutes.', c: colors.accent },
                { d: '3 GW loss', r: 'Deep enough to trigger automatic load shedding. Grid survives.', c: colors.danger },
                { d: 'Demand drop', r: 'Frequency goes UP — too much supply is also dangerous.', c: colors.accent },
                { d: 'Cyber attack', r: 'Coordinated SCADA compromise. Cascading trips, no recovery.', c: colors.danger },
              ].map(s => (
                <div key={s.d} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 8, height: 8, background: s.c, boxShadow: `0 0 8px ${s.c}`, flexShrink: 0 }} />
                  <Mono size={17} weight={600} color={s.c} style={{ width: 300, flexShrink: 0 }}>{s.d}</Mono>
                  <Body size={16} color={colors.text}>{s.r}</Body>
                </div>
              ))}
            </div>
            <Mono size={13} color={colors.textDim}>ACCELERATED TIMER · REAL EVENTS UNFOLD OVER MINUTES</Mono>
          </SevenSegSlideShell>
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

        {/* ═══════════════════ 14 · EXPENSIVE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={14} total={TOTAL} section="THE GRID" padding={PAD}>
            <SevenSegHeading eyebrow="The old playbook" index="14" size={34} color={colors.accent}>Balancing the Grid is Expensive</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 16 }}>
              Before batteries and software, this is how we kept the lights on.
            </Body>
            <div style={{ display: 'flex', gap: 10, flex: 1, alignItems: 'stretch' }}>
              {[
                { t: 'Peaker Plants', d: 'Idle 95% of the year, waiting for a spike.', v: '6.5', u: 'EUR B/yr', c: colors.accent },
                { t: 'Spinning Reserves', d: '15% of all fuel to produce nothing.', v: '15', u: '% wasted', c: colors.accent },
                { t: 'Curtailment', d: 'Too much sun or wind? Turn it off.', v: '10', u: 'TWh/yr (DE)', c: colors.secondary },
                { t: 'Grid Bottlenecks', d: 'Congestion blocks renewables.', v: '4.2', u: 'EUR B/yr', c: colors.danger },
              ].map(card => (
                <SevenSegPanel key={card.t} accent={card.c} glow={0.35} padding="14px 16px" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <Mono size={16} weight={700} color={card.c} style={{ marginBottom: 8 }}>{card.t}</Mono>
                  <Body size={17} style={{ flex: 1 }}>{card.d}</Body>
                  <div style={{ marginTop: 12 }}>
                    <SevenSegText value={card.v} height={42} color={card.c} />
                    <Mono size={13} color={colors.textDim} style={{ marginTop: 6 }}>{card.u}</Mono>
                  </div>
                </SevenSegPanel>
              ))}
            </div>
            <div style={{ marginTop: 14 }}>
              <Body size={16} color={colors.text}>
                Over <span style={{ color: colors.accent, fontWeight: 700 }}>EUR 10 billion per year</span> to keep
                gas turbines on standby, reroute power, and throw away clean energy.
              </Body>
              <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>
                SOURCES: ACER MMR 2024 · BEYOND FOSSIL FUELS/AURORA 2025 · BNETZA/SMARD · ENTSO-E
              </Mono>
            </div>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] This is what it costs to keep the lights on the old way.
            Peaker plants: EUR 6.5B/yr — paying gas turbines to sit idle 95% of the year.
            Spinning reserves: 15% of all generation burns fuel 24/7 producing nothing.
            Congestion: EUR 4.2B/yr rerouting power. Wind farms paid to stop, gas plants to start.
            Curtailment: Germany throws away 10 TWh of clean energy per year.
            That's over EUR 10B/yr in hard costs — and when all of this fails, Texas happens.
          </Notes>
        </Slide>

        {/* ═══════════════════ 15 · WHY TEXAS FAILED ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={15} total={TOTAL} section="THE GRID" alert padding={PAD}>
            <SevenSegHeading eyebrow="Cascading feedback loop" index="15" size={32} color={colors.danger}>Why Texas Failed</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 14 }}>
              The gas-electric death spiral — each step makes the next one worse.
            </Body>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9, flex: 1, justifyContent: 'space-evenly' }}>
              {[
                { n: '1', t: 'Extreme cold hits Texas', hot: false },
                { n: '2', t: 'Generators freeze and trip offline', hot: false },
                { n: '3', t: 'ERCOT orders emergency load shedding', hot: true },
                { n: '4', t: 'Load shedding cuts power to gas compressors & pipelines', hot: true },
                { n: '5', t: 'Gas supply drops — more generators lose fuel and trip', hot: true },
                { n: '6', t: 'More load shedding needed — cycle accelerates', hot: true },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <SevenSegText value={step.n} height={38} color={step.hot ? colors.danger : colors.primary} style={{ flexShrink: 0 }} />
                  <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 16, fontWeight: step.hot ? 600 : 400, color: step.hot ? colors.danger : colors.text }}>
                    {step.t}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
              <SevenSegStat target="52 GW" label="offline (of 107 GW)" height={38} accent={colors.danger} style={{ flex: 1 }} />
              <SevenSegStat target="42 HRS" label="average outage" height={38} accent={colors.accent} style={{ flex: 1 }} />
              <SevenSegStat target="ISOLATED" label="no interconnection" height={38} accent={colors.textMuted} style={{ flex: 1 }} />
            </div>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] The gas-electric death spiral — a cascading feedback loop.
            Cold hits, generators freeze, load shedding, cuts power to gas pipelines, more generators fail, more load shedding.
            Steps 4-6 are the death spiral — it accelerates.
            52,000 MW offline out of 107,000. ERCOT is isolated — no interconnection to call for help.
          </Notes>
        </Slide>

        {/* ═══════════════════ 16 · NOT AN ISOLATED INCIDENT ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={16} total={TOTAL} section="THE GRID" alert padding={PAD}>
            <SevenSegHeading eyebrow="23 years, 3 continents" index="16" size={32} color={colors.danger}>Not an Isolated Incident</SevenSegHeading>
            <div style={{ display: 'flex', gap: 26, flex: 1, marginTop: 14 }}>
              {[
                [
                  { y: '2003', e: 'Northeast US/Canada', i: '55M people, $6B damage' },
                  { y: '2003', e: 'Italy Blackout', i: '56M people' },
                  { y: '2006', e: 'European Grid Split', i: '15M households' },
                  { y: '2016', e: 'South Australia (tornadoes)', i: 'Entire state, 1.7M people' },
                  { y: '2017', e: 'South Australia (heatwave)', i: '90K homes, ~42°C day' },
                ],
                [
                  { y: '2021', e: 'Texas ERCOT', i: '4.5M homes, 240+ deaths' },
                  { y: '2021', e: 'Europe Grid Split', i: 'Freq dropped to 49.74 Hz' },
                  { y: '2025', e: 'Spain/Portugal', i: '60M people' },
                  { y: '2025', e: 'Berlin Arson (×2)', i: '50K+ homes' },
                  { y: '2026', e: 'Berlin Teltow Canal', i: '4-day outage' },
                ],
              ].map((col, ci) => (
                <div key={ci} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'space-evenly' }}>
                  {col.map(t => (
                    <div key={t.y + t.e} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                      <SevenSegText value={t.y} height={24} color={colors.danger} style={{ flexShrink: 0 }} />
                      <div>
                        <Mono size={17} weight={600} color={colors.text}>{t.e}</Mono>
                        <Body size={17} style={{ marginTop: 2 }}>{t.i}</Body>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <Mono size={13} color={colors.textDim}>COMMON THREAD: CENTRALIZED · INFLEXIBLE · CASCADING</Mono>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] This isn't a Texas problem — it's a grid architecture problem.
            10 major failures in 23 years across 3 continents.
            2003 Northeast US: 55 million people, $6B. 2016 South Australia: entire state.
            Spain/Portugal 2025: 60 million people. Berlin arson 2025: two attacks, 50K+ homes.
            The common thread? Centralized, inflexible, cascading.
          </Notes>
        </Slide>

        {/* ═══════════════════ 17 · LIMITED FLEXIBILITY ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={17} total={TOTAL} section="THE GRID" alert padding={PAD}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <Body size={18} color={colors.text} style={{ marginBottom: 20 }}>
                Every one of these failures shares one root cause:
              </Body>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 46, fontWeight: 700, color: colors.danger, textShadow: `0 0 34px ${colors.danger}45` }}>
                Limited flexibility.
              </div>
              <Body size={16} style={{ marginTop: 22 }}>
                Now imagine adding the most variable energy source in history.
              </Body>
            </div>
          </SevenSegSlideShell>
          <Notes>
            - Every one of these failures: limited flexibility to respond
            - Pause. Let that land.
            - "Now imagine adding the most variable energy source in history."
            - Backup: load shedding exists but it's a blunt tool — deliberate blackouts, not flexibility
          </Notes>
        </Slide>

        {/* ═══════════════════ 18 · PART II ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={18} total={TOTAL} section="RENEWABLES" padding={PAD}>
            <SectionTitle part="Part II" title="The Renewable Revolution" subtitle="Inevitable, amazing — and a whole new kind of problem" color={colors.accent} />
          </SevenSegSlideShell>
          <Notes>
            [MARIO] "Inevitable, amazing — and a whole new kind of problem."
          </Notes>
        </Slide>

        {/* ═══════════════════ 19 · RENEWABLE EXPLOSION ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={19} total={TOTAL} section="RENEWABLES" padding={PAD}>
            <SevenSegHeading eyebrow="Germany's electricity mix" index="19" size={34}>The Renewable Explosion</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 16 }}>
              Germany's share of electricity from renewables — this is not slowing down.
            </Body>
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { y: '2010', v: '17', c: colors.textDim },
                { y: '2014', v: '28', c: colors.textDim },
                { y: '2018', v: '38', c: colors.accent },
                { y: '2022', v: '47', c: colors.accent },
                { y: '2025', v: '60', c: colors.success },
              ].map(d => (
                <SevenSegPanel key={d.y} glow={0.3} padding="12px 14px" style={{ flex: 1 }}>
                  <Mono size={13} color={colors.textDim}>{d.y}</Mono>
                  <SevenSegText value={d.v} height={40} color={d.c} style={{ marginTop: 8 }} />
                  <Mono size={13} color={colors.textDim} style={{ marginTop: 6 }}>% OF GENERATION</Mono>
                </SevenSegPanel>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <SevenSegText value="60" height={72} color={colors.success} align="center" />
                <Mono size={13} spacing="0.2em" color={colors.textDim}>PERCENT AND CLIMBING</Mono>
              </div>
            </div>
            <Mono size={13} color={colors.textDim}>EVERY COUNTRY IS ON THIS CURVE</Mono>
          </SevenSegSlideShell>
          <Notes>
            [MARIO] Germany's renewable share — this is exponential growth.
            Already over 50% of electricity generation.
            This is not slowing down. Every country is on this curve.
          </Notes>
        </Slide>

        {/* ═══════════════════ 20 · DUCK CURVE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={20} total={TOTAL} section="RENEWABLES" padding={PAD}>
            <SevenSegHeading eyebrow="The belly deepens every year" index="20" size={34} color={colors.accent}>The Duck Curve Problem</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 16 }}>
              Solar floods the grid at midday. Sunset ramps steeply. Prices go haywire.
            </Body>
            <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'center', maxHeight: 340 }}>
              <SevenSegPanel label="midday price" accent={colors.success} glow={0.5} style={{ flex: 1 }}>
                <SevenSegText value="12" height={40} color={colors.success} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>EUR / MWh</Mono>
              </SevenSegPanel>
              <SevenSegPanel label="evening ramp" accent={colors.danger} glow={0.6} style={{ flex: 1 }}>
                <SevenSegText value="180" height={40} color={colors.danger} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>EUR / MWh</Mono>
              </SevenSegPanel>
              <SevenSegPanel label="ramp rate" accent={colors.accent} glow={0.5} style={{ flex: 1 }}>
                <SevenSegText value="15" height={40} color={colors.accent} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>GW / HOUR</Mono>
              </SevenSegPanel>
            </div>
            <SevenSegPanel glow={0.35} padding="12px 16px" style={{ marginTop: 14 }}>
              <Body size={16} color={colors.text}>
                The grid needs ramping capacity it doesn't have — and it needs it every single evening.
              </Body>
            </SevenSegPanel>
          </SevenSegSlideShell>
          <Notes>
            [MARIO] Solar floods the grid at midday — prices collapse.
            Sunset: demand ramps steeply, solar disappears.
            This "belly" gets deeper every year as more solar comes online.
            The grid needs ramping capacity it doesn't have.
          </Notes>
        </Slide>

        {/* ═══════════════════ 21 · OUTGROWN THE GRID ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={21} total={TOTAL} section="RENEWABLES" alert padding={PAD}>
            <SevenSegHeading eyebrow="Curtailment" index="21" size={34} color={colors.danger}>Clean Energy Has Outgrown the Grid</SevenSegHeading>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <SevenSegStat countTo={554} prefix="EUR " suffix="M" label="paid to NOT produce" height={40} accent={colors.danger} duration={1200} style={{ flex: 1 }} />
              <SevenSegStat countTo={9.3} decimals={1} suffix=" TWh" label="clean energy curtailed" height={40} accent={colors.accent} duration={1000} delay={300} style={{ flex: 1 }} />
              <SevenSegStat countTo={49} suffix="%" label="from local grid issues" height={40} accent={colors.secondary} duration={1400} delay={600} style={{ flex: 1 }} />
              <SevenSegStat countTo={2.7} decimals={1} suffix="M" label="homes' worth wasted" height={40} accent={colors.textMuted} duration={1100} delay={900} style={{ flex: 1 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <SevenSegPanel accent={colors.accent} glow={0.6} padding="20px 28px">
                <Body size={20} color={colors.accent} align="center" style={{ fontWeight: 600 }}>
                  Where can we put this curtailed renewable energy?
                </Body>
              </SevenSegPanel>
            </div>
            <Body size={17} color={colors.textDim}>
              While SuedLink is built by 2028, 49% of curtailment comes from local grid issues.
              Neighborhood transformers are overwhelmed.
            </Body>
          </SevenSegSlideShell>
          <Notes>
            [MARIO] Germany paid EUR 554 million to generators to NOT produce electricity.
            9.3 TWh curtailed — enough to power 2.7 million homes.
            49% of congestion is at the local distribution level — rooftop solar overwhelming neighborhood transformers.
            New long-distance cables don't fix this. You need local flexibility.
            A VPP could be the buyer of last resort — charge batteries, pre-heat buildings, shift EV charging.
          </Notes>
        </Slide>

        {/* ═══════════════════ 22 · THE SOLUTION IS INSTALLED ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={22} total={TOTAL} section="THE VPP" padding={PAD}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <Body size={18} color={colors.text} style={{ marginBottom: 16 }}>
                The grid needs flexibility it doesn't have.
              </Body>
              <Body size={18} color={colors.text} style={{ marginBottom: 22 }}>
                But millions of homes already have solar, batteries, and heat pumps.
              </Body>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 44, fontWeight: 700, color: colors.primary, textShadow: `0 0 32px ${colors.primary}45` }}>
                What if they could work together?
              </div>
            </div>
          </SevenSegSlideShell>
          <Notes>
            - The grid needs flexibility. Homes already have the hardware.
            - Pause. "What if they could work together?"
            - Backup: ~3M homes in Germany with solar, growing 500K/yr. Most have or will have batteries.
          </Notes>
        </Slide>

        {/* ═══════════════════ 23 · HOMES BECOME INFRASTRUCTURE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={23} total={TOTAL} section="THE VPP" padding={PAD}>
            <SevenSegHeading eyebrow="Your roof becomes a power plant" index="23" size={34} center>Homes Become Infrastructure</SevenSegHeading>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              {[
                { k: 'CHARGE', d: 'Store cheap midday solar', c: colors.solar },
                { k: 'EXPORT', d: 'Send power back to the grid', c: colors.success },
                { k: 'SHIFT', d: 'Move consumption to better hours', c: colors.primary },
              ].map(a => (
                <SevenSegPanel key={a.k} accent={a.c} glow={0.4} padding="16px 18px" style={{ flex: 1 }}>
                  <Mono size={17} weight={700} spacing="0.16em" color={a.c}>{a.k}</Mono>
                  <Body size={16} style={{ marginTop: 8 }}>{a.d}</Body>
                </SevenSegPanel>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <SevenSegText value="3" height={64} color={colors.primary} align="center" />
                <Mono size={13} spacing="0.2em" color={colors.textDim}>MILLION GERMAN HOMES WITH SOLAR · +500K/YR</Mono>
              </div>
            </div>
            <Body size={16} color={colors.text} align="center">
              Coordinating millions of these devices? That's a distributed systems problem.
            </Body>
          </SevenSegSlideShell>
          <Notes>
            [MARIO] Your roof becomes a power plant. Your garage becomes a grid asset.
            Your house becomes a node in the largest distributed system ever built.
            But coordinating millions of these devices? That's a distributed systems problem.
            Transition: that's where we come in
          </Notes>
        </Slide>

        {/* ═══════════════════ 24 · PART III ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={24} total={TOTAL} section="THE VPP" padding={PAD}>
            <SectionTitle part="Part III" title="The Virtual Power Plant" subtitle="Software that turns distributed energy into grid infrastructure" color={colors.primary} />
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] "Software that turns distributed energy into grid infrastructure."
          </Notes>
        </Slide>

        {/* ═══════════════════ 25 · WHAT IS A VPP ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={25} total={TOTAL} section="THE VPP" padding={PAD}>
            <SevenSegHeading eyebrow="From market signal to battery response" index="25" size={34}>What Is a Virtual Power Plant?</SevenSegHeading>
            <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'stretch' }}>
              {[
                { k: '01', t: 'DEVICES', d: 'Solar, batteries, EV chargers, heat pumps' },
                { k: '02', t: 'CLOUD PLATFORM', d: 'Kubernetes + Dapr, event-driven control' },
                { k: '03', t: 'SERVICES', d: 'Frequency regulation, peak shaving, arbitrage' },
                { k: '04', t: 'MARKET', d: 'Day-ahead, balancing, capacity markets' },
              ].map((s, i) => (
                <React.Fragment key={s.k}>
                  <SevenSegPanel glow={0.35} padding="14px 16px" style={{ flex: 1 }}>
                    <SevenSegText value={s.k} height={22} color={colors.primary} style={{ marginBottom: 10 }} />
                    <Mono size={13} spacing="0.14em" color={colors.text}>{s.t}</Mono>
                    <Body size={17} style={{ marginTop: 6 }}>{s.d}</Body>
                  </SevenSegPanel>
                  {i < 3 && <div style={{ display: 'flex', alignItems: 'center', color: colors.primary, fontSize: 18, opacity: 0.5 }}>→</div>}
                </React.Fragment>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <SevenSegPanel glow={0.5} padding="16px 22px">
                <Mono size={17} spacing="0.1em" color={colors.text}>
                  MARKET SIGNAL → FLEXA CONTROLLER → KAFKA → CLOUD HEMS → MQTT → BATTERY
                </Mono>
              </SevenSegPanel>
            </div>
            <Mono size={13} color={colors.textDim}>SOFTWARE THAT OPERATES MILLIONS OF DEVICES AS ONE POWER PLANT</Mono>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] Left: devices — solar panels, batteries, EV chargers, heat pumps.
            Center: cloud platform — Kubernetes + Dapr, event-driven control.
            Right: services — frequency regulation, peak shaving, energy arbitrage, demand response.
            [ANIMATED] Energy market sends request → VPP Controller (Flexa) on Kubernetes.
            Controller publishes commands via Kafka → Enpal cloud → MQTT to individual homes.
            Watch the data flow — from market signal to battery charge in seconds.
            Software that aggregates and operates millions of devices as one coordinated power plant.
          </Notes>
        </Slide>

        {/* ═══════════════════ 26 · INSIDE THE ARCHITECTURE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={26} total={TOTAL} section="THE VPP" padding={PAD}>
            <SevenSegHeading eyebrow="Zoom in on the key decisions" index="26" size={34}>Inside the Architecture</SevenSegHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 18, flex: 1, justifyContent: 'space-evenly' }}>
              {[
                { t: 'HOME SYSTEM', d: 'Enpal.One edge gateway. Local energy management, WISH protocol for conflict resolution.' },
                { t: 'MQTT + CHOREOGRAPHY', d: 'No central coordinator. Pub/sub scales linearly. No shared mutable state.' },
                { t: 'FLEXA CONTROL LOOP', d: 'Market signal to device in under 2 seconds. ArgoCD for GitOps across 100K+ devices.' },
                { t: 'DATA PIPELINE', d: 'Databricks lakehouse, Spark streaming. 5M measurements/min. 10x storage reduction.' },
              ].map(s => (
                <SevenSegPanel key={s.t} glow={0.3} padding="14px 18px">
                  <Mono size={17} spacing="0.14em" color={colors.primary} weight={700}>{s.t}</Mono>
                  <Body size={17} color={colors.text} style={{ marginTop: 6 }}>{s.d}</Body>
                </SevenSegPanel>
              ))}
            </div>
            <Mono size={13} color={colors.textDim}>FLEXA = VPP CONTROLLER · JOINT VENTURE ENPAL + ENTRIX</Mono>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] Same architecture — now let's zoom in on the key decisions.
            [ARROW] Home system: Enpal.One edge gateway. Local energy management, WISH protocol for conflict resolution.
            [ARROW] MQTT + Choreography: No central coordinator. Pub/sub scales linearly. Why not stronger consistency? No shared mutable state.
            [ARROW] Flexa control loop: Market signal to device in under 2 seconds. ArgoCD for GitOps deployment across 100K+ devices.
            [ARROW] Data pipeline: Databricks lakehouse, Spark streaming. 5M measurements/min. Progressive aggregation reduces storage 10x.
          </Notes>
        </Slide>

        {/* ═══════════════════ 27 · EVENT-DRIVEN CONTROL PLANE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={27} total={TOTAL} section="THE VPP" padding={PAD}>
            <SevenSegHeading eyebrow="No central coordinator" index="27" size={34}>Event-Driven Control Plane</SevenSegHeading>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {[
                { l: 'RUNTIME', v: 'DAPR', c: colors.primary },
                { l: 'ORCHESTRATION', v: 'K8S', c: colors.primary },
                { l: 'GITOPS', v: 'ARGOCD', c: colors.accent },
                { l: 'BROKER', v: 'EMQX', c: colors.success },
              ].map(s => (
                <SevenSegPanel key={s.l} accent={s.c} glow={0.3} padding="10px 14px" style={{ flex: 1 }}>
                  <Mono size={13} spacing="0.18em" color={colors.textDim}>{s.l}</Mono>
                  <Mono size={18} weight={700} color={s.c} style={{ marginTop: 4 }}>{s.v}</Mono>
                </SevenSegPanel>
              ))}
            </div>
            <Body size={16} style={{ marginTop: 16 }}>
              Each home is a Dapr actor. MQTT pub/sub scales linearly. Services react to events independently.
            </Body>
            <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'center', maxHeight: 340, marginTop: 14 }}>
              <SevenSegPanel glow={0.3} padding="14px 18px" style={{ flex: 1 }}>
                <Mono size={16} weight={700} color={colors.success}>DAPR ACTORS</Mono>
                <Body size={16} style={{ marginTop: 6 }}>One actor per home — isolated state, turn-based concurrency</Body>
              </SevenSegPanel>
              <SevenSegPanel glow={0.3} padding="14px 18px" style={{ flex: 1 }}>
                <Mono size={16} weight={700} color={colors.primary}>CHOREOGRAPHY</Mono>
                <Body size={16} style={{ marginTop: 6 }}>No orchestrator — 100K independent pub/sub channels</Body>
              </SevenSegPanel>
              <SevenSegPanel glow={0.3} padding="14px 18px" style={{ flex: 1 }}>
                <Mono size={16} weight={700} color={colors.accent}>ARGOCD</Mono>
                <Body size={16} style={{ marginTop: 6 }}>Fleet config as code — rolling updates from Git</Body>
              </SevenSegPanel>
            </div>
            <Mono size={13} color={colors.textDim}>WHY NOT STRONGER CONSISTENCY? NO SHARED MUTABLE STATE BETWEEN HOMES</Mono>
          </SevenSegSlideShell>
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

        {/* ═══════════════════ 28 · PROGRESSIVE AGGREGATION ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={28} total={TOTAL} section="THE VPP" padding={PAD}>
            <SevenSegHeading eyebrow="Compress volume, preserve value" index="28" size={34}>Progressive Aggregation</SevenSegHeading>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              {[
                { k: 'RAW', v: '20', u: 'SECONDS', c: colors.accent },
                { k: '1 MIN', v: '3', u: '× 20s', c: colors.primary },
                { k: '5 MIN', v: '5', u: '× 1m', c: colors.primary },
                { k: '15 MIN', v: '3', u: '× 5m', c: colors.primary },
                { k: '1 HOUR', v: '4', u: '× 15m', c: colors.secondary },
                { k: '24 HOUR', v: '24', u: '× 1h', c: colors.success },
              ].map(t => (
                <SevenSegPanel key={t.k} accent={t.c} glow={0.3} padding="12px 12px" style={{ flex: 1 }}>
                  <Mono size={13} spacing="0.14em" color={colors.textDim}>{t.k}</Mono>
                  <SevenSegText value={t.v} height={40} color={t.c} style={{ marginTop: 8 }} />
                  <Mono size={13} color={colors.textDim} style={{ marginTop: 6 }}>{t.u}</Mono>
                </SevenSegPanel>
              ))}
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <SevenSegText value="4320" height={70} color={colors.success} align="center" />
                <Mono size={13} spacing="0.2em" color={colors.textDim}>TO 1 COMPRESSION RATIO</Mono>
              </div>
            </div>
            <Body size={17} color={colors.textDim}>
              Raw data expires after 7 days. Daily aggregates live forever.
            </Body>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] This is the aggregation pyramid — how we compress data while preserving value.
            Every 20 seconds, each device reports. Three of those become a 1-minute aggregate.
            Five 1-minute windows become 5 minutes. Three of those make 15 minutes. Four make an hour. Twenty-four make a day.
            That's a 4,320:1 compression ratio. Raw data expires after 7 days. Daily aggregates live forever.
            The pyramid shape tells the story — high frequency at the base, high value at the top.
          </Notes>
        </Slide>

        {/* ═══════════════════ 29 · ARCHITECTURE PARALLEL ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={29} total={TOTAL} section="THE VPP" padding={PAD}>
            <SevenSegHeading eyebrow="The Kubernetes analogy" index="29" size={34}>The Architecture Parallel</SevenSegHeading>
            <div style={{ display: 'flex', gap: 16, flex: 1, marginTop: 18 }}>
              <SevenSegPanel glow={0.35} padding="18px 20px" style={{ flex: 1 }}>
                <Mono size={17} spacing="0.16em" color={colors.textDim}>TRADITIONAL GRID</Mono>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  {[
                    { a: 'Few large generators', b: 'Central control room' },
                    { a: 'Manual dispatch', b: 'Phone calls' },
                    { a: 'Rigid, one-way', b: 'No flexibility' },
                  ].map(r => (
                    <div key={r.a}>
                      <Body size={17} color={colors.text}>{r.a}</Body>
                      <Mono size={13} color={colors.textDim} style={{ marginTop: 2 }}>{r.b}</Mono>
                    </div>
                  ))}
                </div>
              </SevenSegPanel>
              <div style={{ display: 'flex', alignItems: 'center', color: colors.primary, fontSize: 22, opacity: 0.5 }}>→</div>
              <SevenSegPanel accent={colors.primary} glow={0.5} padding="18px 20px" style={{ flex: 1 }}>
                <Mono size={17} spacing="0.16em" color={colors.primary}>VIRTUAL POWER PLANT</Mono>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                  {[
                    { a: 'Millions of small devices', b: 'Distributed actors' },
                    { a: 'Automated dispatch', b: 'Event-driven' },
                    { a: 'Flexible, bidirectional', b: 'Elastic capacity' },
                  ].map(r => (
                    <div key={r.a}>
                      <Body size={17} color={colors.text}>{r.a}</Body>
                      <Mono size={13} color={colors.textDim} style={{ marginTop: 2 }}>{r.b}</Mono>
                    </div>
                  ))}
                </div>
              </SevenSegPanel>
            </div>
            <Mono size={13} color={colors.textDim}>SAME PROBLEM CLASS: FLEET COORDINATION, LATENCY BUDGETS, FAILURE DOMAINS</Mono>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] The parallel is exact, not metaphorical.
            Traditional grid = monolith with a central control room.
            VPP = distributed system with millions of actors.
            Same problem class you solve daily: fleet coordination, latency budgets, failure domains.
          </Notes>
        </Slide>

        {/* ═══════════════════ 30 · HOW A VPP RESPONDS ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={30} total={TOTAL} section="THE VPP" padding={PAD}>
            <SevenSegHeading eyebrow="Different timescales, different strategies" index="30" size={32}>How a VPP Responds to Grid Events</SevenSegHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16, flex: 1, justifyContent: 'space-evenly' }}>
              {[
                { e: 'Frequency Containment (FCR)', t: '< 30 SEC', d: 'Battery injects/absorbs power to stabilise frequency', c: colors.danger, cost: 'Blackout cost: EUR 1-5B per event' },
                { e: 'Automatic Frequency Restoration (aFRR)', t: '< 5 MIN', d: 'Sustained response to restore frequency to 50 Hz', c: colors.accent, cost: 'Gas peaker alternative: EUR 150-300/MWh' },
                { e: 'Peak Shaving', t: '1-4 HRS', d: 'Reduce grid load during peaks by discharging batteries', c: colors.primary, cost: 'VPP capacity 40-60% cheaper than peakers (Brattle)' },
                { e: 'Energy Arbitrage', t: 'SCHEDULED', d: 'Charge at negative prices, discharge at peak', c: colors.success, cost: 'Curtailment avoided: EUR 554M/yr (DE)' },
              ].map(row => (
                <div key={row.e} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 300, flexShrink: 0 }}>
                    <Mono size={17} weight={700} color={row.c}>{row.e}</Mono>
                    <Mono size={13} color={colors.textDim} style={{ marginTop: 3 }}>{row.t}</Mono>
                  </div>
                  <div style={{ flex: 1 }}>
                    <Body size={16} color={colors.text}>{row.d}</Body>
                    <Mono size={13} color={colors.textDim} style={{ marginTop: 3 }}>{row.cost}</Mono>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {[
                { l: 'COAL', v: '2-12 HRS' },
                { l: 'GAS', v: '10-30 MIN' },
                { l: 'HYDRO', v: '15-30 SEC' },
                { l: 'BATTERY', v: '140 MS', c: colors.success },
              ].map(s => (
                <SevenSegPanel key={s.l} accent={s.c} glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                  <Mono size={13} spacing="0.18em" color={colors.textDim}>{s.l}</Mono>
                  <Mono size={16} weight={700} color={s.c || colors.text} style={{ marginTop: 4 }}>{s.v}</Mono>
                </SevenSegPanel>
              ))}
            </div>
          </SevenSegSlideShell>
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

        {/* ═══════════════════ 31 · ARBITRAGE + PEAK SHAVING ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={31} total={TOTAL} section="THE VPP" padding={PAD}>
            <SevenSegHeading eyebrow="Berlin, a sunny July day" index="31" size={34}>Energy Arbitrage + Peak Shaving</SevenSegHeading>
            <div style={{ display: 'flex', gap: 12, marginTop: 18 }}>
              <SevenSegStat target="53,000" label="homes generating solar" height={38} accent={colors.solar} style={{ flex: 1 }} />
              <SevenSegStat target="-42" suffix=" EUR" label="midday price (negative)" height={38} accent={colors.success} style={{ flex: 1 }} />
              <SevenSegStat target="180" suffix=" EUR" label="evening peak price" height={38} accent={colors.danger} style={{ flex: 1 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, justifyContent: 'space-evenly' }}>
              {[
                { t: 'MORNING', d: 'Sun rises. 53,000 homes generating solar.' },
                { t: 'MIDDAY', d: 'Prices collapse. Flexa holds batteries empty on purpose.' },
                { t: 'NEGATIVE PRICES', d: 'Charge everything — batteries, EVs, pre-heat homes to bank cheap thermal mass.' },
                { t: 'EVENING', d: 'Sun sets, prices spike. Full batteries discharge at peak.' },
              ].map(s => (
                <div key={s.t} style={{ display: 'flex', gap: 14, alignItems: 'baseline' }}>
                  <Mono size={13} spacing="0.14em" color={colors.primary} weight={700} style={{ width: 160, flexShrink: 0 }}>{s.t}</Mono>
                  <Body size={17} color={colors.text}>{s.d}</Body>
                </div>
              ))}
            </div>
            <SevenSegPanel accent={colors.success} glow={0.4} padding="12px 16px">
              <Body size={16} color={colors.text}>
                Revenue earned. Grid peaks softened. Fossil generation reduced.
              </Body>
            </SevenSegPanel>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] [MAP HUD] Full-screen Berlin map — walk through each step.
            Sunny July morning. 53,000 homes generating solar.
            Midday — prices collapse. Flexa holds batteries empty on purpose.
            Prices go negative — charge everything. Solar curtailed, batteries and EVs charging from the grid at negative prices, heat pumps pre-heating homes to bank cheap energy as thermal mass.
            Evening — sun sets, prices spike. Full batteries discharge at peak prices.
            Revenue earned. Grid peaks softened. Fossil generation reduced.
          </Notes>
        </Slide>

        {/* ═══════════════════ 32 · SA VPP ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <LazyContent><SevenSegMap scene="sa" variant="vpp" /></LazyContent>
            </div>

            <div style={{ position: 'absolute', top: 30, left: 46, right: 46, zIndex: 3, pointerEvents: 'none' }}>
              <Eyebrow color={colors.success}>South Australia · 2019–2023</Eyebrow>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fontWeight: 700, color: colors.text, textShadow: `0 0 24px ${colors.text}30` }}>
                SA Virtual Power Plant
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 30, left: 46, right: 46, zIndex: 3, display: 'flex', gap: 12, pointerEvents: 'none' }}>
              <SevenSegPanel accent={colors.primary} glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="5" height={30} color={colors.primary} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>MW AGGREGATED FLEET</Mono>
              </SevenSegPanel>
              <SevenSegPanel accent={colors.success} glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="250" height={30} color={colors.success} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>MILLISECONDS TO RESPOND</Mono>
              </SevenSegPanel>
              <SevenSegPanel accent={colors.accent} glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="1000" height={30} color={colors.accent} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>HOMES WITH POWERWALL</Mono>
              </SevenSegPanel>
            </div>
          </div>
          <Notes>
            [LERENZO] South Australia proved this works.
            ~1,000 homes with Tesla Powerwalls, aggregated into a 5 MW fleet.
            One of the world's first demonstrations that distributed home batteries can stabilize a grid.
          </Notes>
        </Slide>

        {/* ═══════════════════ 33 · BACK TO TEXAS ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={33} total={TOTAL} section="CLOSING" padding={PAD}>
            <SevenSegHeading eyebrow="Back to Texas" index="33" size={34}>Remember those 4:37?</SevenSegHeading>
            <div style={{ display: 'flex', gap: 16, flex: 1, marginTop: 18, alignItems: 'center' }}>
              <SevenSegPanel accent={colors.danger} glow={0.6} padding="18px 22px" style={{ flexShrink: 0, width: 300 }}>
                <SevenSegText value="4:37" height={54} color={colors.danger} align="center" />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8, textAlign: 'center' }}>SPARE</Mono>
              </SevenSegPanel>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Body size={17} color={colors.text}>
                  Distributed batteries respond in <span style={{ color: colors.success, fontWeight: 700 }}>140 milliseconds</span>.
                  That frequency breach at 1:51 AM never happens.
                </Body>
                <Body size={17}>
                  Batteries alone don't solve a 63-hour, 1,000 GWh energy crisis. But they buy the hours
                  that prevent a cold-start collapse.
                </Body>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <Body size={22} color={colors.success} align="center" style={{ fontWeight: 600, textShadow: `0 0 26px ${colors.success}30`, maxWidth: 860 }}>
                The grid doesn't need one silver bullet.<br />It needs a million small ones, responding together.
              </Body>
            </div>
            <Mono size={13} color={colors.textDim}>
              10 GW OF 4-HOUR BATTERIES = 40 GWh ≈ 4% OF THE DEFICIT · HONESTY MATTERS
            </Mono>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] Remember those 4 minutes and 37 seconds?
            At 1:51 AM, frequency hit 59.4 Hz -- 9 minutes from total collapse. It recovered with 4:37 to spare.
            Distributed batteries respond in 140ms. That breach never happens.
            But honesty matters: the full crisis was 63 hours, ~1,000 GWh shortfall. 10 GW of 4-hour batteries = 40 GWh = ~4% of the deficit.
            Batteries alone don't solve a multi-day energy crisis. But they prevent the acute collapse that turns a bad week into a catastrophe.
            The grid doesn't need one silver bullet. It needs a million small ones.
            Backup: ERCOT CEO Bill Magness, Feb 24 2021 board meeting. FERC/NERC final report, Nov 2021: 61.8 GW lost across 1,045 units.
          </Notes>
        </Slide>

        {/* ═══════════════════ 34 · THANK YOU ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={34} total={TOTAL} section="CLOSING" padding={PAD}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
              <SevenSegText value="140" height={72} color={colors.success} align="center" style={{ marginBottom: 10 }} />
              <Mono size={13} spacing="0.22em" color={colors.textDim} style={{ marginBottom: 26 }}>MILLISECONDS</Mono>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 44, fontWeight: 700, color: colors.primary, textShadow: `0 0 34px ${colors.primary}40`, marginBottom: 16 }}>
                Thank You
              </div>
              <Body size={16} color={colors.text} style={{ marginBottom: 6 }}>
                <span style={{ color: colors.primary, fontWeight: 700 }}>Enpal</span> — Building Europe's Largest Virtual Power Plant
              </Body>
              <Body size={16}>Cloud-Native Infrastructure for the Energy Grid</Body>
              <Mono size={17} color={colors.primary} style={{ marginTop: 26 }}>whatisavpp.com</Mono>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Mono size={13} color={colors.textDim}>
                THANKS: @ENGINEERINGWITHROSIE · ENPAL ENGINEERING · FLEXA
              </Mono>
              <Mono size={13} color={colors.textDim}>SESSION FEEDBACK · SCHED.CO/2CVYB</Mono>
            </div>
          </SevenSegSlideShell>
          <Notes>
            [LERENZO] Thank you — Enpal, building Europe's largest virtual power plant.
            Questions? Find us at the booth / connect after.
          </Notes>
        </Slide>

        {/* ═══════════════════ 35 · APPENDIX TITLE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={35} total={TOTAL} section="APPENDIX" padding={PAD}>
            <SectionTitle part="Backup Slides" title="Appendix" subtitle="Scenarios, data, and references" color={colors.textDim} />
          </SevenSegSlideShell>
        </Slide>

        {/* ═══════════════════ 36 · SA BLACKOUT 2016 ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <StepBridge count={7}>
                {(step) => <LazyContent><SevenSegMap scene="sa" variant="blackout" step={step} /></LazyContent>}
              </StepBridge>
            </div>

            <div style={{ position: 'absolute', top: 30, left: 46, right: 46, zIndex: 3, pointerEvents: 'none' }}>
              <Eyebrow color={colors.danger}>28 September 2016 · AEMO</Eyebrow>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 30, fontWeight: 700, color: colors.danger, textShadow: `0 0 24px ${colors.danger}40` }}>
                SA Blackout, 2016
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 30, left: 46, right: 46, zIndex: 3, display: 'flex', gap: 12, pointerEvents: 'none' }}>
              <SevenSegPanel accent={colors.danger} glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="1.7" height={30} color={colors.danger} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>MILLION PEOPLE AFFECTED</Mono>
              </SevenSegPanel>
              <SevenSegPanel accent={colors.accent} glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="3" height={30} color={colors.accent} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>TRANSMISSION LINES DOWNED</Mono>
              </SevenSegPanel>
              <SevenSegPanel accent={colors.danger} glow={0.4} padding="10px 14px" style={{ flex: 1 }}>
                <SevenSegText value="14" height={30} color={colors.danger} />
                <Mono size={12} color={colors.textDim} style={{ marginTop: 6 }}>SECONDS TO FULL BLACKOUT</Mono>
              </SevenSegPanel>
            </div>
          </div>
          <Notes>
            Backup slide. 2016 South Australia blackout — tornadoes downed three transmission lines.
            [ARROW] Watch the wind farms trip one by one — protection settings disconnected them at the worst moment.
            Voltage collapse cascaded in 14 seconds. Entire state, 1.7 million people.
            The lesson: protection settings matter. Distributed resources need to ride through, not disconnect.
          </Notes>
        </Slide>

        {/* ═══════════════════ 37 · WINTER GRID EMERGENCY ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={37} total={TOTAL} section="APPENDIX" alert padding={PAD}>
            <SevenSegHeading eyebrow="Berlin, winter scenario" index="37" size={32} color={colors.danger}>Winter Grid Emergency</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 16 }}>
              Cold, still air, overcast skies. Demand peaks while renewables collapse.
            </Body>
            <div style={{ display: 'flex', gap: 12 }}>
              <SevenSegStat target="14" suffix=" DAYS" label="below 10% renewables" height={38} accent={colors.danger} style={{ flex: 1 }} />
              <SevenSegStat target="145" suffix=" EUR" label="price spike (Nov)" height={38} accent={colors.accent} style={{ flex: 1 }} />
              <SevenSegStat target="175" suffix=" EUR" label="price spike (Dec)" height={38} accent={colors.danger} style={{ flex: 1 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <SevenSegPanel accent={colors.accent} glow={0.5} padding="16px 20px">
                <Body size={17} color={colors.text}>
                  A VPP can't generate energy from nothing. But it can shift demand, discharge
                  batteries into the peak, and reduce the amount of gas that has to be burned.
                </Body>
              </SevenSegPanel>
            </div>
            <Mono size={13} color={colors.textDim}>THE DUNKELFLAUTE — OCCURS 2-10 TIMES PER YEAR</Mono>
          </SevenSegSlideShell>
          <Notes>
            Backup slide. Winter grid emergency in Berlin.
            Cold, still air, overcast — the dunkelflaute. 14 consecutive days below 10% renewable capacity.
            Prices roughly 2x the annual average.
            A VPP can't create energy, but it can shift demand and discharge into the peak.
          </Notes>
        </Slide>

        {/* ═══════════════════ 38 · NOW WE SHIFT THE LOAD ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={38} total={TOTAL} section="APPENDIX" padding={PAD}>
            <SevenSegHeading eyebrow="Batteries absorb midday solar" index="38" size={32} color={colors.success}>Now We Shift the Load</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 18 }}>
              Charge when energy is cheap and abundant. Discharge when it's scarce and expensive.
            </Body>
            <div style={{ display: 'flex', gap: 12, flex: 1, alignItems: 'center', maxHeight: 340 }}>
              <SevenSegPanel label="midday charge" accent={colors.success} glow={0.5} style={{ flex: 1 }}>
                <SevenSegText value="-42" height={40} color={colors.success} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>EUR / MWh — PAYS TO CHARGE</Mono>
              </SevenSegPanel>
              <SevenSegPanel label="evening discharge" accent={colors.danger} glow={0.5} style={{ flex: 1 }}>
                <SevenSegText value="180" height={40} color={colors.danger} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>EUR / MWh — SELLS AT PEAK</Mono>
              </SevenSegPanel>
              <SevenSegPanel label="spread captured" accent={colors.primary} glow={0.5} style={{ flex: 1 }}>
                <SevenSegText value="222" height={40} color={colors.primary} />
                <Mono size={13} color={colors.textDim} style={{ marginTop: 8 }}>EUR / MWh</Mono>
              </SevenSegPanel>
            </div>
            <SevenSegPanel glow={0.35} padding="12px 16px" style={{ marginTop: 14 }}>
              <Body size={16} color={colors.text}>
                The duck curve's belly becomes a business model — and the grid gets a buffer it never had.
              </Body>
            </SevenSegPanel>
          </SevenSegSlideShell>
          <Notes>
            Backup slide. Load shifting with a VPP battery fleet.
            Midday prices go negative — you get paid to charge.
            Evening prices spike — you discharge at peak.
            The spread is the revenue; the grid gets a buffer.
          </Notes>
        </Slide>

        {/* ═══════════════════ 39 · THE DUNKELFLAUTE ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={39} total={TOTAL} section="APPENDIX" alert padding={PAD}>
            <SevenSegHeading eyebrow="Germany, November 2024" index="39" size={32} color={colors.danger}>The Dunkelflaute</SevenSegHeading>
            <Body size={16} style={{ marginTop: 6, marginBottom: 16 }}>
              Dark doldrums — wind and solar collapse simultaneously. High pressure brings still air and overcast skies.
            </Body>
            <div style={{ display: 'flex', gap: 12 }}>
              <SevenSegStat target="72.75" suffix=" GW" label="wind installed" height={42} accent={colors.primary} style={{ flex: 1 }} />
              <SevenSegStat target="2.8" decimals={1} suffix=" GW" label="wind output (3.8%)" height={42} accent={colors.danger} style={{ flex: 1 }} />
              <SevenSegStat target="4.3" decimals={1} suffix="%" label="solar contribution" height={42} accent={colors.accent} style={{ flex: 1 }} />
              <SevenSegStat target="30" suffix="%" label="renewables total" height={42} accent={colors.danger} style={{ flex: 1 }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-evenly' }}>
              <SevenSegPanel accent={colors.danger} glow={0.5} padding="18px 24px">
                <Body size={18} color={colors.danger} align="center" style={{ fontWeight: 600 }}>
                  You cannot go 100% renewable without storage and flexibility.
                </Body>
              </SevenSegPanel>
            </div>
            <Mono size={13} color={colors.textDim}>50-100 HOURS PER MONTH IN WINTER · 14 CONSECUTIVE DAYS BELOW 10%</Mono>
          </SevenSegSlideShell>
          <Notes>
            Backup slide. The Dunkelflaute — Germany, November 2024.
            72.75 GW of wind installed, only 2.8 GW output. 3.8% of capacity.
            Solar contributed 4.3% instead of the usual ~25%.
            Renewables totalled 30% instead of the normal 50%+.
            This is the case that storage and flexibility exist for.
          </Notes>
        </Slide>

        {/* ═══════════════════ 40 · REFERENCES ═══════════════════ */}
        <Slide backgroundColor={colors.panel} padding="0">
          <SevenSegSlideShell index={40} total={TOTAL} section="APPENDIX" padding={PAD}>
            <SevenSegHeading eyebrow="Sources & citations" index="40" size={32} color={colors.textMuted}>References</SevenSegHeading>
            <div style={{ display: 'flex', gap: 26, flex: 1, marginTop: 14 }}>
              {[
                {
                  h: 'GRID FAILURES', c: colors.danger,
                  items: ['ERCOT — Feb 2021 Winter Storm Final Report', 'FERC/NERC — Texas Event Report (2021)', 'ENTSO-E — Continental Europe Synchronous Area', 'AEMO — SA Black System Report (2017)', 'REE/REN — Iberian Peninsula Incident (2025)'],
                },
                {
                  h: 'RENEWABLE ENERGY', c: colors.accent,
                  items: ['Bundesnetzagentur — Monitoring Report (2024)', 'SMARD.de — Electricity Market Data', 'Fraunhofer ISE — Energy Charts', 'CAISO — Duck Curve Analysis (2016-2024)'],
                },
                {
                  h: 'VPP & FLEXIBILITY', c: colors.success,
                  items: ['RMI — Power Shift (2024)', 'Brattle Group — VPP Cost-Benefit (2023)', 'AEMO — Integrated System Plan (2024)', 'SA Power Networks — VPP Trial Results', 'Tesla — SA VPP Fleet Performance'],
                },
                {
                  h: 'ARCHITECTURE', c: colors.primary,
                  items: ['EMQX — MQTT for Energy IoT', 'Databricks — Streaming for Energy', 'Enpal — Internal Architecture Docs', 'Entrix/Enpal — Flexa VPP Controller'],
                },
              ].map(col => (
                <div key={col.h} style={{ flex: 1 }}>
                  <Mono size={13} spacing="0.16em" color={col.c} weight={700} style={{ marginBottom: 10 }}>{col.h}</Mono>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {col.items.map(i => (
                      <Mono key={i} size={13} color={colors.textDim} spacing="0.02em" style={{ lineHeight: 1.4 }}>{i}</Mono>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Mono size={13} color={colors.textDim} style={{ marginTop: 14 }}>
              FULL DOCS: GITHUB.COM/RIO517/KUBECON-2026-VPP/TREE/MAIN/DOCS
            </Mono>
          </SevenSegSlideShell>
        </Slide>

      </Deck>
    </>
  );
}
