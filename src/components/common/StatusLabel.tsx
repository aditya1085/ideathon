import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  WifiOff,
} from 'lucide-react';
import { HealthStatus } from '../../types/sanket';

export const StatusLabel: React.FC<{ status: HealthStatus; compact?: boolean }> = ({
  status,
  compact = false,
}) => {
  if (status === 'Healthy') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Healthy</span>
      </span>
    );
  }
  if (status === 'Under Observation') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 whitespace-nowrap">
        <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>{compact ? 'Observation' : 'Under Observation'}</span>
      </span>
    );
  }
  if (status === 'Alert') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 whitespace-nowrap">
        <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
        <span>Alert</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 whitespace-nowrap">
      <WifiOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      <span>Disconnected</span>
    </span>
  );
};
