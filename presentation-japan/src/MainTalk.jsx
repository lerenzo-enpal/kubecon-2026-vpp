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
import DuckCurveChart from '../../presentation/src/components/DuckCurveChart.jsx';
import RenewableGrowthChart from '../../presentation/src/components/RenewableGrowthChart.jsx';

const coreSlides = 14;
const mainAtlasPreset = () => ({ areas: true, transmission: true, plants: true, mix: false });
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

function WhatIsVPP({ step = 0 }) {
  const s = Math.min(Math.max(Number.isFinite(step) ? step : 0, 0), 3);
  const showLines = s >= 1;
  const aggActive = s >= 2;
  const dispActive = s >= 3;
  const tr = { transition: 'all 500ms ease' };

  // Full-bleed canvas — matches Spectacle slide dimensions
  const VW = 1366, VH = 768;

  // Houses and cars at offset x positions so VPP can connect to both independently
  const HX = [190, 430, 670, 910];   // house centers
  const CX = [295, 535, 775, 1015];  // car centers (+105 offset)
  const VPP_CX = 620, VPP_Y = 490, VPP_W = 220, VPP_H = 70;
  const gridX = 1235;

  // House geometry (roof peak at H_PEAK, body H_TOP→H_BOT)
  const H_PEAK = 148, H_TOP = 170, H_BOT = 214;  // H_TOP + 44 = H_BOT
  // Car geometry (cabin C_CAB_Y, body C_TOP→C_BOT, wheels at C_WHEEL_Y)
  const C_CAB_Y = 302, C_TOP = 316, C_BOT = 338, C_WHEEL_Y = 348;

  // Grid cable rows — house cables sit between H_BOT and C_CAB_Y; car cables below wheels
  const GRID_HOUSE_Y = 258;
  const GRID_CAR_Y   = 418;

  // Sun/moon — upper right corner
  const SUN_X = 1255, SUN_Y = 68;

  const hash = (n) => { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x); };
  const STARS = Array.from({ length: 36 }, (_, i) => ({
    cx: hash(i * 127.1 + 311.7) * VW,
    cy: 8 + hash(i * 269.5 + 183.3) * 88,
    r:  0.6 + hash(i * 419.2 + 71.9) * 1.5,
    dur: (1.4 + hash(i * 631.2 + 97.1) * 3).toFixed(1),
    beg: (hash(i * 523.7 + 43.3) * 4).toFixed(1),
  }));

  // Bezier paths — visual dashed lines (house/car → VPP)
  const houseToVppLine = (hx) => `M ${hx} ${H_BOT} C ${hx} ${VPP_Y - 140} ${VPP_CX} ${VPP_Y - 60} ${VPP_CX} ${VPP_Y}`;
  const carToVppLine   = (cx) => `M ${cx} ${C_WHEEL_Y} C ${cx} ${VPP_Y - 80} ${VPP_CX} ${VPP_Y - 35} ${VPP_CX} ${VPP_Y}`;
  // Reversed paths — command particles travel FROM VPP DOWN to device
  const vppToHousePath = (hx) => `M ${VPP_CX} ${VPP_Y} C ${VPP_CX} ${VPP_Y - 60} ${hx} ${VPP_Y - 140} ${hx} ${H_BOT}`;
  const vppToCarPath   = (cx) => `M ${VPP_CX} ${VPP_Y} C ${VPP_CX} ${VPP_Y - 35} ${cx} ${VPP_Y - 80} ${cx} ${C_WHEEL_Y}`;

  const sunRays = Array.from({ length: 8 }, (_, r) => {
    const a = (r / 8) * Math.PI * 2;
    return {
      x1: SUN_X + Math.cos(a) * 13, y1: SUN_Y + Math.sin(a) * 13,
      x2: SUN_X + Math.cos(a) * (18 + (r % 2) * 4), y2: SUN_Y + Math.sin(a) * (18 + (r % 2) * 4),
    };
  });

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>

      {/* ── Full-bleed SVG ── */}
      <svg viewBox={`0 0 ${VW} ${VH}`} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">

        {/* ── DEFS: moon crescent mask ── */}
        <defs>
          <mask id="wvpp-moonmask">
            <rect width={VW} height={VH} fill="white"/>
            <circle cx={SUN_X + 10} cy={SUN_Y - 5} r="12" fill="black"/>
          </mask>
        </defs>

        {/* ── NIGHT OVERLAY — bottom z-layer, shows during moon phase ── */}
        <rect width={VW} height={VH} fill="#070d1a" opacity="0">
          <animate attributeName="opacity"
            values="0.82;0.82;0;0;0.82;0.82"
            keyTimes="0;0.20;0.27;0.70;0.78;1"
            dur="24s" repeatCount="indefinite"/>
        </rect>

        {/* ── STARS ── */}
        <g style={{ animation: 'wvpp-stars 24s ease-in-out infinite' }}>
          {STARS.map((st, i) => (
            <circle key={`star${i}`} cx={st.cx} cy={st.cy} r={st.r} fill="#e2e8f0" opacity="0.85">
              <animate attributeName="opacity" values="0.85;0.1;0.85"
                dur={`${st.dur}s`} begin={`${st.beg}s`} repeatCount="indefinite"/>
            </circle>
          ))}
        </g>

        {/* ── SUN (upper right) ── */}
        <g style={{ animation: 'wvpp-sun 24s ease-in-out infinite' }}>
          <circle cx={SUN_X} cy={SUN_Y} r="11" fill="#f59e0b" opacity="0.88"/>
          <circle cx={SUN_X} cy={SUN_Y} r="20" fill="none" stroke="#f59e0b" strokeWidth="1" opacity="0.2"/>
          <g>
            <animateTransform attributeName="transform" type="rotate"
              from={`0 ${SUN_X} ${SUN_Y}`} to={`360 ${SUN_X} ${SUN_Y}`}
              dur="20s" repeatCount="indefinite"/>
            {sunRays.map((r, i) => (
              <line key={i} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2}
                stroke="#f59e0b" strokeWidth="1.5" opacity="0.55"/>
            ))}
          </g>
        </g>

        {/* ── MOON (upper right, crescent) ── */}
        <g style={{ animation: 'wvpp-moon 24s ease-in-out infinite' }}>
          <circle cx={SUN_X - 2} cy={SUN_Y} r="13" fill="#c8d0db" opacity="0.88" mask="url(#wvpp-moonmask)"/>
        </g>

        {/* ── GRID: vertical dashed line + icons ── */}
        <line x1={gridX} y1="10" x2={gridX} y2={VH - 80}
          stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3,5" opacity="0.2"/>
        <text x={gridX} y={GRID_HOUSE_Y - 12} textAnchor="middle" fontSize="20"
          fill="var(--color-primary)" opacity="0.6">⚡</text>
        <text x={gridX} y={GRID_CAR_Y - 12} textAnchor="middle" fontSize="20"
          fill="var(--color-primary)" opacity="0.6">⚡</text>
        <text x={gridX} y={VH - 60} textAnchor="middle" fontSize="9"
          fill="var(--color-primary)" fontFamily="monospace" opacity="0.35" letterSpacing="0.1em">GRID</text>

        {/* ── HOUSE → GRID: horizontal cables + slow particles ── */}
        {HX.map((hx, i) => (
          <g key={`hgc${i}`}>
            <line x1={hx} y1={GRID_HOUSE_Y} x2={gridX} y2={GRID_HOUSE_Y}
              stroke="var(--color-washi-solar)" strokeWidth="0.9" strokeDasharray="3,4" opacity="0.18"/>
            {[0, 1, 2].map(j => (
              <circle key={j} r="2.2" fill="var(--color-washi-solar)" opacity="0.7">
                <animateMotion path={`M ${hx} ${GRID_HOUSE_Y} L ${gridX} ${GRID_HOUSE_Y}`}
                  dur="3.5s" begin={`${(j * 1.17 + i * 0.28).toFixed(2)}s`} repeatCount="indefinite"/>
              </circle>
            ))}
          </g>
        ))}

        {/* ── CAR → GRID: horizontal cables + slow particles ── */}
        {CX.map((cx, i) => (
          <g key={`cgc${i}`}>
            <line x1={cx} y1={GRID_CAR_Y} x2={gridX} y2={GRID_CAR_Y}
              stroke="var(--color-washi-solar)" strokeWidth="0.9" strokeDasharray="3,4" opacity="0.18"/>
            {[0, 1, 2].map(j => (
              <circle key={j} r="2.2" fill="var(--color-washi-solar)" opacity="0.7">
                <animateMotion path={`M ${cx} ${GRID_CAR_Y} L ${gridX} ${GRID_CAR_Y}`}
                  dur="3.5s" begin={`${(j * 1.17 + i * 0.22 + 0.7).toFixed(2)}s`} repeatCount="indefinite"/>
              </circle>
            ))}
          </g>
        ))}

        {/* ── HOUSES ── */}
        {HX.map((hx, i) => (
          <g key={`h${i}`}>
            {/* body */}
            <rect x={hx-30} y={H_TOP} width={60} height={H_BOT - H_TOP} rx="2"
              fill="var(--color-bg)" stroke="var(--color-primary)" strokeWidth="1.5"/>
            {/* roof */}
            <polyline points={`${hx-38},${H_TOP+2} ${hx},${H_PEAK} ${hx+38},${H_TOP+2}`}
              fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinejoin="round"/>
            {/* door */}
            <rect x={hx-8} y={H_TOP+20} width={16} height={H_BOT-H_TOP-20} rx="1"
              fill="var(--color-primary)" opacity="0.2"/>
            {/* PV panel on roof slope */}
            <rect x={hx-30} y={H_PEAK+8} width={26} height={14} rx="1"
              fill="var(--color-washi-solar)" opacity="0.9"/>
            <text x={hx-17} y={H_PEAK+18} fontSize="7" fill="var(--color-bg)"
              fontFamily="monospace" fontWeight="bold">PV</text>
            {/* Battery */}
            <rect x={hx+32} y={H_TOP+5} width={8} height={17} rx="1"
              fill="none" stroke="var(--color-primary)" strokeWidth="0.8" opacity="0.45"/>
            <rect x={hx+34} y={H_TOP+3} width={4} height={2}
              fill="var(--color-primary)" opacity="0.35"/>
            <rect x={hx+33} y={H_TOP+19} width={6} height={3} rx="0.5" fill="var(--color-washi-solar)">
              <animate attributeName="height" values="3;15;15;7;3"
                keyTimes="0;0.58;0.78;0.93;1" dur="24s" begin={`${i * 0.5}s`} repeatCount="indefinite"/>
              <animate attributeName="y" values={`${H_TOP+19};${H_TOP+7};${H_TOP+7};${H_TOP+13};${H_TOP+19}`}
                keyTimes="0;0.58;0.78;0.93;1" dur="24s" begin={`${i * 0.5}s`} repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.35;0.9;0.9;0.6;0.35"
                keyTimes="0;0.58;0.78;0.93;1" dur="24s" begin={`${i * 0.5}s`} repeatCount="indefinite"/>
            </rect>
          </g>
        ))}

        {/* ── CARS (offset x from houses) ── */}
        {CX.map((cx, i) => (
          <g key={`c${i}`} style={tr}>
            {/* cabin */}
            <rect x={cx-20} y={C_CAB_Y} width={40} height={C_TOP - C_CAB_Y} rx="3"
              fill="var(--color-bg)"
              stroke={dispActive ? 'var(--color-washi-solar)' : 'var(--color-primary)'}
              strokeWidth="1" style={tr}/>
            {/* body */}
            <rect x={cx-32} y={C_TOP} width={64} height={C_BOT - C_TOP} rx="4"
              fill="var(--color-bg)"
              stroke={dispActive ? 'var(--color-washi-solar)' : 'var(--color-primary)'}
              strokeWidth="1.5" style={tr}/>
            {/* wheels */}
            <circle cx={cx-18} cy={C_WHEEL_Y} r="8"
              fill={dispActive ? 'var(--color-washi-solar)' : '#475569'}
              opacity="0.65" style={tr}/>
            <circle cx={cx+18} cy={C_WHEEL_Y} r="8"
              fill={dispActive ? 'var(--color-washi-solar)' : '#475569'}
              opacity="0.65" style={tr}/>
            {/* charging bolt */}
            <text x={cx} y={C_TOP + 16} textAnchor="middle" fontSize="12"
              fill="var(--color-washi-solar)"
              opacity={dispActive ? 0.95 : 0} style={tr}>⚡</text>
          </g>
        ))}

        {/* ── House + Car → VPP: dashed bezier lines (visible from step 1) ── */}
        {showLines && HX.map((hx, i) => (
          <path key={`hvl${i}`} d={houseToVppLine(hx)} fill="none"
            stroke="var(--color-primary)" strokeWidth="1.2" strokeDasharray="5,4"
            opacity={aggActive ? 0.5 : 0.22} style={tr}/>
        ))}
        {showLines && CX.map((cx, i) => (
          <path key={`cvl${i}`} d={carToVppLine(cx)} fill="none"
            stroke={dispActive ? 'var(--color-washi-solar)' : 'var(--color-primary)'}
            strokeWidth="1.2" strokeDasharray="5,4"
            opacity={aggActive ? 0.5 : 0.22} style={tr}/>
        ))}

        {/* ── VPP → Houses: command particles flow DOWN to houses ── */}
        {showLines && HX.map((hx, i) => (
          <g key={`vph${i}`}>
            {[0, 1, 2].map(j => (
              <circle key={j} r="2.5" fill="var(--color-primary)"
                opacity={aggActive ? 0.9 : 0.5}>
                <animateMotion path={vppToHousePath(hx)}
                  dur="2.8s"
                  begin={`${(j * 0.93 + i * 0.18).toFixed(2)}s`} repeatCount="indefinite"/>
              </circle>
            ))}
          </g>
        ))}

        {/* ── VPP → Cars: command particles flow DOWN to cars ── */}
        {showLines && CX.map((cx, i) => (
          <g key={`vpc${i}`}>
            {[0, 1, 2].map(j => (
              <circle key={j} r="2.5"
                fill={dispActive ? 'var(--color-washi-solar)' : 'var(--color-primary)'}
                opacity={aggActive ? 0.9 : 0.5} style={tr}>
                <animateMotion path={vppToCarPath(cx)}
                  dur={dispActive ? '2.2s' : '2.8s'}
                  begin={`${(j * 0.93 + i * 0.22).toFixed(2)}s`} repeatCount="indefinite"/>
              </circle>
            ))}
          </g>
        ))}

        {/* ── VPP CONTROLLER ── */}
        <rect x={VPP_CX-VPP_W/2-3} y={VPP_Y-3} width={VPP_W+6} height={VPP_H+6} rx="5"
          fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
          <animate attributeName="opacity" values="0.2;0.5;0.2" dur="2s" repeatCount="indefinite"/>
        </rect>
        <rect x={VPP_CX-VPP_W/2} y={VPP_Y} width={VPP_W} height={VPP_H} rx="3"
          fill="color-mix(in srgb, var(--color-primary) 12%, var(--color-bg))"
          stroke="var(--color-primary)" strokeWidth="2"/>
        <text x={VPP_CX} y={VPP_Y+22} textAnchor="middle" fontSize="9"
          fill="var(--color-primary)" fontFamily="monospace" letterSpacing="0.15em">VPP CONTROLLER</text>
        <text x={VPP_CX} y={VPP_Y+48} textAnchor="middle" fontSize="18"
          fill="var(--color-washi-ink)" fontFamily="var(--font-heading)">Flexa (Enpal)</text>

        {/* ── AGGREGATE callout (step 2) ── */}
        {aggActive && <>
          <line x1={VPP_CX-VPP_W/2-26} y1={VPP_Y+VPP_H/2} x2={VPP_CX-VPP_W/2} y2={VPP_Y+VPP_H/2}
            stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="4,3" opacity="0.55"/>
          <foreignObject x={VPP_CX-VPP_W/2-26-248} y={VPP_Y-8} width={248} height={80}>
            <div style={{
              padding: '10px 14px', height: '100%', boxSizing: 'border-box',
              border: '1.5px solid var(--color-primary)',
              borderLeft: '4px solid var(--color-primary)',
              background: 'color-mix(in srgb, var(--color-primary) 8%, var(--color-bg))',
              animation: 'whatisvpp-left 0.4s cubic-bezier(0.4,0,0.2,1) both',
            }}>
              <div style={{ fontFamily: 'monospace', color: 'var(--color-primary)', fontSize: 9, letterSpacing: '0.12em' }}>AGGREGATE</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#e2e8f0', marginTop: 3 }}>Pool energy from distributed homes</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>1,000 homes × 10 kWh = 10 MWh</div>
            </div>
          </foreignObject>
        </>}

        {/* ── DISPATCH callout (step 3) ── */}
        {dispActive && <>
          <line x1={VPP_CX+VPP_W/2} y1={VPP_Y+VPP_H/2} x2={VPP_CX+VPP_W/2+26} y2={VPP_Y+VPP_H/2}
            stroke="var(--color-washi-solar)" strokeWidth="1" strokeDasharray="4,3" opacity="0.55"/>
          <foreignObject x={VPP_CX+VPP_W/2+26} y={VPP_Y-8} width={248} height={80}>
            <div style={{
              padding: '10px 14px', height: '100%', boxSizing: 'border-box',
              border: '1.5px solid var(--color-washi-solar)',
              borderLeft: '4px solid var(--color-washi-solar)',
              background: 'color-mix(in srgb, var(--color-washi-solar) 8%, var(--color-bg))',
              animation: 'whatisvpp-right 0.4s cubic-bezier(0.4,0,0.2,1) both',
            }}>
              <div style={{ fontFamily: 'monospace', color: 'var(--color-washi-solar)', fontSize: 9, letterSpacing: '0.12em' }}>DISPATCH · SMART CHARGING</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: 13, color: '#e2e8f0', marginTop: 3 }}>Charge · Discharge · Wait</div>
              <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>Commands reach every device in milliseconds</div>
            </div>
          </foreignObject>
        </>}

      </svg>

      {/* ── Title overlay (above SVG) ── */}
      <div style={{ position: 'absolute', top: 38, left: 58, pointerEvents: 'none', zIndex: 1 }}>
        <Eyebrow>WHAT IS A VIRTUAL POWER PLANT?</Eyebrow>
        <Title>One controller. Millions of devices.</Title>
      </div>

      <style>{`
        @keyframes whatisvpp-left{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes whatisvpp-right{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:translateX(0)}}
        @keyframes wvpp-sun{0%{opacity:0}22%{opacity:0}28%{opacity:0.92}70%{opacity:0.92}78%{opacity:0}100%{opacity:0}}
        @keyframes wvpp-moon{0%{opacity:0.9}20%{opacity:0.9}27%{opacity:0}70%{opacity:0}78%{opacity:0.9}100%{opacity:0.9}}
        @keyframes wvpp-stars{0%{opacity:0.9}20%{opacity:0.9}27%{opacity:0.05}70%{opacity:0.05}78%{opacity:0.9}100%{opacity:0.9}}
      `}</style>
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
    <Slide {...page}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Eyebrow>GRID MODERNIZATION</Eyebrow>
        <Title>Improve the grid: add batteries + internet</Title>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <StepBridge count={2}>{step => <CapabilityMotif variant="network" step={step} />}</StepBridge>
        </div>
        <Source evidence={E.japanEnergy} />
      </div>
      <Notes>Step 1: connectivity. Step 2: storage. Both are software surfaces already.</Notes>
    </Slide>

    {/* 3 · Japan atlas + 50/60 Hz history quirk */}
    <Slide padding="0" backgroundColor="var(--color-washi-paper)">
      <div style={{ height: '100%', position: 'relative', background: 'var(--color-washi-paper)' }}>
        <Lazy><JapanGridAtlas variant="washi" step={0} preset={mainAtlasPreset} sceneLayer={{ view: { longitude: 132.8, latitude: 38.0, zoom: 4.1, pitch: 18, bearing: 0 } }} /></Lazy>
        <div style={{ position: 'absolute', top: 28, left: 38, maxWidth: 640, padding: '20px 24px', background: 'color-mix(in srgb, var(--color-washi-paper) 90%, transparent)' }}>
          <Eyebrow>1890s · A DECISION THAT NEVER GOT UNDONE</Eyebrow>
          <Title>Two grids, one country</Title>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Small>Tokyo bought its first generators from AEG — Germany, 50 Hz.</Small>
            <Small>Osaka bought from GE — United States, 60 Hz.</Small>
            <Small>Japan is still two grids — bridged by just 2.1 GW of HVDC.</Small>
          </div>
        </div>
      </div>
      <Notes>Japan is not one grid. It is two — 50 Hz east and 60 Hz west — connected by a controllable but capped HVDC bridge. Why: procurement decisions in the 1890s (Tokyo AEG, Osaka GE) that were never unified. This quirk is load-bearing — it becomes decisive in the Fukushima cold-snap chain later.</Notes>
    </Slide>

    {/* 3b · What is a VPP? */}
    <Slide padding="0" backgroundColor="var(--color-washi-paper)">
      <StepBridge count={4}>{step => <WhatIsVPP step={step} />}</StepBridge>
      <Notes>Step 0: base diagram — homes, EVs, bus, VPP Controller, Energy Market, Regulators. Step 1: animated arcs show data flowing from devices to controller. Step 2: Aggregate card — pooling energy. Step 3: Dispatch card — smart commands charge/discharge/wait.</Notes>
    </Slide>

    {/* 4 · PROOF 1 title */}
    <Slide {...page}><div style={{ height: '100%', display: 'grid', alignContent: 'center' }}><Eyebrow tone="var(--color-washi-solar)">PROOF 1 · MARKET PARTICIPATION</Eyebrow><Title>Bring new players into the market</Title><Body>Batteries, EVs, and homes can become trusted grid resources — when they can be coordinated.</Body></div><Notes>Frame proof 1: distributed assets can participate as coordinated flexibility. The problem we're solving lives on the next slide.</Notes></Slide>

    {/* 4b · Renewable Revolution context — foreshadows solar curtailment */}
    <Slide {...page}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <Eyebrow tone="var(--color-washi-solar)">CONTEXT · THE RENEWABLE SURGE</Eyebrow>
          <Title>The renewable revolution — and Japan's position</Title>
          <Small>Solar is the cheapest electricity ever built. Germany shows the trajectory. Japan is at the start of the same curve.</Small>
        </div>
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 0 }}>
          <Lazy><RenewableGrowthChart width={940} height={280} textColor="#0f172a" textMutedColor="#334155" gridColor="#64748b" /></Lazy>
        </div>
        <div style={{ padding: '14px 18px', borderLeft: '3px solid var(--color-washi-alert)', background: 'color-mix(in srgb, var(--color-washi-alert) 6%, transparent)', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', fontSize: 11, letterSpacing: '0.13em' }}>G7 RENEWABLE SHARE · 2023 · JAPAN IS LOWEST</div>
          <div style={{ display: 'flex', gap: 20, marginTop: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            {[
              { c: 'Canada', v: '67%' }, { c: 'Germany', v: '59%' }, { c: 'UK', v: '42%' },
              { c: 'Italy', v: '35%' }, { c: 'France', v: '30%' }, { c: 'USA', v: '23%' },
              { c: 'Japan', v: '22%', highlight: true },
            ].map(g => (
              <div key={g.c} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: g.highlight ? 30 : 22, fontWeight: g.highlight ? 700 : 400, color: g.highlight ? 'var(--color-washi-alert)' : 'var(--color-washi-ink)' }}>{g.v}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em', marginTop: 2, color: g.highlight ? 'var(--color-washi-alert)' : 'var(--color-dim)' }}>{g.c}{g.highlight ? ' ← lowest' : ''}</div>
              </div>
            ))}
          </div>
          <Small style={{ marginTop: 8 }}>Solar is growing fast in Japan — which is exactly what creates the timing problem we're about to see.</Small>
        </div>
      </div>
      <Notes>Germany's trajectory shows where Japan is heading — explosive growth in solar share. But Japan starts from the lowest base in the G7. Solar growing fast + grid not designed for it = the curtailment and timing problems on the next slides. This slide foreshadows the duck curve.</Notes>
    </Slide>

    {/* 5 · Duck Curve (replaces SolarTimingProblem — reuses Amsterdam chart, cleaner narrative) */}
    <Slide {...page}>
      <StepBridge count={6}>{yearStep => (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <Eyebrow tone="var(--color-washi-solar)">PROOF 1 · THE TIMING PROBLEM</Eyebrow>
            <Title>The Duck Curve</Title>
            <Small>Solar floods the grid at noon — prices collapse. At sunset, demand ramps sharply and solar disappears. The belly deepens every year.</Small>
          </div>
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 0 }}>
            <Lazy><DuckCurveChart width={1100} height={480} yearIndex={yearStep} rightPad={270} /></Lazy>
          </div>
        </div>
      )}</StepBridge>
      <Notes>Step through 2015→2025 (6 steps × 2 years). The duck curve: midday solar causes a deep belly in net load. At sunset, demand ramps steeply — the grid needs ramping capacity it doesn't have. This happens in Japan too, and it's getting worse every year as more solar comes online. The Tokyo curtailment case study is exactly this problem made real.</Notes>
    </Slide>

    {/* 6 · Tokyo duck curve + 2026 curtailment facts */}
    <Slide padding="0" backgroundColor="var(--color-bg)">
      <StepBridge count={6}>{step => (
        <div style={{ position: 'relative', height: '100%' }}>
          {/* step 4 → scene 3 (Kashiwazaki zoom-out); else clamp to scenes 0-2 */}
          <TokyoDuckCurveCaseStudy step={step >= 4 ? 3 : Math.min(step, 2)} />
          {/* Curtailment fact cards — appear at step 3+ */}
          {step >= 3 && (
            <div style={{ position: 'absolute', top: 34, right: 44, width: 400, display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
              <div style={{
                padding: '14px 16px',
                border: '1px solid color-mix(in srgb, var(--color-washi-alert) 55%, transparent)',
                background: 'color-mix(in srgb, var(--color-bg) 90%, transparent)',
                backdropFilter: 'blur(8px)',
                animation: 'fadeSlideIn 0.45s ease',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-washi-alert)', fontSize: 11, letterSpacing: '0.14em' }}>MARCH 1, 2026 · FIRST-EVER TEPCO CURTAILMENT</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, marginTop: 6, color: 'var(--color-heading)', lineHeight: 1.2 }}>Solar curtailment reaches Tokyo</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, marginTop: 6, color: 'var(--color-dim)', lineHeight: 1.5 }}>
                  TEPCO ordered renewable output cuts 11:00–16:00 JST. Tokyo was Japan's last holdout grid. By March 29, peaks hit <span style={{ color: 'var(--color-washi-alert)', fontWeight: 600 }}>3,290 MW</span> — 16.2 GWh of clean energy wasted in late March alone.
                </div>
                <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-dim)', opacity: 0.7 }}>Source: pv-magazine.com · Wood Mackenzie (LinkedIn)</div>
              </div>
              {step >= 4 && (
                <div style={{
                  padding: '14px 16px',
                  border: '1px solid color-mix(in srgb, var(--color-secondary) 55%, transparent)',
                  background: 'color-mix(in srgb, var(--color-bg) 90%, transparent)',
                  backdropFilter: 'blur(8px)',
                  animation: 'fadeSlideIn 0.45s ease',
                }}>
                  <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', fontSize: 11, letterSpacing: '0.14em' }}>NUCLEAR + SOLAR CLASH · NIIGATA</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: 18, marginTop: 6, color: 'var(--color-heading)', lineHeight: 1.2 }}>Kashiwazaki-Kariwa Unit 6 restart</div>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, marginTop: 6, color: 'var(--color-dim)', lineHeight: 1.5 }}>
                    High daytime solar + low weekend demand + nuclear restart = inflexible oversupply. Transmission lines could not export the excess. Under ANRE rules, FIT solar is curtailed before FIP — small rooftop systems bear the brunt.
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Curtailment data graph (step 5) */}
          {step >= 5 && (
            <div style={{
              position: 'absolute', inset: 0, background: 'color-mix(in srgb, var(--color-bg) 94%, transparent)',
              backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '24px 44px', gap: 36, animation: 'fadeSlideIn 0.5s ease',
            }}>
              <img src="/curtailment-march-2026.jpeg"
                style={{ maxHeight: 480, maxWidth: 680, objectFit: 'contain', border: '1px solid color-mix(in srgb, var(--color-secondary) 30%, transparent)', borderRadius: 2 }}
                alt="March 2026 TEPCO curtailment chart — Wood Mackenzie via LinkedIn" />
              <div style={{ maxWidth: 320, flexShrink: 0 }}>
                <div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-secondary)', letterSpacing: '0.14em', fontSize: 11 }}>SOURCE · WOOD MACKENZIE · LINKEDIN</div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 22, marginTop: 8, color: 'var(--color-heading)', lineHeight: 1.15 }}>March 2026 curtailment: the data</div>
                <div style={{ fontFamily: 'var(--font-body)', fontSize: 14, marginTop: 10, color: 'var(--color-dim)', lineHeight: 1.55 }}>
                  Peak curtailment reached <strong style={{ color: 'var(--color-washi-alert)' }}>3,290 MW</strong> on March 29. 16.2 GWh of clean energy wasted in late March alone. Tokyo was the last major grid in Japan to experience curtailment — now none are exempt.
                </div>
                <div style={{ marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-primary)' }}>whatisavpp.com/research/japan-energy-flexibility</div>
              </div>
            </div>
          )}
          <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>
        </div>
      )}</StepBridge>
      <Notes>Steps 0-2: duck curve case study. Step 3: March 1 2026 first-ever TEPCO curtailment card — peaks at 3,290 MW, 16.2 GWh wasted. Step 4: nuclear clash card + map zooms out to Niigata showing Kashiwazaki-Kariwa Unit 6. Step 5: actual curtailment data graph from Wood Mackenzie LinkedIn post.</Notes>
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
    {/* Each cascade event gets two steps: first shows the cascade text, second adds the VPP counterfactual */}
    <Slide padding="0" backgroundColor="var(--color-bg)">
      <StepBridge count={22}>{step => {
        const cascadeStep = Math.floor(step / 2);
        const showVPP = step % 2 === 1;
        return (
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Lazy><JapanColdSnapCascade step={cascadeStep} shiftCard={showVPP} /></Lazy>
            {showVPP && <VppCounterfactualOverlay step={cascadeStep} />}
          </div>
        );
      }}</StepBridge>
      <Notes>22 steps (11 cascade events × 2). Odd-numbered steps show the cascade event only. Even-numbered steps add the VPP counterfactual card — read the original text first, then the VPP response. Do not pretend the counterfactual happened. The point lands cumulatively: not one heroic dispatch, a fleet always inside the operating envelope.</Notes>
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
