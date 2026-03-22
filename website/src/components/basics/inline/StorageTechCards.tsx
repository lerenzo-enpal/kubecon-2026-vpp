import { useState } from 'react';

interface TechCard {
  name: string;
  color: string;
  oneLiner: string;
  stats: string;
  verdict: string;
  details: string;
}

const TECHS: TechCard[] = [
  {
    name: 'Flywheels',
    color: '#22d3ee',
    oneLiner: 'A heavy spinning disc stores energy as rotational momentum.',
    stats: 'Seconds-minutes | 90-95% eff. | 100,000+ cycles',
    verdict: 'Best for instant grid frequency correction, not bulk storage.',
    details:
      'A motor spins a massive rotor in a vacuum chamber at tens of thousands of RPM. To store energy, the motor accelerates the rotor. To release it, the rotor drives a generator. Response time is near-instant -- under 4 milliseconds. The downside: energy bleeds away quickly through friction, so flywheels only work for very short bursts. They are used today at grid substations for frequency regulation.',
  },
  {
    name: 'Flow Batteries',
    color: '#a78bfa',
    oneLiner: 'Liquid electrolytes pumped through a cell stack, like a rechargeable fuel cell.',
    stats: '4-12h | 70-80% eff. | 20,000+ cycles',
    verdict: 'Duration champion for medium-scale storage. Expensive per kW, cheap per kWh.',
    details:
      'Two tanks of liquid electrolyte (often vanadium) are pumped past a membrane where ions exchange, storing or releasing electricity. Duration is set by tank size -- want more hours? Add more liquid. The power cell and the energy tanks are separate, which makes flow batteries uniquely flexible. They degrade very slowly, lasting 20+ years with minimal capacity loss. The tradeoff is low energy density and high upfront cost.',
  },
  {
    name: 'Compressed Air (CAES)',
    color: '#f59e0b',
    oneLiner: 'Surplus electricity compresses air into underground caverns; releasing it drives a turbine.',
    stats: '8-24h | 50-70% eff. | 30+ year lifespan',
    verdict: 'Massive scale possible, but needs the right geology.',
    details:
      'During off-peak hours, electric compressors force air into salt caverns, depleted gas fields, or purpose-built tanks. When power is needed, the compressed air is released through a turbine to generate electricity. The biggest challenge is heat: compressing air generates heat that is typically wasted, reducing efficiency. Advanced "adiabatic" designs capture and reuse that heat, pushing efficiency above 60%. Only two large plants exist today (Huntorf, Germany and McIntosh, Alabama), but new projects are under development worldwide.',
  },
  {
    name: 'Pumped Hydro',
    color: '#3b82f6',
    oneLiner: 'Water is pumped uphill to a reservoir, then released through turbines to generate power.',
    stats: '6-24h | 75-85% eff. | 50+ year lifespan',
    verdict: 'The proven giant. Over 90% of all grid storage worldwide is pumped hydro.',
    details:
      'Two reservoirs at different elevations connected by a tunnel. When electricity is cheap or abundant, pumps move water uphill. When demand spikes, water flows back down through turbines. The technology is over 100 years old and well understood. A single facility can store gigawatt-hours -- more than any battery installation. The catch: you need two large bodies of water with significant elevation difference. Most good sites in Europe and North America are already built out. New closed-loop designs using abandoned mines or artificial reservoirs are expanding the possibilities.',
  },
  {
    name: 'Gravity Storage',
    color: '#14b8a6',
    oneLiner: 'Heavy blocks are lifted to store energy and lowered to release it -- pumped hydro without water.',
    stats: '4-12h | 80-90% eff. | 35+ year lifespan',
    verdict: 'Promising newcomer. Simple physics, no water needed, but unproven at scale.',
    details:
      'Companies like Energy Vault and Gravitricity use electric motors to hoist concrete blocks or weights up a shaft or tower. Gravity pulls them down through generators when power is needed. The concept is elegant -- no exotic materials, no degradation, no fire risk. Energy Vault stacks 35-ton composite blocks using a crane system. Gravitricity lowers weights down mine shafts. Both are in pilot stage. The challenge is energy density: storing meaningful energy requires very heavy objects moved very high, which means large structures.',
  },
  {
    name: 'Thermal Storage',
    color: '#f97316',
    oneLiner: 'Heat (or cold) is stored in materials like molten salt, sand, or rocks.',
    stats: 'Hours-days | 50-70% eff. | 30+ year lifespan',
    verdict: 'Ideal for industrial heat and shifting solar energy to nighttime.',
    details:
      'Surplus electricity heats a storage medium -- molten salt at 565C, crushed rock, or even sand. When energy is needed, the heat drives a steam turbine or provides industrial process heat directly. Concentrated solar power plants in Spain and Nevada have used molten salt storage for over a decade. New startups store heat in volcanic rock or recycled steel. Round-trip electricity efficiency is modest (50-70%), but if the end use is heat anyway (industrial processes, district heating), effective efficiency approaches 95%.',
  },
  {
    name: 'Hydrogen',
    color: '#84cc16',
    oneLiner: 'Electrolysis splits water into hydrogen; fuel cells or turbines convert it back to electricity.',
    stats: 'Days-seasons | 30-40% eff. | Unlimited duration',
    verdict: 'The only option for seasonal storage. Efficiency is the price you pay for months of duration.',
    details:
      'An electrolyzer uses electricity to split water into hydrogen and oxygen. The hydrogen is stored in tanks, salt caverns, or pipeline networks -- indefinitely. When power is needed weeks or months later, fuel cells or hydrogen turbines convert it back. Round-trip efficiency is low (30-40%) because both conversion steps lose energy as heat. But hydrogen is the only technology that can bridge a two-week winter Dunkelflaute (dark doldrums) when solar and wind output collapse simultaneously. Germany is building a national hydrogen backbone pipeline for exactly this reason.',
  },
];

export default function StorageTechCards() {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  function toggle(idx: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {TECHS.map((tech, i) => {
        const isOpen = expanded.has(i);
        return (
          <button
            key={tech.name}
            type="button"
            onClick={() => toggle(i)}
            className="text-left w-full rounded-xl p-5 transition-colors duration-200 cursor-pointer"
            style={{
              background: 'var(--color-bg-alt)',
              border: `1px solid ${isOpen ? tech.color + '40' : 'var(--color-surface-light)'}`,
            }}
            aria-expanded={isOpen}
          >
            {/* Color dot + name */}
            <div className="flex items-center gap-3 mb-2">
              <span
                className="block w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: tech.color }}
              />
              <span className="font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                {tech.name}
              </span>
              <span
                className="ml-auto font-mono text-xs flex-shrink-0 transition-transform duration-200"
                style={{
                  color: 'var(--color-text-dim)',
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0)',
                }}
              >
                &#9656;
              </span>
            </div>

            {/* One-liner */}
            <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
              {tech.oneLiner}
            </p>

            {/* Stats line */}
            <div
              className="font-mono text-xs mb-2 px-2 py-1 rounded"
              style={{
                background: tech.color + '10',
                color: tech.color,
                border: `1px solid ${tech.color}20`,
              }}
            >
              {tech.stats}
            </div>

            {/* Verdict */}
            <p className="text-sm italic mb-0" style={{ color: 'var(--color-text-dim)' }}>
              {tech.verdict}
            </p>

            {/* Expanded details */}
            {isOpen && (
              <div
                className="mt-3 pt-3 text-sm leading-relaxed"
                style={{
                  borderTop: `1px solid ${tech.color}20`,
                  color: 'var(--color-text-muted)',
                }}
              >
                {tech.details}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
