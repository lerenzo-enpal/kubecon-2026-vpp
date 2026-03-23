import { useEffect, useRef, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

interface TechBand {
  name: string;
  startIdx: number;
  endIdx: number;
  color: string;
}

const DURATIONS = ['seconds', 'minutes', 'hours', 'days', 'weeks', 'seasons'];

const TECHS: TechBand[] = [
  { name: 'Flywheels',       startIdx: 0,   endIdx: 1,   color: '#22d3ee' },  // cyan
  { name: 'Li-ion',          startIdx: 1,   endIdx: 2.6, color: '#10b981' },  // green
  { name: 'Flow Batteries',  startIdx: 2.6, endIdx: 3.4, color: '#a78bfa' },  // purple
  { name: 'Compressed Air',  startIdx: 2.8, endIdx: 3.8, color: '#f59e0b' },  // amber
  { name: 'Pumped Hydro',    startIdx: 2.5, endIdx: 3.8, color: '#3b82f6' },  // blue
  { name: 'Gravity',         startIdx: 2.6, endIdx: 3.4, color: '#14b8a6' },  // teal
  { name: 'Thermal',         startIdx: 2,   endIdx: 3.5, color: '#f97316' },  // orange
  { name: 'Hydrogen',        startIdx: 3,   endIdx: 5,   color: '#84cc16' },  // yellow-green
];

const BAND_HEIGHT = 22;
const BAND_GAP = 4;

export default function DurationSpectrumChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const doneRef = useRef(false);
  const colorsRef = useRef<CanvasThemeColors | null>(null);

  const draw = useCallback((progress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    if (!colorsRef.current) colorsRef.current = getCanvasThemeColors();
    const colors = colorsRef.current;

    ctx.clearRect(0, 0, w, h);

    const padLeft = 120;
    const padRight = 24;
    const padTop = 30;
    const padBottom = 40;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    // X-axis labels
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillStyle = colors.textDim;

    for (let i = 0; i < DURATIONS.length; i++) {
      const x = padLeft + (i / (DURATIONS.length - 1)) * chartW;
      ctx.fillText(DURATIONS[i], x, padTop + chartH + 12);

      // Vertical grid line
      ctx.strokeStyle = colors.surfaceLight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + chartH);
      ctx.stroke();
    }

    // Title
    ctx.font = '14px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('DISCHARGE DURATION', padLeft, 10);

    // Draw bands
    const totalBandH = TECHS.length * (BAND_HEIGHT + BAND_GAP) - BAND_GAP;
    const bandStartY = padTop + (chartH - totalBandH) / 2;

    for (let i = 0; i < TECHS.length; i++) {
      const tech = TECHS[i];
      const y = bandStartY + i * (BAND_HEIGHT + BAND_GAP);

      const x0 = padLeft + (tech.startIdx / (DURATIONS.length - 1)) * chartW;
      const x1 = padLeft + (tech.endIdx / (DURATIONS.length - 1)) * chartW;
      const bandW = (x1 - x0) * progress;

      // Band background
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = tech.color;
      ctx.beginPath();
      ctx.roundRect(x0, y, Math.max(bandW, 0), BAND_HEIGHT, 4);
      ctx.fill();

      // Band border
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = tech.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(x0, y, Math.max(bandW, 0), BAND_HEIGHT, 4);
      ctx.stroke();

      ctx.globalAlpha = 1;

      // Label
      if (progress > 0.3) {
        const labelAlpha = Math.min(1, (progress - 0.3) / 0.3);
        ctx.globalAlpha = labelAlpha;
        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = tech.color;
        ctx.fillText(tech.name, padLeft - 8, y + BAND_HEIGHT / 2);
        ctx.globalAlpha = 1;
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function sizeCanvas() {
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      const w = container.clientWidth;
      const h = 250;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      colorsRef.current = getCanvasThemeColors();
      if (doneRef.current) draw(1);
    }

    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !doneRef.current && !startRef.current) {
          startRef.current = performance.now();
          function animate(now: number) {
            const elapsed = now - startRef.current;
            const progress = Math.min(1, elapsed / 1500);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            draw(eased);
            if (progress < 1) {
              rafRef.current = requestAnimationFrame(animate);
            } else {
              doneRef.current = true;
            }
          }
          rafRef.current = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(container);

    // Check reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doneRef.current = true;
      draw(1);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', sizeCanvas);
      observer.disconnect();
    };
  }, [draw]);

  return (
    <div ref={containerRef} className="w-full my-6">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Chart showing discharge duration ranges for eight energy storage technologies, from flywheels at seconds to hydrogen at seasonal scale"
      />
    </div>
  );
}
