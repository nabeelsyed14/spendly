import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useReducedMotion, withReduced, variants } from '../../animations';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  const reduced = useReducedMotion();
  const overlay = withReduced(variants.modalOverlay, reduced);
  const content = withReduced(variants.modalContent, reduced);
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Portaled to document.body: ancestors with transform / perspective /
  // backdrop-filter (tilt cards, scroll reveals) would otherwise trap the
  // fixed overlay and offset the panel with page scroll.
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={overlay.initial}
          animate={overlay.animate}
          exit={overlay.exit}
          transition={overlay.transition}
        >
          <div
            className="modal-backdrop absolute inset-0 bg-black/50 backdrop-blur-[3px]"
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-3xl`}
            style={{
              background: 'var(--surface-solid)',
              border: '1px solid var(--border-solid)',
              boxShadow:
                '0 32px 64px -24px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
            initial={content.initial}
            animate={content.animate}
            exit={content.exit}
            transition={content.transition}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-solid)' }}>
              <h2 className="text-base font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl transition-all duration-200 hover:bg-primary-500/10 active:scale-90"
                style={{ color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
