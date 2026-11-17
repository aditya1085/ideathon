import React from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Flame,
  FlaskConical,
  Play,
  RotateCcw,
  TrendingUp,
  Waves,
  WifiOff,
} from 'lucide-react';
import { useSanket } from '../../context/SanketContext';
import { SIMULATION_SCENARIOS } from '../../data/initialData';
import { SimulationScenarioId } from '../../types/sanket';
import { ConditionCharts } from '../charts/ConditionCharts';
import { StatusLabel } from '../common/StatusLabel';

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
    runSimulationScenario,
    resetDemoData,
    lastScenarioNotice,
    setActivePage,
  } = useSanket();

  const targetMachine =
    machines.find((m) => m.id === selectedMachineId) ?? machines[0];

  return (
    <div className="space-y-6">
      {/* Header & Truth Notice */}
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
            Inject synthetic fault and operating scenarios into a simulated machine stream to observe how SANKET+ detects deviations and updates alerts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
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

          <div className="self-end">
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Demo Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {lastScenarioNotice && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-amber-900">
          <span>{lastScenarioNotice}</span>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setActivePage('overview')}
              className="font-semibold text-amber-800 hover:underline"
            >
              View on Overview
            </button>
            <button
              type="button"
              onClick={() => setActivePage('alerts')}
              className="font-semibold text-blue-700 hover:underline"
            >
              Check Alerts
            </button>
          </div>
        </div>
      )}

      {/* Six Scenario Cards */}
      <section aria-label="Simulated Test Scenarios" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {SIMULATION_SCENARIOS.map((scenario) => {
          const Icon = SCENARIO_ICONS[scenario.id];
          const isActive = targetMachine.activeScenario === scenario.id;

          return (
            <article
              key={scenario.id}
              className={`bg-white border rounded-xl p-5 flex flex-col justify-between transition-colors ${
                isActive ? 'border-amber-400' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-800">
                    <Icon className="w-4 h-4 text-amber-600" aria-hidden="true" />
                  </div>
                  <span className="font-mono text-[11px] text-slate-500">
                    {scenario.effectLabel}
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

                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed">
                  <strong className="text-slate-700 font-medium">Expected response: </strong>
                  {scenario.expectedOutcome}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-500">
                  Target: <span className="font-mono text-slate-800">{targetMachine.id}</span>
                </span>
                <button
                  type="button"
                  onClick={() => runSimulationScenario(targetMachine.id, scenario.id)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Play className="w-3 h-3" />
                  <span>{isActive ? 'Re-run Scenario' : 'Run Scenario'}</span>
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* Live Response Preview for Target Machine */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Activity className="w-4 h-4 text-blue-600" aria-hidden="true" />
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                {targetMachine.id} — Simulated Response Preview
              </h2>
              <p className="text-xs text-slate-500">
                {targetMachine.statusSummary}
              </p>
            </div>
          </div>
          <StatusLabel status={targetMachine.healthStatus} />
        </div>

        <ConditionCharts machine={targetMachine} height={135} />
      </section>
    </div>
  );
};
