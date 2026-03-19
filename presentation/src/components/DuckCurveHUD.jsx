import React, { useEffect, useRef } from 'react';
import { colors } from '../theme';

// Compact duck curve for bottom HUD panel on VPP scenario slides
// Same data as DuckCurveVPP but rendered smaller with a highlight band
// Supports animated expansion on final step with callout labels

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

// Y range expands during expansion to accommodate full VPP data range
const Y_MAX = 68;
const Y_MIN = -10;
const Y_MAX_EXP = 82;   // vppNet peaks at 77
const Y_MIN_EXP = -35;  // vppNet dips to -29

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

// Ease out cubic
function easeOut(t) {
  const c = Math.max(0, Math.min(1, t));
  return 1 - Math.pow(1 - c, 3);
}

export default function DuckCurveHUD({ highlightHour = null, blend = 0, scenario = 'summer', width = 400, height = 130, expanded = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const expandT = useRef(expanded ? 1 : 0);
  const labelT = useRef(0);
  const expandStartTime = useRef(expanded ? -1 : null);

  // Track when expanded changes to start time-based animation
  const prevExpanded = useRef(expanded);
  useEffect(() => {
    if (expanded && !prevExpanded.current) {
      expandStartTime.current = performance.now();
    } else if (!expanded && prevExpanded.current) {
      expandStartTime.current = null;
    }
    prevExpanded.current = expanded;
  }, [expanded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      // Time-based expansion animation (0.8s ease-out)
      if (expanded) {
        if (expandStartTime.current !== null && expandStartTime.current > 0) {
          const elapsed = (performance.now() - expandStartTime.current) / 1000;
          expandT.current = easeOut(elapsed / 0.8);
          // Labels fade in starting at 500ms, over 400ms
          labelT.current = easeOut((elapsed - 0.5) / 0.4);
        } else {
          expandT.current = 1;
          labelT.current = 1;
        }
      } else {
        // Collapse (exponential for smooth reversal)
        expandT.current += (0 - expandT.current) * 0.15;
        if (expandT.current < 0.001) expandT.current = 0;
        labelT.current = 0;
      }

      const ex = expandT.current; // 0 = compact, 1 = expanded
      const lx = labelT.current; // 0 = hidden, 1 = fully visible

      const padLeft = lerp(32, 48, ex);
      const padRight = lerp(10, 20, ex);
      const padTop = lerp(18, 28, ex);
      const padBottom = lerp(22, 32, ex);
      const chartW = width - padLeft - padRight;
      const chartH = height - padTop - padBottom;
      const xScale = chartW / 23;

      // Dynamic Y range — expands during animation to fit full VPP data
      const yMax = lerp(Y_MAX, Y_MAX_EXP, ex);
      const yMin = lerp(Y_MIN, Y_MIN_EXP, ex);
      const yRange = yMax - yMin;
      const yScale = chartH / yRange;

      ctx.clearRect(0, 0, width, height);

      const isWinter = scenario === 'winter';
      const demandData = isWinter ? winterDemand : netDemand;
      const vppData = isWinter ? winterDemand : vppNet;
      const currentNet = demandData.map((d, i) => lerp(d, vppData[i], blend));

      // Grid lines (very subtle)
      ctx.setLineDash([2, 4]);
      ctx.lineWidth = lerp(0.5, 0.8, ex);
      ctx.strokeStyle = colors.textDim + '10';
      for (let gw = 0; gw <= 60; gw += 20) {
        const y = padTop + (yMax - gw) * yScale;
        if (y >= padTop && y <= padTop + chartH) {
          ctx.beginPath();
          ctx.moveTo(padLeft, y);
          ctx.lineTo(width - padRight, y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // Zero line
      const zeroY = padTop + yMax * yScale;
      if (!isWinter && zeroY >= padTop && zeroY <= padTop + chartH) {
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
        const grad = ctx.createLinearGradient(hx - bandW / 2, 0, hx + bandW / 2, 0);
        grad.addColorStop(0, 'rgba(34, 211, 238, 0)');
        grad.addColorStop(0.3, 'rgba(34, 211, 238, 0.12)');
        grad.addColorStop(0.5, 'rgba(34, 211, 238, 0.2)');
        grad.addColorStop(0.7, 'rgba(34, 211, 238, 0.12)');
        grad.addColorStop(1, 'rgba(34, 211, 238, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(hx - bandW, padTop, bandW * 2, chartH);

        ctx.strokeStyle = colors.primary + '80';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(hx, padTop);
        ctx.lineTo(hx, padTop + chartH);
        ctx.stroke();

        const timeFontSize = lerp(8, 11, ex);
        ctx.font = `bold ${timeFontSize}px JetBrains Mono`;
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
          const y = padTop + (yMax - val) * yScale;
          if (i === 0) ctx.lineTo(x, y);
          else {
            const prevX = padLeft + (i - 1) * xScale;
            const prevY = padTop + (yMax - solarGen[i - 1]) * yScale;
            const cpX = (prevX + x) / 2;
            ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
          }
        });
        ctx.lineTo(padLeft + 23 * xScale, zeroY);
        ctx.closePath();
        ctx.fillStyle = `rgba(245, 158, 11, ${lerp(0.08, 0.12, ex)})`;
        ctx.fill();

        // Solar line
        ctx.strokeStyle = colors.solar + '50';
        ctx.lineWidth = lerp(0.8, 1.2, ex);
        smoothLine(ctx, solarGen, xScale, yScale, padLeft, padTop, yMax);
        ctx.stroke();
      }

      // Base / unshifted demand (dim dashed)
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = colors.textDim + '30';
      ctx.lineWidth = lerp(0.8, 1.2, ex);
      smoothLine(ctx, demandData, xScale, yScale, padLeft, padTop, yMax);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current net demand (the duck) with VPP blend
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = lerp(1.8, 2.8, ex);
      ctx.shadowBlur = lerp(6, 12, ex);
      ctx.shadowColor = colors.primary + '60';
      smoothLine(ctx, currentNet, xScale, yScale, padLeft, padTop, yMax);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // VPP battery area (if blending)
      if (blend > 0.05 && !isWinter) {
        ctx.globalAlpha = blend * lerp(0.3, 0.4, ex);
        ctx.beginPath();
        for (let i = 0; i < 24; i++) {
          const x = padLeft + i * xScale;
          const y = padTop + (yMax - netDemand[i]) * yScale;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (let i = 23; i >= 0; i--) {
          const x = padLeft + i * xScale;
          const y = padTop + (yMax - currentNet[i]) * yScale;
          ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fillStyle = colors.success;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Y-axis labels
      const labelSize = Math.round(lerp(7, 11, ex));
      ctx.font = `${labelSize}px JetBrains Mono`;
      ctx.fillStyle = colors.textDim + '50';
      ctx.textAlign = 'right';
      for (let gw = 0; gw <= 60; gw += 20) {
        const y = padTop + (yMax - gw) * yScale;
        if (y >= padTop - 5 && y <= padTop + chartH + 5) {
          ctx.fillText(`${gw}`, padLeft - 4, y + 3);
        }
      }

      // X-axis hours
      ctx.textAlign = 'center';
      const xLabelStep = ex > 0.5 ? 3 : 6;
      for (let h = 0; h < 24; h += xLabelStep) {
        const x = padLeft + h * xScale;
        ctx.fillText(`${h.toString().padStart(2, '0')}h`, x, height - padBottom + lerp(12, 16, ex));
      }

      // Title
      const titleSize = Math.round(lerp(8, 12, ex));
      ctx.font = `bold ${titleSize}px JetBrains Mono`;
      ctx.fillStyle = colors.textDim + '80';
      ctx.textAlign = 'left';
      ctx.fillText(isWinter ? 'DEMAND PROFILE' : 'NET DEMAND (DUCK CURVE)', padLeft, lerp(10, 14, ex));

      // ── Callout labels (fade in after expansion) ──
      if (lx > 0.01 && !isWinter) {
        ctx.globalAlpha = lx;

        // Label 1: Charging belly (hour 12) — "Green energy stored / At negative prices"
        // Positioned BELOW curve and shifted RIGHT so text doesn't overlap the curve
        const chargeHour = 12;
        const chX = padLeft + chargeHour * xScale;
        const chVal = currentNet[chargeHour];
        const chY = padTop + (yMax - chVal) * yScale;
        const l1textX = chX + 55 * lx;
        const l1tickY = chY + 15 * lx;

        // Dot at curve point
        ctx.fillStyle = colors.success;
        ctx.shadowBlur = 6 * lx;
        ctx.shadowColor = colors.success + '80';
        ctx.beginPath();
        ctx.arc(chX, chY, 3.5 * lx, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Leader: diagonal from dot down-right, then horizontal tick
        ctx.strokeStyle = colors.success + 'bb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(chX + 4 * lx, chY + 2 * lx);
        ctx.lineTo(l1textX, l1tickY);
        ctx.lineTo(l1textX + 155 * lx, l1tickY);
        ctx.stroke();

        // Label text (below tick line)
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = colors.success;
        ctx.textAlign = 'left';
        ctx.fillText('Green energy stored', l1textX, l1tickY + 14);
        ctx.font = '10px JetBrains Mono';
        ctx.fillStyle = colors.success + 'aa';
        ctx.fillText('At negative prices', l1textX, l1tickY + 26);

        // Label 2: Discharge peak (hour 18) — "Stored energy sold and released / CO2 reduced"
        const dischHour = 18;
        const dX = padLeft + dischHour * xScale;
        const dVal = currentNet[dischHour];
        const dY = padTop + (yMax - dVal) * yScale;
        // Leader goes DOWN-LEFT from curve point (peak is high on chart)
        const l2endX = dX - 250 * lx;
        const l2endY = dY + 1 * lx;

        // Dot at curve point
        ctx.fillStyle = colors.accent;
        ctx.shadowBlur = 6 * lx;
        ctx.shadowColor = colors.accent + '80';
        ctx.beginPath();
        ctx.arc(dX, dY, 3.5 * lx, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Leader: straight line from dot left to text area
        ctx.strokeStyle = colors.accent + 'bb';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dX - 4 * lx, dY);
        ctx.lineTo(l2endX, l2endY);
        ctx.stroke();

        // Label text (below line)
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'left';
        ctx.fillText('Stored energy sold and released', l2endX, l2endY + 14);
        ctx.font = '10px JetBrains Mono';
        ctx.fillStyle = colors.accent + 'aa';
        ctx.fillText('CO2 reduced', l2endX, l2endY + 28);

        ctx.globalAlpha = 1;
      }

      // Keep animating while transitioning
      const needsAnim = (expanded && (expandT.current < 0.999 || labelT.current < 0.999)) ||
                         (!expanded && expandT.current > 0.001);
      if (needsAnim) {
        animRef.current = requestAnimationFrame(draw);
      }
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, highlightHour, blend, scenario, expanded]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block' }}
    />
  );
}
