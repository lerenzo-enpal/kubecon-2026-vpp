import React from 'react';
import { colors } from '../../theme';

export default function ComparisonRow({ label, value, color, barWidth }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
      <div style={{
        width: 120,
        fontSize: '16px',
        fontWeight: 500,
        color: colors.textMuted,
        fontFamily: '"Inter", system-ui, sans-serif',
        textAlign: 'right',
      }}>
        {label}
      </div>
      <div style={{
        height: 32,
        width: `${barWidth}%`,
        background: `linear-gradient(90deg, ${color}30, ${color}80)`,
        borderRadius: 6,
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 12,
        transition: 'width 0.8s ease',
      }}>
        <span style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: '14px',
          fontWeight: 600,
          color: colors.text,
        }}>
          {value}
        </span>
      </div>
    </div>
  );
}
