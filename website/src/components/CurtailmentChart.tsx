// TODO: Share chart data/logic with presentation/src/components/CurtailmentChart.jsx
import { useEffect, useRef, useCallback } from 'react';

// Canvas needs raw hex, not CSS custom properties
const colors = {
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  accent: '#f59e0b',
  danger: '#ef4444',
  primary: '#22d3ee',
};

// Real German curtailment data (Bundesnetzagentur / SMARD)
const DATA = [
  { year: 2015, twh: 4.72, eurM: 478,  co2Mt: 2.49, homes: 1.35 },
  { year: 2016, twh: 3.74, eurM: 373,  co2Mt: 1.96, homes: 1.07 },
  { year: 2017, twh: 5.52, eurM: 610,  co2Mt: 2.68, homes: 1.58 },
  { year: 2018, twh: 5.40, eurM: 635,  co2Mt: 2.53, homes: 1.54 },
  { year: 2019, twh: 6.48, eurM: 710,  co2Mt: 2.60, homes: 1.85 },
  { year: 2020, twh: 6.15, eurM: 761,  co2Mt: 2.25, homes: 1.76 },
  { year: 2021, twh: 5.82, eurM: 807,  co2Mt: 2.44, homes: 1.66 },
  { year: 2022, twh: 8.06, eurM: 900,  co2Mt: 3.50, homes: 2.30 },
  { year: 2023, twh: 10.48, eurM: 577, co2Mt: 3.98, homes: 2.99 },
  { year: 2024, twh: 9.34, eurM: 554,  co2Mt: 3.39, homes: 2.67 },
];

// Build cumulative arrays
const CUM = DATA.reduce((acc: Array<{
  year: number; twh: number; eurM: number; co2Mt: number;
  homes: number; annTwh: number; annEurM: number; annCo2: number;
}>, d, i) => {
  const prev = i > 0 ? acc[i - 1] : { twh: 0, eurM: 0, co2Mt: 0 };
  acc.push({
    year: d.year,
    twh: prev.twh + d.twh,
    eurM: prev.eurM + d.eurM,
    co2Mt: prev.co2Mt + d.co2Mt,
    homes: d.homes,
    annTwh: d.twh,
    annEurM: d.eurM,
    annCo2: d.co2Mt,
  });
  return acc;
}, []);

const STATS = [
  { label: 'Total Wasted', valueFn: (f: number) => `${(CUM[DATA.length-1].twh * f).toFixed(1)} TWh`, color: colors.accent },
  { label: 'Compensation Paid', valueFn: (f: number) => `EUR ${(CUM[DATA.length-1].eurM * f / 1000).toFixed(1)}B`, color: colors.danger },
  { label: 'Avoidable CO2', valueFn: (f: number) => `${(CUM[DATA.length-1].co2Mt * f).toFixed(1)} Mt`, color: colors.textMuted },
  { label: '2024 Annual Equiv.', valueFn: (f: number) => `${(DATA[DATA.length-1].homes * f).toFixed(1)}M homes/yr`, color: colors.primary },
];

interface Props {
  height?: number;
}

export default function CurtailmentChart({ height = 460 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const startedRef = useRef(false);
  const startTimeRef = useRef(0);

  const draw = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const now = performance.now();
    const dt = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;
    startTimeRef.current = now;

    tRef.current = Math.min(tRef.current + dt / 1.5, 1.0);
    const t = tRef.current;

    const chartH_portion = height - 90; // leave room for stat boxes at bottom
    const padLeft = 50;
    const padRight = 20;
    const padTop = 40;
    const padBottom = 65;
    const chartW = width - padLeft - padRight;
    const chartH = chartH_portion - padTop - padBottom;
    const barGroupW = chartW / DATA.length;
    const barW = barGroupW * 0.7;
    const barGap = barGroupW * 0.3;

    ctx.clearRect(0, 0, width, height);

    // Title
    ctx.font = 'bold 14px JetBrains Mono';
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'left';
    ctx.fillText('CUMULATIVE RENEWABLE ENERGY WASTED -- GERMANY', padLeft, 22);

    // Subtitle
    ctx.font = '12px JetBrains Mono';
    ctx.fillStyle = colors.textDim;
    ctx.fillText('Bundesnetzagentur / SMARD -- Einspeisemanagement + Redispatch 2.0', padLeft, 36);

    // Grid lines for TWh (primary axis)
    const maxTwh = 70;
    ctx.setLineDash([3, 5]);
    ctx.lineWidth = 0.5;
    for (let gv = 0; gv <= maxTwh; gv += 10) {
      const y = padTop + chartH - (gv / maxTwh) * chartH;
      ctx.strokeStyle = colors.textDim + '12';
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(width - padRight, y);
      ctx.stroke();

      if (gv % 20 === 0) {
        ctx.fillStyle = colors.textDim + 'aa';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(`${gv}`, padLeft - 6, y + 3);
      }
    }
    ctx.setLineDash([]);

    // Y-axis label
    ctx.save();
    ctx.translate(12, padTop + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px JetBrains Mono';
    ctx.fillStyle = colors.accent;
    ctx.textAlign = 'center';
    ctx.fillText('Cumulative TWh', 0, 0);
    ctx.restore();

    // Draw bars
    for (let i = 0; i < DATA.length; i++) {
      const d = CUM[i];
      const barDelay = i / (DATA.length + 2);
      const barT = Math.max(0, Math.min(1, (t - barDelay) / (1 - barDelay * 0.8)));
      const barFrac = 1 - Math.pow(1 - barT, 3);
      if (barFrac <= 0) continue;
      const x = padLeft + i * barGroupW + barGap / 2;

      const cumH = (d.twh / maxTwh) * chartH * barFrac;
      const prevCumH = i > 0 ? (CUM[i - 1].twh / maxTwh) * chartH * barFrac : 0;
      const barY = padTop + chartH - cumH;

      // Previous cumulative portion (dimmer)
      if (prevCumH > 0) {
        ctx.fillStyle = colors.accent + '25';
        ctx.beginPath();
        ctx.roundRect(x, padTop + chartH - prevCumH, barW, prevCumH, [0, 0, 2, 2]);
        ctx.fill();
      }

      // Annual addition (brighter)
      const annH = cumH - prevCumH;
      ctx.fillStyle = colors.accent + '70';
      ctx.beginPath();
      ctx.roundRect(x, barY, barW, annH, [3, 3, 0, 0]);
      ctx.fill();

      // Bar border
      ctx.strokeStyle = colors.accent + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(x, barY, barW, cumH, 3);
      ctx.stroke();

      // Year label
      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText(String(d.year), x + barW / 2, padTop + chartH + 15);

      // EUR compensation (small text below year)
      if (barFrac > 0.5) {
        ctx.font = '12px JetBrains Mono';
        ctx.fillStyle = '#f87171';
        ctx.fillText(`${(d.eurM / 1000).toFixed(1)}B`, x + barW / 2, padTop + chartH + 28);
      }
    }

    // Batched shadow glow pass
    ctx.shadowBlur = 6;
    ctx.shadowColor = colors.accent + '30';
    ctx.fillStyle = colors.accent + '70';
    for (let i = 0; i < DATA.length; i++) {
      const barDelay = i / (DATA.length + 2);
      const barT = Math.max(0, Math.min(1, (t - barDelay) / (1 - barDelay * 0.8)));
      const barFrac = 1 - Math.pow(1 - barT, 3);
      if (barFrac <= 0) continue;
      const x = padLeft + i * barGroupW + barGap / 2;
      const d = CUM[i];
      const cumH = (d.twh / maxTwh) * chartH * barFrac;
      const prevCumH = i > 0 ? (CUM[i - 1].twh / maxTwh) * chartH * barFrac : 0;
      const annH = cumH - prevCumH;
      const barY = padTop + chartH - cumH;
      ctx.beginPath();
      ctx.roundRect(x, barY, barW, annH, [3, 3, 0, 0]);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Bar text labels
    for (let i = 0; i < DATA.length; i++) {
      const d = CUM[i];
      const barDelay = i / (DATA.length + 2);
      const barT = Math.max(0, Math.min(1, (t - barDelay) / (1 - barDelay * 0.8)));
      const barFrac = 1 - Math.pow(1 - barT, 3);
      if (barFrac <= 0 || barFrac <= 0.5) continue;
      const x = padLeft + i * barGroupW + barGap / 2;
      const cumH = (d.twh / maxTwh) * chartH * barFrac;
      const barY = padTop + chartH - cumH;

      ctx.font = 'bold 12px JetBrains Mono';
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText(`+${d.annTwh.toFixed(1)}`, x + barW / 2, barY - 4);

      if (cumH > 30) {
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = '#000000';
        ctx.fillText(`${d.twh.toFixed(0)} TWh`, x + barW / 2, barY + 14);
      }
    }

    // CO2 line overlay
    const maxCo2 = 24;
    const lineProgress = Math.max(0, t * (DATA.length - 1));

    if (lineProgress > 0.01) {
      const getXY = (i: number) => ({
        x: padLeft + i * barGroupW + barGap / 2 + barW / 2,
        y: padTop + chartH - (CUM[i].co2Mt / maxCo2) * chartH,
      });

      ctx.beginPath();
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2;
      ctx.setLineDash([]);

      const fullSegs = Math.floor(lineProgress);
      const segFrac = lineProgress - fullSegs;

      const p0 = getXY(0);
      ctx.moveTo(p0.x, p0.y);
      for (let i = 1; i <= fullSegs && i < DATA.length; i++) {
        const p = getXY(i);
        ctx.lineTo(p.x, p.y);
      }

      if (fullSegs < DATA.length - 1 && segFrac > 0) {
        const from = getXY(fullSegs);
        const to = getXY(fullSegs + 1);
        ctx.lineTo(
          from.x + (to.x - from.x) * segFrac,
          from.y + (to.y - from.y) * segFrac,
        );
      }
      ctx.stroke();

      // CO2 dots
      for (let i = 0; i < DATA.length; i++) {
        if (i > lineProgress + 0.1) break;
        const p = getXY(i);
        const dotAlpha = Math.min(1, (lineProgress - i + 0.5) * 2);
        if (dotAlpha <= 0) continue;
        ctx.fillStyle = colors.textMuted;
        ctx.globalAlpha = dotAlpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // CO2 label on last point
      if (lineProgress > DATA.length - 2) {
        const lastD = CUM[DATA.length - 1];
        const lx = padLeft + (DATA.length - 1) * barGroupW + barGap / 2 + barW / 2;
        const ly = padTop + chartH - (lastD.co2Mt / maxCo2) * chartH;
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'left';
        ctx.globalAlpha = Math.min(1, lineProgress - (DATA.length - 2));
        ctx.fillText(`${lastD.co2Mt.toFixed(1)} Mt CO2`, lx + 8, ly - 6);
        ctx.globalAlpha = 1;
      }
    }

    // Right axis labels (CO2)
    ctx.font = '12px JetBrains Mono';
    ctx.fillStyle = colors.textDim + 'aa';
    ctx.textAlign = 'left';
    for (let gv = 0; gv <= maxCo2; gv += 10) {
      const y = padTop + chartH - (gv / maxCo2) * chartH;
      ctx.fillText(`${gv} Mt`, width - padRight + 4, y + 3);
    }

    // Right axis label
    ctx.save();
    ctx.translate(width - 4, padTop + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.font = '12px JetBrains Mono';
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('Cumulative CO2', 0, 0);
    ctx.restore();

    // Legend
    const legY = 22;
    const legX = width - padRight - 200;
    ctx.font = '12px JetBrains Mono';
    ctx.fillStyle = colors.accent + 'cc';
    ctx.fillRect(legX, legY - 4, 10, 8);
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'left';
    ctx.fillText('Curtailed TWh (cumulative)', legX + 14, legY + 4);
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(legX, legY + 14);
    ctx.lineTo(legX + 10, legY + 14);
    ctx.stroke();
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Avoidable CO2 (cumulative)', legX + 14, legY + 18);

    // Stat boxes at the bottom
    const statsY = chartH_portion + 5;
    const statsH = 70;
    const statBoxW = (width - 30) / STATS.length;

    // Only draw stats when chart animation is near-complete
    const statsFrac = Math.max(0, (t - 0.6) / 0.4);
    if (statsFrac > 0) {
      const numEased = statsFrac < 0.5 ? 2 * statsFrac * statsFrac : 1 - Math.pow(-2 * statsFrac + 2, 2) / 2;
      for (let i = 0; i < STATS.length; i++) {
        const s = STATS[i];
        const sx = 10 + i * (statBoxW + 10);

        // Background
        ctx.globalAlpha = statsFrac * 0.04;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.roundRect(sx, statsY, statBoxW - 10, statsH, 8);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Border
        ctx.strokeStyle = s.color + '30';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(sx, statsY, statBoxW - 10, statsH, 8);
        ctx.stroke();

        // Label
        ctx.globalAlpha = Math.min(1, statsFrac * 1.5) * 0.8;
        ctx.font = '13px JetBrains Mono';
        ctx.fillStyle = s.color + 'cc';
        ctx.textAlign = 'left';
        ctx.fillText(s.label, sx + 12, statsY + 22);
        ctx.globalAlpha = 1;

        // Value
        if (numEased > 0.01) {
          const valText = s.valueFn(numEased);
          ctx.globalAlpha = Math.min(1, statsFrac * 2.5);
          ctx.font = 'bold 20px JetBrains Mono';
          ctx.fillStyle = s.color;
          ctx.textAlign = 'left';
          ctx.shadowColor = s.color + '30';
          ctx.shadowBlur = 16;
          ctx.fillText(valText, sx + 12, statsY + 50);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }
    }

    if (t < 1) {
      animRef.current = requestAnimationFrame(() => draw(width, height));
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          tRef.current = 0;
          startTimeRef.current = performance.now();
          const rect = container.getBoundingClientRect();
          draw(rect.width, height);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(container);

    const resizeObserver = new ResizeObserver((entries) => {
      if (!startedRef.current) return;
      const rect = entries[0].contentRect;
      const savedT = tRef.current;
      cancelAnimationFrame(animRef.current);
      tRef.current = savedT;
      draw(rect.width, height);
    });
    resizeObserver.observe(container);

    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(animRef.current);
    };
  }, [height, draw]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
      />
    </div>
  );
}
