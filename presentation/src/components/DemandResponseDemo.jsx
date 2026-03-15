import React, { useEffect, useRef, useContext, useState, useCallback } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * DemandResponseDemo — Interactive canvas showing demand response in action.
 * A generator trips → frequency drops.
 * Without DR: cascading blackout.
 * With DR: devices respond in waves, frequency recovers.
 */

const hexToRgb = (hex) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? [parseInt(r[1], 16), parseInt(r[2], 16), parseInt(r[3], 16)] : [200, 200, 200];
};

const DEVICE_TYPES = [
  { type: 'battery', color: colors.success, label: 'Battery' },
  { type: 'heatpump', color: '#60a5fa', label: 'Heat Pump' },
  { type: 'ev', color: colors.primary, label: 'EV' },
  { type: 'solar', color: colors.accent, label: 'Solar' },
  { type: 'appliance', color: colors.textMuted, label: 'Appliance' },
];

const COLS = 24, ROWS = 8;

export default function DemandResponseDemo({ width = 920, height = 440 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const stateRef = useRef({
    phase: 'stable', // stable | tripping | recovered | blackout
    withDR: false,
    tripTime: 0,
    freq: 50.0,
    freqHistory: [],
    devices: [],
  });

  // Initialize device grid
  useEffect(() => {
    const devices = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const dt = DEVICE_TYPES[Math.floor(Math.random() * DEVICE_TYPES.length)];
        devices.push({
          type: dt.type,
          color: dt.color,
          active: false,
          activateDelay: 400 + Math.random() * 2200,
          brightness: 0.25 + Math.random() * 0.15,
        });
      }
    }
    stateRef.current.devices = devices;
  }, []);

  const triggerTrip = useCallback((withDR) => {
    const s = stateRef.current;
    s.phase = 'tripping';
    s.withDR = withDR;
    s.tripTime = performance.now();
    s.devices.forEach(d => { d.active = false; });
  }, []);

  const reset = useCallback(() => {
    const s = stateRef.current;
    s.phase = 'stable';
    s.freq = 50.0;
    s.freqHistory = [];
    s.devices.forEach(d => { d.active = false; });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      const now = performance.now();
      const s = stateRef.current;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // ── Update frequency ──
      if (s.phase === 'stable') {
        s.freq = 50.0 + Math.sin(now / 600) * 0.005 + Math.sin(now / 170) * 0.002;
      } else if (s.phase === 'tripping') {
        const elapsed = now - s.tripTime;
        if (s.withDR) {
          if (elapsed < 800) {
            s.freq = 50.0 - (elapsed / 800) * 0.18;
          } else if (elapsed < 3500) {
            const t = (elapsed - 800) / 2700;
            const eased = 1 - Math.pow(1 - t, 3);
            s.freq = 49.82 + eased * 0.15 + Math.sin(now / 300) * 0.003;
            s.devices.forEach(d => {
              if (!d.active && elapsed > d.activateDelay) d.active = true;
            });
          } else {
            s.freq = 49.97 + Math.sin(now / 600) * 0.005;
            s.phase = 'recovered';
          }
        } else {
          if (elapsed < 5000) {
            const t = elapsed / 5000;
            s.freq = 50.0 - t * t * 2.8;
          } else {
            s.freq = 47.2;
            s.phase = 'blackout';
          }
        }
      }

      s.freqHistory.push(s.freq);
      if (s.freqHistory.length > 240) s.freqHistory.shift();

      // ── Frequency chart ──
      const chartLeft = 70, chartTop = 16, chartW = width - 110, chartH = 90;
      const fMin = 47.0, fMax = 50.3;

      ctx.fillStyle = '#0a0f1a';
      ctx.fillRect(chartLeft, chartTop, chartW, chartH);
      ctx.strokeStyle = '#1a2236';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(chartLeft, chartTop, chartW, chartH);

      // Reference lines
      const drawRef = (hz, col, dash) => {
        const y = chartTop + chartH - ((hz - fMin) / (fMax - fMin)) * chartH;
        ctx.beginPath();
        ctx.moveTo(chartLeft, y); ctx.lineTo(chartLeft + chartW, y);
        ctx.strokeStyle = col;
        ctx.lineWidth = 1;
        ctx.setLineDash(dash);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.font = '10px "JetBrains Mono"';
        ctx.fillStyle = col;
        ctx.textAlign = 'right';
        ctx.fillText(`${hz.toFixed(1)}`, chartLeft - 6, y + 4);
      };
      drawRef(50.0, `${colors.primary}50`, [4, 4]);
      drawRef(49.0, `${colors.danger}40`, [4, 4]);
      drawRef(48.0, `${colors.danger}25`, [2, 4]);

      // Frequency line
      if (s.freqHistory.length > 1) {
        ctx.beginPath();
        s.freqHistory.forEach((f, i) => {
          const x = chartLeft + (i / 239) * chartW;
          const y = chartTop + chartH - ((f - fMin) / (fMax - fMin)) * chartH;
          i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        });
        const lc = s.freq < 49.0 ? colors.danger : s.freq < 49.8 ? colors.accent : colors.primary;
        ctx.strokeStyle = lc;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Current freq readout
      const fc = s.freq < 49.0 ? colors.danger : s.freq < 49.8 ? colors.accent : colors.primary;
      ctx.font = 'bold 22px "JetBrains Mono"';
      ctx.fillStyle = fc;
      ctx.textAlign = 'right';
      ctx.shadowBlur = 12;
      ctx.shadowColor = fc;
      ctx.fillText(`${s.freq.toFixed(3)} Hz`, width - 24, chartTop + 28);
      ctx.shadowBlur = 0;

      // Label
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillStyle = `${colors.textDim}80`;
      ctx.textAlign = 'left';
      ctx.fillText('GRID FREQUENCY', chartLeft, chartTop - 4);

      // ── Device grid ──
      const gridTop = chartTop + chartH + 28;
      const gridH = height - gridTop - 60;
      const gridLeft = 40;
      const gridW = width - 80;
      const cellW = gridW / COLS;
      const cellH = gridH / ROWS;
      const dotR = Math.min(cellW, cellH) * 0.28;

      // Grid label
      ctx.font = '10px "JetBrains Mono"';
      ctx.fillStyle = `${colors.textDim}80`;
      ctx.textAlign = 'left';
      ctx.fillText(`DISTRIBUTED DEVICES — ${COLS * ROWS} ENDPOINTS`, gridLeft, gridTop - 6);

      s.devices.forEach((d, i) => {
        const col = i % COLS;
        const row = Math.floor(i / COLS);
        const x = gridLeft + col * cellW + cellW / 2;
        const y = gridTop + row * cellH + cellH / 2;

        let alpha = d.brightness;
        let r = dotR;
        const [cr, cg, cb] = hexToRgb(d.color);

        if (s.phase === 'blackout') {
          alpha = 0.04;
        } else if (d.active && s.withDR) {
          alpha = 0.65 + Math.sin(now / 200 + i * 0.4) * 0.15;
          r = dotR * 1.25;
          // Glow
          ctx.beginPath();
          ctx.arc(x, y, r + 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${cr},${cg},${cb},0.08)`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${alpha})`;
        ctx.fill();
      });

      // ── Legend ──
      const legendY = height - 18;
      ctx.font = '10px "JetBrains Mono"';
      ctx.textAlign = 'left';
      let lx = gridLeft;
      DEVICE_TYPES.forEach(dt => {
        const [cr, cg, cb] = hexToRgb(dt.color);
        ctx.beginPath();
        ctx.arc(lx, legendY, 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},0.7)`;
        ctx.fill();
        ctx.fillStyle = `${colors.textDim}90`;
        ctx.fillText(dt.label, lx + 8, legendY + 3);
        lx += ctx.measureText(dt.label).width + 22;
      });

      // ── Status ──
      ctx.font = '11px "JetBrains Mono"';
      ctx.textAlign = 'right';
      if (s.phase === 'stable') {
        ctx.fillStyle = `${colors.primary}50`;
        ctx.fillText('GRID STABLE', width - 24, legendY + 3);
      } else if (s.phase === 'tripping' && s.withDR) {
        const active = s.devices.filter(d => d.active).length;
        ctx.fillStyle = colors.success;
        ctx.fillText(`DR ACTIVE — ${active}/${COLS * ROWS} RESPONDING`, width - 24, legendY + 3);
      } else if (s.phase === 'tripping') {
        ctx.fillStyle = colors.danger;
        ctx.fillText('FREQUENCY DROPPING', width - 24, legendY + 3);
      } else if (s.phase === 'recovered') {
        ctx.fillStyle = colors.success;
        ctx.fillText('FREQUENCY RESTORED', width - 24, legendY + 3);
      } else if (s.phase === 'blackout') {
        ctx.fillStyle = colors.danger;
        ctx.fillText('BLACKOUT', width - 24, legendY + 3);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  const phase = stateRef.current.phase;

  return (
    <div style={{ position: 'relative' }}>
      <canvas ref={canvasRef} style={{ width, height }} />
      <div className="absolute flex gap-2" style={{ bottom: 28, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
        {(phase === 'recovered' || phase === 'blackout') ? (
          <button onClick={reset} className="font-mono text-[12px] rounded-md cursor-pointer" style={{
            background: `${colors.primary}18`, border: `1px solid ${colors.primary}40`,
            color: colors.primary, padding: '6px 18px',
          }}>RESET</button>
        ) : phase === 'stable' ? (
          <>
            <button onClick={() => triggerTrip(false)} className="font-mono text-[12px] rounded-md cursor-pointer" style={{
              background: `${colors.danger}12`, border: `1px solid ${colors.danger}40`,
              color: colors.danger, padding: '6px 18px',
            }}>GENERATOR TRIP — NO RESPONSE</button>
            <button onClick={() => triggerTrip(true)} className="font-mono text-[12px] rounded-md cursor-pointer" style={{
              background: `${colors.success}12`, border: `1px solid ${colors.success}40`,
              color: colors.success, padding: '6px 18px',
            }}>GENERATOR TRIP — WITH DEMAND RESPONSE</button>
          </>
        ) : null}
      </div>
    </div>
  );
}
