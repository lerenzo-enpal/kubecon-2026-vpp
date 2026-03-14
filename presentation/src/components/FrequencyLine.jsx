import React, { useEffect, useRef } from 'react';
import { colors } from '../theme';

export default function FrequencyLine({
  width = 900,
  height = 200,
  baseFreq = 50.0,
  collapse = false,
  vppSave = false,
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      tRef.current += 0.02;
      const t = tRef.current;

      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Draw threshold lines
      ctx.strokeStyle = colors.danger + '40';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);

      const freqToY = (f) => height / 2 - ((f - baseFreq) / 2.5) * (height / 2);

      // 49.0 Hz line (load shedding)
      const y49 = freqToY(49.0);
      ctx.beginPath();
      ctx.moveTo(0, y49);
      ctx.lineTo(width, y49);
      ctx.stroke();

      // Label
      ctx.fillStyle = colors.danger + '80';
      ctx.font = '11px Inter';
      ctx.fillText('49.0 Hz — Load Shedding', 10, y49 - 5);

      // 50.0 Hz line
      const y50 = freqToY(50.0);
      ctx.strokeStyle = colors.textDim + '30';
      ctx.beginPath();
      ctx.moveTo(0, y50);
      ctx.lineTo(width, y50);
      ctx.stroke();
      ctx.fillStyle = colors.textDim + '60';
      ctx.fillText('50.0 Hz', 10, y50 - 5);

      ctx.setLineDash([]);

      // Draw frequency line
      ctx.beginPath();
      ctx.strokeStyle = collapse
        ? vppSave
          ? colors.success
          : colors.danger
        : colors.primary;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ctx.strokeStyle;

      const points = [];
      for (let x = 0; x < width; x++) {
        const normalizedX = x / width;
        let freq = baseFreq;

        // Normal jitter
        freq += Math.sin(t * 3 + x * 0.05) * 0.03;
        freq += Math.sin(t * 7 + x * 0.02) * 0.015;

        if (collapse && normalizedX > 0.4) {
          const collapseProgress = (normalizedX - 0.4) / 0.6;
          if (vppSave) {
            // Dip then recover
            const dip = Math.sin(collapseProgress * Math.PI) * 0.8;
            freq -= dip;
            if (collapseProgress > 0.5) {
              freq += (collapseProgress - 0.5) * 1.2;
            }
          } else {
            // Full collapse
            freq -= collapseProgress * collapseProgress * 3.5;
          }
        }

        const y = freqToY(freq);
        points.push({ x, y, freq });
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Current frequency readout
      const lastPoint = points[points.length - 1];
      const currentFreq = collapse
        ? vppSave
          ? 49.85 + Math.sin(t) * 0.05
          : 47.2 + Math.sin(t * 2) * 0.1
        : baseFreq + Math.sin(t * 3) * 0.03;

      ctx.fillStyle = collapse
        ? vppSave
          ? colors.success
          : colors.danger
        : colors.primary;
      ctx.font = 'bold 28px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`${currentFreq.toFixed(3)} Hz`, width - 20, 35);
      ctx.textAlign = 'left';

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, baseFreq, collapse, vppSave]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width,
        height,
        borderRadius: 8,
        border: `1px solid ${colors.surfaceLight}`,
      }}
    />
  );
}
