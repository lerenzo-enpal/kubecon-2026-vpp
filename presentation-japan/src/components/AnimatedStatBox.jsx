import React, { useEffect, useRef } from 'react';
import { useAnimeTimeline } from '../hooks/useAnimeJs.js';
import { countUpNumber, pulseEffect } from '../utils/animationPatterns.js';

const AnimatedStatBox = ({
  stat,
  label,
  color = '#22d3ee',
  from = 0,
  animateIn = true,
  showBox = true,
  pulse = false,
  delay = 0,
}) => {
  const containerRef = useRef(null);
  const valueRef = useRef(null);
  const { createTimeline, play } = useAnimeTimeline();

  useEffect(() => {
    if (!animateIn) return;

    const timeline = createTimeline({ autoplay: true });

    // Box entrance
    timeline.add(containerRef.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 400,
      delay,
      ease: 'outQuad',
    }, 0);

    // Count up the number
    if (valueRef.current && typeof stat === 'number') {
      countUpNumber(timeline, valueRef.current, stat, {
        from,
        duration: 800,
        format: (v) => {
          if (stat > 100) return Math.round(v).toLocaleString();
          if (stat < 10) return v.toFixed(1);
          return Math.round(v);
        },
      });
    }

    // Optional pulse effect
    if (pulse) {
      pulseEffect(timeline, containerRef.current, {
        scale: 1.05,
        duration: 400,
        delay: 600,
      });
    }

    return () => timeline.pause();
  }, [stat, from, animateIn, delay, pulse, createTimeline]);

  const isPercentage = typeof stat === 'number' && stat <= 100;
  const isLarge = typeof stat === 'number' && stat >= 1000;

  return (
    <div
      ref={containerRef}
      style={{
        background: showBox ? `${color}10` : 'transparent',
        border: showBox ? `1px solid ${color}40` : 'none',
        borderRadius: 10,
        padding: '20px 28px',
        textAlign: 'center',
        opacity: 0,
      }}
    >
      <div
        style={{
          fontSize: isLarge ? '56px' : '48px',
          fontWeight: 700,
          color,
          fontFamily: 'JetBrains Mono, monospace',
          lineHeight: 1,
          marginBottom: 8,
          textShadow: `0 0 20px ${color}30`,
        }}
      >
        <span ref={valueRef}>{from}</span>
        {isPercentage && '%'}
      </div>
      <div
        style={{
          fontSize: '14px',
          color: '#94a3b8',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.5,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// Preset color variations
export const STAT_COLORS = {
  cyan: '#22d3ee',
  green: '#10b981',
  amber: '#FFC217',
  orange: '#FFA35F',
  red: '#ef4444',
  blue: '#3939D8',
};

export default AnimatedStatBox;
