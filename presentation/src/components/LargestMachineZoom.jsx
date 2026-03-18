import React, { useEffect, useRef, useContext, useMemo, useState, useCallback } from 'react';
import { SlideContext, useSteps } from 'spectacle';
import DeckGL from '@deck.gl/react';
import { WebMercatorViewport } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer } from '@deck.gl/layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { colors } from '../theme';
import SETTLEMENTS_RAW from '../data/europe-settlements';

/**
 * LargestMachineZoom — Full-slide animation (4 phases, 3 arrow presses).
 *
 * Phase 0: Canvas — subtle grid pulse + "HOW BIG? LET'S COMPARE."
 * Phase 1: Canvas — Wolfsburg factory drawn by pen traces
 * Phase 2: deck.gl — Manual zoom-out from Wolfsburg to EU night-lights
 * Phase 3: Canvas overlay — Big "0" ZERO DOWNTIME over the EU map
 */

const hexToRgb = (hex) => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [200, 200, 200];
};

// ── Pre-process GeoNames settlements with animation groups ──
// group: 0=static, 1=blink (0.2s off/1s cycle), 2=fade (smooth), 3=pulse (bright flash/3s)
const SETTLEMENTS = SETTLEMENTS_RAW.map(([lng, lat, pop], i) => {
  const hash = ((i * 2654435761) >>> 0) % 20;
  let group = 0;
  if (hash === 0) group = 1;
  else if (hash === 1) group = 2;
  else if (hash === 2) group = 3;
  const seed = ((i * 2654435761) >>> 0) / 4294967296; // 0-1
  return { position: [lng, lat], pop, group, seed };
});

// Wolfsburg VW factory: 52.4227°N 10.7865°E
const WOLFSBURG = [10.7865, 52.4227];

// ── Helpers ──

function lerp(a, b, t) { return a + (b - a) * t; }

function easeOutBack(t) {
  const c1 = 1.70158, c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

// Use deck.gl's own viewport for projection — guarantees alignment with ScatterplotLayer dots
function projectToScreen(lng, lat, view, screenW, screenH) {
  const vp = new WebMercatorViewport({ width: screenW, height: screenH, ...view });
  const [x, y] = vp.project([lng, lat]);
  return { x, y };
}

// ── Canvas drawing helpers (Phase 0, 1, 3) ──

function drawFactory(ctx, x, y, w, h, alpha, labelAlpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = colors.accent;
  ctx.fillStyle = colors.accent;
  ctx.lineWidth = Math.max(1, w * 0.006);

  const baseY = y + h;

  ctx.beginPath(); ctx.moveTo(x, baseY); ctx.lineTo(x, y + h * 0.3); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x + w * 0.7, y + h * 0.3); ctx.lineTo(x + w * 0.7, baseY); ctx.stroke();

  const roofY = y + h * 0.3;
  const teeth = 6, tw = (w * 0.7) / teeth;
  ctx.beginPath();
  for (let i = 0; i < teeth; i++) {
    ctx.moveTo(x + i * tw, roofY);
    ctx.lineTo(x + i * tw + tw * 0.5, roofY - h * 0.12);
    ctx.lineTo(x + (i + 1) * tw, roofY);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.72, baseY); ctx.lineTo(x + w * 0.72, y + h * 0.05);
  ctx.lineTo(x + w * 0.82, y + h * 0.05); ctx.lineTo(x + w * 0.82, baseY); ctx.stroke();

  const towerTop = y + h * 0.05;
  const windowGap = (baseY - towerTop) / 8;
  ctx.globalAlpha = alpha * 0.3;
  for (let wi = 1; wi < 8; wi++) {
    const wy = towerTop + wi * windowGap;
    ctx.beginPath(); ctx.moveTo(x + w * 0.74, wy); ctx.lineTo(x + w * 0.80, wy); ctx.stroke();
  }
  ctx.globalAlpha = alpha;

  const stackPositions = [0.08, 0.18, 0.28, 0.38];
  const stackW = w * 0.025, stackH = h * 1.1;
  stackPositions.forEach(pos => {
    const sx = x + w * pos - stackW / 2, sy = y - stackH * 0.15;
    ctx.beginPath(); ctx.moveTo(sx, baseY); ctx.lineTo(sx, sy); ctx.lineTo(sx + stackW, sy); ctx.lineTo(sx + stackW, baseY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - stackW * 0.3, sy); ctx.lineTo(sx + stackW + stackW * 0.3, sy); ctx.stroke();
  });

  if (labelAlpha > 0.01) {
    ctx.globalAlpha = alpha * labelAlpha;
    ctx.fillStyle = colors.accent;
    ctx.font = `600 ${Math.max(10, w * 0.05)}px "JetBrains Mono"`;
    ctx.textAlign = 'center';
    ctx.fillText('VW WOLFSBURG', x + w / 2, baseY + Math.max(14, w * 0.05));
    ctx.font = `${Math.max(8, w * 0.035)}px "JetBrains Mono"`;
    ctx.fillStyle = colors.textDim;
    ctx.fillText('60,000 workers  \u00b7  6.5 km\u00b2', x + w / 2, baseY + Math.max(28, w * 0.09));
  }
  ctx.restore();
}

const ZERO_BOX = { w: 200, h: 80 };

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r); ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r); ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r); ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
}

function drawCounterHUD(ctx, count, label, labelColor, alpha, width) {
  const { w: boxW, h: boxH } = ZERO_BOX;
  const boxX = width - boxW - 16, boxY = 12;
  ctx.save(); ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(26, 34, 54, 0.8)';
  roundRect(ctx, boxX, boxY, boxW, boxH, 8); ctx.fill();
  const [pr, pg, pb] = hexToRgb(colors.primary);
  ctx.strokeStyle = `rgba(${pr},${pg},${pb},0.15)`; ctx.lineWidth = 1;
  roundRect(ctx, boxX, boxY, boxW, boxH, 8); ctx.stroke();
  ctx.font = '800 32px "JetBrains Mono"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillStyle = colors.primary; ctx.shadowBlur = 12; ctx.shadowColor = colors.primary;
  ctx.fillText(count.toLocaleString(), boxX + boxW / 2, boxY + 30); ctx.shadowBlur = 0;
  ctx.font = '500 16px "JetBrains Mono"'; ctx.fillStyle = colors.textMuted;
  ctx.fillText('WORKERS', boxX + boxW / 2, boxY + 58);
  if (label) {
    ctx.font = '600 14px "JetBrains Mono"'; ctx.textAlign = 'center';
    ctx.fillStyle = labelColor; ctx.fillText(label, boxX + boxW / 2, boxY + boxH + 24);
  }
  ctx.restore();
}

// ── deck.gl config ──
const DARK_MAP = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
const WOLFSBURG_VIEW = { longitude: 10.7865, latitude: 52.4227, zoom: 14, pitch: 0, bearing: 0 };
const EUROPE_VIEW   = { longitude: 10, latitude: 50, zoom: 3.8, pitch: 0, bearing: 0 };
const ZOOM_DURATION = 7; // seconds — slow enough to track Wolfsburg

export default function LargestMachineZoom({ width = 1024, height = 668 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mapRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const { step: rawStep, placeholder } = useSteps(3);
  const currentStepValue = rawStep + 1;
  const stepRef = useRef(0);
  const phaseTimeRef = useRef(0);
  const prevStepRef = useRef(-1);

  // ── Controlled viewState — manual interpolation in RAF loop ──
  const [viewState, setViewState] = useState(WOLFSBURG_VIEW);
  const viewStateRef = useRef(WOLFSBURG_VIEW); // live view for use inside draw closure
  const zoomProgressRef = useRef(0);  // 0-1 animation progress for light appearance
  const nowRef = useRef(0);           // current time (seconds) for light animation
  const scanRef = useRef(null);       // { scanY, vp } — screen-space scan line for dot glow
  const scanStartRef = useRef(null);  // timestamp when scan line first appears

  // Light animation tick — 10fps layer updates for blink/fade/pulse effects
  const [lightTick, setLightTick] = useState(0);
  useEffect(() => {
    if (currentStepValue < 2) return;
    const interval = setInterval(() => setLightTick(t => t + 1), 16);
    return () => clearInterval(interval);
  }, [currentStepValue]);

  // Reset viewState when going back to earlier phases
  useEffect(() => {
    if (currentStepValue < 2) {
      setViewState(WOLFSBURG_VIEW);
      zoomProgressRef.current = 0;
    }
  }, [currentStepValue]);

  // Hide borders + darken ocean to near-black night color
  const onMapLoad = useCallback(() => {
    const map = mapRef.current?.getMap?.() || mapRef.current;
    if (!map) return;
    try {
      const style = map.getStyle();
      if (style?.layers) {
        style.layers.forEach(layer => {
          if (layer.id.includes('boundary') || layer.id.includes('admin') || layer.id.includes('border')) {
            map.setLayoutProperty(layer.id, 'visibility', 'none');
          }
        });
      }
      // Night ocean — nearly black with faint blue
      map.setPaintProperty('water', 'fill-color', '#080a0c');
      if (map.getLayer('waterway')) map.setPaintProperty('waterway', 'line-color', '#0a0e12');
    } catch (_) { /* style not ready */ }
  }, []);

  // deck.gl layers — 46K real European settlements with animated subsets
  const layers = useMemo(() => {
    if (currentStepValue < 2) return [];
    const now = nowRef.current;
    const zp = zoomProgressRef.current;

    // Compute scan line position in lat/lng (same tick as dots = perfect sync)
    let scanVp = null;
    let scanLat = null;
    const showScan = zp >= 1;
    if (showScan) {
      try {
        const vs = viewStateRef.current;
        scanVp = new WebMercatorViewport({ width, height, ...vs });
        const [, rawTopLat] = scanVp.unproject([width / 2, 0]);
        const [, rawBotLat] = scanVp.unproject([width / 2, height]);
        const rawRange = rawTopLat - rawBotLat;
        // Overshoot 10% on both sides so line fully exits the screen
        const topLat = rawTopLat + rawRange * 0.1;
        const latRange = (rawRange * 1.2);
        if (scanStartRef.current === null) scanStartRef.current = performance.now();
        const scanElapsed = (performance.now() - scanStartRef.current) / 1000;
        const scanFrac = (scanElapsed % 13) / 13;
        scanLat = topLat - scanFrac * latRange;
        const [, sy] = scanVp.project([vs.longitude, scanLat]);
        scanRef.current = { scanY: sy, vp: scanVp };
      } catch (_) { /* viewport not ready */ }
    } else {
      scanRef.current = null;
      scanStartRef.current = null;
    }

    const result = [
      new ScatterplotLayer({
        id: 'settlements',
        data: SETTLEMENTS,
        getPosition: d => d.position,
        getRadius: d => 100 + Math.sqrt(d.pop) * 2,
        getFillColor: d => {
          const popFactor = Math.min(1, Math.sqrt(d.pop) / 130);
          // Progressive appearance: big cities first, smaller ones later
          const appearT = Math.max(0, Math.min(1, (zp - (1 - popFactor) * 0.7) / 0.3));
          if (appearT < 0.01) return [255, 240, 200, 0];
          let brightness = Math.min(255, 100 + Math.sqrt(d.pop) * 0.5);
          let alpha = brightness * appearT;

          // Animation groups (only when fully appeared)
          if (appearT > 0.5) {
            if (d.group === 1) {
              // Blink: 1s cycle, 0.2s off
              const cycle = (now + d.seed * 7) % 1;
              if (cycle > 0.8) alpha = 0;
            } else if (d.group === 2) {
              // Fade in/out: smooth ~2s cycle
              const fade = (Math.sin((now + d.seed * 10) * Math.PI) + 1) / 2;
              alpha *= 0.2 + fade * 0.8;
            } else if (d.group === 3) {
              // Bright pulse: every 3s, 0.4s flash
              const cycle = (now + d.seed * 20) % 3;
              if (cycle < 0.4) {
                alpha = Math.min(255, alpha * 2.5);
              }
            }
          }

          // Scan line glow — screen-space comparison, only behind the line
          const scan = scanRef.current;
          if (scan) {
            const [, dotY] = scan.vp.project(d.position);
            // diff > 0 means scan line is below the dot = line already passed
            const diff = scan.scanY - dotY;
            const trail = 200; // 200px smooth fade trail
            if (diff > 0 && diff < trail) {
              // Smooth cubic ease-out: bright at contact, gentle fade to baseline
              const t_decay = diff / trail; // 0 at line, 1 at end
              const glowT = 1 - t_decay;
              const smooth = glowT * glowT; // quadratic: gentle fade, no hard edge
              const boostedAlpha = Math.round(alpha + (255 - alpha) * smooth);
              const cyan = smooth * 0.8;
              return [
                Math.round(255 * (1 - cyan) + 120 * cyan),
                Math.round(240 * (1 - cyan) + 230 * cyan),
                Math.round(200 * (1 - cyan) + 255 * cyan),
                boostedAlpha,
              ];
            }
          }

          return [255, 240, 200, Math.round(Math.max(0, Math.min(255, alpha)))];
        },
        radiusMinPixels: 0.3,
        radiusMaxPixels: 2,
        updateTriggers: { getFillColor: [lightTick] },
      }),
      new ScatterplotLayer({
        id: 'wolfsburg',
        data: [WOLFSBURG],
        getPosition: d => d,
        getRadius: 4000,
        getFillColor: () => {
          const zp = zoomProgressRef.current;
          // Don't show until factory lines have faded (factory fades at t*1.5, gone at ~0.67)
          // Start appearing at 60% zoom progress, full brightness at 80%
          if (zp < 0.55) return [245, 158, 11, 0];
          const dotT = Math.max(0, Math.min(1, (zp - 0.55) / 0.25));
          const alpha = Math.round(dotT * 255);
          return [245, 158, 11, alpha];
        },
        radiusMinPixels: 4,
        radiusMaxPixels: 8,
        updateTriggers: { getFillColor: [lightTick] },
      }),
    ];

    // Add scan line as a deck.gl LineLayer — same pipeline as dots = perfect sync
    if (showScan && scanVp && scanLat !== null) {
      const [westLng] = scanVp.unproject([0, height / 2]);
      const [eastLng] = scanVp.unproject([width, height / 2]);
      result.push(new LineLayer({
        id: 'scan-line',
        data: [{ from: [westLng - 10, scanLat], to: [eastLng + 10, scanLat] }],
        getSourcePosition: d => d.from,
        getTargetPosition: d => d.to,
        getColor: [34, 211, 238, 25],
        getWidth: 2,
        widthMinPixels: 1,
        widthMaxPixels: 2,
      }));
    }

    return result;
  }, [currentStepValue, lightTick, width, height]);

  // ── Canvas animation loop (Phase 0, 1, 3 + HUD overlay for Phase 2) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now();
      nowRef.current = now / 1000;

      if (currentStepValue !== prevStepRef.current) {
        prevStepRef.current = currentStepValue;
        stepRef.current = currentStepValue;
        phaseTimeRef.current = now;
      }

      const step = stepRef.current;
      const elapsed = (now - phaseTimeRef.current) / 1000;

      ctx.clearRect(0, 0, width, height);

      // ════════════════════════════════════════════
      // PHASE 0: Grid pulse + "HOW BIG? LET'S COMPARE."
      // ════════════════════════════════════════════
      if (step === 0) {
        ctx.save();
        ctx.globalAlpha = 0.025 + Math.sin(now / 2000) * 0.008;
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 0.5;
        for (let gx = 0; gx < width; gx += 40) {
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
        }
        for (let gy = 0; gy < height; gy += 40) {
          ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
        }
        ctx.restore();

        if (elapsed > 0.3) {
          const t1 = Math.min(1, (elapsed - 0.3) / 0.35);
          ctx.save(); ctx.globalAlpha = t1;
          ctx.font = '900 60px "JetBrains Mono"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = colors.text; ctx.shadowBlur = 20; ctx.shadowColor = colors.primary + '30';
          ctx.fillText('HOW BIG?', width / 2, height * 0.42);
          ctx.shadowBlur = 0; ctx.restore();
        }
        if (elapsed > 0.9) {
          const t2 = Math.min(1, (elapsed - 0.9) / 0.35);
          ctx.save(); ctx.globalAlpha = t2;
          ctx.font = '400 22px "JetBrains Mono"'; ctx.textAlign = 'center';
          ctx.fillStyle = colors.textMuted;
          ctx.fillText("LET'S COMPARE.", width / 2, height * 0.42 + 48);
          ctx.restore();
        }
      }

      // ════════════════════════════════════════════
      // PHASE 1: Factory drawn by sequential pen traces
      // ════════════════════════════════════════════
      if (step === 1) {
        const factoryW = 246, factoryH = factoryW * 0.4;
        const fCx = width / 2, fCy = height * 0.42;
        const factoryX = fCx - factoryW / 2, factoryY = fCy - factoryH / 2;
        const baseY = factoryY + factoryH, roofY = factoryY + factoryH * 0.3;
        const teeth = 6, tw = (factoryW * 0.7) / teeth;
        const stackW = factoryW * 0.025, stackH = factoryH * 1.1;
        const towerTop = factoryY + factoryH * 0.05;
        const windowGap = (baseY - towerTop) / 8;

        const buildingPath = [[factoryX, baseY], [factoryX, roofY]];
        for (let i = 0; i < teeth; i++) {
          buildingPath.push([factoryX + i * tw + tw * 0.5, roofY - factoryH * 0.12]);
          buildingPath.push([factoryX + (i + 1) * tw, roofY]);
        }
        buildingPath.push([factoryX + factoryW * 0.7, baseY]);

        const stackTraces = [0.08, 0.18, 0.28, 0.38].map(pos => {
          const sx = factoryX + factoryW * pos - stackW / 2;
          const sy = factoryY - stackH * 0.15, capExt = stackW * 0.3;
          return [[sx, baseY], [sx, sy], [sx - capExt, sy], [sx + stackW + capExt, sy], [sx + stackW, sy], [sx + stackW, baseY]];
        });

        const towerPath = [
          [factoryX + factoryW * 0.72, baseY], [factoryX + factoryW * 0.72, towerTop],
          [factoryX + factoryW * 0.82, towerTop], [factoryX + factoryW * 0.82, baseY],
        ];
        const windowPaths = Array.from({ length: 7 }, (_, wi) => {
          const wy = towerTop + (wi + 1) * windowGap;
          return [[factoryX + factoryW * 0.74, wy], [factoryX + factoryW * 0.80, wy]];
        });

        const bldgStart = 0, bldgDur = 0.9;
        const stackStart0 = 0.15, stackGap = 0.1, stackDur = 0.4;
        const towerStart = 0.65, towerDur = 0.5;
        const winStart0 = towerStart + towerDur * 0.55, winGap = 0.03, winDur = 0.08;

        const tracePath = (path, progress) => {
          if (progress <= 0 || path.length < 2) return null;
          const p = Math.min(1, progress);
          let totalLen = 0;
          for (let i = 1; i < path.length; i++)
            totalLen += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
          const targetLen = p * totalLen;
          let drawn = 0;
          ctx.beginPath(); ctx.moveTo(path[0][0], path[0][1]);
          for (let i = 1; i < path.length; i++) {
            const segLen = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
            if (drawn + segLen <= targetLen) {
              ctx.lineTo(path[i][0], path[i][1]); drawn += segLen;
            } else {
              const frac = segLen > 0 ? (targetLen - drawn) / segLen : 0;
              ctx.lineTo(path[i - 1][0] + (path[i][0] - path[i - 1][0]) * frac,
                         path[i - 1][1] + (path[i][1] - path[i - 1][1]) * frac);
              break;
            }
          }
          ctx.stroke();
        };

        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = Math.max(1, factoryW * 0.006);
        ctx.globalAlpha = 1;
        tracePath(buildingPath, (elapsed - bldgStart) / bldgDur);
        stackTraces.forEach((stack, si) => {
          const sP = (elapsed - (stackStart0 + si * stackGap)) / stackDur;
          if (sP > 0) { ctx.globalAlpha = 1; tracePath(stack, sP); }
        });
        const tP = (elapsed - towerStart) / towerDur;
        if (tP > 0) { ctx.globalAlpha = 1; tracePath(towerPath, tP); }
        windowPaths.forEach((wp, wi) => {
          const wP = (elapsed - (winStart0 + wi * winGap)) / winDur;
          if (wP > 0) { ctx.globalAlpha = 0.3; tracePath(wp, wP); }
        });
        ctx.globalAlpha = 1;

        const labelStart = Math.max(bldgStart + bldgDur, towerStart + towerDur * 0.7);
        if (elapsed > labelStart) {
          const labelAlpha = Math.min(1, (elapsed - labelStart) / 0.4);
          ctx.save(); ctx.globalAlpha = labelAlpha; ctx.textAlign = 'center';
          ctx.font = '700 24px "JetBrains Mono"'; ctx.fillStyle = colors.accent;
          ctx.shadowBlur = 10; ctx.shadowColor = colors.accent + '40';
          ctx.fillText('VOLKSWAGEN WOLFSBURG', fCx, baseY + 30); ctx.shadowBlur = 0;
          ctx.font = '600 14px "JetBrains Mono"'; ctx.fillStyle = colors.text;
          ctx.fillText("WORLD'S LARGEST FACTORY", fCx, baseY + 52);
          ctx.font = '500 14px "JetBrains Mono"'; ctx.fillStyle = colors.textDim;
          ctx.fillText('60,000 WORKERS \u00b7 6.5 KM\u00b2', fCx, baseY + 70);
          ctx.restore();
        }

        if (elapsed > 0.3) {
          const hudAlpha = Math.min(1, (elapsed - 0.3) / 0.5);
          drawCounterHUD(ctx, 60000, "World's Largest Factory", colors.accent, hudAlpha, width);
        }
      }

      // ════════════════════════════════════════════
      // PHASE 2: Manual zoom-out — factory tracks map projection
      // ════════════════════════════════════════════
      if (step === 2) {
        const t = Math.min(1, elapsed / ZOOM_DURATION);
        // ease-in-out cubic: slow start (keeps Wolfsburg visible), fast middle, slow end
        const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        zoomProgressRef.current = eased;

        // Interpolate viewState: zoom starts immediately, but pan is delayed
        // so Wolfsburg stays centered for the first half of the animation
        const panT = Math.max(0, Math.min(1, (eased - 0.4) / 0.6)); // pan starts at 40% zoom progress
        const panEased = panT * panT * (3 - 2 * panT); // smoothstep for the pan
        const currentView = {
          longitude: lerp(WOLFSBURG_VIEW.longitude, EUROPE_VIEW.longitude, panEased),
          latitude: lerp(WOLFSBURG_VIEW.latitude, EUROPE_VIEW.latitude, panEased),
          zoom: lerp(WOLFSBURG_VIEW.zoom, EUROPE_VIEW.zoom, eased),
          pitch: 0,
          bearing: 0,
        };

        // Push viewState to DeckGL (controlled mode)
        if (t < 1) {
          setViewState(currentView);
          viewStateRef.current = currentView;
        } else if (t >= 1 && eased < 1.01) {
          // Final state — set once
          setViewState(EUROPE_VIEW);
          viewStateRef.current = EUROPE_VIEW;
          zoomProgressRef.current = 1;
        }

        // Draw factory at its projected screen position, scaled proportionally to map zoom
        const zoomDelta = currentView.zoom - WOLFSBURG_VIEW.zoom; // negative (zooming out)
        const factoryScale = Math.pow(2, zoomDelta); // shrinks as zoom decreases

        if (factoryScale > 0.003) {
          const { x: projX, y: projY } = projectToScreen(
            WOLFSBURG[0], WOLFSBURG[1], currentView, width, height
          );
          // Phase 1 draws at (width/2, height*0.42). Keep factory there while visible,
          // then blend to projected position once it's mostly faded out.
          const blendT = Math.max(0, Math.min(1, (t - 0.3) / 0.2)); // blend from 30-50% of zoom
          const sx = lerp(width / 2, projX, blendT);
          const sy = lerp(height * 0.42, projY, blendT);

          const fadeAlpha = Math.max(0, 1 - t * 1.5); // fade out over first 2/3 of zoom
          if (fadeAlpha > 0.01) {
            const baseW = 246, baseH = baseW * 0.4;
            ctx.save();
            ctx.globalAlpha = fadeAlpha;
            ctx.translate(sx, sy);
            ctx.scale(factoryScale, factoryScale);
            ctx.translate(-sx, -sy);
            drawFactory(ctx, sx - baseW / 2, sy - baseH / 2, baseW, baseH, 1, factoryScale > 0.15 ? 1 : 0);
            if (factoryScale > 0.15) {
              ctx.textAlign = 'center';
              ctx.font = '700 24px "JetBrains Mono"'; ctx.fillStyle = colors.accent;
              ctx.shadowBlur = 10; ctx.shadowColor = colors.accent + '40';
              ctx.fillText('VOLKSWAGEN WOLFSBURG', sx, sy + baseH / 2 + 30);
              ctx.shadowBlur = 0;
              ctx.font = '600 14px "JetBrains Mono"'; ctx.fillStyle = colors.text;
              ctx.fillText("WORLD'S LARGEST FACTORY", sx, sy + baseH / 2 + 52);
              ctx.font = '500 14px "JetBrains Mono"'; ctx.fillStyle = colors.textDim;
              ctx.fillText('60,000 WORKERS \u00b7 6.5 KM\u00b2', sx, sy + baseH / 2 + 70);
            }
            ctx.restore();
          }
        }

        // Hollywood-style callout label — traces from the deck.gl Wolfsburg dot
        if (eased > 0.75) {
          const calloutAlpha = Math.min(1, (eased - 0.75) / 0.15);
          // Use the FINAL view for projection so the label lands exactly on the dot
          // at full zoom-out (no drift from interpolation rounding)
          const projView = t >= 1 ? EUROPE_VIEW : currentView;
          const { x: wx, y: wy } = projectToScreen(
            WOLFSBURG[0], WOLFSBURG[1], projView, width, height
          );
          // Angled line from dot to label (kept tight)
          const lineEndX = wx + 20 * calloutAlpha;
          const lineEndY = wy - 14 * calloutAlpha;
          const labelX = lineEndX + 30 * calloutAlpha;
          const labelY = lineEndY;

          ctx.save();
          ctx.globalAlpha = calloutAlpha;
          // Line from the dot center — no extra circle, the deck.gl dot IS the anchor
          ctx.strokeStyle = colors.accent;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(wx - 3, wy + 6);
          ctx.lineTo(lineEndX, lineEndY);
          ctx.lineTo(labelX, labelY);
          ctx.stroke();
          // Label text
          ctx.font = '600 14px "JetBrains Mono"';
          ctx.fillStyle = colors.accent;
          ctx.textAlign = 'left';
          ctx.textBaseline = 'bottom';
          ctx.fillText('VW FACTORY', labelX + 7, labelY - 2);
          ctx.font = '500 11px "JetBrains Mono"';
          ctx.fillStyle = colors.textDim;
          ctx.fillText('WOLFSBURG', labelX + 7, labelY + 13);
          ctx.restore();
        }
      }
      if (step >= 2) {
        const t3 = step === 2 ? Math.min(elapsed / ZOOM_DURATION, 1) : 1;
        const eased = t3 * t3 * t3;
        const displayCount = Math.floor(60000 + eased * (2300000 - 60000));
        let label = "World's Largest Factory";
        let labelColor = colors.accent;
        if (eased > 0.08) label = null;
        if (eased > 0.85) { label = 'European Power Grid'; labelColor = colors.primary; }
        drawCounterHUD(ctx, displayCount, label, labelColor, 1, width);
      }

      // ════════════════════════════════════════════
      // PHASE 3: Big "0" ZERO DOWNTIME over the EU map
      // ════════════════════════════════════════════
      if (step === 3) {
        const cx = width / 2, cy = height * 0.42;
        const [cr, cg, cb] = hexToRgb(colors.danger);

        const bracketT = Math.min(1, elapsed / 0.3);
        const bracketE = 1 - Math.pow(1 - bracketT, 3);
        const tightenT = elapsed > 0.9 ? Math.min(1, (elapsed - 0.9) / 0.3) : 0;
        const bracketBase = 140 - tightenT * 10;
        const bracketOff = bracketBase + (1 - bracketE) * 200;
        const bLen = 24;

        ctx.save(); ctx.globalAlpha = bracketE; ctx.strokeStyle = colors.danger; ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(cx - bracketOff, cy - bracketOff + bLen); ctx.lineTo(cx - bracketOff, cy - bracketOff); ctx.lineTo(cx - bracketOff + bLen, cy - bracketOff); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + bracketOff - bLen, cy - bracketOff); ctx.lineTo(cx + bracketOff, cy - bracketOff); ctx.lineTo(cx + bracketOff, cy - bracketOff + bLen); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx - bracketOff, cy + bracketOff - bLen); ctx.lineTo(cx - bracketOff, cy + bracketOff); ctx.lineTo(cx - bracketOff + bLen, cy + bracketOff); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + bracketOff - bLen, cy + bracketOff); ctx.lineTo(cx + bracketOff, cy + bracketOff); ctx.lineTo(cx + bracketOff, cy + bracketOff - bLen); ctx.stroke();
        ctx.restore();

        if (bracketT > 0.3) {
          ctx.save(); ctx.globalAlpha = Math.min(1, (bracketT - 0.3) / 0.5) * 0.1;
          ctx.strokeStyle = colors.danger; ctx.lineWidth = 0.5; ctx.setLineDash([4, 8]);
          ctx.beginPath(); ctx.moveTo(cx - 300, cy); ctx.lineTo(cx + 300, cy); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(cx, cy - 200); ctx.lineTo(cx, cy + 200); ctx.stroke();
          ctx.setLineDash([]); ctx.restore();
        }

        const casStart = 0.25, casEnd = 0.85;
        if (elapsed >= casStart && elapsed < casEnd) {
          const casT = (elapsed - casStart) / (casEnd - casStart);
          const digit = Math.max(0, 9 - Math.floor(casT * 10));
          const dSize = 100 + casT * 50, aberr = 2 + casT * 6;
          ctx.save(); ctx.font = `900 ${dSize}px "JetBrains Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.globalAlpha = 0.25 + casT * 0.15; ctx.fillStyle = 'rgba(255, 60, 60, 0.7)'; ctx.fillText(String(digit), cx - aberr, cy); ctx.restore();
          ctx.save(); ctx.font = `900 ${dSize}px "JetBrains Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.globalAlpha = 0.25 + casT * 0.15; ctx.fillStyle = 'rgba(60, 60, 255, 0.7)'; ctx.fillText(String(digit), cx + aberr, cy); ctx.restore();
          ctx.save(); ctx.font = `900 ${dSize}px "JetBrains Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.4 + casT * 0.3})`; ctx.shadowBlur = 15; ctx.shadowColor = colors.danger;
          ctx.fillText(String(digit), cx, cy); ctx.shadowBlur = 0; ctx.restore();
          const glitchPhase = (casT * 10) % 1;
          if (glitchPhase < 0.2) {
            ctx.save(); ctx.globalAlpha = 0.15; ctx.fillStyle = colors.danger;
            ctx.fillRect(cx - 100, cy - 25 + Math.sin(now * 0.3 + digit * 7) * 25, 200, 1.5);
            ctx.fillRect(cx - 70, cy - 15 + Math.sin(now * 0.5 + digit * 3) * 20, 140, 1);
            ctx.restore();
          }
        }

        if (elapsed >= casEnd) {
          const impactT = Math.min(1, (elapsed - casEnd) / 0.4);
          const impactE = easeOutBack(impactT);
          const zeroSize = 180 * impactE;
          const zeroPulse = elapsed > 1.5 ? 1 + Math.sin(now / 400) * 0.02 : 1;
          if (impactT < 0.8) {
            const ringT = impactT / 0.8;
            ctx.save(); ctx.globalAlpha = (1 - ringT) * 0.3; ctx.strokeStyle = colors.danger; ctx.lineWidth = 2 * (1 - ringT);
            ctx.beginPath(); ctx.arc(cx, cy, zeroSize * 0.4 + ringT * 160, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
          }
          for (let ring = 3; ring >= 1; ring--) {
            const rPulse = 1 + Math.sin(now / 1000 + ring) * 0.02;
            ctx.beginPath(); ctx.arc(cx, cy, zeroSize * 0.5 * rPulse + ring * 25, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${0.04 * ring * impactE})`; ctx.lineWidth = 1; ctx.stroke();
          }
          ctx.save(); ctx.font = `900 ${zeroSize * zeroPulse}px "JetBrains Mono"`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillStyle = colors.danger;
          ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 3;
          ctx.shadowBlur = 10; ctx.shadowColor = '#000000';
          ctx.fillText('0', cx, cy);
          ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
          ctx.restore();
        }

        if (elapsed >= 0.85 && elapsed < 1.05) {
          const flashT = (elapsed - 0.85) / 0.2;
          ctx.save(); ctx.globalAlpha = (1 - flashT) * 0.12; ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height); ctx.restore();
        }

        if (elapsed > 1.3) {
          const textT = Math.min(1, (elapsed - 1.3) / 0.5);
          const textE = 1 - Math.pow(1 - textT, 3);
          ctx.save(); ctx.globalAlpha = textE;
          ctx.font = '700 28px "JetBrains Mono"'; ctx.textAlign = 'center';
          ctx.fillStyle = colors.danger;
          ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 40; ctx.shadowColor = '#000000';
          // Draw twice to stack the shadow for a heavier dark backdrop
          ctx.fillText('ZERO DOWNTIME', cx, cy + 100);
          ctx.fillText('ZERO DOWNTIME', cx, cy + 100);
          ctx.font = '500 18px "Inter"'; ctx.fillStyle = colors.text;
          ctx.fillText('This machine has never been shut down.', cx, cy + 175);
          ctx.fillText('This machine has never been shut down.', cx, cy + 175);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      // ── Horizontal scan line — only after zoom completes ──
      // Scan line + dot glow are handled entirely in deck.gl layers (useMemo above)

      // ── CRT vignette ──
      ctx.save();
      const vig = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.3,
        width / 2, height / 2, Math.max(width, height) * 0.75
      );
      vig.addColorStop(0, 'rgba(0,0,0,0)');
      vig.addColorStop(1, 'rgba(0,0,0,0.45)');
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive, currentStepValue]);

  return (
    <>
      {placeholder}
      {/* deck.gl map — fades in for Phase 2+ */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        opacity: currentStepValue >= 2 ? 1 : 0,
        transition: 'opacity 0.3s ease-in',
      }}>
        <DeckGL
          viewState={viewState}
          controller={false}
          layers={layers}
          style={{ position: 'absolute', inset: 0 }}
        >
          <Map ref={mapRef} onLoad={onMapLoad} mapStyle={DARK_MAP} style={{ width: '100%', height: '100%' }} />
        </DeckGL>
      </div>
      {/* Canvas overlay for Phase 0, 1, 3 and HUD */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          zIndex: 2, pointerEvents: 'none',
        }}
      />
    </>
  );
}
