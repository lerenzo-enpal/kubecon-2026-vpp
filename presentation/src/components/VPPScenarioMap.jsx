import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { colors } from '../theme';
import { SUMMER_STEPS, WINTER_STEPS } from './VPPScenarioHomes';

// ── Home locations scattered across Brandenburg/Berlin ────────
function generateHomes(count, seed = 42) {
  const homes = [];
  let s = seed;
  const next = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  // Berlin/Brandenburg bounding box approx
  const lonMin = 12.8, lonMax = 14.2;
  const latMin = 52.1, latMax = 52.9;
  for (let i = 0; i < count; i++) {
    homes.push({
      id: i,
      position: [lonMin + next() * (lonMax - lonMin), latMin + next() * (latMax - latMin)],
      size: 3 + next() * 4,
    });
  }
  return homes;
}

const HOMES = generateHomes(300);

// Power plant location (for winter scenario generator trip)
const POWER_PLANT = { position: [14.5, 51.8], name: 'Schwarze Pumpe' };

// ── View states ──────────────────────────────────────────────
const BERLIN_VIEW = {
  longitude: 13.4,
  latitude: 52.5,
  zoom: 8.5,
  pitch: 0,
  bearing: 0,
};

const BRANDENBURG_VIEW = {
  longitude: 13.4,
  latitude: 52.45,
  zoom: 7.5,
  pitch: 0,
  bearing: 0,
};

// ── Color helpers ────────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

const COLOR_SOLAR = hexToRgb(colors.solar);
const COLOR_PRIMARY = hexToRgb(colors.primary);
const COLOR_DANGER = hexToRgb(colors.danger);
const COLOR_SUCCESS = hexToRgb(colors.success);
const COLOR_DIM = hexToRgb(colors.textDim);

function getHomeColor(scenario, step, time, homeIndex) {
  if (scenario === 'summer') {
    if (step <= 2) {
      // Solar active - amber pulsing
      const pulse = 140 + 60 * Math.sin(time * 2 + homeIndex * 0.3);
      return [...COLOR_SOLAR, pulse];
    }
    if (step === 3) {
      // Discharging - amber/accent
      const pulse = 120 + 80 * Math.sin(time * 3 + homeIndex * 0.2);
      return [...COLOR_SOLAR, pulse];
    }
    // Result
    return [...COLOR_SUCCESS, 140];
  }

  // Winter
  if (step === 0) {
    return [...COLOR_PRIMARY, 100 + 30 * Math.sin(time * 1.5 + homeIndex * 0.4)];
  }
  if (step === 1) {
    // Alert - red flash
    const flash = 100 + 155 * Math.abs(Math.sin(time * 5 + homeIndex * 0.1));
    return [...COLOR_DANGER, flash];
  }
  if (step === 2 || step === 3) {
    // Responding - cyan pulse
    const pulse = 100 + 100 * Math.sin(time * 3 + homeIndex * 0.15);
    return [...COLOR_PRIMARY, pulse];
  }
  // Stable
  return [...COLOR_SUCCESS, 130];
}

// ── HUD Overlays ─────────────────────────────────────────────

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

// Generator trip marker for winter scenario
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

// ── Sun Overlay (Canvas drawn on top of map) ─────────────────

function SunOverlay({ angle, brightness, width, height }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);
    ctx.clearRect(0, 0, width, height);

    // Sun arc: angle 0=horizon-left, 0.5=zenith, 1.0=horizon-right
    const arcStartX = 40;
    const arcEndX = width - 40;
    const arcTopY = 20;
    const arcBottomY = height - 10;

    const sunX = arcStartX + angle * (arcEndX - arcStartX);
    const sunY = arcBottomY - Math.sin(angle * Math.PI) * (arcBottomY - arcTopY);
    const sunR = 10 + brightness * 8;

    // Draw arc path (subtle)
    ctx.strokeStyle = colors.solar + '15';
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
    if (brightness > 0.1) {
      const gradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, sunR * 4);
      const alpha = Math.floor(brightness * 40).toString(16).padStart(2, '0');
      gradient.addColorStop(0, colors.solar + alpha);
      gradient.addColorStop(1, colors.solar + '00');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR * 4, 0, Math.PI * 2);
      ctx.fill();

      // Sun disc
      const discAlpha = Math.floor(brightness * 200).toString(16).padStart(2, '0');
      ctx.fillStyle = colors.solar + discAlpha;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [angle, brightness, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute', top: 0, left: 0,
        width, height, pointerEvents: 'none',
      }}
    />
  );
}

// ── Main Component ───────────────────────────────────────────

export default function VPPScenarioMap({ scenario = 'summer', step = 0, width = 960, height = 340 }) {
  const timeRef = useRef(0);
  const [tick, setTick] = useState(0);
  const animRef = useRef(null);

  const steps = scenario === 'summer' ? SUMMER_STEPS : WINTER_STEPS;
  const currentStep = steps[Math.min(step, steps.length - 1)];

  // Animate tick for pulsing dots
  useEffect(() => {
    const loop = () => {
      timeRef.current = performance.now() / 1000;
      setTick(t => t + 1);
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const time = timeRef.current;

  // View state - zoom out for "thousands respond" step
  const viewState = useMemo(() => {
    const base = (scenario === 'winter' && step >= 3) ? BRANDENBURG_VIEW : BERLIN_VIEW;
    return {
      ...base,
      transitionDuration: 1500,
      transitionInterpolator: new FlyToInterpolator(),
    };
  }, [scenario, step]);

  // Power plant dot (only in winter)
  const plantData = scenario === 'winter' && step >= 1 ? [POWER_PLANT] : [];

  const layers = [
    // Home dots
    new ScatterplotLayer({
      id: 'homes',
      data: HOMES,
      getPosition: d => d.position,
      getRadius: d => d.size,
      getFillColor: d => getHomeColor(scenario, step, time, d.id),
      radiusMinPixels: 2,
      radiusMaxPixels: 7,
      radiusScale: 1,
      updateTriggers: {
        getFillColor: [scenario, step, Math.floor(time * 4)],
      },
    }),
    // Power plant (red X when tripped)
    new ScatterplotLayer({
      id: 'plant',
      data: plantData,
      getPosition: d => d.position,
      getRadius: 12,
      getFillColor: step >= 4 ? [16, 185, 129, 100] : [239, 68, 68, 200],
      getLineColor: step >= 4 ? [16, 185, 129, 200] : [239, 68, 68, 255],
      lineWidthMinPixels: 2,
      stroked: true,
      radiusMinPixels: 8,
      radiusMaxPixels: 14,
      updateTriggers: {
        getFillColor: [step],
        getLineColor: [step],
      },
    }),
  ];

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', borderRadius: 6 }}>
      <style>{`
        @keyframes vppPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${colors.danger}40; }
          50% { box-shadow: 0 0 12px 4px ${colors.danger}30; }
        }
      `}</style>
      <DeckGL
        viewState={viewState}
        controller={false}
        layers={layers}
        style={{ width, height }}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          style={{ width: '100%', height: '100%' }}
          attributionControl={false}
        />
      </DeckGL>

      {/* Sun overlay */}
      <SunOverlay
        angle={currentStep.sun.angle}
        brightness={currentStep.sun.brightness}
        width={width}
        height={height}
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
