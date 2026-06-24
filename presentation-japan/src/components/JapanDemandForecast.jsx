import React, { useRef, useEffect, useId } from 'react';
import { SlideContext } from 'spectacle';
import { animate, createTimeline, svg } from 'animejs';

const YEARS = [2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034];
const BASE  = [19, 21, 24, 27, 32, 37, 43, 49, 53, 57, 60, 62];
const LOW   = [19, 21, 23, 26, 30, 35, 40, 46, 50, 55, 57, 57];
const HIGH  = [19, 22, 26, 30, 36, 42, 49, 56, 61, 65, 67, 66];
const N = YEARS.length;
const MAX_VAL = 80;
const Y_TICKS = [0, 20, 40, 60, 80];
const VBOX_W = 820;

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

export function JapanDemandForecast({ height = 440 }) {
  const lineRef = useRef(null);
  const bandRef = useRef(null);
  const clipRectRef = useRef(null);
  const baselineLabelRef = useRef(null);
  const endLabelRef = useRef(null);
  const occtoRef = useRef(null);
  const slideCtx = React.useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;
  const uid = useId().replace(/:/g, '');

  const PAD = { l: 60, r: 100, t: 48, b: 56 };
  const cW = VBOX_W - PAD.l - PAD.r;
  const cH = height - PAD.t - PAD.b;

  const xScale = (i) => PAD.l + (i / (N - 1)) * cW;
  const yScale = (v) => PAD.t + cH - (v / MAX_VAL) * cH;

  const basePts  = BASE.map((v, i) => [xScale(i), yScale(v)]);
  const lowPts   = LOW.map((v, i)  => [xScale(i), yScale(v)]);
  const highPts  = HIGH.map((v, i) => [xScale(i), yScale(v)]);

  const basePath = smoothPath(basePts);

  // Band path: forward along HIGH, back along LOW reversed
  const bandPath = smoothPath(highPts) +
    ' L ' + [...lowPts].reverse().map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L ') + ' Z';

  const clipId = `demand-clip-${uid}`;
  const lastX = xScale(N - 1);
  const lastBaseY = yScale(BASE[N - 1]);
  const baselineY = yScale(BASE[0]);

  useEffect(() => {
    if (!isActive) return;
    const lineEl = lineRef.current;
    const clipRect = clipRectRef.current;
    const baseLbl = baselineLabelRef.current;
    const endLbl = endLabelRef.current;
    const occto = occtoRef.current;
    if (!lineEl) return;

    const [drawable] = svg.createDrawable(lineEl);

    const tl = createTimeline({ defaults: { ease: 'inOutCubic' } });
    tl
      .add(drawable, { draw: ['0 0', '0 100'], duration: 2400 })
      .add(clipRect, { width: [0, cW + 16],    duration: 2400, ease: 'inOutCubic' }, 0)
      .add(baseLbl,  { opacity: [0, 1], translateX: [-6, 0], duration: 350 })
      .add(endLbl,   { opacity: [0, 1], translateX: [6, 0],  duration: 350 }, '-=200')
      .add(occto,    { opacity: [0, 1], translateY: [8, 0],  duration: 400 });

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
        <clipPath id={clipId}>
          <rect ref={clipRectRef} x={PAD.l - 2} y={PAD.t - 20} width={0} height={cH + 40} />
        </clipPath>
      </defs>

      {/* Grid lines */}
      {Y_TICKS.map(v => (
        <g key={v}>
          <line x1={PAD.l} y1={yScale(v)} x2={PAD.l + cW} y2={yScale(v)}
            stroke="#1e293b" strokeWidth={v === 0 ? '1.5' : '1'} />
          <text x={PAD.l - 8} y={yScale(v)}
            textAnchor="end" dominantBaseline="middle"
            fill="#64748b" fontSize="11" fontFamily="JetBrains Mono, monospace"
          >{v}</text>
        </g>
      ))}

      {/* Y-axis label */}
      <text
        x={18} y={PAD.t + cH / 2}
        textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="JetBrains Mono, monospace"
        transform={`rotate(-90, 18, ${PAD.t + cH / 2})`}
      >TWh / year</text>

      {/* X-axis year labels */}
      {YEARS.map((yr, i) => i % 2 === 0 && (
        <text key={yr} x={xScale(i)} y={PAD.t + cH + 20}
          textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="JetBrains Mono, monospace"
        >{yr}</text>
      ))}

      {/* Confidence band — clipped */}
      <path
        ref={bandRef}
        d={bandPath}
        fill="#3939D8"
        opacity="0.12"
        clipPath={`url(#${clipId})`}
      />

      {/* LOW and HIGH boundary lines */}
      <path
        d={smoothPath(highPts)} fill="none"
        stroke="#3939D8" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"
        clipPath={`url(#${clipId})`}
      />
      <path
        d={smoothPath(lowPts)} fill="none"
        stroke="#3939D8" strokeWidth="1" strokeDasharray="4 3" opacity="0.4"
        clipPath={`url(#${clipId})`}
      />

      {/* Main BASE line */}
      <path
        ref={lineRef}
        d={basePath}
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 5px #22d3ee60)' }}
      />

      {/* Baseline label — 19 TWh */}
      <g ref={baselineLabelRef} style={{ opacity: 0 }}>
        <circle cx={xScale(0)} cy={yScale(BASE[0])} r={4} fill="#22d3ee" />
        <text x={xScale(0) + 4} y={yScale(BASE[0]) - 18}
          textAnchor="start" fill="#22d3ee" fontSize="13" fontWeight="700"
          fontFamily="JetBrains Mono, monospace"
        >19 TWh</text>
        <text x={xScale(0) + 4} y={yScale(BASE[0]) - 5}
          textAnchor="start" fill="#64748b" fontSize="10"
          fontFamily="JetBrains Mono, monospace"
        >(2023)</text>
      </g>

      {/* End label — 57-66 TWh */}
      <g ref={endLabelRef} style={{ opacity: 0 }}>
        <circle cx={lastX} cy={lastBaseY} r={4} fill="#22d3ee" />
        <text x={lastX + 10} y={lastBaseY - 6}
          fill="#FFC217" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace"
        >57–66 TWh</text>
        <text x={lastX + 10} y={lastBaseY + 8}
          fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace"
        >by 2034</text>
      </g>

      {/* OCCTO callout box */}
      <g ref={occtoRef} style={{ opacity: 0 }}>
        <rect
          x={PAD.l + 8} y={PAD.t + 8}
          width={210} height={48} rx={5}
          fill="#0d1424" stroke="#FFC21730" strokeWidth="1"
        />
        <text x={PAD.l + 18} y={PAD.t + 26}
          fill="#FFC217" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace"
        >OCCTO forecast: 14× growth</text>
        <text x={PAD.l + 18} y={PAD.t + 42}
          fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace"
        >DC + semiconductor fab demand combined</text>
      </g>
    </svg>
  );
}
