import React from 'react';

const THEME_LABELS = { dark: '◑ Dark', light: '○ Light', hybrid: '◐ Hybrid' };
const LOCALE_LABELS = { en: 'EN', ja: 'JA' };

export function PresentationChrome({ theme, cycleTheme, locale, setLocale }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 12,
        right: 16,
        zIndex: 9999,
        display: 'flex',
        gap: 8,
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
        userSelect: 'none',
      }}
    >
      <button
        onClick={cycleTheme}
        title={`Theme: ${theme} — click to cycle`}
        style={{
          background: 'rgba(6,10,26,0.75)',
          border: '1px solid rgba(57,57,216,0.4)',
          color: '#94a3b8',
          padding: '3px 10px',
          borderRadius: 4,
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          letterSpacing: '0.05em',
        }}
      >
        {THEME_LABELS[theme] ?? theme}
      </button>
      <button
        onClick={() => setLocale(locale === 'en' ? 'ja' : 'en')}
        title="Language toggle — JA coming soon"
        style={{
          background: 'rgba(6,10,26,0.75)',
          border: '1px solid rgba(57,57,216,0.25)',
          color: locale === 'en' ? '#64748b' : '#FFC217',
          padding: '3px 10px',
          borderRadius: 4,
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          letterSpacing: '0.08em',
          opacity: locale === 'ja' ? 1 : 0.7,
        }}
      >
        {LOCALE_LABELS[locale] ?? locale}
      </button>
    </div>
  );
}
