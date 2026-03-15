import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// Simplified EU grid: major generation hubs with approximate canvas positions
const NODES = [
  { id: 'lis', x: 0.08, y: 0.72, label: 'Lisbon', cap: 12, type: 'wind' },
  { id: 'mad', x: 0.15, y: 0.65, label: 'Madrid', cap: 28, type: 'solar' },
  { id: 'par', x: 0.28, y: 0.42, label: 'Paris', cap: 55, type: 'nuclear' },
  { id: 'lon', x: 0.22, y: 0.28, label: 'London', cap: 42, type: 'wind' },
  { id: 'ams', x: 0.32, y: 0.30, label: 'Amsterdam', cap: 18, type: 'gas' },
  { id: 'bru', x: 0.30, y: 0.35, label: 'Brussels', cap: 14, type: 'nuclear' },
  { id: 'ber', x: 0.42, y: 0.30, label: 'Berlin', cap: 45, type: 'wind' },
  { id: 'mun', x: 0.40, y: 0.45, label: 'Munich', cap: 22, type: 'solar' },
  { id: 'zur', x: 0.35, y: 0.48, label: 'Zurich', cap: 16, type: 'hydro' },
  { id: 'rom', x: 0.42, y: 0.62, label: 'Rome', cap: 35, type: 'gas' },
  { id: 'mil', x: 0.38, y: 0.52, label: 'Milan', cap: 24, type: 'gas' },
  { id: 'cop', x: 0.40, y: 0.18, label: 'Copenhagen', cap: 10, type: 'wind' },
  { id: 'sto', x: 0.48, y: 0.10, label: 'Stockholm', cap: 20, type: 'hydro' },
  { id: 'osl', x: 0.38, y: 0.08, label: 'Oslo', cap: 28, type: 'hydro' },
  { id: 'hel', x: 0.58, y: 0.08, label: 'Helsinki', cap: 12, type: 'nuclear' },
  { id: 'war', x: 0.55, y: 0.32, label: 'Warsaw', cap: 25, type: 'coal' },
  { id: 'pra', x: 0.45, y: 0.38, label: 'Prague', cap: 14, type: 'nuclear' },
  { id: 'vie', x: 0.48, y: 0.42, label: 'Vienna', cap: 16, type: 'hydro' },
  { id: 'bud', x: 0.53, y: 0.45, label: 'Budapest', cap: 12, type: 'nuclear' },
  { id: 'buc', x: 0.62, y: 0.50, label: 'Bucharest', cap: 14, type: 'hydro' },
  { id: 'ath', x: 0.58, y: 0.68, label: 'Athens', cap: 10, type: 'solar' },
  { id: 'ist', x: 0.70, y: 0.58, label: 'Istanbul', cap: 32, type: 'gas' },
];

const LINES = [
  ['lis', 'mad'], ['mad', 'par'], ['par', 'lon'], ['par', 'bru'], ['par', 'zur'],
  ['lon', 'ams'], ['ams', 'bru'], ['ams', 'ber'], ['bru', 'par'],
  ['ber', 'cop'], ['ber', 'war'], ['ber', 'pra'], ['ber', 'mun'],
  ['mun', 'zur'], ['mun', 'vie'], ['mun', 'mil'],
  ['zur', 'mil'], ['mil', 'rom'],
  ['vie', 'pra'], ['vie', 'bud'], ['bud', 'buc'], ['bud', 'war'],
  ['rom', 'ath'], ['ath', 'ist'], ['buc', 'ist'],
  ['cop', 'sto'], ['sto', 'osl'], ['sto', 'hel'],
  ['war', 'pra'],
];

const TYPE_COLORS = {
  wind: '#60a5fa',
  solar: '#f59e0b',
  nuclear: '#a78bfa',
  gas: '#fb923c',
  coal: '#94a3b8',
  hydro: '#22d3ee',
};

export default function EUGridMap({ width = 900, height = 500 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    if (slideContext && !slideContext.isSlideActive) {
      tRef.current = 0;
    }

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      if (isActive) tRef.current += 0.016;
      const t = tRef.current;
      const now = performance.now();

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Helper: node position to pixel
      const px = (node) => ({
        x: node.x * width * 0.92 + width * 0.04,
        y: node.y * height * 0.88 + height * 0.06,
      });

      // Draw transmission lines with animated flow
      LINES.forEach(([a, b], li) => {
        const nodeA = NODES.find(n => n.id === a);
        const nodeB = NODES.find(n => n.id === b);
        const pA = px(nodeA);
        const pB = px(nodeB);

        // Line
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.strokeStyle = `${colors.primary}25`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Animated flow dots (2 per line)
        for (let d = 0; d < 2; d++) {
          const flowT = ((now / 3000 + li * 0.15 + d * 0.5) % 1);
          const dotX = pA.x + (pB.x - pA.x) * flowT;
          const dotY = pA.y + (pB.y - pA.y) * flowT;
          const pulse = Math.sin(now / 400 + li) * 0.3 + 0.7;

          ctx.beginPath();
          ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(34, 211, 238, ${0.3 * pulse})`;
          ctx.fill();
        }
      });

      // Draw nodes
      NODES.forEach((node, i) => {
        const p = px(node);
        const pulse = Math.sin(now / 800 + i * 0.7) * 0.15 + 0.85;
        const nodeColor = TYPE_COLORS[node.type];

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8 + node.cap * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = `${nodeColor}08`;
        ctx.fill();

        // Node circle
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4 + node.cap * 0.08, 0, Math.PI * 2);
        ctx.fillStyle = `${nodeColor}${Math.floor(pulse * 60).toString(16).padStart(2, '0')}`;
        ctx.fill();
        ctx.strokeStyle = `${nodeColor}80`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Label
        ctx.fillStyle = `${colors.text}99`;
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, p.x, p.y + 14);
      });

      // Frequency readout (top-right)
      const freq = 50.0 + Math.sin(now / 500) * 0.008;
      ctx.fillStyle = colors.primary;
      ctx.font = 'bold 22px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(`${freq.toFixed(3)} Hz`, width - 16, 28);
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = colors.textDim;
      ctx.fillText('CONTINENTAL EUROPE — SYNCHRONIZED', width - 16, 42);

      // Stats (bottom-left)
      ctx.textAlign = 'left';
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = colors.textDim;
      const stats = [
        `${NODES.length} MAJOR HUBS`,
        `${LINES.length} INTERCONNECTIONS`,
        `${NODES.reduce((s, n) => s + n.cap, 0)} GW CONNECTED`,
      ];
      stats.forEach((s, i) => {
        ctx.fillText(s, 16, height - 36 + i * 14);
      });

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width, height,
      }}
    />
  );
}
