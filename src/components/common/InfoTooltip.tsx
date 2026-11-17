import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  label: string;
  explanation: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({
  label,
  explanation,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center justify-center text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full p-0.5"
        aria-label={`Explanation for ${label}`}
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-60 p-2.5 rounded-lg bg-slate-900 text-white text-[11px] leading-relaxed shadow-lg z-40 pointer-events-none font-normal text-left"
        >
          <span className="block font-semibold text-amber-300 mb-0.5">{label}</span>
          {explanation}
        </span>
      )}
    </span>
  );
};
