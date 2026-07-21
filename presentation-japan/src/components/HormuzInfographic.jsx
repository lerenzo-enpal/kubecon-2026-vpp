import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer, PathLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const DARK_MAP_STYLE = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'],
      tileSize: 256,
    },
  },
  layers: [{ id: 'base', type: 'raster', source: 'carto-dark', paint: { 'raster-opacity': 0.82 } }],
};

// LNG shipping route: Persian Gulf → Hormuz → Indian Ocean → Malacca → Japan
// Positions are [longitude, latitude]
const ROUTE_POINTS = [
  [56.3,  26.0],  // Persian Gulf
  [56.5,  23.5],  // Strait of Hormuz
  [59.5,  21.5],  // Gulf of Oman
  [65.0,  17.0],  // Arabian Sea
  [78.0,   8.0],  // Indian Ocean
  [95.0,   5.0],  // Bay of Bengal
  [104.0,  1.5],  // Malacca Strait
  [114.0, 10.0],  // South China Sea
  [128.0, 22.0],  // Philippine Sea
  [139.7, 35.7],  // Tokyo / Japan
];

const LABELS = [
  { pos: [56.3, 26.0],   text: 'PERSIAN GULF', color: [255, 163, 95, 230],  size: 13, bold: true  },
  { pos: [56.5, 23.5],   text: 'HORMUZ',        color: [239, 68, 68, 240],   size: 13, bold: true  },
  { pos: [80.0, 14.0],   text: 'INDIAN OCEAN',  color: [100, 116, 139, 180], size: 11, bold: false },
  { pos: [104.0, 1.5],   text: 'MALACCA',       color: [100, 116, 139, 180], size: 11, bold: false },
  { pos: [139.7, 35.7],  text: 'JAPAN',         color: [34, 211, 238, 240],  size: 14, bold: true  },
];

const STEP_CALLOUTS = [
  null,
  {
    eyebrow: 'CHOKEPOINT',
    title: 'Strait of Hormuz Closed',
    body: 'Feb – Mar 2026  ·  6 weeks',
    sub: '40% of global seaborne LNG transits this 54 km passage',
    color: '#ef4444',
  },
  {
    eyebrow: 'JAPAN DEPENDENCY',
    title: '97% of LNG via Hormuz',
    body: 'Jan 2021: ¥10 → ¥251/kWh spot price',
    sub: '25× normal price  ·  40 consecutive days  ·  zero natural disasters',
    color: '#FFA35F',
  },
  {
    eyebrow: 'MARCH 2022',
    title: 'First-ever grid emergency',
    body: 'TEPCO reserve margin: 2.5%',
    sub: 'Safe threshold is 3%. Citizens asked to turn off lights. In a G7 nation.',
    color: '#FFC217',
  },
  {
    eyebrow: 'AI BUILDOUT',
    title: '19 TWh → 66 TWh by 2034',
    body: 'Data center demand tripling',
    sub: "40+ projects delayed in 2024 — grid couldn't support them",
    color: '#22d3ee',
  },
  {
    eyebrow: 'OCCTO FORECAST',
    title: '14× demand increase',
    body: 'Semiconductor fabs + AI + EVs',
    sub: 'Supply getting worse. Demand accelerating. Grid squeezed from both ends.',
    color: '#3939D8',
  },
];

const INITIAL_VIEW = { longitude: 97, latitude: 22, zoom: 2.6, pitch: 30, bearing: 0 };
const ANIM_DUR = 2200;

export function HormuzInfographic({ height = 520, step = 0 }) {
  const slideCtx = useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    cancelAnimationFrame(rafRef.current);
    if (!isActive) {
      setProgress(0);
      startRef.current = null;
      return;
    }
    setProgress(0);
    startRef.current = null;
    const tick = (now) => {
      if (!startRef.current) startRef.current = now;
      const t = Math.min((now - startRef.current) / ANIM_DUR, 1);
      const eased = 1 - Math.pow(1 - t, 2);
      setProgress(eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive]);

  const layers = useMemo(() => {
    const n = ROUTE_POINTS.length;
    const visibleDist = progress * (n - 1);
    const visibleCount = Math.floor(visibleDist);
    const partial = visibleDist - visibleCount;

    const visiblePath = ROUTE_POINTS.slice(0, visibleCount + 1);
    if (visibleCount < n - 1 && partial > 0) {
      const curr = ROUTE_POINTS[visibleCount];
      const next = ROUTE_POINTS[visibleCount + 1];
      visiblePath.push([
        curr[0] + (next[0] - curr[0]) * partial,
        curr[1] + (next[1] - curr[1]) * partial,
      ]);
    }

    const tipPos = visiblePath[visiblePath.length - 1] ?? ROUTE_POINTS[0];
    const routeReachedJapan = progress > 0.97;
    const hormuzVisible = progress > 0.08;
    const japanAlpha = routeReachedJapan ? Math.min(255, Math.round((progress - 0.97) / 0.03 * 255)) : 0;

    return [
      // Full route ghost (faint)
      new PathLayer({
        id: 'route-ghost',
        data: [{ path: ROUTE_POINTS }],
        getPath: d => d.path,
        getColor: [255, 163, 95, 18],
        getWidth: 6,
        widthUnits: 'pixels',
        jointRounded: true,
        capRounded: true,
      }),

      // Route glow
      ...(visiblePath.length > 1 ? [new PathLayer({
        id: 'route-glow',
        data: [{ path: visiblePath }],
        getPath: d => d.path,
        getColor: [255, 163, 95, 50],
        getWidth: 10,
        widthUnits: 'pixels',
        jointRounded: true,
        capRounded: true,
      })] : []),

      // Route line
      ...(visiblePath.length > 1 ? [new PathLayer({
        id: 'route-line',
        data: [{ path: visiblePath }],
        getPath: d => d.path,
        getColor: [255, 163, 95, 230],
        getWidth: 2.5,
        widthUnits: 'pixels',
        jointRounded: true,
        capRounded: true,
      })] : []),

      // Origin dot (Persian Gulf)
      new ScatterplotLayer({
        id: 'origin-dot',
        data: [{ pos: ROUTE_POINTS[0] }],
        getPosition: d => d.pos,
        getRadius: 80000,
        getFillColor: [255, 163, 95, 255],
        radiusUnits: 'meters',
      }),

      // Moving tip dot
      new ScatterplotLayer({
        id: 'tip-dot',
        data: [{ pos: tipPos }],
        getPosition: d => d.pos,
        getRadius: 60000,
        getFillColor: [255, 163, 95, 255],
        radiusUnits: 'meters',
        updateTriggers: { getPosition: progress },
      }),

      // Hormuz red dot
      ...(hormuzVisible ? [new ScatterplotLayer({
        id: 'hormuz-dot',
        data: [{ pos: ROUTE_POINTS[1] }],
        getPosition: d => d.pos,
        getRadius: 90000,
        getFillColor: [239, 68, 68, 220],
        getLineColor: [239, 68, 68, 255],
        lineWidthMinPixels: 2,
        stroked: true,
        radiusUnits: 'meters',
      })] : []),

      // Japan cyan dot
      ...(japanAlpha > 0 ? [new ScatterplotLayer({
        id: 'japan-dot',
        data: [{ pos: ROUTE_POINTS[n - 1] }],
        getPosition: d => d.pos,
        getRadius: 130000,
        getFillColor: [34, 211, 238, japanAlpha],
        radiusUnits: 'meters',
      })] : []),

      // Geographic labels
      new TextLayer({
        id: 'labels',
        data: LABELS,
        getPosition: d => d.pos,
        getText: d => d.text,
        getSize: d => d.size,
        getColor: d => d.color,
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 'bold',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'bottom',
        getPixelOffset: [0, -18],
        characterSet: 'auto',
      }),

      // CLOSED label at Hormuz
      ...(hormuzVisible ? [new TextLayer({
        id: 'hormuz-closed',
        data: [{ pos: ROUTE_POINTS[1] }],
        getPosition: d => d.pos,
        getText: () => 'CLOSED · FEB–MAR 2026',
        getSize: 10,
        getColor: [239, 68, 68, 200],
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: 'bold',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'top',
        getPixelOffset: [0, 16],
        characterSet: 'auto',
      })] : []),
    ];
  }, [progress]);

  const callout = step > 0 ? STEP_CALLOUTS[Math.min(step, STEP_CALLOUTS.length - 1)] : null;
  const showStats = progress > 0.95;

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <DeckGL
        initialViewState={INITIAL_VIEW}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', inset: 0 }}
      >
        <MapGL mapStyle={DARK_MAP_STYLE} />
      </DeckGL>

      {/* Stat cards */}
      {showStats && (
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: 12,
          zIndex: 5,
        }}>
          {[
            { label: '97%',  sub: 'LNG via Hormuz',       color: '#FFA35F' },
            { label: '¥2.1T', sub: 'added to import bill', color: '#ef4444' },
            { label: '×2',   sub: 'LNG price increase',   color: '#FFC217' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'rgba(6, 10, 26, 0.92)',
              border: `1px solid ${stat.color}35`,
              borderRadius: 6,
              padding: '10px 20px',
              textAlign: 'center',
              minWidth: 130,
            }}>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 'bold', color: stat.color }}>
                {stat.label}
              </div>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                {stat.sub}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step callout */}
      {callout && (
        <div style={{
          position: 'absolute',
          top: 10,
          left: 10,
          width: 252,
          background: 'rgba(4, 8, 20, 0.94)',
          border: `1px solid ${callout.color}35`,
          borderLeft: `3px solid ${callout.color}`,
          borderRadius: 4,
          padding: '14px 16px',
          zIndex: 10,
          boxShadow: `0 0 28px ${callout.color}14`,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            color: callout.color,
            letterSpacing: '0.18em',
            marginBottom: 6,
          }}>
            {callout.eyebrow}
          </div>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 15,
            fontWeight: 700,
            color: '#f1f5f9',
            lineHeight: 1.25,
            marginBottom: 8,
          }}>
            {callout.title}
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 13,
            color: callout.color,
            marginBottom: 6,
          }}>
            {callout.body}
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: '#94a3b8',
            lineHeight: 1.55,
          }}>
            {callout.sub}
          </div>
        </div>
      )}
    </div>
  );
}
