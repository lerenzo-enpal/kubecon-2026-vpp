import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ScatterplotLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ATLAS_FEATURES } from '../data/japanGridAtlasData.mjs';
import { PLANT_COLORS, FUEL_ICONS, FREQUENCY_COLORS } from './JapanGridAtlas.jsx';

const FLY_TO = new FlyToInterpolator();
const FREQ_SEAM_LON = 137.4;

const MAP_STYLE = {
  version: 8,
  sources: { base: { type: 'raster', tiles: ['https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'], tileSize: 256 } },
  layers: [{ id: 'base', type: 'raster', source: 'base', paint: { 'raster-opacity': 0.7 } }],
};

const PLANT_BY_NAME = new Map(ATLAS_FEATURES.plants.map((p) => [p.name, p]));
const getPlant = (name) => PLANT_BY_NAME.get(name);
const parseGW = (str) => { const n = parseFloat(str); return Number.isFinite(n) ? n : 0.1; };

const VIEWS = {
  overview: { longitude: 138.8, latitude: 37.4, zoom: 5.4, pitch: 40, bearing: 6 },
  tohoku:   { longitude: 141.2, latitude: 38.3, zoom: 6.4, pitch: 45, bearing: -4 },
  kanto:    { longitude: 140.0, latitude: 35.9, zoom: 6.6, pitch: 48, bearing: 2 },
  seam:     { longitude: 137.6, latitude: 36.0, zoom: 6.2, pitch: 42, bearing: -6 },
  hokkaido: { longitude: 141.5, latitude: 42.6, zoom: 5.6, pitch: 42, bearing: 8 },
  wide:     { longitude: 138.5, latitude: 37.0, zoom: 5.2, pitch: 30, bearing: 4 },
};

// Cascade sequence — March 2022 Fukushima-oki quake + cold-snap chain that produced
// Japan's first-ever power supply emergency warning (reserve margin 2.5%).
const CASCADE = [
  { ts: 'MAR 16 · 23:36 JST', view: VIEWS.tohoku,
    label: 'M7.4 offshore Fukushima — Tohoku trips cascade',
    detail: 'Onagawa, Higashidori scram · thermal plants drop off',
    trips: ['Onagawa', 'Higashidori', 'Hitachinaka', 'Kashima'], severity: 'crit' },
  { ts: 'MAR 17 · 06:00',    view: VIEWS.kanto,
    label: 'Restart delays ripple south — Kanto LNG absorbs load',
    detail: '6.5 GW east-coast thermal offline · JERA fleet redlines',
    trips: ['Fukushima Daini', 'Futtsu'], severity: 'crit' },
  { ts: 'MAR 21 · 18:00',    view: VIEWS.hokkaido,
    label: 'Arctic front sweeps south from Hokkaido',
    detail: 'Tokyo forecast -3°C · heating demand jumps 15%',
    trips: [], severity: 'warn' },
  { ts: 'MAR 22 · 08:00',    view: VIEWS.kanto,
    label: 'Overcast + still air — wind + solar collapse',
    detail: 'Renewables <5% of expected · LNG stockpiles thin',
    trips: ['Anegasaki'], severity: 'warn' },
  { ts: 'MAR 22 · 09:00',    view: VIEWS.seam,
    label: 'Frequency Converter maxed — 2.1 GW cap west→east',
    detail: '50 Hz Tokyo cannot pull enough from 60 Hz Kansai',
    trips: [], severity: 'crit' },
  { ts: 'MAR 22 · 11:00',    view: VIEWS.kanto,
    label: 'METI: first-ever POWER SUPPLY EMERGENCY WARNING',
    detail: 'Reserve margin 2.5% · below 3% safety threshold',
    trips: ['Higashi-Ohgishima'], severity: 'crit' },
  { ts: 'MAR 22 · 15:00',    view: VIEWS.kanto,
    label: 'Public conservation call — 3M homes dim lights',
    detail: 'JEPX spot spikes · 40-day price memory reopens',
    trips: [], severity: 'crit' },
  { ts: 'MAR 22 · 21:00',    view: VIEWS.overview,
    label: 'Blackout averted — but the precedent is set',
    detail: 'Every winter now carries this shape',
    trips: [], severity: 'crit' },
];

const LOG_MSGS = [
  { step: 0, text: 'SEISMIC EVENT M7.4 — FUKUSHIMA-OKI', level: 'crit' },
  { step: 0, text: 'AUTO-SCRAM: ONAGAWA, HIGASHIDORI', level: 'crit' },
  { step: 1, text: 'THERMAL FLEET OFFLINE — 6.5 GW LOST', level: 'crit' },
  { step: 2, text: 'TEMP: -3°C FORECAST · DEMAND +15%', level: 'warn' },
  { step: 3, text: 'WIND / SOLAR GENERATION < 5% EXPECTED', level: 'warn' },
  { step: 4, text: 'FC LINK SATURATED · 2.1 GW MAX WEST→EAST', level: 'crit' },
  { step: 5, text: 'RESERVE MARGIN 2.5% — BELOW SAFETY', level: 'crit' },
  { step: 5, text: 'METI ISSUES FIRST-EVER SUPPLY WARNING', level: 'crit' },
  { step: 6, text: 'JEPX SPOT SPIKE · MEMORY OF JAN 2021', level: 'warn' },
  { step: 7, text: 'BLACKOUT AVERTED — MARGIN RESTORED 08:00', level: 'crit' },
];

const INCIDENT_MS = 2500;
const FAILED = [239, 68, 68];
const AMBER = [217, 119, 6];

function useSlideActive() {
  // Simple heuristic — component only mounts inside an active Spectacle slide via StepBridge
  return true;
}

export default function JapanColdSnapCascade({ step = 0 }) {
  const hudVisible = step >= 1;
  const cascadeIdx = step >= 2 ? Math.min(step - 2, CASCADE.length - 1) : -1;
  const active = cascadeIdx >= 0 ? CASCADE[cascadeIdx] : null;

  const [pulse, setPulse] = useState(() => Date.now());
  const pulseRef = useRef(null);
  const [incident, setIncident] = useState(new Map());
  const incidentTimers = useRef([]);
  const [viewState, setViewState] = useState(VIEWS.overview);

  // Failed plants accumulate up to current step
  const failed = useMemo(() => {
    const s = new Set();
    if (cascadeIdx < 0) return s;
    for (let i = 0; i <= cascadeIdx; i++) CASCADE[i].trips.forEach((n) => s.add(n));
    return s;
  }, [cascadeIdx]);

  // Camera fly-to on step change
  useEffect(() => {
    const target = cascadeIdx >= 0 ? active.view : VIEWS.overview;
    setViewState({
      ...target,
      transitionDuration: 900,
      transitionInterpolator: FLY_TO,
      transitionEasing: (t) => 1 - Math.pow(1 - t, 3),
    });
  }, [cascadeIdx]);

  // Trigger amber incident glow for current step's trips
  useEffect(() => {
    if (cascadeIdx < 0) return;
    incidentTimers.current.forEach(clearTimeout);
    incidentTimers.current = [];
    const now = Date.now();
    setIncident((prev) => {
      const next = new Map(prev);
      active.trips.forEach((n) => next.set(n, now));
      return next;
    });
    const timer = setTimeout(() => {
      setIncident((prev) => {
        const next = new Map(prev);
        active.trips.forEach((n) => next.delete(n));
        return next;
      });
    }, INCIDENT_MS);
    incidentTimers.current.push(timer);
    return () => { incidentTimers.current.forEach(clearTimeout); };
  }, [cascadeIdx]);

  // Pulse loop while any incident is amber
  useEffect(() => {
    if (incident.size === 0) { cancelAnimationFrame(pulseRef.current); return; }
    const tick = () => { setPulse(Date.now()); pulseRef.current = requestAnimationFrame(tick); };
    pulseRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(pulseRef.current);
  }, [incident.size > 0]);

  // Derived readouts
  const eastFailed = [...failed].filter((n) => (getPlant(n)?.position?.[0] ?? 0) >= FREQ_SEAM_LON).length;
  const totalFailedGW = [...failed].reduce((sum, n) => sum + parseGW(getPlant(n)?.capacity ?? '0'), 0);
  const freq50 = Math.max(49.2, 50.0 - eastFailed * 0.08 - (cascadeIdx >= 4 ? 0.15 : 0)) + Math.sin(Date.now() / 320) * 0.008;
  const freq60 = Math.max(59.5, 60.0 - (failed.size - eastFailed) * 0.05) + Math.sin(Date.now() / 280) * 0.006;
  const reserveMargin = cascadeIdx >= 5 ? 2.5 : cascadeIdx >= 3 ? 4.8 : cascadeIdx >= 2 ? 7.2 : cascadeIdx >= 0 ? 5.5 : 12.0;
  const emergency = reserveMargin < 3.0;

  // Layers
  const layers = useMemo(() => {
    const plants = ATLAS_FEATURES.plants;
    const base = new ScatterplotLayer({
      id: 'cascade-plants', data: plants, getPosition: (d) => d.position,
      getRadius: (d) => {
        const base = 6 + 5 * Math.sqrt(parseGW(d.capacity));
        if (incident.has(d.name)) {
          const age = pulse - incident.get(d.name);
          const p = Math.min(1, age / INCIDENT_MS);
          return base * (1 + 0.35 * (1 - p) * Math.abs(Math.sin(pulse / 120)));
        }
        return base;
      },
      radiusUnits: 'pixels',
      getFillColor: (d) => {
        if (incident.has(d.name)) {
          const age = pulse - incident.get(d.name);
          const progress = Math.min(1, age / INCIDENT_MS);
          const blend = progress < 0.6 ? 0 : (progress - 0.6) / 0.4;
          return [
            AMBER[0] + (FAILED[0] - AMBER[0]) * blend,
            AMBER[1] + (FAILED[1] - AMBER[1]) * blend,
            AMBER[2] + (FAILED[2] - AMBER[2]) * blend,
            230,
          ];
        }
        if (failed.has(d.name)) return [...FAILED, 200];
        const c = PLANT_COLORS[d.fuel] ?? [148, 163, 184, 200];
        return [c[0], c[1], c[2], 200];
      },
      getLineColor: (d) => failed.has(d.name) || incident.has(d.name) ? [255, 220, 220, 255] : [237, 233, 254, 220],
      stroked: true, lineWidthMinPixels: 1.5, pickable: true,
      updateTriggers: { getRadius: [failed, incident, pulse], getFillColor: [failed, incident, pulse] },
    });
    const icons = new TextLayer({
      id: 'cascade-icons', data: plants, getPosition: (d) => d.position,
      getText: (d) => FUEL_ICONS[d.fuel] ?? '', getSize: 11, sizeUnits: 'pixels',
      getColor: [11, 18, 32, 255], getTextAnchor: 'middle', getAlignmentBaseline: 'center',
      fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      fontWeight: 700, characterSet: 'auto', billboard: true,
    });
    const xMarks = new TextLayer({
      id: 'cascade-x', data: plants.filter((p) => failed.has(p.name) && !incident.has(p.name)),
      getPosition: (d) => d.position, getText: () => '✕', getSize: 20,
      getColor: [239, 68, 68, 255], getTextAnchor: 'middle', getAlignmentBaseline: 'center',
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
    });
    return [base, icons, xMarks];
  }, [failed, incident, pulse]);

  const dangerColor = emergency ? '#ef4444' : '#22d3ee';
  const borderClr = emergency ? 'rgba(239,68,68,0.5)' : 'rgba(34,211,238,0.35)';
  const panelBase = {
    background: 'rgba(5, 8, 16, 0.92)',
    border: `1px solid ${borderClr}`,
    boxShadow: `0 0 20px ${dangerColor}18, inset 0 0 15px ${dangerColor}06`,
    backdropFilter: 'blur(12px)',
    transition: 'border-color 0.6s, box-shadow 0.6s',
    position: 'relative',
    borderRadius: 3,
  };

  const recentLogs = LOG_MSGS.filter((m) => cascadeIdx >= 0 && m.step <= cascadeIdx).slice(-5);

  return (
    <div data-testid="japan-cold-snap-cascade" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: '#020408' }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', inset: 0 }}
        getTooltip={({ object }) => object?.name ? { text: `${object.name}\n${object.fuel} · ${object.capacity}` } : null}
      >
        <MapGL mapStyle={MAP_STYLE} style={{ width: '100%', height: '100%' }} />
      </DeckGL>

      {/* Scanline */}
      {hudVisible && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5,
          background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)' }} />
      )}
      {/* Vignette */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 4,
        boxShadow: emergency ? 'inset 0 0 160px 60px rgba(239,68,68,0.14)' : 'inset 0 0 120px 40px rgba(2,4,8,0.7)' }} />

      {/* ── Left: Timeline Panel ── */}
      {hudVisible && (
        <div style={{ ...panelBase, position: 'absolute', top: 12, left: 12, width: 380, maxHeight: 'calc(100% - 24px)',
          zIndex: 10, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px', borderBottom: `1px solid ${borderClr}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: emergency ? '#ef4444' : '#22d3ee',
              boxShadow: `0 0 10px ${emergency ? '#ef4444' : '#22d3ee'}` }} />
            <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-mono)', color: '#94a3b8', letterSpacing: '0.12em' }}>OCCTO GRID MONITOR</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', color: '#64748bcc' }}>MAR 2022</span>
          </div>
          <div style={{ flex: 1, overflowY: 'hidden', padding: '10px 16px' }}>
            {CASCADE.map((s, i) => {
              const isActive = cascadeIdx >= i;
              const isCurrent = cascadeIdx === i;
              return (
                <div key={i} style={{ marginBottom: 8,
                  opacity: isActive ? 1 : 0.25,
                  transition: 'opacity 0.4s, transform 0.4s',
                  borderLeft: isCurrent ? `2px solid ${s.severity === 'crit' ? '#ef4444' : '#f59e0b'}` : '2px solid transparent',
                  paddingLeft: isCurrent ? 10 : 12,
                  transform: `translateX(${isActive ? 0 : -12}px)` }}>
                  <div style={{ fontSize: 13, fontFamily: 'var(--font-heading), Inter, sans-serif',
                    color: isActive ? (isCurrent ? '#f1f5f9' : '#f1f5f9bb') : '#64748b40',
                    fontWeight: isCurrent ? 600 : 400, display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 700,
                      color: isActive ? (s.severity === 'crit' ? '#ef4444' : '#f59e0b') : '#64748b30', flexShrink: 0 }}>{s.ts}</span>
                    <span>{s.label}</span>
                  </div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2,
                    color: isActive ? '#94a3b8' : '#64748b20' }}>{s.detail}</div>
                </div>
              );
            })}
          </div>
          {/* Terminal log */}
          <div style={{ borderTop: `1px solid ${borderClr}`, padding: '8px 14px', minHeight: 90, maxHeight: 130, overflow: 'hidden', background: 'rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: '#64748b80', letterSpacing: '0.1em', marginBottom: 4 }}>SYSTEM LOG</div>
            {recentLogs.length === 0 ? (
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: '#22d3eecc' }}>&gt; awaiting events…</div>
            ) : recentLogs.map((m, i) => (
              <div key={`${m.step}-${m.text}`} style={{ fontSize: 11, fontFamily: 'var(--font-mono)',
                opacity: i === recentLogs.length - 1 ? 1 : 0.55,
                color: m.level === 'crit' ? '#ef4444' : '#f59e0b', marginBottom: 2, lineHeight: 1.4 }}>
                &gt; {m.text}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Right: Dual-frequency + reserve margin ── */}
      {hudVisible && (
        <div style={{ ...panelBase, position: 'absolute', top: 12, right: 12, zIndex: 10, padding: '14px 20px', minWidth: 220 }}>
          <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#64748bcc', letterSpacing: '0.1em', marginBottom: 6 }}>FREQUENCY · EAST 50 Hz</div>
          <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: freq50 < 49.7 ? '#ef4444' : freq50 < 49.9 ? '#f59e0b' : '#22d3ee',
            textShadow: `0 0 20px ${freq50 < 49.7 ? '#ef444440' : '#22d3ee40'}` }}>
            {freq50.toFixed(3)} <span style={{ fontSize: 14 }}>Hz</span>
          </div>

          <div style={{ marginTop: 10, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#64748bcc', letterSpacing: '0.1em', marginBottom: 6 }}>FREQUENCY · WEST 60 Hz</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: freq60 < 59.85 ? '#f59e0b' : '#ffc217' }}>
            {freq60.toFixed(3)} <span style={{ fontSize: 12 }}>Hz</span>
          </div>

          <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${borderClr}` }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#64748b80', letterSpacing: '0.1em', marginBottom: 4 }}>RESERVE MARGIN</div>
            <div style={{ fontSize: 26, fontFamily: 'var(--font-mono)', color: emergency ? '#ef4444' : '#22d3ee', fontWeight: 800,
              textShadow: emergency ? '0 0 18px #ef444450' : 'none',
              opacity: emergency ? Math.sin(Date.now() / 300) * 0.15 + 0.85 : 1 }}>
              {reserveMargin.toFixed(1)}<span style={{ fontSize: 14, marginLeft: 3 }}>%</span>
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', marginTop: 2,
              color: emergency ? '#ef4444' : '#94a3b8', fontWeight: 600 }}>
              {emergency ? '⚠ EMERGENCY · <3% THRESHOLD' : 'above safety threshold'}
            </div>
            <div style={{ marginTop: 6, height: 4, background: 'rgba(239,68,68,0.15)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 2, background: emergency ? '#ef4444' : '#22d3ee',
                width: `${Math.max(4, Math.min(100, reserveMargin * 8))}%`, transition: 'width 0.6s, background 0.4s' }} />
            </div>
          </div>

          <div style={{ marginTop: 10, paddingTop: 8, borderTop: `1px solid ${borderClr}` }}>
            <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: '#64748b80', letterSpacing: '0.1em', marginBottom: 3 }}>CAPACITY OFFLINE</div>
            <div style={{ fontSize: 18, fontFamily: 'var(--font-mono)', color: '#ef4444', fontWeight: 700 }}>
              {totalFailedGW.toFixed(1)} <span style={{ fontSize: 11, color: '#ef4444aa' }}>GW</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom: compact step dots + legend ── */}
      {hudVisible && (
        <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {CASCADE.map((s, i) => {
              const isActive = cascadeIdx >= i;
              const isCurrent = cascadeIdx === i;
              const color = s.severity === 'crit' ? '#ef4444' : '#f59e0b';
              return (
                <div key={i} style={{ width: isCurrent ? 32 : isActive ? 22 : 14, height: 4, borderRadius: 2,
                  background: isActive ? color : 'rgba(100,116,139,0.25)',
                  transition: 'all 0.4s', boxShadow: isActive ? `0 0 8px ${color}80` : 'none' }} />
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            {[['50 Hz east', FREQUENCY_COLORS['50 Hz']], ['60 Hz west', FREQUENCY_COLORS['60 Hz']]].map(([l, c]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: `rgb(${c[0]},${c[1]},${c[2]})` }} />
                <span style={{ fontSize: 10, color: '#94a3b8', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em' }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Dramatic event card (bottom-anchored to keep center of map clear) ── */}
      {hudVisible && active && (
        <div style={{ position: 'absolute', bottom: emergency ? 140 : 70, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
          textAlign: 'center', pointerEvents: 'none', maxWidth: 720, padding: '10px 24px',
          background: 'linear-gradient(180deg, rgba(11,18,32,0) 0%, rgba(11,18,32,0.55) 55%, rgba(11,18,32,0.7) 100%)',
          borderRadius: 6 }}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700,
            color: active.severity === 'crit' ? '#ef4444' : '#f59e0b',
            textShadow: '0 0 20px rgba(0,0,0,0.9)', letterSpacing: '0.12em', marginBottom: 6 }}>
            {active.ts}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: 'var(--font-heading), Inter, sans-serif',
            color: emergency && cascadeIdx >= 5 ? '#ef4444' : '#f1f5f9',
            textShadow: '0 0 40px rgba(0,0,0,0.95), 0 0 80px rgba(0,0,0,0.8)' }}>
            {active.label}
          </div>
          <div style={{ fontSize: 13, fontFamily: 'var(--font-mono)', color: '#cbd5e1',
            textShadow: '0 0 15px rgba(0,0,0,0.9)', marginTop: 6 }}>
            {active.detail}
          </div>
        </div>
      )}

      {/* Warning banner */}
      {hudVisible && emergency && (
        <div style={{ position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)', zIndex: 10,
          padding: '12px 32px', borderRadius: 4, background: 'rgba(239,68,68,0.12)',
          border: '1px solid rgba(239,68,68,0.5)', backdropFilter: 'blur(10px)',
          boxShadow: '0 0 40px rgba(239,68,68,0.18)' }}>
          <span style={{ fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#ef4444',
            textShadow: '0 0 15px rgba(239,68,68,0.5)',
            opacity: Math.sin(Date.now() / 300) * 0.2 + 0.8, letterSpacing: '0.08em' }}>
            {'⚠'} SUPPLY EMERGENCY · RESERVE {reserveMargin.toFixed(1)}% {'⚠'}
          </span>
        </div>
      )}
    </div>
  );
}
