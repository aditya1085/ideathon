import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Check,
  ChevronDown,
  Menu,
  Pause,
  Play,
  Radio,
  Search,
  User,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { formatTimestamp, getSeverityTone } from '../../utils/formatters';

interface TopHeaderProps {
  onOpenMobileMenu: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    machines,
    setActivePage,
    openMachineDetails,
    alerts,
    summaryCounts,
    acknowledgeAlert,
    settings,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
  } = useSanket();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { matchedMachines: [], matchedAlerts: [] };
    return {
      matchedMachines: machines.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q)
      ),
      matchedAlerts: alerts
        .filter(
          (a) =>
            a.machineId.toLowerCase().includes(q) ||
            a.alertType.toLowerCase().includes(q) ||
            a.whatChanged.toLowerCase().includes(q)
        )
        .slice(0, 3),
    };
  }, [searchQuery, machines, alerts]);

  const recentAlerts = alerts.slice(0, 4);

  return (
    <header className="h-20 bg-white px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 shrink-0 border-b border-zinc-100">
      {/* Left: Mobile menu + Search Bar matching reference */}
      <div className="flex items-center gap-3 flex-1 min-w-0 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2 -ml-2 rounded-full text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B27]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-md" ref={searchRef}>
          <Search
            className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setSearchFocused(true);
            }}
            placeholder="Search machines, alerts, baselines..."
            aria-label="Search machines and alerts"
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F4F3F1] rounded-full text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#D96B27]/40 transition-shadow"
          />

          {searchFocused && searchQuery.trim().length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-white border border-zinc-200 rounded-2xl shadow-lg z-40 overflow-hidden p-2 space-y-1">
              {searchResults.matchedMachines.length === 0 &&
              searchResults.matchedAlerts.length === 0 ? (
                <div className="px-3 py-4 text-xs text-zinc-500 text-center">
                  No matching machines or alerts for "{searchQuery}".
                </div>
              ) : (
                <>
                  {searchResults.matchedMachines.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        openMachineDetails(m.id);
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-[#F5F4F2] text-left flex items-center justify-between text-xs"
                    >
                      <span>
                        <strong className="font-mono text-zinc-900">{m.id}</strong>{' '}
                        <span className="text-zinc-600">— {m.name}</span>
                      </span>
                      <span className="text-[11px] font-medium text-[#D96B27]">
                        Open Machine
                      </span>
                    </button>
                  ))}
                  {searchResults.matchedAlerts.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setActivePage('alerts');
                        setSearchQuery('');
                        setSearchFocused(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl hover:bg-[#F5F4F2] text-left flex items-center justify-between text-xs"
                    >
                      <span className="truncate pr-2">
                        <strong className="font-mono text-zinc-900">{a.machineId}</strong>{' '}
                        <span className="text-zinc-600">· {a.alertType}</span>
                      </span>
                      <span className={`text-[11px] font-medium shrink-0 ${getSeverityTone(a.severity)}`}>
                        {a.severity}
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right: Demo Indicator + Monitoring Control + Greeting + Profile + Bell */}
      <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
        <div
          className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-800 bg-amber-50 border border-amber-200/80 px-2.5 py-1.5 rounded-full whitespace-nowrap"
          title="Running in demonstration mode using simulated sensor data"
        >
          <Radio className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span>DEMO MODE · SIMULATED DATA</span>
        </div>

        <button
          type="button"
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B27] ${
            isMonitoring
              ? 'bg-zinc-900 text-white hover:bg-zinc-800'
              : 'bg-[#D96B27] text-white hover:bg-[#C05A1B]'
          }`}
        >
          {isMonitoring ? (
            <>
              <Pause className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Stop Monitoring</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Start Monitoring</span>
            </>
          )}
        </button>

        {/* User Profile */}
        <button
          type="button"
          onClick={() => setActivePage('settings')}
          className="hidden sm:flex items-center gap-2.5 pl-2 pr-2.5 py-1 rounded-full hover:bg-[#F5F4F2] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B27]"
          title="Open Operator Settings"
        >
          <span className="text-xs font-medium text-zinc-700 whitespace-nowrap">
            Hi, {settings.operatorName}
          </span>
          <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center shrink-0">
            <User className="w-4 h-4" />
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-400" aria-hidden="true" />
        </button>

        {/* Notification Bell & Popover */}
        {settings.inAppNotifications && (
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => setNotificationsOpen((prev) => !prev)}
              className="relative w-9 h-9 rounded-full bg-[#F4F3F1] text-zinc-700 hover:bg-zinc-200/80 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D96B27]"
              aria-label="View notifications"
              aria-expanded={notificationsOpen}
            >
              <Bell className="w-4 h-4" />
              {summaryCounts.activeAlerts > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#D96B27] text-white font-mono text-[10px] font-semibold flex items-center justify-center tabular-nums">
                  {summaryCounts.activeAlerts}
                </span>
              )}
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-zinc-200 rounded-2xl shadow-xl z-40 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-900">
                    Recent Inspection Alerts
                  </span>
                  <span className="font-mono text-[11px] text-zinc-500 tabular-nums">
                    {summaryCounts.activeAlerts} active
                  </span>
                </div>
                <div className="divide-y divide-zinc-100 max-h-72 overflow-y-auto">
                  {recentAlerts.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-zinc-500">
                      No alert events recorded yet.
                    </div>
                  ) : (
                    recentAlerts.map((alert) => (
                      <div key={alert.id} className="px-4 py-3 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-zinc-900">
                            {alert.machineId} · {alert.alertType}
                          </span>
                          <span className={`font-medium ${getSeverityTone(alert.severity)}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className="text-zinc-600 leading-relaxed">{alert.whatChanged}</p>
                        <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                          <span className="font-mono tabular-nums">
                            {formatTimestamp(alert.timestamp)} · {alert.status}
                          </span>
                          {alert.status === 'Active' && (
                            <button
                              type="button"
                              onClick={() => acknowledgeAlert(alert.id)}
                              className="inline-flex items-center gap-1 text-[#D96B27] hover:underline font-medium"
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
                <div className="px-4 py-2.5 bg-[#F5F4F2] border-t border-zinc-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setNotificationsOpen(false);
                      setActivePage('alerts');
                    }}
                    className="text-xs font-medium text-[#D96B27] hover:underline"
                  >
                    Open Alerts & History
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
