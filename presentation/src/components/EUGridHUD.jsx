import React, { useState, useEffect, useContext, useRef } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// ── EU generation hubs with real coordinates ─────────────────
const HUBS = [
  // Iberia
  { id: 'lisbon', pos: [-9.14, 38.74], name: 'Lisbon', cap: 12, type: 'wind' },
  { id: 'madrid', pos: [-3.70, 40.42], name: 'Madrid', cap: 28, type: 'solar' },
  { id: 'barcelona', pos: [2.17, 41.39], name: 'Barcelona', cap: 12, type: 'solar' },
  // France
  { id: 'paris', pos: [2.35, 48.86], name: 'Paris', cap: 55, type: 'nuclear' },
  { id: 'lyon', pos: [4.84, 45.76], name: 'Lyon', cap: 18, type: 'nuclear' },
  { id: 'marseille', pos: [5.37, 43.30], name: 'Marseille', cap: 14, type: 'nuclear' },
  // UK (interconnected)
  { id: 'london', pos: [-0.12, 51.51], name: 'London', cap: 42, type: 'gas' },
  // Benelux
  { id: 'amsterdam', pos: [4.90, 52.37], name: 'Amsterdam', cap: 18, type: 'gas' },
  { id: 'brussels', pos: [4.35, 50.85], name: 'Brussels', cap: 14, type: 'nuclear' },
  // Germany
  { id: 'berlin', pos: [13.40, 52.52], name: 'Berlin', cap: 20, type: 'wind' },
  { id: 'hamburg', pos: [9.99, 53.55], name: 'Hamburg', cap: 15, type: 'wind' },
  { id: 'munich', pos: [11.58, 48.14], name: 'Munich', cap: 22, type: 'solar' },
  { id: 'cologne', pos: [6.96, 50.94], name: 'Cologne', cap: 18, type: 'gas' },
  { id: 'frankfurt', pos: [8.68, 50.11], name: 'Frankfurt', cap: 16, type: 'gas' },
  // Alps
  { id: 'zurich', pos: [8.54, 47.37], name: 'Zurich', cap: 16, type: 'hydro' },
  { id: 'vienna', pos: [16.37, 48.21], name: 'Vienna', cap: 16, type: 'hydro' },
  // Italy
  { id: 'milan', pos: [9.19, 45.46], name: 'Milan', cap: 24, type: 'gas' },
  { id: 'rome', pos: [12.50, 41.90], name: 'Rome', cap: 20, type: 'gas' },
  // Nordic
  { id: 'copenhagen', pos: [12.57, 55.68], name: 'Copenhagen', cap: 10, type: 'wind' },
  { id: 'stockholm', pos: [18.07, 59.33], name: 'Stockholm', cap: 20, type: 'hydro' },
  { id: 'oslo', pos: [10.75, 59.91], name: 'Oslo', cap: 28, type: 'hydro' },
  { id: 'helsinki', pos: [24.94, 60.17], name: 'Helsinki', cap: 12, type: 'nuclear' },
  // Central/Eastern Europe
  { id: 'warsaw', pos: [21.01, 52.23], name: 'Warsaw', cap: 25, type: 'coal' },
  { id: 'prague', pos: [14.42, 50.08], name: 'Prague', cap: 14, type: 'nuclear' },
  { id: 'budapest', pos: [19.04, 47.50], name: 'Budapest', cap: 12, type: 'nuclear' },
  { id: 'bucharest', pos: [26.10, 44.43], name: 'Bucharest', cap: 14, type: 'hydro' },
  // Southeast
  { id: 'athens', pos: [23.73, 37.98], name: 'Athens', cap: 10, type: 'solar' },
  { id: 'istanbul', pos: [29.00, 41.01], name: 'Istanbul', cap: 32, type: 'gas' },
];

// ── Transmission corridors [from, to, capacity (1-10)] ──────
const CORRIDORS = [
  // Iberia
  ['lisbon', 'madrid', 4], ['madrid', 'barcelona', 4],
  // France + cross-border
  ['madrid', 'paris', 6], ['barcelona', 'lyon', 3], ['barcelona', 'marseille', 3],
  ['paris', 'lyon', 7], ['lyon', 'marseille', 5],
  ['paris', 'london', 8], ['paris', 'brussels', 6], ['paris', 'zurich', 5],
  ['lyon', 'milan', 5],
  // Benelux
  ['london', 'amsterdam', 6], ['amsterdam', 'brussels', 4], ['amsterdam', 'hamburg', 5],
  ['brussels', 'cologne', 4],
  // Germany internal
  ['hamburg', 'berlin', 7], ['hamburg', 'cologne', 6],
  ['cologne', 'frankfurt', 8], ['frankfurt', 'munich', 7], ['frankfurt', 'berlin', 8],
  ['berlin', 'warsaw', 4], ['berlin', 'prague', 5], ['berlin', 'copenhagen', 5],
  ['munich', 'zurich', 5], ['munich', 'vienna', 6],
  // Alps + Italy
  ['zurich', 'milan', 5], ['milan', 'rome', 6],
  ['vienna', 'prague', 5], ['vienna', 'budapest', 4],
  // Nordic
  ['copenhagen', 'hamburg', 5], ['copenhagen', 'stockholm', 4],
  ['stockholm', 'oslo', 5], ['stockholm', 'helsinki', 3],
  // Eastern Europe
  ['warsaw', 'prague', 4], ['warsaw', 'budapest', 3],
  ['budapest', 'bucharest', 3], ['budapest', 'vienna', 4],
  // Southeast
  ['rome', 'athens', 3], ['athens', 'istanbul', 4], ['bucharest', 'istanbul', 3],
];

// ── Journey steps: plant → home → region → nation → continent ──
const STEPS = [
  {
    view: { longitude: 11.58, latitude: 48.14, zoom: 11.5, pitch: 50, bearing: -12 },
    title: 'Generation',
    subtitle: 'A power plant near Munich, Bavaria',
    voltage: '10–25 kV',
    detail: 'Fuel → heat → steam → turbine → 50 Hz alternating current',
    visibleIds: null, // none — just the map
  },
  {
    view: { longitude: 11.3, latitude: 48.3, zoom: 9, pitch: 45, bearing: -8 },
    title: 'Step-Up & Transmission',
    subtitle: 'Voltage multiplied 20× for long-distance transport',
    voltage: '220–400 kV',
    detail: 'Transformers step up voltage to minimize losses across hundreds of km',
    visibleIds: ['munich'],
  },
  {
    view: { longitude: 10.8, latitude: 49.0, zoom: 6.5, pitch: 40, bearing: -5 },
    title: 'Regional Grid',
    subtitle: '5 major hubs connected across Southern Germany & Alps',
    voltage: '110–400 kV',
    detail: 'Multiple generation sources — gas, solar, hydro, nuclear — feed the regional network',
    visibleIds: ['munich', 'zurich', 'frankfurt', 'vienna', 'milan', 'prague', 'lyon'],
  },
  {
    view: { longitude: 10.5, latitude: 51.5, zoom: 5.2, pitch: 32, bearing: 0 },
    title: 'National Grid',
    subtitle: 'Germany — Europe\'s largest electricity market, 84M people',
    voltage: 'Full voltage spectrum',
    detail: '230 GW installed. Hamburg wind farms to Bavarian solar, all synchronized at 50 Hz',
    visibleIds: ['munich', 'zurich', 'frankfurt', 'vienna', 'milan', 'prague',
      'lyon', 'berlin', 'hamburg', 'cologne', 'amsterdam', 'brussels',
      'copenhagen', 'paris', 'warsaw'],
  },
  {
    view: { longitude: 12, latitude: 49, zoom: 3.4, pitch: 15, bearing: 0 },
    title: 'The Largest Machine Ever Built',
    subtitle: '36 countries · 400 million people · one frequency',
    voltage: '50.000 Hz',
    detail: '305,000 km of high-voltage lines. 1,100 GW installed capacity. It has never been turned off.',
    visibleIds: null, // all
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

const getHub = (id) => HUBS.find(h => h.id === id);

// ── Main component ──────────────────────────────────────────
export default function EUGridHUD({ width = '100%', height = '100%' }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [boot, setBoot] = useState(0);
  const bootRef = useRef(null);
  const [viewState, setViewState] = useState(STEPS[0].view);
  const [freq, setFreq] = useState(50.0);
  const freqRef = useRef(null);
  const freqHistory = useRef([]);
  const freqCanvasRef = useRef(null);

  const slideContext = useContext(SlideContext);

  // Reset on slide enter
  useEffect(() => {
    if (slideContext?.isSlideActive) {
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
    const tick = () => {
      const now = performance.now();
      const f = 50.0 + Math.sin(now / 600) * 0.008 + Math.sin(now / 170) * 0.002;
      setFreq(f);
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
  }, []);

  const ease = (t) => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
  const bootFade = (delay, dur = 0.4) => ease((boot - delay) / dur);

  // Step navigation
  const goToStep = (idx) => {
    if (idx < 0 || idx >= STEPS.length) return;
    setStepIndex(idx);
    setViewState({
      ...STEPS[idx].view,
      transitionDuration: 2200,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: t => 1 - Math.pow(1 - t, 3),
    });
  };

  const step = STEPS[stepIndex];
  const isLast = stepIndex >= STEPS.length - 1;
  const isFirst = stepIndex === 0;

  // Determine visible hubs and lines
  const allVisible = step.visibleIds === null && stepIndex > 0;
  const visibleHubs = allVisible
    ? HUBS
    : step.visibleIds
      ? HUBS.filter(h => step.visibleIds.includes(h.id))
      : [];

  const visibleLines = CORRIDORS
    .filter(([a, b]) => visibleHubs.some(h => h.id === a) && visibleHubs.some(h => h.id === b))
    .map(([a, b, cap]) => ({ from: getHub(a).pos, to: getHub(b).pos, cap: cap || 3 }));

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
      id: 'line-glow', data: visibleLines,
      getSourcePosition: d => d.from, getTargetPosition: d => d.to,
      getColor: [34, 211, 238, 14], getWidth: d => 4 + d.cap * 1.2,
      widthMinPixels: 2,
    }),
    new LineLayer({
      id: 'lines', data: visibleLines,
      getSourcePosition: d => d.from, getTargetPosition: d => d.to,
      getColor: [34, 211, 238, 90], getWidth: d => 0.5 + d.cap * 0.3,
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
      id: 'labels', data: visibleHubs,
      getPosition: d => d.pos, getText: d => d.name,
      getSize: 12, getColor: [241, 245, 249, 190],
      getTextAnchor: 'middle', getAlignmentBaseline: 'top',
      getPixelOffset: [0, 16], fontFamily: 'Inter',
    }),
  ];

  // Marker for step 0 — show a pulsing dot where the "power plant" is
  if (stepIndex === 0) {
    layers.push(
      new ScatterplotLayer({
        id: 'plant-marker',
        data: [{ pos: [11.58, 48.14] }],
        getPosition: d => d.pos,
        getRadius: 200,
        getFillColor: [167, 139, 250, 200],
        getLineColor: [167, 139, 250, 255],
        stroked: true, lineWidthMinPixels: 2,
        radiusMinPixels: 8, radiusMaxPixels: 14,
      }),
      new TextLayer({
        id: 'plant-label',
        data: [{ pos: [11.58, 48.14], text: 'Power Plant' }],
        getPosition: d => d.pos, getText: d => d.text,
        getSize: 14, getColor: [241, 245, 249, 220],
        getTextAnchor: 'middle', getAlignmentBaseline: 'top',
        getPixelOffset: [0, 20], fontFamily: 'Inter', fontWeight: 600,
      }),
    );
  }

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
        <Map
          mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
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

      {/* ── Navigation — bottom center ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex gap-2" style={{ opacity: bootFade(1.0) }}>
        <button onClick={() => goToStep(stepIndex - 1)} disabled={isFirst} className="rounded font-mono font-semibold text-[20px]" style={{
          background: isFirst ? 'rgba(26,34,54,0.5)' : 'rgba(26,34,54,0.9)',
          border: '1px solid rgba(34,211,238,0.3)',
          color: isFirst ? '#334155' : '#94a3b8',
          padding: '8px 18px',
          cursor: isFirst ? 'default' : 'pointer',
        }}>
          ◂ PREV
        </button>
        {/* Step dots */}
        <div className="flex gap-1.5 items-center rounded px-3" style={{
          background: 'rgba(5,8,16,0.8)',
          border: '1px solid rgba(34,211,238,0.15)',
        }}>
          {STEPS.map((_, i) => (
            <div key={i} onClick={() => goToStep(i)} style={{
              width: 10, height: 10, borderRadius: '50%',
              background: i === stepIndex ? '#22d3ee' : i < stepIndex ? 'rgba(34,211,238,0.4)' : 'rgba(34,211,238,0.15)',
              cursor: 'pointer',
              boxShadow: i === stepIndex ? '0 0 8px rgba(34,211,238,0.5)' : 'none',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>
        <button onClick={() => goToStep(stepIndex + 1)} disabled={isLast} className="rounded font-mono font-semibold text-[20px]" style={{
          background: isLast ? 'rgba(26,34,54,0.5)' : 'rgba(26,34,54,0.9)',
          border: `1px solid ${isLast ? 'rgba(34,211,238,0.15)' : 'rgba(34,211,238,0.3)'}`,
          color: isLast ? '#334155' : '#94a3b8',
          padding: '8px 18px',
          cursor: isLast ? 'default' : 'pointer',
        }}>
          NEXT ▸
        </button>
      </div>

      {/* ── Stats bar — bottom right, appears on final steps ── */}
      {stepIndex >= 3 && (
        <div className="absolute bottom-14 right-4 z-10">
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
      <div className="absolute bottom-14 left-4 z-10" style={{ opacity: bootFade(1.5) }}>
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
