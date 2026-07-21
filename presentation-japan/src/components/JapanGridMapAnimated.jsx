import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { animate } from 'animejs';
import JapanMapBackground from './JapanMapBackground.jsx';
import { getJapanMapLayers } from './JapanMapLayers.jsx';
import * as mapData from './japanMapData.mjs';

const JAPAN_CAMERA = { center: [138.25, 36.2], zoom: 4.5, bearing: 0, pitch: 0 };
const HORMUZ_CAMERA = { center: mapData.HORMUZ_COORDINATE, zoom: 4.1, bearing: 0, pitch: 0 };

const mapViewState = (map) => {
  const center = map.getCenter();
  return {
    longitude: center.lng,
    latitude: center.lat,
    zoom: map.getZoom(),
    bearing: map.getBearing(),
    pitch: map.getPitch(),
  };
};

const JapanGridMapAnimated = ({ height = 600, step = 0, testId }) => {
  const mapRef = useRef(null);
  const deckRef = useRef(null);
  const routeProgressRef = useRef(0);
  const transitRef = useRef(null);
  const hasRunHormuzTransit = useRef(false);
  const [viewState, setViewState] = useState({ longitude: 138.25, latitude: 36.2, zoom: 4.5, bearing: 0, pitch: 0 });

  const isHormuzScene = step === 5;
  const layers = getJapanMapLayers({ scene: isHormuzScene ? 'hormuz' : step, routeProgress: routeProgressRef.current });

  const handleMapReady = useCallback((map) => {
    mapRef.current = map;
    setViewState(mapViewState(map));
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return undefined;

    const syncViewState = () => setViewState(mapViewState(map));
    map.on('move', syncViewState);
    return () => map.off('move', syncViewState);
  }, [mapRef.current]);

  useEffect(() => {
    if (step < 5) {
      hasRunHormuzTransit.current = false;
      routeProgressRef.current = 0;
    }

    const map = mapRef.current;
    if (!isHormuzScene || !map || hasRunHormuzTransit.current) return undefined;

    hasRunHormuzTransit.current = true;
    map.easeTo({ ...HORMUZ_CAMERA, duration: 1100, essential: true });

    const transitTimer = window.setTimeout(() => {
      const progress = { value: 0 };
      map.easeTo({ ...JAPAN_CAMERA, duration: 1600, essential: true });
      transitRef.current = animate(progress, {
        value: 1,
        duration: 1600,
        ease: 'inOutQuad',
        onUpdate: () => {
          routeProgressRef.current = progress.value;
          deckRef.current?.deck?.setProps({
            layers: getJapanMapLayers({ scene: 'hormuz', routeProgress: progress.value }),
          });
        },
      });
    }, 1120);

    return () => {
      window.clearTimeout(transitTimer);
      transitRef.current?.pause();
    };
  }, [isHormuzScene, step]);

  return (
    <div
      data-testid={testId}
      style={{ height, width: '100%', position: 'relative', background: 'var(--color-background)', overflow: 'hidden' }}
    >
      <JapanMapBackground opacity={0.58} onMapReady={handleMapReady} />
      <div data-testid="japan-geographic-layers" style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none' }}>
        <DeckGL ref={deckRef} layers={layers} viewState={viewState} controller={false} />
      </div>
      {isHormuzScene && (
        <div
          data-testid="hormuz-route"
          style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clipPath: 'inset(50%)' }}
        >
          <span>Strait of Hormuz</span>
          <span>Japan LNG terminals</span>
        </div>
      )}
    </div>
  );
};

export default JapanGridMapAnimated;
