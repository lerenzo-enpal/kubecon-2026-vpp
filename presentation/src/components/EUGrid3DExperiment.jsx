import React, { useState, useEffect, useContext, useMemo } from 'react';
import { SlideContext } from 'spectacle';
import { DeckGL } from '@deck.gl/react';
import { FlyToInterpolator } from '@deck.gl/core';
import { ColumnLayer, SolidPolygonLayer, LineLayer, TextLayer } from '@deck.gl/layers';
import MapGL from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { colors } from '../theme';
import { useMapStyle } from '../utils/mapStyle';

// ── Helper: offset a [lng, lat] by meters ──
function offsetMeters(center, dx, dy) {
  const [lng, lat] = center;
  const mPerDegLat = 111320;
  const mPerDegLng = 111320 * Math.cos((lat * Math.PI) / 180);
  return [lng + dx / mPerDegLng, lat + dy / mPerDegLat];
}

// ── Helper: make a rectangle polygon around center ──
function rectPoly(center, widthM, heightM) {
  const hw = widthM / 2, hh = heightM / 2;
  return [
    offsetMeters(center, -hw, -hh),
    offsetMeters(center, hw, -hh),
    offsetMeters(center, hw, hh),
    offsetMeters(center, -hw, hh),
  ];
}

// ── Colors by type ──
const TYPE_COLORS = {
  coal:    { building: [100, 116, 139], stack: [148, 163, 184], accent: [120, 130, 150] },
  gas:     { building: [180, 100, 30],  stack: [251, 146, 60],  accent: [220, 130, 50] },
  nuclear: { building: [100, 80, 160],  stack: [167, 139, 250], accent: [140, 120, 200] },
  wind:    { building: [30, 140, 120],  stack: [16, 185, 129],  accent: [20, 160, 140] },
};

// ── Generate procedural shapes for each plant type ──
// Returns { columns: [...], polygons: [...] }
function generatePlantShapes(plant) {
  const { pos, type } = plant;
  const c = TYPE_COLORS[type] || TYPE_COLORS.coal;
  const columns = [];
  const polygons = [];

  if (type === 'coal') {
    // Main building: wide rectangular hall
    polygons.push({
      polygon: rectPoly(pos, 300, 200),
      elevation: 40,
      color: c.building,
    });
    // Secondary building
    polygons.push({
      polygon: rectPoly(offsetMeters(pos, -200, 0), 120, 150),
      elevation: 25,
      color: [...c.building.map(v => Math.min(255, v + 20))],
    });
    // Two tall smokestacks
    columns.push({
      position: offsetMeters(pos, 100, 60),
      radius: 15, elevation: 120,
      color: c.stack,
    });
    columns.push({
      position: offsetMeters(pos, 140, 60),
      radius: 12, elevation: 100,
      color: c.stack,
    });
    // Coal storage yard
    polygons.push({
      polygon: rectPoly(offsetMeters(pos, 0, -180), 250, 80),
      elevation: 8,
      color: [60, 60, 60],
    });
  }

  if (type === 'gas') {
    // Turbine hall
    polygons.push({
      polygon: rectPoly(pos, 200, 120),
      elevation: 30,
      color: c.building,
    });
    // Single tall stack
    columns.push({
      position: offsetMeters(pos, 80, 0),
      radius: 12, elevation: 90,
      color: c.stack,
    });
    // Heat recovery unit
    polygons.push({
      polygon: rectPoly(offsetMeters(pos, -130, 0), 80, 100),
      elevation: 35,
      color: c.accent,
    });
  }

  if (type === 'nuclear') {
    // Reactor containment domes (large columns = cylinders)
    columns.push({
      position: offsetMeters(pos, -60, 0),
      radius: 50, elevation: 60,
      color: c.building,
    });
    columns.push({
      position: offsetMeters(pos, 60, 0),
      radius: 50, elevation: 60,
      color: c.building,
    });
    // Cooling tower (wide, tall)
    columns.push({
      position: offsetMeters(pos, 0, 180),
      radius: 70, elevation: 130,
      color: c.stack,
    });
    // Turbine building
    polygons.push({
      polygon: rectPoly(offsetMeters(pos, 0, -100), 200, 80),
      elevation: 25,
      color: c.accent,
    });
  }

  if (type === 'wind') {
    // Wind turbine tower (tall thin column)
    columns.push({
      position: pos,
      radius: 6, elevation: 100,
      color: [200, 220, 230],
    });
    // Nacelle (small box on top)
    polygons.push({
      polygon: rectPoly(pos, 15, 8),
      elevation: 110,
      color: c.stack,
    });
    // Base pad
    polygons.push({
      polygon: rectPoly(pos, 30, 30),
      elevation: 3,
      color: [80, 80, 80],
    });
  }

  return { columns, polygons };
}

// ── Substation shape ──
function generateSubstationShapes(sub) {
  const { pos } = sub;
  const polygons = [];
  const columns = [];

  // Main yard (fenced area)
  polygons.push({
    polygon: rectPoly(pos, 150, 100),
    elevation: 5,
    color: [40, 60, 80],
  });
  // Transformer buildings
  polygons.push({
    polygon: rectPoly(offsetMeters(pos, -40, 0), 30, 40),
    elevation: 15,
    color: [34, 211, 238],
  });
  polygons.push({
    polygon: rectPoly(offsetMeters(pos, 40, 0), 30, 40),
    elevation: 15,
    color: [34, 211, 238],
  });
  // Pylons
  columns.push({
    position: offsetMeters(pos, -60, 40),
    radius: 4, elevation: 35,
    color: [100, 120, 140],
  });
  columns.push({
    position: offsetMeters(pos, 60, 40),
    radius: 4, elevation: 35,
    color: [100, 120, 140],
  });

  return { polygons, columns };
}

// ── Power plants ──
const POWER_PLANTS = [
  { id: 'pp-munich', pos: [11.68, 48.10], name: 'Isar Power Station', type: 'gas' },
  { id: 'pp-cologne', pos: [6.80, 50.90], name: 'Niederaussem', type: 'coal' },
  { id: 'pp-warsaw', pos: [20.90, 52.15], name: 'Kozienice', type: 'coal' },
  { id: 'pp-london', pos: [-0.25, 51.45], name: 'Barking', type: 'gas' },
  { id: 'pp-paris', pos: [2.50, 48.80], name: 'Nogent', type: 'nuclear' },
  { id: 'pp-milan', pos: [9.30, 45.40], name: 'Turbigo', type: 'gas' },
  { id: 'pp-wind1', pos: [8.50, 54.50], name: 'North Sea Wind Farm', type: 'wind' },
  { id: 'pp-wind2', pos: [13.40, 54.20], name: 'Baltic Wind Farm', type: 'wind' },
];

// ── Substations ──
const SUBSTATIONS = [
  { id: 'sub-1', pos: [11.45, 48.25], name: 'Oberbayern 380kV' },
  { id: 'sub-2', pos: [11.90, 48.35], name: 'Munich-Nord 220kV' },
  { id: 'sub-3', pos: [11.20, 48.50], name: 'Augsburg 380kV' },
  { id: 'sub-4', pos: [12.10, 48.00], name: 'Altotting 110kV' },
];

const STEPS = [
  {
    view: { longitude: 11.68, latitude: 48.10, zoom: 15, pitch: 55, bearing: -20 },
    title: 'Generation',
    subtitle: 'Isar Power Station — 890 MW combined-cycle gas turbine',
    showPlants: ['pp-munich'],
    showSubs: false,
  },
  {
    view: { longitude: 11.55, latitude: 48.22, zoom: 11, pitch: 50, bearing: -10 },
    title: 'Step-Up & Distribution',
    subtitle: 'Substations transform 10 kV to 380 kV for long-distance transport',
    showPlants: ['pp-munich'],
    showSubs: true,
  },
  {
    view: { longitude: 10.5, latitude: 50.5, zoom: 4.5, pitch: 30, bearing: 0 },
    title: 'The Grid',
    subtitle: 'Power plants across Europe — mixed generation',
    showPlants: null,
    showSubs: false,
  },
];

const FLY_TO = new FlyToInterpolator();

export default function EUGrid3DExperiment({ width = '100%', height = '100%' }) {
  const DARK_MAP = useMapStyle('europe', 'nolabels');
  const slideContext = useContext(SlideContext);
  const [stepIndex, setStepIndex] = useState(0);
  const [viewState, setViewState] = useState(STEPS[0].view);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        setStepIndex(prev => {
          const next = Math.min(prev + 1, STEPS.length - 1);
          setViewState(vs => ({
            ...STEPS[next].view,
            transitionDuration: 2000,
            transitionInterpolator: FLY_TO,
          }));
          return next;
        });
        e.stopPropagation();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setStepIndex(prev => {
          const next = Math.max(prev - 1, 0);
          setViewState(vs => ({
            ...STEPS[next].view,
            transitionDuration: 2000,
            transitionInterpolator: FLY_TO,
          }));
          return next;
        });
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', onKey, { capture: true });
    return () => window.removeEventListener('keydown', onKey, { capture: true });
  }, []);

  const step = STEPS[stepIndex];
  const visiblePlants = step.showPlants
    ? POWER_PLANTS.filter(p => step.showPlants.includes(p.id))
    : POWER_PLANTS;

  const layers = useMemo(() => {
    const result = [];
    const allColumns = [];
    const allPolygons = [];

    // Generate shapes for visible plants
    for (const plant of visiblePlants) {
      const shapes = generatePlantShapes(plant);
      allColumns.push(...shapes.columns);
      allPolygons.push(...shapes.polygons);
    }

    // Generate substation shapes
    if (step.showSubs) {
      for (const sub of SUBSTATIONS) {
        const shapes = generateSubstationShapes(sub);
        allColumns.push(...shapes.columns);
        allPolygons.push(...shapes.polygons);
      }

      // Connection lines
      const connections = SUBSTATIONS.map(sub => ({
        from: POWER_PLANTS[0].pos,
        to: sub.pos,
      }));
      result.push(new LineLayer({
        id: 'plant-sub-lines',
        data: connections,
        getSourcePosition: d => d.from,
        getTargetPosition: d => d.to,
        getColor: [34, 211, 238, 80],
        getWidth: 2,
        widthMinPixels: 1,
      }));
    }

    // Extruded buildings
    if (allPolygons.length > 0) {
      result.push(new SolidPolygonLayer({
        id: 'plant-buildings',
        data: allPolygons,
        getPolygon: d => d.polygon,
        getFillColor: d => d.color,
        getElevation: d => d.elevation,
        extruded: true,
        wireframe: true,
        getLineColor: [255, 255, 255, 40],
        material: {
          ambient: 0.4,
          diffuse: 0.6,
          shininess: 20,
        },
      }));
    }

    // Cylindrical structures (stacks, towers, turbine poles)
    if (allColumns.length > 0) {
      result.push(new ColumnLayer({
        id: 'plant-columns',
        data: allColumns,
        getPosition: d => d.position,
        getFillColor: d => d.color,
        getElevation: d => d.elevation,
        diskResolution: 16,
        radius: null,
        getLineColor: [255, 255, 255, 30],
        extruded: true,
        wireframe: true,
        material: {
          ambient: 0.4,
          diffuse: 0.6,
          shininess: 20,
        },
      }));
    }

    // Text labels
    result.push(new TextLayer({
      id: 'plant-labels',
      data: visiblePlants,
      getPosition: d => d.pos,
      getText: d => d.name,
      getSize: 14,
      getColor: [255, 255, 255, 200],
      getPixelOffset: [0, -40],
      fontFamily: 'JetBrains Mono',
      fontWeight: 600,
      outlineWidth: 2,
      outlineColor: [0, 0, 0, 200],
    }));

    return result;
  }, [stepIndex, visiblePlants, step.showSubs]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <DeckGL
        viewState={viewState}
        onViewStateChange={({ viewState: vs }) => setViewState(vs)}
        controller={true}
        layers={layers}
        style={{ position: 'absolute', inset: 0 }}
      >
        <MapGL mapStyle={DARK_MAP} style={{ width: '100%', height: '100%' }} />
      </DeckGL>

      {/* HUD overlay */}
      <div style={{
        position: 'absolute', bottom: 24, left: 24, right: 24,
        zIndex: 10, pointerEvents: 'none',
      }}>
        <div style={{
          background: `${colors.surface}dd`,
          backdropFilter: 'blur(12px)',
          border: `1px solid ${colors.primary}20`,
          borderRadius: 12,
          padding: '16px 24px',
          maxWidth: 500,
        }}>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11, color: colors.primary,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 4,
          }}>
            {step.title}
          </div>
          <div style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 16, color: colors.text,
          }}>
            {step.subtitle}
          </div>
          <div style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 10, color: colors.textDim,
            marginTop: 8,
          }}>
            Step {stepIndex + 1} / {STEPS.length} — arrow keys to navigate
          </div>
        </div>
      </div>
    </div>
  );
}
