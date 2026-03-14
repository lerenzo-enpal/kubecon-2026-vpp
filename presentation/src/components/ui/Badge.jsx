import React from 'react';
import { colors } from '../../theme';

export default function Badge({ children, color = colors.primary }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: 20,
      fontSize: '13px',
      fontWeight: 600,
      fontFamily: '"JetBrains Mono", monospace',
      background: `${color}18`,
      color,
      border: `1px solid ${color}30`,
    }}>
      {children}
    </span>
  );
}
