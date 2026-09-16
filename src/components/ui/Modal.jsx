import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: 'fade-in 0.2s ease-out' }}
      />
      <div
        className={`relative w-full ${maxWidth} max-h-[85vh] overflow-y-auto rounded-2xl shadow-2xl animate-slide-up`}
        style={{ background: 'var(--surface-solid)', border: '1px solid var(--border-solid)' }}
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
      </div>
    </div>
  );
}
