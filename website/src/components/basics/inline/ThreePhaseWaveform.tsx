import { useEffect, useRef, useState } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

const PHASE_COLORS = {
  L1: '#22d3ee', // cyan
  L2: '#f59e0b', // amber
  L3: '#a78bfa', // purple
};

export default function ThreePhaseWaveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const [mode, setMode] = useState<'1' | '3'>('3');
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
      const h = 240;
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
      const is3 = modeRef.current === '3';

      ctx.clearRect(0, 0, w, h);

      const padL = 40;
      const padR = 20;
      const padT = 20;
      const padB = is3 ? 60 : 50;
      const chartW = w - padL - padR;
      const chartH = h - padT - padB;
      const midY = padT + chartH / 2;

      // Axes
      ctx.strokeStyle = c.surfaceLight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, midY);
      ctx.lineTo(padL + chartW, midY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + chartH);
      ctx.stroke();

      // Y labels
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textDim;
      ctx.textAlign = 'right';
      ctx.fillText('+V', padL - 6, padT + 10);
      ctx.fillText('0', padL - 6, midY + 4);
      ctx.fillText('-V', padL - 6, padT + chartH - 2);

      const amplitude = chartH * 0.38;
      const cycles = 3;
      const phaseOffsets = [0, (2 * Math.PI) / 3, (4 * Math.PI) / 3];
      const labels = ['L1', 'L2', 'L3'];
      const colors = [PHASE_COLORS.L1, PHASE_COLORS.L2, PHASE_COLORS.L3];
      const phasesToDraw = is3 ? 3 : 1;

      // Draw summed power curve in 3-phase mode (behind the waves)
      if (is3) {
        ctx.beginPath();
        ctx.strokeStyle = c.text;
        ctx.globalAlpha = 0.12;
        ctx.lineWidth = 2;

        for (let i = 0; i <= chartW; i++) {
          const x = padL + i;
          let sumPower = 0;
          for (let p = 0; p < 3; p++) {
            const phase = (i / chartW) * cycles * Math.PI * 2 + t * 3 + phaseOffsets[p];
            const v = Math.sin(phase);
            sumPower += v * v;
          }
          // Normalize: sum of sin^2 for 3 phases = 1.5 constant
          const powerY = padT + chartH * 0.08 + (1 - sumPower / 1.5) * chartH * 0.15;
          if (i === 0) ctx.moveTo(x, powerY);
          else ctx.lineTo(x, powerY);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;

        // "Constant power" label
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillStyle = c.text;
        ctx.globalAlpha = 0.2;
        ctx.textAlign = 'left';
        ctx.fillText('constant power', padL + 6, padT + chartH * 0.06);
        ctx.globalAlpha = 1;
      }

      // Draw sine waves
      for (let p = 0; p < phasesToDraw; p++) {
        ctx.beginPath();
        ctx.strokeStyle = colors[p];
        ctx.lineWidth = 2.5;

        for (let i = 0; i <= chartW; i++) {
          const x = padL + i;
          const phase = (i / chartW) * cycles * Math.PI * 2 + t * 3 + phaseOffsets[p];
          const y = midY - Math.sin(phase) * amplitude;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Glow
        ctx.shadowColor = colors[p];
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Bottom text
      ctx.font = '15px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      if (is3) {
        ctx.fillStyle = c.textMuted;
        ctx.fillText('Three phases, 120\u00B0 apart = constant power delivery', w / 2, h - 30);
        // Phase legend
        ctx.font = '14px "JetBrains Mono", monospace';
        for (let p = 0; p < 3; p++) {
          const lx = w / 2 + (p - 1) * 80;
          ctx.fillStyle = colors[p];
          ctx.fillText(labels[p], lx, h - 10);
        }
      } else {
        ctx.fillStyle = c.primary;
        ctx.fillText('Single phase dips to zero twice per cycle', w / 2, h - 14);
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
        <span className="font-mono text-sm uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
          Three-Phase Power
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => setMode('1')}
            className="px-3 py-1 rounded font-mono text-sm transition-colors"
            style={{
              background: mode === '1' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: mode === '1' ? 'var(--color-bg)' : 'var(--color-text-dim)',
              border: '1px solid var(--color-surface-light)',
            }}
          >
            1 Phase
          </button>
          <button
            onClick={() => setMode('3')}
            className="px-3 py-1 rounded font-mono text-sm transition-colors"
            style={{
              background: mode === '3' ? 'var(--color-primary)' : 'var(--color-surface)',
              color: mode === '3' ? 'var(--color-bg)' : 'var(--color-text-dim)',
              border: '1px solid var(--color-surface-light)',
            }}
          >
            3 Phase
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={mode === '3'
          ? 'Three-phase AC waveform: three sine waves offset by 120 degrees delivering constant power'
          : 'Single-phase AC waveform: one sine wave that dips to zero twice per cycle'
        }
      />
    </div>
  );
}
