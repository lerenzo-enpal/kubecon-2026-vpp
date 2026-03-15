import React, { useEffect, useRef, useContext, useMemo } from 'react';
import { SlideContext, useSteps } from 'spectacle';
import { colors } from '../theme';

/**
 * LargestMachineZoom — Full-slide canvas animation.
 *
 * Phase 0: Stat boxes at bottom, main stage has subtle grid pulse
 * Phase 1: Big "0" with "ZERO DOWNTIME" appears dramatically
 * Phase 2: Zoom-OUT from VW factory (60K) to EU grid (2.3M workers)
 *
 * Sleek spy-movie / mission-control aesthetic:
 *  - Minimalist line-art factory silhouette
 *  - Abstract person icons (thin vertical stroke + head dot)
 *  - Glowing HUD-style overlays, scan lines
 */

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [200, 200, 200];
};

// Rough EU country center positions (normalized 0-1)
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

// Pre-generate worker positions scattered across EU
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

// Power plant icons scattered across Europe
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
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// ── Sleek minimalist person: thin vertical line + circle head ──
function drawPerson(ctx, x, y, size, color, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(0.5, size * 0.15);
  // Head — small filled circle
  ctx.beginPath();
  ctx.arc(x, y - size * 0.85, size * 0.22, 0, Math.PI * 2);
  ctx.fill();
  // Body — single thin line
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.6);
  ctx.lineTo(x, y + size * 0.3);
  ctx.stroke();
  ctx.restore();
}

// ── Sleek minimalist factory: thin-line silhouette, sawtooth roof ──
function drawFactory(ctx, x, y, w, h, alpha, now) {
  ctx.save();
  ctx.globalAlpha = alpha;

  // Main building outline
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y);
  // Sawtooth roof
  const teeth = 5;
  const tw = w / teeth;
  for (let i = 0; i < teeth; i++) {
    ctx.lineTo(x + i * tw + tw * 0.5, y - h * 0.25);
    ctx.lineTo(x + (i + 1) * tw, y);
  }
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  // Chimney — thin line
  ctx.beginPath();
  ctx.moveTo(x + w * 0.8, y);
  ctx.lineTo(x + w * 0.8, y - h * 0.45);
  ctx.stroke();

  // Subtle window glow — horizontal dashes
  ctx.strokeStyle = `rgba(245, 158, 11, ${0.25 * alpha})`;
  ctx.lineWidth = 1;
  const rows = 2, cols = 5;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + w * 0.06 + c * (w * 0.18);
      const wy = y + h * 0.25 + r * (h * 0.32);
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + w * 0.1, wy);
      ctx.stroke();
    }
  }

  // HUD label — factory name
  ctx.fillStyle = colors.accent;
  ctx.font = `600 ${Math.max(10, w * 0.05)}px "JetBrains Mono"`;
  ctx.textAlign = 'center';
  ctx.letterSpacing = '0.1em';
  ctx.fillText('VW WOLFSBURG', x + w / 2, y + h + Math.max(14, w * 0.05));
  ctx.font = `${Math.max(8, w * 0.035)}px "JetBrains Mono"`;
  ctx.fillStyle = colors.textDim;
  ctx.fillText('60,000 workers  ·  6.5 km²', x + w / 2, y + h + Math.max(28, w * 0.09));
  ctx.restore();
}

// ── Minimalist power plant icons ──
function drawPowerPlant(ctx, x, y, size, type, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  const color = type === 'wind' ? colors.primary :
                type === 'solar' ? colors.accent :
                type === 'nuclear' ? colors.secondary :
                colors.success;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  if (type === 'wind') {
    // Simple turbine — vertical line + 3 short blades
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x, y - size);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + Math.cos(angle) * size * 0.5, y - size + Math.sin(angle) * size * 0.5);
      ctx.stroke();
    }
  } else if (type === 'solar') {
    // Tilted rectangle
    ctx.beginPath();
    ctx.moveTo(x - size * 0.5, y); ctx.lineTo(x - size * 0.3, y - size * 0.3);
    ctx.lineTo(x + size * 0.5, y - size * 0.3); ctx.lineTo(x + size * 0.3, y);
    ctx.closePath();
    ctx.stroke();
  } else if (type === 'nuclear') {
    // Cooling tower outline
    ctx.beginPath();
    ctx.moveTo(x - size * 0.35, y);
    ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.5, x - size * 0.15, y - size * 0.9);
    ctx.lineTo(x + size * 0.15, y - size * 0.9);
    ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.5, x + size * 0.35, y);
    ctx.stroke();
  } else {
    // Dam shape
    ctx.beginPath();
    ctx.moveTo(x - size * 0.4, y); ctx.lineTo(x - size * 0.2, y - size * 0.7);
    ctx.lineTo(x + size * 0.2, y - size * 0.7); ctx.lineTo(x + size * 0.4, y);
    ctx.stroke();
  }
  ctx.restore();
}

export default function LargestMachineZoom({ width = 1024, height = 668 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const { step: rawStep, placeholder } = useSteps(2);
  const currentStepValue = rawStep + 1; // -1→0, 0→1, 1→2
  const stepRef = useRef(0);
  const phaseTimeRef = useRef(0);
  const prevStepRef = useRef(-1);

  const gridWorkers = useMemo(() => generateWorkers(800), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now();

      // Track phase transitions
      if (currentStepValue !== prevStepRef.current) {
        prevStepRef.current = currentStepValue;
        stepRef.current = currentStepValue;
        phaseTimeRef.current = now;
      }

      const currentStep = stepRef.current;
      const phaseElapsed = (now - phaseTimeRef.current) / 1000;

      ctx.clearRect(0, 0, width, height);

      // ── Phase 0: Subtle grid pulse ──
      if (currentStep === 0) {
        ctx.save();
        ctx.globalAlpha = 0.025 + Math.sin(now / 2000) * 0.008;
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 0.5;
        for (let x = 0; x < width; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0); ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y); ctx.lineTo(width, y);
          ctx.stroke();
        }
        ctx.restore();
      }

      // ── Phase 1: Big ZERO DOWNTIME ──
      if (currentStep >= 1) {
        const t1 = currentStep === 1 ? Math.min(phaseElapsed / 1.2, 1) : 1;
        const eased = easeOutBack(Math.min(t1, 1));

        if (currentStep === 1) {
          const zeroSize = 180 * eased;
          const zeroPulse = 1 + Math.sin(now / 400) * 0.02;
          const [cr, cg, cb] = hexToRgb(colors.danger);

          // Glow rings
          for (let ring = 3; ring >= 1; ring--) {
            ctx.beginPath();
            ctx.arc(width / 2, height * 0.38, zeroSize * 0.5 + ring * 20, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.04 * ring * eased})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // The zero
          ctx.save();
          ctx.font = `900 ${zeroSize * zeroPulse}px "JetBrains Mono"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = colors.danger;
          ctx.shadowBlur = 40;
          ctx.shadowColor = colors.danger;
          ctx.fillText('0', width / 2, height * 0.38);
          ctx.shadowBlur = 0;
          ctx.restore();

          // "ZERO DOWNTIME" text
          const textAlpha = Math.max(0, (t1 - 0.4) / 0.6);
          ctx.save();
          ctx.globalAlpha = textAlpha;
          ctx.font = '600 28px "JetBrains Mono"';
          ctx.textAlign = 'center';
          ctx.fillStyle = colors.danger;
          ctx.fillText('ZERO DOWNTIME', width / 2, height * 0.38 + zeroSize * 0.45 + 30);
          ctx.font = '18px "Inter"';
          ctx.fillStyle = colors.textMuted;
          ctx.fillText('This machine has never been shut down. It cannot stop.', width / 2, height * 0.38 + zeroSize * 0.45 + 60);
          ctx.restore();
        }
      }

      // ── Phase 2: Zoom OUT from factory to EU grid ──
      if (currentStep >= 2) {
        const t2 = Math.min(phaseElapsed / 4.5, 1);
        const eased2 = easeInOutCubic(Math.min(t2, 1));

        // Zoom: start zoomed in on factory (high zoom), zoom out to full EU
        const zoomLevel = 8.0 - eased2 * 7.5; // 8.0 → 0.5
        const focusX = 0.35;
        const focusY = 0.40 + eased2 * 0.05;

        const mapX = (nx) => width / 2 + (nx - focusX) * width * zoomLevel;
        const mapY = (ny) => height * 0.42 + (ny - focusY) * height * zoomLevel;

        // HUD scan line effect
        const scanY = (now * 0.05) % height;
        ctx.save();
        ctx.globalAlpha = 0.03;
        ctx.fillStyle = colors.primary;
        ctx.fillRect(0, scanY, width, 2);
        ctx.restore();

        // Grid connections (appear as we zoom out)
        if (eased2 > 0.3) {
          const outlineAlpha = Math.min(1, (eased2 - 0.3) / 0.3) * 0.08;
          ctx.save();
          ctx.globalAlpha = outlineAlpha;
          ctx.strokeStyle = colors.primary;
          ctx.lineWidth = 0.5;
          EU_POSITIONS.forEach((a, i) => {
            EU_POSITIONS.forEach((b, j) => {
              if (j <= i) return;
              const dist = Math.hypot(a.x - b.x, a.y - b.y);
              if (dist < 0.12) {
                const ax = mapX(a.x), ay = mapY(a.y);
                const bx = mapX(b.x), by = mapY(b.y);
                if ((ax > -100 && ax < width + 100) || (bx > -100 && bx < width + 100)) {
                  ctx.beginPath();
                  ctx.moveTo(ax, ay);
                  ctx.lineTo(bx, by);
                  ctx.stroke();
                }
              }
            });
          });
          ctx.restore();
        }

        // Country label dots (appear late)
        if (eased2 > 0.6) {
          const dotAlpha = Math.min(1, (eased2 - 0.6) / 0.3) * 0.3;
          ctx.save();
          ctx.globalAlpha = dotAlpha;
          ctx.fillStyle = colors.primary;
          ctx.font = '8px "JetBrains Mono"';
          ctx.textAlign = 'center';
          EU_POSITIONS.forEach(c => {
            const cx = mapX(c.x), cy = mapY(c.y);
            if (cx > 0 && cx < width && cy > 0 && cy < height) {
              ctx.beginPath();
              ctx.arc(cx, cy, 2, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillText(c.name, cx, cy - 6);
            }
          });
          ctx.restore();
        }

        // Power plants
        if (eased2 > 0.4) {
          const ppAlpha = Math.min(1, (eased2 - 0.4) / 0.3);
          POWER_PLANTS.forEach(pp => {
            const px = mapX(pp.x), py = mapY(pp.y);
            if (px > -50 && px < width + 50 && py > -50 && py < height + 50) {
              const ppSize = Math.max(4, 14 / (1 + eased2 * 2));
              drawPowerPlant(ctx, px, py, ppSize, pp.type, ppAlpha);
            }
          });
        }

        // VW Factory — uses mapX/mapY so it naturally shrinks with zoom
        const FACTORY_WORLD_W = 0.03; // width in normalized coords
        const factoryW = Math.max(8, FACTORY_WORLD_W * width * zoomLevel);
        const factoryH = factoryW * 0.4;
        const factoryX = mapX(0.35) - factoryW / 2;
        const factoryY = mapY(0.40) - factoryH / 2;
        const factoryAlpha = Math.max(0.15, 1 - eased2 * 0.7);
        drawFactory(ctx, factoryX, factoryY, factoryW, factoryH, factoryAlpha, now);

        // VW workers near factory (fade out as we zoom out)
        if (eased2 < 0.5) {
          const vwAlpha = 1 - eased2 / 0.5;
          const personSize = Math.max(2, factoryW * 0.04);
          for (let i = 0; i < 6; i++) {
            const px = factoryX + factoryW * (0.15 + (i % 3) * 0.3);
            const py = factoryY + factoryH + personSize + Math.floor(i / 3) * (personSize * 2.5);
            drawPerson(ctx, px, py, personSize, colors.accent, vwAlpha);
          }
        }

        // Grid workers (appear progressively as we zoom out)
        const workerRevealProgress = Math.max(0, (eased2 - 0.15) / 0.85);
        const visibleWorkers = Math.floor(workerRevealProgress * gridWorkers.length);

        for (let i = 0; i < visibleWorkers; i++) {
          const w = gridWorkers[i];
          const px = mapX(w.x), py = mapY(w.y);
          if (px < -20 || px > width + 20 || py < -20 || py > height + 20) continue;

          const appearT = Math.min(1, (workerRevealProgress - (i / gridWorkers.length)) * 5);
          const personSize = Math.max(1.5, 4 * (1 - eased2 * 0.5)) * w.size;
          const pulse = 0.5 + Math.sin(now / 800 + i * 0.3) * 0.15;
          drawPerson(ctx, px, py, personSize, colors.primary, appearT * pulse);
        }

        // ── Counter HUD — top right ──
        // Starts at 60,000 (Wolfsburg), ticks up to 2,300,000 (EU grid)
        {
          const countAlpha = Math.min(1, phaseElapsed / 0.4); // fade in quickly
          // Counter: 60K at start, ramp to 2.3M with eased2
          const displayCount = Math.floor(60000 + eased2 * (2300000 - 60000));
          const countStr = displayCount.toLocaleString();

          ctx.save();
          ctx.globalAlpha = countAlpha;

          // HUD box
          const boxW = 210, boxH = 52;
          const boxX = width - boxW - 16, boxY = 12;
          ctx.fillStyle = 'rgba(2, 4, 8, 0.75)';
          ctx.fillRect(boxX, boxY, boxW, boxH);
          ctx.strokeStyle = `${colors.primary}30`;
          ctx.lineWidth = 1;
          ctx.strokeRect(boxX, boxY, boxW, boxH);

          // Number
          ctx.font = 'bold 28px "JetBrains Mono"';
          ctx.textAlign = 'right';
          ctx.fillStyle = colors.primary;
          ctx.shadowBlur = 12;
          ctx.shadowColor = colors.primary;
          ctx.fillText(countStr, width - 24, boxY + 28);
          ctx.shadowBlur = 0;

          // Small label inside box
          ctx.font = '11px "JetBrains Mono"';
          ctx.fillStyle = colors.textDim;
          ctx.fillText('WORKERS', width - 24, boxY + 44);

          // Label below box — transitions from "World's Largest Factory" → (gone) → "European Power Grid"
          const labelY = boxY + boxH + 14;
          ctx.textAlign = 'right';

          if (eased2 < 0.08) {
            // "World's Largest Factory" visible at start
            const labelAlpha = 1 - eased2 / 0.08;
            ctx.globalAlpha = countAlpha * labelAlpha;
            ctx.font = '600 11px "JetBrains Mono"';
            ctx.fillStyle = colors.accent;
            ctx.fillText("World's Largest Factory", width - 24, labelY);
          } else if (eased2 > 0.85) {
            // "European Power Grid" fades in at end
            const labelAlpha = Math.min(1, (eased2 - 0.85) / 0.15);
            ctx.globalAlpha = countAlpha * labelAlpha;
            ctx.font = '600 11px "JetBrains Mono"';
            ctx.fillStyle = colors.primary;
            ctx.fillText('European Power Grid', width - 24, labelY);
          }

          ctx.restore();
        }

        // VW comparison — bottom left HUD (appears mid-animation)
        if (eased2 > 0.5) {
          const compAlpha = Math.min(1, (eased2 - 0.5) / 0.3);
          ctx.save();
          ctx.globalAlpha = compAlpha * 0.8;

          const cBoxW = 280, cBoxH = 28;
          const cBoxX = 16, cBoxY = height - cBoxH - 16;
          ctx.fillStyle = 'rgba(2, 4, 8, 0.7)';
          ctx.fillRect(cBoxX, cBoxY, cBoxW, cBoxH);
          ctx.strokeStyle = `${colors.accent}30`;
          ctx.lineWidth = 1;
          ctx.strokeRect(cBoxX, cBoxY, cBoxW, cBoxH);

          const displayCount = Math.floor(60000 + eased2 * (2300000 - 60000));
          ctx.font = '600 12px "JetBrains Mono"';
          ctx.textAlign = 'left';
          ctx.fillStyle = colors.accent;
          ctx.fillText('VW WOLFSBURG: 60,000', cBoxX + 8, cBoxY + 18);
          ctx.fillStyle = colors.textDim;
          ctx.fillText(`  \u00d7${Math.floor(displayCount / 60000)}`, cBoxX + 172, cBoxY + 18);
          ctx.restore();
        }

        // Animated "0" shrinking from center (phase 2 transition)
        const shrinkT = Math.min(1, phaseElapsed / 0.6);
        const shrinkEased = easeInOutCubic(shrinkT);
        if (shrinkT < 1) {
          const [dr, dg, db] = hexToRgb(colors.danger);
          const zeroSize = 180 * (1 - shrinkEased * 0.88);
          const zeroX = width / 2 + shrinkEased * (-width / 2 + 50);
          const zeroY = height * 0.38 + shrinkEased * (height * 0.55 - height * 0.38);

          ctx.save();
          ctx.font = `900 ${zeroSize}px "JetBrains Mono"`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(${dr},${dg},${db},${1 - shrinkEased * 0.5})`;
          ctx.shadowBlur = 20 * (1 - shrinkEased);
          ctx.shadowColor = colors.danger;
          ctx.fillText('0', zeroX, zeroY);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

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
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          pointerEvents: 'none',
        }}
      />
    </>
  );
}
