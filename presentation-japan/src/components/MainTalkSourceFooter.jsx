import React from 'react';

export function MainTalkSourceFooter({ evidence, detailUrl, caseNote }) {
  if (!evidence) return null;
  const researchUrl = detailUrl && `${detailUrl.startsWith('http') ? detailUrl : `https://${detailUrl}`}${evidence.researchAnchor || ''}`;
  return (
    <footer data-testid="main-talk-source-footer" style={{ position: 'absolute', bottom: 22, left: 36, color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.02em' }}>
      {caseNote && <aside data-testid="main-talk-case-note" style={{ position: 'absolute', left: 0, bottom: 30, width: 'max-content', maxWidth: 520, padding: '10px 12px', border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}><strong>{caseNote.title}</strong> · {caseNote.scope} · {caseNote.qualifier} · Source: {evidence.sourceLabel}</aside>}
      <span>Source: {evidence.sourceLabel} · {evidence.reference || evidence.sourceYear}</span>
      <span> · {evidence.notes}</span>
      {researchUrl && <a href={researchUrl} style={{ color: 'inherit' }}> · Research notes</a>}
    </footer>
  );
}
