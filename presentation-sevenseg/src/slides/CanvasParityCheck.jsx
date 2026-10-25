import React, { useEffect, useRef } from 'react';
import { segText, segMeasure } from '../components/sevenseg/canvasSegText.js';
import SevenSegText from '../components/sevenseg/SevenSegText.jsx';
import SevenSegPanel from '../components/sevenseg/SevenSegPanel.jsx';
import SevenSegChrome from '../components/SevenSegChrome.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { colors } from '../theme.js';

// Side-by-side check: SVG primitive vs canvas renderer, for the same strings.
// If these drift, chart readouts won't match the slide chrome.
export default function CanvasParityCheck() {
  const { theme, cycleTheme } = useTheme();
  const canvasRef = useRef(null);

  const samples = ['50.000', '9,000', '4:37', '-42.5', '140', '1,045'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = 2;
    const W = 900;
    const H = 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${H}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = colors.panel;
    ctx.fillRect(0, 0, W, H);

    let y = 60;
    for (const s of samples) {
      segText(ctx, s, 30, y, { height: 44, glow: 0.5, align: 'left' });
      // width readout in plain text so we can verify measurement
      ctx.font = '12px "JetBrains Mono"';
      ctx.fillStyle = colors.textDim;
      ctx.fillText(`w=${segMeasure(s, { height: 44 }).toFixed(1)}`, W - 130, y - 10);
      y += 44;
    }
  }, [theme]);

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', padding: 40, fontFamily: '"JetBrains Mono", monospace' }}>
      <SevenSegChrome theme={theme} cycleTheme={cycleTheme} />
      <div style={{ color: colors.primary, letterSpacing: '0.2em', fontSize: 13, marginBottom: 20 }}>
        CANVAS / SVG PARITY · PANEL: {theme.toUpperCase()}
      </div>

      <div style={{ display: 'flex', gap: 40, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: colors.textDim, fontSize: 11, marginBottom: 8 }}>SVG PRIMITIVE</div>
          <SevenSegPanel glow={0.4}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {samples.map(s => (
                <SevenSegText key={s} value={s} height={44} />
              ))}
            </div>
          </SevenSegPanel>
        </div>

        <div>
          <div style={{ color: colors.textDim, fontSize: 11, marginBottom: 8 }}>CANVAS RENDERER</div>
          <SevenSegPanel glow={0.4} padding="0">
            <canvas ref={canvasRef} style={{ display: 'block' }} />
          </SevenSegPanel>
        </div>
      </div>
    </div>
  );
}
