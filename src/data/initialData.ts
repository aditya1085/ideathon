import {
  AlertEvent,
  AppSettings,
  Machine,
  ScenarioDefinition,
  SensorReading,
} from '../types/sanket';

function buildInitialReadings(
  baseVib: number,
  vibJitter: number,
  vibDrift: number,
  baseTemp: number,
  tempJitter: number,
  tempDrift: number,
  count = 24
): SensorReading[] {
  const now = Date.now();
  const readings: SensorReading[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const progress = (count - 1 - i) / Math.max(1, count - 1);
    const wave = Math.sin((count - i) * 0.7) * vibJitter * 0.65;
    const micro = Math.cos((count - i) * 1.3) * vibJitter * 0.35;
    const vib = Number(
      Math.max(0.2, baseVib + wave + micro + progress * vibDrift).toFixed(2)
    );
    const tempWave = Math.sin((count - i) * 0.45) * tempJitter;
    const temp = Number(
      (baseTemp + tempWave + progress * tempDrift).toFixed(1)
    );
    const accel = Number((vib * 0.14 + 0.08).toFixed(2));
    readings.push({
      timestamp: new Date(now - i * 30_000).toISOString(),
      vibrationMmS: vib,
      temperatureC: temp,
      peakAccelG: accel,
      isSimulated: true,
    });
  }
  return readings;
}

export function createInitialMachines(): Machine[] {
  const pumpReadings = buildInitialReadings(2.08, 0.14, 0.05, 43.8, 0.6, 0.3);
  const motorReadings = buildInitialReadings(3.05, 0.18, 0.82, 55.2, 0.8, 5.9);
  const fanReadings = buildInitialReadings(1.58, 0.12, 0.03, 38.2, 0.5, 0.2);

  const lastPump = pumpReadings[pumpReadings.length - 1];
  const lastMotor = motorReadings[motorReadings.length - 1];
  const lastFan = fanReadings[fanReadings.length - 1];

  return [
    {
      id: 'PUMP-001',
      name: 'Water Pump',
      category: 'Centrifugal Circulation Pump',
      type: 'pump',
      location: 'Simulated Bay A · Loop 1',
      ratedRpm: 1450,
      powerRating: '7.5 kW',
      healthStatus: 'Healthy',
      statusSummary:
        'Vibration and bearing housing temperature remain within the learned machine baseline.',
      activeScenario: 'healthy',
      latestVibrationMmS: lastPump.vibrationMmS,
      latestTemperatureC: lastPump.temperatureC,
      latestPeakAccelG: lastPump.peakAccelG,
      lastUpdated: lastPump.timestamp,
      fingerprint: {
        status: 'Ready',
        healthyConfirmed: true,
        confirmedBy: 'Demo Operator',
        vibrationMinMmS: 1.75,
        vibrationMaxMmS: 2.55,
        vibrationMeanMmS: 2.12,
        temperatureMinC: 40.0,
        temperatureMaxC: 48.0,
        temperatureMeanC: 44.1,
        learningProgress: 100,
        samplesCollected: 480,
        samplesRequired: 480,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      },
      readings: pumpReadings,
    },
    {
      id: 'MOTOR-001',
      name: 'Industrial Motor',
      category: 'Three-Phase Induction Drive',
      type: 'motor',
      location: 'Simulated Bay B · Line 2',
      ratedRpm: 1780,
      powerRating: '15.0 kW',
      healthStatus: 'Under Observation',
      statusSummary:
        'Gradual upward drift detected in casing temperature and RMS vibration relative to baseline.',
      activeScenario: 'healthy',
      latestVibrationMmS: lastMotor.vibrationMmS,
      latestTemperatureC: lastMotor.temperatureC,
      latestPeakAccelG: lastMotor.peakAccelG,
      lastUpdated: lastMotor.timestamp,
      fingerprint: {
        status: 'Ready',
        healthyConfirmed: true,
        confirmedBy: 'Demo Operator',
        vibrationMinMmS: 2.6,
        vibrationMaxMmS: 3.55,
        vibrationMeanMmS: 3.08,
        temperatureMinC: 51.0,
        temperatureMaxC: 59.0,
        temperatureMeanC: 55.0,
        learningProgress: 100,
        samplesCollected: 480,
        samplesRequired: 480,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
      },
      readings: motorReadings,
    },
    {
      id: 'FAN-001',
      name: 'Cooling Fan',
      category: 'Axial Exhaust Blower',
      type: 'fan',
      location: 'Simulated Bay C · Exhaust Duct',
      ratedRpm: 1180,
      powerRating: '4.0 kW',
      healthStatus: 'Healthy',
      statusSummary:
        'Steady airflow load and nominal shaft vibration tracking inside normal fingerprint envelope.',
      activeScenario: 'healthy',
      latestVibrationMmS: lastFan.vibrationMmS,
      latestTemperatureC: lastFan.temperatureC,
      latestPeakAccelG: lastFan.peakAccelG,
      lastUpdated: lastFan.timestamp,
      fingerprint: {
        status: 'Ready',
        healthyConfirmed: true,
        confirmedBy: 'Demo Operator',
        vibrationMinMmS: 1.25,
        vibrationMaxMmS: 2.05,
        vibrationMeanMmS: 1.61,
        temperatureMinC: 35.0,
        temperatureMaxC: 43.0,
        temperatureMeanC: 38.4,
        learningProgress: 100,
        samplesCollected: 480,
        samplesRequired: 480,
        lastUpdated: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
      },
      readings: fanReadings,
    },
  ];
}

export function createInitialAlerts(): AlertEvent[] {
  const now = Date.now();
  return [
    {
      id: 'ALT-1042',
      timestamp: new Date(now - 1000 * 60 * 18).toISOString(),
      machineId: 'MOTOR-001',
      machineName: 'Industrial Motor',
      alertType: 'Early Drift Notice',
      severity: 'Info',
      reason:
        'Simulated bearing housing temperature rose +2.1 °C above baseline mean; placed under observation.',
      status: 'Acknowledged',
      isSimulated: true,
    },
    {
      id: 'ALT-1041',
      timestamp: new Date(now - 1000 * 60 * 135).toISOString(),
      machineId: 'PUMP-001',
      machineName: 'Water Pump',
      alertType: 'Transient Spike',
      severity: 'Warning',
      reason:
        'Brief simulated vibration spike (3.12 mm/s) subsided within 2 sampling cycles without sustained drift.',
      status: 'Resolved',
      isSimulated: true,
    },
    {
      id: 'ALT-1040',
      timestamp: new Date(now - 1000 * 60 * 320).toISOString(),
      machineId: 'FAN-001',
      machineName: 'Cooling Fan',
      alertType: 'Baseline Calibration',
      severity: 'Info',
      reason:
        'Machine-specific healthy fingerprint baseline verified after 480 simulated operating windows.',
      status: 'Resolved',
      isSimulated: true,
    },
  ];
}

export const DEFAULT_SETTINGS: AppSettings = {
  operatorName: 'Demo Operator',
  operatorRole: 'Condition Monitoring Reviewer',
  workspaceLabel: 'Prototype Simulation Environment',
  inAppNotifications: true,
  warningEscalation: true,
  emailDigestPreview: false,
  sensitivity: 'Standard',
};

export const SIMULATION_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'healthy',
    title: 'Healthy operation',
    description:
      'Simulates steady-state operation within the machine-specific vibration and temperature envelope.',
    expectedOutcome: 'Status settles to Healthy with zero active inspection alerts.',
    effectLabel: 'Nominal Baseline',
  },
  {
    id: 'gradual_vibration',
    title: 'Gradual vibration increase',
    description:
      'Models progressive rotor imbalance or early bearing wear through a rising RMS vibration trend.',
    expectedOutcome:
      'Transitions from Under Observation to a Warning/Critical vibration drift alert.',
    effectLabel: 'Progressive Drift',
  },
  {
    id: 'overheating',
    title: 'Overheating',
    description:
      'Simulates thermal buildup in the housing or stator windings beyond normal operating bounds.',
    expectedOutcome: 'Triggers thermal anomaly detection and high-temperature alert.',
    effectLabel: 'Thermal Rise',
  },
  {
    id: 'combined_anomaly',
    title: 'Combined anomaly',
    description:
      'Simultaneous vibration elevation and temperature rise indicating compounding mechanical stress.',
    expectedOutcome: 'Generates a Critical inspection alert requiring immediate review.',
    effectLabel: 'Multi-Signal Fault',
  },
  {
    id: 'temporary_fluctuation',
    title: 'Temporary fluctuation',
    description:
      'Injects a short-lived load transient that briefly exceeds tolerance before returning to baseline.',
    expectedOutcome:
      'Places machine Under Observation briefly without triggering sustained critical escalation.',
    effectLabel: 'Transient Spike',
  },
  {
    id: 'sensor_disconnection',
    title: 'Sensor disconnection',
    description:
      'Simulates dropped telemetry packets or unplugged simulated sensor feed to test fault handling.',
    expectedOutcome:
      'Marks machine telemetry Disconnected and logs a signal-loss inspection event.',
    effectLabel: 'Telemetry Loss',
  },
];
