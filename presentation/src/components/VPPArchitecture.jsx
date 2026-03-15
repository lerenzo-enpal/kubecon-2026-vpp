import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * VPPArchitecture — Animated architecture diagram showing data/command flow
 * Energy Market → Trader (Entrix) → VPP Controller → Kafka → Enpal Cloud → MQTT → IoT Homes
 */

const NODES = [
  { id: 'market',     label: 'Energy Market',    sub: 'FCR / aFRR',      x: 0.08,  y: 0.5,  color: colors.accent,    icon: '⚡' },
  { id: 'trader',     label: 'Market Trader',     sub: 'Entrix',           x: 0.25,  y: 0.5,  color: colors.accent,    icon: '📊' },
  { id: 'controller', label: 'VPP Controller',    sub: 'Kubernetes',       x: 0.42,  y: 0.5,  color: colors.primary,   icon: '🎛' },
  { id: 'kafka',      label: 'Kafka',             sub: 'Event Bus',        x: 0.59,  y: 0.5,  color: colors.secondary, icon: '⇋' },
  { id: 'enpal',      label: 'Enpal Cloud',       sub: 'Device Management', x: 0.76, y: 0.5,  color: colors.success,   icon: '☁' },
];

const HOMES = [
  { id: 'home1', label: 'Home', x: 0.93, y: 0.22 },
  { id: 'home2', label: 'Home', x: 0.93, y: 0.50 },
  { id: 'home3', label: 'Home', x: 0.93, y: 0.78 },
];

// rateMul: multiplier on base interval (higher = slower). Edges share a drawn line if they overlap.
const EDGES = [
  // Command flow (left → right)
  { from: 'market',     to: 'trader',     protocol: '',     rateMul: 2 },   // 1/2 base rate
  { from: 'trader',     to: 'controller', protocol: '',     rateMul: 2 },   // 1/2 base rate
  { from: 'controller', to: 'kafka',      protocol: 'Kafka', rateMul: 1 },  // full rate
  { from: 'kafka',      to: 'enpal',      protocol: 'Kafka', rateMul: 1 },  // full rate
  { from: 'enpal',      to: 'home1',      protocol: 'MQTT', rateMul: 3 },   // 1/3 rate per home
  { from: 'enpal',      to: 'home2',      protocol: 'MQTT', rateMul: 3 },
  { from: 'enpal',      to: 'home3',      protocol: 'MQTT', rateMul: 3 },
  // Telemetry flow (right → left)
  { from: 'home1',      to: 'enpal',      protocol: '',     rateMul: 3 },   // 1/3 rate per home
  { from: 'home2',      to: 'enpal',      protocol: '',     rateMul: 3 },
  { from: 'home3',      to: 'enpal',      protocol: '',     rateMul: 3 },
  { from: 'enpal',      to: 'kafka',      protocol: '',     rateMul: 1 },   // full rate
  { from: 'kafka',      to: 'controller', protocol: '',     rateMul: 1 },   // full rate
  { from: 'controller', to: 'trader',     protocol: '',     rateMul: 2 },   // same as trader→controller
  { from: 'trader',     to: 'market',     protocol: '',     rateMul: 8 },   // 1/4 of market→trader
];

// Track which node pairs already have a line drawn (avoid drawing twice for bidirectional)
const DRAWN_LINES = new Set();

function getNode(id) {
  return NODES.find(n => n.id === id) || HOMES.find(h => h.id === id);
}

export default function VPPArchitecture({ width = 960, height = 440 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const nodeW = 110, nodeH = 64;
    const homeW = 60, homeH = 46;

    // Particles flowing along edges — per-edge spawn timers
    const particles = [];
    const BASE_INTERVAL = 0.3;
    const edgeLastSpawn = EDGES.map(() => 0);

    function spawnParticles(now) {
      EDGES.forEach((edge, ei) => {
        const interval = BASE_INTERVAL * (edge.rateMul || 1);
        if (now - edgeLastSpawn[ei] < interval) return;
        edgeLastSpawn[ei] = now;
        const from = getNode(edge.from);
        // Telemetry (right→left) uses dimmer green; commands use source color
        const isReverse = NODES.findIndex(n => n.id === edge.from) > NODES.findIndex(n => n.id === edge.to)
          || edge.from.startsWith('home');
        particles.push({
          edge: ei,
          progress: 0,
          speed: 0.012 + Math.random() * 0.005,
          color: isReverse ? colors.success : (from.color || colors.primary),
          size: isReverse ? 2.5 + Math.random() * 1.5 : 3 + Math.random() * 2,
        });
      });
    }

    function draw() {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now() / 1000;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = colors.surfaceLight + '15';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 30) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 30) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // Helper: compute edge start/end points
      // For left→right: right side of 'from' to left side of 'to'
      // For right→left: left side of 'from' to right side of 'to'
      function edgePoints(edge) {
        const from = getNode(edge.from);
        const to = getNode(edge.to);
        const isFromHome = from.id.startsWith('home');
        const isToHome = to.id.startsWith('home');
        const fromW = isFromHome ? homeW : nodeW;
        const toW = isToHome ? homeW : nodeW;

        // Determine direction based on x position
        const goingRight = from.x < to.x;
        let fx, fy, tx, ty;
        if (goingRight) {
          fx = from.x * width + fromW; // right edge
          tx = to.x * width;           // left edge
        } else {
          fx = from.x * width;         // left edge
          tx = to.x * width + toW;     // right edge
        }
        fy = from.y * height;
        ty = to.y * height;
        return { fx, fy, tx, ty, isToHome, isFromHome };
      }

      // Draw edges — only draw each line once for bidirectional pairs
      const drawnLines = new Set();
      EDGES.forEach((edge) => {
        const lineKey = [edge.from, edge.to].sort().join('-');
        if (drawnLines.has(lineKey)) return;
        drawnLines.add(lineKey);

        const { fx, fy, tx, ty, isToHome, isFromHome } = edgePoints(edge);
        const from = getNode(edge.from);
        const isHome = isToHome || isFromHome;

        ctx.beginPath();
        ctx.strokeStyle = (from.color || colors.primary) + '30';
        ctx.lineWidth = 1.5;
        if (isHome) {
          ctx.setLineDash([4, 4]);
        }
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        // Protocol label
        if (edge.protocol) {
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2;
          ctx.font = '9px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillStyle = colors.textDim + '80';
          ctx.fillText(edge.protocol, mx, my - 8);
        }
      });

      // Spawn and draw particles
      if (isActive) spawnParticles(now);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (isActive) p.progress += p.speed;

        if (p.progress > 1) {
          particles.splice(i, 1);
          continue;
        }

        const edge = EDGES[p.edge];
        const { fx, fy, tx, ty } = edgePoints(edge);

        const px = fx + (tx - fx) * p.progress;
        const py = fy + (ty - fy) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Trail
        const trailLen = 0.08;
        const tp = Math.max(0, p.progress - trailLen);
        const tpx = fx + (tx - fx) * tp;
        const tpy = fy + (ty - fy) * tp;
        ctx.beginPath();
        ctx.moveTo(tpx, tpy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = p.color + '60';
        ctx.lineWidth = p.size * 0.8;
        ctx.stroke();
      }

      // Draw nodes
      NODES.forEach((node) => {
        const nx = node.x * width;
        const ny = node.y * height - nodeH / 2;

        // Node box
        const pulse = 0.5 + 0.5 * Math.sin(now * 2 + node.x * 10);
        ctx.fillStyle = colors.surface + 'ee';
        ctx.strokeStyle = node.color + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        const r = 8;
        ctx.beginPath();
        ctx.roundRect(nx, ny, nodeW, nodeH, r);
        ctx.fill();
        ctx.stroke();

        // Subtle glow
        ctx.shadowBlur = 12 * pulse;
        ctx.shadowColor = node.color + '40';
        ctx.beginPath();
        ctx.roundRect(nx, ny, nodeW, nodeH, r);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Icon
        ctx.font = '18px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(node.icon, nx + nodeW / 2, ny + 22);

        // Label
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = node.color;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx + nodeW / 2, ny + 40);

        // Sub-label
        ctx.font = '9px JetBrains Mono';
        ctx.fillStyle = colors.textDim + 'aa';
        ctx.fillText(node.sub, nx + nodeW / 2, ny + 54);
      });

      // Draw homes
      HOMES.forEach((home, i) => {
        const hx = home.x * width;
        const hy = home.y * height - homeH / 2;

        const pulse = 0.5 + 0.5 * Math.sin(now * 2.5 + i * 2);
        ctx.fillStyle = colors.surface + 'ee';
        ctx.strokeStyle = colors.success + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(hx, hy, homeW, homeH, 6);
        ctx.fill();
        ctx.stroke();

        // House icon
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🏠', hx + homeW / 2, hy + 22);

        // Label
        ctx.font = '9px JetBrains Mono';
        ctx.fillStyle = colors.success;
        ctx.fillText(`Home ${i + 1}`, hx + homeW / 2, hy + 38);
      });

      // Flow direction labels at top
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = colors.accent + '60';
      ctx.textAlign = 'left';
      ctx.fillText('COMMANDS →', 10, 16);
      ctx.fillStyle = colors.success + '60';
      ctx.textAlign = 'right';
      ctx.fillText('← TELEMETRY', width - 10, 16);

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
