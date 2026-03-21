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

export default function CurtailmentChart({ width = 900, height = 380, hideStats = false, statsVisible = 4 }) {
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
    const padBottom = 40;
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
        // Smooth wave: t goes from 0 to 1 over ~1.5 seconds (2x speed)
        tRef.current = Math.min(tRef.current + dt / 1.5, 1.0);
      }
      const t = tRef.current;

      ctx.clearRect(0, 0, width, height);

      // Title
      ctx.font = 'bold 16px JetBrains Mono';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'left';
      ctx.fillText('CUMULATIVE RENEWABLE ENERGY WASTED -- GERMANY', padLeft, 22);

      // Subtitle
      ctx.font = '11px JetBrains Mono';
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
      ctx.fillStyle = colors.accent;
      ctx.textAlign = 'center';
      ctx.fillText('Cumulative TWh', 0, 0);
      ctx.restore();

      // Draw bars - wave-based smooth animation
      for (let i = 0; i < DATA.length; i++) {
        const d = CUM[i];
        // Wave: each bar starts a bit after the previous, creating a sweep
        const barDelay = i / (DATA.length + 2);
        const barT = Math.max(0, Math.min(1, (t - barDelay) / (1 - barDelay * 0.8)));
        // Ease out cubic for smooth deceleration
        const barFrac = 1 - Math.pow(1 - barT, 3);
        if (barFrac <= 0) continue;
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

        // Glow on annual portion (shadow applied in batch pass below)

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
        ctx.fillText(d.year, x + barW / 2, padTop + chartH + 15);

        // EUR compensation (small text below year)
        if (barFrac > 0.5) {
          ctx.font = '11px JetBrains Mono';
          ctx.fillStyle = '#f87171';
          ctx.fillText(`${(d.eurM / 1000).toFixed(1)}B`, x + barW / 2, padTop + chartH + 28);
        }
      }

      // Batched shadow glow pass — one shadowBlur state change instead of N
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

      // Bar text labels — drawn after glow pass so they aren't covered
      for (let i = 0; i < DATA.length; i++) {
        const d = CUM[i];
        const barDelay = i / (DATA.length + 2);
        const barT = Math.max(0, Math.min(1, (t - barDelay) / (1 - barDelay * 0.8)));
        const barFrac = 1 - Math.pow(1 - barT, 3);
        if (barFrac <= 0 || barFrac <= 0.5) continue;
        const x = padLeft + i * barGroupW + barGap / 2;
        const cumH = (d.twh / maxTwh) * chartH * barFrac;
        const barY = padTop + chartH - cumH;

        // Annual TWh label on top of bar
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillStyle = colors.accent;
        ctx.textAlign = 'center';
        ctx.fillText(`+${d.annTwh.toFixed(1)}`, x + barW / 2, barY - 4);

        // Cumulative value inside bar (if tall enough)
        if (cumH > 30) {
          ctx.font = 'bold 11px JetBrains Mono';
          ctx.fillStyle = '#000000';
          ctx.fillText(`${d.twh.toFixed(0)} TWh`, x + barW / 2, barY + 14);
        }
      }

      // CO2 line overlay (secondary axis on right) — drawn smoothly like a pen
      const maxCo2 = 24;
      // lineProgress: 0 = nothing drawn, DATA.length-1 = fully drawn
      const lineProgress = Math.max(0, t * (DATA.length - 1));

      if (lineProgress > 0.01) {
        const getXY = (i) => ({
          x: padLeft + i * barGroupW + barGap / 2 + barW / 2,
          y: padTop + chartH - (CUM[i].co2Mt / maxCo2) * chartH,
        });

        ctx.beginPath();
        ctx.strokeStyle = colors.textMuted;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);

        const fullSegs = Math.floor(lineProgress);
        const segFrac = lineProgress - fullSegs;

        // Draw complete segments
        const p0 = getXY(0);
        ctx.moveTo(p0.x, p0.y);
        for (let i = 1; i <= fullSegs && i < DATA.length; i++) {
          const p = getXY(i);
          ctx.lineTo(p.x, p.y);
        }

        // Draw partial leading segment
        if (fullSegs < DATA.length - 1 && segFrac > 0) {
          const from = getXY(fullSegs);
          const to = getXY(fullSegs + 1);
          ctx.lineTo(
            from.x + (to.x - from.x) * segFrac,
            from.y + (to.y - from.y) * segFrac,
          );
        }
        ctx.stroke();

        // CO2 dots — appear as line passes through them
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

        // CO2 label on last point — fade in near end
        if (lineProgress > DATA.length - 2) {
          const lastD = CUM[DATA.length - 1];
          const lx = padLeft + (DATA.length - 1) * barGroupW + barGap / 2 + barW / 2;
          const ly = padTop + chartH - (lastD.co2Mt / maxCo2) * chartH;
          ctx.font = 'bold 11px JetBrains Mono';
          ctx.fillStyle = colors.textMuted;
          ctx.textAlign = 'left';
          ctx.globalAlpha = Math.min(1, lineProgress - (DATA.length - 2));
          ctx.fillText(`${lastD.co2Mt.toFixed(1)} Mt CO2`, lx + 8, ly - 6);
          ctx.globalAlpha = 1;
        }
      }

      // Right axis labels (CO2)
      ctx.font = '9px JetBrains Mono';
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
      ctx.font = '9px JetBrains Mono';
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'center';
      ctx.fillText('Cumulative CO2', 0, 0);
      ctx.restore();

      // Legend
      const legY = 22;
      const legX = width - padRight - 200;
      ctx.font = '10px JetBrains Mono';
      // Bar legend
      ctx.fillStyle = colors.accent + 'cc';
      ctx.fillRect(legX, legY - 4, 10, 8);
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'left';
      ctx.fillText('Curtailed TWh (cumulative)', legX + 14, legY + 4);
      // Line legend
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(legX, legY + 14);
      ctx.lineTo(legX + 10, legY + 14);
      ctx.stroke();
      ctx.fillStyle = colors.textMuted;
      ctx.fillText('Avoidable CO2 (cumulative)', legX + 14, legY + 18);

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

  // ── Stat boxes canvas (HUD trace animation) ──
  const statsCanvasRef = useRef(null);
  const statsAnimRef = useRef(null);
  const boxStartTimes = useRef({}); // per-box start times
  const prevStatsVisible = useRef(0);
  const statsVisibleRef = useRef(statsVisible);

  const STATS = [
    { label: 'Total Wasted', valueFn: (f) => `${(CUM[DATA.length-1].twh * f).toFixed(1)} TWh`, color: colors.accent },
    { label: 'Compensation Paid', valueFn: (f) => `EUR ${(CUM[DATA.length-1].eurM * f / 1000).toFixed(1)}B`, color: colors.danger },
    { label: 'Avoidable CO2', valueFn: (f) => `${(CUM[DATA.length-1].co2Mt * f).toFixed(1)} Mt`, color: colors.textMuted },
    { label: '2024 Annual Equiv.', valueFn: (f) => `${(DATA[DATA.length-1].homes * f).toFixed(1)}M homes/yr`, color: colors.primary },
  ];

  const statsH = 80;
  const statsGap = 10;

  // When statsVisible increases, record start time for new boxes
  useEffect(() => {
    statsVisibleRef.current = statsVisible;
    const prev = prevStatsVisible.current;
    if (statsVisible > prev) {
      const now = performance.now();
      for (let i = prev; i < statsVisible; i++) {
        if (!boxStartTimes.current[i]) boxStartTimes.current[i] = now;
      }
    }
    prevStatsVisible.current = statsVisible;
  }, [statsVisible]);

  useEffect(() => {
    const canvas = statsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = statsH * 2;
    ctx.scale(2, 2);

    const boxW = (width - statsGap * (STATS.length - 1)) / STATS.length;
    const boxH = statsH - 8;
    const r = 8;

    // Timing
    const traceDur = 0.5;   // seconds to trace one box border

    const drawStats = (now) => {
      const isActive = slideContext?.isSlideActive;
      if (!isActive) { statsAnimRef.current = requestAnimationFrame(drawStats); return; }

      ctx.clearRect(0, 0, width, statsH);

      let anyAnimating = false;

      for (let i = 0; i < Math.min(STATS.length, statsVisibleRef.current); i++) {
        const s = STATS[i];
        const x = i * (boxW + statsGap);
        const y = 4;

        // Each box animates from its own start time
        const startTime = boxStartTimes.current[i];
        if (!startTime) { anyAnimating = true; continue; }
        const boxElapsed = Math.max(0, (now - startTime) / 1000);

        const traceFrac = Math.min(1, boxElapsed / traceDur);
        const contentFrac = Math.min(1, Math.max(0, (boxElapsed - traceDur * 0.5) / 0.4));
        const numFrac = Math.min(1, Math.max(0, (boxElapsed - traceDur * 0.6) / 0.6));
        const numEased = numFrac < 0.5 ? 2 * numFrac * numFrac : 1 - Math.pow(-2 * numFrac + 2, 2) / 2;

        if (traceFrac < 1 || numFrac < 1) anyAnimating = true;

        // Perimeter length for dash calculation
        const arcLen = (Math.PI / 2) * r;
        const perim = 4 * arcLen + 2 * (boxW - 2 * r) + 2 * (boxH - 2 * r);

        // Background fill — fade in with trace
        ctx.globalAlpha = traceFrac * 0.04;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.roundRect(x, y, boxW, boxH, r);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Border trace — simple stroke-dasharray sweep from top-left, no dots
        // Multiple tracers: 3 lines at different offsets along the perimeter
        const tracerOffsets = [0, 0.33, 0.66]; // evenly spaced around perimeter
        for (const offset of tracerOffsets) {
          const headFrac = traceFrac;
          if (headFrac <= 0) continue;
          const drawLen = headFrac * perim;
          // Offset the dash start so each tracer begins at a different point
          const dashOffset = -(offset * perim);

          ctx.strokeStyle = s.color + '30';
          ctx.lineWidth = 1;
          ctx.setLineDash([drawLen, perim - drawLen]);
          ctx.lineDashOffset = dashOffset;
          ctx.beginPath();
          ctx.roundRect(x, y, boxW, boxH, r);
          ctx.stroke();
        }
        ctx.setLineDash([]);

        // Label
        if (contentFrac > 0) {
          ctx.globalAlpha = contentFrac * 0.8;
          ctx.font = '15px "JetBrains Mono"';
          ctx.fillStyle = s.color + 'cc';
          ctx.textAlign = 'left';
          ctx.fillText(s.label, x + 14, y + 24);
          ctx.globalAlpha = 1;
        }

        // Value (counting up)
        if (numEased > 0.01) {
          const valText = s.valueFn(numEased);
          ctx.globalAlpha = Math.min(1, numFrac * 2.5);
          ctx.font = 'bold 24px "JetBrains Mono"';
          ctx.fillStyle = s.color;
          ctx.textAlign = 'left';
          ctx.shadowColor = s.color + '30';
          ctx.shadowBlur = 16;
          ctx.fillText(valText, x + 14, y + 52);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }

      // Always keep running to pick up newly revealed boxes
      statsAnimRef.current = requestAnimationFrame(drawStats);
    };

    statsAnimRef.current = requestAnimationFrame(drawStats);
    return () => cancelAnimationFrame(statsAnimRef.current);
  }, [width, slideContext?.isSlideActive]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
      <canvas ref={canvasRef} style={{ width, height, marginTop: -50 }} />
      {!hideStats && <canvas ref={statsCanvasRef} style={{ width, height: statsH, marginTop: 8 }} />}
    </div>
  );
}
