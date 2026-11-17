import React from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  StepForward,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { formatDateTime, formatTimestamp } from '../../utils/formatters';
import { ConditionCharts } from '../charts/ConditionCharts';
import { InfoTooltip } from '../common/InfoTooltip';
import { SensorHealthLabel, StatusLabel } from '../common/StatusLabel';
import {
  MachineHealthGaugeVisual,
  VibrationWaveformVisual,
} from '../illustrations/MachineIllustrations';

export const LiveMonitoringPage: React.FC = () => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    sampleIntervalMs,
    setSampleIntervalMs,
    stepSimulatedSample,
    resetMachineScenario,
    settings,
  } = useSanket();

  const machine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];

  const hasValidSignal =
    machine.sensorHealth === 'Connected' &&
    machine.latestVibrationMmS !== null &&
    machine.latestTemperatureC !== null;

  const vibDiffPct =
    hasValidSignal && machine.latestVibrationMmS !== null
      ? Math.round(
          ((machine.latestVibrationMmS - machine.fingerprint.vibrationMeanMmS) /
            Math.max(0.1, machine.fingerprint.vibrationMeanMmS)) *
            100
        )
      : null;

  const tempDiffC =
    hasValidSignal && machine.latestTemperatureC !== null
      ? Number(
          (
            machine.latestTemperatureC - machine.fingerprint.temperatureMeanC
          ).toFixed(1)
        )
      : null;

  const deviationScore = !hasValidSignal
    ? 100
    : Math.min(
        95,
        Math.max(
          0,
          Math.round(
            Math.max(0, (vibDiffPct ?? 0) - 12) * 0.9 +
              Math.max(0, (tempDiffC ?? 0) - 3) * 3.5
          )
        )
      );

  const vibRatio =
    hasValidSignal && machine.latestVibrationMmS !== null
      ? machine.latestVibrationMmS /
        Math.max(0.5, machine.fingerprint.vibrationMeanMmS)
      : 0.35;

  const recentRows = [...machine.readings].reverse().slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-[28px] font-medium tracking-tight text-zinc-900">
            Live Monitoring
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Watch live simulated readings for each machine and see how SANKET+ spots sustained changes.
          </p>
        </div>

        {/* Monitoring Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Select machine for live monitoring"
            value={machine.id}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="px-4 py-2 text-xs font-medium bg-[#F5F4F2] rounded-full text-zinc-900 focus:outline-none focus:ring-2 focus:ring-[#D96B27]/40"
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Simulated sampling cadence"
            value={sampleIntervalMs}
            onChange={(e) => setSampleIntervalMs(Number(e.target.value))}
            className="px-3.5 py-2 text-xs font-medium bg-[#F5F4F2] rounded-full text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#D96B27]/40"
          >
            <option value={1000}>1.0s interval</option>
            <option value={1800}>1.8s interval</option>
            <option value={4000}>4.0s interval</option>
          </select>

          <button
            type="button"
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              isMonitoring
                ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                : 'bg-[#D96B27] text-white hover:bg-[#C05A1B]'
            }`}
          >
            {isMonitoring ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Stop Monitoring</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Monitoring</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => stepSimulatedSample(machine.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-[#F5F4F2] transition-colors whitespace-nowrap"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step Sample</span>
          </button>

          {(machine.healthStatus !== 'NORMAL' ||
            machine.sensorHealth === 'SENSOR ISSUE') && (
            <button
              type="button"
              onClick={() => resetMachineScenario(machine.id)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-[#F5F4F2] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Nominal</span>
            </button>
          )}
        </div>
      </div>

      {/* Sensor Issue Warning Banner */}
      {machine.sensorHealth === 'SENSOR ISSUE' && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 text-xs text-blue-900">
          <strong>SENSOR ISSUE ({machine.id}): </strong>
          {machine.sensorIssueDetail} Missing or invalid values are never treated as zero or healthy.
        </div>
      )}

      {/* Unverified Baseline Advisory */}
      {machine.fingerprint.status !== 'Ready for Monitoring' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-xs text-amber-900">
          <strong>Unverified Baseline ({machine.fingerprint.status}): </strong>
          Current checks are provisional only. Complete the operator baseline workflow in Health Fingerprint before treating limits as verified.
        </div>
      )}

      {/* Live Sensor Reading Cards */}
      <section
        aria-label="Simulated Live Sensor Readings"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <div className="bg-[#F5F4F2] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Vibration Level</span>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-full text-zinc-600">Simulated</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900 tabular-nums">
            {hasValidSignal && machine.latestVibrationMmS !== null
              ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
              : 'No Valid Signal'}
          </div>
          <div className="mt-1.5 text-xs text-zinc-500 tabular-nums">
            {vibDiffPct !== null
              ? `${vibDiffPct >= 0 ? '+' : ''}${vibDiffPct}% vs baseline average`
              : 'Sensor integrity issue'}
          </div>
        </div>

        <div className="bg-[#F5F4F2] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Operating Temperature</span>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-full text-zinc-600">Simulated</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900 tabular-nums">
            {hasValidSignal && machine.latestTemperatureC !== null
              ? `${machine.latestTemperatureC.toFixed(1)} °C`
              : 'No Valid Signal'}
          </div>
          <div className="mt-1.5 text-xs text-zinc-500 tabular-nums">
            {tempDiffC !== null
              ? `${tempDiffC >= 0 ? '+' : ''}${tempDiffC.toFixed(1)} °C vs baseline average`
              : 'Sensor integrity issue'}
          </div>
        </div>

        <div className="bg-[#F5F4F2] rounded-2xl p-5">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Peak Shock</span>
            <span className="text-[11px] bg-white px-2 py-0.5 rounded-full text-zinc-600">Simulated</span>
          </div>
          <div className="mt-2 text-2xl font-semibold text-zinc-900 tabular-nums">
            {hasValidSignal && machine.latestPeakAccelG !== null
              ? `${machine.latestPeakAccelG.toFixed(2)} g`
              : '—'}
          </div>
          <div className="mt-1.5 text-xs text-zinc-500">
            Sensitivity: {settings.sensitivity}
          </div>
        </div>

        <div className="bg-[#F5F4F2] rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Condition & Sensor</span>
            <span className="text-[11px] tabular-nums">
              {formatTimestamp(machine.lastUpdated)}
            </span>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <StatusLabel
              status={machine.healthStatus}
              sensorHealth={machine.sensorHealth}
            />
          </div>
          <div className="mt-1.5">
            <SensorHealthLabel sensorHealth={machine.sensorHealth} />
          </div>
        </div>
      </section>

      {/* Main Charts & Diagnostic Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-medium text-zinc-900">
                {machine.name} ({machine.id}) — Vibration & Temperature Stream
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {isMonitoring || machine.scenarioRunning
                  ? `Updating simulated readings every ${(sampleIntervalMs / 1000).toFixed(1)}s`
                  : 'Monitoring paused · Click Start Monitoring or Step Sample'}
              </p>
            </div>
            <span className="text-[11px] font-medium text-[#D96B27] bg-white px-3 py-1 rounded-full self-start sm:self-auto">
              Simulated Data Stream
            </span>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5">
            <ConditionCharts machine={machine} height={158} />
          </div>
        </div>

        <div className="xl:col-span-4 space-y-5">
          <div className="bg-[#F5F4F2] rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <h2 className="font-display text-base font-medium text-zinc-900">
                  Condition Assessment
                </h2>
                <InfoTooltip
                  label="Persistence & Correlation"
                  explanation="Alerts escalate only when deviations persist across consecutive samples or when vibration and temperature deviate concurrently."
                />
              </div>
              <StatusLabel
                status={machine.healthStatus}
                sensorHealth={machine.sensorHealth}
              />
            </div>

            <div className="bg-white rounded-xl p-4 space-y-4">
              <div className="flex justify-center py-1">
                <MachineHealthGaugeVisual
                  status={machine.healthStatus}
                  sensorHealth={machine.sensorHealth}
                  deviationPercent={deviationScore}
                />
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                {machine.statusSummary}
              </p>

              <div className="pt-3 border-t border-zinc-100 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Waveform Preview</span>
                  <span className="font-medium text-zinc-700 tabular-nums">
                    {hasValidSignal && machine.latestVibrationMmS !== null
                      ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
                      : 'No Signal'}
                  </span>
                </div>
                <VibrationWaveformVisual
                  amplitude={vibRatio}
                  accentColor={
                    machine.healthStatus === 'CRITICAL' ? '#DC2626' : '#D96B27'
                  }
                  className="w-full h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reading History */}
      <section className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-base font-medium text-zinc-900">
              Recent Simulated Readings · {machine.id}
            </h2>
            <p className="text-xs text-zinc-500">
              Latest 8 readings with units and sensor connection status
            </p>
          </div>
          <span className="text-[11px] font-medium text-zinc-600 bg-white px-3 py-1 rounded-full">
            Simulated Sensor Data
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
};
