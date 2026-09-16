import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Target, FileText, Settings } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';
import Avatar from '../ui/Avatar';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/goals', icon: Target, label: 'Health' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { userName, avatarPhoto } = useProfile();

  return (
    <aside
      className="hidden md:flex flex-col w-[240px] h-screen sticky top-0 animate-slide-down"
      style={{ background: 'var(--surface-solid)', borderRight: '1px solid var(--border-solid)', borderRadius: 0 }}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
          <img src="/favicon.svg" alt="" className="w-10 h-10" />
        </div>
        <span className="text-lg font-bold tracking-tight">Spendly</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1 p-4">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 active:scale-[0.97] ${
                isActive
                  ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 glow-sm'
                  : 'hover:bg-primary-500/5'
              }`
            }
            style={({ isActive }) => !isActive ? { color: 'var(--text-muted)' } : {}}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-500" />
                )}
                <Icon size={20} strokeWidth={isActive ? 2 : 1.8} />
                {label}
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
  const items = navItems.slice(0, 5);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{ background: 'var(--surface-solid)', borderTop: '1px solid var(--border-solid)', borderRadius: 0 }}
    >
      <div className="flex items-center justify-around px-1 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-all duration-200 active:scale-95 min-w-0 ${
                isActive ? 'text-primary-600 dark:text-primary-400' : ''
              }`
            }
            style={({ isActive }) => !isActive ? { color: 'var(--text-muted)' } : {}}
          >
            <Icon size={22} strokeWidth={1.8} />
            <span className="text-center leading-tight">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
