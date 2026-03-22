import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

export default function InsideTheCellBriefing() {
  const render = useCallback(
    (ctx: CanvasRenderingContext2D, progress: number, w: number, h: number, colors: CanvasThemeColors) => {
      const font = '"JetBrains Mono", monospace';
      const cx = w / 2;
      const cy = h * 0.45;

      // Cell dimensions
      const cellW = Math.min(w * 0.7, 400);
      const cellH = Math.min(h * 0.45, 220);
      const cellL = cx - cellW / 2;
      const cellR = cx + cellW / 2;
      const cellT = cy - cellH / 2;
      const cellB = cy + cellH / 2;

      // Title
      ctx.fillStyle = colors.text;
      ctx.font = `bold 14px ${font}`;
      ctx.textAlign = 'left';
      ctx.fillText('INSIDE THE CELL', 30, 24);

      if (progress < 0.85) {
        // Draw cell outline
        ctx.strokeStyle = colors.surfaceLight;
        ctx.lineWidth = 2;
        ctx.strokeRect(cellL, cellT, cellW, cellH);

        // Anode (left third) - graphite gray
        const anodeW = cellW * 0.25;
        ctx.fillStyle = '#4a5568';
        ctx.fillRect(cellL, cellT, anodeW, cellH);
        ctx.fillStyle = colors.text;
        ctx.font = `bold 11px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('ANODE', cellL + anodeW / 2, cellB + 18);
        ctx.fillStyle = colors.textDim;
        ctx.font = `10px ${font}`;
        ctx.fillText('Graphite', cellL + anodeW / 2, cellB + 32);

        // Cathode (right third) - blue-purple
        const cathodeW = cellW * 0.25;
        const cathodeL = cellR - cathodeW;
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(cathodeL, cellT, cathodeW, cellH);
        ctx.fillStyle = colors.text;
        ctx.font = `bold 11px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('CATHODE', cathodeL + cathodeW / 2, cellB + 18);
        ctx.fillStyle = colors.textDim;
        ctx.font = `10px ${font}`;
        ctx.fillText('LiCoO2', cathodeL + cathodeW / 2, cellB + 32);

        // Electrolyte (center)
        ctx.fillStyle = 'rgba(34, 211, 238, 0.06)';
        ctx.fillRect(cellL + anodeW, cellT, cellW - anodeW - cathodeW, cellH);
        ctx.fillStyle = colors.textDim;
        ctx.font = `10px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('ELECTROLYTE', cx, cy);

        // Separator lines
        ctx.strokeStyle = colors.surfaceLight;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(cellL + anodeW, cellT);
        ctx.lineTo(cellL + anodeW, cellB);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cathodeL, cellT);
        ctx.lineTo(cathodeL, cellB);
        ctx.stroke();
        ctx.setLineDash([]);

        // External circuit (top)
        const circuitY = cellT - 30;
        ctx.strokeStyle = colors.textDim;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cellL + anodeW / 2, cellT);
        ctx.lineTo(cellL + anodeW / 2, circuitY);
        ctx.lineTo(cathodeL + cathodeW / 2, circuitY);
        ctx.lineTo(cathodeL + cathodeW / 2, cellT);
        ctx.stroke();

        // Charging animation (0.15-0.5)
        if (progress >= 0.15 && progress < 0.5) {
          const chargeProg = (progress - 0.15) / 0.35;
          ctx.fillStyle = colors.text;
          ctx.font = `bold 12px ${font}`;
          ctx.textAlign = 'center';
          ctx.fillText('CHARGING', cx, circuitY - 12);

          // Li-ion dots moving from cathode to anode through electrolyte
          const numIons = 8;
          for (let i = 0; i < numIons; i++) {
            const ionProg = (chargeProg * 2 + i / numIons) % 1;
            const ionX = cathodeL - (cathodeL - cellL - anodeW) * ionProg;
            const ionY = cellT + cellH * (0.2 + (i % 3) * 0.3);
            ctx.beginPath();
            ctx.arc(ionX, ionY, 3, 0, Math.PI * 2);
            ctx.fillStyle = colors.primary;
            ctx.fill();
            ctx.shadowColor = colors.primary;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Electron dots in external circuit
          for (let i = 0; i < 5; i++) {
            const eProg = (chargeProg * 2 + i / 5) % 1;
            const totalLen = (cathodeL + cathodeW / 2) - (cellL + anodeW / 2);
            const eX = cathodeL + cathodeW / 2 - totalLen * eProg;
            ctx.beginPath();
            ctx.arc(eX, circuitY, 2, 0, Math.PI * 2);
            ctx.fillStyle = colors.accent;
            ctx.fill();
          }

          // Fill anode layers based on progress
          const fillH = cellH * chargeProg;
          ctx.fillStyle = `${colors.primary}44`;
          ctx.fillRect(cellL + 2, cellB - fillH, anodeW - 4, fillH);
        }

        // Discharging animation (0.5-0.85)
        if (progress >= 0.5 && progress < 0.85) {
          const dischargeProg = (progress - 0.5) / 0.35;
          ctx.fillStyle = colors.text;
          ctx.font = `bold 12px ${font}`;
          ctx.textAlign = 'center';
          ctx.fillText('DISCHARGING', cx, circuitY - 12);

          // Li-ion dots moving from anode to cathode
          const numIons = 8;
          for (let i = 0; i < numIons; i++) {
            const ionProg = (dischargeProg * 2 + i / numIons) % 1;
            const ionX = cellL + anodeW + (cathodeL - cellL - anodeW) * ionProg;
            const ionY = cellT + cellH * (0.2 + (i % 3) * 0.3);
            ctx.beginPath();
            ctx.arc(ionX, ionY, 3, 0, Math.PI * 2);
            ctx.fillStyle = colors.primary;
            ctx.fill();
            ctx.shadowColor = colors.primary;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          }

          // Electrons in circuit (reverse direction)
          for (let i = 0; i < 5; i++) {
            const eProg = (dischargeProg * 2 + i / 5) % 1;
            const totalLen = (cathodeL + cathodeW / 2) - (cellL + anodeW / 2);
            const eX = cellL + anodeW / 2 + totalLen * eProg;
            ctx.beginPath();
            ctx.arc(eX, circuitY, 2, 0, Math.PI * 2);
            ctx.fillStyle = colors.accent;
            ctx.fill();
          }

          // Lightbulb glow
          const bulbX = cx;
          const bulbY = circuitY;
          ctx.beginPath();
          ctx.arc(bulbX, bulbY, 8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(245, 158, 11, ${0.3 + dischargeProg * 0.7})`;
          ctx.fill();
          ctx.shadowColor = colors.accent;
          ctx.shadowBlur = 16 * dischargeProg;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = colors.text;
          ctx.font = `9px ${font}`;
          ctx.fillText('LOAD', bulbX, bulbY + 20);

          // Drain anode fill
          const fillH = cellH * (1 - dischargeProg);
          ctx.fillStyle = `${colors.primary}44`;
          ctx.fillRect(cellL + 2, cellB - fillH, anodeW - 4, fillH);
        }

        // Static state (0.0-0.15) - gap in circuit
        if (progress < 0.15) {
          ctx.fillStyle = colors.textDim;
          ctx.font = `10px ${font}`;
          ctx.textAlign = 'center';
          ctx.fillText('OPEN CIRCUIT', cx, circuitY - 8);
          // Draw gap
          ctx.strokeStyle = colors.bg;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(cx - 10, circuitY);
          ctx.lineTo(cx + 10, circuitY);
          ctx.stroke();
        }
      } else {
        // Progress 0.85-1.0: Ion size comparison
        ctx.fillStyle = colors.text;
        ctx.font = `bold 13px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('WHY LITHIUM?', cx, cy - 80);

        const ions = [
          { symbol: 'Li+', radius: 20, label: '76 pm', desc: 'Lithium' },
          { symbol: 'Na+', radius: 30, label: '102 pm', desc: 'Sodium' },
          { symbol: 'K+', radius: 40, label: '138 pm', desc: 'Potassium' },
        ];

        const spacing = Math.min(w * 0.25, 120);
        const baseX = cx - spacing;

        ions.forEach((ion, i) => {
          const ix = baseX + i * spacing;
          const iy = cy;

          // Circle
          ctx.beginPath();
          ctx.arc(ix, iy, ion.radius, 0, Math.PI * 2);
          ctx.strokeStyle = i === 0 ? colors.primary : colors.textDim;
          ctx.lineWidth = 2;
          ctx.stroke();
          if (i === 0) {
            ctx.fillStyle = `${colors.primary}22`;
            ctx.fill();
          }

          // Symbol
          ctx.fillStyle = i === 0 ? colors.primary : colors.textMuted;
          ctx.font = `bold 14px ${font}`;
          ctx.fillText(ion.symbol, ix, iy + 5);

          // Label
          ctx.fillStyle = colors.textDim;
          ctx.font = `10px ${font}`;
          ctx.fillText(ion.label, ix, iy + ion.radius + 18);
          ctx.fillText(ion.desc, ix, iy + ion.radius + 32);
        });

        // Callout
        ctx.fillStyle = colors.primary;
        ctx.font = `11px ${font}`;
        ctx.textAlign = 'center';
        ctx.fillText('Lightest metal. Highest electrochemical potential.', cx, cy + 90);
      }
    },
    [],
  );

  return <ScrollBriefing id="inside-the-cell" height={320} render={render} />;
}
