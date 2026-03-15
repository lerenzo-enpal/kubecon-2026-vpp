import React, { useEffect, useRef, useState, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

const SCENARIOS = [
  { label: 'Stable', freq: 50.0 },
  { label: 'Stress', freq: 49.6 },
  { label: 'Critical', freq: 49.0 },
  { label: 'Collapse', freq: 47.5 },
];

const HACKER_FRAMES = [
  [
    '    ╔══════════════════════════════╗',
    '    ║                              ║',
    '    ║      ┌─────────────────┐     ║',
    '    ║      │   ╭─────────╮   │     ║',
    '    ║      │   │  >_     │   │     ║',
    '    ║      │   │         │   │     ║',
    '    ║      │   ╰─────────╯   │     ║',
    '    ║      │  ┌───────────┐  │     ║',
    '    ║      │  │ ░░░░░░░░░ │  │     ║',
    '    ║      │  └───────────┘  │     ║',
    '    ║      └────────┬────────┘     ║',
    '    ║           ┌───┴───┐          ║',
    '    ║           └───────┘          ║',
    '    ║                              ║',
    '    ╚══════════════════════════════╝',
  ],
  [
    '    ╔══════════════════════════════╗',
    '    ║                              ║',
    '    ║      ┌─────────────────┐     ║',
    '    ║      │   ╭─────────╮   │     ║',
    '    ║      │   │  HA HA  │   │     ║',
    '    ║      │   │  HA HA  │   │     ║',
    '    ║      │   ╰─────────╯   │     ║',
    '    ║      │  ┌───────────┐  │     ║',
    '    ║      │  │ ▓▓▓▓▓▓▓▓▓ │  │     ║',
    '    ║      │  └───────────┘  │     ║',
    '    ║      └────────┬────────┘     ║',
    '    ║           ┌───┴───┐          ║',
    '    ║           └───────┘          ║',
    '    ║                              ║',
    '    ╚══════════════════════════════╝',
  ],
];

const TAUNT_LINES = [
  'ACCESS GRANTED',
  'SCADA SYSTEMS COMPROMISED',
  'lol nice firewall',
  'grid.shutdown() // ez',
  'should have used kubernetes ;)',
  'rm -rf /power/grid/*',
  '> transferring 400 GW to /dev/null',
];

export default function FrequencyDemo({ width = 900, height = 400 }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const tRef = useRef(0);
  const targetFreqRef = useRef(50.0);
  const currentFreqRef = useRef(50.0);
  const [scenario, setScenario] = useState(0);
  const warningFlashRef = useRef(0);
  const collapseTimeRef = useRef(null);
  const explosionParticlesRef = useRef([]);
  const glitchRef = useRef({ active: false, startTime: 0 });
  const hackerPhaseRef = useRef(0);

  // Restart animation when slide becomes active
  const slideContext = useContext(SlideContext);
  useEffect(() => {
    if (slideContext?.isSlideActive) {
      setScenario(0);
      targetFreqRef.current = 50.0;
      currentFreqRef.current = 50.0;
      collapseTimeRef.current = null;
      hackerPhaseRef.current = 0;
      glitchRef.current = { active: false, startTime: 0 };
      explosionParticlesRef.current = [];
    }
  }, [slideContext?.isSlideActive]);

  const switchScenario = (idx) => {
    setScenario(idx);
    targetFreqRef.current = SCENARIOS[idx].freq;
    if (idx < 3) {
      collapseTimeRef.current = null;
      hackerPhaseRef.current = 0;
      glitchRef.current = { active: false, startTime: 0 };
      explosionParticlesRef.current = [];
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const historyLen = 300;
    const history = new Array(historyLen).fill(50.0);

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      if (isActive) {
        tRef.current += 0.03;
        warningFlashRef.current += 0.05;
      }
      const t = tRef.current;

      // Smooth interpolation toward target
      const target = targetFreqRef.current;
      const speed = Math.abs(target - currentFreqRef.current) > 1 ? 0.008 : 0.004;
      currentFreqRef.current += (target - currentFreqRef.current) * speed;

      const instability = Math.abs(50.0 - currentFreqRef.current);
      const jitter = Math.sin(t * 5) * 0.02 + Math.sin(t * 13) * 0.01 + Math.sin(t * 31) * instability * 0.08;
      const freq = currentFreqRef.current + jitter;

      history.push(freq);
      if (history.length > historyLen) history.shift();

      // Detect collapse trigger
      if (freq < 47.6 && !collapseTimeRef.current) {
        collapseTimeRef.current = t;
        hackerPhaseRef.current = 1;
        // Spawn explosion particles
        const particles = [];
        for (let i = 0; i < 60; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 5;
          particles.push({
            x: width / 2, y: height / 2,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 2 + Math.random() * 6,
            life: 1.0,
            color: Math.random() > 0.5 ? colors.danger : (Math.random() > 0.5 ? colors.accent : '#ff6b35'),
          });
        }
        explosionParticlesRef.current = particles;
      }

      const collapseElapsed = collapseTimeRef.current ? t - collapseTimeRef.current : 0;

      // Phase transitions
      if (collapseElapsed > 2 && hackerPhaseRef.current === 1) {
        hackerPhaseRef.current = 2; // glitch
        glitchRef.current = { active: true, startTime: t };
      }
      if (collapseElapsed > 4 && hackerPhaseRef.current === 2) {
        hackerPhaseRef.current = 3; // hacker
      }

      // ═══ PHASE 3: HACKER SCREEN ═══
      if (hackerPhaseRef.current === 3) {
        ctx.fillStyle = '#020804';
        ctx.fillRect(0, 0, width, height);

        // Scanlines
        for (let y = 0; y < height; y += 3) {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.02 + Math.sin(y * 0.1 + t * 2) * 0.01})`;
          ctx.fillRect(0, y, width, 1);
        }

        // CRT flicker
        const flicker = 0.92 + Math.random() * 0.08;
        ctx.globalAlpha = flicker;

        // Hacker ASCII art
        const hackerFrame = HACKER_FRAMES[Math.floor(t * 2) % 2];
        ctx.font = '13px JetBrains Mono';
        ctx.textAlign = 'center';
        const artStartY = 40;
        hackerFrame.forEach((line, i) => {
          ctx.fillStyle = `rgba(16, 185, 129, ${0.7 + Math.sin(t * 3 + i * 0.5) * 0.3})`;
          ctx.fillText(line, width / 2, artStartY + i * 16);
        });

        // Taunt text - types out character by character
        const tauntIdx = Math.floor((collapseElapsed - 4) / 2) % TAUNT_LINES.length;
        const tauntProgress = ((collapseElapsed - 4) % 2) / 2;
        const currentTaunt = TAUNT_LINES[tauntIdx];
        const visibleChars = Math.floor(tauntProgress * currentTaunt.length * 1.5);
        const displayText = currentTaunt.substring(0, Math.min(visibleChars, currentTaunt.length));

        ctx.font = 'bold 18px JetBrains Mono';
        ctx.fillStyle = colors.success;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.success;
        ctx.fillText('> ' + displayText + (Math.sin(t * 6) > 0 ? '█' : ''), width / 2, artStartY + hackerFrame.length * 16 + 30);
        ctx.shadowBlur = 0;

        // Laughing text that bounces
        if (collapseElapsed > 6) {
          const laughT = collapseElapsed - 6;
          const bounce = Math.abs(Math.sin(laughT * 4)) * 10;
          ctx.font = `bold ${24 + Math.sin(laughT * 8) * 4}px JetBrains Mono`;
          ctx.fillStyle = colors.success;
          ctx.shadowBlur = 20;
          ctx.shadowColor = colors.success;
          ctx.textAlign = 'center';

          const laughText = 'HA '.repeat(Math.min(Math.floor(laughT * 3) + 1, 8)).trim();
          ctx.fillText(laughText, width / 2 + Math.sin(laughT * 5) * 8, height - 70 - bounce);
          ctx.shadowBlur = 0;

          // Small subtitle
          ctx.font = '12px JetBrains Mono';
          ctx.fillStyle = colors.success + '80';
          ctx.fillText('[ grid_operator has left the chat ]', width / 2, height - 40);
        }

        // Matrix rain in background
        ctx.font = '11px JetBrains Mono';
        for (let col = 0; col < 30; col++) {
          const x = col * (width / 30);
          const charIdx = Math.floor(t * 8 + col * 7) % 30;
          for (let row = 0; row < 4; row++) {
            const y = ((charIdx + row * 8) * 20) % height;
            const alpha = 0.05 + (row === 0 ? 0.15 : 0);
            ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
            const chars = '01アイウエオカキクケコ';
            ctx.fillText(chars[Math.floor(Math.random() * chars.length)], x, y);
          }
        }

        ctx.globalAlpha = 1;

        // "Press Stable to restore" hint
        const hintFlash = Math.sin(t * 2) > 0;
        if (hintFlash) {
          ctx.font = '11px JetBrains Mono';
          ctx.fillStyle = colors.textDim + '60';
          ctx.textAlign = 'center';
          ctx.fillText('[ click STABLE to restore grid ]', width / 2, height - 14);
        }

        if (isActive) animRef.current = requestAnimationFrame(draw);
        return;
      }

      // ═══ PHASE 2: GLITCH TRANSITION ═══
      if (hackerPhaseRef.current === 2) {
        // Draw normal frame first, then corrupt it
        ctx.fillStyle = '#060a12';
        ctx.fillRect(0, 0, width, height);

        const glitchIntensity = Math.min(1, (t - glitchRef.current.startTime) * 0.5);

        // Random block displacement
        for (let i = 0; i < 15 * glitchIntensity; i++) {
          const blockH = 5 + Math.random() * 30;
          const blockY = Math.random() * height;
          const shift = (Math.random() - 0.5) * 100 * glitchIntensity;
          ctx.drawImage(canvas, 0, blockY * 2, width * 2, blockH * 2, shift, blockY, width, blockH);
        }

        // Red/cyan split
        ctx.globalCompositeOperation = 'lighter';
        ctx.fillStyle = `rgba(239, 68, 68, ${0.1 * glitchIntensity})`;
        ctx.fillRect(Math.random() * 20 - 10, 0, width, height);
        ctx.fillStyle = `rgba(34, 211, 238, ${0.1 * glitchIntensity})`;
        ctx.fillRect(Math.random() * -20 + 10, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';

        // Corrupted text
        ctx.font = 'bold 28px JetBrains Mono';
        ctx.textAlign = 'center';
        const corruptTexts = ['SYSTEM FAILURE', 'ERR_GRID_DOWN', 'FATAL: frequency.c:47', 'segfault in power_balance()', '*** KERNEL PANIC ***'];
        for (let i = 0; i < 3 + glitchIntensity * 5; i++) {
          ctx.fillStyle = `rgba(239, 68, 68, ${0.3 + Math.random() * 0.5})`;
          const txt = corruptTexts[Math.floor(Math.random() * corruptTexts.length)];
          ctx.fillText(txt, width / 2 + (Math.random() - 0.5) * 40, Math.random() * height);
        }

        // Static noise
        const imageData = ctx.getImageData(0, 0, 20, 20);
        for (let i = 0; i < imageData.data.length; i += 4) {
          if (Math.random() < 0.3 * glitchIntensity) {
            imageData.data[i] = 239;
            imageData.data[i + 1] = 68;
            imageData.data[i + 2] = 68;
            imageData.data[i + 3] = Math.floor(Math.random() * 80);
          }
        }
        // Tile the noise
        for (let x = 0; x < width * 2; x += 20) {
          for (let y = 0; y < height * 2; y += 20) {
            if (Math.random() < 0.3 * glitchIntensity) {
              ctx.putImageData(imageData, x, y);
            }
          }
        }

        if (isActive) animRef.current = requestAnimationFrame(draw);
        return;
      }

      // ═══ NORMAL / PHASE 1 (explosion overlay) ═══
      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, width, height);

      const freqToY = (f) => {
        const range = 4;
        return height * 0.1 + (52 - f) / range * (height * 0.7);
      };

      // Danger zone bg
      if (freq < 49.5) {
        const dangerAlpha = Math.min(0.15, (49.5 - freq) * 0.1);
        const pulse = Math.sin(warningFlashRef.current * 3) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${dangerAlpha * (0.5 + pulse * 0.5)})`;
        const y49 = freqToY(49.0);
        ctx.fillRect(0, y49, width, height - y49);
      }

      // Threshold lines
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1;

      const y50 = freqToY(50.0);
      ctx.strokeStyle = colors.primary + '25';
      ctx.beginPath(); ctx.moveTo(60, y50); ctx.lineTo(width, y50); ctx.stroke();
      ctx.fillStyle = colors.primary + '50';
      ctx.font = '10px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText('50.000 Hz — NOMINAL', 62, y50 - 6);

      const y495 = freqToY(49.5);
      ctx.strokeStyle = colors.accent + '25';
      ctx.beginPath(); ctx.moveTo(60, y495); ctx.lineTo(width, y495); ctx.stroke();
      ctx.fillStyle = colors.accent + '50';
      ctx.fillText('49.500 Hz — PRIMARY RESERVE', 62, y495 - 6);

      const y49 = freqToY(49.0);
      ctx.strokeStyle = colors.danger + '35';
      ctx.beginPath(); ctx.moveTo(60, y49); ctx.lineTo(width, y49); ctx.stroke();
      ctx.fillStyle = colors.danger + '70';
      ctx.fillText('49.000 Hz — LOAD SHEDDING', 62, y49 - 6);

      const y475 = freqToY(47.5);
      ctx.strokeStyle = colors.danger + '50';
      ctx.beginPath(); ctx.moveTo(60, y475); ctx.lineTo(width, y475); ctx.stroke();
      ctx.fillStyle = colors.danger + '90';
      ctx.fillText('47.500 Hz — TOTAL COLLAPSE', 62, y475 - 6);

      ctx.setLineDash([]);

      // Frequency trace
      const lineColor = freq < 48.5 ? colors.danger : freq < 49.0 ? colors.danger : freq < 49.5 ? colors.accent : colors.primary;

      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2.5;
      ctx.shadowBlur = 12;
      ctx.shadowColor = lineColor;
      history.forEach((f, i) => {
        const x = 60 + (i / historyLen) * (width - 80);
        const y = freqToY(f);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glow dot
      const dotX = width - 20;
      const dotY = freqToY(freq);
      ctx.beginPath(); ctx.arc(dotX, dotY, 5, 0, Math.PI * 2); ctx.fillStyle = lineColor; ctx.fill();
      ctx.beginPath(); ctx.arc(dotX, dotY, 10, 0, Math.PI * 2); ctx.fillStyle = lineColor + '30'; ctx.fill();

      // Frequency readout
      ctx.fillStyle = lineColor;
      ctx.font = 'bold 36px JetBrains Mono';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 20;
      ctx.shadowColor = lineColor;

      // Glitch the number display when collapsing
      if (hackerPhaseRef.current === 1 && collapseElapsed > 1) {
        const glitchOffset = (Math.random() - 0.5) * 10;
        ctx.fillText(`${freq.toFixed(3)} Hz`, width - 16 + glitchOffset, 40 + (Math.random() - 0.5) * 4);
      } else {
        ctx.fillText(`${freq.toFixed(3)} Hz`, width - 16, 40);
      }
      ctx.shadowBlur = 0;

      // Status
      let status = 'GRID STABLE';
      let statusColor = colors.primary;
      if (freq < 47.5) { status = 'GRID COLLAPSE'; statusColor = colors.danger; }
      else if (freq < 48.5) { status = 'EMERGENCY — ROLLING BLACKOUTS'; statusColor = colors.danger; }
      else if (freq < 49.0) { status = 'LOAD SHEDDING ACTIVE'; statusColor = colors.danger; }
      else if (freq < 49.5) { status = 'WARNING — RESERVES ACTIVATED'; statusColor = colors.accent; }
      else if (freq < 49.8) { status = 'FREQUENCY DEVIATION'; statusColor = colors.accent; }

      ctx.font = '13px JetBrains Mono';
      ctx.textAlign = 'right';
      if (freq < 49.0) {
        const flash = Math.sin(warningFlashRef.current * 4) > 0;
        ctx.fillStyle = flash ? statusColor : statusColor + '40';
      } else {
        ctx.fillStyle = statusColor + 'cc';
      }
      ctx.fillText(status, width - 16, 60);

      // Alert banners
      if (freq < 48.5) {
        const flash = Math.sin(warningFlashRef.current * 6) > 0;
        if (flash) {
          ctx.fillStyle = colors.danger + '12';
          ctx.fillRect(0, height - 44, width, 44);
          ctx.fillStyle = colors.danger;
          ctx.font = 'bold 16px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('\u26a0  GRID FAILURE IMMINENT  \u26a0', width / 2, height - 18);
        }
      } else if (freq < 49.0) {
        const flash = Math.sin(warningFlashRef.current * 3) > 0.3;
        if (flash) {
          ctx.fillStyle = colors.danger + '08';
          ctx.fillRect(0, height - 36, width, 36);
          ctx.fillStyle = colors.danger + 'cc';
          ctx.font = '13px JetBrains Mono';
          ctx.textAlign = 'center';
          ctx.fillText('AUTOMATIC LOAD SHEDDING IN PROGRESS', width / 2, height - 14);
        }
      }

      // Left axis
      ctx.fillStyle = colors.textDim + '60';
      ctx.font = '9px JetBrains Mono';
      ctx.textAlign = 'right';
      for (let f = 48; f <= 52; f += 0.5) {
        const y = freqToY(f);
        if (y > 10 && y < height - 10) ctx.fillText(f.toFixed(1), 54, y + 3);
      }

      // ═══ EXPLOSION PARTICLES (Phase 1) ═══
      if (hackerPhaseRef.current === 1) {
        const particles = explosionParticlesRef.current;

        // Screen shake
        if (collapseElapsed < 1.5) {
          const shakeX = (Math.random() - 0.5) * 20 * (1 - collapseElapsed / 1.5);
          const shakeY = (Math.random() - 0.5) * 20 * (1 - collapseElapsed / 1.5);
          ctx.translate(shakeX, shakeY);
        }

        // White flash at moment of collapse
        if (collapseElapsed < 0.15) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - collapseElapsed / 0.15)})`;
          ctx.fillRect(-20, -20, width + 40, height + 40);
        }

        // Draw & update particles
        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05; // gravity
          p.life -= 0.008;

          if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fillStyle = p.color + Math.floor(p.life * 255).toString(16).padStart(2, '0');
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color;
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        });

        // "BOOM" text
        if (collapseElapsed < 1.5) {
          const boomScale = Math.min(1, collapseElapsed * 3);
          const boomAlpha = Math.max(0, 1 - collapseElapsed / 1.5);
          ctx.font = `bold ${60 * boomScale}px JetBrains Mono`;
          ctx.fillStyle = `rgba(239, 68, 68, ${boomAlpha})`;
          ctx.textAlign = 'center';
          ctx.shadowBlur = 30;
          ctx.shadowColor = colors.danger;
          ctx.fillText('BLACKOUT', width / 2, height / 2);
          ctx.shadowBlur = 0;
        }

        ctx.setTransform(2, 0, 0, 2, 0, 0); // reset shake
      }

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, slideContext?.isSlideActive]);

  return (
    <div style={{ position: 'relative' }}>
      <canvas
        ref={canvasRef}
        style={{
          width,
          height,
          /* border removed for seamless slide integration */
        }}
      />
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 6 }}>
        {SCENARIOS.map((s, i) => {
          const isActive = scenario === i;
          const btnColor = i === 0 ? colors.primary : i === 1 ? colors.accent : colors.danger;
          return (
            <button
              key={s.label}
              onClick={() => switchScenario(i)}
              style={{
                background: isActive ? `${btnColor}25` : colors.surface,
                border: `1px solid ${isActive ? btnColor : colors.surfaceLight}`,
                color: isActive ? btnColor : colors.textMuted,
                padding: '5px 14px',
                borderRadius: 6,
                cursor: 'pointer',
                fontSize: 12,
                fontFamily: '"JetBrains Mono"',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.2s',
              }}
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
