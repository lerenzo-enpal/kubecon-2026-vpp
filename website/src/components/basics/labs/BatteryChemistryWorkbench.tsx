import { useState, useRef, useEffect, useCallback } from 'react';
import FullscreenWrapper from '../../FullscreenWrapper';
import { getCanvasThemeColors } from '../shared/canvasTheme';

type Chemistry = 'LFP' | 'NMC' | 'NCA' | 'LTO';

const axes = ['Energy density', 'Cycle life', 'Safety', 'Cost', 'Charge speed', 'Temp tolerance'];

const chemData: Record<Chemistry, number[]> = {
  LFP: [0.4, 0.85, 0.95, 0.8, 0.5, 0.7],
  NMC: [0.8, 0.6, 0.6, 0.5, 0.7, 0.6],
  NCA: [0.95, 0.5, 0.4, 0.4, 0.7, 0.5],
  LTO: [0.3, 1.0, 0.9, 0.2, 0.95, 0.9],
};

const useCases: Record<Chemistry, string> = {
  LFP: 'Grid storage, home batteries, buses. Long life, safe, affordable.',
  NMC: 'Most EVs (Tesla Model 3 LR, BMW). Balanced performance.',
  NCA: 'High-performance EVs (Tesla Model S/X). Maximum range.',
  LTO: 'Fast-charging stations, frequency regulation. Extreme cycle life.',
};

const chemColors: Record<Chemistry, string> = {
  LFP: '#10b981',
  NMC: '#22d3ee',
  NCA: '#f59e0b',
  LTO: '#a78bfa',
};

export default function BatteryChemistryWorkbench() {
  const [selected, setSelected] = useState<Chemistry>('LFP');
  const [compare, setCompare] = useState<Chemistry | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const cw = rect.width;
    const ch = Math.min(rect.height, 420);
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    ctx.scale(dpr, dpr);

    const colors = getCanvasThemeColors();
    const font = '"JetBrains Mono", monospace';
    const cx = cw / 2;
    const cy = ch / 2;
    const radius = Math.min(cw, ch) * 0.32;
    const numAxes = axes.length;

    function angleFor(i: number) {
      return (Math.PI * 2 * i) / numAxes - Math.PI / 2;
    }

    // Guide polygons
    const levels = [0.25, 0.5, 0.75, 1.0];
    for (const level of levels) {
      ctx.beginPath();
      for (let i = 0; i <= numAxes; i++) {
        const a = angleFor(i % numAxes);
        const x = cx + Math.cos(a) * radius * level;
        const y = cy + Math.sin(a) * radius * level;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `${colors.surfaceLight}88`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis lines and labels
    for (let i = 0; i < numAxes; i++) {
      const a = angleFor(i);
      const x = cx + Math.cos(a) * radius;
      const y = cy + Math.sin(a) * radius;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.strokeStyle = colors.surfaceLight;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      const lx = cx + Math.cos(a) * (radius + 20);
      const ly = cy + Math.sin(a) * (radius + 20);
      ctx.fillStyle = colors.textMuted;
      ctx.font = `10px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axes[i], lx, ly);
    }

    // Draw filled polygon for a chemistry
    function drawPoly(chem: Chemistry, alpha: number) {
      const vals = chemData[chem];
      const color = chemColors[chem];

      ctx.beginPath();
      for (let i = 0; i <= numAxes; i++) {
        const idx = i % numAxes;
        const a = angleFor(idx);
        const v = vals[idx];
        const x = cx + Math.cos(a) * radius * v;
        const y = cy + Math.sin(a) * radius * v;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill
      ctx.fillStyle = color + Math.round(alpha * 0.3 * 255).toString(16).padStart(2, '0');
      ctx.fill();

      // Stroke
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = alpha;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // Dots
      for (let i = 0; i < numAxes; i++) {
        const a = angleFor(i);
        const v = vals[i];
        const x = cx + Math.cos(a) * radius * v;
        const y = cy + Math.sin(a) * radius * v;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Draw compare first (if any) then selected on top
    if (compare && compare !== selected) {
      drawPoly(compare, 0.4);
    }
    drawPoly(selected, 1);
  }, [selected, compare]);

  useEffect(() => {
    draw();
    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animRef.current);
    };
  }, [draw]);

  function handleClick(chem: Chemistry) {
    if (chem === selected) return;
    if (compare === null) {
      // First click: just select
      setSelected(chem);
    } else {
      setSelected(chem);
    }
  }

  function toggleCompare(chem: Chemistry) {
    if (compare === chem) {
      setCompare(null);
    } else {
      setCompare(chem);
    }
  }

  const allChems: Chemistry[] = ['LFP', 'NMC', 'NCA', 'LTO'];

  return (
    <FullscreenWrapper label="Fullscreen">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex gap-2">
            {allChems.map((chem) => (
              <button
                key={chem}
                onClick={() => handleClick(chem)}
                className="font-mono text-xs px-3 py-1.5 rounded transition-colors"
                style={{
                  background: selected === chem ? `${chemColors[chem]}22` : 'var(--color-surface)',
                  color: selected === chem ? chemColors[chem] : 'var(--color-text-dim)',
                  border: `1px solid ${selected === chem ? chemColors[chem] : 'var(--color-surface-light)'}`,
                }}
              >
                {chem}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>Compare:</span>
            {allChems.filter(c => c !== selected).map((chem) => (
              <button
                key={`cmp-${chem}`}
                onClick={() => toggleCompare(chem)}
                className="font-mono text-xs px-2 py-1 rounded transition-colors"
                style={{
                  background: compare === chem ? `${chemColors[chem]}22` : 'transparent',
                  color: compare === chem ? chemColors[chem] : 'var(--color-text-dim)',
                  border: `1px solid ${compare === chem ? `${chemColors[chem]}66` : 'var(--color-surface-light)'}`,
                }}
              >
                {chem}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width: '100%', height: 380 }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>

        <div className="p-3 rounded-lg" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-sm font-bold" style={{ color: chemColors[selected] }}>{selected}</span>
            {compare && (
              <>
                <span className="font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>vs</span>
                <span className="font-mono text-sm font-bold" style={{ color: chemColors[compare] }}>{compare}</span>
              </>
            )}
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)', margin: 0 }}>
            {useCases[selected]}
          </p>
          {compare && compare !== selected && (
            <p className="text-sm mt-2" style={{ color: 'var(--color-text-muted)', margin: 0, marginTop: 8 }}>
              {useCases[compare]}
            </p>
          )}
        </div>
      </div>
    </FullscreenWrapper>
  );
}
