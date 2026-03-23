import { useEffect, useRef, useState, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  type: 'ion' | 'electron';
  progress: number;
}

export default function CellCrossSectionWidget() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'charging' | 'discharging'>('discharging');
  const modeRef = useRef(mode);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());

  useEffect(() => { modeRef.current = mode; }, [mode]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => { colorsRef.current = getCanvasThemeColors(); };
    mql.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mql.removeEventListener('change', update); observer.disconnect(); };
  }, []);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 300;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    // Spawn particles periodically
    let spawnTimer = 0;

    function spawnParticle(w: number, h: number) {
      const isCharging = modeRef.current === 'charging';

      // Ion: moves through electrolyte (center)
      const ion: Particle = {
        x: isCharging ? w * 0.7 : w * 0.3,
        y: h * 0.35 + Math.random() * h * 0.3,
        vx: 0, vy: 0,
        type: 'ion',
        progress: 0,
      };

      // Electron: moves through external circuit (top)
      const electron: Particle = {
        x: isCharging ? w * 0.3 : w * 0.7,
        y: h * 0.12,
        vx: 0, vy: 0,
        type: 'electron',
        progress: 0,
      };

      particlesRef.current.push(ion, electron);
    }

    function draw() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!ctx || !canvas) { rafRef.current = requestAnimationFrame(draw); return; }

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      const c = colorsRef.current;
      const isCharging = modeRef.current === 'charging';

      ctx.clearRect(0, 0, w, h);

      // Layout
      const anodeX = w * 0.12;
      const anodeW = w * 0.22;
      const cathodeX = w * 0.66;
      const cathodeW = w * 0.22;
      const electrolyteX = w * 0.36;
      const electrolyteW = w * 0.28;
      const cellTop = h * 0.2;
      const cellH = h * 0.65;

      // Background regions
      // Anode (graphite)
      ctx.fillStyle = 'rgba(100, 116, 139, 0.15)';
      ctx.fillRect(anodeX, cellTop, anodeW, cellH);
      ctx.strokeStyle = c.textDim;
      ctx.lineWidth = 1;
      ctx.strokeRect(anodeX, cellTop, anodeW, cellH);

      // Electrolyte
      ctx.fillStyle = 'rgba(34, 211, 238, 0.06)';
      ctx.fillRect(electrolyteX, cellTop, electrolyteW, cellH);
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
      ctx.strokeRect(electrolyteX, cellTop, electrolyteW, cellH);

      // Cathode (metal oxide)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
      ctx.fillRect(cathodeX, cellTop, cathodeW, cellH);
      ctx.strokeStyle = c.accent;
      ctx.globalAlpha = 0.4;
      ctx.strokeRect(cathodeX, cellTop, cathodeW, cellH);
      ctx.globalAlpha = 1;

      // Labels
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';

      ctx.fillStyle = c.textMuted;
      ctx.fillText('ANODE', anodeX + anodeW / 2, cellTop + cellH + 18);
      ctx.fillText('(Graphite)', anodeX + anodeW / 2, cellTop + cellH + 32);

      ctx.fillStyle = c.primary;
      ctx.globalAlpha = 0.6;
      ctx.fillText('ELECTROLYTE', electrolyteX + electrolyteW / 2, cellTop + cellH + 18);
      ctx.globalAlpha = 1;

      ctx.fillStyle = c.accent;
      ctx.globalAlpha = 0.8;
      ctx.fillText('CATHODE', cathodeX + cathodeW / 2, cellTop + cellH + 18);
      ctx.fillText('(Metal Oxide)', cathodeX + cathodeW / 2, cellTop + cellH + 32);
      ctx.globalAlpha = 1;

      // External circuit (top)
      ctx.beginPath();
      ctx.moveTo(anodeX + anodeW / 2, cellTop);
      ctx.lineTo(anodeX + anodeW / 2, cellTop - 30);
      ctx.lineTo(cathodeX + cathodeW / 2, cellTop - 30);
      ctx.lineTo(cathodeX + cathodeW / 2, cellTop);
      ctx.strokeStyle = c.textDim;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Circuit label
      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textDim;
      ctx.fillText('EXTERNAL CIRCUIT', w / 2, cellTop - 36);

      // Lightbulb or power source icon (center of circuit)
      const bulbX = w / 2;
      const bulbY = cellTop - 30;
      if (isCharging) {
        // Power source: small rectangle with +/-
        ctx.strokeStyle = c.success;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(bulbX - 12, bulbY - 8, 24, 16);
        ctx.font = 'bold 14px "JetBrains Mono", monospace';
        ctx.fillStyle = c.success;
        ctx.fillText('PWR', bulbX, bulbY + 4);
      } else {
        // Lightbulb
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 8, 0, Math.PI * 2);
        ctx.strokeStyle = c.accent;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Glow
        ctx.beginPath();
        ctx.arc(bulbX, bulbY, 5, 0, Math.PI * 2);
        ctx.fillStyle = c.accent;
        ctx.globalAlpha = 0.5;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Ion direction arrow in electrolyte
      const ionDir = isCharging ? -1 : 1;
      const arrowY = cellTop + cellH / 2;
      const arrowStartX = isCharging ? electrolyteX + electrolyteW - 10 : electrolyteX + 10;
      const arrowEndX = isCharging ? electrolyteX + 10 : electrolyteX + electrolyteW - 10;

      ctx.beginPath();
      ctx.moveTo(arrowStartX, arrowY);
      ctx.lineTo(arrowEndX, arrowY);
      ctx.strokeStyle = c.primary;
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = 1;
      ctx.stroke();
      // Arrowhead
      const headLen = 6;
      const angle = Math.atan2(0, arrowEndX - arrowStartX);
      ctx.beginPath();
      ctx.moveTo(arrowEndX, arrowY);
      ctx.lineTo(arrowEndX - headLen * Math.cos(angle - 0.5), arrowY - headLen * Math.sin(angle - 0.5));
      ctx.moveTo(arrowEndX, arrowY);
      ctx.lineTo(arrowEndX - headLen * Math.cos(angle + 0.5), arrowY - headLen * Math.sin(angle + 0.5));
      ctx.stroke();
      ctx.globalAlpha = 1;

      ctx.font = '14px "JetBrains Mono", monospace';
      ctx.fillStyle = c.primary;
      ctx.globalAlpha = 0.5;
      ctx.fillText('Li+', electrolyteX + electrolyteW / 2, arrowY - 8);
      ctx.globalAlpha = 1;

      // Spawn particles
      spawnTimer++;
      if (spawnTimer % 20 === 0) {
        spawnParticle(w, h);
      }

      // Update and draw particles
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += 0.008;

        if (p.progress > 1) {
          particles.splice(i, 1);
          continue;
        }

        const t = p.progress;

        if (p.type === 'ion') {
          // Move through electrolyte
          const startX = isCharging ? cathodeX + cathodeW / 2 : anodeX + anodeW / 2;
          const endX = isCharging ? anodeX + anodeW / 2 : cathodeX + cathodeW / 2;
          p.x = startX + (endX - startX) * t;
          p.y = cellTop + cellH * 0.3 + Math.sin(t * Math.PI * 3) * 8 + cellH * 0.2;

          // Draw ion
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = c.primary;
          ctx.globalAlpha = 0.8 * (1 - t * 0.5);
          ctx.fill();
          ctx.globalAlpha = 1;
        } else {
          // Electron moves through external circuit
          const leftX = anodeX + anodeW / 2;
          const rightX = cathodeX + cathodeW / 2;
          const topY = cellTop - 30;
          const startX = isCharging ? leftX : rightX;
          const endX = isCharging ? rightX : leftX;

          // Three segments: up, across, down
          if (t < 0.2) {
            p.x = startX;
            p.y = cellTop - (t / 0.2) * 30;
          } else if (t < 0.8) {
            const segT = (t - 0.2) / 0.6;
            p.x = startX + (endX - startX) * segT;
            p.y = topY;
          } else {
            const segT = (t - 0.8) / 0.2;
            p.x = endX;
            p.y = topY + segT * 30;
          }

          // Draw electron
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = c.accent;
          ctx.globalAlpha = 0.9 * (1 - t * 0.3);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Mode label
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = isCharging ? c.success : c.accent;
      ctx.fillText(isCharging ? 'CHARGING' : 'DISCHARGING', 12, 20);

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', sizeCanvas);
    };
  }, [sizeCanvas]);

  return (
    <div ref={containerRef} className="w-full">
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setMode('discharging')}
          className="font-mono text-xs px-3 py-1.5 rounded transition-colors"
          style={{
            background: mode === 'discharging' ? 'rgba(245, 158, 11, 0.15)' : 'var(--color-surface)',
            color: mode === 'discharging' ? 'var(--color-accent)' : 'var(--color-text-dim)',
            border: `1px solid ${mode === 'discharging' ? 'rgba(245, 158, 11, 0.3)' : 'var(--color-surface-light)'}`,
          }}
        >
          Discharging
        </button>
        <button
          onClick={() => setMode('charging')}
          className="font-mono text-xs px-3 py-1.5 rounded transition-colors"
          style={{
            background: mode === 'charging' ? 'rgba(16, 185, 129, 0.15)' : 'var(--color-surface)',
            color: mode === 'charging' ? 'var(--color-success)' : 'var(--color-text-dim)',
            border: `1px solid ${mode === 'charging' ? 'rgba(16, 185, 129, 0.3)' : 'var(--color-surface-light)'}`,
          }}
        >
          Charging
        </button>
        <span
          className="font-mono text-xs px-2 py-0.5 rounded"
          style={{
            background: 'rgba(34, 211, 238, 0.1)',
            color: 'var(--color-primary)',
            border: '1px solid rgba(34, 211, 238, 0.2)',
          }}
        >
          Interactive
        </span>
      </div>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Li-ion cell cross-section diagram showing ${mode} mode`}
        style={{ width: '100%', height: 300 }}
      />
    </div>
  );
}
