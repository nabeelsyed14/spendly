import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-6 py-3 border-b"
      style={{ background: 'var(--glass-bg)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderColor: 'var(--glass-border)' }}
    >
      <div className="flex items-center gap-2.5 md:hidden">
        <img src="/favicon.svg" alt="Spendly" className="w-8 h-8" />
        <span className="text-lg font-extrabold tracking-tight gradient-text">Spendly</span>
      </div>

      <div className="hidden md:block" />

      <div className="flex items-center gap-1">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          className="p-2.5 rounded-xl transition-colors hover:bg-primary-50 dark:hover:bg-white/[0.06]"
          style={{ color: 'var(--text-muted)' }}
        >
          {theme === 'light' ? <Moon size={20} strokeWidth={1.8} /> : <Sun size={20} strokeWidth={1.8} />}
        </motion.button>

        <Link
          to="/settings"
          className="p-2.5 rounded-xl transition-colors hover:bg-primary-50 dark:hover:bg-white/[0.06] md:hidden"
          style={{ color: 'var(--text-muted)' }}
        >
          <Settings size={20} strokeWidth={1.8} />
        </Link>
      </div>
    </header>
  );
}
