import React, { useEffect, useRef, useState } from 'react';
import { useAnimeTimeline, STAGGER_PATTERNS } from '../hooks/useAnimeJs.js';
import {
  pulseEffect,
  countUpNumber,
  gridPattern,
  radialBurst,
} from '../utils/animationPatterns.js';
import JapanMapBackground from './JapanMapBackground.jsx';

const EnergyUsageScalingAnimation = ({ height = 500, autoPlay = false }) => {
  const containerRef = useRef(null);
  const { createTimeline, play, pause, reset } = useAnimeTimeline();
  const [scale, setScale] = useState(0);

  // SVG building blocks - reusable shapes
  const Building = ({ x, y, scale, opacity, id }) => (
    <g
      key={id}
      className="building"
      data-scale={scale}
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        opacity,
        transformOrigin: 'center center',
      }}
    >
      <rect x="0" y="20" width="40" height="60" fill="#3939D8" opacity="0.8" />
      <rect x="8" y="30" width="6" height="8" fill="#FFC217" />
      <rect x="18" y="30" width="6" height="8" fill="#FFC217" />
      <rect x="28" y="30" width="6" height="8" fill="#FFC217" />
      <rect x="8" y="42" width="6" height="8" fill="#FFC217" />
      <rect x="18" y="42" width="6" height="8" fill="#FFC217" />
      <rect x="28" y="42" width="6" height="8" fill="#FFC217" />
      <rect x="8" y="54" width="6" height="8" fill="#FFC217" />
      <rect x="18" y="54" width="6" height="8" fill="#FFC217" />
      <rect x="28" y="54" width="6" height="8" fill="#FFC217" />
    </g>
  );

  const Home = ({ x, y, scale, opacity, id }) => (
    <g
      key={id}
      className="home"
      data-scale={scale}
      style={{
        transform: `translate(${x}px, ${y}px) scale(${scale})`,
        opacity,
        transformOrigin: 'center center',
      }}
    >
      <rect x="0" y="15" width="30" height="35" fill="#22d3ee" opacity="0.8" />
      <polygon points="0,15 15,0 30,15" fill="#22d3ee" opacity="0.9" />
      <rect x="6" y="22" width="5" height="5" fill="#FFC217" />
      <rect x="19" y="22" width="5" height="5" fill="#FFC217" />
      <rect x="6" y="32" width="5" height="5" fill="#FFC217" />
      <rect x="19" y="32" width="5" height="5" fill="#FFC217" />
    </g>
  );

  const EnergyWave = ({ id, cx, cy, r, opacity }) => (
    <circle
      key={id}
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="#FFA35F"
      strokeWidth="2"
      opacity={opacity}
      className="energy-wave"
    />
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const timeline = createTimeline({
      duration: 12000,
      autoplay: autoPlay,
    });

    // Phase 1: Single home (0-3000ms)
    timeline.add('.home', {
      opacity: [0, 1],
      scale: [0.5, 1],
      duration: 800,
      ease: 'outElastic(1, .6)',
    }, 0);

    pulseEffect(timeline, '.home', { scale: 1.1, duration: 400, delay: 1000 });

    // Home energy pulse
    timeline.add('.energy-wave', {
      r: [0, 40],
      opacity: [1, 0],
      duration: 600,
      ease: 'outQuad',
      stagger: 200,
    }, 1200);

    // Phase 2: Transform to building cluster (3000-7000ms)
    // Fade out single home, scale up
    timeline.add('.home', {
      opacity: 0,
      scale: 2,
      duration: 800,
      ease: 'inQuad',
    }, 2800);

    // Introduce buildings in grid pattern
    timeline.add('.building', {
      opacity: [0, 0.8],
      scale: [0.3, 1],
      duration: 600,
      ease: 'outElastic(1, .5)',
      stagger: (el, i) => STAGGER_PATTERNS.LINEAR(i),
    }, 3000);

    // Building cluster pulses
    pulseEffect(timeline, '.building', {
      scale: 1.15,
      duration: 400,
      delay: 4000,
    });

    // Wave expands from building cluster
    timeline.add('.energy-wave', {
      r: [0, 80],
      opacity: [1, 0],
      duration: 800,
      ease: 'outQuad',
      stagger: 150,
    }, 4200);

    // Phase 3: Expand to city scale (7000-12000ms)
    // Shrink buildings, expand grid
    timeline.add('.building', {
      scale: [1, 0.3],
      opacity: 0.4,
      duration: 600,
      ease: 'inQuad',
    }, 6800);

    // New city-scale grid appears
    timeline.add('.building-city', {
      opacity: [0, 0.6],
      scale: [0, 1],
      duration: 800,
      ease: 'outQuad',
      stagger: (el, i) => STAGGER_PATTERNS.EXPONENTIAL(i),
    }, 7200);

    // Large wave from city center
    timeline.add('.energy-wave-city', {
      r: [0, 150],
      opacity: [1, 0],
      duration: 1200,
      ease: 'outQuad',
      stagger: 200,
    }, 7800);

    // Final state: All elements pulse together
    timeline.add('.building, .building-city, .home', {
      opacity: [0.6, 1, 0.6],
      duration: 600,
      ease: 'inOutSine',
      loop: true,
    }, 9800);

    if (autoPlay) play();

    return () => {
      timeline.pause();
    };
  }, [autoPlay, createTimeline]);

  // Generate building grid positions
  const buildingPositions = [];
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      buildingPositions.push({
        id: `building-${row}-${col}`,
        x: 60 + col * 80,
        y: 60 + row * 100,
      });
    }
  }

  const cityGridPositions = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 5; col++) {
      cityGridPositions.push({
        id: `city-${row}-${col}`,
        x: 20 + col * 50,
        y: 30 + row * 60,
      });
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        height,
        width: '100%',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at center, rgba(57, 57, 216, 0.05) 0%, transparent 70%)',
        borderRadius: 12,
        overflow: 'hidden',
      }}
    >
      <JapanMapBackground opacity={0.15} />
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 500"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute' }}
      >
        {/* Phase 1: Single home */}
        <Home x={375} y={200} scale={1} opacity={0} id="home-1" />

        {/* Phase 2: Building cluster */}
        {buildingPositions.map((pos) => (
          <Building
            key={pos.id}
            x={pos.x}
            y={pos.y}
            scale={1}
            opacity={0}
            id={pos.id}
          />
        ))}

        {/* Phase 3: City grid */}
        {cityGridPositions.map((pos) => (
          <g
            key={pos.id}
            className="building-city"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              opacity: 0,
              transformOrigin: 'center center',
            }}
          >
            <rect x="0" y="0" width="20" height="25" fill="#10b981" opacity="0.6" />
            <rect x="2" y="2" width="3" height="3" fill="#FFC217" />
            <rect x="8" y="2" width="3" height="3" fill="#FFC217" />
            <rect x="14" y="2" width="3" height="3" fill="#FFC217" />
          </g>
        ))}

        {/* Energy waves */}
        {[1, 2, 3].map((i) => (
          <EnergyWave
            key={`wave-${i}`}
            id={`wave-${i}`}
            cx="400"
            cy="250"
            r="0"
            opacity={0}
          />
        ))}

        {/* City-scale waves */}
        {[1, 2, 3].map((i) => (
          <circle
            key={`city-wave-${i}`}
            className="energy-wave-city"
            cx="400"
            cy="250"
            r="0"
            fill="none"
            stroke="#FFA35F"
            strokeWidth="3"
            opacity={0}
          />
        ))}

        {/* Decorative grid background */}
        <g opacity="0.1">
          {Array.from({ length: 8 }).map((_, i) => (
            <line
              key={`vline-${i}`}
              x1={i * 100}
              y1="0"
              x2={i * 100}
              y2="500"
              stroke="#3939D8"
              strokeWidth="1"
            />
          ))}
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`hline-${i}`}
              x1="0"
              y1={i * 83}
              x2="800"
              y2={i * 83}
              stroke="#3939D8"
              strokeWidth="1"
            />
          ))}
        </g>
      </svg>

      {/* Info overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          fontSize: 14,
          color: '#94a3b8',
          fontFamily: 'Inter, sans-serif',
          zIndex: 10,
        }}
      >
        <div style={{ marginBottom: 8 }}>
          {scale === 0 && '1 home → '}
          {scale === 1 && '1 building cluster → '}
          {scale === 2 && 'Full city grid'}
        </div>
      </div>
    </div>
  );
};

export default EnergyUsageScalingAnimation;
