import React, { useState, useEffect, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// Connection path data — reused for static lines and flow overlay
const CONN = [
  // Plant → Tower1
  { d: 'M 200 135 L 290 98', group: 'hv' },
  { d: 'M 200 340 L 290 155', group: 'hv' },
  // Tower1 → Tower2 (3-phase HV)
  { d: 'M 335 85 L 445 85', group: 'hv' },
  { d: 'M 335 98 L 445 98', group: 'hv' },
  { d: 'M 335 111 L 445 111', group: 'hv' },
  // Tower2 → Substation
  { d: 'M 485 98 L 590 158', group: 'hv' },
  // Substation → consumers (distribution)
  { d: 'M 710 155 Q 760 155 810 110', group: 'dist' },
  { d: 'M 710 155 Q 770 155 920 125', group: 'dist' },
  { d: 'M 710 155 Q 790 145 1110 198', group: 'dist' },
  { d: 'M 710 175 Q 780 240 855 340', group: 'dist' },
  { d: 'M 710 165 Q 750 145 810 55', group: 'dist' },
];

const PHASES = [
  { label: 'Generation', sub: 'Few, large, dispatchable', color: colors.accent },
  { label: 'Transmission', sub: 'High-voltage backbone', color: colors.secondary },
  { label: 'Distribution', sub: 'One-way power flow', color: colors.primary },
  { label: 'Consumers', sub: 'Passive loads', color: colors.textDim },
];

// Staggered delay for buildings appearing at step 4 (left→right)
const appearDelay = (x) => ((x - 700) / 500 * 0.6).toFixed(2);

export default function GridFlowDemo({ width = '100%' }) {
  const [step, setStep] = useState(0);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    if (slideContext?.isSlideActive) setStep(0);
  }, [slideContext?.isSlideActive]);

  useEffect(() => {
    if (!slideContext?.isSlideActive) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' && step < 4) {
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
  const showBuildings = step >= 4;
  const lit = step >= 4;
  const flowing = step >= 3;

  return (
    <div style={{ width, display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>
      <style>{`
        @keyframes flowDash { to { stroke-dashoffset: -18; } }
        @keyframes arcFlicker {
          0%, 100% { opacity: 0; }
          15% { opacity: 0.7; }
          30% { opacity: 0; }
          60% { opacity: 0.5; }
          75% { opacity: 0; }
        }
      `}</style>

      <div style={{ flex: 1, minHeight: 0 }}>
        <svg viewBox="0 0 1200 480" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="gf"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            <filter id="wg"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>

          {/* Subtle scan grid */}
          <pattern id="sg" width="1200" height="4" patternUnits="userSpaceOnUse">
            <line x1="0" y1="3" x2="1200" y2="3" stroke={c} strokeWidth="0.3" opacity="0.04" />
          </pattern>
          <rect width="1200" height="480" fill="url(#sg)" />

          {/* ═══ BUILDINGS — appear at step 4 with staggered fade-in ═══ */}
          <g style={{ opacity: showBuildings ? 1 : 0, transition: 'opacity 0.8s ease' }}>
            <House x={810} y={82} w={78} h={64} c={c} lit={lit} litDelay={appearDelay(810)} />
            <House x={920} y={100} w={66} h={54} c={c} lit={lit} litDelay={appearDelay(920)} />
            <House x={1028} y={115} w={62} h={50} c={c} lit={lit} litDelay={appearDelay(1028)} />
            <Apartment x={1110} y={126} w={65} h={155} c={c} lit={lit} litDelay={appearDelay(1110)} />
            <Factory x={850} y={310} w={185} h={100} c={c} lit={lit} litDelay={appearDelay(855)} />
            <ShoppingCenter x={810} y={30} w={195} h={52} c={c} lit={lit} litDelay={appearDelay(810)} />
          </g>

          {/* ═══ POWER PLANTS — step 1+ ═══ */}
          <g style={{ opacity: step >= 1 ? 1 : 0, transition: 'opacity 0.8s ease' }}>
            <Plant x={30} y={68} w={165} h={130} c={c} smoking={flowing} label="COAL 800MW" />
            <Plant x={30} y={278} w={165} h={130} c={c} smoking={flowing} label="GAS 400MW" />
          </g>

          {/* ═══ TRANSMISSION & DISTRIBUTION — step 2+ ═══ */}
          <g style={{ opacity: step >= 2 ? 1 : 0, transition: 'opacity 0.8s ease' }}>
            <Tower x={315} y={62} h={180} c={c} />
            <Tower x={465} y={62} h={180} c={c} />
            <Substation x={590} y={120} w={120} h={100} c={c} />

            {/* Static connection lines */}
            {CONN.map((p, i) => (
              <path key={i} d={p.d} stroke={c + '25'} strokeWidth="1.2" fill="none" />
            ))}
          </g>

          {/* ═══ FLOW OVERLAY — step 3+ ═══ */}
          <g style={{ opacity: flowing ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            {CONN.map((p, i) => (
              <path key={`fl-${i}`} d={p.d} stroke={c} strokeWidth={p.group === 'hv' ? '2.5' : '2'} fill="none"
                strokeDasharray="8 10" filter="url(#gf)"
                style={{ animation: flowing ? `flowDash ${0.5 + i * 0.03}s linear infinite` : 'none' }}
              />
            ))}

            {/* Electric arcs between HV lines at tower span */}
            {[360, 385, 410, 435].map(ax => (
              <g key={ax}>
                <line x1={ax} y1={86} x2={ax + 1} y2={97} stroke={c} strokeWidth="1.2" filter="url(#gf)"
                  style={{ animation: `arcFlicker ${0.4 + (ax % 7) * 0.1}s ease-in-out infinite ${ax * 0.003}s` }} />
                <line x1={ax + 2} y1={99} x2={ax} y2={110} stroke={c} strokeWidth="1" filter="url(#gf)"
                  style={{ animation: `arcFlicker ${0.5 + (ax % 5) * 0.08}s ease-in-out infinite ${ax * 0.004 + 0.2}s` }} />
              </g>
            ))}
          </g>

          {/* Section labels */}
          <g style={{ opacity: step >= 1 ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            <text x="112" y="466" textAnchor="middle" fill={colors.textDim + '60'} fontSize="9" fontFamily="JetBrains Mono" letterSpacing="0.15em">GENERATION</text>
          </g>
          <g style={{ opacity: step >= 2 ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            <text x="390" y="466" textAnchor="middle" fill={colors.textDim + '60'} fontSize="9" fontFamily="JetBrains Mono" letterSpacing="0.15em">TRANSMISSION</text>
            <text x="650" y="466" textAnchor="middle" fill={colors.textDim + '60'} fontSize="9" fontFamily="JetBrains Mono" letterSpacing="0.15em">DISTRIBUTION</text>
          </g>
          <g style={{ opacity: step >= 4 ? 1 : 0, transition: 'opacity 0.6s ease' }}>
            <text x="960" y="466" textAnchor="middle" fill={colors.textDim + '60'} fontSize="9" fontFamily="JetBrains Mono" letterSpacing="0.15em">CONSUMERS</text>
          </g>
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
                <div style={{ fontSize: 18, fontWeight: 600, color: active ? p.color : colors.textDim, transition: 'color 0.5s ease' }}>{p.label}</div>
                <div style={{ fontSize: 14, color: active ? colors.textMuted : colors.textDim + '80', marginTop: 3, transition: 'color 0.5s ease' }}>{p.sub}</div>
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

      {/* Step dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 2 }}>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: i <= step ? c : colors.textDim + '30',
            transition: 'background 0.3s ease',
            boxShadow: i === step ? `0 0 8px ${c}` : 'none',
          }} />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// SVG sub-components
// ═══════════════════════════════════════════════════════

function House({ x, y, w, h, c, lit, litDelay = '0' }) {
  const roofH = h * 0.38;
  const bodyY = y + roofH;
  const bodyH = h * 0.62;
  const winW = w * 0.22;
  const winH = bodyH * 0.32;
  const amber = colors.accent;
  const wf = lit ? amber + 'bb' : '#0a0e18';
  const ws = lit ? amber + '50' : c + '20';
  const td = `fill 0.5s ease ${litDelay}s, stroke 0.4s ease ${litDelay}s`;

  return (
    <g>
      <polygon points={`${x},${bodyY} ${x + w / 2},${y} ${x + w},${bodyY}`}
        stroke={c + '50'} strokeWidth="1.2" fill="none" />
      <rect x={x} y={bodyY} width={w} height={bodyH}
        stroke={c + '50'} strokeWidth="1.2" fill={c + '03'} />
      <rect x={x + w * 0.15} y={bodyY + bodyH * 0.2} width={winW} height={winH}
        fill={wf} stroke={ws} strokeWidth="0.7"
        filter={lit ? 'url(#wg)' : undefined}
        style={{ transition: td }} />
      <rect x={x + w * 0.62} y={bodyY + bodyH * 0.2} width={winW} height={winH}
        fill={wf} stroke={ws} strokeWidth="0.7"
        filter={lit ? 'url(#wg)' : undefined}
        style={{ transition: td }} />
      <rect x={x + w * 0.38} y={bodyY + bodyH * 0.55} width={w * 0.24} height={bodyH * 0.45}
        stroke={c + '18'} strokeWidth="0.7" fill="none" />
    </g>
  );
}

function Apartment({ x, y, w, h, c, lit, litDelay = '0' }) {
  const amber = colors.accent;
  const floors = 5;
  const cols = 3;
  const winW = w * 0.17;
  const winH = h / floors * 0.38;
  const baseDelay = parseFloat(litDelay);

  return (
    <g>
      <rect x={x} y={y} width={w} height={h}
        stroke={c + '50'} strokeWidth="1.2" fill={c + '03'} />
      {Array.from({ length: floors }).map((_, fi) =>
        Array.from({ length: cols }).map((_, ci) => {
          const wx = x + w * 0.1 + ci * (w * 0.28);
          const wy = y + h * 0.06 + fi * (h / floors);
          const isLit = lit && !((fi + ci) % 3 === 2);
          const d = baseDelay + fi * 0.06 + ci * 0.03;
          return (
            <rect key={`${fi}-${ci}`} x={wx} y={wy} width={winW} height={winH}
              fill={isLit ? amber + 'bb' : '#0a0e18'}
              stroke={isLit ? amber + '50' : c + '18'}
              strokeWidth="0.6"
              filter={isLit ? 'url(#wg)' : undefined}
              style={{ transition: `fill 0.4s ease ${d.toFixed(2)}s` }}
            />
          );
        })
      )}
    </g>
  );
}

function Factory({ x, y, w, h, c, lit, litDelay = '0' }) {
  const amber = colors.accent;
  const td = `fill 0.5s ease ${litDelay}s, stroke 0.4s ease ${litDelay}s`;
  const wf = lit ? amber + '66' : '#0a0e18';
  const ws = lit ? amber + '35' : c + '15';
  const stackW = w * 0.07;
  const stackH = h * 0.6;

  return (
    <g>
      {/* Main building */}
      <rect x={x} y={y} width={w} height={h}
        stroke={c + '50'} strokeWidth="1.2" fill={c + '03'} />
      {/* Smokestack */}
      <rect x={x + w * 0.9} y={y - stackH} width={stackW} height={stackH}
        stroke={c + '50'} strokeWidth="1" fill={c + '03'} />
      {/* Sawtooth roof — 4 teeth for wider look */}
      <polyline
        points={`${x},${y} ${x + w * 0.12},${y - 16} ${x + w * 0.24},${y} ${x + w * 0.36},${y - 16} ${x + w * 0.48},${y} ${x + w * 0.6},${y - 16} ${x + w * 0.72},${y} ${x + w * 0.84},${y - 16} ${x + w * 0.84},${y}`}
        stroke={c + '50'} strokeWidth="1" fill="none" />
      {/* Small high windows — industrial strip */}
      {[0.06, 0.2, 0.34, 0.48, 0.62].map((pct, i) => (
        <rect key={i} x={x + w * pct} y={y + h * 0.15} width={w * 0.1} height={h * 0.12}
          fill={wf} stroke={ws} strokeWidth="0.6"
          filter={lit ? 'url(#wg)' : undefined}
          style={{ transition: `fill 0.4s ease ${(parseFloat(litDelay) + i * 0.06).toFixed(2)}s` }} />
      ))}
      {/* Loading dock bays */}
      {[0.06, 0.22, 0.38].map((pct, i) => (
        <rect key={`d${i}`} x={x + w * pct} y={y + h * 0.55} width={w * 0.12} height={h * 0.45}
          stroke={c + '20'} strokeWidth="0.7" fill="none" />
      ))}
      {/* Ventilation units on roof */}
      {[0.55, 0.68].map((pct, i) => (
        <rect key={`v${i}`} x={x + w * pct} y={y - 6} width={w * 0.06} height={6}
          stroke={c + '30'} strokeWidth="0.6" fill={c + '05'} />
      ))}
      <text x={x + w * 0.45} y={y + h + 16} textAnchor="middle"
        fill={c + '30'} fontSize="8" fontFamily="JetBrains Mono" letterSpacing="0.1em">INDUSTRIAL</text>
    </g>
  );
}

function ShoppingCenter({ x, y, w, h, c, lit, litDelay = '0' }) {
  const amber = colors.accent;
  const td = `fill 0.5s ease ${litDelay}s`;
  const wf = lit ? amber + '99' : '#0a0e18';

  return (
    <g>
      {/* Main structure — flat roof */}
      <rect x={x} y={y} width={w} height={h}
        stroke={c + '50'} strokeWidth="1.2" fill={c + '03'} />
      {/* Awning / canopy overhang */}
      <line x1={x} y1={y + h * 0.65} x2={x + w} y2={y + h * 0.65}
        stroke={c + '35'} strokeWidth="1" />
      {/* Storefront windows */}
      {[0.04, 0.2, 0.36, 0.52, 0.68, 0.84].map((pct, i) => (
        <rect key={i} x={x + w * pct} y={y + h * 0.12} width={w * 0.12} height={h * 0.45}
          fill={wf} stroke={lit ? amber + '40' : c + '15'} strokeWidth="0.6"
          filter={lit ? 'url(#wg)' : undefined}
          style={{ transition: `fill 0.3s ease ${(parseFloat(litDelay) + i * 0.05).toFixed(2)}s` }} />
      ))}
      {/* Signage area */}
      <rect x={x + w * 0.3} y={y - 10} width={w * 0.4} height={10}
        stroke={c + '30'} strokeWidth="0.8" fill={c + '04'} />
      <text x={x + w * 0.5} y={y + h + 14} textAnchor="middle"
        fill={c + '30'} fontSize="8" fontFamily="JetBrains Mono" letterSpacing="0.1em">RETAIL</text>
    </g>
  );
}

function Plant({ x, y, w, h, c, smoking, label }) {
  const towerW = w * 0.28;
  const towerH = h * 0.92;
  const towerX = x + w * 0.68;
  const stackX = x + w * 0.22;
  const stackW = w * 0.07;
  const stackH = h * 0.32;
  const activeFill = smoking ? c + '12' : c + '05';
  const activeStroke = smoking ? c + '80' : c + '60';

  return (
    <g>
      {/* Main building */}
      <rect x={x} y={y + h * 0.3} width={w * 0.58} height={h * 0.7}
        stroke={activeStroke} strokeWidth="1.5" fill={activeFill}
        filter={smoking ? 'url(#gf)' : undefined}
        style={{ transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Cooling tower */}
      <path d={`
        M ${towerX} ${y + towerH}
        Q ${towerX + towerW * 0.12} ${y + towerH * 0.45}, ${towerX + towerW * 0.08} ${y}
        L ${towerX + towerW * 0.92} ${y}
        Q ${towerX + towerW * 0.88} ${y + towerH * 0.45}, ${towerX + towerW} ${y + towerH}
        Z
      `} stroke={activeStroke} strokeWidth="1.5" fill={activeFill}
        filter={smoking ? 'url(#gf)' : undefined}
        style={{ transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Smokestack */}
      <rect x={stackX} y={y + h * 0.3 - stackH} width={stackW} height={stackH}
        stroke={activeStroke} strokeWidth="1" fill={activeFill}
        style={{ transition: 'fill 0.6s ease, stroke 0.4s ease' }} />
      {/* Label — bright enough to read */}
      <text x={x + w * 0.29} y={y + h * 0.7} textAnchor="middle"
        fill={c + 'cc'} fontSize="9" fontWeight="600" fontFamily="JetBrains Mono" letterSpacing="0.08em">{label}</text>
      {/* Corner brackets */}
      <line x1={x - 4} y1={y + h * 0.3 - 4} x2={x + 12} y2={y + h * 0.3 - 4} stroke={c + '25'} strokeWidth="1" />
      <line x1={x - 4} y1={y + h * 0.3 - 4} x2={x - 4} y2={y + h * 0.3 + 12} stroke={c + '25'} strokeWidth="1" />

      {/* Smoke (SMIL) — large, visible puffs */}
      {smoking && (
        <g>
          {/* Stack smoke — 3 puffs */}
          <circle cx={stackX + stackW / 2} cy={y + h * 0.3 - stackH} r="5" fill={c + '30'}>
            <animate attributeName="cy" from={y + h * 0.3 - stackH} to={y + h * 0.3 - stackH - 40} dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" from="5" to="14" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={stackX + stackW / 2 + 4} cy={y + h * 0.3 - stackH} r="4" fill={c + '25'}>
            <animate attributeName="cy" from={y + h * 0.3 - stackH} to={y + h * 0.3 - stackH - 35} dur="2.5s" repeatCount="indefinite" begin="0.7s" />
            <animate attributeName="r" from="4" to="12" dur="2.5s" repeatCount="indefinite" begin="0.7s" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2.5s" repeatCount="indefinite" begin="0.7s" />
          </circle>
          <circle cx={stackX + stackW / 2 - 3} cy={y + h * 0.3 - stackH} r="3" fill={c + '20'}>
            <animate attributeName="cy" from={y + h * 0.3 - stackH} to={y + h * 0.3 - stackH - 30} dur="3s" repeatCount="indefinite" begin="1.3s" />
            <animate attributeName="r" from="3" to="10" dur="3s" repeatCount="indefinite" begin="1.3s" />
            <animate attributeName="opacity" from="0.5" to="0" dur="3s" repeatCount="indefinite" begin="1.3s" />
          </circle>
          {/* Cooling tower steam — big billowing clouds */}
          <circle cx={towerX + towerW * 0.5} cy={y} r="7" fill={c + '22'}>
            <animate attributeName="cy" from={y} to={y - 40} dur="2.2s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="r" from="7" to="20" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
            <animate attributeName="opacity" from="0.65" to="0" dur="2.2s" repeatCount="indefinite" begin="0.3s" />
          </circle>
          <circle cx={towerX + towerW * 0.35} cy={y} r="5" fill={c + '18'}>
            <animate attributeName="cy" from={y} to={y - 35} dur="2.8s" repeatCount="indefinite" begin="1.1s" />
            <animate attributeName="r" from="5" to="16" dur="2.8s" repeatCount="indefinite" begin="1.1s" />
            <animate attributeName="opacity" from="0.55" to="0" dur="2.8s" repeatCount="indefinite" begin="1.1s" />
          </circle>
          <circle cx={towerX + towerW * 0.6} cy={y} r="6" fill={c + '15'}>
            <animate attributeName="cy" from={y} to={y - 38} dur="3.2s" repeatCount="indefinite" begin="1.8s" />
            <animate attributeName="r" from="6" to="18" dur="3.2s" repeatCount="indefinite" begin="1.8s" />
            <animate attributeName="opacity" from="0.5" to="0" dur="3.2s" repeatCount="indefinite" begin="1.8s" />
          </circle>
        </g>
      )}
    </g>
  );
}

function Tower({ x, y, h, c }) {
  const topW = 42;
  const midW = 30;
  const baseW = 22;
  const armY = y + h * 0.14;
  const midY = y + h * 0.38;

  return (
    <g>
      <line x1={x} y1={y + 6} x2={x} y2={y + h} stroke={c + '50'} strokeWidth="1.5" />
      <line x1={x - topW / 2} y1={armY} x2={x + topW / 2} y2={armY} stroke={c + '50'} strokeWidth="1.2" />
      <line x1={x - midW / 2} y1={midY} x2={x + midW / 2} y2={midY} stroke={c + '50'} strokeWidth="1" />
      <line x1={x - baseW / 2} y1={y + h} x2={x - midW / 2} y2={midY} stroke={c + '30'} strokeWidth="0.8" />
      <line x1={x + baseW / 2} y1={y + h} x2={x + midW / 2} y2={midY} stroke={c + '30'} strokeWidth="0.8" />
      <line x1={x - midW / 2} y1={midY} x2={x} y2={y + 6} stroke={c + '30'} strokeWidth="0.8" />
      <line x1={x + midW / 2} y1={midY} x2={x} y2={y + 6} stroke={c + '30'} strokeWidth="0.8" />
      <line x1={x - baseW / 2} y1={y + h} x2={x + midW / 2} y2={midY} stroke={c + '18'} strokeWidth="0.5" />
      <line x1={x + baseW / 2} y1={y + h} x2={x - midW / 2} y2={midY} stroke={c + '18'} strokeWidth="0.5" />
      <circle cx={x - topW / 2} cy={armY} r="2.5" fill={c + '30'} stroke={c + '50'} strokeWidth="0.5" />
      <circle cx={x + topW / 2} cy={armY} r="2.5" fill={c + '30'} stroke={c + '50'} strokeWidth="0.5" />
      <circle cx={x} cy={armY} r="2.5" fill={c + '30'} stroke={c + '50'} strokeWidth="0.5" />
    </g>
  );
}

function Substation({ x, y, w, h, c }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h}
        stroke={c + '55'} strokeWidth="1.5" fill={c + '05'} />
      <polyline
        points={`${x + w * 0.3},${y + h * 0.18} ${x + w * 0.48},${y + h * 0.32} ${x + w * 0.3},${y + h * 0.46} ${x + w * 0.48},${y + h * 0.6} ${x + w * 0.3},${y + h * 0.74}`}
        stroke={c + '45'} strokeWidth="1.5" fill="none" />
      <polyline
        points={`${x + w * 0.52},${y + h * 0.18} ${x + w * 0.7},${y + h * 0.32} ${x + w * 0.52},${y + h * 0.46} ${x + w * 0.7},${y + h * 0.6} ${x + w * 0.52},${y + h * 0.74}`}
        stroke={c + '45'} strokeWidth="1.5" fill="none" />
      <text x={x + w / 2} y={y + h + 14} textAnchor="middle"
        fill={c + '35'} fontSize="8" fontFamily="JetBrains Mono" letterSpacing="0.1em">SUBSTATION</text>
      {[[x - 4, y - 4, 1, 1], [x + w + 4, y - 4, -1, 1], [x - 4, y + h + 4, 1, -1], [x + w + 4, y + h + 4, -1, -1]].map(([bx, by, dx, dy], i) => (
        <g key={i}>
          <line x1={bx} y1={by} x2={bx + 10 * dx} y2={by} stroke={c + '25'} strokeWidth="1" />
          <line x1={bx} y1={by} x2={bx} y2={by + 10 * dy} stroke={c + '25'} strokeWidth="1" />
        </g>
      ))}
    </g>
  );
}
