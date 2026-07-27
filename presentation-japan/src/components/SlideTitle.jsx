import React from 'react';

export function SlideTitle({ eyebrow, title, subtitle, accent = 'var(--color-primary)', className = '', testId }) {
  return (
    <div data-testid={testId} className={`absolute left-8 top-8 max-w-lg ${className}`}>
      <div className="font-[var(--font-mono)] text-xs tracking-[0.16em]" style={{ color: accent }}>{eyebrow}</div>
      <h1 className="my-2 font-[var(--font-heading)] text-4xl font-extrabold text-[var(--color-heading)]">{title}</h1>
      {subtitle && <p className="m-0 text-lg text-[var(--color-text)]">{subtitle}</p>}
    </div>
  );
}
