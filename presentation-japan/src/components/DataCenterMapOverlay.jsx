import React, { useEffect, useRef } from 'react';
import { useAnimeTimeline, STAGGER_PATTERNS } from '../hooks/useAnimeJs.js';
import { gearRotation, countUpNumber, gridPattern } from '../utils/animationPatterns.js';
import JapanMapBackground from './JapanMapBackground.jsx';

const DataCenterMapOverlay = ({
  height = 600,
  autoPlay = false,
  showStress = false,
}) => {
  const svgRef = useRef(null);
  const { createTimeline, play } = useAnimeTimeline();

  // Data center locations (actual planned projects)
  const DATA_CENTERS = [
    { id: 'dc-1', name: 'Tokyo Metro', x: 580, y: 240, capacity: 500, status: 'delayed' },
    { id: 'dc-2', name: 'Kanto Region', x: 560, y: 270, capacity: 300, status: 'planning' },
    { id: 'dc-3', name: 'Kansai Hub', x: 460, y: 310, capacity: 400, status: 'delayed' },
    { id: 'dc-4', name: 'Kyushu Link', x: 380, y: 420, capacity: 350, status: 'planning' },
    { id: 'dc-5', name: 'Tohoku Facility', x: 540, y: 170, capacity: 250, status: 'delayed' },
  ];

  // Load growth curve points (19 TWh → 57 TWh → 66 TWh)
  const LOAD_POINTS = [
    { year: 2024, value: 19, x: 150 },
    { year: 2028, value: 35, x: 310 },
    { year: 2034, value: 57, x: 470 },
  ];

  useEffect(() => {
    if (!svgRef.current) return;

    const timeline = createTimeline({ autoplay: autoPlay });

    // Phase 1: Show grid baseline
    timeline.add('.grid-baseline', {
      opacity: [0, 0.3],
      duration: 400,
      ease: 'outQuad',
    }, 0);

    // Phase 2: Reveal data centers
    timeline.add('.data-center-marker', {
      opacity: [0, 1],
      scale: [0.3, 1],
      duration: 400,
      delay: (el, i) => STAGGER_PATTERNS.LINEAR(i),
      ease: 'outElastic(1, .6)',
    }, 200);

    // Phase 3: Show data center labels
    timeline.add('.dc-label', {
      opacity: [0, 1],
      translateX: [10, 0],
      duration: 300,
      delay: (el, i) => STAGGER_PATTERNS.LINEAR(i),
      ease: 'outQuad',
    }, 400);

    // Phase 4: Show demand forecast chart
    timeline.add('.demand-chart', {
      opacity: [0, 1],
      duration: 300,
      ease: 'outQuad',
    }, 600);

    // Animate chart curve
    const demandCurveEls = svgRef.current.querySelectorAll('.demand-curve');
    demandCurveEls.forEach((el) => {
      const length = el.getTotalLength();
      el.setAttribute('stroke-dasharray', length);
      el.setAttribute('stroke-dashoffset', length);
    });

    timeline.add('.demand-curve', {
      strokeDashoffset: (el) => [el.getAttribute('stroke-dashoffset'), 0],
      duration: 800,
      ease: 'inOutQuad',
    }, 700);

    // Animate chart data points
    timeline.add('.chart-point', {
      opacity: [0, 1],
      scale: [0, 1],
      duration: 300,
      delay: (el, i) => i * 150,
      ease: 'outQuad',
    }, 900);

    // Show chart labels with count-up
    timeline.add('.chart-label', {
      opacity: [0, 1],
      duration: 200,
      delay: (el, i) => i * 100,
      ease: 'outQuad',
    }, 1100);

    // Phase 5: Show grid stress zones
    if (showStress) {
      timeline.add('.stress-zone', {
        opacity: [0, 0.5],
        duration: 400,
        delay: (el, i) => i * 100,
        ease: 'outQuad',
      }, 1500);

      // Animate stress indicator gears
      gearRotation(timeline, '.stress-gear', {
        duration: 3000,
        delay: 1800,
        rotations: 1,
        scaleOscillate: false,
      });

      // Show stress lines to utilities
      const stressLineEls = svgRef.current.querySelectorAll('.stress-line');
      stressLineEls.forEach((el) => {
        const length = el.getTotalLength();
        el.setAttribute('stroke-dasharray', length);
        el.setAttribute('stroke-dashoffset', length);
      });

      timeline.add('.stress-line', {
        opacity: [0, 0.8],
        strokeDashoffset: (el) => [el.getAttribute('stroke-dashoffset'), 0],
        duration: 600,
        delay: (el, i) => i * 100,
        ease: 'inOutQuad',
      }, 2000);
    }

    if (autoPlay) play();

    return () => {
      timeline.pause();
    };
  }, [autoPlay, showStress, createTimeline]);

  return (
    <div
      style={{
        height,
        width: '100%',
        position: 'relative',
        background: 'linear-gradient(135deg, rgba(6, 10, 26, 0.9), rgba(57, 57, 216, 0.15))',
        borderRadius: 12,
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      {/* Map SVG */}
      <div style={{ flex: 1, position: 'relative' }}>
        <JapanMapBackground opacity={0.3} />
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          viewBox="0 0 700 550"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Grid baseline (utilities) */}
          <g className="grid-baseline" opacity="0">
            <circle cx="550" cy="100" r="7" fill="#22d3ee" opacity="0.6" />
            <circle cx="550" cy="180" r="7" fill="#22d3ee" opacity="0.6" />
            <circle cx="570" cy="240" r="7" fill="#22d3ee" opacity="0.6" />
            <circle cx="500" cy="260" r="7" fill="#22d3ee" opacity="0.6" />
            <circle cx="450" cy="300" r="7" fill="#10b981" opacity="0.6" />
            <circle cx="400" cy="320" r="7" fill="#10b981" opacity="0.6" />
            <circle cx="420" cy="380" r="7" fill="#10b981" opacity="0.6" />
            <circle cx="360" cy="420" r="7" fill="#10b981" opacity="0.6" />

            {/* Utility connections */}
            <path
              d="M 550,100 L 550,180 L 570,240 L 500,260"
              stroke="#22d3ee"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
            <path
              d="M 450,300 L 400,320 L 420,380 L 360,420"
              stroke="#10b981"
              strokeWidth="1"
              fill="none"
              opacity="0.3"
            />
          </g>

          {/* Data center markers */}
          {DATA_CENTERS.map((dc) => (
            <g key={dc.id} className="data-center-marker" opacity="0">
              <g>
                {/* Main marker with pulsing background */}
                <circle cx={dc.x} cy={dc.y} r="14" fill="#FFC217" opacity="0.2" />
                <circle cx={dc.x} cy={dc.y} r="10" fill="#FFC217" opacity="0.9" />
                <circle cx={dc.x} cy={dc.y} r="14" fill="none" stroke="#FFC217" strokeWidth="2" opacity="0.5" />

                {/* Status indicator */}
                <circle
                  cx={dc.x + 12}
                  cy={dc.y - 12}
                  r="4"
                  fill={dc.status === 'delayed' ? '#ef4444' : '#FFA35F'}
                  opacity="0.9"
                />

                {/* Label */}
                <text
                  className="dc-label"
                  x={dc.x + 20}
                  y={dc.y + 5}
                  fontSize="11"
                  fill="#94a3b8"
                  fontFamily="Inter, sans-serif"
                  opacity="0"
                >
                  {dc.name} ({dc.capacity}MW)
                </text>
              </g>

              {/* Stress zone (circles showing affected area) */}
              {showStress && (
                <circle
                  className="stress-zone"
                  cx={dc.x}
                  cy={dc.y}
                  r="60"
                  fill={dc.status === 'delayed' ? '#ef4444' : '#FFA35F'}
                  opacity="0"
                />
              )}
            </g>
          ))}

          {/* Stress lines from data centers to nearby utilities */}
          {showStress && (
            <>
              <path
                className="stress-line"
                d="M 580,240 L 550,240"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0"
                strokeDasharray="100"
              />
              <path
                className="stress-line"
                d="M 460,310 L 450,300"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0"
                strokeDasharray="100"
              />
              <path
                className="stress-line"
                d="M 380,420 L 360,420"
                stroke="#ef4444"
                strokeWidth="2"
                opacity="0"
                strokeDasharray="100"
              />
            </>
          )}

          {/* Decorative elements */}
          <g opacity="0.08">
            {Array.from({ length: 7 }).map((_, i) => (
              <line
                key={`vline-${i}`}
                x1={i * 100 + 50}
                y1="0"
                x2={i * 100 + 50}
                y2="550"
                stroke="#3939D8"
                strokeWidth="1"
              />
            ))}
          </g>
        </svg>
      </div>

      {/* Demand forecast chart */}
      <div
        style={{
          width: 300,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(6, 10, 26, 0.4)',
          borderLeft: '1px solid rgba(57, 57, 216, 0.2)',
        }}
      >
        <div className="demand-chart" style={{ opacity: 0 }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#f1f5f9',
              fontFamily: 'Space Grotesk, sans-serif',
              marginBottom: 16,
            }}
          >
            Data Center Demand
          </div>

          {/* Mini chart */}
          <svg width="100%" height="140" viewBox="0 0 260 140" preserveAspectRatio="xMidYMid meet">
            {/* Axes */}
            <line x1="20" y1="120" x2="260" y2="120" stroke="#64748b" strokeWidth="1" opacity="0.5" />
            <line x1="20" y1="120" x2="20" y2="20" stroke="#64748b" strokeWidth="1" opacity="0.5" />

            {/* Y-axis label */}
            <text x="8" y="130" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif">
              0 TWh
            </text>
            <text x="2" y="35" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif">
              70 TWh
            </text>

            {/* Grid lines */}
            {[0, 1, 2].map((i) => (
              <line
                key={`grid-${i}`}
                x1="20"
                y1={120 - (i * 50)}
                x2="260"
                y2={120 - (i * 50)}
                stroke="#3939D8"
                strokeWidth="1"
                opacity="0.1"
                strokeDasharray="4,2"
              />
            ))}

            {/* Demand curve */}
            <path
              className="demand-curve"
              d="M 30,100 Q 90,85 150,55 T 250,20"
              stroke="#FFC217"
              strokeWidth="3"
              fill="none"
              opacity="0.8"
              strokeDasharray="500"
            />

            {/* Data points */}
            {LOAD_POINTS.map((point, idx) => (
              <g key={`point-${idx}`} className="chart-point">
                <circle
                  cx={point.x + 30}
                  cy={120 - (point.value / 70) * 100}
                  r="4"
                  fill="#FFC217"
                  opacity="0"
                />
                <text
                  x={point.x + 30}
                  y={120 - (point.value / 70) * 100 - 12}
                  fontSize="11"
                  fill="#FFC217"
                  fontWeight="700"
                  fontFamily="JetBrains Mono, monospace"
                  textAnchor="middle"
                  opacity="0"
                  className="chart-label"
                >
                  {point.value}
                </text>
              </g>
            ))}

            {/* X-axis labels */}
            <text x="30" y="135" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif" textAnchor="middle">
              2024
            </text>
            <text x="150" y="135" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif" textAnchor="middle">
              2028
            </text>
            <text x="250" y="135" fontSize="10" fill="#94a3b8" fontFamily="Inter, sans-serif" textAnchor="middle">
              2034
            </text>
          </svg>

          {/* Stats */}
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <div
              style={{
                flex: 1,
                background: 'rgba(255, 193, 23, 0.1)',
                border: '1px solid #FFC21750',
                borderRadius: 6,
                padding: '8px',
                textAlign: 'center',
                fontSize: 12,
                color: '#FFC217',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
              }}
            >
              3x increase
            </div>
            <div
              style={{
                flex: 1,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef444450',
                borderRadius: 6,
                padding: '8px',
                textAlign: 'center',
                fontSize: 12,
                color: '#ef4444',
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
              }}
            >
              40+ delayed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCenterMapOverlay;
