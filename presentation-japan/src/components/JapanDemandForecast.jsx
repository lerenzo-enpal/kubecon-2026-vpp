import React, { useRef, useEffect } from 'react';
import { SlideContext } from 'spectacle';

// Data center electricity demand (TWh) 2023-2034
const YEARS  = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
const BASE   = [19, 21, 24, 27, 32, 37, 43, 49, 53, 57, 60, 62];   // central estimate
const LOW    = [19, 21, 23, 26, 30, 35, 40, 46, 50, 55, 57, 57];   // low bound
const HIGH   = [19, 22, 26, 30, 36, 42, 49, 56, 61, 65, 67, 66];  // high bound (OCCTO peak)
const N = YEARS.length;
const MAX_VAL = 80;

export function JapanDemandForecast({ height = 320 }) {
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

    const padL = 60, padR = 80, padT = 55, padB = 55;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const DURATION = 2200;
    const startTime = performance.now();

    function xOf(i) { return padL + (i / (N - 1)) * chartW; }
    function yOf(v) { return padT + chartH - (v / MAX_VAL) * chartH; }

    function draw(now) {
      const t = Math.min((now - startTime) / DURATION, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const visibleCount = Math.max(2, Math.floor(eased * N));
      ctx.clearRect(0, 0, W, H);

      // Grid lines
      ctx.strokeStyle = 'rgba(57,57,216,0.1)';
      ctx.lineWidth = 1;
      [0, 20, 40, 60, 80].forEach(v => {
        const y = yOf(v);
        ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + chartW, y); ctx.stroke();
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
      ctx.fillText('TWh / year', 0, 0);
      ctx.restore();

      // X labels
      ctx.fillStyle = '#64748b';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      YEARS.forEach((y, i) => {
        if (i % 2 === 0) ctx.fillText(y, xOf(i), H - padB + 18);
      });

      // Forecast band (low-high)
      if (visibleCount >= 2) {
        ctx.beginPath();
        ctx.moveTo(xOf(0), yOf(LOW[0]));
        for (let i = 1; i < visibleCount; i++) ctx.lineTo(xOf(i), yOf(LOW[i]));
        for (let i = visibleCount - 1; i >= 0; i--) ctx.lineTo(xOf(i), yOf(HIGH[i]));
        ctx.closePath();
        ctx.fillStyle = 'rgba(57,57,216,0.12)';
        ctx.fill();
      }

      // Base line with glow
      if (visibleCount >= 2) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#3939D8';
        ctx.strokeStyle = '#3939D8';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(xOf(0), yOf(BASE[0]));
        for (let i = 1; i < visibleCount; i++) ctx.lineTo(xOf(i), yOf(BASE[i]));
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Baseline label
      if (eased > 0.1) {
        ctx.fillStyle = '#22d3ee';
        ctx.font = 'bold 14px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText('19 TWh', xOf(0) - 6, yOf(19) - 8);
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText('(2023)', xOf(0) - 6, yOf(19) + 4);
      }

      // 2034 endpoint labels
      if (visibleCount === N) {
        const ex = xOf(N - 1) + 8;
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FFC217';
        ctx.fillText('57–66 TWh', ex, yOf(62));
        ctx.font = '11px JetBrains Mono, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('by 2034', ex, yOf(62) + 14);

        // OCCTO note
        ctx.fillStyle = 'rgba(6,10,26,0.85)';
        ctx.fillRect(padL, padT + 2, 260, 36);
        ctx.strokeStyle = '#FFC217';
        ctx.lineWidth = 1;
        ctx.strokeRect(padL, padT + 2, 260, 36);
        ctx.fillStyle = '#FFC217';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('OCCTO forecast: 14× growth', padL + 8, padT + 18);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText('DC + semiconductor fab demand combined', padL + 8, padT + 32);
      }

      if (t < 1) rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, height]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />;
}
