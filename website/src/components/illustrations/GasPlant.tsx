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

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `gpDraw ${dur}s ease ${delay}s forwards, gpFill 0.3s ease ${fd}s forwards` };
}

export default function GasPlant({
  width = 220,
  height = 130,
  color = "#22d3ee",
  smoking = true,
}: GasPlantProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const c = color;
  // Layout area within viewBox
  const x = 10, y = 15, w = 195, h = 100;
  const t0 = 0.2;

  const activeFill = smoking ? c + "12" : c + "05";
  const activeStroke = smoking ? c + "80" : c + "60";
  const groundY = y + h;

  // Generator building: tall narrow rect, right portion, sits on ground
  const bldgW = w * 0.32, bldgH = h * 0.6;
  const bldgX = x + w * 0.58, bldgY = groundY - bldgH;

  // Smokestack: tapered (wider at bottom), rises from building roof
  const stackBotW = w * 0.065, stackTopW = w * 0.04, stackH = h * 0.35;
  const stackCX = bldgX + bldgW * 0.5, stackTop = bldgY - stackH;

  // Turbine shaft: solid horizontal rect connecting intake to building
  const shaftH = h * 0.18;
  const shaftY = groundY - shaftH;
  const shaftX1 = x + w * 0.2, shaftX2 = bldgX;

  // Bell-shaped air intake (trapezoid: wide left, narrow right)
  const intakeW = w * 0.18, intakeH = h * 0.3;
  const intakeX = x + 1, intakeY = groundY - intakeH;

  return (
    <svg
      viewBox="0 0 220 130"
      width={width}
      height={height}
      style={{ overflow: "visible", maxWidth: "100%", height: "auto" }}
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

      {/* Generator building */}
      <rect
        pathLength={1}
        x={bldgX} y={bldgY} width={bldgW} height={bldgH} rx={1}
        stroke={activeStroke} strokeWidth="1.5" fill={activeFill}
        filter={smoking ? "url(#gpGlow)" : undefined}
        style={{ ...dSF(draw, t0, 0.5), transition: "stroke 0.5s, fill 0.5s" }}
      />

      {/* Building windows (2 rows of 2) */}
      {[0.2, 0.55].map((wy, yi) =>
        [0.2, 0.6].map((wx, xi) => (
          <rect
            key={`w${yi}${xi}`}
            pathLength={1}
            x={bldgX + bldgW * wx}
            y={bldgY + bldgH * wy}
            width={bldgW * 0.2}
            height={bldgH * 0.1}
            rx={0.5}
            stroke={activeStroke}
            strokeWidth="0.5"
            fill={activeFill}
            style={dSF(draw, t0 + 0.2 + yi * 0.03 + xi * 0.02, 0.2)}
          />
        ))
      )}

      {/* Smokestack -- tapered, starts 1px above roof to avoid alpha overlap */}
      <path
        pathLength={1}
        d={`
          M ${stackCX - stackBotW / 2} ${bldgY - 1}
          L ${stackCX - stackTopW / 2} ${stackTop}
          L ${stackCX + stackTopW / 2} ${stackTop}
          L ${stackCX + stackBotW / 2} ${bldgY - 1}
        `}
        stroke={activeStroke} strokeWidth="1" fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.06, 0.35), transition: "stroke 0.5s" }}
      />

      {/* Turbine shaft (solid connection, sits on ground) */}
      <rect
        pathLength={1}
        x={shaftX1} y={shaftY} width={shaftX2 - shaftX1} height={shaftH} rx={1}
        stroke={activeStroke} strokeWidth="1.2" fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.1, 0.3), transition: "stroke 0.5s" }}
      />

      {/* Bell-shaped air intake (trapezoid: wide left, narrow right, on ground) */}
      <path
        pathLength={1}
        d={`
          M ${intakeX} ${intakeY}
          L ${shaftX1} ${shaftY}
          L ${shaftX1} ${groundY}
          L ${intakeX} ${groundY}
          Z
        `}
        stroke={activeStroke} strokeWidth="1.2" fill={activeFill}
        style={{ ...dSF(draw, t0 + 0.12, 0.3), transition: "stroke 0.5s" }}
      />

      {/* Smoke particles */}
      {smoking && (
        <g>
          <circle cx={stackCX} cy={stackTop} r={4} fill={c + "35"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 26} dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="r" from="4" to="13" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.65" to="0" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={stackCX + 3} cy={stackTop} r={3} fill={c + "28"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 20} dur="1.9s" repeatCount="indefinite" begin="0.4s" />
            <animate attributeName="r" from="3" to="10" dur="1.9s" repeatCount="indefinite" begin="0.4s" />
            <animate attributeName="opacity" from="0.55" to="0" dur="1.9s" repeatCount="indefinite" begin="0.4s" />
          </circle>
          <circle cx={stackCX - 2} cy={stackTop} r={2.5} fill={c + "20"}>
            <animate attributeName="cy" from={stackTop} to={stackTop - 18} dur="2.2s" repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="r" from="2.5" to="8" dur="2.2s" repeatCount="indefinite" begin="0.8s" />
            <animate attributeName="opacity" from="0.45" to="0" dur="2.2s" repeatCount="indefinite" begin="0.8s" />
          </circle>
        </g>
      )}
    </svg>
  );
}
