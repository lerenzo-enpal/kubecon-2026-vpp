import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// Response times in milliseconds (log scale)
const SOURCES = [
  { label: 'VPP Battery', ms: 140, color: colors.success },
  { label: 'Hydro', ms: 20000, color: '#60a5fa' },
  { label: 'Gas Turbine', ms: 600000, color: '#fb923c' },
  { label: 'Coal', ms: 7200000, color: colors.textDim },
];

// Log scale: 100ms to 10,000,000ms (10h)
const LOG_MIN = Math.log10(100);
const LOG_MAX = Math.log10(10000000);

function msToLabel(ms) {
  if (ms < 1000) return `${ms} ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(0)} sec`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(0)} min`;
  return `${(ms / 3600000).toFixed(0)} hr`;
}

export default function ResponseTimeline({ width = 720, height = 120, delay = 0 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const delayRef = useRef(0);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padLeft = 55;
    const padRight = 20;
    const trackY = 52;
    const trackH = 20;
    const trackW = width - padLeft - padRight;

    let lastTime = performance.now();

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      if (isActive) {
        if (delayRef.current < delay) {
          delayRef.current += dt;
        } else {
          tRef.current = Math.min(tRef.current + dt / 2.0, 1.0);
        }
      }
      const t = tRef.current;
      const ease = 1 - Math.pow(1 - t, 3);

      ctx.clearRect(0, 0, width, height);

      // Track background
      ctx.fillStyle = colors.text + '0c';
      ctx.beginPath();
      ctx.roundRect(padLeft, trackY - trackH / 2, trackW, trackH, 8);
      ctx.fill();
      ctx.strokeStyle = colors.text + '20';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(padLeft, trackY - trackH / 2, trackW, trackH, 8);
      ctx.stroke();

      // Tick marks on log scale
      const ticks = [100, 1000, 10000, 60000, 600000, 3600000];
      const tickLabels = ['100ms', '1s', '10s', '1min', '10min', '1hr'];
      ctx.font = '12px JetBrains Mono';
      ctx.fillStyle = colors.textDim + '99';
      ctx.textAlign = 'center';
      ticks.forEach((ms, i) => {
        const frac = (Math.log10(ms) - LOG_MIN) / (LOG_MAX - LOG_MIN);
        const x = padLeft + frac * trackW;
        ctx.strokeStyle = colors.text + '18';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, trackY + trackH / 2 + 3);
        ctx.lineTo(x, trackY + trackH / 2 + 10);
        ctx.stroke();
        ctx.fillText(tickLabels[i], x, trackY + trackH / 2 + 24);
      });

      // Animated energy bolt sweep
      const sweepX = padLeft + ease * trackW;
      const boltNow = now / 1000;
      if (t > 0.01 && t < 1.0) {
        // Jagged bolt trail — series of short zigzag segments behind the leading edge
        const boltLen = Math.min(sweepX - padLeft, 120); // trail length
        const boltStartX = sweepX - boltLen;
        const segments = 14;
        const segW = boltLen / segments;
        ctx.save();
        // Trail glow (wide, dim)
        ctx.strokeStyle = colors.primary + '18';
        ctx.lineWidth = trackH;
        ctx.beginPath();
        ctx.moveTo(padLeft, trackY);
        ctx.lineTo(boltStartX, trackY);
        ctx.stroke();
        // Bolt path
        ctx.beginPath();
        ctx.moveTo(boltStartX, trackY);
        for (let s = 1; s <= segments; s++) {
          const sx = boltStartX + s * segW;
          const jitter = (s < segments)
            ? (Math.sin(boltNow * 18 + s * 3.7) * 6 + Math.cos(boltNow * 29 + s * 5.1) * 3)
            : 0; // last point lands on center
          ctx.lineTo(sx, trackY + jitter);
        }
        // Main bolt stroke
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 10;
        ctx.shadowColor = colors.primary;
        ctx.stroke();
        // Bright inner core
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#ffffff';
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();

        // Leading edge flash
        const flicker = 0.7 + 0.3 * Math.sin(boltNow * 40);
        ctx.save();
        ctx.beginPath();
        ctx.arc(sweepX, trackY, 5 * flicker, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.primary;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Spark particles flying off the leading edge
        for (let sp = 0; sp < 4; sp++) {
          const age = ((boltNow * 6 + sp * 1.7) % 1);
          const sparkX = sweepX + age * 18 * (sp % 2 === 0 ? 1 : -0.5);
          const sparkY = trackY + Math.sin(boltNow * 25 + sp * 4) * (8 + age * 6);
          const sparkAlpha = 1 - age;
          ctx.globalAlpha = sparkAlpha * flicker;
          ctx.beginPath();
          ctx.arc(sparkX, sparkY, 1.5 - age, 0, Math.PI * 2);
          ctx.fillStyle = colors.primary;
          ctx.shadowBlur = 4;
          ctx.shadowColor = colors.primary;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
        ctx.restore();
      } else if (t >= 1.0) {
        // Final state — settled energy trail
        ctx.fillStyle = colors.primary + '12';
        ctx.beginPath();
        ctx.roundRect(padLeft, trackY - trackH / 2, trackW, trackH, 8);
        ctx.fill();
      }

      // Source markers
      SOURCES.forEach((src) => {
        const frac = (Math.log10(src.ms) - LOG_MIN) / (LOG_MAX - LOG_MIN);
        const x = padLeft + frac * trackW;

        // Only show if sweep has passed
        const srcT = Math.max(0, Math.min(1, (ease - frac) / 0.05));
        if (srcT <= 0) return;

        const alpha = Math.min(1, srcT * 2);

        // Vertical line
        ctx.strokeStyle = src.color + Math.round(alpha * 200).toString(16).padStart(2, '0');
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(x, trackY - trackH / 2 - 8);
        ctx.lineTo(x, trackY + trackH / 2 + 8);
        ctx.stroke();

        // Dot on track
        ctx.fillStyle = src.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(x, trackY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        ctx.shadowBlur = 12;
        ctx.shadowColor = src.color + '70';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label above
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.fillStyle = src.color;
        ctx.textAlign = 'center';
        ctx.fillText(src.label, x, trackY - trackH / 2 - 14);

        // Time below
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.fillStyle = src.color + 'dd';
        ctx.fillText(msToLabel(src.ms), x, trackY + trackH / 2 + 42);

        ctx.globalAlpha = 1;
      });

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  useEffect(() => {
    if (slideContext?.isSlideActive) {
      tRef.current = 0;
      delayRef.current = 0;
    }
  }, [slideContext?.isSlideActive]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}
