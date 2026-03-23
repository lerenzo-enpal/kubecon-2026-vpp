import { useEffect, useRef } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

export default function TransformerDiagram() {
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
      const h = 270;
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

    function drawCoil(ctx: CanvasRenderingContext2D, cx: number, cy: number, turns: number, h: number, color: string) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      const turnH = h / turns;
      for (let i = 0; i < turns; i++) {
        const y = cy - h / 2 + i * turnH;
        ctx.beginPath();
        ctx.ellipse(cx, y + turnH / 2, 12, turnH / 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    function draw() {
      const ctx = canvas!.getContext('2d');
      if (!ctx) return;
      const c = colorsRef.current;
      const dpr = window.devicePixelRatio || 1;
      const w = canvas!.width / dpr;
      const h = canvas!.height / dpr;
      const t = Date.now() / 1000;

      ctx.clearRect(0, 0, w, h);

      const midX = w / 2;
      const midY = 90;

      // Iron core (two vertical bars)
      const coreW = 8;
      const coreH = 100;
      const coreGap = 50;
      ctx.fillStyle = c.surfaceLight;
      ctx.fillRect(midX - coreGap / 2 - coreW, midY - coreH / 2, coreW, coreH);
      ctx.fillRect(midX + coreGap / 2, midY - coreH / 2, coreW, coreH);
      // Top and bottom bars
      ctx.fillRect(midX - coreGap / 2 - coreW, midY - coreH / 2, coreGap + coreW * 2, coreW);
      ctx.fillRect(midX - coreGap / 2 - coreW, midY + coreH / 2 - coreW, coreGap + coreW * 2, coreW);

      // Primary coil (left, fewer turns = low voltage input)
      const primaryX = midX - coreGap / 2 - coreW - 18;
      drawCoil(ctx, primaryX, midY, 4, 70, c.primary);

      // Secondary coil (right, many turns = high voltage output)
      const secondaryX = midX + coreGap / 2 + coreW + 18;
      drawCoil(ctx, secondaryX, midY, 8, 70, c.accent);

      // Energy sparks flowing through core
      const sparkCount = 5;
      for (let i = 0; i < sparkCount; i++) {
        const phase = (t * 1.5 + i / sparkCount) % 1;
        let sx: number, sy: number;

        // Trace around the core: left side up, top, right side down, bottom
        const totalPath = 2 * coreH + 2 * (coreGap + coreW * 2);
        const pos = phase * totalPath;

        if (pos < coreH) {
          // Left side going up
          sx = midX - coreGap / 2 - coreW / 2;
          sy = midY + coreH / 2 - pos;
        } else if (pos < coreH + coreGap + coreW * 2) {
          // Top going right
          sx = midX - coreGap / 2 - coreW + (pos - coreH);
          sy = midY - coreH / 2 + coreW / 2;
        } else if (pos < 2 * coreH + coreGap + coreW * 2) {
          // Right side going down
          sx = midX + coreGap / 2 + coreW / 2;
          sy = midY - coreH / 2 + (pos - coreH - coreGap - coreW * 2);
        } else {
          // Bottom going left
          sx = midX + coreGap / 2 + coreW * 2 - (pos - 2 * coreH - coreGap - coreW * 2);
          sy = midY + coreH / 2 - coreW / 2;
        }

        ctx.fillStyle = c.accent;
        ctx.globalAlpha = 0.6 + Math.sin(t * 8 + i) * 0.3;
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Voltage labels
      ctx.font = 'bold 17px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = c.primary;
      ctx.fillText('230 V', primaryX - 20, midY + coreH / 2 + 28);

      ctx.fillStyle = c.accent;
      ctx.fillText('400 kV', secondaryX + 20, midY + coreH / 2 + 28);

      // Arrow between
      ctx.fillStyle = c.text;
      ctx.font = 'bold 18px "JetBrains Mono", monospace';
      ctx.fillText('Step-Up', midX, midY + coreH / 2 + 28);

      // Caption below transformer
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textMuted;
      ctx.fillText('Transformers only work with AC -- that\'s why AC won', midX, midY + coreH / 2 + 54);

      // Transmission line sketch below
      const lineY = h - 40;
      ctx.strokeStyle = c.surfaceLight;
      ctx.lineWidth = 1.5;

      // Towers
      const towerCount = 5;
      const towerSpacing = (w - 80) / (towerCount - 1);
      for (let i = 0; i < towerCount; i++) {
        const tx = 40 + i * towerSpacing;
        // Tower body
        ctx.beginPath();
        ctx.moveTo(tx - 6, lineY);
        ctx.lineTo(tx, lineY - 25);
        ctx.lineTo(tx + 6, lineY);
        ctx.stroke();
        // Cross arm
        ctx.beginPath();
        ctx.moveTo(tx - 10, lineY - 18);
        ctx.lineTo(tx + 10, lineY - 18);
        ctx.stroke();
      }

      // Wires between towers
      ctx.strokeStyle = c.primary;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.moveTo(40, lineY - 18);
      for (let i = 1; i < towerCount; i++) {
        const tx = 40 + i * towerSpacing;
        const prevTx = 40 + (i - 1) * towerSpacing;
        const midTx = (prevTx + tx) / 2;
        ctx.quadraticCurveTo(midTx, lineY - 12, tx, lineY - 18);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Power loss annotation
      ctx.font = '16px "JetBrains Mono", monospace';
      ctx.fillStyle = c.danger;
      ctx.textAlign = 'center';
      ctx.fillText('P = I\u00B2R  (lower current = less loss)', midX, lineY + 20);

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
        aria-label="Transformer diagram: two coils on iron core stepping up 230V to 400kV, with transmission towers below showing power loss formula P=I squared R"
      />
    </div>
  );
}
