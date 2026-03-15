import React from 'react';
import { colors } from '../../theme';

export default function StatCard({ number, label, color = colors.primary, unit = '' }) {
  return (
    <div className="bg-hud-surface border border-hud-surface-light rounded-xl px-6 py-7 text-center flex-1 min-w-[160px]">
      <div
        className="text-[42px] font-extrabold font-mono"
        style={{ color, textShadow: `0 0 30px ${color}30` }}
      >
        {number}<span className="text-[22px] font-normal text-hud-text-muted">{unit}</span>
      </div>
      <div className="text-[14px] font-medium text-hud-text-muted mt-2 font-sans uppercase tracking-[0.05em]">
        {label}
      </div>
    </div>
  );
}
