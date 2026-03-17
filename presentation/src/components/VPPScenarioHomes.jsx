import React, { useEffect, useRef } from 'react';
import { colors } from '../theme';

// ── Step data for each scenario ──────────────────────────────
// Extended with view (DeckGL camera), duckHighlightHour, duckBlend, homePhase, showHomeDetail
const SUMMER_STEPS = [
  {
    narration: 'Sunny July morning. 8,200 homes generating solar.',
    highlight: 'Energy Arbitrage',
    highlightColor: colors.success,
    sun: { angle: 0.85, brightness: 1.0 },
    houses: [
      { pv: 1.0, battery: 0.05, ev: 0.05, heatPump: 0, batteryFlow: 'idle', evFlow: 'idle', pvFlow: 'export', label: '' },
      { pv: 0.9, battery: 0.08, ev: 0.1, heatPump: 0, batteryFlow: 'idle', evFlow: 'idle', pvFlow: 'export', label: '' },
      { pv: 1.0, battery: 0.03, ev: 0.0, heatPump: 0, batteryFlow: 'idle', evFlow: 'idle', pvFlow: 'export', label: '' },
    ],
    price: { value: 8, trend: 'falling' },
    freq: 50.00,
    // Map HUD fields
    view: { longitude: 13.4, latitude: 52.52, zoom: 8.5, pitch: 35, bearing: -5 },
    duckHighlightHour: 7,
    duckBlend: 0,
    homePhase: 'solar',
    showHomeDetail: false,
  },
  {
    narration: 'Midday. Prices collapse. Flexa holds batteries empty -- on purpose.',
    highlight: 'Energy Arbitrage',
    highlightColor: colors.success,
    sun: { angle: 0.8, brightness: 1.0 },
    houses: [
      { pv: 1.0, battery: 0.05, ev: 0.05, heatPump: 0, batteryFlow: 'hold', evFlow: 'idle', pvFlow: 'export', label: 'HOLD' },
      { pv: 0.95, battery: 0.08, ev: 0.1, heatPump: 0, batteryFlow: 'hold', evFlow: 'idle', pvFlow: 'export', label: 'HOLD' },
      { pv: 1.0, battery: 0.03, ev: 0.0, heatPump: 0, batteryFlow: 'hold', evFlow: 'idle', pvFlow: 'export', label: 'HOLD' },
    ],
    price: { value: 0, trend: 'falling' },
    freq: 50.00,
    view: { longitude: 13.4, latitude: 52.52, zoom: 9.5, pitch: 35, bearing: -5 },
    duckHighlightHour: 12,
    duckBlend: 0,
    homePhase: 'hold',
    showHomeDetail: false,
  },
  {
    narration: 'Prices negative. Flexa: charge everything. Paid to consume.',
    highlight: 'Energy Arbitrage',
    highlightColor: colors.success,
    sun: { angle: 0.75, brightness: 0.95 },
    houses: [
      { pv: 0.6, battery: 0.05, ev: 0.05, heatPump: 0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'off', label: '-5 ct/kWh' },
      { pv: 0.5, battery: 0.08, ev: 0.1, heatPump: 0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'off', label: '-5 ct/kWh' },
      { pv: 0.55, battery: 0.03, ev: 0.0, heatPump: 0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'off', label: '-5 ct/kWh' },
    ],
    price: { value: -5, trend: 'negative' },
    freq: 50.00,
    view: { longitude: 13.2707, latitude: 52.5928, zoom: 17, pitch: 40, bearing: -3 },
    duckHighlightHour: 13,
    duckBlend: 0.3,
    homePhase: 'charge',
    showHomeDetail: true,
    homeDetail: {
      solar: { status: 'curtailed', flow: 'none', kw: 0 },
      battery: { status: 'charging', level: 0.05, levelTarget: 1.0, flow: 'from-grid', kw: 5.0 },
      ev: { status: 'charging', level: 0.15, levelTarget: 1.0, flow: 'from-grid', kw: 7.4 },
      heatPump: { status: 'pre-heat', kw: 2.8, flow: 'from-grid' },
      gridPrice: '-5 ct/kWh',
    },
  },
  {
    narration: 'Thousands of batteries charge simultaneously at negative prices.',
    highlight: 'Energy Arbitrage',
    highlightColor: colors.success,
    sun: { angle: 0.7, brightness: 0.9 },
    houses: [
      { pv: 0.6, battery: 0.5, ev: 0.5, heatPump: 0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'off', label: '-5 ct/kWh' },
      { pv: 0.5, battery: 0.45, ev: 0.45, heatPump: 0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'off', label: '-5 ct/kWh' },
      { pv: 0.55, battery: 0.55, ev: 0.4, heatPump: 0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'off', label: '-5 ct/kWh' },
    ],
    price: { value: -5, trend: 'negative' },
    freq: 50.00,
    view: { longitude: 13.4, latitude: 52.52, zoom: 9, pitch: 35, bearing: -5 },
    duckHighlightHour: 14,
    duckBlend: 0.5,
    homePhase: 'charge',
    showHomeDetail: false,
  },
  {
    narration: 'Sun sets, prices spike. Full batteries discharge at peak prices.',
    highlight: 'Peak Shaving',
    highlightColor: colors.accent,
    sun: { angle: 0.15, brightness: 0.3 },
    houses: [
      { pv: 0.05, battery: 0.95, ev: 0.9, heatPump: 0, batteryFlow: 'discharge', evFlow: 'idle', pvFlow: 'off', label: '+25 ct/kWh' },
      { pv: 0.02, battery: 0.88, ev: 0.85, heatPump: 0, batteryFlow: 'discharge', evFlow: 'idle', pvFlow: 'off', label: '+25 ct/kWh' },
      { pv: 0.0, battery: 0.92, ev: 0.95, heatPump: 0, batteryFlow: 'discharge', evFlow: 'idle', pvFlow: 'off', label: '+25 ct/kWh' },
    ],
    price: { value: 25, trend: 'rising' },
    freq: 50.00,
    view: { longitude: 13.4, latitude: 52.52, zoom: 8.5, pitch: 35, bearing: -5 },
    duckHighlightHour: 19,
    duckBlend: 0.8,
    homePhase: 'discharge',
    showHomeDetail: false,
  },
  {
    narration: 'Revenue earned. Grid peaks softened. Fossil generation reduced.',
    highlight: 'Result',
    highlightColor: colors.primary,
    sun: { angle: 0.05, brightness: 0.1 },
    houses: [
      { pv: 0.0, battery: 0.4, ev: 0.9, heatPump: 0, batteryFlow: 'idle', evFlow: 'idle', pvFlow: 'off', label: '+47 EUR' },
      { pv: 0.0, battery: 0.35, ev: 0.85, heatPump: 0, batteryFlow: 'idle', evFlow: 'idle', pvFlow: 'off', label: '+52 EUR' },
      { pv: 0.0, battery: 0.38, ev: 0.95, heatPump: 0, batteryFlow: 'idle', evFlow: 'idle', pvFlow: 'off', label: '+41 EUR' },
    ],
    price: { value: 12, trend: 'stable' },
    freq: 50.00,
    view: { longitude: 13.4, latitude: 52.52, zoom: 8.5, pitch: 35, bearing: -5 },
    duckHighlightHour: null, // full day view
    duckBlend: 1.0,
    homePhase: 'stable',
    showHomeDetail: false,
  },
];

const WINTER_STEPS = [
  {
    narration: 'Cold January. 12,000 homes connected. Heat pumps running.',
    highlight: 'Demand Response',
    highlightColor: colors.primary,
    sun: { angle: 0.3, brightness: 0.35 },
    houses: [
      { pv: 0.15, battery: 0.3, ev: 0.4, heatPump: 1.0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: '' },
      { pv: 0.12, battery: 0.25, ev: 0.35, heatPump: 0.9, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: '' },
      { pv: 0.18, battery: 0.4, ev: 0.5, heatPump: 1.0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: '' },
    ],
    price: { value: 14, trend: 'stable' },
    freq: 50.00,
    view: { longitude: 13.4, latitude: 52.52, zoom: 8.5, pitch: 35, bearing: -5 },
    duckHighlightHour: 9,
    duckBlend: 0,
    homePhase: 'standby',
    showHomeDetail: false,
  },
  {
    narration: '800 MW generator trips offline. Frequency drops -- danger.',
    highlight: 'GRID ALERT',
    highlightColor: colors.danger,
    sun: { angle: 0.32, brightness: 0.35 },
    houses: [
      { pv: 0.15, battery: 0.35, ev: 0.45, heatPump: 1.0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: 'ALERT' },
      { pv: 0.12, battery: 0.3, ev: 0.4, heatPump: 0.9, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: 'ALERT' },
      { pv: 0.18, battery: 0.45, ev: 0.55, heatPump: 1.0, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: 'ALERT' },
    ],
    price: { value: 14, trend: 'rising' },
    freq: 49.72,
    view: { longitude: 13.4, latitude: 52.52, zoom: 8.5, pitch: 35, bearing: -5 },
    duckHighlightHour: 9,
    duckBlend: 0,
    homePhase: 'alert',
    showHomeDetail: false,
  },
  {
    narration: '200ms. Flexa responds. Heat pumps pause. Batteries discharge.',
    highlight: 'Frequency Regulation',
    highlightColor: colors.danger,
    sun: { angle: 0.33, brightness: 0.35 },
    houses: [
      { pv: 0.15, battery: 0.35, ev: 0.45, heatPump: 0, batteryFlow: 'discharge', evFlow: 'paused', pvFlow: 'weak', label: 'PAUSED' },
      { pv: 0.12, battery: 0.3, ev: 0.4, heatPump: 0, batteryFlow: 'discharge', evFlow: 'paused', pvFlow: 'weak', label: 'PAUSED' },
      { pv: 0.18, battery: 0.45, ev: 0.55, heatPump: 0, batteryFlow: 'discharge', evFlow: 'paused', pvFlow: 'weak', label: 'PAUSED' },
    ],
    price: { value: 18, trend: 'rising' },
    freq: 49.85,
    view: { longitude: 13.38, latitude: 52.50, zoom: 15, pitch: 40, bearing: -3 },
    duckHighlightHour: 9,
    duckBlend: 0.5,
    homePhase: 'respond',
    showHomeDetail: true,
    homeDetail: {
      solar: { status: 'weak', flow: 'to-home', kw: 0.3 },
      battery: { status: 'discharging', level: 0.35, flow: 'to-grid', kw: 3.5 },
      ev: { status: 'paused', level: 0.45, flow: 'none', kw: 0 },
      heatPump: { status: 'paused', kw: 0 },
      gridPrice: '+18 ct/kWh',
    },
  },
  {
    narration: '12,000 homes respond as one. 15 MW freed. Invisible to residents.',
    highlight: 'Demand Response',
    highlightColor: colors.primary,
    sun: { angle: 0.35, brightness: 0.35 },
    houses: [
      { pv: 0.15, battery: 0.25, ev: 0.45, heatPump: 0, batteryFlow: 'discharge', evFlow: 'paused', pvFlow: 'weak', label: '1.3 kW freed' },
      { pv: 0.12, battery: 0.2, ev: 0.4, heatPump: 0, batteryFlow: 'discharge', evFlow: 'paused', pvFlow: 'weak', label: '1.1 kW freed' },
      { pv: 0.18, battery: 0.35, ev: 0.55, heatPump: 0, batteryFlow: 'discharge', evFlow: 'paused', pvFlow: 'weak', label: '1.4 kW freed' },
    ],
    price: { value: 22, trend: 'stable' },
    freq: 49.95,
    view: { longitude: 13.4, latitude: 52.52, zoom: 9, pitch: 35, bearing: -5 },
    duckHighlightHour: 9,
    duckBlend: 0.8,
    homePhase: 'respond',
    showHomeDetail: false,
  },
  {
    narration: 'Grid stabilized. Heat pumps resume. Zero humans involved.',
    highlight: 'GRID STABLE',
    highlightColor: colors.success,
    sun: { angle: 0.38, brightness: 0.35 },
    houses: [
      { pv: 0.15, battery: 0.15, ev: 0.45, heatPump: 0.8, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: 'STABLE' },
      { pv: 0.12, battery: 0.12, ev: 0.4, heatPump: 0.7, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: 'STABLE' },
      { pv: 0.18, battery: 0.28, ev: 0.55, heatPump: 0.9, batteryFlow: 'charge', evFlow: 'charge', pvFlow: 'weak', label: 'STABLE' },
    ],
    price: { value: 15, trend: 'falling' },
    freq: 50.00,
    view: { longitude: 13.4, latitude: 52.52, zoom: 8.5, pitch: 35, bearing: -5 },
    duckHighlightHour: 9,
    duckBlend: 1.0,
    homePhase: 'stable',
    showHomeDetail: false,
  },
];

export { SUMMER_STEPS, WINTER_STEPS };

// ── Drawing helpers ──────────────────────────────────────────

function drawHouse(ctx, x, y, w, h, houseData, time, houseIndex) {
  const roofH = h * 0.3;
  const bodyY = y + roofH;
  const bodyH = h - roofH;

  // House body
  ctx.fillStyle = colors.surface + '90';
  ctx.strokeStyle = colors.primary + '40';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, bodyY, w, bodyH, 4);
  ctx.fill();
  ctx.stroke();

  // Roof
  ctx.strokeStyle = colors.primary + '60';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x - 8, bodyY);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + w + 8, bodyY);
  ctx.stroke();

  // PV panels on roof
  const pvBrightness = houseData.pv;
  if (pvBrightness > 0) {
    const panelCount = 4;
    const panelW = w * 0.15;
    const panelH = roofH * 0.28;
    for (let i = 0; i < panelCount; i++) {
      const frac = (i + 0.5) / panelCount;
      const px = x + w * (0.15 + frac * 0.7) - panelW / 2;
      // Position on roof slope
      const roofY = bodyY - roofH * (1 - Math.abs(frac - 0.5) * 1.4);
      const alpha = Math.floor(pvBrightness * 200).toString(16).padStart(2, '0');
      ctx.fillStyle = colors.solar + alpha;
      ctx.strokeStyle = colors.solar + 'aa';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.roundRect(px, roofY, panelW, panelH, 1);
      ctx.fill();
      ctx.stroke();

      // Glow when active
      if (pvBrightness > 0.5) {
        const glowAlpha = Math.floor(pvBrightness * 40 * (0.7 + 0.3 * Math.sin(time * 2 + i))).toString(16).padStart(2, '0');
        ctx.shadowColor = colors.solar + glowAlpha;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  // Device section - split body into 4 quadrants
  const devW = w * 0.4;
  const devH = bodyH * 0.35;
  const devY1 = bodyY + bodyH * 0.12;
  const devY2 = bodyY + bodyH * 0.55;
  const devX1 = x + w * 0.08;
  const devX2 = x + w * 0.52;

  // Battery (top-left)
  drawBattery(ctx, devX1, devY1, devW, devH, houseData.battery, houseData.batteryFlow, time);
  // EV (top-right)
  drawEV(ctx, devX2, devY1, devW, devH, houseData.ev, houseData.evFlow, time);
  // Heat Pump (bottom-left)
  drawHeatPump(ctx, devX1, devY2, devW, devH, houseData.heatPump, time);

  // Label (bottom-right area)
  if (houseData.label) {
    const lx = devX2 + devW / 2;
    const ly = devY2 + devH / 2;
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    let labelColor = colors.text;
    if (houseData.label === 'ALERT') labelColor = colors.danger;
    else if (houseData.label === 'PAUSED') labelColor = colors.accent;
    else if (houseData.label === 'HOLD') labelColor = colors.textMuted;
    else if (houseData.label === 'STABLE') labelColor = colors.success;
    else if (houseData.label.startsWith('+')) labelColor = colors.success;
    else if (houseData.label.startsWith('-')) labelColor = colors.success;
    else labelColor = colors.primary;

    ctx.fillStyle = labelColor;
    ctx.fillText(houseData.label, lx, ly);
  }

  // House number
  ctx.font = '500 11px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillStyle = colors.textDim;
  ctx.fillText(`Home ${houseIndex + 1}`, x + w / 2, y - 4);
}

function drawBattery(ctx, x, y, w, h, level, flow, time) {
  const bw = w * 0.55;
  const bh = h * 0.7;
  const bx = x + (w - bw) / 2;
  const by = y + (h - bh) / 2;

  // Battery outline
  ctx.strokeStyle = colors.battery + '70';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 2);
  ctx.stroke();

  // Terminal nub
  ctx.fillStyle = colors.battery + '50';
  ctx.fillRect(bx + bw * 0.35, by - 3, bw * 0.3, 3);

  // Fill level
  if (level > 0) {
    const fillH = bh * level * 0.9;
    const alpha = level > 0.5 ? 'aa' : '60';
    ctx.fillStyle = colors.battery + alpha;
    ctx.beginPath();
    ctx.roundRect(bx + 2, by + bh - fillH - 1, bw - 4, fillH, 1);
    ctx.fill();
  }

  // Flow indicator
  if (flow === 'charge') {
    drawFlowArrow(ctx, bx + bw / 2, by + bh + 8, 'up', colors.battery, time);
  } else if (flow === 'discharge') {
    drawFlowArrow(ctx, bx + bw / 2, by - 10, 'down', colors.accent, time);
  } else if (flow === 'hold') {
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.textDim;
    ctx.fillText('HOLD', bx + bw / 2, by + bh + 12);
  }

  // Label
  ctx.font = '500 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('BAT', x + w / 2, y + h + 2);
}

function drawEV(ctx, x, y, w, h, level, flow, time) {
  const cw = w * 0.65;
  const ch = h * 0.5;
  const cx = x + (w - cw) / 2;
  const cy = y + (h - ch) / 2 + 2;

  // Simple car body
  ctx.strokeStyle = colors.primary + '70';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy + ch);
  ctx.lineTo(cx, cy + ch * 0.4);
  ctx.quadraticCurveTo(cx, cy, cx + cw * 0.25, cy);
  ctx.lineTo(cx + cw * 0.75, cy);
  ctx.quadraticCurveTo(cx + cw, cy, cx + cw, cy + ch * 0.4);
  ctx.lineTo(cx + cw, cy + ch);
  ctx.stroke();

  // Wheels
  ctx.fillStyle = colors.primary + '40';
  ctx.beginPath();
  ctx.arc(cx + cw * 0.25, cy + ch, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + cw * 0.75, cy + ch, 3, 0, Math.PI * 2);
  ctx.fill();

  // Charge level bar inside car
  if (level > 0) {
    const barW = cw * 0.7;
    const barH = 4;
    const barX = cx + (cw - barW) / 2;
    const barY = cy + ch * 0.55;
    ctx.fillStyle = colors.primary + '30';
    ctx.fillRect(barX, barY, barW, barH);
    ctx.fillStyle = colors.primary + '90';
    ctx.fillRect(barX, barY, barW * level, barH);
  }

  // Flow indicator
  if (flow === 'charge') {
    drawFlowArrow(ctx, cx + cw / 2, cy - 8, 'up', colors.primary, time);
  } else if (flow === 'paused') {
    ctx.font = '600 8px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.accent;
    ctx.fillText('PAUSED', cx + cw / 2, cy - 5);
  }

  // Label
  ctx.font = '500 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('EV', x + w / 2, y + h + 2);
}

function drawHeatPump(ctx, x, y, w, h, activity, time) {
  const bw = w * 0.55;
  const bh = h * 0.65;
  const bx = x + (w - bw) / 2;
  const by = y + (h - bh) / 2;

  // Box
  ctx.strokeStyle = colors.secondary + '70';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 2);
  ctx.stroke();

  if (activity > 0) {
    // Warm glow
    const alpha = Math.floor(activity * 30 * (0.7 + 0.3 * Math.sin(time * 3))).toString(16).padStart(2, '0');
    ctx.fillStyle = colors.secondary + alpha;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 2);
    ctx.fill();

    // Heat waves
    for (let i = 0; i < 3; i++) {
      const waveX = bx + bw * (0.25 + i * 0.25);
      const wavePhase = time * 2 + i;
      ctx.strokeStyle = colors.secondary + '60';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(waveX, by - 2);
      ctx.quadraticCurveTo(waveX + 3 * Math.sin(wavePhase), by - 8, waveX, by - 14);
      ctx.stroke();
    }
  } else {
    // Inactive
    ctx.fillStyle = colors.textDim + '20';
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 2);
    ctx.fill();
  }

  ctx.font = '500 9px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('HP', x + w / 2, y + h + 2);
}

function drawFlowArrow(ctx, cx, cy, dir, color, time) {
  const offset = Math.sin(time * 4) * 2;
  const dy = dir === 'up' ? -offset : offset;
  ctx.fillStyle = color + 'cc';
  ctx.beginPath();
  if (dir === 'up') {
    ctx.moveTo(cx, cy + dy - 4);
    ctx.lineTo(cx - 3, cy + dy);
    ctx.lineTo(cx + 3, cy + dy);
  } else {
    ctx.moveTo(cx, cy + dy + 4);
    ctx.lineTo(cx - 3, cy + dy);
    ctx.lineTo(cx + 3, cy + dy);
  }
  ctx.fill();
}

// ── Main Component ───────────────────────────────────────────

export default function VPPScenarioHomes({ scenario = 'summer', step = 0, width = 960, height = 280 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stepRef = useRef(step);
  const prevStepRef = useRef(step);
  const transitionRef = useRef(1); // 0-1 blend between prev and current step
  stepRef.current = step;

  const steps = scenario === 'summer' ? SUMMER_STEPS : WINTER_STEPS;

  useEffect(() => {
    if (step !== prevStepRef.current) {
      transitionRef.current = 0;
      prevStepRef.current = step;
    }
  }, [step]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const houseW = width * 0.22;
    const houseH = height * 0.65;
    const gap = width * 0.06;
    const totalW = 3 * houseW + 2 * gap;
    const startX = (width - totalW) / 2;
    const houseY = 10;

    function draw() {
      const now = performance.now() / 1000;
      ctx.clearRect(0, 0, width, height);

      // Advance transition
      if (transitionRef.current < 1) {
        transitionRef.current = Math.min(1, transitionRef.current + 0.03);
      }

      const currentStep = steps[Math.min(stepRef.current, steps.length - 1)];

      // Draw 3 houses
      for (let i = 0; i < 3; i++) {
        const hx = startX + i * (houseW + gap);
        drawHouse(ctx, hx, houseY, houseW, houseH, currentStep.houses[i], now, i);
      }

      // Narration bar at bottom
      const narY = height - 50;
      ctx.fillStyle = colors.bg + 'e0';
      ctx.fillRect(0, narY - 8, width, 58);
      ctx.strokeStyle = colors.primary + '20';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, narY - 8);
      ctx.lineTo(width, narY - 8);
      ctx.stroke();

      // Highlight badge
      if (currentStep.highlight) {
        ctx.font = '700 12px "JetBrains Mono", monospace';
        const badgeText = currentStep.highlight;
        const badgeW = ctx.measureText(badgeText).width + 16;
        const badgeX = 20;
        const badgeY = narY - 2;
        ctx.fillStyle = currentStep.highlightColor + '20';
        ctx.strokeStyle = currentStep.highlightColor + '60';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, 20, 3);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = currentStep.highlightColor;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(badgeText, badgeX + 8, badgeY + 10);
      }

      // Narration text
      ctx.font = '400 14px "Inter", sans-serif';
      ctx.fillStyle = colors.text + 'dd';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const textX = 20;
      const textY = narY + 22;
      const maxWidth = width - 40;
      ctx.fillText(currentStep.narration, textX, textY, maxWidth);

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, scenario, step, steps]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block' }}
    />
  );
}
