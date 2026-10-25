import { colors } from '../../theme.js';
import { segText, segMeasure } from './canvasSegText.js';
import {
  TYPE_TONE,
  TEXAS_OUTLINE,
  TEXAS_PLANTS,
  TEXAS_LINES,
  TEXAS_CASCADE,
  EU_OUTLINES,
  EU_HUBS,
  EU_LINES,
  SA_OUTLINES,
  SA_NODES,
  SA_LINES,
  SA_BLACKOUT,
} from './mapData.js';

/**
 * SchematicMap — geography drawn as a wireframe on canvas.
 *
 * No tiles, no network, no WebGL. An equirectangular projection is plenty for
 * the zoom levels this deck uses, and it makes the whole thing deterministic:
 * the same map renders on any machine, online or off.
 *
 * The aesthetic is deliberate — country outlines as thin strokes, grid nodes as
 * simple marks, and every number rendered as 7-segment. It reads as a control
 * room schematic rather than a photograph of a place.
 */

// ── Projection ──────────────────────────────────────────────────────────────

/**
 * Build a lon/lat → pixel projector.
 *
 * `fitRings` controls the framing; pass the geometry you want to fill the view.
 * Latitude is scaled by cos(centerLat) so the map isn't stretched at high
 * latitudes — a small correction that makes Europe look like Europe.
 */
export function createProjection(fitRings, box, { pad = 0.04 } = {}) {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const ring of fitRings) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
  return createProjectionFromBounds({ minLon, maxLon, minLat, maxLat }, box, { pad });
}

/**
 * Frame a box on an explicit lon/lat window. Used when the subject is the
 * infrastructure rather than the geography — the SA nodes all sit around
 * Adelaide even though the state spans twelve degrees of latitude.
 */
export function createProjectionFromBounds(bounds, box, { pad = 0.04 } = {}) {
  const { minLon, maxLon, minLat, maxLat } = bounds;
  const midLat = (minLat + maxLat) / 2;
  const kx = Math.cos((midLat * Math.PI) / 180);

  // Work in "cos-corrected lon" space so aspect is preserved.
  const w = (maxLon - minLon) * kx;
  const h = maxLat - minLat;
  const innerW = box.w * (1 - pad * 2);
  const innerH = box.h * (1 - pad * 2);
  const scale = Math.min(innerW / w, innerH / h);
  const offX = box.x + box.w / 2 - (w * scale) / 2;
  const offY = box.y + box.h / 2 - (h * scale) / 2;

  return (lon, lat) => [
    offX + (lon - minLon) * kx * scale,
    offY + (maxLat - lat) * scale,
  ];
}

/** Bounding box of a set of {pos:[lon,lat]} nodes, expanded by `margin` degrees. */
export function boundsOfNodes(nodes, margin = 0.35) {
  let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const n of nodes) {
    const [lon, lat] = n.pos;
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return {
    minLon: minLon - margin,
    maxLon: maxLon + margin,
    minLat: minLat - margin,
    maxLat: maxLat + margin,
  };
}

// ── Geometry helpers ────────────────────────────────────────────────────────

function traceRing(ctx, ring, project, close = true) {
  ctx.beginPath();
  for (let i = 0; i < ring.length; i++) {
    const [x, y] = project(ring[i][0], ring[i][1]);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  if (close) ctx.closePath();
}

function drawOutlines(ctx, outlineMap, project, { stroke, width = 1, fill = null, dash = null }) {
  ctx.save();
  if (dash) ctx.setLineDash(dash);
  for (const ring of Object.values(outlineMap)) {
    traceRing(ctx, ring, project);
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draw the animated power-flow dots along a set of transmission lines.
 * `t` is elapsed seconds; dots drift from A to B and wrap.
 */
function drawFlow(ctx, pairs, nodeById, project, t, { tone, speed = 0.35, dots = 2, radius = 1.6 }) {
  ctx.save();
  for (let li = 0; li < pairs.length; li++) {
    const a = nodeById.get(pairs[li][0]);
    const b = nodeById.get(pairs[li][1]);
    if (!a || !b) continue;
    const [ax, ay] = project(a.pos[0], a.pos[1]);
    const [bx, by] = project(b.pos[0], b.pos[1]);
    for (let d = 0; d < dots; d++) {
      const f = ((t * speed + li * 0.13 + d * 0.5) % 1);
      const x = ax + (bx - ax) * f;
      const y = ay + (by - ay) * f;
      // Fade in and out at the ends so dots don't pop.
      const fade = Math.sin(f * Math.PI);
      ctx.globalAlpha = 0.55 * fade;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = tone;
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawLines(ctx, pairs, nodeById, project, tone, width = 1) {
  ctx.save();
  ctx.strokeStyle = tone;
  ctx.lineWidth = width;
  ctx.beginPath();
  for (const [ai, bi] of pairs) {
    const a = nodeById.get(ai), b = nodeById.get(bi);
    if (!a || !b) continue;
    const [ax, ay] = project(a.pos[0], a.pos[1]);
    const [bx, by] = project(b.pos[0], b.pos[1]);
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
  }
  ctx.stroke();
  ctx.restore();
}

/**
 * A grid node. `state` is one of:
 *   'ok'    — nominal, steady glow
 *   'hot'   — over-loaded / surging
 *   'dead'  — tripped offline, drawn hollow
 */
function drawNode(ctx, node, project, { tone, state = 'ok', t = 0, pulseSeed = 0 }) {
  const [x, y] = project(node.pos[0], node.pos[1]);
  const r = 3 + Math.min(node.cap || 0, 60) * 0.09;

  if (state === 'dead') {
    ctx.save();
    ctx.strokeStyle = colors.textDim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    // A small cross marks a tripped unit — readable at a glance.
    ctx.beginPath();
    ctx.moveTo(x - r * 0.7, y - r * 0.7); ctx.lineTo(x + r * 0.7, y + r * 0.7);
    ctx.moveTo(x + r * 0.7, y - r * 0.7); ctx.lineTo(x - r * 0.7, y + r * 0.7);
    ctx.stroke();
    ctx.restore();
    return;
  }

  const pulse = state === 'hot'
    ? 0.6 + 0.4 * Math.abs(Math.sin(t * 5 + pulseSeed))
    : 0.82 + 0.18 * Math.sin(t * 1.6 + pulseSeed);

  ctx.save();
  // Bloom
  ctx.globalAlpha = 0.18 * pulse;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.4, 0, Math.PI * 2);
  ctx.fillStyle = tone;
  ctx.fill();

  // Core
  ctx.globalAlpha = pulse;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = tone;
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.strokeStyle = tone;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

// ── HUD readout ─────────────────────────────────────────────────────────────

/**
 * A 7-segment readout drawn directly on the canvas, with a small mono caption
 * above it. Charts and maps share this so numbers look identical everywhere.
 *
 * Returns the measured width so callers can lay out several readouts in a row.
 */
export function drawSegReadout(ctx, { x, y, value, height = 26, tone, caption, align = 'left' }) {
  const color = tone || colors.primary;

  if (caption) {
    ctx.save();
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = align === 'right' ? 'right' : align === 'center' ? 'center' : 'left';
    ctx.fillStyle = colors.textDim;
    ctx.fillText(caption, x, y);
    ctx.restore();
  }

  const top = y + (caption ? 6 : 0) + height;
  segText(ctx, value, x, top, { height, color, align });
  return segMeasure(value, { height });
}

// ── Scenes ──────────────────────────────────────────────────────────────────

/**
 * Texas cascade — plants trip one by one in timeline order.
 * `step` is the Spectacle step index; higher = further into the cascade.
 */
export function drawTexasScene(ctx, box, { t, step = 0 }) {
  const project = createProjection([TEXAS_OUTLINE], box, { pad: 0.07 });

  // State outline, filled very slightly so the state reads as a solid place.
  drawOutlines(ctx, { TX: TEXAS_OUTLINE }, project, {
    stroke: `${colors.primary}70`,
    width: 1.4,
    fill: `${colors.primary}07`,
  });

  const nodeById = new Map(TEXAS_PLANTS.map(p => [p.id, p]));
  const dead = new Set();
  for (const beat of TEXAS_CASCADE) if (beat.time <= step) for (const id of beat.ids) dead.add(id);

  drawLines(ctx, TEXAS_LINES, nodeById, project, `${colors.primary}30`, 1);

  // Live lines keep their flow dots; dead ones go still.
  const livePairs = TEXAS_LINES.filter(([a, b]) => !dead.has(a) && !dead.has(b));
  drawFlow(ctx, livePairs, nodeById, project, t, { tone: colors.primary });

  TEXAS_PLANTS.forEach((p, i) => {
    drawNode(ctx, p, project, {
      tone: dead.has(p.id) ? colors.textDim : (TYPE_TONE[p.type] || colors.primary),
      state: dead.has(p.id) ? 'dead' : 'ok',
      t,
      pulseSeed: i,
    });
  });

  // HUD — the numbers that make this a readout rather than a drawing.
  // Positioned in the vertical middle band so it never collides with the
  // slide's own title (top) or readout strip (bottom).
  const totalCap = TEXAS_PLANTS.reduce((s, p) => s + p.cap, 0);
  const lostCap = TEXAS_PLANTS.filter(p => dead.has(p.id)).reduce((s, p) => s + p.cap, 0);
  const lostPct = Math.round((lostCap / totalCap) * 100);
  const hudY = box.h * 0.42;

  drawSegReadout(ctx, {
    x: 24, y: hudY, value: `${lostPct}`, height: 40,
    tone: lostPct > 0 ? colors.danger : colors.primary,
    caption: 'PERCENT OF FLEET OFFLINE',
  });
  drawSegReadout(ctx, {
    x: box.w - 24, y: hudY, value: `${dead.size}`, height: 40,
    tone: colors.danger, caption: 'UNITS TRIPPED', align: 'right',
  });

  return project;
}

/**
 * EU grid — hubs across the continental synchronous area, with an animated
 * frequency readout that drifts around 50.000 Hz.
 */
export function drawEUScene(ctx, box, { t }) {
  // Frame on the core synchronous area rather than the full outline set —
  // North Africa and the far north would otherwise dominate the fit.
  const fitRing = [[-10, 36], [30, 36], [30, 60], [-10, 60], [-10, 36]];
  const project = createProjection([fitRing], box);

  drawOutlines(ctx, EU_OUTLINES, project, {
    stroke: `${colors.primary}5a`,
    width: 1,
    fill: `${colors.primary}08`,
  });

  const nodeById = new Map(EU_HUBS.map(h => [h.id, h]));
  drawLines(ctx, EU_LINES, nodeById, project, `${colors.primary}2e`, 1);
  drawFlow(ctx, EU_LINES, nodeById, project, t, { tone: colors.primary, speed: 0.22 });

  EU_HUBS.forEach((h, i) => {
    drawNode(ctx, h, project, {
      tone: TYPE_TONE[h.type] || colors.primary,
      state: 'ok',
      t,
      pulseSeed: i,
    });
  });

  // Live frequency readout — drifts around nominal, which is what the real
  // grid does and what makes the number worth watching.
  const freq = 50 + Math.sin(t * 0.7) * 0.012 + Math.sin(t * 2.3) * 0.004;
  const totalCap = EU_HUBS.reduce((s, h) => s + h.cap, 0);
  const hudY = box.h * 0.42;

  drawSegReadout(ctx, {
    x: 24, y: hudY, value: freq.toFixed(3), height: 40,
    tone: colors.primary, caption: 'HZ · CONTINENTAL SYNCHRONOUS AREA',
  });
  drawSegReadout(ctx, {
    x: box.w - 24, y: hudY, value: `${EU_HUBS.length}`, height: 40,
    tone: colors.textMuted, caption: 'GENERATION HUBS', align: 'right',
  });
  drawSegReadout(ctx, {
    x: box.w - 24, y: hudY + 66, value: `${totalCap}`, height: 28,
    tone: colors.textMuted, caption: 'GW CONNECTED', align: 'right',
  });

  return project;
}

/**
 * South Australia. Two variants:
 *   'vpp'      — the fleet responding as one unit, batteries highlighted
 *   'blackout' — the 2016 cascade, farms tripping in sequence
 */
export function drawSAScene(ctx, box, { t, step = 0, variant = 'vpp' }) {
  // Frame on the infrastructure, not the state boundary. South Australia spans
  // twelve degrees of latitude but almost every asset sits around Adelaide, so
  // fitting the outline would leave the fleet as a smudge in one corner.
  const project = createProjectionFromBounds(boundsOfNodes(SA_NODES, 0.25), box);

  // Neighbours faint, South Australia itself brighter.
  const { 'South Australia': sa, ...neighbours } = SA_OUTLINES;
  drawOutlines(ctx, neighbours, project, { stroke: `${colors.textDim}40`, width: 1 });
  drawOutlines(ctx, { SA: sa }, project, {
    stroke: `${colors.primary}80`,
    width: 1.5,
    fill: `${colors.primary}09`,
  });

  const nodeById = new Map(SA_NODES.map(n => [n.id, n]));
  const dead = new Set();
  if (variant === 'blackout') {
    for (const beat of SA_BLACKOUT) if (beat.time <= step) for (const id of beat.ids) dead.add(id);
  }

  drawLines(ctx, SA_LINES, nodeById, project, `${colors.primary}2e`, 1);

  const livePairs = SA_LINES.filter(([a, b]) => !dead.has(a) && !dead.has(b));
  drawFlow(ctx, livePairs, nodeById, project, t, {
    tone: variant === 'blackout' ? colors.danger : colors.success,
    speed: 0.3,
  });

  SA_NODES.forEach((n, i) => {
    const isDead = dead.has(n.id);
    // In the VPP variant the batteries are the story — light them up.
    const isHero = variant === 'vpp' && (n.type === 'battery' || n.type === 'wind');
    drawNode(ctx, n, project, {
      tone: isDead ? colors.textDim
        : isHero ? colors.success
        : (TYPE_TONE[n.type] || colors.primary),
      state: isDead ? 'dead' : 'ok',
      t,
      pulseSeed: i,
    });
  });

  // HUD. The two variants tell opposite stories, so they read out opposites.
  // The VPP variant shows no HUD — its numbers already sit in the slide's own
  // bottom strip, and repeating them twice reads as a mistake.
  const hudY = box.h * 0.42;
  if (variant === 'blackout') {
    const totalCap = SA_NODES.filter(n => n.cap > 0).reduce((s, n) => s + n.cap, 0);
    const lostCap = SA_NODES.filter(n => dead.has(n.id)).reduce((s, n) => s + n.cap, 0);
    drawSegReadout(ctx, {
      x: 24, y: hudY, value: `${Math.round((lostCap / totalCap) * 100)}`, height: 40,
      tone: colors.danger, caption: 'PERCENT CAPACITY LOST',
    });
    drawSegReadout(ctx, {
      x: box.w - 24, y: hudY, value: `${dead.size}`, height: 40,
      tone: colors.danger, caption: 'UNITS TRIPPED', align: 'right',
    });
  }

  return project;
}
