import React from 'react';
import { colors } from '../../theme';

export default function StatCard({ number, label, color = colors.primary, unit = '' }) {
  return (
    <div style={{
      background: colors.surface,
      border: `1px solid ${colors.surfaceLight}`,
      borderRadius: 12,
      padding: '28px 24px',
      textAlign: 'center',
      flex: 1,
      minWidth: 160,
    }}>
      <div style={{
        fontSize: '42px',
        fontWeight: 800,
        fontFamily: '"JetBrains Mono", monospace',
        color,
        textShadow: `0 0 30px ${color}30`,
      }}>
        {number}<span style={{ fontSize: '22px', fontWeight: 400, color: colors.textMuted }}>{unit}</span>
      </div>
      <div style={{
        fontSize: '14px',
        fontWeight: 500,
        color: colors.textMuted,
        marginTop: 8,
        fontFamily: '"Inter", system-ui, sans-serif',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </div>
    </div>
  );
}
