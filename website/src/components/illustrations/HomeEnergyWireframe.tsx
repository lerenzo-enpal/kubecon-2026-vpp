import React from "react";

export default function HomeEnergyWireframe({
  width = 200,
  height = 130,
  color = "#22d3ee",
}) {
  const vbW = 200;
  const vbH = 130;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${vbW} ${vbH}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Wireframe illustration of a residential home with rooftop solar panels, home battery, EV charger and heat pump"
      style={{ maxWidth: "100%", height: "auto" }}
    >
      <style>{`
        .main {
          stroke: ${color};
          stroke-width: 1.25;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          opacity: 0.8;
          vector-effect: non-scaling-stroke;
        }

        .detail {
          stroke: ${color};
          stroke-width: 0.72;
          stroke-linecap: round;
          stroke-linejoin: round;
          fill: none;
          opacity: 0.4;
          vector-effect: non-scaling-stroke;
        }

        .soft-fill {
          fill: ${color};
          fill-opacity: 0.04;
          stroke: none;
        }

        .draw-house,
        .draw-panels,
        .draw-devices,
        .draw-bars,
        .draw-ev {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: draw 1s ease forwards;
        }

        .draw-house { animation-delay: 0s; }
        .draw-panels { animation-delay: 0.65s; }
        .draw-devices { animation-delay: 1.2s; }
        .draw-bars { animation-delay: 1.8s; }
        .draw-ev { animation-delay: 2.0s; }

        .panel-glow {
          animation: panelPulse 3s ease-in-out infinite;
          animation-delay: 1.1s;
        }

        .device-glow {
          animation: glowPulse 3.4s ease-in-out infinite;
          animation-delay: 1.8s;
        }

        .battery-bar {
          opacity: 0;
          animation: barFill 0.55s ease forwards;
        }

        .battery-bar.b1 { animation-delay: 1.95s; }
        .battery-bar.b2 { animation-delay: 2.1s; }
        .battery-bar.b3 { animation-delay: 2.25s; }
        .battery-bar.b4 { animation-delay: 2.4s; }

        @keyframes draw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes panelPulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.82; }
        }

        @keyframes glowPulse {
          0%, 100% { opacity: 0.45; }
          50% { opacity: 0.75; }
        }

        @keyframes barFill {
          0% {
            opacity: 0;
            transform: scaleX(0);
            transform-origin: left center;
          }
          100% {
            opacity: 0.78;
            transform: scaleX(1);
            transform-origin: left center;
          }
        }
      `}</style>

      {/* subtle fills */}
      <polygon className="soft-fill" points="36,61 82,30 128,61 128,108 36,108" />
      <polygon className="soft-fill" points="57,50 70,42 77,53 64,61" />
      <polygon className="soft-fill" points="72,40 85,32 92,43 79,51" />
      <polygon className="soft-fill" points="87,50 100,42 107,53 94,61" />
      <polygon className="soft-fill" points="102,40 115,32 122,43 109,51" />
      <rect className="soft-fill" x="135" y="70" width="18" height="36" rx="1" />
      <rect className="soft-fill" x="150" y="88" width="18" height="16" rx="1" />
      <rect className="soft-fill" x="18" y="78" width="14" height="24" rx="1" />

      {/* HOUSE */}
      <g className="draw-house">
        <path className="main" d="M36 108 L36 61 L82 30 L128 61 L128 108" />
        <path className="main" d="M26 67 L82 24 L138 67" />
        <path className="detail" d="M44 108 H135" />
        <path className="detail" d="M82 30 V108" />

        <rect className="main" x="75" y="78" width="15" height="30" rx="1" />
        <path className="detail" d="M86 93 h1.5" />

        <rect className="main" x="49" y="73" width="17" height="15" rx="1" />
        <path className="detail" d="M57.5 73 V88" />
        <path className="detail" d="M49 80.5 H66" />

        <rect className="main" x="100" y="73" width="17" height="15" rx="1" />
        <path className="detail" d="M108.5 73 V88" />
        <path className="detail" d="M100 80.5 H117" />
      </g>

      {/* SOLAR PANELS */}
      <g className="draw-panels panel-glow">
        <polygon className="main" points="57,50 70,42 77,53 64,61" />
        <polygon className="main" points="72,40 85,32 92,43 79,51" />
        <polygon className="main" points="87,50 100,42 107,53 94,61" />
        <polygon className="main" points="102,40 115,32 122,43 109,51" />

        {/* panel grid lines */}
        <path className="detail" d="M60 51.5 L73 43.5" />
        <path className="detail" d="M64 59 L68 44.5" />
        <path className="detail" d="M64 46.5 L71 57" />

        <path className="detail" d="M75 41.5 L88 33.5" />
        <path className="detail" d="M79 49 L83 34.5" />
        <path className="detail" d="M79 36.5 L86 47" />

        <path className="detail" d="M90 51.5 L103 43.5" />
        <path className="detail" d="M94 59 L98 44.5" />
        <path className="detail" d="M94 46.5 L101 57" />

        <path className="detail" d="M105 41.5 L118 33.5" />
        <path className="detail" d="M109 49 L113 34.5" />
        <path className="detail" d="M109 36.5 L116 47" />
      </g>

      {/* BATTERY + HEAT PUMP */}
      <g className="draw-devices device-glow">
        {/* battery */}
        <rect className="main" x="135" y="70" width="18" height="36" rx="1" />
        <path className="detail" d="M140 66 h8" />
        <path className="detail" d="M142 63 v6" />
        <path className="detail" d="M146 63 v6" />
        <path className="detail" d="M135 76 h18" />

        {/* heat pump condenser */}
        <rect className="main" x="150" y="88" width="18" height="16" rx="1" />
        <circle className="detail" cx="159" cy="96" r="4.2" />
        <path className="detail" d="M159 91.8 V100.2" />
        <path className="detail" d="M154.8 96 H163.2" />
        <path className="detail" d="M156 93 L162 99" />
        <path className="detail" d="M162 93 L156 99" />

        {/* connection lines from house */}
        <path className="detail" d="M128 88 H133" />
        <path className="detail" d="M128 96 H148" />
      </g>

      {/* BATTERY BARS */}
      <g className="draw-bars">
        <rect className="detail" x="139" y="81" width="10" height="2.8" rx="1" />
        <rect className="detail" x="139" y="87" width="10" height="2.8" rx="1" />
        <rect className="detail" x="139" y="93" width="10" height="2.8" rx="1" />
        <rect className="detail" x="139" y="99" width="10" height="2.8" rx="1" />

        <rect className="battery-bar b1" x="139" y="81" width="10" height="2.8" rx="1" fill={color} fillOpacity="0.75" stroke="none" />
        <rect className="battery-bar b2" x="139" y="87" width="10" height="2.8" rx="1" fill={color} fillOpacity="0.75" stroke="none" />
        <rect className="battery-bar b3" x="139" y="93" width="10" height="2.8" rx="1" fill={color} fillOpacity="0.75" stroke="none" />
        <rect className="battery-bar b4" x="139" y="99" width="10" height="2.8" rx="1" fill={color} fillOpacity="0.75" stroke="none" />
      </g>

      {/* EV CHARGER + SIMPLE EV ICON */}
      <g className="draw-ev device-glow">
        {/* charger */}
        <rect className="main" x="18" y="78" width="14" height="24" rx="1" />
        <path className="detail" d="M22 82 h6" />
        <path className="detail" d="M25 82 v6" />
        <path className="detail" d="M28.5 90 C34 90, 36 92, 36 97" />
        <path className="detail" d="M36 97 v5" />
        <path className="detail" d="M34.5 102 h3" />

        {/* tiny EV/car hint */}
        <path className="main" d="M8 103 H18" />
        <path className="main" d="M10 103 L12.5 97 H20.5 L23 103" />
        <path className="detail" d="M11.2 103 a1.4 1.4 0 1 0 0.01 0" />
        <path className="detail" d="M19.8 103 a1.4 1.4 0 1 0 0.01 0" />
        <path className="detail" d="M13.5 97 H19" />
      </g>
    </svg>
  );
}
