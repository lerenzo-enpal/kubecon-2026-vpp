import React, { useContext, useState, useEffect } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

const c = colors.primary;

// Stroke-draw helper (same as GridFlowDemo)
function dS(on, delay, dur = 0.6) {
  const base = { strokeDasharray: 1, strokeDashoffset: 1 };
  if (!on) return base;
  return { ...base, animation: `ciDraw ${dur}s ease ${delay}s forwards` };
}
function dSF(on, delay, dur = 0.6, fillDelay) {
  const fd = fillDelay != null ? fillDelay : delay + dur * 0.7;
  const base = { strokeDasharray: 1, strokeDashoffset: 1, fillOpacity: 0 };
  if (!on) return base;
  return { ...base, animation: `ciDraw ${dur}s ease ${delay}s forwards, ciFill 0.3s ease ${fd}s forwards` };
}

function SolarHome({ draw, t }) {
  return (
    <svg viewBox="0 0 160 140" style={{ width: 210, height: 185 }}>
      {/* House body */}
      <rect pathLength="1" x="25" y="65" width="110" height="65" stroke={c + '60'} strokeWidth="1.5" fill={c + '06'}
        style={dSF(draw, t, 0.5)} />
      {/* Roof */}
      <polygon pathLength="1" points="15,65 80,18 145,65" stroke={c + '70'} strokeWidth="1.5" fill="none"
        style={dS(draw, t + 0.1, 0.4)} />
      {/* Solar panels on roof */}
      {[[32, 52], [52, 44], [72, 36], [92, 36], [112, 44]].map(([px, py], i) => (
        <rect key={i} pathLength="1" x={px} y={py} width="16" height="10" rx="1"
          stroke={colors.solar + 'cc'} strokeWidth="1" fill={colors.solar + '40'}
          filter="url(#cig)"
          style={dSF(draw, t + 0.45 + i * 0.06, 0.2, t + 0.6 + i * 0.06)} />
      ))}
      {/* Window */}
      <rect pathLength="1" x="60" y="85" width="22" height="20" stroke={c + '30'} strokeWidth="0.8" fill={colors.accent + '30'}
        style={dSF(draw, t + 0.55, 0.2, t + 0.7)} />
      {/* Door */}
      <rect pathLength="1" x="92" y="95" width="16" height="35" stroke={c + '25'} strokeWidth="0.8" fill="none"
        style={dS(draw, t + 0.6, 0.2)} />
      {/* Sun rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((ang, i) => {
        const rad = ang * Math.PI / 180;
        const cx = 135, cy = 22, r1 = 7, r2 = 13;
        return (
          <line key={i} pathLength="1"
            x1={cx + Math.cos(rad) * r1} y1={cy + Math.sin(rad) * r1}
            x2={cx + Math.cos(rad) * r2} y2={cy + Math.sin(rad) * r2}
            stroke={colors.solar + '80'} strokeWidth="1" filter="url(#cig)"
            style={dS(draw, t + 0.7 + i * 0.03, 0.15)} />
        );
      })}
      <circle pathLength="1" cx="135" cy="22" r="5" stroke={colors.solar + '90'} strokeWidth="1" fill={colors.solar + '30'}
        filter="url(#cig)" style={dSF(draw, t + 0.65, 0.2)} />
    </svg>
  );
}

function EVGarage({ draw, t }) {
  return (
    <svg viewBox="0 0 160 140" style={{ width: 210, height: 185 }}>
      {/* Garage */}
      <rect pathLength="1" x="20" y="35" width="120" height="95" stroke={c + '60'} strokeWidth="1.5" fill={c + '06'}
        style={dSF(draw, t, 0.5)} />
      {/* Garage door */}
      <rect pathLength="1" x="32" y="50" width="96" height="70" stroke={c + '35'} strokeWidth="1" fill="none"
        style={dS(draw, t + 0.15, 0.3)} />
      {/* Door slats */}
      {[62, 74, 86, 98, 110].map((ly, i) => (
        <line key={i} pathLength="1" x1="32" y1={ly} x2="128" y2={ly} stroke={c + '18'} strokeWidth="0.6"
          style={dS(draw, t + 0.3 + i * 0.03, 0.15)} />
      ))}
      {/* EV silhouette — simple car shape */}
      <path pathLength="1"
        d="M 48,118 L 48,108 Q 48,100 56,98 L 72,94 Q 78,88 90,88 Q 102,88 108,94 L 114,98 Q 122,100 122,108 L 122,118"
        stroke={colors.success + '90'} strokeWidth="1.3" fill={colors.success + '15'}
        style={dSF(draw, t + 0.45, 0.4, t + 0.7)} />
      {/* Wheels */}
      <circle pathLength="1" cx="65" cy="118" r="5" stroke={colors.success + '60'} strokeWidth="1" fill={colors.success + '10'}
        style={dSF(draw, t + 0.6, 0.15)} />
      <circle pathLength="1" cx="108" cy="118" r="5" stroke={colors.success + '60'} strokeWidth="1" fill={colors.success + '10'}
        style={dSF(draw, t + 0.62, 0.15)} />
      {/* Charging cable */}
      <path pathLength="1" d="M 18,60 Q 12,60 12,68 L 12,95 Q 12,100 18,100 L 48,100"
        stroke={colors.success} strokeWidth="1.5" fill="none" filter="url(#cig)"
        style={dS(draw, t + 0.7, 0.3)} />
      {/* Charging bolt */}
      <polygon pathLength="1" points="8,72 14,72 12,80 17,80 9,92 11,83 7,83"
        stroke={colors.success + 'cc'} strokeWidth="0.8" fill={colors.success + '50'} filter="url(#cig)"
        style={dSF(draw, t + 0.8, 0.2)} />
    </svg>
  );
}

function ConnectedHomes({ draw, t }) {
  const homes = [
    { x: 18, y: 55 }, { x: 58, y: 30 }, { x: 98, y: 55 },
    { x: 38, y: 95 }, { x: 78, y: 95 }, { x: 118, y: 95 },
  ];
  const hubX = 78, hubY = 68;

  return (
    <svg viewBox="0 0 160 140" style={{ width: 210, height: 185 }}>
      {/* Connection lines to hub */}
      {homes.map((h, i) => (
        <line key={`ln${i}`} pathLength="1"
          x1={h.x + 10} y1={h.y + 8} x2={hubX} y2={hubY}
          stroke={c + '30'} strokeWidth="0.8"
          style={dS(draw, t + 0.6 + i * 0.05, 0.25)} />
      ))}
      {/* Hub circle */}
      <circle pathLength="1" cx={hubX} cy={hubY} r="8" stroke={c + '90'} strokeWidth="1.5" fill={c + '15'}
        filter="url(#cig)" style={dSF(draw, t + 0.5, 0.3)} />
      <text x={hubX} y={hubY + 3} textAnchor="middle" fill={c} fontSize="7" fontFamily="JetBrains Mono"
        style={draw ? { opacity: 0, animation: `ciFlicker 0.4s ease ${t + 0.85}s forwards` } : { opacity: 0 }}>VPP</text>
      {/* Mini houses */}
      {homes.map((h, i) => (
        <g key={`h${i}`}>
          <rect pathLength="1" x={h.x} y={h.y + 8} width="20" height="14" stroke={c + '50'} strokeWidth="1" fill={c + '06'}
            style={dSF(draw, t + 0.15 + i * 0.06, 0.25)} />
          <polygon pathLength="1" points={`${h.x - 2},${h.y + 8} ${h.x + 10},${h.y} ${h.x + 22},${h.y + 8}`}
            stroke={c + '50'} strokeWidth="1" fill="none"
            style={dS(draw, t + 0.2 + i * 0.06, 0.2)} />
        </g>
      ))}
      {/* Flow dashes on connections when drawn */}
      {homes.map((h, i) => (
        <line key={`fl${i}`} pathLength="1"
          x1={h.x + 10} y1={h.y + 8} x2={hubX} y2={hubY}
          stroke={c} strokeWidth="1.2" fill="none"
          strokeDasharray="3 6" filter="url(#cig)"
          style={draw ? { opacity: 0, animation: `ciFlowFade 0.3s ease ${t + 0.9 + i * 0.04}s forwards` } : { opacity: 0 }} />
      ))}
    </svg>
  );
}

function Typewriter({ text, active, delay = 0 }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!active) { setCount(0); setStarted(false); return; }
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [active, delay]);

  useEffect(() => {
    if (!started || count >= text.length) return;
    const speed = 30 + Math.random() * 25;
    const t = setTimeout(() => setCount(n => n + 1), speed);
    return () => clearTimeout(t);
  }, [started, count, text]);

  if (!started) return <div style={{ marginTop: 'auto', paddingBottom: 2, height: 36 }} />;

  return (
    <div style={{
      marginTop: 'auto', paddingBottom: 2,
      fontFamily: '"Courier New", "Courier", monospace', fontSize: 24, fontWeight: 700,
      color: c, textShadow: `0 0 20px ${c}40, 0 0 4px ${c}25`,
      textAlign: 'center', letterSpacing: '0.01em',
    }}>
      <span style={{ whiteSpace: 'pre' }}>{text.slice(0, count)}</span>
      <span style={{
        display: 'inline-block', width: 13, height: '0.9em', marginLeft: 1,
        background: c, verticalAlign: 'baseline', opacity: count < text.length ? 1 : undefined,
        animation: count >= text.length ? 'ciCursor 0.6s step-end infinite' : 'none',
      }} />
    </div>
  );
}

export default function ConsumerIcons({ bottomText }) {
  const slideContext = useContext(SlideContext);
  const active = slideContext?.isSlideActive;

  const panels = [
    { Icon: SolarHome, label: 'Rooftop Solar', sub: 'Your roof becomes a power plant', delay: 0.3 },
    { Icon: EVGarage, label: 'EV + Storage', sub: 'Your garage becomes a grid asset', delay: 0.8 },
    { Icon: ConnectedHomes, label: 'Distributed Grid', sub: 'Every home becomes a node', delay: 1.3 },
  ];

  return (
    <>
      <style>{`
        @keyframes ciDraw { to { stroke-dashoffset: 0; } }
        @keyframes ciFill { to { fill-opacity: 1; } }
        @keyframes ciFlicker {
          0% { opacity: 0; } 10% { opacity: 0.7; } 20% { opacity: 0.1; }
          35% { opacity: 0.9; } 50% { opacity: 0.3; } 70% { opacity: 1; } 100% { opacity: 1; }
        }
        @keyframes ciFlowFade {
          from { opacity: 0; } to { opacity: 0.5; }
        }
        @keyframes ciScanline {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes ciTextReveal {
          0% { clip-path: inset(0 100% 0 0); opacity: 0; }
          4% { opacity: 1; }
          100% { clip-path: inset(0 0% 0 0); opacity: 1; }
        }
        @keyframes ciCursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
      <div style={{ display: 'flex', gap: 56, justifyContent: 'center', alignItems: 'center', flex: 1, marginTop: 20 }}>
        <svg width="0" height="0">
          <defs>
            <filter id="cig"><feGaussianBlur stdDeviation="2.5" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
        </svg>
        {panels.map(({ Icon, label, sub, delay }, i) => (
          <div key={i} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            opacity: active ? 1 : 0,
            animation: active ? `ciFlicker 0.6s ease ${delay}s both` : 'none',
          }}>
            {/* Scan border */}
            <div style={{
              position: 'relative', padding: '16px 20px',
              border: `1px solid ${c}20`, borderRadius: 8,
              background: `${colors.surface}80`,
              overflow: 'hidden',
            }}>
              {/* Scanline sweep */}
              {active && (
                <div style={{
                  position: 'absolute', left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${c}50, transparent)`,
                  animation: `ciScanline 0.8s ease ${delay + 0.05}s both`,
                }} />
              )}
              <Icon draw={active} t={delay} />
            </div>
            <div style={{
              fontFamily: '"JetBrains Mono", monospace', fontSize: 18, fontWeight: 600,
              color: c, letterSpacing: '0.08em', textShadow: `0 0 10px ${c}50`,
              opacity: 0,
              animation: active ? `ciFlicker 0.5s ease ${delay + 0.9}s forwards` : 'none',
            }}>{label}</div>
            <div style={{
              fontFamily: '"Inter", sans-serif', fontSize: 16, color: colors.textMuted,
              opacity: 0, maxWidth: 220, textAlign: 'center',
              animation: active ? `ciFlicker 0.5s ease ${delay + 1.05}s forwards` : 'none',
            }}>{sub}</div>
          </div>
        ))}
      </div>
      {/* Bottom text — terminal typewriter after panels finish */}
      {bottomText && (
        <Typewriter text={bottomText} active={active} delay={900} />
      )}
    </>
  );
}
