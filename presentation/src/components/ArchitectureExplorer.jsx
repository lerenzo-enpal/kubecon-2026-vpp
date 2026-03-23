import React, { useMemo } from 'react';
import { colors } from '../theme';
import { Corners } from './ui';
import EnpalArchitectureDiagram from './EnpalArchitectureDiagram';

/**
 * ArchitectureExplorer — Zoom + HUD overlay on the architecture diagram
 *
 * Wraps EnpalArchitectureDiagram and adds:
 * - Smooth CSS transform zoom to focus on specific node clusters
 * - HUD info panels that fly in from the side with deep-dive content
 * - Targeting reticle at the focus point
 */

const DIAGRAM_W = 1366;
const DIAGRAM_H = 528;

// Focus areas: each defines a cluster of nodes to zoom into
const FOCUS_STEPS = [
  {
    id: 'overview',
    label: null,
    zoom: 1,
    cx: 0.5,
    cy: 0.5,
    panel: null,
  },
  {
    id: 'home',
    label: 'HOME SYSTEM',
    zoom: 2.0,
    cx: 0.35,  // center on IoT HEMS node
    cy: 0.35,
    panelSide: 'right',
    panelColor: colors.success,
    title: 'Edge Intelligence',
    subtitle: 'Enpal.One — IoT HEMS',
    bullets: [
      'Local energy management — runs without cloud',
      'WISH protocol resolves competing commands',
      'Telemetry every 20s via MQTT',
    ],
    stats: [
      { label: 'DEVICES', value: '5-6', color: colors.success },
      { label: 'LATENCY', value: '<100ms', color: colors.primary },
    ],
  },
  {
    id: 'mqtt',
    label: 'MESSAGE BROKER',
    zoom: 1.6,
    cx: 0.48,
    cy: 0.43,
    panelSide: 'left',
    panelColor: colors.primary,
    title: 'Choreography over Orchestration',
    subtitle: 'EMQX — MQTT Broker',
    bullets: [
      'Pub/sub QoS 1 — no central coordinator',
      'Scales linearly: 100K independent channels',
      'Cloud HEMS: Dapr Actors, one per home',
    ],
    stats: [
      { label: 'CONNECTIONS', value: '100K+', color: colors.primary },
      { label: 'MODEL', value: 'Choreo', color: colors.success },
    ],
    extra: {
      title: 'Why Not Stronger Consistency?',
      rows: [
        { model: 'Choreography', note: 'Current — scales to millions', active: true },
        { model: 'Eventual', note: 'No shared mutable state between devices' },
        { model: 'Strong', note: 'Would bottleneck at fleet scale' },
      ],
    },
  },
  {
    id: 'pipeline',
    label: 'DATA PIPELINE',
    zoom: 2.2,
    cx: 0.78,
    cy: 0.35,
    panelSide: 'left',
    panelColor: '#FF3621',
    title: 'Streaming at Scale',
    subtitle: 'Spark + Databricks',
    bullets: [
      'Raw → Bronze → Silver → Gold lakehouse',
      'Spark streaming aggregates in near-real-time',
      '5M+ measurements/min, storage reduced 10x',
    ],
    stats: [
      { label: 'THROUGHPUT', value: '5M/min', color: '#FF3621' },
      { label: 'LATENCY', value: '<5s', color: '#E25A1C' },
    ],
  },
  {
    id: 'flexa',
    label: 'VPP CONTROLLER',
    zoom: 1.25,
    cx: 0.60,
    cy: 0.55,
    panelSide: 'left',
    panelColor: colors.accent,
    title: 'The Control Loop',
    subtitle: 'Flexa — Enpal + Entrix',
    bullets: [
      'Flexa → Event Hub → Cloud HEMS → EMQX → device',
      'Full loop in under 2 seconds',
      'ArgoCD GitOps: fleet config as code',
    ],
    stats: [
      { label: 'LOOP TIME', value: '<2s', color: colors.success },
      { label: 'DEPLOY', value: 'ArgoCD', color: colors.accent },
    ],
  },
];

export default function ArchitectureExplorer({ step = 0 }) {
  const focus = FOCUS_STEPS[Math.min(step, FOCUS_STEPS.length - 1)];
  const isOverview = step === 0;

  // CSS transform to zoom into the focus area
  const transform = useMemo(() => {
    if (isOverview) return 'scale(1) translate(0, 0)';
    // Center the focus point in the viewport
    const tx = (0.5 - focus.cx) * 100;
    const ty = (0.5 - focus.cy) * 100;
    return `scale(${focus.zoom}) translate(${tx}%, ${ty}%)`;
  }, [focus, isOverview]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ paddingTop: 110 }}>
      {/* Diagram with zoom transform */}
      <div style={{
        width: '100%',
        height: '100%',
        transform,
        transformOrigin: 'center center',
        transition: 'transform 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>
        <EnpalArchitectureDiagram width={DIAGRAM_W} height={DIAGRAM_H} />
      </div>

      {/* Dimming overlay when zoomed (darkens non-focus areas) */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: isOverview ? 'transparent' : 'radial-gradient(ellipse 40% 50% at 50% 50%, transparent 0%, rgba(10,14,23,0.6) 100%)',
        transition: 'background 0.8s ease',
      }} />

      {/* Focus label badge (below title area) */}
      {focus.label && (
        <div className="absolute left-4 z-20" style={{ top: 118,
          opacity: isOverview ? 0 : 1,
          transform: isOverview ? 'translateY(-10px)' : 'translateY(0)',
          transition: 'all 0.6s ease 0.4s',
        }}>
          <div className="rounded px-3 py-1" style={{
            background: 'rgba(5,8,16,0.9)',
            border: `1px solid ${focus.panelColor}40`,
          }}>
            <div className="text-xs font-mono font-semibold tracking-widest" style={{ color: focus.panelColor }}>{focus.label}</div>
          </div>
        </div>
      )}

      {/* Info panel (flies in from left or right) */}
      {focus.panel !== null && focus.panelSide && (
        <div className="absolute z-20 rounded-lg overflow-hidden" style={{
          top: 160, bottom: 40,
          [focus.panelSide === 'right' ? 'right' : 'left']: 16,
          width: 420,
          opacity: isOverview ? 0 : 1,
          transform: isOverview
            ? `translateX(${focus.panelSide === 'right' ? '60px' : '-60px'})`
            : 'translateX(0)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.3s',
          pointerEvents: isOverview ? 'none' : 'auto',
          background: 'rgba(5, 8, 16, 0.94)',
          border: `1px solid ${focus.panelColor}35`,
          boxShadow: `0 0 30px ${focus.panelColor}15, inset 0 0 20px ${focus.panelColor}05`,
          backdropFilter: 'blur(12px)',
          padding: '16px 20px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div>
            <Corners color={focus.panelColor + '50'} size={10} />

            {/* Title */}
            <div className="text-sm font-mono font-semibold tracking-widest uppercase mb-1" style={{ color: focus.panelColor }}>{focus.subtitle}</div>
            <div className="text-2xl font-extrabold font-sans leading-tight mb-3" style={{ color: colors.text }}>{focus.title}</div>

            {/* Stats row */}
            {focus.stats && (
              <div className="flex gap-4 mb-3">
                {focus.stats.map((s, i) => (
                  <div key={i} className="rounded px-3 py-1.5" style={{ background: s.color + '0a', border: `1px solid ${s.color}20` }}>
                    <div className="text-xs font-mono tracking-wider uppercase" style={{ color: colors.textDim }}>{s.label}</div>
                    <div className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Bullets */}
            <div className="flex flex-col gap-2">
              {focus.bullets.map((b, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="mt-2 w-2 h-2 rounded-full shrink-0" style={{ background: focus.panelColor + '80' }} />
                  <div className="text-base text-hud-text-muted font-sans leading-relaxed">{b}</div>
                </div>
              ))}
            </div>

            {/* Extra content (consistency comparison for MQTT) */}
            {focus.extra && (
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${colors.surfaceLight}` }}>
                <div className="text-xs font-mono font-semibold tracking-wider uppercase mb-2" style={{ color: colors.textDim }}>{focus.extra.title}</div>
                {focus.extra.rows.map((r, i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <div className="text-sm font-mono font-semibold w-24" style={{ color: r.active ? colors.success : colors.textDim }}>{r.model}</div>
                    <div className="text-sm font-sans" style={{ color: r.active ? colors.textMuted : colors.textDim }}>{r.note}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
