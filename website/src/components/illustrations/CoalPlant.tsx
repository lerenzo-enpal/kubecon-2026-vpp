import { useState, useEffect } from "react";

interface CoalPlantProps {
  width?: number;
  height?: number;
  color?: string;
  smoking?: boolean;
}

const ANIM_STYLES = `
  @keyframes cpDraw { to { stroke-dashoffset: 0; } }
  @keyframes cpFill { to { fill-opacity: 1; } }
  @keyframes cpFlicker {
    0% { opacity: 0; } 10% { opacity: 0.7; } 18% { opacity: 0.1; }
    30% { opacity: 0.85; } 42% { opacity: 0.25; } 58% { opacity: 1; } 100% { opacity: 1; }
  }
`;

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `cpDraw ${dur}s ease ${delay}s forwards` };
}

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `cpDraw ${dur}s ease ${delay}s forwards, cpFill 0.3s ease ${fd}s forwards` };
}

export default function CoalPlant({
  width = 200,
  height = 180,
  color = "#22d3ee",
  smoking = true,
}: CoalPlantProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  const x = 10, y = 20, w = 165, h = 130;
  const t0 = 0.2;

  const activeFill = smoking ? c + "12" : c + "05";
  const activeStroke = smoking ? c + "80" : c + "60";

  const towerW = w * 0.28;
  const towerH = h * 0.92;
  const towerX = x + w * 0.68;
  const towerCX = towerX + towerW * 0.5;
  const stackX = x + w * 0.22;
  const stackW = w * 0.07;
  const stackH = h * 0.32;
  const stackTop = y + h * 0.3 - stackH;

  return (
    <svg
      viewBox="0 0 200 180"
      width={width}
      height={height}
      style={{ overflow: "visible", maxWidth: "100%", height: "auto" }}
    >
      <style>{ANIM_STYLES}</style>
      <defs>
        <filter id="cpGlow">
          <feGaussianBlur stdDeviation="3" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main boiler building */}
      <rect
        pathLength={1}
        x={x}
        y={y + h * 0.3}
        width={w * 0.58}
        height={h * 0.7}
        stroke={activeStroke}
        strokeWidth="1.5"
        fill={activeFill}
        filter={smoking ? "url(#cpGlow)" : undefined}
        style={{ ...dSF(draw, t0, 0.7), transition: "fill 0.6s ease, stroke 0.4s ease" }}
      />
      {/* Smokestack */}
      <rect
        pathLength={1}
        x={stackX}
        y={stackTop}
        width={stackW}
        height={stackH}
        stroke={activeStroke}
        strokeWidth="1"
        fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.3, 0.4), transition: "fill 0.6s ease, stroke 0.4s ease" }}
      />
      {/* Cooling tower -- hyperbolic shape */}
      <path
        pathLength={1}
        d={`
          M ${towerX} ${y + towerH}
          Q ${towerX + towerW * 0.12} ${y + towerH * 0.45}, ${towerX + towerW * 0.08} ${y}
          L ${towerX + towerW * 0.92} ${y}
          Q ${towerX + towerW * 0.88} ${y + towerH * 0.45}, ${towerX + towerW} ${y + towerH}
          Z
        `}
        stroke={activeStroke}
        strokeWidth="1.5"
        fill={activeFill}
        filter={smoking ? "url(#cpGlow)" : undefined}
        style={{ ...dSF(draw, t0 + 0.15, 0.7), transition: "fill 0.6s ease, stroke 0.4s ease" }}
      />

      {/* Smoke from smokestack + steam from cooling tower */}
      {smoking && (
        <g>
          <circle cx={stackX + stackW / 2} cy={stackTop} r="5" fill={c + "30"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 40} dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" from="5" to="14" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={stackX + stackW / 2 + 4} cy={stackTop} r="4" fill={c + "25"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 35} dur="2.5s" repeatCount="indefinite" begin="0.7s" />
            <animate attributeName="r" from="4" to="12" dur="2.5s" repeatCount="indefinite" begin="0.7s" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2.5s" repeatCount="indefinite" begin="0.7s" />
          </circle>
          <circle cx={stackX + stackW / 2 - 3} cy={stackTop} r="3" fill={c + "20"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 30} dur="3s" repeatCount="indefinite" begin="1.3s" />
            <animate attributeName="r" from="3" to="10" dur="3s" repeatCount="indefinite" begin="1.3s" />
            <animate attributeName="opacity" from="0.5" to="0" dur="3s" repeatCount="indefinite" begin="1.3s" />
          </circle>
          {/* Cooling tower steam */}
          <circle cx={towerCX} cy={y} r="7" fill={c + "25"}>
            <animate attributeName="cy" from={y} to={y - 42} dur="2s" repeatCount="indefinite" />
            <animate attributeName="r" from="7" to="20" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.7" to="0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={towerCX - 5} cy={y} r="5" fill={c + "20"}>
            <animate attributeName="cy" from={y} to={y - 38} dur="2.6s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="r" from="5" to="16" dur="2.6s" repeatCount="indefinite" begin="0.5s" />
            <animate attributeName="opacity" from="0.6" to="0" dur="2.6s" repeatCount="indefinite" begin="0.5s" />
          </circle>
          <circle cx={towerCX + 6} cy={y} r="6" fill={c + "18"}>
            <animate attributeName="cy" from={y} to={y - 36} dur="3s" repeatCount="indefinite" begin="1.2s" />
            <animate attributeName="r" from="6" to="18" dur="3s" repeatCount="indefinite" begin="1.2s" />
            <animate attributeName="opacity" from="0.55" to="0" dur="3s" repeatCount="indefinite" begin="1.2s" />
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
        style={draw ? { opacity: 0, animation: `cpFlicker 0.5s ease ${t0 + 0.8}s forwards` } : { opacity: 0 }}
      >
        <tspan x={x + w * 0.29} dy="-0.5em">COAL</tspan>
        <tspan x={x + w * 0.29} dy="1em">800MW</tspan>
      </text>
    </svg>
  );
}
