import { useState, useRef, useEffect, useCallback } from 'react';
import FullscreenWrapper from '../../FullscreenWrapper';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

const TECH_NAMES = ['Li-ion', 'Flow', 'Pumped Hydro', 'CAES', 'Gravity', 'Thermal', 'Hydrogen', 'Flywheel'] as const;
type TechName = typeof TECH_NAMES[number];

const AXES = [
  'Response Time',
  'Duration',
  'Efficiency',
  'Capital Cost',
  'Cycle Life',
  'Land Footprint',
  'Maturity',
  'Scalability',
] as const;

const TECH_COLORS: Record<TechName, string> = {
  'Li-ion':       'rgba(239, 68, 68, 0.8)',
  'Flow':         'rgba(168, 85, 247, 0.8)',
  'Pumped Hydro': 'rgba(59, 130, 246, 0.8)',
  'CAES':         'rgba(245, 158, 11, 0.8)',
  'Gravity':      'rgba(34, 197, 94, 0.8)',
  'Thermal':      'rgba(251, 146, 60, 0.8)',
  'Hydrogen':     'rgba(163, 230, 53, 0.8)',
  'Flywheel':     'rgba(34, 211, 238, 0.8)',
};

// Normalized 0-1 data for each tech across 8 axes (today)
// [response, duration, efficiency, cost(lower=better->inverted), cycleLife, footprint(smaller=better->inverted), maturity, scalability]
const DATA_TODAY: Record<TechName, number[]> = {
  'Li-ion':       [0.95, 0.35, 0.92, 0.55, 0.30, 0.75, 0.95, 0.70],
  'Flow':         [0.90, 0.60, 0.75, 0.40, 0.85, 0.50, 0.55, 0.65],
  'Pumped Hydro': [0.40, 0.75, 0.80, 0.85, 0.95, 0.20, 0.95, 0.40],
  'CAES':         [0.20, 0.80, 0.55, 0.80, 0.80, 0.30, 0.50, 0.50],
  'Gravity':      [0.45, 0.55, 0.82, 0.50, 0.85, 0.40, 0.25, 0.45],
  'Thermal':      [0.15, 0.70, 0.65, 0.90, 0.80, 0.55, 0.60, 0.60],
  'Hydrogen':     [0.30, 0.95, 0.35, 0.20, 0.75, 0.60, 0.40, 0.85],
  'Flywheel':     [1.00, 0.10, 0.90, 0.15, 0.95, 0.85, 0.70, 0.30],
};

// 2030 projected improvements
const DATA_2030: Record<TechName, number[]> = {
  'Li-ion':       [0.95, 0.45, 0.94, 0.70, 0.45, 0.80, 0.98, 0.80],
  'Flow':         [0.92, 0.70, 0.82, 0.60, 0.90, 0.55, 0.75, 0.75],
  'Pumped Hydro': [0.45, 0.78, 0.82, 0.88, 0.95, 0.22, 0.95, 0.42],
  'CAES':         [0.25, 0.82, 0.65, 0.85, 0.82, 0.32, 0.65, 0.55],
  'Gravity':      [0.50, 0.60, 0.85, 0.65, 0.88, 0.45, 0.50, 0.55],
  'Thermal':      [0.20, 0.78, 0.75, 0.92, 0.85, 0.60, 0.75, 0.70],
  'Hydrogen':     [0.35, 0.95, 0.45, 0.40, 0.80, 0.65, 0.60, 0.90],
  'Flywheel':     [1.00, 0.15, 0.92, 0.25, 0.95, 0.88, 0.78, 0.35],
};

function drawRadar(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  selected: TechName[],
  projected: boolean,
  colors: CanvasThemeColors
) {
  const monoFont = '"JetBrains Mono", monospace';
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(cx, cy) - 50;
  const axisCount = AXES.length;
  const data = projected ? DATA_2030 : DATA_TODAY;

  ctx.clearRect(0, 0, w, h);

  // Concentric guide octagons
  const guideSteps = [0.25, 0.5, 0.75, 1.0];
  for (const step of guideSteps) {
    ctx.beginPath();
    for (let i = 0; i <= axisCount; i++) {
      const angle = (i % axisCount) * (Math.PI * 2) / axisCount - Math.PI / 2;
      const r = maxR * step;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.4;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // Axis lines and labels
  for (let i = 0; i < axisCount; i++) {
    const angle = i * (Math.PI * 2) / axisCount - Math.PI / 2;
    const x = cx + Math.cos(angle) * maxR;
    const y = cy + Math.sin(angle) * maxR;

    // Axis line
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.5;
    ctx.stroke();
    ctx.globalAlpha = 1;

    // Label
    const labelR = maxR + 18;
    const lx = cx + Math.cos(angle) * labelR;
    const ly = cy + Math.sin(angle) * labelR;
    ctx.font = `12px ${monoFont}`;
    ctx.fillStyle = colors.textMuted;
    ctx.textAlign = Math.abs(Math.cos(angle)) < 0.1 ? 'center' : Math.cos(angle) > 0 ? 'left' : 'right';
    ctx.textBaseline = Math.abs(Math.sin(angle)) < 0.1 ? 'middle' : Math.sin(angle) > 0 ? 'top' : 'bottom';
    ctx.fillText(AXES[i], lx, ly);
  }

  // Draw selected technology polygons
  for (const tech of selected) {
    const values = data[tech];
    const color = TECH_COLORS[tech];

    // Fill polygon
    ctx.beginPath();
    for (let i = 0; i <= axisCount; i++) {
      const idx = i % axisCount;
      const angle = idx * (Math.PI * 2) / axisCount - Math.PI / 2;
      const r = maxR * values[idx];
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = color.replace('0.8', '0.12');
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots at vertices
    for (let i = 0; i < axisCount; i++) {
      const angle = i * (Math.PI * 2) / axisCount - Math.PI / 2;
      const r = maxR * values[i];
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'start';
}

export default function StorageComparisonTool() {
  const [selected, setSelected] = useState<TechName[]>(['Li-ion', 'Pumped Hydro']);
  const [projected, setProjected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorsRef = useRef<CanvasThemeColors | null>(null);

  const toggleTech = useCallback((tech: TechName) => {
    setSelected((prev) => {
      if (prev.includes(tech)) {
        return prev.filter((t) => t !== tech);
      }
      if (prev.length >= 3) return prev;
      return [...prev, tech];
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    colorsRef.current = getCanvasThemeColors();

    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = Math.max(320, Math.min(500, rect.width * 0.7));
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    drawRadar(ctx, w, h, selected, projected, colorsRef.current);

    return () => {};
  }, [selected, projected]);

  // Redraw on resize
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      colorsRef.current = getCanvasThemeColors();
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = parent.getBoundingClientRect();
      const w = rect.width;
      const h = Math.max(320, Math.min(500, rect.width * 0.7));
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(dpr, dpr);
      drawRadar(ctx, w, h, selected, projected, colorsRef.current);
    }
    window.addEventListener('resize', handleResize);

    // Watch for theme changes
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const themeUpdate = () => {
      colorsRef.current = getCanvasThemeColors();
      handleResize();
    };
    mql.addEventListener('change', themeUpdate);
    const observer = new MutationObserver(themeUpdate);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      window.removeEventListener('resize', handleResize);
      mql.removeEventListener('change', themeUpdate);
      observer.disconnect();
    };
  }, [selected, projected]);

  return (
    <FullscreenWrapper label="Storage Comparison Tool">
      <div className="rounded-lg p-4 md:p-6 h-full flex flex-col" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}>
        {/* Technology toggles */}
        <div className="flex flex-wrap gap-2 mb-4">
          {TECH_NAMES.map((tech) => {
            const isSelected = selected.includes(tech);
            const color = TECH_COLORS[tech];
            const atMax = selected.length >= 3 && !isSelected;
            return (
              <button
                key={tech}
                onClick={() => toggleTech(tech)}
                disabled={atMax}
                className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors"
                style={{
                  background: isSelected ? color.replace('0.8', '0.2') : 'var(--color-bg-alt)',
                  color: isSelected ? color.replace('0.8', '1') : atMax ? 'var(--color-text-dim)' : 'var(--color-text-muted)',
                  border: `1px solid ${isSelected ? color : 'var(--color-surface-light)'}`,
                  opacity: atMax ? 0.5 : 1,
                  cursor: atMax ? 'not-allowed' : 'pointer',
                }}
              >
                {tech}
              </button>
            );
          })}
          <span className="text-xs font-mono self-center ml-2" style={{ color: 'var(--color-text-dim)' }}>
            (max 3)
          </span>
        </div>

        {/* Today / 2030 toggle */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setProjected(false)}
            className="px-3 py-1 rounded text-xs font-mono cursor-pointer transition-colors"
            style={{
              background: !projected ? 'var(--color-primary)' : 'var(--color-bg-alt)',
              color: !projected ? 'var(--color-bg)' : 'var(--color-text-muted)',
              border: `1px solid ${!projected ? 'var(--color-primary)' : 'var(--color-surface-light)'}`,
            }}
          >
            Today
          </button>
          <button
            onClick={() => setProjected(true)}
            className="px-3 py-1 rounded text-xs font-mono cursor-pointer transition-colors"
            style={{
              background: projected ? 'var(--color-primary)' : 'var(--color-bg-alt)',
              color: projected ? 'var(--color-bg)' : 'var(--color-text-muted)',
              border: `1px solid ${projected ? 'var(--color-primary)' : 'var(--color-surface-light)'}`,
            }}
          >
            2030 Projected
          </button>
        </div>

        {/* Radar chart canvas */}
        <div className="w-full flex-1">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Radar chart comparing storage technologies"
            className="w-full rounded"
            style={{ background: 'var(--color-bg)' }}
          />
        </div>

        {/* Legend */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-4">
            {selected.map((tech) => (
              <div key={tech} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: TECH_COLORS[tech] }}
                />
                <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
                  {tech}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </FullscreenWrapper>
  );
}
