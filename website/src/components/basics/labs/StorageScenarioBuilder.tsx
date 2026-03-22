import { useState, useCallback } from 'react';

interface Scenario {
  tech: string;
  color: string;
  hours: number;
  mw: number;
}

const TECH_OPTIONS = [
  { name: 'Li-ion', color: '#10b981', maxHours: 4, defaultMW: 100 },
  { name: 'Flow Battery', color: '#a78bfa', maxHours: 12, defaultMW: 50 },
  { name: 'Pumped Hydro', color: '#3b82f6', maxHours: 24, defaultMW: 500 },
  { name: 'Compressed Air', color: '#f59e0b', maxHours: 24, defaultMW: 300 },
  { name: 'Hydrogen', color: '#84cc16', maxHours: 720, defaultMW: 200 },
];

export default function StorageScenarioBuilder() {
  const [picks, setPicks] = useState<Scenario[]>([]);

  const addTech = useCallback((idx: number) => {
    const t = TECH_OPTIONS[idx];
    setPicks((prev) => [...prev, { tech: t.name, color: t.color, hours: t.maxHours, mw: t.defaultMW }]);
  }, []);

  const removeTech = useCallback((idx: number) => {
    setPicks((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const totalMWh = picks.reduce((s, p) => s + p.mw * p.hours, 0);

  return (
    <div
      className="my-6 rounded-xl p-6"
      style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <span
          className="font-mono text-xs px-2 py-0.5 rounded"
          style={{ background: 'rgba(34, 211, 238, 0.1)', color: 'var(--color-primary)', border: '1px solid rgba(34, 211, 238, 0.2)' }}
        >
          Interactive
        </span>
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Build Your Storage Portfolio</span>
      </div>

      {/* Technology selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TECH_OPTIONS.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onClick={() => addTech(i)}
            className="px-3 py-1.5 rounded-lg text-sm font-mono cursor-pointer transition-colors"
            style={{
              background: t.color + '15',
              color: t.color,
              border: `1px solid ${t.color}30`,
            }}
          >
            + {t.name}
          </button>
        ))}
      </div>

      {/* Selected technologies */}
      {picks.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'var(--color-text-dim)' }}>
          Click a technology above to add it to your portfolio.
        </p>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {picks.map((p, i) => (
            <div
              key={`${p.tech}-${i}`}
              className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: p.color + '10', border: `1px solid ${p.color}20` }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="text-sm font-mono" style={{ color: p.color }}>{p.tech}</span>
              <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
                {p.mw} MW x {p.hours}h = {(p.mw * p.hours).toLocaleString()} MWh
              </span>
              <button
                type="button"
                onClick={() => removeTech(i)}
                className="ml-auto text-xs px-2 py-1 rounded cursor-pointer"
                style={{ color: 'var(--color-text-dim)', background: 'var(--color-surface)' }}
              >
                remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      {picks.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-lg"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}
        >
          <span className="font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>TOTAL</span>
          <span className="font-mono text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
            {totalMWh.toLocaleString()} MWh
          </span>
          <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>
            across {picks.length} {picks.length === 1 ? 'technology' : 'technologies'}
          </span>
        </div>
      )}
    </div>
  );
}
