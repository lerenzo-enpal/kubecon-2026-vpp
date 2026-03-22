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
  const monoFont = '"JetBrains Mono", monospace';
  const cx = w / 2;
  const waveTop = h * 0.15;
  const waveH = h * 0.3;
  const waveMid = waveTop + waveH / 2;

  if (progress < 0.2) {
    // DC flat line
    const sub = progress / 0.2;

    // Battery icon (left)
    const batX = w * 0.06;
    const batY = waveMid;
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(batX, batY - 12);
    ctx.lineTo(batX, batY + 12);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(batX + 8, batY - 7);
    ctx.lineTo(batX + 8, batY + 7);
    ctx.stroke();

    // DC line
    const lineLeft = w * 0.14;
    const lineRight = w * 0.92;
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lineLeft, waveMid);
    ctx.lineTo(lineLeft + (lineRight - lineLeft) * Math.min(1, sub * 2), waveMid);
    ctx.stroke();

    // Label
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, sub * 3);
    ctx.fillText('DC: Direct Current', cx, waveTop - 10);
    ctx.globalAlpha = 1;

    // Plus/minus labels
    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.danger;
    ctx.textAlign = 'left';
    ctx.fillText('+', batX - 4, batY - 18);
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('-', batX - 3, batY + 32);
  } else if (progress < 0.5) {
    // Morph to sine wave
    const sub = (progress - 0.2) / 0.3;
    const lineLeft = w * 0.06;
    const lineRight = w * 0.94;
    const amplitude = sub * (waveH / 2.5);
    const freq = 2 + sub * 4;

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    for (let x = lineLeft; x <= lineRight; x += 1) {
      const t = (x - lineLeft) / (lineRight - lineLeft);
      const y = waveMid - Math.sin(t * freq * Math.PI * 2) * amplitude;
      if (x === lineLeft) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Zero line
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(lineLeft, waveMid);
    ctx.lineTo(lineRight, waveMid);
    ctx.stroke();
    ctx.setLineDash([]);

    // Label
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    const label =
      sub < 0.3
        ? 'DC -> AC'
        : 'AC: Alternating Current -- 50 times per second';
    ctx.fillText(label, cx, waveTop - 10);

    // Cycle annotation
    if (sub > 0.6) {
      ctx.globalAlpha = Math.min(1, (sub - 0.6) / 0.3);
      ctx.font = `12px ${monoFont}`;
      ctx.fillStyle = colors.textMuted;
      ctx.fillText('one cycle = 20ms', cx, waveTop + waveH + 24);
      ctx.globalAlpha = 1;
    }
  } else if (progress < 0.7) {
    // Transformer diagram
    const sub = (progress - 0.5) / 0.2;

    // Small waveform at top
    const lineLeft = w * 0.06;
    const lineRight = w * 0.94;
    const smallWaveMid = h * 0.12;
    const smallAmp = 15;
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let x = lineLeft; x <= lineRight; x += 2) {
      const t = (x - lineLeft) / (lineRight - lineLeft);
      const y = smallWaveMid - Math.sin(t * 6 * Math.PI * 2) * smallAmp;
      if (x === lineLeft) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Transformer
    const tfY = h * 0.42;
    const coreW = 12;
    const coilH = 90;
    const coilW = 50;
    const gap = 8;
    const tfX = cx;

    // Core
    ctx.fillStyle = colors.textDim;
    ctx.fillRect(tfX - coreW / 2, tfY - coilH / 2, coreW, coilH);

    // Left coil (primary, few turns)
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    const leftCoilX = tfX - coreW / 2 - gap - coilW;
    ctx.strokeRect(leftCoilX, tfY - coilH / 2, coilW, coilH);
    // Vertical lines for turns
    const leftTurns = 4;
    for (let i = 1; i < leftTurns; i++) {
      const lx = leftCoilX + (coilW / leftTurns) * i;
      ctx.beginPath();
      ctx.moveTo(lx, tfY - coilH / 2);
      ctx.lineTo(lx, tfY + coilH / 2);
      ctx.stroke();
    }

    // Right coil (secondary, many turns)
    ctx.strokeStyle = colors.accent;
    const rightCoilX = tfX + coreW / 2 + gap;
    ctx.strokeRect(rightCoilX, tfY - coilH / 2, coilW, coilH);
    const rightTurns = 8;
    for (let i = 1; i < rightTurns; i++) {
      const rx = rightCoilX + (coilW / rightTurns) * i;
      ctx.beginPath();
      ctx.moveTo(rx, tfY - coilH / 2);
      ctx.lineTo(rx, tfY + coilH / 2);
      ctx.stroke();
    }

    // Labels
    ctx.font = `bold 13px ${monoFont}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = Math.min(1, sub * 2);
    ctx.fillText('230V', leftCoilX + coilW / 2, tfY + coilH / 2 + 24);
    ctx.fillStyle = colors.accent;
    ctx.fillText('400,000V', rightCoilX + coilW / 2, tfY + coilH / 2 + 24);

    // Arrow
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 2;
    const arrY = tfY;
    ctx.beginPath();
    ctx.moveTo(leftCoilX + coilW + 4, arrY);
    ctx.lineTo(rightCoilX - 4, arrY);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(rightCoilX - 4, arrY);
    ctx.lineTo(rightCoilX - 12, arrY - 5);
    ctx.moveTo(rightCoilX - 4, arrY);
    ctx.lineTo(rightCoilX - 12, arrY + 5);
    ctx.stroke();

    // Title
    ctx.fillStyle = colors.text;
    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillText('Transformer: Step-Up Voltage', cx, tfY - coilH / 2 - 20);
    ctx.globalAlpha = 1;

    // Bottom note
    ctx.font = `12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.globalAlpha = Math.min(1, Math.max(0, sub * 2 - 0.5));
    ctx.fillText(
      'AC can be transformed. DC cannot (easily).',
      cx,
      tfY + coilH / 2 + 54
    );
    ctx.fillText('This is why AC won.', cx, tfY + coilH / 2 + 72);
    ctx.globalAlpha = 1;
  } else if (progress < 0.85) {
    // Transmission towers
    const sub = (progress - 0.7) / 0.15;
    const groundY = h * 0.7;

    // Two towers
    const towerPositions = [w * 0.25, w * 0.75];
    for (const tx of towerPositions) {
      // Tower body (triangle)
      ctx.strokeStyle = colors.textMuted;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(tx, h * 0.2);
      ctx.lineTo(tx - 20, groundY);
      ctx.lineTo(tx + 20, groundY);
      ctx.closePath();
      ctx.stroke();

      // Cross arms
      ctx.beginPath();
      ctx.moveTo(tx - 30, h * 0.28);
      ctx.lineTo(tx + 30, h * 0.28);
      ctx.moveTo(tx - 22, h * 0.38);
      ctx.lineTo(tx + 22, h * 0.38);
      ctx.stroke();
    }

    // Wires between towers (catenary)
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5;
    const wireYs = [h * 0.28, h * 0.33, h * 0.38];
    for (const wy of wireYs) {
      ctx.beginPath();
      for (
        let x = towerPositions[0];
        x <= towerPositions[1];
        x += 2
      ) {
        const t =
          (x - towerPositions[0]) / (towerPositions[1] - towerPositions[0]);
        const sag = Math.sin(t * Math.PI) * 20;
        const y = wy + sag;
        if (x === towerPositions[0]) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Ground
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, groundY);
    ctx.lineTo(w * 0.95, groundY);
    ctx.stroke();

    // Formula
    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.accent;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, sub * 2);
    ctx.fillText('P_loss = I\u00B2 \u00D7 R', cx, groundY + 36);

    ctx.font = `13px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.globalAlpha = Math.min(1, Math.max(0, sub * 2 - 0.5));
    ctx.fillText(
      'Lower current = less energy wasted as heat',
      cx,
      groundY + 58
    );
    ctx.globalAlpha = 1;
  } else {
    // Inverter
    const sub = (progress - 0.85) / 0.15;
    const boxW = 140;
    const boxH = 80;
    const boxX = cx - boxW / 2;
    const boxY = cy - boxH / 2;

    // Inverter box
    ctx.fillStyle = colors.surface;
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.fillRect(boxX, boxY, boxW, boxH);
    ctx.strokeRect(boxX, boxY, boxW, boxH);

    ctx.font = `bold 14px ${monoFont}`;
    ctx.fillStyle = colors.primary;
    ctx.textAlign = 'center';
    ctx.fillText('INVERTER', cx, cy + 4);

    // AC arrow in (left)
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxX - 70, cy);
    ctx.lineTo(boxX - 6, cy);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(boxX - 6, cy);
    ctx.lineTo(boxX - 14, cy - 5);
    ctx.moveTo(boxX - 6, cy);
    ctx.lineTo(boxX - 14, cy + 5);
    ctx.stroke();

    // Small sine wave label
    ctx.font = `bold 12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('AC', boxX - 38, cy - 14);

    // Sine squiggle
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i < 30; i++) {
      const lx = boxX - 58 + i;
      const ly = cy + 14 - Math.sin((i / 30) * Math.PI * 4) * 6;
      if (i === 0) ctx.moveTo(lx, ly);
      else ctx.lineTo(lx, ly);
    }
    ctx.stroke();

    // DC arrow out (right)
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(boxX + boxW + 6, cy);
    ctx.lineTo(boxX + boxW + 70, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(boxX + boxW + 70, cy);
    ctx.lineTo(boxX + boxW + 62, cy - 5);
    ctx.moveTo(boxX + boxW + 70, cy);
    ctx.lineTo(boxX + boxW + 62, cy + 5);
    ctx.stroke();

    ctx.font = `bold 12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('DC', boxX + boxW + 38, cy - 14);

    // Flat line for DC
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(boxX + boxW + 24, cy + 14);
    ctx.lineTo(boxX + boxW + 54, cy + 14);
    ctx.stroke();

    // Bottom explanation
    ctx.font = `13px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, sub * 2);
    ctx.fillText(
      'Your phone needs DC. Your wall outlet is AC.',
      cx,
      cy + boxH / 2 + 40
    );
    ctx.fillText('Inverters convert between them.', cx, cy + boxH / 2 + 60);
    ctx.globalAlpha = 1;
  }
}

export default function ACvsDCBriefing() {
  const renderCb = useCallback(render, []);

  return (
    <ScrollBriefing id="ac-vs-dc" height={300} render={renderCb}>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          The War of Currents
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          In the 1880s, Edison backed DC and Tesla backed AC. Edison even
          electrocuted an elephant to prove AC was dangerous. Tesla won because
          AC has one killer advantage: transformers.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Why AC Won
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Transformers can step AC voltage up for long-distance transmission,
          then step it back down for your house. Higher voltage means lower
          current, and lower current means less energy lost as heat in the wires.
          DC could not do this cheaply until very recently.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Why DC Is Coming Back
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Batteries store DC. Solar panels produce DC. Your laptop, phone, and
          LED lights all run on DC. Modern power electronics (inverters) can now
          convert between AC and DC efficiently, so DC is making a quiet
          comeback -- especially inside your home.
        </p>
      </div>
    </ScrollBriefing>
  );
}
