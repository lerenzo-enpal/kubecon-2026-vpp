import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * StreamingAggregation — Animated visualization of progressive aggregation
 * 20s measurements → 1min aggregates → 5min aggregates
 * Bubbles merge into larger bubbles, inverted pyramid flowing left → right
 */

const RAW_COLOR = '#E25A1C';     // Spark orange
const MIN1_COLOR = '#FF3621';    // Databricks red
const MIN5_COLOR = colors.success; // Gold/final

export default function StreamingAggregation({ width = 1100, height = 400 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const stateRef = useRef({
    rawBubbles: [],      // 20s measurements flowing in
    min1Bubbles: [],     // 1-min aggregates
    min5Bubbles: [],     // 5-min aggregates
    mergeEffects: [],    // merge flash effects
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padX = 50;
    const padY = 40;

    // Layout: 4 columns
    const col0 = padX;                          // Source (devices)
    const col1 = padX + width * 0.2;            // 20s raw
    const col2 = padX + width * 0.5;            // 1-min aggregate
    const col3 = padX + width * 0.78;           // 5-min aggregate
    const colEnd = width - padX;

    // Vertical lanes for raw bubbles (simulate multiple devices)
    const laneCount = 5;
    const laneH = (height - padY * 2) / laneCount;
    const laneY = (i) => padY + i * laneH + laneH / 2;

    // Bubble sizes
    const rawR = 6;
    const min1R = 16;
    const min5R = 30;

    const state = stateRef.current;
    let lastSpawn = 0;
    let rawCounter = 0;
    let min1Counter = 0;
    const startTime = performance.now() / 1000;

    function draw() {
      const now = performance.now() / 1000;
      const elapsed = now - startTime;
      const isActive = slideContext?.isSlideActive;
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

      // Column zone backgrounds
      const zones = [
        { x: col0, w: col1 - col0, label: 'DEVICES', sub: '100K+ reporting', color: colors.textDim },
        { x: col1, w: col2 - col1, label: '20s RAW', sub: '5M measurements/min', color: RAW_COLOR },
        { x: col2, w: col3 - col2, label: '1-MIN AGGREGATE', sub: '3x compression', color: MIN1_COLOR },
        { x: col3, w: colEnd - col3, label: '5-MIN AGGREGATE', sub: '15x compression', color: MIN5_COLOR },
      ];
      zones.forEach(z => {
        // Subtle column glow
        const grad = ctx.createLinearGradient(z.x, 0, z.x + z.w, 0);
        grad.addColorStop(0, z.color + '03');
        grad.addColorStop(0.5, z.color + '06');
        grad.addColorStop(1, z.color + '03');
        ctx.fillStyle = grad;
        ctx.fillRect(z.x, padY - 10, z.w, height - padY * 2 + 20);

        // Column header
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillStyle = z.color + 'cc';
        ctx.textAlign = 'center';
        ctx.fillText(z.label, z.x + z.w / 2, padY - 20);
        ctx.font = '9px JetBrains Mono';
        ctx.fillStyle = z.color + '70';
        ctx.fillText(z.sub, z.x + z.w / 2, padY - 8);
      });

      // Vertical divider lines
      [col1, col2, col3].forEach(x => {
        ctx.beginPath();
        ctx.strokeStyle = colors.surfaceLight + '15';
        ctx.setLineDash([4, 6]);
        ctx.moveTo(x, padY - 10);
        ctx.lineTo(x, height - padY + 10);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Spawn raw bubbles
      if (isActive && now - lastSpawn > 0.18) {
        lastSpawn = now;
        const lane = rawCounter % laneCount;
        rawCounter++;
        state.rawBubbles.push({
          id: rawCounter,
          x: col0 + 20,
          y: laneY(lane) + (Math.random() - 0.5) * laneH * 0.5,
          targetX: col1 + (col2 - col1) * 0.35 + (Math.random() - 0.5) * 30,
          speed: 0.006 + Math.random() * 0.003,
          progress: 0,
          lane,
          alpha: 1,
        });
      }

      // Device icons (left column)
      for (let i = 0; i < laneCount; i++) {
        const dy = laneY(i);
        const dx = col0 + 10;
        // Small house icon
        ctx.beginPath();
        ctx.moveTo(dx, dy - 8);
        ctx.lineTo(dx + 10, dy - 14);
        ctx.lineTo(dx + 20, dy - 8);
        ctx.lineTo(dx + 20, dy + 4);
        ctx.lineTo(dx, dy + 4);
        ctx.closePath();
        ctx.fillStyle = colors.surface + 'ee';
        ctx.fill();
        ctx.strokeStyle = colors.success + '50';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Update and draw raw bubbles
      const arrivedRaw = [];
      for (let i = state.rawBubbles.length - 1; i >= 0; i--) {
        const b = state.rawBubbles[i];
        if (isActive) b.progress += b.speed;

        if (b.progress >= 1) {
          arrivedRaw.push(b);
          state.rawBubbles.splice(i, 1);
          continue;
        }

        const x = b.x + (b.targetX - b.x) * b.progress;
        const y = b.y;

        // Trail
        const trailX = b.x + (b.targetX - b.x) * Math.max(0, b.progress - 0.15);
        ctx.beginPath();
        ctx.moveTo(trailX, y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = RAW_COLOR + '30';
        ctx.lineWidth = rawR * 1.2;
        ctx.stroke();

        // Bubble
        ctx.beginPath();
        ctx.arc(x, y, rawR, 0, Math.PI * 2);
        ctx.fillStyle = RAW_COLOR;
        ctx.shadowBlur = 8;
        ctx.shadowColor = RAW_COLOR;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Accumulate raw into 1-min aggregates (every 3 arrivals)
      if (arrivedRaw.length > 0) {
        min1Counter += arrivedRaw.length;
        if (min1Counter >= 3) {
          min1Counter -= 3;
          // Average Y position of recent arrivals
          const avgY = height / 2 + (Math.random() - 0.5) * (height - padY * 4) * 0.4;
          state.min1Bubbles.push({
            id: now,
            x: col2 + 30,
            y: avgY,
            targetX: col2 + (col3 - col2) * 0.45 + (Math.random() - 0.5) * 20,
            progress: 0,
            speed: 0.004 + Math.random() * 0.002,
            alpha: 0,
            fadeIn: 0,
            absorbed: 0,
          });
          // Merge flash
          state.mergeEffects.push({ x: col2 + 30, y: avgY, t: now, color: MIN1_COLOR, r: min1R });
        }
      }

      // Draw and update 1-min bubbles
      const arrived1min = [];
      for (let i = state.min1Bubbles.length - 1; i >= 0; i--) {
        const b = state.min1Bubbles[i];
        if (isActive) {
          b.progress += b.speed;
          b.fadeIn = Math.min(1, b.fadeIn + 0.03);
        }

        if (b.progress >= 1) {
          arrived1min.push(b);
          state.min1Bubbles.splice(i, 1);
          continue;
        }

        const x = b.x + (b.targetX - b.x) * b.progress;
        const y = b.y;
        const r = min1R * b.fadeIn;

        // Outer ring
        ctx.beginPath();
        ctx.arc(x, y, r + 3, 0, Math.PI * 2);
        ctx.strokeStyle = MIN1_COLOR + Math.round(b.fadeIn * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.stroke();

        // Bubble
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = MIN1_COLOR + Math.round(b.fadeIn * 180).toString(16).padStart(2, '0');
        ctx.shadowBlur = 12;
        ctx.shadowColor = MIN1_COLOR;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner dots showing constituent measurements
        ctx.fillStyle = RAW_COLOR + '90';
        for (let d = 0; d < 3; d++) {
          const angle = (d / 3) * Math.PI * 2 + now * 0.5;
          const dr = r * 0.45;
          ctx.beginPath();
          ctx.arc(x + Math.cos(angle) * dr, y + Math.sin(angle) * dr, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = '#f1f5f9' + Math.round(b.fadeIn * 180).toString(16).padStart(2, '0');
        ctx.textAlign = 'center';
        ctx.fillText('1m', x, y + 3);
      }

      // Accumulate 1-min into 5-min aggregates (every 5 arrivals)
      if (arrived1min.length > 0) {
        state._min5Acc = (state._min5Acc || 0) + arrived1min.length;
        if (state._min5Acc >= 5) {
          state._min5Acc -= 5;
          const avgY = height / 2 + (Math.random() - 0.5) * (height - padY * 4) * 0.25;
          state.min5Bubbles.push({
            id: now,
            x: col3 + 40,
            y: avgY,
            progress: 0,
            fadeIn: 0,
            alpha: 1,
          });
          state.mergeEffects.push({ x: col3 + 40, y: avgY, t: now, color: MIN5_COLOR, r: min5R });
        }
      }

      // Draw 5-min bubbles (they stay in place, accumulating)
      for (let i = state.min5Bubbles.length - 1; i >= 0; i--) {
        const b = state.min5Bubbles[i];
        if (isActive) b.fadeIn = Math.min(1, b.fadeIn + 0.02);

        // Keep only last 3 to avoid clutter
        if (i < state.min5Bubbles.length - 3) {
          b.alpha = Math.max(0, b.alpha - 0.005);
          if (b.alpha <= 0) { state.min5Bubbles.splice(i, 1); continue; }
        }

        const r = min5R * b.fadeIn;
        const pulse = 0.5 + 0.5 * Math.sin(now * 1.5 + i);

        // Outer glow ring
        ctx.beginPath();
        ctx.arc(b.x, b.y, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = MIN5_COLOR + Math.round(b.alpha * b.fadeIn * 20 + pulse * 10).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Bubble
        ctx.beginPath();
        ctx.arc(b.x, b.y, r, 0, Math.PI * 2);
        ctx.fillStyle = MIN5_COLOR + Math.round(b.alpha * b.fadeIn * 140).toString(16).padStart(2, '0');
        ctx.shadowBlur = 18;
        ctx.shadowColor = MIN5_COLOR + '60';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Inner orbiting dots showing constituent 1-min aggregates
        ctx.fillStyle = MIN1_COLOR + Math.round(b.alpha * 160).toString(16).padStart(2, '0');
        for (let d = 0; d < 5; d++) {
          const angle = (d / 5) * Math.PI * 2 + now * 0.3;
          const dr = r * 0.55;
          ctx.beginPath();
          ctx.arc(b.x + Math.cos(angle) * dr, b.y + Math.sin(angle) * dr, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Label
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = '#f1f5f9' + Math.round(b.alpha * b.fadeIn * 220).toString(16).padStart(2, '0');
        ctx.textAlign = 'center';
        ctx.fillText('5m', b.x, b.y + 4);
      }

      // Merge flash effects
      for (let i = state.mergeEffects.length - 1; i >= 0; i--) {
        const e = state.mergeEffects[i];
        const age = now - e.t;
        if (age > 0.6) { state.mergeEffects.splice(i, 1); continue; }
        const progress = age / 0.6;
        const r = e.r + progress * 20;
        const alpha = (1 - progress) * 0.4;
        ctx.beginPath();
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = e.color + Math.round(alpha * 255).toString(16).padStart(2, '0');
        ctx.lineWidth = 2 * (1 - progress);
        ctx.stroke();
      }

      // Flow arrows between columns
      const arrowY = height - padY + 5;
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'center';
      [[col1, col2, '3:1', RAW_COLOR], [col2, col3, '5:1', MIN1_COLOR]].forEach(([from, to, ratio, color]) => {
        const mx = (from + to) / 2;
        ctx.fillStyle = color + '60';
        ctx.fillText(ratio, mx, arrowY);
        // Arrow
        ctx.beginPath();
        ctx.moveTo(from + 30, arrowY - 4);
        ctx.lineTo(to - 30, arrowY - 4);
        ctx.strokeStyle = color + '25';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(to - 30, arrowY - 4);
        ctx.lineTo(to - 36, arrowY - 7);
        ctx.lineTo(to - 36, arrowY - 1);
        ctx.closePath();
        ctx.fillStyle = color + '40';
        ctx.fill();
      });

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    // Reset state
    state.rawBubbles = [];
    state.min1Bubbles = [];
    state.min5Bubbles = [];
    state.mergeEffects = [];
    state._min5Acc = 0;

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
