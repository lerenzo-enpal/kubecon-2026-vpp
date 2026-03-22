import React, { useEffect, useRef, useCallback } from 'react';
import { colors } from '../theme';

/**
 * PartnerArcs — Canvas overlay that draws animated electrical arcs
 * between pylons and partner logos. Arcs occasionally "pop" with a
 * bright flash + branch burst.
 */

// Generate a jagged lightning-bolt path via midpoint displacement
function lightning(x1, y1, x2, y2, segments = 7, jitter = 12) {
  const pts = [{ x: x1, y: y1 }];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    pts.push({
      x: x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter,
      y: y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter,
    });
  }
  pts.push({ x: x2, y: y2 });
  return pts;
}

function drawBolt(ctx, pts, alpha, width, color) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.shadowBlur = width * 6;
  ctx.shadowColor = color;
  ctx.lineJoin = 'bevel';
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
  const arcsRef = useRef([]);
  const popRef = useRef(null); // { arcIndex, startTime, branchPts }

  const setPylonRef = useCallback((i) => (el) => {
    pylonRefs.current[i] = el;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * 2;
      canvas.height = rect.height * 2;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };
    resize();

    // Build arc endpoint pairs from pylon positions
    const buildArcs = () => {
      const cRect = container.getBoundingClientRect();
      const arcs = [];

      pylonRefs.current.forEach((pylon, pi) => {
        if (!pylon) return;
        const pRect = pylon.getBoundingClientRect();
        const px = (pRect.left + pRect.width / 2 - cRect.left);
        const py = (pRect.top + pRect.height / 2 - cRect.top);

        // Insulator tip positions — match the SVG viewBox (36x48)
        // Crossarms at y=9,18,27,36 in viewBox, tips at x=5 (left) and x=31 (right)
        const armFracs = [9/48, 18/48, 27/48, 36/48];
        const tipOffsetX = (13/36) * pRect.width; // distance from center to tip (18-5=13 in viewBox units)

        // Find adjacent elements
        const prevEl = pylon.previousElementSibling;
        const nextEl = pylon.nextElementSibling;

        if (prevEl) {
          const r = prevEl.getBoundingClientRect();
          const tx = r.right - cRect.left;
          const ty = r.top + r.height / 2 - cRect.top;
          const armIdx = Math.floor(Math.random() * 4);
          const fromX = px - tipOffsetX;
          const fromY = pRect.top - cRect.top + armFracs[armIdx] * pRect.height;
          arcs.push({ x1: fromX, y1: fromY, x2: tx + 3, y2: ty + (Math.random() - 0.5) * 8, jitter: 6 + Math.random() * 6 });
        }
        if (nextEl) {
          const r = nextEl.getBoundingClientRect();
          const tx = r.left - cRect.left;
          const ty = r.top + r.height / 2 - cRect.top;
          const armIdx = Math.floor(Math.random() * 4);
          const fromX = px + tipOffsetX;
          const fromY = pRect.top - cRect.top + armFracs[armIdx] * pRect.height;
          arcs.push({ x1: fromX, y1: fromY, x2: tx - 3, y2: ty + (Math.random() - 0.5) * 8, jitter: 6 + Math.random() * 6 });
        }

        // Short arc from top of pylon upward
        arcs.push({ x1: px, y1: pRect.top - cRect.top - 2, x2: px + (Math.random() - 0.5) * 25, y2: pRect.top - cRect.top - 12 - Math.random() * 18, jitter: 4 + Math.random() * 4, upward: true });
      });

      return arcs;
    };

    let lastArcRebuild = 0;
    let lastPopTime = 0;
    const popInterval = () => 1800 + Math.random() * 2500; // 1.8–4.3s between pops
    let nextPopDelay = popInterval();

    const draw = (time) => {
      const ctx = canvas.getContext('2d');
      const cRect = container.getBoundingClientRect();
      canvas.width = cRect.width * 2;
      canvas.height = cRect.height * 2;
      ctx.scale(2, 2);
      ctx.clearRect(0, 0, cRect.width, cRect.height);

      // Rebuild arc endpoints every ~150ms (new random paths)
      if (time - lastArcRebuild > 150) {
        arcsRef.current = buildArcs();
        lastArcRebuild = time;
      }

      // Schedule pops
      if (time - lastPopTime > nextPopDelay) {
        const arcs = arcsRef.current;
        if (arcs.length > 0) {
          const idx = Math.floor(Math.random() * arcs.length);
          const a = arcs[idx];
          // Generate 1-2 branch bolts from midpoint
          const midX = (a.x1 + a.x2) / 2 + (Math.random() - 0.5) * 10;
          const midY = (a.y1 + a.y2) / 2 + (Math.random() - 0.5) * 10;
          const branches = [];
          const numBranches = 1 + Math.floor(Math.random() * 2);
          for (let b = 0; b < numBranches; b++) {
            const bx = midX + (Math.random() - 0.5) * 30;
            const by = midY + (Math.random() - 0.5) * 25;
            branches.push(lightning(midX, midY, bx, by, 4, 5));
          }
          popRef.current = { arcIndex: idx, startTime: time, branches };
        }
        lastPopTime = time;
        nextPopDelay = popInterval();
      }

      // Draw arcs
      const arcs = arcsRef.current;
      arcs.forEach((a, i) => {
        const pts = lightning(a.x1, a.y1, a.x2, a.y2, 6, a.jitter);
        const baseAlpha = a.upward ? 0.08 : 0.12;
        drawBolt(ctx, pts, baseAlpha, 0.8, colors.primary);
      });

      // Draw pop effect
      const pop = popRef.current;
      if (pop && time - pop.startTime < 300) {
        const popT = (time - pop.startTime) / 300;
        const popAlpha = (1 - popT) * 0.7;
        const a = arcs[pop.arcIndex];
        if (a) {
          // Bright main arc
          const pts = lightning(a.x1, a.y1, a.x2, a.y2, 8, a.jitter * 1.3);
          drawBolt(ctx, pts, popAlpha, 2.5, colors.primary);
          // White-hot core
          drawBolt(ctx, pts, popAlpha * 0.6, 1, '#ffffff');
          // Branches
          pop.branches.forEach(bpts => {
            drawBolt(ctx, bpts, popAlpha * 0.5, 1.5, colors.primary);
          });
          // Flash circle at pop origin
          if (popT < 0.15) {
            const midX = (a.x1 + a.x2) / 2;
            const midY = (a.y1 + a.y2) / 2;
            ctx.save();
            ctx.globalAlpha = (1 - popT / 0.15) * 0.3;
            ctx.fillStyle = colors.primary;
            ctx.shadowBlur = 20;
            ctx.shadowColor = colors.primary;
            ctx.beginPath();
            ctx.arc(midX, midY, 8 + popT * 40, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 1 }}
      />
      {/* Inject pylon refs into children via render prop */}
      {typeof children === 'function' ? children(setPylonRef) : children}
    </div>
  );
}
