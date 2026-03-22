import { useState } from 'react';
import FullscreenWrapper from '../../FullscreenWrapper';

type Fit = 'excellent' | 'possible' | 'poor';

interface TechFit {
  fit: Fit;
  reason: string;
}

interface Scenario {
  label: string;
  description: string;
  durationNeeded: string;
  responseTime: string;
  fits: Record<string, TechFit>;
}

interface TechSpecs {
  responseTime: string;
  duration: string;
  efficiency: string;
  costPerKwh: string;
  cycleLife: string;
}

const TECH_NAMES = ['Li-ion', 'Flow Battery', 'Pumped Hydro', 'CAES', 'Gravity', 'Thermal', 'Hydrogen', 'Flywheel'] as const;

const TECH_SPECS: Record<string, TechSpecs> = {
  'Li-ion':       { responseTime: '<1s',      duration: '1-4h',     efficiency: '90-95%', costPerKwh: '$150-300', cycleLife: '3,000-5,000' },
  'Flow Battery': { responseTime: '<1s',      duration: '4-12h',    efficiency: '70-80%', costPerKwh: '$200-500', cycleLife: '20,000+' },
  'Pumped Hydro': { responseTime: '30-90s',   duration: '6-24h',    efficiency: '75-85%', costPerKwh: '$50-150',  cycleLife: '50,000+' },
  'CAES':         { responseTime: '5-15min',  duration: '8-24h',    efficiency: '40-70%', costPerKwh: '$50-100',  cycleLife: '30,000+' },
  'Gravity':      { responseTime: '~30s',     duration: '4-12h',    efficiency: '80-85%', costPerKwh: '$150-250', cycleLife: '35,000+' },
  'Thermal':      { responseTime: '10-30min', duration: 'Hours-Days', efficiency: '50-95%', costPerKwh: '$20-60', cycleLife: '30,000+' },
  'Hydrogen':     { responseTime: '1-10min',  duration: 'Days-Months', efficiency: '30-40%', costPerKwh: '$500-1500', cycleLife: '20,000+' },
  'Flywheel':     { responseTime: '<0.1s',    duration: 'Sec-Min',  efficiency: '85-95%', costPerKwh: '$1000-5000', cycleLife: '100,000+' },
};

const SCENARIOS: Scenario[] = [
  {
    label: 'Frequency response',
    description: 'Grid frequency drops below 49.8 Hz. Storage must inject power within milliseconds to prevent cascading failure.',
    durationNeeded: 'Seconds to minutes',
    responseTime: 'Sub-second',
    fits: {
      'Li-ion':       { fit: 'excellent', reason: 'Fast response, proven in frequency markets worldwide.' },
      'Flow Battery': { fit: 'possible',  reason: 'Fast enough, but oversized for seconds-scale needs.' },
      'Pumped Hydro': { fit: 'poor',      reason: 'Too slow to ramp -- 30-90 seconds to respond.' },
      'CAES':         { fit: 'poor',      reason: 'Minutes to start. Not suitable for fast response.' },
      'Gravity':      { fit: 'poor',      reason: 'Mechanical ramp time is too slow.' },
      'Thermal':      { fit: 'poor',      reason: 'Cannot convert heat to electricity fast enough.' },
      'Hydrogen':     { fit: 'poor',      reason: 'Fuel cells need minutes to ramp.' },
      'Flywheel':     { fit: 'excellent', reason: 'Sub-millisecond response. Built for this exact job.' },
    },
  },
  {
    label: 'Daily peak shaving',
    description: 'Charge during cheap midday solar, discharge during the expensive 5-9 PM evening peak. Every day.',
    durationNeeded: '2-4 hours',
    responseTime: 'Minutes',
    fits: {
      'Li-ion':       { fit: 'excellent', reason: 'Perfect sweet spot: 2-4h duration, high efficiency, proven.' },
      'Flow Battery': { fit: 'possible',  reason: 'Works well at 4h, but higher cost per cycle than Li-ion.' },
      'Pumped Hydro': { fit: 'excellent', reason: 'Cheapest per-cycle cost, but needs geography.' },
      'CAES':         { fit: 'possible',  reason: 'Works, but lower efficiency and slower response.' },
      'Gravity':      { fit: 'possible',  reason: 'Good fit at 4h, still maturing commercially.' },
      'Thermal':      { fit: 'poor',      reason: 'Conversion losses make it uneconomic for daily cycling.' },
      'Hydrogen':     { fit: 'poor',      reason: '60-70% energy loss makes daily cycling far too expensive.' },
      'Flywheel':     { fit: 'poor',      reason: 'Cannot sustain discharge for hours.' },
    },
  },
  {
    label: 'Evening ramp',
    description: 'Solar drops to zero while demand surges. Grid needs 4-8 hours of stored energy to bridge the gap until overnight demand falls.',
    durationNeeded: '4-8 hours',
    responseTime: 'Minutes',
    fits: {
      'Li-ion':       { fit: 'possible',  reason: 'Works up to 4h, gets expensive beyond that.' },
      'Flow Battery': { fit: 'excellent', reason: 'Ideal range. Add bigger tanks for more hours cheaply.' },
      'Pumped Hydro': { fit: 'excellent', reason: 'Built for exactly this duration at lowest cost.' },
      'CAES':         { fit: 'excellent', reason: 'Sweet spot for compressed air: 8+ hours at GWh scale.' },
      'Gravity':      { fit: 'possible',  reason: 'Good up to 8h but limited commercial track record.' },
      'Thermal':      { fit: 'possible',  reason: 'Can bridge the gap, but conversion to electricity adds cost.' },
      'Hydrogen':     { fit: 'poor',      reason: 'Efficiency losses make it uneconomic at this duration.' },
      'Flywheel':     { fit: 'poor',      reason: 'Minutes of storage, not hours.' },
    },
  },
  {
    label: 'Week-long dunkelflaute',
    description: 'A cold, windless, overcast week in winter. Little wind or solar for 5-7 days. The grid must rely on stored energy.',
    durationNeeded: 'Days',
    responseTime: 'Hours acceptable',
    fits: {
      'Li-ion':       { fit: 'poor',      reason: 'Far too expensive at multi-day durations.' },
      'Flow Battery': { fit: 'poor',      reason: 'Tank size for 7 days would be impractical.' },
      'Pumped Hydro': { fit: 'possible',  reason: 'Could help for a day or two, not a full week.' },
      'CAES':         { fit: 'possible',  reason: 'Large caverns could store days of energy.' },
      'Gravity':      { fit: 'poor',      reason: 'Not enough energy density for multi-day storage.' },
      'Thermal':      { fit: 'possible',  reason: 'Insulated thermal stores can hold heat for days.' },
      'Hydrogen':     { fit: 'excellent', reason: 'The only technology that can store enough energy for a full week.' },
      'Flywheel':     { fit: 'poor',      reason: 'Seconds of storage. Completely wrong timescale.' },
    },
  },
  {
    label: 'Seasonal balancing',
    description: 'Store summer solar surplus for winter demand. Store spring wind for calm summer. Months of storage.',
    durationNeeded: 'Months',
    responseTime: 'Hours acceptable',
    fits: {
      'Li-ion':       { fit: 'poor',      reason: 'Self-discharge and cost make seasonal storage impossible.' },
      'Flow Battery': { fit: 'poor',      reason: 'Tank volumes for months of storage are infeasible.' },
      'Pumped Hydro': { fit: 'poor',      reason: 'Reservoir size for seasonal storage is impractical.' },
      'CAES':         { fit: 'poor',      reason: 'Even the largest caverns hold days, not months.' },
      'Gravity':      { fit: 'poor',      reason: 'Energy density far too low for seasonal.' },
      'Thermal':      { fit: 'possible',  reason: 'Underground thermal stores can hold heat for months with good insulation.' },
      'Hydrogen':     { fit: 'excellent', reason: 'Store H2 in salt caverns or pipelines for months. The only viable option.' },
      'Flywheel':     { fit: 'poor',      reason: 'Seconds of storage. Off by 7 orders of magnitude.' },
    },
  },
];

const FIT_COLORS: Record<Fit, { bg: string; text: string; border: string }> = {
  excellent: { bg: 'rgba(16, 185, 129, 0.15)', text: 'var(--color-success)', border: 'rgba(16, 185, 129, 0.3)' },
  possible:  { bg: 'rgba(245, 158, 11, 0.15)', text: 'var(--color-accent)', border: 'rgba(245, 158, 11, 0.3)' },
  poor:      { bg: 'rgba(239, 68, 68, 0.15)', text: 'var(--color-danger)', border: 'rgba(239, 68, 68, 0.3)' },
};

function FitBadge({ fit }: { fit: Fit }) {
  const c = FIT_COLORS[fit];
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-mono uppercase"
      style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}
    >
      {fit}
    </span>
  );
}

export default function StorageScenarioBuilder() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const scenario = SCENARIOS[selectedIdx];

  // Sort technologies by fit quality
  const sortedTechs = [...TECH_NAMES].sort((a, b) => {
    const order: Record<Fit, number> = { excellent: 0, possible: 1, poor: 2 };
    return order[scenario.fits[a].fit] - order[scenario.fits[b].fit];
  });

  return (
    <FullscreenWrapper label="Storage Scenario Builder">
      <div className="rounded-lg p-4 md:p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}>
        {/* Scenario buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          {SCENARIOS.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSelectedIdx(i)}
              className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors"
              style={{
                background: i === selectedIdx ? 'var(--color-primary)' : 'var(--color-bg-alt)',
                color: i === selectedIdx ? 'var(--color-bg)' : 'var(--color-text-muted)',
                border: `1px solid ${i === selectedIdx ? 'var(--color-primary)' : 'var(--color-surface-light)'}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Scenario description */}
        <div className="mb-6 p-4 rounded" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text)' }}>{scenario.description}</p>
          <div className="flex gap-4 mt-2">
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>
              Duration needed: <span style={{ color: 'var(--color-primary)' }}>{scenario.durationNeeded}</span>
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>
              Response time: <span style={{ color: 'var(--color-primary)' }}>{scenario.responseTime}</span>
            </span>
          </div>
        </div>

        {/* Results panel */}
        <div className="space-y-2 mb-6">
          {sortedTechs.map((techName) => {
            const techFit = scenario.fits[techName];
            return (
              <div
                key={techName}
                className="flex items-center gap-3 p-2 rounded"
                style={{ background: 'var(--color-bg)', border: '1px solid var(--color-surface-light)' }}
              >
                <div className="w-28 flex-shrink-0">
                  <span className="text-xs font-mono font-bold" style={{ color: 'var(--color-text)' }}>{techName}</span>
                </div>
                <FitBadge fit={techFit.fit} />
                <span className="text-xs" style={{ color: 'var(--color-text-dim)' }}>{techFit.reason}</span>
              </div>
            );
          })}
        </div>

        {/* Comparison table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-surface-light)' }}>
                <th className="text-left p-2" style={{ color: 'var(--color-text-muted)' }}>Technology</th>
                <th className="text-left p-2" style={{ color: 'var(--color-text-muted)' }}>Response</th>
                <th className="text-left p-2" style={{ color: 'var(--color-text-muted)' }}>Duration</th>
                <th className="text-left p-2" style={{ color: 'var(--color-text-muted)' }}>Efficiency</th>
                <th className="text-left p-2" style={{ color: 'var(--color-text-muted)' }}>$/kWh</th>
                <th className="text-left p-2" style={{ color: 'var(--color-text-muted)' }}>Cycles</th>
              </tr>
            </thead>
            <tbody>
              {TECH_NAMES.map((name) => {
                const specs = TECH_SPECS[name];
                const fitColor = FIT_COLORS[scenario.fits[name].fit].text;
                return (
                  <tr key={name} style={{ borderBottom: '1px solid var(--color-surface-light)' }}>
                    <td className="p-2 font-bold" style={{ color: fitColor }}>{name}</td>
                    <td className="p-2" style={{ color: 'var(--color-text-dim)' }}>{specs.responseTime}</td>
                    <td className="p-2" style={{ color: 'var(--color-text-dim)' }}>{specs.duration}</td>
                    <td className="p-2" style={{ color: 'var(--color-text-dim)' }}>{specs.efficiency}</td>
                    <td className="p-2" style={{ color: 'var(--color-text-dim)' }}>{specs.costPerKwh}</td>
                    <td className="p-2" style={{ color: 'var(--color-text-dim)' }}>{specs.cycleLife}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </FullscreenWrapper>
  );
}
