import React, { useContext } from 'react';
import { SlideContext } from 'spectacle';
import { MAIN_TALK_EVIDENCE } from '../data/mainTalkEvidence.mjs';
import { MainTalkSourceFooter } from './MainTalkSourceFooter.jsx';

const SCENES = [
  { time: '12:00', title: 'Solar surplus', state: 'Curtailment risk rises as local solar exceeds demand.', color: 'var(--color-washi-solar)' },
  { time: '17:00', title: 'Evening ramp', state: 'Solar falls while homes and cities need more power.', color: 'var(--color-washi-alert)' },
  { time: 'Response', title: 'Flexible capacity responds', state: MAIN_TALK_EVIDENCE.shizenConnect.label, color: 'var(--color-success)' },
];

export function ShizenDayCase({ step = 0 }) {
  const slideContext = useContext(SlideContext);
  const sceneIndex = Math.min(Math.max(0, Number.isInteger(step) ? step : 0), SCENES.length - 1);
  const scene = SCENES[sceneIndex];
  return (
    <section data-testid="shizen-day-case" style={{ position: 'relative', minHeight: 500, padding: '58px 68px', background: 'var(--color-washi-paper)', color: 'var(--color-washi-ink)', opacity: slideContext?.isSlideActive ? 1 : 0.75, transition: 'opacity 300ms ease' }}>
      <div style={{ fontFamily: 'var(--font-mono)', color: scene.color, fontSize: 18, letterSpacing: '0.18em' }}>ONE DAY · JAPAN</div>
      <div style={{ marginTop: 58, display: 'flex', alignItems: 'baseline', gap: 24 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 72, fontWeight: 700, color: scene.color }}>{scene.time}</div>
        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 42, fontWeight: 800 }}>{scene.title}</div>
      </div>
      <p style={{ maxWidth: 770, marginTop: 26, fontFamily: 'var(--font-body)', fontSize: 27, lineHeight: 1.35 }}>{scene.state}</p>
      <div style={{ position: 'absolute', left: 68, right: 68, bottom: 100, height: 8, background: 'color-mix(in srgb, var(--color-washi-ink) 15%, transparent)' }}>
        <div style={{ height: '100%', width: `${(sceneIndex + 1) * 33.333}%`, background: scene.color, transition: 'width 400ms ease' }} />
      </div>
      <div data-testid="main-talk-source-footer"><MainTalkSourceFooter evidence={MAIN_TALK_EVIDENCE.shizenConnect} detailUrl="whatisavpp.com/research/japan-energy-flexibility" /></div>
    </section>
  );
}
