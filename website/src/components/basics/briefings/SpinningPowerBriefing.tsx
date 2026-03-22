import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

function render(
  ctx: CanvasRenderingContext2D,
  progress: number,
  w: number,
  h: number,
  colors: CanvasThemeColors
) {
  const now = Date.now();
  const monoFont = '"JetBrains Mono", monospace';
  const cx = w / 2;
  const cy = h / 2;

  if (progress < 0.3) {
    // Spinning magnet inside a coil
    const sub = progress / 0.3;
    const coilCx = cx;
    const coilCy = cy - 10;
    const coilR = 70;

    // Coil (outer circle)
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(coilCx, coilCy, coilR, 0, Math.PI * 2);
    ctx.stroke();

    // Coil wire segments (inner ticks)
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 2;
    const segments = 16;
    for (let i = 0; i < segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(
        coilCx + Math.cos(a) * (coilR - 6),
        coilCy + Math.sin(a) * (coilR - 6)
      );
      ctx.lineTo(
        coilCx + Math.cos(a) * (coilR + 6),
        coilCy + Math.sin(a) * (coilR + 6)
      );
      ctx.stroke();
    }

    // Spinning bar magnet
    const angle = (now / 800) % (Math.PI * 2);
    const magLen = 40;
    const magW = 14;

    ctx.save();
    ctx.translate(coilCx, coilCy);
    ctx.rotate(angle);

    // N pole (red)
    ctx.fillStyle = colors.danger;
    ctx.fillRect(-magLen, -magW / 2, magLen, magW);
    ctx.font = `bold 10px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', -magLen / 2, 0);

    // S pole (blue)
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, -magW / 2, magLen, magW);
    ctx.fillStyle = colors.text;
    ctx.fillText('S', magLen / 2, 0);

    ctx.restore();

    // Electrons flowing in the coil
    const electronCount = 8;
    for (let i = 0; i < electronCount; i++) {
      const ea =
        (i / electronCount) * Math.PI * 2 + (now / 500) * (sub * 0.5 + 0.5);
      const ex = coilCx + Math.cos(ea) * coilR;
      const ey = coilCy + Math.sin(ea) * coilR;
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Label
    ctx.textBaseline = 'alphabetic';
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, sub * 3);
    ctx.fillText('Electromagnetic Induction', cx, coilCy + coilR + 40);
    ctx.font = `12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.fillText(
      'Spin a magnet inside a coil = electricity',
      cx,
      coilCy + coilR + 60
    );
    ctx.globalAlpha = 1;
  } else if (progress < 0.5) {
    // Zoom out: turbine + shaft + generator
    const sub = (progress - 0.3) / 0.2;
    const genX = cx + 60;
    const genY = cy - 10;
    const genR = 40;

    // Shaft
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx - 100, genY);
    ctx.lineTo(genX - genR, genY);
    ctx.stroke();

    // Turbine blades (left)
    const turbX = cx - 100;
    const bladeAngle = (now / 600) % (Math.PI * 2);
    const bladeCount = 6;
    for (let i = 0; i < bladeCount; i++) {
      const a = bladeAngle + (i / bladeCount) * Math.PI * 2;
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(turbX, genY);
      ctx.lineTo(turbX + Math.cos(a) * 35, genY + Math.sin(a) * 35);
      ctx.stroke();
    }

    // Turbine hub
    ctx.beginPath();
    ctx.arc(turbX, genY, 8, 0, Math.PI * 2);
    ctx.fillStyle = colors.surfaceLight;
    ctx.fill();
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Generator coil
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(genX, genY, genR, 0, Math.PI * 2);
    ctx.stroke();

    // Spinning magnet inside generator
    const mAngle = (now / 800) % (Math.PI * 2);
    ctx.save();
    ctx.translate(genX, genY);
    ctx.rotate(mAngle);
    ctx.fillStyle = colors.danger;
    ctx.fillRect(-20, -5, 20, 10);
    ctx.fillStyle = colors.primary;
    ctx.fillRect(0, -5, 20, 10);
    ctx.restore();

    // Steam input arrow
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(turbX - 60, genY - 30);
    ctx.lineTo(turbX - 20, genY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(turbX - 20, genY);
    ctx.lineTo(turbX - 28, genY - 6);
    ctx.moveTo(turbX - 20, genY);
    ctx.lineTo(turbX - 28, genY + 4);
    ctx.stroke();

    ctx.font = `11px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('Steam', turbX - 55, genY - 36);

    // Labels
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, sub * 2);
    ctx.fillText('Heat -> Steam -> Turbine -> Generator', cx, genY + genR + 50);
    ctx.globalAlpha = 1;

    ctx.font = `12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Turbine', turbX, genY + 50);
    ctx.fillText('Generator', genX, genY + 50);
  } else if (progress < 0.7) {
    // Multiple generation sources
    const sub = (progress - 0.5) / 0.2;

    const sources = [
      { name: 'Coal', x: w * 0.12, icon: 'chimney' },
      { name: 'Gas', x: w * 0.3, icon: 'flame' },
      { name: 'Nuclear', x: w * 0.48, icon: 'tower' },
      { name: 'Hydro', x: w * 0.66, icon: 'dam' },
      { name: 'Wind', x: w * 0.84, icon: 'wind' },
    ];

    const iconY = cy - 30;
    const labelY = cy + 50;

    for (let i = 0; i < sources.length; i++) {
      const s = sources[i];
      const alpha = Math.min(1, Math.max(0, sub * sources.length - i * 0.6));
      ctx.globalAlpha = alpha;

      const x = s.x;

      // Draw simplified icons
      ctx.strokeStyle = colors.textMuted;
      ctx.fillStyle = colors.surfaceLight;
      ctx.lineWidth = 2;

      if (s.icon === 'chimney') {
        // Smokestack
        ctx.fillRect(x - 8, iconY - 20, 16, 40);
        ctx.strokeRect(x - 8, iconY - 20, 16, 40);
        ctx.fillRect(x - 3, iconY - 35, 6, 15);
        ctx.strokeRect(x - 3, iconY - 35, 6, 15);
      } else if (s.icon === 'flame') {
        // Gas turbine
        ctx.fillRect(x - 12, iconY - 15, 24, 35);
        ctx.strokeRect(x - 12, iconY - 15, 24, 35);
        ctx.fillStyle = colors.accent;
        ctx.beginPath();
        ctx.arc(x, iconY - 5, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (s.icon === 'tower') {
        // Cooling tower (trapezoid)
        ctx.beginPath();
        ctx.moveTo(x - 6, iconY - 30);
        ctx.lineTo(x - 14, iconY + 20);
        ctx.lineTo(x + 14, iconY + 20);
        ctx.lineTo(x + 6, iconY - 30);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      } else if (s.icon === 'dam') {
        // Dam wall
        ctx.beginPath();
        ctx.moveTo(x - 18, iconY - 20);
        ctx.lineTo(x - 12, iconY + 20);
        ctx.lineTo(x + 12, iconY + 20);
        ctx.lineTo(x + 18, iconY - 20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Water
        ctx.fillStyle = `rgba(59, 130, 246, 0.3)`;
        ctx.fillRect(x - 20, iconY - 10, 16, 30);
      } else if (s.icon === 'wind') {
        // Wind turbine
        ctx.strokeStyle = colors.textMuted;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, iconY + 20);
        ctx.lineTo(x, iconY - 20);
        ctx.stroke();
        // Blades
        const bladeA = (now / 700) % (Math.PI * 2);
        for (let b = 0; b < 3; b++) {
          const ba = bladeA + (b * Math.PI * 2) / 3;
          ctx.beginPath();
          ctx.moveTo(x, iconY - 20);
          ctx.lineTo(
            x + Math.cos(ba) * 22,
            iconY - 20 + Math.sin(ba) * 22
          );
          ctx.stroke();
        }
      }

      // Spinning circle below each (generator)
      const gY = iconY + 30;
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, gY, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Spinning line inside
      const ga = (now / 600) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ga) * 6, gY + Math.sin(ga) * 6);
      ctx.lineTo(x - Math.cos(ga) * 6, gY - Math.sin(ga) * 6);
      ctx.stroke();

      // Label
      ctx.font = `11px ${monoFont}`;
      ctx.fillStyle = colors.textMuted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(s.name, x, labelY);
    }

    ctx.globalAlpha = 1;

    // Title
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    const titleAlpha = Math.min(1, sub * 2);
    ctx.globalAlpha = titleAlpha;
    ctx.fillText('Almost Everything Spins', cx, h * 0.88);
    ctx.globalAlpha = 1;
  } else {
    // Solar PV -- the one that doesn't spin
    const sub = (progress - 0.7) / 0.3;

    // Solar panel (angled rectangle)
    const panelCx = cx;
    const panelCy = cy - 20;
    const panelW = 120;
    const panelH = 70;

    ctx.save();
    ctx.translate(panelCx, panelCy);
    ctx.rotate(-0.15); // Slight tilt

    // Panel body
    ctx.fillStyle = colors.surface;
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 2;
    ctx.fillRect(-panelW / 2, -panelH / 2, panelW, panelH);
    ctx.strokeRect(-panelW / 2, -panelH / 2, panelW, panelH);

    // Grid lines on panel
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 0.5;
    const gridCols = 4;
    const gridRows = 3;
    for (let c = 1; c < gridCols; c++) {
      const gx = -panelW / 2 + (panelW / gridCols) * c;
      ctx.beginPath();
      ctx.moveTo(gx, -panelH / 2);
      ctx.lineTo(gx, panelH / 2);
      ctx.stroke();
    }
    for (let r = 1; r < gridRows; r++) {
      const gy = -panelH / 2 + (panelH / gridRows) * r;
      ctx.beginPath();
      ctx.moveTo(-panelW / 2, gy);
      ctx.lineTo(panelW / 2, gy);
      ctx.stroke();
    }

    // Blue-ish tint for silicon cells
    ctx.fillStyle = `rgba(59, 130, 246, 0.12)`;
    ctx.fillRect(-panelW / 2, -panelH / 2, panelW, panelH);

    ctx.restore();

    // Photons (yellow dots) hitting the panel from above
    const photonCount = 8;
    for (let i = 0; i < photonCount; i++) {
      const seed = i * 137.5;
      const phase = ((now + seed * 10) % 2000) / 2000;
      const startX = panelCx - panelW / 2 + (i / photonCount) * panelW + 10;
      const startY = panelCy - panelH / 2 - 60;
      const endY = panelCy - panelH / 2 + 5;
      const py = startY + phase * (endY - startY);
      const px = startX + Math.sin(i) * 3;

      if (py < endY) {
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = colors.accent;
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    // Electrons (cyan dots) emerging from the bottom
    const electronCount = 6;
    for (let i = 0; i < electronCount; i++) {
      const seed = i * 97.3;
      const phase = ((now + seed * 12) % 1800) / 1800;
      const startY = panelCy + panelH / 2 - 5;
      const endY = panelCy + panelH / 2 + 50;
      const ey = startY + phase * (endY - startY);
      const ex =
        panelCx - panelW / 3 + ((i / electronCount) * panelW * 2) / 3;

      ctx.beginPath();
      ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Support pole
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(panelCx, panelCy + panelH / 2 + 2);
    ctx.lineTo(panelCx, panelCy + panelH / 2 + 35);
    ctx.stroke();

    // Labels
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.accent;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, sub * 2);
    ctx.fillText('Photons (light)', panelCx, panelCy - panelH / 2 - 70);

    ctx.fillStyle = colors.primary;
    ctx.fillText('Electrons (current)', panelCx, panelCy + panelH / 2 + 72);

    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.globalAlpha = Math.min(1, Math.max(0, sub * 2 - 0.4));
    ctx.fillText("Solar: The One That Doesn't Spin", cx, h * 0.9);

    ctx.font = `12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.globalAlpha = Math.min(1, Math.max(0, sub * 2 - 0.8));
    ctx.fillText(
      'No turbine. No steam. Just photons knocking electrons loose.',
      cx,
      h * 0.9 + 22
    );
    ctx.globalAlpha = 1;
  }
}

export default function SpinningPowerBriefing() {
  const renderCb = useCallback(render, []);

  return (
    <ScrollBriefing id="spinning-into-power" height={300} render={renderCb}>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Electromagnetic Induction
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          In 1831, Michael Faraday discovered that moving a magnet through a
          coil of wire produces electricity. This single principle powers almost
          every generator on Earth.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          The Universal Principle: Spin
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Coal, gas, nuclear, hydro, and wind all work the same way at the
          end: they spin a magnet inside a coil. The only difference is what
          provides the force to spin. Coal burns to make steam. Wind pushes
          blades directly. Nuclear heats water. But the generator is the same.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Solar PV Is Different
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Solar panels have no moving parts. Photons from the sun knock
          electrons loose from silicon atoms, creating a flow of current
          directly. This is the photovoltaic effect. It produces DC, not AC --
          which is why every solar installation needs an inverter.
        </p>
      </div>
    </ScrollBriefing>
  );
}
