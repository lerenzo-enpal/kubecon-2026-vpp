import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// ── Year-by-year duck curve data ─────────────────────────────
// Solar penetration grows each year, deepening the duck curve belly
// and steepening the evening ramp. Based on CAISO/German patterns.

const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Base demand profile (constant across years)
const baseDemand = [
  28, 26, 25, 24, 24, 25, 28, 35, 42, 45, 46, 47,
  48, 47, 46, 45, 48, 55, 60, 58, 52, 45, 38, 32,
];

// Solar generation by year (scaling factor applied to peak profile)
const YEARS = [
  { year: 2015, solarScale: 0.15, label: '2015', desc: '5% solar penetration' },
  { year: 2018, solarScale: 0.35, label: '2018', desc: '12% solar' },
  { year: 2021, solarScale: 0.55, label: '2021', desc: '22% solar' },
  { year: 2023, solarScale: 0.75, label: '2023', desc: '35% solar' },
  { year: 2025, solarScale: 1.0,  label: '2025', desc: '50% solar' },
  { year: 2030, solarScale: 1.4,  label: '2030 (projected)', desc: '70% solar' },
];

// Peak solar generation profile (at 100% scale = 2025 levels)
const peakSolar = [
  0, 0, 0, 0, 0, 0.5, 3, 8, 16, 24, 30, 34,
  35, 34, 30, 22, 12, 4, 0.5, 0, 0, 0, 0, 0,
];

function getSolarForYear(yearData) {
  return peakSolar.map(v => v * yearData.solarScale);
}

function getNetDemand(solar) {
  return baseDemand.map((d, i) => d - solar[i]);
}

// Price proxy: higher spread = more extreme prices
function getPrice(netDemand) {
  const min = Math.min(...netDemand);
  const max = Math.max(...netDemand);
  return { min, max, spread: max - min };
}

const Y_MAX = 68;
const Y_MIN = -12; // Allow negative values for deep duck curve

function smoothLine(ctx, data, xScale, yScale, padLeft, padTop, yMax) {
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = padLeft + i * xScale;
    const y = padTop + (yMax - val) * yScale;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prevX = padLeft + (i - 1) * xScale;
      const prevY = padTop + (yMax - data[i - 1]) * yScale;
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
  });
}

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export default function DuckCurveChart({ width = 850, height = 360 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const phaseRef = useRef(0); // 0-5 for each year, smoothly animated
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padLeft = 60;
    const padRight = 20;
    const padTop = 45;
    const padBottom = 50;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const xScale = chartW / 23;
    const yRange = Y_MAX - Y_MIN;
    const yScale = chartH / yRange;

    let lastTime = performance.now();

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isActive) {
        tRef.current += dt;
        // Auto-advance through years: ~2 seconds per year, with a pause
        const targetPhase = Math.min(YEARS.length - 1, tRef.current / 2.2);
        phaseRef.current += (targetPhase - phaseRef.current) * 0.04;
      }

      const phase = phaseRef.current;
      const yearIdx = Math.floor(Math.min(phase, YEARS.length - 1));
      const yearFrac = phase - yearIdx;
      const t = tRef.current;

      // Interpolate between current and next year
      const currentYear = YEARS[yearIdx];
      const nextYear = YEARS[Math.min(yearIdx + 1, YEARS.length - 1)];
      const blendScale = lerp(currentYear.solarScale, nextYear.solarScale, yearFrac);

      const solar = peakSolar.map(v => v * blendScale);
      const netDem = getNetDemand(solar);

      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = colors.textDim + '15';
      for (let gw = -10; gw <= 60; gw += 10) {
        const y = padTop + (Y_MAX - gw) * yScale;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(width - padRight, y);
        ctx.stroke();

        ctx.fillStyle = colors.textDim + '50';
        ctx.font = '9px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(`${gw} GW`, padLeft - 8, y + 3);
      }
      ctx.setLineDash([]);

      // Zero line (emphasized)
      const zeroY = padTop + Y_MAX * yScale;
      ctx.strokeStyle = colors.textDim + '30';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, zeroY);
      ctx.lineTo(width - padRight, zeroY);
      ctx.stroke();
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '8px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('0 GW', padLeft + 4, zeroY - 4);

      // X-axis hours
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'center';
      for (let h = 0; h < 24; h += 3) {
        const x = padLeft + h * xScale;
        ctx.fillText(`${h.toString().padStart(2, '0')}:00`, x, height - padBottom + 16);
      }

      // Day/night shading
      ctx.fillStyle = 'rgba(10, 14, 23, 0.3)';
      ctx.fillRect(padLeft, padTop, 6 * xScale, chartH);
      ctx.fillRect(padLeft + 19 * xScale, padTop, 5 * xScale, chartH);
      ctx.fillStyle = `rgba(245, 158, 11, 0.05)`;
      ctx.fillRect(padLeft + 6 * xScale, padTop, 13 * xScale, chartH);

      // Negative price zone (below zero) - red shading
      const minNet = Math.min(...netDem);
      if (minNet < 0) {
        ctx.fillStyle = `rgba(239, 68, 68, 0.08)`;
        const negH = Math.abs(minNet) * yScale;
        ctx.fillRect(padLeft, zeroY, chartW, Math.min(negH, chartH - (zeroY - padTop)));
      }

      // Solar fill (amber area)
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop + Y_MAX * yScale);
      solar.forEach((val, i) => {
        const x = padLeft + i * xScale;
        const y = padTop + (Y_MAX - val) * yScale;
        if (i === 0) ctx.lineTo(x, y);
        else {
          const prevX = padLeft + (i - 1) * xScale;
          const prevY = padTop + (Y_MAX - solar[i - 1]) * yScale;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.lineTo(padLeft + 23 * xScale, padTop + Y_MAX * yScale);
      ctx.closePath();
      ctx.fillStyle = `rgba(245, 158, 11, 0.10)`;
      ctx.fill();

      // Solar generation line
      ctx.strokeStyle = colors.solar + '70';
      ctx.lineWidth = 1.2;
      smoothLine(ctx, solar, xScale, yScale, padLeft, padTop, Y_MAX);
      ctx.stroke();

      // Ghost trails of previous years (faint)
      for (let yi = 0; yi < yearIdx; yi++) {
        const ghostSolar = getSolarForYear(YEARS[yi]);
        const ghostNet = getNetDemand(ghostSolar);
        const age = yearIdx - yi;
        const alpha = Math.max(0.06, 0.2 - age * 0.04);
        ctx.strokeStyle = colors.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        smoothLine(ctx, ghostNet, xScale, yScale, padLeft, padTop, Y_MAX);
        ctx.stroke();
      }

      // Base demand (gray dashed)
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = colors.textDim + '35';
      ctx.lineWidth = 1;
      smoothLine(ctx, baseDemand, xScale, yScale, padLeft, padTop, Y_MAX);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current net demand (the duck) - bright cyan
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = colors.primary;
      smoothLine(ctx, netDem, xScale, yScale, padLeft, padTop, Y_MAX);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Overgeneration / negative pricing annotation
      if (minNet < 5) {
        const bellyHour = netDem.indexOf(minNet);
        const bellyX = padLeft + bellyHour * xScale;
        const bellyY = padTop + (Y_MAX - minNet) * yScale;
        const pulse = Math.sin(t * 3) * 0.3 + 0.7;

        if (minNet < 0) {
          // Negative pricing callout
          ctx.fillStyle = `rgba(239, 68, 68, ${0.8 * pulse})`;
          ctx.font = 'bold 12px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('NEGATIVE PRICES', bellyX, bellyY + 18);
          ctx.font = '10px JetBrains Mono';
          ctx.fillStyle = `rgba(239, 68, 68, ${0.6 * pulse})`;
          ctx.fillText('Paid to NOT generate', bellyX, bellyY + 32);
        } else {
          ctx.fillStyle = `rgba(245, 158, 11, ${0.6 * pulse})`;
          ctx.font = 'bold 11px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('\u2193 Overgeneration', bellyX, bellyY + 18);
        }
      }

      // Evening ramp annotation
      const rampDelta = netDem[19] - netDem[14];
      if (rampDelta > 20) {
        const rampX = padLeft + 17.5 * xScale;
        const rampY1 = padTop + (Y_MAX - netDem[14]) * yScale;
        const rampY2 = padTop + (Y_MAX - netDem[19]) * yScale;
        const pulse = Math.sin(t * 2.5) * 0.2 + 0.8;

        // Vertical bracket
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 * pulse})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(rampX + 12, rampY1);
        ctx.lineTo(rampX + 12, rampY2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ramp label
        ctx.fillStyle = `rgba(239, 68, 68, ${0.7 * pulse})`;
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`${Math.round(rampDelta)} GW ramp`, rampX + 18, (rampY1 + rampY2) / 2 - 6);
        ctx.font = '9px JetBrains Mono';
        ctx.fillText('Price spike zone', rampX + 18, (rampY1 + rampY2) / 2 + 8);
      }

      // Year indicator (prominent)
      const displayYear = YEARS[yearIdx];
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 28px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(displayYear.label, width - padRight - 10, padTop + 30);
      ctx.font = '12px Inter';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(displayYear.desc, width - padRight - 10, padTop + 48);

      // Title
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('THE DUCK CURVE -- GROWING EVERY YEAR', padLeft, 24);

      // Legend
      const legendY = height - 8;
      ctx.font = '10px Inter';
      [
        { color: colors.primary, label: 'Net Demand (current year)', dash: false },
        { color: colors.primary + '30', label: 'Previous years', dash: false },
        { color: colors.textDim + '60', label: 'Base Demand', dash: true },
        { color: colors.solar, label: 'Solar Generation', dash: false },
      ].forEach((item, i) => {
        const lx = padLeft + i * 155;
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 4, 12, item.dash ? 1 : 8);
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'left';
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
