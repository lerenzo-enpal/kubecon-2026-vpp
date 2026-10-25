import React from 'react';
import { THEME_LABELS } from '../theme.js';

/**
 * SevenSegChrome — the display's control strip.
 *
 * A fixed corner control that cycles the panel theme. Kept deliberately small
 * and low-contrast so it never competes with slide content, and it is the only
 * interactive element outside the deck itself.
 */
export function SevenSegChrome({ theme, cycleTheme, onLampTest, lampTest }) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 10,
        right: 14,
        zIndex: 9999,
        display: 'flex',
        gap: 6,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 10,
        letterSpacing: '0.1em',
        userSelect: 'none',
      }}
    >
      <button
        onClick={cycleTheme}
        title={`Panel: ${theme} — click to cycle`}
        style={{
          background: 'rgba(0,0,0,0.55)',
          border: '1px solid rgba(255,255,255,0.16)',
          color: '#9a9a9a',
          padding: '3px 9px',
          cursor: 'pointer',
          backdropFilter: 'blur(6px)',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          letterSpacing: 'inherit',
        }}
      >
        {THEME_LABELS[theme] ?? theme}
      </button>
      {onLampTest && (
        <button
          onClick={onLampTest}
          title="Lamp test — light every segment"
          style={{
            background: lampTest ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.55)',
            border: '1px solid rgba(255,255,255,0.16)',
            color: '#9a9a9a',
            padding: '3px 9px',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            letterSpacing: 'inherit',
          }}
        >
          LAMP TEST
        </button>
      )}
    </div>
  );
}

export default SevenSegChrome;
