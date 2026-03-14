import React from 'react';
import { colors } from '../../theme';

export default function TimelineItem({ year, event, color = colors.danger, impact }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 16 }}>
      <div style={{
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: '16px',
        fontWeight: 700,
        color,
        minWidth: 50,
        textShadow: `0 0 20px ${color}40`,
      }}>
        {year}
      </div>
      <div>
        <div style={{
          fontSize: '18px',
          fontWeight: 600,
          color: colors.text,
          fontFamily: '"Inter", system-ui, sans-serif',
        }}>
          {event}
        </div>
        {impact && (
          <div style={{
            fontSize: '14px',
            color: colors.textMuted,
            fontFamily: '"Inter", system-ui, sans-serif',
            marginTop: 2,
          }}>
            {impact}
          </div>
        )}
      </div>
    </div>
  );
}
