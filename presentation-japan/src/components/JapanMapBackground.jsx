import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const NIGHT_STYLE = {
  version: 8,
  sources: {},
  layers: [
    { id: 'night-background', type: 'background', paint: { 'background-color': '#050814' } },
  ],
};

const JapanMapBackground = ({ opacity = 0.15, style = {}, onMapReady, interactive = true, variant = 'default' }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize the map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: variant === 'night' ? NIGHT_STYLE : 'https://demotiles.maplibre.org/style.json',
      center: [138.2529, 36.2048], // Center of Japan
      zoom: 4.5,
      pitch: 34,
      bearing: 0,
      interactive,
      scrollZoom: interactive,
      dragPan: interactive,
      dragRotate: interactive,
      touchZoomRotate: interactive,
      keyboard: false,
      attributionControl: false,
      logoControl: false,
    });

    // Ensure map renders with transparent background
    map.current.on('load', () => {
      // Set background layer to fully transparent
      if (map.current.getLayer('background')) {
        map.current.setPaintProperty('background', 'background-color', 'rgba(0, 0, 0, 0)');
      }
      onMapReady?.(map.current);
    });

    map.current.on('error', (e) => {
      console.warn('Map loading error (non-critical):', e);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [onMapReady, interactive, variant]);

  return (
    <div
      ref={mapContainer}
      data-testid="japan-map-canvas"
      data-interactive={interactive ? 'true' : 'false'}
      tabIndex={0}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: interactive ? 'auto' : 'none',
        zIndex: 1,
        ...style,
      }}
    />
  );
};

export default JapanMapBackground;
