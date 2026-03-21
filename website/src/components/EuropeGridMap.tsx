import { useEffect, useRef } from 'react';

/**
 * Animated Continental Europe grid map showing the 2006 grid split.
 * The grid fractures into western, north-eastern, and south-eastern zones.
 */

interface Props {
  width?: number;
  height?: number;
}

// Simplified Continental Europe outline (lat, lon)
const EUROPE: [number, number][] = [
  [43.3, -9.0],  // NW Spain (Galicia)
  [43.5, -1.5],  // Basque Country
  [46.2, -1.2],  // West France
  [48.8, -4.5],  // Brittany
  [49.5, -1.5],  // Normandy
  [51.0, 1.5],   // Calais
  [53.5, 5.0],   // Netherlands
  [55.0, 8.5],   // Denmark south
  [54.5, 10.0],  // Kiel
  [54.0, 14.0],  // Szczecin
  [54.5, 18.5],  // Gdansk
  [51.0, 24.0],  // Eastern Poland
  [48.5, 24.0],  // Western Ukraine border
  [46.0, 22.5],  // Romania west
  [44.5, 22.5],  // Serbia east
  [42.0, 21.0],  // North Macedonia
  [39.5, 20.0],  // Western Greece
  [37.5, 21.5],  // Peloponnese
  [38.0, 24.0],  // Athens area
  [40.5, 26.0],  // Thrace
  [42.0, 28.5],  // Black Sea coast
  [44.0, 28.5],  // Romania east
  [46.0, 30.0],  // Odesa area
  [48.5, 24.0],  // Back to W Ukraine
  [49.0, 18.0],  // Czech/Polish border
  [47.5, 16.5],  // Vienna area
  [47.0, 15.0],  // Austria
  [46.5, 14.0],  // Slovenia
  [45.5, 14.0],  // Croatia coast start
  [43.0, 16.0],  // Split
  [42.5, 18.5],  // Dubrovnik
  [41.0, 19.5],  // Albania
  [39.5, 20.0],  // closing toward Greece
];

// Iberian peninsula addition
const IBERIA: [number, number][] = [
  [43.3, -9.0],
  [42.0, -8.8],  // Porto
  [38.7, -9.5],  // Lisbon
  [37.0, -8.5],  // Algarve
  [36.0, -5.5],  // Gibraltar
  [37.0, -2.0],  // Almeria
  [38.5, 0.0],   // Alicante
  [41.4, 2.2],   // Barcelona
  [43.3, 3.0],   // Perpignan
  [43.5, -1.5],  // Basque
];

// Key locations
const ERNESTINOVO: [number, number] = [45.2, 18.7]; // Croatia - split origin
const GERMANY: [number, number] = [51.0, 10.0];
const FRANCE: [number, number] = [46.6, 2.2];
const SPAIN: [number, number] = [40.4, -3.7];
const POLAND: [number, number] = [52.0, 20.0];
const ROMANIA: [number, number] = [45.0, 25.0];
const LANDESBERGEN: [number, number] = [52.5, 9.1]; // Origin of 2006 cascade

// The split line runs roughly from NW Germany through Austria to Croatia
const SPLIT_LINE: [number, number][] = [
  [55.0, 8.5],    // North Sea coast
  [53.0, 9.0],    // Northern Germany
  [52.0, 10.0],   // Central Germany
  [50.5, 12.0],   // Czech border
  [49.0, 14.0],   // Czech Republic
  [48.0, 16.5],   // Vienna
  [47.0, 18.0],   // Hungary border
  [45.5, 18.5],   // Ernestinovo / Croatia
  [44.0, 20.0],   // Serbia
  [42.0, 21.0],   // North Macedonia
];

const CYAN = '#22d3ee';
const CYAN_DIM = '#22d3ee25';
const BLUE = '#3b82f6';
const BLUE_FILL = '#3b82f60c';
const BLUE_GLOW = '#3b82f660';
const RED_ZONE = '#ef4444';
const RED_FILL = '#ef44440c';
const RED_GLOW = '#ef444460';
const AMBER = '#f59e0b';

function makeToXY(w: number, h: number, padTop: number, legendH: number) {
  const lonMin = -10.0, lonMax = 31.0, latMin = 36.0, latMax = 56.0;
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

export default function EuropeGridMap({ width = 500, height = 400 }: Props) {
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
    const OUTLINE_DUR = 1200;
    const LABELS_START = 1000;
    const SPLIT_START = 1800;
    const SPLIT_DUR = 800;
    const COLOR_START = 2600;
    const COLOR_DUR = 600;

    function drawPath(points: [number, number][], progress: number, close: boolean) {
      const total = points.length;
      const pts = Math.min(total, Math.floor(progress * (total + 1)));
      if (pts < 2) return;

      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const p = xy(points[i][0], points[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      if (close && progress >= 1) ctx.closePath();
    }

    function drawOutline(progress: number) {
      ctx.strokeStyle = CYAN_DIM;
      ctx.lineWidth = 1;

      drawPath(EUROPE, progress, false);
      if (progress >= 1) {
        ctx.fillStyle = '#22d3ee04';
        ctx.fill();
      }
      ctx.stroke();

      // Iberian peninsula
      if (progress > 0.1) {
        const iberProg = Math.min(1, (progress - 0.1) / 0.9);
        drawPath(IBERIA, iberProg, false);
        ctx.stroke();
      }
    }

    function drawLabels(progress: number) {
      if (progress <= 0) return;
      ctx.globalAlpha = Math.min(1, progress * 2);
      ctx.font = '8px "JetBrains Mono", monospace';
      ctx.fillStyle = '#71717a';

      const cities: { pos: [number, number]; label: string }[] = [
        { pos: GERMANY, label: 'Germany' },
        { pos: FRANCE, label: 'France' },
        { pos: SPAIN, label: 'Spain' },
        { pos: POLAND, label: 'Poland' },
        { pos: ERNESTINOVO, label: 'Ernestinovo' },
      ];

      for (const c of cities) {
        const p = xy(c.pos[0], c.pos[1]);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = CYAN;
        ctx.fill();
        ctx.fillStyle = '#71717a';
        ctx.fillText(c.label, p.x + 6, p.y + 3);
      }

      // Landesbergen marker
      const lp = xy(LANDESBERGEN[0], LANDESBERGEN[1]);
      ctx.beginPath();
      ctx.arc(lp.x, lp.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = AMBER;
      ctx.fill();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Landesbergen', lp.x + 6, lp.y + 3);

      ctx.globalAlpha = 1;
    }

    function drawSplitLine(progress: number) {
      if (progress <= 0) return;
      const total = SPLIT_LINE.length;
      const pts = Math.min(total, Math.floor(progress * (total + 1)));
      if (pts < 2) return;

      ctx.shadowColor = RED_GLOW;
      ctx.shadowBlur = 6;
      ctx.strokeStyle = RED_ZONE;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 3]);
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const p = xy(SPLIT_LINE[i][0], SPLIT_LINE[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      // "SPLIT" label at midpoint
      if (progress >= 0.5) {
        const mp = xy(SPLIT_LINE[4][0], SPLIT_LINE[4][1]);
        ctx.font = 'bold 9px "JetBrains Mono", monospace';
        ctx.fillStyle = RED_ZONE;
        ctx.shadowColor = RED_GLOW;
        ctx.shadowBlur = 4;
        ctx.fillText('SPLIT', mp.x + 8, mp.y - 4);
        ctx.shadowBlur = 0;
      }
    }

    function drawZoneColors(progress: number) {
      if (progress <= 0) return;
      ctx.globalAlpha = progress * 0.15;

      // West zone (blue - low frequency 49.0 Hz)
      ctx.fillStyle = BLUE;
      ctx.beginPath();
      const westPts: [number, number][] = [
        [55.0, -10.0], [55.0, 8.5], ...SPLIT_LINE, [36.0, 21.0], [36.0, -10.0]
      ];
      for (let i = 0; i < westPts.length; i++) {
        const p = xy(westPts[i][0], westPts[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();

      // East zone (red - high frequency 51.4 Hz)
      ctx.fillStyle = RED_ZONE;
      ctx.beginPath();
      const eastPts: [number, number][] = [
        [55.0, 8.5], [55.0, 31.0], [36.0, 31.0], [36.0, 21.0],
        ...[...SPLIT_LINE].reverse()
      ];
      for (let i = 0; i < eastPts.length; i++) {
        const p = xy(eastPts[i][0], eastPts[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.fill();

      ctx.globalAlpha = 1;

      // Frequency labels
      if (progress > 0.4) {
        const labelAlpha = Math.min(1, (progress - 0.4) / 0.6);
        ctx.globalAlpha = labelAlpha;

        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        const wP = xy(FRANCE[0], FRANCE[1]);
        ctx.fillStyle = BLUE;
        ctx.shadowColor = BLUE_GLOW;
        ctx.shadowBlur = 4;
        ctx.fillText('49.0 Hz', wP.x - 10, wP.y - 14);
        ctx.shadowBlur = 0;

        const eP = xy(POLAND[0], POLAND[1]);
        ctx.fillStyle = RED_ZONE;
        ctx.shadowColor = RED_GLOW;
        ctx.shadowBlur = 4;
        ctx.fillText('51.4 Hz', eP.x - 10, eP.y - 14);
        ctx.shadowBlur = 0;

        ctx.globalAlpha = 1;
      }
    }

    function drawLegend() {
      const y = height - 10;
      const leftX = 12;
      ctx.font = '9px "JetBrains Mono", monospace';

      // West zone
      ctx.fillStyle = BLUE;
      ctx.fillRect(leftX, y - 4, 10, 8);
      ctx.globalAlpha = 0.3;
      ctx.fillRect(leftX, y - 4, 10, 8);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('West (under-freq)', leftX + 16, y + 3);

      // East zone
      const eX = leftX + 150;
      ctx.fillStyle = RED_ZONE;
      ctx.fillRect(eX, y - 4, 10, 8);
      ctx.globalAlpha = 0.3;
      ctx.fillRect(eX, y - 4, 10, 8);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('East (over-freq)', eX + 16, y + 3);

      // Split origin
      const sX = eX + 140;
      ctx.beginPath();
      ctx.arc(sX + 4, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = AMBER;
      ctx.fill();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Trigger', sX + 12, y + 3);
    }

    function frame(now: number) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      const outlineProg = Math.min(1, elapsed / OUTLINE_DUR);
      drawOutline(outlineProg);

      if (elapsed > LABELS_START) {
        drawLabels(Math.min(1, (elapsed - LABELS_START) / 400));
      }

      if (elapsed > SPLIT_START) {
        drawSplitLine(Math.min(1, (elapsed - SPLIT_START) / SPLIT_DUR));
      }

      if (elapsed > COLOR_START) {
        drawZoneColors(Math.min(1, (elapsed - COLOR_START) / COLOR_DUR));
      }

      drawLegend();

      const totalDur = COLOR_START + COLOR_DUR + 100;
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
