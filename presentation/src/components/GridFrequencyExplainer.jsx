import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * GridFrequencyExplainer — Step-driven visualization:
 *   Step 0: Single turbine + clean 50 Hz waveform
 *   Step 1: Two turbines in sync, combined strong waveform
 *   Step 2: Turbines clash — one slows, waveforms interfere, disconnect
 */

function drawTurbine(ctx, cx, cy, r, angle, color, label, dimmed) {
  const alpha = dimmed ? 0.3 : 1;

  // Outer ring
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = color + '50';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Glow ring
  if (!dimmed) {
    ctx.beginPath();
    ctx.arc(cx, cy, r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = color + '15';
    ctx.lineWidth = 10;
    ctx.stroke();
  }

  // Inner circle
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.88, 0, Math.PI * 2);
  ctx.fillStyle = colors.surface;
  ctx.fill();
  ctx.strokeStyle = color + '30';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Rotor blades (6)
  for (let i = 0; i < 6; i++) {
    const a = angle + (i * Math.PI * 2) / 6;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r * 0.15, cy + Math.sin(a) * r * 0.15);
    ctx.lineTo(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * r * 0.78, cy + Math.sin(a) * r * 0.78, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  // Center hub
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Label
  ctx.font = 'bold 14px "JetBrains Mono"';
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(label, cx, cy + r + 22);

  ctx.globalAlpha = 1;
}

function drawWaveform(ctx, x, y, w, h, freq, elapsed, color, alpha, label) {
  ctx.globalAlpha = alpha;

  // Waveform
  ctx.beginPath();
  const samples = 200;
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const px = x + t * w;
    const py = y + h / 2 - Math.sin(t * freq * 0.4 + elapsed * freq * 0.05) * h * 0.4;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Label
  if (label) {
    ctx.font = '14px "JetBrains Mono"';
    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.fillText(label, x, y - 8);
  }

  ctx.globalAlpha = 1;
}

function drawDisconnectX(ctx, cx, cy, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - size, cy - size);
  ctx.lineTo(cx + size, cy + size);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + size, cy - size);
  ctx.lineTo(cx - size, cy + size);
  ctx.stroke();
}

export default function GridFrequencyExplainer({ width = 1200, height = 480, step = 0 }) {
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
      ctx.strokeStyle = colors.surfaceLight + '08';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // Turbine rotation speeds (slowed for visibility)
      const baseSpeed = Math.PI * 0.3;
      const angle1 = elapsed * baseSpeed;

      // Step 2: second turbine slows down over time, oscillates
      const slowFactor = s >= 2 ? 0.6 + 0.15 * Math.sin(elapsed * 0.5) : 1;
      const angle2 = elapsed * baseSpeed * slowFactor;

      const freq1 = 50;
      const freq2 = s >= 2 ? 50 * slowFactor : 50;

      // Disconnect happens when slow turbine drops below threshold
      const isDisconnected = s >= 2 && slowFactor < 0.7;

      // === STEP 0: Single turbine + waveform ===
      if (s === 0) {
        const tX = width * 0.2;
        const tY = height * 0.45;
        drawTurbine(ctx, tX, tY, 80, angle1, colors.success, 'Generator A', false);

        // Waveform
        const wX = width * 0.42;
        const wY = height * 0.15;
        const wW = width * 0.52;
        const wH = height * 0.55;

        // Baseline
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = colors.surfaceLight;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wX, wY + wH / 2);
        ctx.lineTo(wX + wW, wY + wH / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        drawWaveform(ctx, wX, wY, wW, wH, freq1, elapsed, colors.success, 1, '50 Hz — clean AC output');

        // Frequency readout
        ctx.font = 'bold 48px "JetBrains Mono"';
        ctx.fillStyle = colors.success;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 16;
        ctx.shadowColor = colors.success + '40';
        ctx.fillText('50.00 Hz', width * 0.68, height * 0.88);
        ctx.shadowBlur = 0;

        ctx.font = '16px "Inter"';
        ctx.fillStyle = colors.textMuted;
        ctx.fillText('All generators synchronized to the same frequency', width * 0.68, height * 0.95);
      }

      // === STEP 1: Two turbines in sync ===
      if (s === 1) {
        const t1X = width * 0.12;
        const t2X = width * 0.12;
        const t1Y = height * 0.25;
        const t2Y = height * 0.7;

        drawTurbine(ctx, t1X, t1Y, 65, angle1, colors.success, 'Generator A', false);
        drawTurbine(ctx, t2X, t2Y, 65, angle1, colors.primary, 'Generator B', false);

        // Connection line between turbines
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = colors.surfaceLight;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(t1X, t1Y + 65 + 30);
        ctx.lineTo(t2X, t2Y - 65 - 10);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '12px "JetBrains Mono"';
        ctx.fillStyle = colors.textDim;
        ctx.textAlign = 'center';
        ctx.fillText('SYNC', t1X, (t1Y + t2Y) / 2);

        // Individual waveforms
        const wX = width * 0.32;
        const wW = width * 0.36;
        const wH1 = height * 0.28;

        drawWaveform(ctx, wX, height * 0.08, wW, wH1, freq1, elapsed, colors.success, 0.6, 'Generator A');
        drawWaveform(ctx, wX, height * 0.42, wW, wH1, freq1, elapsed, colors.primary, 0.6, 'Generator B');

        // Arrow to combined
        const arrowX = wX + wW + 20;
        ctx.strokeStyle = colors.textDim;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(arrowX, height * 0.22);
        ctx.lineTo(arrowX + 30, height * 0.42);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(arrowX, height * 0.56);
        ctx.lineTo(arrowX + 30, height * 0.42);
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(arrowX + 30, height * 0.42);
        ctx.lineTo(arrowX + 22, height * 0.39);
        ctx.lineTo(arrowX + 22, height * 0.45);
        ctx.closePath();
        ctx.fillStyle = colors.textDim;
        ctx.fill();

        // Combined strong waveform
        const combX = width * 0.74;
        const combW = width * 0.22;
        const combH = height * 0.5;

        ctx.beginPath();
        const samples = 200;
        for (let i = 0; i <= samples; i++) {
          const t = i / samples;
          const px = combX + t * combW;
          const wave1 = Math.sin(t * freq1 * 0.4 + elapsed * freq1 * 0.05);
          const wave2 = Math.sin(t * freq1 * 0.4 + elapsed * freq1 * 0.05);
          const py = height * 0.22 + combH / 2 - (wave1 + wave2) * combH * 0.22;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = colors.text;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 14px "JetBrains Mono"';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText('Combined: 2x power', combX, height * 0.13);

        ctx.font = 'bold 36px "JetBrains Mono"';
        ctx.fillStyle = colors.success;
        ctx.textAlign = 'center';
        ctx.fillText('IN PHASE', width * 0.82, height * 0.88);

        ctx.font = '15px "Inter"';
        ctx.fillStyle = colors.textMuted;
        ctx.fillText('Waves add up — more power, stable grid', width * 0.82, height * 0.94);
      }

      // === STEP 2: Clash — one slows, interference, disconnect ===
      if (s >= 2) {
        const t1X = width * 0.12;
        const t2X = width * 0.12;
        const t1Y = height * 0.25;
        const t2Y = height * 0.7;

        drawTurbine(ctx, t1X, t1Y, 65, angle1, colors.success, 'Generator A', false);
        drawTurbine(ctx, t2X, t2Y, 65, isDisconnected ? colors.danger : '#f59e0b', angle2, isDisconnected ? 'DISCONNECTED' : 'Generator B (slowing)', isDisconnected);

        if (isDisconnected) {
          drawDisconnectX(ctx, t2X, t2Y, 30, colors.danger);
        }

        // Broken sync line
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = colors.danger + '40';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(t1X, t1Y + 65 + 30);
        ctx.lineTo(t2X, t2Y - 65 - 10);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = '12px "JetBrains Mono"';
        ctx.fillStyle = colors.danger;
        ctx.textAlign = 'center';
        ctx.fillText('DESYNC', t1X, (t1Y + t2Y) / 2);

        // Individual waveforms showing different frequencies
        const wX = width * 0.32;
        const wW = width * 0.36;
        const wH1 = height * 0.28;

        drawWaveform(ctx, wX, height * 0.08, wW, wH1, freq1, elapsed, colors.success, 0.7, `Generator A: ${freq1.toFixed(1)} Hz`);
        drawWaveform(ctx, wX, height * 0.42, wW, wH1, freq2, elapsed * slowFactor, isDisconnected ? colors.danger : '#f59e0b', isDisconnected ? 0.3 : 0.7,
          isDisconnected ? 'Generator B: DISCONNECTED' : `Generator B: ${freq2.toFixed(1)} Hz`);

        // Combined waveform showing interference
        const combX = width * 0.74;
        const combW = width * 0.22;
        const combH = height * 0.5;

        ctx.beginPath();
        const samples = 200;
        for (let i = 0; i <= samples; i++) {
          const t = i / samples;
          const px = combX + t * combW;
          const wave1 = Math.sin(t * freq1 * 0.4 + elapsed * freq1 * 0.05);
          const wave2 = isDisconnected ? 0 : Math.sin(t * freq2 * 0.4 + elapsed * freq2 * 0.05);
          const py = height * 0.22 + combH / 2 - (wave1 + wave2) * combH * 0.22;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = isDisconnected ? colors.danger : '#f59e0b';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.font = 'bold 14px "JetBrains Mono"';
        ctx.fillStyle = isDisconnected ? colors.danger : '#f59e0b';
        ctx.textAlign = 'left';
        ctx.fillText(isDisconnected ? 'Combined: power lost' : 'Combined: destructive interference', combX, height * 0.13);

        // Status
        ctx.font = 'bold 36px "JetBrains Mono"';
        ctx.fillStyle = isDisconnected ? colors.danger : '#f59e0b';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 12;
        ctx.shadowColor = (isDisconnected ? colors.danger : '#f59e0b') + '40';
        ctx.fillText(isDisconnected ? 'CASCADE RISK' : 'OUT OF PHASE', width * 0.82, height * 0.88);
        ctx.shadowBlur = 0;

        ctx.font = '15px "Inter"';
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(
          isDisconnected
            ? 'Generator disconnects to survive — remaining ones overloaded'
            : 'Waves cancel out — grid destabilizes, equipment at risk',
          width * 0.82, height * 0.94,
        );
      }

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, step, slideContext?.isSlideActive]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}
