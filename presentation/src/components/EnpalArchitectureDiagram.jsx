import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * EnpalArchitectureDiagram — Cyclic architecture diagram showing internal data flows
 * Home Devices → IoT Hub → EMQX → Cloud Ingestion → Databricks → Streaming Aggregates
 * Control loop: VPP Controller → HEMS → Local HEMS → Devices (WISH protocol)
 * External: §14a devices, Smart Meters (Meterfy), Flexor via Event Hub
 */

// Nodes arranged in a rough cycle/ring layout
const NODES = [
  // Home layer (bottom)
  { id: 'devices',     label: 'Home Devices',     sub: 'PV · Battery · Heat Pump',  x: 0.12, y: 0.78, color: colors.solar,     icon: '⚡', w: 120, h: 52 },
  { id: 'local_hems',  label: 'Local HEMS',       sub: 'Conflict Resolution',       x: 0.12, y: 0.48, color: colors.success,   icon: '🏠', w: 110, h: 52 },
  { id: 'iot_hub',     label: 'IoT Hub',          sub: 'Edge Gateway',              x: 0.12, y: 0.18, color: colors.primary,   icon: '📡', w: 100, h: 52 },

  // Cloud ingestion (top)
  { id: 'emqx',        label: 'EMQX',             sub: 'MQTT Broker',               x: 0.33, y: 0.18, color: colors.primary,   icon: '⇋',  w: 100, h: 52 },
  { id: 'ingestion',   label: 'Data Ingestion',   sub: 'Protobuf · 20s intervals',  x: 0.54, y: 0.18, color: colors.secondary, icon: '📥', w: 120, h: 52 },

  // Databricks pipeline (right side)
  { id: 'databricks',  label: 'Databricks',       sub: 'Raw → Bronze → Silver → Gold', x: 0.78, y: 0.18, color: '#FF3621',     icon: '🧱', w: 130, h: 52 },
  { id: 'spark',       label: 'Spark Streaming',  sub: 'Aggregates · Low Latency',  x: 0.78, y: 0.48, color: '#E25A1C',        icon: '🔥', w: 130, h: 52 },

  // Control / VPP (bottom right)
  { id: 'vpp',         label: 'VPP Controller',   sub: 'Kubernetes',                x: 0.78, y: 0.78, color: colors.primary,   icon: '🎛', w: 120, h: 52 },

  // External integrations (positioned near relevant nodes)
  { id: 'flexor',      label: 'Flexor',           sub: 'via Event Hub',             x: 0.54, y: 0.48, color: colors.accent,    icon: '🔗', w: 100, h: 46 },
  { id: 'meter',       label: 'Meterfy',          sub: 'Smart Meters',              x: 0.33, y: 0.78, color: colors.textMuted, icon: '📊', w: 100, h: 46 },
  { id: 'p14a',        label: '§14a Devices',     sub: 'Grid Regulation',           x: 0.33, y: 0.48, color: colors.textMuted, icon: '📋', w: 110, h: 46 },
];

// Edges define the data flow cycle + external connections
const EDGES = [
  // Main cycle (clockwise): Devices → IoT Hub → EMQX → Ingestion → Databricks → Spark → VPP → HEMS → Devices
  { from: 'devices',    to: 'local_hems',  label: '',                  color: colors.success,   rate: 1.5 },
  { from: 'local_hems', to: 'iot_hub',     label: 'WISH Protocol',    color: colors.success,   rate: 1.5 },
  { from: 'iot_hub',    to: 'emqx',        label: 'MQTT',             color: colors.primary,   rate: 1 },
  { from: 'emqx',       to: 'ingestion',   label: 'Protobuf',         color: colors.secondary, rate: 1 },
  { from: 'ingestion',  to: 'databricks',  label: 'Static + Telemetry', color: colors.secondary, rate: 1.2 },
  { from: 'databricks', to: 'spark',       label: 'Streaming',        color: '#E25A1C',        rate: 1 },
  { from: 'spark',      to: 'vpp',         label: 'Patterns · Alerts', color: colors.primary,  rate: 1.5 },
  { from: 'vpp',        to: 'local_hems',  label: 'Dispatch',         color: colors.primary,   rate: 2, dash: true },

  // External data sources
  { from: 'meter',      to: 'iot_hub',     label: '',                  color: colors.textMuted, rate: 3 },
  { from: 'p14a',       to: 'local_hems',  label: '',                  color: colors.textMuted, rate: 4 },

  // Flexor cloud integration
  { from: 'spark',      to: 'flexor',      label: 'Event Hub',        color: colors.accent,    rate: 3 },
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

      // Compute angle and exit from node boundary
      const dx = tc.cx - fc.cx;
      const dy = tc.cy - fc.cy;
      const angle = Math.atan2(dy, dx);

      // Simplified: exit from center, offset by half-width/height along angle
      const fw = from.w / 2, fh = from.h / 2;
      const tw = to.w / 2, th = to.h / 2;

      const fOffX = Math.cos(angle) * fw;
      const fOffY = Math.sin(angle) * fh;
      const tOffX = Math.cos(angle) * tw;
      const tOffY = Math.sin(angle) * th;

      return {
        fx: fc.cx + fOffX * 0.9,
        fy: fc.cy + fOffY * 0.9,
        tx: tc.cx - tOffX * 0.9,
        ty: tc.cy - tOffY * 0.9,
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
          size: 2.5 + Math.random() * 1.5,
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

      // Draw edges
      EDGES.forEach((edge) => {
        const { fx, fy, tx, ty } = edgeEndpoints(edge);

        ctx.beginPath();
        ctx.strokeStyle = (edge.color || colors.primary) + '30';
        ctx.lineWidth = 1.5;
        if (edge.dash) {
          ctx.setLineDash([6, 4]);
        }
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        // Arrow head
        const angle = Math.atan2(ty - fy, tx - fx);
        const arrowSize = 6;
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
          ctx.font = '8px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillStyle = colors.textDim + '90';
          // Offset label perpendicular to edge
          const perpX = -Math.sin(angle) * 10;
          const perpY = Math.cos(angle) * 10;
          ctx.fillText(edge.label, mx + perpX, my + perpY);
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
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Trail
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

        // Node box
        ctx.fillStyle = colors.surface + 'ee';
        ctx.strokeStyle = node.color + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(nx, ny, node.w, node.h, 8);
        ctx.fill();
        ctx.stroke();

        // Glow
        ctx.shadowBlur = 10 * pulse;
        ctx.shadowColor = node.color + '40';
        ctx.beginPath();
        ctx.roundRect(nx, ny, node.w, node.h, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Icon
        ctx.font = '15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.icon, nx + node.w / 2, ny + 18);

        // Label
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillStyle = node.color;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx + node.w / 2, ny + 32);

        // Sub-label
        ctx.font = '8px JetBrains Mono';
        ctx.fillStyle = colors.textDim + 'aa';
        ctx.fillText(node.sub, nx + node.w / 2, ny + 44);
      });

      // Section labels
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'left';

      // Home section label
      ctx.fillStyle = colors.success + '50';
      ctx.fillText('HOME SYSTEM', 8, height * 0.12);

      // Cloud section label
      ctx.fillStyle = colors.primary + '50';
      ctx.fillText('CLOUD PLATFORM', width * 0.30, height * 0.12);

      // Data pipeline label
      ctx.fillStyle = '#E25A1C50';
      ctx.textAlign = 'right';
      ctx.fillText('DATA PIPELINE', width - 8, height * 0.12);

      // Control loop annotation (subtle curved arrow hint)
      ctx.fillStyle = colors.primary + '40';
      ctx.font = '8px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillText('CONTROL LOOP ↻', width * 0.47, height * 0.92);

      // Measurement frequency annotation
      ctx.fillStyle = colors.secondary + '50';
      ctx.font = '8px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.fillText('TELEMETRY EVERY 20s', width - 8, height * 0.92);

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
