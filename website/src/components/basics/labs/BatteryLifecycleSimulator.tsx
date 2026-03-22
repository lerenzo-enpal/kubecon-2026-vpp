import { useState, useRef, useEffect, useCallback } from 'react';
import FullscreenWrapper from '../../FullscreenWrapper';
import { getCanvasThemeColors } from '../shared/canvasTheme';

interface Preset {
  name: string;
  dailyCycles: number;
  dod: number;
  cRate: number;
  temp: number;
}

const presets: Preset[] = [
  { name: 'Home battery', dailyCycles: 1, dod: 80, cRate: 0.5, temp: 20 },
  { name: 'Commuter EV', dailyCycles: 0.8, dod: 70, cRate: 1, temp: 25 },
  { name: 'Fast-charged taxi', dailyCycles: 2, dod: 90, cRate: 2, temp: 35 },
  { name: 'Grid frequency', dailyCycles: 3, dod: 30, cRate: 2, temp: 22 },
];

const cRateOptions = [0.5, 1, 2, 3];

function computeSoH(totalCycles: number, dod: number, cRate: number, temp: number): number {
  const baseDegradation = 0.0001;
  const dodFactor = 1 + (dod / 100 - 0.5) * 2;
  const cRateFactor = 1 + (cRate - 0.5) * 1.5;
  const tempFactor = 1 + Math.max(0, (temp - 25)) * 0.04;
  const k = baseDegradation * dodFactor * cRateFactor * tempFactor;
  return 100 * Math.exp(-k * totalCycles);
}

export default function BatteryLifecycleSimulator() {
  const [dailyCycles, setDailyCycles] = useState(1);
  const [dod, setDod] = useState(80);
  const [cRate, setCRate] = useState(0.5);
  const [temp, setTemp] = useState(20);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-1 for animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const lastTimeRef = useRef(0);

  const maxYears = 20;

  const draw = useCallback((drawProgress: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (!rect) return;

    const cw = rect.width;
    const ch = Math.min(rect.height, 320);
    canvas.width = cw * dpr;
    canvas.height = ch * dpr;
    canvas.style.width = `${cw}px`;
    canvas.style.height = `${ch}px`;
    ctx.scale(dpr, dpr);

    const colors = getCanvasThemeColors();
    const font = '"JetBrains Mono", monospace';

    const padL = 55;
    const padR = 30;
    const padT = 30;
    const padB = 40;
    const chartW = cw - padL - padR;
    const chartH = ch - padT - padB;

    function xForYear(year: number) {
      return padL + (year / maxYears) * chartW;
    }
    function yForSoH(soh: number) {
      return padT + ((100 - soh) / 40) * chartH; // SoH range: 60-100
    }

    // Axes
    ctx.strokeStyle = colors.surfaceLight;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padL, padT);
    ctx.lineTo(padL, padT + chartH);
    ctx.lineTo(padL + chartW, padT + chartH);
    ctx.stroke();

    // Y labels
    ctx.fillStyle = colors.textDim;
    ctx.font = `10px ${font}`;
    ctx.textAlign = 'right';
    for (let soh = 60; soh <= 100; soh += 10) {
      const y = yForSoH(soh);
      ctx.fillText(`${soh}%`, padL - 8, y + 4);
      ctx.strokeStyle = `${colors.surfaceLight}44`;
      ctx.beginPath();
      ctx.moveTo(padL, y);
      ctx.lineTo(padL + chartW, y);
      ctx.stroke();
    }

    // X labels
    ctx.textAlign = 'center';
    for (let yr = 0; yr <= maxYears; yr += 5) {
      const x = xForYear(yr);
      ctx.fillStyle = colors.textDim;
      ctx.font = `10px ${font}`;
      ctx.fillText(`${yr}y`, x, padT + chartH + 18);
    }

    // End-of-life line at 80%
    const eolY = yForSoH(80);
    ctx.strokeStyle = colors.danger;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padL, eolY);
    ctx.lineTo(padL + chartW, eolY);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = colors.danger;
    ctx.font = `9px ${font}`;
    ctx.textAlign = 'left';
    ctx.fillText('END OF LIFE (80%)', padL + 4, eolY - 6);

    // Draw SoH curve
    const visibleYears = maxYears * drawProgress;
    ctx.beginPath();
    let eolYear: number | null = null;

    for (let year = 0; year <= visibleYears; year += 0.1) {
      const totalCycles = year * 365 * dailyCycles;
      const soh = computeSoH(totalCycles, dod, cRate, temp);
      const x = xForYear(year);
      const y = yForSoH(Math.max(soh, 60));

      if (year === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);

      if (eolYear === null && soh <= 80) {
        eolYear = year;
      }
    }
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // EOL marker
    if (eolYear !== null && eolYear <= visibleYears) {
      const x = xForYear(eolYear);
      ctx.beginPath();
      ctx.arc(x, eolY, 5, 0, Math.PI * 2);
      ctx.fillStyle = colors.danger;
      ctx.fill();
      ctx.fillStyle = colors.text;
      ctx.font = `bold 11px ${font}`;
      ctx.textAlign = 'center';
      ctx.fillText(`${eolYear.toFixed(1)} years`, x, eolY + 20);
    }

    // Thermometer
    const thermX = cw - 20;
    const thermY = padT + 10;
    const thermH = 60;
    const thermW = 10;
    const tempNorm = Math.min(1, temp / 45);

    ctx.fillStyle = colors.surface;
    ctx.fillRect(thermX - thermW / 2, thermY, thermW, thermH);
    ctx.strokeStyle = colors.surfaceLight;
    ctx.lineWidth = 1;
    ctx.strokeRect(thermX - thermW / 2, thermY, thermW, thermH);

    const fillH = thermH * tempNorm;
    const tempColor = temp > 35 ? colors.danger : temp > 25 ? colors.accent : colors.success;
    ctx.fillStyle = tempColor;
    ctx.fillRect(thermX - thermW / 2 + 1, thermY + thermH - fillH, thermW - 2, fillH);

    if (temp > 35) {
      ctx.shadowColor = colors.danger;
      ctx.shadowBlur = 8;
      ctx.fillRect(thermX - thermW / 2 + 1, thermY + thermH - fillH, thermW - 2, fillH);
      ctx.shadowBlur = 0;
    }

    ctx.fillStyle = colors.textDim;
    ctx.font = `9px ${font}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${temp}C`, thermX, thermY + thermH + 14);

    // Y axis label
    ctx.save();
    ctx.translate(14, padT + chartH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = colors.textDim;
    ctx.font = `10px ${font}`;
    ctx.textAlign = 'center';
    ctx.fillText('State of Health', 0, 0);
    ctx.restore();
  }, [dailyCycles, dod, cRate, temp]);

  useEffect(() => {
    draw(progress);
  }, [draw, progress]);

  useEffect(() => {
    if (!playing) return;
    lastTimeRef.current = performance.now();

    function frame(time: number) {
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;
      setProgress((prev) => {
        const next = prev + dt * 0.15; // ~6.5s for full animation
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      animRef.current = requestAnimationFrame(frame);
    }
    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [playing]);

  function applyPreset(p: Preset) {
    setDailyCycles(p.dailyCycles);
    setDod(p.dod);
    setCRate(p.cRate);
    setTemp(p.temp);
    setProgress(0);
    setPlaying(false);
  }

  function handlePlay() {
    setProgress(0);
    setPlaying(true);
  }

  return (
    <FullscreenWrapper label="Fullscreen">
      <div className="flex flex-col gap-4">
        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPreset(p)}
              className="font-mono text-xs px-3 py-1.5 rounded transition-colors"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-surface-light)',
              }}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div>
            <label className="block font-mono text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>
              Daily cycles: {dailyCycles}
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={dailyCycles}
              onChange={(e) => { setDailyCycles(parseFloat(e.target.value)); setProgress(0); setPlaying(false); }}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-mono text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>
              Depth of discharge: {dod}%
            </label>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={dod}
              onChange={(e) => { setDod(parseInt(e.target.value)); setProgress(0); setPlaying(false); }}
              className="w-full"
            />
          </div>
          <div>
            <label className="block font-mono text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>
              Charge rate
            </label>
            <div className="flex gap-1">
              {cRateOptions.map((rate) => (
                <button
                  key={rate}
                  onClick={() => { setCRate(rate); setProgress(0); setPlaying(false); }}
                  className="font-mono text-xs px-2 py-1 rounded transition-colors"
                  style={{
                    background: cRate === rate ? 'rgba(34, 211, 238, 0.15)' : 'var(--color-surface)',
                    color: cRate === rate ? 'var(--color-primary)' : 'var(--color-text-dim)',
                    border: `1px solid ${cRate === rate ? 'var(--color-primary)' : 'var(--color-surface-light)'}`,
                  }}
                >
                  {rate}C
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-mono text-xs mb-1" style={{ color: 'var(--color-text-dim)' }}>
              Ambient temp: {temp}C
            </label>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={temp}
              onChange={(e) => { setTemp(parseInt(e.target.value)); setProgress(0); setPlaying(false); }}
              className="w-full"
            />
          </div>
        </div>

        {/* Play button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePlay}
            className="font-mono text-sm px-4 py-2 rounded transition-colors"
            style={{
              background: playing ? 'var(--color-surface)' : 'rgba(34, 211, 238, 0.12)',
              color: playing ? 'var(--color-text-dim)' : 'var(--color-primary)',
              border: `1px solid ${playing ? 'var(--color-surface-light)' : 'rgba(34, 211, 238, 0.3)'}`,
            }}
          >
            {playing ? 'Simulating...' : 'Run Simulation'}
          </button>
          {progress > 0 && !playing && (
            <span className="font-mono text-xs" style={{ color: 'var(--color-text-dim)' }}>
              Complete
            </span>
          )}
        </div>

        {/* Canvas */}
        <div style={{ width: '100%', height: 320 }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </FullscreenWrapper>
  );
}
