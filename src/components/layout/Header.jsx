import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

export default function Header() {
  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 animate-slide-down"
      style={{ background: 'var(--surface-solid)', borderBottom: '1px solid var(--border-solid)', borderRadius: 0 }}
    >
      <div className="flex items-center gap-2.5 md:hidden">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center">
          <img src="/favicon.svg" alt="" className="w-8 h-8" />
        </div>
        <span className="text-base font-bold tracking-tight">Spendly</span>
      </div>

      <Link
        to="/settings"
        className="p-2 rounded-xl transition-all duration-200 hover:bg-primary-500/10 active:scale-95"
        style={{ color: 'var(--text-muted)' }}
      >
        <Settings size={20} strokeWidth={1.8} />
      </Link>
    </header>
  );
}
