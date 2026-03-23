import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * AggregationPyramid — Parallel streams showing per-home aggregation
 * Each home has its own independent pipeline:
 * Home (20s) →3:1→ 1min →5:1→ 5min →3:1→ 15min →4:1→ 1hr →24:1→ 24hr
 *
 * Circles start empty, fill as dots arrive (gauge from bottom),
 * fire onward when full, then reset to empty.
 */

const STAGES = [
  { label: '1 min', ratio: 3,  color: '#FF3621', r: 6 },
  { label: '5 min', ratio: 5,  color: '#FF3621', r: 9 },
  { label: '15 min',ratio: 3,  color: colors.accent, r: 12 },
  { label: '1 hr',  ratio: 4,  color: colors.primary, r: 15 },
  { label: '24 hr', ratio: 24, color: colors.success, r: 20 },
];

const HOME_COUNT = 8;
const HOME_COLOR = '#E25A1C';

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

    const padLeft = 55;
    const padRight = 30;
    const padTop = 42;
    const padBottom = 25;
    const stageCount = STAGES.length;

    // Lane layout — 8 horizontal streams
    const laneH = (height - padTop - padBottom) / HOME_COUNT;
    const homeX = padLeft;
    const stageSpacing = (width - padLeft - padRight) / (stageCount + 0.3);

    // Compute positions per lane
    const lanes = Array.from({ length: HOME_COUNT }, (_, hi) => {
      const cy = padTop + laneH * hi + laneH / 2;
      return {
        homeX,
        homeY: cy,
        stages: STAGES.map((stage, si) => ({
          x: padLeft + stageSpacing * (si + 1),
          y: cy,
          r: Math.min(stage.r, laneH * 0.38),
        })),
      };
    });

    const merges = mergesRef.current;
    const flows = flowRef.current;
    merges.length = 0;
    flows.length = 0;
    const startTime = performance.now() / 1000;

    // Home timers — staggered so they don't all fire at once
    const homeTimers = lanes.map((_, hi) => ({
      nextFire: startTime + hi * 0.06 + Math.random() * 0.2,
      period: 0.19 + Math.random() * 0.1,
    }));

    // Fill state: fills[homeIdx][stageIdx] = { count, flashTime }
    const fills = lanes.map(() =>
      STAGES.map(() => ({ count: 0, flashTime: -1 }))
    );

    // Pre-seed: random partial fills so pipeline is active on open
    fills.forEach(homeFills => {
      homeFills.forEach((f, si) => {
        const ratio = STAGES[si].ratio;
        if (si <= 2) {
          f.count = Math.floor(Math.random() * ratio);
        } else if (si === 3) {
          // 1hr: seed 40-80% full
          f.count = Math.floor(ratio * 0.4 + Math.random() * ratio * 0.4);
        } else {
          // 24hr: seed 70-95% full so it might fire during the talk
          f.count = Math.floor(ratio * 0.7 + Math.random() * ratio * 0.25);
        }
      });
    });

    // Spawn a flow dot within a home's stream
    // fromStageIdx = -1 means home → stage 0
    function spawnFlow(hi, fromStageIdx) {
      const toStageIdx = fromStageIdx + 1;
      if (toStageIdx >= stageCount) return;

      const lane = lanes[hi];
      const fromX = fromStageIdx < 0 ? lane.homeX : lane.stages[fromStageIdx].x;
      const fromR = fromStageIdx < 0 ? 5 : lane.stages[fromStageIdx].r;
      const target = lane.stages[toStageIdx];

      flows.push({
        sx: fromX + fromR + 2,
        sy: lane.homeY,
        tx: target.x - target.r - 2,
        ty: target.y,
        progress: 0,
        speed: 0.012 + toStageIdx * 0.001 + Math.random() * 0.005,
        color: fromStageIdx < 0 ? HOME_COLOR : STAGES[fromStageIdx].color,
        size: 1.5 + (fromStageIdx + 1) * 1.2 + Math.random() * 1.2,
        homeIdx: hi,
        stageIdx: toStageIdx,
      });
    }

    // Pre-seed dots in flight across various streams
    for (let k = 0; k < 14; k++) {
      const hi = Math.floor(Math.random() * HOME_COUNT);
      const si = Math.floor(Math.random() * stageCount);
      const lane = lanes[hi];
      const fromX = si === 0 ? lane.homeX : lane.stages[si - 1].x;
      const fromR = si === 0 ? 5 : lane.stages[si - 1].r;
      const target = lane.stages[si];

      flows.push({
        sx: fromX + fromR + 2,
        sy: lane.homeY,
        tx: target.x - target.r - 2,
        ty: target.y,
        progress: Math.random() * 0.7,
        speed: 0.012 + si * 0.001 + Math.random() * 0.005,
        color: si === 0 ? HOME_COLOR : STAGES[si - 1].color,
        size: 1.5 + si * 1.2 + Math.random() * 1.2,
        homeIdx: hi,
        stageIdx: si,
      });
    }

    function draw() {
      const now = performance.now() / 1000;
      const isActive = slideContext?.isSlideActive;
      ctx.clearRect(0, 0, width, height);

      // ── Background grid ──
      ctx.strokeStyle = colors.surfaceLight + '06';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // ── Lane dividers ──
      for (let hi = 1; hi < HOME_COUNT; hi++) {
        const y = padTop + laneH * hi;
        ctx.beginPath();
        ctx.moveTo(padLeft - 15, y);
        ctx.lineTo(width - padRight + 5, y);
        ctx.strokeStyle = colors.surfaceLight + '0a';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // ── Connection lines per stream ──
      lanes.forEach((lane) => {
        // Home → first stage
        ctx.beginPath();
        ctx.moveTo(lane.homeX + 7, lane.homeY);
        ctx.lineTo(lane.stages[0].x - lane.stages[0].r - 2, lane.stages[0].y);
        ctx.strokeStyle = STAGES[0].color + '0c';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Between stages
        for (let si = 0; si < stageCount - 1; si++) {
          const from = lane.stages[si];
          const to = lane.stages[si + 1];
          ctx.beginPath();
          ctx.moveTo(from.x + from.r + 2, from.y);
          ctx.lineTo(to.x - to.r - 2, to.y);
          ctx.strokeStyle = STAGES[si + 1].color + '0c';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });

      // ── Home timers → spawn dots ──
      if (isActive) {
        homeTimers.forEach((home, hi) => {
          if (now >= home.nextFire) {
            home.nextFire = now + home.period;
            spawnFlow(hi, -1);
          }
        });
      }

      // ── Update & draw flow particles ──
      for (let i = flows.length - 1; i >= 0; i--) {
        const f = flows[i];
        if (isActive) f.progress += f.speed;
        if (f.progress > 1) {
          // Arrived — increment target fill
          const hi = f.homeIdx;
          const si = f.stageIdx;
          if (fills[hi] && fills[hi][si]) {
            fills[hi][si].count++;
            if (fills[hi][si].count >= STAGES[si].ratio) {
              fills[hi][si].count = 0;
              fills[hi][si].flashTime = now;
              if (si < stageCount - 1) {
                spawnFlow(hi, si);
              }
            }
          }
          merges.push({ x: f.tx, y: f.ty, t: now, color: f.color, r: 5 });
          flows.splice(i, 1);
          continue;
        }

        // Linear interpolation (same Y — straight horizontal path)
        const t = f.progress;
        const px = (1 - t) * f.sx + t * f.tx;
        const py = f.sy;

        ctx.beginPath();
        ctx.arc(px, py, f.size, 0, Math.PI * 2);
        ctx.fillStyle = f.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = f.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // ── Merge flash effects ──
      for (let i = merges.length - 1; i >= 0; i--) {
        const e = merges[i];
        const age = now - e.t;
        if (age > 0.3) { merges.splice(i, 1); continue; }
        const p = age / 0.3;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r + p * 8, 0, Math.PI * 2);
        ctx.strokeStyle = e.color + Math.round((1 - p) * 80).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5 * (1 - p);
        ctx.stroke();
      }

      // ── Draw homes and stage bubbles ──
      const pulse = 0.5 + 0.5 * Math.sin(now * 1.5);

      lanes.forEach((lane, hi) => {
        // ── Home icon (always full) ──
        const hx = lane.homeX;
        const hy = lane.homeY;
        const hw = 10;
        const bodyH = hw * 0.5;
        const roofH = hw * 0.45;
        const bodyTop = hy + roofH * 0.15;

        // Roof
        ctx.beginPath();
        ctx.moveTo(hx, bodyTop - roofH);
        ctx.lineTo(hx - hw / 2 - 1, bodyTop);
        ctx.lineTo(hx + hw / 2 + 1, bodyTop);
        ctx.closePath();
        ctx.fillStyle = HOME_COLOR + 'cc';
        ctx.shadowBlur = 5 * pulse;
        ctx.shadowColor = HOME_COLOR + '40';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Body
        ctx.beginPath();
        ctx.rect(hx - hw / 2, bodyTop, hw, bodyH);
        ctx.fillStyle = HOME_COLOR + 'cc';
        ctx.fill();

        // Border
        ctx.strokeStyle = HOME_COLOR;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(hx, bodyTop - roofH);
        ctx.lineTo(hx - hw / 2 - 1, bodyTop);
        ctx.lineTo(hx - hw / 2, bodyTop);
        ctx.lineTo(hx - hw / 2, bodyTop + bodyH);
        ctx.lineTo(hx + hw / 2, bodyTop + bodyH);
        ctx.lineTo(hx + hw / 2, bodyTop);
        ctx.lineTo(hx + hw / 2 + 1, bodyTop);
        ctx.closePath();
        ctx.stroke();

        // ── Stage bubbles (fill gauge) ──
        lane.stages.forEach((pos, si) => {
          const stage = STAGES[si];
          const fillData = fills[hi][si];
          const fillFrac = fillData.count / stage.ratio;
          const isFlashing = now - fillData.flashTime < 0.2;

          // Outer glow — brighter when nearly full
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.r + 2, 0, Math.PI * 2);
          ctx.fillStyle = stage.color + (fillFrac > 0.6 ? '15' : '06');
          ctx.fill();

          // Empty outline (always visible)
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
          ctx.strokeStyle = stage.color + '45';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Fill gauge from bottom
          if (fillFrac > 0) {
            const fillH = fillFrac * pos.r * 2;
            ctx.save();
            ctx.beginPath();
            ctx.rect(
              pos.x - pos.r - 1,
              pos.y + pos.r - fillH,
              pos.r * 2 + 2,
              fillH + 1,
            );
            ctx.clip();
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, pos.r, 0, Math.PI * 2);
            ctx.fillStyle = stage.color + 'bb';
            ctx.shadowBlur = 6 * pulse;
            ctx.shadowColor = stage.color + '30';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.restore();
          }

          // Flash ring when bubble just fired
          if (isFlashing) {
            const fp = (now - fillData.flashTime) / 0.2;
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, pos.r + fp * 8, 0, Math.PI * 2);
            ctx.strokeStyle = stage.color + Math.round((1 - fp) * 100).toString(16).padStart(2, '0');
            ctx.lineWidth = 1.5 * (1 - fp);
            ctx.stroke();
          }

          // Label inside larger bubbles
          if (pos.r >= 12) {
            ctx.font = `bold ${Math.max(7, pos.r * 0.48)}px JetBrains Mono`;
            ctx.fillStyle = '#f1f5f9cc';
            ctx.textAlign = 'center';
            ctx.fillText(stage.label, pos.x, pos.y + pos.r * 0.2);
          }
        });
      });

      // ── Column headers ──
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillStyle = HOME_COLOR;
      ctx.fillText('20s', homeX, padTop - 18);

      STAGES.forEach((stage, si) => {
        const x = padLeft + stageSpacing * (si + 1);
        ctx.fillStyle = stage.color;
        ctx.fillText(stage.label, x, padTop - 18);
      });

      // Ratio labels between columns
      ctx.font = '10px JetBrains Mono';
      STAGES.forEach((stage, si) => {
        const fromX = si === 0 ? homeX : padLeft + stageSpacing * si;
        const toX = padLeft + stageSpacing * (si + 1);
        const mx = (fromX + toX) / 2;
        ctx.fillStyle = stage.color + '70';
        ctx.textAlign = 'center';
        ctx.fillText(`${stage.ratio}:1`, mx, padTop - 6);

        ctx.beginPath();
        ctx.moveTo(mx - 10, padTop - 2);
        ctx.lineTo(mx + 10, padTop - 2);
        ctx.strokeStyle = stage.color + '25';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(mx + 10, padTop - 2);
        ctx.lineTo(mx + 7, padTop - 5);
        ctx.lineTo(mx + 7, padTop + 1);
        ctx.closePath();
        ctx.fillStyle = stage.color + '35';
        ctx.fill();
      });

      // ── Bottom annotation ──
      ctx.font = '11px Inter';
      ctx.fillStyle = colors.textDim + '80';
      ctx.textAlign = 'left';
      ctx.fillText('High frequency, high volume', padLeft, height - 8);
      ctx.textAlign = 'right';
      ctx.fillText('Low frequency, high value', width - padRight, height - 8);

      // Timescale indicator — bottom right, above the annotation line
      ctx.font = 'bold 10px JetBrains Mono';
      ctx.fillStyle = colors.textDim + 'aa';
      ctx.textAlign = 'right';
      ctx.fillText('\u25B6 ~80\u00D7 REALTIME', width - padRight, height - 22);

      // Direction arrow
      ctx.beginPath();
      ctx.moveTo(padLeft + 180, height - 4);
      ctx.lineTo(width - padRight - 180, height - 4);
      ctx.strokeStyle = colors.surfaceLight + '18';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(width - padRight - 180, height - 4);
      ctx.lineTo(width - padRight - 186, height - 7);
      ctx.lineTo(width - padRight - 186, height - 1);
      ctx.closePath();
      ctx.fillStyle = colors.surfaceLight + '28';
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
