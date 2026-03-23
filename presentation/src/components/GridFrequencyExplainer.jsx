import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * GridFrequencyExplainer — Left/right turbines with waveforms flowing
 * toward a horizontal center box showing the combined grid frequency.
 *
 * Steps:
 *   0: Generator A alone, clean wave flows to center
 *   1: Generator B appears, both in sync, strong center wave
 *   2: Generator B drifts slightly — center shows subtle interference
 *   3: Generator B far out of sync — destructive interference
 *   4: Generator B disconnects — center returns to clean but single source
 */

function drawTurbine(ctx, cx, cy, r, angle, color, label, dimmed) {
  ctx.save();
  if (dimmed) ctx.globalAlpha = 0.25;

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color + '50';
  ctx.lineWidth = 3;
  ctx.stroke();

  if (!dimmed) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = color + '12';
    ctx.lineWidth = 8;
    ctx.stroke();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
  ctx.fillStyle = colors.surface;
  ctx.fill();

  for (let i = 0; i < 6; i++) {
    const a = angle + (i * Math.PI * 2) / 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.15, cy + Math.sin(a) * r * 0.15);
    ctx.lineTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78, 3, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.11, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.font = 'bold 13px "JetBrains Mono"';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, cy + r + 20);

  if (dimmed) {
    const s = r * 0.4;
    ctx.globalAlpha = 0.8;
    ctx.strokeStyle = colors.danger;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s); ctx.stroke();
  }

  ctx.restore();
}

export default function GridFrequencyExplainer({ width = 1200, height = 440, step = 0 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const stepRef = useRef(step);
  stepRef.current = step;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const startTime = performance.now() / 1000;

    function draw() {
      const now = performance.now() / 1000;
      const isActive = slideContext?.isSlideActive;
      const elapsed = now - startTime;
      const s = stepRef.current;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = colors.surfaceLight + '06';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // Layout
      const turbineR = 55;
      const leftTurbineX = 80;
      const rightTurbineX = width - 80;
      const topRowY = height * 0.22;   // turbines + individual waveforms
      const centerBoxY = height * 0.55; // horizontal center box

      // Frequencies per step
      const freq1 = 50;
      const freqFactors = [1, 1, 0.85, 0.60, 0];
      const factor = freqFactors[Math.min(s, freqFactors.length - 1)];
      const freq2 = freq1 * factor;
      const showB = s >= 1;
      const disconnected = s >= 4;

      const baseSpeed = Math.PI * 0.3;
      const angle1 = elapsed * baseSpeed;
      const angle2 = elapsed * baseSpeed * factor;

      // Colors
      const colorA = colors.success;
      const colorB = disconnected ? colors.danger
        : s >= 3 ? '#f59e0b'
        : s >= 2 ? colors.accent
        : colors.primary;
      const centerColor = s === 0 ? colorA
        : s === 1 ? colors.text
        : s >= 4 ? colorA
        : s >= 3 ? colors.danger
        : colors.accent;

      // === Top row: turbines + individual waveforms ===

      // Left turbine
      drawTurbine(ctx, leftTurbineX, topRowY, turbineR, angle1, colorA, 'Generator A', false);

      // Left waveform (from turbine toward center)
      const leftWaveX = leftTurbineX + turbineR + 18;
      const leftWaveEnd = width / 2 - 30;
      const leftWaveW = leftWaveEnd - leftWaveX;
      const waveAmplitude = 30;

      if (leftWaveW > 40) {
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const t = i / 120;
          const px = leftWaveX + t * leftWaveW;
          const fade = Math.min(1, t * 4) * Math.min(1, (1 - t) * 4);
          const py = topRowY - Math.sin(t * 12 + elapsed * 2.5) * waveAmplitude * fade;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = colorA + '80';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.font = 'bold 18px "JetBrains Mono"';
        ctx.fillStyle = colorA;
        ctx.textAlign = 'left';
        ctx.fillText('50.0 Hz', leftWaveX + 4, topRowY - waveAmplitude - 10);
      }

      // Right turbine
      if (showB) {
        drawTurbine(ctx, rightTurbineX, topRowY, turbineR, angle2, colorB,
          disconnected ? 'DISCONNECTED' : 'Generator B', disconnected);

        // Right waveform (from turbine toward center)
        const rightWaveEnd2 = rightTurbineX - turbineR - 18;
        const rightWaveX = width / 2 + 30;
        const rightWaveW = rightWaveEnd2 - rightWaveX;

        if (rightWaveW > 40 && !disconnected) {
          ctx.beginPath();
          for (let i = 0; i <= 120; i++) {
            const t = i / 120;
            const px = rightWaveEnd2 - t * rightWaveW; // flows left
            const fade = Math.min(1, t * 4) * Math.min(1, (1 - t) * 4);
            const py = topRowY - Math.sin(t * 12 * factor + elapsed * 2.5 * factor) * waveAmplitude * fade;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.strokeStyle = colorB + '80';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = 'bold 18px "JetBrains Mono"';
          ctx.fillStyle = colorB;
          ctx.textAlign = 'right';
          ctx.fillText(`${freq2.toFixed(1)} Hz`, rightWaveEnd2 - 4, topRowY - waveAmplitude - 10);
        }
      }

      // Arrow lines from top waveforms down to center box
      const arrowTopY = topRowY + turbineR + 44;
      const arrowBotY = centerBoxY - 16;
      ctx.setLineDash([3, 4]);
      ctx.strokeStyle = colorA + '30';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(width * 0.3, arrowTopY);
      ctx.lineTo(width * 0.4, arrowBotY);
      ctx.stroke();
      if (showB && !disconnected) {
        ctx.strokeStyle = colorB + '30';
        ctx.beginPath();
        ctx.moveTo(width * 0.7, arrowTopY);
        ctx.lineTo(width * 0.6, arrowBotY);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // === Center box: horizontal combined grid frequency ===
      const boxPadX = width * 0.08;
      const boxW = width - boxPadX * 2;
      const boxH = 90;

      // Box background
      ctx.fillStyle = colors.surface + '90';
      ctx.beginPath();
      ctx.roundRect(boxPadX, centerBoxY, boxW, boxH, 10);
      ctx.fill();
      ctx.strokeStyle = centerColor + '30';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // "GRID  50.0 Hz" on one line, left side
      const gridFreq = disconnected ? freq1 : (showB ? (freq1 + freq2) / 2 : freq1);
      ctx.font = 'bold 42px "JetBrains Mono"';
      ctx.fillStyle = centerColor;
      ctx.textAlign = 'left';
      ctx.shadowBlur = 14;
      ctx.shadowColor = centerColor + '30';
      const gridText = `GRID  ${gridFreq.toFixed(1)} Hz`;
      ctx.fillText(gridText, boxPadX + 20, centerBoxY + boxH / 2 + 15);
      const gridTextW = ctx.measureText(gridText).width;
      ctx.shadowBlur = 0;

      // Combined waveform (starts after the text, fills rest of box)
      const cwX = boxPadX + 20 + gridTextW + 30;
      const cwW = boxW - gridTextW - 70;
      const cwMidY = centerBoxY + boxH / 2;
      const cwAmp = boxH * 0.32;

      // Waveform baseline
      ctx.setLineDash([2, 4]);
      ctx.strokeStyle = colors.surfaceLight + '30';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cwX, cwMidY);
      ctx.lineTo(cwX + cwW, cwMidY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Combined wave
      ctx.beginPath();
      for (let i = 0; i <= 180; i++) {
        const t = i / 180;
        const px = cwX + t * cwW;
        const wave1 = Math.sin(t * 14 + elapsed * 2.5);
        const wave2 = (showB && !disconnected) ? Math.sin(t * 14 * factor + elapsed * 2.5 * factor) : 0;
        const combined = wave1 + wave2;
        const maxAmp = (showB && !disconnected) ? cwAmp * 0.5 : cwAmp;
        const py = cwMidY - combined * maxAmp;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = centerColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // === Bottom status ===
      const statusY = height - 50;
      let statusText, statusColor, subText;

      if (s === 0) {
        statusText = 'Single generator — clean 50 Hz output';
        statusColor = colorA;
        subText = 'Every turbine on the grid produces AC at this frequency';
      } else if (s === 1) {
        statusText = 'Two generators in phase — waves reinforce';
        statusColor = colors.success;
        subText = 'Synchronized frequencies combine into a stronger signal';
      } else if (s === 2) {
        statusText = 'Generator B drifting — frequencies diverging';
        statusColor = colors.accent;
        subText = 'Even a small frequency mismatch creates interference on the grid';
      } else if (s === 3) {
        statusText = 'Frequencies clashing — destructive interference';
        statusColor = '#f59e0b';
        subText = 'Out-of-sync generators damage equipment and destabilize the grid';
      } else {
        statusText = 'Generator B disconnected to prevent destruction';
        statusColor = colors.danger;
        subText = 'Remaining generators carry all load — if they slow too, cascade begins';
      }

      ctx.font = 'bold 26px "Inter"';
      ctx.fillStyle = statusColor;
      ctx.textAlign = 'center';
      ctx.fillText(statusText, width / 2, statusY);

      ctx.font = '20px "Inter"';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(subText, width / 2, statusY + 32);

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, step, slideContext?.isSlideActive]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}
