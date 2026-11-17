import React from 'react';
import {
  Pause,
  Play,
  RotateCcw,
  StepForward,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { formatTimestamp } from '../../utils/formatters';
import { ConditionCharts } from '../charts/ConditionCharts';
import { StatusLabel } from '../common/StatusLabel';
import {
  MachineHealthGaugeVisual,
  VibrationWaveformVisual,
} from '../illustrations/MachineIllustrations';

export const LiveMonitoringPage: React.FC = () => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    isStreaming,
    setIsStreaming,
    sampleIntervalMs,
    setSampleIntervalMs,
    stepSimulatedSample,
    runSimulationScenario,
    settings,
  } = useSanket();

  const machine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];

  const vibDiffPct =
    machine.latestVibrationMmS !== null
      ? Math.round(
          ((machine.latestVibrationMmS - machine.fingerprint.vibrationMeanMmS) /
            Math.max(0.1, machine.fingerprint.vibrationMeanMmS)) *
            100
        )
      : null;

  const tempDiffC =
    machine.latestTemperatureC !== null
      ? Number(
          (
            machine.latestTemperatureC - machine.fingerprint.temperatureMeanC
          ).toFixed(1)
        )
      : null;

  const deviationScore =
    machine.latestVibrationMmS === null || machine.latestTemperatureC === null
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
    machine.latestVibrationMmS !== null
      ? machine.latestVibrationMmS /
        Math.max(0.5, machine.fingerprint.vibrationMeanMmS)
      : 0.35;

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Live Monitoring
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Inspect simulated real-time vibration and temperature telemetry with baseline comparison.
          </p>
        </div>

        {/* Monitoring Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            aria-label="Select machine for live monitoring"
            value={machine.id}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
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
            className="px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-amber-500"
          >
            <option value={1000}>1.0s cadence</option>
            <option value={2000}>2.0s cadence</option>
            <option value={5000}>5.0s cadence</option>
          </select>

          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              isStreaming
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause Simulation</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Start Simulation</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => stepSimulatedSample(machine.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <StepForward className="w-3.5 h-3.5" />
            <span>Step Sample</span>
          </button>

          {machine.healthStatus !== 'Healthy' && (
            <button
              type="button"
              onClick={() => runSimulationScenario(machine.id, 'healthy')}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Healthy</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Sensor Reading Cards */}
      <section
        aria-label="Simulated Live Sensor Readings"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Vibration RMS</span>
            <span className="font-mono text-[11px]">Simulated</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {machine.latestVibrationMmS !== null
              ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
              : 'Disconnected'}
          </div>
          <div className="mt-1.5 font-mono text-xs text-slate-500 tabular-nums">
            {vibDiffPct !== null
              ? `${vibDiffPct >= 0 ? '+' : ''}${vibDiffPct}% vs baseline mean`
              : 'Awaiting packet'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Operating Temperature</span>
            <span className="font-mono text-[11px]">Simulated</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {machine.latestTemperatureC !== null
              ? `${machine.latestTemperatureC.toFixed(1)} °C`
              : 'Disconnected'}
          </div>
          <div className="mt-1.5 font-mono text-xs text-slate-500 tabular-nums">
            {tempDiffC !== null
              ? `${tempDiffC >= 0 ? '+' : ''}${tempDiffC.toFixed(1)} °C vs baseline mean`
              : 'Awaiting packet'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Peak Acceleration</span>
            <span className="font-mono text-[11px]">Simulated</span>
          </div>
          <div className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
            {machine.latestPeakAccelG !== null
              ? `${machine.latestPeakAccelG.toFixed(2)} g`
              : '—'}
          </div>
          <div className="mt-1.5 text-xs text-slate-500">
            Sensitivity mode: {settings.sensitivity}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Machine Health</span>
            <span className="font-mono text-[11px] tabular-nums">
              {formatTimestamp(machine.lastUpdated)}
            </span>
          </div>
          <div className="mt-2">
            <StatusLabel status={machine.healthStatus} />
          </div>
          <div className="mt-1.5 text-xs text-slate-500 truncate">
            Scenario: {machine.activeScenario.replace('_', ' ')}
          </div>
        </div>
      </section>

      {/* Main Charts & Diagnostic Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-xl p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                {machine.id} — Vibration & Temperature Stream
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isStreaming
                  ? `Streaming simulated samples every ${(sampleIntervalMs / 1000).toFixed(1)}s`
                  : 'Stream paused · Use Start Simulation or Step Sample to append readings'}
              </p>
            </div>
            <span className="font-mono text-[11px] text-amber-700">
              SIMULATED DATA STREAM
            </span>
          </div>

          <ConditionCharts machine={machine} height={158} />
        </div>

        <div className="xl:col-span-4 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="font-display text-base font-semibold text-slate-900">
                Condition Assessment
              </h2>
              <StatusLabel status={machine.healthStatus} compact />
            </div>

            <div className="flex justify-center py-1">
              <MachineHealthGaugeVisual
                status={machine.healthStatus}
                deviationPercent={deviationScore}
              />
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {machine.statusSummary}
            </p>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Waveform Amplitude Preview</span>
                <span className="font-mono text-slate-700 tabular-nums">
                  {machine.latestVibrationMmS !== null
                    ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
                    : 'No Signal'}
                </span>
              </div>
              <VibrationWaveformVisual
                amplitude={vibRatio}
                accentColor={
                  machine.healthStatus === 'Alert' ? '#DC2626' : '#2563EB'
                }
                className="w-full h-12"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
