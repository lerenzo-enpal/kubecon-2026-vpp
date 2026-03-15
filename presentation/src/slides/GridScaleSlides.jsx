import React from 'react';
import { Slide, Appear, Notes } from 'spectacle';
import { colors } from '../theme';
import { SlideContainer, GlowText, Subtitle, StatCard, Badge } from '../components/ui';
import EUGridMap from '../components/EUGridMap';
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
    /* ── A-1: The Largest Machine ── */
    <Slide key="grid-scale-a1" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 50 }}>
        <GlowText size="44px" style={{ marginBottom: 16 }}>
          The Largest Machine Ever Built
        </GlowText>
        <Subtitle size="20px">
          Every generator in Continental Europe rotates in perfect synchrony.
          Lisbon to Istanbul — one machine, one frequency.
        </Subtitle>
        <div className="mt-5 flex justify-center">
          <EUGridMap width={880} height={380} />
        </div>
      </SlideContainer>
      <Notes>
        "Before we talk about what happens when the grid fails, you need to understand
        what the grid actually IS. This is a simplified view of the European grid.
        Every one of these dots is a major generation hub. Every line is a high-voltage
        transmission corridor. And all of it — all 36 countries — is spinning at
        exactly 50 Hz. Right now. As I'm talking to you."
      </Notes>
    </Slide>,

    /* ── A-2: The Numbers ── */
    <Slide key="grid-scale-a2" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <GlowText size="40px" style={{ marginBottom: 28 }}>
          Running the Largest Machine
        </GlowText>
        <div className="grid grid-cols-3 gap-4 max-w-[780px]">
          <div className="bg-hud-surface rounded-xl p-5 text-center" style={{
            border: `1px solid ${colors.primary}20`,
          }}>
            <div className="text-[36px] font-extrabold font-mono text-hud-primary" style={{
              textShadow: `0 0 25px ${colors.primary}30`,
            }}>305K km</div>
            <div className="text-[20px] text-hud-text-muted font-sans mt-2">
              High-voltage transmission lines
            </div>
          </div>
          <div className="bg-hud-surface rounded-xl p-5 text-center" style={{
            border: `1px solid ${colors.success}20`,
          }}>
            <div className="text-[36px] font-extrabold font-mono text-hud-success" style={{
              textShadow: `0 0 25px ${colors.success}30`,
            }}>400M</div>
            <div className="text-[20px] text-hud-text-muted font-sans mt-2">
              Connected consumers
            </div>
          </div>
          <div className="bg-hud-surface rounded-xl p-5 text-center" style={{
            border: `1px solid ${colors.secondary}20`,
          }}>
            <div className="text-[36px] font-extrabold font-mono text-hud-secondary" style={{
              textShadow: `0 0 25px ${colors.secondary}30`,
            }}>1,100 GW</div>
            <div className="text-[20px] text-hud-text-muted font-sans mt-2">
              Installed capacity
            </div>
          </div>
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
  const gridStats = [
    { value: '36', unit: 'countries', color: colors.primary, detail: 'synchronized to the same frequency' },
    { value: '305,000', unit: 'km', color: colors.primary, detail: 'of high-voltage transmission lines' },
    { value: '400M', unit: 'people', color: colors.success, detail: 'connected consumers' },
    { value: '1,100', unit: 'GW', color: colors.accent, detail: 'of installed generation capacity' },
    { value: '3,000', unit: 'TWh/yr', color: colors.secondary, detail: 'of electricity produced annually' },
    { value: '0', unit: 'storage', color: colors.danger, detail: 'buffer between supply and demand' },
  ];

  return [
    /* ── B-1: The Numbers ── */
    <Slide key="grid-scale-b1" backgroundColor={colors.bg}>
      <SlideContainer noGrid style={{ justifyContent: 'center' }}>
        <div className="text-center max-w-[800px] mx-auto">
          <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.15em] uppercase mb-8">
            The Largest Machine Ever Built
          </div>
          <div className="grid grid-cols-3 gap-x-12 gap-y-8">
            {gridStats.map((stat, i) => (
              <Appear key={i}>
                <div className="text-center">
                  <div className="text-[44px] font-extrabold font-mono" style={{
                    color: stat.color,
                    textShadow: `0 0 30px ${stat.color}30`,
                  }}>
                    {stat.value}
                    <span className="text-[22px] font-normal text-hud-text-muted ml-1">{stat.unit}</span>
                  </div>
                  <div className="text-[20px] text-hud-text-muted font-sans mt-1">
                    {stat.detail}
                  </div>
                </div>
              </Appear>
            ))}
          </div>
          <Appear>
            <div className="mt-10 text-[24px] font-semibold text-hud-text font-sans" style={{
              textShadow: `0 0 30px ${colors.primary}20`,
            }}>
              And it has <span className="text-hud-primary">never</span> been turned off.
            </div>
          </Appear>
        </div>
      </SlideContainer>
      <Notes>
        "Let these numbers sink in. 36 countries. 305,000 kilometers of high-voltage
        lines. 400 million people. All synchronized to the same frequency. And that last
        one — zero storage. Every watt you produce must be consumed the instant it's
        generated. There is no cache. No buffer. No retry. Just physics."
      </Notes>
    </Slide>,

    /* ── B-2: No Cache, No Buffer ── */
    <Slide key="grid-scale-b2" backgroundColor={colors.bg}>
      <SlideContainer>
        <div className="text-center max-w-[800px] mx-auto">
          <GlowText size="40px" style={{ textAlign: 'center', marginBottom: 32 }}>
            The Grid vs. Your Infrastructure
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
                tech: 'Your systems have caches, queues, CDNs',
                color: colors.accent,
              },
              {
                grid: 'Failure cascades by physics — unstoppable',
                tech: 'Failure is contained by circuit breakers, retries',
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
        "This is the key insight for this audience. You build fault-tolerant systems
        every day. Circuit breakers, retries, caches, load balancers. The grid has NONE
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

    /* ── C-2: The Journey of Electricity ── */
    <Slide key="grid-scale-c2" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <GlowText size="40px" style={{ marginBottom: 24 }}>
          From Power Plant to Your Home
        </GlowText>
        <div className="flex items-center justify-center gap-0">
          {[
            { label: 'Generation', voltage: '10-25 kV', icon: '\u26A1', color: colors.accent },
            { label: 'Transmission', voltage: '220-400 kV', icon: '\u2191', color: colors.primary },
            { label: 'Sub-Transmission', voltage: '110 kV', icon: '\u2193', color: colors.secondary },
            { label: 'Distribution', voltage: '10-35 kV', icon: '\u2193', color: colors.success },
            { label: 'Your Home', voltage: '230 V', icon: '\u2302', color: colors.text },
          ].map((step, i) => (
            <React.Fragment key={i}>
              <Appear>
                <div className="rounded-xl p-4 text-center min-w-[130px]" style={{
                  background: colors.surface,
                  border: `1px solid ${step.color}25`,
                }}>
                  <div className="text-[28px] mb-2">{step.icon}</div>
                  <div className="text-[20px] font-semibold text-hud-text font-sans">
                    {step.label}
                  </div>
                  <div className="text-[20px] font-mono mt-1" style={{ color: step.color }}>
                    {step.voltage}
                  </div>
                </div>
              </Appear>
              {i < 4 && (
                <div className="text-[20px] text-hud-text-dim px-2 font-mono">{'\u2192'}</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-7 flex gap-4 max-w-[780px] mx-auto">
          <Appear>
            <div className="flex-1 bg-hud-surface rounded-xl p-4 text-center border border-hud-surface-light">
              <div className="text-[28px] font-extrabold font-mono text-hud-primary">5-7</div>
              <div className="text-[20px] text-hud-text-muted font-sans mt-1">Voltage transformations</div>
            </div>
          </Appear>
          <Appear>
            <div className="flex-1 bg-hud-surface rounded-xl p-4 text-center border border-hud-surface-light">
              <div className="text-[28px] font-extrabold font-mono text-hud-accent">6-8%</div>
              <div className="text-[20px] text-hud-text-muted font-sans mt-1">Energy lost in transit</div>
            </div>
          </Appear>
          <Appear>
            <div className="flex-1 bg-hud-surface rounded-xl p-4 text-center border border-hud-surface-light">
              <div className="text-[28px] font-extrabold font-mono text-hud-danger">0 ms</div>
              <div className="text-[20px] text-hud-text-muted font-sans mt-1">Storage anywhere in this chain</div>
            </div>
          </Appear>
        </div>
      </SlideContainer>
      <Notes>
        "Electricity goes through 5 to 7 voltage transformations before it reaches your
        outlet. And at no point in this entire chain is there any storage. No buffer. No cache.
        The electron you're using right now was generated a fraction of a second ago, hundreds
        of kilometers away. That's why the grid is the most impressive real-time system ever
        built — and why it's so fragile."
      </Notes>
    </Slide>,
  ];
}
