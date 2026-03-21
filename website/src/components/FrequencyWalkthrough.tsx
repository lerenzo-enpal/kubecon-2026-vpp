// TODO: Share core logic with presentation/src/components/FrequencyWalkthrough.jsx
import { useState, useEffect, useRef } from 'react';

// Canvas/SVG needs raw hex, not CSS custom properties
const colors = {
  primary: '#22d3ee',
  accent: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  bg: '#0a0e17',
  surface: '#1a2236',
  surfaceLight: '#243049',
};

const c = colors.primary;

interface Step {
  freq: number | null;
  freqColor: string;
  gridState: string;
  status: string | null;
  band: string | null;
  scenario: string | null;
  gridTimeSec: number | null;
}

const STEPS: Step[] = [
  { freq: 50.000, freqColor: c, gridState: 'boot', status: null, band: null, scenario: null, gridTimeSec: 0 },
  { freq: 49.800, freqColor: colors.success, gridState: 'normal', status: 'NOMINAL', band: '49.8 -- 50.2 Hz', scenario: 'Normal operating band. Spinning reserves on standby.', gridTimeSec: 0 },
  { freq: 49.500, freqColor: colors.accent, gridState: 'reserves', status: 'WARNING', band: '49.8 -- 49.0 Hz', scenario: 'Reserves activate. Gas CCGT ramps to max output.', gridTimeSec: 30 },
  { freq: 49.000, freqColor: colors.danger, gridState: 'shedding', status: 'EMERGENCY', band: 'Below 49.0 Hz', scenario: 'Reserves maxed. Peaker fires. Load shedding begins.', gridTimeSec: 300 },
  { freq: 47.500, freqColor: colors.danger, gridState: 'collapse', status: 'SYSTEM FAILURE', band: '47.5 Hz', scenario: 'Generators disconnect to self-protect. Total collapse.', gridTimeSec: 720 },
];

// -- Mission clock (T+MM:SS, spins up on transition) --
function GridClock({ targetSec }: { targetSec: number | null }) {
  const [display, setDisplay] = useState(targetSec || 0);
  const rafRef = useRef<number>(0);
  const prevRef = useRef(0);

  useEffect(() => {
    if (targetSec == null) return;
    const from = prevRef.current;
    const to = targetSec;
    if (from === to) { setDisplay(to); return; }
    const start = performance.now();
    const dur = 800;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * e));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetSec]);

  if (targetSec == null) return null;

  const mins = Math.floor(display / 60);
  const secs = display % 60;
  const timeStr = `T+${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  return (
    <div style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: '0.08em',
      color: display >= 300 ? colors.danger : display >= 30 ? colors.accent : colors.textMuted,
      textShadow: display >= 30 ? `0 0 10px ${display >= 300 ? colors.danger : colors.accent}40` : 'none',
      transition: 'color 0.6s',
    }}>{timeStr}</div>
  );
}

// -- SVG draw helpers --
function dS(on: boolean, delay: number, dur = 0.6) {
  if (!on) return { strokeDasharray: 1, strokeDashoffset: 1 };
  return { strokeDasharray: 1, strokeDashoffset: 1, animation: `fwDraw ${dur}s ease ${delay}s forwards` };
}
function dSF(on: boolean, delay: number, dur = 0.6, fd?: number) {
  const fillD = fd != null ? fd : delay + dur * 0.7;
  if (!on) return { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  return { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0, animation: `fwDraw ${dur}s ease ${delay}s forwards, fwFill 0.3s ease ${fillD}s forwards` };
}
function flk(on: boolean, delay: number) {
  if (!on) return { opacity: 0 };
  return { opacity: 0, animation: `fwFlicker 0.5s ease ${delay}s forwards` };
}

// -- Frequency trace SVG --
function FreqLine({ step, width = 480, height = 45 }: { step: number; width?: number; height?: number }) {
  const pad = { l: 8, r: 8, t: 8, b: 8 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;
  const vals = [50.0, 49.8, 49.5, 49.0, 47.5];
  const minF = 47.0, maxF = 50.5;
  const pts = vals.slice(0, Math.max(step + 1, 2)).map((f, i, a) => ({
    x: pad.l + (i / (a.length - 1 || 1)) * w,
    y: pad.t + (1 - (f - minF) / (maxF - minF)) * h,
  }));
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cpx} ${pts[i - 1].y}, ${cpx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const lc = step <= 1 ? colors.success : step <= 2 ? colors.accent : colors.danger;
  const y50 = pad.t + (1 - (50.0 - minF) / (maxF - minF)) * h;
  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>
      <line x1={pad.l} y1={y50} x2={width - pad.r} y2={y50} stroke={colors.textDim} strokeWidth={1} strokeDasharray="4 3" opacity={0.3} />
      <text x={width - pad.r - 2} y={y50 - 4} textAnchor="end" fill={colors.textDim} fontSize={9} fontFamily="'JetBrains Mono', monospace" opacity={0.4}>50 Hz</text>
      <path d={d} fill="none" stroke={lc} strokeWidth={5} opacity={0.1} />
      <path d={d} fill="none" stroke={lc} strokeWidth={2} opacity={0.9} />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={lc} opacity={0.9}>
        <animate attributeName="r" values="4;6;4" dur="1.5s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

// -- Plant body components --

function CoalBody({ x, y, w, h, strokeColor, fillColor, lit, draw, smoking, drawDelay }: any) {
  const groundY = y + h;
  const hallW = w * 0.50, hallH = h * 0.55;
  const hallY = groundY - hallH;
  const stackBotW = w * 0.07, stackTopW = w * 0.045, stackH = h * 0.42;
  const stackCX = x + hallW * 0.4, stackTop = hallY - stackH;
  const twW = w * 0.28, twH = h * 0.88;
  const twX = x + w * 0.62, twCX = twX + twW / 2;
  const twBot = groundY;

  return (
    <g>
      <rect pathLength="1" x={x} y={hallY} width={hallW} height={hallH} rx={1}
        stroke={strokeColor} strokeWidth="1.5" fill={fillColor}
        filter={lit ? 'url(#fwG)' : undefined}
        style={{ ...dSF(draw, drawDelay, 0.5), transition: 'stroke 0.5s, fill 0.5s' }} />
      <path pathLength="1" d={`M ${stackCX - stackBotW / 2} ${hallY - 1} L ${stackCX - stackTopW / 2} ${stackTop} L ${stackCX + stackTopW / 2} ${stackTop} L ${stackCX + stackBotW / 2} ${hallY - 1}`}
        stroke={strokeColor} strokeWidth="1" fill={fillColor}
        style={{ ...dSF(draw, drawDelay + 0.12, 0.3), transition: 'stroke 0.5s' }} />
      <path pathLength="1" d={`M ${twX} ${twBot} Q ${twX + twW * 0.1} ${twBot - twH * 0.55}, ${twX + twW * 0.06} ${twBot - twH} L ${twX + twW * 0.94} ${twBot - twH} Q ${twX + twW * 0.9} ${twBot - twH * 0.55}, ${twX + twW} ${twBot} Z`}
        stroke={strokeColor} strokeWidth="1.5" fill={fillColor}
        filter={lit ? 'url(#fwG)' : undefined}
        style={{ ...dSF(draw, drawDelay + 0.06, 0.5), transition: 'stroke 0.5s, fill 0.5s' }} />
      {smoking && (
        <g>
          <circle cx={stackCX} cy={stackTop} r={4} fill={c + '30'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 28} dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="r" from="4" to="14" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.6" to="0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={stackCX + 3} cy={stackTop} r={3} fill={c + '25'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 22} dur="2.3s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="r" from="3" to="11" dur="2.3s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" from="0.5" to="0" dur="2.3s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx={twCX} cy={twBot - twH + 2} r={5} fill={c + '22'}>
            <animate attributeName="cy" from={twBot - twH + 2} to={twBot - twH - 25} dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="r" from="5" to="16" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.55" to="0" dur="2.2s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
    </g>
  );
}

function GasBody({ x, y, w, h, strokeColor, fillColor, lit, draw, smoking, drawDelay, smokeColor: smokeColorProp, smokeSpeed = 1 }: any) {
  const groundY = y + h;
  const bldgW = w * 0.32, bldgH = h * 0.6;
  const bldgX = x + w * 0.58, bldgY = groundY - bldgH;
  const stackBotW = w * 0.065, stackTopW = w * 0.04, stackH = h * 0.35;
  const stackCX = bldgX + bldgW * 0.5, stackTop = bldgY - stackH;
  const shaftH = h * 0.18;
  const shaftY = groundY - shaftH;
  const shaftX1 = x + w * 0.2, shaftX2 = bldgX;
  const intakeW = w * 0.18, intakeH = h * 0.3;
  const intakeX = x + 1, intakeY = groundY - intakeH;
  const smokeColor = smokeColorProp || c;
  const sd = (base: number) => base * smokeSpeed;

  return (
    <g>
      <rect pathLength="1" x={bldgX} y={bldgY} width={bldgW} height={bldgH} rx={1}
        stroke={strokeColor} strokeWidth="1.5" fill={fillColor}
        filter={lit ? 'url(#fwG)' : undefined}
        style={{ ...dSF(draw, drawDelay, 0.5), transition: 'stroke 0.5s, fill 0.5s' }} />
      {[0.2, 0.55].map((wy, yi) => [0.2, 0.6].map((wx, xi) => (
        <rect key={`w${yi}${xi}`} pathLength="1"
          x={bldgX + bldgW * wx} y={bldgY + bldgH * wy}
          width={bldgW * 0.2} height={bldgH * 0.1} rx={0.5}
          stroke={strokeColor} strokeWidth="0.5" fill={fillColor}
          style={dSF(draw, drawDelay + 0.2 + yi * 0.03 + xi * 0.02, 0.2)} />
      )))}
      <path pathLength="1" d={`M ${stackCX - stackBotW / 2} ${bldgY - 1} L ${stackCX - stackTopW / 2} ${stackTop} L ${stackCX + stackTopW / 2} ${stackTop} L ${stackCX + stackBotW / 2} ${bldgY - 1}`}
        stroke={strokeColor} strokeWidth="1" fill={fillColor}
        style={{ ...dSF(draw, drawDelay + 0.06, 0.35), transition: 'stroke 0.5s' }} />
      <rect pathLength="1" x={shaftX1} y={shaftY} width={shaftX2 - shaftX1} height={shaftH} rx={1}
        stroke={strokeColor} strokeWidth="1.2" fill={fillColor}
        style={{ ...dSF(draw, drawDelay + 0.1, 0.3), transition: 'stroke 0.5s' }} />
      <path pathLength="1" d={`M ${intakeX} ${intakeY} L ${shaftX1} ${shaftY} L ${shaftX1} ${groundY} L ${intakeX} ${groundY} Z`}
        stroke={strokeColor} strokeWidth="1.2" fill={fillColor}
        style={{ ...dSF(draw, drawDelay + 0.12, 0.3), transition: 'stroke 0.5s' }} />
      {smoking && (
        <g>
          <circle cx={stackCX} cy={stackTop} r={4} fill={smokeColor + '35'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 26} dur={`${sd(1.5)}s`} repeatCount="indefinite" />
            <animate attributeName="r" from="4" to="13" dur={`${sd(1.5)}s`} repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.65" to="0" dur={`${sd(1.5)}s`} repeatCount="indefinite" />
          </circle>
          <circle cx={stackCX + 3} cy={stackTop} r={3} fill={smokeColor + '28'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 20} dur={`${sd(1.9)}s`} repeatCount="indefinite" begin="0.4s" />
            <animate attributeName="r" from="3" to="10" dur={`${sd(1.9)}s`} repeatCount="indefinite" begin="0.4s" />
            <animate attributeName="opacity" from="0.55" to="0" dur={`${sd(1.9)}s`} repeatCount="indefinite" begin="0.4s" />
          </circle>
        </g>
      )}
    </g>
  );
}

function PlantUnit({ x, y, w, h, type, label, status, statusColor, utilization,
  strokeColor, fillColor, lit, draw, smoking, drawDelay = 0, smokeColor, smokeSpeed }: any) {
  const barW = w - 10;
  const barX = x + 5;
  const barY = y + h + 8;
  const labelY = barY + 14;
  const statusY = labelY + 11;
  const centerX = x + w / 2;

  return (
    <g>
      {type === 'coal' ? (
        <CoalBody x={x} y={y} w={w} h={h} strokeColor={strokeColor} fillColor={fillColor}
          lit={lit} draw={draw} smoking={smoking} drawDelay={drawDelay} />
      ) : (
        <GasBody x={x} y={y} w={w} h={h} strokeColor={strokeColor} fillColor={fillColor}
          lit={lit} draw={draw} smoking={smoking} drawDelay={drawDelay} smokeColor={smokeColor} smokeSpeed={smokeSpeed} />
      )}
      <rect x={barX} y={barY} width={barW} height={4} rx={2} fill={colors.surface}
        stroke={c + '18'} strokeWidth="0.5" style={flk(draw, drawDelay + 0.3)} />
      <rect x={barX} y={barY} rx={2} height={4}
        width={barW * utilization} fill={statusColor}
        style={{ transition: 'width 0.8s ease, fill 0.6s', ...flk(draw, drawDelay + 0.3) }} />
      <text x={centerX} y={labelY} textAnchor="middle" fill={strokeColor} fontSize="9"
        fontFamily="'JetBrains Mono'" fontWeight="600" letterSpacing="0.05em"
        style={{ ...flk(draw, drawDelay + 0.35), transition: 'fill 0.8s' }}>{label}</text>
      <text x={centerX} y={statusY} textAnchor="middle" fill={statusColor} fontSize="8"
        fontFamily="'JetBrains Mono'" fontWeight="700" letterSpacing="0.06em"
        style={{ ...flk(draw, drawDelay + 0.35), transition: 'fill 0.8s' }}>{status}</text>
    </g>
  );
}

// -- Layout constants --
const PW = 120, PH = 95;
const PLANTS = {
  coal:    { x: 20,  y: 210, w: PW, h: PH },
  reserve: { x: 20,  y: 20,  w: PW, h: PH },
  peaker:  { x: 220, y: 115, w: PW, h: PH },
};
const SUB = { x: 530, y: 165, w: 55, h: 50 };
const HOUSES = [
  { x: 700, y: 45, id: 'h0' },
  { x: 780, y: 32, id: 'h1' },
  { x: 860, y: 50, id: 'h2' },
  { x: 700, y: 225, id: 'h3' },
  { x: 780, y: 195, id: 'h4' },
  { x: 860, y: 135, id: 'h5' },
];

const pr = (p: { x: number; y: number; w: number; h: number }) => ({ rx: p.x + p.w, cy: p.y + p.h * 0.55 });

const CONN_ALL = [
  { id: 'res2s',  d: `M ${pr(PLANTS.reserve).rx} ${pr(PLANTS.reserve).cy} Q ${(pr(PLANTS.reserve).rx + SUB.x) / 2} ${pr(PLANTS.reserve).cy} ${SUB.x} ${SUB.y + 12}`, wd: 0.8, group: 'gen', peakerLine: false, shed: false },
  { id: 'coal2s', d: `M ${pr(PLANTS.coal).rx} ${pr(PLANTS.coal).cy} Q ${(pr(PLANTS.coal).rx + SUB.x) / 2} ${pr(PLANTS.coal).cy} ${SUB.x} ${SUB.y + SUB.h - 10}`, wd: 0.8, group: 'gen', peakerLine: false, shed: false },
  { id: 'peak2s', d: `M ${pr(PLANTS.peaker).rx} ${pr(PLANTS.peaker).cy} Q ${(pr(PLANTS.peaker).rx + SUB.x) / 2} ${pr(PLANTS.peaker).cy} ${SUB.x} ${SUB.y + SUB.h / 2}`, wd: 0.8, group: 'gen', peakerLine: true, shed: false },
  ...[
    { hi: 1, shed: false },
    { hi: 0, shed: false },
    { hi: 2, shed: false },
    { hi: 5, shed: true },
    { hi: 4, shed: true },
    { hi: 3, shed: false },
  ].map(({ hi, shed }, sortIdx) => {
    const h = HOUSES[hi];
    const exitY = SUB.y + 5 + sortIdx * (SUB.h - 10) / 5;
    return {
      id: `s2h${hi}`, d: `M ${SUB.x + SUB.w} ${exitY} L ${h.x + 14} ${h.y}`,
      wd: 1.3 + sortIdx * 0.05, group: 'dist', shed, peakerLine: false,
    };
  }),
];

// -- Grid diagram --
function GridDiagram({ state, draw }: { state: string; draw: boolean }) {
  const isCollapse = state === 'collapse';
  const isShedding = state === 'shedding' || isCollapse;
  const isReserves = state === 'reserves' || isShedding;

  const lineC = (isCollapse || isShedding) ? colors.danger + '50' : isReserves ? colors.accent + '60' : c + '40';
  const reserveS = (isCollapse || isShedding) ? colors.accent + '80' : c + '55';
  const reserveF = (isCollapse || isShedding) ? colors.accent + '06' : c + '06';
  const peakerS = (isCollapse || isShedding) ? colors.accent : isReserves ? colors.accent : c + '30';
  const peakerF = (isCollapse || isShedding) ? colors.accent + '06' : isReserves ? colors.accent + '06' : c + '03';
  const coalS = c + '50';
  const coalF = c + '05';

  const reserveUtil = isCollapse ? 0 : isShedding ? 1.0 : isReserves ? 1.0 : 0.5;
  const peakerUtil = isCollapse ? 0 : isShedding ? 0.95 : 0.05;
  const coalUtil = isCollapse ? 0 : isShedding ? 0.90 : isReserves ? 0.88 : 0.85;

  const reserveStatus = isCollapse ? 'OFFLINE' : isShedding ? 'MAX OUTPUT' : isReserves ? 'MAX OUTPUT' : 'PARTIAL LOAD';
  const peakerStatus = isCollapse ? 'OFFLINE' : isShedding ? 'RAMPING' : 'IDLE';
  const coalStatus = isCollapse ? 'OFFLINE' : isShedding ? 'RAMP +3%' : isReserves ? 'RAMP +3%' : 'BASELOAD';

  const reserveStatusC = isCollapse ? colors.textDim + '40' : isReserves ? colors.accent : colors.success + '99';
  const peakerStatusC = isCollapse ? colors.textDim + '40' : isShedding ? colors.accent : colors.textDim + '50';
  const coalStatusC = isCollapse ? colors.textDim + '40' : colors.success + '99';

  const reserveFlowDur = isReserves ? 0.8 : 2;
  const peakerFlowDur = 1.2;
  const coalFlowDur = 1.5;

  const [litMap, setLitMap] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!draw) { setLitMap({}); return; }
    const cascade: [string, number][] = [
      ['reserve', 800], ['coalPlant', 850], ['gasPlant', 900],
      ['substation', 1200],
      ['h0', 1500], ['h3', 1520], ['h1', 1580], ['h4', 1600], ['h2', 1650], ['h5', 1680],
    ];
    const timers = cascade.map(([id, ms]) => setTimeout(() => setLitMap(m => ({ ...m, [id]: true })), ms));
    return () => timers.forEach(clearTimeout);
  }, [draw]);

  const coalLit = !!litMap.coalPlant && !isCollapse;
  const reserveLit = !!litMap.reserve && !isCollapse;

  return (
    <svg viewBox="0 0 1000 360" style={{ width: '100%', height: '100%' }} preserveAspectRatio="xMidYMid meet">
      <defs>
        <filter id="fwG"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <pattern id="fwGrid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke={c} strokeWidth="0.3" opacity="0.05" />
        </pattern>
        <radialGradient id="fwGM" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="white" stopOpacity="0.45" />
          <stop offset="100%" stopColor="white" stopOpacity="0.02" />
        </radialGradient>
        <mask id="fwGF"><rect width="1000" height="360" fill="url(#fwGM)" /></mask>
      </defs>

      <rect width="1000" height="360" fill="url(#fwGrid)" mask="url(#fwGF)" />

      {/* Connection lines */}
      {CONN_ALL.map((conn, i) => {
        const dark = isShedding && conn.shed;
        const drawDelay = conn.group === 'gen' ? 0.3 : 0.7 + i * 0.03;
        return (
          <path key={conn.id} d={conn.d}
            stroke={dark ? colors.danger + '25' : lineC}
            strokeWidth={conn.group === 'gen' ? 1.5 : 1.2} fill="none" pathLength="1"
            style={{ ...dS(draw, drawDelay), transition: 'stroke 0.8s' }} />
        );
      })}

      {/* Energy flow */}
      {draw && !isCollapse && (
        <g>
          {CONN_ALL.map(conn => {
            if (isShedding && conn.shed) return null;
            if (conn.peakerLine && !isShedding) return null;
            const isPeaker = conn.peakerLine;
            const isReserve = conn.id === 'res2s';
            const pulseC = isShedding ? colors.danger
              : isPeaker ? colors.accent
              : isReserve && isReserves ? colors.accent
              : isReserves ? colors.accent
              : c;
            return (
              <path key={`p-${conn.id}`} pathLength="1" d={conn.d}
                stroke={pulseC} strokeWidth={3} fill="none" strokeDasharray="0.12 0.88"
                style={{ strokeDashoffset: 1, opacity: 0, animation: `fwPulse 0.3s linear ${conn.wd}s forwards` }} />
            );
          })}
          {CONN_ALL.map((conn, i) => {
            if (isShedding && conn.shed) return null;
            if (conn.peakerLine && !isShedding) return null;
            const flowStart = conn.wd + 0.25;
            const isPeaker = conn.peakerLine;
            const isReserve = conn.id === 'res2s';
            const flowC = isShedding ? colors.danger
              : isPeaker ? colors.accent
              : isReserve && isReserves ? colors.accent
              : isReserves ? colors.accent + '90'
              : c;
            const dur = conn.group === 'gen'
              ? (isPeaker ? peakerFlowDur : isReserve ? reserveFlowDur : coalFlowDur)
              : 1.2 + i * 0.04;
            return (
              <path key={`f-${conn.id}`} d={conn.d} stroke={flowC} strokeWidth={2} fill="none"
                strokeDasharray="8 10"
                style={{ opacity: 0, animation: `fwFadeIn 0.15s ease ${flowStart}s forwards, fwFlowDash ${dur}s linear ${flowStart}s infinite` }} />
            );
          })}
        </g>
      )}

      {/* Substation */}
      {(() => {
        const subLit = !!litMap.substation && !isCollapse;
        const subS = (isCollapse || isShedding) ? colors.danger + '60'
          : isReserves ? colors.accent + '60'
          : subLit ? c + '80' : c + '45';
        const coilS = (isCollapse || isShedding) ? colors.danger + '80'
          : isReserves ? colors.accent + '80'
          : subLit ? c : c + '55';
        const sx = SUB.x, sy = SUB.y, sw = SUB.w, sh = SUB.h;
        const bushingC = (isCollapse || isShedding) ? colors.danger + 'cc'
          : isReserves ? colors.accent + 'aa'
          : subLit ? c + '90' : c + '40';
        const bushingGlow = isShedding || isReserves;
        const b1x = sx + sw * 0.3, b2x = sx + sw * 0.7;
        const bushingH = 30, bushingTop = sy - bushingH;
        const discW = 8;
        return (
          <g>
            <rect pathLength="1" x={sx} y={sy} width={sw} height={sh} rx={3}
              stroke={subS} strokeWidth="1.5" fill={subLit ? c + '0a' : c + '04'}
              filter={subLit ? 'url(#fwG)' : undefined}
              style={{ ...dSF(draw, 0.5, 0.5), transition: 'stroke 0.5s, fill 0.5s' }} />
            <polyline pathLength="1" points={`${sx + 14},${sy + 10} ${sx + 26},${sy + 18} ${sx + 14},${sy + 26} ${sx + 26},${sy + 34} ${sx + 14},${sy + 42}`}
              stroke={coilS} strokeWidth={(subLit || isReserves) ? 2 : 1.5} fill="none"
              filter={(subLit || isReserves) ? 'url(#fwG)' : undefined}
              style={(subLit || isReserves) && !isCollapse
                ? { strokeDasharray: 'none', strokeDashoffset: 0, animation: 'fwCoilPulse 1.2s ease-in-out infinite', transition: 'stroke 0.5s' }
                : { ...dS(draw, 0.55), transition: 'stroke 0.5s' }} />
            <polyline pathLength="1" points={`${sx + 28},${sy + 10} ${sx + 40},${sy + 18} ${sx + 28},${sy + 26} ${sx + 40},${sy + 34} ${sx + 28},${sy + 42}`}
              stroke={coilS} strokeWidth={(subLit || isReserves) ? 2 : 1.5} fill="none"
              filter={(subLit || isReserves) ? 'url(#fwG)' : undefined}
              style={(subLit || isReserves) && !isCollapse
                ? { strokeDasharray: 'none', strokeDashoffset: 0, animation: 'fwCoilPulse 1.2s ease-in-out infinite 0.6s', transition: 'stroke 0.5s' }
                : { ...dS(draw, 0.58), transition: 'stroke 0.5s' }} />
            {[b1x, b2x].map((bx, bi) => (
              <g key={`bush${bi}`}>
                <line pathLength="1" x1={bx} y1={sy} x2={bx} y2={bushingTop}
                  stroke={bushingC} strokeWidth="1.5"
                  style={{ ...dS(draw, 0.52 + bi * 0.03), transition: 'stroke 0.5s' }} />
                {[0.25, 0.5, 0.75].map((p, di) => {
                  const dy = sy - bushingH * p;
                  return (
                    <line key={di} pathLength="1" x1={bx - discW} y1={dy} x2={bx + discW} y2={dy}
                      stroke={bushingC} strokeWidth="1"
                      style={{ ...dS(draw, 0.54 + bi * 0.03 + di * 0.02), transition: 'stroke 0.5s' }} />
                  );
                })}
                <circle cx={bx} cy={bushingTop} r={2.5}
                  fill={bushingGlow ? bushingC : subLit ? c + '60' : c + '25'}
                  stroke={bushingC} strokeWidth="0.5"
                  filter={bushingGlow ? 'url(#fwG)' : undefined}
                  style={{ ...dSF(draw, 0.56 + bi * 0.03), transition: 'fill 0.5s, stroke 0.5s' }} />
                {isShedding && !isCollapse && (
                  <g>
                    <line x1={bx - 4} y1={bushingTop - 2} x2={bx - 8} y2={bushingTop - 6}
                      stroke={colors.danger} strokeWidth="1"
                      style={{ animation: `fwArc ${0.3 + bi * 0.15}s ease-in-out infinite` }} />
                    <line x1={bx + 3} y1={bushingTop - 3} x2={bx + 7} y2={bushingTop - 8}
                      stroke={colors.danger} strokeWidth="0.8"
                      style={{ animation: `fwArc ${0.4 + bi * 0.1}s ease-in-out infinite 0.15s` }} />
                  </g>
                )}
                {isCollapse && (
                  <g>
                    {[
                      { dx: -6, dy: -4, l: 10 }, { dx: 5, dy: -6, l: 9 }, { dx: -3, dy: -8, l: 8 },
                    ].map((sp, si) => (
                      <line key={si}
                        x1={bx} y1={bushingTop}
                        x2={bx + sp.dx} y2={bushingTop + sp.dy - sp.l}
                        stroke={si < 2 ? colors.danger : colors.accent} strokeWidth={si < 1 ? 1.2 : 0.8}
                        style={{ animation: `fwArc ${0.2 + si * 0.08}s ease-in-out infinite ${bi * 0.1 + si * 0.05}s` }} />
                    ))}
                    <circle cx={bx} cy={bushingTop - 2} r={3} fill={colors.textDim + '30'}>
                      <animate attributeName="cy" from={bushingTop - 2} to={bushingTop - 22} dur="2.5s" repeatCount="indefinite" begin={`${0.5 + bi * 0.3}s`} />
                      <animate attributeName="r" from="3" to="10" dur="2.5s" repeatCount="indefinite" begin={`${0.5 + bi * 0.3}s`} />
                      <animate attributeName="opacity" from="0.5" to="0" dur="2.5s" repeatCount="indefinite" begin={`${0.5 + bi * 0.3}s`} />
                    </circle>
                  </g>
                )}
              </g>
            ))}
            <text x={sx + sw / 2} y={sy + sh + 14} textAnchor="middle"
              fill={isCollapse ? colors.danger + '40' : c + '28'} fontSize="8"
              fontFamily="'JetBrains Mono'" letterSpacing="0.1em"
              style={{ ...flk(draw, 0.65), transition: 'fill 0.5s' }}>SUBSTATION</text>
          </g>
        );
      })()}

      {/* Plants */}
      <PlantUnit {...PLANTS.reserve} type="gas" label="GAS CCGT" status={reserveStatus}
        statusColor={reserveStatusC} utilization={reserveUtil}
        strokeColor={isReserves && !isCollapse ? colors.accent + '80' : reserveLit ? c + '80' : reserveS}
        fillColor={isReserves && !isCollapse ? colors.accent + '06' : reserveLit ? c + '08' : reserveF}
        lit={reserveLit || (isReserves && !isCollapse)} draw={draw}
        smoking={!!litMap.reserve && !isCollapse} drawDelay={0}
        smokeColor={isReserves ? colors.accent : c}
        smokeSpeed={isReserves ? 0.6 : 1} />

      <PlantUnit {...PLANTS.peaker} type="gas" label="GAS PEAKER" status={peakerStatus}
        statusColor={peakerStatusC} utilization={peakerUtil}
        strokeColor={peakerS} fillColor={peakerF}
        lit={isShedding && !isCollapse} draw={draw} smoking={isShedding && !isCollapse} drawDelay={0.05}
        smokeColor={colors.accent}
        smokeSpeed={0.7} />

      <PlantUnit {...PLANTS.coal} type="coal" label="COAL BASELOAD" status={coalStatus}
        statusColor={coalStatusC} utilization={coalUtil}
        strokeColor={coalLit ? c + '80' : coalS} fillColor={coalLit ? c + '08' : coalF}
        lit={coalLit} draw={draw} smoking={!!litMap.coalPlant && !isCollapse} drawDelay={0.08} />

      {/* Houses */}
      {HOUSES.map((h, i) => {
        const dark = (isShedding && i >= 4) || isCollapse;
        const lit = !!litMap[h.id] && !dark;
        const hs = dark ? colors.textDim + '40' : lit ? c + '70' : c + '35';
        const wf = lit ? colors.accent + 'aa' : '#0a0e18';
        const ws = lit ? colors.accent + '50' : c + '18';
        const rW = 28, rH = 18;
        const houseDelay = 0.9 + i * 0.05;
        return (
          <g key={`h${i}`} style={{ transition: 'opacity 0.8s' }}>
            <polygon pathLength="1" points={`${h.x - 1},${h.y + 10} ${h.x + rW / 2},${h.y} ${h.x + rW + 1},${h.y + 10}`}
              stroke={hs} strokeWidth="1.2" fill="none" strokeLinejoin="round"
              style={{ ...dS(draw, houseDelay), transition: 'stroke 0.5s' }} />
            <rect pathLength="1" x={h.x} y={h.y + 10} width={rW} height={rH} rx={2}
              stroke={hs} strokeWidth="1.2" fill={c + '03'}
              style={{ ...dSF(draw, houseDelay + 0.04), transition: 'stroke 0.5s' }} />
            <rect x={h.x + 8} y={h.y + 14} width={11} height={8} rx={1}
              fill={wf} stroke={ws} strokeWidth="0.6" filter={lit ? 'url(#fwG)' : undefined}
              style={{ opacity: lit ? 1 : 0, transition: 'all 0.3s ease' }} />
            {dark && (
              <text x={h.x + rW / 2} y={h.y + 23} textAnchor="middle" fill={colors.danger}
                fontSize={14} fontFamily="'JetBrains Mono'" fontWeight={700} opacity={0.8}>x</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// -- Step indicator dots --
function StepDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => {
        const s = STEPS[i];
        const active = i === step;
        return (
          <div
            key={i}
            style={{
              width: active ? 10 : 6,
              height: active ? 10 : 6,
              borderRadius: '50%',
              background: active ? s.freqColor : colors.surfaceLight,
              border: active ? `1px solid ${s.freqColor}` : '1px solid transparent',
              boxShadow: active ? `0 0 6px ${s.freqColor}60` : 'none',
              transition: 'all 0.3s',
            }}
          />
        );
      })}
    </div>
  );
}

// -- Main component --
interface Props {
  height?: number;
}

export default function FrequencyWalkthrough({ height = 480 }: Props) {
  const [step, setStep] = useState(0);
  const s = STEPS[step];
  const showGrid = step >= 1;
  const isCollapse = s.gridState === 'collapse';

  const [gridReady, setGridReady] = useState(false);
  useEffect(() => {
    if (step >= 1 && !gridReady) {
      const t = setTimeout(() => setGridReady(true), 800);
      return () => clearTimeout(t);
    }
    if (step < 1) setGridReady(false);
  }, [step, gridReady]);

  const goNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const goPrev = () => setStep(s => Math.max(s - 1, 0));
  const goReset = () => { setStep(0); setGridReady(false); };

  // Zone labels for the step indicator
  const zoneLabels = ['50.000 Hz', '49.800 Hz', '49.500 Hz', '49.000 Hz', '47.500 Hz'];

  return (
    <div style={{ position: 'relative', width: '100%', height, background: colors.bg, borderRadius: 6, overflow: 'hidden' }}>
      <style>{`
        @keyframes fwDraw { to { stroke-dashoffset: 0; } }
        @keyframes fwFill { to { fill-opacity: 1; } }
        @keyframes fwFlicker {
          0% { opacity: 0; } 10% { opacity: 0.7; } 18% { opacity: 0.1; }
          30% { opacity: 0.85; } 42% { opacity: 0.25; } 58% { opacity: 1; } 100% { opacity: 1; }
        }
        @keyframes fwFlickerBig {
          0% { opacity: 0; filter: blur(4px); } 8% { opacity: 0.8; filter: blur(0); }
          15% { opacity: 0.1; } 28% { opacity: 0.9; } 38% { opacity: 0.2; }
          55% { opacity: 1; } 100% { opacity: 1; filter: blur(0); }
        }
        @keyframes fwScan {
          0% { clip-path: inset(0 100% 0 0); opacity: 0.4; }
          100% { clip-path: inset(0 0% 0 0); opacity: 1; }
        }
        @keyframes fwPulse {
          0% { stroke-dashoffset: 1; opacity: 0.9; }
          80% { opacity: 0.9; }
          100% { stroke-dashoffset: -0.12; opacity: 0; }
        }
        @keyframes fwCoilPulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }
        @keyframes fwArc {
          0%, 100% { opacity: 0; } 15% { opacity: 0.8; } 30% { opacity: 0; }
          55% { opacity: 0.6; } 70% { opacity: 0; }
        }
        @keyframes fwFadeIn { from { opacity: 0; } to { opacity: 0.8; } }
        @keyframes fwFlowDash { to { stroke-dashoffset: -18; } }
      `}</style>

      {/* Boot screen: big frequency */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', zIndex: 20,
        opacity: step === 0 ? 1 : 0,
        pointerEvents: step === 0 ? 'auto' : 'none',
        transform: step === 0 ? 'scale(1)' : 'scale(0.85)',
        filter: step === 0 ? 'blur(0px)' : 'blur(12px)',
        transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 11, fontWeight: 600,
          letterSpacing: '0.2em', textTransform: 'uppercase' as const, marginBottom: 12,
          color: colors.textDim,
        }}>GRID FREQUENCY</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 72, fontWeight: 800,
          color: c, textShadow: `0 0 30px ${c}50, 0 0 60px ${c}20`,
          lineHeight: 1,
        }}>50.000</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 22, fontWeight: 300,
          color: c + 'aa', marginTop: 4,
        }}>Hz</div>
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, letterSpacing: '0.2em',
          textTransform: 'uppercase' as const, marginTop: 12,
          color: colors.success,
        }}>FREQUENCY LOCKED</div>
        <div style={{
          fontFamily: '"Inter", sans-serif', fontSize: 14, marginTop: 16,
          color: colors.textMuted,
        }}>Supply and demand must balance every single second.</div>
      </div>

      {/* HUD + Grid */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
        opacity: showGrid ? 1 : 0,
        transform: showGrid ? 'none' : 'translateY(15px)',
        transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
        pointerEvents: showGrid ? 'auto' : 'none',
      }}>
        {/* Top HUD bar */}
        <div style={{
          padding: '10px 16px', display: 'flex', gap: 12, alignItems: 'stretch',
          flexShrink: 0,
        }}>
          {/* Frequency display */}
          <div style={{
            background: 'rgba(5,8,16,0.9)', border: `1px solid ${s.freqColor}30`,
            boxShadow: `0 0 20px ${s.freqColor}12, inset 0 0 12px ${s.freqColor}06`,
            borderRadius: 8, padding: '10px 16px', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', minWidth: 130,
            transition: 'border-color 0.6s, box-shadow 0.6s',
          }}>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 2,
              color: colors.textDim }}>Grid Frequency</div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 32, fontWeight: 800,
              color: s.freqColor, textShadow: `0 0 20px ${s.freqColor}30`,
              transition: 'color 0.6s', lineHeight: 1,
            }}>{s.freq?.toFixed(3)}</div>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11, color: colors.textDim }}>Hz</div>
          </div>

          {/* Info panel */}
          <div style={{
            flex: 1, background: 'rgba(5,8,16,0.9)', border: `1px solid ${colors.surfaceLight}`,
            borderRadius: 8, padding: '10px 14px', display: 'flex', flexDirection: 'column',
            justifyContent: 'space-between', minWidth: 0,
          }}>
            <div>
              <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.15em', textTransform: 'uppercase' as const, marginBottom: 4,
                color: colors.textDim }}>Frequency Trace</div>
              <FreqLine step={step} />
            </div>
            <div style={{ marginTop: 6 }}>
              {s.band && <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 13, fontWeight: 600,
                color: s.freqColor, transition: 'color 0.6s', marginBottom: 2 }}>{s.band}</div>}
              {s.scenario && <div style={{ fontFamily: '"Inter", sans-serif', fontSize: 14,
                color: colors.text }}>{s.scenario}</div>}
            </div>
          </div>
        </div>

        {/* Grid diagram */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          <GridDiagram state={s.gridState} draw={gridReady} />
        </div>
      </div>

      {/* Status bar (bottom, during normal/warning/emergency) */}
      {showGrid && s.status && !isCollapse && (
        <div style={{
          position: 'absolute', bottom: 48, left: 0, right: 0, zIndex: 10,
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            borderRadius: 8, display: 'flex', alignItems: 'center',
            background: 'rgba(5,8,16,0.85)',
            border: `1px solid ${step <= 1 ? colors.success + '30' : step <= 2 ? colors.accent + '30' : colors.danger + '30'}`,
            transition: 'border-color 0.6s',
          }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase' as const,
              width: 140, textAlign: 'center', padding: '6px 0', fontSize: 14,
              color: step <= 1 ? colors.success : step <= 2 ? colors.accent : colors.danger,
              textShadow: step > 1 ? `0 0 12px ${step <= 2 ? colors.accent : colors.danger}40` : 'none',
              transition: 'color 0.6s',
            }}>{s.status}</div>
            <div style={{ width: 1, height: 18, background: colors.surfaceLight, flexShrink: 0 }} />
            <div style={{ width: 140, display: 'flex', justifyContent: 'center', padding: '6px 0' }}>
              <GridClock targetSec={s.gridTimeSec} />
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM FAILURE banner */}
      {isCollapse && (
        <div style={{
          position: 'absolute', bottom: 48, left: 0, right: 0, zIndex: 10,
          display: 'flex', justifyContent: 'center',
        }}>
          <div style={{
            borderRadius: 8, padding: '10px 32px', textAlign: 'center',
            background: 'rgba(5,8,16,0.92)',
            border: `1px solid ${colors.danger}50`,
            boxShadow: `0 0 30px ${colors.danger}20, inset 0 0 20px ${colors.danger}08`,
            animation: 'fwFlickerBig 0.8s ease forwards',
          }}>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontWeight: 800,
              letterSpacing: '0.15em', textTransform: 'uppercase' as const,
              fontSize: 18, color: colors.danger,
              textShadow: `0 0 20px ${colors.danger}60`,
              animation: 'fwCoilPulse 1.5s ease-in-out infinite',
            }}>SYSTEM FAILURE</div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 11, marginTop: 4,
              color: colors.danger + 'aa',
            }}>All generators disconnected -- total grid collapse</div>
            <div style={{ marginTop: 6 }}>
              <GridClock targetSec={s.gridTimeSec} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation controls (bottom) */}
      <div style={{
        position: 'absolute', bottom: 10, left: 0, right: 0, zIndex: 30,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}>
        <button
          onClick={goPrev}
          disabled={step === 0}
          style={{
            background: step === 0 ? colors.surface + '60' : colors.surface,
            border: `1px solid ${colors.surfaceLight}`,
            color: step === 0 ? colors.textDim + '50' : colors.textMuted,
            padding: '4px 14px', borderRadius: 6, cursor: step === 0 ? 'default' : 'pointer',
            fontSize: 12, fontFamily: '"JetBrains Mono"', fontWeight: 500,
          }}
        >Previous</button>
        <StepDots step={step} total={STEPS.length} />
        <div style={{
          fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: colors.textDim,
          minWidth: 70, textAlign: 'center',
        }}>{zoneLabels[step]}</div>
        {step < STEPS.length - 1 ? (
          <button
            onClick={goNext}
            style={{
              background: colors.surface,
              border: `1px solid ${colors.surfaceLight}`,
              color: colors.textMuted,
              padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontFamily: '"JetBrains Mono"', fontWeight: 500,
            }}
          >Next</button>
        ) : (
          <button
            onClick={goReset}
            style={{
              background: colors.surface,
              border: `1px solid ${colors.surfaceLight}`,
              color: colors.textMuted,
              padding: '4px 14px', borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontFamily: '"JetBrains Mono"', fontWeight: 500,
            }}
          >Reset</button>
        )}
      </div>
    </div>
  );
}
