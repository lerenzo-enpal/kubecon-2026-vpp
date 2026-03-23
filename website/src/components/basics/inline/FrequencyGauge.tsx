import { useEffect, useRef, useState, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

/**
 * Step-through frequency gauge showing the 6 states between normal operation
 * and total grid collapse. Click arrows to advance through states.
 */

interface FreqStep {
  freq: number;
  label: string;
  description: string;
  responseTime: string;
  colorKey: 'success' | 'accent' | 'danger' | 'text';
}

const STEPS: FreqStep[] = [
  {
    freq: 50.0,
    label: 'Normal operation',
    description: 'Supply matches demand. All generators synchronized at 50 Hz. The grid is stable.',
    responseTime: '',
    colorKey: 'success',
  },
  {
    freq: 49.8,
    label: 'FCR activated',
    description: 'Frequency Containment Reserves respond automatically. Generators adjust output within seconds to arrest the decline.',
    responseTime: '30 seconds',
    colorKey: 'accent',
  },
  {
    freq: 49.5,
    label: 'aFRR activated',
    description: 'Automatic Frequency Restoration Reserves engage. Gas turbines ramp up. Battery systems inject power.',
    responseTime: '5 minutes',
    colorKey: 'accent',
  },
  {
    freq: 49.0,
    label: 'Load shedding begins',
    description: 'Reserves are maxed out. Automatic systems cut power to neighborhoods. Deliberate blackouts to save the rest of the grid.',
    responseTime: 'Immediate',
    colorKey: 'danger',
  },
  {
    freq: 48.0,
    label: 'Cascading load shedding',
    description: 'Multiple stages of load shedding fire. Millions lose power. Operators fight to prevent total collapse.',
    responseTime: 'Seconds between stages',
    colorKey: 'danger',
  },
  {
    freq: 47.5,
    label: 'Generators disconnect. Collapse.',
    description: 'Generators trip offline to protect themselves from physical damage. The grid goes dark. Recovery takes hours to days.',
    responseTime: 'Irreversible',
    colorKey: 'danger',
  },
];

function getStepColor(step: FreqStep, colors: CanvasThemeColors): string {
  return colors[step.colorKey];
}

function drawLargeGauge(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number, r: number,
  step: FreqStep, animFreq: number, colors: CanvasThemeColors,
  t: number,
) {
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 2.25;
  const totalArc = endAngle - startAngle;

  // Background arc
  ctx.beginPath();
  ctx.arc(cx, cy, r, startAngle, endAngle);
  ctx.strokeStyle = `${colors.textDim}20`;
  ctx.lineWidth = 14;
  ctx.lineCap = 'butt';
  ctx.stroke();

  // Colored zone arcs
  const zones = [
    { from: 47.5, to: 48.0, color: '#7f1d1d' },
    { from: 48.0, to: 49.0, color: colors.danger },
    { from: 49.0, to: 49.5, color: `${colors.accent}cc` },
    { from: 49.5, to: 49.8, color: `${colors.accent}80` },
    { from: 49.8, to: 50.2, color: colors.success },
    { from: 50.2, to: 52.5, color: `${colors.textDim}40` },
  ];

  zones.forEach(z => {
    const freqRange = 52.5 - 47.5;
    const a1 = startAngle + ((z.from - 47.5) / freqRange) * totalArc;
    const a2 = startAngle + ((z.to - 47.5) / freqRange) * totalArc;
    ctx.beginPath();
    ctx.arc(cx, cy, r, a1, a2);
    ctx.strokeStyle = z.color;
    ctx.lineWidth = 14;
    ctx.stroke();
  });

  // Tick marks and labels
  const ticks = [47.5, 48.0, 49.0, 49.5, 50.0, 50.5, 51.0, 52.5];
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ticks.forEach(tick => {
    const freqRange = 52.5 - 47.5;
    const a = startAngle + ((tick - 47.5) / freqRange) * totalArc;
    const inner = r - 18;
    const outer = r - 8;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * inner, cy + Math.sin(a) * inner);
    ctx.lineTo(cx + Math.cos(a) * outer, cy + Math.sin(a) * outer);
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    const labelR = r - 30;
    ctx.fillStyle = colors.textDim;
    ctx.fillText(
      tick.toFixed(tick % 1 === 0 ? 0 : 1),
      cx + Math.cos(a) * labelR,
      cy + Math.sin(a) * labelR,
    );
  });

  // Needle
  const freqRange = 52.5 - 47.5;
  const needleAngle = startAngle + ((animFreq - 47.5) / freqRange) * totalArc;
  const needleLen = r - 22;
  const stepColor = getStepColor(step, colors);

  // Needle glow
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + Math.cos(needleAngle) * needleLen,
    cy + Math.sin(needleAngle) * needleLen,
  );
  ctx.strokeStyle = `${stepColor}40`;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Needle
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(
    cx + Math.cos(needleAngle) * needleLen,
    cy + Math.sin(needleAngle) * needleLen,
  );
  ctx.strokeStyle = colors.text;
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Hub
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = stepColor;
  ctx.fill();

  // Digital readout
  ctx.font = 'bold 28px "JetBrains Mono", monospace';
  ctx.fillStyle = stepColor;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Pulsing effect for collapse state
  let alpha = 1;
  if (step.freq <= 47.5) {
    alpha = 0.5 + 0.5 * Math.sin(t * 4);
  }
  ctx.globalAlpha = alpha;
  ctx.fillText(`${animFreq.toFixed(1)} Hz`, cx, cy + r * 0.45);
  ctx.globalAlpha = 1;

  // "Hz" unit label
  ctx.font = '14px "JetBrains Mono", monospace';
  ctx.fillStyle = colors.textDim;
  ctx.fillText('FREQUENCY', cx, cy + r * 0.45 + 22);
}

export default function FrequencyGauge() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const [stepIndex, setStepIndex] = useState(0);
  const stepRef = useRef(0);
  const animFreqRef = useRef(50);

  useEffect(() => { stepRef.current = stepIndex; }, [stepIndex]);

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
      const h = 220;
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
      const t = now / 1000;
      const step = STEPS[stepRef.current];

      // Smooth frequency animation
      const targetFreq = step.freq;
      animFreqRef.current += (targetFreq - animFreqRef.current) * 3 * dt;

      const gaugeR = Math.min(90, Math.min(w * 0.2, h * 0.42));
      const gaugeCx = w * 0.3;
      const gaugeCy = h * 0.52;

      drawLargeGauge(ctx, gaugeCx, gaugeCy, gaugeR, step, animFreqRef.current, colors, t);

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

  const prev = useCallback(() => setStepIndex(i => Math.max(0, i - 1)), []);
  const next = useCallback(() => setStepIndex(i => Math.min(STEPS.length - 1, i + 1)), []);

  const step = STEPS[stepIndex];
  const stepColor = step.colorKey === 'success' ? 'var(--color-success)'
    : step.colorKey === 'accent' ? 'var(--color-accent)'
    : step.colorKey === 'danger' ? 'var(--color-danger)'
    : 'var(--color-text)';

  return (
    <div className="w-full my-6 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}>
      <div className="flex items-center justify-between px-4 pt-3 pb-1">
        <span className="font-mono text-sm font-semibold tracking-wide uppercase" style={{ color: 'var(--color-text)' }}>
          FREQUENCY THRESHOLDS
        </span>
        <span className="font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>
          Step {stepIndex + 1} of {STEPS.length}
        </span>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Canvas gauge */}
        <div className="flex-shrink-0 md:w-3/5">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Frequency gauge showing ${step.freq} Hz - ${step.label}`}
            className="w-full"
            style={{ height: 220 }}
          />
        </div>

        {/* Step info panel */}
        <div className="flex-1 flex flex-col justify-center px-4 pb-4 md:py-4 md:pr-6">
          <div className="font-mono text-2xl font-bold mb-1" style={{ color: stepColor }}>
            {step.freq.toFixed(1)} Hz
          </div>
          <div className="font-semibold text-base mb-2" style={{ color: 'var(--color-text)' }}>
            {step.label}
          </div>
          <p className="text-sm mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {step.description}
          </p>
          {step.responseTime && (
            <div className="font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>
              Response: {step.responseTime}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between px-4 pb-3 border-t" style={{ borderColor: 'var(--color-surface-light)' }}>
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className="font-mono text-sm px-3 py-1 rounded transition-opacity"
          style={{
            color: stepIndex === 0 ? 'var(--color-text-dim)' : 'var(--color-primary)',
            opacity: stepIndex === 0 ? 0.4 : 1,
            cursor: stepIndex === 0 ? 'default' : 'pointer',
          }}
        >
          &larr; Prev
        </button>

        {/* Step dots */}
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => {
            const dotColor = i === stepIndex ? stepColor : 'var(--color-text-dim)';
            return (
              <button
                key={i}
                onClick={() => setStepIndex(i)}
                className="w-2 h-2 rounded-full transition-all"
                style={{
                  background: dotColor,
                  opacity: i === stepIndex ? 1 : 0.3,
                  cursor: 'pointer',
                }}
                aria-label={`Go to step ${i + 1}: ${s.freq} Hz`}
              />
            );
          })}
        </div>

        <button
          onClick={next}
          disabled={stepIndex === STEPS.length - 1}
          className="font-mono text-sm px-3 py-1 rounded transition-opacity"
          style={{
            color: stepIndex === STEPS.length - 1 ? 'var(--color-text-dim)' : 'var(--color-primary)',
            opacity: stepIndex === STEPS.length - 1 ? 0.4 : 1,
            cursor: stepIndex === STEPS.length - 1 ? 'default' : 'pointer',
          }}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
}
