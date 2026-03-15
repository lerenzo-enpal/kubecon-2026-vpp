import React from 'react';
import { colors } from '../../theme';

export default function TimelineItem({ year, event, color = colors.danger, impact }) {
  return (
    <div className="flex gap-4 items-start mb-4">
      <div
        className="font-mono text-[20px] font-bold min-w-[50px]"
        style={{ color, textShadow: `0 0 20px ${color}40` }}
      >
        {year}
      </div>
      <div>
        <div className="text-[20px] font-semibold text-hud-text font-sans">
          {event}
        </div>
        {impact && (
          <div className="text-[20px] text-hud-text-muted font-sans mt-0.5">
            {impact}
          </div>
        )}
      </div>
    </div>
  );
}
