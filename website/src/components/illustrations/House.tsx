import { useState, useEffect } from "react";

interface HouseProps {
  width?: number;
  height?: number;
  color?: string;
  lit?: boolean;
}

const ANIM_STYLES = `
  @keyframes hsDraw { to { stroke-dashoffset: 0; } }
  @keyframes hsFill { to { fill-opacity: 1; } }
`;

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `hsDraw ${dur}s ease ${delay}s forwards` };
}

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `hsDraw ${dur}s ease ${delay}s forwards, hsFill 0.3s ease ${fd}s forwards` };
}

export default function House({
  width = 120,
  height = 100,
  color = "#22d3ee",
  lit = true,
}: HouseProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  const amber = "#f59e0b";
  const x = 20, y = 10, w = 78, h = 64;
  const t0 = 0.2;

  const roofH = h * 0.38;
  const bodyY = y + roofH;
  const bodyH = h * 0.62;
  const winW = w * 0.22;
  const winH = bodyH * 0.32;
  const wf = lit ? amber + "bb" : "#0a0e18";
  const ws = lit ? amber + "50" : c + "20";

  return (
    <svg
      viewBox="0 0 120 100"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      <style>{ANIM_STYLES}</style>
      <defs>
        <filter id="hsWGlow">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Roof */}
      <polygon
        pathLength={1}
        points={`${x},${bodyY} ${x + w / 2},${y} ${x + w},${bodyY}`}
        stroke={c + "50"} strokeWidth="1.2" fill="none"
        style={dS(draw, t0, 0.5)}
      />
      {/* Body */}
      <rect
        pathLength={1} x={x} y={bodyY} width={w} height={bodyH}
        stroke={c + "50"} strokeWidth="1.2" fill={c + "03"}
        style={dSF(draw, t0 + 0.1, 0.5)}
      />
      {/* Left window */}
      <rect
        pathLength={1}
        x={x + w * 0.15} y={bodyY + bodyH * 0.2} width={winW} height={winH}
        fill={wf} stroke={ws} strokeWidth="0.7"
        filter={lit ? "url(#hsWGlow)" : undefined}
        style={{ ...dSF(draw, t0 + 0.35, 0.25, t0 + 0.7), transition: "fill 0.5s ease, stroke 0.4s ease" }}
      />
      {/* Right window */}
      <rect
        pathLength={1}
        x={x + w * 0.62} y={bodyY + bodyH * 0.2} width={winW} height={winH}
        fill={wf} stroke={ws} strokeWidth="0.7"
        filter={lit ? "url(#hsWGlow)" : undefined}
        style={{ ...dSF(draw, t0 + 0.4, 0.25, t0 + 0.75), transition: "fill 0.5s ease, stroke 0.4s ease" }}
      />
      {/* Door */}
      <rect
        pathLength={1}
        x={x + w * 0.38} y={bodyY + bodyH * 0.55} width={w * 0.24} height={bodyH * 0.45}
        stroke={c + "18"} strokeWidth="0.7" fill="none"
        style={dS(draw, t0 + 0.45, 0.25)}
      />
    </svg>
  );
}
