import { useReducedMotion as useFramerReducedMotion } from 'framer-motion';

export function useReducedMotion() {
  return useFramerReducedMotion();
}

// Collapse any variant to an instant fade when reduced motion is on, so
// call sites stay one line: withReduced(variants.fadeUp, reduced).
export function withReduced(variant, reduced) {
  if (!reduced) return variant;
  return {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.01 },
  };
}
