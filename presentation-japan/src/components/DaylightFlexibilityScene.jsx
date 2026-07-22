import React from 'react';
import { MAIN_TALK_EVIDENCE } from '../data/mainTalkEvidence.mjs';
import { MainTalkSourceFooter } from './MainTalkSourceFooter.jsx';

const PHASES = [
  { time: '06:00', title: 'The day begins balanced', note: 'Demand rises before solar reaches its peak.', sun: [155, 210] },
  { time: '12:00', title: 'Solar can outpace local demand', note: 'The system must make room for clean generation now.', sun: [430, 96] },
  { time: '17:00', title: 'The evening ramp arrives', note: 'Solar falls while homes and cities need more power.', sun: [705, 210] },
];

const problemPath = 'M72 250 C155 210 220 190 300 240 S455 310 535 250 S675 120 782 160';
const responsePath = 'M72 250 C155 220 220 205 300 238 S455 280 535 250 S675 160 782 180';

export function DaylightFlexibilityScene({ mode, step = 0 }) {
  const phase = Math.min(Math.max(Number.isInteger(step) ? step : 0, 0), PHASES.length - 1);
  const scene = PHASES[phase];
  const response = mode === 'response';
  const curve = response ? responsePath : problemPath;
  const curveColor = response ? 'var(--color-success)' : 'var(--color-primary)';
  const source = response ? MAIN_TALK_EVIDENCE.shizenConnect : MAIN_TALK_EVIDENCE.kyushuControl;

  return (
    <section data-testid={`daylight-flexibility-${mode}`} style={{ position: 'relative', minHeight: 610, overflow: 'hidden', padding: '48px 64px', background: 'var(--color-washi-paper)', color: 'var(--color-washi-ink)' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: response ? 'var(--color-success)' : 'var(--color-washi-solar)', fontSize: 17, letterSpacing: '0.16em' }}>ONE DAY · JAPAN · {response ? 'COORDINATED RESPONSE' : 'THE FLEXIBILITY PROBLEM'}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, marginTop: 20 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 58, fontWeight: 700, color: response ? 'var(--color-success)' : 'var(--color-washi-solar)' }}>{scene.time}</div>
        <h1 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 38, lineHeight: 1.08 }}>{scene.title}</h1>
      </div>
      <p style={{ maxWidth: 690, margin: '15px 0 0', fontFamily: 'var(--font-body)', fontSize: 23, lineHeight: 1.35 }}>{scene.note}</p>

      <svg viewBox="0 0 860 330" role="img" aria-label={response ? 'Illustrative flexible-device response flattens the net-load curve' : 'Daylight reveals the noon surplus and evening ramp'} style={{ width: '100%', height: 300, marginTop: 8 }}>
        <path d="M0 275H860" stroke="var(--color-washi-ink)" strokeOpacity="0.18" />
        <path d="M52 272 C175 228 270 220 430 248 S674 190 808 170 L808 275H52Z" fill="var(--color-washi-solar)" fillOpacity="0.10" />
        <path d={curve} fill="none" stroke={curveColor} strokeWidth="8" strokeLinecap="round" />
        <path d="M72 250 C155 210 220 190 300 240 S455 310 535 250 S675 120 782 160" fill="none" stroke="var(--color-washi-ink)" strokeOpacity={response ? 0.24 : 0} strokeWidth="3" strokeDasharray="7 9" />
        <circle cx={scene.sun[0]} cy={scene.sun[1]} r="30" fill="var(--color-washi-solar)" opacity="0.9" />
        <circle cx={scene.sun[0]} cy={scene.sun[1]} r="47" fill="var(--color-washi-solar)" opacity="0.14" />
        <path d="M736 224l26-17 23 8 24-24 26 13-10 42-39 21-39-12z" fill="var(--color-washi-ink)" opacity="0.12" />
        {phase === 1 && !response && <g data-testid="kyushu-control-marker"><circle cx="430" cy="302" r="11" fill="var(--color-washi-alert)" /><path d="M430 289V245" stroke="var(--color-washi-alert)" strokeWidth="3" strokeDasharray="5 5" /><text x="448" y="238" fill="var(--color-washi-alert)" fontFamily="var(--font-mono)" fontSize="17" fontWeight="700">5.09 GW max control</text></g>}
        {response && <g fill="var(--color-success)"><path d="M290 277v-44h38v44z" opacity="0.75" /><path d="M510 256v-38h38v38z" opacity="0.75" /><path d="M670 185v-46h38v46z" opacity="0.75" /></g>}
        <text x="62" y="315" fill="var(--color-washi-ink)" fillOpacity="0.62" fontFamily="var(--font-mono)" fontSize="15">NET LOAD</text>
        <text x="665" y="315" fill="var(--color-washi-ink)" fillOpacity="0.62" fontFamily="var(--font-mono)" fontSize="15">TIME →</text>
      </svg>

      {response ? <div><div style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-success)', fontSize: 15, letterSpacing: '0.12em' }}>ILLUSTRATIVE DEVICE RESPONSE</div><div style={{ display: 'flex', gap: 12, marginTop: 10 }}>{['EVs charge at noon', 'Heat pumps shift load', 'Batteries support dusk'].map((label, index) => <div key={label} style={{ flex: 1, padding: '13px 15px', border: '1px solid color-mix(in srgb, var(--color-success) 45%, transparent)', background: index <= phase ? 'color-mix(in srgb, var(--color-success) 12%, transparent)' : 'transparent', fontFamily: 'var(--font-body)', fontSize: 18 }}>{label}</div>)}</div></div> : <div style={{ maxWidth: 700, padding: '13px 16px', borderLeft: '5px solid var(--color-washi-alert)', background: 'color-mix(in srgb, var(--color-washi-alert) 7%, transparent)', fontFamily: 'var(--font-body)', fontSize: 19, opacity: phase === 1 ? 1 : 0.45, transition: 'opacity 260ms ease' }}>4 May 2025 · 12:00–12:30 · Kyushu T&amp;D recorded up to 5.09 GW of renewable-output control.</div>}
      <MainTalkSourceFooter evidence={source} detailUrl="whatisavpp.com/research/japan-energy-flexibility" />
    </section>
  );
}
