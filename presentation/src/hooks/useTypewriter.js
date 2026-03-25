import { useState, useEffect, useRef } from 'react';

/**
 * Shared typewriter hook — steps through characters on a simple interval.
 *
 * @param {string}  text     - The text to type out
 * @param {object}  options
 * @param {boolean} [options.active=true]  - Whether typing should start (false = show nothing or full text depending on showWhenInactive)
 * @param {number}  [options.delay=0]      - Ms to wait before typing begins
 * @param {number}  [options.speed=20]     - Ms per character
 * @param {boolean} [options.showFull=false] - When active is false, show full text instead of empty
 *
 * @returns {{ charCount: number, done: boolean, ready: boolean }}
 *   charCount - how many characters to show
 *   done      - true when all characters have been typed
 *   ready     - true once the delay has elapsed (cursor should appear)
 */
export function useTypewriter(text, { active = true, delay = 0, speed = 20, showFull = false } = {}) {
  const [charCount, setCharCount] = useState(0);
  const [ready, setReady] = useState(false);
  const timerRef = useRef(null);
  const delayRef = useRef(null);

  useEffect(() => {
    // Clean up any running timers
    clearInterval(timerRef.current);
    clearTimeout(delayRef.current);

    if (!active) {
      setCharCount(showFull ? text.length : 0);
      setReady(false);
      return;
    }

    setCharCount(0);
    setReady(false);

    delayRef.current = setTimeout(() => {
      setReady(true);
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        setCharCount(i);
        if (i >= text.length) {
          clearInterval(timerRef.current);
        }
      }, speed);
    }, delay);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(delayRef.current);
    };
  }, [text, active, delay, speed, showFull]);

  return {
    charCount: Math.min(charCount, text.length),
    done: charCount >= text.length,
    ready,
  };
}
