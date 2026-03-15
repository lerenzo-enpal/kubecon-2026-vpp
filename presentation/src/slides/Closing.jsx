import React from 'react';
import { Slide, Appear, Notes } from 'spectacle';
import { colors } from '../theme';
import { SlideContainer, GlowText } from '../components/ui';

export function closingSlides() {
  return [
    /* ── Slide 21: Back to Berlin ── */
    <Slide key="back-to-berlin" backgroundColor={colors.bg}>
      <SlideContainer noGrid>
        <div className="max-w-[750px]">
          <div className="text-[20px] font-semibold text-hud-primary font-mono tracking-[0.15em] uppercase mb-6">
            Back to Berlin
          </div>
          <div className="text-[26px] font-normal text-hud-text font-sans leading-[1.7]">
            <Appear>
              <div className="mb-5">
                Remember those households in Steglitz-Zehlendorf that stayed warm?
              </div>
            </Appear>
            <Appear>
              <div className="mb-5 text-hud-text-muted">
                They had solar panels, batteries, and a software agent on their roof.
              </div>
            </Appear>
            <Appear>
              <div className="mb-5 text-hud-text-muted">
                They were part of a Virtual Power Plant.
              </div>
            </Appear>
            <Appear>
              <div
                className="font-semibold text-hud-primary"
                style={{ textShadow: `0 0 30px ${colors.primary}30` }}
              >
                The grid failed them. The software didn't.
              </div>
            </Appear>
          </div>
        </div>
      </SlideContainer>
      <Notes>
        Slow this down. This is the emotional peak. Circle back to the opening.
        Let each line land before advancing.
      </Notes>
    </Slide>,

    /* ── Slide 22: The Future Grid ── */
    <Slide key="future-grid" backgroundColor={colors.bg}>
      <SlideContainer>
        <div className="text-center">
          <GlowText size="48px" style={{ textAlign: 'center', marginBottom: 28 }}>
            The Future Grid
          </GlowText>
          <div className="text-[22px] font-normal text-hud-text-muted font-sans leading-[1.7] max-w-[650px] mx-auto">
            Millions of devices cooperating.
            <br />Homes, EVs, batteries, renewables &mdash;
            <br />forming distributed power plants.
          </div>
          <Appear>
            <div
              className="mt-8 text-[24px] font-semibold text-hud-primary font-sans"
              style={{ textShadow: `0 0 30px ${colors.primary}30` }}
            >
              The grid becomes software.
            </div>
          </Appear>
          <Appear>
            <div className="mt-3 text-[20px] font-normal text-hud-text-muted font-sans">
              And it runs on the same infrastructure you build every day.
            </div>
          </Appear>
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 23: Final Takeaway ── */
    <Slide key="final-takeaway" backgroundColor={colors.bg}>
      <SlideContainer noGrid>
        <div className="text-center max-w-[800px] mx-auto">
          <div className="text-[28px] font-semibold text-hud-text font-sans leading-[1.7] mb-9">
            Virtual Power Plants turn distributed renewable energy
            <br />into <span className="text-hud-success">reliable grid infrastructure</span>.
          </div>
          <div className="text-[24px] font-normal text-hud-text-muted font-sans leading-[1.7] mb-9">
            Cloud-native systems are what make them possible.
          </div>
          <div
            className="text-[26px] font-bold text-hud-primary font-sans inline-block rounded-2xl"
            style={{
              textShadow: `0 0 40px ${colors.primary}30`,
              padding: '20px 32px',
              background: `${colors.primary}08`,
              border: `1px solid ${colors.primary}20`,
            }}
          >
            You already know how to build the future grid.
            <br />
            <span className="font-normal text-[22px] text-hud-text-muted">
              You just didn't know it yet.
            </span>
          </div>
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 24: Thank You ── */
    <Slide key="thank-you" backgroundColor={colors.bg}>
      <SlideContainer>
        <div className="text-center">
          <GlowText size="56px" style={{ textAlign: 'center', marginBottom: 20 }}>
            Thank You
          </GlowText>
          <div className="text-[20px] text-hud-text-muted font-sans leading-[1.8]">
            <div className="mb-2">
              <span className="text-hud-primary font-semibold">Enpal / Flexa</span>
            </div>
            <div className="text-[20px] text-hud-text-dim">
              Building Europe's Largest Virtual Power Plant
            </div>
          </div>
          <div className="mt-12 flex gap-4 justify-center">
            {[
              { label: 'Slides & Interactive Demo', color: colors.primary },
              { label: 'Deep Dive Website', color: colors.success },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-hud-surface rounded-xl text-[20px] font-medium font-sans"
                style={{
                  border: `1px solid ${item.color}25`,
                  padding: '16px 24px',
                  color: item.color,
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </SlideContainer>
    </Slide>,
  ];
}
