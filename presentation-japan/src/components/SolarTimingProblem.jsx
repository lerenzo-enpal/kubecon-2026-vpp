import React, { useEffect, useRef, useState } from 'react';

// 24-hour x-axis. Household demand is a two-peak curve (morning + evening).
// Solar generation is a bell curve centered at noon. The mismatch is the point.
const HOURS = Array.from({ length: 25 }, (_, i) => i);
const demand = (h) => {
  const morning = Math.exp(-((h - 7.5) ** 2) / 2.2) * 0.55;
  const evening = Math.exp(-((h - 19) ** 2) / 3.0) * 0.95;
  const base = 0.28;
  return Math.min(1, base + morning + evening);
};
const solar = (h) => {
  if (h < 6 || h > 19) return 0;
  return Math.exp(-((h - 12.5) ** 2) / 6.0) * 0.9;
};

const W = 1040;
const H = 460;
const PAD = { l: 68, r: 40, t: 40, b: 60 };
const plotW = W - PAD.l - PAD.r;
const plotH = H - PAD.t - PAD.b;
const x = (h) => PAD.l + (h / 24) * plotW;
const y = (v) => PAD.t + plotH - v * plotH;

function pathFor(fn) {
  return HOURS.map((h, i) => `${i === 0 ? 'M' : 'L'} ${x(h).toFixed(2)} ${y(fn(h)).toFixed(2)}`).join(' ');
}
function areaFor(fn) {
  const line = HOURS.map((h) => `L ${x(h).toFixed(2)} ${y(fn(h)).toFixed(2)}`).join(' ');
  return `M ${x(0)} ${y(0)} ${line} L ${x(24)} ${y(0)} Z`;
}

// Regions where the two curves misalign.
// Surplus = solar generation exceeds demand's midday floor and would be curtailed.
const SURPLUS_HOURS = HOURS.filter((h) => solar(h) > 0.35 && demand(h) < 0.6);
const UNMET_HOURS = HOURS.filter((h) => h >= 17 && h <= 21);

export default function SolarTimingProblem({ step = 0 }) {
  const [t, setT] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => { setT((now - start) / 1000); raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const showDemand = step >= 0;
  const showSolar = step >= 1;
  const showMismatch = step >= 2;
  const showBattery = step >= 3;

  // Sun sweep — a small emoji-free sun dot walking along the solar curve.
  const sunH = ((t * 1.4) % 24);
  const sunV = solar(sunH);

  // Battery-shift arrow: pulls a curl of surplus at ~12:00 into a bump at ~19:00.
  const arrowPulse = (Math.sin(t * 1.6) + 1) / 2; // 0..1

  return (
    <section data-testid="solar-timing-problem" style={{ position: 'relative', width: '100%', height: '100%', background: 'var(--color-washi-paper)', overflow: 'hidden' }}>
      <div style={{ padding: '32px 40px 0' }}>
        <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '0.16em', fontSize: 13 }}>PROOF 1 · THE TIMING PROBLEM</div>
        <h1 style={{ margin: '10px 0 0', color: 'var(--color-washi-ink)', fontFamily: 'var(--font-heading)', fontSize: 44, lineHeight: 1.08 }}>Solar generates when we don't need it.</h1>
        <p style={{ margin: '10px 0 0', maxWidth: 780, color: 'var(--color-washi-ink)', fontFamily: 'var(--font-body)', fontSize: 20, lineHeight: 1.42, opacity: 0.82 }}>
          {step === 0 && 'A household consumes power in two peaks — morning routine and evening.'}
          {step === 1 && 'Solar generation is a single bell centered at noon. It does not line up with when people are home.'}
          {step === 2 && 'Midday: rooftops produce more than the neighborhood is using. Evening: demand climbs while the sun is gone.'}
          {step === 3 && 'A battery bridges the gap. Solar at noon is stored and released into the evening peak.'}
        </p>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxHeight: 480, marginTop: 6 }} aria-hidden="true">
        <defs>
          <linearGradient id="solarFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-washi-solar)" stopOpacity="0.55" />
            <stop offset="1" stopColor="var(--color-washi-solar)" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="demandFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--color-primary)" stopOpacity="0.28" />
            <stop offset="1" stopColor="var(--color-primary)" stopOpacity="0.02" />
          </linearGradient>
          <marker id="arrowHead" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--color-washi-alert)" />
          </marker>
        </defs>

        {/* axes */}
        {[0, 6, 12, 18, 24].map((h) => (
          <g key={h}>
            <line x1={x(h)} y1={PAD.t} x2={x(h)} y2={PAD.t + plotH} stroke="var(--color-washi-ink)" strokeOpacity="0.08" strokeDasharray="2 4" />
            <text x={x(h)} y={PAD.t + plotH + 22} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--color-washi-ink)" opacity="0.55">
              {h === 0 || h === 24 ? '00' : h.toString().padStart(2, '0')}:00
            </text>
          </g>
        ))}
        <text x={x(12)} y={H - 18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--color-washi-ink)" opacity="0.55">HOUR OF DAY</text>
        <line x1={PAD.l} y1={PAD.t + plotH} x2={W - PAD.r} y2={PAD.t + plotH} stroke="var(--color-washi-ink)" strokeOpacity="0.35" />

        {/* SURPLUS + UNMET highlights */}
        {showMismatch && (
          <g style={{ transition: 'opacity 500ms' }}>
            {SURPLUS_HOURS.length > 0 && (
              <rect
                x={x(SURPLUS_HOURS[0])}
                y={PAD.t}
                width={x(SURPLUS_HOURS[SURPLUS_HOURS.length - 1] + 1) - x(SURPLUS_HOURS[0])}
                height={plotH}
                fill="var(--color-washi-solar)"
                opacity="0.16"
              />
            )}
            <rect
              x={x(UNMET_HOURS[0])}
              y={PAD.t}
              width={x(UNMET_HOURS[UNMET_HOURS.length - 1] + 1) - x(UNMET_HOURS[0])}
              height={plotH}
              fill="var(--color-washi-alert)"
              opacity="0.13"
            />
            <text x={x(12)} y={PAD.t + 26} textAnchor="middle" fontFamily="var(--font-mono)" fill="var(--color-washi-solar)" fontSize="12" letterSpacing="0.12em">SURPLUS · CURTAILED</text>
            <text x={x(19)} y={PAD.t + 26} textAnchor="middle" fontFamily="var(--font-mono)" fill="var(--color-washi-alert)" fontSize="12" letterSpacing="0.12em">UNMET · PEAK</text>
          </g>
        )}

        {/* Demand curve */}
        {showDemand && (
          <g style={{ opacity: showDemand ? 1 : 0, transition: 'opacity 500ms' }}>
            <path d={areaFor(demand)} fill="url(#demandFill)" />
            <path d={pathFor(demand)} fill="none" stroke="var(--color-primary)" strokeWidth="3.5" strokeLinecap="round" />
            <text x={x(20.5)} y={y(demand(19)) - 12} fontFamily="var(--font-mono)" fill="var(--color-primary)" fontSize="14" fontWeight="700">HOUSEHOLD DEMAND</text>
          </g>
        )}

        {/* Solar curve */}
        {showSolar && (
          <g style={{ opacity: showSolar ? 1 : 0, transition: 'opacity 500ms' }}>
            <path d={areaFor(solar)} fill="url(#solarFill)" />
            <path d={pathFor(solar)} fill="none" stroke="var(--color-washi-solar)" strokeWidth="3.5" strokeLinecap="round" />
            <text x={x(12)} y={y(solar(12)) - 14} textAnchor="middle" fontFamily="var(--font-mono)" fill="var(--color-washi-solar)" fontSize="14" fontWeight="700">SOLAR GENERATION</text>
            {/* sun sweep */}
            <circle cx={x(sunH)} cy={y(sunV)} r={7} fill="var(--color-washi-solar)" stroke="var(--color-washi-paper)" strokeWidth="2" />
          </g>
        )}

        {/* Battery shift arrow */}
        {showBattery && (() => {
          const fromH = 12;
          const toH = 19;
          const fromX = x(fromH);
          const toX = x(toH);
          const midX = (fromX + toX) / 2;
          const fromY = y(solar(fromH)) - 10;
          const toY = y(demand(toH)) - 22;
          const curveMidY = Math.min(fromY, toY) - 90;
          const dashOffset = -80 * arrowPulse;
          return (
            <g>
              <path
                d={`M ${fromX} ${fromY} Q ${midX} ${curveMidY} ${toX} ${toY}`}
                fill="none"
                stroke="var(--color-washi-alert)"
                strokeWidth="3"
                strokeDasharray="8 6"
                strokeDashoffset={dashOffset}
                markerEnd="url(#arrowHead)"
              />
              <g transform={`translate(${midX - 60}, ${curveMidY - 26})`}>
                <rect x="0" y="0" width="120" height="34" rx="4" fill="var(--color-washi-paper)" stroke="var(--color-washi-alert)" strokeWidth="1.5" />
                <text x="60" y="21" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--color-washi-alert)" letterSpacing="0.12em">BATTERY SHIFT</text>
              </g>
            </g>
          );
        })()}
      </svg>

      {/* Stepper hint */}
      <div style={{ position: 'absolute', right: 32, top: 36, fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', letterSpacing: '0.14em', fontSize: 12 }}>
        STEP {step + 1} · OF 4
      </div>
    </section>
  );
}
