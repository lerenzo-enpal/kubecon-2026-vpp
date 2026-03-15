import React, { useEffect, useRef, useState, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

function toXY(lat, lon, mapX, mapY, mapW, mapH) {
  const lonMin = -104.0, lonMax = -93.5;
  const latMin = 25.8, latMax = 36.5;
  const centerLat = (latMin + latMax) / 2;
  const lonScale = Math.cos(centerLat * Math.PI / 180);
  const geoW = (lonMax - lonMin) * lonScale;
  const geoH = latMax - latMin;
  const geoAspect = geoW / geoH;
  const canvasAspect = mapW / mapH;

  let drawW, drawH, offsetX, offsetY;
  if (canvasAspect > geoAspect) {
    // Canvas wider than geo — fit to height, push RIGHT (flush right edge)
    drawH = mapH; drawW = drawH * geoAspect;
    offsetX = mapX + mapW - drawW; // right-align
    offsetY = mapY;
  } else {
    // Canvas taller — fit to width, center vertically
    drawW = mapW; drawH = drawW / geoAspect;
    offsetX = mapX;
    offsetY = mapY + (mapH - drawH) / 2;
  }
  return {
    x: offsetX + ((lon - lonMin) / (lonMax - lonMin)) * drawW,
    y: offsetY + ((latMax - lat) / (latMax - latMin)) * drawH,
  };
}

const RAW_NODES = [
  { id: 'amarillo', lat: 35.22, lon: -101.83, type: 'wind', label: 'Amarillo', cap: 4.0 },
  { id: 'lubbock', lat: 33.58, lon: -101.85, type: 'wind', label: 'Lubbock', cap: 3.2 },
  { id: 'roscoe', lat: 32.45, lon: -100.5, type: 'wind', label: 'Roscoe', cap: 2.5 },
  { id: 'midland', lat: 31.99, lon: -102.08, type: 'gas', label: 'Midland', cap: 2.1 },
  { id: 'abilene', lat: 32.45, lon: -99.73, type: 'gas', label: 'Abilene', cap: 1.8 },
  { id: 'dfw', lat: 32.78, lon: -96.80, type: 'gas', label: 'Dallas/FW', cap: 6.5 },
  { id: 'midlothian', lat: 32.48, lon: -96.99, type: 'gas', label: 'Midlothian', cap: 1.6 },
  { id: 'forney', lat: 32.75, lon: -96.47, type: 'gas', label: 'Forney', cap: 1.9 },
  { id: 'comanche', lat: 32.30, lon: -97.79, type: 'nuclear', label: 'Comanche Pk', cap: 2.3 },
  { id: 'martin', lat: 32.26, lon: -94.57, type: 'coal', label: 'Martin Lake', cap: 2.3 },
  { id: 'waco', lat: 31.55, lon: -97.15, type: 'gas', label: 'Waco', cap: 1.5 },
  { id: 'limestone', lat: 31.43, lon: -96.54, type: 'coal', label: 'Limestone', cap: 1.9 },
  { id: 'oakgrove', lat: 31.05, lon: -96.50, type: 'coal', label: 'Oak Grove', cap: 1.8 },
  { id: 'austin', lat: 30.27, lon: -97.74, type: 'gas', label: 'Austin', cap: 2.8 },
  { id: 'sanantonio', lat: 29.42, lon: -98.49, type: 'gas', label: 'San Antonio', cap: 3.5 },
  { id: 'houston', lat: 29.76, lon: -95.37, type: 'gas', label: 'Houston', cap: 8.0 },
  { id: 'parish', lat: 29.48, lon: -95.63, type: 'coal', label: 'W.A. Parish', cap: 3.7 },
  { id: 'cedarbayou', lat: 29.77, lon: -94.97, type: 'gas', label: 'Cedar Bayou', cap: 1.5 },
  { id: 'stp', lat: 28.80, lon: -96.05, type: 'nuclear', label: 'STP Nuclear', cap: 2.7 },
  { id: 'corpus', lat: 27.80, lon: -97.40, type: 'gas', label: 'Corpus Christi', cap: 1.8 },
];

const LINES = [
  ['amarillo', 'lubbock'], ['lubbock', 'roscoe'], ['roscoe', 'abilene'],
  ['abilene', 'dfw'], ['abilene', 'waco'],
  ['midland', 'abilene'], ['midland', 'sanantonio'],
  ['dfw', 'midlothian'], ['dfw', 'forney'], ['dfw', 'comanche'],
  ['comanche', 'waco'], ['dfw', 'martin'],
  ['waco', 'austin'], ['waco', 'limestone'], ['limestone', 'oakgrove'],
  ['austin', 'sanantonio'], ['oakgrove', 'austin'],
  ['houston', 'parish'], ['houston', 'cedarbayou'], ['houston', 'austin'],
  ['houston', 'stp'],
  ['sanantonio', 'corpus'], ['stp', 'corpus'],
  ['martin', 'forney'],
];

const typeColors = { wind: '#60a5fa', gas: '#fb923c', coal: '#94a3b8', nuclear: '#a78bfa' };

const TX_OUTLINE = [
  [36.5, -103], [36.5, -100], [34.5, -100], [34.0, -94.5], [33.6, -94.1],
  [31.0, -94.0], [29.7, -93.8], [29.3, -94.7], [28.9, -95.3], [28.5, -96.0],
  [27.5, -97.2], [26.0, -97.2], [25.9, -97.5], [26.4, -99.1], [27.8, -100.3],
  [29.5, -101.0], [31.0, -103.5], [32.0, -103.1], [32.0, -103.0], [36.5, -103],
];

const CASCADE_STEPS = [
  { time: 0, nodes: ['amarillo', 'lubbock', 'roscoe'], ts: 'Feb 14 AM', label: 'Wind turbines ice up — Panhandle', mw: '16,000 MW wind offline' },
  { time: 3, nodes: ['midland'], ts: 'Feb 14 PM', label: 'Gas wells freeze — Permian Basin', mw: 'Gas supply drops 50%' },
  { time: 5, nodes: ['abilene'], ts: 'Feb 14 EVE', label: 'Gas plants lose fuel supply', mw: 'Cascading gas shortage' },
  { time: 6, nodes: ['midlothian', 'forney'], ts: 'Feb 14 11PM', label: 'DFW gas plants trip offline', mw: 'Midlothian at 30%' },
  { time: 7, nodes: ['martin', 'limestone'], ts: 'Feb 15 1AM', label: 'East TX coal & lignite fail', mw: 'Frozen coal piles' },
  { time: 8, nodes: ['oakgrove', 'parish'], ts: 'Feb 15 2AM', label: 'Central + Houston tripping', mw: '35,000 MW offline' },
  { time: 9, nodes: ['cedarbayou', 'waco'], ts: 'Feb 15 3AM', label: 'Cascade spreads statewide', mw: 'Load shedding begins' },
  { time: 10, nodes: ['stp'], ts: 'Feb 15 5:37AM', label: 'STP Nuclear Unit 1 trips', mw: 'Frozen sensor line' },
  { time: 11, nodes: ['corpus', 'sanantonio', 'austin'], ts: 'Feb 15-18', label: '4.5 million homes go dark', mw: '52,277 MW offline' },
  { time: 13, nodes: ['houston', 'dfw'], ts: 'Feb 15-19', label: 'Grid emergency — 70+ hours', mw: '48.6% capacity gone' },
];

const FINAL_STEP = { ts: '1:55 AM', label: 'TOTAL GRID COLLAPSE', sub: 'Avoided by 4 min 37 sec. Cold restart = weeks.' };

export default function TexasCascade({ width = 960, height = 560 }) {
  const canvasRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const animRef = useRef(null);
  const [phase, setPhase] = useState('stable');
  const phaseRef = useRef('stable');
  const startTimeRef = useRef(null);
  const failedRef = useRef(new Set());
  const freqRef = useRef(50.0);
  const activeStepRef = useRef(-1);

  const slideContext = useContext(SlideContext);
  useEffect(() => {
    if (slideContext?.isSlideActive) {
      phaseRef.current = 'stable';
      setPhase('stable');
      startTimeRef.current = null;
      failedRef.current = new Set();
      freqRef.current = 50.0;
      activeStepRef.current = -1;
    }
  }, [slideContext?.isSlideActive]);

  const reset = () => {
    phaseRef.current = 'stable'; setPhase('stable');
    startTimeRef.current = null; failedRef.current = new Set();
    freqRef.current = 50.0; activeStepRef.current = -1;
  };

  const trigger = () => {
    phaseRef.current = 'cascade'; setPhase('cascade');
    startTimeRef.current = performance.now(); failedRef.current = new Set();
    activeStepRef.current = -1;
  };

  // Map: right-aligned, full height, flush to right edge of canvas
  const mapW = Math.floor(width * 0.56);
  const mapH = height;
  const mapLeft = width - mapW;
  const timelineRight = mapLeft - 14;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const mapX = mapLeft;
    const mapY = 0;

    const nodes = RAW_NODES.map(n => ({ ...n, ...toXY(n.lat, n.lon, mapX, mapY, mapW, mapH) }));
    const getNode = (id) => nodes.find(n => n.id === id);

    const draw = () => {
      const now = performance.now();
      const elapsed = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, width, height);

      // ── Process cascade ──
      if (phaseRef.current === 'cascade') {
        let maxStep = -1;
        CASCADE_STEPS.forEach((step, i) => {
          if (elapsed > step.time) {
            step.nodes.forEach(n => failedRef.current.add(n));
            maxStep = i;
          }
        });
        activeStepRef.current = maxStep;
        const failCount = failedRef.current.size;
        freqRef.current = 50.0 - failCount * 0.35 - Math.max(0, elapsed - 2) * 0.06;
        freqRef.current = Math.max(47.5, freqRef.current);
        failedRef.current.delete('comanche');
      }
      const freq = freqRef.current + Math.sin(now / 300) * 0.01;

      // ══════════════════════════════════
      // LEFT SIDE — TIMELINE (text right-aligned to map edge)
      // ══════════════════════════════════

      const tlRightEdge = timelineRight;
      const tlTop = 10;
      const totalSteps = CASCADE_STEPS.length + 1; // +1 for final
      const availH = height - tlTop - 54;
      const stepH = availH / totalSteps;

      // Frequency readout at top left
      const freqColor = freq < 49.0 ? colors.danger : freq < 49.5 ? '#f59e0b' : '#22d3ee';
      ctx.fillStyle = freqColor;
      ctx.font = 'bold 24px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 12;
      ctx.shadowColor = freqColor;
      ctx.fillText(`${freq.toFixed(3)} Hz`, 8, 28);
      ctx.shadowBlur = 0;

      // MW counter below freq
      if (phaseRef.current === 'cascade') {
        const mwOffline = Math.min(52277, Math.floor(failedRef.current.size / RAW_NODES.length * 52277));
        ctx.fillStyle = colors.danger;
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText(`${mwOffline.toLocaleString()} MW offline`, 8, 44);
      } else {
        ctx.fillStyle = '#64748b80';
        ctx.font = '11px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('ERCOT — Normal', 8, 44);
      }

      // Timeline steps
      CASCADE_STEPS.forEach((step, i) => {
        const y = tlTop + 56 + i * stepH;
        const isActive = phaseRef.current === 'cascade' && elapsed > step.time;
        const isCurrent = activeStepRef.current === i;

        // Dot (right-aligned near the map)
        const dotX = tlRightEdge + 2;
        ctx.beginPath();
        ctx.arc(dotX, y + 6, isCurrent ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? colors.danger : '#64748b25';
        if (isCurrent) { ctx.shadowBlur = 6; ctx.shadowColor = colors.danger; }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connecting line between dots
        if (i > 0) {
          ctx.strokeStyle = isActive ? colors.danger + '30' : '#64748b12';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(dotX, y + 6 - stepH + (i === 1 ? 0 : 4));
          ctx.lineTo(dotX, y + 6 - 4);
          ctx.stroke();
        }

        // Text — right-aligned to just left of the dot
        const textRight = dotX - 10;

        // Timestamp
        ctx.fillStyle = isActive ? (isCurrent ? colors.danger : colors.danger + 'aa') : '#64748b30';
        ctx.font = `bold 9px JetBrains Mono`;
        ctx.textAlign = 'right';
        ctx.fillText(step.ts, textRight, y + 2);

        // Label
        ctx.fillStyle = isActive ? (isCurrent ? '#f1f5f9' : '#f1f5f9bb') : '#64748b25';
        ctx.font = `${isCurrent ? 'bold ' : ''}10px Inter`;
        ctx.fillText(step.label, textRight, y + 14);

        // MW
        ctx.fillStyle = isActive ? (isCurrent ? '#94a3b8cc' : '#94a3b870') : '#64748b18';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(step.mw, textRight, y + 24);
      });

      // ── FINAL STEP (the one that didn't happen) ──
      const finalIdx = CASCADE_STEPS.length;
      const finalY = tlTop + 56 + finalIdx * stepH;
      const showFinal = phaseRef.current === 'cascade' && elapsed > 14;
      const dotX = tlRightEdge + 2;

      // Connecting dashed line
      if (phaseRef.current === 'cascade' && activeStepRef.current >= CASCADE_STEPS.length - 1) {
        ctx.strokeStyle = colors.danger + '20';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(dotX, finalY + 6 - stepH + 4);
        ctx.lineTo(dotX, finalY + 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // X dot
      ctx.beginPath();
      ctx.arc(dotX, finalY + 6, 3, 0, Math.PI * 2);
      ctx.fillStyle = showFinal ? colors.danger + '50' : '#64748b18';
      ctx.fill();
      if (showFinal) {
        ctx.strokeStyle = colors.danger;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dotX - 3, finalY + 3); ctx.lineTo(dotX + 3, finalY + 9);
        ctx.moveTo(dotX + 3, finalY + 3); ctx.lineTo(dotX - 3, finalY + 9);
        ctx.stroke();
      }

      const textRight = dotX - 10;
      const flashAlpha = showFinal ? (Math.sin(now / 200) * 0.3 + 0.7) : 0.15;

      ctx.fillStyle = showFinal ? `rgba(239,68,68,${flashAlpha})` : '#64748b25';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText(FINAL_STEP.ts, textRight, finalY + 2);

      ctx.font = 'bold 10px Inter';
      ctx.fillText(FINAL_STEP.label, textRight, finalY + 14);

      ctx.fillStyle = showFinal ? `rgba(239,68,68,${flashAlpha * 0.7})` : '#64748b18';
      ctx.font = '8px Inter';
      ctx.fillText(FINAL_STEP.sub, textRight, finalY + 25);

      // ══════════════════════════════════
      // RIGHT SIDE — MAP (inside bordered box)
      // ══════════════════════════════════

      // Danger overlay on map area
      if (phaseRef.current === 'cascade' && elapsed > 4) {
        const intensity = Math.min(0.05, (elapsed - 4) * 0.005);
        const pulse = Math.sin(now / 500) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(239, 68, 68, ${intensity * pulse})`;
        ctx.fillRect(mapX, mapY, mapW, mapH);
      }

      // Texas outline
      ctx.strokeStyle = '#22d3ee25';
      ctx.lineWidth = 1;
      ctx.fillStyle = '#22d3ee03';
      ctx.beginPath();
      TX_OUTLINE.forEach((pt, i) => {
        const p = toXY(pt[0], pt[1], mapX, mapY, mapW, mapH);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Transmission lines
      LINES.forEach(([a, b]) => {
        const nA = getNode(a), nB = getNode(b);
        if (!nA || !nB) return;
        const aF = failedRef.current.has(a), bF = failedRef.current.has(b);
        ctx.beginPath();
        ctx.moveTo(nA.x, nA.y);
        ctx.lineTo(nB.x, nB.y);
        if (aF && bF) { ctx.strokeStyle = '#ef444412'; ctx.lineWidth = 0.8; }
        else if (aF || bF) { ctx.strokeStyle = `rgba(239,68,68,${0.25 * (Math.sin(now / 200) * 0.3 + 0.7)})`; ctx.lineWidth = 1.2; }
        else { ctx.strokeStyle = '#22d3ee2a'; ctx.lineWidth = 1.2; }
        ctx.stroke();

        if (!aF && !bF) {
          const seed = a.charCodeAt(0) + b.charCodeAt(0);
          const ft = ((now / 1800) + seed * 0.1) % 1;
          ctx.beginPath();
          ctx.arc(nA.x + (nB.x - nA.x) * ft, nA.y + (nB.y - nA.y) * ft, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#22d3ee45';
          ctx.fill();
        }
      });

      // Nodes
      nodes.forEach(node => {
        const failed = failedRef.current.has(node.id);
        const isComanche = node.id === 'comanche';
        const cascading = phaseRef.current === 'cascade';
        const r = cascading && isComanche ? 8 : 6;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 5, 0, Math.PI * 2);
        if (failed) { ctx.fillStyle = `rgba(239,68,68,${0.04 * (Math.sin(now / 300) * 0.5 + 0.5)})`; }
        else { ctx.fillStyle = (isComanche && cascading ? '#10b981' : typeColors[node.type]) + '0d'; }
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        if (failed) {
          ctx.fillStyle = '#ef444420'; ctx.fill();
          ctx.strokeStyle = '#ef444460'; ctx.lineWidth = 1.5; ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(node.x - 3, node.y - 3); ctx.lineTo(node.x + 3, node.y + 3);
          ctx.moveTo(node.x + 3, node.y - 3); ctx.lineTo(node.x - 3, node.y + 3);
          ctx.strokeStyle = colors.danger; ctx.lineWidth = 1.5; ctx.stroke();
        } else {
          const c = isComanche && cascading ? '#10b981' : typeColors[node.type];
          ctx.fillStyle = c + '30'; ctx.fill();
          ctx.strokeStyle = c + 'aa'; ctx.lineWidth = 1.2; ctx.stroke();
        }

        ctx.fillStyle = failed ? '#ef444450' : '#f1f5f9aa';
        ctx.font = '8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + r + 10);
      });

      // Comanche callout
      if (phaseRef.current === 'cascade' && elapsed > 6) {
        const cp = getNode('comanche');
        ctx.fillStyle = `rgba(16,185,129,${Math.sin(now / 400) * 0.3 + 0.7})`;
        ctx.font = 'bold 8px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('100%', cp.x + 11, cp.y + 3);
      }

      // Map legend
      ctx.font = '7px Inter';
      ctx.textAlign = 'left';
      [
        { c: '#60a5fa', l: 'Wind' }, { c: '#fb923c', l: 'Gas' },
        { c: '#94a3b8', l: 'Coal' }, { c: '#a78bfa', l: 'Nuclear' },
      ].forEach((item, i) => {
        const lx = mapX + 4 + i * 56;
        const ly = height - 8;
        ctx.beginPath(); ctx.arc(lx, ly, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = item.c; ctx.fill();
        ctx.fillStyle = '#94a3b8'; ctx.fillText(item.l, lx + 5, ly + 3);
      });

      // ERCOT label
      ctx.fillStyle = '#64748b28';
      ctx.font = '7px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText('ERCOT — ISOLATED', width - 8, height - 4);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, mapLeft, mapW, timelineRight]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width, height, borderRadius: 8 }}
      />
      <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 6, zIndex: 2 }}>
        <button onClick={reset} style={{
          background: '#1a2236dd', border: '1px solid #243049',
          color: '#94a3b8', padding: '5px 12px', borderRadius: 6,
          cursor: 'pointer', fontSize: 11, fontFamily: '"JetBrains Mono"',
        }}>Reset</button>
        <button onClick={trigger} style={{
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
          color: '#ef4444', padding: '5px 12px', borderRadius: 6,
          cursor: 'pointer', fontSize: 11, fontFamily: '"JetBrains Mono"', fontWeight: 600,
        }}>Winter Storm Uri</button>
      </div>
    </div>
  );
}
