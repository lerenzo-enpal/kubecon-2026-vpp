import React, { useEffect, useRef, useContext, useMemo } from 'react';
import { SlideContext, useSteps } from 'spectacle';
import { colors } from '../theme';

/**
 * LargestMachineZoom — Full-slide canvas animation (4 phases, 3 arrow presses).
 *
 * Phase 0: Empty — subtle grid pulse
 * Phase 1: Wolfsburg factory appears with 60K counter
 * Phase 2: Zoom OUT from factory to EU grid. Counter 60K→2.3M.
 * Phase 3: Big "0" + ZERO DOWNTIME over the whole EU map
 */

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [200, 200, 200];
};

const EU_POSITIONS = [
  { name: 'PT', x: 0.05, y: 0.62 }, { name: 'ES', x: 0.12, y: 0.65 },
  { name: 'FR', x: 0.22, y: 0.52 }, { name: 'BE', x: 0.27, y: 0.42 },
  { name: 'NL', x: 0.28, y: 0.38 }, { name: 'DE', x: 0.35, y: 0.40 },
  { name: 'CH', x: 0.30, y: 0.50 }, { name: 'AT', x: 0.40, y: 0.48 },
  { name: 'IT', x: 0.38, y: 0.60 }, { name: 'CZ', x: 0.40, y: 0.42 },
  { name: 'PL', x: 0.48, y: 0.38 }, { name: 'DK', x: 0.33, y: 0.32 },
  { name: 'SE', x: 0.40, y: 0.18 }, { name: 'NO', x: 0.33, y: 0.15 },
  { name: 'FI', x: 0.55, y: 0.12 }, { name: 'HR', x: 0.43, y: 0.55 },
  { name: 'HU', x: 0.48, y: 0.50 }, { name: 'RO', x: 0.55, y: 0.52 },
  { name: 'BG', x: 0.58, y: 0.58 }, { name: 'GR', x: 0.55, y: 0.68 },
  { name: 'SK', x: 0.46, y: 0.45 }, { name: 'SI', x: 0.40, y: 0.52 },
  { name: 'LT', x: 0.52, y: 0.30 }, { name: 'LV', x: 0.54, y: 0.26 },
  { name: 'EE', x: 0.56, y: 0.22 }, { name: 'IE', x: 0.10, y: 0.35 },
  { name: 'GB', x: 0.16, y: 0.35 }, { name: 'RS', x: 0.50, y: 0.55 },
  { name: 'BA', x: 0.45, y: 0.56 }, { name: 'MK', x: 0.53, y: 0.60 },
  { name: 'AL', x: 0.50, y: 0.63 }, { name: 'ME', x: 0.47, y: 0.58 },
  { name: 'LU', x: 0.27, y: 0.44 }, { name: 'MT', x: 0.40, y: 0.72 },
  { name: 'CY', x: 0.68, y: 0.68 }, { name: 'TR', x: 0.72, y: 0.58 },
];

function generateWorkers(count, seed = 42) {
  const workers = [];
  let s = seed;
  const rng = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < count; i++) {
    const country = EU_POSITIONS[Math.floor(rng() * EU_POSITIONS.length)];
    workers.push({
      x: country.x + (rng() - 0.5) * 0.08,
      y: country.y + (rng() - 0.5) * 0.08,
      size: 0.6 + rng() * 0.6,
      delay: rng() * 1.0,
    });
  }
  return workers;
}

const POWER_PLANTS = [
  { x: 0.35, y: 0.38, type: 'wind' },
  { x: 0.30, y: 0.30, type: 'wind' },
  { x: 0.22, y: 0.48, type: 'nuclear' },
  { x: 0.12, y: 0.60, type: 'solar' },
  { x: 0.38, y: 0.55, type: 'solar' },
  { x: 0.48, y: 0.35, type: 'wind' },
  { x: 0.40, y: 0.15, type: 'hydro' },
  { x: 0.55, y: 0.50, type: 'nuclear' },
  { x: 0.34, y: 0.44, type: 'solar' },
  { x: 0.44, y: 0.48, type: 'nuclear' },
];

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
function liftoffEase(t) {
  // Dramatic liftoff: very slow start, accelerating pull-back like a satellite rising
  return t * t * t;
}

// ── Minimalist person: head dot + body line ──
function drawPerson(ctx, x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(0.5, size * 0.15);
  ctx.beginPath();
  ctx.arc(x, y - size * 0.85, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.6);
  ctx.lineTo(x, y + size * 0.3);
  ctx.stroke();
  ctx.restore();
}

// ── Minimalist factory: thin-line silhouette ──
function drawFactory(ctx, x, y, w, h, alpha, labelAlpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y);
  const teeth = 5, tw = w / teeth;
  for (let i = 0; i < teeth; i++) {
    ctx.lineTo(x + i * tw + tw * 0.5, y - h * 0.25);
    ctx.lineTo(x + (i + 1) * tw, y);
  }
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  // Chimney
  ctx.beginPath();
  ctx.moveTo(x + w * 0.8, y);
  ctx.lineTo(x + w * 0.8, y - h * 0.45);
  ctx.stroke();
  // Labels (fade with labelAlpha)
  if (labelAlpha > 0.01) {
    ctx.globalAlpha = alpha * labelAlpha;
    ctx.fillStyle = colors.accent;
    ctx.font = `600 ${Math.max(10, w * 0.05)}px "JetBrains Mono"`;
    ctx.textAlign = 'center';
    ctx.fillText('VW WOLFSBURG', x + w / 2, y + h + Math.max(14, w * 0.05));
    ctx.font = `${Math.max(8, w * 0.035)}px "JetBrains Mono"`;
    ctx.fillStyle = colors.textDim;
    ctx.fillText('60,000 workers  \u00b7  6.5 km\u00b2', x + w / 2, y + h + Math.max(28, w * 0.09));
  }
  ctx.restore();
}

// ── Minimalist power plant icons ──
function drawPowerPlant(ctx, x, y, size, type, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  const color = type === 'wind' ? colors.primary :
                type === 'solar' ? colors.accent :
                type === 'nuclear' ? colors.secondary : colors.success;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  if (type === 'wind') {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y - size); ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath(); ctx.moveTo(x, y - size);
      ctx.lineTo(x + Math.cos(a) * size * 0.5, y - size + Math.sin(a) * size * 0.5); ctx.stroke();
    }
  } else if (type === 'solar') {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y); ctx.lineTo(x - size * 0.3, y - size * 0.3);
    ctx.lineTo(x + size * 0.5, y - size * 0.3); ctx.lineTo(x + size * 0.3, y);
    ctx.closePath(); ctx.stroke();
  } else if (type === 'nuclear') {
    ctx.beginPath(); ctx.moveTo(x - size * 0.35, y);
    ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.5, x - size * 0.15, y - size * 0.9);
    ctx.lineTo(x + size * 0.15, y - size * 0.9);
    ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.5, x + size * 0.35, y); ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y); ctx.lineTo(x - size * 0.2, y - size * 0.7);
    ctx.lineTo(x + size * 0.2, y - size * 0.7); ctx.lineTo(x + size * 0.4, y); ctx.stroke();
  }
  ctx.restore();
}

// ── "0 DOWNTIME" HUD box (drawn in phases 2+3) ──
// Position: top-left area
const ZERO_BOX = { w: 200, h: 80 }; // styled to match counter box

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function drawZeroBox(ctx, alpha, canvasWidth) {
  const { w, h } = ZERO_BOX;
  const x = canvasWidth - w - 16; // top right
  const y = 12;
  ctx.save();
  ctx.globalAlpha = alpha;
  // Background — matches stat box styling
  ctx.fillStyle = 'rgba(26, 34, 54, 0.8)';
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  // Border — red accent
  const [dr, dg, db] = hexToRgb(colors.danger);
  ctx.strokeStyle = `rgba(${dr},${dg},${db},0.15)`;
  ctx.lineWidth = 1;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();
  // "0" — matching stat box text-[32px]
  ctx.font = '800 32px "JetBrains Mono"';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.danger;
  ctx.shadowBlur = 8;
  ctx.shadowColor = colors.danger;
  ctx.fillText('0', x + w / 2, y + 30);
  ctx.shadowBlur = 0;
  // "DOWNTIME" — matching stat box text-[16px]
  ctx.font = '500 16px "JetBrains Mono"';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('DOWNTIME', x + w / 2, y + 58);
  ctx.restore();
}

// ── Counter HUD box (drawn in phases 2+3) — matches zero box style ──
function drawCounterHUD(ctx, count, label, labelColor, alpha, width) {
  const { w: boxW, h: boxH } = ZERO_BOX; // same dimensions as zero box
  const boxX = width - boxW - 16;
  const boxY = 12 + ZERO_BOX.h + 8;
  const countStr = count.toLocaleString();

  ctx.save();
  ctx.globalAlpha = alpha;
  // Background — matches zero box
  ctx.fillStyle = 'rgba(26, 34, 54, 0.8)';
  roundRect(ctx, boxX, boxY, boxW, boxH, 8);
  ctx.fill();
  // Border — cyan accent
  const [pr, pg, pb] = hexToRgb(colors.primary);
  ctx.strokeStyle = `rgba(${pr},${pg},${pb},0.15)`;
  ctx.lineWidth = 1;
  roundRect(ctx, boxX, boxY, boxW, boxH, 8);
  ctx.stroke();

  // Count — matching zero box text-[32px]
  ctx.font = '800 32px "JetBrains Mono"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.primary;
  ctx.shadowBlur = 12;
  ctx.shadowColor = colors.primary;
  ctx.fillText(countStr, boxX + boxW / 2, boxY + 30);
  ctx.shadowBlur = 0;

  // "WORKERS" — matching zero box text-[16px]
  ctx.font = '500 16px "JetBrains Mono"';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('WORKERS', boxX + boxW / 2, boxY + 58);

  // Label below box — extra margin
  if (label) {
    ctx.font = '600 14px "JetBrains Mono"';
    ctx.textAlign = 'center';
    ctx.fillStyle = labelColor;
    ctx.fillText(label, boxX + boxW / 2, boxY + boxH + 24);
  }

  ctx.restore();
}

export default function LargestMachineZoom({ width = 1024, height = 668 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const { step: rawStep, placeholder } = useSteps(3); // -1,0,1,2 → 0,1,2,3
  const currentStepValue = rawStep + 1;
  const stepRef = useRef(0);
  const phaseTimeRef = useRef(0);
  const prevStepRef = useRef(-1);

  const gridWorkers = useMemo(() => generateWorkers(800), []);
  const sortedConnections = useMemo(() => {
    const conns = [];
    EU_POSITIONS.forEach((a, i) => {
      EU_POSITIONS.forEach((b, j) => {
        if (j <= i) return;
        if (Math.hypot(a.x - b.x, a.y - b.y) < 0.12) {
          const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
          conns.push({ a, b, dist: Math.hypot(mx - 0.35, my - 0.45) });
        }
      });
    });
    return conns.sort((a, b) => a.dist - b.dist);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now();

      if (currentStepValue !== prevStepRef.current) {
        prevStepRef.current = currentStepValue;
        stepRef.current = currentStepValue;
        phaseTimeRef.current = now;
      }

      const step = stepRef.current;
      const elapsed = (now - phaseTimeRef.current) / 1000;

      ctx.clearRect(0, 0, width, height);

      // ════════════════════════════════════════════
      // PHASE 0: Subtle grid pulse
      // ════════════════════════════════════════════
      if (step === 0) {
        ctx.save();
        ctx.globalAlpha = 0.025 + Math.sin(now / 2000) * 0.008;
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 0.5;
        for (let gx = 0; gx < width; gx += 40) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
        }
        for (let gy = 0; gy < height; gy += 40) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
        }
        ctx.restore();
      }

      // ════════════════════════════════════════════
      // PHASE 1: Big "0" ZERO DOWNTIME
      // ════════════════════════════════════════════
      if (step === 1) {
        const cx = width / 2, cy = height * 0.38;
        const [cr, cg, cb] = hexToRgb(colors.danger);

        // ── Targeting brackets — converge from edges ──
        const bracketT = Math.min(1, elapsed / 0.3);
        const bracketE = 1 - Math.pow(1 - bracketT, 3);
        const tightenT = elapsed > 0.9 ? Math.min(1, (elapsed - 0.9) / 0.3) : 0;
        const bracketBase = 140 - tightenT * 10;
        const bracketOff = bracketBase + (1 - bracketE) * 200;
        const bLen = 24;

        ctx.save();
        ctx.globalAlpha = bracketE * 0.6;
        ctx.strokeStyle = colors.danger;
        ctx.lineWidth = 2;
        // TL
        ctx.beginPath();
        ctx.moveTo(cx - bracketOff, cy - bracketOff + bLen);
        ctx.lineTo(cx - bracketOff, cy - bracketOff);
        ctx.lineTo(cx - bracketOff + bLen, cy - bracketOff);
        ctx.stroke();
        // TR
        ctx.beginPath();
        ctx.moveTo(cx + bracketOff - bLen, cy - bracketOff);
        ctx.lineTo(cx + bracketOff, cy - bracketOff);
        ctx.lineTo(cx + bracketOff, cy - bracketOff + bLen);
        ctx.stroke();
        // BL
        ctx.beginPath();
        ctx.moveTo(cx - bracketOff, cy + bracketOff - bLen);
        ctx.lineTo(cx - bracketOff, cy + bracketOff);
        ctx.lineTo(cx - bracketOff + bLen, cy + bracketOff);
        ctx.stroke();
        // BR
        ctx.beginPath();
        ctx.moveTo(cx + bracketOff - bLen, cy + bracketOff);
        ctx.lineTo(cx + bracketOff, cy + bracketOff);
        ctx.lineTo(cx + bracketOff, cy + bracketOff - bLen);
        ctx.stroke();
        ctx.restore();

        // ── Dashed crosshairs ──
        if (bracketT > 0.3) {
          ctx.save();
          ctx.globalAlpha = Math.min(1, (bracketT - 0.3) / 0.5) * 0.1;
          ctx.strokeStyle = colors.danger;
          ctx.lineWidth = 0.5;
          ctx.setLineDash([4, 8]);
          ctx.beginPath(); ctx.moveTo(cx - 300, cy); ctx.lineTo(cx + 300, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy - 200); ctx.lineTo(cx, cy + 200); ctx.stroke();
          ctx.setLineDash([]);
          ctx.restore();
        }

        // ── Digit cascade 9→0 with chromatic aberration (0.25–0.85s) ──
        const casStart = 0.25, casEnd = 0.85;
        if (elapsed >= casStart && elapsed < casEnd) {
          const casT = (elapsed - casStart) / (casEnd - casStart);
          const digit = Math.max(0, 9 - Math.floor(casT * 10));
          const dSize = 100 + casT * 50;
          const aberr = 2 + casT * 6; // RGB split increases through cascade

          // Red channel — shifted left
          ctx.save();
          ctx.font = `900 ${dSize}px "JetBrains Mono"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = 0.25 + casT * 0.15;
          ctx.fillStyle = 'rgba(255, 60, 60, 0.7)';
          ctx.fillText(String(digit), cx - aberr, cy);
          ctx.restore();

          // Blue channel — shifted right
          ctx.save();
          ctx.font = `900 ${dSize}px "JetBrains Mono"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.globalAlpha = 0.25 + casT * 0.15;
          ctx.fillStyle = 'rgba(60, 60, 255, 0.7)';
          ctx.fillText(String(digit), cx + aberr, cy);
          ctx.restore();

          // Main digit — on top
          ctx.save();
          ctx.font = `900 ${dSize}px "JetBrains Mono"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.4 + casT * 0.3})`;
          ctx.shadowBlur = 15;
          ctx.shadowColor = colors.danger;
          ctx.fillText(String(digit), cx, cy);
          ctx.shadowBlur = 0;
          ctx.restore();

          // Glitch lines on each digit change
          const glitchPhase = (casT * 10) % 1;
          if (glitchPhase < 0.2) {
            ctx.save();
            ctx.globalAlpha = 0.15;
            ctx.fillStyle = colors.danger;
            ctx.fillRect(cx - 100, cy - 25 + Math.sin(now * 0.3 + digit * 7) * 25, 200, 1.5);
            ctx.fillRect(cx - 70, cy - 15 + Math.sin(now * 0.5 + digit * 3) * 20, 140, 1);
            ctx.restore();
          }
        }

        // ── Final "0" impact (0.85s+) ──
        if (elapsed >= casEnd) {
          const impactT = Math.min(1, (elapsed - casEnd) / 0.4);
          const impactE = easeOutBack(impactT);
          const zeroSize = 150 * impactE;
          const zeroPulse = elapsed > 1.5 ? 1 + Math.sin(now / 400) * 0.02 : 1;

          // Expanding impact ring
          if (impactT < 0.8) {
            const ringT = impactT / 0.8;
            ctx.save();
            ctx.globalAlpha = (1 - ringT) * 0.3;
            ctx.strokeStyle = colors.danger;
            ctx.lineWidth = 2 * (1 - ringT);
            ctx.beginPath();
            ctx.arc(cx, cy, zeroSize * 0.4 + ringT * 160, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Subtle glow rings
          for (let ring = 3; ring >= 1; ring--) {
            const rPulse = 1 + Math.sin(now / 1000 + ring) * 0.02;
            ctx.beginPath();
            ctx.arc(cx, cy, zeroSize * 0.5 * rPulse + ring * 25, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.04 * ring * impactE})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // The "0"
          ctx.save();
          ctx.font = `900 ${zeroSize * zeroPulse}px "JetBrains Mono"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = colors.danger;
          ctx.shadowBlur = 40;
          ctx.shadowColor = colors.danger;
          ctx.fillText('0', cx, cy);
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // ── Screen flash on "0" impact ──
        if (elapsed >= 0.85 && elapsed < 1.05) {
          const flashT = (elapsed - 0.85) / 0.2;
          ctx.save();
          ctx.globalAlpha = (1 - flashT) * 0.12;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.restore();
        }

        // ── "ZERO DOWNTIME" text (1.3s+) ──
        if (elapsed > 1.3) {
          const textT = Math.min(1, (elapsed - 1.3) / 0.5);
          const textE = 1 - Math.pow(1 - textT, 3);
          ctx.save();
          ctx.globalAlpha = textE;
          ctx.font = '600 28px "JetBrains Mono"';
          ctx.textAlign = 'center';
          ctx.fillStyle = colors.danger;
          ctx.fillText('ZERO DOWNTIME', cx, cy + 105);
          ctx.font = '20px "Inter"';
          ctx.fillStyle = colors.textMuted;
          ctx.fillText('This machine has never been shut down.', cx, cy + 140);
          ctx.restore();
        }
      }

      // ════════════════════════════════════════════
      // PHASE 2: "0" shrinks into box → factory populates
      // ════════════════════════════════════════════
      if (step === 2) {
        // Sub-phase A: shrink "0" into HUD box (0–0.8s)
        const shrinkDur = 0.8;
        const shrinkT = Math.min(elapsed / shrinkDur, 1);
        const shrinkE = easeInOutCubic(shrinkT);

        // Animate "0" from center to the box position (bottom)
        const startX = width / 2, startY = height * 0.38;
        const endX = width - 16 - ZERO_BOX.w / 2, endY = 12 + 30; // top right
        const zeroX = startX + (endX - startX) * shrinkE;
        const zeroY = startY + (endY - startY) * shrinkE;
        const zeroSize = 180 * (1 - shrinkE * 0.822); // 180 → 32

        if (shrinkT < 1) {
          // Still animating — draw the shrinking "0"
          const [dr, dg, db] = hexToRgb(colors.danger);
          ctx.save();
          ctx.font = `900 ${zeroSize}px "JetBrains Mono"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(${dr},${dg},${db},${1 - shrinkE * 0.3})`;
          ctx.shadowBlur = 20 * (1 - shrinkE);
          ctx.shadowColor = colors.danger;
          ctx.fillText('0', zeroX, zeroY);
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // Draw "0 DOWNTIME" box (fades in as shrink completes)
        const boxAlpha = Math.min(1, Math.max(0, (shrinkT - 0.6) / 0.4));
        if (boxAlpha > 0) {
          drawZeroBox(ctx, boxAlpha, width);
        }

        // Sub-phase B: factory + counter populate (after shrink, 0.9s–2.2s)
        const factoryDelay = 0.9;
        const factoryT = Math.max(0, Math.min(1, (elapsed - factoryDelay) / 1.3));
        const factoryE = easeInOutCubic(factoryT);

        if (factoryT > 0) {
          // Factory in center — match phase 3's initial position
          const factoryW = 245 * factoryE;
          const factoryH = factoryW * 0.4;
          const factoryX = width / 2 - factoryW / 2;
          const factoryY = height * 0.42 - factoryH / 2;
          drawFactory(ctx, factoryX, factoryY, factoryW, factoryH, factoryE);

          // Counter HUD — 60,000 with "World's Largest Factory"
          drawCounterHUD(ctx, 60000, "World's Largest Factory", colors.accent, factoryE, width);
        }
      }

      // ════════════════════════════════════════════
      // PHASE 3: Zoom OUT from factory to EU grid
      // ════════════════════════════════════════════
      if (step === 3) {
        const t3 = Math.min(elapsed / 4.5, 1);
        const eased3 = liftoffEase(Math.min(t3, 1));

        const zoomLevel = 8.0 - eased3 * 6.8; // ends at 1.2 so EU fills more space
        const focusX = 0.35;
        const focusY = 0.40 + eased3 * 0.05;
        const mapXFn = (nx) => width / 2 + (nx - focusX) * width * zoomLevel;
        const mapYFn = (ny) => height * 0.42 + (ny - focusY) * height * zoomLevel;

        // HUD scan line
        const scanY = (now * 0.05) % height;
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = colors.primary;
        ctx.fillRect(0, scanY, width, 2);
        ctx.restore();

        // Grid connections — sweep in from center like systems coming online
        if (t3 > 0.3) {
          const lineProgress = Math.min(1, (t3 - 0.3) / 0.45);
          const visibleLines = Math.floor(lineProgress * sortedConnections.length);
          ctx.save();
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 0.5;
          for (let li = 0; li < visibleLines; li++) {
            const { a, b } = sortedConnections[li];
            const ax = mapXFn(a.x), ay = mapYFn(a.y);
            const bx = mapXFn(b.x), by = mapYFn(b.y);
            if (ax < -100 && bx < -100) continue;
            if (ax > width + 100 && bx > width + 100) continue;
            // Each line traces from a→b
            const lineStart = li / sortedConnections.length;
            const lineDrawT = Math.min(1, (lineProgress - lineStart) * 6);
            // Brief glow on appearance, then settle
            ctx.globalAlpha = lineDrawT < 0.4 ? 0.12 + (0.4 - lineDrawT) * 0.25 : 0.08;
            const ex = ax + (bx - ax) * lineDrawT;
            const ey = ay + (by - ay) * lineDrawT;
            ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ex, ey); ctx.stroke();
          }
          ctx.restore();
        }

        // Country dots — appear one by one, slow then accelerating (sonar ping)
        if (t3 > 0.1) {
          const dotProgress = Math.min(1, (t3 - 0.1) / 0.7);
          const dotEased = dotProgress * dotProgress; // ease-in: slow start, fast finish
          const visibleDots = Math.floor(dotEased * EU_POSITIONS.length);
          ctx.save();
          ctx.fillStyle = colors.primary;
          ctx.font = '8px "JetBrains Mono"';
          ctx.textAlign = 'center';
          for (let di = 0; di < visibleDots; di++) {
            const c = EU_POSITIONS[di];
            const cx = mapXFn(c.x), cy = mapYFn(c.y);
            if (cx < 0 || cx > width || cy < 0 || cy > height) continue;
            const dotT = Math.min(1, (dotEased - di / EU_POSITIONS.length) * EU_POSITIONS.length);
            // Sonar ping: brief bright flash with glow, then settle
            const isPing = dotT < 0.3;
            ctx.globalAlpha = isPing ? 0.6 : 0.3;
            if (isPing) { ctx.shadowBlur = 6; ctx.shadowColor = colors.primary; }
            ctx.beginPath();
            ctx.arc(cx, cy, isPing ? 3 : 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            if (!isPing) {
              ctx.globalAlpha = 0.2;
              ctx.fillText(c.name, cx, cy - 6);
            }
          }
          ctx.restore();
        }

        // Power plants
        if (eased3 > 0.4) {
          const ppAlpha = Math.min(1, (eased3 - 0.4) / 0.3);
          POWER_PLANTS.forEach(pp => {
            const px = mapXFn(pp.x), py = mapYFn(pp.y);
            if (px > -50 && px < width + 50 && py > -50 && py < height + 50) {
              drawPowerPlant(ctx, px, py, Math.max(4, 14 / (1 + eased3 * 2)), pp.type, ppAlpha);
            }
          });
        }

        // VW Factory — shrinks earlier than liftoff easing
        const FACTORY_WORLD_W = 0.03;
        const factoryShrink = Math.max(0.05, 1 - t3 * 3); // very fast shrink, tiny by t3=0.33
        const factoryW = Math.max(8, FACTORY_WORLD_W * width * zoomLevel * factoryShrink);
        const factoryH = factoryW * 0.4;
        const factoryX = mapXFn(0.35) - factoryW / 2;
        const factoryY = mapYFn(0.40) - factoryH / 2;
        const factoryLabelAlpha = Math.max(0, 1 - eased3 * 3); // labels gone by ~33% zoom
        drawFactory(ctx, factoryX, factoryY, factoryW, factoryH, Math.max(0.15, 1 - eased3 * 0.7), factoryLabelAlpha);

        // Grid workers
        const revealProgress = Math.max(0, (eased3 - 0.15) / 0.85);
        const visibleCount = Math.floor(revealProgress * gridWorkers.length);
        for (let i = 0; i < visibleCount; i++) {
          const w = gridWorkers[i];
          const px = mapXFn(w.x), py = mapYFn(w.y);
          if (px < -20 || px > width + 20 || py < -20 || py > height + 20) continue;
          const appearT = Math.min(1, (revealProgress - (i / gridWorkers.length)) * 5);
          const pSize = Math.max(1.5, 4 * (1 - eased3 * 0.5)) * w.size;
          drawPerson(ctx, px, py, pSize, colors.primary, appearT * (0.5 + Math.sin(now / 800 + i * 0.3) * 0.15));
        }

        // "0 DOWNTIME" box — persists from phase 2
        drawZeroBox(ctx, 1, width);

        // Counter HUD — ticks from 60K to 2.3M
        const displayCount = Math.floor(60000 + eased3 * (2300000 - 60000));
        let label = "World's Largest Factory";
        let labelColor = colors.accent;
        if (eased3 > 0.08) { label = null; }
        if (eased3 > 0.85) { label = 'European Power Grid'; labelColor = colors.primary; }
        drawCounterHUD(ctx, displayCount, label, labelColor, 1, width);

      }

      // ── CRT vignette — dark edges, always on ──
      ctx.save();
      const vig = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.3,
        width / 2, height / 2, Math.max(width, height) * 0.75
      );
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive, currentStepValue]);

  return (
    <>
      {placeholder}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: 1, pointerEvents: 'none',
        }}
      />
    </>
  );
}
