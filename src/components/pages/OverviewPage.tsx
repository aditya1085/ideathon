import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BellRing,
  CheckCircle2,
  ClipboardCheck,
  Cpu,
  Download,
  Eye,
  Filter,
  Fingerprint,
  FlaskConical,
  Gauge,
  Radio,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { HealthStatus } from '../../types/sanket';
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

  const [overviewFilter, setOverviewFilter] = useState<
    'All' | HealthStatus | 'SENSOR ISSUE'
  >('All');

  const trendMachine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];

  const filteredMachines = useMemo(() => {
    if (overviewFilter === 'All') return machines;
    if (overviewFilter === 'SENSOR ISSUE') {
      return machines.filter((m) => m.sensorHealth === 'SENSOR ISSUE');
    }
    return machines.filter((m) => m.healthStatus === overviewFilter);
  }, [machines, overviewFilter]);

  const recentAlerts = alerts.slice(0, 4);

  const healthyPct =
    summaryCounts.totalMachines > 0
      ? Math.round((summaryCounts.healthy / summaryCounts.totalMachines) * 100)
      : 0;

  const handleExportSnapshot = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      mode: 'DEMO_MODE_SIMULATED_DATA',
      summary: summaryCounts,
      machines: machines.map((m) => ({
        id: m.id,
        name: m.name,
        condition: m.healthStatus,
        sensorHealth: m.sensorHealth,
        latestVibrationMmS: m.latestVibrationMmS,
        latestTemperatureC: m.latestTemperatureC,
        baselineStatus: m.fingerprint.status,
      })),
      recentAlerts: alerts.slice(0, 10),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sanket-plus-demo-snapshot.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Build points for the burnt-orange spotlight sparkline chart
  const orangeTrend = useMemo(() => {
    const pts = trendMachine.readings.slice(-12);
    const valid = pts
      .map((r) => (r.sensorHealth === 'Connected' ? r.vibrationMmS : null))
      .filter((v): v is number => v !== null);
    const min = valid.length ? Math.min(...valid, trendMachine.fingerprint.vibrationMinMmS) : 0;
    const max = valid.length ? Math.max(...valid, trendMachine.fingerprint.vibrationMaxMmS) : 5;
    const span = Math.max(0.5, max - min);
    const width = 280;
    const height = 96;
    const coords = pts.map((r, idx) => {
      const x = pts.length <= 1 ? width / 2 : (idx / (pts.length - 1)) * width;
      const val =
        r.sensorHealth === 'Connected' && r.vibrationMmS !== null
          ? r.vibrationMmS
          : min;
      const y = height - 14 - ((val - min) / span) * (height - 28);
      return { x, y, val: r.vibrationMmS, valid: r.sensorHealth === 'Connected' && r.vibrationMmS !== null };
    });
    const linePoints = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const areaPath =
      coords.length > 0
        ? `M ${coords[0].x.toFixed(1)},${height} ` +
          coords.map((c) => `L ${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ') +
          ` L ${coords[coords.length - 1].x.toFixed(1)},${height} Z`
        : '';
    const lastCoord = coords[coords.length - 1];
    return { linePoints, areaPath, lastCoord, width, height };
  }, [trendMachine]);

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

  const getBadgePillClass = (status: HealthStatus, sensorHealth: string) => {
    if (sensorHealth === 'SENSOR ISSUE') {
      return 'bg-blue-600 text-white';
    }
    if (status === 'NORMAL') return 'bg-emerald-600 text-white';
    if (status === 'WARNING') return 'bg-amber-500 text-white';
    return 'bg-red-600 text-white';
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900">
            Machine Overview
          </h1>
          <p className="mt-1 text-sm text-zinc-500 max-w-2xl">
            Monitor machine health, detect unusual behaviour and act before minor issues escalate.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setActivePage('simulation')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white border border-zinc-200 text-zinc-800 hover:bg-[#F5F4F2] transition-colors whitespace-nowrap"
          >
            <FlaskConical className="w-3.5 h-3.5 text-[#D96B27]" aria-hidden="true" />
            <span>Load Demo Scenarios</span>
          </button>

          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-[#F5F4F2] transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Demo</span>
          </button>

          <button
            type="button"
            onClick={handleExportSnapshot}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-[#F5F4F2] transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export Data</span>
          </button>
        </div>
      </div>

      {/* Filter Bar matching reference pill controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 mr-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Filters</span>
          </span>
          {(['All', 'NORMAL', 'WARNING', 'CRITICAL', 'SENSOR ISSUE'] as const).map(
            (filterOpt) => (
              <button
                key={filterOpt}
                type="button"
                onClick={() => setOverviewFilter(filterOpt)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${
                  overviewFilter === filterOpt
                    ? 'bg-zinc-900 text-white border-zinc-900'
                    : 'bg-[#F5F4F2] text-zinc-700 border-transparent hover:border-zinc-300'
                }`}
              >
                {filterOpt === 'All' ? 'All Machines' : filterOpt}
              </button>
            )
          )}
        </div>

        <div className="inline-flex items-center gap-2 text-xs text-zinc-500">
          <Activity
            className={`w-3.5 h-3.5 ${
              isMonitoring ? 'text-emerald-600' : 'text-[#D96B27]'
            }`}
            aria-hidden="true"
          />
          <span>
            {isMonitoring
              ? 'Live Simulated Monitoring Running'
              : 'Monitoring Stopped · Simulated Prototype'}
          </span>
        </div>
      </div>

      {/* Main 2-Column Asymmetric Reference Layout (8 cols left + 4 cols right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
        {/* LEFT 8 COLUMNS */}
        <div className="xl:col-span-8 flex flex-col gap-5">
          {/* Top Warm Panel: Fleet Condition Gauge + Live Machine Status Bars */}
          <section
            aria-label="Fleet Condition Overview"
            className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
          >
            {/* Semi-Circular Arc Gauge */}
            <div className="md:col-span-5 flex flex-col items-center md:items-start">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-base font-semibold text-zinc-900">
                  Fleet Condition Overview
                </h2>
                <InfoTooltip
                  label="Fleet Health Ratio"
                  explanation="Calculated live from the simulated machines currently in NORMAL condition with Connected sensors."
                />
              </div>

              <div className="mt-4 w-full flex flex-col items-center">
                <svg viewBox="0 0 220 124" className="w-52 h-28" aria-hidden="true">
                  {/* Track */}
                  <path
                    d="M 26 106 A 84 84 0 0 1 194 106"
                    fill="none"
                    stroke="#E4E2DD"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Segment 1: Warm Honey */}
                  <path
                    d="M 26 106 A 84 84 0 0 1 76 30"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Segment 2: Muted Teal/Emerald */}
                  <path
                    d="M 84 26 A 84 84 0 0 1 154 36"
                    fill="none"
                    stroke="#2EB88A"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  {/* Segment 3: Subtle Slate/Blue */}
                  <path
                    d="M 162 42 A 84 84 0 0 1 194 106"
                    fill="none"
                    stroke="#64748B"
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                  <text
                    x="110"
                    y="88"
                    textAnchor="middle"
                    className="fill-[#D96B27] font-display text-[26px] font-bold tabular-nums"
                  >
                    {healthyPct}%
                  </text>
                  <text
                    x="110"
                    y="108"
                    textAnchor="middle"
                    className="fill-zinc-500 font-sans text-[11px]"
                  >
                    {summaryCounts.healthy} of {summaryCounts.totalMachines} machines NORMAL
                  </text>
                </svg>
              </div>
            </div>

            {/* Machine Status Horizontal Bars */}
            <div className="md:col-span-7 space-y-3.5 md:border-l md:border-zinc-200/80 md:pl-6">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold text-zinc-900">
                  Machine Health Status
                </h3>
                <span className="text-[11px] font-mono text-zinc-600 bg-white px-2.5 py-1 rounded-full">
                  Simulated Data
                </span>
              </div>

              <div className="space-y-3">
                {machines.map((m) => {
                  const hasSignal =
                    m.sensorHealth === 'Connected' && m.latestVibrationMmS !== null;
                  const loadPct = hasSignal && m.latestVibrationMmS !== null
                    ? Math.min(
                        100,
                        Math.max(
                          14,
                          Math.round(
                            (m.latestVibrationMmS /
                              Math.max(1, m.fingerprint.vibrationMaxMmS * 1.4)) *
                              100
                          )
                        )
                      )
                    : 10;

                  const dotColor =
                    m.sensorHealth === 'SENSOR ISSUE'
                      ? 'bg-blue-600'
                      : m.healthStatus === 'NORMAL'
                      ? 'bg-emerald-600'
                      : m.healthStatus === 'WARNING'
                      ? 'bg-amber-500'
                      : 'bg-red-600';

                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMachineId(m.id)}
                      className={`w-full flex items-center gap-3 text-left rounded-xl px-2 py-1.5 transition-colors ${
                        trendMachine.id === m.id
                          ? 'bg-white/80'
                          : 'hover:bg-white/50'
                      }`}
                    >
                      <span className="flex items-center gap-2 w-24 shrink-0">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
                        <span className="font-mono text-xs font-semibold text-zinc-900 truncate">
                          {m.id}
                        </span>
                      </span>

                      <div className="flex-1 h-1.5 bg-zinc-200/80 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#D96B27] transition-all duration-300"
                          style={{ width: `${loadPct}%` }}
                        />
                      </div>

                      <span className="hidden sm:inline font-mono text-[11px] text-zinc-600 tabular-nums w-24 text-right shrink-0">
                        {hasSignal && m.latestVibrationMmS !== null
                          ? `${m.latestVibrationMmS.toFixed(2)} mm/s`
                          : 'No signal'}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold shrink-0 whitespace-nowrap ${getBadgePillClass(
                          m.healthStatus,
                          m.sensorHealth
                        )}`}
                      >
                        {m.sensorHealth === 'SENSOR ISSUE'
                          ? 'SENSOR ISSUE'
                          : m.healthStatus}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Bottom Warm Panel: 3 Crisp White Machine Health Cards */}
          <section
            aria-labelledby="section-machine-health"
            className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4 flex-1 flex flex-col justify-between"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-[#D96B27] text-white flex items-center justify-center shrink-0">
                  <Cpu className="w-3.5 h-3.5" aria-hidden="true" />
                </span>
                <div>
                  <h2
                    id="section-machine-health"
                    className="font-display text-base font-semibold text-zinc-900"
                  >
                    Machine Health Overview
                  </h2>
                </div>
              </div>

              <span className="text-[11px] font-mono text-zinc-500 bg-white px-3 py-1 rounded-full tabular-nums">
                Last updated: {formatTimestamp(trendMachine.lastUpdated)}
              </span>
            </div>

            {filteredMachines.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center space-y-2">
                <p className="text-xs text-zinc-600">
                  No machines match the selected "{overviewFilter}" filter.
                </p>
                <button
                  type="button"
                  onClick={() => setOverviewFilter('All')}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#D96B27] text-white hover:bg-[#C05A1B]"
                >
                  Show All Machines
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredMachines.map((machine) => {
                  const hasValidSignal =
                    machine.sensorHealth === 'Connected' &&
                    machine.latestVibrationMmS !== null &&
                    machine.latestTemperatureC !== null;

                  return (
                    <article
                      key={machine.id}
                      className="bg-white rounded-xl p-4 flex flex-col justify-between shadow-2xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="font-mono text-[11px] text-zinc-500">
                              {machine.id}
                            </div>
                            <h3 className="font-display text-sm font-semibold text-zinc-900 truncate">
                              {machine.name}
                            </h3>
                          </div>
                          <div className="text-zinc-700 shrink-0">
                            <MachineTypeIllustration
                              type={machine.type}
                              className="w-12 h-9"
                            />
                          </div>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5">
                          <StatusLabel
                            status={machine.healthStatus}
                            sensorHealth={machine.sensorHealth}
                          />
                          <SensorHealthLabel sensorHealth={machine.sensorHealth} />
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-zinc-100 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <div className="text-[10px] text-zinc-500">Vibration</div>
                            <div className="font-mono font-semibold text-zinc-900 tabular-nums mt-0.5">
                              {hasValidSignal && machine.latestVibrationMmS !== null
                                ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
                                : 'No signal'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] text-zinc-500">Temperature</div>
                            <div className="font-mono font-semibold text-zinc-900 tabular-nums mt-0.5">
                              {hasValidSignal && machine.latestTemperatureC !== null
                                ? `${machine.latestTemperatureC.toFixed(1)} °C`
                                : 'No signal'}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2 text-[11px] text-zinc-500">
                          Baseline:{' '}
                          <span className={`font-medium ${getBaselineTone(machine.fingerprint.status)}`}>
                            {machine.fingerprint.status}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <button
                          type="button"
                          onClick={() => openMachineDetails(machine.id)}
                          className="w-full py-2 px-3 rounded-full bg-[#D96B27] hover:bg-[#C05A1B] text-white text-xs font-semibold transition-colors text-center"
                        >
                          View Details
                        </button>
                        <div className="text-center font-mono text-[10px] text-zinc-400 tabular-nums">
                          Updated {formatTimestamp(machine.lastUpdated)}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <span className="text-zinc-500">
                Illustrative demonstration baselines · Simulated sensor values
              </span>
              <button
                type="button"
                onClick={() => setActivePage('machines')}
                className="font-medium text-zinc-800 hover:text-[#D96B27] inline-flex items-center gap-1"
              >
                <span>Open Machines Directory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </div>

        {/* RIGHT 4 COLUMNS: 4 KPI Cards + Burnt-Orange Trend Card */}
        <div className="xl:col-span-4 flex flex-col gap-3.5">
          {/* KPI 1: Total Machines */}
          <div className="bg-[#F5F4F2] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#43499E] text-white flex items-center justify-center shrink-0">
                <Cpu className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-600">
                  Total Machines
                </div>
                <div className="font-display text-2xl font-bold text-zinc-900 tabular-nums">
                  {summaryCounts.totalMachines}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <div className="w-20 h-2 bg-zinc-200 rounded-full overflow-hidden ml-auto">
                <div className="h-full bg-[#5B63C9] rounded-full w-full" />
              </div>
              <div className="text-[11px] text-zinc-500">Simulated fleet</div>
            </div>
          </div>

          {/* KPI 2: Healthy */}
          <div className="bg-[#F5F4F2] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#288474] text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-600">Healthy</div>
                <div className="font-display text-2xl font-bold text-zinc-900 tabular-nums">
                  {summaryCounts.healthy}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <div className="w-20 h-2 bg-zinc-200 rounded-full overflow-hidden ml-auto">
                <div
                  className="h-full bg-[#288474] rounded-full transition-all duration-300"
                  style={{ width: `${healthyPct}%` }}
                />
              </div>
              <div className="text-[11px] text-emerald-700 font-medium">
                NORMAL &amp; connected
              </div>
            </div>
          </div>

          {/* KPI 3: Under Observation */}
          <div className="bg-[#F5F4F2] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#5B4F8B] text-white flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-600">
                  Under Observation
                </div>
                <div className="font-display text-2xl font-bold text-zinc-900 tabular-nums">
                  {summaryCounts.underObservation}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <svg viewBox="0 0 80 24" className="w-20 h-6 ml-auto" aria-hidden="true">
                <polyline
                  points="4,18 20,16 36,12 52,14 68,8 76,10"
                  fill="none"
                  stroke="#5B4F8B"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-[11px] text-amber-700 font-medium">
                WARNING / sensor issue
              </div>
            </div>
          </div>

          {/* KPI 4: Active Alerts */}
          <div className="bg-[#F5F4F2] rounded-2xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#A93540] text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <div className="text-xs font-medium text-zinc-600">
                  Active Alerts
                </div>
                <div className="font-display text-2xl font-bold text-zinc-900 tabular-nums">
                  {summaryCounts.activeAlerts}
                </div>
              </div>
            </div>
            <div className="text-right space-y-1">
              <svg viewBox="0 0 80 24" className="w-20 h-6 ml-auto" aria-hidden="true">
                <polyline
                  points="4,16 22,15 38,16 54,14 76,15"
                  fill="none"
                  stroke="#A93540"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div
                className={`text-[11px] font-medium ${
                  summaryCounts.activeAlerts > 0 ? 'text-red-700' : 'text-zinc-500'
                }`}
              >
                {summaryCounts.activeAlerts > 0
                  ? 'Requires inspection'
                  : 'No active escalations'}
              </div>
            </div>
          </div>

          {/* Featured Burnt-Orange Trend Card matching reference */}
          <div className="bg-[#D96B27] text-white rounded-2xl p-5 flex-1 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <div className="font-display text-sm font-semibold">
                  Vibration Trend
                </div>
                <div className="text-[11px] text-white/80">
                  Simulated RMS ({trendMachine.id})
                </div>
              </div>

              <select
                aria-label="Select machine for trend spotlight"
                value={trendMachine.id}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="px-3 py-1 rounded-full bg-white text-zinc-900 text-xs font-mono font-medium focus:outline-none"
              >
                {machines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative pt-1">
              <svg
                viewBox={`0 0 ${orangeTrend.width} ${orangeTrend.height}`}
                className="w-full h-24 block"
                aria-label={`Simulated vibration trend for ${trendMachine.id}`}
              >
                <defs>
                  <pattern
                    id="sanketHatch"
                    width="8"
                    height="8"
                    patternTransform="rotate(40 0 0)"
                    patternUnits="userSpaceOnUse"
                  >
                    <line
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="8"
                      stroke="rgba(255,255,255,0.28)"
                      strokeWidth="3"
                    />
                  </pattern>
                </defs>
                {orangeTrend.areaPath && (
                  <path d={orangeTrend.areaPath} fill="url(#sanketHatch)" />
                )}
                {orangeTrend.linePoints && (
                  <polyline
                    points={orangeTrend.linePoints}
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {orangeTrend.lastCoord && orangeTrend.lastCoord.valid && (
                  <circle
                    cx={orangeTrend.lastCoord.x}
                    cy={orangeTrend.lastCoord.y}
                    r="4"
                    fill="#FFFFFF"
                  />
                )}
              </svg>

              <div className="flex items-center justify-between text-[11px] text-white/85 font-mono pt-1">
                <span>
                  {trendMachine.sensorHealth === 'Connected' &&
                  trendMachine.latestVibrationMmS !== null
                    ? `Latest: ${trendMachine.latestVibrationMmS.toFixed(2)} mm/s`
                    : 'SENSOR ISSUE'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMachineId(trendMachine.id);
                    setActivePage('live');
                  }}
                  className="font-sans font-semibold text-white hover:underline inline-flex items-center gap-1"
                >
                  <span>Live View</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Separate-Axis Condition Trend & Recent Alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">
        <section
          aria-labelledby="section-condition-trend"
          className="xl:col-span-7 bg-[#F5F4F2] rounded-2xl p-5 sm:p-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
            <div>
              <h2
                id="section-condition-trend"
                className="font-display text-base font-semibold text-zinc-900"
              >
                Condition Trend · {trendMachine.id}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Separate-axis vibration and temperature charts · Simulated Sensor Data
              </p>
            </div>

            <div
              className="inline-flex items-center p-1 bg-white rounded-full self-start sm:self-auto"
              role="tablist"
              aria-label="Select machine trend"
            >
              {machines.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="tab"
                  aria-selected={trendMachine.id === m.id}
                  onClick={() => setSelectedMachineId(m.id)}
                  className={`px-3 py-1 text-xs font-mono font-medium rounded-full transition-colors whitespace-nowrap shrink-0 ${
                    trendMachine.id === m.id
                      ? 'bg-[#D96B27] text-white'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {m.id}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5">
            <ConditionCharts machine={trendMachine} height={140} />
          </div>
        </section>

        <section
          aria-labelledby="section-recent-alerts"
          className="xl:col-span-5 bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2
                id="section-recent-alerts"
                className="font-display text-base font-semibold text-zinc-900"
              >
                Recent Alerts
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Rule-based anomaly events and inspection guidance
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActivePage('alerts')}
              className="px-3 py-1 rounded-full bg-white text-xs font-medium text-zinc-800 hover:text-[#D96B27] whitespace-nowrap"
            >
              View History
            </button>
          </div>

          <div className="bg-white rounded-xl divide-y divide-zinc-100 px-4">
            {recentAlerts.length === 0 ? (
              <div className="py-10 text-center text-xs text-zinc-500">
                No alerts recorded yet. Start monitoring or run a Simulation Lab scenario.
              </div>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="py-3.5 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono font-semibold text-zinc-900">
                        {alert.machineId}
                      </span>
                      <span className="text-zinc-300" aria-hidden="true">·</span>
                      <span className={`font-medium ${getSeverityTone(alert.severity)}`}>
                        {alert.severity}
                      </span>
                    </div>
                    <span className={`text-xs ${getAlertStatusTone(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    {alert.whatChanged}
                  </p>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">
                    {alert.suggestedInspection}
                  </p>
                  <div className="font-mono text-[11px] text-zinc-400 tabular-nums">
                    {formatDateTime(alert.timestamp)} · {alert.triggeringParameter}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Monitoring Workflow */}
      <section
        aria-labelledby="section-workflow"
        className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4">
          <div className="flex items-center gap-1.5">
            <h2
              id="section-workflow"
              className="font-display text-base font-semibold text-zinc-900"
            >
              Monitoring Workflow
            </h2>
            <InfoTooltip
              label="Rule-Based Early Warning"
              explanation="SANKET+ evaluates persistence across multiple readings rather than predicting exact failures from a single spike."
            />
          </div>
          <span className="text-xs text-zinc-500">
            Software prototype flow using simulated telemetry
          </span>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch">
          {workflowSteps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="relative flex items-start md:flex-col gap-3 md:gap-2">
                <div className="flex items-center gap-2 w-full">
                  <div className="w-8 h-8 rounded-full bg-[#F5F4F2] text-[#D96B27] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden md:flex flex-1 items-center justify-center px-1">
                      <div className="h-px flex-1 bg-zinc-200" />
                      <ArrowRight className="w-3.5 h-3.5 shrink-0 text-zinc-400 ml-1" aria-hidden="true" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[11px] font-semibold tracking-wide text-zinc-900">
                    {item.step}
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
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
