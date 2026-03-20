export default function GamePlaceholder() {
  return (
    <div
      style={{
        background: '#111827',
        border: '1px solid #243049',
        borderRadius: 12,
        padding: '48px 32px',
        textAlign: 'center',
        minHeight: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
      }}
    >
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 14,
          color: '#f59e0b',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
        }}
      >
        Coming Soon
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 800,
          color: '#f1f5f9',
          lineHeight: 1.1,
        }}
      >
        Try to Crash the Grid
      </div>
      <div
        style={{
          fontSize: 17,
          color: '#94a3b8',
          maxWidth: 440,
          lineHeight: 1.6,
        }}
      >
        An interactive game where you attack power grid infrastructure and
        watch cascading failures unfold in real time. Can you bring down
        the grid?
      </div>
      <div
        style={{
          marginTop: 16,
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 13,
          color: '#64748b',
          padding: '8px 16px',
          border: '1px solid #243049',
          borderRadius: 8,
        }}
      >
        deck.gl + simulation engine — in development
      </div>
    </div>
  );
}
