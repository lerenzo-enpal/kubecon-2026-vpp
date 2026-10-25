import React from 'react';
import { colors } from '../theme.js';

/**
 * Shared slide furniture for the 7-segment deck.
 *
 * Extracted so all 40 slides use identical typography and spacing — the deck
 * has to read as one continuous instrument, which only holds if every slide
 * shares the same type scale and panel rhythm.
 */

export const TOTAL = 40;
export const PAD = '30px 46px';

export const Eyebrow = ({ children, color }) => (
  <div
    style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 11,
      letterSpacing: '0.26em',
      textTransform: 'uppercase',
      color: color || colors.textDim,
      marginBottom: 10,
    }}
  >
    {children}
  </div>
);

export const Body = ({ children, size = 16, color, align = 'left', style = {} }) => (
  <div
    style={{
      fontFamily: '"Inter", system-ui, sans-serif',
      fontSize: size,
      lineHeight: 1.5,
      color: color || colors.textMuted,
      textAlign: align,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Mono = ({ children, size = 13, color, weight = 400, spacing = '0.06em', style = {} }) => (
  <div
    style={{
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: size,
      fontWeight: weight,
      letterSpacing: spacing,
      color: color || colors.textMuted,
      ...style,
    }}
  >
    {children}
  </div>
);

export const SectionTitle = ({ part, title, subtitle, color }) => (
  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
    <Eyebrow color={color}>{part}</Eyebrow>
    <div
      style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 46,
        fontWeight: 700,
        color: color || colors.primary,
        textShadow: `0 0 32px ${(color || colors.primary)}45`,
        marginBottom: 16,
      }}
    >
      {title}
    </div>
    {subtitle && <Body size={16} align="center" style={{ maxWidth: 620 }}>{subtitle}</Body>}
  </div>
);

// A labelled metric row used across the data slides.
export const MetricRow = ({ items, height = 30 }) => (
  <div style={{ display: 'flex', gap: 10 }}>
    {items.map(m => (
      <SevenSegStatLazy key={m.label} {...m} height={height} />
    ))}
  </div>
);

// Imported lazily to avoid a circular import at module init.
import SevenSegStat from '../components/sevenseg/SevenSegStat.jsx';
const SevenSegStatLazy = SevenSegStat;
