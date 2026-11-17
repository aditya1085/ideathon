export type NavigationPage =
  | 'overview'
  | 'machines'
  | 'fingerprint'
  | 'live'
  | 'alerts'
  | 'simulation'
  | 'integration'
  | 'settings';

export type MachineType = 'pump' | 'motor' | 'fan';

export type HealthStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export type SensorHealth = 'Connected' | 'SENSOR ISSUE';

export type BaselineStatus =
  | 'Not Established'
  | 'Learning in Progress'
  | 'Ready for Monitoring'
  | 'Requires Verification';

export type AlertSeverity = 'Info' | 'Warning' | 'Critical';

export type AlertStatus = 'Active' | 'Acknowledged' | 'Resolved';

export type SimulationScenarioId =
  | 'healthy'
  | 'gradual_vibration'
  | 'overheating'
  | 'combined_anomaly'
  | 'temporary_fluctuation'
  | 'sensor_disconnection';

export type SensorFaultMode = 'missing' | 'frozen' | 'invalid';

export type SensitivityLevel = 'Low' | 'Standard' | 'High';

export interface SensorReading {
  timestamp: string;
  vibrationMmS: number | null;
  temperatureC: number | null;
  peakAccelG: number | null;
  sensorHealth: SensorHealth;
  machineCondition: HealthStatus;
  rawNote?: string;
  isSimulated: true;
}

export interface HealthFingerprint {
  status: BaselineStatus;
  healthyConfirmed: boolean;
  confirmedBy: string;
  isDemonstrationBaseline: boolean;
  vibrationMinMmS: number;
  vibrationMaxMmS: number;
  vibrationMeanMmS: number;
  temperatureMinC: number;
  temperatureMaxC: number;
  temperatureMeanC: number;
  learningProgress: number; // 0 to 100
  samplesCollected: number;
  samplesRequired: number;
  learningBufferVib: number[];
  learningBufferTemp: number[];
  lastUpdated: string;
}

export interface Machine {
  id: string;
  name: string;
  category: string;
  type: MachineType;
  location: string;
  ratedRpm: number;
  powerRating: string;
  healthStatus: HealthStatus;
  sensorHealth: SensorHealth;
  sensorIssueDetail: string | null;
  statusSummary: string;
  activeScenario: SimulationScenarioId;
  scenarioRunning: boolean;
  scenarioStep: number;
  sensorFaultMode: SensorFaultMode;
  latestVibrationMmS: number | null;
  latestTemperatureC: number | null;
  latestPeakAccelG: number | null;
  lastUpdated: string;
  fingerprint: HealthFingerprint;
  readings: SensorReading[];
}

export interface AlertEvent {
  id: string;
  timestamp: string;
  machineId: string;
  machineName: string;
  alertType: string;
  severity: AlertSeverity;
  triggeringParameter: string;
  baselineComparison: string;
  whatChanged: string;
  persistenceSummary: string;
  suggestedInspection: string;
  reason: string;
  status: AlertStatus;
  isSimulated: true;
}

export interface AppSettings {
  operatorName: string;
  operatorRole: string;
  workspaceLabel: string;
  inAppNotifications: boolean;
  warningEscalation: boolean;
  correlateVibAndTemp: boolean;
  emailDigestPreview: boolean;
  sensitivity: SensitivityLevel;
}

export interface ScenarioDefinition {
  id: SimulationScenarioId;
  code: string;
  title: string;
  description: string;
  expectedOutcome: string;
  effectLabel: string;
}
