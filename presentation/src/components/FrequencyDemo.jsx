import React, { useEffect, useRef, useState, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// Event-based scenarios — getDelta receives GRID TIME in seconds (real time × timeScale)
//
// Sources for all frequency values and timelines:
//   - ENTSO-E "Policy 1: Load-Frequency Control" (Continental Europe)
//   - ENTSO-E "Incident Classification Scale" (reference incident = 3,000 MW)
//   - UCTE Final Report: "System Disturbance on 4 November 2006"
//   - ENTSO-E "Continental Europe Synchronous Area Separation 8 January 2021"
//   - FCR: ~3,000 MW total, full activation within 30 seconds
//   - aFRR: ~3,000-5,000 MW, activates 30s–15min
//   - mFRR: ~10,000+ MW, activates 15min+
//   - UFLS thresholds: 49.0 Hz (Stage 1, 10-15%), 48.5 Hz (Stage 2), 48.0 Hz (Stage 3)
//   - Generator disconnect: 47.5 Hz (protection relay trip)
//
// Target: each scenario completes in ~5 real seconds for presentation pacing
const SCENARIOS = [
  {
    label: 'Generator Trip (800 MW)',
    color: 'accent',
    timeScale: 290, // consistent time scale across all scenarios
    // 800 MW = well within FCR dimensioning (3 GW). Grid handles this routinely.
    // Ref: ENTSO-E reports ~50 events/yr exceeding 500 MW loss. Recovery typically <15min.
    getDelta: (gt) => {
      if (gt < 2) return 0;                                                // system inertia (H ≈ 5-6s for CE)
      if (gt < 10) return -((gt - 2) / 8) * 0.2;                          // RoCoF ~0.025 Hz/s (moderate for 800MW in 300GW system)
      if (gt < 30) return -0.2 + 0.02 * Math.sin((gt - 10) * 0.3);       // nadir ~49.8 Hz, FCR arrests decline
      if (gt < 120) return -0.2 + ((gt - 30) / 90) * 0.12;               // aFRR restores (30s–15min)
      if (gt < 600) return -0.08 + ((gt - 120) / 480) * 0.06;            // mFRR + redispatch
      if (gt < 750) return -0.02 + ((gt - 600) / 150) * 0.02;            // final settling
      return 0;
    },
    events: [
      { gt: 2, type: 'warn', text: 'Inertia absorbs initial shock (H ≈ 5s)' },
      { gt: 5, type: 'info', text: 'RoCoF: 25 mHz/s — within normal range' },
      { gt: 10, type: 'warn', text: 'Nadir: 49.800 Hz — FCR activating' },
      { gt: 30, type: 'info', text: 'FCR fully deployed (3,000 MW reserve)' },
      { gt: 120, type: 'success', text: 'aFRR restoring — replacement reserves' },
      { gt: 600, type: 'success', text: 'mFRR + redispatch completing' },
      { gt: 750, type: 'nominal', text: 'Frequency nominal — 50.000 Hz' },
    ],
  },
  {
    label: '3 GW Loss (Reference Incident)',
    color: 'danger',
    timeScale: 290, // consistent time scale across all scenarios
    // 3 GW = ENTSO-E "reference incident" — the dimensioning event for Continental Europe FCR.
    // FCR is sized exactly for this: 3,000 MW, full activation within 30s.
    // Nadir ~49.75-49.80 Hz (well above UFLS at 49.0). No load shedding needed.
    // Ref: 2006 split was ~9 GW to hit 49.0 Hz. 3 GW stays within normal reserves.
    getDelta: (gt) => {
      if (gt < 1) return 0;                                                // inertia (H ≈ 5-6s for CE)
      if (gt < 10) return -((gt - 1) / 9) * 0.25;                         // RoCoF ~0.03 Hz/s
      if (gt < 30) return -0.25 + 0.03 * Math.sin((gt - 10) * 0.4);      // nadir ~49.75, FCR arrests
      if (gt < 180) return -0.25 + ((gt - 30) / 150) * 0.15;             // aFRR restores (full in 5min)
      if (gt < 600) return -0.1 + ((gt - 180) / 420) * 0.07;             // mFRR + redispatch
      if (gt < 900) return -0.03 + ((gt - 600) / 300) * 0.03;            // final settling
      return 0;
    },
    events: [
      { gt: 1, type: 'danger', text: '3 GW offline — ENTSO-E reference incident size' },
      { gt: 5, type: 'warn', text: 'RoCoF: 30 mHz/s — FCR activating' },
      { gt: 10, type: 'warn', text: 'Nadir: 49.750 Hz — within FCR design envelope' },
      { gt: 30, type: 'info', text: 'FCR fully deployed (3,000 MW in 30s)' },
      { gt: 180, type: 'success', text: 'aFRR restoring — frequency rising' },
      { gt: 600, type: 'success', text: 'mFRR + redispatch completing' },
      { gt: 900, type: 'nominal', text: 'Frequency nominal — 50.000 Hz' },
    ],
  },
  {
    label: 'Demand Drop (5 GW)',
    color: 'accent',
    timeScale: 290, // consistent time scale across all scenarios
    // Over-frequency is equally dangerous. At 51.5 Hz generators trip for self-protection.
    // Ref: 2021 CE grid split — NW area rose to 50.6 Hz from excess generation.
    getDelta: (gt) => {
      if (gt < 1) return 0;                                                // inertia
      if (gt < 8) return ((gt - 1) / 7) * 0.6;                            // frequency rises — excess generation
      if (gt < 20) return 0.6 + 0.04 * Math.sin((gt - 8) * 0.5);         // peak ~50.6 Hz (matches 2021 split)
      if (gt < 90) return 0.6 - ((gt - 20) / 70) * 0.35;                 // governors + AGC ramp down
      if (gt < 300) return 0.25 - ((gt - 90) / 210) * 0.18;              // settling
      if (gt < 600) return 0.07 - ((gt - 300) / 300) * 0.07;             // final return
      return 0;
    },
    events: [
      { gt: 1, type: 'warn', text: 'Sudden demand drop — 5 GW excess supply' },
      { gt: 4, type: 'warn', text: 'Frequency rising — governors responding' },
      { gt: 8, type: 'danger', text: 'Over-frequency: 50.6 Hz (generator trip risk at 51.5)' },
      { gt: 20, type: 'info', text: 'Automatic generation control ramping down' },
      { gt: 90, type: 'success', text: 'Generation curtailed — frequency falling' },
      { gt: 300, type: 'success', text: 'Frequency settling toward nominal' },
      { gt: 600, type: 'nominal', text: 'Frequency nominal — 50.000 Hz' },
    ],
  },
  {
    label: 'Cyber Attack',
    color: 'danger',
    timeScale: 290, // consistent time scale across all scenarios
    // Hypothetical coordinated SCADA compromise — modeled on Ukraine 2015/2016 attacks
    // but at Continental European scale. No real precedent at this scale.
    // Ref: Ukraine Dec 2015 — 230,000 customers, 6 hours. Ukraine Dec 2016 — Kyiv 1/5 capacity, 1 hour.
    getDelta: (gt) => {
      if (gt < 30) return 0;                                               // attacker in system, reconnaissance
      if (gt < 90) return -((gt - 30) / 60) * 0.5;                        // first generators tripped remotely
      if (gt < 150) return -0.5 - ((gt - 90) / 60) * 0.6;                // cascade — protection relays disabled
      if (gt < 210) return -1.1 - ((gt - 150) / 60) * 0.7;               // reserves overwhelmed, no coordination
      if (gt < 270) return -1.8 - ((gt - 210) / 60) * 0.8;               // into collapse
      return -2.6;                                                         // total blackout — below 47.5 Hz
    },
    events: [
      { gt: 5, type: 'warn', text: 'Anomalous SCADA traffic detected' },
      { gt: 30, type: 'danger', text: 'Generators tripped remotely (cf. Ukraine 2015)' },
      { gt: 60, type: 'danger', text: 'Protection relays compromised' },
      { gt: 90, type: 'danger', text: 'Cascade — safety interlocks disabled' },
      { gt: 150, type: 'danger', text: 'FCR exhausted — no coordinated response' },
      { gt: 210, type: 'danger', text: 'Uncontrolled islanding — loss of synchronism' },
      { gt: 270, type: 'danger', text: 'TOTAL BLACKOUT — below 47.5 Hz' },
    ],
  },
];

const HACKER_FRAMES = [
  [
    '    ╔══════════════════════════════╗',
    '    ║                              ║',
    '    ║      ┌─────────────────┐     ║',
    '    ║      │   ╭─────────╮   │     ║',
    '    ║      │   │  >_     │   │     ║',
    '    ║      │   │         │   │     ║',
    '    ║      │   ╰─────────╯   │     ║',
    '    ║      │  ┌───────────┐  │     ║',
    '    ║      │  │ ░░░░░░░░░ │  │     ║',
    '    ║      │  └───────────┘  │     ║',
    '    ║      └────────┬────────┘     ║',
    '    ║           ┌───┴───┐          ║',
    '    ║           └───────┘          ║',
    '    ║                              ║',
    '    ╚══════════════════════════════╝',
  ],
  [
    '    ╔══════════════════════════════╗',
    '    ║                              ║',
    '    ║      ┌─────────────────┐     ║',
    '    ║      │   ╭─────────╮   │     ║',
    '    ║      │   │  HA HA  │   │     ║',
    '    ║      │   │  HA HA  │   │     ║',
    '    ║      │   ╰─────────╯   │     ║',
    '    ║      │  ┌───────────┐  │     ║',
    '    ║      │  │ ▓▓▓▓▓▓▓▓▓ │  │     ║',
    '    ║      │  └───────────┘  │     ║',
    '    ║      └────────┬────────┘     ║',
    '    ║           ┌───┴───┐          ║',
    '    ║           └───────┘          ║',
    '    ║                              ║',
    '    ╚══════════════════════════════╝',
  ],
];

const TAUNT_LINES = [
  'ACCESS GRANTED',
  'SCADA SYSTEMS COMPROMISED',
  'lol nice firewall',
  'grid.shutdown() // ez',
  'should have used kubernetes ;)',
  'rm -rf /power/grid/*',
  '> transferring 400 GW to /dev/null',
];

// Grid protection thresholds (EU ENTSO-E / UFLS standards)
const THRESHOLDS = [
  { freq: 51.5, label: '51.500 Hz — GENERATOR TRIP (over-frequency)', color: colors.accent, lineAlpha: '30', textAlpha: '90' },
  { freq: 50.2, label: '50.200 Hz — PRIMARY RESERVE ACTIVATION', color: colors.primary, lineAlpha: '20', textAlpha: '70' },
  { freq: 50.0, label: '50.000 Hz — NOMINAL', color: colors.primary, lineAlpha: '30', textAlpha: 'bb' },
  { freq: 49.8, label: '49.800 Hz — FREQUENCY CONTAINMENT RESERVES', color: colors.primary, lineAlpha: '20', textAlpha: '70' },
  { freq: 49.5, label: '49.500 Hz — ALERT STATE', color: colors.accent, lineAlpha: '30', textAlpha: 'aa' },
  { freq: 49.0, label: '49.000 Hz — UFLS STAGE 1 (10% load shed)', color: colors.danger, lineAlpha: '30', textAlpha: 'bb' },
  { freq: 48.5, label: '48.500 Hz — UFLS STAGE 2 (additional 15%)', color: colors.danger, lineAlpha: '30', textAlpha: 'bb' },
  { freq: 48.0, label: '48.000 Hz — UFLS STAGE 3 — RELAY TRIP', color: colors.danger, lineAlpha: '40', textAlpha: 'dd' },
  { freq: 47.5, label: '47.500 Hz — TOTAL COLLAPSE', color: colors.danger, lineAlpha: '50', textAlpha: 'ee' },
];

export default function FrequencyDemo({ width = 900, height = 480, panelWidth = 0 }) {
  const canvasWidth = panelWidth > 0 ? width - panelWidth : width;
  const canvasRef = useRef(null);
  const hackerCanvasRef = useRef(null);
  const hackerAnimRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const targetFreqRef = useRef(50.0);
  const currentFreqRef = useRef(50.0);
  const [scenario, setScenario] = useState(-1); // -1 = stable/reset
  const scenarioRef = useRef(-1);
  const activeInstancesRef = useRef([]); // array of { scenarioIdx, startTime, num }
  const instanceCounterRef = useRef(0); // monotonic counter for instance numbering
  const [hackerTakeover, setHackerTakeover] = useState(false);
  const warningFlashRef = useRef(0);
  const collapseTimeRef = useRef(null);
  const explosionParticlesRef = useRef([]);
  const glitchRef = useRef({ active: false, startTime: 0 });
  const hackerPhaseRef = useRef(0);
  // Per-threshold highlight state: { crossed, uncrossedSince, highlight (0-1) }
  const thresholdStateRef = useRef(THRESHOLDS.map(() => ({ crossed: false, uncrossedSince: null, highlight: 0 })));
  // Latched status text to prevent flickering near boundaries
  const lastStatusRef = useRef({ text: 'GRID STABLE', color: colors.primary, severity: 0, clearedAt: null });
  // Latched alert banner state: 'none' | 'shedding' | 'imminent', with 2s holdoff
  const bannerRef = useRef({ level: 'none', clearedAt: null });
  // Latched line/readout color with 2s holdoff
  const lineColorRef = useRef({ color: colors.primary, clearedAt: null });
  // Rolling 5s window for frequency delta display
  const freqWindowRef = useRef([]);
  // Panel state: exposed freq data for the HTML readout panel
  const [panelData, setPanelData] = useState({
    freq: 50.0, delta: 0, statusText: 'GRID STABLE', statusColor: colors.primary,
    statusSeverity: 0, lineColor: colors.primary, gridTime: 0, timeScale: 100,
  });
  const [visibleEvents, setVisibleEvents] = useState([]);
  const eventFeedRef = useRef(null);

  // Restart animation when slide becomes active
  const slideContext = useContext(SlideContext);
  useEffect(() => {
    if (slideContext?.isSlideActive) {
      setScenario(-1);
      scenarioRef.current = -1;
      activeInstancesRef.current = [];
      instanceCounterRef.current = 0;
      targetFreqRef.current = 50.0;
      currentFreqRef.current = 50.0;
      collapseTimeRef.current = null;
      hackerPhaseRef.current = 0;
      setHackerTakeover(false);
      glitchRef.current = { active: false, startTime: 0 };
      explosionParticlesRef.current = [];
      thresholdStateRef.current = THRESHOLDS.map(() => ({ crossed: false, uncrossedSince: null, highlight: 0 }));
      lastStatusRef.current = { text: 'GRID STABLE', color: colors.primary, severity: 0, clearedAt: null };
      bannerRef.current = { level: 'none', clearedAt: null };
      lineColorRef.current = { color: colors.primary, clearedAt: null };
      setVisibleEvents([]);
    }
  }, [slideContext?.isSlideActive]);

  const switchScenario = (idx) => {
    if (scenarioRef.current === idx) {
      // Same scenario clicked again — stack a new instance on top
      instanceCounterRef.current += 1;
      activeInstancesRef.current = [
        ...activeInstancesRef.current,
        { scenarioIdx: idx, startTime: performance.now() / 1000, num: instanceCounterRef.current },
      ];
      return;
    }
    // Different scenario — clear everything and start fresh
    setScenario(idx);
    scenarioRef.current = idx;
    instanceCounterRef.current = 1;
    activeInstancesRef.current = [
      { scenarioIdx: idx, startTime: performance.now() / 1000, num: 1 },
    ];
    targetFreqRef.current = 50.0;
    currentFreqRef.current = 50.0;
    setVisibleEvents([]);
    collapseTimeRef.current = null;
    hackerPhaseRef.current = 0;
    setHackerTakeover(false);
    glitchRef.current = { active: false, startTime: 0 };
    explosionParticlesRef.current = [];
    thresholdStateRef.current = THRESHOLDS.map(() => ({ crossed: false, uncrossedSince: null, highlight: 0 }));
    lastStatusRef.current = { text: 'GRID STABLE', color: colors.primary, severity: 0, clearedAt: null };
    bannerRef.current = { level: 'none', clearedAt: null };
    lineColorRef.current = { color: colors.primary, clearedAt: null };
  };

  const resetToStable = () => {
    setScenario(-1);
    scenarioRef.current = -1;
    activeInstancesRef.current = [];
    instanceCounterRef.current = 0;
    targetFreqRef.current = 50.0;
    currentFreqRef.current = 50.0;
    tRef.current = 0;
    collapseTimeRef.current = null;
    hackerPhaseRef.current = 0;
    setHackerTakeover(false);
    glitchRef.current = { active: false, startTime: 0 };
    explosionParticlesRef.current = [];
    thresholdStateRef.current = THRESHOLDS.map(() => ({ crossed: false, uncrossedSince: null, highlight: 0 }));
    lastStatusRef.current = { text: 'GRID STABLE', color: colors.primary, severity: 0, clearedAt: null };
    bannerRef.current = { level: 'none', clearedAt: null };
    lineColorRef.current = { color: colors.primary, clearedAt: null };
    freqWindowRef.current = [];
    setVisibleEvents([]);
    setPanelData({
      freq: 50.0, delta: 0, statusText: 'GRID STABLE', statusColor: colors.primary,
      statusSeverity: 0, lineColor: colors.primary, gridTime: 0, timeScale: 100,
    });
  };

  // Arrow key navigation: step through scenarios, then release to Spectacle
  useEffect(() => {
    if (!slideContext?.isSlideActive) return;
    const handler = (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;

      if (e.key === 'ArrowRight') {
        const next = scenarioRef.current + 1;
        if (next < SCENARIOS.length) {
          e.stopPropagation();
          e.preventDefault();
          switchScenario(next);
        }
        // else: let Spectacle handle it (advance slide)
      }

      if (e.key === 'ArrowLeft') {
        const prev = scenarioRef.current - 1;
        if (prev >= 0) {
          e.stopPropagation();
          e.preventDefault();
          switchScenario(prev);
        } else if (scenarioRef.current === 0) {
          // Go back to stable state
          e.stopPropagation();
          e.preventDefault();
          resetToStable();
        }
        // else scenario is -1 (stable): let Spectacle handle it (previous slide)
      }
    };
    // Use capture phase to intercept before Spectacle
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [slideContext?.isSlideActive]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = canvasWidth * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const historyLen = 300;
    const history = new Array(historyLen).fill(50.0);

    // Pre-generate noise texture for glitch phase
    const miniNoiseSize = 128;
    const miniNoiseCanvas = document.createElement('canvas');
    miniNoiseCanvas.width = miniNoiseSize;
    miniNoiseCanvas.height = miniNoiseSize;
    const miniNoiseCtx = miniNoiseCanvas.getContext('2d');
    const miniNoiseData = miniNoiseCtx.createImageData(miniNoiseSize, miniNoiseSize);
    for (let i = 0; i < miniNoiseData.data.length; i += 4) {
      if (Math.random() < 0.15) {
        miniNoiseData.data[i] = 239; miniNoiseData.data[i + 1] = 68; miniNoiseData.data[i + 2] = 68;
        miniNoiseData.data[i + 3] = Math.floor(Math.random() * 80);
      }
    }
    miniNoiseCtx.putImageData(miniNoiseData, 0, 0);

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      if (isActive) {
        tRef.current += 0.03;
        warningFlashRef.current += 0.05;
      }
      const t = tRef.current;

      // Update target from stacked scenario instances (delta-based)
      let gridTime = 0;
      const instances = activeInstancesRef.current;
      if (instances.length > 0) {
        let target = 50.0;
        const nowSec = performance.now() / 1000;
        for (const inst of instances) {
          const sc = SCENARIOS[inst.scenarioIdx];
          const elapsed = (nowSec - inst.startTime) * sc.timeScale;
          target += sc.getDelta(elapsed);
        }
        targetFreqRef.current = target;
        // gridTime for display uses first (oldest) instance
        const firstSc = SCENARIOS[instances[0].scenarioIdx];
        gridTime = (nowSec - instances[0].startTime) * firstSc.timeScale;
      }

      // Smooth interpolation toward target — faster for large drops, gentle for small ones
      const target = targetFreqRef.current;
      const gap = Math.abs(target - currentFreqRef.current);
      const speed = gap > 2 ? 0.012 : gap > 1 ? 0.007 : gap > 0.3 ? 0.004 : 0.002;
      currentFreqRef.current += (target - currentFreqRef.current) * speed;

      const instability = Math.abs(50.0 - currentFreqRef.current);
      const jitter = Math.sin(t * 5) * 0.02 + Math.sin(t * 13) * 0.01 + Math.sin(t * 31) * instability * 0.08;
      const freq = currentFreqRef.current + jitter;

      history.push(freq);
      if (history.length > historyLen) history.shift();

      // Track 5s rolling window for delta display
      const nowMs = performance.now();
      freqWindowRef.current.push({ t: nowMs, f: freq });
      const cutoff = nowMs - 5000;
      while (freqWindowRef.current.length > 0 && freqWindowRef.current[0].t < cutoff) {
        freqWindowRef.current.shift();
      }
      let freqMax = -Infinity, freqMin = Infinity;
      for (let i = 0; i < freqWindowRef.current.length; i++) {
        const f = freqWindowRef.current[i].f;
        if (f > freqMax) freqMax = f;
        if (f < freqMin) freqMin = f;
      }
      const freqDelta = (freqMax - freqMin) / 2;

      // Smoothed frequency for all latched/hysteresis logic
      const sf = currentFreqRef.current;

      // Update threshold highlight state (use smoothed freq to avoid jitter)
      const smoothFreq = sf;
      const now = performance.now() / 1000;
      const tStates = thresholdStateRef.current;
      for (let i = 0; i < THRESHOLDS.length; i++) {
        const th = THRESHOLDS[i];
        const st = tStates[i];
        // Skip nominal line — always visible, never highlighted
        if (th.freq === 50.0) continue;
        // Crossed = frequency went past this threshold
        const isCrossed = th.freq > 50.0 ? smoothFreq > th.freq : smoothFreq < th.freq;
        if (isCrossed) {
          st.crossed = true;
          st.uncrossedSince = null;
          // Fade in highlight quickly
          st.highlight = Math.min(1, st.highlight + 0.04);
        } else if (st.crossed) {
          // Just uncrossed — start the 2s cooldown
          if (st.uncrossedSince === null) st.uncrossedSince = now;
          if (now - st.uncrossedSince > 2) {
            // 2s passed — fade out
            st.highlight = Math.max(0, st.highlight - 0.02);
            if (st.highlight <= 0) { st.crossed = false; st.uncrossedSince = null; }
          }
          // else hold highlight steady during 2s grace period
        }
      }

      // Push panel data to state for the HTML readout panel (throttled to ~15fps)
      if (panelWidth > 0 && Math.floor(t * 15) !== Math.floor((t - 0.03) * 15)) {
        setPanelData({
          freq, delta: freqDelta, statusText: lastStatusRef.current.text,
          statusColor: lastStatusRef.current.color, statusSeverity: lastStatusRef.current.severity,
          lineColor: lineColorRef.current.color, gridTime,
          timeScale: instances.length > 0 ? (SCENARIOS[instances[0].scenarioIdx].timeScale || 100) : 100,
        });
        // Update visible events from all active instances
        if (instances.length > 0) {
          const allEvts = [];
          const nowEvt = performance.now() / 1000;
          for (const inst of instances) {
            const sc = SCENARIOS[inst.scenarioIdx];
            const instElapsed = (nowEvt - inst.startTime) * sc.timeScale;
            const prefix = inst.num > 1 ? `#${inst.num} ` : '';
            if (inst.num > 1) {
              allEvts.push({ gt: 0, type: 'info', text: `── Instance #${inst.num} ──`, isDivider: true, key: `div-${inst.num}` });
            }
            for (const evt of sc.events) {
              if (instElapsed >= evt.gt) {
                allEvts.push({ ...evt, text: prefix + evt.text, key: `${inst.num}-${evt.gt}` });
              }
            }
          }
          setVisibleEvents(prev => prev.length !== allEvts.length ? allEvts : prev);
        }
      }

      // Detect collapse trigger
      if (freq < 47.6 && !collapseTimeRef.current) {
        collapseTimeRef.current = t;
        hackerPhaseRef.current = 1;
        // Spawn explosion particles
        const particles = [];
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 5;
          particles.push({
            x: canvasWidth / 2, y: height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 6,
            life: 1.0,
            color: Math.random() > 0.5 ? colors.danger : (Math.random() > 0.5 ? colors.accent : '#ff6b35'),
          });
        }
        explosionParticlesRef.current = particles;
      }

      const collapseElapsed = collapseTimeRef.current ? t - collapseTimeRef.current : 0;

      // Phase transitions — glitch starts while BLACKOUT text is still fading
      if (collapseElapsed > 1.5 && hackerPhaseRef.current === 1) {
        hackerPhaseRef.current = 2; // glitch
        glitchRef.current = { active: true, startTime: t };
        setHackerTakeover(true);
      }
      if (collapseElapsed > 4 && hackerPhaseRef.current === 2) {
        hackerPhaseRef.current = 3; // hacker
      }

      // ═══ PHASE 3: HACKER SCREEN ═══
      if (hackerPhaseRef.current === 3) {
        ctx.fillStyle = '#020804';
        ctx.fillRect(0, 0, canvasWidth, height);

        // Scanlines
        for (let y = 0; y < height; y += 3) {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.02 + Math.sin(y * 0.1 + t * 2) * 0.01})`;
          ctx.fillRect(0, y, canvasWidth, 1);
        }

        // CRT flicker
        const flicker = 0.92 + Math.random() * 0.08;
        ctx.globalAlpha = flicker;

        // Hacker ASCII art
        const hackerFrame = HACKER_FRAMES[Math.floor(t * 2) % 2];
        ctx.font = '14px JetBrains Mono';
        ctx.textAlign = 'center';
        const artStartY = 40;
        hackerFrame.forEach((line, i) => {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.7 + Math.sin(t * 3 + i * 0.5) * 0.3})`;
          ctx.fillText(line, canvasWidth / 2, artStartY + i * 16);
        });

        // Taunt text - types out character by character
        const tauntIdx = Math.floor((collapseElapsed - 3) / 1.5) % TAUNT_LINES.length;
        const tauntProgress = ((collapseElapsed - 3) % 1.5) / 1.5;
        const currentTaunt = TAUNT_LINES[tauntIdx];
        const visibleChars = Math.floor(tauntProgress * currentTaunt.length * 1.5);
        const displayText = currentTaunt.substring(0, Math.min(visibleChars, currentTaunt.length));

        ctx.font = 'bold 18px JetBrains Mono';
        ctx.fillStyle = colors.success;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.success;
        ctx.fillText('> ' + displayText + (Math.sin(t * 6) > 0 ? '█' : ''), canvasWidth / 2, artStartY + hackerFrame.length * 16 + 30);
        ctx.shadowBlur = 0;

        // Laughing text that bounces
        if (collapseElapsed > 7) {
          const laughT = collapseElapsed - 7;
          const bounce = Math.abs(Math.sin(laughT * 4)) * 10;
          ctx.font = `bold ${24 + Math.sin(laughT * 8) * 4}px JetBrains Mono`;
          ctx.fillStyle = colors.success;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.success;
          ctx.textAlign = 'center';

          const laughText = 'HA '.repeat(Math.min(Math.floor(laughT * 3) + 1, 8)).trim();
          ctx.fillText(laughText, canvasWidth / 2 + Math.sin(laughT * 5) * 8, height - 70 - bounce);
          ctx.shadowBlur = 0;

          // Small subtitle — typewriter
          ctx.font = '12px JetBrains Mono';
          ctx.fillStyle = colors.success + '80';
          const chatMsg = '[ grid_operator has left the chat ]';
          const chatChars = Math.min(chatMsg.length, Math.floor((laughT - 1) * 25));
          if (chatChars > 0) {
            ctx.fillText(chatMsg.substring(0, chatChars) + (chatChars < chatMsg.length && Math.sin(t * 6) > 0 ? '█' : ''), canvasWidth / 2, height - 40);
          }
        }

        // Matrix rain in background
        ctx.font = '11px JetBrains Mono';
        for (let col = 0; col < 30; col++) {
          const x = col * (canvasWidth / 30);
          const charIdx = Math.floor(t * 8 + col * 7) % 30;
          for (let row = 0; row < 4; row++) {
            const y = ((charIdx + row * 8) * 20) % height;
            const alpha = 0.05 + (row === 0 ? 0.15 : 0);
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            const chars = '01アイウエオカキクケコ';
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
          }
        }

        ctx.globalAlpha = 1;

        // "Press Stable to restore" hint
        const hintFlash = Math.sin(t * 2) > 0;
        if (hintFlash) {
          ctx.font = '11px JetBrains Mono';
          ctx.fillStyle = colors.textDim + '60';
          ctx.textAlign = 'center';
          ctx.fillText('[ click STABLE to restore grid ]', canvasWidth / 2, height - 50);
        }

        if (isActive) animRef.current = requestAnimationFrame(draw);
        return;
      }

      // ═══ PHASE 2: GLITCH TRANSITION ═══
      if (hackerPhaseRef.current === 2) {
        // Draw normal frame first, then corrupt it
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, canvasWidth, height);

        const glitchIntensity = Math.min(1, (t - glitchRef.current.startTime) * 0.5);

        // Random block displacement
        for (let i = 0; i < 15 * glitchIntensity; i++) {
          const blockH = 5 + Math.random() * 30;
          const blockY = Math.random() * height;
          const shift = (Math.random() - 0.5) * 100 * glitchIntensity;
          ctx.drawImage(canvas, 0, blockY * 2, canvasWidth * 2, blockH * 2, shift, blockY, canvasWidth, blockH);
        }

        // Red/cyan split
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 * glitchIntensity})`;
        ctx.fillRect(Math.random() * 20 - 10, 0, canvasWidth, height);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.1 * glitchIntensity})`;
        ctx.fillRect(Math.random() * -20 + 10, 0, canvasWidth, height);
        ctx.globalCompositeOperation = 'source-over';

        // Corrupted text
        ctx.font = 'bold 28px JetBrains Mono';
        ctx.textAlign = 'center';
        const corruptTexts = ['SYSTEM FAILURE', 'ERR_GRID_DOWN', 'FATAL: frequency.c:47', 'segfault in power_balance()', '*** KERNEL PANIC ***'];
        for (let i = 0; i < 3 + glitchIntensity * 5; i++) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + Math.random() * 0.5})`;
          const txt = corruptTexts[Math.floor(Math.random() * corruptTexts.length)];
          ctx.fillText(txt, canvasWidth / 2 + (Math.random() - 0.5) * 40, Math.random() * height);
        }

        // Static noise — stamp pre-generated texture
        ctx.globalAlpha = 0.6 * glitchIntensity;
        for (let i = 0; i < 3 + glitchIntensity * 3; i++) {
          ctx.drawImage(miniNoiseCanvas, Math.random() * canvasWidth, Math.random() * height);
        }
        ctx.globalAlpha = 1;

        if (isActive) animRef.current = requestAnimationFrame(draw);
        return;
      }

      // ═══ NORMAL / PHASE 1 (explosion overlay) ═══
      ctx.clearRect(0, 0, canvasWidth, height);

      // Chart area: fixed 480px height, offset down to leave room for timer overlay
      const chartOffsetY = height > 600 ? 100 : 0;
      const chartH = Math.min(height - chartOffsetY - 60, 520);
      const freqToY = (f) => {
        const top = 52;
        const bottom = 47;
        return chartOffsetY + 10 + (top - f) / (top - bottom) * chartH;
      };

      // Danger zone bg
      if (freq < 49.5) {
        const dangerAlpha = Math.min(0.15, (49.5 - freq) * 0.1);
        const pulse = Math.sin(warningFlashRef.current * 3) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${dangerAlpha * (0.5 + pulse * 0.5)})`;
        const y49 = freqToY(49.0);
        ctx.fillRect(0, y49, canvasWidth, height - y49);
      }

      // Threshold lines — grid protection boundaries
      ctx.lineWidth = 1;
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';

      const tStatesNow = thresholdStateRef.current;
      for (let i = 0; i < THRESHOLDS.length; i++) {
        const th = THRESHOLDS[i];
        const y = freqToY(th.freq);
        if (y < 5 || y > height - 5) continue;

        const hl = tStatesNow[i].highlight; // 0-1

        // Line — thicker and brighter when highlighted
        ctx.setLineDash([3, 5]);
        const baseLineAlpha = parseInt(th.lineAlpha, 16) / 255;
        const lineAlpha = Math.min(1, baseLineAlpha + hl * 0.6);
        ctx.lineWidth = 1 + hl * 1.5;
        ctx.strokeStyle = th.color + Math.round(lineAlpha * 255).toString(16).padStart(2, '0');
        if (hl > 0.3) { ctx.shadowBlur = 8 * hl; ctx.shadowColor = th.color; }
        ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;

        // Label — brighter when highlighted
        const baseTextAlpha = parseInt(th.textAlpha, 16) / 255;
        const textAlpha = Math.min(1, baseTextAlpha + hl * 0.4);
        ctx.fillStyle = th.color + Math.round(textAlpha * 255).toString(16).padStart(2, '0');
        ctx.fillText(th.label, 62, y - 6);
      }
      ctx.setLineDash([]);

      // Frequency trace — latched color with 2s holdoff
      const rawLineColor = sf < 49.0 ? colors.danger : sf < 49.5 ? colors.accent : colors.primary;
      const lc = lineColorRef.current;
      if (rawLineColor !== colors.primary) {
        // Escalate: always adopt worse color immediately
        if (rawLineColor === colors.danger || lc.color === colors.primary) {
          lc.color = rawLineColor;
        }
        lc.clearedAt = null;
      } else if (lc.color !== colors.primary) {
        if (lc.clearedAt === null) lc.clearedAt = now;
        if (now - lc.clearedAt > 2) {
          lc.color = colors.primary;
          lc.clearedAt = null;
        }
      }
      const lineColor = lc.color;

      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = lineColor;
      history.forEach((f, i) => {
        const x = 60 + (i / historyLen) * (canvasWidth - 80);
        const y = freqToY(f);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glow dot
      const dotX = canvasWidth - 20;
      const dotY = freqToY(freq);
      ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.fillStyle = lineColor; ctx.fill();
      ctx.beginPath(); ctx.arc(dotX, dotY, 10, 0, Math.PI * 2); ctx.fillStyle = lineColor + '30'; ctx.fill();

      // Frequency readout — only on canvas when no panel
      if (!panelWidth) {
        ctx.fillStyle = lineColor;
        ctx.font = 'bold 36px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.shadowBlur = 20;
        ctx.shadowColor = lineColor;

        if (hackerPhaseRef.current === 1 && collapseElapsed > 1) {
          const glitchOffset = (Math.random() - 0.5) * 10;
          ctx.fillText(`${freq.toFixed(3)} Hz`, canvasWidth - 16 + glitchOffset, 40 + (Math.random() - 0.5) * 4);
        } else {
          ctx.fillText(`${freq.toFixed(3)} Hz`, canvasWidth - 16, 40);
        }
        ctx.shadowBlur = 0;

        // Delta indicator
        const deltaColor = freqDelta > 0.5 ? colors.danger : freqDelta > 0.1 ? colors.accent : colors.textDim;
        ctx.font = '16px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillStyle = deltaColor;
        ctx.font = 'bold 36px JetBrains Mono';
        const actualFreqWidth = ctx.measureText(`${freq.toFixed(3)} Hz`).width;
        ctx.font = '16px JetBrains Mono';
        ctx.fillText(`\u0394\u00b1${freqDelta.toFixed(3)}`, canvasWidth - 16 - actualFreqWidth - 12, 40);
      }

      // Status — latched with 2s holdoff before returning to a calmer state
      const statusZones = [
        { below: 47.5, status: 'GRID COLLAPSE', color: colors.danger, severity: 5 },
        { below: 48.5, status: 'EMERGENCY — ROLLING BLACKOUTS', color: colors.danger, severity: 4 },
        { below: 49.0, status: 'LOAD SHEDDING ACTIVE', color: colors.danger, severity: 3 },
        { below: 49.5, status: 'WARNING — RESERVES ACTIVATED', color: colors.accent, severity: 2 },
        { below: 49.8, status: 'FREQUENCY DEVIATION', color: colors.accent, severity: 1 },
      ];
      let rawStatus = { text: 'GRID STABLE', color: colors.primary, severity: 0 };
      for (const z of statusZones) {
        if (sf < z.below) { rawStatus = z; break; }
      }
      const ls = lastStatusRef.current;
      if (rawStatus.severity >= ls.severity) {
        // Escalating or same — update immediately
        ls.text = rawStatus.text;
        ls.color = rawStatus.color;
        ls.severity = rawStatus.severity;
        ls.clearedAt = null;
      } else {
        // De-escalating — hold for 2s
        if (ls.clearedAt === null) ls.clearedAt = now;
        if (now - ls.clearedAt > 2) {
          ls.text = rawStatus.text;
          ls.color = rawStatus.color;
          ls.severity = rawStatus.severity;
          ls.clearedAt = null;
        }
      }
      const status = ls.text;
      let statusColor = ls.color;

      // Status text and timer — only on canvas when no panel
      if (!panelWidth) {
        ctx.font = '14px JetBrains Mono';
        ctx.textAlign = 'right';
        if (ls.severity >= 3) {
          const flash = Math.sin(warningFlashRef.current * 4) > 0;
          ctx.fillStyle = flash ? statusColor : statusColor + '40';
        } else {
          ctx.fillStyle = statusColor + 'cc';
        }
        ctx.fillText(status, canvasWidth - 16, 60);

        // Elapsed grid time timer (top-left, under Y-axis label area)
        if (instances.length > 0 && gridTime > 0) {
          const totalSec = Math.floor(gridTime);
          const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
          const ss = String(totalSec % 60).padStart(2, '0');
          const firstSc2 = SCENARIOS[instances[0].scenarioIdx];
          const timeScaleVal = firstSc2.timeScale || 100;

          const totalMin = Math.floor(totalSec / 60);
          let timeStr;
          if (totalMin >= 160) {
            const hh = String(Math.floor(totalMin / 60)).padStart(2, '0');
            const mmFmt = String(totalMin % 60).padStart(2, '0');
            timeStr = `T+${hh}h${mmFmt}m`;
          } else {
            timeStr = `T+${mm}:${ss}`;
          }

          if (chartOffsetY > 0) {
            // Full-page mode: large timer in its own section above chart
            ctx.textAlign = 'center';
            ctx.font = 'bold 48px JetBrains Mono';
            ctx.fillStyle = statusColor;
            ctx.shadowBlur = 16;
            ctx.shadowColor = statusColor + '40';
            ctx.fillText(timeStr, canvasWidth / 2, 65);
            ctx.shadowBlur = 0;

            ctx.font = '16px JetBrains Mono';
            ctx.fillStyle = colors.textDim;
            ctx.fillText(`${timeScaleVal}x speed`, canvasWidth / 2, 88);
          } else {
            // Compact mode: small timer top-left
            ctx.textAlign = 'left';
            ctx.font = 'bold 22px JetBrains Mono';
            ctx.fillStyle = colors.text;
            ctx.fillText(timeStr, 10, 24);

            ctx.font = '12px JetBrains Mono';
            ctx.fillStyle = colors.textDim;
            ctx.fillText(`${timeScaleVal}x speed`, 10, 42);
          }
        }
      }

      // Alert banners — latched with 2s holdoff (use smoothed freq)
      const rawBannerLevel = sf < 48.5 ? 'imminent' : sf < 49.0 ? 'shedding' : 'none';
      const bn = bannerRef.current;
      if (rawBannerLevel !== 'none') {
        // Escalate or maintain
        if (rawBannerLevel === 'imminent' || bn.level !== 'imminent') {
          bn.level = rawBannerLevel;
        }
        bn.clearedAt = null;
      } else if (bn.level !== 'none') {
        // Condition cleared — start 2s holdoff
        if (bn.clearedAt === null) bn.clearedAt = now;
        if (now - bn.clearedAt > 2) {
          bn.level = 'none';
          bn.clearedAt = null;
        }
      }

      if (bn.level === 'imminent') {
        const flash = Math.sin(warningFlashRef.current * 6) > 0;
        ctx.font = 'bold 21px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillStyle = flash ? colors.danger : colors.danger + '40';
        ctx.fillText('\u26a0  GRID FAILURE IMMINENT  \u26a0', canvasWidth / 2, height - 52);
      } else if (bn.level === 'shedding') {
        const flash = Math.sin(warningFlashRef.current * 3) > 0.3;
        ctx.font = '18px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillStyle = flash ? colors.danger + 'cc' : colors.danger + '40';
        ctx.fillText('AUTOMATIC LOAD SHEDDING IN PROGRESS', canvasWidth / 2, height - 48);
      }

      // Left axis
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'right';
      for (let f = 47.5; f <= 51.5; f += 0.5) {
        const y = freqToY(f);
        if (y > 10 && y < height - 10) ctx.fillText(f.toFixed(1), 54, y + 3);
      }

      // ═══ EXPLOSION PARTICLES (Phase 1) ═══
      if (hackerPhaseRef.current === 1) {
        const particles = explosionParticlesRef.current;

        // Screen shake
        if (collapseElapsed < 1.5) {
          const shakeFade = 1 - collapseElapsed / 1.5;
          const shakeX = (Math.random() - 0.5) * 20 * shakeFade;
          const shakeY = (Math.random() - 0.5) * 20 * shakeFade;
          ctx.translate(shakeX, shakeY);
        }

        // White flash at moment of collapse
        if (collapseElapsed < 0.3) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - collapseElapsed / 0.3)})`;
          ctx.fillRect(-20, -20, canvasWidth + 40, height + 40);
        }

        // Draw & update particles
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05; // gravity
          p.life -= 0.008;

          if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        // "BOOM" text
        if (collapseElapsed < 1.5) {
          const boomScale = Math.min(1, collapseElapsed * 3);
          const boomAlpha = Math.max(0, 1 - collapseElapsed / 1.5);
          ctx.font = `bold ${100 * boomScale}px JetBrains Mono`;
          ctx.fillStyle = `rgba(239, 68, 68, ${boomAlpha})`;
          ctx.textAlign = 'center';
          ctx.shadowBlur = 60;
          ctx.shadowColor = colors.danger;
          ctx.fillText('BLACKOUT', canvasWidth / 2, height / 2);
          ctx.shadowBlur = 0;
        }

        ctx.setTransform(2, 0, 0, 2, 0, 0); // reset shake
      }

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [canvasWidth, height, slideContext?.isSlideActive, scenario]);

  // Fullscreen hacker canvas animation
  useEffect(() => {
    if (!hackerTakeover) return;
    const canvas = hackerCanvasRef.current;
    if (!canvas) return;
    const fw = window.innerWidth;
    const fh = window.innerHeight;
    canvas.width = fw * 2;
    canvas.height = fh * 2;
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    const startTime = performance.now() / 1000;

    // Pre-generate noise texture (256×256) — stamp a few times instead of thousands of putImageData
    const noiseSize = 256;
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext('2d');
    const noiseData = noiseCtx.createImageData(noiseSize, noiseSize);
    for (let i = 0; i < noiseData.data.length; i += 4) {
      if (Math.random() < 0.15) {
        noiseData.data[i] = 239; noiseData.data[i + 1] = 68; noiseData.data[i + 2] = 68;
        noiseData.data[i + 3] = Math.floor(Math.random() * 80);
      }
    }
    noiseCtx.putImageData(noiseData, 0, 0);

    // Pre-generate scanline pattern (1×6 tile)
    const scanCanvas = document.createElement('canvas');
    scanCanvas.width = 1;
    scanCanvas.height = 6;
    const scanCtx = scanCanvas.getContext('2d');
    scanCtx.fillStyle = 'rgba(16, 185, 129, 0.025)';
    scanCtx.fillRect(0, 3, 1, 1);

    const drawHacker = () => {
      const now = performance.now() / 1000;
      const t = now - startTime;
      const collapseElapsed = t;
      const phase = hackerPhaseRef.current;

      // GLITCH phase
      if (phase === 2) {
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, fw, fh);
        const glitchIntensity = Math.min(1, t * 0.5);

        const blockCount = Math.floor(12 * glitchIntensity);
        for (let i = 0; i < blockCount; i++) {
          const blockH = 5 + Math.random() * 40;
          const blockY = Math.random() * fh;
          const shift = (Math.random() - 0.5) * 150 * glitchIntensity;
          ctx.drawImage(canvas, 0, blockY * 2, fw * 2, blockH * 2, shift, blockY, fw, blockH);
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 * glitchIntensity})`;
        ctx.fillRect(Math.random() * 20 - 10, 0, fw, fh);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.1 * glitchIntensity})`;
        ctx.fillRect(Math.random() * -20 + 10, 0, fw, fh);
        ctx.globalCompositeOperation = 'source-over';

        ctx.font = 'bold 42px JetBrains Mono';
        ctx.textAlign = 'center';
        const corruptTexts = ['SYSTEM FAILURE', 'ERR_GRID_DOWN', 'FATAL: frequency.c:47', 'segfault in power_balance()', '*** KERNEL PANIC ***'];
        const textCount = Math.floor(5 + glitchIntensity * 6);
        for (let i = 0; i < textCount; i++) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + Math.random() * 0.5})`;
          const txt = corruptTexts[Math.floor(Math.random() * corruptTexts.length)];
          ctx.fillText(txt, fw / 2 + (Math.random() - 0.5) * fw * 0.6, Math.random() * fh);
        }

        // Stamp pre-generated noise texture at random offsets (4-8 stamps instead of thousands of putImageData)
        ctx.globalAlpha = 0.6 * glitchIntensity;
        const stamps = Math.floor(4 + glitchIntensity * 4);
        for (let i = 0; i < stamps; i++) {
          const ox = Math.random() * fw;
          const oy = Math.random() * fh;
          ctx.drawImage(noiseCanvas, ox, oy, noiseSize, noiseSize);
          ctx.drawImage(noiseCanvas, ox - fw, oy, noiseSize, noiseSize);
        }
        ctx.globalAlpha = 1;
      }

      // HACKER phase
      if (phase === 3) {
        ctx.fillStyle = '#020804';
        ctx.fillRect(0, 0, fw, fh);

        // Scanlines — tile pre-generated pattern
        const scanPat = ctx.createPattern(scanCanvas, 'repeat');
        ctx.fillStyle = scanPat;
        ctx.fillRect(0, 0, fw, fh);

        const flicker = 0.92 + Math.random() * 0.08;
        ctx.globalAlpha = flicker;

        // ASCII art — vertically centered content block
        const hackerFrame = HACKER_FRAMES[Math.floor(now * 2) % 2];
        ctx.font = '20px JetBrains Mono';
        ctx.textAlign = 'center';
        // Total content height: art + taunt + laugh ≈ artH + 50 + 80
        const artH = hackerFrame.length * 24;
        const contentH = artH + 150;
        const artStartY = Math.max(40, (fh - contentH) / 2 - 40);
        hackerFrame.forEach((line, i) => {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.7 + Math.sin(now * 3 + i * 0.5) * 0.3})`;
          ctx.fillText(line, fw / 2, artStartY + i * 24);
        });

        // Taunt text
        const hackerElapsed = collapseElapsed - 2.5; // offset for glitch phase
        const tauntIdx = Math.floor(Math.max(0, hackerElapsed) / 1.5) % TAUNT_LINES.length;
        const tauntProgress = (Math.max(0, hackerElapsed) % 1.5) / 1.5;
        const currentTaunt = TAUNT_LINES[tauntIdx];
        const visibleChars = Math.floor(tauntProgress * currentTaunt.length * 1.5);
        const displayText = currentTaunt.substring(0, Math.min(visibleChars, currentTaunt.length));

        ctx.font = 'bold 28px JetBrains Mono';
        ctx.fillStyle = colors.success;
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.success;
        ctx.fillText('> ' + displayText + (Math.sin(now * 6) > 0 ? '█' : ''), fw / 2, artStartY + artH + 50);
        ctx.shadowBlur = 0;

        // Laughing text
        if (hackerElapsed > 4) {
          const laughT = hackerElapsed - 4;
          const bounce = Math.abs(Math.sin(laughT * 4)) * 15;
          ctx.font = `bold ${36 + Math.sin(laughT * 8) * 6}px JetBrains Mono`;
          ctx.fillStyle = colors.success;
          ctx.shadowBlur = 25;
          ctx.shadowColor = colors.success;
          ctx.textAlign = 'center';
          const laughText = 'HA '.repeat(Math.min(Math.floor(laughT * 3) + 1, 8)).trim();
          const laughY = fh - 220;
          ctx.fillText(laughText, fw / 2 + Math.sin(laughT * 5) * 12, laughY - bounce);
          ctx.shadowBlur = 0;

          // Subtitle — typewriter
          ctx.font = '16px JetBrains Mono';
          ctx.fillStyle = colors.success + '80';
          const chatMsg = '[ grid_operator has left the chat ]';
          const chatChars = Math.min(chatMsg.length, Math.floor((laughT - 1) * 25));
          if (chatChars > 0) {
            ctx.fillText(chatMsg.substring(0, chatChars) + (chatChars < chatMsg.length && Math.sin(now * 6) > 0 ? '█' : ''), fw / 2, laughY + 40);
          }
        }

        // Matrix rain
        ctx.font = '14px JetBrains Mono';
        const cols = Math.ceil(fw / 40);
        for (let col = 0; col < cols; col++) {
          const x = col * 40;
          const charIdx = Math.floor(now * 8 + col * 7) % 30;
          for (let row = 0; row < 5; row++) {
            const y = ((charIdx + row * 8) * 25) % fh;
            const alpha = 0.05 + (row === 0 ? 0.15 : 0);
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            const chars = '01アイウエオカキクケコ';
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
          }
        }

        ctx.globalAlpha = 1;

        // Reset hint — typewriter then blink
        const resetMsg = '[ click RESET to restore grid ]';
        const resetT = Math.max(0, hackerElapsed - 6);
        const resetChars = Math.min(resetMsg.length, Math.floor(resetT * 20));
        if (resetChars > 0) {
          ctx.font = '14px JetBrains Mono';
          ctx.fillStyle = colors.textDim + '60';
          ctx.textAlign = 'center';
          const blink = resetChars >= resetMsg.length && Math.sin(now * 2) < 0;
          if (!blink) {
            ctx.fillText(resetChars < resetMsg.length
              ? resetMsg.substring(0, resetChars) + '█'
              : resetMsg, fw / 2, fh - 90);
          }
        }
      }

      if (slideContext?.isSlideActive) {
        hackerAnimRef.current = requestAnimationFrame(drawHacker);
      }
    };

    drawHacker();
    return () => cancelAnimationFrame(hackerAnimRef.current);
  }, [hackerTakeover, slideContext?.isSlideActive]);

  // Auto-scroll event feed
  useEffect(() => {
    if (eventFeedRef.current) {
      eventFeedRef.current.scrollTop = eventFeedRef.current.scrollHeight;
    }
  }, [visibleEvents.length]);

  const EVENT_STYLES = {
    danger: { icon: '\u25BC', color: colors.danger, border: colors.danger },
    warn:   { icon: '\u26A0', color: colors.accent, border: colors.accent },
    success:{ icon: '\u25B2', color: colors.success, border: colors.success },
    info:   { icon: '\u25B8', color: colors.primary, border: colors.primary },
    nominal:{ icon: '\u25CF', color: colors.primary, border: colors.primary },
  };

  const formatGT = (gt) => {
    const hh = String(Math.floor(gt / 3600)).padStart(2, '0');
    const mm = String(Math.floor((gt % 3600) / 60)).padStart(2, '0');
    const ss = String(gt % 60).padStart(2, '0');
    return `T+${hh}:${mm}:${ss}`;
  };

  return (
    <div className="relative overflow-hidden" style={{ width, height }}>
      {/* Canvas — fills the whole area */}
      <canvas
        ref={canvasRef}
        style={{ width: canvasWidth, height }}
      />

      {/* HUD Event Feed Panel — same pattern as TexasMapHUD: absolute, 10px inset */}
      {panelWidth > 0 && (
        <div className="absolute top-3 right-3 bottom-8 flex flex-col overflow-hidden rounded" style={{
          width: panelWidth,
          background: 'rgba(5,8,16,0.92)',
          fontFamily: '"JetBrains Mono"',
          border: `1px solid rgba(34,211,238,0.15)`,
          boxShadow: `0 0 20px rgba(34,211,238,0.06), inset 0 0 15px rgba(34,211,238,0.03)`,
          backdropFilter: 'blur(12px)',
        }}>

          {/* Scanline overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.015) 2px, rgba(34,211,238,0.015) 4px)',
          }} />

          {/* Timer section — own section at top */}
          <div style={{ padding: '12px 16px', borderBottom: `1px solid rgba(34,211,238,0.12)`, position: 'relative', zIndex: 2 }}>
            <div style={{
              fontSize: 32, fontWeight: 700, letterSpacing: '0.04em',
              color: panelData.gridTime > 0 ? panelData.statusColor : colors.textDim,
              textShadow: panelData.gridTime > 0 ? `0 0 12px ${panelData.statusColor}40` : 'none',
            }}>
              {panelData.gridTime > 0 ? formatGT(Math.floor(panelData.gridTime)) : 'T+00:00:00'}
            </div>
            <div style={{ fontSize: 12, marginTop: 2, color: colors.textDim }}>
              {panelData.timeScale}x speed
            </div>
          </div>

          {/* Frequency readouts section */}
          <div style={{ padding: '12px 16px 10px', borderBottom: `1px solid rgba(34,211,238,0.12)`, position: 'relative', zIndex: 2 }}>
            {/* Frequency */}
            <div style={{
              fontSize: 32, fontWeight: 700, letterSpacing: '0.02em',
              color: panelData.lineColor,
              textShadow: `0 0 16px ${panelData.lineColor}60`,
            }}>
              {panelData.freq.toFixed(3)} Hz
            </div>
            {/* Delta — large */}
            <div style={{
              fontSize: 22, fontWeight: 600, marginTop: 4,
              color: panelData.delta > 0.5 ? colors.danger : panelData.delta > 0.1 ? colors.accent : colors.textDim,
            }}>
              {'\u0394'} {'\u00b1'}{panelData.delta.toFixed(3)} Hz
            </div>
            {/* Status */}
            <div style={{
              fontSize: 11, marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              color: panelData.statusColor,
              opacity: panelData.statusSeverity >= 3 ? undefined : 0.85,
              animation: panelData.statusSeverity >= 3 ? 'freqPulse 0.5s ease-in-out infinite alternate' : 'none',
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                background: panelData.statusColor,
                boxShadow: `0 0 6px ${panelData.statusColor}`,
              }} />
              {panelData.statusText}
            </div>
          </div>

          {/* Event log section */}
          <div style={{
            fontSize: 9, letterSpacing: '0.12em', color: colors.textDim + '80',
            padding: '8px 16px 4px', textTransform: 'uppercase', position: 'relative', zIndex: 2,
          }}>
            EVENT LOG
          </div>

          <div ref={eventFeedRef} style={{
            flex: 1, overflow: 'auto', padding: '0 16px 8px', position: 'relative', zIndex: 2,
            scrollbarWidth: 'thin', scrollbarColor: `${colors.primary}30 transparent`,
          }}>
            {visibleEvents.length === 0 && (
              <div style={{ fontSize: 11, color: colors.textDim + '50', padding: '12px 0', fontStyle: 'italic' }}>
                Awaiting grid events...
              </div>
            )}
            {visibleEvents.map((evt, i) => {
              if (evt.isDivider) {
                return (
                  <div key={evt.key} style={{
                    padding: '6px 0 4px', color: colors.textDim + '60',
                    fontSize: 10, textAlign: 'center', letterSpacing: '0.1em',
                  }}>
                    {evt.text}
                  </div>
                );
              }
              const s = EVENT_STYLES[evt.type] || EVENT_STYLES.info;
              return (
                <div key={evt.key || `${evt.gt}-${i}`} style={{
                  borderLeft: `2px solid ${s.border}60`,
                  padding: '5px 0 5px 10px', marginBottom: 2,
                  animation: 'eventSlideIn 0.3s ease-out',
                }}>
                  <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>
                    {s.icon} {formatGT(evt.gt)}
                  </div>
                  <div style={{ fontSize: 14, color: s.color + 'cc', marginTop: 2, lineHeight: 1.4 }}>
                    {evt.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inline keyframe styles */}
          <style>{`
            @keyframes eventSlideIn {
              from { opacity: 0; transform: translateX(8px); }
              to { opacity: 1; transform: translateX(0); }
            }
            @keyframes freqPulse {
              from { opacity: 0.6; }
              to { opacity: 1; }
            }
          `}</style>
        </div>
      )}

      {/* Fullscreen hacker takeover overlay */}
      {hackerTakeover && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          pointerEvents: 'auto',
        }}>
          <canvas
            ref={hackerCanvasRef}
            style={{ width: '100%', height: '100%' }}
          />
          <button
            onClick={resetToStable}
            style={{
              position: 'absolute',
              bottom: 40,
              left: '50%',
              transform: 'translateX(-50%)',
              background: `${colors.primary}25`,
              border: `1px solid ${colors.primary}`,
              color: colors.primary,
              padding: '8px 24px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: '"JetBrains Mono"',
              fontWeight: 600,
              zIndex: 10000,
            }}
          >
            Reset Grid
          </button>
        </div>
      )}
      <div className="absolute bottom-10 left-4 flex gap-2 flex-wrap" style={{ maxWidth: canvasWidth - 32 }}>
        {SCENARIOS.map((s, i) => {
          const isActive = scenario === i;
          const btnColor = s.color === 'danger' ? colors.danger : colors.accent;
          return (
            <button
              key={s.label}
              onClick={() => switchScenario(i)}
              style={{
                background: isActive ? `${btnColor}25` : colors.surface,
                border: `1px solid ${isActive ? btnColor : colors.surfaceLight}`,
                color: isActive ? btnColor : colors.textMuted,
                padding: '8px 18px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: '"JetBrains Mono"',
                fontWeight: isActive ? 700 : 500,
                transition: 'all 0.2s',
              }}
            >
              {s.label}
            </button>
          );
        })}
        <button
          onClick={resetToStable}
          style={{
            background: scenario === -1 ? `${colors.primary}25` : colors.surface,
            border: `1px solid ${scenario === -1 ? colors.primary : colors.surfaceLight}`,
            color: scenario === -1 ? colors.primary : colors.textMuted,
            padding: '8px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 14,
            fontFamily: '"JetBrains Mono"',
            fontWeight: scenario === -1 ? 700 : 500,
            transition: 'all 0.2s',
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
}
