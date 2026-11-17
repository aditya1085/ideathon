import React, { useEffect, useRef, useState } from 'react';
import { Bell, Check, Menu, Radio, User } from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { NavigationPage } from '../../types/sanket';
import { formatTimestamp, getSeverityTone } from '../../utils/formatters';

const PAGE_TITLES: Record<NavigationPage, string> = {
  overview: 'Overview',
  machines: 'Machines',
  fingerprint: 'Health Fingerprint',
  live: 'Live Monitoring',
  alerts: 'Alerts & History',
  simulation: 'Simulation Lab',
  integration: 'Integration',
  settings: 'Settings',
};

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activePage,
    detailMachineId,
    setActivePage,
    alerts,
    summaryCounts,
    acknowledgeAlert,
    settings,
  } = useSanket();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const currentTitle =
    activePage === 'machines' && detailMachineId
      ? `Machines / ${detailMachineId}`
      : PAGE_TITLES[activePage];

  const recentAlerts = alerts.slice(0, 4);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0">
      {/* Left: Mobile toggle + Current Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900 truncate">
          {currentTitle}
        </h2>
      </div>

      {/* Right: Simulation Mode + Notification + Demo Operator */}
      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <div
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-md whitespace-nowrap"
          title="Running on simulated software telemetry"
        >
          <Radio className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>SIMULATION MODE</span>
        </div>

        {/* Notification Bell & Popover */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((prev) => !prev)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
            aria-label="View notifications"
            aria-expanded={notificationsOpen}
          >
            <Bell className="w-5 h-5" />
            {summaryCounts.activeAlerts > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-md bg-amber-600 text-white font-mono text-[10px] font-semibold flex items-center justify-center tabular-nums">
                {summaryCounts.activeAlerts}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-lg z-40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  Recent Inspection Alerts
                </span>
                <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                  {summaryCounts.activeAlerts} active
                </span>
              </div>
              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto">
                {recentAlerts.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-slate-500">
                    No alert events recorded yet.
                  </div>
                ) : (
                  recentAlerts.map((alert) => (
                    <div key={alert.id} className="px-4 py-3 text-xs space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900">
                          {alert.machineId} · {alert.alertType}
                        </span>
                        <span className={`font-medium ${getSeverityTone(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{alert.reason}</p>
                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                        <span className="font-mono tabular-nums">
                          {formatTimestamp(alert.timestamp)} · {alert.status}
                        </span>
                        {alert.status === 'Active' && (
                          <button
                            type="button"
                            onClick={() => acknowledgeAlert(alert.id)}
                            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-800 font-medium"
                          >
                            <Check className="w-3 h-3" />
                            <span>Acknowledge</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setNotificationsOpen(false);
                    setActivePage('alerts');
                  }}
                  className="text-xs font-medium text-blue-700 hover:text-blue-800"
                >
                  Open Alerts & History
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <button
          type="button"
          onClick={() => setActivePage('settings')}
          className="flex items-center gap-2.5 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
          title="Open Operator Settings"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden md:inline text-xs font-medium text-slate-800 whitespace-nowrap">
            {settings.operatorName}
          </span>
        </button>
      </div>
    </header>
  );
};
