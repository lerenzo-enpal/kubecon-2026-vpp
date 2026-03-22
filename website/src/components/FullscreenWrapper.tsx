// TODO: Shared between website and presentation — combine into shared component
import { useRef, useState, useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  label?: string;
}

export default function FullscreenWrapper({ children, label }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    function onFsChange() {
      setIsFullscreen(!!document.fullscreenElement);
    }
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  function enterFullscreen() {
    wrapperRef.current?.requestFullscreen?.();
  }

  function exitFullscreen() {
    document.exitFullscreen?.();
  }

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        background: isFullscreen ? '#020408' : 'transparent',
        width: isFullscreen ? '100vw' : undefined,
        height: isFullscreen ? '100vh' : undefined,
        overflow: 'hidden',
      }}
    >
      {children}

      {!isFullscreen && (
        <button
          onClick={enterFullscreen}
          className="fs-launch-btn"
          title={label || 'Launch'}
        >
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" />
          </svg>
          {label && <span className="fs-launch-btn-text">{label}</span>}
        </button>
      )}

      {isFullscreen && (
        <button
          onClick={exitFullscreen}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 40,
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(161, 161, 170, 0.3)',
            borderRadius: 4,
            color: 'rgba(161, 161, 170, 0.7)',
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            padding: '4px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'color 0.2s, border-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(161, 161, 170, 1)';
            e.currentTarget.style.borderColor = 'rgba(161, 161, 170, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(161, 161, 170, 0.7)';
            e.currentTarget.style.borderColor = 'rgba(161, 161, 170, 0.3)';
          }}
          title="Exit fullscreen (Esc)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 1v3H0M9 1v3h3M9 11V8h3M3 11V8H0" />
          </svg>
          <span>Esc to exit</span>
        </button>
      )}
    </div>
  );
}
