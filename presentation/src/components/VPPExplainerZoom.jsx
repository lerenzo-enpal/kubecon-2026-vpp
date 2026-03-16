import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { SlideContext, useSteps } from 'spectacle';

// ── Virtual space is 3200×2000. Steps define focus point + scale ──
// focusX/Y = center of interest in virtual-space coords
const STEPS = [
  { scale: 1.0,  focusX: 1350, focusY: 1360, title: 'Inside a Smart Home', desc: 'A single household with solar, battery, heat pump, EV — all wired through one smart inverter.' },
  { scale: 1.25, focusX: 1340, focusY: 1340, title: 'The Edge Device', desc: 'The hybrid inverter is the brain — measuring, deciding, and responding in milliseconds.' },
  { scale: 0.58, focusX: 1600, focusY: 920,  title: 'Connected to the Cloud', desc: 'MQTT telemetry streams up. Dispatch commands flow down. Every home is a real-time endpoint.' },
  { scale: 0.38, focusX: 1500, focusY: 750,  title: 'A Fleet of Thousands', desc: 'Thousands of homes form a distributed fleet — orchestrated by Kubernetes and Dapr on the edge.' },
  { scale: 0.28, focusX: 1500, focusY: 650,  title: 'Grid Services', desc: 'The fleet bids into frequency markets and responds to grid operator dispatch — like a power plant.' },
  { scale: 0.24, focusX: 1500, focusY: 700,  title: 'The Complete Picture', desc: 'A Virtual Power Plant: thousands of homes, one intelligent platform, real grid services.' },
];

// ── Home asset data ──────────────────────────────────────────
const HOME_ASSETS = [
  { id: 'pv', icon: '☀', label: 'SOLAR PV', sub: '10 kWp', color: '#f59e0b', x: 80, y: 60 },
  { id: 'bat', icon: '🔋', label: 'BATTERY', sub: '13.5 kWh', color: '#10b981', x: 380, y: 60 },
  { id: 'inv', icon: '⚡', label: 'INVERTER', sub: 'Hybrid 5kW', color: '#22d3ee', x: 230, y: 180 },
  { id: 'hp', icon: '🌡', label: 'HEAT PUMP', sub: '8 kW thermal', color: '#a78bfa', x: 80, y: 310 },
  { id: 'load', icon: '🏠', label: 'HOME LOAD', sub: '~4 kW avg', color: '#94a3b8', x: 230, y: 310 },
  { id: 'ev', icon: '🚗', label: 'EV CHARGER', sub: '7.4 kW', color: '#22d3ee', x: 380, y: 310 },
];

// ── Wiring inside home (from → to as asset ids) ─────────────
const HOME_WIRES = [
  { from: 'pv', to: 'inv', color: '#f59e0b' },
  { from: 'bat', to: 'inv', color: '#10b981' },
  { from: 'inv', to: 'hp', color: '#a78bfa' },
  { from: 'inv', to: 'load', color: '#94a3b8' },
  { from: 'inv', to: 'ev', color: '#22d3ee' },
];

// ── Fleet home positions (procedural) ────────────────────────
function generateFleetHomes(count, seed = 77) {
  const homes = [];
  let s = seed;
  const next = () => { s = (s * 16807 + 0) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < count; i++) {
    const col = i % 20;
    const row = Math.floor(i / 20);
    homes.push({
      x: 400 + col * 120 + (next() - 0.5) * 60,
      y: 880 + row * 55 + (next() - 0.5) * 30,
      delay: next() * 1.5,
      size: 4 + next() * 4,
    });
  }
  return homes;
}
const FLEET_HOMES = generateFleetHomes(200);

// ── Neighbor home positions ──────────────────────────────────
const NEIGHBOR_HOMES = [
  { x: 800, y: 1380, delay: 0.1 },
  { x: 1050, y: 1350, delay: 0.2 },
  { x: 1280, y: 1400, delay: 0.15 },
  { x: 1500, y: 1320, delay: 0.25 },
  { x: 1700, y: 1380, delay: 0.3 },
  { x: 1900, y: 1340, delay: 0.18 },
  { x: 2100, y: 1400, delay: 0.22 },
];

// ── Helper: get center of an asset ───────────────────────────
function assetCenter(id) {
  const a = HOME_ASSETS.find(h => h.id === id);
  return a ? { x: a.x + 55, y: a.y + 30 } : { x: 0, y: 0 };
}

// ── Main Component ───────────────────────────────────────────
export default function VPPExplainerZoom() {
  const STEP_COUNT = STEPS.length;

  const [stepIndex, setStepIndex] = useState(-1);
  const [boot, setBoot] = useState(0);
  const bootRef = useRef(null);
  const stepIndexRef = useRef(-1);
  stepIndexRef.current = stepIndex;
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ w: 1024, h: 700 });

  const { placeholder } = useSteps(1);

  const slideContext = useContext(SlideContext);
  const slideActive = slideContext?.isSlideActive;

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0 && height > 0) setContainerSize({ w: width, h: height });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Reset & boot on slide enter
  useEffect(() => {
    if (slideActive) {
      setStepIndex(-1);
      setBoot(0);
      const delay = setTimeout(() => {
        const start = performance.now();
        const tick = () => {
          const s = (performance.now() - start) / 1000;
          setBoot(s);
          if (s < 3.0) bootRef.current = requestAnimationFrame(tick);
        };
        bootRef.current = requestAnimationFrame(tick);
      }, 300);
      // Auto-advance to step 0 after boot
      const autoStep = setTimeout(() => setStepIndex(0), 2200);
      return () => {
        clearTimeout(delay);
        clearTimeout(autoStep);
        cancelAnimationFrame(bootRef.current);
      };
    }
  }, [slideActive]);

  // Capture-phase keydown for internal navigation
  useEffect(() => {
    if (!slideActive) return;
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        const cur = stepIndexRef.current;
        if (cur < STEP_COUNT - 1) {
          e.stopPropagation();
          setStepIndex(cur + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        const cur = stepIndexRef.current;
        if (cur > 0) {
          e.stopPropagation();
          setStepIndex(cur - 1);
        } else if (cur === 0) {
          e.stopPropagation();
          setStepIndex(-1);
        }
      }
    };
    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [slideActive]);

  const booted = boot > 2.0;
  const step = stepIndex >= 0 ? STEPS[stepIndex] : null;

  // Compute CSS transform: translate then scale, centering focusX/Y in viewport
  // transform: translate(tx, ty) scale(s) → point (x,y) maps to (s*x + tx, s*y + ty)
  // To center (focusX, focusY): tx = vw/2 - s*focusX, ty = vh/2 - s*focusY
  const { w: vw, h: vh } = containerSize;
  const s = step ? step.scale : 0.22;
  const fx = step ? step.focusX : 1500;
  const fy = step ? step.focusY : 700;
  const tx = vw / 2 - s * fx;
  const ty = vh / 2 - s * fy;

  // Visibility flags
  const showHome = stepIndex >= 0;
  const showInverterHighlight = stepIndex >= 1;
  const showCloud = stepIndex >= 2;
  const showNeighbors = stepIndex >= 2;
  const showFleet = stepIndex >= 3;
  const showGrid = stepIndex >= 4;
  const showFullTitle = stepIndex >= 5;

  return (
    <div ref={containerRef} style={{
      position: 'relative', width: '100%', height: '100%',
      background: '#0a0e17', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none',
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 49, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
      }} />

      {/* Boot scan line */}
      {boot < 3.0 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 2, zIndex: 60,
          top: `${(boot / 3.0) * 100}%`,
          background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
          opacity: 0.7,
        }} />
      )}

      {/* Virtual space with zoom/pan — translate then scale from origin 0,0 */}
      <div style={{
        position: 'absolute', top: 0, left: 0, width: 3200, height: 2000,
        transition: 'transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        transform: `translate(${tx}px, ${ty}px) scale(${s})`,
        transformOrigin: '0 0',
        opacity: booted ? 1 : 0,
      }}>
        {/* ═══ LAYER: Grid Operator (top-left) ═══ */}
        <div style={{
          position: 'absolute', left: 300, top: 80, width: 420, height: 140,
          opacity: showGrid ? 1 : 0, transition: 'opacity 0.8s ease 0.2s',
        }}>
          <HUDBox color="#ef4444" glow>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#ef4444' }}>⚡ Grid Operator</div>
            <div style={{ fontSize: 18, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace', marginTop: 6 }}>
              Dispatch commands<br />Frequency regulation signals
            </div>
          </HUDBox>
        </div>

        {/* ═══ LAYER: Energy Markets (top-right) ═══ */}
        <div style={{
          position: 'absolute', left: 2200, top: 80, width: 420, height: 140,
          opacity: showGrid ? 1 : 0, transition: 'opacity 0.8s ease 0.4s',
        }}>
          <HUDBox color="#f59e0b" glow>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#f59e0b' }}>📊 Energy Markets</div>
            <div style={{ fontSize: 18, color: '#94a3b8', fontFamily: '"JetBrains Mono", monospace', marginTop: 6 }}>
              FCR / aFRR bids<br />Real-time price signals
            </div>
          </HUDBox>
        </div>

        {/* ═══ Connection lines: Grid/Market → Cloud ═══ */}
        <svg style={{ position: 'absolute', inset: 0, width: 3200, height: 2000, pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="grad-down-cyan" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
            </linearGradient>
            <linearGradient id="grad-down-green" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Grid → Cloud */}
          <line x1={510} y1={220} x2={1450} y2={420} stroke="#ef4444" strokeWidth={2}
            strokeDasharray="8 6" opacity={showGrid ? 0.6 : 0} style={{ transition: 'opacity 0.8s' }}>
            <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2s" repeatCount="indefinite" />
          </line>

          {/* Market → Cloud */}
          <line x1={2400} y1={220} x2={1750} y2={420} stroke="#f59e0b" strokeWidth={2}
            strokeDasharray="8 6" opacity={showGrid ? 0.6 : 0} style={{ transition: 'opacity 0.8s' }}>
            <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2s" repeatCount="indefinite" />
          </line>

          {/* Cloud → Fleet (multiple lines) */}
          {[1200, 1400, 1600, 1800].map((x, i) => (
            <line key={`cf${i}`} x1={1600} y1={640} x2={x} y2={880}
              stroke="url(#grad-down-cyan)" strokeWidth={1.5}
              strokeDasharray="6 8" opacity={showCloud ? 0.4 : 0} style={{ transition: 'opacity 0.8s' }}>
              <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="3s" repeatCount="indefinite" />
            </line>
          ))}

          {/* Telemetry up: Fleet → Cloud */}
          {[1300, 1500, 1700].map((x, i) => (
            <line key={`fc${i}`} x1={x} y1={880} x2={1600} y2={640}
              stroke="url(#grad-down-green)" strokeWidth={1}
              strokeDasharray="4 8" opacity={showCloud ? 0.3 : 0} style={{ transition: 'opacity 0.8s' }}>
              <animate attributeName="stroke-dashoffset" from="0" to="24" dur="2.5s" repeatCount="indefinite" />
            </line>
          ))}

          {/* Cloud → Single Home */}
          <line x1={1600} y1={640} x2={1560} y2={1280}
            stroke="#22d3ee" strokeWidth={2}
            strokeDasharray="8 6" opacity={showCloud ? 0.5 : 0} style={{ transition: 'opacity 0.8s' }}>
            <animate attributeName="stroke-dashoffset" from="0" to="-28" dur="2s" repeatCount="indefinite" />
          </line>
          <line x1={1560} y1={1280} x2={1600} y2={640}
            stroke="#10b981" strokeWidth={1}
            strokeDasharray="4 8" opacity={showCloud ? 0.35 : 0} style={{ transition: 'opacity 0.8s' }}>
            <animate attributeName="stroke-dashoffset" from="0" to="24" dur="2.5s" repeatCount="indefinite" />
          </line>

          {/* Neighbor home connections to cloud */}
          {NEIGHBOR_HOMES.map((h, i) => (
            <line key={`nh${i}`} x1={h.x + 30} y1={h.y} x2={1600} y2={640}
              stroke="#22d3ee" strokeWidth={0.8}
              strokeDasharray="4 8" opacity={showNeighbors ? 0.25 : 0}
              style={{ transition: 'opacity 0.8s' }}>
              <animate attributeName="stroke-dashoffset" from="0" to="-24" dur="3s" repeatCount="indefinite" />
            </line>
          ))}
        </svg>

        {/* ═══ LAYER: Cloud Platform ═══ */}
        <div style={{
          position: 'absolute', left: 1200, top: 380, width: 800, height: 250,
          opacity: showCloud ? 1 : 0, transition: 'opacity 0.8s ease',
        }}>
          <HUDBox color="#22d3ee" glow large>
            <div style={{ fontSize: 32, fontWeight: 700, color: '#22d3ee', marginBottom: 8 }}>☁ VPP CONTROLLER</div>
            <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 8 }}>
              <CloudLabel icon="⎈" text="Kubernetes" sub="Container orchestration" />
              <CloudLabel icon="◆" text="Dapr" sub="Event-driven sidecar" />
              <CloudLabel icon="↔" text="MQTT" sub="Real-time telemetry" />
            </div>
          </HUDBox>
        </div>

        {/* ═══ LAYER: Fleet dots ═══ */}
        {FLEET_HOMES.map((h, i) => (
          <div key={`fl${i}`} style={{
            position: 'absolute', left: h.x, top: h.y,
            width: h.size, height: h.size, borderRadius: '50%',
            background: '#10b981',
            opacity: showFleet ? 0.6 : 0,
            transition: `opacity 0.6s ease ${h.delay}s`,
            boxShadow: showFleet ? '0 0 4px #10b98180' : 'none',
          }} />
        ))}

        {/* Fleet label */}
        <div style={{
          position: 'absolute', left: 1350, top: 820, textAlign: 'center',
          opacity: showFleet ? 1 : 0, transition: 'opacity 0.8s ease 0.3s',
        }}>
          <div style={{ fontSize: 22, color: '#10b981', fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>
            ● 12,000+ HOMES
          </div>
        </div>

        {/* ═══ LAYER: Neighbor homes ═══ */}
        {NEIGHBOR_HOMES.map((h, i) => (
          <div key={`nb${i}`} style={{
            position: 'absolute', left: h.x, top: h.y,
            opacity: showNeighbors ? 1 : 0,
            transition: `opacity 0.6s ease ${h.delay}s`,
          }}>
            <div style={{
              width: 60, height: 40, borderRadius: 6,
              background: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>🏠</div>
          </div>
        ))}

        {/* ═══ LAYER: Single Home ═══ */}
        <div style={{
          position: 'absolute', left: 1350, top: 1280, width: 500, height: 420,
          opacity: showHome ? 1 : 0, transition: 'opacity 0.6s ease',
        }}>
          {/* Home outline */}
          <div style={{
            position: 'absolute', inset: 0,
            border: '1.5px solid rgba(34, 211, 238, 0.25)',
            borderRadius: 12,
            background: 'rgba(10, 14, 23, 0.85)',
          }}>
            <div style={{
              position: 'absolute', top: -14, left: 20,
              padding: '2px 12px', fontSize: 13,
              color: '#22d3ee', fontFamily: '"JetBrains Mono", monospace',
              background: '#0a0e17', border: '1px solid rgba(34, 211, 238, 0.3)',
              borderRadius: 4,
            }}>HOME-001</div>
          </div>

          {/* Home wiring SVG */}
          <svg style={{ position: 'absolute', inset: 0, width: 500, height: 420, pointerEvents: 'none' }}>
            {HOME_WIRES.map((w, i) => {
              const from = assetCenter(w.from);
              const to = assetCenter(w.to);
              return (
                <line key={i} x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke={w.color} strokeWidth={1.5} strokeDasharray="4 4" opacity={0.4}>
                  <animate attributeName="stroke-dashoffset" from="0" to="-16" dur="1.5s" repeatCount="indefinite" />
                </line>
              );
            })}
          </svg>

          {/* Assets */}
          {HOME_ASSETS.map(a => (
            <div key={a.id} style={{
              position: 'absolute', left: a.x, top: a.y,
              width: 110, textAlign: 'center',
            }}>
              <div style={{
                fontSize: 28, lineHeight: 1,
                filter: showInverterHighlight && a.id === 'inv' ? `drop-shadow(0 0 12px ${a.color})` : 'none',
                transition: 'filter 0.5s',
              }}>{a.icon}</div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: a.color,
                fontFamily: '"JetBrains Mono", monospace', marginTop: 4,
              }}>{a.label}</div>
              <div style={{
                fontSize: 11, color: '#64748b',
                fontFamily: '"JetBrains Mono", monospace',
              }}>{a.sub}</div>
            </div>
          ))}

          {/* Inverter highlight ring */}
          {showInverterHighlight && (
            <div style={{
              position: 'absolute',
              left: HOME_ASSETS[2].x + 20, top: HOME_ASSETS[2].y - 8,
              width: 70, height: 70, borderRadius: '50%',
              border: '2px solid #22d3ee',
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.4), inset 0 0 20px rgba(34, 211, 238, 0.1)',
              animation: 'pulse-ring 2s ease-in-out infinite',
            }} />
          )}
        </div>

        {/* ═══ LAYER: Full VPP Title ═══ */}
        {showFullTitle && (
          <div style={{
            position: 'absolute', left: 0, top: 680, width: 3200,
            textAlign: 'center', opacity: showFullTitle ? 1 : 0,
            transition: 'opacity 1s ease 0.3s',
          }}>
            <div style={{
              fontSize: 72, fontWeight: 800, color: '#22d3ee',
              textShadow: '0 0 40px rgba(34, 211, 238, 0.4)',
              letterSpacing: 8,
            }}>VIRTUAL POWER PLANT</div>
          </div>
        )}
      </div>

      {/* ═══ HUD: Info panel (fixed, outside zoom) ═══ */}
      <div style={{
        position: 'absolute', bottom: 30, left: 30, zIndex: 55,
        maxWidth: 420, padding: '16px 20px',
        background: 'rgba(10, 14, 23, 0.9)',
        border: '1px solid rgba(34, 211, 238, 0.2)',
        borderRadius: 8,
        backdropFilter: 'blur(8px)',
        opacity: step ? 1 : 0,
        transform: step ? 'translateY(0)' : 'translateY(10px)',
        transition: 'opacity 0.5s, transform 0.5s',
      }}>
        <div style={{
          fontSize: 11, color: '#22d3ee', fontFamily: '"JetBrains Mono", monospace',
          marginBottom: 4, letterSpacing: 2, opacity: 0.7,
        }}>STEP {stepIndex + 1} / {STEP_COUNT}</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>
          {step?.title}
        </div>
        <div style={{ fontSize: 15, color: '#94a3b8', lineHeight: 1.5 }}>
          {step?.desc}
        </div>
      </div>

      {/* ═══ HUD: Step dots (top-right) ═══ */}
      <div style={{
        position: 'absolute', top: 24, right: 24, zIndex: 55,
        display: 'flex', gap: 8, alignItems: 'center',
        opacity: booted ? 1 : 0, transition: 'opacity 0.5s',
      }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i <= stepIndex ? '#22d3ee' : 'rgba(148, 163, 184, 0.3)',
            boxShadow: i === stepIndex ? '0 0 8px #22d3ee' : 'none',
            transition: 'background 0.3s, box-shadow 0.3s',
          }} />
        ))}
      </div>

      {/* ═══ Boot text ═══ */}
      {!booted && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 58,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: '"JetBrains Mono", monospace', fontSize: 16, color: '#22d3ee',
          opacity: boot < 1.8 ? 1 : 0, transition: 'opacity 0.4s',
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ opacity: boot > 0.2 ? 1 : 0 }}>INITIALIZING VPP EXPLAINER</div>
            <div style={{ opacity: boot > 0.6 ? 1 : 0, color: '#64748b', marginTop: 4 }}>Loading asset topology...</div>
            <div style={{ opacity: boot > 1.0 ? 1 : 0, color: '#64748b' }}>Mapping fleet connections...</div>
            <div style={{ opacity: boot > 1.4 ? 1 : 0, color: '#10b981' }}>READY</div>
          </div>
        </div>
      )}

      {/* Spectacle placeholder */}
      {placeholder}

      {/* Keyframe animation */}
      <style>{`
        @keyframes pulse-ring {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────

function HUDBox({ children, color, glow, large }) {
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: 'rgba(10, 14, 23, 0.9)',
      border: `1px solid ${color}30`,
      borderRadius: 10,
      padding: large ? '24px 32px' : '16px 20px',
      boxShadow: glow ? `0 0 30px ${color}15, inset 0 0 30px ${color}08` : 'none',
      textAlign: 'center',
    }}>
      {children}
    </div>
  );
}

function CloudLabel({ icon, text, sub }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 24, color: '#22d3ee', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>{text}</div>
      <div style={{ fontSize: 12, color: '#64748b', fontFamily: '"JetBrains Mono", monospace' }}>{sub}</div>
    </div>
  );
}
