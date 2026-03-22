import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../theme';

const c = colors.primary;

const STEPS = [
  { freq: 50.000, freqColor: c, gridState: 'boot', status: null, band: null, scenario: null, gridTimeSec: 0 },
  { freq: 49.800, freqColor: colors.success, gridState: 'normal', status: 'NOMINAL', band: '49.8 — 50.2 Hz', scenario: 'Normal operating band. Spinning reserves on standby.', gridTimeSec: 0 },
  { freq: 49.500, freqColor: colors.accent, gridState: 'reserves', status: 'WARNING', band: '49.8 — 49.0 Hz', scenario: 'Reserves activate. Gas CCGT ramps to max output.', gridTimeSec: 30 },
  { freq: 49.000, freqColor: colors.danger, gridState: 'shedding', status: 'EMERGENCY', band: 'Below 49.0 Hz', scenario: 'Reserves maxed. Peaker fires. Load shedding begins.', gridTimeSec: 300 },
  { freq: 47.500, freqColor: colors.danger, gridState: 'collapse', status: 'SYSTEM FAILURE', band: '47.5 Hz', scenario: 'Generators disconnect to self-protect. Total collapse.', gridTimeSec: 720 },
  { freq: null, freqColor: colors.accent, gridState: 'collapse', status: null, band: null, scenario: null, gridTimeSec: null },
];

// ─── Mission clock (T+MM:SS, spins up on transition) ───
function GridClock({ targetSec }) {
  const [display, setDisplay] = useState(targetSec || 0);
  const rafRef = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    if (targetSec == null) return;
    const from = prevRef.current;
    const to = targetSec;
    if (from === to) { setDisplay(to); return; }
    const start = performance.now();
    const dur = 800; // spin-up duration in ms
    const tick = (now) => {
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
    <div className="font-mono text-[20px] font-bold tracking-[0.08em]" style={{
      color: display >= 300 ? colors.danger : display >= 30 ? colors.accent : colors.textMuted,
      textShadow: display >= 30 ? `0 0 10px ${display >= 300 ? colors.danger : colors.accent}40` : 'none',
      transition: 'color 0.6s',
    }}>{timeStr}</div>
  );
}

// ─── Typewriter text ───
function Typewriter({ text, delay = 0, speed = 30, className, style }) {
  const [shown, setShown] = useState(0);
  const timerRef = useRef(null);
  useEffect(() => {
    setShown(0);
    const startTimeout = setTimeout(() => {
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        setShown(i);
        if (i >= text.length) clearInterval(timerRef.current);
      }, speed);
    }, delay);
    return () => { clearTimeout(startTimeout); clearInterval(timerRef.current); };
  }, [text, delay, speed]);

  return (
    <span className={className} style={style}>
      {text.slice(0, shown)}
      {shown < text.length && <span style={{ opacity: shown > 0 ? 1 : 0, animation: 'fwCursor 0.6s step-end infinite' }}>_</span>}
    </span>
  );
}

// ─── SVG draw helpers ───
function dS(on, delay, dur = 0.6) {
  if (!on) return { strokeDasharray: 1, strokeDashoffset: 1 };
  return { strokeDasharray: 1, strokeDashoffset: 1, animation: `fwDraw ${dur}s ease ${delay}s forwards` };
}
function dSF(on, delay, dur = 0.6, fd) {
  const fillD = fd != null ? fd : delay + dur * 0.7;
  if (!on) return { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  return { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0, animation: `fwDraw ${dur}s ease ${delay}s forwards, fwFill 0.3s ease ${fillD}s forwards` };
}
function flk(on, delay) {
  if (!on) return { opacity: 0 };
  return { opacity: 0, animation: `fwFlicker 0.5s ease ${delay}s forwards` };
}

// ─── Hollywood spy-tech frequency counter ───
function FreqCounter({ target = 50.000, active }) {
  const [display, setDisplay] = useState('00.000');
  const [phase, setPhase] = useState(0);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!active) { setDisplay('00.000'); setPhase(0); return; }
    const scrambleStart = performance.now();
    const scrambleDur = 500;
    const scramble = (now) => {
      const t = (now - scrambleStart) / scrambleDur;
      if (t < 1) {
        const locked = Math.floor(t * 6);
        const targetStr = target.toFixed(3);
        let s = '';
        for (let i = 0; i < 6; i++) {
          if (i === 2) { s += '.'; continue; }
          const di = i > 2 ? i - 1 : i;
          s += di < locked ? targetStr[i] : Math.floor(Math.random() * 10).toString();
        }
        setDisplay(s);
        rafRef.current = requestAnimationFrame(scramble);
      } else {
        setDisplay(target.toFixed(3));
        setPhase(1);
        timerRef.current = setTimeout(() => setPhase(2), 300);
      }
    };
    rafRef.current = requestAnimationFrame(scramble);
    return () => { cancelAnimationFrame(rafRef.current); clearTimeout(timerRef.current); };
  }, [active, target]);

  return (
    <div className="text-center relative" style={{
      opacity: active ? 1 : 0,
      animation: active ? 'fwFlickerBig 0.6s ease forwards' : 'none',
    }}>
      {active && (
        <div className="absolute" style={{ inset: '-20px -50px', opacity: 0, animation: 'fwBrackets 0.6s ease 0.15s forwards' }}>
          <svg width="100%" height="100%" viewBox="0 0 200 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0 }}>
            <polyline points="0,15 0,0 20,0" fill="none" stroke={c} strokeWidth="1" opacity="0.4" />
            <polyline points="180,0 200,0 200,15" fill="none" stroke={c} strokeWidth="1" opacity="0.4" />
            <polyline points="0,85 0,100 20,100" fill="none" stroke={c} strokeWidth="1" opacity="0.4" />
            <polyline points="180,100 200,100 200,85" fill="none" stroke={c} strokeWidth="1" opacity="0.4" />
          </svg>
        </div>
      )}
      <div className="text-[11px] font-mono font-semibold tracking-[0.2em] uppercase mb-3" style={{
        color: colors.textDim, animation: active ? 'fwScan 0.3s ease 0.3s both' : 'none',
      }}>GRID FREQUENCY LOCK</div>
      <div className="text-[92px] font-extrabold font-mono leading-none" style={{
        color: c, textShadow: phase >= 2 ? `0 0 30px ${c}50, 0 0 60px ${c}20` : `0 0 15px ${c}30`,
        transition: 'text-shadow 0.3s ease', letterSpacing: phase < 1 ? '0.08em' : '0.02em',
      }}>{display}</div>
      <div className="text-[28px] font-mono font-light mt-1" style={{
        color: phase >= 2 ? c + 'aa' : c + '50', transition: 'color 0.3s', animation: active ? 'fwScan 0.3s ease 0.6s both' : 'none',
      }}>Hz</div>
      <div className="text-[10px] font-mono tracking-[0.2em] uppercase mt-3" style={{
        color: phase >= 2 ? colors.success : colors.textDim, transition: 'color 0.3s', animation: active ? 'fwScan 0.3s ease 0.8s both' : 'none',
      }}>{phase >= 2 ? 'FREQUENCY LOCKED' : phase >= 1 ? 'LOCKING...' : 'ACQUIRING...'}</div>
      <div className="text-[16px] text-hud-text-muted font-sans mt-5" style={{
        animation: active ? 'fwScan 0.5s ease 1.1s both' : 'none',
      }}>Imbalances propagate at 0.67c. There is no buffer.</div>
    </div>
  );
}

// ─── Frequency trace SVG ───
function FreqLine({ step, width = 480, height = 55 }) {
  const pad = { l: 8, r: 8, t: 8, b: 8 };
  const w = width - pad.l - pad.r, h = height - pad.t - pad.b;
  const vals = [50.0, 49.8, 49.5, 49.0, 47.5, 47.5];
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
    <svg width={width} height={height} style={{ display: 'block' }}>
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

// ─── Plant unit: self-contained plant with utilization bar + label ───
// All elements stay within the bounding box [x, y, x+w, y+h+labelSpace]
function PlantUnit({ x, y, w, h, type, label, status, statusColor, utilization,
  strokeColor, fillColor, lit, draw, smoking, drawDelay = 0, smokeColor, smokeSpeed }) {

  const barW = w - 10;
  const barX = x + 5;
  const barY = y + h + 8;
  const labelY = barY + 14;
  const statusY = labelY + 11;
  const centerX = x + w / 2;

  return (
    <g>
      {/* Plant body */}
      {type === 'coal' ? (
        <CoalBody x={x} y={y} w={w} h={h} strokeColor={strokeColor} fillColor={fillColor}
          lit={lit} draw={draw} smoking={smoking} drawDelay={drawDelay} />
      ) : (
        <GasBody x={x} y={y} w={w} h={h} strokeColor={strokeColor} fillColor={fillColor}
          lit={lit} draw={draw} smoking={smoking} drawDelay={drawDelay} smokeColor={smokeColor} smokeSpeed={smokeSpeed} />
      )}
      {/* Utilization bar */}
      <rect x={barX} y={barY} width={barW} height={4} rx={2} fill={colors.surface}
        stroke={c + '18'} strokeWidth="0.5" style={flk(draw, drawDelay + 0.3)} />
      <rect x={barX} y={barY} rx={2} height={4}
        width={barW * utilization} fill={statusColor}
        style={{ transition: 'width 0.8s ease, fill 0.6s', ...flk(draw, drawDelay + 0.3) }} />
      {/* Label */}
      <text x={centerX} y={labelY} textAnchor="middle" fill={strokeColor} fontSize="11"
        fontFamily="'JetBrains Mono'" fontWeight="600" letterSpacing="0.05em"
        style={{ ...flk(draw, drawDelay + 0.35), transition: 'fill 0.8s' }}>{label}</text>
      {/* Status */}
      <text x={centerX} y={statusY} textAnchor="middle" fill={statusColor} fontSize="10"
        fontFamily="'JetBrains Mono'" fontWeight="700" letterSpacing="0.06em"
        style={{ ...flk(draw, drawDelay + 0.35), transition: 'fill 0.8s' }}>{status}</text>
    </g>
  );
}

// ─── Coal plant body ───
// Main boiler hall (left) + tapered smokestack + hyperbolic cooling tower (right)
// All elements aligned to ground at y+h
function CoalBody({ x, y, w, h, strokeColor, fillColor, lit, draw, smoking, drawDelay }) {
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
  const twBot = groundY; // tower base on ground

  return (
    <g>
      {/* Main boiler hall */}
      <rect pathLength="1" x={x} y={hallY} width={hallW} height={hallH} rx={1}
        stroke={strokeColor} strokeWidth="1.5" fill={fillColor}
        filter={lit ? 'url(#fwG)' : undefined}
        style={{ ...dSF(draw, drawDelay, 0.5), transition: 'stroke 0.5s, fill 0.5s' }} />
      {/* Smokestack — tapered, starts 1px above roof to avoid alpha overlap */}
      <path pathLength="1" d={`
        M ${stackCX - stackBotW / 2} ${hallY - 1}
        L ${stackCX - stackTopW / 2} ${stackTop}
        L ${stackCX + stackTopW / 2} ${stackTop}
        L ${stackCX + stackBotW / 2} ${hallY - 1}`}
        stroke={strokeColor} strokeWidth="1" fill={fillColor}
        style={{ ...dSF(draw, drawDelay + 0.12, 0.3), transition: 'stroke 0.5s' }} />
      {/* Cooling tower — hyperbolic shape, bottom at groundY */}
      <path pathLength="1" d={`
        M ${twX} ${twBot}
        Q ${twX + twW * 0.1} ${twBot - twH * 0.55}, ${twX + twW * 0.06} ${twBot - twH}
        L ${twX + twW * 0.94} ${twBot - twH}
        Q ${twX + twW * 0.9} ${twBot - twH * 0.55}, ${twX + twW} ${twBot}
        Z`}
        stroke={strokeColor} strokeWidth="1.5" fill={fillColor}
        filter={lit ? 'url(#fwG)' : undefined}
        style={{ ...dSF(draw, drawDelay + 0.06, 0.5), transition: 'stroke 0.5s, fill 0.5s' }} />
      {/* Smoke — bigger, more visible */}
      {smoking && (
        <g>
          {/* Stack smoke */}
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
          {/* Cooling tower steam */}
          <circle cx={twCX} cy={twBot - twH + 2} r={5} fill={c + '22'}>
            <animate attributeName="cy" from={twBot - twH + 2} to={twBot - twH - 25} dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="r" from="5" to="16" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.55" to="0" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle cx={twCX - 4} cy={twBot - twH + 2} r={4} fill={c + '18'}>
            <animate attributeName="cy" from={twBot - twH + 2} to={twBot - twH - 20} dur="2.8s" repeatCount="indefinite" begin="0.7s" />
            <animate attributeName="r" from="4" to="12" dur="2.8s" repeatCount="indefinite" begin="0.7s" />
            <animate attributeName="opacity" from="0.45" to="0" dur="2.8s" repeatCount="indefinite" begin="0.7s" />
          </circle>
        </g>
      )}
    </g>
  );
}

// ─── Gas plant body ───
// Bell intake (left) → solid shaft → generator building (right) → tapered stack
// All elements aligned to ground at y+h
function GasBody({ x, y, w, h, strokeColor, fillColor, lit, draw, smoking, drawDelay, smokeColor: smokeColorProp, smokeSpeed = 1 }) {
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
  const smokeColor = smokeColorProp || c;
  // Speed multiplier: lower = faster. smokeSpeed=1 is normal, 0.5 is double speed
  const sd = (base) => base * smokeSpeed;

  return (
    <g>
      {/* Generator building */}
      <rect pathLength="1" x={bldgX} y={bldgY} width={bldgW} height={bldgH} rx={1}
        stroke={strokeColor} strokeWidth="1.5" fill={fillColor}
        filter={lit ? 'url(#fwG)' : undefined}
        style={{ ...dSF(draw, drawDelay, 0.5), transition: 'stroke 0.5s, fill 0.5s' }} />
      {/* Building windows (2 rows of 2) */}
      {[0.2, 0.55].map((wy, yi) => [0.2, 0.6].map((wx, xi) => (
        <rect key={`w${yi}${xi}`} pathLength="1"
          x={bldgX + bldgW * wx} y={bldgY + bldgH * wy}
          width={bldgW * 0.2} height={bldgH * 0.1} rx={0.5}
          stroke={strokeColor} strokeWidth="0.5" fill={fillColor}
          style={dSF(draw, drawDelay + 0.2 + yi * 0.03 + xi * 0.02, 0.2)} />
      )))}

      {/* Smokestack — tapered, starts 1px above roof to avoid alpha overlap */}
      <path pathLength="1" d={`
        M ${stackCX - stackBotW / 2} ${bldgY - 1}
        L ${stackCX - stackTopW / 2} ${stackTop}
        L ${stackCX + stackTopW / 2} ${stackTop}
        L ${stackCX + stackBotW / 2} ${bldgY - 1}`}
        stroke={strokeColor} strokeWidth="1" fill={fillColor}
        style={{ ...dSF(draw, drawDelay + 0.06, 0.35), transition: 'stroke 0.5s' }} />

      {/* Turbine shaft (solid connection, sits on ground) */}
      <rect pathLength="1" x={shaftX1} y={shaftY} width={shaftX2 - shaftX1} height={shaftH} rx={1}
        stroke={strokeColor} strokeWidth="1.2" fill={fillColor}
        style={{ ...dSF(draw, drawDelay + 0.1, 0.3), transition: 'stroke 0.5s' }} />

      {/* Bell-shaped air intake (trapezoid: wide left, narrow right, on ground) */}
      <path pathLength="1" d={`
        M ${intakeX} ${intakeY}
        L ${shaftX1} ${shaftY}
        L ${shaftX1} ${groundY}
        L ${intakeX} ${groundY}
        Z`}
        stroke={strokeColor} strokeWidth="1.2" fill={fillColor}
        style={{ ...dSF(draw, drawDelay + 0.12, 0.3), transition: 'stroke 0.5s' }} />

      {/* Smoke — color and speed controlled by props */}
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
          <circle cx={stackCX - 2} cy={stackTop} r={2.5} fill={smokeColor + '20'}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 18} dur={`${sd(2.2)}s`} repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="r" from="2.5" to="8" dur={`${sd(2.2)}s`} repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="opacity" from="0.45" to="0" dur={`${sd(2.2)}s`} repeatCount="indefinite" begin="0.8s" />
          </circle>
        </g>
      )}
    </g>
  );
}

// ─── Layout constants ───
// ViewBox: 1000 x 360  —  more breathing room
// Plants staggered left side | Substation center | Houses right
const PW = 120, PH = 95; // plant dimensions (closer to GridFlowDemo's 165x130 ratio)
const PLANTS = {
  coal:    { x: 20,  y: 210, w: PW, h: PH },    // Coal baseload (bottom-left)
  reserve: { x: 20,  y: 20,  w: PW, h: PH },    // Gas CCGT reserve (top-left)
  peaker:  { x: 220, y: 115, w: PW, h: PH },     // Gas peaker (middle, offset right 200px)
};
const SUB = { x: 530, y: 165, w: 55, h: 50 }; // moved down 20px for bushing space
const HOUSES = [
  { x: 700, y: 45, id: 'h0' },
  { x: 780, y: 32, id: 'h1' },
  { x: 860, y: 50, id: 'h2' },
  { x: 700, y: 225, id: 'h3' },
  { x: 780, y: 195, id: 'h4' },
  { x: 860, y: 135, id: 'h5' },
];

// Connection endpoints: plant right edge → substation left, substation right → house roof
const pr = (p) => ({ rx: p.x + p.w, cy: p.y + p.h * 0.55 }); // plant right-center
const CONN_ALL = [
  { id: 'res2s',  d: `M ${pr(PLANTS.reserve).rx} ${pr(PLANTS.reserve).cy} Q ${(pr(PLANTS.reserve).rx + SUB.x) / 2} ${pr(PLANTS.reserve).cy} ${SUB.x} ${SUB.y + 12}`, wd: 0.8, group: 'gen' },
  { id: 'coal2s', d: `M ${pr(PLANTS.coal).rx} ${pr(PLANTS.coal).cy} Q ${(pr(PLANTS.coal).rx + SUB.x) / 2} ${pr(PLANTS.coal).cy} ${SUB.x} ${SUB.y + SUB.h - 10}`, wd: 0.8, group: 'gen' },
  { id: 'peak2s', d: `M ${pr(PLANTS.peaker).rx} ${pr(PLANTS.peaker).cy} Q ${(pr(PLANTS.peaker).rx + SUB.x) / 2} ${pr(PLANTS.peaker).cy} ${SUB.x} ${SUB.y + SUB.h / 2}`, wd: 0.8, group: 'gen', peakerLine: true },
  // Distribution lines: sorted by target Y so they fan out cleanly without crossing
  // Substation exit points spread across the full right edge (y+5 to y+h-5)
  ...[
    { hi: 1, shed: false },  // h1 y=32  (topmost house)
    { hi: 0, shed: false },  // h0 y=45
    { hi: 2, shed: false },  // h2 y=50
    { hi: 5, shed: true  },  // h5 y=135
    { hi: 4, shed: true  },  // h4 y=195
    { hi: 3, shed: false },  // h3 y=225 (bottommost house)
  ].map(({ hi, shed }, sortIdx) => {
    const h = HOUSES[hi];
    const exitY = SUB.y + 5 + sortIdx * (SUB.h - 10) / 5;
    return {
      id: `s2h${hi}`, d: `M ${SUB.x + SUB.w} ${exitY} L ${h.x + 14} ${h.y}`,
      wd: 1.3 + sortIdx * 0.05, group: 'dist', shed,
    };
  }),
];

// ─── Grid diagram ───
function GridDiagram({ state, draw }) {
  const isCollapse = state === 'collapse';
  const isShedding = state === 'shedding' || isCollapse;
  const isReserves = state === 'reserves' || isShedding;

  // Collapse: same colors as shedding, only differences are: energy stops,
  // utilization bars drop, labels say OFFLINE, X on all houses, bushing sparks
  const lineC = (isCollapse || isShedding) ? colors.danger + '50' : isReserves ? colors.accent + '60' : c + '40';
  const reserveS = (isCollapse || isShedding) ? colors.accent + '80' : c + '55';
  const reserveF = (isCollapse || isShedding) ? colors.accent + '06' : c + '06';
  const peakerS = (isCollapse || isShedding) ? colors.accent : isReserves ? colors.accent : c + '30';
  const peakerF = (isCollapse || isShedding) ? colors.accent + '06' : isReserves ? colors.accent + '06' : c + '03';
  const coalS = (isCollapse || isShedding) ? c + '50' : c + '50';
  const coalF = (isCollapse || isShedding) ? c + '05' : c + '05';

  // Reserve ramps first, peaker only fires after reserve is maxed
  // Partial load at 50% — typical CCGT spinning reserve, shows clear headroom
  const reserveUtil = isCollapse ? 0 : isShedding ? 1.0 : isReserves ? 1.0 : 0.5;
  const peakerUtil = isCollapse ? 0 : isShedding ? 0.95 : 0.05;
  const coalUtil = isCollapse ? 0 : isShedding ? 0.90 : isReserves ? 0.88 : 0.85;

  const reserveStatus = isCollapse ? 'OFFLINE' : isShedding ? 'MAX OUTPUT' : isReserves ? 'MAX OUTPUT' : 'PARTIAL LOAD';
  const peakerStatus = isCollapse ? 'OFFLINE' : isShedding ? 'RAMPING' : 'IDLE';
  const coalStatus = isCollapse ? 'OFFLINE' : isShedding ? 'RAMP +3%' : isReserves ? 'RAMP +3%' : 'BASELOAD';

  const reserveStatusC = isCollapse ? colors.textDim + '40' : isReserves ? colors.accent : colors.success + '99';
  const peakerStatusC = isCollapse ? colors.textDim + '40' : isShedding ? colors.accent : colors.textDim + '50';
  const coalStatusC = isCollapse ? colors.textDim + '40' : colors.success + '99';

  // Reserve CCGT flow: normal=slow(2s), reserves=fast(0.8s) as it ramps to max
  // Peaker flow: only during shedding, starts slow(1.5s) and speeds up
  const reserveFlowDur = isReserves ? 0.8 : 2;
  const peakerFlowDur = 1.2;
  const coalFlowDur = 1.5;

  const [litMap, setLitMap] = useState({});
  useEffect(() => {
    if (!draw) { setLitMap({}); return; }
    const cascade = [
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
    <svg viewBox="0 0 1000 360" style={{
      width: '100%', height: '100%',
    }} preserveAspectRatio="xMidYMid meet">
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

      {/* ─── Connection lines (animate LTR) — peaker line always drawn ─── */}
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

      {/* ─── Energy flow ─── */}
      {draw && !isCollapse && (
        <g>
          {CONN_ALL.map(conn => {
            if (isShedding && conn.shed) return null;
            if (conn.peakerLine && !isShedding) return null;
            // Pulse color matches the line's current state
            const isPeaker = conn.peakerLine;
            const isReserve = conn.id === 'res2s';
            const pulseC = isShedding ? colors.danger  // all lines red during emergency
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
            // Flow color: all red during emergency, amber during warning
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

      {/* ─── Substation with bushings ─── */}
      {(() => {
        const subLit = !!litMap.substation && !isCollapse;
        // Substation colors match bushing state for consistency
        const subS = (isCollapse || isShedding) ? colors.danger + '60'
          : isReserves ? colors.accent + '60'
          : subLit ? c + '80' : c + '45';
        const coilS = (isCollapse || isShedding) ? colors.danger + '80'
          : isReserves ? colors.accent + '80'
          : subLit ? c : c + '55';
        const sx = SUB.x, sy = SUB.y, sw = SUB.w, sh = SUB.h;
        // Bushing colors: normal=cyan, stressed=amber, collapse=dim
        const bushingC = (isCollapse || isShedding) ? colors.danger + 'cc'
          : isReserves ? colors.accent + 'aa'
          : subLit ? c + '90' : c + '40';
        const bushingGlow = isShedding || isReserves;
        // Two bushings on top, spaced across the width
        const b1x = sx + sw * 0.3, b2x = sx + sw * 0.7;
        const bushingH = 30, bushingTop = sy - bushingH;
        const discW = 8; // insulator disc half-width
        return (
          <g>
            {/* Main transformer box */}
            <rect pathLength="1" x={sx} y={sy} width={sw} height={sh} rx={3}
              stroke={subS} strokeWidth="1.5" fill={subLit ? c + '0a' : c + '04'}
              filter={subLit ? 'url(#fwG)' : undefined}
              style={{ ...dSF(draw, 0.5, 0.5), transition: 'stroke 0.5s, fill 0.5s' }} />
            {/* Coils inside */}
            <polyline pathLength="1" points={`${sx + 14},${sy + 10} ${sx + 26},${sy + 18} ${sx + 14},${sy + 26} ${sx + 26},${sy + 34} ${sx + 14},${sy + 42}`}
              stroke={coilS} strokeWidth={subLit || isReserves ? 2 : 1.5} fill="none"
              filter={subLit || isReserves ? 'url(#fwG)' : undefined}
              style={(subLit || isReserves) && !isCollapse
                ? { strokeDasharray: 'none', strokeDashoffset: 0, animation: 'fwCoilPulse 1.2s ease-in-out infinite', transition: 'stroke 0.5s' }
                : { ...dS(draw, 0.55), transition: 'stroke 0.5s' }} />
            <polyline pathLength="1" points={`${sx + 28},${sy + 10} ${sx + 40},${sy + 18} ${sx + 28},${sy + 26} ${sx + 40},${sy + 34} ${sx + 28},${sy + 42}`}
              stroke={coilS} strokeWidth={subLit || isReserves ? 2 : 1.5} fill="none"
              filter={subLit || isReserves ? 'url(#fwG)' : undefined}
              style={(subLit || isReserves) && !isCollapse
                ? { strokeDasharray: 'none', strokeDashoffset: 0, animation: 'fwCoilPulse 1.2s ease-in-out infinite 0.6s', transition: 'stroke 0.5s' }
                : { ...dS(draw, 0.58), transition: 'stroke 0.5s' }} />
            {/* Bushings (two vertical posts with insulator discs) */}
            {[b1x, b2x].map((bx, bi) => (
              <g key={`bush${bi}`}>
                {/* Vertical post */}
                <line pathLength="1" x1={bx} y1={sy} x2={bx} y2={bushingTop}
                  stroke={bushingC} strokeWidth="1.5"
                  style={{ ...dS(draw, 0.52 + bi * 0.03), transition: 'stroke 0.5s' }} />
                {/* Insulator discs (3 ribs) */}
                {[0.25, 0.5, 0.75].map((p, di) => {
                  const dy = sy - bushingH * p;
                  return (
                    <line key={di} pathLength="1" x1={bx - discW} y1={dy} x2={bx + discW} y2={dy}
                      stroke={bushingC} strokeWidth="1"
                      style={{ ...dS(draw, 0.54 + bi * 0.03 + di * 0.02), transition: 'stroke 0.5s' }} />
                  );
                })}
                {/* Top cap (insulator tip — glows when energized) */}
                <circle cx={bx} cy={bushingTop} r={2.5}
                  fill={bushingGlow ? bushingC : subLit ? c + '60' : c + '25'}
                  stroke={bushingC} strokeWidth="0.5"
                  filter={bushingGlow ? 'url(#fwG)' : undefined}
                  style={{ ...dSF(draw, 0.56 + bi * 0.03), transition: 'fill 0.5s, stroke 0.5s' }} />
                {/* Sparks when overheated (shedding state) */}
                {isShedding && !isCollapse && (
                  <g>
                    <line x1={bx - 4} y1={bushingTop - 2} x2={bx - 8} y2={bushingTop - 6}
                      stroke={colors.danger} strokeWidth="1"
                      style={{ animation: `fwArc ${0.3 + bi * 0.15}s ease-in-out infinite` }} />
                    <line x1={bx + 3} y1={bushingTop - 3} x2={bx + 7} y2={bushingTop - 8}
                      stroke={colors.danger} strokeWidth="0.8"
                      style={{ animation: `fwArc ${0.4 + bi * 0.1}s ease-in-out infinite 0.15s` }} />
                    <line x1={bx + 1} y1={bushingTop - 4} x2={bx + 2} y2={bushingTop - 9}
                      stroke={colors.accent} strokeWidth="0.6"
                      style={{ animation: `fwArc ${0.35 + bi * 0.12}s ease-in-out infinite 0.25s` }} />
                  </g>
                )}
              </g>
            ))}
            {/* Bushing arc flash + smoke during collapse */}
            {isCollapse && [b1x, b2x].map((bx, bi) => (
              <g key={`exp${bi}`}>
                {/* Intense sparks radiating from bushing tips */}
                {[
                  { dx: -6, dy: -4, l: 10 }, { dx: 5, dy: -6, l: 9 }, { dx: -3, dy: -8, l: 8 },
                  { dx: 7, dy: -2, l: 7 }, { dx: -8, dy: -1, l: 6 }, { dx: 2, dy: -9, l: 8 },
                ].map((sp, si) => (
                  <line key={si}
                    x1={bx} y1={bushingTop}
                    x2={bx + sp.dx} y2={bushingTop + sp.dy - sp.l}
                    stroke={si < 3 ? colors.danger : colors.accent} strokeWidth={si < 2 ? 1.2 : 0.8}
                    style={{ animation: `fwArc ${0.2 + si * 0.08}s ease-in-out infinite ${bi * 0.1 + si * 0.05}s` }} />
                ))}
                {/* Smoke rising from damaged bushing */}
                <circle cx={bx} cy={bushingTop - 2} r={3} fill={colors.textDim + '30'}>
                  <animate attributeName="cy" from={bushingTop - 2} to={bushingTop - 22} dur="2.5s" repeatCount="indefinite" begin={`${0.5 + bi * 0.3}s`} />
                  <animate attributeName="r" from="3" to="10" dur="2.5s" repeatCount="indefinite" begin={`${0.5 + bi * 0.3}s`} />
                  <animate attributeName="opacity" from="0.5" to="0" dur="2.5s" repeatCount="indefinite" begin={`${0.5 + bi * 0.3}s`} />
                </circle>
                <circle cx={bx + 2} cy={bushingTop - 2} r={2} fill={colors.textDim + '25'}>
                  <animate attributeName="cy" from={bushingTop - 2} to={bushingTop - 18} dur="3s" repeatCount="indefinite" begin={`${0.8 + bi * 0.3}s`} />
                  <animate attributeName="r" from="2" to="8" dur="3s" repeatCount="indefinite" begin={`${0.8 + bi * 0.3}s`} />
                  <animate attributeName="opacity" from="0.4" to="0" dur="3s" repeatCount="indefinite" begin={`${0.8 + bi * 0.3}s`} />
                </circle>
              </g>
            ))}
            {/* Label */}
            <text x={sx + sw / 2} y={sy + sh + 14} textAnchor="middle"
              fill={isCollapse ? colors.danger + '40' : c + '28'} fontSize="8"
              fontFamily="'JetBrains Mono'" letterSpacing="0.1em"
              style={{ ...flk(draw, 0.65), transition: 'fill 0.5s' }}>SUBSTATION</text>
          </g>
        );
      })()}


      {/* ─── Gas CCGT Spinning Reserve (top) ─── */}
      <PlantUnit {...PLANTS.reserve} type="gas" label="GAS CCGT" status={reserveStatus}
        statusColor={reserveStatusC} utilization={reserveUtil}
        strokeColor={isReserves && !isCollapse ? colors.accent + '80' : reserveLit ? c + '80' : reserveS}
        fillColor={isReserves && !isCollapse ? colors.accent + '06' : reserveLit ? c + '08' : reserveF}
        lit={reserveLit || (isReserves && !isCollapse)} draw={draw}
        smoking={!!litMap.reserve && !isCollapse} drawDelay={0}
        smokeColor={isReserves ? colors.accent : c}
        smokeSpeed={isReserves ? 0.6 : 1} />

      {/* ─── Gas Peaker (middle) — only fires after reserve is maxed ─── */}
      <PlantUnit {...PLANTS.peaker} type="gas" label="GAS PEAKER" status={peakerStatus}
        statusColor={peakerStatusC} utilization={peakerUtil}
        strokeColor={peakerS} fillColor={peakerF}
        lit={isShedding && !isCollapse} draw={draw} smoking={isShedding && !isCollapse} drawDelay={0.05}
        smokeColor={colors.accent}
        smokeSpeed={0.7} />

      {/* ─── Coal Baseload (bottom) ─── */}
      <PlantUnit {...PLANTS.coal} type="coal" label="COAL BASELOAD" status={coalStatus}
        statusColor={coalStatusC} utilization={coalUtil}
        strokeColor={coalLit ? c + '80' : coalS} fillColor={coalLit ? c + '08' : coalF}
        lit={coalLit} draw={draw} smoking={!!litMap.coalPlant && !isCollapse} drawDelay={0.08} />

      {/* ─── Houses ─── */}
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


// ─── Supply/Demand Balance scene ───
// step 1: supply < demand (freq drops), step 2: supply > demand (freq rises), step 3: no storage summary
function SupplyDemandScene({ active, step = 1 }) {
  const [freq, setFreq] = useState(50.000);
  const rafRef = useRef(null);
  const prevStepRef = useRef(0);

  useEffect(() => {
    if (!active) { setFreq(50.000); prevStepRef.current = 0; return; }
    if (step === prevStepRef.current) return;
    prevStepRef.current = step;

    const start = performance.now();
    if (step === 1) {
      // Animate freq down to 48.8
      const from = 50.000;
      const anim = (now) => {
        const t = Math.min((now - start) / 1200, 1);
        const e = 1 - Math.pow(1 - t, 3);
        setFreq(from - e * 1.2);
        if (t < 1) rafRef.current = requestAnimationFrame(anim);
      };
      rafRef.current = requestAnimationFrame(anim);
    } else if (step === 2) {
      // Animate freq up to 50.8
      const from = 48.800;
      const anim = (now) => {
        const t = Math.min((now - start) / 1200, 1);
        const e = 1 - Math.pow(1 - t, 3);
        setFreq(from + e * 2.0);
        if (t < 1) rafRef.current = requestAnimationFrame(anim);
      };
      rafRef.current = requestAnimationFrame(anim);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, step]);

  const freqColor = freq < 49.5 ? colors.danger : freq > 50.5 ? colors.accent : colors.success;
  const freqStr = freq.toFixed(3);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Animated frequency counter */}
      <div className="text-center">
        <div className="text-[10px] font-mono font-semibold tracking-[0.2em] uppercase mb-2" style={{ color: colors.textDim }}>
          GRID FREQUENCY
        </div>
        <div className="text-[80px] font-extrabold font-mono leading-none" style={{
          color: freqColor,
          textShadow: `0 0 30px ${freqColor}40, 0 0 60px ${freqColor}20`,
          transition: 'color 0.3s, text-shadow 0.3s',
        }}>{freqStr}</div>
        <div className="text-[24px] font-mono font-light mt-1" style={{ color: freqColor + 'aa' }}>Hz</div>
      </div>

      {/* Supply/demand labels — each on its own arrow press */}
      <div className="flex gap-16 items-center">
        <div className="text-center" style={{
          opacity: step >= 1 ? 1 : 0,
          transform: step >= 1 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s ease',
        }}>
          <div className="text-[32px] font-extrabold font-mono" style={{
            color: colors.danger,
            textShadow: step === 1 ? `0 0 20px ${colors.danger}50` : 'none',
          }}>SUPPLY &lt; DEMAND</div>
          <div className="text-lg font-sans mt-2" style={{ color: colors.textMuted }}>
            Too little power — frequency drops
          </div>
        </div>

        <div className="text-center" style={{
          opacity: step >= 2 ? 1 : 0,
          transform: step >= 2 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.5s ease',
        }}>
          <div className="text-[32px] font-extrabold font-mono" style={{
            color: colors.accent,
            textShadow: step === 2 ? `0 0 20px ${colors.accent}50` : 'none',
          }}>SUPPLY &gt; DEMAND</div>
          <div className="text-lg font-sans mt-2" style={{ color: colors.textMuted }}>
            Too much power — frequency rises
          </div>
        </div>
      </div>

      {/* No storage — on its own arrow press, larger font */}
      <div className="text-center" style={{
        opacity: step >= 3 ? 1 : 0,
        transform: step >= 3 ? 'translateY(0)' : 'translateY(15px)',
        transition: 'all 0.6s ease',
      }}>
        <div className="text-[28px] font-sans font-semibold" style={{ color: colors.text }}>
          The grid has <span className="font-extrabold" style={{ color: colors.primary }}>no storage</span>. Every watt
          produced must be consumed <span className="font-extrabold" style={{ color: colors.primary }}>instantly</span>.
        </div>
      </div>
    </div>
  );
}


// mode="intro": boot → supply/demand → punchline (slide 10)
// mode="scenarios": grid HUD with degradation steps (slide 11)
export default function FrequencyWalkthrough({ step = 0, mode = 'intro' }) {
  // ── Intro mode: step 0=boot, 1=supply/demand, 2=punchline ──
  // ── Scenarios mode: step 0=nominal, 1=warning, 2=emergency, 3=collapse ──
  const scenarioStep = mode === 'scenarios' ? step + 1 : step; // map to STEPS index
  const s = mode === 'scenarios'
    ? STEPS[Math.min(scenarioStep, STEPS.length - 1)]
    : STEPS[Math.min(step, STEPS.length - 1)];

  const showBoot = mode === 'intro' && step === 0;
  const showSupplyDemand = mode === 'intro' && step >= 1 && step <= 3;
  const supplyDemandStep = step; // 1=drop, 2=rise, 3=no storage
  const showPunchline = mode === 'intro' && step >= 4;
  const showHud = mode === 'scenarios' && step >= 0;
  const isCollapse = mode === 'scenarios' && s.gridState === 'collapse';
  const showGrid = mode === 'scenarios' || (mode === 'intro' && step >= 1);

  const [gridReady, setGridReady] = useState(false);
  useEffect(() => {
    if (mode === 'scenarios' && !gridReady) {
      const t = setTimeout(() => setGridReady(true), 800);
      return () => clearTimeout(t);
    }
    if (mode === 'intro') setGridReady(false);
  }, [step, gridReady, mode]);

  return (
    <div className="flex flex-col flex-1 relative" style={{ minHeight: 0 }}>
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
        @keyframes fwGlow {
          0%, 100% { text-shadow: 0 0 20px currentColor, 0 0 40px currentColor; }
          50% { text-shadow: 0 0 60px currentColor, 0 0 120px currentColor, 0 0 180px currentColor; }
        }
        @keyframes fwPunchIn {
          0% { opacity: 0; transform: scale(0.7) translateY(20px); filter: blur(8px); }
          15% { opacity: 0.9; filter: blur(0); } 25% { opacity: 0.15; }
          40% { opacity: 0.85; transform: scale(1.02); } 55% { opacity: 0.3; }
          70% { opacity: 1; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); filter: blur(0); }
        }
        @keyframes fwBrackets {
          0% { opacity: 0; transform: scale(1.3); }
          40% { opacity: 0.6; } 60% { opacity: 0.15; }
          100% { opacity: 0.4; transform: scale(1); }
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
        @keyframes fwCursor { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes fwFadeIn { from { opacity: 0; } to { opacity: 0.8; } }
        @keyframes fwFlowDash { to { stroke-dashoffset: -18; } }
      `}</style>

      {/* ═══ SCENE 1: Big 50.000 Hz ═══ */}
      <div className="absolute inset-0 flex items-center justify-center z-20" style={{
        opacity: showBoot ? 1 : 0,
        pointerEvents: showBoot ? 'auto' : 'none',
        transform: showBoot ? 'scale(1)' : 'scale(0.85)',
        filter: showBoot ? 'blur(0px)' : 'blur(12px)',
        transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)',
      }}>
        <FreqCounter target={50.000} active={showBoot} />
      </div>

      {/* ═══ SCENE 1b: Supply/Demand Balance (intro mode only) ═══ */}
      {mode === 'intro' && (
        <div className="absolute inset-0 flex items-center justify-center z-20" style={{
          opacity: showSupplyDemand ? 1 : 0,
          pointerEvents: showSupplyDemand ? 'auto' : 'none',
          transition: 'opacity 0.6s ease',
        }}>
          <SupplyDemandScene active={showSupplyDemand} step={supplyDemandStep} />
        </div>
      )}

      {/* ═══ SCENE 2: HUD + Grid ═══ */}
      <div className="flex flex-col flex-1" style={{
        minHeight: 0,
        opacity: showGrid ? 1 : 0,
        transform: showGrid ? 'none' : 'translateY(15px)',
        transition: 'opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s',
        pointerEvents: showGrid ? 'auto' : 'none',
      }}>
        <div style={{ height: 160, marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', flexShrink: 0 }}>
          <div style={{
            opacity: showHud ? 1 : 0,
            transform: showHud ? 'none' : (showPunchline ? 'translateX(-120px)' : 'none'),
            transition: showPunchline ? 'all 0.6s cubic-bezier(0.4,0,0.2,1)' : 'opacity 0.5s ease',
            width: '100%', maxWidth: 860,
            animation: (showHud && step === 0 && mode === 'scenarios') ? 'fwScan 0.6s ease 0.5s both' : 'none',
          }}>
            <div className="flex gap-5 items-stretch">
              <div className="rounded-lg p-4 flex flex-col items-center justify-center" style={{
                background: 'rgba(5,8,16,0.9)', border: `1px solid ${s.freqColor}30`,
                boxShadow: `0 0 20px ${s.freqColor}12, inset 0 0 12px ${s.freqColor}06`,
                minWidth: 170, transition: 'border-color 0.6s, box-shadow 0.6s',
              }}>
                <div className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase mb-1" style={{ color: colors.textDim }}>Grid Frequency</div>
                <div className="text-[42px] font-extrabold font-mono leading-none" style={{
                  color: s.freqColor, textShadow: `0 0 20px ${s.freqColor}30`, transition: 'color 0.6s',
                }}>{s.freq?.toFixed(3)}</div>
                <div className="text-[12px] font-mono" style={{ color: colors.textDim }}>Hz</div>
              </div>
              <div className="flex-1 rounded-lg p-4 flex flex-col justify-between" style={{
                background: 'rgba(5,8,16,0.9)', border: `1px solid ${colors.surfaceLight}`,
              }}>
                <div>
                  <div className="text-[10px] font-mono font-semibold tracking-[0.15em] uppercase mb-1" style={{ color: colors.textDim }}>Frequency Trace</div>
                  <FreqLine step={scenarioStep} width={480} height={50} />
                </div>
                <div className="mt-2">
                  {s.band && <div className="text-xl font-mono font-semibold mb-1" style={{ color: s.freqColor, transition: 'color 0.6s' }}>{s.band}</div>}
                  {s.scenario && <div className="text-xl font-sans" style={{ color: colors.text }}>{s.scenario}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          flex: 1, minHeight: 0, overflow: 'hidden',
          opacity: showPunchline ? 0 : 1,
          transition: 'opacity 0.6s ease',
        }}>
          <GridDiagram state={s.gridState} draw={gridReady} />
        </div>

      </div>

      {/* Bottom HUD: status + mission clock (absolute positioned) */}
      {showHud && s.status && !showPunchline && !isCollapse && (
        <div className="absolute bottom-8 left-0 right-0 z-10" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="rounded-lg flex items-center" style={{
            width: 340,
            background: 'rgba(5,8,16,0.85)',
            border: `1px solid ${scenarioStep <= 1 ? colors.success + '30' : scenarioStep <= 2 ? colors.accent + '30' : colors.danger + '30'}`,
            transition: 'border-color 0.6s',
          }}>
            <div className="font-mono font-bold tracking-[0.12em] uppercase" style={{
              width: 170, textAlign: 'center', padding: '8px 0',
              fontSize: 16,
              color: scenarioStep <= 1 ? colors.success : scenarioStep <= 2 ? colors.accent : colors.danger,
              textShadow: scenarioStep > 1 ? `0 0 12px ${scenarioStep <= 2 ? colors.accent : colors.danger}40` : 'none',
              transition: 'color 0.6s',
            }}>{s.status}</div>
            <div style={{ width: 1, height: 22, background: colors.surfaceLight, flexShrink: 0 }} />
            <div style={{ width: 170, display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
              <GridClock targetSec={s.gridTimeSec} />
            </div>
          </div>
        </div>
      )}

      {/* SYSTEM FAILURE banner (collapse state) */}
      {isCollapse && !showPunchline && (
        <div className="absolute bottom-6 left-0 right-0 z-10" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div className="rounded-lg px-10 py-3 text-center" style={{
            background: 'rgba(5,8,16,0.92)',
            border: `1px solid ${colors.danger}50`,
            boxShadow: `0 0 30px ${colors.danger}20, inset 0 0 20px ${colors.danger}08`,
            animation: 'fwFlickerBig 0.8s ease forwards',
          }}>
            <div className="font-mono font-extrabold tracking-[0.15em] uppercase" style={{
              fontSize: 24,
              color: colors.danger,
              textShadow: `0 0 20px ${colors.danger}60`,
              animation: 'fwCoilPulse 1.5s ease-in-out infinite',
            }}>{'\u26A0'} SYSTEM FAILURE {'\u26A0'}</div>
            <div className="font-mono text-[12px] mt-1" style={{ color: colors.danger + 'aa' }}>
              All generators disconnected — total grid collapse
            </div>
            <div className="font-mono text-[16px] font-bold mt-2" style={{ color: colors.danger }}>
              <GridClock targetSec={s.gridTimeSec} />
            </div>
          </div>
        </div>
      )}

      {/* ═══ SCENE 3: Punchline ═══ */}
      {showPunchline && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ pointerEvents: 'none' }}>
          <div className="flex flex-col items-center justify-between" style={{ height: '50%' }}>
            <Typewriter
              text='The difference between "everything is fine" and "total collapse" is'
              delay={200} speed={25}
              className="text-[36px] font-sans text-hud-text" />
            <div className="text-[88px] font-extrabold font-mono leading-none" style={{
              color: colors.accent,
              animation: 'fwPunchIn 1s ease 0.3s both, fwGlow 2.5s ease-in-out 1.3s infinite',
            }}>2.5 Hz</div>
            <Typewriter
              text="LESS THAN YOU CAN HEAR"
              delay={1800} speed={40}
              className="text-[36px] font-mono tracking-[0.12em]"
              style={{ color: colors.textMuted }} />
          </div>
        </div>
      )}

    </div>
  );
}
