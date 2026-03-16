import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * EnpalArchitectureDiagram — Linear left-to-right architecture data flow
 *
 * Physical chain: Grid → Meter (Meterfy) → Steuerbox (§14a) → IoT HEMS
 * Inverter: PV (DC) + Battery (DC) → Inverter → AC to house
 * Telemetry: IoT HEMS → EMQX → Ingestion → Databricks → Spark
 * To Flexa:  Spark → Event Hub → Flexa
 * Dispatch:  Flexa → Event Hub → Cloud HEMS → EMQX → IoT HEMS
 */

const ELECTRICITY_COLOR = colors.accent; // amber for power

const NODES = [
  // Physical power chain — top row (Grid → Meter → Steuerbox → IoT HEMS)
  { id: 'grid',        label: 'Grid',            sub: 'Niederspannung',     x: 0.01, y: 0.12, color: colors.danger,    w: 70,  h: 42 },
  { id: 'meter',       label: 'Meterfy',         sub: 'Smart Meter',        x: 0.10, y: 0.12, color: colors.textMuted,  w: 65,  h: 32 },
  { id: 'steuerbox',   label: 'Steuerbox',       sub: '§14a',              x: 0.19, y: 0.12, color: colors.textMuted,   w: 72,  h: 32 },

  // Inverter + sources — branching off house electrical
  { id: 'pv',          label: 'PV',              sub: 'Solar',              x: 0.01, y: 0.42, color: colors.solar,      w: 50,  h: 28 },
  { id: 'battery',     label: 'Battery',         sub: 'Storage',            x: 0.01, y: 0.62, color: colors.battery,    w: 58,  h: 28 },
  { id: 'inverter',    label: 'Inverter',        sub: 'DC/AC',             x: 0.10, y: 0.52, color: colors.solar,      w: 68,  h: 32 },

  // IoT HEMS — gateway between home and cloud
  { id: 'iot_hems',    label: 'IoT HEMS',        sub: 'Edge Gateway',      x: 0.19, y: 0.42, color: colors.success,    w: 82,  h: 36 },

  // Other home devices below IoT HEMS
  { id: 'hp',          label: 'Heat Pump',       sub: '',                   x: 0.19, y: 0.62, color: colors.success,    w: 72,  h: 28 },
  { id: 'wallbox',     label: 'Wallbox',         sub: 'EV Charger',        x: 0.19, y: 0.78, color: colors.success,    w: 72,  h: 28 },

  // Cloud pipeline — middle row
  { id: 'emqx',        label: 'EMQX',            sub: 'MQTT Broker',       x: 0.34, y: 0.35, color: colors.primary,    w: 80,  h: 36 },
  { id: 'ingestion',   label: 'Data Ingestion',  sub: 'Protobuf · 20s',   x: 0.45, y: 0.35, color: colors.secondary,  w: 95,  h: 36 },
  { id: 'databricks',  label: 'Databricks',      sub: 'Bronze → Gold',    x: 0.57, y: 0.35, color: '#FF3621',         w: 90,  h: 36 },
  { id: 'spark',       label: 'Spark Streaming', sub: 'Aggregates',       x: 0.69, y: 0.35, color: '#E25A1C',         w: 105, h: 36 },

  // Control bridge — bottom row
  { id: 'cloud_hems',  label: 'Cloud HEMS',      sub: 'Orchestration',    x: 0.34, y: 0.75, color: colors.primary,    w: 90,  h: 36 },
  { id: 'event_hub',   label: 'Event Hub',       sub: 'Azure',            x: 0.57, y: 0.75, color: colors.accent,     w: 90,  h: 36 },

  // VPP Controller
  { id: 'flexa',       label: 'Flexa',           sub: 'VPP Controller',   x: 0.82, y: 0.55, color: colors.accent,     w: 100, h: 36 },
];

const EDGES = [
  // === ELECTRICITY: Grid → Meter → Steuerbox (main power cable) ===
  { from: 'grid',        to: 'meter',      label: 'AC',         color: ELECTRICITY_COLOR, rate: 2.5, electric: true },
  { from: 'meter',       to: 'steuerbox',  label: '',           color: ELECTRICITY_COLOR, rate: 2.5, electric: true },
  { from: 'steuerbox',   to: 'iot_hems',   label: '',           color: ELECTRICITY_COLOR, rate: 2.5, electric: true },

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
  { from: 'ingestion',   to: 'databricks', label: '',           color: colors.secondary, rate: 1.2 },
  { from: 'databricks',  to: 'spark',      label: 'Streaming', color: '#E25A1C',        rate: 1 },

  // === DATA: Spark → Flexa (via Event Hub) ===
  { from: 'spark',       to: 'event_hub',  label: 'Aggregates', color: '#E25A1C',       rate: 1.5 },
  { from: 'event_hub',   to: 'flexa',      label: '',           color: colors.accent,    rate: 1.2 },

  // === DATA: dispatch (Flexa → IoT HEMS, dashed) ===
  { from: 'flexa',        to: 'event_hub',  label: 'Dispatch',  color: colors.primary,   rate: 2, dash: true, offset: 4 },
  { from: 'event_hub',    to: 'cloud_hems', label: '',          color: colors.primary,   rate: 2, dash: true },
  { from: 'cloud_hems',   to: 'emqx',       label: '',          color: colors.primary,   rate: 2, dash: true },
  { from: 'emqx',         to: 'iot_hems',   label: '',          color: colors.primary,   rate: 2, dash: true, offset: 3 },
];

function getNode(id) {
  return NODES.find(n => n.id === id);
}

export default function EnpalArchitectureDiagram({ width = 960, height = 500 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const particles = [];
    const BASE_INTERVAL = 0.4;
    const edgeLastSpawn = EDGES.map(() => 0);

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

      // Section divider between home and cloud
      const divX = width * 0.305;
      ctx.strokeStyle = colors.textDim + '12';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(divX, 10);
      ctx.lineTo(divX, height - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw edges
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

        // Edge label
        if (edge.label) {
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2;
          ctx.font = isElectric ? 'bold 7px JetBrains Mono' : '7px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillStyle = isElectric ? (ELECTRICITY_COLOR + 'aa') : (colors.textDim + '90');
          const perpLabelX = -Math.sin(angle) * 9;
          const perpLabelY = Math.cos(angle) * 9;
          ctx.fillText(edge.label, mx + perpLabelX, my + perpLabelY);
        }
      });

      // Spawn and draw particles
      if (isActive) spawnParticles(now);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (isActive) p.progress += p.speed;
        if (p.progress > 1) { particles.splice(i, 1); continue; }

        const edge = EDGES[p.edge];
        const { fx, fy, tx, ty } = edgeEndpoints(edge);
        const px = fx + (tx - fx) * p.progress;
        const py = fy + (ty - fy) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = edge.electric ? 12 : 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        const tp = Math.max(0, p.progress - 0.07);
        const tpx = fx + (tx - fx) * tp;
        const tpy = fy + (ty - fy) * tp;
        ctx.beginPath();
        ctx.moveTo(tpx, tpy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = p.color + '50';
        ctx.lineWidth = p.size * 0.7;
        ctx.stroke();
      }

      // Draw nodes
      NODES.forEach((node) => {
        const nx = node.x * width;
        const ny = node.y * height - node.h / 2;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2 + node.x * 10 + node.y * 7);

        ctx.fillStyle = colors.surface + 'ee';
        ctx.strokeStyle = node.color + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(nx, ny, node.w, node.h, 5);
        ctx.fill();
        ctx.stroke();

        // Colored accent line at top
        ctx.fillStyle = node.color + '90';
        ctx.beginPath();
        ctx.roundRect(nx, ny, node.w, 2, [5, 5, 0, 0]);
        ctx.fill();

        // Glow
        ctx.shadowBlur = 6 * pulse;
        ctx.shadowColor = node.color + '30';
        ctx.beginPath();
        ctx.roundRect(nx, ny, node.w, node.h, 5);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = node.color;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx + node.w / 2, ny + (node.sub ? 15 : 18));

        // Sub-label
        if (node.sub) {
          ctx.font = '7px JetBrains Mono';
          ctx.fillStyle = colors.textDim + 'aa';
          ctx.fillText(node.sub, nx + node.w / 2, ny + 26);
        }
      });

      // Section labels
      ctx.font = 'bold 8px JetBrains Mono';
      ctx.textAlign = 'left';

      ctx.fillStyle = colors.danger + '40';
      ctx.fillText('GRID', 10, height * 0.04 + 4);

      ctx.fillStyle = colors.success + '40';
      ctx.fillText('HOME', width * 0.14, height * 0.04 + 4);

      ctx.fillStyle = colors.primary + '40';
      ctx.fillText('CLOUD', width * 0.34, height * 0.04 + 4);

      ctx.fillStyle = '#E25A1C40';
      ctx.fillText('DATA PIPELINE', width * 0.50, height * 0.04 + 4);

      ctx.fillStyle = colors.accent + '40';
      ctx.textAlign = 'right';
      ctx.fillText('VPP', width - 10, height * 0.04 + 4);

      // Legend
      ctx.font = '6.5px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillStyle = colors.textDim + '50';
      ctx.fillText('IoT HEMS = IoT Hub + Home Energy Management System', 8, height - 18);

      // Electricity vs data legend
      ctx.fillStyle = ELECTRICITY_COLOR + '80';
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = ELECTRICITY_COLOR + '60';
      ctx.beginPath();
      ctx.moveTo(8, height - 6);
      ctx.lineTo(30, height - 6);
      ctx.stroke();
      ctx.font = '6.5px JetBrains Mono';
      ctx.fillStyle = ELECTRICITY_COLOR + '80';
      ctx.fillText('electricity', 34, height - 3);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = colors.primary + '60';
      ctx.beginPath();
      ctx.moveTo(100, height - 6);
      ctx.lineTo(122, height - 6);
      ctx.stroke();
      ctx.fillStyle = colors.primary + '80';
      ctx.fillText('data', 126, height - 3);

      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(160, height - 6);
      ctx.lineTo(182, height - 6);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = colors.primary + '80';
      ctx.fillText('dispatch', 186, height - 3);

      ctx.textAlign = 'right';
      ctx.fillStyle = colors.secondary + '40';
      ctx.fillText('20s intervals', width - 10, height - 3);

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
