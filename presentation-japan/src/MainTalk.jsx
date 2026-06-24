import React, { useContext } from 'react';
import { Deck, Slide, Notes } from 'spectacle';
import { SlideContext } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import { JEPXPriceChart } from './components/JEPXPriceChart.jsx';
import { JapanGridMap } from './components/JapanGridMap.jsx';
import { JapanSelfSufficiencyChart } from './components/JapanSelfSufficiencyChart.jsx';
import { KyushuCurtailmentChart } from './components/KyushuCurtailmentChart.jsx';
import { JapanDemandForecast } from './components/JapanDemandForecast.jsx';
import { JapanVPPMap } from './components/JapanVPPMap.jsx';
import VPPArchitecture from '../../presentation/src/components/VPPArchitecture.jsx';
import ChoreographyLoop from '../../presentation/src/components/ChoreographyLoop.jsx';
import ResponseTimeline from '../../presentation/src/components/ResponseTimeline.jsx';
import StreamingAggregation from '../../presentation/src/components/StreamingAggregation.jsx';
import AggregationPyramid from '../../presentation/src/components/AggregationPyramid.jsx';
import DuckCurveChart from '../../presentation/src/components/DuckCurveChart.jsx';
import DuckCurveVPP from '../../presentation/src/components/DuckCurveVPP.jsx';
import GridFrequencyExplainer from '../../presentation/src/components/GridFrequencyExplainer.jsx';
import FrequencyDemo from '../../presentation/src/components/FrequencyDemo.jsx';
import FrequencyWalkthrough from '../../presentation/src/components/FrequencyWalkthrough.jsx';

function LazyContent({ children }) {
  const ctx = useContext(SlideContext);
  if (!ctx?.isSlideActive) return null;
  return <>{children}</>;
}

const bg = '#060a1a';
const pad = '36px 56px';

// ── Primitives ───────────────────────────────────────────────
const H = ({ children, color = '#3939D8', size = '44px' }) => (
  <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.1, marginBottom: 8, color, fontFamily: 'Space Grotesk, sans-serif', textShadow: `0 0 40px ${color}28` }}>
    {children}
  </div>
);
const Sub = ({ children, color = '#94a3b8', size = '20px' }) => (
  <div style={{ fontSize: size, color, fontFamily: 'Inter, sans-serif', lineHeight: 1.6, marginBottom: 10 }}>{children}</div>
);
const Mono = ({ children, color = '#22d3ee', size = '56px' }) => (
  <div style={{ fontSize: size, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace', textShadow: `0 0 28px ${color}35` }}>{children}</div>
);
const StatBlock = ({ stat, label, color = '#22d3ee' }) => (
  <div style={{ background: '#0d1424', border: `1px solid ${color}22`, borderRadius: 10, padding: '18px 24px', textAlign: 'center', flex: 1 }}>
    <Mono color={color} size="42px">{stat}</Mono>
    <Sub size="15px">{label}</Sub>
  </div>
);
const ActCard = ({ label, title, color = '#3939D8' }) => (
  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: 20 }}>
    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color, letterSpacing: '0.25em' }}>{label}</div>
    <div style={{ fontSize: '56px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', color: '#f1f5f9', lineHeight: 1.1, maxWidth: 640 }}>{title}</div>
  </div>
);
const Bullet = ({ children, color = '#22d3ee' }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
    <div style={{ color, marginTop: 3, flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>▸</div>
    <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 19, color: '#94a3b8', lineHeight: 1.5 }}>{children}</div>
  </div>
);
const TechBadge = ({ children }) => (
  <div style={{ background: '#0d1424', border: '1px solid #3939D825', borderRadius: 6, padding: '5px 12px', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#22d3ee', display: 'inline-block', margin: '4px' }}>{children}</div>
);

// ── Speaker assignments ─────────────────────────────────────
const SPEAKERS = {
  1:'SHARED', 2:'SHARED', 3:'LERENZO',
  4:'LERENZO', 5:'LERENZO', 6:'LERENZO', 7:'LERENZO', 8:'LERENZO', 9:'LERENZO',
  10:'LERENZO', 11:'PRIYANKA',
  12:'PRIYANKA', 13:'PRIYANKA', 14:'PRIYANKA', 15:'PRIYANKA', 16:'PRIYANKA', 17:'PRIYANKA',
  18:'LERENZO',
  19:'LERENZO', 20:'LERENZO', 21:'LERENZO', 22:'PRIYANKA', 23:'PRIYANKA', 24:'PRIYANKA',
  25:'LERENZO', 26:'LERENZO', 27:'LERENZO', 28:'LERENZO', 29:'LERENZO',
  30:'LERENZO', 31:'LERENZO', 32:'PRIYANKA', 33:'SHARED',
};

const SECTIONS = [
  '','','',
  'The Grid','The Grid','The Grid','The Grid','The Grid','The Grid','The Grid','The Grid',
  'Renewables','Renewables','Renewables','Renewables','Renewables','Renewables',
  'VPP',
  'VPP','VPP','VPP','VPP','VPP','VPP','VPP','VPP','VPP','VPP','VPP','VPP','VPP',
  'Close','Close','Close',
];

function template({ slideNumber }) {
  const speaker = SPEAKERS[slideNumber];
  const section = SECTIONS[slideNumber - 1] || '';
  return (
    <>
      {speaker && (
        <div style={{ position: 'absolute', top: 12, left: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#64748b80', letterSpacing: '0.15em' }}>
          {speaker}
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 12, right: 20, fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#64748b', display: 'flex', gap: 12 }}>
        {section && <span style={{ color: '#3939D820' }}>{section}</span>}
        <span>{slideNumber} / 33</span>
      </div>
    </>
  );
}

export default function MainTalk() {
  const { theme, cycleTheme, spectacleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();

  return (
    <>
      <PresentationChrome theme={theme} cycleTheme={cycleTheme} locale={locale} setLocale={setLocale} />
      <Deck theme={spectacleTheme} template={template}>

        {/* 1 — Title */}
        <Slide backgroundColor={bg} padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 12 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#3939D8', letterSpacing: '0.2em', marginBottom: 12 }}>
              KUBECON + CLOUDNATIVECON JAPAN 2026  ·  YOKOHAMA
            </div>
            <H size="54px">{t('main.title')}</H>
            <Sub size="22px" color="#f1f5f9">{t('main.subtitle')}</Sub>
            <div style={{ marginTop: 24, fontFamily: 'Space Grotesk, sans-serif', fontSize: 19, color: '#64748b' }}>
              {t('main.presenters')}
            </div>
          </div>
          <Notes>Welcome. We're going to tell you a story about why the electrical grid is already a distributed system — and why the cloud-native community is uniquely positioned to help fix it.</Notes>
        </Slide>

        {/* 2 — Speakers */}
        <Slide backgroundColor={bg} padding={pad}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 60, alignItems: 'center', height: '100%' }}>
            {[
              { name: 'LeRenzo Malcolm', role: 'Staff Engineer, VPP' },
              { name: 'Priyanka', role: 'Engineer, VPP' },
            ].map(({ name, role }) => (
              <div key={name} style={{ textAlign: 'center' }}>
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#0d1424', border: '2px solid #3939D830', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                  {name[0]}
                </div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>{name}</div>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 16, color: '#64748b', marginTop: 4 }}>{role}</div>
              </div>
            ))}
          </div>
        </Slide>

        {/* ═══════ ACT I: THE GRID ═══════ */}

        {/* 3 — Act I card */}
        <Slide backgroundColor="#030508" padding={pad}>
          <ActCard label={t('label.act1')} title={t('main.grid.title')} color="#3939D8" />
          <Notes>Act 1. We're going to show you Japan's grid — why it's structured the way it is, and why that structure makes it uniquely fragile.</Notes>
        </Slide>

        {/* 4 — Japan grid map overview */}
        <Slide backgroundColor={bg} padding="0">
          <div style={{ height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, fontFamily: 'Space Grotesk, sans-serif' }}>
              <H size="36px">{t('main.grid.title')}</H>
              <Sub size="18px">{t('main.grid.subtitle')}</Sub>
            </div>
            <LazyContent><JapanGridMap height={580} /></LazyContent>
          </div>
          <Notes>Ten regional utilities. No shared dispatch. The east runs at 50 hertz, the west at 60. That orange line through the middle — that's a 60-year-old engineering boundary that still constrains how Japan responds to supply shocks today.</Notes>
        </Slide>

        {/* 5 — 50/60 Hz seam explainer */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#FFA35F">{t('main.grid.hz.title')}</H>
          <Sub size="20px" color="#f1f5f9">{t('main.grid.hz.body')}</Sub>
          <div style={{ marginTop: 20, display: 'flex', gap: 16 }}>
            <StatBlock stat="50 Hz" label="Eastern Japan (TEPCO, Tohoku)" color="#22d3ee" />
            <StatBlock stat="60 Hz" label="Western Japan (Kansai, Kyushu)" color="#FFC217" />
            <StatBlock stat="1.2 GW" label={t('main.grid.hvdc.label')} color="#FFA35F" />
          </div>
          <Notes>The 50/60 Hz split is a historical accident from when Japan imported generators from different countries in the Meiji era. It's now a permanent structural constraint. Only 1.2 GW of conversion capacity connects east and west — compared to the hundreds of GW that flow freely across Europe's interconnected grid.</Notes>
        </Slide>

        {/* 6 — Island grid isolation */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>An Island Grid</H>
          <Sub size="20px" color="#f1f5f9">Japan cannot import electricity from neighbors. There are no neighbors.</Sub>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bullet color="#ef4444">No HVDC links to South Korea, China, or Russia at significant capacity</Bullet>
            <Bullet color="#FFA35F">When supply drops, there is nowhere to borrow from</Bullet>
            <Bullet color="#94a3b8">Europe can move 50+ GW across borders in a crisis — Japan cannot move 1.2 GW across its own frequency seam</Bullet>
          </div>
          <Notes>Compare Germany in a crisis: it can import from France, Poland, Netherlands, Denmark. Japan has no equivalent. Every megawatt-hour must come from within Japan's own generation fleet.</Notes>
        </Slide>

        {/* 7 — Self-sufficiency chart */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#ef4444">{t('main.grid.selfsufficiency.title')}</H>
          <Sub>Japan's energy self-sufficiency vs G7 peers</Sub>
          <div style={{ marginTop: 12, height: 340 }}>
            <LazyContent><JapanSelfSufficiencyChart height={340} /></LazyContent>
          </div>
          <Notes>15.3%. Every other G7 nation is above 25%. Canada is essentially self-sufficient. The UK is at 75%. Japan is 15.3% — meaning 84.7 cents of every energy dollar leaves Japan to pay for imports.</Notes>
        </Slide>

        {/* 8 — Context on self-sufficiency */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#ef4444">15.3%</H>
          <Sub size="22px" color="#f1f5f9">Energy self-sufficiency — lowest in the G7</Sub>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Bullet color="#ef4444">97% of LNG imported — mostly through the Strait of Hormuz</Bullet>
            <Bullet color="#FFA35F">70% of primary energy from fossil fuels</Bullet>
            <Bullet color="#94a3b8">Nuclear at 10% post-Fukushima, slowly recovering</Bullet>
          </div>
          <Notes>This is not a new problem. Japan has known about this fragility for decades. But the Hormuz closure in March made it visceral in a way policy papers never could.</Notes>
        </Slide>

        {/* 9 — JEPX 2021 framing */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#ef4444">{t('main.jepx.title')}</H>
          <Sub>{t('main.jepx.subtitle')}</Sub>
          <div style={{ marginTop: 16, height: 320 }}>
            <LazyContent><JEPXPriceChart height={320} /></LazyContent>
          </div>
          <Notes>January 2021. The Japan Electric Power Exchange spot price went from 10 yen to 251 yen per kilowatt-hour. 25 times normal. For 40 consecutive days. No earthquake, no nuclear incident — just cold weather, low wind, and LNG tanker delays.</Notes>
        </Slide>

        {/* 10 — Same fragility */}
        <Slide backgroundColor={bg} padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 20 }}>
            <H size="48px" color="#ef4444">10 → 251 JPY/kWh</H>
            <Sub size="22px" color="#f1f5f9">{t('main.jepx.framing')}</Sub>
            <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
              <StatBlock stat="Texas" label="February 2021 — natural gas freeze" color="#94a3b8" />
              <StatBlock stat="Japan" label="January 2021 — no disaster required" color="#ef4444" />
            </div>
            <Sub size="18px">Texas needed a polar vortex. Japan needed a cold snap and slow tankers.</Sub>
          </div>
          <Notes>Texas and Japan had their crises within weeks of each other. Same root cause: no demand flexibility, no distributed reserves, a spot market with no circuit breakers. Different triggers. Same structural failure.</Notes>
        </Slide>

        {/* 11 — March 2022 */}
        <Slide backgroundColor={bg} padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 20 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#FFA35F', letterSpacing: '0.15em' }}>MARCH 2022</div>
            <H size="52px" color="#ef4444">2.5%</H>
            <Sub size="24px" color="#f1f5f9">TEPCO reserve margin — Japan's first-ever power supply emergency warning</Sub>
            <Sub size="18px">The safe threshold is 3%. Citizens were asked to turn off lights. In a G7 nation. In March.</Sub>
          </div>
          <Notes>The government issued an emergency conservation request. Not a rolling blackout — but a public warning that one was imminent. This was a first in Japan's post-war history.</Notes>
        </Slide>

        {/* ═══════ ACT II: RENEWABLES ═══════ */}

        {/* 12 — Act II card */}
        <Slide backgroundColor="#030508" padding={pad}>
          <ActCard label={t('label.act2')} title="Japan's solar is wasting clean energy — at scale" color="#FFC217" />
          <Notes>Act 2. The irony: Japan has too much solar. Not everywhere, not all the time — but in Kyushu, on sunny afternoons, the grid is generating more electricity than it can use. And instead of using it, Japan is throwing it away.</Notes>
        </Slide>

        {/* 13 — Duck curve: DuckCurveChart */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#FFC217">{t('main.renewables.duck.title')}</H>
          <Sub>{t('main.renewables.duck.body')}</Sub>
          <div style={{ marginTop: 12, height: 340 }}>
            <LazyContent><DuckCurveChart /></LazyContent>
          </div>
          <Notes>The duck curve. Solar floods the grid at noon — prices go negative, thermal plants can't ramp down fast enough. Then at 5pm when people come home and solar drops, demand spikes. The grid has to ramp 10+ GW in 3 hours. This is Kyushu's daily reality.</Notes>
        </Slide>

        {/* 14 — Kyushu curtailment chart */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#FFC217">{t('main.renewables.curtailment.title')}</H>
          <Sub>{t('main.renewables.curtailment.stat')} wasted in Kyushu — H1 2025. Now spreading.</Sub>
          <div style={{ marginTop: 12, height: 320 }}>
            <LazyContent><KyushuCurtailmentChart height={320} /></LazyContent>
          </div>
          <Notes>1.74 terawatt-hours. Thrown away. That's enough to power 400,000 Japanese homes for a year. And the blue line — Tokyo — starts appearing in 2026. The curtailment problem is no longer just Kyushu.</Notes>
        </Slide>

        {/* 15 — Curtailment spreading */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#FFC217">{t('main.renewables.curtailment.tokyo')}</H>
          <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
            <StatBlock stat="1.74 TWh" label={t('main.renewables.curtailment.label')} color="#FFC217" />
            <StatBlock stat="2026" label="Curtailment reaches Tokyo/TEPCO" color="#22d3ee" />
          </div>
          <Sub size="18px" color="#64748b" style={{ marginTop: 16 }}>
            Curtailment is not a Kyushu problem anymore. It is a Japan problem. And it's accelerating.
          </Sub>
          <Notes>When TEPCO — Japan's largest utility, serving 30 million people — starts curtailing solar, the economics of new solar investment collapse. That's the trap: the grid is fragile from lack of supply, but we're wasting renewable supply because the grid can't absorb it.</Notes>
        </Slide>

        {/* 16 — Japanese VPP demos: Shizen Connect */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>VPP in Japan Today</H>
          <Sub size="20px">{t('main.renewables.shizen.body')}</Sub>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: '#0d1424', border: '1px solid #22d3ee25', borderRadius: 10, padding: '16px 22px' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 19, fontWeight: 700, color: '#22d3ee', marginBottom: 6 }}>Shizen Connect — EV VPP</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#94a3b8' }}>Vehicle-to-grid aggregation in Kansai. EV batteries coordinated to absorb afternoon solar excess and discharge during evening peaks.</div>
            </div>
            <div style={{ background: '#0d1424', border: '1px solid #10b98125', borderRadius: 10, padding: '16px 22px' }}>
              <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 19, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>HEMS — Residential Battery Aggregation</div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#94a3b8' }}>Home Energy Management Systems in Kyushu dispatched by aggregators to absorb curtailment and provide FCAS services.</div>
            </div>
          </div>
          <Notes>These are operating today. Real MW. Real revenue from the JEPX market. Real curtailment avoided. The technology stack we're about to describe is not theoretical — it's what makes programs like this scale from pilots to national infrastructure.</Notes>
        </Slide>

        {/* 17 — DuckCurveVPP: the solution */}
        <Slide backgroundColor={bg} padding={pad}>
          <H color="#10b981">VPP Flattens the Duck</H>
          <Sub>Batteries absorb noon excess and discharge at the 5pm ramp. The duck becomes a line.</Sub>
          <div style={{ marginTop: 12, height: 340 }}>
            <LazyContent><DuckCurveVPP /></LazyContent>
          </div>
          <Notes>This is what the duck curve looks like with a VPP in the loop. The noon surplus charges batteries. The evening ramp is covered by discharge. The grid operator sees a flat demand profile. No curtailment. No gas peaker plants needed.</Notes>
        </Slide>

        {/* ═══════ ACT III: VPP ═══════ */}

        {/* 18 — Act III card */}
        <Slide backgroundColor="#030508" padding={pad}>
          <ActCard label={t('label.act3')} title="Software that coordinates a distributed energy fleet" color="#22d3ee" />
          <Notes>Act 3. We've shown you the problem. Now let's show you the solution — and specifically the cloud-native architecture that makes it work at Japan's scale.</Notes>
        </Slide>

        {/* 19 — ERAB regulatory layer */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>{t('main.vpp.erab.title')}</H>
          <Sub size="20px">{t('main.vpp.erab.subtitle')}</Sub>
          <div style={{ marginTop: 16, background: '#0d1424', border: '1px solid #3939D825', borderRadius: 10, padding: '20px 24px' }}>
            <Sub size="19px" color="#f1f5f9">{t('main.vpp.erab.body')}</Sub>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 14 }}>
            <StatBlock stat="2020" label="ERAB framework established" color="#3939D8" />
            <StatBlock stat="OCCTO" label="Grid operator oversight" color="#FFC217" />
          </div>
          <Notes>Japan built the regulatory framework before the technology was ready. ERAB licenses are how aggregators participate in Japan's electricity market. The framework mandates real-time telemetry, dispatch response SLAs, and audit trails — all things that are natural outputs of the cloud-native stack we're about to show.</Notes>
        </Slide>

        {/* 20 — Demand forecast context */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>The Scale Requirement</H>
          <Sub>19 → 57 TWh by 2034. The grid needs demand flexibility at data-center scale.</Sub>
          <div style={{ marginTop: 12, height: 290 }}>
            <LazyContent><JapanDemandForecast height={290} /></LazyContent>
          </div>
          <Notes>This is what VPP has to solve. As data center demand triples, the grid needs to dispatch demand-side resources with the same speed and reliability as generation. That requires cloud-native infrastructure at a scale that traditional energy management software was never designed to handle.</Notes>
        </Slide>

        {/* 21 — VPP Architecture */}
        <Slide backgroundColor={bg} padding="24px 40px">
          <H size="34px">{t('main.vpp.arch.title')}</H>
          <div style={{ marginTop: 8, height: 460 }}>
            <LazyContent><VPPArchitecture /></LazyContent>
          </div>
          <Notes>Top to bottom: energy market signals, trading gateway, VPP controller on Kubernetes, cloud telemetry layer, MQTT dispatch to 100,000 home inverters. Each layer is independently scalable. Each handoff is an event on Kafka. The whole system is GitOps-deployed via ArgoCD.</Notes>
        </Slide>

        {/* 22 — Choreography: ChoreographyLoop */}
        <Slide backgroundColor={bg} padding="24px 40px">
          <H size="36px" color="#10b981">Choreography, Not Orchestration</H>
          <Sub>Each home battery is autonomous. It responds to frequency signals directly — no central dispatch bottleneck.</Sub>
          <div style={{ marginTop: 8, height: 420 }}>
            <LazyContent><ChoreographyLoop /></LazyContent>
          </div>
          <Notes>Traditional SCADA systems centrally orchestrate every device. We use choreography — each device has enough intelligence to respond autonomously to frequency deviations. Central dispatch is for market coordination, not emergency response. Emergency response is sub-second, autonomous, distributed.</Notes>
        </Slide>

        {/* 23 — Response timeline */}
        <Slide backgroundColor={bg} padding="24px 40px">
          <H size="36px">Response Timeline</H>
          <Sub>From grid event to 100,000 home batteries responding — under 1 second.</Sub>
          <div style={{ marginTop: 8, height: 440 }}>
            <LazyContent><ResponseTimeline /></LazyContent>
          </div>
          <Notes>The response timeline matters because FCAS — Frequency Control Ancillary Services — has strict time requirements. 6-second raise. 60-second raise. The VPP must guarantee sub-second autonomous response for the 6-second market. That's what the choreography architecture enables.</Notes>
        </Slide>

        {/* 24 — Streaming aggregation */}
        <Slide backgroundColor={bg} padding="24px 40px">
          <H size="36px" color="#FFC217">Real-Time Aggregation</H>
          <Sub>100,000 telemetry streams. One aggregate view for the market operator.</Sub>
          <div style={{ marginTop: 8, height: 440 }}>
            <LazyContent><StreamingAggregation /></LazyContent>
          </div>
          <Notes>Every device sends a telemetry event every 10 seconds. That's 600,000 events per minute. Kafka ingests them. Flink or Spark Structured Streaming aggregates them to a single portfolio view in under 2 seconds. The ERAB license requires this real-time visibility.</Notes>
        </Slide>

        {/* 25 — Aggregation pyramid */}
        <Slide backgroundColor={bg} padding="24px 40px">
          <H size="36px" color="#a78bfa">The Aggregation Hierarchy</H>
          <Sub>Individual homes → neighborhoods → cities → regional fleet → national VPP.</Sub>
          <div style={{ marginTop: 8, height: 440 }}>
            <LazyContent><AggregationPyramid /></LazyContent>
          </div>
          <Notes>The pyramid is how you scale from pilot to national infrastructure. Each level aggregates the layer below. The grid operator sees one number at the top. The billing system sees individual home meters at the bottom. Dapr actors model every level.</Notes>
        </Slide>

        {/* 26 — Grid frequency explainer */}
        <Slide backgroundColor={bg} padding="0">
          <div style={{ height: '100%' }}>
            <LazyContent><GridFrequencyExplainer width={1200} height={580} step={0} /></LazyContent>
          </div>
          <Notes>This is what a grid frequency deviation looks like. Every device in Japan — every motor, every inverter, every industrial load — is synchronized to this 50 Hz signal. When it deviates, the grid is in trouble. The VPP's job is to keep it in the green band.</Notes>
        </Slide>

        {/* 27 — Frequency demo */}
        <Slide backgroundColor={bg} padding="0">
          <div style={{ height: '100%' }}>
            <LazyContent><FrequencyDemo /></LazyContent>
          </div>
          <Notes>Watch what happens when we inject a contingency. The frequency drops. Without VPP: it keeps dropping until load shedding kicks in. With VPP: batteries start discharging autonomously in under 200 milliseconds. The frequency recovers. No humans involved.</Notes>
        </Slide>

        {/* 28 — Frequency walkthrough */}
        <Slide backgroundColor={bg} padding="0">
          <div style={{ height: '100%' }}>
            <LazyContent><FrequencyWalkthrough /></LazyContent>
          </div>
          <Notes>Step by step. Contingency event. Frequency deviation detected by local firmware. Droop response activates. Inverter starts injecting. All within the 6-second FCAS window. This is the physics. The software just has to not get in the way of the physics.</Notes>
        </Slide>

        {/* 29 — Japan VPP map */}
        <Slide backgroundColor={bg} padding="0">
          <div style={{ height: '100%', position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
              <H size="28px">Kansai + Kyushu VPP Dispatch</H>
            </div>
            <LazyContent><JapanVPPMap height={580} /></LazyContent>
          </div>
          <Notes>This is a simulated dispatch scenario across Kansai and Kyushu. Shizen Connect EV batteries in Osaka, HEMS residential batteries in Fukuoka and Kumamoto. Use arrow keys to step through the cascade. Watch the frequency readout stabilize as the fleet activates.</Notes>
        </Slide>

        {/* 30 — The ERAB dispatch in numbers */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>334 MW Dispatched</H>
          <Sub size="20px" color="#f1f5f9">Across 14,600 homes in Kansai and Kyushu — in under 6 seconds.</Sub>
          <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
            <StatBlock stat="334 MW" label="Total dispatch" color="#10b981" />
            <StatBlock stat="14,600" label="Homes coordinated" color="#22d3ee" />
            <StatBlock stat="0 TWh" label="Curtailment in this window" color="#FFC217" />
          </div>
          <Notes>That's one medium-sized thermal power plant, dispatched by software, in under 6 seconds, from 14,600 residential batteries. No new power plants. No new transmission lines. Just software, Kubernetes, and the devices already in people's homes.</Notes>
        </Slide>

        {/* 31 — What you can build */}
        <Slide backgroundColor={bg} padding={pad}>
          <H>What You Can Build</H>
          <Sub size="20px">The tools in your stack are the tools the grid needs.</Sub>
          <div style={{ marginTop: 20 }}>
            {[
              ['Dapr Virtual Actors', 'One actor per device — scales to any fleet size'],
              ['Kafka + CQRS', 'Immutable event log — every dispatch auditable'],
              ['MQTT / EMQX', '<500ms fan-out to 100,000 home inverters'],
              ['ArgoCD + GitOps', 'Atomic, reversible fleet firmware deployments'],
              ['OpenTelemetry', 'End-to-end trace: market signal → device response'],
              ['Apache Spark', 'Terawatt-hour analytics at fleet scale'],
            ].map(([tech, desc]) => (
              <div key={tech} style={{ display: 'flex', gap: 16, marginBottom: 10, alignItems: 'flex-start' }}>
                <TechBadge>{tech}</TechBadge>
                <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#64748b', paddingTop: 6 }}>{desc}</div>
              </div>
            ))}
          </div>
          <Notes>We're not asking you to learn new tools. We're showing you that the tools you already know — the tools in this conference — are exactly what the energy transition needs.</Notes>
        </Slide>

        {/* 32 — Closing thesis */}
        <Slide backgroundColor="#030508" padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', gap: 20 }}>
            <H size="52px" color="#f1f5f9">{t('main.vpp.closing.title')}</H>
            <Sub size="24px" color="#3939D8">{t('main.vpp.closing.body')}</Sub>
            <div style={{ marginTop: 12, display: 'flex', gap: 16 }}>
              <StatBlock stat="100K" label="homes = 1 power plant" color="#10b981" />
              <StatBlock stat="<1s" label="autonomous response" color="#22d3ee" />
              <StatBlock stat="0" label="new power plants needed" color="#FFC217" />
            </div>
          </div>
          <Notes>The grid is a distributed system. We know how to build distributed systems. The Hormuz crisis, the JEPX spike, the March 2022 warning, the Kyushu curtailment — all of these are distributed systems failures. And distributed systems failures have distributed systems solutions.</Notes>
        </Slide>

        {/* 33 — Thank you / QA */}
        <Slide backgroundColor="#030508" padding={pad}>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', textAlign: 'center', gap: 20 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#3939D8', letterSpacing: '0.2em' }}>ありがとうございます</div>
            <H size="52px" color="#f1f5f9">Thank You</H>
            <Sub size="20px">KubeCon + CloudNativeCon Japan 2026</Sub>
            <div style={{ marginTop: 16, fontFamily: 'Inter, sans-serif', fontSize: 17, color: '#64748b', lineHeight: 1.8 }}>
              LeRenzo Malcolm · Priyanka<br />
              whatisavpp.com
            </div>
          </div>
          <Notes>Questions welcome. We'll be around for the rest of the day.</Notes>
        </Slide>

      </Deck>
    </>
  );
}
