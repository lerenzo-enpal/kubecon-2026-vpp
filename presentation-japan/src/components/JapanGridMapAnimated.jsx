import React, { useEffect, useRef, useState } from 'react';
import { useAnimeTimeline } from '../hooks/useAnimeJs.js';
import { drawPath, countUpNumber, followPath } from '../utils/animationPatterns.js';
import JapanMapBackground from './JapanMapBackground.jsx';

const JAPAN_CAMERA = { center: [138.25, 36.2], zoom: 4.5, bearing: 0, pitch: 0 };
const HORMUZ_CAMERA = { center: [56.3, 26.6], zoom: 4.1, bearing: 0, pitch: 0 };

const JapanGridMapAnimated = ({
  height = 600,
  step = 0,
  autoPlaySteps = false,
  testId,
}) => {
  const svgRef = useRef(null);
  const routePathRef = useRef(null);
  const shipRef = useRef(null);
  const hasRunHormuzTransit = useRef(false);
  const { createTimeline, play } = useAnimeTimeline();
  const { createTimeline: createTransitTimeline, play: playTransit, pause: pauseTransit } = useAnimeTimeline();
  const [mapInstance, setMapInstance] = useState(null);
  const [stats, setStats] = useState({
    sufficiency: 0,
    fossilFuel: 0,
    regionCount: 0,
  });

  // Simplified Japan grid data with 10 regional utilities
  const UTILITIES = [
    { id: 'hokkaido', name: 'Hokkaido', x: 550, y: 100, color: '#22d3ee', freq: '50Hz' },
    { id: 'tohoku', name: 'Tohoku', x: 550, y: 180, color: '#22d3ee', freq: '50Hz' },
    { id: 'kanto', name: 'Kanto', x: 570, y: 240, color: '#22d3ee', freq: '50Hz' },
    { id: 'chubu', name: 'Chubu', x: 500, y: 260, color: '#22d3ee', freq: '50Hz' },
    { id: 'kansai', name: 'Kansai', x: 450, y: 300, color: '#10b981', freq: '60Hz' },
    { id: 'chugoku', name: 'Chugoku', x: 400, y: 320, color: '#10b981', freq: '60Hz' },
    { id: 'shikoku', name: 'Shikoku', x: 420, y: 380, color: '#10b981', freq: '60Hz' },
    { id: 'kyushu', name: 'Kyushu', x: 360, y: 420, color: '#10b981', freq: '60Hz' },
    { id: 'okinawa', name: 'Okinawa', x: 340, y: 480, color: '#10b981', freq: '60Hz' },
  ];

  const LNG_POINTS = [
    { id: 'terminal-1', name: 'Tokyo LNG', x: 590, y: 230 },
    { id: 'terminal-2', name: 'Osaka LNG', x: 440, y: 310 },
    { id: 'terminal-3', name: 'Fukuoka LNG', x: 350, y: 420 },
  ];

  // Animation sequences for each step
  useEffect(() => {
    if (!svgRef.current) return;

    const timeline = createTimeline({ autoplay: autoPlaySteps });

    // Step 0: Show Japan island outline
    if (step >= 0) {
      timeline.add(
        '.japan-outline',
        {
          opacity: [0, 0.15],
          duration: 400,
          ease: 'outQuad',
        },
        0
      );
    }

    // Step 1: Reveal 50Hz utilities (East)
    if (step >= 1) {
      timeline.add(
        '.utility-50hz',
        {
          opacity: [0, 1],
          scale: [0.5, 1],
          duration: 400,
          delay: (el, i) => i * 80,
          ease: 'outElastic(1, .6)',
        },
        step === 1 ? 0 : '+=200'
      );

      // Draw connections between 50Hz utilities
      drawPath(timeline, '.path-50hz', {
        duration: 600,
        delay: 800,
        ease: 'inOutQuad',
      });
    }

    // Step 2: Reveal 60Hz utilities (West)
    if (step >= 2) {
      timeline.add(
        '.utility-60hz',
        {
          opacity: [0, 1],
          scale: [0.5, 1],
          duration: 400,
          delay: (el, i) => i * 80,
          ease: 'outElastic(1, .6)',
        },
        step === 2 ? 0 : '+=300'
      );

      // Draw connections between 60Hz utilities
      drawPath(timeline, '.path-60hz', {
        duration: 600,
        delay: 800,
        ease: 'inOutQuad',
      });
    }

    // Step 3: Show frequency dividing line
    if (step >= 3) {
      const dividerEls = svgRef.current.querySelectorAll('.freq-divider');
      dividerEls.forEach((el) => {
        const length = el.getTotalLength();
        el.setAttribute('stroke-dasharray', length);
        el.setAttribute('stroke-dashoffset', length);
      });

      timeline.add(
        '.freq-divider',
        {
          opacity: [0, 0.6],
          strokeDashoffset: (el) => [el.getAttribute('stroke-dashoffset'), 0],
          duration: 800,
          ease: 'inOutQuad',
        },
        step === 3 ? 0 : '+=400'
      );

      // Show frequency labels
      timeline.add(
        '.freq-label-50hz, .freq-label-60hz',
        {
          opacity: [0, 1],
          duration: 300,
          ease: 'outQuad',
        },
        '-=400'
      );
    }

    // Step 4: Show LNG terminals and import flow
    if (step >= 4) {
      timeline.add(
        '.lng-terminal',
        {
          opacity: [0, 1],
          scale: [0, 1],
          duration: 400,
          delay: (el, i) => i * 100,
          ease: 'outQuad',
        },
        step === 4 ? 0 : '+=300'
      );

      // Animate LNG import flow lines
      const flowEls = svgRef.current.querySelectorAll('.lng-flow');
      flowEls.forEach((el) => {
        const length = el.getTotalLength();
        el.setAttribute('stroke-dasharray', length);
        el.setAttribute('stroke-dashoffset', length);
      });

      timeline.add(
        '.lng-flow',
        {
          opacity: [0, 1],
          strokeDashoffset: (el) => [el.getAttribute('stroke-dashoffset'), 0],
          duration: 800,
          delay: (el, i) => i * 150,
          ease: 'linear',
        },
        '-=200'
      );

      // Pulsing energy indicator along routes
      timeline.add(
        '.lng-pulse',
        {
          r: [0, 12],
          opacity: [1, 0],
          duration: 600,
          delay: (el, i) => i * 200,
          ease: 'outQuad',
          loop: true,
        },
        '-=400'
      );
    }

    // Step 6: Show stats boxes with 15.3% and energy info
    if (step >= 6) {
      timeline.add(
        '.stat-box',
        {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 400,
          delay: (el, i) => i * 100,
          ease: 'outQuad',
        },
        step === 6 ? 0 : '+=300'
      );

      // Count up stats
      const suffEl = svgRef.current?.querySelector('.stat-sufficiency-value');
      const fossilEl = svgRef.current?.querySelector('.stat-fossil-value');

      if (suffEl) {
        countUpNumber(timeline, suffEl, 15.3, {
          from: 0,
          duration: 800,
          format: (v) => v.toFixed(1) + '%',
        });
      }

      if (fossilEl) {
        countUpNumber(timeline, fossilEl, 70, {
          from: 0,
          duration: 800,
          format: (v) => Math.round(v) + '%',
        });
      }
    }

    // Step 7: Show 50/60Hz seam sidebar
    if (step >= 7) {
      timeline.add(
        '.freq-seam-sidebar',
        {
          opacity: [0, 1],
          translateX: [-30, 0],
          duration: 400,
          ease: 'outQuad',
        },
        step === 7 ? 0 : '+=300'
      );
    }

    play();
  }, [step, createTimeline]);

  useEffect(() => {
    if (step < 5) {
      hasRunHormuzTransit.current = false;
    }

    if (step !== 5 || !mapInstance || hasRunHormuzTransit.current) {
      return undefined;
    }

    hasRunHormuzTransit.current = true;
    mapInstance.easeTo({ ...HORMUZ_CAMERA, duration: 1100, essential: true });

    const routeTimer = window.setTimeout(() => {
      if (!routePathRef.current || !shipRef.current) return;

      const transit = createTransitTimeline();
      const pathLength = routePathRef.current.getTotalLength();
      routePathRef.current.setAttribute('stroke-dasharray', pathLength);
      routePathRef.current.setAttribute('stroke-dashoffset', pathLength);
      transit.add(routePathRef.current, {
        strokeDashoffset: [pathLength, 0],
        duration: 1600,
        ease: 'inOutQuad',
      }, 0);
      followPath(transit, shipRef.current, routePathRef.current, {
        duration: 1600,
        ease: 'inOutQuad',
      });
      playTransit();
      mapInstance.easeTo({ ...JAPAN_CAMERA, duration: 1600, essential: true });
    }, 1120);

    return () => {
      window.clearTimeout(routeTimer);
      pauseTransit();
    };
  }, [step, mapInstance, createTransitTimeline, playTransit, pauseTransit]);

  return (
    <div
      data-testid={testId}
      style={{
        height,
        width: '100%',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(6, 10, 26, 0.8), rgba(57, 57, 216, 0.1))',
        overflow: 'hidden',
      }}
    >
      <JapanMapBackground opacity={0.25} onMapReady={setMapInstance} />
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 700 550"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', top: 0, left: 0, zIndex: 10 }}
      >
        <g opacity={step === 5 ? 0 : 1}>
        {/* Japan island outline (simplified) */}
        <g className="japan-outline" opacity="0">
          <path
            d="M 450,200 Q 480,150 520,160 Q 540,170 550,200 L 560,250 Q 570,280 560,320 L 520,350 Q 480,340 450,300 Z"
            fill="none"
            stroke="#94a3b8"
            strokeWidth="2"
            opacity="0.3"
          />
        </g>

        {/* 50Hz Utilities (East) */}
        {UTILITIES.filter((u) => u.freq === '50Hz').map((utility) => (
          <g key={utility.id} className="utility-50hz" opacity="0">
            <circle cx={utility.x} cy={utility.y} r="8" fill={utility.color} opacity="0.8" />
            <circle cx={utility.x} cy={utility.y} r="12" fill="none" stroke={utility.color} strokeWidth="2" opacity="0.3" />
            <text
              x={utility.x + 18}
              y={utility.y + 4}
              fontSize="11"
              fill="#94a3b8"
              fontFamily="Inter, sans-serif"
            >
              {utility.name}
            </text>
          </g>
        ))}

        {/* 50Hz network paths */}
        <path
          className="path-50hz"
          d="M 550,100 L 550,180 L 570,240"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2"
          strokeDasharray="1000"
          opacity="0"
        />

        {/* 60Hz Utilities (West) */}
        {UTILITIES.filter((u) => u.freq === '60Hz').map((utility) => (
          <g key={utility.id} className="utility-60hz" opacity="0">
            <circle cx={utility.x} cy={utility.y} r="8" fill={utility.color} opacity="0.8" />
            <circle cx={utility.x} cy={utility.y} r="12" fill="none" stroke={utility.color} strokeWidth="2" opacity="0.3" />
            <text
              x={utility.x - 60}
              y={utility.y + 4}
              fontSize="11"
              fill="#94a3b8"
              fontFamily="Inter, sans-serif"
            >
              {utility.name}
            </text>
          </g>
        ))}

        {/* 60Hz network paths */}
        <path
          className="path-60hz"
          d="M 450,300 L 400,320 L 420,380 L 360,420 L 340,480"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeDasharray="1000"
          opacity="0"
        />

        {/* Frequency dividing line (1.2 GW capacity) */}
        <line
          className="freq-divider"
          x1="500"
          y1="200"
          x2="430"
          y2="350"
          stroke="#FFA35F"
          strokeWidth="3"
          strokeDasharray="50,30"
          opacity="0"
        />

        {/* Frequency labels */}
        <text
          className="freq-label-50hz"
          x="530"
          y="140"
          fontSize="14"
          fill="#22d3ee"
          fontWeight="700"
          fontFamily="Space Grotesk, sans-serif"
          opacity="0"
        >
          50 Hz
        </text>
        <text
          className="freq-label-60hz"
          x="380"
          y="380"
          fontSize="14"
          fill="#10b981"
          fontWeight="700"
          fontFamily="Space Grotesk, sans-serif"
          opacity="0"
        >
          60 Hz
        </text>

        {/* LNG Terminals */}
        {LNG_POINTS.map((terminal, idx) => (
          <g key={terminal.id} className="lng-terminal" opacity="0">
            <circle cx={terminal.x + 80} cy={terminal.y - 80} r="6" fill="#FFC217" opacity="0.9" />
            <text
              x={terminal.x + 90}
              y={terminal.y - 75}
              fontSize="10"
              fill="#FFC217"
              fontFamily="Inter, sans-serif"
            >
              {terminal.name}
            </text>
          </g>
        ))}

        {/* LNG flow routes */}
        {LNG_POINTS.map((terminal, idx) => (
          <path
            key={`lng-flow-${idx}`}
            className="lng-flow"
            d={`M ${terminal.x + 80},${terminal.y - 80} L ${terminal.x},${terminal.y}`}
            stroke="#FFC217"
            strokeWidth="2"
            fill="none"
            opacity="0"
            strokeDasharray="1000"
          />
        ))}

        {/* LNG pulse indicators */}
        {LNG_POINTS.map((terminal, idx) => (
          <circle
            key={`lng-pulse-${idx}`}
            className="lng-pulse"
            cx={terminal.x}
            cy={terminal.y}
            r="0"
            fill="#FFC217"
            opacity="0"
          />
        ))}
        </g>

        <g data-testid="hormuz-route" opacity={step >= 5 ? 1 : 0}>
          <circle cx="90" cy="260" r="11" fill="#ef4444" opacity="0.9" />
          <circle cx="90" cy="260" r="19" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.45" />
          <path
            ref={routePathRef}
            className="hormuz-route"
            d="M 90,260 C 165,226 240,275 315,225 S 465,145 590,170"
            stroke="#ef4444"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 8"
          />
          <circle ref={shipRef} cx="90" cy="260" r="7" fill="#FFC217" stroke="#fef3c7" strokeWidth="2" />
          <text x="48" y="300" fontSize="16" fill="#fecaca" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
            Strait of Hormuz
          </text>
          <text x="505" y="142" fontSize="15" fill="#a5f3fc" fontWeight="700" fontFamily="Space Grotesk, sans-serif">
            Japan LNG terminals
          </text>
        </g>

        {/* Stats boxes */}
        <g className="stat-box" opacity="0">
          <rect x="20" y="460" width="140" height="70" rx="6" fill="#22d3ee" opacity="0.1" stroke="#22d3ee" strokeWidth="1" />
          <text x="35" y="485" fontSize="12" fill="#22d3ee" fontFamily="Space Grotesk, sans-serif" fontWeight="700">
            Self-Sufficiency
          </text>
          <text x="35" y="510" fontSize="28" fill="#22d3ee" fontWeight="700" fontFamily="JetBrains Mono, monospace">
            <tspan className="stat-sufficiency-value">0%</tspan>
          </text>
        </g>

        <g className="stat-box" opacity="0">
          <rect x="180" y="460" width="140" height="70" rx="6" fill="#FFA35F" opacity="0.1" stroke="#FFA35F" strokeWidth="1" />
          <text x="195" y="485" fontSize="12" fill="#FFA35F" fontFamily="Space Grotesk, sans-serif" fontWeight="700">
            Fossil Fuel
          </text>
          <text x="195" y="510" fontSize="28" fill="#FFA35F" fontWeight="700" fontFamily="JetBrains Mono, monospace">
            <tspan className="stat-fossil-value">0%</tspan>
          </text>
        </g>

        {/* 50/60Hz Seam Sidebar */}
        <g className="freq-seam-sidebar" opacity="0">
          <rect x="10" y="200" width="35" height="200" rx="4" fill="#FFA35F" opacity="0.15" stroke="#FFA35F" strokeWidth="1" />
          <text x="27" y="215" fontSize="10" fill="#FFA35F" fontWeight="700" fontFamily="Space Grotesk, sans-serif" textAnchor="middle">
            50 Hz
          </text>
          <text x="27" y="235" fontSize="9" fill="#94a3b8" fontFamily="Inter, sans-serif" textAnchor="middle" opacity="0.7">
            East
          </text>
          <line x1="27" y1="245" x2="27" y2="360" stroke="#FFA35F" strokeWidth="2" opacity="0.4" strokeDasharray="5,5" />
          <text x="27" y="375" fontSize="10" fill="#10b981" fontWeight="700" fontFamily="Space Grotesk, sans-serif" textAnchor="middle">
            60 Hz
          </text>
          <text x="27" y="395" fontSize="9" fill="#94a3b8" fontFamily="Inter, sans-serif" textAnchor="middle" opacity="0.7">
            West
          </text>
        </g>
      </svg>
    </div>
  );
};

export default JapanGridMapAnimated;
