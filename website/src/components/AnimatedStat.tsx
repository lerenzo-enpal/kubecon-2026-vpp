import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  color?: string;
  label?: string;
  sublabel?: string;
  duration?: number;
}

export default function AnimatedStat({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  color = 'var(--color-primary)',
  label,
  sublabel,
  duration = 1200,
}: Props) {
  const [display, setDisplay] = useState(value);
  const ref = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const runAnimation = () => {
      if (hasAnimated.current) return;
      hasAnimated.current = true;
      const start = performance.now();
      // Start from 0 and animate to target
      setDisplay(0);
      requestAnimationFrame(function tick(now: number) {
        const t = Math.min(1, (now - start) / duration);
        const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        setDisplay(value * eased);
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setDisplay(value); // ensure exact final value
        }
      });
    };

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) runAnimation(); },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--color-bg-alt)',
        border: '1px solid var(--color-surface-light)',
        borderRadius: 12,
        padding: '20px 24px',
        textAlign: 'center',
        opacity: 1,
        transform: 'none',
      }}
    >
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontWeight: 800,
          fontSize: 32,
          color,
          textShadow: `0 0 20px ${color}30`,
          lineHeight: 1.1,
        }}
      >
        {prefix}{display.toFixed(decimals)}{suffix}
      </div>
      {label && (
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: color + 'cc',
            marginTop: 6,
            fontFamily: '"JetBrains Mono", monospace',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}
        >
          {label}
        </div>
      )}
      {sublabel && (
        <div style={{ fontSize: 12, color: 'var(--color-text-dim)', marginTop: 4 }}>
          {sublabel}
        </div>
      )}
    </div>
  );
}
