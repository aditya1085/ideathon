import React from 'react';
import {
  Activity,
  AlertCircle,
  Cable,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Fingerprint,
  FlaskConical,
  LayoutDashboard,
  Settings,
  X,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { NavigationPage } from '../../types/sanket';
import { SanketLogoPlaceholder } from '../illustrations/MachineIllustrations';

interface NavItem {
  id: NavigationPage;
  label: string;
  icon: React.FC<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'machines', label: 'Machines', icon: Cpu },
  { id: 'fingerprint', label: 'Health Fingerprint', icon: Fingerprint },
  { id: 'live', label: 'Live Monitoring', icon: Activity },
  { id: 'alerts', label: 'Alerts & History', icon: AlertCircle },
  { id: 'simulation', label: 'Simulation Lab', icon: FlaskConical },
  { id: 'integration', label: 'Integration', icon: Cable },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { activePage, setActivePage, summaryCounts } = useSanket();

  const handleSelect = (page: NavigationPage) => {
    setActivePage(page);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0F172A] text-slate-200 border-r border-slate-800 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[74px]' : 'w-64'}`}
        aria-label="Primary Navigation"
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/90 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('overview')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded-md"
          >
            <SanketLogoPlaceholder compact={collapsed} />
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-4 px-2.5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const showAlertCount =
              item.id === 'alerts' && summaryCounts.activeAlerts > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                  isActive
                    ? 'bg-slate-800 text-amber-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={`w-[18px] h-[18px] shrink-0 ${
                    isActive ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                {!collapsed && (
                  <span className="flex-1 text-left truncate">{item.label}</span>
                )}
                {!collapsed && showAlertCount && (
                  <span className="font-mono text-[11px] font-semibold text-amber-400 tabular-nums">
                    {summaryCounts.activeAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Collapse Toggle & Prototype Note */}
        <div className="p-3 border-t border-slate-800/90 space-y-2 shrink-0">
          {!collapsed && (
            <div className="px-2 py-1.5 text-[11px] leading-relaxed text-slate-400">
              <div className="font-medium text-slate-300">Software Prototype</div>
              <div>Simulated sensor inputs only</div>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
