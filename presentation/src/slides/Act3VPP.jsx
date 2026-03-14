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
        <GlowText size="44px" style={{ marginBottom: 16 }}>
          What Is a Virtual Power Plant?
        </GlowText>
        <div style={{
          fontSize: '22px', fontWeight: 400, color: colors.text,
          fontFamily: '"Inter"', lineHeight: 1.6, maxWidth: 750, marginBottom: 32,
        }}>
          Software that <span style={{ color: colors.primary, fontWeight: 600 }}>aggregates</span> distributed
          energy resources and <span style={{ color: colors.success, fontWeight: 600 }}>operates</span> them
          as a coordinated power plant.
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          {/* Assets */}
          <div style={{
            background: colors.surface, borderRadius: 12, padding: '20px',
            border: `1px solid ${colors.surfaceLight}`, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              { label: 'Solar Panels', color: colors.solar },
              { label: 'Home Batteries', color: colors.success },
              { label: 'EV Chargers', color: colors.primary },
              { label: 'Heat Pumps', color: colors.secondary },
            ].map((a) => (
              <div key={a.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: a.color, boxShadow: `0 0 8px ${a.color}60`,
                }} />
                <span style={{ fontSize: '15px', color: colors.text, fontFamily: '"Inter"', fontWeight: 500 }}>
                  {a.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: '28px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>

          {/* Cloud Platform */}
          <div style={{
            background: `${colors.primary}08`, borderRadius: 16, padding: '28px 32px',
            border: `1px solid ${colors.primary}30`, textAlign: 'center',
          }}>
            <div style={{
              fontSize: '20px', fontWeight: 700, color: colors.primary,
              fontFamily: '"Inter"', textShadow: `0 0 20px ${colors.primary}40`,
            }}>
              Cloud Platform
            </div>
            <div style={{ fontSize: '13px', color: colors.textMuted, fontFamily: '"JetBrains Mono"', marginTop: 8 }}>
              Kubernetes + Dapr
              <br />Event-driven control
              <br />Real-time telemetry
            </div>
          </div>

          <div style={{ fontSize: '28px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>{'\u2192'}</div>

          {/* Grid Services */}
          <div style={{
            background: colors.surface, borderRadius: 12, padding: '20px',
            border: `1px solid ${colors.surfaceLight}`, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {[
              { label: 'Frequency Regulation', color: colors.danger },
              { label: 'Peak Shaving', color: colors.accent },
              { label: 'Energy Arbitrage', color: colors.success },
              { label: 'Demand Response', color: colors.primary },
            ].map((s) => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: '50%',
                  background: s.color, boxShadow: `0 0 8px ${s.color}60`,
                }} />
                <span style={{ fontSize: '15px', color: colors.text, fontFamily: '"Inter"', fontWeight: 500 }}>
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
        <GlowText size="40px" style={{ marginBottom: 32 }}>
          Speak<span style={{ color: colors.secondary }}>ing</span> Your Language
        </GlowText>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, maxWidth: 780, alignItems: 'start' }}>
          <div style={{
            background: colors.surface, borderRadius: 12, padding: '24px',
            border: `1px solid ${colors.danger}20`,
          }}>
            <div style={{
              fontSize: '14px', fontWeight: 600, color: colors.danger,
              fontFamily: '"JetBrains Mono"', letterSpacing: '0.1em', marginBottom: 16,
            }}>
              TRADITIONAL GRID
            </div>
            {['Monolith architecture', 'Few large generators', 'Manual scaling', 'Single points of failure', 'No observability'].map((item) => (
              <div key={item} style={{
                fontSize: '15px', color: colors.textMuted, fontFamily: '"Inter"',
                padding: '6px 0', borderBottom: `1px solid ${colors.surfaceLight}`,
              }}>
                {item}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', paddingTop: 80, fontSize: '28px', color: colors.primary, fontFamily: '"JetBrains Mono"' }}>
            {'\u2192'}
          </div>

          <div style={{
            background: `${colors.success}06`, borderRadius: 12, padding: '24px',
            border: `1px solid ${colors.success}25`,
          }}>
            <div style={{
              fontSize: '14px', fontWeight: 600, color: colors.success,
              fontFamily: '"JetBrains Mono"', letterSpacing: '0.1em', marginBottom: 16,
            }}>
              VIRTUAL POWER PLANT
            </div>
            {['Distributed microservices', 'Millions of nodes', 'Autoscaling capacity', 'Resilient by design', 'Full-stack observability'].map((item) => (
              <div key={item} style={{
                fontSize: '15px', color: colors.text, fontFamily: '"Inter"',
                fontWeight: 500, padding: '6px 0', borderBottom: `1px solid ${colors.surfaceLight}`,
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>
        <div style={{
          marginTop: 24, textAlign: 'center', fontSize: '16px',
          color: colors.textMuted, fontFamily: '"JetBrains Mono"',
        }}>
          Grid frequency = SLO &nbsp;&bull;&nbsp; Cascade = unhandled failure propagation &nbsp;&bull;&nbsp; Batteries = autoscaling
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 16: Architecture ── */
    <Slide key="architecture" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <GlowText size="40px" style={{ marginBottom: 24 }}>
          Architecture
        </GlowText>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          {architectureLayers.map((layer) => (
            <div key={layer.title} style={{
              background: colors.surface, borderRadius: 12,
              border: `1px solid ${layer.color}25`, padding: '20px', flex: 1, minWidth: 170,
            }}>
              <div style={{
                fontSize: '14px', fontWeight: 700, color: layer.color,
                fontFamily: '"JetBrains Mono"', letterSpacing: '0.08em',
                textTransform: 'uppercase', marginBottom: 12,
                paddingBottom: 8, borderBottom: `1px solid ${layer.color}20`,
              }}>
                {layer.title}
              </div>
              {layer.items.map((item) => (
                <div key={item} style={{
                  fontSize: '13px', color: colors.textMuted, fontFamily: '"Inter"',
                  padding: '5px 0', display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <div style={{ width: 4, height: 4, borderRadius: 2, background: layer.color, opacity: 0.6 }} />
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
        <GlowText size="44px" style={{ marginBottom: 28 }}>
          Why Cloud-Native?
        </GlowText>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 780 }}>
          {cloudNativeReasons.map((item) => (
            <div key={item.title} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0' }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%',
                background: item.color, marginTop: 6, flexShrink: 0,
                boxShadow: `0 0 10px ${item.color}60`,
              }} />
              <div>
                <div style={{ fontSize: '17px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: '14px', color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.4 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Badge color={colors.danger}>LIVE SIMULATION</Badge>
          <GlowText size="36px" color={colors.danger}>
            Cascading Failure — No VPP
          </GlowText>
        </div>
        <Subtitle size="16px">
          A generator trips in Essen. Watch the cascade propagate across the German grid.
        </Subtitle>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <Badge color={colors.success}>LIVE SIMULATION</Badge>
          <GlowText size="36px" color={colors.success}>
            Same Failure — With VPP
          </GlowText>
        </div>
        <Subtitle size="16px">
          Same generator trip. But now 18 VPP clusters with distributed batteries respond.
        </Subtitle>
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center' }}>
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
        <GlowText size="44px" style={{ marginBottom: 36, textAlign: 'center' }}>
          The Numbers at Scale
        </GlowText>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          <StatCard number="$5.9B" label="Global VPP Market by 2030" color={colors.primary} />
          <StatCard number="80-160" unit=" GW" label="US DOE VPP Target by 2030" color={colors.success} />
          <StatCard number="1M+" label="Home Batteries in Germany" color={colors.accent} />
        </div>
        <Appear>
          <div style={{
            marginTop: 32, textAlign: 'center', padding: '24px 32px',
            background: colors.surface, borderRadius: 12, border: `1px solid ${colors.primary}20`,
          }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.6 }}>
              1 million batteries coordinated as VPPs = <span style={{ color: colors.primary, fontWeight: 800 }}>10+ GW</span> of flexible capacity
              <br />
              <span style={{ fontSize: '18px', color: colors.textMuted, fontWeight: 400 }}>
                Equivalent to 10 large gas power plants. Running on Kubernetes.
              </span>
            </div>
          </div>
        </Appear>
      </SlideContainer>
    </Slide>,
  ];
}
