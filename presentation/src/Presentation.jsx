import React from 'react';
import { Deck, Slide, Heading, Text, Appear } from 'spectacle';
import { colors } from './theme';
import FrequencyLine from './components/FrequencyLine';
import CascadeSimulation from './components/CascadeSimulation';

const theme = {
  colors: { primary: colors.text, secondary: colors.textMuted, tertiary: colors.primary },
  fonts: { header: '"Inter", system-ui, sans-serif', text: '"Inter", system-ui, sans-serif' },
};

const bg = colors.bg;

export default function Presentation() {
  return (
    <Deck theme={theme}>

      {/* 1: Cold Open */}
      <Slide backgroundColor={bg}>
        <div style={{ fontSize: '26px', fontWeight: 300, color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.8, fontStyle: 'italic', maxWidth: 780 }}>
          "January 4th, 2026. 3 AM. Berlin. Someone sets fire to a cable duct over the Teltow Canal. 45,000 households go dark."
        </div>
        <div style={{ marginTop: 24, fontSize: '22px', color: colors.text, fontFamily: '"Inter"', fontWeight: 500 }}>
          Some of those households had solar panels and batteries. They stayed warm.
        </div>
        <div style={{ marginTop: 24, fontSize: '30px', color: colors.primary, fontFamily: '"Inter"', fontWeight: 600, textShadow: `0 0 40px ${colors.primary}30` }}>
          The difference? Software.
        </div>
      </Slide>

      {/* 2: Title */}
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

      {/* 3: Largest Machine */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>Earth's Largest Synchronized Machine</Heading>
        <Text fontSize="19px" color={colors.textMuted}>The power grid must balance supply and demand every second. If this frequency deviates too far, everything stops.</Text>
        <div style={{ margin: '16px auto', display: 'flex', justifyContent: 'center' }}>
          <FrequencyLine width={800} height={170} />
        </div>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center' }}>
          {[
            { n: '50.000 Hz', l: 'Target Frequency', c: colors.primary },
            { n: '400 GW', l: 'European Load', c: colors.secondary },
            { n: '0 buffer', l: 'No Storage', c: colors.accent },
          ].map(s => (
            <div key={s.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 10, padding: '18px 16px', textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '28px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: 4, fontFamily: '"Inter"', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.l}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 4: Designed for Different World */}
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

      {/* 5: The Cascade */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.danger}>The Cascade</Heading>
        <Text fontSize="19px" color={colors.textMuted}>When one node fails, load shifts to neighbors. They overload. They fail. The system defends itself locally while destroying itself globally.</Text>
        <div style={{ display: 'flex', gap: 18, margin: '16px 0', justifyContent: 'center' }}>
          {[
            { n: '265', l: 'Plants Tripped', c: colors.danger },
            { n: '50M', l: 'People Affected', c: colors.danger },
            { n: '$10B', l: 'Economic Damage', c: colors.accent },
          ].map(s => (
            <div key={s.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 10, padding: '18px 16px', textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '32px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: 4, fontFamily: '"Inter"', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <Text fontSize="14px" color={colors.textMuted}><span style={{ color: colors.danger, fontWeight: 600 }}>2003 Northeast Blackout</span> — a software bug and untrimmed trees</Text>
      </Slide>

      {/* 6: It Keeps Happening */}
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

      {/* 7: Common Pattern */}
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

      {/* 8: Renewables */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>Now Add Renewables</Heading>
        <Text fontSize="18px" color={colors.textMuted}>Cheap and essential — but <span style={{ color: colors.accent, fontWeight: 600 }}>less predictable</span>.</Text>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', margin: '12px 0' }}>
          {[
            { l: 'Variable', d: 'Changes with weather', c: colors.solar },
            { l: 'Distributed', d: 'Millions of sources', c: colors.success },
            { l: 'Bidirectional', d: 'Power flows both ways', c: colors.primary },
          ].map(x => (
            <div key={x.l} style={{ background: colors.surface, border: `1px solid ${x.c}25`, borderRadius: 10, padding: '16px', flex: 1, maxWidth: 210, textAlign: 'center' }}>
              <div style={{ fontSize: '17px', fontWeight: 700, color: x.c, fontFamily: '"Inter"', marginBottom: 4 }}>{x.l}</div>
              <div style={{ fontSize: '12px', color: colors.textMuted, fontFamily: '"Inter"' }}>{x.d}</div>
            </div>
          ))}
        </div>
        <Text fontSize="15px" color={colors.textMuted} style={{ textAlign: 'center' }}><span style={{ color: colors.accent, fontWeight: 600 }}>301 negative price hours</span> in Germany (2023)</Text>
        <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 600, color: colors.primary, fontFamily: '"Inter"', marginTop: 4 }}>The grid needs: <span style={{ fontWeight: 800 }}>flexibility</span>.</div>
      </Slide>

      {/* ACT 2 */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Part II</div>
          <Heading fontSize="50px" color={colors.primary}>Batteries Change Everything</Heading>
          <Text fontSize="20px" color={colors.textMuted}>The fastest power plants ever built</Text>
        </div>
      </Slide>

      {/* 9: Fastest Power Plant */}
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

      {/* 10: Hornsdale */}
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

      {/* 11: SA VPP */}
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

      {/* 12: Economics */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>The Economics</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 700, marginTop: 8 }}>
          {[
            { n: '90%', l: 'FCAS cost reduction in SA', c: colors.success, s: '53M to 5M/quarter' },
            { n: '40-60%', l: 'Cheaper than gas peakers', c: colors.primary, s: 'RMI 2023' },
            { n: '~70%', l: 'Battery share of German FCR', c: colors.accent, s: 'Up from ~0 in 2018' },
            { n: '2-3 yrs', l: 'Hornsdale payback', c: colors.secondary, s: 'Grid service revenue' },
          ].map(x => (
            <div key={x.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 10, padding: '14px' }}>
              <div style={{ fontSize: '28px', fontWeight: 800, color: x.c, fontFamily: '"JetBrains Mono"' }}>{x.n}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"', marginTop: 4 }}>{x.l}</div>
              <div style={{ fontSize: '11px', color: colors.textDim, fontFamily: '"Inter"', marginTop: 2 }}>{x.s}</div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 13: One Battery Not Enough */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>But One Battery Is Not Enough</Heading>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 22, margin: '16px 0' }}>
          <div style={{ background: colors.surface, borderRadius: 12, padding: '22px', border: `1px solid ${colors.surfaceLight}`, textAlign: 'center' }}>
            <div style={{ fontSize: '38px', fontWeight: 800, color: colors.success, fontFamily: '"JetBrains Mono"' }}>1</div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>battery = 10 kWh</div>
          </div>
          <div style={{ fontSize: '24px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>{'\u00d7'}</div>
          <div style={{ background: colors.surface, borderRadius: 12, padding: '22px', border: `1px solid ${colors.primary}30`, textAlign: 'center' }}>
            <div style={{ fontSize: '38px', fontWeight: 800, color: colors.primary, fontFamily: '"JetBrains Mono"' }}>100K</div>
            <div style={{ fontSize: '12px', color: colors.textMuted }}>= 1 GWh</div>
          </div>
          <div style={{ fontSize: '24px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>=</div>
          <div style={{ background: `${colors.accent}10`, borderRadius: 12, padding: '22px', border: `1px solid ${colors.accent}30` }}>
            <div style={{ fontSize: '28px', fontWeight: 800, color: colors.accent, fontFamily: '"JetBrains Mono"' }}>Power Plant</div>
          </div>
        </div>
        <Text fontSize="17px" color={colors.textMuted}>Coordinating 100K batteries in real-time? <span style={{ color: colors.primary, fontWeight: 600 }}>That's a distributed systems problem.</span></Text>
      </Slide>

      {/* ACT 3 */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 12 }}>Part III</div>
          <Heading fontSize="50px" color={colors.primary}>The Virtual Power Plant</Heading>
          <Text fontSize="20px" color={colors.textMuted}>Software that turns distributed energy into grid infrastructure</Text>
        </div>
      </Slide>

      {/* 14: What is a VPP */}
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

      {/* 15: KubeCon Analogy */}
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
        <Text fontSize="13px" color={colors.textMuted} fontFamily='"JetBrains Mono"' style={{ textAlign: 'center', marginTop: 12 }}>Frequency = SLO &bull; Cascade = failure propagation &bull; Batteries = autoscaling</Text>
      </Slide>

      {/* 16: Architecture */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="38px" color={colors.primary}>Architecture</Heading>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 4 }}>
          {[
            { t: 'Edge', c: colors.success, i: ['Home Agent', 'Freq detection', 'Autonomous', 'OTA updates'] },
            { t: 'Connect', c: colors.primary, i: ['MQTT / LTE', 'Streaming', 'Bidirectional', 'Offline-first'] },
            { t: 'Control', c: colors.secondary, i: ['Kubernetes', 'Dapr mesh', 'Event-driven', 'Sub-sec loops'] },
            { t: 'Market', c: colors.accent, i: ['Time-series', 'Grid APIs', 'Bidding engine', 'Analytics'] },
          ].map(l => (
            <div key={l.t} style={{ background: colors.surface, borderRadius: 10, border: `1px solid ${l.c}25`, padding: '14px', flex: 1, minWidth: 145 }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: l.c, fontFamily: '"JetBrains Mono"', textTransform: 'uppercase', marginBottom: 8, paddingBottom: 6, borderBottom: `1px solid ${l.c}20` }}>{l.t}</div>
              {l.i.map(x => (
                <div key={x} style={{ fontSize: '11px', color: colors.textMuted, fontFamily: '"Inter"', padding: '3px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 3, height: 3, borderRadius: 2, background: l.c }} />{x}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Slide>

      {/* 17: Why Cloud-Native */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>Why Cloud-Native?</Heading>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxWidth: 700, marginTop: 4 }}>
          {[
            { t: 'Real-time ingestion', d: '100K+ devices streaming', c: colors.primary },
            { t: 'Event-driven control', d: 'Millisecond frequency response', c: colors.success },
            { t: 'Rolling updates', d: 'Zero-downtime fleet updates', c: colors.secondary },
            { t: 'Multi-region resilience', d: 'VPP can\'t go down', c: colors.danger },
            { t: 'Observability', d: '2003: monitoring blindness', c: colors.accent },
            { t: 'Elastic scaling', d: '100K to 1M devices', c: colors.primary },
          ].map(x => (
            <div key={x.t} style={{ display: 'flex', gap: 10, padding: '6px 0' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: x.c, marginTop: 5, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>{x.t}</div>
                <div style={{ fontSize: '12px', color: colors.textMuted, fontFamily: '"Inter"' }}>{x.d}</div>
              </div>
            </div>
          ))}
        </div>
      </Slide>

      {/* 18: Demo No VPP */}
      <Slide backgroundColor={bg}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '13px', fontWeight: 600, fontFamily: '"JetBrains Mono"', background: `${colors.danger}18`, color: colors.danger, border: `1px solid ${colors.danger}30`, marginBottom: 4 }}>LIVE SIMULATION</div>
        <Heading fontSize="32px" color={colors.danger}>Cascading Failure — No VPP</Heading>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CascadeSimulation width={680} height={440} withVPP={false} />
        </div>
      </Slide>

      {/* 19: Demo With VPP */}
      <Slide backgroundColor={bg}>
        <div style={{ display: 'inline-block', padding: '4px 12px', borderRadius: 20, fontSize: '13px', fontWeight: 600, fontFamily: '"JetBrains Mono"', background: `${colors.success}18`, color: colors.success, border: `1px solid ${colors.success}30`, marginBottom: 4 }}>LIVE SIMULATION</div>
        <Heading fontSize="32px" color={colors.success}>Same Failure — With VPP</Heading>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <CascadeSimulation width={680} height={440} withVPP={true} />
        </div>
      </Slide>

      {/* 20: Numbers */}
      <Slide backgroundColor={bg}>
        <Heading fontSize="42px" color={colors.primary}>The Numbers at Scale</Heading>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', margin: '12px 0' }}>
          {[
            { n: '$5.9B', l: 'VPP Market 2030', c: colors.primary },
            { n: '80-160 GW', l: 'US DOE Target', c: colors.success },
            { n: '1M+', l: 'Batteries in DE', c: colors.accent },
          ].map(s => (
            <div key={s.l} style={{ background: colors.surface, border: `1px solid ${colors.surfaceLight}`, borderRadius: 10, padding: '18px 16px', textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: '30px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: s.c }}>{s.n}</div>
              <div style={{ fontSize: '11px', color: colors.textMuted, marginTop: 4, fontFamily: '"Inter"', textTransform: 'uppercase' }}>{s.l}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', padding: '16px 22px', background: colors.surface, borderRadius: 10, border: `1px solid ${colors.primary}20` }}>
          <div style={{ fontSize: '19px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>
            1M batteries = <span style={{ color: colors.primary, fontWeight: 800 }}>10+ GW</span> flexible capacity
            <br /><span style={{ fontSize: '15px', color: colors.textMuted }}>10 gas plants. Running on Kubernetes.</span>
          </div>
        </div>
      </Slide>

      {/* 21: Back to Berlin */}
      <Slide backgroundColor={bg}>
        <div style={{ fontSize: '13px', fontWeight: 600, color: colors.primary, fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 20 }}>Back to Berlin</div>
        <div style={{ fontSize: '24px', fontWeight: 400, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7 }}>
          <div style={{ marginBottom: 16 }}>Remember those households that stayed warm?</div>
          <div style={{ marginBottom: 16, color: colors.textMuted }}>Solar panels, batteries, and a software agent on their roof.</div>
          <div style={{ marginBottom: 16, color: colors.textMuted }}>They were part of a Virtual Power Plant.</div>
          <div style={{ color: colors.primary, fontWeight: 600, textShadow: `0 0 30px ${colors.primary}30` }}>The grid failed them. The software didn't.</div>
        </div>
      </Slide>

      {/* 22: Future Grid */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <Heading fontSize="46px" color={colors.primary}>The Future Grid</Heading>
          <Text fontSize="20px" color={colors.textMuted}>Millions of devices cooperating. Homes, EVs, batteries — forming distributed power plants.</Text>
          <div style={{ marginTop: 20, fontSize: '22px', fontWeight: 600, color: colors.primary, fontFamily: '"Inter"' }}>The grid becomes software.</div>
          <Text fontSize="18px" color={colors.textMuted}>And it runs on the same infrastructure you build every day.</Text>
        </div>
      </Slide>

      {/* 23: Final Takeaway */}
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

      {/* 24: Thank You */}
      <Slide backgroundColor={bg}>
        <div style={{ textAlign: 'center' }}>
          <Heading fontSize="52px" color={colors.primary}>Thank You</Heading>
          <Text fontSize="17px" color={colors.textMuted}><span style={{ color: colors.primary, fontWeight: 600 }}>Enpal / Flexa</span> — Building Europe's Largest Virtual Power Plant</Text>
        </div>
      </Slide>

    </Deck>
  );
}
