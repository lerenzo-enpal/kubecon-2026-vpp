import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Interactive grid frequency simulator.
 * Ported from the presentation FrequencyDemo — standalone, no Spectacle deps.
 * Uses CSS custom properties for colors so it works in both dark and light mode.
 */

// Read CSS custom property values at runtime
function getCSSColor(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function getColors() {
  return {
    primary: getCSSColor('--color-primary', '#22d3ee'),
    accent: getCSSColor('--color-accent', '#f59e0b'),
    danger: getCSSColor('--color-danger', '#ef4444'),
    success: getCSSColor('--color-success', '#10b981'),
    surface: getCSSColor('--color-surface', '#1a2236'),
    surfaceLight: getCSSColor('--color-surface-light', '#243049'),
    text: getCSSColor('--color-text', '#f1f5f9'),
    textMuted: getCSSColor('--color-text-muted', '#94a3b8'),
    textDim: getCSSColor('--color-text-dim', '#64748b'),
    bg: getCSSColor('--color-bg', '#0a0e17'),
    bgAlt: getCSSColor('--color-bg-alt', '#111827'),
  };
}

// Event-based scenarios
const SCENARIOS = [
  {
    label: 'Generator Trip (800 MW)',
    colorKey: 'accent' as const,
    timeScale: 150,
    getDelta: (gt: number) => {
      if (gt < 2) return 0;
      if (gt < 10) return -((gt - 2) / 8) * 0.5;
      if (gt < 30) return -0.5 + 0.05 * Math.sin((gt - 10) * 0.3);
      if (gt < 120) return -0.5 + ((gt - 30) / 90) * 0.3;
      if (gt < 600) return -0.2 + ((gt - 120) / 480) * 0.15;
      if (gt < 750) return -0.05 + ((gt - 600) / 150) * 0.05;
      return 0;
    },
    events: [
      { gt: 2, type: 'warn', text: 'Inertia absorbs initial shock' },
      { gt: 5, type: 'info', text: 'RoCoF detected -- 0.06 Hz/s' },
      { gt: 10, type: 'danger', text: 'Nadir reached -- 49.500 Hz' },
      { gt: 30, type: 'info', text: 'Primary reserves arrest decline' },
      { gt: 120, type: 'success', text: 'Secondary reserves (aFRR) restoring' },
      { gt: 600, type: 'success', text: 'Tertiary reserves engaged' },
      { gt: 750, type: 'nominal', text: 'Frequency nominal -- 50.000 Hz' },
    ],
  },
  {
    label: '3 GW Loss of Generation',
    colorKey: 'danger' as const,
    timeScale: 240,
    getDelta: (gt: number) => {
      if (gt < 1) return 0;
      if (gt < 8) return -((gt - 1) / 7) * 1.1;
      if (gt < 15) return -1.1 + 0.08 * Math.sin((gt - 8) * 0.9);
      if (gt < 60) return -1.1 + ((gt - 15) / 45) * 0.3;
      if (gt < 300) return -0.8 + ((gt - 60) / 240) * 0.5;
      if (gt < 900) return -0.3 + ((gt - 300) / 600) * 0.25;
      if (gt < 1200) return -0.05 + ((gt - 900) / 300) * 0.05;
      return 0;
    },
    events: [
      { gt: 1, type: 'danger', text: 'Massive generation loss -- 3 GW offline' },
      { gt: 4, type: 'danger', text: 'Steep RoCoF -- 0.16 Hz/s' },
      { gt: 8, type: 'danger', text: 'Nadir 48.9 Hz -- UFLS Stage 1 trips' },
      { gt: 15, type: 'warn', text: 'Load shedding stabilizes decline' },
      { gt: 60, type: 'info', text: 'Primary + secondary reserves active' },
      { gt: 300, type: 'success', text: 'Tertiary reserves & redispatch' },
      { gt: 900, type: 'success', text: 'Plants ramping up -- restoring' },
      { gt: 1200, type: 'nominal', text: 'Frequency restored -- 50.000 Hz' },
    ],
  },
  {
    label: 'Demand Drop (5 GW)',
    colorKey: 'accent' as const,
    timeScale: 120,
    getDelta: (gt: number) => {
      if (gt < 1) return 0;
      if (gt < 8) return ((gt - 1) / 7) * 0.5;
      if (gt < 20) return 0.5 + 0.06 * Math.sin((gt - 8) * 0.5);
      if (gt < 90) return 0.5 - ((gt - 20) / 70) * 0.3;
      if (gt < 300) return 0.2 - ((gt - 90) / 210) * 0.15;
      if (gt < 600) return 0.05 - ((gt - 300) / 300) * 0.05;
      return 0;
    },
    events: [
      { gt: 1, type: 'warn', text: 'Sudden demand drop -- 5 GW excess' },
      { gt: 4, type: 'warn', text: 'Frequency rising -- over-generation' },
      { gt: 8, type: 'danger', text: 'Over-frequency -- 50.500 Hz' },
      { gt: 20, type: 'info', text: 'Generator governors responding' },
      { gt: 90, type: 'success', text: 'AGC ramping down generation' },
      { gt: 300, type: 'success', text: 'Frequency settling' },
      { gt: 600, type: 'nominal', text: 'Frequency nominal -- 50.000 Hz' },
    ],
  },
  {
    label: 'Cyber Attack',
    colorKey: 'danger' as const,
    timeScale: 290,
    getDelta: (gt: number) => {
      if (gt < 30) return 0;
      if (gt < 90) return -((gt - 30) / 60) * 0.5;
      if (gt < 150) return -0.5 - ((gt - 90) / 60) * 0.6;
      if (gt < 210) return -1.1 - ((gt - 150) / 60) * 0.7;
      if (gt < 270) return -1.8 - ((gt - 210) / 60) * 0.8;
      return -2.6;
    },
    events: [
      { gt: 5, type: 'warn', text: 'Anomalous SCADA traffic detected' },
      { gt: 30, type: 'danger', text: 'Generators tripped remotely' },
      { gt: 60, type: 'danger', text: 'Protection relays compromised' },
      { gt: 90, type: 'danger', text: 'Cascade -- relays disabled' },
      { gt: 150, type: 'danger', text: 'Reserves overwhelmed' },
      { gt: 210, type: 'danger', text: 'Uncontrolled collapse' },
      { gt: 270, type: 'danger', text: 'TOTAL BLACKOUT -- 47.4 Hz' },
    ],
  },
];

const HACKER_FRAMES = [
  [
    '    +==============================+',
    '    |                              |',
    '    |      +-----------------+     |',
    '    |      |   +---------+   |     |',
    '    |      |   |  >_     |   |     |',
    '    |      |   |         |   |     |',
    '    |      |   +---------+   |     |',
    '    |      |  +-----------+  |     |',
    '    |      |  | ......... |  |     |',
    '    |      |  +-----------+  |     |',
    '    |      +--------+--------+     |',
    '    |           +---+---+          |',
    '    |           +-------+          |',
    '    |                              |',
    '    +==============================+',
  ],
  [
    '    +==============================+',
    '    |                              |',
    '    |      +-----------------+     |',
    '    |      |   +---------+   |     |',
    '    |      |   |  HA HA  |   |     |',
    '    |      |   |  HA HA  |   |     |',
    '    |      |   +---------+   |     |',
    '    |      |  +-----------+  |     |',
    '    |      |  | ######### |  |     |',
    '    |      |  +-----------+  |     |',
    '    |      +--------+--------+     |',
    '    |           +---+---+          |',
    '    |           +-------+          |',
    '    |                              |',
    '    +==============================+',
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

interface ThresholdDef {
  freq: number;
  label: string;
  colorKey: 'primary' | 'accent' | 'danger';
  lineAlpha: string;
  textAlpha: string;
}

const THRESHOLDS: ThresholdDef[] = [
  { freq: 51.5, label: '51.500 Hz -- GENERATOR TRIP (over-frequency)', colorKey: 'accent', lineAlpha: '30', textAlpha: '90' },
  { freq: 50.2, label: '50.200 Hz -- PRIMARY RESERVE ACTIVATION', colorKey: 'primary', lineAlpha: '20', textAlpha: '70' },
  { freq: 50.0, label: '50.000 Hz -- NOMINAL', colorKey: 'primary', lineAlpha: '30', textAlpha: 'bb' },
  { freq: 49.8, label: '49.800 Hz -- FREQUENCY CONTAINMENT RESERVES', colorKey: 'primary', lineAlpha: '20', textAlpha: '70' },
  { freq: 49.5, label: '49.500 Hz -- ALERT STATE', colorKey: 'accent', lineAlpha: '30', textAlpha: 'aa' },
  { freq: 49.0, label: '49.000 Hz -- UFLS STAGE 1 (10% load shed)', colorKey: 'danger', lineAlpha: '30', textAlpha: 'bb' },
  { freq: 48.5, label: '48.500 Hz -- UFLS STAGE 2 (additional 15%)', colorKey: 'danger', lineAlpha: '30', textAlpha: 'bb' },
  { freq: 48.0, label: '48.000 Hz -- UFLS STAGE 3 -- RELAY TRIP', colorKey: 'danger', lineAlpha: '40', textAlpha: 'dd' },
  { freq: 47.5, label: '47.500 Hz -- TOTAL COLLAPSE', colorKey: 'danger', lineAlpha: '50', textAlpha: 'ee' },
];

interface ActiveInstance {
  scenarioIdx: number;
  startTime: number;
  num: number;
}

interface EventEntry {
  gt: number;
  type: string;
  text: string;
  isDivider?: boolean;
  key?: string;
}

interface PanelData {
  freq: number;
  delta: number;
  statusText: string;
  statusColor: string;
  statusSeverity: number;
  lineColor: string;
  gridTime: number;
  timeScale: number;
}

interface Props {
  height?: number;
}

export default function FrequencyDemo({ height = 440 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hackerCanvasRef = useRef<HTMLCanvasElement>(null);
  const hackerAnimRef = useRef<number>(0);
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const targetFreqRef = useRef(50.0);
  const currentFreqRef = useRef(50.0);
  const [scenario, setScenario] = useState(-1);
  const scenarioRef = useRef(-1);
  const activeInstancesRef = useRef<ActiveInstance[]>([]);
  const instanceCounterRef = useRef(0);
  const [hackerTakeover, setHackerTakeover] = useState(false);
  const warningFlashRef = useRef(0);
  const collapseTimeRef = useRef<number | null>(null);
  const explosionParticlesRef = useRef<Array<{
    x: number; y: number; vx: number; vy: number;
    size: number; life: number; color: string;
  }>>([]);
  const glitchRef = useRef({ active: false, startTime: 0 });
  const hackerPhaseRef = useRef(0);
  const thresholdStateRef = useRef(THRESHOLDS.map(() => ({ crossed: false, uncrossedSince: null as number | null, highlight: 0 })));
  const lastStatusRef = useRef({ text: 'GRID STABLE', color: '', severity: 0, clearedAt: null as number | null });
  const bannerRef = useRef({ level: 'none' as string, clearedAt: null as number | null });
  const lineColorRef = useRef({ color: '', clearedAt: null as number | null });
  const freqWindowRef = useRef<Array<{ t: number; f: number }>>([]);
  const [panelData, setPanelData] = useState<PanelData>({
    freq: 50.0, delta: 0, statusText: 'GRID STABLE', statusColor: '',
    statusSeverity: 0, lineColor: '', gridTime: 0, timeScale: 100,
  });
  const [visibleEvents, setVisibleEvents] = useState<EventEntry[]>([]);
  const eventFeedRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState(0);
  const colorsRef = useRef(getColors());

  // Measure container width
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setMeasuredWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Update colors when theme changes
  useEffect(() => {
    const update = () => { colorsRef.current = getColors(); };
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', update);
    // Also observe class changes on html
    const obs = new MutationObserver(update);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    update();
    // Init latched refs
    lastStatusRef.current.color = colorsRef.current.primary;
    lineColorRef.current.color = colorsRef.current.primary;
    return () => { mq.removeEventListener('change', update); obs.disconnect(); };
  }, []);

  // Determine panel width: show panel if container is wide enough
  const showPanel = measuredWidth >= 700;
  const panelWidth = showPanel ? Math.min(280, Math.floor(measuredWidth * 0.32)) : 0;
  const canvasWidth = panelWidth > 0 ? measuredWidth - panelWidth - 16 : measuredWidth;

  const switchScenario = useCallback((idx: number) => {
    if (scenarioRef.current === idx) {
      instanceCounterRef.current += 1;
      activeInstancesRef.current = [
        ...activeInstancesRef.current,
        { scenarioIdx: idx, startTime: performance.now() / 1000, num: instanceCounterRef.current },
      ];
      return;
    }
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
    const c = colorsRef.current;
    lastStatusRef.current = { text: 'GRID STABLE', color: c.primary, severity: 0, clearedAt: null };
    bannerRef.current = { level: 'none', clearedAt: null };
    lineColorRef.current = { color: c.primary, clearedAt: null };
  }, []);

  const resetToStable = useCallback(() => {
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
    const c = colorsRef.current;
    lastStatusRef.current = { text: 'GRID STABLE', color: c.primary, severity: 0, clearedAt: null };
    bannerRef.current = { level: 'none', clearedAt: null };
    lineColorRef.current = { color: c.primary, clearedAt: null };
    freqWindowRef.current = [];
    setVisibleEvents([]);
    setPanelData({
      freq: 50.0, delta: 0, statusText: 'GRID STABLE', statusColor: c.primary,
      statusSeverity: 0, lineColor: c.primary, gridTime: 0, timeScale: 100,
    });
  }, []);

  // Main canvas animation
  useEffect(() => {
    if (canvasWidth <= 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
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
    const miniNoiseCtx = miniNoiseCanvas.getContext('2d')!;
    const miniNoiseData = miniNoiseCtx.createImageData(miniNoiseSize, miniNoiseSize);
    for (let i = 0; i < miniNoiseData.data.length; i += 4) {
      if (Math.random() < 0.15) {
        miniNoiseData.data[i] = 239; miniNoiseData.data[i + 1] = 68; miniNoiseData.data[i + 2] = 68;
        miniNoiseData.data[i + 3] = Math.floor(Math.random() * 80);
      }
    }
    miniNoiseCtx.putImageData(miniNoiseData, 0, 0);

    const draw = () => {
      const colors = colorsRef.current;
      tRef.current += 0.03;
      warningFlashRef.current += 0.05;
      const t = tRef.current;

      // Update target from stacked scenario instances
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
        const firstSc = SCENARIOS[instances[0].scenarioIdx];
        gridTime = (nowSec - instances[0].startTime) * firstSc.timeScale;
      }

      // Smooth interpolation toward target
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

      const sf = currentFreqRef.current;

      // Update threshold highlight state
      const now = performance.now() / 1000;
      const tStates = thresholdStateRef.current;
      for (let i = 0; i < THRESHOLDS.length; i++) {
        const th = THRESHOLDS[i];
        const st = tStates[i];
        if (th.freq === 50.0) continue;
        const isCrossed = th.freq > 50.0 ? sf > th.freq : sf < th.freq;
        if (isCrossed) {
          st.crossed = true;
          st.uncrossedSince = null;
          st.highlight = Math.min(1, st.highlight + 0.04);
        } else if (st.crossed) {
          if (st.uncrossedSince === null) st.uncrossedSince = now;
          if (now - st.uncrossedSince > 2) {
            st.highlight = Math.max(0, st.highlight - 0.02);
            if (st.highlight <= 0) { st.crossed = false; st.uncrossedSince = null; }
          }
        }
      }

      // Status zones with latched holdoff
      const statusZones = [
        { below: 47.5, status: 'GRID COLLAPSE', color: colors.danger, severity: 5 },
        { below: 48.5, status: 'EMERGENCY -- ROLLING BLACKOUTS', color: colors.danger, severity: 4 },
        { below: 49.0, status: 'LOAD SHEDDING ACTIVE', color: colors.danger, severity: 3 },
        { below: 49.5, status: 'WARNING -- RESERVES ACTIVATED', color: colors.accent, severity: 2 },
        { below: 49.8, status: 'FREQUENCY DEVIATION', color: colors.accent, severity: 1 },
      ];
      let rawStatus = { text: 'GRID STABLE', color: colors.primary, severity: 0 };
      for (const z of statusZones) {
        if (sf < z.below) { rawStatus = z; break; }
      }
      const ls = lastStatusRef.current;
      if (rawStatus.severity >= ls.severity) {
        ls.text = rawStatus.text; ls.color = rawStatus.color; ls.severity = rawStatus.severity; ls.clearedAt = null;
      } else {
        if (ls.clearedAt === null) ls.clearedAt = now;
        if (now - ls.clearedAt > 2) {
          ls.text = rawStatus.text; ls.color = rawStatus.color; ls.severity = rawStatus.severity; ls.clearedAt = null;
        }
      }

      // Latched line color
      const rawLineColor = sf < 49.0 ? colors.danger : sf < 49.5 ? colors.accent : colors.primary;
      const lc = lineColorRef.current;
      if (rawLineColor !== colors.primary) {
        if (rawLineColor === colors.danger || lc.color === colors.primary) lc.color = rawLineColor;
        lc.clearedAt = null;
      } else if (lc.color !== colors.primary) {
        if (lc.clearedAt === null) lc.clearedAt = now;
        if (now - lc.clearedAt > 2) { lc.color = colors.primary; lc.clearedAt = null; }
      }
      const lineColor = lc.color;

      // Push panel data (~15fps)
      if (panelWidth > 0 && Math.floor(t * 15) !== Math.floor((t - 0.03) * 15)) {
        setPanelData({
          freq, delta: freqDelta, statusText: ls.text,
          statusColor: ls.color, statusSeverity: ls.severity,
          lineColor, gridTime,
          timeScale: instances.length > 0 ? (SCENARIOS[instances[0].scenarioIdx].timeScale || 100) : 100,
        });
        if (instances.length > 0) {
          const allEvts: EventEntry[] = [];
          const nowEvt = performance.now() / 1000;
          for (const inst of instances) {
            const sc = SCENARIOS[inst.scenarioIdx];
            const instElapsed = (nowEvt - inst.startTime) * sc.timeScale;
            const prefix = inst.num > 1 ? `#${inst.num} ` : '';
            if (inst.num > 1) {
              allEvts.push({ gt: 0, type: 'info', text: `-- Instance #${inst.num} --`, isDivider: true, key: `div-${inst.num}` });
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

      // Also update events when no panel (for the inline event feed below canvas)
      if (panelWidth === 0 && Math.floor(t * 15) !== Math.floor((t - 0.03) * 15)) {
        setPanelData({
          freq, delta: freqDelta, statusText: ls.text,
          statusColor: ls.color, statusSeverity: ls.severity,
          lineColor, gridTime,
          timeScale: instances.length > 0 ? (SCENARIOS[instances[0].scenarioIdx].timeScale || 100) : 100,
        });
        if (instances.length > 0) {
          const allEvts: EventEntry[] = [];
          const nowEvt = performance.now() / 1000;
          for (const inst of instances) {
            const sc = SCENARIOS[inst.scenarioIdx];
            const instElapsed = (nowEvt - inst.startTime) * sc.timeScale;
            const prefix = inst.num > 1 ? `#${inst.num} ` : '';
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
        const particles: typeof explosionParticlesRef.current = [];
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 1 + Math.random() * 5;
          particles.push({
            x: canvasWidth / 2, y: height / 2,
            vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd,
            size: 2 + Math.random() * 6, life: 1.0,
            color: Math.random() > 0.5 ? colors.danger : (Math.random() > 0.5 ? colors.accent : '#ff6b35'),
          });
        }
        explosionParticlesRef.current = particles;
      }

      const collapseElapsed = collapseTimeRef.current ? t - collapseTimeRef.current : 0;

      // Phase transitions
      if (collapseElapsed > 1.5 && hackerPhaseRef.current === 1) {
        hackerPhaseRef.current = 2;
        glitchRef.current = { active: true, startTime: t };
        setHackerTakeover(true);
      }
      if (collapseElapsed > 4 && hackerPhaseRef.current === 2) {
        hackerPhaseRef.current = 3;
      }

      // === PHASE 3: HACKER SCREEN ===
      if (hackerPhaseRef.current === 3) {
        ctx.fillStyle = '#020804';
        ctx.fillRect(0, 0, canvasWidth, height);
        for (let y = 0; y < height; y += 3) {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.02 + Math.sin(y * 0.1 + t * 2) * 0.01})`;
          ctx.fillRect(0, y, canvasWidth, 1);
        }
        const flicker = 0.92 + Math.random() * 0.08;
        ctx.globalAlpha = flicker;

        const hackerFrame = HACKER_FRAMES[Math.floor(t * 2) % 2];
        ctx.font = '14px JetBrains Mono';
        ctx.textAlign = 'center';
        const artStartY = 40;
        hackerFrame.forEach((line, i) => {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.7 + Math.sin(t * 3 + i * 0.5) * 0.3})`;
          ctx.fillText(line, canvasWidth / 2, artStartY + i * 16);
        });

        const tauntIdx = Math.floor((collapseElapsed - 4) / 2) % TAUNT_LINES.length;
        const tauntProgress = ((collapseElapsed - 4) % 2) / 2;
        const currentTaunt = TAUNT_LINES[tauntIdx];
        const visChars = Math.floor(tauntProgress * currentTaunt.length * 1.5);
        const displayText = currentTaunt.substring(0, Math.min(visChars, currentTaunt.length));

        ctx.font = 'bold 18px JetBrains Mono';
        ctx.fillStyle = colors.success;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.success;
        ctx.fillText('> ' + displayText + (Math.sin(t * 6) > 0 ? '\u2588' : ''), canvasWidth / 2, artStartY + hackerFrame.length * 16 + 30);
        ctx.shadowBlur = 0;

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

          ctx.font = '12px JetBrains Mono';
          ctx.fillStyle = colors.success + '80';
          const chatMsg = '[ grid_operator has left the chat ]';
          const chatChars = Math.min(chatMsg.length, Math.floor((laughT - 1) * 25));
          if (chatChars > 0) {
            ctx.fillText(chatMsg.substring(0, chatChars) + (chatChars < chatMsg.length && Math.sin(t * 6) > 0 ? '\u2588' : ''), canvasWidth / 2, height - 40);
          }
        }

        // Matrix rain
        ctx.font = '12px JetBrains Mono';
        for (let col = 0; col < 30; col++) {
          const x = col * (canvasWidth / 30);
          const charIdx = Math.floor(t * 8 + col * 7) % 30;
          for (let row = 0; row < 4; row++) {
            const y = ((charIdx + row * 8) * 20) % height;
            const alpha = 0.05 + (row === 0 ? 0.15 : 0);
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            const chars = '01ABCDEFGHIJ';
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
          }
        }

        ctx.globalAlpha = 1;

        const hintFlash = Math.sin(t * 2) > 0;
        if (hintFlash) {
          ctx.font = '12px JetBrains Mono';
          ctx.fillStyle = colors.textDim + '60';
          ctx.textAlign = 'center';
          ctx.fillText('[ click RESET to restore grid ]', canvasWidth / 2, height - 50);
        }

        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // === PHASE 2: GLITCH TRANSITION ===
      if (hackerPhaseRef.current === 2) {
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, canvasWidth, height);
        const glitchIntensity = Math.min(1, (t - glitchRef.current.startTime) * 0.5);

        for (let i = 0; i < 15 * glitchIntensity; i++) {
          const blockH = 5 + Math.random() * 30;
          const blockY = Math.random() * height;
          const shift = (Math.random() - 0.5) * 100 * glitchIntensity;
          ctx.drawImage(canvas, 0, blockY * 2, canvasWidth * 2, blockH * 2, shift, blockY, canvasWidth, blockH);
        }

        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 * glitchIntensity})`;
        ctx.fillRect(Math.random() * 20 - 10, 0, canvasWidth, height);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.1 * glitchIntensity})`;
        ctx.fillRect(Math.random() * -20 + 10, 0, canvasWidth, height);
        ctx.globalCompositeOperation = 'source-over';

        ctx.font = 'bold 28px JetBrains Mono';
        ctx.textAlign = 'center';
        const corruptTexts = ['SYSTEM FAILURE', 'ERR_GRID_DOWN', 'FATAL: frequency.c:47', 'segfault in power_balance()', '*** KERNEL PANIC ***'];
        for (let i = 0; i < 3 + glitchIntensity * 5; i++) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + Math.random() * 0.5})`;
          const txt = corruptTexts[Math.floor(Math.random() * corruptTexts.length)];
          ctx.fillText(txt, canvasWidth / 2 + (Math.random() - 0.5) * 40, Math.random() * height);
        }

        ctx.globalAlpha = 0.6 * glitchIntensity;
        for (let i = 0; i < 3 + glitchIntensity * 3; i++) {
          ctx.drawImage(miniNoiseCanvas, Math.random() * canvasWidth, Math.random() * height);
        }
        ctx.globalAlpha = 1;

        animRef.current = requestAnimationFrame(draw);
        return;
      }

      // === NORMAL / PHASE 1 ===
      ctx.clearRect(0, 0, canvasWidth, height);

      const freqToY = (f: number) => {
        const top = 52;
        const bottom = 47;
        return height * 0.05 + (top - f) / (top - bottom) * (height * 0.85);
      };

      // Danger zone bg
      if (freq < 49.5) {
        const dangerAlpha = Math.min(0.15, (49.5 - freq) * 0.1);
        const pulse = Math.sin(warningFlashRef.current * 3) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${dangerAlpha * (0.5 + pulse * 0.5)})`;
        const y49 = freqToY(49.0);
        ctx.fillRect(0, y49, canvasWidth, height - y49);
      }

      // Threshold lines
      ctx.lineWidth = 1;
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'left';

      const tStatesNow = thresholdStateRef.current;
      for (let i = 0; i < THRESHOLDS.length; i++) {
        const th = THRESHOLDS[i];
        const y = freqToY(th.freq);
        if (y < 5 || y > height - 5) continue;

        const hl = tStatesNow[i].highlight;
        const thColor = colors[th.colorKey];

        ctx.setLineDash([3, 5]);
        const baseLineAlpha = parseInt(th.lineAlpha, 16) / 255;
        const lineAlphaVal = Math.min(1, baseLineAlpha + hl * 0.6);
        ctx.lineWidth = 1 + hl * 1.5;
        ctx.strokeStyle = thColor + Math.round(lineAlphaVal * 255).toString(16).padStart(2, '0');
        if (hl > 0.3) { ctx.shadowBlur = 8 * hl; ctx.shadowColor = thColor; }
        ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 1;

        const baseTextAlpha = parseInt(th.textAlpha, 16) / 255;
        const textAlphaVal = Math.min(1, baseTextAlpha + hl * 0.4);
        ctx.fillStyle = thColor + Math.round(textAlphaVal * 255).toString(16).padStart(2, '0');
        ctx.fillText(th.label, 62, y - 6);
      }
      ctx.setLineDash([]);

      // Frequency trace
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

      // Frequency readout on canvas when no panel
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

        const deltaColor = freqDelta > 0.5 ? colors.danger : freqDelta > 0.1 ? colors.accent : colors.textDim;
        ctx.font = '16px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillStyle = deltaColor;
        ctx.font = 'bold 36px JetBrains Mono';
        const actualFreqWidth = ctx.measureText(`${freq.toFixed(3)} Hz`).width;
        ctx.font = '16px JetBrains Mono';
        ctx.fillText(`\u0394\u00b1${freqDelta.toFixed(3)}`, canvasWidth - 16 - actualFreqWidth - 12, 40);

        // Status
        ctx.font = '14px JetBrains Mono';
        ctx.textAlign = 'right';
        if (ls.severity >= 3) {
          const flash = Math.sin(warningFlashRef.current * 4) > 0;
          ctx.fillStyle = flash ? ls.color : ls.color + '40';
        } else {
          ctx.fillStyle = ls.color + 'cc';
        }
        ctx.fillText(ls.text, canvasWidth - 16, 60);

        // Timer
        if (instances.length > 0 && gridTime > 0) {
          const totalSec = Math.floor(gridTime);
          const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
          const ss = String(totalSec % 60).padStart(2, '0');
          const timeScaleVal = SCENARIOS[instances[0].scenarioIdx].timeScale || 100;

          ctx.textAlign = 'left';
          ctx.font = 'bold 14px JetBrains Mono';
          ctx.fillStyle = colors.textMuted + 'cc';
          ctx.fillText(`T+${mm}:${ss}`, 10, 22);
          ctx.font = '12px JetBrains Mono';
          ctx.fillStyle = colors.textDim + '90';
          ctx.fillText(`${timeScaleVal}x speed`, 10, 38);
        }
      }

      // Alert banners
      const rawBannerLevel = sf < 48.5 ? 'imminent' : sf < 49.0 ? 'shedding' : 'none';
      const bn = bannerRef.current;
      if (rawBannerLevel !== 'none') {
        if (rawBannerLevel === 'imminent' || bn.level !== 'imminent') bn.level = rawBannerLevel;
        bn.clearedAt = null;
      } else if (bn.level !== 'none') {
        if (bn.clearedAt === null) bn.clearedAt = now;
        if (now - bn.clearedAt > 2) { bn.level = 'none'; bn.clearedAt = null; }
      }

      if (bn.level === 'imminent') {
        const flash = Math.sin(warningFlashRef.current * 6) > 0;
        ctx.font = 'bold 16px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillStyle = flash ? colors.danger : colors.danger + '40';
        ctx.fillText('GRID FAILURE IMMINENT', canvasWidth / 2, height - 52);
      } else if (bn.level === 'shedding') {
        const flash = Math.sin(warningFlashRef.current * 3) > 0.3;
        ctx.font = '14px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillStyle = flash ? colors.danger + 'cc' : colors.danger + '40';
        ctx.fillText('AUTOMATIC LOAD SHEDDING IN PROGRESS', canvasWidth / 2, height - 48);
      }

      // Left axis
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '12px JetBrains Mono';
      ctx.textAlign = 'right';
      for (let f = 47.5; f <= 51.5; f += 0.5) {
        const y = freqToY(f);
        if (y > 10 && y < height - 10) ctx.fillText(f.toFixed(1), 54, y + 3);
      }

      // === EXPLOSION PARTICLES (Phase 1) ===
      if (hackerPhaseRef.current === 1) {
        const particles = explosionParticlesRef.current;

        if (collapseElapsed < 1.5) {
          const shakeFade = 1 - collapseElapsed / 1.5;
          const shakeX = (Math.random() - 0.5) * 20 * shakeFade;
          const shakeY = (Math.random() - 0.5) * 20 * shakeFade;
          ctx.translate(shakeX, shakeY);
        }

        if (collapseElapsed < 0.3) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - collapseElapsed / 0.3)})`;
          ctx.fillRect(-20, -20, canvasWidth + 40, height + 40);
        }

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05;
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

        ctx.setTransform(2, 0, 0, 2, 0, 0);
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [canvasWidth, height, scenario, panelWidth]);

  // Fullscreen hacker canvas animation
  useEffect(() => {
    if (!hackerTakeover) return;
    const canvas = hackerCanvasRef.current;
    if (!canvas) return;
    const fw = window.innerWidth;
    const fh = window.innerHeight;
    canvas.width = fw * 2;
    canvas.height = fh * 2;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(2, 2);
    const startTime = performance.now() / 1000;

    const noiseSize = 256;
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext('2d')!;
    const noiseData = noiseCtx.createImageData(noiseSize, noiseSize);
    for (let i = 0; i < noiseData.data.length; i += 4) {
      if (Math.random() < 0.15) {
        noiseData.data[i] = 239; noiseData.data[i + 1] = 68; noiseData.data[i + 2] = 68;
        noiseData.data[i + 3] = Math.floor(Math.random() * 80);
      }
    }
    noiseCtx.putImageData(noiseData, 0, 0);

    const scanCanvas = document.createElement('canvas');
    scanCanvas.width = 1;
    scanCanvas.height = 6;
    const scanCtx = scanCanvas.getContext('2d')!;
    scanCtx.fillStyle = 'rgba(16, 185, 129, 0.025)';
    scanCtx.fillRect(0, 3, 1, 1);

    const drawHacker = () => {
      const colors = colorsRef.current;
      const nowT = performance.now() / 1000;
      const t = nowT - startTime;
      const collapseElapsed = t;
      const phase = hackerPhaseRef.current;

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

      if (phase === 3) {
        ctx.fillStyle = '#020804';
        ctx.fillRect(0, 0, fw, fh);

        const scanPat = ctx.createPattern(scanCanvas, 'repeat');
        if (scanPat) {
          ctx.fillStyle = scanPat;
          ctx.fillRect(0, 0, fw, fh);
        }

        const flicker = 0.92 + Math.random() * 0.08;
        ctx.globalAlpha = flicker;

        const hackerFrame = HACKER_FRAMES[Math.floor(nowT * 2) % 2];
        ctx.font = '20px JetBrains Mono';
        ctx.textAlign = 'center';
        const artH = hackerFrame.length * 24;
        const contentH = artH + 150;
        const artStartY = Math.max(40, (fh - contentH) / 2 - 40);
        hackerFrame.forEach((line, i) => {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.7 + Math.sin(nowT * 3 + i * 0.5) * 0.3})`;
          ctx.fillText(line, fw / 2, artStartY + i * 24);
        });

        const hackerElapsed = collapseElapsed - 2.5;
        const tauntIdx = Math.floor(Math.max(0, hackerElapsed - 1) / 2) % TAUNT_LINES.length;
        const tauntProgress = (Math.max(0, hackerElapsed - 1) % 2) / 2;
        const currentTaunt = TAUNT_LINES[tauntIdx];
        const visChars = Math.floor(tauntProgress * currentTaunt.length * 1.5);
        const displayText = currentTaunt.substring(0, Math.min(visChars, currentTaunt.length));

        ctx.font = 'bold 28px JetBrains Mono';
        ctx.fillStyle = colors.success;
        ctx.shadowBlur = 20;
        ctx.shadowColor = colors.success;
        ctx.fillText('> ' + displayText + (Math.sin(nowT * 6) > 0 ? '\u2588' : ''), fw / 2, artStartY + artH + 50);
        ctx.shadowBlur = 0;

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

          ctx.font = '16px JetBrains Mono';
          ctx.fillStyle = colors.success + '80';
          const chatMsg = '[ grid_operator has left the chat ]';
          const chatChars = Math.min(chatMsg.length, Math.floor((laughT - 1) * 25));
          if (chatChars > 0) {
            ctx.fillText(chatMsg.substring(0, chatChars) + (chatChars < chatMsg.length && Math.sin(nowT * 6) > 0 ? '\u2588' : ''), fw / 2, laughY + 40);
          }
        }

        // Matrix rain
        ctx.font = '14px JetBrains Mono';
        const cols = Math.ceil(fw / 40);
        for (let col = 0; col < cols; col++) {
          const x = col * 40;
          const charIdx = Math.floor(nowT * 8 + col * 7) % 30;
          for (let row = 0; row < 5; row++) {
            const y = ((charIdx + row * 8) * 25) % fh;
            const alpha = 0.05 + (row === 0 ? 0.15 : 0);
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            const chars = '01ABCDEFGHIJ';
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
          }
        }

        ctx.globalAlpha = 1;

        const resetMsg = '[ click RESET to restore grid ]';
        const resetT = Math.max(0, hackerElapsed - 6);
        const resetChars = Math.min(resetMsg.length, Math.floor(resetT * 20));
        if (resetChars > 0) {
          ctx.font = '14px JetBrains Mono';
          ctx.fillStyle = colors.textDim + '60';
          ctx.textAlign = 'center';
          const blink = resetChars >= resetMsg.length && Math.sin(nowT * 2) < 0;
          if (!blink) {
            ctx.fillText(resetChars < resetMsg.length
              ? resetMsg.substring(0, resetChars) + '\u2588'
              : resetMsg, fw / 2, fh - 90);
          }
        }
      }

      hackerAnimRef.current = requestAnimationFrame(drawHacker);
    };

    drawHacker();
    return () => cancelAnimationFrame(hackerAnimRef.current);
  }, [hackerTakeover]);

  // Auto-scroll event feed
  useEffect(() => {
    if (eventFeedRef.current) {
      eventFeedRef.current.scrollTop = eventFeedRef.current.scrollHeight;
    }
  }, [visibleEvents.length]);

  const EVENT_STYLES: Record<string, { icon: string; color: string; border: string }> = (() => {
    const c = colorsRef.current;
    return {
      danger:  { icon: '\u25BC', color: c.danger,  border: c.danger },
      warn:    { icon: '\u25B2', color: c.accent,  border: c.accent },
      success: { icon: '\u25B2', color: c.success, border: c.success },
      info:    { icon: '\u25B8', color: c.primary, border: c.primary },
      nominal: { icon: '\u25CF', color: c.primary, border: c.primary },
    };
  })();

  const formatGT = (gt: number) => {
    const mm = String(Math.floor(gt / 60)).padStart(2, '0');
    const ss = String(gt % 60).padStart(2, '0');
    return `T+${mm}:${ss}`;
  };

  const colors = colorsRef.current;

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        {/* Canvas */}
        <canvas
          ref={canvasRef}
          style={{ width: canvasWidth || '100%', height, display: 'block' }}
        />

        {/* HUD Event Feed Panel */}
        {panelWidth > 0 && (
          <div style={{
            width: panelWidth, height, position: 'relative',
            background: 'rgba(5,8,16,0.92)', fontFamily: '"JetBrains Mono", monospace',
            border: '12px solid rgba(34,211,238,0.12)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            borderRadius: 4,
          }}>
            {/* Corner brackets */}
            {[
              { top: -1, left: -1, borderTop: `2px solid ${colors.primary}40`, borderLeft: `2px solid ${colors.primary}40` },
              { top: -1, right: -1, borderTop: `2px solid ${colors.primary}40`, borderRight: `2px solid ${colors.primary}40` },
              { bottom: -1, left: -1, borderBottom: `2px solid ${colors.primary}40`, borderLeft: `2px solid ${colors.primary}40` },
              { bottom: -1, right: -1, borderBottom: `2px solid ${colors.primary}40`, borderRight: `2px solid ${colors.primary}40` },
            ].map((s, i) => (
              <div key={i} style={{ position: 'absolute', width: 12, height: 12, ...s } as React.CSSProperties} />
            ))}

            {/* Scanline overlay */}
            <div style={{
              position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.015) 2px, rgba(34,211,238,0.015) 4px)',
            }} />

            {/* Readouts */}
            <div style={{ padding: '14px 16px 10px', borderBottom: '12px solid rgba(34,211,238,0.12)', position: 'relative', zIndex: 2 }}>
              <div style={{
                fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em',
                color: panelData.lineColor || colors.primary,
                textShadow: `0 0 16px ${(panelData.lineColor || colors.primary)}60`,
              }}>
                {'\u25B8'} {panelData.freq.toFixed(3)} Hz
              </div>
              <div style={{
                fontSize: 13, marginTop: 2,
                color: panelData.delta > 0.5 ? colors.danger : panelData.delta > 0.1 ? colors.accent : colors.textDim,
              }}>
                &nbsp;&nbsp;{'\u0394'} {'\u00b1'}{panelData.delta.toFixed(3)} Hz
              </div>
              <div style={{ fontSize: 14, marginTop: 4, color: colors.textDim }}>
                &nbsp;&nbsp;{panelData.gridTime > 0 ? formatGT(Math.floor(panelData.gridTime)) : 'T+00:00'} {'\u00b7'} {panelData.timeScale}x speed
              </div>
              <div style={{
                fontSize: 12, marginTop: 6, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
                color: panelData.statusColor || colors.primary,
                opacity: panelData.statusSeverity >= 3 ? undefined : 0.85,
                animation: panelData.statusSeverity >= 3 ? 'freqPulse 0.5s ease-in-out infinite alternate' : 'none',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%', display: 'inline-block',
                  background: panelData.statusColor || colors.primary,
                  boxShadow: `0 0 6px ${panelData.statusColor || colors.primary}`,
                }} />
                {panelData.statusText}
              </div>
            </div>

            {/* Event log */}
            <div style={{
              fontSize: 12, letterSpacing: '0.12em', color: colors.textDim + '80',
              padding: '12px 16px 4px', textTransform: 'uppercase', position: 'relative', zIndex: 2,
            }}>
              EVENT LOG
            </div>

            <div ref={eventFeedRef} style={{
              flex: 1, overflow: 'auto', padding: '0 16px 8px', position: 'relative', zIndex: 2,
              scrollbarWidth: 'thin', scrollbarColor: `${colors.primary}30 transparent`,
            }}>
              {visibleEvents.length === 0 && (
                <div style={{ fontSize: 12, color: colors.textDim + '50', padding: '12px 0', fontStyle: 'italic' }}>
                  Awaiting grid events...
                </div>
              )}
              {visibleEvents.map((evt, i) => {
                if (evt.isDivider) {
                  return (
                    <div key={evt.key} style={{
                      padding: '12px 0 4px', color: colors.textDim + '60',
                      fontSize: 12, textAlign: 'center', letterSpacing: '0.1em',
                    }}>
                      {evt.text}
                    </div>
                  );
                }
                const s = EVENT_STYLES[evt.type] || EVENT_STYLES.info;
                return (
                  <div key={evt.key || `${evt.gt}-${i}`} style={{
                    borderLeft: `2px solid ${s.border}60`,
                    padding: '12px 0 5px 10px', marginBottom: 2,
                    animation: 'eventSlideIn 0.3s ease-out',
                  }}>
                    <div style={{ fontSize: 12, color: s.color, fontWeight: 600 }}>
                      {s.icon} {formatGT(evt.gt)}
                    </div>
                    <div style={{ fontSize: 12, color: s.color + 'cc', marginTop: 1, lineHeight: 1.3 }}>
                      {evt.text}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Scenario buttons */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap',
        marginTop: 10,
      }}>
        {SCENARIOS.map((s, i) => {
          const isActive = scenario === i;
          const btnColor = s.colorKey === 'danger' ? colors.danger : colors.accent;
          return (
            <button
              key={s.label}
              onClick={() => switchScenario(i)}
              style={{
                background: isActive ? `${btnColor}25` : 'var(--color-surface, #1a2236)',
                border: `1px solid ${isActive ? btnColor : 'var(--color-surface-light, #243049)'}`,
                color: isActive ? btnColor : 'var(--color-text-muted, #94a3b8)',
                padding: '12px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: '"JetBrains Mono", monospace',
                fontWeight: isActive ? 600 : 400,
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
            background: scenario === -1 ? `${colors.primary}25` : 'var(--color-surface, #1a2236)',
            border: `1px solid ${scenario === -1 ? colors.primary : 'var(--color-surface-light, #243049)'}`,
            color: scenario === -1 ? colors.primary : 'var(--color-text-muted, #94a3b8)',
            padding: '12px 14px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 12,
            fontFamily: '"JetBrains Mono", monospace',
            fontWeight: scenario === -1 ? 600 : 400,
            transition: 'all 0.2s',
          }}
        >
          Reset
        </button>
      </div>

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
              padding: '12px 24px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 14,
              fontFamily: '"JetBrains Mono", monospace',
              fontWeight: 600,
              zIndex: 10000,
            }}
          >
            Reset Grid
          </button>
        </div>
      )}

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
  );
}
