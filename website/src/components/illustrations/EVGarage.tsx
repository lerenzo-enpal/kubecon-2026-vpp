import { useState, useEffect } from "react";

interface EVGarageProps {
  width?: number;
  height?: number;
  color?: string;
}

const ANIM_STYLES = `
  @keyframes evDraw { to { stroke-dashoffset: 0; } }
  @keyframes evFill { to { fill-opacity: 1; } }
`;

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `evDraw ${dur}s ease ${delay}s forwards` };
}

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `evDraw ${dur}s ease ${delay}s forwards, evFill 0.3s ease ${fd}s forwards` };
}

export default function EVGarage({
  width = 210,
  height = 185,
  color = "#22d3ee",
}: EVGarageProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  const success = "#10b981";
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
        <filter id="evGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Garage */}
      <rect
        pathLength={1} x={20} y={35} width={120} height={95}
        stroke={c + "60"} strokeWidth="1.5" fill={c + "06"}
        style={dSF(draw, t, 0.5)}
      />
      {/* Garage door */}
      <rect
        pathLength={1} x={32} y={50} width={96} height={70}
        stroke={c + "35"} strokeWidth="1" fill="none"
        style={dS(draw, t + 0.15, 0.3)}
      />
      {/* Door slats */}
      {[62, 74, 86, 98, 110].map((ly, i) => (
        <line
          key={i} pathLength={1}
          x1={32} y1={ly} x2={128} y2={ly}
          stroke={c + "18"} strokeWidth="0.6"
          style={dS(draw, t + 0.3 + i * 0.03, 0.15)}
        />
      ))}
      {/* EV silhouette */}
      <path
        pathLength={1}
        d="M 48,118 L 48,108 Q 48,100 56,98 L 72,94 Q 78,88 90,88 Q 102,88 108,94 L 114,98 Q 122,100 122,108 L 122,118"
        stroke={success + "90"} strokeWidth="1.3" fill={success + "15"}
        style={dSF(draw, t + 0.45, 0.4, t + 0.7)}
      />
      {/* Wheels */}
      <circle
        pathLength={1} cx={65} cy={118} r={5}
        stroke={success + "60"} strokeWidth="1" fill={success + "10"}
        style={dSF(draw, t + 0.6, 0.15)}
      />
      <circle
        pathLength={1} cx={108} cy={118} r={5}
        stroke={success + "60"} strokeWidth="1" fill={success + "10"}
        style={dSF(draw, t + 0.62, 0.15)}
      />
      {/* Charging cable */}
      <path
        pathLength={1}
        d="M 18,60 Q 12,60 12,68 L 12,95 Q 12,100 18,100 L 48,100"
        stroke={success} strokeWidth="1.5" fill="none" filter="url(#evGlow)"
        style={dS(draw, t + 0.7, 0.3)}
      />
      {/* Charging bolt */}
      <polygon
        pathLength={1}
        points="8,72 14,72 12,80 17,80 9,92 11,83 7,83"
        stroke={success + "cc"} strokeWidth="0.8" fill={success + "50"} filter="url(#evGlow)"
        style={dSF(draw, t + 0.8, 0.2)}
      />
    </svg>
  );
}
