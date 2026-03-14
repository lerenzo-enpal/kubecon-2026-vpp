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
        <div style={{
          fontSize: '28px',
          fontWeight: 300,
          color: colors.textMuted,
          fontFamily: '"Inter", system-ui, sans-serif',
          lineHeight: 1.8,
          maxWidth: 800,
          fontStyle: 'italic',
        }}>
          <Appear>
            <div style={{ marginBottom: 24 }}>
              "January 4th, 2026. 3 AM. Berlin.
            </div>
          </Appear>
          <Appear>
            <div style={{ marginBottom: 24 }}>
              Someone sets fire to a cable duct over the Teltow Canal.
              45,000 households go dark."
            </div>
          </Appear>
          <Appear>
            <div style={{ color: colors.text, fontStyle: 'normal', fontWeight: 500 }}>
              Some of those households had solar panels and batteries.
              They stayed warm. Their lights stayed on.
            </div>
          </Appear>
          <Appear>
            <div style={{
              color: colors.primary,
              fontStyle: 'normal',
              fontWeight: 600,
              marginTop: 32,
              fontSize: '32px',
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
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '13px',
            fontWeight: 600,
            color: colors.primary,
            fontFamily: '"JetBrains Mono", monospace',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            marginBottom: 28,
          }}>
            KubeCon + CloudNativeCon Europe 2026
          </div>
          <GlowText size="52px" style={{ textAlign: 'center', marginBottom: 20 }}>
            What is a Virtual Power Plant?
          </GlowText>
          <Subtitle size="26px" color={colors.textMuted}>
            Cloud-Native Infrastructure for the Energy Grid
          </Subtitle>
          <div style={{
            marginTop: 48,
            display: 'flex',
            gap: 24,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)`,
              border: `1px solid ${colors.surfaceLight}`,
            }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 600,
                color: colors.text,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}>
                Enpal / Flexa
              </div>
              <div style={{
                fontSize: '14px',
                color: colors.textMuted,
                fontFamily: '"Inter", system-ui, sans-serif',
              }}>
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
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <FrequencyLine width={850} height={200} />
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 32, justifyContent: 'center' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginTop: 20 }}>
          {designedSteps.map((item, i) => (
            <React.Fragment key={i}>
              <div style={{
                background: colors.surface,
                border: `1px solid ${item.color}30`,
                borderRadius: 12,
                padding: '24px 20px',
                textAlign: 'center',
                width: 160,
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: `${item.color}15`, border: `1px solid ${item.color}30`,
                  margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', color: item.color,
                  fontFamily: '"JetBrains Mono", monospace', fontWeight: 700,
                }}>
                  ~
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '13px', color: colors.textMuted, fontFamily: '"Inter"', marginTop: 4 }}>
                  {item.sub}
                </div>
              </div>
              {i < 3 && (
                <div style={{ fontSize: '24px', color: colors.textDim, padding: '0 8px', fontFamily: '"JetBrains Mono"' }}>
                  {'\u2192'}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div style={{
          marginTop: 36, textAlign: 'center', fontSize: '20px',
          color: colors.textMuted, fontFamily: '"Inter"', fontStyle: 'italic',
        }}>
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
        <div style={{ display: 'flex', gap: 24, marginTop: 24, justifyContent: 'center' }}>
          <StatCard number="265" label="Plants Tripped" color={colors.danger} />
          <StatCard number="50M" label="People Affected" color={colors.danger} />
          <StatCard number="$10B" label="Economic Damage" color={colors.accent} />
        </div>
        <div style={{
          marginTop: 20, textAlign: 'center', padding: '12px 24px',
          background: colors.surface, borderRadius: 8, border: `1px solid ${colors.danger}20`,
          display: 'inline-block', margin: '20px auto 0',
        }}>
          <div style={{ fontSize: '14px', color: colors.textMuted, fontFamily: '"Inter"' }}>
            <span style={{ color: colors.danger, fontWeight: 600 }}>2003 Northeast Blackout</span>
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
        <div style={{ display: 'flex', gap: 40 }}>
          <div style={{ flex: 1 }}>
            <TimelineItem year="2003" event="Italy Blackout" impact="56 million people, 3 hours" />
            <TimelineItem year="2006" event="European Grid Split" impact="15 million affected" />
            <TimelineItem year="2016" event="South Australia Statewide Blackout" impact="Entire state" />
            <TimelineItem year="2021" event="Texas ERCOT Collapse" impact="4.5M homes, 240+ deaths, $130B" />
          </div>
          <div style={{ flex: 1 }}>
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
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center' }}>
          {cascadePatterns.map((item) => (
            <div key={item.num} style={{
              background: colors.surface, border: `1px solid ${item.color}25`,
              borderRadius: 16, padding: '32px 24px', flex: 1, maxWidth: 260,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `${item.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', fontWeight: 800, color: item.color,
                fontFamily: '"JetBrains Mono"', marginBottom: 16,
              }}>
                {item.num}
              </div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: colors.text, fontFamily: '"Inter"', marginBottom: 8 }}>
                {item.title}
              </div>
              <div style={{ fontSize: '15px', color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.5 }}>
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
          <span style={{ color: colors.accent, fontWeight: 600 }}> less predictable</span>.
        </Subtitle>
        <div style={{ marginTop: 28, display: 'flex', gap: 20, justifyContent: 'center' }}>
          {[
            { label: 'Variable', desc: 'Output changes with weather', color: colors.solar },
            { label: 'Distributed', desc: 'Millions of small sources', color: colors.success },
            { label: 'Bidirectional', desc: 'Power flows both ways now', color: colors.primary },
          ].map((item) => (
            <div key={item.label} style={{
              background: colors.surface, border: `1px solid ${item.color}25`,
              borderRadius: 12, padding: '24px', flex: 1, maxWidth: 240, textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 700, color: item.color, fontFamily: '"Inter"', marginBottom: 8 }}>
                {item.label}
              </div>
              <div style={{ fontSize: '15px', color: colors.textMuted, fontFamily: '"Inter"' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 32, textAlign: 'center', fontSize: '18px',
          color: colors.textMuted, fontFamily: '"Inter"',
        }}>
          <span style={{ color: colors.accent, fontWeight: 600 }}>301 negative price hours</span> in Germany in 2023, trending 400+
          <br />
          <span style={{ fontSize: '14px' }}>Solar floods midday. Steep ramp in evening. The "duck curve" problem.</span>
        </div>
        <div style={{
          marginTop: 28, textAlign: 'center', fontSize: '22px', fontWeight: 600,
          color: colors.primary, fontFamily: '"Inter"',
          textShadow: `0 0 30px ${colors.primary}30`,
        }}>
          The grid needs one thing: <span style={{ fontWeight: 800 }}>flexibility</span>.
        </div>
      </SlideContainer>
    </Slide>,
  ];
}
