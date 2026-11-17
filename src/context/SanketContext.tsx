import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  createInitialAlerts,
  createInitialMachines,
  DEFAULT_SETTINGS,
} from '../data/initialData';
import {
  AlertEvent,
  AlertSeverity,
  AlertStatus,
  AppSettings,
  BaselineStatus,
  HealthStatus,
  Machine,
  NavigationPage,
  SensitivityLevel,
  SensorReading,
  SimulationScenarioId,
} from '../types/sanket';

const STORAGE_KEY = 'sanket_plus_state_v1';

interface PersistedState {
  machines: Machine[];
  alerts: AlertEvent[];
  settings: AppSettings;
}

interface SanketContextValue {
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  selectedMachineId: string;
  setSelectedMachineId: (id: string) => void;
  detailMachineId: string | null;
  openMachineDetails: (id: string) => void;
  closeMachineDetails: () => void;
  machines: Machine[];
  alerts: AlertEvent[];
  settings: AppSettings;
  updateSettings: (partial: Partial<AppSettings>) => void;
  summaryCounts: {
    totalMachines: number;
    healthy: number;
    underObservation: number;
    activeAlerts: number;
  };
  isStreaming: boolean;
  setIsStreaming: (streaming: boolean) => void;
  sampleIntervalMs: number;
  setSampleIntervalMs: (ms: number) => void;
  stepSimulatedSample: (targetMachineId?: string) => void;
  runSimulationScenario: (machineId: string, scenario: SimulationScenarioId) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  updateFingerprintStatus: (machineId: string, status: BaselineStatus) => void;
  toggleHealthyConfirmation: (machineId: string, confirmed: boolean) => void;
  startBaselineLearning: (machineId: string) => void;
  resetDemoData: () => void;
  lastScenarioNotice: string | null;
}

const SanketContext = createContext<SanketContextValue | null>(null);

function getSensitivityMultiplier(sensitivity: SensitivityLevel): number {
  if (sensitivity === 'High') return 0.78;
  if (sensitivity === 'Low') return 1.28;
  return 1.0;
}

function evaluateReadingHealth(
  machine: Machine,
  vib: number | null,
  temp: number | null,
  sensitivity: SensitivityLevel
): { status: HealthStatus; summary: string; alertType?: string; severity?: AlertSeverity } {
  if (vib === null || temp === null) {
    return {
      status: 'Disconnected',
      summary: 'Simulated sensor telemetry interrupted. Last packet did not contain valid metrics.',
      alertType: 'Sensor Disconnection',
      severity: 'Warning',
    };
  }

  const mult = getSensitivityMultiplier(sensitivity);
  const vibSpan = Math.max(0.3, machine.fingerprint.vibrationMaxMmS - machine.fingerprint.vibrationMeanMmS);
  const tempSpan = Math.max(2.5, machine.fingerprint.temperatureMaxC - machine.fingerprint.temperatureMeanC);

  const vibObsThreshold = machine.fingerprint.vibrationMaxMmS + vibSpan * 0.15 * mult;
  const vibAlertThreshold = machine.fingerprint.vibrationMaxMmS + vibSpan * 1.15 * mult;

  const tempObsThreshold = machine.fingerprint.temperatureMaxC + tempSpan * 0.25 * mult;
  const tempAlertThreshold = machine.fingerprint.temperatureMaxC + tempSpan * 1.3 * mult;

  const vibCritical = vib >= vibAlertThreshold;
  const tempCritical = temp >= tempAlertThreshold;
  const vibElevated = vib >= vibObsThreshold;
  const tempElevated = temp >= tempObsThreshold;

  if (vibCritical && tempCritical) {
    return {
      status: 'Alert',
      summary: `Combined mechanical and thermal anomaly: vibration (${vib.toFixed(2)} mm/s) and temperature (${temp.toFixed(1)} °C) exceed baseline limits.`,
      alertType: 'Combined Anomaly',
      severity: 'Critical',
    };
  }
  if (vibCritical) {
    return {
      status: 'Alert',
      summary: `Sustained vibration escalation (${vib.toFixed(2)} mm/s) exceeds machine fingerprint threshold (${vibAlertThreshold.toFixed(2)} mm/s).`,
      alertType: 'High Vibration Drift',
      severity: 'Critical',
    };
  }
  if (tempCritical) {
    return {
      status: 'Alert',
      summary: `Thermal threshold exceeded at ${temp.toFixed(1)} °C against baseline upper bound of ${machine.fingerprint.temperatureMaxC.toFixed(1)} °C.`,
      alertType: 'Overheating Alert',
      severity: 'Critical',
    };
  }
  if (vibElevated || tempElevated) {
    const reasons: string[] = [];
    if (vibElevated) reasons.push(`vibration at ${vib.toFixed(2)} mm/s`);
    if (tempElevated) reasons.push(`temperature at ${temp.toFixed(1)} °C`);
    return {
      status: 'Under Observation',
      summary: `Early deviation detected (${reasons.join(' and ')}) outside nominal fingerprint range.`,
    };
  }

  return {
    status: 'Healthy',
    summary: 'Operating cleanly inside learned vibration and temperature fingerprint limits.',
  };
}

function loadPersistedState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        machines: createInitialMachines(),
        alerts: createInitialAlerts(),
        settings: DEFAULT_SETTINGS,
      };
    }
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    if (!Array.isArray(parsed.machines) || parsed.machines.length === 0) {
      throw new Error('Invalid persisted machines');
    }
    return {
      machines: parsed.machines,
      alerts: Array.isArray(parsed.alerts) ? parsed.alerts : createInitialAlerts(),
      settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    };
  } catch {
    return {
      machines: createInitialMachines(),
      alerts: createInitialAlerts(),
      settings: DEFAULT_SETTINGS,
    };
  }
}

export const SanketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = useMemo(() => loadPersistedState(), []);

  const [machines, setMachines] = useState<Machine[]>(initial.machines);
  const [alerts, setAlerts] = useState<AlertEvent[]>(initial.alerts);
  const [settings, setSettings] = useState<AppSettings>(initial.settings);

  const [activePage, setActivePageState] = useState<NavigationPage>('overview');
  const [selectedMachineId, setSelectedMachineId] = useState<string>(initial.machines[0]?.id ?? 'PUMP-001');
  const [detailMachineId, setDetailMachineId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [sampleIntervalMs, setSampleIntervalMs] = useState<number>(2000);
  const [lastScenarioNotice, setLastScenarioNotice] = useState<string | null>(null);

  const scenarioStepRef = useRef<Record<string, number>>({});

  useEffect(() => {
    try {
      const payload: PersistedState = { machines, alerts, settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors in restricted environments
    }
  }, [machines, alerts, settings]);

  const setActivePage = useCallback((page: NavigationPage) => {
    setActivePageState(page);
    if (page !== 'machines') {
      setDetailMachineId(null);
    }
  }, []);

  const openMachineDetails = useCallback((id: string) => {
    setSelectedMachineId(id);
    setDetailMachineId(id);
    setActivePageState('machines');
  }, []);

  const closeMachineDetails = useCallback(() => {
    setDetailMachineId(null);
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const createAlertIfNeeded = useCallback(
    (
      machine: Machine,
      alertType: string,
      severity: AlertSeverity,
      reason: string
    ) => {
      setAlerts((prev) => {
        const hasRecentActiveSameType = prev.some(
          (a) =>
            a.machineId === machine.id &&
            a.status === 'Active' &&
            a.alertType === alertType
        );
        if (hasRecentActiveSameType) return prev;
        const nextAlert: AlertEvent = {
          id: `ALT-${Math.floor(1050 + Math.random() * 8900)}`,
          timestamp: new Date().toISOString(),
          machineId: machine.id,
          machineName: machine.name,
          alertType,
          severity,
          reason,
          status: 'Active',
          isSimulated: true,
        };
        return [nextAlert, ...prev];
      });
    },
    []
  );

  const stepSimulatedSample = useCallback(
    (targetMachineId?: string) => {
      const nowIso = new Date().toISOString();

      setMachines((prevMachines) =>
        prevMachines.map((machine) => {
          if (targetMachineId && machine.id !== targetMachineId) {
            return machine;
          }

          const step = (scenarioStepRef.current[machine.id] ?? 0) + 1;
          scenarioStepRef.current[machine.id] = step;

          let nextVib: number | null = machine.latestVibrationMmS ?? machine.fingerprint.vibrationMeanMmS;
          let nextTemp: number | null = machine.latestTemperatureC ?? machine.fingerprint.temperatureMeanC;

          if (machine.activeScenario === 'sensor_disconnection') {
            nextVib = null;
            nextTemp = null;
          } else if (machine.activeScenario === 'gradual_vibration') {
            const base = machine.fingerprint.vibrationMeanMmS;
            const drift = Math.min(2.8, step * 0.22);
            nextVib = Number((base + drift + (Math.random() - 0.45) * 0.14).toFixed(2));
            nextTemp = Number(
              (machine.fingerprint.temperatureMeanC + Math.min(4.2, step * 0.3) + (Math.random() - 0.5) * 0.4).toFixed(1)
            );
          } else if (machine.activeScenario === 'overheating') {
            nextVib = Number(
              (machine.fingerprint.vibrationMeanMmS + 0.25 + (Math.random() - 0.5) * 0.16).toFixed(2)
            );
            nextTemp = Number(
              (machine.fingerprint.temperatureMeanC + Math.min(22, step * 1.4) + (Math.random() - 0.5) * 0.5).toFixed(1)
            );
          } else if (machine.activeScenario === 'combined_anomaly') {
            nextVib = Number(
              (machine.fingerprint.vibrationMaxMmS + Math.min(2.6, 0.8 + step * 0.24) + (Math.random() - 0.5) * 0.18).toFixed(2)
            );
            nextTemp = Number(
              (machine.fingerprint.temperatureMaxC + Math.min(20, 6.5 + step * 1.1) + (Math.random() - 0.5) * 0.5).toFixed(1)
            );
          } else if (machine.activeScenario === 'temporary_fluctuation') {
            const pulse = step <= 4 ? Math.sin((step / 4) * Math.PI) * 1.25 : 0;
            nextVib = Number((machine.fingerprint.vibrationMeanMmS + pulse + (Math.random() - 0.5) * 0.15).toFixed(2));
            nextTemp = Number((machine.fingerprint.temperatureMeanC + pulse * 2.2 + (Math.random() - 0.5) * 0.4).toFixed(1));
          } else {
            // Healthy or initial MOTOR-001 mild observation state
            const keepElevatedMotor = machine.id === 'MOTOR-001' && machine.healthStatus === 'Under Observation';
            const targetVib = keepElevatedMotor
              ? machine.fingerprint.vibrationMaxMmS + 0.28
              : machine.fingerprint.vibrationMeanMmS;
            const targetTemp = keepElevatedMotor
              ? machine.fingerprint.temperatureMaxC + 2.2
              : machine.fingerprint.temperatureMeanC;
            nextVib = Number((targetVib + (Math.random() - 0.5) * 0.22).toFixed(2));
            nextTemp = Number((targetTemp + (Math.random() - 0.5) * 0.7).toFixed(1));
          }

          const nextAccel = nextVib !== null ? Number((nextVib * 0.14 + 0.08).toFixed(2)) : null;

          const newReading: SensorReading = {
            timestamp: nowIso,
            vibrationMmS: nextVib,
            temperatureC: nextTemp,
            peakAccelG: nextAccel,
            isSimulated: true,
          };

          const evaluation = evaluateReadingHealth(
            machine,
            nextVib,
            nextTemp,
            settings.sensitivity
          );

          if (evaluation.alertType && evaluation.severity) {
            createAlertIfNeeded(machine, evaluation.alertType, evaluation.severity, evaluation.summary);
          }

          let updatedFingerprint = machine.fingerprint;
          if (machine.fingerprint.status === 'Learning') {
            const nextSamples = Math.min(
              machine.fingerprint.samplesRequired,
              machine.fingerprint.samplesCollected + 24
            );
            const nextProgress = Math.round(
              (nextSamples / machine.fingerprint.samplesRequired) * 100
            );
            updatedFingerprint = {
              ...machine.fingerprint,
              samplesCollected: nextSamples,
              learningProgress: nextProgress,
              status: nextProgress >= 100 ? 'Ready' : 'Learning',
              lastUpdated: nowIso,
            };
          }

          return {
            ...machine,
            healthStatus: evaluation.status,
            statusSummary: evaluation.summary,
            latestVibrationMmS: nextVib,
            latestTemperatureC: nextTemp,
            latestPeakAccelG: nextAccel,
            lastUpdated: nowIso,
            fingerprint: updatedFingerprint,
            readings: [...machine.readings.slice(-29), newReading],
          };
        })
      );
    },
    [createAlertIfNeeded, settings.sensitivity]
  );

  useEffect(() => {
    if (!isStreaming) return;
    const timer = window.setInterval(() => {
      stepSimulatedSample();
    }, sampleIntervalMs);
    return () => window.clearInterval(timer);
  }, [isStreaming, sampleIntervalMs, stepSimulatedSample]);

  const runSimulationScenario = useCallback(
    (machineId: string, scenario: SimulationScenarioId) => {
      scenarioStepRef.current[machineId] = 0;
      const now = Date.now();

      setMachines((prevMachines) =>
        prevMachines.map((machine) => {
          if (machine.id !== machineId) return machine;

          const syntheticBatch: SensorReading[] = [];
          const points = 8;

          for (let i = 0; i < points; i++) {
            const ts = new Date(now - (points - 1 - i) * 15_000).toISOString();
            const frac = i / (points - 1);
            let vib: number | null = machine.fingerprint.vibrationMeanMmS;
            let temp: number | null = machine.fingerprint.temperatureMeanC;

            if (scenario === 'healthy') {
              vib = Number(
                (machine.fingerprint.vibrationMeanMmS + Math.sin(i) * 0.08).toFixed(2)
              );
              temp = Number(
                (machine.fingerprint.temperatureMeanC + Math.cos(i) * 0.35).toFixed(1)
              );
            } else if (scenario === 'gradual_vibration') {
              vib = Number(
                (machine.fingerprint.vibrationMeanMmS + frac * 2.15).toFixed(2)
              );
              temp = Number(
                (machine.fingerprint.temperatureMeanC + frac * 3.8).toFixed(1)
              );
            } else if (scenario === 'overheating') {
              vib = Number(
                (machine.fingerprint.vibrationMeanMmS + frac * 0.32).toFixed(2)
              );
              temp = Number(
                (machine.fingerprint.temperatureMeanC + frac * 17.5).toFixed(1)
              );
            } else if (scenario === 'combined_anomaly') {
              vib = Number(
                (machine.fingerprint.vibrationMeanMmS + 0.6 + frac * 2.4).toFixed(2)
              );
              temp = Number(
                (machine.fingerprint.temperatureMeanC + 4.0 + frac * 15.5).toFixed(1)
              );
            } else if (scenario === 'temporary_fluctuation') {
              const bell = Math.exp(-Math.pow((frac - 0.55) * 3.2, 2));
              vib = Number(
                (machine.fingerprint.vibrationMeanMmS + bell * (machine.fingerprint.vibrationMaxMmS - machine.fingerprint.vibrationMeanMmS + 0.45)).toFixed(2)
              );
              temp = Number(
                (machine.fingerprint.temperatureMeanC + bell * 4.5).toFixed(1)
              );
            } else if (scenario === 'sensor_disconnection') {
              if (i >= points - 2) {
                vib = null;
                temp = null;
              } else {
                vib = Number(
                  (machine.fingerprint.vibrationMeanMmS + Math.sin(i) * 0.1).toFixed(2)
                );
                temp = Number(
                  (machine.fingerprint.temperatureMeanC + Math.cos(i) * 0.4).toFixed(1)
                );
              }
            }

            syntheticBatch.push({
              timestamp: ts,
              vibrationMmS: vib,
              temperatureC: temp,
              peakAccelG: vib !== null ? Number((vib * 0.14 + 0.08).toFixed(2)) : null,
              isSimulated: true,
            });
          }

          const finalReading = syntheticBatch[syntheticBatch.length - 1];
          const evaluation =
            scenario === 'temporary_fluctuation'
              ? {
                  status: 'Under Observation' as HealthStatus,
                  summary:
                    'Short-lived transient fluctuation exceeded normal envelope briefly before stabilizing.',
                  alertType: 'Temporary Fluctuation',
                  severity: 'Info' as AlertSeverity,
                }
              : scenario === 'healthy'
              ? {
                  status: 'Healthy' as HealthStatus,
                  summary:
                    'Simulated telemetry restored to nominal operating envelope within learned fingerprint.',
                }
              : evaluateReadingHealth(
                  machine,
                  finalReading.vibrationMmS,
                  finalReading.temperatureC,
                  settings.sensitivity
                );

          if (scenario === 'healthy') {
            setAlerts((prevAlerts) =>
              prevAlerts.map((a) =>
                a.machineId === machine.id && a.status === 'Active'
                  ? { ...a, status: 'Resolved' }
                  : a
              )
            );
          } else if (evaluation.alertType && evaluation.severity) {
            const newAlert: AlertEvent = {
              id: `ALT-${Math.floor(1050 + Math.random() * 8900)}`,
              timestamp: finalReading.timestamp,
              machineId: machine.id,
              machineName: machine.name,
              alertType: evaluation.alertType,
              severity: evaluation.severity,
              reason: evaluation.summary,
              status: scenario === 'temporary_fluctuation' ? 'Acknowledged' : 'Active',
              isSimulated: true,
            };
            setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
          }

          return {
            ...machine,
            activeScenario: scenario,
            healthStatus: evaluation.status,
            statusSummary: evaluation.summary,
            latestVibrationMmS: finalReading.vibrationMmS,
            latestTemperatureC: finalReading.temperatureC,
            latestPeakAccelG: finalReading.peakAccelG,
            lastUpdated: finalReading.timestamp,
            readings: [...machine.readings.slice(-(30 - syntheticBatch.length)), ...syntheticBatch],
          };
        })
      );

      const labelMap: Record<SimulationScenarioId, string> = {
        healthy: 'Healthy operation',
        gradual_vibration: 'Gradual vibration increase',
        overheating: 'Overheating',
        combined_anomaly: 'Combined anomaly',
        temporary_fluctuation: 'Temporary fluctuation',
        sensor_disconnection: 'Sensor disconnection',
      };
      setLastScenarioNotice(`Applied simulated scenario "${labelMap[scenario]}" to ${machineId}.`);
    },
    [settings.sensitivity]
  );

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId && a.status === 'Active'
          ? { ...a, status: 'Acknowledged' as AlertStatus }
          : a
      )
    );
  }, []);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'Resolved' as AlertStatus } : a))
    );
  }, []);

  const updateFingerprintStatus = useCallback((machineId: string, status: BaselineStatus) => {
    const nowIso = new Date().toISOString();
    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? {
              ...m,
              fingerprint: {
                ...m.fingerprint,
                status,
                learningProgress:
                  status === 'Ready'
                    ? 100
                    : status === 'Not Established'
                    ? 0
                    : status === 'Learning'
                    ? 45
                    : m.fingerprint.learningProgress,
                samplesCollected:
                  status === 'Ready'
                    ? m.fingerprint.samplesRequired
                    : status === 'Not Established'
                    ? 0
                    : status === 'Learning'
                    ? Math.round(m.fingerprint.samplesRequired * 0.45)
                    : m.fingerprint.samplesCollected,
                lastUpdated: nowIso,
              },
            }
          : m
      )
    );
  }, []);

  const toggleHealthyConfirmation = useCallback(
    (machineId: string, confirmed: boolean) => {
      const nowIso = new Date().toISOString();
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId
            ? {
                ...m,
                fingerprint: {
                  ...m.fingerprint,
                  healthyConfirmed: confirmed,
                  confirmedBy: confirmed ? settings.operatorName : 'Pending confirmation',
                  status: confirmed ? 'Ready' : 'Requires Verification',
                  lastUpdated: nowIso,
                },
              }
            : m
        )
      );
    },
    [settings.operatorName]
  );

  const startBaselineLearning = useCallback((machineId: string) => {
    const nowIso = new Date().toISOString();
    setMachines((prev) =>
      prev.map((m) =>
        m.id === machineId
          ? {
              ...m,
              fingerprint: {
                ...m.fingerprint,
                status: 'Learning',
                learningProgress: 20,
                samplesCollected: Math.round(m.fingerprint.samplesRequired * 0.2),
                lastUpdated: nowIso,
              },
            }
          : m
      )
    );
  }, []);

  const resetDemoData = useCallback(() => {
    scenarioStepRef.current = {};
    setIsStreaming(false);
    setMachines(createInitialMachines());
    setAlerts(createInitialAlerts());
    setSettings(DEFAULT_SETTINGS);
    setLastScenarioNotice('Demo simulation data restored to initial defaults.');
  }, []);

  const summaryCounts = useMemo(() => {
    const totalMachines = machines.length;
    const healthy = machines.filter((m) => m.healthStatus === 'Healthy').length;
    const underObservation = machines.filter(
      (m) => m.healthStatus === 'Under Observation'
    ).length;
    const activeAlerts = alerts.filter((a) => a.status === 'Active').length;
    return { totalMachines, healthy, underObservation, activeAlerts };
  }, [machines, alerts]);

  const value: SanketContextValue = {
    activePage,
    setActivePage,
    selectedMachineId,
    setSelectedMachineId,
    detailMachineId,
    openMachineDetails,
    closeMachineDetails,
    machines,
    alerts,
    settings,
    updateSettings,
    summaryCounts,
    isStreaming,
    setIsStreaming,
    sampleIntervalMs,
    setSampleIntervalMs,
    stepSimulatedSample,
    runSimulationScenario,
    acknowledgeAlert,
    resolveAlert,
    updateFingerprintStatus,
    toggleHealthyConfirmation,
    startBaselineLearning,
    resetDemoData,
    lastScenarioNotice,
  };

  return <SanketContext.Provider value={value}>{children}</SanketContext.Provider>;
};

export function useSanket(): SanketContextValue {
  const ctx = useContext(SanketContext);
  if (!ctx) {
    throw new Error('useSanket must be used within a SanketProvider');
  }
  return ctx;
}
