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

  // Fade factor for previous systems when electricity phase starts
  const elecFade = progress >= 0.65 ? Math.min(1, (progress - 0.65) / 0.1) : 0;
  const prevAlpha = 1 - elecFade;

  if (progress < 0.25) {
    // Water system: tap -> tank (buffer) -> drain
    const sub = progress / 0.25;
    const tankW = 80;
    const tankH = 100;
    const tankX = cx - tankW / 2;
    const tankY = cy - tankH / 2;

    // Tank outline
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 2;
    ctx.strokeRect(tankX, tankY, tankW, tankH);

    // Water level in tank (fluctuates)
    const level = 0.5 + Math.sin(now / 800) * 0.15;
    const waterH = tankH * level;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
    ctx.fillRect(tankX + 2, tankY + tankH - waterH, tankW - 4, waterH - 2);

    // Tap (left pipe)
    const tapEndX = tankX - 10;
    const tapY = tankY + 30;
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.05, tapY);
    ctx.lineTo(tapEndX, tapY);
    ctx.stroke();

    // Tap label
    ctx.font = `11px ${monoFont}`;
    ctx.fillStyle = colors.textDim;
    ctx.textAlign = 'center';
    ctx.fillText('SUPPLY', w * 0.05 + 30, tapY - 12);

    // Water particles flowing in
    for (let i = 0; i < 5; i++) {
      const px = w * 0.05 + ((i / 5 + now * 0.0004) % 1) * (tapEndX - w * 0.05);
      ctx.beginPath();
      ctx.arc(px, tapY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
      ctx.fill();
    }

    // Drain (right pipe)
    const drainStartX = tankX + tankW + 10;
    const drainY = tankY + tankH - 20;
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(drainStartX, drainY);
    ctx.lineTo(w * 0.95, drainY);
    ctx.stroke();

    // Drain label
    ctx.font = `11px ${monoFont}`;
    ctx.fillStyle = colors.textDim;
    ctx.fillText('DEMAND', w * 0.95 - 30, drainY - 12);

    // Water particles flowing out
    for (let i = 0; i < 5; i++) {
      const px = drainStartX + ((i / 5 + now * 0.0003) % 1) * (w * 0.95 - drainStartX);
      ctx.beginPath();
      ctx.arc(px, drainY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
      ctx.fill();
    }

    // Buffer label
    ctx.font = `bold 13px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.textAlign = 'center';
    ctx.fillText('BUFFER', cx, tankY + tankH + 24);

    // Title label
    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = Math.min(1, sub * 3);
    ctx.fillText('Water: buffered', cx, cy - tankH / 2 - 30);
    ctx.globalAlpha = 1;
  } else if (progress < 0.45) {
    // Gas system: pipeline with pressure gauge
    const sub = (progress - 0.25) / 0.2;
    const pipeY = cy;
    const pipeLeft = w * 0.08;
    const pipeRight = w * 0.92;
    const pipeH = 24;

    // Pipeline tube
    ctx.fillStyle = colors.surfaceLight;
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pipeLeft, pipeY - pipeH / 2, pipeRight - pipeLeft, pipeH, 12);
    ctx.fill();
    ctx.stroke();

    // Pressure gauge (center circle)
    const gaugeR = 28;
    ctx.beginPath();
    ctx.arc(cx, pipeY - gaugeR - pipeH / 2 - 8, gaugeR, 0, Math.PI * 2);
    ctx.fillStyle = colors.surface;
    ctx.fill();
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Gauge needle
    const needleAngle = -Math.PI / 4 + Math.sin(now / 1200) * 0.3;
    const gaugeCx = cx;
    const gaugeCy = pipeY - gaugeR - pipeH / 2 - 8;
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gaugeCx, gaugeCy);
    ctx.lineTo(gaugeCx + Math.cos(needleAngle) * (gaugeR - 6), gaugeCy + Math.sin(needleAngle) * (gaugeR - 6));
    ctx.stroke();

    // Gauge label
    ctx.font = `9px ${monoFont}`;
    ctx.fillStyle = colors.textDim;
    ctx.textAlign = 'center';
    ctx.fillText('PSI', gaugeCx, gaugeCy + gaugeR + 14);

    // Gas particles
    for (let i = 0; i < 10; i++) {
      const px = pipeLeft + 12 + ((i / 10 + now * 0.00025) % 1) * (pipeRight - pipeLeft - 24);
      const py = pipeY + (Math.sin(i * 2.1 + now / 400) * (pipeH * 0.2));
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = 0.6;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Buffer label
    ctx.font = `bold 13px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.fillText('Pipeline pressure = buffer', cx, pipeY + pipeH / 2 + 30);

    // Title
    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = Math.min(1, sub * 3);
    ctx.fillText('Gas: buffered', cx, pipeY - gaugeR * 2 - pipeH / 2 - 16);
    ctx.globalAlpha = 1;
  } else if (progress < 0.65) {
    // Data network: servers with queue bars, retry arrows, cache
    const sub = (progress - 0.45) / 0.2;
    const serverW = 40;
    const serverH = 50;
    const gap = 60;

    // Three servers
    const servers = [
      { x: cx - gap - serverW, y: cy - serverH / 2, label: 'SRC' },
      { x: cx - serverW / 2, y: cy - serverH / 2, label: 'QUEUE' },
      { x: cx + gap, y: cy - serverH / 2, label: 'DST' },
    ];

    servers.forEach((s, i) => {
      // Server box
      ctx.fillStyle = colors.surface;
      ctx.strokeStyle = colors.textDim;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(s.x, s.y, serverW, serverH, 4);
      ctx.fill();
      ctx.stroke();

      // Server lines (rack look)
      for (let j = 0; j < 3; j++) {
        const ly = s.y + 10 + j * 14;
        ctx.fillStyle = i === 1 ? colors.success : colors.primary;
        ctx.globalAlpha = 0.5;
        ctx.fillRect(s.x + 6, ly, serverW - 12, 6);
        ctx.globalAlpha = 1;
      }

      // Label
      ctx.font = `9px ${monoFont}`;
      ctx.fillStyle = colors.textDim;
      ctx.textAlign = 'center';
      ctx.fillText(s.label, s.x + serverW / 2, s.y + serverH + 14);
    });

    // Arrows between servers
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1.5;
    // Arrow src -> queue
    const a1x1 = servers[0].x + serverW + 4;
    const a1x2 = servers[1].x - 4;
    const aY = cy;
    ctx.beginPath();
    ctx.moveTo(a1x1, aY);
    ctx.lineTo(a1x2, aY);
    ctx.stroke();
    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(a1x2, aY);
    ctx.lineTo(a1x2 - 6, aY - 4);
    ctx.lineTo(a1x2 - 6, aY + 4);
    ctx.closePath();
    ctx.fillStyle = colors.textMuted;
    ctx.fill();

    // Arrow queue -> dst
    const a2x1 = servers[1].x + serverW + 4;
    const a2x2 = servers[2].x - 4;
    ctx.beginPath();
    ctx.moveTo(a2x1, aY);
    ctx.lineTo(a2x2, aY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(a2x2, aY);
    ctx.lineTo(a2x2 - 6, aY - 4);
    ctx.lineTo(a2x2 - 6, aY + 4);
    ctx.closePath();
    ctx.fill();

    // Retry arrow (curved, above)
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a2x2 - 10, cy - serverH / 2 - 10);
    ctx.quadraticCurveTo(cx, cy - serverH / 2 - 30, a1x1 + 10, cy - serverH / 2 - 10);
    ctx.stroke();
    ctx.font = `9px ${monoFont}`;
    ctx.fillStyle = colors.accent;
    ctx.textAlign = 'center';
    ctx.fillText('RETRY', cx, cy - serverH / 2 - 34);

    // Cache box below
    const cacheW = 60;
    const cacheH = 20;
    ctx.fillStyle = colors.surfaceLight;
    ctx.strokeStyle = colors.success;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - cacheW / 2, cy + serverH / 2 + 20, cacheW, cacheH, 3);
    ctx.fill();
    ctx.stroke();
    ctx.font = `bold 9px ${monoFont}`;
    ctx.fillStyle = colors.success;
    ctx.fillText('CACHE', cx, cy + serverH / 2 + 34);

    // Buffer label
    ctx.font = `bold 13px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.fillText('Queue + cache + retry = buffer', cx, cy + serverH / 2 + 60);

    // Title
    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.primary;
    ctx.globalAlpha = Math.min(1, sub * 3);
    ctx.fillText('Data: buffered', cx, cy - serverH / 2 - 50);
    ctx.globalAlpha = 1;
  } else if (progress < 0.85) {
    // Electricity: direct wire, no buffer
    const sub = (progress - 0.65) / 0.2;
    const fadeIn = Math.min(1, sub * 2);

    ctx.globalAlpha = fadeIn;

    // Generator (left)
    const genX = w * 0.15;
    const genR = 28;
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(genX, cy, genR, 0, Math.PI * 2);
    ctx.stroke();

    // Generator spinning lines
    const rot = now / 600;
    for (let i = 0; i < 4; i++) {
      const angle = rot + (i * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(genX, cy);
      ctx.lineTo(genX + Math.cos(angle) * (genR - 4), cy + Math.sin(angle) * (genR - 4));
      ctx.strokeStyle = colors.primary;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Generator label
    ctx.font = `11px ${monoFont}`;
    ctx.fillStyle = colors.textDim;
    ctx.textAlign = 'center';
    ctx.fillText('GENERATOR', genX, cy + genR + 18);

    // House/load (right)
    const houseX = w * 0.85;
    // Simple house: triangle roof + rectangle body
    const houseW = 40;
    const houseH = 30;
    const roofH = 20;
    ctx.fillStyle = colors.surfaceLight;
    ctx.strokeStyle = colors.textMuted;
    ctx.lineWidth = 1.5;
    // Body
    ctx.fillRect(houseX - houseW / 2, cy - houseH / 2 + roofH / 2, houseW, houseH);
    ctx.strokeRect(houseX - houseW / 2, cy - houseH / 2 + roofH / 2, houseW, houseH);
    // Roof
    ctx.beginPath();
    ctx.moveTo(houseX - houseW / 2 - 5, cy - houseH / 2 + roofH / 2);
    ctx.lineTo(houseX, cy - houseH / 2 - roofH / 2);
    ctx.lineTo(houseX + houseW / 2 + 5, cy - houseH / 2 + roofH / 2);
    ctx.closePath();
    ctx.fillStyle = colors.surface;
    ctx.fill();
    ctx.stroke();

    // House label
    ctx.font = `11px ${monoFont}`;
    ctx.fillStyle = colors.textDim;
    ctx.textAlign = 'center';
    ctx.fillText('LOAD', houseX, cy + houseH / 2 + roofH / 2 + 18);

    // Direct wire connecting them
    const wireY = cy;
    const wireLeft = genX + genR + 8;
    const wireRight = houseX - houseW / 2 - 12;
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wireLeft, wireY);
    ctx.lineTo(wireRight, wireY);
    ctx.stroke();

    // Electrons on wire
    for (let i = 0; i < 6; i++) {
      const t = (i / 6 + now * 0.0003) % 1;
      const ex = wireLeft + t * (wireRight - wireLeft);
      ctx.beginPath();
      ctx.arc(ex, wireY, 3, 0, Math.PI * 2);
      ctx.fillStyle = colors.primary;
      ctx.shadowColor = colors.primary;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Conspicuous empty space label
    const emptyX = cx;
    ctx.font = `12px ${monoFont}`;
    ctx.fillStyle = colors.textDim;
    ctx.globalAlpha = fadeIn * 0.5;
    ctx.fillText('(nothing here)', emptyX, wireY - 20);
    ctx.globalAlpha = fadeIn;

    // Title
    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.danger;
    ctx.fillText('Electricity: no buffer', cx, cy - 70);

    ctx.globalAlpha = 1;
  } else {
    // Final message with pulsing red glow
    const sub = (progress - 0.85) / 0.15;
    const pulse = 0.4 + Math.sin(now / 400) * 0.3;

    // Red glow background
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.4);
    grad.addColorStop(0, `rgba(239, 68, 68, ${pulse * 0.15 * sub})`);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Main text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `bold 20px ${monoFont}`;
    ctx.fillStyle = colors.danger;
    ctx.shadowColor = colors.danger;
    ctx.shadowBlur = 12 * pulse;
    ctx.globalAlpha = Math.min(1, sub * 2);
    ctx.fillText('No cache. No buffer. No retry.', cx, cy - 16);
    ctx.shadowBlur = 0;

    ctx.font = `bold 16px ${monoFont}`;
    ctx.fillStyle = colors.text;
    ctx.globalAlpha = Math.min(1, Math.max(0, sub * 2 - 0.5));
    ctx.fillText('Just physics.', cx, cy + 20);

    ctx.globalAlpha = 1;
    ctx.textBaseline = 'alphabetic';
  }

  ctx.textBaseline = 'alphabetic';
}

export default function NoBufferBriefing() {
  const renderCb = useCallback(render, []);

  return (
    <ScrollBriefing id="no-buffer" height={400} render={renderCb}>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Water Has a Tank
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Water utilities pump into reservoirs. If demand spikes, the tank
          absorbs the difference. Supply and demand don't need to match
          second by second.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Gas Has Pressure
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Gas pipelines maintain pressure as a buffer. If someone opens a
          stove, the pressure drops slightly -- but the system absorbs it.
          There's slack built in.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Data Has Queues
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Networks use buffers, caches, and retry mechanisms. If a server
          is slow, packets wait. The system is designed to tolerate
          mismatches between sender and receiver.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          Electricity Has Nothing
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Electrons don't wait. There is no tank, no pipeline pressure, no
          queue. Every watt produced must be consumed at the exact moment
          it's generated. This is the fundamental constraint that makes the
          grid so fragile.
        </p>
      </div>
    </ScrollBriefing>
  );
}
