import { Capacitor } from '@capacitor/core';

// Transition presets. Durations stay short: this app animates mount
// feedback and small interactions, never long cinematic sequences.
// On native (WebView GPU budget is tighter) everything shortens further.
const native = () =>
  typeof Capacitor !== 'undefined' && Capacitor.isNativePlatform?.() === true;

const scale = (d) => (native() ? Math.max(0.08, d * 0.7) : d);

export const transitions = {
  fast: { duration: 0.12 },
  normal: { duration: 0.2 },
  slow: { duration: 0.3 },
  snappy: { type: 'spring', stiffness: 450, damping: 35 },
  smooth: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  bouncy: { type: 'spring', bounce: 0.18, duration: 0.5 },
};

// Shrink a variant's transition for native without touching its shape.
export function forPlatform(transition) {
  if (!native() || !transition || typeof transition.duration !== 'number') {
    return transition;
  }
  return { ...transition, duration: scale(transition.duration) };
}
