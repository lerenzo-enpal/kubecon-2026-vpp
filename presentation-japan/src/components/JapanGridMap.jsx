import React, { useState, useEffect, useContext, useMemo } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, LineLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

const FLY_TO = new FlyToInterpolator();

// Japan grid overview camera
const VIEW_OVERVIEW = { longitude: 136.0, latitude: 36.5, zoom: 4.8, pitch: 30, bearing: 5 };
const VIEW_SEAM = { longitude: 137.5, latitude: 35.8, zoom: 5.8, pitch: 35, bearing: -5 };

// Regional utility headquarters/centers
const UTILITIES = [
  { id: 'hokkaido',  pos: [141.35, 43.06], name: 'Hokkaido',   hz: 50, color: [34, 211, 238] },
  { id: 'tohoku',   pos: [140.87, 38.27], name: 'Tohoku',     hz: 50, color: [34, 211, 238] },
  { id: 'tepco',    pos: [139.69, 35.68], name: 'Tokyo/TEPCO', hz: 50, color: [34, 211, 238] },
  { id: 'chubu',    pos: [136.91, 35.18], name: 'Chubu',      hz: 60, color: [255, 194, 23] },
  { id: 'hokuriku', pos: [136.22, 36.69], name: 'Hokuriku',   hz: 60, color: [255, 194, 23] },
  { id: 'kansai',   pos: [135.50, 34.69], name: 'Kansai',     hz: 60, color: [255, 194, 23] },
  { id: 'chugoku',  pos: [132.46, 34.39], name: 'Chugoku',    hz: 60, color: [255, 194, 23] },
  { id: 'shikoku',  pos: [133.53, 33.84], name: 'Shikoku',    hz: 60, color: [255, 194, 23] },
  { id: 'kyushu',   pos: [130.42, 33.59], name: 'Kyushu',     hz: 60, color: [255, 194, 23] },
  { id: 'okinawa',  pos: [127.68, 26.21], name: 'Okinawa',    hz: 60, color: [167, 139, 250] },
];

// HVDC interconnectors (limited cross-frequency capacity)
const HVDC_LINKS = [
  { from: 'tohoku', to: 'tepco',   cap: '1.2 GW', label: '50Hz→50Hz',  color: [34,211,238,200] },
  { from: 'tepco',  to: 'chubu',   cap: '600 MW', label: '50⇄60 Hz',   color: [255,163,95,220], isSeam: true },
  { from: 'chubu',  to: 'kansai',  cap: '600 MW', label: '60→60Hz',    color: [255,194,23,180] },
  { from: 'kansai', to: 'chugoku', cap: '200 MW', label: '60Hz',        color: [255,194,23,180] },
  { from: 'chugoku',to: 'kyushu',  cap: '2.8 GW', label: 'Kanmon DC',  color: [255,194,23,180] },
];

function nodeById(id) { return UTILITIES.find(u => u.id === id); }

const DARK_MAP_STYLE = {
  version: 8,
  sources: { 'carto-dark': { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } },
  layers: [{ id: 'base', type: 'raster', source: 'carto-dark', paint: { 'raster-opacity': 0.7 } }],
};

export function JapanGridMap({ showSeam = false, height = 480 }) {
  const [viewState, setViewState] = useState(showSeam ? VIEW_SEAM : VIEW_OVERVIEW);
  const slideCtx = useContext(SlideContext);
  const isActive = slideCtx?.isSlideActive ?? true;

  useEffect(() => {
    if (!isActive) return;
    const target = showSeam ? VIEW_SEAM : VIEW_OVERVIEW;
    setViewState(vs => ({ ...vs, ...target, transitionDuration: 2000, transitionInterpolator: FLY_TO }));
  }, [showSeam, isActive]);

  const layers = useMemo(() => {
    // HVDC links
    const linkData = HVDC_LINKS.map(link => {
      const src = nodeById(link.from);
      const dst = nodeById(link.to);
      if (!src || !dst) return null;
      return { ...link, sourcePosition: src.pos, targetPosition: dst.pos };
    }).filter(Boolean);

    // 50/60 Hz seam line (approximate geographic boundary through Chubu/Nagano)
    const seamPoints = [
      [137.0, 37.2], [137.3, 36.5], [137.6, 36.0], [137.8, 35.5], [138.0, 35.2],
    ];
    const seamData = seamPoints.slice(0, -1).map((p, i) => ({
      sourcePosition: p,
      targetPosition: seamPoints[i + 1],
    }));

    return [
      // Seam line
      new LineLayer({
        id: 'hz-seam',
        data: seamData,
        getSourcePosition: d => d.sourcePosition,
        getTargetPosition: d => d.targetPosition,
        getColor: [255, 163, 95, 200],
        getWidth: 4,
        widthUnits: 'pixels',
      }),
      // HVDC links
      new LineLayer({
        id: 'hvdc-links',
        data: linkData,
        getSourcePosition: d => d.sourcePosition,
        getTargetPosition: d => d.targetPosition,
        getColor: d => d.isSeam ? [255, 163, 95, 200] : [...(d.color ?? [34,211,238]), 160],
        getWidth: d => d.isSeam ? 3 : 2,
        widthUnits: 'pixels',
      }),
      // Utility nodes
      new ScatterplotLayer({
        id: 'utilities',
        data: UTILITIES,
        getPosition: d => d.pos,
        getRadius: d => d.id === 'tepco' ? 28000 : 22000,
        getFillColor: d => [...d.color, 200],
        getLineColor: d => [...d.color, 255],
        lineWidthMinPixels: 2,
        stroked: true,
        filled: true,
        radiusUnits: 'meters',
      }),
      // Utility labels
      new TextLayer({
        id: 'utility-labels',
        data: UTILITIES,
        getPosition: d => d.pos,
        getText: d => `${d.name}\n${d.hz} Hz`,
        getSize: 13,
        getColor: [241, 245, 249, 255],
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '600',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'bottom',
        getPixelOffset: [0, -28],
        characterSet: 'auto',
      }),
      // HVDC capacity labels (seam only)
      new TextLayer({
        id: 'hvdc-labels',
        data: linkData.filter(d => d.isSeam),
        getPosition: d => [
          (d.sourcePosition[0] + d.targetPosition[0]) / 2,
          (d.sourcePosition[1] + d.targetPosition[1]) / 2,
        ],
        getText: d => `${d.cap}\n${d.label}`,
        getSize: 12,
        getColor: [255, 163, 95, 255],
        fontFamily: 'JetBrains Mono, monospace',
        fontWeight: '700',
        getTextAnchor: 'middle',
        getAlignmentBaseline: 'center',
        characterSet: 'auto',
      }),
    ];
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', inset: 0 }}
      >
        <MapGL mapStyle={DARK_MAP_STYLE} />
      </DeckGL>
      {/* Seam legend overlay */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16,
        background: 'rgba(6,10,26,0.85)', border: '1px solid rgba(255,163,95,0.4)',
        borderRadius: 6, padding: '8px 14px',
        fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#94a3b8',
      }}>
        <div style={{ color: '#FFA35F', fontWeight: 700, marginBottom: 4 }}>50 ⇄ 60 Hz Seam</div>
        <div>Only 1.2 GW conversion capacity</div>
        <div style={{ color: '#22d3ee', marginTop: 4 }}>● 50 Hz (East)</div>
        <div style={{ color: '#FFC217' }}>● 60 Hz (West)</div>
      </div>
    </div>
  );
}
