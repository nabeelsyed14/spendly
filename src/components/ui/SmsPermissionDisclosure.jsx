import Modal from './Modal';

// Shown immediately before Android's READ_SMS runtime prompt. This is a
// prominent, feature-specific disclosure; the OS prompt remains the user's
// separate permission choice.
export default function SmsPermissionDisclosure({ isOpen, onClose, onContinue }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Allow bank SMS tracking?" zIndexClass="z-[110]">
      <div className="space-y-4 text-sm" style={{ color: 'var(--text-muted)' }}>
        <p>
          Spendly needs access to your SMS inbox to find bank transaction messages and turn
          possible income or spending into items for your review.
        </p>
        <p>
          Messages are processed only on this device. Spendly does not upload, share, sell,
          or use your messages for advertising. You approve or discard every suggested entry.
        </p>
        <p>
          This is optional: manual entry, CSV import, and pasted messages continue to work
          without SMS access. You can turn tracking off or revoke access at any time in Android
          Settings.
        </p>
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border text-sm font-bold" style={{ borderColor: 'var(--border-solid)' }}>
            Not now
          </button>
          <button onClick={onContinue} className="flex-1 py-2.5 rounded-xl btn-primary text-sm font-bold">
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}
