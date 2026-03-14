import React, { useEffect, useState, useContext, useRef } from 'react';
import { SlideContext } from 'spectacle';

export default function AnimatedStat({ target, prefix = '', suffix = '', delay = 0, duration = 800, color, label }) {
  const [display, setDisplay] = useState('0');
  const slideContext = useContext(SlideContext);
  const startRef = useRef(null);
  const animRef = useRef(null);

  // Parse target: could be "4:37", "246", "$195B", "4.5M"
  const isTime = target.includes(':');
  const hasPrefix = target.match(/^[^0-9]*/)?.[0] || '';
  const hasSuffix = target.match(/[^0-9.]*$/)?.[0] || '';
  const numStr = target.replace(/[^0-9.]/g, '');
  const numVal = parseFloat(numStr);
  const isDecimal = numStr.includes('.');

  useEffect(() => {
    if (!slideContext?.isSlideActive) {
      setDisplay('0');
      startRef.current = null;
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    const startTime = performance.now() + delay;
    startRef.current = startTime;

    const animate = (now) => {
      const elapsed = now - startTime;
      if (elapsed < 0) {
        setDisplay('0');
        animRef.current = requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      if (isTime) {
        // "4:37" style
        const [minStr, secStr] = target.split(':');
        const totalSec = parseInt(minStr) * 60 + parseInt(secStr);
        const currentSec = Math.floor(eased * totalSec);
        const m = Math.floor(currentSec / 60);
        const s = currentSec % 60;
        setDisplay(`${m}:${s.toString().padStart(2, '0')}`);
      } else {
        const current = eased * numVal;
        if (isDecimal) {
          setDisplay(hasPrefix + current.toFixed(1) + hasSuffix);
        } else {
          setDisplay(hasPrefix + Math.floor(current).toLocaleString() + hasSuffix);
        }
      }

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setDisplay(target);
      }
    };

    animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [slideContext?.isSlideActive, target, delay, duration]);

  return (
    <div style={{ background: '#1a2236', border: `1px solid ${color}20`, borderRadius: 10, padding: '20px 16px', textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '34px', fontWeight: 800, fontFamily: '"JetBrains Mono", monospace', color, textShadow: `0 0 20px ${color}25` }}>{display}</div>
      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: 6, fontFamily: '"Inter", system-ui, sans-serif', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}
