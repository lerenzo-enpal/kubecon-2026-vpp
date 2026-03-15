import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// 24-hour carbon intensity profile (gCO2/kWh) — loosely based on German grid
const CARBON_INTENSITY = [
  320, 310, 300, 290, 285, 290, 310, 340, 360, 280, 200, 150,
  120, 110, 130, 180, 250, 330, 380, 370, 350, 340, 330, 325,
];

// VPP batch workload replicas — inversely correlated with carbon
const BATCH_REPLICAS_UNAWARE = new Array(24).fill(6); // constant without carbon awareness
const BATCH_REPLICAS_AWARE = CARBON_INTENSITY.map(c => {
  // More replicas when carbon is low, fewer when high
  const normalized = 1 - (c - 100) / 300;
  return Math.max(1, Math.round(normalized * 12));
});

export default function CarbonAwareChart({ width = 880, height = 380 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  const slideContext = useContext(SlideContext);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const pad = { top: 48, bottom: 40, left: 55, right: 20 };
    const chartW = width - pad.left - pad.right;
    const chartH = height - pad.top - pad.bottom;

    // Reset animation for replay when slide becomes active
    if (slideContext?.isSlideActive) tRef.current = 0;

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      if (isActive) tRef.current += 0.016;
      const t = isActive ? tRef.current : 3; // show completed chart when inactive
      const animProgress = Math.min(1, t / 3); // 3 sec to fully animate
      const ease = 1 - Math.pow(1 - animProgress, 3);

      ctx.clearRect(0, 0, width, height);

      // ── Title ──
      ctx.fillStyle = colors.success;
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('CARBON-AWARE WORKLOAD SCHEDULING', 10, 18);
      ctx.fillStyle = colors.textDim + '80';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('KEDA + Carbon Aware Operator + ElectricityMaps', 10, 32);

      // Current time indicator
      const currentHour = Math.floor((t * 2) % 24);
      ctx.fillStyle = colors.primary + '80';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`Simulated time: ${currentHour.toString().padStart(2, '0')}:00`, width - 10, 18);

      // ── Grid lines ──
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = colors.textDim + '15';

      // Y-axis left (carbon intensity)
      for (let g = 0; g <= 400; g += 100) {
        const y = pad.top + chartH - (g / 400) * chartH;
        ctx.beginPath();
        ctx.moveTo(pad.left, y);
        ctx.lineTo(width - pad.right, y);
        ctx.stroke();
        ctx.fillStyle = colors.textDim + '50';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(`${g}`, pad.left - 6, y + 3);
      }
      ctx.setLineDash([]);

      // Y-axis labels
      ctx.save();
      ctx.translate(12, pad.top + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = colors.accent + '80';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('gCO₂/kWh', 0, 0);
      ctx.restore();

      ctx.save();
      ctx.translate(width - 6, pad.top + chartH / 2);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = colors.success + '80';
      ctx.font = '9px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('Batch Replicas', 0, 0);
      ctx.restore();

      // X-axis hours
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'center';
      for (let h = 0; h < 24; h += 3) {
        const x = pad.left + (h / 23) * chartW;
        ctx.fillText(`${h.toString().padStart(2, '0')}:00`, x, height - pad.bottom + 16);
      }

      // ── Day/night shading ──
      ctx.fillStyle = `rgba(245, 158, 11, 0.03)`;
      const dayStart = pad.left + (6 / 23) * chartW;
      const dayEnd = pad.left + (18 / 23) * chartW;
      ctx.fillRect(dayStart, pad.top, dayEnd - dayStart, chartH);

      // ── Carbon intensity area fill ──
      ctx.beginPath();
      ctx.moveTo(pad.left, pad.top + chartH);
      CARBON_INTENSITY.forEach((c, h) => {
        const x = pad.left + (h / 23) * chartW;
        const y = pad.top + chartH - (c / 400) * chartH * ease;
        if (h === 0) ctx.lineTo(x, y);
        else {
          const prevX = pad.left + ((h - 1) / 23) * chartW;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, pad.top + chartH - (CARBON_INTENSITY[h - 1] / 400) * chartH * ease, cpX, y, x, y);
        }
      });
      ctx.lineTo(pad.left + chartW, pad.top + chartH);
      ctx.closePath();
      ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
      ctx.fill();

      // Carbon intensity line
      ctx.beginPath();
      ctx.strokeStyle = colors.accent + 'bb';
      ctx.lineWidth = 2;
      CARBON_INTENSITY.forEach((c, h) => {
        const x = pad.left + (h / 23) * chartW;
        const y = pad.top + chartH - (c / 400) * chartH * ease;
        if (h === 0) ctx.moveTo(x, y);
        else {
          const prevX = pad.left + ((h - 1) / 23) * chartW;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, pad.top + chartH - (CARBON_INTENSITY[h - 1] / 400) * chartH * ease, cpX, y, x, y);
        }
      });
      ctx.stroke();

      // ── Batch replicas bars (carbon-aware) ──
      const barW = chartW / 24 - 3;
      BATCH_REPLICAS_AWARE.forEach((r, h) => {
        const x = pad.left + (h / 23) * chartW - barW / 2;
        const maxReplicas = 12;
        const barH = (r / maxReplicas) * chartH * 0.4 * ease;
        const y = pad.top + chartH - barH;

        // Green intensity based on replica count
        const intensity = r / maxReplicas;
        ctx.fillStyle = `rgba(16, 185, 129, ${0.15 + intensity * 0.35})`;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, barH, [3, 3, 0, 0]);
        ctx.fill();

        // Replica count on top
        if (ease > 0.8) {
          ctx.fillStyle = colors.success + Math.floor(((ease - 0.8) / 0.2) * 200).toString(16).padStart(2, '0');
          ctx.font = 'bold 8px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText(r.toString(), x + barW / 2, y - 4);
        }
      });

      // ── Current time indicator ──
      const timeX = pad.left + (currentHour / 23) * chartW;
      ctx.strokeStyle = colors.primary + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(timeX, pad.top);
      ctx.lineTo(timeX, pad.top + chartH);
      ctx.stroke();
      ctx.setLineDash([]);

      // ── Annotations ──
      // "Low carbon = more replicas" at solar peak
      if (ease > 0.9) {
        const alpha = (ease - 0.9) / 0.1;
        const peakX = pad.left + (12 / 23) * chartW;
        const peakY = pad.top + chartH - (CARBON_INTENSITY[12] / 400) * chartH;

        ctx.fillStyle = `rgba(16, 185, 129, ${0.8 * alpha})`;
        ctx.font = 'bold 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText('↑ Solar peak = low carbon', peakX, peakY - 16);
        ctx.fillText('  Batch jobs scale UP', peakX, peakY - 4);

        // Evening annotation
        const eveX = pad.left + (19 / 23) * chartW;
        ctx.fillStyle = `rgba(245, 158, 11, ${0.7 * alpha})`;
        ctx.fillText('↑ Gas peakers = high carbon', eveX, pad.top + 16);
        ctx.fillText('  Batch jobs scale DOWN', eveX, pad.top + 28);
      }

      // ── Legend ──
      ctx.font = '9px Inter';
      ctx.textAlign = 'left';
      const legendY = height - 10;
      [
        { color: colors.accent, label: 'Carbon Intensity (gCO₂/kWh)' },
        { color: colors.success, label: 'Batch Replicas (carbon-aware)' },
      ].forEach((item, i) => {
        const lx = pad.left + i * 220;
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 4, 12, 8);
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(item.label, lx + 16, legendY + 4);
      });

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
    />
  );
}
