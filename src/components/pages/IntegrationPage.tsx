import React from 'react';
import {
  ArrowRight,
  Cpu,
  Database,
  LayoutDashboard,
  Radio,
  Router,
  Wifi,
} from 'lucide-react';

export const IntegrationPage: React.FC = () => {
  const stages = [
    {
      step: '01',
      title: 'Compatible Sensors',
      subtitle: 'MEMS Triaxial Vibration & RTD/NTC Temperature Probes',
      tag: 'FUTURE PILOT INTEGRATION',
      isCurrent: false,
      icon: Radio,
    },
    {
      step: '02',
      title: 'ESP32 / Industrial Gateway',
      subtitle: 'Edge sampling, FFT/RMS framing & local ring buffer',
      tag: 'FUTURE PILOT INTEGRATION',
      isCurrent: false,
      icon: Router,
    },
    {
      step: '03',
      title: 'MQTT / HTTP',
      subtitle: 'Structured JSON telemetry transport & TLS payload schema',
      tag: 'FUTURE PILOT INTEGRATION',
      isCurrent: false,
      icon: Wifi,
    },
    {
      step: '04',
      title: 'SANKET+ Intelligence Engine',
      subtitle: 'Health Fingerprint comparison & early anomaly evaluation',
      tag: 'ACTIVE SOFTWARE PROTOTYPE',
      isCurrent: true,
      icon: Cpu,
    },
    {
      step: '05',
      title: 'Dashboard & Alerts',
      subtitle: 'Condition trends, explainable alerts & inspection queue',
      tag: 'ACTIVE SOFTWARE PROTOTYPE',
      isCurrent: true,
      icon: LayoutDashboard,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono font-semibold text-amber-700">
            SIMULATED DATA INPUT
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="font-mono text-slate-500">
            Physical Sensor & Gateway Connectivity Planned for Pilot Stage
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Hardware-Ready Integration Architecture
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          SANKET+ is built software-first so anomaly detection, baseline learning, and inspection workflows are validated before field hardware rollout. Right now, telemetry is supplied by the built-in simulation engine.
        </p>
      </div>

      {/* Clean Sensor-to-Dashboard Architecture Diagram */}
      <section
        aria-labelledby="arch-diagram-heading"
        className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2
              id="arch-diagram-heading"
              className="font-display text-base font-semibold text-slate-900"
            >
              Sensor-to-Dashboard Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compatible Sensors → ESP32 / Industrial Gateway → MQTT / HTTP → SANKET+ Intelligence Engine → Dashboard & Alerts
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-blue-700 font-medium">● Active Prototype</span>
            <span className="text-slate-500">○ Future Pilot Integration</span>
          </div>
        </div>

        {/* SVG Pipeline Illustration */}
        <div className="w-full overflow-x-auto pb-2">
          <svg
            viewBox="0 0 980 180"
            className="w-full min-w-[740px] h-auto block"
            role="img"
            aria-label="SANKET+ Sensor to Dashboard Architecture Diagram"
          >
            {/* Active Simulated Input Feeder */}
            <rect
              x="580"
              y="12"
              width="200"
              height="34"
              rx="6"
              fill="#FFFBEB"
              stroke="#D97706"
              strokeWidth="1.25"
            />
            <text
              x="680"
              y="33"
              textAnchor="middle"
              className="fill-amber-800 font-mono text-[10.5px] font-semibold"
            >
              SIMULATED DATA INPUT
            </text>
            <path
              d="M680 46 V72"
              stroke="#D97706"
              strokeWidth="1.5"
              strokeDasharray="3 3"
            />
            <polygon points="676,68 684,68 680,75" fill="#D97706" />

            {/* 5 Pipeline Nodes */}
            {[
              { x: 14, label: 'Compatible Sensors', sub: 'Vibration + Temp', pilot: true },
              { x: 204, label: 'ESP32 / Gateway', sub: 'Edge Sampling', pilot: true },
              { x: 394, label: 'MQTT / HTTP', sub: 'Telemetry Transport', pilot: true },
              { x: 584, label: 'SANKET+ Engine', sub: 'Fingerprint & Rules', pilot: false },
              { x: 774, label: 'Dashboard & Alerts', sub: 'Operator View', pilot: false },
            ].map((node, idx) => (
              <g key={node.label}>
                <rect
                  x={node.x}
                  y="76"
                  width="172"
                  height="76"
                  rx="8"
                  fill={node.pilot ? '#F8FAFC' : '#FFFFFF'}
                  stroke={node.pilot ? '#CBD5E1' : '#2563EB'}
                  strokeWidth={node.pilot ? '1.25' : '1.75'}
                  strokeDasharray={node.pilot ? '4 3' : undefined}
                />
                <text
                  x={node.x + 86}
                  y="102"
                  textAnchor="middle"
                  className="fill-slate-900 font-sans text-[12px] font-semibold"
                >
                  {node.label}
                </text>
                <text
                  x={node.x + 86}
                  y="120"
                  textAnchor="middle"
                  className="fill-slate-500 font-sans text-[10.5px]"
                >
                  {node.sub}
                </text>
                <text
                  x={node.x + 86}
                  y="140"
                  textAnchor="middle"
                  className={`font-mono text-[9.5px] font-medium ${
                    node.pilot ? 'fill-slate-500' : 'fill-blue-700'
                  }`}
                >
                  {node.pilot ? 'FUTURE PILOT' : 'PROTOTYPE ACTIVE'}
                </text>

                {idx < 4 && (
                  <g>
                    <line
                      x1={node.x + 174}
                      y1="114"
                      x2={node.x + 188}
                      y2="114"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points={`${node.x + 185},110 ${node.x + 185},118 ${
                        node.x + 191
                      },114`}
                      fill="#94A3B8"
                    />
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Stage Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-2 border-t border-slate-100">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div key={stage.step} className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      stage.isCurrent
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </div>
                  {idx < stages.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden md:block" />
                  )}
                </div>
                <div
                  className={`font-mono text-[10px] font-semibold ${
                    stage.isCurrent ? 'text-blue-700' : 'text-slate-500'
                  }`}
                >
                  {stage.tag}
                </div>
                <div className="text-xs font-semibold text-slate-900">
                  {stage.title}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {stage.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pilot Interface Readiness Specification */}
      <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-slate-700" aria-hidden="true" />
          <h2 className="font-display text-base font-semibold text-slate-900">
            Target Telemetry Contract (Pilot Readiness)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Layer</th>
                <th className="py-2.5 px-4">Target Specification</th>
                <th className="py-2.5 px-4">Current Prototype Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  Data Ingestion Source
                </td>
                <td className="py-3 px-4 text-slate-600">
                  ESP32 / Industrial Gateway publishing JSON packets over MQTT or HTTPS
                </td>
                <td className="py-3 px-4 font-mono text-amber-700 font-medium">
                  SIMULATED DATA INPUT (Browser State)
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  Sensing Modalities
                </td>
                <td className="py-3 px-4 text-slate-600">
                  RMS vibration velocity (mm/s), peak acceleration (g), housing temperature (°C)
                </td>
                <td className="py-3 px-4 font-mono text-slate-600">
                  FUTURE PILOT INTEGRATION
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  Baseline & Anomaly Logic
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Per-machine Health Fingerprint envelope with adjustable sensitivity rules
                </td>
                <td className="py-3 px-4 font-mono text-blue-700 font-medium">
                  ACTIVE IN PROTOTYPE
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
