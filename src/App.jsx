import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ProfileProvider } from './context/ProfileContext';
import Sidebar, { MobileNav } from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CurrencyPicker from './components/ui/CurrencyPicker';
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
    <div className="space-y-4">
      <BalanceCard />
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryChart />
        <HealthScore />
      </div>
      <TrendChart />
    </div>
  );
}

function PageWrapper({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-4xl mx-auto w-full">
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
          <BrowserRouter>
            <CurrencyPicker />
            <PageWrapper>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<TransactionList />} />
                <Route path="/insights" element={<InsightsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </PageWrapper>
          </BrowserRouter>
        </ProfileProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
