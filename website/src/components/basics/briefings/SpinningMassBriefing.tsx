import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

function drawRotor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  angle: number,
  blades: number,
  color: string
) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  for (let i = 0; i < blades; i++) {
    const a = angle + (i * Math.PI * 2) / blades;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2));
    ctx.stroke();
  }
  // Center dot
  ctx.beginPath();
  ctx.arc(x, y, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

function drawFrequencyGauge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hz: number,
  colors: CanvasThemeColors,
  monoFont: string
) {
  // Gauge arc background
  const startAngle = Math.PI * 0.75;
  const endAngle = Math.PI * 0.25;
  const totalArc = Math.PI * 1.5;

  ctx.strokeStyle = colors.surfaceLight;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(x, y, r, startAngle, startAngle + totalArc);
  ctx.stroke();

  // Colored portion based on hz (range 48-52)
  const hzNorm = Math.max(0, Math.min(1, (hz - 48) / 4));
  const needleAngle = startAngle + hzNorm * totalArc;

  // Color based on deviation from 50
  const dev = Math.abs(hz - 50);
  let gaugeColor = colors.success;
  if (dev > 1.5) gaugeColor = colors.danger;
  else if (dev > 0.5) gaugeColor = colors.accent;

  // Needle
  ctx.strokeStyle = gaugeColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + Math.cos(needleAngle) * (r - 8), y + Math.sin(needleAngle) * (r - 8));
  ctx.stroke();

  // Center cap
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fillStyle = gaugeColor;
  ctx.fill();

  // Hz readout
  ctx.font = `bold 16px ${monoFont}`;
  ctx.fillStyle = gaugeColor;
  ctx.textAlign = 'center';
  ctx.fillText(`${hz.toFixed(1)} Hz`, x, y + r + 22);
}

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

  if (progress < 0.2) {
    // Single turbine rotor spinning at 3000 RPM
    const sub = progress / 0.2;
    const rotorR = Math.min(w, h) * 0.18;
    const speed = 0.003; // rad per ms
    const angle = now * speed;

    drawRotor(ctx, cx, cy, rotorR, angle, 6, colors.primary);

    // Speed indicator
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText('3000 RPM', cx, cy + rotorR + 30);

    // Formula
    ctx.font = `13px ${monoFont}`;
    ctx.fillStyle = colors.accent;
    ctx.globalAlpha = Math.min(1, sub * 3);
    ctx.fillText('3000 RPM / 60 = 50 Hz', cx, cy + rotorR + 52);
    ctx.globalAlpha = 1;

    // Title
    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.primary;
    ctx.fillText('Synchronous Generator', cx, cy - rotorR - 20);
  } else if (progress < 0.4) {
    // Multiple rotors across simplified continent
    const sub = (progress - 0.2) / 0.2;
    const speed = 0.003;
    const angle = now * speed;

    // Simplified continent outline (just a rounded shape)
    ctx.strokeStyle = colors.surfaceLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.ellipse(cx, cy, w * 0.38, h * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Multiple rotors
    const rotors = [
      { x: cx - w * 0.2, y: cy - h * 0.1 },
      { x: cx + w * 0.15, y: cy - h * 0.15 },
      { x: cx - w * 0.05, y: cy + h * 0.12 },
      { x: cx + w * 0.25, y: cy + h * 0.05 },
      { x: cx - w * 0.25, y: cy + h * 0.08 },
      { x: cx + w * 0.05, y: cy - h * 0.05 },
    ];

    const rotorR = Math.min(w, h) * 0.06;
    rotors.forEach((r) => {
      drawRotor(ctx, r.x, r.y, rotorR, angle, 4, colors.primary);
    });

    // Sync lines between rotors (faint)
    ctx.strokeStyle = colors.primary;
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 1;
    for (let i = 0; i < rotors.length; i++) {
      for (let j = i + 1; j < rotors.length; j++) {
        ctx.beginPath();
        ctx.moveTo(rotors[i].x, rotors[i].y);
        ctx.lineTo(rotors[j].x, rotors[j].y);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;

    // Label
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, sub * 3);
    ctx.fillText('All generators spin in lockstep', cx, h * 0.9);
    ctx.globalAlpha = 1;
  } else if (progress < 0.6) {
    // Demand increases -> rotors slow -> frequency drops
    const sub = (progress - 0.4) / 0.2;
    const slowdown = 1 - sub * 0.4; // speed reduces to 60%
    const speed = 0.003 * slowdown;
    const angle = now * speed;
    const hz = 50 - sub * 1.5;

    // Rotors (fewer, bigger for clarity)
    const rotorR = Math.min(w, h) * 0.08;
    const rotorPositions = [
      { x: w * 0.2, y: cy - 10 },
      { x: w * 0.35, y: cy + 20 },
      { x: w * 0.2, y: cy + 50 },
    ];

    rotorPositions.forEach((r) => {
      drawRotor(ctx, r.x, r.y, rotorR, angle, 4, colors.primary);
    });

    // Demand bar (right side)
    const barX = w * 0.72;
    const barW = 30;
    const maxBarH = h * 0.5;
    const barH = maxBarH * (0.3 + sub * 0.7);
    const barY = cy + maxBarH / 2 - barH;
    ctx.fillStyle = colors.danger;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.danger;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.font = `11px ${monoFont}`;
    ctx.fillStyle = colors.danger;
    ctx.textAlign = 'center';
    ctx.fillText('DEMAND', barX + barW / 2, cy + maxBarH / 2 + 18);

    // Frequency gauge
    drawFrequencyGauge(ctx, w * 0.52, cy - 10, 40, hz, colors, monoFont);

    // Label
    ctx.font = `bold 13px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText('More demand -> rotors slow -> frequency drops', cx, h * 0.9);
  } else if (progress < 0.8) {
    // Demand shrinks -> rotors speed up -> frequency rises
    const sub = (progress - 0.6) / 0.2;
    const speedup = 0.6 + sub * 0.5; // recovers and overshoots slightly
    const speed = 0.003 * speedup;
    const angle = now * speed;
    const hz = 48.5 + sub * 2.5;

    // Rotors
    const rotorR = Math.min(w, h) * 0.08;
    const rotorPositions = [
      { x: w * 0.2, y: cy - 10 },
      { x: w * 0.35, y: cy + 20 },
      { x: w * 0.2, y: cy + 50 },
    ];

    rotorPositions.forEach((r) => {
      drawRotor(ctx, r.x, r.y, rotorR, angle, 4, colors.primary);
    });

    // Demand bar (shrinking)
    const barX = w * 0.72;
    const barW = 30;
    const maxBarH = h * 0.5;
    const barH = maxBarH * (1 - sub * 0.7);
    const barY = cy + maxBarH / 2 - barH;
    ctx.fillStyle = colors.success;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(barX, barY, barW, barH);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = colors.success;
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barW, barH);

    ctx.font = `11px ${monoFont}`;
    ctx.fillStyle = colors.success;
    ctx.textAlign = 'center';
    ctx.fillText('DEMAND', barX + barW / 2, cy + maxBarH / 2 + 18);

    // Frequency gauge
    drawFrequencyGauge(ctx, w * 0.52, cy - 10, 40, hz, colors, monoFont);

    // Label
    ctx.font = `bold 13px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText('Less demand -> rotors speed up -> frequency rises', cx, h * 0.9);
  } else {
    // Three-part summary diagram
    const sub = (progress - 0.8) / 0.2;
    const fadeIn = Math.min(1, sub * 2);
    ctx.globalAlpha = fadeIn;

    const colW = w / 3;
    const items = [
      { label: 'Demand', sub: '= Brake', color: colors.danger, icon: 'brake' },
      { label: 'Supply', sub: '= Engine', color: colors.success, icon: 'engine' },
      { label: 'Frequency', sub: '= Speedometer', color: colors.accent, icon: 'gauge' },
    ];

    items.forEach((item, i) => {
      const ix = colW * i + colW / 2;
      const iy = cy - 20;
      const iconR = 24;

      // Icon circle
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ix, iy, iconR, 0, Math.PI * 2);
      ctx.stroke();

      // Simple icon inside
      ctx.font = `bold 18px ${monoFont}`;
      ctx.fillStyle = item.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (item.icon === 'brake') ctx.fillText('D', ix, iy);
      else if (item.icon === 'engine') ctx.fillText('S', ix, iy);
      else ctx.fillText('F', ix, iy);
      ctx.textBaseline = 'alphabetic';

      // Labels
      ctx.font = `bold 14px ${monoFont}`;
      ctx.fillStyle = item.color;
      ctx.fillText(item.label, ix, iy + iconR + 22);

      ctx.font = `13px ${monoFont}`;
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(item.sub, ix, iy + iconR + 42);
    });

    ctx.globalAlpha = 1;
  }

  ctx.textBaseline = 'alphabetic';
}

export default function SpinningMassBriefing() {
  const renderCb = useCallback(render, []);

  return (
    <ScrollBriefing id="spinning-mass" height={400} render={renderCb}>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Spinning in Sync
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Every large power plant uses a synchronous generator -- a massive
          rotor spinning at exactly 3000 RPM (in 50 Hz grids). All
          generators across the grid are electromagnetically locked
          together, spinning in perfect lockstep.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Demand is a Brake
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          When you turn on a light, you add electromagnetic load to every
          generator on the grid. That load acts like a brake on the rotors.
          More demand means more braking force, which physically slows every
          turbine down.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Frequency is the Signal
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Since frequency equals RPM divided by 60, slower rotors mean lower
          frequency. The grid frequency -- 50.0 Hz in Europe -- is a
          real-time indicator of the supply-demand balance. It's the one
          number everyone watches.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          The Universal Speedometer
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Frequency above 50 Hz? Too much supply. Below 50 Hz? Too much
          demand. The entire grid control system -- from automated reserves
          to manual dispatch -- exists to keep this single number stable.
        </p>
      </div>
    </ScrollBriefing>
  );
}
