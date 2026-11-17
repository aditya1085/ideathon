import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { HealthStatus, SensorHealth } from '../../types/sanket';

export const StatusLabel: React.FC<{
  status: HealthStatus;
  sensorHealth?: SensorHealth;
}> = ({ status, sensorHealth = 'Connected' }) => {
  if (sensorHealth === 'SENSOR ISSUE') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 whitespace-nowrap">
        <Eye className="w-3.5 h-3.5 shrink-0 text-blue-700" aria-hidden="true" />
        <span>Unverified</span>
      </span>
    );
  }
  if (status === 'NORMAL') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>NORMAL</span>
      </span>
    );
  }
  if (status === 'WARNING') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 whitespace-nowrap">
        <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>WARNING</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
      <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>CRITICAL</span>
    </span>
  );
};

export const SensorHealthLabel: React.FC<{ sensorHealth: SensorHealth }> = ({
  sensorHealth,
}) => {
  if (sensorHealth === 'Connected') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 whitespace-nowrap">
        <Wifi className="w-3 h-3 shrink-0 text-emerald-700" aria-hidden="true" />
        <span>Sensor Connected</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 whitespace-nowrap">
      <WifiOff className="w-3 h-3 shrink-0" aria-hidden="true" />
      <span>SENSOR ISSUE</span>
    </span>
  );
};
