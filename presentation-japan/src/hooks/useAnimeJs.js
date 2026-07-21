import { useEffect, useRef } from 'react';
import { animate, createTimeline, svg } from 'animejs';


// Reusable anime.js hook for timeline-based animations
export const useAnimeTimeline = (deps = []) => {
  const timelineRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timelineRef.current) {
        timelineRef.current.pause();
      }
    };
  }, []);

  const buildTimeline = (options = {}) => {
    if (timelineRef.current) {
      timelineRef.current.pause();
    }
    timelineRef.current = createTimeline({
      autoplay: false,
      ...options,
    });
    return timelineRef.current;
  };

  const play = () => timelineRef.current?.play();
  const pause = () => timelineRef.current?.pause();
  const reset = () => timelineRef.current?.restart();
  const seek = (time) => timelineRef.current?.seek(time);

  return { createTimeline: buildTimeline, play, pause, reset, seek, timelineRef };
};

// Common stagger patterns
export const STAGGER_PATTERNS = {
  LINEAR: (i) => i * 50,
  EXPONENTIAL: (i) => Math.pow(i, 1.5) * 30,
  WAVE: (i) => Math.sin(i * 0.5) * 100 + i * 20,
  FIBONACCI: (i) => {
    const fib = [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
    return (fib[i] || 0) * 10;
  },
  RANDOM: (i) => Math.random() * 300,
};

// Easing presets for common patterns
export const EASING_PRESETS = {
  SMOOTH_EASE_OUT: 'outQuart',
  BOUNCE_IN: 'inBounce',
  ELASTIC_WAVE: 'inOutElastic',
  SPRING: 'outElastic',
  LINEAR: 'linear',
};

// Helper to animate SVG paths
export const animateSVGPath = (selector, from, to, duration = 1000, delay = 0) => {
  return animate(selector, {
    strokeDashoffset: [from, to],
    duration,
    delay,
    ease: 'inOutQuad',
  });
};

// Helper for cascading reveals
export const cascadeReveal = (selector, duration = 600, staggerPattern = STAGGER_PATTERNS.LINEAR) => {
  return animate(selector, {
    opacity: [0, 1],
    duration,
    delay: (_, i) => staggerPattern(i),
  });
};

// Helper for parallax/depth effect
export const parallaxTransform = (targets, offset = { x: 0, y: 0 }, intensity = 1) => {
  return animate(targets, {
    translateX: offset.x * intensity,
    translateY: offset.y * intensity,
    duration: 500,
    ease: 'outQuad',
  });
};

// Morph one shape to another (SVG)
export const morphSVG = (selector, targetPath, duration = 1000, easing = 'inOutQuad') => {
  return animate(selector, {
    d: svg.morphTo(targetPath),
    duration,
    ease: easing,
  });
};
