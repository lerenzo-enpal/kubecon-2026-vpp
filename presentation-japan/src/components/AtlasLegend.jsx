import React, { useEffect, useRef, useState } from 'react';
import { PLANT_COLORS, FREQUENCY_COLORS, FUEL_ICONS } from './JapanGridAtlas.jsx';

const rgba = (c) => `rgba(${c[0]}, ${c[1]}, ${c[2]}, ${(c[3] ?? 255) / 255})`;

// Live sine wave — mimics AC oscillation. The `hz` prop scales the visible cycle rate
// (relative — 60 renders visibly faster than 50 side by side; both are slowed vs. real
// grid AC for legibility, matching the Amsterdam breakout convention). Kept slow
// enough that the 50 vs 60 Hz difference is legible at a glance.
export const HZ_VISUAL_RATE = 30; // cycles/sec = hz / HZ_VISUAL_RATE — see grid pulse below.
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
  // Phase advances proportional to hz, at 1/3 the previous speed — slow enough
  // that eye can catch the 50/60 Hz ratio side by side.
  const phase = t * (hz / HZ_VISUAL_RATE);
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

export function AtlasLegend({ className = '', testId = 'atlas-legend', variant = 'dark' }) {
  const isWashi = variant === 'washi';
  const bgVar = isWashi
    ? 'color-mix(in srgb, var(--color-washi-paper) 92%, transparent)'
    : 'color-mix(in srgb, var(--color-bg) 86%, transparent)';
  const headingColor = isWashi ? 'var(--color-washi-alert)' : 'var(--color-primary)';
  const dimColor = isWashi ? 'color-mix(in srgb, var(--color-washi-ink) 55%, transparent)' : 'var(--color-dim)';
  const textColor = isWashi ? 'var(--color-washi-ink)' : 'var(--color-text)';
  const borderStyle = isWashi ? '1px solid color-mix(in srgb, var(--color-washi-ink) 18%, transparent)' : undefined;
  return (
    <aside
      data-testid={testId}
      className={`absolute right-8 top-8 w-64 p-4 ${className}`}
      style={{ background: bgVar, border: borderStyle, borderRadius: 4 }}
    >
      <div className="font-[var(--font-mono)] text-xs tracking-[0.16em]" style={{ color: headingColor }}>LEGEND</div>

      <div className="mt-3 font-[var(--font-mono)] text-[10px] tracking-[0.14em]" style={{ color: dimColor }}>FREQUENCY</div>
      <ul className="mt-1 grid gap-1 text-xs" style={{ color: textColor }}>
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

      <div className="mt-3 font-[var(--font-mono)] text-[10px] tracking-[0.14em]" style={{ color: dimColor }}>GENERATION</div>
      <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs" style={{ color: textColor }}>
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
