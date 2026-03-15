import React, { useEffect, useRef, useState, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// Simplified 24-hour profiles (GW, loosely based on California/Germany patterns)
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// Base demand profile (without solar)
const baseDemand = [
  28, 26, 25, 24, 24, 25, 28, 35, 42, 45, 46, 47,
  48, 47, 46, 45, 48, 55, 60, 58, 52, 45, 38, 32,
];

// Solar generation profile
const solarGen = [
  0, 0, 0, 0, 0, 0.5, 3, 8, 16, 24, 30, 34,
  35, 34, 30, 22, 12, 4, 0.5, 0, 0, 0, 0, 0,
];

// Net demand = base demand - solar (the duck curve)
const netDemand = baseDemand.map((d, i) => d - solarGen[i]);

// With VPP: batteries charge midday (increase net demand), discharge evening (decrease net demand)
const batteryAction = [
  0, 0, 0, 0, 0, 0, 0, -2, -8, -14, -18, -20,
  -20, -18, -14, -8, 2, 10, 14, 12, 8, 4, 0, 0,
];

const vppNetDemand = netDemand.map((d, i) => d + batteryAction[i]);

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothLine(ctx, data, xScale, yScale, padLeft, padTop) {
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = padLeft + i * xScale;
    const y = padTop + (60 - val) * yScale;
    if (i === 0) ctx.moveTo(x, y);
    else {
      // Simple bezier smoothing
      const prevX = padLeft + (i - 1) * xScale;
      const prevY = padTop + (60 - data[i - 1]) * yScale;
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
  });
}

export default function DuckCurveChart({ width = 850, height = 360 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const slideContext = useContext(SlideContext);
  const [mode, setMode] = useState('without'); // 'without' | 'with'
  const blendRef = useRef(0); // 0 = without, 1 = with VPP
  const targetBlendRef = useRef(0);

  useEffect(() => {
    targetBlendRef.current = mode === 'with' ? 1 : 0;
  }, [mode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padLeft = 55;
    const padRight = 20;
    const padTop = 40;
    const padBottom = 45;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const xScale = chartW / 23;
    const yScale = chartH / 60; // 0 to 60 GW

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      if (isActive) {
        tRef.current += 0.02;
        blendRef.current += (targetBlendRef.current - blendRef.current) * 0.04;
      }
      const t = tRef.current;
      const blend = blendRef.current;

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = colors.textDim + '15';
      for (let gw = 0; gw <= 60; gw += 10) {
        const y = padTop + (60 - gw) * yScale;
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

      // X-axis hours
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'center';
      for (let h = 0; h < 24; h += 3) {
        const x = padLeft + h * xScale;
        ctx.fillText(`${h.toString().padStart(2, '0')}:00`, x, height - padBottom + 16);
      }

      // Day/night shading
      // Night: 0-6, 19-24
      ctx.fillStyle = 'rgba(10, 14, 23, 0.3)';
      ctx.fillRect(padLeft, padTop, 6 * xScale, chartH);
      ctx.fillRect(padLeft + 19 * xScale, padTop, 5 * xScale, chartH);
      // Day: subtle warm
      ctx.fillStyle = `rgba(245, 158, 11, 0.03)`;
      ctx.fillRect(padLeft + 6 * xScale, padTop, 13 * xScale, chartH);

      // Solar fill (amber area under solar curve)
      ctx.beginPath();
      ctx.moveTo(padLeft, padTop + 60 * yScale);
      solarGen.forEach((val, i) => {
        const x = padLeft + i * xScale;
        const y = padTop + (60 - val) * yScale;
        if (i === 0) ctx.lineTo(x, y);
        else {
          const prevX = padLeft + (i - 1) * xScale;
          const prevY = padTop + (60 - solarGen[i - 1]) * yScale;
          const cpX = (prevX + x) / 2;
          ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
        }
      });
      ctx.lineTo(padLeft + 23 * xScale, padTop + 60 * yScale);
      ctx.closePath();
      ctx.fillStyle = `rgba(245, 158, 11, 0.12)`;
      ctx.fill();

      // Solar generation line
      ctx.strokeStyle = colors.solar + '80';
      ctx.lineWidth = 1.5;
      smoothLine(ctx, solarGen, xScale, yScale, padLeft, padTop);
      ctx.stroke();

      // Battery action visualization (when blending toward VPP)
      if (blend > 0.05) {
        // Charging zone (midday) — green fill below netDemand
        ctx.beginPath();
        let started = false;
        HOURS.forEach((h) => {
          if (batteryAction[h] < -1) {
            const x = padLeft + h * xScale;
            const yNet = padTop + (60 - netDemand[h]) * yScale;
            const yVpp = padTop + (60 - lerp(netDemand[h], vppNetDemand[h], blend)) * yScale;
            if (!started) { ctx.moveTo(x, yNet); started = true; }
            else {
              const prevH = h - 1;
              const prevX = padLeft + prevH * xScale;
              const cpX = (prevX + x) / 2;
              ctx.bezierCurveTo(cpX, padTop + (60 - netDemand[prevH]) * yScale, cpX, yNet, x, yNet);
            }
          }
        });
        // Close back along VPP line
        for (let h = 18; h >= 0; h--) {
          if (batteryAction[h] < -1) {
            const x = padLeft + h * xScale;
            const yVpp = padTop + (60 - lerp(netDemand[h], vppNetDemand[h], blend)) * yScale;
            ctx.lineTo(x, yVpp);
          }
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(16, 185, 129, ${0.15 * blend})`;
        ctx.fill();

        // Discharge zone (evening)
        ctx.beginPath();
        started = false;
        HOURS.forEach((h) => {
          if (batteryAction[h] > 1) {
            const x = padLeft + h * xScale;
            const yNet = padTop + (60 - netDemand[h]) * yScale;
            if (!started) { ctx.moveTo(x, yNet); started = true; }
            else ctx.lineTo(x, yNet);
          }
        });
        for (let h = 23; h >= 0; h--) {
          if (batteryAction[h] > 1) {
            const x = padLeft + h * xScale;
            const yVpp = padTop + (60 - lerp(netDemand[h], vppNetDemand[h], blend)) * yScale;
            ctx.lineTo(x, yVpp);
          }
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(16, 185, 129, ${0.1 * blend})`;
        ctx.fill();
      }

      // Base demand (gray dashed)
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = colors.textDim + '40';
      ctx.lineWidth = 1;
      smoothLine(ctx, baseDemand, xScale, yScale, padLeft, padTop);
      ctx.stroke();
      ctx.setLineDash([]);

      // Net demand (the duck) — interpolate between modes
      const currentNet = HOURS.map(h => lerp(netDemand[h], vppNetDemand[h], blend));

      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 8;
      ctx.shadowColor = colors.primary;
      smoothLine(ctx, currentNet, xScale, yScale, padLeft, padTop);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Overgeneration zone highlight (net demand < 0 or very low)
      if (blend < 0.5) {
        const minNet = Math.min(...currentNet);
        if (minNet < 18) {
          // Find the belly of the duck
          const bellyHour = currentNet.indexOf(minNet);
          const bellyX = padLeft + bellyHour * xScale;
          const bellyY = padTop + (60 - minNet) * yScale;

          // Pulsing arrow pointing to the belly
          const pulse = Math.sin(t * 3) * 0.3 + 0.7;
          ctx.fillStyle = `rgba(245, 158, 11, ${0.6 * pulse * (1 - blend * 2)})`;
          ctx.font = 'bold 11px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('\u2193 Overgeneration', bellyX, bellyY + 20);
        }

        // Steep ramp annotation
        const rampStart = padLeft + 16 * xScale;
        const rampEnd = padLeft + 19 * xScale;
        const rampYStart = padTop + (60 - currentNet[16]) * yScale;
        const rampYEnd = padTop + (60 - currentNet[19]) * yScale;
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 * (1 - blend * 2)})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(rampEnd + 10, rampYStart);
        ctx.lineTo(rampEnd + 10, rampYEnd);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = `rgba(239, 68, 68, ${0.6 * (1 - blend * 2)})`;
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('Steep ramp', rampEnd + 15, (rampYStart + rampYEnd) / 2 + 3);
      }

      // Title
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 13px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(blend < 0.5 ? 'NET DEMAND — THE DUCK CURVE' : 'NET DEMAND — WITH VPP LOAD SHIFTING', padLeft, 24);

      // Legend
      const legendY = height - 10;
      ctx.font = '10px Inter';
      [
        { color: colors.primary, label: 'Net Demand', dash: false },
        { color: colors.textDim + '60', label: 'Base Demand', dash: true },
        { color: colors.solar, label: 'Solar Gen', dash: false },
        ...(blend > 0.3 ? [{ color: colors.success, label: 'Battery Action', dash: false }] : []),
      ].forEach((item, i) => {
        const lx = padLeft + i * 120;
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
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width, height }}
      />
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6 }}>
        {[
          { key: 'without', label: 'Without Storage', color: colors.accent },
          { key: 'with', label: 'With VPP', color: colors.success },
        ].map(btn => {
          const isActive = mode === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => setMode(btn.key)}
              style={{
                background: isActive ? `${btn.color}25` : colors.surface,
                border: `1px solid ${isActive ? btn.color : colors.surfaceLight}`,
                color: isActive ? btn.color : colors.textMuted,
                padding: '5px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: '"JetBrains Mono"',
                fontWeight: isActive ? 600 : 400,
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
