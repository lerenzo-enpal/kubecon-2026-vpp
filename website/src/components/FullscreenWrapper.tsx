// TODO: Shared between website and presentation — combine into shared component
import { useRef, useState, useEffect, cloneElement, isValidElement, type ReactNode, type ReactElement } from 'react';

const GLOW_KEYFRAMES = `
@keyframes fs-btn-glow {
  0%, 100% { box-shadow: 0 0 4px rgba(34, 211, 238, 0.0), 0 0 8px rgba(34, 211, 238, 0.0); border-color: rgba(34, 211, 238, 0.15); }
  50% { box-shadow: 0 0 6px rgba(34, 211, 238, 0.25), 0 0 14px rgba(34, 211, 238, 0.1); border-color: rgba(34, 211, 238, 0.45); }
}
`;

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

  // Inject glow keyframes once
  useEffect(() => {
    const id = 'fs-btn-glow-style';
    if (!document.getElementById(id)) {
      const style = document.createElement('style');
      style.id = id;
      style.textContent = GLOW_KEYFRAMES;
      document.head.appendChild(style);
    }
  }, []);

  function enterFullscreen() {
    wrapperRef.current?.requestFullscreen?.();
  }

  function exitFullscreen() {
    document.exitFullscreen?.();
  }

  // In fullscreen, override child's height to fill the screen
  const renderedChildren = isFullscreen
    ? (() => {
        const child = Array.isArray(children) ? children[0] : children;
        if (isValidElement(child)) {
          return cloneElement(child as ReactElement<any>, {
            width: window.innerWidth,
            height: window.innerHeight,
          });
        }
        return children;
      })()
    : children;

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
      {renderedChildren}

      {!isFullscreen && (
        <button
          onClick={enterFullscreen}
          style={{
            position: 'absolute',
            top: 6,
            right: 6,
            zIndex: 20,
            background: 'rgba(5, 8, 16, 0.7)',
            border: '1px solid rgba(34, 211, 238, 0.15)',
            borderRadius: 4,
            color: 'rgba(34, 211, 238, 0.6)',
            cursor: 'pointer',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            animation: 'fs-btn-glow 3s ease-in-out infinite',
            transition: 'color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(34, 211, 238, 1)';
            e.currentTarget.style.animation = 'none';
            e.currentTarget.style.boxShadow = '0 0 8px rgba(34, 211, 238, 0.4), 0 0 16px rgba(34, 211, 238, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(34, 211, 238, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(34, 211, 238, 0.6)';
            e.currentTarget.style.animation = 'fs-btn-glow 3s ease-in-out infinite';
            e.currentTarget.style.boxShadow = '';
            e.currentTarget.style.borderColor = '';
          }}
          title="Enter fullscreen"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" />
          </svg>
          {label && <span>{label}</span>}
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
            fontSize: 11,
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
