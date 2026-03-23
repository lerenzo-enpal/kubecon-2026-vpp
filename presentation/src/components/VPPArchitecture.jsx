import React, { useEffect, useRef, useContext, useState } from 'react';
import { SlideContext } from 'spectacle';
import { Corners } from './ui';
import { colors } from '../theme';

/**
 * VPPArchitecture — Animated architecture diagram showing command/telemetry flow
 * Energy Market → Trader (Entrix) → Flexa → Enpal Cloud → IoT Homes
 */

// Drawer info for each highlighted node (steps 1-3)
const DRAWER_INFO = [
  { nodeId: 'market', title: 'Energy Market', sub: 'Day-Ahead + Intraday', color: colors.accent,
    desc: 'Think of it as a stock market for electricity. Producers and consumers trade power in 15-minute blocks, a day ahead and in real time. VPPs participate by selling stored energy when prices are high and buying when they are low.',
    detail: 'Traded in 15-minute increments' },
  { nodeId: 'trader', title: 'Trading Gateway', sub: 'Entrix', color: colors.accent,
    desc: 'Algorithmic trading platform that bids aggregated battery capacity into wholesale energy markets. Entrix optimizes across day-ahead, intraday, and balancing markets.',
    detail: 'Optimizes across multiple market types' },
  { nodeId: 'controller', title: 'VPP Controller', sub: 'Flexa (Enpal + Entrix JV)', color: colors.primary,
    desc: 'The orchestration brain. Flexa receives market commitments and decides which distributed assets respond, when, and how — dispatching commands to thousands of homes in real time.',
    detail: 'Market signal to device in <2 seconds' },
];

const NODES = [
  { id: 'market',     label: 'Energy Market',   sub: 'Day-Ahead',         x: 0.03,  y: 0.42,  color: colors.accent },
  { id: 'trader',     label: 'Trading Gateway',  sub: 'Entrix',            x: 0.22,  y: 0.42,  color: colors.accent },
  { id: 'controller', label: 'VPP Controller',   sub: 'Flexa',             x: 0.42,  y: 0.42,  color: colors.primary },
  { id: 'enpal',      label: 'Enpal Cloud',     sub: 'Fleet Mgmt',       x: 0.62,  y: 0.42,  color: colors.success },
];

const HOMES = [
  { id: 'home1', label: 'Home', x: 0.84, y: 0.15 },
  { id: 'home2', label: 'Home', x: 0.84, y: 0.38 },
  { id: 'home3', label: 'Home', x: 0.84, y: 0.62 },
  { id: 'home4', label: 'Home', x: 0.84, y: 0.85 },
];

const EDGES = [
  // Command flow (left → right)
  { from: 'market',     to: 'trader',     protocol: '',       rateMul: 2 },
  { from: 'trader',     to: 'controller', protocol: '',       rateMul: 2 },
  { from: 'controller', to: 'enpal',      protocol: '',       rateMul: 1 },
  { from: 'enpal',      to: 'home1',      protocol: 'MQTT',   rateMul: 3 },
  { from: 'enpal',      to: 'home2',      protocol: 'MQTT',   rateMul: 3 },
  { from: 'enpal',      to: 'home3',      protocol: 'MQTT',   rateMul: 3 },
  { from: 'enpal',      to: 'home4',      protocol: 'MQTT',   rateMul: 3 },
  // Telemetry flow (right → left)
  { from: 'home1',      to: 'enpal',      protocol: '',       rateMul: 3 },
  { from: 'home2',      to: 'enpal',      protocol: '',       rateMul: 3 },
  { from: 'home3',      to: 'enpal',      protocol: '',       rateMul: 3 },
  { from: 'home4',      to: 'enpal',      protocol: '',       rateMul: 3 },
  { from: 'enpal',      to: 'controller', protocol: '',       rateMul: 1 },
  { from: 'controller', to: 'trader',     protocol: '',       rateMul: 2 },
  { from: 'trader',     to: 'market',     protocol: '',       rateMul: 8 },
];

// Deterministic star positions for night sky
const STARS = Array.from({ length: 30 }, (_, i) => {
  const hash = (n) => { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x); };
  return {
    x: hash(i * 127.1 + 311.7),
    y: 0.02 + hash(i * 269.5 + 183.3) * 0.11,
    size: 0.8 + hash(i * 419.2 + 71.9) * 1.5,
    twinkleSpeed: 1.5 + hash(i * 631.2 + 97.1) * 3,
    twinkleOffset: hash(i * 523.7 + 43.3) * Math.PI * 2,
  };
});

const ALL_NODES = [...NODES, ...HOMES];
const NODE_MAP = new Map(ALL_NODES.map(n => [n.id, n]));
function getNode(id) { return NODE_MAP.get(id); }

export default function VPPArchitecture({ highlightStep = 0 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const moonCanvasRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const highlightRef = useRef(highlightStep);
  highlightRef.current = highlightStep;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    const ctx = canvas.getContext('2d');
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    // Content area — leave room for title overlay at top
    const padTop = height * 0.13;
    const contentH = height * 0.82;
    const mapY = (frac) => padTop + frac * contentH;

    const nodeW = 172, nodeH = 66;
    const homeW = 56, homeH = 52;

    const particles = [];
    const BASE_INTERVAL = 0.3;
    const startTime = performance.now() / 1000;
    const edgeLastSpawn = EDGES.map(() => startTime);

    function spawnParticles(now) {
      EDGES.forEach((edge, ei) => {
        const interval = BASE_INTERVAL * (edge.rateMul || 1);
        // If gap is too large (e.g. tab was hidden), reset to now — prevents burst
        if (now - edgeLastSpawn[ei] > interval * 3) edgeLastSpawn[ei] = now;
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
          size: isReverse ? 3 + Math.random() * 2 : 3.5 + Math.random() * 2.5,
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
        fy = mapY(from.y);
        ty = mapY(to.y);
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
        ctx.lineWidth = 2;
        if (isHome) ctx.setLineDash([5, 5]);
        ctx.moveTo(fx, fy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.setLineDash([]);

        // Protocol label
        if (edge.protocol) {
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2;
          const angle = Math.atan2(ty - fy, tx - fx);
          const perpX = -Math.sin(angle) * 12;
          const perpY = Math.cos(angle) * 12;
          ctx.font = '14px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillStyle = colors.textDim + '70';
          ctx.fillText(edge.protocol, mx + perpX, my + perpY);
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
        const { fx, fy, tx, ty } = edgePoints(edge);
        p._px = fx + (tx - fx) * p.progress;
        p._py = fy + (ty - fy) * p.progress;
        p._fx = fx; p._fy = fy; p._tx = tx; p._ty = ty;

        if (!particlesByColor[p.color]) particlesByColor[p.color] = [];
        particlesByColor[p.color].push(p);
      }

      // Draw particles batched by color — one shadow fill per group instead of per particle
      for (const [color, group] of Object.entries(particlesByColor)) {
        ctx.shadowBlur = 10;
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
          const tp = Math.max(0, p.progress - 0.08);
          const tpx = p._fx + (p._tx - p._fx) * tp;
          const tpy = p._fy + (p._ty - p._fy) * tp;
          ctx.beginPath();
          ctx.moveTo(tpx, tpy);
          ctx.lineTo(p._px, p._py);
          ctx.strokeStyle = color + '50';
          ctx.lineWidth = p.size * 0.8;
          ctx.stroke();
        }
      }

      // Draw main nodes
      NODES.forEach((node) => {
        const nx = node.x * width;
        const ny = mapY(node.y) - nodeH / 2;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2 + node.x * 10);

        // Node box
        ctx.fillStyle = colors.surface + 'ee';
        ctx.strokeStyle = node.color + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(nx, ny, nodeW, nodeH, 10);
        ctx.fill();
        ctx.stroke();

        // Colored accent line at top
        ctx.fillStyle = node.color + '90';
        ctx.beginPath();
        ctx.roundRect(nx, ny, nodeW, 3, [10, 10, 0, 0]);
        ctx.fill();

        // Glow
        ctx.shadowBlur = 14 * pulse;
        ctx.shadowColor = node.color + '40';
        ctx.beginPath();
        ctx.roundRect(nx, ny, nodeW, nodeH, 10);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Label
        ctx.font = 'bold 18px JetBrains Mono';
        ctx.fillStyle = node.color;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx + nodeW / 2, ny + 28);

        // Sub-label
        ctx.font = '14px JetBrains Mono';
        ctx.fillStyle = colors.text + 'dd';
        ctx.fillText(node.sub, nx + nodeW / 2, ny + 50);
      });

      // Highlight active node and draw connecting line to drawer
      const hs = highlightRef.current;
      if (hs >= 1 && hs <= DRAWER_INFO.length) {
        const info = DRAWER_INFO[hs - 1];
        const targetNode = NODES.find(n => n.id === info.nodeId);
        if (targetNode) {
          const nx = targetNode.x * width;
          const ny = mapY(targetNode.y) - nodeH / 2;

          // Highlight glow around active node
          ctx.shadowBlur = 20;
          ctx.shadowColor = info.color;
          ctx.strokeStyle = info.color + '80';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(nx - 3, ny - 3, nodeW + 6, nodeH + 6, 12);
          ctx.stroke();
          ctx.shadowBlur = 0;

          // Connecting line from node bottom to drawer area
          const lineStartX = nx + nodeW / 2;
          const lineStartY = ny + nodeH + 4;
          const drawerTop = height - 150;
          const lineEndX = lineStartX;
          const lineEndY = drawerTop;

          // Dashed line
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = info.color + '50';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(lineStartX, lineStartY);
          ctx.lineTo(lineEndX, lineEndY);
          ctx.stroke();
          ctx.setLineDash([]);

          // Dot at connection points
          ctx.fillStyle = info.color;
          ctx.beginPath();
          ctx.arc(lineStartX, lineStartY, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(lineEndX, lineEndY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // ── Unified clock ──────────────────────────────────────────────
      // See docs/vpp-animation-cycle.md for full spec
      // Default: 24s cycle = 1s per hour
      const CYCLE_SECONDS = 24;
      const hour = ((now % CYCLE_SECONDS) / CYCLE_SECONDS) * 24; // 0..24

      // Cosine ease helper (0→1 over [a,b])
      const smoothstep = (a, b, t) => {
        const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
        return x * x * (3 - 2 * x);
      };

      // Phase — aligned with sun/moon timing
      const phase = hour < 6.5 ? 'night-pull'
        : hour < 8.5 ? 'sunrise'
        : hour < 10.0 ? 'morning-peak'
        : hour < 14.0 ? 'charging'
        : hour < 17.0 ? 'pv-export'
        : hour < 19.0 ? 'sunset-discharge'
        : hour < 21.0 ? 'battery-discharge'
        : 'night-pull';

      // Sun alpha: 0 (down) → 1 (full)
      const sunAlpha = hour < 6.5 ? 0
        : hour < 8.5 ? smoothstep(6.5, 8.5, hour)
        : hour < 17.0 ? 1
        : hour < 21.0 ? 1 - smoothstep(17.0, 21.0, hour)
        : 0;

      // Moon alpha — appears well after sunset, gone before sunrise
      const moonAlpha = hour < 4.0 ? 1
        : hour < 6.0 ? 1 - smoothstep(4.0, 6.0, hour)
        : hour < 22.0 ? 0
        : hour < 23.5 ? smoothstep(22.0, 23.5, hour)
        : 1;
      // Battery level — charges during sun, drains once sun is mostly set, empty by 21h
      const BAT_MIN = 0.08;
      const batteryLevel = hour < 10.0 ? BAT_MIN
        : hour < 14.0 ? BAT_MIN + (1 - BAT_MIN) * ((hour - 10) / 4)
        : hour < 20.0 ? 1.0
        : hour < 21.0 ? Math.max(BAT_MIN, 1.0 - (1 - BAT_MIN) * ((hour - 20.0) / 1))
        : BAT_MIN;

      // Cable flow direction — once battery is empty, pull from grid
      const batteryEmpty = batteryLevel <= BAT_MIN + 0.02;
      const isExporting = (phase === 'pv-export' || phase === 'sunset-discharge' || phase === 'battery-discharge') && !batteryEmpty;
      const isPulling = phase === 'night-pull' || phase === 'sunrise' || batteryEmpty;
      const isCharging = phase === 'charging';
      const isDay = sunAlpha > 0.5;

      const electricYellow = '#fbbf24';

      // Sun with vertical arc — rises and sets
      {
        const sunX = width - 55;
        const sunY = 55;       // fixed position — fades in/out only
        const sunR = 16;
        ctx.save();
        ctx.globalAlpha = sunAlpha * 0.7;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f59e0b';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        for (let r = 0; r < 8; r++) {
          const angle = (r / 8) * Math.PI * 2 + now * 0.05;
          const innerR = sunR + 5;
          const outerR = sunR + 14 + (r % 2 === 0 ? 6 : 0);
          ctx.beginPath();
          ctx.moveTo(sunX + Math.cos(angle) * innerR, sunY + Math.sin(angle) * innerR);
          ctx.lineTo(sunX + Math.cos(angle) * outerR, sunY + Math.sin(angle) * outerR);
          ctx.stroke();
        }
        ctx.restore();
      }

      // Stars — sparkle in as sun sets, fade out at sunrise
      {
        const starAlpha = 1 - sunAlpha;
        if (starAlpha > 0.01) {
          STARS.forEach((star) => {
            const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.twinkleOffset));
            const alpha = starAlpha * twinkle;
            const sx = star.x * width;
            const sy = star.y * height;

            ctx.save();
            ctx.globalAlpha = alpha * 0.85;
            ctx.fillStyle = '#e2e8f0';

            // Star dot — no shadowBlur (shapes too small for visible glow)
            ctx.beginPath();
            ctx.arc(sx, sy, star.size * (1 + twinkle * 0.3), 0, Math.PI * 2);
            ctx.fill();

            // Cross sparkle for larger stars
            if (star.size > 1.6) {
              ctx.strokeStyle = '#e2e8f0';
              ctx.lineWidth = 0.6;
              ctx.globalAlpha = alpha * 0.35;
              const sparkleLen = star.size * 1.5 + star.size * 0.8 * Math.sin(now * star.twinkleSpeed * 1.3 + star.twinkleOffset);
              ctx.beginPath();
              ctx.moveTo(sx - sparkleLen, sy);
              ctx.lineTo(sx + sparkleLen, sy);
              ctx.moveTo(sx, sy - sparkleLen);
              ctx.lineTo(sx, sy + sparkleLen);
              ctx.stroke();
            }

            ctx.restore();
          });
        }
      }

      // Moon crescent — rendered on offscreen canvas to avoid compositing bleed
      {
        if (moonAlpha > 0.01) {
          const moonX = width - 55;
          const moonY = 50;        // fixed position — fades in/out only
          const moonR = 13;
          const buf = moonR + 16; // buffer for glow
          const size = buf * 2;
          // Draw crescent on offscreen canvas
          if (!moonCanvasRef.current) {
            moonCanvasRef.current = document.createElement('canvas');
          }
          const off = moonCanvasRef.current;
          off.width = size * 2; off.height = size * 2;
          const oc = off.getContext('2d');
          oc.scale(2, 2);
          // Moon disc
          oc.beginPath();
          oc.arc(buf, buf, moonR, 0, Math.PI * 2);
          oc.fillStyle = '#c8d0db';
          oc.fill();
          // Cut out crescent
          oc.globalCompositeOperation = 'destination-out';
          oc.beginPath();
          oc.arc(buf + 6, buf - 2, moonR * 0.82, 0, Math.PI * 2);
          oc.fill();
          // Stamp onto main canvas
          ctx.save();
          ctx.globalAlpha = moonAlpha * 0.65;
          ctx.shadowBlur = 14;
          ctx.shadowColor = '#94a3b8';
          ctx.drawImage(off, moonX - buf, moonY - buf, size, size);
          ctx.shadowBlur = 0;
          ctx.restore();
        }
      }

      // ── HIDDEN: Analog clock overlay ──────────────────────────────
      // DO NOT DELETE — intentionally kept for future use.
      // To re-enable, set SHOW_CLOCK = true. Renders an analog clock
      // with digital readout showing the simulated hour, positioned at
      // (width - 255, 55) — left of the sun, same Y level.
      const SHOW_CLOCK = false;
      if (SHOW_CLOCK) {
        const clkX = width - 255;
        const clkY = 55;
        const clkR = 22;
        const h12 = hour % 12;
        const minuteFrac = (hour % 1);

        ctx.save();
        ctx.beginPath();
        ctx.arc(clkX, clkY, clkR, 0, Math.PI * 2);
        ctx.fillStyle = colors.surface + 'cc';
        ctx.fill();
        ctx.strokeStyle = colors.textDim + '50';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        for (let t = 0; t < 12; t++) {
          const a = (t / 12) * Math.PI * 2 - Math.PI / 2;
          const inner = t % 3 === 0 ? clkR - 6 : clkR - 4;
          ctx.beginPath();
          ctx.moveTo(clkX + Math.cos(a) * inner, clkY + Math.sin(a) * inner);
          ctx.lineTo(clkX + Math.cos(a) * (clkR - 2), clkY + Math.sin(a) * (clkR - 2));
          ctx.strokeStyle = colors.textDim + '60';
          ctx.lineWidth = t % 3 === 0 ? 1.5 : 0.8;
          ctx.stroke();
        }

        const hAngle = (h12 / 12) * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(clkX, clkY);
        ctx.lineTo(clkX + Math.cos(hAngle) * (clkR * 0.5), clkY + Math.sin(hAngle) * (clkR * 0.5));
        ctx.strokeStyle = colors.text + 'cc';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        const mAngle = minuteFrac * Math.PI * 2 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(clkX, clkY);
        ctx.lineTo(clkX + Math.cos(mAngle) * (clkR * 0.72), clkY + Math.sin(mAngle) * (clkR * 0.72));
        ctx.strokeStyle = colors.text + '99';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(clkX, clkY, 2, 0, Math.PI * 2);
        ctx.fillStyle = colors.primary;
        ctx.fill();

        const dispH = Math.floor(hour);
        const dispM = Math.floor(minuteFrac * 60);
        ctx.font = '10px JetBrains Mono';
        ctx.textAlign = 'center';
        ctx.fillStyle = colors.textDim + '80';
        ctx.fillText(
          String(dispH).padStart(2, '0') + ':' + String(dispM).padStart(2, '0'),
          clkX, clkY + clkR + 12
        );

        ctx.restore();
      }

      // Draw homes with PV, battery, underground grid
      HOMES.forEach((home, i) => {
        const cx = home.x * width + homeW / 2;
        const cy = mapY(home.y);
        const hw = homeW / 2;
        const roofH = 18;
        const bodyH = 28;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2.5 + i * 2);

        // Underground grid cable — goes down from house then right off edge
        const cableDropY = cy + bodyH / 2 + 32;
        const cableRightX = cx + hw;
        const cableColor = isPulling ? colors.primary : electricYellow;
        ctx.beginPath();
        ctx.moveTo(cableRightX, cy + bodyH / 2);
        ctx.lineTo(cableRightX, cableDropY);
        ctx.lineTo(width + 20, cableDropY);
        ctx.strokeStyle = cableColor + '25';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Underground glow
        ctx.beginPath();
        ctx.moveTo(cableRightX, cableDropY);
        ctx.lineTo(width + 20, cableDropY);
        ctx.strokeStyle = cableColor + '10';
        ctx.lineWidth = 7;
        ctx.shadowBlur = 8;
        ctx.shadowColor = cableColor + '30';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Animated electricity particles on L-shaped cable path
        // Path: house base (cableRightX, cy+bodyH/2) → down to (cableRightX, cableDropY) → right to (width+20, cableDropY)
        const hasFlow = isExporting || isPulling;
        const elecAlpha = hasFlow ? 0.85 : 0.15;
        const vertLen = cableDropY - (cy + bodyH / 2);
        const horizLen = width + 20 - cableRightX;
        const totalLen = vertLen + horizLen;
        const vertFrac = vertLen / totalLen; // fraction of path that is vertical
        ctx.shadowBlur = hasFlow ? 6 : 2;
        ctx.shadowColor = cableColor;
        ctx.fillStyle = cableColor;
        ctx.globalAlpha = elecAlpha;
        ctx.beginPath();
        for (let ep = 0; ep < 4; ep++) {
          const baseP = ((now * 0.25 + ep * 0.25 + i * 0.13) % 1 + 1) % 1;
          // t: 0 = grid edge, 1 = house. Pulling = grid→house, exporting = house→grid
          const t = isPulling ? baseP : 1 - baseP;
          let epx, epy;
          if (t > 1 - vertFrac) {
            // Vertical segment (near house)
            const vt = (t - (1 - vertFrac)) / vertFrac; // 0 at bottom, 1 at house
            epx = cableRightX;
            epy = cableDropY - vt * vertLen;
          } else {
            // Horizontal segment
            const ht = t / (1 - vertFrac); // 0 at grid edge, 1 at corner
            epx = width + 20 - ht * horizLen;
            epy = cableDropY;
          }
          ctx.moveTo(epx + 2, epy);
          ctx.arc(epx, epy, 2, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // House body
        ctx.beginPath();
        ctx.moveTo(cx, cy - roofH - bodyH / 2);
        ctx.lineTo(cx + hw + 5, cy - bodyH / 2);
        ctx.lineTo(cx + hw, cy - bodyH / 2);
        ctx.lineTo(cx + hw, cy + bodyH / 2);
        ctx.lineTo(cx - hw, cy + bodyH / 2);
        ctx.lineTo(cx - hw, cy - bodyH / 2);
        ctx.lineTo(cx - hw - 5, cy - bodyH / 2);
        ctx.closePath();
        ctx.fillStyle = colors.surface + 'ee';
        ctx.fill();
        ctx.strokeStyle = colors.success + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 10 * pulse;
        ctx.shadowColor = colors.success + '30';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // PV panel — on right roof slope
        const roofPeakX = cx;
        const roofPeakY = cy - roofH - bodyH / 2;
        const roofBaseX = cx + hw + 5;
        const roofBaseY = cy - bodyH / 2;
        const roofAngle = Math.atan2(roofBaseY - roofPeakY, roofBaseX - roofPeakX);
        const pvX = roofPeakX + (roofBaseX - roofPeakX) * 0.5;
        const pvY = roofPeakY + (roofBaseY - roofPeakY) * 0.5;
        const pvW = 22;
        const pvH = 10;
        ctx.save();
        ctx.translate(pvX, pvY);
        ctx.rotate(roofAngle);
        // Panel body
        const pvGlow = sunAlpha * 0.4;
        ctx.fillStyle = `rgba(59, 130, 246, ${0.5 + pvGlow})`;
        ctx.fillRect(-pvW / 2, -pvH / 2, pvW, pvH);
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.7 + pvGlow})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-pvW / 2, -pvH / 2, pvW, pvH);
        // Panel cell grid
        ctx.strokeStyle = `rgba(59, 130, 246, 0.3)`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(-pvW / 2, 0); ctx.lineTo(pvW / 2, 0);
        ctx.moveTo(-pvW / 6, -pvH / 2); ctx.lineTo(-pvW / 6, pvH / 2);
        ctx.moveTo(pvW / 6, -pvH / 2); ctx.lineTo(pvW / 6, pvH / 2);
        ctx.stroke();
        // Sun glow on panel
        if (sunAlpha > 0.01) {
          ctx.shadowBlur = 10 * sunAlpha;
          ctx.shadowColor = '#f59e0b';
          ctx.strokeStyle = `rgba(245, 158, 11, ${sunAlpha * 0.4})`;
          ctx.lineWidth = 2;
          ctx.strokeRect(-pvW / 2, -pvH / 2, pvW, pvH);
          ctx.shadowBlur = 0;
        }
        ctx.restore();

        // Battery box — right of PV panel area
        const batX = cx + hw + 8;
        const batY = cy + 4;
        const batW = 14;
        const batH = 20;
        const fillH = batH * batteryLevel;
        const batColor = batteryLevel <= BAT_MIN ? colors.danger
          : (phase === 'sunset-discharge' || phase === 'battery-discharge') ? colors.accent
          : colors.success;

        // Battery outline
        ctx.strokeStyle = batColor + '50';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(batX, batY, batW, batH, 2);
        ctx.stroke();
        // Terminal
        ctx.fillStyle = batColor + '50';
        ctx.fillRect(batX + 4, batY - 2, 6, 2);
        // Fill level
        ctx.fillStyle = batColor + '60';
        ctx.beginPath();
        ctx.roundRect(batX + 1.5, batY + batH - fillH, batW - 3, fillH - 1, [0, 0, 1, 1]);
        ctx.fill();
        ctx.shadowBlur = 5;
        ctx.shadowColor = batColor + '40';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Charging/discharging indicator arrow
        if (isCharging) {
          // Down arrow (charging from PV)
          ctx.beginPath();
          ctx.moveTo(batX + batW / 2, batY + 5);
          ctx.lineTo(batX + batW / 2 - 3, batY + 9);
          ctx.lineTo(batX + batW / 2 + 3, batY + 9);
          ctx.closePath();
          ctx.fillStyle = colors.success + '90';
          ctx.fill();
        } else if (isExporting) {
          // Up arrow (discharging/exporting to grid)
          ctx.beginPath();
          ctx.moveTo(batX + batW / 2, batY + 9);
          ctx.lineTo(batX + batW / 2 - 3, batY + 5);
          ctx.lineTo(batX + batW / 2 + 3, batY + 5);
          ctx.closePath();
          ctx.fillStyle = colors.accent + '90';
          ctx.fill();
        }
      });

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [slideContext?.isSlideActive]);

  const activeDrawer = highlightStep >= 1 && highlightStep <= DRAWER_INFO.length ? DRAWER_INFO[highlightStep - 1] : null;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
      {/* Bottom drawer for node descriptions */}
      <div style={{
        position: 'absolute', bottom: 36, left: 40, right: 40, zIndex: 9999,
        height: 110,
        borderRadius: 10,
        background: activeDrawer ? 'rgba(5, 8, 16, 0.94)' : 'transparent',
        border: activeDrawer ? `1px solid ${activeDrawer?.color || colors.primary}35` : 'none',
        boxShadow: activeDrawer ? `0 -4px 30px rgba(0,0,0,0.4), inset 0 1px 20px ${activeDrawer?.color || colors.primary}06` : 'none',
        backdropFilter: activeDrawer ? 'blur(12px)' : 'none',
        opacity: activeDrawer ? 1 : 0,
        transform: activeDrawer ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex', alignItems: 'center', padding: '0 32px', gap: 24,
      }}>
        {activeDrawer && <Corners color={activeDrawer.color} />}
        {activeDrawer && (
          <>
            <div style={{ flexShrink: 0, minWidth: 210 }}>
              <div style={{ fontSize: 13, fontFamily: '"JetBrains Mono"', color: activeDrawer.color, letterSpacing: '0.12em', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase' }}>
                {activeDrawer.sub}
              </div>
              <div style={{ fontSize: 24, fontFamily: '"JetBrains Mono"', color: activeDrawer.color, fontWeight: 800 }}>
                {activeDrawer.title}
              </div>
              <div style={{ fontSize: 14, fontFamily: '"JetBrains Mono"', color: colors.text + 'bb', marginTop: 6 }}>
                {activeDrawer.detail}
              </div>
            </div>
            <div style={{ width: 1, height: 60, background: `${activeDrawer.color}25`, flexShrink: 0 }} />
            <div style={{ fontSize: 22, fontFamily: '"Inter", sans-serif', color: colors.text + 'ee', lineHeight: 1.5, flex: 1 }}>
              {activeDrawer.desc}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
