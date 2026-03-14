import React from 'react';
import { Slide, Appear, Notes } from 'spectacle';
import { colors } from '../theme';
import { SlideContainer, GlowText } from '../components/ui';

export function closingSlides() {
  return [
    /* ── Slide 21: Back to Berlin ── */
    <Slide key="back-to-berlin" backgroundColor={colors.bg}>
      <SlideContainer noGrid>
        <div style={{ maxWidth: 750 }}>
          <div style={{
            fontSize: '14px', fontWeight: 600, color: colors.primary,
            fontFamily: '"JetBrains Mono"', letterSpacing: '0.15em',
            textTransform: 'uppercase', marginBottom: 24,
          }}>
            Back to Berlin
          </div>
          <div style={{ fontSize: '26px', fontWeight: 400, color: colors.text, fontFamily: '"Inter"', lineHeight: 1.7 }}>
            <Appear>
              <div style={{ marginBottom: 20 }}>
                Remember those households in Steglitz-Zehlendorf that stayed warm?
              </div>
            </Appear>
            <Appear>
              <div style={{ marginBottom: 20, color: colors.textMuted }}>
                They had solar panels, batteries, and a software agent on their roof.
              </div>
            </Appear>
            <Appear>
              <div style={{ marginBottom: 20, color: colors.textMuted }}>
                They were part of a Virtual Power Plant.
              </div>
            </Appear>
            <Appear>
              <div style={{
                color: colors.primary, fontWeight: 600,
                textShadow: `0 0 30px ${colors.primary}30`,
              }}>
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
        <div style={{ textAlign: 'center' }}>
          <GlowText size="48px" style={{ textAlign: 'center', marginBottom: 28 }}>
            The Future Grid
          </GlowText>
          <div style={{
            fontSize: '22px', fontWeight: 400, color: colors.textMuted,
            fontFamily: '"Inter"', lineHeight: 1.7, maxWidth: 650, margin: '0 auto',
          }}>
            Millions of devices cooperating.
            <br />Homes, EVs, batteries, renewables &mdash;
            <br />forming distributed power plants.
          </div>
          <Appear>
            <div style={{
              marginTop: 32, fontSize: '24px', fontWeight: 600,
              color: colors.primary, fontFamily: '"Inter"',
              textShadow: `0 0 30px ${colors.primary}30`,
            }}>
              The grid becomes software.
            </div>
          </Appear>
          <Appear>
            <div style={{
              marginTop: 12, fontSize: '20px', fontWeight: 400,
              color: colors.textMuted, fontFamily: '"Inter"',
            }}>
              And it runs on the same infrastructure you build every day.
            </div>
          </Appear>
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 23: Final Takeaway ── */
    <Slide key="final-takeaway" backgroundColor={colors.bg}>
      <SlideContainer noGrid>
        <div style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
          <div style={{
            fontSize: '28px', fontWeight: 600, color: colors.text,
            fontFamily: '"Inter"', lineHeight: 1.7, marginBottom: 36,
          }}>
            Virtual Power Plants turn distributed renewable energy
            <br />into <span style={{ color: colors.success }}>reliable grid infrastructure</span>.
          </div>
          <div style={{
            fontSize: '24px', fontWeight: 400, color: colors.textMuted,
            fontFamily: '"Inter"', lineHeight: 1.7, marginBottom: 36,
          }}>
            Cloud-native systems are what make them possible.
          </div>
          <div style={{
            fontSize: '26px', fontWeight: 700, color: colors.primary,
            fontFamily: '"Inter"', textShadow: `0 0 40px ${colors.primary}30`,
            padding: '20px 32px', background: `${colors.primary}08`,
            borderRadius: 16, border: `1px solid ${colors.primary}20`,
            display: 'inline-block',
          }}>
            You already know how to build the future grid.
            <br />
            <span style={{ fontWeight: 400, fontSize: '22px', color: colors.textMuted }}>
              You just didn't know it yet.
            </span>
          </div>
        </div>
      </SlideContainer>
    </Slide>,

    /* ── Slide 24: Thank You ── */
    <Slide key="thank-you" backgroundColor={colors.bg}>
      <SlideContainer>
        <div style={{ textAlign: 'center' }}>
          <GlowText size="56px" style={{ textAlign: 'center', marginBottom: 20 }}>
            Thank You
          </GlowText>
          <div style={{ fontSize: '18px', color: colors.textMuted, fontFamily: '"Inter"', lineHeight: 1.8 }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: colors.primary, fontWeight: 600 }}>Enpal / Flexa</span>
            </div>
            <div style={{ fontSize: '14px', color: colors.textDim }}>
              Building Europe's Largest Virtual Power Plant
            </div>
          </div>
          <div style={{ marginTop: 48, display: 'flex', gap: 16, justifyContent: 'center' }}>
            {[
              { label: 'Slides & Interactive Demo', color: colors.primary },
              { label: 'Deep Dive Website', color: colors.success },
            ].map((item) => (
              <div key={item.label} style={{
                background: colors.surface, border: `1px solid ${item.color}25`,
                borderRadius: 12, padding: '16px 24px', fontSize: '14px',
                fontWeight: 500, color: item.color, fontFamily: '"Inter"',
              }}>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </SlideContainer>
    </Slide>,
  ];
}
