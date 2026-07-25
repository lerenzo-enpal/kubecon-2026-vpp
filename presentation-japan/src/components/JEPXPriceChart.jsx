import React, { useRef, useEffect, useId } from 'react';
import { SlideContext } from 'spectacle';
import { animate, createTimeline, svg } from 'animejs';

const PRICE_DATA = [
  10, 11, 12, 14, 18, 22, 30, 45, 62, 80,
  105, 130, 155, 180, 210, 235, 251, 248, 240, 225,
  205, 185, 162, 140, 118, 95, 75, 58, 42, 32,
  24, 18, 14, 11, 10, 10, 10, 10, 10, 10,
];
const PEAK_IDX = 16;
const MAX_VAL = 260;
const Y_TICKS = [0, 50, 100, 150, 200, 250];
const VBOX_W = 800;

function smoothPath(pts, t = 0.4) {
  if (pts.length < 2) return '';
  let d = `M ${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const cp1x = p1[0] + (p2[0] - p0[0]) * t;
    const cp1y = p1[1] + (p2[1] - p0[1]) * t;
    const cp2x = p2[0] - (p3[0] - p1[0]) * t;
    const cp2y = p2[1] - (p3[1] - p1[1]) * t;
    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

export function JEPXPriceChart({ height = 320 }) {
  const lineRef = useRef(null);
  const areaRef = useRef(null);
  const clipRectRef = useRef(null);
  const peakDotRef = useRef(null);
  const peakGroupRef = useRef(null);
  const baseLabelRef = useRef(null);
  const slideCtx = React.useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;
  const uid = useId().replace(/:/g, '');

  const PAD = { l: 64, r: 56, t: 52, b: 60 };
  const cW = VBOX_W - PAD.l - PAD.r;
  const cH = height - PAD.t - PAD.b;

  const xScale = (i) => PAD.l + (i / (PRICE_DATA.length - 1)) * cW;
  const yScale = (v) => PAD.t + cH - (v / MAX_VAL) * cH;

  const pts = PRICE_DATA.map((v, i) => [xScale(i), yScale(v)]);
  const lastPt = pts[pts.length - 1];
  const linePath = smoothPath(pts);
  const areaPath = linePath +
    ` L ${lastPt[0].toFixed(1)},${(PAD.t + cH).toFixed(1)} L ${PAD.l},${(PAD.t + cH).toFixed(1)} Z`;

  const peakX = xScale(PEAK_IDX);
  const peakY = yScale(251);
  const baselineY = yScale(10);

  const fillId = `jepx-fill-${uid}`;
  const clipId = `jepx-clip-${uid}`;

  useEffect(() => {
    if (!isActive) return;
    const lineEl = lineRef.current;
    const peakDot = peakDotRef.current;
    const peakGroup = peakGroupRef.current;
    const baseLabel = baseLabelRef.current;
    const clipRect = clipRectRef.current;
    if (!lineEl) return;

    const [drawable] = svg.createDrawable(lineEl);

    const tl = createTimeline({ defaults: { ease: 'inOutCubic' } });
    tl
      .add(drawable, { draw: ['0 0', '0 100'], duration: 2200 })
      .add(clipRect, { width: [0, cW + 16], duration: 2200, ease: 'inOutCubic' }, 0)
      .add(peakDot, { r: [0, 6], duration: 300, ease: 'outBack' })
      .add(peakGroup, { opacity: [0, 1], translateY: [8, 0], duration: 350 })
      .add(baseLabel, { opacity: [0, 1], duration: 350 });

    return () => tl.pause();
  }, [isActive]);

  return (
    <svg
      viewBox={`0 0 ${VBOX_W} ${height}`}
      width="100%"
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.32" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0.03" />
        </linearGradient>
        <clipPath id={clipId}>
          <rect
            ref={clipRectRef}
            x={PAD.l - 2}
            y={PAD.t - 20}
            width={0}
            height={cH + 40}
          />
        </clipPath>
      </defs>

      {/* Y-axis ticks */}
      {Y_TICKS.map(v => (
        <g key={v}>
          <line
            x1={PAD.l} y1={yScale(v)} x2={PAD.l + cW} y2={yScale(v)}
            stroke="#1e293b" strokeWidth="1"
          />
          <text
            x={PAD.l - 10} y={yScale(v)}
            textAnchor="end" dominantBaseline="middle"
            fill="#64748b" fontSize="12" fontFamily="JetBrains Mono, monospace"
          >{v}</text>
        </g>
      ))}

      {/* Y-axis label */}
      <text
        x={18} y={PAD.t + cH / 2}
        textAnchor="middle" dominantBaseline="middle"
        fill="#64748b" fontSize="11" fontFamily="JetBrains Mono, monospace"
        transform={`rotate(-90, 18, ${PAD.t + cH / 2})`}
      >JPY / kWh</text>

      {/* Baseline dashed line */}
      <line
        x1={PAD.l} y1={baselineY} x2={PAD.l + cW} y2={baselineY}
        stroke="#22d3ee" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.45"
      />

      {/* Area fill */}
      <path ref={areaRef} d={areaPath} fill={`url(#${fillId})`} clipPath={`url(#${clipId})`} />

      {/* Main line */}
      <path
        ref={lineRef}
        d={linePath}
        fill="none"
        stroke="#ef4444"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ filter: 'drop-shadow(0 0 5px #ef444480)' }}
      />

      {/* Peak dot */}
      <circle
        ref={peakDotRef}
        cx={peakX} cy={peakY}
        r={0}
        fill="#ef4444"
        style={{ filter: 'drop-shadow(0 0 8px #ef4444)' }}
      />

      {/* Peak annotations */}
      <g ref={peakGroupRef} style={{ opacity: 0 }}>
        <text
          x={peakX} y={peakY - 28}
          textAnchor="middle"
          fill="#ef4444" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="600"
        >25× spike</text>
        <text
          x={peakX} y={peakY - 14}
          textAnchor="middle"
          fill="#f1f5f9" fontSize="13" fontFamily="JetBrains Mono, monospace" fontWeight="700"
        >251 JPY/kWh</text>
      </g>

      {/* Baseline label */}
      <text
        ref={baseLabelRef}
        x={PAD.l + 8} y={baselineY - 7}
        fill="#22d3ee" fontSize="11" fontFamily="JetBrains Mono, monospace"
        style={{ opacity: 0 }}
      >~10 JPY/kWh (normal)</text>

      {/* X axis label */}
      <text
        x={PAD.l + cW / 2} y={PAD.t + cH + 46}
        textAnchor="middle"
        fill="#64748b" fontSize="12" fontFamily="JetBrains Mono, monospace"
      >January – February 2021 (40 days)</text>
    </svg>
  );
}
