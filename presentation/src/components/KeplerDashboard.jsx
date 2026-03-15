import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

const SERVICES = [
  { name: 'device-gateway', baseW: 8.2, color: colors.primary },
  { name: 'aggregation-engine', baseW: 3.1, color: colors.success },
  { name: 'market-bidder', baseW: 1.8, color: colors.accent },
  { name: 'mqtt-broker', baseW: 1.4, color: '#60a5fa' },
  { name: 'telemetry-ingest', baseW: 1.1, color: colors.secondary },
  { name: 'scheduler', baseW: 0.6, color: '#fb923c' },
  { name: 'state-store', baseW: 0.4, color: colors.textMuted },
];

const TOTAL_BASE = SERVICES.reduce((s, svc) => s + svc.baseW, 0);

export default function KeplerDashboard({ width = 880, height = 420 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  const slideContext = useContext(SlideContext);
  useEffect(() => {
    if (slideContext?.isSlideActive) tRef.current = 0;
  }, [slideContext?.isSlideActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      if (isActive) tRef.current += 0.016;
      const t = tRef.current;

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Layout: left = bar chart, right = stats + sparklines
      const chartX = 10;
      const chartY = 50;
      const chartW = width * 0.52;
      const chartH = height - 80;
      const statsX = chartW + 40;

      // ── Header ──
      ctx.fillStyle = colors.success;
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('KEPLER ENERGY MONITOR', 10, 18);
      ctx.fillStyle = colors.textDim + '80';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('kepler_container_joules_total{ namespace="vpp" }', 10, 32);

      // Live total watts (flickering)
      const totalW = TOTAL_BASE + Math.sin(t * 3) * 0.4 + Math.sin(t * 7) * 0.2;
      ctx.fillStyle = colors.success;
      ctx.font = 'bold 22px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors.success;
      ctx.fillText(`${totalW.toFixed(1)} W`, width - 10, 22);
      ctx.shadowBlur = 0;
      ctx.fillStyle = colors.textDim;
      ctx.font = '10px JetBrains Mono';
      ctx.fillText('total platform power', width - 10, 36);

      // ── Horizontal bar chart ──
      const barH = (chartH - 20) / SERVICES.length - 4;
      const maxW = 10;

      SERVICES.forEach((svc, i) => {
        const y = chartY + i * (barH + 4);
        const jitter = Math.sin(t * 5 + i * 2) * 0.15 + Math.sin(t * 11 + i) * 0.08;
        const watts = svc.baseW + jitter;
        const barWidth = (watts / maxW) * (chartW - 140);

        // Label
        ctx.fillStyle = colors.textMuted;
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(svc.name, chartX + 128, y + barH / 2 + 3);

        // Bar background
        ctx.fillStyle = '#111827';
        ctx.fillRect(chartX + 134, y, chartW - 140, barH);

        // Bar
        const grad = ctx.createLinearGradient(chartX + 134, 0, chartX + 134 + barWidth, 0);
        grad.addColorStop(0, svc.color + '40');
        grad.addColorStop(1, svc.color + 'aa');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(chartX + 134, y, barWidth, barH, [0, 4, 4, 0]);
        ctx.fill();

        // Watts value inside bar
        ctx.fillStyle = colors.text;
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`${watts.toFixed(1)}W`, chartX + 134 + barWidth + 6, y + barH / 2 + 3);

        // Tiny sparkline to right of watts
        ctx.strokeStyle = svc.color + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        const sparkX = chartX + 134 + barWidth + 44;
        const sparkW = 40;
        for (let sx = 0; sx < sparkW; sx++) {
          const sv = Math.sin((t - sx * 0.05) * 5 + i * 2) * 3;
          const sy = y + barH / 2 + sv;
          if (sx === 0) ctx.moveTo(sparkX + sx, sy);
          else ctx.lineTo(sparkX + sx, sy);
        }
        ctx.stroke();
      });

      // ── Right panel: Key metrics ──
      const metrics = [
        { label: 'Devices managed', value: '50,000', color: colors.primary },
        { label: 'Watts per device', value: `${(totalW / 50000 * 1000).toFixed(2)} mW`, color: colors.success },
        { label: 'MW managed / W compute', value: `${(100 / totalW * 1000).toFixed(0)}K : 1`, color: colors.accent },
        { label: 'Platform CO₂/hr', value: `${(totalW * 0.4 / 1000 * 60).toFixed(1)}g`, color: colors.textMuted },
      ];

      const metricY = chartY + 20;
      metrics.forEach((m, i) => {
        const y = metricY + i * 72;

        // Box
        ctx.fillStyle = colors.surface;
        ctx.beginPath();
        ctx.roundRect(statsX, y, width - statsX - 10, 58, 8);
        ctx.fill();
        ctx.strokeStyle = colors.surfaceLight;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(statsX, y, width - statsX - 10, 58, 8);
        ctx.stroke();

        // Value
        ctx.fillStyle = m.color;
        ctx.font = 'bold 20px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(m.value, statsX + 12, y + 26);

        // Label
        ctx.fillStyle = colors.textMuted;
        ctx.font = '10px Inter';
        ctx.fillText(m.label, statsX + 12, y + 44);
      });

      // ── Bottom: comparison ──
      const compY = height - 24;
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(`Total VPP platform: ${totalW.toFixed(1)}W   •   60W lightbulb   •   65W laptop   •   The VPP uses less than a lightbulb to manage a power plant`, width / 2, compY);

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
