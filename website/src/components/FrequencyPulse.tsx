import { useEffect, useRef } from 'react';

/**
 * A small animated sine wave that represents grid frequency.
 * Decorative — used as a visual accent on grid-related pages.
 */
interface Props {
  width?: number;
  height?: number;
  color?: string;
  frequency?: number;
  speed?: number;
}

export default function FrequencyPulse({
  width = 200,
  height = 40,
  color = '#22d3ee',
  frequency = 2,
  speed = 1,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    let phase = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const mid = height / 2;
      const amp = height * 0.35;

      // Glow
      ctx.shadowColor = color + '60';
      ctx.shadowBlur = 8;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      for (let x = 0; x < width; x++) {
        const t = (x / width) * Math.PI * 2 * frequency + phase;
        const y = mid + Math.sin(t) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Faded trail
      ctx.shadowBlur = 0;
      ctx.strokeStyle = color + '20';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < width; x++) {
        const t = (x / width) * Math.PI * 2 * frequency + phase - 0.5;
        const y = mid + Math.sin(t) * amp * 0.6;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.03 * speed;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, color, frequency, speed]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block' }}
    />
  );
}
