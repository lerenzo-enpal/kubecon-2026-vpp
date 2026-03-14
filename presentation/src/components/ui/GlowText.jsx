import React from 'react';
import { colors } from '../../theme';

export default function GlowText({
  children,
  color = colors.primary,
  size = '64px',
  weight = 800,
  style = {},
}) {
  return (
    <div style={{
      color,
      fontSize: size,
      fontWeight: weight,
      fontFamily: '"Inter", system-ui, sans-serif',
      textShadow: `0 0 40px ${color}40, 0 0 80px ${color}20`,
      lineHeight: 1.1,
      ...style,
    }}>
      {children}
    </div>
  );
}
