import { useEffect, useRef, useState, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';
import FullscreenWrapper from '../../FullscreenWrapper';

const EU_DEMAND_GW = 300;
const MOSS_LANDING_GWH = 3;
const PUMPED_HYDRO_GWH = 9000;

// Marker thresholds: how many Moss Landings for these durations
const MARKERS = [
  { label: '1 min', seconds: 60 },
  { label: '1 hour', seconds: 3600 },
  { label: '1 day', seconds: 86400 },
];

function formatDuration(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} ms`;
  if (seconds < 60) return `${seconds.toFixed(1)} seconds`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutes`;
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} hours`;
  return `${(seconds / 86400).toFixed(1)} days`;
}

function countNeeded(durationSeconds: number): number {
  const energyNeeded = (EU_DEMAND_GW * durationSeconds) / 3600; // GWh
  return Math.ceil(energyNeeded / MOSS_LANDING_GWH);
}

export default function StorageScaleVisualizer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const [stacks, setStacks] = useState(1);
  const [mode, setMode] = useState<'battery' | 'hydro'>('battery');
  const rafRef = useRef(0);

  useEffect(() => {
    const update = () => { colorsRef.current = getCanvasThemeColors(); };
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    mql.addEventListener('change', update);
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mql.removeEventListener('change', update); obs.disconnect(); };
  }, []);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };
    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const c = colorsRef.current;
      const padX = 20;
      const padY = 16;

      // ── Demand bar (full width reference) ──
      const barY = padY;
      const barH = 32;
      const barW = w - padX * 2;

      ctx.fillStyle = c.surface;
      ctx.beginPath();
      ctx.roundRect(padX, barY, barW, barH, 4);
      ctx.fill();

      // Fill representing demand
      ctx.fillStyle = c.danger;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.roundRect(padX + 2, barY + 2, barW - 4, barH - 4, 3);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.font = '600 12px "JetBrains Mono", monospace';
      ctx.fillStyle = c.text;
      ctx.textAlign = 'center';
      ctx.fillText(`EU Grid Demand: ${EU_DEMAND_GW} GW`, w / 2, barY + barH / 2 + 4);

      // ── Storage comparison ──
      const storageY = barY + barH + 24;

      if (mode === 'battery') {
        // Total energy from stacked batteries
        const totalGWh = stacks * MOSS_LANDING_GWH;
        const durationSec = (totalGWh / EU_DEMAND_GW) * 3600;

        // Battery bar: scale relative to demand bar
        // 1 day of demand = 300 * 24 = 7200 GWh. Scale bar to that.
        const fullScaleGWh = EU_DEMAND_GW * 24; // 7200 GWh for visual reference
        const battFrac = Math.min(1, totalGWh / fullScaleGWh);
        const battBarW = Math.max(2, (barW - 4) * battFrac);

        ctx.fillStyle = c.surface;
        ctx.beginPath();
        ctx.roundRect(padX, storageY, barW, barH, 4);
        ctx.fill();

        ctx.fillStyle = c.success;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.roundRect(padX + 2, storageY + 2, battBarW, barH - 4, 3);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Battery icon(s) -- draw small battery icons inside bar
        const iconSize = 14;
        const maxIcons = Math.min(stacks, Math.floor((barW - 8) / (iconSize + 2)));
        for (let i = 0; i < maxIcons; i++) {
          const ix = padX + 6 + i * (iconSize + 2);
          const iy = storageY + (barH - iconSize) / 2;
          // Battery body
          ctx.strokeStyle = c.success;
          ctx.lineWidth = 1;
          ctx.strokeRect(ix, iy + 2, iconSize - 2, iconSize - 4);
          // Battery terminal
          ctx.fillStyle = c.success;
          ctx.fillRect(ix + iconSize - 2, iy + 4, 2, iconSize - 8);
        }
        if (stacks > maxIcons) {
          ctx.font = '500 12px "JetBrains Mono", monospace';
          ctx.fillStyle = c.textMuted;
          ctx.textAlign = 'right';
          ctx.fillText(`+${stacks - maxIcons} more`, padX + barW - 4, storageY + barH / 2 + 3);
        }

        // Label
        ctx.font = '500 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.textMuted;
        ctx.textAlign = 'left';
        ctx.fillText(`${stacks}x Moss Landing (${totalGWh} GWh)`, padX, storageY - 4);

        // Duration result
        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.fillStyle = c.primary;
        ctx.textAlign = 'center';
        ctx.fillText(`Powers EU grid for: ${formatDuration(durationSec)}`, w / 2, storageY + barH + 24);

        // Markers
        const markerY = storageY + barH + 44;
        ctx.font = '400 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.textDim;
        ctx.textAlign = 'left';
        for (let i = 0; i < MARKERS.length; i++) {
          const m = MARKERS[i];
          const needed = countNeeded(m.seconds);
          const my = markerY + i * 16;
          ctx.fillStyle = c.textDim;
          ctx.fillText(`${m.label}: ${needed.toLocaleString()} Moss Landings needed`, padX + 8, my);
        }
      } else {
        // Pumped hydro mode
        const durationSec = (PUMPED_HYDRO_GWH / EU_DEMAND_GW) * 3600;
        const fullScaleGWh = EU_DEMAND_GW * 48;
        const hydroFrac = Math.min(1, PUMPED_HYDRO_GWH / fullScaleGWh);
        const hydroBarW = Math.max(4, (barW - 4) * hydroFrac);

        ctx.fillStyle = c.surface;
        ctx.beginPath();
        ctx.roundRect(padX, storageY, barW, barH, 4);
        ctx.fill();

        ctx.fillStyle = c.primary;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.roundRect(padX + 2, storageY + 2, hydroBarW, barH - 4, 3);
        ctx.fill();
        ctx.globalAlpha = 1;

        ctx.font = '500 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.textMuted;
        ctx.textAlign = 'left';
        ctx.fillText(`Global Pumped Hydro: ${PUMPED_HYDRO_GWH.toLocaleString()} GWh`, padX, storageY - 4);

        ctx.font = '700 16px "JetBrains Mono", monospace';
        ctx.fillStyle = c.primary;
        ctx.textAlign = 'center';
        ctx.fillText(`Powers EU grid for: ${formatDuration(durationSec)}`, w / 2, storageY + barH + 24);

        ctx.font = '400 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.textDim;
        ctx.textAlign = 'left';
        ctx.fillText('All pumped hydro on Earth combined.', padX + 8, storageY + barH + 44);
        ctx.fillText(`That is only ~${(durationSec / 3600).toFixed(0)} hours of backup.`, padX + 8, storageY + barH + 60);
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [stacks, mode]);

  const addStack = useCallback(() => {
    setStacks((s) => {
      // Jump to meaningful milestones
      if (s < 10) return s + 1;
      if (s < 100) return s + 10;
      if (s < 1000) return s + 100;
      return s + 1000;
    });
  }, []);

  return (
    <FullscreenWrapper label="Storage Scale">
      <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)', borderRadius: 8 }}>
        {/* Canvas */}
        <div className="relative w-full" style={{ height: 280 }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 flex-wrap" style={{ borderTop: '1px solid var(--color-surface-light)' }}>
          <div className="flex items-center gap-2">
            {mode === 'battery' && (
              <>
                <button
                  onClick={addStack}
                  className="px-3 py-1.5 rounded text-xs font-mono font-semibold tracking-wide cursor-pointer"
                  style={{
                    background: 'var(--color-success)',
                    color: '#fff',
                    border: 'none',
                  }}
                >
                  + STACK
                </button>
                <button
                  onClick={() => setStacks(1)}
                  className="px-3 py-1.5 rounded text-xs font-mono tracking-wide cursor-pointer"
                  style={{
                    background: 'var(--color-surface)',
                    color: 'var(--color-text-muted)',
                    border: '1px solid var(--color-surface-light)',
                  }}
                >
                  RESET
                </button>
                <span className="text-xs font-mono ml-2" style={{ color: 'var(--color-text-dim)' }}>
                  {stacks.toLocaleString()}x batteries
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => { setMode('battery'); setStacks(1); }}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold tracking-wide cursor-pointer"
              style={{
                background: mode === 'battery' ? 'var(--color-success)' : 'var(--color-surface)',
                color: mode === 'battery' ? '#fff' : 'var(--color-text-dim)',
                border: '1px solid var(--color-surface-light)',
              }}
            >
              Li-Ion
            </button>
            <button
              onClick={() => setMode('hydro')}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold tracking-wide cursor-pointer"
              style={{
                background: mode === 'hydro' ? 'var(--color-primary)' : 'var(--color-surface)',
                color: mode === 'hydro' ? '#fff' : 'var(--color-text-dim)',
                border: '1px solid var(--color-surface-light)',
              }}
            >
              Pumped Hydro
            </button>
          </div>
        </div>

        {/* Callout */}
        <div className="px-4 pb-4">
          <p className="text-sm font-mono" style={{ color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
            This is why VPPs matter -- instead of one giant battery, coordinate millions of small ones.{' '}
            <a href="#" className="underline" style={{ color: 'var(--color-primary)' }}>
              Learn about alternatives
            </a>
          </p>
        </div>
      </div>
    </FullscreenWrapper>
  );
}
