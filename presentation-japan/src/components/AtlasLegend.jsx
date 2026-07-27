import React, { useEffect, useRef, useState } from 'react';
import { PLANT_COLORS, FREQUENCY_COLORS, FUEL_ICONS } from './JapanGridAtlas.jsx';

const rgba = (c) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${(c[3] ?? 255) / 255})`;

// Live sine wave — mimics AC oscillation. The `hz` prop scales the visible cycle rate
// (relative — 60 renders visibly faster than 50 side by side; both are slowed vs. real
// grid AC for legibility, matching the Amsterdam breakout convention).
function FrequencyWave({ color, hz, width = 44, height = 12 }) {
  const [t, setT] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    let start = performance.now();
    const tick = (now) => {
      setT((now - start) / 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);
  const cycles = 2;
  const amp = height * 0.35;
  const midY = height / 2;
  // Phase advances proportional to hz — 60 Hz swatch runs at 1.2× the 50 Hz rate.
  const phase = t * (hz / 10);
  const pts = [];
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * width;
    const arg = (i / steps) * Math.PI * 2 * cycles - phase * Math.PI * 2;
    const y = midY - Math.sin(arg) * amp;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden="true" style={{ display: 'block', overflow: 'visible' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.6"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

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
          { label: '50 Hz east', hz: 50, color: FREQUENCY_COLORS['50 Hz'] },
          { label: '60 Hz west', hz: 60, color: FREQUENCY_COLORS['60 Hz'] },
          { label: 'Seam / HVDC', hz: 0, color: FREQUENCY_COLORS.seam },
        ].map(({ label, hz, color }) => (
          <li key={label} className="flex items-center gap-2">
            {hz > 0 ? (
              <FrequencyWave color={rgba(color)} hz={hz} />
            ) : (
              <span aria-hidden="true" style={{ display: 'inline-block', width: 44, height: 3, background: rgba(color) }} />
            )}
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
