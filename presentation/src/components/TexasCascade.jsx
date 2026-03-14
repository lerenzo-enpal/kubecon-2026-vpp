import React, { useEffect, useRef, useState, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

// Map lat/lon to canvas pixel coords within the map area (right side)
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
    drawH = mapH;
    drawW = drawH * geoAspect;
    offsetX = mapX + (mapW - drawW) / 2;
    offsetY = mapY;
  } else {
    drawW = mapW;
    drawH = drawW / geoAspect;
    offsetX = mapX;
    offsetY = mapY + (mapH - drawH) / 2;
  }

  const normLon = (lon - lonMin) / (lonMax - lonMin);
  const normLat = (latMax - lat) / (latMax - latMin);
  return { x: offsetX + normLon * drawW, y: offsetY + normLat * drawH };
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

const typeColors = { wind: '#60a5fa', gas: '#fb923c', coal: '#94a3b8', nuclear: colors.secondary };

const TX_OUTLINE = [
  [36.5, -103], [36.5, -100], [34.5, -100], [34.0, -94.5], [33.6, -94.1],
  [31.0, -94.0], [29.7, -93.8], [29.3, -94.7], [28.9, -95.3], [28.5, -96.0],
  [27.5, -97.2], [26.0, -97.2], [25.9, -97.5], [26.4, -99.1], [27.8, -100.3],
  [29.5, -101.0], [31.0, -103.5], [32.0, -103.1], [32.0, -103.0], [36.5, -103],
];

const CASCADE_STEPS = [
  { time: 0, nodes: ['amarillo', 'lubbock', 'roscoe'], timestamp: 'Feb 14 AM', label: 'Wind turbines ice up — Panhandle', mw: '16,000 MW wind offline' },
  { time: 3, nodes: ['midland'], timestamp: 'Feb 14 PM', label: 'Gas wells freeze — Permian Basin', mw: 'Gas supply drops 50%' },
  { time: 5, nodes: ['abilene'], timestamp: 'Feb 14 EVE', label: 'Gas plants lose fuel supply', mw: 'Cascading gas shortage' },
  { time: 6, nodes: ['midlothian', 'forney'], timestamp: 'Feb 14 11PM', label: 'DFW gas plants trip offline', mw: 'Midlothian at 30%' },
  { time: 7, nodes: ['martin', 'limestone'], timestamp: 'Feb 15 1AM', label: 'East TX coal & lignite fail', mw: 'Frozen coal piles' },
  { time: 8, nodes: ['oakgrove', 'parish'], timestamp: 'Feb 15 2AM', label: 'Central + Houston tripping', mw: '35,000 MW offline' },
  { time: 9, nodes: ['cedarbayou', 'waco'], timestamp: 'Feb 15 3AM', label: 'Cascade spreads statewide', mw: 'Load shedding begins' },
  { time: 10, nodes: ['stp'], timestamp: 'Feb 15 5:37AM', label: 'STP Nuclear Unit 1 trips', mw: 'Frozen sensor line' },
  { time: 11, nodes: ['corpus', 'sanantonio', 'austin'], timestamp: 'Feb 15-18', label: '4.5 million homes go dark', mw: '52,277 MW offline' },
  { time: 13, nodes: ['houston', 'dfw'], timestamp: 'Feb 15-19', label: 'Grid emergency — 70+ hours', mw: '48.6% of capacity gone' },
];

// The step that almost happened
const FINAL_STEP = { timestamp: '1:55 AM', label: 'TOTAL GRID COLLAPSE', sublabel: '4 min 37 sec away — avoided by emergency load shedding. Cold restart would take weeks.' };

export default function TexasCascade({ width = 960, height = 560 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [phase, setPhase] = useState('stable');
  const phaseRef = useRef('stable');
  const startTimeRef = useRef(null);
  const failedRef = useRef(new Set());
  const freqRef = useRef(60.0);
  const activeStepRef = useRef(-1);

  const slideContext = useContext(SlideContext);
  useEffect(() => {
    if (slideContext?.isSlideActive) {
      phaseRef.current = 'stable';
      setPhase('stable');
      startTimeRef.current = null;
      failedRef.current = new Set();
      freqRef.current = 60.0;
      activeStepRef.current = -1;
    }
  }, [slideContext?.isSlideActive]);

  const reset = () => {
    phaseRef.current = 'stable';
    setPhase('stable');
    startTimeRef.current = null;
    failedRef.current = new Set();
    freqRef.current = 60.0;
    activeStepRef.current = -1;
  };

  const trigger = () => {
    phaseRef.current = 'cascade';
    setPhase('cascade');
    startTimeRef.current = performance.now();
    failedRef.current = new Set();
    activeStepRef.current = -1;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Layout: left panel for timeline, right panel for map
    const timelineW = width * 0.38;
    const mapX = timelineW;
    const mapY = 44;
    const mapW = width - timelineW - 4;
    const mapH = height - mapY - 36;

    const nodes = RAW_NODES.map(n => ({
      ...n,
      ...toXY(n.lat, n.lon, mapX, mapY, mapW, mapH),
    }));
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
        freqRef.current = 60.0 - failCount * 0.35 - Math.max(0, elapsed - 2) * 0.06;
        freqRef.current = Math.max(57.5, freqRef.current);
        failedRef.current.delete('comanche');
      }

      const freq = freqRef.current + Math.sin(now / 300) * 0.01;

      // ══════ TOP BAR ══════
      ctx.fillStyle = '#050810ee';
      ctx.fillRect(0, 0, width, 42);

      // Frequency (top left)
      const freqColor = freq < 59.0 ? colors.danger : freq < 59.5 ? colors.accent : colors.primary;
      ctx.fillStyle = freqColor;
      ctx.font = 'bold 26px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 14;
      ctx.shadowColor = freqColor;
      ctx.fillText(`${freq.toFixed(3)} Hz`, 10, 30);
      ctx.shadowBlur = 0;

      // MW counter (top right)
      if (phaseRef.current === 'cascade') {
        const mwOffline = Math.min(52277, Math.floor(failedRef.current.size / RAW_NODES.length * 52277));
        ctx.fillStyle = colors.danger;
        ctx.font = 'bold 15px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(`${mwOffline.toLocaleString()} MW OFFLINE`, width - 10, 22);
        ctx.fillStyle = colors.textDim;
        ctx.font = '10px JetBrains Mono';
        ctx.fillText('of 107,000 MW', width - 10, 36);
      } else {
        ctx.fillStyle = colors.primary + 'aa';
        ctx.font = '12px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText('ERCOT GRID — NORMAL', width - 10, 28);
      }

      // Status center
      ctx.textAlign = 'center';
      if (phaseRef.current === 'cascade' && activeStepRef.current >= 0) {
        const flash = Math.sin(now / 180) > 0;
        ctx.fillStyle = flash ? colors.danger : colors.danger + '50';
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillText(CASCADE_STEPS[Math.min(activeStepRef.current, CASCADE_STEPS.length - 1)].label.toUpperCase(), width / 2, 28);
      }

      // ══════ LEFT PANEL — TIMELINE ══════
      const tlX = 12;
      const tlY = 52;
      const stepH = (height - tlY - 68) / (CASCADE_STEPS.length + 1); // +1 for final step

      CASCADE_STEPS.forEach((step, i) => {
        const y = tlY + i * stepH;
        const isActive = phaseRef.current === 'cascade' && elapsed > step.time;
        const isCurrent = activeStepRef.current === i;
        const alpha = isActive ? 1 : 0.2;

        // Connecting line
        if (i > 0) {
          ctx.strokeStyle = isActive ? colors.danger + '40' : colors.textDim + '15';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tlX + 4, y - stepH + 10);
          ctx.lineTo(tlX + 4, y);
          ctx.stroke();
        }

        // Dot
        ctx.beginPath();
        ctx.arc(tlX + 4, y + 4, isCurrent ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isActive ? colors.danger : colors.textDim + '30';
        if (isCurrent) {
          ctx.shadowBlur = 8;
          ctx.shadowColor = colors.danger;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Timestamp
        ctx.fillStyle = isActive ? colors.danger + 'cc' : colors.textDim + '40';
        ctx.font = `bold 9px JetBrains Mono`;
        ctx.textAlign = 'left';
        ctx.fillText(step.timestamp, tlX + 14, y + 2);

        // Label
        ctx.fillStyle = isActive ? colors.text + (isCurrent ? 'ff' : 'bb') : colors.textDim + '30';
        ctx.font = `${isCurrent ? 'bold ' : ''}10px Inter`;
        ctx.fillText(step.label, tlX + 14, y + 14);

        // MW sublabel
        ctx.fillStyle = isActive ? colors.textMuted + (isCurrent ? 'cc' : '80') : colors.textDim + '20';
        ctx.font = '8px JetBrains Mono';
        ctx.fillText(step.mw, tlX + 14, y + 24);
      });

      // ── FINAL STEP (bottom, the one that didn't happen) ──
      const finalY = tlY + CASCADE_STEPS.length * stepH;
      const showFinal = phaseRef.current === 'cascade' && elapsed > 14;

      // Connecting line to final
      if (phaseRef.current === 'cascade' && activeStepRef.current >= CASCADE_STEPS.length - 1) {
        ctx.strokeStyle = colors.danger + '25';
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tlX + 4, finalY - stepH + 10);
        ctx.lineTo(tlX + 4, finalY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Final step box
      const finalAlpha = showFinal ? (Math.sin(now / 200) * 0.3 + 0.7) : 0.15;
      const boxW = timelineW - 20;
      ctx.fillStyle = showFinal ? `rgba(239, 68, 68, ${0.08 * finalAlpha})` : 'transparent';
      ctx.strokeStyle = showFinal ? `rgba(239, 68, 68, ${0.4 * finalAlpha})` : colors.textDim + '15';
      ctx.lineWidth = 1;
      ctx.setLineDash(showFinal ? [] : [4, 4]);
      ctx.beginPath();
      ctx.roundRect(tlX - 2, finalY - 2, boxW, 40, 6);
      ctx.fill();
      ctx.stroke();
      ctx.setLineDash([]);

      // X mark
      ctx.beginPath();
      ctx.arc(tlX + 4, finalY + 14, 4, 0, Math.PI * 2);
      ctx.fillStyle = showFinal ? colors.danger + '60' : colors.textDim + '20';
      ctx.fill();
      if (showFinal) {
        ctx.strokeStyle = colors.danger;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tlX + 1, finalY + 11);
        ctx.lineTo(tlX + 7, finalY + 17);
        ctx.moveTo(tlX + 7, finalY + 11);
        ctx.lineTo(tlX + 1, finalY + 17);
        ctx.stroke();
      }

      ctx.fillStyle = showFinal ? colors.danger : colors.textDim + '40';
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(FINAL_STEP.timestamp, tlX + 14, finalY + 10);
      ctx.font = 'bold 10px Inter';
      ctx.fillText(FINAL_STEP.label, tlX + 14, finalY + 22);
      ctx.fillStyle = showFinal ? colors.danger + '90' : colors.textDim + '25';
      ctx.font = '8px Inter';
      // Wrap sublabel
      ctx.fillText('Avoided by 4:37. Cold restart = weeks.', tlX + 14, finalY + 33);

      // ══════ RIGHT PANEL — MAP ══════

      // Subtle divider
      ctx.strokeStyle = colors.textDim + '15';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(timelineW - 6, 44);
      ctx.lineTo(timelineW - 6, height - 30);
      ctx.stroke();

      // Texas outline
      ctx.strokeStyle = colors.primary + '28';
      ctx.lineWidth = 1;
      ctx.fillStyle = colors.primary + '03';
      ctx.beginPath();
      TX_OUTLINE.forEach((pt, i) => {
        const { x, y } = toXY(pt[0], pt[1], mapX, mapY, mapW, mapH);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Danger overlay
      if (phaseRef.current === 'cascade' && elapsed > 4) {
        const intensity = Math.min(0.06, (elapsed - 4) * 0.006);
        const pulse = Math.sin(now / 500) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(239, 68, 68, ${intensity * pulse})`;
        ctx.fillRect(mapX, mapY, mapW, mapH);
      }

      // Transmission lines
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
          ctx.strokeStyle = colors.danger + '12';
          ctx.lineWidth = 0.8;
        } else if (aF || bF) {
          const pulse = Math.sin(now / 200) * 0.3 + 0.7;
          ctx.strokeStyle = `rgba(239, 68, 68, ${0.25 * pulse})`;
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = colors.primary + '30';
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();

        // Flow dots
        if (!aF && !bF) {
          const seed = a.charCodeAt(0) + b.charCodeAt(0);
          const flowT = ((now / 1800) + seed * 0.1) % 1;
          ctx.beginPath();
          ctx.arc(
            nodeA.x + (nodeB.x - nodeA.x) * flowT,
            nodeA.y + (nodeB.y - nodeA.y) * flowT,
            1.5, 0, Math.PI * 2,
          );
          ctx.fillStyle = colors.primary + '50';
          ctx.fill();
        }
      });

      // Nodes
      nodes.forEach(node => {
        const failed = failedRef.current.has(node.id);
        const isComanche = node.id === 'comanche';
        const isCascading = phaseRef.current === 'cascade';
        const r = isCascading && isComanche ? 9 : 7;

        // Glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2);
        if (failed) {
          const pulse = Math.sin(now / 300) * 0.5 + 0.5;
          ctx.fillStyle = `rgba(239, 68, 68, ${0.05 * pulse})`;
        } else {
          ctx.fillStyle = (isComanche && isCascading ? colors.success : typeColors[node.type]) + '10';
        }
        ctx.fill();

        // Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        if (failed) {
          ctx.fillStyle = colors.danger + '20';
          ctx.fill();
          ctx.strokeStyle = colors.danger + '60';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(node.x - 4, node.y - 4);
          ctx.lineTo(node.x + 4, node.y + 4);
          ctx.moveTo(node.x + 4, node.y - 4);
          ctx.lineTo(node.x - 4, node.y + 4);
          ctx.strokeStyle = colors.danger;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          const c = isComanche && isCascading ? colors.success : typeColors[node.type];
          ctx.fillStyle = c + '35';
          ctx.fill();
          ctx.strokeStyle = c + 'bb';
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = failed ? colors.danger + '50' : colors.text + 'aa';
        ctx.font = '8px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + r + 11);
      });

      // Comanche callout
      if (phaseRef.current === 'cascade' && elapsed > 6) {
        const cp = getNode('comanche');
        const pulse = Math.sin(now / 400) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(16, 185, 129, ${pulse * 0.9})`;
        ctx.font = 'bold 8px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('100%', cp.x + 12, cp.y + 3);
      }

      // Legend (bottom right)
      ctx.font = '8px Inter';
      ctx.textAlign = 'left';
      const ly = height - 12;
      [
        { color: '#60a5fa', label: 'Wind' },
        { color: '#fb923c', label: 'Gas' },
        { color: '#94a3b8', label: 'Coal' },
        { color: colors.secondary, label: 'Nuclear' },
      ].forEach((item, i) => {
        const lx = mapX + 8 + i * 62;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(item.label, lx + 6, ly + 3);
      });

      // ERCOT isolated label
      ctx.fillStyle = colors.textDim + '30';
      ctx.font = '7px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText('ERCOT — ISOLATED FROM US GRID', width - 8, height - 8);

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width, height, borderRadius: 8, border: `1px solid ${colors.surfaceLight}` }}
      />
      <div style={{ position: 'absolute', bottom: 10, left: 10, display: 'flex', gap: 6, zIndex: 2 }}>
        <button onClick={reset} style={{
          background: colors.surface + 'dd', border: `1px solid ${colors.surfaceLight}`,
          color: colors.textMuted, padding: '5px 12px', borderRadius: 6,
          cursor: 'pointer', fontSize: 11, fontFamily: '"JetBrains Mono"',
        }}>Reset</button>
        <button onClick={trigger} style={{
          background: `${colors.danger}20`, border: `1px solid ${colors.danger}60`,
          color: colors.danger, padding: '5px 12px', borderRadius: 6,
          cursor: 'pointer', fontSize: 11, fontFamily: '"JetBrains Mono"', fontWeight: 600,
        }}>Winter Storm Uri</button>
      </div>
    </div>
  );
}
