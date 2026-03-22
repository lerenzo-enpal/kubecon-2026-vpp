import { useEffect, useRef, useState, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';
import FullscreenWrapper from '../../FullscreenWrapper';

// ── Demand curve: 24-hour profile (MW at each hour) ──
function getDemand(simTime: number): number {
  const hour = (simTime / 3600) % 24;
  // Piecewise: night ~200, morning ramp 6-9 ~350, midday ~280, evening peak 6-9pm ~400, decline
  if (hour < 5) return 200 + 10 * Math.sin(hour * 0.5);
  if (hour < 6) return 200 + (hour - 5) * 50; // 200 -> 250
  if (hour < 9) return 250 + ((hour - 6) / 3) * 100; // 250 -> 350
  if (hour < 12) return 350 - ((hour - 9) / 3) * 70; // 350 -> 280
  if (hour < 17) return 280 + ((hour - 12) / 5) * 20; // 280 -> 300
  if (hour < 18) return 300 + (hour - 17) * 100; // 300 -> 400
  if (hour < 21) return 400 - ((hour - 18) / 3) * 50; // 400 -> 350
  if (hour < 23) return 350 - ((hour - 21) / 2) * 130; // 350 -> 220
  return 220 - ((hour - 23)) * 20; // 220 -> 200
}

// ── Solar curve ──
function getSolarOutput(simTime: number, cloudActive: boolean): number {
  const hour = (simTime / 3600) % 24;
  if (hour < 6 || hour > 20) return 0;
  // Bell curve peaking at noon
  const peak = 400;
  const midday = 13;
  const width = 5;
  const base = peak * Math.exp(-0.5 * ((hour - midday) / width) ** 2);
  return cloudActive ? base * 0.4 : base;
}

// Format time as HH:MM
function formatTime(simTime: number): string {
  const totalMin = Math.floor(simTime / 60) % 1440;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface AssetState {
  gasOn: boolean;
  gasOutput: number; // current MW (ramps)
  batteryMode: 'off' | 'charge' | 'discharge';
  batteryEnergy: number; // MWh remaining
}

const BATTERY_MAX_MWH = 800;
const BATTERY_MW = 200;
const GAS_MAX_MW = 500;
const GAS_RAMP_MW_PER_SEC = 50 / 60; // 50 MW/min

export default function GridOperatorGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    simTime: 0,
    frequency: 50,
    assets: {
      gasOn: false,
      gasOutput: 0,
      batteryMode: 'off' as 'off' | 'charge' | 'discharge',
      batteryEnergy: 400, // start half full
    },
    greenSeconds: 0,
    totalSeconds: 0,
    cloudStart: -1,
    cloudTriggered: false,
  });
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());

  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [, forceUpdate] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  // Sync colors on theme change
  useEffect(() => {
    const update = () => { colorsRef.current = getCanvasThemeColors(); };
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    mql.addEventListener('change', update);
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mql.removeEventListener('change', update); obs.disconnect(); };
  }, []);

  const reset = useCallback(() => {
    stateRef.current = {
      simTime: 0,
      frequency: 50,
      assets: { gasOn: false, gasOutput: 0, batteryMode: 'off', batteryEnergy: 400 },
      greenSeconds: 0,
      totalSeconds: 0,
      cloudStart: -1,
      cloudTriggered: false,
    };
    setRunning(false);
    setGameOver(false);
    forceUpdate((n) => n + 1);
  }, []);

  const toggleGas = useCallback(() => {
    stateRef.current.assets.gasOn = !stateRef.current.assets.gasOn;
    forceUpdate((n) => n + 1);
  }, []);

  const cycleBattery = useCallback(() => {
    const modes: Array<'off' | 'charge' | 'discharge'> = ['off', 'discharge', 'charge'];
    const cur = stateRef.current.assets.batteryMode;
    const idx = modes.indexOf(cur);
    stateRef.current.assets.batteryMode = modes[(idx + 1) % 3];
    forceUpdate((n) => n + 1);
  }, []);

  // ── Simulation + render loop ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
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
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const tick = (ts: number) => {
      rafRef.current = requestAnimationFrame(tick);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const w = canvas.width / dpr;
      const h = canvas.height / dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const s = stateRef.current;
      const c = colorsRef.current;

      // Physics step
      if (running && !gameOver) {
        const realDt = lastTimeRef.current ? (ts - lastTimeRef.current) / 1000 : 0;
        lastTimeRef.current = ts;
        const simDt = Math.min(realDt, 0.1) * 720 * speed;

        // Cloud event: trigger randomly between hour 10-14, lasts ~2 simulated hours
        if (!s.cloudTriggered) {
          const hour = (s.simTime / 3600) % 24;
          if (hour > 10 && hour < 12 && Math.random() < 0.001 * simDt) {
            s.cloudStart = s.simTime;
            s.cloudTriggered = true;
          }
        }

        // Ramp gas
        if (s.assets.gasOn && s.assets.gasOutput < GAS_MAX_MW) {
          s.assets.gasOutput = Math.min(GAS_MAX_MW, s.assets.gasOutput + GAS_RAMP_MW_PER_SEC * simDt);
        } else if (!s.assets.gasOn && s.assets.gasOutput > 0) {
          s.assets.gasOutput = Math.max(0, s.assets.gasOutput - GAS_RAMP_MW_PER_SEC * simDt);
        }

        // Battery energy
        if (s.assets.batteryMode === 'discharge' && s.assets.batteryEnergy > 0) {
          const used = (BATTERY_MW * simDt) / 3600;
          s.assets.batteryEnergy = Math.max(0, s.assets.batteryEnergy - used);
          if (s.assets.batteryEnergy <= 0) s.assets.batteryMode = 'off';
        } else if (s.assets.batteryMode === 'charge' && s.assets.batteryEnergy < BATTERY_MAX_MWH) {
          const added = (BATTERY_MW * simDt) / 3600;
          s.assets.batteryEnergy = Math.min(BATTERY_MAX_MWH, s.assets.batteryEnergy + added);
          if (s.assets.batteryEnergy >= BATTERY_MAX_MWH) s.assets.batteryMode = 'off';
        }

        const cloudActive = s.cloudStart >= 0 && s.simTime >= s.cloudStart && s.simTime < s.cloudStart + 7200;
        const solar = getSolarOutput(s.simTime, cloudActive);
        const gas = s.assets.gasOutput;
        const batteryPower = s.assets.batteryMode === 'discharge' ? BATTERY_MW
          : s.assets.batteryMode === 'charge' ? -BATTERY_MW : 0;
        const totalSupply = gas + solar + batteryPower;
        const demand = getDemand(s.simTime);
        const imbalance = totalSupply - demand;

        // Frequency physics
        const H = 5;
        const S_base = 500;
        const f_nom = 50;
        const df = (imbalance / (2 * H * S_base)) * f_nom * simDt;
        s.frequency += df;
        // Load self-regulation damping
        s.frequency += (50 - s.frequency) * 0.02 * simDt;
        s.frequency = Math.max(47, Math.min(52, s.frequency));

        s.totalSeconds += simDt;
        if (s.frequency >= 49.8 && s.frequency <= 50.2) {
          s.greenSeconds += simDt;
        }

        s.simTime += simDt;
        if (s.simTime >= 86400) {
          setGameOver(true);
          setRunning(false);
        }
      } else {
        lastTimeRef.current = ts;
      }

      // ── Drawing ──
      ctx.clearRect(0, 0, w, h);

      const padX = 16;
      const topY = 12;

      // Time display
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillStyle = c.text;
      ctx.textAlign = 'center';
      ctx.fillText(formatTime(s.simTime), w / 2, topY + 14);

      // Score
      const pct = s.totalSeconds > 0 ? Math.round((s.greenSeconds / s.totalSeconds) * 100) : 100;
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.fillStyle = pct >= 80 ? c.success : pct >= 50 ? c.accent : c.danger;
      ctx.textAlign = 'right';
      ctx.fillText(`In-band: ${pct}%`, w - padX, topY + 14);

      // Speed indicator
      ctx.textAlign = 'left';
      ctx.fillStyle = c.textDim;
      ctx.fillText(`${speed}x`, padX, topY + 14);

      // ── Frequency gauge ──
      const gaugeY = topY + 32;
      const gaugeW = Math.min(w - padX * 2, 400);
      const gaugeX = (w - gaugeW) / 2;
      const gaugeH = 32;

      // Background
      ctx.fillStyle = c.surface;
      ctx.beginPath();
      ctx.roundRect(gaugeX, gaugeY, gaugeW, gaugeH, 4);
      ctx.fill();

      // Colored zones: 47-49.5 red, 49.5-49.8 amber, 49.8-50.2 green, 50.2-50.5 amber, 50.5-52 red
      const zones: Array<[number, number, string]> = [
        [47, 49.5, c.danger],
        [49.5, 49.8, c.accent],
        [49.8, 50.2, c.success],
        [50.2, 50.5, c.accent],
        [50.5, 52, c.danger],
      ];
      for (const [lo, hi, color] of zones) {
        const x1 = gaugeX + ((lo - 47) / 5) * gaugeW;
        const x2 = gaugeX + ((hi - 47) / 5) * gaugeW;
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.25;
        ctx.fillRect(x1, gaugeY, x2 - x1, gaugeH);
        ctx.globalAlpha = 1;
      }

      // Frequency needle
      const needleX = gaugeX + ((s.frequency - 47) / 5) * gaugeW;
      ctx.fillStyle = c.text;
      ctx.fillRect(needleX - 1.5, gaugeY - 2, 3, gaugeH + 4);

      // Frequency value below gauge
      ctx.font = '700 18px "JetBrains Mono", monospace';
      const freqColor = (s.frequency >= 49.8 && s.frequency <= 50.2) ? c.success
        : (s.frequency >= 49.5 && s.frequency <= 50.5) ? c.accent : c.danger;
      ctx.fillStyle = freqColor;
      ctx.textAlign = 'center';
      ctx.fillText(`${s.frequency.toFixed(3)} Hz`, w / 2, gaugeY + gaugeH + 22);

      // Gauge labels
      ctx.font = '400 12px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textDim;
      ctx.textAlign = 'left';
      ctx.fillText('47', gaugeX, gaugeY + gaugeH + 12);
      ctx.textAlign = 'right';
      ctx.fillText('52', gaugeX + gaugeW, gaugeY + gaugeH + 12);
      ctx.textAlign = 'center';
      ctx.fillText('50', gaugeX + gaugeW * 0.6, gaugeY + gaugeH + 12);

      // ── Asset panels ──
      const panelY = gaugeY + gaugeH + 40;
      const panelH = h - panelY - 16;
      const colW = (w - padX * 2 - 16) / 3;

      const cloudActive = s.cloudStart >= 0 && s.simTime >= s.cloudStart && s.simTime < s.cloudStart + 7200;
      const solarOutput = getSolarOutput(s.simTime, cloudActive);
      const demand = getDemand(s.simTime);

      // Helper: draw vertical bar
      const drawBar = (x: number, y: number, bw: number, bh: number, value: number, max: number, color: string, label: string, sublabel: string) => {
        // Background
        ctx.fillStyle = c.surface;
        ctx.beginPath();
        ctx.roundRect(x, y, bw, bh, 4);
        ctx.fill();

        // Fill
        const fillH = Math.min(1, Math.max(0, value / max)) * (bh - 4);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.roundRect(x + 2, y + bh - 2 - fillH, bw - 4, fillH, 2);
        ctx.fill();
        ctx.globalAlpha = 1;

        // Label
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.text;
        ctx.textAlign = 'center';
        ctx.fillText(label, x + bw / 2, y - 6);

        // Value
        ctx.font = '500 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.textMuted;
        ctx.fillText(sublabel, x + bw / 2, y + bh + 12);
      };

      // Gas
      const gasX = padX;
      drawBar(gasX, panelY + 18, colW * 0.4, panelH - 36, s.assets.gasOutput, GAS_MAX_MW, c.accent, 'GAS', `${Math.round(s.assets.gasOutput)} MW`);

      // Gas status indicator
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.fillStyle = s.assets.gasOn ? c.success : c.textDim;
      ctx.textAlign = 'center';
      ctx.fillText(s.assets.gasOn ? 'ON' : 'OFF', gasX + colW * 0.2, panelY + panelH + 2);

      // Solar
      const solarX = padX + colW + 8;
      drawBar(solarX, panelY + 18, colW * 0.4, panelH - 36, solarOutput, 400, '#f59e0b', 'SOLAR', `${Math.round(solarOutput)} MW`);

      if (cloudActive) {
        ctx.font = '600 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.danger;
        ctx.textAlign = 'center';
        ctx.fillText('CLOUDS', solarX + colW * 0.2, panelY + 6);
      }

      // Battery
      const battX = padX + (colW + 8) * 2;
      const battPower = s.assets.batteryMode === 'discharge' ? BATTERY_MW
        : s.assets.batteryMode === 'charge' ? -BATTERY_MW : 0;
      drawBar(battX, panelY + 18, colW * 0.4, panelH - 36, s.assets.batteryEnergy, BATTERY_MAX_MWH, c.success, 'BATT', `${Math.round(s.assets.batteryEnergy)} MWh`);

      // Battery mode label
      ctx.font = '500 12px "JetBrains Mono", monospace';
      const battModeLabel = s.assets.batteryMode === 'discharge' ? '+200 MW'
        : s.assets.batteryMode === 'charge' ? '-200 MW' : 'IDLE';
      ctx.fillStyle = s.assets.batteryMode === 'discharge' ? c.success
        : s.assets.batteryMode === 'charge' ? c.primary : c.textDim;
      ctx.textAlign = 'center';
      ctx.fillText(battModeLabel, battX + colW * 0.2, panelY + panelH + 2);

      // Demand bar (right side of each column)
      const demandBarX = w - padX - 30;
      drawBar(demandBarX, panelY + 18, 24, panelH - 36, demand, 500, c.danger, 'LOAD', `${Math.round(demand)} MW`);

      // Supply total
      const totalSupply = s.assets.gasOutput + solarOutput + battPower;
      ctx.font = '500 12px "JetBrains Mono", monospace';
      ctx.fillStyle = c.textMuted;
      ctx.textAlign = 'left';
      ctx.fillText(`Supply: ${Math.round(totalSupply)} MW`, padX, panelY + 6);

      // Game over overlay
      if (gameOver) {
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, w, h);
        ctx.font = '700 22px "JetBrains Mono", monospace';
        ctx.fillStyle = c.text;
        ctx.textAlign = 'center';
        ctx.fillText('24 HOURS COMPLETE', w / 2, h / 2 - 16);
        ctx.font = '500 16px "JetBrains Mono", monospace';
        ctx.fillStyle = pct >= 80 ? c.success : pct >= 50 ? c.accent : c.danger;
        ctx.fillText(`Time in green band: ${pct}%`, w / 2, h / 2 + 16);
        ctx.font = '400 12px "JetBrains Mono", monospace';
        ctx.fillStyle = c.textMuted;
        ctx.fillText(pct >= 90 ? 'Excellent operator!' : pct >= 70 ? 'Good job, but room for improvement.' : 'The grid struggled -- try again!', w / 2, h / 2 + 42);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [running, speed, gameOver]);

  const s = stateRef.current;

  return (
    <FullscreenWrapper label="Be the Grid Operator">
      <div className="flex flex-col h-full" style={{ background: 'var(--color-bg-alt)', border: '1px solid var(--color-surface-light)', borderRadius: 8 }}>
        {/* Canvas */}
        <div className="relative w-full" style={{ height: 360 }}>
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 flex-wrap" style={{ borderTop: '1px solid var(--color-surface-light)' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setRunning((r) => !r); }}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold tracking-wide cursor-pointer"
              style={{
                background: running ? 'var(--color-danger)' : 'var(--color-success)',
                color: '#fff',
                border: 'none',
              }}
            >
              {running ? 'PAUSE' : gameOver ? 'DONE' : 'PLAY'}
            </button>
            <button
              onClick={reset}
              className="px-3 py-1.5 rounded text-xs font-mono tracking-wide cursor-pointer"
              style={{
                background: 'var(--color-surface)',
                color: 'var(--color-text-muted)',
                border: '1px solid var(--color-surface-light)',
              }}
            >
              RESET
            </button>
            <div className="flex items-center gap-1 ml-2">
              {[1, 2, 4].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className="px-2 py-1 rounded text-xs font-mono cursor-pointer"
                  style={{
                    background: speed === s ? 'var(--color-primary)' : 'var(--color-surface)',
                    color: speed === s ? '#000' : 'var(--color-text-dim)',
                    border: '1px solid var(--color-surface-light)',
                  }}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleGas}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold tracking-wide cursor-pointer"
              style={{
                background: s.assets.gasOn ? 'var(--color-accent)' : 'var(--color-surface)',
                color: s.assets.gasOn ? '#000' : 'var(--color-text-muted)',
                border: '1px solid var(--color-surface-light)',
              }}
            >
              GAS {s.assets.gasOn ? 'ON' : 'OFF'}
            </button>
            <button
              onClick={cycleBattery}
              className="px-3 py-1.5 rounded text-xs font-mono font-semibold tracking-wide cursor-pointer"
              style={{
                background: s.assets.batteryMode !== 'off' ? 'var(--color-success)' : 'var(--color-surface)',
                color: s.assets.batteryMode !== 'off' ? '#000' : 'var(--color-text-muted)',
                border: '1px solid var(--color-surface-light)',
              }}
            >
              BATT: {s.assets.batteryMode.toUpperCase()}
            </button>
          </div>
        </div>
      </div>
    </FullscreenWrapper>
  );
}
