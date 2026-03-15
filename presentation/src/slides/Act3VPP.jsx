import React from 'react';
import { Slide, Appear, Notes } from 'spectacle';
import { colors } from '../theme';
import { SlideContainer, GlowText, Subtitle, StatCard, Badge, SectionDivider } from '../components/ui';
import CascadeSimulation from '../components/CascadeSimulation';

export function act3Slides() {
  const architectureLayers = [
    { title: 'Edge', color: colors.success, items: ['Home Energy Agent', 'Local frequency detection', 'Autonomous operation', 'OTA firmware updates'] },
    { title: 'Connectivity', color: colors.primary, items: ['MQTT / LTE telemetry', 'Event streaming', 'Bidirectional control', 'Offline-first design'] },
    { title: 'Control Plane', color: colors.secondary, items: ['Kubernetes orchestration', 'Dapr service mesh', 'Event-driven decisions', 'Sub-second control loops'] },
    { title: 'Data & Market', color: colors.accent, items: ['Time-series pipeline', 'Grid operator APIs', 'Market bidding engine', 'Fleet analytics'] },
  ];

  const cloudNativeReasons = [
    { title: 'Real-time ingestion', desc: '100K+ devices streaming telemetry continuously', color: colors.primary },
    { title: 'Event-driven control', desc: 'Millisecond decisions — frequency drops, batteries respond', color: colors.success },
    { title: 'Rolling updates', desc: 'Update fleet firmware without downtime — ever', color: colors.secondary },
    { title: 'Multi-region resilience', desc: 'The VPP cannot go down when the grid needs it most', color: colors.danger },
    { title: 'Observability at scale', desc: 'Monitoring blindness caused the 2003 blackout — we solve that', color: colors.accent },
    { title: 'Elastic scaling', desc: 'Fleet grows from 100K to 1M devices — infrastructure must follow', color: colors.primary },
  ];

  return [
    /* ── Section Divider ── */
    <Slide key="vpp-divider" backgroundColor={colors.bg}>
      <SectionDivider
        number="III"
        title="The Virtual Power Plant"
        subtitle="Software that turns distributed energy into grid infrastructure"
      />
    </Slide>,

    /* ── Slide 14: What is a VPP? ── */
    <Slide key="what-is-vpp" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 70 }}>
        <GlowText size="44px" className="mb-4">
          What Is a Virtual Power Plant?
        </GlowText>
        <div className="text-[22px] font-normal text-hud-text font-sans leading-[1.6] max-w-[750px] mb-8">
          Software that <span className="text-hud-primary font-semibold">aggregates</span> distributed
          energy resources and <span className="text-hud-success font-semibold">operates</span> them
          as a coordinated power plant.
        </div>
        <div className="flex items-center justify-center gap-3">
          {/* Assets */}
          <div className="bg-hud-surface rounded-xl p-5 flex flex-col gap-2.5" style={{
            border: `1px solid ${colors.surfaceLight}`,
          }}>
            {[
              { label: 'Solar Panels', color: colors.solar },
              { label: 'Home Batteries', color: colors.success },
              { label: 'EV Chargers', color: colors.primary },
              { label: 'Heat Pumps', color: colors.secondary },
            ].map((a) => (
              <div key={a.label} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{
                  background: a.color, boxShadow: `0 0 8px ${a.color}60`,
                }} />
                <span className="text-[20px] text-hud-text font-sans font-medium">
                  {a.label}
                </span>
              </div>
            ))}
          </div>

          <div className="text-[28px] text-hud-primary font-mono">{'\u2192'}</div>

          {/* Cloud Platform */}
          <div className="rounded-2xl text-center" style={{
            background: `${colors.primary}08`, padding: '28px 32px',
            border: `1px solid ${colors.primary}30`,
          }}>
            <div className="text-[20px] font-bold text-hud-primary font-sans" style={{
              textShadow: `0 0 20px ${colors.primary}40`,
            }}>
              Cloud Platform
            </div>
            <div className="text-[20px] text-hud-text-muted font-mono mt-2">
              Kubernetes + Dapr
              <br />Event-driven control
              <br />Real-time telemetry
            </div>
          </div>

          <div className="text-[28px] text-hud-primary font-mono">{'\u2192'}</div>

          {/* Grid Services */}
          <div className="bg-hud-surface rounded-xl p-5 flex flex-col gap-2.5" style={{
            border: `1px solid ${colors.surfaceLight}`,
          }}>
            {[
              { label: 'Frequency Regulation', color: colors.danger },
              { label: 'Peak Shaving', color: colors.accent },
              { label: 'Energy Arbitrage', color: colors.success },
              { label: 'Demand Response', color: colors.primary },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{
                  background: s.color, boxShadow: `0 0 8px ${s.color}60`,
                }} />
                <span className="text-[20px] text-hud-text font-sans font-medium">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 15: KubeCon Analogy ── */
    <Slide key="kubecon-analogy" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 70 }}>
        <GlowText size="40px" className="mb-8">
          Speak<span className="text-hud-secondary">ing</span> Your Language
        </GlowText>
        <div className="items-start max-w-[780px]" style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16 }}>
          <div className="bg-hud-surface rounded-xl" style={{
            padding: '24px',
            border: `1px solid ${colors.danger}20`,
          }}>
            <div className="text-[20px] font-semibold text-hud-danger font-mono tracking-[0.1em] mb-4">
              TRADITIONAL GRID
            </div>
            {['Monolith architecture', 'Few large generators', 'Manual scaling', 'Single points of failure', 'No observability'].map((item) => (
              <div key={item} className="text-[20px] text-hud-text-muted font-sans" style={{
                padding: '6px 0', borderBottom: `1px solid ${colors.surfaceLight}`,
              }}>
                {item}
              </div>
            ))}
          </div>

          <div className="flex items-center text-[28px] text-hud-primary font-mono" style={{ paddingTop: 80 }}>
            {'\u2192'}
          </div>

          <div className="rounded-xl" style={{
            background: `${colors.success}06`, padding: '24px',
            border: `1px solid ${colors.success}25`,
          }}>
            <div className="text-[20px] font-semibold text-hud-success font-mono tracking-[0.1em] mb-4">
              VIRTUAL POWER PLANT
            </div>
            {['Distributed microservices', 'Millions of nodes', 'Autoscaling capacity', 'Resilient by design', 'Full-stack observability'].map((item) => (
              <div key={item} className="text-[20px] text-hud-text font-sans font-medium" style={{
                padding: '6px 0', borderBottom: `1px solid ${colors.surfaceLight}`,
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 text-center text-[20px] text-hud-text-muted font-mono">
          Grid frequency = SLO &nbsp;&bull;&nbsp; Cascade = unhandled failure propagation &nbsp;&bull;&nbsp; Batteries = autoscaling
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 16: Architecture ── */
    <Slide key="architecture" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <GlowText size="40px" className="mb-6">
          Architecture
        </GlowText>
        <div className="flex gap-4 justify-center">
          {architectureLayers.map((layer) => (
            <div key={layer.title} className="bg-hud-surface rounded-xl flex-1 min-w-[170px]" style={{
              border: `1px solid ${layer.color}25`, padding: '20px',
            }}>
              <div className="text-[20px] font-bold font-mono tracking-[0.08em] uppercase mb-3 pb-2" style={{
                color: layer.color,
                borderBottom: `1px solid ${layer.color}20`,
              }}>
                {layer.title}
              </div>
              {layer.items.map((item) => (
                <div key={item} className="text-[20px] text-hud-text-muted font-sans flex items-center gap-2" style={{
                  padding: '5px 0',
                }}>
                  <div className="w-1 h-1 rounded-full opacity-60" style={{ background: layer.color }} />
                  {item}
                </div>
              ))}
            </div>
          ))}
        </div>
      </SlideContainer>
      <Notes>
        "This is the same stack you use. Kubernetes. Service mesh. Event-driven.
        But instead of serving HTTP requests, you're keeping the lights on."
      </Notes>
    </Slide>,

    /* ── Slide 17: Why Cloud-Native? ── */
    <Slide key="why-cloud-native" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 70 }}>
        <GlowText size="44px" className="mb-7">
          Why Cloud-Native?
        </GlowText>
        <div className="max-w-[780px]" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {cloudNativeReasons.map((item) => (
            <div key={item.title} className="flex gap-3.5 items-start py-3">
              <div className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0" style={{
                background: item.color,
                boxShadow: `0 0 10px ${item.color}60`,
              }} />
              <div>
                <div className="text-[20px] font-semibold text-hud-text font-sans">
                  {item.title}
                </div>
                <div className="text-[20px] text-hud-text-muted font-sans leading-[1.4]">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 18: Demo Without VPP ── */
    <Slide key="demo-without-vpp" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 50 }}>
        <div className="flex items-center gap-4 mb-4">
          <Badge color={colors.danger}>LIVE SIMULATION</Badge>
          <GlowText size="36px" color={colors.danger}>
            Cascading Failure — No VPP
          </GlowText>
        </div>
        <Subtitle size="20px">
          A generator trips in Essen. Watch the cascade propagate across the German grid.
        </Subtitle>
        <div className="mt-4 flex justify-center">
          <CascadeSimulation width={740} height={500} withVPP={false} />
        </div>
      </SlideContainer>
      <Notes>
        Hit "Trip Generator" and let the cascade play out. Let the room go silent.
      </Notes>
    </Slide>,

    /* ── Slide 19: Demo With VPP ── */
    <Slide key="demo-with-vpp" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 50 }}>
        <div className="flex items-center gap-4 mb-4">
          <Badge color={colors.success}>LIVE SIMULATION</Badge>
          <GlowText size="36px" color={colors.success}>
            Same Failure — With VPP
          </GlowText>
        </div>
        <Subtitle size="20px">
          Same generator trip. But now 18 VPP clusters with distributed batteries respond.
        </Subtitle>
        <div className="mt-4 flex justify-center">
          <CascadeSimulation width={740} height={500} withVPP={true} />
        </div>
      </SlideContainer>
      <Notes>
        "Same failure. Same grid. But now green dots everywhere. Batteries injecting power.
        Frequency stabilizes. Cascade arrested. That's what a Virtual Power Plant does."
      </Notes>
    </Slide>,

    /* ── Slide 20: Numbers at Scale ── */
    <Slide key="numbers-at-scale" backgroundColor={colors.bg}>
      <SlideContainer>
        <GlowText size="44px" className="mb-9 text-center">
          The Numbers at Scale
        </GlowText>
        <div className="flex gap-5 justify-center">
          <StatCard number="$5.9B" label="Global VPP Market by 2030" color={colors.primary} />
          <StatCard number="80-160" unit=" GW" label="US DOE VPP Target by 2030" color={colors.success} />
          <StatCard number="1M+" label="Home Batteries in Germany" color={colors.accent} />
        </div>
        <Appear>
          <div className="mt-8 text-center bg-hud-surface rounded-xl" style={{
            padding: '24px 32px',
            border: `1px solid ${colors.primary}20`,
          }}>
            <div className="text-[22px] font-semibold text-hud-text font-sans leading-[1.6]">
              1 million batteries coordinated as VPPs = <span className="text-hud-primary font-extrabold">10+ GW</span> of flexible capacity
              <br />
              <span className="text-[20px] text-hud-text-muted font-normal">
                Equivalent to 10 large gas power plants. Running on Kubernetes.
              </span>
            </div>
          </div>
        </Appear>
      </SlideContainer>
    </Slide>,
  ];
}
