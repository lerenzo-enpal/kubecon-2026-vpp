import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SlideContext } from 'spectacle';
import { PathLayer, ScatterplotLayer } from '@deck.gl/layers';
import StepBridge from './StepBridge.jsx';
import { JapanGridAtlas } from './JapanGridAtlas.jsx';
import { getVPPTransformationLayers } from './VPPTransformationLayers.jsx';
import { VPP_CITY_BUILDINGS, VPP_GRAPH_LINKS, VPP_GRAPH_NODES, VPP_TRANSFORMATION_STAGES } from './vppTransformationData.mjs';

// Deterministic PRNG (mulberry32) — same seed → same jitter across reloads,
// so the "house lights" don't reshuffle when React re-renders.
const mulberry32 = (seed) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
// Box-Muller for gaussian jitter so light density falls off from city centre.
const gauss = (rand) => {
  const u = Math.max(1e-9, rand());
  const v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// Japan population centres — used for the Amsterdam-style glowing-city overlay
// on stages 3+ (the Japan-map stages). Sizes are relative, not to scale.
const JP_CITIES = [
  { name: 'Tokyo',     position: [139.77, 35.68], size: 60, phase: 0.00 },
  { name: 'Yokohama',  position: [139.63, 35.44], size: 34, phase: 0.22 },
  { name: 'Kawasaki',  position: [139.71, 35.53], size: 22, phase: 0.51 },
  { name: 'Chiba',     position: [140.12, 35.60], size: 22, phase: 0.71 },
  { name: 'Saitama',   position: [139.65, 35.86], size: 24, phase: 0.15 },
  { name: 'Osaka',     position: [135.50, 34.69], size: 44, phase: 0.35 },
  { name: 'Kobe',      position: [135.20, 34.69], size: 24, phase: 0.60 },
  { name: 'Kyoto',     position: [135.77, 35.01], size: 24, phase: 0.83 },
  { name: 'Nagoya',    position: [136.90, 35.18], size: 34, phase: 0.45 },
  { name: 'Sapporo',   position: [141.35, 43.06], size: 30, phase: 0.09 },
  { name: 'Fukuoka',   position: [130.40, 33.59], size: 28, phase: 0.55 },
  { name: 'Kitakyushu',position: [130.87, 33.88], size: 20, phase: 0.77 },
  { name: 'Kumamoto',  position: [130.71, 32.80], size: 18, phase: 0.29 },
  { name: 'Nagasaki',  position: [129.87, 32.75], size: 16, phase: 0.66 },
  { name: 'Kagoshima', position: [130.56, 31.60], size: 18, phase: 0.42 },
  { name: 'Naha',      position: [127.68, 26.21], size: 16, phase: 0.90 },
  { name: 'Hiroshima', position: [132.46, 34.39], size: 24, phase: 0.13 },
  { name: 'Matsuyama', position: [132.77, 33.84], size: 16, phase: 0.62 },
  { name: 'Sendai',    position: [140.87, 38.27], size: 26, phase: 0.31 },
  { name: 'Niigata',   position: [139.02, 37.90], size: 20, phase: 0.79 },
  { name: 'Kanazawa',  position: [136.63, 36.56], size: 18, phase: 0.48 },
  { name: 'Aomori',    position: [140.74, 40.82], size: 16, phase: 0.05 },
  { name: 'Morioka',   position: [141.15, 39.70], size: 14, phase: 0.87 },
  { name: 'Akita',     position: [140.11, 39.72], size: 14, phase: 0.36 },
  { name: 'Hakodate',  position: [140.73, 41.77], size: 16, phase: 0.68 },
  { name: 'Takamatsu', position: [134.05, 34.34], size: 14, phase: 0.19 },
  { name: 'Okayama',   position: [133.93, 34.66], size: 18, phase: 0.53 },
];

// Secondary anchor points — small towns / hamlets spread along Japan's inhabited
// spines. Sizes are much smaller than JP_CITIES; each spawns a light sprinkle of
// house lights so the country doesn't look empty between metros.
const JP_HAMLETS = [
  // Hokkaido interior
  { position: [142.36, 43.77], size: 10 }, // Asahikawa
  { position: [144.38, 42.98], size: 7 },  // Kushiro
  { position: [143.20, 42.92], size: 7 },  // Obihiro
  { position: [140.97, 42.32], size: 7 },  // Muroran
  { position: [141.60, 42.63], size: 7 },  // Tomakomai
  { position: [141.68, 45.42], size: 5 },  // Wakkanai
  { position: [143.90, 43.80], size: 6 },  // Kitami
  { position: [145.57, 43.33], size: 5 },  // Nemuro
  { position: [140.11, 42.98], size: 5 },  // Oshamambe area
  { position: [142.85, 44.35], size: 5 },  // Nayoro
  // Tohoku
  { position: [140.90, 37.05], size: 8 },  // Iwaki
  { position: [140.36, 38.24], size: 8 },  // Yamagata
  { position: [140.47, 37.75], size: 8 },  // Fukushima
  { position: [140.39, 37.40], size: 7 },  // Koriyama
  { position: [141.49, 40.51], size: 7 },  // Hachinohe
  { position: [139.83, 38.72], size: 5 },  // Tsuruoka
  { position: [141.30, 38.43], size: 6 },  // Ishinomaki
  { position: [140.10, 39.30], size: 5 },  // Yokote / inland Akita
  { position: [141.11, 38.90], size: 5 },  // Kesennuma
  // Central Honshu / Chubu
  { position: [137.21, 36.70], size: 7 },  // Toyama
  { position: [136.22, 36.06], size: 6 },  // Fukui
  { position: [138.19, 36.65], size: 7 },  // Nagano
  { position: [139.88, 36.55], size: 8 },  // Utsunomiya
  { position: [140.47, 36.34], size: 7 },  // Mito
  { position: [136.72, 35.42], size: 7 },  // Gifu
  { position: [138.38, 34.98], size: 8 },  // Shizuoka
  { position: [137.73, 34.71], size: 8 },  // Hamamatsu
  { position: [137.97, 36.24], size: 6 },  // Matsumoto
  { position: [138.57, 35.66], size: 6 },  // Kofu
  { position: [139.06, 37.35], size: 6 },  // Nagaoka
  { position: [139.30, 36.39], size: 6 },  // Maebashi
  // Kansai / Kinki fringe
  { position: [135.80, 34.68], size: 6 },  // Nara
  { position: [135.17, 34.23], size: 6 },  // Wakayama
  { position: [135.87, 35.00], size: 5 },  // Otsu
  { position: [136.51, 34.72], size: 5 },  // Tsu
  { position: [136.63, 34.06], size: 4 },  // Kumano coast
  // Chugoku / Shikoku
  { position: [131.47, 34.19], size: 6 },  // Yamaguchi
  { position: [134.55, 34.07], size: 6 },  // Tokushima
  { position: [133.53, 33.56], size: 6 },  // Kochi
  { position: [132.10, 34.28], size: 5 },  // Iwakuni
  { position: [131.85, 34.66], size: 5 },  // Hamada / coast
  // Kyushu
  { position: [131.42, 31.91], size: 6 },  // Miyazaki
  { position: [131.61, 33.24], size: 6 },  // Oita
  { position: [130.30, 33.25], size: 6 },  // Saga
  { position: [130.03, 33.11], size: 5 },  // Isahaya
  { position: [130.90, 32.24], size: 5 },  // Hitoyoshi
  // Okinawa arc
  { position: [128.98, 26.68], size: 4 },  // Ie / Okinawa north
  { position: [124.15, 24.34], size: 4 },  // Ishigaki
];

// Millions-of-houses effect: for each city + hamlet, scatter tiny points with
// gaussian jitter. Each carries its own phase, frequency, baseAlpha, and warmth
// so the swarm never twinkles in sync. Seeded so hot reloads don't reshuffle.
// Cities are dense, hamlets are sparse — together they read as inhabited land
// across Japan, not just glowing metros.
const buildLights = (anchors, opts) => {
  const {
    seed = 0x51ff,
    countPerSize = 22,
    spreadBase = 0.006,
    spreadFactor = 0.028,
    freqRange = [0.6, 1.4],
    alphaBase = 90,
    alphaJitter = 140,
    sizeBase = 0.55,
    sizeJitter = 0.9,
  } = opts;
  const rand = mulberry32(seed);
  const out = [];
  for (const anchor of anchors) {
    const count = Math.round(anchor.size * countPerSize);
    const spread = spreadBase + Math.sqrt(anchor.size) * spreadFactor;
    const lngScale = 1 / Math.cos((anchor.position[1] * Math.PI) / 180);
    for (let i = 0; i < count; i++) {
      const r = Math.abs(gauss(rand)) * spread;
      const theta = rand() * Math.PI * 2;
      const dLat = (r * Math.sin(theta));
      const dLng = (r * Math.cos(theta)) * lngScale;
      out.push({
        position: [anchor.position[0] + dLng, anchor.position[1] + dLat],
        phase: rand(),
        freq: freqRange[0] + rand() * (freqRange[1] - freqRange[0]),
        baseAlpha: alphaBase + Math.round(rand() * alphaJitter),
        warmth: rand(),
        size: sizeBase + rand() * sizeJitter,
      });
    }
  }
  return out;
};

const HOUSE_LIGHTS = buildLights(JP_CITIES, {
  seed: 0x51ff,
  countPerSize: 22,
  spreadBase: 0.006,
  spreadFactor: 0.028,
});

// Rural lights: hamlets get a lighter sprinkle, dimmer & smaller than city
// house lights. Different seed so they don't overlap city constellations.
const RURAL_LIGHTS = buildLights(JP_HAMLETS, {
  seed: 0x9c3a,
  countPerSize: 20,
  spreadBase: 0.010,
  spreadFactor: 0.038,
  freqRange: [0.4, 1.1],
  alphaBase: 55,
  alphaJitter: 90,
  sizeBase: 0.45,
  sizeJitter: 0.7,
});

// Tokyo-area solar rollout — dots twinkle warm yellow to signal
// distributed generation coming online.
const TOKYO_SOLAR_POINTS = [
  { position: [139.72, 35.68], phase: 0.12 }, { position: [139.79, 35.71], phase: 0.44 },
  { position: [139.68, 35.65], phase: 0.71 }, { position: [139.83, 35.66], phase: 0.05 },
  { position: [139.74, 35.61], phase: 0.28 }, { position: [139.66, 35.72], phase: 0.83 },
  { position: [139.81, 35.75], phase: 0.16 }, { position: [139.76, 35.78], phase: 0.52 },
  { position: [139.63, 35.60], phase: 0.68 }, { position: [139.88, 35.63], phase: 0.34 },
  { position: [139.70, 35.55], phase: 0.91 }, { position: [139.85, 35.56], phase: 0.09 },
  { position: [139.60, 35.68], phase: 0.47 }, { position: [139.92, 35.72], phase: 0.75 },
  { position: [139.77, 35.52], phase: 0.21 }, { position: [139.66, 35.50], phase: 0.86 },
  { position: [139.94, 35.60], phase: 0.38 }, { position: [139.58, 35.75], phase: 0.63 },
  { position: [139.82, 35.82], phase: 0.55 }, { position: [139.69, 35.83], phase: 0.02 },
  { position: [139.86, 35.48], phase: 0.42 }, { position: [139.55, 35.65], phase: 0.79 },
  { position: [139.90, 35.79], phase: 0.24 }, { position: [139.63, 35.78], phase: 0.61 },
];

// Fukushima → Kanto transmission spine — the line we'll flash red and break
// on the "respond when the system is tight" beat.
const FAULT_PATH = [
  [140.98, 37.42], [140.65, 37.05], [140.35, 36.62], [140.10, 36.15], [139.92, 35.85], [139.77, 35.68],
];
const FAULT_BATTERIES = [
  { position: [139.76, 35.68], phase: 0.10 },  // Tokyo
  { position: [140.87, 38.27], phase: 0.35 },  // Sendai
  { position: [139.65, 35.90], phase: 0.60 },  // Saitama
  { position: [139.02, 37.90], phase: 0.85 },  // Niigata
];

// Camera views for each capability step. Stage 3 keeps the atlas default.
const CAPABILITY_VIEWS = {
  4: { longitude: 139.80, latitude: 35.70, zoom: 7.4, pitch: 42, bearing: 8 },  // Tokyo close
  5: { longitude: 140.30, latitude: 36.60, zoom: 6.4, pitch: 40, bearing: -4 }, // Fault corridor
  6: { longitude: 138.00, latitude: 37.60, zoom: 4.35, pitch: 28, bearing: 6 }, // Full country wide
};

// Amsterdam-style overlays. Base city glow is always on for stages 3+;
// stage-specific layers add solar (4), fault + battery response (5),
// and fuller twinkle (6).
export const buildOverlayLayers = (t, stageIndex) => {
  const layers = [
    // Very soft warm bloom under each metro — gives cities a low-frequency
    // amber wash so the point-cloud reads as "cities" not "scattered dots".
    new ScatterplotLayer({
      id: 'city-bloom',
      data: JP_CITIES,
      getPosition: (d) => d.position,
      getRadius: (d) => d.size * 1.9,
      radiusUnits: 'pixels',
      getFillColor: (d) => {
        const pulse = 0.6 + Math.sin(t / 1600 + d.phase * Math.PI * 2) * 0.4;
        return [255, 190, 90, Math.round(18 + pulse * 22)];
      },
      stroked: false,
      updateTriggers: { getFillColor: [t] },
    }),
    // Rural lights: dimmer, smaller, slightly slower twinkle. Rendered under
    // the city lights so metros still dominate but the rest of the country
    // registers as inhabited.
    new ScatterplotLayer({
      id: 'rural-lights',
      data: RURAL_LIGHTS,
      getPosition: (d) => d.position,
      getRadius: (d) => d.size,
      radiusUnits: 'pixels',
      radiusMinPixels: 0.4,
      radiusMaxPixels: 1.6,
      getFillColor: (d) => {
        const s = Math.sin(t / 1100 * d.freq + d.phase * Math.PI * 2);
        const bright = 0.5 + s * 0.5;
        const a = Math.max(18, Math.round(d.baseAlpha * bright));
        const r = 255;
        const g = Math.round(210 + d.warmth * 30);
        const b = Math.round(130 + d.warmth * 80);
        return [r, g, b, a];
      },
      stroked: false,
      updateTriggers: { getFillColor: [Math.round(t / 40)] }, // ~25 fps rebuild
    }),
    // Sea of houses: thousands of tiny points, each with its own phase, freq,
    // brightness, and warmth. This is what reads as "millions of little houses".
    new ScatterplotLayer({
      id: 'house-lights',
      data: HOUSE_LIGHTS,
      getPosition: (d) => d.position,
      getRadius: (d) => d.size,
      radiusUnits: 'pixels',
      radiusMinPixels: 0.6,
      radiusMaxPixels: 2.2,
      getFillColor: (d) => {
        // per-point twinkle: sine wave centered ~0.7, dips to ~0.25 at trough.
        const s = Math.sin(t / 900 * d.freq + d.phase * Math.PI * 2);
        const bright = 0.55 + s * 0.45;
        const a = Math.max(30, Math.round(d.baseAlpha * bright));
        // warmth: gold (255,214,120) ↔ cream (255,242,205)
        const r = 255;
        const g = Math.round(214 + d.warmth * 28);
        const b = Math.round(120 + d.warmth * 85);
        return [r, g, b, a];
      },
      stroked: false,
      updateTriggers: { getFillColor: [Math.round(t / 33)] }, // ~30 fps rebuild
    }),
  ];

  // Stage 4 — Tokyo solar rollout: gold twinkling dots around Tokyo.
  if (stageIndex === 4) {
    layers.push(new ScatterplotLayer({
      id: 'tokyo-solar-halo',
      data: TOKYO_SOLAR_POINTS,
      getPosition: (d) => d.position,
      getRadius: (d) => {
        const pulse = 0.5 + Math.sin(t / 480 + d.phase * Math.PI * 2) * 0.5;
        return 850 + pulse * 1400;
      },
      radiusUnits: 'meters',
      getFillColor: (d) => {
        const pulse = 0.5 + Math.sin(t / 480 + d.phase * Math.PI * 2) * 0.5;
        return [255, 214, 92, Math.round(60 + pulse * 120)];
      },
      stroked: false,
      updateTriggers: { getRadius: [t], getFillColor: [t] },
    }));
    layers.push(new ScatterplotLayer({
      id: 'tokyo-solar-core',
      data: TOKYO_SOLAR_POINTS,
      getPosition: (d) => d.position,
      getRadius: 380,
      radiusUnits: 'meters',
      getFillColor: [255, 244, 168, 240],
      stroked: false,
    }));
  }

  // Stage 5 — Fault beat: the transmission spine flashes red, then breaks,
  // then batteries at either end pulse cyan/green as they take over.
  // Cycle: 0-40% flash red, 40-60% dark gap, 60-100% batteries pulse.
  if (stageIndex === 5) {
    const cycle = (t % 4200) / 4200;                       // 4.2s loop
    const flashing = cycle < 0.4;
    const broken = cycle >= 0.4 && cycle < 0.6;
    const restoring = cycle >= 0.6;
    const flashPulse = flashing ? 0.5 + Math.sin(t / 90) * 0.5 : 0;
    const restoreAlpha = restoring ? Math.min(1, (cycle - 0.6) / 0.4) : 0;

    // Outer glow (red flash), then thin dashed dark break, then cyan recovery
    if (!broken) {
      layers.push(new PathLayer({
        id: 'fault-glow',
        data: [{ path: FAULT_PATH }],
        getPath: (d) => d.path,
        getWidth: flashing ? 12 + flashPulse * 10 : 8,
        widthUnits: 'pixels',
        getColor: flashing
          ? [255, 82, 82, Math.round(120 + flashPulse * 120)]
          : [52, 211, 153, Math.round(120 + restoreAlpha * 120)],
        capRounded: true, jointRounded: true,
        updateTriggers: { getColor: [t], getWidth: [t] },
      }));
    }
    layers.push(new PathLayer({
      id: 'fault-core',
      data: [{ path: FAULT_PATH }],
      getPath: (d) => d.path,
      getWidth: 3,
      widthUnits: 'pixels',
      getColor: broken
        ? [80, 20, 20, 60]
        : flashing ? [255, 120, 120, 240] : [140, 245, 200, Math.round(200 + restoreAlpha * 55)],
      capRounded: true, jointRounded: true,
      updateTriggers: { getColor: [t] },
    }));

    // Battery response halo — glows cyan→green as restoration ramps
    layers.push(new ScatterplotLayer({
      id: 'fault-battery-halo',
      data: FAULT_BATTERIES,
      getPosition: (d) => d.position,
      getRadius: (d) => {
        const pulse = 0.5 + Math.sin(t / 220 + d.phase * Math.PI * 2) * 0.5;
        return 3200 + pulse * 2400 + restoreAlpha * 2000;
      },
      radiusUnits: 'meters',
      getFillColor: (d) => {
        const pulse = 0.5 + Math.sin(t / 220 + d.phase * Math.PI * 2) * 0.5;
        return [82, 231, 178, Math.round(50 + pulse * 90 + restoreAlpha * 60)];
      },
      stroked: false,
      updateTriggers: { getRadius: [t], getFillColor: [t] },
    }));
    layers.push(new ScatterplotLayer({
      id: 'fault-battery-core',
      data: FAULT_BATTERIES,
      getPosition: (d) => d.position,
      getRadius: 1400,
      radiusUnits: 'meters',
      getFillColor: [220, 252, 231, 245],
      stroked: false,
    }));
  }

  return layers;
};

const CUES = {
  reframe: 'MA / A deliberate pause',
  topology: 'DISTRIBUTED TOPOLOGY',
  city: 'THE GRAPH BECOMES LIVED INFRASTRUCTURE',
  japan: 'JAPAN / THE SAME GRAPH HAS A GEOGRAPHY',
  superpowers: 'COORDINATION CREATES CAPACITY',
};

const drawGraphScene = (canvas, stageIndex, now) => {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(bounds.width));
  const height = Math.max(1, Math.floor(bounds.height));
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  if (stageIndex < 1 || stageIndex > 2) return;

  const isCity = stageIndex === 2;
  const pulse = 0.5 + Math.sin(now / 720) * 0.5;
  const point = ([x, y]) => [x * width, y * height];
  context.lineCap = 'round';
  VPP_GRAPH_LINKS.forEach((link) => {
    const [start, end] = link.path.map(point);
    context.beginPath();
    context.moveTo(...start);
    context.lineTo(...end);
    context.strokeStyle = `rgba(34, 211, 238, ${isCity ? 0.26 : 0.18 + pulse * 0.14})`;
    context.lineWidth = isCity ? 3 : 1.5;
    context.stroke();
  });
  if (isCity) {
    VPP_CITY_BUILDINGS.forEach((building) => {
      const polygon = building.polygon.map(point);
      context.beginPath();
      polygon.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)));
      context.closePath();
      context.fillStyle = `rgba(17, 30, 52, ${0.82 + building.load * 0.14})`;
      context.strokeStyle = 'rgba(72, 94, 126, 0.75)';
      context.lineWidth = 1;
      context.fill();
      context.stroke();
    });
  }
  VPP_GRAPH_NODES.forEach((node) => {
    const [x, y] = point(node.position);
    const radius = isCity ? 4 + node.load * 4 : 6 + node.load * 7 + pulse * 2;
    const isLoaded = node.load >= 0.8;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = isLoaded ? 'rgba(255, 194, 23, 0.96)' : 'rgba(34, 211, 238, 0.95)';
    context.shadowColor = isLoaded ? 'rgba(255, 194, 23, 0.9)' : 'rgba(34, 211, 238, 0.82)';
    context.shadowBlur = isCity ? 14 : 24;
    context.fill();
  });
  context.shadowBlur = 0;
};

const CAPABILITIES = [
  { id: 'market',   icon: '◒', copy: 'Bring new players into the market', metric: '+2.4 GW', sub: 'aggregated behind-the-meter', hue: '#67e8f9' },
  { id: 'response', icon: '⌁', copy: 'Respond when the system is tight', metric: '<400 ms', sub: 'coordinated dispatch latency',  hue: '#ffc217' },
  { id: 'demand',   icon: '▣', copy: 'Use demand smarter',                metric: '−18%',    sub: 'peak-hour consumption',       hue: '#a78bfa' },
];

function VPPCapabilityPanel({ capabilityPhase, stabilizationRef }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let raf;
    const loop = () => { setTick((t) => t + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pulse = 0.5 + Math.sin(tick / 18) * 0.5;
  const stabilization = stabilizationRef?.current ?? 0;
  const allOnline = capabilityPhase >= CAPABILITIES.length - 1;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Title block, top-left */}
      <div style={{ position: 'absolute', left: 42, top: 44, width: 440 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.18em', color: '#67e8f9', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: '#67e8f9', boxShadow: `0 0 ${6 + pulse * 10}px #67e8f9`, opacity: 0.6 + pulse * 0.4 }} />
          ACT IV / VIRTUAL POWER PLANT
        </div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 40, lineHeight: 1.02, fontWeight: 800, color: '#f1f5f9', marginBottom: 18 }}>
          Coordination unlocks capacity.
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {CAPABILITIES.map((cap, index) => {
            const on = capabilityPhase >= index;
            return (
              <div key={cap.id} data-testid={`vpp-capability-${cap.id}`}
                style={{ position: 'relative',
                  display: 'grid', gridTemplateColumns: '36px 1fr auto', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  border: `1px solid ${on ? cap.hue + '66' : 'rgba(103,232,249,0.18)'}`,
                  background: on
                    ? `linear-gradient(90deg, ${cap.hue}18 0%, rgba(3,5,8,0.85) 60%)`
                    : 'rgba(3,5,8,0.7)',
                  color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif',
                  opacity: on ? 1 : 0.35,
                  transform: on ? 'translateX(0)' : 'translateX(-16px)',
                  transition: 'opacity 520ms ease, transform 520ms ease, border-color 520ms ease, background 520ms ease',
                  boxShadow: on ? `0 0 24px ${cap.hue}22, inset 0 0 20px ${cap.hue}0a` : 'none' }}>
                {/* left status LED */}
                <span aria-hidden="true" style={{ position: 'relative', width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                    border: `1px solid ${on ? cap.hue + '88' : 'rgba(103,232,249,0.25)'}`,
                    boxShadow: on ? `0 0 ${6 + pulse * 12}px ${cap.hue}80` : 'none',
                    transition: 'box-shadow 420ms ease' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: on ? cap.hue : '#67e8f966', fontSize: 18, fontWeight: 800 }}>{cap.icon}</span>
                </span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.15 }}>{cap.copy}</div>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    color: on ? '#94a3b8' : '#64748b60', letterSpacing: '0.05em', marginTop: 3 }}>
                    {cap.sub}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 88 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 800,
                    color: on ? cap.hue : '#67e8f930',
                    textShadow: on ? `0 0 12px ${cap.hue}60` : 'none', letterSpacing: '-0.02em' }}>
                    {cap.metric}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                    color: on ? cap.hue + 'cc' : '#67e8f930', letterSpacing: '0.14em', marginTop: 2 }}>
                    {on ? 'ONLINE' : 'STANDBY'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom-right hero summary */}
      <div style={{ position: 'absolute', right: 44, bottom: 44, width: 320,
        border: `1px solid ${allOnline ? 'rgba(255,194,23,0.55)' : 'rgba(103,232,249,0.28)'}`,
        background: 'rgba(3,5,8,0.86)', padding: '18px 22px',
        boxShadow: allOnline ? `0 0 40px rgba(255,194,23,0.22), inset 0 0 30px rgba(255,194,23,0.06)` : '0 0 24px rgba(103,232,249,0.1)',
        transition: 'border-color 620ms ease, box-shadow 620ms ease',
        backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em',
          color: allOnline ? '#ffc217' : '#67e8f9', marginBottom: 6 }}>
          {allOnline ? 'FLEET COORDINATED' : 'BRINGING FLEET ONLINE'}
        </div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 40, fontWeight: 800,
          color: allOnline ? '#ffc217' : '#f1f5f9', lineHeight: 1,
          textShadow: allOnline ? '0 0 24px rgba(255,194,23,0.4)' : 'none' }}>
          {allOnline ? '2.4 GW' : `${(2.4 * Math.min(1, (capabilityPhase + 1) / 3)).toFixed(1)} GW`}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>
          equivalent dispatchable capacity — from assets that already exist.
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 14, height: 4, background: 'rgba(103,232,249,0.12)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%',
            width: `${Math.max(6, Math.min(100, ((capabilityPhase + 1) / 3) * 100 * Math.min(1, stabilization * 3)))}%`,
            background: allOnline ? '#ffc217' : '#67e8f9',
            boxShadow: `0 0 12px ${allOnline ? '#ffc217' : '#67e8f9'}80`,
            transition: 'width 620ms ease, background 620ms ease' }} />
        </div>
      </div>
    </div>
  );
}

export default function VPPTransformationSequence({ height = '100%' }) {
  return (
    <StepBridge count={7}>
      {(step) => <VPPTransformationStage height={height} stageIndex={step} />}
    </StepBridge>
  );
}

function VPPTransformationStage({ height, stageIndex }) {
  const slideContext = React.useContext(SlideContext);
  const isActive = slideContext?.isSlideActive ?? true;
  const graphCanvasRef = useRef(null);
  const stabilizationRef = useRef(0);
  const capabilityPhaseRef = useRef(-1);
  const [cueVisible, setCueVisible] = useState(true);
  const [capabilityPhase, setCapabilityPhase] = useState(-1);
  const stage = VPP_TRANSFORMATION_STAGES[stageIndex] ?? VPP_TRANSFORMATION_STAGES[0];
  const transmissionLayers = useCallback((tripTime) => getVPPTransformationLayers({ stage: stageIndex, tripTime, stabilization: stabilizationRef.current, capabilityPhase }), [stageIndex, capabilityPhase]);

  useEffect(() => {
    stabilizationRef.current = 0;
    capabilityPhaseRef.current = -1;
    setCapabilityPhase(-1);
    setCueVisible(true);
    const timer = window.setTimeout(() => setCueVisible(false), 2800);
    return () => window.clearTimeout(timer);
  }, [stageIndex]);

  useEffect(() => {
    if (!isActive) return undefined;
    let frame;
    const tick = (now) => {
      stabilizationRef.current = stageIndex >= 4 ? 1 : 0;
      const nextCapabilityPhase = stageIndex >= 4 ? Math.min(2, stageIndex - 4) : -1;
      if (nextCapabilityPhase !== capabilityPhaseRef.current) {
        capabilityPhaseRef.current = nextCapabilityPhase;
        setCapabilityPhase(nextCapabilityPhase);
      }
      drawGraphScene(graphCanvasRef.current, stageIndex, now);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, stageIndex]);

  return (
    <div data-testid="vpp-transformation-sequence" style={{ height, minHeight: '100%', width: '100%', position: 'relative', overflow: 'hidden', background: '#030508' }}>
            <canvas ref={graphCanvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: stageIndex >= 1 && stageIndex <= 2 ? 1 : 0, transition: 'opacity 700ms ease', zIndex: 1 }} />
            {stageIndex >= 3 && (
              <div data-testid="vpp-japan-map" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                <JapanGridAtlas
                  transmissionLayer={{ getLayers: transmissionLayers }}
                  sceneLayer={{ view: CAPABILITY_VIEWS[stageIndex], getLayers: (t) => buildOverlayLayers(t ?? performance.now(), stageIndex) }}
                />
              </div>
            )}
            <div data-testid={`vpp-stage-${stage.id}`} style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
              {cueVisible && <div data-testid={`vpp-context-cue-${stage.cue}`} style={{ position: 'absolute', top: 34, right: 38, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(165, 243, 252, 0.82)', transition: 'opacity 460ms ease', opacity: cueVisible ? 1 : 0 }}>{CUES[stage.cue]}</div>}
              {stageIndex === 0 && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div style={{ width: 86, height: 3, background: 'var(--color-primary)', margin: '0 auto 26px' }} /><div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 56, fontWeight: 800, color: '#f1f5f9' }}>The grid is a distributed system.</div></div></div>}
              {stageIndex === 1 && <div style={{ position: 'absolute', left: 54, bottom: 48, maxWidth: 600, fontFamily: 'Space Grotesk, sans-serif', fontSize: 44, lineHeight: 1.08, fontWeight: 800, color: '#f1f5f9' }}>You already know how to solve this.</div>}
              {stageIndex === 2 && <div style={{ position: 'absolute', left: 54, bottom: 48, display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 4, maxWidth: 820, fontFamily: 'Space Grotesk, sans-serif', fontSize: 52, lineHeight: 1, fontWeight: 800 }}><span data-testid="vpp-hero-graph" style={{ color: '#f1f5f9', opacity: 1, transform: 'translateY(0)', transition: 'opacity 600ms ease, transform 600ms ease' }}>A graph</span><span data-testid="vpp-hero-city" style={{ color: '#f1f5f9', transform: 'scale(1)', transition: 'transform 620ms cubic-bezier(.2,1.35,.4,1)' }}>is a city</span><span data-testid="vpp-hero-load" style={{ color: '#ffc217', opacity: 1, letterSpacing: '0', transition: 'opacity 540ms 820ms ease, letter-spacing 540ms 820ms ease' }}>under load.</span></div>}
              {stageIndex === 3 && <div style={{ position: 'absolute', left: 42, top: 44, maxWidth: 430 }}><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.15em', color: '#67e8f9', marginBottom: 12 }}>ACT III / JAPAN</div><div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 47, lineHeight: 1.04, fontWeight: 800, color: '#f1f5f9' }}>The same graph has a geography.</div></div>}
              {stageIndex >= 4 &&<VPPCapabilityPanel capabilityPhase={capabilityPhase} stabilizationRef={stabilizationRef} />}
            </div>
    </div>
  );
}
