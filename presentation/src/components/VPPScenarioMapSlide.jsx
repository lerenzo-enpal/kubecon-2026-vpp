import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { colors } from '../theme';
import { Corners } from './ui';
import { SUMMER_STEPS, WINTER_STEPS } from './VPPScenarioHomes';
import DuckCurveHUD from './DuckCurveHUD';
import HomeDetailView from './HomeDetailView';

// ── Berlin/Brandenburg residential homes (134K from OSM) ────
let _berlinHomesCache = null;
function loadBerlinHomes() {
  if (_berlinHomesCache) return Promise.resolve(_berlinHomesCache);
  return fetch('/data/berlin-homes.json')
    .then(r => r.json())
    .then(data => { _berlinHomesCache = data; return data; })
    .catch(() => []);
}

// Select VPP homes from real coords — suburban Berlin where rooftop solar is installed
let _berlinVppCache = null;
function selectBerlinVPPHomes(allHomes, count = 600, seed = 73) {
  if (_berlinVppCache) return _berlinVppCache;
  let s = seed;
  const rand = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };

  // Suburban zones where solar is most common (outer Berlin + Brandenburg)
  const zones = [
    { latMin: 52.38, latMax: 52.48, lngMin: 13.08, lngMax: 13.25, weight: 0.15 }, // SW Berlin / Potsdam
    { latMin: 52.50, latMax: 52.60, lngMin: 13.15, lngMax: 13.32, weight: 0.12 }, // Spandau / NW
    { latMin: 52.38, latMax: 52.48, lngMin: 13.50, lngMax: 13.76, weight: 0.12 }, // SE Koepenick
    { latMin: 52.52, latMax: 52.62, lngMin: 13.50, lngMax: 13.70, weight: 0.10 }, // NE Marzahn outskirts
    { latMin: 52.55, latMax: 52.68, lngMin: 13.20, lngMax: 13.50, weight: 0.10 }, // Pankow / Reinickendorf
    { latMin: 52.40, latMax: 52.50, lngMin: 13.25, lngMax: 13.45, weight: 0.10 }, // Zehlendorf / Steglitz
    { latMin: 52.33, latMax: 52.40, lngMin: 13.30, lngMax: 13.60, weight: 0.08 }, // South Brandenburg
    { latMin: 52.44, latMax: 52.54, lngMin: 13.45, lngMax: 13.60, weight: 0.08 }, // Treptow / Neukoelln outer
    { latMin: 52.33, latMax: 52.68, lngMin: 13.08, lngMax: 13.76, weight: 0.15 }, // Metro fill
  ];

  const buckets = zones.map(() => []);
  allHomes.forEach((coord, idx) => {
    const lng = coord[0], lat = coord[1];
    for (let z = 0; z < zones.length; z++) {
      const zone = zones[z];
      if (lat >= zone.latMin && lat <= zone.latMax && lng >= zone.lngMin && lng <= zone.lngMax) {
        buckets[z].push(idx);
        break;
      }
    }
  });

  for (const bucket of buckets) {
    for (let i = bucket.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [bucket[i], bucket[j]] = [bucket[j], bucket[i]];
    }
  }

  const selected = new Set();
  for (let z = 0; z < zones.length; z++) {
    const take = Math.floor(count * zones[z].weight);
    for (let i = 0; i < Math.min(take, buckets[z].length); i++) {
      selected.add(buckets[z][i]);
    }
  }
  let fill = 0;
  while (selected.size < count && fill < allHomes.length) {
    if (!selected.has(fill)) selected.add(fill);
    fill++;
  }

  _berlinVppCache = selected;
  return selected;
}

// ── Target home (zoom-in address: Mario's mother in law. Riemerstraße 5, 13507 Berlin) ──
// Position aligned to reticle crosshair (offset 195px right of map center at zoom 17)
const TARGET_HOME = [13.271603, 52.59247];

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

// ── Fleet revenue counter (animated tick-up) ──
function FleetRevenueCounter({ value }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 1500;
    const tick = (now) => {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * e));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else prevRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  const formatted = display >= 1000
    ? `€${(display / 1000).toFixed(0)}K`
    : `€${display}`;

  return (
    <div style={{
      fontSize: 20, fontWeight: 700, fontFamily: '"JetBrains Mono"',
      color: colors.success,
      textShadow: `0 0 12px ${colors.success}50`,
    }}>
      {formatted}
      <span style={{ fontSize: 10, color: colors.textDim, marginLeft: 4, fontWeight: 400 }}>/ day</span>
    </div>
  );
}

// ── Targeting reticle SVG ──
function TargetingReticle({ visible }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'absolute', top: 'calc(50% - 4px)', left: 'calc(50% + 194px)',
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
  const [allHomes, setAllHomes] = useState(null);

  const slideContext = useContext(SlideContext);
  const slideActive = slideContext?.isSlideActive;

  // Reset on slide enter + boot animation
  useEffect(() => {
    if (slideActive) {
      setStepIndex(0);
      setViewState(steps[0].view);
      setBoot(0);
      loadBerlinHomes().then(setAllHomes);
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

  // Delayed flag for home detail — avoids flash during zoom animation
  const [homeDetailReady, setHomeDetailReady] = useState(false);
  useEffect(() => {
    if (currentStep.showHomeDetail) {
      const t = setTimeout(() => setHomeDetailReady(true), 1200);
      return () => clearTimeout(t);
    }
    setHomeDetailReady(false);
  }, [currentStep.showHomeDetail]);

  // ── VPP home set (selected from real 134K coords) ──
  const vppSet = useMemo(() => {
    if (!allHomes || allHomes.length === 0) return new Set();
    return selectBerlinVPPHomes(allHomes, 600);
  }, [allHomes]);

  const vppHomeData = useMemo(() => {
    if (!allHomes || vppSet.size === 0) return [];
    return [...vppSet].map(idx => allHomes[idx]);
  }, [allHomes, vppSet]);

  // ── DeckGL layers ──
  const layers = useMemo(() => {
    const result = [];
    const phaseColor = PHASE_COLORS[homePhase] || PHASE_COLORS.standby;
    const isAlert = homePhase === 'alert';

    // All Berlin homes (134K background)
    if (allHomes && allHomes.length > 0) {
      result.push(new ScatterplotLayer({
        id: 'all-homes',
        data: allHomes,
        getPosition: d => d,
        getRadius: 80,
        getFillColor: isAlert ? [180, 50, 30, 200]
          : homePhase === 'stable' ? [16, 185, 129, 200]
          : [55, 50, 40, 200],
        radiusMinPixels: 0.5,
        radiusMaxPixels: 2.5,
        transitions: { getFillColor: 800 },
        updateTriggers: { getFillColor: [homePhase] },
      }));
    }

    // VPP homes overlay — same size, elevated, phase-colored
    if (vppHomeData.length > 0) {
      result.push(new ScatterplotLayer({
        id: 'vpp-homes',
        data: vppHomeData,
        getPosition: d => [d[0], d[1], 50],
        getRadius: 80,
        getFillColor: [...phaseColor, isAlert ? 240 : 255],
        radiusMinPixels: 0.5,
        radiusMaxPixels: 2.5,
        transitions: { getFillColor: 800 },
        updateTriggers: { getFillColor: [homePhase] },
      }));
    }

    // Target home — Riemerstraße 5, the house we zoom into
    result.push(new ScatterplotLayer({
      id: 'target-home',
      data: [TARGET_HOME],
      getPosition: d => [d[0], d[1], 50],
      getRadius: 160,
      getFillColor: [...phaseColor, isAlert ? 240 : 255],
      radiusMinPixels: 1,
      radiusMaxPixels: 5,
      transitions: { getFillColor: 800 },
      updateTriggers: { getFillColor: [homePhase] },
    }));

    return result;
  }, [homePhase, allHomes, vppHomeData]);

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
        width: 396, padding: '10px 14px',
        zIndex: 10,
        opacity: bootFade(0.5, 0.5),
        transform: `translateY(${(1 - bootFade(0.5, 0.5)) * -10}px)`,
      }}>
        <Corners color={accentColor + '60'} size={10} />
        {/* Event type badge */}
        <div style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 3,
          background: `${currentStep.highlightColor}18`,
          border: `1px solid ${currentStep.highlightColor}40`,
          fontSize: 10, fontWeight: 700, fontFamily: '"JetBrains Mono"',
          color: currentStep.highlightColor, letterSpacing: '0.08em',
          marginBottom: 6,
        }}>
          {scenario === 'summer' ? 'Energy Arbitrage + Peak Shaving' : currentStep.highlight}
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
          {scenario === 'summer' ? '53,000 HOMES CONNECTED' : '12,000 HOMES CONNECTED'}
          {' -- BERLIN / BRANDENBURG'}
        </div>
      </div>

      {/* ── Top-right: Metrics panel ── */}
      {(() => {
        // Fleet revenue estimate per step (summer scenario):
        // Avg home: 20 kWh battery + 87 kWh EV + 2.8 kW heat pump
        // Charging at negative prices: revenue = |price| × kWh ingested
        // Discharging at peak: revenue = price × kWh exported
        // Step 0-1: no activity (0), Step 2: charging at -13ct (earning ~€2.45/home),
        // Step 3: still charging at -5ct (cumulative ~€3.40), Step 4: discharging at +25ct (+€5 battery),
        // Step 5: total ~€8.40/home × 53,000 = ~€445K fleet
        const fleetRevenue = scenario === 'summer' ? [0, 0, 130000, 180000, 445000, 445000] : null;
        const revenue = fleetRevenue ? fleetRevenue[Math.min(stepIndex, fleetRevenue.length - 1)] : null;
        const priceColor = currentStep.price.value < 0 ? colors.success : currentStep.price.value > 15 ? colors.danger : colors.text;

        return (
          <div style={{
            ...panelBase,
            position: 'absolute', top: 10, right: 10,
            padding: '8px 14px',
            zIndex: 10,
            opacity: bootFade(0.7, 0.5),
            transform: `translateY(${(1 - bootFade(0.7, 0.5)) * -10}px)`,
          }}>
            <Corners color={accentColor + '60'} size={10} />
            {scenario === 'summer' ? (
              <>
                <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono"', color: colors.textDim, letterSpacing: '0.1em' }}>
                  WHOLESALE PRICE
                </div>
                <div style={{
                  fontSize: 24, fontWeight: 700, fontFamily: '"JetBrains Mono"',
                  color: priceColor,
                }}>
                  {currentStep.price.value > 0 ? '+' : ''}{currentStep.price.value}
                  <span style={{ fontSize: 12, color: colors.textMuted, marginLeft: 4 }}>ct/kWh</span>
                </div>
                {/* Fleet revenue counter */}
                {revenue > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${colors.primary}20` }}>
                    <div style={{ fontSize: 9, fontFamily: '"JetBrains Mono"', color: colors.textDim, letterSpacing: '0.1em' }}>
                      FLEET REVENUE
                    </div>
                    <FleetRevenueCounter value={revenue} />
                  </div>
                )}
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
        );
      })()}

      {/* ── Center: Targeting reticle (during zoom) ── */}
      <TargetingReticle visible={showReticle} />

      {/* ── Right: Home detail overlay (during zoom steps) ── */}
      {currentStep.showHomeDetail && currentStep.homeDetail && (
        <div style={{
          ...panelBase,
          position: 'absolute',
          top: '50%', left: 10, transform: 'translateY(-50%)',
          width: 396, padding: '10px 14px',
          zIndex: 14,
          opacity: homeDetailReady ? 1 : 0,
          transition: 'opacity 0.8s ease',
        }}>
          <Corners color={accentColor + '60'} size={10} />
          <HomeDetailView homeDetail={currentStep.homeDetail} showRevenue={scenario === 'summer'} />
        </div>
      )}

      {/* ── Bottom: Duck Curve HUD panel ── */}
      {(() => {
        const isExpanded = stepIndex === steps.length - 1;
        const duckW = isExpanded ? 760 : 366;
        const duckH = isExpanded ? 260 : 120;
        return (
          <div style={{
            ...panelBase,
            position: 'absolute', bottom: 24, left: 10,
            zIndex: 10, padding: isExpanded ? '10px 14px' : '6px 14px',
            opacity: bootFade(1.0, 0.5),
            transform: `translateY(${(1 - bootFade(1.0, 0.5)) * 15}px)`,
            transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1), height 0.8s cubic-bezier(0.4, 0, 0.2, 1), padding 0.8s ease',
            width: isExpanded ? duckW + 30 : 396,
            height: duckH + (isExpanded ? 20 : 12),
            overflow: 'hidden',
          }}>
            <Corners color={accentColor + '40'} size={10} />
            <DuckCurveHUD
              highlightHour={currentStep.duckHighlightHour}
              blend={currentStep.duckBlend}
              scenario={scenario}
              width={duckW}
              height={duckH}
              expanded={isExpanded}
            />
          </div>
        );
      })()}

      {/* ── Step dots ── */}
      <StepIndicator total={STEP_COUNT} current={stepIndex} />
    </div>
  );
}
