import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * EnpalArchitectureDiagram — Linear left-to-right architecture data flow
 *
 * Physical chain: Grid → Meter (Metrify) → Inverter; Steuerbox (§14a) → Inverter
 * Inverter: PV (DC) + Battery (DC) → Inverter → AC to house
 * Feed-in: PV/Battery → Inverter → Meter → Grid (occasional)
 * Telemetry: IoT HEMS → EMQX → Ingestion → Databricks → Spark
 * To Flexa:  Spark → Event Hub → Flexa
 * Dispatch:  Flexa → Event Hub → Cloud HEMS → EMQX → IoT HEMS
 */

const ELECTRICITY_COLOR = colors.accent; // amber for power

const NODES = [
  // === HOME SYSTEM (compact cluster) ===
  // Grid — nebulous strip on far left (w/h used for edge connection calculations)
  { id: 'grid',        label: 'Grid',            sub: 'Niederspannung',     x: 0.00, y: 0.50, color: colors.danger,    w: 30,  h: 300 },

  // Column 1 — grid-connected metering & generation
  { id: 'meter',       label: 'Metrify',          sub: 'Smart Meter',        x: 0.08, y: 0.10, color: colors.textMuted,  w: 78,  h: 38 },
  { id: 'steuerbox',   label: 'Steuerbox',       sub: '§14a',              x: 0.08, y: 0.78, color: colors.textMuted,   w: 84,  h: 38 },
  { id: 'pv',          label: 'PV',              sub: 'Solar',              x: 0.08, y: 0.40, color: colors.solar,      w: 60,  h: 34 },
  { id: 'battery',     label: 'Battery',         sub: 'Storage',            x: 0.08, y: 0.58, color: colors.battery,    w: 68,  h: 34 },

  // Column 2 — inverter (DC/AC conversion)
  { id: 'inverter',    label: 'Inverter',        sub: 'DC/AC',             x: 0.24, y: 0.48, color: colors.solar,      w: 80,  h: 38 },

  // Column 3 — smart home gateway & controlled devices
  { id: 'iot_hems',    label: 'IoT HEMS',        sub: 'Edge Gateway',      x: 0.38, y: 0.30, color: colors.success,    w: 96,  h: 42 },
  { id: 'hp',          label: 'Heat Pump',       sub: '',                   x: 0.28, y: 0.62, color: colors.success,    w: 84,  h: 34 },
  { id: 'wallbox',     label: 'EV Charger',      sub: '',                  x: 0.38, y: 0.62, color: colors.success,    w: 84,  h: 34 },

  // === CLOUD / DATA PIPELINE / VPP (staircase layout using vertical space) ===
  // Top row — telemetry ingress
  { id: 'emqx',        label: 'MQTT',            sub: 'EMQX',              x: 0.53, y: 0.18, color: colors.primary,    w: 94,  h: 42 },
  { id: 'ingestion',   label: 'Data Ingestion',  sub: 'Protobuf · 20s',   x: 0.70, y: 0.18, color: colors.secondary,  w: 110, h: 42 },

  // Middle row — processing (Spark aligned with Ingestion)
  { id: 'spark',       label: 'Spark Streaming', sub: 'Aggregates',       x: 0.70, y: 0.50, color: '#E25A1C',         w: 120, h: 42 },
  { id: 'databricks',  label: 'Databricks',      sub: 'Bronze → Gold',    x: 0.87, y: 0.50, color: '#FF3621',         w: 105, h: 42 },

  // Bottom row — dispatch / control (Event Hub aligned with Ingestion)
  { id: 'cloud_hems',  label: 'Cloud HEMS',      sub: 'Orchestration\nDapr Actors',  x: 0.53, y: 0.80, color: colors.primary,    w: 105, h: 52 },
  { id: 'event_hub',   label: 'Event Hub',       sub: 'Azure',            x: 0.70, y: 0.80, color: colors.accent,     w: 105, h: 42 },

  // Flexa — VPP controller, far right
  { id: 'flexa',       label: 'Flexa',           sub: 'VPP Controller',   x: 0.87, y: 0.80, color: colors.accent,     w: 120, h: 48 },
];

const EDGES = [
  // === ELECTRICITY: Grid → Meter → Inverter (main power cable) ===
  { from: 'grid',        to: 'meter',      label: 'AC',         color: ELECTRICITY_COLOR, rate: 2.5, electric: true },
  { from: 'meter',       to: 'inverter',   label: 'AC',         color: ELECTRICITY_COLOR, rate: 2.5, electric: true },

  // === ELECTRICITY: Feed-in (PV/Battery → Inverter → Meter → Grid) ===
  { from: 'inverter',    to: 'meter',      label: 'Feed-in',   color: ELECTRICITY_COLOR, rate: 4, electric: true, dash: true, offset: 6 },
  { from: 'meter',       to: 'grid',       label: '',           color: ELECTRICITY_COLOR, rate: 4, electric: true, dash: true, offset: 6 },

  // === CONTROL: Steuerbox → Inverter (§14a grid operator control) ===
  { from: 'steuerbox',   to: 'inverter',   label: '§14a',       color: colors.textMuted,  rate: 3 },

  // === ELECTRICITY: PV + Battery → Inverter (DC), Inverter → house (AC) ===
  { from: 'pv',          to: 'inverter',   label: 'DC',         color: ELECTRICITY_COLOR, rate: 3, electric: true },
  { from: 'battery',     to: 'inverter',   label: 'DC',         color: ELECTRICITY_COLOR, rate: 3, electric: true },
  { from: 'inverter',    to: 'iot_hems',   label: 'AC',         color: ELECTRICITY_COLOR, rate: 2.5, electric: true },

  // === DATA: devices → IoT HEMS ===
  { from: 'hp',          to: 'iot_hems',   label: '',           color: colors.success,   rate: 3 },
  { from: 'wallbox',     to: 'iot_hems',   label: '',           color: colors.success,   rate: 3 },

  // === DATA: telemetry pipeline (left → right) ===
  { from: 'iot_hems',    to: 'emqx',       label: 'MQTT',      color: colors.primary,   rate: 1.2, offset: -3 },
  { from: 'emqx',        to: 'ingestion',  label: 'Protobuf',  color: colors.secondary, rate: 1 },
  { from: 'ingestion',   to: 'spark',      label: '',           color: colors.secondary, rate: 1.2 },
  { from: 'spark',       to: 'databricks', label: 'Streaming', color: '#FF3621',        rate: 1 },

  // === DATA: Databricks → Flexa (via Event Hub) ===
  { from: 'databricks',  to: 'event_hub',  label: 'Aggregates', color: '#FF3621',       rate: 1.5 },
  { from: 'event_hub',   to: 'flexa',      label: '',           color: colors.accent,    rate: 1.2 },

  // === DATA: Cloud HEMS ↔ EMQX (bidirectional) ===
  { from: 'emqx',         to: 'cloud_hems', label: '',          color: colors.primary,   rate: 1.5, offset: -5 },

  // === DATA: dispatch (Flexa → IoT HEMS, dashed) ===
  { from: 'flexa',        to: 'event_hub',  label: 'Dispatch',  color: colors.primary,   rate: 2, dash: true, offset: 4 },
  { from: 'event_hub',    to: 'cloud_hems', label: '',          color: colors.primary,   rate: 2, dash: true },
  { from: 'cloud_hems',   to: 'emqx',       label: '',          color: colors.primary,   rate: 2, dash: true, offset: 5 },
  { from: 'emqx',         to: 'iot_hems',   label: '',          color: colors.primary,   rate: 2, dash: true, offset: 3 },
];

const NODE_MAP = new Map(NODES.map(n => [n.id, n]));
function getNode(id) { return NODE_MAP.get(id); }

export default function EnpalArchitectureDiagram({ width = 960, height = 500 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = 4; // High DPI for crisp rendering when zoomed
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const particles = [];
    const BASE_INTERVAL = 0.4;
    const startTime = performance.now() / 1000;
    const edgeLastSpawn = EDGES.map(() => startTime);

    function nodeCenter(node) {
      return { cx: node.x * width + node.w / 2, cy: node.y * height };
    }

    function edgeEndpoints(edge) {
      const from = getNode(edge.from);
      const to = getNode(edge.to);
      const fc = nodeCenter(from);
      const tc = nodeCenter(to);

      const dx = tc.cx - fc.cx;
      const dy = tc.cy - fc.cy;
      const angle = Math.atan2(dy, dx);

      const fw = from.w / 2, fh = from.h / 2;
      const tw = to.w / 2, th = to.h / 2;

      const fOffX = Math.cos(angle) * fw;
      const fOffY = Math.sin(angle) * fh;
      const tOffX = Math.cos(angle) * tw;
      const tOffY = Math.sin(angle) * th;

      const offset = edge.offset || 0;
      const perpX = -Math.sin(angle) * offset;
      const perpY = Math.cos(angle) * offset;

      return {
        fx: fc.cx + fOffX * 0.9 + perpX,
        fy: fc.cy + fOffY * 0.9 + perpY,
        tx: tc.cx - tOffX * 0.9 + perpX,
        ty: tc.cy - tOffY * 0.9 + perpY,
      };
    }

    function spawnParticles(now) {
      EDGES.forEach((edge, ei) => {
        const interval = BASE_INTERVAL * (edge.rate || 1);
        if (now - edgeLastSpawn[ei] > interval * 3) edgeLastSpawn[ei] = now;
        if (now - edgeLastSpawn[ei] < interval) return;
        edgeLastSpawn[ei] = now;
        particles.push({
          edge: ei,
          progress: 0,
          speed: 0.008 + Math.random() * 0.004,
          color: edge.color || colors.primary,
          size: edge.electric ? (3.5 + Math.random() * 1.5) : (2.5 + Math.random() * 1.5),
        });
      });
    }

    function draw() {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now() / 1000;
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = colors.surfaceLight + '10';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 30) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 30) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // Section divider (dotted) — Home | Cloud
      const divCloud = width * 0.50;
      ctx.strokeStyle = colors.textDim + '90';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(divCloud, 10);
      ctx.lineTo(divCloud, height - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw edges (lines and arrows only — labels deferred to after particles)
      const edgeLabels = [];
      EDGES.forEach((edge) => {
        const { fx, fy, tx, ty } = edgeEndpoints(edge);
        const isElectric = edge.electric;

        ctx.beginPath();
        ctx.strokeStyle = (edge.color || colors.primary) + (isElectric ? '40' : '25');
        ctx.lineWidth = isElectric ? 2.5 : 1.5;
        if (edge.dash) ctx.setLineDash([6, 4]);
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        const angle = Math.atan2(ty - fy, tx - fx);
        const arrowSize = isElectric ? 6 : 5;
        ctx.beginPath();
        ctx.fillStyle = (edge.color || colors.primary) + '50';
        ctx.moveTo(tx, ty);
        ctx.lineTo(tx - arrowSize * Math.cos(angle - 0.4), ty - arrowSize * Math.sin(angle - 0.4));
        ctx.lineTo(tx - arrowSize * Math.cos(angle + 0.4), ty - arrowSize * Math.sin(angle + 0.4));
        ctx.closePath();
        ctx.fill();

        // Collect edge labels for deferred rendering (drawn above particles)
        if (edge.label) {
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2;
          const perpLabelX = -Math.sin(angle) * 9;
          const perpLabelY = Math.cos(angle) * 9;
          edgeLabels.push({ text: edge.label, x: mx + perpLabelX, y: my + perpLabelY, isElectric });
        }
      });

      // Spawn and draw particles
      if (isActive) spawnParticles(now);

      // Advance particles and group by color for batched shadow rendering
      const particlesByColor = {};
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (isActive) p.progress += p.speed;
        if (p.progress > 1) { particles.splice(i, 1); continue; }

        const edge = EDGES[p.edge];
        const { fx, fy, tx, ty } = edgeEndpoints(edge);
        p._px = fx + (tx - fx) * p.progress;
        p._py = fy + (ty - fy) * p.progress;
        p._fx = fx; p._fy = fy; p._tx = tx; p._ty = ty;

        if (!particlesByColor[p.color]) particlesByColor[p.color] = [];
        particlesByColor[p.color].push(p);
      }

      // Draw particles batched by color — one shadow fill per group instead of per particle
      for (const [color, group] of Object.entries(particlesByColor)) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        for (const p of group) {
          ctx.moveTo(p._px + p.size, p._py);
          ctx.arc(p._px, p._py, p.size, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Trails — no shadow needed
        for (const p of group) {
          const tp = Math.max(0, p.progress - 0.07);
          const tpx = p._fx + (p._tx - p._fx) * tp;
          const tpy = p._fy + (p._ty - p._fy) * tp;
          ctx.beginPath();
          ctx.moveTo(tpx, tpy);
          ctx.lineTo(p._px, p._py);
          ctx.strokeStyle = color + '50';
          ctx.lineWidth = p.size * 0.7;
          ctx.stroke();
        }
      }

      // Draw edge labels above particles with background for readability
      edgeLabels.forEach(({ text, x, y, isElectric }) => {
        ctx.font = isElectric ? 'bold 10px JetBrains Mono' : '10px JetBrains Mono';
        ctx.textAlign = 'center';
        const metrics = ctx.measureText(text);
        const pad = 3;
        ctx.fillStyle = '#050810cc';
        ctx.fillRect(x - metrics.width / 2 - pad, y - 9 - pad, metrics.width + pad * 2, 12 + pad * 2);
        ctx.fillStyle = isElectric ? (ELECTRICITY_COLOR + 'dd') : (colors.text + 'bb');
        ctx.fillText(text, x, y);
      });

      // Draw grid as a tall nebulous glow on the far left
      {
        const gridNode = getNode('grid');
        const gx = gridNode.x * width;
        const pulse = 0.5 + 0.5 * Math.sin(now * 1.5);
        // Vertical glow strip — wider
        const grad = ctx.createLinearGradient(gx, 0, gx + 70, 0);
        grad.addColorStop(0, colors.danger + '28');
        grad.addColorStop(0.5, colors.danger + '0c');
        grad.addColorStop(1, colors.danger + '00');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 15, 70, height - 30);
        // Vertical line — thicker
        ctx.strokeStyle = colors.danger + Math.round(30 + pulse * 25).toString(16).padStart(2, '0');
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(gx + 5, 25);
        ctx.lineTo(gx + 5, height - 25);
        ctx.stroke();
        // Glow
        ctx.shadowBlur = 16 * pulse;
        ctx.shadowColor = colors.danger + '50';
        ctx.stroke();
        ctx.shadowBlur = 0;
        // Label rotated vertically — larger
        ctx.save();
        ctx.translate(gx - 6, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = 'bold 20px JetBrains Mono';
        ctx.fillStyle = colors.danger + 'bb';
        ctx.textAlign = 'center';
        ctx.fillText('GRID', 0, 0);
        ctx.font = '10px JetBrains Mono';
        ctx.fillStyle = colors.textDim + 'aa';
        ctx.fillText('Niederspannung', 0, 18);
        ctx.restore();
      }

      // Draw all other nodes as boxes
      NODES.forEach((node) => {
        if (node.id === 'grid') return; // grid drawn separately
        const nx = node.x * width;
        const ny = node.y * height - node.h / 2;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2 + node.x * 10 + node.y * 7);

        ctx.fillStyle = colors.surface + 'ee';
        ctx.strokeStyle = node.color + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(nx, ny, node.w, node.h, 6);
        ctx.fill();
        ctx.stroke();

        // Colored accent line at top
        ctx.fillStyle = node.color + '90';
        ctx.beginPath();
        ctx.roundRect(nx, ny, node.w, 2.5, [6, 6, 0, 0]);
        ctx.fill();

        // Glow
        ctx.shadowBlur = 8 * pulse;
        ctx.shadowColor = node.color + '30';
        ctx.beginPath();
        ctx.roundRect(nx, ny, node.w, node.h, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = node.color;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx + node.w / 2, ny + (node.sub ? 17 : 20));

        // Sub-label (supports \n for multi-line)
        if (node.sub) {
          ctx.font = '9px JetBrains Mono';
          ctx.fillStyle = colors.text + 'aa';
          const subLines = node.sub.split('\n');
          subLines.forEach((line, li) => {
            ctx.fillText(line, nx + node.w / 2, ny + 30 + li * 11);
          });
        }
      });

      // Section labels
      ctx.font = 'bold 14px JetBrains Mono';

      ctx.textAlign = 'right';
      ctx.fillStyle = colors.success + 'dd';
      ctx.fillText('HOME', divCloud - 14, height * 0.04 + 4);

      ctx.textAlign = 'left';
      ctx.fillStyle = colors.primary + 'dd';
      ctx.fillText('CLOUD / DATA PIPELINE / VPP', divCloud + 14, height * 0.04 + 4);

      // Legend
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillStyle = colors.text + '90';
      ctx.fillText('IoT HEMS = IoT Hub + Home Energy Management System', 8, height - 22);

      ctx.lineWidth = 2.5;
      ctx.strokeStyle = ELECTRICITY_COLOR + '80';
      ctx.beginPath();
      ctx.moveTo(8, height - 7);
      ctx.lineTo(34, height - 7);
      ctx.stroke();
      ctx.fillStyle = ELECTRICITY_COLOR + 'cc';
      ctx.fillText('electricity', 38, height - 3);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colors.primary + '80';
      ctx.beginPath();
      ctx.moveTo(130, height - 7);
      ctx.lineTo(156, height - 7);
      ctx.stroke();
      ctx.fillStyle = colors.primary + 'cc';
      ctx.fillText('data', 160, height - 3);

      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(200, height - 7);
      ctx.lineTo(226, height - 7);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.primary + 'cc';
      ctx.fillText('dispatch', 230, height - 3);

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width, height }}
      />
    </div>
  );
}
