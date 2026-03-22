import { useState, useRef, useEffect, useCallback } from 'react';
import FullscreenWrapper from '../../FullscreenWrapper';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

type LockedVar = 'V' | 'I' | 'R';

interface Preset {
  label: string;
  V: number;
  I: number;
  R: number;
}

const PRESETS: Preset[] = [
  { label: 'Phone charger', V: 5, I: 2, R: 2.5 },
  { label: 'Wall outlet', V: 230, I: 10, R: 23 },
  { label: 'Transmission line', V: 400000, I: 1000, R: 400 },
  { label: 'LED', V: 3, I: 0.02, R: 150 },
];

// Logarithmic scale helpers
function logScale(val: number, min: number, max: number): number {
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  const logVal = Math.log10(Math.max(min, Math.min(max, val)));
  return (logVal - logMin) / (logMax - logMin);
}

function invLogScale(t: number, min: number, max: number): number {
  const logMin = Math.log10(min);
  const logMax = Math.log10(max);
  return Math.pow(10, logMin + t * (logMax - logMin));
}

const V_MIN = 1, V_MAX = 400000;
const I_MIN = 0.001, I_MAX = 1000;
const R_MIN = 0.01, R_MAX = 100000;

function formatValue(val: number, unit: string): string {
  if (val >= 1000000) return `${(val / 1000000).toFixed(2)} M${unit}`;
  if (val >= 1000) return `${(val / 1000).toFixed(2)} k${unit}`;
  if (val >= 1) return `${val.toFixed(2)} ${unit}`;
  if (val >= 0.001) return `${(val * 1000).toFixed(2)} m${unit}`;
  return `${val.toExponential(2)} ${unit}`;
}

function formatPower(watts: number): string {
  if (watts >= 1e9) return `${(watts / 1e9).toFixed(2)} GW`;
  if (watts >= 1e6) return `${(watts / 1e6).toFixed(2)} MW`;
  if (watts >= 1e3) return `${(watts / 1e3).toFixed(2)} kW`;
  return `${watts.toFixed(2)} W`;
}

function drawCircuit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  V: number,
  I: number,
  R: number,
  colors: CanvasThemeColors,
  time: number
) {
  const monoFont = '"JetBrains Mono", monospace';
  const pad = 40;
  const left = pad;
  const right = w - pad;
  const top = pad;
  const bottom = h - pad;
  const cx = w / 2;
  const cy = h / 2;

  // Clear
  ctx.clearRect(0, 0, w, h);

  // Wire path: battery(left) -> top wire -> resistor(right) -> bottom wire -> lightbulb(bottom) -> back to battery
  const wireColor = colors.textDim;
  ctx.strokeStyle = wireColor;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  // Define circuit path as segments
  const batteryX = left + 30;
  const batteryTop = cy - 40;
  const batteryBottom = cy + 40;

  const resistorX = right - 30;
  const resistorTop = cy - 20;
  const resistorBottom = cy + 20;

  // Wires
  ctx.beginPath();
  // Top wire: battery top -> top left corner -> top right corner -> resistor top
  ctx.moveTo(batteryX, batteryTop);
  ctx.lineTo(batteryX, top + 20);
  ctx.lineTo(resistorX, top + 20);
  ctx.lineTo(resistorX, resistorTop);
  ctx.stroke();

  ctx.beginPath();
  // Bottom wire: resistor bottom -> bottom right -> lightbulb -> bottom left -> battery bottom
  ctx.moveTo(resistorX, resistorBottom);
  ctx.lineTo(resistorX, bottom - 20);
  ctx.lineTo(batteryX, bottom - 20);
  ctx.lineTo(batteryX, batteryBottom);
  ctx.stroke();

  // Battery symbol
  const bLong = 20;
  const bShort = 12;
  ctx.lineWidth = 3;
  ctx.strokeStyle = colors.text;
  // Long plate (positive)
  ctx.beginPath();
  ctx.moveTo(batteryX - bLong, batteryTop);
  ctx.lineTo(batteryX + bLong, batteryTop);
  ctx.stroke();
  // Short plate (negative)
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(batteryX - bShort, batteryBottom);
  ctx.lineTo(batteryX + bShort, batteryBottom);
  ctx.stroke();
  // + and - labels
  ctx.font = `bold 14px ${monoFont}`;
  ctx.fillStyle = colors.primary;
  ctx.textAlign = 'center';
  ctx.fillText('+', batteryX, batteryTop - 8);
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('-', batteryX, batteryBottom + 16);
  // V label
  ctx.font = `12px ${monoFont}`;
  ctx.fillStyle = colors.text;
  ctx.fillText(formatValue(V, 'V'), batteryX, cy + 4);

  // Resistor (zigzag)
  const rWidth = 10 + Math.min(30, Math.log10(R / R_MIN) / Math.log10(R_MAX / R_MIN) * 30);
  const zigCount = 5;
  const rHeight = resistorBottom - resistorTop;
  const segH = rHeight / zigCount;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(resistorX, resistorTop);
  for (let i = 0; i < zigCount; i++) {
    const y1 = resistorTop + i * segH + segH * 0.25;
    const y2 = resistorTop + i * segH + segH * 0.75;
    const dir = i % 2 === 0 ? 1 : -1;
    ctx.lineTo(resistorX + dir * rWidth, y1);
    ctx.lineTo(resistorX - dir * rWidth, y2);
  }
  ctx.lineTo(resistorX, resistorBottom);
  ctx.stroke();
  // R label
  ctx.font = `12px ${monoFont}`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'left';
  ctx.fillText(formatValue(R, '\u03A9'), resistorX + rWidth + 8, cy + 4);

  // Lightbulb at bottom center
  const bulbX = cx;
  const bulbY = bottom - 20;
  const bulbRadius = 14;
  const brightness = Math.min(1, Math.log10(Math.max(0.001, I) / I_MIN) / Math.log10(I_MAX / I_MIN));
  // Glow
  if (brightness > 0.1) {
    const glow = ctx.createRadialGradient(bulbX, bulbY, 0, bulbX, bulbY, bulbRadius * 3);
    glow.addColorStop(0, `rgba(255, 220, 100, ${brightness * 0.4})`);
    glow.addColorStop(1, 'rgba(255, 220, 100, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, bulbRadius * 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Bulb circle
  ctx.strokeStyle = colors.textMuted;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(bulbX, bulbY, bulbRadius, 0, Math.PI * 2);
  ctx.stroke();
  const bulbFill = `rgba(255, 220, 100, ${0.1 + brightness * 0.7})`;
  ctx.fillStyle = bulbFill;
  ctx.fill();
  // Filament
  ctx.strokeStyle = `rgba(255, 200, 50, ${0.3 + brightness * 0.7})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(bulbX - 4, bulbY + 5);
  ctx.lineTo(bulbX - 2, bulbY - 5);
  ctx.lineTo(bulbX + 2, bulbY + 5);
  ctx.lineTo(bulbX + 4, bulbY - 5);
  ctx.stroke();
  // I label
  ctx.font = `12px ${monoFont}`;
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'left';
  ctx.fillText(formatValue(I, 'A'), bulbX + bulbRadius + 8, bulbY + 4);

  // Electron dots flowing around circuit
  const speed = Math.log10(Math.max(0.001, I) / I_MIN) / Math.log10(I_MAX / I_MIN);
  const dotCount = 12;
  // Define path points for electron flow
  const pathPoints = [
    { x: batteryX, y: batteryTop },
    { x: batteryX, y: top + 20 },
    { x: resistorX, y: top + 20 },
    { x: resistorX, y: resistorTop },
    { x: resistorX, y: resistorBottom },
    { x: resistorX, y: bottom - 20 },
    { x: bulbX + bulbRadius, y: bottom - 20 },
    { x: bulbX - bulbRadius, y: bottom - 20 },
    { x: batteryX, y: bottom - 20 },
    { x: batteryX, y: batteryBottom },
  ];

  // Compute total path length
  let totalLen = 0;
  const segLengths: number[] = [];
  for (let i = 0; i < pathPoints.length; i++) {
    const next = pathPoints[(i + 1) % pathPoints.length];
    const dx = next.x - pathPoints[i].x;
    const dy = next.y - pathPoints[i].y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segLengths.push(len);
    totalLen += len;
  }

  for (let d = 0; d < dotCount; d++) {
    const t = ((d / dotCount) + time * speed * 0.0003) % 1;
    let dist = t * totalLen;
    let px = 0, py = 0;
    for (let i = 0; i < pathPoints.length; i++) {
      if (dist <= segLengths[i]) {
        const frac = dist / segLengths[i];
        const next = pathPoints[(i + 1) % pathPoints.length];
        px = pathPoints[i].x + (next.x - pathPoints[i].x) * frac;
        py = pathPoints[i].y + (next.y - pathPoints[i].y) * frac;
        break;
      }
      dist -= segLengths[i];
    }
    ctx.beginPath();
    ctx.arc(px, py, 3, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary;
    ctx.fill();
  }
}

export default function OhmsLawPlayground() {
  const [V, setV] = useState(230);
  const [I, setI] = useState(10);
  const [R, setR] = useState(23);
  const [locked, setLocked] = useState<LockedVar>('R');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const colorsRef = useRef<CanvasThemeColors | null>(null);

  // Recompute locked variable
  const computeLocked = useCallback((vVal: number, iVal: number, rVal: number, lockedVar: LockedVar) => {
    switch (lockedVar) {
      case 'V': return { V: iVal * rVal, I: iVal, R: rVal };
      case 'I': return { V: vVal, I: rVal > 0 ? vVal / rVal : 0, R: rVal };
      case 'R': return { V: vVal, I: iVal, R: iVal > 0 ? vVal / iVal : 0 };
    }
  }, []);

  const handleSlider = useCallback((variable: 'V' | 'I' | 'R', sliderVal: number) => {
    const ranges = { V: [V_MIN, V_MAX], I: [I_MIN, I_MAX], R: [R_MIN, R_MAX] } as const;
    const newVal = invLogScale(sliderVal, ranges[variable][0], ranges[variable][1]);

    let newV = V, newI = I, newR = R;
    if (variable === 'V') newV = newVal;
    if (variable === 'I') newI = newVal;
    if (variable === 'R') newR = newVal;

    const result = computeLocked(newV, newI, newR, locked);
    setV(result.V);
    setI(result.I);
    setR(result.R);
  }, [V, I, R, locked, computeLocked]);

  const applyPreset = useCallback((preset: Preset) => {
    setV(preset.V);
    setI(preset.I);
    setR(preset.R);
  }, []);

  const toggleLock = useCallback((variable: LockedVar) => {
    setLocked(variable);
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    colorsRef.current = getCanvasThemeColors();

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !colorsRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
      ctx.save();
      ctx.clearRect(0, 0, rect.width, rect.height);
      drawCircuit(ctx, rect.width, rect.height, V, I, R, colorsRef.current, Date.now());
      ctx.restore();
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [V, I, R]);

  const power = V * I;

  const sliderStyle = {
    accentColor: 'var(--color-primary)',
  };

  return (
    <FullscreenWrapper label="Ohm's Law Playground">
      <div className="rounded-lg p-4 md:p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}>
        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              className="px-3 py-1 rounded text-xs font-mono cursor-pointer transition-colors"
              style={{
                background: 'var(--color-bg-alt)',
                border: '1px solid var(--color-surface-light)',
                color: 'var(--color-text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-primary)';
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-surface-light)';
                e.currentTarget.style.color = 'var(--color-text-muted)';
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Sliders */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {([
            { key: 'V' as const, label: 'Voltage', unit: 'V', value: V, min: V_MIN, max: V_MAX },
            { key: 'I' as const, label: 'Current', unit: 'A', value: I, min: I_MIN, max: I_MAX },
            { key: 'R' as const, label: 'Resistance', unit: '\u03A9', value: R, min: R_MIN, max: R_MAX },
          ]).map((s) => (
            <div key={s.key} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {s.label} ({s.unit})
                </label>
                <button
                  onClick={() => toggleLock(s.key)}
                  className="px-2 py-0.5 rounded text-xs font-mono cursor-pointer transition-colors"
                  style={{
                    background: locked === s.key ? 'var(--color-primary)' : 'transparent',
                    color: locked === s.key ? 'var(--color-bg)' : 'var(--color-text-dim)',
                    border: `1px solid ${locked === s.key ? 'var(--color-primary)' : 'var(--color-surface-light)'}`,
                  }}
                  title={locked === s.key ? `${s.label} is computed` : `Lock ${s.label} (compute from others)`}
                >
                  {locked === s.key ? 'LOCKED' : 'lock'}
                </button>
              </div>
              <div className="font-mono text-sm" style={{ color: locked === s.key ? 'var(--color-primary)' : 'var(--color-text)' }}>
                {formatValue(s.value, s.unit)}
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={logScale(s.value, s.min, s.max)}
                onChange={(e) => handleSlider(s.key, parseFloat(e.target.value))}
                disabled={locked === s.key}
                className="w-full"
                style={sliderStyle}
              />
            </div>
          ))}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full rounded"
          style={{ height: 260, background: 'var(--color-bg)' }}
        />

        {/* Formula display */}
        <div className="mt-4 font-mono text-sm space-y-1" style={{ color: 'var(--color-text-muted)' }}>
          <div>
            V = I x R ={'  '}
            <span style={{ color: 'var(--color-primary)' }}>{formatValue(V, 'V')}</span>
            {' = '}
            <span style={{ color: 'var(--color-primary)' }}>{formatValue(I, 'A')}</span>
            {' x '}
            <span style={{ color: 'var(--color-primary)' }}>{formatValue(R, '\u03A9')}</span>
          </div>
          <div>
            P = V x I ={' '}
            <span style={{ color: 'var(--color-primary)' }}>{formatPower(power)}</span>
          </div>
        </div>
      </div>
    </FullscreenWrapper>
  );
}
