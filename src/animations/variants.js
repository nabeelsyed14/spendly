// Shared animation variants: single source of truth for motion shapes.
// Each variant is { initial, animate, exit, transition }. Components pick
// one and spread it onto a motion element; useReducedMotion() collapses
// them to instant fades when the user prefers reduced motion.
export const variants = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 },
  },
  fadeUp: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: { duration: 0.25 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 },
    transition: { duration: 0.2 },
  },
  modalOverlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.15 },
  },
  modalContent: {
    initial: { opacity: 0, y: 36, scale: 0.94 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 16, scale: 0.96 },
    transition: { type: 'spring', bounce: 0.18, duration: 0.5 },
  },
  navigateForward: {
    initial: { x: '100vw', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100vw', opacity: 0 },
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
  navigateBackward: {
    initial: { x: '-100vw', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100vw', opacity: 0 },
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
  },
};
