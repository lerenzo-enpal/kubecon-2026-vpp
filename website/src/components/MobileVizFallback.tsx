import { useRef, useState, useEffect, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackSrc: string;
  alt: string;
  breakpoint?: number;
}

export default function MobileVizFallback({
  children,
  fallbackSrc,
  alt,
  breakpoint = 768,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);

  useEffect(() => {
    if (showLive) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [showLive]);

  return (
    <>
      {/* Desktop: always show live viz. Hidden on mobile via state. */}
      <div className={isMobile ? 'hidden' : 'block'}>
        {children}
      </div>

      {/* Mobile: show fallback image with "View Interactive" button */}
      {isMobile && (
        <div className="relative rounded-lg overflow-hidden border border-zinc-700/50">
          <img
            src={fallbackSrc}
            alt={alt}
            className="w-full h-auto"
            loading="lazy"
          />
          <button
            onClick={() => setShowLive(true)}
            className="absolute inset-0 flex items-center justify-center bg-black/40 transition-colors active:bg-black/60"
          >
            <span className="bg-zinc-900/90 border border-zinc-600 text-zinc-200 text-sm font-mono px-4 py-2 rounded flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" />
              </svg>
              View Interactive
            </span>
          </button>
        </div>
      )}

      {showLive && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-zinc-950 flex flex-col"
        >
          <div className="flex justify-between items-center px-3 py-2 border-b border-zinc-800">
            <span className="text-zinc-500 text-xs font-mono">
              Rotate device for best experience
            </span>
            <button
              onClick={() => setShowLive(false)}
              className="text-zinc-400 text-sm font-mono border border-zinc-700 rounded px-3 py-1 active:bg-zinc-800"
            >
              Close
            </button>
          </div>
          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
