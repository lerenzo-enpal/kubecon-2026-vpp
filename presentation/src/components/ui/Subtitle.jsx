import React from 'react';
import { colors } from '../../theme';

export default function Subtitle({ children, color = colors.textMuted, size = '24px' }) {
  return (
    <div style={{
      color,
      fontSize: size,
      fontFamily: '"Inter", system-ui, sans-serif',
      fontWeight: 400,
      lineHeight: 1.5,
      maxWidth: 800,
    }}>
      {children}
    </div>
  );
}
