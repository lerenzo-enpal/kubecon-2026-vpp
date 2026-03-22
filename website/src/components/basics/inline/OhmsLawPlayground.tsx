import { useState, useEffect, useRef } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

export default function OhmsLawPlayground() {
  const [voltage, setVoltage] = useState(12);
  const [resistance, setResistance] = useState(4);
  const current = voltage / resistance;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const valuesRef = useRef({ voltage, resistance, current });
  valuesRef.current = { voltage, resistance, current };

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
      const h = 120;
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
      const { current: cur } = valuesRef.current;

      ctx.clearRect(0, 0, w, h);

      // Simple circuit loop
      const padX = 30;
      const padY = 15;
      const loopW = w - padX * 2;
      const loopH = h - padY * 2;

      ctx.strokeStyle = c.surfaceLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(padX, padY, loopW, loopH, 12);
      ctx.stroke();

      // Electrons flowing around (speed proportional to current)
      const speed = Math.min(cur, 10) * 0.15;
      const perimeter = 2 * (loopW + loopH);
      const eCount = 12;
      ctx.fillStyle = c.primary;

      for (let i = 0; i < eCount; i++) {
        const phase = ((t * speed + i / eCount) % 1 + 1) % 1;
        const pos = phase * perimeter;
        let ex: number, ey: number;

        if (pos < loopW) {
          ex = padX + pos;
          ey = padY;
        } else if (pos < loopW + loopH) {
          ex = padX + loopW;
          ey = padY + (pos - loopW);
        } else if (pos < 2 * loopW + loopH) {
          ex = padX + loopW - (pos - loopW - loopH);
          ey = padY + loopH;
        } else {
          ex = padX;
          ey = padY + loopH - (pos - 2 * loopW - loopH);
        }

        const radius = 2 + Math.min(cur, 10) * 0.2;
        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(ex, ey, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Battery symbol (left side)
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 2;
      const batX = padX;
      const batY = padY + loopH / 2;
      ctx.beginPath();
      ctx.moveTo(batX - 1, batY - 10);
      ctx.lineTo(batX - 1, batY + 10);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(batX + 4, batY - 6);
      ctx.lineTo(batX + 4, batY + 6);
      ctx.stroke();

      // Resistor symbol (right side)
      ctx.strokeStyle = c.danger;
      ctx.lineWidth = 1.5;
      const resX = padX + loopW;
      const resY = padY + loopH / 2;
      ctx.beginPath();
      const zz = 5;
      for (let z = 0; z < 6; z++) {
        const zy = resY - 15 + z * 5;
        ctx.lineTo(resX + (z % 2 === 0 ? -5 : 5), zy);
      }
      ctx.lineTo(resX, resY + 15);
      ctx.stroke();

      // Labels
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = c.accent;
      ctx.fillText(`${valuesRef.current.voltage}V`, padX + 20, padY + loopH / 2 + 4);
      ctx.fillStyle = c.danger;
      ctx.fillText(`${valuesRef.current.resistance}\u03A9`, padX + loopW - 22, padY + loopH / 2 + 4);
      ctx.fillStyle = c.primary;
      ctx.fillText(`${cur.toFixed(2)}A`, padX + loopW / 2, padY - 3);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="my-8 rounded-lg overflow-hidden p-4" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}>
      <div className="font-mono text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--color-text-muted)' }}>
        Ohm's Law Playground
      </div>

      <canvas ref={canvasRef} role="img" aria-label="Animated circuit showing current flow based on voltage and resistance" />

      <div className="grid grid-cols-2 gap-6 mt-4">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>
            Voltage: {voltage} V
          </span>
          <input
            type="range"
            min={1}
            max={48}
            step={1}
            value={voltage}
            onChange={(e) => setVoltage(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-sm" style={{ color: 'var(--color-danger)' }}>
            Resistance: {resistance} {'\u03A9'}
          </span>
          <input
            type="range"
            min={1}
            max={100}
            step={1}
            value={resistance}
            onChange={(e) => setResistance(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="mt-4 p-3 rounded font-mono text-center text-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)', color: 'var(--color-primary)' }}>
        V = I x R&nbsp;&nbsp;|&nbsp;&nbsp;{voltage} = {current.toFixed(2)} x {resistance}
      </div>
    </div>
  );
}
