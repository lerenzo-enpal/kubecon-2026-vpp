import { useState, useEffect } from "react";

interface TransmissionTowerProps {
  width?: number;
  height?: number;
  color?: string;
  energized?: boolean;
}

const ANIM_STYLES = `
  @keyframes ttDraw { to { stroke-dashoffset: 0; } }
  @keyframes ttFill { to { fill-opacity: 1; } }
`;

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `ttDraw ${dur}s ease ${delay}s forwards` };
}

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `ttDraw ${dur}s ease ${delay}s forwards, ttFill 0.3s ease ${fd}s forwards` };
}

export default function TransmissionTower({
  width = 100,
  height = 200,
  color = "#22d3ee",
  energized = true,
}: TransmissionTowerProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  const x = 50, y = 10, h = 180;
  const t0 = 0.2;
  const topW = 42;
  const midW = 30;
  const baseW = 22;
  const armY = y + h * 0.14;
  const midY = y + h * 0.38;
  const es = energized ? c + "80" : c + "50";

  return (
    <svg
      viewBox="0 0 100 200"
      width={width}
      height={height}
      style={{ overflow: "visible", maxWidth: "100%", height: "auto" }}
    >
      <style>{ANIM_STYLES}</style>
      <defs>
        <filter id="ttGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main vertical pole */}
      <line
        pathLength={1} x1={x} y1={y + h} x2={x} y2={y + 6}
        stroke={es} strokeWidth="1.5"
        style={{ ...dS(draw, t0, 0.5), transition: "stroke 0.5s ease" }}
      />
      {/* Top cross arm */}
      <line
        pathLength={1} x1={x - topW / 2} y1={armY} x2={x + topW / 2} y2={armY}
        stroke={es} strokeWidth="1.2"
        style={{ ...dS(draw, t0 + 0.2, 0.3), transition: "stroke 0.5s ease" }}
      />
      {/* Mid cross arm */}
      <line
        pathLength={1} x1={x - midW / 2} y1={midY} x2={x + midW / 2} y2={midY}
        stroke={es} strokeWidth="1"
        style={{ ...dS(draw, t0 + 0.25, 0.3), transition: "stroke 0.5s ease" }}
      />
      {/* Lattice lines */}
      <line pathLength={1} x1={x - baseW / 2} y1={y + h} x2={x - midW / 2} y2={midY} stroke={c + "30"} strokeWidth="0.8" style={dS(draw, t0 + 0.3, 0.3)} />
      <line pathLength={1} x1={x + baseW / 2} y1={y + h} x2={x + midW / 2} y2={midY} stroke={c + "30"} strokeWidth="0.8" style={dS(draw, t0 + 0.32, 0.3)} />
      <line pathLength={1} x1={x - midW / 2} y1={midY} x2={x} y2={y + 6} stroke={c + "30"} strokeWidth="0.8" style={dS(draw, t0 + 0.35, 0.3)} />
      <line pathLength={1} x1={x + midW / 2} y1={midY} x2={x} y2={y + 6} stroke={c + "30"} strokeWidth="0.8" style={dS(draw, t0 + 0.37, 0.3)} />
      {/* Cross lattice */}
      <line pathLength={1} x1={x - baseW / 2} y1={y + h} x2={x + midW / 2} y2={midY} stroke={c + "18"} strokeWidth="0.5" style={dS(draw, t0 + 0.4, 0.25)} />
      <line pathLength={1} x1={x + baseW / 2} y1={y + h} x2={x - midW / 2} y2={midY} stroke={c + "18"} strokeWidth="0.5" style={dS(draw, t0 + 0.42, 0.25)} />
      {/* Insulators -- glow when energized */}
      {[x - topW / 2, x, x + topW / 2].map((ix, i) => (
        <circle
          key={i}
          pathLength={1}
          cx={ix}
          cy={armY}
          r="2.5"
          fill={energized ? c + "90" : c + "30"}
          stroke={energized ? c : c + "50"}
          strokeWidth="0.5"
          filter={energized ? "url(#ttGlow)" : undefined}
          style={{ ...dSF(draw, t0 + 0.48 + i * 0.02, 0.2), transition: "fill 0.4s ease, stroke 0.4s ease" }}
        />
      ))}
    </svg>
  );
}
