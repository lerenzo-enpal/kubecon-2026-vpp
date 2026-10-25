import React, { useState } from 'react';
import {
  SevenSegment,
  SevenSegText,
  SevenSegPanel,
  SevenSegStat,
  SevenSegHeading,
  segmentsForChar,
} from '../components/sevenseg/index.js';
import SevenSegChrome from '../components/SevenSegChrome.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { colors } from '../theme.js';

export default function SevenSegStyleGuide() {
  const { theme, cycleTheme } = useTheme();
  const [lampTest, setLampTest] = useState(false);
  const glyphs = '0123456789ABCDEF-_?'.split('');

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: 40, fontFamily: '"JetBrains Mono", monospace' }}>
      <SevenSegChrome
        theme={theme}
        cycleTheme={cycleTheme}
        lampTest={lampTest}
        onLampTest={() => setLampTest(v => !v)}
      />

      <div style={{ color: colors.primary, letterSpacing: '0.2em', fontSize: 13, marginBottom: 24 }}>
        7-SEGMENT PRIMITIVE · PANEL: {theme.toUpperCase()}{lampTest ? ' · LAMP TEST' : ''}
      </div>

      {/* Glyphs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginBottom: 34 }}>
        {glyphs.map((g, i) => (
          <div key={g} style={{ textAlign: 'center' }}>
            <SevenSegPanel padding="8px" sweep={false} glow={0.25}>
              <SevenSegment char={g} height={82} seed={i} on={lampTest} />
            </SevenSegPanel>
            <div style={{ color: colors.textDim, fontSize: 11, marginTop: 5 }}>{g}</div>
          </div>
        ))}
      </div>

      {/* Readouts */}
      <div style={{ color: colors.primary, letterSpacing: '0.2em', fontSize: 13, margin: '0 0 14px' }}>
        READOUTS
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 34 }}>
        <SevenSegPanel label="grid frequency" glow={0.5}>
          <SevenSegText value="50.000" height={52} on={lampTest} />
        </SevenSegPanel>
        <SevenSegPanel label="texas peak" accent={colors.danger} alert>
          <SevenSegText value="9,000" height={52} on={lampTest} />
        </SevenSegPanel>
        <SevenSegPanel label="time to collapse" accent={colors.accent} glow={0.6}>
          <SevenSegText value="4:37" height={52} on={lampTest} />
        </SevenSegPanel>
        <SevenSegPanel label="response" accent={colors.success}>
          <SevenSegText value="140" height={52} on={lampTest} />
        </SevenSegPanel>
        <SevenSegPanel label="negative price">
          <SevenSegText value="-42.5" height={52} on={lampTest} />
        </SevenSegPanel>
      </div>

      {/* Stats */}
      <div style={{ color: colors.primary, letterSpacing: '0.2em', fontSize: 13, margin: '0 0 14px' }}>
        COUNT-UP STATS
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 34, flexWrap: 'wrap' }}>
        <SevenSegStat countTo={9000} prefix="$" label="peak price per MWh" height={38} accent={colors.danger} alert />
        <SevenSegStat countTo={246} label="people dead" height={38} accent={colors.danger} />
        <SevenSegStat countTo={4.5} decimals={1} suffix="M" label="homes dark" height={38} accent={colors.textMuted} />
        <SevenSegStat countTo={140} suffix=" ms" label="battery response" height={38} accent={colors.success} />
      </div>

      {/* Headings */}
      <div style={{ color: colors.primary, letterSpacing: '0.2em', fontSize: 13, margin: '0 0 14px' }}>
        HEADINGS
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, marginBottom: 34 }}>
        <SevenSegHeading eyebrow="Part I" index="01" size={34}>The Grid</SevenSegHeading>
        <SevenSegHeading eyebrow="Texas, February 2021" index="4.37" size={28}>Four minutes and thirty-seven seconds</SevenSegHeading>
        <SevenSegHeading eyebrow="Part III" index="03" size={34} color={colors.primary}>The Virtual Power Plant</SevenSegHeading>
      </div>

      {/* Glyph coverage */}
      <div style={{ color: colors.primary, letterSpacing: '0.2em', fontSize: 13, margin: '0 0 12px' }}>
        UNSUPPORTED GLYPHS (render blank, never lie)
      </div>
      <div style={{ color: colors.textMuted, fontSize: 13 }}>
        {['K', 'M', 'N', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'].map(g => (
          <span key={g} style={{ marginRight: 14 }}>
            {g}:{segmentsForChar(g).length === 0 ? 'blank' : segmentsForChar(g).join('')}
          </span>
        ))}
      </div>
    </div>
  );
}
