import { useState, useEffect } from "react";

interface ConnectedHomesProps {
  width?: number;
  height?: number;
  color?: string;
}

const ANIM_STYLES = `
  @keyframes chDraw { to { stroke-dashoffset: 0; } }
  @keyframes chFill { to { fill-opacity: 1; } }
  @keyframes chFlicker {
    0% { opacity: 0; } 10% { opacity: 0.7; } 20% { opacity: 0.1; }
    35% { opacity: 0.9; } 50% { opacity: 0.3; } 70% { opacity: 1; } 100% { opacity: 1; }
  }
  @keyframes chFlowFade {
    from { opacity: 0; } to { opacity: 0.5; }
  }
`;

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `chDraw ${dur}s ease ${delay}s forwards` };
}

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `chDraw ${dur}s ease ${delay}s forwards, chFill 0.3s ease ${fd}s forwards` };
}

const homes = [
  { x: 18, y: 55 },
  { x: 58, y: 30 },
  { x: 98, y: 55 },
  { x: 38, y: 95 },
  { x: 78, y: 95 },
  { x: 118, y: 95 },
];
const hubX = 78;
const hubY = 68;

export default function ConnectedHomes({
  width = 210,
  height = 185,
  color = "#22d3ee",
}: ConnectedHomesProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  const t = 0.2;

  return (
    <svg
      viewBox="0 0 160 140"
      width={width}
      height={height}
      style={{ overflow: "visible", maxWidth: "100%", height: "auto" }}
    >
      <style>{ANIM_STYLES}</style>
      <defs>
        <filter id="chGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Connection lines to hub */}
      {homes.map((h, i) => (
        <line
          key={`ln${i}`}
          pathLength={1}
          x1={h.x + 10} y1={h.y + 8} x2={hubX} y2={hubY}
          stroke={c + "30"} strokeWidth="0.8"
          style={dS(draw, t + 0.6 + i * 0.05, 0.25)}
        />
      ))}

      {/* Hub circle */}
      <circle
        pathLength={1} cx={hubX} cy={hubY} r={8}
        stroke={c + "90"} strokeWidth="1.5" fill={c + "15"}
        filter="url(#chGlow)"
        style={dSF(draw, t + 0.5, 0.3)}
      />
      <text
        x={hubX} y={hubY + 3}
        textAnchor="middle"
        fill={c}
        fontSize="7"
        fontFamily="JetBrains Mono, monospace"
        style={draw ? { opacity: 0, animation: `chFlicker 0.4s ease ${t + 0.85}s forwards` } : { opacity: 0 }}
      >
        VPP
      </text>

      {/* Mini houses */}
      {homes.map((h, i) => (
        <g key={`h${i}`}>
          <rect
            pathLength={1} x={h.x} y={h.y + 8} width={20} height={14}
            stroke={c + "50"} strokeWidth="1" fill={c + "06"}
            style={dSF(draw, t + 0.15 + i * 0.06, 0.25)}
          />
          <polygon
            pathLength={1}
            points={`${h.x - 2},${h.y + 8} ${h.x + 10},${h.y} ${h.x + 22},${h.y + 8}`}
            stroke={c + "50"} strokeWidth="1" fill="none"
            style={dS(draw, t + 0.2 + i * 0.06, 0.2)}
          />
        </g>
      ))}

      {/* Flow dashes on connections */}
      {homes.map((h, i) => (
        <line
          key={`fl${i}`}
          pathLength={1}
          x1={h.x + 10} y1={h.y + 8} x2={hubX} y2={hubY}
          stroke={c} strokeWidth="1.2" fill="none"
          strokeDasharray="3 6" filter="url(#chGlow)"
          style={draw ? { opacity: 0, animation: `chFlowFade 0.3s ease ${t + 0.9 + i * 0.04}s forwards` } : { opacity: 0 }}
        />
      ))}
    </svg>
  );
}
