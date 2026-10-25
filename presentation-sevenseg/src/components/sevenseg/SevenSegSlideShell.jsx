import React from 'react';
import { colors } from '../../theme.js';

/**
 * SevenSegSlideShell — the panel frame every slide sits in.
 *
 * Provides the black substrate, the pixel grid, the glass reflection, the slow
 * scan sweep and the corner metadata strip. Slides render their content as
 * children; the shell guarantees the whole deck reads as one continuous
 * instrument rather than a set of independent slides.
 *
 * Props:
 *   children   — slide content
 *   section    — section label for the footer strip
 *   index      — slide number (rendered in segments)
 *   total      — total slide count
 *   speaker    — optional speaker tag
 *   alert      — red/blink the frame (danger slides)
 *   padding    — content padding
 */
export default function SevenSegSlideShell({
  children,
  section,
  index,
  total,
  speaker,
  alert = false,
  padding = '34px 52px',
  contentStyle = {},
  style = {},
}) {
  const tone = alert ? colors.danger : colors.primary;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: colors.panel,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Panel pixel grid */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            `linear-gradient(to right, ${colors.gridLine}44 1px, transparent 1px),` +
            `linear-gradient(to bottom, ${colors.gridLine}44 1px, transparent 1px)`,
          backgroundSize: '8px 8px',
          opacity: 0.3,
        }}
      />

      {/* Glass reflection */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `radial-gradient(ellipse 80% 55% at 26% 4%, ${tone}0d 0%, transparent 60%)`,
        }}
      />

      {/* Vignette */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse 130% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.62) 100%)',
        }}
      />

      {/* Slow scan sweep */}
      <div className="seg-sweep" aria-hidden="true" style={{ top: 0 }} />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          height: '100%',
          padding,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          ...contentStyle,
        }}
      >
        {children}
      </div>

      {/* Corner metadata */}
      {speaker && (
        <div
          style={{
            position: 'absolute',
            top: 10,
            left: 16,
            zIndex: 4,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.2em',
            color: colors.textDim,
          }}
        >
          {speaker}
        </div>
      )}
      {(section || index != null) && (
        <div
          style={{
            position: 'absolute',
            bottom: 10,
            right: 16,
            zIndex: 4,
            display: 'flex',
            gap: 12,
            alignItems: 'baseline',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10,
            letterSpacing: '0.18em',
            color: colors.textDim,
          }}
        >
          {section && <span>{section}</span>}
          {index != null && (
            <span style={{ color: colors.textMuted }}>
              {String(index).padStart(2, '0')}
              {total != null ? ` / ${String(total).padStart(2, '0')}` : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
