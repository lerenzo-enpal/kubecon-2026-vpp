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
  // Multiple homes connected to a central VPP hub
  const hubR = 8;
  const homeSize = 9;
  const spread = Math.min(w * 0.38, 38);
  const hubY = cy + 2;

  // 6 mini homes around the hub
  const homes = [
    { x: cx - spread,     y: hubY - spread * 0.6 },
    { x: cx,              y: hubY - spread * 0.75 },
    { x: cx + spread,     y: hubY - spread * 0.6 },
    { x: cx - spread * 0.8, y: hubY + spread * 0.5 },
    { x: cx,              y: hubY + spread * 0.65 },
    { x: cx + spread * 0.8, y: hubY + spread * 0.5 },
  ];

  // Connection lines to hub
  homes.forEach((hm) => {
    ctx.strokeStyle = color + (active ? '35' : '18');
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(hm.x, hm.y);
    ctx.lineTo(cx, hubY);
    ctx.stroke();
  });

  // Flow dashes when active
  if (active) {
    homes.forEach((hm, i) => {
      const dashPhase = (now * 2 + i * 0.5) % 1;
      const fx = hm.x + (cx - hm.x) * dashPhase;
      const fy = hm.y + (hubY - hm.y) * dashPhase;
      ctx.globalAlpha = 1 - dashPhase;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(fx, fy, 1.2, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // Hub circle
  ctx.beginPath();
  ctx.arc(cx, hubY, hubR, 0, Math.PI * 2);
  ctx.strokeStyle = color + (active ? 'cc' : '60');
  ctx.lineWidth = 1.5;
  ctx.fillStyle = color + (active ? '20' : '08');
  ctx.fill();
  if (active) {
    ctx.shadowBlur = 10;
    ctx.shadowColor = color + '60';
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // VPP label in hub
  ctx.font = 'bold 7px JetBrains Mono';
  ctx.fillStyle = color + (active ? 'ee' : '60');
  ctx.textAlign = 'center';
  ctx.fillText('VPP', cx, hubY + 2.5);

  // Mini house icons
  homes.forEach((hm) => {
    const s = homeSize;
    const bw = s;
    const bh = s * 0.5;
    const rh = s * 0.4;
    const bodyTop = hm.y + rh * 0.1;

    // Roof
    ctx.beginPath();
    ctx.moveTo(hm.x, bodyTop - rh);
    ctx.lineTo(hm.x - bw / 2 - 0.5, bodyTop);
    ctx.lineTo(hm.x + bw / 2 + 0.5, bodyTop);
    ctx.closePath();
    ctx.fillStyle = color + (active ? '90' : '30');
    ctx.fill();

    // Body
    ctx.beginPath();
    ctx.rect(hm.x - bw / 2, bodyTop, bw, bh);
    ctx.fillStyle = color + (active ? '90' : '30');
    ctx.fill();
  });
}

function drawHydro(ctx, cx, cy, w, h, color, active, now) {
  // Dam with reservoir on left, turbine house + generator on right
  const damW = w * 0.12;
  const damH = h * 0.6;
  const damX = cx - 8;
  const damY = cy - damH / 2 + 6;
  const taper = damW * 0.2;

  // Dam wall (thick trapezoid)
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(damX + taper, damY);
  ctx.lineTo(damX + damW - taper, damY);
  ctx.lineTo(damX + damW + 2, damY + damH);
  ctx.lineTo(damX - 2, damY + damH);
  ctx.closePath();
  ctx.stroke();

  // Reservoir water (left of dam)
  const resW = w * 0.3;
  ctx.fillStyle = color + (active ? '25' : '0c');
  ctx.beginPath();
  ctx.moveTo(damX - resW, damY + 4);
  // Wavy top surface
  for (let wx = 0; wx <= resW; wx += 4) {
    const wy = active ? Math.sin(now * 2 + wx * 0.3) * 1.5 : 0;
    ctx.lineTo(damX - resW + wx, damY + 4 + wy);
  }
  ctx.lineTo(damX, damY + damH);
  ctx.lineTo(damX - resW, damY + damH);
  ctx.closePath();
  ctx.fill();

  // Reservoir outline
  ctx.strokeStyle = color + '40';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(damX - resW, damY + 4);
  for (let wx = 0; wx <= resW; wx += 4) {
    const wy = active ? Math.sin(now * 2 + wx * 0.3) * 1.5 : 0;
    ctx.lineTo(damX - resW + wx, damY + 4 + wy);
  }
  ctx.stroke();

  // Penstock (pipe from dam to turbine)
  const turbX = damX + damW + 12;
  const turbY = damY + damH - 12;
  ctx.strokeStyle = color + (active ? '80' : '30');
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(damX + damW, damY + damH * 0.6);
  ctx.lineTo(turbX, turbY);
  ctx.stroke();

  // Water flow through penstock when active
  if (active) {
    for (let d = 0; d < 3; d++) {
      const t = ((now * 2.5 + d * 0.33) % 1);
      const fx = (damX + damW) + (turbX - damX - damW) * t;
      const fy = (damY + damH * 0.6) + (turbY - damY - damH * 0.6) * t;
      ctx.globalAlpha = 0.8 - t * 0.6;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(fx, fy, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Turbine house (small building)
  const thW = 16;
  const thH = 14;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.rect(turbX - 2, turbY - thH + 4, thW, thH);
  ctx.stroke();
  if (active) {
    ctx.fillStyle = color + '25';
    ctx.fill();
  }

  // Turbine symbol (circle inside building)
  const tCx = turbX + thW / 2 - 2;
  const tCy = turbY - thH / 2 + 4;
  ctx.beginPath();
  ctx.arc(tCx, tCy, 4, 0, Math.PI * 2);
  ctx.strokeStyle = color + (active ? 'aa' : '40');
  ctx.lineWidth = 1;
  ctx.stroke();
  if (active) {
    // Spinning blades
    for (let b = 0; b < 3; b++) {
      const angle = now * 4 + b * (Math.PI * 2 / 3);
      ctx.beginPath();
      ctx.moveTo(tCx, tCy);
      ctx.lineTo(tCx + Math.cos(angle) * 3.5, tCy + Math.sin(angle) * 3.5);
      ctx.strokeStyle = color + 'cc';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  // Generator building (connected via line to turbine)
  const genX = turbX + thW + 8;
  const genY = turbY - thH + 4;
  const genW = 14;
  const genH = thH;

  // Connection shaft
  ctx.strokeStyle = color + (active ? '60' : '25');
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(turbX + thW - 2, tCy);
  ctx.lineTo(genX, tCy);
  ctx.stroke();

  // Generator box
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.rect(genX, genY, genW, genH);
  ctx.stroke();
  if (active) {
    ctx.fillStyle = color + '20';
    ctx.fill();
    // G label
    ctx.font = 'bold 7px JetBrains Mono';
    ctx.fillStyle = color + 'cc';
    ctx.textAlign = 'center';
    ctx.fillText('G', genX + genW / 2, genY + genH / 2 + 2.5);
  }

  // Transmission lines out (right of generator)
  if (active) {
    ctx.strokeStyle = color + '50';
    ctx.lineWidth = 0.8;
    for (let l = 0; l < 2; l++) {
      const ly = genY + genH * 0.3 + l * genH * 0.4;
      ctx.beginPath();
      ctx.moveTo(genX + genW, ly);
      ctx.lineTo(genX + genW + 10, ly + (l === 0 ? -3 : 3));
      ctx.stroke();
    }

    // Dam glow
    ctx.shadowBlur = 8;
    ctx.shadowColor = color + '40';
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(damX + taper, damY);
    ctx.lineTo(damX + damW - taper, damY);
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

export default function ResponseTimeline({ width = 840, height = 180, delay = 0, racing = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);       // real elapsed seconds
  const delayRef = useRef(0);
  const racingRef = useRef(false);
  const slideContext = useContext(SlideContext);

  // Track when racing starts
  if (racing && !racingRef.current) {
    racingRef.current = true;
    tRef.current = 0;
    delayRef.current = 0;
  }

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

      if (isActive && racingRef.current) {
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
      racingRef.current = false;
    }
  }, [slideContext?.isSlideActive]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}
