// TODO: Shared between website and presentation — combine into shared component
import { useState, useRef, useEffect, type ReactNode, type ReactElement, isValidElement, cloneElement } from 'react';

/**
 * Wraps a canvas chart component and adds an "Enlarge" button that opens
 * the chart in a centered modal at 2x size. Click backdrop or press Esc to close.
 */
interface Props {
  children: ReactNode;
  /** Scale factor for the enlarged modal (default 2) */
  scale?: number;
}

const ENLARGE_KEYFRAMES = `
@keyframes chart-enlarge-in {
  from { opacity: 0; transform: scale(0.85); }
  to { opacity: 1; transform: scale(1); }
}
`;

export default function ChartEnlarger({ children, scale = 2 }: Props) {
  const [open, setOpen] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Inject keyframes once
  useEffect(() => {
    const id = 'chart-enlarge-style';
    if (!document.getElementById(id)) {
      const s = document.createElement('style');
      s.id = id;
      s.textContent = ENLARGE_KEYFRAMES;
      document.head.appendChild(s);
    }
  }, []);

  // Esc to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open]);

  // Get the child's original height prop to compute enlarged dimensions
  const child = Array.isArray(children) ? children[0] : children;
  const childHeight = isValidElement(child) ? (child.props as any).height || 400 : 400;

  return (
    <div style={{ position: 'relative' }}>
      {children}

      {/* Enlarge button — top-right, subtle */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'absolute',
          top: 6,
          right: 6,
          zIndex: 15,
          background: 'rgba(5, 8, 16, 0.7)',
          border: '1px solid rgba(34, 211, 238, 0.15)',
          borderRadius: 4,
          color: 'rgba(34, 211, 238, 0.5)',
          cursor: 'pointer',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 10,
          padding: '2px 7px',
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          transition: 'color 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'rgba(34, 211, 238, 0.9)';
          e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'rgba(34, 211, 238, 0.5)';
          e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.15)';
        }}
        title="Enlarge chart"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 4V1h3M6 1h3v3M9 6v3H6M4 9H1V6" />
        </svg>
        <span>Enlarge</span>
      </button>

      {/* Modal backdrop + enlarged chart */}
      {open && (
        <div
          ref={backdropRef}
          onClick={(e) => { if (e.target === backdropRef.current) setOpen(false); }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(2, 4, 8, 0.92)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              animation: 'chart-enlarge-in 0.2s ease-out',
              cursor: 'default',
              position: 'relative',
              maxWidth: '95vw',
              maxHeight: '95vh',
              overflow: 'auto',
            }}
          >
            {/* Render child at scaled size */}
            {isValidElement(child)
              ? cloneElement(child as ReactElement<any>, {
                  height: Math.round(childHeight * scale),
                })
              : children
            }

            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(161, 161, 170, 0.3)',
                borderRadius: 4,
                color: 'rgba(161, 161, 170, 0.7)',
                cursor: 'pointer',
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 11,
                padding: '4px 10px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(161, 161, 170, 1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(161, 161, 170, 0.7)'; }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 1v2H1M7 1v2h2M7 9V7h2M3 9V7H1" />
              </svg>
              Esc to close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
