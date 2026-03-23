import { useEffect, useRef } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

export default function WaterPipeIllustration() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());

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
      const h = 300;
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

      ctx.clearRect(0, 0, w, h);

      const padX = 40;
      const pipeY = 80;
      const pipeH = 40;
      const wireY = 200;
      const wireH = 20;

      // --- Water pipe section ---
      ctx.font = '15px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText('WATER ANALOGY', w / 2, 24);

      // Pipe body
      ctx.strokeStyle = c.surfaceLight;
      ctx.lineWidth = 2;
      ctx.fillStyle = c.surface;
      const pipeLeft = padX;
      const pipeRight = w - padX;
      ctx.beginPath();
      ctx.roundRect(pipeLeft, pipeY, pipeRight - pipeLeft, pipeH, 8);
      ctx.fill();
      ctx.stroke();

      // Narrow section for resistance
      const narrowStart = w * 0.55;
      const narrowEnd = w * 0.7;
      const narrowInset = 10;
      ctx.fillStyle = c.surface;
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(narrowStart, pipeY);
      ctx.lineTo(narrowStart + 15, pipeY + narrowInset);
      ctx.lineTo(narrowEnd - 15, pipeY + narrowInset);
      ctx.lineTo(narrowEnd, pipeY);
      ctx.lineTo(narrowEnd, pipeY + pipeH);
      ctx.lineTo(narrowEnd - 15, pipeY + pipeH - narrowInset);
      ctx.lineTo(narrowStart + 15, pipeY + pipeH - narrowInset);
      ctx.lineTo(narrowStart, pipeY + pipeH);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Water particles
      ctx.fillStyle = c.primary;
      const particleCount = 18;
      for (let i = 0; i < particleCount; i++) {
        const phase = (t * 0.8 + i / particleCount) % 1;
        let px = pipeLeft + 10 + phase * (pipeRight - pipeLeft - 20);
        let py = pipeY + pipeH / 2;
        let radius = 4;

        // Squeeze through narrow section
        if (px > narrowStart && px < narrowEnd) {
          const midN = (narrowStart + narrowEnd) / 2;
          const localPhase = (px - narrowStart) / (narrowEnd - narrowStart);
          const squeeze = Math.sin(localPhase * Math.PI) * narrowInset * 0.6;
          py += (i % 2 === 0 ? -1 : 1) * squeeze * 0.3;
          radius = 3;
        }

        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Labels for pipe
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';

      // Pressure label (left side)
      ctx.fillStyle = c.primary;
      ctx.fillText('Pressure', padX + 50, pipeY - 12);
      ctx.fillStyle = c.textDim;
      ctx.fillText('(Voltage)', padX + 50, pipeY - 0);

      // Flow rate label (middle)
      ctx.fillStyle = c.primary;
      ctx.fillText('Flow Rate', w * 0.38, pipeY + pipeH + 20);
      ctx.fillStyle = c.textDim;
      ctx.fillText('(Current)', w * 0.38, pipeY + pipeH + 32);

      // Pipe width label (narrow)
      ctx.fillStyle = c.accent;
      ctx.fillText('Pipe Width', (narrowStart + narrowEnd) / 2, pipeY - 12);
      ctx.fillStyle = c.textDim;
      ctx.fillText('(Resistance)', (narrowStart + narrowEnd) / 2, pipeY - 0);

      // --- Wire section ---
      ctx.font = '15px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText('ELECTRICAL EQUIVALENT', w / 2, wireY - 30);

      // Wire
      ctx.strokeStyle = c.surfaceLight;
      ctx.lineWidth = 2;
      ctx.fillStyle = c.surface;
      ctx.beginPath();
      ctx.roundRect(pipeLeft, wireY, pipeRight - pipeLeft, wireH, 6);
      ctx.fill();
      ctx.stroke();

      // Resistor symbol on wire
      const rStart = narrowStart;
      const rEnd = narrowEnd;
      ctx.strokeStyle = c.accent;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      const zigzags = 6;
      const rW = rEnd - rStart;
      for (let i = 0; i <= zigzags; i++) {
        const x = rStart + (i / zigzags) * rW;
        const y = wireY + wireH / 2 + (i % 2 === 0 ? -6 : 6);
        if (i === 0) ctx.moveTo(x, wireY + wireH / 2);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(rEnd, wireY + wireH / 2);
      ctx.stroke();

      // Electrons on wire
      ctx.fillStyle = c.primary;
      const eCount = 12;
      for (let i = 0; i < eCount; i++) {
        const phase = (t * 0.8 + i / eCount) % 1;
        const px = pipeLeft + 10 + phase * (pipeRight - pipeLeft - 20);
        const py = wireY + wireH / 2;

        // Skip if in resistor zone
        if (px > rStart && px < rEnd) continue;

        ctx.globalAlpha = 0.7;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();

        // Minus sign for electrons
        ctx.fillStyle = c.bg;
        ctx.fillRect(px - 1.5, py - 0.5, 3, 1);
        ctx.fillStyle = c.primary;
      }
      ctx.globalAlpha = 1;

      // Wire labels
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = c.primary;
      ctx.fillText('Voltage', padX + 50, wireY + wireH + 18);
      ctx.fillStyle = c.primary;
      ctx.fillText('Current', w * 0.38, wireY + wireH + 18);
      ctx.fillStyle = c.accent;
      ctx.fillText('Resistance', (rStart + rEnd) / 2, wireY + wireH + 18);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="my-8 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Water pipe analogy for electricity: pressure is voltage, flow rate is current, pipe width is resistance"
      />
    </div>
  );
}
