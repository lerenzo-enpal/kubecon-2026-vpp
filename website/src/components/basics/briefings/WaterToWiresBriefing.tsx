import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

function render(
  ctx: CanvasRenderingContext2D,
  progress: number,
  w: number,
  h: number,
  colors: CanvasThemeColors
) {
  const now = Date.now();
  const monoFont = '"JetBrains Mono", monospace';
  const cx = w / 2;
  const cy = h / 2;

  if (progress < 0.3) {
    // Water pipe system
    const sub = progress / 0.3;
    const pipeY = cy;
    const pipeLeft = w * 0.08;
    const pipeRight = w * 0.88;
    const pipeLen = pipeRight - pipeLeft;
    const baseWidth = 36;
    const pipeWidth = baseWidth - sub * 14; // Narrows as progress increases
    const radius = Math.min(pipeWidth / 2, 8);

    // Pipe body
    ctx.fillStyle = colors.surfaceLight;
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pipeLeft, pipeY - pipeWidth / 2, pipeLen, pipeWidth, radius);
    ctx.fill();
    ctx.stroke();

    // Water particles
    const particleCount = 14;
    const speed = 0.06;
    for (let i = 0; i < particleCount; i++) {
      const baseX = (i / particleCount + (now * speed) / 1000) % 1;
      const px = pipeLeft + 10 + baseX * (pipeLen - 20);
      const py = pipeY + (Math.sin(i * 1.7 + now / 300) * (pipeWidth * 0.25));
      const r = 3 + sub * 1;
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(59, 130, 246, ${0.6 + sub * 0.3})`;
      ctx.fill();
    }

    // Labels
    ctx.font = `bold 13px ${monoFont}`;
    ctx.textAlign = 'center';

    // Pressure label (top)
    const labelAlpha = Math.min(1, sub * 3);
    ctx.fillStyle = colors.text;
    ctx.globalAlpha = labelAlpha;
    ctx.fillText('Pressure (Voltage)', cx, pipeY - pipeWidth / 2 - 28);

    // Arrow pointing down to pipe
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, pipeY - pipeWidth / 2 - 22);
    ctx.lineTo(cx, pipeY - pipeWidth / 2 - 6);
    ctx.stroke();

    // Flow rate label (bottom)
    const flowAlpha = Math.min(1, Math.max(0, sub * 3 - 0.5));
    ctx.globalAlpha = flowAlpha;
    ctx.fillStyle = colors.text;
    ctx.fillText('Flow Rate (Current)', cx, pipeY + pipeWidth / 2 + 38);

    // Pipe width label (right side)
    const widthAlpha = Math.min(1, Math.max(0, sub * 3 - 1));
    ctx.globalAlpha = widthAlpha;
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Pipe Width (Resistance)', cx, pipeY + pipeWidth / 2 + 60);

    ctx.globalAlpha = 1;
  } else if (progress < 0.6) {
    // Morph from pipe to wire
    const sub = (progress - 0.3) / 0.3;
    const wireY = cy;
    const wireLeft = w * 0.08;
    const wireRight = w * 0.88;
    const wireLen = wireRight - wireLeft;
    const pipeWidth = 22 - sub * 18; // 22 -> 4
    const radius = Math.max(1, pipeWidth / 2);

    // Pipe/wire body
    const r1 = Math.round(26 + sub * (34 - 26));
    const g1 = Math.round(42 + sub * (211 - 42));
    const b1 = Math.round(54 + sub * (238 - 54));
    ctx.fillStyle = sub > 0.7 ? 'transparent' : colors.surfaceLight;
    ctx.strokeStyle = `rgb(${r1}, ${g1}, ${b1})`;
    ctx.lineWidth = Math.max(2, pipeWidth);
    ctx.beginPath();
    ctx.roundRect(wireLeft, wireY - pipeWidth / 2, wireLen, pipeWidth, radius);
    if (sub < 0.7) ctx.fill();
    ctx.stroke();

    // Electrons (morph from blue to cyan)
    const particleCount = 16;
    const speed = 0.08;
    for (let i = 0; i < particleCount; i++) {
      const baseX = (i / particleCount + (now * speed) / 1000) % 1;
      const px = wireLeft + 10 + baseX * (wireLen - 20);
      const py = wireY + Math.sin(i * 1.7 + now / 300) * (pipeWidth * 0.2);
      const dotR = 3 - sub * 1.5;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(1.5, dotR), 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = sub * 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Labels
    ctx.font = `bold 13px ${monoFont}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.primary;
    const vLabel = sub < 0.5 ? 'Pressure -> Voltage (V)' : 'Voltage (V)';
    const iLabel = sub < 0.5 ? 'Flow Rate -> Current (A)' : 'Current (A)';
    const rLabel = sub < 0.5 ? 'Pipe Width -> Resistance' : 'Resistance (ohm)';
    ctx.fillText(vLabel, cx, wireY - 40);
    ctx.fillStyle = colors.text;
    ctx.fillText(iLabel, cx, wireY + 50);
    ctx.fillStyle = colors.textMuted;
    ctx.fillText(rLabel, cx, wireY + 72);
  } else if (progress < 0.8) {
    // Wire circuit with lightbulb
    const sub = (progress - 0.6) / 0.2;
    const pad = w * 0.1;
    const top = cy - 80;
    const bot = cy + 80;
    const left = pad;
    const right = w - pad;

    // Circuit rectangle
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(right, top);
    ctx.lineTo(right, bot);
    ctx.lineTo(left, bot);
    ctx.closePath();
    ctx.stroke();

    // Battery symbol (left side)
    const batX = left;
    const batY = cy;
    ctx.lineWidth = 3;
    ctx.strokeStyle = colors.text;
    ctx.beginPath();
    ctx.moveTo(batX - 2, batY - 14);
    ctx.lineTo(batX - 2, batY + 14);
    ctx.stroke();
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(batX + 6, batY - 8);
    ctx.lineTo(batX + 6, batY + 8);
    ctx.stroke();
    ctx.lineWidth = 3;

    // Label
    ctx.font = `12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = 'center';
    ctx.fillText('Battery', left + 2, bot + 28);

    // Lightbulb (right side)
    const bulbX = right;
    const bulbY = cy;
    const glowIntensity = sub;
    ctx.beginPath();
    ctx.arc(bulbX, bulbY, 18, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(253, 224, 71, ${glowIntensity * 0.7})`;
    ctx.shadowColor = `rgba(253, 224, 71, ${glowIntensity})`;
    ctx.shadowBlur = glowIntensity * 25;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = `12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.fillText('Load', right, bot + 28);

    // Electrons flowing around circuit
    const totalPerim = 2 * (right - left) + 2 * (bot - top);
    const electronCount = 12;
    const speed = 0.00012;
    for (let i = 0; i < electronCount; i++) {
      const t = ((i / electronCount) + now * speed) % 1;
      const d = t * totalPerim;
      let ex: number, ey: number;
      const topLen = right - left;
      const rightLen = bot - top;
      const botLen = right - left;
      if (d < topLen) {
        ex = left + d;
        ey = top;
      } else if (d < topLen + rightLen) {
        ex = right;
        ey = top + (d - topLen);
      } else if (d < topLen + rightLen + botLen) {
        ex = right - (d - topLen - rightLen);
        ey = bot;
      } else {
        ex = left;
        ey = bot - (d - topLen - rightLen - botLen);
      }
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  } else {
    // Ohm's Law formula
    const sub = (progress - 0.8) / 0.2;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Main formula
    ctx.font = `bold 36px ${monoFont}`;
    ctx.fillStyle = colors.primary;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 12;
    ctx.globalAlpha = Math.min(1, sub * 2);
    ctx.fillText('V = I \u00D7 R', cx, cy - 30);
    ctx.shadowBlur = 0;

    // Values
    ctx.font = `24px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.globalAlpha = Math.min(1, Math.max(0, sub * 2 - 0.5));
    ctx.fillText('230V = 10A \u00D7 23\u03A9', cx, cy + 30);

    // Subtitle
    ctx.font = `14px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.globalAlpha = Math.min(1, Math.max(0, sub * 2 - 1));
    ctx.fillText("Ohm's Law", cx, cy + 70);

    ctx.globalAlpha = 1;
  }

  ctx.textBaseline = 'alphabetic';
}

export default function WaterToWiresBriefing() {
  const renderCb = useCallback(render, []);

  return (
    <ScrollBriefing id="what-is-this-stuff" height={300} render={renderCb}>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          What is Voltage?
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Voltage is electrical pressure -- the force that pushes electrons
          through a wire. Higher voltage means more push.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          What is Current?
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Current is the flow of electrons -- how many pass a point each second.
          Measured in Amperes (A).
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          What is Resistance?
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Resistance is how much a material opposes the flow of electrons.
          Thinner wire = more resistance.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          It's Exactly Like Water
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Voltage = pressure. Current = flow rate. Resistance = pipe width. The
          analogy is almost perfect.
        </p>
      </div>
    </ScrollBriefing>
  );
}
