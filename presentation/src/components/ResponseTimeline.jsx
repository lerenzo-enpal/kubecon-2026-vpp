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

      // Animated sweep fill
      const sweepX = padLeft + ease * trackW;
      if (t > 0.01) {
        ctx.fillStyle = colors.primary + '12';
        ctx.beginPath();
        ctx.roundRect(padLeft, trackY - trackH / 2, sweepX - padLeft, trackH, [8, 0, 0, 8]);
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
        ctx.font = 'bold 15px JetBrains Mono';
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
