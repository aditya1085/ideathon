import React, { useMemo, useState } from 'react';
import { Check, CheckCheck, ChevronDown, ChevronUp, ExternalLink, Search } from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { AlertSeverity, AlertStatus } from '../../types/sanket';
import {
  formatDateTime,
  getAlertStatusTone,
  getSeverityTone,
} from '../../utils/formatters';

export const AlertsHistoryPage: React.FC = () => {
  const { alerts, acknowledgeAlert, resolveAlert, openMachineDetails } =
    useSanket();

  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'All' | AlertSeverity>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | AlertStatus>('All');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return alerts.filter((a) => {
      const matchesSearch =
        !q ||
        a.machineId.toLowerCase().includes(q) ||
        a.machineName.toLowerCase().includes(q) ||
        a.alertType.toLowerCase().includes(q) ||
        a.triggeringParameter.toLowerCase().includes(q) ||
        a.whatChanged.toLowerCase().includes(q);
      const matchesSeverity =
        severityFilter === 'All' || a.severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [alerts, search, severityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-[34px] font-bold tracking-tight text-zinc-900">
            Alerts & History
          </h1>
          <p className="mt-1.5 text-sm sm:text-[15px] font-medium text-zinc-600">
            Clear inspection alerts explaining what changed, why it matters, and what to check.
          </p>
        </div>
        <div className="text-[13px] font-semibold text-zinc-600 tabular-nums">
          {filteredAlerts.length} event{filteredAlerts.length === 1 ? '' : 's'} · Simulated log
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="relative w-full lg:w-80">
          <Search
            className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by machine, parameter, or reason..."
            className="w-full pl-10 pr-3.5 py-2 text-[13px] font-medium bg-[#F5F4F2] rounded-full text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D96B27]/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-[#F5F4F2] rounded-full">
            {(['All', 'Info', 'Warning', 'Critical'] as const).map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-3.5 py-1 text-[13px] font-semibold rounded-full transition-colors whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 bg-[#F5F4F2] rounded-full">
            {(['All', 'Active', 'Acknowledged', 'Resolved'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1 text-[13px] font-semibold rounded-full transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-700 hover:text-zinc-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alert Table */}
      <div className="bg-[#F5F4F2] rounded-2xl p-2 sm:p-3 overflow-hidden">
        <div className="bg-white rounded-xl overflow-hidden">
          {filteredAlerts.length === 0 ? (
            <div className="p-10 text-center space-y-3">
              <p className="text-sm font-medium text-zinc-800">
                No alert events match your active search or filter criteria.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSeverityFilter('All');
                  setStatusFilter('All');
                }}
                className="px-4 py-2 rounded-full text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500">
                    <th className="py-3 px-4 whitespace-nowrap">Date / Time</th>
                    <th className="py-3 px-4 whitespace-nowrap">Machine</th>
                    <th className="py-3 px-4 whitespace-nowrap">Triggering Parameter</th>
                    <th className="py-3 px-4 whitespace-nowrap">Severity</th>
                    <th className="py-3 px-4 min-w-[260px]">Explanation & Inspection</th>
                    <th className="py-3 px-4 whitespace-nowrap">Status</th>
                    <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-xs">
                  {filteredAlerts.map((alert) => {
                    const isExpanded = expandedAlertId === alert.id;
                    return (
                      <React.Fragment key={alert.id}>
                        <tr className="hover:bg-[#F5F4F2]/50 transition-colors align-top">
                          <td className="py-3.5 px-4 text-zinc-600 whitespace-nowrap tabular-nums">
                            {formatDateTime(alert.timestamp)}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => openMachineDetails(alert.machineId)}
                              className="font-semibold text-zinc-900 hover:text-[#D96B27] inline-flex items-center gap-1"
                            >
                              <span>{alert.machineId}</span>
                              <ExternalLink className="w-3 h-3 text-zinc-400" />
                            </button>
                            <div className="text-[11px] text-zinc-500">
                              {alert.machineName}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-medium text-zinc-900">
                              {alert.alertType}
                            </div>
                            <div className="text-[11px] text-zinc-500 mt-0.5">
                              {alert.triggeringParameter}
                            </div>
                          </td>
                          <td
                            className={`py-3.5 px-4 font-semibold whitespace-nowrap ${getSeverityTone(
                              alert.severity
                            )}`}
                          >
                            {alert.severity}
                          </td>
                          <td className="py-3.5 px-4 text-zinc-700 space-y-1">
                            <div>{alert.whatChanged}</div>
                            <div className="text-[11px] text-zinc-500">
                              {alert.baselineComparison}
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedAlertId(isExpanded ? null : alert.id)
                              }
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#D96B27] hover:underline pt-0.5"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3 h-3" />
                                  <span>Hide breakdown</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3 h-3" />
                                  <span>Full explanation & inspection</span>
                                </>
                              )}
                            </button>
                          </td>
                          <td
                            className={`py-3.5 px-4 whitespace-nowrap ${getAlertStatusTone(
                              alert.status
                            )}`}
                          >
                            {alert.status}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center justify-end gap-2">
                              {alert.status === 'Active' && (
                                <button
                                  type="button"
                                  onClick={() => acknowledgeAlert(alert.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-zinc-200 text-zinc-700 hover:bg-[#F5F4F2]"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Acknowledge</span>
                                </button>
                              )}
                              {alert.status !== 'Resolved' && (
                                <button
                                  type="button"
                                  onClick={() => resolveAlert(alert.id)}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-900 text-white hover:bg-zinc-800"
                                >
                                  <CheckCheck className="w-3 h-3" />
                                  <span>Resolve</span>
                                </button>
                              )}
                              {alert.status === 'Resolved' && (
                                <span className="text-[11px] text-zinc-400">
                                  Retained in log
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#F5F4F2]/60">
                            <td colSpan={7} className="px-4 py-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                                <div>
                                  <div className="font-semibold text-zinc-900">
                                    What changed?
                                  </div>
                                  <p className="text-zinc-600 mt-1 leading-relaxed">
                                    {alert.whatChanged}
                                  </p>
                                </div>
                                <div>
                                  <div className="font-semibold text-zinc-900">
                                    Baseline comparison
                                  </div>
                                  <p className="text-zinc-600 mt-1 leading-relaxed text-[11px] tabular-nums">
                                    {alert.baselineComparison}
                                  </p>
                                </div>
                                <div>
                                  <div className="font-semibold text-zinc-900">
                                    Persistence check
                                  </div>
                                  <p className="text-zinc-600 mt-1 leading-relaxed">
                                    {alert.persistenceSummary}
                                  </p>
                                </div>
                                <div>
                                  <div className="font-semibold text-zinc-900">
                                    What should the operator inspect?
                                  </div>
                                  <p className="text-zinc-600 mt-1 leading-relaxed">
                                    {alert.suggestedInspection}
                                  </p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
