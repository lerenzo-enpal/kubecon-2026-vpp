import { useEffect, useRef } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

export default function GenerationMethods() {
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

    function drawTurbineBlades(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, angle: number, color: string) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.rotate((i * Math.PI * 2) / 3);
        ctx.beginPath();
        ctx.ellipse(0, -r * 0.5, r * 0.12, r * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      // Hub
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
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

      const methods = [
        { label: 'Coal / Gas', spins: true },
        { label: 'Nuclear', spins: true },
        { label: 'Hydro', spins: true },
        { label: 'Wind', spins: true },
        { label: 'Solar PV', spins: false },
      ];

      const cols = methods.length;
      const colW = w / cols;
      const iconY = 100;
      const iconR = 30;

      methods.forEach((m, i) => {
        const cx = colW * i + colW / 2;

        if (m.label === 'Coal / Gas') {
          // Chimney with steam
          ctx.fillStyle = c.surfaceLight;
          ctx.fillRect(cx - 12, iconY - 20, 24, 40);
          // Top
          ctx.fillRect(cx - 16, iconY - 24, 32, 8);
          // Steam puffs
          for (let p = 0; p < 4; p++) {
            const py = iconY - 30 - p * 14 - ((t * 20 + p * 5) % 20);
            const px = cx + Math.sin(t * 2 + p) * 6;
            const opacity = Math.max(0, 0.6 - p * 0.15);
            ctx.globalAlpha = opacity;
            ctx.fillStyle = c.textDim;
            ctx.beginPath();
            ctx.arc(px, py, 5 + p * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          // Turbine inside
          drawTurbineBlades(ctx, cx, iconY + 6, 10, t * 3, c.primary);
        }

        if (m.label === 'Nuclear') {
          // Cooling tower shape
          ctx.strokeStyle = c.surfaceLight;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx - 20, iconY + 20);
          ctx.quadraticCurveTo(cx - 8, iconY - 5, cx - 14, iconY - 25);
          ctx.lineTo(cx + 14, iconY - 25);
          ctx.quadraticCurveTo(cx + 8, iconY - 5, cx + 20, iconY + 20);
          ctx.closePath();
          ctx.fillStyle = c.surface;
          ctx.fill();
          ctx.stroke();
          // Steam
          for (let p = 0; p < 3; p++) {
            const py = iconY - 30 - p * 12 - ((t * 15 + p * 7) % 18);
            const px = cx + Math.sin(t * 1.5 + p) * 5;
            ctx.globalAlpha = Math.max(0, 0.5 - p * 0.15);
            ctx.fillStyle = c.textDim;
            ctx.beginPath();
            ctx.arc(px, py, 6 + p * 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          // Turbine symbol
          drawTurbineBlades(ctx, cx, iconY + 6, 8, t * 2.5, c.primary);
        }

        if (m.label === 'Hydro') {
          // Dam shape
          ctx.fillStyle = c.surfaceLight;
          ctx.beginPath();
          ctx.moveTo(cx - 25, iconY - 20);
          ctx.lineTo(cx - 18, iconY + 20);
          ctx.lineTo(cx + 18, iconY + 20);
          ctx.lineTo(cx + 25, iconY - 20);
          ctx.closePath();
          ctx.fill();
          // Water
          ctx.fillStyle = c.primary;
          ctx.globalAlpha = 0.3;
          ctx.fillRect(cx - 25, iconY - 5, 50, 25);
          ctx.globalAlpha = 1;
          // Water flow
          for (let p = 0; p < 5; p++) {
            const px = cx + 18 + ((t * 30 + p * 8) % 25);
            const py = iconY + 15 + p * 2;
            ctx.fillStyle = c.primary;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          // Turbine
          drawTurbineBlades(ctx, cx, iconY + 5, 9, t * 4, c.primary);
        }

        if (m.label === 'Wind') {
          // Tower
          ctx.strokeStyle = c.surfaceLight;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, iconY - 25);
          ctx.lineTo(cx, iconY + 20);
          ctx.stroke();
          // Nacelle
          ctx.fillStyle = c.surfaceLight;
          ctx.fillRect(cx - 4, iconY - 28, 8, 6);
          // Blades
          drawTurbineBlades(ctx, cx, iconY - 28, 22, t * 2, c.primary);
        }

        if (m.label === 'Solar PV') {
          // Panel
          ctx.fillStyle = c.surface;
          ctx.strokeStyle = c.surfaceLight;
          ctx.lineWidth = 1.5;

          ctx.save();
          ctx.translate(cx, iconY);
          ctx.rotate(-0.2);

          // Panel body
          ctx.fillRect(-22, -15, 44, 30);
          ctx.strokeRect(-22, -15, 44, 30);
          // Grid lines
          ctx.strokeStyle = c.textDim;
          ctx.lineWidth = 0.5;
          for (let g = 1; g < 4; g++) {
            ctx.beginPath();
            ctx.moveTo(-22 + g * 11, -15);
            ctx.lineTo(-22 + g * 11, 15);
            ctx.stroke();
          }
          for (let g = 1; g < 3; g++) {
            ctx.beginPath();
            ctx.moveTo(-22, -15 + g * 10);
            ctx.lineTo(22, -15 + g * 10);
            ctx.stroke();
          }

          ctx.restore();

          // Stand
          ctx.strokeStyle = c.surfaceLight;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cx, iconY + 12);
          ctx.lineTo(cx, iconY + 20);
          ctx.stroke();

          // Photon arrows coming down (no spinning)
          ctx.strokeStyle = c.accent;
          ctx.lineWidth = 1;
          for (let p = 0; p < 4; p++) {
            const px = cx - 15 + p * 10;
            const baseY = iconY - 30;
            const arrY = baseY - 10 - ((t * 15 + p * 6) % 20);
            ctx.globalAlpha = Math.max(0.2, 0.8 - ((t * 15 + p * 6) % 20) / 25);
            ctx.beginPath();
            ctx.moveTo(px, arrY);
            ctx.lineTo(px + 3, arrY + 10);
            ctx.stroke();
            // Arrowhead
            ctx.beginPath();
            ctx.moveTo(px + 3, arrY + 10);
            ctx.lineTo(px + 1, arrY + 7);
            ctx.moveTo(px + 3, arrY + 10);
            ctx.lineTo(px + 5, arrY + 7);
            ctx.stroke();
          }
          ctx.globalAlpha = 1;

          // NO spinning indicator -- conspicuously still
          ctx.fillStyle = c.accent;
          ctx.globalAlpha = 0.15;
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText('no moving parts', cx, iconY + 35);
          ctx.globalAlpha = 1;
        }

        // Labels
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.text;
        ctx.textAlign = 'center';
        ctx.fillText(m.label, cx, iconY + 55);

        // Spinning indicator
        if (m.spins) {
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillStyle = c.primary;
          ctx.globalAlpha = 0.5;
          ctx.fillText('spins', cx, iconY + 68);
          ctx.globalAlpha = 1;
        }
      });

      // Caption
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText('Almost everything spins -- except solar PV', w / 2, h - 20);

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
        aria-label="Five electricity generation methods: coal, nuclear, hydro, and wind all spin turbines; solar PV has no moving parts"
      />
    </div>
  );
}
