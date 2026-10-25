import React, { useContext, useEffect, useRef } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../../theme.js';
import { drawTexasScene, drawEUScene, drawSAScene } from './SchematicMap.jsx';

/**
 * SevenSegMap — the canvas host for the schematic maps.
 *
 * Owns the RAF loop and the slide-activity gate. The drawing itself lives in
 * SchematicMap.jsx so the same scenes can be reused by the parity/styleguide
 * pages without dragging Spectacle context along.
 *
 * Props:
 *   scene  — 'texas' | 'eu' | 'sa'
 *   step   — Spectacle step, drives the cascade animations
 *   variant— for 'sa': 'vpp' | 'blackout'
 */
export default function SevenSegMap({ scene = 'texas', step = 0, variant = 'vpp', style = {} }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);
  const stepRef = useRef(step);
  const slideContext = useContext(SlideContext);

  // Keep the latest step available to the draw loop without restarting it.
  stepRef.current = step;

  const isActive = slideContext?.isSlideActive !== false;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let box = { x: 0, y: 0, w: 0, h: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      box = { x: 0, y: 0, w: rect.width, h: rect.height };
      return true;
    };

    const draw = () => {
      if (!resize()) return;
      ctx.clearRect(0, 0, box.w, box.h);

      const args = { t: tRef.current, step: stepRef.current, variant };
      if (scene === 'texas') drawTexasScene(ctx, box, args);
      else if (scene === 'eu') drawEUScene(ctx, box, args);
      else drawSAScene(ctx, box, args);
    };

    if (!isActive) {
      // Draw one static frame so the slide isn't blank when it becomes active.
      draw();
      return undefined;
    }

    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      tRef.current += dt;
      draw();
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [scene, variant, isActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        width: '100%',
        height: '100%',
        background: colors.panel,
        ...style,
      }}
    />
  );
}
