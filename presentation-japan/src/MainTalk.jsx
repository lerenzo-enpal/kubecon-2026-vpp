import React, { useContext } from 'react';
import { Deck, Notes, Slide } from 'spectacle';
import { SlideContext } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import { MainTalkSourceFooter } from './components/MainTalkSourceFooter.jsx';
import { DaylightFlexibilityScene } from './components/DaylightFlexibilityScene.jsx';
import StepBridge from './components/StepBridge.jsx';
import { MAIN_TALK_EVIDENCE as E } from './data/mainTalkEvidence.mjs';
import { JEPXPriceChart } from './components/JEPXPriceChart.jsx';
import { JapanGridMap } from './components/JapanGridMap.jsx';
import { JapanSelfSufficiencyChart } from './components/JapanSelfSufficiencyChart.jsx';
import { JapanVPPMap } from './components/JapanVPPMap.jsx';
import VPPArchitecture from '../../presentation/src/components/VPPArchitecture.jsx';
import ChoreographyLoop from '../../presentation/src/components/ChoreographyLoop.jsx';
import ResponseTimeline from '../../presentation/src/components/ResponseTimeline.jsx';
import AggregationPyramid from '../../presentation/src/components/AggregationPyramid.jsx';
import FrequencyDemo from '../../presentation/src/components/FrequencyDemo.jsx';

const coreSlides = 26;
const page = { padding: '38px 58px', backgroundColor: 'var(--color-bg)' };
function Lazy({ children }) { const c = useContext(SlideContext); return c?.isSlideActive ? children : null; }
const Title = ({ children, tone = 'var(--color-heading)' }) => <h1 style={{ margin: 0, color: tone, fontFamily: 'var(--font-heading)', fontSize: 48, lineHeight: 1.08 }}>{children}</h1>;
const Body = ({ children }) => <p style={{ maxWidth: 900, color: 'var(--color-text)', fontFamily: 'var(--font-body)', fontSize: 24, lineHeight: 1.42 }}>{children}</p>;
const Act = ({ number, children }) => <div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center', background: 'var(--color-washi-paper)', color: 'var(--color-washi-ink)' }}><div><div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, letterSpacing: '0.2em' }}>ACT {number}</div><div style={{ marginTop: 18, fontFamily: 'var(--font-heading)', fontSize: 58, fontWeight: 800 }}>{children}</div></div></div>;
const Source = ({ evidence }) => <MainTalkSourceFooter evidence={evidence} detailUrl="whatisavpp.com/research/japan-energy-flexibility" />;
function template({ slideNumber }) { return <div style={{ position: 'absolute', right: 22, bottom: 15, fontFamily: 'var(--font-mono)', color: 'var(--color-dim)', fontSize: 12 }}>{Math.min(slideNumber, coreSlides)} / {coreSlides}</div>; }

export default function MainTalk() {
  const { theme, cycleTheme, spectacleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  return <><PresentationChrome theme={theme} cycleTheme={cycleTheme} locale={locale} setLocale={setLocale} /><Deck theme={spectacleTheme} template={template}>
    <Slide {...page}><div style={{ height: '100%', display: 'grid', alignContent: 'center', gap: 20 }}><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)' }}>KUBECON + CLOUDNATIVECON JAPAN 2026 · YOKOHAMA</div><Title>Japan needs flexibility.</Title><Body>Because it cannot borrow energy, wastes clean power it already has, and must coordinate homes as trusted grid capacity.</Body></div><Notes>Promise: Japan’s grid problem is a distributed-systems problem.</Notes></Slide>
    <Slide {...page}><Title>One question for this talk</Title><Body>What changes when the grid must coordinate millions of small, variable energy resources?</Body><Body>LeRenzo Malcolm · Priyanka</Body></Slide>
    <Slide padding="0"><Act number="I">Japan cannot borrow</Act></Slide>
    <Slide padding="0"><div style={{ height: '100%', position: 'relative' }}><Lazy><JapanGridMap height={580} /></Lazy><div style={{ position: 'absolute', top: 34, left: 46 }}><Title>One island. Two frequencies.</Title><Body>Supply shocks cannot be balanced across borders — or freely across Japan’s own 50/60 Hz seam.</Body></div><Source evidence={E.japanEnergy} /></div><Notes>Map: island isolation and the frequency seam make flexibility local and urgent.</Notes></Slide>
    <Slide {...page}><Title>Japan cannot borrow in a crisis</Title><Body>Island geography, constrained interconnection, and imported fuel turn a supply disruption into an operational problem at home.</Body><Source evidence={E.japanEnergy} /></Slide>
    <Slide {...page}><Title tone="var(--color-washi-alert)">15.3% self-sufficient</Title><Body>Japan’s FY2023 primary-energy self-sufficiency rate was 15.3%.</Body><div style={{ height: 330 }}><Lazy><JapanSelfSufficiencyChart height={350} /></Lazy></div><Source evidence={E.japanEnergy} /></Slide>
    <Slide {...page}><Title>January 2021 made fragility visible</Title><Body>A market-price shock can emerge without an earthquake: cold weather and fuel logistics are enough to expose thin flexibility.</Body><div style={{ height: 320 }}><Lazy><JEPXPriceChart height={340} /></Lazy></div><Source evidence={E.jepx2021} /></Slide>
    <Slide {...page}><Title>Thin reserves leave little room for error</Title><Body>The point is not one historic alert. It is that every contingency must be solved inside the island system.</Body><Source evidence={E.jepx2021} /></Slide>
    <Slide padding="0"><StepBridge count={3}>{step => <DaylightFlexibilityScene mode="problem" step={step} />}</StepBridge><Notes>Act II: Japan cannot borrow energy, so it must balance locally across time. Follow one day: morning balance, noon surplus, evening ramp.</Notes></Slide>
    <Slide {...page}><Title tone="var(--color-washi-alert)">A real noon operating constraint</Title><div style={{ marginTop: 48, padding: '28px 32px', borderLeft: '8px solid var(--color-washi-alert)', background: 'color-mix(in srgb, var(--color-washi-alert) 7%, transparent)' }}><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', fontSize: 20, letterSpacing: '0.12em' }}>4 MAY 2025 · 12:00–12:30</div><div style={{ marginTop: 18, fontFamily: 'var(--font-heading)', fontSize: 48, lineHeight: 1.08 }}>Kyushu T&amp;D recorded up to 5.09 GW of renewable-output control.</div></div><Body>This is a maximum power value, not an energy total: a single interval when local clean generation had to be constrained.</Body><Source evidence={E.kyushuControl} /></Slide>
    <Slide padding="0"><StepBridge count={3}>{step => <DaylightFlexibilityScene mode="response" step={step} />}</StepBridge><Notes>Same day, different response: EVs, heat pumps, and batteries can move load into the solar window and support the evening ramp. This is illustrative; it is not a Shizen Connect performance result.</Notes></Slide>
    <Slide {...page}><Title>From one day to one city</Title><Body>Flexibility moves power across time. At city scale, it becomes a graph of devices, homes, substations, markets, and constraints.</Body><Body>That graph needs a trusted, observable control plane.</Body><Source evidence={E.erab} /></Slide>
    <Slide padding="0"><Act number="III">Software makes capacity</Act></Slide>
    <Slide {...page}><Title>ERAB connects assets to a market context</Title><Body>Japan’s aggregation policy framework establishes the setting in which flexible resources can become accountable grid capacity.</Body><Source evidence={E.erab} /></Slide>
    <Slide {...page}><Title>A city is a graph problem</Title><Body>Devices, homes, substations, markets, and constraints form a graph. A VPP makes that graph observable and responsive.</Body></Slide>
    <Slide {...page}><Title>The VPP is a cloud-native control plane</Title><div style={{ height: 430 }}><Lazy><VPPArchitecture /></Lazy></div></Slide>
    <Slide {...page}><Title>Choreography keeps response close to the edge</Title><Body>Local autonomy handles fast physical response; the platform coordinates intent, constraints, and auditability.</Body><div style={{ height: 360 }}><Lazy><ChoreographyLoop /></Lazy></div></Slide>
    <Slide {...page}><Title>One response loop, end to end</Title><div style={{ height: 440 }}><Lazy><ResponseTimeline /></Lazy></div></Slide>
    <Slide padding="0"><Lazy><FrequencyDemo /></Lazy><Notes>Technical demo: software supports the physical control loop; it must not become the bottleneck.</Notes></Slide>
    <Slide {...page}><Title>Aggregation makes a fleet legible</Title><Body>Individual devices become neighborhood, city, regional, and portfolio capacity without losing operational visibility.</Body><div style={{ height: 380 }}><Lazy><AggregationPyramid /></Lazy></div></Slide>
    <Slide padding="0"><div style={{ height: '100%', position: 'relative' }}><Lazy><JapanVPPMap height={580} /></Lazy><div style={{ position: 'absolute', top: 26, left: 32 }}><Title>SIMULATED DISPATCH</Title><Body>This visual demonstrates coordination mechanics; it is not a Shizen Connect outcome.</Body></div></div></Slide>
    <Slide {...page}><Title>Illustrative portfolio response</Title><Body>Software can coordinate a distributed fleet as one operational resource. The capacity shown in the prior map is simulated.</Body></Slide>
    <Slide {...page}><Title>What cloud-native teams can build</Title><Body>Event streams for telemetry. Actors for fleet state. GitOps for safe change. Traces that make every response explainable.</Body></Slide>
    <Slide {...page}><Title>Homes become a power plant when software earns trust</Title><Body>Not a fixed number of homes: a verifiable, observable, responsive portfolio that can grow as assets join.</Body></Slide>
    <Slide {...page}><Title>Keep exploring</Title><Body>whatisavpp.com/research/japan-energy-flexibility</Body><Body>Sources, case notes, and the technical appendix live there — while this talk remains self-contained.</Body><Source evidence={E.shizenConnect} /></Slide>
    <Slide {...page}><div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><Title>Japan needs flexibility.</Title><Body>The grid is a distributed system. We know how to build those.</Body></div></div></Slide>
  </Deck></>;
}
