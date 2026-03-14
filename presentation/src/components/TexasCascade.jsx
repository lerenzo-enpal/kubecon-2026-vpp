import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../theme';

// Map lat/lon to canvas coordinates with Mercator-like correction for Texas latitudes
function toXY(lat, lon, w, h, pad) {
  // Texas bounds (ERCOT footprint, excluding El Paso)
  const lonMin = -104.0, lonMax = -93.5;
  const latMin = 25.8, latMax = 36.5;

  // Apply cos(latitude) correction for longitude to fix east-west distortion
  // At Texas's center latitude (~31°), cos(31°) ≈ 0.857
  const centerLat = (latMin + latMax) / 2;
  const lonScale = Math.cos(centerLat * Math.PI / 180);

  const normLon = (lon - lonMin) / (lonMax - lonMin);
  const normLat = (latMax - lat) / (latMax - latMin);

  // Compute aspect ratio of geographic area
  const geoW = (lonMax - lonMin) * lonScale;
  const geoH = (latMax - latMin);
  const geoAspect = geoW / geoH;

  const availW = w - pad.left - pad.right;
  const availH = h - pad.top - pad.bottom;
  const canvasAspect = availW / availH;

  let drawW, drawH, offsetX, offsetY;
  if (canvasAspect > geoAspect) {
    // Canvas is wider than geo — fit to height, center horizontally
    drawH = availH;
    drawW = drawH * geoAspect;
    offsetX = pad.left + (availW - drawW) / 2;
    offsetY = pad.top;
  } else {
    // Canvas is taller — fit to width, center vertically
    drawW = availW;
    drawH = drawW / geoAspect;
    offsetX = pad.left;
    offsetY = pad.top + (availH - drawH) / 2;
  }

  const x = offsetX + normLon * drawW;
  const y = offsetY + normLat * drawH;
  return { x, y };
}

const RAW_NODES = [
  { id: 'amarillo', lat: 35.22, lon: -101.83, type: 'wind', label: 'Amarillo', cap: 4.0 },
  { id: 'lubbock', lat: 33.58, lon: -101.85, type: 'wind', label: 'Lubbock', cap: 3.2 },
  { id: 'roscoe', lat: 32.45, lon: -100.5, type: 'wind', label: 'Roscoe Wind', cap: 2.5 },
  { id: 'midland', lat: 31.99, lon: -102.08, type: 'gas', label: 'Midland/Odessa', cap: 2.1 },
  { id: 'abilene', lat: 32.45, lon: -99.73, type: 'gas', label: 'Abilene', cap: 1.8 },
  { id: 'dfw', lat: 32.78, lon: -96.80, type: 'gas', label: 'Dallas/FW', cap: 6.5 },
  { id: 'midlothian', lat: 32.48, lon: -96.99, type: 'gas', label: 'Midlothian', cap: 1.6 },
  { id: 'forney', lat: 32.75, lon: -96.47, type: 'gas', label: 'Forney', cap: 1.9 },
  { id: 'comanche', lat: 32.30, lon: -97.79, type: 'nuclear', label: 'Comanche Peak', cap: 2.3 },
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

const typeColors = { wind: '#60a5fa', solar: colors.solar, gas: '#fb923c', coal: '#94a3b8', nuclear: colors.secondary };

// Texas outline points (lat/lon)
const TX_OUTLINE = [
  [36.5, -103], [36.5, -100], [34.5, -100], [34.0, -94.5], [33.6, -94.1],
  [31.0, -94.0], [29.7, -93.8], [29.3, -94.7], [28.9, -95.3], [28.5, -96.0],
  [27.5, -97.2], [26.0, -97.2], [25.9, -97.5], [26.4, -99.1], [27.8, -100.3],
  [29.5, -101.0], [31.0, -103.5], [32.0, -103.1], [32.0, -103.0], [36.5, -103],
];

const CASCADE_PHASES = [
  { time: 0, nodes: ['amarillo', 'lubbock', 'roscoe'], label: 'WIND TURBINES ICING — PANHANDLE / WEST TX' },
  { time: 3, nodes: ['midland'], label: 'PERMIAN BASIN GAS WELLS FREEZING' },
  { time: 5, nodes: ['abilene'], label: 'GAS PLANTS LOSING FUEL SUPPLY' },
  { time: 6, nodes: ['midlothian', 'forney'], label: 'DFW GAS PLANTS OFFLINE — 30% CAPACITY' },
  { time: 7, nodes: ['martin', 'limestone'], label: 'EAST TX COAL / LIGNITE FAILING' },
  { time: 8, nodes: ['oakgrove', 'parish'], label: 'CENTRAL + HOUSTON PLANTS TRIPPING' },
  { time: 9, nodes: ['cedarbayou', 'waco'], label: 'CASCADE SPREADING STATEWIDE' },
  { time: 10, nodes: ['stp'], label: 'STP UNIT 1 TRIPS — FROZEN SENSOR LINE' },
  { time: 11, nodes: ['corpus', 'sanantonio', 'austin'], label: 'LOAD SHEDDING — 4.5 MILLION HOMES DARK' },
  { time: 13, nodes: ['houston', 'dfw'], label: 'GRID EMERGENCY — 52,277 MW OFFLINE' },
];

export default function TexasCascade({ width = 960, height = 580 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [phase, setPhase] = useState('stable');
  const phaseRef = useRef('stable');
  const startTimeRef = useRef(null);
  const failedRef = useRef(new Set());
  const warningRef = useRef('');
  const freqRef = useRef(60.0);

  const reset = () => {
    phaseRef.current = 'stable';
    setPhase('stable');
    startTimeRef.current = null;
    failedRef.current = new Set();
    warningRef.current = '';
    freqRef.current = 60.0;
  };

  const trigger = () => {
    phaseRef.current = 'cascade';
    setPhase('cascade');
    startTimeRef.current = performance.now();
    failedRef.current = new Set();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const pad = { top: 56, bottom: 30, left: 6, right: 6 };

    // Pre-compute node positions for this size
    const nodes = RAW_NODES.map(n => ({
      ...n,
      ...toXY(n.lat, n.lon, width, height, pad),
    }));

    const getNode = (id) => nodes.find(n => n.id === id);

    const draw = () => {
      const now = performance.now();
      const elapsed = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, width, height);

      // ── Texas outline (thicker, more visible) ──
      ctx.strokeStyle = colors.primary + '30';
      ctx.lineWidth = 1;
      ctx.fillStyle = colors.primary + '04';
      ctx.beginPath();
      TX_OUTLINE.forEach((pt, i) => {
        const { x, y } = toXY(pt[0], pt[1], width, height, pad);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // "TEXAS" watermark
      ctx.fillStyle = colors.textDim + '12';
      ctx.font = `bold ${Math.floor(width * 0.08)}px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText('TEXAS', width * 0.38, height * 0.55);

      // ── ERCOT ISOLATED label ──
      ctx.fillStyle = colors.textDim + '30';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('ERCOT INTERCONNECTION — ISOLATED FROM US GRID', pad.left, height - 12);
      ctx.textAlign = 'right';
      ctx.fillText('DC TIES: 1,256 MW (< 2% of capacity)', width - pad.right, height - 12);

      // ── Process cascade ──
      if (phaseRef.current === 'cascade') {
        CASCADE_PHASES.forEach(p => {
          if (elapsed > p.time) {
            p.nodes.forEach(n => failedRef.current.add(n));
            warningRef.current = p.label;
          }
        });
        const failCount = failedRef.current.size;
        freqRef.current = 60.0 - failCount * 0.35 - Math.max(0, elapsed - 2) * 0.06;
        freqRef.current = Math.max(57.5, freqRef.current);
        failedRef.current.delete('comanche');
      }

      const freq = freqRef.current + Math.sin(now / 300) * 0.01;

      // ── Danger zone overlay ──
      if (phaseRef.current === 'cascade' && elapsed > 4) {
        const intensity = Math.min(0.08, (elapsed - 4) * 0.008);
        const pulse = Math.sin(now / 500) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(239, 68, 68, ${intensity * pulse})`;
        ctx.fillRect(0, 0, width, height);
      }

      // ── Transmission lines ──
      LINES.forEach(([a, b]) => {
        const nodeA = getNode(a);
        const nodeB = getNode(b);
        if (!nodeA || !nodeB) return;
        const aF = failedRef.current.has(a);
        const bF = failedRef.current.has(b);

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);

        if (aF && bF) {
          ctx.strokeStyle = colors.danger + '15';
          ctx.lineWidth = 1;
        } else if (aF || bF) {
          const pulse = Math.sin(now / 200) * 0.3 + 0.7;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 * pulse})`;
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = colors.primary + '35';
          ctx.lineWidth = 1.5;
        }
        ctx.stroke();

        // Flow dots
        if (!aF && !bF) {
          const seed = a.charCodeAt(0) + b.charCodeAt(0);
          const flowT = ((now / 1800) + seed * 0.1) % 1;
          const dx = nodeA.x + (nodeB.x - nodeA.x) * flowT;
          const dy = nodeA.y + (nodeB.y - nodeA.y) * flowT;
          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, Math.PI * 2);
          ctx.fillStyle = colors.primary + '50';
          ctx.fill();
        }
      });

      // ── Nodes ──
      nodes.forEach(node => {
        const failed = failedRef.current.has(node.id);
        const isComanche = node.id === 'comanche';
        const isCascading = phaseRef.current === 'cascade';
        const nodeR = isCascading && isComanche ? 11 : 9;
        const glowR = nodeR + 8;

        // Glow
        if (!failed) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = (isComanche && isCascading ? colors.success : typeColors[node.type]) + '15';
          ctx.fill();
        } else {
          // Failed pulse glow
          const pulse = Math.sin(now / 300) * 0.5 + 0.5;
          ctx.beginPath();
          ctx.arc(node.x, node.y, glowR, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(239, 68, 68, ${0.06 * pulse})`;
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeR, 0, Math.PI * 2);

        if (failed) {
          ctx.fillStyle = colors.danger + '25';
          ctx.fill();
          ctx.strokeStyle = colors.danger + '70';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // X
          ctx.beginPath();
          ctx.moveTo(node.x - 5, node.y - 5);
          ctx.lineTo(node.x + 5, node.y + 5);
          ctx.moveTo(node.x + 5, node.y - 5);
          ctx.lineTo(node.x - 5, node.y + 5);
          ctx.strokeStyle = colors.danger;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          const c = isComanche && isCascading ? colors.success : typeColors[node.type];
          ctx.fillStyle = c + '35';
          ctx.fill();
          ctx.strokeStyle = c + 'cc';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = failed ? colors.danger + '60' : colors.text + 'bb';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + nodeR + 13);
        if (!failed) {
          ctx.fillStyle = colors.textDim + '90';
          ctx.font = '9px JetBrains Mono';
          ctx.fillText(`${node.cap} GW`, node.x, node.y + nodeR + 23);
        }
      });

      // ── Comanche Peak callout ──
      if (phaseRef.current === 'cascade' && elapsed > 6) {
        const cp = getNode('comanche');
        const pulse = Math.sin(now / 400) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(16, 185, 129, ${pulse * 0.9})`;
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('NUCLEAR — 100% ONLINE', cp.x + 16, cp.y - 2);
      }

      // ═══ HUD OVERLAY ═══

      // Top bar background
      ctx.fillStyle = '#050810dd';
      ctx.fillRect(0, 0, width, 54);

      // Frequency
      const freqColor = freq < 59.0 ? colors.danger : freq < 59.5 ? colors.accent : colors.primary;
      ctx.fillStyle = freqColor;
      ctx.font = 'bold 32px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 18;
      ctx.shadowColor = freqColor;
      ctx.fillText(`${freq.toFixed(3)} Hz`, 14, 38);
      ctx.shadowBlur = 0;

      // Status / Warning
      if (phaseRef.current === 'stable') {
        ctx.fillStyle = colors.primary + 'cc';
        ctx.font = '13px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText('ERCOT GRID — NORMAL OPERATIONS', width / 2, 24);
        ctx.fillStyle = colors.textDim + '80';
        ctx.font = '11px JetBrains Mono';
        ctx.fillText('February 14, 2021 — Press "Winter Storm Uri" to begin', width / 2, 42);
      } else {
        const flash = Math.sin(now / 180) > 0;
        ctx.fillStyle = flash ? colors.danger : colors.danger + '50';
        ctx.font = 'bold 13px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillText(warningRef.current, width / 2, 24);

        // Elapsed time
        ctx.fillStyle = colors.textMuted;
        ctx.font = '11px JetBrains Mono';
        const hrs = Math.floor(elapsed * 5); // compress timeline: 1 sec ≈ 5 hrs
        ctx.fillText(`Storm timeline: +${hrs} hours`, width / 2, 42);
      }

      // MW offline counter (top right)
      if (phaseRef.current === 'cascade') {
        const mwOffline = Math.min(52277, Math.floor(failedRef.current.size / RAW_NODES.length * 52277));
        ctx.fillStyle = colors.danger;
        ctx.font = 'bold 16px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(`${mwOffline.toLocaleString()} MW`, width - 14, 28);
        ctx.fillStyle = colors.textMuted;
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('of 107,000 MW offline', width - 14, 44);
      }

      // ── Bottom warning banner ──
      if (phaseRef.current === 'cascade' && elapsed > 12) {
        const flash = Math.sin(now / 130) > 0;
        ctx.fillStyle = flash ? colors.danger + '18' : colors.danger + '08';
        ctx.fillRect(0, height - 46, width, 46);

        if (flash) {
          ctx.fillStyle = colors.danger;
          ctx.font = `bold ${Math.min(18, width * 0.02)}px JetBrains Mono`;
          ctx.textAlign = 'center';
          ctx.shadowBlur = 12;
          ctx.shadowColor = colors.danger;
          ctx.fillText('\u26a0  4 MINUTES 37 SECONDS FROM TOTAL GRID COLLAPSE  \u26a0', width / 2, height - 18);
          ctx.shadowBlur = 0;
        }
      }

      // Legend (bottom left, above warning)
      const legendY = phaseRef.current === 'cascade' && elapsed > 12 ? height - 56 : height - 20;
      ctx.font = '9px Inter';
      ctx.textAlign = 'left';
      [
        { color: '#60a5fa', label: 'Wind' },
        { color: '#fb923c', label: 'Gas' },
        { color: '#94a3b8', label: 'Coal' },
        { color: colors.secondary, label: 'Nuclear' },
      ].forEach((item, i) => {
        const lx = 14 + i * 72;
        ctx.beginPath();
        ctx.arc(lx, legendY, 3, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(item.label, lx + 7, legendY + 3);
      });

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas
        ref={canvasRef}
        style={{ width, height, borderRadius: 8, border: `1px solid ${colors.surfaceLight}` }}
      />
      <div style={{ position: 'absolute', bottom: 16, right: 16, display: 'flex', gap: 6, zIndex: 2 }}>
        <button onClick={reset} style={{
          background: colors.surface + 'dd', border: `1px solid ${colors.surfaceLight}`,
          color: colors.textMuted, padding: '6px 16px', borderRadius: 6,
          cursor: 'pointer', fontSize: 12, fontFamily: '"JetBrains Mono"',
        }}>Reset</button>
        <button onClick={trigger} style={{
          background: `${colors.danger}25`, border: `1px solid ${colors.danger}60`,
          color: colors.danger, padding: '6px 16px', borderRadius: 6,
          cursor: 'pointer', fontSize: 12, fontFamily: '"JetBrains Mono"', fontWeight: 600,
        }}>Winter Storm Uri</button>
      </div>
    </div>
  );
}
