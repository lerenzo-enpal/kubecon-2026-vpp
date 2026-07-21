import React, { useEffect, useRef } from 'react';
import { useAnimeTimeline } from '../hooks/useAnimeJs.js';

const ExplanationBox = ({
  title,
  description,
  stat,
  color = '#22d3ee',
  icon = null,
  animateIn = true,
  delay = 0,
  direction = 'up', // 'up', 'left', 'right', 'down'
}) => {
  const containerRef = useRef(null);
  const { createTimeline } = useAnimeTimeline();

  useEffect(() => {
    if (!animateIn || !containerRef.current) return;

    const timeline = createTimeline({ autoplay: true });

    const getTransform = () => {
      switch (direction) {
        case 'left':
          return { translateX: [-40, 0] };
        case 'right':
          return { translateX: [40, 0] };
        case 'down':
          return { translateY: [-40, 0] };
        case 'up':
        default:
          return { translateY: [40, 0] };
      }
    };

    timeline.add({
      targets: containerRef.current,
      opacity: [0, 1],
      ...getTransform(),
      duration: 500,
      delay,
      easing: 'easeOutQuad',
    }, 0);

    // Underline animation
    const underline = containerRef.current.querySelector('.explanation-underline');
    if (underline) {
      timeline.add({
        targets: underline,
        scaleX: [0, 1],
        opacity: [0, 1],
        duration: 400,
        delay: delay + 300,
        easing: 'easeOutQuad',
      }, 0);
    }

    return () => timeline.pause();
  }, [animateIn, delay, direction, createTimeline]);

  return (
    <div
      ref={containerRef}
      style={{
        background: `linear-gradient(135deg, ${color}08, ${color}04)`,
        border: `1px solid ${color}30`,
        borderRadius: 12,
        padding: '20px 24px',
        opacity: 0,
        backdrop: 'blur(8px)',
      }}
    >
      {/* Title with icon */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        {icon && (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `${color}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color,
              fontSize: 18,
              fontWeight: 700,
            }}
          >
            {icon}
          </div>
        )}
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color,
            fontFamily: 'Space Grotesk, sans-serif',
            position: 'relative',
            paddingBottom: 4,
          }}
        >
          {title}
          <div
            className="explanation-underline"
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              height: 2,
              width: '100%',
              background: color,
              borderRadius: 1,
              opacity: 0,
              transformOrigin: 'left',
            }}
          />
        </div>
      </div>

      {/* Stat */}
      {stat && (
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color,
            fontFamily: 'JetBrains Mono, monospace',
            marginBottom: 12,
            textShadow: `0 0 16px ${color}25`,
          }}
        >
          {stat}
        </div>
      )}

      {/* Description */}
      <div
        style={{
          fontSize: 15,
          color: '#cbd5e1',
          fontFamily: 'Inter, sans-serif',
          lineHeight: 1.6,
          letterSpacing: '0.3px',
        }}
      >
        {description}
      </div>
    </div>
  );
};

// Preset explainers for common stats
export const EXPLANATION_PRESETS = {
  SELF_SUFFICIENCY: {
    title: 'Self-Sufficiency',
    description: 'Japan produces only 15.3% of its own electricity. It imports 84.7% from LNG, coal, and other fuels. This makes Japan structurally vulnerable to global energy price shocks.',
    stat: '15.3%',
    color: '#ef4444',
    icon: '⚡',
  },
  FOSSIL_FUEL: {
    title: 'Fossil Fuel Dependency',
    description: '70% of Japan\'s electricity comes from fossil fuels (LNG, coal, oil). This is the highest ratio among G7 nations. Renewable penetration is constrained by geography and grid limitations.',
    stat: '70%',
    color: '#FFA35F',
    icon: '🔥',
  },
  GRID_ISOLATION: {
    title: 'Grid Isolation',
    description: 'Ten regional utilities operate in near-total isolation. East Japan runs at 50 Hz, West at 60 Hz. Only 1.2 GW of conversion capacity connects them. Europe has 800+ GW of cross-border capacity.',
    stat: '1.2 GW',
    color: '#22d3ee',
    icon: '🔗',
  },
  LNG_IMPORT: {
    title: 'LNG Import Route',
    description: '97% of Japan\'s LNG flows through the Strait of Hormuz. A single six-week closure in March 2026 cost every household ¥15,000 extra. This route is a single point of failure.',
    stat: '97%',
    color: '#FFC217',
    icon: '🚢',
  },
};

export default ExplanationBox;
