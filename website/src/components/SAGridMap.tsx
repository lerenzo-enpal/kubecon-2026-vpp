import { useEffect, useRef } from 'react';

/**
 * Animated South Australia grid map showing transmission network,
 * wind farms, and the cascade failure sequence from the 2016 blackout.
 */

interface Props {
  width?: number;
  height?: number;
}

// Simplified SA state outline (lat, lon)
const SA_OUTLINE: [number, number][] = [
  [-26.0, 129.0],  // NW corner
  [-26.0, 141.0],  // NE corner
  [-28.0, 141.0],
  [-34.0, 141.0],  // SE corner (border with Vic)
  [-38.0, 141.0],  // S border at coast
  [-37.8, 140.0],  // coast
  [-37.0, 139.7],
  [-36.8, 139.8],  // Robe area
  [-36.0, 137.8],  // Kangaroo Island area
  [-35.8, 137.0],
  [-35.3, 136.6],
  [-34.7, 135.9],  // Spencer Gulf entrance
  [-34.0, 137.5],  // Inside Spencer Gulf
  [-33.0, 137.8],  // Port Augusta area
  [-32.5, 137.5],
  [-33.0, 136.5],
  [-33.9, 136.0],
  [-34.5, 135.5],
  [-35.0, 134.8],
  [-34.0, 134.0],
  [-33.2, 134.2],
  [-32.5, 133.5],
  [-32.0, 132.5],  // Great Australian Bight
  [-32.0, 131.5],
  [-31.5, 131.0],
  [-31.5, 129.0],
  [-26.0, 129.0],  // Close back to NW
];

// Key locations (lat, lon)
const ADELAIDE: [number, number] = [-34.93, 138.60];
const PORT_AUGUSTA: [number, number] = [-32.49, 137.78];
const VIC_BORDER: [number, number] = [-36.5, 141.0];

// Transmission spine nodes (Port Augusta -> Adelaide -> Heywood interconnector)
const SPINE: [number, number][] = [
  PORT_AUGUSTA,
  [-33.5, 138.2],   // Bungama area
  [-33.9, 138.5],   // Clare
  [-34.5, 138.6],   // Gawler
  ADELAIDE,
];

// Heywood interconnector (Adelaide -> SE -> Victoria border)
const INTERCONNECTOR: [number, number][] = [
  ADELAIDE,
  [-35.3, 139.0],   // Murray Bridge
  [-36.0, 140.0],   // Tailem Bend area
  [-37.0, 140.5],   // Near border
  [-37.5, 141.0],   // Heywood (Vic side)
];

// Wind farm locations (lat, lon, name, MW lost)
const WIND_FARMS: { pos: [number, number]; mw: number }[] = [
  { pos: [-33.2, 138.4], mw: 106 },  // Snowtown
  { pos: [-33.4, 138.6], mw: 123 },  // Hallett
  { pos: [-32.9, 138.2], mw: 86 },   // Hornsdale
  { pos: [-33.8, 137.9], mw: 35 },   // Clements Gap
  { pos: [-34.2, 138.3], mw: 28 },   // Waterloo
  { pos: [-35.6, 138.0], mw: 30 },   // Cathedral Rocks (coast)
  { pos: [-37.2, 140.1], mw: 24 },   // Lake Bonney
  { pos: [-35.2, 138.8], mw: 24 },   // North Adelaide area
];

// Adelaide cluster dots
const ADELAIDE_CLUSTER: [number, number][] = [
  [-34.85, 138.50], [-34.90, 138.55], [-34.95, 138.65],
  [-34.88, 138.62], [-35.00, 138.58], [-34.92, 138.70],
];

const CYAN = '#22d3ee';
const CYAN_DIM = '#22d3ee40';
const CYAN_GLOW = '#22d3ee60';
const AMBER = '#f59e0b';
const AMBER_DIM = '#f59e0b40';
const RED = '#ef4444';
const RED_GLOW = '#ef444480';

function toXY(lat: number, lon: number, w: number, h: number, padTop = 10) {
  const lonMin = 128.5, lonMax = 141.5, latMin = -38.5, latMax = -25.5;
  const centerLat = (latMin + latMax) / 2;
  const lonScale = Math.cos(centerLat * Math.PI / 180);
  const geoW = (lonMax - lonMin) * lonScale;
  const geoH = latMax - latMin;
  const geoAspect = geoW / Math.abs(geoH);
  const drawArea = h - padTop - 30; // reserve bottom for legend
  const canvasAspect = w / drawArea;
  let drawW: number, drawH: number, offsetX: number, offsetY: number;
  if (canvasAspect > geoAspect) {
    drawH = drawArea; drawW = drawH * geoAspect;
    offsetX = (w - drawW) / 2; offsetY = padTop;
  } else {
    drawW = w; drawH = drawW / geoAspect;
    offsetX = 0; offsetY = padTop + (drawArea - drawH) / 2;
  }
  return {
    x: offsetX + ((lon - lonMin) / (lonMax - lonMin)) * drawW,
    y: offsetY + ((latMax - lat) / (latMax - latMin)) * drawH,
  };
}

export default function SAGridMap({ width = 500, height = 400 }: Props) {
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

    // Animation timeline (ms)
    const OUTLINE_DUR = 1000;
    const SPINE_START = 900;
    const SPINE_DUR = 600;
    const WIND_START = 1400;
    const WIND_DUR = 500;
    const INTER_START = 1900;
    const INTER_DUR = 400;
    const TRIP_START = 2500;   // Interconnector trips
    const TRIP_DUR = 300;
    const CASCADE_START = 2900; // Wind farms go dark one by one
    const CASCADE_DUR = 1200;

    function xy(lat: number, lon: number) {
      return toXY(lat, lon, width, height);
    }

    function drawOutline(progress: number) {
      const total = SA_OUTLINE.length;
      const ptsToShow = Math.min(total, Math.floor(progress * (total + 1)));
      if (ptsToShow < 2) return;

      ctx.strokeStyle = CYAN_DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < ptsToShow; i++) {
        const p = xy(SA_OUTLINE[i][0], SA_OUTLINE[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      if (progress >= 1) {
        ctx.closePath();
        ctx.fillStyle = '#22d3ee08';
        ctx.fill();
      }
      ctx.stroke();
    }

    function drawSpine(progress: number) {
      const total = SPINE.length;
      const ptsToShow = Math.min(total, Math.floor(progress * (total + 1)));
      if (ptsToShow < 2) return;

      ctx.shadowColor = CYAN_GLOW;
      ctx.shadowBlur = 4;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let i = 0; i < ptsToShow; i++) {
        const p = xy(SPINE[i][0], SPINE[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Node dots along spine
      for (let i = 0; i < ptsToShow; i++) {
        const p = xy(SPINE[i][0], SPINE[i][1]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = CYAN;
        ctx.fill();
      }

      // Adelaide cluster
      if (progress > 0.8) {
        const alpha = Math.min(1, (progress - 0.8) / 0.2);
        ctx.globalAlpha = alpha;
        for (const dot of ADELAIDE_CLUSTER) {
          const p = xy(dot[0], dot[1]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = CYAN;
          ctx.fill();
        }
        ctx.globalAlpha = 1;

        // Adelaide label
        const aP = xy(ADELAIDE[0], ADELAIDE[1]);
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#a1a1aa';
        ctx.fillText('Adelaide', aP.x + 8, aP.y - 6);

        // Port Augusta label
        const paP = xy(PORT_AUGUSTA[0], PORT_AUGUSTA[1]);
        ctx.fillText('Port Augusta', paP.x + 8, paP.y - 4);
      }
    }

    function drawWindFarms(progress: number, cascadeProgress: number) {
      const total = WIND_FARMS.length;
      const farmsToShow = Math.min(total, Math.floor(progress * (total + 1)));
      const farmsDark = cascadeProgress > 0
        ? Math.min(total, Math.floor(cascadeProgress * (total + 1)))
        : 0;

      for (let i = 0; i < farmsToShow; i++) {
        const farm = WIND_FARMS[i];
        const p = xy(farm.pos[0], farm.pos[1]);
        const isDark = i < farmsDark;

        if (isDark) {
          // Darkened wind farm
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = AMBER_DIM;
          ctx.fill();
        } else {
          // Active wind farm with glow
          ctx.shadowColor = AMBER + '60';
          ctx.shadowBlur = 6;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = AMBER;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    function drawInterconnector(progress: number, tripped: boolean) {
      const total = INTERCONNECTOR.length;
      const ptsToShow = Math.min(total, Math.floor(progress * (total + 1)));
      if (ptsToShow < 2) return;

      if (tripped) {
        // Draw as dashed red line
        ctx.shadowColor = RED_GLOW;
        ctx.shadowBlur = 6;
        ctx.strokeStyle = RED;
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
      } else {
        ctx.shadowColor = CYAN_GLOW;
        ctx.shadowBlur = 4;
        ctx.strokeStyle = CYAN;
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      for (let i = 0; i < ptsToShow; i++) {
        const p = xy(INTERCONNECTOR[i][0], INTERCONNECTOR[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // Label
      if (progress >= 1) {
        const midP = xy(INTERCONNECTOR[2][0], INTERCONNECTOR[2][1]);
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = tripped ? RED : '#a1a1aa';
        ctx.fillText(tripped ? 'TRIPPED' : 'Heywood', midP.x + 6, midP.y - 4);
      }

      // Victoria border label
      if (progress >= 1) {
        const vP = xy(VIC_BORDER[0], VIC_BORDER[1]);
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = '#71717a';
        ctx.fillText('VIC', vP.x + 4, vP.y + 3);
      }
    }

    function drawLegend() {
      const y = height - 10;
      const leftX = 12;
      ctx.font = '9px "JetBrains Mono", monospace';

      // Transmission
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(leftX + 14, y);
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Transmission', leftX + 20, y + 3);

      // Wind farms
      const wfX = leftX + 110;
      ctx.beginPath();
      ctx.arc(wfX + 4, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = AMBER;
      ctx.fill();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Wind farms', wfX + 14, y + 3);

      // Interconnector failed
      const icX = wfX + 100;
      ctx.strokeStyle = RED;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(icX, y);
      ctx.lineTo(icX + 14, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Failed link', icX + 20, y + 3);
    }

    function frame(now: number) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      // Phase 1: Outline
      const outlineProg = Math.min(1, elapsed / OUTLINE_DUR);
      drawOutline(outlineProg);

      // Phase 2: Transmission spine
      if (elapsed > SPINE_START) {
        const spineProg = Math.min(1, (elapsed - SPINE_START) / SPINE_DUR);
        drawSpine(spineProg);
      }

      // Phase 3 + 6: Wind farms (appear, then cascade off)
      if (elapsed > WIND_START) {
        const windProg = Math.min(1, (elapsed - WIND_START) / WIND_DUR);
        const cascadeProg = elapsed > CASCADE_START
          ? Math.min(1, (elapsed - CASCADE_START) / CASCADE_DUR)
          : 0;
        drawWindFarms(windProg, cascadeProg);
      }

      // Phase 4 + 5: Interconnector (appears, then trips)
      if (elapsed > INTER_START) {
        const interProg = Math.min(1, (elapsed - INTER_START) / INTER_DUR);
        const tripped = elapsed > TRIP_START;

        // Flash effect when tripping
        if (tripped && elapsed < TRIP_START + TRIP_DUR) {
          const flashProg = (elapsed - TRIP_START) / TRIP_DUR;
          const flashAlpha = 0.3 * Math.sin(flashProg * Math.PI * 3);
          if (flashAlpha > 0) {
            // Red flash over the interconnector area
            const p1 = xy(INTERCONNECTOR[0][0], INTERCONNECTOR[0][1]);
            const p2 = xy(INTERCONNECTOR[4][0], INTERCONNECTOR[4][1]);
            ctx.fillStyle = `rgba(239, 68, 68, ${flashAlpha})`;
            ctx.fillRect(
              Math.min(p1.x, p2.x) - 10,
              Math.min(p1.y, p2.y) - 10,
              Math.abs(p2.x - p1.x) + 20,
              Math.abs(p2.y - p1.y) + 20,
            );
          }
        }

        drawInterconnector(interProg, tripped);
      }

      // Legend
      drawLegend();

      const totalDur = CASCADE_START + CASCADE_DUR + 100;
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
