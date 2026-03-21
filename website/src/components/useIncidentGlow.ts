// TODO: Shared between website and presentation — combine into shared hook
import { useState, useEffect, useRef, useCallback } from 'react';

const AMBER_COLOR = [217, 119, 6];
const FAILED_COLOR = [239, 68, 68];
const INCIDENT_DURATION = 2500; // ms — amber glow before transitioning to red

/**
 * Hook that manages amber→red incident glow transitions for cascade map nodes.
 * When nodes are triggered, they glow amber with a fast pulse, then smoothly
 * blend to red over INCIDENT_DURATION ms before being marked as permanently failed.
 */
export function useIncidentGlow() {
  const [incident, setIncident] = useState<Map<string, number>>(new Map());
  const [pulseTime, setPulseTime] = useState(() => Date.now());
  const timers = useRef<number[]>([]);
  const pulseRef = useRef<number | null>(null);

  // Pulse animation loop — only runs when incident nodes exist
  useEffect(() => {
    if (incident.size === 0) {
      if (pulseRef.current) cancelAnimationFrame(pulseRef.current);
      return;
    }
    const tick = () => {
      setPulseTime(Date.now());
      pulseRef.current = requestAnimationFrame(tick);
    };
    pulseRef.current = requestAnimationFrame(tick);
    return () => { if (pulseRef.current) cancelAnimationFrame(pulseRef.current); };
  }, [incident.size > 0]);

  const triggerIncident = useCallback((ids: string[], onComplete: (ids: string[]) => void) => {
    if (ids.length === 0) return;
    const now = Date.now();
    setIncident(prev => {
      const next = new Map(prev);
      ids.forEach(id => next.set(id, now));
      return next;
    });
    const timer = window.setTimeout(() => {
      setIncident(prev => {
        const next = new Map(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
      onComplete(ids);
    }, INCIDENT_DURATION);
    timers.current.push(timer);
  }, []);

  const clearAll = useCallback(() => {
    timers.current.forEach(t => clearTimeout(t));
    timers.current = [];
    setIncident(new Map());
  }, []);

  // Color computation helpers
  const getFillColor = useCallback((id: string, baseColor: number[]): number[] => {
    if (!incident.has(id)) return baseColor;
    const age = pulseTime - incident.get(id)!;
    const progress = Math.min(1, age / INCIDENT_DURATION);
    const pulseAmp = 0.25 * (1 - progress * 0.5);
    const p = Math.sin(pulseTime / 120) * pulseAmp + 0.75 + pulseAmp * 0.3;
    const blend = progress < 0.6 ? 0 : (progress - 0.6) / 0.4;
    const r = AMBER_COLOR[0] + (FAILED_COLOR[0] - AMBER_COLOR[0]) * blend;
    const g = AMBER_COLOR[1] + (FAILED_COLOR[1] - AMBER_COLOR[1]) * blend;
    const b = AMBER_COLOR[2] + (FAILED_COLOR[2] - AMBER_COLOR[2]) * blend;
    return [r, g, b, Math.floor(p * 230)];
  }, [incident, pulseTime]);

  const getLineColor = useCallback((id: string, baseColor: number[]): number[] => {
    if (!incident.has(id)) return baseColor;
    const age = pulseTime - incident.get(id)!;
    const progress = Math.min(1, age / INCIDENT_DURATION);
    const blend = progress < 0.6 ? 0 : (progress - 0.6) / 0.4;
    const r = AMBER_COLOR[0] + (FAILED_COLOR[0] - AMBER_COLOR[0]) * blend;
    const g = AMBER_COLOR[1] + (FAILED_COLOR[1] - AMBER_COLOR[1]) * blend;
    const b = AMBER_COLOR[2] + (FAILED_COLOR[2] - AMBER_COLOR[2]) * blend;
    const p = Math.sin(pulseTime / 120) * 0.15 + 0.85;
    return [r, g, b, Math.floor(p * 255)];
  }, [incident, pulseTime]);

  const getLabelColor = useCallback((id: string, baseColor: number[]): number[] => {
    if (!incident.has(id)) return baseColor;
    const age = pulseTime - incident.get(id)!;
    const progress = Math.min(1, age / INCIDENT_DURATION);
    const blend = progress < 0.6 ? 0 : (progress - 0.6) / 0.4;
    const r = AMBER_COLOR[0] + (FAILED_COLOR[0] - AMBER_COLOR[0]) * blend;
    const g = AMBER_COLOR[1] + (FAILED_COLOR[1] - AMBER_COLOR[1]) * blend;
    const b = AMBER_COLOR[2] + (FAILED_COLOR[2] - AMBER_COLOR[2]) * blend;
    return [r, g, b, 200];
  }, [incident, pulseTime]);

  return {
    incident,
    pulseTime,
    triggerIncident,
    clearAll,
    getFillColor,
    getLineColor,
    getLabelColor,
    isInIncident: (id: string) => incident.has(id),
  };
}
