import React, { useEffect, useState } from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { SanketProvider, useSanket } from './context/SanketContext';
import { Sidebar } from './components/layout/Sidebar';
import { TopHeader } from './components/layout/TopHeader';
import { AlertsHistoryPage } from './components/pages/AlertsHistoryPage';
import { HealthFingerprintPage } from './components/pages/HealthFingerprintPage';
import { IntegrationPage } from './components/pages/IntegrationPage';
import { LiveMonitoringPage } from './components/pages/LiveMonitoringPage';
import { MachinesPage } from './components/pages/MachinesPage';
import { OverviewPage } from './components/pages/OverviewPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { SimulationLabPage } from './components/pages/SimulationLabPage';

const AppShell: React.FC = () => {
  const { activePage, actionFeedback, clearActionFeedback } = useSanket();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!actionFeedback) return;
    const timer = window.setTimeout(() => {
      clearActionFeedback();
    }, 5500);
    return () => window.clearTimeout(timer);
  }, [actionFeedback, clearActionFeedback]);

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <OverviewPage />;
      case 'machines':
        return <MachinesPage />;
      case 'fingerprint':
        return <HealthFingerprintPage />;
      case 'live':
        return <LiveMonitoringPage />;
      case 'alerts':
        return <AlertsHistoryPage />;
      case 'simulation':
        return <SimulationLabPage />;
      case 'integration':
        return <IntegrationPage />;
      case 'settings':
        return <SettingsPage />;
    }
  };

  return (
    <div className="min-h-screen flex bg-white text-zinc-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <TopHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 sm:py-6 max-w-[1440px] w-full mx-auto space-y-5">
          {actionFeedback && (
            <div
              role="status"
              className={`rounded-2xl border px-4 py-3 flex items-center justify-between gap-3 text-xs ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : actionFeedback.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                {actionFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                ) : actionFeedback.type === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                ) : (
                  <Info className="w-4 h-4 shrink-0 text-blue-700" />
                )}
                <span>{actionFeedback.text}</span>
              </div>
              <button
                type="button"
                onClick={clearActionFeedback}
                className="p-1 rounded hover:bg-black/5 shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SanketProvider>
      <AppShell />
    </SanketProvider>
  );
}
