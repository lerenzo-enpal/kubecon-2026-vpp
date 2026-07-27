import React, { useCallback, useEffect, useRef, useState } from 'react';
import { SlideContext } from 'spectacle';
import StepBridge from './StepBridge.jsx';
import { JapanGridAtlas } from './JapanGridAtlas.jsx';
import { getVPPTransformationLayers } from './VPPTransformationLayers.jsx';
import { VPP_CITY_BUILDINGS, VPP_GRAPH_LINKS, VPP_GRAPH_NODES, VPP_TRANSFORMATION_STAGES } from './vppTransformationData.mjs';

const CUES = {
  reframe: 'MA / A deliberate pause',
  topology: 'DISTRIBUTED TOPOLOGY',
  city: 'THE GRAPH BECOMES LIVED INFRASTRUCTURE',
  japan: 'JAPAN / THE SAME GRAPH HAS A GEOGRAPHY',
  superpowers: 'COORDINATION CREATES CAPACITY',
};

const drawGraphScene = (canvas, stageIndex, now) => {
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, Math.floor(bounds.width));
  const height = Math.max(1, Math.floor(bounds.height));
  const ratio = window.devicePixelRatio || 1;
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio;
    canvas.height = height * ratio;
  }
  const context = canvas.getContext('2d');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);
  if (stageIndex < 1 || stageIndex > 2) return;

  const isCity = stageIndex === 2;
  const pulse = 0.5 + Math.sin(now / 720) * 0.5;
  const point = ([x, y]) => [x * width, y * height];
  context.lineCap = 'round';
  VPP_GRAPH_LINKS.forEach((link) => {
    const [start, end] = link.path.map(point);
    context.beginPath();
    context.moveTo(...start);
    context.lineTo(...end);
    context.strokeStyle = `rgba(34, 211, 238, ${isCity ? 0.26 : 0.18 + pulse * 0.14})`;
    context.lineWidth = isCity ? 3 : 1.5;
    context.stroke();
  });
  if (isCity) {
    VPP_CITY_BUILDINGS.forEach((building) => {
      const polygon = building.polygon.map(point);
      context.beginPath();
      polygon.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)));
      context.closePath();
      context.fillStyle = `rgba(17, 30, 52, ${0.82 + building.load * 0.14})`;
      context.strokeStyle = 'rgba(72, 94, 126, 0.75)';
      context.lineWidth = 1;
      context.fill();
      context.stroke();
    });
  }
  VPP_GRAPH_NODES.forEach((node) => {
    const [x, y] = point(node.position);
    const radius = isCity ? 4 + node.load * 4 : 6 + node.load * 7 + pulse * 2;
    const isLoaded = node.load >= 0.8;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = isLoaded ? 'rgba(255, 194, 23, 0.96)' : 'rgba(34, 211, 238, 0.95)';
    context.shadowColor = isLoaded ? 'rgba(255, 194, 23, 0.9)' : 'rgba(34, 211, 238, 0.82)';
    context.shadowBlur = isCity ? 14 : 24;
    context.fill();
  });
  context.shadowBlur = 0;
};

const CAPABILITIES = [
  { id: 'market',   icon: '◒', copy: 'Bring new players into the market', metric: '+2.4 GW', sub: 'aggregated behind-the-meter', hue: '#67e8f9' },
  { id: 'response', icon: '⌁', copy: 'Respond when the system is tight', metric: '<400 ms', sub: 'coordinated dispatch latency',  hue: '#ffc217' },
  { id: 'demand',   icon: '▣', copy: 'Use demand smarter',                metric: '−18%',    sub: 'peak-hour consumption',       hue: '#a78bfa' },
];

function VPPCapabilityPanel({ capabilityPhase, stabilizationRef }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let raf;
    const loop = () => { setTick((t) => t + 1); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);
  const pulse = 0.5 + Math.sin(tick / 18) * 0.5;
  const stabilization = stabilizationRef?.current ?? 0;
  const allOnline = capabilityPhase >= CAPABILITIES.length - 1;

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      {/* Title block, top-left */}
      <div style={{ position: 'absolute', left: 42, top: 44, width: 440 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.18em', color: '#67e8f9', marginBottom: 12,
          display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: '#67e8f9', boxShadow: `0 0 ${6 + pulse * 10}px #67e8f9`, opacity: 0.6 + pulse * 0.4 }} />
          ACT IV / VIRTUAL POWER PLANT
        </div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 40, lineHeight: 1.02, fontWeight: 800, color: '#f1f5f9', marginBottom: 18 }}>
          Coordination unlocks capacity.
        </div>
        <div style={{ display: 'grid', gap: 12 }}>
          {CAPABILITIES.map((cap, index) => {
            const on = capabilityPhase >= index;
            return (
              <div key={cap.id} data-testid={`vpp-capability-${cap.id}`}
                style={{ position: 'relative',
                  display: 'grid', gridTemplateColumns: '36px 1fr auto', alignItems: 'center', gap: 14,
                  padding: '14px 18px',
                  border: `1px solid ${on ? cap.hue + '66' : 'rgba(103,232,249,0.18)'}`,
                  background: on
                    ? `linear-gradient(90deg, ${cap.hue}18 0%, rgba(3,5,8,0.85) 60%)`
                    : 'rgba(3,5,8,0.7)',
                  color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif',
                  opacity: on ? 1 : 0.35,
                  transform: on ? 'translateX(0)' : 'translateX(-16px)',
                  transition: 'opacity 520ms ease, transform 520ms ease, border-color 520ms ease, background 520ms ease',
                  boxShadow: on ? `0 0 24px ${cap.hue}22, inset 0 0 20px ${cap.hue}0a` : 'none' }}>
                {/* left status LED */}
                <span aria-hidden="true" style={{ position: 'relative', width: 32, height: 32, display: 'grid', placeItems: 'center' }}>
                  <span style={{ position: 'absolute', inset: 0, borderRadius: '50%',
                    border: `1px solid ${on ? cap.hue + '88' : 'rgba(103,232,249,0.25)'}`,
                    boxShadow: on ? `0 0 ${6 + pulse * 12}px ${cap.hue}80` : 'none',
                    transition: 'box-shadow 420ms ease' }} />
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', color: on ? cap.hue : '#67e8f966', fontSize: 18, fontWeight: 800 }}>{cap.icon}</span>
                </span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.15 }}>{cap.copy}</div>
                  <div style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                    color: on ? '#94a3b8' : '#64748b60', letterSpacing: '0.05em', marginTop: 3 }}>
                    {cap.sub}
                  </div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 88 }}>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 800,
                    color: on ? cap.hue : '#67e8f930',
                    textShadow: on ? `0 0 12px ${cap.hue}60` : 'none', letterSpacing: '-0.02em' }}>
                    {cap.metric}
                  </div>
                  <div style={{ fontSize: 9, fontFamily: 'JetBrains Mono, monospace',
                    color: on ? cap.hue + 'cc' : '#67e8f930', letterSpacing: '0.14em', marginTop: 2 }}>
                    {on ? 'ONLINE' : 'STANDBY'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom-right hero summary */}
      <div style={{ position: 'absolute', right: 44, bottom: 44, width: 320,
        border: `1px solid ${allOnline ? 'rgba(255,194,23,0.55)' : 'rgba(103,232,249,0.28)'}`,
        background: 'rgba(3,5,8,0.86)', padding: '18px 22px',
        boxShadow: allOnline ? `0 0 40px rgba(255,194,23,0.22), inset 0 0 30px rgba(255,194,23,0.06)` : '0 0 24px rgba(103,232,249,0.1)',
        transition: 'border-color 620ms ease, box-shadow 620ms ease',
        backdropFilter: 'blur(12px)' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '0.18em',
          color: allOnline ? '#ffc217' : '#67e8f9', marginBottom: 6 }}>
          {allOnline ? 'FLEET COORDINATED' : 'BRINGING FLEET ONLINE'}
        </div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 40, fontWeight: 800,
          color: allOnline ? '#ffc217' : '#f1f5f9', lineHeight: 1,
          textShadow: allOnline ? '0 0 24px rgba(255,194,23,0.4)' : 'none' }}>
          {allOnline ? '2.4 GW' : `${(2.4 * Math.min(1, (capabilityPhase + 1) / 3)).toFixed(1)} GW`}
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#94a3b8', marginTop: 6, lineHeight: 1.4 }}>
          equivalent dispatchable capacity — from assets that already exist.
        </div>
        {/* Progress bar */}
        <div style={{ marginTop: 14, height: 4, background: 'rgba(103,232,249,0.12)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%',
            width: `${Math.max(6, Math.min(100, ((capabilityPhase + 1) / 3) * 100 * Math.min(1, stabilization * 3)))}%`,
            background: allOnline ? '#ffc217' : '#67e8f9',
            boxShadow: `0 0 12px ${allOnline ? '#ffc217' : '#67e8f9'}80`,
            transition: 'width 620ms ease, background 620ms ease' }} />
        </div>
      </div>
    </div>
  );
}

export default function VPPTransformationSequence({ height = '100%' }) {
  return (
    <StepBridge count={5}>
      {(step) => <VPPTransformationStage height={height} stageIndex={step} />}
    </StepBridge>
  );
}

function VPPTransformationStage({ height, stageIndex }) {
  const slideContext = React.useContext(SlideContext);
  const isActive = slideContext?.isSlideActive ?? true;
  const graphCanvasRef = useRef(null);
  const stabilizationRef = useRef(0);
  const capabilityPhaseRef = useRef(-1);
  const [cueVisible, setCueVisible] = useState(true);
  const [capabilityPhase, setCapabilityPhase] = useState(-1);
  const stage = VPP_TRANSFORMATION_STAGES[stageIndex] ?? VPP_TRANSFORMATION_STAGES[0];
  const transmissionLayers = useCallback((tripTime) => getVPPTransformationLayers({ stage: stageIndex, tripTime, stabilization: stabilizationRef.current, capabilityPhase }), [stageIndex, capabilityPhase]);

  useEffect(() => {
    stabilizationRef.current = 0;
    capabilityPhaseRef.current = -1;
    setCapabilityPhase(-1);
    setCueVisible(true);
    const timer = window.setTimeout(() => setCueVisible(false), 2800);
    return () => window.clearTimeout(timer);
  }, [stageIndex]);

  useEffect(() => {
    if (!isActive) return undefined;
    let frame;
    const tick = (now) => {
      stabilizationRef.current = stageIndex === 4 ? Math.min(1, stabilizationRef.current + 0.012) : 0;
      const nextCapabilityPhase = stageIndex === 4 ? Math.min(2, Math.floor(stabilizationRef.current * 3)) : -1;
      if (nextCapabilityPhase !== capabilityPhaseRef.current) {
        capabilityPhaseRef.current = nextCapabilityPhase;
        setCapabilityPhase(nextCapabilityPhase);
      }
      drawGraphScene(graphCanvasRef.current, stageIndex, now);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, stageIndex]);

  return (
    <div data-testid="vpp-transformation-sequence" style={{ height, minHeight: '100%', width: '100%', position: 'relative', overflow: 'hidden', background: '#030508' }}>
            <canvas ref={graphCanvasRef} aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: stageIndex >= 1 && stageIndex <= 2 ? 1 : 0, transition: 'opacity 700ms ease', zIndex: 1 }} />
            {stageIndex >= 3 && (
              <div data-testid="vpp-japan-map" style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
                <JapanGridAtlas transmissionLayer={{ getLayers: transmissionLayers }} />
              </div>
            )}
            <div data-testid={`vpp-stage-${stage.id}`} style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
              {cueVisible && <div data-testid={`vpp-context-cue-${stage.cue}`} style={{ position: 'absolute', top: 34, right: 38, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(165, 243, 252, 0.82)', transition: 'opacity 460ms ease', opacity: cueVisible ? 1 : 0 }}>{CUES[stage.cue]}</div>}
              {stageIndex === 0 && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div style={{ width: 86, height: 3, background: 'var(--color-primary)', margin: '0 auto 26px' }} /><div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 56, fontWeight: 800, color: '#f1f5f9' }}>The grid is a distributed system.</div></div></div>}
              {stageIndex === 1 && <div style={{ position: 'absolute', left: 54, bottom: 48, maxWidth: 600, fontFamily: 'Space Grotesk, sans-serif', fontSize: 44, lineHeight: 1.08, fontWeight: 800, color: '#f1f5f9' }}>You already know how to solve this.</div>}
              {stageIndex === 2 && <div style={{ position: 'absolute', left: 54, bottom: 48, display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 4, maxWidth: 820, fontFamily: 'Space Grotesk, sans-serif', fontSize: 52, lineHeight: 1, fontWeight: 800 }}><span data-testid="vpp-hero-graph" style={{ color: '#f1f5f9', opacity: 1, transform: 'translateY(0)', transition: 'opacity 600ms ease, transform 600ms ease' }}>A graph</span><span data-testid="vpp-hero-city" style={{ color: '#f1f5f9', transform: 'scale(1)', transition: 'transform 620ms cubic-bezier(.2,1.35,.4,1)' }}>is a city</span><span data-testid="vpp-hero-load" style={{ color: '#ffc217', opacity: 1, letterSpacing: '0', transition: 'opacity 540ms 820ms ease, letter-spacing 540ms 820ms ease' }}>under load.</span></div>}
              {stageIndex === 3 && <div style={{ position: 'absolute', left: 42, top: 44, maxWidth: 430 }}><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.15em', color: '#67e8f9', marginBottom: 12 }}>ACT III / JAPAN</div><div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 47, lineHeight: 1.04, fontWeight: 800, color: '#f1f5f9' }}>The same graph has a geography.</div></div>}
              {stageIndex === 4 && <VPPCapabilityPanel capabilityPhase={capabilityPhase} stabilizationRef={stabilizationRef} />}
            </div>
    </div>
  );
}
