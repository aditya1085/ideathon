import React from 'react';
import {
  ArrowRight,
  Cpu,
  Database,
  LayoutDashboard,
  Radio,
  Router,
  ShieldCheck,
} from 'lucide-react';

export const IntegrationPage: React.FC = () => {
  const futureStages = [
    {
      step: '01',
      title: 'Physical Sensors',
      subtitle: 'MEMS triaxial vibration & housing temperature probes mounted on machinery',
      tag: 'FUTURE PILOT',
      icon: Radio,
    },
    {
      step: '02',
      title: 'Controller / Gateway',
      subtitle: 'ESP32 or industrial edge controller handling sampling & buffering',
      tag: 'FUTURE PILOT',
      icon: Router,
    },
    {
      step: '03',
      title: 'Secure Data Ingestion',
      subtitle: 'Authenticated MQTT / HTTPS payload transport into SANKET+ ingestion API',
      tag: 'FUTURE PILOT',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'SANKET+',
      subtitle: 'Health Fingerprint comparison, persistence rules & explainable alerts',
      tag: 'ACTIVE IN PROTOTYPE',
      isCurrent: true,
      icon: Cpu,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-2">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-mono font-semibold text-amber-700">
            CURRENT: Simulated Sensor Data
          </span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="font-mono text-slate-500">
            FUTURE: Physical Sensors → Controller/Gateway → Secure Data Ingestion → SANKET+
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
          Integration Preview
        </h1>
        <p className="text-sm text-slate-600 max-w-3xl leading-relaxed">
          SANKET+ is currently a standalone software prototype driven entirely by simulated sensor data. Physical sensors, controllers, and external ingestion endpoints are planned for future pilot deployment and are not active in this build.
        </p>
      </div>

      {/* Current vs Future Architecture Diagram */}
      <section
        aria-labelledby="arch-diagram-heading"
        className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h2
              id="arch-diagram-heading"
              className="font-display text-base font-semibold text-slate-900"
            >
              Current Prototype vs. Future Pilot Pipeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Clear separation between active software simulation and planned hardware connectivity
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="text-amber-700 font-medium">● Current Prototype</span>
            <span className="text-slate-500">○ Future Pilot Integration</span>
          </div>
        </div>

        {/* SVG Pipeline Illustration */}
        <div className="w-full overflow-x-auto pb-2">
          <svg
            viewBox="0 0 980 210"
            className="w-full min-w-[720px] h-auto block"
            role="img"
            aria-label="SANKET+ Current Simulated Input vs Future Physical Sensor Architecture"
          >
            {/* CURRENT: Simulated Sensor Data */}
            <rect
              x="524"
              y="14"
              width="224"
              height="46"
              rx="8"
              fill="#FFFBEB"
              stroke="#D97706"
              strokeWidth="1.5"
            />
            <text
              x="636"
              y="33"
              textAnchor="middle"
              className="fill-amber-900 font-mono text-[10.5px] font-semibold"
            >
              CURRENT: Simulated Sensor Data
            </text>
            <text
              x="636"
              y="49"
              textAnchor="middle"
              className="fill-amber-700 font-sans text-[10px]"
            >
              Browser-based simulation engine
            </text>
            <path
              d="M636 60 V94"
              stroke="#D97706"
              strokeWidth="1.75"
              strokeDasharray="4 3"
            />
            <polygon points="632,90 640,90 636,98" fill="#D97706" />

            {/* FUTURE Pipeline Nodes */}
            {[
              { x: 16, label: 'Physical Sensors', sub: 'Vibration & Temp', future: true },
              { x: 204, label: 'Controller / Gateway', sub: 'ESP32 / Edge Node', future: true },
              { x: 392, label: 'Secure Data Ingestion', sub: 'MQTT / HTTPS TLS', future: true },
              { x: 580, label: 'SANKET+ Engine', sub: 'Baselines & Rules', future: false },
              { x: 768, label: 'Dashboard & Alerts', sub: 'Operator Console', future: false },
            ].map((node, idx) => (
              <g key={node.label}>
                <rect
                  x={node.x}
                  y="102"
                  width="170"
                  height="82"
                  rx="8"
                  fill={node.future ? '#F8FAFC' : '#FFFFFF'}
                  stroke={node.future ? '#CBD5E1' : '#2563EB'}
                  strokeWidth={node.future ? '1.25' : '1.75'}
                  strokeDasharray={node.future ? '5 3' : undefined}
                />
                <text
                  x={node.x + 85}
                  y="130"
                  textAnchor="middle"
                  className="fill-slate-900 font-sans text-[12px] font-semibold"
                >
                  {node.label}
                </text>
                <text
                  x={node.x + 85}
                  y="148"
                  textAnchor="middle"
                  className="fill-slate-500 font-sans text-[10.5px]"
                >
                  {node.sub}
                </text>
                <text
                  x={node.x + 85}
                  y="170"
                  textAnchor="middle"
                  className={`font-mono text-[9.5px] font-semibold ${
                    node.future ? 'fill-slate-500' : 'fill-blue-700'
                  }`}
                >
                  {node.future ? 'FUTURE PILOT ONLY' : 'ACTIVE IN PROTOTYPE'}
                </text>

                {idx < 4 && (
                  <g>
                    <line
                      x1={node.x + 172}
                      y1="143"
                      x2={node.x + 184}
                      y2="143"
                      stroke="#94A3B8"
                      strokeWidth="1.5"
                    />
                    <polygon
                      points={`${node.x + 181},139 ${node.x + 181},147 ${
                        node.x + 187
                      },143`}
                      fill="#94A3B8"
                    />
                  </g>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Stage Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
          {futureStages.map((stage, idx) => {
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
                  {idx < futureStages.length - 1 && (
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
      <section className="bg-[#F5F4F2] rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-4 h-4 text-slate-700" aria-hidden="true" />
          <h2 className="font-display text-base font-semibold text-slate-900">
            Implementation Status Summary
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                <th className="py-2.5 pr-4">Component</th>
                <th className="py-2.5 px-4">Role in SANKET+</th>
                <th className="py-2.5 px-4">Prototype Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  Simulated Sensor Engine
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Generates vibration (mm/s), temperature (°C), and fault scenarios in-browser
                </td>
                <td className="py-3 px-4 font-mono text-amber-700 font-semibold">
                  CURRENT: Implemented (Simulated)
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  Physical Sensors & Gateway
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Field accelerometers, temperature probes, and ESP32 / industrial gateway
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">
                  FUTURE: Not connected in prototype
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  Secure Data Ingestion
                </td>
                <td className="py-3 px-4 text-slate-600">
                  TLS-authenticated MQTT / HTTPS telemetry ingestion service
                </td>
                <td className="py-3 px-4 font-mono text-slate-500">
                  FUTURE: Planned for pilot stage
                </td>
              </tr>
              <tr>
                <td className="py-3 pr-4 font-medium text-slate-900">
                  <span className="inline-flex items-center gap-1.5">
                    <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                    SANKET+ Rules & Console
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-600">
                  Operator baseline workflow, persistence checks, and explainable alert history
                </td>
                <td className="py-3 px-4 font-mono text-blue-700 font-semibold">
                  CURRENT: Active in browser
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
