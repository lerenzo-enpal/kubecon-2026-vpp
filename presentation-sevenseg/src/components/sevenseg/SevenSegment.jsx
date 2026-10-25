import React, { useMemo } from 'react';
import { colors, getDisplay } from '../../theme.js';

/**
 * SevenSegment — a single 7-segment digit.
 *
 * Segment layout (standard):
 *
 *        aaaa
 *       f    b
 *       f    b
 *        gggg
 *       e    c
 *       e    c
 *        dddd
 *
 * Props:
 *   char        — '0'-'9', 'A'-'F', '-', '_', ' ', '?', '.', ':' etc.
 *   height      — digit height in px. Width is derived (0.56 × height).
 *   on          — force all segments on (lamp test)
 *   ghost       — show unlit segments at low opacity
 *   intensity   — 0..1 multiplier on the emitter brightness
 *   jitter      — 0..1 per-segment brightness noise (aged/burned display)
 *   deadSegments — array of segment letters that are permanently dark (broken panel)
 *   flicker     — 0..1 chance of a segment dropping out this render
 *   color       — emitter color override
 *   thickness   — segment stroke thickness as a ratio of height (default 0.13)
 */

// Which segments are lit for each character.
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
  // Hex letters
  A: ['a', 'b', 'c', 'e', 'f', 'g'],
  B: ['c', 'd', 'e', 'f', 'g'],
  C: ['a', 'd', 'e', 'f'],
  D: ['b', 'c', 'd', 'e', 'g'],
  E: ['a', 'd', 'e', 'f', 'g'],
  F: ['a', 'e', 'f', 'g'],
  // Common readout glyphs
  '-': ['g'],
  '_': ['d'],
  ' ': [],
  '?': ['a', 'b', 'g', 'e'],
  '=': ['d', 'g'],
  "'": ['b'],
  '"': ['b', 'f'],
  // Letters with no clean 7-seg form render as blank rather than lying.
};

export function segmentsForChar(char) {
  if (char == null) return [];
  const key = String(char).toUpperCase();
  return SEGMENT_MAP[key] ?? [];
}

export function isRenderable(char) {
  return Object.prototype.hasOwnProperty.call(SEGMENT_MAP, String(char).toUpperCase());
}

// Deterministic pseudo-random so a "burned" panel looks stable across renders
// instead of shimmering. Seeded per (digit, segment).
function hashNoise(seed) {
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

export default function SevenSegment({
  char = '8',
  height = 120,
  on = false,
  ghost = true,
  intensity = 1,
  jitter = 0,
  deadSegments = [],
  flicker = 0,
  color,
  thickness = 0.13,
  seed = 0,
  style = {},
}) {
  const emitter = color || colors.primary;
  const display = getDisplay();

  const h = height;
  const w = h * 0.56;
  const t = h * thickness;          // segment thickness
  const gap = t * 0.30;             // gap between segments at a joint
  const pad = t * 0.55;             // inset from the digit box

  const lit = useMemo(() => {
    if (on) return ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    return segmentsForChar(char);
  }, [on, char]);

  // Segment endpoints, in a 0..w / 0..h box.
  //
  // Horizontal bars (a/d/g) run the full inner width minus a small joint inset
  // at each end. Vertical bars (b/c/e/f) stop short of the centre line so the
  // middle bar has room. This mirrors how a real LED segment package is built:
  // the bar is a solid block, the gap is a chamfer at the corner joint only.
  const geo = useMemo(() => {
    const x0 = pad;
    const x1 = w - pad;
    const y0 = pad;
    const y1 = h / 2;
    const y2 = h - pad;
    const half = t / 2;
    const joint = gap;             // inset at a shared corner only
    return {
      a: [x0 + joint, y0 + half, x1 - joint, y0 + half],
      b: [x1 - half, y0 + joint, x1 - half, y1 - joint],
      c: [x1 - half, y1 + joint, x1 - half, y2 - joint],
      d: [x0 + joint, y2 - half, x1 - joint, y2 - half],
      e: [x0 + half, y1 + joint, x0 + half, y2 - joint],
      f: [x0 + half, y0 + joint, x0 + half, y1 - joint],
      g: [x0 + joint, y1, x1 - joint, y1],
    };
  }, [w, h, t, gap, pad]);

  const allSegments = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ display: 'block', overflow: 'visible', ...style }}
      aria-hidden="true"
    >
      {allSegments.map((seg) => {
        const isLit = lit.includes(seg);
        const isDead = deadSegments.includes(seg);
        const [x1, y1, x2, y2] = geo[seg];

        // Deterministic wear: some segments burn slightly dimmer.
        const wear = jitter > 0 ? 1 - hashNoise(`${seed}:${seg}`) * jitter : 1;
        // Occasional dropout on a failing panel.
        const dropping = flicker > 0 && isLit && hashNoise(`${seed}:${seg}:f`) < flicker;

        const litOpacity = isDead ? 0 : (dropping ? 0.12 : Math.max(0.25, wear) * intensity);

        // Short glyphs (a lone '-' or '_') carry only one segment, so the bloom
        // that makes multi-segment digits glow washes them out by comparison.
        // Give sparse glyphs a slightly higher emitter opacity to hold weight.
        const sparse = lit.length === 1 && isLit;
        const emitterOpacity = sparse ? Math.min(1, litOpacity * 1.35) : litOpacity;
        const bloomScale = sparse ? display.bloom * 1.25 : display.bloom;

        return (
          <g key={seg}>
            {/* Ghost (unlit) segment — always drawn so the panel reads as a panel */}
            {ghost && (
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={colors.ghost}
                strokeWidth={t}
                strokeLinecap="butt"
                opacity={display.ghostOpacity}
              />
            )}
            {/* Emitter */}
            {isLit && (
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={emitter}
                strokeWidth={t}
                strokeLinecap="butt"
                opacity={emitterOpacity}
                style={{
                  filter: `drop-shadow(0 0 ${t * 0.9 * bloomScale}px ${emitter}) drop-shadow(0 0 ${t * 2.2 * bloomScale}px ${emitter})`,
                }}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
