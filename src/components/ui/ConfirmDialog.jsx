import Modal from './Modal';

// In-app replacement for window.confirm(), which renders an unthemeable
// OS dialog inside WebViews.
export default function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-xs">
      <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
        {message}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-3 py-2.5 rounded-xl text-sm font-bold border transition-all duration-200 hover:bg-primary-500/5 active:scale-95"
          style={{ borderColor: 'var(--border-solid)', color: 'var(--text-muted)' }}
        >
          Cancel
        </button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200 active:scale-95 ${
            danger ? '' : 'btn-primary'
          }`}
          style={danger ? { background: '#ef4444' } : {}}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
