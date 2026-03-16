import React, { useEffect, useRef } from 'react';
import { colors } from '../theme';

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hexAlpha(hex, a) {
  return hex + Math.round(Math.min(1, Math.max(0, a)) * 255).toString(16).padStart(2, '0');
}

export default function ThankYouBackground({ width = 1366, height = 768 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = 2;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const rand = seededRandom(42);
    const centerX = width / 2;
    const centerY = height / 2;

    // Generate cluster centers for natural grouping
    const clusters = [];
    for (let i = 0; i < 14; i++) {
      clusters.push({
        x: 40 + rand() * (width - 80),
        y: 40 + rand() * (height - 80),
      });
    }

    // Generate homes
    const homes = [];
    const palette = [colors.primary, colors.primary, colors.success, colors.success, colors.solar];

    for (let i = 0; i < 220; i++) {
      let x, y;
      if (rand() > 0.25) {
        const cl = clusters[Math.floor(rand() * clusters.length)];
        const angle = rand() * Math.PI * 2;
        const dist = (rand() + rand()) * 0.5 * 130;
        x = cl.x + Math.cos(angle) * dist;
        y = cl.y + Math.sin(angle) * dist;
      } else {
        x = 20 + rand() * (width - 40);
        y = 20 + rand() * (height - 40);
      }

      x = Math.max(8, Math.min(width - 8, x));
      y = Math.max(8, Math.min(height - 8, y));

      homes.push({
        x, y,
        size: 3 + rand() * 3.5,
        phase: rand() * Math.PI * 2,
        speed: 0.3 + rand() * 0.5,
        hasSolar: rand() > 0.25,
        color: palette[Math.floor(rand() * palette.length)],
        distFromCenter: Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2),
      });
    }

    // Build connection mesh between nearby homes
    const maxDist = 85;
    const connections = [];
    for (let i = 0; i < homes.length; i++) {
      let count = 0;
      for (let j = i + 1; j < homes.length; j++) {
        if (count >= 3) break;
        const dx = homes[i].x - homes[j].x;
        const dy = homes[i].y - homes[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < maxDist) {
          connections.push({ a: i, b: j, d });
          count++;
        }
      }
    }

    // Energy particles flowing along connections
    const particles = [];
    const particleCount = Math.min(60, connections.length);
    for (let i = 0; i < particleCount; i++) {
      const conn = connections[Math.floor(rand() * connections.length)];
      particles.push({
        conn,
        t: rand(),
        speed: 0.0008 + rand() * 0.002,
        forward: rand() > 0.5,
        color: rand() > 0.5 ? colors.primary : colors.success,
      });
    }

    // Sparkle state per home: 0 = idle, >0 = sparkling (countdown)
    const sparkle = new Float32Array(homes.length);
    // Stagger initial sparkle times so some are already going
    const rand2 = seededRandom(99);
    for (let i = 0; i < homes.length; i++) {
      sparkle[i] = rand2() < 0.05 ? rand2() * 0.8 : 0;
    }

    // Transmission lines spanning the canvas
    const lines = [];
    const randL = seededRandom(77);
    for (let i = 0; i < 18; i++) {
      const vertical = randL() > 0.45;
      let x1, y1, x2, y2;
      if (vertical) {
        const baseX = randL() * width;
        const drift = (randL() - 0.5) * 80;
        x1 = baseX + drift;
        y1 = -20;
        x2 = baseX - drift;
        y2 = height + 20;
      } else {
        const baseY = randL() * height;
        const drift = (randL() - 0.5) * 60;
        x1 = -20;
        y1 = baseY + drift;
        x2 = width + 20;
        y2 = baseY - drift;
      }
      const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      // 2-4 energy pulses per line
      const pulseCount = 2 + Math.floor(randL() * 3);
      const pulses = [];
      for (let p = 0; p < pulseCount; p++) {
        pulses.push({
          t: randL(),
          speed: 0.0004 + randL() * 0.0008,
          forward: randL() > 0.3,
        });
      }
      lines.push({
        x1, y1, x2, y2, len,
        color: [colors.primary, colors.success, colors.primary][Math.floor(randL() * 3)],
        pulses,
      });
    }

    let startTime = performance.now();
    let lastSparkleTime = 0;

    const draw = (now) => {
      const elapsed = (now - startTime) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Trigger new sparkles — ~3-5 homes per second, randomly
      if (elapsed - lastSparkleTime > 0.2) {
        lastSparkleTime = elapsed;
        for (let i = 0; i < 2; i++) {
          const idx = Math.floor(Math.random() * homes.length);
          if (sparkle[idx] <= 0) sparkle[idx] = 0.6 + Math.random() * 0.4; // 0.6-1.0s duration
        }
      }

      // Decay sparkles
      for (let i = 0; i < sparkle.length; i++) {
        if (sparkle[i] > 0) sparkle[i] = Math.max(0, sparkle[i] - 0.016);
      }

      // Draw transmission lines with traveling energy pulses
      lines.forEach(ln => {
        const dx = ln.x2 - ln.x1;
        const dy = ln.y2 - ln.y1;

        // Faint base wire
        ctx.strokeStyle = hexAlpha(ln.color, 0.04);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ln.x1, ln.y1);
        ctx.lineTo(ln.x2, ln.y2);
        ctx.stroke();

        // Animate pulses along the wire
        ln.pulses.forEach(p => {
          p.t += p.speed * (p.forward ? 1 : -1);
          if (p.t > 1) p.t -= 1;
          if (p.t < 0) p.t += 1;

          const t = p.t;
          const px = ln.x1 + dx * t;
          const py = ln.y1 + dy * t;

          // Thick glowing segment around the pulse point
          const segLen = 0.04; // 4% of line length
          const t0 = Math.max(0, t - segLen / 2);
          const t1 = Math.min(1, t + segLen / 2);

          // Bright core
          ctx.strokeStyle = hexAlpha(ln.color, 0.18);
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(ln.x1 + dx * t0, ln.y1 + dy * t0);
          ctx.lineTo(ln.x1 + dx * t1, ln.y1 + dy * t1);
          ctx.stroke();

          // Glow bloom
          ctx.shadowBlur = 8;
          ctx.shadowColor = hexAlpha(ln.color, 0.15);
          ctx.strokeStyle = hexAlpha(ln.color, 0.1);
          ctx.lineWidth = 6;
          ctx.beginPath();
          ctx.moveTo(ln.x1 + dx * t0, ln.y1 + dy * t0);
          ctx.lineTo(ln.x1 + dx * t1, ln.y1 + dy * t1);
          ctx.stroke();
          ctx.shadowBlur = 0;
        });
      });

      // Radial pulse wave
      const pulseInterval = 5;
      const pulseT = (elapsed % pulseInterval) / pulseInterval;
      const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
      const pulseRadius = pulseT * maxRadius;
      const pulseWidth = 100;
      const pulseFade = 1 - pulseT;

      // Draw connections
      ctx.lineWidth = 0.5;
      connections.forEach(c => {
        const a = homes[c.a];
        const b = homes[c.b];
        const midDist = Math.sqrt(
          ((a.x + b.x) / 2 - centerX) ** 2 + ((a.y + b.y) / 2 - centerY) ** 2
        );

        const pulseDelta = Math.abs(midDist - pulseRadius);
        const pulseBoost = pulseDelta < pulseWidth ? (1 - pulseDelta / pulseWidth) * 0.12 * pulseFade : 0;
        const alpha = 0.035 * (1 - c.d / maxDist) + pulseBoost;

        ctx.strokeStyle = hexAlpha(colors.primary, alpha);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      });

      // Draw energy particles
      ctx.shadowBlur = 4;
      particles.forEach(p => {
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;
        const a = homes[p.conn.a];
        const b = homes[p.conn.b];
        const t = p.forward ? p.t : 1 - p.t;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;

        ctx.fillStyle = hexAlpha(p.color, 0.45);
        ctx.shadowColor = hexAlpha(p.color, 0.3);
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Draw homes
      homes.forEach((h, hi) => {
        const breathe = 0.5 + 0.5 * Math.sin(elapsed * h.speed + h.phase);

        // Pulse wave boost
        const pulseDelta = Math.abs(h.distFromCenter - pulseRadius);
        const pulseBoost = pulseDelta < pulseWidth ? (1 - pulseDelta / pulseWidth) * 0.5 * pulseFade : 0;

        // Sparkle: quick bright peak then fade
        const sp = sparkle[hi];
        const sparkleIntensity = sp > 0 ? Math.sin(sp * Math.PI) * 0.55 : 0;

        const alpha = 0.1 + breathe * 0.12 + pulseBoost + sparkleIntensity;
        const s = h.size;

        // House body
        ctx.fillStyle = hexAlpha(h.color, alpha * 0.2);
        ctx.strokeStyle = hexAlpha(h.color, alpha);
        ctx.lineWidth = 0.6;
        ctx.fillRect(h.x - s / 2, h.y, s, s * 0.6);
        ctx.strokeRect(h.x - s / 2, h.y, s, s * 0.6);

        // Roof
        ctx.beginPath();
        ctx.moveTo(h.x - s / 2 - 1, h.y);
        ctx.lineTo(h.x, h.y - s * 0.45);
        ctx.lineTo(h.x + s / 2 + 1, h.y);
        ctx.closePath();
        ctx.strokeStyle = hexAlpha(h.color, alpha * 0.9);
        ctx.stroke();

        // Solar panel on roof
        if (h.hasSolar) {
          ctx.fillStyle = hexAlpha(colors.solar, alpha * 0.7);
          const pw = s * 0.45;
          const ph = s * 0.15;
          ctx.fillRect(h.x - pw / 2, h.y - s * 0.28, pw, ph);
        }

        // Center glow dot + sparkle bloom
        const glowSize = 5 + pulseBoost * 12 + sparkleIntensity * 18;
        ctx.shadowBlur = glowSize;
        ctx.shadowColor = hexAlpha(h.color, 0.4 + sparkleIntensity * 0.4);
        ctx.fillStyle = hexAlpha(h.color, alpha);
        ctx.beginPath();
        ctx.arc(h.x, h.y + s * 0.3, 0.7 + sparkleIntensity * 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Subtle pulse ring
      if (pulseT < 0.85) {
        ctx.strokeStyle = hexAlpha(colors.primary, 0.06 * pulseFade);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY, Math.max(0, pulseRadius), 0, Math.PI * 2);
        ctx.stroke();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
