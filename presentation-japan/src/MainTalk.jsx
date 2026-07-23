import React, { useContext } from 'react';
import { Deck, Notes, Slide, SlideContext } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import { MainTalkSourceFooter } from './components/MainTalkSourceFooter.jsx';
import { DaylightFlexibilityScene } from './components/DaylightFlexibilityScene.jsx';
import StepBridge from './components/StepBridge.jsx';
import { MAIN_TALK_EVIDENCE as E } from './data/mainTalkEvidence.mjs';
import { JapanGridMap } from './components/JapanGridMap.jsx';
import { JapanVPPMap } from './components/JapanVPPMap.jsx';
import VPPArchitecture from '../../presentation/src/components/VPPArchitecture.jsx';
import ChoreographyLoop from '../../presentation/src/components/ChoreographyLoop.jsx';
import ResponseTimeline from '../../presentation/src/components/ResponseTimeline.jsx';
import AggregationPyramid from '../../presentation/src/components/AggregationPyramid.jsx';

const coreSlides = 25;
const page = { padding: '38px 58px', backgroundColor: 'var(--color-washi-paper)' };
const darkPage = { padding: '38px 58px', backgroundColor: 'var(--color-bg)' };
function Lazy({ children }) { const c = useContext(SlideContext); return c?.isSlideActive ? children : null; }
const Title = ({ children, tone = 'var(--color-washi-ink)' }) => <h1 style={{ margin: 0, color: tone, fontFamily: 'var(--font-heading)', fontSize: 48, lineHeight: 1.08 }}>{children}</h1>;
const Body = ({ children }) => <p style={{ maxWidth: 900, color: 'var(--color-washi-ink)', fontFamily: 'var(--font-body)', fontSize: 24, lineHeight: 1.42 }}>{children}</p>;
const Source = ({ evidence, caseNote }) => <MainTalkSourceFooter evidence={evidence} caseNote={caseNote} detailUrl="whatisavpp.com/research/japan-energy-flexibility" />;
function template({ slideNumber }) { return <div style={{ position: 'absolute', right: 22, bottom: 15, fontFamily: 'var(--font-mono)', color: 'var(--color-dim)', fontSize: 12 }}>{Math.min(slideNumber, coreSlides)} / {coreSlides}</div>; }

export default function MainTalk() {
  const { theme, cycleTheme, spectacleTheme } = useTheme();
  const { locale, setLocale } = useLocale();
  return <><PresentationChrome theme={theme} cycleTheme={cycleTheme} locale={locale} setLocale={setLocale} /><Deck theme={spectacleTheme} template={template}>
    <Slide padding="0"><div style={{ height: '100%', position: 'relative', background: 'var(--color-washi-paper)' }}><Lazy><JapanGridMap variant="washi" height={580} /></Lazy><div style={{ position: 'absolute', top: 28, left: 38, maxWidth: 620, padding: '20px 24px', background: 'color-mix(in srgb, var(--color-washi-paper) 88%, transparent)' }}><Title>Japan cannot borrow</Title><Body>An island system must solve each imbalance at home.</Body></div></div><Notes>Orientation: island system; low primary-energy self-sufficiency; little room when supply tightens.</Notes></Slide>
    <Slide {...page}><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '0.16em' }}>ONE QUESTION</div><Title>What happens at the 50 / 60 Hz seam?</Title><Body>When the grid is split in two, flexibility has to be coordinated where the imbalance appears.</Body><div style={{ marginTop: 48, height: 12, maxWidth: 820, background: 'linear-gradient(90deg, var(--color-primary) 0 48%, var(--color-washi-alert) 48% 52%, var(--color-washi-solar) 52%)' }} /></Slide>
    <Slide {...page}><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '0.16em' }}>EXPOSURE</div><div style={{ marginTop: 78, fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)', fontSize: 112, lineHeight: 0.9 }}>15.3%</div><Title>primary-energy self-sufficiency</Title><Body>That is why timing, control, and trusted local capacity matter.</Body><Source evidence={E.japanEnergy} /></Slide>

    <Slide padding="0"><StepBridge count={3}>{step => <DaylightFlexibilityScene mode="problem" step={step} eyebrow="PROOF 1 · MAKE RENEWABLES USABLE" />}</StepBridge><Notes>Chapter promise: renewables need timing, not only generation. Follow one day: morning balance; noon surplus; evening ramp.</Notes></Slide>
    <Slide {...page}><Title tone="var(--color-washi-alert)">A real noon operating constraint</Title><div style={{ marginTop: 48, padding: '28px 32px', borderLeft: '8px solid var(--color-washi-alert)', background: 'color-mix(in srgb, var(--color-washi-alert) 7%, transparent)' }}><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', fontSize: 20, letterSpacing: '0.12em' }}>4 MAY 2025 · 12:00–12:30</div><div style={{ marginTop: 18, fontFamily: 'var(--font-heading)', fontSize: 48, lineHeight: 1.08 }}>Kyushu T&amp;D recorded up to 5.09 GW of renewable-output control.</div></div><Body>This is a maximum power value, not an energy total: a single interval when local clean generation had to be constrained.</Body><Source evidence={E.kyushuControl} /></Slide>
    <Slide {...page}><Title>Generation and demand miss each other</Title><Body>At noon, clean supply can exceed local demand. By evening, solar falls just as homes and cities need more power.</Body><Body>The resource is available. The timing is wrong.</Body></Slide>
    <Slide padding="0"><StepBridge count={3}>{step => <DaylightFlexibilityScene mode="response" step={step} />}</StepBridge><Notes>Same day, different response: EVs, heat pumps, and batteries move load into the solar window. Illustrative, not a Shizen Connect result.</Notes></Slide>
    <Slide {...page}><Title>Store it for later</Title><Body>Batteries store noon generation. EVs and heat pumps shift consumption into the solar window. The evening ramp becomes smaller and easier to serve.</Body></Slide>
    <Slide {...page}><Title>A Japanese platform for that flexibility</Title><Body>Shizen Connect’s public materials describe a VPP platform for coordinating distributed energy resources.</Body><Source evidence={E.shizenConnect} caseNote={{ title: 'Shizen Connect', scope: 'Platform context for distributed energy resources', qualifier: 'Company-reported platform scope · not a performance result' }} /></Slide>

    <Slide {...page}><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-primary)', letterSpacing: '0.16em' }}>PROOF 2 · FAILURE RESPONSE</div><Title>Respond at grid speed</Title><Body>A grid event does not wait for a manual dispatch chain. Fast physical response needs rules, telemetry, and a trusted control path.</Body><Notes>Failure trigger: move from energy timing to operational response.</Notes></Slide>
    <Slide {...page}><Title>ERAB connects assets to a market context</Title><Body>Japan’s aggregation policy framework establishes the setting in which flexible resources can become accountable grid capacity.</Body><Source evidence={E.erab} /></Slide>
    <Slide {...page}><Title>A city is a graph problem</Title><Body>Devices, homes, substations, markets, and constraints form a graph. A VPP makes that graph observable and responsive.</Body></Slide>
    <Slide {...page}><Title>The VPP is a cloud-native control plane</Title><div style={{ height: 430 }}><Lazy><VPPArchitecture /></Lazy></div></Slide>
    <Slide {...page}><Title>Choreography keeps response close to the edge</Title><Body>Local autonomy handles fast physical response; the platform coordinates intent, constraints, and auditability.</Body><div style={{ height: 360 }}><Lazy><ChoreographyLoop /></Lazy></div></Slide>
    <Slide {...darkPage}><div data-testid="main-talk-response-loop" style={{ minHeight: 610, padding: '28px', background: 'var(--color-bg)' }}><Title tone="var(--color-heading)">One response loop, end to end</Title><div style={{ height: 440 }}><Lazy><ResponseTimeline /></Lazy></div></div></Slide>

    <Slide {...page}><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.16em' }}>PROOF 3 · DAILY OPERATION</div><Title>Use demand smarter</Title><Body>The same control plane can shift ordinary demand every day: charge when clean power is available, preserve comfort, and keep capacity observable.</Body></Slide>
    <Slide {...page}><Title>EVs can become controllable capacity</Title><Body>In January 2024, Shizen Connect reported a demonstration coordinating 186 household EVs through V2H systems.</Body><Source evidence={E.shizenV2H} caseNote={{ title: 'Shizen Connect · January 2024', scope: '186 household EVs controlled through V2H', qualifier: '90% control accuracy · company-reported' }} /></Slide>
    <Slide {...page}><Title>HEMS can coordinate the home</Title><Body>Kansai Electric and Shizen Connect tested HEMS-controlled residential batteries in a simulated capacity-market demand-response demonstration.</Body><Source evidence={E.kansaiHems} caseNote={{ title: 'Kansai Electric × Shizen Connect', scope: 'HEMS capacity-market technical-feasibility demonstration', qualifier: 'Demonstration scope · no commercial outcome claimed' }} /></Slide>
    <Slide {...page}><Title>Aggregation makes a fleet legible</Title><Body>Individual devices become neighborhood, city, regional, and portfolio capacity without losing operational visibility.</Body><div style={{ height: 380 }}><Lazy><AggregationPyramid /></Lazy></div></Slide>
    <Slide padding="0"><div style={{ height: '100%', position: 'relative', background: 'var(--color-bg)' }}><Lazy><JapanVPPMap height={580} /></Lazy><div style={{ position: 'absolute', top: 26, left: 32 }}><Title tone="var(--color-heading)">SIMULATED DISPATCH</Title><Body>This visual demonstrates coordination mechanics; it is not a Shizen Connect outcome.</Body></div></div></Slide>
    <Slide {...darkPage}><Title tone="var(--color-heading)">Illustrative portfolio response</Title><Body>Software can coordinate a distributed fleet as one operational resource. The capacity shown in the prior map is simulated.</Body></Slide>

    <Slide {...page}><Title>What cloud-native teams can build</Title><Body>Event streams for telemetry. Actors for fleet state. GitOps for safe change. Traces that make every response explainable.</Body></Slide>
    <Slide {...page}><Title>Homes become a power plant when software earns trust</Title><Body>Not a fixed number of homes: a verifiable, observable, responsive portfolio that can grow as assets join.</Body></Slide>
    <Slide {...page}><Title>Keep exploring</Title><Body>whatisavpp.com/research/japan-energy-flexibility</Body><Body>Sources, case notes, and the technical appendix live there — while this talk remains self-contained.</Body></Slide>
    <Slide {...page}><div style={{ height: '100%', display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><Title>Japan needs flexibility.</Title><Body>The grid is a distributed system. We know how to build those.</Body></div></div></Slide>
  </Deck></>;
}
