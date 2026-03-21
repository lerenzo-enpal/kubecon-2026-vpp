import { useState, useEffect } from "react";

interface VPPHomeProps {
  width?: number;
  height?: number;
}

const ANIM_STYLES = `
  @keyframes vhDraw { to { stroke-dashoffset: 0; } }
  @keyframes vhFill { to { fill-opacity: 1; } }
  @keyframes vhPulse {
    0%, 100% { opacity: 0.6; } 50% { opacity: 1; }
  }
  @keyframes vhCharge {
    0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; }
  }
  @keyframes vhSolarGlow {
    0%, 100% { filter: drop-shadow(0 0 2px #f59e0b44); }
    50% { filter: drop-shadow(0 0 6px #f59e0b88); }
  }
  @keyframes vhDash {
    to { stroke-dashoffset: -12; }
  }
`;

function dSF(on: boolean, delay: number, dur = 0.6, fillDelay?: number) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `vhDraw ${dur}s ease ${delay}s forwards, vhFill 0.3s ease ${fd}s forwards` };
}

function dS(on: boolean, delay: number, dur = 0.6) {
  const base: Record<string, any> = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `vhDraw ${dur}s ease ${delay}s forwards` };
}

export default function VPPHome({
  width = 280,
  height = 180,
}: VPPHomeProps) {
  const [draw, setDraw] = useState(false);
  useEffect(() => { setDraw(true); }, []);

  const solar = "#f59e0b";
  const battery = "#10b981";
  const ev = "#22d3ee";
  const heatPump = "#a78bfa";
  const hems = "#f43f5e";
  const house = "#94a3b8";

  const t = 0.15;

  // House body
  const hx = 60, hy = 70, hw = 120, hh = 70;
  // Roof peak
  const roofPeak = { x: hx + hw / 2, y: 28 };
  const roofLeft = { x: hx - 12, y: hy };
  const roofRight = { x: hx + hw + 12, y: hy };

  // Solar panels on roof (3 panels along the left slope)
  const panelW = 22, panelH = 10;
  const panels = [0.22, 0.42, 0.62].map((pct) => {
    const px = roofLeft.x + (roofPeak.x - roofLeft.x) * pct;
    const py = roofLeft.y + (roofPeak.y - roofLeft.y) * pct;
    return { x: px, y: py - 2 };
  });

  // Battery on right side of house
  const batX = hx + hw + 18, batY = hy + 24, batW = 14, batH = 28;
  const chargeH = batH * 0.65;

  // EV in front of house
  const evX = 20, evY = 148;

  // Heat pump on right side, lower
  const hpX = hx + hw + 16, hpY = hy + hh - 10, hpW = 18, hpH = 14;

  // HEMS controller dot on house wall
  const hemsX = hx + hw - 14, hemsY = hy + 16;

  return (
    <svg
      viewBox="0 0 280 180"
      width={width}
      height={height}
      style={{ overflow: "visible" }}
    >
      <style>{ANIM_STYLES}</style>

      {/* House body */}
      <rect
        pathLength={1}
        x={hx} y={hy} width={hw} height={hh} rx={2}
        stroke={house + "60"} strokeWidth="1.5" fill={house + "08"}
        style={dSF(draw, t, 0.5)}
      />

      {/* Roof */}
      <path
        pathLength={1}
        d={`M ${roofLeft.x} ${roofLeft.y} L ${roofPeak.x} ${roofPeak.y} L ${roofRight.x} ${roofRight.y}`}
        stroke={house + "80"} strokeWidth="2" fill="none" strokeLinejoin="round"
        style={dS(draw, t + 0.05, 0.5)}
      />

      {/* Solar panels on roof */}
      <g style={draw ? { animation: "vhSolarGlow 3s ease-in-out infinite 1.2s" } : {}}>
        {panels.map((p, i) => (
          <g key={`sp${i}`}>
            <rect
              pathLength={1}
              x={p.x} y={p.y}
              width={panelW} height={panelH}
              rx={1}
              stroke={solar + "90"} strokeWidth="1" fill={solar + "18"}
              transform={`rotate(-24 ${p.x + panelW / 2} ${p.y + panelH / 2})`}
              style={dSF(draw, t + 0.3 + i * 0.08, 0.3)}
            />
            <line
              pathLength={1}
              x1={p.x + panelW / 2} y1={p.y} x2={p.x + panelW / 2} y2={p.y + panelH}
              stroke={solar + "40"} strokeWidth="0.5"
              transform={`rotate(-24 ${p.x + panelW / 2} ${p.y + panelH / 2})`}
              style={dS(draw, t + 0.5 + i * 0.05, 0.2)}
            />
          </g>
        ))}
      </g>

      {/* Home battery */}
      <rect
        pathLength={1}
        x={batX} y={batY} width={batW} height={batH} rx={2}
        stroke={battery + "80"} strokeWidth="1.2" fill={battery + "0a"}
        style={dSF(draw, t + 0.5, 0.4)}
      />
      {/* Charge level indicator */}
      <rect
        x={batX + 2} y={batY + batH - chargeH - 2}
        width={batW - 4} height={chargeH}
        rx={1}
        fill={battery + "30"}
        style={draw ? { opacity: 0.6, animation: "vhCharge 2.5s ease-in-out infinite 1.5s" } : { opacity: 0 }}
      />
      {/* Battery terminal */}
      <rect
        pathLength={1}
        x={batX + 4} y={batY - 3} width={batW - 8} height={3} rx={1}
        stroke={battery + "60"} strokeWidth="0.8" fill={battery + "15"}
        style={dSF(draw, t + 0.55, 0.2)}
      />

      {/* EV -- simple car shape */}
      <g>
        {/* Car cabin */}
        <path
          pathLength={1}
          d={`
            M ${evX + 6} ${evY}
            L ${evX + 10} ${evY - 10}
            L ${evX + 38} ${evY - 10}
            L ${evX + 48} ${evY}
            Z
          `}
          stroke={ev + "80"} strokeWidth="1.2" fill={ev + "10"}
          strokeLinejoin="round"
          style={dSF(draw, t + 0.6, 0.4)}
        />
        {/* Car lower body */}
        <rect
          pathLength={1}
          x={evX + 2} y={evY} width={50} height={10} rx={2}
          stroke={ev + "70"} strokeWidth="1" fill={ev + "0c"}
          style={dSF(draw, t + 0.62, 0.3)}
        />
        {/* Wheels */}
        <circle cx={evX + 14} cy={evY + 10} r={4}
          stroke={ev + "50"} strokeWidth="1" fill={ev + "08"}
          style={draw ? { opacity: 1, transition: "opacity 0.5s 1s" } : { opacity: 0 }}
        />
        <circle cx={evX + 42} cy={evY + 10} r={4}
          stroke={ev + "50"} strokeWidth="1" fill={ev + "08"}
          style={draw ? { opacity: 1, transition: "opacity 0.5s 1s" } : { opacity: 0 }}
        />
        {/* Charging cable from car to house */}
        <path
          d={`M ${evX + 48} ${evY - 4} Q ${evX + 60} ${evY - 20} ${hx + 4} ${hy + hh - 8}`}
          stroke={ev + "50"} strokeWidth="1.2" fill="none"
          strokeDasharray="4 4"
          style={draw ? { animation: "vhDash 0.8s linear infinite 1.5s" } : { opacity: 0 }}
        />
      </g>

      {/* Heat pump unit */}
      <rect
        pathLength={1}
        x={hpX} y={hpY} width={hpW} height={hpH} rx={2}
        stroke={heatPump + "70"} strokeWidth="1" fill={heatPump + "0a"}
        style={dSF(draw, t + 0.7, 0.3)}
      />
      {/* Wave symbol (~) inside heat pump */}
      <path
        pathLength={1}
        d={`M ${hpX + 4} ${hpY + hpH / 2} Q ${hpX + 7} ${hpY + 3} ${hpX + 9} ${hpY + hpH / 2} Q ${hpX + 11} ${hpY + hpH - 3} ${hpX + 14} ${hpY + hpH / 2}`}
        stroke={heatPump + "60"} strokeWidth="1" fill="none"
        style={dS(draw, t + 0.8, 0.3)}
      />

      {/* HEMS controller indicator -- pulsing dot */}
      <circle
        cx={hemsX} cy={hemsY} r={3}
        fill={hems + "80"}
        style={draw ? { animation: "vhPulse 1.8s ease-in-out infinite 1s" } : { opacity: 0 }}
      />
      <circle
        cx={hemsX} cy={hemsY} r={6}
        fill="none" stroke={hems + "30"} strokeWidth="1"
        style={draw ? { animation: "vhPulse 1.8s ease-in-out infinite 1s" } : { opacity: 0 }}
      />

      {/* Windows on house */}
      <rect
        pathLength={1}
        x={hx + 14} y={hy + 16} width={18} height={14} rx={1}
        stroke={house + "40"} strokeWidth="0.8" fill={house + "06"}
        style={dSF(draw, t + 0.35, 0.25)}
      />
      <rect
        pathLength={1}
        x={hx + 40} y={hy + 16} width={18} height={14} rx={1}
        stroke={house + "40"} strokeWidth="0.8" fill={house + "06"}
        style={dSF(draw, t + 0.38, 0.25)}
      />
      {/* Door */}
      <rect
        pathLength={1}
        x={hx + hw / 2 - 8} y={hy + hh - 24} width={16} height={24} rx={1}
        stroke={house + "40"} strokeWidth="0.8" fill={house + "06"}
        style={dSF(draw, t + 0.4, 0.25)}
      />
    </svg>
  );
}
