import { useEffect, useRef, useState, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

/**
 * Interactive rotor + frequency gauge.
 * A slider controls "demand" which acts as a brake on the rotor.
 * Higher demand -> slower rotor -> lower frequency.
 */

function drawRotor(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  angle: number, colors: CanvasThemeColors, freq: number,
) {
  // Outer ring
  const ringColor = freq >= 49.8 ? colors.success
    : freq >= 49.0 ? colors.accent
    : colors.danger;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = `${ringColor}60`;
  ctx.lineWidth = 3;
  ctx.stroke();

  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
  ctx.fillStyle = `${colors.surface}`;
  ctx.fill();
  ctx.strokeStyle = `${ringColor}40`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Rotor blades (6 lines)
  const bladeCount = 6;
  for (let i = 0; i < bladeCount; i++) {
    const a = angle + (i * Math.PI * 2) / bladeCount;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.15, cy + Math.sin(a) * r * 0.15);
    ctx.lineTo(cx + Math.cos(a) * r * 0.75, cy + Math.sin(a) * r * 0.75);
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Blade tip dot
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.75, cy + Math.sin(a) * r * 0.75, 3, 0, Math.PI * 2);
    ctx.fillStyle = ringColor;
    ctx.fill();
  }

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = ringColor;
  ctx.fill();
}

function drawGauge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  freq: number, colors: CanvasThemeColors,
) {
  // Arc background
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const totalArc = endAngle - startAngle;

  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = `${colors.textDim}30`;
  ctx.lineWidth = 8;
  ctx.lineCap = 'butt';
  ctx.stroke();

  // Colored arc segments
  const zones = [
    { from: 47.5, to: 49.0, color: colors.danger },
    { from: 49.0, to: 49.5, color: colors.accent },
    { from: 49.5, to: 49.8, color: `${colors.accent}80` },
    { from: 49.8, to: 50.2, color: colors.success },
    { from: 50.2, to: 50.5, color: `${colors.accent}80` },
    { from: 50.5, to: 51.0, color: colors.accent },
    { from: 51.0, to: 52.5, color: colors.danger },
  ];

  zones.forEach(z => {
    const a1 = startAngle + ((z.from - 47.5) / 5) * totalArc;
    const a2 = startAngle + ((z.to - 47.5) / 5) * totalArc;
    ctx.beginPath();
    ctx.arc(cx, cy, r, a1, a2);
    ctx.strokeStyle = z.color;
    ctx.lineWidth = 8;
    ctx.stroke();
  });

  // Tick marks
  const ticks = [47.5, 48.0, 49.0, 49.5, 50.0, 50.5, 51.0, 52.0, 52.5];
  ctx.font = '12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ticks.forEach(tick => {
    const a = startAngle + ((tick - 47.5) / 5) * totalArc;
    const inner = r - 14;
    const outer = r - 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Label for major ticks
    if ([47.5, 49.0, 50.0, 51.0, 52.5].includes(tick)) {
      const labelR = r - 24;
      ctx.fillStyle = colors.textDim;
      ctx.fillText(
        tick.toFixed(tick === 50 ? 0 : 1),
        cx + Math.cos(a) * labelR,
        cy + Math.sin(a) * labelR,
      );
    }
  });

  // Needle
  const needleAngle = startAngle + ((freq - 47.5) / 5) * totalArc;
  const needleLen = r - 18;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + Math.cos(needleAngle) * needleLen,
    cy + Math.sin(needleAngle) * needleLen,
  );
  ctx.strokeStyle = colors.text;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Needle hub
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = colors.text;
  ctx.fill();
}

export default function RotorFrequency() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const [demand, setDemand] = useState(50);
  const demandRef = useRef(50);
  const angleRef = useRef(0);
  const freqRef = useRef(50);

  useEffect(() => { demandRef.current = demand; }, [demand]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => { colorsRef.current = getCanvasThemeColors(); };
    mql.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mql.removeEventListener('change', update); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = 250;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    resize();
    window.addEventListener('resize', resize);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    let lastTime = Date.now();

    function frame() {
      if (!canvas || !visible) { rafRef.current = requestAnimationFrame(frame); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const now = Date.now();
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const colors = colorsRef.current;

      // Physics: demand slider (0-100) maps to frequency
      // 50 = balanced, higher demand = lower freq
      const targetFreq = 50 - (demandRef.current - 50) * 0.05;
      freqRef.current += (targetFreq - freqRef.current) * 2 * dt;
      const freq = freqRef.current;

      // Rotor speed proportional to frequency
      const speed = (freq / 50) * Math.PI * 2;
      angleRef.current += speed * dt;

      // Layout
      const rotorR = Math.min(70, h * 0.35);
      const rotorCx = w * 0.25;
      const rotorCy = h * 0.45;

      const gaugeR = Math.min(80, h * 0.38);
      const gaugeCx = w * 0.65;
      const gaugeCy = h * 0.48;

      // Draw rotor
      drawRotor(ctx, rotorCx, rotorCy, rotorR, angleRef.current, colors, freq);

      // Rotor label
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'center';
      ctx.fillText('GENERATOR ROTOR', rotorCx, rotorCy + rotorR + 18);

      // Draw gauge
      drawGauge(ctx, gaugeCx, gaugeCy, gaugeR, freq, colors);

      // Digital readout under gauge
      const freqColor = freq >= 49.8 ? colors.success
        : freq >= 49.0 ? colors.accent
        : colors.danger;
      ctx.font = 'bold 22px "JetBrains Mono", monospace';
      ctx.fillStyle = freqColor;
      ctx.textAlign = 'center';
      ctx.fillText(`${freq.toFixed(3)} Hz`, gaugeCx, gaugeCy + gaugeR * 0.55);

      // Status text
      const status = freq >= 49.8 ? 'NOMINAL'
        : freq >= 49.5 ? 'FCR ACTIVE'
        : freq >= 49.0 ? 'aFRR ACTIVE'
        : 'EMERGENCY';
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = `${freqColor}90`;
      ctx.fillText(status, gaugeCx, gaugeCy + gaugeR * 0.55 + 18);

      ctx.restore();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  const handleSlider = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setDemand(Number(e.target.value));
  }, []);

  return (
    <div className="w-full my-6 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}>
      <div className="flex items-center justify-between px-4 pt-3">
        <span className="font-mono text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text)' }}>
          ROTOR FREQUENCY
        </span>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded"
          style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(34, 211, 238, 0.2)' }}
        >
          Interactive
        </span>
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Interactive rotor and frequency gauge responding to demand changes"
        className="w-full"
        style={{ height: 250 }}
      />
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3">
          <label htmlFor="demand-slider" className="font-mono text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            DEMAND
          </label>
          <input
            id="demand-slider"
            type="range"
            min={0}
            max={100}
            value={demand}
            onChange={handleSlider}
            className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
            style={{ accentColor: 'var(--color-primary)' }}
          />
          <span className="font-mono text-xs w-12 text-right" style={{ color: 'var(--color-text-muted)' }}>
            {demand}%
          </span>
        </div>
        <p className="font-mono text-xs mt-2 text-center" style={{ color: 'var(--color-text-dim)' }}>
          Demand is the brake. Supply is the engine. Frequency is the speedometer.
        </p>
      </div>
    </div>
  );
}
