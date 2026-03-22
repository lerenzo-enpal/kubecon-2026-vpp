import React, { useState, useEffect, useCallback, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { ScatterplotLayer, ArcLayer, LineLayer, TextLayer } from '@deck.gl/layers';
import { TripsLayer } from '@deck.gl/geo-layers';
import Map from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useMapStyle } from '../utils/mapStyle';

const INITIAL_VIEW = {
  longitude: -98.5,
  latitude: 31.0,
  zoom: 5.3,
  pitch: 30,
  bearing: 0,
};

// Power plants with real coordinates
const PLANTS = [
  { id: 'amarillo', pos: [-101.83, 35.22], type: 'wind', cap: 4.0, name: 'Amarillo Wind' },
  { id: 'lubbock', pos: [-101.85, 33.58], type: 'wind', cap: 3.2, name: 'Lubbock Wind' },
  { id: 'roscoe', pos: [-100.5, 32.45], type: 'wind', cap: 2.5, name: 'Roscoe Wind Farm' },
  { id: 'midland', pos: [-102.08, 31.99], type: 'gas', cap: 2.1, name: 'Midland/Odessa Gas' },
  { id: 'abilene', pos: [-99.73, 32.45], type: 'gas', cap: 1.8, name: 'Abilene Gas' },
  { id: 'dfw', pos: [-96.80, 32.78], type: 'gas', cap: 6.5, name: 'Dallas/Fort Worth' },
  { id: 'midlothian', pos: [-96.99, 32.48], type: 'gas', cap: 1.6, name: 'Midlothian' },
  { id: 'forney', pos: [-96.47, 32.75], type: 'gas', cap: 1.9, name: 'Forney Energy' },
  { id: 'comanche', pos: [-97.79, 32.30], type: 'nuclear', cap: 2.3, name: 'Comanche Peak' },
  { id: 'martin', pos: [-94.57, 32.26], type: 'coal', cap: 2.3, name: 'Martin Lake' },
  { id: 'waco', pos: [-97.15, 31.55], type: 'gas', cap: 1.5, name: 'Waco' },
  { id: 'limestone', pos: [-96.54, 31.43], type: 'coal', cap: 1.9, name: 'Limestone' },
  { id: 'oakgrove', pos: [-96.50, 31.05], type: 'coal', cap: 1.8, name: 'Oak Grove' },
  { id: 'austin', pos: [-97.74, 30.27], type: 'gas', cap: 2.8, name: 'Austin' },
  { id: 'sanantonio', pos: [-98.49, 29.42], type: 'gas', cap: 3.5, name: 'San Antonio' },
  { id: 'houston', pos: [-95.37, 29.76], type: 'gas', cap: 8.0, name: 'Houston' },
  { id: 'parish', pos: [-95.63, 29.48], type: 'coal', cap: 3.7, name: 'W.A. Parish' },
  { id: 'cedarbayou', pos: [-94.97, 29.77], type: 'gas', cap: 1.5, name: 'Cedar Bayou' },
  { id: 'stp', pos: [-96.05, 28.80], type: 'nuclear', cap: 2.7, name: 'STP Nuclear' },
  { id: 'corpus', pos: [-97.40, 27.80], type: 'gas', cap: 1.8, name: 'Corpus Christi' },
];

const TRANSMISSION_LINES = [
  ['amarillo', 'lubbock'], ['lubbock', 'roscoe'], ['roscoe', 'abilene'],
  ['abilene', 'dfw'], ['abilene', 'waco'], ['midland', 'abilene'],
  ['midland', 'sanantonio'], ['dfw', 'midlothian'], ['dfw', 'forney'],
  ['dfw', 'comanche'], ['comanche', 'waco'], ['dfw', 'martin'],
  ['waco', 'austin'], ['waco', 'limestone'], ['limestone', 'oakgrove'],
  ['austin', 'sanantonio'], ['oakgrove', 'austin'], ['houston', 'parish'],
  ['houston', 'cedarbayou'], ['houston', 'austin'], ['houston', 'stp'],
  ['sanantonio', 'corpus'], ['stp', 'corpus'], ['martin', 'forney'],
];

const CASCADE_TIMELINE = [
  { time: 0, ids: ['amarillo', 'lubbock', 'roscoe'] },
  { time: 3, ids: ['midland'] },
  { time: 5, ids: ['abilene'] },
  { time: 6, ids: ['midlothian', 'forney'] },
  { time: 7, ids: ['martin', 'limestone'] },
  { time: 8, ids: ['oakgrove', 'parish'] },
  { time: 9, ids: ['cedarbayou', 'waco'] },
  { time: 10, ids: ['stp'] },
  { time: 11, ids: ['corpus', 'sanantonio', 'austin'] },
  { time: 13, ids: ['houston', 'dfw'] },
];

const TYPE_COLORS = {
  wind: [96, 165, 250],
  gas: [251, 146, 60],
  coal: [148, 163, 184],
  nuclear: [167, 139, 250],
};

const FAILED_COLOR = [239, 68, 68];
const COMANCHE_ACTIVE = [16, 185, 129];

function getPlant(id) {
  return PLANTS.find(p => p.id === id);
}

export default function TexasMapGL({ width = 960, height = 600 }) {
  const mapStyle = useMapStyle('texas', 'labeled');
  const [failed, setFailed] = useState(new Set());
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  const slideContext = useContext(SlideContext);
  useEffect(() => {
    if (slideContext?.isSlideActive) {
      setFailed(new Set());
      setRunning(false);
      setElapsed(0);
    }
  }, [slideContext?.isSlideActive]);

  // Animation loop
  useEffect(() => {
    if (!running) return;
    const start = performance.now();
    let raf;
    const tick = () => {
      const sec = (performance.now() - start) / 1000;
      setElapsed(sec);
      const newFailed = new Set();
      CASCADE_TIMELINE.forEach(step => {
        if (sec > step.time) step.ids.forEach(id => newFailed.add(id));
      });
      newFailed.delete('comanche'); // never fails
      setFailed(newFailed);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const trigger = () => { setFailed(new Set()); setElapsed(0); setRunning(true); };
  const reset = () => { setFailed(new Set()); setElapsed(0); setRunning(false); };

  // Build line data
  const lines = TRANSMISSION_LINES.map(([a, b]) => {
    const pA = getPlant(a), pB = getPlant(b);
    const aFailed = failed.has(a), bFailed = failed.has(b);
    return {
      from: pA.pos,
      to: pB.pos,
      color: aFailed && bFailed ? [239, 68, 68, 40] : aFailed || bFailed ? [239, 68, 68, 100] : [34, 211, 238, 60],
    };
  });

  // Build arc data for energy flow (only on active lines)
  const arcs = TRANSMISSION_LINES
    .filter(([a, b]) => !failed.has(a) && !failed.has(b))
    .map(([a, b]) => ({
      from: getPlant(a).pos,
      to: getPlant(b).pos,
    }));

  const layers = [
    // Transmission lines
    new LineLayer({
      id: 'transmission',
      data: lines,
      getSourcePosition: d => d.from,
      getTargetPosition: d => d.to,
      getColor: d => d.color,
      getWidth: 2,
      widthMinPixels: 1,
    }),

    // Energy flow arcs (only active lines)
    new ArcLayer({
      id: 'flow',
      data: arcs,
      getSourcePosition: d => d.from,
      getTargetPosition: d => d.to,
      getSourceColor: [34, 211, 238, 80],
      getTargetColor: [34, 211, 238, 80],
      getWidth: 1,
      getHeight: 0.15,
    }),

    // Plant nodes
    new ScatterplotLayer({
      id: 'plants',
      data: PLANTS,
      getPosition: d => d.pos,
      getRadius: d => {
        if (d.id === 'comanche' && running) return 15000;
        return 6000 + d.cap * 2000;
      },
      getFillColor: d => {
        if (d.id === 'comanche' && running) return [...COMANCHE_ACTIVE, 200];
        if (failed.has(d.id)) return [...FAILED_COLOR, 180];
        return [...TYPE_COLORS[d.type], 180];
      },
      getLineColor: d => {
        if (d.id === 'comanche' && running) return [...COMANCHE_ACTIVE, 255];
        if (failed.has(d.id)) return [...FAILED_COLOR, 255];
        return [...TYPE_COLORS[d.type], 255];
      },
      stroked: true,
      lineWidthMinPixels: 2,
      radiusMinPixels: 4,
      radiusMaxPixels: 20,
      pickable: true,
      transitions: { getFillColor: 500, getRadius: 300 },
    }),

    // Failed X marks (using text layer)
    new TextLayer({
      id: 'failed-marks',
      data: PLANTS.filter(p => failed.has(p.id)),
      getPosition: d => d.pos,
      getText: () => '✕',
      getSize: 18,
      getColor: [239, 68, 68, 255],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      fontFamily: 'JetBrains Mono',
      fontWeight: 'bold',
    }),

    // Plant labels
    new TextLayer({
      id: 'labels',
      data: PLANTS,
      getPosition: d => d.pos,
      getText: d => d.name,
      getSize: 11,
      getColor: d => failed.has(d.id) ? [239, 68, 68, 150] : [241, 245, 249, 160],
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'top',
      getPixelOffset: [0, 16],
      fontFamily: 'Inter',
    }),
  ];

  const mwOffline = Math.min(52277, Math.floor(failed.size / PLANTS.length * 52277));

  return (
    <div style={{ position: 'relative', width, height, borderRadius: 8, overflow: 'hidden' }}>
      <DeckGL
        initialViewState={INITIAL_VIEW}
        controller={true}
        layers={layers}
        width={width}
        height={height}
        style={{ position: 'absolute' }}
      >
        <Map
          mapStyle={mapStyle}
          style={{ width: '100%', height: '100%' }}
        />
      </DeckGL>

      {/* HUD overlay */}
      <div style={{ position: 'absolute', top: 10, left: 14, zIndex: 10 }}>
        <div style={{ fontSize: '22px', fontWeight: 800, fontFamily: '"JetBrains Mono"', color: running && elapsed > 10 ? '#ef4444' : '#22d3ee', textShadow: '0 0 12px rgba(0,0,0,0.8)' }}>
          {running ? `${(50 - failed.size * 0.35 - Math.max(0, elapsed - 2) * 0.06).toFixed(3)} Hz` : '50.000 Hz'}
        </div>
        {running && (
          <div style={{ fontSize: '14px', fontFamily: '"JetBrains Mono"', color: '#ef4444', textShadow: '0 0 8px rgba(0,0,0,0.8)', marginTop: 4 }}>
            {mwOffline.toLocaleString()} MW OFFLINE
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ position: 'absolute', bottom: 40, left: 14, zIndex: 10, display: 'flex', gap: 12 }}>
        {[
          { c: 'rgb(96,165,250)', l: 'Wind' },
          { c: 'rgb(251,146,60)', l: 'Gas' },
          { c: 'rgb(148,163,184)', l: 'Coal' },
          { c: 'rgb(167,139,250)', l: 'Nuclear' },
        ].map(i => (
          <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: i.c }} />
            <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: '"Inter"', textShadow: '0 0 4px rgba(0,0,0,0.8)' }}>{i.l}</span>
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ position: 'absolute', bottom: 10, right: 14, zIndex: 10, display: 'flex', gap: 6 }}>
        <button onClick={reset} style={{
          background: 'rgba(26,34,54,0.9)', border: '1px solid rgba(36,48,73,0.8)',
          color: '#94a3b8', padding: '5px 12px', borderRadius: 6,
          cursor: 'pointer', fontSize: 11, fontFamily: '"JetBrains Mono"',
        }}>Reset</button>
        <button onClick={trigger} style={{
          background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.5)',
          color: '#ef4444', padding: '5px 12px', borderRadius: 6,
          cursor: 'pointer', fontSize: 11, fontFamily: '"JetBrains Mono"', fontWeight: 600,
        }}>Winter Storm Uri</button>
      </div>

      {/* 4:37 warning */}
      {running && elapsed > 12 && (
        <div style={{
          position: 'absolute', bottom: 44, left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, padding: '8px 20px', borderRadius: 8,
          background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
          animation: 'pulse 0.5s ease-in-out infinite alternate',
        }}>
          <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: '"JetBrains Mono"', color: '#ef4444' }}>
            ⚠ 4 MINUTES 37 SECONDS FROM TOTAL GRID COLLAPSE ⚠
          </span>
        </div>
      )}
    </div>
  );
}
