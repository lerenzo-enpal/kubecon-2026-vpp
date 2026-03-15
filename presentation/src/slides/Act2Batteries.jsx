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
        <div className="max-w-[700px]">
          <ComparisonRow label="Coal" value="2-6 hours" color={colors.textDim} barWidth={90} />
          <ComparisonRow label="Gas Turbine" value="10-30 minutes" color="#fb923c" barWidth={45} />
          <ComparisonRow label="Hydro" value="15-30 seconds" color="#60a5fa" barWidth={12} />
          <ComparisonRow label="Battery" value="140 ms" color={colors.success} barWidth={2} />
        </div>
        <Appear>
          <div
            className="mt-7 rounded-xl max-w-[700px]"
            style={{
              padding: '20px 28px',
              background: `${colors.success}08`,
              border: `1px solid ${colors.success}25`,
            }}
          >
            <div className="text-[20px] font-semibold text-hud-success font-sans">
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
        <div className="mt-6 flex justify-center">
          <FrequencyLine width={850} height={180} collapse={true} vppSave={true} />
        </div>
        <div className="flex gap-5 mt-5 justify-center">
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
        <div className="mt-7 flex gap-5 justify-center">
          <StatCard number="1,100" label="Homes Responded" color={colors.success} />
          <StatCard number="2%" label="of Planned Fleet" color={colors.primary} />
          <StatCard number="0" label="Humans Involved" color={colors.accent} />
        </div>
        <Appear>
          <div
            className="mt-7 rounded-xl text-center"
            style={{
              padding: '20px 28px',
              background: `${colors.success}08`,
              border: `1px solid ${colors.success}25`,
            }}
          >
            <div className="text-[22px] font-semibold text-hud-text font-sans">
              Eleven hundred homes. Acting as one.
              <br />
              <span className="text-hud-success">Without anyone pushing a button.</span>
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
        <div className="grid grid-cols-2 gap-4 max-w-[780px]">
          {economicsStats.map((item) => (
            <div
              key={item.label}
              className="bg-hud-surface border border-hud-surface-light rounded-xl p-5"
            >
              <div
                className="text-[34px] font-extrabold font-mono"
                style={{ color: item.color, textShadow: `0 0 25px ${item.color}30` }}
              >
                {item.number}
              </div>
              <div className="text-[15px] font-semibold text-hud-text font-sans mt-1.5">
                {item.label}
              </div>
              <div className="text-[12px] text-hud-text-dim font-sans mt-1">
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
        <div className="text-center">
          <GlowText size="44px" style={{ textAlign: 'center', marginBottom: 36 }}>
            But One Battery Is Not Enough
          </GlowText>
          <div className="flex items-center justify-center gap-8">
            <div className="bg-hud-surface rounded-2xl p-8 border border-hud-surface-light text-center">
              <div className="text-[48px] font-extrabold text-hud-success font-mono">
                1
              </div>
              <div className="text-[14px] text-hud-text-muted font-sans mt-1">
                battery = 10 kWh
              </div>
            </div>
            <div className="text-[32px] text-hud-text-dim font-mono">
              {'\u00d7'}
            </div>
            <div
              className="bg-hud-surface rounded-2xl p-8 text-center"
              style={{ border: `1px solid ${colors.primary}30` }}
            >
              <div
                className="text-[48px] font-extrabold text-hud-primary font-mono"
                style={{ textShadow: `0 0 30px ${colors.primary}40` }}
              >
                100K
              </div>
              <div className="text-[14px] text-hud-text-muted font-sans mt-1">
                batteries = 1 GWh
              </div>
            </div>
            <div className="text-[32px] text-hud-text-dim font-mono">
              =
            </div>
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: `${colors.accent}10`,
                border: `1px solid ${colors.accent}30`,
              }}
            >
              <div
                className="text-[36px] font-extrabold font-mono"
                style={{ color: colors.accent, textShadow: `0 0 30px ${colors.accent}40` }}
              >
                Power Plant
              </div>
            </div>
          </div>
          <Appear>
            <div className="mt-9 text-[20px] text-hud-text-muted font-sans leading-[1.6]">
              Coordinating 100,000 batteries in real-time, responding in milliseconds,
              <br />across unreliable networks?{' '}
              <span className="text-hud-primary font-semibold">
                That's not an energy problem. That's a distributed systems problem.
              </span>
            </div>
          </Appear>
        </div>
      </SlideContainer>
    </Slide>,
  ];
}
