// TODO: Share chart data/logic with presentation/src/components/RenewableGrowthChart.jsx
import { useEffect, useRef, useCallback } from 'react';

// Canvas needs raw hex, not CSS custom properties
const colors = {
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  solar: '#f59e0b',
  secondary: '#a78bfa',
  primary: '#22d3ee',
};

const DATA = [
  { year: 2010, solar: 2, wind: 6, other: 9, total: 17 },
  { year: 2012, solar: 4, wind: 8, other: 11, total: 23 },
  { year: 2014, solar: 6, wind: 10, other: 12, total: 28 },
  { year: 2016, solar: 6, wind: 12, other: 14, total: 32 },
  { year: 2018, solar: 8, wind: 17, other: 13, total: 38 },
  { year: 2020, solar: 10, wind: 23, other: 13, total: 46 },
  { year: 2022, solar: 11, wind: 22, other: 14, total: 47 },
  { year: 2024, solar: 14, wind: 27, other: 14, total: 55 },
  { year: 2025, solar: 16, wind: 30, other: 14, total: 60 },
];

interface Props {
  height?: number;
}

export default function RenewableGrowthChart({ height = 360 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const progressRef = useRef(0);
  const startedRef = useRef(false);

  const draw = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    progressRef.current = Math.min(1, progressRef.current + 0.012);
    const p = progressRef.current;
    const ease = 1 - Math.pow(1 - p, 3);

    const padLeft = 50;
    const padRight = 150;
    const padTop = 40;
    const padBottom = 50;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const barW = chartW / DATA.length - 12;

    ctx.clearRect(0, 0, width, height);

    // Title
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 14px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText('GERMANY -- RENEWABLE SHARE OF ELECTRICITY GENERATION', padLeft, 24);

    // Y-axis gridlines
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 0.5;
    for (let pct = 0; pct <= 70; pct += 10) {
      const y = padTop + chartH - (pct / 70) * chartH;
      ctx.strokeStyle = colors.textDim + '20';
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`${pct}%`, padLeft - 8, y + 3);
    }
    ctx.setLineDash([]);

    // Bars
    DATA.forEach((d, i) => {
      const x = padLeft + (i * (chartW / DATA.length)) + 6;
      const maxH = (d.total / 70) * chartH;
      const animH = maxH * ease;

      const segments = [
        { val: d.other, color: colors.secondary + '60' },
        { val: d.wind, color: '#60a5fa' },
        { val: d.solar, color: colors.solar },
      ];

      let currentY = padTop + chartH;
      segments.forEach(seg => {
        const segH = (seg.val / 70) * chartH * ease;
        currentY -= segH;
        ctx.fillStyle = seg.color;
        ctx.beginPath();
        ctx.roundRect(x, currentY, barW, segH + 0.5, [0, 0, 0, 0]);
        ctx.fill();
      });

      // Round the top of the topmost bar
      const topSegH = (d.solar / 70) * chartH * ease;
      ctx.fillStyle = colors.solar;
      ctx.beginPath();
      ctx.roundRect(x, currentY, barW, topSegH, [4, 4, 0, 0]);
      ctx.fill();

      // Percentage label above bar
      if (ease > 0.5) {
        const labelAlpha = Math.min(1, (ease - 0.5) * 2);
        ctx.fillStyle = colors.text + Math.floor(labelAlpha * 255).toString(16).padStart(2, '0');
        ctx.font = 'bold 16px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(`${d.total}%`, x + barW / 2, padTop + chartH - animH - 8);
      }

      // Year label
      ctx.fillStyle = colors.textMuted;
      ctx.font = '11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText(d.year.toString(), x + barW / 2, height - padBottom + 18);
    });

    // Legend
    const legendY = height - 14;
    ctx.font = '10px Inter';
    ctx.textAlign = 'left';
    [
      { color: colors.solar, label: 'Solar' },
      { color: '#60a5fa', label: 'Wind' },
      { color: colors.secondary + '60', label: 'Hydro/Biomass' },
    ].forEach((item, i) => {
      const lx = padLeft + i * 100;
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, legendY - 4, 10, 10);
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(item.label, lx + 14, legendY + 5);
    });

    // Annotation on final bar
    if (ease > 0.9) {
      const alpha = Math.min(1, (ease - 0.9) * 10);
      const lastX = padLeft + ((DATA.length - 1) * (chartW / DATA.length)) + 6 + barW + 10;
      ctx.fillStyle = colors.primary + Math.floor(alpha * 200).toString(16).padStart(2, '0');
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'left';
      const arrowY = padTop + chartH - (60 / 70) * chartH;
      ctx.fillText('\u2190 and accelerating', lastX, arrowY + 4);
    }

    if (p < 1) {
      animRef.current = requestAnimationFrame(() => draw(width, height));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          progressRef.current = 0;
          const rect = container.getBoundingClientRect();
          draw(rect.width, height);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!startedRef.current) return;
      const rect = entries[0].contentRect;
      // Redraw at current progress
      const savedProgress = progressRef.current;
      cancelAnimationFrame(animRef.current);
      progressRef.current = savedProgress;
      draw(rect.width, height);
    });
    resizeObserver.observe(container);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [height, draw]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
      />
    </div>
  );
}
