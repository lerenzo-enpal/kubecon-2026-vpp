import { useRef, useEffect, useState } from 'react';

interface Milestone {
  year: number | string;
  label: string;
  highlight: boolean;
  detail: string;
  funFact?: string;
}

const MILESTONES: Milestone[] = [
  {
    year: '~600 BCE',
    label: 'Greeks discover static electricity',
    highlight: false,
    detail:
      'Thales of Miletus noticed that rubbing amber with fur attracted feathers and straw. The Greek word for amber -- elektron -- is where we get "electricity." For over 2,000 years after this, nobody really followed up. Electricity was a curiosity, not a tool.',
    funFact: 'The word "electricity" literally means "amber-ness."',
  },
  {
    year: '~250 BCE',
    label: 'The Baghdad Battery',
    highlight: false,
    detail:
      'A small clay jar found near Baghdad contained a copper cylinder and iron rod. Filled with vinegar, it could produce about 1 volt. Most archaeologists now believe it stored scrolls or served a ritual purpose -- but nobody knows for sure.',
    funFact: 'Mythbusters tested replicas and got them to produce voltage -- barely enough to tingle your tongue.',
  },
  {
    year: 1745,
    label: 'Leyden Jar captures charge',
    highlight: false,
    detail:
      'Pieter van Musschenbroek invented a glass jar lined with metal foil that could store static electricity -- the first capacitor. Touch the wrong part and it would knock you down. It proved electricity could be captured and saved.',
    funFact: 'In a famous demo, a Leyden jar was discharged through 200 monks holding hands. All 200 jumped simultaneously.',
  },
  {
    year: 1780,
    label: "Galvani's twitching frog legs",
    highlight: false,
    detail:
      "Luigi Galvani touched a metal scalpel to a dead frog's leg and watched it twitch. He thought he'd found \"animal electricity.\" He was wrong about why, but his rival Volta figured out the real cause -- two different metals creating a circuit through salty tissue -- and that led to the first battery.",
    funFact: 'The word "galvanize" (to shock into action) comes from his name.',
  },
  {
    year: 1800,
    label: 'Volta invents the pile',
    highlight: true,
    detail:
      "Alessandro Volta stacked alternating discs of zinc and copper separated by saltwater-soaked cardboard. It produced the first continuous flow of electricity in history. Every previous device was one-shot. Napoleon was so impressed he made Volta a Count.",
    funFact: 'The "volt" is named after him. He announced the invention in a letter to the Royal Society of London.',
  },
  {
    year: 1836,
    label: 'Daniell Cell: reliable power',
    highlight: false,
    detail:
      "John Frederic Daniell solved a major problem with Volta's pile -- hydrogen bubbles killed the current. His two-liquid design produced a steady 1.1 volts, reliable enough to power telegraph networks. Within a decade, telegraph wires stretched across continents.",
    funFact: 'The Daniell cell was so reliable it became the standard unit for measuring voltage.',
  },
  {
    year: 1859,
    label: 'Plante: first rechargeable',
    highlight: true,
    detail:
      'Gaston Plante invented the lead-acid battery -- two lead plates in sulfuric acid. For the first time, you could reverse the chemistry and recharge. Your car almost certainly has one right now, using the same basic tech from 1859.',
    funFact: 'Lead-acid batteries are the most recycled consumer product on Earth -- about 99% get recycled.',
  },
  {
    year: 1866,
    label: 'Leclanche: ancestor of AA',
    highlight: false,
    detail:
      "Georges Leclanche built a zinc-manganese dioxide cell with paste electrolyte. It wasn't rechargeable, but it was cheap, portable, and practical -- the direct ancestor of every disposable battery you've ever used.",
    funFact: 'The cheapest no-brand batteries at the checkout counter still use this basic chemistry.',
  },
  {
    year: 1899,
    label: 'Jungner: NiCd cell',
    highlight: false,
    detail:
      'Waldemar Jungner created the nickel-cadmium battery -- more rugged than lead-acid, worked in extreme temperatures, and could be recharged hundreds of times. It powered the cordless revolution: power tools, emergency lighting, early portable electronics.',
    funFact: 'NiCd batteries had "memory effect" -- recharge before fully draining and they\'d lose capacity. This quirk drove development of better alternatives.',
  },
  {
    year: 1955,
    label: 'Urry: alkaline batteries',
    highlight: false,
    detail:
      'Lewis Urry developed the modern alkaline battery at Eveready. It held 5-8x more energy than zinc-carbon cells and made portable electronics practical -- transistor radios, Walkmans, Game Boys, TV remotes.',
    funFact: 'Urry demonstrated the prototype by racing a toy car against a zinc-carbon one. The alkaline car went the length of the hallway; the other barely moved.',
  },
  {
    year: 1976,
    label: 'Whittingham: Li intercalation',
    highlight: true,
    detail:
      'M. Stanley Whittingham at Exxon demonstrated the first rechargeable lithium battery using titanium disulfide. It worked, but had a dangerous tendency to form dendrites that could short-circuit and catch fire. The lithium revolution had begun -- but it needed two more breakthroughs.',
  },
  {
    year: 1980,
    label: 'Goodenough: LiCoO2 cathode',
    highlight: true,
    detail:
      'At age 57, John B. Goodenough discovered that cobalt oxide could serve as the cathode, roughly doubling the voltage. The single most important material discovery in battery history. He would wait 39 years for his Nobel Prize.',
    funFact: 'Goodenough was 97 when he won the Nobel, making him the oldest laureate ever. He kept working in his lab at UT Austin until shortly before his death at 100.',
  },
  {
    year: 1985,
    label: 'Yoshino: carbon anode',
    highlight: false,
    detail:
      'Akira Yoshino replaced the dangerous pure lithium anode with a carbon-based material, eliminating the fire risk from dendrites. The lithium-ion battery was now safe enough to manufacture and sell.',
  },
  {
    year: 1991,
    label: 'Sony ships first Li-ion',
    highlight: true,
    detail:
      "Sony commercialized Yoshino's design in a camcorder battery. Within a decade, lithium-ion would be in every laptop and phone on Earth. Without this moment, the smartphone revolution simply doesn't happen.",
    funFact: 'Early Li-ion batteries cost ~$3,000/kWh. By 2024, prices fell below $140/kWh -- a 95%+ decline.',
  },
  {
    year: 2008,
    label: 'Tesla Roadster ships',
    highlight: false,
    detail:
      'Tesla proved that lithium-ion batteries could power a real car -- 0 to 60 in 3.7 seconds with a 244-mile range. The automotive industry had dismissed EVs as golf carts. The Roadster changed the conversation.',
  },
  {
    year: 2015,
    label: 'Tesla Powerwall launches',
    highlight: false,
    detail:
      'A sleek wall-mounted home battery that stores solar energy for nighttime use or blackout backup. Tesla made home batteries desirable and mainstream, reframing them from boring industrial equipment to a consumer product people wanted.',
    funFact: 'At the unveiling, the entire venue was secretly running on Powerwalls charged by solar panels -- revealed at the end.',
  },
  {
    year: 2017,
    label: 'Hornsdale Big Battery',
    highlight: true,
    detail:
      "After blackouts in South Australia, Elon Musk bet Tesla could build the world's largest Li-ion battery (100 MW) within 100 days or it's free. They finished in 60. It responded to a coal plant trip in 140 milliseconds -- before operators even knew there was a problem.",
    funFact: 'Saved ~$40 million in energy costs in its first year alone.',
  },
  {
    year: 2019,
    label: 'Nobel Prize for Li-ion',
    highlight: true,
    detail:
      'Goodenough, Whittingham, and Yoshino shared the Nobel Prize in Chemistry. The committee called lithium-ion batteries a technology that "created a rechargeable world." Validation that battery science is transformative fundamental science, not just engineering.',
  },
];

export default function BatteryTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      // Scroll to roughly the 1800s area
      el.scrollLeft = (el.scrollWidth - el.clientWidth) * 0.25;
    }
  }, []);

  const stemH = 32;
  const lineY = 160;
  const totalW = Math.max(1400, MILESTONES.length * 110);
  const selectedMilestone = selected !== null ? MILESTONES[selected] : null;

  return (
    <div className="w-full">
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto py-2"
        role="figure"
        aria-label="Battery technology timeline from 600 BCE to 2019"
      >
        <div className="relative" style={{ minWidth: totalW, height: 320, padding: '0 40px' }}>
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
              const isSelected = selected === i;
              const dotColor = m.highlight ? 'var(--color-primary)' : 'var(--color-text-dim)';
              const textColor = isSelected
                ? 'var(--color-text)'
                : m.highlight
                  ? 'var(--color-text)'
                  : 'var(--color-text-muted)';
              const yearColor = m.highlight ? 'var(--color-primary)' : 'var(--color-text-dim)';
              const dotSize = m.highlight ? 10 : 7;

              return (
                <div
                  key={String(m.year)}
                  className="relative flex flex-col items-center cursor-pointer group"
                  style={{
                    width: `${100 / MILESTONES.length}%`,
                    height: '100%',
                  }}
                  onClick={() => setSelected(isSelected ? null : i)}
                >
                  {/* Dot on the line */}
                  <div
                    className="absolute rounded-full transition-transform group-hover:scale-150"
                    style={{
                      top: lineY - dotSize / 2,
                      width: dotSize,
                      height: dotSize,
                      background: isSelected ? 'var(--color-text)' : dotColor,
                      boxShadow: isSelected
                        ? '0 0 14px var(--color-primary), 0 0 6px var(--color-primary)'
                        : m.highlight
                          ? '0 0 10px var(--color-primary), 0 0 4px var(--color-primary)'
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
                      background: isSelected
                        ? 'var(--color-primary)'
                        : m.highlight
                          ? 'var(--color-primary)'
                          : 'var(--color-surface-light)',
                      opacity: isSelected ? 0.8 : m.highlight ? 0.5 : 0.4,
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
                        color: isSelected ? 'var(--color-text)' : yearColor,
                        order: isTop ? 1 : 0,
                        textShadow: isSelected || m.highlight ? '0 0 12px rgba(34, 211, 238, 0.4)' : 'none',
                      }}
                    >
                      {m.year}
                    </span>

                    {/* Description */}
                    <span
                      className="text-sm text-center leading-snug mt-1 group-hover:opacity-100 transition-opacity"
                      style={{
                        color: textColor,
                        order: isTop ? 0 : 1,
                        opacity: isSelected ? 1 : m.highlight ? 1 : 0.7,
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

      {/* Detail panel */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{
          maxHeight: selectedMilestone ? 300 : 0,
          opacity: selectedMilestone ? 1 : 0,
        }}
      >
        {selectedMilestone && (
          <div
            className="mx-2 mt-2 rounded-lg px-5 py-4"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-surface-light)',
            }}
          >
            <div className="flex items-baseline gap-3 mb-2">
              <span
                className="font-mono text-lg font-bold"
                style={{ color: 'var(--color-primary)' }}
              >
                {selectedMilestone.year}
              </span>
              <span className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                {selectedMilestone.label}
              </span>
            </div>
            <p className="text-base leading-relaxed mb-2" style={{ color: 'var(--color-text-muted)' }}>
              {selectedMilestone.detail}
            </p>
            {selectedMilestone.funFact && (
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-dim)' }}>
                <span className="font-mono font-semibold mr-1" style={{ color: 'var(--color-accent)' }}>
                  FUN FACT:
                </span>
                {selectedMilestone.funFact}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
