// Canvas 2D 7-segment text renderer.
//
// The SVG SevenSegment component can't be used inside a chart's draw loop, so
// this draws the same segment geometry directly into a 2D context. Charts call
// segText(ctx, value, x, y, opts) wherever they used to call ctx.fillText().
//
// Geometry matches SevenSegment.jsx exactly so SVG and canvas readouts are
// visually identical on the same slide.

import { colors, getDisplay } from '../../theme.js';

const SEGMENT_MAP = {
  '0': ['a', 'b', 'c', 'd', 'e', 'f'],
  '1': ['b', 'c'],
  '2': ['a', 'b', 'g', 'e', 'd'],
  '3': ['a', 'b', 'g', 'c', 'd'],
  '4': ['f', 'g', 'b', 'c'],
  '5': ['a', 'f', 'g', 'c', 'd'],
  '6': ['a', 'f', 'g', 'e', 'c', 'd'],
  '7': ['a', 'b', 'c'],
  '8': ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
  '9': ['a', 'b', 'c', 'd', 'f', 'g'],
  A: ['a', 'b', 'c', 'e', 'f', 'g'],
  B: ['c', 'd', 'e', 'f', 'g'],
  C: ['a', 'd', 'e', 'f'],
  D: ['b', 'c', 'd', 'e', 'g'],
  E: ['a', 'd', 'e', 'f', 'g'],
  F: ['a', 'e', 'f', 'g'],
  '-': ['g'],
  '_': ['d'],
  ' ': [],
  '?': ['a', 'b', 'g', 'e'],
  '=': ['d', 'g'],
};

export function canvasSegmentsFor(char) {
  return SEGMENT_MAP[String(char).toUpperCase()] ?? [];
}

export const DIGIT_ASPECT = 0.56;

/**
 * Measure the width a segment string will occupy.
 *
 * opts: { height, gap, tracking }
 */
export function segMeasure(value, opts = {}) {
  const height = opts.height ?? 20;
  const gap = opts.gap ?? height * 0.06;
  const cellW = height * DIGIT_ASPECT;
  const chars = String(value).split('');
  let total = 0;
  chars.forEach((c, i) => {
    const narrow = c === '.' || c === ',' || c === "'";
    total += narrow ? cellW * 0.42 : cellW;
    if (i < chars.length - 1) total += gap;
  });
  return total;
}

/**
 * Draw a 7-segment string into a 2D context.
 *
 * x, y          — anchor point
 * opts.height   — digit height (default 20, per the canvas 14px minimum rule)
 * opts.align    — 'left' | 'center' | 'right'
 * opts.color    — emitter color (defaults to the theme primary)
 * opts.ghost    — draw unlit segments (default true)
 * opts.intensity— 0..1 emitter multiplier
 * opts.glow     — bloom strength 0..1
 * opts.jitter   — 0..1 deterministic wear
 * opts.seed     — wear seed
 */
export function segText(ctx, value, x, y, opts = {}) {
  const height = opts.height ?? 20;
  const gap = opts.gap ?? height * 0.06;
  const align = opts.align ?? 'left';
  const emitter = opts.color || colors.primary;
  const display = getDisplay();
  const thickness = opts.thickness ?? 0.13;
  const intensity = opts.intensity ?? 1;
  const jitter = opts.jitter ?? 0;
  const ghost = opts.ghost !== false;
  const seed = opts.seed ?? 0;
  const glow = opts.glow ?? 0.5;

  const str = String(value);
  const chars = str.split('');
  const cellW = height * DIGIT_ASPECT;
  const t = height * thickness;
  const joint = t * 0.3;
  const pad = t * 0.55;

  const totalWidth = segMeasure(str, { height, gap });
  let cursorX = x;
  if (align === 'center') cursorX = x - totalWidth / 2;
  else if (align === 'right') cursorX = x - totalWidth;

  ctx.save();
  ctx.lineCap = 'butt';

  chars.forEach((c, i) => {
    const narrow = c === '.' || c === ',' || c === "'";
    const w = narrow ? cellW * 0.42 : cellW;

    // ── Punctuation cells ────────────────────────────────────────────────
    if (narrow) {
      const dotR = height * 0.055;
      const cx = cursorX + w * 0.75;
      const cy = y - height * 0.075;
      ctx.beginPath();
      ctx.arc(cx, cy, dotR, 0, Math.PI * 2);
      ctx.fillStyle = emitter;
      ctx.globalAlpha = intensity;
      if (glow > 0) {
        ctx.shadowBlur = dotR * 1.8 * glow * 3;
        ctx.shadowColor = emitter;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      if (c === ',') {
        ctx.beginPath();
        ctx.moveTo(cx, cy + dotR * 0.6);
        ctx.lineTo(cx - dotR * 1.1, cy + dotR * 2.4);
        ctx.strokeStyle = emitter;
        ctx.lineWidth = dotR * 1.1;
        ctx.lineCap = 'round';
        ctx.stroke();
        ctx.lineCap = 'butt';
      }
      ctx.globalAlpha = 1;
      cursorX += w + gap;
      return;
    }

    if (c === ':') {
      const dotR = height * 0.055;
      const cx = cursorX + w * 0.5;
      ctx.fillStyle = emitter;
      ctx.globalAlpha = intensity;
      if (glow > 0) { ctx.shadowBlur = dotR * 1.8 * glow * 3; ctx.shadowColor = emitter; }
      ctx.beginPath(); ctx.arc(cx, y - height * 0.34, dotR, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx, y - height * 0.70, dotR, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      cursorX += w + gap;
      return;
    }

    // ── Non-segmentable glyph ($, %, ×, M, H, most letters) ───────────────
    // Render in the data face rather than dropping it, so "$9,000" never
    // silently becomes "9,000".
    if (!Object.prototype.hasOwnProperty.call(SEGMENT_MAP, String(c).toUpperCase())) {
      const fs = height * 0.62;
      ctx.font = `700 ${fs}px "JetBrains Mono", monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = emitter;
      ctx.globalAlpha = intensity;
      if (glow > 0) { ctx.shadowBlur = fs * 0.5 * glow * 2; ctx.shadowColor = emitter; }
      ctx.fillText(c, cursorX + w / 2, y - height / 2);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      cursorX += w + gap;
      return;
    }

    // ── Digit cell ───────────────────────────────────────────────────────
    const lit = SEGMENT_MAP[String(c).toUpperCase()] ?? [];
    const x0 = cursorX + pad;
    const x1 = cursorX + w - pad;
    const y0 = y - height + pad;
    const y1 = y - height / 2;
    const y2 = y - pad;
    const half = t / 2;

    const geo = {
      a: [x0 + joint, y0 + half, x1 - joint, y0 + half],
      b: [x1 - half, y0 + joint, x1 - half, y1 - joint],
      c: [x1 - half, y1 + joint, x1 - half, y2 - joint],
      d: [x0 + joint, y2 - half, x1 - joint, y2 - half],
      e: [x0 + half, y1 + joint, x0 + half, y2 - joint],
      f: [x0 + half, y0 + joint, x0 + half, y1 - joint],
      g: [x0 + joint, y1, x1 - joint, y1],
    };

    const sparse = lit.length === 1;
    const litAlpha = Math.min(1, intensity * (sparse ? 1.35 : 1));
    const bloomScale = sparse ? 1.25 : 1;

    // Ghost layer (one path, batched)
    if (ghost) {
      ctx.globalAlpha = display.ghostOpacity;
      ctx.strokeStyle = colors.ghost;
      ctx.lineWidth = t;
      ctx.beginPath();
      for (const seg of ['a', 'b', 'c', 'd', 'e', 'f', 'g']) {
        const [ax, ay, bx, by] = geo[seg];
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    // Emitter layer (one path per digit)
    if (lit.length) {
      ctx.globalAlpha = litAlpha;
      ctx.strokeStyle = emitter;
      ctx.lineWidth = t;
      if (glow > 0) {
        ctx.shadowBlur = t * 2.2 * bloomScale * glow * 2.2;
        ctx.shadowColor = emitter;
      }
      ctx.beginPath();
      for (const seg of lit) {
        const [ax, ay, bx, by] = geo[seg];
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
    }

    cursorX += w + gap;
  });

  ctx.restore();
  return totalWidth;
}
