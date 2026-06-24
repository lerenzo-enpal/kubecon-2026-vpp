import React, { useRef, useEffect } from 'react';
import { SlideContext } from 'spectacle';

const G7_DATA = [
  { country: 'Canada',  value: 179, color: '#94a3b8' },
  { country: 'USA',     value: 106, color: '#94a3b8' },
  { country: 'UK',      value:  75, color: '#94a3b8' },
  { country: 'Germany', value:  35, color: '#94a3b8' },
  { country: 'France',  value:  55, color: '#94a3b8' },
  { country: 'Italy',   value:  25, color: '#94a3b8' },
  { country: 'Japan',   value:  15.3, color: '#ef4444', highlight: true },
];
// Sort descending
const SORTED = [...G7_DATA].sort((a, b) => b.value - a.value);
const MAX_VAL = 200;

export function JapanSelfSufficiencyChart({ height = 340 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const slideCtx = React.useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;

  useEffect(() => {
    if (!isActive) {
      cancelAnimationFrame(rafRef.current);
      return;
    }
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

    const padL = 100, padR = 80, padT = 55, padB = 50;
    const chartW = W - padL - padR;
    const rowH = (H - padT - padB) / SORTED.length;
    const barH = Math.min(rowH * 0.55, 28);
    const DURATION = 1200;
    const STAGGER = 180;
    const startTime = performance.now();

    function draw(now) {
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#64748b';
      ctx.font = '12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Energy Self-Sufficiency Rate (%)', padL + chartW / 2, 30);

      let anyAnimating = false;

      SORTED.forEach((item, i) => {
        const delay = i * STAGGER;
        const elapsed = now - startTime - delay;
        const t = elapsed < 0 ? 0 : Math.min(elapsed / DURATION, 1);
        const eased = t < 1 ? 1 - Math.pow(1 - t, 3) : 1;
        if (t < 1) anyAnimating = true;

        const y = padT + i * rowH + (rowH - barH) / 2;
        const barW = (item.value / MAX_VAL) * chartW * eased;

        // Bar
        if (item.highlight) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ef4444';
        }
        ctx.fillStyle = item.color;
        ctx.beginPath();
        ctx.roundRect(padL, y, barW, barH, 3);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Country label
        ctx.fillStyle = item.highlight ? '#f1f5f9' : '#94a3b8';
        ctx.font = item.highlight ? 'bold 13px JetBrains Mono, monospace' : '13px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(item.country, padL - 10, y + barH / 2 + 4);

        // Value label — appears once bar is mostly drawn
        if (eased > 0.7) {
          const labelX = padL + barW + 8;
          ctx.fillStyle = item.highlight ? '#ef4444' : '#64748b';
          ctx.font = item.highlight ? 'bold 13px JetBrains Mono, monospace' : '12px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${item.value}%`, labelX, y + barH / 2 + 4);
        }

        // "Lowest in G7" annotation for Japan
        if (item.highlight && eased > 0.9) {
          ctx.fillStyle = '#ef4444';
          ctx.font = '11px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText('Lowest in G7', padL + barW + 8, y + barH + 14);
        }
      });

      if (anyAnimating) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, height]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />;
}
