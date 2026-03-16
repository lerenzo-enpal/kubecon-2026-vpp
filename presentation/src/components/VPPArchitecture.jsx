import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * VPPArchitecture — Animated architecture diagram showing command/telemetry flow
 * Energy Market → Trader (Entrix) → Flexa → Enpal Cloud → IoT Homes
 */

const NODES = [
  { id: 'market',     label: 'Energy Market',   sub: 'FCR / aFRR',        x: 0.03,  y: 0.5,  color: colors.accent },
  { id: 'trader',     label: 'Market Trader',   sub: 'Entrix',            x: 0.22,  y: 0.5,  color: colors.accent },
  { id: 'controller', label: 'VPP Controller',   sub: 'Flexa',             x: 0.42,  y: 0.5,  color: colors.primary },
  { id: 'enpal',      label: 'Enpal Cloud',     sub: 'Fleet Mgmt',       x: 0.62,  y: 0.5,  color: colors.success },
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

function getNode(id) {
  return NODES.find(n => n.id === id) || HOMES.find(h => h.id === id);
}

export default function VPPArchitecture({ width = 960, height = 540 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const nodeW = 150, nodeH = 66;
    const homeW = 56, homeH = 52;

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
          ctx.font = '13px JetBrains Mono';
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
        ctx.shadowBlur = 12;
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
        ctx.font = 'bold 16px JetBrains Mono';
        ctx.fillStyle = node.color;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, nx + nodeW / 2, ny + 28);

        // Sub-label
        ctx.font = '12px JetBrains Mono';
        ctx.fillStyle = colors.textDim + 'aa';
        ctx.fillText(node.sub, nx + nodeW / 2, ny + 50);
      });

      // Day/night cycle — 3 phases over ~20s
      // Phase 1 (0.0–0.4): Sun up, PV charges battery, house self-powered
      // Phase 2 (0.4–0.7): Sun sets, battery exports to grid
      // Phase 3 (0.7–1.0): Battery depleted, house pulls from grid, then sun rises
      const cyclePeriod = 20; // seconds
      const cycleT = ((now % cyclePeriod) / cyclePeriod); // 0..1
      // Smooth sun alpha — use cosine easing to avoid flicker at transitions
      let sunAlpha;
      if (cycleT < 0.05) {
        // Fade in from pre-dawn (0.3) to full (1) — smooth wrap from end of cycle
        sunAlpha = 0.3 + 0.7 * (cycleT / 0.05);
      } else if (cycleT < 0.4) {
        sunAlpha = 1;
      } else if (cycleT < 0.55) {
        // Sunset: cosine ease from 1 → 0
        sunAlpha = 0.5 + 0.5 * Math.cos((cycleT - 0.4) / 0.15 * Math.PI);
      } else if (cycleT < 0.88) {
        sunAlpha = 0;
      } else {
        // Pre-dawn glow: ease from 0 → 0.3
        sunAlpha = 0.3 * (1 - Math.cos((cycleT - 0.88) / 0.12 * Math.PI)) / 2;
      }
      const isDay = cycleT < 0.4;
      const isExporting = cycleT >= 0.4 && cycleT < 0.7;  // battery → grid
      const isPulling = cycleT >= 0.7 && cycleT < 0.9;    // grid → house
      // Battery charge level: charges 0→1 during day, drains during export, flat during pull
      const batteryLevel = cycleT < 0.4
        ? Math.min(1, cycleT / 0.35)
        : cycleT < 0.7
          ? Math.max(0.08, 1 - (cycleT - 0.4) / 0.3)
          : 0.08;
      const electricYellow = '#fbbf24';

      // Sun in top-right corner
      {
        const sunX = width - 55;
        const sunY = 45;
        const sunR = 16;
        ctx.save();
        ctx.globalAlpha = sunAlpha * 0.7;
        // Sun glow halo
        const grad = ctx.createRadialGradient(sunX, sunY, sunR, sunX, sunY, sunR * 4);
        grad.addColorStop(0, '#f59e0b30');
        grad.addColorStop(1, '#f59e0b00');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR * 4, 0, Math.PI * 2);
        ctx.fill();
        // Sun disc
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx.fillStyle = '#f59e0b';
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#f59e0b';
        ctx.fill();
        ctx.shadowBlur = 0;
        // Rays — slow rotation, thicker lines to prevent sub-pixel flicker
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

      // Draw homes with PV, battery, underground grid
      HOMES.forEach((home, i) => {
        const cx = home.x * width + homeW / 2;
        const cy = home.y * height;
        const hw = homeW / 2;
        const roofH = 18;
        const bodyH = 28;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2.5 + i * 2);

        // Underground grid cable — goes down from house then right off edge
        const cableDropY = cy + bodyH / 2 + 32;
        const cableRightX = cx + hw;
        ctx.beginPath();
        ctx.moveTo(cableRightX, cy + bodyH / 2);
        ctx.lineTo(cableRightX, cableDropY);
        ctx.lineTo(width + 20, cableDropY);
        ctx.strokeStyle = electricYellow + '25';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        // Underground glow
        ctx.beginPath();
        ctx.moveTo(cableRightX, cableDropY);
        ctx.lineTo(width + 20, cableDropY);
        ctx.strokeStyle = electricYellow + '10';
        ctx.lineWidth = 7;
        ctx.shadowBlur = 8;
        ctx.shadowColor = electricYellow + '30';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Animated electricity particles on underground cable
        // Direction: exporting = right (house→grid), pulling = left (grid→house), day = dim/idle
        const hasFlow = isExporting || isPulling;
        const elecDir = isExporting ? 1 : -1;
        const elecAlpha = hasFlow ? 0.85 : 0.15;
        for (let ep = 0; ep < 3; ep++) {
          const baseP = ((now * 0.3 * elecDir + ep * 0.33 + i * 0.13) % 1 + 1) % 1;
          const epx = cableRightX + (width + 20 - cableRightX) * baseP;
          ctx.beginPath();
          ctx.arc(epx, cableDropY, 2, 0, Math.PI * 2);
          ctx.fillStyle = electricYellow;
          ctx.globalAlpha = elecAlpha;
          ctx.shadowBlur = hasFlow ? 6 : 2;
          ctx.shadowColor = electricYellow;
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }

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

        // PV panel — right side of roof, tilted to face sun
        const pvX = cx + hw + 14;
        const pvY = cy - bodyH / 2 - 6;
        const pvW = 22;
        const pvH = 10;
        ctx.save();
        ctx.translate(pvX, pvY);
        ctx.rotate(0.2);
        // Panel body
        const pvGlow = isDay ? sunAlpha * 0.4 : 0;
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
        if (isDay) {
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
        const batColor = isDay ? colors.success : isExporting ? colors.accent : colors.danger;

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
        if (isDay) {
          // Down arrow (charging from PV)
          ctx.beginPath();
          ctx.moveTo(batX + batW / 2, batY + 5);
          ctx.lineTo(batX + batW / 2 - 3, batY + 9);
          ctx.lineTo(batX + batW / 2 + 3, batY + 9);
          ctx.closePath();
          ctx.fillStyle = colors.success + '90';
          ctx.fill();
        } else if (isExporting) {
          // Up arrow (discharging to grid)
          ctx.beginPath();
          ctx.moveTo(batX + batW / 2, batY + 9);
          ctx.lineTo(batX + batW / 2 - 3, batY + 5);
          ctx.lineTo(batX + batW / 2 + 3, batY + 5);
          ctx.closePath();
          ctx.fillStyle = colors.accent + '90';
          ctx.fill();
        }
        // isPulling: no arrow on battery (it's depleted, grid feeds house)
      });

      // Flow direction labels
      ctx.font = 'bold 13px JetBrains Mono';
      ctx.fillStyle = colors.accent + '50';
      ctx.textAlign = 'left';
      ctx.fillText('COMMANDS \u2192', 10, 20);
      ctx.fillStyle = colors.success + '50';
      ctx.textAlign = 'right';
      ctx.fillText('\u2190 TELEMETRY', width - 10, 20);

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
