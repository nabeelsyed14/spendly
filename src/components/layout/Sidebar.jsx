import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ArrowLeftRight, Lightbulb, Target, FileText, Settings } from 'lucide-react';
import { useProfile } from '../../context/ProfileContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { to: '/insights', icon: Lightbulb, label: 'Insights' },
  { to: '/goals', icon: Target, label: 'Health' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { userName, getGreeting } = useProfile();

  return (
    <aside
      className="hidden md:flex flex-col w-[260px] h-screen sticky top-0 p-3 border-r"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-3 mb-8 px-3 py-2">
        <img src="/favicon.svg" alt="Spendly" className="w-9 h-9" />
        <span className="text-xl font-extrabold tracking-tight gradient-text">Spendly</span>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-600/30'
                  : 'hover:bg-primary-50/80 dark:hover:bg-white/[0.04]'
              }`
            }
            style={({ isActive }) => !isActive ? { color: 'var(--text-muted)' } : {}}
          >
            {({ isActive }) => (
              <>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isActive ? 'bg-white/20' : 'bg-primary-50 dark:bg-white/[0.06] group-hover:bg-primary-100 dark:group-hover:bg-white/[0.1]'
                }`}>
                  <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  const items = navItems.slice(0, 5);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t"
      style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderColor: 'var(--glass-border)' }}
    >
      <div className="flex items-center justify-around px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-medium transition-all ${
                isActive ? 'text-primary-600 dark:text-primary-400' : ''
              }`
            }
            style={({ isActive }) => !isActive ? { color: 'var(--text-muted)' } : {}}
          >
            {({ isActive }) => (
              <>
                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                </div>
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
