import { useEffect, useRef, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

// Real data points: BloombergNEF lithium-ion battery pack prices, $/kWh
const DATA: [number, number][] = [
  [2010, 1100],
  [2011, 900],
  [2012, 720],
  [2013, 600],
  [2014, 530],
  [2015, 400],
  [2016, 300],
  [2017, 240],
  [2018, 185],
  [2019, 156],
  [2020, 140],
  [2021, 132],
  [2022, 151],
  [2023, 139],
];

// Projected range for 2030
const PROJECTION: [number, number, number][] = [
  // [year, low, high]
  [2024, 130, 142],
  [2025, 115, 130],
  [2026, 100, 120],
  [2027, 90, 110],
  [2028, 80, 100],
  [2029, 70, 90],
  [2030, 50, 80],
];

interface Milestone {
  price: number;
  label: string;
  color: string;
}

const MILESTONES: Milestone[] = [
  { price: 300, label: 'EVs competitive', color: 'var(--color-accent)' },
  { price: 140, label: 'Home storage viable', color: 'var(--color-success)' },
  { price: 100, label: 'Cheaper than peakers', color: 'var(--color-primary)' },
];

interface Annotation {
  year: number;
  price: number;
  label: string;
}

const ANNOTATIONS: Annotation[] = [
  { year: 2015, price: 400, label: 'Gigafactories' },
  { year: 2018, price: 185, label: 'Less cobalt' },
  { year: 2021, price: 132, label: 'Competition' },
];

export default function CostCurveChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const rafRef = useRef(0);
  const startTimeRef = useRef(0);
  const isVisibleRef = useRef(false);
  const animStartedRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => { colorsRef.current = getCanvasThemeColors(); };
    mql.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mql.removeEventListener('change', update); observer.disconnect(); };
  }, []);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 280;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function draw(now: number) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) { rafRef.current = requestAnimationFrame(draw); return; }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const c = colorsRef.current;

      if (!animStartedRef.current && isVisibleRef.current) {
        animStartedRef.current = true;
        startTimeRef.current = now;
      }

      const elapsed = animStartedRef.current ? (now - startTimeRef.current) / 1000 : 0;
      const animDuration = reducedMotion ? 0 : 2;
      const progress = animDuration === 0 ? 1 : Math.min(1, elapsed / animDuration);

      ctx.clearRect(0, 0, w, h);

      // Chart area
      const padLeft = 55;
      const padRight = 30;
      const padTop = 30;
      const padBottom = 50;
      const chartW = w - padLeft - padRight;
      const chartH = h - padTop - padBottom;

      const minYear = 2010;
      const maxYear = 2030;
      const minPrice = 0;
      const maxPrice = 1200;

      function xPos(year: number) {
        return padLeft + ((year - minYear) / (maxYear - minYear)) * chartW;
      }
      function yPos(price: number) {
        return padTop + ((maxPrice - price) / (maxPrice - minPrice)) * chartH;
      }

      // Grid lines
      ctx.strokeStyle = c.surfaceLight;
      ctx.lineWidth = 0.5;
      for (let p = 0; p <= 1200; p += 200) {
        const y = yPos(p);
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.stroke();

        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = c.textDim;
        ctx.textAlign = 'right';
        ctx.fillText(`$${p}`, padLeft - 6, y + 3);
      }

      // Year labels
      ctx.textAlign = 'center';
      for (let yr = 2010; yr <= 2030; yr += 5) {
        const x = xPos(yr);
        ctx.fillStyle = c.textDim;
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillText(String(yr), x, padTop + chartH + 18);
      }

      // Milestone price lines (horizontal dashed)
      for (const ms of MILESTONES) {
        const y = yPos(ms.price);
        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        ctx.moveTo(padLeft, y);
        ctx.lineTo(padLeft + chartW, y);
        ctx.strokeStyle = ms.color;
        ctx.globalAlpha = 0.25;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = ms.color;
        ctx.globalAlpha = 0.7;
        ctx.textAlign = 'left';
        ctx.fillText(ms.label, padLeft + chartW + 4, y + 3);
        ctx.globalAlpha = 1;
      }

      // Projection area (shaded)
      if (progress > 0.85) {
        const projAlpha = Math.min(1, (progress - 0.85) / 0.15);
        ctx.globalAlpha = 0.1 * projAlpha;
        ctx.fillStyle = c.primary;
        ctx.beginPath();
        // Top edge (low prices)
        for (let i = 0; i < PROJECTION.length; i++) {
          const x = xPos(PROJECTION[i][0]);
          const y = yPos(PROJECTION[i][1]);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        // Bottom edge (high prices) in reverse
        for (let i = PROJECTION.length - 1; i >= 0; i--) {
          ctx.lineTo(xPos(PROJECTION[i][0]), yPos(PROJECTION[i][2]));
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        // Dashed projection lines
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = c.primary;
        ctx.globalAlpha = 0.4 * projAlpha;

        // Low line
        ctx.beginPath();
        ctx.moveTo(xPos(DATA[DATA.length - 1][0]), yPos(DATA[DATA.length - 1][1]));
        for (const pt of PROJECTION) {
          ctx.lineTo(xPos(pt[0]), yPos(pt[1]));
        }
        ctx.stroke();

        // High line
        ctx.beginPath();
        ctx.moveTo(xPos(DATA[DATA.length - 1][0]), yPos(DATA[DATA.length - 1][1]));
        for (const pt of PROJECTION) {
          ctx.lineTo(xPos(pt[0]), yPos(pt[2]));
        }
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.globalAlpha = 1;

        // $50-80 label at end
        ctx.font = '10px "JetBrains Mono", monospace';
        ctx.fillStyle = c.primary;
        ctx.globalAlpha = 0.7 * projAlpha;
        ctx.textAlign = 'center';
        const endX = xPos(2030);
        ctx.fillText('$50-80', endX, yPos(65) - 8);
        ctx.globalAlpha = 1;
      }

      // Main data line (animated)
      const totalPoints = DATA.length;
      const visiblePoints = Math.ceil(progress * totalPoints);

      if (visiblePoints > 1) {
        ctx.beginPath();
        ctx.moveTo(xPos(DATA[0][0]), yPos(DATA[0][1]));
        for (let i = 1; i < visiblePoints; i++) {
          ctx.lineTo(xPos(DATA[i][0]), yPos(DATA[i][1]));
        }
        // Partial segment for smooth animation
        if (visiblePoints < totalPoints) {
          const frac = (progress * totalPoints) - Math.floor(progress * totalPoints);
          const prev = DATA[visiblePoints - 1];
          const next = DATA[visiblePoints];
          if (next) {
            ctx.lineTo(
              xPos(prev[0] + (next[0] - prev[0]) * frac),
              yPos(prev[1] + (next[1] - prev[1]) * frac)
            );
          }
        }
        ctx.strokeStyle = c.primary;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Dots at data points
        for (let i = 0; i < visiblePoints && i < totalPoints; i++) {
          ctx.beginPath();
          ctx.arc(xPos(DATA[i][0]), yPos(DATA[i][1]), 3, 0, Math.PI * 2);
          ctx.fillStyle = c.primary;
          ctx.fill();
        }
      }

      // Start and end labels
      if (visiblePoints >= 1) {
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = c.text;
        ctx.textAlign = 'center';
        ctx.fillText('$1,100', xPos(2010), yPos(1100) - 10);
      }
      if (visiblePoints >= totalPoints) {
        ctx.fillText('$139', xPos(2023), yPos(139) - 10);
      }

      // Annotations (appear after line passes)
      for (const ann of ANNOTATIONS) {
        const annIdx = DATA.findIndex(d => d[0] >= ann.year);
        if (annIdx >= 0 && visiblePoints > annIdx) {
          const annProgress = Math.min(1, (visiblePoints - annIdx) / 3);
          ctx.globalAlpha = annProgress * 0.6;
          ctx.font = '9px "JetBrains Mono", monospace';
          ctx.fillStyle = c.textMuted;
          ctx.textAlign = 'center';
          const ax = xPos(ann.year);
          const ay = yPos(ann.price);
          // Small arrow line down
          ctx.beginPath();
          ctx.moveTo(ax, ay - 20);
          ctx.lineTo(ax, ay - 8);
          ctx.strokeStyle = c.textDim;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.fillText(ann.label, ax, ay - 24);
          ctx.globalAlpha = 1;
        }
      }

      // Y axis label
      ctx.save();
      ctx.translate(12, padTop + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textDim;
      ctx.textAlign = 'center';
      ctx.fillText('$/kWh', 0, 0);
      ctx.restore();

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    // IntersectionObserver to trigger animation on first visibility
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && !animStartedRef.current) {
          rafRef.current = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', sizeCanvas);
      observer.disconnect();
    };
  }, [sizeCanvas]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Battery pack cost curve from $1,100/kWh in 2010 to $139/kWh in 2023, with projection to $50-80 by 2030"
        style={{ width: '100%', height: 280 }}
      />
    </div>
  );
}
