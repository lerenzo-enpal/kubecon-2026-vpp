import React, { useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';
// import { ScenegraphLayer } from '@deck.gl/mesh-layers'; // TODO: re-enable when models are properly sized
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStyle } from '../utils/mapStyle';

// ── EU generation hubs with real coordinates ─────────────────
const HUBS = [
  // Iberia
  { id: 'lisbon', pos: [-9.14, 38.74], name: 'Lisbon', cap: 12, type: 'wind' },
  { id: 'madrid', pos: [-3.70, 40.42], name: 'Madrid', cap: 28, type: 'solar' },
  { id: 'barcelona', pos: [2.17, 41.39], name: 'Barcelona', cap: 12, type: 'solar' },
  { id: 'bilbao', pos: [-2.93, 43.26], name: 'Bilbao', cap: 8, type: 'wind' },
  { id: 'seville', pos: [-5.98, 37.39], name: 'Seville', cap: 10, type: 'solar' },
  // France
  { id: 'paris', pos: [2.35, 48.86], name: 'Paris', cap: 55, type: 'nuclear' },
  { id: 'lyon', pos: [4.84, 45.76], name: 'Lyon', cap: 18, type: 'nuclear' },
  { id: 'marseille', pos: [5.37, 43.30], name: 'Marseille', cap: 14, type: 'nuclear' },
  { id: 'toulouse', pos: [1.44, 43.60], name: 'Toulouse', cap: 10, type: 'nuclear' },
  { id: 'bordeaux', pos: [-0.58, 44.84], name: 'Bordeaux', cap: 10, type: 'nuclear' },
  { id: 'strasbourg', pos: [7.75, 48.57], name: 'Strasbourg', cap: 8, type: 'nuclear' },
  // UK & Ireland
  { id: 'london', pos: [-0.12, 51.51], name: 'London', cap: 42, type: 'gas' },
  { id: 'edinburgh', pos: [-3.19, 55.95], name: 'Edinburgh', cap: 12, type: 'wind' },
  { id: 'manchester', pos: [-2.24, 53.48], name: 'Manchester', cap: 14, type: 'gas' },
  { id: 'dublin', pos: [-6.26, 53.35], name: 'Dublin', cap: 8, type: 'wind' },
  // Benelux
  { id: 'amsterdam', pos: [4.90, 52.37], name: 'Amsterdam', cap: 18, type: 'gas' },
  { id: 'brussels', pos: [4.35, 50.85], name: 'Brussels', cap: 14, type: 'nuclear' },
  // Germany
  { id: 'berlin', pos: [13.40, 52.52], name: 'Berlin', cap: 20, type: 'wind' },
  { id: 'hamburg', pos: [9.99, 53.55], name: 'Hamburg', cap: 15, type: 'wind' },
  { id: 'munich', pos: [11.58, 48.14], name: 'Munich', cap: 22, type: 'solar' },
  { id: 'cologne', pos: [6.96, 50.94], name: 'Cologne', cap: 18, type: 'gas' },
  { id: 'frankfurt', pos: [8.68, 50.11], name: 'Frankfurt', cap: 16, type: 'gas' },
  { id: 'stuttgart', pos: [9.18, 48.78], name: 'Stuttgart', cap: 12, type: 'solar' },
  { id: 'leipzig', pos: [12.37, 51.34], name: 'Leipzig', cap: 10, type: 'coal' },
  { id: 'dortmund', pos: [7.47, 51.51], name: 'Dortmund', cap: 14, type: 'coal' },
  // Alps
  { id: 'zurich', pos: [8.54, 47.37], name: 'Zurich', cap: 16, type: 'hydro' },
  { id: 'vienna', pos: [16.37, 48.21], name: 'Vienna', cap: 16, type: 'hydro' },
  { id: 'innsbruck', pos: [11.39, 47.26], name: 'Innsbruck', cap: 8, type: 'hydro' },
  // Italy
  { id: 'milan', pos: [9.19, 45.46], name: 'Milan', cap: 24, type: 'gas' },
  { id: 'rome', pos: [12.50, 41.90], name: 'Rome', cap: 20, type: 'gas' },
  { id: 'naples', pos: [14.27, 40.85], name: 'Naples', cap: 10, type: 'gas' },
  { id: 'turin', pos: [7.69, 45.07], name: 'Turin', cap: 12, type: 'gas' },
  // Nordic
  { id: 'copenhagen', pos: [12.57, 55.68], name: 'Copenhagen', cap: 10, type: 'wind' },
  { id: 'stockholm', pos: [18.07, 59.33], name: 'Stockholm', cap: 20, type: 'hydro' },
  { id: 'oslo', pos: [10.75, 59.91], name: 'Oslo', cap: 28, type: 'hydro' },
  { id: 'helsinki', pos: [24.94, 60.17], name: 'Helsinki', cap: 12, type: 'nuclear' },
  { id: 'gothenburg', pos: [11.97, 57.71], name: 'Gothenburg', cap: 10, type: 'wind' },
  { id: 'bergen', pos: [5.32, 60.39], name: 'Bergen', cap: 14, type: 'hydro' },
  // Central/Eastern Europe
  { id: 'warsaw', pos: [21.01, 52.23], name: 'Warsaw', cap: 25, type: 'coal' },
  { id: 'prague', pos: [14.42, 50.08], name: 'Prague', cap: 14, type: 'nuclear' },
  { id: 'budapest', pos: [19.04, 47.50], name: 'Budapest', cap: 12, type: 'nuclear' },
  { id: 'bucharest', pos: [26.10, 44.43], name: 'Bucharest', cap: 14, type: 'hydro' },
  { id: 'krakow', pos: [19.94, 50.06], name: 'Krakow', cap: 10, type: 'coal' },
  { id: 'bratislava', pos: [17.11, 48.15], name: 'Bratislava', cap: 8, type: 'nuclear' },
  { id: 'zagreb', pos: [15.98, 45.81], name: 'Zagreb', cap: 6, type: 'hydro' },
  { id: 'belgrade', pos: [20.46, 44.82], name: 'Belgrade', cap: 10, type: 'coal' },
  { id: 'sofia', pos: [23.32, 42.70], name: 'Sofia', cap: 8, type: 'nuclear' },
  // Southeast
  { id: 'athens', pos: [23.73, 37.98], name: 'Athens', cap: 10, type: 'solar' },
  { id: 'istanbul', pos: [29.00, 41.01], name: 'Istanbul', cap: 32, type: 'gas' },
  // Baltics
  { id: 'riga', pos: [24.11, 56.95], name: 'Riga', cap: 6, type: 'gas' },
  { id: 'vilnius', pos: [25.28, 54.69], name: 'Vilnius', cap: 6, type: 'gas' },
  { id: 'tallinn', pos: [24.75, 59.44], name: 'Tallinn', cap: 5, type: 'wind' },
];

// ── Transmission corridors [from, to, capacity (1-10)] ──────
const CORRIDORS = [
  // Iberia
  ['lisbon', 'madrid', 4], ['lisbon', 'seville', 3], ['seville', 'madrid', 4],
  ['madrid', 'barcelona', 4], ['madrid', 'bilbao', 3], ['bilbao', 'bordeaux', 3],
  // France + cross-border
  ['madrid', 'toulouse', 4], ['barcelona', 'marseille', 3], ['barcelona', 'toulouse', 3],
  ['toulouse', 'bordeaux', 4], ['toulouse', 'marseille', 4], ['toulouse', 'lyon', 4],
  ['bordeaux', 'paris', 5], ['paris', 'lyon', 7], ['lyon', 'marseille', 5],
  ['paris', 'london', 8], ['paris', 'brussels', 6], ['paris', 'strasbourg', 5],
  ['strasbourg', 'zurich', 4], ['strasbourg', 'frankfurt', 4], ['strasbourg', 'cologne', 3],
  ['lyon', 'turin', 4], ['lyon', 'zurich', 4],
  // UK & Ireland
  ['london', 'manchester', 5], ['manchester', 'edinburgh', 4],
  ['dublin', 'manchester', 3], ['dublin', 'edinburgh', 3],
  ['london', 'amsterdam', 6],
  // Benelux
  ['amsterdam', 'brussels', 4], ['amsterdam', 'hamburg', 5],
  ['brussels', 'cologne', 4],
  // Germany internal
  ['hamburg', 'berlin', 7], ['hamburg', 'cologne', 6], ['hamburg', 'dortmund', 5],
  ['cologne', 'dortmund', 5], ['cologne', 'frankfurt', 8], ['dortmund', 'frankfurt', 5],
  ['frankfurt', 'stuttgart', 6], ['frankfurt', 'leipzig', 5], ['frankfurt', 'berlin', 8],
  ['stuttgart', 'munich', 5], ['leipzig', 'berlin', 5], ['leipzig', 'prague', 4],
  ['berlin', 'warsaw', 4], ['berlin', 'prague', 5], ['berlin', 'copenhagen', 5],
  ['munich', 'zurich', 5], ['munich', 'innsbruck', 4], ['munich', 'vienna', 6],
  // Alps + Italy
  ['zurich', 'innsbruck', 4], ['innsbruck', 'vienna', 4], ['innsbruck', 'milan', 4],
  ['zurich', 'milan', 5], ['turin', 'milan', 5], ['milan', 'rome', 6],
  ['rome', 'naples', 4],
  ['vienna', 'prague', 5], ['vienna', 'bratislava', 4], ['vienna', 'budapest', 4],
  // Nordic
  ['copenhagen', 'hamburg', 5], ['copenhagen', 'gothenburg', 4], ['copenhagen', 'stockholm', 4],
  ['gothenburg', 'oslo', 4], ['gothenburg', 'stockholm', 4],
  ['oslo', 'bergen', 5], ['oslo', 'stockholm', 5],
  ['stockholm', 'helsinki', 3],
  // Baltics
  ['helsinki', 'tallinn', 3], ['tallinn', 'riga', 3], ['riga', 'vilnius', 3],
  ['vilnius', 'warsaw', 3],
  // Central/Eastern Europe
  ['warsaw', 'prague', 4], ['warsaw', 'krakow', 4],
  ['krakow', 'bratislava', 3], ['krakow', 'budapest', 3],
  ['bratislava', 'budapest', 4], ['budapest', 'zagreb', 3],
  ['budapest', 'belgrade', 3], ['budapest', 'bucharest', 3],
  ['zagreb', 'vienna', 3], ['zagreb', 'milan', 3],
  ['belgrade', 'bucharest', 3], ['belgrade', 'sofia', 3],
  // Southeast
  ['naples', 'athens', 3], ['sofia', 'athens', 3],
  ['athens', 'istanbul', 4], ['bucharest', 'istanbul', 3], ['sofia', 'istanbul', 3],
];

// ── Journey steps: focused on continental breadth of infrastructure ──
const STEPS = [
  {
    view: { longitude: 12, latitude: 49, zoom: 3.4, pitch: 15, bearing: 0 },
    title: 'Continental Infrastructure',
    subtitle: '36 countries connected by 305,000 km of high-voltage lines',
    voltage: '50.000 Hz',
    detail: 'From Lisbon to Helsinki, every node synchronized on one frequency.',
    visibleIds: null, // all
  },
  {
    view: { longitude: 3, latitude: 46, zoom: 4.5, pitch: 20, bearing: 5 },
    title: 'Western Corridor',
    subtitle: 'France, Iberia, UK — nuclear, wind, and solar feeding into the backbone',
    voltage: '400 kV',
    detail: 'France alone exports 50+ TWh/yr to neighbors. One cable under the Channel connects two grids.',
    visibleIds: ['lisbon', 'madrid', 'barcelona', 'bilbao', 'seville', 'paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'strasbourg', 'london', 'edinburgh', 'manchester', 'dublin', 'amsterdam', 'brussels'],
  },
  {
    view: { longitude: 18, latitude: 52, zoom: 4.5, pitch: 20, bearing: -5 },
    title: 'Eastern Corridor',
    subtitle: 'Central and Eastern Europe — coal, nuclear, and growing renewables',
    voltage: '220–400 kV',
    detail: 'Poland, Czechia, Hungary, Romania — the grid reaches every corner of the continent.',
    visibleIds: ['berlin', 'hamburg', 'munich', 'cologne', 'frankfurt', 'warsaw', 'prague', 'budapest', 'bucharest', 'krakow', 'bratislava', 'zagreb', 'belgrade', 'sofia', 'vienna', 'leipzig', 'dortmund', 'stuttgart', 'copenhagen', 'riga', 'vilnius', 'tallinn'],
  },
];

const TYPE_COLORS = {
  wind: [96, 165, 250],
  solar: [245, 158, 11],
  nuclear: [167, 139, 250],
  gas: [251, 146, 60],
  coal: [148, 163, 184],
  hydro: [34, 211, 238],
};

const HUB_MAP = new Map(HUBS.map(h => [h.id, h]));
const getHub = (id) => HUB_MAP.get(id);

// Only label major energy cities to avoid overlap in dense regions
const LABELED_HUBS = new Set([
  'lisbon', 'madrid', 'paris', 'london', 'berlin', 'munich',
  'hamburg', 'rome', 'milan', 'oslo', 'stockholm', 'helsinki',
  'warsaw', 'vienna', 'athens', 'istanbul', 'dublin', 'copenhagen',
  'bucharest', 'edinburgh', 'bergen', 'vilnius',
]);

const FLY_TO = new FlyToInterpolator();

// ── Main component ──────────────────────────────────────────
export default function EUGridHUD({ width = '100%', height = '100%' }) {
  const mapStyle = useMapStyle('europe', 'nolabels');
  const [stepIndex, setStepIndex] = useState(0);
  const [boot, setBoot] = useState(0);
  const bootRef = useRef(null);
  const [viewState, setViewState] = useState(STEPS[0].view);
  const [freq, setFreq] = useState(50.0);
  const freqRef = useRef(null);
  const freqHistory = useRef([]);
  const freqCanvasRef = useRef(null);

  const stepIndexRef = useRef(0);
  const slideContext = useContext(SlideContext);

  // Reset on slide enter
  useEffect(() => {
    if (slideContext?.isSlideActive) {
      stepIndexRef.current = 0;
      setStepIndex(0);
      setViewState(STEPS[0].view);
      setBoot(0);
      const delay = setTimeout(() => {
        const start = performance.now();
        const tick = () => {
          const s = (performance.now() - start) / 1000;
          setBoot(s);
          if (s < 3.0) bootRef.current = requestAnimationFrame(tick);
        };
        bootRef.current = requestAnimationFrame(tick);
      }, 400);
      return () => { clearTimeout(delay); cancelAnimationFrame(bootRef.current); };
    }
  }, [slideContext?.isSlideActive]);

  // Frequency ticker + line chart
  useEffect(() => {
    if (!slideContext?.isSlideActive) return;
    let lastStateUpdate = 0;
    const tick = () => {
      const now = performance.now();
      const f = 50.0 + Math.sin(now / 600) * 0.008 + Math.sin(now / 170) * 0.002;
      // Throttle React state updates to ~15fps (66ms)
      if (now - lastStateUpdate > 66) {
        setFreq(f);
        lastStateUpdate = now;
      }
      freqHistory.current.push(f);
      if (freqHistory.current.length > 120) freqHistory.current.shift();
      // Draw mini line chart
      const canvas = freqCanvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        const w = 140, h = 36;
        canvas.width = w * 2; canvas.height = h * 2;
        ctx.scale(2, 2);
        ctx.clearRect(0, 0, w, h);
        const hist = freqHistory.current;
        if (hist.length > 2) {
          const min = 49.985, max = 50.015;
          ctx.beginPath();
          hist.forEach((v, i) => {
            const x = (i / (hist.length - 1)) * w;
            const y = h - ((v - min) / (max - min)) * h;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          });
          ctx.strokeStyle = 'rgba(34,211,238,0.5)';
          ctx.lineWidth = 1;
          ctx.stroke();
          // 50 Hz reference line
          const refY = h - ((50.0 - min) / (max - min)) * h;
          ctx.beginPath();
          ctx.moveTo(0, refY); ctx.lineTo(w, refY);
          ctx.strokeStyle = 'rgba(34,211,238,0.15)';
          ctx.lineWidth = 0.5;
          ctx.setLineDash([3, 3]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }
      freqRef.current = requestAnimationFrame(tick);
    };
    freqRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(freqRef.current);
  }, [slideContext?.isSlideActive]);

  const ease = (t) => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
  const bootFade = (delay, dur = 0.4) => ease((boot - delay) / dur);

  // Step navigation
  const goToStep = useCallback((idx) => {
    if (idx < 0 || idx >= STEPS.length) return;
    stepIndexRef.current = idx;
    setStepIndex(idx);
    setViewState({
      ...STEPS[idx].view,
      transitionDuration: 2200,
      transitionInterpolator: FLY_TO,
      transitionEasing: t => 1 - Math.pow(1 - t, 3),
    });
  }, []);

  // Arrow key navigation — intercept when this slide is active
  useEffect(() => {
    if (!slideContext?.isSlideActive) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const next = stepIndexRef.current + 1;
        if (next < STEPS.length) {
          e.stopPropagation();
          goToStep(next);
        }
        // at last step: let Spectacle advance to next slide
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const prev = stepIndexRef.current - 1;
        if (prev >= 0) {
          e.stopPropagation();
          goToStep(prev);
        }
        // at step 0: let Spectacle go to previous slide
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [slideContext?.isSlideActive, goToStep]);

  const step = STEPS[stepIndex];
  const isLast = stepIndex >= STEPS.length - 1;
  const isFirst = stepIndex === 0;

  // Determine visible hubs and lines
  const visibleHubs = useMemo(() => {
    const allVisible = step.visibleIds === null && stepIndex > 0;
    if (allVisible) return HUBS;
    if (step.visibleIds) return HUBS.filter(h => step.visibleIds.includes(h.id));
    return [];
  }, [stepIndex]);

  const visibleLines = useMemo(() => {
    return CORRIDORS
      .filter(([a, b]) => visibleHubs.some(h => h.id === a) && visibleHubs.some(h => h.id === b))
      .map(([a, b, cap]) => ({ from: getHub(a).pos, to: getHub(b).pos, cap: cap || 3 }));
  }, [visibleHubs]);

  // ── Animated particles flowing along corridors ──
  const now = performance.now();
  const particles = [];
  const PARTICLES_PER_LINE = 3;
  visibleLines.forEach((line, li) => {
    for (let p = 0; p < PARTICLES_PER_LINE; p++) {
      const speed = 0.00012 + (line.cap / 10) * 0.00006;
      const offset = p / PARTICLES_PER_LINE;
      const t = ((now * speed + offset + li * 0.17) % 1.0);
      particles.push({
        pos: [
          line.from[0] + (line.to[0] - line.from[0]) * t,
          line.from[1] + (line.to[1] - line.from[1]) * t,
        ],
        cap: line.cap,
      });
    }
  });

  // ── Deck.gl layers ──
  const layers = [
    new LineLayer({
      id: 'lines', data: visibleLines,
      getSourcePosition: d => d.from, getTargetPosition: d => d.to,
      getColor: [34, 211, 238, 90], getWidth: d => 0.3 + d.cap * 0.15,
      widthMinPixels: 1,
    }),
    new ScatterplotLayer({
      id: 'particles', data: particles,
      getPosition: d => d.pos,
      getRadius: 1200,
      getFillColor: [34, 211, 238, 200],
      radiusMinPixels: 2, radiusMaxPixels: 4,
    }),
    new ScatterplotLayer({
      id: 'hubs', data: visibleHubs,
      getPosition: d => d.pos,
      getRadius: d => 4000 + d.cap * 1200,
      getFillColor: d => [...TYPE_COLORS[d.type], 170],
      getLineColor: d => [...TYPE_COLORS[d.type], 255],
      stroked: true, lineWidthMinPixels: 2,
      radiusMinPixels: 5, radiusMaxPixels: 22,
      transitions: { getFillColor: 400, getRadius: 400 },
    }),
    new TextLayer({
      id: 'labels', data: visibleHubs.filter(h => LABELED_HUBS.has(h.id)),
      getPosition: d => d.pos, getText: d => d.name,
      getSize: 12, getColor: [241, 245, 249, 190],
      getTextAnchor: 'middle', getAlignmentBaseline: 'top',
      getPixelOffset: [0, 16], fontFamily: 'Inter',
    }),
  ];

  // TODO: 3D models on map — ScenegraphLayer experiment
  // Models need proper sizing/orientation for DeckGL coordinate system
  // Optimized GLBs available in /models/ (coal_plant_opt.glb = 537KB, gas_plant_opt.glb = 3.3MB)

  // (Power plant marker removed — no longer starting at single-plant zoom)

  const borderClr = 'rgba(34,211,238,0.3)';
  const glow = '#22d3ee';

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', background: '#020408' }}>
      {/* ── Map ── */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', inset: 0 }}
      >
        <MapGL
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>

      {/* ── Scanlines ── */}
      <div className="absolute inset-0 pointer-events-none z-[5]" style={{
        background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
      }} />

      {/* ── Vignette ── */}
      <div className="absolute inset-0 pointer-events-none z-[4]" style={{
        boxShadow: 'inset 0 0 150px 60px rgba(2,4,8,0.75)',
      }} />

      {/* ── Step info panel — top left ── */}
      <div className="absolute top-4 left-4 z-10" style={{ opacity: bootFade(0.5) }}>
        <div className="rounded p-5 max-w-[380px]" style={{
          background: 'rgba(5, 8, 16, 0.92)',
          border: `1px solid ${borderClr}`,
          boxShadow: `0 0 20px ${glow}18`,
        }}>
          <div className="text-[20px] font-mono text-hud-text-dim tracking-[0.15em] uppercase mb-2">
            STEP {stepIndex + 1} / {STEPS.length}
          </div>
          <div className="text-[28px] font-bold font-sans text-hud-text mb-1">
            {step.title}
          </div>
          <div className="text-[20px] font-sans text-hud-text-muted mb-3 leading-snug">
            {step.subtitle}
          </div>
          {/* Voltage badge */}
          <div className="inline-block rounded px-2.5 py-1 text-[20px] font-mono font-semibold text-hud-primary mb-2" style={{
            background: 'rgba(34, 211, 238, 0.08)',
            border: '1px solid rgba(34, 211, 238, 0.25)',
          }}>
            {step.voltage}
          </div>
          <div className="text-[20px] font-sans text-hud-text-dim leading-snug mt-2">
            {step.detail}
          </div>
        </div>
      </div>

      {/* ── Frequency readout — top right ── */}
      <div className="absolute top-4 right-4 z-10 text-right" style={{ opacity: bootFade(0.8) }}>
        <div className="rounded p-2.5 flex items-center gap-2.5" style={{
          background: 'rgba(5,8,16,0.85)',
          border: `1px solid ${borderClr}`,
          boxShadow: `0 0 15px ${glow}12`,
        }}>
          <canvas ref={freqCanvasRef} style={{ width: 140, height: 36 }} />
          <div className="text-[20px] font-mono font-semibold text-hud-primary" style={{
            textShadow: '0 0 12px rgba(34,211,238,0.2)',
          }}>
            {freq.toFixed(3)}<span className="text-hud-text-dim ml-0.5">Hz</span>
          </div>
        </div>
      </div>


      {/* ── Stats bar — bottom right, appears on final steps ── */}
      {stepIndex >= 0 && (
        <div className="absolute bottom-4 right-4 z-10">
          <div className="flex gap-4 rounded p-3" style={{
            background: 'rgba(5,8,16,0.92)',
            border: `1px solid ${borderClr}`,
            boxShadow: `0 0 20px ${glow}18`,
          }}>
            {[
              { value: '305K', unit: 'km', label: 'HV Lines' },
              { value: '400M', unit: '', label: 'People' },
              { value: '1,100', unit: 'GW', label: 'Capacity' },
              { value: '36', unit: '', label: 'Countries' },
            ].map((s, i) => (
              <div key={i} className="text-center min-w-[70px]">
                <div className="text-[20px] font-mono font-bold text-hud-primary">
                  {s.value}<span className="text-[20px] text-hud-text-muted ml-0.5">{s.unit}</span>
                </div>
                <div className="text-[20px] font-mono text-hud-text-dim tracking-[0.05em]">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Legend — bottom left ── */}
      <div className="absolute bottom-4 left-4 z-10" style={{ opacity: bootFade(1.5) }}>
        <div className="flex gap-3 rounded p-2.5" style={{
          background: 'rgba(5,8,16,0.85)',
          border: '1px solid rgba(34,211,238,0.12)',
        }}>
          {[
            { c: 'rgb(96,165,250)', l: 'Wind' },
            { c: 'rgb(251,146,60)', l: 'Gas' },
            { c: 'rgb(167,139,250)', l: 'Nuclear' },
            { c: 'rgb(34,211,238)', l: 'Hydro' },
            { c: 'rgb(245,158,11)', l: 'Solar' },
            { c: 'rgb(148,163,184)', l: 'Coal' },
          ].map(({ c, l }) => (
            <div key={l} className="flex items-center gap-1.5">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
              <span className="text-[20px] font-mono text-hud-text-dim">{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
