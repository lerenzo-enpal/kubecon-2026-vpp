import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * ResponseTimeRace — 4 generation sources race to come online.
 * Icons start dim/STANDBY, timers count up with acceleration,
 * each source transitions ONLINE via scan-line wipe at its activation time.
 */

const SOURCES = [
  { label: 'VPP Battery', ms: 140,     color: colors.success },
  { label: 'Hydro',       ms: 20000,   color: '#60a5fa' },
  { label: 'Gas Turbine',  ms: 600000,  color: '#fb923c' },
  { label: 'Coal Plant',   ms: 7200000, color: colors.textDim },
];

// Acceleration: simTime = t + k * t^3 / 3
// k ≈ 330 maps ~8.5s real → ~7200s simulated
const K_ACCEL = 330;
function simTime(realT) {
  return realT + K_ACCEL * realT * realT * realT / 3;
}

function formatTimer(ms) {
  if (ms >= 3600000) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  const frac = Math.floor((ms % 1000));
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${frac.toString().padStart(3, '0')}`;
}

// ── Icon drawing functions ──

function drawBattery(ctx, cx, cy, w, h, color, active, now) {
  const bw = w * 0.5;
  const bh = h * 0.7;
  const bx = cx - bw / 2;
  const by = cy - bh / 2 + 4;
  const termW = bw * 0.3;
  const termH = 4;

  // Terminal
  ctx.fillStyle = color;
  ctx.fillRect(cx - termW / 2, by - termH, termW, termH);

  // Casing outline
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 3);
  ctx.stroke();

  if (active) {
    // Charge fill — animated pulse
    const level = 0.6 + 0.15 * Math.sin(now * 2.5);
    const fillH = bh * level * 0.9;
    ctx.fillStyle = color + 'aa';
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + bh - fillH - 2, bw - 4, fillH, 2);
    ctx.fill();

    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = color + '50';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 3);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawHydro(ctx, cx, cy, w, h, color, active, now) {
  // Dam wall (trapezoid)
  const dw = w * 0.45;
  const dh = h * 0.65;
  const dx = cx - dw / 2;
  const dy = cy - dh / 2 + 4;
  const taper = dw * 0.15;

  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(dx + taper, dy);
  ctx.lineTo(dx + dw - taper, dy);
  ctx.lineTo(dx + dw, dy + dh);
  ctx.lineTo(dx, dy + dh);
  ctx.closePath();
  ctx.stroke();

  // Water level behind dam (left side)
  if (active) {
    ctx.fillStyle = color + '30';
    ctx.beginPath();
    ctx.moveTo(dx + taper - 8, dy + 6);
    ctx.lineTo(dx + taper, dy + 6);
    ctx.lineTo(dx, dy + dh);
    ctx.lineTo(dx - 8, dy + dh);
    ctx.closePath();
    ctx.fill();

    // Water arc spilling over
    const arcPhase = now * 3;
    ctx.strokeStyle = color + 'cc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dx + dw - taper + 2, dy + 4);
    ctx.quadraticCurveTo(
      dx + dw + 12, dy + dh * 0.2,
      dx + dw + 6, dy + dh + 2,
    );
    ctx.stroke();

    // Animated droplets
    for (let d = 0; d < 3; d++) {
      const t = ((now * 1.5 + d * 0.33) % 1);
      const dropX = dx + dw + 4 + Math.sin(d * 2.1) * 4;
      const dropY = dy + dh * 0.3 + t * dh * 0.8;
      const alpha = 1 - t;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(dropX, dropY, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = color + '50';
    ctx.beginPath();
    ctx.moveTo(dx + taper, dy);
    ctx.lineTo(dx + dw - taper, dy);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawGasTurbine(ctx, cx, cy, w, h, color, active, now) {
  const bw = w * 0.3;
  const bh = h * 0.55;
  const bx = cx - bw / 2 + 6;
  const by = cy - bh / 2 + 8;

  // Air intake (trapezoid, left)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  const intW = bw * 0.7;
  const intH = bh * 0.6;
  const intX = bx - intW - 4;
  const intY = by + (bh - intH) / 2;
  ctx.beginPath();
  ctx.moveTo(intX, intY);
  ctx.lineTo(intX + intW, intY + intH * 0.15);
  ctx.lineTo(intX + intW, intY + intH * 0.85);
  ctx.lineTo(intX, intY + intH);
  ctx.closePath();
  ctx.stroke();

  // Shaft
  ctx.fillStyle = color + '60';
  ctx.fillRect(intX + intW, by + bh * 0.35, 4, bh * 0.3);

  // Generator building
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(bx, by, bw, bh);
  ctx.stroke();

  // Windows (2x2)
  const winW = bw * 0.2;
  const winH = bh * 0.18;
  for (let wy = 0; wy < 2; wy++) {
    for (let wx = 0; wx < 2; wx++) {
      const winX = bx + bw * 0.2 + wx * bw * 0.35;
      const winY = by + bh * 0.15 + wy * bh * 0.4;
      ctx.fillStyle = active ? color + '40' : color + '15';
      ctx.fillRect(winX, winY, winW, winH);
    }
  }

  // Stack
  const stackW = 6;
  const stackH = bh * 0.6;
  const stackX = bx + bw + 3;
  const stackY = by - stackH * 0.2;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(stackX, stackY + stackH);
  ctx.lineTo(stackX, stackY);
  ctx.lineTo(stackX + stackW, stackY);
  ctx.lineTo(stackX + stackW, stackY + stackH);
  ctx.stroke();

  if (active) {
    // Smoke puffs
    for (let s = 0; s < 3; s++) {
      const t = ((now * 0.6 + s * 0.33) % 1);
      const smokeX = stackX + stackW / 2 + Math.sin(now * 2 + s) * 3;
      const smokeY = stackY - t * 18;
      const smokeR = 2 + t * 5;
      ctx.globalAlpha = (1 - t) * 0.5;
      ctx.fillStyle = color + '60';
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = color + '40';
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

function drawCoalPlant(ctx, cx, cy, w, h, color, active, now) {
  const bw = w * 0.35;
  const bh = h * 0.5;
  const bx = cx - bw / 2 - 4;
  const by = cy - bh / 2 + 8;

  // Main building (boiler hall)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.rect(bx, by, bw, bh);
  ctx.stroke();

  // Windows
  for (let wi = 0; wi < 3; wi++) {
    const winX = bx + bw * 0.15 + wi * bw * 0.28;
    ctx.fillStyle = active ? color + '35' : color + '10';
    ctx.fillRect(winX, by + bh * 0.2, bw * 0.15, bh * 0.25);
  }

  // Smokestack (taller, left of building)
  const stackW = 7;
  const stackH = bh * 0.9;
  const stackX = bx - stackW - 5;
  const stackY = by + bh - stackH;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(stackX - 1, stackY + stackH);
  ctx.lineTo(stackX, stackY);
  ctx.lineTo(stackX + stackW, stackY);
  ctx.lineTo(stackX + stackW + 1, stackY + stackH);
  ctx.stroke();

  // Cooling tower (right of building — bell shape)
  const twrW = w * 0.2;
  const twrH = bh * 0.9;
  const twrX = bx + bw + 8;
  const twrY = by + bh - twrH;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(twrX, twrY + twrH);
  ctx.quadraticCurveTo(twrX - 2, twrY + twrH * 0.4, twrX + twrW * 0.15, twrY);
  ctx.lineTo(twrX + twrW * 0.85, twrY);
  ctx.quadraticCurveTo(twrX + twrW + 2, twrY + twrH * 0.4, twrX + twrW, twrY + twrH);
  ctx.stroke();

  if (active) {
    // Smokestack smoke
    for (let s = 0; s < 3; s++) {
      const t = ((now * 0.4 + s * 0.33) % 1);
      const smokeX = stackX + stackW / 2 + Math.sin(now * 1.5 + s * 1.1) * 4;
      const smokeY = stackY - t * 22;
      const smokeR = 2.5 + t * 6;
      ctx.globalAlpha = (1 - t) * 0.4;
      ctx.fillStyle = color + '50';
      ctx.beginPath();
      ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
      ctx.fill();
    }
    // Cooling tower steam
    for (let s = 0; s < 2; s++) {
      const t = ((now * 0.35 + s * 0.5) % 1);
      const stX = twrX + twrW * 0.5 + Math.sin(now + s * 2) * 5;
      const stY = twrY - t * 18;
      const stR = 3 + t * 7;
      ctx.globalAlpha = (1 - t) * 0.3;
      ctx.fillStyle = color + '40';
      ctx.beginPath();
      ctx.arc(stX, stY, stR, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = color + '30';
    ctx.beginPath();
    ctx.rect(bx, by, bw, bh);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
}

const DRAW_FNS = [drawBattery, drawHydro, drawGasTurbine, drawCoalPlant];

export default function ResponseTimeline({ width = 840, height = 180, delay = 0 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);       // real elapsed seconds
  const delayRef = useRef(0);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const cellW = width / SOURCES.length;
    const iconCY = 55;
    const iconW = cellW * 0.8;
    const iconH = 70;
    const labelY = iconCY + iconH / 2 + 18;
    const timerY = labelY + 18;

    let lastTime = performance.now();
    // Track scan-line progress per source (0 = not started, 1 = complete)
    const scanProgress = SOURCES.map(() => 0);

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      const nowPerf = performance.now();
      const dt = (nowPerf - lastTime) / 1000;
      lastTime = nowPerf;
      const now = nowPerf / 1000;

      if (isActive) {
        if (delayRef.current < delay) {
          delayRef.current += dt;
        } else {
          tRef.current += dt;
        }
      }

      const realT = tRef.current;
      const simMs = simTime(realT) * 1000; // simulated milliseconds

      ctx.clearRect(0, 0, width, height);

      // Subtle cell dividers
      for (let i = 1; i < SOURCES.length; i++) {
        const x = i * cellW;
        ctx.strokeStyle = colors.surfaceLight + '0a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 8);
        ctx.lineTo(x, height - 8);
        ctx.stroke();
      }

      SOURCES.forEach((src, i) => {
        const cellX = i * cellW;
        const cx = cellX + cellW / 2;
        const isOnline = simMs >= src.ms;
        const wasOffline = !isOnline;

        // Scan-line transition progress
        if (isOnline && scanProgress[i] < 1) {
          scanProgress[i] = Math.min(1, scanProgress[i] + dt * 4); // ~0.25s transition
        }
        const scanT = scanProgress[i];
        const dimColor = colors.textDim + '50';
        const activeColor = src.color;

        // Current display color — interpolate during scan
        const iconColor = scanT <= 0 ? dimColor :
          scanT >= 1 ? activeColor : activeColor;

        // Draw icon
        ctx.save();
        if (scanT > 0 && scanT < 1) {
          // Scan-line wipe: clip to revealed region (top-down)
          // First draw dim version (full), then clip and draw active version
          DRAW_FNS[i](ctx, cx, iconCY, iconW, iconH, dimColor, false, now);

          // Clip for active portion (revealed from top)
          ctx.save();
          ctx.beginPath();
          ctx.rect(cellX, 0, cellW, iconCY + iconH / 2 + 20 * scanT * 2);
          ctx.clip();
          DRAW_FNS[i](ctx, cx, iconCY, iconW, iconH, activeColor, true, now);
          ctx.restore();

          // Scan line itself
          const scanY = 10 + scanT * (timerY + 15);
          ctx.strokeStyle = activeColor;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 8;
          ctx.shadowColor = activeColor + '80';
          ctx.beginPath();
          ctx.moveTo(cellX + 8, scanY);
          ctx.lineTo(cellX + cellW - 8, scanY);
          ctx.stroke();
          ctx.shadowBlur = 0;
        } else {
          DRAW_FNS[i](ctx, cx, iconCY, iconW, iconH,
            scanT >= 1 ? activeColor : dimColor,
            scanT >= 1, now);
        }
        ctx.restore();

        // Label
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillStyle = scanT >= 1 ? activeColor : dimColor;
        ctx.fillText(src.label, cx, labelY);

        // Status badge
        if (scanT >= 1) {
          const badgeText = 'ONLINE';
          const badgeW = 48;
          ctx.fillStyle = activeColor + '18';
          ctx.beginPath();
          ctx.roundRect(cx - badgeW / 2, labelY + 3, badgeW, 13, 2);
          ctx.fill();
          ctx.strokeStyle = activeColor + '40';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.roundRect(cx - badgeW / 2, labelY + 3, badgeW, 13, 2);
          ctx.stroke();
          ctx.font = 'bold 8px JetBrains Mono';
          ctx.fillStyle = activeColor;
          ctx.fillText(badgeText, cx, labelY + 13);
        }

        // Timer
        const displayMs = isOnline ? src.ms : simMs;
        const timerText = formatTimer(Math.min(displayMs, src.ms));
        ctx.font = 'bold 16px JetBrains Mono';
        ctx.fillStyle = scanT >= 1 ? activeColor : (realT > 0 ? colors.text + '90' : dimColor);
        ctx.textAlign = 'center';
        ctx.fillText(timerText, cx, timerY + 20);
      });

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  // Reset on slide activation
  useEffect(() => {
    if (slideContext?.isSlideActive) {
      tRef.current = 0;
      delayRef.current = 0;
    }
  }, [slideContext?.isSlideActive]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}
