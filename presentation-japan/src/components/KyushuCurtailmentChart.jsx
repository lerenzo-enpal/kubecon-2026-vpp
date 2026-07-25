import React, { useRef, useEffect, useId } from 'react';
import { SlideContext } from 'spectacle';
import { animate, createTimeline, svg, stagger } from 'animejs';

const QUARTERS = ["Q1'23","Q2","Q3","Q4","Q1'24","Q2","Q3","Q4","Q1'25","Q2","Q3","Q4","Q1'26","Q2"];
const SERIES = [
  { name: 'Kyushu',     color: '#FFC217', data: [280,420,380,180,320,510,445,210,490,870,820,410,650,940] },
  { name: 'Chugoku',   color: '#FFA35F', data: [0,0,20,10,35,65,55,25,80,140,125,60,110,170] },
  { name: 'Shikoku',   color: '#a78bfa', data: [0,0,0,0,0,15,12,5,20,45,38,18,42,68] },
  { name: 'Tokyo/TEPCO',color: '#22d3ee', data: [0,0,0,0,0,0,0,0,0,0,5,3,28,75] },
];
const TOKYO_IDX = 12;
const MAX_VAL = 1000;
const Y_TICKS = [0, 250, 500, 750, 1000];
const VBOX_W = 820;

function smoothPath(pts, t = 0.35) {
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

export function KyushuCurtailmentChart({ height = 400 }) {
  const lineRefs = useRef([]);
  const milestoneRef = useRef(null);
  const calloutRef = useRef(null);
  const slideCtx = React.useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;
  const uid = useId().replace(/:/g, '');

  const PAD = { l: 60, r: 140, t: 48, b: 60 };
  const cW = VBOX_W - PAD.l - PAD.r;
  const cH = height - PAD.t - PAD.b;

  const xScale = (i) => PAD.l + (i / (QUARTERS.length - 1)) * cW;
  const yScale = (v) => PAD.t + cH - (v / MAX_VAL) * cH;

  const paths = SERIES.map(s => smoothPath(s.data.map((v, i) => [xScale(i), yScale(v)])));
  const milestoneX = xScale(TOKYO_IDX);

  useEffect(() => {
    if (!isActive) return;
    const lines = lineRefs.current.filter(Boolean);
    const milestone = milestoneRef.current;
    const callout = calloutRef.current;
    if (!lines.length) return;

    const drawables = lines.map(el => svg.createDrawable(el)[0]);

    const tl = createTimeline({ defaults: { ease: 'inOutCubic' } });
    drawables.forEach((drawable, i) => {
      tl.add(drawable, { draw: ['0 0', '0 100'], duration: 1800 }, i * 120);
    });
    tl
      .add(milestone, { opacity: [0, 1], scaleY: [0, 1], duration: 400, transformOrigin: 'bottom' })
      .add(callout, { opacity: [0, 1], translateY: [6, 0], duration: 350 });

    return () => tl.pause();
  }, [isActive]);

  return (
    <svg
      viewBox={`0 0 ${VBOX_W} ${height}`}
      width="100%"
      height={height}
      style={{ display: 'block', overflow: 'visible' }}
    >
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
      >GWh curtailed</text>

      {/* X-axis quarter labels — show every other */}
      {QUARTERS.map((q, i) => i % 2 === 0 && (
        <text key={q + i} x={xScale(i)} y={PAD.t + cH + 20}
          textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="JetBrains Mono, monospace"
        >{q}</text>
      ))}

      {/* Tokyo milestone marker */}
      <g ref={milestoneRef} style={{ opacity: 0 }}>
        <line x1={milestoneX} y1={PAD.t} x2={milestoneX} y2={PAD.t + cH}
          stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.7" />
        <text x={milestoneX + 6} y={PAD.t + 14}
          fill="#22d3ee" fontSize="10" fontFamily="JetBrains Mono, monospace"
        >Tokyo reaches</text>
        <text x={milestoneX + 6} y={PAD.t + 26}
          fill="#22d3ee" fontSize="10" fontFamily="JetBrains Mono, monospace"
        >Q1 2026</text>
      </g>

      {/* Series lines */}
      {SERIES.map((s, i) => (
        <path
          key={s.name}
          ref={el => { lineRefs.current[i] = el; }}
          d={paths[i]}
          fill="none"
          stroke={s.color}
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 0 4px ${s.color}60)` }}
        />
      ))}

      {/* Legend */}
      {SERIES.map((s, i) => (
        <g key={s.name + 'leg'} transform={`translate(${PAD.l + cW + 12}, ${PAD.t + 20 + i * 26})`}>
          <rect x={0} y={-6} width={16} height={3} rx={1} fill={s.color} />
          <text x={22} y={0}
            dominantBaseline="middle"
            fill={s.color} fontSize="11" fontFamily="JetBrains Mono, monospace"
          >{s.name}</text>
        </g>
      ))}

      {/* Callout: 1.74 TWh wasted */}
      <g ref={calloutRef} style={{ opacity: 0 }}>
        <rect
          x={PAD.l + cW * 0.52} y={PAD.t + cH * 0.05}
          width={170} height={44} rx={5}
          fill="#0d1424" stroke="#FFC21730" strokeWidth="1"
        />
        <text x={PAD.l + cW * 0.52 + 10} y={PAD.t + cH * 0.05 + 16}
          fill="#FFC217" fontSize="12" fontWeight="700" fontFamily="JetBrains Mono, monospace"
        >1.74 TWh wasted</text>
        <text x={PAD.l + cW * 0.52 + 10} y={PAD.t + cH * 0.05 + 32}
          fill="#64748b" fontSize="10" fontFamily="JetBrains Mono, monospace"
        >H1 2025 — solar curtailment</text>
      </g>
    </svg>
  );
}
