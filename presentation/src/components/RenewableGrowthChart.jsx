import React, { useEffect, useRef } from 'react';
import { colors } from '../theme';

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

export default function RenewableGrowthChart({ width = 850, height = 360 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padLeft = 50;
    const padRight = 30;
    const padTop = 40;
    const padBottom = 50;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const barW = chartW / DATA.length - 12;

    const draw = () => {
      progressRef.current = Math.min(1, progressRef.current + 0.012);
      const p = progressRef.current;
      const ease = 1 - Math.pow(1 - p, 3); // ease-out cubic

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Title
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('GERMANY — RENEWABLE SHARE OF ELECTRICITY GENERATION', padLeft, 24);

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

        // Stacked: other (bottom), wind (middle), solar (top)
        const segments = [
          { val: d.other, color: colors.secondary + '60', label: '' },
          { val: d.wind, color: '#60a5fa', label: '' },
          { val: d.solar, color: colors.solar, label: '' },
        ];

        let currentY = padTop + chartH;
        segments.forEach(seg => {
          const segH = (seg.val / 70) * chartH * ease;
          currentY -= segH;

          ctx.fillStyle = seg.color;
          // Rounded top on last segment
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

      // "This is not slowing down" annotation on final bar
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
        animRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
    />
  );
}
