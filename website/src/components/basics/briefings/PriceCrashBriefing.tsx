import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

interface DataPoint {
  year: number;
  cost: number;
  label?: string;
  milestone?: string;
  projected?: boolean;
}

const data: DataPoint[] = [
  { year: 2010, cost: 1100 },
  { year: 2013, cost: 600, label: 'Tesla Model S ships' },
  { year: 2016, cost: 300, milestone: 'EVs become competitive' },
  { year: 2020, cost: 140, milestone: 'Home storage makes sense' },
  { year: 2023, cost: 139, label: 'Pack-level (BloombergNEF)' },
  { year: 2026, cost: 100, milestone: 'Cheaper than peaker plants', projected: true },
  { year: 2030, cost: 65, label: '$50-80 projected', projected: true },
];

const annotations = [
  { year: 2014, text: 'Gigafactories' },
  { year: 2018, text: 'Less cobalt' },
  { year: 2021, text: 'Chinese competition' },
];

export default function PriceCrashBriefing() {
  const render = useCallback(
    (ctx: CanvasRenderingContext2D, progress: number, w: number, h: number, colors: CanvasThemeColors) => {
      const font = '"JetBrains Mono", monospace';
      const padL = 70;
      const padR = 40;
      const padT = 55;
      const padB = 70;
      const chartW = w - padL - padR;
      const chartH = h - padT - padB;

      const minYear = 2010;
      const maxYear = 2030;
      const maxCost = 1200;

      function xForYear(year: number) {
        return padL + ((year - minYear) / (maxYear - minYear)) * chartW;
      }
      function yForCost(cost: number) {
        return padT + (1 - cost / maxCost) * chartH;
      }

      // Title
      ctx.fillStyle = colors.text;
      ctx.font = `bold 14px ${font}`;
      ctx.textAlign = 'left';
      ctx.fillText('LITHIUM-ION COST CURVE', padL, 24);

      ctx.fillStyle = colors.textDim;
      ctx.font = `11px ${font}`;
      ctx.fillText('$/kWh pack price', padL, 42);

      // Y axis
      ctx.strokeStyle = colors.surfaceLight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT);
      ctx.lineTo(padL, padT + chartH);
      ctx.stroke();

      // Y labels
      const yTicks = [0, 200, 400, 600, 800, 1000, 1200];
      ctx.textAlign = 'right';
      ctx.fillStyle = colors.textDim;
      ctx.font = `10px ${font}`;
      for (const tick of yTicks) {
        const y = yForCost(tick);
        ctx.fillText(`$${tick}`, padL - 8, y + 4);
        ctx.strokeStyle = `${colors.surfaceLight}44`;
        ctx.beginPath();
        ctx.moveTo(padL, y);
        ctx.lineTo(padL + chartW, y);
        ctx.stroke();
      }

      // X axis
      ctx.strokeStyle = colors.surfaceLight;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padL, padT + chartH);
      ctx.lineTo(padL + chartW, padT + chartH);
      ctx.stroke();

      // X labels
      ctx.textAlign = 'center';
      for (let yr = 2010; yr <= 2030; yr += 5) {
        const x = xForYear(yr);
        ctx.fillStyle = colors.textDim;
        ctx.font = `10px ${font}`;
        ctx.fillText(String(yr), x, padT + chartH + 18);
      }

      // Determine visible year based on progress
      const visibleYear = minYear + (maxYear - minYear) * progress;

      // Draw cost line
      ctx.beginPath();
      let started = false;
      let lastSolidIdx = -1;

      for (let i = 0; i < data.length; i++) {
        if (data[i].year > visibleYear) break;
        const x = xForYear(data[i].year);
        const y = yForCost(data[i].cost);
        if (!started) {
          ctx.moveTo(x, y);
          started = true;
        } else {
          ctx.lineTo(x, y);
        }
        if (!data[i].projected) lastSolidIdx = i;
      }

      // Solid line up to last non-projected point
      if (started) {
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 3;
        ctx.setLineDash([]);
        ctx.stroke();
      }

      // Dashed projected line
      const projectedPoints = data.filter(d => d.projected && d.year <= visibleYear);
      if (projectedPoints.length > 0 && lastSolidIdx >= 0) {
        ctx.beginPath();
        const lastSolid = data[lastSolidIdx];
        ctx.moveTo(xForYear(lastSolid.year), yForCost(lastSolid.cost));
        for (const p of projectedPoints) {
          ctx.lineTo(xForYear(p.year), yForCost(p.cost));
        }
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Data points and labels
      for (const d of data) {
        if (d.year > visibleYear) break;
        const x = xForYear(d.year);
        const y = yForCost(d.cost);

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fillStyle = d.projected ? colors.textDim : colors.primary;
        ctx.fill();

        if (!d.projected) {
          ctx.shadowColor = colors.primary;
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Cost label
        ctx.fillStyle = colors.text;
        ctx.font = `bold 10px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText(`$${d.cost}`, x, y - 12);

        // Milestone badge
        if (d.milestone) {
          const tw = ctx.measureText(d.milestone).width + 12;
          const badgeY = y - 28;
          ctx.fillStyle = `${colors.primary}22`;
          ctx.strokeStyle = `${colors.primary}66`;
          ctx.lineWidth = 1;
          const br = 3;
          const bx = x - tw / 2;
          ctx.beginPath();
          ctx.roundRect(bx, badgeY - 10, tw, 16, br);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = colors.primary;
          ctx.font = `9px ${font}`;
          ctx.fillText(d.milestone, x, badgeY + 2);
        }

        // Regular label
        if (d.label && !d.milestone) {
          ctx.fillStyle = colors.textMuted;
          ctx.font = `9px ${font}`;
          ctx.textAlign = 'center';
          ctx.fillText(d.label, x, y + 18);
        }
      }

      // Annotations for cost drivers
      for (const a of annotations) {
        if (a.year > visibleYear) continue;
        const x = xForYear(a.year);
        const y = padT + chartH + 36;
        ctx.fillStyle = colors.accent;
        ctx.font = `bold 9px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText(a.text, x, y);

        // Arrow up to chart
        ctx.strokeStyle = `${colors.accent}44`;
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 3]);
        ctx.beginPath();
        ctx.moveTo(x, y - 12);
        ctx.lineTo(x, padT + chartH + 4);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Final stat when fully visible
      if (progress > 0.9) {
        const statX = padL + chartW * 0.7;
        const statY = padT + 30;
        ctx.fillStyle = colors.primary;
        ctx.font = `bold 18px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('89% reduction', statX, statY);
        ctx.fillStyle = colors.textMuted;
        ctx.font = `11px ${font}`;
        ctx.fillText('in 13 years', statX, statY + 18);
      }
    },
    [],
  );

  return <ScrollBriefing id="price-crash" height={300} render={render} />;
}
