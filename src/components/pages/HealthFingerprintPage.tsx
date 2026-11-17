import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Play,
  RotateCcw,
  ShieldCheck,
  StepForward,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { BaselineStatus } from '../../types/sanket';
import { formatDateTime, getBaselineTone } from '../../utils/formatters';
import { InfoTooltip } from '../common/InfoTooltip';
import { SensorHealthLabel, StatusLabel } from '../common/StatusLabel';
import { MachineTypeIllustration } from '../illustrations/MachineIllustrations';

const BASELINE_STATES: BaselineStatus[] = [
  'Not Established',
  'Learning in Progress',
  'Requires Verification',
  'Ready for Monitoring',
];

export const HealthFingerprintPage: React.FC = () => {
  const {
    machines,
    alerts,
    selectedMachineId,
    setSelectedMachineId,
    confirmMachineHealthy,
    startBaselineLearning,
    captureLearningSample,
    completeBaseline,
    resetBaseline,
    isMonitoring,
  } = useSanket();

  const [confirmingReset, setConfirmingReset] = useState(false);

  const machine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];
  const fp = machine.fingerprint;

  const hasActiveAlert = alerts.some(
    (a) => a.machineId === machine.id && a.status === 'Active'
  );
  const canLearn =
    machine.sensorHealth === 'Connected' &&
    machine.healthStatus === 'NORMAL' &&
    !hasActiveAlert;

  const isLearning = fp.status === 'Learning in Progress';
  const samplesReady = fp.samplesCollected >= fp.samplesRequired;
  const canComplete =
    fp.healthyConfirmed &&
    samplesReady &&
    canLearn &&
    fp.status === 'Requires Verification';

  return (
    <div className="space-y-6">
      {/* Intro Explanation */}
      <div className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
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
            onChange={(e) => {
              setSelectedMachineId(e.target.value);
              setConfirmingReset(false);
            }}
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
        {/* Left: Baseline State & Explicit 3-Step Operator Workflow */}
        <div className="lg:col-span-5 bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="font-mono text-xs text-slate-500">{machine.id}</div>
              <h2 className="font-display text-lg font-semibold text-slate-900 mt-0.5">
                {machine.name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <StatusLabel
                  status={machine.healthStatus}
                  sensorHealth={machine.sensorHealth}
                />
                <SensorHealthLabel sensorHealth={machine.sensorHealth} />
              </div>
            </div>
            <div className="text-slate-700 shrink-0">
              <MachineTypeIllustration type={machine.type} className="w-16 h-12" />
            </div>
          </div>

          {/* Current Baseline Status */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500 inline-flex items-center gap-1">
                <span>Baseline Status</span>
                <InfoTooltip
                  label="Operator-Approved Baselines"
                  explanation="Baselines are never automatically approved. After learning completes, an operator must explicitly review and click Complete Baseline."
                />
              </span>
              <span className={`font-semibold ${getBaselineTone(fp.status)}`}>
                {fp.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {BASELINE_STATES.map((state) => {
                const isCurrent = fp.status === state;
                return (
                  <div
                    key={state}
                    className={`px-3 py-2 rounded-lg text-xs font-medium border ${
                      isCurrent
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-slate-50/70 text-slate-500'
                    }`}
                  >
                    {state}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Safety Block Notice if Abnormal or Sensor Issue */}
          {!canLearn && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <span>
                Baseline confirmation and learning are blocked while {machine.id} has condition{' '}
                <strong>{machine.healthStatus}</strong>,{' '}
                <strong>{machine.sensorHealth}</strong>, or an active alert.
              </span>
            </div>
          )}

          {/* Explicit 3-Step Workflow */}
          <div className="pt-3 border-t border-slate-100 space-y-4">
            <div className="text-xs font-semibold text-slate-900">
              Baseline Establishment Workflow
            </div>

            {/* Step 1: Confirm Machine Healthy */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-medium text-slate-800">
                  1. Confirm Machine Healthy
                </div>
                <div className="text-slate-500 mt-0.5">
                  {fp.healthyConfirmed
                    ? `Confirmed by ${fp.confirmedBy}`
                    : 'Verify machine is running normally first'}
                </div>
              </div>
              <button
                type="button"
                disabled={!canLearn}
                onClick={() => confirmMachineHealthy(machine.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  fp.healthyConfirmed
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : canLearn
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                {fp.healthyConfirmed ? 'Confirmed' : 'Confirm Healthy'}
              </button>
            </div>

            {/* Step 2: Start Learning */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-medium text-slate-800">2. Start Learning</div>
                  <div className="text-slate-500 mt-0.5 font-mono tabular-nums">
                    {fp.learningProgress}% · {fp.samplesCollected} / {fp.samplesRequired} healthy samples
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {isLearning ? (
                    <button
                      type="button"
                      onClick={() => captureLearningSample(machine.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium bg-amber-600 text-white hover:bg-amber-700 whitespace-nowrap"
                    >
                      <StepForward className="w-3.5 h-3.5" />
                      <span>Capture Sample</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!fp.healthyConfirmed || !canLearn}
                      onClick={() => startBaselineLearning(machine.id)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                        fp.healthyConfirmed && canLearn
                          ? 'bg-[#D96B27] text-white hover:bg-[#C05A1B]'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <Play className="w-3 h-3" />
                      <span>Start Learning</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${fp.learningProgress}%` }}
                />
              </div>

              {isLearning && (
                <p className="text-[11px] text-slate-500">
                  {isMonitoring
                    ? 'Live monitoring is active and automatically collecting healthy samples.'
                    : 'Click Capture Sample repeatedly or Start Monitoring in the header to collect all 12 samples.'}
                </p>
              )}
            </div>

            {/* Step 3: Complete Baseline */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <div>
                <div className="font-medium text-slate-800">
                  3. Complete Baseline
                </div>
                <div className="text-slate-500 mt-0.5">
                  {fp.status === 'Ready for Monitoring'
                    ? 'Approved for anomaly comparison'
                    : fp.status === 'Requires Verification' && samplesReady
                    ? 'Samples collected — operator approval required'
                    : 'Available once learning finishes'}
                </div>
              </div>
              <button
                type="button"
                disabled={!canComplete}
                onClick={() => completeBaseline(machine.id)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium whitespace-nowrap ${
                  canComplete
                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                    : fp.status === 'Ready for Monitoring'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>
                  {fp.status === 'Ready for Monitoring'
                    ? 'Approved'
                    : 'Complete Baseline'}
                </span>
              </button>
            </div>
          </div>

          {/* Reset Baseline with Explicit Confirmation */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Last baseline update</span>
              <span className="font-mono tabular-nums text-slate-700">
                {formatDateTime(fp.lastUpdated)}
              </span>
            </div>

            {!confirmingReset ? (
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-red-700"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Stored Baseline</span>
              </button>
            ) : (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
                <p className="text-xs text-red-900">
                  Reset baseline for <strong>{machine.id}</strong>? Stored reference status will return to Not Established until re-learned.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      resetBaseline(machine.id);
                      setConfirmingReset(false);
                    }}
                    className="px-3 py-1.5 rounded-md text-xs font-semibold bg-red-700 text-white hover:bg-red-800"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingReset(false)}
                    className="px-3 py-1.5 rounded-md text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Baseline Readings & Operating Envelope */}
        <div className="lg:col-span-7 bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Stored Machine Baseline Readings
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {fp.isDemonstrationBaseline
                  ? 'Illustrative demonstration baseline values (not validated industrial thresholds)'
                  : 'Operator-verified baseline learned from simulated healthy samples'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {fp.isDemonstrationBaseline ? 'Demo Reference' : 'Session Learned'}
            </span>
          </div>

          {/* Vibration Envelope Row */}
          <div className="space-y-3">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-slate-900 inline-flex items-center gap-1.5">
                <span>Vibration RMS Envelope (mm/s)</span>
                <InfoTooltip
                  label="Vibration RMS"
                  explanation="Root Mean Square vibration velocity in mm/s. Deviations above the baseline ceiling across multiple consecutive readings trigger rule-based warnings."
                />
              </span>
              <span className="font-mono text-xs text-slate-600 tabular-nums">
                Current:{' '}
                <strong className="text-slate-900">
                  {machine.sensorHealth === 'Connected' &&
                  machine.latestVibrationMmS !== null
                    ? `${machine.latestVibrationMmS.toFixed(2)} mm/s`
                    : 'No Valid Signal'}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-100">
              <div>
                <div className="text-[11px] text-slate-500">Lower Bound</div>
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
                <div className="text-[11px] text-slate-500">Upper Ceiling</div>
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
                  {machine.sensorHealth === 'Connected' &&
                  machine.latestTemperatureC !== null
                    ? `${machine.latestTemperatureC.toFixed(1)} °C`
                    : 'No Valid Signal'}
                </strong>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 py-3 border-y border-slate-100">
              <div>
                <div className="text-[11px] text-slate-500">Lower Bound</div>
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
                <div className="text-[11px] text-slate-500">Upper Ceiling</div>
                <div className="font-mono text-lg font-semibold text-slate-900 tabular-nums mt-0.5">
                  {fp.temperatureMaxC.toFixed(1)} °C
                </div>
              </div>
            </div>
          </div>

          {/* Explanation Footer */}
          <div className="pt-2 text-xs text-slate-600 leading-relaxed space-y-1.5">
            <div className="font-semibold text-slate-800">
              Important Prototype Note
            </div>
            <p>
              Baselines shown here are demonstration envelopes computed from simulated readings for {machine.name} ({machine.ratedRpm} RPM). SANKET+ does not claim trained machine learning accuracy or validated industrial failure limits in this prototype.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
