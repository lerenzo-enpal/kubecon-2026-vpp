/**
 * A small animated dot that pulses like a heartbeat.
 * Used inline with text or as status indicators.
 */
interface Props {
  color?: string;
  size?: number;
}

export default function PulsingDot({ color = 'var(--color-primary)', size = 8 }: Props) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: color,
        boxShadow: `0 0 ${size}px ${color}, 0 0 ${size * 2}px ${color}60`,
        animation: 'pulse-glow 2s ease-in-out infinite',
        verticalAlign: 'middle',
      }}
    />
  );
}
