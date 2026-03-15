import React from 'react';
import { colors } from '../../theme';

export default function Badge({ children, color = colors.primary }) {
  return (
    <span
      className="inline-block px-4 py-1.5 rounded-full text-[20px] font-semibold font-mono"
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}30`,
      }}
    >
      {children}
    </span>
  );
}
