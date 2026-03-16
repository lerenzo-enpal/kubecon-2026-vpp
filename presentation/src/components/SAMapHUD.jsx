import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { SlideContext, useSteps } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// ── Camera presets ──────────────────────────────────────────
const VIEWS = {
  blackout: { longitude: 138.5, latitude: -34.0, zoom: 6.2, pitch: 35, bearing: -5 },
  vpp:      { longitude: 138.55, latitude: -34.85, zoom: 8.5, pitch: 40, bearing: -8 },
};

// ── Infrastructure nodes ────────────────────────────────────
const NODES = [
  // Generation
  { id: 'torrens',     pos: [138.523, -34.807], type: 'gas',   cap: 1280, name: 'Torrens Island' },
  { id: 'pelican',     pos: [138.520, -34.720], type: 'gas',   cap: 480,  name: 'Pelican Point' },
  { id: 'osborne',     pos: [138.525, -34.835], type: 'gas',   cap: 180,  name: 'Osborne' },
  // Wind farms (tripped 2016)
  { id: 'hornsdale',   pos: [138.540, -33.056], type: 'wind',  cap: 315,  name: 'Hornsdale' },
  { id: 'snowtown',    pos: [138.135, -33.732], type: 'wind',  cap: 369,  name: 'Snowtown 1&2' },
  { id: 'hallett1',    pos: [138.708, -33.316], type: 'wind',  cap: 95,   name: 'Hallett 1' },
  { id: 'hallett2',    pos: [138.864, -33.564], type: 'wind',  cap: 71,   name: 'Hallett 2' },
  { id: 'northbrown',  pos: [138.704, -33.299], type: 'wind',  cap: 132,  name: 'North Brown Hill' },
  { id: 'bluff',       pos: [138.792, -33.383], type: 'wind',  cap: 53,   name: 'The Bluff' },
  { id: 'clements',    pos: [138.151, -33.721], type: 'wind',  cap: 57,   name: 'Clements Gap' },
  // Wind farms (survived)
  { id: 'waterloo',    pos: [138.900, -33.980], type: 'wind',  cap: 111,  name: 'Waterloo', survived: true },
  { id: 'canunda',     pos: [140.700, -37.680], type: 'wind',  cap: 46,   name: 'Canunda', survived: true },
  { id: 'lakebonney',  pos: [140.360, -37.300], type: 'wind',  cap: 279,  name: 'Lake Bonney 1-3', survived: true },
  // Substations
  { id: 'davenport',   pos: [137.820, -32.510], type: 'sub',   cap: 0,    name: 'Davenport Sub' },
  { id: 'belalie',     pos: [138.500, -33.150], type: 'sub',   cap: 0,    name: 'Belalie Sub' },
  { id: 'para',        pos: [138.630, -34.730], type: 'sub',   cap: 0,    name: 'Para Sub' },
  // Interconnector
  { id: 'heywood',     pos: [141.100, -37.800], type: 'ic',    cap: 460,  name: 'Heywood IC' },
  // Battery (for VPP variant)
  { id: 'hpr',         pos: [138.520, -33.080], type: 'battery', cap: 150, name: 'Hornsdale Power Reserve' },
];

// ── Transmission lines (275kV backbone) ─────────────────────
const SA_LINES = [
  ['davenport', 'belalie'],
  ['belalie', 'hallett1'],
  ['belalie', 'northbrown'],
  ['belalie', 'snowtown'],
  ['belalie', 'para'],
  ['para', 'torrens'],
  ['para', 'pelican'],
  ['para', 'osborne'],
  ['hornsdale', 'davenport'],
  ['hallett2', 'belalie'],
  ['bluff', 'belalie'],
  ['clements', 'snowtown'],
  ['waterloo', 'para'],
  ['lakebonney', 'heywood'],
  ['canunda', 'heywood'],
  ['heywood', 'para'],
  ['hpr', 'hornsdale'],
];

// ── Blackout cascade steps (2016 SA Blackout) ───────────────
const BLACKOUT_CASCADE = [
  {
    ids: ['davenport', 'belalie'],
    label: '275kV towers collapse — 3 lines fault',
    detail: 'Two tornadoes destroy transmission corridor',
    freq: 49.8,
  },
  {
    ids: ['hallett1', 'northbrown', 'bluff'],
    label: '123 MW wind lost — LVRT protection trips',
    detail: 'Voltage ride-through limits exceeded',
    freq: 49.5,
  },
  {
    ids: ['hornsdale', 'snowtown', 'hallett2', 'clements'],
    label: '456 MW total — 9 of 13 wind farms down',
    detail: 'Cascade in <7 seconds',
    freq: 49.0,
  },
  {
    ids: ['heywood'],
    label: 'Heywood IC overloads at 850 MW — trips',
    detail: 'Rated 460 MW — protection relay activates',
    freq: 48.2,
  },
  {
    ids: ['torrens', 'pelican', 'osborne'],
    label: 'Adelaide generation fails — UFLS insufficient',
    detail: 'Under-frequency load shedding cannot save the grid',
    freq: 47.0,
  },
  {
    ids: ['para', 'waterloo', 'canunda', 'lakebonney', 'hpr'],
    label: 'SYSTEM BLACK — 850,000 connections',
    detail: '1.7 million people. Total darkness.',
    freq: 0,
  },
];

// ── VPP response steps (2019 Kogan Creek event) ─────────────
const VPP_STEPS = [
  {
    phase: 'stable',
    label: 'Grid nominal — SA VPP fleet standby',
    detail: '1,100 homes with Tesla Powerwalls',
    freq: 50.0,
    homesActive: 0,
  },
  {
    phase: 'trip',
    label: 'Kogan Creek 748 MW trip — loss of generation',
    detail: 'Largest contingency event in NEM',
    freq: 49.61,
    homesActive: 0,
  },
  {
    phase: 'detect',
    label: 'Frequency deviation detected',
    detail: 'Powerwalls measure local frequency autonomously',
    freq: 49.59,
    homesActive: 200,
  },
  {
    phase: 'respond',
    label: 'VPP injecting power — 6-second FCAS raise',
    detail: 'Powerwalls discharge to grid via droop response',
    freq: 49.75,
    homesActive: 900,
  },
  {
    phase: 'stable',
    label: 'GRID STABLE — 0 humans involved',
    detail: '1,100 homes. 2% of fleet. Proof it works.',
    freq: 49.95,
    homesActive: 1100,
  },
];

// ── Terminal log messages ───────────────────────────────────
const BLACKOUT_LOGS = [
  { step: 0, text: '16:18 ACST — TORNADO WARNING ACTIVE — MID-NORTH SA', level: 'warn' },
  { step: 0, text: '275kV BRINKWORTH–TEMPLERS WEST — LINE FAULT', level: 'crit' },
  { step: 0, text: '275kV DAVENPORT–BELALIE — TOWER COLLAPSE DETECTED', level: 'crit' },
  { step: 1, text: 'WIND FARM LVRT PROTECTION — HALLETT 1 TRIP', level: 'warn' },
  { step: 1, text: 'NORTH BROWN HILL + BLUFF — DISCONNECTED', level: 'warn' },
  { step: 1, text: '123 MW WIND GENERATION LOST IN <2 SECONDS', level: 'crit' },
  { step: 2, text: 'HORNSDALE WIND FARM — TRIP — 86 MW LOST', level: 'crit' },
  { step: 2, text: 'SNOWTOWN 2 — TRIP — 106 MW LOST', level: 'crit' },
  { step: 2, text: '456 MW TOTAL WIND OFFLINE — 9 OF 13 FARMS', level: 'crit' },
  { step: 3, text: 'HEYWOOD IC LOADING: 850 MW (RATED 460 MW)', level: 'crit' },
  { step: 3, text: 'HEYWOOD PROTECTION RELAY — TRIPPED', level: 'crit' },
  { step: 3, text: 'SA ISLANDED FROM NEM — NO INTERCONNECTION', level: 'crit' },
  { step: 4, text: 'UFLS ACTIVATED — INSUFFICIENT LOAD SHED', level: 'crit' },
  { step: 4, text: 'TORRENS ISLAND — GENERATION FAILING', level: 'crit' },
  { step: 4, text: 'ADELAIDE METRO — FREQUENCY COLLAPSE', level: 'crit' },
  { step: 5, text: '██ SYSTEM BLACK ██ — ALL SA GENERATION OFFLINE', level: 'crit' },
  { step: 5, text: '850,000 CUSTOMER CONNECTIONS LOST', level: 'crit' },
  { step: 5, text: 'TOTAL CASCADE TIME: 43 SECONDS', level: 'crit' },
];

const VPP_LOGS = [
  { step: 0, text: 'SA VPP FLEET — 1,100 POWERWALLS ONLINE', level: 'info' },
  { step: 0, text: 'FCAS BID: 6-SECOND RAISE — ENABLED', level: 'info' },
  { step: 0, text: 'NEM FREQUENCY: 50.00 Hz — NOMINAL', level: 'info' },
  { step: 1, text: '08:00 — KOGAN CREEK (QLD) TRIP — 748 MW LOST', level: 'crit' },
  { step: 1, text: 'NEM FREQUENCY FALLING — 49.61 Hz', level: 'crit' },
  { step: 1, text: 'LARGEST SINGLE CONTINGENCY IN NEM', level: 'warn' },
  { step: 2, text: 'POWERWALL INVERTERS — FREQ DEVIATION DETECTED', level: 'warn' },
  { step: 2, text: 'DROOP RESPONSE ACTIVATING — 0.7% SETTING', level: 'warn' },
  { step: 2, text: 'NO CENTRAL DISPATCH — AUTONOMOUS DETECTION', level: 'info' },
  { step: 3, text: 'VPP FLEET DISCHARGING — FCAS RAISE ACTIVE', level: 'info' },
  { step: 3, text: 'RESPONSE TIME: <6 SECONDS — WITHIN SPEC', level: 'info' },
  { step: 3, text: 'FREQUENCY RECOVERING — 49.75 Hz', level: 'info' },
  { step: 4, text: '█ GRID STABLE █ — FREQUENCY RESTORED', level: 'info' },
  { step: 4, text: '1,100 HOMES RESPONDED — 0 HUMANS INVOLVED', level: 'info' },
  { step: 4, text: 'VPP FLEET: 2% DEPLOYED — PROOF OF CONCEPT', level: 'info' },
];

// ── VPP home locations (deterministic pseudo-random in Adelaide metro) ──
function generateVPPHomes(count, seed = 42) {
  const homes = [];
  let s = seed;
  const next = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  // Adelaide metro: 138.45-138.75°E, -35.10 to -34.70°S
  for (let i = 0; i < count; i++) {
    const lng = 138.45 + next() * 0.30;
    const lat = -35.10 + next() * 0.40;
    // Distance from center of Adelaide for activation ordering
    const dist = Math.sqrt((lng - 138.6) ** 2 + (lat + 34.93) ** 2);
    homes.push({ lng, lat, dist, idx: i });
  }
  homes.sort((a, b) => a.dist - b.dist);
  return homes;
}

const VPP_HOMES = generateVPPHomes(1100);

// ── Color constants ─────────────────────────────────────────
const TYPE_COLORS = {
  wind: [96, 165, 250],
  gas: [251, 146, 60],
  sub: [148, 163, 184],
  ic: [167, 139, 250],
  battery: [16, 185, 129],
};
const FAILED_COLOR = [239, 68, 68];
const SURVIVED_COLOR = [34, 211, 238];
const VPP_GREEN = [16, 185, 129];

const getNode = (id) => NODES.find(n => n.id === id);

// ── HUD corner bracket decoration ──────────────────────────
function Corner({ pos, color }) {
  const s = 12;
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

// ── Main component ──────────────────────────────────────────
export default function SAMapHUD({ width = 1024, height = 700, variant = 'blackout' }) {
  const isBlackout = variant === 'blackout';
  const stepCount = isBlackout ? BLACKOUT_CASCADE.length : VPP_STEPS.length;

  const [failed, setFailed] = useState(new Set());
  const [stepIndex, setStepIndex] = useState(-1);
  const [boot, setBoot] = useState(0);
  const [vppActive, setVppActive] = useState(0); // number of active VPP homes
  const bootRef = useRef(null);
  const defaultView = VIEWS[variant] || VIEWS.blackout;
  const [viewState, setViewState] = useState(defaultView);

  const running = stepIndex >= 0;
  const stepIndexRef = useRef(-1);
  stepIndexRef.current = stepIndex;

  // Single Spectacle gate step — just blocks slide exit until we start
  const { placeholder } = useSteps(1);

  const slideContext = useContext(SlideContext);
  const slideActive = slideContext?.isSlideActive;
  const wasActiveRef = useRef(false);

  // Reset on slide enter
  useEffect(() => {
    if (slideActive) {
      setFailed(new Set());
      setStepIndex(-1);
      setVppActive(0);
      setViewState(VIEWS[variant] || VIEWS.blackout);
      setBoot(0);
      wasActiveRef.current = true;
      const delay = setTimeout(() => {
        const start = performance.now();
        const tick = () => {
          const s = (performance.now() - start) / 1000;
          setBoot(s);
          if (s < 3.5) bootRef.current = requestAnimationFrame(tick);
        };
        bootRef.current = requestAnimationFrame(tick);
      }, 500);
      return () => { clearTimeout(delay); cancelAnimationFrame(bootRef.current); };
    } else {
      wasActiveRef.current = false;
    }
  }, [slideActive]);

  // Arrow key listener — manages our own step counter
  useEffect(() => {
    if (!slideActive) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const cur = stepIndexRef.current;
        if (cur < stepCount - 1) {
          e.stopPropagation(); // prevent Spectacle from consuming it
          const next = cur + 1;
          if (isBlackout) {
            const nf = new Set();
            for (let i = 0; i <= next; i++) BLACKOUT_CASCADE[i].ids.forEach(id => nf.add(id));
            setFailed(nf);
          } else {
            setVppActive(VPP_STEPS[next].homesActive);
          }
          setStepIndex(next);
        }
        // else: let Spectacle handle it — moves to next slide
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const cur = stepIndexRef.current;
        if (cur > 0) {
          e.stopPropagation();
          const prev = cur - 1;
          if (isBlackout) {
            const nf = new Set();
            for (let i = 0; i <= prev; i++) BLACKOUT_CASCADE[i].ids.forEach(id => nf.add(id));
            setFailed(nf);
          } else {
            setVppActive(VPP_STEPS[prev].homesActive);
          }
          setStepIndex(prev);
        } else if (cur === 0) {
          e.stopPropagation();
          setFailed(new Set());
          setStepIndex(-1);
          setVppActive(0);
          setViewState({
            ...defaultView,
            transitionDuration: 500,
            transitionInterpolator: new FlyToInterpolator(),
            transitionEasing: t => 1 - Math.pow(1 - t, 3),
          });
        }
        // cur === -1: let Spectacle handle it — goes to prev slide
      }
    };
    // Use capture phase to intercept before Spectacle
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [slideActive, isBlackout, stepCount]);

  // Manual step functions (work alongside Spectacle arrows)
  const stepForward = () => {
    const next = stepIndex + 1;
    if (next >= stepCount) return;
    if (isBlackout) {
      const nf = new Set();
      for (let i = 0; i <= next; i++) BLACKOUT_CASCADE[i].ids.forEach(id => nf.add(id));
      setFailed(nf);
    } else {
      setVppActive(VPP_STEPS[next].homesActive);
    }
    setStepIndex(next);
  };

  const resetAll = () => {
    setFailed(new Set());
    setStepIndex(-1);
    setVppActive(0);
    setViewState({
      ...defaultView,
      transitionDuration: 500,
      transitionInterpolator: new FlyToInterpolator(),
      transitionEasing: t => 1 - Math.pow(1 - t, 3),
    });
  };

  const skipToEnd = () => {
    const lastIdx = stepCount - 1;
    if (isBlackout) {
      const nf = new Set();
      for (let i = 0; i <= lastIdx; i++) BLACKOUT_CASCADE[i].ids.forEach(id => nf.add(id));
      setFailed(nf);
    } else {
      setVppActive(VPP_STEPS[lastIdx].homesActive);
    }
    setStepIndex(lastIdx);
  };

  // Ease helper
  const ease = (t) => t < 0 ? 0 : t > 1 ? 1 : 1 - Math.pow(1 - t, 3);
  const bootFade = (delay, dur = 0.3) => ease((boot - delay) / dur);

  // ── Current step data ──
  const currentStep = isBlackout
    ? (stepIndex >= 0 ? BLACKOUT_CASCADE[stepIndex] : null)
    : (stepIndex >= 0 ? VPP_STEPS[stepIndex] : null);

  const freq = currentStep
    ? currentStep.freq + Math.sin(Date.now() / 300) * 0.01
    : 50.0 + Math.sin(Date.now() / 300) * 0.01;

  const isSystemBlack = isBlackout && stepIndex === BLACKOUT_CASCADE.length - 1;
  const isGridStable = !isBlackout && stepIndex === VPP_STEPS.length - 1;

  // ── MW offline counter (blackout) ──
  const mwOffline = useMemo(() => {
    if (!isBlackout || stepIndex < 0) return 0;
    let total = 0;
    for (let i = 0; i <= stepIndex; i++) {
      BLACKOUT_CASCADE[i].ids.forEach(id => {
        const node = getNode(id);
        if (node) total += node.cap;
      });
    }
    return total;
  }, [isBlackout, stepIndex]);

  // ── Color logic ──
  const inDanger = isBlackout && running;
  const freqColor = freq === 0 ? '#ef4444' : freq < 49.0 ? '#ef4444' : freq < 49.5 ? '#f59e0b' : freq < 49.8 ? '#f59e0b' : '#22d3ee';
  const accentColor = isBlackout ? '#ef4444' : '#10b981';
  const glowColor = inDanger ? '#ef4444' : isGridStable ? '#10b981' : '#22d3ee';
  const borderClr = inDanger ? 'rgba(239,68,68,0.5)' : isGridStable ? 'rgba(16,185,129,0.4)' : 'rgba(34,211,238,0.35)';

  // ── Visible nodes for current variant ──
  const visibleNodes = useMemo(() => {
    if (isBlackout) return NODES;
    // VPP variant: show only Adelaide-area infra + HPR
    return NODES.filter(n => ['torrens', 'pelican', 'osborne', 'para', 'hpr'].includes(n.id));
  }, [isBlackout]);

  // ── VPP home dots data ──
  const vppHomeDots = useMemo(() => {
    if (isBlackout) return [];
    return VPP_HOMES.map((h, i) => ({
      position: [h.lng, h.lat],
      active: i < vppActive,
      idx: i,
    }));
  }, [isBlackout, vppActive]);

  // ── Build line data ──
  const pulse = Math.sin(Date.now() / 250);
  const lines = useMemo(() => {
    const visibleLines = isBlackout
      ? SA_LINES
      : SA_LINES.filter(([a, b]) => {
          const nodeA = getNode(a), nodeB = getNode(b);
          return nodeA && nodeB &&
            ['torrens', 'pelican', 'osborne', 'para', 'hpr', 'hornsdale'].includes(a) &&
            ['torrens', 'pelican', 'osborne', 'para', 'hpr', 'hornsdale'].includes(b);
        });

    return visibleLines.map(([a, b]) => {
      const nA = getNode(a), nB = getNode(b);
      if (!nA || !nB) return null;
      const aF = failed.has(a), bF = failed.has(b);
      let color;
      if (isBlackout) {
        if (aF && bF) color = [239, 68, 68, 55];
        else if (aF || bF) color = [239, 68, 68, Math.floor(pulse * 40 + 155)];
        else color = [34, 211, 238, 150];
      } else {
        color = isGridStable ? [16, 185, 129, 180] : [34, 211, 238, 150];
      }
      return { from: nA.pos, to: nB.pos, color };
    }).filter(Boolean);
  }, [failed, isBlackout, isGridStable, stepIndex]);

  // ── Deck.gl layers ──
  const layers = useMemo(() => {
    const result = [];

    // Transmission lines
    result.push(new LineLayer({
      id: 'lines',
      data: lines,
      getSourcePosition: d => d.from,
      getTargetPosition: d => d.to,
      getColor: d => d.color,
      getWidth: 3,
      widthMinPixels: 2,
      updateTriggers: { getColor: [stepIndex, Date.now() >> 8] },
    }));

    // Line glow
    result.push(new LineLayer({
      id: 'glow',
      data: lines,
      getSourcePosition: d => d.from,
      getTargetPosition: d => d.to,
      getColor: d => d.color.map((c, i) => i < 3 ? c : Math.floor(c * 0.3)),
      getWidth: 10,
      widthMinPixels: 4,
      updateTriggers: { getColor: [stepIndex, Date.now() >> 8] },
    }));

    // Infrastructure nodes
    result.push(new ScatterplotLayer({
      id: 'nodes',
      data: visibleNodes,
      getPosition: d => d.pos,
      getRadius: d => {
        if (d.type === 'sub') return 5000;
        if (d.type === 'ic') return 8000;
        return 4000 + Math.sqrt(d.cap) * 400;
      },
      getFillColor: d => {
        if (failed.has(d.id)) return [...FAILED_COLOR, 180];
        if (d.survived && isBlackout) return [...SURVIVED_COLOR, 200];
        return [...(TYPE_COLORS[d.type] || [148, 163, 184]), 180];
      },
      getLineColor: d => {
        if (failed.has(d.id)) return [...FAILED_COLOR, 255];
        if (d.survived && isBlackout) return [...SURVIVED_COLOR, 255];
        return [...(TYPE_COLORS[d.type] || [148, 163, 184]), 255];
      },
      stroked: true,
      lineWidthMinPixels: 2,
      radiusMinPixels: 4,
      radiusMaxPixels: 20,
      transitions: { getFillColor: 400, getRadius: 300 },
      updateTriggers: { getFillColor: [stepIndex], getLineColor: [stepIndex] },
    }));

    // X marks on failed nodes (blackout)
    if (isBlackout) {
      result.push(new TextLayer({
        id: 'x-marks',
        data: NODES.filter(n => failed.has(n.id)),
        getPosition: d => d.pos,
        getText: () => '\u2715',
        getSize: 20,
        getColor: [239, 68, 68, 255],
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        fontFamily: 'JetBrains Mono',
        fontWeight: 'bold',
        updateTriggers: { data: [stepIndex] },
      }));
    }

    // Node labels
    result.push(new TextLayer({
      id: 'labels',
      data: visibleNodes,
      getPosition: d => d.pos,
      getText: d => d.name,
      getSize: 11,
      getColor: d => failed.has(d.id) ? [239, 68, 68, 180] : [241, 245, 249, 170],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'top',
      getPixelOffset: [0, 16],
      fontFamily: 'Inter',
      updateTriggers: { getColor: [stepIndex] },
    }));

    // VPP home dots
    if (!isBlackout && vppHomeDots.length > 0) {
      result.push(new ScatterplotLayer({
        id: 'vpp-homes',
        data: vppHomeDots,
        getPosition: d => d.position,
        getRadius: d => d.active ? 600 : 300,
        getFillColor: d => d.active ? [...VPP_GREEN, 200] : [100, 116, 139, 60],
        getLineColor: d => d.active ? [...VPP_GREEN, 255] : [100, 116, 139, 80],
        stroked: false,
        radiusMinPixels: d => d.active ? 3 : 1.5,
        radiusMaxPixels: 8,
        transitions: { getFillColor: 600, getRadius: 400 },
        updateTriggers: { getFillColor: [vppActive], getRadius: [vppActive] },
      }));
    }

    return result;
  }, [lines, visibleNodes, failed, vppHomeDots, vppActive, stepIndex, isBlackout, isGridStable]);

  // ── Panel base style ──
  const panelBase = {
    background: 'rgba(5, 8, 16, 0.92)',
    border: `1px solid ${borderClr}`,
    boxShadow: `0 0 20px ${glowColor}18, inset 0 0 15px ${glowColor}06`,
    backdropFilter: 'blur(12px)',
    transition: 'border-color 0.6s, box-shadow 0.6s',
    position: 'relative',
    borderRadius: 3,
  };

  // ── Button styles ──
  const btnBase = {
    background: 'rgba(26, 34, 54, 0.9)', border: '1px solid rgba(34,211,238,0.3)',
    color: '#94a3b8', padding: '7px 14px', borderRadius: 3,
    cursor: 'pointer', fontSize: 13, fontFamily: '"JetBrains Mono"', fontWeight: 600,
  };
  const btnTrigger = {
    ...btnBase,
    background: isBlackout ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
    border: `1px solid ${isBlackout ? 'rgba(239,68,68,0.5)' : 'rgba(16,185,129,0.5)'}`,
    color: accentColor, fontWeight: 700,
  };

  // ── Visible log messages ──
  const logMsgs = isBlackout ? BLACKOUT_LOGS : VPP_LOGS;
  const visibleLogs = running ? logMsgs.filter(m => m.step <= stepIndex).slice(-5) : [];

  // ── Boot timings ──
  const lpExpand = ease((boot - 0.1) / 1.0);
  const buttonsDraw = bootFade(0.7, 0.5);
  const rpExpand = ease((boot - 0.5) / 0.8);
  const rpContent = bootFade(0.8, 0.5);

  // ── Timeline data ──
  const timelineSteps = isBlackout ? BLACKOUT_CASCADE : VPP_STEPS;

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden', background: '#020408' }}>
      {placeholder}

      {/* ── Map ── */}
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        width={width}
        height={height}
        style={{ position: 'absolute' }}
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

      {/* ── Danger/Success atmosphere ── */}
      {running && (
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: isBlackout
            ? `radial-gradient(ellipse at center, rgba(239,68,68,${Math.min(0.12, stepIndex * 0.025)}) 0%, transparent 70%)`
            : isGridStable
              ? 'radial-gradient(ellipse at center, rgba(16,185,129,0.08) 0%, transparent 70%)'
              : 'none',
          transition: 'background 0.6s',
        }} />
      )}

      {/* ── Boot scan line ── */}
      {boot > 0.08 && boot < 1.5 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, pointerEvents: 'none', zIndex: 15,
          top: `${ease((boot - 0.08) / 1.2) * 110}%`,
          height: 1,
          background: `linear-gradient(90deg, transparent 2%, rgba(34,211,238,${Math.max(0, 0.5 - boot * 0.4)}) 15%, rgba(34,211,238,${Math.max(0, 0.5 - boot * 0.4)}) 85%, transparent 98%)`,
          boxShadow: `0 0 12px rgba(34,211,238,${Math.max(0, 0.2 - boot * 0.2)})`,
        }} />
      )}

      {/* ── Left: Event Timeline Panel ── */}
      <div style={{
        ...panelBase, position: 'absolute', top: 10, left: 10, width: 380,
        zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        height: `calc(${lpExpand * 100}% - 20px)`,
        opacity: lpExpand > 0 ? 1 : 0,
        transformOrigin: 'top left',
        clipPath: lpExpand < 1
          ? `inset(0 ${Math.max(0, (1 - lpExpand * 1.6)) * 100}% ${Math.max(0, (1 - Math.max(0, (lpExpand - 0.25) / 0.75))) * 100}% 0)`
          : 'none',
      }}>
        <Corners color={glowColor} />

        {/* Header */}
        <div style={{
          padding: '10px 16px', borderBottom: `1px solid ${borderClr}`,
          display: 'flex', alignItems: 'center', gap: 10,
          opacity: bootFade(0.3, 0.5),
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: running ? accentColor : '#22d3ee',
            boxShadow: `0 0 10px ${running ? accentColor : '#22d3ee'}`,
          }} />
          <span style={{
            fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"',
            color: '#94a3b8', letterSpacing: '0.12em',
          }}>
            {isBlackout ? 'AEMO — SA GRID' : 'SA VPP FLEET'}
          </span>
          <span style={{
            marginLeft: 'auto', fontSize: 11, fontFamily: '"JetBrains Mono"',
            color: '#64748b60',
          }}>
            {isBlackout ? 'SEPT 28 2016' : 'OCT 9 2019'}
          </span>
        </div>

        {/* Buttons */}
        <div style={{
          padding: '8px 16px', display: 'flex', gap: 8,
          borderBottom: `1px solid ${borderClr}`,
          opacity: buttonsDraw,
          clipPath: buttonsDraw < 1 ? `inset(0 0 ${(1 - buttonsDraw) * 100}% 0)` : 'none',
        }}>
          <button onClick={resetAll} style={btnBase}>RESET</button>
          <button onClick={stepForward} style={{ ...btnTrigger, flex: 1 }}>
            {'\u25B6'} {isBlackout ? 'CASCADE' : 'KOGAN TRIP'}
          </button>
          <button onClick={skipToEnd} style={{ ...btnBase, padding: '7px 10px' }} title="Skip to end">
            {'\u23ED'}
          </button>
        </div>

        {/* Timeline entries */}
        <div style={{ flex: 1, overflowY: 'hidden', padding: '10px 16px' }}>
          {timelineSteps.map((step, i) => {
            const isActive = stepIndex >= i;
            const isCurrent = stepIndex === i;
            return (
              <div key={i} style={{
                marginBottom: 8,
                opacity: isActive ? 1 : 0.25,
                transition: 'opacity 0.4s, transform 0.4s',
                borderLeft: isCurrent ? `2px solid ${accentColor}` : '2px solid transparent',
                paddingLeft: isCurrent ? 10 : 12,
                transform: `translateX(${isActive ? 0 : -15}px)`,
              }}>
                <div style={{
                  fontSize: 14, fontFamily: '"Inter"',
                  color: isActive ? (isCurrent ? '#f1f5f9' : '#f1f5f9bb') : '#64748b40',
                  fontWeight: isCurrent ? 600 : 400,
                }}>
                  {step.label}
                </div>
                <div style={{
                  fontSize: 11, fontFamily: '"JetBrains Mono"', marginTop: 2,
                  color: isActive ? '#94a3b870' : '#64748b20',
                }}>
                  {step.detail}
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal log feed */}
        <div style={{
          borderTop: `1px solid ${borderClr}`, padding: '8px 14px',
          minHeight: 90, maxHeight: 130, overflow: 'hidden',
          background: 'rgba(0,0,0,0.3)',
          opacity: bootFade(1.5, 0.5),
        }}>
          <div style={{
            fontSize: 9, fontFamily: '"JetBrains Mono"', color: '#64748b50',
            letterSpacing: '0.1em', marginBottom: 4,
          }}>SYSTEM LOG</div>
          {!running && (
            <div style={{ fontSize: 11, fontFamily: '"JetBrains Mono"' }}>
              {boot > 1.8 && (
                <div style={{ color: '#22d3ee50', marginBottom: 2 }}>
                  {'>'} {isBlackout ? 'AEMO SA GRID MONITOR v1.0 INIT...' : 'SA VPP FLEET MONITOR v2.1 INIT...'}
                </div>
              )}
              {boot > 2.2 && (
                <div style={{ color: '#22d3ee50', marginBottom: 2 }}>
                  {'>'} {isBlackout
                    ? `NODES: ${NODES.length} | LINES: ${SA_LINES.length} | STATUS: OK`
                    : 'FLEET: 1,100 POWERWALLS | FCAS: ENABLED | STATUS: STANDBY'}
                </div>
              )}
              {boot > 2.6 && (
                <div style={{ color: '#64748b35' }}>
                  {'>'} Awaiting events...<span className="hud-blink">{'\u2588'}</span>
                </div>
              )}
            </div>
          )}
          {visibleLogs.map((msg, i) => {
            const isLatest = i === visibleLogs.length - 1;
            const msgColor = msg.level === 'crit' ? '#ef4444' : msg.level === 'warn' ? '#f59e0b' : '#10b981';
            return (
              <div key={`${msg.step}-${msg.text}`} style={{
                fontSize: 11, fontFamily: '"JetBrains Mono"',
                color: msgColor, opacity: isLatest ? 1 : 0.5,
                marginBottom: 2, lineHeight: 1.4,
              }}>
                {'>'} {msg.text}
                {isLatest && <span className="hud-blink" style={{ marginLeft: 2 }}>{'\u2588'}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Right: Frequency readout ── */}
      <div style={{
        ...panelBase, position: 'absolute', top: 10, right: 10, zIndex: 10,
        padding: '14px 20px', minWidth: 190,
        opacity: rpExpand > 0 ? 1 : 0,
        transformOrigin: 'top right',
        transform: `scale(${rpExpand})`,
      }}>
        <Corners color={glowColor} />
        <div style={{
          fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60',
          letterSpacing: '0.1em', marginBottom: 6,
          opacity: rpContent,
        }}>FREQUENCY</div>
        <div style={{
          fontSize: 36, fontWeight: 800, fontFamily: '"JetBrains Mono"',
          color: freq === 0 ? '#ef4444' : freqColor,
          textShadow: `0 0 22px ${freqColor}40`,
          opacity: rpContent,
        }}>
          {freq === 0 ? '0.000' : freq.toFixed(3)}
          <span style={{ fontSize: 18, marginLeft: 4 }}>Hz</span>
        </div>
        <div style={{
          fontSize: 13, fontFamily: '"JetBrains Mono"',
          color: freq === 0 ? '#ef4444' : freqColor,
          marginTop: 4, fontWeight: 600, opacity: rpContent,
        }}>
          {freq === 0 ? '\u26A0 SYSTEM BLACK' : freq < 49.0 ? '\u26A0 EMERGENCY' : freq < 49.7 ? '\u26A0 WARNING' : 'NOMINAL'}
        </div>

        {/* Blackout: MW offline counter */}
        {isBlackout && running && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderClr}` }}>
            <div style={{
              fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60',
              letterSpacing: '0.1em', marginBottom: 4,
            }}>CAPACITY OFFLINE</div>
            <div style={{
              fontSize: 22, fontFamily: '"JetBrains Mono"', color: '#ef4444', fontWeight: 700,
            }}>
              {mwOffline.toLocaleString()}
              <span style={{ fontSize: 12, color: '#ef4444aa', marginLeft: 4 }}>MW</span>
            </div>
            <div style={{
              marginTop: 6, height: 4, background: 'rgba(239,68,68,0.15)',
              borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 2, background: '#ef4444',
                width: `${Math.min(100, (mwOffline / 3000) * 100)}%`,
                transition: 'width 0.3s',
              }} />
            </div>
          </div>
        )}

        {/* VPP: Fleet counter */}
        {!isBlackout && running && (
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${borderClr}` }}>
            <div style={{
              fontSize: 10, fontFamily: '"JetBrains Mono"', color: '#64748b60',
              letterSpacing: '0.1em', marginBottom: 4,
            }}>VPP FLEET ACTIVE</div>
            <div style={{
              fontSize: 22, fontFamily: '"JetBrains Mono"', color: '#10b981', fontWeight: 700,
            }}>
              {vppActive.toLocaleString()}
              <span style={{ fontSize: 12, color: '#10b981aa', marginLeft: 4 }}>/ 1,100 homes</span>
            </div>
            <div style={{
              marginTop: 6, height: 4, background: 'rgba(16,185,129,0.15)',
              borderRadius: 2, overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', borderRadius: 2, background: '#10b981',
                width: `${(vppActive / 1100) * 100}%`,
                transition: 'width 0.3s',
              }} />
            </div>
            {vppActive > 0 && (
              <div style={{
                fontSize: 11, fontFamily: '"JetBrains Mono"', color: '#10b981aa',
                marginTop: 4,
              }}>
                6-second FCAS raise active
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Legend (bottom, offset right of left panel) ── */}
      <div style={{
        position: 'absolute', bottom: 10, left: 400, zIndex: 10,
        display: 'flex', gap: 16,
        opacity: bootFade(1.5, 0.5),
      }}>
        {isBlackout ? (
          <>
            {[
              { c: 'rgb(96,165,250)', l: 'Wind' },
              { c: 'rgb(251,146,60)', l: 'Gas' },
              { c: 'rgb(148,163,184)', l: 'Substation' },
              { c: 'rgb(167,139,250)', l: 'Interconnector' },
              { c: 'rgb(34,211,238)', l: 'Survived' },
            ].map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: i.c }} />
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: '"Inter"', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>{i.l}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            {[
              { c: 'rgb(16,185,129)', l: 'VPP Home (active)' },
              { c: 'rgb(100,116,139)', l: 'VPP Home (standby)' },
              { c: 'rgb(251,146,60)', l: 'Gas Generation' },
              { c: 'rgb(16,185,129)', l: 'Battery' },
            ].map(i => (
              <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: i.c }} />
                <span style={{ fontSize: 11, color: '#94a3b8', fontFamily: '"Inter"', textShadow: '0 0 6px rgba(0,0,0,0.9)' }}>{i.l}</span>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Center banner: SYSTEM BLACK / GRID STABLE ── */}
      {isSystemBlack && (
        <div style={{
          ...panelBase, position: 'absolute', zIndex: 10,
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          padding: '24px 48px', whiteSpace: 'nowrap',
          borderColor: 'rgba(239,68,68,0.6)',
          boxShadow: '0 0 40px rgba(239,68,68,0.25), inset 0 0 20px rgba(239,68,68,0.08)',
        }}>
          <Corners color="#ef4444" />
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontSize: 36, fontWeight: 800, fontFamily: '"JetBrains Mono"',
              color: '#ef4444', textShadow: '0 0 25px rgba(239,68,68,0.5)',
              opacity: Math.sin(Date.now() / 300) * 0.2 + 0.8,
            }}>
              {'\u26A0'} SYSTEM BLACK {'\u26A0'}
            </span>
            <div style={{
              fontSize: 14, fontFamily: '"JetBrains Mono"', color: '#ef4444aa',
              marginTop: 8,
            }}>
              850,000 connections — 1.7 million people — total darkness
            </div>
          </div>
        </div>
      )}

      {isGridStable && (
        <div style={{
          ...panelBase, position: 'absolute', zIndex: 10,
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          padding: '24px 48px', whiteSpace: 'nowrap',
          borderColor: 'rgba(16,185,129,0.5)',
          boxShadow: '0 0 40px rgba(16,185,129,0.2), inset 0 0 20px rgba(16,185,129,0.06)',
        }}>
          <Corners color="#10b981" />
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontSize: 36, fontWeight: 800, fontFamily: '"JetBrains Mono"',
              color: '#10b981', textShadow: '0 0 25px rgba(16,185,129,0.5)',
            }}>
              GRID STABLE
            </span>
            <div style={{
              fontSize: 14, fontFamily: '"JetBrains Mono"', color: '#10b981aa',
              marginTop: 8,
            }}>
              1,100 homes — autonomous response in seconds — 0 humans involved
            </div>
          </div>
        </div>
      )}

      {/* ── Blackout: Sept 28 2016 stamp (bottom-right) ── */}
      {isBlackout && (
        <div style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 10,
          opacity: bootFade(1.0, 0.5),
        }}>
          <div style={{
            fontSize: 11, fontFamily: '"JetBrains Mono"', color: '#64748b60',
            textAlign: 'right', textShadow: '0 0 8px rgba(0,0,0,0.9)',
          }}>
            SOUTH AUSTRALIA
            <br />28 SEPTEMBER 2016, 16:18 ACST
            <br />43-SECOND CASCADE
          </div>
        </div>
      )}

      {/* ── VPP: Context stamp (bottom-right) ── */}
      {!isBlackout && (
        <div style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 10,
          opacity: bootFade(1.0, 0.5),
        }}>
          <div style={{
            fontSize: 11, fontFamily: '"JetBrains Mono"', color: '#64748b60',
            textAlign: 'right', textShadow: '0 0 8px rgba(0,0,0,0.9)',
          }}>
            SOUTH AUSTRALIA VPP — PHASE 2
            <br />9 OCTOBER 2019
            <br />AEMO KNOWLEDGE SHARING REPORT
          </div>
        </div>
      )}
    </div>
  );
}
