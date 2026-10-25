import React from 'react';
import SevenSegText from './SevenSegText.jsx';
import { colors } from '../../theme.js';

/**
 * SevenSegHeading — a slide title in the display idiom.
 *
 * 7-segment can only render digits and A–F(-ish) letters. Slide titles are
 * English words, so a naive "render the title in segments" produces blanks and
 * lies. Instead this component uses the hybrid that real equipment panels use:
 *
 *   - a 7-segment INDEX / numeric prefix (e.g. "PART 1", "04:37") where the
 *     title has a number worth showing in segments
 *   - the title itself in JetBrains Mono, the deck's data face, with the
 *     panel's glow treatment so it reads as part of the same instrument
 *
 * This keeps every title legible while the numeric readouts — the thing a
 * 7-segment display is actually FOR — carry the segment treatment.
 *
 * Props:
 *   children  — the title text
 *   index     — optional numeric/segment prefix, e.g. '01' or '4.37'
 *   eyebrow   — small uppercase label above
 *   size      — title px
 *   indexSize — index digit height px
 *   color     — title color
 *   center    — center-align
 */
export default function SevenSegHeading({
  children,
  index,
  eyebrow,
  size = 40,
  indexSize = 30,
  color,
  center = false,
  style = {},
}) {
  const tone = color || colors.text;
  const align = center ? 'center' : 'left';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: center ? 'center' : 'flex-start', ...style }}>
      {eyebrow && (
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: colors.textDim,
            marginBottom: 8,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, justifyContent: align }}>
        {index != null && (
          <SevenSegText
            value={String(index)}
            height={indexSize}
            color={colors.primary}
            style={{ flexShrink: 0 }}
          />
        )}
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: size,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: tone,
            textShadow: `0 0 ${size * 0.5}px ${tone}45, 0 0 ${size * 1.1}px ${tone}20`,
            textAlign: align,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
