import { useState } from 'react';

interface TechCard {
  id: string;
  title: string;
  desc: string;
  maturity: number; // 0-3: Research, Prototype, Pilot, Commercial
  expected: string;
  advantage: string;
  challenge: string;
  players: string;
  detail: string;
}

const maturityLabels = ['Research', 'Prototype', 'Pilot', 'Commercial'];

const techs: TechCard[] = [
  {
    id: 'solid-state',
    title: 'Solid-State',
    desc: 'Replace liquid electrolyte with a solid one.',
    maturity: 1,
    expected: 'Late 2020s',
    advantage: '2x energy density, no fire risk',
    challenge: 'Manufacturing at scale',
    players: 'Toyota, QuantumScape',
    detail:
      'Solid-state batteries replace the flammable liquid electrolyte with a ceramic or polymer solid. This eliminates dendrite growth (a major cause of fires) and enables lithium metal anodes, roughly doubling energy density. The main barrier is cost-effective manufacturing: solid electrolytes are brittle and difficult to produce in thin, uniform layers at gigafactory scale.',
  },
  {
    id: 'sodium-ion',
    title: 'Sodium-Ion',
    desc: 'No lithium needed. Cheaper and more abundant.',
    maturity: 3,
    expected: 'Shipping now',
    advantage: 'Cheaper, abundant materials, no lithium or cobalt',
    challenge: 'Lower energy density (~60% of Li-ion)',
    players: 'CATL, BYD',
    detail:
      'Sodium-ion batteries use sodium instead of lithium, which is 1,000x more abundant in the Earth\'s crust. CATL began mass production in 2023. While energy density is lower than Li-ion (making them less ideal for EVs), they excel in stationary storage where weight matters less. They also perform better in cold weather and have no risk of over-discharge damage.',
  },
  {
    id: 'silicon-anodes',
    title: 'Silicon Anodes',
    desc: '10x the anode capacity of graphite.',
    maturity: 2,
    expected: 'Pure silicon late 2020s',
    advantage: '10x anode capacity, major range boost',
    challenge: '300% volume swelling during charge',
    players: 'Sila Nano, Amprius',
    detail:
      'Silicon can theoretically store 10x more lithium per gram than graphite. The problem: silicon swells by 300% when lithium ions enter, cracking the electrode and destroying the battery within dozens of cycles. Current solutions blend small amounts of silicon into graphite anodes (5-10%). Pure silicon anodes using nanostructured or porous designs are in pilot production.',
  },
  {
    id: 'lithium-sulfur',
    title: 'Lithium-Sulfur',
    desc: '5x theoretical energy density. Ultra-light.',
    maturity: 0,
    expected: 'Niche applications 2028+',
    advantage: '5x theoretical energy density, very light',
    challenge: 'Cycle life under 500 cycles',
    players: 'Oxis Energy, Lyten',
    detail:
      'Lithium-sulfur batteries promise the highest theoretical energy density of any battery chemistry (2,600 Wh/kg vs ~250 Wh/kg for Li-ion). Sulfur is also extremely cheap and abundant. The catch: polysulfide shuttle effect causes rapid capacity fade, limiting cycle life to under 500 cycles. Best suited for aviation and space where weight matters more than longevity.',
  },
];

export default function UpcomingBatteryTech() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {/* Shared maturity legend bar */}
      <div className="flex gap-1 mb-1">
        {maturityLabels.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5 flex-1">
            {i > 0 && (
              <div
                className="flex-shrink-0"
                style={{
                  width: 12,
                  height: 1,
                  background: 'var(--color-surface-light)',
                }}
              />
            )}
            <div
              className="flex-1 text-center py-1.5 rounded font-mono text-sm"
              style={{
                background: 'var(--color-bg-alt)',
                color: 'var(--color-text-dim)',
                border: '1px solid var(--color-surface-light)',
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Tech cards */}
      {techs.map((tech) => {
        const isOpen = expanded === tech.id;
        const matLabel = maturityLabels[tech.maturity];
        return (
          <button
            key={tech.id}
            onClick={() => setExpanded(isOpen ? null : tech.id)}
            className="text-left rounded-lg p-4 transition-colors cursor-pointer"
            style={{
              background: 'var(--color-surface)',
              border: `1px solid ${isOpen ? 'var(--color-primary)' : 'var(--color-surface-light)'}`,
            }}
          >
            {/* Top row: title, maturity badge, expected, expand */}
            <div className="flex items-start gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h4 className="font-mono text-sm font-bold" style={{ color: 'var(--color-text)', margin: 0 }}>
                    {tech.title}
                  </h4>
                  <span
                    className="font-mono text-sm px-2 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: 'rgba(34, 211, 238, 0.12)',
                      color: 'var(--color-primary)',
                      border: '1px solid rgba(34, 211, 238, 0.25)',
                    }}
                  >
                    {matLabel}
                  </span>
                  <span
                    className="font-mono text-sm px-2 py-0.5 rounded flex-shrink-0"
                    style={{
                      background: 'var(--color-bg-alt)',
                      color: 'var(--color-text-dim)',
                      border: '1px solid var(--color-surface-light)',
                    }}
                  >
                    {tech.expected}
                  </span>
                </div>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)', margin: 0 }}>
                  {tech.desc}
                </p>
              </div>
              <span
                className="font-mono text-sm flex-shrink-0 mt-0.5 px-2 py-0.5 rounded transition-colors"
                style={{
                  color: isOpen ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  background: isOpen ? 'rgba(34, 211, 238, 0.08)' : 'var(--color-bg-alt)',
                  border: `1px solid ${isOpen ? 'rgba(34, 211, 238, 0.2)' : 'var(--color-surface-light)'}`,
                }}
              >
                {isOpen ? '- less' : '+ more'}
              </span>
            </div>

            {/* Key facts */}
            <div className="flex flex-col gap-1 text-sm" style={{ color: 'var(--color-text-muted)' }}>
              <div>
                <span className="font-mono" style={{ color: 'var(--color-success)' }}>+</span>{' '}
                {tech.advantage}
              </div>
              <div>
                <span className="font-mono" style={{ color: 'var(--color-danger)' }}>-</span>{' '}
                {tech.challenge}
              </div>
              <div>
                <span className="font-mono" style={{ color: 'var(--color-text-dim)' }}>Players:</span>{' '}
                {tech.players}
              </div>
            </div>

            {/* Expanded detail */}
            {isOpen && (
              <div
                className="mt-3 pt-3 text-sm"
                style={{
                  color: 'var(--color-text-muted)',
                  borderTop: '1px solid var(--color-surface-light)',
                }}
              >
                {tech.detail}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
