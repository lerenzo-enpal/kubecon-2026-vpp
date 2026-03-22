import { useState, useRef, useEffect, useCallback } from 'react';
import FullscreenWrapper from '../../FullscreenWrapper';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

interface Device {
  label: string;
  power: number; // watts
}

const DEVICES: Device[] = [
  { label: 'LED bulb', power: 10 },
  { label: 'Laptop', power: 65 },
  { label: 'House (avg)', power: 3500 },
  { label: 'EV charger', power: 11000 },
  { label: 'Data center', power: 50_000_000 },
  { label: 'City of Berlin', power: 2_000_000_000 },
];

function formatPower(watts: number): string {
  if (watts >= 1e9) return `${(watts / 1e9).toFixed(1)} GW`;
  if (watts >= 1e6) return `${(watts / 1e6).toFixed(1)} MW`;
  if (watts >= 1e3) return `${(watts / 1e3).toFixed(1)} kW`;
  return `${watts.toFixed(0)} W`;
}

function formatEnergy(wh: number): string {
  if (wh >= 1e12) return `${(wh / 1e12).toFixed(2)} TWh`;
  if (wh >= 1e9) return `${(wh / 1e9).toFixed(2)} GWh`;
  if (wh >= 1e6) return `${(wh / 1e6).toFixed(2)} MWh`;
  if (wh >= 1e3) return `${(wh / 1e3).toFixed(2)} kWh`;
  return `${wh.toFixed(1)} Wh`;
}

function drawTank(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tankW: number,
  tankH: number,
  fillLevel: number, // 0-1
  energy: number,
  label: string,
  colors: CanvasThemeColors,
  time: number,
  isActive: boolean
) {
  const monoFont = '"JetBrains Mono", monospace';
  const r = 6;

  // Tank outline
  ctx.strokeStyle = isActive ? colors.primary : colors.textDim;
  ctx.lineWidth = isActive ? 2 : 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, tankW, tankH, r);
  ctx.stroke();

  // Fill
  const fill = Math.max(0, Math.min(1, fillLevel));
  const fillH = fill * (tankH - 4);
  if (fillH > 0) {
    const grad = ctx.createLinearGradient(x, y + tankH, x, y + tankH - fillH);
    grad.addColorStop(0, isActive ? colors.primary : colors.textDim);
    grad.addColorStop(1, `${isActive ? colors.primary : colors.textDim}66`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect(x + 2, y + tankH - fillH - 2, tankW - 4, fillH, Math.min(r - 1, fillH / 2));
    ctx.fill();

    // Bubbles
    if (fill > 0.05 && isActive) {
      const bubbleCount = 4;
      for (let i = 0; i < bubbleCount; i++) {
        const bx = x + 8 + ((i * 17 + Math.sin(time * 0.001 + i) * 5) % (tankW - 16));
        const by = y + tankH - 6 - ((time * 0.02 + i * 30) % fillH);
        const br = 2 + Math.sin(time * 0.003 + i * 2) * 1;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.fillStyle = `${colors.primary}44`;
        ctx.fill();
      }
    }
  }

  // Battery terminals on top
  const termW = 16;
  const termH = 6;
  ctx.fillStyle = colors.textDim;
  ctx.fillRect(x + tankW / 2 - termW / 2, y - termH, termW, termH);

  // Energy readout above
  ctx.font = `bold 13px ${monoFont}`;
  ctx.fillStyle = isActive ? colors.primary : colors.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText(formatEnergy(energy), x + tankW / 2, y - termH - 12);

  // Device label below
  ctx.font = `11px ${monoFont}`;
  ctx.fillStyle = isActive ? colors.text : colors.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText(label, x + tankW / 2, y + tankH + 16);
}

export default function PowerEnergyCalculator() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [compareIdx, setCompareIdx] = useState<number | null>(null);
  const [hours, setHours] = useState(1);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const colorsRef = useRef<CanvasThemeColors | null>(null);

  const device = DEVICES[selectedIdx];
  const compareDevice = compareIdx !== null ? DEVICES[compareIdx] : null;
  const energy1 = device.power * hours;
  const energy2 = compareDevice ? compareDevice.power * hours : 0;
  const maxEnergy = Math.max(energy1, energy2 || energy1) || 1;

  const handleDeviceClick = useCallback((idx: number) => {
    if (idx === selectedIdx) return;
    if (compareIdx === null) {
      // If nothing in compare slot yet, put previous selection there or just switch
      setCompareIdx(selectedIdx);
      setSelectedIdx(idx);
    } else if (idx === compareIdx) {
      // Clicking compare device removes comparison
      setCompareIdx(null);
    } else {
      setSelectedIdx(idx);
    }
  }, [selectedIdx, compareIdx]);

  const clearCompare = useCallback(() => {
    setCompareIdx(null);
  }, []);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    colorsRef.current = getCanvasThemeColors();

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !colorsRef.current) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      const w = rect.width;
      const h = rect.height;
      const time = Date.now();
      const colors = colorsRef.current;

      ctx.clearRect(0, 0, w, h);

      const tankW = 80;
      const tankH = h - 80;
      const topPad = 40;

      if (compareDevice) {
        // Two tanks side by side
        const gap = 60;
        const totalW = tankW * 2 + gap;
        const startX = (w - totalW) / 2;

        drawTank(ctx, startX, topPad, tankW, tankH, energy1 / maxEnergy, energy1, device.label, colors, time, true);
        drawTank(ctx, startX + tankW + gap, topPad, tankW, tankH, energy2 / maxEnergy, energy2, compareDevice.label, colors, time, true);

        // "vs" label
        ctx.font = `10px "JetBrains Mono", monospace`;
        ctx.fillStyle = colors.textDim;
        ctx.textAlign = 'center';
        ctx.fillText('vs', startX + tankW + gap / 2, topPad + tankH / 2);
      } else {
        // Single tank centered
        const startX = (w - tankW) / 2;
        drawTank(ctx, startX, topPad, tankW, tankH, 1, energy1, device.label, colors, time, true);
      }

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [device, compareDevice, energy1, energy2, maxEnergy, hours]);

  return (
    <FullscreenWrapper label="Power vs Energy">
      <div className="rounded-lg p-4 md:p-6 h-full flex flex-col" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-surface-light)' }}>
        {/* Device selector */}
        <div className="flex flex-wrap gap-2 mb-4">
          {DEVICES.map((d, idx) => {
            const isSelected = idx === selectedIdx;
            const isCompare = idx === compareIdx;
            return (
              <button
                key={d.label}
                onClick={() => handleDeviceClick(idx)}
                className="px-3 py-1.5 rounded text-xs font-mono cursor-pointer transition-colors"
                style={{
                  background: isSelected ? 'var(--color-primary)' : isCompare ? 'var(--color-surface-light)' : 'var(--color-bg-alt)',
                  color: isSelected ? 'var(--color-bg)' : isCompare ? 'var(--color-primary)' : 'var(--color-text-muted)',
                  border: `1px solid ${isSelected ? 'var(--color-primary)' : isCompare ? 'var(--color-primary)' : 'var(--color-surface-light)'}`,
                }}
              >
                {d.label} ({formatPower(d.power)})
              </button>
            );
          })}
          {compareIdx !== null && (
            <button
              onClick={clearCompare}
              className="px-2 py-1.5 rounded text-xs font-mono cursor-pointer"
              style={{
                background: 'transparent',
                color: 'var(--color-text-dim)',
                border: '1px solid var(--color-surface-light)',
              }}
            >
              Clear compare
            </button>
          )}
        </div>

        {/* Power display */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>Power:</span>
          <span className="font-mono text-lg" style={{ color: 'var(--color-primary)' }}>
            {formatPower(device.power)}
          </span>
          {compareDevice && (
            <>
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>vs</span>
              <span className="font-mono text-lg" style={{ color: 'var(--color-primary)' }}>
                {formatPower(compareDevice.power)}
              </span>
            </>
          )}
        </div>

        {/* Time slider */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
              Time
            </label>
            <span className="font-mono text-sm" style={{ color: 'var(--color-text)' }}>
              {hours.toFixed(1)} hours
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={24}
            step={0.1}
            value={hours}
            onChange={(e) => setHours(parseFloat(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--color-primary)' }}
          />
        </div>

        {/* Energy readout */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>Energy:</span>
          <span className="font-mono text-lg" style={{ color: 'var(--color-primary)' }}>
            {formatEnergy(energy1)}
          </span>
          {compareDevice && (
            <>
              <span className="text-xs font-mono" style={{ color: 'var(--color-text-dim)' }}>vs</span>
              <span className="font-mono text-lg" style={{ color: 'var(--color-primary)' }}>
                {formatEnergy(energy2)}
              </span>
            </>
          )}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full rounded flex-1"
          style={{ minHeight: 240, background: 'var(--color-bg)' }}
        />

        {/* Key insight */}
        <div
          className="mt-4 p-3 rounded text-xs font-mono"
          style={{
            background: 'var(--color-bg-alt)',
            border: '1px solid var(--color-surface-light)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.6,
          }}
        >
          A 100W bulb running for 10 hours uses the same energy as a 1000W microwave running for 1 hour
          -- both use 1 kWh
        </div>
      </div>
    </FullscreenWrapper>
  );
}
