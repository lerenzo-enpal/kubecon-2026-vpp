// TODO: Share architecture data/logic with presentation/src/components/VPPArchitecture.jsx
import { useEffect, useRef } from 'react';

// Canvas needs raw hex, not CSS custom properties
const colors = {
  primary: '#22d3ee',
  secondary: '#a78bfa',
  accent: '#f59e0b',
  danger: '#ef4444',
  success: '#10b981',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  textDim: '#64748b',
  surface: '#1a2236',
  surfaceLight: '#243049',
};

const NODES = [
  { id: 'market',     label: 'Energy\nMarket',    sub: 'FCR / aFRR',   x: 0.02,  y: 0.5,  color: colors.accent },
  { id: 'trader',     label: 'Trading\nGateway',  sub: 'Entrix',       x: 0.22,  y: 0.5,  color: colors.accent },
  { id: 'controller', label: 'VPP\nController',   sub: 'Flexa',        x: 0.42,  y: 0.5,  color: colors.primary },
  { id: 'enpal',      label: 'Enpal\nCloud',      sub: 'Fleet Mgmt',  x: 0.62,  y: 0.5,  color: colors.success },
];

const HOMES = [
  { id: 'home1', label: 'Home', x: 0.84, y: 0.15 },
  { id: 'home2', label: 'Home', x: 0.84, y: 0.38 },
  { id: 'home3', label: 'Home', x: 0.84, y: 0.62 },
  { id: 'home4', label: 'Home', x: 0.84, y: 0.85 },
];

const EDGES = [
  { from: 'market',     to: 'trader',     protocol: '',       rateMul: 2 },
  { from: 'trader',     to: 'controller', protocol: '',       rateMul: 2 },
  { from: 'controller', to: 'enpal',      protocol: '',       rateMul: 1 },
  { from: 'enpal',      to: 'home1',      protocol: 'MQTT',   rateMul: 3 },
  { from: 'enpal',      to: 'home2',      protocol: 'MQTT',   rateMul: 3 },
  { from: 'enpal',      to: 'home3',      protocol: 'MQTT',   rateMul: 3 },
  { from: 'enpal',      to: 'home4',      protocol: 'MQTT',   rateMul: 3 },
  { from: 'home1',      to: 'enpal',      protocol: '',       rateMul: 3 },
  { from: 'home2',      to: 'enpal',      protocol: '',       rateMul: 3 },
  { from: 'home3',      to: 'enpal',      protocol: '',       rateMul: 3 },
  { from: 'home4',      to: 'enpal',      protocol: '',       rateMul: 3 },
  { from: 'enpal',      to: 'controller', protocol: '',       rateMul: 1 },
  { from: 'controller', to: 'trader',     protocol: '',       rateMul: 2 },
  { from: 'trader',     to: 'market',     protocol: '',       rateMul: 8 },
];

// Deterministic star positions
const STARS = Array.from({ length: 30 }, (_, i) => {
  const hash = (n: number) => { const x = Math.sin(n) * 43758.5453; return x - Math.floor(x); };
  return {
    x: hash(i * 127.1 + 311.7),
    y: 0.02 + hash(i * 269.5 + 183.3) * 0.11,
    size: 0.8 + hash(i * 419.2 + 71.9) * 1.5,
    twinkleSpeed: 1.5 + hash(i * 631.2 + 97.1) * 3,
    twinkleOffset: hash(i * 523.7 + 43.3) * Math.PI * 2,
  };
});

interface NodeDef { id: string; label: string; sub?: string; x: number; y: number; color?: string; }
const ALL_NODES: NodeDef[] = [...NODES, ...HOMES];
const NODE_MAP = new Map(ALL_NODES.map(n => [n.id, n]));
function getNode(id: string) { return NODE_MAP.get(id)!; }

interface Props {
  height?: number;
}

export default function VPPArchitecture({ height = 420 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const moonCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = container.clientWidth;

    const nodeW = 110, nodeH = 68;
    const homeW = 48, homeH = 44;

    interface Particle {
      edge: number;
      progress: number;
      speed: number;
      color: string;
      size: number;
      _px?: number; _py?: number;
      _fx?: number; _fy?: number; _tx?: number; _ty?: number;
    }

    const particles: Particle[] = [];
    const BASE_INTERVAL = 0.3;
    const startTime = performance.now() / 1000;
    const edgeLastSpawn = EDGES.map(() => startTime);

    const padTop_frac = 0.10;
    const contentH_frac = 0.85;

    function mapY(frac: number) {
      return padTop_frac * height + frac * contentH_frac * height;
    }

    function edgePoints(edge: typeof EDGES[0]) {
      const from = getNode(edge.from);
      const to = getNode(edge.to);
      const isFromHome = from.id.startsWith('home');
      const isToHome = to.id.startsWith('home');
      const fromW = isFromHome ? homeW : nodeW;
      const toW = isToHome ? homeW : nodeW;

      const goingRight = from.x < to.x;
      let fx: number, fy: number, tx: number, ty: number;
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

    function spawnParticles(now: number) {
      EDGES.forEach((edge, ei) => {
        const interval = BASE_INTERVAL * (edge.rateMul || 1);
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
      width = container!.clientWidth;
      canvas!.width = width * 2;
      canvas!.height = height * 2;
      ctx!.scale(2, 2);

      const now = performance.now() / 1000;
      ctx!.clearRect(0, 0, width, height);

      // Background grid
      ctx!.strokeStyle = colors.surfaceLight + '10';
      ctx!.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 30) {
        ctx!.beginPath(); ctx!.moveTo(gx, 0); ctx!.lineTo(gx, height); ctx!.stroke();
      }
      for (let gy = 0; gy < height; gy += 30) {
        ctx!.beginPath(); ctx!.moveTo(0, gy); ctx!.lineTo(width, gy); ctx!.stroke();
      }

      // Draw edges (once per bidirectional pair)
      const drawnLines = new Set<string>();
      EDGES.forEach((edge) => {
        const lineKey = [edge.from, edge.to].sort().join('-');
        if (drawnLines.has(lineKey)) return;
        drawnLines.add(lineKey);

        const { fx, fy, tx, ty, isToHome, isFromHome } = edgePoints(edge);
        const from = getNode(edge.from);
        const isHome = isToHome || isFromHome;

        ctx!.beginPath();
        ctx!.strokeStyle = (from.color || colors.primary) + '25';
        ctx!.lineWidth = 2;
        if (isHome) ctx!.setLineDash([5, 5]);
        ctx!.moveTo(fx, fy);
        ctx!.lineTo(tx, ty);
        ctx!.stroke();
        ctx!.setLineDash([]);

        if (edge.protocol) {
          const mx = (fx + tx) / 2;
          const my = (fy + ty) / 2;
          const angle = Math.atan2(ty - fy, tx - fx);
          const perpX = -Math.sin(angle) * 12;
          const perpY = Math.cos(angle) * 12;
          ctx!.font = '12px JetBrains Mono';
          ctx!.textAlign = 'center';
          ctx!.fillStyle = colors.textDim + '70';
          ctx!.fillText(edge.protocol, mx + perpX, my + perpY);
        }
      });

      // Spawn and advance particles
      spawnParticles(now);

      const particlesByColor: Record<string, Particle[]> = {};
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.progress += p.speed;
        if (p.progress > 1) { particles.splice(i, 1); continue; }

        const edge = EDGES[p.edge];
        const { fx, fy, tx, ty } = edgePoints(edge);
        p._px = fx + (tx - fx) * p.progress;
        p._py = fy + (ty - fy) * p.progress;
        p._fx = fx; p._fy = fy; p._tx = tx; p._ty = ty;

        if (!particlesByColor[p.color]) particlesByColor[p.color] = [];
        particlesByColor[p.color].push(p);
      }

      // Draw particles batched by color
      for (const [color, group] of Object.entries(particlesByColor)) {
        ctx!.shadowBlur = 10;
        ctx!.shadowColor = color;
        ctx!.fillStyle = color;
        ctx!.beginPath();
        for (const p of group) {
          ctx!.moveTo(p._px! + p.size, p._py!);
          ctx!.arc(p._px!, p._py!, p.size, 0, Math.PI * 2);
        }
        ctx!.fill();
        ctx!.shadowBlur = 0;

        for (const p of group) {
          const tp = Math.max(0, p.progress - 0.08);
          const tpx = p._fx! + (p._tx! - p._fx!) * tp;
          const tpy = p._fy! + (p._ty! - p._fy!) * tp;
          ctx!.beginPath();
          ctx!.moveTo(tpx, tpy);
          ctx!.lineTo(p._px!, p._py!);
          ctx!.strokeStyle = color + '50';
          ctx!.lineWidth = p.size * 0.8;
          ctx!.stroke();
        }
      }

      // Draw main nodes
      NODES.forEach((node) => {
        const nx = node.x * width;
        const ny = mapY(node.y) - nodeH / 2;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2 + node.x * 10);

        ctx!.fillStyle = colors.surface + 'ee';
        ctx!.strokeStyle = node.color + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx!.lineWidth = 1.5;
        ctx!.beginPath();
        ctx!.roundRect(nx, ny, nodeW, nodeH, 10);
        ctx!.fill();
        ctx!.stroke();

        ctx!.fillStyle = node.color + '90';
        ctx!.beginPath();
        ctx!.roundRect(nx, ny, nodeW, 3, [10, 10, 0, 0]);
        ctx!.fill();

        ctx!.shadowBlur = 14 * pulse;
        ctx!.shadowColor = node.color + '40';
        ctx!.beginPath();
        ctx!.roundRect(nx, ny, nodeW, nodeH, 10);
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        ctx!.font = 'bold 13px JetBrains Mono';
        ctx!.fillStyle = node.color;
        ctx!.textAlign = 'center';
        const labelLines = node.label.split('\n');
        labelLines.forEach((line: string, li: number) => {
          ctx!.fillText(line, nx + nodeW / 2, ny + 20 + li * 15);
        });

        ctx!.font = '11px JetBrains Mono';
        ctx!.fillStyle = colors.text + 'dd';
        ctx!.fillText(node.sub, nx + nodeW / 2, ny + 20 + labelLines.length * 15 + 4);
      });

      // Day/night cycle
      const CYCLE_SECONDS = 24;
      const hour = ((now % CYCLE_SECONDS) / CYCLE_SECONDS) * 24;

      const smoothstep = (a: number, b: number, t: number) => {
        const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
        return x * x * (3 - 2 * x);
      };

      const phase = hour < 6.5 ? 'night-pull'
        : hour < 8.5 ? 'sunrise'
        : hour < 10.0 ? 'morning-peak'
        : hour < 14.0 ? 'charging'
        : hour < 17.0 ? 'pv-export'
        : hour < 19.0 ? 'sunset-discharge'
        : hour < 21.0 ? 'battery-discharge'
        : 'night-pull';

      const sunAlpha = hour < 6.5 ? 0
        : hour < 8.5 ? smoothstep(6.5, 8.5, hour)
        : hour < 17.0 ? 1
        : hour < 21.0 ? 1 - smoothstep(17.0, 21.0, hour)
        : 0;

      const moonAlpha = hour < 4.0 ? 1
        : hour < 6.0 ? 1 - smoothstep(4.0, 6.0, hour)
        : hour < 22.0 ? 0
        : hour < 23.5 ? smoothstep(22.0, 23.5, hour)
        : 1;

      const BAT_MIN = 0.08;
      const batteryLevel = hour < 10.0 ? BAT_MIN
        : hour < 14.0 ? BAT_MIN + (1 - BAT_MIN) * ((hour - 10) / 4)
        : hour < 20.0 ? 1.0
        : hour < 21.0 ? Math.max(BAT_MIN, 1.0 - (1 - BAT_MIN) * ((hour - 20.0) / 1))
        : BAT_MIN;

      const batteryEmpty = batteryLevel <= BAT_MIN + 0.02;
      const isExporting = (phase === 'pv-export' || phase === 'sunset-discharge' || phase === 'battery-discharge') && !batteryEmpty;
      const isPulling = phase === 'night-pull' || phase === 'sunrise' || batteryEmpty;
      const isCharging = phase === 'charging';
      const electricYellow = '#fbbf24';

      // Sun
      {
        const sunX = width - 45;
        const sunY = 45;
        const sunR = 14;
        ctx!.save();
        ctx!.globalAlpha = sunAlpha * 0.7;
        ctx!.beginPath();
        ctx!.arc(sunX, sunY, sunR, 0, Math.PI * 2);
        ctx!.fillStyle = '#f59e0b';
        ctx!.shadowBlur = 20;
        ctx!.shadowColor = '#f59e0b';
        ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.strokeStyle = '#f59e0b';
        ctx!.lineWidth = 2;
        for (let r = 0; r < 8; r++) {
          const angle = (r / 8) * Math.PI * 2 + now * 0.05;
          const innerR = sunR + 4;
          const outerR = sunR + 12 + (r % 2 === 0 ? 5 : 0);
          ctx!.beginPath();
          ctx!.moveTo(sunX + Math.cos(angle) * innerR, sunY + Math.sin(angle) * innerR);
          ctx!.lineTo(sunX + Math.cos(angle) * outerR, sunY + Math.sin(angle) * outerR);
          ctx!.stroke();
        }
        ctx!.restore();
      }

      // Stars
      {
        const starAlpha = 1 - sunAlpha;
        if (starAlpha > 0.01) {
          STARS.forEach((star) => {
            const twinkle = 0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * star.twinkleSpeed + star.twinkleOffset));
            const alpha = starAlpha * twinkle;
            const sx = star.x * width;
            const sy = star.y * height;

            ctx!.save();
            ctx!.globalAlpha = alpha * 0.85;
            ctx!.fillStyle = '#e2e8f0';
            ctx!.beginPath();
            ctx!.arc(sx, sy, star.size * (1 + twinkle * 0.3), 0, Math.PI * 2);
            ctx!.fill();

            if (star.size > 1.6) {
              ctx!.strokeStyle = '#e2e8f0';
              ctx!.lineWidth = 0.6;
              ctx!.globalAlpha = alpha * 0.35;
              const sparkleLen = star.size * 1.5 + star.size * 0.8 * Math.sin(now * star.twinkleSpeed * 1.3 + star.twinkleOffset);
              ctx!.beginPath();
              ctx!.moveTo(sx - sparkleLen, sy);
              ctx!.lineTo(sx + sparkleLen, sy);
              ctx!.moveTo(sx, sy - sparkleLen);
              ctx!.lineTo(sx, sy + sparkleLen);
              ctx!.stroke();
            }
            ctx!.restore();
          });
        }
      }

      // Moon crescent
      {
        if (moonAlpha > 0.01) {
          const moonX = width - 45;
          const moonY = 42;
          const moonR = 11;
          const buf = moonR + 16;
          const size = buf * 2;
          if (!moonCanvasRef.current) {
            moonCanvasRef.current = document.createElement('canvas');
          }
          const off = moonCanvasRef.current;
          off.width = size * 2; off.height = size * 2;
          const oc = off.getContext('2d')!;
          oc.clearRect(0, 0, size * 2, size * 2);
          oc.scale(2, 2);
          oc.beginPath();
          oc.arc(buf, buf, moonR, 0, Math.PI * 2);
          oc.fillStyle = '#c8d0db';
          oc.fill();
          oc.globalCompositeOperation = 'destination-out';
          oc.beginPath();
          oc.arc(buf + 6, buf - 2, moonR * 0.82, 0, Math.PI * 2);
          oc.fill();
          ctx!.save();
          ctx!.globalAlpha = moonAlpha * 0.65;
          ctx!.shadowBlur = 14;
          ctx!.shadowColor = '#94a3b8';
          ctx!.drawImage(off, moonX - buf, moonY - buf, size, size);
          ctx!.shadowBlur = 0;
          ctx!.restore();
        }
      }

      // Draw homes with PV, battery, underground grid
      HOMES.forEach((home, i) => {
        const cx = home.x * width + homeW / 2;
        const cy = mapY(home.y);
        const hw = homeW / 2;
        const roofH = 16;
        const bodyH = 24;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2.5 + i * 2);

        // Underground grid cable
        const cableDropY = cy + bodyH / 2 + 28;
        const cableRightX = cx + hw;
        const cableColor = isPulling ? colors.primary : electricYellow;
        ctx!.beginPath();
        ctx!.moveTo(cableRightX, cy + bodyH / 2);
        ctx!.lineTo(cableRightX, cableDropY);
        ctx!.lineTo(width + 20, cableDropY);
        ctx!.strokeStyle = cableColor + '25';
        ctx!.lineWidth = 2;
        ctx!.stroke();
        ctx!.beginPath();
        ctx!.moveTo(cableRightX, cableDropY);
        ctx!.lineTo(width + 20, cableDropY);
        ctx!.strokeStyle = cableColor + '10';
        ctx!.lineWidth = 6;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = cableColor + '30';
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        // Animated electricity particles on L-shaped cable path
        const hasFlow = isExporting || isPulling;
        const elecAlpha = hasFlow ? 0.85 : 0.15;
        const vertLen = cableDropY - (cy + bodyH / 2);
        const horizLen = width + 20 - cableRightX;
        const totalLen = vertLen + horizLen;
        const vertFrac = vertLen / totalLen;
        ctx!.shadowBlur = hasFlow ? 6 : 2;
        ctx!.shadowColor = cableColor;
        ctx!.fillStyle = cableColor;
        ctx!.globalAlpha = elecAlpha;
        ctx!.beginPath();
        for (let ep = 0; ep < 4; ep++) {
          const baseP = ((now * 0.25 + ep * 0.25 + i * 0.13) % 1 + 1) % 1;
          const t = isPulling ? baseP : 1 - baseP;
          let epx: number, epy: number;
          if (t > 1 - vertFrac) {
            const vt = (t - (1 - vertFrac)) / vertFrac;
            epx = cableRightX;
            epy = cableDropY - vt * vertLen;
          } else {
            const ht = t / (1 - vertFrac);
            epx = width + 20 - ht * horizLen;
            epy = cableDropY;
          }
          ctx!.moveTo(epx + 2, epy);
          ctx!.arc(epx, epy, 2, 0, Math.PI * 2);
        }
        ctx!.fill();
        ctx!.shadowBlur = 0;
        ctx!.globalAlpha = 1;

        // House body
        ctx!.beginPath();
        ctx!.moveTo(cx, cy - roofH - bodyH / 2);
        ctx!.lineTo(cx + hw + 5, cy - bodyH / 2);
        ctx!.lineTo(cx + hw, cy - bodyH / 2);
        ctx!.lineTo(cx + hw, cy + bodyH / 2);
        ctx!.lineTo(cx - hw, cy + bodyH / 2);
        ctx!.lineTo(cx - hw, cy - bodyH / 2);
        ctx!.lineTo(cx - hw - 5, cy - bodyH / 2);
        ctx!.closePath();
        ctx!.fillStyle = colors.surface + 'ee';
        ctx!.fill();
        ctx!.strokeStyle = colors.success + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx!.lineWidth = 1.5;
        ctx!.stroke();
        ctx!.shadowBlur = 10 * pulse;
        ctx!.shadowColor = colors.success + '30';
        ctx!.stroke();
        ctx!.shadowBlur = 0;

        // PV panel on right roof slope
        const roofPeakX = cx;
        const roofPeakY = cy - roofH - bodyH / 2;
        const roofBaseX = cx + hw + 5;
        const roofBaseY = cy - bodyH / 2;
        const roofAngle = Math.atan2(roofBaseY - roofPeakY, roofBaseX - roofPeakX);
        const pvX = roofPeakX + (roofBaseX - roofPeakX) * 0.5;
        const pvY = roofPeakY + (roofBaseY - roofPeakY) * 0.5;
        const pvW = 20;
        const pvH = 8;
        ctx!.save();
        ctx!.translate(pvX, pvY);
        ctx!.rotate(roofAngle);
        const pvGlow = sunAlpha * 0.4;
        ctx!.fillStyle = `rgba(59, 130, 246, ${0.5 + pvGlow})`;
        ctx!.fillRect(-pvW / 2, -pvH / 2, pvW, pvH);
        ctx!.strokeStyle = `rgba(59, 130, 246, ${0.7 + pvGlow})`;
        ctx!.lineWidth = 1;
        ctx!.strokeRect(-pvW / 2, -pvH / 2, pvW, pvH);
        ctx!.strokeStyle = `rgba(59, 130, 246, 0.3)`;
        ctx!.lineWidth = 0.5;
        ctx!.beginPath();
        ctx!.moveTo(-pvW / 2, 0); ctx!.lineTo(pvW / 2, 0);
        ctx!.moveTo(-pvW / 6, -pvH / 2); ctx!.lineTo(-pvW / 6, pvH / 2);
        ctx!.moveTo(pvW / 6, -pvH / 2); ctx!.lineTo(pvW / 6, pvH / 2);
        ctx!.stroke();
        if (sunAlpha > 0.01) {
          ctx!.shadowBlur = 10 * sunAlpha;
          ctx!.shadowColor = '#f59e0b';
          ctx!.strokeStyle = `rgba(245, 158, 11, ${sunAlpha * 0.4})`;
          ctx!.lineWidth = 2;
          ctx!.strokeRect(-pvW / 2, -pvH / 2, pvW, pvH);
          ctx!.shadowBlur = 0;
        }
        ctx!.restore();

        // Battery box
        const batX = cx + hw + 7;
        const batY = cy + 3;
        const batW_ = 12;
        const batH_ = 18;
        const fillH = batH_ * batteryLevel;
        const batColor = batteryLevel <= BAT_MIN ? colors.danger
          : (phase === 'sunset-discharge' || phase === 'battery-discharge') ? colors.accent
          : colors.success;

        ctx!.strokeStyle = batColor + '50';
        ctx!.lineWidth = 1;
        ctx!.beginPath();
        ctx!.roundRect(batX, batY, batW_, batH_, 2);
        ctx!.stroke();
        ctx!.fillStyle = batColor + '50';
        ctx!.fillRect(batX + 3, batY - 2, 6, 2);
        ctx!.fillStyle = batColor + '60';
        ctx!.beginPath();
        ctx!.roundRect(batX + 1.5, batY + batH_ - fillH, batW_ - 3, fillH - 1, [0, 0, 1, 1]);
        ctx!.fill();
        ctx!.shadowBlur = 5;
        ctx!.shadowColor = batColor + '40';
        ctx!.fill();
        ctx!.shadowBlur = 0;

        // Charging/discharging arrow
        if (isCharging) {
          ctx!.beginPath();
          ctx!.moveTo(batX + batW_ / 2, batY + 4);
          ctx!.lineTo(batX + batW_ / 2 - 3, batY + 8);
          ctx!.lineTo(batX + batW_ / 2 + 3, batY + 8);
          ctx!.closePath();
          ctx!.fillStyle = colors.success + '90';
          ctx!.fill();
        } else if (isExporting) {
          ctx!.beginPath();
          ctx!.moveTo(batX + batW_ / 2, batY + 8);
          ctx!.lineTo(batX + batW_ / 2 - 3, batY + 4);
          ctx!.lineTo(batX + batW_ / 2 + 3, batY + 4);
          ctx!.closePath();
          ctx!.fillStyle = colors.accent + '90';
          ctx!.fill();
        }
      });

      animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [height]);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height }}
      />
    </div>
  );
}
