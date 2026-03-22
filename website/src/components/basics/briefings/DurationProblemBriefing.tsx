import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

interface TechBand {
  label: string;
  color: string;
  xStart: number; // 0-1 on log scale
  xEnd: number;
  yCenter: number; // 0-1 (0 = cheap, 1 = expensive)
  yHeight: number;
}

const TECH_BANDS: TechBand[] = [
  { label: 'Flywheels', color: 'rgba(34, 211, 238, 0.35)', xStart: 0.0, xEnd: 0.18, yCenter: 0.25, yHeight: 0.12 },
  { label: 'Flow Batteries', color: 'rgba(168, 85, 247, 0.35)', xStart: 0.42, xEnd: 0.62, yCenter: 0.35, yHeight: 0.14 },
  { label: 'Compressed Air', color: 'rgba(245, 158, 11, 0.35)', xStart: 0.52, xEnd: 0.72, yCenter: 0.28, yHeight: 0.12 },
  { label: 'Pumped Hydro', color: 'rgba(59, 130, 246, 0.35)', xStart: 0.48, xEnd: 0.72, yCenter: 0.18, yHeight: 0.1 },
  { label: 'Gravity', color: 'rgba(34, 197, 94, 0.35)', xStart: 0.42, xEnd: 0.62, yCenter: 0.45, yHeight: 0.12 },
  { label: 'Thermal', color: 'rgba(251, 146, 60, 0.35)', xStart: 0.55, xEnd: 0.78, yCenter: 0.32, yHeight: 0.14 },
  { label: 'Hydrogen', color: 'rgba(163, 230, 53, 0.35)', xStart: 0.75, xEnd: 1.0, yCenter: 0.55, yHeight: 0.18 },
];

const DURATION_LABELS = [
  { label: 'seconds', x: 0.05 },
  { label: 'minutes', x: 0.18 },
  { label: 'hours', x: 0.4 },
  { label: 'days', x: 0.65 },
  { label: 'weeks', x: 0.82 },
  { label: 'seasons', x: 0.95 },
];

function render(
  ctx: CanvasRenderingContext2D,
  progress: number,
  w: number,
  h: number,
  colors: CanvasThemeColors
) {
  const monoFont = '"JetBrains Mono", monospace';
  const padLeft = 70;
  const padRight = 20;
  const padTop = 40;
  const padBottom = 50;
  const chartW = w - padLeft - padRight;
  const chartH = h - padTop - padBottom;

  // Axes
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padLeft, padTop);
  ctx.lineTo(padLeft, padTop + chartH);
  ctx.lineTo(padLeft + chartW, padTop + chartH);
  ctx.stroke();

  // Y-axis labels
  ctx.font = `11px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'right';
  ctx.fillText('expensive', padLeft - 8, padTop + 14);
  ctx.fillText('cheaper', padLeft - 8, padTop + chartH - 4);

  // Y-axis title
  ctx.save();
  ctx.translate(14, padTop + chartH / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.font = `10px ${monoFont}`;
  ctx.fillStyle = colors.textDim;
  ctx.fillText('Cost per kWh (relative)', 0, 0);
  ctx.restore();

  // X-axis labels
  ctx.textAlign = 'center';
  ctx.font = `10px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  for (const dl of DURATION_LABELS) {
    const x = padLeft + dl.x * chartW;
    ctx.fillText(dl.label, x, padTop + chartH + 18);

    // Tick marks
    ctx.strokeStyle = colors.textDim;
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(x, padTop + chartH);
    ctx.lineTo(x, padTop + chartH + 5);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // X-axis title
  ctx.font = `10px ${monoFont}`;
  ctx.fillStyle = colors.textDim;
  ctx.textAlign = 'center';
  ctx.fillText('Discharge Duration (log scale)', padLeft + chartW / 2, padTop + chartH + 38);

  // Li-ion curve (appears progress 0.0-0.3)
  const liIonAlpha = Math.min(1, progress / 0.15);
  if (liIonAlpha > 0) {
    ctx.globalAlpha = liIonAlpha;

    // Li-ion sweet spot band
    ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
    const ssLeft = padLeft + 0.25 * chartW;
    const ssRight = padLeft + 0.48 * chartW;
    ctx.fillRect(ssLeft, padTop + chartH * 0.1, ssRight - ssLeft, chartH * 0.8);

    // Li-ion curve: cheap short, expensive long
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = padLeft + t * chartW;
      // Exponential cost increase after ~0.4 on x-axis
      const costNorm = 0.85 - 0.6 * Math.exp(-((t - 0.15) * 4)) + 0.7 * Math.pow(Math.max(0, t - 0.35), 2) * 8;
      const y = padTop + Math.max(0.05, Math.min(0.95, costNorm)) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Li-ion label
    ctx.font = `bold 12px ${monoFont}`;
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.textAlign = 'left';
    ctx.fillText('Li-ion', padLeft + 0.28 * chartW, padTop + chartH * 0.25);

    ctx.font = `10px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('sweet spot', padLeft + 0.28 * chartW, padTop + chartH * 0.25 + 14);

    ctx.globalAlpha = 1;
  }

  // Other technology bands (appear progress 0.3-1.0)
  if (progress > 0.3) {
    const bandProgress = (progress - 0.3) / 0.7;
    const bandsToShow = Math.min(TECH_BANDS.length, Math.floor(bandProgress * (TECH_BANDS.length + 1)));
    const partialBand = bandProgress * (TECH_BANDS.length + 1) - bandsToShow;

    for (let i = 0; i < Math.min(bandsToShow + 1, TECH_BANDS.length); i++) {
      const band = TECH_BANDS[i];
      const alpha = i < bandsToShow ? 1 : Math.min(1, partialBand * 2);
      ctx.globalAlpha = alpha;

      const bx = padLeft + band.xStart * chartW;
      const bw = (band.xEnd - band.xStart) * chartW;
      const by = padTop + (band.yCenter - band.yHeight / 2) * chartH;
      const bh = band.yHeight * chartH;

      // Band fill
      ctx.fillStyle = band.color;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 6);
      ctx.fill();

      // Band border
      ctx.strokeStyle = band.color.replace('0.35', '0.6');
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(bx, by, bw, bh, 6);
      ctx.stroke();

      // Label
      ctx.font = `bold 10px ${monoFont}`;
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.fillText(band.label, bx + bw / 2, by + bh / 2 + 4);
    }
    ctx.globalAlpha = 1;
  }

  // Summary text at full progress
  if (progress > 0.85) {
    const alpha = Math.min(1, (progress - 0.85) / 0.15);
    ctx.globalAlpha = alpha;
    ctx.font = `bold 12px ${monoFont}`;
    ctx.fillStyle = colors.primary;
    ctx.textAlign = 'center';
    ctx.fillText('No single technology covers the full spectrum.', w / 2, padTop + chartH + 38);
    ctx.globalAlpha = 1;
  }
}

export default function DurationProblemBriefing() {
  const renderCb = useCallback(render, []);

  return (
    <ScrollBriefing id="duration-problem" height={300} render={renderCb}>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          The 4-Hour Wall
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Lithium-ion batteries are excellent for up to 4 hours of storage.
          Beyond that, costs skyrocket. The cathode materials, thermal
          management, and degradation make longer durations impractical.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Duration is the Key
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Different grid challenges need different storage durations. Frequency
          regulation needs seconds. Peak shaving needs hours. Seasonal balancing
          needs months. One chemistry cannot optimize for all of these.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          The Portfolio Approach
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          The future grid will deploy a portfolio of storage technologies, each
          optimized for its duration sweet spot. Li-ion for short bursts,
          pumped hydro for daily cycling, hydrogen for seasonal reserves.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Why This Matters
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Renewable energy is intermittent. Wind and solar produce power when
          conditions allow, not when demand peaks. Long-duration storage is
          the missing piece that makes 100% renewables viable.
        </p>
      </div>
    </ScrollBriefing>
  );
}
