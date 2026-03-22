import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

interface TechInfo {
  name: string;
  stats: string;
  verdict: string;
}

const TECHS: TechInfo[] = [
  { name: 'Flow Batteries', stats: '4-12h, 70-80% eff., 20,000+ cycles', verdict: 'Scale energy independently of power.' },
  { name: 'Pumped Hydro', stats: '6-24h, 75-85% eff., 50+ yr life, 90% of world storage', verdict: '100 years old, still unmatched at scale.' },
  { name: 'Compressed Air', stats: '8-24h, 40-70% eff., GWh-scale', verdict: 'Massive scale. Needs salt caverns.' },
  { name: 'Gravity Storage', stats: '4-12h, 80-85% eff., 35+ yr life', verdict: 'Potential energy in, potential energy out.' },
  { name: 'Thermal', stats: 'Hours to days, 50-95% eff.', verdict: 'Heat is cheap to store.' },
  { name: 'Hydrogen', stats: 'Days to seasonal, 30-40% eff.', verdict: 'Months of storage. 60-70% lost in round trip.' },
  { name: 'Flywheels', stats: 'Seconds to minutes, 85-95% eff., 100,000+ cycles', verdict: 'The sprinter, not the marathoner.' },
];

const SEG = 1 / TECHS.length;

function drawFlowBattery(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, colors: CanvasThemeColors, t: number) {
  const monoFont = '"JetBrains Mono", monospace';
  const tankW = w * 0.22;
  const tankH = h * 0.5;
  const cellW = w * 0.12;
  const cellH = h * 0.35;

  // Left tank (electrolyte)
  const ltx = cx - w * 0.32;
  const lty = cy - tankH / 2;
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(ltx, lty, tankW, tankH);
  // Fill level
  const fillH = tankH * (0.5 + 0.3 * Math.sin(t * 2));
  ctx.fillStyle = 'rgba(168, 85, 247, 0.3)';
  ctx.fillRect(ltx + 1, lty + tankH - fillH, tankW - 2, fillH - 1);
  ctx.font = `9px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText('Catholyte', ltx + tankW / 2, lty - 6);

  // Right tank
  const rtx = cx + w * 0.1;
  ctx.strokeStyle = colors.textDim;
  ctx.strokeRect(rtx, lty, tankW, tankH);
  const fillH2 = tankH * (0.5 - 0.3 * Math.sin(t * 2));
  ctx.fillStyle = 'rgba(34, 211, 238, 0.3)';
  ctx.fillRect(rtx + 1, lty + tankH - fillH2, tankW - 2, fillH2 - 1);
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('Anolyte', rtx + tankW / 2, lty - 6);

  // Central cell stack
  const ccx = cx - cellW / 2;
  const ccy = cy - cellH / 2;
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  ctx.strokeRect(ccx, ccy, cellW, cellH);
  // Membrane line
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.moveTo(cx, ccy);
  ctx.lineTo(cx, ccy + cellH);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `8px ${monoFont}`;
  ctx.fillStyle = colors.primary;
  ctx.fillText('Cell', cx, cy + 4);

  // Connection lines
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(ltx + tankW, cy);
  ctx.lineTo(ccx, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ccx + cellW, cy);
  ctx.lineTo(rtx, cy);
  ctx.stroke();

  // Particles flowing
  for (let i = 0; i < 6; i++) {
    const phase = (t * 3 + i * 0.8) % 1;
    const px = ltx + tankW + phase * (ccx - ltx - tankW);
    ctx.beginPath();
    ctx.arc(px, cy + Math.sin(i * 2 + t * 4) * 4, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(168, 85, 247, 0.7)';
    ctx.fill();
  }
}

function drawPumpedHydro(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, colors: CanvasThemeColors, t: number) {
  const monoFont = '"JetBrains Mono", monospace';

  // Upper reservoir
  const urx = cx - w * 0.2;
  const ury = cy - h * 0.35;
  const rw = w * 0.4;
  const rh = h * 0.15;
  ctx.fillStyle = 'rgba(59, 130, 246, 0.2)';
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(urx, ury, rw, rh, 4);
  ctx.fill();
  ctx.stroke();
  ctx.font = `9px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText('Upper Reservoir', cx, ury - 6);

  // Lower reservoir
  const lry = cy + h * 0.2;
  ctx.fillStyle = 'rgba(59, 130, 246, 0.35)';
  ctx.beginPath();
  ctx.roundRect(urx, lry, rw, rh, 4);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('Lower Reservoir', cx, lry + rh + 14);

  // Penstock (connecting pipe)
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, ury + rh);
  ctx.lineTo(cx, lry);
  ctx.stroke();

  // Turbine symbol at midpoint
  const turbY = (ury + rh + lry) / 2;
  ctx.beginPath();
  ctx.arc(cx, turbY, 12, 0, Math.PI * 2);
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  ctx.stroke();
  // Spinning blades
  for (let b = 0; b < 3; b++) {
    const angle = t * 4 + (b * Math.PI * 2) / 3;
    ctx.beginPath();
    ctx.moveTo(cx, turbY);
    ctx.lineTo(cx + Math.cos(angle) * 10, turbY + Math.sin(angle) * 10);
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.font = `8px ${monoFont}`;
  ctx.fillStyle = colors.primary;
  ctx.textAlign = 'left';
  ctx.fillText('Turbine', cx + 18, turbY + 4);

  // Water particles flowing down
  const generating = Math.sin(t * 2) > 0;
  for (let i = 0; i < 5; i++) {
    const phase = (t * 2 + i * 0.2) % 1;
    const py = generating
      ? ury + rh + phase * (lry - ury - rh)
      : lry - phase * (lry - ury - rh);
    ctx.beginPath();
    ctx.arc(cx + Math.sin(i * 3 + t * 5) * 3, py, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
    ctx.fill();
  }
}

function drawCompressedAir(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, colors: CanvasThemeColors, t: number) {
  const monoFont = '"JetBrains Mono", monospace';

  // Surface compressor
  const compX = cx - w * 0.15;
  const compY = cy - h * 0.3;
  const compW = w * 0.12;
  const compH = h * 0.12;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(compX, compY, compW, compH);
  ctx.font = `8px ${monoFont}`;
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.fillText('Compressor', compX + compW / 2, compY - 6);

  // Expansion turbine
  const turbX = cx + w * 0.05;
  ctx.strokeStyle = colors.primary;
  ctx.strokeRect(turbX, compY, compW, compH);
  ctx.fillStyle = colors.primary;
  ctx.fillText('Expander', turbX + compW / 2, compY - 6);

  // Underground cavern (irregular oval)
  const cavX = cx;
  const cavY = cy + h * 0.12;
  const cavRx = w * 0.2;
  const cavRy = h * 0.2;
  ctx.beginPath();
  ctx.ellipse(cavX, cavY, cavRx, cavRy, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
  ctx.fill();
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.font = `9px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText('Salt Cavern', cavX, cavY + cavRy + 14);

  // Shaft connecting surface to cavern
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx, compY + compH);
  ctx.lineTo(cx, cavY - cavRy);
  ctx.stroke();

  // Air particles
  const storing = Math.sin(t * 1.5) > 0;
  for (let i = 0; i < 4; i++) {
    const phase = (t * 2 + i * 0.25) % 1;
    const py = storing
      ? compY + compH + phase * (cavY - cavRy - compY - compH)
      : cavY - cavRy - phase * (cavY - cavRy - compY - compH);
    ctx.beginPath();
    ctx.arc(cx + Math.sin(i * 2 + t * 3) * 4, py, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.7)';
    ctx.fill();
  }
}

function drawGravityStorage(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, colors: CanvasThemeColors, t: number) {
  const monoFont = '"JetBrains Mono", monospace';

  // Tower structure
  const towerW = w * 0.08;
  const towerH = h * 0.6;
  const towerX = cx - towerW / 2;
  const towerY = cy - towerH / 2;
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(towerX, towerY, towerW, towerH);

  // Crane arm at top
  const armW = w * 0.25;
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - armW / 2, towerY);
  ctx.lineTo(cx + armW / 2, towerY);
  ctx.stroke();

  // Block position (oscillates up/down)
  const blockPhase = (Math.sin(t * 1.5) + 1) / 2; // 0-1
  const blockY = towerY + 20 + blockPhase * (towerH - 50);
  const blockSize = 18;

  // Cable
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx, towerY);
  ctx.lineTo(cx, blockY);
  ctx.stroke();

  // Concrete block
  ctx.fillStyle = 'rgba(34, 197, 94, 0.4)';
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.fillRect(cx - blockSize / 2, blockY, blockSize, blockSize);
  ctx.strokeRect(cx - blockSize / 2, blockY, blockSize, blockSize);

  // Labels
  ctx.font = `9px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText('Crane Tower', cx, towerY + towerH + 16);

  // Direction arrow
  const goingUp = Math.cos(t * 1.5) < 0;
  ctx.fillStyle = goingUp ? 'rgba(34, 197, 94, 0.8)' : colors.textDim;
  ctx.font = `8px ${monoFont}`;
  ctx.textAlign = 'left';
  ctx.fillText(goingUp ? 'STORING' : 'GENERATING', cx + blockSize, blockY + blockSize / 2 + 3);
}

function drawThermal(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, colors: CanvasThemeColors, t: number) {
  const monoFont = '"JetBrains Mono", monospace';

  // Thermal storage tank
  const tankW = w * 0.3;
  const tankH = h * 0.45;
  const tankX = cx - tankW / 2;
  const tankY = cy - tankH / 2;

  ctx.beginPath();
  ctx.roundRect(tankX, tankY, tankW, tankH, 8);
  ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
  ctx.fill();
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Glowing contents (gradient from red-white at center)
  const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, tankW * 0.4);
  grd.addColorStop(0, `rgba(255, 200, 100, ${0.3 + 0.15 * Math.sin(t * 3)})`);
  grd.addColorStop(0.5, 'rgba(251, 146, 60, 0.2)');
  grd.addColorStop(1, 'rgba(251, 146, 60, 0)');
  ctx.fillStyle = grd;
  ctx.beginPath();
  ctx.roundRect(tankX + 4, tankY + 4, tankW - 8, tankH - 8, 6);
  ctx.fill();

  // Heat waves
  for (let i = 0; i < 5; i++) {
    const waveX = tankX + 10 + (i / 4) * (tankW - 20);
    const waveY = tankY - 8 - Math.sin(t * 4 + i * 1.5) * 6;
    ctx.strokeStyle = `rgba(251, 146, 60, ${0.3 + 0.2 * Math.sin(t * 3 + i)})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(waveX, tankY - 2);
    ctx.quadraticCurveTo(waveX + 3, waveY - 4, waveX, waveY - 8);
    ctx.stroke();
  }

  // Labels
  ctx.font = `9px ${monoFont}`;
  ctx.fillStyle = 'rgba(251, 146, 60, 0.9)';
  ctx.textAlign = 'center';
  ctx.fillText('Molten Salt / Carbon Blocks', cx, cy + 4);
  ctx.fillStyle = colors.textMuted;
  ctx.fillText('1500 C', cx, cy + 16);
  ctx.fillText('Thermal Store', cx, tankY + tankH + 16);
}

function drawHydrogen(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, colors: CanvasThemeColors, t: number) {
  const monoFont = '"JetBrains Mono", monospace';
  const boxW = w * 0.14;
  const boxH = h * 0.15;

  // Electrolyzer
  const elX = cx - w * 0.3;
  const elY = cy - boxH / 2;
  ctx.strokeStyle = 'rgba(163, 230, 53, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(elX, elY, boxW, boxH);
  ctx.font = `8px ${monoFont}`;
  ctx.fillStyle = 'rgba(163, 230, 53, 0.9)';
  ctx.textAlign = 'center';
  ctx.fillText('Electrolyzer', elX + boxW / 2, elY - 6);
  ctx.font = `7px ${monoFont}`;
  ctx.fillStyle = colors.textDim;
  ctx.fillText('H2O -> H2 + O2', elX + boxW / 2, cy + 4);

  // H2 storage tank (cylinder shape)
  const stX = cx - boxW / 2;
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(stX, elY - 5, boxW, boxH + 10, 10);
  ctx.stroke();
  ctx.fillStyle = 'rgba(163, 230, 53, 0.15)';
  ctx.fill();
  ctx.font = `9px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText('H2 Tank', cx, elY - 12);

  // Fuel cell
  const fcX = cx + w * 0.16;
  ctx.strokeStyle = 'rgba(163, 230, 53, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(fcX, elY, boxW, boxH);
  ctx.font = `8px ${monoFont}`;
  ctx.fillStyle = 'rgba(163, 230, 53, 0.9)';
  ctx.fillText('Fuel Cell', fcX + boxW / 2, elY - 6);
  ctx.font = `7px ${monoFont}`;
  ctx.fillStyle = colors.textDim;
  ctx.fillText('H2 -> Electricity', fcX + boxW / 2, cy + 4);

  // Connection arrows
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(elX + boxW, cy);
  ctx.lineTo(stX, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(stX + boxW, cy);
  ctx.lineTo(fcX, cy);
  ctx.stroke();

  // H2 particles
  for (let i = 0; i < 3; i++) {
    const phase = (t * 2 + i * 0.33) % 1;
    const px = elX + boxW + phase * (stX - elX - boxW);
    ctx.beginPath();
    ctx.arc(px, cy + Math.sin(i * 3 + t * 4) * 3, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(163, 230, 53, 0.7)';
    ctx.fill();
  }

  // Input/output labels
  ctx.font = `7px ${monoFont}`;
  ctx.fillStyle = colors.textDim;
  ctx.textAlign = 'center';
  ctx.fillText('Water in', elX + boxW / 2, cy + boxH / 2 + 14);
  ctx.fillText('Electricity out', fcX + boxW / 2, cy + boxH / 2 + 14);
}

function drawFlywheel(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number, h: number, colors: CanvasThemeColors, t: number) {
  const monoFont = '"JetBrains Mono", monospace';
  const radius = Math.min(w, h) * 0.22;

  // Vacuum chamber (outer circle)
  ctx.beginPath();
  ctx.arc(cx, cy, radius + 10, 0, Math.PI * 2);
  ctx.strokeStyle = colors.textDim;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.font = `8px ${monoFont}`;
  ctx.fillStyle = colors.textDim;
  ctx.textAlign = 'center';
  ctx.fillText('Vacuum Chamber', cx, cy + radius + 26);

  // Spinning disc
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(34, 211, 238, 0.12)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Speed lines (rotating)
  const speed = t * 8;
  for (let i = 0; i < 6; i++) {
    const angle = speed + (i * Math.PI * 2) / 6;
    const innerR = radius * 0.3;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * innerR, cy + Math.sin(angle) * innerR);
    ctx.lineTo(cx + Math.cos(angle) * radius * 0.9, cy + Math.sin(angle) * radius * 0.9);
    ctx.strokeStyle = `rgba(34, 211, 238, ${0.2 + 0.15 * Math.sin(t * 6 + i)})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Center bearing
  ctx.beginPath();
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fillStyle = colors.textMuted;
  ctx.fill();

  // Magnetic bearing labels
  ctx.font = `7px ${monoFont}`;
  ctx.fillStyle = colors.primary;
  ctx.textAlign = 'left';
  ctx.fillText('Magnetic Bearings', cx + radius + 14, cy);
}

const DRAW_FUNCS = [drawFlowBattery, drawPumpedHydro, drawCompressedAir, drawGravityStorage, drawThermal, drawHydrogen, drawFlywheel];

function render(
  ctx: CanvasRenderingContext2D,
  progress: number,
  w: number,
  h: number,
  colors: CanvasThemeColors
) {
  const monoFont = '"JetBrains Mono", monospace';
  const now = Date.now() / 1000;
  const cx = w / 2;
  const padTop = 35;
  const padBottom = 45;
  const drawH = h - padTop - padBottom;
  const drawCy = padTop + drawH / 2;

  // Determine which technology to show
  const segIdx = Math.min(TECHS.length - 1, Math.floor(progress / SEG));
  const segProg = (progress - segIdx * SEG) / SEG;

  // Fade in/out
  const fadeIn = Math.min(1, segProg * 5);
  const fadeOut = Math.min(1, (1 - segProg) * 5);
  const alpha = Math.min(fadeIn, fadeOut);

  const tech = TECHS[segIdx];
  ctx.globalAlpha = alpha;

  // Title
  ctx.font = `bold 14px ${monoFont}`;
  ctx.fillStyle = colors.primary;
  ctx.textAlign = 'center';
  ctx.fillText(tech.name, cx, padTop - 8);

  // Draw the technology diagram
  DRAW_FUNCS[segIdx](ctx, cx, drawCy, w, drawH, colors, now);

  // Stats bar at bottom
  ctx.font = `10px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  ctx.textAlign = 'center';
  ctx.fillText(tech.stats, cx, h - padBottom + 14);

  // Verdict
  ctx.font = `bold 11px ${monoFont}`;
  ctx.fillStyle = colors.text;
  ctx.fillText(`"${tech.verdict}"`, cx, h - padBottom + 30);

  // Progress indicator (dots)
  ctx.globalAlpha = 0.5;
  const dotSpacing = 14;
  const dotsX = cx - ((TECHS.length - 1) * dotSpacing) / 2;
  for (let i = 0; i < TECHS.length; i++) {
    ctx.beginPath();
    ctx.arc(dotsX + i * dotSpacing, h - 8, i === segIdx ? 4 : 2.5, 0, Math.PI * 2);
    ctx.fillStyle = i === segIdx ? colors.primary : colors.textDim;
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

export default function StorageZooBriefing() {
  const renderCb = useCallback(render, []);

  return (
    <ScrollBriefing id="storage-zoo" height={400} render={renderCb}>
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Flow Batteries
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Two tanks of liquid electrolyte pump through a central cell stack.
          Scale storage capacity by adding bigger tanks without changing the
          power electronics.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Pumped Hydro
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Pump water uphill when power is cheap, release it through turbines
          when demand peaks. 90% of global energy storage is pumped hydro.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Compressed Air (CAES)
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Compress air into underground salt caverns, then expand it through
          turbines to generate power. GWh-scale potential.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Gravity Storage
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Lift heavy blocks when storing energy, lower them to generate power.
          Simple physics, no exotic materials.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Thermal Storage
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Store energy as heat in molten salt or carbon blocks at extreme
          temperatures. Heat is one of the cheapest forms of energy storage.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Hydrogen
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Split water into hydrogen via electrolysis, store it, then convert
          back in a fuel cell. The only technology that can store energy for
          months. But 60-70% of energy is lost in the round trip.
        </p>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
          Flywheels
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          A massive disc spinning at extreme speed in a vacuum. Near-instant
          response, 100,000+ cycles, but only stores energy for seconds to
          minutes.
        </p>
      </div>
    </ScrollBriefing>
  );
}
