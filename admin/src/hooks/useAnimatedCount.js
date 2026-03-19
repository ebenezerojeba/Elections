import { useState, useEffect, useRef } from 'react';

/**
 * Smoothly animates a number from its previous value to `target`.
 * Duration scales with the delta so small changes feel snappy,
 * large jumps feel impactful.
 */
export const useAnimatedCount = (target, duration = 800) => {
  const [display, setDisplay] = useState(target);
  const prevRef  = useRef(target);
  const rafRef   = useRef(null);

  useEffect(() => {
    const from  = prevRef.current;
    const delta = target - from;
    if (delta === 0) return;

    const start = performance.now();
    const tick  = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(from + delta * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        prevRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return display;
};