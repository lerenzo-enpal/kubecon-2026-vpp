import React, { useContext } from 'react';
import { Deck, Notes, Slide, SlideContext } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import { MainTalkSourceFooter } from './components/MainTalkSourceFooter.jsx';
import StepBridge from './components/StepBridge.jsx';
import { MAIN_TALK_EVIDENCE as E } from './data/mainTalkEvidence.mjs';
import { JapanGridAtlas } from './components/JapanGridAtlas.jsx';
import { TokyoDuckCurveCaseStudy } from './components/TokyoDuckCurveCaseStudy.jsx';
import { CapabilityMotif } from './components/CapabilityMotif.jsx';
import SolarTimingProblem from './components/SolarTimingProblem.jsx';
import JapanColdSnapCascade from './components/JapanColdSnapCascade.jsx';
import VppCounterfactualOverlay from './components/VppCounterfactualOverlay.jsx';
import VPPArchitecture from '../../presentation/src/components/VPPArchitecture.jsx';
import ChoreographyLoop from '../../presentation/src/components/ChoreographyLoop.jsx';
import ResponseTimeline from '../../presentation/src/components/ResponseTimeline.jsx';
import AggregationPyramid from '../../presentation/src/components/AggregationPyramid.jsx';
import GridFrequencyExplainer from '../../presentation/src/components/GridFrequencyExplainer.jsx';
import FrequencyWalkthrough from '../../presentation/src/components/FrequencyWalkthrough.jsx';

const coreSlides = 14;
const mainAtlasPreset = (step) => ({ areas: true, transmission: step >= 1, plants: false, mix: false });
const page = { padding: '38px 58px', backgroundColor: 'var(--color-washi-paper)' };
const darkPage = { padding: '38px 58px', backgroundColor: 'var(--color-bg)' };
function Lazy({ children }) { const c = useContext(SlideContext); return c?.isSlideActive ? children : null; }
const Title = ({ children, tone = 'var(--color-washi-ink)' }) => <h1 style={{ margin: 0, color: tone, fontFamily: 'var(--font-heading)', fontSize: 48, lineHeight: 1.08 }}>{children}</h1>;
const Body = ({ children, tone = 'var(--color-washi-ink)' }) => <p style={{ maxWidth: 900, color: tone, fontFamily: 'var(--font-body)', fontSize: 24, lineHeight: 1.42 }}>{children}</p>;
const Small = ({ children, tone = 'var(--color-washi-ink)' }) => <p style={{ maxWidth: 820, color: tone, fontFamily: 'var(--font-body)', fontSize: 19, lineHeight: 1.42, opacity: 0.85 }}>{children}</p>;
const Eyebrow = ({ children, tone = 'var(--color-washi-alert)' }) => <div style={{ fontFamily: 'var(--font-mono)', color: tone, letterSpacing: '0.16em', fontSize: 13 }}>{children}</div>;
const Source = ({ evidence, caseNote }) => <MainTalkSourceFooter evidence={evidence} caseNote={caseNote} detailUrl="whatisavpp.com/research/japan-energy-flexibility" />;
function template({ slideNumber }) { return <div style={{ position: 'absolute', right: 22, bottom: 15, fontFamily: 'var(--font-mono)', color: 'var(--color-dim)', fontSize: 12 }}>{Math.min(slideNumber, coreSlides)} / {coreSlides}</div>; }

// Pipeline chip row for the control-plane weave.
const PipelineRow = ({ items, tone = 'var(--color-primary)' }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', fontFamily: 'var(--font-mono)', color: tone, fontSize: 15, letterSpacing: '0.08em' }}>
    {items.map((it, i) => (
      <React.Fragment key={it}>
        <span style={{ padding: '10px 14px', border: `1px solid ${tone}`, background: 'color-mix(in srgb, var(--color-washi-paper) 88%, transparent)' }}>{it}</span>
        {i < items.length - 1 && <span style={{ opacity: 0.6 }}>→</span>}
      </React.Fragment>
    ))}
  </div>
);

// Aggregation pyramid unified viz: one slide, four stepped tiers with per-tier
// asset callouts. Absorbs the old EV / HEMS / AggregationPyramid slides.
function FleetBuildViz({ step = 0 }) {
  const TIERS = [
    { label: 'DEVICE', asset: 'One EV, one battery, one heat pump.', detail: 'V2H-capable EV. HEMS-managed home battery. Modulating heat pump. Each already speaks a protocol.' },
    { label: 'HOME', asset: 'HEMS coordinates the home as one node.', detail: 'Kansai Electric × Shizen Connect: HEMS-controlled residential batteries in a capacity-market feasibility test.' },
    { label: 'NEIGHBORHOOD', asset: '186 households, one fleet.', detail: 'Shizen Connect, January 2024: 186 household EVs coordinated through V2H. 90% control accuracy — company-reported.' },
    { label: 'PORTFOLIO', asset: 'A city becomes a virtual plant.', detail: 'Aggregated device state is a first-class operational surface. Legible to markets, dispatchable by software.' },
  ];
  const n = Number.isFinite(step) ? step : 0;
  const phase = Math.min(Math.max(n, 0), TIERS.length - 1);
  const tier = TIERS[phase] || TIERS[0];
  return (
    <div style={{ height: '100%', display: 'grid', gridTemplateColumns: '1.05fr .95fr', gap: 30 }}>
      <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 14 }}>
        <Eyebrow tone="var(--color-secondary)">FLEET SCALE · STEP {phase + 1} / 4</Eyebrow>
        <Title>{tier.asset}</Title>
        <div style={{ marginTop: 6 }}>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.12em', fontSize: 14 }}>{tier.label}</div>
          <Body>{tier.detail}</Body>
        </div>
      </div>
      <div style={{ height: 460, position: 'relative' }}>
        <Lazy><AggregationPyramid focusTier={phase} /></Lazy>
      </div>
    </div>
  );
}

// Asset-mix + portfolio-capacity viz. Four asset classes fill in over steps;
// the running stacked bar shows how portfolio energy capacity accumulates as
// each class joins. Numbers are order-of-magnitude illustrative, not sourced.
const ASSET_MIX = [
  { key: 'battery', label: 'HOME BATTERY', spec: '10 kWh × millions', gwh: 10, color: 'var(--color-primary)' },
  { key: 'ev',      label: 'EV · V2H',      spec: '60 kWh × 500k',    gwh: 30, color: 'var(--color-washi-solar)' },
  { key: 'hp',      label: 'HEAT PUMP',     spec: 'shift, not store', gwh: 6,  color: 'var(--color-secondary)' },
  { key: 'hems',    label: 'HEMS',          spec: 'coordination glue',gwh: 0,  color: 'var(--color-washi-alert)' },
];
function AssetMixCapacityViz({ step = 0 }) {
  const phase = Math.min(Math.max(Number.isFinite(step) ? step : 0, 0), ASSET_MIX.length - 1);
  const visible = ASSET_MIX.slice(0, phase + 1);
  const totalGwh = visible.reduce((a, b) => a + b.gwh, 0);
  const maxTotal = ASSET_MIX.reduce((a, b) => a + b.gwh, 0);
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr auto', gap: 18, height: '100%' }}>
      <div>
        <Eyebrow tone="var(--color-secondary)">PROOF 3 · WHAT THE FLEET IS MADE OF · STEP {phase + 1} / 4</Eyebrow>
        <Title>Use demand smarter, every day</Title>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {ASSET_MIX.map((a, i) => {
          const on = i <= phase;
          return (
            <div key={a.key} style={{
              padding: '14px 16px',
              border: `1.5px solid ${on ? a.color : 'color-mix(in srgb, var(--color-washi-ink) 15%, transparent)'}`,
              background: on ? `color-mix(in srgb, ${a.color} 10%, transparent)` : 'transparent',
              opacity: on ? 1 : 0.35,
              transition: 'opacity 400ms, background 400ms, border-color 400ms',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', color: a.color, letterSpacing: '0.12em', fontSize: 12 }}>{a.label}</div>
              <div style={{ marginTop: 6, fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-washi-ink)' }}>{a.spec}</div>
              <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 22, color: a.color, fontWeight: 700 }}>
                {a.gwh > 0 ? `${a.gwh} GWh` : '—'}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-washi-ink)', opacity: 0.7, letterSpacing: '0.1em' }}>
          <span>ILLUSTRATIVE PORTFOLIO ENERGY CAPACITY</span>
          <span>{totalGwh} GWh · running total</span>
        </div>
        <div style={{ position: 'relative', height: 44, border: '1px solid color-mix(in srgb, var(--color-washi-ink) 25%, transparent)', display: 'flex', alignItems: 'stretch', overflow: 'hidden' }}>
          {ASSET_MIX.filter(a => a.gwh > 0).map((a, i) => {
            const on = ASSET_MIX.indexOf(a) <= phase;
            const w = on ? `${(a.gwh / maxTotal) * 100}%` : '0%';
            return (
              <div key={a.key} style={{
                width: w,
                background: a.color,
                transition: 'width 600ms ease-out',
                borderRight: '1px solid color-mix(in srgb, var(--color-washi-paper) 40%, transparent)',
              }} />
            );
          })}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-washi-ink)', opacity: 0.55 }}>
          Bar widths are illustrative order-of-magnitude estimates, not sourced deployment numbers.
        </div>
      </div>
      <div style={{ padding: '14px 18px', borderLeft: '3px solid var(--color-secondary)', background: 'color-mix(in srgb, var(--color-secondary) 6%, transparent)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.12em', fontSize: 12 }}>ONE CONCRETE EXAMPLE · SHIZEN CONNECT · JANUARY 2024</div>
        <Small>186 household EVs coordinated through V2H — 90% control accuracy, company-reported. A scoped demonstration of the loop (observe · decide · dispatch · acknowledge · verify). The path forward: more asset classes on the same control plane.</Small>
      </div>
    </div>
  );
}

export default function MainTalk() {
  const { theme, cycleTheme, spectacleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  return <><PresentationChrome theme={theme} cycleTheme={cycleTheme} locale={locale} setLocale={setLocale} /><Deck theme={spectacleTheme} template={template} backdropStyle={{ backgroundColor: 'var(--color-washi-paper)' }}>

    {/* 1 · Title */}
    <Slide {...page}><div style={{ height: '100%', display: 'grid', alignContent: 'center' }}><Eyebrow>KUBECON + CLOUDNATIVECON JAPAN</Eyebrow><h1 style={{ maxWidth: 1040, margin: '24px 0 0', color: 'var(--color-washi-ink)', fontFamily: 'var(--font-heading)', fontSize: 66, lineHeight: 1.04 }}>What is a Virtual Power Plant (VPP) ?</h1><div style={{ marginTop: 22, fontFamily: 'var(--font-heading)', color: 'var(--color-washi-solar)', fontSize: 34 }}>Green Tech and the Modernization of the Grid</div><div style={{ marginTop: 28, fontFamily: 'var(--font-mono)', color: 'var(--color-washi-solar)', letterSpacing: '0.12em' }}>BATTERIES · CONNECTIVITY · COORDINATION</div></div><Notes>Open with the program title. The whole talk earns the term "VPP" — do not use it before slide 7.</Notes></Slide>

    {/* 2 · Improve the grid */}
    <Slide {...page}><Eyebrow>GRID MODERNIZATION</Eyebrow><Title>Improve the grid: add batteries + internet</Title><StepBridge count={2}>{step => <CapabilityMotif variant="network" step={step} />}</StepBridge><Source evidence={E.japanEnergy} /><Notes>Step 1: connectivity. Step 2: storage. Both are software surfaces already.</Notes></Slide>

    {/* 3 · Japan atlas + 50/60 Hz history quirk */}
    <Slide padding="0" backgroundColor="var(--color-washi-paper)"><StepBridge count={2}>{step => <div style={{ height: '100%', position: 'relative', background: 'var(--color-washi-paper)' }}><Lazy><JapanGridAtlas variant="washi" step={step} preset={mainAtlasPreset} /></Lazy><div style={{ position: 'absolute', top: 28, left: 38, maxWidth: 620, padding: '20px 24px', background: 'color-mix(in srgb, var(--color-washi-paper) 90%, transparent)' }}><Eyebrow>1890s · A DECISION THAT NEVER GOT UNDONE</Eyebrow><Title>Two grids, one country</Title><Small>Tokyo bought its first generators from AEG (Germany, 50 Hz). Osaka bought from GE (United States, 60 Hz). A century later, Japan is still two synchronous grids joined by 2.1 GW of HVDC converters.</Small></div></div>}</StepBridge><Notes>Japan is not one grid. It is two — 50 Hz east and 60 Hz west — connected by a controllable but capped HVDC bridge. Why: procurement decisions in the 1890s (Tokyo AEG, Osaka GE) that were never unified. Sources: en.wikipedia.org/wiki/Electricity_sector_in_Japan#Transmission. This quirk is load-bearing — it becomes decisive in the Fukushima cold-snap chain later.</Notes></Slide>

    {/* 4 · PROOF 1 title */}
    <Slide {...page}><div style={{ height: '100%', display: 'grid', alignContent: 'center' }}><Eyebrow tone="var(--color-washi-solar)">PROOF 1 · MARKET PARTICIPATION</Eyebrow><Title>Bring new players into the market</Title><Body>Batteries, EVs, and homes can become trusted grid resources — when they can be coordinated.</Body></div><Notes>Frame proof 1: distributed assets can participate as coordinated flexibility. The problem we're solving lives on the next slide.</Notes></Slide>

    {/* 5 · SOLAR TIMING PROBLEM (replaces old Kyushu curtailment card) */}
    <Slide padding="0" backgroundColor="var(--color-washi-paper)"><StepBridge count={3}>{step => <SolarTimingProblem step={step} />}</StepBridge><Notes>Step 1: household demand — two peaks. Step 2: solar generation — one bell at noon. The curves do not line up. Step 3: name the two regions — midday surplus (curtailed) and evening deficit (peak). Step 4: a battery is the shift that reconciles them. This is the ENTIRE motivation for what follows.</Notes></Slide>

    {/* 6 · Tokyo duck curve */}
    <Slide padding="0" backgroundColor="var(--color-bg)"><StepBridge count={3}>{step => <TokyoDuckCurveCaseStudy step={step} />}</StepBridge><Notes>Tokyo-area reported case. Noon curtailment context; illustrative household charging; illustrative dusk support. Do not claim fleet capacity or delivered grid impact.</Notes></Slide>

    {/* 7 · Store it for later + CONTROL-PLANE FRAGMENT 1 (homes → cloud → controller) */}
    <Slide {...darkPage}>
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr', gap: 14, height: '100%' }}>
        <div>
          <Eyebrow tone="var(--color-secondary)">THE SHIFT · HOW SOFTWARE MAKES IT REAL</Eyebrow>
          <Title tone="var(--color-heading)">Store it for later</Title>
          <Small tone="var(--color-dim)">Batteries hold noon generation. EVs and heat pumps shift into the solar window. Something has to talk to all of it — a distributed system does.</Small>
        </div>
        <div style={{ minHeight: 0 }}><Lazy><VPPArchitecture /></Lazy></div>
      </div>
      <Notes>First fragment of the control plane. Do not name company vendors. This is the "how" of proof 1: what the software layer looks like end to end. Second fragment lives in proof 3, third fragment in the summary slide.</Notes>
    </Slide>

    {/* 8 · PROOF 2 title */}
    <Slide {...page}><div style={{ height: '100%', display: 'grid', alignContent: 'center', gap: 20 }}><Eyebrow tone="var(--color-primary)">PROOF 2 · FAILURE RESPONSE</Eyebrow><Title>Respond when the system is tight</Title></div><Notes>Set up the next three slides: what frequency is, why it matters, how it fails, and the moment-by-moment story of the March 2022 cold-snap emergency — replayed with a VPP running alongside.</Notes></Slide>

    {/* 9 · GRID FREQUENCY EXPLAINER (Amsterdam re-use) */}
    <Slide backgroundColor="var(--color-bg)" padding="0">
      <div style={{ position: 'relative', width: '100%', height: '100%', padding: '28px 40px 16px', display: 'flex', flexDirection: 'column' }}>
        <div>
          <Eyebrow tone="var(--color-secondary)">FREQUENCY IS AGREEMENT · TWO GRIDS, ONE COUNTRY</Eyebrow>
          <Title tone="var(--color-heading)">50 Hz east. 60 Hz west. What that even means.</Title>
          <Small tone="var(--color-dim)">Two generators locked in phase = one synchronous grid. Two generators at different frequencies cannot connect directly — protection relays would trip immediately. Japan's east and west stay separate for exactly this reason, bridged only by 2.1 GW of HVDC converters that decouple the two frequencies.</Small>
        </div>
        <StepBridge count={5}>{step => <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Lazy><GridFrequencyExplainer width={1200} height={440} step={Math.max(0, step - 1)} /></Lazy></div>}</StepBridge>
      </div>
      <Notes>Step 1: title only — set the frame. Step 2: one generator, clean AC sine wave. Step 3: add a second generator, same frequency — reinforcing waves = a stable grid. Step 4: one drifts — interference. Step 5: protection relays disconnect the drifter to prevent damage. Then the remaining generators carry all the load. Cascade risk. This is why the 50/60 Hz split matters — you cannot just plug them together.</Notes>
    </Slide>

    {/* 10 · FREQUENCY BAND / TOOLS FOR BALANCING (Amsterdam re-use) */}
    <Slide backgroundColor="var(--color-bg)" padding="0">
      <StepBridge count={5}>{step => (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <div style={{ position: 'absolute', inset: 0 }}>
            <Lazy><FrequencyWalkthrough step={Math.max(0, step - 1)} mode="scenarios" hideClockHud /></Lazy>
          </div>
          <div style={{ position: 'absolute', right: 36, bottom: 32, maxWidth: 420, textAlign: 'right', pointerEvents: 'none' }}>
            <Eyebrow tone="var(--color-primary)">GRID FREQUENCY</Eyebrow>
            <Title tone="var(--color-heading)" style={{ fontSize: 30, lineHeight: 1.15, marginTop: 4 }}>2.5 Hz between "fine" and total collapse</Title>
          </div>
        </div>
      )}</StepBridge>
      <Notes>49.8-50.2 Hz normal · 49.5 reserves activate · 49.2 peakers fire · 49.0 load shedding begins · 47.5 generators disconnect and the grid collapses. In the Japan context: substitute 60 Hz for the west, but the physics is the same. The point: there are only 2.5 Hz between "fine" and "off." A VPP moves the fleet inside this envelope.</Notes>
    </Slide>

    {/* 11 · FUKUSHIMA COLD-SNAP CASCADE + VPP COUNTERFACTUAL OVERLAY */}
    <Slide padding="0" backgroundColor="var(--color-bg)">
      <StepBridge count={11}>{step => (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <Lazy><JapanColdSnapCascade step={step} /></Lazy>
          <VppCounterfactualOverlay step={step} />
        </div>
      )}</StepBridge>
      <Notes>Same 10-step timeline as the keynote — March 2022 Fukushima-oki quake + cold-snap chain — but with a "with a VPP · counterfactual" card appearing at each step. Read the cascade first, then read the counterfactual. Do not pretend the counterfactual happened: name it as counterfactual every time. See docs/keynote-speaker-notes.md for the timeline beats. The point lands cumulatively: this is not one heroic dispatch, it is a fleet always inside the operating envelope.</Notes>
    </Slide>

    {/* 12 · PROOF 3 · ASSET MIX + PORTFOLIO CAPACITY (replaces old 12 title + old 13 Shizen loop) */}
    <Slide {...page}>
      <StepBridge count={3}>{step => <AssetMixCapacityViz step={step} />}</StepBridge>
      <Notes>Proof 3 · daily operation. The fleet is not "batteries." It is a mix of asset classes — home storage, V2H EVs, heat pumps, and the HEMS layer that coordinates them. Each class contributes different things (energy vs. flex kW). Shizen Connect is the concrete example we lean on: 186 household EVs, V2H, 90% control accuracy — a scoped demonstration, not a national dispatch. Point to it as the seed of what comes next.</Notes>
    </Slide>

    {/* 13 · CONTROL-PLANE FRAGMENT 3 · What cloud-native teams can build */}
    <Slide {...darkPage}>
      <Eyebrow tone="var(--color-secondary)">THE VPP IS THE CONTROL PLANE</Eyebrow>
      <Title tone="var(--color-heading)">What cloud-native teams can build</Title>
      <Small tone="var(--color-dim)">Event streams for telemetry. Actors for fleet state. GitOps for safe change. Traces that make every response explainable. The primitives already exist in this room.</Small>
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gridTemplateRows: '250px 190px', gap: 14, marginTop: 16 }}>
        <div style={{ gridRow: 'span 2' }}><Lazy><VPPArchitecture /></Lazy></div>
        <div><Lazy><ResponseTimeline /></Lazy></div>
        <div style={{ padding: 18, border: '1px solid color-mix(in srgb, var(--color-secondary) 45%, transparent)', background: 'color-mix(in srgb, var(--color-bg) 82%, transparent)' }}>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.12em', fontSize: 12 }}>THE WEAVE, REASSEMBLED</div>
          <ul style={{ margin: '10px 0 0', padding: '0 0 0 18px', color: 'var(--color-heading)', fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.5 }}>
            <li>Proof 1 — homes → MQTT → cloud → controller → market</li>
            <li>Proof 3 — observe · decide · dispatch · ack · verify</li>
            <li>Now — same primitives, one operational picture</li>
          </ul>
        </div>
      </div>
      <Notes>The three fragments reassemble on one slide. This is the summary of the control plane. Keep it brief — the audience already saw the pieces; this is where they see the whole.</Notes>
    </Slide>

    {/* 14 · Closer */}
    <Slide {...page}>
      <div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div>
          <Title>Japan needs flexibility.</Title>
          <Body>The grid is a distributed system. We already know how to build those.</Body>
          <div style={{ marginTop: 34, fontFamily: 'var(--font-mono)', color: 'var(--color-washi-solar)', letterSpacing: '0.14em', fontSize: 16 }}>
            whatisavpp.com/research/japan-energy-flexibility
          </div>
          <Small>Sources, case notes, and the technical appendix live there. This talk remains self-contained.</Small>
        </div>
      </div>
      <Notes>Land on the through-line. Silence after is fine.</Notes>
    </Slide>

    {/* ─── APPENDIX (not counted in core pagination) ─── */}

    {/* A1 · Proof 3 title card (moved from core) */}
    <Slide {...page}>
      <div style={{ height: '100%', display: 'grid', alignContent: 'center' }}>
        <Eyebrow tone="var(--color-secondary)">APPENDIX · PROOF 3 · DAILY OPERATION</Eyebrow>
        <Title>Use demand smarter, every day</Title>
        <Body>Not just emergencies. The steady-state control loop — dispatch, acknowledge, verify — is what makes a fleet trustworthy at scale.</Body>
      </div>
      <Notes>Appendix framing slide. Only surface if the audience wants the daily-operation framing before the asset-mix slide.</Notes>
    </Slide>

    {/* A2 · Unified fleet build (aggregation pyramid — moved from core) */}
    <Slide {...page}>
      <StepBridge count={4}>{step => <FleetBuildViz step={step} />}</StepBridge>
      <Notes>Appendix aggregation view: device → home → neighborhood → portfolio. Kept as reference for how the pieces roll up. Skipped in the main flow because it duplicated the asset-mix and control-plane slides.</Notes>
    </Slide>

  </Deck></>;
}
