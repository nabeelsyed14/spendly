import { useEffect, useState, useRef } from 'react';

export default function AnimatedNumber({ value, formatAmount, duration = 800 }) {
  const [displayed, setDisplayed] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const from = displayed;
    const diff = value - from;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = from + diff * eased;
      // Round mid-tween so the string length (and layout) stays stable; the
      // final frame shows the exact value with cents when present.
      setDisplayed(progress < 1 ? Math.round(next) : value);
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    }

    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value, duration]);

  return <span>{formatAmount(displayed)}</span>;
}
