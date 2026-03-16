import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { colors } from '../theme';
import { SUMMER_STEPS, WINTER_STEPS } from './VPPScenarioHomes';
import DuckCurveHUD from './DuckCurveHUD';
import HomeDetailView from './HomeDetailView';

// ── Berlin/Brandenburg home clusters ────────────────────────
const BERLIN_CLUSTERS = [
  { lng: 13.405, lat: 52.520, weight: 0.12, spread: 0.015, name: 'Mitte' },
  { lng: 13.440, lat: 52.490, weight: 0.10, spread: 0.012, name: 'Kreuzberg' },
  { lng: 13.305, lat: 52.516, weight: 0.08, spread: 0.018, name: 'Charlottenburg' },
  { lng: 13.350, lat: 52.475, weight: 0.07, spread: 0.014, name: 'Schoeneberg' },
  { lng: 13.460, lat: 52.540, weight: 0.06, spread: 0.012, name: 'Prenzlauer Berg' },
  { lng: 13.510, lat: 52.510, weight: 0.06, spread: 0.015, name: 'Friedrichshain' },
  { lng: 13.380, lat: 52.460, weight: 0.05, spread: 0.012, name: 'Tempelhof' },
  { lng: 13.520, lat: 52.440, weight: 0.05, spread: 0.020, name: 'Neukoelln' },
  { lng: 13.280, lat: 52.540, weight: 0.04, spread: 0.018, name: 'Spandau' },
  { lng: 13.580, lat: 52.480, weight: 0.04, spread: 0.018, name: 'Treptow' },
  // Potsdam & outer suburbs
  { lng: 13.065, lat: 52.395, weight: 0.06, spread: 0.025, name: 'Potsdam' },
  { lng: 13.620, lat: 52.420, weight: 0.05, spread: 0.025, name: 'Koepenick' },
  { lng: 13.250, lat: 52.580, weight: 0.04, spread: 0.030, name: 'Hennigsdorf' },
  { lng: 13.630, lat: 52.560, weight: 0.04, spread: 0.025, name: 'Marzahn' },
  // Outer Brandenburg
  { lng: 13.08, lat: 52.33, weight: 0.05, spread: 0.040, name: 'Brandenburg outskirts' },
  { lng: 13.75, lat: 52.38, weight: 0.04, spread: 0.035, name: 'East Brandenburg' },
  { lng: 13.20, lat: 52.65, weight: 0.03, spread: 0.035, name: 'North Brandenburg' },
  { lng: 13.55, lat: 52.30, weight: 0.02, spread: 0.030, name: 'South Brandenburg' },
];

function generateVPPHomes(count, seed = 73) {
  const homes = [];
  let s = seed;
  const next = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  const gauss = () => {
    const u1 = next(), u2 = next();
    return Math.sqrt(-2 * Math.log(u1 + 0.001)) * Math.cos(2 * Math.PI * u2);
  };

  for (let i = 0; i < count; i++) {
    const r = next();
    let cumulative = 0;
    let cluster = BERLIN_CLUSTERS[0];
    for (const c of BERLIN_CLUSTERS) {
      cumulative += c.weight;
      if (r <= cumulative) { cluster = c; break; }
    }
    const lng = cluster.lng + gauss() * cluster.spread;
    const lat = cluster.lat + gauss() * cluster.spread * 0.7;
    homes.push({ lng, lat, idx: i });
  }
  return homes;
}

const VPP_HOMES = generateVPPHomes(600);

// ── Color constants for DeckGL layers ──
const PHASE_COLORS = {
  solar:     [245, 158, 11],
  hold:      [148, 163, 184],
  charge:    [16, 185, 129],
  discharge: [245, 158, 11],
  standby:   [100, 116, 139],
  alert:     [239, 68, 68],
  respond:   [34, 211, 238],
  stable:    [16, 185, 129],
};

// ── Corner bracket decoration ──
function Corner({ pos, color }) {
  const s = 10;
  const base = { position: 'absolute', width: s, height: s };
  const borders = {
    tl: { top: -1, left: -1, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    tr: { top: -1, right: -1, borderTop: `2px solid ${color}`, borderRight: `2px solid ${color}` },
    bl: { bottom: -1, left: -1, borderBottom: `2px solid ${color}`, borderLeft: `2px solid ${color}` },
    br: { bottom: -1, right: -1, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` },
  };
  return <div style={{ ...base, ...borders[pos] }} />;
}

function Corners({ color }) {
  return <>
    <Corner pos="tl" color={color} />
    <Corner pos="tr" color={color} />
    <Corner pos="bl" color={color} />
    <Corner pos="br" color={color} />
  </>;
}

// ── Targeting reticle SVG ──
function TargetingReticle({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 120, height: 120,
      pointerEvents: 'none', zIndex: 12,
      opacity: visible ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        {/* Outer corners */}
        <path d="M10 2H2V10" stroke={colors.primary} strokeWidth="1.5" opacity="0.6" />
        <path d="M110 2H118V10" stroke={colors.primary} strokeWidth="1.5" opacity="0.6" />
        <path d="M10 118H2V110" stroke={colors.primary} strokeWidth="1.5" opacity="0.6" />
        <path d="M110 118H118V110" stroke={colors.primary} strokeWidth="1.5" opacity="0.6" />
        {/* Crosshair */}
        <line x1="60" y1="20" x2="60" y2="45" stroke={colors.primary} strokeWidth="0.8" opacity="0.4" />
        <line x1="60" y1="75" x2="60" y2="100" stroke={colors.primary} strokeWidth="0.8" opacity="0.4" />
        <line x1="20" y1="60" x2="45" y2="60" stroke={colors.primary} strokeWidth="0.8" opacity="0.4" />
        <line x1="75" y1="60" x2="100" y2="60" stroke={colors.primary} strokeWidth="0.8" opacity="0.4" />
        {/* Center dot */}
        <circle cx="60" cy="60" r="3" fill={colors.primary} opacity="0.5" />
        <circle cx="60" cy="60" r="8" stroke={colors.primary} strokeWidth="0.8" opacity="0.3" />
      </svg>
    </div>
  );
}

// ── Step indicator dots ──
function StepIndicator({ total, current }) {
  return (
    <div style={{
      position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 8, zIndex: 20,
    }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current ? colors.primary : i < current ? colors.primary + '60' : colors.textDim + '40',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

// ── Ease / boot helpers ──
const ease = (t) => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);

// ── Main component ──
export default function VPPScenarioMapSlide({ scenario = 'summer' }) {
  const steps = scenario === 'summer' ? SUMMER_STEPS : WINTER_STEPS;
  const STEP_COUNT = steps.length;

  const [stepIndex, setStepIndex] = useState(0);
  const stepIndexRef = useRef(0);
  stepIndexRef.current = stepIndex;

  const [boot, setBoot] = useState(0);
  const bootRef = useRef(null);
  const [viewState, setViewState] = useState(steps[0].view);

  const slideContext = useContext(SlideContext);
  const slideActive = slideContext?.isSlideActive;

  // Reset on slide enter + boot animation
  useEffect(() => {
    if (slideActive) {
      setStepIndex(0);
      setViewState(steps[0].view);
      setBoot(0);
      const delay = setTimeout(() => {
        const start = performance.now();
        const tick = () => {
          const s = (performance.now() - start) / 1000;
          setBoot(s);
          if (s < 3.5) bootRef.current = requestAnimationFrame(tick);
        };
        bootRef.current = requestAnimationFrame(tick);
      }, 300);
      return () => {
        clearTimeout(delay);
        cancelAnimationFrame(bootRef.current);
      };
    }
  }, [slideActive]);

  // Capture-phase keyboard navigation
  useEffect(() => {
    if (!slideActive) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const cur = stepIndexRef.current;
        if (cur < STEP_COUNT - 1) {
          e.stopPropagation();
          const next = cur + 1;
          setStepIndex(next);
          if (steps[next].view) {
            setViewState({
              ...steps[next].view,
              transitionDuration: 2500,
              transitionInterpolator: new FlyToInterpolator(),
              transitionEasing: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
            });
          }
        }
        // else: let Spectacle handle slide advance
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const cur = stepIndexRef.current;
        if (cur > 0) {
          e.stopPropagation();
          const prev = cur - 1;
          setStepIndex(prev);
          if (steps[prev].view) {
            setViewState({
              ...steps[prev].view,
              transitionDuration: 1500,
              transitionInterpolator: new FlyToInterpolator(),
              transitionEasing: t => 1 - Math.pow(1 - t, 3),
            });
          }
        }
        // else: let Spectacle handle slide back
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [slideActive, STEP_COUNT]);

  const currentStep = steps[stepIndex];
  const homePhase = currentStep.homePhase;
  const isZoomed = (viewState.zoom || 8.5) > 13;
  const showReticle = isZoomed && currentStep.showHomeDetail;

  // ── Home dots data ──
  const homeDots = useMemo(() => {
    const phaseColor = PHASE_COLORS[homePhase] || PHASE_COLORS.standby;
    return VPP_HOMES.map((h) => ({
      position: [h.lng, h.lat],
      color: phaseColor,
      idx: h.idx,
    }));
  }, [homePhase]);

  // ── DeckGL layers ──
  const layers = useMemo(() => {
    const phaseColor = PHASE_COLORS[homePhase] || PHASE_COLORS.standby;
    const isAlert = homePhase === 'alert';
    return [
      new ScatterplotLayer({
        id: 'vpp-homes',
        data: homeDots,
        getPosition: d => d.position,
        getRadius: isAlert ? 600 : homePhase === 'respond' || homePhase === 'discharge' ? 500 : 400,
        getFillColor: d => {
          if (isAlert) {
            // Pulse effect via alternating alpha based on index
            const pulse = d.idx % 3 === 0 ? 220 : 140;
            return [...phaseColor, pulse];
          }
          return [...phaseColor, 180];
        },
        getLineColor: [...phaseColor, 255],
        stroked: homePhase === 'respond' || homePhase === 'discharge',
        lineWidthMinPixels: 1,
        radiusMinPixels: 2,
        radiusMaxPixels: 12,
        transitions: { getFillColor: 600, getRadius: 400 },
        updateTriggers: {
          getFillColor: [homePhase, Date.now() >> 10],
          getRadius: [homePhase],
        },
      }),
    ];
  }, [homeDots, homePhase]);

  // ── Panel styling ──
  const accentColor = homePhase === 'alert' ? colors.danger :
    homePhase === 'respond' ? colors.primary :
    homePhase === 'stable' ? colors.success :
    homePhase === 'discharge' ? colors.accent : colors.primary;

  const panelBase = {
    background: 'rgba(5, 8, 16, 0.92)',
    border: `1px solid ${accentColor}35`,
    boxShadow: `0 0 20px ${accentColor}18, inset 0 0 15px ${accentColor}06`,
    backdropFilter: 'blur(12px)',
    borderRadius: 3,
    position: 'relative',
  };

  const bootFade = (delay, dur = 0.3) => ease((boot - delay) / dur);
  const freq = currentStep.freq + Math.sin(Date.now() / 300) * 0.01;
  const freqColor = freq >= 49.95 ? colors.success : freq >= 49.8 ? colors.accent : colors.danger;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#020408' }}>

      {/* ── Map ── */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>

      {/* ── Scanline overlay ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />

      {/* ── Vignette ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
        boxShadow: 'inset 0 0 120px 40px rgba(2,4,8,0.7)',
      }} />

      {/* ── Danger/success atmosphere ── */}
      {homePhase === 'alert' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.1) 0%, transparent 70%)',
        }} />
      )}
      {homePhase === 'stable' && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(ellipse at center, rgba(16,185,129,0.06) 0%, transparent 70%)',
        }} />
      )}

      {/* ── Boot scan line ── */}
      {boot > 0.08 && boot < 1.5 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, pointerEvents: 'none', zIndex: 15,
          top: `${ease((boot - 0.08) / 1.2) * 110}%`,
          height: 1,
          background: `linear-gradient(90deg, transparent 2%, ${colors.primary}${Math.max(0, Math.floor((0.5 - boot * 0.35) * 255)).toString(16).padStart(2, '0')} 15%, ${colors.primary}${Math.max(0, Math.floor((0.5 - boot * 0.35) * 255)).toString(16).padStart(2, '0')} 85%, transparent 98%)`,
        }} />
      )}

      {/* ── Top-left: Narration panel ── */}
      <div style={{
        ...panelBase,
        position: 'absolute', top: 10, left: 10,
        maxWidth: 380, padding: '10px 14px',
        zIndex: 10,
        opacity: bootFade(0.5, 0.5),
        transform: `translateY(${(1 - bootFade(0.5, 0.5)) * -10}px)`,
      }}>
        <Corners color={accentColor + '60'} />
        {/* Event type badge */}
        <div style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 3,
          background: `${currentStep.highlightColor}18`,
          border: `1px solid ${currentStep.highlightColor}40`,
          fontSize: 10, fontWeight: 700, fontFamily: '"JetBrains Mono"',
          color: currentStep.highlightColor, letterSpacing: '0.08em',
          marginBottom: 6,
        }}>
          {currentStep.highlight}
        </div>
        {/* Narration text */}
        <div style={{
          fontSize: 15, fontFamily: '"Inter"', color: colors.text + 'ee',
          lineHeight: 1.5,
        }}>
          {currentStep.narration}
        </div>
        {/* Home count */}
        <div style={{
          marginTop: 6, fontSize: 10, fontFamily: '"JetBrains Mono"',
          color: colors.textDim,
        }}>
          {scenario === 'summer' ? '8,200 HOMES CONNECTED' : '12,000 HOMES CONNECTED'}
          {' -- BERLIN / BRANDENBURG'}
        </div>
      </div>

      {/* ── Top-right: Metrics panel ── */}
      <div style={{
        ...panelBase,
        position: 'absolute', top: 10, right: 10,
        padding: '8px 14px',
        zIndex: 10,
        opacity: bootFade(0.7, 0.5),
        transform: `translateY(${(1 - bootFade(0.7, 0.5)) * -10}px)`,
      }}>
        <Corners color={accentColor + '60'} />
        {scenario === 'summer' ? (
          <>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono"', color: colors.textDim, letterSpacing: '0.1em' }}>
              WHOLESALE PRICE
            </div>
            <div style={{
              fontSize: 24, fontWeight: 700, fontFamily: '"JetBrains Mono"',
              color: currentStep.price.value < 0 ? colors.success : currentStep.price.value > 15 ? colors.danger : colors.text,
            }}>
              {currentStep.price.value > 0 ? '+' : ''}{currentStep.price.value}
              <span style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>ct/kWh</span>
            </div>
          </>
        ) : (
          <>
            <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono"', color: colors.textDim, letterSpacing: '0.1em' }}>
              GRID FREQUENCY
            </div>
            <div style={{
              fontSize: 24, fontWeight: 700, fontFamily: '"JetBrains Mono"',
              color: freqColor,
              textShadow: `0 0 15px ${freqColor}50`,
            }}>
              {freq.toFixed(2)}
              <span style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>Hz</span>
            </div>
          </>
        )}
      </div>

      {/* ── Center: Targeting reticle (during zoom) ── */}
      <TargetingReticle visible={showReticle} />

      {/* ── Center-right: Home detail overlay (during zoom steps) ── */}
      {currentStep.showHomeDetail && currentStep.homeDetail && (
        <div style={{
          position: 'absolute',
          top: '50%', right: 20,
          transform: 'translateY(-50%)',
          zIndex: 14,
          opacity: isZoomed ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}>
          <HomeDetailView homeDetail={currentStep.homeDetail} />
        </div>
      )}

      {/* ── Bottom: Duck Curve HUD panel ── */}
      <div style={{
        ...panelBase,
        position: 'absolute', bottom: 24, left: 10,
        zIndex: 10, padding: '6px 8px',
        opacity: bootFade(1.0, 0.5),
        transform: `translateY(${(1 - bootFade(1.0, 0.5)) * 15}px)`,
      }}>
        <Corners color={accentColor + '40'} />
        <DuckCurveHUD
          highlightHour={currentStep.duckHighlightHour}
          blend={currentStep.duckBlend}
          scenario={scenario}
          width={380}
          height={120}
        />
      </div>

      {/* ── Step dots ── */}
      <StepIndicator total={STEP_COUNT} current={stepIndex} />
    </div>
  );
}
