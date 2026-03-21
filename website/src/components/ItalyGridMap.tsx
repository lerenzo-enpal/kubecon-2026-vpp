import { useEffect, useRef } from 'react';

/**
 * Animated Italy grid map showing Alpine import lines and the 2003
 * cascade that isolated Italy from the European grid in 12 seconds.
 */

interface Props {
  width?: number;
  height?: number;
}

// Simplified Italy outline (lat, lon)
const ITALY: [number, number][] = [
  [47.0, 6.6],   // NW Alps (French border)
  [46.5, 8.0],   // Swiss border
  [47.3, 10.5],  // Austrian Alps
  [47.0, 12.0],  // Brenner area
  [46.5, 13.5],  // Austrian/Slovenian border
  [45.8, 13.7],  // Trieste
  [45.5, 12.3],  // Venice
  [44.4, 12.3],  // Rimini
  [43.7, 13.5],  // Ancona
  [42.5, 14.2],  // Pescara
  [41.9, 16.0],  // Bari area
  [40.6, 17.9],  // Brindisi
  [40.0, 18.5],  // Lecce
  [39.9, 16.5],  // Taranto
  [38.9, 16.5],  // Calabria east
  [38.1, 15.6],  // Reggio Calabria
  [38.7, 16.1],  // Calabria mid
  [39.0, 15.8],  // Calabria west coast
  [39.5, 15.6],  // Paola
  [40.3, 14.9],  // Salerno
  [40.85, 14.27],// Naples
  [41.2, 13.6],  // Gaeta
  [41.9, 12.5],  // Rome
  [42.4, 11.2],  // Grosseto
  [43.3, 10.3],  // Livorno
  [44.0, 9.8],   // La Spezia
  [44.4, 8.9],   // Genoa
  [44.7, 7.7],   // Savona
  [45.1, 7.7],   // Turin area
  [45.5, 7.0],   // Aosta
  [46.2, 6.8],   // Mont Blanc area
  [47.0, 6.6],   // Close
];

// Key cities
const ROME: [number, number] = [41.9, 12.5];
const MILAN: [number, number] = [45.5, 9.2];
const TURIN: [number, number] = [45.1, 7.7];
const NAPLES: [number, number] = [40.85, 14.27];

// Alpine import lines: [start (outside Italy), end (inside Italy)]
const IMPORT_LINES: { from: [number, number]; to: [number, number]; label: string }[] = [
  { from: [46.8, 6.0], to: [45.5, 7.0], label: 'FR' },        // France
  { from: [47.5, 8.0], to: [46.5, 8.0], label: 'CH-Lukmanier' }, // Switzerland (the line that failed)
  { from: [47.5, 9.5], to: [46.8, 10.0], label: 'CH' },        // Switzerland 2
  { from: [47.5, 11.5], to: [47.0, 12.0], label: 'AT' },       // Austria
  { from: [46.5, 14.5], to: [45.8, 13.7], label: 'SI' },       // Slovenia
];

// Internal transmission spine
const SPINE: [number, number][] = [TURIN, MILAN, [44.4, 8.9], [43.3, 10.3], ROME, NAPLES];

const CYAN = '#22d3ee';
const CYAN_DIM = '#22d3ee30';
const CYAN_GLOW = '#22d3ee60';
const RED = '#ef4444';
const RED_GLOW = '#ef444480';
const RED_DIM = '#ef444440';

function makeToXY(w: number, h: number, padTop: number, legendH: number) {
  const lonMin = 5.5, lonMax = 19.0, latMin = 37.5, latMax = 48.0;
  const centerLat = (latMin + latMax) / 2;
  const lonScale = Math.cos(centerLat * Math.PI / 180);
  const geoW = (lonMax - lonMin) * lonScale;
  const geoH = latMax - latMin;
  const geoAspect = geoW / geoH;
  const drawArea = h - padTop - legendH;
  const canvasAspect = w / drawArea;
  let drawW: number, drawH: number, offsetX: number, offsetY: number;
  if (canvasAspect > geoAspect) {
    drawH = drawArea; drawW = drawH * geoAspect;
    offsetX = (w - drawW) / 2; offsetY = padTop;
  } else {
    drawW = w; drawH = drawW / geoAspect;
    offsetX = 0; offsetY = padTop + (drawArea - drawH) / 2;
  }
  return (lat: number, lon: number) => ({
    x: offsetX + ((lon - lonMin) / (lonMax - lonMin)) * drawW,
    y: offsetY + ((latMax - lat) / (latMax - latMin)) * drawH,
  });
}

export default function ItalyGridMap({ width = 500, height = 400 }: Props) {
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
    const LEGEND_H = 28;
    const xy = makeToXY(width, height, 8, LEGEND_H);

    // Timeline (ms)
    const OUTLINE_DUR = 1000;
    const SPINE_START = 800;
    const SPINE_DUR = 600;
    const IMPORT_START = 1400;
    const IMPORT_DUR = 600;
    const FLASH_START = 2200;   // Lines flash red
    const FLASH_DUR = 400;
    const TRIP_START = 2600;    // Lines trip one by one
    const TRIP_DUR = 1000;
    const DARK_START = 3600;    // Italy goes dark
    const DARK_DUR = 600;

    function drawOutline(progress: number) {
      const total = ITALY.length;
      const pts = Math.min(total, Math.floor(progress * (total + 1)));
      if (pts < 2) return;

      ctx.strokeStyle = CYAN_DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const p = xy(ITALY[i][0], ITALY[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      if (progress >= 1) {
        ctx.closePath();
        ctx.fillStyle = '#22d3ee06';
        ctx.fill();
      }
      ctx.stroke();
    }

    function drawSpine(progress: number) {
      const total = SPINE.length;
      const pts = Math.min(total, Math.floor(progress * (total + 1)));
      if (pts < 2) return;

      ctx.shadowColor = CYAN_GLOW;
      ctx.shadowBlur = 4;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const p = xy(SPINE[i][0], SPINE[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      for (let i = 0; i < pts; i++) {
        const p = xy(SPINE[i][0], SPINE[i][1]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = CYAN;
        ctx.fill();
      }

      // City labels
      if (progress >= 1) {
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#a1a1aa';
        const r = xy(ROME[0], ROME[1]);
        ctx.fillText('Rome', r.x + 8, r.y + 3);
        const m = xy(MILAN[0], MILAN[1]);
        ctx.fillText('Milan', m.x + 8, m.y + 3);
        const t = xy(TURIN[0], TURIN[1]);
        ctx.fillText('Turin', t.x - 30, t.y + 3);
        const n = xy(NAPLES[0], NAPLES[1]);
        ctx.fillText('Naples', n.x + 8, n.y + 3);
      }
    }

    function drawImportLines(progress: number, flashProgress: number, tripProgress: number) {
      const total = IMPORT_LINES.length;
      const linesToShow = Math.min(total, Math.floor(progress * (total + 1)));
      const tripped = tripProgress > 0
        ? Math.min(total, Math.floor(tripProgress * (total + 1)))
        : 0;

      for (let i = 0; i < linesToShow; i++) {
        const line = IMPORT_LINES[i];
        const pFrom = xy(line.from[0], line.from[1]);
        const pTo = xy(line.to[0], line.to[1]);
        const isTripped = i < tripped;
        const isFlashing = flashProgress > 0 && !isTripped;

        if (isTripped) {
          ctx.strokeStyle = RED_DIM;
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
        } else if (isFlashing) {
          const flash = Math.sin(flashProgress * Math.PI * 4);
          ctx.strokeStyle = flash > 0 ? RED : CYAN;
          ctx.shadowColor = flash > 0 ? RED_GLOW : CYAN_GLOW;
          ctx.shadowBlur = 6;
          ctx.lineWidth = 2;
          ctx.setLineDash([]);
        } else {
          ctx.shadowColor = CYAN_GLOW;
          ctx.shadowBlur = 3;
          ctx.strokeStyle = CYAN;
          ctx.lineWidth = 1.5;
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(pFrom.x, pFrom.y);
        ctx.lineTo(pTo.x, pTo.y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;

        // Trip X mark
        if (isTripped) {
          const mx = (pFrom.x + pTo.x) / 2;
          const my = (pFrom.y + pTo.y) / 2;
          ctx.strokeStyle = RED;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(mx - 4, my - 4); ctx.lineTo(mx + 4, my + 4);
          ctx.moveTo(mx + 4, my - 4); ctx.lineTo(mx - 4, my + 4);
          ctx.stroke();
        }

        // Label
        ctx.font = '7px "JetBrains Mono", monospace';
        ctx.fillStyle = isTripped ? RED_DIM : '#71717a';
        ctx.fillText(line.label, pFrom.x + 4, pFrom.y - 4);
      }
    }

    function drawDarkOverlay(progress: number) {
      if (progress <= 0) return;
      // Dark overlay over Italy
      ctx.globalAlpha = progress * 0.5;
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      for (let i = 0; i < ITALY.length; i++) {
        const p = xy(ITALY[i][0], ITALY[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // "BLACKOUT" label
      if (progress > 0.5) {
        const alpha = Math.min(1, (progress - 0.5) * 2);
        ctx.globalAlpha = alpha;
        const c = xy(42.5, 12.0);
        ctx.font = 'bold 11px "JetBrains Mono", monospace';
        ctx.fillStyle = RED;
        ctx.shadowColor = RED_GLOW;
        ctx.shadowBlur = 8;
        ctx.fillText('BLACKOUT', c.x - 28, c.y);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    function drawLegend() {
      const y = height - 10;
      const leftX = 12;
      ctx.font = '9px "JetBrains Mono", monospace';

      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftX, y); ctx.lineTo(leftX + 14, y);
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Import lines', leftX + 20, y + 3);

      const txX = leftX + 110;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(txX, y); ctx.lineTo(txX + 14, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Tripped', txX + 20, y + 3);
    }

    function frame(now: number) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      const outlineProg = Math.min(1, elapsed / OUTLINE_DUR);
      drawOutline(outlineProg);

      if (elapsed > SPINE_START) {
        drawSpine(Math.min(1, (elapsed - SPINE_START) / SPINE_DUR));
      }

      if (elapsed > IMPORT_START) {
        const importProg = Math.min(1, (elapsed - IMPORT_START) / IMPORT_DUR);
        const flashProg = elapsed > FLASH_START
          ? Math.min(1, (elapsed - FLASH_START) / FLASH_DUR) : 0;
        const tripProg = elapsed > TRIP_START
          ? Math.min(1, (elapsed - TRIP_START) / TRIP_DUR) : 0;
        drawImportLines(importProg, flashProg, tripProg);
      }

      if (elapsed > DARK_START) {
        drawDarkOverlay(Math.min(1, (elapsed - DARK_START) / DARK_DUR));
      }

      drawLegend();

      if (elapsed < DARK_START + DARK_DUR + 100) {
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
