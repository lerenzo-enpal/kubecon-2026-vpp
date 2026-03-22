import { useRef, useEffect } from 'react';

interface Milestone {
  year: number;
  label: string;
  highlight: boolean;
}

const MILESTONES: Milestone[] = [
  { year: 1800, label: 'Volta invents the pile', highlight: true },
  { year: 1859, label: 'Plante: lead-acid', highlight: false },
  { year: 1899, label: 'Junger: NiCd cell', highlight: false },
  { year: 1912, label: 'Lewis: lithium concept', highlight: false },
  { year: 1976, label: 'Whittingham: Li intercalation', highlight: true },
  { year: 1980, label: 'Goodenough: LiCoO2 cathode', highlight: false },
  { year: 1985, label: 'Yoshino: carbon anode', highlight: false },
  { year: 1991, label: 'Sony ships first Li-ion', highlight: true },
  { year: 2008, label: 'Tesla Roadster ships', highlight: false },
  { year: 2015, label: 'Tesla Powerwall launches', highlight: false },
  { year: 2017, label: 'Hornsdale Big Battery', highlight: true },
  { year: 2019, label: 'Nobel Prize for Li-ion', highlight: true },
];

export default function BatteryTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // On mount, scroll to show the middle of the timeline
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.4;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto py-4"
      role="figure"
      aria-label="Battery technology timeline from 1800 to 2019"
    >
      <div className="relative flex items-center" style={{ minWidth: 960, height: 200, padding: '0 32px' }}>
        {/* Horizontal line */}
        <div
          className="absolute left-8 right-8"
          style={{
            top: 90,
            height: 2,
            background: 'var(--color-surface-light)',
          }}
        />

        {/* Milestones */}
        <div className="flex items-center justify-between w-full relative" style={{ zIndex: 1 }}>
          {MILESTONES.map((m, i) => {
            const dotColor = m.highlight ? 'var(--color-primary)' : 'var(--color-text-dim)';
            const textColor = m.highlight ? 'var(--color-text)' : 'var(--color-text-dim)';
            const yearColor = m.highlight ? 'var(--color-primary)' : 'var(--color-text-dim)';
            const dotSize = m.highlight ? 12 : 8;

            return (
              <div
                key={m.year}
                className="flex flex-col items-center"
                style={{ width: `${100 / MILESTONES.length}%` }}
              >
                {/* Year above */}
                <span
                  className="font-mono text-xs font-semibold mb-2 whitespace-nowrap"
                  style={{ color: yearColor }}
                >
                  {m.year}
                </span>

                {/* Dot */}
                <div
                  className="rounded-full flex-shrink-0"
                  style={{
                    width: dotSize,
                    height: dotSize,
                    background: dotColor,
                    boxShadow: m.highlight ? `0 0 8px ${dotColor}` : 'none',
                  }}
                />

                {/* Label below */}
                <span
                  className="text-xs text-center mt-2 leading-tight"
                  style={{
                    color: textColor,
                    maxWidth: 80,
                    opacity: m.highlight ? 1 : 0.7,
                  }}
                >
                  {m.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
