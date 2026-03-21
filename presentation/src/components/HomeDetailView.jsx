import React, { useState, useEffect, useRef } from 'react';
import { colors } from '../theme';

// ── Inject keyframes once ──
const STYLE_ID = 'home-detail-animations';
if (typeof document !== 'undefined' && !document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @keyframes chargeSweep {
      0% { left: -40%; }
      100% { left: 140%; }
    }
    @keyframes chargePulse {
      0%,100% { opacity: 0.7; }
      50% { opacity: 1; }
    }
    @keyframes statusBlink {
      0%,100% { opacity: 1; }
      50% { opacity: 0.4; }
    }
  `;
  document.head.appendChild(style);
}

// ── Device row with full-width progress bar ──
function DeviceRow({ label, status, level, levelTarget, kw, flow, color, statusColor, capacityKwh, temp }) {
  const isActive = status !== 'off' && status !== 'paused' && status !== 'curtailed';
  const displayColor = statusColor || color;
  const isCharging = (status === 'charging' || status === 'pre-heat') && levelTarget !== undefined;
  const hasBar = level !== undefined;

  // Animate level from current to full (1.0) at proportional charge rate.
  // Duration scales with how much capacity remains and the charge rate (kw / capacityKwh),
  // so a 5 kW / 20 kWh battery visibly fills ~2× faster than an 11 kW / 87 kWh EV.
  // Animation runs once per HUD mount and stops at full.
  const [animLevel, setAnimLevel] = useState(level);
  const rafRef = useRef(null);
  const startRef = useRef(null);
  useEffect(() => {
    if (!isCharging) { setAnimLevel(level); return; }
    const from = level;
    const to = 1.0;
    // Compute duration from real charge rate: hours-to-full × 2.5s per hour (visual pace)
    const ratePerHour = capacityKwh > 0 ? kw / capacityKwh : 0.25;
    const hoursToFull = ratePerHour > 0 ? (to - from) / ratePerHour : 10;
    const duration = hoursToFull * 1250; // 1.25s per simulated hour (2× speed)
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setAnimLevel(from + (to - from) * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isCharging, level, levelTarget, capacityKwh, kw]);

  const displayLevel = isCharging ? animLevel : level;

  const statusLabel = status === 'pre-heat' ? 'THERMAL LOAD'
    : status === 'curtailed' ? 'CURTAILED'
    : status === 'paused' ? 'PAUSED'
    : status === 'weak' ? 'LOW OUTPUT'
    : status === 'charging' ? 'CHARGING'
    : status === 'discharging' ? 'DISCHARGING'
    : status;

  const flowLabel = flow === 'from-grid' ? 'FROM GRID'
    : flow === 'to-grid' ? 'TO GRID'
    : flow === 'to-home' ? 'TO HOME'
    : null;

  return (
    <div style={{ marginBottom: 2 }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Status indicator dot — glows when active */}
          <div style={{
            width: 7, height: 7, borderRadius: '50%',
            background: isActive ? displayColor : colors.textDim + '40',
            boxShadow: isActive ? `0 0 8px ${displayColor}, 0 0 16px ${displayColor}60` : 'none',
            animation: isActive ? ((isCharging || status === 'pre-heat') ? 'statusBlink 1s ease-in-out infinite' : 'chargePulse 2s ease-in-out infinite') : 'none',
          }} />
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: '"JetBrains Mono"',
            color: colors.text,
            letterSpacing: '0.1em',
          }}>
            {label}
          </span>
          <span style={{
            fontSize: 9, fontFamily: '"JetBrains Mono"',
            color: isActive ? displayColor : colors.textDim,
            textTransform: 'uppercase',
            animation: (isCharging || status === 'pre-heat') ? 'chargePulse 1.2s ease-in-out infinite' : 'none',
          }}>
            {statusLabel}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {capacityKwh && displayLevel !== undefined ? (
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"',
              color: displayColor,
              textShadow: isCharging ? `0 0 10px ${displayColor}60` : 'none',
            }}>
              {(displayLevel * capacityKwh).toFixed(1)}
              <span style={{ fontSize: 9, fontWeight: 400 }}> kWh</span>
            </span>
          ) : temp !== undefined ? (
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"',
              color: displayColor,
              textShadow: isActive ? `0 0 10px ${displayColor}60` : 'none',
            }}>
              {temp}
              <span style={{ fontSize: 10 }}>{'\u00B0'}C</span>
              {kw > 0 && (
                <span style={{ fontSize: 9, color: colors.textDim, fontWeight: 400, marginLeft: 6 }}>
                  {kw.toFixed(1)} kW
                </span>
              )}
            </span>
          ) : kw > 0 ? (
            <span style={{
              fontSize: 13, fontWeight: 700, fontFamily: '"JetBrains Mono"',
              color: displayColor,
              textShadow: isCharging ? `0 0 10px ${displayColor}60` : 'none',
            }}>
              {kw.toFixed(1)} kW
            </span>
          ) : null}
          {flowLabel && (
            <span style={{
              fontSize: 8, fontFamily: '"JetBrains Mono"',
              color: flow === 'from-grid' ? colors.text : colors.textDim,
              letterSpacing: '0.05em',
              padding: '1px 4px',
              border: `1px solid ${flow === 'from-grid' ? colors.text + '50' : colors.textDim + '30'}`,
              borderRadius: 2,
            }}>
              {flowLabel}
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {hasBar && (
        <div style={{
          width: '100%', height: 6, borderRadius: 1,
          background: colors.surfaceLight,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Fill */}
          <div style={{
            width: `${Math.min(100, displayLevel * 100)}%`,
            height: '100%',
            background: isActive
              ? `linear-gradient(90deg, ${displayColor}90, ${displayColor})`
              : colors.textDim + '40',
            borderRadius: 1,
            transition: isCharging ? 'none' : 'width 0.6s ease',
          }} />
          {/* Charging sweep effect */}
          {isCharging && (
            <div style={{
              position: 'absolute', top: 0, bottom: 0,
              width: '30%',
              background: `linear-gradient(90deg, transparent, ${displayColor}80, transparent)`,
              animation: 'chargeSweep 1.5s ease-in-out infinite',
            }} />
          )}
        </div>
      )}

      {/* Temperature bar for heat pump */}
      {!hasBar && temp !== undefined && (
        <div style={{
          width: '100%', height: 6, borderRadius: 1,
          background: colors.surfaceLight,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(100, Math.max(0, (temp / 24) * 100))}%`,
            height: '100%',
            background: isActive
              ? `linear-gradient(90deg, ${displayColor}60, ${displayColor})`
              : colors.textDim + '40',
            borderRadius: 1,
            transition: 'width 0.6s ease',
          }} />
        </div>
      )}

      {/* Power-only bar (no level, no temp) — shows activity as a pulsing line */}
      {!hasBar && temp === undefined && kw > 0 && (
        <div style={{
          width: '100%', height: 6, borderRadius: 1,
          background: colors.surfaceLight,
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '100%', height: '100%',
            background: `linear-gradient(90deg, ${displayColor}60, ${displayColor}, ${displayColor}60)`,
            animation: 'chargePulse 1.5s ease-in-out infinite',
            borderRadius: 1,
          }} />
        </div>
      )}

      {/* Inactive bar */}
      {!hasBar && temp === undefined && kw === 0 && (
        <div style={{
          width: '100%', height: 6, borderRadius: 1,
          background: colors.surfaceLight,
        }} />
      )}
    </div>
  );
}

// ── Per-home revenue counter ──
function HomeRevenueCounter({ priceCt, maxEnergyKwh, durationMs }) {
  // maxEnergyKwh = finite energy the household can absorb
  // durationMs = animation duration matching the longest charge bar (EV)
  const [earned, setEarned] = useState(0);
  const rafRef = useRef(null);
  const startRef = useRef(null);

  const maxEarned = maxEnergyKwh > 0 ? maxEnergyKwh * Math.abs(priceCt) / 100 : 0;

  useEffect(() => {
    if (priceCt >= 0 || maxEarned <= 0 || durationMs <= 0) { setEarned(0); return; }
    startRef.current = performance.now();
    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      // Ease-in-out to match charge bar easing
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      setEarned(maxEarned * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [priceCt, maxEarned, durationMs]);

  if (earned <= 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 6,
    }}>
      <span style={{ fontSize: 11, fontFamily: '"JetBrains Mono"', color: colors.textDim, fontWeight: 400, letterSpacing: '0.08em' }}>EARNED</span>
      <span style={{
        fontSize: 16, fontWeight: 700, fontFamily: '"JetBrains Mono"',
        color: colors.success,
        textShadow: `0 0 10px ${colors.success}50`,
      }}>
        +{'\u20AC'}{earned.toFixed(2)}
      </span>
    </div>
  );
}

export default function HomeDetailView({ homeDetail, showRevenue = false, style: styleProp = {} }) {
  if (!homeDetail) return null;

  const { solar, battery, ev, heatPump, gridPrice } = homeDetail;

  // Total kW being ingested from grid (for revenue calc)
  const gridIngestKw = [battery, ev, heatPump]
    .filter(d => d.flow === 'from-grid' && d.kw > 0)
    .reduce((sum, d) => sum + d.kw, 0);
  const priceCt = gridPrice ? parseFloat(gridPrice) : 0;

  // Max energy the household can absorb: remaining battery + EV capacity + heat pump over ~2hr window
  const batteryRemaining = battery.flow === 'from-grid' ? (1 - (battery.level || 0)) * 20 : 0;
  const evRemaining = ev.flow === 'from-grid' ? (1 - (ev.level || 0)) * 87 : 0;
  const heatPumpWindow = heatPump.flow === 'from-grid' && heatPump.kw > 0 ? heatPump.kw * 2 : 0;
  const maxEnergyKwh = batteryRemaining + evRemaining + heatPumpWindow;

  // EV charge duration (longest device) — revenue counter should match this timing
  const evRatePerHour = ev.kw > 0 ? ev.kw / 87 : 0.25;
  const evHoursToFull = evRatePerHour > 0 ? (1 - (ev.level || 0)) / evRatePerHour : 10;
  const revenueDurationMs = evHoursToFull * 1250; // matches charge bar pace (line 47)

  return (
    <div style={{ ...styleProp }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 10, paddingBottom: 6,
        borderBottom: `1px solid ${colors.primary}20`,
      }}>
        <span style={{
          fontSize: 10, fontWeight: 700, fontFamily: '"JetBrains Mono"',
          color: colors.textMuted, letterSpacing: '0.12em',
        }}>
          HOME SYSTEMS
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {showRevenue && priceCt < 0 && (
            <HomeRevenueCounter priceCt={priceCt} maxEnergyKwh={maxEnergyKwh} durationMs={revenueDurationMs} />
          )}
        </div>
      </div>

      {/* Stacked device rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <DeviceRow
          label="SOLAR"
          status={solar.status}
          kw={solar.kw}
          flow={solar.flow}
          color={colors.solar}
        />
        <DeviceRow
          label="BATTERY"
          status={battery.status}
          level={battery.level}
          levelTarget={battery.levelTarget}
          kw={battery.flow !== 'none' ? Math.abs(battery.kw || 0) : 0}
          flow={battery.flow}
          color={colors.battery}
          statusColor={battery.status === 'discharging' ? colors.accent : colors.battery}
          capacityKwh={20}
        />
        <DeviceRow
          label="EV"
          status={ev.status}
          level={ev.level}
          levelTarget={ev.levelTarget}
          kw={ev.flow !== 'none' ? Math.abs(ev.kw || 0) : 0}
          flow={ev.flow}
          color={colors.primary}
          statusColor={ev.status === 'paused' ? colors.accent : colors.primary}
          capacityKwh={87}
        />
        <DeviceRow
          label="HEAT PUMP"
          status={heatPump.status}
          kw={heatPump.kw}
          flow={heatPump.flow}
          color={colors.accent}
          statusColor={heatPump.status === 'paused' ? colors.textDim : colors.accent}
          temp={heatPump.temp ?? 21}
        />
      </div>
      <div style={{
        textAlign: 'center', marginTop: 10,
        fontSize: 9, fontFamily: '"JetBrains Mono"',
        color: '#ffffff', letterSpacing: '0.08em', opacity: 0.6,
      }}>
        slightly dramatized.
      </div>
    </div>
  );
}
