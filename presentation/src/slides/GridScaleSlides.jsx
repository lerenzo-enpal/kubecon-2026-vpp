import React from 'react';
import { Slide, Appear, Notes } from 'spectacle';
import { colors } from '../theme';
import { SlideContainer, GlowText, Subtitle } from '../components/ui';
import GridPulse from '../components/GridPulse';
import LargestMachineZoom from '../components/LargestMachineZoom';

/**
 * Three substantially different versions of bridge slides between
 * "Texas Grid Failure" and "Frequency/Balancing Act".
 *
 * Each version has 2 slides that establish the grid as the largest machine
 * ever built before we dive into frequency dynamics.
 *
 * Usage: import { versionA, versionB, versionC } from './GridScaleSlides'
 *        then spread into the deck: ...versionA()
 */

// ═══════════════════════════════════════════════════════════════════════════
// VERSION A: "The Living Grid"
// Animated EU grid map + dramatic stat comparison
// Visual-heavy, uses the EUGridMap canvas component
// ═══════════════════════════════════════════════════════════════════════════
export function versionA() {
  return [
    /* ── A-2: The Numbers ── */
    <Slide key="grid-scale-a2" backgroundColor={colors.bg} padding="36px 56px">
      <div className="flex flex-col h-full w-full">
          <GlowText size="40px" style={{ marginBottom: 20 }}>
            Running the Largest Machine
          </GlowText>
          <div className="flex-1 flex items-center">
            <div className="flex gap-6 w-full max-w-[880px] mx-auto">
              <div className="flex-1 rounded-xl p-6" style={{
                background: `${colors.accent}06`,
                border: `1px solid ${colors.accent}20`,
              }}>
                <div className="text-[22px] font-semibold text-hud-accent font-sans mb-3">
                  vs. Volkswagen Wolfsburg
                </div>
                <div className="text-[20px] text-hud-text-muted font-sans leading-relaxed">
                  The world's largest factory has 60,000 workers over 6.5 km².
                  <br />The grid has <span className="text-hud-text font-semibold">2.3 million workers</span> across <span className="text-hud-text font-semibold">5.5 million km²</span>.
                </div>
              </div>
              <div className="flex-1 rounded-xl p-6" style={{
                background: `${colors.danger}06`,
                border: `1px solid ${colors.danger}20`,
              }}>
                <div className="text-[22px] font-semibold text-hud-danger font-sans mb-3">
                  Zero Downtime
                </div>
                <div className="text-[20px] text-hud-text-muted font-sans leading-relaxed">
                  Unlike any factory, the grid has never been shut down.
                  It runs 24/7, 365 days a year. <span className="text-hud-text font-semibold">It cannot stop.</span>
                </div>
              </div>
            </div>
          </div>
          <Appear>
            <div className="flex gap-3 w-full">
              {[
                { v: '36', u: 'countries', c: colors.primary, d: 'synced on one frequency' },
                { v: '305K km', u: '', c: colors.primary, d: 'transmission lines' },
                { v: '400M', u: '', c: colors.success, d: 'connected consumers' },
                { v: '1,100 GW', u: '', c: colors.secondary, d: 'installed capacity' },
                { v: '3,000 TWh', u: '', c: colors.accent, d: 'annual production' },
              ].map((s, i) => (
                <div key={i} className="flex-1 min-w-0 bg-hud-surface rounded-lg px-4 py-4 text-center" style={{ border: `1px solid ${s.c}15` }}>
                  <div className="text-[32px] font-extrabold font-mono whitespace-nowrap" style={{ color: s.c }}>
                    {s.v}{s.u && <span className="text-[20px] font-normal text-hud-text-muted ml-0.5">{s.u}</span>}
                  </div>
                  <div className="text-[16px] text-hud-text-muted font-sans mt-1">{s.d}</div>
                </div>
              ))}
            </div>
          </Appear>
        </div>
      <Notes>
        "This machine has never been turned off. There is no maintenance window.
        No 'we'll fix it in staging.' It's production, all the time, forever.
        Sound familiar? That's basically an SRE's worst nightmare — except it's
        physical infrastructure spread across an entire continent."
      </Notes>
    </Slide>,
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSION B: "By the Numbers"
// Text-driven dramatic reveal with Appear animations
// Cinematic feel — numbers appear one by one, build tension
// ═══════════════════════════════════════════════════════════════════════════
export function versionB() {
  const rows = [
    {
      grid: 'Every electron consumed the instant it\'s produced',
      tech: 'The internet can drop packets and retry',
      color: colors.danger,
    },
    {
      grid: 'Zero storage — no buffer between supply and demand',
      tech: 'Software systems have caches, queues, CDNs',
      color: colors.accent,
    },
    {
      grid: 'Failure cascades by physics — unstoppable',
      tech: 'Failure is contained by circuit breakers and retries',
      color: colors.primary,
    },
    {
      grid: '2.3 million workers. Never a maintenance window.',
      tech: '30,000 flights/day in EU ATC — but planes can hold',
      color: colors.success,
    },
  ];

  return [
    <Slide key="grid-scale-b2" backgroundColor={colors.bg} padding="36px 56px">
      <style>{`
        @keyframes gridRowIn {
          0% { opacity: 0; transform: translateX(-30px); filter: blur(4px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes techRowIn {
          0% { opacity: 0; transform: translateX(30px); filter: blur(4px); }
          100% { opacity: 1; transform: translateX(0); filter: blur(0); }
        }
        @keyframes vsIn {
          0% { opacity: 0; transform: scale(0.5); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
      <div className="flex flex-col h-full w-full items-center" style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, pointerEvents: 'none' }}>
          <span style={{ fontSize: '300px', fontWeight: 900, color: 'rgba(239, 68, 68, 0.3)', fontFamily: '"JetBrains Mono"' }}>&#x2715;</span>
        </div>
        <GlowText size="40px" style={{ textAlign: 'center', marginBottom: 0 }}>
          The Grid vs. Tech Infrastructure
        </GlowText>
        <div className="flex-1 flex flex-col justify-center w-full max-w-[880px] gap-5">
          {rows.map((row, i) => {
            const delay = 0.3 + i * 0.35;
            return (
              <div key={i} className="flex gap-4 items-start">
                <div className="flex-1 rounded-lg p-4" style={{
                  background: `${row.color}06`,
                  border: `1px solid ${row.color}15`,
                  animation: `gridRowIn 0.6s ease-out ${delay}s both`,
                }}>
                  <div className="text-[20px] font-semibold font-sans" style={{ color: row.color }}>
                    {row.grid}
                  </div>
                </div>
                <div className="text-[22px] text-hud-text-dim font-mono pt-3" style={{
                  animation: `vsIn 0.3s ease-out ${delay + 0.15}s both`,
                }}>vs</div>
                <div className="flex-1 rounded-lg p-4 bg-hud-surface border border-hud-surface-light" style={{
                  animation: `techRowIn 0.6s ease-out ${delay + 0.1}s both`,
                }}>
                  <div className="text-[20px] text-hud-text-muted font-sans">
                    {row.tech}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Notes>
        "This is the key insight for this audience. Software engineers build fault-tolerant
        systems every day. Circuit breakers, retries, caches, load balancers. The grid has NONE
        of that. It cascades by physics. That's why when it fails, it fails catastrophically.
        And that's why the frequency line matters so much — it's the only SLO the grid has."
      </Notes>
    </Slide>,
  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSION C: "The Synchronized Dance"
// GridPulse animation + dramatic "journey of electricity" narrative
// Focuses on the synchronization aspect and the fragility
// ═══════════════════════════════════════════════════════════════════════════
export function versionC() {
  return [
    /* ── C-1: The Synchronized Grid ── */
    <Slide key="grid-scale-c1" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 50 }}>
        <GlowText size="44px" style={{ marginBottom: 12 }}>
          One Machine, One Heartbeat
        </GlowText>
        <Subtitle size="20px">
          36 countries. 400 million people. Every generator spinning in perfect synchrony at 50 Hz.
        </Subtitle>
        <div className="mt-4 flex justify-center">
          <GridPulse width={800} height={360} />
        </div>
        <Appear>
          <div className="mt-4 text-center text-[20px] text-hud-text-muted font-sans max-w-[700px] mx-auto">
            If a power plant trips in Lisbon, a control room in Berlin
            sees the frequency dip within <span className="text-hud-primary font-semibold">one second</span>.
          </div>
        </Appear>
      </SlideContainer>
      <Notes>
        "Watch those nodes pulse. They're all pulsing together — that's the point.
        The entire Continental European grid is one synchronized machine. When one
        part slows down, every other part feels it. Instantly. There's no isolation.
        No blast radius. No circuit breaker between countries."
      </Notes>
    </Slide>,

  ];
}

// ═══════════════════════════════════════════════════════════════════════════
// VERSION D: "The Zoom Out"
// Starts with stat boxes, dramatic ZERO DOWNTIME reveal, then a full-slide
// zoom-out animation comparing VW Wolfsburg (60K) to the EU grid (2.3M).
// ═══════════════════════════════════════════════════════════════════════════
export function versionD() {
  return [
    <Slide key="grid-scale-d1" backgroundColor={colors.bg} padding="0">
      <div className="relative w-full h-full">
        {/* Canvas animation layer — full bleed */}
        <LargestMachineZoom />

        {/* Content overlay with padding */}
        <div className="absolute inset-0 z-10 flex flex-col" style={{ padding: '36px 56px' }}>
          {/* Title — always visible */}
          <GlowText size="40px">Running the Largest Machine</GlowText>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Stat boxes at bottom — always visible */}
          <div className="flex gap-3 w-full">
            {[
              { v: '36', u: 'countries', c: colors.primary, d: 'synced on one frequency' },
              { v: '305K km', u: '', c: colors.primary, d: 'transmission lines' },
              { v: '400M', u: '', c: colors.success, d: 'connected consumers' },
              { v: '1,100 GW', u: '', c: colors.secondary, d: 'installed capacity' },
              { v: '3,000 TWh', u: '', c: colors.accent, d: 'annual production' },
            ].map((s, i) => (
              <div key={i} className="flex-1 min-w-0 rounded-lg px-4 py-4 text-center" style={{
                background: `${colors.surface}cc`,
                border: `1px solid ${s.c}15`,
                backdropFilter: 'blur(8px)',
              }}>
                <div className="text-[32px] font-extrabold font-mono whitespace-nowrap" style={{ color: s.c }}>
                  {s.v}{s.u && <span className="text-[20px] font-normal text-hud-text-muted ml-0.5">{s.u}</span>}
                </div>
                <div className="text-[16px] text-hud-text-muted font-sans mt-1">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Notes>
        "This is the largest machine ever built. Let that sink in.
        Zero downtime — it has never been turned off. No maintenance window.
        No 'we'll fix it in staging.' It's production, all the time, forever.
        And look at the scale: VW Wolfsburg, the world's biggest factory,
        is a speck compared to this grid. 60,000 workers vs 2.3 million.
        This is the system we're asking to absorb 50% renewables."
      </Notes>
    </Slide>,
  ];
}
