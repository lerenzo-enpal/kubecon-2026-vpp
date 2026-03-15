import React from 'react';
import { Slide, Appear, Notes } from 'spectacle';
import { colors } from '../theme';
import { SlideContainer, GlowText, Subtitle } from '../components/ui';
import GridPulse from '../components/GridPulse';

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
    <Slide key="grid-scale-a2" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <GlowText size="40px" style={{ marginBottom: 28 }}>
          Running the Largest Machine
        </GlowText>
        <div className="grid grid-cols-3 gap-4 max-w-[880px]">
          {[
            { v: '36', u: 'countries', c: colors.primary, d: 'synchronized to one frequency' },
            { v: '305K km', u: '', c: colors.primary, d: 'high-voltage transmission lines' },
            { v: '400M', u: '', c: colors.success, d: 'connected consumers' },
            { v: '1,100 GW', u: '', c: colors.secondary, d: 'installed capacity' },
            { v: '3,000 TWh', u: '/yr', c: colors.accent, d: 'annual electricity production' },
          ].map((s, i) => (
            <div key={i} className={`bg-hud-surface rounded-xl p-5 text-center ${i >= 3 ? 'col-span-1' : ''}`} style={{
              border: `1px solid ${s.c}20`,
              ...(i === 3 ? { marginLeft: 'auto', gridColumn: '1 / 2' } : {}),
            }}>
              <div className="text-[36px] font-extrabold font-mono" style={{
                color: s.c,
                textShadow: `0 0 25px ${s.c}30`,
              }}>{s.v}{s.u && <span className="text-[22px] font-normal text-hud-text-muted ml-1">{s.u}</span>}</div>
              <div className="text-[20px] text-hud-text-muted font-sans mt-2 capitalize">
                {s.d}
              </div>
            </div>
          ))}
        </div>
        <Appear>
          <div className="mt-7 flex gap-5 max-w-[780px]">
            <div className="flex-1 rounded-xl p-5" style={{
              background: `${colors.accent}06`,
              border: `1px solid ${colors.accent}20`,
            }}>
              <div className="text-[20px] font-semibold text-hud-accent font-sans mb-2">
                vs. Volkswagen Wolfsburg
              </div>
              <div className="text-[20px] text-hud-text-muted font-sans">
                The world's largest factory has 60,000 workers over 6.5 km².
                <br />The grid has <span className="text-hud-text font-semibold">2.3 million workers</span> across <span className="text-hud-text font-semibold">5.5 million km²</span>.
              </div>
            </div>
            <div className="flex-1 rounded-xl p-5" style={{
              background: `${colors.danger}06`,
              border: `1px solid ${colors.danger}20`,
            }}>
              <div className="text-[20px] font-semibold text-hud-danger font-sans mb-2">
                Zero Downtime
              </div>
              <div className="text-[20px] text-hud-text-muted font-sans">
                Unlike any factory, the grid has never been shut down.
                It runs 24/7, 365 days a year. <span className="text-hud-text font-semibold">It cannot stop.</span>
              </div>
            </div>
          </div>
        </Appear>
      </SlideContainer>
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
  return [
    /* ── B-2: No Cache, No Buffer ── */
    <Slide key="grid-scale-b2" backgroundColor={colors.bg}>
      <SlideContainer style={{ alignItems: 'center' }}>
        <div className="text-center max-w-[800px] w-full">
          <GlowText size="40px" style={{ textAlign: 'center', marginBottom: 32 }}>
            The Grid vs. Tech Infrastructure
          </GlowText>
          <div className="text-left">
            {[
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
            ].map((row, i) => (
              <Appear key={i}>
                <div className="flex gap-4 mb-4 items-start">
                  <div className="flex-1 rounded-lg p-4" style={{
                    background: `${row.color}06`,
                    border: `1px solid ${row.color}15`,
                  }}>
                    <div className="text-[20px] font-semibold font-sans" style={{ color: row.color }}>
                      {row.grid}
                    </div>
                  </div>
                  <div className="text-[22px] text-hud-text-dim font-mono pt-3">vs</div>
                  <div className="flex-1 rounded-lg p-4 bg-hud-surface border border-hud-surface-light">
                    <div className="text-[20px] text-hud-text-muted font-sans">
                      {row.tech}
                    </div>
                  </div>
                </div>
              </Appear>
            ))}
          </div>
        </div>
      </SlideContainer>
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
