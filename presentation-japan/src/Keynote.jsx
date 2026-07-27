import React from 'react';
import { Deck, Slide, Notes, defaultTransition, fadeTransition } from 'spectacle';
import { useTheme } from './hooks/useTheme.js';
import { useLocale } from './hooks/useLocale.js';
import { PresentationChrome } from './components/PresentationChrome.jsx';
import StepBridge from './components/StepBridge.jsx';
import { JapanGridAtlas } from './components/JapanGridAtlas.jsx';
import { JapanEnergyOrigins } from './components/JapanEnergyOrigins.jsx';
import { JEPXPriceChart } from './components/JEPXPriceChart.jsx';
import VPPTransformationSequence, { buildOverlayLayers as buildVPPOverlayLayers } from './components/VPPTransformationSequence.jsx';
import { SlideTitle } from './components/SlideTitle.jsx';
import { AtlasLegend } from './components/AtlasLegend.jsx';
import JapanColdSnapCascade from './components/JapanColdSnapCascade.jsx';

const bg = 'var(--color-bg)';
const SECTIONS = ['Premise', 'Atlas', 'Energy', 'Hormuz', 'Grid pressure', 'VPP', 'Close'];
const TOTAL_SLIDES = 7;
const FORCED_DARK_SLIDES = new Set([4, 5, 6]);
const allAtlasLayers = () => ({ areas: true, transmission: true, plants: true, mix: true, demand: true, jepx: true });
const atlasSlidePreset = (step) => ({
  areas: true,
  transmission: true,
  plants: step === 1 ? 'east' : step === 2 ? 'west' : step >= 4 ? true : step === 3 ? false : false,
  mix: false,
});
const ATLAS_KEYFRAMES = [
  { longitude: 136.7, latitude: 36.3, zoom: 4.65, pitch: 25, bearing: 5 },
  { longitude: 140.0, latitude: 37.6, zoom: 5.3, pitch: 30, bearing: 5 },
  { longitude: 133.4, latitude: 34.6, zoom: 5.3, pitch: 30, bearing: 5 },
  { longitude: 137.45, latitude: 35.35, zoom: 6.7, pitch: 42, bearing: -4 },
  { longitude: 136.7, latitude: 36.3, zoom: 4.65, pitch: 25, bearing: 5 },
];
const ATLAS_STEP_COPY = [
  { eyebrow: 'ACT I / JAPAN’S GRID', title: 'Two grids, one country', subtitle: '50 Hz east, 60 Hz west — split at the Shizuoka seam.' },
  { eyebrow: 'ACT I / EAST 50 Hz', title: 'Where Tokyo draws power', subtitle: 'Nuclear, LNG, coal along the Pacific coast — TEPCO, Tohoku EP, JERA.' },
  { eyebrow: 'ACT I / WEST 60 Hz', title: 'Kansai and Kyushu', subtitle: 'KEPCO, Kyuden, Chugoku EP — nuclear + LNG feeding the west.' },
  { eyebrow: 'ACT I / SEAM · 137.4°E', title: 'One narrow bridge', subtitle: 'Sakuma & Higashi-Shimizu frequency converters — 2.1 GW cap between east and west.' },
  { eyebrow: 'ACT I / JAPAN’S GRID', title: 'Two grids, one country', subtitle: 'Every fuel, every operator — one atlas.' },
];
const HORMUZ_ROUTE = [[56.3, 26], [56.5, 23.5], [65, 17], [78, 8], [95, 5], [104, 1.5], [114, 10], [128, 22], [139.7, 35.7]];
const HORMUZ_VIEW = { longitude: 98, latitude: 22, zoom: 2.6, pitch: 30, bearing: 0 };
const HORMUZ_FOCUS_VIEW = { longitude: 56.3, latitude: 26.6, zoom: 4.5, pitch: 50, bearing: 18 };
const JAPAN_VIEW = { longitude: 139.75, latitude: 35.5, zoom: 6.4, pitch: 46, bearing: 14 };

function template({ slideNumber }) {
  const section = SECTIONS[slideNumber - 1] || '';
  const isForcedDark = FORCED_DARK_SLIDES.has(slideNumber);
  const dimColor = isForcedDark ? 'color-mix(in srgb, var(--color-washi-paper) 70%, transparent)' : 'var(--color-dim)';
  const sectionColor = isForcedDark ? 'color-mix(in srgb, var(--color-washi-paper) 42%, transparent)' : 'var(--color-heading)';
  return (
    <>
      <div style={{ position: 'absolute', top: 12, left: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: dimColor, letterSpacing: '0.15em' }}>LERENZO</div>
      <div style={{ position: 'absolute', bottom: 12, right: 20, fontFamily: 'var(--font-mono)', fontSize: 10, color: dimColor, display: 'flex', gap: 12 }}>
        {section && <span style={{ color: sectionColor }}>{section}</span>}
        <span>{slideNumber} / {TOTAL_SLIDES}</span>
      </div>
    </>
  );
}

export default function Keynote() {
  const { theme, cycleTheme, spectacleTheme } = useTheme();
  const { locale, setLocale } = useLocale();

  return (
    <>
      <PresentationChrome theme={theme} cycleTheme={cycleTheme} locale={locale} setLocale={setLocale} />
      <Deck theme={spectacleTheme} template={template} transition={defaultTransition} backdropStyle={{ backgroundColor: 'var(--color-washi-paper)' }}>
        <Slide backgroundColor="var(--color-washi-paper)" padding="0">
          <div data-testid="keynote-washi-premise" className="flex h-full flex-col justify-center gap-6 px-14">
            <div className="font-[var(--font-mono)] text-sm tracking-[0.16em] text-[var(--color-washi-alert)]">KUBECON + CLOUDNATIVECON JAPAN · YOKOHAMA</div>
            <h1 className="m-0 max-w-5xl font-[var(--font-heading)] text-6xl font-extrabold leading-tight text-[var(--color-washi-ink)]">The energy grid is becoming a cloud-native distributed system.</h1>
          </div>
          <Notes>[0:00-0:20 · 20s] One claim, five minutes to defend it. **The energy grid is becoming a cloud-native distributed system** — architecturally, not metaphorically. Same problems you solve daily: fleet coordination, latency budgets, failure domains. Japan is the concrete case. Beat: pause after "not metaphorically." See docs/keynote-speaker-notes.md.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0">
          <StepBridge count={4}>{rawStep => {
            const step = Math.min(Math.max(0, rawStep | 0), ATLAS_STEP_COPY.length - 1);
            const copy = ATLAS_STEP_COPY[step];
            return (
            <div data-testid="keynote-atlas-scene" className="relative h-full">
              <JapanGridAtlas
                step={step}
                preset={atlasSlidePreset}
                sceneLayer={{ view: ATLAS_KEYFRAMES[step] }}
                variant="washi"
                mapVariant="washi"
              />
              <div className="pointer-events-none absolute inset-0">
                <SlideTitle
                  testId="keynote-atlas-title"
                  eyebrow={copy.eyebrow}
                  title={copy.title}
                  subtitle={copy.subtitle}
                  variant="washi"
                />
                <AtlasLegend variant="washi" />
              </div>
            </div>
            );
          }}</StepBridge>
          <Notes>[0:20-1:35 · 75s · ~18s/step] Step 1 (0:20): One country, TWO grids. East=50Hz, west=60Hz. Between them 2 frequency converters — 2.1 GW total. That's the whole bridge. Step 2 (0:38): East = TEPCO/Tohoku EP/JERA. Nuclear + LNG on the Pacific coast — the shoreline that took the 2011 tsunami. Step 3 (0:56): West = KEPCO/Kyuden/Chugoku EP. Different frequency, more coal + solar. No fast way to help the east. Step 4 (1:14): One country, ten operators, two frequencies, 40+ data centers on order. LAND: "The coordination problem is the grid." That phrase is the pivot.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0" transition={fadeTransition}>
          <JapanEnergyOrigins />
          <Notes>[1:35-2:00 · 25s] METI FY2023 mix. **85% imported.** LNG → oil → coal reveal. Every kWh arrives by ship before it hits the wire. Not a market fact — a distributed system with a physical dependency graph. Graphs have chokepoints. Land "chokepoints" — that's the segue to slide 4.</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0" transition={fadeTransition}>
          <div data-testid="hormuz-scene" className="relative h-full" style={{ background: 'var(--color-washi-paper)' }}>
            <div className="absolute inset-0" style={{ filter: 'invert(0.92) hue-rotate(190deg) sepia(0.42) saturate(0.55) brightness(1.04) contrast(0.92)' }}>
              <JapanGridAtlas preset={allAtlasLayers} sceneLayer={{ view: HORMUZ_FOCUS_VIEW }} routeLayer={{ points: HORMUZ_ROUTE, view: HORMUZ_FOCUS_VIEW, targetView: JAPAN_VIEW, duration: 12000, delay: 1000, followShip: true, ship: { mesh: '/models/cargo-ship.obj' } }} />
            </div>
            <div className="pointer-events-none absolute inset-0" style={{ background: 'var(--color-washi-paper)', opacity: 0.18, mixBlendMode: 'multiply' }} />
            <div className="pointer-events-none absolute inset-0" data-testid="hormuz-route">
              <div style={{ position: 'absolute', zIndex: 2, top: 44, left: 48, maxWidth: 460 }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.16em', color: 'var(--color-washi-solar)' }}>ENERGY CORRIDOR</div>
                <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)', margin: '8px 0 0 0', fontSize: 48, fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.05 }}>Strait of Hormuz</h1>
                <p style={{ margin: '10px 0 0 0', color: 'var(--color-washi-ink)', fontFamily: 'var(--font-heading)', fontSize: 18, lineHeight: 1.4, fontWeight: 500 }}>One route carries Japan's Middle-East crude. A physical chokepoint upstream of the oil-fired thermal reserve that backs the grid.</p>
              </div>
              <div data-testid="hormuz-context" style={{ position: 'absolute', zIndex: 2, right: 32, top: 44, width: 320, borderLeft: '4px solid var(--color-washi-solar)', background: 'color-mix(in srgb, var(--color-washi-paper) 92%, transparent)', padding: 20, boxShadow: '0 6px 24px -12px rgba(23,37,84,0.35)' }}>
                <div data-testid="hormuz-context-card">
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.14em', color: 'var(--color-washi-solar)' }}>+¥15,000 · PER HOUSEHOLD</div>
                  <div style={{ marginTop: 8, fontFamily: 'var(--font-heading)', fontSize: 15, lineHeight: 1.45, color: 'var(--color-washi-ink)', fontWeight: 500 }}>A six-week Hormuz disruption in 2026 added ¥15,000 to every Japanese household's annual bill. A single chokepoint, priced at the wall socket.</div>
                </div>
              </div>
              <svg data-testid="hormuz-callout-leader" className="absolute inset-0 h-full w-full" aria-hidden="true"><path d="M 390 190 L 520 280" fill="none" stroke="var(--color-washi-solar)" strokeWidth="2" strokeDasharray="6 6" /></svg>
            </div>
          </div>
          <Notes>[2:00-2:25 · 25s] Strait of Hormuz. Single tanker route thousands of km upstream of Japan's oil refineries and the oil-fired thermal reserve that backs the grid. Six-week disruption in 2026 → +¥15,000 on every household's annual bill. You'd never accept this dependency in a system you designed from scratch. **But this is the system we have.** Question: what do you do when a SPOF sits 10,000 km away?</Notes>
        </Slide>

        <Slide backgroundColor="var(--color-washi-paper)" padding="0" transition={fadeTransition}>
          <StepBridge count={10}>{step => {
            const cascadeActive = step >= 1;
            return (
              <div data-testid="grid-pressure-scene" className="relative h-full">
                <div className="absolute inset-0" style={{ opacity: cascadeActive ? 1 : 0, transition: 'opacity 900ms ease-in-out' }}>
                  <JapanColdSnapCascade step={step} />
                </div>
                <div
                  className="pointer-events-none absolute inset-0 z-10"
                  style={{ background: 'var(--color-washi-paper)', opacity: cascadeActive ? 0 : 1, transition: 'opacity 900ms ease-in-out' }}
                >
                  <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center', padding: '0 48px' }}>
                    <div style={{ maxWidth: 900 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.2em', color: 'var(--color-washi-solar)' }}>ACT II · MARCH 2022</div>
                      <div style={{ width: 96, height: 3, background: 'var(--color-washi-solar)', margin: '22px auto' }} />
                      <h1 style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-washi-ink)', margin: 0, fontSize: 84, lineHeight: 1.02, fontWeight: 800, letterSpacing: '-0.01em' }}>Quake, then cold.</h1>
                      <p style={{ margin: '28px auto 0', color: 'var(--color-washi-ink)', fontFamily: 'var(--font-body, inherit)', fontSize: 22, lineHeight: 1.4, maxWidth: 640, opacity: 0.82 }}>A 60-second sequence that nearly broke Tokyo's grid.</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          }}</StepBridge>
          <Notes>[2:25-3:55 · 90s · 10 steps · THE MEAT] Step 0 (2:25): "March 2022. 60 seconds that nearly broke Tokyo's grid." Step 1 (2:33): OCCTO monitor boots — dual 50/60 Hz, reserve margin. Step 2 (2:40): MAR 16 23:36 M7.4 off Fukushima. Onagawa, Higashidori, Hitachinaka, Kashima trip in the same minute. Step 3 (2:49): MAR 17 — 6.5 GW east thermal offline, restarts slow. Step 4 (2:57): MAR 21 — arctic front from Hokkaido, heating demand +15%. Step 5 (3:05): MAR 22 morning — overcast + still, wind/solar → 0. Step 6 (3:13): west has spare power, converter caps at 2.1 GW — rescue can't fit through the bridge. Step 7 (3:22): 11:00 — Japan's FIRST-EVER power supply emergency warning. Reserve margin 2.5% vs 3% threshold. Step 8 (3:31): conservation call, JEPX spikes, memory of Jan 2021 (10→251 yen/kWh × 40 days). Step 9 (3:41): averted — but every winter carries this shape, and 40+ data centers lining up. LAND: "This isn't a one-time incident. It's the operating envelope." HARD PAUSE before slide 6.</Notes>
        </Slide>

        <Slide backgroundColor={bg} padding="0">
          <VPPTransformationSequence />
          <Notes>[3:55-4:35 · 40s] "So what do you do?" Look at slide 5 — it's a graph. Uneven load, chokepoints, coordination-limited. Familiar. Name the graph: a city. Millions of homes, roofs, cars, batteries — each already connected, each speaks a protocol. LAND: "A graph is a city, under load." Pull back to Japan: same graph with geography. Add three superpowers: **connected devices respond fast · batteries store energy · coordination uses both smarter than a human operator.** Twinkling houses across Japan visible by end of section.</Notes>
        </Slide>

        <Slide backgroundColor="#030508" padding="0" transition={fadeTransition}>
          <style>{`@keyframes keynoteClosingFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } } @keyframes keynoteClosingPulse { 0%, 100% { opacity: .72; } 50% { opacity: 1; } } .keynote-closing-asset { animation: keynoteClosingFloat 3.4s ease-in-out infinite, keynoteClosingPulse 3.4s ease-in-out infinite; } @keyframes keynoteClosingFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } } .keynote-closing-line { animation: keynoteClosingFadeIn 1000ms ease-out both; }`}</style>
          <div data-testid="keynote-washi-close" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#030508' }}>
            <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
              <JapanGridAtlas
                sceneLayer={{
                  view: { longitude: 138.0, latitude: 37.6, zoom: 4.35, pitch: 28, bearing: 6 },
                  getLayers: (t) => buildVPPOverlayLayers(t ?? performance.now(), 6),
                }}
              />
            </div>
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(3,5,8,0.55) 0%, rgba(3,5,8,0.15) 40%, rgba(3,5,8,0.7) 100%)', pointerEvents: 'none', zIndex: 2 }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 22, textAlign: 'center', pointerEvents: 'none' }}>
              <div className="keynote-closing-line" style={{ animationDelay: '80ms', fontFamily: 'JetBrains Mono, monospace', fontSize: 108, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, color: '#f1f5f9', textShadow: '0 0 40px rgba(255,194,23,0.35), 0 0 12px rgba(3,5,8,0.9)' }}>100K DEVICES</div>
              <div className="keynote-closing-line" style={{ animationDelay: '520ms', fontFamily: 'Space Grotesk, sans-serif', fontSize: 32, color: '#f1f5f9', opacity: 0.92, marginTop: 4 }}>coordinated by software</div>
              <div className="keynote-closing-line" style={{ animationDelay: '900ms', fontFamily: 'Space Grotesk, sans-serif', fontSize: 34, fontWeight: 700, color: '#ffc217', textShadow: '0 0 22px rgba(255,194,23,0.45)', marginTop: 18 }}>= 1 power plant, zero emissions</div>
              <div className="keynote-closing-line flex items-end justify-center gap-10" style={{ animationDelay: '1200ms', marginTop: 40 }} aria-label="Distributed energy assets">
                <div className="keynote-closing-asset flex flex-col items-center gap-1" style={{ animationDelay: '0ms' }}>
                  <svg role="img" aria-label="Home" viewBox="0 0 96 76" className="h-14 w-16 fill-none" style={{ stroke: '#e2e8f0', strokeWidth: 3 }}>
                    <path d="M12 38 48 10l36 28v27H12Z" fill="#67e8f9" opacity=".14" /><path d="M12 38 48 10l36 28M18 34v31h60V34M40 65V45h16v20" /><path d="M29 45h5M62 45h5" stroke="#ffc217" strokeWidth="5" />
                  </svg>
                  <span className="font-[var(--font-mono)] text-[11px] tracking-[0.14em]" style={{ color: '#94a3b8' }}>HOME</span>
                </div>
                <div className="keynote-closing-asset flex flex-col items-center gap-1" style={{ animationDelay: '220ms' }}>
                  <svg role="img" aria-label="Solar panel" viewBox="0 0 96 76" className="h-14 w-16 fill-none" style={{ stroke: '#e2e8f0', strokeWidth: 3 }}>
                    <path d="M18 18h60l-8 36H26Z" fill="#ffc217" opacity=".38" /><path d="M18 18h60l-8 36H26ZM31 30h42M28 42h42M39 18l-5 36M58 18l-5 36M48 54v12M35 66h26" />
                  </svg>
                  <span className="font-[var(--font-mono)] text-[11px] tracking-[0.14em]" style={{ color: '#94a3b8' }}>SOLAR</span>
                </div>
                <div className="keynote-closing-asset flex flex-col items-center gap-1" style={{ animationDelay: '440ms' }}>
                  <svg role="img" aria-label="EV" viewBox="0 0 96 76" className="h-14 w-16 fill-none" style={{ stroke: '#e2e8f0', strokeWidth: 3 }}>
                    <path d="M17 49h62v13H17Z" fill="#ef4444" opacity=".28" /><path d="m27 49 9-17h25l10 17M17 49h62v13H17ZM28 62a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm40 0a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM42 39h15" />
                  </svg>
                  <span className="font-[var(--font-mono)] text-[11px] tracking-[0.14em]" style={{ color: '#94a3b8' }}>EV</span>
                </div>
                <div className="keynote-closing-asset flex flex-col items-center gap-1" style={{ animationDelay: '660ms' }}>
                  <svg role="img" aria-label="Battery" viewBox="0 0 96 76" className="h-14 w-16 fill-none" style={{ stroke: '#e2e8f0', strokeWidth: 3 }}>
                    <rect x="25" y="12" width="46" height="55" rx="5" fill="#67e8f9" opacity=".14" /><path d="M35 12V7h26v5M25 12h46v55H25Z" /><path d="M48 23v29M36 37h24" stroke="#ffc217" strokeWidth="5" />
                  </svg>
                  <span className="font-[var(--font-mono)] text-[11px] tracking-[0.14em]" style={{ color: '#94a3b8' }}>BATTERY</span>
                </div>
              </div>
            </div>
            <div style={{ position: 'absolute', right: 44, bottom: 36, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, letterSpacing: '0.16em', color: '#94a3b8', zIndex: 3 }}>github.com/enpal · whatisavpp.com</div>
          </div>
          <Notes>[4:35-5:00 · 25s · CLOSER] "100K devices, coordinated by software, is one power plant with zero emissions." Then: "No new plants. No new transmission. No approvals. **Just code, Kubernetes, and the distributed system you already know how to build.** The grid is becoming cloud-native. Thank you." STOP. Do not add anything after "thank you." Silence is fine.</Notes>
        </Slide>
      </Deck>
    </>
  );
}
