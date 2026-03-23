import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * GridFrequencyExplainer — Left/right turbines with waveforms flowing
 * toward the center where they combine into the grid-wide frequency.
 *
 * Steps:
 *   0: Generator A alone, clean wave flows to center
 *   1: Generator B appears on right, both in sync, strong center wave
 *   2: Generator B slows slightly — subtle drift visible in center
 *   3: Generator B much slower — destructive interference, center distorted
 *   4: Generator B disconnects — center returns to clean but weaker
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
    // Red X
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

      // Layout zones
      const turbineR = 60;
      const leftTurbineX = 80;
      const rightTurbineX = width - 80;
      const turbineY = height * 0.45;

      // Waveform zones
      const leftWaveX = leftTurbineX + turbineR + 20;
      const rightWaveEnd = rightTurbineX - turbineR - 20;
      const centerX = width / 2;
      const leftWaveW = centerX - leftWaveX - 30;
      const rightWaveX = centerX + 30;
      const rightWaveW = rightWaveEnd - rightWaveX;
      const waveY = height * 0.12;
      const waveH = height * 0.55;

      // Frequencies per step
      const freq1 = 50;
      const freqFactors = [1, 1, 0.94, 0.82, 0]; // B's speed relative to A
      const factor = freqFactors[Math.min(s, freqFactors.length - 1)];
      const freq2 = freq1 * factor;
      const showB = s >= 1;
      const disconnected = s >= 4;

      const baseSpeed = Math.PI * 0.3;
      const angle1 = elapsed * baseSpeed;
      const angle2 = elapsed * baseSpeed * factor;

      // Status colors
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

      // === Draw turbines ===
      drawTurbine(ctx, leftTurbineX, turbineY, turbineR, angle1, colorA, 'Generator A', false);
      if (showB) {
        drawTurbine(ctx, rightTurbineX, turbineY, turbineR, angle2, colorB,
          disconnected ? 'DISCONNECTED' : `Generator B`, disconnected);
      }

      // Frequency labels under turbines
      ctx.font = '12px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillStyle = colorA + 'aa';
      ctx.fillText(`${freq1.toFixed(1)} Hz`, leftTurbineX, turbineY + turbineR + 36);
      if (showB && !disconnected) {
        ctx.fillStyle = colorB + 'aa';
        ctx.fillText(`${freq2.toFixed(1)} Hz`, rightTurbineX, turbineY + turbineR + 36);
      }

      // === Draw waveforms ===
      const samples = 150;

      // Center baseline
      ctx.setLineDash([3, 5]);
      ctx.strokeStyle = colors.surfaceLight + '40';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(leftWaveX, waveY + waveH / 2);
      ctx.lineTo(rightWaveEnd, waveY + waveH / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Left waveform (A → center)
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const px = leftWaveX + t * leftWaveW;
        const fade = Math.min(1, t * 3) * Math.min(1, (1 - t) * 3);
        const py = waveY + waveH / 2 - Math.sin(t * 12 + elapsed * 2.5) * waveH * 0.35 * fade;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = colorA;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Left wave label
      ctx.font = '13px "JetBrains Mono"';
      ctx.fillStyle = colorA;
      ctx.textAlign = 'left';
      ctx.fillText('A: 50.0 Hz', leftWaveX, waveY - 6);

      // Right waveform (B → center) — only if B is visible and not disconnected
      if (showB && !disconnected) {
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const t = i / samples;
          const px = rightWaveX + (1 - t) * rightWaveW; // flows left
          const fade = Math.min(1, t * 3) * Math.min(1, (1 - t) * 3);
          const py = waveY + waveH / 2 - Math.sin(t * 12 * factor + elapsed * 2.5 * factor) * waveH * 0.35 * fade;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = colorB;
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.font = '13px "JetBrains Mono"';
        ctx.fillStyle = colorB;
        ctx.textAlign = 'right';
        ctx.fillText(`B: ${freq2.toFixed(1)} Hz`, rightWaveEnd, waveY - 6);
      }

      // === Center: combined grid frequency ===
      const centerWaveW = 50;
      const centerWaveH = waveH * 0.7;
      const centerWaveY = waveY + (waveH - centerWaveH) / 2;

      // Center box background
      ctx.fillStyle = colors.surface + '80';
      ctx.beginPath();
      ctx.roundRect(centerX - centerWaveW / 2 - 8, centerWaveY - 20, centerWaveW + 16, centerWaveH + 60, 8);
      ctx.fill();
      ctx.strokeStyle = centerColor + '30';
      ctx.lineWidth = 1;
      ctx.stroke();

      // "GRID" label
      ctx.font = 'bold 12px "JetBrains Mono"';
      ctx.fillStyle = centerColor;
      ctx.textAlign = 'center';
      ctx.fillText('GRID', centerX, centerWaveY - 6);

      // Center combined waveform (vertical, flowing down)
      ctx.beginPath();
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const py = centerWaveY + t * centerWaveH;
        const wave1 = Math.sin(t * 10 + elapsed * 2.5);
        const wave2 = (showB && !disconnected) ? Math.sin(t * 10 * factor + elapsed * 2.5 * factor) : 0;
        const combined = wave1 + wave2;
        const amplitude = showB && !disconnected ? 8 : 12;
        const px = centerX + combined * amplitude;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.strokeStyle = centerColor;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Center frequency readout
      const gridFreq = disconnected ? freq1 : (showB ? (freq1 + freq2) / 2 : freq1);
      ctx.font = 'bold 18px "JetBrains Mono"';
      ctx.fillStyle = centerColor;
      ctx.textAlign = 'center';
      ctx.fillText(`${gridFreq.toFixed(1)}`, centerX, centerWaveY + centerWaveH + 30);
      ctx.font = '12px "JetBrains Mono"';
      ctx.fillStyle = centerColor + 'aa';
      ctx.fillText('Hz', centerX, centerWaveY + centerWaveH + 46);

      // === Bottom status bar ===
      const statusY = height - 40;
      let statusText, statusColor, subText;

      if (s === 0) {
        statusText = 'Single generator — clean 50 Hz output';
        statusColor = colorA;
        subText = 'Every turbine on the grid produces AC at this frequency';
      } else if (s === 1) {
        statusText = 'Two generators in phase — waves reinforce';
        statusColor = colors.success;
        subText = 'Synchronized generators add power to the grid';
      } else if (s === 2) {
        statusText = 'Generator B slowing — slight frequency drift';
        statusColor = colors.accent;
        subText = 'Demand exceeds supply — turbines feel more resistance';
      } else if (s === 3) {
        statusText = 'Waves clashing — destructive interference';
        statusColor = '#f59e0b';
        subText = 'Out-of-sync generators damage equipment and destabilize the grid';
      } else {
        statusText = 'Generator B disconnected to prevent destruction';
        statusColor = colors.danger;
        subText = 'Remaining generators carry all load — cascade risk';
      }

      ctx.font = 'bold 18px "Inter"';
      ctx.fillStyle = statusColor;
      ctx.textAlign = 'center';
      ctx.fillText(statusText, width / 2, statusY);

      ctx.font = '14px "Inter"';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(subText, width / 2, statusY + 22);

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, step, slideContext?.isSlideActive]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}
