import { useState } from 'react';

interface TechData {
  name: string;
  color: string;
  duration: string;
  efficiency: string;
  cycles: string;
  costPerKWh: string;
  maturity: string;
  scalability: string;
}

const ALL_TECHS: TechData[] = [
  { name: 'Li-ion',          color: '#10b981', duration: '1-4h',      efficiency: '85-95%',  cycles: '3,000-10,000', costPerKWh: '$150-300', maturity: 'Commercial', scalability: 'MW-scale' },
  { name: 'Flywheels',       color: '#22d3ee', duration: 'sec-min',   efficiency: '90-95%',  cycles: '100,000+',     costPerKWh: '$1,000+',  maturity: 'Commercial', scalability: 'kW-MW' },
  { name: 'Flow Batteries',  color: '#a78bfa', duration: '4-12h',     efficiency: '70-80%',  cycles: '20,000+',      costPerKWh: '$300-500', maturity: 'Early commercial', scalability: 'MW-scale' },
  { name: 'Compressed Air',  color: '#f59e0b', duration: '8-24h',     efficiency: '50-70%',  cycles: '30+ years',    costPerKWh: '$50-100',  maturity: 'Demonstration', scalability: 'GW-scale' },
  { name: 'Pumped Hydro',    color: '#3b82f6', duration: '6-24h',     efficiency: '75-85%',  cycles: '50+ years',    costPerKWh: '$50-150',  maturity: 'Mature',     scalability: 'GW-scale' },
  { name: 'Gravity',         color: '#14b8a6', duration: '4-12h',     efficiency: '80-90%',  cycles: '35+ years',    costPerKWh: '$200-400', maturity: 'Pilot',      scalability: 'MW-scale' },
  { name: 'Thermal',         color: '#f97316', duration: 'hours-days', efficiency: '50-70%',  cycles: '30+ years',    costPerKWh: '$20-60',   maturity: 'Commercial', scalability: 'MW-GW' },
  { name: 'Hydrogen',        color: '#84cc16', duration: 'days-seasons', efficiency: '30-40%', cycles: 'Unlimited',   costPerKWh: '$15-30',   maturity: 'Early commercial', scalability: 'GW-scale' },
];

const COLUMNS = ['duration', 'efficiency', 'cycles', 'costPerKWh', 'maturity', 'scalability'] as const;
const COLUMN_LABELS: Record<typeof COLUMNS[number], string> = {
  duration: 'Duration',
  efficiency: 'Efficiency',
  cycles: 'Lifespan',
  costPerKWh: 'Cost / kWh',
  maturity: 'Maturity',
  scalability: 'Scale',
};

export default function StorageComparisonTool() {
  const [selected, setSelected] = useState<Set<number>>(new Set([0, 2, 4, 7]));

  function toggle(idx: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        if (next.size > 1) next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  const visible = ALL_TECHS.filter((_, i) => selected.has(i));

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
        <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Compare Technologies</span>
      </div>

      {/* Toggle chips */}
      <div className="flex flex-wrap gap-2 mb-5">
        {ALL_TECHS.map((t, i) => (
          <button
            key={t.name}
            type="button"
            onClick={() => toggle(i)}
            className="px-3 py-1.5 rounded-lg text-sm font-mono cursor-pointer transition-colors"
            style={{
              background: selected.has(i) ? t.color + '20' : 'var(--color-surface)',
              color: selected.has(i) ? t.color : 'var(--color-text-dim)',
              border: `1px solid ${selected.has(i) ? t.color + '40' : 'var(--color-surface-light)'}`,
            }}
          >
            {t.name}
          </button>
        ))}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
          <thead>
            <tr>
              <th className="text-left py-2 pr-4 font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>
                Technology
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col}
                  className="text-left py-2 px-3 font-mono text-xs"
                  style={{ color: 'var(--color-text-dim)' }}
                >
                  {COLUMN_LABELS[col]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((tech) => (
              <tr key={tech.name} style={{ borderTop: '1px solid var(--color-surface-light)' }}>
                <td className="py-2 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: tech.color }} />
                    <span className="font-medium" style={{ color: tech.color }}>{tech.name}</span>
                  </div>
                </td>
                {COLUMNS.map((col) => (
                  <td key={col} className="py-2 px-3 font-mono text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {tech[col]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
