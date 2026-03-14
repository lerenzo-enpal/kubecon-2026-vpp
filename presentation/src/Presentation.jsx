import React from 'react';
import { Deck, Slide, Heading, Text } from 'spectacle';
import { colors } from './theme';
import FrequencyLine from './components/FrequencyLine';
import FrequencyDemo from './components/FrequencyDemo';
import CascadeSimulation from './components/CascadeSimulation';
import TexasCascade from './components/TexasCascade';
import RenewableGrowthChart from './components/RenewableGrowthChart';
import DuckCurveChart from './components/DuckCurveChart';

const theme = {
  colors: { primary: colors.text, secondary: colors.textMuted, tertiary: colors.primary },
  fonts: { header: '"Inter", system-ui, sans-serif', text: '"Inter", system-ui, sans-serif' },
};

const bg = colors.bg;

export default function Presentation() {
  return (
    <Deck theme={theme}>

      {/* ═══════ ACT 1: "4 MINUTES FROM DARKNESS" ═══════ */}

      {/* 1: Texas Cascade — Live Visualization */}
      <Slide backgroundColor={bg}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '13px', fontWeight: 600, fontFamily: '"JetBrains Mono"', background: `${colors.danger}18`, color: colors.danger, border: `1px solid ${colors.danger}30`, marginBottom: 4 }}>FEBRUARY 15, 2021 — TEXAS</div>
        <Heading fontSize="34px" color={colors.danger} margin="4px 0">Winter Storm Uri — Cascading Grid Failure</Heading>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <TexasCascade width={780} height={460} />
        </div>
      </Slide>

      {/* 2: Texas — The Numbers */}
      <Slide backgroundColor={bg}>
        <div style={{ maxWidth: 800 }}>
          <div style={{ fontSize: '26px', fontWeight: 300, color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.8, fontStyle: 'italic' }}>
            "The Texas grid was 4 minutes and 37 seconds from total collapse. A cold restart would have taken weeks."
          </div>
          <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
            {[
              { n: '4:37', l: 'from total collapse', c: colors.danger },
              { n: '246', l: 'people dead', c: colors.danger },
              { n: '$195B', l: 'in damage', c: colors.accent },
              { n: '4.5M', l: 'homes dark', c: colors.textMuted },
            ].map(s => (
              <div key={s.l} style={{ background: colors.surface, border: `1px solid ${s.c}25`, borderRadius: 10, padding: '16px 14px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: 4, fontFamily: '"Inter"', textTransform: 'uppercase' }}>{s.l}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, fontSize: '19px', color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7 }}>
            Power bills spiked to <span style={{ color: colors.danger, fontWeight: 600 }}>$9,000/MWh</span>. Families received <span style={{ color: colors.danger, fontWeight: 600 }}>$7,000 bills</span> in a single week.
            One provider — Griddy — went bankrupt. 29,000 customers left with unpayable debt.
          </div>
          <div style={{ marginTop: 16, fontSize: '17px', color: colors.textDim, fontFamily: '"Inter"', fontStyle: 'italic' }}>
            How did the most energy-rich state in America come this close to total infrastructure failure?
          </div>
        </div>
      </Slide>

      {/* 3: Title */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24 }}>KubeCon + CloudNativeCon Europe 2026</div>
          <Heading fontSize="50px" color={colors.primary}>What is a Virtual Power Plant?</Heading>
          <Text fontSize="24px" color={colors.textMuted}>Cloud-Native Infrastructure for the Energy Grid</Text>
          <div style={{ marginTop: 32, fontSize: '17px', color: colors.text, fontFamily: '"Inter"' }}>
            <span style={{ fontWeight: 600 }}>Enpal / Flexa</span>
            <span style={{ color: colors.textMuted }}> — Building Europe's Largest Virtual Power Plant</span>
          </div>
        </div>
      </Slide>

      {/* 4: Why Texas Failed — The Death Spiral */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="40px" color={colors.danger}>Why Texas Failed</Heading>
        <Text fontSize="17px" color={colors.textMuted}>The gas-electric death spiral — a cascading feedback loop.</Text>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0', gap: 8 }}>
          {[
            { text: 'Extreme cold hits Texas', color: colors.primary, icon: '1' },
            { text: 'Generators freeze and trip offline', color: colors.accent, icon: '2' },
            { text: 'ERCOT orders emergency load shedding', color: colors.accent, icon: '3' },
            { text: 'Load shedding cuts power to gas compressors & pipelines', color: colors.danger, icon: '4' },
            { text: 'Gas supply drops — more generators lose fuel and trip', color: colors.danger, icon: '5' },
            { text: 'More load shedding needed — cycle accelerates', color: colors.danger, icon: '\u21bb' },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', maxWidth: 620 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${step.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 800, color: step.color, fontFamily: '"JetBrains Mono"', flexShrink: 0 }}>{step.icon}</div>
              <div style={{ fontSize: '15px', color: colors.text, fontFamily: '"Inter"', fontWeight: i >= 3 ? 600 : 400 }}>{step.text}</div>
              {i < 5 && <div style={{ position: 'absolute', left: '50%', marginLeft: -200 }} />}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          {[
            { n: '52,000 MW', l: 'offline (of 107K total)', c: colors.danger },
            { n: 'Isolated', l: 'no grid interconnection', c: colors.accent },
            { n: '42 hrs', l: 'average outage duration', c: colors.textMuted },
          ].map(s => (
            <div key={s.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 8, padding: '12px 14px', textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: 2, fontFamily: '"Inter"', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 5: The Grid — Interactive Frequency */}
      <Slide backgroundColor={bg}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ marginBottom: 8 }}>
            <Heading fontSize="38px" color={colors.primary} margin="0 0 4px 0">The Grid: A Balancing Act</Heading>
            <Text fontSize="16px" color={colors.textMuted} margin="0">Supply and demand must match every second. Click the scenarios to see what happens when they don't.</Text>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <FrequencyDemo width={900} height={340} />
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginTop: 8 }}>
            {[
              { n: '60.000 Hz', l: 'US Target (50 Hz in EU)', c: colors.primary },
              { n: '107 GW', l: 'ERCOT Total Capacity', c: colors.secondary },
              { n: '0 buffer', l: 'No Grid Storage', c: colors.accent },
            ].map(s => (
              <div key={s.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 8, padding: '12px 16px', textAlign: 'center', flex: 1 }}>
                <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
                <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: 2, fontFamily: '"Inter"', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* 6: How the Grid Was Built */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>Designed for a Different World</Heading>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, margin: '16px 0' }}>
          {[
            { l: 'Power Plants', s: 'Few, large', c: colors.accent },
            { l: 'Transmission', s: 'High voltage', c: colors.secondary },
            { l: 'Distribution', s: 'One-way', c: colors.primary },
            { l: 'Homes', s: 'Passive', c: colors.textDim },
          ].map((x, i) => (
            <React.Fragment key={i}>
              <div style={{ background: colors.surface, border: `1px solid ${x.c}30`, borderRadius: 10, padding: '16px 14px', textAlign: 'center', width: 140 }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>{x.l}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted, fontFamily: '"Inter"', marginTop: 4 }}>{x.s}</div>
              </div>
              {i < 3 && <div style={{ fontSize: '20px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>}
            </React.Fragment>
          ))}
        </div>
        <Text fontSize="19px" color={colors.textMuted} fontStyle="italic">"Built in the 1950s. One-directional. No flexibility."</Text>
      </Slide>

      {/* 7: It Keeps Happening */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="38px" color={colors.danger}>It Keeps Happening</Heading>
        <div style={{ display: 'flex', gap: 32, marginTop: 8 }}>
          <div style={{ flex: 1 }}>
            {[
              { y: '2003', e: 'Italy Blackout', i: '56M people' },
              { y: '2006', e: 'European Grid Split', i: '15M affected' },
              { y: '2016', e: 'South Australia', i: 'Entire state' },
              { y: '2021', e: 'Texas ERCOT', i: '4.5M homes, 240+ deaths' },
            ].map(t => (
              <div key={t.y+t.e} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ fontFamily: '"JetBrains Mono"', fontSize: '14px', fontWeight: 700, color: colors.danger, minWidth: 42 }}>{t.y}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>{t.e}</div>
                  <div style={{ fontSize: '12px', color: colors.textMuted, fontFamily: '"Inter"' }}>{t.i}</div>
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
              <div key={t.y+t.e} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <div style={{ fontFamily: '"JetBrains Mono"', fontSize: '14px', fontWeight: 700, color: t.c || colors.danger, minWidth: 42 }}>{t.y}</div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>{t.e}</div>
                  <div style={{ fontSize: '12px', color: colors.textMuted, fontFamily: '"Inter"' }}>{t.i}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* 8: Common Pattern */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="38px" color={colors.primary}>Every Cascade Shares Three Properties</Heading>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
          {[
            { n: '1', t: 'Tightly Coupled', d: 'Centralized with single points of failure', c: colors.danger },
            { n: '2', t: 'No Local Reserves', d: 'No distributed storage to absorb shocks', c: colors.accent },
            { n: '3', t: 'Blind Operators', d: 'Degraded system-wide observability', c: colors.secondary },
          ].map(i => (
            <div key={i.n} style={{ background: colors.surface, border: `1px solid ${i.c}25`, borderRadius: 12, padding: '22px 18px', flex: 1, maxWidth: 230 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${i.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 800, color: i.c, fontFamily: '"JetBrains Mono"', marginBottom: 10 }}>{i.n}</div>
              <div style={{ fontSize: '17px', fontWeight: 700, color: colors.text, fontFamily: '"Inter"', marginBottom: 6 }}>{i.t}</div>
              <div style={{ fontSize: '13px', color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.4 }}>{i.d}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 9: Bridge — Grid Needs Flexibility */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ fontSize: '28px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7, marginBottom: 28 }}>
            Every one of these failures shares one root cause:
          </div>
          <div style={{ fontSize: '48px', fontWeight: 800, color: colors.danger, fontFamily: '"Inter"', textShadow: `0 0 40px ${colors.danger}30`, marginBottom: 32 }}>
            No flexibility.
          </div>
          <div style={{ fontSize: '22px', fontWeight: 400, color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.6 }}>
            Now imagine adding the most variable energy source in history.
          </div>
        </div>
      </Slide>

      {/* ═══════ ACT 2: "RENEWABLES CHANGE EVERYTHING" ═══════ */}

      {/* 9: Section Divider */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Part II</div>
          <Heading fontSize="50px" color={colors.primary}>Renewables Change Everything</Heading>
          <Text fontSize="20px" color={colors.textMuted}>Inevitable, amazing — and a whole new kind of problem</Text>
        </div>
      </Slide>

      {/* 10: The Renewable Explosion */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="40px" color={colors.primary} margin="0 0 8px 0">The Renewable Explosion</Heading>
        <Text fontSize="16px" color={colors.textMuted} margin="0 0 12px 0">Germany's electricity from renewables — this is not slowing down.</Text>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <RenewableGrowthChart width={860} height={350} />
        </div>
      </Slide>

      {/* 11: The Duck Curve */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="40px" color={colors.primary} margin="0 0 8px 0">The Duck Curve Problem</Heading>
        <Text fontSize="16px" color={colors.textMuted} margin="0 0 12px 0">Solar floods the grid midday. Demand ramps steeply at sunset. The grid can't cope.</Text>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DuckCurveChart width={860} height={340} />
        </div>
      </Slide>

      {/* 12: Negative Prices */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.accent}>Energy Being Thrown Away</Heading>
        <Text fontSize="18px" color={colors.textMuted}>When supply exceeds demand, electricity prices go <span style={{ color: colors.accent, fontWeight: 600 }}>negative</span>. Generators pay to stay on. Solar gets curtailed. Clean energy — wasted.</Text>
        <div style={{ display: 'flex', gap: 16, margin: '20px 0', justifyContent: 'center' }}>
          {[
            { n: '139', l: 'Negative price hours (2021)', c: colors.textDim },
            { n: '211', l: 'Negative price hours (2022)', c: colors.textMuted },
            { n: '301', l: 'Negative price hours (2023)', c: colors.accent },
            { n: '400+', l: 'Trending (2024)', c: colors.danger },
          ].map(s => (
            <div key={s.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 10, padding: '16px 14px', textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '30px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: 4, fontFamily: '"Inter"', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <Text fontSize="16px" color={colors.textDim}>Germany — Fraunhofer ISE data</Text>
      </Slide>

      {/* 13: What If You Could Shift the Load? */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="40px" color={colors.success} margin="0 0 8px 0">What If You Could Shift the Load?</Heading>
        <Text fontSize="16px" color={colors.textMuted} margin="0 0 12px 0">Batteries absorb midday solar. Discharge in the evening. The duck curve flattens. Click "With VPP" below.</Text>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <DuckCurveChart width={860} height={340} />
        </div>
      </Slide>

      {/* 14: Consumers Become Infrastructure */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
          <Heading fontSize="42px" color={colors.primary}>Consumers Become Infrastructure</Heading>
          <div style={{ fontSize: '21px', color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7, marginTop: 8 }}>
            Homes with solar and batteries can <span style={{ color: colors.solar, fontWeight: 600 }}>charge</span>, <span style={{ color: colors.success, fontWeight: 600 }}>export</span>, and <span style={{ color: colors.primary, fontWeight: 600 }}>shift consumption</span>.
          </div>
          <div style={{ fontSize: '20px', color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.7, marginTop: 16 }}>
            Your roof becomes a power plant.<br />
            Your garage becomes a grid asset.<br />
            Your house becomes a node in the largest distributed system ever built.
          </div>
          <div style={{ fontSize: '19px', color: colors.primary, fontFamily: '"Inter"', fontWeight: 600, marginTop: 28, textShadow: `0 0 30px ${colors.primary}30` }}>
            But coordinating millions of these devices? That's a distributed systems problem.
          </div>
        </div>
      </Slide>

      {/* ═══════ ACT 3: "THE VIRTUAL POWER PLANT" ═══════ */}

      {/* 15: Section Divider */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Part III</div>
          <Heading fontSize="50px" color={colors.primary}>The Virtual Power Plant</Heading>
          <Text fontSize="20px" color={colors.textMuted}>Software that turns distributed energy into grid infrastructure</Text>
        </div>
      </Slide>

      {/* 16: What Is a VPP? */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>What Is a Virtual Power Plant?</Heading>
        <Text fontSize="19px" color={colors.text}>Software that <span style={{ color: colors.primary, fontWeight: 600 }}>aggregates</span> distributed energy resources and <span style={{ color: colors.success, fontWeight: 600 }}>operates</span> them as a coordinated power plant.</Text>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 12 }}>
          <div style={{ background: colors.surface, borderRadius: 10, padding: '14px', border: `1px solid ${colors.surfaceLight}` }}>
            {['Solar Panels', 'Home Batteries', 'EV Chargers', 'Heat Pumps'].map((a, i) => (
              <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: '13px', color: colors.text, fontFamily: '"Inter"' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: [colors.solar, colors.success, colors.primary, colors.secondary][i] }} />{a}
              </div>
            ))}
          </div>
          <div style={{ fontSize: '20px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>
          <div style={{ background: `${colors.primary}08`, borderRadius: 12, padding: '20px 24px', border: `1px solid ${colors.primary}30`, textAlign: 'center' }}>
            <div style={{ fontSize: '16px', fontWeight: 700, color: colors.primary, fontFamily: '"Inter"' }}>Cloud Platform</div>
            <div style={{ fontSize: '11px', color: colors.textMuted, fontFamily: '"JetBrains Mono"', marginTop: 6 }}>Kubernetes + Dapr<br />Event-driven control</div>
          </div>
          <div style={{ fontSize: '20px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>
          <div style={{ background: colors.surface, borderRadius: 10, padding: '14px', border: `1px solid ${colors.surfaceLight}` }}>
            {['Frequency Regulation', 'Peak Shaving', 'Energy Arbitrage', 'Demand Response'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, fontSize: '13px', color: colors.text, fontFamily: '"Inter"' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: [colors.danger, colors.accent, colors.success, colors.primary][i] }} />{s}
              </div>
            ))}
          </div>
        </div>
      </Slide>

      {/* 17: Fastest Power Plant */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>The Fastest Power Plant</Heading>
        <div style={{ maxWidth: 620, marginTop: 8 }}>
          {[
            { l: 'Coal', v: '2-6 hours', c: colors.textDim, w: 90 },
            { l: 'Gas Turbine', v: '10-30 min', c: '#fb923c', w: 45 },
            { l: 'Hydro', v: '15-30 sec', c: '#60a5fa', w: 12 },
            { l: 'Battery', v: '140 ms', c: colors.success, w: 2 },
          ].map(r => (
            <div key={r.l} style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
              <div style={{ width: 100, fontSize: '14px', fontWeight: 500, color: colors.textMuted, fontFamily: '"Inter"', textAlign: 'right' }}>{r.l}</div>
              <div style={{ height: 26, width: `${r.w}%`, background: `linear-gradient(90deg, ${r.c}30, ${r.c}80)`, borderRadius: 5, display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
                <span style={{ fontFamily: '"JetBrains Mono"', fontSize: '12px', fontWeight: 600, color: colors.text }}>{r.v}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: '14px 20px', background: `${colors.success}08`, border: `1px solid ${colors.success}25`, borderRadius: 10, maxWidth: 620 }}>
          <div style={{ fontSize: '17px', fontWeight: 600, color: colors.success, fontFamily: '"Inter"' }}>A battery responds before a gas turbine even knows there's an emergency.</div>
        </div>
      </Slide>

      {/* 18: Hornsdale Proof */}
      <Slide backgroundColor={bg}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '13px', fontWeight: 600, fontFamily: '"JetBrains Mono"', background: `${colors.success}18`, color: colors.success, border: `1px solid ${colors.success}30`, marginBottom: 8 }}>PROOF</div>
        <Heading fontSize="38px" color={colors.success}>Hornsdale, December 2017</Heading>
        <Text fontSize="17px" color={colors.textMuted}>560 MW generator trips. Frequency plunging.</Text>
        <div style={{ margin: '10px 0' }}><FrequencyLine width={800} height={150} collapse={true} vppSave={true} /></div>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          {[
            { n: '140ms', l: 'Battery Response', c: colors.success },
            { n: '28sec', l: 'Gas Response', c: '#fb923c' },
            { n: '8sec', l: 'Margin to Blackout', c: colors.danger },
          ].map(s => (
            <div key={s.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 10, padding: '16px 14px', textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '10px', color: colors.textMuted, marginTop: 4, fontFamily: '"Inter"', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 19: SA VPP Proof */}
      <Slide backgroundColor={bg}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '13px', fontWeight: 600, fontFamily: '"JetBrains Mono"', background: `${colors.success}18`, color: colors.success, border: `1px solid ${colors.success}30`, marginBottom: 8 }}>PROOF</div>
        <Heading fontSize="38px" color={colors.success}>SA Virtual Power Plant, 2019</Heading>
        <Text fontSize="17px" color={colors.textMuted}>748 MW coal plant trips. 1,100 homes respond autonomously.</Text>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: '14px 0' }}>
          {[
            { n: '1,100', l: 'Homes Responded', c: colors.success },
            { n: '2%', l: 'of Planned Fleet', c: colors.primary },
            { n: '0', l: 'Humans Involved', c: colors.accent },
          ].map(s => (
            <div key={s.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 10, padding: '18px 14px', textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: 4, fontFamily: '"Inter"', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ padding: '14px 20px', background: `${colors.success}08`, border: `1px solid ${colors.success}25`, borderRadius: 10, textAlign: 'center' }}>
          <div style={{ fontSize: '19px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>Eleven hundred homes. Acting as one. <span style={{ color: colors.success }}>Without anyone pushing a button.</span></div>
        </div>
      </Slide>

      {/* 20: KubeCon Analogy */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="38px" color={colors.primary}>Speaking Your Language</Heading>
        <div style={{ display: 'flex', gap: 16, alignItems: 'start', marginTop: 4 }}>
          <div style={{ background: colors.surface, borderRadius: 10, padding: '18px', border: `1px solid ${colors.danger}20`, flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.danger, fontFamily: '"JetBrains Mono"', marginBottom: 10 }}>TRADITIONAL GRID</div>
            {['Monolith', 'Few generators', 'Manual scaling', 'Single point of failure', 'No observability'].map(x => (
              <div key={x} style={{ fontSize: '13px', color: colors.textMuted, fontFamily: '"Inter"', padding: '4px 0', borderBottom: `1px solid ${colors.surfaceLight}` }}>{x}</div>
            ))}
          </div>
          <div style={{ paddingTop: 50, fontSize: '22px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>
          <div style={{ background: `${colors.success}06`, borderRadius: 10, padding: '18px', border: `1px solid ${colors.success}25`, flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: colors.success, fontFamily: '"JetBrains Mono"', marginBottom: 10 }}>VIRTUAL POWER PLANT</div>
            {['Distributed microservices', 'Millions of nodes', 'Autoscaling capacity', 'Resilient by design', 'Full observability'].map(x => (
              <div key={x} style={{ fontSize: '13px', color: colors.text, fontFamily: '"Inter"', fontWeight: 500, padding: '4px 0', borderBottom: `1px solid ${colors.surfaceLight}` }}>{x}</div>
            ))}
          </div>
        </div>
        <Text fontSize="13px" color={colors.textMuted} style={{ textAlign: 'center', marginTop: 12, fontFamily: '"JetBrains Mono"' }}>Frequency = SLO &bull; Cascade = failure propagation &bull; Batteries = autoscaling</Text>
      </Slide>

      {/* 21: Demo Without VPP */}
      <Slide backgroundColor={bg}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '13px', fontWeight: 600, fontFamily: '"JetBrains Mono"', background: `${colors.danger}18`, color: colors.danger, border: `1px solid ${colors.danger}30`, marginBottom: 4 }}>LIVE SIMULATION</div>
        <Heading fontSize="32px" color={colors.danger}>Cascading Failure — No VPP</Heading>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CascadeSimulation width={680} height={440} withVPP={false} />
        </div>
      </Slide>

      {/* 22: Demo With VPP */}
      <Slide backgroundColor={bg}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '13px', fontWeight: 600, fontFamily: '"JetBrains Mono"', background: `${colors.success}18`, color: colors.success, border: `1px solid ${colors.success}30`, marginBottom: 4 }}>LIVE SIMULATION</div>
        <Heading fontSize="32px" color={colors.success}>Same Failure — With VPP</Heading>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CascadeSimulation width={680} height={440} withVPP={true} />
        </div>
      </Slide>

      {/* ═══════ ACT 4: "THE FUTURE IS RESILIENT" ═══════ */}

      {/* 23: Back to Texas */}
      <Slide backgroundColor={bg}>
        <div style={{ maxWidth: 750 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20 }}>Back to Texas</div>
          <div style={{ fontSize: '24px', fontWeight: 400, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7 }}>
            <div style={{ marginBottom: 16 }}>Remember those 4 minutes and 37 seconds?</div>
            <div style={{ marginBottom: 16, color: colors.textMuted }}>
              With 10 GW of distributed batteries responding in 140 milliseconds, there is no cascade.
            </div>
            <div style={{ marginBottom: 16, color: colors.textMuted }}>
              The frequency never drops. The gas plants never need to save you.
            </div>
            <div style={{ color: colors.success, fontWeight: 600, textShadow: `0 0 30px ${colors.success}30` }}>
              Because 1 million homes already did.
            </div>
          </div>
        </div>
      </Slide>

      {/* 24: Future Grid */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <Heading fontSize="46px" color={colors.primary}>The Future Grid</Heading>
          <Text fontSize="20px" color={colors.textMuted}>Millions of devices cooperating. Homes, EVs, batteries — forming distributed power plants.</Text>
          <div style={{ marginTop: 20, fontSize: '22px', fontWeight: 600, color: colors.primary, fontFamily: '"Inter"' }}>The grid becomes software.</div>
          <Text fontSize="18px" color={colors.textMuted}>And it runs on the same infrastructure you build every day.</Text>
        </div>
      </Slide>

      {/* 25: Final Takeaway */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <Text fontSize="24px" color={colors.text} style={{ fontWeight: 600 }}>Virtual Power Plants turn distributed renewable energy into <span style={{ color: colors.success }}>reliable grid infrastructure</span>.</Text>
          <Text fontSize="20px" color={colors.textMuted}>Cloud-native systems are what make them possible.</Text>
          <div style={{ fontSize: '22px', fontWeight: 700, color: colors.primary, fontFamily: '"Inter"', padding: '16px 24px', background: `${colors.primary}08`, borderRadius: 12, border: `1px solid ${colors.primary}20`, display: 'inline-block', marginTop: 16 }}>
            You already know how to build the future grid.<br />
            <span style={{ fontWeight: 400, fontSize: '18px', color: colors.textMuted }}>You just didn't know it yet.</span>
          </div>
        </div>
      </Slide>

      {/* 26: Thank You */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <Heading fontSize="52px" color={colors.primary}>Thank You</Heading>
          <Text fontSize="17px" color={colors.textMuted}><span style={{ color: colors.primary, fontWeight: 600 }}>Enpal / Flexa</span> — Building Europe's Largest Virtual Power Plant</Text>
        </div>
      </Slide>

    </Deck>
  );
}
