import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

const applyNightBasemapStyle = (map) => {
  (map.getStyle().layers ?? []).forEach(({ id: layerId, type }) => {
    if (!map.getLayer(layerId)) return;
    try {
      if (type === 'background') map.setPaintProperty(layerId, 'background-color', '#050814');
      if (type === 'fill') map.setPaintProperty(layerId, 'fill-color', /water|ocean|lake|river/i.test(layerId) ? '#071426' : '#0a1020');
      if (type === 'fill-extrusion') map.setPaintProperty(layerId, 'fill-extrusion-color', '#111b30');
      if (type === 'line') map.setPaintProperty(layerId, 'line-color', '#24344d');
      if (type === 'symbol') {
        map.setPaintProperty(layerId, 'text-color', '#64748b');
        map.setPaintProperty(layerId, 'text-halo-color', '#071426');
        map.setPaintProperty(layerId, 'text-halo-width', 1);
      }
    } catch {
      // Some external style layers do not expose every paint property.
    }
  });
};

const JapanMapBackground = ({ opacity = 0.15, style = {}, onMapReady, interactive = true, variant = 'default' }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize the map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: MAP_STYLE_URL,
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
      if (variant === 'night') {
        applyNightBasemapStyle(map.current);
      } else if (map.current.getLayer('background')) {
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
