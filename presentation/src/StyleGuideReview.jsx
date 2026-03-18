import React, { useState } from 'react';
import { colors } from './theme';

// ── WCAG contrast ratio computation ──────────────────────────────────────
function sRGBtoLinear(c) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function luminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

function contrastRatio(hex1, hex2) {
  const l1 = luminance(hex1);
  const l2 = luminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function wcagLevel(ratio, isLargeText = false) {
  if (isLargeText) {
    if (ratio >= 4.5) return 'AAA';
    if (ratio >= 3.0) return 'AA';
    return 'FAIL';
  }
  if (ratio >= 7.0) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  return 'FAIL';
}

const levelColor = { AAA: '#10b981', AA: '#f59e0b', FAIL: '#ef4444' };

// ── Proposed accessibility alternatives ──────────────────────────────────
const PROPOSED = {
  textDim: { current: '#64748b', proposed: '#7d8da1', label: 'textDim' },
  danger: { current: '#ef4444', proposed: '#f87171', label: 'danger (lighter)' },
};

// ── All color tokens ─────────────────────────────────────────────────────
const FOREGROUNDS = [
  { key: 'text', hex: colors.text, label: 'text' },
  { key: 'textMuted', hex: colors.textMuted, label: 'textMuted' },
  { key: 'textDim', hex: colors.textDim, label: 'textDim' },
  { key: 'primary', hex: colors.primary, label: 'primary (cyan)' },
  { key: 'secondary', hex: colors.secondary, label: 'secondary (purple)' },
  { key: 'accent', hex: colors.accent, label: 'accent (amber)' },
  { key: 'danger', hex: colors.danger, label: 'danger (red)' },
  { key: 'success', hex: colors.success, label: 'success (green)' },
];

const BACKGROUNDS = [
  { key: 'bg', hex: colors.bg, label: 'bg' },
  { key: 'bgAlt', hex: colors.bgAlt, label: 'bgAlt' },
  { key: 'surface', hex: colors.surface, label: 'surface' },
  { key: 'surfaceLight', hex: colors.surfaceLight, label: 'surfaceLight' },
];

// ── Color blindness simulation (rough deuteranopia transform) ────────────
function simulateDeuteranopia(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  // Brettel 1997 deuteranopia simulation (simplified)
  const nr = 0.625 * r + 0.375 * g;
  const ng = 0.700 * r + 0.300 * g;
  const nb = 0.300 * g + 0.700 * b;
  const toHex = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
}

// ── Sections ─────────────────────────────────────────────────────────────
function ContrastMatrix() {
  return (
    <div>
      <h2 style={{ color: colors.text, fontFamily: 'Inter', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        WCAG Contrast Matrix
      </h2>
      <p style={{ color: colors.textMuted, fontFamily: 'Inter', fontSize: 14, marginBottom: 20 }}>
        Normal text needs 4.5:1 (AA) / 7:1 (AAA). Large text (24px+ or 18.67px+ bold) needs 3:1 (AA) / 4.5:1 (AAA).
      </p>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontFamily: 'JetBrains Mono', fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ padding: '8px 12px', color: colors.textMuted, textAlign: 'left', borderBottom: `1px solid ${colors.surfaceLight}` }}>
                FG / BG
              </th>
              {BACKGROUNDS.map(bg => (
                <th key={bg.key} style={{ padding: '8px 16px', borderBottom: `1px solid ${colors.surfaceLight}` }}>
                  <div style={{ color: colors.textMuted, fontSize: 11 }}>{bg.label}</div>
                  <div style={{ width: 40, height: 20, background: bg.hex, borderRadius: 4, margin: '4px auto 0', border: '1px solid #333' }} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FOREGROUNDS.map(fg => (
              <tr key={fg.key}>
                <td style={{ padding: '8px 12px', borderBottom: `1px solid ${colors.surface}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 4, background: fg.hex, border: '1px solid #333', flexShrink: 0 }} />
                    <span style={{ color: fg.hex, fontSize: 13 }}>{fg.label}</span>
                    <span style={{ color: colors.textDim, fontSize: 11, marginLeft: 4 }}>{fg.hex}</span>
                  </div>
                </td>
                {BACKGROUNDS.map(bg => {
                  const ratio = contrastRatio(fg.hex, bg.hex);
                  const normal = wcagLevel(ratio, false);
                  const large = wcagLevel(ratio, true);
                  return (
                    <td key={bg.key} style={{ padding: '6px 12px', textAlign: 'center', borderBottom: `1px solid ${colors.surface}` }}>
                      <div style={{
                        background: bg.hex, borderRadius: 8, padding: '8px 10px',
                        border: `1px solid ${colors.surfaceLight}`,
                      }}>
                        <div style={{ color: fg.hex, fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                          Aa
                        </div>
                        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 2 }}>
                          {ratio.toFixed(1)}:1
                        </div>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                            background: `${levelColor[normal]}22`, color: levelColor[normal],
                          }}>{normal}</span>
                          <span style={{
                            fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                            background: `${levelColor[large]}22`, color: levelColor[large],
                          }}>{large}(L)</span>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccessibilityIssues() {
  const issues = [
    {
      severity: 'FAIL',
      title: 'textDim (#64748b) fails WCAG AA on bg & surface',
      detail: `Contrast on bg: ${contrastRatio(colors.textDim, colors.bg).toFixed(1)}:1 (needs 4.5:1). On surface: ${contrastRatio(colors.textDim, colors.surface).toFixed(1)}:1. Used for "vs" labels, descriptive text, and canvas axis labels at 9-11px.`,
      fix: 'Lighten textDim to #7d8da1 (5.5:1 on bg, 4.5:1 on surface) or only use textDim at 24px+.',
    },
    {
      severity: 'WARN',
      title: 'Red/Green semantic pair is problematic for ~8% of males',
      detail: 'danger (#ef4444) and success (#10b981) are used to convey opposite meanings. Under deuteranopia, both shift toward similar brownish tones.',
      fix: 'Always pair colors with shape, icon, or text labels. Add a "+" or checkmark for success, "x" or triangle for danger. Never rely on color alone.',
    },
    {
      severity: 'WARN',
      title: 'Canvas text at 9-11px in textMuted/textDim',
      detail: 'Chart axis labels (e.g., DuckCurveChart, FrequencyDemo) render at 9-11px in textDim. At that size, even 4.5:1 is hard to read on a projector.',
      fix: 'Bump minimum canvas label size to 12px and use textMuted (#94a3b8) instead of textDim.',
    },
    {
      severity: 'INFO',
      title: 'Stat description text at 16px in textMuted',
      detail: `16px is "normal" text by WCAG (below 24px/18.67px bold). textMuted on bg gives ${contrastRatio(colors.textMuted, colors.bg).toFixed(1)}:1 — passes AA (4.5:1).`,
      fix: 'No action needed. Comfortable contrast.',
    },
  ];

  return (
    <div>
      <h2 style={{ color: colors.text, fontFamily: 'Inter', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Accessibility Issues
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {issues.map((issue, i) => {
          const c = issue.severity === 'FAIL' ? colors.danger : issue.severity === 'WARN' ? colors.accent : colors.primary;
          return (
            <div key={i} style={{
              background: colors.surface, borderRadius: 8, padding: '16px 20px',
              borderLeft: `4px solid ${c}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 4,
                  background: `${c}22`, color: c, fontFamily: 'JetBrains Mono',
                }}>{issue.severity}</span>
                <span style={{ color: colors.text, fontFamily: 'Inter', fontSize: 16, fontWeight: 600 }}>{issue.title}</span>
              </div>
              <p style={{ color: colors.textMuted, fontFamily: 'Inter', fontSize: 14, margin: '0 0 8px', lineHeight: 1.5 }}>{issue.detail}</p>
              <p style={{ color: colors.success, fontFamily: 'JetBrains Mono', fontSize: 13, margin: 0 }}>Fix: {issue.fix}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TextDimComparison() {
  const current = '#64748b';
  const alt1 = '#7d8da1';  // +1.4 contrast bump
  const alt2 = '#8896ab';  // even lighter
  const options = [
    { hex: current, label: 'Current', desc: `${contrastRatio(current, colors.bg).toFixed(1)}:1 on bg` },
    { hex: alt1, label: 'Option A: #7d8da1', desc: `${contrastRatio(alt1, colors.bg).toFixed(1)}:1 on bg` },
    { hex: alt2, label: 'Option B: #8896ab', desc: `${contrastRatio(alt2, colors.bg).toFixed(1)}:1 on bg` },
  ];

  return (
    <div>
      <h2 style={{ color: colors.text, fontFamily: 'Inter', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        textDim Alternatives
      </h2>
      <p style={{ color: colors.textMuted, fontFamily: 'Inter', fontSize: 14, marginBottom: 16 }}>
        Compare the current textDim against lighter alternatives that pass WCAG AA on all backgrounds.
      </p>
      <div style={{ display: 'flex', gap: 16 }}>
        {options.map((opt, i) => (
          <div key={i} style={{ flex: 1, borderRadius: 8, overflow: 'hidden', border: `1px solid ${colors.surfaceLight}` }}>
            <div style={{ background: colors.bg, padding: 20 }}>
              <div style={{ color: opt.hex, fontSize: 20, fontFamily: 'Inter', fontWeight: 600, marginBottom: 8 }}>
                {opt.label}
              </div>
              <div style={{ color: opt.hex, fontSize: 14, fontFamily: 'Inter', marginBottom: 4 }}>
                The quick brown fox jumps over the lazy dog. This is body text at 14px simulating descriptive captions and axis labels.
              </div>
              <div style={{ color: opt.hex, fontSize: 11, fontFamily: 'JetBrains Mono', marginBottom: 8 }}>
                0 Hz | 50 Hz | 100 Hz -- axis labels at 11px
              </div>
              <div style={{
                fontSize: 12, fontFamily: 'JetBrains Mono', padding: '4px 8px', borderRadius: 4,
                background: colors.surface, color: colors.textMuted, display: 'inline-block',
              }}>
                {opt.desc}
              </div>
            </div>
            <div style={{ background: colors.surface, padding: 20 }}>
              <div style={{ color: opt.hex, fontSize: 14, fontFamily: 'Inter', marginBottom: 4 }}>
                Same text on surface background
              </div>
              <div style={{ color: opt.hex, fontSize: 11, fontFamily: 'JetBrains Mono', marginBottom: 8 }}>
                0 Hz | 50 Hz | 100 Hz -- axis labels at 11px
              </div>
              <div style={{
                fontSize: 12, fontFamily: 'JetBrains Mono', padding: '4px 8px', borderRadius: 4,
                background: colors.bg, color: colors.textMuted, display: 'inline-block',
              }}>
                {contrastRatio(opt.hex, colors.surface).toFixed(1)}:1 on surface
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorBlindSimulation() {
  const semanticColors = [
    { label: 'danger', hex: colors.danger },
    { label: 'success', hex: colors.success },
    { label: 'accent', hex: colors.accent },
    { label: 'primary', hex: colors.primary },
    { label: 'secondary', hex: colors.secondary },
  ];

  return (
    <div>
      <h2 style={{ color: colors.text, fontFamily: 'Inter', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        Color Blindness Check (Deuteranopia)
      </h2>
      <p style={{ color: colors.textMuted, fontFamily: 'Inter', fontSize: 14, marginBottom: 16 }}>
        Approximate deuteranopia simulation (red-green blindness, ~6% of males). Notice how danger and success become hard to distinguish.
      </p>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: colors.textMuted, fontFamily: 'JetBrains Mono', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Normal Vision</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {semanticColors.map(c => (
              <div key={c.label} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: '100%', height: 64, borderRadius: 8, background: c.hex,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: luminance(c.hex) > 0.4 ? '#000' : '#fff', fontSize: 13, fontFamily: 'JetBrains Mono', fontWeight: 600,
                }}>
                  {c.label}
                </div>
                <div style={{ color: colors.textDim, fontSize: 11, fontFamily: 'JetBrains Mono', marginTop: 4 }}>{c.hex}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: colors.textMuted, fontFamily: 'JetBrains Mono', fontSize: 13, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Deuteranopia (Simulated)</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {semanticColors.map(c => {
              const sim = simulateDeuteranopia(c.hex);
              return (
                <div key={c.label} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    width: '100%', height: 64, borderRadius: 8, background: sim,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: luminance(sim) > 0.4 ? '#000' : '#fff', fontSize: 13, fontFamily: 'JetBrains Mono', fontWeight: 600,
                  }}>
                    {c.label}
                  </div>
                  <div style={{ color: colors.textDim, fontSize: 11, fontFamily: 'JetBrains Mono', marginTop: 4 }}>{sim}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{
        marginTop: 16, padding: '12px 16px', borderRadius: 8,
        background: `${colors.accent}11`, border: `1px solid ${colors.accent}33`,
        color: colors.accent, fontFamily: 'Inter', fontSize: 14,
      }}>
        Recommendation: Use shape + color (checkmarks for success, X for danger). Our slides already mostly do this via text labels, but canvas charts should avoid red/green-only data series differentiation.
      </div>
    </div>
  );
}

function TypographyScale() {
  const sizes = [
    { px: 64, weight: 800, label: 'h1 — Slide title', font: 'Inter', sample: 'The Power Grid' },
    { px: 48, weight: 700, label: 'h2 — Section heading', font: 'Inter', sample: 'Virtual Power Plants' },
    { px: 36, weight: 700, label: 'h3 — Subheading', font: 'Inter', sample: 'Frequency Dynamics' },
    { px: 24, weight: 400, label: 'body — Slide text', font: 'Inter', sample: 'The grid must balance supply and demand in real time.' },
    { px: 20, weight: 400, label: 'subtitle — Descriptions', font: 'Inter', sample: '36 countries synchronized on one frequency at 50 Hz' },
    { px: 16, weight: 400, label: 'stat desc — Stat labels', font: 'Inter', sample: 'installed capacity' },
    { px: 20, weight: 400, label: 'mono — Code/data', font: 'JetBrains Mono', sample: 'SELECT frequency FROM grid WHERE ts > NOW() - 1h' },
    { px: 11, weight: 400, label: 'canvas axis — Chart labels', font: 'JetBrains Mono', sample: '0 Hz | 25 Hz | 50 Hz | 75 Hz | 100 Hz' },
  ];

  return (
    <div>
      <h2 style={{ color: colors.text, fontFamily: 'Inter', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Typography Scale
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {sizes.map((s, i) => {
          const isLarge = s.px >= 24 || (s.px >= 19 && s.weight >= 700);
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'baseline', gap: 16, padding: '12px 0',
              borderBottom: `1px solid ${colors.surface}`,
            }}>
              <div style={{ width: 200, flexShrink: 0 }}>
                <div style={{ color: colors.textMuted, fontSize: 12, fontFamily: 'JetBrains Mono' }}>
                  {s.px}px / {s.weight} / {s.font.split(',')[0].replace(/"/g, '')}
                </div>
                <div style={{ color: colors.textDim, fontSize: 11, fontFamily: 'JetBrains Mono' }}>
                  {s.label}
                </div>
                <div style={{
                  fontSize: 10, fontFamily: 'JetBrains Mono', marginTop: 2,
                  color: isLarge ? colors.success : colors.textMuted,
                }}>
                  {isLarge ? 'WCAG large text' : 'WCAG normal text'}
                </div>
              </div>
              <div style={{
                fontFamily: s.font, fontSize: s.px > 48 ? 48 : s.px, fontWeight: s.weight,
                color: colors.text, lineHeight: 1.2, flex: 1,
              }}>
                {s.sample}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function VersionComparison() {
  // We can't render the actual Spectacle slides easily outside of a Deck,
  // so we describe them with visual previews of their layout and style.
  const versions = [
    {
      key: 'A', name: 'Version A: "The Living Grid"', status: 'ACTIVE (slide 6)',
      desc: 'Two comparison cards (VW Wolfsburg vs Grid) + stat row with Appear animation. Data-rich, balanced layout.',
      strengths: ['Good information density', 'Stat boxes are scannable', 'Appear reveals build tension'],
      weaknesses: ['16px stat descriptions use textMuted (passes AA but tight at projector distances)', 'Cards use 6% opacity backgrounds -- nearly invisible'],
    },
    {
      key: 'B', name: 'Version B: "Grid vs. Tech"', status: 'not used',
      desc: 'Side-by-side rows comparing grid constraints vs tech infrastructure. Giant X watermark. Animated row reveals.',
      strengths: ['Relatable analogies for tech audience', 'Clean two-column comparison', 'Row animations are engaging'],
      weaknesses: ['Giant 300px X at 30% opacity may confuse -- is something wrong?', 'All text is 20px in colored/muted -- less hierarchy', 'Rows can feel repetitive'],
    },
    {
      key: 'C', name: 'Version C: "Synchronized Dance"', status: 'not used',
      desc: 'GridPulse animation (800x360 canvas) + minimal text. Focus on synchronization metaphor.',
      strengths: ['Dramatic visual impact', 'Animation draws audience attention', 'Simple and focused message'],
      weaknesses: ['Very content-light -- just one stat slide', 'Relies heavily on speaker narration', 'GridPulse is another canvas component to maintain'],
    },
    {
      key: 'D', name: 'Version D: "The Zoom Out"', status: 'ACTIVE (slide 5)',
      desc: 'Full-bleed LargestMachineZoom canvas animation with stat overlay. Cinematic reveal from VW factory to EU grid.',
      strengths: ['Most dramatic and memorable', 'Canvas animation is spectacular', 'Stat boxes are legible over blurred background'],
      weaknesses: ['Heavy -- another full-screen canvas', 'Stat text at 16px on semi-transparent surface may be hard on projectors', 'Backdrop blur not supported everywhere'],
    },
  ];

  return (
    <div>
      <h2 style={{ color: colors.text, fontFamily: 'Inter', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
        GridScaleSlides: Variant Comparison
      </h2>
      <p style={{ color: colors.textMuted, fontFamily: 'Inter', fontSize: 14, marginBottom: 20 }}>
        Currently using versionA (slide 6) and versionD (slide 5). B and C are available but unused.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {versions.map(v => (
          <div key={v.key} style={{
            background: colors.surface, borderRadius: 12, padding: 20,
            border: v.status.includes('ACTIVE') ? `2px solid ${colors.primary}` : `1px solid ${colors.surfaceLight}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ color: colors.text, fontFamily: 'Inter', fontSize: 18, fontWeight: 700 }}>{v.name}</div>
              <span style={{
                fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: v.status.includes('ACTIVE') ? `${colors.primary}22` : `${colors.textDim}22`,
                color: v.status.includes('ACTIVE') ? colors.primary : colors.textDim,
              }}>{v.status}</span>
            </div>
            <p style={{ color: colors.textMuted, fontFamily: 'Inter', fontSize: 14, margin: '0 0 12px', lineHeight: 1.5 }}>{v.desc}</p>
            <div style={{ display: 'flex', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: colors.success, fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 4 }}>STRENGTHS</div>
                {v.strengths.map((s, i) => (
                  <div key={i} style={{ color: colors.textMuted, fontSize: 13, fontFamily: 'Inter', marginBottom: 2 }}>+ {s}</div>
                ))}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: colors.danger, fontSize: 12, fontFamily: 'JetBrains Mono', fontWeight: 700, marginBottom: 4 }}>WEAKNESSES</div>
                {v.weaknesses.map((w, i) => (
                  <div key={i} style={{ color: colors.textMuted, fontSize: 13, fontFamily: 'Inter', marginBottom: 2 }}>- {w}</div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ColorPaletteSwatch() {
  const allColors = [
    { key: 'bg', hex: colors.bg },
    { key: 'bgAlt', hex: colors.bgAlt },
    { key: 'surface', hex: colors.surface },
    { key: 'surfaceLight', hex: colors.surfaceLight },
    { key: 'primary', hex: colors.primary },
    { key: 'secondary', hex: colors.secondary },
    { key: 'accent', hex: colors.accent },
    { key: 'danger', hex: colors.danger },
    { key: 'success', hex: colors.success },
    { key: 'text', hex: colors.text },
    { key: 'textMuted', hex: colors.textMuted },
    { key: 'textDim', hex: colors.textDim },
  ];

  return (
    <div>
      <h2 style={{ color: colors.text, fontFamily: 'Inter', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Color Palette
      </h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {allColors.map(c => (
          <div key={c.key} style={{ textAlign: 'center' }}>
            <div style={{
              width: 80, height: 80, borderRadius: 8, background: c.hex,
              border: `1px solid ${colors.surfaceLight}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                color: luminance(c.hex) > 0.3 ? '#000' : '#fff',
                fontSize: 10, fontFamily: 'JetBrains Mono', fontWeight: 600,
              }}>{c.hex}</span>
            </div>
            <div style={{ color: colors.textMuted, fontSize: 11, fontFamily: 'JetBrains Mono', marginTop: 4 }}>{c.key}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryRecommendations() {
  return (
    <div>
      <h2 style={{ color: colors.text, fontFamily: 'Inter', fontSize: 28, fontWeight: 700, marginBottom: 16 }}>
        Summary Recommendations
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          {
            title: 'Bump textDim to #7d8da1',
            desc: 'Lifts contrast from 4.0:1 to 5.5:1 on bg. Passes AA everywhere. Minimal visual change — still reads as "dim" but now accessible.',
            impact: 'Low risk, high value',
            color: colors.success,
          },
          {
            title: 'Min canvas font size: 12px',
            desc: 'Chart axis labels at 9-11px are illegible on projectors. Bump to 12px minimum across DuckCurveChart, FrequencyDemo, CurtailmentChart, etc.',
            impact: 'Low risk, medium value',
            color: colors.success,
          },
          {
            title: 'Add shape cues to red/green',
            desc: 'Where danger/success colors convey meaning, add an icon, checkmark, or text label alongside. Most slides already do this via text.',
            impact: 'Low risk, low effort',
            color: colors.primary,
          },
          {
            title: 'Keep current palette otherwise',
            desc: 'text (17.7:1), textMuted (7.6:1), primary (10.9:1), secondary (7.1:1), accent (9.0:1), success (7.7:1), danger (5.2:1) all pass AA. No changes needed.',
            impact: 'No action',
            color: colors.textMuted,
          },
        ].map((rec, i) => (
          <div key={i} style={{
            background: colors.surface, borderRadius: 8, padding: '16px 20px',
            borderLeft: `4px solid ${rec.color}`,
          }}>
            <div style={{ color: colors.text, fontFamily: 'Inter', fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{rec.title}</div>
            <p style={{ color: colors.textMuted, fontFamily: 'Inter', fontSize: 14, margin: '0 0 8px', lineHeight: 1.5 }}>{rec.desc}</p>
            <span style={{
              fontSize: 11, fontFamily: 'JetBrains Mono', fontWeight: 700, padding: '2px 8px', borderRadius: 4,
              background: `${rec.color}22`, color: rec.color,
            }}>{rec.impact}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StyleGuideReview() {
  return (
    <div style={{
      background: colors.bg, color: colors.text, minHeight: '100vh',
      fontFamily: 'Inter, system-ui, sans-serif', padding: '40px 60px',
    }}>
      <h1 style={{ fontSize: 40, fontWeight: 800, color: colors.primary, marginBottom: 8 }}>
        Style Guide Review
      </h1>
      <p style={{ color: colors.textMuted, fontSize: 16, marginBottom: 40 }}>
        Accessibility audit and component variant comparison for the KubeCon 2026 VPP presentation.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
        <ColorPaletteSwatch />
        <ContrastMatrix />
        <AccessibilityIssues />
        <TextDimComparison />
        <ColorBlindSimulation />
        <TypographyScale />
        <VersionComparison />
        <SummaryRecommendations />
      </div>

      <div style={{ marginTop: 60, padding: '20px 0', borderTop: `1px solid ${colors.surface}`, color: colors.textDim, fontSize: 13, fontFamily: 'JetBrains Mono' }}>
        Navigate to this page with ?styleguide in the URL. Return to presentation by removing the param.
      </div>
    </div>
  );
}
