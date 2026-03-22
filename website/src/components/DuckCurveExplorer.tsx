import React, { useEffect, useRef, useState, useCallback } from 'react';

// ── Color tokens (Canvas needs raw hex, not CSS custom properties) ──
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
  solar: '#f59e0b',
};

// ── Year-by-year duck curve data ─────────────────────────────
// Based on real German grid data (Bundesnetzagentur/SMARD, EPEX SPOT).

const YEAR_STATS: Record<number, { negHours: number | string; curtailedTwh: number | null; compensationEurM: number | null; co2Mt: number | null }> = {
  2015: { negHours: 126, curtailedTwh: 4.72, compensationEurM: 478, co2Mt: 2.49 },
  2016: { negHours: 97,  curtailedTwh: 3.74, compensationEurM: 373, co2Mt: 1.96 },
  2017: { negHours: 146, curtailedTwh: 5.52, compensationEurM: 610, co2Mt: 2.68 },
  2018: { negHours: 134, curtailedTwh: 5.40, compensationEurM: 635, co2Mt: 2.53 },
  2019: { negHours: 211, curtailedTwh: 6.48, compensationEurM: 710, co2Mt: 2.60 },
  2020: { negHours: 298, curtailedTwh: 6.15, compensationEurM: 761, co2Mt: 2.25 },
  2021: { negHours: 139, curtailedTwh: 5.82, compensationEurM: 807, co2Mt: 2.44 },
  2022: { negHours: 69,  curtailedTwh: 8.06, compensationEurM: 900, co2Mt: 3.50 },
  2023: { negHours: 301, curtailedTwh: 10.48, compensationEurM: 577, co2Mt: 3.98 },
  2024: { negHours: 457, curtailedTwh: 9.34, compensationEurM: 554, co2Mt: 3.39 },
  2025: { negHours: 575, curtailedTwh: null, compensationEurM: null, co2Mt: null },
  2030: { negHours: '1000+', curtailedTwh: null, compensationEurM: null, co2Mt: null },
};

// German base demand profile (GW, typical summer weekday without solar)
const baseDemand = [
  28, 26, 25, 24, 24, 25, 28, 35, 42, 45, 46, 47,
  48, 47, 46, 45, 48, 55, 60, 58, 52, 45, 38, 32,
];

interface YearEntry {
  year: number;
  solarScale: number;
  label: string;
  desc: string;
  peakPrice: number;
  peakPriceLabel: string;
}

const YEARS: YearEntry[] = [
  { year: 2015, solarScale: 0.37, label: '2015', desc: '39 GW installed -- 126 neg. price hrs',  peakPrice: 41,  peakPriceLabel: '41 EUR/MWh' },
  { year: 2016, solarScale: 0.39, label: '2016', desc: '41 GW installed -- 97 neg. price hrs',   peakPrice: 34,  peakPriceLabel: '34 EUR/MWh' },
  { year: 2017, solarScale: 0.40, label: '2017', desc: '42 GW installed -- 146 neg. price hrs',  peakPrice: 38,  peakPriceLabel: '~38 EUR/MWh' },
  { year: 2018, solarScale: 0.42, label: '2018', desc: '45 GW installed -- 134 neg. price hrs',  peakPrice: 59,  peakPriceLabel: '59 EUR/MWh' },
  { year: 2019, solarScale: 0.46, label: '2019', desc: '49 GW installed -- 211 neg. price hrs',  peakPrice: 50,  peakPriceLabel: '50 EUR/MWh' },
  { year: 2020, solarScale: 0.51, label: '2020', desc: '54 GW installed -- 298 neg. price hrs',  peakPrice: 42,  peakPriceLabel: '42 EUR/MWh' },
  { year: 2021, solarScale: 0.56, label: '2021', desc: '59 GW installed -- 139 neg. price hrs',  peakPrice: 101, peakPriceLabel: '101 EUR/MWh' },
  { year: 2022, solarScale: 0.62, label: '2022', desc: '66 GW installed -- 69 neg. price hrs',   peakPrice: 440, peakPriceLabel: '440 EUR/MWh' },
  { year: 2023, solarScale: 0.77, label: '2023', desc: '82 GW installed -- 301 neg. price hrs',  peakPrice: 128, peakPriceLabel: '128 EUR/MWh' },
  { year: 2024, solarScale: 0.94, label: '2024', desc: '100 GW installed -- 457 neg. price hrs', peakPrice: 124, peakPriceLabel: '124 EUR/MWh' },
  { year: 2025, solarScale: 1.0,  label: '2025', desc: '106 GW installed -- 575 neg. price hrs', peakPrice: 120, peakPriceLabel: '120 EUR/MWh' },
  { year: 2030, solarScale: 2.03, label: '2030 (target)', desc: '215 GW target -- 1000+ neg. price hrs?', peakPrice: 140, peakPriceLabel: '~140 EUR/MWh*' },
];

// Peak solar generation profile (GW, at 100% scale = 2025 with 106 GW installed)
const peakSolar = [
  0, 0, 0, 0, 0, 1, 5, 13, 25, 36, 45, 49,
  50, 49, 45, 33, 18, 7, 1, 0, 0, 0, 0, 0,
];

function getSolarForYear(yearData: YearEntry): number[] {
  return peakSolar.map(v => v * yearData.solarScale);
}

function getNetDemand(solar: number[]): number[] {
  return baseDemand.map((d, i) => d - solar[i]);
}

// Map net demand (GW) to wholesale electricity price (EUR/MWh)
function demandToPrice(gw: number): number {
  let price: number;
  if (gw < -5) price = -50 + (gw + 5) * 10;
  else if (gw < 0) price = gw * 10;
  else if (gw < 25) price = 20 + gw * 1.8;
  else if (gw < 45) price = 65 + (gw - 25) * 2;
  else if (gw < 55) price = 105 + (gw - 45) * 8;
  else price = 185 + (gw - 55) * 20;
  return Math.max(-250, price);
}

const Y_MAX = 68;
const Y_MIN = -60;

function smoothLine(ctx: CanvasRenderingContext2D, data: number[], xScale: number, yScale: number, padLeft: number, padTop: number, yMax: number) {
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

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export default function DuckCurveExplorer({ width = 700, height = 350 }: { width?: number; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const phaseRef = useRef(0);
  const targetPhaseRef = useRef(0);
  const isVisibleRef = useRef(false);
  const cachedBlendRef = useRef<number | null>(null);
  const cachedSolarRef = useRef<number[]>([]);
  const cachedNetDemRef = useRef<number[]>([]);
  const [activeYearIdx, setActiveYearIdx] = useState(0);

  const handleYearClick = useCallback((idx: number) => {
    targetPhaseRef.current = idx;
    setActiveYearIdx(idx);
  }, []);

  // IntersectionObserver for scroll-into-view activation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting && animRef.current === 0) {
          // Restart animation loop when visible
          animRef.current = requestAnimationFrame(draw);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padLeft = 50;
    const padRight = 160;
    const padTop = 70;
    const padBottom = 60;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const xScale = chartW / 23;
    const yRange = Y_MAX - Y_MIN;
    const yScale = chartH / yRange;

    // Make draw available to IntersectionObserver callback
    // by assigning to the outer scope
    const drawFrame = () => {
      const isActive = isVisibleRef.current;

      if (isActive) {
        tRef.current += 0.016;
        phaseRef.current += (targetPhaseRef.current - phaseRef.current) * 0.06;
      }

      const phase = phaseRef.current;
      const yearIdx = Math.floor(Math.min(phase, YEARS.length - 1));
      const yearFrac = phase - yearIdx;
      const t = tRef.current;

      const currentYear = YEARS[yearIdx];
      const nextYear = YEARS[Math.min(yearIdx + 1, YEARS.length - 1)];
      const blendScale = lerp(currentYear.solarScale, nextYear.solarScale, yearFrac);

      if (cachedBlendRef.current !== blendScale) {
        cachedBlendRef.current = blendScale;
        cachedSolarRef.current = peakSolar.map(v => v * blendScale);
        cachedNetDemRef.current = getNetDemand(cachedSolarRef.current);
      }
      const solar = cachedSolarRef.current;
      const netDem = cachedNetDemRef.current;

      ctx.clearRect(0, 0, width, height);

      // Grid lines
      ctx.setLineDash([3, 5]);
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = colors.textDim + '15';
      for (let gw = -50; gw <= 60; gw += 10) {
        const y = padTop + (Y_MAX - gw) * yScale;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(width - padRight, y);
        ctx.stroke();

        ctx.fillStyle = colors.textDim + '50';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(`${gw} GW`, padLeft - 6, y + 3);
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
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('0 GW', padLeft + 3, zeroY - 3);

      // X-axis hours
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'center';
      for (let h = 0; h < 24; h += 3) {
        const x = padLeft + h * xScale;
        ctx.fillText(`${h.toString().padStart(2, '0')}:00`, x, height - padBottom + 14);
      }

      // Day/night shading
      ctx.fillStyle = 'rgba(10, 14, 23, 0.3)';
      ctx.fillRect(padLeft, padTop, 6 * xScale, chartH);
      ctx.fillRect(padLeft + 19 * xScale, padTop, 5 * xScale, chartH);
      ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.fillRect(padLeft + 6 * xScale, padTop, 13 * xScale, chartH);

      // Negative price zone (below zero) - red shading
      const minNet = Math.min(...netDem);
      if (minNet < 0) {
        const negH = Math.min(Math.abs(minNet) * yScale, chartH - (zeroY - padTop));
        ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
        ctx.fillRect(padLeft, zeroY, chartW, negH);
        // Diagonal hazard stripes
        ctx.save();
        ctx.beginPath();
        ctx.rect(padLeft, zeroY, chartW, negH);
        ctx.clip();
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.12)';
        ctx.lineWidth = 1;
        for (let sx = -negH; sx < chartW + negH; sx += 12) {
          ctx.beginPath();
          ctx.moveTo(padLeft + sx, zeroY);
          ctx.lineTo(padLeft + sx + negH, zeroY + negH);
          ctx.stroke();
        }
        ctx.restore();
        // Top border on zero line
        ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(padLeft, zeroY);
        ctx.lineTo(padLeft + chartW, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);
        // "NEGATIVE PRICE ZONE" label
        ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText('NEGATIVE PRICE ZONE', padLeft + chartW - 6, zeroY + negH - 4);
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
      ctx.fillStyle = 'rgba(245, 158, 11, 0.10)';
      ctx.fill();

      // Solar generation line
      ctx.strokeStyle = colors.solar + '70';
      ctx.lineWidth = 1;
      smoothLine(ctx, solar, xScale, yScale, padLeft, padTop, Y_MAX);
      ctx.stroke();

      // Ghost trails of previous years
      for (let yi = 0; yi < yearIdx; yi++) {
        const ghostSolar = getSolarForYear(YEARS[yi]);
        const ghostNet = getNetDemand(ghostSolar);
        const age = yearIdx - yi;
        const alpha = Math.max(0.06, 0.22 - age * 0.02);
        const hex = Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.strokeStyle = colors.primary + hex;
        ctx.lineWidth = 0.8;
        smoothLine(ctx, ghostNet, xScale, yScale, padLeft, padTop, Y_MAX);
        ctx.stroke();

        if (yi % 2 === 0) {
          const ghostMin = Math.min(...ghostNet);
          const bellyH = ghostNet.indexOf(ghostMin);
          const lx = padLeft + bellyH * xScale;
          const ly = padTop + (Y_MAX - ghostMin) * yScale;
          ctx.font = 'bold 12px JetBrains Mono';
          ctx.fillStyle = colors.primary + Math.floor(Math.max(0.15, alpha) * 255).toString(16).padStart(2, '0');
          ctx.textAlign = 'center';
          ctx.fillText(String(YEARS[yi].year), lx, ly + 10);
        }
      }

      // Base demand (gray dashed)
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = colors.textDim + '35';
      ctx.lineWidth = 0.8;
      smoothLine(ctx, baseDemand, xScale, yScale, padLeft, padTop, Y_MAX);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current net demand (the duck) - bright cyan
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 8;
      ctx.shadowColor = colors.primary;
      smoothLine(ctx, netDem, xScale, yScale, padLeft, padTop, Y_MAX);
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Overgeneration / negative pricing annotation
      if (minNet < 5) {
        const bellyHour = netDem.indexOf(minNet);
        const bellyX = padLeft + bellyHour * xScale;
        const bellyY = padTop + (Y_MAX - minNet) * yScale;
        const pulse = Math.sin(t * 3) * 0.15 + 0.85;
        const minPrice = Math.round(demandToPrice(minNet));

        if (minNet < 0) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.9 * pulse})`;
          ctx.font = 'bold 16px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.shadowBlur = 10;
          ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
          ctx.fillText('NEGATIVE PRICES', bellyX, bellyY + 18);
          ctx.shadowBlur = 0;
          ctx.font = 'bold 13px JetBrains Mono';
          ctx.fillStyle = `rgba(239, 68, 68, ${0.85 * pulse})`;
          ctx.fillText(`${minPrice} EUR/MWh`, bellyX, bellyY + 36);
          ctx.font = '12px JetBrains Mono';
          ctx.fillStyle = `rgba(239, 68, 68, ${0.6 * pulse})`;
          ctx.fillText('Paid to NOT generate', bellyX, bellyY + 50);
        } else {
          ctx.fillStyle = `rgba(245, 158, 11, ${0.7 * pulse})`;
          ctx.font = 'bold 13px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('\u2193 Overgeneration risk', bellyX, bellyY + 16);
        }
      }

      // Evening ramp / peaker price spike annotation
      const rampDelta = netDem[19] - netDem[14];
      if (rampDelta > 20) {
        const rampX = padLeft + 17.5 * xScale;
        const rampY1 = padTop + (Y_MAX - netDem[14]) * yScale;
        const rampY2 = padTop + (Y_MAX - netDem[19]) * yScale;
        const pulse = Math.sin(t * 2.5) * 0.15 + 0.85;

        ctx.strokeStyle = `rgba(239, 68, 68, ${0.5 * pulse})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(rampX + 8, rampY1);
        ctx.lineTo(rampX + 8, rampY2);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = `rgba(239, 68, 68, ${0.8 * pulse})`;
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(239, 68, 68, 0.3)';
        ctx.fillText(`${Math.round(rampDelta)} GW ramp`, rampX + 14, (rampY1 + rampY2) / 2 - 6);
        ctx.shadowBlur = 0;

        const { peakPriceLabel } = YEARS[yearIdx];
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = `rgba(239, 68, 68, ${0.85 * pulse})`;
        ctx.fillText(peakPriceLabel, rampX + 14, (rampY1 + rampY2) / 2 + 10);
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = `rgba(239, 68, 68, ${0.55 * pulse})`;
        ctx.fillText('avg 19:00 peak (EPEX SPOT)', rampX + 14, (rampY1 + rampY2) / 2 + 24);
      }

      // Year indicator — right margin
      const displayYear = YEARS[yearIdx];
      const rpLeft = width - padRight + 12;
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 18px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(displayYear.label, rpLeft, padTop + 18);
      ctx.font = '12px Inter';
      ctx.fillStyle = colors.textMuted;
      const descWords = displayYear.desc.split(' -- ');
      ctx.fillText(descWords[0] || '', rpLeft, padTop + 32);
      if (descWords[1]) {
        ctx.fillStyle = colors.accent + 'cc';
        ctx.fillText(descWords[1], rpLeft, padTop + 44);
      }

      // Cumulative stats panel — right margin
      const stats = YEAR_STATS[displayYear.year];
      if (stats) {
        const statBoxH = 40;
        const statGap = 6;
        let sy = padTop + 56;
        const rpWidth = padRight - 20;

        const drawStatBox = (label: string, value: string, unit: string, color: string) => {
          ctx.fillStyle = color + '0a';
          ctx.strokeStyle = color + '25';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.roundRect(rpLeft - 3, sy, rpWidth + 3, statBoxH, 3);
          ctx.fill();
          ctx.stroke();

          ctx.font = 'bold 12px JetBrains Mono';
          ctx.fillStyle = color;
          ctx.textAlign = 'left';
          ctx.fillText(value, rpLeft + 2, sy + 15);

          ctx.font = '12px JetBrains Mono';
          ctx.fillStyle = color + '90';
          ctx.fillText(label, rpLeft + 2, sy + 27);

          if (unit) {
            ctx.font = '12px JetBrains Mono';
            ctx.fillStyle = colors.textDim + '60';
            ctx.fillText(unit, rpLeft + 2, sy + 36);
          }

          sy += statBoxH + statGap;
        };

        const negHoursVal = typeof stats.negHours === 'string' ? stats.negHours : `${stats.negHours}+`;
        drawStatBox('neg. price hours', negHoursVal, 'annual', colors.danger);

        if (stats.curtailedTwh !== null) {
          drawStatBox('curtailed', `${stats.curtailedTwh} TWh`, 'annual', colors.accent);
        } else {
          drawStatBox('curtailed', '12+ TWh est.', 'projected', colors.accent);
        }

        if (stats.compensationEurM !== null) {
          drawStatBox('compensation', `EUR ${stats.compensationEurM}M`, 'annual', colors.primary);
        } else {
          drawStatBox('compensation', 'EUR 600M+ est.', 'projected', colors.primary);
        }

        if (stats.co2Mt !== null) {
          drawStatBox('CO2 avoidable', `${stats.co2Mt} Mt`, 'annual', colors.textMuted);
        } else {
          drawStatBox('CO2 avoidable', '4+ Mt est.', 'projected', colors.textMuted);
        }
      }

      // Title
      ctx.fillStyle = colors.text;
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('THE DUCK CURVE -- GROWING EVERY YEAR', padLeft, padTop - 22);

      // Legend
      const legendY = padTop + chartH + 32;
      ctx.font = '12px Inter';
      const leftItems = [
        { color: colors.primary, label: 'Net Demand (current year)', dash: false },
        { color: colors.primary + '30', label: 'Previous years', dash: false },
      ];
      const rightItems = [
        { color: colors.textDim + '60', label: 'Base Demand', dash: true },
        { color: colors.solar, label: 'Solar Generation', dash: false },
      ];
      leftItems.forEach((item, i) => {
        const lx = padLeft + i * 150;
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 3, 10, item.dash ? 1 : 6);
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'left';
        ctx.fillText(item.label, lx + 14, legendY + 3);
      });
      rightItems.forEach((item, i) => {
        const lx = width - padRight - (rightItems.length - i) * 130;
        ctx.fillStyle = item.color;
        ctx.fillRect(lx, legendY - 3, 10, item.dash ? 1 : 6);
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'left';
        ctx.fillText(item.label, lx + 14, legendY + 3);
      });

      if (isActive) {
        animRef.current = requestAnimationFrame(drawFrame);
      } else {
        animRef.current = 0;
      }
    };

    // Assign to outer scope so IntersectionObserver can restart
    draw = drawFrame;

    drawFrame();
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = 0;
    };
  }, [width, height]);

  // Keep a mutable reference to draw for the IntersectionObserver
  let draw = () => {};

  // Subset of years for buttons (skip 2030 projection from the main row, add it as special)
  const buttonYears = YEARS.map((y, i) => ({ label: y.label, idx: i }));

  return (
    <div style={{ maxWidth: width }}>
      <canvas
        ref={canvasRef}
        style={{
          width,
          height,
          display: 'block',
          borderRadius: 6,
          background: colors.bg,
        }}
      />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          marginTop: 8,
          justifyContent: 'center',
        }}
      >
        {buttonYears.map(({ label, idx }) => (
          <button
            key={idx}
            onClick={() => handleYearClick(idx)}
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 12,
              padding: '12px 8px',
              borderRadius: 4,
              border: `1px solid ${activeYearIdx === idx ? colors.primary : colors.textDim + '40'}`,
              background: activeYearIdx === idx ? colors.primary + '20' : 'transparent',
              color: activeYearIdx === idx ? colors.primary : colors.textMuted,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
