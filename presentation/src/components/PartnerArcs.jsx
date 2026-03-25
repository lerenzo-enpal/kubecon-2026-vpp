import React, { useEffect, useRef, useCallback, useState, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * PartnerArcs — Dramatic electrical arcs originating from pylon crossarm
 * tips, reaching toward adjacent partner logos. Big, visible bolts with
 * recursive midpoint displacement, fade trails, and periodic pop flashes.
 */

// Recursive midpoint displacement for natural lightning paths
function bolt(x1, y1, x2, y2, depth = 5, displacement = 0.3) {
  if (depth === 0) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];

  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 1) return [{ x: x1, y: y1 }, { x: x2, y: y2 }];

  // Perpendicular offset
  const nx = -dy / len;
  const ny = dx / len;
  const offset = (Math.random() - 0.5) * len * displacement;
  const mx = midX + nx * offset;
  const my = midY + ny * offset;

  const left = bolt(x1, y1, mx, my, depth - 1, displacement);
  const right = bolt(mx, my, x2, y2, depth - 1, displacement);
  return [...left, ...right.slice(1)];
}

function drawPath(ctx, pts, alpha, width, color, glow = true) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  if (glow) {
    ctx.shadowBlur = width * 10;
    ctx.shadowColor = color;
  }
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
  ctx.restore();
}

export default function PartnerArcs({ children }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const pylonRefs = useRef([]);
  const [ready, setReady] = useState(false);
  const slideContext = useContext(SlideContext);

  const setPylonRef = useCallback((i) => (el) => {
    pylonRefs.current[i] = el;
    // Mark ready once both pylons are mounted
    if (pylonRefs.current[0] && pylonRefs.current[1]) setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // ── Compute pylon tip positions using offset* (immune to CSS transforms) ──
    // Walk up from element to container, summing offsets
    const getOffset = (el) => {
      let x = 0, y = 0;
      let current = el;
      while (current && current !== container) {
        x += current.offsetLeft;
        y += current.offsetTop;
        current = current.offsetParent;
      }
      return { x, y };
    };

    const getArcEndpoints = () => {
      if (container.offsetWidth === 0) return [];

      const endpoints = [];

      pylonRefs.current.forEach((pylon) => {
        if (!pylon) return;
        const pos = getOffset(pylon);
        const w = pylon.offsetWidth;
        const h = pylon.offsetHeight;

        const cx = pos.x + w / 2;
        const top = pos.y;
        const tipX = (13 / 36) * w; // half-width of crossarms in SVG viewBox coords

        // 4 crossarm Y positions (from SVG viewBox 36x48: y=9,18,27,36)
        const armYs = [9, 18, 27, 36].map(yFrac => top + (yFrac / 48) * h);

        const leftTips = armYs.map(y => ({ x: cx - tipX, y }));
        const rightTips = armYs.map(y => ({ x: cx + tipX, y }));

        const prevEl = pylon.previousElementSibling;
        const nextEl = pylon.nextElementSibling;

        let leftTarget = null;
        let rightTarget = null;

        if (prevEl) {
          const p = getOffset(prevEl);
          leftTarget = {
            x: p.x + prevEl.offsetWidth + 2,
            y: p.y + prevEl.offsetHeight / 2,
          };
        }
        if (nextEl) {
          const p = getOffset(nextEl);
          rightTarget = {
            x: p.x - 2,
            y: p.y + nextEl.offsetHeight / 2,
          };
        }

        endpoints.push({ leftTips, rightTips, leftTarget, rightTarget, cx, top });
      });

      return endpoints;
    };

    // ── Arc state ──
    let pylonData = getArcEndpoints();
    let activeArcs = []; // { x1, y1, x2, y2, birth, lifetime }
    let popState = null; // { arc, time, branches }
    let lastSpawn = 0;
    let lastPop = 0;
    let nextPopDelay = 2000 + Math.random() * 2000;
    const trails = []; // { pts, alpha, birth }

    // Spawn a new arc from a random crossarm tip toward adjacent logo
    const spawnArc = (time) => {
      if (pylonData.length === 0) return;
      const pylon = pylonData[Math.floor(Math.random() * pylonData.length)];

      // Pick direction (left or right) and a random crossarm
      const goLeft = Math.random() < 0.5;
      const tips = goLeft ? pylon.leftTips : pylon.rightTips;
      const target = goLeft ? pylon.leftTarget : pylon.rightTarget;
      if (!target || !tips.length) return;

      const tip = tips[Math.floor(Math.random() * tips.length)];

      activeArcs.push({
        x1: tip.x, y1: tip.y,
        x2: target.x, y2: target.y,
        birth: time,
        lifetime: 200 + Math.random() * 300, // 200-500ms per arc
      });
    };

    const draw = (time) => {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      if (cw === 0) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      canvas.width = cw * 2;
      canvas.height = ch * 2;
      const ctx = canvas.getContext('2d');
      ctx.scale(2, 2);
      ctx.clearRect(0, 0, cw, ch);

      // Refresh pylon positions occasionally (in case of layout shift)
      if (time % 5000 < 20) pylonData = getArcEndpoints();

      // Spawn new arcs every 400-800ms (subtle, not overwhelming)
      if (time - lastSpawn > 400 + Math.random() * 400) {
        spawnArc(time);
        lastSpawn = time;
      }

      // Prune expired arcs
      activeArcs = activeArcs.filter(a => time - a.birth < a.lifetime);

      // Draw active arcs
      activeArcs.forEach(a => {
        const age = time - a.birth;
        const life = a.lifetime;
        // Fade in fast, sustain, fade out
        let alpha;
        if (age < 50) alpha = (age / 50) * 0.15;
        else if (age > life - 100) alpha = ((life - age) / 100) * 0.15;
        else alpha = 0.15;

        const pts = bolt(a.x1, a.y1, a.x2, a.y2, 5, 0.35);
        drawPath(ctx, pts, alpha, 0.8, colors.primary);

        // Store trail
        trails.push({ pts, alpha: alpha * 0.4, birth: time });
      });

      // Draw fade trails
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i];
        const age = time - t.birth;
        if (age > 150) { trails.splice(i, 1); continue; }
        const a = t.alpha * (1 - age / 150);
        if (a > 0.005) drawPath(ctx, t.pts, a, 0.6, colors.primary, false);
      }
      // Cap trail buffer
      if (trails.length > 60) trails.splice(0, trails.length - 60);

      // ── Pop effect ──
      if (time - lastPop > nextPopDelay && activeArcs.length > 0) {
        const arc = activeArcs[Math.floor(Math.random() * activeArcs.length)];
        const forkT = 0.3 + Math.random() * 0.4;
        const fx = arc.x1 + (arc.x2 - arc.x1) * forkT;
        const fy = arc.y1 + (arc.y2 - arc.y1) * forkT;
        const branches = [];
        for (let b = 0; b < 1 + Math.floor(Math.random() * 2); b++) {
          branches.push(bolt(fx, fy, fx + (Math.random() - 0.5) * 40, fy + (Math.random() - 0.5) * 35, 4, 0.5));
        }
        popState = { arc, time, branches };
        lastPop = time;
        nextPopDelay = 1800 + Math.random() * 2500;
      }

      if (popState && time - popState.time < 400) {
        const pt = (time - popState.time) / 400;
        const pa = (1 - pt) * 0.45;
        const a = popState.arc;

        // Big bright bolt from pylon tip
        const pts = bolt(a.x1, a.y1, a.x2, a.y2, 6, 0.45);
        drawPath(ctx, pts, pa, 2, colors.primary);
        drawPath(ctx, pts, pa * 0.4, 0.8, '#ffffff');

        // Branch forks
        popState.branches.forEach(bpts => {
          drawPath(ctx, bpts, pa * 0.45, 2, colors.primary);
        });

        // Origin flash at pylon tip
        if (pt < 0.15) {
          ctx.save();
          ctx.globalAlpha = (1 - pt / 0.15) * 0.5;
          ctx.fillStyle = colors.primary;
          ctx.shadowBlur = 30;
          ctx.shadowColor = colors.primary;
          ctx.beginPath();
          ctx.arc(a.x1, a.y1, 3 + pt * 40, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      if (slideContext?.isSlideActive) animRef.current = requestAnimationFrame(draw);
    };

    if (slideContext?.isSlideActive) animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [ready, slideContext?.isSlideActive]);

  return (
    <div ref={containerRef} className="relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      {typeof children === 'function' ? children(setPylonRef) : children}
    </div>
  );
}
