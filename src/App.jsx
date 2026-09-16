import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ProfileProvider } from './context/ProfileContext';
import Sidebar, { MobileNav } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CurrencyPicker from './components/ui/CurrencyPicker';
import ChatDrawer from './components/ai/ChatDrawer';
import BalanceCard from './components/dashboard/BalanceCard';
import CategoryChart from './components/dashboard/CategoryChart';
import TrendChart from './components/dashboard/TrendChart';
import HealthScore from './components/dashboard/HealthScore';
import TransactionList from './components/transactions/TransactionList';
import InsightsPage from './components/insights/InsightsPage';
import GoalsPage from './components/goals/GoalsPage';
import ReportsPage from './components/reports/ReportsPage';
import SettingsPage from './components/settings/SettingsPage';

function Dashboard() {
  return (
    <div className="space-y-3 animate-fade-in">
      <BalanceCard />
      <div className="grid gap-3 lg:grid-cols-2">
        <CategoryChart />
        <HealthScore />
      </div>
      <TrendChart />
    </div>
  );
}

function AnimatedRoutes({ onOpenChat }) {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/transactions" element={<TransactionList />} />
      <Route path="/insights" element={<InsightsPage onOpenChat={onOpenChat} />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  );
}

function PageWrapper({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
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
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <ThemeProvider>
      <CurrencyProvider>
        <ProfileProvider>
          <BrowserRouter>
            <div className="bg-mesh" />
            <div className="bg-dots" />
            <div className="floating-orb floating-orb-1" />
            <div className="floating-orb floating-orb-2" />
            <div className="floating-orb floating-orb-3" />

            <CurrencyPicker />
            <ChatDrawer isOpen={chatOpen} onClose={() => setChatOpen(false)} />

            <PageWrapper>
              <AnimatedRoutes onOpenChat={() => setChatOpen(true)} />
            </PageWrapper>
          </BrowserRouter>
        </ProfileProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
