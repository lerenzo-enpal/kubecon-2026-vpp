import React, { useContext, useEffect, useRef, useState } from 'react';
import { SlideContext } from 'spectacle';
import SevenSegText from './SevenSegText.jsx';
import SevenSegPanel from './SevenSegPanel.jsx';
import { colors } from '../../theme.js';

/**
 * SevenSegStat — a 7-segment numeric readout with a count-up.
 *
 * Replaces the AnimatedStat/StatBox role in the original deck. The count-up
 * uses an eased curve so the digits settle like an instrument rather than
 * snapping, and it is gated on the slide being active so off-screen slides
 * don't burn frames.
 *
 * Props:
 *   target    — display string, e.g. '$9,000' or '4.5M'
 *   countTo   — optional numeric value to count up to; if omitted, no count-up
 *   label     — caption below
 *   height    — digit height
 *   alert     — blink treatment
 *   duration  — count-up ms
 *   delay     — count-up start delay ms
 */
export default function SevenSegStat({
  target,
  countTo,
  label,
  height = 44,
  alert = false,
  accent,
  duration = 1200,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  useGrouping = true,
  blink = false,
  style = {},
}) {
  const slideContext = useContext(SlideContext);
  const isActive = slideContext?.isSlideActive !== false;
  const [display, setDisplay] = useState(countTo == null ? target : '');
  const [settled, setSettled] = useState(countTo == null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (countTo == null) {
      setDisplay(target);
      setSettled(true);
      return undefined;
    }
    if (!isActive) return undefined;

    let start = null;
    const tick = (now) => {
      if (start === null) start = now;
      const elapsed = now - start - delay;
      if (elapsed < 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed / duration, 1);
      // easeOutCubic — fast then settling
      const eased = 1 - Math.pow(1 - t, 3);
      const value = countTo * eased;
      const formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping,
      });
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(`${prefix}${countTo.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
          useGrouping,
        })}${suffix}`);
        setSettled(true);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [countTo, target, duration, delay, isActive, prefix, suffix, decimals, useGrouping]);

  // `alert` = the readout is a danger figure (bright, hot accent).
  // `blink` = optional hard blink. Reserved for a secondary alarm, never the
  // headline number — a blinking primary readout disappears half the time.
  const emitter = accent || (alert ? colors.danger : colors.primary);
  const shouldBlink = blink && settled;

  return (
    <SevenSegPanel accent={accent} glow={alert ? 0.75 : 0.4} padding="12px 14px" style={style}>
      <div className={shouldBlink ? 'seg-blink' : undefined}>
        <SevenSegText
          value={display || ' '}
          height={height}
          align="center"
          color={emitter}
          style={{ justifyContent: 'center' }}
        />
      </div>
      {label && (
        <div
          style={{
            fontFamily: '"Inter", system-ui, sans-serif',
            fontSize: 13,
            color: colors.textMuted,
            marginTop: 8,
            textAlign: 'center',
            lineHeight: 1.3,
          }}
        >
          {label}
        </div>
      )}
    </SevenSegPanel>
  );
}
