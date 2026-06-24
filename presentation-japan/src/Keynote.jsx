import React, { useContext } from 'react';
import { Deck, Slide, Heading, Text, Notes } from 'spectacle';
import { SlideContext } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import { JEPXPriceChart } from './components/JEPXPriceChart.jsx';
import { JapanSelfSufficiencyChart } from './components/JapanSelfSufficiencyChart.jsx';
import { JapanDemandForecast } from './components/JapanDemandForecast.jsx';
import { JapanVPPMap } from './components/JapanVPPMap.jsx';
import { HormuzInfographic } from './components/HormuzInfographic.jsx';
import VPPArchitecture from '../../presentation/src/components/VPPArchitecture.jsx';

function LazyContent({ children }) {
  const ctx = useContext(SlideContext);
  if (!ctx?.isSlideActive) return null;
  return <>{children}</>;
}

const bg = 'var(--color-bg)';
const pad = '36px 56px';

// ── Reusable primitives — use CSS vars so light/hybrid themes work ──
const H = ({ children, color = 'var(--color-heading)', size = '52px' }) => (
  <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.1, marginBottom: 8, color, fontFamily: 'Space Grotesk, sans-serif' }}>
    {children}
  </div>
);
const Sub = ({ children, color = 'var(--color-muted)', size = '22px' }) => (
  <div style={{ fontSize: size, color, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, marginBottom: 12 }}>{children}</div>
);
const Mono = ({ children, color = 'var(--color-primary)', size = '64px' }) => (
  <div style={{ fontSize: size, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', textShadow: `0 0 32px ${color}40` }}>{children}</div>
);
const StatBlock = ({ stat, label, color = 'var(--color-primary)' }) => (
  <div style={{ background: 'var(--color-surface)', border: `1px solid ${color}25`, borderRadius: 10, padding: '20px 28px', textAlign: 'center' }}>
    <Mono color={color} size="48px">{stat}</Mono>
    <Sub size="17px">{label}</Sub>
  </div>
);
const SpeakerTag = ({ name }) => (
  <div style={{ position: 'absolute', top: 12, left: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#64748b80', letterSpacing: '0.15em' }}>{name}</div>
);
const SlideNum = ({ n, total = 22 }) => (
  <div style={{ position: 'absolute', bottom: 12, right: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#64748b' }}>{n} / {total}</div>
);

const SECTIONS = ['', 'Crisis', 'Crisis', 'Grid', 'Grid', 'Grid', 'Crisis', 'Crisis', 'Demand', 'Demand', 'Pivot', 'VPP', 'VPP', 'VPP', 'VPP', 'VPP', 'VPP', 'VPP', 'Demo', 'Demo', 'Demo', 'Close'];

function template({ slideNumber, numberOfSlides }) {
  const section = SECTIONS[slideNumber - 1] || '';
  return (
    <>
      <div style={{ position: 'absolute', top: 12, left: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--color-dim)', opacity: 0.5, letterSpacing: '0.15em' }}>LERENZO</div>
      <div style={{ position: 'absolute', bottom: 12, right: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'var(--color-dim)', display: 'flex', gap: 12 }}>
        {section && <span style={{ color: 'var(--color-heading)', opacity: 0.15 }}>{section}</span>}
        <span>{slideNumber} / 22</span>
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

        {/* 1 — Title */}
        <Slide backgroundColor={bg} padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#3939D8', letterSpacing: '0.2em', marginBottom: 16 }}>
              KUBECON + CLOUDNATIVECON JAPAN 2026  ·  YOKOHAMA
            </div>
            <H size="60px">{t('keynote.title')}</H>
            <Sub size="26px" color="var(--color-text)">Cloud-Native Infrastructure for the Energy Grid</Sub>
            <div style={{ marginTop: 32, fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, color: '#64748b' }}>
              {t('keynote.presenter')}
            </div>
          </div>
          <Notes>Welcome. Thank you for being here. Before we talk about what a VPP is, we need to talk about what happened to your electricity bill in April.</Notes>
        </Slide>

        {/* 2 — Hormuz hook — FORCED DARK regardless of theme */}
        <Slide backgroundColor="#030508" padding="0">
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '32px 56px 24px' }}>
            {/* Eyebrow */}
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#FFA35F', letterSpacing: '0.22em', marginBottom: 12, flexShrink: 0 }}>
              {t('keynote.hormuz.eyebrow')}  ·  {t('keynote.hormuz.label').toUpperCase()}
            </div>
            {/* Hero stat row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, flexShrink: 0, marginBottom: 4 }}>
              <div style={{ fontSize: '96px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#f1f5f9', lineHeight: 1, textShadow: '0 0 60px #f1f5f915' }}>
                {t('keynote.hormuz.stat')}
              </div>
            </div>
            <div style={{ fontSize: 22, fontFamily: 'Space Grotesk, sans-serif', color: '#64748b', marginBottom: 20, flexShrink: 0 }}>
              {t('keynote.hormuz.unit')}
            </div>
            {/* Route infographic — fills remaining space */}
            <div style={{ flex: 1, minHeight: 0 }}>
              <LazyContent>
                <HormuzInfographic height={370} />
              </LazyContent>
            </div>
          </div>
          <Notes>The Strait of Hormuz closed for 6 weeks. Japan imports 97% of its LNG through it. The prices doubled almost overnight. Every person in this room saw it on their April electricity bill. This is not a hypothetical. This is NOW.</Notes>
        </Slide>

        {/* 3 — Japan self-sufficiency: G7 comparison */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>{t('keynote.fragility.title')}</H>
          <Sub color="#64748b">How exposed is Japan, really?</Sub>
          <div style={{ marginTop: 12, height: 500 }}>
            <LazyContent><JapanSelfSufficiencyChart height={500} /></LazyContent>
          </div>
          <Notes>15.3% self-sufficiency. Every other G7 nation is above 25%. Germany is at 35%. Canada is at 179%. Japan is structurally exposed in a way no peer nation is.</Notes>
        </Slide>

        {/* 4 — Fragility stats */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>{t('keynote.fragility.title')}</H>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 24 }}>
            <StatBlock stat={t('keynote.fragility.selfsufficiency.stat')} label={t('keynote.fragility.selfsufficiency.label')} color="#ef4444" />
            <StatBlock stat={t('keynote.fragility.fossil.stat')} label={t('keynote.fragility.fossil.label')} color="#FFA35F" />
          </div>
          <div style={{ marginTop: 24, background: 'var(--color-surface)', border: '1px solid #3939D825', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>{t('keynote.fragility.grid.title')}</div>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 18, color: '#94a3b8', lineHeight: 1.6 }}>{t('keynote.fragility.grid.body')}</div>
          </div>
          <Notes>Ten regional utilities operating mostly in isolation. East runs at 50 Hz, west at 60 Hz. Only 1.2 gigawatts of conversion capacity between them. Compare to Europe's interconnected grid with hundreds of GW of cross-border capacity.</Notes>
        </Slide>

        {/* 5 — JEPX 2021 chart */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#ef4444">{t('keynote.jepx.title')}</H>
          <Sub>{t('keynote.jepx.subtitle')}</Sub>
          <div style={{ marginTop: 12, height: 460 }}>
            <LazyContent><JEPXPriceChart height={460} /></LazyContent>
          </div>
          <Notes>January 2021. No earthquake. No typhoon. Just a cold snap, low wind, and LNG tanker delays. Spot electricity prices went from 10 yen per kilowatt-hour to 251 yen. 25 times the normal price. For 40 days.</Notes>
        </Slide>

        {/* 6 — JEPX framing + 2022 warning */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#ef4444">{t('keynote.jepx.stat')}</H>
          <Sub size="20px" color="var(--color-text)">{t('keynote.jepx.body')}</Sub>
          <div style={{ marginTop: 20, display: 'flex', gap: 20 }}>
            <StatBlock stat="40" label={t('keynote.jepx.duration')} color="#FFA35F" />
            <StatBlock stat="0" label="Natural disasters" color="#94a3b8" />
          </div>
          <Notes>No external trigger. Pure structural fragility. The market was a black box. Utilities had no coordinated response. This is Japan's Texas moment — except nobody died, and nothing learned was acted on.</Notes>
        </Slide>

        {/* 7 — March 2022 warning */}
        <Slide backgroundColor={bg} padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 24 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#FFA35F', letterSpacing: '0.15em' }}>
              MARCH 2022  ·  FIRST-EVER JAPANESE POWER SUPPLY EMERGENCY WARNING
            </div>
            <H color="#ef4444" size="56px">{t('keynote.warning2022.stat')}</H>
            <Sub size="24px" color="var(--color-text)">{t('keynote.warning2022.label')}</Sub>
            <Sub size="18px">The grid operator called on citizens to turn off their lights. In March. In a G7 nation.</Sub>
          </div>
          <Notes>March 2022. Not a blackout — but a government-issued emergency warning asking people to conserve. TEPCO's reserve margin dropped to 2.5%. The safe threshold is 3%. This had never happened before in Japan's post-war history.</Notes>
        </Slide>

        {/* 8 — Demand: data centers */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>{t('keynote.demand.title')}</H>
          <Sub>Now add the AI buildout on top of a fragile grid.</Sub>
          <div style={{ marginTop: 12, height: 440 }}>
            <LazyContent><JapanDemandForecast height={440} /></LazyContent>
          </div>
          <Notes>Data center demand is going from 19 terawatt-hours to 57 to 66 terawatt-hours by 2034. OCCTO — Japan's grid operator — forecasts a 14-times increase when you include semiconductor fabs. 40+ data center projects were delayed in 2024 because the grid couldn't support them.</Notes>
        </Slide>

        {/* 9 — OCCTO callout */}
        <Slide backgroundColor={bg} padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 24 }}>
            <StatBlock stat={t('keynote.demand.stat')} label={t('keynote.demand.label')} color="#3939D8" />
            <div style={{ background: 'var(--color-surface)', border: '1px solid #FFC21725', borderRadius: 10, padding: '20px 24px' }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#FFC217', marginBottom: 8, letterSpacing: '0.1em' }}>OCCTO FORECAST</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 20, color: '#94a3b8', lineHeight: 1.6 }}>{t('keynote.demand.footnote')}</div>
            </div>
          </div>
          <Notes>That's the supply side getting worse and the demand side accelerating. The grid is being squeezed from both ends simultaneously.</Notes>
        </Slide>

        {/* 10 — Pivot */}
        <Slide backgroundColor="#030508" padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: 24 }}>
            <div style={{ fontSize: '52px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9', lineHeight: 1.2, maxWidth: 700 }}>
              {t('keynote.pivot.title')}
            </div>
            <div style={{ fontSize: 32, fontFamily: 'Space Grotesk, sans-serif', color: '#3939D8', fontWeight: 600 }}>
              {t('keynote.pivot.subtitle')}
            </div>
          </div>
          <Notes>Pause here. Let this land. Every problem we just described — distributed supply, unpredictable demand, coordination at scale, fault tolerance — we solve these problems every day in software. The grid is just another distributed system.</Notes>
        </Slide>

        {/* 11 — What is a VPP */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>A Virtual Power Plant</H>
          <Sub size="20px" color="var(--color-text)">Thousands of small devices — home batteries, EVs, heat pumps — coordinated by software to behave like a single dispatchable power plant.</Sub>
          <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <StatBlock stat="100K" label="Homes = 1 power plant" color="#22d3ee" />
            <StatBlock stat="<1s" label="Response time" color="#10b981" />
            <StatBlock stat="0" label="Humans in the loop" color="#FFC217" />
          </div>
          <Notes>One virtual power plant. Zero physical construction. Zero emissions. The building blocks already exist in people's homes. We just need the software to coordinate them.</Notes>
        </Slide>

        {/* 12 — Architecture intro */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>{t('keynote.arch.title')}</H>
          <Sub>{t('keynote.arch.subtitle')}</Sub>
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {['Dapr Actors', 'CQRS', 'Kafka / EventHub', 'MQTT / EMQX', 'ArgoCD', 'Apache Spark', 'OpenTelemetry'].map(tech => (
              <div key={tech} style={{ background: 'var(--color-surface)', border: '1px solid #3939D825', borderRadius: 6, padding: '6px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: 15, color: '#22d3ee' }}>{tech}</div>
            ))}
          </div>
        </Slide>

        {/* 13 — VPPArchitecture diagram */}
        <Slide backgroundColor={bg} padding="24px 40px">
          <H size="36px">Energy Market → Gateway → Controller → Cloud → Homes</H>
          <div style={{ marginTop: 8, height: 460 }}>
            <LazyContent><VPPArchitecture /></LazyContent>
          </div>
          <Notes>This is the full stack. Energy market signals come in at the top. The VPP controller — running on Kubernetes — distributes dispatch commands to 100,000 homes in under a second via MQTT.</Notes>
        </Slide>

        {/* 14 — Dapr Actors */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>Dapr Actors for Device State</H>
          <Sub size="20px">One actor per home battery. Virtual. Stateful. Always-on. The runtime handles distribution, failover, and concurrency — you write business logic.</Sub>
          <div style={{ marginTop: 24, background: 'var(--color-surface)', borderRadius: 10, padding: '20px 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: '#22d3ee', lineHeight: 2 }}>
            <div style={{ color: '#64748b' }}>// One actor per device — scales to 100,000+</div>
            <div>actor.<span style={{ color: '#10b981' }}>getState</span>(deviceId)</div>
            <div>actor.<span style={{ color: '#FFC217' }}>invoke</span>(deviceId, <span style={{ color: '#FFA35F' }}>'dispatch'</span>, {'{'} mw: 5 {'}'})</div>
          </div>
          <Notes>Dapr Virtual Actors give you the abstraction of a single always-on entity per device. The Dapr runtime handles placement, failover, and message routing. You write the business logic once, it scales to any fleet size.</Notes>
        </Slide>

        {/* 15 — MQTT + EMQX */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>MQTT at Scale — EMQX</H>
          <Sub size="20px" color="var(--color-text)">Dispatch commands must reach 100,000 home inverters in under 1 second. MQTT over TCP. EMQX handles the fan-out.</Sub>
          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <StatBlock stat="<500ms" label="P99 dispatch latency" color="#22d3ee" />
            <StatBlock stat="100K" label="Concurrent MQTT connections" color="#10b981" />
          </div>
          <Notes>MQTT is the right protocol for IoT at this scale. Lightweight, persistent connections, QoS guarantees. EMQX is a Kubernetes-native MQTT broker that handles the fan-out pattern cleanly.</Notes>
        </Slide>

        {/* 16 — Kafka + event sourcing */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>Event Sourcing with Kafka</H>
          <Sub size="20px" color="var(--color-text)">Every dispatch command, every meter reading, every state change is an immutable event. Kafka is the backbone. CQRS separates reads from writes.</Sub>
          <div style={{ marginTop: 20, background: 'var(--color-surface)', border: '1px solid #3939D825', borderRadius: 10, padding: '18px 24px' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#64748b', marginBottom: 6 }}>topics</div>
            {['vpp.device.telemetry', 'vpp.dispatch.commands', 'vpp.grid.frequency', 'vpp.market.signals'].map(t => (
              <div key={t} style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, color: '#22d3ee', lineHeight: 2 }}>{t}</div>
            ))}
          </div>
          <Notes>Full event history. Audit trail. Time-travel debugging. If something goes wrong at 2am during a grid event, you replay the event log and understand exactly what happened and why.</Notes>
        </Slide>

        {/* 17 — Japan VPP demo */}
        <Slide backgroundColor={bg} padding="0">
          <div style={{ height: '100%', position: 'relative' }}>
            <LazyContent><JapanVPPMap height={580} /></LazyContent>
          </div>
          <Notes>This is a simulated VPP dispatch in Kansai and Kyushu. Watch the battery nodes activate as the grid signal goes out. Green = dispatching. The frequency readout shows the grid stabilizing in real time.</Notes>
        </Slide>

        {/* 18 — Shizen Connect real example */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>VPP in Japan Today</H>
          <Sub size="20px">This is not hypothetical. It is operating in Japan right now.</Sub>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--color-surface)', border: '1px solid #22d3ee25', borderRadius: 10, padding: '18px 24px' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#22d3ee', marginBottom: 6 }}>Shizen Connect</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#94a3b8' }}>EV VPP aggregation across Kansai. Vehicle-to-grid charging coordinated by software to flatten the duck curve.</div>
            </div>
            <div style={{ background: 'var(--color-surface)', border: '1px solid #10b98125', borderRadius: 10, padding: '18px 24px' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>HEMS Programs</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#94a3b8' }}>Home Energy Management Systems in Kyushu absorbing excess solar. 1.74 TWh of curtailment avoided in H1 2025.</div>
            </div>
          </div>
          <Notes>These are real companies, real fleets, real MW. The technology is proven. The regulatory framework — ERAB — exists. What's needed is software that can coordinate at 100,000-home scale.</Notes>
        </Slide>

        {/* 19 — ERAB framework */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>The ERAB Framework</H>
          <Sub size="20px" color="var(--color-text)">Energy Resource Aggregation Business — Japan's regulatory license for VPP aggregators since 2020.</Sub>
          <div style={{ marginTop: 20, background: 'var(--color-surface)', border: '1px solid #3939D825', borderRadius: 10, padding: '20px 24px' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 19, color: '#94a3b8', lineHeight: 1.7 }}>
              OCCTO requires all VPP aggregators to register as ERABs. The market structure exists. The dispatch signals exist. The missing layer is <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>software that can coordinate at scale</span>.
            </div>
          </div>
          <Notes>Japan's grid regulator designed ERAB to enable exactly this. The policy is ahead of the technology. We have the regulatory framework but not the cloud-native platform to use it at the scale needed.</Notes>
        </Slide>

        {/* 20 — ArgoCD + GitOps */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>GitOps for Grid Software</H>
          <Sub size="20px" color="var(--color-text)">100,000 home devices run firmware. Firmware changes need to be: atomic, reversible, auditable, and deployed without downtime during grid events.</Sub>
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <StatBlock stat="ArgoCD" label="Declarative rollout to fleet" color="#3939D8" />
            <StatBlock stat="GitOps" label="Every config change in git" color="#FFC217" />
          </div>
          <Notes>When you're managing grid-critical software on 100,000 devices, GitOps isn't just nice-to-have. It's the only way to have the auditability that regulators require and the rollback capability the grid demands.</Notes>
        </Slide>

        {/* 21 — Observability */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>Observability at Grid Scale</H>
          <Sub size="20px" color="var(--color-text)">OpenTelemetry across the stack. Apache Spark for batch analytics. Every dispatch decision is traceable end-to-end.</Sub>
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <StatBlock stat="OTel" label="Traces + metrics + logs" color="#22d3ee" />
            <StatBlock stat="Spark" label="Terawatt-hour analytics" color="#FFC217" />
            <StatBlock stat="100%" label="Dispatch auditability" color="#10b981" />
          </div>
          <Notes>When a regulator asks "what happened at 14:32 on March 15th" — you can answer. Every dispatch, every frequency deviation, every device response is in the trace. This is the observability layer that makes the ERAB license defensible.</Notes>
        </Slide>

        {/* 22 — Closing */}
        <Slide backgroundColor="#030508" padding="0">
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: 16 }}>
            <div style={{ fontSize: '96px', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace', color: '#f1f5f9', lineHeight: 1, textShadow: '0 0 60px #f1f5f915' }}>
              {t('keynote.closing.stat')}
            </div>
            <div style={{ fontSize: 28, fontFamily: 'Space Grotesk, sans-serif', color: '#94a3b8' }}>
              {t('keynote.closing.label')}
            </div>
            <div style={{ fontSize: 32, fontFamily: 'Space Grotesk, sans-serif', color: '#3939D8', fontWeight: 700, marginTop: 8 }}>
              {t('keynote.closing.equals')}
            </div>
            <div style={{ marginTop: 32, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#64748b', letterSpacing: '0.1em' }}>
              github.com/enpal — whatisavpp.com
            </div>
          </div>
          <Notes>100,000 homes. Coordinated by software. No new power plants. No new transmission lines. No emissions. Just code, Kubernetes, and the grid that's already there. Thank you.</Notes>
        </Slide>

      </Deck>
    </>
  );
}
