import React from 'react';
import { colors } from '../theme';

// Home schematic overlay for the Hollywood zoom view
// Shows solar, battery, EV, heat pump with status indicators and flow arrows

function DeviceBox({ label, status, level, kw, flow, color, statusColor }) {
  const isActive = status !== 'off' && status !== 'paused';
  const displayColor = statusColor || color;
  return (
    <div style={{
      background: 'rgba(5, 8, 16, 0.85)',
      border: `1px solid ${displayColor}${isActive ? '50' : '20'}`,
      borderRadius: 3,
      padding: '6px 8px',
      minWidth: 90,
      position: 'relative',
    }}>
      {/* Corner brackets */}
      <div style={{ position: 'absolute', top: -1, left: -1, width: 6, height: 6, borderTop: `1px solid ${displayColor}80`, borderLeft: `1px solid ${displayColor}80` }} />
      <div style={{ position: 'absolute', top: -1, right: -1, width: 6, height: 6, borderTop: `1px solid ${displayColor}80`, borderRight: `1px solid ${displayColor}80` }} />
      <div style={{ position: 'absolute', bottom: -1, left: -1, width: 6, height: 6, borderBottom: `1px solid ${displayColor}80`, borderLeft: `1px solid ${displayColor}80` }} />
      <div style={{ position: 'absolute', bottom: -1, right: -1, width: 6, height: 6, borderBottom: `1px solid ${displayColor}80`, borderRight: `1px solid ${displayColor}80` }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: isActive ? displayColor : colors.textDim + '40',
          boxShadow: isActive ? `0 0 6px ${displayColor}80` : 'none',
        }} />
        <span style={{
          fontSize: 9, fontWeight: 700, fontFamily: '"JetBrains Mono"',
          color: isActive ? displayColor : colors.textDim,
          letterSpacing: '0.08em',
        }}>
          {label}
        </span>
      </div>

      <div style={{
        fontSize: 8, fontFamily: '"JetBrains Mono"',
        color: colors.textMuted, textTransform: 'uppercase',
        marginBottom: 3,
      }}>
        {status}
      </div>

      {level !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
          <div style={{
            flex: 1, height: 4, borderRadius: 2,
            background: colors.surfaceLight,
          }}>
            <div style={{
              width: `${Math.min(100, level * 100)}%`,
              height: '100%', borderRadius: 2,
              background: displayColor,
              transition: 'width 0.5s ease',
            }} />
          </div>
          <span style={{ fontSize: 7, fontFamily: '"JetBrains Mono"', color: displayColor }}>
            {Math.round(level * 100)}%
          </span>
        </div>
      )}

      {kw > 0 && (
        <div style={{
          fontSize: 10, fontWeight: 600, fontFamily: '"JetBrains Mono"',
          color: displayColor,
        }}>
          {kw.toFixed(1)} kW
          {flow && flow !== 'none' && (
            <span style={{ fontSize: 8, marginLeft: 4, color: colors.textDim }}>
              {flow === 'to-grid' ? 'TO GRID' : flow === 'from-grid' ? 'FROM GRID' : flow === 'to-home' ? 'TO HOME' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function FlowArrow({ direction = 'right', color = colors.primary, active = true }) {
  if (!active) return <div style={{ width: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ width: 16, height: 1, background: colors.textDim + '20' }} />
  </div>;

  const isVertical = direction === 'down' || direction === 'up';
  const symbol = direction === 'right' ? '\u2192' : direction === 'left' ? '\u2190' : direction === 'down' ? '\u2193' : '\u2191';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      width: isVertical ? 20 : 24, height: isVertical ? 20 : 16,
      fontSize: 12, color: color + 'cc',
      fontFamily: '"JetBrains Mono"',
      textShadow: `0 0 8px ${color}60`,
    }}>
      {symbol}
    </div>
  );
}

export default function HomeDetailView({ homeDetail, style = {} }) {
  if (!homeDetail) return null;

  const { solar, battery, ev, heatPump, gridPrice } = homeDetail;

  return (
    <div style={{
      background: 'rgba(5, 8, 16, 0.92)',
      border: `1px solid ${colors.primary}35`,
      borderRadius: 4,
      padding: '10px 12px',
      boxShadow: `0 0 30px rgba(2,4,8,0.8), inset 0 0 20px ${colors.primary}06`,
      backdropFilter: 'blur(12px)',
      position: 'relative',
      ...style,
    }}>
      {/* Corner brackets */}
      {['tl', 'tr', 'bl', 'br'].map(pos => {
        const s = 10;
        const posStyles = {
          tl: { top: -1, left: -1, borderTop: `2px solid ${colors.primary}60`, borderLeft: `2px solid ${colors.primary}60` },
          tr: { top: -1, right: -1, borderTop: `2px solid ${colors.primary}60`, borderRight: `2px solid ${colors.primary}60` },
          bl: { bottom: -1, left: -1, borderBottom: `2px solid ${colors.primary}60`, borderLeft: `2px solid ${colors.primary}60` },
          br: { bottom: -1, right: -1, borderBottom: `2px solid ${colors.primary}60`, borderRight: `2px solid ${colors.primary}60` },
        };
        return <div key={pos} style={{ position: 'absolute', width: s, height: s, ...posStyles[pos] }} />;
      })}

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        marginBottom: 8, paddingBottom: 6,
        borderBottom: `1px solid ${colors.primary}15`,
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: colors.primary,
          boxShadow: `0 0 8px ${colors.primary}`,
        }} />
        <span style={{
          fontSize: 9, fontWeight: 700, fontFamily: '"JetBrains Mono"',
          color: colors.textMuted, letterSpacing: '0.12em',
        }}>
          HOME DETAIL
        </span>
        {gridPrice && (
          <span style={{
            marginLeft: 'auto', fontSize: 10, fontWeight: 700,
            fontFamily: '"JetBrains Mono"',
            color: gridPrice.startsWith('-') ? colors.success : gridPrice.startsWith('+') && parseInt(gridPrice) > 15 ? colors.danger : colors.text,
          }}>
            {gridPrice}
          </span>
        )}
      </div>

      {/* Device grid: 2x2 with flow arrows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Top row: Solar + Battery */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DeviceBox
            label="SOLAR"
            status={solar.status}
            kw={solar.kw}
            flow={solar.flow}
            color={colors.solar}
          />
          <FlowArrow
            direction="right"
            color={solar.kw > 0 ? colors.solar : colors.textDim}
            active={solar.kw > 0}
          />
          <DeviceBox
            label="BATTERY"
            status={battery.status}
            level={battery.level}
            kw={battery.flow !== 'none' ? Math.abs(battery.kw || 0) : 0}
            flow={battery.flow}
            color={colors.battery}
            statusColor={battery.status === 'discharging' ? colors.accent : colors.battery}
          />
        </div>

        {/* Bottom row: Heat Pump + EV */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <DeviceBox
            label="HEAT PUMP"
            status={heatPump.status}
            kw={heatPump.kw}
            color={colors.secondary}
            statusColor={heatPump.status === 'paused' ? colors.accent : colors.secondary}
          />
          <FlowArrow
            direction="right"
            color={colors.textDim}
            active={false}
          />
          <DeviceBox
            label="EV"
            status={ev.status}
            level={ev.level}
            kw={ev.flow !== 'none' ? Math.abs(ev.kw || 0) : 0}
            flow={ev.flow}
            color={colors.primary}
            statusColor={ev.status === 'paused' ? colors.accent : colors.primary}
          />
        </div>
      </div>
    </div>
  );
}
