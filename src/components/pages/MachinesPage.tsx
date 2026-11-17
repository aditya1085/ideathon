import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Fingerprint,
  FlaskConical,
  Search,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { HealthStatus, Machine } from '../../types/sanket';
import {
  formatDateTime,
  formatTimestamp,
  getBaselineTone,
  getSeverityTone,
} from '../../utils/formatters';
import { ConditionCharts } from '../charts/ConditionCharts';
import { SensorHealthLabel, StatusLabel } from '../common/StatusLabel';
import {
  MachineHealthGaugeVisual,
  MachineTypeIllustration,
  TemperatureTrendVisual,
  VibrationWaveformVisual,
} from '../illustrations/MachineIllustrations';

function computeDeviationPercent(machine: Machine): number {
  if (
    machine.sensorHealth === 'SENSOR ISSUE' ||
    machine.latestVibrationMmS === null ||
    machine.latestTemperatureC === null
  ) {
    return 100;
  }
  const vibSpan = Math.max(
    0.25,
    machine.fingerprint.vibrationMaxMmS - machine.fingerprint.vibrationMeanMmS
  );
  const tempSpan = Math.max(
    2.0,
    machine.fingerprint.temperatureMaxC - machine.fingerprint.temperatureMeanC
  );

  const vibDiff = Math.max(
    0,
    Math.abs(machine.latestVibrationMmS - machine.fingerprint.vibrationMeanMmS) /
      vibSpan -
      0.8
  );
  const tempDiff = Math.max(
    0,
    Math.abs(machine.latestTemperatureC - machine.fingerprint.temperatureMeanC) /
      tempSpan -
      0.8
  );

  return Math.min(95, Math.round(vibDiff * 24 + tempDiff * 22));
}

export const MachinesPage: React.FC = () => {
  const {
    machines,
    alerts,
    detailMachineId,
    openMachineDetails,
    closeMachineDetails,
    setSelectedMachineId,
    setActivePage,
  } = useSanket();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'All' | HealthStatus | 'SENSOR ISSUE'
  >('All');

  const detailMachine = useMemo(
    () => machines.find((m) => m.id === detailMachineId) ?? null,
    [machines, detailMachineId]
  );

  const filterCounts = useMemo(
    () => ({
      All: machines.length,
      NORMAL: machines.filter(
        (m) => m.healthStatus === 'NORMAL' && m.sensorHealth === 'Connected'
      ).length,
      WARNING: machines.filter(
        (m) => m.healthStatus === 'WARNING' && m.sensorHealth === 'Connected'
      ).length,
      CRITICAL: machines.filter((m) => m.healthStatus === 'CRITICAL').length,
      'SENSOR ISSUE': machines.filter((m) => m.sensorHealth === 'SENSOR ISSUE')
        .length,
    }),
    [machines]
  );

  const filteredMachines = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return machines.filter((m) => {
      const matchesQuery =
        !q ||
        m.id.toLowerCase().includes(q) ||
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'SENSOR ISSUE'
          ? m.sensorHealth === 'SENSOR ISSUE'
          : statusFilter === 'NORMAL' || statusFilter === 'WARNING'
          ? m.healthStatus === statusFilter && m.sensorHealth === 'Connected'
          : m.healthStatus === statusFilter);

      return matchesQuery && matchesStatus;
    });
  }, [machines, searchQuery, statusFilter]);

  if (detailMachine) {
    const machineAlerts = alerts.filter((a) => a.machineId === detailMachine.id);
    const deviationPct = computeDeviationPercent(detailMachine);
    const hasValidSignal =
      detailMachine.sensorHealth === 'Connected' &&
      detailMachine.latestVibrationMmS !== null &&
      detailMachine.latestTemperatureC !== null;
    const vibRatio =
      hasValidSignal && detailMachine.latestVibrationMmS !== null
        ? detailMachine.latestVibrationMmS /
          Math.max(0.5, detailMachine.fingerprint.vibrationMeanMmS)
        : 0.35;

    const recentRows = [...detailMachine.readings].reverse().slice(0, 8);

    return (
      <div className="space-y-6">
        {/* Top Back Action & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <button
              type="button"
              onClick={closeMachineDetails}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Machines</span>
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl sm:text-[32px] font-bold tracking-tight text-zinc-900">
                {detailMachine.name} ({detailMachine.id})
              </h1>
              <StatusLabel
                status={detailMachine.healthStatus}
                sensorHealth={detailMachine.sensorHealth}
              />
              <SensorHealthLabel sensorHealth={detailMachine.sensorHealth} />
            </div>
            <p className="text-[13px] font-medium text-zinc-600">
              {detailMachine.category} · {detailMachine.location} · Simulated Sensor Data
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setSelectedMachineId(detailMachine.id);
                setActivePage('live');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-[#D96B27] text-white hover:bg-[#C05A1B] transition-colors whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Monitoring</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMachineId(detailMachine.id);
                setActivePage('fingerprint');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-white border border-zinc-200 text-zinc-800 hover:bg-[#F5F4F2] transition-colors whitespace-nowrap"
            >
              <Fingerprint className="w-3.5 h-3.5" />
              <span>Health Fingerprint</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMachineId(detailMachine.id);
                setActivePage('simulation');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold bg-white border border-zinc-200 text-zinc-800 hover:bg-[#F5F4F2] transition-colors whitespace-nowrap"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Test Scenario</span>
            </button>
          </div>
        </div>

        {detailMachine.sensorHealth === 'SENSOR ISSUE' && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs text-blue-900">
            <strong>SENSOR ISSUE: </strong>
            {detailMachine.sensorIssueDetail} Machine health cannot be confirmed as NORMAL until valid changing telemetry resumes.
          </div>
        )}

        {/* Summary & Visuals Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 bg-[#F5F4F2] rounded-2xl p-5 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-zinc-500">Machine Profile</div>
              <div className="text-sm font-semibold text-zinc-900">
                {detailMachine.powerRating} · {detailMachine.ratedRpm} RPM
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                {detailMachine.statusSummary}
              </p>
            </div>
            <div className="text-zinc-700 shrink-0">
              <MachineTypeIllustration type={detailMachine.type} className="w-20 h-16" />
            </div>
          </div>

          <div className="lg:col-span-5 bg-[#F5F4F2] rounded-2xl p-5 grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="text-xs text-zinc-500">Vibration Level</div>
              <div className="text-xl font-bold text-zinc-900 tabular-nums">
                {hasValidSignal && detailMachine.latestVibrationMmS !== null
                  ? `${detailMachine.latestVibrationMmS.toFixed(2)} mm/s`
                  : 'No Signal'}
              </div>
              <VibrationWaveformVisual
                amplitude={vibRatio}
                accentColor={
                  detailMachine.healthStatus === 'CRITICAL' ? '#DC2626' : '#D96B27'
                }
                className="w-full h-10"
              />
              <div className="text-xs font-medium text-zinc-500 tabular-nums">
                Normal range {detailMachine.fingerprint.vibrationMinMmS.toFixed(2)}–
                {detailMachine.fingerprint.vibrationMaxMmS.toFixed(2)} mm/s
              </div>
            </div>

            <div className="space-y-2 border-l border-zinc-200/80 pl-4">
              <div className="text-xs font-semibold text-zinc-500">Temperature</div>
              <div className="text-xl font-bold text-zinc-900 tabular-nums">
                {hasValidSignal && detailMachine.latestTemperatureC !== null
                  ? `${detailMachine.latestTemperatureC.toFixed(1)} °C`
                  : 'No Signal'}
              </div>
              <TemperatureTrendVisual
                elevated={
                  hasValidSignal &&
                  detailMachine.latestTemperatureC !== null &&
                  detailMachine.latestTemperatureC >
                    detailMachine.fingerprint.temperatureMaxC
                }
                className="w-full h-10"
              />
              <div className="text-xs font-medium text-zinc-500 tabular-nums">
                Normal range {detailMachine.fingerprint.temperatureMinC.toFixed(1)}–
                {detailMachine.fingerprint.temperatureMaxC.toFixed(1)} °C
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-[#F5F4F2] rounded-2xl p-5 flex flex-col items-center justify-center text-center">
            <MachineHealthGaugeVisual
              status={detailMachine.healthStatus}
              sensorHealth={detailMachine.sensorHealth}
              deviationPercent={deviationPct}
            />
            <div className="mt-2 text-xs font-medium text-zinc-500 tabular-nums">
              Last sample {formatTimestamp(detailMachine.lastUpdated)}
            </div>
          </div>
        </div>

        {/* Charts & Machine Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-bold text-zinc-900">
                  Condition History
                </h2>
                <p className="text-xs font-medium text-zinc-500 mt-0.5">
                  Simulated readings compared against this machine’s normal range
                </p>
              </div>
              <span className="text-xs font-semibold text-zinc-700 bg-white px-3 py-1 rounded-full">
                Simulated Sensor Data
              </span>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5">
              <ConditionCharts machine={detailMachine} height={160} />
            </div>
          </div>

          <div className="xl:col-span-4 bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-zinc-900">
              Machine Alert Log
            </h2>
            <div className="bg-white rounded-xl divide-y divide-zinc-100 px-4">
              {machineAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No alerts logged for {detailMachine.id}.
                </div>
              ) : (
                machineAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="py-3.5 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-zinc-900">
                        {alert.alertType}
                      </span>
                      <span className={`font-medium ${getSeverityTone(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {alert.whatChanged}
                    </p>
                    <p className="text-[11px] text-zinc-500 leading-relaxed">
                      {alert.suggestedInspection}
                    </p>
                    <div className="text-[11px] text-zinc-400 tabular-nums">
                      {formatDateTime(alert.timestamp)} · {alert.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Simulated Reading History */}
        <section className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-medium text-zinc-900">
                Recent Simulated Readings
              </h2>
              <p className="text-xs text-zinc-500">
                Latest 8 readings for {detailMachine.name} ({detailMachine.id})
              </p>
            </div>
            <span className="text-[11px] font-medium text-zinc-600 bg-white px-3 py-1 rounded-full">
              Units: mm/s · °C
            </span>
          </div>
          <div className="bg-white rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50/70 text-[11px] font-semibold text-zinc-500">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Vibration (mm/s)</th>
                  <th className="py-2.5 px-4">Temperature (°C)</th>
                  <th className="py-2.5 px-4">Sensor Status</th>
                  <th className="py-2.5 px-4">Evaluated Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentRows.map((row, idx) => (
                  <tr key={`${row.timestamp}-${idx}`}>
                    <td className="py-2.5 px-4 text-zinc-600 tabular-nums">
                      {formatDateTime(row.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-zinc-900 tabular-nums">
                      {row.sensorHealth === 'Connected' && row.vibrationMmS !== null
                        ? `${row.vibrationMmS.toFixed(2)} mm/s`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-zinc-900 tabular-nums">
                      {row.sensorHealth === 'Connected' && row.temperatureC !== null
                        ? `${row.temperatureC.toFixed(1)} °C`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-4">
                      <SensorHealthLabel sensorHealth={row.sensorHealth} />
                    </td>
                    <td className="py-2.5 px-4">
                      <StatusLabel
                        status={row.machineCondition}
                        sensorHealth={row.sensorHealth}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-[34px] font-bold tracking-tight text-zinc-900">
            Monitored Machines
          </h1>
          <p className="mt-1.5 text-sm sm:text-[15px] font-medium text-zinc-600">
            Pick a machine to inspect its live readings, healthy baseline range, and alert log.
          </p>
        </div>
        <div className="text-[13px] font-semibold text-zinc-600 tabular-nums">
          {filteredMachines.length} of {machines.length} machines shown
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID or machine name..."
            className="w-full pl-10 pr-3.5 py-2 text-[13px] font-medium bg-[#F5F4F2] rounded-full text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#D96B27]/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start">
          {(
            [
              { id: 'All', label: 'All' },
              { id: 'NORMAL', label: 'Normal' },
              { id: 'WARNING', label: 'Warning' },
              { id: 'CRITICAL', label: 'Critical' },
              { id: 'SENSOR ISSUE', label: 'Sensor Issue' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-4 py-1.5 text-[13px] font-semibold rounded-full transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                statusFilter === tab.id
                  ? 'bg-zinc-900 text-white'
                  : 'bg-[#F5F4F2] text-zinc-800 hover:bg-[#EAE8E4]'
              }`}
            >
              {tab.label} ({filterCounts[tab.id]})
            </button>
          ))}
        </div>
      </div>

      {/* Machines Grid */}
      {filteredMachines.length === 0 ? (
        <div className="bg-[#F5F4F2] rounded-2xl p-10 text-center space-y-3">
          <p className="text-base font-semibold text-zinc-900">
            {statusFilter !== 'All'
              ? `No machines currently have a ${statusFilter} status.`
              : 'No machines match your current search.'}
          </p>
          <p className="text-[13px] text-zinc-600 max-w-md mx-auto">
            You can clear the filter to view all machines, or test a scenario in the Simulation Lab.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('All');
              }}
              className="px-4 py-2 rounded-full text-[13px] font-semibold bg-zinc-900 text-white hover:bg-zinc-800"
            >
              Clear Filter (Show All {machines.length})
            </button>
            <button
              type="button"
              onClick={() => setActivePage('simulation')}
              className="px-4 py-2 rounded-full text-[13px] font-semibold bg-[#D96B27] text-white hover:bg-[#C05A1B]"
            >
              Test in Simulation Lab
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMachines.map((machine) => {
            const hasValidSignal =
              machine.sensorHealth === 'Connected' &&
              machine.latestVibrationMmS !== null &&
              machine.latestTemperatureC !== null;
            return (
              <article
                key={machine.id}
                className="bg-[#F5F4F2] rounded-2xl p-5 flex flex-col justify-between transition-colors"
              >
                <div className="bg-white rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-semibold text-zinc-500">
                        {machine.id}
                      </div>
                      <h2 className="font-display text-xl font-bold text-zinc-900 mt-0.5">
                        {machine.name}
                      </h2>
                      <div className="text-xs font-medium text-zinc-500 mt-0.5">
                        {machine.category}
                      </div>
                    </div>
                    <div className="text-zinc-700 shrink-0">
                      <MachineTypeIllustration
                        type={machine.type}
                        className="w-16 h-12"
                      />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-2">
                    <StatusLabel
                      status={machine.healthStatus}
                      sensorHealth={machine.sensorHealth}
                    />
                    <SensorHealthLabel sensorHealth={machine.sensorHealth} />
                  </div>

                  <div className="text-xs font-medium text-zinc-600">
                    Baseline:{' '}
                    <span className={`font-semibold ${getBaselineTone(machine.fingerprint.status)}`}>
                      {machine.fingerprint.status}
                    </span>
                  </div>

                  <p className="text-[13px] text-zinc-600 leading-relaxed">
                    {machine.statusSummary}
                  </p>

                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-zinc-100">
                    <div>
                      <div className="text-xs font-medium text-zinc-500">Vibration</div>
                      <div className="text-[15px] font-bold text-zinc-900 tabular-nums mt-0.5">
                        {hasValidSignal && machine.latestVibrationMmS !== null
                          ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
                          : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-500">Temperature</div>
                      <div className="text-[15px] font-bold text-zinc-900 tabular-nums mt-0.5">
                        {hasValidSignal && machine.latestTemperatureC !== null
                          ? `${machine.latestTemperatureC.toFixed(1)} °C`
                          : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-zinc-500">Rated Speed</div>
                      <div className="text-[15px] font-bold text-zinc-900 tabular-nums mt-0.5">
                        {machine.ratedRpm} RPM
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 px-1">
                  <span className="text-xs font-medium text-zinc-600">
                    {machine.location}
                  </span>
                  <button
                    type="button"
                    onClick={() => openMachineDetails(machine.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[13px] font-semibold bg-[#D96B27] text-white hover:bg-[#C05A1B] transition-colors whitespace-nowrap shrink-0"
                  >
                    <span>Open Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
