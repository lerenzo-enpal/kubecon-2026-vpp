import React from 'react';
import { Slide, Appear, Notes } from 'spectacle';
import { colors } from '../theme';
import { SlideContainer, GlowText, Subtitle, StatCard, TimelineItem } from '../components/ui';
import FrequencyLine from '../components/FrequencyLine';

export function act1Slides() {
  const designedSteps = [
    { label: 'Power Plants', sub: 'Few, large, predictable', color: colors.accent },
    { label: 'Transmission', sub: 'High voltage backbone', color: colors.secondary },
    { label: 'Distribution', sub: 'One-way flow', color: colors.primary },
    { label: 'Homes', sub: 'Passive consumers', color: colors.textDim },
  ];

  const cascadePatterns = [
    { num: '1', title: 'Tightly Coupled', desc: 'Centralized infrastructure with single points of failure', color: colors.danger },
    { num: '2', title: 'No Local Reserves', desc: 'No distributed generation or storage to absorb shocks', color: colors.accent },
    { num: '3', title: 'Blind Operators', desc: 'Degraded or absent system-wide observability', color: colors.secondary },
  ];

  return [
    /* ── Slide 1: Cold Open ── */
    <Slide key="cold-open" backgroundColor={colors.bg}>
      <SlideContainer noGrid style={{ justifyContent: 'center', padding: '60px 100px' }}>
        <div className="text-[28px] font-light text-hud-text-muted font-sans leading-[1.8] max-w-[800px] italic">
          <Appear>
            <div className="mb-6">
              "January 4th, 2026. 3 AM. Berlin.
            </div>
          </Appear>
          <Appear>
            <div className="mb-6">
              Someone sets fire to a cable duct over the Teltow Canal.
              45,000 households go dark."
            </div>
          </Appear>
          <Appear>
            <div className="text-hud-text not-italic font-medium">
              Some of those households had solar panels and batteries.
              They stayed warm. Their lights stayed on.
            </div>
          </Appear>
          <Appear>
            <div className="not-italic font-semibold mt-8 text-[32px]" style={{
              color: colors.primary,
              textShadow: `0 0 40px ${colors.primary}30`,
            }}>
              The difference? Software.
            </div>
          </Appear>
        </div>
      </SlideContainer>
      <Notes>
        Tell the Berlin blackout story with no slides showing. Just you, dark screen, talking.
        Pause after "45,000 households go dark." Let it land.
      </Notes>
    </Slide>,

    /* ── Slide 2: Title ── */
    <Slide key="title" backgroundColor={colors.bg}>
      <SlideContainer>
        <div className="text-center">
          <div className="text-[13px] font-semibold text-hud-primary font-mono tracking-[0.2em] uppercase mb-7">
            KubeCon + CloudNativeCon Europe 2026
          </div>
          <GlowText size="52px" style={{ textAlign: 'center', marginBottom: 20 }}>
            What is a Virtual Power Plant?
          </GlowText>
          <Subtitle size="26px" color={colors.textMuted}>
            Cloud-Native Infrastructure for the Energy Grid
          </Subtitle>
          <div className="mt-12 flex gap-6 justify-center items-center">
            <div className="w-[48px] h-[48px] rounded-full" style={{
              background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
              border: `1px solid ${colors.surfaceLight}`,
            }} />
            <div className="text-left">
              <div className="text-[18px] font-semibold text-hud-text font-sans">
                Enpal / Flexa
              </div>
              <div className="text-[14px] text-hud-text-muted font-sans">
                Building Europe's Largest Virtual Power Plant
              </div>
            </div>
          </div>
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 3: Largest Synchronized Machine ── */
    <Slide key="largest-machine" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <GlowText size="44px" style={{ marginBottom: 32 }}>
          Earth's Largest Synchronized Machine
        </GlowText>
        <Subtitle size="22px" color={colors.textMuted}>
          The power grid must balance supply and demand every single second.
          If this frequency line deviates too far, everything stops.
        </Subtitle>
        <div className="mt-8 flex justify-center">
          <FrequencyLine width={850} height={200} />
        </div>
        <div className="mt-5 flex gap-8 justify-center">
          <StatCard number="50.000" unit=" Hz" label="Target Frequency" color={colors.primary} />
          <StatCard number="400" unit=" GW" label="European Load" color={colors.secondary} />
          <StatCard number="0" unit=" buffer" label="No Storage on Grid" color={colors.accent} />
        </div>
      </SlideContainer>
      <Notes>
        Point at the frequency line. "This line is 50 Hz. It must stay at 50 Hz.
        If it drops below 49, load shedding begins. Below 47, total blackout."
      </Notes>
    </Slide>,

    /* ── Slide 4: How It Was Built ── */
    <Slide key="designed-different-world" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 70 }}>
        <GlowText size="44px" style={{ marginBottom: 32 }}>
          Designed for a Different World
        </GlowText>
        <div className="flex items-center justify-center gap-0 mt-5">
          {designedSteps.map((item, i) => (
            <React.Fragment key={i}>
              <div className="rounded-xl p-[24px_20px] text-center w-[160px]" style={{
                background: colors.surface,
                border: `1px solid ${item.color}30`,
              }}>
                <div className="w-[40px] h-[40px] rounded-[10px] mx-auto mb-3 flex items-center justify-center text-[20px] font-mono font-bold" style={{
                  background: `${item.color}15`,
                  border: `1px solid ${item.color}30`,
                  color: item.color,
                }}>
                  ~
                </div>
                <div className="text-[16px] font-semibold text-hud-text font-sans">
                  {item.label}
                </div>
                <div className="text-[13px] text-hud-text-muted font-sans mt-1">
                  {item.sub}
                </div>
              </div>
              {i < 3 && (
                <div className="text-[24px] text-hud-text-dim px-2 font-mono">
                  {'\u2192'}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="mt-9 text-center text-[20px] text-hud-text-muted font-sans italic">
          "Built in the 1950s. One-directional. No flexibility."
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 5: The Cascade ── */
    <Slide key="the-cascade" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <GlowText size="44px" color={colors.danger} style={{ marginBottom: 12 }}>
          The Cascade
        </GlowText>
        <Subtitle size="20px">
          When one node fails, load shifts to neighbors. Neighbors overload. They fail.
          The system defends itself locally while destroying itself globally.
        </Subtitle>
        <div className="flex gap-6 mt-6 justify-center">
          <StatCard number="265" label="Plants Tripped" color={colors.danger} />
          <StatCard number="50M" label="People Affected" color={colors.danger} />
          <StatCard number="$10B" label="Economic Damage" color={colors.accent} />
        </div>
        <div className="mt-5 text-center px-6 py-3 bg-hud-surface rounded-lg inline-block mx-auto" style={{
          border: `1px solid ${colors.danger}20`,
        }}>
          <div className="text-[14px] text-hud-text-muted font-sans">
            <span className="text-hud-danger font-semibold">2003 Northeast Blackout</span>
            {' '}&mdash; triggered by a software bug and untrimmed trees
          </div>
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 6: It Keeps Happening ── */
    <Slide key="it-keeps-happening" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <GlowText size="40px" color={colors.danger} style={{ marginBottom: 28 }}>
          It Keeps Happening
        </GlowText>
        <div className="flex gap-10">
          <div className="flex-1">
            <TimelineItem year="2003" event="Italy Blackout" impact="56 million people, 3 hours" />
            <TimelineItem year="2006" event="European Grid Split" impact="15 million affected" />
            <TimelineItem year="2016" event="South Australia Statewide Blackout" impact="Entire state" />
            <TimelineItem year="2021" event="Texas ERCOT Collapse" impact="4.5M homes, 240+ deaths, $130B" />
          </div>
          <div className="flex-1">
            <TimelineItem year="2021" event="Continental Europe Grid Split" impact="48.75 Hz — 1.25 Hz from total collapse" />
            <TimelineItem year="2025" event="Spain/Portugal Blackout" impact="60 million people" color={colors.accent} />
            <TimelineItem year="2025" event="Berlin Cable Arson (x3)" impact="45,000+ homes, deaths" color={colors.accent} />
            <TimelineItem year="2026" event="Berlin Teltow Canal" impact="Cable duct arson, 4-day outage" color={colors.primary} />
          </div>
        </div>
      </SlideContainer>
      <Notes>
        Rapid fire. Don't dwell. The effect is cumulative:
        "This is not rare. This happens constantly. And it's getting worse."
      </Notes>
    </Slide>,

    /* ── Slide 7: Common Pattern ── */
    <Slide key="common-pattern" backgroundColor={colors.bg}>
      <SlideContainer>
        <GlowText size="40px" style={{ marginBottom: 36 }}>
          Every Cascade Shares Three Properties
        </GlowText>
        <div className="flex gap-5 justify-center">
          {cascadePatterns.map((item) => (
            <div key={item.num} className="rounded-2xl p-[32px_24px] flex-1 max-w-[260px]" style={{
              background: colors.surface,
              border: `1px solid ${item.color}25`,
            }}>
              <div className="w-[44px] h-[44px] rounded-xl flex items-center justify-center text-[22px] font-extrabold font-mono mb-4" style={{
                background: `${item.color}15`,
                color: item.color,
              }}>
                {item.num}
              </div>
              <div className="text-[20px] font-bold text-hud-text font-sans mb-2">
                {item.title}
              </div>
              <div className="text-[15px] text-hud-text-muted font-sans leading-normal">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 8: Now Add Renewables ── */
    <Slide key="now-add-renewables" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 70 }}>
        <GlowText size="44px" style={{ marginBottom: 20 }}>
          Now Add Renewables
        </GlowText>
        <Subtitle size="20px">
          Solar and wind are cheap, scalable, and essential &mdash; but they make the grid
          <span className="font-semibold" style={{ color: colors.accent }}> less predictable</span>.
        </Subtitle>
        <div className="mt-7 flex gap-5 justify-center">
          {[
            { label: 'Variable', desc: 'Output changes with weather', color: colors.solar },
            { label: 'Distributed', desc: 'Millions of small sources', color: colors.success },
            { label: 'Bidirectional', desc: 'Power flows both ways now', color: colors.primary },
          ].map((item) => (
            <div key={item.label} className="rounded-xl p-6 flex-1 max-w-[240px] text-center" style={{
              background: colors.surface,
              border: `1px solid ${item.color}25`,
            }}>
              <div className="text-[20px] font-bold font-sans mb-2" style={{ color: item.color }}>
                {item.label}
              </div>
              <div className="text-[15px] text-hud-text-muted font-sans">
                {item.desc}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center text-[18px] text-hud-text-muted font-sans">
          <span className="font-semibold" style={{ color: colors.accent }}>301 negative price hours</span> in Germany in 2023, trending 400+
          <br />
          <span className="text-[14px]">Solar floods midday. Steep ramp in evening. The "duck curve" problem.</span>
        </div>
        <div className="mt-7 text-center text-[22px] font-semibold font-sans" style={{
          color: colors.primary,
          textShadow: `0 0 30px ${colors.primary}30`,
        }}>
          The grid needs one thing: <span className="font-extrabold">flexibility</span>.
        </div>
      </SlideContainer>
    </Slide>,
  ];
}
