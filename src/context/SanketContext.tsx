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
  HealthStatus,
  Machine,
  NavigationPage,
  SensitivityLevel,
  SensorFaultMode,
  SensorHealth,
  SensorReading,
  SimulationScenarioId,
} from '../types/sanket';

const STORAGE_KEY = 'sanket_plus_state_v2';

interface PersistedState {
  machines: Machine[];
  alerts: AlertEvent[];
  settings: AppSettings;
}

export interface SensitivityRules {
  warningMarginFactor: number;
  criticalMarginFactor: number;
  warningPersistence: number;
  criticalPersistence: number;
}

export function getSensitivityRules(level: SensitivityLevel): SensitivityRules {
  if (level === 'High') {
    return {
      warningMarginFactor: 0.08,
      criticalMarginFactor: 0.45,
      warningPersistence: 2,
      criticalPersistence: 3,
    };
  }
  if (level === 'Low') {
    return {
      warningMarginFactor: 0.25,
      criticalMarginFactor: 0.85,
      warningPersistence: 3,
      criticalPersistence: 5,
    };
  }
  return {
    warningMarginFactor: 0.15,
    criticalMarginFactor: 0.65,
    warningPersistence: 2,
    criticalPersistence: 4,
  };
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
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  sampleIntervalMs: number;
  setSampleIntervalMs: (ms: number) => void;
  stepSimulatedSample: (targetMachineId?: string) => void;
  startScenario: (
    machineId: string,
    scenario: SimulationScenarioId,
    faultMode?: SensorFaultMode
  ) => void;
  stopScenario: (machineId: string) => void;
  resetMachineScenario: (machineId: string) => void;
  setMachineFaultMode: (machineId: string, mode: SensorFaultMode) => void;
  acknowledgeAlert: (alertId: string) => void;
  resolveAlert: (alertId: string) => void;
  confirmMachineHealthy: (machineId: string) => { ok: boolean; message: string };
  startBaselineLearning: (machineId: string) => { ok: boolean; message: string };
  captureLearningSample: (machineId: string) => void;
  completeBaseline: (machineId: string) => { ok: boolean; message: string };
  resetBaseline: (machineId: string) => void;
  resetDemoData: () => void;
  actionFeedback: { type: 'info' | 'success' | 'warning'; text: string } | null;
  clearActionFeedback: () => void;
}

const SanketContext = createContext<SanketContextValue | null>(null);

function computeSensorIntegrity(
  vib: number | null,
  temp: number | null,
  recentReadings: SensorReading[]
): { sensorHealth: SensorHealth; detail: string | null } {
  if (vib === null || temp === null) {
    return {
      sensorHealth: 'SENSOR ISSUE',
      detail: 'Missing sensor reading (null packet — missing data is never treated as zero).',
    };
  }
  if (
    Number.isNaN(vib) ||
    Number.isNaN(temp) ||
    vib < 0 ||
    vib > 45 ||
    temp < -20 ||
    temp > 180
  ) {
    return {
      sensorHealth: 'SENSOR ISSUE',
      detail: `Invalid out-of-range telemetry received (vib: ${vib}, temp: ${temp}).`,
    };
  }
  // Check frozen sensor: 3 consecutive identical readings (previous 2 + current)
  if (recentReadings.length >= 2) {
    const r1 = recentReadings[recentReadings.length - 1];
    const r2 = recentReadings[recentReadings.length - 2];
    if (
      r1.vibrationMmS !== null &&
      r2.vibrationMmS !== null &&
      r1.temperatureC !== null &&
      r2.temperatureC !== null &&
      Math.abs(r1.vibrationMmS - vib) < 0.001 &&
      Math.abs(r2.vibrationMmS - vib) < 0.001 &&
      Math.abs(r1.temperatureC - temp) < 0.01 &&
      Math.abs(r2.temperatureC - temp) < 0.01
    ) {
      return {
        sensorHealth: 'SENSOR ISSUE',
        detail: 'Frozen sensor feed detected (identical values repeated across 3 consecutive samples).',
      };
    }
  }
  return { sensorHealth: 'Connected', detail: null };
}

interface EvaluationResult {
  condition: HealthStatus;
  sensorHealth: SensorHealth;
  sensorIssueDetail: string | null;
  summary: string;
  alertPayload?: {
    alertType: string;
    severity: AlertSeverity;
    triggeringParameter: string;
    baselineComparison: string;
    whatChanged: string;
    persistenceSummary: string;
    suggestedInspection: string;
  };
}

function evaluateAnomalyRules(
  machine: Machine,
  vib: number | null,
  temp: number | null,
  historyIncludingPrev: SensorReading[],
  settings: AppSettings
): EvaluationResult {
  const integrity = computeSensorIntegrity(vib, temp, historyIncludingPrev);

  if (integrity.sensorHealth === 'SENSOR ISSUE' || vib === null || temp === null) {
    return {
      condition: machine.healthStatus === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      sensorHealth: 'SENSOR ISSUE',
      sensorIssueDetail: integrity.detail,
      summary: `${integrity.detail ?? 'Telemetry integrity lost.'} Machine condition cannot be verified as NORMAL until sensor connectivity is restored.`,
      alertPayload: {
        alertType: 'Sensor Integrity Issue',
        severity: 'Warning',
        triggeringParameter: 'Sensor Signal Integrity',
        baselineComparison: 'Expected valid numeric stream; received missing, frozen, or invalid packet.',
        whatChanged: integrity.detail ?? 'Sensor feed stopped delivering valid changing telemetry.',
        persistenceSummary: 'Immediate signal-integrity flag.',
        suggestedInspection:
          'Suggested inspection: Check simulated telemetry feed, cable termination, or gateway packet status before relying on condition readings.',
      },
    };
  }

  const fp = machine.fingerprint;
  const rules = getSensitivityRules(settings.sensitivity);

  const vibBand = Math.max(0.4, fp.vibrationMaxMmS - fp.vibrationMinMmS);
  const tempBand = Math.max(3.0, fp.temperatureMaxC - fp.temperatureMinC);

  const vibWarnThreshold = fp.vibrationMaxMmS + vibBand * rules.warningMarginFactor;
  const vibCritThreshold = fp.vibrationMaxMmS + vibBand * rules.criticalMarginFactor;

  const tempWarnThreshold = fp.temperatureMaxC + tempBand * rules.warningMarginFactor;
  const tempCritThreshold = fp.temperatureMaxC + tempBand * rules.criticalMarginFactor;

  const isVibWarn = vib >= vibWarnThreshold;
  const isVibCrit = vib >= vibCritThreshold;
  const isTempWarn = temp >= tempWarnThreshold;
  const isTempCrit = temp >= tempCritThreshold;

  const isAnyWarn = isVibWarn || isTempWarn;
  const isAnyCrit = isVibCrit || isTempCrit;
  const isCombinedWarn = isVibWarn && isTempWarn;

  // Count consecutive historical readings exceeding warning / critical thresholds
  let consecutiveWarn = isAnyWarn ? 1 : 0;
  if (isAnyWarn) {
    for (let i = historyIncludingPrev.length - 1; i >= 0; i--) {
      const r = historyIncludingPrev[i];
      if (r.vibrationMmS === null || r.temperatureC === null) break;
      const rWarn =
        r.vibrationMmS >= vibWarnThreshold || r.temperatureC >= tempWarnThreshold;
      if (rWarn) consecutiveWarn++;
      else break;
    }
  }

  let consecutiveCrit = isAnyCrit ? 1 : 0;
  if (isAnyCrit) {
    for (let i = historyIncludingPrev.length - 1; i >= 0; i--) {
      const r = historyIncludingPrev[i];
      if (r.vibrationMmS === null || r.temperatureC === null) break;
      const rCrit =
        r.vibrationMmS >= vibCritThreshold || r.temperatureC >= tempCritThreshold;
      if (rCrit) consecutiveCrit++;
      else break;
    }
  }

  let consecutiveCombined = isCombinedWarn ? 1 : 0;
  if (isCombinedWarn) {
    for (let i = historyIncludingPrev.length - 1; i >= 0; i--) {
      const r = historyIncludingPrev[i];
      if (r.vibrationMmS === null || r.temperatureC === null) break;
      if (
        r.vibrationMmS >= vibWarnThreshold &&
        r.temperatureC >= tempWarnThreshold
      ) {
        consecutiveCombined++;
      } else {
        break;
      }
    }
  }

  const vibPctAboveMean = Math.round(
    ((vib - fp.vibrationMeanMmS) / Math.max(0.1, fp.vibrationMeanMmS)) * 100
  );
  const tempDeltaMean = (temp - fp.temperatureMeanC).toFixed(1);

  const baselineNote =
    fp.status === 'Ready for Monitoring'
      ? ''
      : ' (evaluating against demonstration reference while baseline verification is pending)';

  // 1. CRITICAL via sustained high deviation or correlated vib+temp deviation
  const correlatedTrigger =
    settings.correlateVibAndTemp &&
    consecutiveCombined >= Math.max(2, rules.warningPersistence);
  const sustainedCritTrigger =
    settings.warningEscalation && consecutiveCrit >= rules.criticalPersistence;

  if (correlatedTrigger || sustainedCritTrigger) {
    const paramLabel =
      isVibWarn && isTempWarn
        ? 'Vibration RMS (mm/s) & Temperature (°C)'
        : isVibCrit
        ? 'Vibration RMS (mm/s)'
        : 'Operating Temperature (°C)';

    const comparison = [
      isVibWarn
        ? `Vibration ${vib.toFixed(2)} mm/s vs baseline mean ${fp.vibrationMeanMmS.toFixed(2)} mm/s (+${vibPctAboveMean}%, ceiling ${fp.vibrationMaxMmS.toFixed(2)} mm/s)`
        : null,
      isTempWarn
        ? `Temperature ${temp.toFixed(1)} °C vs baseline mean ${fp.temperatureMeanC.toFixed(1)} °C (+${tempDeltaMean} °C, ceiling ${fp.temperatureMaxC.toFixed(1)} °C)`
        : null,
    ]
      .filter(Boolean)
      .join('; ');

    const inspectionText =
      isVibWarn && isTempWarn
        ? 'Suggested inspection: Schedule prompt physical inspection of bearings, shaft alignment, lubrication condition, and cooling airflow.'
        : isVibCrit
        ? 'Suggested inspection: Inspect mounting fasteners, coupling balance, rotor alignment, and bearing housing for signs of mechanical looseness or wear.'
        : 'Suggested inspection: Inspect cooling vents, ambient heat dissipation, load current, and lubrication temperature.';

    return {
      condition: 'CRITICAL',
      sensorHealth: 'Connected',
      sensorIssueDetail: null,
      summary: `${
        correlatedTrigger
          ? 'Correlated vibration and temperature deviations'
          : 'Sustained high deviation'
      } exceeded critical rule thresholds${baselineNote}.`,
      alertPayload: {
        alertType: correlatedTrigger
          ? 'Combined Anomaly (Correlated)'
          : isVibCrit
          ? 'Sustained Vibration Escalation'
          : 'Sustained Overheating',
        severity: 'Critical',
        triggeringParameter: paramLabel,
        baselineComparison: comparison,
        whatChanged: correlatedTrigger
          ? 'Both vibration and temperature rose concurrently beyond normal baseline boundaries.'
          : isVibCrit
          ? `Vibration RMS climbed to ${vib.toFixed(2)} mm/s and stayed elevated.`
          : `Operating temperature climbed to ${temp.toFixed(1)} °C and remained above safe envelope.`,
        persistenceSummary: correlatedTrigger
          ? `Persistent across ${consecutiveCombined} consecutive readings with vib-temp correlation.`
          : `Persistent across ${consecutiveCrit} consecutive readings (threshold: ${rules.criticalPersistence}).`,
        suggestedInspection: inspectionText,
      },
    };
  }

  // 2. WARNING via persistent mild/moderate deviation
  if (consecutiveWarn >= rules.warningPersistence) {
    const paramLabel =
      isVibWarn && isTempWarn
        ? 'Vibration RMS (mm/s) & Temperature (°C)'
        : isVibWarn
        ? 'Vibration RMS (mm/s)'
        : 'Operating Temperature (°C)';

    const comparison = [
      isVibWarn
        ? `Vibration ${vib.toFixed(2)} mm/s vs baseline ceiling ${fp.vibrationMaxMmS.toFixed(2)} mm/s (+${vibPctAboveMean}% above mean)`
        : null,
      isTempWarn
        ? `Temperature ${temp.toFixed(1)} °C vs baseline ceiling ${fp.temperatureMaxC.toFixed(1)} °C (+${tempDeltaMean} °C above mean)`
        : null,
    ]
      .filter(Boolean)
      .join('; ');

    return {
      condition: 'WARNING',
      sensorHealth: 'Connected',
      sensorIssueDetail: null,
      summary: `Persistent deviation detected across ${consecutiveWarn} readings${baselineNote}.`,
      alertPayload: {
        alertType: isVibWarn ? 'Vibration Drift Warning' : 'Thermal Drift Warning',
        severity: 'Warning',
        triggeringParameter: paramLabel,
        baselineComparison: comparison,
        whatChanged: isVibWarn
          ? `Simulated vibration rose to ${vib.toFixed(2)} mm/s above the baseline ceiling.`
          : `Simulated temperature rose to ${temp.toFixed(1)} °C above the baseline ceiling.`,
        persistenceSummary: `Persistent across ${consecutiveWarn} consecutive readings (sensitivity: ${settings.sensitivity}).`,
        suggestedInspection: isVibWarn
          ? 'Suggested inspection: Monitor vibration trend and check fasteners, belt tension, or load balance during next inspection window.'
          : 'Suggested inspection: Check cooling fan clearance, airflow obstruction, and operating load.',
      },
    };
  }

  // 3. Single transient spike — do NOT escalate to CRITICAL or WARNING yet
  if (isAnyWarn && consecutiveWarn === 1) {
    return {
      condition: 'NORMAL',
      sensorHealth: 'Connected',
      sensorIssueDetail: null,
      summary: `Single transient reading (${vib.toFixed(2)} mm/s · ${temp.toFixed(1)} °C) outside baseline; waiting for persistence confirmation before escalating.`,
      alertPayload: {
        alertType: 'Transient Spike Observed',
        severity: 'Info',
        triggeringParameter: isVibWarn ? 'Vibration RMS (mm/s)' : 'Operating Temperature (°C)',
        baselineComparison: `Single sample ${vib.toFixed(2)} mm/s · ${temp.toFixed(1)} °C vs baseline ${fp.vibrationMaxMmS.toFixed(2)} mm/s · ${fp.temperatureMaxC.toFixed(1)} °C.`,
        whatChanged: 'One isolated reading exceeded the baseline ceiling.',
        persistenceSummary: `Non-persistent (1 of ${rules.warningPersistence} required readings). Held at NORMAL pending confirmation.`,
        suggestedInspection:
          'Suggested inspection: No immediate action required unless subsequent samples remain elevated.',
      },
    };
  }

  return {
    condition: 'NORMAL',
    sensorHealth: 'Connected',
    sensorIssueDetail: null,
    summary: `Operating within learned baseline envelope (${fp.vibrationMinMmS.toFixed(2)}–${fp.vibrationMaxMmS.toFixed(2)} mm/s, ${fp.temperatureMinC.toFixed(1)}–${fp.temperatureMaxC.toFixed(1)} °C)${baselineNote}.`,
  };
}

function generateNextScenarioValues(
  machine: Machine,
  nextStep: number
): { vib: number | null; temp: number | null; note?: string } {
  const fp = machine.fingerprint;
  const meanVib = fp.vibrationMeanMmS;
  const meanTemp = fp.temperatureMeanC;
  const vibSpan = Math.max(0.4, fp.vibrationMaxMmS - fp.vibrationMinMmS);
  const tempSpan = Math.max(3.0, fp.temperatureMaxC - fp.temperatureMinC);

  switch (machine.activeScenario) {
    case 'healthy': {
      const vib = Number(
        (meanVib + Math.sin(nextStep * 0.8) * (vibSpan * 0.18) + (Math.random() - 0.5) * 0.08).toFixed(2)
      );
      const temp = Number(
        (meanTemp + Math.cos(nextStep * 0.5) * (tempSpan * 0.15) + (Math.random() - 0.5) * 0.3).toFixed(1)
      );
      return { vib, temp };
    }

    case 'gradual_vibration': {
      // Step 1 starts inside NORMAL, steps 2-3 enter WARNING, steps 6+ reach CRITICAL
      const ramp = Math.min(2.4, (nextStep - 1) * 0.3);
      const vib = Number(
        (fp.vibrationMeanMmS + 0.14 + ramp + (Math.random() - 0.5) * 0.04).toFixed(2)
      );
      const temp = Number((meanTemp + Math.min(3.2, nextStep * 0.3)).toFixed(1));
      return { vib, temp };
    }

    case 'overheating': {
      const ramp = Math.min(18.0, nextStep * 1.9);
      const vib = Number((meanVib + 0.18 + (Math.random() - 0.5) * 0.08).toFixed(2));
      const temp = Number((fp.temperatureMaxC - 0.8 + ramp + (Math.random() - 0.5) * 0.3).toFixed(1));
      return { vib, temp };
    }

    case 'combined_anomaly': {
      const vibRamp = Math.min(2.4, 0.35 + nextStep * 0.32);
      const tempRamp = Math.min(16.0, 2.2 + nextStep * 2.0);
      const vib = Number((fp.vibrationMaxMmS + vibRamp + (Math.random() - 0.5) * 0.08).toFixed(2));
      const temp = Number((fp.temperatureMaxC + tempRamp + (Math.random() - 0.5) * 0.3).toFixed(1));
      return { vib, temp };
    }

    case 'temporary_fluctuation': {
      // Single brief spike at step 2 (then returns immediately to nominal at step 3+)
      if (nextStep === 2) {
        return {
          vib: Number((fp.vibrationMaxMmS + vibSpan * 0.75).toFixed(2)),
          temp: Number((meanTemp + 1.8).toFixed(1)),
          note: 'Simulated single transient spike',
        };
      }
      return {
        vib: Number((meanVib + Math.sin(nextStep) * 0.08).toFixed(2)),
        temp: Number((meanTemp + Math.cos(nextStep) * 0.3).toFixed(1)),
      };
    }

    case 'sensor_disconnection': {
      if (machine.sensorFaultMode === 'missing') {
        return { vib: null, temp: null, note: 'Missing packet simulated' };
      }
      if (machine.sensorFaultMode === 'invalid') {
        return { vib: -9.99, temp: 999.9, note: 'Invalid out-of-range value simulated' };
      }
      // Frozen mode: repeat exact constant value
      const frozenVib = machine.latestVibrationMmS ?? meanVib;
      const frozenTemp = machine.latestTemperatureC ?? meanTemp;
      return { vib: frozenVib, temp: frozenTemp, note: 'Frozen constant sample simulated' };
    }
  }
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
    // Always restore scenarioRunning=false on page reload to avoid surprise background timers
    const sanitizedMachines = parsed.machines.map((m) => ({
      ...m,
      scenarioRunning: false,
    }));
    return {
      machines: sanitizedMachines,
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
  const [selectedMachineId, setSelectedMachineId] = useState<string>(
    initial.machines[0]?.id ?? 'PUMP-001'
  );
  const [detailMachineId, setDetailMachineId] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState<boolean>(false);
  const [sampleIntervalMs, setSampleIntervalMs] = useState<number>(1800);
  const [actionFeedback, setActionFeedback] = useState<{
    type: 'info' | 'success' | 'warning';
    text: string;
  } | null>(null);

  const pendingScenarioTimeoutRef = useRef<number | null>(null);

  const clearPendingScenarioTimeout = useCallback(() => {
    if (pendingScenarioTimeoutRef.current !== null) {
      window.clearTimeout(pendingScenarioTimeoutRef.current);
      pendingScenarioTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingScenarioTimeout();
    };
  }, [clearPendingScenarioTimeout]);

  const showFeedback = useCallback(
    (type: 'info' | 'success' | 'warning', text: string) => {
      setActionFeedback({ type, text });
    },
    []
  );

  const clearActionFeedback = useCallback(() => {
    setActionFeedback(null);
  }, []);

  useEffect(() => {
    try {
      const payload: PersistedState = { machines, alerts, settings };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage quota errors
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

  const updateSettings = useCallback(
    (partial: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
      if (partial.sensitivity) {
        showFeedback(
          'info',
          `Monitoring sensitivity updated to ${partial.sensitivity}.`
        );
      }
    },
    [showFeedback]
  );

  const appendGeneratedAlerts = useCallback(
    (newEvents: AlertEvent[]) => {
      if (newEvents.length === 0) return;
      setAlerts((prev) => {
        const next = [...prev];
        for (const ev of newEvents) {
          // Deduplicate active alert of same machine + severity + alertType
          const alreadyActive = next.some(
            (existing) =>
              existing.machineId === ev.machineId &&
              existing.status === 'Active' &&
              existing.severity === ev.severity &&
              existing.alertType === ev.alertType
          );
          if (!alreadyActive) {
            next.unshift(ev);
          }
        }
        return next.slice(0, 80);
      });
    },
    []
  );

  const processMachineTick = useCallback(
    (targetMachineId?: string, forceAllRunning = false) => {
      const nowIso = new Date().toISOString();
      const createdAlerts: AlertEvent[] = [];

      setMachines((prevMachines) =>
        prevMachines.map((machine) => {
          const shouldStep = targetMachineId
            ? machine.id === targetMachineId
            : isMonitoring || (forceAllRunning && machine.scenarioRunning) || machine.scenarioRunning;

          if (!shouldStep) return machine;

          const nextStep = machine.scenarioStep + 1;
          const { vib, temp, note } = generateNextScenarioValues(machine, nextStep);

          // If initial MOTOR-001 hasn't been touched by a scenario, keep gentle realistic variation around its state
          let finalVib = vib;
          let finalTemp = temp;
          if (
            machine.id === 'MOTOR-001' &&
            machine.activeScenario === 'healthy' &&
            !machine.scenarioRunning &&
            machine.healthStatus === 'WARNING'
          ) {
            finalVib = Number(
              (machine.fingerprint.vibrationMaxMmS + 0.24 + (Math.random() - 0.5) * 0.12).toFixed(2)
            );
            finalTemp = Number(
              (machine.fingerprint.temperatureMaxC + 1.8 + (Math.random() - 0.5) * 0.4).toFixed(1)
            );
          }

          const evaluation = evaluateAnomalyRules(
            machine,
            finalVib,
            finalTemp,
            machine.readings,
            settings
          );

          if (evaluation.alertPayload) {
            const sev = evaluation.alertPayload.severity;
            // Info transient spikes log as Acknowledged info history rather than active critical alarms
            const status: AlertStatus = sev === 'Info' ? 'Acknowledged' : 'Active';
            createdAlerts.push({
              id: `ALT-${Math.floor(1050 + Math.random() * 8900)}`,
              timestamp: nowIso,
              machineId: machine.id,
              machineName: machine.name,
              alertType: evaluation.alertPayload.alertType,
              severity: sev,
              triggeringParameter: evaluation.alertPayload.triggeringParameter,
              baselineComparison: evaluation.alertPayload.baselineComparison,
              whatChanged: evaluation.alertPayload.whatChanged,
              persistenceSummary: evaluation.alertPayload.persistenceSummary,
              suggestedInspection: evaluation.alertPayload.suggestedInspection,
              reason: `${evaluation.alertPayload.whatChanged} (${evaluation.alertPayload.persistenceSummary})`,
              status,
              isSimulated: true,
            });
          }

          const nextAccel =
            finalVib !== null && evaluation.sensorHealth === 'Connected'
              ? Number((finalVib * 0.14 + 0.08).toFixed(2))
              : null;

          const newReading: SensorReading = {
            timestamp: nowIso,
            vibrationMmS: finalVib,
            temperatureC: finalTemp,
            peakAccelG: nextAccel,
            sensorHealth: evaluation.sensorHealth,
            machineCondition: evaluation.condition,
            rawNote: note,
            isSimulated: true,
          };

          // Baseline learning progression (NEVER auto-approves; NEVER learns when abnormal or sensor issue)
          let updatedFp = machine.fingerprint;
          if (updatedFp.status === 'Learning in Progress') {
            if (
              evaluation.sensorHealth !== 'Connected' ||
              evaluation.condition !== 'NORMAL'
            ) {
              updatedFp = {
                ...updatedFp,
                status: 'Requires Verification',
                healthyConfirmed: false,
                confirmedBy: 'Paused due to abnormal sample',
                lastUpdated: nowIso,
              };
            } else if (finalVib !== null && finalTemp !== null) {
              const bufVib = [...updatedFp.learningBufferVib, finalVib];
              const bufTemp = [...updatedFp.learningBufferTemp, finalTemp];
              const collected = Math.min(updatedFp.samplesRequired, bufVib.length);
              const progress = Math.round((collected / updatedFp.samplesRequired) * 100);
              const done = collected >= updatedFp.samplesRequired;

              const vibMean =
                bufVib.reduce((s, v) => s + v, 0) / Math.max(1, bufVib.length);
              const tempMean =
                bufTemp.reduce((s, v) => s + v, 0) / Math.max(1, bufTemp.length);
              const vibMin = Math.min(...bufVib);
              const vibMax = Math.max(...bufVib);
              const tempMin = Math.min(...bufTemp);
              const tempMax = Math.max(...bufTemp);

              updatedFp = {
                ...updatedFp,
                learningBufferVib: bufVib,
                learningBufferTemp: bufTemp,
                samplesCollected: collected,
                learningProgress: progress,
                vibrationMinMmS: Number(Math.max(0.2, vibMin - 0.15).toFixed(2)),
                vibrationMaxMmS: Number((vibMax + 0.25).toFixed(2)),
                vibrationMeanMmS: Number(vibMean.toFixed(2)),
                temperatureMinC: Number((tempMin - 1.5).toFixed(1)),
                temperatureMaxC: Number((tempMax + 2.0).toFixed(1)),
                temperatureMeanC: Number(tempMean.toFixed(1)),
                // Requires explicit operator "Complete Baseline" approval!
                status: done ? 'Requires Verification' : 'Learning in Progress',
                isDemonstrationBaseline: false,
                lastUpdated: nowIso,
              };
            }
          }

          return {
            ...machine,
            scenarioStep: nextStep,
            healthStatus: evaluation.condition,
            sensorHealth: evaluation.sensorHealth,
            sensorIssueDetail: evaluation.sensorIssueDetail,
            statusSummary: evaluation.summary,
            latestVibrationMmS: finalVib,
            latestTemperatureC: finalTemp,
            latestPeakAccelG: nextAccel,
            lastUpdated: nowIso,
            fingerprint: updatedFp,
            readings: [...machine.readings.slice(-29), newReading],
          };
        })
      );

      if (createdAlerts.length > 0) {
        appendGeneratedAlerts(createdAlerts);
      }
    },
    [appendGeneratedAlerts, isMonitoring, settings]
  );

  // Single guarded timer — prevents duplicate intervals and memory leaks
  const anyScenarioRunning = useMemo(
    () => machines.some((m) => m.scenarioRunning),
    [machines]
  );

  useEffect(() => {
    if (!isMonitoring && !anyScenarioRunning) {
      return;
    }
    const timerId = window.setInterval(() => {
      processMachineTick(undefined, true);
    }, sampleIntervalMs);
    return () => {
      window.clearInterval(timerId);
    };
  }, [isMonitoring, anyScenarioRunning, sampleIntervalMs, processMachineTick]);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    showFeedback(
      'success',
      `Live simulated monitoring started (${(sampleIntervalMs / 1000).toFixed(1)}s cadence).`
    );
  }, [sampleIntervalMs, showFeedback]);

  const stopMonitoring = useCallback(() => {
    clearPendingScenarioTimeout();
    setIsMonitoring(false);
    setMachines((prev) => prev.map((m) => ({ ...m, scenarioRunning: false })));
    showFeedback('info', 'Simulated monitoring and active scenario timers stopped.');
  }, [clearPendingScenarioTimeout, showFeedback]);

  const stepSimulatedSample = useCallback(
    (targetMachineId?: string) => {
      processMachineTick(targetMachineId, false);
    },
    [processMachineTick]
  );

  const startScenario = useCallback(
    (
      machineId: string,
      scenario: SimulationScenarioId,
      faultMode?: SensorFaultMode
    ) => {
      clearPendingScenarioTimeout();
      const nowIso = new Date().toISOString();

      // Clear old scenario effects safely before starting the new scenario
      setMachines((prev) =>
        prev.map((m) => {
          if (m.id !== machineId) return m;
          const lastReading = m.readings[m.readings.length - 1];
          const needsCleanAnchor =
            m.healthStatus !== 'NORMAL' ||
            m.sensorHealth !== 'Connected' ||
            (lastReading && lastReading.machineCondition !== 'NORMAL');

          const anchorReadings: SensorReading[] = needsCleanAnchor
            ? [
                {
                  timestamp: nowIso,
                  vibrationMmS: m.fingerprint.vibrationMeanMmS,
                  temperatureC: m.fingerprint.temperatureMeanC,
                  peakAccelG: Number(
                    (m.fingerprint.vibrationMeanMmS * 0.14 + 0.08).toFixed(2)
                  ),
                  sensorHealth: 'Connected',
                  machineCondition: 'NORMAL',
                  rawNote: 'Cleared previous scenario state',
                  isSimulated: true,
                },
              ]
            : [];

          return {
            ...m,
            activeScenario: scenario,
            scenarioRunning: true,
            scenarioStep: 0,
            healthStatus: 'NORMAL',
            sensorFaultMode: faultMode ?? m.sensorFaultMode,
            sensorHealth: 'Connected',
            sensorIssueDetail: null,
            readings: [...m.readings.slice(-(29 - anchorReadings.length)), ...anchorReadings],
          };
        })
      );

      // Resolve any prior active alerts for this machine while preserving history
      setAlerts((prev) =>
        prev.map((a) =>
          a.machineId === machineId && a.status === 'Active'
            ? { ...a, status: 'Resolved' }
            : a
        )
      );

      pendingScenarioTimeoutRef.current = window.setTimeout(() => {
        pendingScenarioTimeoutRef.current = null;
        processMachineTick(machineId, true);
      }, 30);

      const labelMap: Record<SimulationScenarioId, string> = {
        healthy: 'Healthy Operation',
        gradual_vibration: 'Gradual Vibration Increase',
        overheating: 'Overheating',
        combined_anomaly: 'Combined Anomaly',
        temporary_fluctuation: 'Temporary Fluctuation',
        sensor_disconnection: 'Sensor Disconnection',
      };
      showFeedback(
        'info',
        `Started "${labelMap[scenario]}" scenario on ${machineId}. Readings are updating periodically.`
      );
    },
    [clearPendingScenarioTimeout, processMachineTick, showFeedback]
  );

  const stopScenario = useCallback(
    (machineId: string) => {
      clearPendingScenarioTimeout();
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId ? { ...m, scenarioRunning: false } : m
        )
      );
      showFeedback('info', `Stopped active scenario progression for ${machineId}.`);
    },
    [clearPendingScenarioTimeout, showFeedback]
  );

  const resetMachineScenario = useCallback(
    (machineId: string) => {
      const nowIso = new Date().toISOString();
      setMachines((prev) =>
        prev.map((m) => {
          if (m.id !== machineId) return m;
          const vib = m.fingerprint.vibrationMeanMmS;
          const temp = m.fingerprint.temperatureMeanC;
          const cleanReading: SensorReading = {
            timestamp: nowIso,
            vibrationMmS: vib,
            temperatureC: temp,
            peakAccelG: Number((vib * 0.14 + 0.08).toFixed(2)),
            sensorHealth: 'Connected',
            machineCondition: 'NORMAL',
            rawNote: 'Scenario reset to nominal baseline',
            isSimulated: true,
          };
          return {
            ...m,
            activeScenario: 'healthy',
            scenarioRunning: false,
            scenarioStep: 0,
            healthStatus: 'NORMAL',
            sensorHealth: 'Connected',
            sensorIssueDetail: null,
            statusSummary:
              'Scenario reset. Simulated readings restored inside demonstration baseline envelope.',
            latestVibrationMmS: vib,
            latestTemperatureC: temp,
            latestPeakAccelG: cleanReading.peakAccelG,
            lastUpdated: nowIso,
            readings: [...m.readings.slice(-19), cleanReading],
          };
        })
      );

      setAlerts((prev) =>
        prev.map((a) =>
          a.machineId === machineId && a.status === 'Active'
            ? { ...a, status: 'Resolved' }
            : a
        )
      );

      showFeedback(
        'success',
        `Reset ${machineId} scenario effects and resolved active scenario alerts.`
      );
    },
    [showFeedback]
  );

  const setMachineFaultMode = useCallback(
    (machineId: string, mode: SensorFaultMode) => {
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId ? { ...m, sensorFaultMode: mode } : m
        )
      );
    },
    []
  );

  const acknowledgeAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId && a.status === 'Active'
            ? { ...a, status: 'Acknowledged' as AlertStatus }
            : a
        )
      );
      showFeedback('info', `Alert ${alertId} marked as Acknowledged.`);
    },
    [showFeedback]
  );

  const resolveAlert = useCallback(
    (alertId: string) => {
      setAlerts((prev) =>
        prev.map((a) =>
          a.id === alertId ? { ...a, status: 'Resolved' as AlertStatus } : a
        )
      );
      showFeedback(
        'success',
        `Alert ${alertId} marked as Resolved (retained in history log).`
      );
    },
    [showFeedback]
  );

  // Baseline Workflow Step 1: Confirm Machine Healthy
  const confirmMachineHealthy = useCallback(
    (machineId: string): { ok: boolean; message: string } => {
      const target = machines.find((m) => m.id === machineId);
      if (!target) {
        return { ok: false, message: 'Machine not found.' };
      }
      if (target.sensorHealth !== 'Connected') {
        const msg = `Cannot confirm ${machineId} healthy while sensor status is SENSOR ISSUE.`;
        showFeedback('warning', msg);
        return { ok: false, message: msg };
      }
      if (target.healthStatus !== 'NORMAL') {
        const msg = `Cannot confirm ${machineId} healthy while condition is ${target.healthStatus}. Restore normal operation first.`;
        showFeedback('warning', msg);
        return { ok: false, message: msg };
      }
      const hasActive = alerts.some(
        (a) => a.machineId === machineId && a.status === 'Active'
      );
      if (hasActive) {
        const msg = `Resolve active alerts on ${machineId} before confirming healthy condition.`;
        showFeedback('warning', msg);
        return { ok: false, message: msg };
      }

      const nowIso = new Date().toISOString();
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId
            ? {
                ...m,
                fingerprint: {
                  ...m.fingerprint,
                  healthyConfirmed: true,
                  confirmedBy: settings.operatorName,
                  lastUpdated: nowIso,
                },
              }
            : m
        )
      );
      const msg = `Operator confirmed ${machineId} is operating in a healthy state. You may now start learning.`;
      showFeedback('success', msg);
      return { ok: true, message: msg };
    },
    [alerts, machines, settings.operatorName, showFeedback]
  );

  // Baseline Workflow Step 2: Start Learning
  const startBaselineLearning = useCallback(
    (machineId: string): { ok: boolean; message: string } => {
      const target = machines.find((m) => m.id === machineId);
      if (!target) {
        return { ok: false, message: 'Machine not found.' };
      }
      if (!target.fingerprint.healthyConfirmed) {
        const msg = 'Confirm Machine Healthy first before starting baseline learning.';
        showFeedback('warning', msg);
        return { ok: false, message: msg };
      }
      if (
        target.sensorHealth !== 'Connected' ||
        target.healthStatus !== 'NORMAL'
      ) {
        const msg =
          'Baseline learning blocked: machine must be NORMAL with a Connected sensor.';
        showFeedback('warning', msg);
        return { ok: false, message: msg };
      }

      const nowIso = new Date().toISOString();
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId
            ? {
                ...m,
                fingerprint: {
                  ...m.fingerprint,
                  status: 'Learning in Progress',
                  samplesCollected: 0,
                  learningProgress: 0,
                  learningBufferVib: [],
                  learningBufferTemp: [],
                  lastUpdated: nowIso,
                },
              }
            : m
        )
      );
      const msg = `Baseline learning started for ${machineId}. Capture 12 healthy simulated samples or run Live Monitoring.`;
      showFeedback('info', msg);
      return { ok: true, message: msg };
    },
    [machines, showFeedback]
  );

  const captureLearningSample = useCallback(
    (machineId: string) => {
      processMachineTick(machineId, false);
    },
    [processMachineTick]
  );

  // Baseline Workflow Step 3: Explicit Operator Complete Baseline
  const completeBaseline = useCallback(
    (machineId: string): { ok: boolean; message: string } => {
      const target = machines.find((m) => m.id === machineId);
      if (!target) return { ok: false, message: 'Machine not found.' };
      if (!target.fingerprint.healthyConfirmed) {
        const msg = 'Healthy confirmation is required before completing a baseline.';
        showFeedback('warning', msg);
        return { ok: false, message: msg };
      }
      if (target.sensorHealth !== 'Connected' || target.healthStatus !== 'NORMAL') {
        const msg =
          'Cannot complete baseline while machine has an active anomaly or SENSOR ISSUE.';
        showFeedback('warning', msg);
        return { ok: false, message: msg };
      }
      if (target.fingerprint.samplesCollected < target.fingerprint.samplesRequired) {
        const msg = `Collect all ${target.fingerprint.samplesRequired} learning samples before completing the baseline.`;
        showFeedback('warning', msg);
        return { ok: false, message: msg };
      }

      const nowIso = new Date().toISOString();
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId
            ? {
                ...m,
                fingerprint: {
                  ...m.fingerprint,
                  status: 'Ready for Monitoring',
                  confirmedBy: settings.operatorName,
                  lastUpdated: nowIso,
                },
              }
            : m
        )
      );
      const msg = `Baseline for ${machineId} approved and marked Ready for Monitoring.`;
      showFeedback('success', msg);
      return { ok: true, message: msg };
    },
    [machines, settings.operatorName, showFeedback]
  );

  const resetBaseline = useCallback(
    (machineId: string) => {
      const nowIso = new Date().toISOString();
      setMachines((prev) =>
        prev.map((m) =>
          m.id === machineId
            ? {
                ...m,
                fingerprint: {
                  ...m.fingerprint,
                  status: 'Not Established',
                  healthyConfirmed: false,
                  confirmedBy: 'Pending operator confirmation',
                  learningProgress: 0,
                  samplesCollected: 0,
                  learningBufferVib: [],
                  learningBufferTemp: [],
                  lastUpdated: nowIso,
                },
              }
            : m
        )
      );
      showFeedback(
        'info',
        `Baseline reset for ${machineId}. Status is now Not Established.`
      );
    },
    [showFeedback]
  );

  const resetDemoData = useCallback(() => {
    clearPendingScenarioTimeout();
    setIsMonitoring(false);
    setMachines(createInitialMachines());
    setAlerts(createInitialAlerts());
    setSettings(DEFAULT_SETTINGS);
    showFeedback(
      'success',
      'All simulated machines, baselines, alerts, and settings restored to initial defaults.'
    );
  }, [clearPendingScenarioTimeout, showFeedback]);

  const summaryCounts = useMemo(() => {
    const totalMachines = machines.length;
    const healthy = machines.filter(
      (m) => m.healthStatus === 'NORMAL' && m.sensorHealth === 'Connected'
    ).length;
    const underObservation = machines.filter(
      (m) =>
        m.healthStatus === 'WARNING' ||
        (m.healthStatus !== 'CRITICAL' && m.sensorHealth === 'SENSOR ISSUE')
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
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    sampleIntervalMs,
    setSampleIntervalMs,
    stepSimulatedSample,
    startScenario,
    stopScenario,
    resetMachineScenario,
    setMachineFaultMode,
    acknowledgeAlert,
    resolveAlert,
    confirmMachineHealthy,
    startBaselineLearning,
    captureLearningSample,
    completeBaseline,
    resetBaseline,
    resetDemoData,
    actionFeedback,
    clearActionFeedback,
  };

  return (
    <SanketContext.Provider value={value}>{children}</SanketContext.Provider>
  );
};

export function useSanket(): SanketContextValue {
  const ctx = useContext(SanketContext);
  if (!ctx) {
    throw new Error('useSanket must be used within a SanketProvider');
  }
  return ctx;
}
