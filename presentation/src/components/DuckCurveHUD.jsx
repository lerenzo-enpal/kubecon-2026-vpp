import React, { useEffect, useRef } from 'react';
import { colors } from '../theme';

// Compact duck curve for bottom HUD panel on VPP scenario slides
// Same data as DuckCurveVPP but rendered smaller with a highlight band
// No RAF loop needed — redraws only when props change (useEffect deps)

const baseDemand = [
  28, 26, 25, 24, 24, 25, 28, 35, 42, 45, 46, 47,
  48, 47, 46, 45, 48, 55, 60, 58, 52, 45, 38, 32,
];

const solarGen = [
  0, 0, 0, 0, 0, 1, 5, 14, 28, 40, 49, 54,
  55, 54, 49, 36, 20, 8, 1, 0, 0, 0, 0, 0,
];

const netDemand = baseDemand.map((d, i) => d - solarGen[i]);

const batteryAction = [
  0, 0, 0, 0, 0, 0, 0, -3, -10, -16, -20, -22,
  -22, -20, -16, -10, 4, 14, 18, 16, 10, 5, 0, 0,
];

const vppNet = netDemand.map((d, i) => d + batteryAction[i]);

// Winter: flat high demand, no solar duck shape
const winterDemand = [
  42, 40, 38, 37, 37, 38, 42, 48, 55, 58, 59, 58,
  57, 56, 55, 54, 56, 60, 62, 60, 56, 50, 46, 44,
];

const Y_MAX = 68;
const Y_MIN = -10;

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

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

export default function DuckCurveHUD({ highlightHour = null, blend = 0, scenario = 'summer', width = 400, height = 130 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padLeft = 32;
    const padRight = 10;
    const padTop = 18;
    const padBottom = 22;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const xScale = chartW / 23;
    const yRange = Y_MAX - Y_MIN;
    const yScale = chartH / yRange;

    ctx.clearRect(0, 0, width, height);

      const isWinter = scenario === 'winter';
      const demandData = isWinter ? winterDemand : netDemand;
      const vppData = isWinter ? winterDemand : vppNet;
      const currentNet = demandData.map((d, i) => lerp(d, vppData[i], blend));

      // Grid lines (very subtle)
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = colors.textDim + '10';
      for (let gw = 0; gw <= 60; gw += 20) {
        const y = padTop + (Y_MAX - gw) * yScale;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(width - padRight, y);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Zero line
      const zeroY = padTop + Y_MAX * yScale;
      if (!isWinter) {
        ctx.strokeStyle = colors.textDim + '20';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(padLeft, zeroY);
        ctx.lineTo(width - padRight, zeroY);
        ctx.stroke();
      }

      // Highlight hour band
      if (highlightHour !== null) {
        const hx = padLeft + highlightHour * xScale;
        const bandW = Math.max(xScale, 8);
        // Glow band
        const grad = ctx.createLinearGradient(hx - bandW / 2, 0, hx + bandW / 2, 0);
        grad.addColorStop(0, 'rgba(34, 211, 238, 0)');
        grad.addColorStop(0.3, 'rgba(34, 211, 238, 0.12)');
        grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.2)');
        grad.addColorStop(0.7, 'rgba(34, 211, 238, 0.12)');
        grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(hx - bandW, padTop, bandW * 2, chartH);

        // Center line
        ctx.strokeStyle = colors.primary + '80';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hx, padTop);
        ctx.lineTo(hx, padTop + chartH);
        ctx.stroke();

        // Time label
        ctx.font = 'bold 8px JetBrains Mono';
        ctx.fillStyle = colors.primary;
        ctx.textAlign = 'center';
        ctx.fillText(`${highlightHour.toString().padStart(2, '0')}:00`, hx, padTop - 4);
      }

      // Solar fill (summer only)
      if (!isWinter) {
        ctx.beginPath();
        ctx.moveTo(padLeft, zeroY);
        solarGen.forEach((val, i) => {
          const x = padLeft + i * xScale;
          const y = padTop + (Y_MAX - val) * yScale;
          if (i === 0) ctx.lineTo(x, y);
          else {
            const prevX = padLeft + (i - 1) * xScale;
            const prevY = padTop + (Y_MAX - solarGen[i - 1]) * yScale;
            const cpX = (prevX + x) / 2;
            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
          }
        });
        ctx.lineTo(padLeft + 23 * xScale, zeroY);
        ctx.closePath();
        ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';
        ctx.fill();

        // Solar line
        ctx.strokeStyle = colors.solar + '50';
        ctx.lineWidth = 0.8;
        smoothLine(ctx, solarGen, xScale, yScale, padLeft, padTop, Y_MAX);
        ctx.stroke();
      }

      // Base / unshifted demand (dim dashed)
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = colors.textDim + '30';
      ctx.lineWidth = 0.8;
      smoothLine(ctx, demandData, xScale, yScale, padLeft, padTop, Y_MAX);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current net demand (the duck) with VPP blend
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.8;
      ctx.shadowBlur = 6;
      ctx.shadowColor = colors.primary + '60';
      smoothLine(ctx, currentNet, xScale, yScale, padLeft, padTop, Y_MAX);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // VPP battery area (if blending)
      if (blend > 0.05 && !isWinter) {
        ctx.globalAlpha = blend * 0.3;
        ctx.beginPath();
        for (let i = 0; i < 24; i++) {
          const x = padLeft + i * xScale;
          const y = padTop + (Y_MAX - netDemand[i]) * yScale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = 23; i >= 0; i--) {
          const x = padLeft + i * xScale;
          const y = padTop + (Y_MAX - currentNet[i]) * yScale;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = colors.success;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Y-axis labels (abbreviated)
      ctx.font = '7px JetBrains Mono';
      ctx.fillStyle = colors.textDim + '50';
      ctx.textAlign = 'right';
      for (let gw = 0; gw <= 60; gw += 20) {
        const y = padTop + (Y_MAX - gw) * yScale;
        ctx.fillText(`${gw}`, padLeft - 4, y + 3);
      }

      // X-axis hours (every 6h)
      ctx.textAlign = 'center';
      for (let h = 0; h < 24; h += 6) {
        const x = padLeft + h * xScale;
        ctx.fillText(`${h.toString().padStart(2, '0')}h`, x, height - padBottom + 12);
      }

      // Title
      ctx.font = 'bold 8px JetBrains Mono';
      ctx.fillStyle = colors.textDim + '80';
      ctx.textAlign = 'left';
      ctx.fillText(isWinter ? 'DEMAND PROFILE' : 'NET DEMAND (DUCK CURVE)', padLeft, 10);
  }, [width, height, highlightHour, blend, scenario]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block' }}
    />
  );
}
