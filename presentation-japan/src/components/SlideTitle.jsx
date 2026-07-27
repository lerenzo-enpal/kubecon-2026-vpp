import React from 'react';

export function SlideTitle({ eyebrow, title, subtitle, accent, className = '', testId, variant = 'dark' }) {
  const isWashi = variant === 'washi';
  const eyebrowColor = accent ?? (isWashi ? 'var(--color-washi-alert)' : 'var(--color-primary)');
  const titleColor = isWashi ? 'var(--color-washi-ink)' : 'var(--color-heading)';
  const subtitleColor = isWashi ? 'var(--color-washi-ink)' : 'var(--color-text)';
  return (
    <div data-testid={testId} className={`absolute left-8 top-8 max-w-lg ${className}`}>
      <div className="font-[var(--font-mono)] text-xs tracking-[0.16em]" style={{ color: eyebrowColor }}>{eyebrow}</div>
      <h1 className="my-2 font-[var(--font-heading)] text-4xl font-extrabold" style={{ color: titleColor }}>{title}</h1>
      {subtitle && <p className="m-0 text-lg" style={{ color: subtitleColor, opacity: isWashi ? 0.82 : 1 }}>{subtitle}</p>}
    </div>
  );
}
