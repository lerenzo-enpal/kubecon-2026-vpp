import React, { useEffect, useRef, useState } from 'react';
import { colors } from '../theme';

// Geographically accurate Texas nodes (x,y mapped to canvas coords)
// Texas bounding box approx: lat 25.8-36.5, lon -106.6 to -93.5
const toXY = (lat, lon, w, h) => {
  const x = ((lon - (-107)) / ((-93) - (-107))) * w;
  const y = ((36.5 - lat) / (36.5 - 25.5)) * h;
  return { x, y };
};

const W = 780, H = 520;

const NODES = [
  // Wind farms (Panhandle / West TX)
  { id: 'amarillo', ...toXY(35.22, -101.83, W, H), type: 'wind', label: 'Amarillo', cap: 4.0 },
  { id: 'lubbock', ...toXY(33.58, -101.85, W, H), type: 'wind', label: 'Lubbock', cap: 3.2 },
  { id: 'roscoe', ...toXY(32.45, -100.5, W, H), type: 'wind', label: 'Roscoe Wind', cap: 2.5 },
  // Gas / Permian
  { id: 'midland', ...toXY(31.99, -102.08, W, H), type: 'gas', label: 'Midland/Odessa', cap: 2.1 },
  { id: 'abilene', ...toXY(32.45, -99.73, W, H), type: 'gas', label: 'Abilene', cap: 1.8 },
  // DFW cluster
  { id: 'dfw', ...toXY(32.78, -96.80, W, H), type: 'gas', label: 'Dallas/FW', cap: 6.5 },
  { id: 'midlothian', ...toXY(32.48, -96.99, W, H), type: 'gas', label: 'Midlothian', cap: 1.6 },
  { id: 'forney', ...toXY(32.75, -96.47, W, H), type: 'gas', label: 'Forney', cap: 1.9 },
  // Nuclear
  { id: 'comanche', ...toXY(32.30, -97.79, W, H), type: 'nuclear', label: 'Comanche Peak', cap: 2.3 },
  // East TX
  { id: 'martin', ...toXY(32.26, -94.57, W, H), type: 'coal', label: 'Martin Lake', cap: 2.3 },
  // Central TX
  { id: 'waco', ...toXY(31.55, -97.15, W, H), type: 'gas', label: 'Waco', cap: 1.5 },
  { id: 'limestone', ...toXY(31.43, -96.54, W, H), type: 'coal', label: 'Limestone', cap: 1.9 },
  { id: 'oakgrove', ...toXY(31.05, -96.50, W, H), type: 'coal', label: 'Oak Grove', cap: 1.8 },
  // Austin / San Antonio
  { id: 'austin', ...toXY(30.27, -97.74, W, H), type: 'gas', label: 'Austin', cap: 2.8 },
  { id: 'sanantonio', ...toXY(29.42, -98.49, W, H), type: 'gas', label: 'San Antonio', cap: 3.5 },
  // Houston cluster
  { id: 'houston', ...toXY(29.76, -95.37, W, H), type: 'gas', label: 'Houston', cap: 8.0 },
  { id: 'parish', ...toXY(29.48, -95.63, W, H), type: 'coal', label: 'W.A. Parish', cap: 3.7 },
  { id: 'cedarbayou', ...toXY(29.77, -94.97, W, H), type: 'gas', label: 'Cedar Bayou', cap: 1.5 },
  // South TX
  { id: 'stp', ...toXY(28.80, -96.05, W, H), type: 'nuclear', label: 'STP Nuclear', cap: 2.7 },
  { id: 'corpus', ...toXY(27.80, -97.40, W, H), type: 'gas', label: 'Corpus Christi', cap: 1.8 },
];

const LINES = [
  // CREZ corridors (Panhandle to load centers)
  ['amarillo', 'lubbock'], ['lubbock', 'roscoe'], ['roscoe', 'abilene'],
  ['abilene', 'dfw'], ['abilene', 'waco'],
  // Permian connections
  ['midland', 'abilene'], ['midland', 'sanantonio'],
  // DFW cluster
  ['dfw', 'midlothian'], ['dfw', 'forney'], ['dfw', 'comanche'],
  ['comanche', 'waco'], ['dfw', 'martin'],
  // Central backbone (I-35)
  ['waco', 'austin'], ['waco', 'limestone'], ['limestone', 'oakgrove'],
  ['austin', 'sanantonio'], ['oakgrove', 'austin'],
  // Houston radials
  ['houston', 'parish'], ['houston', 'cedarbayou'], ['houston', 'austin'],
  ['houston', 'stp'],
  // South
  ['sanantonio', 'corpus'], ['stp', 'corpus'],
  // East TX
  ['martin', 'forney'],
];

const typeColors = {
  wind: '#60a5fa',
  solar: colors.solar,
  gas: '#fb923c',
  coal: '#94a3b8',
  nuclear: colors.secondary,
};

// Cascade phases with timing (seconds after trigger)
const CASCADE_PHASES = [
  // Phase 1: Wind ices up (0-3s)
  { time: 0, nodes: ['amarillo', 'lubbock', 'roscoe'], label: 'WIND TURBINES ICING — PANHANDLE / WEST TX' },
  // Phase 2: Gas supply fails (3-6s)
  { time: 3, nodes: ['midland'], label: 'PERMIAN BASIN GAS WELLS FREEZING' },
  // Phase 3: Thermal cascade (6-12s)
  { time: 5, nodes: ['abilene'], label: 'GAS PLANTS LOSING FUEL SUPPLY' },
  { time: 6, nodes: ['midlothian', 'forney'], label: 'DFW GAS PLANTS OFFLINE — 30% CAPACITY' },
  { time: 7, nodes: ['martin', 'limestone'], label: 'EAST TX COAL / LIGNITE FAILING' },
  { time: 8, nodes: ['oakgrove', 'parish'], label: 'CENTRAL + HOUSTON PLANTS TRIPPING' },
  { time: 9, nodes: ['cedarbayou', 'waco'], label: 'CASCADE SPREADING STATEWIDE' },
  { time: 10, nodes: ['stp'], label: 'STP UNIT 1 TRIPS — FROZEN SENSOR LINE' },
  { time: 11, nodes: ['corpus', 'sanantonio', 'austin'], label: 'LOAD SHEDDING — 4.5 MILLION HOMES DARK' },
  { time: 13, nodes: ['houston', 'dfw'], label: 'GRID EMERGENCY — 52,277 MW OFFLINE' },
];

export default function TexasCascade({ width = W, height = H }) {
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

    const draw = () => {
      const now = performance.now();
      const elapsed = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      // Texas outline (simplified)
      ctx.strokeStyle = colors.textDim + '18';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      // Panhandle top
      ctx.moveTo(toXY(36.5, -103, W, H).x, toXY(36.5, -103, W, H).y);
      ctx.lineTo(toXY(36.5, -100, W, H).x, toXY(36.5, -100, W, H).y);
      ctx.lineTo(toXY(34.5, -100, W, H).x, toXY(34.5, -100, W, H).y);
      // East border
      ctx.lineTo(toXY(33.8, -94.5, W, H).x, toXY(33.8, -94.5, W, H).y);
      ctx.lineTo(toXY(31.0, -94.0, W, H).x, toXY(31.0, -94.0, W, H).y);
      ctx.lineTo(toXY(29.7, -93.8, W, H).x, toXY(29.7, -93.8, W, H).y);
      // Gulf coast
      ctx.lineTo(toXY(29.3, -94.7, W, H).x, toXY(29.3, -94.7, W, H).y);
      ctx.lineTo(toXY(28.5, -96.0, W, H).x, toXY(28.5, -96.0, W, H).y);
      ctx.lineTo(toXY(27.5, -97.2, W, H).x, toXY(27.5, -97.2, W, H).y);
      ctx.lineTo(toXY(26.0, -97.2, W, H).x, toXY(26.0, -97.2, W, H).y);
      // Rio Grande
      ctx.lineTo(toXY(26.1, -98.3, W, H).x, toXY(26.1, -98.3, W, H).y);
      ctx.lineTo(toXY(29.5, -101.0, W, H).x, toXY(29.5, -101.0, W, H).y);
      ctx.lineTo(toXY(31.0, -103.5, W, H).x, toXY(31.0, -103.5, W, H).y);
      ctx.lineTo(toXY(32.0, -103.1, W, H).x, toXY(32.0, -103.1, W, H).y);
      ctx.lineTo(toXY(32.0, -103.0, W, H).x, toXY(32.0, -103.0, W, H).y);
      ctx.lineTo(toXY(36.5, -103, W, H).x, toXY(36.5, -103, W, H).y);
      ctx.stroke();

      // Process cascade
      if (phaseRef.current === 'cascade') {
        CASCADE_PHASES.forEach(phase => {
          if (elapsed > phase.time) {
            phase.nodes.forEach(n => failedRef.current.add(n));
            warningRef.current = phase.label;
          }
        });

        // Frequency drops
        const failCount = failedRef.current.size;
        freqRef.current = 60.0 - failCount * 0.35 - Math.max(0, elapsed - 2) * 0.06;
        freqRef.current = Math.max(57.5, freqRef.current);
        // Comanche Peak never fails
        failedRef.current.delete('comanche');
      }

      const freq = freqRef.current + Math.sin(now / 300) * 0.01;

      // Draw transmission lines
      LINES.forEach(([a, b]) => {
        const nodeA = NODES.find(n => n.id === a);
        const nodeB = NODES.find(n => n.id === b);
        if (!nodeA || !nodeB) return;
        const aFailed = failedRef.current.has(a);
        const bFailed = failedRef.current.has(b);

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);

        if (aFailed && bFailed) {
          ctx.strokeStyle = colors.danger + '20';
          ctx.lineWidth = 0.8;
        } else if (aFailed || bFailed) {
          ctx.strokeStyle = colors.accent + '40';
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = colors.primary + '30';
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();

        // Flow dots on active lines
        if (!aFailed && !bFailed) {
          const flowT = ((now / 2000) + LINES.indexOf(LINES.find(l => l[0] === a && l[1] === b)) * 0.2) % 1;
          const dotX = nodeA.x + (nodeB.x - nodeA.x) * flowT;
          const dotY = nodeA.y + (nodeB.y - nodeA.y) * flowT;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = colors.primary + '60';
          ctx.fill();
        }
      });

      // Draw nodes
      NODES.forEach(node => {
        const failed = failedRef.current.has(node.id);
        const isNuclear = node.type === 'nuclear';
        const isComanche = node.id === 'comanche';

        // Glow
        if (!failed) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, isComanche && phaseRef.current === 'cascade' ? 18 : 14, 0, Math.PI * 2);
          ctx.fillStyle = (isComanche && phaseRef.current === 'cascade')
            ? colors.success + '20'
            : typeColors[node.type] + '12';
          ctx.fill();
        }

        // Node
        ctx.beginPath();
        ctx.arc(node.x, node.y, isComanche && phaseRef.current === 'cascade' ? 10 : 8, 0, Math.PI * 2);

        if (failed) {
          ctx.fillStyle = colors.danger + '30';
          ctx.fill();
          ctx.strokeStyle = colors.danger + '60';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // X mark
          ctx.beginPath();
          ctx.moveTo(node.x - 4, node.y - 4);
          ctx.lineTo(node.x + 4, node.y + 4);
          ctx.moveTo(node.x + 4, node.y - 4);
          ctx.lineTo(node.x - 4, node.y + 4);
          ctx.strokeStyle = colors.danger;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          const c = isComanche && phaseRef.current === 'cascade' ? colors.success : typeColors[node.type];
          ctx.fillStyle = c + '40';
          ctx.fill();
          ctx.strokeStyle = c;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = failed ? colors.danger + '50' : colors.text + 'aa';
        ctx.font = '9px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + 18);
        if (!failed) {
          ctx.fillStyle = colors.textDim + '80';
          ctx.font = '8px JetBrains Mono';
          ctx.fillText(`${node.cap} GW`, node.x, node.y + 27);
        }
      });

      // Comanche Peak callout during cascade
      if (phaseRef.current === 'cascade' && elapsed > 6) {
        const cp = NODES.find(n => n.id === 'comanche');
        const pulse = Math.sin(now / 400) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(16, 185, 129, ${pulse * 0.8})`;
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.textAlign = 'left';
        ctx.fillText('100% ONLINE', cp.x + 14, cp.y - 4);
      }

      // Frequency display
      const freqColor = freq < 59.0 ? colors.danger : freq < 59.5 ? colors.accent : colors.primary;
      ctx.fillStyle = freqColor;
      ctx.font = 'bold 28px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.shadowBlur = 15;
      ctx.shadowColor = freqColor;
      ctx.fillText(`${freq.toFixed(3)} Hz`, 14, 32);
      ctx.shadowBlur = 0;

      // Status text
      ctx.font = '12px JetBrains Mono';
      if (phaseRef.current === 'stable') {
        ctx.fillStyle = colors.primary + 'cc';
        ctx.fillText('ERCOT GRID — NORMAL OPERATIONS', 14, 50);
      } else {
        const flash = Math.sin(now / 200) > 0;
        ctx.fillStyle = flash ? colors.danger : colors.danger + '40';
        ctx.fillText(warningRef.current, 14, 50);
      }

      // MW offline counter
      if (phaseRef.current === 'cascade') {
        const mwOffline = Math.min(52277, Math.floor(failedRef.current.size / NODES.length * 52277));
        ctx.fillStyle = colors.danger;
        ctx.font = 'bold 14px JetBrains Mono';
        ctx.textAlign = 'right';
        ctx.fillText(`${mwOffline.toLocaleString()} MW OFFLINE`, width - 14, 32);

        ctx.fillStyle = colors.textMuted;
        ctx.font = '11px JetBrains Mono';
        ctx.fillText(`of 107,000 MW total`, width - 14, 48);
      }

      // "4 min 37 sec" warning banner
      if (phaseRef.current === 'cascade' && elapsed > 12) {
        const flash = Math.sin(now / 150) > 0;
        if (flash) {
          ctx.fillStyle = colors.danger + '15';
          ctx.fillRect(0, height - 40, width, 40);
          ctx.fillStyle = colors.danger;
          ctx.font = 'bold 15px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('\u26a0  4 MINUTES 37 SECONDS FROM TOTAL GRID COLLAPSE  \u26a0', width / 2, height - 16);
        }
      }

      // Legend
      ctx.font = '9px Inter';
      ctx.textAlign = 'left';
      const legendItems = [
        { color: '#60a5fa', label: 'Wind' },
        { color: '#fb923c', label: 'Gas' },
        { color: '#94a3b8', label: 'Coal' },
        { color: colors.secondary, label: 'Nuclear' },
      ];
      legendItems.forEach((item, i) => {
        const lx = 14 + i * 70;
        const ly = height - 14;
        ctx.beginPath();
        ctx.arc(lx, ly, 3, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(item.label, lx + 7, ly + 3);
      });

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
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6 }}>
        <button onClick={reset} style={{
          background: colors.surface, border: `1px solid ${colors.surfaceLight}`,
          color: colors.textMuted, padding: '5px 14px', borderRadius: 6,
          cursor: 'pointer', fontSize: 12, fontFamily: '"JetBrains Mono"',
        }}>Reset</button>
        <button onClick={trigger} style={{
          background: `${colors.danger}20`, border: `1px solid ${colors.danger}60`,
          color: colors.danger, padding: '5px 14px', borderRadius: 6,
          cursor: 'pointer', fontSize: 12, fontFamily: '"JetBrains Mono"', fontWeight: 600,
        }}>Winter Storm Uri</button>
      </div>
    </div>
  );
}
