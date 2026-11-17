import {
  AlertSeverity,
  AlertStatus,
  BaselineStatus,
  HealthStatus,
  SensorHealth,
} from '../types/sanket';

export function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--:--';
  }
}

export function formatDateTime(iso: string): string {
  try {
    const date = new Date(iso);
    return date.toLocaleString([], {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '--';
  }
}

export function getHealthTone(status: HealthStatus): {
  text: string;
  dotColor: string;
  surface: string;
} {
  switch (status) {
    case 'NORMAL':
      return {
        text: 'text-emerald-700',
        dotColor: 'bg-emerald-600',
        surface: 'bg-emerald-50/70 border-emerald-200',
      };
    case 'WARNING':
      return {
        text: 'text-amber-700',
        dotColor: 'bg-amber-600',
        surface: 'bg-amber-50/70 border-amber-200',
      };
    case 'CRITICAL':
      return {
        text: 'text-red-700',
        dotColor: 'bg-red-600',
        surface: 'bg-red-50/70 border-red-200',
      };
  }
}

export function getSensorTone(sensorHealth: SensorHealth): string {
  return sensorHealth === 'Connected' ? 'text-slate-600' : 'text-blue-700';
}

export function getBaselineTone(status: BaselineStatus): string {
  switch (status) {
    case 'Ready for Monitoring':
      return 'text-emerald-700';
    case 'Learning in Progress':
      return 'text-blue-700';
    case 'Requires Verification':
      return 'text-amber-700';
    case 'Not Established':
      return 'text-slate-500';
  }
}

export function getSeverityTone(severity: AlertSeverity): string {
  switch (severity) {
    case 'Critical':
      return 'text-red-700';
    case 'Warning':
      return 'text-amber-700';
    case 'Info':
      return 'text-blue-700';
  }
}

export function getAlertStatusTone(status: AlertStatus): string {
  switch (status) {
    case 'Active':
      return 'text-red-700 font-semibold';
    case 'Acknowledged':
      return 'text-amber-700 font-medium';
    case 'Resolved':
      return 'text-slate-500 font-medium';
  }
}
