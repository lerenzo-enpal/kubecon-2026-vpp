import React from 'react';

// Counterfactual commentary keyed to JapanColdSnapCascade steps (0..9).
// Values below 2 = pre-timeline (title + HUD boot); we no-op those.
// The overlay is a floating card in the bottom-right; the cascade HUD owns
// the top-left. Keep the writing spare — one action, one reason.
const COMMENTARY = {
  2: { // Mar 16 23:38 — nuclear + thermal fleet trip
    action: 'Fleet dispatch: batteries absorb the transient',
    detail: 'Residential + C&I storage responds within seconds. 6.5 GW of thermal loss becomes a distributed carry.',
  },
  3: { // Mar 17 — restart delays
    action: 'Shift charging away from evening peaks',
    detail: 'EVs and heat pumps prioritise midday solar; evening load flattens while the fleet stays ready.',
  },
  4: { // Mar 21 — arctic front
    action: 'Pre-cool / pre-heat before the front lands',
    detail: 'HEMS shifts consumption forward. When -3°C arrives, thermal mass in millions of homes is already loaded.',
  },
  5: { // Mar 22 morning — wind/solar collapse
    action: 'Portfolio still delivers — assets are the fleet',
    detail: 'No dependence on wind or solar peaks: stored energy plus flexible demand replace the shortfall.',
  },
  6: { // Mar 22 09:00 — FC maxed
    action: 'Coordinate west-side flexibility, not just watts',
    detail: 'The 2.1 GW cap matters less when west-side homes reduce load in the same operational window.',
  },
  7: { // Mar 22 11:00 — METI warning
    action: 'Automatic — no public conservation call needed',
    detail: 'Trusted software controls flexible assets. The warning becomes an SLO breach, not a national appeal.',
  },
  8: { // Mar 22 15:00 — public conservation
    action: 'JEPX spikes clip. Households do not see 250 yen/kWh',
    detail: 'The fleet is the buffer that the operator did not have in 2021 or 2022.',
  },
  9: { // Mar 22 21:00 — averted, precedent set
    action: 'Every future winter starts inside the envelope',
    detail: 'Not a heroic response — the operating shape shifts because the fleet is part of the grid.',
  },
};

export default function VppCounterfactualOverlay({ step = 0 }) {
  const entry = COMMENTARY[step];
  if (!entry) return null;
  return (
    <div
      data-testid="vpp-counterfactual-overlay"
      style={{
        position: 'absolute', right: 32, bottom: 60, width: 440, pointerEvents: 'none',
        zIndex: 20,
        padding: '16px 20px',
        background: 'color-mix(in srgb, #0b1220 96%, transparent)',
        border: '1px solid color-mix(in srgb, #22d3ee 55%, transparent)',
        borderLeft: '4px solid #22d3ee',
        color: '#f1f5f9',
        boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
      }}
    >
      <div style={{ fontFamily: 'var(--font-mono)', color: '#22d3ee', letterSpacing: '0.16em', fontSize: 11 }}>
        WITH A VPP · COUNTERFACTUAL
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-heading)', fontSize: 20, lineHeight: 1.15 }}>
        {entry.action}
      </div>
      <div style={{ marginTop: 8, fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.42, color: '#cbd5e1' }}>
        {entry.detail}
      </div>
    </div>
  );
}
