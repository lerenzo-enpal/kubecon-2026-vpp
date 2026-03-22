import { useEffect, useRef, useCallback } from 'react';
import { getCanvasThemeColors, type CanvasThemeColors } from '../shared/canvasTheme';

interface Props {
  height?: number;
  render: (ctx: CanvasRenderingContext2D, progress: number, width: number, height: number, colors: CanvasThemeColors) => void;
  id: string;
  children?: React.ReactNode;
}

export default function ScrollBriefing({ height = 250, render: renderFn, id, children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(false);
  const colorsRef = useRef<CanvasThemeColors>(getCanvasThemeColors());
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotionRef.current = mql.matches;
    const handler = (e: MediaQueryListEvent) => { reducedMotionRef.current = e.matches; };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: light)');
    const update = () => { colorsRef.current = getCanvasThemeColors(); };
    mql.addEventListener('change', update);
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => { mql.removeEventListener('change', update); observer.disconnect(); };
  }, []);

  const getProgress = useCallback(() => {
    if (!containerRef.current) return 0;
    const rect = containerRef.current.getBoundingClientRect();
    const viewH = window.innerHeight;
    const scrollable = rect.height - viewH;
    if (scrollable <= 0) return 1;
    return Math.max(0, Math.min(1, -rect.top / scrollable));
  }, []);

  const sizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const dpr = window.devicePixelRatio || 1;
    const w = parent.clientWidth;
    const h = Math.min(parent.clientHeight, window.innerHeight - 100);
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    function frame() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (ctx && canvas) {
        const w = canvas.width / (window.devicePixelRatio || 1);
        const h = canvas.height / (window.devicePixelRatio || 1);
        const progress = reducedMotionRef.current ? 1 : getProgress();
        ctx.clearRect(0, 0, w, h);
        renderFn(ctx, progress, w, h, colorsRef.current);
      }
      if (isVisibleRef.current) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        rafRef.current = 0;
      }
    }

    function startLoop() {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) startLoop();
      },
      { threshold: 0 }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    startLoop();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', sizeCanvas);
      observer.disconnect();
    };
  }, [renderFn, sizeCanvas, getProgress]);

  return (
    <section id={id} ref={containerRef} style={{ height: `${height}vh`, position: 'relative' }}>
      <div className="flex gap-8" style={{ height: '100%' }}>
        <div className="flex-1 min-w-0" style={{ position: 'sticky', top: '80px', height: 'calc(100vh - 100px)', alignSelf: 'flex-start' }}>
          <canvas
            ref={canvasRef}
            role="img"
            aria-label={`Animated diagram for ${id}`}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        {children && (
          <div className="w-2/5 flex-shrink-0 flex flex-col justify-between py-20" style={{ minHeight: '100%' }}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}
