import React, { useRef, useEffect } from 'react';
import { SlideContext } from 'spectacle';

// Quarterly curtailment data by region (GWh, approximate)
// Q1 2023 through Q2 2026
const QUARTERS = ['Q1\'23','Q2','Q3','Q4','Q1\'24','Q2','Q3','Q4','Q1\'25','Q2','Q3','Q4','Q1\'26','Q2'];
const SERIES = [
  {
    name: 'Kyushu',
    color: '#FFC217',
    data: [280, 420, 380, 180, 320, 510, 445, 210, 490, 870, 820, 410, 650, 940],
  },
  {
    name: 'Chugoku',
    color: '#FFA35F',
    data: [0, 0, 20, 10, 35, 65, 55, 25, 80, 140, 125, 60, 110, 170],
  },
  {
    name: 'Shikoku',
    color: '#a78bfa',
    data: [0, 0, 0, 0, 0, 15, 12, 5, 20, 45, 38, 18, 42, 68],
  },
  {
    name: 'Tokyo/TEPCO',
    color: '#22d3ee',
    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 3, 28, 75], // reaches Tokyo in Q1'26
  },
];
const TOKYO_MILESTONE_IDX = 12; // Q1 2026

export function KyushuCurtailmentChart({ height = 320 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const slideCtx = React.useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;

  useEffect(() => {
    if (!isActive) { cancelAnimationFrame(rafRef.current); return; }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.parentElement.clientWidth;
    const H = height;
    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    const padL = 60, padR = 120, padT = 55, padB = 65;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const n = QUARTERS.length;
    const maxVal = 1000;
    const DURATION = 2000;
    const startTime = performance.now();

    function xOf(i) { return padL + (i / (n - 1)) * chartW; }
    function yOf(v) { return padT + chartH - (v / maxVal) * chartH; }

    function draw(now) {
      const t = Math.min((now - startTime) / DURATION, 1);
      const visibleCount = Math.max(2, Math.floor(t * n));
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(57,57,216,0.12)';
      ctx.lineWidth = 1;
      [0, 200, 400, 600, 800, 1000].forEach(v => {
        const y = yOf(v);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();
        ctx.fillStyle = '#64748b';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${v}`, padL - 6, y + 4);
      });

      // Y label
      ctx.save();
      ctx.translate(14, padT + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('GWh curtailed', 0, 0);
      ctx.restore();

      // X-axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      QUARTERS.forEach((q, i) => {
        if (i % 2 === 0) {
          ctx.fillText(q, xOf(i), H - padB + 18);
        }
      });

      // Draw each series
      SERIES.forEach((series) => {
        if (visibleCount < 2) return;
        ctx.shadowBlur = series.name === 'Kyushu' ? 10 : 0;
        ctx.shadowColor = series.color;
        ctx.strokeStyle = series.color;
        ctx.lineWidth = series.name === 'Kyushu' ? 2.5 : 1.5;
        ctx.globalAlpha = series.name === 'Kyushu' ? 1.0 : 0.65;
        ctx.beginPath();
        ctx.moveTo(xOf(0), yOf(series.data[0]));
        for (let i = 1; i < Math.min(visibleCount, series.data.length); i++) {
          ctx.lineTo(xOf(i), yOf(series.data[i]));
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      // Tokyo milestone marker
      if (visibleCount > TOKYO_MILESTONE_IDX) {
        const mx = xOf(TOKYO_MILESTONE_IDX);
        ctx.strokeStyle = 'rgba(34,211,238,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(mx, padT);
        ctx.lineTo(mx, padT + chartH);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Curtailment', mx, padT - 20);
        ctx.fillText('reaches Tokyo', mx, padT - 8);
      }

      // H1 2025 callout (Q1+Q2 2025 = idx 8,9)
      if (visibleCount > 10) {
        ctx.fillStyle = 'rgba(6,10,26,0.8)';
        ctx.fillRect(padL + chartW * 0.45, padT + 4, 180, 40);
        ctx.strokeStyle = '#FFC217';
        ctx.lineWidth = 1;
        ctx.strokeRect(padL + chartW * 0.45, padT + 4, 180, 40);
        ctx.fillStyle = '#FFC217';
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1.74 TWh wasted', padL + chartW * 0.45 + 90, padT + 22);
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Kyushu — H1 2025', padL + chartW * 0.45 + 90, padT + 38);
      }

      // Legend
      SERIES.forEach((series, i) => {
        const lx = W - padR + 12;
        const ly = padT + i * 22 + 10;
        ctx.fillStyle = series.color;
        ctx.fillRect(lx, ly - 6, 16, 4);
        ctx.fillStyle = series.name === 'Tokyo/TEPCO' ? '#22d3ee' : '#94a3b8';
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(series.name, lx + 20, ly);
      });

      if (t < 1) rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, height]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />;
}
