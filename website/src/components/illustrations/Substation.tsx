import { useState, useEffect } from "react";

interface SubstationProps {
  width?: number;
  height?: number;
  color?: string;
  energized?: boolean;
}

const ANIM_STYLES = (c: string) => `
  @keyframes ssDraw { to { stroke-dashoffset: 0; } }
  @keyframes ssFill { to { fill-opacity: 1; } }
  @keyframes ssFlicker {
    0% { opacity: 0; } 10% { opacity: 0.7; } 18% { opacity: 0.1; }
    30% { opacity: 0.85; } 42% { opacity: 0.25; } 58% { opacity: 1; } 100% { opacity: 1; }
  }
  @keyframes ssCoilPulse {
    0%, 100% { stroke: ${c}90; filter: none; }
    50% { stroke: ${c}; filter: url(#ssGlow); }
  }
`;

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `ssDraw ${dur}s ease ${delay}s forwards` };
}

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `ssDraw ${dur}s ease ${delay}s forwards, ssFill 0.3s ease ${fd}s forwards` };
}

export default function Substation({
  width = 160,
  height = 150,
  color = "#22d3ee",
  energized = true,
}: SubstationProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  const x = 20, y = 20, w = 120, h = 100;
  const t0 = 0.2;
  const coilStroke = energized ? c : c + "45";
  const coilFilter = energized ? "url(#ssGlow)" : undefined;

  return (
    <svg
      viewBox="0 0 160 150"
      width={width}
      height={height}
      style={{ overflow: "visible", maxWidth: "100%", height: "auto" }}
    >
      <style>{ANIM_STYLES(c)}</style>
      <defs>
        <filter id="ssGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main enclosure */}
      <rect
        pathLength={1} x={x} y={y} width={w} height={h}
        stroke={energized ? c + "80" : c + "55"}
        strokeWidth="1.5"
        fill={energized ? c + "0a" : c + "05"}
        filter={energized ? "url(#ssGlow)" : undefined}
        style={{ ...dSF(draw, t0, 0.6), transition: "stroke 0.5s ease, fill 0.5s ease" }}
      />
      {/* Transformer zigzag coils -- pulse when energized */}
      <polyline
        pathLength={1}
        points={`${x + w * 0.3},${y + h * 0.18} ${x + w * 0.48},${y + h * 0.32} ${x + w * 0.3},${y + h * 0.46} ${x + w * 0.48},${y + h * 0.6} ${x + w * 0.3},${y + h * 0.74}`}
        stroke={coilStroke}
        strokeWidth={energized ? 2 : 1.5}
        fill="none"
        filter={coilFilter}
        style={energized
          ? { strokeDasharray: "none", strokeDashoffset: 0, animation: "ssCoilPulse 1.2s ease-in-out infinite" }
          : dS(draw, t0 + 0.35, 0.5)}
      />
      <polyline
        pathLength={1}
        points={`${x + w * 0.52},${y + h * 0.18} ${x + w * 0.7},${y + h * 0.32} ${x + w * 0.52},${y + h * 0.46} ${x + w * 0.7},${y + h * 0.6} ${x + w * 0.52},${y + h * 0.74}`}
        stroke={coilStroke}
        strokeWidth={energized ? 2 : 1.5}
        fill="none"
        filter={coilFilter}
        style={energized
          ? { strokeDasharray: "none", strokeDashoffset: 0, animation: "ssCoilPulse 1.2s ease-in-out infinite 0.6s" }
          : dS(draw, t0 + 0.45, 0.5)}
      />
      {/* Label */}
      <text
        x={x + w / 2}
        y={y + h + 23}
        textAnchor="middle"
        fill={c + "35"}
        fontSize="13"
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="0.1em"
        style={draw ? { opacity: 0, animation: `ssFlicker 0.5s ease ${t0 + 0.9}s forwards` } : { opacity: 0 }}
      >
        SUBSTATION
      </text>
      {/* Corner brackets */}
      {(
        [
          [x - 4, y - 4, 1, 1],
          [x + w + 4, y - 4, -1, 1],
          [x - 4, y + h + 4, 1, -1],
          [x + w + 4, y + h + 4, -1, -1],
        ] as [number, number, number, number][]
      ).map(([bx, by, dx, dy], i) => (
        <g key={i}>
          <line pathLength={1} x1={bx} y1={by} x2={bx + 10 * dx} y2={by} stroke={c + "25"} strokeWidth="1" style={dS(draw, t0 + 0.6 + i * 0.05, 0.2)} />
          <line pathLength={1} x1={bx} y1={by} x2={bx} y2={by + 10 * dy} stroke={c + "25"} strokeWidth="1" style={dS(draw, t0 + 0.62 + i * 0.05, 0.2)} />
        </g>
      ))}
    </svg>
  );
}
