import React, { useEffect, useRef, useContext, useState } from 'react';
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

export default function CurtailmentChart({ width = 900, height = 380 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const [animFrac, setAnimFrac] = useState(0);
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
        ctx.fillStyle = colors.textMuted;
        ctx.textAlign = 'center';
        ctx.fillText(d.year, x + barW / 2, padTop + chartH + 14);

        // EUR compensation (small text below year)
        if (barFrac > 0.5) {
          ctx.font = '9px JetBrains Mono';
          ctx.fillStyle = colors.danger + 'aa';
          ctx.fillText(`${(d.eurM / 1000).toFixed(1)}B`, x + barW / 2, padTop + chartH + 26);
        }
      }

      // CO2 line overlay (secondary axis on right) — drawn smoothly like a pen
      const maxCo2 = 30;
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

      // Push animation progress to React state for bottom stat boxes
      setAnimFrac(1 - Math.pow(1 - Math.min(1, t), 3));

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

  const animTwh = CUM[DATA.length - 1].twh * animFrac;
  const animEurM = CUM[DATA.length - 1].eurM * animFrac;
  const animCo2 = CUM[DATA.length - 1].co2Mt * animFrac;
  const animHomes = DATA[DATA.length - 1].homes * animFrac;

  const stats = [
    { label: 'Total Wasted', value: `${animTwh.toFixed(1)} TWh`, color: colors.accent },
    { label: 'Compensation Paid', value: `EUR ${(animEurM / 1000).toFixed(1)}B`, color: colors.danger },
    { label: 'Avoidable CO2', value: `${animCo2.toFixed(1)} Mt`, color: colors.textMuted },
    { label: '2024 Annual Equiv.', value: animHomes, fmt: 'homes', color: colors.primary },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <canvas ref={canvasRef} style={{ width, height }} />
      <div style={{
        display: 'flex', gap: 10, width: width,
        opacity: animFrac > 0.01 ? 1 : 0,
        transform: `translateY(${(1 - Math.min(1, animFrac * 3)) * 12}px)`,
        transition: 'opacity 0.3s',
      }}>
        {stats.map((s, i) => (
          <div key={i} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            background: s.color + '0a',
            border: `1px solid ${s.color}30`,
            borderRadius: 8,
            padding: '8px 14px',
            boxShadow: `0 0 20px ${s.color}10`,
          }}>
            <div style={{
              fontSize: 15,
              fontFamily: '"JetBrains Mono", monospace',
              color: s.color + 'cc',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              marginBottom: 2,
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 24,
              fontWeight: 800,
              fontFamily: '"JetBrains Mono", monospace',
              color: s.color,
              textShadow: `0 0 16px ${s.color}30`,
              whiteSpace: 'nowrap',
            }}>
              {s.fmt === 'homes'
                ? <>{s.value.toFixed(1)}M homes<span style={{ fontSize: 15, fontWeight: 600 }}>/yr</span></>
                : s.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
