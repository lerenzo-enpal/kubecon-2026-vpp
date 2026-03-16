import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// ── Real German curtailment data (Bundesnetzagentur / SMARD) ─────
// See docs/electricity-price-research.md for full sources
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
const CUM = DATA.reduce((acc, d, i) => {
  const prev = i > 0 ? acc[i - 1] : { twh: 0, eurM: 0, co2Mt: 0 };
  acc.push({
    year: d.year,
    twh: prev.twh + d.twh,
    eurM: prev.eurM + d.eurM,
    co2Mt: prev.co2Mt + d.co2Mt,
    homes: d.homes,
    // Annual values for the stacked portion
    annTwh: d.twh,
    annEurM: d.eurM,
    annCo2: d.co2Mt,
  });
  return acc;
}, []);

const METRICS = [
  { key: 'twh', label: 'TWh Wasted', unit: 'TWh', color: colors.accent, max: 70 },
  { key: 'eurM', label: 'EUR Compensation', unit: 'EUR B', color: colors.danger, max: 7000, divisor: 1000 },
  { key: 'co2Mt', label: 'CO2 Avoidable', unit: 'Mt CO2', color: colors.textMuted, max: 30 },
];

function lerp(a, b, t) {
  return a + (b - a) * Math.max(0, Math.min(1, t));
}

export default function CurtailmentChart({ width = 900, height = 400 }) {
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

    const padLeft = 50;
    const padRight = 20;
    const padTop = 40;
    const padBottom = 55;
    const chartW = width - padLeft - padRight;
    const chartH = height - padTop - padBottom;
    const barGroupW = chartW / DATA.length;
    const barW = barGroupW * 0.7;
    const barGap = barGroupW * 0.3;

    let lastTime = performance.now();

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isActive) {
        tRef.current = Math.min(tRef.current + dt * 0.5, DATA.length);
      }
      const t = tRef.current;
      const visibleBars = Math.min(Math.floor(t) + 1, DATA.length);
      const lastBarFrac = t - Math.floor(Math.min(t, DATA.length - 1));

      ctx.clearRect(0, 0, width, height);

      // Title
      ctx.font = 'bold 13px JetBrains Mono';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'left';
      ctx.fillText('CUMULATIVE RENEWABLE ENERGY WASTED -- GERMANY', padLeft, 22);

      // Subtitle
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = colors.textDim;
      ctx.fillText('Bundesnetzagentur / SMARD -- Einspeisemanagement + Redispatch 2.0', padLeft, 34);

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
          ctx.fillStyle = colors.textDim + '50';
          ctx.font = '9px JetBrains Mono';
          ctx.textAlign = 'right';
          ctx.fillText(`${gv}`, padLeft - 6, y + 3);
        }
      }
      ctx.setLineDash([]);

      // Y-axis label
      ctx.save();
      ctx.translate(12, padTop + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '9px JetBrains Mono';
      ctx.fillStyle = colors.accent + '80';
      ctx.textAlign = 'center';
      ctx.fillText('Cumulative TWh', 0, 0);
      ctx.restore();

      // Draw bars - stacked: cumulative fill + annual highlight
      for (let i = 0; i < visibleBars; i++) {
        const d = CUM[i];
        const barFrac = i < visibleBars - 1 ? 1 : Math.min(1, lastBarFrac + 0.3);
        const x = padLeft + i * barGroupW + barGap / 2;

        // Cumulative TWh bar
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

        // Glow on annual portion
        ctx.shadowBlur = 6;
        ctx.shadowColor = colors.accent + '30';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Bar border
        ctx.strokeStyle = colors.accent + '40';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(x, barY, barW, cumH, 3);
        ctx.stroke();

        // Annual TWh label on top of bar
        if (barFrac > 0.5) {
          ctx.font = 'bold 10px JetBrains Mono';
          ctx.fillStyle = colors.accent;
          ctx.textAlign = 'center';
          ctx.fillText(`+${d.annTwh.toFixed(1)}`, x + barW / 2, barY - 4);
        }

        // Cumulative value inside bar (if tall enough)
        if (cumH > 30 && barFrac > 0.5) {
          ctx.font = '9px JetBrains Mono';
          ctx.fillStyle = colors.text + 'aa';
          ctx.textAlign = 'center';
          ctx.fillText(`${d.twh.toFixed(0)} TWh`, x + barW / 2, barY + 14);
        }

        // Year label
        ctx.font = '10px JetBrains Mono';
        ctx.fillStyle = colors.textDim + '80';
        ctx.textAlign = 'center';
        ctx.fillText(d.year, x + barW / 2, padTop + chartH + 14);

        // EUR compensation (small text below year)
        if (barFrac > 0.5) {
          ctx.font = '8px JetBrains Mono';
          ctx.fillStyle = colors.danger + '60';
          ctx.fillText(`${(d.eurM / 1000).toFixed(1)}B`, x + barW / 2, padTop + chartH + 26);
        }
      }

      // CO2 line overlay (secondary axis on right)
      const maxCo2 = 30;
      if (visibleBars > 1) {
        ctx.beginPath();
        ctx.strokeStyle = colors.textMuted;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        for (let i = 0; i < visibleBars; i++) {
          const d = CUM[i];
          const x = padLeft + i * barGroupW + barGap / 2 + barW / 2;
          const y = padTop + chartH - (d.co2Mt / maxCo2) * chartH;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // CO2 dots
        for (let i = 0; i < visibleBars; i++) {
          const d = CUM[i];
          const x = padLeft + i * barGroupW + barGap / 2 + barW / 2;
          const y = padTop + chartH - (d.co2Mt / maxCo2) * chartH;
          ctx.fillStyle = colors.textMuted;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // CO2 label on last visible point
        const lastD = CUM[visibleBars - 1];
        const lx = padLeft + (visibleBars - 1) * barGroupW + barGap / 2 + barW / 2;
        const ly = padTop + chartH - (lastD.co2Mt / maxCo2) * chartH;
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'left';
        ctx.fillText(`${lastD.co2Mt.toFixed(1)} Mt CO2`, lx + 8, ly - 6);
      }

      // Right axis labels (CO2)
      ctx.font = '9px JetBrains Mono';
      ctx.fillStyle = colors.textDim + '50';
      ctx.textAlign = 'left';
      for (let gv = 0; gv <= maxCo2; gv += 10) {
        const y = padTop + chartH - (gv / maxCo2) * chartH;
        ctx.fillText(`${gv} Mt`, width - padRight + 4, y + 3);
      }

      // Right axis label
      ctx.save();
      ctx.translate(width - 4, padTop + chartH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.font = '9px JetBrains Mono';
      ctx.fillStyle = colors.textMuted + '60';
      ctx.textAlign = 'center';
      ctx.fillText('Cumulative CO2', 0, 0);
      ctx.restore();

      // Summary callout boxes at bottom
      const callY = padTop + chartH + 32;
      const totalVisible = CUM[visibleBars - 1];
      const callouts = [
        { label: 'Total Wasted', value: `${totalVisible.twh.toFixed(1)} TWh`, color: colors.accent },
        { label: 'Compensation Paid', value: `EUR ${(totalVisible.eurM / 1000).toFixed(1)}B`, color: colors.danger },
        { label: 'Avoidable CO2', value: `${totalVisible.co2Mt.toFixed(1)} Mt`, color: colors.textMuted },
        { label: `${totalVisible.year} alone`, value: `${CUM[visibleBars - 1].homes.toFixed(1)}M homes`, color: colors.primary },
      ];
      const callW = (chartW - 30) / 4;
      callouts.forEach((c, i) => {
        const cx = padLeft + i * (callW + 10);
        // Background
        ctx.fillStyle = c.color + '08';
        ctx.strokeStyle = c.color + '25';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cx, callY, callW, 28, 4);
        ctx.fill();
        ctx.stroke();

        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = c.color + '80';
        ctx.textAlign = 'left';
        ctx.fillText(c.label, cx + 6, callY + 10);

        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = c.color;
        ctx.fillText(c.value, cx + 6, callY + 22);
      });

      // Legend
      const legY = 22;
      const legX = width - padRight - 200;
      ctx.font = '9px Inter';
      // Bar legend
      ctx.fillStyle = colors.accent + '70';
      ctx.fillRect(legX, legY - 4, 10, 8);
      ctx.fillStyle = colors.textMuted + '80';
      ctx.textAlign = 'left';
      ctx.fillText('Curtailed TWh (cumulative)', legX + 14, legY + 4);
      // Line legend
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(legX, legY + 12);
      ctx.lineTo(legX + 10, legY + 12);
      ctx.stroke();
      ctx.fillStyle = colors.textMuted + '80';
      ctx.fillText('Avoidable CO2 (cumulative)', legX + 14, legY + 16);

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  // Reset animation on slide enter
  useEffect(() => {
    if (slideContext?.isSlideActive) {
      tRef.current = 0;
    }
  }, [slideContext?.isSlideActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
    />
  );
}
