import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';

// Animated canvas showing Japan's LNG import dependency and the Hormuz closure impact
export function HormuzInfographic({ height = 520 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const slideCtx = useContext(SlideContext);
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

    const startTime = performance.now();
    // Phases: 0-600ms route draws, 600-1000ms closed marker, 1000-1600ms stats appear
    const ROUTE_DUR = 800;
    const CLOSE_DUR = 300;
    const STATS_DUR = 600;

    // LNG route: Persian Gulf → Strait of Hormuz → Indian Ocean → Malacca → Japan
    // Mapped to canvas coordinates (W x H)
    const routePoints = (w, h) => [
      [w * 0.10, h * 0.58],  // Persian Gulf / UAE coast
      [w * 0.13, h * 0.62],  // Strait of Hormuz
      [w * 0.20, h * 0.70],  // Gulf of Oman
      [w * 0.30, h * 0.72],  // Arabian Sea
      [w * 0.42, h * 0.68],  // Indian Ocean
      [w * 0.55, h * 0.62],  // Bay of Bengal
      [w * 0.65, h * 0.58],  // Malacca Strait
      [w * 0.75, h * 0.48],  // South China Sea
      [w * 0.88, h * 0.32],  // Philippine Sea
      [w * 0.93, h * 0.22],  // Japan (Yokohama/Tokyo)
    ];

    // Geographic label positions
    const labels = (w, h) => [
      { text: 'PERSIAN GULF', x: w * 0.08, y: h * 0.52, color: '#FFA35F' },
      { text: 'STRAIT OF\nHORMUZ', x: w * 0.13, y: h * 0.44, color: '#ef4444', bold: true },
      { text: 'INDIA', x: w * 0.36, y: h * 0.60, color: '#64748b' },
      { text: 'MALACCA\nSTRAIT', x: w * 0.62, y: h * 0.50, color: '#64748b' },
      { text: 'JAPAN', x: w * 0.91, y: h * 0.16, color: '#22d3ee', bold: true },
    ];

    function draw(now) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, W, H);

      // Background ocean tint
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, 'rgba(3,5,8,0)');
      grad.addColorStop(1, 'rgba(6,10,26,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      const pts = routePoints(W, H);
      const routeT = Math.min(elapsed / ROUTE_DUR, 1);
      const easedRoute = routeT < 1 ? 1 - Math.pow(1 - routeT, 2) : 1;
      const visibleFraction = easedRoute;
      const visibleDist = visibleFraction * (pts.length - 1);
      const visibleCount = Math.floor(visibleDist);
      const partial = visibleDist - visibleCount;

      // Draw route trail (dashed, faint)
      if (visibleCount >= 1) {
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = 'rgba(255,163,95,0.15)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        pts.forEach((p, i) => i === 0 ? ctx.moveTo(p[0], p[1]) : ctx.lineTo(p[0], p[1]));
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw animated route line
      if (visibleCount >= 1) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#FFA35F';
        ctx.strokeStyle = '#FFA35F';
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(pts[0][0], pts[0][1]);
        for (let i = 1; i <= visibleCount && i < pts.length; i++) {
          ctx.lineTo(pts[i][0], pts[i][1]);
        }
        // Partial last segment
        if (visibleCount < pts.length - 1 && partial > 0) {
          const curr = pts[visibleCount], next = pts[visibleCount + 1];
          ctx.lineTo(
            curr[0] + (next[0] - curr[0]) * partial,
            curr[1] + (next[1] - curr[1]) * partial,
          );
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Moving dot at the tip
        let tipX, tipY;
        if (visibleCount < pts.length - 1) {
          const curr = pts[visibleCount], next = pts[visibleCount + 1];
          tipX = curr[0] + (next[0] - curr[0]) * partial;
          tipY = curr[1] + (next[1] - curr[1]) * partial;
        } else {
          [tipX, tipY] = pts[pts.length - 1];
        }
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#FFA35F';
        ctx.fillStyle = '#FFA35F';
        ctx.beginPath();
        ctx.arc(tipX, tipY, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Origin dot (Persian Gulf)
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFA35F';
      ctx.fillStyle = '#FFA35F';
      ctx.beginPath();
      ctx.arc(pts[0][0], pts[0][1], 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Japan destination dot — appears when route reaches it
      if (routeT > 0.95) {
        const alpha = Math.min((routeT - 0.95) / 0.05, 1);
        ctx.shadowBlur = 20;
        ctx.shadowColor = `rgba(34,211,238,${alpha})`;
        ctx.fillStyle = `rgba(34,211,238,${alpha})`;
        ctx.beginPath();
        ctx.arc(pts[pts.length - 1][0], pts[pts.length - 1][1], 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Hormuz CLOSED marker — appears after route passes through it
      const closeT = Math.min((elapsed - ROUTE_DUR * 0.15) / CLOSE_DUR, 1);
      if (closeT > 0) {
        const hx = pts[1][0]; // Hormuz point
        const hy = pts[1][1];
        const alpha = Math.min(closeT, 1);

        // Red X marker
        ctx.strokeStyle = `rgba(239,68,68,${alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowBlur = 14 * alpha;
        ctx.shadowColor = '#ef4444';
        const sz = 10;
        ctx.beginPath();
        ctx.moveTo(hx - sz, hy - sz); ctx.lineTo(hx + sz, hy + sz);
        ctx.moveTo(hx + sz, hy - sz); ctx.lineTo(hx - sz, hy + sz);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // CLOSED label
        ctx.fillStyle = `rgba(239,68,68,${alpha})`;
        ctx.font = `bold 12px JetBrains Mono, monospace`;
        ctx.textAlign = 'center';
        ctx.fillText('CLOSED', hx, hy - 18);
        ctx.font = `10px JetBrains Mono, monospace`;
        ctx.fillStyle = `rgba(255,163,95,${alpha * 0.8})`;
        ctx.fillText('FEB–MAR 2026', hx, hy - 6);
      }

      // Geographic labels
      const lblT = Math.min((elapsed - ROUTE_DUR * 0.3) / 400, 1);
      if (lblT > 0) {
        labels(W, H).forEach(lbl => {
          const alpha = Math.min(lblT, 1);
          const lines = lbl.text.split('\n');
          ctx.fillStyle = lbl.color.replace(')', `,${alpha})`).replace('rgb', 'rgba').replace('rgba(#', 'rgba(').replace('#', '');
          // Handle hex colors with alpha
          ctx.globalAlpha = alpha;
          ctx.fillStyle = lbl.color;
          ctx.font = lbl.bold ? 'bold 11px JetBrains Mono, monospace' : '10px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          lines.forEach((line, i) => {
            ctx.fillText(line, lbl.x, lbl.y + i * 14);
          });
          ctx.globalAlpha = 1;
        });
      }

      const statsT = Math.min((elapsed - ROUTE_DUR - CLOSE_DUR) / STATS_DUR, 1);

      // Bottom stat cards
      if (statsT > 0) {
        const stats = [
          { label: '97%', sub: 'LNG via Hormuz', color: '#FFA35F' },
          { label: '¥2.1T', sub: 'added to import bill', color: '#ef4444' },
          { label: '×2', sub: 'LNG price increase', color: '#FFC217' },
        ];
        const cardW = Math.min(180, (W - 80) / 3);
        const cardH = 64;
        const startX = (W - (stats.length * cardW + (stats.length - 1) * 16)) / 2;
        const cardY = H * 0.78;

        stats.forEach((stat, i) => {
          const delay = i * 0.15;
          const alpha = Math.max(0, Math.min((statsT - delay) / 0.4, 1));
          if (alpha <= 0) return;
          const cx = startX + i * (cardW + 16);

          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#0d1424';
          ctx.strokeStyle = `${stat.color}30`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(cx, cardY, cardW, cardH, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = stat.color;
          ctx.font = 'bold 22px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(stat.label, cx + cardW / 2, cardY + 30);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '11px Inter, sans-serif';
          ctx.fillText(stat.sub, cx + cardW / 2, cardY + 50);
          ctx.globalAlpha = 1;
        });
      }

      if (elapsed < ROUTE_DUR + CLOSE_DUR + STATS_DUR + 200) {
        rafRef.current = requestAnimationFrame(draw);
      }
    }

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, height]);

  return <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} />;
}
