import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * GridFrequencyExplainer — Animated turbine + frequency gauge explaining
 * why all generators spin at 50 Hz and what happens when they don't.
 */

export default function GridFrequencyExplainer({ width = 1200, height = 520 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const startTime = performance.now() / 1000;

    // Phase cycle: normal -> demand surge -> recovery
    // 12s cycle: 0-4s normal, 4-7s frequency drop, 7-9s danger, 9-12s recovery
    const CYCLE = 12;

    function draw() {
      const now = performance.now() / 1000;
      const isActive = slideContext?.isSlideActive;
      const elapsed = now - startTime;
      const phase = elapsed % CYCLE;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = colors.surfaceLight + '08';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // Calculate frequency based on phase
      let freq;
      if (phase < 4) {
        freq = 50.0;
      } else if (phase < 7) {
        // Drop from 50 to 49.0
        const t = (phase - 4) / 3;
        freq = 50.0 - t * 1.0;
      } else if (phase < 9) {
        // Danger zone: fluctuate around 49.0
        freq = 49.0 + Math.sin(phase * 8) * 0.15;
      } else {
        // Recovery back to 50
        const t = (phase - 9) / 3;
        freq = 49.0 + t * 1.0;
      }

      const freqColor = freq >= 49.8 ? colors.success
        : freq >= 49.5 ? colors.accent
        : freq >= 49.0 ? '#f59e0b'
        : colors.danger;

      // === LEFT SIDE: Spinning Turbine ===
      const turbineX = width * 0.22;
      const turbineY = height * 0.42;
      const turbineR = 90;

      // Rotor speed proportional to frequency
      const speed = isActive ? (freq / 50) * Math.PI * 2 : Math.PI * 2;
      const angle = elapsed * speed;

      // Outer ring
      ctx.beginPath();
      ctx.arc(turbineX, turbineY, turbineR, 0, Math.PI * 2);
      ctx.strokeStyle = freqColor + '50';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Glow ring
      ctx.beginPath();
      ctx.arc(turbineX, turbineY, turbineR + 6, 0, Math.PI * 2);
      ctx.strokeStyle = freqColor + '15';
      ctx.lineWidth = 12;
      ctx.stroke();

      // Inner circle
      ctx.beginPath();
      ctx.arc(turbineX, turbineY, turbineR * 0.88, 0, Math.PI * 2);
      ctx.fillStyle = colors.surface;
      ctx.fill();
      ctx.strokeStyle = freqColor + '30';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Rotor blades (6)
      for (let i = 0; i < 6; i++) {
        const a = angle + (i * Math.PI * 2) / 6;
        ctx.beginPath();
        ctx.moveTo(
          turbineX + Math.cos(a) * turbineR * 0.15,
          turbineY + Math.sin(a) * turbineR * 0.15,
        );
        ctx.lineTo(
          turbineX + Math.cos(a) * turbineR * 0.78,
          turbineY + Math.sin(a) * turbineR * 0.78,
        );
        ctx.strokeStyle = freqColor;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Blade tip
        ctx.beginPath();
        ctx.arc(
          turbineX + Math.cos(a) * turbineR * 0.78,
          turbineY + Math.sin(a) * turbineR * 0.78,
          4, 0, Math.PI * 2,
        );
        ctx.fillStyle = freqColor;
        ctx.fill();
      }

      // Center hub
      ctx.beginPath();
      ctx.arc(turbineX, turbineY, turbineR * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = freqColor;
      ctx.fill();

      // Label below turbine
      ctx.font = 'bold 16px "JetBrains Mono"';
      ctx.fillStyle = colors.text;
      ctx.textAlign = 'center';
      ctx.fillText('GENERATOR TURBINE', turbineX, turbineY + turbineR + 30);
      ctx.font = '14px "JetBrains Mono"';
      ctx.fillStyle = colors.textDim;
      ctx.fillText('3,000 RPM = 50 Hz', turbineX, turbineY + turbineR + 50);

      // === CENTER: Frequency Display ===
      const freqX = width * 0.52;
      const freqY = height * 0.28;

      // Big frequency number
      ctx.font = 'bold 64px "JetBrains Mono"';
      ctx.fillStyle = freqColor;
      ctx.textAlign = 'center';
      ctx.shadowBlur = 20;
      ctx.shadowColor = freqColor + '40';
      ctx.fillText(freq.toFixed(2), freqX, freqY);
      ctx.shadowBlur = 0;

      // Hz label
      ctx.font = 'bold 28px "JetBrains Mono"';
      ctx.fillStyle = freqColor + 'aa';
      ctx.fillText('Hz', freqX + 95, freqY);

      // Status label
      const status = freq >= 49.8 ? 'NOMINAL'
        : freq >= 49.5 ? 'RESERVES ACTIVE'
        : freq >= 49.0 ? 'LOAD SHEDDING'
        : 'EMERGENCY';
      ctx.font = 'bold 16px "JetBrains Mono"';
      ctx.fillStyle = freqColor;
      ctx.fillText(status, freqX, freqY + 28);

      // === CENTER-BOTTOM: Frequency bar ===
      const barX = width * 0.38;
      const barY = height * 0.52;
      const barW = width * 0.28;
      const barH = 14;

      // Bar background
      ctx.fillStyle = colors.surface;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 7);
      ctx.fill();

      // Zone colors on bar
      const zones = [
        { from: 47.5, to: 49.0, color: colors.danger },
        { from: 49.0, to: 49.5, color: '#f59e0b' },
        { from: 49.5, to: 49.8, color: colors.accent + '80' },
        { from: 49.8, to: 50.2, color: colors.success },
        { from: 50.2, to: 50.5, color: colors.accent + '80' },
        { from: 50.5, to: 51.0, color: '#f59e0b' },
        { from: 51.0, to: 52.5, color: colors.danger },
      ];
      zones.forEach(z => {
        const x1 = barX + ((z.from - 47.5) / 5) * barW;
        const x2 = barX + ((z.to - 47.5) / 5) * barW;
        ctx.fillStyle = z.color + '60';
        ctx.fillRect(x1, barY + 1, x2 - x1, barH - 2);
      });

      // Needle on bar
      const needleX = barX + ((freq - 47.5) / 5) * barW;
      ctx.beginPath();
      ctx.moveTo(needleX, barY - 4);
      ctx.lineTo(needleX - 5, barY - 12);
      ctx.lineTo(needleX + 5, barY - 12);
      ctx.closePath();
      ctx.fillStyle = freqColor;
      ctx.fill();

      // Bar labels
      ctx.font = '12px "JetBrains Mono"';
      ctx.textAlign = 'center';
      ctx.fillStyle = colors.textDim;
      ctx.fillText('47.5', barX, barY + barH + 16);
      ctx.fillText('50.0', barX + barW / 2, barY + barH + 16);
      ctx.fillText('52.5', barX + barW, barY + barH + 16);

      // === RIGHT SIDE: Key facts ===
      const factsX = width * 0.74;
      let factsY = height * 0.12;
      const lineH = 26;

      const facts = [
        { icon: '1', title: 'All generators spin together', color: colors.primary,
          lines: ['Every turbine on the grid is', 'synchronized at exactly 50 Hz.'] },
        { icon: '2', title: 'Frequency = balance', color: colors.success,
          lines: ['Supply > demand: speeds up.', 'Demand > supply: slows down.'] },
        { icon: '3', title: 'The danger zone', color: '#f59e0b',
          lines: ['Below 49 Hz: automatic load', 'shedding starts. Blackouts begin.'] },
        { icon: '4', title: 'Generators disconnect', color: colors.danger,
          lines: ['Below 47.5 Hz: turbines detach to', 'avoid physical destruction. Cascade.'] },
      ];

      facts.forEach((f, i) => {
        const y = factsY + i * (lineH * 3.5);

        // Number badge
        ctx.beginPath();
        ctx.arc(factsX - 20, y + 8, 12, 0, Math.PI * 2);
        ctx.fillStyle = f.color + '20';
        ctx.fill();
        ctx.strokeStyle = f.color + '50';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.font = 'bold 14px "JetBrains Mono"';
        ctx.fillStyle = f.color;
        ctx.textAlign = 'center';
        ctx.fillText(f.icon, factsX - 20, y + 13);

        // Title
        ctx.font = 'bold 16px "Inter"';
        ctx.fillStyle = colors.text;
        ctx.textAlign = 'left';
        ctx.fillText(f.title, factsX, y + 13);

        // Description lines
        ctx.font = '14px "Inter"';
        ctx.fillStyle = colors.textMuted;
        f.lines.forEach((line, li) => {
          ctx.fillText(line, factsX, y + 13 + (li + 1) * 20);
        });
      });

      // === BOTTOM: "Why does this matter?" callout ===
      const calloutY = height * 0.85;
      ctx.font = 'bold 18px "Inter"';
      ctx.fillStyle = colors.primary;
      ctx.textAlign = 'center';
      ctx.fillText(
        '2.5 Hz separates a stable grid from total collapse.',
        width / 2, calloutY,
      );
      ctx.font = '15px "Inter"';
      ctx.fillStyle = colors.textMuted;
      ctx.fillText(
        'That margin is smaller than the difference between two piano notes.',
        width / 2, calloutY + 24,
      );

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  return <canvas ref={canvasRef} style={{ width, height }} />;
}
