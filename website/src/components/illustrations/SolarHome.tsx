import { useState, useEffect } from "react";

interface SolarHomeProps {
  width?: number;
  height?: number;
  color?: string;
}

const ANIM_STYLES = `
  @keyframes shDraw { to { stroke-dashoffset: 0; } }
  @keyframes shFill { to { fill-opacity: 1; } }
`;

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `shDraw ${dur}s ease ${delay}s forwards` };
}

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `shDraw ${dur}s ease ${delay}s forwards, shFill 0.3s ease ${fd}s forwards` };
}

export default function SolarHome({
  width = 210,
  height = 185,
  color = "#22d3ee",
}: SolarHomeProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  const solar = "#f59e0b";
  const amber = "#f59e0b";
  const t = 0.2;

  return (
    <svg
      viewBox="0 0 160 140"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      <style>{ANIM_STYLES}</style>
      <defs>
        <filter id="shGlow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* House body */}
      <rect
        pathLength={1} x={25} y={65} width={110} height={65}
        stroke={c + "60"} strokeWidth="1.5" fill={c + "06"}
        style={dSF(draw, t, 0.5)}
      />
      {/* Roof */}
      <polygon
        pathLength={1} points="15,65 80,18 145,65"
        stroke={c + "70"} strokeWidth="1.5" fill="none"
        style={dS(draw, t + 0.1, 0.4)}
      />
      {/* Solar panels on roof */}
      {([[32, 52], [52, 44], [72, 36], [92, 36], [112, 44]] as [number, number][]).map(([px, py], i) => (
        <rect
          key={i} pathLength={1}
          x={px} y={py} width={16} height={10} rx={1}
          stroke={solar + "cc"} strokeWidth="1" fill={solar + "40"}
          filter="url(#shGlow)"
          style={dSF(draw, t + 0.45 + i * 0.06, 0.2, t + 0.6 + i * 0.06)}
        />
      ))}
      {/* Window */}
      <rect
        pathLength={1} x={60} y={85} width={22} height={20}
        stroke={c + "30"} strokeWidth="0.8" fill={amber + "30"}
        style={dSF(draw, t + 0.55, 0.2, t + 0.7)}
      />
      {/* Door */}
      <rect
        pathLength={1} x={92} y={95} width={16} height={35}
        stroke={c + "25"} strokeWidth="0.8" fill="none"
        style={dS(draw, t + 0.6, 0.2)}
      />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
        const rad = (ang * Math.PI) / 180;
        const cx = 135, cy = 22, r1 = 7, r2 = 13;
        return (
          <line
            key={i} pathLength={1}
            x1={cx + Math.cos(rad) * r1} y1={cy + Math.sin(rad) * r1}
            x2={cx + Math.cos(rad) * r2} y2={cy + Math.sin(rad) * r2}
            stroke={solar + "80"} strokeWidth="1" filter="url(#shGlow)"
            style={dS(draw, t + 0.7 + i * 0.03, 0.15)}
          />
        );
      })}
      <circle
        pathLength={1} cx={135} cy={22} r={5}
        stroke={solar + "90"} strokeWidth="1" fill={solar + "30"}
        filter="url(#shGlow)"
        style={dSF(draw, t + 0.65, 0.2)}
      />
    </svg>
  );
}
