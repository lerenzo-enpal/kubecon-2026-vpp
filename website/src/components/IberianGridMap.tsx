import { useEffect, useRef } from 'react';

/**
 * Animated Iberian Peninsula map showing the 2025 blackout.
 * Solar farms pulse amber, then the entire peninsula goes dark in 6 seconds.
 */

interface Props {
  width?: number;
  height?: number;
}

// Spain + Portugal outline (lat, lon)
const IBERIA: [number, number][] = [
  [43.3, -9.0],   // Galicia NW
  [43.5, -8.0],   // A Coruna
  [43.5, -5.5],   // Asturias
  [43.4, -3.8],   // Cantabria
  [43.3, -1.8],   // Basque Country
  [42.8, -0.5],   // Pyrenees west
  [42.7, 0.7],    // Pyrenees central
  [42.5, 3.0],    // Perpignan
  [41.4, 2.2],    // Barcelona
  [40.5, 0.5],    // Valencia coast
  [38.5, 0.0],    // Alicante
  [37.6, -1.0],   // Murcia
  [36.7, -2.3],   // Almeria
  [36.0, -5.4],   // Gibraltar
  [36.8, -6.3],   // Cadiz
  [37.0, -7.5],   // Huelva
  [37.0, -8.5],   // Algarve
  [38.7, -9.5],   // Lisbon
  [39.5, -9.5],   // Nazare
  [40.6, -8.8],   // Porto area
  [42.0, -8.8],   // Vigo
  [43.3, -9.0],   // Close
];

// Key cities
const MADRID: [number, number] = [40.4, -3.7];
const BARCELONA: [number, number] = [41.4, 2.2];
const LISBON: [number, number] = [38.7, -9.1];
const SEVILLE: [number, number] = [37.4, -6.0];

// Solar farm locations (scattered across southern Spain)
const SOLAR_FARMS: [number, number][] = [
  [38.0, -3.5],   // Jaen
  [37.8, -4.8],   // Cordoba
  [37.5, -6.0],   // Seville area
  [38.5, -6.5],   // Badajoz
  [39.0, -3.0],   // Ciudad Real
  [39.5, -2.0],   // Albacete
  [38.0, -1.0],   // Murcia area
  [37.2, -3.7],   // Granada
  [39.0, -5.5],   // Caceres
  [38.5, -0.5],   // Alicante area
  [40.0, -2.5],   // Cuenca
  [37.5, -2.5],   // Almeria interior
  [39.8, -4.5],   // Toledo
  [38.8, -4.0],   // Puertollano
];

// France interconnection
const FRANCE_LINK: [number, number][] = [
  [42.8, -0.5],
  [43.2, 0.5],
  [43.5, 1.5],    // Toulouse direction
];

const CYAN = '#22d3ee';
const CYAN_DIM = '#22d3ee25';
const AMBER = '#f59e0b';
const AMBER_GLOW = '#f59e0b60';
const AMBER_DIM = '#f59e0b30';
const RED = '#ef4444';
const RED_GLOW = '#ef444480';

function makeToXY(w: number, h: number, padTop: number, legendH: number) {
  const lonMin = -10.0, lonMax = 4.0, latMin = 35.5, latMax = 44.0;
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

export default function IberianGridMap({ width = 500, height = 400 }: Props) {
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
    const SOLAR_START = 900;
    const SOLAR_DUR = 600;
    const PULSE_START = 1600;
    const PULSE_DUR = 800;
    const FRANCE_START = 1200;
    const FRANCE_DUR = 400;
    const FLASH_START = 2600;   // The 6-second collapse
    const FLASH_DUR = 300;
    const DARK_START = 2900;
    const DARK_DUR = 400;

    function drawOutline(progress: number) {
      const total = IBERIA.length;
      const pts = Math.min(total, Math.floor(progress * (total + 1)));
      if (pts < 2) return;

      ctx.strokeStyle = CYAN_DIM;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const p = xy(IBERIA[i][0], IBERIA[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      if (progress >= 1) {
        ctx.closePath();
        ctx.fillStyle = '#22d3ee04';
        ctx.fill();
      }
      ctx.stroke();

      // City labels
      if (progress >= 1) {
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#a1a1aa';

        const cities: { pos: [number, number]; label: string; dx: number; dy: number }[] = [
          { pos: MADRID, label: 'Madrid', dx: 8, dy: 3 },
          { pos: BARCELONA, label: 'Barcelona', dx: -50, dy: -6 },
          { pos: LISBON, label: 'Lisbon', dx: -36, dy: -6 },
          { pos: SEVILLE, label: 'Seville', dx: 8, dy: 3 },
        ];

        for (const c of cities) {
          const p = xy(c.pos[0], c.pos[1]);
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = CYAN;
          ctx.fill();
          ctx.fillStyle = '#a1a1aa';
          ctx.fillText(c.label, p.x + c.dx, p.y + c.dy);
        }
      }
    }

    function drawFranceLink(progress: number, tripped: boolean) {
      const total = FRANCE_LINK.length;
      const pts = Math.min(total, Math.floor(progress * (total + 1)));
      if (pts < 2) return;

      if (tripped) {
        ctx.strokeStyle = RED;
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.5;
      } else {
        ctx.strokeStyle = CYAN;
        ctx.shadowColor = '#22d3ee40';
        ctx.shadowBlur = 3;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([]);
      }

      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const p = xy(FRANCE_LINK[i][0], FRANCE_LINK[i][1]);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;

      if (progress >= 1) {
        const lp = xy(FRANCE_LINK[2][0], FRANCE_LINK[2][1]);
        ctx.font = '12px "JetBrains Mono", monospace';
        ctx.fillStyle = tripped ? RED : '#71717a';
        ctx.fillText(tripped ? 'TRIPPED' : 'FR link', lp.x + 4, lp.y - 4);
      }
    }

    function drawSolarFarms(progress: number, pulseProgress: number, isDark: boolean) {
      const total = SOLAR_FARMS.length;
      const farmsToShow = Math.min(total, Math.floor(progress * (total + 1)));

      for (let i = 0; i < farmsToShow; i++) {
        const p = xy(SOLAR_FARMS[i][0], SOLAR_FARMS[i][1]);

        if (isDark) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = AMBER_DIM;
          ctx.fill();
        } else {
          // Pulsing effect
          const pulse = pulseProgress > 0
            ? 1 + Math.sin(pulseProgress * Math.PI * 3 + i * 0.5) * 0.4
            : 1;
          ctx.shadowColor = AMBER_GLOW;
          ctx.shadowBlur = 6 * pulse;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5 * pulse, 0, Math.PI * 2);
          ctx.fillStyle = AMBER;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }

    function drawFlashAndDark(flashProgress: number, darkProgress: number) {
      // Flash: white/red flash across the peninsula
      if (flashProgress > 0 && flashProgress < 1) {
        const flashAlpha = 0.3 * Math.sin(flashProgress * Math.PI * 3);
        if (flashAlpha > 0) {
          ctx.globalAlpha = flashAlpha;
          ctx.fillStyle = '#ef4444';
          ctx.beginPath();
          for (let i = 0; i < IBERIA.length; i++) {
            const p = xy(IBERIA[i][0], IBERIA[i][1]);
            if (i === 0) ctx.moveTo(p.x, p.y);
            else ctx.lineTo(p.x, p.y);
          }
          ctx.closePath();
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // Dark overlay
      if (darkProgress > 0) {
        ctx.globalAlpha = darkProgress * 0.55;
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        for (let i = 0; i < IBERIA.length; i++) {
          const p = xy(IBERIA[i][0], IBERIA[i][1]);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;

        if (darkProgress > 0.4) {
          const alpha = Math.min(1, (darkProgress - 0.4) / 0.6);
          ctx.globalAlpha = alpha;
          const c = xy(39.5, -3.5);
          ctx.font = 'bold 12px "JetBrains Mono", monospace';
          ctx.fillStyle = RED;
          ctx.shadowColor = RED_GLOW;
          ctx.shadowBlur = 8;
          ctx.fillText('6-SECOND COLLAPSE', c.x - 55, c.y);
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }
      }
    }

    function drawLegend() {
      const y = height - 10;
      const leftX = 12;
      ctx.font = '12px "JetBrains Mono", monospace';

      // Solar farms
      ctx.beginPath();
      ctx.arc(leftX + 4, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = AMBER;
      ctx.fill();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Solar farms', leftX + 14, y + 3);

      // France link
      const fX = leftX + 105;
      ctx.strokeStyle = CYAN;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(fX, y); ctx.lineTo(fX + 14, y);
      ctx.stroke();
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('Interconnector', fX + 20, y + 3);

      // 59% solar label
      const sX = fX + 128;
      ctx.fillStyle = AMBER;
      ctx.fillText('59% solar at collapse', sX, y + 3);
    }

    function frame(now: number) {
      const elapsed = now - startTime;
      ctx.clearRect(0, 0, width, height);

      const outlineProg = Math.min(1, elapsed / OUTLINE_DUR);
      drawOutline(outlineProg);

      if (elapsed > FRANCE_START) {
        const franceProg = Math.min(1, (elapsed - FRANCE_START) / FRANCE_DUR);
        const tripped = elapsed > FLASH_START;
        drawFranceLink(franceProg, tripped);
      }

      if (elapsed > SOLAR_START) {
        const solarProg = Math.min(1, (elapsed - SOLAR_START) / SOLAR_DUR);
        const pulseProg = elapsed > PULSE_START
          ? Math.min(1, (elapsed - PULSE_START) / PULSE_DUR) : 0;
        const isDark = elapsed > DARK_START;
        drawSolarFarms(solarProg, pulseProg, isDark);
      }

      const flashProg = elapsed > FLASH_START
        ? Math.min(1, (elapsed - FLASH_START) / FLASH_DUR) : 0;
      const darkProg = elapsed > DARK_START
        ? Math.min(1, (elapsed - DARK_START) / DARK_DUR) : 0;
      drawFlashAndDark(flashProg, darkProg);

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
