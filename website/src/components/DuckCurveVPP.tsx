// TODO: Share core data/drawing logic with presentation/src/components/DuckCurveVPP.jsx
import { useEffect, useRef, useState, useCallback } from 'react';

// Canvas needs raw hex, not CSS custom properties
const colors = {
  primary: '#22d3ee',
  accent: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  bg: '#0a0e17',
  surface: '#1a2236',
  surfaceLight: '#243049',
  solar: '#f59e0b',
};

// Real German 2025 profiles (GW) -- 106 GW solar installed
// Sources: Bundesnetzagentur/SMARD, EPEX SPOT
const HOURS = Array.from({ length: 24 }, (_, i) => i);

// German base demand profile (GW, typical summer weekday without solar)
const baseDemand = [
  28, 26, 25, 24, 24, 25, 28, 35, 42, 45, 46, 47,
  48, 47, 46, 45, 48, 55, 60, 58, 52, 45, 38, 32,
];

// Solar generation profile (GW, 2025 sunny summer day, ~50 GW peak)
// Record: 50.4 GW on Jun 20, 2025 (Fraunhofer ISE)
const solarGen = [
  0, 0, 0, 0, 0, 1, 5, 13, 25, 36, 45, 49,
  50, 49, 45, 33, 18, 7, 1, 0, 0, 0, 0, 0,
];

// Net demand = base demand - solar (the duck curve)
const netDemand = baseDemand.map((d, i) => d - solarGen[i]);

// With VPP: batteries charge midday (absorb overgeneration), discharge evening (shave peak)
const batteryAction = [
  0, 0, 0, 0, 0, 0, 0, 3, 10, 16, 20, 22,
  22, 20, 16, 10, -4, -14, -18, -16, -10, -5, 0, 0,
];

const vppNetDemand = netDemand.map((d, i) => d + batteryAction[i]);

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

const Y_MAX = 68;

function smoothLine(
  ctx: CanvasRenderingContext2D,
  data: number[],
  xScale: number,
  yScale: number,
  padLeft: number,
  padTop: number,
) {
  ctx.beginPath();
  data.forEach((val, i) => {
    const x = padLeft + i * xScale;
    const y = padTop + (Y_MAX - val) * yScale;
    if (i === 0) ctx.moveTo(x, y);
    else {
      const prevX = padLeft + (i - 1) * xScale;
      const prevY = padTop + (Y_MAX - data[i - 1]) * yScale;
      const cpX = (prevX + x) / 2;
      ctx.bezierCurveTo(cpX, prevY, cpX, y, x, y);
    }
  });
}

interface Props {
  height?: number;
}

export default function DuckCurveVPP({ height = 400 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const blendRef = useRef(0);
  const targetBlendRef = useRef(0);
  const [mode, setMode] = useState<'without' | 'with'>('without');
  const [width, setWidth] = useState(850);

  // ResizeObserver for responsive width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.floor(entry.contentRect.width));
      }
    });
    ro.observe(el);
    setWidth(Math.floor(el.clientWidth));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    targetBlendRef.current = mode === 'with' ? 1 : 0;
  }, [mode]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    blendRef.current += (targetBlendRef.current - blendRef.current) * 0.06;
    const blend = blendRef.current;

    const padLeft = 55;
    const padRight = 20;
    const padTop = 40;
    const padBottom = 50;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const xScale = chartW / 23;
    const yScale = chartH / Y_MAX;

    ctx.clearRect(0, 0, width, height);

    // Grid
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = colors.textDim + '15';
    for (let gw = 0; gw <= 60; gw += 10) {
      const y = padTop + (Y_MAX - gw) * yScale;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      ctx.fillStyle = colors.textDim + '50';
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`${gw} GW`, padLeft - 8, y + 3);
    }
    ctx.setLineDash([]);

    // X-axis hours
    ctx.fillStyle = colors.textDim + '60';
    ctx.font = '12px JetBrains Mono';
    ctx.textAlign = 'center';
    for (let h = 0; h < 24; h += 3) {
      const x = padLeft + h * xScale;
      ctx.fillText(`${h.toString().padStart(2, '0')}:00`, x, height - padBottom + 16);
    }

    // Day/night shading
    ctx.fillStyle = 'rgba(10, 14, 23, 0.3)';
    ctx.fillRect(padLeft, padTop, 6 * xScale, chartH);
    ctx.fillRect(padLeft + 19 * xScale, padTop, 5 * xScale, chartH);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';
    ctx.fillRect(padLeft + 6 * xScale, padTop, 13 * xScale, chartH);

    // Solar fill
    ctx.beginPath();
    ctx.moveTo(padLeft, padTop + Y_MAX * yScale);
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
    ctx.lineTo(padLeft + 23 * xScale, padTop + Y_MAX * yScale);
    ctx.closePath();
    ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
    ctx.fill();

    // Solar generation line
    ctx.strokeStyle = colors.solar + '80';
    ctx.lineWidth = 1.5;
    smoothLine(ctx, solarGen, xScale, yScale, padLeft, padTop);
    ctx.stroke();

    // Battery action visualization
    if (blend > 0.05) {
      // Charging area (midday -- absorbing overgeneration)
      ctx.beginPath();
      let started = false;
      HOURS.forEach((h) => {
        if (batteryAction[h] > 1) {
          const x = padLeft + h * xScale;
          const yNet = padTop + (Y_MAX - netDemand[h]) * yScale;
          if (!started) { ctx.moveTo(x, yNet); started = true; }
          else {
            const prevH = h - 1;
            const prevX = padLeft + prevH * xScale;
            const cpX = (prevX + x) / 2;
            ctx.bezierCurveTo(cpX, padTop + (60 - netDemand[prevH]) * yScale, cpX, yNet, x, yNet);
          }
        }
      });
      for (let h = 18; h >= 0; h--) {
        if (batteryAction[h] > 1) {
          const x = padLeft + h * xScale;
          const yVpp = padTop + (Y_MAX - lerp(netDemand[h], vppNetDemand[h], blend)) * yScale;
          ctx.lineTo(x, yVpp);
        }
      }
      ctx.closePath();
      ctx.fillStyle = `rgba(16, 185, 129, ${0.15 * blend})`;
      ctx.fill();

      // Discharging area (evening -- shaving peak)
      ctx.beginPath();
      started = false;
      HOURS.forEach((h) => {
        if (batteryAction[h] < -1) {
          const x = padLeft + h * xScale;
          const yNet = padTop + (Y_MAX - netDemand[h]) * yScale;
          if (!started) { ctx.moveTo(x, yNet); started = true; }
          else ctx.lineTo(x, yNet);
        }
      });
      for (let h = 23; h >= 0; h--) {
        if (batteryAction[h] < -1) {
          const x = padLeft + h * xScale;
          const yVpp = padTop + (Y_MAX - lerp(netDemand[h], vppNetDemand[h], blend)) * yScale;
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

    // Net demand -- interpolate between modes
    const currentNet = HOURS.map(h => lerp(netDemand[h], vppNetDemand[h], blend));

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 8;
    ctx.shadowColor = colors.primary;
    smoothLine(ctx, currentNet, xScale, yScale, padLeft, padTop);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Title
    ctx.fillStyle = colors.text;
    ctx.font = 'bold 14px JetBrains Mono';
    ctx.textAlign = 'left';
    ctx.fillText(
      blend < 0.5 ? 'NET DEMAND -- THE DUCK CURVE' : 'NET DEMAND -- WITH VPP LOAD SHIFTING',
      padLeft,
      24,
    );

    // Legend
    const legendY = height - 14;
    ctx.font = '12px Inter';
    const items: Array<{ color: string; label: string; dash: boolean }> = [
      { color: colors.primary, label: 'Net Demand', dash: false },
      { color: colors.textDim + '60', label: 'Base Demand', dash: true },
      { color: colors.solar, label: 'Solar Gen', dash: false },
      ...(blend > 0.3 ? [{ color: colors.success, label: 'Battery Action', dash: false }] : []),
    ];
    items.forEach((item, i) => {
      const lx = padLeft + i * 120;
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, legendY - 4, 12, item.dash ? 1 : 8);
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'left';
      ctx.fillText(item.label, lx + 16, legendY + 4);
    });

    // Continue animation if blending
    const diff = Math.abs(targetBlendRef.current - blendRef.current);
    if (diff > 0.001) {
      animRef.current = requestAnimationFrame(draw);
    }
  }, [width, height]);

  // Initial draw and redraw on resize
  useEffect(() => {
    draw();
  }, [draw]);

  // Trigger animation on mode change
  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [mode, draw]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height, display: 'block', background: colors.bg, borderRadius: 6 }}
      />
      <div style={{
        position: 'absolute',
        bottom: 32,
        right: 12,
        display: 'flex',
        gap: 6,
      }}>
        {([
          { key: 'without' as const, label: 'Without Storage', color: colors.accent },
          { key: 'with' as const, label: 'With VPP', color: colors.success },
        ]).map(btn => {
          const isActive = mode === btn.key;
          return (
            <button
              key={btn.key}
              onClick={() => setMode(btn.key)}
              style={{
                background: isActive ? `${btn.color}25` : colors.surface,
                border: `1px solid ${isActive ? btn.color : colors.surfaceLight}`,
                color: isActive ? btn.color : colors.textMuted,
                padding: '12px 14px',
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
