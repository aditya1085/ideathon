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

const PRIMARY_NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'machines', label: 'Machines', icon: Cpu },
  { id: 'fingerprint', label: 'Health Fingerprint', icon: Fingerprint },
  { id: 'live', label: 'Live Monitoring', icon: Activity },
  { id: 'alerts', label: 'Alerts & History', icon: AlertCircle },
  { id: 'simulation', label: 'Simulation Lab', icon: FlaskConical },
  { id: 'integration', label: 'Integration', icon: Cable },
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

  const renderNavButton = (item: NavItem) => {
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
        className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B27] ${
          isActive
            ? 'text-white'
            : 'text-zinc-400 hover:text-white hover:bg-white/5'
        } ${collapsed ? 'lg:justify-center lg:px-0' : ''}`}
        aria-current={isActive ? 'page' : undefined}
      >
        <span
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors ${
            isActive
              ? 'bg-[#D96B27] text-white shadow-sm'
              : 'bg-white/8 text-zinc-300'
          }`}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>

        {!collapsed && (
          <span className="flex-1 text-left truncate">{item.label}</span>
        )}
        {!collapsed && showAlertCount && (
          <span className="font-mono text-[11px] font-semibold px-1.5 py-0.5 rounded-full bg-[#D96B27]/20 text-[#F59E0B] tabular-nums">
            {summaryCounts.activeAlerts}
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/40 lg:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 h-full flex flex-col bg-[#161618] text-zinc-200 shrink-0 transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } ${collapsed ? 'lg:w-[78px]' : 'w-60'}`}
        aria-label="Primary Navigation"
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center justify-between px-5 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('overview')}
            className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B27] rounded-md"
          >
            <SanketLogoPlaceholder compact={collapsed} />
          </button>

          <button
            type="button"
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1.5">
          {PRIMARY_NAV_ITEMS.map(renderNavButton)}
        </nav>

        {/* Bottom Settings + Collapse */}
        <div className="px-3 pb-4 pt-3 border-t border-white/8 space-y-2 shrink-0">
          {renderNavButton({ id: 'settings', label: 'Settings', icon: Settings })}

          {!collapsed && (
            <div className="px-3 pt-1 text-[11px] leading-relaxed text-zinc-500">
              <span>Software Prototype · Simulated Data</span>
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B27]"
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
