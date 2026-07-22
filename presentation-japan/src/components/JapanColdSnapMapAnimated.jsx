import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { SlideContext } from 'spectacle';
import JapanMapBackground from './JapanMapBackground.jsx';
import { getJapanMapLayers } from './JapanMapLayers.jsx';
import * as mapData from './japanMapData.mjs';
import { JEPXPriceChart } from './JEPXPriceChart.jsx';

const STORY = [
  { title: 'This Is Not the First Warning', body: 'January 2021. A cold snap hit Japan. What happened next is the pattern that repeats.' },
  { title: 'The Crisis: 25× in 40 Days', body: 'A price shock with no disaster trigger.' },
  { title: 'Tokyo: demand concentrates', body: 'Homes heat up together. The grid feels the peak all at once.' },
  { title: 'Kansai: the pressure spreads', body: 'Regional constraints turn a cold snap into a system event.' },
  { title: 'Now: the pattern returns', body: 'Cold-snap demand is a distributed systems problem.' },
];

const toViewState = (map) => {
  const center = map.getCenter();
  return { longitude: center.lng, latitude: center.lat, zoom: map.getZoom(), bearing: map.getBearing(), pitch: map.getPitch() };
};

export default function JapanColdSnapMapAnimated({ height = '100%', step = 0, testId }) {
  const slideContext = React.useContext(SlideContext);
  const isActive = slideContext?.isSlideActive ?? true;
  const mapRef = useRef(null);
  const deckRef = useRef(null);
  const tripTimeRef = useRef(0);
  const [viewState, setViewState] = useState({ longitude: 138.25, latitude: 36.2, zoom: 4.25, bearing: 12, pitch: 40 });
  const [mapReady, setMapReady] = useState(false);
  const layers = useMemo(() => getJapanMapLayers({ scene: 'cold-snap', coldSnapStage: step, tripTime: tripTimeRef.current }), [step]);
  const story = STORY[step] ?? STORY[0];

  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
    setViewState(toViewState(map));
    setMapReady(true);
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const keyframe = mapData.COLD_SNAP_CAMERA_KEYFRAMES[step];
    if (!map || !keyframe) return;
    map.easeTo({ ...keyframe.camera, duration: step < 2 ? 0 : 3600, essential: true });
  }, [step, mapReady]);

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
      tripTimeRef.current = now % 3200;
      deckRef.current?.deck?.setProps({ layers: getJapanMapLayers({ scene: 'cold-snap', coldSnapStage: step, tripTime: tripTimeRef.current }) });
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isActive, step]);

  return (
    <div data-testid={testId} style={{ height, minHeight: '100%', width: '100%', position: 'relative', overflow: 'hidden', background: 'var(--color-background)' }}>
      <JapanMapBackground variant="night" opacity={1} onMapReady={handleMapReady} interactive />
      <DeckGL ref={deckRef} layers={layers} viewState={viewState} controller={false} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }} />
      <div style={{ position: 'absolute', left: 36, top: 34, zIndex: 10, pointerEvents: 'none', maxWidth: 500 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.16em', color: 'var(--color-primary)', marginBottom: 12 }}>ACT II / WINTER DEMAND</div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 42, lineHeight: 1.08, fontWeight: 800, color: 'var(--color-heading)' }}>{story.title}</div>
        <div style={{ marginTop: 12, fontFamily: 'Inter, sans-serif', fontSize: 20, color: 'var(--color-text)' }}>{story.body}</div>
      </div>
      {step >= 1 && <aside data-testid="act2-jepx-sidecar" style={{ position: 'absolute', top: 34, right: 34, zIndex: 10, width: 350, padding: '16px 18px', background: 'rgba(6,10,26,0.9)', border: '1px solid rgba(239,68,68,0.78)', pointerEvents: 'none' }}><div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '0.14em', color: 'var(--color-danger)' }}>JAN–FEB 2021 · JEPX</div><JEPXPriceChart height={215} compact /></aside>}
      {step >= 2 && <div data-testid="act2-demand-card" style={{ position: 'absolute', left: 36, bottom: 36, zIndex: 10, width: 330, padding: '16px 18px', background: 'rgba(6,10,26,0.9)', borderLeft: '3px solid var(--color-danger)', pointerEvents: 'none', fontFamily: 'Inter, sans-serif', color: 'var(--color-text)' }}><div style={{ color: 'var(--color-danger)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, letterSpacing: '0.12em', marginBottom: 6 }}>DEMAND CASCADE ACTIVE</div>{story.body}</div>}
      {step >= 2 && <div data-testid="act2-cold-snap-route" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}>Cold-snap grid flow</div>}
    </div>
  );
}
