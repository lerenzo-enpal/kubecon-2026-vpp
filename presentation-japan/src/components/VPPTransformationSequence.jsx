import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { SlideContext } from 'spectacle';
import StepBridge from './StepBridge.jsx';
import JapanMapBackground from './JapanMapBackground.jsx';
import { getVPPTransformationLayers } from './VPPTransformationLayers.jsx';
import { VPP_CITY_BUILDINGS, VPP_GRAPH_LINKS, VPP_GRAPH_NODES, VPP_TRANSFORMATION_STAGES } from './vppTransformationData.mjs';

const CUES = {
  reframe: 'MA / A deliberate pause',
  topology: 'DISTRIBUTED TOPOLOGY',
  city: 'THE GRAPH BECOMES LIVED INFRASTRUCTURE',
  japan: 'JAPAN / THE SAME GRAPH HAS A GEOGRAPHY',
  superpowers: 'COORDINATION CREATES CAPACITY',
};

const toViewState = (map) => {
  const center = map.getCenter();
  return { longitude: center.lng, latitude: center.lat, zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
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
  const mapRef = useRef(null);
  const deckRef = useRef(null);
  const graphCanvasRef = useRef(null);
  const tripTimeRef = useRef(0);
  const stabilizationRef = useRef(0);
  const capabilityPhaseRef = useRef(-1);
  const [mapReady, setMapReady] = useState(false);
  const [viewState, setViewState] = useState({ longitude: 138.25, latitude: 36.2, zoom: 4.35, bearing: 12, pitch: 42 });
  const [cueVisible, setCueVisible] = useState(true);
  const [capabilityPhase, setCapabilityPhase] = useState(-1);
  const stage = VPP_TRANSFORMATION_STAGES[stageIndex] ?? VPP_TRANSFORMATION_STAGES[0];
  const layers = useMemo(() => getVPPTransformationLayers({ stage: stageIndex, capabilityPhase }), [stageIndex, capabilityPhase]);

  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
    setViewState(toViewState(map));
    setMapReady(true);
  }, []);

  useEffect(() => {
    stabilizationRef.current = 0;
    capabilityPhaseRef.current = -1;
    setCapabilityPhase(-1);
    setCueVisible(true);
    const timer = window.setTimeout(() => setCueVisible(false), 2800);
    return () => window.clearTimeout(timer);
  }, [stageIndex]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || stageIndex < 3 || !stage.camera) return;
    map.easeTo({ ...stage.camera, duration: 5200, essential: true });
  }, [mapReady, stageIndex, stage]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;
    const sync = () => setViewState(toViewState(map));
    map.on('move', sync);
    return () => map.off('move', sync);
  }, [mapReady]);

  useEffect(() => {
    if (!isActive) return undefined;
    let frame;
    const tick = (now) => {
      tripTimeRef.current = now % 3600;
      stabilizationRef.current = stageIndex === 4 ? Math.min(1, stabilizationRef.current + 0.012) : 0;
      const nextCapabilityPhase = stageIndex === 4 ? Math.min(2, Math.floor(stabilizationRef.current * 3)) : -1;
      if (nextCapabilityPhase !== capabilityPhaseRef.current) {
        capabilityPhaseRef.current = nextCapabilityPhase;
        setCapabilityPhase(nextCapabilityPhase);
      }
      drawGraphScene(graphCanvasRef.current, stageIndex, now);
      deckRef.current?.deck?.setProps({
        layers: getVPPTransformationLayers({ stage: stageIndex, tripTime: tripTimeRef.current, stabilization: stabilizationRef.current, capabilityPhase: nextCapabilityPhase }),
      });
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
                <JapanMapBackground variant="night" opacity={0.32} onMapReady={handleMapReady} interactive={stageIndex >= 3} />
                <DeckGL ref={deckRef} layers={layers} viewState={viewState} controller={false} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }} />
              </div>
            )}
            <div data-testid={`vpp-stage-${stage.id}`} style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
              {cueVisible && <div data-testid={`vpp-context-cue-${stage.cue}`} style={{ position: 'absolute', top: 34, right: 38, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.15em', color: 'rgba(165, 243, 252, 0.82)', transition: 'opacity 460ms ease', opacity: cueVisible ? 1 : 0 }}>{CUES[stage.cue]}</div>}
              {stageIndex === 0 && <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div style={{ width: 86, height: 3, background: 'var(--color-primary)', margin: '0 auto 26px' }} /><div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 56, fontWeight: 800, color: '#f1f5f9' }}>The grid is a distributed system.</div></div></div>}
              {stageIndex === 1 && <div style={{ position: 'absolute', left: 54, bottom: 48, maxWidth: 600, fontFamily: 'Space Grotesk, sans-serif', fontSize: 44, lineHeight: 1.08, fontWeight: 800, color: '#f1f5f9' }}>You already know how to solve this.</div>}
              {stageIndex === 2 && <div style={{ position: 'absolute', left: 54, bottom: 48, display: 'flex', flexWrap: 'wrap', columnGap: 16, rowGap: 4, maxWidth: 820, fontFamily: 'Space Grotesk, sans-serif', fontSize: 52, lineHeight: 1, fontWeight: 800 }}><span data-testid="vpp-hero-graph" style={{ color: '#f1f5f9', opacity: 1, transform: 'translateY(0)', transition: 'opacity 600ms ease, transform 600ms ease' }}>A graph</span><span data-testid="vpp-hero-city" style={{ color: '#f1f5f9', transform: 'scale(1)', transition: 'transform 620ms cubic-bezier(.2,1.35,.4,1)' }}>is a city</span><span data-testid="vpp-hero-load" style={{ color: '#ffc217', opacity: 1, letterSpacing: '0', transition: 'opacity 540ms 820ms ease, letter-spacing 540ms 820ms ease' }}>under load.</span></div>}
              {stageIndex === 3 && <div style={{ position: 'absolute', left: 42, top: 44, maxWidth: 430 }}><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.15em', color: '#67e8f9', marginBottom: 12 }}>ACT III / JAPAN</div><div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 47, lineHeight: 1.04, fontWeight: 800, color: '#f1f5f9' }}>The same graph has a geography.</div></div>}
              {stageIndex === 4 && <div style={{ position: 'absolute', left: 42, top: 44, width: 410 }}><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.15em', color: '#67e8f9', marginBottom: 12 }}>ACT IV / VIRTUAL POWER PLANT</div><div style={{ display: 'grid', gap: 10 }}>{[
                ['market', '◒', 'Bring new players into the market'],
                ['response', '⌁', 'Respond when the system is tight'],
                ['demand', '▣', 'Use demand smarter'],
              ].map(([id, icon, copy], index) => <div key={id} data-testid={`vpp-capability-${id}`} style={{ display: 'grid', gridTemplateColumns: '28px 1fr', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid rgba(103, 232, 249, 0.28)', background: 'rgba(3, 5, 8, 0.82)', color: '#f1f5f9', fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 800, opacity: capabilityPhase >= index ? 1 : 0, transform: capabilityPhase >= index ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 420ms ease, transform 420ms ease' }}><span aria-hidden="true" style={{ color: '#67e8f9', fontFamily: 'JetBrains Mono, monospace' }}>{icon}</span><span>{copy}</span></div>)}</div></div>}
            </div>
    </div>
  );
}
