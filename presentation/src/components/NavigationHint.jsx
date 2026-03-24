import React, { useState, useEffect, useCallback } from 'react';
import { colors } from '../theme';

export default function NavigationHint() {
  const [visible, setVisible] = useState(true);

  const dismiss = useCallback(() => setVisible(false), []);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, dismiss]);

  if (!visible) return null;

  return (
    <div
      onClick={dismiss}
      className="fixed inset-0 z-[9999] flex items-center justify-center cursor-pointer"
      style={{ background: 'rgba(2, 4, 8, 0.85)', backdropFilter: 'blur(8px)' }}
    >
      <div className="text-center max-w-lg px-8">
        <div
          className="font-mono text-sm font-semibold tracking-widest uppercase mb-6"
          style={{ color: colors.textDim }}
        >
          KubeCon + CloudNativeCon Europe 2026
        </div>
        <div
          className="text-4xl font-extrabold font-sans mb-4"
          style={{ color: colors.primary }}
        >
          What is a Virtual Power Plant?
        </div>
        <div className="text-lg font-sans mb-10" style={{ color: colors.textMuted }}>
          Cloud-Native Infrastructure for the Energy Grid
        </div>

        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="flex items-center gap-2">
            <kbd
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg font-mono text-lg"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.primary}40`,
                color: colors.primary,
              }}
            >
              &larr;
            </kbd>
            <kbd
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg font-mono text-lg"
              style={{
                background: colors.surface,
                border: `1px solid ${colors.primary}40`,
                color: colors.primary,
              }}
            >
              &rarr;
            </kbd>
          </div>
          <span className="text-base font-sans" style={{ color: colors.text }}>
            Use arrow keys to navigate
          </span>
        </div>

        <div className="text-sm font-mono" style={{ color: colors.textDim }}>
          Click anywhere or press any key to begin
        </div>
      </div>
    </div>
  );
}
