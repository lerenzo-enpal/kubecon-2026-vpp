import { useCallback } from 'react';
import ScrollBriefing from './ScrollBriefing';
import type { CanvasThemeColors } from '../shared/canvasTheme';

interface ThresholdZone {
  hz: number;
  label: string;
  status: string;
  color: string;
}

function render(
  ctx: CanvasRenderingContext2D,
  progress: number,
  w: number,
  h: number,
  colors: CanvasThemeColors
) {
  const now = Date.now();
  const monoFont = '"JetBrains Mono", monospace';
  const cx = w / 2;
  const cy = h / 2;

  // Define threshold zones with progress ranges
  const zones: ThresholdZone[] = [
    { hz: 50.0, label: 'NORMAL', status: 'All generators synchronized', color: '#10b981' },
    { hz: 49.8, label: 'FCR ACTIVATED', status: 'Primary reserves respond in 30 seconds', color: '#f59e0b' },
    { hz: 49.5, label: 'aFRR ACTIVATED', status: 'Secondary reserves, 5 minutes', color: '#d97706' },
    { hz: 49.0, label: 'LOAD SHEDDING', status: 'Neighborhoods go dark to save the grid', color: '#ef4444' },
    { hz: 48.0, label: 'CASCADING', status: 'More load shedding stages', color: '#dc2626' },
    { hz: 47.5, label: 'COLLAPSE', status: 'Generators disconnect. Game over.', color: '#991b1b' },
  ];

  // Map progress to frequency: 50.0 -> 47.5
  const breakpoints = [0, 0.15, 0.30, 0.45, 0.60, 0.75];
  let currentHz = 47.5;
  let zoneIdx = 5;

  for (let i = 0; i < breakpoints.length - 1; i++) {
    if (progress >= breakpoints[i] && progress < breakpoints[i + 1]) {
      const sub = (progress - breakpoints[i]) / (breakpoints[i + 1] - breakpoints[i]);
      currentHz = zones[i].hz - sub * (zones[i].hz - zones[i + 1].hz);
      zoneIdx = i;
      break;
    }
  }
  if (progress >= 0.75) {
    const sub = (progress - 0.75) / 0.25;
    currentHz = zones[4].hz - sub * (zones[4].hz - zones[5].hz);
    zoneIdx = 5;
  }

  const zone = zones[zoneIdx];

  // Background color shift based on severity
  if (zoneIdx >= 3) {
    const severity = (zoneIdx - 3) / 2;
    const pulse = zoneIdx === 5 ? (0.5 + Math.sin(now / 300) * 0.3) : 1;
    const bgAlpha = 0.08 + severity * 0.1;
    ctx.fillStyle = `rgba(239, 68, 68, ${bgAlpha * pulse})`;
    ctx.fillRect(0, 0, w, h);
  }

  // Gauge dimensions
  const gaugeR = Math.min(w, h) * 0.3;
  const gaugeX = cx;
  const gaugeY = cy - 10;

  // Gauge arc: spans from 7 o'clock to 5 o'clock (270 degrees)
  const arcStart = Math.PI * 0.75;
  const totalArc = Math.PI * 1.5;

  // Draw colored arc segments (50.0 to 47.5, mapped onto arc)
  const arcSegments = [
    { from: 50.0, to: 49.8, color: '#10b981' },  // green
    { from: 49.8, to: 49.5, color: '#f59e0b' },  // amber
    { from: 49.5, to: 49.0, color: '#d97706' },  // deep amber
    { from: 49.0, to: 48.0, color: '#ef4444' },  // red
    { from: 48.0, to: 47.5, color: '#dc2626' },  // deep red
  ];

  const hzToAngle = (hz: number) => {
    const norm = (50.0 - hz) / 2.5; // 0 at 50 Hz, 1 at 47.5 Hz
    return arcStart + norm * totalArc;
  };

  // Background arc track
  ctx.strokeStyle = colors.surfaceLight;
  ctx.lineWidth = 16;
  ctx.lineCap = 'butt';
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, gaugeR, arcStart, arcStart + totalArc);
  ctx.stroke();

  // Colored segments
  arcSegments.forEach((seg) => {
    const segStart = hzToAngle(seg.from);
    const segEnd = hzToAngle(seg.to);
    ctx.strokeStyle = seg.color;
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeR, segStart, segEnd);
    ctx.stroke();
  });

  // Tick marks at each threshold
  zones.forEach((z) => {
    const tickAngle = hzToAngle(z.hz);
    const innerR = gaugeR - 20;
    const outerR = gaugeR + 14;
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(
      gaugeX + Math.cos(tickAngle) * innerR,
      gaugeY + Math.sin(tickAngle) * innerR
    );
    ctx.lineTo(
      gaugeX + Math.cos(tickAngle) * outerR,
      gaugeY + Math.sin(tickAngle) * outerR
    );
    ctx.stroke();

    // Hz label at tick
    const labelR = gaugeR + 26;
    ctx.font = `10px ${monoFont}`;
    ctx.fillStyle = colors.textDim;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      z.hz.toFixed(1),
      gaugeX + Math.cos(tickAngle) * labelR,
      gaugeY + Math.sin(tickAngle) * labelR
    );
  });

  // Needle
  const needleAngle = hzToAngle(currentHz);
  const needleLen = gaugeR - 24;

  // Needle shadow/glow for collapse
  if (zoneIdx === 5) {
    const pulse = 0.5 + Math.sin(now / 200) * 0.5;
    ctx.shadowColor = colors.danger;
    ctx.shadowBlur = 20 * pulse;
  }

  ctx.strokeStyle = zone.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(gaugeX, gaugeY);
  ctx.lineTo(
    gaugeX + Math.cos(needleAngle) * needleLen,
    gaugeY + Math.sin(needleAngle) * needleLen
  );
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Center cap
  ctx.beginPath();
  ctx.arc(gaugeX, gaugeY, 8, 0, Math.PI * 2);
  ctx.fillStyle = zone.color;
  ctx.fill();

  // Digital Hz readout
  ctx.font = `bold 28px ${monoFont}`;
  ctx.fillStyle = zone.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  if (zoneIdx === 5) {
    const pulse = 0.6 + Math.sin(now / 200) * 0.4;
    ctx.shadowColor = zone.color;
    ctx.shadowBlur = 15 * pulse;
  }
  ctx.fillText(`${currentHz.toFixed(2)} Hz`, gaugeX, gaugeY + gaugeR + 50);
  ctx.shadowBlur = 0;

  // Status label
  ctx.font = `bold 12px ${monoFont}`;
  ctx.fillStyle = zone.color;
  ctx.fillText(zone.label, gaugeX, gaugeY + gaugeR + 72);

  // Status description
  ctx.font = `11px ${monoFont}`;
  ctx.fillStyle = colors.textMuted;
  ctx.fillText(zone.status, gaugeX, gaugeY + gaugeR + 90);

  // "Hz" unit inside gauge
  ctx.font = `13px ${monoFont}`;
  ctx.fillStyle = colors.textDim;
  ctx.fillText('Hz', gaugeX, gaugeY + 24);

  ctx.textBaseline = 'alphabetic';
}

export default function ThresholdWalkthroughBriefing() {
  const renderCb = useCallback(render, []);

  return (
    <ScrollBriefing id="thresholds" height={450} render={renderCb}>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          50.0 Hz: Normal
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          At exactly 50 Hz, supply perfectly matches demand. Every generator
          is spinning at its target speed. This is the ideal state -- and
          it almost never lasts more than a few seconds.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          49.8 Hz: Primary Response (FCR)
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          At 49.8 Hz, Frequency Containment Reserves activate automatically.
          These are generators already spinning with headroom. They ramp up
          within 30 seconds -- no human decision needed.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          49.5 Hz: Secondary Reserves (aFRR)
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Automatic Frequency Restoration Reserves kick in. These are
          slower but larger -- additional generation capacity that
          activates within 5 minutes. Still automatic, controlled by
          the TSO's systems.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          49.0 Hz: Load Shedding
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          This is where it gets ugly. Automated relays start disconnecting
          entire neighborhoods from the grid. People lose power -- not
          because of a local fault, but to save the rest of the system.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          48.0 Hz: Cascading Failures
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          More stages of load shedding. Industrial consumers disconnected.
          The grid is fighting for survival. Each additional stage buys
          time -- but the margin is razor thin.
        </p>
      </div>
      <div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ color: 'var(--color-text)' }}
        >
          47.5 Hz: Total Collapse
        </h3>
        <p style={{ color: 'var(--color-text-muted)' }}>
          Generators disconnect to protect themselves. Without generators,
          frequency falls faster, causing more disconnections. The grid
          goes dark. Restarting takes hours to days. The entire margin
          from normal to collapse is just 2.5 Hz.
        </p>
      </div>
    </ScrollBriefing>
  );
}
