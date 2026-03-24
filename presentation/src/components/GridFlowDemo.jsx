import React, { useState, useEffect, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// ─── Connection path data ───
// phase: 'trans' = HV backbone (step 2), 'dist' = substation + distribution (step 3)
const CONN = [
  { d: 'M 200 135 L 290 98', group: 'hv', phase: 'trans', wd: 0 },
  { d: 'M 170 410 L 290 155', group: 'hv', phase: 'trans', wd: 0.05 },
  { d: 'M 335 85 L 445 85', group: 'hv', phase: 'trans', wd: 0.2 },
  { d: 'M 335 98 L 445 98', group: 'hv', phase: 'trans', wd: 0.22 },
  { d: 'M 335 111 L 445 111', group: 'hv', phase: 'trans', wd: 0.24 },
  { d: 'M 485 98 L 590 158', group: 'hv', phase: 'dist', wd: 0.4 },
  { d: 'M 710 155 Q 760 155 810 110', group: 'dist', phase: 'load', wd: 0.58 },
  { d: 'M 710 155 Q 770 155 920 125', group: 'dist', phase: 'load', wd: 0.63 },
  { d: 'M 710 155 Q 790 145 1110 198', group: 'dist', phase: 'load', wd: 0.72 },
  { d: 'M 710 175 Q 780 240 855 340', group: 'dist', phase: 'load', wd: 0.61 },
  { d: 'M 710 165 Q 750 145 810 55', group: 'dist', phase: 'load', wd: 0.56 },
];
const CONN_TRANS = CONN.filter(c => c.phase === 'trans');
const CONN_DIST = CONN.filter(c => c.phase === 'dist');
const CONN_LOAD = CONN.filter(c => c.phase === 'load');

const PHASES = [
  { label: 'Generation', sub: 'Few, large, centralized', color: colors.accent },
  { label: 'Transmission', sub: 'High-voltage backbone', color: colors.secondary },
  { label: 'Distribution', sub: 'One-way power flow', color: colors.primary },
  { label: 'Consumers', sub: 'Passive loads', color: colors.textDim },
];

// ─── Draw animation helpers ───
// Stroke-draw only (fill="none" elements)
function dS(on, delay, dur = 0.6) {
  const base = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `drawStroke ${dur}s ease ${delay}s forwards` };
}

// Stroke-draw + fill-reveal (filled elements)
function dSF(on, delay, dur = 0.6, fillDelay) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `drawStroke ${dur}s ease ${delay}s forwards, fillReveal 0.3s ease ${fd}s forwards` };
}

// Digital flicker for text labels
function flk(on, delay) {
  if (!on) return { opacity: 0 };
  return { opacity: 0, animation: `hudFlicker 0.5s ease ${delay}s forwards` };
}

// ─── Main component ───
export default function GridFlowDemo({ width = '100%' }) {
  const [step, setStep] = useState(0);
  const [litMap, setLitMap] = useState({});
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    if (slideContext?.isSlideActive) setStep(0);
  }, [slideContext?.isSlideActive]);

  useEffect(() => {
    if (!slideContext?.isSlideActive) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' && step < 5) {
        e.stopPropagation(); e.preventDefault();
        setStep(s => s + 1);
      } else if (e.key === 'ArrowLeft' && step > 0) {
        e.stopPropagation(); e.preventDefault();
        setStep(s => s - 1);
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [slideContext?.isSlideActive, step]);

  const c = colors.primary;
  const drawPlants = step >= 1;
  const drawTrans = step >= 2;
  const drawDist = step >= 3;
  const drawConsumers = step >= 4;
  const flowing = step >= 5;

  // Cascade energized states as energy arrives at each element
  useEffect(() => {
    if (step < 5) { setLitMap({}); return; }
    const cascade = [
      ['towers',    220],
      ['substation', 580],
      ['shopping',  780],
      ['house1',    800],
      ['factory',   830],
      ['house2',    850],
      ['house3',    900],
      ['apartment', 1020],
    ];
    const timers = cascade.map(([id, ms]) =>
      setTimeout(() => setLitMap(m => ({ ...m, [id]: true })), ms)
    );
    return () => timers.forEach(clearTimeout);
  }, [step]);

  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>
      <style>{`
        @keyframes drawStroke {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fillReveal {
          to { fill-opacity: 1; }
        }
        @keyframes hudFlicker {
          0% { opacity: 0; }
          10% { opacity: 0.7; }
          18% { opacity: 0.1; }
          30% { opacity: 0.85; }
          42% { opacity: 0.25; }
          58% { opacity: 1; }
          100% { opacity: 1; }
        }
        @keyframes labelFlash {
          0% { opacity: 0; }
          8% { opacity: 0.8; }
          16% { opacity: 0.15; }
          30% { opacity: 0.9; }
          50% { opacity: 0.7; }
          70% { opacity: 0.25; }
          100% { opacity: 0; }
        }
        @keyframes energyPulse {
          0% { stroke-dashoffset: 1; opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { stroke-dashoffset: -0.12; opacity: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes coilPulse {
          0%, 100% { stroke: ${c}90; filter: none; }
          50% { stroke: ${c}; filter: url(#gf); }
        }
        @keyframes flowDash { to { stroke-dashoffset: -18; } }
        @keyframes arcFlicker {
          0%, 100% { opacity: 0; }
          15% { opacity: 0.7; }
          30% { opacity: 0; }
          60% { opacity: 0.5; }
          75% { opacity: 0; }
        }
      `}</style>

      <div style={{ flex: 1, minHeight: 0, willChange: 'transform', transform: 'translateZ(0)' }}>
        <svg viewBox="0 0 1200 480" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="gf"><feGaussianBlur stdDeviation="1.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="wg"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            {/* Graph paper grid pattern */}
            <pattern id="gridSmall" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke={c} strokeWidth="0.3" opacity="0.07" />
            </pattern>
            <pattern id="gridLarge" width="120" height="120" patternUnits="userSpaceOnUse">
              <rect width="120" height="120" fill="url(#gridSmall)" />
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke={c} strokeWidth="0.5" opacity="0.09" />
            </pattern>
            {/* Radial mask — stronger center, weaker edges */}
            <radialGradient id="gridMask" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="white" stopOpacity="0.6" />
              <stop offset="50%" stopColor="white" stopOpacity="0.35" />
              <stop offset="100%" stopColor="white" stopOpacity="0.05" />
            </radialGradient>
            <mask id="gridFade">
              <rect width="1200" height="480" fill="url(#gridMask)" />
            </mask>
          </defs>

          {/* Graph paper background with radial fade */}
          <rect width="1200" height="480" fill="url(#gridLarge)" mask="url(#gridFade)" />

          {/* ═══ STEP 1: POWER PLANTS ═══ */}
          <g style={{ visibility: step >= 1 ? 'visible' : 'hidden' }}>
            <Reticle x={20} y={48} w={190} h={370} c={c} active={drawPlants} delay={0} label="SCANNING: GENERATION" />
            <Plant x={30} y={68} w={165} h={130} c={c} smoking={step >= 5} label="COAL 800MW" type="coal" draw={drawPlants} t0={0.3} />
            <Plant x={30} y={328} w={165} h={130} c={c} smoking={step >= 5} label="GAS 400MW" type="gas" draw={drawPlants} t0={0.65} />
          </g>

          {/* ═══ STEP 2: TRANSMISSION (towers + HV lines) ═══ */}
          <g style={{ visibility: step >= 2 ? 'visible' : 'hidden' }}>
            <Reticle x={280} y={48} w={210} h={200} c={c} active={drawTrans} delay={0} label="MAPPING: HV BACKBONE" />
            <Tower x={315} y={62} h={180} c={c} draw={drawTrans} t0={0.25} energized={!!litMap.towers} />
            <Tower x={465} y={62} h={180} c={c} draw={drawTrans} t0={0.45} energized={!!litMap.towers} />
            {CONN_TRANS.map((p, i) => (
              <path key={`t${i}`} pathLength="1" d={p.d} stroke={c + '25'} strokeWidth="1.2" fill="none"
                style={dS(drawTrans, 0.4 + i * 0.08, 0.5)} />
            ))}
          </g>

          {/* ═══ STEP 3: DISTRIBUTION (substation + dist lines) ═══ */}
          <g style={{ visibility: step >= 3 ? 'visible' : 'hidden' }}>
            <Reticle x={555} y={90} w={200} h={150} c={c} active={drawDist} delay={0} label="LINKING: DISTRIBUTION" />
            <Substation x={590} y={120} w={120} h={100} c={c} draw={drawDist} t0={0.25} energized={!!litMap.substation} />
            {CONN_DIST.map((p, i) => (
              <path key={`d${i}`} pathLength="1" d={p.d} stroke={c + '25'} strokeWidth="1.2" fill="none"
                style={dS(drawDist, 0.5 + i * 0.08, 0.5)} />
            ))}
          </g>

          {/* ═══ STEP 4: CONSUMERS (buildings + load lines, dark) ═══ */}
          <g style={{ visibility: step >= 4 ? 'visible' : 'hidden' }}>
            <Reticle x={760} y={18} w={430} h={440} c={c} active={drawConsumers} delay={0} label="LOCATING: LOAD CENTERS" />
            {CONN_LOAD.map((p, i) => (
              <path key={`l${i}`} pathLength="1" d={p.d} stroke={c + '25'} strokeWidth="1.2" fill="none"
                style={dS(drawConsumers, 0.15 + i * 0.08, 0.5)} />
            ))}
            <ShoppingCenter x={810} y={10} w={195} h={52} c={c} lit={!!litMap.shopping} draw={drawConsumers} t0={0.25} />
            <House x={810} y={82} w={78} h={64} c={c} lit={!!litMap.house1} draw={drawConsumers} t0={0.4} />
            <House x={920} y={100} w={66} h={54} c={c} lit={!!litMap.house2} draw={drawConsumers} t0={0.55} />
            <House x={1028} y={115} w={62} h={50} c={c} lit={!!litMap.house3} draw={drawConsumers} t0={0.7} />
            <Apartment x={1110} y={126} w={65} h={155} c={c} lit={!!litMap.apartment} draw={drawConsumers} t0={0.85} />
            <Factory x={850} y={310} w={185} h={100} c={c} lit={!!litMap.factory} draw={drawConsumers} t0={0.5} />
          </g>

          {/* ═══ STEP 5: ELECTRIFICATION — cascading energy flow ═══ */}
          {flowing && (
            <g>
              {/* Energy pulses — bright segment traveling each line */}
              {CONN.map((p, i) => (
                <path key={`pulse-${i}`} pathLength="1" d={p.d}
                  stroke={c} strokeWidth={p.group === 'hv' ? 3 : 2.5}
                  fill="none" strokeDasharray="0.12 0.88" filter="url(#gf)"
                  style={{ strokeDashoffset: 1, opacity: 0, animation: `energyPulse 0.25s linear ${p.wd}s forwards` }}
                />
              ))}
              {/* Steady flow — appears after each pulse arrives */}
              {CONN.map((p, i) => {
                const flowStart = p.wd + 0.18;
                return (
                  <path key={`flow-${i}`} d={p.d}
                    stroke={c} strokeWidth={p.group === 'hv' ? 2.5 : 2}
                    fill="none" strokeDasharray="8 10" filter="url(#gf)"
                    style={{ opacity: 0, animation: `fadeIn 0.15s ease ${flowStart}s forwards, flowDash ${0.5 + i * 0.03}s linear ${flowStart}s infinite` }}
                  />
                );
              })}
              {/* Arcs — appear when energy hits HV lines between towers */}
              <g style={{ opacity: 0, animation: 'fadeIn 0.15s ease 0.3s forwards' }}>
                {[360, 385, 410, 435].map(ax => (
                  <g key={ax}>
                    <line x1={ax} y1={86} x2={ax + 1} y2={97} stroke={c} strokeWidth="1.2" filter="url(#gf)"
                      style={{ animation: `arcFlicker ${0.4 + (ax % 7) * 0.1}s ease-in-out infinite ${0.3 + ax * 0.003}s` }} />
                    <line x1={ax + 2} y1={99} x2={ax} y2={110} stroke={c} strokeWidth="1" filter="url(#gf)"
                      style={{ animation: `arcFlicker ${0.5 + (ax % 5) * 0.08}s ease-in-out infinite ${0.3 + ax * 0.004 + 0.2}s` }} />
                  </g>
                ))}
              </g>
            </g>
          )}

        </svg>
      </div>

      {/* Bottom phase boxes */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        {PHASES.map((p, i) => {
          const phaseStep = i + 1;
          const active = step >= phaseStep;
          const current = step === phaseStep;
          return (
            <React.Fragment key={i}>
              <div style={{
                flex: 1, textAlign: 'center', padding: '10px 14px',
                borderRadius: 10, fontFamily: '"Inter", sans-serif',
                background: active ? `${p.color}10` : colors.surface,
                border: `1px solid ${active ? p.color + '40' : colors.surfaceLight}`,
                transition: 'all 0.5s ease',
                boxShadow: current ? `0 0 20px ${p.color}18, inset 0 0 20px ${p.color}08` : 'none',
              }}>
                <div style={{ fontSize: 20, fontWeight: 600, color: active ? p.color : colors.textDim, transition: 'color 0.5s ease', textShadow: active ? `0 0 10px ${p.color}60` : 'none' }}>{p.label}</div>
                <div style={{ fontSize: 15, color: active ? colors.textMuted : colors.textDim + '80', marginTop: 3, transition: 'color 0.5s ease' }}>{p.sub}</div>
              </div>
              {i < 3 && (
                <div style={{
                  fontSize: 18, color: step > phaseStep ? c + 'aa' : colors.textDim + '30',
                  fontFamily: '"JetBrains Mono"', paddingBottom: 14,
                  transition: 'color 0.5s ease',
                  textShadow: step > phaseStep ? `0 0 8px ${c}40` : 'none',
                }}>{'\u2192'}</div>
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SVG sub-components with draw-in animations
// ═══════════════════════════════════════════════════════

function Reticle({ x, y, w, h, c, active, delay = 0, label }) {
  const s = 14;
  const hw = w / 2, hh = h / 2;
  const cx = x + hw, cy = y + hh;
  const uid = `ret${Math.round(x)}x${Math.round(y)}`;

  // Each corner: bracket lines + fly-out offset from center
  const corners = [
    { id: 'tl', ox: hw, oy: hh, x1: x, y1: y, hx: x + s, vy: y + s },
    { id: 'tr', ox: -hw, oy: hh, x1: x + w, y1: y, hx: x + w - s, vy: y + s },
    { id: 'bl', ox: hw, oy: -hh, x1: x, y1: y + h, hx: x + s, vy: y + h - s },
    { id: 'br', ox: -hw, oy: -hh, x1: x + w, y1: y + h, hx: x + w - s, vy: y + h - s },
  ];

  return (
    <g>
      {/* Per-corner fly-out keyframes */}
      <style>{corners.map(cr => `
        @keyframes ${uid}_${cr.id} {
          0% { transform: translate(${cr.ox}px, ${cr.oy}px); opacity: 0; }
          10% { opacity: 0.9; }
          60% { transform: translate(0, 0); opacity: 0.7; }
          78% { opacity: 0.12; }
          100% { transform: translate(0, 0); opacity: 0; }
        }
      `).join('')}</style>

      {corners.map(cr => (
        <g key={cr.id} filter="url(#gf)"
          style={active ? { opacity: 0, animation: `${uid}_${cr.id} 0.8s ease ${delay}s forwards` } : { opacity: 0 }}>
          <line x1={cr.x1} y1={cr.y1} x2={cr.hx} y2={cr.y1} stroke={c} strokeWidth="1.2" />
          <line x1={cr.x1} y1={cr.y1} x2={cr.x1} y2={cr.vy} stroke={c} strokeWidth="1.2" />
        </g>
      ))}

      {/* Label flashes at center then fades */}
      {label && (
        <text x={cx} y={cy} fill={c} fontSize="8" fontFamily="JetBrains Mono"
          letterSpacing="0.12em" textAnchor="middle" dominantBaseline="middle"
          style={active ? { opacity: 0, animation: `labelFlash 1s ease ${delay}s forwards` } : { opacity: 0 }}>{label}</text>
      )}
    </g>
  );
}

function House({ x, y, w, h, c, lit, draw, t0 = 0 }) {
  const roofH = h * 0.38;
  const bodyY = y + roofH;
  const bodyH = h * 0.62;
  const winW = w * 0.22;
  const winH = bodyH * 0.32;
  const amber = colors.accent;
  const wf = lit ? amber + 'bb' : '#0a0e18';
  const ws = lit ? amber + '50' : c + '20';

  return (
    <g>
      <polygon pathLength="1" points={`${x},${bodyY} ${x + w / 2},${y} ${x + w},${bodyY}`}
        stroke={c + '50'} strokeWidth="1.2" fill="none" style={dS(draw, t0, 0.5)} />
      <rect pathLength="1" x={x} y={bodyY} width={w} height={bodyH}
        stroke={c + '50'} strokeWidth="1.2" fill={c + '03'} style={dSF(draw, t0 + 0.1, 0.5)} />
      <rect pathLength="1" x={x + w * 0.15} y={bodyY + bodyH * 0.2} width={winW} height={winH}
        fill={wf} stroke={ws} strokeWidth="0.7"
        filter={lit ? 'url(#wg)' : undefined}
        style={{ ...dSF(draw, t0 + 0.35, 0.25, t0 + 0.7), transition: 'fill 0.5s ease, stroke 0.4s ease' }} />
      <rect pathLength="1" x={x + w * 0.62} y={bodyY + bodyH * 0.2} width={winW} height={winH}
        fill={wf} stroke={ws} strokeWidth="0.7"
        filter={lit ? 'url(#wg)' : undefined}
        style={{ ...dSF(draw, t0 + 0.4, 0.25, t0 + 0.75), transition: 'fill 0.5s ease, stroke 0.4s ease' }} />
      <rect pathLength="1" x={x + w * 0.38} y={bodyY + bodyH * 0.55} width={w * 0.24} height={bodyH * 0.45}
        stroke={c + '18'} strokeWidth="0.7" fill="none" style={dS(draw, t0 + 0.45, 0.25)} />
    </g>
  );
}

function Apartment({ x, y, w, h, c, lit, draw, t0 = 0 }) {
  const amber = colors.accent;
  const floors = 5;
  const cols = 3;
  const winW = w * 0.17;
  const winH = h / floors * 0.38;

  return (
    <g>
      <rect pathLength="1" x={x} y={y} width={w} height={h}
        stroke={c + '50'} strokeWidth="1.2" fill={c + '03'} style={dSF(draw, t0, 0.7)} />
      {/* Windows — scan pattern top→bottom, left→right */}
      {Array.from({ length: floors }).map((_, fi) =>
        Array.from({ length: cols }).map((_, ci) => {
          const wx = x + w * 0.1 + ci * (w * 0.28);
          const wy = y + h * 0.06 + fi * (h / floors);
          const isLit = lit && !((fi + ci) % 3 === 2);
          const d = t0 + 0.5 + fi * 0.06 + ci * 0.04;
          return (
            <rect key={`${fi}-${ci}`} pathLength="1" x={wx} y={wy} width={winW} height={winH}
              fill={isLit ? amber + 'bb' : '#0a0e18'}
              stroke={isLit ? amber + '50' : c + '18'}
              strokeWidth="0.6"
              filter={isLit ? 'url(#wg)' : undefined}
              style={{ ...dSF(draw, d, 0.2, d + 0.15), transition: 'fill 0.5s ease, stroke 0.4s ease' }}
            />
          );
        })
      )}
    </g>
  );
}

function Factory({ x, y, w, h, c, lit, draw, t0 = 0 }) {
  const amber = colors.accent;
  const wf = lit ? amber + '66' : '#0a0e18';
  const ws = lit ? amber + '35' : c + '15';
  const stackW = w * 0.07;
  const stackH = h * 0.6;

  return (
    <g>
      <rect pathLength="1" x={x} y={y} width={w} height={h}
        stroke={c + '50'} strokeWidth="1.2" fill={c + '03'} style={dSF(draw, t0, 0.6)} />
      <rect pathLength="1" x={x + w * 0.9} y={y - stackH} width={stackW} height={stackH}
        stroke={c + '50'} strokeWidth="1" fill={c + '03'} style={dSF(draw, t0 + 0.15, 0.4)} />
      <polyline pathLength="1"
        points={`${x},${y} ${x + w * 0.12},${y - 16} ${x + w * 0.24},${y} ${x + w * 0.36},${y - 16} ${x + w * 0.48},${y} ${x + w * 0.6},${y - 16} ${x + w * 0.72},${y} ${x + w * 0.84},${y - 16} ${x + w * 0.84},${y}`}
        stroke={c + '50'} strokeWidth="1" fill="none" style={dS(draw, t0 + 0.25, 0.5)} />
      {[0.06, 0.2, 0.34, 0.48, 0.62].map((pct, i) => (
        <rect key={i} pathLength="1" x={x + w * pct} y={y + h * 0.15} width={w * 0.1} height={h * 0.12}
          fill={wf} stroke={ws} strokeWidth="0.6"
          filter={lit ? 'url(#wg)' : undefined}
          style={{ ...dSF(draw, t0 + 0.5 + i * 0.05, 0.2, t0 + 0.8 + i * 0.05), transition: 'fill 0.5s ease, stroke 0.4s ease' }} />
      ))}
      {[0.06, 0.22, 0.38].map((pct, i) => (
        <rect key={`d${i}`} pathLength="1" x={x + w * pct} y={y + h * 0.55} width={w * 0.12} height={h * 0.45}
          stroke={c + '20'} strokeWidth="0.7" fill="none" style={dS(draw, t0 + 0.6 + i * 0.05, 0.25)} />
      ))}
      {[0.55, 0.68].map((pct, i) => (
        <rect key={`v${i}`} pathLength="1" x={x + w * pct} y={y - 6} width={w * 0.06} height={6}
          stroke={c + '30'} strokeWidth="0.6" fill={c + '05'} style={dSF(draw, t0 + 0.5 + i * 0.1, 0.2)} />
      ))}
    </g>
  );
}

function ShoppingCenter({ x, y, w, h, c, lit, draw, t0 = 0 }) {
  const amber = colors.accent;
  const wf = lit ? amber + '99' : '#0a0e18';

  return (
    <g>
      <rect pathLength="1" x={x} y={y} width={w} height={h}
        stroke={c + '50'} strokeWidth="1.2" fill={c + '03'} style={dSF(draw, t0, 0.5)} />
      <line pathLength="1" x1={x} y1={y + h * 0.65} x2={x + w} y2={y + h * 0.65}
        stroke={c + '35'} strokeWidth="1" style={dS(draw, t0 + 0.2, 0.3)} />
      {[0.04, 0.2, 0.36, 0.52, 0.68, 0.84].map((pct, i) => (
        <rect key={i} pathLength="1" x={x + w * pct} y={y + h * 0.12} width={w * 0.12} height={h * 0.45}
          fill={wf} stroke={lit ? amber + '40' : c + '15'} strokeWidth="0.6"
          filter={lit ? 'url(#wg)' : undefined}
          style={{ ...dSF(draw, t0 + 0.3 + i * 0.04, 0.2, t0 + 0.6 + i * 0.04), transition: 'fill 0.5s ease, stroke 0.4s ease' }} />
      ))}
      <rect pathLength="1" x={x + w * 0.3} y={y - 10} width={w * 0.4} height={10}
        stroke={c + '30'} strokeWidth="0.8" fill={c + '04'} style={dSF(draw, t0 + 0.4, 0.3)} />
    </g>
  );
}

function Plant({ x, y, w, h, c, smoking, label, type = 'coal', draw, t0 = 0 }) {
  const activeFill = smoking ? c + '12' : c + '05';
  const activeStroke = smoking ? c + '80' : c + '60';
  const isCoal = type === 'coal';

  // Label position: centered in main building rect
  const labelX = isCoal ? x + w * 0.25 : x + w * 0.58 + w * 0.16;
  const labelY = isCoal ? y + h * 0.65 : y + h * 0.52 + 6;

  return (
    <g>
      {isCoal ? (
        <CoalPlantBody x={x} y={y} w={w} h={h} c={c} smoking={smoking}
          activeFill={activeFill} activeStroke={activeStroke} draw={draw} t0={t0} />
      ) : (
        <GasPlantBody x={x} y={y} w={w} h={h} c={c} smoking={smoking}
          activeFill={activeFill} activeStroke={activeStroke} draw={draw} t0={t0} />
      )}
      {/* Label — split into two centered lines */}
      <text x={labelX} y={labelY} textAnchor="middle"
        fill={c + 'cc'} fontSize="14" fontWeight="600" fontFamily="JetBrains Mono" letterSpacing="0.08em"
        style={flk(draw, t0 + 0.8)}>
        {label.split(' ').map((word, i, arr) => (
          <tspan key={i} x={labelX} dy={i === 0 ? `${-(arr.length - 1) * 0.5}em` : '1em'}>{word}</tspan>
        ))}
      </text>
    </g>
  );
}

function CoalPlantBody({ x, y, w, h, c, smoking, activeFill, activeStroke, draw, t0 }) {
  const groundY = y + h;
  // Boiler hall: left portion, sits on ground
  const hallW = w * 0.50, hallH = h * 0.55;
  const hallY = groundY - hallH;
  // Smokestack: tapered (wider at bottom), rises from hall roof
  const stackBotW = w * 0.07, stackTopW = w * 0.045, stackH = h * 0.42;
  const stackCX = x + hallW * 0.4, stackTop = hallY - stackH;
  // Cooling tower: right side, nearly full height, base aligned to ground
  const twW = w * 0.28, twH = h * 0.88;
  const twX = x + w * 0.62, twCX = twX + twW / 2;
  const twBot = groundY;

  return (
    <g>
      {/* Main boiler hall */}
      <rect pathLength="1" x={x} y={hallY} width={hallW} height={hallH} rx={1}
        stroke={activeStroke} strokeWidth="1.5" fill={activeFill}
        filter={smoking ? 'url(#gf)' : undefined}
        style={{ ...dSF(draw, t0, 0.5), transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Smokestack -- tapered, starts 1px above roof */}
      <path pathLength="1" d={`
        M ${stackCX - stackBotW / 2} ${hallY - 1}
        L ${stackCX - stackTopW / 2} ${stackTop}
        L ${stackCX + stackTopW / 2} ${stackTop}
        L ${stackCX + stackBotW / 2} ${hallY - 1}`}
        stroke={activeStroke} strokeWidth="1" fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.12, 0.3), transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Cooling tower -- hyperbolic shape, bottom at ground */}
      <path pathLength="1" d={`
        M ${twX} ${twBot}
        Q ${twX + twW * 0.1} ${twBot - twH * 0.55}, ${twX + twW * 0.06} ${twBot - twH}
        L ${twX + twW * 0.94} ${twBot - twH}
        Q ${twX + twW * 0.9} ${twBot - twH * 0.55}, ${twX + twW} ${twBot}
        Z`}
        stroke={activeStroke} strokeWidth="1.5" fill={activeFill}
        filter={smoking ? 'url(#gf)' : undefined}
        style={{ ...dSF(draw, t0 + 0.06, 0.5), transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Smoke from smokestack + steam from cooling tower */}
      {smoking && (
        <g>
          {/* Stack smoke */}
          <circle cx={stackCX} cy={stackTop} r={5} fill={c + '30'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 40} dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="r" from="5" to="14" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={stackCX + 3} cy={stackTop} r={4} fill={c + '25'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 35} dur="2.3s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="r" from="4" to="12" dur="2.3s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" from="0.5" to="0" dur="2.3s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          {/* Cooling tower steam */}
          <circle cx={twCX} cy={twBot - twH + 2} r={7} fill={c + '25'}>
            <animate attributeName="cy" from={twBot - twH + 2} to={twBot - twH - 42} dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" from="7" to="20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={twCX - 5} cy={twBot - twH + 2} r={5} fill={c + '20'}>
            <animate attributeName="cy" from={twBot - twH + 2} to={twBot - twH - 38} dur="2.6s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="r" from="5" to="16" dur="2.6s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2.6s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx={twCX + 6} cy={twBot - twH + 2} r={6} fill={c + '18'}>
            <animate attributeName="cy" from={twBot - twH + 2} to={twBot - twH - 36} dur="3s" repeatCount="indefinite" begin="1.2s" />
            <animate attributeName="r" from="6" to="18" dur="3s" repeatCount="indefinite" begin="1.2s" />
            <animate attributeName="opacity" from="0.55" to="0" dur="3s" repeatCount="indefinite" begin="1.2s" />
          </circle>
        </g>
      )}
    </g>
  );
}

function GasPlantBody({ x, y, w, h, c, smoking, activeFill, activeStroke, draw, t0 }) {
  const groundY = y + h;
  // Generator building: tall narrow rect, right portion, sits on ground
  const bldgW = w * 0.32, bldgH = h * 0.6;
  const bldgX = x + w * 0.58, bldgY = groundY - bldgH;
  // Smokestack: tapered (wider at bottom), rises from building roof
  const stackBotW = w * 0.065, stackTopW = w * 0.04, stackH = h * 0.35;
  const stackCX = bldgX + bldgW * 0.5, stackTop = bldgY - stackH;
  // Turbine shaft: solid horizontal rect connecting intake to building, sits on ground
  const shaftH = h * 0.18;
  const shaftY = groundY - shaftH;
  const shaftX1 = x + w * 0.2, shaftX2 = bldgX;
  // Bell-shaped air intake (trapezoid, wide at left, same height as shaft area)
  const intakeW = w * 0.18, intakeH = h * 0.3;
  const intakeX = x + 1, intakeY = groundY - intakeH;

  return (
    <g>
      {/* Generator building */}
      <rect pathLength="1" x={bldgX} y={bldgY} width={bldgW} height={bldgH} rx={1}
        stroke={activeStroke} strokeWidth="1.5" fill={activeFill}
        filter={smoking ? 'url(#gf)' : undefined}
        style={{ ...dSF(draw, t0, 0.5), transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Building windows (2 rows of 2) */}
      {[0.2, 0.55].map((wy, yi) => [0.2, 0.6].map((wx, xi) => (
        <rect key={`w${yi}${xi}`} pathLength="1"
          x={bldgX + bldgW * wx} y={bldgY + bldgH * wy}
          width={bldgW * 0.2} height={bldgH * 0.1} rx={0.5}
          stroke={activeStroke} strokeWidth="0.5" fill={activeFill}
          style={dSF(draw, t0 + 0.2 + yi * 0.03 + xi * 0.02, 0.2)} />
      )))}
      {/* Smokestack -- tapered, starts 1px above roof */}
      <path pathLength="1" d={`
        M ${stackCX - stackBotW / 2} ${bldgY - 1}
        L ${stackCX - stackTopW / 2} ${stackTop}
        L ${stackCX + stackTopW / 2} ${stackTop}
        L ${stackCX + stackBotW / 2} ${bldgY - 1}`}
        stroke={activeStroke} strokeWidth="1" fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.06, 0.35), transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Turbine shaft (solid connection, sits on ground) */}
      <rect pathLength="1" x={shaftX1} y={shaftY} width={shaftX2 - shaftX1} height={shaftH} rx={1}
        stroke={activeStroke} strokeWidth="1.2" fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.1, 0.3), transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Bell-shaped air intake (trapezoid: wide left, narrow right, on ground) */}
      <path pathLength="1" d={`
        M ${intakeX} ${intakeY}
        L ${shaftX1} ${shaftY}
        L ${shaftX1} ${groundY}
        L ${intakeX} ${groundY}
        Z`}
        stroke={activeStroke} strokeWidth="1.2" fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.12, 0.3), transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Exhaust from stack */}
      {smoking && (
        <g>
          <circle cx={stackCX} cy={stackTop} r={4} fill={c + '28'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 36} dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="r" from="4" to="13" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.65" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={stackCX + 3} cy={stackTop} r={3} fill={c + '20'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 30} dur="1.9s" repeatCount="indefinite" begin="0.4s" />
            <animate attributeName="r" from="3" to="10" dur="1.9s" repeatCount="indefinite" begin="0.4s" />
            <animate attributeName="opacity" from="0.55" to="0" dur="1.9s" repeatCount="indefinite" begin="0.4s" />
          </circle>
          <circle cx={stackCX - 2} cy={stackTop} r={2.5} fill={c + '18'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 28} dur="2.2s" repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="r" from="2.5" to="8" dur="2.2s" repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="opacity" from="0.45" to="0" dur="2.2s" repeatCount="indefinite" begin="0.8s" />
          </circle>
        </g>
      )}
    </g>
  );
}

function Tower({ x, y, h, c, draw, t0 = 0, energized }) {
  const topW = 42;
  const midW = 30;
  const baseW = 22;
  const armY = y + h * 0.14;
  const midY = y + h * 0.38;
  const es = energized ? c + '80' : c + '50';

  return (
    <g>
      {/* Main vertical pole */}
      <line pathLength="1" x1={x} y1={y + h} x2={x} y2={y + 6} stroke={es} strokeWidth="1.5"
        style={{ ...dS(draw, t0, 0.5), transition: 'stroke 0.5s ease' }} />
      {/* Top cross arm */}
      <line pathLength="1" x1={x - topW / 2} y1={armY} x2={x + topW / 2} y2={armY} stroke={es} strokeWidth="1.2"
        style={{ ...dS(draw, t0 + 0.2, 0.3), transition: 'stroke 0.5s ease' }} />
      {/* Mid cross arm */}
      <line pathLength="1" x1={x - midW / 2} y1={midY} x2={x + midW / 2} y2={midY} stroke={es} strokeWidth="1"
        style={{ ...dS(draw, t0 + 0.25, 0.3), transition: 'stroke 0.5s ease' }} />
      {/* Lattice lines */}
      <line pathLength="1" x1={x - baseW / 2} y1={y + h} x2={x - midW / 2} y2={midY} stroke={c + '30'} strokeWidth="0.8"
        style={dS(draw, t0 + 0.3, 0.3)} />
      <line pathLength="1" x1={x + baseW / 2} y1={y + h} x2={x + midW / 2} y2={midY} stroke={c + '30'} strokeWidth="0.8"
        style={dS(draw, t0 + 0.32, 0.3)} />
      <line pathLength="1" x1={x - midW / 2} y1={midY} x2={x} y2={y + 6} stroke={c + '30'} strokeWidth="0.8"
        style={dS(draw, t0 + 0.35, 0.3)} />
      <line pathLength="1" x1={x + midW / 2} y1={midY} x2={x} y2={y + 6} stroke={c + '30'} strokeWidth="0.8"
        style={dS(draw, t0 + 0.37, 0.3)} />
      {/* Cross lattice */}
      <line pathLength="1" x1={x - baseW / 2} y1={y + h} x2={x + midW / 2} y2={midY} stroke={c + '18'} strokeWidth="0.5"
        style={dS(draw, t0 + 0.4, 0.25)} />
      <line pathLength="1" x1={x + baseW / 2} y1={y + h} x2={x - midW / 2} y2={midY} stroke={c + '18'} strokeWidth="0.5"
        style={dS(draw, t0 + 0.42, 0.25)} />
      {/* Insulators — glow when energized */}
      {[x - topW / 2, x, x + topW / 2].map((ix, i) => (
        <circle key={i} pathLength="1" cx={ix} cy={armY} r="2.5"
          fill={energized ? c + '90' : c + '30'} stroke={energized ? c : c + '50'} strokeWidth="0.5"
          filter={energized ? 'url(#gf)' : undefined}
          style={{ ...dSF(draw, t0 + 0.48 + i * 0.02, 0.2), transition: 'fill 0.4s ease, stroke 0.4s ease' }}
        />
      ))}
    </g>
  );
}

function Substation({ x, y, w, h, c, draw, t0 = 0, energized }) {
  const coilStroke = energized ? c : c + '45';
  const coilFilter = energized ? 'url(#gf)' : undefined;
  const bushingC = energized ? c + '90' : c + '40';
  const b1x = x + w * 0.3, b2x = x + w * 0.7;
  const bushingH = 30, bushingTop = y - bushingH;
  const discW = 8;

  return (
    <g>
      <rect pathLength="1" x={x} y={y} width={w} height={h}
        stroke={energized ? c + '80' : c + '55'} strokeWidth="1.5"
        fill={energized ? c + '0a' : c + '05'}
        filter={energized ? 'url(#gf)' : undefined}
        style={{ ...dSF(draw, t0, 0.6), transition: 'stroke 0.5s ease, fill 0.5s ease' }} />
      {/* Transformer zigzag coils — pulse when energized */}
      <polyline pathLength="1"
        points={`${x + w * 0.3},${y + h * 0.18} ${x + w * 0.48},${y + h * 0.32} ${x + w * 0.3},${y + h * 0.46} ${x + w * 0.48},${y + h * 0.6} ${x + w * 0.3},${y + h * 0.74}`}
        stroke={coilStroke} strokeWidth={energized ? 2 : 1.5} fill="none" filter={coilFilter}
        style={energized
          ? { strokeDasharray: 'none', strokeDashoffset: 0, animation: 'coilPulse 1.2s ease-in-out infinite' }
          : dS(draw, t0 + 0.35, 0.5)} />
      <polyline pathLength="1"
        points={`${x + w * 0.52},${y + h * 0.18} ${x + w * 0.7},${y + h * 0.32} ${x + w * 0.52},${y + h * 0.46} ${x + w * 0.7},${y + h * 0.6} ${x + w * 0.52},${y + h * 0.74}`}
        stroke={coilStroke} strokeWidth={energized ? 2 : 1.5} fill="none" filter={coilFilter}
        style={energized
          ? { strokeDasharray: 'none', strokeDashoffset: 0, animation: 'coilPulse 1.2s ease-in-out infinite 0.6s' }
          : dS(draw, t0 + 0.45, 0.5)} />
      {/* Bushings (two vertical posts with insulator discs) */}
      {[b1x, b2x].map((bx, bi) => (
        <g key={`bush${bi}`}>
          <line pathLength="1" x1={bx} y1={y} x2={bx} y2={bushingTop}
            stroke={bushingC} strokeWidth="1.5"
            style={{ ...dS(draw, t0 + 0.5 + bi * 0.03), transition: 'stroke 0.5s' }} />
          {[0.25, 0.5, 0.75].map((p, di) => {
            const dy = y - bushingH * p;
            return (
              <line key={di} pathLength="1" x1={bx - discW} y1={dy} x2={bx + discW} y2={dy}
                stroke={bushingC} strokeWidth="1"
                style={{ ...dS(draw, t0 + 0.52 + bi * 0.03 + di * 0.02), transition: 'stroke 0.5s' }} />
            );
          })}
          <circle cx={bx} cy={bushingTop} r={2.5}
            fill={energized ? bushingC : c + '25'}
            stroke={bushingC} strokeWidth="0.5"
            filter={energized ? 'url(#gf)' : undefined}
            style={{ ...dSF(draw, t0 + 0.55 + bi * 0.03, 0.2), transition: 'fill 0.5s, stroke 0.5s' }} />
        </g>
      ))}
      {/* Label */}
      <text x={x + w / 2} y={y + h + 23} textAnchor="middle"
        fill={c + '35'} fontSize="13" fontFamily="JetBrains Mono" letterSpacing="0.1em"
        style={flk(draw, t0 + 0.9)}>SUBSTATION</text>
      {/* Corner brackets */}
      {[[x - 4, y - 4, 1, 1], [x + w + 4, y - 4, -1, 1], [x - 4, y + h + 4, 1, -1], [x + w + 4, y + h + 4, -1, -1]].map(([bx, by, dx, dy], i) => (
        <g key={i}>
          <line pathLength="1" x1={bx} y1={by} x2={bx + 10 * dx} y2={by} stroke={c + '25'} strokeWidth="1"
            style={dS(draw, t0 + 0.6 + i * 0.05, 0.2)} />
          <line pathLength="1" x1={bx} y1={by} x2={bx} y2={by + 10 * dy} stroke={c + '25'} strokeWidth="1"
            style={dS(draw, t0 + 0.62 + i * 0.05, 0.2)} />
        </g>
      ))}
    </g>
  );
}
