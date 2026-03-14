import React from 'react';
import { colors } from '../theme';

export default function GridBackground({ opacity = 0.06 }) {
  return (
    <svg
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <defs>
        <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M 60 0 L 0 0 0 60"
            fill="none"
            stroke={colors.primary}
            strokeWidth="0.5"
            opacity={opacity}
          />
        </pattern>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={colors.primary} stopOpacity="0.08" />
          <stop offset="100%" stopColor={colors.primary} stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#glow)" />
    </svg>
  );
}
