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

export type HealthStatus = 'Healthy' | 'Under Observation' | 'Alert' | 'Disconnected';

export type BaselineStatus =
  | 'Not Established'
  | 'Learning'
  | 'Ready'
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

export type SensitivityLevel = 'Low' | 'Standard' | 'High';

export interface SensorReading {
  timestamp: string;
  vibrationMmS: number | null;
  temperatureC: number | null;
  peakAccelG: number | null;
  isSimulated: true;
}

export interface HealthFingerprint {
  status: BaselineStatus;
  healthyConfirmed: boolean;
  confirmedBy: string;
  vibrationMinMmS: number;
  vibrationMaxMmS: number;
  vibrationMeanMmS: number;
  temperatureMinC: number;
  temperatureMaxC: number;
  temperatureMeanC: number;
  learningProgress: number; // 0 to 100
  samplesCollected: number;
  samplesRequired: number;
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
  statusSummary: string;
  activeScenario: SimulationScenarioId;
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
  emailDigestPreview: boolean;
  sensitivity: SensitivityLevel;
}

export interface ScenarioDefinition {
  id: SimulationScenarioId;
  title: string;
  description: string;
  expectedOutcome: string;
  effectLabel: string;
}
