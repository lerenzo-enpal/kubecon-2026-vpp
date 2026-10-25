import React from 'react';
import SevenSegment, { isRenderable } from './SevenSegment.jsx';
import { colors } from '../../theme.js';

/**
 * SevenSegText — lay out a string across multiple 7-segment digits.
 *
 * Handles the punctuation that appears in real readouts:
 *   .  and ,  render as a small dot in the lower-right corner of the digit cell
 *             (a real display has no dedicated dot segment; it shares the cell)
 *   :  renders as two dots, vertically stacked
 *   ;  as a dot plus a comma tail
 *   everything else maps to a digit cell
 *
 * Unsupported letters render as a blank cell rather than a wrong glyph, so the
 * readout never silently lies about what it says.
 *
 * Props:
 *   value    — the string to render
 *   height   — digit height in px (dot cells inherit it)
 *   gap      — px between digit cells (default 0.06 × height)
 *   ...rest  — passed through to SevenSegment (jitter, ghost, intensity, ...)
 */
export default function SevenSegText({
  value = '',
  height = 120,
  gap,
  color,
  align = 'left',
  style = {},
  ...rest
}) {
  const chars = String(value).split('');
  const cellW = height * 0.56;
  const spacing = gap ?? height * 0.06;
  const emitter = color || colors.primary;

  // A dot/comma occupies a narrow cell — it does not need a full digit width.
  const isNarrow = (c) => c === '.' || c === ',' || c === "'";

  const cells = chars.map((c, i) => {
    const narrow = isNarrow(c);
    const width = narrow ? cellW * 0.42 : cellW;

    let content;
    if (narrow) {
      const dotR = height * 0.055;
      const cx = width * 0.75;
      // A comma is a dot plus a descending tail; a period is just the dot.
      const isComma = c === ',';
      content = (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', overflow: 'visible' }}
          aria-hidden="true"
        >
          <circle
            cx={cx}
            cy={height - height * 0.075}
            r={dotR}
            fill={emitter}
            style={{ filter: `drop-shadow(0 0 ${dotR * 1.8}px ${emitter})` }}
          />
          {isComma && (
            <path
              d={`M${cx} ${height - height * 0.045} L${cx - dotR * 1.1} ${height + dotR * 1.5}`}
              stroke={emitter}
              strokeWidth={dotR * 1.1}
              strokeLinecap="round"
              fill="none"
              style={{ filter: `drop-shadow(0 0 ${dotR * 1.4}px ${emitter})` }}
            />
          )}
        </svg>
      );
    } else if (c === ':') {
      const dotR = height * 0.055;
      content = (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{ display: 'block', overflow: 'visible' }}
          aria-hidden="true"
        >
          <circle cx={width * 0.5} cy={height * 0.34} r={dotR} fill={emitter}
            style={{ filter: `drop-shadow(0 0 ${dotR * 1.8}px ${emitter})` }} />
          <circle cx={width * 0.5} cy={height * 0.70} r={dotR} fill={emitter}
            style={{ filter: `drop-shadow(0 0 ${dotR * 1.8}px ${emitter})` }} />
        </svg>
      );
    } else if (!isRenderable(c)) {
      // Non-segmentable glyph ($, %, ×, M, H, letters beyond A–F).
      //
      // Dropping these would change the meaning — "$9,000" must not read as
      // "9,000", and "4.5M" must not read as "4.5". Real equipment panels
      // screen-print fixed symbols beside the segment window; this does the
      // same, rendering the glyph in the deck's data face at matching weight.
      const fontSize = height * 0.62;
      content = (
        <div
          style={{
            width,
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize,
            fontWeight: 700,
            lineHeight: 1,
            color: emitter,
            textShadow: `0 0 ${fontSize * 0.5}px ${emitter}80`,
          }}
        >
          {c}
        </div>
      );
    } else {
      content = (
        <SevenSegment
          char={c}
          height={height}
          color={emitter}
          seed={i}
          {...rest}
        />
      );
    }

    return { c, width, content, renderable: narrow || c === ':' || isRenderable(c) };
  });

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start',
        gap: spacing,
        ...style,
      }}
      role="img"
      aria-label={String(value)}
    >
      {cells.map((cell, i) => (
        <div key={i} style={{ width: cell.width, flexShrink: 0 }}>
          {cell.content}
        </div>
      ))}
    </div>
  );
}
