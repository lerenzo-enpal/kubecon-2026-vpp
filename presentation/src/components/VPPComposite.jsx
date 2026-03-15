import React from 'react';
import { useSteps } from 'spectacle';
import { colors } from '../theme';
import VPPArchitecture from './VPPArchitecture';

/**
 * VPPComposite — progressive build slide:
 * Step 0: "How It Works" VPP Architecture animation (full center)
 * Step 1: Architecture shrinks & moves up-right, Architecture Parallel rows appear
 * Step 2: Fastest Power Plant bars appear along the bottom
 */

const ARCH_ROWS = [
  { grid: 'Few large generators, centralized dispatch', vpp: 'Millions of edge nodes, distributed', color: colors.danger },
  { grid: 'Manual capacity planning', vpp: 'Horizontal autoscaling', color: colors.accent },
  { grid: 'Isolated resilience (relays, islanding)', vpp: 'Integrated resilience (coordinated)', color: colors.primary },
  { grid: 'Centralized observability (SCADA)', vpp: 'Full-stack observability (per-device)', color: colors.success },
];

const SPEED_BARS = [
  { l: 'Coal', v: '2-6 hours', c: colors.textDim, w: 90 },
  { l: 'Gas Turbine', v: '10-30 min', c: '#fb923c', w: 45 },
  { l: 'Hydro', v: '15-30 sec', c: '#60a5fa', w: 12 },
  { l: 'Battery', v: '140 ms', c: colors.success, w: 2 },
];

export default function VPPComposite() {
  const { step: rawStep, placeholder } = useSteps(2); // steps: -1, 0, 1
  const step = rawStep + 1; // 0, 1, 2

  const trans = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

  return (
    <div className="relative w-full h-full overflow-hidden">
      {placeholder}

      {/* === LAYER: How It Works (VPP Architecture) === */}
      {/* Step 0: full center. Step 1+: shrinks to top-right */}
      <div style={{
        position: 'absolute',
        transition: trans,
        ...(step === 0 ? {
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        } : {
          top: 8,
          right: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }),
      }}>
        {step === 0 && (
          <div className="text-[26px] font-bold text-hud-text font-sans mb-3">How It Works</div>
        )}
        <VPPArchitecture
          width={step === 0 ? 920 : 560}
          height={step === 0 ? 420 : 220}
        />
      </div>

      {/* === LAYER: Architecture Parallel === */}
      {/* Step 1: appears center-left */}
      <div style={{
        position: 'absolute',
        left: 20,
        right: 380,
        transition: trans,
        opacity: step >= 1 ? 1 : 0,
        transform: step >= 1 ? 'translateX(0)' : 'translateX(-40px)',
        pointerEvents: step >= 1 ? 'auto' : 'none',
        top: 20,
        bottom: step >= 2 ? 175 : 30,
      }}>
        <div className="text-[18px] font-bold text-hud-text font-sans mb-3">The Architecture Parallel</div>
        <div className="flex flex-col gap-2.5">
          {ARCH_ROWS.map((row, i) => (
            <div key={i} className="flex gap-2 items-center" style={{
              opacity: step >= 1 ? 1 : 0,
              transform: step >= 1 ? 'translateX(0)' : 'translateX(-20px)',
              transition: `all 0.4s ease-out ${0.1 + i * 0.12}s`,
            }}>
              <div className="flex-1 rounded px-3 py-2" style={{
                background: `${row.color}08`,
                border: `1px solid ${row.color}18`,
              }}>
                <div className="text-[14px] font-semibold font-sans" style={{ color: row.color }}>{row.grid}</div>
              </div>
              <div className="text-[14px] text-hud-text-dim font-mono">vs</div>
              <div className="flex-1 rounded px-3 py-2 bg-hud-surface border border-hud-surface-light">
                <div className="text-[14px] text-hud-text font-sans font-medium">{row.vpp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === LAYER: Fastest Power Plant === */}
      {/* Step 2: slides up from bottom */}
      <div style={{
        position: 'absolute',
        left: 20,
        right: 20,
        bottom: 10,
        transition: trans,
        opacity: step >= 2 ? 1 : 0,
        transform: step >= 2 ? 'translateY(0)' : 'translateY(30px)',
        pointerEvents: step >= 2 ? 'auto' : 'none',
      }}>
        <div className="text-[16px] font-bold text-hud-text font-sans mb-2">The Fastest Power Plant</div>
        <div className="flex gap-3 items-end">
          {SPEED_BARS.map(r => (
            <div key={r.l} className="flex items-center gap-2 flex-1">
              <div className="text-[12px] font-medium text-hud-text-muted font-sans text-right w-[70px]">{r.l}</div>
              <div className="h-[24px] rounded flex-1 flex items-center pl-2" style={{
                maxWidth: `${r.w}%`,
                background: `linear-gradient(90deg, ${r.c}30, ${r.c}80)`,
                transition: `max-width 0.6s ease-out`,
              }}>
                <span className="font-mono text-[12px] font-semibold text-hud-text whitespace-nowrap">{r.v}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 rounded-lg px-3 py-2" style={{ background: `${colors.success}08`, border: `1px solid ${colors.success}20` }}>
          <div className="text-[13px] font-semibold font-sans" style={{ color: colors.success }}>A battery responds before a gas turbine even knows there's an emergency.</div>
        </div>
      </div>
    </div>
  );
}
