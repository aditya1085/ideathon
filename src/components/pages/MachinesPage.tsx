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

  const filteredMachines = useMemo(() => {
    return machines.filter((m) => {
      const matchesQuery =
        m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'SENSOR ISSUE'
          ? m.sensorHealth === 'SENSOR ISSUE'
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
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Machines</span>
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-2xl font-bold text-slate-900">
                {detailMachine.id} — {detailMachine.name}
              </h1>
              <StatusLabel
                status={detailMachine.healthStatus}
                sensorHealth={detailMachine.sensorHealth}
              />
              <SensorHealthLabel sensorHealth={detailMachine.sensorHealth} />
            </div>
            <p className="text-xs text-slate-500">
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Live Monitoring</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedMachineId(detailMachine.id);
                setActivePage('fingerprint');
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Test Scenario</span>
            </button>
          </div>
        </div>

        {detailMachine.sensorHealth === 'SENSOR ISSUE' && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-900">
            <strong>SENSOR ISSUE: </strong>
            {detailMachine.sensorIssueDetail} Machine health cannot be confirmed as NORMAL until valid changing telemetry resumes.
          </div>
        )}

        {/* Summary & Visuals Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-500">Machine Profile</div>
              <div className="text-sm font-semibold text-slate-900">
                {detailMachine.powerRating} · {detailMachine.ratedRpm} RPM
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {detailMachine.statusSummary}
              </p>
            </div>
            <div className="text-slate-700 shrink-0">
              <MachineTypeIllustration type={detailMachine.type} className="w-20 h-16" />
            </div>
          </div>

          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <div className="text-xs text-slate-500">Vibration Signature</div>
              <div className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
                {hasValidSignal && detailMachine.latestVibrationMmS !== null
                  ? `${detailMachine.latestVibrationMmS.toFixed(2)} mm/s`
                  : 'No Signal'}
              </div>
              <VibrationWaveformVisual
                amplitude={vibRatio}
                accentColor={
                  detailMachine.healthStatus === 'CRITICAL' ? '#DC2626' : '#2563EB'
                }
                className="w-full h-10"
              />
              <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                Demo Baseline {detailMachine.fingerprint.vibrationMinMmS.toFixed(2)}–
                {detailMachine.fingerprint.vibrationMaxMmS.toFixed(2)} mm/s
              </div>
            </div>

            <div className="space-y-2 border-l border-slate-100 pl-4">
              <div className="text-xs text-slate-500">Thermal Signature</div>
              <div className="font-mono text-xl font-semibold text-slate-900 tabular-nums">
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
              <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                Demo Baseline {detailMachine.fingerprint.temperatureMinC.toFixed(1)}–
                {detailMachine.fingerprint.temperatureMaxC.toFixed(1)} °C
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center text-center">
            <MachineHealthGaugeVisual
              status={detailMachine.healthStatus}
              sensorHealth={detailMachine.sensorHealth}
              deviationPercent={deviationPct}
            />
            <div className="mt-2 font-mono text-[11px] text-slate-500 tabular-nums">
              Last sample {formatTimestamp(detailMachine.lastUpdated)}
            </div>
          </div>
        </div>

        {/* Charts & Machine Alerts */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-4">
              <div>
                <h2 className="font-display text-base font-semibold text-slate-900">
                  Condition Telemetry History
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulated readings plotted against stored demonstration baseline
                </p>
              </div>
              <span className="font-mono text-[11px] text-slate-500">
                Simulated Sensor Data
              </span>
            </div>
            <ConditionCharts machine={detailMachine} height={160} />
          </div>

          <div className="xl:col-span-4 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-slate-900 pb-3 border-b border-slate-100">
              Machine Alert Log
            </h2>
            <div className="divide-y divide-slate-100 mt-2">
              {machineAlerts.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No alerts logged for {detailMachine.id}.
                </div>
              ) : (
                machineAlerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-900">
                        {alert.alertType}
                      </span>
                      <span className={`font-medium ${getSeverityTone(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {alert.whatChanged}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {alert.suggestedInspection}
                    </p>
                    <div className="font-mono text-[11px] text-slate-400 tabular-nums">
                      {formatDateTime(alert.timestamp)} · {alert.status}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Simulated Reading History */}
        <section className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Recent Simulated Readings
              </h2>
              <p className="text-xs text-slate-500">
                Latest 8 telemetry packets for {detailMachine.id}
              </p>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Units: mm/s · °C
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold text-slate-500">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Vibration (mm/s)</th>
                  <th className="py-2.5 px-4">Temperature (°C)</th>
                  <th className="py-2.5 px-4">Sensor Status</th>
                  <th className="py-2.5 px-4">Evaluated Condition</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRows.map((row, idx) => (
                  <tr key={`${row.timestamp}-${idx}`}>
                    <td className="py-2.5 px-4 font-mono text-slate-600 tabular-nums">
                      {formatDateTime(row.timestamp)}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-900 tabular-nums">
                      {row.sensorHealth === 'Connected' && row.vibrationMmS !== null
                        ? `${row.vibrationMmS.toFixed(2)} mm/s`
                        : '—'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-900 tabular-nums">
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Monitored Machines
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Select a simulated machine asset to inspect its live readings, baseline envelope, and alert history.
          </p>
        </div>
        <div className="font-mono text-xs text-slate-500 tabular-nums">
          {filteredMachines.length} of {machines.length} machines shown
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
            aria-hidden="true"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ID or machine name..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg self-start">
          {(['All', 'NORMAL', 'WARNING', 'CRITICAL', 'SENSOR ISSUE'] as const).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === tab
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {/* Machines Grid */}
      {filteredMachines.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center space-y-3">
          <p className="text-sm text-slate-600">
            No machines match the current search or status filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('All');
            }}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800"
          >
            Reset Filters
          </button>
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
                className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-mono text-xs text-slate-500">
                        {machine.id}
                      </div>
                      <h2 className="font-display text-lg font-semibold text-slate-900 mt-0.5">
                        {machine.name}
                      </h2>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {machine.category}
                      </div>
                    </div>
                    <div className="text-slate-700 shrink-0">
                      <MachineTypeIllustration
                        type={machine.type}
                        className="w-16 h-12"
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <StatusLabel
                      status={machine.healthStatus}
                      sensorHealth={machine.sensorHealth}
                    />
                    <SensorHealthLabel sensorHealth={machine.sensorHealth} />
                  </div>

                  <div className="mt-2 text-xs text-slate-500">
                    Baseline:{' '}
                    <span className={`font-medium ${getBaselineTone(machine.fingerprint.status)}`}>
                      {machine.fingerprint.status}
                    </span>
                  </div>

                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
                    {machine.statusSummary}
                  </p>

                  <div className="mt-4 grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <div className="text-[11px] text-slate-500">Vibration</div>
                      <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums mt-0.5">
                        {hasValidSignal && machine.latestVibrationMmS !== null
                          ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
                          : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Temperature</div>
                      <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums mt-0.5">
                        {hasValidSignal && machine.latestTemperatureC !== null
                          ? `${machine.latestTemperatureC.toFixed(1)} °C`
                          : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Rated Speed</div>
                      <div className="font-mono text-sm font-semibold text-slate-900 tabular-nums mt-0.5">
                        {machine.ratedRpm} RPM
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    {machine.location}
                  </span>
                  <button
                    type="button"
                    onClick={() => openMachineDetails(machine.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
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
