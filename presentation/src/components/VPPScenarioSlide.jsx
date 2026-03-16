import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';
import VPPScenarioMap from './VPPScenarioMap';
import VPPScenarioHomes from './VPPScenarioHomes';
import { SUMMER_STEPS, WINTER_STEPS } from './VPPScenarioHomes';

// ── Step indicator dots ──────────────────────────────────────

function StepIndicator({ total, current }) {
  return (
    <div style={{
      position: 'absolute', bottom: 6, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', gap: 8, zIndex: 10,
    }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === current ? 20 : 8,
            height: 8,
            borderRadius: 4,
            background: i === current ? colors.primary : i < current ? colors.primary + '60' : colors.textDim + '40',
            transition: 'all 0.3s ease',
          }}
        />
      ))}
    </div>
  );
}

// ── Main orchestrator ────────────────────────────────────────

export default function VPPScenarioSlide({ scenario = 'summer' }) {
  const steps = scenario === 'summer' ? SUMMER_STEPS : WINTER_STEPS;
  const STEP_COUNT = steps.length;

  const [step, setStep] = useState(0);
  const stepRef = useRef(0);
  stepRef.current = step;

  const containerRef = useRef(null);
  const [size, setSize] = useState({ w: 960, h: 600 });

  const slideContext = useContext(SlideContext);
  const slideActive = slideContext?.isSlideActive;

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setSize({ w: width, h: height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset on slide enter
  useEffect(() => {
    if (slideActive) {
      setStep(0);
    }
  }, [slideActive]);

  // Capture-phase keyboard navigation
  useEffect(() => {
    if (!slideActive) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const cur = stepRef.current;
        if (cur < STEP_COUNT - 1) {
          e.stopPropagation();
          setStep(cur + 1);
        }
        // else: don't stopPropagation, let Spectacle advance to next slide
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const cur = stepRef.current;
        if (cur > 0) {
          e.stopPropagation();
          setStep(cur - 1);
        }
        // else: don't stopPropagation, let Spectacle go to previous slide
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [slideActive, STEP_COUNT]);

  const mapH = Math.floor(size.h * 0.52);
  const homesH = size.h - mapH - 28; // 28 for step indicator area

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%', height: '100%',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        background: colors.bg,
      }}
    >
      {/* Top: Map */}
      <div style={{ flex: `0 0 ${mapH}px`, position: 'relative' }}>
        <VPPScenarioMap
          scenario={scenario}
          step={step}
          width={size.w}
          height={mapH}
        />
      </div>

      {/* Divider line */}
      <div style={{
        height: 1,
        background: `linear-gradient(90deg, transparent, ${colors.primary}30, transparent)`,
      }} />

      {/* Bottom: Houses + Narration */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <VPPScenarioHomes
          scenario={scenario}
          step={step}
          width={size.w}
          height={homesH}
        />
      </div>

      {/* Step indicator */}
      <StepIndicator total={STEP_COUNT} current={step} />
    </div>
  );
}
