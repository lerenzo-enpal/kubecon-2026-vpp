import { useEffect, useRef, useState } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

export default function ACvsDCWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const [mode, setMode] = useState<'ac' | 'dc'>('ac');
  const modeRef = useRef(mode);
  modeRef.current = mode;

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

    function sizeCanvas() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = 180;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    }

    sizeCanvas();
    const ro = new ResizeObserver(sizeCanvas);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    function draw() {
      const ctx = canvas!.getContext('2d');
      if (!ctx) return;
      const c = colorsRef.current;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas!.width / dpr;
      const h = canvas!.height / dpr;
      const t = Date.now() / 1000;
      const isAC = modeRef.current === 'ac';

      ctx.clearRect(0, 0, w, h);

      const padL = 40;
      const padR = 20;
      const padT = 20;
      const padB = 40;
      const chartW = w - padL - padR;
      const chartH = h - padT - padB;
      const midY = padT + chartH / 2;

      // Axes
      ctx.strokeStyle = c.surfaceLight;
      ctx.lineWidth = 1;
      // X axis (center)
      ctx.beginPath();
      ctx.moveTo(padL, midY);
      ctx.lineTo(padL + chartW, midY);
      ctx.stroke();
      // Y axis
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + chartH);
      ctx.stroke();

      // Y labels
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textDim;
      ctx.textAlign = 'right';
      ctx.fillText('+V', padL - 6, padT + 10);
      ctx.fillText('0', padL - 6, midY + 4);
      ctx.fillText('-V', padL - 6, padT + chartH - 2);

      // Waveform
      ctx.strokeStyle = isAC ? c.primary : c.accent;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      const amplitude = chartH * 0.4;
      const cycles = 3;

      for (let i = 0; i <= chartW; i++) {
        const x = padL + i;
        let y: number;
        if (isAC) {
          const phase = (i / chartW) * cycles * Math.PI * 2 + t * 3;
          y = midY - Math.sin(phase) * amplitude;
        } else {
          y = midY - amplitude * 0.7;
        }
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Glow
      ctx.shadowColor = isAC ? c.primary : c.accent;
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Label
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = isAC ? c.primary : c.accent;
      ctx.textAlign = 'center';
      if (isAC) {
        ctx.fillText('50 Hz -- alternates 50 times per second', w / 2, h - 10);
      } else {
        ctx.fillText('Direct Current -- steady flow', w / 2, h - 10);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}>
      <div className="flex items-center justify-between px-3 pt-3">
        <span className="font-mono text-xs uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Waveform
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('ac')}
            className="px-3 py-1 rounded font-mono text-xs transition-colors"
            style={{
              background: mode === 'ac' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: mode === 'ac' ? 'var(--color-bg)' : 'var(--color-text-dim)',
              border: '1px solid var(--color-surface-light)',
            }}
          >
            AC
          </button>
          <button
            onClick={() => setMode('dc')}
            className="px-3 py-1 rounded font-mono text-xs transition-colors"
            style={{
              background: mode === 'dc' ? 'var(--color-accent)' : 'var(--color-surface)',
              color: mode === 'dc' ? 'var(--color-bg)' : 'var(--color-text-dim)',
              border: '1px solid var(--color-surface-light)',
            }}
          >
            DC
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={mode === 'ac' ? 'AC waveform: sine wave alternating 50 times per second' : 'DC waveform: flat steady line'}
      />
    </div>
  );
}
