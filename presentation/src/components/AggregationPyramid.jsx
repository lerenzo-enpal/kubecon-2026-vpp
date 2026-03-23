import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * AggregationPyramid — Horizontal funnel showing progressive aggregation
 * Wide left (20s raw) → narrow right (24hr)
 * 20s ×3→ 1min ×5→ 5min ×3→ 15min ×4→ 1hr ×24→ 24hr
 *
 * Homes (col 0) are always full and emit dots on staggered timers.
 * Downstream circles start empty, fill as dots arrive (fill gauge),
 * then fire onward when full and reset to empty.
 */

const LEVELS = [
  { label: '20s',   count: 24, ratio: null, color: '#E25A1C', r: 5 },
  { label: '1 min', count: 8,  ratio: 3,    color: '#FF3621', r: 9 },
  { label: '5 min', count: 5,  ratio: 5,    color: '#FF3621', r: 14 },
  { label: '15 min',count: 3,  ratio: 3,    color: colors.accent, r: 19 },
  { label: '1 hr',  count: 2,  ratio: 4,    color: colors.primary, r: 25 },
  { label: '24 hr', count: 1,  ratio: 24,   color: colors.success, r: 34 },
];

export default function AggregationPyramid({ width = 1100, height = 500 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const mergesRef = useRef([]);
  const flowRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padX = 50;
    const padY = 55;
    const colCount = LEVELS.length;
    const colW = (width - padX * 2) / colCount;
    const centerY = height / 2;

    // Compute column positions and vertical spread (pyramid shape)
    const maxSpread = height - padY * 2;
    const columns = LEVELS.map((level, i) => {
      const spreadFrac = 1 - (i / (colCount - 1)) * 0.85;
      const spread = maxSpread * spreadFrac;
      const x = padX + i * colW + colW / 2;
      const items = [];
      for (let j = 0; j < level.count; j++) {
        const t = level.count === 1 ? 0.5 : j / (level.count - 1);
        items.push({
          x,
          y: centerY - spread / 2 + t * spread,
          r: level.r,
        });
      }
      return { ...level, x, spread, items };
    });

    const merges = mergesRef.current;
    const flows = flowRef.current;
    merges.length = 0;
    flows.length = 0;

    const startTime = performance.now() / 1000;

    // ── Bubble fill state ──
    // Homes (col 0): always full, fire on independent staggered timers
    const homeTimers = columns[0].items.map((_, ii) => ({
      nextFire: startTime + ii * 0.035 + Math.random() * 0.3,
      period: 0.45 + Math.random() * 0.35,
    }));

    // Downstream columns: track fill count per bubble
    const fills = new Array(colCount);
    for (let ci = 1; ci < colCount; ci++) {
      fills[ci] = columns[ci].items.map(() => ({
        count: 0,
        flashTime: -1,
      }));
    }

    // Helper: find target bubble index when source (ci, ii) fires to ci+1
    function getTargetIdx(ci, ii) {
      const toCol = columns[ci + 1];
      return Math.min(
        Math.floor(ii / toCol.ratio),
        toCol.items.length - 1,
      );
    }

    // Helper: spawn a flow dot from (fromCol, fromItem) → target in toCol
    function spawnFlow(fromColIdx, fromItemIdx, toColIdx) {
      const fromCol = columns[fromColIdx];
      const toCol = columns[toColIdx];
      const source = fromCol.items[fromItemIdx];
      const ti = getTargetIdx(fromColIdx, fromItemIdx);
      const target = toCol.items[ti];
      if (!source || !target) return;

      const lvl = fromColIdx;
      flows.push({
        sx: source.x + source.r + 2, sy: source.y,
        tx: target.x - target.r - 2, ty: target.y,
        mx: (source.x + target.x) / 2, my: (source.y + target.y) / 2,
        progress: 0,
        speed: 0.012 + lvl * 0.002 + Math.random() * 0.006,
        color: toCol.color,
        size: 2 + lvl * 0.4 + Math.random() * 1.5,
        targetCol: toColIdx,
        targetIdx: ti,
      });
    }

    // Pre-seed: give downstream bubbles random partial fills so the
    // pipeline looks active from the moment the slide opens
    for (let ci = 1; ci < colCount; ci++) {
      fills[ci].forEach(b => {
        b.count = Math.floor(Math.random() * columns[ci].ratio);
      });
    }
    // Pre-seed some dots already in flight
    for (let k = 0; k < 10; k++) {
      const lvl = Math.floor(Math.random() * (colCount - 1));
      const fromCol = columns[lvl];
      const toCol = columns[lvl + 1];
      const si = Math.floor(Math.random() * fromCol.items.length);
      const ti = Math.min(Math.floor(si / toCol.ratio), toCol.items.length - 1);
      const source = fromCol.items[si];
      const target = toCol.items[ti];
      if (source && target) {
        flows.push({
          sx: source.x + source.r + 2, sy: source.y,
          tx: target.x - target.r - 2, ty: target.y,
          mx: (source.x + target.x) / 2, my: (source.y + target.y) / 2,
          progress: Math.random() * 0.7,
          speed: 0.012 + lvl * 0.002 + Math.random() * 0.006,
          color: toCol.color,
          size: 2 + lvl * 0.4 + Math.random() * 1.5,
          targetCol: lvl + 1,
          targetIdx: ti,
        });
      }
    }

    function draw() {
      const now = performance.now() / 1000;
      const isActive = slideContext?.isSlideActive;
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

      // Draw pyramid outline (funnel shape)
      ctx.beginPath();
      ctx.moveTo(columns[0].x - colW * 0.35, centerY - maxSpread / 2 - 5);
      columns.forEach((col) => {
        ctx.lineTo(col.x + colW * 0.3, centerY - col.spread / 2 - 5);
      });
      ctx.lineTo(columns[colCount - 1].x + colW * 0.3, centerY + columns[colCount - 1].spread / 2 + 5);
      for (let i = colCount - 1; i >= 0; i--) {
        ctx.lineTo(columns[i].x - (i === 0 ? colW * 0.35 : -colW * 0.3), centerY + columns[i].spread / 2 + 5);
      }
      ctx.closePath();
      ctx.fillStyle = colors.surfaceLight + '04';
      ctx.fill();
      ctx.strokeStyle = colors.surfaceLight + '12';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw merge connection lines between adjacent columns
      for (let i = 0; i < colCount - 1; i++) {
        const fromCol = columns[i];
        const toCol = columns[i + 1];
        const ratio = toCol.ratio;

        toCol.items.forEach((target, ti) => {
          const startIdx = Math.min(ti * ratio, fromCol.items.length - ratio);
          for (let si = startIdx; si < Math.min(startIdx + ratio, fromCol.items.length); si++) {
            const source = fromCol.items[si];
            if (!source) continue;
            ctx.beginPath();
            ctx.moveTo(source.x + source.r + 2, source.y);
            ctx.quadraticCurveTo(
              (source.x + target.x) / 2,
              (source.y + target.y) / 2,
              target.x - target.r - 2,
              target.y
            );
            ctx.strokeStyle = toCol.color + '12';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      }

      // ── Update: Home timers → spawn dots ──
      if (isActive) {
        homeTimers.forEach((home, hi) => {
          if (now >= home.nextFire) {
            home.nextFire = now + home.period;
            spawnFlow(0, hi, 1);
          }
        });
      }

      // ── Update & draw flow particles ──
      for (let i = flows.length - 1; i >= 0; i--) {
        const f = flows[i];
        if (isActive) f.progress += f.speed;
        if (f.progress > 1) {
          // Dot arrived — increment target fill
          const tci = f.targetCol;
          const tii = f.targetIdx;
          if (tci >= 1 && fills[tci] && fills[tci][tii]) {
            fills[tci][tii].count++;

            // Check if full → fire to next level and reset
            if (fills[tci][tii].count >= columns[tci].ratio) {
              fills[tci][tii].count = 0;
              fills[tci][tii].flashTime = now;
              if (tci < colCount - 1) {
                spawnFlow(tci, tii, tci + 1);
              }
            }
          }

          merges.push({ x: f.tx, y: f.ty, t: now, color: f.color, r: 8 });
          flows.splice(i, 1);
          continue;
        }

        const t = f.progress;
        const px = (1-t)*(1-t)*f.sx + 2*(1-t)*t*f.mx + t*t*f.tx;
        const py = (1-t)*(1-t)*f.sy + 2*(1-t)*t*f.my + t*t*f.ty;

        ctx.beginPath();
        ctx.arc(px, py, f.size, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = f.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw merge flash effects
      for (let i = merges.length - 1; i >= 0; i--) {
        const e = merges[i];
        const age = now - e.t;
        if (age > 0.4) { merges.splice(i, 1); continue; }
        const p = age / 0.4;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + p * 12, 0, Math.PI * 2);
        ctx.strokeStyle = e.color + Math.round((1 - p) * 80).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5 * (1 - p);
        ctx.stroke();
      }

      // ── Draw bubbles at each level ──
      columns.forEach((col, ci) => {
        const pulse = 0.5 + 0.5 * Math.sin(now * 1.5 + ci * 1.2);

        col.items.forEach((item, ii) => {
          if (ci === 0) {
            // ── Homes: always fully filled ──
            const s = item.r * 1.6;
            const bw = s;
            const bh = s * 0.55;
            const rh = s * 0.45;
            const cx = item.x;
            const by = item.y + rh * 0.3;

            // Outer glow
            ctx.beginPath();
            ctx.rect(cx - bw/2 - 2, by - rh - 2, bw + 4, bh + rh + 4);
            ctx.fillStyle = col.color + '08';
            ctx.fill();

            // Roof (triangle)
            ctx.beginPath();
            ctx.moveTo(cx, by - rh);
            ctx.lineTo(cx - bw/2 - 1, by);
            ctx.lineTo(cx + bw/2 + 1, by);
            ctx.closePath();
            ctx.fillStyle = col.color + 'cc';
            ctx.shadowBlur = 10 * pulse;
            ctx.shadowColor = col.color + '40';
            ctx.fill();
            ctx.shadowBlur = 0;

            // Body (rectangle)
            ctx.beginPath();
            ctx.rect(cx - bw/2, by, bw, bh);
            ctx.fillStyle = col.color + 'cc';
            ctx.fill();

            // Border
            ctx.strokeStyle = col.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, by - rh);
            ctx.lineTo(cx - bw/2 - 1, by);
            ctx.lineTo(cx - bw/2, by);
            ctx.lineTo(cx - bw/2, by + bh);
            ctx.lineTo(cx + bw/2, by + bh);
            ctx.lineTo(cx + bw/2, by);
            ctx.lineTo(cx + bw/2 + 1, by);
            ctx.closePath();
            ctx.stroke();
          } else {
            // ── Downstream circles: empty outline + fill gauge ──
            const fillData = fills[ci][ii];
            const ratio = col.ratio;
            const fillFrac = fillData.count / ratio;
            const isFlashing = now - fillData.flashTime < 0.25;

            // Outer glow — brighter when nearly full
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.r + 3, 0, Math.PI * 2);
            ctx.fillStyle = col.color + (fillFrac > 0.6 ? '18' : '08');
            ctx.fill();

            // Empty outline (always visible)
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
            ctx.strokeStyle = col.color + '50';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Fill gauge from bottom
            if (fillFrac > 0) {
              const fillH = fillFrac * item.r * 2;
              ctx.save();
              ctx.beginPath();
              ctx.rect(
                item.x - item.r - 1,
                item.y + item.r - fillH,
                item.r * 2 + 2,
                fillH + 1,
              );
              ctx.clip();
              ctx.beginPath();
              ctx.arc(item.x, item.y, item.r, 0, Math.PI * 2);
              ctx.fillStyle = col.color + 'cc';
              ctx.shadowBlur = 8 * pulse;
              ctx.shadowColor = col.color + '40';
              ctx.fill();
              ctx.shadowBlur = 0;
              ctx.restore();
            }

            // Flash ring when a bubble just fired
            if (isFlashing) {
              const flashP = (now - fillData.flashTime) / 0.25;
              ctx.beginPath();
              ctx.arc(item.x, item.y, item.r + flashP * 10, 0, Math.PI * 2);
              ctx.strokeStyle = col.color + Math.round((1 - flashP) * 120).toString(16).padStart(2, '0');
              ctx.lineWidth = 2 * (1 - flashP);
              ctx.stroke();
            }
          }

          // Inner label for larger bubbles
          if (item.r >= 14) {
            ctx.font = `bold ${Math.max(8, item.r * 0.55)}px JetBrains Mono`;
            ctx.fillStyle = '#f1f5f9dd';
            ctx.textAlign = 'center';
            ctx.fillText(col.label, item.x, item.y + item.r * 0.2);
          }
        });

        // Column label
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.fillStyle = col.color;
        ctx.textAlign = 'center';
        ctx.fillText(col.label, col.x, padY - 28);

        // Ratio label between columns
        if (col.ratio) {
          const prevCol = columns[ci - 1];
          const mx = (prevCol.x + col.x) / 2;
          ctx.font = '11px JetBrains Mono';
          ctx.fillStyle = col.color + '80';
          ctx.fillText(`${col.ratio}:1`, mx, padY - 14);

          // Small arrow
          ctx.beginPath();
          ctx.moveTo(mx - 12, padY - 10);
          ctx.lineTo(mx + 12, padY - 10);
          ctx.strokeStyle = col.color + '30';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(mx + 12, padY - 10);
          ctx.lineTo(mx + 8, padY - 13);
          ctx.lineTo(mx + 8, padY - 7);
          ctx.closePath();
          ctx.fillStyle = col.color + '40';
          ctx.fill();
        }
      });

      // Bottom annotation
      ctx.font = '11px Inter';
      ctx.fillStyle = colors.textDim + '80';
      ctx.textAlign = 'left';
      ctx.fillText('High frequency, high volume', padX, height - 12);
      ctx.textAlign = 'right';
      ctx.fillText('Low frequency, high value', width - padX, height - 12);

      // Pyramid direction arrow at very bottom
      ctx.beginPath();
      ctx.moveTo(padX + 180, height - 8);
      ctx.lineTo(width - padX - 180, height - 8);
      ctx.strokeStyle = colors.surfaceLight + '20';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width - padX - 180, height - 8);
      ctx.lineTo(width - padX - 186, height - 11);
      ctx.lineTo(width - padX - 186, height - 5);
      ctx.closePath();
      ctx.fillStyle = colors.surfaceLight + '30';
      ctx.fill();

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
    />
  );
}
