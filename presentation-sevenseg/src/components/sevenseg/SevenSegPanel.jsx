import React from 'react';
import { colors, getDisplay } from '../../theme.js';

/**
 * SevenSegPanel — the display substrate a readout sits in.
 *
 * Renders the black panel, the pixel grid, the glass reflection and the slow
 * scan sweep. Every readout on the deck sits in one of these, which is what
 * makes the whole talk read as a single continuous instrument rather than a
 * set of slides.
 *
 * Props:
 *   label      — small caption strip above the readout
 *   children   — the readout
 *   accent     — border/accent color (defaults to the emitter)
 *   alert      — enable the blink treatment
 *   sweep      — show the slow scan sweep (default true)
 *   grid       — show the panel pixel grid (default true)
 *   glow       — outer bloom intensity 0..1
 */
export default function SevenSegPanel({
  label,
  children,
  accent,
  alert = false,
  sweep = true,
  grid = true,
  glow = 0.5,
  padding = '14px 18px',
  style = {},
}) {
  const tone = accent || colors.primary;
  const display = getDisplay();

  return (
    <div
      style={{
        position: 'relative',
        background: colors.panel,
        border: `1px solid ${tone}40`,
        borderRadius: 3,
        padding,
        overflow: 'hidden',
        boxShadow: `inset 0 0 40px rgba(0,0,0,0.85), 0 0 ${18 * glow}px ${tone}${glow > 0.6 ? '35' : '20'}`,
        ...style,
      }}
    >
      {/* Panel pixel grid */}
      {grid && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            backgroundImage:
              `linear-gradient(to right, ${colors.gridLine}55 1px, transparent 1px),` +
              `linear-gradient(to bottom, ${colors.gridLine}55 1px, transparent 1px)`,
            backgroundSize: '6px 6px',
            opacity: 0.35,
          }}
        />
      )}

      {/* Glass reflection */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse 75% 60% at 28% 6%, ${display.glass} 0%, transparent 62%)`,
        }}
      />

      {/* Slow scan sweep */}
      {sweep && (
        <div className="seg-sweep" aria-hidden="true" style={{ top: 0 }} />
      )}

      <div style={{ position: 'relative', zIndex: 2 }} className={alert ? 'seg-blink' : undefined}>
        {label && (
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: colors.textDim,
              marginBottom: 8,
            }}
          >
            {label}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
