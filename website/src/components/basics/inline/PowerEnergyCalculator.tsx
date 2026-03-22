import { useState } from 'react';

export default function PowerEnergyCalculator() {
  const [power, setPower] = useState(2000);
  const [hours, setHours] = useState(3);
  const energy = (power * hours) / 1000;
  const avgCost = 0.30;
  const cost = energy * avgCost;

  const examples = [
    { name: 'LED Bulb', watts: 10 },
    { name: 'Laptop', watts: 65 },
    { name: 'Fridge', watts: 150 },
    { name: 'Washing Machine', watts: 500 },
    { name: 'Hair Dryer', watts: 2000 },
    { name: 'EV Charger', watts: 7400 },
  ];

  return (
    <div className="my-8 rounded-lg overflow-hidden p-4" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}>
      <div className="font-mono text-xs uppercase tracking-wide mb-4" style={{ color: 'var(--color-text-muted)' }}>
        Power vs Energy Calculator
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {examples.map((ex) => (
          <button
            key={ex.name}
            onClick={() => setPower(ex.watts)}
            className="px-3 py-1.5 rounded font-mono text-xs transition-colors"
            style={{
              background: power === ex.watts ? 'var(--color-primary)' : 'var(--color-surface)',
              color: power === ex.watts ? 'var(--color-bg)' : 'var(--color-text-dim)',
              border: '1px solid var(--color-surface-light)',
            }}
          >
            {ex.name} ({ex.watts}W)
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <label className="flex flex-col gap-1">
          <span className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>
            Power: {power.toLocaleString()} W ({(power / 1000).toFixed(1)} kW)
          </span>
          <input
            type="range"
            min={5}
            max={10000}
            step={5}
            value={power}
            onChange={(e) => setPower(Number(e.target.value))}
            className="w-full"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="font-mono text-sm" style={{ color: 'var(--color-accent)' }}>
            Duration: {hours} hour{hours !== 1 ? 's' : ''}
          </span>
          <input
            type="range"
            min={0.5}
            max={24}
            step={0.5}
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="w-full"
          />
        </label>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-3 rounded text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}>
          <div className="font-mono text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-dim)' }}>Power (rate)</div>
          <div className="font-mono text-xl" style={{ color: 'var(--color-accent)' }}>{(power / 1000).toFixed(1)} kW</div>
        </div>
        <div className="p-3 rounded text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}>
          <div className="font-mono text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-dim)' }}>Energy (total)</div>
          <div className="font-mono text-xl" style={{ color: 'var(--color-primary)' }}>{energy.toFixed(1)} kWh</div>
        </div>
        <div className="p-3 rounded text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}>
          <div className="font-mono text-xs uppercase tracking-wide mb-1" style={{ color: 'var(--color-text-dim)' }}>Cost (~{avgCost * 100}ct/kWh)</div>
          <div className="font-mono text-xl" style={{ color: 'var(--color-danger)' }}>{cost.toFixed(2)} EUR</div>
        </div>
      </div>

      <div className="mt-4 p-3 rounded font-mono text-center text-base" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)', color: 'var(--color-text-muted)' }}>
        Energy = Power x Time&nbsp;&nbsp;|&nbsp;&nbsp;{energy.toFixed(1)} kWh = {(power / 1000).toFixed(1)} kW x {hours}h
      </div>
    </div>
  );
}
