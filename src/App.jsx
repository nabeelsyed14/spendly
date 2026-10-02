import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ProfileProvider } from './context/ProfileContext';
import Sidebar, { MobileNav } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CurrencyPicker from './components/ui/CurrencyPicker';
import BalanceCard from './components/dashboard/BalanceCard';
import SavingsCard from './components/dashboard/SavingsCard';
import CategoryChart from './components/dashboard/CategoryChart';
import TrendChart from './components/dashboard/TrendChart';
import HealthScore from './components/dashboard/HealthScore';
import TransactionList from './components/transactions/TransactionList';
import InsightsPage from './components/insights/InsightsPage';
import GoalsPage from './components/goals/GoalsPage';
import ReportsPage from './components/reports/ReportsPage';
import SettingsPage from './components/settings/SettingsPage';

function Page({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function Dashboard() {
  return (
    <div className="space-y-3">
      <BalanceCard />
      <div className="grid gap-3 lg:grid-cols-2">
        <SavingsCard />
        <CategoryChart />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <HealthScore />
        <TrendChart />
      </div>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Page><Dashboard /></Page>} />
        <Route path="/transactions" element={<Page><TransactionList /></Page>} />
        <Route path="/insights" element={<Page><InsightsPage /></Page>} />
        <Route path="/goals" element={<Page><GoalsPage /></Page>} />
        <Route path="/reports" element={<Page><ReportsPage /></Page>} />
        <Route path="/settings" element={<Page><SettingsPage /></Page>} />
      </Routes>
    </AnimatePresence>
  );
}

function PageWrapper({ children }) {
  return (
    <div className="relative z-0 flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-20 md:pb-6 max-w-4xl mx-auto w-full">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ProfileProvider>
          <MotionConfig reducedMotion="user">
            <BrowserRouter>
              <div className="bg-scene">
                <div className="bg-mesh" />
                <div className="bg-dots" />
                <div className="floating-orb floating-orb-1" />
                <div className="floating-orb floating-orb-2" />
                <div className="floating-orb floating-orb-3" />
              </div>

              <CurrencyPicker />

              <PageWrapper>
                <AnimatedRoutes />
              </PageWrapper>
            </BrowserRouter>
          </MotionConfig>
        </ProfileProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
