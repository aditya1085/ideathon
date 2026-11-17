import {
  AlertEvent,
  AppSettings,
  HealthStatus,
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
  finalCondition: HealthStatus,
  count = 20
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
    const readingCondition: HealthStatus =
      finalCondition === 'WARNING' && i < 4 ? 'WARNING' : 'NORMAL';

    readings.push({
      timestamp: new Date(now - i * 15_000).toISOString(),
      vibrationMmS: vib,
      temperatureC: temp,
      peakAccelG: accel,
      sensorHealth: 'Connected',
      machineCondition: readingCondition,
      isSimulated: true,
    });
  }
  return readings;
}

export function createInitialMachines(): Machine[] {
  const pumpReadings = buildInitialReadings(2.08, 0.14, 0.05, 43.8, 0.5, 0.2, 'NORMAL');
  const motorReadings = buildInitialReadings(3.05, 0.14, 0.72, 55.2, 0.6, 5.4, 'WARNING');
  const fanReadings = buildInitialReadings(1.58, 0.12, 0.03, 38.2, 0.4, 0.2, 'NORMAL');

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
      healthStatus: 'NORMAL',
      sensorHealth: 'Connected',
      sensorIssueDetail: null,
      statusSummary:
        'Simulated vibration and housing temperature remain within the demonstration baseline envelope.',
      activeScenario: 'healthy',
      scenarioRunning: false,
      scenarioStep: 0,
      sensorFaultMode: 'missing',
      latestVibrationMmS: lastPump.vibrationMmS,
      latestTemperatureC: lastPump.temperatureC,
      latestPeakAccelG: lastPump.peakAccelG,
      lastUpdated: lastPump.timestamp,
      fingerprint: {
        status: 'Ready for Monitoring',
        healthyConfirmed: true,
        confirmedBy: 'Demo Operator',
        isDemonstrationBaseline: true,
        vibrationMinMmS: 1.75,
        vibrationMaxMmS: 2.55,
        vibrationMeanMmS: 2.12,
        temperatureMinC: 40.0,
        temperatureMaxC: 48.0,
        temperatureMeanC: 44.1,
        learningProgress: 100,
        samplesCollected: 12,
        samplesRequired: 12,
        learningBufferVib: [],
        learningBufferTemp: [],
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
      healthStatus: 'WARNING',
      sensorHealth: 'Connected',
      sensorIssueDetail: null,
      statusSummary:
        'Persistent mild elevation in casing temperature and RMS vibration above the illustrative baseline range.',
      activeScenario: 'healthy',
      scenarioRunning: false,
      scenarioStep: 0,
      sensorFaultMode: 'missing',
      latestVibrationMmS: lastMotor.vibrationMmS,
      latestTemperatureC: lastMotor.temperatureC,
      latestPeakAccelG: lastMotor.peakAccelG,
      lastUpdated: lastMotor.timestamp,
      fingerprint: {
        status: 'Ready for Monitoring',
        healthyConfirmed: true,
        confirmedBy: 'Demo Operator',
        isDemonstrationBaseline: true,
        vibrationMinMmS: 2.6,
        vibrationMaxMmS: 3.55,
        vibrationMeanMmS: 3.08,
        temperatureMinC: 51.0,
        temperatureMaxC: 59.0,
        temperatureMeanC: 55.0,
        learningProgress: 100,
        samplesCollected: 12,
        samplesRequired: 12,
        learningBufferVib: [],
        learningBufferTemp: [],
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
      healthStatus: 'NORMAL',
      sensorHealth: 'Connected',
      sensorIssueDetail: null,
      statusSummary:
        'Simulated airflow load and shaft vibration tracking inside the demonstration baseline envelope.',
      activeScenario: 'healthy',
      scenarioRunning: false,
      scenarioStep: 0,
      sensorFaultMode: 'missing',
      latestVibrationMmS: lastFan.vibrationMmS,
      latestTemperatureC: lastFan.temperatureC,
      latestPeakAccelG: lastFan.peakAccelG,
      lastUpdated: lastFan.timestamp,
      fingerprint: {
        status: 'Ready for Monitoring',
        healthyConfirmed: true,
        confirmedBy: 'Demo Operator',
        isDemonstrationBaseline: true,
        vibrationMinMmS: 1.25,
        vibrationMaxMmS: 2.05,
        vibrationMeanMmS: 1.61,
        temperatureMinC: 35.0,
        temperatureMaxC: 43.0,
        temperatureMeanC: 38.4,
        learningProgress: 100,
        samplesCollected: 12,
        samplesRequired: 12,
        learningBufferVib: [],
        learningBufferTemp: [],
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
      severity: 'Warning',
      triggeringParameter: 'Temperature (°C) & Vibration RMS (mm/s)',
      baselineComparison:
        '60.6 °C vs baseline ceiling 59.0 °C (+1.6 °C); 3.77 mm/s vs ceiling 3.55 mm/s (+6%).',
      whatChanged:
        'Simulated casing temperature and vibration drifted modestly above the demonstration upper bound.',
      persistenceSummary: 'Observed across 4 consecutive simulated samples.',
      suggestedInspection:
        'Suggested inspection: Check cooling airflow louvers, terminal box warmth, and drive belt tension during routine rounds.',
      reason:
        'Simulated casing temperature and vibration drifted modestly above the demonstration upper bound across 4 samples.',
      status: 'Acknowledged',
      isSimulated: true,
    },
    {
      id: 'ALT-1041',
      timestamp: new Date(now - 1000 * 60 * 135).toISOString(),
      machineId: 'PUMP-001',
      machineName: 'Water Pump',
      alertType: 'Transient Fluctuation',
      severity: 'Info',
      triggeringParameter: 'Vibration RMS (mm/s)',
      baselineComparison: '2.98 mm/s vs baseline mean 2.12 mm/s (+41%, ceiling 2.55 mm/s).',
      whatChanged: 'Single simulated vibration spike occurred and returned to normal within 2 samples.',
      persistenceSummary: 'Non-persistent (1 reading); did not escalate.',
      suggestedInspection:
        'Suggested inspection: Verify suction line pressure stability if recurrence is noticed.',
      reason:
        'Brief simulated vibration fluctuation subsided within 2 sampling cycles without sustained drift.',
      status: 'Resolved',
      isSimulated: true,
    },
    {
      id: 'ALT-1040',
      timestamp: new Date(now - 1000 * 60 * 320).toISOString(),
      machineId: 'FAN-001',
      machineName: 'Cooling Fan',
      alertType: 'Baseline Verified',
      severity: 'Info',
      triggeringParameter: 'Baseline Calibration',
      baselineComparison: 'Mean 1.61 mm/s · 38.4 °C established from 12 simulated windows.',
      whatChanged: 'Operator completed demonstration baseline verification.',
      persistenceSummary: '12 of 12 healthy learning samples confirmed.',
      suggestedInspection:
        'No mechanical inspection required; machine ready for simulated monitoring.',
      reason:
        'Demonstration baseline verified by operator after 12 simulated healthy operating windows.',
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
  correlateVibAndTemp: true,
  emailDigestPreview: false,
  sensitivity: 'Standard',
};

export const SIMULATION_SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'healthy',
    code: 'A',
    title: 'Healthy Operation',
    description:
      'Generates simulated vibration and temperature readings inside the machine’s illustrative baseline range.',
    expectedOutcome: 'Machine status settles to NORMAL with Connected sensor health.',
    effectLabel: 'Nominal Baseline',
  },
  {
    id: 'gradual_vibration',
    code: 'B',
    title: 'Gradual Vibration Increase',
    description:
      'Increases vibration gradually over multiple readings to demonstrate persistence-based escalation from NORMAL to WARNING and CRITICAL.',
    expectedOutcome:
      'Transitions NORMAL → WARNING after sustained drift, then CRITICAL if elevation continues.',
    effectLabel: 'Progressive Drift',
  },
  {
    id: 'overheating',
    code: 'C',
    title: 'Overheating',
    description:
      'Gradually raises simulated operating temperature beyond the machine’s thermal baseline ceiling.',
    expectedOutcome:
      'Triggers WARNING on sustained thermal rise and CRITICAL on severe sustained heat buildup.',
    effectLabel: 'Thermal Rise',
  },
  {
    id: 'combined_anomaly',
    code: 'D',
    title: 'Combined Anomaly',
    description:
      'Increases simulated vibration and temperature together so correlation rules detect compounding deviation.',
    expectedOutcome:
      'Escalates to CRITICAL faster when vibration-temperature correlation is enabled.',
    effectLabel: 'Correlated Fault',
  },
  {
    id: 'temporary_fluctuation',
    code: 'E',
    title: 'Temporary Fluctuation',
    description:
      'Introduces a brief 1–2 reading spike and then returns to nominal values, showing why persistence checks prevent false alarms.',
    expectedOutcome:
      'Logs a brief Info/Warning notice without triggering a false CRITICAL escalation.',
    effectLabel: 'Non-Persistent Spike',
  },
  {
    id: 'sensor_disconnection',
    code: 'F',
    title: 'Sensor Disconnection',
    description:
      'Simulates missing, frozen, or invalid sensor readings so missing data is never treated as zero or healthy.',
    expectedOutcome:
      'Flags SENSOR ISSUE separately from machine condition and logs a telemetry integrity alert.',
    effectLabel: 'Signal Integrity',
  },
];
