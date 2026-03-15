import React, { useEffect, useRef, useState, useContext } from 'react';
import { SlideContext } from 'spectacle';
import { colors } from '../theme';

const NODES = [
  // German grid nodes - simplified topology
  // { id, x, y, type, label, capacity }
  { id: 'ham', x: 340, y: 80, type: 'wind', label: 'Hamburg', cap: 4.2 },
  { id: 'ber', x: 520, y: 130, type: 'solar', label: 'Berlin', cap: 3.1 },
  { id: 'han', x: 300, y: 170, type: 'gas', label: 'Hannover', cap: 2.8 },
  { id: 'dre', x: 560, y: 210, type: 'coal', label: 'Dresden', cap: 3.5 },
  { id: 'ess', x: 180, y: 230, type: 'coal', label: 'Essen', cap: 5.0 },
  { id: 'fra', x: 300, y: 320, type: 'nuclear', label: 'Frankfurt', cap: 4.5 },
  { id: 'lei', x: 440, y: 260, type: 'gas', label: 'Leipzig', cap: 2.2 },
  { id: 'stu', x: 280, y: 420, type: 'solar', label: 'Stuttgart', cap: 3.8 },
  { id: 'mun', x: 420, y: 460, type: 'solar', label: 'Munich', cap: 4.0 },
  { id: 'nur', x: 400, y: 380, type: 'gas', label: 'Nuremberg', cap: 2.5 },
];

const LINES = [
  ['ham', 'ber'], ['ham', 'han'], ['ber', 'dre'], ['han', 'ess'],
  ['han', 'fra'], ['han', 'lei'], ['dre', 'lei'], ['ess', 'fra'],
  ['fra', 'stu'], ['fra', 'nur'], ['lei', 'nur'], ['stu', 'mun'],
  ['nur', 'mun'],
];

const typeColors = {
  wind: '#60a5fa',
  solar: colors.solar,
  gas: '#fb923c',
  coal: '#94a3b8',
  nuclear: colors.secondary,
};

export default function CascadeSimulation({ width = 740, height = 540, withVPP = false }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const [phase, setPhase] = useState('stable'); // stable, trigger, cascade, (recover if VPP)
  const [freq, setFreq] = useState(50.0);
  const phaseRef = useRef('stable');
  const startTimeRef = useRef(null);
  const failedRef = useRef(new Set());
  const overloadRef = useRef({});

  const reset = () => {
    phaseRef.current = 'stable';
    setPhase('stable');
    setFreq(50.0);
    startTimeRef.current = null;
    failedRef.current = new Set();
    overloadRef.current = {};
  };

  const triggerCascade = () => {
    phaseRef.current = 'trigger';
    setPhase('trigger');
    startTimeRef.current = performance.now();
    failedRef.current = new Set(['ess']); // Essen coal plant trips
    overloadRef.current = {};
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const draw = () => {
      const isActive = slideContext?.isSlideActive;
      const now = performance.now();
      const elapsed = startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#080c14';
      ctx.fillRect(0, 0, width, height);

      // Germany outline (simplified)
      ctx.strokeStyle = colors.textDim + '20';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(280, 40); ctx.lineTo(380, 35); ctx.lineTo(520, 60);
      ctx.lineTo(600, 120); ctx.lineTo(590, 250); ctx.lineTo(540, 310);
      ctx.lineTo(480, 400); ctx.lineTo(450, 500); ctx.lineTo(350, 510);
      ctx.lineTo(250, 470); ctx.lineTo(220, 400); ctx.lineTo(180, 340);
      ctx.lineTo(140, 260); ctx.lineTo(160, 180); ctx.lineTo(200, 120);
      ctx.lineTo(280, 40);
      ctx.stroke();

      // Cascade logic (only advance when active)
      if (isActive) {
        if (phaseRef.current === 'trigger' && elapsed > 1) {
          phaseRef.current = 'cascade';
          setPhase('cascade');
        }

        if (phaseRef.current === 'cascade') {
          const cascadeOrder = ['fra', 'han', 'lei', 'stu', 'nur', 'dre', 'mun', 'ber', 'ham'];
          const cascadeDelay = withVPP ? 4 : 1.2;

          cascadeOrder.forEach((nodeId, i) => {
            const triggerTime = 1 + (i + 1) * cascadeDelay;
            if (!withVPP && elapsed > triggerTime && !failedRef.current.has(nodeId)) {
              failedRef.current.add(nodeId);
            }
            // Overload before failure
            if (elapsed > triggerTime - cascadeDelay * 0.7) {
              overloadRef.current[nodeId] = Math.min(1, (elapsed - (triggerTime - cascadeDelay * 0.7)) / (cascadeDelay * 0.5));
            }
          });

          // With VPP: stabilize after initial impact
          if (withVPP && elapsed > 3) {
            phaseRef.current = 'recover';
            setPhase('recover');
          }
        }
      }

      // Calculate frequency
      let currentFreq = 50.0;
      if (phaseRef.current !== 'stable') {
        const failCount = failedRef.current.size;
        if (withVPP) {
          // Dip then recover
          if (elapsed < 1.5) currentFreq = 50.0 - elapsed * 0.4;
          else if (elapsed < 3) currentFreq = 49.4 + (elapsed - 1.5) * 0.3;
          else currentFreq = 49.85 + Math.sin(now / 500) * 0.03;
        } else {
          currentFreq = 50.0 - failCount * 0.25 - Math.max(0, elapsed - 1) * 0.08;
          currentFreq = Math.max(47.0, currentFreq);
        }
      }
      currentFreq += Math.sin(now / 300) * 0.01;
      if (isActive) setFreq(currentFreq);

      // Draw transmission lines
      LINES.forEach(([a, b]) => {
        const nodeA = NODES.find(n => n.id === a);
        const nodeB = NODES.find(n => n.id === b);
        const aFailed = failedRef.current.has(a);
        const bFailed = failedRef.current.has(b);
        const overload = Math.max(overloadRef.current[a] || 0, overloadRef.current[b] || 0);

        ctx.beginPath();
        ctx.moveTo(nodeA.x, nodeA.y);
        ctx.lineTo(nodeB.x, nodeB.y);

        if (aFailed && bFailed) {
          ctx.strokeStyle = colors.danger + '30';
          ctx.lineWidth = 1;
        } else if (overload > 0) {
          const r = Math.floor(239 * overload + 34 * (1 - overload));
          const g = Math.floor(68 * overload + 211 * (1 - overload));
          const b2 = Math.floor(68 * overload + 238 * (1 - overload));
          ctx.strokeStyle = `rgb(${r},${g},${b2})`;
          ctx.lineWidth = 1.5 + overload * 1.5;
        } else {
          ctx.strokeStyle = colors.primary + '50';
          ctx.lineWidth = 1.5;
        }
        ctx.stroke();

        // Animated flow dots
        if (!aFailed || !bFailed) {
          const flowT = (now / 2000 + LINES.indexOf([a,b]) * 0.3) % 1;
          const dotX = nodeA.x + (nodeB.x - nodeA.x) * flowT;
          const dotY = nodeA.y + (nodeB.y - nodeA.y) * flowT;
          ctx.beginPath();
          ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
          ctx.fillStyle = ctx.strokeStyle;
          ctx.fill();
        }
      });

      // Draw VPP batteries (if enabled)
      if (withVPP) {
        const batteryPositions = [
          { x: 350, y: 110 }, { x: 500, y: 160 }, { x: 220, y: 260 },
          { x: 460, y: 290 }, { x: 320, y: 360 }, { x: 380, y: 440 },
          { x: 260, y: 200 }, { x: 540, y: 270 }, { x: 340, y: 270 },
          { x: 450, y: 370 }, { x: 200, y: 320 }, { x: 490, y: 430 },
          { x: 310, y: 450 }, { x: 560, y: 180 }, { x: 400, y: 180 },
          { x: 240, y: 380 }, { x: 350, y: 500 }, { x: 160, y: 270 },
        ];

        const vppActive = phaseRef.current === 'recover' || (phaseRef.current === 'cascade' && elapsed > 1.5);

        batteryPositions.forEach((pos, i) => {
          const pulse = vppActive ? Math.sin(now / 200 + i) * 0.3 + 0.7 : 0.3;
          const size = vppActive ? 5 + Math.sin(now / 300 + i * 0.5) * 1.5 : 3;

          if (vppActive) {
            ctx.beginPath();
            ctx.arc(pos.x, pos.y, size + 6, 0, Math.PI * 2);
            ctx.fillStyle = colors.success + '15';
            ctx.fill();
          }

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, size, 0, Math.PI * 2);
          ctx.fillStyle = vppActive
            ? `rgba(16, 185, 129, ${pulse})`
            : colors.success + '30';
          ctx.fill();
        });
      }

      // Draw nodes
      NODES.forEach(node => {
        const failed = failedRef.current.has(node.id);
        const overload = overloadRef.current[node.id] || 0;
        const isTriggered = node.id === 'ess' && phaseRef.current !== 'stable';

        // Glow
        if (!failed) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
          ctx.fillStyle = (overload > 0 ? colors.danger : typeColors[node.type]) + '15';
          ctx.fill();
        }

        // Node circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, 12, 0, Math.PI * 2);

        if (failed) {
          ctx.fillStyle = colors.danger + '40';
          ctx.strokeStyle = colors.danger;
          // X mark
          ctx.fillStyle = colors.danger + '30';
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(node.x - 5, node.y - 5);
          ctx.lineTo(node.x + 5, node.y + 5);
          ctx.moveTo(node.x + 5, node.y - 5);
          ctx.lineTo(node.x - 5, node.y + 5);
          ctx.strokeStyle = colors.danger;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else if (isTriggered) {
          ctx.fillStyle = colors.danger + '60';
          ctx.fill();
          ctx.strokeStyle = colors.danger;
          ctx.lineWidth = 2;
          ctx.stroke();
        } else {
          ctx.fillStyle = overload > 0
            ? `rgba(239, 68, 68, ${0.2 + overload * 0.4})`
            : typeColors[node.type] + '30';
          ctx.fill();
          ctx.strokeStyle = overload > 0
            ? colors.danger
            : typeColors[node.type];
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Label
        ctx.fillStyle = failed ? colors.danger + '60' : colors.text + 'cc';
        ctx.font = '11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.x, node.y + 26);

        if (!failed) {
          ctx.fillStyle = colors.textMuted;
          ctx.font = '9px JetBrains Mono';
          ctx.fillText(`${node.cap} GW`, node.x, node.y + 37);
        }
      });

      // Frequency display
      ctx.fillStyle = currentFreq < 49.0 ? colors.danger : currentFreq < 49.5 ? colors.accent : colors.primary;
      ctx.font = 'bold 24px JetBrains Mono';
      ctx.textAlign = 'left';
      ctx.fillText(`${currentFreq.toFixed(3)} Hz`, 20, 30);

      // Status
      ctx.font = '14px Inter';
      ctx.fillStyle = colors.textMuted;
      const statusMap = {
        stable: 'GRID STABLE',
        trigger: 'GENERATOR TRIP — ESSEN 5.0 GW',
        cascade: withVPP ? 'VPP FLEET RESPONDING...' : 'CASCADE IN PROGRESS',
        recover: 'VPP STABILIZED — FREQUENCY RECOVERED',
      };
      ctx.fillText(statusMap[phaseRef.current], 20, 52);

      if (withVPP && (phaseRef.current === 'cascade' || phaseRef.current === 'recover')) {
        ctx.fillStyle = colors.success;
        ctx.font = '12px JetBrains Mono';
        ctx.fillText('18 VPP CLUSTERS ACTIVE — 2.5 GW INJECTED', 20, 72);
      }

      // Legend
      const legendY = height - 30;
      ctx.font = '10px Inter';
      ctx.textAlign = 'left';
      [
        { color: '#60a5fa', label: 'Wind' },
        { color: colors.solar, label: 'Solar' },
        { color: '#fb923c', label: 'Gas' },
        { color: '#94a3b8', label: 'Coal' },
        ...(withVPP ? [{ color: colors.success, label: 'VPP Battery' }] : []),
      ].forEach((item, i) => {
        const lx = 20 + i * 80;
        ctx.beginPath();
        ctx.arc(lx, legendY, 4, 0, Math.PI * 2);
        ctx.fillStyle = item.color;
        ctx.fill();
        ctx.fillStyle = colors.textMuted;
        ctx.fillText(item.label, lx + 8, legendY + 4);
      });

      if (isActive) animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [width, height, withVPP, slideContext?.isSlideActive]);

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
      <div style={{ position: 'absolute', bottom: 12, right: 12, display: 'flex', gap: 8 }}>
        <button
          onClick={reset}
          style={{
            background: colors.surface,
            border: `1px solid ${colors.surfaceLight}`,
            color: colors.textMuted,
            padding: '6px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'Inter',
          }}
        >
          Reset
        </button>
        <button
          onClick={triggerCascade}
          style={{
            background: phaseRef.current === 'stable' ? colors.danger + '20' : colors.surface,
            border: `1px solid ${colors.danger}80`,
            color: colors.danger,
            padding: '6px 16px',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 13,
            fontFamily: 'Inter',
            fontWeight: 600,
          }}
        >
          Trip Generator
        </button>
      </div>
    </div>
  );
}
