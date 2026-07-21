import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { animate } from 'animejs';
import JapanMapBackground from './JapanMapBackground.jsx';
import { getJapanMapLayers } from './JapanMapLayers.jsx';
import * as mapData from './japanMapData.mjs';
import ExplanationBox from './ExplanationBox.jsx';

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

const HORMUZ_CALLOUTS = [
  { title: 'Strait of Hormuz', description: '97% of Japan LNG transits this route', stat: '97%', color: 'var(--color-accent)', icon: 'LNG' },
  { title: 'A household impact', description: 'A six-week disruption added ¥15,000 to every household\'s annual energy bill.', stat: '¥15,000', color: 'var(--color-danger)', icon: '¥' },
  { title: 'Japan\'s dependency', description: '84.7% of the country\'s energy is imported — a physical route becomes a national risk.', stat: '84.7%', color: 'var(--color-primary)', icon: '→' },
  { title: 'Japan LNG terminals', description: 'The constrained import route becomes a grid problem at the coast.', stat: '3 hubs', color: 'var(--color-primary)', icon: '✦' },
];

const HormuzContextOverlay = ({ activeIndex, leaderPoint }) => {
  const callout = HORMUZ_CALLOUTS[activeIndex];
  if (!callout) return null;

  return (
  <div
    data-testid="hormuz-context"
    style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}
  >
    <svg data-testid="hormuz-callout-leader" width="100%" height="100%" style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <path
        d={`M 372 184 L 414 184 L ${Math.max(414, leaderPoint.x)} ${leaderPoint.y}`}
        fill="none"
        stroke={callout.color}
        strokeWidth="2"
        strokeDasharray="6 6"
        opacity="0.9"
      />
      <circle cx={leaderPoint.x} cy={leaderPoint.y} r="7" fill={callout.color} opacity="0.95" />
    </svg>
    <div data-testid="hormuz-context-card" style={{ position: 'absolute', top: 32, left: 32, width: 340 }}>
      <ExplanationBox
        {...callout}
        forceVisible
        direction="left"
      />
    </div>
  </div>
  );
};

const JapanGridMapAnimated = ({ height = 600, step = 0, testId }) => {
  const mapRef = useRef(null);
  const deckRef = useRef(null);
  const routeProgressRef = useRef(0);
  const tripTimeRef = useRef(0);
  const transitRef = useRef(null);
  const tripRef = useRef(null);
  const storyTimersRef = useRef([]);
  const activeStoryIndexRef = useRef(null);
  const hasRunHormuzTransit = useRef(false);
  const [gridPulse, setGridPulse] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [leaderPoint, setLeaderPoint] = useState({ x: 620, y: 260 });
  const [viewState, setViewState] = useState({ longitude: 138.25, latitude: 36.2, zoom: 4.5, bearing: 0, pitch: 0 });

  const isHormuzScene = step === 5;
  const layers = getJapanMapLayers({ scene: isHormuzScene ? 'hormuz' : step, routeProgress: routeProgressRef.current, gridPulse, tripTime: tripTimeRef.current, disruptionRatio: activeStoryIndex === null ? 1 : Math.max(0.25, 1 - activeStoryIndex * 0.25) });

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
    const map = mapRef.current;
    const story = mapData.HORMUZ_STORY_KEYFRAMES[activeStoryIndex];
    if (!map || !story) return undefined;

    const syncLeader = () => {
      const point = map.project(story.anchor);
      setLeaderPoint({ x: point.x, y: point.y });
    };
    syncLeader();
    map.on('move', syncLeader);
    return () => map.off('move', syncLeader);
  }, [activeStoryIndex]);

  useEffect(() => {
    if (isHormuzScene) return undefined;
    const pulseTimer = window.setInterval(() => setGridPulse((current) => (current ? 0 : 1)), 950);
    return () => window.clearInterval(pulseTimer);
  }, [isHormuzScene]);

  useEffect(() => {
    if (step < 5) {
      hasRunHormuzTransit.current = false;
      routeProgressRef.current = 0;
    }

    const map = mapRef.current;
    if (!isHormuzScene || !map || hasRunHormuzTransit.current) return undefined;

    hasRunHormuzTransit.current = true;
    const schedule = (callback, delay) => {
      const timer = window.setTimeout(callback, delay);
      storyTimersRef.current.push(timer);
    };
    const syncLayers = () => {
      deckRef.current?.deck?.setProps({
        layers: getJapanMapLayers({
          scene: 'hormuz',
          routeProgress: routeProgressRef.current,
          tripTime: tripTimeRef.current,
          disruptionRatio: Math.max(0.25, 1 - (activeStoryIndexRef.current ?? 0) * 0.25),
        }),
      });
    };
    const moveToStory = (index) => {
      const story = mapData.HORMUZ_STORY_KEYFRAMES[index];
      const duration = index === 0 ? mapData.HORMUZ_CAMERA_SEQUENCE.toHormuz : 1900;
      map.easeTo({ ...story.camera, duration, essential: true });
      schedule(() => {
        activeStoryIndexRef.current = index;
        setActiveStoryIndex(index);
        if (index < 2) schedule(() => moveToStory(index + 1), story.hold);
        if (index === 2) {
          schedule(() => {
            const waypoints = mapData.LNG_ROUTE.slice(3);
            const segmentDuration = Math.floor(mapData.HORMUZ_CAMERA_SEQUENCE.toJapan / waypoints.length);
            const progress = { value: 0 };
            transitRef.current = animate(progress, {
              value: 1,
              duration: mapData.HORMUZ_CAMERA_SEQUENCE.toJapan,
              ease: 'inOutQuad',
              onUpdate: () => {
                routeProgressRef.current = progress.value;
                syncLayers();
              },
            });
            const tripProgress = { value: 0 };
            tripRef.current = animate(tripProgress, {
              value: 12000,
              duration: mapData.HORMUZ_CAMERA_SEQUENCE.toJapan,
              ease: 'linear',
              onUpdate: () => {
                tripTimeRef.current = tripProgress.value;
                syncLayers();
              },
            });
            waypoints.forEach((center, waypointIndex) => {
              schedule(() => map.easeTo({ center, zoom: waypointIndex === waypoints.length - 1 ? 4.5 : 3.25, bearing: 24, pitch: 45, duration: segmentDuration, essential: true }), waypointIndex * segmentDuration);
            });
            schedule(() => {
              activeStoryIndexRef.current = 3;
              setActiveStoryIndex(3);
            }, mapData.HORMUZ_CAMERA_SEQUENCE.toJapan);
          }, story.hold);
        }
      }, duration);
    };
    moveToStory(0);

    return () => {
      storyTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      storyTimersRef.current = [];
      transitRef.current?.pause();
      tripRef.current?.pause();
    };
  }, [isHormuzScene, step]);

  return (
    <div
      data-testid={testId}
      style={{ height, width: '100%', position: 'relative', background: 'var(--color-background)', overflow: 'hidden' }}
    >
      <JapanMapBackground opacity={0.72} onMapReady={handleMapReady} interactive />
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
      {isHormuzScene && activeStoryIndex !== null && <HormuzContextOverlay activeIndex={activeStoryIndex} leaderPoint={leaderPoint} />}
    </div>
  );
};

export default JapanGridMapAnimated;
