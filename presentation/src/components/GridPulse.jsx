import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * GridPulse — a minimalist visualization of synchronized frequency across
 * the EU grid. Shows concentric rings emanating from a central "50 Hz" readout,
 * with nodes pulsing in sync to demonstrate the synchronous nature of the grid.
 */
export default function GridPulse({ width = 800, height = 400 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Simplified node positions (spread around center)
    const cx = width / 2;
    const cy = height / 2;
    const nodes = [];
    const countries = [
      'Portugal', 'Spain', 'France', 'Germany', 'Italy',
      'Netherlands', 'Poland', 'Austria', 'Sweden', 'Norway',
      'Czech Rep.', 'Romania', 'Greece', 'Belgium', 'Switzerland',
      'Hungary', 'Denmark', 'Finland', 'Turkey', 'UK',
    ];
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 - Math.PI / 2;
      const ring = i % 3 === 0 ? 0.65 : i % 3 === 1 ? 0.45 : 0.82;
      const r = Math.min(width, height) * ring * 0.45;
      nodes.push({
        x: cx + Math.cos(angle) * r + (Math.sin(i * 7) * 15),
        y: cy + Math.sin(angle) * r + (Math.cos(i * 5) * 10),
        label: countries[i],
        phase: i * 0.3,
      });
    }

    const draw = () => {
      const now = performance.now();
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Concentric frequency rings (50 Hz pulse)
      const ringCount = 4;
      for (let r = 0; r < ringCount; r++) {
        const phase = ((now / 1200) + r * 0.25) % 1;
        const radius = phase * Math.min(width, height) * 0.48;
        const alpha = Math.max(0, (1 - phase) * 0.15);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Connection lines (all nodes connected to center, some to neighbors)
      nodes.forEach((node, i) => {
        // To center
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(node.x, node.y);
        ctx.strokeStyle = `${colors.primary}12`;
        ctx.lineWidth = 0.5;
        ctx.stroke();

        // To neighbors
        const next = nodes[(i + 1) % nodes.length];
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(next.x, next.y);
        ctx.strokeStyle = `${colors.primary}18`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Nodes pulsing in sync
      const globalPulse = Math.sin(now / 400) * 0.3 + 0.7; // ~2.5 Hz visual pulse

      nodes.forEach((node) => {
        const size = 4 + globalPulse * 2;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, size + 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.06 * globalPulse})`;
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.3 + globalPulse * 0.3})`;
        ctx.fill();

        // Label
        ctx.fillStyle = `${colors.text}60`;
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + size + 12);
      });

      // Center frequency display
      const freq = 50.0 + Math.sin(now / 600) * 0.006;
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 32px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.shadowBlur = 20;
      ctx.shadowColor = colors.primary;
      ctx.fillText(`${freq.toFixed(3)}`, cx, cy - 4);
      ctx.shadowBlur = 0;

      ctx.font = '14px JetBrains Mono';
      ctx.fillStyle = `${colors.primary}80`;
      ctx.fillText('Hz', cx, cy + 16);

      ctx.font = '10px Inter';
      ctx.fillStyle = colors.textDim;
      ctx.fillText('ALL NODES SYNCHRONIZED', cx, cy + 32);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width, height, borderRadius: 8,
        border: `1px solid ${colors.surfaceLight}`,
      }}
    />
  );
}
