import { useEffect, useRef } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

/**
 * Compares four infrastructure systems side by side.
 * Water, gas, and data all have buffers. Electricity does not.
 * Animated canvas: water flows, data packets move, electricity sparks.
 */

function drawWater(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  t: number, colors: CanvasThemeColors,
) {
  const tankX = x + w * 0.2;
  const tankW = w * 0.6;
  const tankY = y + 30;
  const tankH = h - 80;

  // Tank outline
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  ctx.strokeRect(tankX, tankY, tankW, tankH);

  // Water fill (animated level)
  const level = 0.55 + 0.1 * Math.sin(t * 0.8);
  const waterH = tankH * level;
  const waterY = tankY + tankH - waterH;

  ctx.fillStyle = `${colors.primary}30`;
  ctx.fillRect(tankX + 1, waterY, tankW - 2, waterH - 1);

  // Water surface wave
  ctx.beginPath();
  ctx.moveTo(tankX + 1, waterY);
  for (let px = 0; px <= tankW - 2; px++) {
    const wave = Math.sin((px / tankW) * Math.PI * 3 + t * 2) * 2;
    ctx.lineTo(tankX + 1 + px, waterY + wave);
  }
  ctx.strokeStyle = `${colors.primary}80`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Pipe in
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tankX + tankW / 2, tankY);
  ctx.lineTo(tankX + tankW / 2, tankY - 15);
  ctx.stroke();

  // Flow drops
  const dropY = tankY - 15 + ((t * 40) % 20);
  if (dropY < tankY) {
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(tankX + tankW / 2, dropY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawGas(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  t: number, colors: CanvasThemeColors,
) {
  const pipeY = y + h / 2 - 10;
  const pipeH = 20;
  const pipeX = x + 15;
  const pipeW = w - 30;

  // Pipeline
  ctx.fillStyle = colors.surfaceLight;
  ctx.fillRect(pipeX, pipeY, pipeW, pipeH);
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(pipeX, pipeY, pipeW, pipeH);

  // Pressure gauge (circle on top)
  const gaugeX = x + w / 2;
  const gaugeY = pipeY - 18;
  const gaugeR = 16;

  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, gaugeR, 0, Math.PI * 2);
  ctx.fillStyle = colors.surface;
  ctx.fill();
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Gauge needle
  const angle = -Math.PI * 0.7 + Math.sin(t * 0.5) * 0.3 + Math.PI * 0.7;
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY);
  ctx.lineTo(
    gaugeX + Math.cos(angle - Math.PI) * gaugeR * 0.7,
    gaugeY + Math.sin(angle - Math.PI) * gaugeR * 0.7,
  );
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Gas flow (moving dashes)
  ctx.setLineDash([6, 8]);
  ctx.lineDashOffset = -t * 30;
  ctx.beginPath();
  ctx.moveTo(pipeX + 5, pipeY + pipeH / 2);
  ctx.lineTo(pipeX + pipeW - 5, pipeY + pipeH / 2);
  ctx.strokeStyle = `${colors.accent}80`;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawData(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  t: number, colors: CanvasThemeColors,
) {
  const cx = x + w / 2;

  // Server box
  const boxW = w * 0.45;
  const boxH = 50;
  const boxX = cx - boxW / 2;
  const boxY = y + h / 2 - boxH / 2 - 10;

  ctx.fillStyle = colors.surfaceLight;
  ctx.fillRect(boxX, boxY, boxW, boxH);
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX, boxY, boxW, boxH);

  // Server lines
  for (let i = 0; i < 3; i++) {
    const ly = boxY + 12 + i * 14;
    ctx.fillStyle = colors.textDim;
    ctx.fillRect(boxX + 8, ly, boxW - 16, 2);

    // Status LED
    const ledOn = ((Math.floor(t * 3) + i) % 3) === 0;
    ctx.fillStyle = ledOn ? colors.success : `${colors.success}30`;
    ctx.beginPath();
    ctx.arc(boxX + boxW - 12, ly + 1, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Queue/cache icon (stack of small boxes above)
  const queueY = boxY - 28;
  for (let i = 0; i < 3; i++) {
    const qx = cx - 18 + i * 14;
    const visible = ((t * 2 + i) % 3) > 0.5;
    ctx.fillStyle = visible ? `${colors.primary}60` : `${colors.primary}20`;
    ctx.fillRect(qx, queueY, 10, 10);
    ctx.strokeStyle = `${colors.primary}50`;
    ctx.lineWidth = 1;
    ctx.strokeRect(qx, queueY, 10, 10);
  }

  // Moving data packets (small squares falling into queue)
  const packetPhase = (t * 1.5) % 2;
  if (packetPhase < 1) {
    const py = queueY - 20 + packetPhase * 18;
    ctx.fillStyle = colors.primary;
    ctx.fillRect(cx - 4, py, 8, 6);
  }
}

function drawElectricity(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  t: number, colors: CanvasThemeColors,
) {
  const cx = x + w / 2;
  const cy = y + h / 2 - 5;

  // Just a bare wire -- conspicuously empty
  const wireY = cy;
  const wireX1 = x + 20;
  const wireX2 = x + w - 20;

  ctx.beginPath();
  ctx.moveTo(wireX1, wireY);
  ctx.lineTo(wireX2, wireY);
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Wire endpoints (terminals)
  for (const wx of [wireX1, wireX2]) {
    ctx.beginPath();
    ctx.arc(wx, wireY, 4, 0, Math.PI * 2);
    ctx.fillStyle = colors.textDim;
    ctx.fill();
  }

  // Occasional spark on the wire
  const sparkPhase = (t * 1.2) % 3;
  if (sparkPhase < 0.3) {
    const sparkX = wireX1 + (wireX2 - wireX1) * (0.3 + sparkPhase);
    const alpha = 1 - sparkPhase / 0.3;

    ctx.strokeStyle = `rgba(255, 230, 100, ${alpha * 0.9})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(sparkX - 6, wireY - 8);
    ctx.lineTo(sparkX, wireY);
    ctx.lineTo(sparkX - 4, wireY);
    ctx.lineTo(sparkX + 2, wireY + 8);
    ctx.stroke();
  }

  // "Nothing here" dashed outline where a buffer would be
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = `${colors.textDim}40`;
  ctx.lineWidth = 1;
  const emptyW = w * 0.5;
  const emptyH = 40;
  ctx.strokeRect(cx - emptyW / 2, wireY - emptyH - 8, emptyW, emptyH);
  ctx.setLineDash([]);

  // "?" in the empty box
  ctx.font = '16px "JetBrains Mono", monospace';
  ctx.fillStyle = `${colors.textDim}50`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', cx, wireY - emptyH / 2 - 8);
}

export default function BufferComparison() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => { colorsRef.current = getCanvasThemeColors(); };
    mql.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mql.removeEventListener('change', update); observer.disconnect(); };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function resize() {
      if (!canvas) return;
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = 280;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }

    resize();
    window.addEventListener('resize', resize);

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0 });
    io.observe(canvas);

    function frame() {
      if (!canvas || !visible) { rafRef.current = requestAnimationFrame(frame); return; }
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const colors = colorsRef.current;
      const t = Date.now() / 1000;

      const pad = 12;
      const colW = (w - pad * 5) / 4;

      const systems = [
        { label: 'Water', tag: 'Buffered', draw: drawWater, tagColor: colors.success },
        { label: 'Gas', tag: 'Buffered', draw: drawGas, tagColor: colors.success },
        { label: 'Data', tag: 'Buffered', draw: drawData, tagColor: colors.success },
        { label: 'Electricity', tag: 'No buffer', draw: drawElectricity, tagColor: colors.danger },
      ];

      systems.forEach((sys, i) => {
        const sx = pad + i * (colW + pad);

        // Column background
        ctx.fillStyle = `${colors.surface}80`;
        ctx.beginPath();
        ctx.roundRect(sx, 0, colW, h, 6);
        ctx.fill();

        // Title
        ctx.font = 'bold 15px "JetBrains Mono", monospace';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(sys.label, sx + colW / 2, 12);

        // Draw the system illustration
        sys.draw(ctx, sx, 30, colW, h - 80, t, colors);

        // Tag at bottom
        const tagW = ctx.measureText(sys.tag).width + 16;
        const tagX = sx + colW / 2 - tagW / 2;
        const tagY = h - 36;

        ctx.fillStyle = `${sys.tagColor}20`;
        ctx.beginPath();
        ctx.roundRect(tagX, tagY, tagW, 22, 4);
        ctx.fill();

        ctx.font = '14px "JetBrains Mono", monospace';
        ctx.fillStyle = sys.tagColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(sys.tag, sx + colW / 2, tagY + 11);
      });

      ctx.restore();
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      io.disconnect();
    };
  }, []);

  return (
    <div className="w-full my-6 rounded-lg overflow-hidden" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)' }}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="Comparison of buffered systems (water, gas, data) versus unbuffered electricity"
        className="w-full"
        style={{ height: 280 }}
      />
    </div>
  );
}
