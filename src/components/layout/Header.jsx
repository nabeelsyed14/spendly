import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { format } from 'date-fns';

export default function Header() {
  const [now, setNow] = useState(() => new Date());
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 safe-top animate-slide-down glass-header${scrolled ? ' glass-header-solid' : ''}`}
    >
      <div className="flex items-center justify-between px-5 md:px-6 py-4 md:py-5">
        <div className="flex flex-col gap-1 min-w-0">
          <span className="text-3xl md:text-[34px] font-extrabold tracking-tight leading-none">
            Today
          </span>
          <span
            className="text-base md:text-lg font-semibold tabular-nums leading-none"
            style={{ color: 'var(--text-muted)' }}
          >
            {format(now, 'EEE, MMM d')} · {format(now, 'HH:mm')}
          </span>
        </div>

        <Link
          to="/settings"
          aria-label="Settings"
          className="glass-btn w-11 h-11 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-105 hover:rotate-45 active:scale-90"
          style={{ color: 'var(--text-muted)' }}
        >
          <Settings size={20} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
