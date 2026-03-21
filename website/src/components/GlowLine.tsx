import { type CSSProperties } from 'react';

interface GlowLineProps {
  width?: string | number;
  color?: string;
  height?: number;
}

export default function GlowLine({
  width = '100%',
  color = '#22d3ee',
  height = 2,
}: GlowLineProps) {
  const resolvedWidth = typeof width === 'number' ? `${width}px` : width;

  const containerStyle: CSSProperties = {
    width: resolvedWidth,
    height: `${height}px`,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: `${height}px`,
    background: `color-mix(in srgb, ${color} 8%, transparent)`,
  };

  const glowStyle: CSSProperties = {
    position: 'absolute',
    top: 0,
    left: '-80px',
    width: '80px',
    height: '100%',
    borderRadius: `${height}px`,
    background: `linear-gradient(90deg, transparent 0%, color-mix(in srgb, ${color} 25%, transparent) 20%, ${color} 50%, color-mix(in srgb, ${color} 25%, transparent) 80%, transparent 100%)`,
    boxShadow: `0 0 12px 2px color-mix(in srgb, ${color} 40%, transparent), 0 0 4px 1px color-mix(in srgb, ${color} 60%, transparent)`,
    animation: 'glowline-scan 3s ease-in-out infinite',
  };

  return (
    <>
      <style>{`
        @keyframes glowline-scan {
          0% { left: -80px; }
          100% { left: 100%; }
        }
      `}</style>
      <div style={containerStyle} role="separator" aria-hidden="true">
        <div style={glowStyle} />
      </div>
    </>
  );
}
