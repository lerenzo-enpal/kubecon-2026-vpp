import React from 'react';
import { colors } from '../../theme';

export default function Subtitle({ children, color = colors.textMuted, size = '24px' }) {
  return (
    <div
      className="font-sans font-normal leading-normal max-w-[800px]"
      style={{ color, fontSize: size }}
    >
      {children}
    </div>
  );
}
