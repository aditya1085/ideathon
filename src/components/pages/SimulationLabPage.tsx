import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  FlaskConical,
  Pause,
  Play,
  RotateCcw,
  StepForward,
  TrendingUp,
  Waves,
  WifiOff,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { SIMULATION_SCENARIOS } from '../../data/initialData';
import { SensorFaultMode, SimulationScenarioId } from '../../types/sanket';
import { ConditionCharts } from '../charts/ConditionCharts';
import { SensorHealthLabel, StatusLabel } from '../common/StatusLabel';

const SCENARIO_ICONS: Record<
  SimulationScenarioId,
  React.FC<{ className?: string }>
> = {
  healthy: CheckCircle2,
  gradual_vibration: TrendingUp,
  overheating: Flame,
  combined_anomaly: AlertTriangle,
  temporary_fluctuation: Waves,
  sensor_disconnection: WifiOff,
};

export const SimulationLabPage: React.FC = () => {
  const {
    machines,
    selectedMachineId,
    setSelectedMachineId,
    startScenario,
    stopScenario,
    resetMachineScenario,
    setMachineFaultMode,
    stepSimulatedSample,
    resetDemoData,
    setActivePage,
  } = useSanket();

  const targetMachine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];

  const hasValidSignal =
    targetMachine.sensorHealth === 'Connected' &&
    targetMachine.latestVibrationMmS !== null &&
    targetMachine.latestTemperatureC !== null;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-amber-700">
            <FlaskConical className="w-4 h-4" aria-hidden="true" />
            <span>Simulated Test Environment · Not Connected to Physical Machines</span>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
            Simulation Lab
          </h1>
          <p className="text-sm text-slate-600">
            Start, stop, or reset any of the six simulated scenarios to test rule-based anomaly escalation, persistence checks, and sensor issue isolation.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2.5 shrink-0">
          <div>
            <label
              htmlFor="sim-target-machine"
              className="block text-[11px] font-medium text-slate-500 mb-1"
            >
              Target Simulated Machine
            </label>
            <select
              id="sim-target-machine"
              value={targetMachine.id}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="px-3 py-2 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-amber-500"
            >
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.id} — {m.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => resetMachineScenario(targetMachine.id)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset {targetMachine.id}</span>
          </button>

          <button
            type="button"
            onClick={resetDemoData}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset All Demo Data</span>
          </button>
        </div>
      </div>

      {/* Six Scenario Cards */}
      <section aria-label="Simulated Test Scenarios" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SIMULATION_SCENARIOS.map((scenario) => {
          const Icon = SCENARIO_ICONS[scenario.id];
          const isSelectedScenario = targetMachine.activeScenario === scenario.id;
          const isRunning = isSelectedScenario && targetMachine.scenarioRunning;

          return (
            <article
              key={scenario.id}
              className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-colors ${
                isRunning
                  ? 'border-amber-500'
                  : isSelectedScenario
                  ? 'border-slate-400'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                    <Icon className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    Scenario {scenario.code} · {scenario.effectLabel}
                  </span>
                </div>

                <div>
                  <h2 className="font-display text-base font-semibold text-slate-900">
                    {scenario.title}
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {scenario.description}
                  </p>
                </div>

                {scenario.id === 'sensor_disconnection' && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[11px] font-medium text-slate-500 mb-1.5">
                      Sensor Fault Mode
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(
                        [
                          { id: 'missing', label: 'Missing' },
                          { id: 'frozen', label: 'Frozen' },
                          { id: 'invalid', label: 'Invalid' },
                        ] as Array<{ id: SensorFaultMode; label: string }>
                      ).map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() =>
                            setMachineFaultMode(targetMachine.id, mode.id)
                          }
                          className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                            targetMachine.sensorFaultMode === mode.id
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {mode.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700 font-medium">Expected response: </strong>
                  {scenario.expectedOutcome}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  {isRunning
                    ? `Running (step ${targetMachine.scenarioStep})`
                    : isSelectedScenario
                    ? `Selected (${targetMachine.id})`
                    : `Target: ${targetMachine.id}`}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {isRunning ? (
                    <button
                      type="button"
                      onClick={() => stopScenario(targetMachine.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 transition-colors whitespace-nowrap"
                    >
                      <Pause className="w-3 h-3" />
                      <span>Stop Scenario</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        startScenario(
                          targetMachine.id,
                          scenario.id,
                          targetMachine.sensorFaultMode
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors whitespace-nowrap"
                    >
                      <Play className="w-3 h-3" />
                      <span>Start Scenario</span>
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Live Response Preview for Target Machine */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-start gap-3">
            <Activity className="w-4 h-4 text-blue-600 mt-1 shrink-0" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                {targetMachine.id} — Simulated Response Preview
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {targetMachine.statusSummary}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <StatusLabel
              status={targetMachine.healthStatus}
              sensorHealth={targetMachine.sensorHealth}
            />
            <SensorHealthLabel sensorHealth={targetMachine.sensorHealth} />
            <button
              type="button"
              onClick={() => stepSimulatedSample(targetMachine.id)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <StepForward className="w-3.5 h-3.5" />
              <span>Step Reading</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePage('alerts')}
              className="text-xs font-medium text-blue-700 hover:text-blue-800"
            >
              View Generated Alerts
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-2 text-xs">
          <div>
            <span className="text-slate-500">Vibration RMS</span>
            <div className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
              {hasValidSignal && targetMachine.latestVibrationMmS !== null
                ? `${targetMachine.latestVibrationMmS.toFixed(2)} mm/s`
                : 'No Valid Signal'}
            </div>
          </div>
          <div>
            <span className="text-slate-500">Temperature</span>
            <div className="font-mono text-base font-semibold text-slate-900 tabular-nums mt-0.5">
              {hasValidSignal && targetMachine.latestTemperatureC !== null
                ? `${targetMachine.latestTemperatureC.toFixed(1)} °C`
                : 'No Valid Signal'}
            </div>
          </div>
          <div>
            <span className="text-slate-500">Active Scenario</span>
            <div className="font-mono text-sm font-medium text-slate-800 mt-0.5">
              {targetMachine.activeScenario.replace('_', ' ')}
            </div>
          </div>
          <div>
            <span className="text-slate-500">Scenario Engine</span>
            <div className="font-mono text-sm font-medium text-slate-800 mt-0.5">
              {targetMachine.scenarioRunning ? 'Stepping Live' : 'Idle / Paused'}
            </div>
          </div>
        </div>

        <ConditionCharts machine={targetMachine} height={140} />
      </section>
    </div>
  );
};
