import { useState, useEffect } from "react";

interface GasPlantProps {
  width?: number;
  height?: number;
  color?: string;
  smoking?: boolean;
}

const ANIM_STYLES = `
  @keyframes gpDraw { to { stroke-dashoffset: 0; } }
  @keyframes gpFill { to { fill-opacity: 1; } }
  @keyframes gpFlicker {
    0% { opacity: 0; } 10% { opacity: 0.7; } 18% { opacity: 0.1; }
    30% { opacity: 0.85; } 42% { opacity: 0.25; } 58% { opacity: 1; } 100% { opacity: 1; }
  }
`;

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `gpDraw ${dur}s ease ${delay}s forwards` };
}

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `gpDraw ${dur}s ease ${delay}s forwards, gpFill 0.3s ease ${fd}s forwards` };
}

export default function GasPlant({
  width = 200,
  height = 180,
  color = "#22d3ee",
  smoking = true,
}: GasPlantProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  const x = 10, y = 20, w = 165, h = 130;
  const t0 = 0.2;

  const activeFill = smoking ? c + "12" : c + "05";
  const activeStroke = smoking ? c + "80" : c + "60";

  const stackX = x + w * 0.52;
  const stackW = w * 0.07;
  const stackH = h * 0.4;
  const stackTop = y + h * 0.3 - stackH;

  return (
    <svg
      viewBox="0 0 200 180"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      <style>{ANIM_STYLES}</style>
      <defs>
        <filter id="gpGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main building */}
      <rect
        pathLength={1}
        x={x}
        y={y + h * 0.3}
        width={w * 0.7}
        height={h * 0.7}
        stroke={activeStroke}
        strokeWidth="1.5"
        fill={activeFill}
        filter={smoking ? "url(#gpGlow)" : undefined}
        style={{ ...dSF(draw, t0, 0.7), transition: "fill 0.6s ease, stroke 0.4s ease" }}
      />
      {/* Exhaust stack */}
      <rect
        pathLength={1}
        x={stackX}
        y={stackTop}
        width={stackW}
        height={stackH}
        stroke={activeStroke}
        strokeWidth="1"
        fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.2, 0.5), transition: "fill 0.6s ease, stroke 0.4s ease" }}
      />

      {/* Exhaust smoke */}
      {smoking && (
        <g>
          <circle cx={stackX + stackW / 2} cy={stackTop} r="4" fill={c + "28"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 36} dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="r" from="4" to="12" dur="1.8s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.65" to="0" dur="1.8s" repeatCount="indefinite" />
          </circle>
          <circle cx={stackX + stackW / 2 + 3} cy={stackTop} r="3" fill={c + "20"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 30} dur="2.2s" repeatCount="indefinite" begin="0.6s" />
            <animate attributeName="r" from="3" to="10" dur="2.2s" repeatCount="indefinite" begin="0.6s" />
            <animate attributeName="opacity" from="0.55" to="0" dur="2.2s" repeatCount="indefinite" begin="0.6s" />
          </circle>
          <circle cx={stackX + stackW / 2 - 2} cy={stackTop} r="3" fill={c + "18"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 28} dur="2.6s" repeatCount="indefinite" begin="1.3s" />
            <animate attributeName="r" from="3" to="9" dur="2.6s" repeatCount="indefinite" begin="1.3s" />
            <animate attributeName="opacity" from="0.45" to="0" dur="2.6s" repeatCount="indefinite" begin="1.3s" />
          </circle>
        </g>
      )}

      {/* Label */}
      <text
        x={x + w * 0.29}
        y={y + h * 0.65}
        textAnchor="middle"
        fill={c + "cc"}
        fontSize="12"
        fontWeight="600"
        fontFamily="JetBrains Mono, monospace"
        letterSpacing="0.08em"
        style={draw ? { opacity: 0, animation: `gpFlicker 0.5s ease ${t0 + 0.8}s forwards` } : { opacity: 0 }}
      >
        <tspan x={x + w * 0.29} dy="-0.5em">GAS</tspan>
        <tspan x={x + w * 0.29} dy="1em">400MW</tspan>
      </text>
    </svg>
  );
}
