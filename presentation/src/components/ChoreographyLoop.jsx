import React, { useEffect, useRef, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

/**
 * ChoreographyLoop — Animated visualization of choreography between
 * IoT homes (left) ↔ MQTT broker (center) ↔ Dapr actors (right)
 */

const HOMES = ['Home A', 'Home B', 'Home C', 'Home D'];
const ACTORS = ['Actor A', 'Actor B', 'Actor C', 'Actor D'];

export default function ChoreographyLoop({ width = 900, height = 380 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const padX = 30;
    const padY = 20;

    // Layout
    const homeX = padX;
    const homeW = 80;
    const mqttX = width / 2 - 50;
    const mqttW = 100;
    const mqttH = 50;
    const actorX = width - padX - 90;
    const actorW = 90;
    const itemH = 42;
    const gap = (height - padY * 2 - HOMES.length * itemH) / (HOMES.length - 1);

    function homeY(i) { return padY + i * (itemH + gap) + itemH / 2; }
    const mqttY = height / 2;

    const particles = particlesRef.current;
    const startTime = performance.now() / 1000;

    function draw() {
      const now = performance.now() / 1000;
      const isActive = slideContext?.isSlideActive;
      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.strokeStyle = colors.surfaceLight + '08';
      ctx.lineWidth = 1;
      for (let gx = 0; gx < width; gx += 40) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, height); ctx.stroke();
      }
      for (let gy = 0; gy < height; gy += 40) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(width, gy); ctx.stroke();
      }

      // Draw connections: homes → MQTT
      HOMES.forEach((_, i) => {
        const hy = homeY(i);
        const fromX = homeX + homeW;
        const toX = mqttX;

        // Telemetry line (home → mqtt)
        ctx.beginPath();
        ctx.strokeStyle = colors.success + '20';
        ctx.lineWidth = 1.5;
        ctx.moveTo(fromX, hy);
        ctx.quadraticCurveTo((fromX + toX) / 2, hy * 0.6 + mqttY * 0.4, toX, mqttY);
        ctx.stroke();

        // Dispatch line (mqtt → home, offset)
        ctx.beginPath();
        ctx.strokeStyle = colors.primary + '15';
        ctx.setLineDash([5, 4]);
        ctx.moveTo(toX, mqttY);
        ctx.quadraticCurveTo((fromX + toX) / 2, hy * 0.4 + mqttY * 0.6, fromX, hy);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw connections: MQTT → actors
      ACTORS.forEach((_, i) => {
        const ay = homeY(i);
        const fromX = mqttX + mqttW;
        const toX = actorX;

        // Forward
        ctx.beginPath();
        ctx.strokeStyle = colors.primary + '20';
        ctx.lineWidth = 1.5;
        ctx.moveTo(fromX, mqttY);
        ctx.quadraticCurveTo((fromX + toX) / 2, ay * 0.4 + mqttY * 0.6, toX, ay);
        ctx.stroke();

        // Return
        ctx.beginPath();
        ctx.strokeStyle = colors.success + '15';
        ctx.setLineDash([5, 4]);
        ctx.moveTo(toX, ay);
        ctx.quadraticCurveTo((fromX + toX) / 2, ay * 0.6 + mqttY * 0.4, fromX, mqttY);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Spawn particles
      if (isActive) {
        const spawnRate = 0.15;
        if (Math.random() < spawnRate) {
          const homeIdx = Math.floor(Math.random() * HOMES.length);
          const isForward = Math.random() > 0.35; // mostly telemetry

          if (isForward) {
            // Home → MQTT → Actor (two-segment journey)
            particles.push({
              phase: 0, // 0: home→mqtt, 1: mqtt→actor
              homeIdx,
              progress: 0,
              speed: 0.008 + Math.random() * 0.004,
              color: colors.success,
              size: 3 + Math.random() * 2,
            });
          } else {
            // Actor → MQTT → Home (dispatch)
            particles.push({
              phase: 2, // 2: actor→mqtt, 3: mqtt→home
              homeIdx,
              progress: 0,
              speed: 0.008 + Math.random() * 0.004,
              color: colors.primary,
              size: 3 + Math.random() * 2,
            });
          }
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (isActive) p.progress += p.speed;

        if (p.progress > 1) {
          if (p.phase === 0) { p.phase = 1; p.progress = 0; }
          else if (p.phase === 2) { p.phase = 3; p.progress = 0; }
          else { particles.splice(i, 1); continue; }
        }

        const hy = homeY(p.homeIdx);
        let px, py;

        if (p.phase === 0) {
          // Home → MQTT
          const fromX = homeX + homeW;
          const t = p.progress;
          px = fromX + (mqttX - fromX) * t;
          const cpY = hy * 0.6 + mqttY * 0.4;
          py = hy * (1-t)*(1-t) + cpY * 2*t*(1-t) + mqttY * t*t;
        } else if (p.phase === 1) {
          // MQTT → Actor
          const fromX = mqttX + mqttW;
          const t = p.progress;
          px = fromX + (actorX - fromX) * t;
          const cpY = hy * 0.4 + mqttY * 0.6;
          py = mqttY * (1-t)*(1-t) + cpY * 2*t*(1-t) + hy * t*t;
        } else if (p.phase === 2) {
          // Actor → MQTT
          const t = p.progress;
          px = actorX + (mqttX + mqttW - actorX) * t;
          const cpY = hy * 0.6 + mqttY * 0.4;
          py = hy * (1-t)*(1-t) + cpY * 2*t*(1-t) + mqttY * t*t;
        } else {
          // MQTT → Home
          const t = p.progress;
          px = mqttX + (homeX + homeW - mqttX) * t;
          const cpY = hy * 0.4 + mqttY * 0.6;
          py = mqttY * (1-t)*(1-t) + cpY * 2*t*(1-t) + hy * t*t;
        }

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw MQTT broker box (center)
      const pulse = 0.5 + 0.5 * Math.sin(now * 2);
      ctx.fillStyle = colors.surface + 'ee';
      ctx.strokeStyle = colors.primary + Math.round(50 + pulse * 30).toString(16).padStart(2, '0');
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(mqttX, mqttY - mqttH / 2, mqttW, mqttH, 8);
      ctx.fill();
      ctx.stroke();
      // Accent line
      ctx.fillStyle = colors.primary + '90';
      ctx.beginPath();
      ctx.roundRect(mqttX, mqttY - mqttH / 2, mqttW, 3, [8, 8, 0, 0]);
      ctx.fill();
      // Label
      ctx.font = 'bold 14px JetBrains Mono';
      ctx.fillStyle = colors.primary;
      ctx.textAlign = 'center';
      ctx.fillText('EMQX', mqttX + mqttW / 2, mqttY + 2);
      ctx.font = '10px JetBrains Mono';
      ctx.fillStyle = colors.text + 'aa';
      ctx.fillText('MQTT Broker', mqttX + mqttW / 2, mqttY + 16);

      // Draw homes (matching slide 24 VPPArchitecture style)
      HOMES.forEach((label, i) => {
        const hy = homeY(i);
        const cx = homeX + homeW / 2;
        const hw = homeW / 2;
        const roofH = 14;
        const bodyH = 22;
        const pulse = 0.5 + 0.5 * Math.sin(now * 2.5 + i * 2);

        // House body with roof peak
        ctx.beginPath();
        ctx.moveTo(cx, hy - roofH - bodyH / 2);        // roof peak
        ctx.lineTo(cx + hw + 4, hy - bodyH / 2);        // right eave
        ctx.lineTo(cx + hw, hy - bodyH / 2);             // right wall top
        ctx.lineTo(cx + hw, hy + bodyH / 2);             // right wall bottom
        ctx.lineTo(cx - hw, hy + bodyH / 2);             // left wall bottom
        ctx.lineTo(cx - hw, hy - bodyH / 2);             // left wall top
        ctx.lineTo(cx - hw - 4, hy - bodyH / 2);         // left eave
        ctx.closePath();
        ctx.fillStyle = colors.surface + 'ee';
        ctx.fill();
        ctx.strokeStyle = colors.success + Math.round(40 + pulse * 30).toString(16).padStart(2, '0');
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 8 * pulse;
        ctx.shadowColor = colors.success + '30';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // PV panel on right roof slope
        const pvX = cx + hw * 0.3;
        const pvY = hy - roofH * 0.5 - bodyH / 2;
        const roofAngle = Math.atan2(roofH, hw + 4);
        ctx.save();
        ctx.translate(pvX, pvY);
        ctx.rotate(roofAngle);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.5)';
        ctx.fillRect(-9, -4, 18, 8);
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.7)';
        ctx.lineWidth = 0.8;
        ctx.strokeRect(-9, -4, 18, 8);
        ctx.restore();

        // Label
        ctx.font = 'bold 10px JetBrains Mono';
        ctx.fillStyle = colors.success + 'cc';
        ctx.textAlign = 'center';
        ctx.fillText(label, cx, hy + bodyH / 2 + 12);
      });

      // Draw actor boxes (right)
      ACTORS.forEach((label, i) => {
        const ay = homeY(i);
        const ny = ay - itemH / 2;
        ctx.fillStyle = colors.surface + 'ee';
        ctx.strokeStyle = colors.primary + '50';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(actorX, ny, actorW, itemH, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = colors.primary + '90';
        ctx.beginPath();
        ctx.roundRect(actorX, ny, actorW, 2.5, [8, 8, 0, 0]);
        ctx.fill();
        ctx.font = 'bold 12px JetBrains Mono';
        ctx.fillStyle = colors.primary;
        ctx.textAlign = 'center';
        ctx.fillText(label, actorX + actorW / 2, ay + 5);
      });

      // Column labels
      ctx.font = 'bold 11px JetBrains Mono';
      ctx.textAlign = 'center';
      ctx.fillStyle = colors.success + 'cc';
      ctx.fillText('IoT Devices', homeX + homeW / 2, padY - 6);
      ctx.fillStyle = colors.primary + 'cc';
      ctx.fillText('Dapr Actors', actorX + actorW / 2, padY - 6);
      ctx.fillStyle = colors.textDim + 'cc';
      ctx.fillText('Pub/Sub', mqttX + mqttW / 2, mqttY - mqttH / 2 - 10);

      // Flow labels
      ctx.font = '10px Inter';
      ctx.fillStyle = colors.success + '80';
      ctx.textAlign = 'center';
      ctx.fillText('telemetry', (homeX + homeW + mqttX) / 2, padY + 14);
      ctx.fillStyle = colors.primary + '80';
      ctx.fillText('dispatch', (mqttX + mqttW + actorX) / 2 + 20, height - padY - 4);

      if (isActive) animRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height }}
    />
  );
}
