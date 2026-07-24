import React, { useContext, useEffect, useRef } from 'react';
import { SlideContext } from 'spectacle';
import { useAnimeTimeline } from '../hooks/useAnimeJs.js';

export function CapabilityMotif({ variant, step = 2 }) {
  const rootRef = useRef(null);
  const slideContext = useContext(SlideContext);
  const { createTimeline } = useAnimeTimeline();
  const network = variant === 'network';
  const stage = Math.min(Math.max(Number.isFinite(step) ? step : 2, 0), 2);

  useEffect(() => {
    if (slideContext?.isSlideActive === false) return undefined;
    const pulses = rootRef.current?.querySelectorAll('[data-motif-pulse]');
    if (!pulses?.length) return undefined;
    const timeline = createTimeline({ autoplay: true, loop: true });
    timeline
      .add(pulses, network ? { opacity: [0, 1], translateX: [-18, 18], duration: 800, delay: (_, index) => index * 220, ease: 'inOutSine' } : { opacity: [0.2, 1], scale: [0.78, 1.12], duration: 700, delay: (_, index) => index * 180, ease: 'inOutSine' })
      .add(pulses, network ? { opacity: [1, 0], translateX: [18, 36], duration: 800, delay: (_, index) => index * 220, ease: 'inOutSine' } : { opacity: [1, 0.2], scale: [1.12, 0.78], duration: 700, delay: (_, index) => index * 180, ease: 'inOutSine' }, '+=250');
    return () => timeline.pause();
  }, [createTimeline, network, slideContext?.isSlideActive, stage]);

  const store = variant === 'store';
  if (network) return <svg ref={rootRef} data-testid="capability-motif-network" role="img" aria-label="Grid connected to batteries and internet, creating new capabilities" viewBox="0 0 1120 420" style={{ width: '100%', maxWidth: 1100, marginTop: 26, overflow: 'visible' }}>
    <path d="M238 210H460M660 210H882" fill="none" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" opacity="0.28" />
    {stage >= 1 && <><circle data-motif-pulse cx="330" cy="210" r="10" fill="var(--color-washi-solar)" /><circle data-motif-pulse cx="420" cy="210" r="10" fill="var(--color-washi-solar)" /></>}
    {stage >= 2 && <><circle data-motif-pulse cx="750" cy="210" r="10" fill="var(--color-secondary)" /><circle data-motif-pulse cx="840" cy="210" r="10" fill="var(--color-secondary)" /></>}
    <g><circle cx="150" cy="210" r="88" fill="color-mix(in srgb, var(--color-washi-alert) 10%, transparent)" stroke="var(--color-washi-alert)" strokeWidth="4" /><path d="M105 226h90M118 210l12-36 20 36 20-55 20 55" fill="none" stroke="var(--color-washi-alert)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><text x="150" y="326" textAnchor="middle" fill="var(--color-washi-alert)" fontFamily="var(--font-mono)" fontSize="20" letterSpacing="3">GRID TODAY</text><text x="150" y="356" textAnchor="middle" fill="var(--color-washi-ink)" fontFamily="var(--font-body)" fontSize="19">generation · wires · markets</text></g>
    <g opacity={stage >= 1 ? 1 : 0.16} style={{ transition: 'opacity 450ms ease' }}><rect x="460" y="112" width="200" height="196" rx="98" fill="color-mix(in srgb, var(--color-washi-solar) 12%, transparent)" stroke="var(--color-washi-solar)" strokeWidth="4" /><rect x="512" y="163" width="42" height="88" rx="6" fill="none" stroke="var(--color-secondary)" strokeWidth="5" /><path d="M526 151h14M579 207h44M596 187l18 20-18 20" fill="none" stroke="var(--color-primary)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /><text x="560" y="326" textAnchor="middle" fill="var(--color-washi-solar)" fontFamily="var(--font-mono)" fontSize="20" letterSpacing="3">BATTERIES + INTERNET</text><text x="560" y="356" textAnchor="middle" fill="var(--color-washi-ink)" fontFamily="var(--font-body)" fontSize="19">store · connect · coordinate</text></g>
    <g opacity={stage >= 2 ? 1 : 0.16} style={{ transition: 'opacity 450ms ease' }}><circle cx="970" cy="210" r="88" fill="color-mix(in srgb, var(--color-secondary) 11%, transparent)" stroke="var(--color-secondary)" strokeWidth="4" /><circle cx="935" cy="186" r="12" fill="var(--color-washi-solar)" /><circle cx="1005" cy="176" r="12" fill="var(--color-primary)" /><circle cx="1014" cy="242" r="12" fill="var(--color-washi-alert)" /><path d="M935 186l70-10 9 66M935 186l79 56" fill="none" stroke="var(--color-secondary)" strokeWidth="4" strokeLinecap="round" /><text x="970" y="326" textAnchor="middle" fill="var(--color-secondary)" fontFamily="var(--font-mono)" fontSize="20" letterSpacing="3">NEW CAPABILITIES</text><text x="970" y="356" textAnchor="middle" fill="var(--color-washi-ink)" fontFamily="var(--font-body)" fontSize="19">store · respond · coordinate</text></g>
  </svg>;
  return <svg ref={rootRef} data-testid={`capability-motif-${variant}`} role="img" aria-label={store ? 'Energy moving from sun to battery to home' : 'Grid response dispatching to home, EV, and battery'} viewBox="0 0 400 260" style={{ width: '100%', maxWidth: 400, overflow: 'visible' }}>
    <path d={store ? 'M88 130H184M218 130H312' : 'M88 130H302M248 130V68M248 130V192'} fill="none" stroke="var(--color-primary)" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
    {store ? <>
      <circle cx="64" cy="130" r="30" fill="color-mix(in srgb, var(--color-washi-solar) 16%, transparent)" stroke="var(--color-washi-solar)" strokeWidth="3" />
      <g stroke="var(--color-washi-solar)" strokeWidth="3" strokeLinecap="round"><circle cx="64" cy="130" r="12" fill="none" /><path d="M64 102v-10M64 168v-10M36 130h10M82 130h10M44 110l-7-7M84 150l7 7M44 150l-7 7M84 110l7-7" /></g>
      <rect x="184" y="92" width="40" height="76" rx="6" fill="color-mix(in srgb, var(--color-secondary) 13%, transparent)" stroke="var(--color-secondary)" strokeWidth="3" /><path d="M197 82h14" stroke="var(--color-secondary)" strokeWidth="5" strokeLinecap="round" /><rect data-motif-pulse x="191" y="120" width="26" height="42" rx="3" fill="var(--color-secondary)" />
      <path d="M302 161v-38l25-22 25 22v38h-14v-25h-22v25z" fill="color-mix(in srgb, var(--color-washi-alert) 12%, transparent)" stroke="var(--color-washi-alert)" strokeWidth="3" strokeLinejoin="round" /><path d="M326 161v-15h10v15" fill="none" stroke="var(--color-washi-alert)" strokeWidth="3" />
      <circle data-motif-pulse cx="130" cy="130" r="9" fill="var(--color-washi-solar)" /><circle data-motif-pulse cx="264" cy="130" r="9" fill="var(--color-secondary)" />
    </> : <>
      <g stroke="var(--color-primary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"><path d="M62 91l-18 79h36zM62 91l18 79M49 135h26M44 170h36" /><path d="M62 72v17" /></g>
      <circle cx="62" cy="62" r="18" fill="color-mix(in srgb, var(--color-washi-alert) 15%, transparent)" stroke="var(--color-washi-alert)" strokeWidth="3" /><path d="M62 52v12M62 70h.1" stroke="var(--color-washi-alert)" strokeWidth="4" strokeLinecap="round" />
      <path d="M302 152v-27l20-18 20 18v27h-12v-18h-16v18z" fill="color-mix(in srgb, var(--color-washi-solar) 12%, transparent)" stroke="var(--color-washi-solar)" strokeWidth="3" strokeLinejoin="round" />
      <rect x="222" y="43" width="52" height="30" rx="7" fill="color-mix(in srgb, var(--color-secondary) 12%, transparent)" stroke="var(--color-secondary)" strokeWidth="3" /><path d="M235 58h25M280 49v18" stroke="var(--color-secondary)" strokeWidth="3" strokeLinecap="round" />
      <rect x="222" y="176" width="48" height="52" rx="6" fill="color-mix(in srgb, var(--color-washi-alert) 12%, transparent)" stroke="var(--color-washi-alert)" strokeWidth="3" /><path d="M236 166h20" stroke="var(--color-washi-alert)" strokeWidth="5" strokeLinecap="round" /><rect data-motif-pulse x="230" y="201" width="32" height="20" rx="3" fill="var(--color-washi-alert)" />
      <circle data-motif-pulse cx="140" cy="130" r="9" fill="var(--color-primary)" /><circle data-motif-pulse cx="198" cy="130" r="9" fill="var(--color-primary)" /><circle data-motif-pulse cx="248" cy="100" r="9" fill="var(--color-secondary)" /><circle data-motif-pulse cx="248" cy="160" r="9" fill="var(--color-washi-solar)" />
    </>}
  </svg>;
}
