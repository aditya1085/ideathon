import React from 'react';
import {
  CheckCircle2,
  Fingerprint,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { BaselineStatus } from '../../types/sanket';
import { formatDateTime, getBaselineTone } from '../../utils/formatters';
import { MachineTypeIllustration } from '../illustrations/MachineIllustrations';

const BASELINE_STATES: BaselineStatus[] = [
  'Not Established',
  'Learning',
  'Ready',
  'Requires Verification',
];

export const HealthFingerprintPage: React.FC = () => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    updateFingerprintStatus,
    toggleHealthyConfirmation,
    startBaselineLearning,
    stepSimulatedSample,
  } = useSanket();

  const machine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];
  const fp = machine.fingerprint;

  return (
    <div className="space-y-6">
      {/* Intro Explanation */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
            <Fingerprint className="w-4 h-4" aria-hidden="true" />
            <span>Machine-Specific Baseline Intelligence</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Health Fingerprint
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Every machine has its own normal operating behaviour. SANKET+ learns a machine-specific baseline and compares future readings against it.
          </p>
        </div>

        {/* Machine Selector */}
        <div className="shrink-0">
          <label
            htmlFor="fp-machine-select"
            className="block text-xs font-medium text-slate-500 mb-1.5"
          >
            Select Machine
          </label>
          <select
            id="fp-machine-select"
            value={machine.id}
            onChange={(e) => setSelectedMachineId(e.target.value)}
            className="w-full sm:w-64 px-3 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
          >
            {machines.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} — {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Fingerprint Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Status, Healthy Confirmation, Learning Progress */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="font-mono text-xs text-slate-500">{machine.id}</div>
              <h2 className="font-display text-lg font-semibold text-slate-900 mt-0.5">
                {machine.name}
              </h2>
              <div className="text-xs text-slate-500 mt-0.5">{machine.category}</div>
            </div>
            <div className="text-slate-700 shrink-0">
              <MachineTypeIllustration type={machine.type} className="w-16 h-12" />
            </div>
          </div>

          {/* Baseline Status */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">Baseline Status</span>
              <span className={`font-semibold ${getBaselineTone(fp.status)}`}>
                {fp.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BASELINE_STATES.map((state) => (
                <button
                  key={state}
                  type="button"
                  onClick={() => updateFingerprintStatus(machine.id, state)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition-colors ${
                    fp.status === state
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Progress */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-700">Learning Progress</span>
              <span className="font-mono font-semibold text-slate-900 tabular-nums">
                {fp.learningProgress}% · {fp.samplesCollected} / {fp.samplesRequired} windows
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${fp.learningProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => startBaselineLearning(machine.id)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-700 hover:text-blue-800"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-learn Baseline</span>
              </button>
              {fp.status === 'Learning' && (
                <button
                  type="button"
                  onClick={() => stepSimulatedSample(machine.id)}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
                >
                  Advance Learning Window
                </button>
              )}
            </div>
          </div>

          {/* Healthy-Condition Confirmation */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                  <span>Healthy-Condition Confirmation</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Confirm that the machine was operating under verified normal load during baseline capture.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="text-xs text-slate-600">
                {fp.healthyConfirmed ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmed by {fp.confirmedBy}
                  </span>
                ) : (
                  <span className="text-amber-700 font-medium">
                    Verification pending
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() =>
                  toggleHealthyConfirmation(machine.id, !fp.healthyConfirmed)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                  fp.healthyConfirmed
                    ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    : 'border-emerald-700 bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {fp.healthyConfirmed ? 'Mark for Re-check' : 'Confirm Healthy'}
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Last baseline update</span>
            <span className="font-mono tabular-nums text-slate-700">
              {formatDateTime(fp.lastUpdated)}
            </span>
          </div>
        </div>

        {/* Right: Baseline Readings & Operating Envelope */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Learned Baseline Readings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Simulated reference envelope vs latest live simulated reading
              </p>
            </div>
            <span className="font-mono text-[11px] text-slate-500">
              Simulated Baseline Data
            </span>
          </div>

          {/* Vibration Envelope Row */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Vibration RMS Envelope (mm/s)
              </span>
              <span className="font-mono text-xs text-slate-600 tabular-nums">
                Current:{' '}
                <strong className="text-slate-900">
                  {machine.latestVibrationMmS !== null
                    ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
                    : 'No Signal'}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-100">
              <div>
                <div className="text-[11px] text-slate-500">Normal Minimum</div>
                <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                  {fp.vibrationMinMmS.toFixed(2)} mm/s
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Baseline Mean</div>
                <div className="font-mono text-lg font-semibold text-blue-700 tabular-nums mt-0.5">
                  {fp.vibrationMeanMmS.toFixed(2)} mm/s
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Normal Ceiling</div>
                <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                  {fp.vibrationMaxMmS.toFixed(2)} mm/s
                </div>
              </div>
            </div>
          </div>

          {/* Temperature Envelope Row */}
          <div className="space-y-3 pt-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-900">
                Thermal Operating Envelope (°C)
              </span>
              <span className="font-mono text-xs text-slate-600 tabular-nums">
                Current:{' '}
                <strong className="text-slate-900">
                  {machine.latestTemperatureC !== null
                    ? `${machine.latestTemperatureC.toFixed(1)} °C`
                    : 'No Signal'}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-100">
              <div>
                <div className="text-[11px] text-slate-500">Normal Minimum</div>
                <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                  {fp.temperatureMinC.toFixed(1)} °C
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Baseline Mean</div>
                <div className="font-mono text-lg font-semibold text-amber-700 tabular-nums mt-0.5">
                  {fp.temperatureMeanC.toFixed(1)} °C
                </div>
              </div>
              <div>
                <div className="text-[11px] text-slate-500">Normal Ceiling</div>
                <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                  {fp.temperatureMaxC.toFixed(1)} °C
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Footer */}
          <div className="pt-2 text-xs text-slate-600 leading-relaxed space-y-1.5">
            <div className="font-semibold text-slate-800">
              Why machine-specific baselines matter
            </div>
            <p>
              A {machine.name.toLowerCase()} ({machine.ratedRpm} RPM) has an acoustic and thermal signature distinct from other rotating assets. Instead of applying fixed universal alarm thresholds, SANKET+ evaluates subtle sustained shifts relative to this asset’s verified operating envelope.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
