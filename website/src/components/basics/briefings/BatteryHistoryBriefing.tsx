import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

const milestones = [
  { year: 1800, label: "Volta's pile" },
  { year: 1859, label: 'Lead-acid (Plante)' },
  { year: 1899, label: 'Nickel-cadmium' },
  { year: 1976, label: 'Li intercalation' },
  { year: 1980, label: "Goodenough's cathode" },
  { year: 1985, label: "Yoshino's graphite anode" },
  { year: 1991, label: 'Sony commercializes Li-ion' },
  { year: 2008, label: 'Tesla Roadster' },
  { year: 2015, label: 'Tesla Powerwall' },
  { year: 2017, label: 'Hornsdale 100 MW' },
  { year: 2019, label: 'Nobel Prize' },
  { year: 2024, label: 'Grid-scale era' },
];

function drawBattery(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  fillColor: string,
  strokeColor: string,
) {
  const termW = w * 0.25;
  const termH = h * 0.15;
  ctx.fillStyle = strokeColor;
  ctx.fillRect(cx - termW / 2, cy - h / 2 - termH, termW, termH);
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
  ctx.fillStyle = fillColor;
  ctx.fillRect(cx - w / 2 + 2, cy - h / 2 + 2, w - 4, h - 4);
}

export default function BatteryHistoryBriefing() {
  const render = useCallback(
    (ctx: CanvasRenderingContext2D, progress: number, w: number, h: number, colors: CanvasThemeColors) => {
      const padL = 60;
      const padR = 60;
      const lineY = h * 0.45;
      const lineW = w - padL - padR;

      // Timeline line
      ctx.strokeStyle = colors.surfaceLight;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padL, lineY);
      ctx.lineTo(padL + lineW, lineY);
      ctx.stroke();

      // Active portion
      const activeX = padL + lineW * progress;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(padL, lineY);
      ctx.lineTo(activeX, lineY);
      ctx.stroke();

      const total = milestones.length;
      const font = '"JetBrains Mono", monospace';

      for (let i = 0; i < total; i++) {
        const t = i / (total - 1);
        const mx = padL + lineW * t;
        const ms = milestones[i];
        const reached = progress >= t;

        // Dot
        ctx.beginPath();
        ctx.arc(mx, lineY, reached ? 6 : 4, 0, Math.PI * 2);
        ctx.fillStyle = reached ? colors.primary : colors.surfaceLight;
        ctx.fill();

        if (reached) {
          ctx.shadowColor = colors.primary;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.arc(mx, lineY, 6, 0, Math.PI * 2);
          ctx.fillStyle = colors.primary;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Year above
        ctx.fillStyle = reached ? colors.text : colors.textDim;
        ctx.font = `bold 11px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText(String(ms.year === 2024 ? '2024+' : ms.year), mx, lineY - 18);

        // Label below (alternate offset for readability)
        const offsetY = (i % 2 === 0) ? 28 : 48;
        ctx.fillStyle = reached ? colors.textMuted : colors.textDim;
        ctx.font = `10px ${font}`;
        ctx.textAlign = 'center';

        // Wrap long labels
        const words = ms.label.split(' ');
        let line = '';
        let dy = 0;
        for (const word of words) {
          const test = line ? `${line} ${word}` : word;
          if (ctx.measureText(test).width > lineW / total + 10 && line) {
            ctx.fillText(line, mx, lineY + offsetY + dy);
            line = word;
            dy += 13;
          } else {
            line = test;
          }
        }
        if (line) ctx.fillText(line, mx, lineY + offsetY + dy);

        // Small battery icon that gets smaller/sleeker over time
        if (reached) {
          const scale = 1 - (i / total) * 0.5;
          const bw = 14 * scale + 6;
          const bh = 22 * scale + 8;
          drawBattery(ctx, mx, lineY - 48, bw, bh, `${colors.primary}33`, colors.primary);
        }
      }

      // Title
      ctx.fillStyle = colors.text;
      ctx.font = `bold 14px ${font}`;
      ctx.textAlign = 'left';
      ctx.fillText('BATTERY HISTORY', padL, 24);

      ctx.fillStyle = colors.textDim;
      ctx.font = `11px ${font}`;
      ctx.fillText('1800 - present', padL, 42);
    },
    [],
  );

  return <ScrollBriefing id="history" height={280} render={render} />;
}
