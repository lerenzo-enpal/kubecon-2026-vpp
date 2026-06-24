import React, { useRef, useEffect } from 'react';
import { SlideContext } from 'spectacle';

// Jan 2021 JEPX spot price spike data (approximate daily JPY/kWh)
const PRICE_DATA = [
  10, 11, 12, 14, 18, 22, 30, 45, 62, 80,
  105, 130, 155, 180, 210, 235, 251, 248, 240, 225,
  205, 185, 162, 140, 118, 95, 75, 58, 42, 32,
  24, 18, 14, 11, 10, 10, 10, 10, 10, 10,
];
const PEAK_IDX = 16;
const PEAK_VALUE = 251;

export function JEPXPriceChart({ height = 320 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const progressRef = useRef(0);
  const slideCtx = React.useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;

  useEffect(() => {
    if (!isActive) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = canvas.parentElement;
    const W = container.clientWidth;
    const H = height;
    canvas.width = W * 2;
    canvas.height = H * 2;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);

    const padL = 64, padR = 48, padT = 55, padB = 65;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const maxVal = 270;
    const n = PRICE_DATA.length;
    const startTime = performance.now();
    const DURATION = 2200;

    function xOf(i) { return padL + (i / (n - 1)) * chartW; }
    function yOf(v) { return padT + chartH - (v / maxVal) * chartH; }

    function draw(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / DURATION, 1);
      const visibleCount = Math.max(2, Math.floor(t * n));

      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(57,57,216,0.12)';
      ctx.lineWidth = 1;
      [0, 50, 100, 150, 200, 250].forEach(v => {
        const y = yOf(v);
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();
      });

      // Y-axis labels
      ctx.fillStyle = '#64748b';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      [0, 50, 100, 150, 200, 250].forEach(v => {
        ctx.fillText(`${v}`, padL - 8, yOf(v) + 4);
      });

      // Y-axis unit
      ctx.save();
      ctx.translate(14, padT + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#64748b';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('JPY / kWh', 0, 0);
      ctx.restore();

      // X-axis label
      ctx.fillStyle = '#64748b';
      ctx.textAlign = 'center';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText('January – February 2021 (40 days)', padL + chartW / 2, H - 12);

      // Price line with glow
      if (visibleCount >= 2) {
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ef4444';
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(xOf(0), yOf(PRICE_DATA[0]));
        for (let i = 1; i < visibleCount; i++) {
          ctx.lineTo(xOf(i), yOf(PRICE_DATA[i]));
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Area fill under line
        ctx.fillStyle = 'rgba(239,68,68,0.08)';
        ctx.beginPath();
        ctx.moveTo(xOf(0), yOf(PRICE_DATA[0]));
        for (let i = 1; i < visibleCount; i++) {
          ctx.lineTo(xOf(i), yOf(PRICE_DATA[i]));
        }
        ctx.lineTo(xOf(visibleCount - 1), padT + chartH);
        ctx.lineTo(xOf(0), padT + chartH);
        ctx.closePath();
        ctx.fill();
      }

      // Baseline (pre-crisis) reference line
      ctx.strokeStyle = 'rgba(34,211,238,0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(padL, yOf(10));
      ctx.lineTo(padL + chartW, yOf(10));
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#22d3ee';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('~10 JPY/kWh (normal)', padL + 4, yOf(10) - 6);

      // Peak annotation — only show once line reaches peak
      if (visibleCount > PEAK_IDX + 1 && t > 0.45) {
        const px = xOf(PEAK_IDX);
        const py = yOf(PEAK_VALUE);
        // Vertical marker
        ctx.strokeStyle = 'rgba(239,68,68,0.5)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, padT + chartH);
        ctx.stroke();
        ctx.setLineDash([]);
        // Peak dot
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#ef4444';
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Label
        ctx.fillStyle = '#f1f5f9';
        ctx.font = 'bold 15px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${PEAK_VALUE} JPY/kWh`, px, py - 14);
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#ef4444';
        ctx.fillText('25× spike', px, py - 30);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%' }}
    />
  );
}
