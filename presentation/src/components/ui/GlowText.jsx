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
    <div
      className="font-sans leading-[1.1]"
      style={{
        color,
        fontSize: size,
        fontWeight: weight,
        textShadow: `0 0 40px ${color}40, 0 0 80px ${color}20`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
