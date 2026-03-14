import React from 'react';
import { Slide, Appear, Notes } from 'spectacle';
import { colors } from '../theme';
import { SlideContainer, GlowText, Subtitle, StatCard, Badge, ComparisonRow, SectionDivider } from '../components/ui';
import FrequencyLine from '../components/FrequencyLine';

export function act2Slides() {
  const economicsStats = [
    { number: '90%', label: 'FCAS cost reduction in South Australia', color: colors.success, sub: 'AUD 53M/quarter to AUD 5M/quarter' },
    { number: '40-60%', label: 'Cheaper than gas peaker plants', color: colors.primary, sub: 'RMI 2023 analysis' },
    { number: '~70%', label: 'Battery share of German FCR by 2024', color: colors.accent, sub: 'Up from near-zero in 2018' },
    { number: '2-3 yrs', label: 'Hornsdale payback period', color: colors.secondary, sub: 'Revenue from grid services' },
  ];

  return [
    /* ── Section Divider ── */
    <Slide key="batteries-divider" backgroundColor={colors.bg}>
      <SectionDivider
        number="II"
        title="Batteries Change Everything"
        subtitle="The fastest power plants ever built"
      />
    </Slide>,

    /* ── Slide 9: The Fastest Power Plant ── */
    <Slide key="fastest-power-plant" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 70 }}>
        <GlowText size="44px" style={{ marginBottom: 32 }}>
          The Fastest Power Plant
        </GlowText>
        <div style={{ maxWidth: 700 }}>
          <ComparisonRow label="Coal" value="2-6 hours" color={colors.textDim} barWidth={90} />
          <ComparisonRow label="Gas Turbine" value="10-30 minutes" color="#fb923c" barWidth={45} />
          <ComparisonRow label="Hydro" value="15-30 seconds" color="#60a5fa" barWidth={12} />
          <ComparisonRow label="Battery" value="140 ms" color={colors.success} barWidth={2} />
        </div>
        <Appear>
          <div style={{
            marginTop: 28, padding: '20px 28px',
            background: `${colors.success}08`, border: `1px solid ${colors.success}25`,
            borderRadius: 12, maxWidth: 700,
          }}>
            <div style={{ fontSize: '20px', fontWeight: 600, color: colors.success, fontFamily: '"Inter"' }}>
              A battery responds to a grid emergency before a gas turbine
              even knows there <em>is</em> an emergency.
            </div>
          </div>
        </Appear>
      </SlideContainer>
    </Slide>,

    /* ── Slide 10: Hornsdale Proof ── */
    <Slide key="hornsdale-proof" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 60 }}>
        <Badge color={colors.success}>PROOF</Badge>
        <GlowText size="40px" color={colors.success} style={{ marginTop: 16, marginBottom: 12 }}>
          Hornsdale, December 2017
        </GlowText>
        <Subtitle size="20px">
          560 MW generator trips in Queensland. Frequency plunging.
        </Subtitle>
        <div style={{ marginTop: 24 }}>
          <FrequencyLine width={850} height={180} collapse={true} vppSave={true} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 20, justifyContent: 'center' }}>
          <StatCard number="140" unit="ms" label="Battery Response" color={colors.success} />
          <StatCard number="28" unit="sec" label="Gas Turbine Response" color="#fb923c" />
          <StatCard number="8" unit="sec" label="Margin Before Blackout" color={colors.danger} />
        </div>
      </SlideContainer>
      <Notes>
        "560 MW generator trips. Frequency drops. Hornsdale responds in 140ms.
        Gas plant doesn't respond for 28 seconds. Those 8 seconds were the margin."
      </Notes>
    </Slide>,

    /* ── Slide 11: SA VPP Proof ── */
    <Slide key="sa-vpp-proof" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 70 }}>
        <Badge color={colors.success}>PROOF</Badge>
        <GlowText size="40px" color={colors.success} style={{ marginTop: 16, marginBottom: 12 }}>
          SA Virtual Power Plant, October 2019
        </GlowText>
        <Subtitle size="20px">
          748 MW coal plant trips in Queensland. 1,100 homes in South Australia respond.
        </Subtitle>
        <div style={{ marginTop: 28, display: 'flex', gap: 20, justifyContent: 'center' }}>
          <StatCard number="1,100" label="Homes Responded" color={colors.success} />
          <StatCard number="2%" label="of Planned Fleet" color={colors.primary} />
          <StatCard number="0" label="Humans Involved" color={colors.accent} />
        </div>
        <Appear>
          <div style={{
            marginTop: 28, padding: '20px 28px',
            background: `${colors.success}08`, border: `1px solid ${colors.success}25`,
            borderRadius: 12, textAlign: 'center',
          }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"' }}>
              Eleven hundred homes. Acting as one.
              <br />
              <span style={{ color: colors.success }}>Without anyone pushing a button.</span>
            </div>
          </div>
        </Appear>
      </SlideContainer>
    </Slide>,

    /* ── Slide 12: The Economics ── */
    <Slide key="the-economics" backgroundColor={colors.bg}>
      <SlideContainer style={{ justifyContent: 'flex-start', paddingTop: 70 }}>
        <GlowText size="44px" style={{ marginBottom: 28 }}>
          The Economics
        </GlowText>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 780 }}>
          {economicsStats.map((item) => (
            <div key={item.label} style={{
              background: colors.surface, border: `1px solid ${colors.surfaceLight}`,
              borderRadius: 12, padding: '20px',
            }}>
              <div style={{
                fontSize: '34px', fontWeight: 800, color: item.color,
                fontFamily: '"JetBrains Mono"', textShadow: `0 0 25px ${item.color}30`,
              }}>
                {item.number}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 600, color: colors.text, fontFamily: '"Inter"', marginTop: 6 }}>
                {item.label}
              </div>
              <div style={{ fontSize: '12px', color: colors.textDim, fontFamily: '"Inter"', marginTop: 4 }}>
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 13: One Battery Not Enough ── */
    <Slide key="one-battery-not-enough" backgroundColor={colors.bg}>
      <SlideContainer>
        <div style={{ textAlign: 'center' }}>
          <GlowText size="44px" style={{ textAlign: 'center', marginBottom: 36 }}>
            But One Battery Is Not Enough
          </GlowText>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32 }}>
            <div style={{
              background: colors.surface, borderRadius: 16, padding: '32px',
              border: `1px solid ${colors.surfaceLight}`, textAlign: 'center',
            }}>
              <div style={{ fontSize: '48px', fontWeight: 800, color: colors.success, fontFamily: '"JetBrains Mono"' }}>
                1
              </div>
              <div style={{ fontSize: '14px', color: colors.textMuted, fontFamily: '"Inter"', marginTop: 4 }}>
                battery = 10 kWh
              </div>
            </div>
            <div style={{ fontSize: '32px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>
              {'\u00d7'}
            </div>
            <div style={{
              background: colors.surface, borderRadius: 16, padding: '32px',
              border: `1px solid ${colors.primary}30`, textAlign: 'center',
            }}>
              <div style={{
                fontSize: '48px', fontWeight: 800, color: colors.primary,
                fontFamily: '"JetBrains Mono"', textShadow: `0 0 30px ${colors.primary}40`,
              }}>
                100K
              </div>
              <div style={{ fontSize: '14px', color: colors.textMuted, fontFamily: '"Inter"', marginTop: 4 }}>
                batteries = 1 GWh
              </div>
            </div>
            <div style={{ fontSize: '32px', color: colors.textDim, fontFamily: '"JetBrains Mono"' }}>
              =
            </div>
            <div style={{
              background: `${colors.accent}10`, borderRadius: 16, padding: '32px',
              border: `1px solid ${colors.accent}30`, textAlign: 'center',
            }}>
              <div style={{
                fontSize: '36px', fontWeight: 800, color: colors.accent,
                fontFamily: '"JetBrains Mono"', textShadow: `0 0 30px ${colors.accent}40`,
              }}>
                Power Plant
              </div>
            </div>
          </div>
          <Appear>
            <div style={{
              marginTop: 36, fontSize: '20px', color: colors.textMuted,
              fontFamily: '"Inter"', lineHeight: 1.6,
            }}>
              Coordinating 100,000 batteries in real-time, responding in milliseconds,
              <br />across unreliable networks?{' '}
              <span style={{ color: colors.primary, fontWeight: 600 }}>
                That's not an energy problem. That's a distributed systems problem.
              </span>
            </div>
          </Appear>
        </div>
      </SlideContainer>
    </Slide>,
  ];
}
