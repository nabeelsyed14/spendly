import { useEffect, useState, useRef } from 'react';

export default function AnimatedNumber({ value, formatAmount, duration = 800 }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef(null);
  const fromRef = useRef(0); // tracks the last settled value to animate FROM

  useEffect(() => {
    // Capture the starting value at effect invocation time via ref, not closure,
    // so rapid value changes always animate from the last displayed position.
    const from = fromRef.current;
    const diff = value - from;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + diff * eased;
      // Round mid-tween so the string length (and layout) stays stable; the
      // final frame shows the exact value with cents when present.
      setDisplayed(progress < 1 ? Math.round(next) : value);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = value; // update anchor for the next animation
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{formatAmount(displayed)}</span>;
}
