import { Children, cloneElement, isValidElement, useState } from 'react';
import { useLocation, useNavigationType, Routes } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { variants, forPlatform, useReducedMotion, withReduced } from '../../animations';

const ORDER = ['/', '/transactions', '/review', '/insights', '/goals', '/reports', '/settings'];

// Direction-aware route transitions: forward slides in from the right,
// backward from the left. History is adjusted during render (the documented
// React pattern for previous-render values) so direction follows tab order.
// <Routes> is frozen on the exiting location so the outgoing page slides
// out instead of flashing the new one.
export default function AnimatedRoutes({ children }) {
  const location = useLocation();
  const navType = useNavigationType();
  const reduced = useReducedMotion();

  const [history, setHistory] = useState([location.pathname]);
  if (history[history.length - 1] !== location.pathname) {
    setHistory([...history.slice(-4), location.pathname]);
  }

  const toIdx = ORDER.indexOf(location.pathname);
  const fromIdx = history.length > 1 ? ORDER.indexOf(history[history.length - 2]) : -1;
  const freshLoad = history.length < 2;
  let direction = 'forward';
  if (toIdx >= 0) {
    direction = navType === 'POP' ? 'backward' : (fromIdx >= 0 && toIdx < fromIdx ? 'backward' : 'forward');
  }
  const v = withReduced(
    direction === 'forward' ? variants.navigateForward : variants.navigateBackward,
    reduced,
  );

  const frozen = Children.map(children, (child) =>
    isValidElement(child) && child.type === Routes
      ? cloneElement(child, { location })
      : child
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={freshLoad ? false : v.initial}
        animate={v.animate}
        exit={v.exit}
        transition={forPlatform(v.transition)}
      >
        {frozen}
      </motion.div>
    </AnimatePresence>
  );
}
