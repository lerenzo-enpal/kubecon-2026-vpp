// Berlin VPP Fleet: Daily Energy Arbitrage + Peak Shaving Exhibit
// Shows how 500 homes earn revenue through price spread in a single day cycle.
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// ── Seeded PRNG ──────────────────────────────────────────────
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// ── Generate 500 home positions across Berlin residential districts ──
function generateBerlinHomes(count: number, seed = 42): [number, number][] {
  const rand = seededRandom(seed);
  const homes: [number, number][] = [];

  // Berlin residential districts with approximate bounding boxes
  const districts: { name: string; lngMin: number; lngMax: number; latMin: number; latMax: number; weight: number }[] = [
    { name: 'Pankow',          lngMin: 13.38, lngMax: 13.48, latMin: 52.55, latMax: 52.60, weight: 0.14 },
    { name: 'Reinickendorf',   lngMin: 13.30, lngMax: 13.40, latMin: 52.56, latMax: 52.61, weight: 0.10 },
    { name: 'Spandau',         lngMin: 13.16, lngMax: 13.26, latMin: 52.52, latMax: 52.57, weight: 0.08 },
    { name: 'Steglitz',        lngMin: 13.28, lngMax: 13.38, latMin: 52.43, latMax: 52.48, weight: 0.10 },
    { name: 'Tempelhof',       lngMin: 13.36, lngMax: 13.44, latMin: 52.44, latMax: 52.48, weight: 0.08 },
    { name: 'Neukoelln',       lngMin: 13.40, lngMax: 13.50, latMin: 52.44, latMax: 52.49, weight: 0.08 },
    { name: 'Treptow',         lngMin: 13.44, lngMax: 13.56, latMin: 52.44, latMax: 52.50, weight: 0.08 },
    { name: 'Marzahn',         lngMin: 13.52, lngMax: 13.62, latMin: 52.53, latMax: 52.58, weight: 0.06 },
    { name: 'Lichtenberg',     lngMin: 13.46, lngMax: 13.54, latMin: 52.50, latMax: 52.54, weight: 0.06 },
    { name: 'Charlottenburg',  lngMin: 13.26, lngMax: 13.34, latMin: 52.50, latMax: 52.54, weight: 0.08 },
    { name: 'Wedding',         lngMin: 13.33, lngMax: 13.40, latMin: 52.54, latMax: 52.57, weight: 0.06 },
    { name: 'Kopenick',        lngMin: 13.56, lngMax: 13.68, latMin: 52.42, latMax: 52.48, weight: 0.08 },
  ];

  for (const d of districts) {
    const n = Math.round(count * d.weight);
    for (let i = 0; i < n; i++) {
      const lng = d.lngMin + rand() * (d.lngMax - d.lngMin);
      const lat = d.latMin + rand() * (d.latMax - d.latMin);
      homes.push([lng, lat]);
    }
  }
  // Fill to count
  while (homes.length < count) {
    const lng = 13.2 + rand() * 0.4;
    const lat = 52.44 + rand() * 0.16;
    homes.push([lng, lat]);
  }
  return homes.slice(0, count);
}

// ── Landmarks for context ────────────────────────────────────
const LANDMARKS = [
  { pos: [13.4130, 52.5215], name: 'Alexanderplatz' },
  { pos: [13.3690, 52.5250], name: 'Hauptbahnhof' },
  { pos: [13.3777, 52.5163], name: 'Brandenburger Tor' },
  { pos: [13.2870, 52.5540], name: 'Tegel' },
  { pos: [13.5050, 52.4755], name: 'Adlershof' },
];

// ── Price curve: 24h spot price (EUR/MWh) ────────────────────
// Realistic German day-ahead price curve for a sunny summer day
const PRICE_CURVE: number[] = [
  35, 32, 28, 25, 22, 20,   // 00:00-05:00 overnight low (wind)
  25, 40, 55, 45, 30, 15,   // 06:00-11:00 morning ramp, solar starts
  5,  -5, 10, 35, 65, 120,  // 12:00-17:00 midday dip, afternoon climb
  180, 160, 100, 70, 50, 40, // 18:00-23:00 evening peak then decline
];

// ── 6 steps of the daily cycle ───────────────────────────────
interface DayStep {
  time: string;
  hour: number;
  label: string;
  detail: string;
  homeColor: [number, number, number]; // RGB
  homeAlpha: number;
  priceHighlight: number; // EUR/MWh at this moment
  terminalLogs: string[];
  batteryLevel: number; // 0-1
  phase: 'charging' | 'full' | 'discharging' | 'standby';
}

const STEPS: DayStep[] = [
  {
    time: '06:00',
    hour: 6,
    label: 'MORNING -- CHEAP WIND ENERGY',
    detail: 'Overnight wind energy keeps prices low. Flexa signals fleet: begin charging.',
    homeColor: [59, 130, 246],  // blue
    homeAlpha: 200,
    priceHighlight: 20,
    terminalLogs: [
      '06:00 FLEXA > PRICE SIGNAL: EUR 20/MWh -- LOW',
      '06:01 FLEXA > DISPATCH: CHARGE ALL BATTERIES',
      '06:01 FLEET > 500 HOMES ACKNOWLEDGED -- CHARGING',
      '06:05 FLEET > AVG SOC: 15% -- GRID IMPORT: 2.5 MW',
    ],
    batteryLevel: 0.15,
    phase: 'charging',
  },
  {
    time: '10:00',
    hour: 10,
    label: 'MID-MORNING -- SOLAR RISING',
    detail: 'Solar generation ramping. Batteries at 60%, homes self-consuming.',
    homeColor: [16, 185, 129],  // green
    homeAlpha: 220,
    priceHighlight: 30,
    terminalLogs: [
      '10:00 FLEXA > SOLAR FORECAST: 8.2 kWp AVG/HOME',
      '10:01 FLEET > AVG SOC: 60% -- SELF-CONSUMING',
      '10:05 FLEXA > PRICE SIGNAL: EUR 30/MWh -- MODERATE',
      '10:10 FLEET > SOLAR COVERS 95% OF HOME LOAD',
    ],
    batteryLevel: 0.60,
    phase: 'charging',
  },
  {
    time: '13:00',
    hour: 13,
    label: 'PEAK SOLAR -- BATTERIES FULL',
    detail: 'Solar floods the grid. Prices dip negative. Batteries full, excess sold to grid at midday rates.',
    homeColor: [16, 185, 129],  // bright green
    homeAlpha: 255,
    priceHighlight: -5,
    terminalLogs: [
      '13:00 FLEXA > PRICE SIGNAL: EUR -5/MWh -- NEGATIVE',
      '13:01 FLEET > AVG SOC: 95% -- BATTERIES FULL',
      '13:02 FLEXA > DISPATCH: EXPORT EXCESS TO GRID',
      '13:05 FLEET > GRID EXPORT: 1.8 MW -- EARNING AT NEG PRICE',
    ],
    batteryLevel: 0.95,
    phase: 'full',
  },
  {
    time: '16:00',
    hour: 16,
    label: 'SOLAR FADING -- PRICES CLIMBING',
    detail: 'Solar production declining. Prices climbing toward evening peak. Flexa pre-positions fleet for discharge.',
    homeColor: [245, 158, 11],  // amber/gold
    homeAlpha: 180,
    priceHighlight: 65,
    terminalLogs: [
      '16:00 FLEXA > PRICE FORECAST: PEAK AT 18:00',
      '16:01 FLEXA > PRE-POSITION: HOLD SOC > 90%',
      '16:05 FLEET > AVG SOC: 92% -- READY FOR DISPATCH',
      '16:10 FLEXA > STANDBY FOR EVENING DISCHARGE',
    ],
    batteryLevel: 0.92,
    phase: 'standby',
  },
  {
    time: '18:00',
    hour: 18,
    label: 'EVENING PEAK -- EUR 180/MWh',
    detail: '500 homes discharge simultaneously. Fleet injects 2.5 MW into the grid at peak prices.',
    homeColor: [245, 158, 11],  // bright amber
    homeAlpha: 255,
    priceHighlight: 180,
    terminalLogs: [
      '18:00 FLEXA > PRICE SIGNAL: EUR 180/MWh -- PEAK',
      '18:00 FLEXA > DISPATCH: DISCHARGE ALL BATTERIES',
      '18:01 FLEET > 500 HOMES DISCHARGING -- 5 kW EACH',
      '18:02 FLEET > GRID EXPORT: 2.5 MW -- PEAK SHAVING',
    ],
    batteryLevel: 0.60,
    phase: 'discharging',
  },
  {
    time: '21:00',
    hour: 21,
    label: 'PEAK OVER -- EUR 2.40/HOME EARNED',
    detail: 'Evening peak over. Batteries at 30%. Fleet earned EUR 2.40/home from price spread today.',
    homeColor: [100, 116, 139],  // muted grey
    homeAlpha: 160,
    priceHighlight: 70,
    terminalLogs: [
      '21:00 FLEXA > PEAK WINDOW CLOSED',
      '21:01 FLEET > AVG SOC: 30% -- DISCHARGE COMPLETE',
      '21:02 FLEXA > DAILY REVENUE: EUR 1,200 (500 HOMES)',
      '21:05 FLEXA > PER-HOME REVENUE: EUR 2.40/DAY',
    ],
    batteryLevel: 0.30,
    phase: 'standby',
  },
];

// ── HUD Corner brackets ──────────────────────────────────────
function Corners({ color = 'rgba(34,211,238,0.3)', size = 10 }: { color?: string; size?: number }) {
  const s: React.CSSProperties = { position: 'absolute', width: size, height: size };
  const b = `2px solid ${color}`;
  return (
    <>
      <div style={{ ...s, top: -1, left: -1, borderTop: b, borderLeft: b }} />
      <div style={{ ...s, top: -1, right: -1, borderTop: b, borderRight: b }} />
      <div style={{ ...s, bottom: -1, left: -1, borderBottom: b, borderLeft: b }} />
      <div style={{ ...s, bottom: -1, right: -1, borderBottom: b, borderRight: b }} />
    </>
  );
}

// ── Price Chart (mini sparkline) ─────────────────────────────
function PriceChart({ currentHour, width = 280, height = 100 }: { currentHour: number; width?: number; height?: number }) {
  const pad = { top: 16, right: 12, bottom: 22, left: 40 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;
  const minP = -20;
  const maxP = 200;

  const toX = (h: number) => pad.left + (h / 23) * cw;
  const toY = (p: number) => pad.top + ch - ((p - minP) / (maxP - minP)) * ch;

  const pathD = PRICE_CURVE.map((p, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(p).toFixed(1)}`).join(' ');

  // Filled area under curve up to current hour
  const fillHour = Math.min(currentHour, 23);
  const fillPts = PRICE_CURVE.slice(0, fillHour + 1).map((p, i) => `${toX(i).toFixed(1)},${toY(p).toFixed(1)}`);
  if (fillPts.length > 0) {
    fillPts.push(`${toX(fillHour).toFixed(1)},${toY(minP).toFixed(1)}`);
    fillPts.push(`${toX(0).toFixed(1)},${toY(minP).toFixed(1)}`);
  }
  const fillD = fillPts.length > 2 ? `M${fillPts.join(' L')}Z` : '';

  const zeroY = toY(0);
  const currentPrice = PRICE_CURVE[Math.min(currentHour, 23)];
  const priceColor = currentPrice < 0 ? '#10b981' : currentPrice > 100 ? '#f59e0b' : '#22d3ee';

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      {/* Zero line */}
      <line x1={pad.left} y1={zeroY} x2={width - pad.right} y2={zeroY}
        stroke="rgba(148,163,184,0.2)" strokeWidth={1} strokeDasharray="3 3" />
      {/* Y-axis labels */}
      {[0, 100, 180].map(v => (
        <text key={v} x={pad.left - 4} y={toY(v)} fill="#64748b"
          fontSize={9} fontFamily="'JetBrains Mono', monospace" textAnchor="end" dominantBaseline="middle">
          {v}
        </text>
      ))}
      {/* X-axis labels */}
      {[0, 6, 12, 18, 23].map(h => (
        <text key={h} x={toX(h)} y={height - 4} fill="#64748b"
          fontSize={9} fontFamily="'JetBrains Mono', monospace" textAnchor="middle">
          {h.toString().padStart(2, '0')}
        </text>
      ))}
      {/* Fill area */}
      {fillD && <path d={fillD} fill="rgba(245,158,11,0.08)" />}
      {/* Price curve line */}
      <path d={pathD} fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth={1.5} />
      {/* Current hour marker */}
      <circle cx={toX(currentHour)} cy={toY(currentPrice)} r={4} fill={priceColor} />
      <line x1={toX(currentHour)} y1={pad.top} x2={toX(currentHour)} y2={height - pad.bottom}
        stroke={priceColor} strokeWidth={1} strokeDasharray="2 2" opacity={0.4} />
      {/* Price label at marker */}
      <text x={toX(currentHour)} y={toY(currentPrice) - 8} fill={priceColor}
        fontSize={10} fontFamily="'JetBrains Mono', monospace" textAnchor="middle" fontWeight={700}>
        {currentPrice}
      </text>
      {/* Y-axis title */}
      <text x={4} y={pad.top + ch / 2} fill="#64748b" fontSize={8}
        fontFamily="'JetBrains Mono', monospace" textAnchor="middle"
        transform={`rotate(-90, 4, ${pad.top + ch / 2})`}>
        EUR/MWh
      </text>
    </svg>
  );
}

// ── Battery gauge ────────────────────────────────────────────
function BatteryGauge({ level, phase, width = 56, height = 24 }: { level: number; phase: string; width?: number; height?: number }) {
  const fillColor = phase === 'charging' ? '#3b82f6' : phase === 'discharging' ? '#f59e0b' : phase === 'full' ? '#10b981' : '#64748b';
  const innerW = (width - 6) * Math.max(0, Math.min(1, level));
  return (
    <svg width={width + 4} height={height} style={{ display: 'block' }}>
      <rect x={0} y={2} width={width} height={height - 4} rx={3} fill="none" stroke="#475569" strokeWidth={1.5} />
      <rect x={width} y={height / 2 - 4} width={4} height={8} rx={1} fill="#475569" />
      <rect x={3} y={5} width={innerW} height={height - 10} rx={1.5} fill={fillColor} opacity={0.85} />
    </svg>
  );
}

// ── Terminal log panel ───────────────────────────────────────
function TerminalLog({ lines }: { lines: string[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [lines]);

  return (
    <div ref={containerRef} style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 10,
      lineHeight: 1.6,
      color: '#94a3b8',
      maxHeight: 80,
      overflow: 'hidden',
    }}>
      {lines.map((line, i) => {
        const isPrice = line.includes('PRICE') || line.includes('EUR');
        const isDispatch = line.includes('DISPATCH') || line.includes('DISCHARGE');
        const color = isDispatch ? '#f59e0b' : isPrice ? '#22d3ee' : '#94a3b8';
        return (
          <div key={i} style={{ color, opacity: 0.9 }}>
            {'>'} {line}
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ───────────────────────────────────────────
export default function BerlinArbitrageExhibit({ width: widthProp, height = 700 }: { width?: number; height?: number }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [terminalLines, setTerminalLines] = useState<string[]>([]);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);

  // Responsive width
  useEffect(() => {
    if (widthProp) return;
    const measure = () => {
      if (containerRef.current && containerRef.current.clientWidth > 0) {
        setMeasuredWidth(containerRef.current.clientWidth);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [widthProp]);

  const w = widthProp || measuredWidth || 800;

  // Generate homes once
  const homes = useMemo(() => generateBerlinHomes(500), []);

  const currentStep = STEPS[stepIndex];

  // Accumulate terminal lines across steps
  useEffect(() => {
    setTerminalLines(prev => {
      const next = [...prev, ...currentStep.terminalLogs];
      // Keep last 16 lines
      return next.slice(-16);
    });
  }, [stepIndex]);

  // Auto-play
  useEffect(() => {
    if (!playing) return;
    timerRef.current = window.setTimeout(() => {
      setStepIndex(prev => {
        if (prev >= STEPS.length - 1) {
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [playing, stepIndex]);

  const handlePlay = useCallback(() => {
    setStepIndex(0);
    setTerminalLines([]);
    setPlaying(true);
  }, []);

  const handleStepClick = useCallback((i: number) => {
    setPlaying(false);
    // Reset terminal lines if going backward
    if (i <= stepIndex) {
      setTerminalLines([]);
      // Rebuild terminal lines for steps up to i
      const rebuilt: string[] = [];
      for (let s = 0; s <= i; s++) {
        rebuilt.push(...STEPS[s].terminalLogs);
      }
      setTerminalLines(rebuilt.slice(-16));
      setStepIndex(i);
    } else {
      setStepIndex(i);
    }
  }, [stepIndex]);

  // Per-home random delay for staggered color transitions
  const homeDelays = useMemo(() => {
    const rand = seededRandom(99);
    return homes.map(() => rand() * 0.8);
  }, [homes]);

  // ── DeckGL layers ──────────────────────────────────────────
  const layers = useMemo(() => {
    const result: any[] = [];

    // Home dots with phase color
    result.push(new ScatterplotLayer({
      id: 'vpp-homes',
      data: homes,
      getPosition: (d: [number, number]) => [d[0], d[1], 20],
      getRadius: 120,
      getFillColor: [...currentStep.homeColor, currentStep.homeAlpha] as [number, number, number, number],
      radiusMinPixels: 2,
      radiusMaxPixels: 5,
      transitions: { getFillColor: 800 },
      updateTriggers: { getFillColor: [stepIndex] },
    }));

    // Landmark dots
    result.push(new ScatterplotLayer({
      id: 'landmarks',
      data: LANDMARKS,
      getPosition: (d: any) => d.pos,
      getRadius: 200,
      getFillColor: [113, 113, 122, 120] as [number, number, number, number],
      radiusMinPixels: 3,
      radiusMaxPixels: 4,
    }));

    // Landmark labels
    result.push(new TextLayer({
      id: 'landmark-labels',
      data: LANDMARKS,
      getPosition: (d: any) => d.pos,
      getText: (d: any) => d.name,
      getSize: 11,
      getColor: [113, 113, 122, 180],
      getPixelOffset: [0, -14],
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 600,
      outlineWidth: 2,
      outlineColor: [10, 14, 23, 200],
    }));

    return result;
  }, [homes, stepIndex, currentStep]);

  // ── View state ─────────────────────────────────────────────
  const [viewState, setViewState] = useState({
    longitude: 13.4,
    latitude: 52.50,
    zoom: 10.5,
    pitch: 25,
    bearing: -5,
  });

  // ── Panel styles ───────────────────────────────────────────
  const accentColor = currentStep.phase === 'discharging' ? '#f59e0b'
    : currentStep.phase === 'charging' ? '#3b82f6'
    : currentStep.phase === 'full' ? '#10b981'
    : '#94a3b8';

  const panelBase: React.CSSProperties = {
    background: 'rgba(5, 8, 16, 0.92)',
    border: `1px solid ${accentColor}35`,
    boxShadow: `0 0 20px ${accentColor}18, inset 0 0 15px ${accentColor}06`,
    backdropFilter: 'blur(12px)',
    borderRadius: 3,
    position: 'relative',
  };

  const isCompact = w < 640;

  return (
    <div ref={containerRef} style={{
      position: 'relative',
      width: widthProp || '100%',
      height,
      overflow: 'hidden',
      background: '#020408',
      borderRadius: 4,
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* ── Map ── */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }: any) => setViewState(vs as any)}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      >
        <MapGL
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

      {/* ── Top bar: monitor name + date ── */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 12,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '6px 12px',
        background: 'linear-gradient(180deg, rgba(5,8,16,0.85) 0%, transparent 100%)',
        pointerEvents: 'none',
      }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11, fontWeight: 700, letterSpacing: '0.1em',
          color: '#f59e0b',
        }}>
          BERLIN VPP FLEET
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10, color: '#64748b', letterSpacing: '0.08em',
        }}>
          DAILY CYCLE
        </div>
      </div>

      {/* ── Left panel: step narrative + terminal ── */}
      <div style={{
        ...panelBase,
        position: 'absolute',
        top: isCompact ? 30 : 34,
        left: isCompact ? 6 : 10,
        width: isCompact ? 'calc(100% - 12px)' : 340,
        padding: '10px 14px',
        zIndex: 10,
      }}>
        <Corners color={`${accentColor}50`} size={10} />

        {/* Phase badge */}
        <div style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 3,
          background: `${accentColor}18`,
          border: `1px solid ${accentColor}40`,
          fontSize: 10, fontWeight: 700,
          fontFamily: "'JetBrains Mono', monospace",
          color: accentColor, letterSpacing: '0.08em',
          marginBottom: 6,
        }}>
          {currentStep.time} -- {currentStep.phase === 'discharging' ? 'PEAK SHAVING' : 'ENERGY ARBITRAGE'}
        </div>

        {/* Step label */}
        <div style={{
          fontSize: 14, fontWeight: 700, color: '#f1f5f9',
          marginBottom: 4, lineHeight: 1.3,
        }}>
          {currentStep.label}
        </div>

        {/* Detail text */}
        <div style={{
          fontSize: 13, color: '#94a3b8', lineHeight: 1.5,
          marginBottom: 8,
        }}>
          {currentStep.detail}
        </div>

        {/* Battery + Price row */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16,
          marginBottom: 8, paddingBottom: 8,
          borderBottom: '1px solid rgba(148,163,184,0.1)',
        }}>
          <div>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748b', letterSpacing: '0.08em', marginBottom: 3 }}>
              AVG BATTERY
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <BatteryGauge level={currentStep.batteryLevel} phase={currentStep.phase} />
              <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: accentColor, fontWeight: 700 }}>
                {Math.round(currentStep.batteryLevel * 100)}%
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748b', letterSpacing: '0.08em', marginBottom: 3 }}>
              SPOT PRICE
            </div>
            <div style={{
              fontSize: 16, fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: currentStep.priceHighlight < 0 ? '#10b981' : currentStep.priceHighlight > 100 ? '#f59e0b' : '#22d3ee',
            }}>
              {currentStep.priceHighlight > 0 ? '+' : ''}{currentStep.priceHighlight}
              <span style={{ fontSize: 10, color: '#64748b', marginLeft: 2 }}>EUR/MWh</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: '#64748b', letterSpacing: '0.08em', marginBottom: 3 }}>
              FREQUENCY
            </div>
            <div style={{
              fontSize: 16, fontWeight: 700,
              fontFamily: "'JetBrains Mono', monospace",
              color: '#10b981',
            }}>
              50.00
              <span style={{ fontSize: 10, color: '#64748b', marginLeft: 2 }}>Hz</span>
            </div>
          </div>
        </div>

        {/* Terminal */}
        <TerminalLog lines={terminalLines} />

        {/* Home count footer */}
        <div style={{
          marginTop: 6, fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#64748b',
        }}>
          500 HOMES CONNECTED -- BERLIN
        </div>
      </div>

      {/* ── Right panel: Price chart ── */}
      {!isCompact && (
        <div style={{
          ...panelBase,
          position: 'absolute',
          top: 34, right: 10,
          padding: '8px 10px',
          zIndex: 10,
        }}>
          <Corners color="rgba(245,158,11,0.3)" size={10} />
          <div style={{
            fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
            color: '#64748b', letterSpacing: '0.1em', marginBottom: 4,
          }}>
            DAY-AHEAD SPOT PRICE
          </div>
          <PriceChart currentHour={currentStep.hour} width={260} height={100} />
        </div>
      )}

      {/* ── Banner: visible on last step ── */}
      {stepIndex === STEPS.length - 1 && (
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 15,
          padding: '12px 28px',
          background: 'rgba(5, 8, 16, 0.9)',
          border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: 4,
          textAlign: 'center',
          boxShadow: '0 0 40px rgba(245,158,11,0.15)',
          animation: 'bannerFadeIn 0.8s ease-out',
          pointerEvents: 'none',
        }}>
          <div style={{
            fontSize: 18, fontWeight: 800,
            fontFamily: "'JetBrains Mono', monospace",
            color: '#f59e0b',
            letterSpacing: '0.08em',
            textShadow: '0 0 20px rgba(245,158,11,0.4)',
          }}>
            500 HOMES -- EUR 2.40/HOME/DAY
          </div>
          <div style={{
            fontSize: 11, color: '#94a3b8', marginTop: 4,
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            DAILY ARBITRAGE REVENUE: EUR 1,200
          </div>
        </div>
      )}

      {/* ── Bottom: Step timeline + controls ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        zIndex: 12,
        background: 'linear-gradient(0deg, rgba(5,8,16,0.9) 0%, rgba(5,8,16,0.6) 70%, transparent 100%)',
        padding: '20px 12px 10px',
      }}>
        {/* Step dots / timeline */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: isCompact ? 4 : 8,
          marginBottom: 8,
        }}>
          {STEPS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleStepClick(i)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: 0, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, opacity: i === stepIndex ? 1 : 0.5,
                transition: 'opacity 0.3s',
              }}
            >
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, color: i === stepIndex ? accentColor : '#64748b',
                fontWeight: i === stepIndex ? 700 : 400,
              }}>
                {s.time}
              </div>
              <div style={{
                width: i === stepIndex ? 20 : 8,
                height: 8,
                borderRadius: 4,
                background: i === stepIndex ? accentColor : i < stepIndex ? `${accentColor}60` : 'rgba(100,116,139,0.3)',
                transition: 'all 0.3s ease',
              }} />
            </button>
          ))}
        </div>

        {/* Play button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handlePlay}
            style={{
              background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: 4,
              padding: '4px 16px',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, fontWeight: 700,
              color: '#f59e0b',
              cursor: 'pointer',
              letterSpacing: '0.08em',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(245,158,11,0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(245,158,11,0.1)')}
          >
            {playing ? 'PLAYING...' : 'PLAY DAILY CYCLE'}
          </button>
        </div>
      </div>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes bannerFadeIn {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
