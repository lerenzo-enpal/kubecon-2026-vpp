import React from 'react';

export function MainTalkSourceFooter({ evidence, detailUrl }) {
  if (!evidence) return null;
  return (
    <footer data-testid="main-talk-source-footer" style={{ position: 'absolute', bottom: 22, left: 36, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.02em' }}>
      Source: {evidence.sourceLabel} · {evidence.sourceYear}
      {detailUrl && <span> · {detailUrl}</span>}
    </footer>
  );
}
