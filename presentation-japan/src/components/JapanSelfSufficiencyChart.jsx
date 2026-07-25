import React, { useRef, useEffect } from 'react';
import { SlideContext } from 'spectacle';
import { animate, stagger } from 'animejs';

const G7_DATA = [
  { country: 'Canada',  value: 179, highlight: false },
  { country: 'USA',     value: 106, highlight: false },
  { country: 'UK',      value:  75, highlight: false },
  { country: 'France',  value:  55, highlight: false },
  { country: 'Germany', value:  35, highlight: false },
  { country: 'Italy',   value:  25, highlight: false },
  { country: 'Japan',   value:  15.3, highlight: true },
].sort((a, b) => b.value - a.value);

const MAX_VAL = 200;
const VBOX_W = 800;

export function JapanSelfSufficiencyChart({ height = 420 }) {
  const barsRef = useRef([]);
  const labelsRef = useRef([]);
  const annotationRef = useRef(null);
  const slideCtx = React.useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;

  const PAD = { l: 110, r: 80, t: 50, b: 30 };
  const cW = VBOX_W - PAD.l - PAD.r;
  const cH = height - PAD.t - PAD.b;
  const rowH = cH / G7_DATA.length;
  const barH = Math.min(rowH * 0.52, 30);

  useEffect(() => {
    if (!isActive) return;
    const bars = barsRef.current.filter(Boolean);
    const labels = labelsRef.current.filter(Boolean);
    const annotation = annotationRef.current;
    if (!bars.length) return;

    // Reset
    bars.forEach((bar, i) => {
      const fullW = (G7_DATA[i].value / MAX_VAL) * cW;
      bar.setAttribute('width', 0);
    });
    labels.forEach(l => { l.style.opacity = '0'; });
    if (annotation) annotation.style.opacity = '0';

    // Animate bars expanding
    animate(bars, {
      width: (el, i) => [(0), (G7_DATA[i].value / MAX_VAL) * cW],
      duration: 900,
      ease: 'outQuart',
      delay: stagger(120),
      onComplete: () => {
        // Fade in value labels
        animate(labels, { opacity: [0, 1], translateX: [4, 0], duration: 250, delay: stagger(80) });
        if (annotation) animate(annotation, { opacity: [0, 1], duration: 350, delay: 100 });
      },
    });

    return () => {};
  }, [isActive]);

  return (
    <svg
      viewBox={`0 0 ${VBOX_W} ${height}`}
      width="100%"
      height={height}
      style={{ display: 'block' }}
    >
      {/* Title */}
      <text
        x={PAD.l + cW / 2} y={28}
        textAnchor="middle"
        fill="#64748b" fontSize="12" fontFamily="JetBrains Mono, monospace"
      >Energy Self-Sufficiency Rate (%)</text>

      {G7_DATA.map((item, i) => {
        const barY = PAD.t + i * rowH + (rowH - barH) / 2;
        const fullW = (item.value / MAX_VAL) * cW;
        const isJapan = item.highlight;

        return (
          <g key={item.country}>
            {/* Country label */}
            <text
              x={PAD.l - 10} y={barY + barH / 2}
              textAnchor="end" dominantBaseline="middle"
              fill={isJapan ? '#f1f5f9' : '#94a3b8'}
              fontSize={isJapan ? '13' : '13'}
              fontWeight={isJapan ? '700' : '400'}
              fontFamily="JetBrains Mono, monospace"
            >{item.country}</text>

            {/* Bar */}
            <rect
              ref={el => { barsRef.current[i] = el; }}
              x={PAD.l} y={barY}
              width={0} height={barH}
              rx={3}
              fill={isJapan ? '#ef4444' : '#94a3b8'}
              opacity={isJapan ? 1 : 0.55}
              style={isJapan ? { filter: 'drop-shadow(0 0 6px #ef4444)' } : {}}
            />

            {/* Value label */}
            <text
              ref={el => { labelsRef.current[i] = el; }}
              x={PAD.l + fullW + 8} y={barY + barH / 2}
              dominantBaseline="middle"
              fill={isJapan ? '#ef4444' : '#64748b'}
              fontSize={isJapan ? '13' : '12'}
              fontWeight={isJapan ? '700' : '400'}
              fontFamily="JetBrains Mono, monospace"
              style={{ opacity: 0 }}
            >{item.value}%</text>
          </g>
        );
      })}

      {/* "Lowest in G7" annotation for Japan */}
      {(() => {
        const japanIdx = G7_DATA.findIndex(d => d.highlight);
        const barY = PAD.t + japanIdx * rowH + (rowH - barH) / 2;
        const fullW = (G7_DATA[japanIdx].value / MAX_VAL) * cW;
        return (
          <text
            ref={annotationRef}
            x={PAD.l + fullW + 8} y={barY + barH + 16}
            fill="#ef4444" fontSize="11" fontFamily="JetBrains Mono, monospace"
            style={{ opacity: 0 }}
          >Lowest in G7</text>
        );
      })()}
    </svg>
  );
}
