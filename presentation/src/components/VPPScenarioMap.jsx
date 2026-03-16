import React, { useEffect, useRef } from 'react';
import { colors } from '../theme';
import { SUMMER_STEPS, WINTER_STEPS } from './VPPScenarioHomes';

// ── Home locations scattered across Brandenburg/Berlin ────────
function generateHomes(count, seed = 42) {
  const homes = [];
  let s = seed;
  const next = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  // Cluster more densely around Berlin center, sparser in Brandenburg
  for (let i = 0; i < count; i++) {
    const r = next();
    let lon, lat;
    if (r < 0.6) {
      // Berlin core cluster
      lon = 13.25 + next() * 0.35;
      lat = 52.4 + next() * 0.2;
    } else if (r < 0.85) {
      // Inner suburbs
      lon = 13.0 + next() * 0.8;
      lat = 52.3 + next() * 0.4;
    } else {
      // Outer Brandenburg
      lon = 12.8 + next() * 1.4;
      lat = 52.1 + next() * 0.8;
    }
    homes.push({ id: i, lon, lat, size: 2 + next() * 3 });
  }
  return homes;
}

const HOMES = generateHomes(300);

// Power plant (winter scenario)
const POWER_PLANT = { lon: 14.35, lat: 51.85, name: 'Schwarze Pumpe' };

// ── Geo projection helpers ──────────────────────────────────
// Simple Mercator-ish projection for the Brandenburg region
function createProjection(centerLon, centerLat, zoom, width, height) {
  const scale = Math.pow(2, zoom) * 40;
  return {
    project(lon, lat) {
      const x = width / 2 + (lon - centerLon) * scale;
      const y = height / 2 - (lat - centerLat) * scale * 0.75; // lat squish
      return [x, y];
    },
  };
}

function lerp(a, b, t) {
  return a + (b - a) * Math.min(1, Math.max(0, t));
}

// ── Color helpers ────────────────────────────────────────────
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function getHomeColor(scenario, step, time, homeIndex) {
  if (scenario === 'summer') {
    if (step <= 2) {
      const pulse = 0.55 + 0.25 * Math.sin(time * 2 + homeIndex * 0.3);
      return hexToRgba(colors.solar, pulse);
    }
    if (step === 3) {
      const pulse = 0.5 + 0.3 * Math.sin(time * 3 + homeIndex * 0.2);
      return hexToRgba(colors.solar, pulse);
    }
    return hexToRgba(colors.success, 0.55);
  }

  // Winter
  if (step === 0) return hexToRgba(colors.primary, 0.4 + 0.12 * Math.sin(time * 1.5 + homeIndex * 0.4));
  if (step === 1) {
    const flash = 0.4 + 0.6 * Math.abs(Math.sin(time * 5 + homeIndex * 0.1));
    return hexToRgba(colors.danger, flash);
  }
  if (step === 2 || step === 3) {
    const pulse = 0.4 + 0.4 * Math.sin(time * 3 + homeIndex * 0.15);
    return hexToRgba(colors.primary, pulse);
  }
  return hexToRgba(colors.success, 0.5);
}

// ── HUD Overlays (React, positioned over canvas) ────────────

function FrequencyGauge({ freq }) {
  const freqColor = freq >= 49.95 ? colors.success : freq >= 49.8 ? colors.accent : colors.danger;
  const isAlert = freq < 49.8;
  return (
    <div style={{
      position: 'absolute', top: 12, right: 12,
      background: colors.bg + 'dd', border: `1px solid ${freqColor}50`,
      borderRadius: 6, padding: '8px 14px',
      fontFamily: '"JetBrains Mono", monospace',
      animation: isAlert ? 'vppPulse 0.5s ease-in-out infinite' : 'none',
    }}>
      <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: '0.1em' }}>GRID FREQUENCY</div>
      <div style={{
        fontSize: 28, fontWeight: 700, color: freqColor,
        textShadow: `0 0 20px ${freqColor}50`,
      }}>
        {freq.toFixed(2)} <span style={{ fontSize: 14, color: colors.textMuted }}>Hz</span>
      </div>
    </div>
  );
}

function PriceTicker({ value, trend }) {
  const priceColor = value < 0 ? colors.success : value > 15 ? colors.danger : colors.text;
  const arrow = trend === 'rising' ? '\u2191' : trend === 'falling' ? '\u2193' : trend === 'negative' ? '\u2193\u2193' : '';
  return (
    <div style={{
      position: 'absolute', top: 12, left: 12,
      background: colors.bg + 'dd', border: `1px solid ${priceColor}40`,
      borderRadius: 6, padding: '8px 14px',
      fontFamily: '"JetBrains Mono", monospace',
    }}>
      <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: '0.1em' }}>WHOLESALE PRICE</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: priceColor }}>
        {value > 0 ? '+' : ''}{value} <span style={{ fontSize: 14, color: colors.textMuted }}>ct/kWh</span>
        {arrow && <span style={{ marginLeft: 6, color: priceColor }}>{arrow}</span>}
      </div>
    </div>
  );
}

function TimeBadge({ scenario }) {
  return (
    <div style={{
      position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
      background: colors.bg + 'dd', border: `1px solid ${colors.primary}30`,
      borderRadius: 6, padding: '6px 16px',
      fontFamily: '"JetBrains Mono", monospace',
      fontSize: 12, color: colors.textMuted, letterSpacing: '0.1em',
    }}>
      {scenario === 'summer' ? 'JULY 14:00 -- BERLIN' : 'JANUARY 09:00 -- BERLIN'}
    </div>
  );
}

function HomeCounter({ step, scenario }) {
  const count = scenario === 'winter' && step >= 3 ? '12,847' : scenario === 'summer' ? '8,200' : '12,000';
  const responding = (scenario === 'winter' && step >= 2) || (scenario === 'summer' && step >= 2);
  return (
    <div style={{
      position: 'absolute', bottom: 12, right: 12,
      background: colors.bg + 'dd', border: `1px solid ${colors.primary}30`,
      borderRadius: 6, padding: '6px 12px',
      fontFamily: '"JetBrains Mono", monospace',
    }}>
      <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: '0.1em' }}>
        {responding ? 'HOMES RESPONDING' : 'CONNECTED HOMES'}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: responding ? colors.primary : colors.textMuted }}>
        {count}
      </div>
    </div>
  );
}

function GeneratorTrip({ step }) {
  if (step < 1) return null;
  return (
    <div style={{
      position: 'absolute', bottom: 12, left: 12,
      background: colors.bg + 'dd', border: `1px solid ${step >= 4 ? colors.success + '50' : colors.danger + '50'}`,
      borderRadius: 6, padding: '6px 12px',
      fontFamily: '"JetBrains Mono", monospace',
    }}>
      <div style={{ fontSize: 10, color: colors.textMuted, letterSpacing: '0.1em' }}>GENERATOR STATUS</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: step >= 4 ? colors.success : colors.danger }}>
        {step >= 4 ? 'GRID STABILIZED' : 'Schwarze Pumpe -- OFFLINE'}
      </div>
      {step === 1 && <div style={{ fontSize: 11, color: colors.danger }}>-800 MW capacity lost</div>}
    </div>
  );
}

// ── Main Component (pure canvas) ────────────────────────────

export default function VPPScenarioMap({ scenario = 'summer', step = 0, width = 960, height = 340 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const stepRef = useRef(step);
  stepRef.current = step;

  const steps = scenario === 'summer' ? SUMMER_STEPS : WINTER_STEPS;
  const currentStep = steps[Math.min(step, steps.length - 1)];

  // Zoom state for smooth transitions
  const zoomRef = useRef({ lon: 13.4, lat: 52.5, zoom: 8.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      const now = performance.now() / 1000;
      const s = stepRef.current;
      ctx.clearRect(0, 0, width, height);

      // Target view
      const isWideView = scenario === 'winter' && s >= 3;
      const targetLon = 13.4;
      const targetLat = isWideView ? 52.35 : 52.5;
      const targetZoom = isWideView ? 7.0 : 8.5;

      // Smooth zoom transition
      zoomRef.current.lon = lerp(zoomRef.current.lon, targetLon, 0.03);
      zoomRef.current.lat = lerp(zoomRef.current.lat, targetLat, 0.03);
      zoomRef.current.zoom = lerp(zoomRef.current.zoom, targetZoom, 0.03);

      const proj = createProjection(zoomRef.current.lon, zoomRef.current.lat, zoomRef.current.zoom, width, height);

      // Dark background
      ctx.fillStyle = colors.bg;
      ctx.fillRect(0, 0, width, height);

      // Grid overlay
      ctx.strokeStyle = colors.surfaceLight + '08';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // Region boundary (faint Berlin outline — simplified ellipse)
      const [bx, by] = proj.project(13.4, 52.52);
      ctx.strokeStyle = colors.primary + '12';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(bx, by, 80, 50, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Label
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.fillStyle = colors.textDim + '30';
      ctx.textAlign = 'center';
      ctx.fillText('BERLIN', bx, by + 60);

      // Draw home dots
      for (const home of HOMES) {
        const [hx, hy] = proj.project(home.lon, home.lat);
        if (hx < -10 || hx > width + 10 || hy < -10 || hy > height + 10) continue;

        const color = getHomeColor(scenario, s, now, home.id);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(hx, hy, home.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Power plant marker (winter)
      if (scenario === 'winter' && s >= 1) {
        const [px, py] = proj.project(POWER_PLANT.lon, POWER_PLANT.lat);
        const plantColor = s >= 4 ? colors.success : colors.danger;
        const pulse = 0.6 + 0.4 * Math.sin(now * 4);

        // Outer ring
        ctx.strokeStyle = hexToRgba(plantColor, pulse * 0.6);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.stroke();

        // Inner dot
        ctx.fillStyle = hexToRgba(plantColor, 0.8);
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fill();

        // X mark if offline
        if (s < 4) {
          ctx.strokeStyle = colors.danger;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5);
          ctx.moveTo(px + 5, py - 5); ctx.lineTo(px - 5, py + 5);
          ctx.stroke();
        }

        // Label
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = plantColor;
        ctx.textAlign = 'center';
        ctx.fillText(POWER_PLANT.name, px, py + 20);
      }

      // Sun overlay
      const sunAngle = currentStep.sun.angle;
      const sunBrightness = currentStep.sun.brightness;
      if (sunBrightness > 0.1) {
        const arcStartX = 40;
        const arcEndX = width - 40;
        const arcTopY = 15;
        const arcBottomY = height - 10;
        const sunX = arcStartX + sunAngle * (arcEndX - arcStartX);
        const sunY = arcBottomY - Math.sin(sunAngle * Math.PI) * (arcBottomY - arcTopY);
        const sunR = 8 + sunBrightness * 6;

        // Arc path (subtle)
        ctx.save();
        ctx.globalAlpha = sunBrightness * 0.3;
        ctx.strokeStyle = colors.solar;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        for (let t = 0; t <= 1; t += 0.02) {
          const ax = arcStartX + t * (arcEndX - arcStartX);
          const ay = arcBottomY - Math.sin(t * Math.PI) * (arcBottomY - arcTopY);
          if (t === 0) ctx.moveTo(ax, ay);
          else ctx.lineTo(ax, ay);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Sun glow
        const grad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 4);
        grad.addColorStop(0, hexToRgba(colors.solar, sunBrightness * 0.15));
        grad.addColorStop(1, hexToRgba(colors.solar, 0));
        ctx.globalAlpha = 1;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 4, 0, Math.PI * 2);
        ctx.fill();

        // Sun disc
        ctx.fillStyle = hexToRgba(colors.solar, sunBrightness * 0.8);
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.solar;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, scenario, steps, currentStep]);

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', borderRadius: 6 }}>
      <style>{`
        @keyframes vppPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${colors.danger}40; }
          50% { box-shadow: 0 0 12px 4px ${colors.danger}30; }
        }
      `}</style>
      <canvas
        ref={canvasRef}
        style={{ width, height, display: 'block' }}
      />
      {/* HUD overlays */}
      <FrequencyGauge freq={currentStep.freq} />
      <PriceTicker value={currentStep.price.value} trend={currentStep.price.trend} />
      <TimeBadge scenario={scenario} />
      <HomeCounter step={step} scenario={scenario} />
      {scenario === 'winter' && <GeneratorTrip step={step} />}
    </div>
  );
}
