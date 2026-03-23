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
    const el = scrollRef.current;
    if (el) {
      el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.4;
    }
  }, []);

  const stemH = 32;
  const lineY = 160;

  return (
    <div
      ref={scrollRef}
      className="w-full overflow-x-auto py-2"
      role="figure"
      aria-label="Battery technology timeline from 1800 to 2019"
    >
      <div className="relative" style={{ minWidth: 1080, height: 320, padding: '0 40px' }}>
        {/* Central timeline rail */}
        <div
          className="absolute left-10 right-10"
          style={{
            top: lineY,
            height: 2,
            background: 'linear-gradient(90deg, transparent, var(--color-surface-light) 5%, var(--color-surface-light) 95%, transparent)',
          }}
        />

        {/* Glow accent on the rail */}
        <div
          className="absolute left-10 right-10"
          style={{
            top: lineY - 1,
            height: 4,
            background: 'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.08) 20%, rgba(34, 211, 238, 0.08) 80%, transparent)',
            filter: 'blur(2px)',
          }}
        />

        {/* Milestones */}
        <div className="flex items-start justify-between w-full relative h-full" style={{ zIndex: 1 }}>
          {MILESTONES.map((m, i) => {
            const isTop = i % 2 === 0;
            const dotColor = m.highlight ? 'var(--color-primary)' : 'var(--color-text-dim)';
            const textColor = m.highlight ? 'var(--color-text)' : 'var(--color-text-muted)';
            const yearColor = m.highlight ? 'var(--color-primary)' : 'var(--color-text-dim)';
            const dotSize = m.highlight ? 10 : 7;

            return (
              <div
                key={m.year}
                className="relative flex flex-col items-center"
                style={{
                  width: `${100 / MILESTONES.length}%`,
                  height: '100%',
                }}
              >
                {/* Dot on the line */}
                <div
                  className="absolute rounded-full"
                  style={{
                    top: lineY - dotSize / 2,
                    width: dotSize,
                    height: dotSize,
                    background: dotColor,
                    boxShadow: m.highlight
                      ? `0 0 10px var(--color-primary), 0 0 4px var(--color-primary)`
                      : 'none',
                    zIndex: 2,
                  }}
                />

                {/* Stem line from dot to label */}
                <div
                  className="absolute left-1/2"
                  style={{
                    top: isTop ? lineY - stemH - 1 : lineY + dotSize / 2 + 1,
                    width: 1,
                    height: stemH,
                    background: m.highlight
                      ? 'var(--color-primary)'
                      : 'var(--color-surface-light)',
                    opacity: m.highlight ? 0.5 : 0.4,
                    transform: 'translateX(-0.5px)',
                  }}
                />

                {/* Label card */}
                <div
                  className="absolute left-1/2 flex flex-col items-center"
                  style={{
                    top: isTop ? undefined : lineY + stemH + dotSize / 2 + 6,
                    bottom: isTop ? 320 - lineY + stemH + 6 : undefined,
                    transform: 'translateX(-50%)',
                    width: 100,
                  }}
                >
                  {/* Year */}
                  <span
                    className="font-mono text-sm font-bold whitespace-nowrap tracking-wide"
                    style={{
                      color: yearColor,
                      order: isTop ? 1 : 0,
                      textShadow: m.highlight ? '0 0 12px rgba(34, 211, 238, 0.4)' : 'none',
                    }}
                  >
                    {m.year}
                  </span>

                  {/* Description */}
                  <span
                    className="text-sm text-center leading-snug mt-1"
                    style={{
                      color: textColor,
                      order: isTop ? 0 : 1,
                      opacity: m.highlight ? 1 : 0.7,
                    }}
                  >
                    {m.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
