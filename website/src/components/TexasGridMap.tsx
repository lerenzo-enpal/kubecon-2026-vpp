import { useEffect, useRef } from 'react';

/**
 * Animated Texas grid map showing ERCOT transmission network
 * with failed generator nodes marked. Used on the Texas Winter Storm
 * incident page.
 */

interface Props {
  width?: number;
  height?: number;
}

function toXY(lat: number, lon: number, w: number, h: number) {
  const lonMin = -104.0, lonMax = -93.5, latMin = 25.8, latMax = 36.5;
  const centerLat = (latMin + latMax) / 2;
  const lonScale = Math.cos(centerLat * Math.PI / 180);
  const geoW = (lonMax - lonMin) * lonScale, geoH = latMax - latMin;
  const geoAspect = geoW / geoH;
  const canvasAspect = w / h;
  let drawW: number, drawH: number, offsetX: number, offsetY: number;
  if (canvasAspect > geoAspect) {
    drawH = h; drawW = drawH * geoAspect;
    offsetX = (w - drawW) / 2; offsetY = 0;
  } else {
    drawW = w; drawH = drawW / geoAspect;
    offsetX = 0; offsetY = (h - drawH) / 2;
  }
  return {
    x: offsetX + ((lon - lonMin) / (lonMax - lonMin)) * drawW,
    y: offsetY + ((latMax - lat) / (latMax - latMin)) * drawH,
  };
}

const TX: [number, number][] = [
  [36.5,-103],[36.5,-100],[34.5,-100],[34.0,-94.5],[33.6,-94.1],
  [31.0,-94.0],[29.7,-93.8],[29.3,-94.7],[28.9,-95.3],[28.5,-96.0],
  [27.5,-97.2],[26.0,-97.2],[25.9,-97.5],[26.4,-99.1],[27.8,-100.3],
  [29.5,-101.0],[31.0,-103.5],[32.0,-103.1],[32.0,-103.0],[36.5,-103],
];

const NODES: [number, number][] = [
  [35.22,-101.83],[33.58,-101.85],[32.45,-100.5],[31.99,-102.08],[32.45,-99.73],
  [32.78,-96.80],[32.48,-96.99],[32.75,-96.47],[32.30,-97.79],[32.26,-94.57],
  [31.55,-97.15],[31.43,-96.54],[31.05,-96.50],[30.27,-97.74],[29.42,-98.49],
  [29.76,-95.37],[29.48,-95.63],[29.77,-94.97],[28.80,-96.05],[27.80,-97.40],
];

const EDGES: [number, number][] = [
  [0,1],[1,2],[2,4],[4,5],[4,10],[3,4],[3,14],[5,6],[5,7],[5,8],
  [8,10],[5,9],[10,13],[10,11],[11,12],[13,14],[12,13],
  [15,16],[15,17],[15,13],[15,18],[14,19],[18,19],[9,7],
];

const FAILED_NODES = [0, 1, 2, 3, 5, 9, 11, 15, 16];

const RED = '#ef4444';
const RED_DIM = '#ef444440';
const RED_GLOW = '#ef444480';
const RED_FILL = '#ef444412';

export default function TexasGridMap({ width = 500, height = 380 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const startTime = performance.now();

    // Animation phases (ms)
    const OUTLINE_DUR = 1000;
    const EDGES_START = 1000;
    const EDGES_DUR = 500;
    const NODES_START = 1500;
    const NODES_DUR = 400;
    const FAIL_START = 2000;
    const FAIL_DUR = 600;
    const LEGEND_H = 30;
    const drawH = height - LEGEND_H;

    function drawOutline(progress: number) {
      const totalPts = TX.length;
      const ptsToShow = Math.min(totalPts, Math.floor(progress * (totalPts + 1)));
      if (ptsToShow < 2) return;

      ctx.strokeStyle = RED;
      ctx.lineWidth = 1.5;
      ctx.shadowColor = RED_GLOW;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      for (let i = 0; i < ptsToShow; i++) {
        const p = toXY(TX[i][0], TX[i][1], width, drawH);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      if (progress >= 1) {
        ctx.closePath();
        ctx.fillStyle = RED_FILL;
        ctx.fill();
      }
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawEdges(progress: number) {
      const total = EDGES.length;
      const edgesToShow = Math.min(total, Math.floor(progress * (total + 1)));

      ctx.strokeStyle = RED_DIM;
      ctx.lineWidth = 1;
      ctx.shadowColor = RED_GLOW;
      ctx.shadowBlur = 2;

      for (let i = 0; i < edgesToShow; i++) {
        const [a, b] = EDGES[i];
        const pA = toXY(NODES[a][0], NODES[a][1], width, drawH);
        const pB = toXY(NODES[b][0], NODES[b][1], width, drawH);
        ctx.beginPath();
        ctx.moveTo(pA.x, pA.y);
        ctx.lineTo(pB.x, pB.y);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
    }

    function drawNodes(progress: number) {
      const total = NODES.length;
      const nodesToShow = Math.min(total, Math.floor(progress * (total + 1)));
      const pulseScale = 1 + Math.sin(progress * Math.PI) * 0.5;

      for (let i = 0; i < nodesToShow; i++) {
        const p = toXY(NODES[i][0], NODES[i][1], width, drawH);
        const r = 3.5 * (i < nodesToShow - 1 ? 1 : pulseScale);

        ctx.shadowColor = RED_GLOW;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    function drawFailMarks(progress: number) {
      const total = FAILED_NODES.length;
      const marksToShow = Math.min(total, Math.floor(progress * (total + 1)));

      for (let j = 0; j < marksToShow; j++) {
        const i = FAILED_NODES[j];
        const p = toXY(NODES[i][0], NODES[i][1], width, drawH);
        const isLast = j === marksToShow - 1 && progress < 1;
        const flash = isLast ? 1 + Math.sin(progress * Math.PI * 4) * 0.3 : 1;

        // Glow ring on failed nodes
        ctx.shadowColor = RED;
        ctx.shadowBlur = isLast ? 16 : 10;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2 * flash;
        ctx.beginPath();
        ctx.moveTo(p.x - 7, p.y - 7); ctx.lineTo(p.x + 7, p.y + 7);
        ctx.moveTo(p.x + 7, p.y - 7); ctx.lineTo(p.x - 7, p.y + 7);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    function drawLegend() {
      const y = height - 12;
      const leftX = 12;
      ctx.font = '10px "JetBrains Mono", monospace';

      // Failed generators
      ctx.strokeStyle = RED;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftX, y - 4); ctx.lineTo(leftX + 8, y + 4);
      ctx.moveTo(leftX + 8, y - 4); ctx.lineTo(leftX, y + 4);
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Failed generators', leftX + 16, y + 3);

      // Transmission lines
      const txLineX = leftX + 140;
      ctx.strokeStyle = RED_DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(txLineX, y);
      ctx.lineTo(txLineX + 18, y);
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Transmission lines', txLineX + 24, y + 3);
    }

    function frame(now: number) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      // Phase 1: Outline
      const outlineProg = Math.min(1, elapsed / OUTLINE_DUR);
      drawOutline(outlineProg);

      // Phase 2: Edges
      if (elapsed > EDGES_START) {
        const edgeProg = Math.min(1, (elapsed - EDGES_START) / EDGES_DUR);
        drawEdges(edgeProg);
      }

      // Phase 3: Nodes
      if (elapsed > NODES_START) {
        const nodeProg = Math.min(1, (elapsed - NODES_START) / NODES_DUR);
        drawNodes(nodeProg);
      }

      // Phase 4: Fail marks
      if (elapsed > FAIL_START) {
        const failProg = Math.min(1, (elapsed - FAIL_START) / FAIL_DUR);
        drawFailMarks(failProg);
      }

      // Legend (always visible)
      drawLegend();

      // Keep animating until complete, then do one final static frame
      if (elapsed < FAIL_START + FAIL_DUR + 100) {
        animRef.current = requestAnimationFrame(frame);
      }
    }

    animRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block' }}
    />
  );
}
