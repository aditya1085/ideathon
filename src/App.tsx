import React, { useState } from 'react';
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
  const { activePage } = useSanket();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-[1440px] w-full mx-auto">
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
