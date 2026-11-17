import React from 'react';
import { HealthStatus, MachineType } from '../../types/sanket';

export const SanketLogoPlaceholder: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  return (
    <div className="flex items-center gap-3 select-none">
      <div
        className="w-9 h-9 rounded-lg border border-dashed border-slate-400/70 bg-slate-800/70 flex items-center justify-center shrink-0"
        title="SANKET+ Logo Placeholder"
        aria-label="SANKET+ Logo Placeholder"
      >
        <span className="font-mono text-[11px] font-semibold tracking-tight text-amber-400">
          S+
        </span>
      </div>
      {!compact && (
        <div className="min-w-0">
          <div className="font-display text-base font-bold tracking-tight text-white leading-none">
            SANKET<span className="text-amber-400">+</span>
          </div>
          <div className="text-[11px] text-slate-300 mt-1 truncate">
            More than a warning.
          </div>
        </div>
      )}
    </div>
  );
};

export const WaterPumpIllustration: React.FC<{ className?: string }> = ({
  className = 'w-16 h-12',
}) => (
  <svg
    viewBox="0 0 96 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Baseplate */}
    <path
      d="M12 52H84M18 52V46H78V52"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Volute Casing */}
    <circle cx="38" cy="30" r="14" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="38" cy="30" r="6" stroke="#D97706" strokeWidth="1.5" />
    {/* Discharge Outlet */}
    <path
      d="M34 16V8H44V16"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M31 8H47" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    {/* Intake Port */}
    <path
      d="M14 26H24M14 34H24M14 23V37"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    {/* Shaft & Coupling */}
    <path d="M52 28H62M52 32H62" stroke="#2563EB" strokeWidth="1.5" />
    {/* Drive Unit */}
    <rect
      x="62"
      y="20"
      width="16"
      height="20"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    <path d="M66 25H74M66 30H74M66 35H74" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
  </svg>
);

export const IndustrialMotorIllustration: React.FC<{ className?: string }> = ({
  className = 'w-16 h-12',
}) => (
  <svg
    viewBox="0 0 96 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Mounting Feet */}
    <path
      d="M16 52H76M24 46V52M64 46V52"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    {/* Stator Frame */}
    <rect
      x="20"
      y="18"
      width="48"
      height="28"
      rx="3"
      stroke="currentColor"
      strokeWidth="1.75"
    />
    {/* Cooling Fins */}
    <path
      d="M28 23H60M28 28H60M28 33H60M28 38H60M28 42H60"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
    />
    {/* Terminal Box */}
    <rect
      x="36"
      y="10"
      width="14"
      height="8"
      rx="1.5"
      stroke="#2563EB"
      strokeWidth="1.5"
    />
    {/* Fan Cowl (left) */}
    <path
      d="M20 20C14 20 12 24 12 32C12 40 14 44 20 44"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
    />
    {/* Output Shaft (right) */}
    <path
      d="M68 28H84V36H68"
      stroke="#D97706"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CoolingFanIllustration: React.FC<{ className?: string }> = ({
  className = 'w-16 h-12',
}) => (
  <svg
    viewBox="0 0 96 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer Shroud */}
    <circle cx="48" cy="31" r="21" stroke="currentColor" strokeWidth="1.75" />
    <circle cx="48" cy="31" r="17" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
    {/* Hub */}
    <circle cx="48" cy="31" r="4.5" stroke="#D97706" strokeWidth="1.75" />
    {/* Fan Blades */}
    <path
      d="M48 26.5C47 19 52 15 56 17C58 18 56 24 51.5 28"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M52.2 33C59 35 61 41 58 44C56 46 51 42 49.5 35.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M44.2 33.8C38 38 33 35 33 31C33 28 39 27.5 43.8 29.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    {/* Support Struts */}
    <path d="M24 54H72M34 48L29 54M62 48L67 54" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const MachineTypeIllustration: React.FC<{
  type: MachineType;
  className?: string;
}> = ({ type, className }) => {
  if (type === 'pump') return <WaterPumpIllustration className={className} />;
  if (type === 'motor') return <IndustrialMotorIllustration className={className} />;
  return <CoolingFanIllustration className={className} />;
};

export const VibrationWaveformVisual: React.FC<{
  amplitude?: number;
  accentColor?: string;
  className?: string;
}> = ({ amplitude = 1, accentColor = '#2563EB', className = 'w-full h-14' }) => {
  const scale = Math.min(1.6, Math.max(0.45, amplitude));
  const pts: string[] = [];
  for (let x = 0; x <= 200; x += 4) {
    const t = (x / 200) * Math.PI * 6;
    const envelope = Math.sin((x / 200) * Math.PI);
    const y = 24 + (Math.sin(t) * 11 + Math.sin(t * 2.4) * 5) * scale * envelope;
    pts.push(`${x},${y.toFixed(1)}`);
  }

  return (
    <svg viewBox="0 0 200 48" fill="none" className={className} aria-hidden="true">
      <line x1="0" y1="24" x2="200" y2="24" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
      <polyline
        points={pts.join(' ')}
        stroke={accentColor}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const TemperatureTrendVisual: React.FC<{
  elevated?: boolean;
  className?: string;
}> = ({ elevated = false, className = 'w-full h-14' }) => (
  <svg viewBox="0 0 200 48" fill="none" className={className} aria-hidden="true">
    <line x1="0" y1="36" x2="200" y2="36" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
    <path
      d={
        elevated
          ? 'M4 38 C 45 36, 85 32, 120 22 C 150 14, 175 11, 196 9'
          : 'M4 31 C 42 29, 85 30, 122 28 C 155 27, 178 29, 196 28'
      }
      stroke="#D97706"
      strokeWidth="1.85"
      strokeLinecap="round"
    />
  </svg>
);

export const MachineHealthGaugeVisual: React.FC<{
  status: HealthStatus;
  deviationPercent: number;
}> = ({ status, deviationPercent }) => {
  const clamped = Math.min(100, Math.max(0, deviationPercent));
  const strokeColor =
    status === 'Healthy'
      ? '#059669'
      : status === 'Under Observation'
      ? '#D97706'
      : status === 'Alert'
      ? '#DC2626'
      : '#64748B';

  const radius = 34;
  const circumference = Math.PI * radius; // semicircle
  const fillFraction = status === 'Disconnected' ? 0 : Math.max(0.12, 1 - clamped / 100);
  const dashOffset = circumference * (1 - fillFraction);

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 96 58" className="w-28 h-16" aria-hidden="true">
        <path
          d="M 14 48 A 34 34 0 0 1 82 48"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 14 48 A 34 34 0 0 1 82 48"
          fill="none"
          stroke={strokeColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
        <text
          x="48"
          y="46"
          textAnchor="middle"
          className="fill-slate-900 font-mono text-[11px] font-semibold"
        >
          {status === 'Disconnected' ? 'N/A' : `${Math.round(100 - clamped)}%`}
        </text>
      </svg>
      <span className="text-[11px] text-slate-500">Fingerprint Stability</span>
    </div>
  );
};
