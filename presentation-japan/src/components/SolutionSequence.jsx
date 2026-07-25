import React from 'react';
import StepBridge from './StepBridge.jsx';
import VPPArchitecture from '../../../presentation/src/components/VPPArchitecture.jsx';
import AnimatedStatBox, { STAT_COLORS } from './AnimatedStatBox.jsx';

const H = ({ children, color = 'var(--color-heading)', size = '40px' }) => (
  <div style={{ fontSize: size, fontWeight: 800, lineHeight: 1.1, marginBottom: 8, color, fontFamily: 'Space Grotesk, sans-serif' }}>
    {children}
  </div>
);
const Sub = ({ children, color = 'var(--color-text)', size = '20px' }) => (
  <div style={{ fontSize: size, color, fontFamily: 'Inter, sans-serif', lineHeight: 1.5, marginBottom: 12 }}>{children}</div>
);

const TeaserMap = () => (
  <svg width="100%" height="360" viewBox="0 0 500 360">
    <circle cx="200" cy="120" r="6" fill="#22d3ee" />
    <text x="215" y="125" fill="#4B5563" fontFamily="Inter, sans-serif" fontSize="14">Kansai</text>
    <circle cx="150" cy="240" r="6" fill="#10b981" />
    <text x="165" y="245" fill="#4B5563" fontFamily="Inter, sans-serif" fontSize="14">Kyushu</text>
    <path d="M 200 120 Q 175 180 150 240" stroke="#3939D8" strokeWidth="2" fill="none" strokeDasharray="4 4" />
  </svg>
);

const SolutionSequence = ({ height = 600 }) => {
  return (
    <StepBridge count={8}>
      {(step) => (
        <div style={{ height, padding: '20px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 12 }}>
          {step === 0 && (
            <div>
              <H>Virtual Power Plant: Japan Edition</H>
              <Sub size="20px">100,000 Japanese homes with batteries + EVs + heat pumps, coordinated by software to act as a single dispatchable generator.</Sub>
              <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <AnimatedStatBox stat="100K" label="Homes = 1 power plant" color={STAT_COLORS.cyan} animateIn delay={0} />
                <AnimatedStatBox stat="500ms" label="Dispatch latency" color={STAT_COLORS.green} animateIn delay={100} />
                <AnimatedStatBox stat="0" label="Emissions added" color={STAT_COLORS.amber} animateIn delay={200} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <H color="#FFA35F">100,000 Unreliable Edge Devices</H>
              <Sub size="20px">
                Home batteries drop offline. EVs disconnect mid-charge. Wi-Fi flakes out. This isn't a power plant —
                it's a distributed system of unreliable nodes that has to behave like one.
              </Sub>
            </div>
          )}

          {step === 2 && (
            <div>
              <H size="32px">Energy Market → Gateway → Controller → Cloud → 100K Homes</H>
              <div style={{ marginTop: 12, height: height - 140 }}>
                <VPPArchitecture />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <H>Cloud-Native Patterns You Already Know</H>
              <div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {['Dapr Actors', 'CQRS', 'Kafka', 'MQTT / EMQX', 'ArgoCD', 'Spark', 'OpenTelemetry'].map(tech => (
                  <div key={tech} style={{ background: '#0f172a', border: '1px solid #3939D825', borderRadius: 6, padding: '8px 16px', fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#22d3ee', fontWeight: 600 }}>{tech}</div>
                ))}
              </div>
              <div style={{ marginTop: 20, background: '#0f172a', borderRadius: 10, padding: '20px 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: 15, color: '#22d3ee', lineHeight: 1.8 }}>
                <div style={{ color: '#64748b', marginBottom: 8 }}>// One actor = one device state</div>
                <div><span style={{ color: '#FFC217' }}>await</span> actor.getState(deviceId)</div>
                <div><span style={{ color: '#FFC217' }}>await</span> actor.invoke(deviceId, <span style={{ color: '#FFA35F' }}>dispatch</span>, mw: 5)</div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <H color="#22d3ee">Fault Tolerance, Not Redundancy</H>
              <Sub size="20px">A grid can't wait for a retry timeout. The dispatch loop has to keep working when devices vanish.</Sub>
              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                <div style={{ background: '#0f172a', border: '1px solid #22d3ee30', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: '#22d3ee', marginBottom: 6 }}>Retries with backoff</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--color-text)' }}>Dropped commands re-fire without flooding the broker.</div>
                </div>
                <div style={{ background: '#0f172a', border: '1px solid #FFA35F30', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: '#FFA35F', marginBottom: 6 }}>Graceful device loss</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--color-text)' }}>The dispatch plan rebalances around whoever's still online.</div>
                </div>
                <div style={{ background: '#0f172a', border: '1px solid #10b98130', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: '#10b981', marginBottom: 6 }}>Eventual consistency</div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 13, color: 'var(--color-text)' }}>Meter state reconciles on reconnect — the grid doesn't wait for it.</div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div>
              <H>Observability: The Regulator's Requirement</H>
              <Sub size="18px">OpenTelemetry traces every dispatch, every response, every decision</Sub>
              <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
                <AnimatedStatBox stat="OTel" label="Traces + metrics + logs" color={STAT_COLORS.cyan} animateIn delay={0} />
                <AnimatedStatBox stat="100%" label="Dispatch auditability" color={STAT_COLORS.green} animateIn delay={100} />
                <AnimatedStatBox stat="∞" label="Time-travel debugging" color={STAT_COLORS.amber} animateIn delay={200} />
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <H>GitOps for Grid Firmware</H>
              <Sub size="18px">100,000 home devices. Changes must be: atomic, reversible, auditable, zero-downtime during grid events.</Sub>
              <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: '#3939D815', border: '1px solid #3939D840', borderRadius: 10, padding: '18px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#3939D8', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6 }}>ArgoCD</div>
                  <div style={{ fontSize: 14, color: '#cbd5e1', fontFamily: 'Inter, sans-serif' }}>Declarative, idempotent rollouts</div>
                </div>
                <div style={{ background: '#FFC21715', border: '1px solid #FFC21740', borderRadius: 10, padding: '18px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#FFC217', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 6 }}>GitOps</div>
                  <div style={{ fontSize: 14, color: '#cbd5e1', fontFamily: 'Inter, sans-serif' }}>Every config change audited in git</div>
                </div>
              </div>
            </div>
          )}

          {step === 7 && (
            <div>
              <H>See It Dispatch Live</H>
              <TeaserMap />
              <Sub size="16px" color="var(--color-muted)">This map keeps going... see the full dispatch simulation in my extended session.</Sub>
            </div>
          )}
        </div>
      )}
    </StepBridge>
  );
};

export default SolutionSequence;
