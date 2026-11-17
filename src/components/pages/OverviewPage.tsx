import React from 'react';
import {
  Activity,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  Eye,
  Fingerprint,
  FlaskConical,
  Gauge,
  Radio,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import {
  formatDateTime,
  formatTimestamp,
  getAlertStatusTone,
  getBaselineTone,
  getSeverityTone,
} from '../../utils/formatters';
import { ConditionCharts } from '../charts/ConditionCharts';
import { InfoTooltip } from '../common/InfoTooltip';
import { SensorHealthLabel, StatusLabel } from '../common/StatusLabel';
import { MachineTypeIllustration } from '../illustrations/MachineIllustrations';

export const OverviewPage: React.FC = () => {
  const {
    machines,
    alerts,
    summaryCounts,
    selectedMachineId,
    setSelectedMachineId,
    openMachineDetails,
    setActivePage,
    isMonitoring,
    resetDemoData,
  } = useSanket();

  const trendMachine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];

  const recentAlerts = alerts.slice(0, 4);

  const summaryItems = [
    {
      label: 'Total Machines',
      value: summaryCounts.totalMachines,
      note: 'Simulated asset inventory',
      icon: Cpu,
      accentClass: 'text-slate-800',
    },
    {
      label: 'Healthy',
      value: summaryCounts.healthy,
      note: 'NORMAL condition & connected sensor',
      icon: CheckCircle2,
      accentClass: 'text-emerald-700',
    },
    {
      label: 'Under Observation',
      value: summaryCounts.underObservation,
      note: 'WARNING or SENSOR ISSUE active',
      icon: Eye,
      accentClass: 'text-amber-700',
    },
    {
      label: 'Active Alerts',
      value: summaryCounts.activeAlerts,
      note: 'Unresolved inspection notices',
      icon: ShieldAlert,
      accentClass:
        summaryCounts.activeAlerts > 0 ? 'text-red-700' : 'text-slate-800',
    },
  ];

  const workflowSteps = [
    {
      step: 'SENSOR INPUT',
      caption: 'Simulated vibration & temperature samples',
      icon: Radio,
    },
    {
      step: 'HEALTH FINGERPRINT',
      caption: 'Operator-verified baseline envelope',
      icon: Fingerprint,
    },
    {
      step: 'ANOMALY DETECTION',
      caption: 'Rule-based drift & persistence checks',
      icon: Gauge,
    },
    {
      step: 'ALERT',
      caption: 'Explainable reason & comparison',
      icon: BellRing,
    },
    {
      step: 'INSPECTION',
      caption: 'Suggested operator check',
      icon: ClipboardCheck,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Machine Overview
          </h1>
          <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
            Monitor machine health, detect unusual behaviour and act before minor issues escalate.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5 mr-1">
            <Activity
              className={`w-3.5 h-3.5 ${isMonitoring ? 'text-emerald-600' : 'text-amber-600'}`}
              aria-hidden="true"
            />
            <span>
              {isMonitoring
                ? 'Simulated Monitoring Active'
                : 'Monitoring Stopped'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('simulation')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <FlaskConical className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
            <span>Load Demo Scenarios</span>
          </button>
          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Four Summary Cards (Calculated from live state) */}
      <section aria-label="Fleet Health Summary" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-4"
            >
              <div>
                <div className="text-xs font-medium text-slate-500">
                  {item.label}
                </div>
                <div
                  className={`mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums ${item.accentClass}`}
                >
                  {item.value}
                </div>
                <div className="mt-1 text-xs text-slate-500">{item.note}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </div>
            </div>
          );
        })}
      </section>

      {/* A. Machine Health Overview */}
      <section aria-labelledby="section-machine-health" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5">
              <h2
                id="section-machine-health"
                className="font-display text-lg font-semibold text-slate-900"
              >
                Machine Health Overview
              </h2>
              <InfoTooltip
                label="Demonstration Baselines"
                explanation="Shown baseline ranges are illustrative demonstration values for this software prototype, not validated industrial thresholds."
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Simulated readings evaluated against each machine’s stored baseline
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActivePage('machines')}
            className="text-xs font-medium text-blue-700 hover:text-blue-800 inline-flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <span>All Machines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {machines.map((machine) => {
            const isSelected = trendMachine?.id === machine.id;
            const hasValidSignal =
              machine.sensorHealth === 'Connected' &&
              machine.latestVibrationMmS !== null &&
              machine.latestTemperatureC !== null;

            return (
              <article
                key={machine.id}
                className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-colors ${
                  isSelected
                    ? 'border-slate-400'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedMachineId(machine.id)}
                      className="min-w-0 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                    >
                      <div className="font-mono text-xs font-medium text-slate-500">
                        {machine.id}
                      </div>
                      <h3 className="font-display text-base font-semibold text-slate-900 mt-0.5 truncate">
                        {machine.name}
                      </h3>
                    </button>
                    <div className="text-slate-700 shrink-0">
                      <MachineTypeIllustration
                        type={machine.type}
                        className="w-14 h-10"
                      />
                    </div>
                  </div>

                  {/* Condition & Sensor Status */}
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <StatusLabel
                      status={machine.healthStatus}
                      sensorHealth={machine.sensorHealth}
                    />
                    <SensorHealthLabel sensorHealth={machine.sensorHealth} />
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
                    <span>
                      Baseline:{' '}
                      <span className={`font-medium ${getBaselineTone(machine.fingerprint.status)}`}>
                        {machine.fingerprint.status}
                      </span>
                    </span>
                    {machine.fingerprint.status !== 'Ready for Monitoring' && (
                      <span className="font-medium text-amber-700">
                        Unverified
                      </span>
                    )}
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="mt-4 grid grid-cols-2 gap-4 pt-1">
                    <div>
                      <div className="text-[11px] text-slate-500">Latest Vibration</div>
                      <div className="mt-0.5 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                        {hasValidSignal && machine.latestVibrationMmS !== null
                          ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
                          : 'No signal'}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Latest Temperature</div>
                      <div className="mt-0.5 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                        {hasValidSignal && machine.latestTemperatureC !== null
                          ? `${machine.latestTemperatureC.toFixed(1)} °C`
                          : 'No signal'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] text-slate-500 tabular-nums">
                    Updated {formatTimestamp(machine.lastUpdated)}
                  </span>
                  <button
                    type="button"
                    onClick={() => openMachineDetails(machine.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-amber-700 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* B. Condition Trend & C. Recent Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Condition Trend (7 cols) */}
        <section
          aria-labelledby="section-condition-trend"
          className="xl:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2
                id="section-condition-trend"
                className="font-display text-base font-semibold text-slate-900"
              >
                Condition Trend · {trendMachine?.id}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Separate-axis vibration and temperature series · Simulated Sensor Data
              </p>
            </div>

            <div
              className="inline-flex items-center p-1 bg-slate-100 rounded-lg self-start sm:self-auto"
              role="tablist"
              aria-label="Select machine trend"
            >
              {machines.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={trendMachine?.id === m.id}
                  onClick={() => setSelectedMachineId(m.id)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    trendMachine?.id === m.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m.id}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            {trendMachine && <ConditionCharts machine={trendMachine} height={140} />}
          </div>
        </section>

        {/* Recent Alerts (5 cols) */}
        <section
          aria-labelledby="section-recent-alerts"
          className="xl:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
        >
          <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2
                id="section-recent-alerts"
                className="font-display text-base font-semibold text-slate-900"
              >
                Recent Alerts
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generated automatically by rule-based anomaly checks
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('alerts')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800 whitespace-nowrap"
            >
              View History
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {recentAlerts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                No alerts recorded yet. Start monitoring or run a Simulation Lab scenario.
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="py-3.5 first:pt-2 last:pb-0 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-semibold text-slate-900">
                        {alert.machineId}
                      </span>
                      <span className="text-slate-300" aria-hidden="true">·</span>
                      <span className={`font-medium ${getSeverityTone(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className={`text-xs ${getAlertStatusTone(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {alert.whatChanged}
                  </p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    {alert.suggestedInspection}
                  </p>
                  <div className="font-mono text-[11px] text-slate-400 tabular-nums">
                    {formatDateTime(alert.timestamp)} · {alert.triggeringParameter}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* D. Monitoring Workflow */}
      <section
        aria-labelledby="section-workflow"
        className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-1.5">
            <h2
              id="section-workflow"
              className="font-display text-base font-semibold text-slate-900"
            >
              Monitoring Workflow
            </h2>
            <InfoTooltip
              label="Rule-Based Early Warning"
              explanation="SANKET+ evaluates persistence across multiple readings rather than predicting exact failures from a single spike."
            />
          </div>
          <span className="text-xs text-slate-500">
            Software prototype flow using simulated telemetry
          </span>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
          {workflowSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative flex items-start md:flex-col gap-3 md:gap-2">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  </div>
                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden md:flex flex-1 items-center justify-center text-slate-300 px-1">
                      <div className="h-px flex-1 bg-slate-200" />
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 text-slate-400 ml-1" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-semibold tracking-wide text-slate-900">
                    {item.step}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                    {item.caption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
