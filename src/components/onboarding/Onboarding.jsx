import { useState } from 'react';
import { ArrowLeft, ArrowRight, BellRing, Plus, Sparkles, Table, Wallet } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { setTrackingEnabled, requestSmsPermission, isNativeSmsSupported } from '../../lib/notifyCapture';
import SmsPermissionDisclosure from '../ui/SmsPermissionDisclosure';

const FLAG_KEY = 'spendly-onboarded';

function isOnboarded() {
  try {
    return localStorage.getItem(FLAG_KEY) === '1';
  } catch {
    return true;
  }
}

function finish() {
  try {
    localStorage.setItem(FLAG_KEY, '1');
  } catch {
    // private mode — tour simply shows again next launch
  }
}

function Dots({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-1.5">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-200"
          style={{
            width: i === step ? 20 : 6,
            background: i === step ? 'var(--color-primary-600)' : 'var(--border-solid)',
          }}
        />
      ))}
    </div>
  );
}

export default function Onboarding() {
  const { hasChosenCurrency } = useCurrency();
  const [done, setDone] = useState(isOnboarded);
  const [step, setStep] = useState(0);
  const [smsState, setSmsState] = useState('idle');
  const [showSmsDisclosure, setShowSmsDisclosure] = useState(false);
  const native = isNativeSmsSupported();

  if (done || !hasChosenCurrency) return null;

  const close = () => {
    finish();
    setDone(true);
  };

  const enableSms = async () => {
    if (!native) return;
    setShowSmsDisclosure(false);
    setSmsState('working');
    try {
      const granted = await requestSmsPermission();
      setTrackingEnabled(granted);
    } catch {
      // stays visible in Settings either way
    } finally {
      setSmsState('done');
    }
  };

  const steps = [
    {
      icon: null,
      title: 'Your money, understood.',
      body: 'Spendly turns income, spending and savings into one clear picture — all on your device.',
      footer: (
        <button onClick={() => setStep(1)} className="w-full py-3.5 rounded-full btn-primary font-bold text-base flex items-center justify-center gap-2">
          Take the tour <ArrowRight size={17} />
        </button>
      ),
    },
    {
      icon: null,
      title: 'Track everything',
      body: null,
      custom: (
        <div className="grid grid-cols-2 gap-2 mb-5">
          <div className="p-3.5 rounded-2xl text-center" style={{ background: 'var(--input-bg)' }}>
            <Plus size={20} className="mx-auto mb-1.5" style={{ color: 'var(--color-primary-600)' }} />
            <p className="text-xs font-bold">Manual add</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Log income & spends in seconds</p>
          </div>
          <div className="p-3.5 rounded-2xl text-center" style={{ background: 'var(--input-bg)' }}>
            <Table size={20} className="mx-auto mb-1.5" style={{ color: 'var(--color-primary-600)' }} />
            <p className="text-xs font-bold">CSV import</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Bring history from bank exports</p>
          </div>
        </div>
      ),
      footer: (
        <div className="flex gap-2">
          <button onClick={() => setStep(0)} className="px-4 py-3.5 rounded-full border text-sm font-bold transition-all duration-200 active:scale-95" style={{ borderColor: 'var(--border-solid)', color: 'var(--text-muted)' }} aria-label="Back">
            <ArrowLeft size={17} />
          </button>
          <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-full btn-primary font-bold text-base">
            Continue
          </button>
        </div>
      ),
    },
    {
      icon: <BellRing size={26} style={{ color: 'var(--color-primary-600)' }} />,
      title: 'Auto-capture bank SMS',
      body: native
        ? 'Payment messages land in Review for one-tap approval. Nothing leaves your phone.'
        : 'On Android, payment messages land in Review for one-tap approval. Nothing leaves your phone.',
      custom: null,
      footer: native ? (
        <div className="space-y-2">
          <button
            onClick={() => setShowSmsDisclosure(true)}
            disabled={smsState !== 'idle'}
            className="w-full py-3.5 rounded-full btn-primary font-bold text-base disabled:opacity-60"
          >
            {smsState === 'idle' ? 'Enable SMS tracking' : smsState === 'working' ? 'Requesting…' : 'Done'}
          </button>
          <button onClick={() => setStep(3)} className="w-full py-2 text-sm font-semibold transition-all duration-150 hover:opacity-70 active:scale-95" style={{ color: 'var(--text-muted)' }}>
            Skip for now
          </button>
        </div>
      ) : (
        <button onClick={() => setStep(3)} className="w-full py-3.5 rounded-full btn-primary font-bold text-base">
          Continue
        </button>
      ),
    },
    {
      icon: <Wallet size={26} style={{ color: 'var(--color-primary-600)' }} />,
      title: "Know what's left",
      body: 'Income minus spending minus savings is your wallet — plus forecasts, insights and health goals.',
      custom: (
        <div className="flex items-center gap-2 p-3 rounded-2xl mb-5" style={{ background: 'var(--input-bg)' }}>
          <Sparkles size={18} className="flex-shrink-0" style={{ color: 'var(--color-primary-600)' }} />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Tip: approve SMS spends in Review to keep every number live.
          </p>
        </div>
      ),
      footer: (
        <div className="flex gap-2">
          <button onClick={() => setStep(2)} className="px-4 py-3.5 rounded-full border text-sm font-bold transition-all duration-200 active:scale-95" style={{ borderColor: 'var(--border-solid)', color: 'var(--text-muted)' }} aria-label="Back">
            <ArrowLeft size={17} />
          </button>
          <button onClick={close} className="flex-1 py-3.5 rounded-full btn-primary font-bold text-base">
            Get started
          </button>
        </div>
      ),
    },
  ];

  const s = steps[step];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-3xl shadow-2xl p-6 animate-scale-in glass-strong overflow-hidden" style={{ border: '1px solid var(--border-solid)' }}>
        {step < steps.length - 1 && (
          <button
            onClick={close}
            className="absolute top-3 right-4 text-xs font-semibold transition-all duration-150 hover:opacity-70 active:scale-95"
            style={{ color: 'var(--text-muted)' }}
          >
            Skip tour
          </button>
        )}

        <div className="text-center mb-4 mt-2">
          {step === 0 ? (
            <img src="/favicon.svg" alt="Spendly" className="w-16 h-16 mx-auto mb-4" />
          ) : (
            s.icon && (
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--input-bg)' }}>
                {s.icon}
              </div>
            )
          )}
          <h1 className="text-2xl font-bold mb-1.5">{s.title}</h1>
          {s.body && (
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{s.body}</p>
          )}
        </div>

        {s.custom}

        <div className="mb-4">{s.footer}</div>

        <Dots step={step} total={steps.length} />
      </div>
      <SmsPermissionDisclosure
        isOpen={showSmsDisclosure}
        onClose={() => setShowSmsDisclosure(false)}
        onContinue={enableSms}
      />
    </div>
  );
}
