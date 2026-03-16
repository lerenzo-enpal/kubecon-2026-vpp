import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * VPPArchitecture — Animated architecture diagram showing command/telemetry flow
 * Energy Market → Trader (Entrix) → VPP Controller → Kafka → Enpal Cloud → IoT Homes
 */

const NODES = [
  { id: 'market',     label: 'Energy Market',   sub: 'FCR / aFRR',        x: 0.04,  y: 0.5,  color: colors.accent },
  { id: 'trader',     label: 'Market Trader',   sub: 'Entrix',            x: 0.22,  y: 0.5,  color: colors.accent },
  { id: 'controller', label: 'VPP Controller',  sub: 'Kubernetes',        x: 0.40,  y: 0.5,  color: colors.primary },
  { id: 'kafka',      label: 'Kafka',           sub: 'Event Bus',         x: 0.58,  y: 0.5,  color: colors.secondary },
  { id: 'enpal',      label: 'Enpal Cloud',     sub: 'Device Mgmt',      x: 0.74,  y: 0.5,  color: colors.success },
];

const HOMES = [
  { id: 'home1', label: 'Home 1', x: 0.92, y: 0.20 },
  { id: 'home2', label: 'Home 2', x: 0.92, y: 0.50 },
  { id: 'home3', label: 'Home 3', x: 0.92, y: 0.80 },
];

const EDGES = [
  // Command flow (left → right)
  { from: 'market',     to: 'trader',     protocol: '',      rateMul: 2 },
  { from: 'trader',     to: 'controller', protocol: '',      rateMul: 2 },
  { from: 'controller', to: 'kafka',      protocol: 'Kafka', rateMul: 1 },
  { from: 'kafka',      to: 'enpal',      protocol: 'Kafka', rateMul: 1 },
  { from: 'enpal',      to: 'home1',      protocol: 'MQTT',  rateMul: 3 },
  { from: 'enpal',      to: 'home2',      protocol: 'MQTT',  rateMul: 3 },
  { from: 'enpal',      to: 'home3',      protocol: 'MQTT',  rateMul: 3 },
  // Telemetry flow (right → left)
  { from: 'home1',      to: 'enpal',      protocol: '',      rateMul: 3 },
  { from: 'home2',      to: 'enpal',      protocol: '',      rateMul: 3 },
  { from: 'home3',      to: 'enpal',      protocol: '',      rateMul: 3 },
  { from: 'enpal',      to: 'kafka',      protocol: '',      rateMul: 1 },
  { from: 'kafka',      to: 'controller', protocol: '',      rateMul: 1 },
  { from: 'controller', to: 'trader',     protocol: '',      rateMul: 2 },
  { from: 'trader',     to: 'market',     protocol: '',      rateMul: 8 },
];

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

    const nodeW = 130, nodeH = 56;
    const homeW = 66, homeH = 44;

    const particles = [];
    const BASE_INTERVAL = 0.3;
    const edgeLastSpawn = EDGES.map(() => 0);

    function spawnParticles(now) {
      EDGES.forEach((edge, ei) => {
        const interval = BASE_INTERVAL * (edge.rateMul || 1);
        if (now - edgeLastSpawn[ei] < interval) return;
        edgeLastSpawn[ei] = now;
        const from = getNode(edge.from);
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
      ctx.strokeStyle = colors.surfaceLight + '10';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 30) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 30) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // Edge point calculation
      function edgePoints(edge) {
        const from = getNode(edge.from);
        const to = getNode(edge.to);
        const isFromHome = from.id.startsWith('home');
        const isToHome = to.id.startsWith('home');
        const fromW = isFromHome ? homeW : nodeW;
        const toW = isToHome ? homeW : nodeW;

        const goingRight = from.x < to.x;
        let fx, fy, tx, ty;
        if (goingRight) {
          fx = from.x * width + fromW;
          tx = to.x * width;
        } else {
          fx = from.x * width;
          tx = to.x * width + toW;
        }
        fy = from.y * height;
        ty = to.y * height;
        return { fx, fy, tx, ty, isToHome, isFromHome };
      }

      // Draw edges (once per bidirectional pair)
      const drawnLines = new Set();
      EDGES.forEach((edge) => {
        const lineKey = [edge.from, edge.to].sort().join('-');
        if (drawnLines.has(lineKey)) return;
        drawnLines.add(lineKey);

        const { fx, fy, tx, ty, isToHome, isFromHome } = edgePoints(edge);
        const from = getNode(edge.from);
        const isHome = isToHome || isFromHome;

        ctx.beginPath();
        ctx.strokeStyle = (from.color || colors.primary) + '25';
        ctx.lineWidth = 1.5;
        if (isHome) ctx.setLineDash([4, 4]);
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        // Protocol label
        if (edge.protocol) {
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2;
          const angle = Math.atan2(ty - fy, tx - fx);
          const perpX = -Math.sin(angle) * 10;
          const perpY = Math.cos(angle) * 10;
          ctx.font = '8px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillStyle = colors.textDim + '70';
          ctx.fillText(edge.protocol, mx + perpX, my + perpY);
        }
      });

      // Spawn and draw particles
      if (isActive) spawnParticles(now);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (isActive) p.progress += p.speed;
        if (p.progress > 1) { particles.splice(i, 1); continue; }

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
        const tp = Math.max(0, p.progress - 0.08);
        const tpx = fx + (tx - fx) * tp;
        const tpy = fy + (ty - fy) * tp;
        ctx.beginPath();
        ctx.moveTo(tpx, tpy);
        ctx.lineTo(px, py);
        ctx.strokeStyle = p.color + '50';
        ctx.lineWidth = p.size * 0.8;
        ctx.stroke();
      }

      // Draw main nodes
      NODES.forEach((node) => {
        const nx = node.x * width;
        const ny = node.y * height - nodeH / 2;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2 + node.x * 10);

        // Node box
        ctx.fillStyle = colors.surface + 'ee';
        ctx.strokeStyle = node.color + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(nx, ny, nodeW, nodeH, 8);
        ctx.fill();
        ctx.stroke();

        // Colored accent line at top
        ctx.fillStyle = node.color + '90';
        ctx.beginPath();
        ctx.roundRect(nx, ny, nodeW, 2.5, [8, 8, 0, 0]);
        ctx.fill();

        // Glow
        ctx.shadowBlur = 12 * pulse;
        ctx.shadowColor = node.color + '40';
        ctx.beginPath();
        ctx.roundRect(nx, ny, nodeW, nodeH, 8);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = 'bold 11px JetBrains Mono';
        ctx.fillStyle = node.color;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx + nodeW / 2, ny + 24);

        // Sub-label
        ctx.font = '9px JetBrains Mono';
        ctx.fillStyle = colors.textDim + 'aa';
        ctx.fillText(node.sub, nx + nodeW / 2, ny + 40);
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

        // Accent line
        ctx.fillStyle = colors.success + '90';
        ctx.beginPath();
        ctx.roundRect(hx, hy, homeW, 2, [6, 6, 0, 0]);
        ctx.fill();

        // Glow
        ctx.shadowBlur = 8 * pulse;
        ctx.shadowColor = colors.success + '30';
        ctx.beginPath();
        ctx.roundRect(hx, hy, homeW, homeH, 6);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = 'bold 9px JetBrains Mono';
        ctx.fillStyle = colors.success;
        ctx.textAlign = 'center';
        ctx.fillText(home.label, hx + homeW / 2, hy + 27);
      });

      // Flow direction labels
      ctx.font = 'bold 9px JetBrains Mono';
      ctx.fillStyle = colors.accent + '50';
      ctx.textAlign = 'left';
      ctx.fillText('COMMANDS \u2192', 10, 18);
      ctx.fillStyle = colors.success + '50';
      ctx.textAlign = 'right';
      ctx.fillText('\u2190 TELEMETRY', width - 10, 18);

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
