import { useEffect, useRef } from 'react';

/**
 * Animated Berlin city map showing the 2025 Johannisthal arson attack.
 * Two attack sites flash red and affected areas go dark.
 */

interface Props {
  width?: number;
  height?: number;
}

// Simplified Berlin city outline (lat, lon)
const BERLIN: [number, number][] = [
  [52.67, 13.10],  // NW
  [52.68, 13.25],
  [52.67, 13.40],
  [52.66, 13.55],
  [52.64, 13.65],  // NE
  [52.58, 13.70],
  [52.52, 13.72],
  [52.46, 13.70],
  [52.40, 13.68],
  [52.38, 13.60],  // SE
  [52.39, 13.50],
  [52.38, 13.40],
  [52.39, 13.30],
  [52.38, 13.20],
  [52.39, 13.10],  // SW
  [52.43, 13.08],
  [52.48, 13.07],
  [52.54, 13.08],
  [52.60, 13.09],
  [52.67, 13.10],  // Close
];

// Key locations
const CITY_CENTER: [number, number] = [52.52, 13.41];
const JOHANNISTHAL: [number, number] = [52.44, 13.51]; // Attack site 1
const ADLERSHOF: [number, number] = [52.43, 13.53];    // Target area
const TELTOW_CANAL: [number, number] = [52.43, 13.32]; // Attack site 2

// Grid lines (simplified 110kV transmission)
const GRID_LINES: [number, number][][] = [
  // North-south spine
  [[52.62, 13.30], [52.55, 13.32], [52.50, 13.35], [52.45, 13.38], [52.40, 13.40]],
  // East-west through center
  [[52.52, 13.12], [52.52, 13.25], [52.52, 13.41], [52.52, 13.55], [52.52, 13.68]],
  // SE feeder (the attacked line)
  [[52.52, 13.41], [52.48, 13.45], [52.44, 13.51], [52.42, 13.55]],
  // SW feeder
  [[52.52, 13.41], [52.48, 13.35], [52.44, 13.32], [52.40, 13.28]],
  // Northern ring
  [[52.58, 13.15], [52.60, 13.30], [52.59, 13.45], [52.58, 13.60]],
];

// Affected area (Treptow-Kopenick district, roughly)
const AFFECTED_ZONE: [number, number][] = [
  [52.50, 13.43],
  [52.50, 13.58],
  [52.48, 13.65],
  [52.43, 13.68],
  [52.39, 13.62],
  [52.38, 13.50],
  [52.39, 13.43],
  [52.44, 13.40],
  [52.48, 13.40],
  [52.50, 13.43],
];

// Substations
const SUBSTATIONS: [number, number][] = [
  [52.52, 13.41],  // Center
  [52.55, 13.32],  // Mitte-West
  [52.58, 13.45],  // Pankow area
  [52.48, 13.45],  // Junction near attack
  [52.48, 13.35],  // SW junction
  [52.60, 13.30],  // NW
];

const CYAN = '#22d3ee';
const CYAN_DIM = '#22d3ee25';
const CYAN_GLOW = '#22d3ee50';
const RED = '#ef4444';
const RED_GLOW = '#ef444480';
const RED_BRIGHT = '#ff6b6b';

function makeToXY(w: number, h: number, padTop: number, legendH: number) {
  const lonMin = 13.05, lonMax = 13.75, latMin = 52.36, latMax = 52.70;
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

export default function BerlinGridMap({ width = 500, height = 400 }: Props) {
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
    const OUTLINE_DUR = 800;
    const GRID_START = 600;
    const GRID_DUR = 700;
    const SUB_START = 1200;
    const SUB_DUR = 400;
    const ATTACK_START = 1800;
    const ATTACK_DUR = 600;
    const DARK_START = 2500;
    const DARK_DUR = 800;

    function drawOutline(progress: number) {
      const total = BERLIN.length;
      const pts = Math.min(total, Math.floor(progress * (total + 1)));
      if (pts < 2) return;

      ctx.strokeStyle = CYAN_DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const p = xy(BERLIN[i][0], BERLIN[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      if (progress >= 1) {
        ctx.closePath();
        ctx.fillStyle = '#22d3ee04';
        ctx.fill();
      }
      ctx.stroke();
    }

    function drawGrid(progress: number, attackProgress: number) {
      for (let g = 0; g < GRID_LINES.length; g++) {
        const line = GRID_LINES[g];
        const lineProgress = Math.min(1, (progress * GRID_LINES.length - g));
        if (lineProgress <= 0) continue;

        const total = line.length;
        const pts = Math.min(total, Math.floor(lineProgress * (total + 1)));
        if (pts < 2) continue;

        // Line 2 (SE feeder) is the attacked line
        const isAttacked = g === 2 && attackProgress > 0;

        if (isAttacked) {
          ctx.strokeStyle = RED + '60';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.shadowColor = CYAN_GLOW;
          ctx.shadowBlur = 2;
          ctx.strokeStyle = CYAN;
          ctx.lineWidth = 1;
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        for (let i = 0; i < pts; i++) {
          const p = xy(line[i][0], line[i][1]);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.shadowBlur = 0;
      }
    }

    function drawSubstations(progress: number) {
      const total = SUBSTATIONS.length;
      const toShow = Math.min(total, Math.floor(progress * (total + 1)));

      for (let i = 0; i < toShow; i++) {
        const p = xy(SUBSTATIONS[i][0], SUBSTATIONS[i][1]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = CYAN;
        ctx.fill();
      }

      // Labels
      if (progress >= 1) {
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#a1a1aa';
        const cp = xy(CITY_CENTER[0], CITY_CENTER[1]);
        ctx.fillText('Mitte', cp.x + 8, cp.y - 4);
      }
    }

    function drawAttackSites(progress: number) {
      if (progress <= 0) return;
      const flash = Math.sin(progress * Math.PI * 4);

      const sites = [
        { pos: JOHANNISTHAL, label: 'Johannisthal' },
        { pos: TELTOW_CANAL, label: 'Teltow Canal' },
      ];

      // Show Johannisthal first, then Teltow Canal
      const sitesToShow = progress < 0.5 ? 1 : 2;

      for (let i = 0; i < sitesToShow; i++) {
        const site = sites[i];
        const p = xy(site.pos[0], site.pos[1]);
        const isNew = (i === 0 && progress < 0.5) || (i === 1 && progress < 1);

        // Expanding ring
        if (isNew) {
          const ringR = 8 + flash * 4;
          ctx.strokeStyle = RED_BRIGHT;
          ctx.lineWidth = 1.5;
          ctx.globalAlpha = 0.5 + flash * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Core dot
        ctx.shadowColor = RED_GLOW;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = RED;
        ctx.fill();
        ctx.shadowBlur = 0;

        // X mark
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x - 3, p.y - 3); ctx.lineTo(p.x + 3, p.y + 3);
        ctx.moveTo(p.x + 3, p.y - 3); ctx.lineTo(p.x - 3, p.y + 3);
        ctx.stroke();

        // Label
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = RED;
        const dx = i === 0 ? 10 : -70;
        ctx.fillText(site.label, p.x + dx, p.y - 8);
      }

      // Adlershof label
      if (sitesToShow >= 1) {
        const ap = xy(ADLERSHOF[0], ADLERSHOF[1]);
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#71717a';
        ctx.fillText('Adlershof', ap.x + 10, ap.y + 12);
      }
    }

    function drawDarkZone(progress: number) {
      if (progress <= 0) return;

      ctx.globalAlpha = progress * 0.45;
      ctx.fillStyle = '#0a0a0f';
      ctx.beginPath();
      for (let i = 0; i < AFFECTED_ZONE.length; i++) {
        const p = xy(AFFECTED_ZONE[i][0], AFFECTED_ZONE[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;

      // "50K households dark" label
      if (progress > 0.5) {
        const alpha = Math.min(1, (progress - 0.5) * 2);
        ctx.globalAlpha = alpha;
        const c = xy(52.44, 13.54);
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = RED;
        ctx.shadowColor = RED_GLOW;
        ctx.shadowBlur = 4;
        ctx.fillText('50K households', c.x - 40, c.y);
        ctx.fillText('60 hrs dark', c.x - 30, c.y + 12);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      }
    }

    function drawLegend() {
      const y = height - 10;
      const leftX = 12;
      ctx.font = '12px "JetBrains Mono", monospace';

      // Grid lines
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftX, y); ctx.lineTo(leftX + 14, y);
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('110 kV grid', leftX + 20, y + 3);

      // Attack sites
      const aX = leftX + 110;
      ctx.shadowColor = RED_GLOW;
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(aX + 4, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = RED;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Attack sites', aX + 14, y + 3);

      // Affected area
      const dX = aX + 108;
      ctx.fillStyle = '#0a0a0f';
      ctx.globalAlpha = 0.5;
      ctx.fillRect(dX, y - 4, 10, 8);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = '#71717a';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(dX, y - 4, 10, 8);
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Affected zone', dX + 16, y + 3);
    }

    function frame(now: number) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      const outlineProg = Math.min(1, elapsed / OUTLINE_DUR);
      drawOutline(outlineProg);

      if (elapsed > GRID_START) {
        const gridProg = Math.min(1, (elapsed - GRID_START) / GRID_DUR);
        const attackProg = elapsed > ATTACK_START
          ? Math.min(1, (elapsed - ATTACK_START) / ATTACK_DUR) : 0;
        drawGrid(gridProg, attackProg);
      }

      if (elapsed > SUB_START) {
        drawSubstations(Math.min(1, (elapsed - SUB_START) / SUB_DUR));
      }

      if (elapsed > ATTACK_START) {
        drawAttackSites(Math.min(1, (elapsed - ATTACK_START) / ATTACK_DUR));
      }

      if (elapsed > DARK_START) {
        drawDarkZone(Math.min(1, (elapsed - DARK_START) / DARK_DUR));
      }

      drawLegend();

      const totalDur = DARK_START + DARK_DUR + 100;
      if (elapsed < totalDur) {
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
