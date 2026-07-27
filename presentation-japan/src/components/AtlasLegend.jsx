import React from 'react';
import { PLANT_COLORS, FREQUENCY_COLORS, FUEL_ICONS } from './JapanGridAtlas.jsx';

const rgba = (c) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${(c[3] ?? 255) / 255})`;

export function AtlasLegend({ className = '', testId = 'atlas-legend' }) {
  return (
    <aside
      data-testid={testId}
      className={`absolute right-8 top-8 w-64 bg-[color-mix(in_srgb,var(--color-bg)_86%,transparent)] p-4 ${className}`}
    >
      <div className="font-[var(--font-mono)] text-xs tracking-[0.16em] text-[var(--color-primary)]">LEGEND</div>

      <div className="mt-3 font-[var(--font-mono)] text-[10px] tracking-[0.14em] text-[var(--color-dim)]">FREQUENCY</div>
      <ul className="mt-1 grid gap-1 text-xs text-[var(--color-text)]">
        {[
          ['50 Hz east', FREQUENCY_COLORS['50 Hz']],
          ['60 Hz west', FREQUENCY_COLORS['60 Hz']],
          ['Seam / HVDC', FREQUENCY_COLORS.seam],
        ].map(([label, color]) => (
          <li key={label} className="flex items-center gap-2">
            <span aria-hidden="true" style={{ display: 'inline-block', width: 22, height: 3, background: rgba(color) }} />
            <span>{label}</span>
          </li>
        ))}
      </ul>

      <div className="mt-3 font-[var(--font-mono)] text-[10px] tracking-[0.14em] text-[var(--color-dim)]">GENERATION</div>
      <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-[var(--color-text)]">
        {Object.entries(PLANT_COLORS).map(([fuel, color]) => (
          <li key={fuel} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: rgba(color),
                color: '#0b1220',
                fontSize: 9,
                lineHeight: 1,
                fontWeight: 700,
              }}
            >
              {FUEL_ICONS[fuel]}
            </span>
            <span>{fuel}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
