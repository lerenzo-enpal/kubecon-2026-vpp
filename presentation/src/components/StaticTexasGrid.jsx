import React, { useEffect, useRef } from 'react';

// Same geo projection as TexasCascade
function toXY(lat, lon, w, h) {
  const lonMin = -104.0, lonMax = -93.5, latMin = 25.8, latMax = 36.5;
  const centerLat = (latMin + latMax) / 2;
  const lonScale = Math.cos(centerLat * Math.PI / 180);
  const geoW = (lonMax - lonMin) * lonScale, geoH = latMax - latMin;
  const geoAspect = geoW / geoH;
  const canvasAspect = w / h;
  let drawW, drawH, offsetX, offsetY;
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

const TX = [
  [36.5,-103],[36.5,-100],[34.5,-100],[34.0,-94.5],[33.6,-94.1],
  [31.0,-94.0],[29.7,-93.8],[29.3,-94.7],[28.9,-95.3],[28.5,-96.0],
  [27.5,-97.2],[26.0,-97.2],[25.9,-97.5],[26.4,-99.1],[27.8,-100.3],
  [29.5,-101.0],[31.0,-103.5],[32.0,-103.1],[32.0,-103.0],[36.5,-103],
];

const NODES = [
  [35.22,-101.83],[33.58,-101.85],[32.45,-100.5],[31.99,-102.08],[32.45,-99.73],
  [32.78,-96.80],[32.48,-96.99],[32.75,-96.47],[32.30,-97.79],[32.26,-94.57],
  [31.55,-97.15],[31.43,-96.54],[31.05,-96.50],[30.27,-97.74],[29.42,-98.49],
  [29.76,-95.37],[29.48,-95.63],[29.77,-94.97],[28.80,-96.05],[27.80,-97.40],
];

const EDGES = [
  [0,1],[1,2],[2,4],[4,5],[4,10],[3,4],[3,14],[5,6],[5,7],[5,8],
  [8,10],[5,9],[10,13],[10,11],[11,12],[13,14],[12,13],
  [15,16],[15,17],[15,13],[15,18],[14,19],[18,19],[9,7],
];

export default function StaticTexasGrid({ width = 800, height = 600, opacity = 0.06 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);
    ctx.globalAlpha = opacity;

    // Outline
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#ef444408';
    ctx.beginPath();
    TX.forEach((pt, i) => {
      const p = toXY(pt[0], pt[1], width, height);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    });
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Edges
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 0.8;
    EDGES.forEach(([a, b]) => {
      const pA = toXY(NODES[a][0], NODES[a][1], width, height);
      const pB = toXY(NODES[b][0], NODES[b][1], width, height);
      ctx.beginPath();
      ctx.moveTo(pA.x, pA.y);
      ctx.lineTo(pB.x, pB.y);
      ctx.stroke();
    });

    // Nodes
    NODES.forEach(n => {
      const p = toXY(n[0], n[1], width, height);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
    });

    // X marks on some nodes (failed)
    [0, 1, 2, 3, 5, 9, 11, 15, 16].forEach(i => {
      const p = toXY(NODES[i][0], NODES[i][1], width, height);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x - 6, p.y - 6); ctx.lineTo(p.x + 6, p.y + 6);
      ctx.moveTo(p.x + 6, p.y - 6); ctx.lineTo(p.x - 6, p.y + 6);
      ctx.stroke();
    });
  }, [width, height, opacity]);

  return (
    <canvas ref={canvasRef} style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none',
    }} />
  );
}
