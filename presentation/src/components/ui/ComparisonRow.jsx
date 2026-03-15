import React from 'react';
import { colors } from '../../theme';

export default function ComparisonRow({ label, value, color, barWidth }) {
  return (
    <div className="flex items-center gap-4 mb-3">
      <div className="w-[150px] text-[20px] font-medium text-hud-text-muted font-sans text-right">
        {label}
      </div>
      <div
        className="h-10 rounded-md flex items-center pl-3 transition-[width] duration-[800ms] ease-in-out"
        style={{
          width: `${barWidth}%`,
          background: `linear-gradient(90deg, ${color}30, ${color}80)`,
        }}
      >
        <span className="font-mono text-[20px] font-semibold text-hud-text">
          {value}
        </span>
      </div>
    </div>
  );
}
