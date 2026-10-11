import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Target, FileText, Settings, Inbox } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import { isTrackingEnabled } from '../../lib/notifyCapture';
import db from '../../lib/db';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/review', icon: Inbox, label: 'Review' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/goals', icon: Target, label: 'Health' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

function usePendingCount() {
  return useLiveQuery(() => db.pendingSpends.where('status').equals('pending').count(), []) || 0;
}

function useTrackingOn() {
  const [on, setOn] = useState(isTrackingEnabled);
  useEffect(() => {
    const sync = () => setOn(isTrackingEnabled());
    window.addEventListener('spendly-tracking-changed', sync);
    return () => window.removeEventListener('spendly-tracking-changed', sync);
  }, []);
  return on;
}

export default function Sidebar() {
  const { userName, avatarPhoto } = useProfile();
  const pendingCount = usePendingCount();
  const trackingOn = useTrackingOn();
  const items = navItems.filter((i) => i.to !== '/review' || trackingOn);

  return (
    <aside
      className="hidden md:flex flex-col w-[240px] h-screen sticky top-0 safe-top animate-slide-down"
      style={{ background: 'var(--surface-solid)', borderRight: '1px solid var(--border-solid)', borderRadius: 0 }}
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
          <img src="/favicon.svg" alt="" className="w-10 h-10" />
        </div>
        <span className="text-lg font-extrabold tracking-tight">Spendly</span>
      </div>

      <nav className="flex flex-col gap-1.5 flex-1 p-4">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? 'bg-primary-500/15 text-primary-600 dark:text-primary-400'
                  : 'hover:bg-primary-500/5'
              }`
            }
            style={({ isActive }) => !isActive ? { color: 'var(--text-muted)' } : {}}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary-500"
                    transition={{ type: 'spring', stiffness: 500, damping: 40 }}
                  />
                )}
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                {label}
                {to === '/review' && pendingCount > 0 && (
                  <span className="ml-auto tag" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                    {pendingCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t flex items-center gap-2.5" style={{ borderColor: 'var(--border-solid)' }}>
        <Avatar name={userName || 'User'} photo={avatarPhoto} size={36} />
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{userName || 'User'}</p>
          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>Personal</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const trackingOn = useTrackingOn();
  const items = navItems.filter((i) => i.to !== '/review' || trackingOn).slice(0, trackingOn ? 6 : 5);
  const pendingCount = usePendingCount();

  return (
    <nav
      className="md:hidden fixed z-40 left-3 right-3 glass-strong mobile-dock"
      style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 0px))', borderRadius: '1.75rem' }}
    >
      <div className="flex items-center justify-around px-2 pt-3 pb-2">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `relative flex flex-col items-center gap-1 px-4 py-2 rounded-2xl min-w-0 transition-all duration-150 will-change-transform active:scale-95 ${
                isActive
                  ? 'text-white dock-active'
                  : 'text-[var(--text-muted)] dock-inactive'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="dock-active-pill"
                    className="absolute inset-0 rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, var(--brand-btn))',
                      boxShadow: '0 6px 16px -6px rgba(var(--brand-rgb), 0.55)',
                    }}
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
            <span className="relative flex-shrink-0">
              <Icon size={24} strokeWidth={2} />
              {to === '/review' && pendingCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-4 h-4 px-0.5 rounded-full text-[9px] font-extrabold flex items-center justify-center tabular-nums"
                  style={{ background: '#ef4444', color: '#fff' }}
                >
                  {pendingCount > 9 ? '9+' : pendingCount}
                </span>
              )}
            </span>
            <span className="relative hidden sm:inline text-[10px] font-semibold text-center leading-tight">{label}</span>
          </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
